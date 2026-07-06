'use client';

import Link from 'next/link';
import { Fragment } from 'react';

/* ════════════════════════════════════════════════════════════════════════
   RESEARCH DAG — dashboard surface for the WilliamsLab research knowledge
   graph. Compact, on-brand view of the Brugada-syndrome epigenetics DAG:
   the core molecular axis + the seven causal layers (A→G). The full graph
   lives in the Research hub / WilliamsLab; this is the cockpit snapshot.
   ════════════════════════════════════════════════════════════════════════ */

const PROJECT_TITLE =
  'Molecular Epigenetic Regulation of Sodium-Channel Genes in Brugada Syndrome';

// SCN5A → Nav1.5 → INa → conduction → Brugada ECG / arrhythmia
const CORE_AXIS = ['SCN5A', 'Nav1.5', 'INa', 'Conduction', 'Type-1 ECG', 'Arrhythmia'];

const LAYERS: { k: string; label: string; n: number; color: string }[] = [
  { k: 'A', label: 'Genetic background', n: 5, color: '#94a3b8' },
  { k: 'B', label: 'Epigenetic regulation', n: 8, color: '#c084fc' },
  { k: 'C', label: 'Expression & channel', n: 2, color: '#38bdf8' },
  { k: 'D', label: 'Electrophysiology', n: 3, color: '#2dd4bf' },
  { k: 'E', label: 'Clinical phenotype', n: 9, color: '#f87171' },
  { k: 'F', label: 'Modifiers', n: 8, color: '#fbbf24' },
  { k: 'G', label: 'Measurement / assays', n: 5, color: '#9ca3af' },
];

const NODE_COUNT = LAYERS.reduce((sum, l) => sum + l.n, 0);

export default function ResearchDagCard() {
  return (
    // data-no-typewriter: this is a static data surface — keep the axis chips
    // and labels from being emptied by the hover-typewriter effect.
    <div className="flex-1 flex flex-col" data-no-typewriter>
      {/* project identity */}
      <div
        className="text-[9px] font-black uppercase tracking-[0.24em] mb-1.5"
        style={{ color: 'var(--hub-accent)' }}
      >
        WilliamsLab · Knowledge Graph
      </div>
      <h3 className="text-[13px] lg:text-[14px] font-black leading-snug tracking-tight text-neutral-900 dark:text-white mb-4">
        {PROJECT_TITLE}
      </h3>

      {/* core molecular axis */}
      <div className="mb-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.025] dark:bg-white/[0.04] px-3 py-3">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2">
          Core molecular axis
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
          {CORE_AXIS.map((node, i) => (
            <Fragment key={node}>
              <span
                className="rounded-md px-2 py-1 text-[10px] font-black tracking-tight text-neutral-800 dark:text-white"
                style={{
                  backgroundColor: 'rgba(var(--hub-accent-rgb), 0.12)',
                  border: '1px solid rgba(var(--hub-accent-rgb), 0.28)',
                }}
              >
                {node}
              </span>
              {i < CORE_AXIS.length - 1 && (
                <span className="text-[11px] font-black" style={{ color: 'var(--hub-accent)' }}>
                  →
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* causal layers A→G */}
      <div className="space-y-1.5 flex-1">
        {LAYERS.map((l) => (
          <div
            key={l.k}
            className="flex items-center gap-2.5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] px-2 py-1.5 transition-colors"
          >
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-black"
              style={{ backgroundColor: `${l.color}22`, color: l.color }}
            >
              {l.k}
            </span>
            <span className="flex-1 text-[12px] font-semibold text-neutral-700 dark:text-neutral-200 truncate">
              {l.label}
            </span>
            <span className="shrink-0 text-[10px] font-black tabular-nums text-neutral-400 dark:text-neutral-500">
              {l.n}
            </span>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {NODE_COUNT} nodes · 7 layers · acyclic
        </span>
        <Link
          href="/research"
          className="text-[10px] font-black uppercase tracking-widest hover:translate-x-0.5 transition-transform"
          style={{ color: 'var(--hub-accent)' }}
        >
          Open Research Hub →
        </Link>
      </div>
    </div>
  );
}
