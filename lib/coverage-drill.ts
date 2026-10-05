import type { CoverageObjective, CoverageRecord } from './coverage-types';

/* ════════════════════════════════════════════════════════════════════════
   Weak-spot drills and the exam countdown, from the coverage map.

   Weakness (higher = weaker): an untouched objective is 1; a tested one is
   1 minus its recent score (the mean of its last three results); a
   reviewed-but-untested one sits at 0.6, so a test you scored under 40%
   on comes before it. The countdown spreads what is left (untouched,
   then reviewed) evenly over the days before the exam, keeping the last
   two days for a drill. Pure functions over CoverageRecord.
   ════════════════════════════════════════════════════════════════════════ */

type Scored = Pick<CoverageRecord, 'key' | 'status' | 'results' | 'updatedAt'>;

export function recentScore(objective: Pick<CoverageRecord, 'results'>): number | null {
  const recent = [...objective.results].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 3);
  if (!recent.length) return null;
  return recent.reduce((sum, result) => sum + result.correct / result.total, 0) / recent.length;
}

export function weakness(objective: Pick<CoverageRecord, 'status' | 'results'>): number {
  if (objective.status === 'untouched') return 1;
  const score = recentScore(objective);
  if (score === null) return objective.status === 'tested' ? 0.5 : 0.6;
  return Math.round((1 - score) * 1000) / 1000;
}

/** The `count` weakest objectives; ties go to the one touched longest ago, then catalogue order. */
export function pickWeakest<T extends Scored>(objectives: T[], count = 10): T[] {
  return objectives
    .map((objective, index) => ({ objective, index, weak: weakness(objective), touched: objective.updatedAt ? Date.parse(objective.updatedAt) : 0 }))
    .sort((a, b) => b.weak - a.weak || a.touched - b.touched || a.index - b.index)
    .slice(0, count)
    .map((entry) => entry.objective);
}

/* Case bank specialties for each coverage subject (course code without the -1/-2). */
const CASE_SPECIALTY: Record<string, string> = {
  HCVS: 'Cardiovascular System',
  HGB: 'Digestive and Biliary Tract System',
  HEN: 'Endocrine System',
  HGA: 'Gross Anatomy',
  HHL: 'Haematopoietic and Lymphoreticular System',
  HIM: 'Immunology',
  MHI: 'Microbiology and Parasitology',
  PHI: 'Microbiology and Parasitology',
  HNS: 'Nervous and Special Senses System',
  HRU: 'Renal and Urinary Tract',
  HRP: 'Reproductive System and Perinatal Period',
  HRS: 'Respiratory System',
  HSC: 'Skin and Connective Tissue System',
  MBH: 'Biochemistry',
  MFN: 'Biochemistry',
  ABM: 'Biochemistry',
};

/** The case bank specialty that matches a course's catalogue code, if any. */
export function caseSpecialtyFor(catalogCode: string | null | undefined): string | null {
  if (!catalogCode) return null;
  return CASE_SPECIALTY[catalogCode.replace(/-\d+$/, '')] ?? null;
}

/* ── Exam countdown ───────────────────────────────────────────────────── */

export const COUNTDOWN_BUFFER_DAYS = 2;
export const MINUTES_PER_OBJECTIVE = 10;
const DAY = 86_400_000;

export type Countdown =
  | { phase: 'cover'; daysLeft: number; remaining: number; perDay: number; today: string[] }
  | { phase: 'drill'; daysLeft: number; remaining: number }
  | { phase: 'done'; daysLeft: number; remaining: 0 };

/** Calendar days from `now` to the exam, both read as Bangkok study days. */
export function daysUntil(examAt: Date, now: Date): number {
  const day = (date: Date) => Date.parse(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date));
  return Math.round((day(examAt) - day(now)) / DAY);
}

/**
 * Today's share of the objectives still to cover before an exam (null once
 * the exam has passed). Untouched objectives come first, then reviewed
 * ones; marking an objective reviewed or tested moves the plan on.
 */
export function countdown(objectives: Pick<CoverageObjective, 'key' | 'status'>[], examAt: Date, now: Date): Countdown | null {
  const daysLeft = daysUntil(examAt, now);
  if (daysLeft < 0) return null;
  const queue = [...objectives.filter((o) => o.status === 'untouched'), ...objectives.filter((o) => o.status === 'reviewed')];
  if (!queue.length) return { phase: 'done', daysLeft, remaining: 0 };
  const studyDays = daysLeft - COUNTDOWN_BUFFER_DAYS;
  if (studyDays <= 0) return { phase: 'drill', daysLeft, remaining: queue.length };
  const perDay = Math.ceil(queue.length / studyDays);
  return { phase: 'cover', daysLeft, remaining: queue.length, perDay, today: queue.slice(0, perDay).map((o) => o.key) };
}
