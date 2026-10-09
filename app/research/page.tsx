// 🚨 THE UPGRADE: Force dynamic rendering so the Postgres sync is always live
export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ResearchClient from "./ResearchClient";
import type { Metadata } from 'next';
import ResearchDocs from "@/components/system/ResearchDocs";
import ResearchDagCard from "@/components/ResearchDagCard";
import { Action, Page, PageHeader } from "@/components/system/primitives";

export const metadata: Metadata = {
  title: 'Research',
  description: 'Systematic review infrastructure: systems, pipeline and tools.',
};

export default async function ResearchPage() {
  const session = await auth();

  // Public view: the research documentation and the knowledge graph. The
  // literature search and the extraction vault are the signed-in user's own.
  if (!session?.user?.id) {
    return (
      <Page>
        <PageHeader
          index="05"
          label="research"
          title="Research"
          lede="Systematic review infrastructure, documented as a system: what exists, how the pipeline runs, and what it is built on."
          actions={<Action href="/auth/signin?callbackUrl=%2Fresearch">sign in for the tools</Action>}
        />
        <ResearchDocs signedIn={false} />
        <section className="sys-panel sys-section" aria-label="Brugada knowledge graph">
          <div className="sys-panel-body">
            <ResearchDagCard />
          </div>
        </section>
      </Page>
    );
  }

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
