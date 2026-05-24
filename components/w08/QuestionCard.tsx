'use client';

import { useState, type ReactNode } from 'react';

export type QuestionOption = { id: string; label: ReactNode };
export type QuestionStatus = 'idle' | 'answered';

export type QuestionCardProps = {
  prompt: ReactNode;
  options: QuestionOption[];
  /** Controlled selection; omit for uncontrolled (internal state). */
  selectedId?: string;
  /** When provided + status==='answered', enables correct/incorrect styling. */
  correctId?: string;
  status?: QuestionStatus;
  onSelect?: (id: string) => void;
  number?: number;
  disabled?: boolean;
};

/**
 * IELTS practice question. Works uncontrolled out of the box (tracks its own
 * selection) or controlled when `selectedId`/`onSelect` are supplied.
 * Holds no question data — content is passed in.
 */
export default function QuestionCard({
  prompt,
  options,
  selectedId,
  correctId,
  status = 'idle',
  onSelect,
  number,
  disabled = false,
}: QuestionCardProps) {
  const [internal, setInternal] = useState<string | undefined>(undefined);
  const selected = selectedId ?? internal;
  const answered = status === 'answered';

  const choose = (id: string) => {
    if (disabled || answered) return;
    if (onSelect) onSelect(id);
    else setInternal(id);
  };

  return (
    <div className="rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface)] p-5 shadow-[var(--w08-shadow)] [font-family:var(--w08-font-display)]">
      <div className="mb-4 flex items-start gap-3">
        {number != null && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--w08-accent-primary)] text-xs font-bold text-[color:var(--w08-accent-contrast)]">
            {number}
          </span>
        )}
        <p className="font-medium leading-relaxed text-[color:var(--w08-text)]">{prompt}</p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSel = selected === opt.id;
          const isCorrect = answered && correctId === opt.id;
          const isWrong = answered && isSel && correctId != null && correctId !== opt.id;

          const stateBorder = isCorrect
            ? 'border-[color:var(--w08-success)]'
            : isWrong
            ? 'border-[color:var(--w08-danger)]'
            : isSel
            ? 'border-[color:var(--w08-accent-primary)]'
            : 'border-[color:var(--w08-border)]';

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => choose(opt.id)}
              aria-pressed={isSel}
              disabled={disabled || answered}
              className={`flex w-full items-center gap-3 rounded-[var(--w08-radius)] border px-4 py-3 text-left transition-[background-color,border-color,transform] duration-[var(--w08-motion-duration)] ease-[var(--w08-motion-ease)] active:scale-[0.99] ${stateBorder} ${
                isSel ? 'bg-[var(--w08-surface-raised)]' : 'bg-[var(--w08-bg)] hover:bg-[var(--w08-surface-raised)]'
              }`}
            >
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                  isSel
                    ? 'border-[color:var(--w08-accent-primary)] bg-[var(--w08-accent-primary)]'
                    : 'border-[color:var(--w08-border)]'
                }`}
              />
              <span className="text-sm text-[color:var(--w08-text)]">{opt.label}</span>
              {isCorrect && <span className="ml-auto text-xs font-bold text-[color:var(--w08-success)]">✓</span>}
              {isWrong && <span className="ml-auto text-xs font-bold text-[color:var(--w08-danger)]">✕</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
