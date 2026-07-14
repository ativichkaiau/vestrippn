'use client';

import { useEffect } from 'react';
import { toast } from '@/lib/toast-bus';

// Registers the PWA service worker (offline caching + push). Production only —
// a dev service worker fights Turbopack HMR and serves stale caches. Also drives
// the "new version available" flow: when an updated worker finishes installing
// behind the active one, we prompt (via toast) rather than swapping silently.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    let reloading = false;
    // When the new worker takes control (after SKIP_WAITING), reload once so the
    // page and its chunks come from the same version.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    const promptUpdate = (worker: ServiceWorker) => {
      toast({
        id: 'sw-update',
        title: 'New version available',
        message: 'Reload to get the latest build.',
        icon: '↻',
        duration: 0,
        action: { label: 'Reload', run: () => worker.postMessage({ type: 'SKIP_WAITING' }) },
      });
    };

    const watch = (reg: ServiceWorkerRegistration) => {
      // A worker already waiting (installed on a previous visit)?
      if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          // "installed" while a controller exists === an update (not first install).
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            promptUpdate(installing);
          }
        });
      });
    };

    const register = () =>
      navigator.serviceWorker
        .register('/sw.js')
        .then(watch)
        .catch(() => {});

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
