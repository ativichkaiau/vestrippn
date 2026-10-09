'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { TreeLine } from '@/lib/system/tree';

/* The environment map: the VESTRIPPN tree as links, with a preview of
   whichever line is hovered or focused. Box drawing is decoration; every line
   is an ordinary link a screen reader reads by name. */

export default function SystemTree({ lines }: { lines: TreeLine[] }) {
  const [activeKey, setActiveKey] = useState(lines[0]?.key);
  const active = lines.find((line) => line.key === activeKey) ?? lines[0];

  return (
    <div className="sys-tree" onMouseLeave={() => setActiveKey(lines[0]?.key)}>
      <nav aria-label="VESTRIPPN tree">
        <ul className="sys-tree-lines">
          {lines.map((line) => (
            <li key={line.key} data-kind={line.kind}>
              <Link
                href={line.href}
                className="sys-tree-line"
                data-active={line.key === active.key || undefined}
                onMouseEnter={() => setActiveKey(line.key)}
                onFocus={() => setActiveKey(line.key)}
              >
                <span className="sys-tree-prefix" aria-hidden="true">
                  {line.prefix}
                </span>
                <span className="sys-tree-label">{line.label}</span>
                {line.state && <span className="sys-tree-state" data-state={line.state} aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <aside className="sys-tree-preview" aria-label="Selected entry">
        <p className="sys-label">{active.kind === 'root' ? 'root' : active.kind === 'branch' ? 'branch' : 'mounted'}</p>
        <p className="sys-tree-preview-name">{active.label.replace(/\/$/, '')}</p>
        <p className="sys-tree-preview-path">{active.path}</p>
        <dl className="sys-meta" data-compact>
          <div>
            <dt>type</dt>
            <dd data-mono>{active.type}</dd>
          </div>
          {active.state && (
            <div>
              <dt>state</dt>
              <dd>
                <span className="sys-status" data-state={active.state}>
                  {active.state}
                </span>
              </dd>
            </div>
          )}
        </dl>
        <p className="sys-tree-preview-summary">{active.summary}</p>
        <Link href={active.kind === 'root' ? '/systems' : active.href} className="sys-command" tabIndex={-1}>
          {active.kind === 'root' ? 'list systems' : 'inspect'}
        </Link>
      </aside>
    </div>
  );
}
