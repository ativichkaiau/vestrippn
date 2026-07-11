import { NextResponse } from 'next/server';
import { vapidPublicKey } from '@/lib/push';

export const dynamic = 'force-dynamic';

// The browser needs the VAPID public key to create a push subscription.
// Served from an endpoint (not NEXT_PUBLIC_*) so rotating keys needs no rebuild.
export async function GET() {
  const key = vapidPublicKey();
  return NextResponse.json({ key, enabled: Boolean(key) });
}
