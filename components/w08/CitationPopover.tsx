'use client';

import { useId, useRef, useState } from 'react';

export type Citation = {
  title: string;
  source?: string;
  url?: string;
  snippet?: string;
};

export type CitationPopoverProps = {
  label?: string | number;
  citation: Citation;
};

/**
 * Inline citation marker for DAS chat. Hover or click to reveal the source.
 * Presentational only — the caller supplies the resolved citation.
 */
export default function CitationPopover({ label = 1, citation }: CitationPopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <span
      className="relative inline-block align-baseline"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="align-super text-[0.7em] font-bold leading-none px-1 py-0.5 rounded-[calc(var(--w08-radius)/3)] border border-[color:var(--w08-border)] bg-[var(--w08-surface-raised)] text-[color:var(--w08-accent-primary)] transition-colors duration-[var(--w08-motion-duration)] hover:bg-[var(--w08-accent-primary)] hover:text-[color:var(--w08-accent-contrast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--w08-focus-ring)]"
      >
        {label}
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute left-0 top-full z-50 mt-1.5 block w-64 p-3 text-left rounded-[var(--w08-radius)] border border-[color:var(--w08-border)] bg-[var(--w08-surface-raised)] shadow-[var(--w08-shadow)] [font-family:var(--w08-font-display)]"
        >
          <span className="block text-sm font-semibold text-[color:var(--w08-text)]">{citation.title}</span>
          {citation.source && (
            <span className="mt-0.5 block text-xs text-[color:var(--w08-text-muted)]">{citation.source}</span>
          )}
          {citation.snippet && (
            <span className="mt-2 block text-xs leading-relaxed text-[color:var(--w08-text)] opacity-90">
              {citation.snippet}
            </span>
          )}
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-[color:var(--w08-accent-primary)] hover:underline"
            >
              Open source →
            </a>
          )}
        </span>
      )}
    </span>
  );
}
