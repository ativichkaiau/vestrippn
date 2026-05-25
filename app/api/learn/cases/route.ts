import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { caseSummary, caseType } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUMMARY_LEN = 180;

/**
 * GET /api/learn/cases[?specialty=…] -> [{ id, title, specialty, summary }]
 * `specialty` lets the browser group/feature cases by system.
 * ClinicalCase is a shared bank (no userId); auth still required.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        return {
          id: c.id,
          title: c.title,
          specialty: c.specialty,
          type: caseType(c.branches), // "linear" | "branching"
          summary,
        };
      }),
    );
  } catch (err) {
    // Degrade to empty state rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/learn/cases failed:", err);
    return NextResponse.json([]);
  }
}
