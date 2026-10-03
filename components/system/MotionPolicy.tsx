'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/* The site-wide motion policy for framer-motion components in the mounted
   hubs: no springs, no lifts, no travel. Transform animations resolve
   instantly; opacity still fades. New VESTRIPPN components use CSS motion
   from the tokens (120–220 ms) instead. */
export default function MotionPolicy({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="always" transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}>
      {children}
    </MotionConfig>
  );
}
