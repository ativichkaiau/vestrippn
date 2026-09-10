// Shared wire validation: deliberately excludes authentication and arbitrary storage.
export const LIVERIES = ['normal', 'monza', 'senna', 'verstappen', 'ferrari', 'forceindia', 'mclaren', 'benetton', 'jps', 'alpine'] as const;
export type SyncedPreferences = { livery?: typeof LIVERIES[number]; mode?: 'day' | 'night'; lowPower?: boolean };
export type SyncedSession = { id: string; ts: number; circuit: string; mode: 'open' | 'min' | 'laps'; target: number; durationSec: number; laps: number; bestLap: number | null; title?: string; agendaItemId?: string };
export type SyncSnapshot = { sessions: SyncedSession[]; preferences: { values: SyncedPreferences; revision: number } };
export type SyncStatus = { state: 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error'; message: string; lastSync?: string };
export const SYNC_STATUS_EVENT = 'vest:sync-status';
export const SYNC_REQUEST_EVENT = 'vest:sync-request';

export function validatePreferences(value: unknown): SyncedPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid preferences.');
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !['livery', 'mode', 'lowPower'].includes(key))) throw new Error('Unsupported preference.');
  if (data.livery !== undefined && !LIVERIES.includes(data.livery as typeof LIVERIES[number])) throw new Error('Invalid livery.');
  if (data.mode !== undefined && data.mode !== 'day' && data.mode !== 'night') throw new Error('Invalid display mode.');
  if (data.lowPower !== undefined && typeof data.lowPower !== 'boolean') throw new Error('Invalid low-power setting.');
  return { ...data } as SyncedPreferences;
}

export function validateFocusSession(value: unknown): SyncedSession {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid focus session.');
  const d = value as Record<string, unknown>;
  if (typeof d.id !== 'string' || !/^[a-zA-Z0-9:_-]{1,180}$/.test(d.id)) throw new Error('Invalid focus session ID.');
  if (typeof d.ts !== 'number' || !Number.isFinite(d.ts) || d.ts < 0 || d.ts > 8640000000000000) throw new Error('Invalid focus date.');
  if (typeof d.circuit !== 'string' || !/^[a-zA-Z0-9_-]{1,60}$/.test(d.circuit)) throw new Error('Invalid circuit.');
  if (!['open', 'min', 'laps'].includes(String(d.mode))) throw new Error('Invalid focus mode.');
  for (const key of ['target', 'durationSec', 'laps']) if (typeof d[key] !== 'number' || !Number.isInteger(d[key]) || (d[key] as number) < 0 || (d[key] as number) > 31_536_000) throw new Error(`Invalid focus ${key}.`);
  if (d.bestLap !== null && (typeof d.bestLap !== 'number' || !Number.isFinite(d.bestLap) || d.bestLap < 0 || d.bestLap > 31_536_000)) throw new Error('Invalid best lap.');
  for (const key of ['title', 'agendaItemId']) if (d[key] !== undefined && (typeof d[key] !== 'string' || (d[key] as string).length > 1000)) throw new Error(`Invalid focus ${key}.`);
  return { id: d.id, ts: d.ts, circuit: d.circuit, mode: d.mode as SyncedSession['mode'], target: d.target as number, durationSec: d.durationSec as number, laps: d.laps as number, bestLap: d.bestLap as number | null, ...(d.title ? { title: d.title as string } : {}), ...(d.agendaItemId ? { agendaItemId: d.agendaItemId as string } : {}) };
}

/** Only reapply an offline edit if that setting is unchanged on the server. */
export function reconcilePreferences(base: SyncedPreferences, pending: SyncedPreferences, remote: SyncedPreferences) {
  const retained: SyncedPreferences = {};
  let conflicts = 0;
  for (const key of Object.keys(pending) as (keyof SyncedPreferences)[]) {
    if (remote[key] === base[key] || remote[key] === pending[key]) Object.assign(retained, { [key]: pending[key] });
    else conflicts += 1;
  }
  return { values: { ...remote, ...retained }, pending: retained, conflicts };
}

export function notifyPreferenceEdit(values: SyncedPreferences) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('vest:preference-edit', { detail: values }));
}
