'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { launchAgendaFocus, scheduleAgenda, studyDay, type AgendaItem, type StudyPlanResponse } from '@/lib/daily-plan';

const inputClass = 'w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm dark:border-white/15 dark:bg-neutral-950';
const buttonClass = 'rounded-full border border-black/15 px-4 py-2 text-xs font-bold transition-colors hover:bg-black/5 disabled:cursor-wait disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10';
const sourceLabels = { canvas: 'Canvas', anki: 'Anki', task: 'Task', milestone: 'Research' };

async function requestJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please retry.');
  return data;
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function DailyStudyPlan() {
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [budget, setBudget] = useState('120');
  const [selection, setSelection] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [editor, setEditor] = useState<AgendaItem | 'new-task' | 'new-milestone' | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = useCallback(async (resetBudget = false) => {
    const data: StudyPlanResponse = await requestJson('/api/study-plan', 'GET');
    setPlan(data);
    if (resetBudget) setBudget(String(data.availableMinutes));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    requestJson('/api/study-plan', 'GET').then((data: StudyPlanResponse) => {
      if (!active) return;
      setPlan(data); setBudget(String(data.availableMinutes)); setLoading(false);
    }).catch(e => { if (active) { setError(e.message); setLoading(false); } });
    return () => { active = false; };
  }, []);

  // Return from another device/tab, or cross midnight, to a current agenda.
  useEffect(() => {
    const update = () => {
      if (document.visibilityState === 'visible') void refresh(true).catch(e => setError(e.message));
    };
    const interval = setInterval(() => {
      if (plan && plan.day !== studyDay()) update();
    }, 60_000);
    window.addEventListener('focus', update);
    return () => { clearInterval(interval); window.removeEventListener('focus', update); };
  }, [plan, refresh]);

  const selectedIds = useMemo(() => selection ?? plan?.items.filter(item => !item.completed).map(item => item.id) ?? [], [selection, plan]);
  const minutes = Number(budget);
  const validBudget = Number.isInteger(minutes) && minutes >= 5 && minutes <= 720;
  const sessions = useMemo(() => scheduleAgenda(plan?.items ?? [], selectedIds, validBudget ? minutes : 0), [plan, selectedIds, validBudget, minutes]);
  const allocated = sessions.reduce((sum, session) => sum + session.minutes, 0);
  const activeItems = plan?.items.filter(item => !item.completed) ?? [];
  const completedItems = plan?.items.filter(item => item.completed) ?? [];
  const selectedEstimate = activeItems.filter(item => selectedIds.includes(item.id)).reduce((sum, item) => sum + item.estimatedMinutes, 0);

  async function perform(key: string, action: () => Promise<void>) {
    setBusy(key); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Please retry.'); }
    finally { setBusy(null); }
  }

  async function complete(item: AgendaItem) {
    await perform(item.id, async () => {
      if (item.kind === 'task' || item.kind === 'milestone') {
        await requestJson('/api/study-plan/items', 'PATCH', { kind: item.kind, id: item.sourceId, completed: !item.completed });
      } else {
        await requestJson('/api/study-plan', 'PATCH', { day: plan?.day, action: 'complete', id: item.id, completed: !item.completed });
      }
      await refresh();
      setNotice(item.completed ? 'Item returned to your agenda.' : item.kind === 'canvas' ? 'Study work marked done for today. Submit the assignment in Canvas.' : item.kind === 'anki' ? 'Review block marked done for today. Anki sync remains the source of card counts.' : 'Completed and saved.');
    });
  }

  const renderItem = (item: AgendaItem) => {
    const scheduled = sessions.filter(session => session.itemId === item.id);
    const plannedMinutes = scheduled.reduce((sum, session) => sum + session.minutes, 0);
    return (
      <article key={item.id} className="w85-panel-accent rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
        <div className="flex items-start gap-3">
          {!item.completed && <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={event => setSelection(event.target.checked ? [...selectedIds, item.id] : selectedIds.filter(id => id !== item.id))} aria-label={`Include ${item.title} in today's schedule`} className="mt-1 h-4 w-4 shrink-0 accent-[var(--hub-accent)]" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <span>{sourceLabels[item.kind]}</span><span>{item.completed ? 'Done' : item.reason}</span>
            </div>
            <h3 className={`mt-1 break-words text-base font-bold ${item.completed ? 'text-neutral-500' : ''}`}>{item.title}</h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.context}{item.dueAt && ` · ${displayDate(item.dueAt)} ICT`}</p>
            <p className="mt-2 text-xs font-medium">{item.estimatedMinutes} min estimated{!item.completed && ` · ${plannedMinutes ? `${plannedMinutes} min scheduled` : 'Not scheduled'}`}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={`${buttonClass} bg-[var(--hub-accent)] text-black`} onClick={() => launchAgendaFocus(item, scheduled[0]?.minutes ?? Math.min(25, item.estimatedMinutes))}>Focus · {scheduled[0]?.minutes ?? Math.min(25, item.estimatedMinutes)} min</button>
              <button type="button" disabled={busy !== null} className={buttonClass} onClick={() => void complete(item)}>{busy === item.id ? 'Saving…' : item.completed ? 'Undo completion' : item.kind === 'canvas' ? 'Study work done today' : item.kind === 'anki' ? 'Review block done today' : 'Mark complete'}</button>
              {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className={buttonClass}>Open in Canvas ↗</a>}
              {(item.kind === 'task' || item.kind === 'milestone') && <>
                <button type="button" className={buttonClass} onClick={() => setEditor(item)}>Edit</button>
                <button type="button" className={buttonClass} onClick={() => setDeleteId(item.id)}>Delete</button>
              </>}
            </div>
            {deleteId === item.id && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-500/20 p-3 text-xs">
              <span>Delete this {item.kind === 'milestone' ? 'milestone' : 'task'} permanently?</span>
              <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => void perform(item.id, async () => { await requestJson('/api/study-plan/items', 'DELETE', { kind: item.kind, id: item.sourceId }); setDeleteId(null); await refresh(); setNotice('Item deleted.'); })}>Confirm delete</button>
              <button type="button" className={buttonClass} onClick={() => setDeleteId(null)}>Cancel</button>
            </div>}
          </div>
        </div>
      </article>
    );
  };

  return <div className="space-y-6">
    <section className="w85-panel-accent rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Today in Bangkok · {plan?.day ?? 'Loading'}</p><h2 className="mt-2 text-2xl font-black">Make time for what matters.</h2><p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">Deadlines, due reviews, personal tasks, and research in one agenda. Select your work, then give it a time budget.</p></div>
        <button type="button" disabled={busy !== null} className={buttonClass} onClick={() => void perform('refresh', () => refresh(true))}>{busy === 'refresh' ? 'Refreshing…' : 'Refresh sources'}</button>
      </div>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); if (validBudget) void perform('budget', async () => { await requestJson('/api/study-plan', 'PATCH', { day: plan?.day, action: 'budget', availableMinutes: minutes }); await refresh(); setNotice('Today’s time budget saved across devices.'); }); }}>
        <label className="block text-xs font-bold">Available study time (minutes)<input type="number" min={5} max={720} step={1} required value={budget} onChange={event => setBudget(event.target.value)} className={`${inputClass} mt-2 max-w-48`} /></label>
        <button type="submit" disabled={!plan || !validBudget || busy !== null} className={buttonClass}>{busy === 'budget' ? 'Saving…' : 'Save time budget'}</button>
        <div className="flex gap-2">{[30, 60, 120, 240].map(value => <button type="button" key={value} onClick={() => setBudget(String(value))} className={buttonClass}>{value}m</button>)}</div>
      </form>
      <p className="mt-3 text-xs text-neutral-500">{validBudget ? `${allocated} of ${minutes} minutes allocated · ${sessions.length} focus blocks · ${completedItems.length} completed` : 'Enter 5–720 minutes.'}{plan && Number(budget) !== plan.availableMinutes && ' · Unsaved budget preview'}</p>
      <p className="mt-2 text-xs text-neutral-500">Focus blocks are usually 25 minutes. Add breaks between them; breaks are outside your study budget. {selectedEstimate > allocated && `${selectedEstimate - allocated} minutes of selected work remain for later.`}</p>
    </section>

    {error && <div role="alert" className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>}
    {notice && <p role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm">{notice}</p>}
    {loading && <p role="status" className="py-8 text-sm text-neutral-500">Building your agenda…</p>}

    {plan && <>
      <div className="grid gap-3 text-xs sm:grid-cols-2">
        <div className="rounded-xl border border-black/10 p-3 dark:border-white/10"><span className="font-bold">Canvas</span><p className="mt-1 text-neutral-500 dark:text-neutral-400">{plan.canvas.status === 'connected' ? `Active semester deadlines${plan.canvas.syncedAt ? ` · synced ${displayDate(plan.canvas.syncedAt)} ICT` : ''}` : plan.canvas.status === 'partial' ? 'Some courses could not sync. Available deadlines are shown; refresh to retry.' : 'Canvas could not supply current deadlines. Check your connection and active courses, then refresh.'}</p></div>
        <div className="rounded-xl border border-black/10 p-3 dark:border-white/10"><span className="font-bold">Anki</span><p className="mt-1 text-neutral-500 dark:text-neutral-400">{plan.anki.lastSync ? `${plan.anki.due} due · synced ${displayDate(plan.anki.lastSync)} ICT${plan.anki.stale ? ' · Older than 24 hours; sync Anki for current counts.' : ''}` : 'No Anki snapshot yet. Sync from the Academics hub to include due reviews.'}</p></div>
      </div>

      {sessions.length > 0 && <section className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="text-lg font-black">Your focus blocks</h2><p className="mt-1 text-xs text-neutral-500">Urgent work gets the first block. Remaining time is shared across your selected items.</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{sessions.map(session => {
          const item = plan.items.find(entry => entry.id === session.itemId)!;
          return <li key={session.sequence}><button type="button" onClick={() => launchAgendaFocus(item, session.minutes)} className="flex h-full w-full items-start gap-3 rounded-xl border border-black/10 p-3 text-left transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"><span className="font-mono text-xs text-neutral-400">{String(session.sequence).padStart(2, '0')}</span><span className="min-w-0 flex-1"><span className="block break-words text-sm font-bold">{item.title}</span><span className="mt-1 block text-xs text-neutral-500">{session.minutes} min · Set up focus →</span></span></button></li>;
        })}</ol>
      </section>}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Prioritized agenda</h2><p className="text-xs text-neutral-500">Completion in this planner never submits Canvas work or changes Anki cards.</p></div><div className="flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => setEditor('new-task')}>+ Task</button><button type="button" className={buttonClass} onClick={() => setEditor('new-milestone')}>+ Research milestone</button></div></div>
        <div className="flex gap-3 text-xs"><button type="button" className="underline underline-offset-4" onClick={() => setSelection(null)}>Select all pending</button><button type="button" className="underline underline-offset-4" onClick={() => setSelection([])}>Clear selection</button></div>
        {activeItems.length ? activeItems.map(renderItem) : <div className="rounded-2xl border border-dashed border-black/20 p-8 text-center dark:border-white/20"><p className="font-bold">Your agenda is clear.</p><p className="mt-2 text-sm text-neutral-500">Add a task or research milestone, or refresh your connected sources.</p></div>}
      </section>
      {completedItems.length > 0 && <section className="space-y-3"><button type="button" className={buttonClass} aria-expanded={showCompleted} onClick={() => setShowCompleted(!showCompleted)}>{showCompleted ? 'Hide' : 'Show'} completed ({completedItems.length})</button>{showCompleted && completedItems.map(renderItem)}</section>}
    </>}
    {editor && <AgendaEditor key={typeof editor === 'string' ? editor : editor.id} item={editor} onClose={() => setEditor(null)} onSaved={async () => { setEditor(null); await refresh(); setNotice('Agenda item saved.'); }} />}
  </div>;
}

