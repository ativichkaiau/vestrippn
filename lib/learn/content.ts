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
