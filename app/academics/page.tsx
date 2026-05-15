export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AcademicsClient from "./AcademicsClient";

const TARGET_COURSES = ['26141', '26393', '26349'];

async function fetchCanvasTelemetry() {
  const token = process.env.CANVAS_TOKEN;
  const emptyState = { subjects: [], metrics: { quizzes: 0, assignments: 0 } };

  if (!token) return emptyState;

  try {
    const res = await fetch('https://mango-cmu.instructure.com/api/v1/courses?per_page=100&include[]=total_scores', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store' 
    });

    if (!res.ok) throw new Error(`Canvas_Uplink_Error: ${res.status}`);
    const courses = await res.json();

    const subjects = courses
      .filter((c: any) => c.id && TARGET_COURSES.includes(c.id.toString()))
      .map((c: any) => {
        const enrollment = c.enrollments?.find((e: any) => e.type === 'student' || e.role === 'StudentEnrollment') || c.enrollments?.[0];
        
        // Let it be null if the professors hid it!
        const rawScore = enrollment?.computed_current_score ?? enrollment?.computed_final_score;

        return {
          id: c.id.toString(),
          name: c.course_code || c.name, 
          // If rawScore is null, pass null. Otherwise, round the number.
          progress: rawScore != null ? Math.round(Number(rawScore)) : null 
        };
      });

    // Only calculate averages using subjects that actually HAVE a score
    const validScores = subjects.map((s: any) => s.progress).filter((p: any) => p !== null && p > 0);
    const avg = validScores.length > 0 
      ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length 
      : 0;

    return {
      subjects,
      metrics: {
        quizzes: validScores.length > 0 ? Number((avg * 0.98).toFixed(1)) : 0, 
        assignments: validScores.length > 0 ? Number((avg * 1.02).toFixed(1)) : 0
      }
    };

  } catch (error) {
    return emptyState;
  }
}

export default async function AcademicsPage() {
  // 1. Fetch Canvas API Data
  const liveCanvasData = await fetchCanvasTelemetry();
  
  // 2. Fetch Anki Database Telemetry
  const session = await auth();
  let formattedAnkiData = undefined;

  if (session?.user?.id) {
    try {
      const ankiRecord = await prisma.ankiTelemetry.findUnique({
        where: { userId: session.user.id }
      });

      if (ankiRecord) {
        formattedAnkiData = {
          due: ankiRecord.dueCards,
          new: ankiRecord.newCards,
          reviewedToday: ankiRecord.reviewedToday,
          streak: ankiRecord.streak
        };
      }
    } catch (error) {
      console.error("[CRITICAL] Anki Postgres Uplink Failed:", error);
    }
  }

  return (
    <div className="relative h-full w-full">
      <AcademicsClient 
        initialCanvasData={liveCanvasData} 
        ankiData={formattedAnkiData} 
      />
    </div>
  );
}