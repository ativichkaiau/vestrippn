'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { LIVERY_CATALOG, LIVERY_TEAMS, LIVERIES, type Livery } from '@/lib/liveries';
import { isCurrent } from '@/lib/system/navigation';
import type { ResolvedNavItem } from '@/lib/system/nav-layout';
import { openNavEditor } from '@/lib/system/nav-store';
import { PROJECTS, SYSTEMS } from '@/lib/system/registry';
import { CATEGORY_ORDER, STATIC_ENTRIES, isExternal, navEntries, rankEntries, type Category, type Entry } from '@/lib/system/search';
import { toggleFolder, type View } from '@/lib/system/workbench';
import { COLOR_THEMES, COLOR_THEME_LABEL, MODE_LABEL, getLivery, setColorTheme, setTheme, toggleMode, type Mode } from '@/lib/theme';
import { VSCODE_THEMES } from '@/lib/vscode-themes';
import Icon, { type IconName } from './Icon';
import { useColorTheme, useLivery, useMode, useNav, useSyncStatus, useWorkbench } from './hooks';
import { FOCUS_SEARCH_EVENT } from './shell-events';
import { setWatermark, useWatermark } from '../useWatermark';
import OutlineView from './OutlineView';
import StudyView from './StudyView';

/* ════════════════════════════════════════════════════════════════════════
   Side bar views (VS Code's primary side bar): Explorer, Search,
   Appearance and Account. The phone drawer reuses the Explorer tree and
   the session details.
   ════════════════════════════════════════════════════════════════════════ */

const VIEW_TITLE: Record<View, string> = { explorer: 'explorer', search: 'search', outline: 'outline', study: 'study', appearance: 'appearance', account: 'account' };

export default function SideBar({ pathname }: { pathname: string }) {
  const { view } = useWorkbench();
  return (
    <aside className="sys-sidebar" aria-label={`${VIEW_TITLE[view]} view`}>
      <div className="sys-view-head">
        <h2 className="sys-label">{VIEW_TITLE[view]}</h2>
        {view === 'explorer' && (
          <button type="button" className="sys-view-action" onClick={openNavEditor} aria-label="Customize tabs" title="Customize tabs">
            <Icon name="edit" />
          </button>
        )}
      </div>
      <div className="sys-view-body">
        {view === 'explorer' && <ExplorerTree pathname={pathname} />}
        {view === 'search' && <SearchView />}
        {view === 'outline' && <OutlineView pathname={pathname} />}
        {view === 'study' && <StudyView />}
        {view === 'appearance' && <AppearanceView />}
        {view === 'account' && <AccountView />}
      </div>
    </aside>
  );
}

/* ── Explorer ───────────────────────────────────────────────────────────── */

function Folder({ id, title, count, children }: { id: string; title: string; count?: number; children: ReactNode }) {
  const { collapsed } = useWorkbench();
  const open = !collapsed.includes(id);
  const bodyId = useId();
  return (
    <section className="sys-folder" data-open={open || undefined}>
      <button type="button" className="sys-folder-head" aria-expanded={open} aria-controls={bodyId} onClick={() => toggleFolder(id)}>
        <Icon name="chevron" size={14} className="sys-folder-chevron" />
        <span>{title}</span>
        {count !== undefined && <span className="sys-folder-count">{count}</span>}
      </button>
      <div id={bodyId} hidden={!open}>
        {children}
      </div>
    </section>
  );
}

function TreeItem({ href, label, icon, current, external, index }: { href: string; label: string; icon: IconName; current?: boolean; external?: boolean; index?: string }) {
  const content = (
    <>
      <Icon name={external ? 'link' : icon} className="sys-tree-icon" />
      <span className="sys-nav-text">{label}</span>
      {index && (
        <span className="sys-tree-index" aria-hidden="true">
          {index}
        </span>
      )}
    </>
  );
  return (
    <li>
      {external ? (
        <a href={href} className="sys-tree-item" target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
          {content}
        </a>
      ) : (
        <Link href={href} className="sys-tree-item" aria-current={current ? 'page' : undefined}>
          {content}
        </Link>
      )}
    </li>
  );
}

function NavItems({ items, pathname, icon, indexed }: { items: ResolvedNavItem[]; pathname: string; icon: IconName; indexed?: boolean }) {
  return (
    <ul className="sys-tree">
      {items
        .filter((item) => !item.hidden)
        .map((item) => (
          <TreeItem
            key={item.id}
            href={item.href}
            label={item.label}
            icon={icon}
            external={item.external}
            current={!item.external && isCurrent(item, pathname)}
            index={indexed ? item.index : undefined}
          />
        ))}
    </ul>
  );
}

