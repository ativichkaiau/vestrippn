// Shared Canvas telemetry fetch. Used by the Academics page (server component)
// and the Cockpit Intelligence assistant so both report the same live scores.

// All tracked Canvas course ids (dashboard card + Academics hub read the same
// list, so both show the same courses — full parity).
export const TARGET_COURSES = ['26141', '26393', '26349', '26702', '27415', '30964', '31275'];

// Display names are the COURSE NUMBER. Where we know the number, hardcode it;
// otherwise Canvas's own course_code (which is the "3303xx" number) is used.
const COURSE_NUMBER: Record<string, string> = {
  '26702': '330321', // HMS-2
  '30964': '330323', // HRS-2
  '31275': '330324', // HGB-2
};

// Label to show when Canvas doesn't return a target course at all (so the
// course still appears, with no score). Numbers where known, else the code.
const COURSE_FALLBACK: Record<string, string> = {
  '26141': 'HEN-2',
  '26393': 'HNS-2',
  '26349': 'TBL',
  '27415': 'HCVS-2',
  ...COURSE_NUMBER,
};

export interface CanvasSubject {
  id: string;
  name: string;
  progress: number | null;
}

export interface UpcomingAssignment {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  dueAt: string; // ISO 8601
  url?: string;
}

export interface CanvasTelemetry {
  subjects: CanvasSubject[];
  metrics: { quizzes: number; assignments: number };
  upcoming: UpcomingAssignment[];
}

const EMPTY: CanvasTelemetry = { subjects: [], metrics: { quizzes: 0, assignments: 0 }, upcoming: [] };

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

    // Upcoming deadlines collected from the same assignment fetch (no extra calls).
    const now = Date.now();
    const upcoming: UpcomingAssignment[] = [];

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

            // Upcoming: due in the future and not yet submitted.
            if (a?.due_at && !sub?.submitted_at && new Date(a.due_at).getTime() > now) {
              upcoming.push({
                id: a.id?.toString() ?? `${id}-${a.due_at}`,
                courseId: id,
                courseName: COURSE_NUMBER[id] || c.course_code || c.name || id,
                name: a.name || 'Untitled assignment',
                dueAt: a.due_at,
                url: a.html_url,
              });
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

        // Prefer the known course number, else Canvas's course_code (the number).
        return { id, name: COURSE_NUMBER[id] || c.course_code || c.name, progress };
      })
    );

    // Ensure every tracked course appears even if Canvas didn't return it, so
    // the dashboard and Academics hub always show the same set (full parity).
    const returned = new Set(subjects.map((s) => s.id));
    for (const id of TARGET_COURSES) {
      if (!returned.has(id)) subjects.push({ id, name: COURSE_FALLBACK[id] || id, progress: null });
    }

    upcoming.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    return {
      subjects,
      metrics: {
        quizzes: quizTotal > 0 ? Math.round((quizEarned / quizTotal) * 100) : 0,
        assignments: assTotal > 0 ? Math.round((assEarned / assTotal) * 100) : 0,
      },
      upcoming: upcoming.slice(0, 6),
    };
  } catch (error) {
    console.error('[CANVAS] Telemetry sync failed:', error);
    return EMPTY;
  }
}
