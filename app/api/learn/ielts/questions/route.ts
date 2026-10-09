import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAnswerKey } from "@/lib/learn/content";
import { IELTS_BANK, IELTS_SECTIONS, type IeltsSectionId } from "@/lib/learn/ielts-bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Question = {
  id: string;
  number: number;
  section: IeltsSectionId;
  skill: string;
  difficulty: number;
  prompt: string;
  options: { id: string; label: string }[];
};

/**
 * GET /api/learn/ielts/questions?section=reading
 * -> [{ id, number, section, skill, difficulty, prompt, options }]
 *
 * Public: a shared practice bank with no user data. correctId is never sent —
 * grading happens server-side in /answer. Serves the file bank plus any rows in
 * the IELTSItem table (rows whose id is already in the file are skipped).
 */
export async function GET(req: Request) {
  const sectionParam = new URL(req.url).searchParams.get("section");
  if (sectionParam && !IELTS_SECTIONS.includes(sectionParam as IeltsSectionId)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  const section = sectionParam as IeltsSectionId | null;

  const items: Omit<Question, "number">[] = IELTS_BANK.filter((item) => !section || item.section === section).map((item) => ({
    id: item.id,
    section: item.section,
    skill: item.skill,
    difficulty: item.difficulty,
    prompt: item.prompt,
    options: item.answerKey.options,
  }));

  try {
    const known = new Set(IELTS_BANK.map((item) => item.id));
    const rows = await prisma.iELTSItem.findMany({
      where: section ? { section } : undefined,
      select: { id: true, section: true, skill: true, difficulty: true, prompt: true, answerKey: true },
    });
    for (const row of rows) {
      if (known.has(row.id)) continue;
      const key = parseAnswerKey(row.answerKey);
      if (!key) continue; // skip malformed rows rather than leak or crash
      items.push({ id: row.id, section: row.section, skill: row.skill, difficulty: row.difficulty, prompt: row.prompt, options: key.options });
    }
  } catch (err) {
    // The database is optional here: the file bank always answers.
    console.error("GET /api/learn/ielts/questions: database rows unavailable", err);
  }

  const order = (s: IeltsSectionId) => IELTS_SECTIONS.indexOf(s);
  const questions: Question[] = items
    .sort((a, b) => order(a.section) - order(b.section) || a.difficulty - b.difficulty)
    .map((item, index) => ({ ...item, number: index + 1 }));

  return NextResponse.json(questions);
}
