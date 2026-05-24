'use client';

import { useState, type ReactNode } from 'react';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = { id: string; role: ChatRole; content: ReactNode };

export type ChatPaneProps = {
  messages?: ChatMessage[];
  /** Visual streaming indicator only — no transport logic lives here (Phase B). */
  isStreaming?: boolean;
  placeholder?: string;
  /** When omitted the composer is inert; Phase B wires the transport. */
  onSend?: (text: string) => void;
  disabled?: boolean;
};

/**
 * DAS chat surface. Renders a message list + composer and supports a streaming
 * indicator. Intentionally transport-agnostic: it never fetches or mutates —
 * callers own message state and `onSend`.
 */
export default function ChatPane({
  messages = [],
  isStreaming = false,
  placeholder = 'Ask DAS…',
  onSend,
  disabled = false,
}: ChatPaneProps) {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled || !onSend) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] [font-family:var(--w08-font-display)]">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <p className="py-10 text-center text-sm text-[color:var(--w08-text-muted)]">
            No messages yet.
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed rounded-[var(--w08-radius)] ${
                m.role === 'user'
                  ? 'bg-[var(--w08-accent-primary)] text-[color:var(--w08-accent-contrast)]'
                  : 'bg-[var(--w08-surface-raised)] text-[color:var(--w08-text)] border border-[color:var(--w08-border)]'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-[var(--w08-radius)] bg-[var(--w08-surface-raised)] border border-[color:var(--w08-border)]">
              <span className="inline-flex gap-1" aria-label="Assistant is responding">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--w08-accent-primary)] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--w08-accent-primary)] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--w08-accent-primary)] animate-bounce" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[color:var(--w08-border)] bg-[var(--w08-surface-raised)]">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 resize-none rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-bg)] px-3 py-2 text-sm text-[color:var(--w08-text)] placeholder:text-[color:var(--w08-text-muted)] outline-none transition-shadow duration-[var(--w08-motion-duration)] focus-visible:ring-2 focus-visible:ring-[color:var(--w08-focus-ring)] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !draft.trim() || !onSend}
            className="shrink-0 rounded-[var(--w08-radius)] bg-[var(--w08-accent-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--w08-accent-contrast)] transition-[opacity,transform] duration-[var(--w08-motion-duration)] ease-[var(--w08-motion-ease)] active:scale-95 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
