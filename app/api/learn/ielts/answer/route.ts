import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import { forUser } from "@/lib/repositories/scoped";
import { parseAnswerKey, type IeltsAnswerKey } from "@/lib/learn/content";
import { findBankItem } from "@/lib/learn/ielts-bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/learn/ielts/answer  Body: { questionId, optionId }
 * -> { correct, correctId, explanation?, saved }
 *
 * Grading is server-side and open to everyone (the practice page is public).
 * The attempt is stored only for a signed-in user — anonymous practice is never
 * written to anyone's account.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { questionId?: unknown; optionId?: unknown } | null;
  const questionId = body?.questionId;
  const optionId = body?.optionId;
  if (typeof questionId !== "string" || typeof optionId !== "string") {
    return NextResponse.json({ error: "questionId and optionId (strings) are required" }, { status: 400 });
  }

  let key: IeltsAnswerKey | null = findBankItem(questionId)?.answerKey ?? null;
  if (!key) {
    const row = await prisma.iELTSItem
      .findUnique({ where: { id: questionId }, select: { answerKey: true } })
      .catch(() => null);
    if (!row) return NextResponse.json({ error: "Question not found" }, { status: 404 });
    key = parseAnswerKey(row.answerKey);
  }
  if (!key) return NextResponse.json({ error: "Question is misconfigured" }, { status: 422 });
  if (!key.options.some((o) => o.id === optionId)) {
    return NextResponse.json({ error: "Invalid optionId" }, { status: 400 });
  }

  const correct = optionId === key.correctId;

  let saved = false;
  const userId = await requireUserId();
  if (userId) {
    try {
      await forUser(userId).userAttempt.create({
        data: { userId, itemType: "ielts", itemId: questionId, response: { optionId }, score: correct ? 1 : 0, completedAt: new Date() },
      });
      saved = true;
    } catch (err) {
      console.error("POST /api/learn/ielts/answer: attempt not saved", err);
    }
  }

  return NextResponse.json({ correct, correctId: key.correctId, explanation: key.explanation, saved });
}
