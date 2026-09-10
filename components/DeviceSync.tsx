'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { applyLivery, getLivery, getMode } from '@/lib/theme';
import { mergeFocusSessions, setFocusLogOwner } from '@/lib/study-log';
import { reconcilePreferences, SYNC_REQUEST_EVENT, SYNC_STATUS_EVENT, validatePreferences, type SyncedPreferences, type SyncSnapshot, type SyncStatus } from '@/lib/device-sync';

type Cache = { revision: number; values: SyncedPreferences; pending: SyncedPreferences; base: SyncedPreferences; lastSync?: string };
const emptyCache = (): Cache => ({ revision: 0, values: {}, pending: {}, base: {} });
let latestStatus: SyncStatus = { state: 'signed-out', message: 'Sign in to sync this device.' };
export const getSyncStatus = () => latestStatus;

function publish(status: SyncStatus) {
  latestStatus = status;
  window.dispatchEvent(new CustomEvent(SYNC_STATUS_EVENT, { detail: status }));
}

function storedPreferences(): SyncedPreferences {
  const values: SyncedPreferences = {};
  try {
    const livery = localStorage.getItem('vest_livery');
    const mode = localStorage.getItem('vest_mode');
    const lowPower = localStorage.getItem('vest_lowpower');
    if (livery) Object.assign(values, validatePreferences({ livery }));
    if (mode) Object.assign(values, validatePreferences({ mode }));
    if (lowPower !== null) values.lowPower = lowPower === '1';
  } catch { /* never invent a persisted default */ }
  return values;
}

function applyPreferences(values: SyncedPreferences) {
  try {
    if (values.livery !== undefined) localStorage.setItem('vest_livery', values.livery);
    if (values.mode !== undefined) localStorage.setItem('vest_mode', values.mode);
    if (values.lowPower !== undefined) localStorage.setItem('vest_lowpower', values.lowPower ? '1' : '0');
  } catch { /* DOM remains usable without storage */ }
  applyLivery(values.livery ?? getLivery(), values.mode ?? getMode());
  if (values.lowPower !== undefined) document.documentElement.classList.toggle('low-power', values.lowPower);
  // These are display notifications, never preference-edit events.
  window.dispatchEvent(new Event('vest:theme-change'));
  window.dispatchEvent(new Event('vest-lowpower'));
}

