'use client';

/* ════════════════════════════════════════════════════════════════════════
   BRUGADA DAG — interactive WilliamsLab knowledge graph.
   The Molecular Epigenetic Regulation of Sodium-Channel Genes in Brugada
   Syndrome graph, rendered as a layered, clickable node-graph. Click a node
   to highlight its connections and open a source panel (PubMed + WilliamsLab).
   Opened from the dashboard Research DAG card.
   ════════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Layer = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

const LAYERS: { id: Layer; name: string; color: string }[] = [
  { id: 'A', name: 'Genetic background', color: '#94a3b8' },
  { id: 'B', name: 'Epigenetic regulation', color: '#c084fc' },
  { id: 'C', name: 'Expression & channel', color: '#38bdf8' },
  { id: 'D', name: 'Electrophysiology', color: '#2dd4bf' },
  { id: 'E', name: 'Clinical phenotype', color: '#f87171' },
  { id: 'F', name: 'Modifiers', color: '#fbbf24' },
  { id: 'G', name: 'Measurement / assays', color: '#9ca3af' },
];
const LAYER_COLOR = Object.fromEntries(LAYERS.map((l) => [l.id, l.color])) as Record<Layer, string>;
const LAYER_NAME = Object.fromEntries(LAYERS.map((l) => [l.id, l.name])) as Record<Layer, string>;

type DagNode = { id: string; label: string; layer: Layer; pubmed: string };

const NODES: DagNode[] = [
  { id: 'ANC', label: 'SE-Asian ancestry', layer: 'A', pubmed: 'Brugada syndrome Southeast Asian genetics' },
  { id: 'SCN5Amut', label: 'SCN5A mutation', layer: 'A', pubmed: 'SCN5A mutation Brugada syndrome' },
  { id: 'H558R', label: 'SCN5A H558R', layer: 'A', pubmed: 'SCN5A H558R polymorphism Brugada' },
  { id: 'ENH', label: 'SCN10A–SCN5A enhancer', layer: 'A', pubmed: 'SCN10A SCN5A enhancer Brugada syndrome' },
  { id: 'OTHER', label: 'Other Na-channel genes', layer: 'A', pubmed: 'Brugada syndrome susceptibility genes SCN1B GPD1L' },

  { id: 'METH5', label: 'SCN5A methylation', layer: 'B', pubmed: 'SCN5A DNA methylation cardiac' },
  { id: 'METH10', label: 'SCN10A methylation', layer: 'B', pubmed: 'SCN10A DNA methylation regulation' },
  { id: 'K27me3', label: 'H3K27me3', layer: 'B', pubmed: 'H3K27me3 cardiac sodium channel' },
  { id: 'K4me3', label: 'H3K4me3', layer: 'B', pubmed: 'H3K4me3 cardiomyocyte gene expression' },
  { id: 'K27ac', label: 'H3K27ac', layer: 'B', pubmed: 'H3K27ac enhancer cardiac SCN5A' },
  { id: 'ACC', label: 'Chromatin accessibility', layer: 'B', pubmed: 'chromatin accessibility cardiomyocyte ATAC-seq' },
  { id: 'LOOP', label: 'Enhancer–promoter loop', layer: 'B', pubmed: 'enhancer promoter looping SCN5A' },
  { id: 'NCR', label: 'ncRNA / miRNA', layer: 'B', pubmed: 'microRNA SCN5A Nav1.5 regulation' },

  { id: 'mRNA', label: 'SCN5A mRNA', layer: 'C', pubmed: 'SCN5A mRNA expression cardiac' },
  { id: 'NAV', label: 'Nav1.5', layer: 'C', pubmed: 'Nav1.5 trafficking Brugada syndrome' },

  { id: 'INA', label: 'Sodium current INa', layer: 'D', pubmed: 'cardiac sodium current INa Brugada' },
  { id: 'CV', label: 'Conduction velocity', layer: 'D', pubmed: 'cardiac conduction velocity Brugada syndrome' },
  { id: 'RVOT', label: 'RVOT delay / gradient', layer: 'D', pubmed: 'right ventricular outflow tract conduction Brugada' },

  { id: 'PR', label: 'PR interval', layer: 'E', pubmed: 'PR interval Brugada syndrome' },
  { id: 'QRS', label: 'QRS duration', layer: 'E', pubmed: 'QRS duration Brugada syndrome' },
  { id: 'ST', label: 'Type-1 ST elevation', layer: 'E', pubmed: 'type 1 coved ST elevation Brugada' },
  { id: 'SPON', label: 'Spontaneous type 1', layer: 'E', pubmed: 'spontaneous type 1 Brugada prognosis' },
  { id: 'DRUG', label: 'Drug/fever type 1', layer: 'E', pubmed: 'drug induced type 1 Brugada ajmaline' },
  { id: 'VA', label: 'Ventricular arrhythmia', layer: 'E', pubmed: 'ventricular arrhythmia Brugada syndrome' },
  { id: 'SYN', label: 'Syncope', layer: 'E', pubmed: 'syncope Brugada syndrome risk' },
  { id: 'SCD', label: 'Sudden cardiac death', layer: 'E', pubmed: 'sudden cardiac death Brugada syndrome' },
  { id: 'BRS', label: 'Brugada Syndrome', layer: 'E', pubmed: 'Brugada syndrome diagnosis' },

  { id: 'FEVER', label: 'Fever', layer: 'F', pubmed: 'fever induced Brugada syndrome' },
  { id: 'CHAL', label: 'Na-blocker challenge', layer: 'F', pubmed: 'ajmaline flecainide challenge Brugada' },
  { id: 'QUIN', label: 'Quinidine', layer: 'F', pubmed: 'quinidine Brugada syndrome treatment' },
  { id: 'AUTO', label: 'Autonomic tone', layer: 'F', pubmed: 'autonomic vagal Brugada arrhythmia' },
  { id: 'SEX', label: 'Male sex', layer: 'F', pubmed: 'male predominance testosterone Brugada' },
  { id: 'AGE', label: 'Age', layer: 'F', pubmed: 'age risk stratification Brugada syndrome' },
  { id: 'CONF', label: 'Med/electrolyte confounders', layer: 'F', pubmed: 'Brugada phenocopy electrolyte medication' },
  { id: 'SHD', label: 'Structural HD exclusion', layer: 'F', pubmed: 'Brugada structural heart disease exclusion' },

  { id: 'IPSC', label: 'iPSC-CM model', layer: 'G', pubmed: 'iPSC cardiomyocyte SCN5A Brugada' },
  { id: 'PBMC', label: 'Blood methylation', layer: 'G', pubmed: 'PBMC blood DNA methylation biomarker' },
  { id: 'ECG12', label: '12-lead ECG', layer: 'G', pubmed: '12 lead ECG Brugada pattern' },
  { id: 'BIOM', label: 'Biomarker panel', layer: 'G', pubmed: 'Brugada syndrome biomarker panel' },
  { id: 'SEV', label: 'Clinical severity score', layer: 'G', pubmed: 'Brugada syndrome risk score' },
];

const EDGES: [string, string][] = [
  ['ANC', 'SCN5Amut'], ['ANC', 'H558R'], ['ANC', 'ENH'],
  ['ENH', 'K27ac'], ['ENH', 'LOOP'], ['ENH', 'METH10'],
  ['SCN5Amut', 'NAV'], ['SCN5Amut', 'mRNA'], ['H558R', 'NAV'], ['OTHER', 'NAV'],
  ['METH5', 'ACC'], ['METH5', 'mRNA'], ['METH10', 'LOOP'], ['K27me3', 'ACC'], ['K4me3', 'ACC'],
  ['K27ac', 'LOOP'], ['ACC', 'LOOP'], ['ACC', 'mRNA'], ['LOOP', 'mRNA'], ['NCR', 'mRNA'], ['NCR', 'NAV'],
  ['mRNA', 'NAV'],
  ['NAV', 'INA'], ['INA', 'CV'], ['INA', 'RVOT'], ['CV', 'RVOT'],
  ['CV', 'PR'], ['CV', 'QRS'], ['RVOT', 'ST'], ['ST', 'SPON'], ['ST', 'DRUG'],
  ['SPON', 'VA'], ['SPON', 'SCD'], ['SPON', 'BRS'], ['DRUG', 'BRS'], ['VA', 'SYN'], ['VA', 'SCD'], ['SYN', 'SCD'],
  ['FEVER', 'INA'], ['FEVER', 'DRUG'], ['CHAL', 'INA'], ['CHAL', 'DRUG'], ['AUTO', 'ST'], ['AUTO', 'VA'],
  ['SEX', 'ST'], ['SEX', 'VA'], ['AGE', 'SCD'], ['CONF', 'ST'], ['QUIN', 'VA'], ['SHD', 'BRS'],
  ['NAV', 'IPSC'], ['INA', 'IPSC'], ['METH5', 'PBMC'], ['NCR', 'PBMC'], ['PR', 'ECG12'], ['QRS', 'ECG12'],
  ['ST', 'ECG12'], ['PBMC', 'BIOM'], ['BRS', 'SEV'], ['VA', 'SEV'], ['SCD', 'SEV'], ['BIOM', 'SEV'],
];

const NODE_W = 150;
const NODE_H = 42;
const ROW_H = 120;
const PAD_TOP = 40;
const GAP = 26;

export default function BrugadaDag({ onClose }: { onClose: () => void }) {
  const [sel, setSel] = useState<string | null>(null);

  const { pos, width, height } = useMemo(() => {
    const byLayer = new Map<Layer, DagNode[]>();
    for (const n of NODES) {
      const arr = byLayer.get(n.layer) ?? [];
      arr.push(n);
      byLayer.set(n.layer, arr);
    }
    const maxRow = Math.max(...LAYERS.map((l) => byLayer.get(l.id)?.length ?? 0));
    const w = Math.max(920, maxRow * (NODE_W + GAP));
    const p = new Map<string, { x: number; y: number }>();
    LAYERS.forEach((l, li) => {
      const arr = byLayer.get(l.id) ?? [];
      arr.forEach((n, ni) => {
        p.set(n.id, { x: ((ni + 0.5) / arr.length) * w, y: PAD_TOP + li * ROW_H + ROW_H / 2 });
      });
    });
    return { pos: p, width: w, height: PAD_TOP + LAYERS.length * ROW_H };
  }, []);

  const connected = useMemo(() => {
    const set = new Set<string>();
    if (sel) {
      set.add(sel);
      for (const [a, b] of EDGES) {
        if (a === sel) set.add(b);
        if (b === sel) set.add(a);
      }
    }
    return set;
  }, [sel]);

  const selNode = sel ? NODES.find((n) => n.id === sel) ?? null : null;
  const neighbours = selNode
    ? NODES.filter((n) => n.id !== sel && connected.has(n.id))
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[#07090c]/95 text-white backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Brugada knowledge graph">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: 'var(--hub-accent)' }}>
            WilliamsLab · Knowledge Graph
          </div>
          <h2 className="truncate text-[15px] font-black tracking-tight sm:text-lg">
            Molecular Epigenetic Regulation of Sodium-Channel Genes in Brugada Syndrome
          </h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-neutral-200 transition-colors hover:bg-white/10"
        >
          Close ✕
        </button>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-2.5 text-[10px] font-bold sm:px-8">
        {LAYERS.map((l) => (
          <span key={l.id} className="inline-flex items-center gap-1.5 text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.id} · {l.name}
          </span>
        ))}
        <span className="ml-auto hidden text-neutral-500 sm:inline">Click a node to trace its connections + sources</span>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* graph (scrollable) */}
        <div className="custom-scrollbar flex-1 overflow-auto p-6" onClick={() => setSel(null)}>
          <div className="relative" style={{ width, height }}>
            {/* edges */}
            <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
              {EDGES.map(([a, b], i) => {
                const p1 = pos.get(a);
                const p2 = pos.get(b);
                if (!p1 || !p2) return null;
                const active = sel != null && (a === sel || b === sel);
                const dim = sel != null && !active;
                const dy = (p2.y - p1.y) * 0.42;
                const y1 = p1.y + NODE_H / 2;
                const y2 = p2.y - NODE_H / 2;
                return (
                  <path
                    key={i}
                    d={`M ${p1.x} ${y1} C ${p1.x} ${y1 + dy} ${p2.x} ${y2 - dy} ${p2.x} ${y2}`}
                    fill="none"
                    stroke={active ? 'var(--hub-accent)' : '#ffffff'}
                    strokeWidth={active ? 2 : 1}
                    strokeOpacity={active ? 0.9 : dim ? 0.05 : 0.14}
                  />
                );
              })}
            </svg>

            {/* nodes */}
            {NODES.map((n) => {
              const p = pos.get(n.id);
              if (!p) return null;
              const isSel = n.id === sel;
              const isNbr = !isSel && connected.has(n.id);
              const dim = sel != null && !isSel && !isNbr;
              const color = LAYER_COLOR[n.layer];
              return (
                <button
                  key={n.id}
                  onClick={(e) => { e.stopPropagation(); setSel(isSel ? null : n.id); }}
                  title={n.label}
                  className="absolute grid place-items-center rounded-xl border px-2 text-center text-[11px] font-bold leading-tight transition-all duration-200"
                  style={{
                    left: p.x - NODE_W / 2,
                    top: p.y - NODE_H / 2,
                    width: NODE_W,
                    height: NODE_H,
                    borderColor: isSel || isNbr ? color : 'rgba(255,255,255,0.12)',
                    background: isSel ? `${color}2e` : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    opacity: dim ? 0.28 : 1,
                    boxShadow: isSel ? `0 0 0 2px ${color}, 0 8px 24px ${color}55` : undefined,
                  }}
                >
                  <span className="truncate">{n.label}</span>
                  <span className="absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[8px] font-black" style={{ background: color, color: '#0b0f14' }}>
                    {n.layer}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* detail panel */}
        {selNode && (
          <div className="w-full max-w-[340px] shrink-0 overflow-y-auto border-l border-white/10 bg-black/40 p-5 sm:w-[340px]">
            <div className="mb-1 inline-flex items-center gap-2 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: `${LAYER_COLOR[selNode.layer]}22`, color: LAYER_COLOR[selNode.layer] }}>
              {selNode.layer} · {LAYER_NAME[selNode.layer]}
            </div>
            <h3 className="text-[19px] font-black tracking-tight">{selNode.label}</h3>

            <div className="mt-4 space-y-2">
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(selNode.pubmed)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[12px] font-bold transition-colors hover:border-white/25 hover:bg-white/[0.1]"
              >
                <span>🔎 PubMed sources</span>
                <span className="text-neutral-400">↗</span>
              </a>
              <a
                href="https://williamslab.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-[12px] font-bold transition-colors hover:border-white/25 hover:bg-white/[0.1]"
              >
                <span>🔬 Open in WilliamsLab</span>
                <span className="text-neutral-400">↗</span>
              </a>
            </div>

            {neighbours.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                  Connected ({neighbours.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {neighbours.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSel(n.id)}
                      className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[10.5px] font-bold text-neutral-200 transition-colors hover:border-white/25"
                      style={{ borderLeft: `3px solid ${LAYER_COLOR[n.layer]}` }}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
