'use client';

/* ════════════════════════════════════════════════════════════════════════
   W09 TELEMETRY TICK-UP — numbers count up (ease-out) when they enter the
   viewport. Non-numeric values render unchanged; "56.5%"-style values keep
   their decimals and suffix. Low-power and reduced-motion render statically.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';
import { useLowPower } from './useLowPower';

export default function TickNumber({
  value,
  duration = 1100,
  className,
}: {
  value: string | number;
  duration?: number;
  className?: string;
}) {
  const lowPower = useLowPower();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  const str = String(value);
  const match = str.match(/^(-?\d+(?:\.\d+)?)(.*)$/);

  useEffect(() => {
    if (!match || lowPower || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(null);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const target = parseFloat(match[1]);
    const decimals = (match[1].split('.')[1] || '').length;
    const suffix = match[2];
    let raf = 0;
    let started = false;

    setDisplay(`${(0).toFixed(decimals)}${suffix}`);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          if (p < 1) {
            setDisplay(`${(target * eased).toFixed(decimals)}${suffix}`);
            raf = requestAnimationFrame(tick);
          } else {
            setDisplay(null); // settle on the exact source value
          }
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [str, lowPower]);

  return (
    <span ref={ref} className={className}>
      {display ?? str}
    </span>
  );
}
