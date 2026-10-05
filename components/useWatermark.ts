'use client';

import { useSyncExternalStore } from 'react';
import { notifyPreferenceEdit } from '@/lib/device-sync';

/* The dexmedetomidine watermark behind the editor area. On by default; off
   is the `no-watermark` class on <html>, set before paint by the boot
   script and synced to the account as the `watermark` preference. */

export const WATERMARK_EVENT = 'vest-watermark';

export function isWatermarkOn(): boolean {
  return typeof document === 'undefined' || !document.documentElement.classList.contains('no-watermark');
}

function subscribe(onChange: () => void) {
  window.addEventListener(WATERMARK_EVENT, onChange);
  return () => window.removeEventListener(WATERMARK_EVENT, onChange);
}

export function useWatermark(): boolean {
  return useSyncExternalStore(subscribe, isWatermarkOn, () => true);
}

/** Show or hide the watermark, persist it, and sync it. */
export function setWatermark(on: boolean) {
  document.documentElement.classList.toggle('no-watermark', !on);
  try {
    localStorage.setItem('vest_watermark', on ? '1' : '0');
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(WATERMARK_EVENT));
  notifyPreferenceEdit({ watermark: on });
}
