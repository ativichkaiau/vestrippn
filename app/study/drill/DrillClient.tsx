'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { caseSpecialtyFor, pickWeakest, recentScore } from '@/lib/coverage-drill';
import type { CoverageObjective, CoverageResponse } from '@/lib/coverage-types';
import type { CaseSummary } from '@/app/learn/cases/types';

/* ════════════════════════════════════════════════════════════════════════
   The weak-spot drill. One objective at a time: its prompts, each graded
   got it / shaky / missed. "Save & next" records a practice result
   (correct = prompts you got) on the coverage map, which also marks the
   objective tested. The end screen lists cases from the same system.
   ════════════════════════════════════════════════════════════════════════ */

type Grade = 'got' | 'shaky' | 'missed';
type Done = { key: string; title: string; correct: number; total: number; saved: boolean };
const GRADES: { value: Grade; label: string }[] = [
  { value: 'got', label: 'got it' },
  { value: 'shaky', label: 'shaky' },
  { value: 'missed', label: 'missed' },
];
const DRILL_SIZE = 10;

function nearestExamCourse(data: CoverageResponse): string | null {
  const now = Date.now();
  const upcoming = data.courses
    .filter((course) => !course.archived && course.nextExam && Date.parse(course.nextExam.scheduledAt) >= now)
    .sort((a, b) => Date.parse(a.nextExam!.scheduledAt) - Date.parse(b.nextExam!.scheduledAt));
  return upcoming[0]?.id ?? data.selectedCourseId;
}

async function fetchCoverage(courseId?: string | null): Promise<CoverageResponse> {
  const query = courseId ? `?course=${encodeURIComponent(courseId)}` : '';
  const res = await fetch(`/api/coverage${query}`, { cache: 'no-store' });
  const body = (await res.json().catch(() => null)) as (CoverageResponse & { error?: string }) | null;
  if (!res.ok || !body) throw new Error(body?.error ?? `Could not load your coverage (${res.status}).`);
  if (courseId) return body;
  // First visit: ?course=…, else the course with the nearest exam.
  const preferred = new URLSearchParams(window.location.search).get('course') ?? nearestExamCourse(body);
  return preferred && preferred !== body.selectedCourseId ? fetchCoverage(preferred) : body;
}

function why(objective: CoverageObjective): string {
  if (objective.status === 'untouched') return 'untouched';
  const score = recentScore(objective);
  if (score === null) return objective.status === 'reviewed' ? 'reviewed, never tested' : 'tested, no score';
  return `recent score ${Math.round(score * 100)}%`;
}

