// 🚨 THE UPGRADE: Force dynamic rendering so the Postgres sync is always live
export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ResearchClient from "./ResearchClient";

export default async function ResearchPage() {
  const session = await auth();
  let researchProject = null;
  let savedExtractions: any[] = [];

  if (session?.user?.id) {
    try {
      const startTime = Date.now();

      // 1. Fire parallel database requests for maximum speed
      const [fetchedProject, fetchedExtractions] = await Promise.all([
        prisma.researchProject.findUnique({
          where: { userId: session.user.id }
        }),
        prisma.researchExtraction.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      researchProject = fetchedProject;
      savedExtractions = fetchedExtractions;

      // 2. Vercel Telemetry Log
      console.log(`[RESEARCH SYNC] Loaded ${savedExtractions.length} extractions in ${Date.now() - startTime}ms for Operator ${session.user.id}`);
      
    } catch (error) {
      console.error("[CRITICAL] Research Postgres Uplink Failed:", error);
      // Fails gracefully: Variables remain null/empty so the UI doesn't crash
    }
  } else {
    console.warn("[RESEARCH SYNC] No active session found. Serving local skeleton state.");
  }

  return (
    <div className="relative h-full w-full">
      <ResearchClient 
        cloudResearch={researchProject} 
        cloudExtractions={savedExtractions} 
      />
    </div>
  );
}
