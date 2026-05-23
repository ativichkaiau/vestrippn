import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/anki
 * Token-authed ingest used by the VESTRIPPN Anki Desktop add-on.
 * The add-on has no browser session, so it authenticates with a shared
 * secret (ANKI_SYNC_SECRET) and the owner is resolved via ANKI_SYNC_EMAIL.
 *
 * Body: { due, new, reviewedToday, streak }
 * Header: Authorization: Bearer <ANKI_SYNC_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.ANKI_SYNC_SECRET;
  const ownerEmail = process.env.ANKI_SYNC_EMAIL;

  if (!secret || !ownerEmail) {
    return NextResponse.json({ error: 'Anki sync not configured on server' }, { status: 503 });
  }

  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const clamp = (v: any) => Math.max(0, Math.floor(Number(v) || 0));
  const due = clamp(body.due);
  const newCards = clamp(body.new ?? body.newCards);
  const reviewedToday = clamp(body.reviewedToday);
  const streak = clamp(body.streak);

  const user = await prisma.user.findUnique({
    where: { email: ownerEmail },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Owner account not found' }, { status: 404 });
  }

  await prisma.ankiTelemetry.upsert({
    where: { userId: user.id },
    update: { dueCards: due, newCards, reviewedToday, streak, lastSync: new Date() },
    create: { userId: user.id, dueCards: due, newCards, reviewedToday, streak },
  });

  return NextResponse.json({ ok: true, synced: { due, new: newCards, reviewedToday, streak } });
}

// Lightweight health check (no secret leaked)
export function GET() {
  const configured = Boolean(process.env.ANKI_SYNC_SECRET && process.env.ANKI_SYNC_EMAIL);
  return NextResponse.json({ ok: true, service: 'anki-sync', method: 'POST', configured });
}
