'use client';

import { useState } from 'react';
import { MetadataGrid, StatusIndicator } from '@/components/system/primitives';
import Mark3D from '@/components/w100/Mark3D';
import type { GarageObject } from '@/lib/system/types';
import type { SceneStats } from '@/lib/three/livery-scene';
import VehicleViewer from './VehicleViewer';

/* An object in the viewer, with its metadata beside it. Geometry figures are
   read from the loaded model, so they are shown only once it has loaded. */
export default function ObjectInspector({ object }: { object: GarageObject }) {
  const [stats, setStats] = useState<SceneStats | null>(null);
  const live = stats
    ? [
        { key: 'meshes', value: String(stats.meshes), mono: true },
        { key: 'triangles', value: stats.triangles.toLocaleString('en-US'), mono: true },
      ]
    : [];

  return (
    <div className="sys-inspector">
      {object.slug === 'silver_arrow' ? (
        <VehicleViewer onStats={setStats} />
      ) : (
        <section className="sys-viewer" aria-label={`${object.name} viewer`}>
          <div className="sys-viewer-bar">
            <span className="sys-label">view · drag to turn</span>
            <span className="sys-status" data-state="active">webgl</span>
          </div>
          <div className="sys-viewer-stage sys-mark-stage">
            <Mark3D label={`${object.name}, three-dimensional. Drag to turn.`} />
          </div>
          <div className="sys-viewer-foot">
            <p>drag to turn · inertia on release</p>
          </div>
        </section>
      )}

      <aside aria-label={`${object.name} metadata`}>
        <p className="sys-label" style={{ marginBottom: 'var(--space-3)' }}>
          {object.id}
        </p>
        <MetadataGrid
          rows={[
            { key: 'name', value: object.name },
            { key: 'type', value: object.type },
            { key: 'state', value: <StatusIndicator state={object.state} /> },
            { key: 'viewer', value: object.viewer, mono: true },
            ...object.fields.map((field) => ({ key: field.key, value: field.value })),
            ...live,
          ]}
        />
        {object.notes?.map((note) => (
          <p key={note.slice(0, 24)} className="sys-section-intro" style={{ marginTop: 'var(--space-4)' }}>
            {note}
          </p>
        ))}
      </aside>
    </div>
  );
}
