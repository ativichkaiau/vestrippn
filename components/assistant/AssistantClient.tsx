'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { addTask } from '@/app/actions';
import { HUBS, HUB_CONFIG, isHub, type IntelligenceHub } from '@/lib/assistant/hubs';
import { toast } from '@/lib/toast-bus';
import { Action, MetadataGrid, Page, PageHeader, Section, StatusIndicator } from '@/components/system/primitives';

/* ════════════════════════════════════════════════════════════════════════
   ~/runtime/assistant — one assistant, two sources of truth:

   · hub     → /api/assistant  answers with the live data of a chosen hub
   · sources → /api/das/chat   answers only from your ingested documents,
                               citing them inline as [n]

   Both modes share one request budget. ⌘K "ask …" lands here with ?q= and
   ?hub= (the page you asked from) and sends once.
   ════════════════════════════════════════════════════════════════════════ */

type Mode = 'hub' | 'sources';
type Citation = { title: string; source?: string; url?: string; snippet?: string };
type Turn = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  state: 'streaming' | 'done' | 'error';
  citations?: Citation[];
  error?: string;
};
type Usage = { used: number; limit: number; windowHours: number; resetAt: string | null; allowed: boolean };
type Status = { configured: boolean; model: string; usage: Usage | null } | null;

type StreamEvent =
  | { type: 'meta'; threadId: string; messageId: string }
  | { type: 'token'; text: string }
  | { type: 'citations'; citations: Citation[] }
  | { type: 'done'; message: { content: string; citations: Citation[] } }
  | { type: 'error'; error: string };

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export default function AssistantClient() {
  const router = useRouter();
  const params = useSearchParams();
  const initialHub = isHub(params.get('hub')) ? (params.get('hub') as IntelligenceHub) : 'dashboard';
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'sources' ? 'sources' : 'hub');
  const [hub, setHub] = useState<IntelligenceHub>(initialHub);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [sourceCount, setSourceCount] = useState<number | null>(null);
  const threadRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const sentInitial = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const config = HUB_CONFIG[hub];

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant', { cache: 'no-store' });
      if (res.ok) setStatus((await res.json()) as Status);
    } catch {
      /* status is informational; the page still works */
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    fetch('/api/das/sources', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((list: unknown[]) => setSourceCount(Array.isArray(list) ? list.length : 0))
      .catch(() => setSourceCount(0));
    return () => abortRef.current?.abort();
  }, [refreshStatus]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns]);

  const patchTurn = (id: string, patch: (turn: Turn) => Turn) => setTurns((prev) => prev.map((turn) => (turn.id === id ? patch(turn) : turn)));

  const failMessage = async (res: Response) => {
    const data = (await res.json().catch(() => null)) as { error?: string; detail?: string; usage?: Usage } | null;
    if (data?.usage) setStatus((prev) => (prev ? { ...prev, usage: data.usage! } : prev));
    if (res.status === 401) return 'Your session has ended — sign in again.';
    return data?.detail || data?.error || `Request failed (${res.status})`;
  };

  const askHub = async (question: string, history: Turn[], replyId: string, signal: AbortSignal) => {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hub,
        instruction: question,
        history: history.filter((turn) => turn.state === 'done').map((turn) => ({ role: turn.role, content: turn.content })),
      }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error(await failMessage(res));
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      patchTurn(replyId, (turn) => ({ ...turn, content: text }));
    }
    if (!text.trim()) throw new Error('The assistant returned an empty answer.');
  };

  const askSources = async (question: string, history: Turn[], replyId: string, signal: AbortSignal) => {
    const messages = [
      ...history.filter((turn) => turn.state === 'done').map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user' as const, content: question },
    ];
    const res = await fetch('/api/das/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: threadRef.current, messages }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error(await failMessage(res));
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamError: string | null = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        if (!frame.startsWith('data: ')) continue;
        const event = JSON.parse(frame.slice(6)) as StreamEvent;
        if (event.type === 'meta') threadRef.current = event.threadId;
        else if (event.type === 'token') patchTurn(replyId, (turn) => ({ ...turn, content: turn.content + event.text }));
        else if (event.type === 'citations') patchTurn(replyId, (turn) => ({ ...turn, citations: event.citations }));
        else if (event.type === 'done') patchTurn(replyId, (turn) => ({ ...turn, content: event.message.content, citations: event.message.citations }));
        else if (event.type === 'error') streamError = event.error;
      }
    }
    if (streamError) throw new Error(streamError);
  };

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || busy) return;
      const history = turns;
      const replyId = newId();
      setTurns((prev) => [
        ...prev,
        { id: newId(), role: 'user', content: question, state: 'done' },
        { id: replyId, role: 'assistant', content: '', state: 'streaming' },
      ]);
      setDraft('');
      setBusy(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        if (mode === 'hub') await askHub(question, history, replyId, controller.signal);
        else await askSources(question, history, replyId, controller.signal);
        patchTurn(replyId, (turn) => ({ ...turn, state: 'done' }));
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          patchTurn(replyId, (turn) => ({ ...turn, state: turn.content ? 'done' : 'error', error: turn.content ? undefined : 'Stopped.' }));
        } else {
          patchTurn(replyId, (turn) => ({ ...turn, state: 'error', error: error instanceof Error ? error.message : 'Request failed' }));
        }
      } finally {
        setBusy(false);
        void refreshStatus();
      }
    },
    // askHub / askSources close over mode, hub and the thread ref only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, turns, mode, hub, refreshStatus],
  );

  // ⌘K "ask …" deep link: send the question once, then drop it from the URL
  // so a reload does not ask again.
  useEffect(() => {
    const q = params.get('q');
    if (!q || sentInitial.current) return;
    sentInitial.current = true;
    router.replace(`/das?${new URLSearchParams({ hub, ...(mode === 'sources' ? { mode } : {}) }).toString()}`, { scroll: false });
    void send(q);
  }, [params, router, send, hub, mode]);

  const reset = (next?: { mode?: Mode; hub?: IntelligenceHub }) => {
    abortRef.current?.abort();
    threadRef.current = undefined;
    setTurns([]);
    if (next?.mode) setMode(next.mode);
    if (next?.hub) setHub(next.hub);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    } else if (event.key === 'Escape' && busy) {
      abortRef.current?.abort();
    }
  };

  const saveAsTask = async (turn: Turn) => {
    const title = (turn.content.split('\n').map((line) => line.replace(/^[-•]\s*/, '').trim()).find(Boolean) ?? '').slice(0, 140);
    if (!title) return;
    try {
      await addTask(title, mode === 'hub' ? hub.toUpperCase() : 'SOURCES');
      toast({ title: 'task saved', message: title, variant: 'success' });
    } catch {
      toast({ title: 'Could not save the task', message: 'Make sure you are signed in.', variant: 'warn' });
    }
  };

  const copy = async (turn: Turn) => {
    try {
      await navigator.clipboard.writeText(turn.content);
      toast({ title: 'copied', variant: 'success' });
    } catch {
      toast({ title: 'Copy failed', variant: 'warn' });
    }
  };

  const usage = status?.usage;
  const resetAt = usage?.resetAt ? new Date(usage.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const blocked = status?.configured === false || usage?.allowed === false;
  const noSources = mode === 'sources' && sourceCount === 0;

  return (
    <Page>
      <PageHeader
        label="runtime / assistant"
        title="Assistant"
        lede="Ask about any part of VESTRIPPN. Answers use the live data of the hub you choose — or only your ingested sources, with citations."
        meta={[
          { key: 'requests', value: usage ? `${usage.used} / ${usage.limit}` : '—' },
          { key: 'window', value: usage ? `${usage.windowHours} h` : '—' },
          { key: 'model', value: status?.model ?? '—' },
        ]}
        actions={<Action href="/das/ingest">ingest sources</Action>}
      />

      {status?.configured === false && (
        <p className="sys-alert sys-section" role="alert">
          The assistant is not configured on this deployment: set <code>OPENAI_API_KEY</code> in the environment.
        </p>
      )}

      <Section id="context" title="context">
        <div className="sys-filter" role="group" aria-label="Answer from">
          <button type="button" aria-pressed={mode === 'hub'} onClick={() => mode !== 'hub' && reset({ mode: 'hub' })}>
            hub data
          </button>
          <button type="button" aria-pressed={mode === 'sources'} onClick={() => mode !== 'sources' && reset({ mode: 'sources' })}>
            your sources
            <span>{sourceCount ?? '·'}</span>
          </button>
        </div>
        {mode === 'hub' ? (
          <div className="sys-filter sys-assistant-hubs" role="group" aria-label="Hub">
            {HUBS.map((id) => (
              <button key={id} type="button" aria-pressed={hub === id} onClick={() => hub !== id && reset({ hub: id })}>
                {HUB_CONFIG[id].label}
              </button>
            ))}
          </div>
        ) : (
          <p className="sys-section-intro" style={{ margin: 0 }}>
            Answers come only from documents you have ingested, with [n] citations. {noSources ? <Link href="/das/ingest">Add a source first →</Link> : null}
          </p>
        )}
      </Section>

      <section className="sys-section sys-assistant" aria-label="Conversation">
        {turns.length === 0 ? (
          <div className="sys-assistant-empty">
            <p className="sys-label">
              {mode === 'hub' ? `suggested · ${config.label}` : 'ask your sources'}
            </p>
            {mode === 'hub' ? (
              <ul className="sys-list">
                {config.suggestions.map((suggestion) => (
                  <li key={suggestion.label}>
                    <span className="sys-list-name">
                      {suggestion.label}
                      <small>{suggestion.instruction}</small>
                    </span>
                    <button type="button" className="sys-command" disabled={blocked} onClick={() => void send(suggestion.instruction)}>
                      ask
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sys-empty">e.g. “What does my HCVS summary say about Brugada syndrome?”</p>
            )}
          </div>
        ) : (
          <ol className="sys-transcript">
            {turns.map((turn) => (
              <li key={turn.id} className="sys-turn" data-role={turn.role} data-state={turn.state} aria-busy={turn.state === 'streaming'}>
                <p className="sys-label">{turn.role === 'user' ? '> you' : `assistant · ${mode === 'hub' ? config.label : 'sources'}`}</p>
                {turn.role === 'assistant' && turn.state === 'streaming' && !turn.content ? (
                  <p className="sys-turn-wait">
                    {mode === 'hub' ? `reading ${config.path}…` : 'searching your sources…'}
                  </p>
                ) : (
                  <div className="sys-turn-body">{renderAnswer(turn.content, turn.citations)}</div>
                )}
                {turn.state === 'error' && turn.error && <p className="sys-alert">{turn.error}</p>}
                {turn.citations && turn.citations.length > 0 && turn.state !== 'streaming' && (
                  <ol className="sys-citations" aria-label="Sources">
                    {turn.citations.map((citation, i) => (
                      <li key={`${citation.title}-${i}`} id={`${turn.id}-c${i + 1}`}>
                        <span className="sys-citation-n">[{i + 1}]</span>
                        <span>
                          <b>{citation.url ? <a href={citation.url} target="_blank" rel="noopener noreferrer">{citation.title}</a> : citation.title}</b>
                          {citation.source && <small> · {citation.source}</small>}
                          {citation.snippet && <span className="sys-citation-snippet">{citation.snippet}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {turn.role === 'assistant' && turn.state === 'done' && turn.content && (
                  <div className="sys-turn-actions">
                    <button type="button" className="sys-command" onClick={() => void saveAsTask(turn)}>
                      save as task
                    </button>
                    <button type="button" className="sys-command" onClick={() => void copy(turn)}>
                      copy
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={endRef} />

        <form className="sys-composer" onSubmit={onSubmit}>
          <label htmlFor={inputId} className="sys-visually-hidden">
            Ask the assistant
          </label>
          <textarea
            id={inputId}
            className="sys-input"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={mode === 'hub' ? `ask about ${config.path}…` : 'ask your sources…'}
            disabled={blocked}
          />
          <div className="sys-composer-bar">
            <span className="sys-mono sys-muted" role="status">
              {busy ? 'answering… esc to stop' : blocked && usage?.allowed === false ? `limit reached${resetAt ? ` · next at ${resetAt}` : ''}` : '↵ send · shift ↵ new line'}
            </span>
            <span className="sys-composer-actions">
              {turns.length > 0 && !busy && (
                <button type="button" className="sys-command" onClick={() => reset()}>
                  new conversation
                </button>
              )}
              {busy ? (
                <button type="button" className="sys-action" onClick={() => abortRef.current?.abort()}>
                  stop
                </button>
              ) : (
                <button type="submit" className="sys-action" data-variant="primary" disabled={!draft.trim() || blocked || noSources}>
                  ask
                </button>
              )}
            </span>
          </div>
        </form>
      </section>

      <Section id="about" title="about this answer">
        <MetadataGrid
          compact
          rows={[
            { key: 'mode', value: mode === 'hub' ? `live data · ${config.path}` : 'your ingested sources only', mono: true },
            { key: 'budget', value: usage ? <StatusIndicator state={usage.allowed ? 'active' : 'error'} label={`${usage.limit - usage.used} left${resetAt ? ` · next at ${resetAt}` : ''}`} /> : '—' },
            { key: 'caution', value: mode === 'hub' ? config.caution : 'Answers quote your documents; check the cited passage before relying on it.' },
          ]}
        />
      </Section>
    </Page>
  );
}

/* Plain-text answers: paragraphs, "-" bullets, and [n] citation markers. */
function renderAnswer(text: string, citations?: Citation[]): ReactNode {
  const marker = (part: string, key: string) => {
    const match = /^\[(\d+)\]$/.exec(part);
    const n = match ? Number(match[1]) : 0;
    if (!match || !citations?.[n - 1]) return part;
    return (
      <sup key={key} className="sys-citation-ref" title={citations[n - 1].title}>
        [{n}]
      </sup>
    );
  };
  const inline = (line: string, key: string) => line.split(/(\[\d+\])/g).map((part, i) => marker(part, `${key}-${i}`));
  return text.split(/\n{2,}/).map((block, b) => {
    const lines = block.split('\n').filter((line) => line.trim());
    const bullets = lines.length > 0 && lines.every((line) => /^\s*[-•]\s+/.test(line));
    if (bullets) {
      return (
        <ul key={b}>
          {lines.map((line, i) => (
            <li key={i}>{inline(line.replace(/^\s*[-•]\s+/, ''), `${b}-${i}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={b}>
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {/^\s*[-•]\s+/.test(line) ? <>– {inline(line.replace(/^\s*[-•]\s+/, ''), `${b}-${i}`)}</> : inline(line, `${b}-${i}`)}
          </span>
        ))}
      </p>
    );
  });
}
