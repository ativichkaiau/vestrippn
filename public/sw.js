/* VEStriPPN service worker — offline caching + web push.
   Bump CACHE to invalidate old caches on deploy. */
const CACHE = 'vestrippn-v2';
const OFFLINE_URL = '/';

// Do NOT skipWaiting automatically — a silent swap can break a live session
// (stale chunks against a new HTML shell). The page detects the waiting worker,
// shows a "new version available" toast, and posts SKIP_WAITING when the user
// opts in (see components/ServiceWorkerRegister).
self.addEventListener('install', () => {
  // stay parked in "waiting" until the page asks us to take over
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never cache API / auth / server-data routes — always live.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first (fresh pages), fall back to cache, then offline shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(req)) || (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (url.pathname.startsWith('/_next/static') || /\.(?:svg|png|jpg|jpeg|ico|webp|woff2?|css|js)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});

// ── Web push (subscriptions + cron sender added in the push feature) ──
self.addEventListener('push', (event) => {
  let data = { title: 'VEStriPPN', body: '', url: '/academics#milestones' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/manifest-icon.svg',
      badge: '/manifest-icon.svg',
      tag: data.tag || 'vestrippn',
      data: { url: data.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = all.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })(),
  );
});
