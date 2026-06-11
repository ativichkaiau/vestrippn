'use client';

import { useState } from 'react';

export type CaseStep = { id: string; label: string };

export type CaseStepperProps = {
  steps: CaseStep[];
  /** Controlled active index; omit for uncontrolled (internal state). */
  current?: number;
  onStep?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
};

/**
 * Clinical Cases progress stepper. Uncontrolled by default; pass `current` +
 * `onStep` to control. Presentational — owns no case data.
 */
export default function CaseStepper({
  steps,
  current,
  onStep,
  orientation = 'horizontal',
}: CaseStepperProps) {
  const [internal, setInternal] = useState(0);
  const active = current ?? internal;
  const isVertical = orientation === 'vertical';

  const go = (i: number) => {
    if (i < 0 || i >= steps.length) return;
    if (onStep) onStep(i);
    else setInternal(i);
  };

  return (
    <ol className={`flex ${isVertical ? 'flex-col gap-2' : 'items-center gap-2'} [font-family:var(--w09-font-display)]`}>
      {steps.map((step, i) => {
        const done = i < active;
        const isActive = i === active;
        const last = i === steps.length - 1;

        return (
          <li
            key={step.id}
            className={`flex gap-2 ${isVertical ? 'items-start' : 'items-center'} ${!isVertical && !last ? 'flex-1' : ''}`}
          >
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={isActive ? 'step' : undefined}
              className="flex items-center gap-2 text-left"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors duration-[var(--w09-motion-duration)] ${
                  isActive
                    ? 'border-[color:var(--w09-accent-primary)] bg-[var(--w09-accent-primary)] text-[color:var(--w09-accent-contrast)]'
                    : done
                    ? 'border-[color:var(--w09-accent-primary)] bg-[var(--w09-surface-raised)] text-[color:var(--w09-accent-primary)]'
                    : 'border-[color:var(--w09-border)] bg-[var(--w09-bg)] text-[color:var(--w09-text-muted)]'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-sm font-medium ${
                  isActive ? 'text-[color:var(--w09-text)]' : 'text-[color:var(--w09-text-muted)]'
                }`}
              >
                {step.label}
              </span>
            </button>

            {!last && (
              <span
                aria-hidden
                className={`block bg-[color:var(--w09-border)] ${isVertical ? 'ml-4 h-4 w-px' : 'h-px min-w-4 flex-1'} ${
                  done ? 'opacity-100' : 'opacity-50'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
