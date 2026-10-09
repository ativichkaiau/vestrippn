import { ARCHIVE } from './archive';
import { LOGS, NODES, OBJECTS, PROJECTS, SYSTEMS } from './registry';
import type { Node, State } from './types';

/* ════════════════════════════════════════════════════════════════════════
   The VESTRIPPN tree — the root namespace and what is mounted beneath it,
   derived from the registry (a node's `path` decides its branch). Rendered on
   the root page as the environment map.
   ════════════════════════════════════════════════════════════════════════ */

export type TreeLine = {
  key: string;
  label: string;
  href: string;
  /** Box-drawing prefix, e.g. "│   ├── ". */
  prefix: string;
  kind: 'root' | 'branch' | 'leaf';
  state?: State;
  /** Shown in the preview panel. */
  path: string;
  type: string;
  summary: string;
};

type Branch = {
  key: string;
  label: string;
  href: string;
  path: string;
  type: string;
  summary: string;
  state: State;
  children: Omit<TreeLine, 'prefix' | 'kind'>[];
};

const fromNode = (node: Node, href: string) => ({
  key: node.slug,
  label: node.name,
  href,
  state: node.state,
  path: node.path,
  type: node.type,
  summary: node.summary,
});

function under(segment: string): Node[] {
  return NODES.filter((node) => node.path.split('/')[1] === segment && node.path.split('/').length > 2);
}

export function buildTree(): TreeLine[] {
  const studyex = NODES.find((node) => node.slug === 'studyex');
  const branches: Branch[] = [
    { key: 'identity', label: 'identity/', href: '/identity', path: '~/identity', type: 'page', summary: 'who this environment belongs to', state: 'active', children: [] },
    {
      key: 'medicine', label: 'medicine/', href: '/medicine', path: '~/medicine', type: 'branch', summary: 'medical school and the systems built to carry it', state: 'active',
      children: under('medicine').map((node) => fromNode(node, node.system ? `/systems/${node.slug}` : `/projects/${node.slug}`)),
    },
    {
      key: 'research', label: 'research/', href: '/research', path: '~/research', type: 'branch', summary: 'systematic review infrastructure', state: 'active',
      children: under('research').map((node) => fromNode(node, node.system ? `/systems/${node.slug}` : `/projects/${node.slug}`)),
    },
    ...(studyex
      ? [{ key: 'studyex-branch', label: `${studyex.name}/`, href: '/systems/studyex', path: studyex.path, type: studyex.type, summary: studyex.summary, state: studyex.state, children: [] }]
      : []),
    {
      key: 'projects', label: 'projects/', href: '/projects', path: '~/projects', type: 'registry', summary: `${PROJECTS.length} repositories and artifacts`, state: 'active',
      children: under('projects').map((node) => fromNode(node, `/projects/${node.slug}`)),
    },
    {
      key: 'logs', label: 'logs/', href: '/logs', path: '~/logs', type: 'branch', summary: 'development logs', state: 'active',
      children: [
        ...under('logs').map((node) => fromNode(node, `/systems/${node.slug}`)),
        ...LOGS.map((log) => ({ key: `log-${log.slug}`, label: log.id.toLowerCase(), href: `/logs/${log.slug}`, state: 'active' as State, path: `~/logs/${log.series}/${log.id.toLowerCase()}`, type: log.kind, summary: `${log.targetFile} — ${log.status}` })),
      ],
    },
    {
      key: 'garage', label: 'garage/', href: '/garage', path: '~/garage', type: 'branch', summary: 'objects kept for inspection', state: 'available',
      children: OBJECTS.map((object) => ({ key: `object-${object.slug}`, label: object.slug, href: `/garage/${object.slug}`, state: object.state, path: `~/garage/${object.slug}`, type: object.type, summary: object.summary })),
    },
    { key: 'archive', label: 'archive/', href: '/archive', path: '~/archive', type: 'branch', summary: `${ARCHIVE.length} records of earlier work`, state: 'mounted', children: [] },
    { key: 'contact', label: 'contact/', href: '/contact', path: '~/contact', type: 'page', summary: 'open channels', state: 'active', children: [] },
  ];

  const lines: TreeLine[] = [
    {
      key: 'root', label: 'VESTRIPPN/', href: '/', prefix: '', kind: 'root', path: '~', type: 'environment',
      summary: `root namespace · ${SYSTEMS.length} systems · ${PROJECTS.length} projects · ${OBJECTS.length} objects`,
    },
  ];
  branches.forEach((branch, b) => {
    const lastBranch = b === branches.length - 1;
    lines.push({ ...branch, prefix: lastBranch ? '└── ' : '├── ', kind: 'branch' });
    branch.children.forEach((child, c) => {
      const lastChild = c === branch.children.length - 1;
      lines.push({ ...child, prefix: `${lastBranch ? '    ' : '│   '}${lastChild ? '└── ' : '├── '}`, kind: 'leaf' });
    });
  });
  return lines;
}
