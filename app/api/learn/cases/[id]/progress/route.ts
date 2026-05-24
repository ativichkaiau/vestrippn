import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseBranches } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/learn/cases/:id/progress  Body: { stepIndex }
 * Upserts this user's current step for the case. Uses base prisma with an
 * explicit (userId, caseId) unique key — the scoped client forbids upsert.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = (await req.json().catch(() => null)) as { stepIndex?: unknown } | null;
  const raw = body?.stepIndex;
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0) {
    return NextResponse.json(
      { error: "stepIndex must be a non-negative integer" },
      { status: 400 },
    );
  }

  const found = await prisma.clinicalCase.findUnique({
    where: { id },
    select: { branches: true },
  });
  if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  // Clamp to the case's step range so progress can't point past the end.
  const stepCount = parseBranches(found.branches).steps.length;
  const stepIndex = stepCount > 0 ? Math.min(raw, stepCount - 1) : 0;

  await prisma.caseProgress.upsert({
    where: { userId_caseId: { userId, caseId: id } },
    update: { stepIndex },
    create: { userId, caseId: id, stepIndex },
  });

  return NextResponse.json({ ok: true, stepIndex });
}
