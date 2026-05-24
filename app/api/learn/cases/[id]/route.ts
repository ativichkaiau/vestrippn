import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { forUser } from "@/lib/repositories/scoped";
import { parseBranches } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/learn/cases/:id
 * -> { id, title, steps: { id, label, content }[], currentStep }
 * steps map 1:1 to CaseStepper; currentStep is this user's saved progress.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const found = await prisma.clinicalCase.findUnique({
    where: { id },
    select: { id: true, title: true, branches: true },
  });
  if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const { steps } = parseBranches(found.branches);

  // Per-user progress (scoped — only this user's row is visible).
  const progress = await forUser(userId).caseProgress.findFirst({
    where: { caseId: id },
    select: { stepIndex: true },
  });

  return NextResponse.json({
    id: found.id,
    title: found.title,
    steps,
    currentStep: progress?.stepIndex ?? 0,
  });
}
