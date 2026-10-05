'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import CaseStepper from '@/components/w09/CaseStepper';
import BranchingPlayer from './BranchingPlayer';
import { type CaseDetail, type CaseSummary, colorFor, difficultyColor, isRare, nonRareTags, specialtyIcon } from './types';
import { Skel, SkelGroup } from '@/components/system/Skeleton';
import { Page, PageHeader } from '@/components/system/primitives';
import { useReviewQueue } from '@/components/learn/useReviewQueue';

/** Load a case for play; `fresh` restarts the run first (reviews start from the beginning). */
async function fetchCase(id: string, fresh: boolean): Promise<CaseDetail> {
  if (fresh) await fetch(`/api/learn/cases/${id}/reset`, { method: 'POST' }).catch(() => null);
  const res = await fetch(`/api/learn/cases/${id}`);
  if (res.status === 401) throw new Error('Sign in to play cases. Your progress is saved to your account.');
  if (!res.ok) throw new Error(`Failed to open case (${res.status})`);
  return (await res.json()) as CaseDetail;
}

export default function CasesClient() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [current, setCurrent] = useState(0); // linear
  const [opening, setOpening] = useState(false);
  const [specialty, setSpecialty] = useState<string>('all');
  const playerRef = useRef<HTMLElement>(null);
  const review = useReviewQueue();
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/learn/cases');
        if (!res.ok) throw new Error(`Failed to load cases (${res.status})`);
        const list = (await res.json()) as CaseSummary[];
        setCases(list);
        // Deep links: /learn/cases?case=<id> opens it; &review=1 restarts it as a review.
        const params = new URLSearchParams(window.location.search);
        const linked = params.get('case');
        if (linked && list.some((c) => c.id === linked)) {
          const d = await fetchCase(linked, params.get('review') === '1');
          setDetail(d);
          if (d.type === 'linear') setCurrent(Math.min(d.currentStep ?? 0, Math.max(0, d.steps.length - 1)));
        }
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

  const openCase = async (id: string, fresh = false) => {
    setOpening(true);
    setError(null);
    try {
      const d = await fetchCase(id, fresh);
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
    <Page wide>
      <PageHeader
        label="runtime / medicine"
        title="Cases"
        lede="Branching clinical cases. Each choice moves the patient's vitals and outcome in real time."
        meta={loading ? undefined : [{ key: 'cases', value: String(cases.length).padStart(3, '0') }]}
      />
      <div className="sys-section text-[color:var(--w09-text)]">
        {/* ── Selection mode ── */}
        {!detail && (
          <>
            {/* Intro explainer */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5">
                <h3 className="mb-3 text-sm font-bold text-[color:var(--w09-text)] [font-family:var(--w09-font-display)]">💡 How Your Choices Matter</h3>
                <ul className="space-y-2 text-sm text-[color:var(--w09-text)]">
                  <li><span style={{ color: '#10b981' }}>✓</span> <b>Optimal choices</b> <span className="text-[color:var(--w09-text-muted)]">improve vitals and outcomes</span></li>
                  <li><span style={{ color: '#f59e0b' }}>⚠</span> <b>Suboptimal choices</b> <span className="text-[color:var(--w09-text-muted)]">slow recovery and raise risk</span></li>
                  <li><span style={{ color: '#ef4444' }}>✕</span> <b>Harmful choices</b> <span className="text-[color:var(--w09-text-muted)]">trigger complications</span></li>
                </ul>
              </div>
              <div className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5">
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

            {review && (review.due.length > 0 || review.upcoming.length > 0) && (
              <section className="sys-review-strip" aria-labelledby="review-title">
                <div className="sys-review-head">
                  <h2 id="review-title" className="sys-label">
                    due for review · {String(review.due.length).padStart(2, '0')}
                  </h2>
                  <span className="sys-muted">
                    missed cases return after {review.intervals.join(', ')} days · {review.upcoming.length} upcoming · {review.graduated} graduated
                  </span>
                </div>
                {review.due.length === 0 ? (
                  <p className="sys-muted">Nothing due today. Next: {review.upcoming[0]?.title} on {new Date(review.upcoming[0]?.dueAt ?? '').toLocaleDateString()}.</p>
                ) : (
                  <ul className="sys-review-list">
                    {review.due.map((item) => (
                      <li key={item.caseId}>
                        <button type="button" onClick={() => openCase(item.caseId, true)} disabled={opening}>
                          <b>{item.title}</b>
                          <small>
                            {item.specialty} · review {item.step + 1} of {review.intervals.length} · missed {item.misses}×
                          </small>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <h2 className="mt-7 mb-3 text-xs font-black uppercase tracking-widest text-[color:var(--w09-text-muted)]">Select a clinical case</h2>
            {loading ? (
              <SkelGroup label="clinical cases" className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <Skel key={n} className="h-36 rounded-[var(--w09-radius)]" />
                ))}
              </SkelGroup>
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
                      className="group flex flex-col rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5 text-left transition-all duration-[var(--w09-motion-duration)] hover:-translate-y-0.5 hover:bg-[var(--w09-surface-raised)] active:scale-[0.99] disabled:opacity-60"
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
            className="mt-8 overflow-hidden rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)]"
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
    </Page>
  );
}
