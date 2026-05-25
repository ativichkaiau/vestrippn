/**
 * W08 — 10 interactive ("choose-your-path") clinical cases.
 *
 * ⚠️ PLACEHOLDER TEACHING CONTENT — drafted for the engine; every "deadly"
 * pathway MUST be clinically reviewed before production use.
 *
 * Each case is a small decision graph: two decision nodes (n1 → n2) and two
 * terminal nodes (survived / died). Choices are classified optimal / suboptimal
 * / deadly; deadly is fatal regardless of score. The seed wraps `nodes` in
 * { type:"branching", startScore:100, ... } for ClinicalCase.branches.
 */

type Outcome = "optimal" | "suboptimal" | "deadly";
interface Choice {
  id: string;
  label: string;
  outcome: Outcome;
  scoreDelta: number;
  feedback: string;
  next: string;
}
interface Node {
  content: string;
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
  startNodeId: string;
  nodes: Record<string, Node>;
}

// Helper: a decision node with optimal/suboptimal/deadly choices.
function decision(
  content: string,
  opt: [string, string, string], // [optimalLabel, suboptimalLabel, deadlyLabel]
  fb: [string, string, string], // matching feedback
  next: { optimal: string; suboptimal: string; deadly: string },
): Node {
  return {
    content,
    choices: [
      { id: "a", label: opt[0], outcome: "optimal", scoreDelta: 0, feedback: fb[0], next: next.optimal },
      { id: "b", label: opt[1], outcome: "suboptimal", scoreDelta: -20, feedback: fb[1], next: next.suboptimal },
      { id: "c", label: opt[2], outcome: "deadly", scoreDelta: -100, feedback: fb[2], next: next.deadly },
    ],
  };
}
const survived = (content: string): Node => ({ content, end: "survived" });
const died = (content: string): Node => ({ content, end: "died" });

const DIED = died("The patient deteriorates and dies. Review the decision points and try again.");