export default function DeviceSync() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  useEffect(() => {
    if (status === 'loading') return;
    if (!userId) {
      setFocusLogOwner(null);
      publish({ state: 'signed-out', message: 'Sign in to sync this device.' });
      return;
    }
    const key = `vest_device_sync:${userId}`;
    let cache = emptyCache();
    let stopped = false;
    let busy = false;
    let again = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    let migratePreferences = false;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved) cache = { revision: Number.isInteger(saved.revision) ? saved.revision : 0, values: validatePreferences(saved.values), pending: validatePreferences(saved.pending), base: validatePreferences(saved.base), lastSync: saved.lastSync };
      const previousOwner = localStorage.getItem('vest_preferences_owner');
      migratePreferences = !previousOwner;
      if (previousOwner && previousOwner !== userId) {
        for (const storageKey of ['vest_livery', 'vest_mode', 'vest_lowpower']) localStorage.removeItem(storageKey);
        applyPreferences({ livery: 'normal', mode: 'day', lowPower: false });
      }
      localStorage.setItem('vest_preferences_owner', userId);
    } catch { /* continue online when browser storage is unavailable */ }
    setFocusLogOwner(userId);
    if (Object.keys(cache.values).length) applyPreferences({ ...cache.values, ...cache.pending });
    const persist = () => { try { localStorage.setItem(key, JSON.stringify(cache)); } catch { /* best effort */ } };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { void sync(); }, 700); };

    async function sync() {
      if (stopped) return;
      if (busy) { again = true; return; }
      if (!navigator.onLine) { publish({ state: 'offline', message: 'Offline. Changes are saved on this device and will retry when connected.', lastSync: cache.lastSync }); return; }
      busy = true;
      publish({ state: 'syncing', message: 'Syncing focus history and preferences…', lastSync: cache.lastSync });
      try {
        const response = await fetch('/api/device-sync', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 ? 'Sign in again to sync.' : 'Sync is unavailable. Your changes remain on this device.');
        let remote: SyncSnapshot = await response.json();
        if (stopped) return;
        if (migratePreferences && Object.keys(remote.preferences.values).length === 0 && Object.keys(cache.pending).length === 0) {
          cache.pending = storedPreferences();
          cache.base = {};
        }
        migratePreferences = false;
        const merged = reconcilePreferences(cache.base, cache.pending, remote.preferences.values);
        let conflicts = merged.conflicts;
        cache = { ...cache, values: remote.preferences.values, revision: remote.preferences.revision, pending: merged.pending, base: remote.preferences.values };
        persist();
        const mergedSessions = mergeFocusSessions(remote.sessions);
        const known = new Set(remote.sessions.map(s => s.id));
        const unsent = mergedSessions.filter(s => !known.has(s.id));
        // A changed preference during an in-flight request remains queued.
        for (let offset = 0; offset < Math.max(1, unsent.length); offset += 1000) {
          const pending = { ...cache.pending };
          const hasPreferences = Object.keys(pending).length > 0;
          if (!hasPreferences && !unsent.length) break;
          const upload = await fetch('/api/device-sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessions: unsent.slice(offset, offset + 1000), ...(hasPreferences ? { preferences: { baseRevision: cache.revision, values: { ...cache.values, ...pending } } } : {}) }), signal: controller.signal });
          if (!upload.ok) throw new Error('Sync could not finish. Your changes remain queued on this device.');
          const result: SyncSnapshot & { conflict: boolean } = await upload.json();
          if (stopped) return;
          remote = result;
          if (result.conflict) {
            const resolved = reconcilePreferences(cache.base, cache.pending, result.preferences.values);
            cache.pending = resolved.pending;
            conflicts += resolved.conflicts;
            again = Object.keys(resolved.pending).length > 0;
          } else {
            for (const field of Object.keys(pending) as (keyof SyncedPreferences)[]) if (cache.pending[field] === pending[field]) delete cache.pending[field];
          }
          cache.values = result.preferences.values;
          cache.revision = result.preferences.revision;
          cache.base = result.preferences.values;
          persist();
        }
        mergeFocusSessions(remote.sessions);
        cache.lastSync = new Date().toISOString();
        persist();
        applyPreferences({ ...cache.values, ...cache.pending });
        window.dispatchEvent(new Event('vest:focus-log-synced'));
        publish({ state: 'synced', message: conflicts ? 'History synced. Newer settings from another device were kept.' : 'Focus history and preferences are up to date.', lastSync: cache.lastSync });
      } catch (error) {
        if (!stopped) publish({ state: navigator.onLine ? 'error' : 'offline', message: error instanceof Error ? error.message : 'Sync will retry when connected.', lastSync: cache.lastSync });
      } finally {
        busy = false;
        if (again && !stopped) { again = false; schedule(); }
      }
    }

    const preferenceEdit = (event: Event) => {
      try {
        const patch = validatePreferences((event as CustomEvent).detail);
        for (const field of Object.keys(patch) as (keyof SyncedPreferences)[]) {
          if (!(field in cache.pending)) Object.assign(cache.base, { [field]: cache.values[field] });
        }
        cache.pending = { ...cache.pending, ...patch };
        persist();
        schedule();
      } catch { /* ignore unrelated events */ }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') schedule(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try { const saved = JSON.parse(event.newValue); cache = { ...saved, values: validatePreferences(saved.values), base: validatePreferences(saved.base), pending: validatePreferences(saved.pending) }; } catch { /* malformed storage */ }
        schedule();
      } else if (event.key === `vest_focus_log:${userId}`) schedule();
    };
    window.addEventListener('vest:preference-edit', preferenceEdit);
    window.addEventListener('vest:focus-log-change', schedule);
    window.addEventListener(SYNC_REQUEST_EVENT, schedule);
    window.addEventListener('online', schedule);
    window.addEventListener('offline', schedule);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(() => { if (document.visibilityState === 'visible') schedule(); }, 60_000);
    schedule();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('vest:preference-edit', preferenceEdit);
      window.removeEventListener('vest:focus-log-change', schedule);
      window.removeEventListener(SYNC_REQUEST_EVENT, schedule);
      window.removeEventListener('online', schedule);
      window.removeEventListener('offline', schedule);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
      setFocusLogOwner(null);
    };
  }, [userId, status]);
  return null;
}
