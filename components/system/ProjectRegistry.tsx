'use client';

import { useState } from 'react';
import type { Domain, Node } from '@/lib/system/types';
import { RegistryTable, StatusIndicator } from './primitives';

/* The project index with its domain filter. Index numbers come from the
   full registry, so a project keeps its number under any filter. */

const FILTERS: ('all' | Domain)[] = ['all', 'software', 'medicine', 'research', 'media'];

export default function ProjectRegistry({ projects }: { projects: Node[] }) {
  const [filter, setFilter] = useState<'all' | Domain>('all');
  const rows = filter === 'all' ? projects : projects.filter((node) => node.domains.includes(filter));
  const count = (value: 'all' | Domain) => (value === 'all' ? projects.length : projects.filter((node) => node.domains.includes(value)).length);

  return (
    <>
      <div className="sys-filter" role="group" aria-label="Filter projects by domain">
        {FILTERS.map((value) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {value}
            <span>{count(value)}</span>
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="sys-empty">no {filter} projects indexed yet</p>
      ) : (
        <RegistryTable
          caption={`Projects — ${filter}`}
          rows={rows}
          rowKey={(node) => node.slug}
          href={(node) => `/projects/${node.slug}`}
          columns={[
            { key: 'id', label: 'id', kind: 'id', render: (node) => String(projects.indexOf(node) + 1).padStart(3, '0') },
            { key: 'name', label: 'project', kind: 'name', render: (node) => <>{node.name}<small>{node.summary}</small></> },
            { key: 'language', label: 'language', kind: 'mono', optional: true, render: (node) => node.language ?? '—' },
            { key: 'domain', label: 'domain', kind: 'mono', optional: true, render: (node) => node.domains.join(' / ') },
            { key: 'state', label: 'state', render: (node) => <StatusIndicator state={node.state} /> },
          ]}
        />
      )}
    </>
  );
}
