'use client';

import { useState } from 'react';
import Mark3D from '../components/w100/Mark3D';
import { SkelLabel } from '../components/w100/Skeleton';

/* ════════════════════════════════════════════════════════════════════════
   W100 ROUTE LOADER — shown by Next while a hub route streams.

   The 3D mark on a turntable in the active livery, a run bar painted in the
   livery's own stripe, and a pit-wall channel label ticking through its
   sectors. The fun fact stays: it is content, not chrome.
   ════════════════════════════════════════════════════════════════════════ */

const FACTS = [
  'The human brain can process an entire image in as little as 13 milliseconds.',
  'A Formula 1 car can brake from 200 km/h to a standstill in about 4 seconds.',
  'PubMed indexes over 36 million biomedical citations.',
  'Spaced repetition can boost long-term retention by up to 200%.',
  'Your heart beats roughly 100,000 times every single day.',
  'An F1 crew can change all four tyres in under 2.5 seconds.',
  'Systematic reviews sit at the very top of the evidence pyramid.',
  'The brain uses about 20% of the body’s total energy.',
  'The first modern randomized controlled trial was published in 1948.',
  'The fastest F1 pit stop on record is 1.8 seconds — all four tyres changed.',
  'Retrieval practice — testing yourself — beats re-reading for long-term recall.',
  'Interleaving topics while you study outperforms blocking one subject at a time.',
  'Reading one paper a day adds up to 365 papers in a year.',
  'Focus tends to run in ~90-minute ultradian cycles — work with them.',
];

export default function Loading() {
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);

  return (
    <div
      role="status"
      aria-busy="true"
      className="fixed left-0 top-0 z-[300] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden px-8"
      style={{ background: 'var(--livery-canvas, var(--w85-canvas))', color: 'var(--livery-text)' }}
    >
      <span className="sr-only">Loading…</span>

      <div className="w100-loader-track lp-keep" aria-hidden="true"><span className="lp-keep" /></div>

      <Mark3D mode="spin" interactive={false} className="w100-loader-stage" label="" />

      <div className="mt-4 text-[clamp(18px,3.2vw,26px)] font-semibold tracking-[0.28em]" aria-hidden="true">
        VESTRIPPN
      </div>
      <SkelLabel label="W100 · Spooling route" className="mt-3" />

      <div className="mt-9 max-w-[440px] text-center">
        <div className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.3em]" style={{ color: 'var(--livery-muted)' }}>
          Fun fact
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--livery-muted)' }}>{fact}</p>
      </div>
    </div>
  );
}
