'use client';

import { useSyncExternalStore } from 'react';
import { serverThemeSnapshot, subscribeTheme, themeSnapshot } from '@/lib/theme';
import { LIVERY_CATALOG, type Livery, type Mode } from '@/lib/liveries';

/* Small external-store hooks for real runtime state shown in the shell:
   wall clock, network, appearance. Each has a stable server snapshot so the
   first client render matches the server. */

function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}
const clockSnapshot = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};
/** `21:04`, local time; empty during server render. */
export function useClock(): string {
  return useSyncExternalStore(subscribeMinute, clockSnapshot, () => '');
}

function subscribeNetwork(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}
export function useOnline(): boolean {
  return useSyncExternalStore(subscribeNetwork, () => navigator.onLine, () => true);
}

/** The stored appearance mode (dark / light / auto). */
export function useMode(): Mode {
  // The snapshot is `livery|mode|phase|lowPower`; hydration uses the server one.
  return useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot).split('|')[1] as Mode;
}

/** The selected livery and its catalogue entry. */
export function useLivery() {
  const id = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot).split('|')[0] as Livery;
  return { id, definition: LIVERY_CATALOG[id] ?? LIVERY_CATALOG.system };
}

/** Platform modifier label for shortcuts. */
export function useModifierLabel(): string {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'),
    () => '⌘',
  );
}
