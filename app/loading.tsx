'use client';

import { useState } from 'react';

/* ════════════════════════════════════════════════════════════════════════
   W85 ROUTE LOADER — shown by Next while a hub route streams.

   Same language as the W85 boot (components/SignatureIntro.tsx): matte
   ground, one accent hairline, restrained type. The W12 loader's spinning
   "3" coin, conic HUD ring, orbiting dot, perspective grid floor and glow
   pulse are retired. The fun fact stays — it is the one part that was
   content rather than chrome.
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
      className="fixed left-0 top-0 z-[300] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden px-8"
      style={{ background: 'var(--w85-canvas)' }}
    >
      <style>{`
        @keyframes w85Sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        @media (prefers-reduced-motion: reduce) {
          .w85-sweep { animation: none !important; transform: none !important; width: 100% !important; opacity: 0.5; }
        }
      `}</style>

      <div
        className="text-[clamp(18px,3.2vw,26px)] font-semibold tracking-[0.28em] text-neutral-900 dark:text-white"
      >
        VESTRIPPN
      </div>

      <div className="mt-3 font-mono text-[9px] font-medium uppercase tracking-[0.42em] text-neutral-400 dark:text-neutral-500">
        W85
      </div>

      <div className="mt-10 max-w-[440px] text-center">
        <div className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600">
          Fun fact
        </div>
        <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">{fact}</p>
      </div>

      {/* the one moving part: a thin indeterminate accent sweep */}
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-black/5 dark:bg-white/10">
        <div
          className="lp-keep w85-sweep h-full w-1/4"
          style={{ background: 'var(--hub-accent)', animation: 'w85Sweep 1.2s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}
