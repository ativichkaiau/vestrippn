/**
 * Shapes for the Learn content banks (stored in IELTSItem.answerKey and
 * ClinicalCase.branches as JSON) plus tolerant parsers. Endpoints never trust
 * the JSON blindly — bad/legacy rows degrade to empty rather than throwing.
 */

export interface QuestionOption {
  id: string;
  label: string;
}

// IELTSItem.answerKey
export interface IeltsAnswerKey {
  options: QuestionOption[];
  correctId: string;
  explanation?: string;
}

// ClinicalCase.branches
export interface CaseStep {
  id: string;
  label: string;
  content: string;
}
export interface CaseBranches {
  steps: CaseStep[];
  summary?: string;
}

export function parseAnswerKey(value: unknown): IeltsAnswerKey | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.options) || typeof v.correctId !== "string") return null;
  const options = v.options
    .filter(
      (o): o is QuestionOption =>
        !!o &&
        typeof (o as QuestionOption).id === "string" &&
        typeof (o as QuestionOption).label === "string",
    )
    .map((o) => ({ id: o.id, label: o.label }));
  if (options.length === 0) return null;
  return {
    options,
    correctId: v.correctId,
    explanation: typeof v.explanation === "string" ? v.explanation : undefined,
  };
}

export function parseBranches(value: unknown): CaseBranches {
  if (!value || typeof value !== "object") return { steps: [] };
  const v = value as Record<string, unknown>;
  const steps = Array.isArray(v.steps)
    ? v.steps
        .filter(
          (s): s is CaseStep =>
            !!s &&
            typeof (s as CaseStep).id === "string" &&
            typeof (s as CaseStep).label === "string" &&
            typeof (s as CaseStep).content === "string",
        )
        .map((s) => ({ id: s.id, label: s.label, content: s.content }))
    : [];
  return { steps, summary: typeof v.summary === "string" ? v.summary : undefined };
}

// ============================================================================
// Branching ("choose-your-path") cases — interactive decision graphs.
// Stored in ClinicalCase.branches with { type: "branching", ... }.
// ============================================================================

export type CaseType = "linear" | "branching";
export type ChoiceOutcome = "optimal" | "suboptimal" | "deadly";
export type PatientStatus =
  | "stable"
  | "guarded"
  | "worsening"
  | "critical"
  | "improving"
  | "unstable";

export interface Vital {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  state?: "normal" | "warning" | "critical";
}
export interface PatientInfo {
  name: string;
  age?: number;
  sex?: string;
  presentation?: string;
  tags?: string[];
}
export interface Stage {
  id: string;
  label: string;
}

export interface BranchingChoice {
  id: string;
  label: string;
  outcome: ChoiceOutcome;
  scoreDelta: number; // applied to the run score (deadly is also forced fatal)
  feedback: string; // consequence shown after the choice
  next: string; // id of the node to advance to
  icon?: string;
  detail?: string;
}
export interface BranchingNode {
  content: string;
  choices: BranchingChoice[]; // empty when terminal
  end?: "survived" | "died"; // set on terminal nodes
  stageId?: string;
  stageLabel?: string;
  prompt?: string;
  patientStatus?: PatientStatus; // patient state on arriving at this node
  vitals?: Vital[];
}
export interface BranchingCase {
  summary?: string;
  subtitle?: string;
  difficulty?: string;
  icon?: string;
  patient?: PatientInfo;
  stages?: Stage[];
  startNodeId: string;
  startScore: number;
  nodes: Record<string, BranchingNode>;
}

/** Public, spoiler-free view of a node (no outcomes/feedback/next leaked). */
export interface NodeView {
  id: string;
  content: string;
  prompt?: string;
  stageId?: string;
  stageLabel?: string;
  choices: { id: string; label: string; icon?: string; detail?: string }[];
  end?: "survived" | "died";
}

/** Per-user run state, persisted in CaseProgress.state. */
export interface CaseRunState {
  currentNodeId: string;
  score: number;
  status: "active" | "survived" | "died";
  path: { nodeId: string; choiceId: string; outcome: ChoiceOutcome }[];
}

export function caseType(branches: unknown): CaseType {
  if (
    branches &&
    typeof branches === "object" &&
    (branches as Record<string, unknown>).type === "branching"
  ) {
    return "branching";
  }
  return "linear";
}

/** summary works for both linear and branching JSON (top-level `summary`). */
export function caseSummary(branches: unknown): string | undefined {
  if (branches && typeof branches === "object") {
    const s = (branches as Record<string, unknown>).summary;
    if (typeof s === "string") return s;
  }
  return undefined;
}

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

