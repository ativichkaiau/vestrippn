/**
 * W08 — 10 interactive ("choose-your-path") clinical cases, enriched for the
 * rich player UI (patient banner, vitals, decision-path stages, status).
 *
 * ⚠️ PLACEHOLDER TEACHING CONTENT — drafted for the engine; every "deadly"
 * pathway and all vital signs MUST be clinically reviewed before production use.
 *
 * Shape mirrors lib/learn/content.ts (BranchingCase). The seed wraps each entry
 * in { type:"branching", startScore:100, ... } for ClinicalCase.branches.
 * Every field beyond the core graph is optional — the UI degrades gracefully.
 */

type Outcome = "optimal" | "suboptimal" | "deadly";
type Trend = "up" | "down" | "flat";
type VState = "normal" | "warning" | "critical";
type PatientStatus =
  | "stable"
  | "guarded"
  | "worsening"
  | "critical"
  | "improving"
  | "unstable";

interface Vital {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: Trend;
  state?: VState;
}
interface Choice {
  id: string;
  label: string;
  outcome: Outcome;
  scoreDelta: number;
  feedback: string;
  next: string;
  icon?: string;
  detail?: string;
}
interface Node {
  content: string;
  prompt?: string;
  stageId?: string;
  stageLabel?: string;
  patientStatus?: PatientStatus;
  vitals?: Vital[];
  choices?: Choice[];
  end?: "survived" | "died";
}
export interface BranchingCaseSeed {
  id: string;
  title: string;
  specialty: string;
  scenario: string;
  citations: string[];
  summary: string;
  subtitle: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  icon: string;
  patient: { name: string; age?: number; sex?: string; presentation?: string; tags?: string[] };
  stages: { id: string; label: string }[];
  startNodeId: string;
  nodes: Record<string, Node>;
}

// --- compact builders ---
const vit = (id: string, label: string, value: string | number, unit?: string, trend?: Trend, state?: VState): Vital =>
  ({ id, label, value, unit, trend, state });
const ch = (
  id: string,
  label: string,
  outcome: Outcome,
  scoreDelta: number,
  feedback: string,
  next: string,
  icon?: string,
  detail?: string,
): Choice => ({ id, label, outcome, scoreDelta, feedback, next, icon, detail });
const survived = (content: string, vitals?: Vital[]): Node =>
  ({ content, end: "survived", patientStatus: "improving", vitals });
const died = (content: string): Node => ({ content, end: "died", patientStatus: "critical" });
const DIED = died("The patient deteriorates into cardiac arrest. Review the decision points and try again.");

