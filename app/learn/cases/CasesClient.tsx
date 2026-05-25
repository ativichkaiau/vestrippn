'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CaseStepper from '@/components/w08/CaseStepper';
import Clock from '@/components/Clock';
import ThemeToggle from '@/components/ThemeToggle';
import ArcDate from '@/components/ArcDate';
import TopNavProfile from '@/components/TopNavProfile';
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const h = new Date().getHours();
    setCycle(h < 6 || h >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
    setShowIntro(true);
    const t = setTimeout(() => setShowIntro(false), 5400);
    return () => clearTimeout(t);
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

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: true },
    { name: 'Research', icon: '◆', href: '/research', active: false },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: false },
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">

      <AnimatePresence>{showIntro && <CasesIntro cycle={cycle} />}</AnimatePresence>

      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-rose-400/30 via-fuchsia-400/25 to-purple-400/25 dark:from-rose-600/20 dark:via-fuchsia-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-teal-400/25 via-cyan-400/20 to-blue-300/25 dark:from-teal-600/15 dark:via-cyan-600/10 dark:to-blue-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-amber-300/20 to-cyan-300/20 dark:from-amber-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline"><span>VESTRIPPN</span><span className="text-cyan-500 dark:text-cyan-400 transition-colors duration-700">3.0</span></div>
          </Link>
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500 transition-colors duration-700"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block transition-colors duration-700"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* --- RETRACTABLE DESKTOP SIDEBAR --- */}
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'}`}>
          <nav className="space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                <span className={`text-[18px] shrink-0 transition-opacity duration-300 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'}`}>
            {isSidebarExpanded ? <Clock /> : <span className="text-xl group-hover:rotate-12 transition-transform duration-300">⏱️</span>}
          </button>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 relative">
          <div className="mx-auto w-full max-w-5xl text-[color:var(--w08-text)]">
        <h1 className="text-2xl font-black tracking-tight [font-family:var(--w08-font-display)]">Interactive Case Simulator</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">
          Navigate a clinical case and see how your choices affect patient outcomes in real time.
        </p>

        {/* ── Selection mode ── */}
        {!detail && (
          <>
            {/* Intro explainer */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 shadow-[var(--w08-shadow)]">
                <h3 className="mb-3 text-sm font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">💡 How Your Choices Matter</h3>
                <ul className="space-y-2 text-sm text-[color:var(--w08-text)]">
                  <li><span style={{ color: '#10b981' }}>✓</span> <b>Optimal choices</b> <span className="text-[color:var(--w08-text-muted)]">improve vitals and outcomes</span></li>
                  <li><span style={{ color: '#f59e0b' }}>⚠</span> <b>Suboptimal choices</b> <span className="text-[color:var(--w08-text-muted)]">slow recovery and raise risk</span></li>
                  <li><span style={{ color: '#ef4444' }}>✕</span> <b>Harmful choices</b> <span className="text-[color:var(--w08-text-muted)]">trigger complications</span></li>
                </ul>
              </div>
              <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 shadow-[var(--w08-shadow)]">
                <h3 className="mb-2 text-sm font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">❤️‍🩹 Real-Time Vital Signs</h3>
                <p className="text-sm text-[color:var(--w08-text-muted)]">
                  Vitals change dynamically with your decisions — each choice cascades through the patient&apos;s stability.
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--w08-surface-raised)]">
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
                            : 'border-transparent bg-[var(--w08-accent-primary)] text-[color:var(--w08-accent-contrast)]'
                          : 'border-[color:var(--w08-border)] bg-[var(--w08-surface)] text-[color:var(--w08-text-muted)] hover:bg-[var(--w08-surface-raised)]'
                      }`}
                    >
                      {color && !active && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
                      {s === 'all' ? 'All' : s}
                    </button>
                  );
                })}
              </div>
            )}

            {error && <p className="mt-4 text-sm text-[color:var(--w08-danger)]">{error}</p>}

            <h2 className="mt-7 mb-3 text-xs font-black uppercase tracking-widest text-[color:var(--w08-text-muted)]">Select a clinical case</h2>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-36 rounded-[var(--w08-radius)] bg-[var(--w08-surface)] animate-pulse" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-8 text-center text-sm text-[color:var(--w08-text-muted)]">
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
                      className="group flex flex-col rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 text-left shadow-[var(--w08-shadow)] transition-all duration-[var(--w08-motion-duration)] hover:-translate-y-0.5 hover:bg-[var(--w08-surface-raised)] active:scale-[0.99] disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="shrink-0 text-2xl">{c.icon || specialtyIcon(c.specialty)}</span>
                        <span className="min-w-0 flex-1 truncate text-base font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">{c.title}</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {rare && (
                            <span className="rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: 'var(--w08-danger)' }}>
                              ★ Rare
                            </span>
                          )}
                          {c.type === 'branching' && (
                            <span className="rounded-md bg-[var(--w08-surface-raised)] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ color: color ?? 'var(--w08-text-muted)' }}>
                              ◆ Interactive
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--w08-text-muted)]">{c.patient ?? c.summary}</p>
                      {hasMeta && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          {c.difficulty && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: difficultyColor(c.difficulty) }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: difficultyColor(c.difficulty) }} />
                              {c.difficulty}
                            </span>
                          )}
                          {layers && (
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--w08-text-muted)]">{layers}</span>
                          )}
                          {extraTags.map((t) => (
                            <span key={t} className="rounded-full border border-[color:var(--w08-border)] bg-[var(--w08-surface-raised)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--w08-text-muted)]">
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
            style={activeColor ? ({ '--w08-accent-primary': activeColor, '--w08-focus-ring': activeColor, '--w08-accent-contrast': '#ffffff' } as CSSProperties) : undefined}
            className="mt-8 overflow-hidden rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] shadow-[var(--w08-shadow)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--w08-border)] px-6 py-5" style={activeColor ? { backgroundColor: `${activeColor}14` } : undefined}>
              <div>
                <h2 className="text-lg font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">{detail.title}</h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest" style={{ color: activeColor ?? 'var(--w08-text-muted)' }}>
                  Step {current + 1} of {detail.steps.length}
                  {detail.steps[current]?.label ? ` · ${detail.steps[current].label}` : ''}
                </p>
              </div>
              <button onClick={() => setDetail(null)} aria-label="Close case" className="shrink-0 rounded-full px-2.5 py-1 text-sm text-[color:var(--w08-text-muted)] transition-colors hover:bg-[var(--w08-surface-raised)] hover:text-[color:var(--w08-text)]">
                ✕
              </button>
            </div>
            <div className="p-6">
              <CaseStepper steps={detail.steps} current={current} onStep={goToStep} />
              <div className="mt-6 min-h-40 whitespace-pre-line rounded-[var(--w08-radius)] bg-[var(--w08-surface-raised)] p-5 text-sm leading-relaxed text-[color:var(--w08-text)]">
                {opening ? 'Loading…' : detail.steps[current]?.content || 'No content for this step.'}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => goToStep(current - 1)} disabled={current === 0} className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--w08-text)] transition-opacity active:scale-95 disabled:opacity-40">
                  ← Prev
                </button>
                <button onClick={() => goToStep(current + 1)} disabled={current >= detail.steps.length - 1} className="rounded-[var(--w08-radius)] bg-[var(--w08-accent-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--w08-accent-contrast)] transition-opacity active:scale-95 disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          </section>
        )}
          </div>
        </main>
      </div>

      {/* --- MOBILE-ONLY FLOATING NAV HUD --- */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/80 dark:bg-[#111111]/80 backdrop-blur-3xl backdrop-saturate-150 border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
            <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
            {item.active && <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">{item.name}</span>}
          </Link>
        ))}
      </nav>

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
