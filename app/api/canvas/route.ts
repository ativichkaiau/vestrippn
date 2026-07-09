import { NextResponse } from 'next/server';
import { fetchCanvasTelemetry } from '@/lib/canvas';

// Always fresh (the client also cache-busts).
export const dynamic = 'force-dynamic';

// Single source of truth: delegates to lib/canvas so the dashboard card, the
// Academics hub, and the Cockpit assistant all report identical grades — no
// more divergence between surfaces. Tracked courses + friendly names live in
// lib/canvas.ts (edit TARGET_COURSES / COURSE_NAMES there). Unconfigured returns
// an empty payload (subjects: []) instead of an error, so the UI shows "no
// data" rather than SERVER_OFFLINE.
export async function GET() {
  return NextResponse.json(await fetchCanvasTelemetry());
}
