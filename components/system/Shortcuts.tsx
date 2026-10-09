'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import { readTabs } from '@/lib/system/editor-tabs-store';
import { isEmbedded } from '@/lib/system/embed';
import { closeSplit, openToSide, parseWorkbench, getWorkbenchSnapshot, togglePanel, toggleSidebar, updateWorkbench } from '@/lib/system/workbench';
import { closeEditorTab } from './EditorTabs';
import { useModifierLabel } from './hooks';
import { FOCUS_SEARCH_EVENT, SHORTCUTS_EVENT, openPalette, openShortcuts } from './shell-events';

/* ════════════════════════════════════════════════════════════════════════
   VS Code keyboard shortcuts for the workbench. Browsers keep Ctrl+W and
   Ctrl+Tab for themselves, so tab commands use Alt instead.
   ⌘K stays with the command palette itself.
   ════════════════════════════════════════════════════════════════════════ */

const TEXT_INPUTS = new Set(['text', 'search', 'url', 'email', 'password', 'number', 'tel', 'date', 'time', 'datetime-local', 'month', 'week']);
// Alt shortcuts stay out of the way while text is being typed.
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    (target instanceof HTMLInputElement && TEXT_INPUTS.has(target.type)));

function openDrawer() {
  document.querySelector<HTMLDialogElement>('dialog.sys-drawer')?.showModal();
}
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

export default function Shortcuts({ activePath }: { activePath: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modifier = useModifierLabel();
  const titleId = useId();
  const pathRef = useRef(activePath);

  useEffect(() => {
    pathRef.current = activePath;
  }, [activePath]);

  useEffect(() => {
    const showSheet = () => dialogRef.current?.showModal();
    const onKey = (event: KeyboardEvent) => {
      // The side editor's frame leaves workbench keys to the window that owns it.
      if (event.defaultPrevented || isEmbedded()) return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && event.shiftKey && key === 'p') {
        event.preventDefault();
        openPalette('>');
      } else if (mod && !event.shiftKey && !event.altKey && key === 'p') {
        event.preventDefault();
        openPalette('');
      } else if (mod && !event.shiftKey && key === 'b') {
        event.preventDefault();
        if (isDesktop()) toggleSidebar();
        else openDrawer();
      } else if (mod && event.code === 'Backquote') {
        event.preventDefault();
        togglePanel('terminal');
      } else if (mod && event.shiftKey && key === 'e') {
        event.preventDefault();
        if (isDesktop()) updateWorkbench({ sidebar: true, view: 'explorer' });
        else openDrawer();
      } else if (mod && event.shiftKey && key === 'f') {
        event.preventDefault();
        updateWorkbench({ sidebar: true, view: 'search' });
        window.dispatchEvent(new Event(FOCUS_SEARCH_EVENT));
      } else if (mod && !event.shiftKey && event.code === 'Backslash') {
        event.preventDefault();
        if (!isDesktop()) return;
        if (parseWorkbench(getWorkbenchSnapshot()).split) closeSplit();
        else openToSide(`${window.location.pathname}${window.location.search}`);
      } else if (mod && !event.shiftKey && event.code === 'Comma') {
        event.preventDefault();
        router.push('/settings');
      } else if (mod && event.code === 'Slash') {
        event.preventDefault();
        openShortcuts();
      } else if (event.altKey && !mod && !isTyping(event.target)) {
        const tabs = readTabs();
        const index = tabs.findIndex((tab) => tab.path === pathRef.current);
        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
          event.preventDefault();
          if (event.code === 'ArrowLeft') window.history.back();
          else window.history.forward();
        } else if (event.code === 'KeyW') {
          event.preventDefault();
          closeEditorTab(pathRef.current, pathRef.current, (href) => router.push(href));
        } else if ((event.code === 'BracketRight' || event.code === 'BracketLeft') && tabs.length) {
          event.preventDefault();
          const step = event.code === 'BracketRight' ? 1 : -1;
          router.push(tabs[(Math.max(index, 0) + step + tabs.length) % tabs.length].href);
        } else if (/^Digit[1-9]$/.test(event.code)) {
          const n = Number(event.code.slice(5));
          const tab = n === 9 ? tabs.at(-1) : tabs[n - 1];
          if (tab) {
            event.preventDefault();
            router.push(tab.href);
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(SHORTCUTS_EVENT, showSheet);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(SHORTCUTS_EVENT, showSheet);
    };
  }, [router]);

  const rows: [string, string][] = [
    [`${modifier}+K`, 'Search VESTRIPPN (pages, systems, projects, actions)'],
    [`${modifier}+P`, 'Quick open'],
    [`${modifier}+Shift+P`, 'Command palette (commands only; or type > in search)'],
    [`${modifier}+B`, 'Toggle the side bar'],
    [`${modifier}+Shift+E`, 'Explorer'],
    [`${modifier}+Shift+F`, 'Search view'],
    [`${modifier}+\``, 'Toggle the panel (terminal and output)'],
    [`${modifier}+\\`, 'Split the editor (this page to the side) / close the split'],
    ['Alt+←  /  Alt+→', 'Go back / forward'],
    [`${modifier}+K, then the RECENT group`, 'Open a recently opened page'],
    ['Alt+W', 'Close the current tab'],
    ['Alt+[  /  Alt+]', 'Previous / next tab'],
    ['Alt+1 … Alt+8', 'Go to tab 1–8 (Alt+9: last tab)'],
    ['Middle-click a tab', 'Close it'],
    ['Right-click a tab', 'Open to the side, close others, close to the right, pin, copy link'],
    [`${modifier}+,`, 'settings.json (every synced setting)'],
    [`${modifier}+/`, 'This sheet'],
  ];

  return (
    <dialog
      ref={dialogRef}
      className="sys-palette sys-shortcuts"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="sys-nav-editor-head">
        <div>
          <h2 id={titleId}>keyboard shortcuts</h2>
          <p>VS Code bindings for the workbench. Tab commands use Alt because browsers reserve Ctrl+W and Ctrl+Tab.</p>
        </div>
        <button type="button" className="sys-icon-button" aria-label="Close" onClick={() => dialogRef.current?.close()}>
          ✕
        </button>
      </div>
      <table className="sys-shortcut-table">
        <tbody>
          {rows.map(([keys, action]) => (
            <tr key={keys}>
              <th scope="row">
                <kbd>{keys}</kbd>
              </th>
              <td>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </dialog>
  );
}
