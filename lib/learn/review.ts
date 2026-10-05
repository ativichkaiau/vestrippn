/* ════════════════════════════════════════════════════════════════════════
   Spaced review for clinical cases.

   A finished run that went wrong — the patient died, or any choice was
   deadly even if the patient recovered — puts the case in your review
   queue for tomorrow. Each clean run after that moves it up a step
   (1 → 3 → 7 → 14 days); a clean run on the last step graduates it out of
   the queue, and another miss starts it again at 1 day. Cases you have
   never missed are never queued. Pure functions; the choice route stores
   the result in CaseReview.
   ════════════════════════════════════════════════════════════════════════ */

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14] as const;
/** Fired in the browser after a finished run, so review counts refresh. */
export const REVIEW_CHANGE_EVENT = 'vest:case-review';
const DAY = 86_400_000;

export type RunOutcome = 'optimal' | 'suboptimal' | 'deadly';
export type ReviewState = { step: number; dueAt: Date | null };

/** A finished run counts as a miss when the patient died or any choice was deadly. */
export function isMiss(status: 'survived' | 'died', path: { outcome: RunOutcome }[]): boolean {
  return status === 'died' || path.some((step) => step.outcome === 'deadly');
}

/**
 * The review state after a finished run, or null when nothing should be
 * stored (a clean run of a case that was never in the queue).
 * `dueAt: null` means graduated: kept for history, never due.
 */
export function nextReview(current: ReviewState | null, missed: boolean, now: Date): ReviewState | null {
  if (missed) return { step: 0, dueAt: new Date(now.getTime() + REVIEW_INTERVAL_DAYS[0] * DAY) };
  if (!current || current.dueAt === null) return current;
  const step = current.step + 1;
  if (step >= REVIEW_INTERVAL_DAYS.length) return { step, dueAt: null };
  return { step, dueAt: new Date(now.getTime() + REVIEW_INTERVAL_DAYS[step] * DAY) };
}

export function isDue(review: { dueAt: Date | string | null }, now: Date): boolean {
  return review.dueAt !== null && new Date(review.dueAt).getTime() <= now.getTime();
}
