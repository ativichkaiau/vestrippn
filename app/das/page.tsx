import type { Metadata } from 'next';
import ChatPane from '@/components/w08/ChatPane';
import CitationPopover from '@/components/w08/CitationPopover';

export const metadata: Metadata = { title: 'DAS · Chat' };

// Phase A shell — no chat transport (Phase B).
export default function DasChatPage() {
  return (
    <main className="flex h-screen flex-col bg-[var(--w08-bg)] text-[color:var(--w08-text)]">
      <header className="border-b border-[color:var(--w08-border)] px-5 py-4">
        <h1 className="text-lg font-bold [font-family:var(--w08-font-display)]">DAS · Chat</h1>
        <p className="text-sm text-[color:var(--w08-text-muted)]">
          Document Assistant — shell only. Chat logic ships in Phase B.
        </p>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 min-h-0 p-4">
        <ChatPane
          disabled
          placeholder="Chat transport arrives in Phase B"
          messages={[
            { id: 'u1', role: 'user', content: 'What does the protocol say about the primary endpoint?' },
            {
              id: 'a1',
              role: 'assistant',
              content: (
                <span>
                  The primary endpoint is overall survival at 12 months
                  <CitationPopover
                    label="1"
                    citation={{
                      title: 'Protocol v3 — §6.1 Endpoints',
                      source: 'Trial Master File',
                      snippet: 'Primary endpoint: OS at 12 months from randomisation…',
                    }}
                  />{' '}
                  with PFS as a key secondary
                  <CitationPopover
                    label="2"
                    citation={{
                      title: 'Protocol v3 — §6.2',
                      source: 'Trial Master File',
                      snippet: 'Secondary: progression-free survival, ORR…',
                    }}
                  />
                  .
                </span>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}
