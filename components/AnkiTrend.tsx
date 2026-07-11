'use client';

import { useState } from 'react';

interface Point { day: string; reviewedToday: number; streak: number; dueCards: number; }

// Compact "cards reviewed per day" bar sparkline. Single series → no legend
// (the heading names it); amber to match the Anki section. Reviews and streak
// are different scales, so streak is shown as a stat, never a second y-axis.
export default function AnkiTrend({ history }: { history: Point[] }) {
  const data = history.slice(-14);
  const [hover, setHover] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 px-4 py-6 text-center text-[12px] font-medium text-neutral-400 dark:border-white/10 dark:text-neutral-500">
        Your review trend builds here as Anki syncs each day.
      </div>
    );
  }

  const W = 300, H = 96;
  const padX = 6, padTop = 18, padBottom = 18;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const baseY = padTop + plotH;
  const max = Math.max(1, ...data.map((d) => d.reviewedToday));
  const slot = plotW / data.length;
  const barW = Math.max(4, slot * 0.6);

  const total = data.reduce((s, d) => s + d.reviewedToday, 0);
  const avg = Math.round(total / data.length);
  const dayLabel = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Reviews / day · last {data.length}</span>
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">avg {avg}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-amber-500 dark:text-amber-400" role="img" aria-label={`Anki cards reviewed per day, last ${data.length} days`}>
        {/* recessive baseline */}
        <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} className="stroke-black/10 dark:stroke-white/10" strokeWidth={1} />
        {data.map((d, i) => {
          const barH = (d.reviewedToday / max) * plotH;
          const x = padX + i * slot + (slot - barW) / 2;
          const y = baseY - barH;
          const active = hover === i;
          return (
            <g key={d.day}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} rx={2} fill="currentColor" opacity={hover === null || active ? 1 : 0.45} />
              {/* full-slot transparent hit target */}
              <rect x={padX + i * slot} y={padTop} width={slot} height={plotH + 6} fill="transparent"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
              {active && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="fill-neutral-900 dark:fill-white" fontSize={11} fontWeight={800}>{d.reviewedToday}</text>
              )}
            </g>
          );
        })}
        {/* first / last day labels only (recessive) */}
        <text x={padX} y={H - 5} className="fill-neutral-400 dark:fill-neutral-500" fontSize={9} fontWeight={700}>{dayLabel(data[0].day)}</text>
        <text x={W - padX} y={H - 5} textAnchor="end" className="fill-neutral-400 dark:fill-neutral-500" fontSize={9} fontWeight={700}>{dayLabel(data[data.length - 1].day)}</text>
        {hover !== null && (
          <text x={padX + hover * slot + slot / 2} y={H - 5} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400" fontSize={9} fontWeight={800}>{dayLabel(data[hover].day)}</text>
        )}
      </svg>
    </div>
  );
}
