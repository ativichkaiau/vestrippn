'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import CaseStepper from '@/components/w08/CaseStepper';

type CaseSummary = { id: string; title: string; specialty: string | null; summary: string };
type CaseStep = { id: string; label: string; content: string };
type CaseDetail = { id: string; title: string; steps: CaseStep[]; currentStep: number };

// Vivid palette — each specialty gets a stable hue (deterministic by name).
const PALETTE = [
  '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];
function colorFor(specialty: string | null): string | null {
  if (!specialty) return null;
  let h = 0;
  for (let i = 0; i < specialty.length; i++) h = (h * 31 + specialty.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export default function CasesClient() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [current, setCurrent] = useState(0);
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

  const activeColor = detail ? colorFor(cases.find((c) => c.id === detail.id)?.specialty ?? null) : null;

  const openCase = async (id: string) => {
    setOpening(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn/cases/${id}`);
      if (!res.ok) throw new Error(`Failed to open case (${res.status})`);
      const d = (await res.json()) as CaseDetail;
      setDetail(d);
      setCurrent(Math.min(d.currentStep ?? 0, Math.max(0, d.steps.length - 1)));
      requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open case');
    } finally {
      setOpening(false);
    }
  };

  const goToStep = (i: number) => {
    if (!detail || i < 0 || i >= detail.steps.length) return;
    setCurrent(i);
    fetch(`/api/learn/cases/${detail.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex: i }),
    }).catch(() => {});
  };

  const stepCount = detail?.steps.length ?? 0;

  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-[var(--w08-bg)] text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-4xl px-5 py-8">
        <h1 className="text-2xl font-black tracking-tight [font-family:var(--w08-font-display)]">Clinical Cases</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">Pick a case and work through it step by step.</p>

        {/* Specialty filter — colour-coded */}
        {specialties.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {['all', ...specialties].map((s) => {
              const active = specialty === s;
              const color = s === 'all' ? null : colorFor(s);
              return (
                <button
                  key={s}
                  onClick={() => setSpecialty(s)}
                  style={active && color ? { backgroundColor: color, color: '#fff', borderColor: color } : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors duration-[var(--w08-motion-duration)] ${
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

        {/* Browser */}
        {loading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-28 rounded-[var(--w08-radius)] bg-[var(--w08-surface)] animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-8 text-center text-sm text-[color:var(--w08-text-muted)]">
            No cases available.
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => {
              const selected = detail?.id === c.id;
              const color = colorFor(c.specialty);
              return (
                <button
                  key={c.id}
                  onClick={() => openCase(c.id)}
                  style={{
                    borderLeftColor: color ?? undefined,
                    borderLeftWidth: color ? '3px' : undefined,
                    ...(selected && color ? { boxShadow: `0 0 0 1px ${color}` } : {}),
                  }}
                  className={`group flex flex-col rounded-[var(--w08-radius)] border bg-[var(--w08-surface)] p-4 text-left shadow-[var(--w08-shadow)] transition-all duration-[var(--w08-motion-duration)] hover:-translate-y-0.5 hover:bg-[var(--w08-surface-raised)] ${
                    selected ? 'border-[color:var(--w08-accent-primary)]' : 'border-[color:var(--w08-border)]'
                  }`}
                >
                  {c.specialty && (
                    <span
                      className="mb-1.5 inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: color ?? undefined, backgroundColor: color ? `${color}1a` : undefined }}
                    >
                      {c.specialty}
                    </span>
                  )}
                  <div className="text-sm font-semibold text-[color:var(--w08-text)]">{c.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-[color:var(--w08-text-muted)]">{c.summary}</div>
                  <span
                    className="mt-3 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: color ?? 'var(--w08-accent-primary)' }}
                  >
                    Open case →
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Player — wrapper re-points --w08-accent-primary to the case's specialty
            colour, so CaseStepper + the Next button pick it up via the contract. */}
        {detail && (
          <section
            ref={playerRef}
            style={activeColor ? ({ '--w08-accent-primary': activeColor, '--w08-focus-ring': activeColor, '--w08-accent-contrast': '#ffffff' } as CSSProperties) : undefined}
            className="mt-8 scroll-mt-4 overflow-hidden rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] shadow-[var(--w08-shadow)]"
          >
            {/* Coloured header band */}
            <div
              className="flex items-start justify-between gap-4 border-b border-[color:var(--w08-border)] px-6 py-5"
              style={activeColor ? { backgroundColor: `${activeColor}14` } : undefined}
            >
              <div>
                <h2 className="text-lg font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">{detail.title}</h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest" style={{ color: activeColor ?? 'var(--w08-text-muted)' }}>
                  Step {current + 1} of {stepCount}
                  {detail.steps[current]?.label ? ` · ${detail.steps[current].label}` : ''}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                aria-label="Close case"
                className="shrink-0 rounded-full px-2.5 py-1 text-sm text-[color:var(--w08-text-muted)] transition-colors hover:bg-[var(--w08-surface-raised)] hover:text-[color:var(--w08-text)]"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <CaseStepper steps={detail.steps} current={current} onStep={goToStep} />

              <div className="mt-6 min-h-40 whitespace-pre-line rounded-[var(--w08-radius)] bg-[var(--w08-surface-raised)] p-5 text-sm leading-relaxed text-[color:var(--w08-text)]">
                {opening ? 'Loading…' : detail.steps[current]?.content || 'No content for this step.'}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => goToStep(current - 1)}
                  disabled={current === 0}
                  className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--w08-text)] transition-opacity active:scale-95 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => goToStep(current + 1)}
                  disabled={current >= stepCount - 1}
                  className="rounded-[var(--w08-radius)] bg-[var(--w08-accent-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--w08-accent-contrast)] transition-opacity active:scale-95 disabled:opacity-40"
                >
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
