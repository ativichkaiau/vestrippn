import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth/owner';
import { prisma } from '@/lib/prisma';
import { isDue } from '@/lib/learn/review';
import { examCountdowns } from '@/lib/study-overview';

export const dynamic = 'force-dynamic';

/**
 * GET /api/study/overview
 * What the Study view shows: exam countdowns, the case review queue's size,
 * and the latest Anki due count.
 */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to see your study overview.' }, { status: 401 });
  const now = new Date();
  try {
    const [countdowns, reviews, anki] = await Promise.all([
      examCountdowns(userId, now),
      prisma.caseReview.findMany({ where: { userId, dueAt: { not: null } }, select: { dueAt: true } }),
      // Anki is optional here: no snapshot (or no table) just hides the line.
      prisma.ankiTelemetry.findUnique({ where: { userId }, select: { dueCards: true, lastSync: true } }).catch(() => null),
    ]);
    const upcoming = reviews.filter((review) => !isDue(review, now)).map((review) => review.dueAt!.toISOString()).sort();
    return NextResponse.json(
      {
        countdowns,
        review: { due: reviews.filter((review) => isDue(review, now)).length, next: upcoming[0] ?? null },
        anki: anki ? { due: anki.dueCards, lastSync: anki.lastSync.toISOString() } : null,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('[STUDY OVERVIEW]', error);
    return NextResponse.json({ error: 'Your study overview could not be loaded.' }, { status: 500 });
  }
}
