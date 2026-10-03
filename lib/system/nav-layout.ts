import { ENVIRONMENT_NAV, RUNTIME_NAV, type NavItem } from './navigation';
import { RUNTIME } from './registry';

/* ════════════════════════════════════════════════════════════════════════
   Editable navigation.

   The sidebar, the phone drawer and ⌘K read one layout: the built-in tabs
   (environment pages and runtime modules) in the order, names and
   visibility the operator chose, plus their own links. The layout is a
   synced preference (`nav`), stored as a canonical JSON string so device
   sync can compare it like any other value.

   Built-ins are never lost: a tab missing from a saved layout (a page added
   after it was saved) is appended to its group, and an id the registry no
   longer knows is dropped. `root` can be renamed and moved, never hidden.
   ════════════════════════════════════════════════════════════════════════ */

export type NavGroupId = 'environment' | 'runtime';
export const NAV_GROUPS: NavGroupId[] = ['environment', 'runtime'];

/** One saved tab. Built-ins carry only what differs from the default. */
export type NavEntry = {
  id: string;
  group: NavGroupId;
  label?: string;
  hidden?: boolean;
  /** Custom links only: an in-app path (`/learn/cases`) or an http(s) URL. */
  href?: string;
};

export type ResolvedNavItem = NavItem & {
  id: string;
  group: NavGroupId;
  /** The built-in name, for search and "reset name"; undefined for custom links. */
  defaultLabel?: string;
  custom: boolean;
  external: boolean;
  hidden: boolean;
};

export type ResolvedNav = Record<NavGroupId, ResolvedNavItem[]>;

export const ROOT_TAB_ID = 'env:root';
export const MAX_LABEL = 32;
export const MAX_CUSTOM = 24;
const MAX_HREF = 500;

type Builtin = { id: string; group: NavGroupId; item: NavItem };

const BUILTINS: Builtin[] = [
  ...ENVIRONMENT_NAV.map((item) => ({ id: `env:${item.label}`, group: 'environment' as const, item })),
  ...RUNTIME_NAV.map((item, i) => ({ id: `rt:${RUNTIME[i].slug}`, group: 'runtime' as const, item })),
];
const BUILTIN_BY_ID = new Map(BUILTINS.map((builtin) => [builtin.id, builtin]));

export const DEFAULT_NAV: NavEntry[] = BUILTINS.map(({ id, group }) => ({ id, group }));

const CUSTOM_ID = /^custom:[a-z0-9]{1,24}$/;
const BUILTIN_ID = /^(env|rt):[a-z0-9_-]{1,40}$/;
// Letters, numbers, punctuation, symbols and spaces; no control characters.
const LABEL = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+$/u;

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** A tidy label, or an error message. */
export function checkLabel(value: string): string | { error: string } {
  const label = value.replace(/\s+/g, ' ').trim();
  if (!label) return { error: 'Give the tab a name.' };
  if ([...label].length > MAX_LABEL) return { error: `Keep names to ${MAX_LABEL} characters.` };
  if (!LABEL.test(label)) return { error: 'Names can’t contain control characters.' };
  return label;
}

/** A normalised link target, or an error message. */
export function checkHref(value: string): string | { error: string } {
  const href = value.trim();
  if (!href) return { error: 'Add a path like /learn/cases or a full https:// link.' };
  if (href.length > MAX_HREF) return { error: 'That link is too long.' };
  if (/\s/.test(href)) return { error: 'Links can’t contain spaces.' };
  if (href.startsWith('/')) {
    if (href.startsWith('//')) return { error: 'Use a path like /learn/cases or a full https:// link.' };
    return href;
  }
  if (isExternalHref(href)) {
    try {
      const url = new URL(href);
      return url.hostname ? url.toString() : { error: 'That link has no host.' };
    } catch {
      return { error: 'That doesn’t look like a valid link.' };
    }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return { error: 'Only https:// and in-app links are allowed.' };
  return { error: 'Start in-app paths with / or paste a full https:// link.' };
}

/**
 * Validate a stored layout (the JSON string, or its parsed array). Throws on
 * anything malformed; unknown built-in ids are dropped so an old layout keeps
 * working after the registry changes.
 */
export function parseNavLayout(value: unknown): NavEntry[] {
  let raw = value;
  if (typeof raw === 'string') {
    if (raw.length > 20_000) throw new Error('Navigation layout is too large.');
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new Error('Invalid navigation layout.');
    }
  }
  if (!Array.isArray(raw) || raw.length > BUILTINS.length + MAX_CUSTOM) throw new Error('Invalid navigation layout.');
  const seen = new Set<string>();
  const entries: NavEntry[] = [];
  let customs = 0;
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid navigation tab.');
    const data = item as Record<string, unknown>;
    if (Object.keys(data).some((key) => !['id', 'group', 'label', 'hidden', 'href'].includes(key))) throw new Error('Unsupported navigation field.');
    const { id, group } = data;
    if (typeof id !== 'string' || seen.has(id)) throw new Error('Invalid navigation tab id.');
    if (!NAV_GROUPS.includes(group as NavGroupId)) throw new Error('Invalid navigation group.');
    if (data.hidden !== undefined && typeof data.hidden !== 'boolean') throw new Error('Invalid navigation visibility.');
    seen.add(id);

    let label: string | undefined;
    if (data.label !== undefined) {
      const checked = typeof data.label === 'string' ? checkLabel(data.label) : { error: 'Invalid name.' };
      if (typeof checked !== 'string') throw new Error(`Invalid navigation name: ${checked.error}`);
      label = checked;
    }

    if (CUSTOM_ID.test(id)) {
      customs += 1;
      if (customs > MAX_CUSTOM) throw new Error(`At most ${MAX_CUSTOM} custom tabs.`);
      const href = typeof data.href === 'string' ? checkHref(data.href) : { error: 'missing link' };
      if (typeof href !== 'string' || !label) throw new Error('Custom tabs need a name and a valid link.');
      entries.push({ id, group: group as NavGroupId, label, href, ...(data.hidden ? { hidden: true } : {}) });
      continue;
    }

    if (!BUILTIN_ID.test(id) || data.href !== undefined) throw new Error('Invalid navigation tab id.');
    const builtin = BUILTIN_BY_ID.get(id);
    if (!builtin) continue; // retired page: drop it quietly
    entries.push({
      id,
      group: builtin.group, // built-ins stay in their own group
      ...(label && label !== builtin.item.label ? { label } : {}),
      ...(data.hidden && id !== ROOT_TAB_ID ? { hidden: true } : {}),
    });
  }
  return entries;
}

