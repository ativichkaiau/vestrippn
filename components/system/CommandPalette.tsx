'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ARCHIVE } from '@/lib/system/archive';
import type { ResolvedNav } from '@/lib/system/nav-layout';
import { openNavEditor } from '@/lib/system/nav-store';
import { LOGS, NODES, OBJECTS, PROJECTS, RUNTIME, SYSTEMS } from '@/lib/system/registry';
import { enableReminders } from '@/lib/reminders';
import { LIVERY_LABEL, MODE_LABEL, cycleLivery, getMode, isLowPower, toggleMode } from '@/lib/theme';
import { toast } from '@/lib/toast-bus';
import { setLowPowerMode } from '../useLowPower';
import type { BuildInfo } from './Shell';
import { useNav } from './hooks';

/* ════════════════════════════════════════════════════════════════════════
   ⌘K / Ctrl+K — search VESTRIPPN.

   Every entry is a real destination or a real action: pages, systems,
   projects, logs, garage objects, archive records, and the handful of
   environment actions that already existed. Keyboard first; a native
   <dialog> handles focus containment and Escape.
   ════════════════════════════════════════════════════════════════════════ */

type Category = 'PAGE' | 'RUNTIME' | 'SYSTEM' | 'PROJECT' | 'LOG' | 'OBJECT' | 'ARCHIVE' | 'ACTION';
const ORDER: Category[] = ['PAGE', 'SYSTEM', 'PROJECT', 'RUNTIME', 'LOG', 'OBJECT', 'ARCHIVE', 'ACTION'];

type Entry = {
  id: string;
  category: Category;
  label: string;
  detail: string;
  keywords?: string;
  href?: string;
  run?: () => void | Promise<void>;
};

/** Pages and runtime modules, named and ordered the way the operator set the tabs. */
function navEntries(nav: ResolvedNav): Entry[] {
  const runtime = new Map(RUNTIME.map((module) => [`rt:${module.slug}`, module]));
  return [
    ...nav.environment.map((item) => ({
      id: `page:${item.id}`,
      category: 'PAGE' as const,
      label: item.id === 'env:root' && item.label === 'root' ? 'Go to root' : `Open ${item.label}`,
      detail: item.external ? `${item.href} ↗` : item.href === '/' ? '~' : `~${item.href}`,
      keywords: `${item.label} ${item.defaultLabel ?? ''}${item.hidden ? ' hidden' : ''}`,
      href: item.href,
    })),
    ...nav.runtime.map((item) => {
      const mounted = runtime.get(item.id);
      return {
        id: `runtime:${item.id}`,
        category: 'RUNTIME' as const,
        label: item.label,
        detail: mounted ? mounted.path : item.external ? `${item.href} ↗` : `~${item.href}`,
        keywords: `${item.defaultLabel ?? ''} ${mounted ? `${mounted.summary} ${mounted.keywords ?? ''}` : ''}${item.hidden ? ' hidden' : ''}`,
        href: item.href,
      };
    }),
  ];
}

const STATIC_ENTRIES: Entry[] = [
  ...SYSTEMS.map((node) => ({
    id: `system:${node.slug}`,
    category: 'SYSTEM' as const,
    label: node.name,
    detail: node.summary,
    keywords: `${node.type} ${node.slug} ${node.domains.join(' ')}`,
    href: `/systems/${node.slug}`,
  })),
  ...PROJECTS.filter((node) => !node.system).map((node) => ({
    id: `project:${node.slug}`,
    category: 'PROJECT' as const,
    label: node.name,
    detail: `${node.summary}${node.language ? ` · ${node.language}` : ''}`,
    keywords: `${node.type} ${node.slug} ${node.domains.join(' ')}`,
    href: `/projects/${node.slug}`,
  })),
  ...LOGS.map((log) => ({
    id: `log:${log.slug}`,
    category: 'LOG' as const,
    label: `${log.id} · ${log.targetFile}`,
    detail: log.series,
    keywords: `${log.title} ${log.runtime} ${log.kind}`,
    href: `/logs/${log.slug}`,
  })),
  ...OBJECTS.map((object) => ({
    id: `object:${object.slug}`,
    category: 'OBJECT' as const,
    label: object.name,
    detail: `${object.id} · ${object.type}`,
    keywords: `garage 3d ${object.slug} ${object.summary}`,
    href: `/garage/${object.slug}`,
  })),
  { id: 'page:legal', category: 'PAGE', label: 'Open legal', detail: '~/legal · privacy, terms, disclaimers', keywords: 'privacy terms policy', href: '/legal' },
  { id: 'page:ingest', category: 'RUNTIME', label: 'ingest sources', detail: '~/runtime/assistant/ingest', keywords: 'upload pdf docx das assistant grounding', href: '/das/ingest' },
  { id: 'page:ielts-practice', category: 'RUNTIME', label: 'ielts practice', detail: '~/runtime/ielts/practice', keywords: 'questions reading listening graded', href: '/learn/ielts' },
  { id: 'page:paints', category: 'OBJECT', label: 'Paint library', detail: '~/garage · liveries', keywords: 'livery theme paint color mercedes williams red bull senna', href: '/garage#paints' },
  ...ARCHIVE.map((record) => ({
    id: `archive:${record.id}`,
    category: 'ARCHIVE' as const,
    label: record.code ? `${record.code}${record.year ? ` / ${record.year}` : ''} · ${record.title}` : record.title,
    detail: record.category,
    keywords: `${record.type} ${record.field ?? ''} ${record.result ?? ''}`,
    href: `/archive#${record.id}`,
  })),
];