export default function DrillClient() {
  const [data, setData] = useState<CoverageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<CoverageObjective[]>([]);
  const [index, setIndex] = useState(0);
  const [grades, setGrades] = useState<Record<number, Grade>>({});
  const [done, setDone] = useState<Done[]>([]);
  const [saving, setSaving] = useState(false);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const selectId = useId();

  const start = useCallback((body: CoverageResponse) => {
    setData(body);
    setCards(pickWeakest(body.objectives, DRILL_SIZE));
    setIndex(0);
    setGrades({});
    setDone([]);
  }, []);
  const fail = (e: unknown) => setError(e instanceof Error ? e.message : 'Could not load your coverage.');
  const load = (courseId?: string | null) => {
    setError(null);
    fetchCoverage(courseId).then(start, fail);
  };

  useEffect(() => {
    fetchCoverage().then(start, (e: unknown) => setError(e instanceof Error ? e.message : 'Could not load your coverage.'));
  }, [start]);

  const course = data?.courses.find((item) => item.id === data.selectedCourseId);
  const specialty = caseSpecialtyFor(course?.catalogCode);
  const finished = cards.length > 0 && index >= cards.length;

  useEffect(() => {
    if (!finished || !specialty) return;
    let stopped = false;
    fetch(`/api/learn/cases?specialty=${encodeURIComponent(specialty)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: CaseSummary[]) => {
        if (!stopped) setCases(list.slice(0, 6));
      })
      .catch(() => {});
    return () => {
      stopped = true;
    };
  }, [finished, specialty]);

  const card = cards[index];
  const prompts = useMemo(() => (card?.prompts.length ? card.prompts : [card?.objective ?? '']), [card]);
  const graded = prompts.every((_, i) => grades[i]);

  const next = (record?: Omit<Done, 'saved'>, saved = false) => {
    if (record) setDone((list) => [...list, { ...record, saved }]);
    setIndex((i) => i + 1);
    setGrades({});
  };

  const save = async () => {
    if (!card || !data?.selectedCourseId || !graded || saving) return;
    const correct = prompts.filter((_, i) => grades[i] === 'got').length;
    const total = prompts.length;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/coverage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: data.selectedCourseId,
          key: card.key,
          revision: card.revision,
          action: 'result',
          result: { id: `drill-${Date.now()}-${index}`, label: 'weak-spot drill', correct, total, url: null },
        }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(body?.error ?? `Could not save (${res.status}).`);
      next({ key: card.key, title: card.title, correct, total }, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this result.');
    } finally {
      setSaving(false);
    }
  };

  if (error && !data) return <p className="sys-muted" role="alert">{error}</p>;
  if (!data) return <p className="sys-muted">loading your coverage map…</p>;

  return (
    <section className="sys-drill" aria-label="Weak-spot drill">
      <div className="sys-drill-bar">
        <label htmlFor={selectId} className="sys-label">
          course
        </label>
        <select id={selectId} className="sys-input" value={data.selectedCourseId ?? ''} onChange={(event) => load(event.target.value)}>
          {data.courses
            .filter((item) => !item.archived)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} · {item.name}
                {item.nextExam ? ` · exam ${new Date(item.nextExam.scheduledAt).toLocaleDateString()}` : ''}
              </option>
            ))}
        </select>
        {course && (
          <span className="sys-muted">
            {course.counts.untouched} untouched · {course.counts.reviewed} reviewed · {course.counts.tested} tested
          </span>
        )}
      </div>

      {cards.length === 0 && <p className="sys-muted">This course has no objectives in the coverage map yet.</p>}

      {card && !finished && (
        <article className="sys-drill-card" aria-labelledby="drill-title">
          <p className="sys-label">
            {index + 1} / {cards.length} · {card.section} · <span className="sys-drill-why">{why(card)}</span>
          </p>
          <h2 id="drill-title">{card.title}</h2>
          {card.objective !== card.title && <p className="sys-drill-objective">{card.objective}</p>}
          <ol className="sys-drill-prompts">
            {prompts.map((prompt, i) => (
              <li key={i}>
                <p>{prompt}</p>
                <div role="radiogroup" aria-label={`How did you do on prompt ${i + 1}?`} className="sys-drill-grades">
                  {GRADES.map((grade) => (
                    <label key={grade.value} data-grade={grade.value}>
                      <input type="radio" name={`prompt-${index}-${i}`} checked={grades[i] === grade.value} onChange={() => setGrades((g) => ({ ...g, [i]: grade.value }))} />
                      {grade.label}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <div className="sys-drill-links">
            {card.lessonUrl && (
              <a href={card.lessonUrl} target="_blank" rel="noopener noreferrer">
                lesson ↗
              </a>
            )}
            {card.practiceUrl && (
              <a href={card.practiceUrl} target="_blank" rel="noopener noreferrer">
                practice questions ↗
              </a>
            )}
          </div>
          {error && (
            <p className="sys-drill-error" role="alert">
              {error}
            </p>
          )}
          <div className="sys-drill-actions">
            <button type="button" className="sys-action" onClick={() => next()} disabled={saving}>
              Skip
            </button>
            <button type="button" className="sys-action" data-variant="primary" onClick={save} disabled={!graded || saving}>
              {saving ? 'Saving…' : 'Save & next'}
            </button>
          </div>
        </article>
      )}

      {finished && (
        <div className="sys-drill-summary">
          <h2>drill complete</h2>
          {done.length === 0 ? (
            <p className="sys-muted">You skipped every card, so nothing was recorded.</p>
          ) : (
            <table className="sys-drill-table">
              <caption className="sys-muted">Saved to the coverage map as “weak-spot drill” results.</caption>
              <thead>
                <tr>
                  <th scope="col">objective</th>
                  <th scope="col">score</th>
                </tr>
              </thead>
              <tbody>
                {done.map((item) => (
                  <tr key={item.key}>
                    <td>{item.title}</td>
                    <td>
                      {item.correct}/{item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {specialty && cases.length > 0 && (
            <>
              <h3 className="sys-label">cases from the same system · {specialty}</h3>
              <ul className="sys-review-list">
                {cases.map((item) => (
                  <li key={item.id}>
                    <Link href={`/learn/cases?case=${encodeURIComponent(item.id)}`} className="sys-drill-case">
                      <b>{item.title}</b>
                      <small>{item.difficulty ?? item.specialty}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="sys-drill-actions">
            <button type="button" className="sys-action" data-variant="primary" onClick={() => load(data.selectedCourseId)}>
              Drill again
            </button>
            <Link className="sys-action" href="/workspace?tab=coverage">
              Open the coverage map
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
