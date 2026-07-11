'use client';

// localStorage-backed study telemetry. All best-effort (wrapped in try/catch) —
// a private-mode or quota failure just yields empty history rather than throwing.

import { CIRCUIT_META } from './circuits';

export type FocusSession = {
  ts: number; // completed-at, epoch ms
  circuit: string; // circuit id (aus, mon, …)
  mode: 'open' | 'min' | 'laps';
  target: number; // minutes or laps (0 for open)
  durationSec: number; // actual focused seconds
  laps: number; // laps completed
  bestLap: number | null; // best lap in seconds (null if none set)
};

const FOCUS_LOG = 'vest_focus_log';
const FOCUS_LOG_CAP = 200; // keep the most recent N sessions

export function readFocusLog(): FocusSession[] {
  try {
    const raw = localStorage.getItem(FOCUS_LOG);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as FocusSession[]) : [];
  } catch {
    return [];
  }
}

export function appendFocusSession(s: FocusSession): void {
  try {
    const log = readFocusLog();
    log.push(s);
    localStorage.setItem(FOCUS_LOG, JSON.stringify(log.slice(-FOCUS_LOG_CAP)));
  } catch {
    /* ignore */
  }
}

export type CircuitPB = { id: string; best: number };

// Read every Focus Mode personal best that has been set (one key per circuit).
export function readPBs(): CircuitPB[] {
  const out: CircuitPB[] = [];
  try {
    for (const id of Object.keys(CIRCUIT_META)) {
      const v = localStorage.getItem(`vest_focus_pb_${id}`);
      if (v) {
        const n = parseFloat(v);
        if (Number.isFinite(n)) out.push({ id, best: n });
      }
    }
  } catch {
    /* ignore */
  }
  return out;
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
