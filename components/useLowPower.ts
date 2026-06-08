'use client';

import { useEffect, useState } from 'react';

/**
 * Reactive read of low-power mode (the `low-power` class on <html>).
 * Components with JS-driven (framer-motion / rAF) animation can use this to
 * fall back to a static render. CSS animations/transitions are handled
 * globally by the `html.low-power` rules in globals.css.
 */
export function useLowPower() {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const read = () => setLowPower(document.documentElement.classList.contains('low-power'));
    read();
    window.addEventListener('vest-lowpower', read);
    return () => window.removeEventListener('vest-lowpower', read);
  }, []);

  return lowPower;
}

/** Toggle low-power mode, persist it, and notify listeners. */
export function setLowPowerMode(on: boolean) {
  const el = document.documentElement;
  el.classList.toggle('low-power', on);
  try {
    localStorage.setItem('vest_lowpower', on ? '1' : '0');
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('vest-lowpower'));
}
