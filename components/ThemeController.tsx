'use client';

import { useEffect } from 'react';
import { applyLivery, getLivery, getMode } from '@/lib/theme';

/** One clock for every route, including auth, chat, and learning pages. */
export default function ThemeController() {
  useEffect(() => {
    const refresh = () => {
      applyLivery(getLivery(), getMode());
      window.dispatchEvent(new Event('vest:theme-change'));
    };
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'vest_livery' || event.key === 'vest_mode' || event.key === null) refresh();
    };
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && getMode() === 'auto' && getLivery() === 'normal') refresh();
    }, 30_000);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return null;
}