export const branchingCases: BranchingCaseSeed[] = [
  {
    id: "bcase-anaphylaxis",
    title: "Anaphylaxis at a restaurant",
    specialty: "Respiratory System",
    scenario:
      "A 24-year-old collapses minutes after eating peanuts — facial swelling, widespread urticaria, wheeze, stridor, and BP 78/40.",
    citations: ["Resuscitation Council UK — Anaphylaxis Guidelines"],
    summary: "Manage acute anaphylaxis under time pressure.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "She is stridulous and hypotensive. What is your immediate priority?",
        [
          "Give 0.5 mg IM adrenaline (1:1000) into the anterolateral thigh",
          "Give IV chlorphenamine and hydrocortisone first",
          "Give 0.5 mg IV adrenaline (1:1000) as a rapid bolus",
        ],
        [
          "Correct — IM adrenaline is first-line and reverses airway and circulatory compromise.",
          "Antihistamines and steroids are adjuncts, not first-line — you've lost critical minutes.",
          "Undiluted IV adrenaline bolus causes a malignant arrhythmia and cardiac arrest.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "After IM adrenaline she remains hypotensive. Next step?",
        [
          "High-flow oxygen, IV fluid bolus, and repeat IM adrenaline at 5 minutes if needed",
          "Sit her fully upright to ease her breathing",
          "Withhold further adrenaline and simply observe",
        ],
        [
          "Correct — supportive resuscitation plus repeat dosing stabilises her.",
          "Sitting a hypotensive patient up can precipitate collapse — lay her flat with legs raised.",
          "Under-treated anaphylaxis progresses to arrest; repeat adrenaline was required.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived(
        "She stabilises, is admitted for observation, and is discharged with an adrenaline auto-injector and allergy referral.",
      ),
      died: DIED,
    },
  },
  {
    id: "bcase-septic-shock",
    title: "Septic shock from pneumonia",
    specialty: "Microbiology and Parasitology",
    scenario:
      "A 70-year-old with a productive cough is confused, febrile (39.2°C), tachycardic, BP 86/50, lactate 4.2.",
    citations: ["Surviving Sepsis Campaign 2021", "NICE NG51"],
    summary: "Apply the Sepsis Six within the first hour.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "He meets criteria for septic shock. What do you do first?",
        [
          "Take blood cultures, then give broad-spectrum IV antibiotics and a fluid bolus",
          "Order a CT chest and wait for the result before treating",
          "Discharge on oral antibiotics — the chest sounds clear",
        ],
        [
          "Correct — cultures first, but don't delay antibiotics and resuscitation.",
          "Imaging must not delay antibiotics and fluids in shock — you've lost the golden hour.",
          "Discharging septic shock is fatal; he needs resuscitation and admission.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "After the first bolus he remains hypotensive (MAP 58). Next?",
        [
          "Further fluid resuscitation, senior review, and escalate to critical care for vasopressors",
          "Give an antipyretic and reassess in an hour",
          "Restrict fluids for fear of overload and keep observing",
        ],
        [
          "Correct — refractory shock needs ICU and vasopressors.",
          "Treating the fever doesn't treat the shock — escalation was needed.",
          "Under-resuscitated septic shock progresses to multi-organ failure.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("He responds to resuscitation, reaches ICU, and the source is controlled."),
      died: DIED,
    },
  },
  {
    id: "bcase-vf-arrest",
    title: "Witnessed VF cardiac arrest",
    specialty: "Cardiovascular System",
    scenario:
      "A 60-year-old collapses, is unresponsive and not breathing normally; the monitor shows ventricular fibrillation.",
    citations: ["Resuscitation Council UK — Adult ALS"],
    summary: "Run the shockable-rhythm ALS algorithm.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "VF is confirmed. Immediate action?",
        [
          "Deliver an unsynchronised shock and resume chest compressions immediately",
          "Give amiodarone before any shock",
          "Attempt a synchronised cardioversion",
        ],
        [
          "Correct — VF is shockable: defibrillate, then continue CPR.",
          "Defibrillation is the priority in VF; drugs come after shocks.",
          "You can't synchronise to VF — the device won't discharge and arrest time is lost.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "After 2 minutes of CPR he remains in VF. Next?",
        [
          "Shock again, continue CPR, and give adrenaline and amiodarone per ALS",
          "Stop to recheck a pulse straight after the shock",
          "Abandon resuscitation after one further shock",
        ],
        [
          "Correct — repeat shocks with drugs after the third shock.",
          "Don't pause CPR to check a pulse mid-cycle; minimise interruptions.",
          "Premature termination of a shockable arrest forgoes a survivable rhythm.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("ROSC is achieved; he is transferred for post-arrest care and PCI."),
      died: DIED,
    },
  },
  {
    id: "bcase-hyperkalaemia",
    title: "Severe hyperkalaemia in a dialysis patient",
    specialty: "Renal and Urinary Tract",
    scenario:
      "A haemodialysis patient who missed sessions has K+ 7.1 with tall tented T waves and a broadening QRS.",
    citations: ["UK Renal Association — Hyperkalaemia Guideline"],
    summary: "Treat life-threatening hyperkalaemia in the right order.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "The ECG shows hyperkalaemic changes. First step?",
        [
          "Give IV calcium gluconate to stabilise the myocardium",
          "Give insulin–dextrose first and skip the calcium",
          "Run potassium-containing IV fluids while arranging dialysis",
        ],
        [
          "Correct — cardiac membrane stabilisation comes first when there are ECG changes.",
          "Shifting potassium is needed, but myocardial stabilisation (calcium) must come first.",
          "Giving potassium worsens the arrhythmia risk and can cause arrest.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "Myocardium stabilised. How do you lower the potassium?",
        [
          "Insulin with dextrose (± salbutamol), then arrange urgent dialysis",
          "Give an oral potassium binder alone and recheck in 6 hours",
          "Do nothing further and observe on telemetry",
        ],
        [
          "Correct — shift potassium intracellularly, then remove it definitively with dialysis.",
          "Binders are too slow for K+ 7.1 with ECG changes — rapid shifting plus dialysis was needed.",
          "Untreated severe hyperkalaemia progresses to VF or asystole.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("Potassium falls, the ECG normalises, and he is dialysed."),
      died: DIED,
    },
  },
  {
    id: "bcase-dka",
    title: "Diabetic ketoacidosis — getting the sequence right",
    specialty: "Endocrine System",
    scenario:
      "A 22-year-old with new type 1 diabetes: glucose 30, ketones 5.5, pH 7.08, K+ 5.4, markedly dehydrated.",
    citations: ["JBDS — Management of DKA in Adults"],
    summary: "Sequence DKA management safely (fluids, insulin, potassium).",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "What is the first intervention?",
        [
          "Start IV 0.9% saline resuscitation",
          "Start fixed-rate insulin before any fluids",
          "Give an IV insulin bolus and plan potassium-free fluids",
        ],
        [
          "Correct — fluids first to restore circulating volume.",
          "Insulin before fluids worsens hypovolaemia and can crash the circulation.",
          "Aggressive insulin without fluids or potassium planning precipitates fatal hypokalaemia.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "Fluids running; glucose falling; the latest K+ is 3.2. Next?",
        [
          "Continue fixed-rate insulin, add potassium to fluids, and add dextrose as glucose falls",
          "Stop the insulin because the glucose is improving",
          "Continue insulin and withhold potassium replacement",
        ],
        [
          "Correct — replace potassium and prevent hypoglycaemia while clearing ketones.",
          "Stopping insulin halts ketone clearance; continue it and add dextrose instead.",
          "Insulin drives potassium intracellularly — without replacement, K+ 3.2 falls to a fatal level.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("The acidosis clears, electrolytes normalise, and she transitions to subcutaneous insulin."),
      died: DIED,
    },
  },
  {
    id: "bcase-stroke-thrombolysis",
    title: "Acute stroke — the thrombolysis decision",
    specialty: "Nervous and Special Senses System",
    scenario:
      "A 68-year-old has dense right hemiparesis and aphasia, onset 2 hours ago, NIHSS 12.",
    citations: ["NICE NG128", "AHA/ASA Acute Ischaemic Stroke Guidelines"],
    summary: "Make the thrombolysis decision safely.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "He arrives within the window. First step?",
        [
          "Urgent non-contrast CT head to exclude haemorrhage",
          "Give aspirin now and arrange the CT later",
          "Thrombolyse immediately on the clinical picture alone",
        ],
        [
          "Correct — imaging must exclude haemorrhage before any thrombolysis.",
          "Aspirin is contraindicated until haemorrhage is excluded and thrombolysis decided.",
          "Thrombolysing without excluding haemorrhage can cause fatal intracranial bleeding.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "CT excludes haemorrhage; he's within 4.5 hours with no contraindications. Next?",
        [
          "Thrombolyse and assess for thrombectomy if there's a large-vessel occlusion",
          "Admit for observation without reperfusion",
          "Give a higher-than-recommended alteplase dose to maximise the effect",
        ],
        [
          "Correct — reperfusion within the window improves outcome.",
          "Withholding reperfusion in an eligible patient forgoes major benefit.",
          "Overdosing the thrombolytic dramatically raises the risk of fatal haemorrhage.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("He receives reperfusion and makes a meaningful recovery."),
      died: DIED,
    },
  },
  {
    id: "bcase-gi-bleed",
    title: "Massive upper GI bleed",
    specialty: "Digestive and Biliary Tract System",
    scenario:
      "A 55-year-old with alcohol excess presents with large-volume haematemesis, HR 120, BP 88/56.",
    citations: ["NICE CG141", "Baveno VII (variceal bleeding)"],
    summary: "Resuscitate and manage variceal upper GI bleeding.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "He is shocked from a large bleed. First priority?",
        [
          "ABC: two large-bore cannulae, fluids/blood, activate the major haemorrhage pathway",
          "Arrange endoscopy before any resuscitation",
          "Give oral iron and arrange outpatient follow-up",
        ],
        [
          "Correct — resuscitate first.",
          "Endoscopy is needed, but only after resuscitation — never scope an unresuscitated shocked patient.",
          "Discharging exsanguinating haematemesis is fatal.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "Resuscitated; a variceal source is suspected. Next?",
        [
          "Terlipressin and prophylactic antibiotics, then urgent endoscopy for banding",
          "Endoscopy alone, without terlipressin or antibiotics",
          "Over-transfuse aggressively to a normal haemoglobin",
        ],
        [
          "Correct — vasoactive drugs, antibiotics, and endoscopic therapy.",
          "Omitting terlipressin and antibiotics worsens outcomes in variceal bleeding.",
          "Over-transfusion raises portal pressure and precipitates fatal rebleeding.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("Bleeding is controlled endoscopically and he stabilises."),
      died: DIED,
    },
  },
  {
    id: "bcase-pph",
    title: "Primary postpartum haemorrhage",
    specialty: "Reproductive System and Perinatal Period",
    scenario:
      "Ten minutes after delivery a woman has brisk bleeding (>1000 mL), HR 118, BP 92/58, and a soft uterus.",
    citations: ["RCOG Green-top Guideline 52 — PPH"],
    summary: "Manage primary PPH from uterine atony.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "Atony is the likely cause. First action?",
        [
          "Call for help, rub up a contraction (uterine massage), and give oxytocin",
          "Insert a urinary catheter and reassess in 15 minutes",
          "Wait for the placenta to be checked before any intervention",
        ],
        [
          "Correct — mechanical and pharmacological measures with team activation.",
          "An empty bladder helps, but it isn't first-line and delays definitive measures.",
          "Delaying treatment of brisk PPH leads to fatal exsanguination.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "Bleeding continues despite oxytocin. Next?",
        [
          "Escalate uterotonics (ergometrine/carboprost), major haemorrhage protocol, prepare for theatre/balloon",
          "Repeat the same oxytocin dose and keep observing",
          "Give an NSAID for pain and continue monitoring only",
        ],
        [
          "Correct — stepwise escalation with resuscitation.",
          "Persisting with one failed agent wastes time — escalate.",
          "Failure to escalate ongoing PPH is fatal.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("Bleeding is controlled and she is stabilised with transfusion."),
      died: DIED,
    },
  },
  {
    id: "bcase-tension-ptx",
    title: "Tension pneumothorax",
    specialty: "Respiratory System",
    scenario:
      "A ventilated trauma patient suddenly desaturates with tracheal deviation, absent right breath sounds, distended neck veins, and BP 80/50.",
    citations: ["ATLS — Thoracic Trauma"],
    summary: "Recognise and decompress a tension pneumothorax.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "The signs point to a tension pneumothorax. First action?",
        [
          "Immediate needle/finger decompression — do not wait for imaging",
          "Increase the ventilator pressures to improve oxygenation",
          "Order an urgent chest X-ray and wait for the result",
        ],
        [
          "Correct — tension pneumothorax is a clinical diagnosis treated immediately.",
          "Raising pressures worsens the tension — decompress instead.",
          "Waiting for imaging in tension pneumothorax causes a fatal arrest.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "Decompression releases air with improvement. Next?",
        [
          "Insert a definitive chest drain and reassess",
          "Leave the cannula in place and carry on",
          "Remove the cannula and observe without a drain",
        ],
        [
          "Correct — needle decompression is temporising; a chest drain is definitive.",
          "A cannula can kink or block — a chest drain is required.",
          "The tension re-accumulates and causes arrest.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("A chest drain is sited, the lung re-expands, and he stabilises."),
      died: DIED,
    },
  },
  {
    id: "bcase-massive-pe",
    title: "Massive pulmonary embolism",
    specialty: "Cardiovascular System",
    scenario:
      "A 45-year-old post-op patient has pleuritic chest pain, severe dyspnoea, syncope, HR 130, BP 84/52, and right-heart strain.",
    citations: ["ESC Guidelines on Acute Pulmonary Embolism 2019"],
    summary: "Manage high-risk (massive) pulmonary embolism.",
    startNodeId: "n1",
    nodes: {
      n1: decision(
        "He has obstructive shock from a suspected massive PE. First action?",
        [
          "Resuscitate, give oxygen, and start the high-risk PE pathway with senior input",
          "Send him for a CTPA before any treatment",
          "Give a large rapid fluid bolus to fill the right heart",
        ],
        [
          "Correct — stabilise and escalate immediately.",
          "In unstable PE don't delay — treat on clinical grounds with bedside echo.",
          "Aggressive fluids overload the failing right ventricle and precipitate arrest.",
        ],
        { optimal: "n2", suboptimal: "n2", deadly: "died" },
      ),
      n2: decision(
        "He remains in shock with confirmed massive PE. Next?",
        [
          "Systemic thrombolysis (or embolectomy) for high-risk PE",
          "Start prophylactic-dose anticoagulation only",
          "Withhold thrombolysis and continue observation",
        ],
        [
          "Correct — reperfusion is indicated in massive PE with shock.",
          "Prophylactic dosing is inadequate — therapeutic anticoagulation ± thrombolysis is needed.",
          "Untreated massive PE with shock is rapidly fatal.",
        ],
        { optimal: "survived", suboptimal: "survived", deadly: "died" },
      ),
      survived: survived("He receives reperfusion, the right heart recovers, and he stabilises."),
      died: DIED,
    },
  },
];
