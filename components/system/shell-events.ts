'use client';

/* Window events that open shell surfaces from anywhere (menus, the terminal,
   shortcuts) without importing the components that own them. */

export const PALETTE_EVENT = 'sys:palette';
export const SHORTCUTS_EVENT = 'sys:shortcuts';
export const FOCUS_SEARCH_EVENT = 'sys:focus-search';

/** Open ⌘K; '>' opens it on commands (VS Code's Ctrl+Shift+P). */
export function openPalette(query = '') {
  window.dispatchEvent(new CustomEvent(PALETTE_EVENT, { detail: { query } }));
}

export function openShortcuts() {
  window.dispatchEvent(new Event(SHORTCUTS_EVENT));
}
