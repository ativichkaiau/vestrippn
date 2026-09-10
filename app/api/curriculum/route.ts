import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/owner';
import { prisma } from '@/lib/prisma';
import { ensureCurriculum, getCurriculum } from '@/lib/curriculum';
import { CurriculumInputError, curriculumRecord, curriculumText, validateCourse, validateExam, validateSemester } from '@/lib/curriculum-validation';

export const dynamic = 'force-dynamic';

function failure(error: unknown) {
  if (error instanceof CurriculumInputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
  console.error('[Curriculum]', error);
  return NextResponse.json({ error: 'Your courses could not be saved. Please try again.' }, { status: 500 });
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to manage your courses.' }, { status: 401 });
  try { return NextResponse.json(await getCurriculum(userId)); } catch (error) { return failure(error); }
}

async function mutate(req: Request, method: 'POST' | 'PATCH' | 'DELETE') {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to manage your courses.' }, { status: 401 });
  try {
    const input = curriculumRecord(await req.json());
    const kind = curriculumText(input.kind, 'Item type', 20);
    if (!['semester', 'course', 'exam'].includes(kind)) throw new CurriculumInputError('Unknown item type.');
    const id = method !== 'POST' ? curriculumText(input.id, 'Item ID', 200) : undefined;
    await ensureCurriculum(userId);
    await prisma.$transaction(async (tx) => {
      if (kind === 'semester') {
        if (id && !await tx.semester.findFirst({ where: { id, userId } })) throw new CurriculumInputError('Semester was not found. Refresh and try again.');
        if (method === 'DELETE') {
          await tx.semester.deleteMany({ where: { id, userId } });
        } else {
          const data = validateSemester(input);
          if (id) await tx.semester.updateMany({ where: { id, userId }, data });
          else await tx.semester.create({ data: { ...data, userId } });
        }
      } else if (kind === 'course') {
        if (id && !await tx.course.findFirst({ where: { id, userId, semester: { userId } } })) throw new CurriculumInputError('Course was not found. Refresh and try again.');
        if (method === 'DELETE') {
          await tx.course.deleteMany({ where: { id, userId } });
        } else {
          const data = validateCourse(input, process.env.CANVAS_BASE_URL);
          if (!await tx.semester.findFirst({ where: { id: data.semesterId, userId } })) throw new CurriculumInputError('Choose one of your semesters.');
          if (id) await tx.course.updateMany({ where: { id, userId }, data });
          else await tx.course.create({ data: { ...data, userId } });
        }
      } else {
        if (id && !await tx.exam.findFirst({ where: { id, userId, course: { userId } } })) throw new CurriculumInputError('Exam was not found. Refresh and try again.');
        if (method === 'DELETE') {
          await tx.exam.deleteMany({ where: { id, userId } });
        } else {
          const data = validateExam(input);
          if (!await tx.course.findFirst({ where: { id: data.courseId, userId, semester: { userId } } })) throw new CurriculumInputError('Choose one of your courses.');
          if (id) await tx.exam.updateMany({ where: { id, userId }, data });
          else await tx.exam.create({ data: { ...data, userId } });
        }
      }
    });
    for (const path of ['/', '/academics', '/analytics', '/workspace']) revalidatePath(path);
    return NextResponse.json(await getCurriculum(userId));
  } catch (error) { return failure(error); }
}

export function POST(req: Request) { return mutate(req, 'POST'); }
export function PATCH(req: Request) { return mutate(req, 'PATCH'); }
export function DELETE(req: Request) { return mutate(req, 'DELETE'); }
