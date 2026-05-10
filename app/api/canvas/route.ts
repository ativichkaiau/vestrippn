import { NextResponse } from 'next/server';

export async function GET() {
  const CANVAS_URL = process.env.CANVAS_BASE_URL;
  const TOKEN = process.env.CANVAS_API_TOKEN;

  // SAFETY 1: Check credentials before even trying
  if (!CANVAS_URL || !TOKEN) {
    console.error("❌ CRITICAL: Missing Canvas Environment Variables");
    return NextResponse.json({ error: 'Config Missing' }, { status: 500 });
  }

  const targetCourses = [
    { id: '26141', targetName: 'HEN-2 (Endocrine)' },
    { id: '26393', targetName: 'HNS-2 (Nervous & Senses)' },
    { id: '26349', targetName: 'Team-Based Learning (TBL)' }
  ];

  try {
    // SAFETY 2: Targeted parallel fetches with individual catch blocks
    const coursePromises = targetCourses.map(course => 
      fetch(`${CANVAS_URL}/api/v1/courses/${course.id}?include[]=total_scores`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        next: { revalidate: 300 } 
      }).then(res => res.ok ? res.json() : null)
        .catch(() => null)
    );

    const assignmentPromises = targetCourses.map(course =>
      fetch(`${CANVAS_URL}/api/v1/courses/${course.id}/assignments?include[]=submission&per_page=100`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        next: { revalidate: 300 }
      }).then(res => res.ok ? res.json() : [])
        .catch(() => [])
    );

    const [rawCourseData, rawAssignments] = await Promise.all([
      Promise.all(coursePromises),
      Promise.all(assignmentPromises)
    ]);

    let globalQuizTotal = 0, globalQuizEarned = 0;
    let globalAssTotal = 0, globalAssEarned = 0;

    const formattedSubjects = rawCourseData.map((course: any, index: number) => {
      // If course data is missing, skip it safely
      if (!course || !course.id) return null;
      
      const vipInfo = targetCourses.find(c => c.id === course.id.toString());
      const courseAssignments = Array.isArray(rawAssignments[index]) ? rawAssignments[index] : [];
      
      let coursePointsEarned = 0;
      let coursePointsTotal = 0;

      courseAssignments.forEach((assign: any) => {
        const sub = assign?.submission;
        
        if (sub && sub.score !== null && sub.workflow_state === 'graded' && assign.points_possible > 0) {
          coursePointsEarned += sub.score;
          coursePointsTotal += assign.points_possible;

          const isQuiz = assign.submission_types?.includes('online_quiz') || 
                         assign.is_quiz_assignment || 
                         assign.name?.toLowerCase().includes('quiz');

          if (isQuiz) {
            globalQuizEarned += sub.score;
            globalQuizTotal += assign.points_possible;
          } else {
            globalAssEarned += sub.score;
            globalAssTotal += assign.points_possible;
          }
        }
      });

      // Calculate grade (fallback to Canvas's own calculation if math fails)
      let calculatedProgress = 0;
      if (coursePointsTotal > 0) {
        calculatedProgress = Math.round((coursePointsEarned / coursePointsTotal) * 100);
      } else {
        const score = course.enrollments?.[0]?.computed_current_score;
        calculatedProgress = score ? Math.round(score) : 0;
      }

      return {
        id: course.id.toString(),
        name: vipInfo ? vipInfo.targetName : (course.name || "Unknown Module"),
        progress: Math.min(calculatedProgress, 100)
      };
    }).filter(Boolean); // Purge any null results

    const quizzes = globalQuizTotal > 0 ? Math.round((globalQuizEarned / globalQuizTotal) * 100) : 0;
    const assignments = globalAssTotal > 0 ? Math.round((globalAssEarned / globalAssTotal) * 100) : 0;

    return NextResponse.json({
      subjects: formattedSubjects,
      metrics: { quizzes, assignments }
    });

  } catch (error) {
    console.error("❌ CANVAS FATAL ERROR:", error);
    return NextResponse.json({ error: 'Server exploded' }, { status: 500 });
  }
}