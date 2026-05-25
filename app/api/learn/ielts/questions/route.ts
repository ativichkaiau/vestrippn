import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnswerKey } from "@/lib/learn/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECTIONS = ["reading", "listening", "writing", "speaking"] as const;
type Section = (typeof SECTIONS)[number];

/**
 * GET /api/learn/ielts/questions?section=reading
 * -> [{ id, number, prompt, options: { id, label }[] }]
 * correctId is intentionally omitted — grading happens server-side via /answer.
 * IELTSItem is a shared content bank (no userId), so reads are not user-scoped;
 * auth is still required.
 */
export async function GET(req: Request) {
  // Shared content bank — public read (sign-in skipped).
  const sectionParam = new URL(req.url).searchParams.get("section");
  if (sectionParam && !SECTIONS.includes(sectionParam as Section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  try {
    const items = await prisma.iELTSItem.findMany({
      where: sectionParam ? { section: sectionParam as Section } : undefined,
      orderBy: [{ difficulty: "asc" }, { id: "asc" }],
      select: { id: true, prompt: true, answerKey: true },
    });

    const questions = items
      .map((item, index) => {
        const key = parseAnswerKey(item.answerKey);
        if (!key) return null; // skip malformed rows rather than leak/crash
        return {
          id: item.id,
          number: index + 1,
          prompt: item.prompt,
          options: key.options, // { id, label } only — no correctId
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null);

    return NextResponse.json(questions);
  } catch (err) {
    // Degrade to empty state rather than 500 (e.g. before migrations are applied).
    console.error("GET /api/learn/ielts/questions failed:", err);
    return NextResponse.json([]);
  }
}
