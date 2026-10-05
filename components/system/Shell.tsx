'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { SYNC_STATUS_EVENT, type SyncStatus } from '@/lib/device-sync';
import { openTab } from '@/lib/system/editor-tabs';
import { readTabs, saveTabs } from '@/lib/system/editor-tabs-store';
import { resolvePath } from '@/lib/system/navigation';
import { logOutput } from '@/lib/system/output-log';
import { PROJECTS, SYSTEMS } from '@/lib/system/registry';
import { togglePanel } from '@/lib/system/workbench';
import { COLOR_THEME_LABEL, MODE_LABEL, toggleMode, themeSnapshot } from '@/lib/theme';
import { onToast } from '@/lib/toast-bus';
import ActivityBar from './ActivityBar';
import EditorTabs from './EditorTabs';
import Icon from './Icon';
import MoleculeBackdrop from './MoleculeBackdrop';
import NavEditor from './NavEditor';
import Panel from './Panel';
import Shortcuts from './Shortcuts';
import SideBar, { ExplorerTree, SessionBlock } from './SideViews';
import { useClock, useColorTheme, useLivery, useMode, useModifierLabel, useOnline, useRoutePathname, useSyncStatus, useWorkbench } from './hooks';
import { openPalette } from './shell-events';

/* ════════════════════════════════════════════════════════════════════════
   The application shell, laid out like VS Code's workbench: title bar with
   a command center, activity bar, side bar views, editor tabs and
   breadcrumbs over the page, a toggleable panel (output and terminal), and
   the status bar. Phones and tablets get the drawer instead of the activity
   and side bars. Auth routes render bare — the gate is its own boundary.
   ════════════════════════════════════════════════════════════════════════ */

export type BuildInfo = { sha: string | null; env: string };

const REPO = 'https://github.com/ativichkaiau/vestrippn';
const NOT_FOUND = '/_not-found';

export { openPalette };

export default function Shell({ children, build }: { children: ReactNode; build: BuildInfo }) {
  const pathname = useRoutePathname();
  const workbench = useWorkbench();
  const mainRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    console.info('%cVESTRIPPN // root mounted.', 'font-family: ui-monospace, monospace');
    logOutput('system', 'VESTRIPPN // root mounted');
    // The Output panel records what the environment did this session.
    let theme = themeSnapshot();
    let sync = '';
    const onTheme = () => {
      const next = themeSnapshot();
      if (next === theme) return;
      theme = next;
      const [livery, mode, , , colorTheme] = next.split('|');
      logOutput('theme', `theme ${colorTheme} · livery ${livery} · appearance ${mode}`);
    };
    const onSync = (event: Event) => {
      const status = (event as CustomEvent<SyncStatus>).detail;
      if (!status || `${status.state}:${status.message}` === sync) return;
      sync = `${status.state}:${status.message}`;
      logOutput('sync', `${status.state} — ${status.message}`);
    };
    const offToast = onToast(
      (toast) => logOutput('toast', [toast.title, toast.message].filter(Boolean).join(' — ')),
      () => {},
    );
    window.addEventListener('vest:theme-change', onTheme);
    window.addEventListener(SYNC_STATUS_EVENT, onSync);
    return () => {
      offToast();
      window.removeEventListener('vest:theme-change', onTheme);
      window.removeEventListener(SYNC_STATUS_EVENT, onSync);
    };
  }, []);

  // A new route starts at the top of the main viewport (the page scrolls
  // inside the shell, not the window), closes the drawer, and opens or
  // focuses its editor tab.
  useEffect(() => {
    if (!window.location.hash) mainRef.current?.scrollTo({ top: 0 });
    drawerRef.current?.close();
    if (pathname === NOT_FOUND || pathname.startsWith('/auth')) return;
    // New tabs open to the right of the page you came from, as in VS Code.
    saveTabs(openTab(readTabs(), `${pathname}${window.location.search}`, previousPath.current));
    previousPath.current = pathname;
    logOutput('nav', resolvePath(pathname).display);
  }, [pathname]);

  if (pathname.startsWith('/auth')) return <>{children}</>;

  const path = resolvePath(pathname);

  return (
    <div className="sys-shell" data-sidebar={workbench.sidebar ? 'open' : 'closed'} data-panel={workbench.panel ? 'open' : 'closed'}>
      <a className="sys-skip" href="#main">
        skip to content
      </a>

      <header className="sys-topbar">
        <button
          type="button"
          className="sys-icon-button sys-menu-button"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          onClick={() => drawerRef.current?.showModal()}
        >
          <MenuGlyph />
        </button>
        <Link href="/" className="sys-brand" aria-label="VESTRIPPN — root">
          VESTRIPPN<span className="sys-cursor" aria-hidden="true">_</span>
        </Link>
        <TopTools />
      </header>

      <ActivityBar />
      {workbench.sidebar && <SideBar pathname={pathname} />}

      <div className="sys-editor">
        <MoleculeBackdrop />
        <EditorTabs activePath={pathname} />
        <Breadcrumbs segments={path.segments} />
        <main id="main" ref={mainRef} className="sys-main sys-scroll" tabIndex={-1}>
          {children}
        </main>
        {workbench.panel && <Panel pathname={pathname} />}
      </div>

      <StatusBar namespace={path.namespace} build={build} />

      <dialog
        ref={drawerRef}
        className="sys-drawer"
        aria-label="Navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="sys-drawer-head">
          <span className="sys-label">VESTRIPPN / explorer</span>
          <button type="button" className="sys-icon-button" aria-label="Close navigation" onClick={() => drawerRef.current?.close()}>
            <CloseGlyph />
          </button>
        </div>
        <div className="sys-drawer-body">
          <ExplorerTree pathname={pathname} withRegistry={false} />
          <SessionBlock />
        </div>
      </dialog>

      <NavEditor />
      <Shortcuts activePath={pathname} />
    </div>
  );
}

