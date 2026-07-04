'use client';

import { useState } from 'react';

/* Futuristic route-transition loader: a spinning V disc, a livery-aware HUD
   ring, and a rotating fun fact. Shown by Next while a hub route streams. */

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
  'Mercedes’ W10 won 15 of 21 Grands Prix across the 2019 season.',
  'Mercedes’ W11 took 13 wins and 15 poles in 2020 — the most dominant Silver Arrow ever.',
  'The Silver Arrows got their name in 1934, when stripping white paint left bare aluminum.',
  'Reading one paper a day adds up to 365 papers in a year.',
  'Focus tends to run in ~90-minute ultradian cycles — work with them.',
];

export default function Loading() {
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);

  return (
    <div
      className="fixed left-0 top-0 z-[300] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden text-white"
      style={{ background: 'var(--hub-bg)' }}
    >
      <style>{`
        @keyframes vestVCoin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
        @keyframes vestOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes vestRing  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes vestGlow  { 0%,100% { opacity: 0.45; } 50% { opacity: 1; } }
        @keyframes vestSweep { 0% { transform: translateX(-110%); } 100% { transform: translateX(360%); } }
        @keyframes vestGrid  { from { background-position: 0 0; } to { background-position: 0 44px; } }
        @keyframes vestRise  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 42%, rgba(var(--hub-accent-rgb),0.18), transparent 46%), linear-gradient(180deg, var(--hub-bg), #020406 70%, #000)',
        }}
      />
      <div
        className="lp-keep pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          transform: 'perspective(420px) rotateX(64deg)',
          maskImage: 'linear-gradient(180deg, transparent, #000 75%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 75%)',
          opacity: 0.14,
          animation: 'vestGrid 3.2s linear infinite',
        }}
      />

      {/* spinning V + HUD ring */}
      <div className="relative grid h-[150px] w-[150px] place-items-center" style={{ perspective: '600px' }}>
        {/* outer rotating ring */}
        <div
          className="lp-keep absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(var(--hub-accent-rgb),0.85) 60deg, transparent 140deg, transparent 360deg)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            animation: 'vestRing 1.4s linear infinite',
          }}
        />
        {/* inner thin static ring */}
        <div className="absolute inset-[14px] rounded-full border" style={{ borderColor: 'rgba(var(--hub-accent-rgb),0.18)' }} />
        {/* orbiting dot */}
        <div className="lp-keep absolute inset-0" style={{ animation: 'vestOrbit 2.8s linear infinite' }}>
          <span
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full"
            style={{ background: 'rgb(var(--hub-accent-rgb))', boxShadow: '0 0 12px rgba(var(--hub-accent-rgb),0.9)' }}
          />
        </div>
        {/* V coin */}
        <div
          className="lp-keep font-revolut grid h-[84px] w-[84px] place-items-center rounded-[26px] text-[40px] font-bold text-white"
          style={{
            background: 'linear-gradient(145deg, color-mix(in srgb, rgb(var(--hub-accent-rgb)) 78%, #fff 22%), color-mix(in srgb, rgb(var(--hub-accent-rgb)) 70%, #000 30%))',
            boxShadow: '0 12px 30px -8px rgba(var(--hub-accent-rgb),0.5), inset 0 2px 2px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.35)',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            transformStyle: 'preserve-3d',
            animation: 'vestVCoin 2.2s cubic-bezier(0.65,0,0.35,1) infinite',
          }}
        >
          V
        </div>
      </div>

      {/* label */}
      <div
        className="mt-9 font-mono text-[10px] font-black uppercase tracking-[0.42em]"
        style={{ color: 'rgb(var(--hub-accent-rgb))', animation: 'vestGlow 1.8s ease-in-out infinite' }}
      >
        Spooling cockpit
      </div>

      {/* fun fact */}
      <div className="mt-7 max-w-[440px] px-8 text-center" style={{ animation: 'vestRise 0.6s ease-out both', animationDelay: '0.15s' }}>
        <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.34em] text-white/40">Fun fact</div>
        <p className="text-[14px] font-medium leading-relaxed text-white/80">{fact}</p>
      </div>

      {/* indeterminate loader bar */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-white/10">
        <div
          className="lp-keep h-full w-1/3 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--hub-accent-rgb)), transparent)', animation: 'vestSweep 1.1s ease-in-out infinite' }}
        />
      </div>
    </div>
  );
}
