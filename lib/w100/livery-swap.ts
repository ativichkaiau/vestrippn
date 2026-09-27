'use client';

import { LIVERY_CATALOG, type Livery, type Mode } from '../liveries';
import { setTheme } from '../theme';
import { vtActive } from '../view-transition';

/**
 * W100 live swap — committing a livery repaints the whole app as one event.
 *
 * The current cockpit recedes into depth while the new livery wipes across
 * on its own 114° stripe angle, with the incoming team colours streaking
 * along the wipe front (styles: app/w100.css, "LIVE LIVERY SWAP").
 *
 * Uses the View Transitions API on the root, so the old frame is a real
 * snapshot and the new one is the live, already-recoloured page. Where view
 * transitions are unavailable, or motion is reduced or in low power, the
 * livery applies instantly — the same outcome, just without the event.
 */
type ViewTransition = { finished: Promise<void>; skipTransition?: () => void };
type VTDocument = Document & { startViewTransition?: (update: () => void) => ViewTransition };

let inFlight: ViewTransition | null = null;

export function swapLivery(livery: Livery, mode?: Mode): Promise<void> {
  const doc = document as VTDocument;
  const root = document.documentElement;
  if (!vtActive() || typeof doc.startViewTransition !== 'function') {
    setTheme(livery, mode);
    return Promise.resolve();
  }
  // A second pick mid-sweep finishes the first immediately, then sweeps again.
  inFlight?.skipTransition?.();

  root.style.setProperty('--w100-swap-stripe', LIVERY_CATALOG[livery].stripe);
  root.classList.add('w100-livery-swap');
  const transition = doc.startViewTransition(() => setTheme(livery, mode));
  inFlight = transition;
  return transition.finished
    .catch(() => {})
    .finally(() => {
      if (inFlight !== transition) return; // a newer sweep owns the root now
      inFlight = null;
      root.classList.remove('w100-livery-swap');
      root.style.removeProperty('--w100-swap-stripe');
    });
}