export const branchingCases: BranchingCaseSeed[] = [
  {
    id: "bcase-anaphylaxis",
    title: "Anaphylaxis at a restaurant",
    specialty: "Respiratory System",
    scenario:
      "A 24-year-old collapses minutes after eating peanuts — facial swelling, urticaria, wheeze, stridor, BP 78/40.",
    citations: ["Resuscitation Council UK — Anaphylaxis Guidelines"],
    summary: "Manage acute anaphylaxis under time pressure.",
    subtitle: "Acute airway and circulatory compromise",
    difficulty: "Moderate",
    icon: "🫁",
    patient: { name: "Mia", age: 24, sex: "F", presentation: "Collapse after eating peanuts", tags: ["Allergy", "Airway", "Shock"] },
    stages: [
      { id: "resus", label: "Immediate Resus" },
      { id: "stabilise", label: "Stabilisation" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "resus",
        stageLabel: "Immediate Resus",
        prompt: "Choose your immediate priority",
        content: "She is stridulous and hypotensive.",
        patientStatus: "critical",
        vitals: [
          vit("hr", "Heart rate", 124, "bpm", "up", "critical"),
          vit("bp", "Blood pressure", "78/40", "mmHg", "down", "critical"),
          vit("spo2", "SpO₂", 88, "%", "down", "critical"),
        ],
        choices: [
          ch("a", "Give 0.5 mg IM adrenaline (1:1000)", "optimal", 0, "Correct — IM adrenaline is first-line and reverses airway and circulatory compromise.", "n2", "💉", "Anterolateral thigh"),
          ch("b", "Give IV antihistamine and steroid first", "suboptimal", -20, "Adjuncts, not first-line — you've lost critical minutes.", "n2", "💊"),
          ch("c", "Give 0.5 mg IV adrenaline bolus (1:1000)", "deadly", -100, "Undiluted IV adrenaline bolus causes a malignant arrhythmia and arrest.", "died", "⚠️"),
        ],
      },
      n2: {
        stageId: "stabilise",
        stageLabel: "Stabilisation",
        prompt: "She remains hypotensive — next step",
        content: "After IM adrenaline she is still hypotensive.",
        patientStatus: "guarded",
        vitals: [
          vit("hr", "Heart rate", 110, "bpm", "down", "warning"),
          vit("bp", "Blood pressure", "92/58", "mmHg", "up", "warning"),
          vit("spo2", "SpO₂", 94, "%", "up", "warning"),
        ],
        choices: [
          ch("a", "O₂, IV fluid bolus, repeat IM adrenaline at 5 min", "optimal", 0, "Correct — supportive resuscitation plus repeat dosing stabilises her.", "survived", "🧪"),
          ch("b", "Sit her fully upright to ease breathing", "suboptimal", -20, "Sitting a hypotensive patient up can precipitate collapse — lay her flat, legs raised.", "survived", "🪑"),
          ch("c", "Withhold further adrenaline and observe", "deadly", -100, "Under-treated anaphylaxis progresses to arrest.", "died", "🚫"),
        ],
      },
      survived: survived(
        "She stabilises, is observed, and discharged with an adrenaline auto-injector and allergy referral.",
        [vit("hr", "Heart rate", 88, "bpm", "flat", "normal"), vit("bp", "Blood pressure", "114/72", "mmHg", "flat", "normal"), vit("spo2", "SpO₂", 98, "%", "flat", "normal")],
      ),
      died: DIED,
    },
  },
  {
    id: "bcase-septic-shock",
    title: "Septic shock from pneumonia",
    specialty: "Microbiology and Parasitology",
    scenario: "A 70-year-old with a productive cough is confused, febrile, tachycardic, BP 86/50, lactate 4.2.",
    citations: ["Surviving Sepsis Campaign 2021", "NICE NG51"],
    summary: "Apply the Sepsis Six within the first hour.",
    subtitle: "Time-critical sepsis resuscitation",
    difficulty: "Moderate",
    icon: "🦠",
    patient: { name: "Arthur", age: 70, sex: "M", presentation: "Confusion, fever, productive cough", tags: ["Sepsis", "Shock"] },
    stages: [
      { id: "sepsis6", label: "Sepsis Six" },
      { id: "escalate", label: "Escalation" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "sepsis6",
        stageLabel: "Sepsis Six",
        prompt: "He meets septic-shock criteria — first action",
        content: "He is confused and shocked.",
        patientStatus: "critical",
        vitals: [
          vit("temp", "Temp", 39.2, "°C", "up", "warning"),
          vit("hr", "Heart rate", 122, "bpm", "up", "critical"),
          vit("bp", "Blood pressure", "86/50", "mmHg", "down", "critical"),
          vit("lac", "Lactate", 4.2, "mmol/L", "up", "critical"),
        ],
        choices: [
          ch("a", "Cultures, then IV antibiotics + fluid bolus", "optimal", 0, "Correct — cultures first, but don't delay antibiotics or resuscitation.", "n2", "💉"),
          ch("b", "CT chest and wait before treating", "suboptimal", -20, "Imaging must not delay antibiotics/fluids — you've lost the golden hour.", "n2", "🩻"),
          ch("c", "Discharge on oral antibiotics", "deadly", -100, "Discharging septic shock is fatal.", "died", "🚪"),
        ],
      },
      n2: {
        stageId: "escalate",
        stageLabel: "Escalation",
        prompt: "Still hypotensive after the first bolus — next",
        content: "MAP remains 58 after fluids.",
        patientStatus: "worsening",
        vitals: [
          vit("map", "MAP", 58, "mmHg", "down", "critical"),
          vit("hr", "Heart rate", 118, "bpm", "flat", "warning"),
          vit("lac", "Lactate", 3.6, "mmol/L", "down", "warning"),
        ],
        choices: [
          ch("a", "Further fluids, senior review, ICU for vasopressors", "optimal", 0, "Correct — refractory shock needs ICU and vasopressors.", "survived", "🚑"),
          ch("b", "Give an antipyretic and reassess in an hour", "suboptimal", -20, "Treating the fever doesn't treat the shock.", "survived", "💊"),
          ch("c", "Restrict fluids and keep observing", "deadly", -100, "Under-resuscitated septic shock progresses to multi-organ failure.", "died", "🚫"),
        ],
      },
      survived: survived("He responds to resuscitation, reaches ICU, and the source is controlled.", [
        vit("map", "MAP", 72, "mmHg", "up", "normal"),
        vit("lac", "Lactate", 1.8, "mmol/L", "down", "normal"),
      ]),
      died: died("He arrests from untreated septic shock. Review the early decisions."),
    },
  },
  {
    id: "bcase-vf-arrest",
    title: "Witnessed VF cardiac arrest",
    specialty: "Cardiovascular System",
    scenario: "A 60-year-old collapses, unresponsive and not breathing normally; the monitor shows VF.",
    citations: ["Resuscitation Council UK — Adult ALS"],
    summary: "Run the shockable-rhythm ALS algorithm.",
    subtitle: "Shockable-rhythm cardiac arrest",
    difficulty: "Hard",
    icon: "❤️",
    patient: { name: "Derek", age: 60, sex: "M", presentation: "Sudden collapse, VF on monitor", tags: ["Arrest", "ALS"] },
    stages: [
      { id: "defib", label: "Defibrillation" },
      { id: "als", label: "ALS Cycle" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "defib",
        stageLabel: "Defibrillation",
        prompt: "VF confirmed — immediate action",
        content: "He is in cardiac arrest with VF.",
        patientStatus: "critical",
        vitals: [
          vit("rhythm", "Rhythm", "VF", undefined, undefined, "critical"),
          vit("hr", "Pulse", "Absent", undefined, undefined, "critical"),
        ],
        choices: [
          ch("a", "Unsynchronised shock, then resume CPR", "optimal", 0, "Correct — VF is shockable: defibrillate, then continue CPR.", "n2", "⚡"),
          ch("b", "Give amiodarone before any shock", "suboptimal", -20, "Defibrillation is the priority in VF; drugs come after shocks.", "n2", "💊"),
          ch("c", "Attempt synchronised cardioversion", "deadly", -100, "You can't synchronise to VF — the device won't discharge and time is lost.", "died", "⚠️"),
        ],
      },
      n2: {
        stageId: "als",
        stageLabel: "ALS Cycle",
        prompt: "Still in VF after 2 min CPR — next",
        content: "He remains in VF.",
        patientStatus: "critical",
        vitals: [
          vit("rhythm", "Rhythm", "VF", undefined, "flat", "critical"),
          vit("etco2", "EtCO₂", 1.8, "kPa", "flat", "warning"),
        ],
        choices: [
          ch("a", "Shock, continue CPR, adrenaline + amiodarone per ALS", "optimal", 0, "Correct — repeat shocks with drugs after the third shock.", "survived", "⚡"),
          ch("b", "Pause to recheck a pulse after the shock", "suboptimal", -20, "Don't pause CPR mid-cycle to check a pulse — minimise interruptions.", "survived", "✋"),
          ch("c", "Abandon resuscitation after one further shock", "deadly", -100, "Premature termination of a shockable arrest forgoes a survivable rhythm.", "died", "🚫"),
        ],
      },
      survived: survived("ROSC is achieved; he is transferred for post-arrest care and PCI.", [
        vit("rhythm", "Rhythm", "Sinus", undefined, undefined, "normal"),
        vit("bp", "Blood pressure", "104/64", "mmHg", "up", "warning"),
      ]),
      died: died("Resuscitation fails. Review the algorithm steps."),
    },
  },
  {
    id: "bcase-hyperkalaemia",
    title: "Severe hyperkalaemia in a dialysis patient",
    specialty: "Renal and Urinary Tract",
    scenario: "A missed-dialysis patient has K+ 7.1 with tall tented T waves and a broadening QRS.",
    citations: ["UK Renal Association — Hyperkalaemia Guideline"],
    summary: "Treat life-threatening hyperkalaemia in the right order.",
    subtitle: "ECG changes with K+ 7.1",
    difficulty: "Moderate",
    icon: "🧫",
    patient: { name: "Priya", age: 54, sex: "F", presentation: "Missed dialysis, palpitations", tags: ["Electrolytes", "Arrhythmia"] },
    stages: [
      { id: "protect", label: "Cardioprotection" },
      { id: "lower", label: "Lower K+" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "protect",
        stageLabel: "Cardioprotection",
        prompt: "ECG shows hyperkalaemic changes — first step",
        content: "The ECG is concerning.",
        patientStatus: "unstable",
        vitals: [
          vit("k", "Potassium", 7.1, "mmol/L", "up", "critical"),
          vit("hr", "Heart rate", 48, "bpm", "down", "warning"),
          vit("ecg", "ECG", "Broad QRS", undefined, undefined, "critical"),
        ],
        choices: [
          ch("a", "IV calcium gluconate to stabilise the myocardium", "optimal", 0, "Correct — cardiac membrane stabilisation comes first with ECG changes.", "n2", "🛡️"),
          ch("b", "Insulin–dextrose first, skip the calcium", "suboptimal", -20, "Shifting K+ is needed, but stabilisation (calcium) comes first.", "n2", "💉"),
          ch("c", "Run potassium-containing IV fluids", "deadly", -100, "Giving potassium worsens the arrhythmia and can cause arrest.", "died", "⚠️"),
        ],
      },
      n2: {
        stageId: "lower",
        stageLabel: "Lower K+",
        prompt: "Myocardium stabilised — lower the potassium",
        content: "The QRS narrows after calcium.",
        patientStatus: "guarded",
        vitals: [
          vit("k", "Potassium", 6.9, "mmol/L", "flat", "warning"),
          vit("hr", "Heart rate", 62, "bpm", "up", "normal"),
          vit("ecg", "ECG", "Improving", undefined, undefined, "warning"),
        ],
        choices: [
          ch("a", "Insulin–dextrose (± salbutamol), urgent dialysis", "optimal", 0, "Correct — shift K+, then remove it definitively with dialysis.", "survived", "🩸"),
          ch("b", "Oral binder alone, recheck in 6 hours", "suboptimal", -20, "Binders are too slow for K+ 7.1 with ECG changes.", "survived", "💊"),
          ch("c", "Do nothing further and observe", "deadly", -100, "Untreated severe hyperkalaemia progresses to VF or asystole.", "died", "🚫"),
        ],
      },
      survived: survived("Potassium falls, the ECG normalises, and she is dialysed.", [
        vit("k", "Potassium", 5.0, "mmol/L", "down", "normal"),
        vit("ecg", "ECG", "Normal", undefined, undefined, "normal"),
      ]),
      died: died("She arrests from hyperkalaemia. Review the treatment order."),
    },
  },
  {
    id: "bcase-dka",
    title: "Diabetic ketoacidosis — getting the sequence right",
    specialty: "Endocrine System",
    scenario: "A 22-year-old with new T1DM: glucose 30, ketones 5.5, pH 7.08, K+ 5.4, dehydrated.",
    citations: ["JBDS — Management of DKA in Adults"],
    summary: "Sequence DKA management safely (fluids, insulin, potassium).",
    subtitle: "New-onset T1DM in DKA",
    difficulty: "Moderate",
    icon: "🩸",
    patient: { name: "Leo", age: 22, sex: "M", presentation: "Vomiting, polyuria, drowsy", tags: ["Endocrine", "Acidosis"] },
    stages: [
      { id: "resus", label: "Resuscitation" },
      { id: "correct", label: "Correction" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "resus",
        stageLabel: "Resuscitation",
        prompt: "First intervention",
        content: "He is dehydrated and acidotic.",
        patientStatus: "unstable",
        vitals: [
          vit("glu", "Glucose", 30, "mmol/L", "up", "critical"),
          vit("ket", "Ketones", 5.5, "mmol/L", "up", "critical"),
          vit("ph", "pH", 7.08, undefined, "down", "critical"),
        ],
        choices: [
          ch("a", "Start IV 0.9% saline resuscitation", "optimal", 0, "Correct — fluids first to restore circulating volume.", "n2", "💧"),
          ch("b", "Start fixed-rate insulin before any fluids", "suboptimal", -20, "Insulin before fluids worsens hypovolaemia and can crash the circulation.", "n2", "💉"),
          ch("c", "IV insulin bolus + potassium-free fluids", "deadly", -100, "Aggressive insulin without fluids/K+ precipitates fatal hypokalaemia.", "died", "⚠️"),
        ],
      },
      n2: {
        stageId: "correct",
        stageLabel: "Correction",
        prompt: "Glucose falling, K+ now 3.2 — next",
        content: "Fluids are running; the latest K+ is 3.2.",
        patientStatus: "guarded",
        vitals: [
          vit("glu", "Glucose", 16, "mmol/L", "down", "warning"),
          vit("k", "Potassium", 3.2, "mmol/L", "down", "critical"),
          vit("ket", "Ketones", 3.1, "mmol/L", "down", "warning"),
        ],
        choices: [
          ch("a", "Continue insulin, add K+ to fluids, add dextrose", "optimal", 0, "Correct — replace potassium and prevent hypoglycaemia while clearing ketones.", "survived", "🧂"),
          ch("b", "Stop insulin because glucose is improving", "suboptimal", -20, "Stopping insulin halts ketone clearance — continue it and add dextrose.", "survived", "🛑"),
          ch("c", "Continue insulin, withhold potassium", "deadly", -100, "Without replacement, K+ 3.2 falls to a fatal level.", "died", "🚫"),
        ],
      },
      survived: survived("The acidosis clears, electrolytes normalise, and he moves to subcutaneous insulin.", [
        vit("glu", "Glucose", 9, "mmol/L", "down", "normal"),
        vit("k", "Potassium", 4.2, "mmol/L", "up", "normal"),
      ]),
      died: died("A fatal arrhythmia from hypokalaemia. Review the sequence."),
    },
  },
  {
    id: "bcase-stroke-thrombolysis",
    title: "Acute stroke — the thrombolysis decision",
    specialty: "Nervous and Special Senses System",
    scenario: "A 68-year-old has dense right hemiparesis and aphasia, onset 2 hours ago, NIHSS 12.",
    citations: ["NICE NG128", "AHA/ASA Acute Ischaemic Stroke Guidelines"],
    summary: "Make the thrombolysis decision safely.",
    subtitle: "Hyperacute stroke within the window",
    difficulty: "Hard",
    icon: "🧠",
    patient: { name: "Joan", age: 68, sex: "F", presentation: "Right hemiparesis, aphasia", tags: ["Stroke", "Time-critical"] },
    stages: [
      { id: "image", label: "Imaging" },
      { id: "treat", label: "Reperfusion" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "image",
        stageLabel: "Imaging",
        prompt: "Within the window — first step",
        content: "She has a dense deficit.",
        patientStatus: "unstable",
        vitals: [
          vit("nihss", "NIHSS", 12, undefined, "flat", "critical"),
          vit("bp", "Blood pressure", "172/96", "mmHg", "up", "warning"),
          vit("onset", "Onset", "2 h", undefined, undefined, "warning"),
        ],
        choices: [
          ch("a", "Urgent non-contrast CT to exclude haemorrhage", "optimal", 0, "Correct — imaging must exclude haemorrhage before thrombolysis.", "n2", "🩻"),
          ch("b", "Give aspirin now, CT later", "suboptimal", -20, "Aspirin is contraindicated until haemorrhage is excluded.", "n2", "💊"),
          ch("c", "Thrombolyse immediately on clinical picture", "deadly", -100, "Thrombolysing without excluding haemorrhage can cause fatal bleeding.", "died", "⚠️"),
        ],
      },
      n2: {
        stageId: "treat",
        stageLabel: "Reperfusion",
        prompt: "CT excludes haemorrhage, no contraindications — next",
        content: "She remains within 4.5 hours.",
        patientStatus: "guarded",
        vitals: [
          vit("nihss", "NIHSS", 12, undefined, "flat", "critical"),
          vit("ct", "CT", "No bleed", undefined, undefined, "normal"),
        ],
        choices: [
          ch("a", "Thrombolyse, assess for thrombectomy if LVO", "optimal", 0, "Correct — reperfusion within the window improves outcome.", "survived", "💉"),
          ch("b", "Admit for observation without reperfusion", "suboptimal", -20, "Withholding reperfusion in an eligible patient forgoes major benefit.", "survived", "🛏️"),
          ch("c", "Give a higher-than-recommended alteplase dose", "deadly", -100, "Overdosing the thrombolytic raises the risk of fatal haemorrhage.", "died", "⚠️"),
        ],
      },
      survived: survived("She receives reperfusion and makes a meaningful recovery.", [
        vit("nihss", "NIHSS", 4, undefined, "down", "warning"),
      ]),
      died: died("A fatal haemorrhage follows an unsafe decision. Review the checks."),
    },
  },
  {
    id: "bcase-gi-bleed",
    title: "Massive upper GI bleed",
    specialty: "Digestive and Biliary Tract System",
    scenario: "A 55-year-old with alcohol excess has large-volume haematemesis, HR 120, BP 88/56.",
    citations: ["NICE CG141", "Baveno VII"],
    summary: "Resuscitate and manage variceal upper GI bleeding.",
    subtitle: "Haemodynamically unstable haematemesis",
    difficulty: "Hard",
    icon: "🩸",
    patient: { name: "Frank", age: 55, sex: "M", presentation: "Large-volume haematemesis", tags: ["Haemorrhage", "Varices"] },
    stages: [
      { id: "resus", label: "Resuscitation" },
      { id: "definitive", label: "Definitive Care" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "resus",
        stageLabel: "Resuscitation",
        prompt: "Shocked from a large bleed — first priority",
        content: "He is actively bleeding and shocked.",
        patientStatus: "critical",
        vitals: [
          vit("hr", "Heart rate", 120, "bpm", "up", "critical"),
          vit("bp", "Blood pressure", "88/56", "mmHg", "down", "critical"),
          vit("hb", "Haemoglobin", 72, "g/L", "down", "warning"),
        ],
        choices: [
          ch("a", "ABC: large-bore access, fluids/blood, major haemorrhage call", "optimal", 0, "Correct — resuscitate first.", "n2", "🚑"),
          ch("b", "Endoscopy before any resuscitation", "suboptimal", -20, "Never scope an unresuscitated shocked patient.", "n2", "🔬"),
          ch("c", "Oral iron and outpatient follow-up", "deadly", -100, "Discharging exsanguinating haematemesis is fatal.", "died", "🚪"),
        ],
      },
      n2: {
        stageId: "definitive",
        stageLabel: "Definitive Care",
        prompt: "Resuscitated, variceal source suspected — next",
        content: "He is stabilised enough for endoscopy.",
        patientStatus: "guarded",
        vitals: [
          vit("hr", "Heart rate", 98, "bpm", "down", "warning"),
          vit("bp", "Blood pressure", "104/66", "mmHg", "up", "warning"),
        ],
        choices: [
          ch("a", "Terlipressin + antibiotics, then urgent endoscopy/banding", "optimal", 0, "Correct — vasoactive drugs, antibiotics, and endoscopic therapy.", "survived", "💉"),
          ch("b", "Endoscopy alone, no terlipressin/antibiotics", "suboptimal", -20, "Omitting these worsens outcomes in variceal bleeding.", "survived", "🔬"),
          ch("c", "Over-transfuse aggressively to a normal Hb", "deadly", -100, "Over-transfusion raises portal pressure and causes fatal rebleeding.", "died", "⚠️"),
        ],
      },
      survived: survived("Bleeding is controlled endoscopically and he stabilises.", [
        vit("hr", "Heart rate", 84, "bpm", "down", "normal"),
        vit("hb", "Haemoglobin", 96, "g/L", "up", "warning"),
      ]),
      died: died("He exsanguinates. Review the priorities."),
    },
  },
  {
    id: "bcase-pph",
    title: "Primary postpartum haemorrhage",
    specialty: "Reproductive System and Perinatal Period",
    scenario: "Ten minutes after delivery, brisk bleeding (>1000 mL), HR 118, BP 92/58, soft uterus.",
    citations: ["RCOG Green-top Guideline 52 — PPH"],
    summary: "Manage primary PPH from uterine atony.",
    subtitle: "Atonic postpartum haemorrhage",
    difficulty: "Moderate",
    icon: "🤰",
    patient: { name: "Sara", age: 31, sex: "F", presentation: "Brisk PV bleeding post-delivery", tags: ["Obstetric", "Haemorrhage"] },
    stages: [
      { id: "first", label: "First-line" },
      { id: "escalate", label: "Escalation" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "first",
        stageLabel: "First-line",
        prompt: "Atony is likely — first action",
        content: "The uterus is soft and she is bleeding briskly.",
        patientStatus: "critical",
        vitals: [
          vit("hr", "Heart rate", 118, "bpm", "up", "critical"),
          vit("bp", "Blood pressure", "92/58", "mmHg", "down", "warning"),
          vit("ebl", "Blood loss", 1100, "mL", "up", "critical"),
        ],
        choices: [
          ch("a", "Call help, uterine massage, give oxytocin", "optimal", 0, "Correct — mechanical + pharmacological measures with team activation.", "n2", "🤲"),
          ch("b", "Catheterise and reassess in 15 minutes", "suboptimal", -20, "An empty bladder helps but isn't first-line and delays treatment.", "n2", "💧"),
          ch("c", "Wait for the placenta check before intervening", "deadly", -100, "Delaying treatment of brisk PPH leads to fatal exsanguination.", "died", "⏳"),
        ],
      },
      n2: {
        stageId: "escalate",
        stageLabel: "Escalation",
        prompt: "Bleeding continues despite oxytocin — next",
        content: "First-line measures have not controlled it.",
        patientStatus: "worsening",
        vitals: [
          vit("hr", "Heart rate", 124, "bpm", "up", "critical"),
          vit("bp", "Blood pressure", "84/52", "mmHg", "down", "critical"),
          vit("ebl", "Blood loss", 1800, "mL", "up", "critical"),
        ],
        choices: [
          ch("a", "Escalate uterotonics, major haemorrhage protocol, theatre/balloon", "optimal", 0, "Correct — stepwise escalation with resuscitation.", "survived", "🚑"),
          ch("b", "Repeat the same oxytocin dose, keep observing", "suboptimal", -20, "Persisting with one failed agent wastes time — escalate.", "survived", "🔁"),
          ch("c", "Give an NSAID for pain, monitor only", "deadly", -100, "Failure to escalate ongoing PPH is fatal.", "died", "🚫"),
        ],
      },
      survived: survived("Bleeding is controlled and she is stabilised with transfusion.", [
        vit("hr", "Heart rate", 92, "bpm", "down", "normal"),
        vit("bp", "Blood pressure", "112/70", "mmHg", "up", "normal"),
      ]),
      died: died("Fatal haemorrhage follows delayed escalation. Review the steps."),
    },
  },
  {
    id: "bcase-tension-ptx",
    title: "Tension pneumothorax",
    specialty: "Respiratory System",
    scenario: "A ventilated trauma patient desaturates with tracheal deviation, absent right breath sounds, BP 80/50.",
    citations: ["ATLS — Thoracic Trauma"],
    summary: "Recognise and decompress a tension pneumothorax.",
    subtitle: "Obstructive shock in trauma",
    difficulty: "Hard",
    icon: "🫁",
    patient: { name: "Tom", age: 38, sex: "M", presentation: "Trauma, sudden desaturation", tags: ["Trauma", "Airway"] },
    stages: [
      { id: "decompress", label: "Decompression" },
      { id: "definitive", label: "Definitive" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "decompress",
        stageLabel: "Decompression",
        prompt: "Signs point to tension pneumothorax — first action",
        content: "He is rapidly deteriorating.",
        patientStatus: "critical",
        vitals: [
          vit("spo2", "SpO₂", 82, "%", "down", "critical"),
          vit("bp", "Blood pressure", "80/50", "mmHg", "down", "critical"),
          vit("hr", "Heart rate", 132, "bpm", "up", "critical"),
        ],
        choices: [
          ch("a", "Immediate needle/finger decompression", "optimal", 0, "Correct — tension pneumothorax is a clinical diagnosis treated immediately.", "n2", "🪡"),
          ch("b", "Increase ventilator pressures", "suboptimal", -20, "Raising pressures worsens the tension — decompress instead.", "n2", "🎚️"),
          ch("c", "Order a chest X-ray and wait", "deadly", -100, "Waiting for imaging in tension pneumothorax causes a fatal arrest.", "died", "🩻"),
        ],
      },
      n2: {
        stageId: "definitive",
        stageLabel: "Definitive",
        prompt: "Decompression released air with improvement — next",
        content: "He has improved transiently.",
        patientStatus: "guarded",
        vitals: [
          vit("spo2", "SpO₂", 94, "%", "up", "warning"),
          vit("bp", "Blood pressure", "104/66", "mmHg", "up", "warning"),
        ],
        choices: [
          ch("a", "Insert a definitive chest drain", "optimal", 0, "Correct — needle decompression is temporising; a chest drain is definitive.", "survived", "🧰"),
          ch("b", "Leave the cannula in place and carry on", "suboptimal", -20, "A cannula can kink or block — a chest drain is required.", "survived", "📌"),
          ch("c", "Remove the cannula and observe without a drain", "deadly", -100, "The tension re-accumulates and causes arrest.", "died", "🚫"),
        ],
      },
      survived: survived("A chest drain is sited, the lung re-expands, and he stabilises.", [
        vit("spo2", "SpO₂", 98, "%", "up", "normal"),
        vit("bp", "Blood pressure", "118/74", "mmHg", "flat", "normal"),
      ]),
      died: died("Cardiac arrest from untreated tension. Review the decision."),
    },
  },
  {
    id: "bcase-massive-pe",
    title: "Massive pulmonary embolism",
    specialty: "Cardiovascular System",
    scenario: "A post-op patient has pleuritic chest pain, severe dyspnoea, syncope, HR 130, BP 84/52, RV strain.",
    citations: ["ESC Guidelines on Acute PE 2019"],
    summary: "Manage high-risk (massive) pulmonary embolism.",
    subtitle: "Obstructive shock from PE",
    difficulty: "Hard",
    icon: "🫀",
    patient: { name: "Grace", age: 45, sex: "F", presentation: "Post-op syncope and dyspnoea", tags: ["PE", "Shock"] },
    stages: [
      { id: "stabilise", label: "Stabilisation" },
      { id: "reperfuse", label: "Reperfusion" },
    ],
    startNodeId: "n1",
    nodes: {
      n1: {
        stageId: "stabilise",
        stageLabel: "Stabilisation",
        prompt: "Obstructive shock from suspected massive PE — first action",
        content: "She is hypotensive with right-heart strain.",
        patientStatus: "critical",
        vitals: [
          vit("hr", "Heart rate", 130, "bpm", "up", "critical"),
          vit("bp", "Blood pressure", "84/52", "mmHg", "down", "critical"),
          vit("spo2", "SpO₂", 86, "%", "down", "critical"),
        ],
        choices: [
          ch("a", "Resuscitate, O₂, high-risk PE pathway, senior input", "optimal", 0, "Correct — stabilise and escalate immediately.", "n2", "🚑"),
          ch("b", "Send for CTPA before any treatment", "suboptimal", -20, "In unstable PE don't delay — treat on clinical grounds with bedside echo.", "n2", "🩻"),
          ch("c", "Give a large rapid fluid bolus", "deadly", -100, "Aggressive fluids overload the failing right ventricle and cause arrest.", "died", "⚠️"),
        ],
      },
      n2: {
        stageId: "reperfuse",
        stageLabel: "Reperfusion",
        prompt: "Confirmed massive PE, still in shock — next",
        content: "She remains in obstructive shock.",
        patientStatus: "worsening",
        vitals: [
          vit("bp", "Blood pressure", "80/48", "mmHg", "down", "critical"),
          vit("rv", "RV strain", "Severe", undefined, undefined, "critical"),
        ],
        choices: [
          ch("a", "Systemic thrombolysis (or embolectomy)", "optimal", 0, "Correct — reperfusion is indicated in massive PE with shock.", "survived", "💉"),
          ch("b", "Prophylactic-dose anticoagulation only", "suboptimal", -20, "Prophylactic dosing is inadequate — therapeutic ± thrombolysis is needed.", "survived", "💊"),
          ch("c", "Withhold thrombolysis and observe", "deadly", -100, "Untreated massive PE with shock is rapidly fatal.", "died", "🚫"),
        ],
      },
      survived: survived("She receives reperfusion, the right heart recovers, and she stabilises.", [
        vit("bp", "Blood pressure", "112/70", "mmHg", "up", "normal"),
        vit("spo2", "SpO₂", 97, "%", "up", "normal"),
      ]),
      died: died("She arrests from obstructive shock. Review the management."),
    },
  },
];
