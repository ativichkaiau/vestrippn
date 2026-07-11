export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/auth/owner";
import { fetchCanvasTelemetry } from "@/lib/canvas";
import { getAnkiHistory, type AnkiHistoryPoint } from "@/lib/anki";
import AcademicsClient from "./AcademicsClient";

export default async function AcademicsPage() {
  // 1. Fetch Canvas API Data (scores + upcoming deadlines, one set of calls)
  const liveCanvasData = await fetchCanvasTelemetry();

  // 2. Fetch Anki telemetry + daily history for the owner
  const userId = await resolveUserId();
  let formattedAnkiData = undefined;
  let ankiHistory: AnkiHistoryPoint[] = [];

  if (userId) {
    try {
      const [ankiRecord, history] = await Promise.all([
        prisma.ankiTelemetry.findUnique({ where: { userId } }),
        getAnkiHistory(userId, 30),
      ]);

      if (ankiRecord) {
        formattedAnkiData = {
          due: ankiRecord.dueCards,
          new: ankiRecord.newCards,
          reviewedToday: ankiRecord.reviewedToday,
          streak: ankiRecord.streak
        };
      }
      ankiHistory = history;
    } catch (error) {
      console.error("[CRITICAL] Anki Postgres Uplink Failed:", error);
    }
  }

  return (
    <div className="relative h-full w-full">
      <AcademicsClient
        initialCanvasData={liveCanvasData}
        ankiData={formattedAnkiData}
        ankiHistory={ankiHistory}
      />
    </div>
  );
}
