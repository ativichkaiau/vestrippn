'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useLivery } from '@/components/system/hooks';
import StaticCar from './StaticCar';

/* OBJECT_001 on the root page: the flat drawing, painted in the selected
   livery, with a way into the 3D viewer. */
export default function GarageTeaser() {
  const { id, definition } = useLivery();
  const paint = {
    '--viewer-paint': definition.colors[0],
    '--viewer-stripe': definition.colors[1],
    '--viewer-detail': definition.colors[2] ?? definition.colors[1],
  } as CSSProperties;
  return (
    <Link href="/garage/silver_arrow" className="sys-teaser" style={paint} aria-label="Silver Arrow — open the 3D viewer">
      <span className="sys-teaser-head">
        <span className="sys-label">OBJECT_001 · garage</span>
        <span className="sys-mono sys-muted">{id === 'system' ? 'system paint' : `${definition.name.toLowerCase()} · ${definition.year}`}</span>
      </span>
      <StaticCar className="sys-teaser-car" />
      <span className="sys-teaser-foot">
        <span>
          <b>Silver Arrow</b>
          <small>procedural open-wheel concept · three.js</small>
        </span>
        <span className="sys-command">inspect in 3D</span>
      </span>
    </Link>
  );
}
