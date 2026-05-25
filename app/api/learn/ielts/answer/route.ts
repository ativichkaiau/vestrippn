import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import { forUser } from "@/lib/repositories/scoped";
import { parseAnswerKey } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/learn/ielts/answer  Body: { questionId, optionId }
 * -> { correct, correctId }
 * Grading is server-side; the attempt is persisted per user (append-only).
 */
export async function POST(req: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    questionId?: unknown;
    optionId?: unknown;
  } | null;
  const questionId = body?.questionId;
  const optionId = body?.optionId;
  if (typeof questionId !== "string" || typeof optionId !== "string") {
    return NextResponse.json(
      { error: "questionId and optionId (strings) are required" },
      { status: 400 },
    );
  }

  const item = await prisma.iELTSItem.findUnique({
    where: { id: questionId },
    select: { answerKey: true },
  });
  if (!item) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const key = parseAnswerKey(item.answerKey);
  if (!key) {
    return NextResponse.json({ error: "Question is misconfigured" }, { status: 422 });
  }
  if (!key.options.some((o) => o.id === optionId)) {
    return NextResponse.json({ error: "Invalid optionId" }, { status: 400 });
  }

  const correct = optionId === key.correctId;

  // Persist the attempt (scoped — userId forced by the data layer).
  await forUser(userId).userAttempt.create({
    data: {
      userId,
      itemType: "ielts",
      itemId: questionId,
      response: { optionId },
      score: correct ? 1 : 0,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ correct, correctId: key.correctId });
}
