import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/owner";
import { forUser } from "@/lib/repositories/scoped";
import { isDue, REVIEW_INTERVAL_DAYS } from "@/lib/learn/review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/learn/review
 * Your case review queue: cases due now, and the ones coming up.
 * -> { due: Item[], upcoming: Item[], graduated: number, intervals: number[] }
 */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await forUser(userId).caseReview.findMany({
      select: { caseId: true, step: true, dueAt: true, lastResult: true, lastRunAt: true, misses: true, case: { select: { title: true, specialty: true } } },
      orderBy: { dueAt: "asc" },
    });
    const now = new Date();
    const item = (row: (typeof rows)[number]) => ({
      caseId: row.caseId,
      title: row.case.title,
      specialty: row.case.specialty,
      step: row.step,
      dueAt: row.dueAt?.toISOString() ?? null,
      lastResult: row.lastResult,
      lastRunAt: row.lastRunAt.toISOString(),
      misses: row.misses,
    });
    return NextResponse.json({
      due: rows.filter((row) => isDue(row, now)).map(item),
      upcoming: rows.filter((row) => row.dueAt && !isDue(row, now)).map(item),
      graduated: rows.filter((row) => row.dueAt === null).length,
      intervals: REVIEW_INTERVAL_DAYS,
    });
  } catch (err) {
    console.error("GET /api/learn/review failed:", err);
    return NextResponse.json({ due: [], upcoming: [], graduated: 0, intervals: REVIEW_INTERVAL_DAYS });
  }
}
