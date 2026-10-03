import type { Node } from '@/lib/system/types';
import { getNode } from '@/lib/system/registry';
import { Action, CommandLink, MetadataGrid, type MetaRow, StatusIndicator } from './primitives';

/* Shared pieces of the system inspector and the project repository view:
   the same node, read two ways. */

export function nodeMetadata(node: Node, extra: MetaRow[] = []): MetaRow[] {
  return [
    { key: 'name', value: node.name, mono: true },
    { key: 'namespace', value: 'VESTRIPPN', mono: true },
    { key: 'mount', value: node.path, mono: true },
    { key: 'type', value: node.type },
    { key: 'state', value: <StatusIndicator state={node.state} /> },
    { key: 'domain', value: node.domains.join(' / '), mono: true },
    { key: 'language', value: node.language },
    { key: 'stack', value: node.stack?.join(' · ') },
    { key: 'created', value: node.created, mono: true },
    {
      key: 'url',
      value: node.url ? (
        <a href={node.url} target="_blank" rel="noopener noreferrer">
          {node.url.replace(/^https?:\/\//, '')}
        </a>
      ) : undefined,
    },
    {
      key: 'source',
      value: node.source ? (
        <a href={node.source} target="_blank" rel="noopener noreferrer">
          {node.source.replace(/^https?:\/\//, '')}
        </a>
      ) : undefined,
    },
    ...extra,
  ];
}

export function NodeMetadata({ node, extra }: { node: Node; extra?: MetaRow[] }) {
  return <MetadataGrid rows={nodeMetadata(node, extra)} label={`${node.name} metadata`} />;
}

/** Launch / enter / source — only the actions that exist for this node. */
export function NodeActions({ node, view }: { node: Node; view: 'system' | 'project' }) {
  return (
    <>
      {node.internal && (
        <Action href={node.internal} primary>
          enter
        </Action>
      )}
      {node.url && (
        <Action href={node.url} primary={!node.internal}>
          launch
        </Action>
      )}
      {view === 'system' && node.project && <Action href={`/projects/${node.slug}`}>inspect project</Action>}
      {view === 'project' && node.system && <Action href={`/systems/${node.slug}`}>inspect system</Action>}
      {node.source && <Action href={node.source}>source</Action>}
    </>
  );
}

export function RelatedNodes({ node }: { node: Node }) {
  const related = (node.related ?? []).map(getNode).filter((item): item is Node => Boolean(item));
  if (!related.length) return null;
  return (
    <ul className="sys-list">
      {related.map((item) => (
        <li key={item.slug}>
          <span className="sys-list-name">
            {item.name}
            <small>{item.summary}</small>
          </span>
          <CommandLink href={item.system ? `/systems/${item.slug}` : `/projects/${item.slug}`}>inspect</CommandLink>
        </li>
      ))}
    </ul>
  );
}
