'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { serverThemeSnapshot, subscribeTheme, themeSnapshot, type ColorTheme } from '@/lib/theme';
import { LIVERY_CATALOG, type Livery, type Mode } from '@/lib/liveries';
import { readNavLayout, resolveNav, type ResolvedNav } from '@/lib/system/nav-layout';
import { getNavSnapshot, serverNavSnapshot, subscribeNav } from '@/lib/system/nav-store';
import { getWorkbenchSnapshot, parseWorkbench, serverWorkbenchSnapshot, subscribeWorkbench, type Workbench } from '@/lib/system/workbench';
import { getTabsSnapshot, serverTabsSnapshot, subscribeTabs } from '@/lib/system/editor-tabs-store';
import { parseTabs, type EditorTab } from '@/lib/system/editor-tabs';
import { getOutputSnapshot, serverOutputSnapshot, subscribeOutput, type OutputLine } from '@/lib/system/output-log';
import { SYNC_STATUS_EVENT, type SyncStatus } from '@/lib/device-sync';
import { getSyncStatus } from '../DeviceSync';
import { isEmbedded } from '@/lib/system/embed';

/* Small external-store hooks for real runtime state shown in the shell:
   wall clock, network, appearance. Each has a stable server snapshot so the
   first client render matches the server. */

const subscribeNever = () => () => {};
const NOT_FOUND_PATH = '/_not-found';

/** True inside the side editor's frame (after hydration). */
export function useEmbedded(): boolean {
  return useSyncExternalStore(subscribeNever, isEmbedded, () => false);
}

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

/** The VS Code colour theme (or the VESTRIPPN default). */
export function useColorTheme(): ColorTheme {
  return useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot).split('|')[4] as ColorTheme;
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

/** The operator's navigation layout; the default until hydration is done. */
export function useNav(): ResolvedNav {
  const stored = useSyncExternalStore(subscribeNav, getNavSnapshot, serverNavSnapshot);
  return useMemo(() => resolveNav(readNavLayout(stored)), [stored]);
}

/** Workbench layout (side view, side bar, panel) for this device. */
export function useWorkbench(): Workbench {
  const raw = useSyncExternalStore(subscribeWorkbench, getWorkbenchSnapshot, serverWorkbenchSnapshot);
  return useMemo(() => parseWorkbench(raw), [raw]);
}

/** Open editor tabs on this device. */
export function useEditorTabs(): EditorTab[] {
  const raw = useSyncExternalStore(subscribeTabs, getTabsSnapshot, serverTabsSnapshot);
  return useMemo(() => parseTabs(raw), [raw]);
}

/** The Output panel's lines. */
export function useOutput(): OutputLine[] {
  return useSyncExternalStore(subscribeOutput, getOutputSnapshot, serverOutputSnapshot);
}

const SERVER_SYNC: SyncStatus = { state: 'signed-out', message: 'Sign in to sync this device.' };
function subscribeSync(listener: () => void) {
  window.addEventListener(SYNC_STATUS_EVENT, listener);
  return () => window.removeEventListener(SYNC_STATUS_EVENT, listener);
}
/** Device sync state, as DeviceSync last published it. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSync, getSyncStatus, () => SERVER_SYNC);
}
