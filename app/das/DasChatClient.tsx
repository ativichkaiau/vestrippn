'use client';

import { Fragment, useState } from 'react';
import ChatPane, { type ChatMessage } from '@/components/w09/ChatPane';
import CitationPopover, { type Citation } from '@/components/w09/CitationPopover';

type Msg = { id: string; role: 'user' | 'assistant'; content: string; citations?: Citation[] };

type StreamEvent =
  | { type: 'meta'; threadId: string; messageId: string }
  | { type: 'token'; text: string }
  | { type: 'citations'; citations: Citation[] }
  | { type: 'done'; message: { id: string; role: 'assistant'; content: string; citations: Citation[] } }
  | { type: 'error'; error: string };

// Turn "...weight-based [1] with [2]" into text + inline CitationPopover markers.
function renderContent(m: Msg) {
  if (m.role !== 'assistant' || !m.citations?.length) return m.content;
  const cites = m.citations;
  return m.content.split(/(\[\d+\])/g).map((part, i) => {
    const match = /^\[(\d+)\]$/.exec(part);
    if (match) {
      const n = Number(match[1]);
      const c = cites[n - 1];
      if (c) return <CitationPopover key={i} label={n} citation={c} />;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function DasChatClient() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSend = async (text: string) => {
    setError(null);
    const payload = [...msgs.map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: text }];
    setMsgs((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setIsStreaming(true);

    let assistantId: string | null = null;
    const upsertAssistant = (mut: (m: Msg) => Msg) => {
      setMsgs((prev) => {
        const id = assistantId!;
        if (!prev.some((m) => m.id === id)) return [...prev, mut({ id, role: 'assistant', content: '' })];
        return prev.map((m) => (m.id === id ? mut(m) : m));
      });
    };

    try {
      const res = await fetch('/api/das/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, messages: payload }),
      });
      if (!res.ok || !res.body) {
        const e = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(e?.error || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamErr: string | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 2);
          if (!frame.startsWith('data: ')) continue;
          const evt = JSON.parse(frame.slice(6)) as StreamEvent;
          if (evt.type === 'meta') {
            assistantId = evt.messageId;
            setThreadId(evt.threadId);
          } else if (evt.type === 'token' && assistantId) {
            setIsStreaming(false);
            upsertAssistant((m) => ({ ...m, content: m.content + evt.text }));
          } else if (evt.type === 'done' && assistantId) {
            upsertAssistant((m) => ({ ...m, content: evt.message.content, citations: evt.message.citations }));
          } else if (evt.type === 'error') {
            streamErr = evt.error;
          }
        }
      }
      if (streamErr) setError(streamErr);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat failed');
    } finally {
      setIsStreaming(false);
    }
  };

  const view: ChatMessage[] = msgs.map((m) => ({ id: m.id, role: m.role, content: renderContent(m) }));

  return (
    <main className="flex h-screen flex-col bg-[var(--w09-bg)] text-[color:var(--w09-text)]">
      <header className="border-b border-[color:var(--w09-border)] px-5 py-4">
        <h1 className="text-lg font-bold [font-family:var(--w09-font-display)]">DAS · Chat</h1>
        <p className="text-sm text-[color:var(--w09-text-muted)]">
          Ask questions grounded in your ingested sources.
        </p>
      </header>

      {error && (
        <div className="mx-auto mt-3 w-full max-w-3xl px-4">
          <div className="rounded-[var(--w09-radius)] border border-[color:var(--w09-danger)] bg-[var(--w09-surface)] px-4 py-2 text-sm text-[color:var(--w09-danger)]">
            {error}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl flex-1 min-h-0 p-4">
        <ChatPane messages={view} isStreaming={isStreaming} onSend={onSend} placeholder="Ask DAS…" />
      </div>
    </main>
  );
}
