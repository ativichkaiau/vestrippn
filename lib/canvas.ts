// Shared Canvas telemetry fetch. Used by the Academics page (server component),
// the Cockpit Intelligence assistant, and the W85 daily planner. The optional
// user id lets the planner follow the courses a user has edited in Workspace;
// existing callers without an id retain the established course set.

import { getActiveCourses } from '@/lib/curriculum';

// All tracked Canvas course ids (dashboard card + Academics hub read the same
// list, so both show the same courses — full parity).
export const TARGET_COURSES = ['26141', '26393', '26349', '26702', '27415', '30964', '31275', '26896', '31469'];

// Keep established course-number labels and the supplied HHL / HSC short names.
// Other courses use Canvas's own course_code (the "3303xx" number).
const COURSE_LABEL: Record<string, string> = {
  '26702': '330321', // HMS-2
  '30964': '330323', // HRS-2
  '31275': '330324', // HGB-2
  '26896': 'HHL', // Human Hematopoietic and Lymphoreticular System
  '31469': 'HSC', // Human Skin System and Connective Tissues
};

// Label to show when Canvas doesn't return a target course at all (so the
// course still appears, with no score). Numbers where known, else the code.
const COURSE_FALLBACK: Record<string, string> = {
  '26141': 'HEN-2',
  '26393': 'HNS-2',
  '26349': 'TBL',
  '27415': 'HCVS-2',
  ...COURSE_LABEL,
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
  deadlines: UpcomingAssignment[];
  status: 'connected' | 'partial' | 'offline' | 'not-configured' | 'unknown';
  syncedAt: string | null;
}

const EMPTY: CanvasTelemetry = {
  subjects: [], metrics: { quizzes: 0, assignments: 0 }, upcoming: [], deadlines: [],
  status: 'not-configured', syncedAt: null,
};

// Cache only SUCCESSFUL results (module-scoped, warm-instance). This runs on
// every Academics render AND every assistant message (via buildHubContext), so
// without a cache we'd re-crawl Canvas (1 + N calls) each time and risk rate
// limits. Caching only successes (not the empty catch state) means a bad/expired
// token or transient Canvas error is retried on the next call and recovers the
// instant the token is fixed — never a stale-empty screen for 5 minutes.
const CACHE_TTL_MS = 5 * 60 * 1000;
const telemetryCache = new Map<string, { at: number; data: CanvasTelemetry }>();

export async function fetchCanvasTelemetry(userId?: string): Promise<CanvasTelemetry> {
  const token = process.env.CANVAS_TOKEN;
  const base = process.env.CANVAS_BASE_URL || 'https://mango-cmu.instructure.com';

  if (!token) return EMPTY;

  let configuredCourses = TARGET_COURSES;
  let configuredLabels: Record<string, string> = { ...COURSE_LABEL };
  if (userId) {
    try {
      const courses = await getActiveCourses(userId);
      if (courses.length) {
        configuredCourses = courses.map((course) => course.canvasCourseId).filter((id): id is string => Boolean(id));
        configuredLabels = Object.fromEntries(courses.flatMap((course) => course.canvasCourseId ? [[course.canvasCourseId, course.code]] : []));
      }
    } catch (error) {
      // A stale database must not blank Canvas telemetry; use the established
      // fallback set while the curriculum endpoint reports the database error.
      console.warn('[CANVAS] Curriculum lookup failed; using default courses.', error);
    }
  }

  const cacheKey = `${userId ?? 'default'}:${configuredCourses.join(',')}`;
  const cached = telemetryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

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
      (c: any) => c.id && configuredCourses.includes(c.id.toString())
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
                courseName: configuredLabels[id] || c.course_code || c.name || id,
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

        // Use a stable label when known, else Canvas's course_code (the number).
        return { id, name: configuredLabels[id] || c.course_code || c.name, progress };
      })
    );

    // Ensure every tracked course appears even if Canvas didn't return it, so
    // the dashboard and Academics hub always show the same set (full parity).
    const returned = new Set(subjects.map((s) => s.id));
    for (const id of configuredCourses) {
      if (!returned.has(id)) subjects.push({ id, name: configuredLabels[id] || COURSE_FALLBACK[id] || id, progress: null });
    }

    upcoming.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    const partial = courses.length !== configuredCourses.length;
    const data: CanvasTelemetry = {
      subjects,
      metrics: {
        quizzes: quizTotal > 0 ? Math.round((quizEarned / quizTotal) * 100) : 0,
        assignments: assTotal > 0 ? Math.round((assEarned / assTotal) * 100) : 0,
      },
      upcoming: upcoming.slice(0, 6),
      deadlines: upcoming.slice(0, 6),
      status: partial ? 'partial' : 'connected',
      syncedAt: new Date().toISOString(),
    };
    // Cache only a real result (never the empty catch state), so an expired
    // token recovers on the next call instead of sticking for the TTL.
    if (data.subjects.length > 0) telemetryCache.set(cacheKey, { at: Date.now(), data });
    return data;
  } catch (error) {
    console.error('[CANVAS] Telemetry sync failed:', error);
    return { ...EMPTY, status: 'offline' };
  }
}
