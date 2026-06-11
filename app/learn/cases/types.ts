// Shared types + helpers for the Clinical Case simulator.
// The rich fields (patient, stages, vitals, subtitle, choice.icon, difficulty…)
// are OPTIONAL: the UI lights them up when the backend sends them and falls back
// gracefully to today's contract otherwise. See the backend spec handed to Carlos.

export type CaseType = 'linear' | 'branching';
export type RunStatus = 'active' | 'survived' | 'died';
export type Outcome = 'optimal' | 'suboptimal' | 'deadly';

export type CaseSummary = {
  id: string;
  title: string;
  specialty: string | null;
  type: CaseType;
  summary: string;
  // target extensions
  patient?: string;
  difficulty?: string;
  stages?: number;
  icon?: string;
  tags?: string[];
};

export type CaseStep = { id: string; label: string; content: string };

export type Choice = { id: string; label: string; icon?: string; detail?: string };
export type Vital = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  state?: 'normal' | 'warning' | 'critical';
};
export type Stage = { id: string; label: string };
export type Patient = { name?: string; age?: number; sex?: string; presentation?: string; tags?: string[] };

export type NodeView = {
  id: string;
  content: string;
  choices: Choice[];
  end?: 'survived' | 'died';
  // target extensions
  stageId?: string;
  stageLabel?: string;
  prompt?: string;
};

export type LinearDetail = { id: string; title: string; type: 'linear'; steps: CaseStep[]; currentStep: number };
export type BranchingDetail = {
  id: string;
  title: string;
  type: 'branching';
  node: NodeView;
  score: number;
  status: RunStatus;
  // target extensions
  subtitle?: string;
  patient?: Patient;
  stages?: Stage[];
  vitals?: Vital[];
  patientStatus?: string;
};
export type CaseDetail = LinearDetail | BranchingDetail;

export type ChoiceResult = {
  outcome: Outcome;
  feedback: string;
  scoreDelta: number;
  score: number;
  status: RunStatus;
  node: NodeView;
  vitals?: Vital[];
  patientStatus?: string;
  error?: string;
};

export type Feedback = { outcome: Outcome; text: string; scoreDelta: number };

/* ── palette + helpers ── */
export const SPECIALTY_PALETTE = ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];
export function colorFor(specialty: string | null): string | null {
  if (!specialty) return null;
  let h = 0;
  for (let i = 0; i < specialty.length; i++) h = (h * 31 + specialty.charCodeAt(i)) >>> 0;
  return SPECIALTY_PALETTE[h % SPECIALTY_PALETTE.length];
}

const SPECIALTY_ICONS: [string, string][] = [
  ['cardio', '❤️'], ['respir', '🫁'], ['pulmon', '🫁'], ['neuro', '🧠'],
  ['endocrin', '💧'], ['gastro', '🍽️'], ['renal', '🧪'], ['nephro', '🧪'],
  ['hemat', '🩸'], ['infect', '🦠'], ['derm', '🩹'], ['musculo', '🦴'],
];
export function specialtyIcon(specialty: string | null): string {
  if (!specialty) return '🩺';
  const k = specialty.toLowerCase();
  for (const [frag, icon] of SPECIALTY_ICONS) if (k.includes(frag)) return icon;
  return '🩺';
}

/** Difficulty → a w09 token color (reuses success/secondary/danger; no warning token exists). */
export function difficultyColor(difficulty?: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'var(--w09-success)';
    case 'hard':
      return 'var(--w09-danger)';
    case 'medium':
      return 'var(--w09-accent-secondary)';
    default:
      return 'var(--w09-text-muted)';
  }
}
/** The "Rare"/"zebra" flag among a case's tags (case-insensitive). */
export function isRare(tags?: string[]): boolean {
  return !!tags?.some((t) => t.toLowerCase() === 'rare');
}
/** Tags minus the "Rare" flag, which is rendered as its own badge. */
export function nonRareTags(tags?: string[]): string[] {
  return tags?.filter((t) => t.toLowerCase() !== 'rare') ?? [];
}

export const OUTCOME_COLOR: Record<Outcome, string> = { optimal: '#10b981', suboptimal: '#f59e0b', deadly: '#ef4444' };
export const OUTCOME_LABEL: Record<Outcome, string> = { optimal: 'Optimal choice', suboptimal: 'Suboptimal', deadly: 'Critical error' };
export const CHOICE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function vitalColor(state?: Vital['state']): string {
  return state === 'critical' ? '#ef4444' : state === 'warning' ? '#f59e0b' : '#10b981';
}
export function trendArrow(t?: Vital['trend']): string {
  return t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
}
export function signed(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0';
}

const STATUS_MAP: Record<string, { emoji: string; color: string }> = {
  stable: { emoji: '🙂', color: '#10b981' },
  improving: { emoji: '😌', color: '#10b981' },
  guarded: { emoji: '😐', color: '#f59e0b' },
  unstable: { emoji: '😟', color: '#f59e0b' },
  worsening: { emoji: '😟', color: '#ef4444' },
  critical: { emoji: '😰', color: '#ef4444' },
};

/** Patient status view — uses the backend label if given, else derives from vitals score. */
export function patientStatusView(
  label: string | undefined,
  score: number,
  maxScore: number,
  run: RunStatus,
): { emoji: string; label: string; color: string } {
  if (run === 'died') return { emoji: '☠️', label: 'Deceased', color: '#ef4444' };
  if (run === 'survived') return { emoji: '✅', label: 'Recovered', color: '#10b981' };
  if (label && STATUS_MAP[label.toLowerCase()]) {
    const m = STATUS_MAP[label.toLowerCase()];
    return { emoji: m.emoji, label: label.charAt(0).toUpperCase() + label.slice(1), color: m.color };
  }
  const r = maxScore > 0 ? score / maxScore : 0;
  if (r > 0.66) return { emoji: '🙂', label: 'Stable', color: '#10b981' };
  if (r > 0.33) return { emoji: '😐', label: 'Guarded', color: '#f59e0b' };
  return { emoji: '😟', label: 'Worsening', color: '#ef4444' };
}
