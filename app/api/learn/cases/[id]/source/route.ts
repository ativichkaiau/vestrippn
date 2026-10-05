import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireOwnerId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import { caseType, parseBranchingCase } from "@/lib/learn/content";
import { readCaseInput, storedBranches } from "@/lib/learn/case-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
const ownerOnly = () => NextResponse.json({ error: "Only the owner can edit cases." }, { status: 403 });

/**
 * The case editor's view of one case, owner only: the full graph,
 * outcomes and feedback included (the player's routes never send these).
 * GET → EditableCase · PUT (EditableCase) → saved · DELETE → removed
 */
export async function GET(_req: Request, { params }: Params) {
  if (!(await requireOwnerId())) return ownerOnly();
  const { id } = await params;
  const found = await prisma.clinicalCase.findUnique({ where: { id } });
  if (!found) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  const branches = caseType(found.branches) === "branching" ? parseBranchingCase(found.branches) : null;
  if (!branches) return NextResponse.json({ error: "Only branching cases can be edited here." }, { status: 422 });
  return NextResponse.json({ id: found.id, title: found.title, specialty: found.specialty, scenario: found.scenario, citations: found.citations, branches });
}

export async function PUT(req: Request, { params }: Params) {
  if (!(await requireOwnerId())) return ownerOnly();
  const { id } = await params;
  const input = readCaseInput(await req.text());
  if (!input.ok) return NextResponse.json({ error: input.issues[0].message, issues: input.issues }, { status: input.status });
  const { title, specialty, scenario, citations } = input.value;
  try {
    await prisma.clinicalCase.update({
      where: { id },
      data: { title, specialty, scenario, citations, branches: storedBranches(input.value) as unknown as Prisma.InputJsonValue },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ error: "Case not found" }, { status: 404 });
    throw error;
  }
  return NextResponse.json({ id });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await requireOwnerId())) return ownerOnly();
  const { id } = await params;
  const removed = await prisma.clinicalCase.deleteMany({ where: { id } });
  if (!removed.count) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
