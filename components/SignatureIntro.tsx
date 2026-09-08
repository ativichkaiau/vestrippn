'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLowPower } from './useLowPower';

const EASE = [0.16, 1, 0.3, 1] as const;
const INTRO_DURATION_MS = 3800;
const WORKSPACES = [
  { title: 'Study', detail: 'Cases & exams' },
  { title: 'Research', detail: 'Papers & evidence' },
  { title: 'Plan', detail: 'Tasks & priorities' },
];

export default function SignatureIntro({
  cycle,
  onComplete,
}: {
  cycle: string;
  onComplete: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();
  const lowPower = useLowPower();
  const motionOff = Boolean(reduceMotion || lowPower);
  const duration = motionOff ? 300 : INTRO_DURATION_MS;

  useEffect(() => {
    // A native modal keeps keyboard focus in the intro until the handoff.
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onComplete]);

  const reveal = (delay: number) => ({
    initial: motionOff ? false as const : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: motionOff ? 0 : delay, duration: motionOff ? 0 : 0.5, ease: EASE },
  });

  return (
    <motion.dialog
      ref={dialogRef}
      aria-labelledby="boot-title"
      aria-describedby="boot-description"
      onCancel={(event) => {
        event.preventDefault();
        onComplete();
      }}
      className="fixed inset-0 m-0 flex h-[100dvh] max-h-none w-screen max-w-none flex-col overflow-y-auto border-0 px-5 py-5 text-[color:var(--w09-text)] sm:px-10 sm:py-7"
      style={{ background: 'var(--w85-canvas, var(--w09-bg))' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: motionOff ? 0 : 0.35, ease: EASE }}
    >
      <div className="flex shrink-0 items-center justify-between gap-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--w09-text-muted)] sm:text-[10px]">
          Your personal workspace
        </span>
        <button
          type="button"
          onClick={onComplete}
          className="shrink-0 rounded-full border border-[color:var(--w09-border)] px-3 py-2 text-[11px] font-semibold transition-colors hover:bg-[var(--w09-surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--w09-focus-ring)]"
        >
          Enter workspace <span aria-hidden>↗</span>
        </button>
      </div>

      <div className="relative my-auto w-full max-w-xl shrink-0 self-center py-8 text-center sm:py-10">
        <motion.div
          className="relative mx-auto mb-7 grid h-24 w-24 place-items-center sm:mb-9"
          initial={motionOff ? false : { opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: motionOff ? 0 : 0.65, ease: EASE }}
        >
          <svg className="pointer-events-none absolute -inset-2 h-28 w-28" viewBox="0 0 112 112" fill="none" aria-hidden>
            <rect x="1" y="1" width="110" height="110" rx="32" stroke="var(--w09-border)" />
            <motion.rect
              x="1" y="1" width="110" height="110" rx="32"
              stroke="var(--hub-accent)"
              strokeWidth="1.5"
              initial={motionOff ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: motionOff ? 0 : 0.15, duration: motionOff ? 0 : 1.2, ease: EASE }}
            />
          </svg>
          <Image src="/vestrippn-logo.png" width={80} height={80} alt="" loading="eager" />
        </motion.div>

        <motion.h1
          id="boot-title"
          className="text-[clamp(1.6rem,5vw,3.25rem)] font-semibold leading-tight tracking-[0.16em]"
          {...reveal(0.2)}
        >
          VESTRIPPN
        </motion.h1>
        <motion.p
          id="boot-description"
          className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[color:var(--w09-text-muted)] sm:text-base"
          {...reveal(0.45)}
        >
          Clinical learning. Research. Everyday progress.
        </motion.p>

        <div className="mt-8 grid grid-cols-3 gap-2 border-y border-[color:var(--w09-border)] py-5 sm:mt-10 sm:gap-5 sm:py-6">
          {WORKSPACES.map((workspace, index) => (
            <motion.div key={workspace.title} className="min-w-0" {...reveal(0.7 + index * 0.18)}>
              <span className="font-mono text-[10px] tabular-nums" style={{ color: 'var(--hub-accent)' }}>
                0{index + 1}
              </span>
              <h2 className="mt-2 text-sm font-semibold">{workspace.title}</h2>
              <p className="mt-1 text-[10px] leading-4 text-[color:var(--w09-text-muted)] sm:text-xs">
                {workspace.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl shrink-0 self-center">
        <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--w09-text-muted)]">
          <span>{cycle.replaceAll('_', ' ')}</span>
          <span>Opening dashboard</span>
        </div>
        <div className="h-px overflow-hidden bg-[var(--w09-border)]" aria-hidden>
          <motion.div
            className="h-full origin-left"
            style={{ background: 'var(--hub-accent)' }}
            initial={motionOff ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: motionOff ? 0 : duration / 1000, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.dialog>
  );
}
