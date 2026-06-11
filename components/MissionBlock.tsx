'use client';

/* ════════════════════════════════════════════════════════════════════════
   W09 CURRENT MISSION — slim strip under each hub hero that answers
   "what should I care about right now?" in one glance.
   ════════════════════════════════════════════════════════════════════════ */

import Link from 'next/link';
import type { ReactNode } from 'react';

type Accent = 'cyan' | 'amber' | 'rose' | 'purple' | 'emerald' | 'blue' | 'indigo' | 'teal' | 'sky';

const ACCENTS: Record<Accent, { bar: string; dot: string; text: string }> = {
  cyan: { bar: 'bg-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
  amber: { bar: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  rose: { bar: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  purple: { bar: 'bg-purple-500', dot: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  emerald: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  blue: { bar: 'bg-blue-500', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  indigo: { bar: 'bg-indigo-500', dot: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  teal: { bar: 'bg-teal-500', dot: 'bg-teal-500', text: 'text-teal-600 dark:text-teal-400' },
  sky: { bar: 'bg-sky-500', dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
};

export default function MissionBlock({
  title,
  detail,
  accent = 'cyan',
  cta,
}: {
  title: string;
  detail?: ReactNode;
  accent?: Accent;
  cta?: { label: string; href: string; external?: boolean };
}) {
  const a = ACCENTS[accent];

  const ctaClass =
    'shrink-0 inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-95';

  return (
    <section
      className="relative flex flex-col gap-3 overflow-hidden rounded-[24px] border border-black/5 bg-white/60 p-4 pl-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-700 dark:border-white/5 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5 sm:pl-6"
      aria-label="Current mission"
    >
      <span className={`absolute inset-y-0 left-0 w-[4px] ${a.bar}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${a.dot}`} />
          <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${a.text}`}>Current Mission</span>
        </div>
        <h2 className="mt-1.5 truncate text-[15px] font-black tracking-tight text-neutral-900 dark:text-white sm:text-[17px]">
          {title}
        </h2>
        {detail && (
          <p className="mt-0.5 text-[12px] font-medium leading-5 text-neutral-500 dark:text-neutral-400">{detail}</p>
        )}
      </div>
      {cta &&
        (cta.external ? (
          <a href={cta.href} target="_blank" rel="noopener noreferrer" className={ctaClass}>
            {cta.label}
          </a>
        ) : (
          <Link href={cta.href} className={ctaClass}>
            {cta.label}
          </Link>
        ))}
    </section>
  );
}