/** Canonical string form: every built-in present, defaults omitted. */
export function serializeNavLayout(entries: NavEntry[]): string {
  return JSON.stringify(completeLayout(entries).map((entry) => {
    const builtin = BUILTIN_BY_ID.get(entry.id);
    const label = entry.label === undefined ? undefined : checkLabel(entry.label);
    const href = builtin || entry.href === undefined ? undefined : checkHref(entry.href);
    if (typeof label === 'object') throw new Error(label.error);
    if (typeof href === 'object') throw new Error(href.error);
    return {
      id: entry.id,
      group: builtin ? builtin.group : entry.group,
      ...(label && label !== builtin?.item.label ? { label } : {}),
      ...(entry.hidden && entry.id !== ROOT_TAB_ID ? { hidden: true } : {}),
      ...(href ? { href } : {}),
    };
  }));
}

export const DEFAULT_NAV_STRING = serializeNavLayout(DEFAULT_NAV);

/** Saved order first; built-ins the layout doesn't mention go to the end of their group. */
function completeLayout(entries: NavEntry[]): NavEntry[] {
  const ids = new Set(entries.map((entry) => entry.id));
  const missing = DEFAULT_NAV.filter((entry) => !ids.has(entry.id));
  const result: NavEntry[] = [];
  for (const group of NAV_GROUPS) {
    result.push(...entries.filter((entry) => entry.group === group), ...missing.filter((entry) => entry.group === group));
  }
  return result;
}

/** Read a stored layout, falling back to the default on anything unusable. */
export function readNavLayout(value: string | null | undefined): NavEntry[] {
  if (!value) return DEFAULT_NAV;
  try {
    return completeLayout(parseNavLayout(value));
  } catch {
    return DEFAULT_NAV;
  }
}

function matchFor(href: string): string[] {
  const path = href.split(/[?#]/)[0] || '/';
  return [path.length > 1 ? path.replace(/\/+$/, '') : path];
}

/** Every tab, hidden ones included, grouped and in display order. */
export function resolveNav(entries: NavEntry[]): ResolvedNav {
  const resolved: ResolvedNav = { environment: [], runtime: [] };
  for (const entry of completeLayout(entries)) {
    const builtin = BUILTIN_BY_ID.get(entry.id);
    if (builtin) {
      resolved[builtin.group].push({
        ...builtin.item,
        id: entry.id,
        group: builtin.group,
        label: entry.label ?? builtin.item.label,
        defaultLabel: builtin.item.label,
        custom: false,
        external: false,
        hidden: entry.id !== ROOT_TAB_ID && Boolean(entry.hidden),
      });
    } else if (entry.href && entry.label) {
      const external = isExternalHref(entry.href);
      resolved[entry.group].push({
        id: entry.id,
        group: entry.group,
        label: entry.label,
        href: entry.href,
        match: external ? [] : matchFor(entry.href),
        custom: true,
        external,
        hidden: Boolean(entry.hidden),
      });
    }
  }
  // Environment tabs are numbered by their visible position: 00, 01, …
  let index = 0;
  for (const item of resolved.environment) {
    item.index = item.hidden ? undefined : String(index++).padStart(2, '0');
  }
  return resolved;
}

/** The flat entry list behind a resolved layout, for saving edits. */
export function toEntries(nav: ResolvedNav): NavEntry[] {
  return NAV_GROUPS.flatMap((group) =>
    nav[group].map((item) => ({
      id: item.id,
      group,
      ...(item.custom || item.label !== item.defaultLabel ? { label: item.label } : {}),
      ...(item.hidden ? { hidden: true } : {}),
      ...(item.custom ? { href: item.href } : {}),
    })),
  );
}

export function newCustomId(): string {
  return `custom:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
