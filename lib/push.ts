import webpush from 'web-push';
import { env, flags } from '@/lib/env';

// Web push sender. Configures VAPID lazily from env; no-ops gracefully when the
// keys aren't set (flags.push === false) so nothing throws in a partial deploy.

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  if (!flags.push) return false;
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublic!, env.vapidPrivate!);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };
export type StoredSub = { endpoint: string; p256dh: string; auth: string };

// 'gone' = subscription expired (404/410) → caller should delete it.
export async function sendPush(sub: StoredSub, payload: PushPayload): Promise<'ok' | 'gone' | 'error'> {
  if (!ensureConfigured()) return 'error';
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return 'ok';
  } catch (err: unknown) {
    const code = (err as { statusCode?: number })?.statusCode;
    if (code === 404 || code === 410) return 'gone';
    console.error('[push] send failed:', code, (err as { body?: string })?.body);
    return 'error';
  }
}

export function vapidPublicKey(): string | null {
  return env.vapidPublic ?? null;
}
