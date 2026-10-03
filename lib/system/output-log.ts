'use client';

/* The Output panel's log: what the environment did this session (routes,
   sync, theme, notifications, terminal). A small ring buffer with a
   subscribable snapshot; nothing leaves the browser. */

export type OutputChannel = 'system' | 'nav' | 'sync' | 'theme' | 'toast' | 'terminal';
export type OutputLine = { id: number; at: number; channel: OutputChannel; text: string };

const LIMIT = 300;
const EMPTY: OutputLine[] = [];
let lines: OutputLine[] = EMPTY;
let seq = 0;
const listeners = new Set<() => void>();

export function logOutput(channel: OutputChannel, text: string): void {
  const line = { id: ++seq, at: Date.now(), channel, text: text.slice(0, 500) };
  lines = [...lines.slice(-(LIMIT - 1)), line];
  listeners.forEach((listener) => listener());
}

export function clearOutput(): void {
  lines = EMPTY;
  listeners.forEach((listener) => listener());
}

export function subscribeOutput(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getOutputSnapshot = () => lines;
export const serverOutputSnapshot = () => EMPTY;
