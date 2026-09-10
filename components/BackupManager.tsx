'use client';

import { useEffect, useRef, useState } from 'react';
import { BACKUP_MAX_BYTES, validateBackup, type BackupPayload } from '@/lib/backup';
import { readFocusLog } from '@/lib/study-log';
import { getLivery, getMode } from '@/lib/theme';
import { SYNC_REQUEST_EVENT, SYNC_STATUS_EVENT, type SyncStatus } from '@/lib/device-sync';
import { getSyncStatus } from './DeviceSync';

const buttonClass = 'rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-black/5 disabled:cursor-wait disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10';

function localPreferences() {
  let lowPower = false;
  try { lowPower = localStorage.getItem('vest_lowpower') === '1'; } catch { /* best effort */ }
  return { livery: getLivery(), mode: getMode(), lowPower };
}

function mergeLocalFocus(payload: BackupPayload): BackupPayload {
  const merged = new Map(payload.focusSessions.map((session) => [session.id, session]));
  for (const session of readFocusLog()) {
    if (!session.id) continue;
    merged.set(session.id, { ...session, id: session.id });
  }
  return { ...payload, focusSessions: [...merged.values()].sort((a, b) => a.ts - b.ts).slice(-10_000), preferences: { ...payload.preferences, ...localPreferences() } };
}

function countRecords(payload: BackupPayload) {
  return payload.tasks.length + payload.milestones.length + payload.notes.length + payload.papers.length + payload.documents.length + payload.semesters.length + payload.semesters.reduce((sum, semester) => sum + semester.courses.length + semester.courses.reduce((courseSum, course) => courseSum + course.exams.length, 0), 0) + payload.planDays.length + payload.focusSessions.length;
}

export default function BackupManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<SyncStatus>(() => getSyncStatus());
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [preview, setPreview] = useState<{ payload: BackupPayload; fileName: string; bytes: number } | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const update = (event: Event) => setStatus((event as CustomEvent<SyncStatus>).detail);
    window.addEventListener(SYNC_STATUS_EVENT, update);
    return () => window.removeEventListener(SYNC_STATUS_EVENT, update);
  }, []);

  const [localCount, setLocalCount] = useState(() => readFocusLog().length);

  useEffect(() => {
    const refresh = () => setLocalCount(readFocusLog().length);
    window.addEventListener('vest:focus-log-change', refresh);
    return () => window.removeEventListener('vest:focus-log-change', refresh);
  }, []);

  async function exportBackup() {
    setBusy('export'); setError(''); setNotice('');
    try {
      const response = await fetch('/api/backup', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not create your backup.');
      const merged = mergeLocalFocus(validateBackup(payload));
      const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vestrippn-w85-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice(`Backup downloaded with ${countRecords(merged)} records.`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create your backup.'); }
    finally { setBusy(null); }
  }

  async function readFile(file: File) {
    setError(''); setNotice(''); setPreview(null);
    if (file.size > BACKUP_MAX_BYTES) { setError('That backup is too large. Choose a file under 8 MB.'); return; }
    try {
      const payload = validateBackup(JSON.parse(await file.text()));
      setPreview({ payload, fileName: file.name, bytes: file.size });
    } catch (err) { setError(err instanceof Error ? err.message : 'That file is not a valid VESTRIPPN backup.'); }
  }

  async function restoreBackup() {
    if (!preview) return;
    setBusy('import'); setError(''); setNotice('');
    try {
      const response = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preview.payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not restore your backup.');
      setPreview(null);
      setNotice(`Restored ${result.imported ?? countRecords(preview.payload)} records. Existing data was kept and matching records were updated.`);
      window.dispatchEvent(new Event(SYNC_REQUEST_EVENT));
      window.dispatchEvent(new Event('vest:focus-log-change'));
      window.dispatchEvent(new Event('vest:curriculum-changed'));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not restore your backup.'); }
    finally { setBusy(null); }
  }

  return (
    <div className="space-y-6">
      <section className="w85-panel-accent rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div><h2 className="text-2xl font-black">Backup & device sync</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">Your account is the source of truth for courses, tasks, notes, saved papers, plan budgets, and focus history. This browser keeps an offline copy of the latest focus sessions so a connection drop does not erase a run.</p></div>
          <div className="rounded-xl border border-black/10 px-3 py-2 text-right text-xs dark:border-white/10"><p className="font-black uppercase tracking-widest text-neutral-400">Sync status</p><p className="mt-1 font-bold">{status.message}</p>{status.lastSync && <p className="mt-1 text-neutral-500">Last sync {status.lastSync}</p>}</div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10"><p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Focus history</p><p className="mt-2 text-2xl font-black">{localCount}</p><p className="mt-1 text-xs text-neutral-500">local sessions ready to carry</p></div>
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10"><p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Preferences</p><p className="mt-2 text-2xl font-black">Live</p><p className="mt-1 text-xs text-neutral-500">livery, day/night, low-power</p></div>
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10"><p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Backup format</p><p className="mt-2 text-2xl font-black">W85</p><p className="mt-1 text-xs text-neutral-500">versioned and portable</p></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="rounded-xl bg-[var(--hub-accent)] px-4 py-2.5 text-sm font-black text-black transition hover:-translate-y-0.5 disabled:opacity-50" onClick={() => void exportBackup()} disabled={busy !== null}>{busy === 'export' ? 'Preparing…' : 'Download backup'}</button>
          <button type="button" className={buttonClass} onClick={() => inputRef.current?.click()} disabled={busy !== null}>Choose backup to restore</button>
          <input ref={inputRef} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void readFile(file); event.currentTarget.value = ''; }} />
        </div>
      </section>
      {error && <div role="alert" className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm">{notice}</p>}
      {preview && <section className="rounded-2xl border border-[var(--hub-accent)]/40 bg-[var(--hub-accent)]/5 p-5 sm:p-7"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--hub-accent)]">Restore preview</p><h3 className="mt-2 text-xl font-black break-words">{preview.fileName}</h3><p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{(preview.bytes / 1024).toFixed(1)} KB · {countRecords(preview.payload)} records · preferences and focus history included</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" className="rounded-xl bg-[var(--hub-accent)] px-4 py-2.5 text-sm font-black text-black disabled:opacity-50" onClick={() => void restoreBackup()} disabled={busy !== null}>{busy === 'import' ? 'Restoring…' : 'Restore this backup'}</button><button type="button" className={buttonClass} onClick={() => setPreview(null)} disabled={busy !== null}>Cancel</button></div></section>}
      <p className="text-xs leading-5 text-neutral-500">Backups exclude sign-in credentials and authentication tokens. Archive document metadata is included; original files remain wherever you first stored them.</p>
    </div>
  );
}
