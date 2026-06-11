'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CaseStepper from '@/components/w09/CaseStepper';
import BranchingPlayer from './BranchingPlayer';
import { type CaseDetail, type CaseSummary, colorFor, difficultyColor, isRare, nonRareTags, specialtyIcon } from './types';

export default function CasesClient() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [current, setCurrent] = useState(0); // linear
  const [opening, setOpening] = useState(false);
  const [specialty, setSpecialty] = useState<string>('all');
  const playerRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cycle, setCycle] = useState('DAY_CYCLE');
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let introTimer: number | null = null;
    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true);
      const h = new Date().getHours();
      setCycle(h < 6 || h >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
      setShowIntro(true);
      introTimer = window.setTimeout(() => setShowIntro(false), 5400);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (introTimer !== null) window.clearTimeout(introTimer);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/learn/cases');
        if (!res.ok) throw new Error(`Failed to load cases (${res.status})`);
        setCases((await res.json()) as CaseSummary[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load cases');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const specialties = useMemo(
    () => Array.from(new Set(cases.map((c) => c.specialty).filter((s): s is string => !!s))).sort(),
    [cases],
  );
  const visible = useMemo(
    () => (specialty === 'all' ? cases : cases.filter((c) => c.specialty === specialty)),
    [cases, specialty],
  );
  const activeSummary = detail ? cases.find((c) => c.id === detail.id) : undefined;
  const activeColor = colorFor(activeSummary?.specialty ?? null);

  const openCase = async (id: string) => {
    setOpening(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn/cases/${id}`);
      if (!res.ok) throw new Error(`Failed to open case (${res.status})`);
      const d = (await res.json()) as CaseDetail;
      setDetail(d);
      if (d.type === 'linear') setCurrent(Math.min(d.currentStep ?? 0, Math.max(0, d.steps.length - 1)));
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open case');
    } finally {
      setOpening(false);
    }
  };

  const goToStep = (i: number) => {
    if (!detail || detail.type !== 'linear' || i < 0 || i >= detail.steps.length) return;
    setCurrent(i);
    fetch(`/api/learn/cases/${detail.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex: i }),
    }).catch(() => {});
  };

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">

      <AnimatePresence>{showIntro && <CasesIntro cycle={cycle} />}</AnimatePresence>

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-rose-400/30 via-fuchsia-400/25 to-purple-400/25 dark:from-rose-600/20 dark:via-fuchsia-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-teal-400/25 via-cyan-400/20 to-blue-300/25 dark:from-teal-600/15 dark:via-cyan-600/10 dark:to-blue-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-amber-300/20 to-cyan-300/20 dark:from-amber-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-10 relative z-10">
        <div className="mx-auto w-full max-w-5xl text-[color:var(--w09-text)]">
          {/* Back to Dashboard */}
          <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl px-4 py-2 text-[13px] font-bold text-neutral-600 dark:text-neutral-300 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/90 dark:hover:bg-white/10 active:scale-95">
            <span className="text-base leading-none">←</span> Dashboard
          </Link>
        <h1 className="text-2xl font-black tracking-tight [font-family:var(--w09-font-display)]">Interactive Case Simulator</h1>
        <p className="mt-1 text-sm text-[color:var(--w09-text-muted)]">
          Navigate a clinical case and see how your choices affect patient outcomes in real time.
        </p>

        {/* ── Selection mode ── */}
        {!detail && (
          <>
            {/* Intro explainer */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5 shadow-[var(--w09-shadow)]">
                <h3 className="mb-3 text-sm font-bold text-[color:var(--w09-text)] [font-family:var(--w09-font-display)]">💡 How Your Choices Matter</h3>
                <ul className="space-y-2 text-sm text-[color:var(--w09-text)]">
                  <li><span style={{ color: '#10b981' }}>✓</span> <b>Optimal choices</b> <span className="text-[color:var(--w09-text-muted)]">improve vitals and outcomes</span></li>
                  <li><span style={{ color: '#f59e0b' }}>⚠</span> <b>Suboptimal choices</b> <span className="text-[color:var(--w09-text-muted)]">slow recovery and raise risk</span></li>
                  <li><span style={{ color: '#ef4444' }}>✕</span> <b>Harmful choices</b> <span className="text-[color:var(--w09-text-muted)]">trigger complications</span></li>
                </ul>
              </div>
              <div className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5 shadow-[var(--w09-shadow)]">
                <h3 className="mb-2 text-sm font-bold text-[color:var(--w09-text)] [font-family:var(--w09-font-display)]">❤️‍🩹 Real-Time Vital Signs</h3>
                <p className="text-sm text-[color:var(--w09-text-muted)]">
                  Vitals change dynamically with your decisions — each choice cascades through the patient&apos;s stability.
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--w09-surface-raised)]">
                  <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(90deg,#10b981,#f59e0b,#ef4444)' }} />
                </div>
              </div>
            </div>

            {/* Specialty filter */}
            {specialties.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {['all', ...specialties].map((s) => {
                  const active = specialty === s;
                  const color = s === 'all' ? null : colorFor(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setSpecialty(s)}
                      style={active && color ? { backgroundColor: color, color: '#fff', borderColor: color } : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        active
                          ? color
                            ? ''
                            : 'border-transparent bg-[var(--w09-accent-primary)] text-[color:var(--w09-accent-contrast)]'
                          : 'border-[color:var(--w09-border)] bg-[var(--w09-surface)] text-[color:var(--w09-text-muted)] hover:bg-[var(--w09-surface-raised)]'
                      }`}
                    >
                      {color && !active && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
                      {s === 'all' ? 'All' : s}
                    </button>
                  );
                })}
              </div>
            )}

            {error && <p className="mt-4 text-sm text-[color:var(--w09-danger)]">{error}</p>}

            <h2 className="mt-7 mb-3 text-xs font-black uppercase tracking-widest text-[color:var(--w09-text-muted)]">Select a clinical case</h2>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-36 rounded-[var(--w09-radius)] bg-[var(--w09-surface)] animate-pulse" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-8 text-center text-sm text-[color:var(--w09-text-muted)]">
                No cases available.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {visible.map((c) => {
                  const color = colorFor(c.specialty);
                  const rare = isRare(c.tags);
                  const extraTags = nonRareTags(c.tags);
                  const layers = c.stages ? `${c.stages} layer${c.stages === 1 ? '' : 's'}` : null;
                  const hasMeta = !!c.difficulty || !!layers || extraTags.length > 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => openCase(c.id)}
                      disabled={opening}
                      style={{ borderLeftColor: color ?? undefined, borderLeftWidth: color ? '3px' : undefined }}
                      className="group flex flex-col rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5 text-left shadow-[var(--w09-shadow)] transition-all duration-[var(--w09-motion-duration)] hover:-translate-y-0.5 hover:bg-[var(--w09-surface-raised)] active:scale-[0.99] disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="shrink-0 text-2xl">{c.icon || specialtyIcon(c.specialty)}</span>
                        <span className="min-w-0 flex-1 truncate text-base font-bold text-[color:var(--w09-text)] [font-family:var(--w09-font-display)]">{c.title}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {rare && (
                            <span className="rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: 'var(--w09-danger)' }}>
                              ★ Rare
                            </span>
                          )}
                          {c.type === 'branching' && (
                            <span className="rounded-md bg-[var(--w09-surface-raised)] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ color: color ?? 'var(--w09-text-muted)' }}>
                              ◆ Interactive
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--w09-text-muted)]">{c.patient ?? c.summary}</p>
                      {hasMeta && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          {c.difficulty && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: difficultyColor(c.difficulty) }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: difficultyColor(c.difficulty) }} />
                              {c.difficulty}
                            </span>
                          )}
                          {layers && (
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">{layers}</span>
                          )}
                          {extraTags.map((t) => (
                            <span key={t} className="rounded-full border border-[color:var(--w09-border)] bg-[var(--w09-surface-raised)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--w09-text-muted)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Branching player ── */}
        {detail?.type === 'branching' && (
          <BranchingPlayer initial={detail} specialtyColor={activeColor} summary={activeSummary?.summary} onClose={() => setDetail(null)} />
        )}

        {/* ── Linear player ── */}
        {detail?.type === 'linear' && (
          <section
            ref={playerRef}
            style={activeColor ? ({ '--w09-accent-primary': activeColor, '--w09-focus-ring': activeColor, '--w09-accent-contrast': '#ffffff' } as CSSProperties) : undefined}
            className="mt-8 overflow-hidden rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] shadow-[var(--w09-shadow)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--w09-border)] px-6 py-5" style={activeColor ? { backgroundColor: `${activeColor}14` } : undefined}>
              <div>
                <h2 className="text-lg font-bold text-[color:var(--w09-text)] [font-family:var(--w09-font-display)]">{detail.title}</h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest" style={{ color: activeColor ?? 'var(--w09-text-muted)' }}>
                  Step {current + 1} of {detail.steps.length}
                  {detail.steps[current]?.label ? ` · ${detail.steps[current].label}` : ''}
                </p>
              </div>
              <button onClick={() => setDetail(null)} aria-label="Close case" className="shrink-0 rounded-full px-2.5 py-1 text-sm text-[color:var(--w09-text-muted)] transition-colors hover:bg-[var(--w09-surface-raised)] hover:text-[color:var(--w09-text)]">
                ✕
              </button>
            </div>
            <div className="p-6">
              <CaseStepper steps={detail.steps} current={current} onStep={goToStep} />
              <div className="mt-6 min-h-40 whitespace-pre-line rounded-[var(--w09-radius)] bg-[var(--w09-surface-raised)] p-5 text-sm leading-relaxed text-[color:var(--w09-text)]">
                {opening ? 'Loading…' : detail.steps[current]?.content || 'No content for this step.'}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => goToStep(current - 1)} disabled={current === 0} className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--w09-text)] transition-opacity active:scale-95 disabled:opacity-40">
                  ← Prev
                </button>
                <button onClick={() => goToStep(current + 1)} disabled={current >= detail.steps.length - 1} className="rounded-[var(--w09-radius)] bg-[var(--w09-accent-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--w09-accent-contrast)] transition-opacity active:scale-95 disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          </section>
        )}
        </div>
      </main>

    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CASES INTRO — clinical boot sequence (replays on every load)
   ════════════════════════════════════════════════════════════ */
function CasesIntro({ cycle }: { cycle: string }) {
  const status = [
    { t: 'LOADING CASE BANK', at: 1.2 },
    { t: 'CALIBRATING VITALS ENGINE', at: 2.3 },
    { t: 'MAPPING DECISION TREES', at: 3.4 },
    { t: `${cycle} // SIMULATOR ONLINE`, at: 4.3 },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Aurora */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full blur-[140px] bg-gradient-to-br from-rose-400/40 to-fuchsia-500/30"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.9, 0.6, 0.9], scale: [0.6, 1.1, 1], x: [0, 40, 0] }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[8%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[150px] bg-gradient-to-br from-teal-500/35 to-cyan-500/30"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.8, 0.55, 0.8], scale: [0.6, 1, 1.1], x: [0, -30, 0] }}
        transition={{ duration: 6, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.div
        className="absolute -bottom-[20%] left-[18%] w-[55%] h-[55%] rounded-full blur-[150px] bg-gradient-to-tr from-amber-400/25 to-rose-500/25"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.7, 0.5, 0.7], scale: [0.6, 1.1, 1], y: [0, -30, 0] }}
        transition={{ duration: 6, ease: 'easeInOut', delay: 0.6 }}
      />

      {/* Telemetry grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Icon */}
        <motion.div
          className="relative mb-7 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white flex items-center justify-center text-[32px] lg:text-[38px] shadow-[0_0_60px_rgba(244,63,94,0.45)]"
          initial={{ scale: 0, rotate: -120, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 17, delay: 0.3 }}
        >
          <motion.span
            className="absolute -inset-[3px] rounded-[18px] -z-10"
            style={{ background: 'linear-gradient(120deg,#2dd4bf,#0ea5e9,#f43f5e,#f59e0b)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          🩺
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          className="bg-clip-text text-transparent font-black tracking-tighter leading-none text-[40px] sm:text-[58px] lg:text-[70px]"
          style={{ backgroundImage: 'linear-gradient(120deg,#2dd4bf,#0ea5e9,#6366f1,#f43f5e)' }}
          initial={{ y: 44, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.55 }}
        >
          SIMULATOR
        </motion.h1>

        <motion.div
          className="mt-3 text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.45em] text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          Interactive Clinical Cases
        </motion.div>

        {/* ECG trace */}
        <svg viewBox="0 0 240 40" className="mt-7 w-60 sm:w-72 h-9 overflow-visible">
          <defs>
            <linearGradient id="casesEcg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2dd4bf" />
              <stop offset="0.5" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0 20 H58 L66 20 L74 6 L84 34 L92 20 L104 20 L110 11 L118 29 L126 20 H240"
            fill="none"
            stroke="url(#casesEcg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.5))' }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.1, duration: 2.4, ease: 'easeInOut' }}
          />
        </svg>

        {/* Boot status */}
        <div className="mt-6 h-4 relative w-full text-center">
          {status.map((s, i) => {
            const isLast = i === status.length - 1;
            return (
              <motion.span
                key={i}
                className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLast ? [0, 1, 1] : [0, 1, 1, 0] }}
                transition={{ delay: s.at, duration: isLast ? 1.0 : 1.1, times: isLast ? [0, 0.4, 1] : [0, 0.2, 0.75, 1] }}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLast ? 'bg-teal-400' : 'bg-rose-400'}`} />
                {s.t}
              </motion.span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
