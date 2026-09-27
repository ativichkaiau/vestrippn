import type { CSSProperties, ReactNode } from 'react';
import { MARK_PATH, MARK_VIEWBOX } from '@/lib/w100/mark-shape';

/**
 * W100 skeletons — loading states that could only belong to VESTRIPPN.
 *
 * - Every block is a carbon-twill slab crossed by a streak in the active
 *   livery's two colours, at its 114° stripe angle; blocks that mount
 *   together sweep in unison.
 * - Panels carry a pit-wall channel label with three timing sectors that light
 *   in turn, like a lap on the timing screen.
 * - Larger panels show the "3" mark as a circuit, with a light lapping it.
 * - Groups assemble in depth (tilted back, standing up) as they mount.
 *
 * Styles: app/w100.css ("SKELETONS"). Server-safe (no hooks).
 */

export function Skel({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`w100-skel ${className}`} style={style} />;
}

/** Channel label + timing sectors, e.g. "Sync · Canvas". */
export function SkelLabel({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`w100-skel-label ${className}`}>
      <span className="w100-skel-tick" />
      <span className="w100-skel-channel">{label}</span>
      <span className="w100-skel-sectors"><i /><i /><i /></span>
    </span>
  );
}

/** The mark as a circuit, a light lapping its outline. */
export function SkelLap({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`w100-skel-lap ${className}`} viewBox={MARK_VIEWBOX} fill="none" focusable="false">
      <path className="w100-skel-lap-track" d={MARK_PATH} />
      <path className="w100-skel-lap-car" d={MARK_PATH} pathLength={100} />
    </svg>
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
    // Opted out of W85 scroll reveals: it assembles itself (see w100.css).
    <div role="status" aria-busy="true" data-w85-reveal="off" className={`w100-skel-group ${className}`} style={style}>
      <span className="sr-only">Loading {label}…</span>
      {children}
    </div>
  );
}

/** A complete telemetry panel: label, lap mark, and body rows. */
export function SkelPanel({
  label,
  className = '',
  rows = 3,
  children,
}: {
  label: string;
  className?: string;
  rows?: number;
  children?: ReactNode;
}) {
  return (
    <SkelGroup label={label} className={`w100-skel-panel ${className}`}>
      <SkelLabel label={label} />
      {children ?? Array.from({ length: rows }, (_, i) => (
        <Skel key={i} className="h-11 w-full rounded-[10px]" style={{ width: `${100 - i * 11}%` }} />
      ))}
      <SkelLap />
    </SkelGroup>
  );
}
