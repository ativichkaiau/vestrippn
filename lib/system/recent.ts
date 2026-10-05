import { tabPath } from './editor-tabs';

/* ════════════════════════════════════════════════════════════════════════
   Recently opened pages, newest first — VS Code's Open Recent.

   One entry per route (the pathname), remembering the last href it was
   visited with. Kept per device, like the editor tabs. Pure functions; the
   shell records visits and ⌘K lists them.
   ════════════════════════════════════════════════════════════════════════ */

export const MAX_RECENT = 12;
const KEY = 'vest_recent';
const MAX_HREF = 500;

const valid = (href: unknown): href is string =>
  typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && href.length <= MAX_HREF && !/\s/.test(href);

export function parseRecent(raw: unknown): string[] {
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
  return value.filter((href): href is string => valid(href) && !seen.has(tabPath(href)) && !!seen.add(tabPath(href))).slice(0, MAX_RECENT);
}

/** Put a visit at the front; an earlier visit of the same route is replaced. */
export function addRecent(list: string[], href: string): string[] {
  if (!valid(href)) return list;
  const path = tabPath(href);
  return [href, ...list.filter((item) => tabPath(item) !== path)].slice(0, MAX_RECENT);
}

export function readRecent(): string[] {
  try {
    return parseRecent(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

export function recordRecent(href: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(addRecent(readRecent(), href)));
  } catch {
    /* storage unavailable: no recent list */
  }
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
