'use client';

// Browser-side push subscription. Best-effort: if there's no registered service
// worker (dev), the server has no VAPID keys, or the user blocks it, we bail
// quietly — the in-tab native notifications still work on their own.

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function subscribeToPush(opts?: { confirm?: boolean }): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false; // no SW registered (dev / unsupported) → skip

    const res = await fetch('/api/push/public-key');
    const { key, enabled } = (await res.json()) as { key?: string; enabled?: boolean };
    if (!enabled || !key) return false; // server not configured with VAPID keys

    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      }));

    const r = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });
    if (!r.ok) return false;

    // Only on an explicit enable: fire an immediate push so the user sees it land.
    if (opts?.confirm) await fetch('/api/push/test', { method: 'POST' }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}
