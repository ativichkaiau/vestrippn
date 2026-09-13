export const COVERAGE_STATUSES = ['untouched', 'reviewed', 'tested'] as const;
export type CoverageStatus = typeof COVERAGE_STATUSES[number];
export type CoverageResult = {
  id: string;
  label: string;
  correct: number;
  total: number;
  recordedAt: string;
  url: string | null;
};
export type CoverageRecord = {
  key: string;
  title: string;
  section: string;
  sourceTopicId: string | null;
  status: CoverageStatus;
  notes: string;
  noteUrl: string | null;
  results: CoverageResult[];
  revision: number;
  updatedAt: string | null;
};
export type CoverageObjective = CoverageRecord & {
  objective: string;
  prompts: string[];
  lessonUrl: string | null;
  practiceUrl: string | null;
};
export type CoverageCounts = Record<CoverageStatus, number> & { total: number };
export type CoverageCourse = {
  id: string;
  code: string;
  name: string;
  semesterName: string;
  archived: boolean;
  notebookUrl: string | null;
  nextExam: { title: string; scheduledAt: string } | null;
  catalogCode: string | null;
  counts: CoverageCounts;
};
export type CoverageResponse = {
  courses: CoverageCourse[];
  selectedCourseId: string | null;
  objectives: CoverageObjective[];
  source: { name: string; url: string; revision: string; importedAt: string; basis: string };
};

export function coverageCounts(objectives: Pick<CoverageRecord, 'status'>[]): CoverageCounts {
  const counts: CoverageCounts = { total: objectives.length, untouched: 0, reviewed: 0, tested: 0 };
  for (const objective of objectives) counts[objective.status]++;
  return counts;
}

export function resultPercent(result: Pick<CoverageResult, 'correct' | 'total'>): number {
  return Math.round(result.correct / result.total * 100);
}
