'use client';

import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import ArcDate from '@/components/ArcDate';
import TopNavProfile from '@/components/TopNavProfile';
import BrandMark from '@/components/BrandMark';
import { NavRail, MobileHubNav } from '@/components/HubNav';
import { CIRCUIT_META, CIRCUIT_COUNT } from '@/lib/circuits';
import {
  readFocusLog,
  readPBs,
  readStreakLog,
  recordStreak,
  recordGrade,
  type FocusSession,
  type CircuitPB,
  type StreakSnap,
  type GradeSnap,
} from '@/lib/study-log';
import type { CanvasTelemetry } from '@/lib/canvas';

type Props = {
  canvas: CanvasTelemetry;
  anki?: { due: number; new: number; reviewedToday: number; streak: number };
};

// ── formatting ──
const fmtLap = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(3).padStart(6, '0')}`;
};
const fmtDelta = (d: number) => `${d <= 0 ? '−' : '+'}${Math.abs(d).toFixed(3)}`;
const fmtDur = (sec: number) => {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m - h * 60}m`;
};
const relTime = (ts: number) => {
  const d = Date.now() - ts;
  if (d < 3_600_000) return `${Math.max(1, Math.round(d / 60_000))}m ago`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)}h ago`;
  const days = Math.round(d / 86_400_000);
  return days <= 1 ? 'yesterday' : `${days}d ago`;
};
const gradeColor = (p: number) =>
  p >= 80 ? 'bg-emerald-500' : p >= 70 ? 'bg-teal-500' : p >= 60 ? 'bg-amber-500' : 'bg-rose-500';

type StandingRow = { id: string; best: number; name: string; flag: string; pole: number; gap: number; gapPct: number };

function Sparkline({ values, color = '#10b981', height = 40 }: { values: number[]; color?: string; height?: number }) {
  if (values.length < 2) {
    return <div className="flex h-10 items-center text-[11px] italic text-neutral-400 dark:text-neutral-600">Trend builds as you check in daily…</div>;
  }
  const w = 160;
  const h = height;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`);
  const area = `0,${h} ${pts.join(' ')} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Panel({ id, accent, eyebrow, title, note, children }: { id?: string; accent: string; eyebrow: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-700 dark:border-white/5 dark:bg-white/5 lg:rounded-[32px] lg:p-7"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`h-4 w-1.5 rounded-full lg:h-5 ${accent}`} />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{eyebrow}</div>
            <h2 className="text-[18px] font-black tracking-tight text-neutral-900 dark:text-white lg:text-[22px]">{title}</h2>
          </div>
        </div>
        {note && <span className="hidden max-w-[42%] text-right text-[10px] font-semibold leading-tight text-neutral-400 dark:text-neutral-500 sm:block">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</div>
      <div className={`mt-1 text-[26px] font-black tracking-tight ${accent ?? 'text-neutral-900 dark:text-white'}`}>{value}</div>
      {sub && <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{sub}</div>}
    </div>
  );
}

export default function AnalyticsClient({ canvas, anki }: Props) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pbs, setPbs] = useState<CircuitPB[]>([]);
  const [focusLog, setFocusLog] = useState<FocusSession[]>([]);
  const [streakLog, setStreakLog] = useState<StreakSnap[]>([]);
  const [gradeLog, setGradeLog] = useState<GradeSnap[]>([]);

  // Grades are server props; derive the current average once.
  const graded = useMemo(() => canvas.subjects.filter((s) => s.progress != null), [canvas.subjects]);
  const gradeAvg = graded.length
    ? Math.round(graded.reduce((a, s) => a + (s.progress as number), 0) / graded.length)
    : null;

  // localStorage is client-only — read it (and record today's snapshots) on mount.
  useEffect(() => {
    setMounted(true);
    setPbs(readPBs());
    setFocusLog(readFocusLog());
    setGradeLog(recordGrade(gradeAvg));
    setStreakLog(anki ? recordStreak(anki.streak, anki.reviewedToday, anki.due) : readStreakLog());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const standings = useMemo<StandingRow[]>(
    () =>
      pbs
        .flatMap((pb) => {
          const meta = CIRCUIT_META[pb.id];
          if (!meta) return [];
          const gap = pb.best - meta.pole;
          return [{ id: pb.id, best: pb.best, name: meta.name, flag: meta.flag, pole: meta.pole, gap, gapPct: (gap / meta.pole) * 100 }];
        })
        .sort((a, b) => a.gapPct - b.gapPct),
    [pbs],
  );

  const focus = useMemo(() => {
    const total = focusLog.length;
    const totalSec = focusLog.reduce((a, s) => a + s.durationSec, 0);
    const weekAgo = Date.now() - 7 * 86_400_000;
    const last7 = focusLog.filter((s) => s.ts >= weekAgo).length;
    const days: { label: string; count: number; min: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const ds = start.getTime();
      const de = ds + 86_400_000;
      const inDay = focusLog.filter((s) => s.ts >= ds && s.ts < de);
      days.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count: inDay.length, min: Math.round(inDay.reduce((a, s) => a + s.durationSec, 0) / 60) });
    }
    const recent = [...focusLog].sort((a, b) => b.ts - a.ts).slice(0, 6);
    return { total, totalSec, last7, days, recent };
  }, [focusLog]);

  const gradeTrend = gradeLog.map((g) => g.avg).filter((v): v is number => v != null);
  const gradeDelta = gradeTrend.length >= 2 ? gradeTrend[gradeTrend.length - 1] - gradeTrend[0] : null;
  const streakTrend = streakLog.map((s) => s.streak);
  const dayPeak = Math.max(1, ...focus.days.map((d) => d.count));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA] font-sans text-neutral-900 transition-colors duration-700 dark:bg-[#050505] dark:text-neutral-100">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[12%] right-[8%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-400/20 to-cyan-400/20 opacity-80 blur-[120px] mix-blend-multiply transition-all duration-1000 dark:from-emerald-600/15 dark:via-teal-600/10 dark:to-cyan-800/15 dark:opacity-70 dark:mix-blend-screen" />
        <div className="absolute -bottom-[12%] left-[3%] h-[55%] w-[55%] rounded-full bg-gradient-to-tr from-teal-400/20 via-emerald-400/15 to-sky-300/20 opacity-70 blur-[120px] mix-blend-multiply transition-all duration-1000 dark:from-teal-600/12 dark:via-emerald-600/8 dark:to-sky-700/12 dark:opacity-60 dark:mix-blend-screen" />
      </div>

      {/* header */}
      <header className="z-50 flex h-[72px] shrink-0 items-center justify-between border-b border-black/5 bg-white/60 px-4 backdrop-blur-2xl transition-colors duration-700 dark:border-white/5 dark:bg-black/40 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded((v) => !v)} className="hidden items-center justify-center rounded-xl p-2 text-neutral-500 transition-colors hover:bg-black/5 active:scale-95 dark:text-neutral-400 dark:hover:bg-white/10 lg:flex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="18" x2="14" y2="18" /></svg>
          </button>
          <BrandMark />
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden text-[12px] font-medium tracking-tight text-neutral-400 transition-colors duration-700 dark:text-neutral-500 sm:block"><ArcDate /></div>
          <div className="hidden h-5 w-px bg-black/10 transition-colors duration-700 dark:bg-white/10 sm:block" />
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <NavRail active="Analytics" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded((v) => !v)} />

        <main className="custom-scrollbar flex-1 overflow-y-auto p-4 pb-32 transition-all duration-500 sm:p-6 lg:p-10 lg:pb-10">
          <div className="mx-auto max-w-[1400px] space-y-6 lg:space-y-8">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-700 dark:border-white/5 dark:bg-white/5 lg:rounded-[40px] lg:p-9">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="relative z-10">
                <div className="mb-2 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">Study Telemetry</div>
                <h1 className="text-[28px] font-black leading-tight tracking-tight text-neutral-900 dark:text-white lg:text-[40px]">
                  Season <span className="text-emerald-500">standings</span> & study trends
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">
                  Lap PBs, focus history, review streak and grade projection — one telemetry board. Trends build day over day from each visit.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Focus sessions" value={mounted ? String(focus.total) : '—'} sub={mounted ? `${focus.last7} this week` : undefined} accent="text-emerald-500" />
                  <Stat label="Circuits driven" value={mounted ? `${standings.length}/${CIRCUIT_COUNT}` : '—'} sub="qualifying PBs" />
                  <Stat label="Review streak" value={anki ? `${anki.streak}d` : '—'} sub={anki ? `${anki.reviewedToday} today` : 'no Anki sync'} accent="text-orange-500" />
                  <Stat label="Grade average" value={gradeAvg != null ? `${gradeAvg}%` : '—'} sub={`${graded.length} graded`} />
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {/* SEASON STANDINGS */}
              <Panel id="standings" accent="bg-emerald-500" eyebrow="Focus Mode · Qualifying" title="Season standings" note="Ranked by gap to 2017 pole — smallest % gap takes P1.">
                {!mounted ? (
                  <div className="h-40 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
                ) : standings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-[13px] font-medium italic text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                    No qualifying laps yet — set a PB in Focus Mode to take your first grid slot.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {standings.map((row, i) => {
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                      const under = row.gap <= 0;
                      return (
                        <div key={row.id} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/50 px-3 py-2.5 dark:border-white/5 dark:bg-white/5">
                          <span className="w-6 text-center text-[13px] font-black tabular-nums text-neutral-400 dark:text-neutral-500">{medal ?? `P${i + 1}`}</span>
                          <span className="text-lg leading-none">{row.flag}</span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-black tracking-tight text-neutral-900 dark:text-white">{row.name}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Pole {fmtLap(row.pole)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[14px] font-black tabular-nums" style={{ color: under ? '#8b5cf6' : undefined }}>{fmtLap(row.best)}</div>
                            <div className={`text-[10px] font-black tabular-nums ${under ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-500'}`}>{fmtDelta(row.gap)}s</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              {/* GRADE BOARD + PROJECTION */}
              <Panel id="grades" accent="bg-blue-500" eyebrow="Canvas · Live" title="Grade board & projection" note="Projection assumes current pace holds — Canvas has no future-weight data.">
                {graded.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-[13px] font-medium italic text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                    No graded courses reported by Canvas yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {graded.map((s) => {
                      const p = s.progress as number;
                      return (
                        <div key={s.id}>
                          <div className="mb-1 flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13px] font-bold tracking-tight text-neutral-800 dark:text-neutral-200">{s.name}</span>
                            <span className="shrink-0 text-[13px] font-black tabular-nums text-neutral-900 dark:text-white">{p}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                            <div className={`h-full rounded-full ${gradeColor(p)} transition-all duration-700`} style={{ width: `${Math.max(4, Math.min(100, p))}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/5 bg-white/50 px-4 py-3 dark:border-white/5 dark:bg-white/5">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Projected final avg</div>
                        <div className="text-[24px] font-black tracking-tight text-blue-500">{gradeAvg}%</div>
                      </div>
                      <div className="flex-1 px-4">{mounted && <Sparkline values={gradeTrend} color="#3b82f6" />}</div>
                      {gradeDelta != null && (
                        <div className={`text-[12px] font-black tabular-nums ${gradeDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {gradeDelta >= 0 ? '▲' : '▼'} {Math.abs(gradeDelta)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Panel>

              {/* FOCUS HISTORY */}
              <Panel id="focus-history" accent="bg-fuchsia-500" eyebrow="Focus Mode · Sessions" title="Focus history" note="Logged when you finish a qualifying run.">
                {!mounted ? (
                  <div className="h-40 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
                ) : focus.total === 0 ? (
                  <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-[13px] font-medium italic text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                    No sessions logged yet — complete a Focus Mode run and it lands here.
                  </div>
                ) : (
                  <>
                    <div className="mb-4 grid grid-cols-3 gap-3">
                      <Stat label="Sessions" value={String(focus.total)} accent="text-fuchsia-500" />
                      <Stat label="Focus time" value={fmtDur(focus.totalSec)} />
                      <Stat label="This week" value={String(focus.last7)} />
                    </div>
                    <div className="mb-1 flex h-16 items-end gap-1">
                      {focus.days.map((d, i) => (
                        <div key={i} className="group flex flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.count} session${d.count === 1 ? '' : 's'}, ${d.min}m`}>
                          <div className="w-full rounded-t bg-fuchsia-500/70 transition-all group-hover:bg-fuchsia-500" style={{ height: `${(d.count / dayPeak) * 100}%`, minHeight: d.count ? 4 : 0 }} />
                        </div>
                      ))}
                    </div>
                    <div className="mb-4 flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                      <span>14 days ago</span><span>today</span>
                    </div>
                    <div className="space-y-1.5">
                      {focus.recent.map((s, i) => {
                        const meta = CIRCUIT_META[s.circuit];
                        return (
                          <div key={i} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/50 px-3 py-2 dark:border-white/5 dark:bg-white/5">
                            <span className="text-base leading-none">{meta?.flag ?? '🏁'}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12px] font-bold tracking-tight text-neutral-800 dark:text-neutral-200">{meta?.name ?? s.circuit}</div>
                              <div className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{relTime(s.ts)} · {s.laps} lap{s.laps === 1 ? '' : 's'}</div>
                            </div>
                            <div className="text-right text-[11px] font-black tabular-nums text-neutral-600 dark:text-neutral-300">
                              {s.bestLap != null ? fmtLap(s.bestLap) : fmtDur(s.durationSec)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Panel>

              {/* REVIEW STREAK */}
              <Panel id="review-streak" accent="bg-orange-500" eyebrow="Anki · Spaced repetition" title="Review streak" note="Snapshotted each visit — the line grows over time.">
                {!anki ? (
                  <div className="rounded-2xl border border-dashed border-black/10 py-10 text-center text-[13px] font-medium italic text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                    No Anki telemetry — connect the sync add-on to track your streak.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400/20 to-rose-400/20 text-center">
                        <div className="text-[28px] font-black leading-none text-orange-500">{anki.streak}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-orange-500/70">days</div>
                      </div>
                      <div className="grid flex-1 grid-cols-3 gap-2">
                        <Stat label="Today" value={String(anki.reviewedToday)} />
                        <Stat label="Due" value={String(anki.due)} />
                        <Stat label="New" value={String(anki.new)} />
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-black/5 bg-white/50 p-3 dark:border-white/5 dark:bg-white/5">
                      <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Streak · recorded days</div>
                      {mounted && <Sparkline values={streakTrend} color="#f97316" />}
                    </div>
                  </>
                )}
              </Panel>
            </div>

            <p className="px-2 pb-2 text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-600">
              Grades &amp; streak read live from Canvas + Anki. Lap PBs, focus history and day-over-day trends are stored on this device.
            </p>
          </div>
        </main>

        <MobileHubNav active="Analytics" />
      </div>
    </div>
  );
}
