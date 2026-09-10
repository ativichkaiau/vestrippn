'use client';

// localStorage-backed study telemetry. All best-effort (wrapped in try/catch) —
// a private-mode or quota failure just yields empty history rather than throwing.

import { CIRCUIT_META } from './circuits';
import { validateFocusSession, type SyncedSession } from './device-sync';

export type FocusSession = {
  id?: string;
  title?: string;
  agendaItemId?: string;
  ts: number; // completed-at, epoch ms
  circuit: string; // circuit id (aus, mon, …)
  mode: 'open' | 'min' | 'laps';
  target: number; // minutes or laps (0 for open)
  durationSec: number; // actual focused seconds
  laps: number; // laps completed
  bestLap: number | null; // best lap in seconds (null if none set)
};

const FOCUS_LOG = 'vest_focus_log';
const FOCUS_LOG_CAP = 10_000;
let focusOwner: string | null = null;
const focusKey = () => focusOwner ? `${FOCUS_LOG}:${focusOwner}` : FOCUS_LOG;

export function setFocusLogOwner(userId: string | null): void {
  focusOwner = userId;
  if (!userId) return;
  try {
    const claimed = localStorage.getItem('vest_focus_legacy_owner');
    if (!claimed) {
      const legacy = readStoredFocusLog(FOCUS_LOG);
      localStorage.setItem('vest_focus_legacy_owner', userId);
      mergeFocusSessions(legacy);
      localStorage.removeItem(FOCUS_LOG);
    }
  } catch { /* local history stays available when storage is blocked */ }
  window.dispatchEvent(new Event('vest:focus-log-change'));
}

function readStoredFocusLog(key: string): SyncedSession[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(rows)) return [];
    const result: SyncedSession[] = [];
    for (const row of rows) {
      try {
        // Deterministic legacy IDs prevent duplicate imports on multiple devices.
        const item = row as FocusSession;
        const id = item.id || `legacy:${item.ts}:${item.circuit}:${item.durationSec}:${item.laps}`;
        result.push(validateFocusSession({ ...item, id }));
      } catch { /* ignore corrupt legacy rows */ }
    }
    return result;
  } catch { return []; }
}

export function readFocusLog(): FocusSession[] {
  return readStoredFocusLog(focusKey());
}

export function mergeFocusSessions(sessions: FocusSession[]): SyncedSession[] {
  const existing = readStoredFocusLog(focusKey());
  const merged = new Map(existing.map(session => [session.id, session]));
  for (const session of sessions) {
    try {
      const row = validateFocusSession({ ...session, id: session.id || crypto.randomUUID() });
      if (!merged.has(row.id)) merged.set(row.id, row);
    } catch { /* malformed sessions must not poison the offline queue */ }
  }
  const rows = [...merged.values()].sort((a, b) => a.ts - b.ts).slice(-FOCUS_LOG_CAP);
  try { localStorage.setItem(focusKey(), JSON.stringify(rows)); } catch { /* best effort */ }
  return rows;
}

export function appendFocusSession(s: FocusSession): void {
  try {
    mergeFocusSessions([{ ...s, id: s.id || crypto.randomUUID() }]);
    window.dispatchEvent(new Event('vest:focus-log-change'));
  } catch {
    /* ignore */
  }
}

export type CircuitPB = { id: string; best: number };

// Read every Focus Mode personal best that has been set (one key per circuit).
export function readPBs(): CircuitPB[] {
  const best = new Map<string, number>();
  try {
    for (const id of Object.keys(CIRCUIT_META)) {
      const v = localStorage.getItem(`vest_focus_pb_${id}`);
      if (v) {
        const n = parseFloat(v);
        if (Number.isFinite(n)) best.set(id, n);
      }
    }
  } catch {
    /* ignore */
  }
  // Synced session records carry each lap's best time. Folding them into the
  // local PB view makes personal bests follow the account onto a new device
  // even though the original PB keys were browser-local.
  for (const session of readFocusLog()) {
    if (session.bestLap == null || !Number.isFinite(session.bestLap)) continue;
    const previous = best.get(session.circuit);
    if (previous == null || session.bestLap < previous) best.set(session.circuit, session.bestLap);
  }
  return [...best.entries()].map(([id, value]) => ({ id, best: value }));
}

// ── daily snapshots (streak + grades) — one row per local calendar day ──
export type StreakSnap = { date: string; streak: number; reviewed: number; due: number };
export type GradeSnap = { date: string; avg: number | null };

const STREAK_LOG = 'vest_streak_log';
const GRADE_LOG = 'vest_grade_log';
const SNAP_CAP = 120;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readSnaps<T extends { date: string }>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? (a as T[]) : [];
  } catch {
    return [];
  }
}

// Record today's value, replacing any earlier same-day row (latest wins).
function upsertSnap<T extends { date: string }>(key: string, row: T): T[] {
  try {
    const rows = readSnaps<T>(key).filter((r) => r.date !== row.date);
    rows.push(row);
    const trimmed = rows.slice(-SNAP_CAP);
    localStorage.setItem(key, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return readSnaps<T>(key);
  }
}

export function readStreakLog(): StreakSnap[] {
  return readSnaps<StreakSnap>(STREAK_LOG);
}
export function recordStreak(streak: number, reviewed: number, due: number): StreakSnap[] {
  return upsertSnap<StreakSnap>(STREAK_LOG, { date: todayISO(), streak, reviewed, due });
}
export function readGradeLog(): GradeSnap[] {
  return readSnaps<GradeSnap>(GRADE_LOG);
}
export function recordGrade(avg: number | null): GradeSnap[] {
  return upsertSnap<GradeSnap>(GRADE_LOG, { date: todayISO(), avg });
}
