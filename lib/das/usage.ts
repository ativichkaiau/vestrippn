import { prisma } from "@/lib/prisma";

/**
 * Monthly embedding-token budget metering.
 *
 * Reads/writes go through base prisma with an explicit userId filter (the
 * scoped client deliberately forbids upsert on unique keys). Rows are unique
 * per (userId, month), so increments are a single atomic upsert.
 */

const SOFT_THRESHOLD = 0.8; // warn
const HARD_THRESHOLD = 1.0; // block (429)
const DEFAULT_BUDGET = 1_000_000; // tokens/month; override via env

export function monthlyBudget(): number {
  const raw = Number(process.env.EMBEDDING_MONTHLY_TOKEN_BUDGET);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_BUDGET;
}

export function currentMonth(now = new Date()): string {
  return now.toISOString().slice(0, 7); // "YYYY-MM"
}

export interface UsageState {
  used: number;
  budget: number;
  percent: number; // 0..1+
  softExceeded: boolean; // >= 80%
  hardExceeded: boolean; // >= 100%
}

function stateFrom(used: number, budget: number): UsageState {
  const percent = budget > 0 ? used / budget : 1;
  return {
    used,
    budget,
    percent,
    softExceeded: percent >= SOFT_THRESHOLD,
    hardExceeded: percent >= HARD_THRESHOLD,
  };
}

/** Current month's usage for a user. */
export async function getUsage(userId: string): Promise<UsageState> {
  const row = await prisma.userUsage.findUnique({
    where: { userId_month: { userId, month: currentMonth() } },
    select: { embeddingTokens: true },
  });
  return stateFrom(row?.embeddingTokens ?? 0, monthlyBudget());
}

/** Atomically add embedding tokens for the current month; returns new state. */
export async function recordEmbeddingTokens(
  userId: string,
  tokens: number,
): Promise<UsageState> {
  const month = currentMonth();
  const row = await prisma.userUsage.upsert({
    where: { userId_month: { userId, month } },
    update: { embeddingTokens: { increment: tokens } },
    create: { userId, month, embeddingTokens: tokens },
    select: { embeddingTokens: true },
  });
  return stateFrom(row.embeddingTokens, monthlyBudget());
}

/** Atomically add chat tokens for the current month (metering only, no cap). */
export async function recordChatTokens(userId: string, tokens: number): Promise<void> {
  if (!tokens) return;
  const month = currentMonth();
  await prisma.userUsage.upsert({
    where: { userId_month: { userId, month } },
    update: { chatTokens: { increment: tokens } },
    create: { userId, month, chatTokens: tokens },
  });
}
