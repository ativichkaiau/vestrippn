'use client';

import { useState } from 'react';
import ChatPane from '@/components/w08/ChatPane';
import CitationPopover from '@/components/w08/CitationPopover';
import QuestionCard from '@/components/w08/QuestionCard';
import CaseStepper from '@/components/w08/CaseStepper';

type Livery = 'neutral' | 'monza' | 'esther' | 'senna';

const LIVERIES: { id: Livery; label: string }[] = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'monza', label: 'Monza' },
  { id: 'esther', label: 'Esther Bunny' },
  { id: 'senna', label: 'Senna' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 shadow-[var(--w08-shadow)]">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[color:var(--w08-text-muted)]">{title}</h2>
      {children}
    </section>
  );
}

export default function PreviewClient() {
  const [livery, setLivery] = useState<Livery>('neutral');
  const wrapperClass = livery === 'neutral' ? '' : `w08-${livery}`;

  const steps = [
    { id: 'a', label: 'Presentation' },
    { id: 'b', label: 'History' },
    { id: 'c', label: 'Exam' },
    { id: 'd', label: 'Diagnosis' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 p-6 dark:bg-neutral-950">
      {/* Harness chrome (intentionally NOT contract-themed) */}
      <div className="mx-auto mb-6 flex max-w-5xl flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-bold uppercase tracking-widest text-neutral-500">Livery</span>
        {LIVERIES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLivery(l.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              livery === l.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                : 'bg-white text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Themed surface */}
      <div className={`${wrapperClass} mx-auto max-w-5xl rounded-2xl bg-[var(--w08-bg)] p-6`}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="QuestionCard">
            <QuestionCard
              number={1}
              prompt="Choose the word closest in meaning to “mitigate”."
              options={[
                { id: 'a', label: 'Intensify' },
                { id: 'b', label: 'Alleviate' },
                { id: 'c', label: 'Postpone' },
                { id: 'd', label: 'Ignore' },
              ]}
              selectedId="b"
              correctId="b"
              status="answered"
            />
          </Section>

          <Section title="CaseStepper">
            <CaseStepper steps={steps} current={2} />
          </Section>

          <Section title="CitationPopover">
            <p className="text-sm leading-relaxed text-[color:var(--w08-text)]">
              The primary endpoint is overall survival at 12 months
              <CitationPopover
                label="1"
                citation={{
                  title: 'Protocol v3 — §6.1',
                  source: 'Trial Master File',
                  snippet: 'Primary endpoint: OS at 12 months…',
                  url: '#',
                }}
              />{' '}
              with PFS secondary. Hover the marker.
            </p>
          </Section>

          <Section title="ChatPane">
            <div className="h-80">
              <ChatPane
                isStreaming
                messages={[
                  { id: 'u', role: 'user', content: 'Summarise the dosing schedule.' },
                  {
                    id: 'a',
                    role: 'assistant',
                    content: (
                      <span>
                        Weight-based, 5 mg/kg every 12 hours
                        <CitationPopover
                          label="1"
                          citation={{ title: 'Protocol §4.2', source: 'TMF', snippet: 'Dose = 5 mg/kg q12h…' }}
                        />
                        .
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
