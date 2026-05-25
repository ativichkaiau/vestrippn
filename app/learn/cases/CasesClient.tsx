'use client';

import { useEffect, useState } from 'react';
import CaseStepper from '@/components/w08/CaseStepper';

type CaseSummary = { id: string; title: string; summary: string };
type CaseStep = { id: string; label: string; content: string };
type CaseDetail = { id: string; title: string; steps: CaseStep[]; currentStep: number };

export default function CasesClient() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [current, setCurrent] = useState(0);
  const [opening, setOpening] = useState(false);

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

  const openCase = async (id: string) => {
    setOpening(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn/cases/${id}`);
      if (!res.ok) throw new Error(`Failed to open case (${res.status})`);
      const d = (await res.json()) as CaseDetail;
      setDetail(d);
      setCurrent(d.currentStep ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open case');
    } finally {
      setOpening(false);
    }
  };

  const goToStep = (i: number) => {
    if (!detail) return;
    setCurrent(i);
    // Persist progress (best-effort).
    fetch(`/api/learn/cases/${detail.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex: i }),
    }).catch(() => {});
  };

  return (
    <main className="min-h-screen bg-[var(--w08-bg)] px-5 py-8 text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">Clinical Cases</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">Work through a case step by step.</p>

        {error && <p className="mt-4 text-sm text-[color:var(--w08-danger)]">{error}</p>}

        {/* Browser */}
        {loading ? (
          <p className="mt-6 text-sm text-[color:var(--w08-text-muted)]">Loading…</p>
        ) : cases.length === 0 ? (
          <p className="mt-6 text-sm text-[color:var(--w08-text-muted)]">No cases available.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => openCase(c.id)}
                className={`rounded-[var(--w08-radius)] border bg-[var(--w08-surface)] p-4 text-left shadow-[var(--w08-shadow)] transition-colors duration-[var(--w08-motion-duration)] hover:bg-[var(--w08-surface-raised)] ${
                  detail?.id === c.id ? 'border-[color:var(--w08-accent-primary)]' : 'border-[color:var(--w08-border)]'
                }`}
              >
                <div className="text-sm font-semibold text-[color:var(--w08-text)]">{c.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-[color:var(--w08-text-muted)]">{c.summary}</div>
              </button>
            ))}
          </div>
        )}

        {/* Player */}
        {detail && (
          <section className="mt-8 rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-6 shadow-[var(--w08-shadow)]">
            <h2 className="mb-4 text-base font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">{detail.title}</h2>
            <CaseStepper steps={detail.steps} current={current} onStep={goToStep} />
            <div className="mt-6 rounded-[var(--w08-radius)] bg-[var(--w08-surface-raised)] p-5 text-sm leading-relaxed text-[color:var(--w08-text)]">
              {opening ? 'Loading…' : detail.steps[current]?.content ?? 'No content for this step.'}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
