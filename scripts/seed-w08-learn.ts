/**
 * W08 — sample Learn content (clinical cases only).
 *
 * The IELTS Practice module was removed (unused). Re-add the IELTS seed block
 * if the module is ever revived — the IELTSItem table still exists in Postgres.
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

  const cCount = await prisma.clinicalCase.count();
  console.log(`Seed complete. ClinicalCase rows: ${cCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