function AgendaEditor({ item, onClose, onSaved }: { item: AgendaItem | 'new-task' | 'new-milestone'; onClose: () => void; onSaved: () => Promise<void> }) {
  const existing = typeof item === 'string' ? null : item;
  const kind = existing?.kind ?? (item === 'new-milestone' ? 'milestone' : 'task');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [dueAt, setDueAt] = useState(existing?.dueAt ? studyDay(new Date(existing.dueAt)) : '');
  const [estimate, setEstimate] = useState(String(existing?.estimatedMinutes ?? (kind === 'milestone' ? 45 : 25)));
  const [priority, setPriority] = useState(String(existing?.priority ?? 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  return <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-labelledby="agenda-editor-title" data-w85-reveal="off">
    <form className="mx-auto my-8 max-w-xl space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-neutral-900" onSubmit={async event => {
      event.preventDefault(); setSaving(true); setError('');
      try {
        await requestJson('/api/study-plan/items', existing ? 'PATCH' : 'POST', { kind, id: existing?.sourceId, title, dueAt: dueAt ? `${dueAt}T23:59:00+07:00` : null, estimatedMinutes: Number(estimate), priority: Number(priority) });
        await onSaved();
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); setSaving(false); }
    }}>
      <h2 id="agenda-editor-title" className="text-xl font-black">{existing ? 'Edit' : 'Add'} {kind === 'milestone' ? 'research milestone' : 'task'}</h2>
      <label className="block text-xs font-bold">Title<input autoFocus required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} className={`${inputClass} mt-2`} /></label>
      <label className="block text-xs font-bold">Due date (optional, Bangkok)<input type="date" value={dueAt} onChange={event => setDueAt(event.target.value)} className={`${inputClass} mt-2`} /></label>
      <label className="block text-xs font-bold">Estimated work (minutes)<input type="number" min={5} max={480} step={1} required value={estimate} onChange={event => setEstimate(event.target.value)} className={`${inputClass} mt-2`} /></label>
      {kind === 'task' && <label className="block text-xs font-bold">Priority<select value={priority} onChange={event => setPriority(event.target.value)} className={`${inputClass} mt-2`}><option value="0">Low</option><option value="1">Normal</option><option value="2">High</option></select></label>}
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      <div className="flex gap-2"><button type="submit" disabled={saving} className={`${buttonClass} bg-[var(--hub-accent)] text-black`}>{saving ? 'Saving…' : 'Save item'}</button><button type="button" disabled={saving} onClick={onClose} className={buttonClass}>Cancel</button></div>
    </form>
  </div>;
}
