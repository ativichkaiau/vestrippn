'use client';

import { useEffect, useState } from 'react';
import QuestionCard from '@/components/w08/QuestionCard';

type Question = { id: string; number: number; prompt: string; options: { id: string; label: string }[] };
type AnswerState = { selectedId?: string; status: 'idle' | 'answered'; correctId?: string };

export default function IeltsPracticeClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/learn/ielts/questions');
        if (!res.ok) throw new Error(`Failed to load questions (${res.status})`);
        setQuestions((await res.json()) as Question[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  return (
    <main className="min-h-screen bg-[var(--w08-bg)] px-5 py-8 text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">IELTS Practice</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">Select an answer to check it instantly.</p>

        {error && <p className="mt-4 text-sm text-[color:var(--w08-danger)]">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-[color:var(--w08-text-muted)]">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="mt-6 text-sm text-[color:var(--w08-text-muted)]">No questions available.</p>
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
      </div>
    </main>
  );
}
