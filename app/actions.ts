'use server'; // <-- This magic word tells Next.js this code ONLY runs securely on the server

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/auth/owner";
import { revalidatePath } from "next/cache";

// ==========================================
// SECTOR ALPHA: IELTS VAULT
// ==========================================
export async function saveIeltsModule(text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  // Save directly to the cloud database
  await prisma.ieltsModule.create({
    data: {
      text: text,
      userId: session.user.id,
    },
  });

  // Instantly refresh the page to show the new data without a reload
  revalidatePath("/"); 
}

// ==========================================
// SECTOR BETA: TASKS & REMINDERS
// ==========================================
export async function addTask(title: string, category: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  await prisma.task.create({
    data: {
      title,
      category,
      userId: session.user.id,
    },
  });

  revalidatePath("/");
}

// ==========================================
// SECTOR GAMMA: TODAY's COMMAND
// ==========================================
export async function updateDailyCommand(intent: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  // Using upsert: If a command exists, update it. If not, create it.
  await prisma.dailyCommand.upsert({
    where: { userId: session.user.id },
    update: { intent },
    create: { intent, userId: session.user.id },
  });

  revalidatePath("/");
}

export async function toggleTask(id: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  // Prevent it from crashing if the ID is a temporary UI id
  if (id.startsWith('temp-')) return;

  await prisma.task.update({
    where: { 
      id: id,
      userId: session.user.id // Security check to ensure they own it
    },
    data: { completed },
  });

  revalidatePath("/");
}
export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  // Prevent crashing if trying to delete a temporary front-end task
  if (id.startsWith('temp-')) return; 

  await prisma.task.delete({
    where: { 
      id: id,
      userId: session.user.id // Security lock
    }
  });

  revalidatePath("/");
}


// ==========================================
// SECTOR DELTA: RESEARCH HUB
// ==========================================
export async function updateResearchStats(title: string, screening: number, fullText: number, extraction: number) {
  const userId = await resolveUserId();
  if (!userId) throw new Error("Owner account unavailable");

  await prisma.researchProject.upsert({
    where: { userId },
    update: { title, screening, fullText, extraction },
    create: {
      userId,
      title,
      screening,
      fullText,
      extraction
    }
  });

  revalidatePath("/");
  revalidatePath("/research");
}
// ==========================================
// SECTOR EPSILON: VITALITY MONITOR
// ==========================================
export async function updateFitnessData(workoutDays: boolean[], lastWorkout: string, streak: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  // Upsert: Create a log if it's the first time, otherwise update it.
  await prisma.fitnessLog.upsert({
    where: { userId: session.user.id },
    update: {
      workoutDays: JSON.stringify(workoutDays),
      lastWorkout,
      streak
    },
    create: {
      userId: session.user.id,
      workoutDays: JSON.stringify(workoutDays),
      lastWorkout,
      streak
    }
  });

  revalidatePath("/");
}
// ==========================================
// SECTOR EPSILON: V3 FITNESS HUB SYNC
// ==========================================
export async function syncFitnessHubData(activeCycle: number, metrics: string, mealsPayload: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  await prisma.fitnessLog.upsert({
    where: { userId: session.user.id },
    update: { activeCycle, metrics, mealsPayload },
    create: {
      userId: session.user.id,
      activeCycle,
      metrics,
      mealsPayload
    }
  });
}
// ==========================================
// SECTOR DELTA: RESEARCH HUB MATRIX
// ==========================================
export async function saveLiteratureResult(pmid: string, title: string, authors: string, journal: string, url: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  // Save the extracted paper to the database vault
  await prisma.researchExtraction.create({
    data: {
      userId: session.user.id,
      pmid,
      title,
      authors,
      journal,
      url,
      status: "UNSCREENED"
    }
  });
}

// ==========================================
// SECTOR EPSILON: ANKI SPACED-REPETITION TELEMETRY
// ==========================================
export async function syncAnkiData(due: number, newCards: number, reviewedToday: number, streak: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized Access");

  await prisma.ankiTelemetry.upsert({
    where: { userId: session.user.id },
    update: { dueCards: due, newCards, reviewedToday, streak, lastSync: new Date() },
    create: {
      userId: session.user.id,
      dueCards: due,
      newCards,
      reviewedToday,
      streak,
    },
  });

  revalidatePath("/academics");
}