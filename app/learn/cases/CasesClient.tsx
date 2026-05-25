'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import CaseStepper from '@/components/w08/CaseStepper';
import BranchingPlayer from './BranchingPlayer';
import { type CaseDetail, type CaseSummary, colorFor, specialtyIcon } from './types';

export default function CasesClient() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [current, setCurrent] = useState(0); // linear
  const [opening, setOpening] = useState(false);
  const [specialty, setSpecialty] = useState<string>('all');
  const playerRef = useRef<HTMLElement>(null);

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

  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--w08-bg)] text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-5xl px-5 py-8">
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
                  const footer = [
                    c.stages ? `${c.stages} stages` : c.type === 'branching' ? 'Interactive' : 'Step-by-step',
                    c.difficulty,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <button
                      key={c.id}
                      onClick={() => openCase(c.id)}
                      disabled={opening}
                      style={{ borderLeftColor: color ?? undefined, borderLeftWidth: color ? '3px' : undefined }}
                      className="group flex flex-col rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 text-left shadow-[var(--w08-shadow)] transition-all duration-[var(--w08-motion-duration)] hover:-translate-y-0.5 hover:bg-[var(--w08-surface-raised)] active:scale-[0.99] disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{c.icon || specialtyIcon(c.specialty)}</span>
                        <span className="text-base font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">{c.title}</span>
                        {c.type === 'branching' && (
                          <span className="ml-auto rounded-md bg-[var(--w08-surface-raised)] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ color: color ?? 'var(--w08-text-muted)' }}>
                            ◆ Interactive
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--w08-text-muted)]">{c.patient ?? c.summary}</p>
                      {footer && <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[color:var(--w08-text-muted)]">{footer}</p>}
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
  );
}
