import type { CoverageObjective as StoredObjective } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ensureCurriculum } from './curriculum';
import { coverageObjectives, coverageSource, coverageSubject } from './coverage-catalog';
import { coverageCounts, type CoverageRecord, type CoverageResponse } from './coverage-types';
import { coverageResults } from './coverage-validation';

export function serializeCoverage(row: StoredObjective): CoverageRecord {
  return {
    key: row.key, title: row.title, section: row.section, sourceTopicId: row.sourceTopicId,
    status: row.status, notes: row.notes, noteUrl: row.noteUrl, results: coverageResults(row.results),
    revision: row.revision, updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCoverage(userId: string, requestedCourseId?: string | null): Promise<CoverageResponse> {
  await ensureCurriculum(userId);
  const courses = await prisma.course.findMany({
    where: { userId, semester: { userId } },
    include: { semester: true, exams: { orderBy: { scheduledAt: 'asc' } }, coverageObjectives: { where: { userId } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  const mapped = courses.map(course => ({
    course,
    objectives: coverageObjectives(course, course.coverageObjectives.map(serializeCoverage)),
  }));
  const active = mapped.filter(entry => !entry.course.semester.archivedAt);
  const selected = requestedCourseId
    ? mapped.find(entry => entry.course.id === requestedCourseId)
    : active.find(entry => entry.course.code === 'HHL') ?? active[0] ?? mapped[0];
  const now = Date.now();
  return {
    courses: mapped.map(({ course, objectives }) => ({
      id: course.id, code: course.code, name: course.name, semesterName: course.semester.name,
      archived: Boolean(course.semester.archivedAt), notebookUrl: course.notebookUrl,
      nextExam: course.exams.filter(exam => exam.scheduledAt.getTime() >= now).map(exam => ({ title: exam.title, scheduledAt: exam.scheduledAt.toISOString() }))[0] ?? null,
      catalogCode: coverageSubject(course)?.code ?? null, counts: coverageCounts(objectives),
    })),
    selectedCourseId: selected?.course.id ?? null,
    objectives: selected?.objectives ?? [],
    source: coverageSource,
  };
}
