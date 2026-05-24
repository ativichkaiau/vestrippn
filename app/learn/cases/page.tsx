import type { Metadata } from 'next';
import CaseStepper from '@/components/w08/CaseStepper';

export const metadata: Metadata = { title: 'Learn · Clinical Cases' };

// Phase A shell — no case data / player logic (Phase C).
export default function CasesPage() {
  const steps = [
    { id: 'presentation', label: 'Presentation' },
    { id: 'history', label: 'History' },
    { id: 'exam', label: 'Examination' },
    { id: 'investigations', label: 'Investigations' },
    { id: 'diagnosis', label: 'Diagnosis' },
  ];

  return (
    <main className="min-h-screen bg-[var(--w08-bg)] px-5 py-8 text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">Clinical Cases</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">
          Case browser &amp; player — shell only. Case data ships in Phase C.
        </p>

        {/* Browser placeholder */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-4 shadow-[var(--w08-shadow)]"
            >
              <div className="text-sm font-semibold text-[color:var(--w08-text)]">Case {n}</div>
              <div className="mt-1 text-xs text-[color:var(--w08-text-muted)]">Awaiting Phase C content</div>
            </div>
          ))}
        </div>

        {/* Player placeholder */}
        <section className="mt-8 rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-6 shadow-[var(--w08-shadow)]">
          <CaseStepper steps={steps} />
          <div className="mt-6 grid min-h-40 place-items-center rounded-[var(--w08-radius)] bg-[var(--w08-surface-raised)] text-sm text-[color:var(--w08-text-muted)]">
            Case player surface
          </div>
        </section>
      </div>
    </main>
  );
}
