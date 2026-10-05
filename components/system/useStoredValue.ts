'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/* Browser-storage values without a mount effect.

   `useStoredValue(read, fallback, events)` subscribes to `storage` and the
   named window events and re-reads with `read()`. The store snapshot is the
   value's JSON, so an unchanged value never re-renders, and the server
   render (and hydration) uses `fallback`. `read` and `fallback` must be
   stable: module-level functions and constants. */

const SERVER = '\u0000server';

export function useStoredValue<T>(read: () => T, fallback: T, events: readonly string[] = []): T {
  const eventKey = events.join('|');
  const subscribe = useCallback(
    (onChange: () => void) => {
      const names = ['storage', ...(eventKey ? eventKey.split('|') : [])];
      names.forEach((name) => window.addEventListener(name, onChange));
      return () => names.forEach((name) => window.removeEventListener(name, onChange));
    },
    [eventKey],
  );
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return JSON.stringify(read()) ?? SERVER;
      } catch {
        return SERVER;
      }
    },
    () => SERVER,
  );
  return useMemo(() => (raw === SERVER ? fallback : (JSON.parse(raw) as T)), [raw, fallback]);
}

/** A JSON value kept in localStorage under `key`, with a setter. */
export function writeStored(key: string, value: unknown, event: string): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: nothing to persist */
  }
  window.dispatchEvent(new Event(event));
}
