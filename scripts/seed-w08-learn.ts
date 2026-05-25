/**
 * W08 Phase C — sample Learn content (IELTS items + clinical cases).
 *
 * Clinical cases cover the 9 featured systems (one representative case each),
 * with `specialty` set to the exact system label so the browser can group/feature
 * by system. PLACEHOLDER teaching content — refine/expand per product.
 * Safe to re-run: fixed ids + upsert. IELTSItem/ClinicalCase are shared banks.
 *
 * Run:  VESTRIPPN_PRISMA_DATABASE_URL=... npx tsx scripts/seed-w08-learn.ts
 */
import "dotenv/config"; // loads .env (repo root) so the URL doesn't need exporting
import { prisma } from "../lib/prisma";
import { branchingCases } from "./branching-cases";

async function main() {
  if (!process.env.VESTRIPPN_PRISMA_DATABASE_URL) {
    console.error(
      "\nVESTRIPPN_PRISMA_DATABASE_URL is not set — cannot connect.\n" +
        "Fix it one of two ways:\n" +
        '  1) Create a .env file in the repo root with one line:\n' +
        '       VESTRIPPN_PRISMA_DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?sslmode=require"\n' +
        "     then: npx tsx scripts/seed-w08-learn.ts\n" +
        "  2) Or inline: VESTRIPPN_PRISMA_DATABASE_URL='postgresql://…' npx tsx scripts/seed-w08-learn.ts\n",
    );
    process.exit(1);
  }

  // ---- IELTS items (answerKey shape: { options, correctId, explanation? }) ----
  const ielts = [
    {
      id: "seed-ielts-1",
      section: "reading" as const,
      skill: "vocabulary",
      prompt: 'Choose the word closest in meaning to "mitigate".',
      difficulty: 1,
      tags: ["vocabulary", "synonyms"],
      answerKey: {
        options: [
          { id: "a", label: "Intensify" },
          { id: "b", label: "Alleviate" },
          { id: "c", label: "Postpone" },
          { id: "d", label: "Ignore" },
        ],
        correctId: "b",
        explanation: "To mitigate is to make less severe — i.e. alleviate.",
      },
    },
    {
      id: "seed-ielts-2",
      section: "reading" as const,
      skill: "vocabulary",
      prompt: 'Choose the word closest in meaning to "ubiquitous".',
      difficulty: 2,
      tags: ["vocabulary", "synonyms"],
      answerKey: {
        options: [
          { id: "a", label: "Rare" },
          { id: "b", label: "Hidden" },
          { id: "c", label: "Everywhere" },
          { id: "d", label: "Temporary" },
        ],
        correctId: "c",
        explanation: "Ubiquitous means present everywhere.",
      },
    },
  ];

  for (const item of ielts) {
    const { id, ...rest } = item;
    await prisma.iELTSItem.upsert({ where: { id }, update: rest, create: { id, ...rest } });
  }

  // ---- Clinical cases: all interactive (branching). Difficulty sets depth
  // (Easy 4 / Medium 5 / Hard 6 layers). Remove legacy/renamed rows first so the
  // bank is exclusively interactive (cascades to CaseProgress for removed cases).
  const caseIds = branchingCases.map((b) => b.id);
  await prisma.clinicalCase.deleteMany({ where: { id: { notIn: caseIds } } });

  for (const b of branchingCases) {
    const { id, title, specialty, scenario, citations } = b;
    const data = {
      title,
      specialty,
      scenario,
      citations,
      branches: {
        type: "branching",
        summary: b.summary,
        subtitle: b.subtitle,
        difficulty: b.difficulty,
        icon: b.icon,
        patient: b.patient,
        stages: b.stages,
        startNodeId: b.startNodeId,
        startScore: 100,
        nodes: b.nodes,
      },
    };
    await prisma.clinicalCase.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  const [iCount, cCount] = await Promise.all([
    prisma.iELTSItem.count(),
    prisma.clinicalCase.count(),
  ]);
  console.log(`Seed complete. IELTSItem rows: ${iCount}, ClinicalCase rows: ${cCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
