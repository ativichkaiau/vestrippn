'use client';

import { useEffect, useRef, useState } from 'react';

type Source = { id: string; name: string; status: string; pages?: number; addedAt: string };

export default function DasIngestClient() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadSources = async () => {
    try {
      const res = await fetch('/api/das/sources');
      if (!res.ok) throw new Error(`Failed to load sources (${res.status})`);
      setSources((await res.json()) as Source[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const submit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!file && !text.trim()) {
      setError('Provide a PDF/DOCX file or paste text');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      if (file) fd.append('file', file);
      else fd.append('text', text);

      const res = await fetch('/api/das/ingest', { method: 'POST', body: fd });
      const data = (await res.json().catch(() => null)) as
        | { chunks?: number; error?: string; warning?: string }
        | null;
      if (!res.ok) throw new Error(data?.error || `Ingestion failed (${res.status})`);

      setNotice(`Ingested “${title.trim()}”${data?.chunks ? ` · ${data.chunks} chunks` : ''}${data?.warning ? ` · ${data.warning}` : ''}`);
      setTitle('');
      setText('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      loadSources();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ingestion failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--w08-bg)] px-5 py-8 text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">DAS · Ingestion</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">
          Add a PDF or DOCX (or paste text) to ground DAS chat answers.
        </p>

        {/* Upload form */}
        <div className="mt-6 space-y-3 rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 shadow-[var(--w08-shadow)]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Source title"
            className="w-full rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-bg)] px-3 py-2 text-sm text-[color:var(--w08-text)] placeholder:text-[color:var(--w08-text-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--w08-focus-ring)]"
          />
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[color:var(--w08-text-muted)] file:mr-3 file:rounded-[var(--w08-radius)] file:border-0 file:bg-[var(--w08-accent-primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--w08-accent-contrast)]"
          />
          {!file && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="…or paste raw text"
              className="w-full resize-y rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-bg)] px-3 py-2 text-sm text-[color:var(--w08-text)] placeholder:text-[color:var(--w08-text-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--w08-focus-ring)]"
            />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={busy}
              className="rounded-[var(--w08-radius)] bg-[var(--w08-accent-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--w08-accent-contrast)] transition-opacity duration-[var(--w08-motion-duration)] active:scale-95 disabled:opacity-50"
            >
              {busy ? 'Ingesting…' : 'Ingest source'}
            </button>
            {notice && <span className="text-xs text-[color:var(--w08-success)]">{notice}</span>}
            {error && <span className="text-xs text-[color:var(--w08-danger)]">{error}</span>}
          </div>
        </div>

        {/* Sources list */}
        <h2 className="mt-8 mb-3 text-xs font-bold uppercase tracking-widest text-[color:var(--w08-text-muted)]">Sources</h2>
        {loading ? (
          <p className="text-sm text-[color:var(--w08-text-muted)]">Loading…</p>
        ) : sources.length === 0 ? (
          <p className="text-sm text-[color:var(--w08-text-muted)]">No sources yet.</p>
        ) : (
          <ul className="space-y-2">
            {sources.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] px-4 py-3 shadow-[var(--w08-shadow)]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[color:var(--w08-text)]">{s.name}</div>
                  <div className="text-xs text-[color:var(--w08-text-muted)]">
                    {s.status}
                    {s.pages != null ? ` · ${s.pages} pages` : ''} · {new Date(s.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
