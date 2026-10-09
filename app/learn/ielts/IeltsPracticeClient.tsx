'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Action, Page, PageHeader, Section } from '@/components/system/primitives';

/* ~/runtime/ielts/practice — graded server-side, explained after each answer.
   Public: anyone can practise; attempts are stored only when signed in. */

type Question = {
  id: string;
  number: number;
  section: string;
  skill: string;
  difficulty: number;
  prompt: string;
  options: { id: string; label: string }[];
};
type Answer = { selectedId: string; state: 'grading' | 'answered'; correctId?: string; explanation?: string };

const SECTIONS = ['all', 'reading', 'listening', 'writing', 'speaking'] as const;
type SectionId = (typeof SECTIONS)[number];

export default function IeltsPracticeClient() {
  const { status } = useSession();
  const [section, setSection] = useState<SectionId>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only the latest request may update the list: switching sections quickly
  // must not let a slower, earlier response win.
  const latest = useRef(0);
  const load = useCallback((next: SectionId) => {
    const request = ++latest.current;
    return fetch(`/api/learn/ielts/questions${next === 'all' ? '' : `?section=${next}`}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Could not load questions (${res.status})`);
        const list = (await res.json()) as Question[];
        if (request === latest.current) setQuestions(list);
      })
      .catch((e: unknown) => {
        if (request !== latest.current) return;
        setError(e instanceof Error ? e.message : 'Could not load questions');
        setQuestions([]);
      })
      .finally(() => {
        if (request === latest.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    void load('all');
  }, [load]);

  const pick = (next: SectionId) => {
    if (next === section) return;
    setSection(next);
    setAnswers({});
    setError(null);
    setLoading(true);
    void load(next);
  };

  const choose = async (question: Question, optionId: string) => {
    if (answers[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: { selectedId: optionId, state: 'grading' } }));
    try {
      const res = await fetch('/api/learn/ielts/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, optionId }),
      });
      const data = (await res.json().catch(() => null)) as { correctId?: string; explanation?: string; error?: string } | null;
      if (!res.ok) throw new Error(data?.error || `Grading failed (${res.status})`);
      setAnswers((prev) => ({ ...prev, [question.id]: { selectedId: optionId, state: 'answered', correctId: data?.correctId, explanation: data?.explanation } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Grading failed');
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[question.id];
        return next;
      });
    }
  };

  const answered = useMemo(() => Object.values(answers).filter((a) => a.state === 'answered'), [answers]);
  const correct = answered.filter((a) => a.selectedId === a.correctId).length;

  return (
    <Page>
      <PageHeader
        label="runtime / ielts / practice"
        title="IELTS practice"
        lede="Choose an answer and it is graded on the server, with the reasoning shown straight after."
        meta={[
          { key: 'questions', value: String(questions.length).padStart(2, '0') },
          { key: 'answered', value: `${answered.length}/${questions.length}` },
          { key: 'correct', value: answered.length ? `${correct} · ${Math.round((correct / answered.length) * 100)}%` : '—' },
          { key: 'saving', value: status === 'authenticated' ? 'on' : 'off · sign in to keep attempts' },
        ]}
        actions={
          status === 'authenticated' ? (
            <Action href="/ielts">ielts hub</Action>
          ) : (
            <Action href={`/auth/signin?callbackUrl=${encodeURIComponent('/learn/ielts')}`}>sign in to save</Action>
          )
        }
      />

      <Section id="practice" title="questions" count={loading ? '…' : String(questions.length).padStart(2, '0')}>
        <div className="sys-filter" role="group" aria-label="Section">
          {SECTIONS.map((id) => (
            <button key={id} type="button" aria-pressed={section === id} onClick={() => pick(id)}>
              {id}
            </button>
          ))}
          {answered.length > 0 && (
            <button type="button" onClick={() => setAnswers({})}>
              reset answers
            </button>
          )}
        </div>

        {error && <p className="sys-alert" role="alert">{error}</p>}

        {loading ? (
          <div className="sys-skel-group" aria-busy="true" aria-label="Loading questions">
            {[0, 1, 2].map((i) => <span key={i} className="sys-skel" style={{ height: 140 }} />)}
          </div>
        ) : questions.length === 0 ? (
          <p className="sys-empty">no questions in this section yet.</p>
        ) : (
          <ol className="sys-quiz">
            {questions.map((question) => {
              const answer = answers[question.id];
              const done = answer?.state === 'answered';
              return (
                <li key={question.id} className="sys-quiz-item" data-state={done ? (answer.selectedId === answer.correctId ? 'correct' : 'wrong') : undefined}>
                  <p className="sys-label">
                    Q{String(question.number).padStart(2, '0')} · {question.section} · {question.skill}
                  </p>
                  <p className="sys-quiz-prompt">{question.prompt}</p>
                  <div className="sys-quiz-options" role="group" aria-label={`Options for question ${question.number}`}>
                    {question.options.map((option) => {
                      const selected = answer?.selectedId === option.id;
                      const right = done && answer.correctId === option.id;
                      const wrong = done && selected && answer.correctId !== option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className="sys-quiz-option"
                          data-selected={selected || undefined}
                          data-result={right ? 'correct' : wrong ? 'wrong' : undefined}
                          aria-pressed={selected}
                          disabled={Boolean(answer)}
                          onClick={() => void choose(question, option.id)}
                        >
                          <span>{option.label}</span>
                          {right && <span className="sys-quiz-mark">correct</span>}
                          {wrong && <span className="sys-quiz-mark">your answer</span>}
                        </button>
                      );
                    })}
                  </div>
                  {answer?.state === 'grading' && <p className="sys-turn-wait">grading</p>}
                  {done && answer.explanation && (
                    <p className="sys-quiz-explanation">
                      <b>{answer.selectedId === answer.correctId ? 'Correct.' : 'Not quite.'}</b> {answer.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Section>
    </Page>
  );
}
