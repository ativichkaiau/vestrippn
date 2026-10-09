'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { openNavEditor } from '@/lib/system/nav-store';
import { toggleView, togglePanel, toggleSidebar, type View } from '@/lib/system/workbench';
import Icon, { type IconName } from './Icon';
import { useModifierLabel, useWorkbench } from './hooks';
import { openPalette, openShortcuts } from './shell-events';

/* VS Code's activity bar: switches the side view. Selecting the open view
   again hides the side bar. Manage (gear) holds the global commands. */

const TOP: { view: View; icon: IconName; label: string; keys?: string }[] = [
  { view: 'explorer', icon: 'files', label: 'Explorer', keys: 'Shift+E' },
  { view: 'search', icon: 'search', label: 'Search', keys: 'Shift+F' },
  { view: 'outline', icon: 'outline', label: 'Outline' },
  { view: 'study', icon: 'study', label: 'Study' },
  { view: 'appearance', icon: 'paint', label: 'Appearance' },
];

export default function ActivityBar() {
  const workbench = useWorkbench();
  const modifier = useModifierLabel();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const router = useRouter();

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [menuOpen]);

  const item = (view: View, icon: IconName, label: string, keys?: string) => {
    const active = workbench.sidebar && workbench.view === view;
    return (
      <button
        key={view}
        type="button"
        className="sys-activity-item"
        aria-pressed={active}
        aria-label={label}
        title={keys ? `${label} (${modifier}+${keys})` : label}
        onClick={() => toggleView(view)}
      >
        <Icon name={icon} size={22} />
      </button>
    );
  };

  const run = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  const MENU: { label: string; keys?: string; action: () => void }[] = [
    { label: 'Command Palette…', keys: `${modifier}+Shift+P`, action: () => openPalette('>') },
    { label: 'Quick Open…', keys: `${modifier}+P`, action: () => openPalette('') },
    { label: 'Settings (JSON)', keys: `${modifier}+,`, action: () => router.push('/settings') },
    { label: 'Color Theme', action: () => openPalette('>Color Theme') },
    { label: 'Customize Tabs…', action: openNavEditor },
    { label: 'Toggle Side Bar', keys: `${modifier}+B`, action: toggleSidebar },
    { label: 'Toggle Panel', keys: `${modifier}+\``, action: () => togglePanel() },
    { label: 'Keyboard Shortcuts', keys: `${modifier}+/`, action: openShortcuts },
  ];

  return (
    <nav className="sys-activitybar" aria-label="Activity bar">
      <div className="sys-activity-group">{TOP.map((entry) => item(entry.view, entry.icon, entry.label, entry.keys))}</div>
      <div className="sys-activity-group">
        {item('account', 'account', 'Account')}
        <div className="sys-activity-manage">
          <button
            ref={buttonRef}
            type="button"
            className="sys-activity-item"
            aria-label="Manage"
            title="Manage"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="gear" size={22} />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label="Manage"
              className="sys-menu sys-activity-menu"
              onKeyDown={(event) => {
                const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
                const index = items.indexOf(document.activeElement as HTMLElement);
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setMenuOpen(false);
                  buttonRef.current?.focus();
                } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
                }
              }}
            >
              {MENU.map((entry) => (
                <button key={entry.label} type="button" role="menuitem" tabIndex={-1} onClick={run(entry.action)}>
                  <span>{entry.label}</span>
                  {entry.keys && <kbd>{entry.keys}</kbd>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
