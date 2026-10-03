import { resolvePath } from './navigation';
import type { ResolvedNav } from './nav-layout';

/* ════════════════════════════════════════════════════════════════════════
   Editor tabs — the pages you have open, VS Code style.

   A tab is one route (its pathname); `href` remembers the query it was last
   visited with (e.g. /workspace?tab=coverage). Pinned tabs sit at the front
   and survive "close others / close all". New tabs open to the right of the
   active one. Pure functions: the client store (editor-tabs-store) persists
   the list per device, like a VS Code window.
   ════════════════════════════════════════════════════════════════════════ */

export type EditorTab = { path: string; href: string; pinned?: boolean };
export type TabKind = 'page' | 'runtime' | 'system' | 'project' | 'log' | 'object' | 'archive' | 'link' | 'auth';

export const MAX_TABS = 16;
const MAX_HREF = 500;

/** The tab identity of a URL: its pathname without a trailing slash. */
export function tabPath(href: string): string {
  const path = href.split(/[?#]/)[0] || '/';
  return path.length > 1 ? path.replace(/\/+$/, '') || '/' : '/';
}

function valid(href: unknown): href is string {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && href.length <= MAX_HREF && !/\s/.test(href);
}

/** Validate stored tabs; anything malformed is dropped, never thrown. */
export function parseTabs(raw: unknown): EditorTab[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const tabs: EditorTab[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const { href, pinned } = item as Record<string, unknown>;
    if (!valid(href)) continue;
    const path = tabPath(href);
    if (seen.has(path)) continue;
    seen.add(path);
    tabs.push({ path, href, ...(pinned === true ? { pinned: true } : {}) });
  }
  return normalise(tabs.slice(0, MAX_TABS));
}

/** Pinned tabs first, each group in its own order. */
function normalise(tabs: EditorTab[]): EditorTab[] {
  return [...tabs.filter((tab) => tab.pinned), ...tabs.filter((tab) => !tab.pinned)];
}

/** Open (or focus) a URL. A new tab goes right of the active one. */
export function openTab(tabs: EditorTab[], href: string, activePath?: string): EditorTab[] {
  if (!valid(href)) return tabs;
  const path = tabPath(href);
  const existing = tabs.findIndex((tab) => tab.path === path);
  if (existing >= 0) {
    if (tabs[existing].href === href) return tabs;
    return tabs.map((tab, i) => (i === existing ? { ...tab, href } : tab));
  }
  const next = [...tabs];
  const active = activePath ? next.findIndex((tab) => tab.path === activePath) : -1;
  const at = Math.max(active + 1, next.filter((tab) => tab.pinned).length);
  next.splice(active >= 0 ? at : next.length, 0, { path, href });
  // Over the limit: drop the oldest unpinned tabs that are not the new one.
  while (next.length > MAX_TABS) {
    const victim = next.findIndex((tab) => !tab.pinned && tab.path !== path && tab.path !== activePath);
    if (victim < 0) break;
    next.splice(victim, 1);
  }
  return next;
}

/** Close a tab; `next` is where to go if it was the active one. */
export function closeTab(tabs: EditorTab[], path: string): { tabs: EditorTab[]; next: EditorTab | undefined } {
  const index = tabs.findIndex((tab) => tab.path === path);
  if (index < 0) return { tabs, next: undefined };
  const remaining = tabs.filter((_, i) => i !== index);
  return { tabs: remaining, next: remaining[index] ?? remaining[index - 1] };
}

export function closeOthers(tabs: EditorTab[], path: string): EditorTab[] {
  return tabs.filter((tab) => tab.pinned || tab.path === path);
}

export function closeToRight(tabs: EditorTab[], path: string): EditorTab[] {
  const index = tabs.findIndex((tab) => tab.path === path);
  return index < 0 ? tabs : tabs.filter((tab, i) => i <= index || tab.pinned);
}

export function closeAll(tabs: EditorTab[]): EditorTab[] {
  return tabs.filter((tab) => tab.pinned);
}

export function togglePin(tabs: EditorTab[], path: string): EditorTab[] {
  const tab = tabs.find((item) => item.path === path);
  if (!tab) return tabs;
  const rest = tabs.filter((item) => item.path !== path);
  const pinned = rest.filter((item) => item.pinned);
  const unpinned = rest.filter((item) => !item.pinned);
  return tab.pinned
    ? [...pinned, { path: tab.path, href: tab.href }, ...unpinned]
    : [...pinned, { ...tab, pinned: true }, ...unpinned];
}

/** Move a tab; it stays inside its own (pinned or unpinned) group. */
export function moveTab(tabs: EditorTab[], from: number, to: number): EditorTab[] {
  if (from < 0 || from >= tabs.length || from === to) return tabs;
  const pinnedCount = tabs.filter((tab) => tab.pinned).length;
  const tab = tabs[from];
  const [low, high] = tab.pinned ? [0, pinnedCount - 1] : [pinnedCount, tabs.length - 1];
  const target = Math.max(low, Math.min(high, to));
  if (target === from) return tabs;
  const next = [...tabs];
  next.splice(from, 1);
  next.splice(target, 0, tab);
  return next;
}

const KIND_BY_HEAD: Record<string, TabKind> = {
  systems: 'system',
  projects: 'project',
  logs: 'log',
  garage: 'object',
  archive: 'archive',
  auth: 'auth',
};

/** Label and icon for a tab: the operator's tab name when there is one. */
export function describeTab(path: string, nav: ResolvedNav): { label: string; kind: TabKind; detail: string } {
  const resolved = resolvePath(path);
  const detail = resolved.display;
  const [head] = path.split('/').filter(Boolean);
  for (const group of ['environment', 'runtime'] as const) {
    const item = nav[group].find((entry) => !entry.external && entry.match.includes(path));
    if (item) return { label: item.label, kind: group === 'runtime' ? 'runtime' : 'page', detail };
  }
  const leaf = resolved.segments[resolved.segments.length - 1]?.label ?? path;
  const kind = (head && KIND_BY_HEAD[head]) || (detail.startsWith('~/runtime') || detail.startsWith('~/medicine/') ? 'runtime' : 'page');
  return { label: leaf === '~' ? 'root' : leaf, kind, detail };
}