export function ExplorerTree({ pathname, withRegistry = true }: { pathname: string; withRegistry?: boolean }) {
  const nav = useNav();
  return (
    <nav aria-label="VESTRIPPN" className="sys-explorer">
      <Folder id="environment" title="environment" count={nav.environment.filter((item) => !item.hidden).length}>
        <NavItems items={nav.environment} pathname={pathname} icon="page" indexed />
      </Folder>
      <Folder id="runtime" title="runtime" count={nav.runtime.filter((item) => !item.hidden).length}>
        <NavItems items={nav.runtime} pathname={pathname} icon="runtime" />
      </Folder>
      {withRegistry && (
        <>
          <Folder id="systems" title="systems" count={SYSTEMS.length}>
            <ul className="sys-tree">
              {SYSTEMS.map((node) => (
                <TreeItem key={node.slug} href={`/systems/${node.slug}`} label={node.slug} icon="system" current={pathname === `/systems/${node.slug}`} />
              ))}
            </ul>
          </Folder>
          <Folder id="projects" title="projects" count={PROJECTS.length}>
            <ul className="sys-tree">
              {PROJECTS.map((node) => (
                <TreeItem key={node.slug} href={`/projects/${node.slug}`} label={node.slug} icon="project" current={pathname === `/projects/${node.slug}`} />
              ))}
            </ul>
          </Folder>
        </>
      )}
      <button type="button" className="sys-nav-customize" onClick={openNavEditor} aria-haspopup="dialog">
        <Icon name="edit" size={14} /> customize tabs
      </button>
    </nav>
  );
}

/* ── Search ─────────────────────────────────────────────────────────────── */

const CATEGORY_ICON: Record<Category, IconName> = {
  RECENT: 'history',
  PAGE: 'page',
  RUNTIME: 'runtime',
  SYSTEM: 'system',
  PROJECT: 'project',
  DRUG: 'pill',
  OBJECT: 'object',
  ARCHIVE: 'archive',
  ACTION: 'gear',
};

function SearchView() {
  const nav = useNav();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    inputRef.current?.focus();
    const focus = () => inputRef.current?.focus();
    window.addEventListener(FOCUS_SEARCH_EVENT, focus);
    return () => window.removeEventListener(FOCUS_SEARCH_EVENT, focus);
  }, []);

  const groups = useMemo(() => {
    if (!query.trim()) return [];
    const results = rankEntries([...navEntries(nav), ...STATIC_ENTRIES], query, 80);
    const byCategory = new Map<Category, Entry[]>();
    for (const entry of results) byCategory.set(entry.category, [...(byCategory.get(entry.category) ?? []), entry]);
    return CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => ({ category, entries: byCategory.get(category)! }));
  }, [query, nav]);
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <div className="sys-search-view">
      <label htmlFor={inputId} className="sys-visually-hidden">
        Search VESTRIPPN
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className="sys-input sys-search-input"
        type="search"
        value={query}
        placeholder="Search"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="sys-search-summary" aria-live="polite">
        {query.trim() ? `${total} result${total === 1 ? '' : 's'}` : 'Pages, systems, projects, logs, objects and archive records.'}
      </p>
      {groups.map((group) => (
        <Folder key={group.category} id={`search-${group.category}`} title={group.category.toLowerCase()} count={group.entries.length}>
          <ul className="sys-tree">
            {group.entries.map((entry) =>
              entry.href ? (
                <li key={entry.id}>
                  {isExternal(entry.href) ? (
                    <a className="sys-tree-item sys-search-hit" href={entry.href} target="_blank" rel="noopener noreferrer">
                      <Icon name="link" className="sys-tree-icon" />
                      <span className="sys-nav-text">{entry.label}</span>
                      <small>{entry.detail}</small>
                    </a>
                  ) : (
                    <Link className="sys-tree-item sys-search-hit" href={entry.href}>
                      <Icon name={CATEGORY_ICON[entry.category]} className="sys-tree-icon" />
                      <span className="sys-nav-text">{entry.label}</span>
                      <small>{entry.detail}</small>
                    </Link>
                  )}
                </li>
              ) : null,
            )}
          </ul>
        </Folder>
      ))}
    </div>
  );
}

/* ── Appearance ─────────────────────────────────────────────────────────── */

const MODES: { value: Mode; label: string }[] = [
  { value: 'night', label: 'dark' },
  { value: 'day', label: 'light' },
  { value: 'auto', label: 'auto · follows the sun' },
];

