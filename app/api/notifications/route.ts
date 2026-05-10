import { NextResponse } from 'next/server';

export async function GET() {
  const { 
    GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN,
    CANVAS_API_TOKEN, CANVAS_BASE_URL 
  } = process.env;

  // 1. SECURITY CHECK
  if (!GMAIL_REFRESH_TOKEN || !CANVAS_API_TOKEN) {
    return NextResponse.json({ error: 'Comms Credentials Missing' }, { status: 500 });
  }

  try {
    // --- GMAIL AUTH LOGIC ---
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GMAIL_CLIENT_ID!,
        client_secret: GMAIL_CLIENT_SECRET!,
        refresh_token: GMAIL_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
    });
    const { access_token } = await tokenResponse.json();

    // --- DUAL CHANNEL FETCH (Parallel for speed) ---
    const [canvasRes, mailRes] = await Promise.all([
      fetch(`${CANVAS_BASE_URL}/api/v1/users/self/upcoming_events`, {
        headers: { 'Authorization': `Bearer ${CANVAS_API_TOKEN}` },
        next: { revalidate: 60 }
      }),
      fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread in:inbox&maxResults=3', {
        headers: { Authorization: `Bearer ${access_token}` },
        next: { revalidate: 60 }
      })
    ]);

    // 2. PROCESS CANVAS DATA
    const canvasData = canvasRes.ok ? await canvasRes.json() : [];
    const canvasAlerts = canvasData.slice(0, 3).map((item: any) => {
      const dueDate = new Date(item.start_at || item.due_at || Date.now());
      return {
        id: `canvas-${item.id}`,
        source: 'CANVAS',
        title: item.context_name || 'Academic Alert',
        message: item.title,
        time: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: dueDate.getTime()
      };
    });

    // 3. PROCESS GMAIL DATA
    const mailData = await mailRes.json();
    let gmailAlerts = [];
    if (mailData.messages) {
      const emailPromises = mailData.messages.map(async (msg: any) => {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        const details = await msgRes.json();
        const from = details.payload.headers.find((h: any) => h.name === 'From')?.value.split('<')[0] || 'Unknown';
        const subject = details.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        return {
          id: `gmail-${msg.id}`,
          source: 'GMAIL',
          title: `Mail: ${from.trim()}`,
          message: subject,
          time: 'New',
          timestamp: Date.now() // Gmail API order is usually chronological
        };
      });
      gmailAlerts = await Promise.all(emailPromises);
    }

    // 4. UNIFY AND SORT
    const unifiedFeed = [...canvasAlerts, ...gmailAlerts].sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json(unifiedFeed);

  } catch (error) {
    console.error("Unified Hub Failed:", error);
    return NextResponse.json({ error: 'Hub Synchronization Error' }, { status: 500 });
  }
}