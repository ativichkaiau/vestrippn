import type { TargetAndTransition, Transition, Variants } from 'framer-motion';

export const w09Ease = [0.16, 1, 0.3, 1] as const;

export const w09Timing = {
  route: 0.42,
  reveal: 0.38,
  quick: 0.22,
  micro: 0.16,
  stagger: 0.07,
} as const;

export const w09Spring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.82,
};

export const w09QuickSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.72,
};

export function routeVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0.96 },
    };
  }

  return {
    initial: { opacity: 0, y: 12, scale: 0.998, filter: 'blur(2px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -10, scale: 0.998, filter: 'blur(2px)' },
  };
}

export function routeTransition(reduced: boolean): Transition {
  return {
    duration: reduced ? 0.08 : w09Timing.route,
    ease: w09Ease,
  };
}

export function staggerContainer(delayChildren: number = 0.06, staggerChildren: number = w09Timing.stagger): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        delayChildren,
        staggerChildren,
      },
    },
  };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: w09Timing.reveal, ease: w09Ease },
  },
};

export const softScale: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: w09Spring,
  },
};

export const slidePanel: Variants = {
  hidden: { opacity: 0, x: 18 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.44, ease: w09Ease },
  },
};

export const telemetryLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.56, ease: w09Ease },
  },
};

export const hoverLift: TargetAndTransition = {
  y: -4,
  scale: 1.01,
  boxShadow: '0 20px 48px rgba(0,0,0,0.10)',
  transition: w09QuickSpring,
};

export const magneticHover: TargetAndTransition = {
  y: -2,
  scale: 1.012,
  transition: w09QuickSpring,
};

export const pressTap: TargetAndTransition = {
  scale: 0.985,
  transition: { duration: w09Timing.micro, ease: w09Ease },
};

export function statePulse(reduced: boolean): TargetAndTransition {
  return reduced
    ? { opacity: 1 }
    : {
        opacity: [0.72, 1, 0.72],
        scale: [1, 1.08, 1],
        transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
      };
}
