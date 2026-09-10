import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SourceStatus, SourceType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth/owner';
import { BACKUP_MAX_BYTES, BACKUP_FORMAT, BACKUP_VERSION, validateBackup, type BackupPayload } from '@/lib/backup';
import { validateFocusSession, validatePreferences, type SyncedPreferences } from '@/lib/device-sync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function iso(value: Date | null | undefined) { return value?.toISOString() ?? null; }

async function createBackup(userId: string): Promise<BackupPayload> {
  const [tasks, milestones, notes, papers, documents, semesters, planDays, sessions, preferences] = await Promise.all([
    prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.researchMilestone.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.ieltsModule.findMany({ where: { userId }, orderBy: { updatedAt: 'asc' } }),
    prisma.researchExtraction.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.studyDocument.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.semester.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, include: { courses: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], include: { exams: { orderBy: { scheduledAt: 'asc' } } } } } }),
    prisma.studyPlanDay.findMany({ where: { userId }, orderBy: { day: 'asc' } }),
    prisma.focusSessionRecord.findMany({ where: { userId }, orderBy: { startedAt: 'asc' }, take: 10_000 }),
    prisma.userPreferences.findUnique({ where: { userId } }),
  ]);
  let savedPreferences: SyncedPreferences = {};
  try { savedPreferences = validatePreferences(preferences?.values ?? {}); } catch { savedPreferences = {}; }
  return {
    format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: new Date().toISOString(),
    tasks: tasks.map((task) => ({ id: task.id, title: task.title, completed: task.completed, category: task.category, dueAt: iso(task.dueAt), estimatedMinutes: task.estimatedMinutes, priority: task.priority })),
    milestones: milestones.map((item) => ({ id: item.id, title: item.title, completed: item.completed, dueAt: iso(item.dueAt), estimatedMinutes: item.estimatedMinutes })),
    notes: notes.map((note) => ({ id: note.id, text: note.text, updatedAt: note.updatedAt.toISOString() })),
    papers: papers.map((paper) => ({ id: paper.id, pmid: paper.pmid, title: paper.title, authors: paper.authors, journal: paper.journal, url: paper.url, source: paper.source, doi: paper.doi, abstract: paper.abstract, year: paper.year, status: paper.status, createdAt: paper.createdAt.toISOString() })),
    documents: documents.map((document) => ({ id: document.id, title: document.title, sourceType: document.sourceType, originalUrl: document.originalUrl, status: document.status, pages: document.pages, processedAt: iso(document.processedAt), createdAt: document.createdAt.toISOString() })),
    semesters: semesters.map((semester) => ({ id: semester.id, name: semester.name, startsAt: iso(semester.startsAt), endsAt: iso(semester.endsAt), archivedAt: iso(semester.archivedAt), courses: semester.courses.map((course) => ({ id: course.id, code: course.code, name: course.name, canvasCourseId: course.canvasCourseId, canvasUrl: course.canvasUrl, notebookUrl: course.notebookUrl, sortOrder: course.sortOrder, exams: course.exams.map((exam) => ({ id: exam.id, title: exam.title, scheduledAt: exam.scheduledAt.toISOString() })) })) })),
    planDays: planDays.map((day) => ({ id: day.id, day: day.day, availableMinutes: day.availableMinutes, completedItems: Array.isArray(day.completedItems) ? day.completedItems.filter((value): value is string => typeof value === 'string') : [], updatedAt: day.updatedAt.toISOString() })),
    focusSessions: sessions.flatMap((session) => {
      try { return [validateFocusSession({ id: session.clientId, ts: session.startedAt.getTime() + session.durationSec * 1000, circuit: session.circuit, mode: session.mode, target: session.target, durationSec: session.durationSec, laps: session.laps, bestLap: session.bestLap, title: session.title ?? undefined, agendaItemId: session.agendaItemId ?? undefined })]; }
      catch { return []; }
    }),
    preferences: savedPreferences,
  };
}

