import { NextResponse } from "next/server";

/**
 * Comms Intel — unified Gmail + Canvas feed.
 *
 * Each channel is fetched independently and tolerantly: if one source's
 * credentials are missing or its upstream call fails, the OTHER channel still
 * comes through. The route never 500s on a partial outage — it returns an
 * empty array at worst, so the UI shows a clean empty-state.
 *
 * Env (any subset OK):
 *   Gmail:  GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 *   Canvas: CANVAS_TOKEN (preferred) or CANVAS_API_TOKEN, CANVAS_BASE_URL
 */

interface Alert {
  id: string;
  source: "GMAIL" | "CANVAS";
  title: string;
  message: string;
  time: string;
  timestamp: number;
}

async function fetchGmail(): Promise<Alert[]> {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) return [];

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!tokenRes.ok) return [];
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return [];

  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread in:inbox&maxResults=3",
    { headers: { Authorization: `Bearer ${access_token}` }, next: { revalidate: 60 } },
  );
  if (!listRes.ok) return [];
  const listData = (await listRes.json()) as { messages?: { id: string }[] };
  if (!listData.messages) return [];

  const details = await Promise.all(
    listData.messages.map(async (msg) => {
      const r = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      if (!r.ok) return null;
      const d = (await r.json()) as { payload?: { headers?: { name: string; value: string }[] } };
      const headers = d.payload?.headers ?? [];
      const from = headers.find((h) => h.name === "From")?.value.split("<")[0] || "Unknown";
      const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";
      const a: Alert = {
        id: `gmail-${msg.id}`,
        source: "GMAIL",
        title: `Mail: ${from.trim()}`,
        message: subject,
        time: "New",
        timestamp: Date.now(),
      };
      return a;
    }),
  );
  return details.filter((a): a is Alert => a !== null);
}

async function fetchCanvas(): Promise<Alert[]> {
  // Accept either env var name (CANVAS_TOKEN is what the rest of the app uses).
  const token = process.env.CANVAS_TOKEN || process.env.CANVAS_API_TOKEN;
  const baseUrl = process.env.CANVAS_BASE_URL;
  if (!token || !baseUrl) return [];

  const res = await fetch(`${baseUrl}/api/v1/users/self/upcoming_events`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    id: number | string;
    title?: string;
    context_name?: string;
    start_at?: string;
    due_at?: string;
  }>;

  return data.slice(0, 3).map((item) => {
    const dueDate = new Date(item.start_at || item.due_at || Date.now());
    return {
      id: `canvas-${item.id}`,
      source: "CANVAS",
      title: item.context_name || "Academic Alert",
      message: item.title ?? "Upcoming event",
      time: dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestamp: dueDate.getTime(),
    };
  });
}

export async function GET() {
  const [gmailAlerts, canvasAlerts] = await Promise.all([
    fetchGmail().catch((err) => {
      console.error("Gmail feed failed:", err);
      return [] as Alert[];
    }),
    fetchCanvas().catch((err) => {
      console.error("Canvas feed failed:", err);
      return [] as Alert[];
    }),
  ]);

  const unified = [...canvasAlerts, ...gmailAlerts].sort(
    (a, b) => b.timestamp - a.timestamp,
  );
  return NextResponse.json(unified);
}
