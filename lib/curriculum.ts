import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { ActiveExamData, CourseData, CurriculumData } from './curriculum-types';

const legacyCourses = [
  { canvasCourseId: '26141', code: 'HEN-2', name: 'Human Endocrine System', notebookUrl: 'https://notebooklm.google.com/notebook/db9fd595-41ad-4c0d-848c-783a972904b1' },
  { canvasCourseId: '26393', code: 'HNS-2', name: 'Human Nervous and Special Senses System', notebookUrl: 'https://notebooklm.google.com/notebook/d3cb8676-b859-4263-b5ff-65afaaf665e5' },
  { canvasCourseId: '26349', code: 'TBL', name: 'Team-Based Learning', notebookUrl: null },
  { canvasCourseId: '26702', code: 'HMS-2', name: 'Human Musculoskeletal System', notebookUrl: 'https://notebooklm.google.com/notebook/04b9e08c-0d3d-4234-adb3-24ca38479dcb' },
  { canvasCourseId: '27415', code: 'HCVS-2', name: 'Human Cardiovascular System', notebookUrl: 'https://notebooklm.google.com/notebook/834eec50-5e99-41d9-8ca9-fd133e7943a3', exam: '2026-08-04T08:00:00+07:00' },
  { canvasCourseId: '30964', code: 'HRS-2', name: 'Human Respiratory System', notebookUrl: 'https://notebooklm.google.com/notebook/a5f04592-4125-46c0-b0f8-f23123a4f943', exam: '2026-08-11T08:00:00+07:00' },
  { canvasCourseId: '31275', code: 'HGB-2', name: 'Human Gastrointestinal and Biliary Tract System', notebookUrl: 'https://notebooklm.google.com/notebook/7ddb6bb7-2974-4005-b9f3-9c6b2a2e0861', exam: '2026-08-07T08:00:00+07:00' },
  { canvasCourseId: '26896', code: 'HHL', name: 'Human Hematopoietic and Lymphoreticular System', notebookUrl: 'https://notebook.google.com/notebook/8b681d85-6736-4173-a182-aae231b2f04d' },
  { canvasCourseId: '31469', code: 'HSC', name: 'Human Skin System and Connective Tissues', notebookUrl: 'https://notebook.google.com/notebook/a11841cb-1131-419b-b8fa-3d0fb8118485' },
];

export async function ensureCurriculum(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { curriculumInitializedAt: true } });
  if (!user || user.curriculumInitializedAt) return;
  await prisma.$transaction(async (tx) => {
    // Conditional UPDATE takes a row lock. A concurrent first request waits and
    // then sees zero rows, so the original courses cannot be inserted twice.
    const claimed = await tx.user.updateMany({ where: { id: userId, curriculumInitializedAt: null }, data: { curriculumInitializedAt: new Date() } });
    if (!claimed.count || await tx.semester.count({ where: { userId } })) return;
    await tx.semester.create({
      data: {
        userId, name: 'MedCMU · Existing courses',
        courses: {
          create: legacyCourses.map(({ exam, ...course }, sortOrder) => ({
            ...course, userId, sortOrder,
            canvasUrl: `https://mango-cmu.instructure.com/courses/${course.canvasCourseId}`,
            ...(exam ? { exams: { create: { userId, title: 'Final exam', scheduledAt: new Date(exam) } } } : {}),
          })),
        },
      },
    });
  });
}

const curriculumInclude = { courses: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], include: { exams: { orderBy: { scheduledAt: 'asc' } } } } } satisfies Prisma.SemesterInclude;
type SemesterWithCourses = Prisma.SemesterGetPayload<{ include: typeof curriculumInclude }>;

export function serializeCurriculum(semesters: SemesterWithCourses[]): CurriculumData {
  return { semesters: semesters.map((semester) => ({
    id: semester.id, name: semester.name, startsAt: semester.startsAt?.toISOString() ?? null,
    endsAt: semester.endsAt?.toISOString() ?? null, archivedAt: semester.archivedAt?.toISOString() ?? null,
    courses: semester.courses.map((course) => ({
      id: course.id, semesterId: course.semesterId, code: course.code, name: course.name,
      canvasCourseId: course.canvasCourseId, canvasUrl: course.canvasUrl, notebookUrl: course.notebookUrl,
      sortOrder: course.sortOrder, exams: course.exams.map((exam) => ({ id: exam.id, courseId: exam.courseId, title: exam.title, scheduledAt: exam.scheduledAt.toISOString() })),
    })),
  })) };
}

export async function getCurriculum(userId: string): Promise<CurriculumData> {
  await ensureCurriculum(userId);
  const semesters = await prisma.semester.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: curriculumInclude });
  return serializeCurriculum(semesters);
}

export async function getActiveCourses(userId: string): Promise<CourseData[]> {
  const { semesters } = await getCurriculum(userId);
  return semesters.filter((semester) => !semester.archivedAt).flatMap((semester) => semester.courses);
}

export async function getActiveExams(userId: string): Promise<ActiveExamData[]> {
  const courses = await getActiveCourses(userId);
  return courses.flatMap((course) => course.exams.map((exam) => ({ ...exam, name: course.code, fullName: course.name })))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}
