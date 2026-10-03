'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { LIVERIES } from '@/lib/liveries';
import { describeTab } from '@/lib/system/editor-tabs';
import { resolvePath } from '@/lib/system/navigation';
import { clearOutput, logOutput } from '@/lib/system/output-log';
import { run, type TerminalEffect } from '@/lib/system/terminal';
import { PANEL_TABS, togglePanel, updateWorkbench, type PanelTab } from '@/lib/system/workbench';
import { MODE_LABEL, cycleLivery, getLivery, setColorTheme, setTheme, type Livery } from '@/lib/theme';
import Icon from './Icon';
import { useColorTheme, useEditorTabs, useLivery, useMode, useNav, useOutput, useWorkbench } from './hooks';
import { openPalette } from './shell-events';

/* ════════════════════════════════════════════════════════════════════════
   The panel (Ctrl+`): OUTPUT, the environment's own log for this session,
   and TERMINAL, a small shell over the VESTRIPPN tree (lib/system/terminal).
   ════════════════════════════════════════════════════════════════════════ */

const TAB_LABEL: Record<PanelTab, string> = { output: 'output', terminal: 'terminal' };
const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function Panel({ pathname }: { pathname: string }) {
  const { panelTab } = useWorkbench();
  const tabsId = useId();
  return (
    <section className="sys-panel" aria-label="Panel">
      <div className="sys-panel-head">
        <div role="tablist" aria-label="Panel views" className="sys-panel-tabs">
          {PANEL_TABS.map((tab) => (
            <button
              key={tab}
              id={`${tabsId}-${tab}`}
              type="button"
              role="tab"
              aria-selected={panelTab === tab}
              aria-controls={`${tabsId}-${tab}-panel`}
              tabIndex={panelTab === tab ? 0 : -1}
              onClick={() => updateWorkbench({ panelTab: tab })}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                const next = PANEL_TABS[(PANEL_TABS.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : PANEL_TABS.length - 1)) % PANEL_TABS.length];
                updateWorkbench({ panelTab: next });
                document.getElementById(`${tabsId}-${next}`)?.focus();
              }}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
        <div className="sys-panel-actions">
          {panelTab === 'output' && (
            <button type="button" className="sys-view-action" aria-label="Clear output" title="Clear output" onClick={clearOutput}>
              <Icon name="close" />
            </button>
          )}
          <button type="button" className="sys-view-action" aria-label="Close panel" title="Close panel (Ctrl+`)" onClick={() => togglePanel()}>
            <Icon name="panel" />
          </button>
        </div>
      </div>
      <div id={`${tabsId}-${panelTab}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${panelTab}`} className="sys-panel-body">
        {panelTab === 'output' ? <Output /> : <Terminal pathname={pathname} />}
      </div>
    </section>
  );
}

function Output() {
  const lines = useOutput();
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines.length]);
  if (!lines.length) return <p className="sys-panel-empty">Nothing logged yet this session.</p>;
  return (
    <div className="sys-output" role="log" aria-live="off">
      {lines.map((line) => (
        <div key={line.id} className="sys-output-line" data-channel={line.channel}>
          <time>{time(line.at)}</time>
          <span className="sys-output-channel">[{line.channel}]</span>
          <span>{line.text}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

type Line = { id: number; kind: 'in' | 'out' | 'err'; text: string };

function Terminal({ pathname }: { pathname: string }) {
  const router = useRouter();
  const { data } = useSession();
  const nav = useNav();
  const tabs = useEditorTabs();
  const colorTheme = useColorTheme();
  const livery = useLivery();
  const mode = useMode();
  const [lines, setLines] = useState<Line[]>([{ id: 0, kind: 'out', text: "VESTRIPPN terminal. Type 'help' for commands." }]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const seq = useRef(1);
  const inputId = useId();
  const prompt = `${resolvePath(pathname).display} $`;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines.length]);

  const perform = (effect: TerminalEffect) => {
    switch (effect.type) {
      case 'clear':
        setLines([]);
        break;
      case 'navigate':
        router.push(effect.href);
        break;
      case 'external':
        window.open(effect.href, '_blank', 'noopener,noreferrer');
        break;
      case 'palette':
        openPalette(effect.query);
        break;
      case 'theme':
        setColorTheme(effect.value);
        break;
      case 'appearance':
        setTheme(getLivery(), effect.value === 'dark' ? 'night' : effect.value === 'light' ? 'day' : 'auto');
        break;
      case 'livery':
        if (effect.value === 'next') cycleLivery();
        else setTheme(effect.value as Livery);
        break;
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const line = input;
    const result = run(line, {
      pathname,
      nav,
      user: data?.user?.email ?? data?.user?.name ?? null,
      colorTheme,
      livery: livery.id,
      liveries: LIVERIES,
      appearance: MODE_LABEL[mode],
      tabs: tabs.map((tab) => `${describeTab(tab.path, nav).label.padEnd(16)} ${tab.href}${tab.pinned ? '  (pinned)' : ''}`),
      history,
      now: new Date(),
    });
    const id = () => seq.current++;
    const added: Line[] = [
      { id: id(), kind: 'in', text: `${prompt} ${line}` },
      ...result.output.map((text): Line => ({ id: id(), kind: result.error ? 'err' : 'out', text })),
    ];
    setLines((current) => [...current, ...added].slice(-400));
    if (line.trim()) {
      setHistory((current) => [...current.filter((entry) => entry !== line.trim()), line.trim()].slice(-50));
      logOutput('terminal', line.trim());
    }
    setInput('');
    setCursor(null);
    if (result.effect) perform(result.effect);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!history.length) return;
      event.preventDefault();
      const next = event.key === 'ArrowUp' ? Math.max(0, (cursor ?? history.length) - 1) : cursor === null ? null : cursor + 1;
      if (next === null || next >= history.length) {
        setCursor(null);
        setInput('');
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="sys-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="sys-terminal-lines" role="log" aria-live="polite">
        {lines.map((line) => (
          <pre key={line.id} data-kind={line.kind}>
            {line.text}
          </pre>
        ))}
        <div ref={endRef} />
      </div>
      <form className="sys-terminal-input" onSubmit={submit}>
        <label htmlFor={inputId}>{prompt}</label>
        <input
          ref={inputRef}
          id={inputId}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </form>
    </div>
  );
}
