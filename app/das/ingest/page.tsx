import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'DAS · Ingestion' };

// Phase A shell — no upload / parsing pipeline (Phase B).
export default function DasIngestPage() {
  return (
    <main className="min-h-screen bg-[var(--w08-bg)] px-5 py-8 text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">DAS · Ingestion</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">
          Source ingestion — shell only. Upload &amp; parsing pipeline ships in Phase B.
        </p>

        <div className="mt-6 grid place-items-center rounded-[var(--w08-radius)] border border-dashed border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-12 text-center shadow-[var(--w08-shadow)]">
          <p className="text-sm font-medium text-[color:var(--w08-text)]">Drop sources here</p>
          <p className="mt-1 text-xs text-[color:var(--w08-text-muted)]">Disabled in Phase A</p>
        </div>
      </div>
    </main>
  );
}
