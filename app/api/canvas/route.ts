import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.CANVAS_API_TOKEN;
  const baseUrl = process.env.CANVAS_BASE_URL;

  if (!token || !baseUrl) {
    console.error("Missing Canvas credentials in .env");
    return NextResponse.json({ error: 'Canvas credentials missing' }, { status: 500 });
  }

  try {
    // Fetch upcoming assignments and events from Canvas
    const response = await fetch(`${baseUrl}/api/v1/users/self/upcoming_events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      // Revalidate every 5 minutes so you don't spam the Canvas servers
      next: { revalidate: 300 } 
    });

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the messy Canvas data into sleek dashboard notifications
    const canvasNotifications = data.slice(0, 5).map((item: any, index: number) => {
      // Format the date to be human-readable
      const dueDate = new Date(item.start_at || item.due_at || Date.now());
      const timeString = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      return {
        id: `canvas-${item.id || index}`,
        type: 'alert', // Alerts get the red LED in your UI
        title: item.context_name || 'Canvas Deadline', // Usually the course name
        message: item.title || 'Action required', // The assignment name
        time: `Due: ${timeString}`,
      };
    });

    return NextResponse.json(canvasNotifications);

  } catch (error) {
    console.error("Canvas Fetch Failed:", error);
    return NextResponse.json({ error: 'Failed to fetch from Canvas' }, { status: 500 });
  }
}