'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { routeTransition, routeVariants, w09Ease } from './motionPresets';
import { useLowPower } from './useLowPower';
import { vtActive } from '@/lib/view-transition';

export default function SiteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const lowPower = useLowPower();
  // When the browser drives the route change natively (View Transitions API),
  // stand down this JS route animation so the two don't double up.
  const [nativeVt, setNativeVt] = useState(false);
  useEffect(() => setNativeVt(vtActive()), []);
  const motionOff = Boolean(reduceMotion || lowPower || nativeVt);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="motion-route-shell w10-clay-shell"
        variants={routeVariants(motionOff)}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={routeTransition(motionOff)}
        data-motion-route
      >
        {!motionOff && (
          <motion.span
            aria-hidden
            className="w09-route-sweep"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 0.46, 0] }}
            transition={{ duration: 0.58, ease: w09Ease, times: [0, 0.42, 1] }}
          />
        )}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
