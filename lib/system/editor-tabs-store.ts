'use client';

import { parseTabs, type EditorTab } from './editor-tabs';

/* The open editor tabs on this device (not synced: like a VS Code window). */

const KEY = 'vest_editor_tabs';
export const TABS_EVENT = 'sys:editor-tabs';

export function getTabsSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}
export const serverTabsSnapshot = () => '[]';

export function subscribeTabs(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener(TABS_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(TABS_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function readTabs(): EditorTab[] {
  return parseTabs(getTabsSnapshot());
}

export function saveTabs(tabs: EditorTab[]): void {
  const next = JSON.stringify(tabs);
  if (next === getTabsSnapshot()) return;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable: tabs last for this page only */
  }
  window.dispatchEvent(new Event(TABS_EVENT));
}
