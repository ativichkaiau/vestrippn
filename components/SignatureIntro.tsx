'use client';

import { motion, useReducedMotion } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════════════
   W85 BOOT — the minimal intro.

   Replaces the W12 cockpit sequence (traced mark, radial bloom, grid floor,
   HUD chrome, 7s runtime) and the four per-livery cinematics. Mark 85 read as
   restraint: a matte ground, one accent hairline, the wordmark, and out —
   under two seconds. Livery-agnostic; it tints itself from --hub-accent, so
   every skin gets the same quiet boot instead of its own set piece.
   ════════════════════════════════════════════════════════════════════════ */

export type IntroLivery = 'normal' | 'monza' | 'senna' | 'verstappen' | 'ferrari';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function SignatureIntro({ cycle }: { livery?: IntroLivery; cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const d = (s: number) => (reduce ? 0 : s);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ background: 'var(--w85-canvas)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.01 : 0.45, ease: EASE } }}
      aria-label="VESTRIPPN booting"
    >
      {/* the single ornament: an accent hairline that draws, then holds */}
      <motion.span
        aria-hidden
        className="h-px w-[clamp(120px,22vw,240px)] origin-center"
        style={{ background: 'var(--hub-accent)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: d(0.05), duration: reduce ? 0.01 : 0.55, ease: EASE }}
      />

      <motion.div
        className="mt-6 text-[clamp(22px,4.4vw,40px)] font-semibold tracking-[0.28em] text-neutral-900 dark:text-white"
        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: d(0.32), duration: reduce ? 0.01 : 0.5, ease: EASE }}
      >
        VESTRIPPN
      </motion.div>

      <motion.div
        className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.42em] text-neutral-400 dark:text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(0.52), duration: reduce ? 0.01 : 0.45, ease: EASE }}
      >
        W85
      </motion.div>

      {/* cycle read-out, bottom edge — the only telemetry that survives */}
      <motion.div
        className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-300 dark:text-neutral-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(0.7), duration: reduce ? 0.01 : 0.4 }}
      >
        {cycle.replace('_', ' ').toLowerCase()}
      </motion.div>
    </motion.div>
  );
}