function Breadcrumbs({ segments }: { segments: { label: string; href?: string }[] }) {
  return (
    <nav className="sys-pathbar sys-breadcrumbs" aria-label="Breadcrumbs">
      <ol>
        {segments.map((segment, i) => {
          const last = i === segments.length - 1;
          const className = i === 0 ? 'sys-path-root' : undefined;
          if (last) {
            return (
              <li key={`${segment.label}-${i}`}>
                <span className={className} aria-current="page">
                  {segment.label}
                </span>
              </li>
            );
          }
          return (
            <li key={`${segment.label}-${i}`}>
              {segment.href ? (
                <Link href={segment.href} className={className}>
                  {segment.label}
                </Link>
              ) : (
                <span className={className}>{segment.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TopTools() {
  const clock = useClock();
  const online = useOnline();
  const mode = useMode();
  const modifier = useModifierLabel();
  return (
    <div className="sys-topbar-tools">
      <button type="button" className="sys-search-trigger" onClick={() => openPalette('')} aria-label="Search VESTRIPPN" aria-keyshortcuts="Meta+K Control+K">
        <SearchGlyph />
        <span>search VESTRIPPN…</span>
        <kbd>{modifier}K</kbd>
      </button>
      <span className="sys-tool sys-hide-mobile" data-static>
        <span className="sys-status" data-state={online ? 'active' : 'error'}>
          {online ? 'online' : 'offline'}
        </span>
      </span>
      <time className="sys-tool sys-hide-mobile" data-static suppressHydrationWarning>
        {clock}
      </time>
      <button
        type="button"
        className="sys-tool sys-hide-mobile"
        onClick={toggleMode}
        aria-label={`Appearance: ${MODE_LABEL[mode]}. Switch appearance.`}
        title="dark → light → auto (follows the sun over Chiang Mai)"
      >
        ◐ {MODE_LABEL[mode]}
      </button>
    </div>
  );
}

function StatusBar({ namespace, build }: { namespace: string; build: BuildInfo }) {
  const { status } = useSession();
  const online = useOnline();
  const livery = useLivery();
  const colorTheme = useColorTheme();
  const sync = useSyncStatus();
  const workbench = useWorkbench();
  const short = build.sha?.slice(0, 7);
  return (
    <footer className="sys-statusbar" aria-label="System status">
      <a className="sys-status-remote" href={REPO} target="_blank" rel="noopener noreferrer" title="Source on GitHub">
        <span aria-hidden="true">⌁</span> VESTRIPPN
      </a>
      <span>
        <strong>{namespace}</strong>
      </span>
      <span title={sync.message}>
        <Icon name="sync" size={12} /> {sync.state}
      </span>
      <span>auth: {status === 'authenticated' ? 'active' : status === 'loading' ? '…' : 'none'}</span>
      <Link href="/systems">systems: {String(SYSTEMS.length).padStart(2, '0')}</Link>
      <Link href="/projects">projects: {String(PROJECTS.length).padStart(2, '0')}</Link>
      <span className="sys-status-spacer" />
      <button type="button" onClick={() => togglePanel('terminal')} aria-pressed={workbench.panel} title="Toggle panel (Ctrl+`)">
        <Icon name="terminal" size={12} /> terminal
      </button>
      <button type="button" onClick={() => openPalette('>Color Theme')} title="Change colour theme">
        {COLOR_THEME_LABEL[colorTheme].toLowerCase()}
      </button>
      <Link href="/garage#paints" className="sys-status-livery" title="Livery — open the paint library">
        <span className="sys-swatch" style={{ background: livery.definition.stripe }} aria-hidden="true" />
        livery {livery.definition.name.toLowerCase()}
        {livery.id !== 'system' ? ` · ${livery.definition.year}` : ''}
      </Link>
      <span>env {build.env}</span>
      {short ? (
        <a href={`${REPO}/commit/${build.sha}`} target="_blank" rel="noopener noreferrer">
          build {short}
        </a>
      ) : (
        <span>build local</span>
      )}
      <span className="sys-status" data-state={online ? 'active' : 'error'}>
        {online ? 'ready' : 'offline'}
      </span>
    </footer>
  );
}

function MenuGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 5h13M2.5 9h13M2.5 13h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function CloseGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.2 9.2L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
