import { resolveUserId } from "@/lib/auth/owner";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

// Always render at request time (this page reads cookies via auth() and queries
// the DB; static prerender would either fail or serve stale data).
export const dynamic = "force-dynamic";

// Run each sector's DB call in isolation so one failing query can't blank the
// whole dashboard — at worst the affected sector falls back to its default.
async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`Dashboard ${label} failed:`, err);
    return null;
  }
}

export default async function Home() {
  // 1. Resolve the W05 Operator. Prefers the session, falls back to the sole
  //    owner — same skip-sign-in pattern used by the Learn/DAS endpoints.
  //    resolveUserId() catches its own errors and returns null on failure.
  const userId = await resolveUserId();

  let todaysCommand = null;
  let activeTasks: Awaited<ReturnType<typeof prisma.task.findMany>> = [];
  let researchData = null;
  let fitnessData = null;

  // 2. Fetch Telemetry directly from the Cloud Database (per-sector isolated)
  if (userId) {
    todaysCommand = await safe("dailyCommand", () =>
      prisma.dailyCommand.findUnique({ where: { userId } }),
    );
    activeTasks =
      (await safe("tasks", () =>
        prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      )) ?? [];
    researchData = await safe("researchProject", () =>
      prisma.researchProject.findUnique({ where: { userId } }),
    );
    fitnessData = await safe("fitnessLog", () =>
      prisma.fitnessLog.findUnique({ where: { userId } }),
    );
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