// Whether decorative motion may run: reduced motion and low power both stop it.
export function motionAllowed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    if (localStorage.getItem('vest_lowpower') === '1') return false;
  } catch {
    /* storage unavailable: fall through */
  }
  return true;
}
