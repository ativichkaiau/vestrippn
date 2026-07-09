'use client';

/* ════════════════════════════════════════════════════════════════════════
   COMMAND PALETTE — ⌘K / Ctrl-K jump-to-anything for the cockpit.
   Generalizes the old secret keyboard sequence into a discoverable, fuzzy
   command bar over every hub, key surface, and the Williams apps. Mounted
   once globally in the root layout.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { HUBS } from './HubNav';

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: string;
  keywords?: string;
  href?: string; // internal route (router.push)
  url?: string; // external (new tab)
};

const COMMANDS: Command[] = [
  ...HUBS.map((h) => ({ id: `hub:${h.name}`, label: h.name, hint: 'Hub', icon: h.icon, href: h.href })),
  { id: 'cases', label: 'Clinical Cases', hint: 'Academics · interactive', icon: '🩺', href: '/learn/cases', keywords: 'case study branching' },
  { id: 'focus', label: 'Focus Mode', hint: 'Academics · qualifying study lock', icon: '🏁', href: '/academics', keywords: 'qualifying pomodoro timer lap' },
  { id: 'milestones', label: 'Exam Milestones', hint: 'Academics · countdowns', icon: '⏱', href: '/academics#milestones', keywords: 'exam countdown hcvs hgb hrs' },
  { id: 'literature', label: 'Literature Search', hint: 'Research', icon: '🔎', href: '/research#literature-search', keywords: 'pubmed papers srma' },
  { id: 'summaries', label: 'University Summaries', hint: 'Archive', icon: '📚', href: '/archive#uni-summaries', keywords: 'notes modules years' },
  { id: 'williamslab', label: 'WilliamsLab', hint: 'Research engine ↗', icon: '🔬', url: 'https://williamslab.vercel.app', keywords: 'knowledge graph brugada' },
  { id: 'williamspod', label: 'WilliamsPod', hint: 'Mock exam pod ↗', icon: '📝', url: 'https://williamspod.vercel.app', keywords: 'mock exam timed' },
  { id: 'williamshub', label: 'WilliamsHub', hint: 'Command hub ↗', icon: '🏁', url: 'https://williamshub.vercel.app', keywords: 'operations' },
];

// Lightweight subsequence fuzzy score: every query char must appear in order.
// Consecutive + word-start hits rank higher. Returns null on no match.
function score(query: string, text: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let ti = 0;
  let s = 0;
  let streak = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const c = q[qi];
    let found = -1;
    for (let k = ti; k < t.length; k++) {
      if (t[k] === c) { found = k; break; }
    }
    if (found === -1) return null;
    s += 1;
    if (found === ti) { streak += 1; s += streak; } else streak = 0;
    if (found === 0 || t[found - 1] === ' ') s += 2; // word-start bonus
    ti = found + 1;
  }
  return s;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    return COMMANDS
      .map((c) => ({ c, s: score(query.trim(), `${c.label} ${c.hint} ${c.keywords ?? ''}`) }))
      .filter((r): r is { c: Command; s: number } => r.s !== null)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.c);
  }, [query]);

  const close = useCallback(() => setOpen(false), []);

  const runCommand = useCallback(
    (cmd: Command | undefined) => {
      if (!cmd) return;
      close();
      if (cmd.url) window.open(cmd.url, '_blank', 'noopener,noreferrer');
      else if (cmd.href) router.push(cmd.href);
    },
    [close, router],
  );

  // Global open shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Reset + focus on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Keep the active index in range + scrolled into view
  useEffect(() => {
    if (active >= results.length) setActive(results.length ? results.length - 1 : 0);
  }, [results, active]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); runCommand(results[active]); }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-[14vh]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-black/10 bg-white/95 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0e1216]/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3.5 dark:border-white/10">
          <span className="text-[15px]" aria-hidden>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onListKey}
            placeholder="Jump to a hub, tool, or app…"
            className="w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
          />
          <kbd className="hidden rounded-md border border-black/10 px-1.5 py-0.5 text-[10px] font-bold text-neutral-400 dark:border-white/15 sm:block">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto custom-scrollbar p-2">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] font-medium text-neutral-400">No matches</div>
          ) : (
            results.map((cmd, i) => {
              const on = i === active;
              return (
                <button
                  key={cmd.id}
                  data-idx={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => runCommand(cmd)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                  style={on ? { backgroundColor: 'rgba(var(--hub-accent-rgb), 0.14)' } : undefined}
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[15px]"
                    style={{ backgroundColor: on ? 'rgba(var(--hub-accent-rgb), 0.18)' : 'rgba(127,127,127,0.1)' }}
                  >
                    {cmd.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-neutral-900 dark:text-white">{cmd.label}</span>
                    <span className="block truncate text-[11px] font-medium text-neutral-400 dark:text-neutral-500">{cmd.hint}</span>
                  </span>
                  {on && <span className="text-[11px] font-black" style={{ color: 'var(--hub-accent)' }}>↵</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
