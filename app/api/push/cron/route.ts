import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { UPCOMING_EXAMS, daysUntil, countdownLabel, REMINDER_BUCKETS } from '@/lib/exams';
import { sendPush } from '@/lib/push';

export const dynamic = 'force-dynamic';

function fmtExamDate(d: Date): string {
  return `${d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Bangkok',
  })} · 08:00`;
}

// Daily cron (Vercel: 01:00 UTC = 08:00 Bangkok). For each subscription, push any
// newly-crossed exam T-minus milestone once, de-duped in the row's `notified` map.
// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; ?key= is a manual fallback.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const key = new URL(req.url).searchParams.get('key');
  if (env.cronSecret && auth !== `Bearer ${env.cronSecret}` && key !== env.cronSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const subs = await prisma.pushSubscription.findMany();
  let sent = 0;
  let pruned = 0;

  for (const sub of subs) {
    const notified: Record<string, boolean> = { ...((sub.notified as Record<string, boolean>) || {}) };
    let changed = false;
    let gone = false;

    for (const ex of UPCOMING_EXAMS) {
      const days = daysUntil(ex.date, now);
      if (days < 0) continue;
      const crossed = REMINDER_BUCKETS.filter((b) => days <= b && !notified[`${ex.name}:${b}`]);
      if (!crossed.length) continue;

      const res = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        {
          title: `${ex.name} exam ${countdownLabel(days)}`,
          body: `${ex.fullName} — ${fmtExamDate(ex.date)}`,
          url: '/academics#milestones',
          tag: `exam-${ex.name}`,
        },
      );
      if (res === 'gone') {
        gone = true;
        break;
      }
      if (res === 'ok') {
        sent++;
        crossed.forEach((b) => (notified[`${ex.name}:${b}`] = true));
        changed = true;
      }
    }

    if (gone) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      pruned++;
    } else if (changed) {
      await prisma.pushSubscription.update({ where: { id: sub.id }, data: { notified } }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, subscriptions: subs.length, sent, pruned });
}
