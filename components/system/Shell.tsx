'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ENVIRONMENT_NAV, RUNTIME_NAV, isCurrent, resolvePath, type NavItem } from '@/lib/system/navigation';
import { PROJECTS, SYSTEMS } from '@/lib/system/registry';
import { MODE_LABEL, toggleMode } from '@/lib/theme';
import { useClock, useLivery, useMode, useModifierLabel, useOnline, useRoutePathname } from './hooks';

/* ════════════════════════════════════════════════════════════════════════
   The application shell: persistent identity (masthead), structured
   navigation (sidebar / drawer), system context (path bar, status bar).
   Auth routes render bare — the gate is its own boundary.
   ════════════════════════════════════════════════════════════════════════ */

export type BuildInfo = { sha: string | null; env: string };

const REPO = 'https://github.com/ativichkaiau/vestrippn';

export function openPalette() {
  window.dispatchEvent(new Event('sys:palette'));
}

export default function Shell({ children, build }: { children: ReactNode; build: BuildInfo }) {
  const pathname = useRoutePathname();
  const mainRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    console.info('%cVESTRIPPN // root mounted.', 'font-family: ui-monospace, monospace');
  }, []);

  // A new route starts at the top of the main viewport (the page scrolls
  // inside the shell, not the window) and closes the drawer.
  useEffect(() => {
    if (!window.location.hash) mainRef.current?.scrollTo({ top: 0 });
    drawerRef.current?.close();
  }, [pathname]);

  if (pathname.startsWith('/auth')) return <>{children}</>;

  const path = resolvePath(pathname);

  return (
    <div className="sys-shell">
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
        <PathBar segments={path.segments} />
        <TopTools />
      </header>

      <aside className="sys-sidebar" aria-label="Navigation">
        <NavTree pathname={pathname} />
        <SessionBlock />
      </aside>

      <main id="main" ref={mainRef} className="sys-main sys-scroll" tabIndex={-1}>
        {children}
      </main>

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
          <span className="sys-label">VESTRIPPN / navigation</span>
          <button type="button" className="sys-icon-button" aria-label="Close navigation" onClick={() => drawerRef.current?.close()}>
            <CloseGlyph />
          </button>
        </div>
        <div className="sys-drawer-body">
          <NavTree pathname={pathname} />
          <SessionBlock />
        </div>
      </dialog>
    </div>
  );
}

function PathBar({ segments }: { segments: { label: string; href?: string }[] }) {
  return (
    <nav className="sys-pathbar" aria-label="Path">
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
  const { status } = useSession();
  const clock = useClock();
  const online = useOnline();
  const mode = useMode();
  const modifier = useModifierLabel();
  return (
    <div className="sys-topbar-tools">
      <button type="button" className="sys-search-trigger" onClick={openPalette} aria-label="Search VESTRIPPN" aria-keyshortcuts="Meta+K Control+K">
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
      {status === 'unauthenticated' && (
        <Link href="/auth/signin" className="sys-tool sys-signin-tool">
          sign in
        </Link>
      )}
    </div>
  );
}

function NavGroup({ title, items, pathname, indexed }: { title: string; items: NavItem[]; pathname: string; indexed: boolean }) {
  const id = `nav-${title}`;
  const { status } = useSession();
  const visitor = status === 'unauthenticated';
  return (
    <div className="sys-nav-group">
      <h2 id={id} className="sys-label">
        {title}
      </h2>
      <ul aria-labelledby={id}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="sys-nav-link"
              aria-current={isCurrent(item, pathname) ? 'page' : undefined}
              aria-label={visitor && item.restricted ? `${item.label} (requires sign-in)` : undefined}
            >
              <span className="sys-nav-index" aria-hidden="true">
                {indexed ? item.index : '·'}
              </span>
              <span>{item.label}</span>
              {visitor && item.restricted && (
                <span className="sys-nav-lock" aria-hidden="true">
                  sign in
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavTree({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="VESTRIPPN">
      <NavGroup title="environment" items={ENVIRONMENT_NAV} pathname={pathname} indexed />
      <NavGroup title="runtime" items={RUNTIME_NAV} pathname={pathname} indexed={false} />
    </nav>
  );
}

function SessionBlock() {
  const { data, status } = useSession();
  const mode = useMode();
  const livery = useLivery();
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

function StatusBar({ namespace, build }: { namespace: string; build: BuildInfo }) {
  const { status } = useSession();
  const online = useOnline();
  const livery = useLivery();
  const short = build.sha?.slice(0, 7);
  return (
    <footer className="sys-statusbar" aria-label="System status">
      <span>
        <strong>VESTRIPPN</strong>{' // '}{namespace}
      </span>
      <span>auth: {status === 'authenticated' ? 'active' : status === 'loading' ? '…' : 'none'}</span>
      <Link href="/systems">systems: {String(SYSTEMS.length).padStart(2, '0')}</Link>
      <Link href="/projects">projects: {String(PROJECTS.length).padStart(2, '0')}</Link>
      <span className="sys-status-spacer" />
      <Link href="/garage#paints" className="sys-status-livery" title="Livery — open the paint library">
        <span className="sys-swatch" style={{ background: livery.definition.stripe }} aria-hidden="true" />
        livery {livery.definition.name.toLowerCase()}
        {livery.id !== 'system' ? ` · ${livery.definition.year}` : ''}
      </Link>
      <Link href="/legal">legal</Link>
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