type IdDelegate = { findUnique(args: { where: { id: string }; select: { userId: true } }): Promise<{ userId: string } | null> };
function stableId(userId: string, collection: string, sourceId: string) {
  // IDs are only a collision-resistant fallback when a backup came from a
  // different account. Raw IDs are retained for the owner's own restore.
  let hash = 2166136261;
  for (const char of `${userId}:${collection}:${sourceId}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `w85_${collection}_${(hash >>> 0).toString(36)}_${sourceId.slice(-12)}`.slice(0, 190);
}

async function ownedId(delegate: IdDelegate, userId: string, collection: string, sourceId: string) {
  const row = await delegate.findUnique({ where: { id: sourceId }, select: { userId: true } });
  return !row || row.userId === userId ? sourceId : stableId(userId, collection, sourceId);
}

async function restore(userId: string, backup: BackupPayload) {
  let imported = 0;
  await prisma.$transaction(async (tx) => {
    for (const row of backup.tasks) {
      const id = await ownedId(tx.task as unknown as IdDelegate, userId, 'task', row.id);
      await tx.task.upsert({ where: { id }, create: { id, userId, title: row.title, completed: row.completed, category: row.category, dueAt: row.dueAt ? new Date(row.dueAt) : null, estimatedMinutes: row.estimatedMinutes, priority: row.priority }, update: { title: row.title, completed: row.completed, category: row.category, dueAt: row.dueAt ? new Date(row.dueAt) : null, estimatedMinutes: row.estimatedMinutes, priority: row.priority } }); imported++;
    }
    for (const row of backup.milestones) {
      const id = await ownedId(tx.researchMilestone as unknown as IdDelegate, userId, 'milestone', row.id);
      await tx.researchMilestone.upsert({ where: { id }, create: { id, userId, title: row.title, completed: row.completed, dueAt: row.dueAt ? new Date(row.dueAt) : null, estimatedMinutes: row.estimatedMinutes }, update: { title: row.title, completed: row.completed, dueAt: row.dueAt ? new Date(row.dueAt) : null, estimatedMinutes: row.estimatedMinutes } }); imported++;
    }
    for (const row of backup.notes) {
      const id = await ownedId(tx.ieltsModule as unknown as IdDelegate, userId, 'note', row.id);
      await tx.ieltsModule.upsert({ where: { id }, create: { id, userId, text: row.text, updatedAt: new Date(row.updatedAt) }, update: { text: row.text } }); imported++;
    }
    for (const row of backup.papers) {
      const id = await ownedId(tx.researchExtraction as unknown as IdDelegate, userId, 'paper', row.id);
      await tx.researchExtraction.upsert({ where: { id }, create: { id, userId, pmid: row.pmid, title: row.title, authors: row.authors, journal: row.journal, url: row.url, source: row.source, doi: row.doi, abstract: row.abstract, year: row.year, status: row.status, createdAt: new Date(row.createdAt) }, update: { pmid: row.pmid, title: row.title, authors: row.authors, journal: row.journal, url: row.url, source: row.source, doi: row.doi, abstract: row.abstract, year: row.year, status: row.status } }); imported++;
    }
    for (const row of backup.documents) {
      const id = await ownedId(tx.studyDocument as unknown as IdDelegate, userId, 'document', row.id);
      await tx.studyDocument.upsert({ where: { id }, create: { id, userId, title: row.title, sourceType: row.sourceType as SourceType, originalUrl: row.originalUrl, status: row.status as SourceStatus, pages: row.pages, processedAt: row.processedAt ? new Date(row.processedAt) : null, createdAt: new Date(row.createdAt) }, update: { title: row.title, originalUrl: row.originalUrl, status: row.status as SourceStatus, pages: row.pages, processedAt: row.processedAt ? new Date(row.processedAt) : null } }); imported++;
    }

    const semesterIds = new Map<string, string>();
    for (const row of backup.semesters) {
      const id = await ownedId(tx.semester as unknown as IdDelegate, userId, 'semester', row.id);
      semesterIds.set(row.id, id);
      await tx.semester.upsert({ where: { id }, create: { id, userId, name: row.name, startsAt: row.startsAt ? new Date(row.startsAt) : null, endsAt: row.endsAt ? new Date(row.endsAt) : null, archivedAt: row.archivedAt ? new Date(row.archivedAt) : null }, update: { name: row.name, startsAt: row.startsAt ? new Date(row.startsAt) : null, endsAt: row.endsAt ? new Date(row.endsAt) : null, archivedAt: row.archivedAt ? new Date(row.archivedAt) : null } }); imported++;
      for (const course of row.courses) {
        const courseId = await ownedId(tx.course as unknown as IdDelegate, userId, 'course', course.id);
        await tx.course.upsert({ where: { id: courseId }, create: { id: courseId, userId, semesterId: id, code: course.code, name: course.name, canvasCourseId: course.canvasCourseId, canvasUrl: course.canvasUrl, notebookUrl: course.notebookUrl, sortOrder: course.sortOrder }, update: { semesterId: id, code: course.code, name: course.name, canvasCourseId: course.canvasCourseId, canvasUrl: course.canvasUrl, notebookUrl: course.notebookUrl, sortOrder: course.sortOrder } }); imported++;
        for (const exam of course.exams) {
          const examId = await ownedId(tx.exam as unknown as IdDelegate, userId, 'exam', exam.id);
          await tx.exam.upsert({ where: { id: examId }, create: { id: examId, userId, courseId, title: exam.title, scheduledAt: new Date(exam.scheduledAt) }, update: { courseId, title: exam.title, scheduledAt: new Date(exam.scheduledAt) } }); imported++;
        }
      }
    }
    for (const row of backup.planDays) {
      const current = await tx.studyPlanDay.findUnique({ where: { userId_day: { userId, day: row.day } } });
      const currentItems = Array.isArray(current?.completedItems) ? current.completedItems.filter((value): value is string => typeof value === 'string') : [];
      const completedItems = [...new Set([...currentItems, ...row.completedItems])];
      const useImportedBudget = !current || new Date(row.updatedAt).getTime() >= current.updatedAt.getTime();
      await tx.studyPlanDay.upsert({ where: { userId_day: { userId, day: row.day } }, create: { id: await ownedId(tx.studyPlanDay as unknown as IdDelegate, userId, 'plan', row.id), userId, day: row.day, availableMinutes: row.availableMinutes, completedItems, updatedAt: new Date(row.updatedAt) }, update: { availableMinutes: useImportedBudget ? row.availableMinutes : current.availableMinutes, completedItems } }); imported++;
    }
    for (const row of backup.focusSessions) {
      const startedAt = new Date(row.ts - row.durationSec * 1000);
      await tx.focusSessionRecord.upsert({ where: { userId_clientId: { userId, clientId: row.id } }, create: { userId, clientId: row.id, startedAt, circuit: row.circuit, mode: row.mode, target: row.target, durationSec: row.durationSec, laps: row.laps, bestLap: row.bestLap, title: row.title, agendaItemId: row.agendaItemId }, update: { startedAt, circuit: row.circuit, mode: row.mode, target: row.target, durationSec: row.durationSec, laps: row.laps, bestLap: row.bestLap, title: row.title, agendaItemId: row.agendaItemId } }); imported++;
    }
    const currentPreferences = await tx.userPreferences.findUnique({ where: { userId } });
    const currentValues = currentPreferences ? validatePreferences(currentPreferences.values) : {};
    const values = { ...backup.preferences, ...currentValues };
    await tx.userPreferences.upsert({ where: { userId }, create: { userId, values: backup.preferences, revision: 0 }, update: { values, revision: { increment: 1 } } });
  });
  return { imported, skipped: 0 };
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to create a backup.' }, { status: 401 });
  try { return NextResponse.json(await createBackup(userId), { headers: { 'Cache-Control': 'private, no-store' } }); }
  catch (error) { console.error('[BACKUP] Export failed:', error); return NextResponse.json({ error: 'Your backup could not be created. Please retry.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to restore a backup.' }, { status: 401 });
  try {
    const length = Number(request.headers.get('content-length') || 0);
    if (length > BACKUP_MAX_BYTES) return NextResponse.json({ error: 'That backup is too large.' }, { status: 413 });
    const raw = await request.text();
    if (raw.length > BACKUP_MAX_BYTES) return NextResponse.json({ error: 'That backup is too large.' }, { status: 413 });
    const backup = validateBackup(JSON.parse(raw));
    const result = await restore(userId, backup);
    for (const path of ['/', '/academics', '/analytics', '/archive', '/workspace']) revalidatePath(path);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && !('code' in error)) return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid backup.' }, { status: 400 });
    console.error('[BACKUP] Restore failed:', error);
    return NextResponse.json({ error: 'The backup could not be restored. No partial changes were kept.' }, { status: 503 });
  }
}
