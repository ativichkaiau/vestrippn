'use client';

/* ════════════════════════════════════════════════════════════════════════
   W09 CURRENT MISSION — slim strip under each hub hero that answers
   "what should I care about right now?" in one glance.
   ════════════════════════════════════════════════════════════════════════ */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, hoverLift, pressTap, statePulse, telemetryLine } from './motionPresets';
import { useLowPower } from './useLowPower';

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
  completed = false,
}: {
  title: string;
  detail?: ReactNode;
  accent?: Accent;
  cta?: { label: string; href: string; external?: boolean };
  completed?: boolean;
}) {
  const a = ACCENTS[accent];
  const reduceMotion = useReducedMotion();
  const lowPower = useLowPower();
  const motionOff = Boolean(reduceMotion || lowPower);

  const ctaClass =
    'w09-magnetic w09-launch-button shrink-0 inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-95';

  return (
    <motion.section
      variants={motionOff ? undefined : fadeUp}
      initial={motionOff ? false : 'hidden'}
      animate={motionOff ? undefined : 'show'}
      whileHover={motionOff || completed ? undefined : hoverLift}
      whileTap={motionOff || completed ? undefined : pressTap}
      className={`relative flex flex-col gap-3 overflow-hidden rounded-[24px] border border-black/5 bg-white/60 p-4 pl-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-700 dark:border-white/5 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5 sm:pl-6 ${completed ? 'grayscale opacity-60' : ''}`}
      aria-label={completed ? 'Completed mission' : 'Current mission'}
      data-motion="mission"
      data-state={completed ? 'completed' : 'active'}
    >
      <motion.span variants={motionOff ? undefined : telemetryLine} className={`absolute inset-y-0 left-0 w-[4px] origin-top ${completed ? 'bg-neutral-400' : a.bar}`} />
      {!motionOff && !completed && <span className="w09-mission-scan" aria-hidden />}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <motion.span
            animate={completed ? undefined : statePulse(motionOff)}
            className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-neutral-400' : `${a.dot} animate-pulse`}`}
          />
          <span
            className={`w09-state text-[9px] font-black uppercase tracking-[0.25em] ${completed ? 'text-neutral-500 dark:text-neutral-400' : a.text}`}
            data-state={completed ? 'completed' : 'active'}
          >
            {completed ? 'Completed Mission' : 'Current Mission'}
          </span>
        </div>
        <h2 className={`mt-1.5 truncate text-[15px] font-black tracking-tight sm:text-[17px] ${completed ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
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
    </motion.section>
  );
}
