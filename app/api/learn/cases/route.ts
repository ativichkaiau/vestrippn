import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { caseSummary, caseType, parseBranchingCase, patientLabel } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUMMARY_LEN = 180;

/**
 * GET /api/learn/cases[?specialty=…] -> [{ id, title, specialty, summary }]
 * `specialty` lets the browser group/feature cases by system.
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
          stages: bc?.stages?.length,
          icon: bc?.icon,
        };
      }),
    );
  } catch (err) {
    // Degrade to empty state rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/learn/cases failed:", err);
    return NextResponse.json([]);
  }
}
