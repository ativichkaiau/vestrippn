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

const FIVE_STEP = (
  s: [string, string, string, string, string],
) => [
  { id: "presentation", label: "Presentation", content: s[0] },
  { id: "history", label: "History", content: s[1] },
  { id: "exam", label: "Examination", content: s[2] },
  { id: "investigations", label: "Investigations", content: s[3] },
  { id: "diagnosis", label: "Diagnosis", content: s[4] },
];

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

  // ---- Clinical cases — one per featured system (specialty = exact label) ----
  const cases = [
    {
      id: "seed-case-endocrine",
      title: "Diabetic ketoacidosis (new-onset type 1 diabetes)",
      specialty: "Endocrine System",
      scenario:
        "A 19-year-old presents with two days of vomiting, polyuria, and drowsiness following a viral illness.",
      citations: ["JBDS DKA Management Guideline", "ADA Standards of Care 2024"],
      branches: {
        summary: "Identify and manage diabetic ketoacidosis.",
        steps: FIVE_STEP([
          "Polyuria, polydipsia, abdominal pain, and deep sighing (Kussmaul) breathing.",
          "Recent unintentional weight loss; no prior diagnosis of diabetes.",
          "Dehydrated with ketotic breath; HR 110, BP 100/60, drowsy (GCS 14).",
          "Capillary glucose 28 mmol/L, ketones 5.2 mmol/L, venous pH 7.1 with low bicarbonate.",
          "Diabetic ketoacidosis — IV fluids, fixed-rate insulin infusion, and close potassium monitoring.",
        ]),
      },
    },
    {
      id: "seed-case-neuro",
      title: "Acute ischaemic stroke",
      specialty: "Nervous and Special Senses System",
      scenario:
        "A 67-year-old man develops sudden right-sided weakness and slurred speech 90 minutes ago.",
      citations: ["NICE NG128 Stroke", "AHA/ASA Acute Ischaemic Stroke Guidelines"],
      branches: {
        summary: "Recognise acute ischaemic stroke and assess reperfusion eligibility.",
        steps: FIVE_STEP([
          "Sudden right arm and leg weakness, facial droop, and dysarthria.",
          "Atrial fibrillation not on anticoagulation; hypertension.",
          "Right hemiparesis with right homonymous hemianopia; NIHSS 9.",
          "Non-contrast CT excludes haemorrhage; CT angiography shows a left MCA occlusion.",
          "Acute ischaemic stroke — thrombolysis and/or thrombectomy within the time window.",
        ]),
      },
    },
    {
      id: "seed-case-cardio",
      title: "Acute coronary syndrome (inferior STEMI)",
      specialty: "Cardiovascular System",
      scenario:
        "A 58-year-old man with hypertension and a smoking history presents with 40 minutes of crushing central chest pain.",
      citations: ["ESC Acute Coronary Syndromes 2023", "NICE NG185"],
      branches: {
        summary: "Recognise and manage an ST-elevation myocardial infarction.",
        steps: FIVE_STEP([
          "Sudden severe central chest pain radiating to the left arm, with sweating and nausea.",
          "Hypertension, 30 pack-year smoking history, father had an MI at 55.",
          "Anxious and diaphoretic; HR 96, BP 150/90; heart sounds normal, chest clear.",
          "ECG shows ST elevation in II, III, and aVF; troponin elevated.",
          "Inferior STEMI — aspirin and anticoagulation, activate the primary PCI pathway.",
        ]),
      },
    },
    {
      id: "seed-case-anatomy",
      title: "Inguinal hernia — applied anatomy of the inguinal canal",
      specialty: "Gross Anatomy",
      scenario:
        "A 55-year-old man reports an intermittent right groin lump that appears on standing and coughing.",
      citations: ["Last's Anatomy", "BJS Groin Hernia Guidelines"],
      branches: {
        summary: "Apply inguinal canal anatomy to diagnose and classify a groin hernia.",
        steps: FIVE_STEP([
          "Reducible groin swelling, more prominent on straining, with a mild dragging ache.",
          "Chronic cough and heavy lifting at work; no previous groin surgery.",
          "Lump arises above and medial to the pubic tubercle; reduces when lying flat.",
          "Clinical diagnosis; the defect is controlled by pressure over the deep inguinal ring.",
          "Indirect inguinal hernia (through the deep ring, lateral to the inferior epigastric vessels) — elective repair.",
        ]),
      },
    },
    {
      id: "seed-case-micro",
      title: "Falciparum malaria in a returning traveller",
      specialty: "Microbiology and Parasitology",
      scenario:
        "A 28-year-old returns from Nigeria with four days of high fevers, rigors, and headache.",
      citations: ["WHO Guidelines for Malaria 2023", "UK Malaria Treatment Guidelines"],
      branches: {
        summary: "Diagnose and risk-stratify falciparum malaria.",
        steps: FIVE_STEP([
          "High fever with rigors and drenching sweats, myalgia, and headache.",
          "Returned from West Africa 10 days ago; took no chemoprophylaxis.",
          "Temp 39.5°C, tachycardic, with mild jaundice and splenomegaly.",
          "Thick and thin blood films show Plasmodium falciparum; parasitaemia 3%; thrombocytopenia.",
          "Falciparum malaria — assess for severe features and start artemisinin-based therapy.",
        ]),
      },
    },
    {
      id: "seed-case-respiratory",
      title: "Community-acquired pneumonia",
      specialty: "Respiratory System",
      scenario:
        "A 72-year-old woman presents with three days of productive cough, fever, and pleuritic chest pain.",
      citations: ["BTS Community-Acquired Pneumonia Guideline", "NICE NG138"],
      branches: {
        summary: "Diagnose and risk-stratify community-acquired pneumonia.",
        steps: FIVE_STEP([
          "Fever, rusty sputum, and right-sided pleuritic chest pain.",
          "Background COPD and a recent coryzal illness.",
          "Temp 38.7°C, RR 24, SpO2 91% on air; right basal crackles and bronchial breathing.",
          "Chest X-ray shows right lower lobe consolidation; CRP raised; CURB-65 = 2.",
          "Community-acquired pneumonia — admit, oxygen, and empirical antibiotics.",
        ]),
      },
    },
    {
      id: "seed-case-gi",
      title: "Acute cholecystitis",
      specialty: "Digestive and Biliary Tract System",
      scenario:
        "A 45-year-old woman presents with 12 hours of severe right upper quadrant pain after a fatty meal.",
      citations: ["Tokyo Guidelines 2018", "NICE CG188 Gallstone Disease"],
      branches: {
        summary: "Diagnose and manage acute cholecystitis.",
        steps: FIVE_STEP([
          "Constant right upper quadrant pain radiating to the right shoulder, with fever and vomiting.",
          "Previous episodes of biliary colic; overweight.",
          "Temp 38.2°C with right upper quadrant tenderness and a positive Murphy's sign.",
          "Raised WCC/CRP; ultrasound shows gallstones, a thick-walled gallbladder, and pericholecystic fluid.",
          "Acute cholecystitis — analgesia, antibiotics, and early laparoscopic cholecystectomy.",
        ]),
      },
    },
    {
      id: "seed-case-repro",
      title: "Pre-eclampsia with severe features",
      specialty: "Reproductive System and Perinatal Period",
      scenario:
        "A 31-year-old at 34 weeks' gestation presents with headache, visual disturbance, and worsening swelling.",
      citations: ["NICE NG133 Hypertension in Pregnancy", "ACOG Pre-eclampsia Bulletin"],
      branches: {
        summary: "Recognise and manage pre-eclampsia in pregnancy.",
        steps: FIVE_STEP([
          "Frontal headache, blurred vision, and rapidly worsening oedema.",
          "First pregnancy; previously normotensive.",
          "BP 162/108, brisk reflexes with clonus, and facial and pedal oedema.",
          "Significant proteinuria, thrombocytopenia, and raised transaminases.",
          "Pre-eclampsia with severe features — antihypertensives, magnesium sulfate, and plan for delivery.",
        ]),
      },
    },
    {
      // Reuses the original seed id so the earlier rUTI case isn't orphaned.
      id: "seed-case-1",
      title: "Recurrent UTI in a post-menopausal woman",
      specialty: "Renal and Urinary Tract",
      scenario:
        "A 62-year-old woman presents with her fourth symptomatic urinary tract infection in 12 months.",
      citations: ["NICE NG112", "EAU Guidelines on Urological Infections 2024"],
      branches: {
        summary: "Work up and manage recurrent UTI in a post-menopausal patient.",
        steps: FIVE_STEP([
          "Dysuria, frequency, and urgency recurring despite prior treatment.",
          "Four culture-confirmed UTIs in the past year; no haematuria; LMP 11 years ago.",
          "Vaginal atrophy noted; no suprapubic tenderness; afebrile.",
          "MSU culture, post-void residual, and imaging if features are atypical.",
          "Recurrent UTI associated with genitourinary syndrome of menopause.",
        ]),
      },
    },
  ];

  for (const c of cases) {
    const { id, ...rest } = c;
    await prisma.clinicalCase.upsert({ where: { id }, update: rest, create: { id, ...rest } });
  }

  // ---- Interactive branching cases ----
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
