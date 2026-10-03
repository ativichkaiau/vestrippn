'use client';

import { useCallback, useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { UPCOMING_EXAMS, daysUntil, countdownLabel, REMINDER_BUCKETS } from '@/lib/exams';
import { subscribeToPush } from '@/lib/push-client';
import { toast } from '@/lib/toast-bus';

interface Notification {
  id: string;
  source: 'CANVAS' | 'GMAIL' | 'EXAM' | string;
  title: string;
  message: string;
  time: string;
}

const fmtExamDate = (d: Date) =>
  `${d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', timeZone: 'Asia/Bangkok' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}`;

// Exam countdowns as feed items (future exams, soonest first).
function buildExamReminders(exams: typeof UPCOMING_EXAMS = UPCOMING_EXAMS, now = Date.now()): Notification[] {
  return exams.map((ex) => ({ ex, days: daysUntil(ex.date, now) }))
    .filter(({ days }) => days >= 0)
    .sort((a, b) => a.days - b.days)
    .map(({ ex, days }) => ({
      id: `exam:${ex.name}`,
      source: 'EXAM',
      title: `${ex.name} ${countdownLabel(days)}`,
      message: `${ex.fullName} · ${fmtExamDate(ex.date)}`,
      time: days <= 0 ? 'today' : `T-${days}d`,
    }));
}

// Fire a native notification the first time an exam crosses a T-minus bucket.
// Persists fired buckets so a milestone isn't repeated across sessions.
function fireExamMilestones(exams: typeof UPCOMING_EXAMS = UPCOMING_EXAMS) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  let fired: Record<string, boolean> = {};
  try { fired = JSON.parse(localStorage.getItem('vest_exam_notified') || '{}'); } catch { /* ignore */ }
  const now = Date.now();
  for (const ex of exams) {
    const days = daysUntil(ex.date, now);
    if (days < 0) continue;
    const crossed = REMINDER_BUCKETS.filter((b) => days <= b && !fired[`${ex.name}:${b}`]);
    if (!crossed.length) continue;
    new Notification(`${ex.name} exam ${countdownLabel(days)}`, {
      body: `${ex.fullName} — ${fmtExamDate(ex.date)}`,
      tag: `exam-${ex.name}`,
    });
    crossed.forEach((b) => { fired[`${ex.name}:${b}`] = true; });
  }
  try { localStorage.setItem('vest_exam_notified', JSON.stringify(fired)); } catch { /* ignore */ }
}

interface SessionInboxProps {
  initialNotifications?: Notification[];
}

/* The root session inbox: exam countdowns first, then the live Canvas and
   Gmail feed from /api/notifications. Exam reminders (native notifications
   and push) are switched on from here. */
export default function SessionInbox({ initialNotifications = [] }: SessionInboxProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [examTargets, setExamTargets] = useState(UPCOMING_EXAMS);
  // Permission is browser state; `enabled` covers the grant made from here.
  const permission = useSyncExternalStore(
    () => () => {},
    () => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission),
    () => 'default',
  );
  const [enabled, setEnabled] = useState(false);
  const remindersOn = enabled || permission === 'granted';
  const [isLoading, setIsLoading] = useState(true);
  const examReminders = useMemo(() => buildExamReminders(examTargets), [examTargets]);

  // Pull editable exam targets once. The static schedule remains the fallback
  // when a signed-out browser or a temporarily unavailable database cannot
  // answer the curriculum request.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/curriculum', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        const dynamic = Array.isArray(data.semesters) ? data.semesters
          .filter((semester: { archivedAt?: string | null }) => !semester.archivedAt)
          .flatMap((semester: { courses?: Array<{ code: string; name: string; exams?: Array<{ id: string; title: string; scheduledAt: string }> }> }) => (semester.courses ?? []).flatMap((course) => (course.exams ?? []).map((exam) => ({ name: course.code, fullName: `${course.name} · ${exam.title}`, date: new Date(exam.scheduledAt) }))))
          .filter((exam: { date: Date }) => Number.isFinite(exam.date.getTime())) : [];
        if (!cancelled && dynamic.length) setExamTargets(dynamic);
      })
      .catch(() => { /* keep the static fallback */ });
    return () => { cancelled = true; };
  }, []);

  // Compute exam countdowns + catch up on any native milestones since last open.
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      fireExamMilestones(examTargets);
      void subscribeToPush(); // re-ensure this device's push subscription is on file
    }
  }, [examTargets]);

  const toggleReminders = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') { setEnabled(true); fireExamMilestones(examTargets); void subscribeToPush(); return; }
    if (Notification.permission === 'denied') {
      toast({ title: 'Notifications are blocked', message: 'Allow them in your browser settings to get exam reminders.', variant: 'warn' });
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setEnabled(true);
      fireExamMilestones(examTargets);
      void subscribeToPush({ confirm: true });
      toast({ title: 'exam reminders: on', message: 'Notifications at 14 · 7 · 3 · 1 days out.', variant: 'success' });
    }
  }, [examTargets]);

  // Pull the live Gmail + Canvas feed from /api/notifications. We do NOT also
  // watch `initialNotifications` — its default `= []` creates a fresh array on
  // every render, so a watcher effect would re-fire after each setNotifications
  // and wipe the freshly-fetched data back to []. The fetch below is the single
  // source of truth.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (!cancelled && Array.isArray(data)) setNotifications(data);
      } catch (err) {
        console.error('inbox: fetch failed', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  // Exam reminders lead the feed — they're the most time-sensitive alerts.
  const feed = [...examReminders, ...notifications];

  return (
    <div className="sys-inbox">
      <div className="sys-inbox-head">
        <span className="sys-status" data-state={isLoading ? 'available' : 'active'}>
          {isLoading ? 'syncing…' : `${String(feed.length).padStart(2, '0')} items`}
        </span>
        <button type="button" className="sys-command" onClick={toggleReminders} aria-pressed={remindersOn}>
          reminders: {remindersOn ? 'on' : 'off'}
        </button>
      </div>
      {isLoading && feed.length === 0 ? (
        <div className="sys-skel-group" aria-busy="true" aria-label="Loading inbox">
          {[0, 1, 2].map((i) => (
            <span key={i} className="sys-skel" style={{ height: 52 }} />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <p className="sys-empty">inbox empty</p>
      ) : (
        <ul className="sys-inbox-list">
          {feed.map((note) => (
            <li key={note.id}>
              <span className="sys-inbox-source" data-source={note.source}>
                {note.source.toLowerCase()}
              </span>
              <div>
                <p className="sys-inbox-title">{note.title}</p>
                <p className="sys-inbox-message">{note.message}</p>
              </div>
              <time className="sys-inbox-time">{note.time}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
