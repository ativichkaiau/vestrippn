'use client';

// Native View Transitions helpers, shared by <ViewTransitions/> (which drives
// hub navigation) and SiteMotion (which yields its JS route animation when the
// browser will animate the route natively, so they don't double up).

type VTDocument = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
};

export function vtSupported(): boolean {
  return typeof document !== 'undefined' && typeof (document as VTDocument).startViewTransition === 'function';
}

export function motionAllowed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    if (localStorage.getItem('vest_lowpower') === '1') return false;
  } catch {
    /* ignore */
  }
  return true;
}

export function vtActive(): boolean {
  return vtSupported() && motionAllowed();
}

export function startViewTransition(cb: () => void | Promise<void>): void {
  (document as VTDocument).startViewTransition?.(cb);
}

// The active navigate-with-transition fn, published by <ViewTransitions/> so
// non-link navigations (e.g. the command palette's router.push) can opt in too.
type NavFn = (href: string) => void;
let activeNav: NavFn | null = null;

export function setVtNavigate(fn: NavFn | null): void {
  activeNav = fn;
}

export function vtNavigate(href: string, fallback: NavFn): void {
  (activeNav ?? fallback)(href);
}
