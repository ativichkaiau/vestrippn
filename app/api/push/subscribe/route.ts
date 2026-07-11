import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserId } from '@/lib/auth/owner';

export const dynamic = 'force-dynamic';

// Store (or refresh) a browser push subscription for the owner. Keyed on the
// endpoint, so re-subscribing the same device is idempotent.
export async function POST(req: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: 'no owner' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
    | null;
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'bad subscription' }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh, auth },
    update: { userId, p256dh, auth },
  });
  return NextResponse.json({ ok: true });
}

// Unsubscribe (device toggled reminders off, or subscription rotated).
export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => null)) as { endpoint?: string } | null;
  if (body?.endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: body.endpoint } });
  }
  return NextResponse.json({ ok: true });
}
