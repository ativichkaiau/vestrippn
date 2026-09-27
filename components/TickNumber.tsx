'use client';

/* ════════════════════════════════════════════════════════════════════════
   W100 TELEMETRY ODOMETER — numbers roll into place on real 3D digit drums
   when they enter the viewport, and roll forward again whenever the value
   changes. Each digit is a ten-faced drum (styles: app/w100.css,
   "ODOMETER"); the low places spin extra turns on the first roll, like an
   odometer catching up. "56.5%"-style values keep their decimals and suffix.

   Non-numeric values, low power and reduced motion render plain text. The
   drums are aria-hidden; screen readers get the value once, as text.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { useLowPower } from './useLowPower';

const FACES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const REDUCE = '(prefers-reduced-motion: reduce)';

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const motionSnapshot = () => !window.matchMedia(REDUCE).matches;
const serverMotion = () => false;

function Drum({ digit, place, rolled }: { digit: number; place: number; rolled: boolean }) {
  // Steps turned so far (the face showing is steps mod 10). Drums only ever
  // roll forward, so a change from 9 to 0 turns one step, not nine back.
  const [steps, setSteps] = useState(0);
  const stepsRef = useRef(0);
  const spun = useRef(false);

  useEffect(() => {
    if (!rolled) return;
    const current = stepsRef.current;
    const forward = (digit - (current % 10) + 10) % 10;
    const turns = spun.current ? 0 : place <= 0 ? 2 : place === 1 ? 1 : 0;
    spun.current = true;
    const next = current + forward + turns * 10;
    stepsRef.current = next;
    // A frame at the old angle first, so a freshly mounted drum still rolls.
    const frame = requestAnimationFrame(() => setSteps(next));
    return () => cancelAnimationFrame(frame);
  }, [digit, place, rolled]);

  return (
    <span className="w100-odo-slot">
      <span className="w100-odo-sizer">{digit}</span>
      <span className="w100-odo-drum" style={{ '--odo-steps': steps } as CSSProperties}>
        {FACES.map((face) => (
          <span key={face} className="w100-odo-face" style={{ '--odo-face': face } as CSSProperties}>{face}</span>
        ))}
      </span>
    </span>
  );
}

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
  const motion = useSyncExternalStore(subscribeToMotion, motionSnapshot, serverMotion);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [rolled, setRolled] = useState(false);

  const str = String(value);
  const match = str.match(/^(-?)(\d+)(?:\.(\d+))?(.*)$/);
  const live = Boolean(match) && motion && !lowPower;

  useEffect(() => {
    const el = ref.current;
    if (!live || !el || rolled) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setRolled(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [live, rolled]);

  if (!live || !match) {
    return (
      <span ref={ref} className={className}>
        {str}
      </span>
    );
  }

  const [, sign, whole, fraction = '', suffix] = match;
  // Keyed by place value, so the ones drum stays the ones drum when 9 → 10.
  const drums = (digits: string, placeOf: (index: number) => number) =>
    [...digits].map((char, index) => {
      const place = placeOf(index);
      return <Drum key={place} digit={Number(char)} place={place} rolled={rolled} />;
    });

  return (
    <span
      ref={ref}
      className={`w100-odo ${className ?? ''}`}
      style={{ '--odo-ms': `${duration}ms` } as CSSProperties}
    >
      <span className="sr-only">{str}</span>
      <span aria-hidden="true">
        {sign}
        {drums(whole, (index) => whole.length - 1 - index)}
        {fraction && '.'}
        {drums(fraction, (index) => -1 - index)}
        {suffix}
      </span>
    </span>
  );
}
