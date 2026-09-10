'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { bangkokInputValue, formatExamDate, type CourseData, type CurriculumData, type ExamData, type SemesterData } from '@/lib/curriculum-types';

type Editor = { kind: 'semester' | 'course' | 'exam'; id?: string; name: string; code: string; startsAt: string; endsAt: string; semesterId: string; courseId: string; canvasUrl: string; notebookUrl: string; title: string; scheduledAt: string; sortOrder: number };
const emptyEditor: Editor = { kind: 'semester', name: '', code: '', startsAt: '', endsAt: '', semesterId: '', courseId: '', canvasUrl: '', notebookUrl: '', title: '', scheduledAt: '', sortOrder: 0 };
const inputClass = 'mt-1.5 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-2 focus:outline-[var(--accent-primary)] dark:border-white/20 dark:bg-neutral-900 dark:text-white';
const buttonClass = 'rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10';

export default function CourseSemesterManager() {
  const router = useRouter();
  const formId = useId();
  const [data, setData] = useState<CurriculumData | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: Editor['kind']; id: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/curriculum', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Could not load your courses.');
        setData(payload);
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load your courses.'); });
    return () => controller.abort();
  }, []);

  const semesters = data?.semesters.filter((semester) => showArchived ? Boolean(semester.archivedAt) : !semester.archivedAt) ?? [];
  const selected = semesters.find((semester) => semester.id === selectedId) ?? semesters[0];

  async function write(method: 'POST' | 'PATCH' | 'DELETE', payload: Record<string, unknown>, success: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/curriculum', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your change could not be saved.');
      setData(result); setEditor(null); setPendingDelete(null); setNotice(success);
      window.dispatchEvent(new Event('vest:curriculum-changed'));
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Your change could not be saved.'); }
    finally { setBusy(false); }
  }

  function editSemester(semester?: SemesterData) {
    setPendingDelete(null);
    setEditor({ ...emptyEditor, kind: 'semester', ...(semester ? { id: semester.id, name: semester.name, startsAt: semester.startsAt ? bangkokInputValue(semester.startsAt).slice(0, 10) : '', endsAt: semester.endsAt ? bangkokInputValue(semester.endsAt).slice(0, 10) : '' } : {}) });
  }
  function editCourse(course?: CourseData) {
    setPendingDelete(null);
    setEditor({ ...emptyEditor, kind: 'course', semesterId: selected?.id ?? '', sortOrder: selected?.courses.length ?? 0, ...(course ? { id: course.id, name: course.name, code: course.code, semesterId: course.semesterId, canvasUrl: course.canvasUrl ?? '', notebookUrl: course.notebookUrl ?? '', sortOrder: course.sortOrder } : {}) });
  }
  function editExam(course: CourseData, exam?: ExamData) {
    setPendingDelete(null);
    setEditor({ ...emptyEditor, kind: 'exam', courseId: course.id, title: 'Final exam', ...(exam ? { id: exam.id, title: exam.title, scheduledAt: bangkokInputValue(exam.scheduledAt) } : {}) });
  }
  function setField(key: keyof Editor, value: string) { setEditor((current) => current ? { ...current, [key]: value } : current); }
  function save(event: FormEvent) {
    event.preventDefault();
    if (editor) void write(editor.id ? 'PATCH' : 'POST', editor, `${editor.kind === 'exam' ? 'Exam' : editor.kind === 'course' ? 'Course' : 'Semester'} saved.`);
  }

  return (
    <section className="space-y-6 text-neutral-900 dark:text-white" aria-label="Course and semester manager">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">Courses & semesters</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">Keep your courses, exam dates, Canvas grades, and NotebookLM links together. Archived semesters stay saved and leave your active agenda.</p></div>
        <button className={buttonClass} disabled={busy || !data} onClick={() => editSemester()}>+ New semester</button>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{error}{!data && <button className="ml-3 underline" onClick={() => router.refresh()}>Reload page</button>}</div>}
      {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      {!data && !error && <p role="status" className="py-10 text-sm text-neutral-500">Loading your semesters…</p>}
      {data && <>
        <div className="flex flex-wrap items-center gap-2" aria-label="Semester filters">
          <button className={buttonClass} aria-pressed={!showArchived} onClick={() => { setShowArchived(false); setEditor(null); }}>{`Active (${data.semesters.filter((s) => !s.archivedAt).length})`}</button>
          <button className={buttonClass} aria-pressed={showArchived} onClick={() => { setShowArchived(true); setEditor(null); }}>{`Archived (${data.semesters.filter((s) => s.archivedAt).length})`}</button>
        </div>
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <div className="space-y-2">
            {semesters.map((semester) => <button key={semester.id} disabled={busy} aria-pressed={selected?.id === semester.id} onClick={() => { setSelectedId(semester.id); setEditor(null); setPendingDelete(null); }} className={`w-full rounded-2xl border p-4 text-left ${selected?.id === semester.id ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-black/10 dark:border-white/10'}`}>
              <span className="block break-words text-sm font-bold">{semester.name}</span><span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">{semester.courses.length} courses{semester.archivedAt ? ' · Archived' : ''}</span>
            </button>)}
            {!semesters.length && <p className="p-4 text-sm text-neutral-500">{showArchived ? 'No archived semesters.' : 'No active semesters. Create one to get started.'}</p>}
          </div>
          <div className="min-w-0 space-y-5">
            {editor && <form onSubmit={save} className="space-y-4 rounded-2xl border border-[var(--accent-primary)]/40 bg-white/70 p-5 dark:bg-white/5" aria-label={`${editor.id ? 'Edit' : 'New'} ${editor.kind}`}>
              <h3 className="text-lg font-bold">{editor.id ? 'Edit' : 'New'} {editor.kind}</h3>
              <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
                {editor.kind !== 'exam' && <label className="text-sm sm:col-span-2" htmlFor={`${formId}-name`}>Name<input id={`${formId}-name`} autoFocus required maxLength={editor.kind === 'semester' ? 120 : 180} className={inputClass} value={editor.name} onChange={(e) => setField('name', e.target.value)} placeholder={editor.kind === 'semester' ? 'Year 3 · Semester 2' : 'Human Skin System and Connective Tissues'} /></label>}
                {editor.kind === 'semester' && <>{(['startsAt', 'endsAt'] as const).map((field) => <label key={field} className="text-sm" htmlFor={`${formId}-${field}`}>{field === 'startsAt' ? 'Start date (optional)' : 'End date (optional)'}<input id={`${formId}-${field}`} type="date" className={inputClass} value={editor[field]} onChange={(e) => setField(field, e.target.value)} /></label>)}</>}
                {editor.kind === 'course' && <>
                  <label className="text-sm" htmlFor={`${formId}-code`}>Course code<input id={`${formId}-code`} required maxLength={40} className={inputClass} value={editor.code} onChange={(e) => setField('code', e.target.value)} placeholder="HSC" /></label>
                  <label className="text-sm" htmlFor={`${formId}-semester`}>Semester<select id={`${formId}-semester`} className={inputClass} value={editor.semesterId} onChange={(e) => setField('semesterId', e.target.value)} required>{data.semesters.map((s) => <option key={s.id} value={s.id}>{s.name}{s.archivedAt ? ' (archived)' : ''}</option>)}</select></label>
                  <label className="text-sm sm:col-span-2" htmlFor={`${formId}-canvas`}>Canvas course link (optional)<input id={`${formId}-canvas`} type="url" className={inputClass} value={editor.canvasUrl} onChange={(e) => setField('canvasUrl', e.target.value)} placeholder="https://mango-cmu.instructure.com/courses/31469" /><span className="mt-1 block text-xs text-neutral-500">Use a course in your connected Canvas instance. Leave blank to keep a course without grade sync.</span></label>
                  <label className="text-sm sm:col-span-2" htmlFor={`${formId}-notebook`}>NotebookLM link (optional)<input id={`${formId}-notebook`} type="url" className={inputClass} value={editor.notebookUrl} onChange={(e) => setField('notebookUrl', e.target.value)} placeholder="https://notebook.google.com/notebook/…" /></label>
                </>}
                {editor.kind === 'exam' && <>
                  <label className="text-sm sm:col-span-2" htmlFor={`${formId}-title`}>Exam title<input id={`${formId}-title`} autoFocus required maxLength={180} className={inputClass} value={editor.title} onChange={(e) => setField('title', e.target.value)} /></label>
                  <label className="text-sm sm:col-span-2" htmlFor={`${formId}-time`}>Date & time · Bangkok (UTC+7)<input id={`${formId}-time`} type="datetime-local" required className={inputClass} value={editor.scheduledAt} onChange={(e) => setField('scheduledAt', e.target.value)} /><span className="mt-1 block text-xs text-neutral-500">Your countdowns and reminders will use this time, including when you travel.</span></label>
                </>}
              </fieldset>
              <div className="flex gap-2"><button type="submit" disabled={busy} className="rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-sm font-bold text-black disabled:opacity-50">{busy ? 'Saving…' : 'Save changes'}</button><button type="button" disabled={busy} className={buttonClass} onClick={() => setEditor(null)}>Cancel</button></div>
            </form>}
            {pendingDelete && <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5"><p className="text-sm font-bold">Delete {pendingDelete.label}?</p><p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{pendingDelete.kind === 'semester' ? 'This deletes its courses and exam dates. Archive the semester instead to keep them.' : pendingDelete.kind === 'course' ? 'This also deletes its exam dates. The original Canvas course and NotebookLM notebook are unaffected.' : 'This removes the exam and its future reminders.'}</p><div className="mt-3 flex gap-2"><button disabled={busy} className={`${buttonClass} text-red-600 dark:text-red-400`} onClick={() => void write('DELETE', pendingDelete, 'Deleted.')} >Delete {pendingDelete.kind}</button><button disabled={busy} className={buttonClass} onClick={() => setPendingDelete(null)}>Keep it</button></div></div>}
            {selected && <>
              <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
                <h3 className="break-words text-xl font-bold">{selected.name}</h3>
                <p className="mt-1 text-xs text-neutral-500">{selected.startsAt ? bangkokInputValue(selected.startsAt).slice(0, 10) : 'Start date not set'} → {selected.endsAt ? bangkokInputValue(selected.endsAt).slice(0, 10) : 'End date not set'} · Bangkok</p>
                <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} className={buttonClass} onClick={() => editSemester(selected)}>Edit semester</button><button disabled={busy} className={buttonClass} onClick={() => void write('PATCH', { kind: 'semester', id: selected.id, name: selected.name, startsAt: selected.startsAt, endsAt: selected.endsAt, archived: !selected.archivedAt }, selected.archivedAt ? 'Semester restored to your active agenda.' : 'Semester archived. Courses and exams are safely retained.')}>{selected.archivedAt ? 'Restore semester' : 'Archive semester'}</button><button disabled={busy} className={buttonClass} onClick={() => { setEditor(null); setPendingDelete({ kind: 'semester', id: selected.id, label: selected.name }); }}>Delete</button></div>
              </div>
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold uppercase tracking-widest">Courses</h3><button disabled={busy} className={buttonClass} onClick={() => editCourse()}>+ Add course</button></div>
              {selected.courses.map((course) => <article key={course.id} className="space-y-4 rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-bold tracking-widest text-[var(--accent-primary)]">{course.code}</p><h4 className="mt-1 break-words font-bold">{course.name}</h4></div><div className="flex gap-2"><button disabled={busy} className={buttonClass} aria-label={`Edit ${course.code}`} onClick={() => editCourse(course)}>Edit</button><button disabled={busy} className={buttonClass} aria-label={`Delete ${course.code}`} onClick={() => { setEditor(null); setPendingDelete({ kind: 'course', id: course.id, label: course.code }); }}>Delete</button></div></div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">{course.canvasUrl ? <a className="underline underline-offset-4" href={course.canvasUrl} target="_blank" rel="noopener noreferrer">Open Canvas ↗</a> : <span className="text-neutral-500">No Canvas link</span>}{course.notebookUrl ? <a className="underline underline-offset-4" href={course.notebookUrl} target="_blank" rel="noopener noreferrer">Open NotebookLM ↗</a> : <span className="text-neutral-500">No notebook link</span>}</div>
                <div className="border-t border-black/10 pt-4 dark:border-white/10"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Exam dates</span><button disabled={busy} className={buttonClass} aria-label={`Add exam for ${course.code}`} onClick={() => editExam(course)}>+ Add exam</button></div>{course.exams.length ? <ul className="mt-3 space-y-3">{course.exams.map((exam) => <li key={exam.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><div><p className="font-semibold">{exam.title}</p><p className="text-xs text-neutral-500 dark:text-neutral-400">{formatExamDate(exam.scheduledAt)} · Bangkok</p></div><div className="flex gap-2"><button disabled={busy} className={buttonClass} aria-label={`Edit ${course.code} ${exam.title}`} onClick={() => editExam(course, exam)}>Edit</button><button disabled={busy} className={buttonClass} aria-label={`Delete ${course.code} ${exam.title}`} onClick={() => { setEditor(null); setPendingDelete({ kind: 'exam', id: exam.id, label: `${course.code} ${exam.title}` }); }}>Delete</button></div></li>)}</ul> : <p className="mt-3 text-xs text-neutral-500">No exams scheduled.</p>}</div>
              </article>)}
              {!selected.courses.length && <p className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-neutral-500 dark:border-white/15">Add your first course, then connect its resources and exam dates.</p>}
            </>}
          </div>
        </div>
      </>}
    </section>
  );
}
