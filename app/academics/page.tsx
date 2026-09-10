export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/owner";
import { fetchCanvasTelemetry } from "@/lib/canvas";
import { getActiveCourses, getActiveExams } from "@/lib/curriculum";
import type { ActiveExamData, CourseData } from "@/lib/curriculum-types";
import { getAnkiHistory, type AnkiHistoryPoint } from "@/lib/anki";
import AcademicsClient from "./AcademicsClient";

export default async function AcademicsPage() {
  const userId = await requireUserId();
  // 1. Fetch Canvas API data from the courses the owner manages in Workspace.
  const liveCanvasData = await fetchCanvasTelemetry(userId ?? undefined);

  // 2. Fetch the editable curriculum plus Anki telemetry and daily history.
  let formattedAnkiData = undefined;
  let ankiHistory: AnkiHistoryPoint[] = [];
  let curriculumCourses: CourseData[] = [];
  let curriculumExams: ActiveExamData[] = [];

  if (userId) {
    try {
      const [ankiRecord, history, courses, exams] = await Promise.all([
        prisma.ankiTelemetry.findUnique({ where: { userId } }),
        getAnkiHistory(userId, 30),
        getActiveCourses(userId),
        getActiveExams(userId),
      ]);

      if (ankiRecord) {
        formattedAnkiData = {
          due: ankiRecord.dueCards,
          new: ankiRecord.newCards,
          reviewedToday: ankiRecord.reviewedToday,
          streak: ankiRecord.streak
        };
      }
      ankiHistory = history;
      curriculumCourses = courses;
      curriculumExams = exams;
    } catch (error) {
      console.error("[CRITICAL] Anki Postgres Uplink Failed:", error);
    }
  }

  return (
    <div className="relative h-full w-full">
      <AcademicsClient
        initialCanvasData={liveCanvasData}
        ankiData={formattedAnkiData}
        ankiHistory={ankiHistory}
        curriculumCourses={curriculumCourses}
        curriculumExams={curriculumExams}
      />
    </div>
  );
}
