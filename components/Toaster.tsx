'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { onToast, type Toast } from '@/lib/toast-bus';
import { useLowPower } from './useLowPower';

// Semantic accents. `default` / `success` ride the livery --hub-accent so toasts
// recolor with the theme; warn/error stay universal so alarms read the same.
const VARIANT: Record<NonNullable<Toast['variant']>, { bar: string; chip: string; icon: string }> = {
  default: { bar: 'var(--hub-accent)', chip: 'rgba(var(--hub-accent-rgb), 0.14)', icon: '›' },
  success: { bar: 'var(--hub-accent)', chip: 'rgba(var(--hub-accent-rgb), 0.16)', icon: '✓' },
  warn: { bar: '#f59e0b', chip: 'rgba(245, 158, 11, 0.16)', icon: '!' },
  error: { bar: '#ef4444', chip: 'rgba(239, 68, 68, 0.16)', icon: '✕' },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const lowPower = useLowPower();
  const motionOff = Boolean(reduce || lowPower);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const clearTimer = (id: string) => {
      const t = timers.current.get(id);
      if (t) {
        clearTimeout(t);
        timers.current.delete(id);
      }
    };
    const remove = (id: string) => {
      clearTimer(id);
      setToasts((list) => list.filter((t) => t.id !== id));
    };
    const add = (t: Toast) => {
      setToasts((list) => [...list.filter((x) => x.id !== t.id), t].slice(-4));
      clearTimer(t.id);
      if (t.duration && t.duration > 0) {
        timers.current.set(
          t.id,
          setTimeout(() => remove(t.id), t.duration),
        );
      }
    };
    const off = onToast(add, remove);
    return () => {
      off();
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  const remove = (id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((x) => x.id !== id));
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2.5 px-4 pb-24 sm:items-end sm:pb-6 sm:pr-6 lg:pb-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={!motionOff}>
        {toasts.map((t) => {
          const v = VARIANT[t.variant ?? 'default'];
          return (
            <motion.div
              key={t.id}
              layout={!motionOff}
              initial={motionOff ? false : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={motionOff ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="pointer-events-auto relative w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0f12]/90"
              role="status"
            >
              <span className="absolute inset-y-0 left-0 w-1" style={{ background: v.bar }} />
              <div className="flex items-start gap-3 py-3 pl-4 pr-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black leading-none"
                  style={{ background: v.chip, color: v.bar }}
                  aria-hidden
                >
                  {t.icon ?? v.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold leading-snug tracking-tight text-neutral-900 dark:text-white">
                    {t.title}
                  </div>
                  {t.message && (
                    <div className="mt-0.5 text-[12px] leading-snug text-neutral-500 dark:text-neutral-400">
                      {t.message}
                    </div>
                  )}
                  {t.action && (
                    <button
                      onClick={() => {
                        t.action!.run();
                        remove(t.id);
                      }}
                      className="mt-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest transition-transform active:scale-95"
                      style={{ background: v.chip, color: v.bar }}
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss"
                  className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                >
                  <span className="text-[13px] leading-none">✕</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
