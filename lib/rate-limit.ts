/* ════════════════════════════════════════════════════════════════════════
   A small fixed-window rate limiter for sign-in and sign-up.

   In memory, per server instance: on serverless each warm instance counts
   separately, so this blunts brute force and scripted sign-ups rather than
   guaranteeing a global cap. Keys are hashed-ish strings (ip + purpose);
   nothing is persisted.
   ════════════════════════════════════════════════════════════════════════ */

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();
const MAX_KEYS = 5000;

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  let entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    if (windows.size >= MAX_KEYS) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
      if (windows.size >= MAX_KEYS) windows.delete(windows.keys().next().value as string);
    }
    entry = { count: 0, resetAt: now + windowMs };
    windows.set(key, entry);
  }
  entry.count += 1;
  const ok = entry.count <= limit;
  return { ok, remaining: Math.max(0, limit - entry.count), retryAfterSec: ok ? 0 : Math.ceil((entry.resetAt - now) / 1000) };
}

/** The caller's address as the platform reports it (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Test seam: forget every window. */
export function resetRateLimits(): void {
  windows.clear();
}
