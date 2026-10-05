'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ARCHIVE } from '@/lib/system/archive';
import { CATEGORY_ORDER as ORDER, STATIC_ENTRIES, isExternal, navEntries, rankEntries, type Category, type Entry } from '@/lib/system/search';
import { openNavEditor } from '@/lib/system/nav-store';
import { NODES, OBJECTS, PROJECTS, SYSTEMS } from '@/lib/system/registry';
import { enableReminders } from '@/lib/reminders';
import { COLOR_THEMES, COLOR_THEME_LABEL, LIVERY_LABEL, MODE_LABEL, cycleLivery, getMode, isLowPower, setColorTheme, toggleMode } from '@/lib/theme';
import { VSCODE_THEMES } from '@/lib/vscode-themes';
import { toast } from '@/lib/toast-bus';
import { setLowPowerMode } from '../useLowPower';
import type { BuildInfo } from './Shell';
import { useColorTheme, useNav } from './hooks';

/* ════════════════════════════════════════════════════════════════════════
   ⌘K / Ctrl+K — search VESTRIPPN.

   Every entry is a real destination or a real action: pages, systems,
   projects, logs, garage objects, archive records, and the handful of
   environment actions that already existed. Keyboard first; a native
   <dialog> handles focus containment and Escape.
   ════════════════════════════════════════════════════════════════════════ */

export default function CommandPalette({ build }: { build: BuildInfo }) {
  const router = useRouter();
  const { status } = useSession();
  const nav = useNav();
  const colorTheme = useColorTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();

  const show = useCallback((event?: Event) => {
    const initial = (event as CustomEvent<{ query?: string }> | undefined)?.detail?.query;
    setQuery(typeof initial === 'string' ? initial : '');
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
      ...COLOR_THEMES.map((id) => ({
        id: `act:theme:${id}`,
        category: 'ACTION' as const,
        label: `Color Theme: ${COLOR_THEME_LABEL[id]}`,
        detail: `${id === 'vestrippn' ? 'graphite and the precise blue · liveries tint it' : VSCODE_THEMES[id].description}${id === colorTheme ? ' · current' : ''}`,
        keywords: 'preferences color colour theme vscode vs code dark modern light plus classic',
        run: () => {
          setColorTheme(id);
          toast({ id: 'theme', title: `color theme: ${COLOR_THEME_LABEL[id]}`, variant: 'success' });
        },
      })),
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
  }, [router, status, colorTheme]);

  const verbose = /^about\s+--verbose$/.test(query.trim());

  // VS Code: a leading '>' searches commands only (what Ctrl+Shift+P opens).
  const commandMode = query.startsWith('>');
  const results = useMemo(() => {
    if (verbose) return [];
    if (commandMode) return rankEntries(actions, query.slice(1));
    const q = query.trim();
    const all = [...navEntries(nav), ...STATIC_ENTRIES, ...actions];
    if (!q) return all.filter((entry) => entry.category === 'PAGE' || entry.category === 'ACTION');
    return rankEntries(all, q);
  }, [query, actions, verbose, nav, commandMode]);

  // Group in a stable category order; `flat` is the keyboard order.
  const groups = useMemo(() => {
    const byCategory = new Map<Category, Entry[]>();
    for (const entry of results) byCategory.set(entry.category, [...(byCategory.get(entry.category) ?? []), entry]);
    const ordered = query.trim() && !commandMode
      ? [...byCategory.keys()]
      : ORDER.filter((category) => byCategory.has(category));
    return ordered.map((category) => ({ category, entries: byCategory.get(category)! }));
  }, [results, query, commandMode]);
  const flat = useMemo(() => groups.flatMap((group) => group.entries), [groups]);

  const close = useCallback(() => setOpen(false), []);

  const run = useCallback(
    (entry: Entry | undefined) => {
      if (!entry) return;
      close();
      if (entry.run) void entry.run();
      else if (entry.href && isExternal(entry.href)) window.open(entry.href, '_blank', 'noopener,noreferrer');
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
          placeholder={commandMode ? 'run a command…' : 'search VESTRIPPN… (type > for commands)'}
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
        <span style={{ marginLeft: 'auto' }}>{NODES.length + OBJECTS.length + ARCHIVE.length} indexed</span>
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
