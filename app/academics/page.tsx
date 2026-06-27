export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchCanvasTelemetry } from "@/lib/canvas";
import AcademicsClient from "./AcademicsClient";

export default async function AcademicsPage() {
  // 1. Fetch Canvas API Data
  const liveCanvasData = await fetchCanvasTelemetry();
  
  // 2. Fetch Anki Database Telemetry
  const session = await auth();
  let formattedAnkiData = undefined;

  if (session?.user?.id) {
    try {
      const ankiRecord = await prisma.ankiTelemetry.findUnique({
        where: { userId: session.user.id }
      });

      if (ankiRecord) {
        formattedAnkiData = {
          due: ankiRecord.dueCards,
          new: ankiRecord.newCards,
          reviewedToday: ankiRecord.reviewedToday,
          streak: ankiRecord.streak
        };
      }
    } catch (error) {
      console.error("[CRITICAL] Anki Postgres Uplink Failed:", error);
    }
  }

  return (
    <div className="relative h-full w-full">
      <AcademicsClient 
        initialCanvasData={liveCanvasData} 
        ankiData={formattedAnkiData} 
      />
    </div>
  );
}
