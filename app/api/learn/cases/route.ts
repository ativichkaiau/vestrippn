import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseBranches } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUMMARY_LEN = 180;

/**
 * GET /api/learn/cases -> [{ id, title, summary }]  (browser grid)
 * ClinicalCase is a shared bank (no userId); auth still required.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cases = await prisma.clinicalCase.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, scenario: true, branches: true },
    });

    return NextResponse.json(
      cases.map((c) => {
        const summary =
          parseBranches(c.branches).summary ??
          (c.scenario.length > SUMMARY_LEN
            ? `${c.scenario.slice(0, SUMMARY_LEN).trimEnd()}…`
            : c.scenario);
        return { id: c.id, title: c.title, summary };
      }),
    );
  } catch (err) {
    // Degrade to empty state rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/learn/cases failed:", err);
    return NextResponse.json([]);
  }
}
