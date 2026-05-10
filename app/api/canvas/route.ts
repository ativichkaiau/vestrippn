import { NextResponse } from 'next/server';

export async function GET() {
  const CANVAS_URL = process.env.CANVAS_BASE_URL;
  const TOKEN = process.env.CANVAS_API_TOKEN;

  if (!CANVAS_URL || !TOKEN) {
    console.error("Missing ENV variables for Canvas");
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  // YOUR VIP LIST
  const targetCourses = [
    { id: '26141', targetName: 'HEN-2 (Endocrine)' },
    { id: '26393', targetName: 'HNS-2 (Nervous & Senses)' },
    { id: '26349', targetName: 'Team-Based Learning (TBL)' }
  ];

  try {
    const coursePromises = targetCourses.map(course => 
      fetch(`${CANVAS_URL}/api/v1/courses/${course.id}?include[]=total_scores`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        next: { revalidate: 300 } 
      }).then(res => res.ok ? res.json() : null)
    );

    // Bumping per_page to 100 to make sure we catch every single assignment
    const assignmentPromises = targetCourses.map(course =>
      fetch(`${CANVAS_URL}/api/v1/courses/${course.id}/assignments?include[]=submission&per_page=100`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        next: { revalidate: 300 }
      }).then(res => res.ok ? res.json() : [])
    );

    const [rawCourseData, rawAssignments] = await Promise.all([
      Promise.all(coursePromises),
      Promise.all(assignmentPromises)
    ]);

    let globalQuizTotal = 0, globalQuizEarned = 0;
    let globalAssTotal = 0, globalAssEarned = 0;

    // THE OVERRIDE: Calculate the grades manually
    const formattedSubjects = rawCourseData.map((course: any, index: number) => {
      if (!course) return null;
      
      const vipInfo = targetCourses.find(c => c.id === course.id.toString());
      const courseAssignments = rawAssignments[index] || [];
      
      let coursePointsEarned = 0;
      let coursePointsTotal = 0;

      courseAssignments.forEach((assign: any) => {
        const sub = assign.submission;
        
        // Only count it if you actually submitted it, it was graded, and it's worth points
        if (sub && sub.score !== null && sub.workflow_state === 'graded' && assign.points_possible > 0) {
          
          // 1. Add to the specific Course Grade
          coursePointsEarned += sub.score;
          coursePointsTotal += assign.points_possible;

          // 2. Add to the Global QZZ/ASG Metrics
          const isQuiz = assign.submission_types?.includes('online_quiz') || assign.is_quiz_assignment;
          if (isQuiz) {
            globalQuizEarned += sub.score;
            globalQuizTotal += assign.points_possible;
          } else {
            globalAssEarned += sub.score;
            globalAssTotal += assign.points_possible;
          }
        }
      });

      // THE MATH: Bypass the professor's hidden grade setting
      let calculatedProgress = 0;
      if (coursePointsTotal > 0) {
        calculatedProgress = Math.round((coursePointsEarned / coursePointsTotal) * 100);
      } else {
        // Absolute fallback if the semester just started and nothing is graded yet
        const score = course.enrollments?.[0]?.computed_current_score;
        calculatedProgress = score ? Math.round(score) : 0;
      }

      return {
        id: course.id.toString(),
        name: vipInfo ? vipInfo.targetName : course.name,
        progress: calculatedProgress > 100 ? 100 : calculatedProgress
      };
    }).filter(Boolean); // Clean up any nulls

    const quizzes = globalQuizTotal > 0 ? Math.round((globalQuizEarned / globalQuizTotal) * 100) : 0;
    const assignments = globalAssTotal > 0 ? Math.round((globalAssEarned / globalAssTotal) * 100) : 0;

    return NextResponse.json({
      subjects: formattedSubjects,
      metrics: { quizzes, assignments }
    });

  } catch (error) {
    console.error("Canvas Sniper Fetch Error:", error);
    return NextResponse.json({ error: 'Targeted fetch failed' }, { status: 500 });
  }
}