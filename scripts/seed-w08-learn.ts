/**
 * W08 Phase C — sample Learn content (IELTS items + clinical cases).
 *
 * These are PLACEHOLDER samples so the Learn pages render end-to-end; real
 * content authoring/import is a separate product task. Safe to re-run: rows use
 * fixed ids and upsert. IELTSItem/ClinicalCase are shared banks (no userId).
 *
 * Run:  VESTRIPPN_PRISMA_DATABASE_URL=... npx tsx scripts/seed-w08-learn.ts
 */
import { prisma } from "../lib/prisma";

async function main() {
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

  // ---- Clinical cases (branches shape: { steps:[{id,label,content}], summary? }) ----
  const cases = [
    {
      id: "seed-case-1",
      title: "Recurrent UTI in a post-menopausal woman",
      specialty: "Urogynaecology",
      scenario:
        "A 62-year-old woman presents with her fourth symptomatic urinary tract infection in 12 months.",
      citations: ["NICE NG112", "EAU Guidelines on Urological Infections 2024"],
      branches: {
        summary: "Work up and manage recurrent UTI in a post-menopausal patient.",
        steps: [
          { id: "presentation", label: "Presentation", content: "Dysuria, frequency, and urgency recurring despite prior treatment." },
          { id: "history", label: "History", content: "Four culture-confirmed UTIs in the past year; no haematuria; LMP 11 years ago." },
          { id: "exam", label: "Examination", content: "Vaginal atrophy noted; no suprapubic tenderness; afebrile." },
          { id: "investigations", label: "Investigations", content: "MSU culture, post-void residual, and consideration of imaging if atypical." },
          { id: "diagnosis", label: "Diagnosis", content: "Recurrent UTI associated with genitourinary syndrome of menopause." },
        ],
      },
    },
  ];

  for (const c of cases) {
    const { id, ...rest } = c;
    await prisma.clinicalCase.upsert({ where: { id }, update: rest, create: { id, ...rest } });
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
