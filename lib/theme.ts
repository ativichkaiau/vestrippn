'use client';
import { notifyPreferenceEdit } from './device-sync';
import { LIVERIES, LIVERY_CATALOG, type Livery, type Mode } from './liveries';
import { themeEngine } from './theme-config';

export type { Livery, Mode } from './liveries';
export const LIVERY_CYCLE = LIVERIES;
export const LIVERY_LABEL = Object.fromEntries(LIVERIES.map(id => [id, LIVERY_CATALOG[id].name])) as Record<Livery, string>;
export const MODE_LABEL: Record<Mode, string> = { auto: 'Auto', day: 'Silver day', twilight: 'Twilight', night: 'Carbon night' };

export function applyLivery(livery: Livery, mode: Mode): void {
  const theme = themeEngine.apply(document.documentElement, themeEngine.livery(livery) ?? 'normal', themeEngine.mode(mode));
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => { meta.content = theme.palette.canvas; });
}
export function getLivery(): Livery {
  try { return themeEngine.livery(localStorage.getItem('vest_livery')) ?? 'normal'; } catch { return themeEngine.livery(document.documentElement.dataset.livery) ?? 'normal'; }
}
export function getMode(): Mode {
  try { return themeEngine.mode(localStorage.getItem('vest_mode')); } catch { return themeEngine.mode(document.documentElement.dataset.mode); }
}
export function setTheme(livery: Livery, mode?: Mode): void {
  const selectedMode = mode ?? getMode();
  applyLivery(livery, selectedMode);
  try {
    localStorage.setItem('vest_livery', livery);
    if (mode) localStorage.setItem('vest_mode', mode);
  } catch { /* The applied DOM remains usable when storage is unavailable. */ }
  window.dispatchEvent(new Event('vest:theme-change'));
  notifyPreferenceEdit({ livery, ...(mode ? { mode } : {}) });
}
export function cycleLivery(): Livery {
  const next = LIVERY_CYCLE[(LIVERY_CYCLE.indexOf(getLivery()) + 1) % LIVERY_CYCLE.length];
  setTheme(next);
  return next;
}
export function toggleMode(): Mode {
  const modes: Mode[] = ['day', 'twilight', 'night', 'auto'];
  const next = modes[(modes.indexOf(getMode()) + 1) % modes.length];
  setTheme('normal', next);
  return next;
}
export function subscribeTheme(listener: () => void) {
  window.addEventListener('vest:theme-change', listener);
  window.addEventListener('vest-lowpower', listener);
  return () => {
    window.removeEventListener('vest:theme-change', listener);
    window.removeEventListener('vest-lowpower', listener);
  };
}
export function themeSnapshot() {
  const el = document.documentElement;
  return `${getLivery()}|${getMode()}|${el.dataset.phase ?? 'day'}|${isLowPower() ? '1' : '0'}`;
}
export const serverThemeSnapshot = () => 'normal|auto|day|0';
export function isLowPower(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('low-power');
}
