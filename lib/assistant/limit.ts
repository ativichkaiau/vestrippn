import { prisma } from '@/lib/prisma';

/* ════════════════════════════════════════════════════════════════════════
   One budget for the assistant, whichever mode answers: hub context
   (/api/assistant) or your sources (/api/das/chat). A sliding window over
   AssistantUsage rows — count requests newer than (now − window).

   The limit preserves API credits. Override per deployment with
   ASSISTANT_RATE_LIMIT (requests) and ASSISTANT_RATE_WINDOW_HOURS.
   ════════════════════════════════════════════════════════════════════════ */

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_HOURS = 5;

function positive(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function rateLimit(): number {
  return Math.floor(positive(process.env.ASSISTANT_RATE_LIMIT, DEFAULT_LIMIT));
}

export function rateWindowMs(): number {
  return positive(process.env.ASSISTANT_RATE_WINDOW_HOURS, DEFAULT_WINDOW_HOURS) * 60 * 60 * 1000;
}

/** The model both modes use. Configurable in Vercel without a code change. */
export function assistantModel(): string {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}

export function assistantConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export type LimitState = {
  used: number;
  limit: number;
  windowHours: number;
  /** When the oldest request in the window ages out; null when below the limit. */
  resetAt: string | null;
  allowed: boolean;
};

export async function limitState(userId: string): Promise<LimitState> {
  const limit = rateLimit();
  const windowMs = rateWindowMs();
  const recent = await prisma.assistantUsage.findMany({
    where: { userId, createdAt: { gte: new Date(Date.now() - windowMs) } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });
  const allowed = recent.length < limit;
  return {
    used: recent.length,
    limit,
    windowHours: windowMs / 3_600_000,
    resetAt: allowed || !recent[0] ? null : new Date(recent[0].createdAt.getTime() + windowMs).toISOString(),
    allowed,
  };
}

/** Count a request once generation has actually started. Prunes aged rows. */
export async function recordRequest(userId: string, model: string): Promise<string> {
  const row = await prisma.assistantUsage.create({ data: { userId, model }, select: { id: true } });
  prisma.assistantUsage
    .deleteMany({ where: { userId, createdAt: { lt: new Date(Date.now() - rateWindowMs()) } } })
    .catch(() => {
      /* best-effort cleanup; never block a response */
    });
  return row.id;
}

// Approximate OpenAI prices (USD per 1M tokens). Unknown models store token
// counts with costUsd left null.
const PRICE_PER_1M: Record<string, { in: number; out: number }> = {
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-4o': { in: 2.5, out: 10.0 },
};

export function estimateCostUsd(model: string, promptTokens: number, completionTokens: number): number | null {
  const price = PRICE_PER_1M[model];
  return price ? (promptTokens * price.in + completionTokens * price.out) / 1_000_000 : null;
}

/** Attach token counts and cost to a recorded request (best-effort). */
export function recordTokens(id: string, model: string, promptTokens: number, completionTokens: number): Promise<unknown> {
  return prisma.assistantUsage.update({
    where: { id },
    data: { promptTokens, completionTokens, costUsd: estimateCostUsd(model, promptTokens, completionTokens) },
  });
}

/** The 429 body both routes return, so the UI handles one shape. */
export function limitError(state: LimitState) {
  const reset = state.resetAt ? new Date(state.resetAt) : null;
  return {
    error: 'Rate limit reached',
    detail: `Limit is ${state.limit} requests per ${state.windowHours} hours.${reset ? ` Next request available ${reset.toISOString()}.` : ''}`,
    resetAt: state.resetAt,
    usage: state,
  };
}
