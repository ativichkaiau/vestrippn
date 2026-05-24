import type { Metadata } from 'next';
import QuestionCard from '@/components/w08/QuestionCard';

export const metadata: Metadata = { title: 'Learn · IELTS Practice' };

// Phase A shell — no question data fetching (Phase C).
export default function IeltsPracticePage() {
  return (
    <main className="min-h-screen bg-[var(--w08-bg)] px-5 py-8 text-[color:var(--w08-text)]">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">IELTS Practice</h1>
        <p className="mt-1 text-sm text-[color:var(--w08-text-muted)]">
          Practice flow — shell only. Question data fetching ships in Phase C.
        </p>

        <div className="mt-6">
          <QuestionCard
            number={1}
            prompt="Choose the word closest in meaning to “mitigate”."
            options={[
              { id: 'a', label: 'Intensify' },
              { id: 'b', label: 'Alleviate' },
              { id: 'c', label: 'Postpone' },
              { id: 'd', label: 'Ignore' },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
