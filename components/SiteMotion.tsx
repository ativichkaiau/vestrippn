'use client';

import { useRef, useSyncExternalStore, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { routeTransition, routeVariants, w09Ease } from './motionPresets';
import { useLowPower } from './useLowPower';
import { usePageMotion } from './usePageMotion';
import AmbientCircuit from './AmbientCircuit';
import { vtSupported } from '@/lib/view-transition';

const subscribeToCapability = () => () => {};
const serverCapability = () => false;
const motionPreference = '(prefers-reduced-motion: reduce)';
const reducedMotionSnapshot = () => window.matchMedia(motionPreference).matches;
const serverReducedMotion = () => true;
function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(motionPreference);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export default function SiteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // React to preference changes too, so active reveals stop immediately.
  const reduceMotion = useSyncExternalStore(subscribeToMotionPreference, reducedMotionSnapshot, serverReducedMotion);
  const lowPower = useLowPower();
  // When the browser drives the route change natively (View Transitions API),
  // stand down this JS route animation so the two don't double up.
  const nativeVt = useSyncExternalStore(subscribeToCapability, vtSupported, serverCapability);
  const motionOff = Boolean(reduceMotion || lowPower);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionPage key={pathname} motionOff={motionOff} routeMotionOff={motionOff || nativeVt}>
        {children}
      </MotionPage>
    </AnimatePresence>
  );
}

// Mount with the keyed route, after AnimatePresence finishes the old exit.
// Native route transitions don't disable scrolling or idle motion in-page.
function MotionPage({ children, motionOff, routeMotionOff }: {
  children: ReactNode;
  motionOff: boolean;
  routeMotionOff: boolean;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  usePageMotion(shellRef, progressRef, motionOff);

  return (
    <motion.div
      ref={shellRef}
      className="motion-route-shell w10-clay-shell"
      variants={routeVariants(routeMotionOff)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={routeTransition(routeMotionOff)}
      data-motion-route
    >
      {!routeMotionOff && (
        <motion.span
          aria-hidden
          className="w09-route-sweep"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1], opacity: [0, 0.46, 0] }}
          transition={{ duration: 0.58, ease: w09Ease, times: [0, 0.42, 1] }}
        />
      )}
      <div aria-hidden="true" className="w85-motion-chrome">
        <AmbientCircuit />
        <span className="w85-final-scan" />
        <span className="w85-scroll-track"><span ref={progressRef} className="w85-scroll-fill" /></span>
      </div>
      {children}
    </motion.div>
  );
}