// Subsequence fuzzy score: every query character must appear in order.
// Consecutive and word-start hits rank higher. Null when it does not match.
function score(query: string, text: string): number | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let ti = 0;
  let total = 0;
  let streak = 0;
  for (const c of q) {
    const found = t.indexOf(c, ti);
    if (found === -1) return null;
    total += 1;
    if (found === ti) {
      streak += 1;
      total += streak;
    } else streak = 0;
    if (found === 0 || /[\s_/.·-]/.test(t[found - 1])) total += 2;
    ti = found + 1;
  }
  return total;
}

export default function CommandPalette({ build }: { build: BuildInfo }) {
  const router = useRouter();
  const { status } = useSession();
  const nav = useNav();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();

  const show = useCallback(() => {
    setQuery('');
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => {
          if (!value) {
            setQuery('');
            setActive(0);
          }
          return !value;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('sys:palette', show);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('sys:palette', show);
    };
  }, [show]);

  const actions = useMemo<Entry[]>(() => {
    const list: Entry[] = [
      {
        id: 'act:appearance',
        category: 'ACTION',
        label: 'Switch appearance',
        detail: 'dark → light → auto',
        keywords: 'theme dark light mode auto sun',
        run: () => {
          const next = toggleMode();
          toast({ id: 'appearance', title: `appearance: ${MODE_LABEL[next]}`, message: next === 'auto' ? 'Follows the sun over Chiang Mai.' : undefined, variant: 'success' });
        },
      },
      {
        id: 'act:nav',
        category: 'ACTION',
        label: 'Customize tabs',
        detail: 'rename, reorder, hide or add sidebar tabs',
        keywords: 'navigation sidebar menu edit rename reorder hide add link tabs',
        run: openNavEditor,
      },
      {
        id: 'act:livery',
        category: 'ACTION',
        label: 'Next livery',
        detail: 'repaint the environment and the garage',
        keywords: 'livery theme paint skin mercedes williams red bull senna',
        run: () => {
          const next = cycleLivery();
          toast({ id: 'livery', title: `livery: ${LIVERY_LABEL[next]}`, variant: 'success' });
        },
      },
      {
        id: 'act:lowpower',
        category: 'ACTION',
        label: 'Toggle low power',
        detail: 'pause decorative motion and 3D idle',
        keywords: 'battery performance motion reduce',
        run: () => {
          const on = !isLowPower();
          setLowPowerMode(on);
          toast({ id: 'lowpower', title: on ? 'low power: on' : 'low power: off', variant: 'success' });
        },
      },
      {
        id: 'act:focus',
        category: 'ACTION',
        label: 'Start focus session',
        detail: 'academics · focus timer',
        keywords: 'focus pomodoro timer study lock',
        run: () => {
          if (window.location.pathname === '/academics') {
            window.dispatchEvent(new Event('vest:focus-open'));
          } else {
            try {
              sessionStorage.setItem('vest_focus_open', '1');
            } catch {
              /* storage unavailable: open academics anyway */
            }
            router.push('/academics');
          }
        },
      },
      {
        id: 'act:reminders',
        category: 'ACTION',
        label: 'Enable exam reminders',
        detail: 'notifications at 14 · 7 · 3 · 1 days',
        keywords: 'notifications push alerts exam',
        run: async () => {
          const result = await enableReminders();
          if (result === 'granted') toast({ title: 'exam reminders: on', variant: 'success' });
          else if (result === 'denied') toast({ title: 'Notifications are blocked', message: 'Allow them in your browser settings.', variant: 'warn' });
          else if (result === 'unsupported') toast({ title: 'Not supported', message: "This browser can't show notifications.", variant: 'warn' });
        },
      },
    ];
    if (status === 'authenticated') {
      list.push({ id: 'act:signout', category: 'ACTION', label: 'Sign out', detail: 'end session', keywords: 'logout session', run: () => signOut({ callbackUrl: '/auth/signin' }) });
    }
    return list;
  }, [router, status]);

  const verbose = /^about\s+--verbose$/.test(query.trim());

  const results = useMemo(() => {
    const all = [...navEntries(nav), ...STATIC_ENTRIES, ...actions];
    const q = query.trim();
    if (verbose) return [];
    if (!q) return all.filter((entry) => entry.category === 'PAGE' || entry.category === 'ACTION');
    return all
      .map((entry) => {
        const ql = q.toLowerCase();
        const label = entry.label.toLowerCase();
        const full = `${entry.label} ${entry.detail} ${entry.category} ${entry.keywords ?? ''}`.toLowerCase();
        // Exact substrings rank first; a scattered subsequence must earn it
        // with consecutive or word-start hits, or it is noise.
        if (label.includes(ql)) return { entry, best: 200 - label.indexOf(ql) };
        if (full.includes(ql)) return { entry, best: 100 };
        const fuzzy = score(q, entry.label) ?? score(q, full);
        return { entry, best: fuzzy !== null && fuzzy >= q.length * 2.5 ? fuzzy : null };
      })
      .filter((item): item is { entry: Entry; best: number } => item.best !== null)
      .sort((a, b) => b.best - a.best)
      .slice(0, 40)
      .map((item) => item.entry);
  }, [query, actions, verbose, nav]);

  // Group in a stable category order; `flat` is the keyboard order.
  const groups = useMemo(() => {
    const byCategory = new Map<Category, Entry[]>();
    for (const entry of results) byCategory.set(entry.category, [...(byCategory.get(entry.category) ?? []), entry]);
    const ordered = query.trim()
      ? [...byCategory.keys()]
      : ORDER.filter((category) => byCategory.has(category));
    return ordered.map((category) => ({ category, entries: byCategory.get(category)! }));
  }, [results, query]);
  const flat = useMemo(() => groups.flatMap((group) => group.entries), [groups]);

  const close = useCallback(() => setOpen(false), []);

  const run = useCallback(
    (entry: Entry | undefined) => {
      if (!entry) return;
      close();
      if (entry.run) void entry.run();
      else if (entry.href && /^https?:\/\//i.test(entry.href)) window.open(entry.href, '_blank', 'noopener,noreferrer');
      else if (entry.href) router.push(entry.href);
    },
    [close, router],
  );

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(flat.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(Math.max(flat.length - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(flat[active]);
    } else if (event.key === 'Escape') {
      // Native <dialog> cancel covers most browsers; this keeps it explicit.
      event.preventDefault();
      close();
    }
  };

  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <dialog
      ref={dialogRef}
      className="sys-palette"
      aria-label="Search VESTRIPPN"
      onClose={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="sys-palette-input">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="search VESTRIPPN…"
          aria-label="Search VESTRIPPN"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flat.length ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd>esc</kbd>
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="sys-palette-results">
        {verbose && <AboutVerbose build={build} />}
        {!verbose && flat.length === 0 && <p className="sys-palette-empty">no match for “{query.trim()}” in VESTRIPPN</p>}
        {groups.map((group) => (
          <div key={group.category} role="group" aria-labelledby={`${listId}-${group.category}`} className="sys-palette-group">
            <div id={`${listId}-${group.category}`} className="sys-label">
              {group.category}
            </div>
            {group.entries.map((entry) => {
              const index = flat.indexOf(entry);
              return (
                <div
                  key={entry.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  className="sys-palette-option"
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(entry)}
                >
                  <b>{entry.label}</b>
                  <small>{entry.detail}</small>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sys-palette-foot" aria-hidden="true">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd>navigate
        </span>
        <span>
          <kbd>↵</kbd>open
        </span>
        <span>
          <kbd>esc</kbd>close
        </span>
        <span style={{ marginLeft: 'auto' }}>{NODES.length + LOGS.length + OBJECTS.length + ARCHIVE.length} indexed</span>
      </div>
    </dialog>
  );
}

function AboutVerbose({ build }: { build: BuildInfo }) {
  return (
    <div className="sys-palette-verbose">
      <p className="sys-label" style={{ marginBottom: 8 }}>
        about --verbose
      </p>
      <dl className="sys-meta" data-compact data-bare>
        <div>
          <dt>namespace</dt>
          <dd data-mono>VESTRIPPN</dd>
        </div>
        <div>
          <dt>environment</dt>
          <dd data-mono>personal · {build.env}</dd>
        </div>
        <div>
          <dt>build</dt>
          <dd data-mono>{build.sha?.slice(0, 7) ?? 'local'}</dd>
        </div>
        <div>
          <dt>appearance</dt>
          <dd data-mono>{MODE_LABEL[getMode()]}</dd>
        </div>
        <div>
          <dt>indexed</dt>
          <dd data-mono>
            {[
              [SYSTEMS.length, 'system'],
              [PROJECTS.length, 'project'],
              [LOGS.length, 'log'],
              [OBJECTS.length, 'object'],
              [ARCHIVE.length, 'record'],
            ]
              .map(([n, noun]) => `${n} ${noun}${n === 1 ? '' : 's'}`)
              .join(' · ')}
          </dd>
        </div>
        <div>
          <dt>stack</dt>
          <dd data-mono>Next.js · React · Prisma · Auth.js · three.js</dd>
        </div>
      </dl>
    </div>
  );
}
