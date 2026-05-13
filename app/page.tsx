import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function Home() {
  // 1. Authenticate the W05 Operator
  const session = await auth();
  
  let todaysCommand = null;
  let activeTasks: any[] = [];
  let researchData = null;
  let fitnessData = null;
  
  // 2. Fetch Telemetry directly from the Cloud Database
  if (session?.user?.id) {
    // Fetch Sector Gamma: Today's Command
    todaysCommand = await prisma.dailyCommand.findUnique({
      where: { userId: session.user.id }
    });
    
    // Fetch Sector Beta: Reminders & Tasks
    activeTasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    // Fetch Sector Delta: Research Data
    researchData = await prisma.researchProject.findUnique({
      where: { userId: session.user.id }
    });

    // Fetch Sector Epsilon: Vitality Monitor
    fitnessData = await prisma.fitnessLog.findUnique({
      where: { userId: session.user.id }
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