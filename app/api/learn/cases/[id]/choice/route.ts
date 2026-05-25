import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { forUser } from "@/lib/repositories/scoped";
import {
  caseType,
  parseBranchingCase,
  parseRunState,
  initRunState,
  nodeView,
  type CaseRunState,
} from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/learn/cases/:id/choice   Body: { nodeId, choiceId }
 * The consequence engine: resolves the choice server-side (optimal / suboptimal
 * / deadly are never exposed up front), updates run state + score, advances to
 * the next node, and persists. Deadly choices are fatal regardless of score.
 *
 * -> { outcome, feedback, scoreDelta, score, status, node }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    nodeId?: unknown;
    choiceId?: unknown;
  } | null;
  if (typeof body?.nodeId !== "string" || typeof body?.choiceId !== "string") {
    return NextResponse.json(
      { error: "nodeId and choiceId (strings) are required" },
      { status: 400 },
    );
  }

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

  const existing = await forUser(userId).caseProgress.findFirst({
    where: { caseId: id },
    select: { state: true },
  });
  const state = parseRunState(existing?.state) ?? initRunState(bc);

  if (state.status !== "active") {
    return NextResponse.json({ error: "This case run is already complete" }, { status: 409 });
  }
  if (state.currentNodeId !== body.nodeId) {
    return NextResponse.json({ error: "Choice does not match the current node" }, { status: 409 });
  }

  const node = bc.nodes[body.nodeId];
  const choice = node?.choices.find((c) => c.id === body.choiceId);
  if (!choice) return NextResponse.json({ error: "Invalid choiceId" }, { status: 400 });

  const nextNode = bc.nodes[choice.next];
  if (!nextNode) return NextResponse.json({ error: "Case is misconfigured" }, { status: 422 });

  const score = Math.max(0, Math.min(bc.startScore, state.score + choice.scoreDelta));
  const status: CaseRunState["status"] =
    choice.outcome === "deadly" || score <= 0 || nextNode.end === "died"
      ? "died"
      : nextNode.end === "survived"
        ? "survived"
        : "active";

  const newState: CaseRunState = {
    currentNodeId: choice.next,
    score,
    status,
    path: [...state.path, { nodeId: body.nodeId, choiceId: body.choiceId, outcome: choice.outcome }],
  };

  // Persist run state (base prisma — scoped client forbids upsert) + log the choice.
  // Cast: a typed object isn't structurally assignable to Prisma's Json input.
  const stateJson = newState as unknown as Prisma.InputJsonValue;
  await Promise.all([
    prisma.caseProgress.upsert({
      where: { userId_caseId: { userId, caseId: id } },
      update: { state: stateJson },
      create: { userId, caseId: id, state: stateJson },
    }),
    forUser(userId).userAttempt.create({
      data: {
        userId,
        itemType: "case",
        itemId: id,
        response: { nodeId: body.nodeId, choiceId: body.choiceId, outcome: choice.outcome },
        score: choice.outcome === "optimal" ? 1 : 0,
        completedAt: status === "active" ? null : new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    outcome: choice.outcome,
    feedback: choice.feedback,
    scoreDelta: choice.scoreDelta,
    score,
    status,
    node: nodeView(choice.next, nextNode), // terminal node has empty choices
  });
}
