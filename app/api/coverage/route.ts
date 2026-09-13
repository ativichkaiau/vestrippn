import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/owner';
import { prisma } from '@/lib/prisma';
import { getCoverage, serializeCoverage } from '@/lib/coverage';
import { coverageObjectives } from '@/lib/coverage-catalog';
import { CoverageInputError, coverageKey, coverageObject, coverageResult, coverageResults, coverageStatus, coverageText, coverageUrl } from '@/lib/coverage-validation';

export const dynamic = 'force-dynamic';

class CoverageConflict extends Error {}

function failure(error: unknown) {
  if (error instanceof CoverageConflict) return NextResponse.json({ error: 'This objective changed on another device. Refresh the map before saving again.' }, { status: 409 });
  if (error instanceof CoverageInputError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
  console.error('[Coverage]', error);
  return NextResponse.json({ error: 'Your coverage could not be saved. Please retry.' }, { status: 503 });
}

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to view your exam coverage.' }, { status: 401 });
  try {
    const courseId = new URL(request.url).searchParams.get('course');
    const result = await getCoverage(userId, courseId);
    if (courseId && !result.selectedCourseId) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return failure(error); }
}

async function mutate(request: Request, method: 'POST' | 'PATCH' | 'DELETE') {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to edit your exam coverage.' }, { status: 401 });
  try {
    const raw = await request.text();
    if (raw.length > 30_000) throw new CoverageInputError('This update is too large.');
    const input = coverageObject(JSON.parse(raw));
    const courseId = coverageText(input.courseId, 'Course', 200);
    const course = await prisma.course.findFirst({ where: { id: courseId, userId, semester: { userId, archivedAt: null } } });
    if (!course) return NextResponse.json({ error: 'Choose one of your active courses. Restore an archived semester before editing its coverage.' }, { status: 404 });

    if (method === 'POST') {
      const title = coverageText(input.title, 'Learning objective', 500);
      const section = coverageText(input.section || 'My learning objectives', 'Topic group', 300);
      const row = await prisma.coverageObjective.create({ data: { userId, courseId, key: `custom:${crypto.randomUUID()}`, title, section } });
      return NextResponse.json({ objective: coverageObjectives(course, [serializeCoverage(row)]).find(item => item.key === row.key) }, { status: 201 });
    }

    const key = coverageKey(input.key);
    if (!Number.isInteger(input.revision) || Number(input.revision) < 0) throw new CoverageInputError('Refresh the objective before saving.');
    const revision = Number(input.revision);
    const objective = await prisma.$transaction(async tx => {
      const saved = await tx.coverageObjective.findFirst({ where: { userId, courseId, key } });
      const definition = coverageObjectives(course, saved ? [serializeCoverage(saved)] : []).find(item => item.key === key);
      if (!definition) throw new CoverageInputError('Objective not found in this course.');
      if (method === 'DELETE') {
        if (!key.startsWith('custom:')) throw new CoverageInputError('Source topics stay in the map. Set the status to untouched to revisit one.');
        const removed = await tx.coverageObjective.deleteMany({ where: { userId, courseId, key, revision } });
        if (!removed.count) throw new CoverageConflict();
        return null;
      }

      const data: { status?: ReturnType<typeof coverageStatus>; notes?: string; noteUrl?: string | null; results?: ReturnType<typeof coverageResults>; title?: string; section?: string } = {};
      if (input.action === 'status') data.status = coverageStatus(input.status);
      else if (input.action === 'notes') {
        data.notes = coverageText(input.notes, 'Notes', 20_000, true);
        data.noteUrl = coverageUrl(input.noteUrl);
      } else if (input.action === 'result') {
        const result = coverageResult({ ...coverageObject(input.result), recordedAt: new Date().toISOString() });
        // A retried request must not append the same attempt twice.
        if (definition.results.some(existing => existing.id === result.id)) return definition;
        if (definition.results.length >= 100) throw new CoverageInputError('This objective already has 100 practice results.');
        data.results = [result, ...definition.results];
        data.status = 'tested';
      } else if (input.action === 'edit' && key.startsWith('custom:')) {
        data.title = coverageText(input.title, 'Learning objective', 500);
        data.section = coverageText(input.section, 'Topic group', 300);
      } else throw new CoverageInputError('Unknown coverage update.');

      if (!saved) await tx.coverageObjective.createMany({ data: [{ userId, courseId, key, title: definition.title, section: definition.section, sourceTopicId: definition.sourceTopicId }], skipDuplicates: true });
      const updated = await tx.coverageObjective.updateMany({ where: { userId, courseId, key, revision }, data: { ...data, revision: { increment: 1 } } });
      if (!updated.count) throw new CoverageConflict();
      const row = await tx.coverageObjective.findUniqueOrThrow({ where: { courseId_key: { courseId, key } } });
      return coverageObjectives(course, [serializeCoverage(row)]).find(item => item.key === key)!;
    });
    revalidatePath('/workspace');
    return NextResponse.json({ objective });
  } catch (error) { return failure(error); }
}

export const POST = (request: Request) => mutate(request, 'POST');
export const PATCH = (request: Request) => mutate(request, 'PATCH');
export const DELETE = (request: Request) => mutate(request, 'DELETE');
