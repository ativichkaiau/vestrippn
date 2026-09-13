'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { COVERAGE_STATUSES, coverageCounts, resultPercent, type CoverageCounts, type CoverageCourse, type CoverageObjective, type CoverageResponse, type CoverageStatus } from '@/lib/coverage-types';

const button = 'rounded-xl border border-black/15 px-3 py-2 text-xs font-bold transition hover:bg-black/5 disabled:cursor-wait disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10';
const input = 'mt-2 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-white/15 dark:bg-neutral-950 dark:text-white';
const labels: Record<CoverageStatus, string> = { untouched: 'Untouched', reviewed: 'Reviewed', tested: 'Tested' };
const dots: Record<CoverageStatus, string> = { untouched: 'bg-neutral-300 dark:bg-neutral-600', reviewed: 'bg-sky-500', tested: 'bg-emerald-500' };

class CoverageRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestCoverage(method: string, body?: unknown, course?: string | null) {
  const response = await fetch(`/api/coverage${course ? `?course=${encodeURIComponent(course)}` : ''}`, {
    method, cache: 'no-store', headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new CoverageRequestError(result.error || 'Could not load your coverage. Please retry.', response.status);
  return result;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function CoverageBar({ counts }: { counts: CoverageCounts }) {
  const reviewed = counts.total ? counts.reviewed / counts.total * 100 : 0;
  const tested = counts.total ? counts.tested / counts.total * 100 : 0;
  return <div className="flex h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" role="img" aria-label={`${counts.reviewed} reviewed, ${counts.tested} tested, ${counts.untouched} untouched out of ${counts.total}`}>
    <span className="bg-emerald-500 transition-[width] motion-reduce:transition-none" style={{ width: `${tested}%` }} />
    <span className="bg-sky-500 transition-[width] motion-reduce:transition-none" style={{ width: `${reviewed}%` }} />
  </div>;
}

export default function ExamCoverageMap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCourse = searchParams.get('course');
  const [data, setData] = useState<CoverageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedCourse, setLoadedCourse] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CoverageStatus | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    requestCoverage('GET', undefined, requestedCourse).then((result: CoverageResponse) => {
      if (!active) return;
      setData(result); setLoadedCourse(requestedCourse); setLoading(false); setError('');
      if (result.courses.find(course => course.id === result.selectedCourseId)?.archived) setShowArchived(true);
    }).catch(err => { if (active) { setData(null); setLoadedCourse(requestedCourse); setLoading(false); setError(err.message); } });
    return () => { active = false; };
  }, [requestedCourse, refreshKey]);

  const refresh = useCallback(() => { setLoading(true); setRefreshKey(value => value + 1); }, []);
  useEffect(() => {
    // Refresh when returning from practice, without overwriting an open note draft.
    const onVisible = () => { if (document.visibilityState === 'visible' && !selectedKey && !adding && !busy) refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [selectedKey, adding, busy, refresh]);

  const course = data?.courses.find(item => item.id === data.selectedCourseId);
  const pending = loadedCourse !== requestedCourse || (!data && loading);
  const objectives = data?.objectives ?? [];
  const groups = useMemo(() => {
    const grouped = new Map<string, CoverageObjective[]>();
    const search = query.trim().toLowerCase();
    for (const objective of data?.objectives ?? []) {
      if (filter !== 'all' && objective.status !== filter) continue;
      if (search && !`${objective.title} ${objective.section} ${objective.objective} ${objective.notes}`.toLowerCase().includes(search)) continue;
      grouped.set(objective.section, [...(grouped.get(objective.section) ?? []), objective]);
    }
    return [...grouped.entries()];
  }, [data, query, filter]);
  const visibleCount = groups.reduce((sum, [, items]) => sum + items.length, 0);

  function chooseCourse(next: string) {
    if (next === data?.selectedCourseId) return;
    setLoading(true); setData(null); setSelectedKey(null); setAdding(false); setQuery(''); setFilter('all'); setNotice(''); setError('');
    router.replace(`/workspace?tab=coverage&course=${encodeURIComponent(next)}`, { scroll: false });
  }

  async function write(method: 'POST' | 'PATCH' | 'DELETE', payload: Record<string, unknown>, success: string) {
    if (!course || busy || loading || pending) return false;
    setBusy(true); setError(''); setNotice('');
    try {
      const { objective }: { objective: CoverageObjective | null } = await requestCoverage(method, { ...payload, courseId: course.id });
      setData(current => {
        if (!current || current.selectedCourseId !== course.id) return current;
        const remaining = current.objectives.filter(item => item.key !== (objective?.key ?? payload.key));
        const next = objective ? [...remaining, objective].sort((a, b) => a.section.localeCompare(b.section, 'en', { numeric: true }) || a.title.localeCompare(b.title)) : remaining;
        return { ...current, objectives: next, courses: current.courses.map(item => item.id === course.id ? { ...item, counts: coverageCounts(next) } : item) };
      });
      setNotice(success);
      return true;
    } catch (err) {
      if (err instanceof CoverageRequestError && err.status === 409) {
        try {
          const current: CoverageResponse = await requestCoverage('GET', undefined, course.id);
          setData(current);
          setError('This objective changed on another device. Its saved state is now refreshed; your open note draft is preserved. Review it and save again.');
        } catch { setError(err.message); }
      } else setError(err instanceof Error ? err.message : 'Could not save. Please retry.');
      return false;
    }
    finally { setBusy(false); }
  }

  return <div className="space-y-6" aria-label="Exam coverage map">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-black tracking-tight">Exam coverage map</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">See what you have covered, find the gaps, and keep the evidence beside each learning objective.</p></div>
      <button type="button" className={button} disabled={busy || loading || pending} onClick={refresh}>Refresh map</button>
    </div>
    {error && <div role="alert" className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm">{notice}</p>}
    {(loading || pending) && <p role="status" className="py-6 text-sm text-neutral-500">Loading your course coverage…</p>}

    {data && !pending && <>
      <label className="flex items-center gap-2 text-xs font-semibold text-neutral-500"><input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} className="accent-[var(--hub-accent)]" /> Include archived semesters</label>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Choose course">
        {data.courses.filter(item => showArchived || !item.archived).map(item => <button type="button" key={item.id} disabled={busy} aria-pressed={course?.id === item.id} onClick={() => chooseCourse(item.id)} className={`min-w-0 rounded-2xl border p-4 text-left transition hover:bg-black/[0.025] dark:hover:bg-white/[0.035] ${course?.id === item.id ? 'border-[var(--hub-accent)] bg-[var(--hub-accent)]/5' : 'border-black/10 dark:border-white/10'}`}>
          <div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{item.code}</span><span className="text-[10px] font-bold text-neutral-500">{item.counts.reviewed + item.counts.tested}/{item.counts.total} covered</span></div>
          <p className="mb-3 mt-1 truncate text-xs text-neutral-500">{item.semesterName}{item.archived ? ' · Archived' : ''}</p>
          <CoverageBar counts={item.counts} />
        </button>)}
      </div>
      {!data.courses.length && <p className="rounded-2xl border border-dashed border-black/15 p-6 text-sm dark:border-white/15">Create a semester and course in <a className="underline" href="/workspace?tab=courses">Courses</a> to start your coverage map.</p>}
      {!course && data.courses.length > 0 && <p className="text-sm text-neutral-500">Choose a course to open its coverage map.</p>}

      {course && <>
        <CoverageOverview course={course} />
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[180px] flex-1 text-xs font-bold">Search topics or notes<input type="search" value={query} onChange={event => setQuery(event.target.value)} className={input} placeholder="Anemia, skin lesions, coagulation…" /></label>
          <label className="text-xs font-bold">Status<select className={input} value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option value="all">All objectives</option>{COVERAGE_STATUSES.map(status => <option key={status} value={status}>{labels[status]}</option>)}</select></label>
          {!course.archived && <button type="button" disabled={busy} className={button} onClick={() => setAdding(value => !value)}>+ Add objective</button>}
        </div>
        {adding && <NewObjective busy={busy} onCancel={() => setAdding(false)} onSave={async payload => { if (await write('POST', payload, 'Learning objective added.')) setAdding(false); }} />}
        <p className="text-xs text-neutral-500">{visibleCount} of {objectives.length} objectives · Open a lecture group to update its topics.</p>
        <div className="space-y-3">
          {groups.map(([section, items], index) => <details key={`${course.id}:${section}:${filter}:${query}`} open={Boolean(query) || filter !== 'all' || index === 0} className="rounded-2xl border border-black/10 bg-white/65 dark:border-white/10 dark:bg-white/[0.025]">
            <summary className="cursor-pointer rounded-2xl p-4 text-sm font-bold sm:p-5"><span className="ml-2 break-words">{section}</span><span className="ml-3 whitespace-nowrap text-xs font-normal text-neutral-500">{items.filter(item => item.status !== 'untouched').length}/{items.length} covered</span></summary>
            <div className="divide-y divide-black/5 border-t border-black/5 dark:divide-white/10 dark:border-white/10">
              {items.map(item => <article key={item.key} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500"><span className={`h-2 w-2 rounded-full ${dots[item.status]}`} />{labels[item.status]}{item.key.startsWith('custom:') && ' · Custom'}</div>
                    <h3 className="mt-1.5 break-words text-sm font-bold sm:text-base">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{item.objective}</p>
                    {item.results[0] && <p className="mt-2 text-xs"><span className="font-bold">Latest practice: {resultPercent(item.results[0])}%</span> <span className="text-neutral-500">({item.results[0].correct}/{item.results[0].total}) · {dateLabel(item.results[0].recordedAt)}</span></p>}
                  </div>
                  <div className="flex flex-wrap gap-1 rounded-xl border border-black/10 p-1 dark:border-white/10" role="group" aria-label={`Coverage status for ${item.title}`}>
                    {COVERAGE_STATUSES.map(status => <button type="button" key={status} aria-pressed={item.status === status} disabled={busy || course.archived} onClick={() => void write('PATCH', { key: item.key, revision: item.revision, action: 'status', status }, `Marked ${labels[status].toLowerCase()}.`)} className={`rounded-lg px-2.5 py-2 text-[11px] font-bold transition disabled:opacity-50 ${item.status === status ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10'}`}>{labels[status]}</button>)}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.lessonUrl && <a className={button} href={item.lessonUrl} target="_blank" rel="noopener noreferrer">Lesson ↗</a>}
                  {item.practiceUrl && <a className={button} href={item.practiceUrl} target="_blank" rel="noopener noreferrer">Practice ↗</a>}
                  <button type="button" className={button} aria-expanded={selectedKey === item.key} onClick={() => setSelectedKey(current => current === item.key ? null : item.key)}>{item.notes || item.noteUrl ? 'Notes' : 'Add notes'} & results{item.results.length ? ` (${item.results.length})` : ''}</button>
                  {!course.archived && <button type="button" className={button} onClick={() => window.dispatchEvent(new CustomEvent('vest:focus-open', { detail: { title: `${course.code} · ${item.title}`, minutes: 25, agendaItemId: `coverage:${course.id}:${item.key}` } }))}>Focus · 25 min</button>}
                </div>
                {selectedKey === item.key && <ObjectiveEvidence key={item.key} item={item} readOnly={course.archived} busy={busy} onSave={(action, payload, success) => write('PATCH', { key: item.key, revision: item.revision, action, ...payload }, success)} onDelete={async () => { if (await write('DELETE', { key: item.key, revision: item.revision }, 'Custom objective deleted.')) setSelectedKey(null); }} />}
              </article>)}
            </div>
          </details>)}
        </div>
        {groups.length === 0 && <p className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-neutral-500 dark:border-white/15">{objectives.length ? 'No objectives match these filters.' : 'No WilliamsHub topics match this course yet. Add your own learning objectives to start tracking it.'}</p>}
      </>}
      <p className="text-xs leading-5 text-neutral-500">Study objectives adapted from <a href={data.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">WilliamsHub</a> · Catalog updated {dateLabel(data.source.importedAt)}. This tracks your coverage of those topics; it is not an official exam blueprint or a predicted grade. WilliamsHub practice runs separately; record your result here after practice.</p>
    </>}
  </div>;
}

function CoverageOverview({ course }: { course: CoverageCourse }) {
  const counts = course.counts;
  const covered = counts.reviewed + counts.tested;
  return <section className="w85-panel-accent rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--hub-accent)]">{course.code} · {course.catalogCode ? 'WilliamsHub topics' : 'Your learning objectives'}</p><h3 className="mt-2 text-xl font-black sm:text-2xl">{course.name}</h3><p className="mt-2 text-xs text-neutral-500">{course.nextExam ? `${course.nextExam.title} · ${dateLabel(course.nextExam.scheduledAt)} (Bangkok)` : 'No upcoming exam set'}{course.archived ? ' · Archived semester · View only' : ''}</p></div>
      <div className="text-right"><p className="text-3xl font-black tabular-nums">{counts.total ? Math.round(covered / counts.total * 100) : 0}%</p><p className="mt-1 text-xs text-neutral-500">reviewed or tested</p></div>
    </div>
    <div className="mt-5"><CoverageBar counts={counts} /></div>
    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">{COVERAGE_STATUSES.map(status => <div key={status} className="rounded-xl border border-black/10 p-3 dark:border-white/10"><p className="flex items-center gap-2 text-[10px] font-bold uppercase text-neutral-500"><span className={`h-2 w-2 shrink-0 rounded-full ${dots[status]}`} />{labels[status]}</p><p className="mt-2 text-2xl font-black tabular-nums">{counts[status]}</p></div>)}</div>
    <div className="mt-4 flex flex-wrap gap-4 text-xs"><a className="underline underline-offset-4" href="/workspace?tab=courses">Manage courses & exam dates</a>{course.notebookUrl && <a className="underline underline-offset-4" href={course.notebookUrl} target="_blank" rel="noopener noreferrer">Course NotebookLM ↗</a>}</div>
    <p className="mt-3 text-xs text-neutral-500">Reviewed = you have worked through the topic. Tested = you have attempted practice; the recorded score shows how it went.</p>
  </section>;
}

function NewObjective({ busy, onSave, onCancel }: { busy: boolean; onSave: (payload: { title: string; section: string }) => Promise<void>; onCancel: () => void }) {
  return <form onSubmit={event => { event.preventDefault(); const values = new FormData(event.currentTarget); void onSave({ title: String(values.get('title')), section: String(values.get('section')) }); }} className="space-y-4 rounded-2xl border border-[var(--hub-accent)]/40 p-5">
    <h3 className="font-bold">Add a learning objective</h3>
    <label className="block text-xs font-bold">What should you be able to explain or do?<input autoFocus name="title" required maxLength={500} className={input} placeholder="Differentiate the causes of microcytic anemia" /></label>
    <label className="block text-xs font-bold">Topic group<input name="section" required maxLength={300} defaultValue="My learning objectives" className={input} /></label>
    <div className="flex gap-2"><button type="submit" disabled={busy} className={button}>{busy ? 'Saving…' : 'Add objective'}</button><button type="button" disabled={busy} onClick={onCancel} className={button}>Cancel</button></div>
  </form>;
}

function ObjectiveEvidence({ item, readOnly, busy, onSave, onDelete }: {
  item: CoverageObjective; readOnly: boolean; busy: boolean;
  onSave: (action: string, payload: Record<string, unknown>, success: string) => Promise<boolean>;
  onDelete: () => Promise<void>;
}) {
  const [notes, setNotes] = useState(item.notes);
  const [noteUrl, setNoteUrl] = useState(item.noteUrl ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attemptId, setAttemptId] = useState(() => crypto.randomUUID());
  const dirty = notes !== item.notes || noteUrl !== (item.noteUrl ?? '');

  async function recordResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const ok = await onSave('result', { result: { id: attemptId, label: values.get('label'), correct: Number(values.get('correct')), total: Number(values.get('total')), url: values.get('url') } }, 'Practice result saved. Objective marked tested.');
    if (ok) { form.reset(); setAttemptId(crypto.randomUUID()); }
  }

  return <div className="mt-4 space-y-5 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.035] sm:p-5">
    {!readOnly && item.key.startsWith('custom:') && <details>
      <summary className="cursor-pointer text-xs font-bold">Edit this objective</summary>
      <form className="mt-3 space-y-3" onSubmit={event => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        void onSave('edit', { title: values.get('title'), section: values.get('section') }, 'Learning objective updated.');
      }}>
        <label className="block text-xs font-bold">Learning objective<input name="title" required maxLength={500} defaultValue={item.title} className={input} /></label>
        <label className="block text-xs font-bold">Topic group<input name="section" required maxLength={300} defaultValue={item.section} className={input} /></label>
        <button type="submit" className={button} disabled={busy}>Save objective</button>
      </form>
    </details>}
    {item.prompts.length > 0 && <div><h4 className="text-xs font-bold">Use these prompts to check your understanding</h4><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{item.prompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ul></div>}
    <form onSubmit={event => { event.preventDefault(); void onSave('notes', { notes, noteUrl }, 'Notes and link saved.'); }} className="space-y-3">
      <label className="block text-xs font-bold">Your notes<textarea rows={4} maxLength={20_000} readOnly={readOnly} value={notes} onChange={event => setNotes(event.target.value)} className={input} placeholder="What clicked? What still needs another pass?" /></label>
      <label className="block text-xs font-bold">Link to notes or a document (optional)<input type="url" maxLength={2048} readOnly={readOnly} value={noteUrl} onChange={event => setNoteUrl(event.target.value)} className={input} placeholder="https://…" /></label>
      <div className="flex flex-wrap items-center gap-3">{!readOnly && <button type="submit" disabled={busy || !dirty} className={button}>{busy ? 'Saving…' : 'Save notes'}</button>}{dirty && <span className="text-xs text-amber-700 dark:text-amber-300">Unsaved note changes</span>}{item.noteUrl && <a href={item.noteUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-4">Open saved notes ↗</a>}</div>
    </form>
    <div>
      <h4 className="text-sm font-bold">Practice results</h4>
      {item.results.length ? <ul className="mt-3 space-y-2">{item.results.map(result => (
        <li key={result.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/10 p-3 text-xs dark:border-white/10">
          <div className="min-w-0">
            <p className="break-words font-bold">{result.label}</p>
            <p className="mt-1 text-neutral-500">{dateLabel(result.recordedAt)}{result.url && <> · <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline">Open result ↗</a></>}</p>
          </div>
          <p className="font-bold tabular-nums">{result.correct}/{result.total} · {resultPercent(result)}%</p>
        </li>
      ))}</ul> : <p className="mt-2 text-xs text-neutral-500">No results recorded yet. A tested status can also be set manually.</p>}
      {!readOnly && <form onSubmit={event => void recordResult(event)} className="mt-4 space-y-3">
        <label className="block text-xs font-bold">Practice name<input name="label" required maxLength={120} defaultValue="WilliamsHub practice" className={input} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Correct<input type="number" name="correct" min={0} max={10000} step={1} required className={input} /></label><label className="text-xs font-bold">Total questions<input type="number" name="total" min={1} max={10000} step={1} required className={input} /></label></div>
        <label className="block text-xs font-bold">Result link (optional)<input type="url" name="url" maxLength={2048} className={input} placeholder="https://…" /></label>
        <button type="submit" disabled={busy} className={button}>{busy ? 'Saving…' : 'Record practice result'}</button>
      </form>}
    </div>
    {!readOnly && item.key.startsWith('custom:') && <div className="border-t border-black/10 pt-4 dark:border-white/10">{confirmDelete ? <div className="flex flex-wrap items-center gap-2 text-xs"><span>Delete this objective, its notes, and results?</span><button type="button" className={button} disabled={busy} onClick={() => void onDelete()}>Confirm delete</button><button type="button" className={button} onClick={() => setConfirmDelete(false)}>Keep objective</button></div> : <button type="button" className="text-xs text-red-600 underline dark:text-red-300" onClick={() => setConfirmDelete(true)}>Delete custom objective</button>}</div>}
  </div>;
}
