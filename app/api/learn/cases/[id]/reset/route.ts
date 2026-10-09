import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireUserId } from "@/lib/auth/owner";
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
 * Restart a branching case run from the start node. Stored only for a
 * signed-in player; a visitor just gets a fresh `run` back.
 * -> { id, type:"branching", node, score, status:"active", run, saved }
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();

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
  if (userId) {
    const stateJson = state as unknown as Prisma.InputJsonValue;
    await prisma.caseProgress.upsert({
      where: { userId_caseId: { userId, caseId: id } },
      update: { state: stateJson },
      create: { userId, caseId: id, state: stateJson },
    });
  }

  const node = bc.nodes[state.currentNodeId];
  return NextResponse.json({
    id,
    type: "branching",
    node: nodeView(state.currentNodeId, node),
    vitals: node.vitals,
    patientStatus: node.patientStatus,
    score: state.score,
    status: state.status,
    run: state,
    saved: Boolean(userId),
  });
}
