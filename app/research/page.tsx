import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ResearchClient from "./ResearchClient";

export default async function ResearchPage() {
  const session = await auth();
  let researchProject = null;
  let savedExtractions: any[] = [];

  if (session?.user?.id) {
    // 1. Fetch Covidence Stats
    researchProject = await prisma.researchProject.findUnique({
      where: { userId: session.user.id }
    });

    // 2. Fetch Previously Saved Literature
    savedExtractions = await prisma.researchExtraction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  return (
    <ResearchClient 
      cloudResearch={researchProject} 
      cloudExtractions={savedExtractions} 
    />
  );
}