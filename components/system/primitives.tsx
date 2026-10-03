import Link from 'next/link';
import type { ReactNode } from 'react';
import type { State } from '@/lib/system/types';

/* ════════════════════════════════════════════════════════════════════════
   Structural primitives. Pages are composed from these so they share one
   grammar: label → title → metadata → sections of indexed content.
   No hooks here: every primitive renders on the server or the client.
   ════════════════════════════════════════════════════════════════════════ */

/** `hub` mounts a runtime module's own blocks: they are spaced by the page. */
export function Page({ children, wide = false, hub = false }: { children: ReactNode; wide?: boolean; hub?: boolean }) {
  return (
    <div className="sys-page" data-width={wide ? 'wide' : undefined} data-hub={hub || undefined}>
      {children}
    </div>
  );
}

export type HeaderMeta = { key: string; value: ReactNode };

export function PageHeader({
  index,
  label,
  title,
  lede,
  meta,
  actions,
}: {
  /** Section number in the root tree, e.g. `02`. */
  index?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: HeaderMeta[];
  actions?: ReactNode;
}) {
  return (
    <header className="sys-page-header">
      <p className="sys-label">
        {index && <b>{index}</b>}
        {index && ' / '}
        {label}
      </p>
      <h1 className="sys-title">{title}</h1>
      {lede && <p className="sys-lede">{lede}</p>}
      {meta && meta.length > 0 && (
        <p className="sys-header-meta">
          {meta.map((item) => (
            <span key={item.key}>
              {item.key} <b>{item.value}</b>
            </span>
          ))}
        </p>
      )}
      {actions && <div className="sys-header-actions">{actions}</div>}
    </header>
  );
}

export function Section({
  id,
  title,
  count,
  intro,
  children,
}: {
  id?: string;
  title: string;
  count?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} className="sys-section" aria-labelledby={headingId}>
      <div className="sys-section-header">
        <h2 id={headingId}>{title}</h2>
        {count !== undefined && <span className="sys-section-count">{count}</span>}
      </div>
      {intro && <p className="sys-section-intro">{intro}</p>}
      {children}
    </section>
  );
}

export type MetaRow = { key: string; value: ReactNode; mono?: boolean };

export function MetadataGrid({
  rows,
  compact = false,
  bare = false,
  label,
}: {
  rows: MetaRow[];
  compact?: boolean;
  bare?: boolean;
  label?: string;
}) {
  return (
    <dl className="sys-meta" data-compact={compact || undefined} data-bare={bare || undefined} aria-label={label}>
      {rows
        .filter((row) => row.value !== undefined && row.value !== null && row.value !== '')
        .map((row) => (
          <div key={row.key}>
            <dt>{row.key}</dt>
            <dd data-mono={row.mono || undefined}>{row.value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function StatusIndicator({ state, label }: { state: State | 'error' | 'idle'; label?: string }) {
  return (
    <span className="sys-status" data-state={state}>
      {label ?? state}
    </span>
  );
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** A text command: `inspect →`, `open project →`, `launch ↗`. */
export function CommandLink({ href, children, label }: { href: string; children: ReactNode; label?: string }) {
  if (isExternal(href)) {
    return (
      <a className="sys-command" data-external href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <Link className="sys-command" href={href} aria-label={label}>
      {children}
    </Link>
  );
}

/** A bracketed action: `[ launch ]`. */
export function Action({
  href,
  children,
  primary = false,
  label,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  label?: string;
}) {
  const variant = primary ? 'primary' : undefined;
  if (isExternal(href)) {
    return (
      <a className="sys-action" data-variant={variant} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <Link className="sys-action" data-variant={variant} href={href} aria-label={label}>
      {children}
    </Link>
  );
}

/* ── Registry table ─────────────────────────────────────────────────────── */

export type Column<Row> = {
  key: string;
  label: string;
  /** Hidden on phones. */
  optional?: boolean;
  kind?: 'id' | 'name' | 'mono' | 'text';
  render: (row: Row) => ReactNode;
};

export function RegistryTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  href,
}: {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Destination for the whole row; rendered as the link in the `name` column. */
  href?: (row: Row) => string;
}) {
  const cellClass = (column: Column<Row>) =>
    [
      column.kind === 'id' && 'sys-cell-id',
      column.kind === 'name' && 'sys-cell-name',
      column.kind === 'mono' && 'sys-cell-mono',
      column.optional && 'sys-optional',
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="sys-registry-wrap">
      <table className="sys-registry">
        <caption className="sys-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.optional ? 'sys-optional' : undefined}>
                {column.label}
              </th>
            ))}
            {href && (
              <th scope="col" className="sys-optional">
                <span className="sys-visually-hidden">open</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const target = href?.(row);
            return (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column)}>
                    {column.kind === 'name' && target ? (
                      isExternal(target) ? (
                        <a href={target} target="_blank" rel="noopener noreferrer">
                          {column.render(row)}
                        </a>
                      ) : (
                        <Link href={target}>{column.render(row)}</Link>
                      )
                    ) : (
                      column.render(row)
                    )}
                  </td>
                ))}
                {href && (
                  <td className="sys-cell-go sys-optional" aria-hidden="true">
                    {target ? (isExternal(target) ? '↗' : '→') : null}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pipeline (structural workflow diagram) ─────────────────────────────── */

export function Pipeline({ stages, label }: { stages: { name: string; detail: ReactNode }[]; label: string }) {
  return (
    <ol className="sys-pipeline" aria-label={label}>
      {stages.map((stage) => (
        <li key={stage.name}>
          <span className="sys-stage">{stage.name}</span>
          <span className="sys-stage-detail">{stage.detail}</span>
        </li>
      ))}
    </ol>
  );
}
