import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireOwnerId } from "@/lib/auth/owner";
import { caseSummary, caseType, parseBranchingCase, patientLabel } from "@/lib/learn/content";
import { readCaseInput, storedBranches } from "@/lib/learn/case-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUMMARY_LEN = 180;

/**
 * GET /api/learn/cases[?specialty=…]
 * -> [{ id, title, specialty, type, summary, patient?, difficulty?, stages?, icon?, tags? }]
 * `specialty` lets the browser group/feature cases by system; `tags` carries
 * badges like "Rare"; `stages` is the decision-layer count.
 * ClinicalCase is a shared bank (no userId); auth still required.
 */
export async function GET(req: Request) {
  // Shared content bank — public read (sign-in skipped).
  const specialty = new URL(req.url).searchParams.get("specialty")?.trim() || null;

  try {
    const cases = await prisma.clinicalCase.findMany({
      where: specialty ? { specialty } : undefined,
      orderBy: [{ specialty: "asc" }, { title: "asc" }],
      select: { id: true, title: true, specialty: true, scenario: true, branches: true },
    });

    return NextResponse.json(
      cases.map((c) => {
        const summary =
          caseSummary(c.branches) ??
          (c.scenario.length > SUMMARY_LEN
            ? `${c.scenario.slice(0, SUMMARY_LEN).trimEnd()}…`
            : c.scenario);
        const type = caseType(c.branches);
        const bc = type === "branching" ? parseBranchingCase(c.branches) : null;
        return {
          id: c.id,
          title: c.title,
          specialty: c.specialty,
          type, // "linear" | "branching"
          summary,
          // optional enrich (absent => UI falls back)
          patient: bc ? patientLabel(bc.patient) : undefined,
          difficulty: bc?.difficulty,
          stages: bc?.stages?.length, // number of decision layers
          icon: bc?.icon,
          tags: bc?.patient?.tags, // e.g. ["Rare", ...] for grid badges
        };
      }),
    );
  } catch (err) {
    // Degrade to empty state rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/learn/cases failed:", err);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/learn/cases  (owner only) — create a branching case from the
 * case editor. Body: EditableCase. -> { id }
 */
export async function POST(req: Request) {
  if (!(await requireOwnerId())) return NextResponse.json({ error: "Only the owner can add cases." }, { status: 403 });
  const input = readCaseInput(await req.text());
  if (!input.ok) return NextResponse.json({ error: input.issues[0].message, issues: input.issues }, { status: input.status });
  const { title, specialty, scenario, citations } = input.value;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "case";
  const id = `case-${slug}-${crypto.randomUUID().slice(0, 8)}`;
  await prisma.clinicalCase.create({
    data: { id, title, specialty, scenario, citations, branches: storedBranches(input.value) as unknown as Prisma.InputJsonValue },
  });
  return NextResponse.json({ id }, { status: 201 });
}
