'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { closeAll, closeOthers, closeTab, closeToRight, describeTab, moveTab, togglePin, type EditorTab, type TabKind } from '@/lib/system/editor-tabs';
import { readTabs, saveTabs } from '@/lib/system/editor-tabs-store';
import { toast } from '@/lib/toast-bus';
import { openToSide } from '@/lib/system/workbench';
import Icon, { type IconName } from './Icon';
import { useEditorTabs, useNav } from './hooks';

/* ════════════════════════════════════════════════════════════════════════
   Editor tabs: every page you open gets a tab, VS Code style. Click to
   switch, ✕ or middle-click to close, drag to reorder, right-click for
   close others / to the right / all, pin and copy link. Pinned tabs stay at
   the front. Alt+W closes the current tab; Alt+[ and Alt+] move between
   tabs; Alt+1…9 jump (see Shortcuts).
   ════════════════════════════════════════════════════════════════════════ */

const KIND_ICON: Record<TabKind, IconName> = {
  page: 'page',
  runtime: 'runtime',
  system: 'system',
  project: 'project',
  log: 'log',
  object: 'object',
  archive: 'archive',
  link: 'link',
  auth: 'auth',
  settings: 'json',
};

type Menu = { path: string; x: number; y: number };

/** Close a tab and, when it was the open page, go to its neighbour. */
export function closeEditorTab(path: string, activePath: string, navigate: (href: string) => void) {
  const { tabs, next } = closeTab(readTabs(), path);
  saveTabs(tabs);
  if (path === activePath) navigate(next?.href ?? '/');
}

export default function EditorTabs({ activePath }: { activePath: string }) {
  const tabs = useEditorTabs();
  const nav = useNav();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const dragged = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Keep the active tab in view.
  useEffect(() => {
    stripRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activePath, tabs.length]);

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (event instanceof PointerEvent && menuRef.current?.contains(event.target as Node)) return;
      setMenu(null);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    window.addEventListener('blur', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
      window.removeEventListener('blur', close);
    };
  }, [menu]);

  if (!tabs.length) return null;

  const navigate = (href: string) => router.push(href);
  const close = (path: string) => closeEditorTab(path, activePath, navigate);

  const onDrop = (to: number) => (event: DragEvent) => {
    event.preventDefault();
    if (dragged.current === null) return;
    saveTabs(moveTab(readTabs(), dragged.current, to));
    dragged.current = null;
  };

  const menuTab = menu ? tabs.find((tab) => tab.path === menu.path) : undefined;
  const runMenu = (action: (tab: EditorTab) => void) => () => {
    if (menuTab) action(menuTab);
    setMenu(null);
  };
  // After closing several tabs, keep the open page if it survived.
  const keep = (next: EditorTab[]) => {
    saveTabs(next);
    if (!next.some((tab) => tab.path === activePath)) navigate(next.at(-1)?.href ?? '/');
  };

  return (
    <div className="sys-tabs" ref={stripRef}>
      <nav aria-label="Open pages">
        <ul className="sys-tab-list">
          {tabs.map((tab, i) => {
            const info = describeTab(tab.path, nav);
            const active = tab.path === activePath;
            return (
              <li
                key={tab.path}
                className="sys-tab"
                data-active={active || undefined}
                data-pinned={tab.pinned || undefined}
                draggable
                onDragStart={(event) => {
                  dragged.current = i;
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', tab.href);
                }}
                onDragOver={(event) => {
                  if (dragged.current !== null) event.preventDefault();
                }}
                onDrop={onDrop(i)}
                onDragEnd={() => {
                  dragged.current = null;
                }}
                onAuxClick={(event: ReactMouseEvent) => {
                  if (event.button === 1) {
                    event.preventDefault();
                    close(tab.path);
                  }
                }}
                onMouseDown={(event) => {
                  if (event.button === 1) event.preventDefault(); // no autoscroll
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  // Keyboard (Shift+F10 / menu key) reports 0,0: open under the tab.
                  const rect = event.currentTarget.getBoundingClientRect();
                  const keyboard = event.clientX === 0 && event.clientY === 0;
                  setMenu({ path: tab.path, x: keyboard ? rect.left : event.clientX, y: keyboard ? rect.bottom : event.clientY });
                }}
              >
                <Link href={tab.href} className="sys-tab-link" aria-current={active ? 'page' : undefined} title={info.detail} draggable={false}>
                  <Icon name={KIND_ICON[info.kind]} className="sys-tab-icon" />
                  <span className="sys-tab-label">{info.label}</span>
                </Link>
                {tab.pinned ? (
                  <button type="button" className="sys-tab-action" aria-label={`Unpin ${info.label}`} title="Unpin" onClick={() => saveTabs(togglePin(readTabs(), tab.path))}>
                    <Icon name="pin" size={14} />
                  </button>
                ) : (
                  <button type="button" className="sys-tab-action" aria-label={`Close ${info.label}`} title="Close (Alt+W)" onClick={() => close(tab.path)}>
                    <Icon name="close" size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {menu && menuTab && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Tab actions"
          className="sys-menu sys-tab-menu"
          style={{ left: Math.min(menu.x, window.innerWidth - 220), top: Math.min(menu.y, window.innerHeight - 260) }}
          onKeyDown={(event) => {
            const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
            const index = items.indexOf(document.activeElement as HTMLElement);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
            }
          }}
        >
          <button type="button" role="menuitem" tabIndex={-1} onClick={runMenu((tab) => close(tab.path))}>
            <span>Close</span>
            <kbd>Alt+W</kbd>
          </button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={runMenu((tab) => keep(closeOthers(readTabs(), tab.path)))}>
            <span>Close Others</span>
          </button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={runMenu((tab) => keep(closeToRight(readTabs(), tab.path)))}>
            <span>Close to the Right</span>
          </button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={runMenu(() => keep(closeAll(readTabs())))}>
            <span>Close All</span>
          </button>
          <button type="button" role="menuitem" tabIndex={-1} onClick={runMenu((tab) => openToSide(tab.href))}>
            <span>Open to the Side</span>
            <kbd>Ctrl+\</kbd>
          </button>
          <hr />
          <button type="button" role="menuitem" tabIndex={-1} onClick={runMenu((tab) => saveTabs(togglePin(readTabs(), tab.path)))}>
            <span>{menuTab.pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={runMenu((tab) => {
              void navigator.clipboard?.writeText(new URL(tab.href, window.location.origin).toString()).then(
                () => toast({ id: 'copy-link', title: 'link copied', variant: 'success' }),
                () => toast({ id: 'copy-link', title: 'Could not copy the link', variant: 'warn' }),
              );
            })}
          >
            <span>Copy Link</span>
          </button>
        </div>
      )}
    </div>
  );
}