const PATIENT_STATUSES: PatientStatus[] = [
  "stable",
  "guarded",
  "worsening",
  "critical",
  "improving",
  "unstable",
];
function toPatientStatus(v: unknown): PatientStatus | undefined {
  return PATIENT_STATUSES.includes(v as PatientStatus) ? (v as PatientStatus) : undefined;
}

function toVitals(raw: unknown): Vital[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const vitals = raw
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
    .filter((v) => typeof v.id === "string" && typeof v.label === "string")
    .map((v) => ({
      id: v.id as string,
      label: v.label as string,
      value: (typeof v.value === "number" || typeof v.value === "string"
        ? v.value
        : "") as string | number,
      unit: str(v.unit),
      trend:
        v.trend === "up" || v.trend === "down" || v.trend === "flat" ? v.trend : undefined,
      state:
        v.state === "normal" || v.state === "warning" || v.state === "critical"
          ? v.state
          : undefined,
    }));
  return vitals.length ? vitals : undefined;
}

function toPatient(raw: unknown): PatientInfo | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as Record<string, unknown>;
  if (typeof p.name !== "string") return undefined;
  return {
    name: p.name,
    age: typeof p.age === "number" ? p.age : undefined,
    sex: str(p.sex),
    presentation: str(p.presentation),
    tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === "string") : undefined,
  };
}

function toStages(raw: unknown): Stage[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const stages = raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .filter((s) => typeof s.id === "string" && typeof s.label === "string")
    .map((s) => ({ id: s.id as string, label: s.label as string }));
  return stages.length ? stages : undefined;
}

/** A short patient descriptor for the case list (derived from PatientInfo). */
export function patientLabel(patient?: PatientInfo): string | undefined {
  if (!patient) return undefined;
  const demo = [patient.age, patient.sex].filter(Boolean).join(" ");
  return [demo || patient.name, patient.presentation].filter(Boolean).join(" · ") || patient.name;
}

function toChoice(raw: unknown): BranchingChoice | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const outcome = c.outcome;
  if (
    typeof c.id !== "string" ||
    typeof c.label !== "string" ||
    typeof c.next !== "string" ||
    (outcome !== "optimal" && outcome !== "suboptimal" && outcome !== "deadly")
  ) {
    return null;
  }
  return {
    id: c.id,
    label: c.label,
    outcome,
    next: c.next,
    scoreDelta: typeof c.scoreDelta === "number" ? c.scoreDelta : 0,
    feedback: str(c.feedback) ?? "",
    icon: str(c.icon),
    detail: str(c.detail),
  };
}

export function parseBranchingCase(branches: unknown): BranchingCase | null {
  if (!branches || typeof branches !== "object") return null;
  const v = branches as Record<string, unknown>;
  if (v.type !== "branching" || typeof v.startNodeId !== "string") return null;
  if (!v.nodes || typeof v.nodes !== "object") return null;

  const nodes: Record<string, BranchingNode> = {};
  for (const [id, raw] of Object.entries(v.nodes as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const n = raw as Record<string, unknown>;
    if (typeof n.content !== "string") continue;
    const choices = Array.isArray(n.choices)
      ? n.choices.map(toChoice).filter((c): c is BranchingChoice => c !== null)
      : [];
    const end = n.end === "survived" || n.end === "died" ? n.end : undefined;
    nodes[id] = {
      content: n.content,
      choices,
      end,
      prompt: str(n.prompt),
      stageId: str(n.stageId),
      stageLabel: str(n.stageLabel),
      patientStatus: toPatientStatus(n.patientStatus),
      vitals: toVitals(n.vitals),
    };
  }
  if (!nodes[v.startNodeId]) return null;

  return {
    summary: str(v.summary),
    subtitle: str(v.subtitle),
    difficulty: str(v.difficulty),
    icon: str(v.icon),
    patient: toPatient(v.patient),
    stages: toStages(v.stages),
    startNodeId: v.startNodeId,
    startScore: typeof v.startScore === "number" ? v.startScore : 100,
    nodes,
  };
}

export function nodeView(id: string, node: BranchingNode): NodeView {
  return {
    id,
    content: node.content,
    prompt: node.prompt,
    stageId: node.stageId,
    stageLabel: node.stageLabel,
    choices: node.choices.map((c) => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
      detail: c.detail,
    })),
    end: node.end,
  };
}

export function initRunState(bc: BranchingCase): CaseRunState {
  return { currentNodeId: bc.startNodeId, score: bc.startScore, status: "active", path: [] };
}

export function parseRunState(value: unknown): CaseRunState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.currentNodeId !== "string" || typeof v.score !== "number") return null;
  const status =
    v.status === "active" || v.status === "survived" || v.status === "died"
      ? v.status
      : "active";
  const path = Array.isArray(v.path) ? (v.path as CaseRunState["path"]) : [];
  return { currentNodeId: v.currentNodeId, score: v.score, status, path };
}
