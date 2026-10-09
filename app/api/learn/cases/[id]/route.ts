import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import { forUser } from "@/lib/repositories/scoped";
import {
  parseBranches,
  caseType,
  parseBranchingCase,
  parseRunState,
  initRunState,
  nodeView,
} from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/learn/cases/:id
 * Linear:    { id, title, type:"linear", steps[], currentStep }
 * Branching: { id, title, type:"branching", node:{id,content,choices[{id,label}]},
 *              score, status, run }  — only the player's CURRENT node, no spoilers.
 * Both carry `saved`. A signed-in player resumes their stored run; a visitor
 * gets a fresh one that is never stored (their browser carries `run`).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  const { id } = await params;

  const found = await prisma.clinicalCase.findUnique({
    where: { id },
    select: { id: true, title: true, branches: true },
  });
  if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const progress = userId
    ? await forUser(userId).caseProgress.findFirst({
        where: { caseId: id },
        select: { stepIndex: true, state: true },
      })
    : null;

  if (caseType(found.branches) === "branching") {
    const bc = parseBranchingCase(found.branches);
    if (!bc) {
      return NextResponse.json({ error: "Case is misconfigured" }, { status: 422 });
    }
    const state = parseRunState(progress?.state) ?? initRunState(bc);
    const node = bc.nodes[state.currentNodeId] ?? bc.nodes[bc.startNodeId];
    return NextResponse.json({
      id: found.id,
      title: found.title,
      type: "branching",
      subtitle: bc.subtitle,
      patient: bc.patient,
      stages: bc.stages,
      node: nodeView(state.currentNodeId, node),
      vitals: node.vitals,
      patientStatus: node.patientStatus,
      score: state.score,
      status: state.status,
      run: state,
      saved: Boolean(userId),
    });
  }

  const { steps } = parseBranches(found.branches);
  return NextResponse.json({
    id: found.id,
    title: found.title,
    type: "linear",
    steps,
    currentStep: progress?.stepIndex ?? 0,
    saved: Boolean(userId),
  });
}
