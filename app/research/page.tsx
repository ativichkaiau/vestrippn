// Force dynamic rendering so the Postgres sync is always live.
export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ResearchClient, { type VaultItem } from "./ResearchClient";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Systematic review infrastructure: systems, pipeline and tools.',
};

async function loadExtractions(userId: string): Promise<VaultItem[]> {
  try {
    const startTime = Date.now();
    const extractions = await prisma.researchExtraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`[RESEARCH SYNC] Loaded ${extractions.length} extractions in ${Date.now() - startTime}ms for Operator ${userId}`);
    // `source` is a free string column; the app only writes ResearchSource ids.
    return extractions as VaultItem[];
  } catch (error) {
    // Fails gracefully: an empty vault rather than a crashed page.
    console.error("[CRITICAL] Research Postgres Uplink Failed:", error);
    return [];
  }
}

export default async function ResearchPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) console.warn("[RESEARCH SYNC] No active session found. Serving local skeleton state.");
  const savedExtractions = userId ? await loadExtractions(userId) : [];

  return (
    <div className="relative h-full w-full">
      <ResearchClient cloudExtractions={savedExtractions} />
    </div>
  );
}
