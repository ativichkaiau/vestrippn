import { getNode, getObject, RUNTIME } from './registry';

/* ════════════════════════════════════════════════════════════════════════
   Navigation and the path system.

   URLs stay as they are; the interface shows where a route sits in the
   VESTRIPPN tree. `resolvePath('/academics')` → ~/medicine/academics.
   ════════════════════════════════════════════════════════════════════════ */

export type NavItem = {
  index?: string;
  label: string;
  href: string;
  /** Route prefixes that mark this item as current. */
  match: string[];
};

export const ENVIRONMENT_NAV: NavItem[] = [
  { index: '00', label: 'root', href: '/', match: ['/'] },
  { index: '01', label: 'identity', href: '/identity', match: ['/identity'] },
  { index: '02', label: 'systems', href: '/systems', match: ['/systems'] },
  { index: '03', label: 'projects', href: '/projects', match: ['/projects'] },
  { index: '04', label: 'medicine', href: '/medicine', match: ['/medicine'] },
  { index: '05', label: 'research', href: '/research', match: ['/research'] },
  { index: '06', label: 'garage', href: '/garage', match: ['/garage'] },
  { index: '07', label: 'archive', href: '/archive', match: ['/archive'] },
  { index: '08', label: 'contact', href: '/contact', match: ['/contact'] },
];

const RUNTIME_MATCH: Record<string, string[]> = {
  ielts: ['/ielts', '/learn/ielts'],
  cases: ['/learn/cases'],
  workspace: ['/workspace'],
  assistant: ['/das'],
};

export const RUNTIME_NAV: NavItem[] = RUNTIME.map((module) => ({
  label: module.name,
  href: module.href,
  match: RUNTIME_MATCH[module.slug] ?? [module.href.split('?')[0]],
}));

export function isCurrent(item: NavItem, pathname: string): boolean {
  return item.match.some((prefix) =>
    prefix === '/' ? pathname === '/' : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type PathSegment = { label: string; href?: string };
export type ResolvedPath = { segments: PathSegment[]; namespace: string; display: string };

const BRANCH_HREF: Record<string, string> = {
  medicine: '/medicine',
  research: '/research',
  runtime: '/systems#runtime',
};

const ROOT: PathSegment = { label: '~', href: '/' };

function finish(segments: PathSegment[]): ResolvedPath {
  const display = segments.map((segment) => segment.label).join('/');
  const namespace = segments.length > 1 ? segments[1].label.toUpperCase() : 'ROOT';
  return { segments, namespace, display };
}

/** Parse a registry path such as `~/medicine/academics` into linked segments. */
function fromMountPath(path: string, leafHref: string): PathSegment[] {
  const parts = path.split('/').slice(1);
  return [
    ROOT,
    ...parts.map((label, i) => ({ label, href: i === parts.length - 1 ? leafHref : BRANCH_HREF[label] })),
  ];
}

export function resolvePath(pathname: string): ResolvedPath {
  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (clean === '/') return finish([ROOT]);

  const parts = clean.split('/').filter(Boolean);
  const [head, slug] = parts;

  if (head === 'systems' && slug) {
    return finish([ROOT, { label: 'systems', href: '/systems' }, { label: getNode(slug)?.slug ?? slug, href: clean }]);
  }
  if (head === 'projects' && slug) {
    return finish([ROOT, { label: 'projects', href: '/projects' }, { label: slug, href: clean }]);
  }
  if (head === 'garage' && slug) {
    return finish([ROOT, { label: 'garage', href: '/garage' }, { label: getObject(slug)?.slug ?? slug, href: clean }]);
  }
  if (head === 'learn' && slug === 'ielts') {
    return finish([...fromMountPath('~/runtime/ielts', '/ielts'), { label: 'practice', href: clean }]);
  }
  if (head === 'auth') return finish([ROOT, { label: 'auth', href: '/auth/signin' }]);

  for (const mounted of RUNTIME) {
    const prefix = (RUNTIME_MATCH[mounted.slug] ?? [mounted.href.split('?')[0]]).find((item) => clean === item || clean.startsWith(`${item}/`));
    if (!prefix) continue;
    // Deeper routes keep their own segments: /das/ingest → ~/runtime/assistant/ingest.
    const rest = clean.slice(prefix.length).split('/').filter(Boolean);
    return finish([
      ...fromMountPath(mounted.path, mounted.href),
      ...rest.map((label, i) => ({ label, href: `${prefix}/${rest.slice(0, i + 1).join('/')}` })),
    ]);
  }

  // Environment pages and anything unknown: the URL is the path.
  return finish([ROOT, ...parts.map((label, i) => ({ label, href: `/${parts.slice(0, i + 1).join('/')}` }))]);
}
