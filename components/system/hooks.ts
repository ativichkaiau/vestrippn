'use client';

import { useSyncExternalStore } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { serverThemeSnapshot, subscribeTheme, themeSnapshot } from '@/lib/theme';
import { LIVERY_CATALOG, type Livery, type Mode } from '@/lib/liveries';

/* Small external-store hooks for real runtime state shown in the shell:
   wall clock, network, appearance. Each has a stable server snapshot so the
   first client render matches the server. */

const subscribeNever = () => () => {};
const NOT_FOUND_PATH = '/_not-found';

/** False during the server render and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

/**
 * The current pathname — as the server rendered it, until hydration is done.
 * The root 404 is prerendered once, as /_not-found, and served for every
 * unmatched URL, so there the browser's pathname differs from the server's.
 * On that page this reports /_not-found until hydrated, then the real path;
 * every other route gets its real pathname throughout.
 *
 * Call it from the root layout's tree (the shell): the segment check reads
 * the active segment one level below the nearest layout.
 */
export function useRoutePathname(): string {
  const pathname = usePathname() ?? '/';
  const segment = useSelectedLayoutSegment();
  const hydrated = useHydrated();
  return !hydrated && segment === NOT_FOUND_PATH ? NOT_FOUND_PATH : pathname;
}

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
