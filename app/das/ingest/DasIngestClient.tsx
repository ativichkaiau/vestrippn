'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Action, Page, PageHeader, Section, StatusIndicator } from '@/components/system/primitives';

/* ~/runtime/assistant/ingest — sources the assistant can answer from.
   PDF, DOCX or pasted text → chunked, embedded (text-embedding-3-small) and
   stored as private vectors. Delete removes a document and its chunks. */

type Source = { id: string; name: string; status: string; sourceType?: string; pages?: number; chunks?: number; addedAt: string };

export default function DasIngestClient() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ids = { title: useId(), file: useId(), text: useId() };

  const loadSources = useCallback(
    () =>
      fetch('/api/das/sources', { cache: 'no-store' })
        .then(async (res) => {
          if (!res.ok) throw new Error(res.status === 401 ? 'Sign in to manage sources.' : `Could not load sources (${res.status})`);
          setSources((await res.json()) as Source[]);
        })
        .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load sources'))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setError('A title is required.');
    if (!file && !text.trim()) return setError('Choose a PDF or DOCX, or paste text.');
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      if (file) form.append('file', file);
      else form.append('text', text);
      const res = await fetch('/api/das/ingest', { method: 'POST', body: form });
      const data = (await res.json().catch(() => null)) as { chunks?: number; error?: string; warning?: string } | null;
      if (!res.ok) throw new Error(data?.error || `Ingest failed (${res.status})`);
      setNotice(`ingested “${title.trim()}”${data?.chunks ? ` · ${data.chunks} chunk${data.chunks === 1 ? '' : 's'}` : ''}${data?.warning ? ` · ${data.warning}` : ''}`);
      setTitle('');
      setText('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      void loadSources();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ingest failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (source: Source) => {
    if (!window.confirm(`Delete “${source.name}” and its chunks? The assistant will no longer answer from it.`)) return;
    setRemoving(source.id);
    setError(null);
    try {
      const res = await fetch(`/api/das/sources?id=${encodeURIComponent(source.id)}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Delete failed (${res.status})`);
      }
      setSources((prev) => prev.filter((item) => item.id !== source.id));
      setNotice(`deleted “${source.name}”`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setRemoving(null);
    }
  };

  const totalChunks = sources.reduce((sum, source) => sum + (source.chunks ?? 0), 0);

  return (
    <Page>
      <PageHeader
        label="runtime / assistant / ingest"
        title="Sources"
        lede="Documents the assistant may answer from. Each is split into passages and embedded privately; answers cite the passage they used."
        meta={[
          { key: 'documents', value: String(sources.length).padStart(2, '0') },
          { key: 'passages', value: String(totalChunks) },
        ]}
        actions={<Action href="/das?mode=sources">ask your sources</Action>}
      />

      <Section id="add" title="add a source" intro="PDF or DOCX up to 15 MB, or paste text. Thai and English both work.">
        <form className="sys-ingest-form" onSubmit={submit}>
          <div className="sys-field">
            <label htmlFor={ids.title}>title</label>
            <input id={ids.title} className="sys-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} placeholder="HCVS-2 summary" />
          </div>
          <div className="sys-field">
            <label htmlFor={ids.file}>file</label>
            <input
              id={ids.file}
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sys-file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="sys-field">
            <label htmlFor={ids.text}>or paste text</label>
            <textarea id={ids.text} className="sys-input" rows={6} value={text} disabled={Boolean(file)} onChange={(e) => setText(e.target.value)} placeholder={file ? 'a file is selected' : 'paste notes, an abstract, a guideline…'} />
          </div>
          {error && <p className="sys-alert" role="alert">{error}</p>}
          {notice && <p className="sys-mono" role="status" style={{ color: 'var(--status-ok)', margin: 0 }}>{notice}</p>}
          <div>
            <button type="submit" className="sys-action" data-variant="primary" disabled={busy}>
              {busy ? 'ingesting…' : 'ingest'}
            </button>
          </div>
        </form>
      </Section>

      <Section id="sources" title="sources" count={String(sources.length).padStart(2, '0')}>
        {loading ? (
          <div className="sys-skel-group" aria-busy="true" aria-label="Loading sources">
            {[0, 1, 2].map((i) => <span key={i} className="sys-skel" style={{ height: 44 }} />)}
          </div>
        ) : sources.length === 0 ? (
          <p className="sys-empty">no sources yet — add one above.</p>
        ) : (
          <div className="sys-registry-wrap">
            <table className="sys-registry">
              <caption className="sys-visually-hidden">Ingested sources</caption>
              <thead>
                <tr>
                  <th scope="col">source</th>
                  <th scope="col" className="sys-optional">type</th>
                  <th scope="col">passages</th>
                  <th scope="col" className="sys-optional">added</th>
                  <th scope="col"><span className="sys-visually-hidden">actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id}>
                    <td className="sys-cell-name">
                      {source.name}
                      <small>
                        <StatusIndicator state={source.status === 'ready' ? 'active' : 'experimental'} label={source.status} />
                        {source.pages ? ` · ${source.pages} pages` : ''}
                      </small>
                    </td>
                    <td className="sys-cell-mono sys-optional">{source.sourceType ?? '—'}</td>
                    <td className="sys-cell-mono">{source.chunks ?? '—'}</td>
                    <td className="sys-cell-mono sys-optional">{new Date(source.addedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="sys-cell-go">
                      <button type="button" className="sys-command sys-danger" disabled={removing === source.id} onClick={() => void remove(source)} aria-label={`Delete ${source.name}`}>
                        {removing === source.id ? 'deleting…' : 'delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </Page>
  );
}
