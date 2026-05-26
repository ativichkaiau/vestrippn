import { NextResponse } from 'next/server';

export async function GET() {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'Gmail credentials missing' }, { status: 500 });
  }

  try {
    // 1. Get a fresh Access Token using your permanent Refresh Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        refresh_token: GMAIL_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    
    const { access_token } = await tokenResponse.json();

    // 2. Ask Gmail for your 3 most recent inbox emails (read or unread).
    //    Override via GMAIL_QUERY env var — kept in sync with /api/notifications.
    const gmailQuery = process.env.GMAIL_QUERY || 'in:inbox newer_than:1d';
    const mailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(gmailQuery)}&maxResults=3`,
      { headers: { Authorization: `Bearer ${access_token}` }, next: { revalidate: 60 } }
    );
    
    const mailData = await mailResponse.json();

    if (!mailData.messages) {
      return NextResponse.json([]); // No unread emails!
    }

    // 3. Fetch the actual subject lines for those unread emails
    const emailPromises = mailData.messages.map(async (msg: any) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const msgDetails = await msgRes.json();
      
      const subject = msgDetails.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const from = msgDetails.payload.headers.find((h: any) => h.name === 'From')?.value.split('<')[0] || 'Unknown';

      return {
        id: `gmail-${msg.id}`,
        type: 'info', // Using the blue LED for emails
        title: `Email: ${from.trim()}`,
        message: subject,
        time: 'Just now',
      };
    });

    const formattedEmails = await Promise.all(emailPromises);
    return NextResponse.json(formattedEmails);

  } catch (error) {
    console.error("Gmail Fetch Failed:", error);
    return NextResponse.json({ error: 'Failed to fetch Gmail' }, { status: 500 });
  }
}