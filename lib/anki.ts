import { prisma } from "@/lib/prisma";

// The user studies in Thailand; key the daily history by the Asia/Bangkok day
// so a snapshot lands on the same calendar day the user sees in Anki.
export function bangkokDay(date = new Date()): string {
  // en-CA gives YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export interface AnkiSnapshot {
  due: number;
  newCards: number;
  reviewedToday: number;
  streak: number;
}

/**
 * Upsert today's Anki history row for a user. Called on every telemetry write
 * (add-on push and browser sync) so each day keeps its latest snapshot.
 * Best-effort: never throw into the caller — a history hiccup must not break
 * the primary telemetry write.
 */
export async function recordAnkiHistory(userId: string, s: AnkiSnapshot): Promise<void> {
  const day = bangkokDay();
  const data = {
    dueCards: s.due,
    newCards: s.newCards,
    reviewedToday: s.reviewedToday,
    streak: s.streak,
  };
  try {
    await prisma.ankiHistory.upsert({
      where: { userId_day: { userId, day } },
      update: data,
      create: { userId, day, ...data },
    });
  } catch (error) {
    console.error("[ANKI HISTORY] snapshot write failed:", error);
  }
}

export interface AnkiHistoryPoint {
  day: string;
  reviewedToday: number;
  streak: number;
  dueCards: number;
}

/** Last `days` daily snapshots for a user, oldest → newest. */
export async function getAnkiHistory(userId: string, days = 30): Promise<AnkiHistoryPoint[]> {
  try {
    const rows = await prisma.ankiHistory.findMany({
      where: { userId },
      orderBy: { day: "desc" },
      take: days,
      select: { day: true, reviewedToday: true, streak: true, dueCards: true },
    });
    return rows.reverse();
  } catch (error) {
    console.error("[ANKI HISTORY] read failed:", error);
    return [];
  }
}
