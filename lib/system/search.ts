import { ARCHIVE } from './archive';
import type { ResolvedNav } from './nav-layout';
import { LOGS, OBJECTS, PROJECTS, RUNTIME, SYSTEMS } from './registry';

/* ════════════════════════════════════════════════════════════════════════
   One search index for ⌘K and the sidebar's Search view.

   Every entry is a real destination: pages (named the way the operator set
   the tabs), runtime modules, systems, projects, logs, garage objects and
   archive records. Actions live in the palette, which adds its own.
   ════════════════════════════════════════════════════════════════════════ */

export type Category = 'PAGE' | 'RUNTIME' | 'SYSTEM' | 'PROJECT' | 'LOG' | 'OBJECT' | 'ARCHIVE' | 'ACTION';
export const CATEGORY_ORDER: Category[] = ['PAGE', 'SYSTEM', 'PROJECT', 'RUNTIME', 'LOG', 'OBJECT', 'ARCHIVE', 'ACTION'];

export type Entry = {
  id: string;
  category: Category;
  label: string;
  detail: string;
  keywords?: string;
  href?: string;
  run?: () => void | Promise<void>;
};

export const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Pages and runtime modules, named and ordered the way the operator set the tabs. */
export function navEntries(nav: ResolvedNav): Entry[] {
  const runtime = new Map(RUNTIME.map((mounted) => [`rt:${mounted.slug}`, mounted]));
  return [
    ...nav.environment.map((item) => ({
      id: `page:${item.id}`,
      category: 'PAGE' as const,
      label: item.id === 'env:root' && item.label === 'root' ? 'Go to root' : `Open ${item.label}`,
      detail: item.external ? `${item.href} ↗` : item.href === '/' ? '~' : `~${item.href}`,
      keywords: `${item.label} ${item.defaultLabel ?? ''}${item.hidden ? ' hidden' : ''}`,
      href: item.href,
    })),
    ...nav.runtime.map((item) => {
      const mounted = runtime.get(item.id);
      return {
        id: `runtime:${item.id}`,
        category: 'RUNTIME' as const,
        label: item.label,
        detail: mounted ? mounted.path : item.external ? `${item.href} ↗` : `~${item.href}`,
        keywords: `${item.defaultLabel ?? ''} ${mounted ? `${mounted.summary} ${mounted.keywords ?? ''}` : ''}${item.hidden ? ' hidden' : ''}`,
        href: item.href,
      };
    }),
  ];
}

export const STATIC_ENTRIES: Entry[] = [
  ...SYSTEMS.map((node) => ({
    id: `system:${node.slug}`,
    category: 'SYSTEM' as const,
    label: node.name,
    detail: node.summary,
    keywords: `${node.type} ${node.slug} ${node.domains.join(' ')}`,
    href: `/systems/${node.slug}`,
  })),
  ...PROJECTS.filter((node) => !node.system).map((node) => ({
    id: `project:${node.slug}`,
    category: 'PROJECT' as const,
    label: node.name,
    detail: `${node.summary}${node.language ? ` · ${node.language}` : ''}`,
    keywords: `${node.type} ${node.slug} ${node.domains.join(' ')}`,
    href: `/projects/${node.slug}`,
  })),
  ...LOGS.map((log) => ({
    id: `log:${log.slug}`,
    category: 'LOG' as const,
    label: `${log.id} · ${log.targetFile}`,
    detail: log.series,
    keywords: `${log.title} ${log.runtime} ${log.kind}`,
    href: `/logs/${log.slug}`,
  })),
  ...OBJECTS.map((object) => ({
    id: `object:${object.slug}`,
    category: 'OBJECT' as const,
    label: object.name,
    detail: `${object.id} · ${object.type}`,
    keywords: `garage 3d ${object.slug} ${object.summary}`,
    href: `/garage/${object.slug}`,
  })),
  { id: 'page:legal', category: 'PAGE', label: 'Open legal', detail: '~/legal · privacy, terms, disclaimers', keywords: 'privacy terms policy', href: '/legal' },
  { id: 'page:ingest', category: 'RUNTIME', label: 'ingest sources', detail: '~/runtime/assistant/ingest', keywords: 'upload pdf docx das assistant grounding', href: '/das/ingest' },
  { id: 'page:ielts-practice', category: 'RUNTIME', label: 'ielts practice', detail: '~/runtime/ielts/practice', keywords: 'questions reading listening graded', href: '/learn/ielts' },
  { id: 'page:paints', category: 'OBJECT', label: 'Paint library', detail: '~/garage · liveries', keywords: 'livery theme paint color mercedes williams red bull senna', href: '/garage#paints' },
  ...ARCHIVE.map((record) => ({
    id: `archive:${record.id}`,
    category: 'ARCHIVE' as const,
    label: record.code ? `${record.code}${record.year ? ` / ${record.year}` : ''} · ${record.title}` : record.title,
    detail: record.category,
    keywords: `${record.type} ${record.field ?? ''} ${record.result ?? ''}`,
    href: `/archive#${record.id}`,
  })),
];

// Subsequence fuzzy score: every query character must appear in order.
// Consecutive and word-start hits rank higher. Null when it does not match.
export function score(query: string, text: string): number | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let ti = 0;
  let total = 0;
  let streak = 0;
  for (const c of q) {
    const found = t.indexOf(c, ti);
    if (found === -1) return null;
    total += 1;
    if (found === ti) {
      streak += 1;
      total += streak;
    } else streak = 0;
    if (found === 0 || /[\s_/.·-]/.test(t[found - 1])) total += 2;
    ti = found + 1;
  }
  return total;
}

/** Rank entries for a query: exact substrings first, then earned fuzzy matches. */
export function rankEntries(entries: Entry[], query: string, limit = 40): Entry[] {
  const q = query.trim();
  if (!q) return entries;
  const ql = q.toLowerCase();
  return entries
    .map((entry) => {
      const label = entry.label.toLowerCase();
      const full = `${entry.label} ${entry.detail} ${entry.category} ${entry.keywords ?? ''}`.toLowerCase();
      if (label.includes(ql)) return { entry, best: 200 - label.indexOf(ql) };
      if (full.includes(ql)) return { entry, best: 100 };
      const fuzzy = score(q, entry.label) ?? score(q, full);
      return { entry, best: fuzzy !== null && fuzzy >= q.length * 2.5 ? fuzzy : null };
    })
    .filter((item): item is { entry: Entry; best: number } => item.best !== null)
    .sort((a, b) => b.best - a.best)
    .slice(0, limit)
    .map((item) => item.entry);
}
