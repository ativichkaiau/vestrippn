export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { fetchCanvasTelemetry } from '@/lib/canvas';
import { getAnkiHistory, type AnkiHistoryPoint } from '@/lib/anki';
import AnalyticsClient from './AnalyticsClient';

// Study telemetry hub. Canvas grades + Anki streak come from the server (same
// sources the dashboard/academics use); focus-session history, lap PBs and the
// day-over-day trend snapshots live in the browser (localStorage) and are read
// client-side in AnalyticsClient.
export default async function AnalyticsPage() {
  const canvas = await fetchCanvasTelemetry();

  const session = await auth();
  let anki: { due: number; new: number; reviewedToday: number; streak: number } | undefined;
  let ankiHistory: AnkiHistoryPoint[] = [];
  if (session?.user?.id) {
    try {
      const rec = await prisma.ankiTelemetry.findUnique({ where: { userId: session.user.id } });
      if (rec) {
        anki = { due: rec.dueCards, new: rec.newCards, reviewedToday: rec.reviewedToday, streak: rec.streak };
      }
      // Real per-day history (streak + reviews) — powers the trends server-side
      // instead of the device-local snapshots, so they're historical from day one.
      ankiHistory = await getAnkiHistory(session.user.id, 30);
    } catch (error) {
      console.error('[Analytics] Anki uplink failed:', error);
    }
  }

  return (
    <div className="relative h-full w-full">
      <AnalyticsClient canvas={canvas} anki={anki} ankiHistory={ankiHistory} />
    </div>
  );
}
