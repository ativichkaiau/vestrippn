import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth/owner';
import { prisma } from '@/lib/prisma';
import { fetchCanvasTelemetry } from '@/lib/canvas';
import { buildAgenda, studyDay } from '@/lib/daily-plan';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to open your daily plan.' }, { status: 401 });
  try {
    const now = new Date();
    const day = studyDay(now);
    const [tasks, milestones, saved, anki, canvas] = await Promise.all([
      prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.researchMilestone.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.studyPlanDay.findUnique({ where: { userId_day: { userId, day } } }),
      prisma.ankiTelemetry.findUnique({ where: { userId } }),
      fetchCanvasTelemetry(userId),
    ]);
    const completedItems = Array.isArray(saved?.completedItems) ? saved.completedItems.filter((id): id is string => typeof id === 'string') : [];
    return NextResponse.json({
      day, availableMinutes: saved?.availableMinutes ?? 120,
      items: buildAgenda({ tasks, milestones, deadlines: canvas.deadlines ?? canvas.upcoming, ankiDue: anki?.dueCards ?? 0, completedItems, now }),
      canvas: { status: canvas.status ?? 'unknown', syncedAt: canvas.syncedAt ?? null },
      anki: { due: anki?.dueCards ?? 0, lastSync: anki?.lastSync.toISOString() ?? null, stale: !anki || now.getTime() - anki.lastSync.getTime() > 86_400_000 },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('[STUDY PLAN] Read failed:', error);
    return NextResponse.json({ error: 'Your daily plan could not be loaded. Please retry.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to save your daily plan.' }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 2048) throw new Error();
    body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch { return NextResponse.json({ error: 'Invalid plan update.' }, { status: 400 }); }
  const day = studyDay();
  if (body.day !== day) return NextResponse.json({ error: 'A new day has started in Bangkok. Refresh your plan first.' }, { status: 409 });
  if (body.action === 'budget') {
    if (!Number.isInteger(body.availableMinutes) || Number(body.availableMinutes) < 5 || Number(body.availableMinutes) > 720) {
      return NextResponse.json({ error: 'Choose between 5 and 720 study minutes.' }, { status: 400 });
    }
    try {
      await prisma.studyPlanDay.upsert({
        where: { userId_day: { userId, day } },
        create: { userId, day, availableMinutes: Number(body.availableMinutes) },
        update: { availableMinutes: Number(body.availableMinutes) },
      });
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ error: 'Could not save your time budget.' }, { status: 500 }); }
  }
  if (body.action !== 'complete' || typeof body.id !== 'string' || body.id.length > 200 || typeof body.completed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid completion update.' }, { status: 400 });
  }
  const id = body.id;
  const completed = body.completed;
  try {
    if (id !== `anki:${day}`) {
      const canvas = await fetchCanvasTelemetry(userId);
      if (!(canvas.deadlines ?? canvas.upcoming).some(item => `canvas:${item.courseId}:${item.id}` === id)) {
        return NextResponse.json({ error: 'This deadline is no longer available. Refresh your plan.' }, { status: 404 });
      }
    }
    // Serialize read/modify/write so two devices cannot overwrite each other's completed items.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await prisma.$transaction(async tx => {
          const row = await tx.studyPlanDay.findUnique({ where: { userId_day: { userId, day } } });
          const ids = new Set(Array.isArray(row?.completedItems) ? row.completedItems.filter((v): v is string => typeof v === 'string') : []);
          if (completed) ids.add(id); else ids.delete(id);
          const completedItems = [...ids];
          await tx.studyPlanDay.upsert({
            where: { userId_day: { userId, day } },
            create: { userId, day, completedItems }, update: { completedItems },
          });
        }, { isolationLevel: 'Serializable' });
        return NextResponse.json({ ok: true });
      } catch (error) {
        if (attempt === 2 || !error || typeof error !== 'object' || !('code' in error) || error.code !== 'P2034') throw error;
      }
    }
  } catch (error) {
    console.error('[STUDY PLAN] Completion failed:', error);
    return NextResponse.json({ error: 'Could not save completion. Please retry.' }, { status: 500 });
  }
}
