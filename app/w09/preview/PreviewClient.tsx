'use client';

import ThemeToggle from '../../../components/ThemeToggle';
import ChatPane from '../../../components/w09/ChatPane';
import CitationPopover from '../../../components/w09/CitationPopover';
import QuestionCard from '../../../components/w09/QuestionCard';
import CaseStepper from '../../../components/w09/CaseStepper';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--w09-radius)] border border-[color:var(--w09-border)] bg-[var(--w09-surface)] p-5 shadow-[var(--w09-shadow)]">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">{title}</h2>
      {children}
    </section>
  );
}

export default function PreviewClient() {
  const steps = [
    { id: 'a', label: 'Presentation' },
    { id: 'b', label: 'History' },
    { id: 'c', label: 'Exam' },
    { id: 'd', label: 'Diagnosis' },
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-[var(--w09-bg)] p-6 text-[color:var(--w09-text)]">
      <div className="mx-auto mb-6 flex max-w-5xl flex-wrap items-center gap-2">
        <span className="mr-auto text-xs font-bold uppercase tracking-widest text-[color:var(--w09-text-muted)]">W85 · Component materials</span>
        <ThemeToggle />
      </div>

      {/* Themed surface */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-[var(--w09-bg)] p-6">
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
            <p className="text-sm leading-relaxed text-[color:var(--w09-text)]">
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
