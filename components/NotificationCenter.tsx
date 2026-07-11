'use client';

import { useCallback, useState, useEffect } from 'react';
import { UPCOMING_EXAMS, daysUntil, countdownLabel, REMINDER_BUCKETS } from '@/lib/exams';
import { subscribeToPush } from '@/lib/push-client';

interface Notification {
  id: string;
  source: 'CANVAS' | 'GMAIL' | 'EXAM' | string;
  title: string;
  message: string;
  time: string;
}

const fmtExamDate = (d: Date) =>
  `${d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} 08:00`;

// Exam countdowns as feed items (future exams, soonest first).
function buildExamReminders(now = Date.now()): Notification[] {
  return UPCOMING_EXAMS.map((ex) => ({ ex, days: daysUntil(ex.date, now) }))
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
function fireExamMilestones() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  let fired: Record<string, boolean> = {};
  try { fired = JSON.parse(localStorage.getItem('vest_exam_notified') || '{}'); } catch { /* ignore */ }
  const now = Date.now();
  for (const ex of UPCOMING_EXAMS) {
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

interface NotificationCenterProps {
  initialNotifications?: Notification[];
}

export default function NotificationCenter({ initialNotifications = [] }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [examReminders, setExamReminders] = useState<Notification[]>([]);
  const [remindersOn, setRemindersOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Compute exam countdowns + catch up on any native milestones since last open.
  useEffect(() => {
    setExamReminders(buildExamReminders());
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setRemindersOn(true);
      fireExamMilestones();
      void subscribeToPush(); // re-ensure this device's push subscription is on file
    }
  }, []);

  const toggleReminders = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') { setRemindersOn(true); fireExamMilestones(); void subscribeToPush(); return; }
    if (Notification.permission === 'denied') return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') { setRemindersOn(true); fireExamMilestones(); void subscribeToPush({ confirm: true }); }
  }, []);

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
        console.error('[Comms Intel] fetch failed:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  // Exam reminders lead the feed — they're the most time-sensitive alerts.
  const feed = [...examReminders, ...notifications];

  return (
    <div className="flex flex-col h-full w-full relative group">
      
      {/* HEADER: W05 Neo-Glassmorphic Style */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg transition-colors duration-700">
            📡
          </div>
          <h2 className="font-bold text-[20px] tracking-tight text-neutral-900 dark:text-white transition-colors duration-700">
            Comms Intel
          </h2>
        </div>

        {/* Dynamic Status Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleReminders}
            title={remindersOn ? 'Exam reminders on' : 'Enable exam reminders'}
            aria-pressed={remindersOn}
            className="flex items-center px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <span className="text-[12px] leading-none">{remindersOn ? '🔔' : '🔕'}</span>
          </button>
          <div className="w09-state flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 transition-colors duration-700" data-state={isLoading ? 'syncing' : 'online'}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span className="text-[10px] font-bold tracking-wide text-neutral-500 dark:text-neutral-400 uppercase transition-colors duration-700">
              {isLoading ? 'Decrypting' : 'Live Feed'}
            </span>
          </div>
        </div>
      </div>

      {/* FEED CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10 min-h-[250px]">
        {isLoading && feed.length === 0 ? (
          // Glassmorphic Skeleton Loader
          <div className="h-full flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[84px] w-full bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse transition-colors duration-700" />
            ))}
          </div>
        ) : feed.length === 0 ? (
          // Empty State
          <div className="h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-[12px] font-medium italic transition-colors duration-700">
            No active alerts in sector.
          </div>
        ) : (
          // Active Notifications
          feed.map((note) => (
            <div 
              key={note.id} 
              data-motion-card
              className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 flex flex-col gap-2 group/note"
            >
              {/* Note Header: Source Pill & Time */}
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full transition-colors duration-700 ${
                  note.source === 'CANVAS'
                    ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                    : note.source === 'GMAIL'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : note.source === 'EXAM'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  {note.source}
                </span>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium tracking-tight transition-colors duration-700">
                  {note.time}
                </span>
              </div>

              {/* Note Body: Title & Message */}
              <div>
                <div className="text-[14px] font-bold tracking-tight text-neutral-900 dark:text-white truncate transition-colors duration-700">
                  {note.title}
                </div>
                <div className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-snug line-clamp-2 mt-0.5 transition-colors duration-700">
                  {note.message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SUBTLE FOOTER */}
      {!isLoading && (
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-end transition-colors duration-700">
          <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">
            SSL Secure
          </div>
        </div>
      )}
    </div>
  );
}