function AppearanceView() {
  const colorTheme = useColorTheme();
  const mode = useMode();
  const livery = useLivery();
  const watermark = useWatermark();
  const name = useId();
  return (
    <div className="sys-appearance">
      <fieldset className="sys-choice-group">
        <legend className="sys-label">colour theme</legend>
        {COLOR_THEMES.map((id) => (
          <label key={id} className="sys-choice">
            <input type="radio" name={`${name}-theme`} checked={colorTheme === id} onChange={() => setColorTheme(id)} />
            <span>
              <b>{COLOR_THEME_LABEL[id]}</b>
              <small>{id === 'vestrippn' ? 'graphite and the precise blue; liveries tint it' : VSCODE_THEMES[id].description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className="sys-choice-group">
        <legend className="sys-label">appearance</legend>
        {MODES.map((entry) => (
          <label key={entry.value} className="sys-choice">
            <input
              type="radio"
              name={`${name}-mode`}
              checked={entry.value === 'night' ? mode === 'night' || mode === 'twilight' : mode === entry.value}
              onChange={() => setTheme(getLivery(), entry.value)}
            />
            <span>
              <b>{entry.label}</b>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className="sys-choice-group">
        <legend className="sys-label">background</legend>
        <label className="sys-choice">
          <input type="checkbox" checked={watermark} onChange={(event) => setWatermark(event.target.checked)} />
          <span>
            <b>dexmedetomidine watermark</b>
            <small>the faint structure behind every page</small>
          </span>
        </label>
      </fieldset>
      <fieldset className="sys-choice-group">
        <legend className="sys-label">livery</legend>
        <p className="sys-choice-note">{colorTheme === 'vestrippn' ? 'Repaints the environment and the garage.' : 'With a VS Code theme, the livery adds its stripe and the garage paint.'}</p>
        {LIVERY_TEAMS.map((team) => (
          <div key={team.id} className="sys-livery-team">
            <p className="sys-label">{team.name}</p>
            {LIVERIES.filter((id) => LIVERY_CATALOG[id].team === team.id).map((id: Livery) => (
              <label key={id} className="sys-choice sys-choice-livery">
                <input type="radio" name={`${name}-livery`} checked={livery.id === id} onChange={() => setTheme(id)} />
                <span className="sys-swatch" style={{ background: LIVERY_CATALOG[id].stripe }} aria-hidden="true" />
                <span>
                  <b>{LIVERY_CATALOG[id].name}</b>
                  <small>
                    {LIVERY_CATALOG[id].year} · {LIVERY_CATALOG[id].chassis}
                  </small>
                </span>
              </label>
            ))}
          </div>
        ))}
      </fieldset>
    </div>
  );
}

/* ── Account ────────────────────────────────────────────────────────────── */

function AccountView() {
  const sync = useSyncStatus();
  return (
    <div className="sys-account">
      <SessionBlock />
      <div className="sys-sync-card">
        <p className="sys-label">device sync</p>
        <p>
          <span className="sys-status" data-state={sync.state === 'synced' ? 'active' : sync.state === 'error' ? 'error' : sync.state === 'syncing' ? 'experimental' : 'planned'}>
            {sync.state}
          </span>
        </p>
        <p className="sys-muted">{sync.message}</p>
        {sync.lastSync && <p className="sys-muted">last sync {new Date(sync.lastSync).toLocaleString()}</p>}
      </div>
    </div>
  );
}

export function SessionBlock() {
  const { data, status } = useSession();
  const mode = useMode();
  const livery = useLivery();
  const colorTheme = useColorTheme();
  const user = data?.user?.name || data?.user?.email?.split('@')[0];
  return (
    <div className="sys-session">
      <div className="sys-session-row">
        <span className="sys-label">session</span>
        <span>{status === 'loading' ? 'resolving…' : status === 'authenticated' ? user || 'active' : 'none'}</span>
      </div>
      <div className="sys-session-row">
        <span className="sys-label">livery</span>
        <Link href="/garage#paints" title="Open the paint library">
          <span className="sys-swatch" style={{ background: livery.definition.stripe }} aria-hidden="true" /> {livery.definition.name}
        </Link>
      </div>
      <div className="sys-session-row">
        <span className="sys-label">theme</span>
        <span>{COLOR_THEME_LABEL[colorTheme]}</span>
      </div>
      <div className="sys-session-row">
        <span className="sys-label">appearance</span>
        <button type="button" onClick={toggleMode}>
          {MODE_LABEL[mode]}
        </button>
      </div>
      {status === 'authenticated' ? (
        <button type="button" onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
          sign out →
        </button>
      ) : status === 'unauthenticated' ? (
        <Link href="/auth/signin">sign in →</Link>
      ) : null}
      <Link href="/legal">legal</Link>
    </div>
  );
}
