'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import QuestionCard from '@/components/w09/QuestionCard';
import { Skel, SkelGroup } from '@/components/system/Skeleton';
import { Action, Page, PageHeader } from '@/components/system/primitives';

type Question = { id: string; number: number; prompt: string; options: { id: string; label: string }[] };
type AnswerState = { selectedId?: string; status: 'idle' | 'answered'; correctId?: string };

const SECTIONS = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' },
  { id: 'writing', label: 'Writing' },
  { id: 'speaking', label: 'Speaking' },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

export default function IeltsPracticeClient() {
  const [section, setSection] = useState<SectionId>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (sec: SectionId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn/ielts/questions${sec === 'all' ? '' : `?section=${sec}`}`);
      if (!res.ok) throw new Error(`Failed to load questions (${res.status})`);
      setQuestions((await res.json()) as Question[]);
      setAnswers({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(section);
  }, [section, load]);

  const onSelect = async (questionId: string, optionId: string) => {
    if (answers[questionId]?.status === 'answered') return;
    setAnswers((prev) => ({ ...prev, [questionId]: { selectedId: optionId, status: 'idle' } }));
    try {
      const res = await fetch('/api/learn/ielts/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, optionId }),
      });
      const data = (await res.json().catch(() => null)) as { correct?: boolean; correctId?: string; error?: string } | null;
      if (!res.ok) throw new Error(data?.error || `Grading failed (${res.status})`);
      setAnswers((prev) => ({ ...prev, [questionId]: { selectedId: optionId, status: 'answered', correctId: data?.correctId } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Grading failed');
      setAnswers((prev) => ({ ...prev, [questionId]: { selectedId: optionId, status: 'idle' } }));
    }
  };

  const total = questions.length;
  const answered = useMemo(() => Object.values(answers).filter((a) => a.status === 'answered').length, [answers]);
  const correct = useMemo(
    () => Object.values(answers).filter((a) => a.status === 'answered' && a.selectedId === a.correctId).length,
    [answers],
  );
  const allDone = total > 0 && answered === total;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <Page>
      <PageHeader label="runtime / ielts / practice" title="IELTS practice" lede="Pick a section and answer — each choice is graded instantly." actions={<Action href="/ielts">ielts hub</Action>} />
      <div className="sys-section" style={{ maxWidth: 720 }}>

        {/* Section filter */}
        <div className="mt-5 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-[var(--w09-motion-duration)] ${
 section === s.id
 ? 'bg-[var(--w09-accent-primary)] text-[color:var(--w09-accent-contrast)]'
 : 'border border-[color:var(--w09-border)] bg-[var(--w09-surface)] text-[color:var(--w09-text-muted)] hover:bg-[var(--w09-surface-raised)]'
 }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sticky progress / score */}
        {!loading && total > 0 && (
          <div className="sticky top-0 z-10 -mx-5 mt-5 border-b border-[color:var(--w09-border)] bg-[var(--w09-bg)] px-5 py-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">
              <span>Answered {answered}/{total}</span>
              <span className="text-[color:var(--w09-success)]">{correct} correct</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--w09-surface-raised)]">
              <div
                className="h-full rounded-full bg-[var(--w09-accent-primary)] transition-[width] duration-[var(--w09-motion-duration)] ease-[var(--w09-motion-ease)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-[color:var(--w09-danger)]">{error}</p>}

        {loading ? (
          <SkelGroup label="IELTS practice" className="mt-6 space-y-4">
            {[1, 2, 3].map((n) => (
              <Skel key={n} className="h-40 rounded-[var(--w09-radius)]" />
            ))}
          </SkelGroup>
        ) : total === 0 ? (
          <div className="mt-10 rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-8 text-center text-sm text-[color:var(--w09-text-muted)]">
            No questions{section !== 'all' ? ` in ${section}` : ''} yet.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {questions.map((q) => {
              const a = answers[q.id];
              return (
                <QuestionCard
                  key={q.id}
                  number={q.number}
                  prompt={q.prompt}
                  options={q.options}
                  selectedId={a?.selectedId}
                  correctId={a?.correctId}
                  status={a?.status ?? 'idle'}
                  onSelect={(optionId) => onSelect(q.id, optionId)}
                />
              );
            })}
          </div>
        )}

        {/* Results summary */}
        {allDone && (
          <div className="mt-6 rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-6 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">Session complete</div>
            <div className="mt-1 text-3xl font-black text-[color:var(--w09-accent-primary)]">
              {correct}/{total}
            </div>
            <div className="mt-1 text-sm text-[color:var(--w09-text-muted)]">{Math.round((correct / total) * 100)}% correct</div>
            <button
              onClick={() => load(section)}
              className="mt-4 rounded-[var(--w09-radius)] bg-[var(--w09-accent-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--w09-accent-contrast)] transition-transform active:scale-95"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </Page>
  );
}
