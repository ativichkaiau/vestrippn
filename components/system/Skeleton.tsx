import type { CSSProperties, ReactNode } from 'react';

/* Loading placeholders: static blocks in the surface colour. No shimmer, no
   motion — they mark where content will be, nothing more. Server-safe. */

export function Skel({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`sys-skel ${className}`} style={style} />;
}

/** A mono label above a loading region, e.g. `syncing · canvas`. */
export function SkelLabel({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`sys-label ${className}`}>
      {label.toLowerCase()}…
    </span>
  );
}

/** Accessible wrapper: one polite status per loading region. */
export function SkelGroup({
  label,
  className = '',
  style,
  children,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={`sys-skel-group ${className}`} style={style}>
      <span className="sys-visually-hidden">Loading {label}…</span>
      {children}
    </div>
  );
}
