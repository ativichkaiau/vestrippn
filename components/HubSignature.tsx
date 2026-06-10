'use client';

/* ════════════════════════════════════════════════════════════════════════
   W09 HUB SIGNATURES — one small, precise motion motif per hub, rendered
   in the HubIntro side panel. Keyframes live in globals.css behind
   prefers-reduced-motion; low-power mode freezes them automatically.

   academics → milestone sweep · research → search beam · fitness → ECG
   tools → launch pad · archive → vault scan · identity → radar sweep
   ielts → card stack
   ════════════════════════════════════════════════════════════════════════ */

export type HubKey = 'academics' | 'research' | 'fitness' | 'tools' | 'archive' | 'identity' | 'ielts';

const COLORS: Record<HubKey, string> = {
  academics: '#60a5fa',
  research: '#22d3ee',
  fitness: '#fb7185',
  tools: '#fbbf24',
  archive: '#c084fc',
  identity: '#2dd4bf',
  ielts: '#818cf8',
};

export default function HubSignature({ hub }: { hub: HubKey }) {
  const c = COLORS[hub];

  if (hub === 'academics') {
    return (
      <span className="w09-sig" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full" style={{ backgroundColor: `${c}33` }} />
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute top-1/2 h-[6px] w-[6px] -translate-y-1/2 rotate-45 rounded-[1px]"
            style={{ left: 8 + i * 19, backgroundColor: `${c}88` }}
          />
        ))}
        <span
          className="w09-sig-sweep absolute left-0 h-[2px] w-4 rounded-full"
          style={{ top: 'calc(50% - 1px)', backgroundColor: c, boxShadow: `0 0 8px ${c}` }}
        />
      </span>
    );
  }

  if (hub === 'research') {
    return (
      <span className="w09-sig" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute bottom-[3px] w-[5px] rounded-sm"
            style={{ left: 5 + i * 11, height: 5 + ((i * 3) % 8), backgroundColor: `${c}55` }}
          />
        ))}
        <span
          className="w09-sig-beam absolute bottom-0 left-1 top-0 w-[2px] rounded-full"
          style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
        />
      </span>
    );
  }

  if (hub === 'fitness') {
    return (
      <span className="w09-sig" aria-hidden>
        <svg viewBox="0 0 58 18" className="absolute inset-0 h-full w-full">
          <path
            d="M0,9 H14 L18,9 22,3 26,15 30,9 H58"
            fill="none"
            stroke={c}
            strokeWidth="1.6"
            pathLength={100}
            className="w09-sig-ecg"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (hub === 'tools') {
    return (
      <span className="w09-sig w09-sig-launch" aria-hidden>
        <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full" style={{ backgroundColor: `${c}44` }} />
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute bottom-[4px] h-[5px] w-[5px] rounded-full" style={{ left: 14 + i * 14, backgroundColor: c }} />
        ))}
      </span>
    );
  }

  if (hub === 'archive') {
    return (
      <span className="w09-sig" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute inset-x-1 h-[3px] rounded-full" style={{ top: 2 + i * 6, backgroundColor: `${c}44` }} />
        ))}
        <span
          className="w09-sig-scan absolute inset-x-0 top-[1px] h-[2px] rounded-full"
          style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
        />
      </span>
    );
  }

  if (hub === 'identity') {
    return (
      <span className="w09-sig" style={{ width: 18 }} aria-hidden>
        <span className="absolute inset-0 rounded-full border" style={{ borderColor: `${c}55` }} />
        <span
          className="w09-sig-radar absolute inset-[2px] rounded-full"
          style={{ background: `conic-gradient(from 0deg, ${c}cc 0deg, transparent 80deg, transparent 360deg)` }}
        />
      </span>
    );
  }

  // ielts — card stack
  return (
    <span className="w09-sig w09-sig-cards" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute bottom-[2px] h-[12px] w-[9px] rounded-[2px] border"
          style={{ left: 12 + i * 13, borderColor: `${c}aa`, backgroundColor: `${c}22` }}
        />
      ))}
    </span>
  );
}
