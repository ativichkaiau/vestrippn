import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth/owner';
import { validateFocusSession, validatePreferences } from '@/lib/device-sync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function snapshot(userId: string) {
  const [sessions, preferences] = await Promise.all([
    prisma.focusSessionRecord.findMany({ where: { userId }, orderBy: { startedAt: 'desc' }, take: 10_000 }),
    prisma.userPreferences.findUnique({ where: { userId } }),
  ]);
  return {
    sessions: sessions.map((s: (typeof sessions)[number]) => ({ id: s.clientId, ts: s.startedAt.getTime() + s.durationSec * 1000, circuit: s.circuit, mode: s.mode as 'open' | 'min' | 'laps', target: s.target, durationSec: s.durationSec, laps: s.laps, bestLap: s.bestLap, ...(s.title ? { title: s.title } : {}), ...(s.agendaItemId ? { agendaItemId: s.agendaItemId } : {}) })),
    preferences: { values: preferences?.values || {}, revision: preferences?.revision || 0 },
  };
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to sync.' }, { status: 401 });
  try { return NextResponse.json(await snapshot(userId), { headers: { 'Cache-Control': 'private, no-store' } }); }
  catch { return NextResponse.json({ error: 'Sync is temporarily unavailable. Your local history is safe.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to sync.' }, { status: 401 });
  if (Number(request.headers.get('content-length')) > 2_000_000) return NextResponse.json({ error: 'Sync payload is too large.' }, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 2_000_000) throw new Error('Sync payload is too large.');
    const body = JSON.parse(raw);
    if (!Array.isArray(body.sessions) || body.sessions.length > 1000) throw new Error('Send at most 1,000 sessions per batch.');
    const sessions = body.sessions.map((value: unknown) => validateFocusSession(value));
    const preferences = body.preferences ? validatePreferences(body.preferences.values) : null;
    if (preferences && (!Number.isInteger(body.preferences.baseRevision) || body.preferences.baseRevision < 0)) throw new Error('Invalid preference revision.');
    let conflict = false;
    await prisma.$transaction(async tx => {
      if (sessions.length) await tx.focusSessionRecord.createMany({ data: sessions.map((s: ReturnType<typeof validateFocusSession>) => ({ userId, clientId: s.id, startedAt: new Date(s.ts - s.durationSec * 1000), circuit: s.circuit, mode: s.mode, target: s.target, durationSec: s.durationSec, laps: s.laps, bestLap: s.bestLap, title: s.title, agendaItemId: s.agendaItemId })), skipDuplicates: true });
      if (preferences) {
        await tx.userPreferences.upsert({ where: { userId }, create: { userId, values: {}, revision: 0 }, update: {} });
        const updated = await tx.userPreferences.updateMany({ where: { userId, revision: body.preferences.baseRevision }, data: { values: preferences, revision: { increment: 1 } } });
        conflict = updated.count === 0;
      }
    });
    return NextResponse.json({ ...(await snapshot(userId)), conflict });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && !('code' in error))) return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid sync data.' }, { status: 400 });
    return NextResponse.json({ error: 'Sync is temporarily unavailable. Changes remain queued on this device.' }, { status: 503 });
  }
}
