import type { Node } from '@/lib/system/types';
import { getNode } from '@/lib/system/registry';
import { nodeLink } from '@/lib/system/private-links';
import { Action, CommandLink, MetadataGrid, type MetaRow, StatusIndicator } from './primitives';

/* Shared pieces of the system inspector and the project repository view:
   the same node, read two ways. */

export function nodeMetadata(node: Node, extra: MetaRow[] = [], signedIn = false): MetaRow[] {
  const { url, locked } = nodeLink(node, signedIn);
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
      value: url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url.replace(/^https?:\/\//, '')}
        </a>
      ) : locked ? (
        <a href={`/auth/signin?callbackUrl=${encodeURIComponent(node.project ? `/projects/${node.slug}` : `/systems/${node.slug}`)}`}>private · sign in</a>
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

export function NodeMetadata({ node, extra, signedIn = false }: { node: Node; extra?: MetaRow[]; signedIn?: boolean }) {
  return <MetadataGrid rows={nodeMetadata(node, extra, signedIn)} label={`${node.name} metadata`} />;
}

/** Launch / enter / source — only the actions that exist for this node. */
export function NodeActions({ node, view, signedIn = false }: { node: Node; view: 'system' | 'project'; signedIn?: boolean }) {
  const { url } = nodeLink(node, signedIn);
  return (
    <>
      {node.internal && (
        <Action href={node.internal} primary>
          enter
        </Action>
      )}
      {url && (
        <Action href={url} primary={!node.internal}>
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
