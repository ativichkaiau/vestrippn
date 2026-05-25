'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  type BranchingDetail,
  type ChoiceResult,
  type Feedback,
  CHOICE_KEYS,
  OUTCOME_COLOR,
  OUTCOME_LABEL,
  patientStatusView,
  signed,
  trendArrow,
  vitalColor,
} from './types';

export default function BranchingPlayer({
  initial,
  specialtyColor,
  summary,
  onClose,
}: {
  initial: BranchingDetail;
  specialtyColor: string | null;
  summary?: string;
  onClose: () => void;
}) {
  const [d, setD] = useState<BranchingDetail>(initial);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxScore, setMaxScore] = useState(Math.max(100, initial.score));

  const ended = d.status !== 'active' || d.node.choices.length === 0;
  const sv = patientStatusView(d.patientStatus, d.score, maxScore, d.status);
  const ratio = maxScore > 0 ? Math.max(0, Math.min(1, d.score / maxScore)) : 0;

  const stageIndex = useMemo(
    () => (d.stages && d.node.stageId ? d.stages.findIndex((s) => s.id === d.node.stageId) : -1),
    [d.stages, d.node.stageId],
  );

  const submit = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn/cases/${d.id}/choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: d.node.id, choiceId: selected }),
      });
      const data = (await res.json().catch(() => null)) as ChoiceResult | null;
      if (!res.ok || !data) throw new Error(data?.error || `Choice failed (${res.status})`);
      setFeedback({ outcome: data.outcome, text: data.feedback, scoreDelta: data.scoreDelta });
      setMaxScore((m) => Math.max(m, data.score));
      setSelected(null);
      setD((prev) => ({
        ...prev,
        node: data.node,
        score: data.score,
        status: data.status,
        vitals: data.vitals ?? prev.vitals,
        patientStatus: data.patientStatus ?? prev.patientStatus,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Choice failed');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setFeedback(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/learn/cases/${d.id}/reset`, { method: 'POST' });
      const data = (await res.json().catch(() => null)) as Partial<ChoiceResult> | null;
      if (!res.ok || !data?.node) throw new Error(data?.error || `Reset failed (${res.status})`);
      setMaxScore((m) => Math.max(m, data.score ?? 0));
      setD((prev) => ({
        ...prev,
        node: data.node!,
        score: data.score ?? prev.score,
        status: data.status ?? 'active',
        vitals: data.vitals ?? prev.vitals,
        patientStatus: data.patientStatus ?? prev.patientStatus,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  const patientName = d.patient?.name ?? d.title;
  const patientMeta = [d.patient?.presentation, ...(d.patient?.tags ?? [])].filter(Boolean).join(' · ') || summary || '';

  return (
    <section
      style={specialtyColor ? ({ '--w08-accent-primary': specialtyColor, '--w08-focus-ring': specialtyColor, '--w08-accent-contrast': '#ffffff' } as CSSProperties) : undefined}
      className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]"
    >
      {/* ───────── Sidebar ───────── */}
      <aside className="space-y-4">
        {/* Status */}
        <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-4 text-center shadow-[var(--w08-shadow)]">
          <div className="text-4xl leading-none">{sv.emoji}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: sv.color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sv.color }} />
            {sv.label}
          </div>
        </div>

        {/* Feedback callout */}
        {feedback && (
          <div className="rounded-[var(--w08-radius)] p-4 text-sm font-medium text-white" style={{ backgroundColor: OUTCOME_COLOR[feedback.outcome] }}>
            <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-90">
              <span>{OUTCOME_LABEL[feedback.outcome]}</span>
              <span className="tabular-nums">{signed(feedback.scoreDelta)}</span>
            </div>
            {feedback.text}
          </div>
        )}

        {/* Vitals */}
        {d.vitals && d.vitals.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {d.vitals.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border p-2.5"
                style={{ borderColor: `${vitalColor(v.state)}55`, backgroundColor: `${vitalColor(v.state)}12` }}
              >
                <div className="text-[9px] font-black uppercase tracking-widest text-[color:var(--w08-text-muted)]">{v.label}</div>
                <div className="mt-0.5 text-sm font-black tabular-nums" style={{ color: vitalColor(v.state) }}>
                  {v.value}
                  {v.unit ?? ''} <span className="text-xs">{trendArrow(v.trend)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-4 shadow-[var(--w08-shadow)]">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[color:var(--w08-text-muted)]">
              <span>Patient Stability</span>
              <span style={{ color: sv.color }}>{d.score}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--w08-surface-raised)]">
              <div className="h-full rounded-full transition-[width,background-color] duration-300" style={{ width: `${ratio * 100}%`, backgroundColor: sv.color }} />
            </div>
          </div>
        )}

        {/* Decision path */}
        {d.stages && d.stages.length > 0 && (
          <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-4 shadow-[var(--w08-shadow)]">
            <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--w08-text-muted)]">Decision Path</h4>
            <ol className="space-y-2">
              {d.stages.map((st, i) => {
                const done = stageIndex > -1 && i < stageIndex;
                const active = i === stageIndex;
                return (
                  <li key={st.id}>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                        style={
                          active || done
                            ? { backgroundColor: 'var(--w08-accent-primary)', color: 'var(--w08-accent-contrast)' }
                            : { backgroundColor: 'var(--w08-surface-raised)', color: 'var(--w08-text-muted)' }
                        }
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-[color:var(--w08-text)]' : 'text-[color:var(--w08-text-muted)]'}`}>
                        {st.label}
                      </span>
                    </div>
                    {active && !ended && (
                      <div className="ml-8 mt-1.5 rounded-md border border-[color:var(--w08-accent-primary)] bg-[var(--w08-surface-raised)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--w08-text-muted)]">
                        → Waiting for choice…
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[color:var(--w08-text-muted)] transition-colors hover:bg-[var(--w08-surface-raised)]"
        >
          ← All cases
        </button>
      </aside>

      {/* ───────── Main ───────── */}
      <div className="space-y-5">
        {/* Patient header */}
        <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 shadow-[var(--w08-shadow)]">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--w08-surface-raised)] text-xl">👤</div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">
                {patientName}
                {d.patient?.age ? `, ${d.patient.age}${d.patient.sex ?? ''}` : ''}
              </h2>
              {patientMeta && <p className="mt-0.5 truncate text-sm text-[color:var(--w08-text-muted)]">{patientMeta}</p>}
            </div>
          </div>
        </div>

        {/* Stage / situation */}
        <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-6 shadow-[var(--w08-shadow)]">
          {d.node.stageLabel && (
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.15em] text-[color:var(--w08-text-muted)]">{d.node.stageLabel}</div>
          )}
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--w08-text)]">{d.node.content}</p>

          {error && <p className="mt-4 text-sm text-[color:var(--w08-danger)]">{error}</p>}

          {!ended && (
            <>
              {d.node.prompt && <h3 className="mt-6 text-lg font-bold text-[color:var(--w08-text)] [font-family:var(--w08-font-display)]">{d.node.prompt}</h3>}
              <div className="mt-3 text-[11px] font-black uppercase tracking-widest text-[color:var(--w08-text-muted)]">Select an option</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {d.node.choices.map((ch, i) => {
                  const key = CHOICE_KEYS[i] ?? `${i + 1}`;
                  const sel = selected === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelected(ch.id)}
                      disabled={busy}
                      className={`group flex flex-col rounded-2xl border bg-[var(--w08-bg)] p-5 text-left transition-all duration-[var(--w08-motion-duration)] hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 ${
                        sel ? 'border-[color:var(--w08-accent-primary)] ring-2 ring-[color:var(--w08-focus-ring)]' : 'border-[color:var(--w08-border)] hover:bg-[var(--w08-surface-raised)]'
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--w08-surface-raised)] text-xl">{ch.icon || key}</span>
                        <span className="rounded-md bg-[var(--w08-surface-raised)] px-1.5 py-0.5 text-[11px] font-bold text-[color:var(--w08-text-muted)]">{key}</span>
                      </div>
                      <div className="text-sm font-semibold text-[color:var(--w08-text)]">{ch.label}</div>
                      {ch.detail && <div className="mt-1 text-xs text-[color:var(--w08-text-muted)]">{ch.detail}</div>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={submit}
                  disabled={!selected || busy}
                  className="rounded-full bg-[var(--w08-accent-primary)] px-8 py-2.5 text-sm font-semibold text-[color:var(--w08-accent-contrast)] shadow-[var(--w08-shadow)] transition-transform active:scale-95 disabled:opacity-40"
                >
                  {busy ? 'Submitting…' : '✓ Submit Answer'}
                </button>
              </div>
            </>
          )}

          {ended && (
            <div
              className="mt-6 rounded-[var(--w08-radius)] border p-6 text-center"
              style={{
                borderColor: d.status === 'survived' ? '#10b981' : '#ef4444',
                backgroundColor: `${d.status === 'survived' ? '#10b981' : '#ef4444'}14`,
              }}
            >
              <div className="text-3xl">{d.status === 'survived' ? '✅' : '☠️'}</div>
              <div className="mt-2 text-lg font-black uppercase tracking-widest" style={{ color: d.status === 'survived' ? '#10b981' : '#ef4444' }}>
                {d.status === 'survived' ? 'Patient Survived' : 'Patient Died'}
              </div>
              <div className="mt-1 text-sm text-[color:var(--w08-text-muted)]">Final vitals: {d.score}</div>
              <button
                onClick={reset}
                disabled={busy}
                className="mt-4 rounded-full bg-[var(--w08-accent-primary)] px-6 py-2 text-sm font-semibold text-[color:var(--w08-accent-contrast)] transition-transform active:scale-95 disabled:opacity-50"
              >
                {busy ? 'Restarting…' : '↻ Restart case'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
