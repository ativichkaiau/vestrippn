import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserId } from '@/lib/auth/owner';
import { sendPush } from '@/lib/push';

export const dynamic = 'force-dynamic';

// Fire an immediate confirmation push to all of the owner's devices — used right
// after the user enables reminders so they can see it actually landed.
export async function POST() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: 'no owner' }, { status: 401 });

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  for (const s of subs) {
    const r = await sendPush(
      { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
      {
        title: 'VEStriPPN reminders on',
        body: "You'll get a push when each exam crosses 14 · 7 · 3 · 1 days out.",
        url: '/academics#milestones',
        tag: 'push-test',
      },
    );
    if (r === 'gone') await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
    if (r === 'ok') sent++;
  }
  return NextResponse.json({ ok: true, sent });
}
