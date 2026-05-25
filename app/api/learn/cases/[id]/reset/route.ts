import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  caseType,
  parseBranchingCase,
  initRunState,
  nodeView,
} from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/learn/cases/:id/reset
 * Restart a branching case run from the start node.
 * -> { id, type:"branching", node, score, status:"active" }
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const found = await prisma.clinicalCase.findUnique({
    where: { id },
    select: { branches: true },
  });
  if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (caseType(found.branches) !== "branching") {
    return NextResponse.json({ error: "Case is not interactive" }, { status: 400 });
  }
  const bc = parseBranchingCase(found.branches);
  if (!bc) return NextResponse.json({ error: "Case is misconfigured" }, { status: 422 });

  const state = initRunState(bc);
  await prisma.caseProgress.upsert({
    where: { userId_caseId: { userId, caseId: id } },
    update: { state },
    create: { userId, caseId: id, state },
  });

  const node = bc.nodes[state.currentNodeId];
  return NextResponse.json({
    id,
    type: "branching",
    node: nodeView(state.currentNodeId, node),
    score: state.score,
    status: state.status,
  });
}
