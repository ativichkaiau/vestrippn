'use client';

import { useSyncExternalStore } from 'react';
import { LIVERIES, LIVERY_CATALOG, type Livery } from '@/lib/liveries';
import { serverThemeSnapshot, setTheme, subscribeTheme, themeSnapshot } from '@/lib/theme';

/* The paint library: every livery as a record. Selecting one repaints the
   garage objects and the environment's accent and surfaces. */
export default function PaintLibrary() {
  const current = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot).split('|')[0] as Livery;
  return (
    <div className="sys-registry-wrap">
      <table className="sys-registry">
        <caption className="sys-visually-hidden">Paint library — select a livery to repaint the environment and the garage</caption>
        <thead>
          <tr>
            <th scope="col">paint</th>
            <th scope="col">livery</th>
            <th scope="col">year</th>
            <th scope="col" className="sys-optional">chassis</th>
            <th scope="col" className="sys-optional">finish</th>
            <th scope="col">
              <span className="sys-visually-hidden">state</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {LIVERIES.map((id) => {
            const item = LIVERY_CATALOG[id];
            const selected = id === current;
            return (
              <tr key={id}>
                <td className="sys-cell-id">
                  <span className="sys-swatch" style={{ background: item.stripe }} aria-hidden="true" />
                </td>
                <td className="sys-cell-name">
                  <button type="button" className="sys-paint-button" aria-pressed={selected} onClick={() => setTheme(id)}>
                    {item.name}
                  </button>
                  <small>{item.description}</small>
                </td>
                <td className="sys-cell-mono">{item.year}</td>
                <td className="sys-cell-mono sys-optional">{item.chassis}</td>
                <td className="sys-cell-mono sys-optional">{item.finish.toLowerCase()}</td>
                <td className="sys-cell-mono">{selected ? <span className="sys-status" data-state="active">applied</span> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
