import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveOwnerByEmail } from '@/lib/auth/owner';

export const dynamic = 'force-dynamic';

/**
 * Resolve which dashboard account the telemetry belongs to.
 * 1. ANKI_SYNC_EMAIL → OWNER_EMAIL → the app's primary owner (resolveOwnerByEmail).
 * 2. Otherwise, for this single-operator app, fall back to the sole user.
 *
 * The email chain matters: once a 2nd account exists the single-operator
 * fallback stops resolving, so without the primary-owner fallback the add-on's
 * pushes 404 and sync silently dies.
 */
async function resolveOwnerId(ownerEmail?: string | null): Promise<string | null> {
  const byEmail = await resolveOwnerByEmail(ownerEmail);
  if (byEmail) return byEmail;

  // Single-operator fallback: if there's exactly one account, it's the owner.
  const count = await prisma.user.count();
  if (count === 1) {
    const only = await prisma.user.findFirst({ select: { id: true } });
    return only?.id ?? null;
  }

  return null;
}

/**
 * POST /api/anki
 * Token-authed ingest used by the VESTRIPPN Anki Desktop add-on.
 * The add-on has no browser session, so it authenticates with a shared
 * secret (ANKI_SYNC_SECRET). The owner is resolved via ANKI_SYNC_EMAIL,
 * with a single-user fallback.
 *
 * Body: { due, new, reviewedToday, streak }
 * Header: Authorization: Bearer <ANKI_SYNC_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.ANKI_SYNC_SECRET;

  if (!secret) {
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

  const ownerId = await resolveOwnerId(process.env.ANKI_SYNC_EMAIL);
  if (!ownerId) {
    return NextResponse.json({ error: 'Owner account not found' }, { status: 404 });
  }

  await prisma.ankiTelemetry.upsert({
    where: { userId: ownerId },
    update: { dueCards: due, newCards, reviewedToday, streak, lastSync: new Date() },
    create: { userId: ownerId, dueCards: due, newCards, reviewedToday, streak },
  });

  return NextResponse.json({ ok: true, synced: { due, new: newCards, reviewedToday, streak } });
}

// Lightweight health check (no secret/email leaked).
// Reports whether an owner account can be resolved for ingest.
export async function GET() {
  const secret = process.env.ANKI_SYNC_SECRET;
  let ownerResolved = false;
  try {
    ownerResolved = Boolean(await resolveOwnerId(process.env.ANKI_SYNC_EMAIL));
  } catch {
    ownerResolved = false;
  }
  return NextResponse.json({
    ok: true,
    service: 'anki-sync',
    method: 'POST',
    configured: Boolean(secret),
    ownerResolved,
  });
}
