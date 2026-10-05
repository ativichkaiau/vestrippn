import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { captureError } from '@/lib/log';
import { rateLimit, type RateLimitResult } from '@/lib/rate-limit';

/* ════════════════════════════════════════════════════════════════════════
   The shared rate limiter: one fixed window per key, counted in Postgres
   so every serverless instance sees the same count.

   One atomic upsert per call: a fresh or expired window restarts at 1,
   otherwise the count goes up. The database clock decides when a window
   ends, so instances never disagree about it. Keys are SHA-256 hashed
   before they are stored: they contain addresses and emails.

   If the database is unreachable the in-memory limiter answers instead,
   so an outage weakens the limit rather than locking everyone out.
   ════════════════════════════════════════════════════════════════════════ */

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; retry_ms: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${hashKey(key)}, 1, NOW() + (${windowMs}::integer * INTERVAL '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
      RETURNING "count", (EXTRACT(EPOCH FROM ("resetAt" - NOW())) * 1000)::integer AS retry_ms`;
    const { count, retry_ms } = rows[0];
    // Expired windows are dead rows; sweep them now and then, off the hot path.
    if (Math.random() < 0.02) void prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < NOW()`.catch(() => {});
    const ok = count <= limit;
    return { ok, remaining: Math.max(0, limit - count), retryAfterSec: ok ? 0 : Math.max(1, Math.ceil(retry_ms / 1000)) };
  } catch (error) {
    captureError('rate-limit', error);
    return rateLimit(key, limit, windowMs);
  }
}
