import { resolveUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function Home() {
  // 1. Resolve the W05 Operator. Prefers the session, falls back to the sole
  //    owner — same skip-sign-in pattern used by the Learn/DAS endpoints.
  const userId = await resolveUserId();

  let todaysCommand = null;
  let activeTasks: any[] = [];
  let researchData = null;
  let fitnessData = null;

  // 2. Fetch Telemetry directly from the Cloud Database
  if (userId) {
    // Fetch Sector Gamma: Today's Command
    todaysCommand = await prisma.dailyCommand.findUnique({
      where: { userId }
    });

    // Fetch Sector Beta: Reminders & Tasks
    activeTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch Sector Delta: Research Data
    researchData = await prisma.researchProject.findUnique({
      where: { userId }
    });

    // Fetch Sector Epsilon: Vitality Monitor
    fitnessData = await prisma.fitnessLog.findUnique({
      where: { userId }
    });
  }

  // 3. Pipe the secure payload into your Client UI Chassis
  return (
    <DashboardClient 
      cloudCommand={todaysCommand?.intent || "AWAITING DIRECTIVE"} 
      cloudTasks={activeTasks} 
      cloudResearch={researchData}
      cloudFitness={fitnessData}
    />
  );
}