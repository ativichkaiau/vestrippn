import { prisma } from '@/lib/prisma';
import { coverageObjectives } from '@/lib/coverage-catalog';
import { countdown } from '@/lib/coverage-drill';
import { serializeCoverage } from '@/lib/coverage';
import type { PlanCountdown } from '@/lib/daily-plan';

/* Server-side study queries shared by the daily plan and the Study view. */

const COUNTDOWN_WINDOW_DAYS = 90;

export type CourseCountdown = PlanCountdown & { courseName: string; examAt: string };

/** Exams in the next 90 days on active courses, with today's share of each course's coverage. */
export async function examCountdowns(userId: string, now: Date): Promise<CourseCountdown[]> {
  const horizon = new Date(now.getTime() + COUNTDOWN_WINDOW_DAYS * 86_400_000);
  const courses = await prisma.course.findMany({
    where: { userId, semester: { userId, archivedAt: null }, exams: { some: { scheduledAt: { gte: now, lte: horizon } } } },
    include: { exams: { where: { scheduledAt: { gte: now } }, orderBy: { scheduledAt: 'asc' }, take: 1 }, coverageObjectives: { where: { userId } } },
  });
  return courses
    .flatMap((course) => {
      const exam = course.exams[0];
      const plan = exam ? countdown(coverageObjectives(course, course.coverageObjectives.map(serializeCoverage)), exam.scheduledAt, now) : null;
      return plan && exam
        ? [{ courseId: course.id, courseCode: course.code, courseName: course.name, examTitle: exam.title, examAt: exam.scheduledAt.toISOString(), plan }]
        : [];
    })
    .sort((a, b) => a.examAt.localeCompare(b.examAt));
}
