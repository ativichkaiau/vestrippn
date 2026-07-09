// Shared Canvas telemetry fetch. Used by the Academics page (server component)
// and the Cockpit Intelligence assistant so both report the same live scores.

export const TARGET_COURSES = ['26141', '26393', '26349', '26702', '27415'];

// Friendly display names per tracked course id. Shared so the dashboard card,
// the Academics hub, and the assistant all label courses identically (falls
// back to the Canvas course_code when an id isn't listed).
export const COURSE_NAMES: Record<string, string> = {
  '26141': 'HEN-2 (Endocrine)',
  '26393': 'HNS-2 (Nervous & Senses)',
  '26349': 'TBL (Team-Based Learning)',
  '26702': 'HMS-2 (Musculoskeletal)',
  '27415': 'HCVS-2 (Cardiovascular)',
};

export interface CanvasSubject {
  id: string;
  name: string;
  progress: number | null;
}

export interface CanvasTelemetry {
  subjects: CanvasSubject[];
  metrics: { quizzes: number; assignments: number };
}

const EMPTY: CanvasTelemetry = { subjects: [], metrics: { quizzes: 0, assignments: 0 } };

export async function fetchCanvasTelemetry(): Promise<CanvasTelemetry> {
  const token = process.env.CANVAS_TOKEN;
  const base = process.env.CANVAS_BASE_URL || 'https://mango-cmu.instructure.com';

  if (!token) return EMPTY;

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // 1. Pull the target courses (for names + a fallback total score)
    const res = await fetch(`${base}/api/v1/courses?per_page=100&include[]=total_scores`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Canvas_Uplink_Error: ${res.status}`);
    const allCourses = await res.json();

    const courses = (Array.isArray(allCourses) ? allCourses : []).filter(
      (c: any) => c.id && TARGET_COURSES.includes(c.id.toString())
    );

    // Global accumulators for the two summary metrics
    let quizEarned = 0, quizTotal = 0;
    let assEarned = 0, assTotal = 0;

    // 2. For each course, derive the real grade from graded submissions.
    //    This bypasses hidden course totals (computed_current_score = null).
    const subjects = await Promise.all(
      courses.map(async (c: any) => {
        const id = c.id.toString();
        let earned = 0, total = 0;

        try {
          const aRes = await fetch(
            `${base}/api/v1/courses/${id}/assignments?include[]=submission&per_page=100`,
            { headers, cache: 'no-store' }
          );
          const assignments = aRes.ok ? await aRes.json() : [];

          (Array.isArray(assignments) ? assignments : []).forEach((a: any) => {
            const sub = a?.submission;
            if (sub && sub.score !== null && sub.workflow_state === 'graded' && a.points_possible > 0) {
              earned += sub.score;
              total += a.points_possible;

              const isQuiz =
                a.submission_types?.includes('online_quiz') ||
                a.is_quiz_assignment ||
                a.name?.toLowerCase().includes('quiz');

              if (isQuiz) { quizEarned += sub.score; quizTotal += a.points_possible; }
              else { assEarned += sub.score; assTotal += a.points_possible; }
            }
          });
        } catch {
          /* fall through to the enrollment-based fallback below */
        }

        // Real grade from graded work; else fall back to Canvas's computed score
        let progress: number | null = null;
        if (total > 0) {
          progress = Math.round((earned / total) * 100);
        } else {
          const enrollment =
            c.enrollments?.find((e: any) => e.type === 'student' || e.role === 'StudentEnrollment') ||
            c.enrollments?.[0];
          const rawScore = enrollment?.computed_current_score ?? enrollment?.computed_final_score;
          progress = rawScore != null ? Math.round(Number(rawScore)) : null;
        }

        return { id, name: COURSE_NAMES[id] || c.course_code || c.name, progress };
      })
    );

    return {
      subjects,
      metrics: {
        quizzes: quizTotal > 0 ? Math.round((quizEarned / quizTotal) * 100) : 0,
        assignments: assTotal > 0 ? Math.round((assEarned / assTotal) * 100) : 0,
      },
    };
  } catch (error) {
    console.error('[CANVAS] Telemetry sync failed:', error);
    return EMPTY;
  }
}
