'use client';
import { notifyPreferenceEdit } from './device-sync';
import { LIVERIES, LIVERY_CATALOG, type Livery, type Mode } from './liveries';
import { themeEngine } from './theme-config';
import { COLOR_THEMES, type ColorTheme } from './vscode-themes';

export type { Livery, Mode } from './liveries';
export type { ColorTheme } from './vscode-themes';
export { COLOR_THEMES, COLOR_THEME_LABEL } from './vscode-themes';
export const LIVERY_CYCLE = LIVERIES;
export const LIVERY_LABEL = Object.fromEntries(LIVERIES.map(id => [id, LIVERY_CATALOG[id].name])) as Record<Livery, string>;
/** Environment appearance. Twilight is a legacy value and renders dark. */
export const MODE_LABEL: Record<Mode, string> = { auto: 'auto', day: 'light', twilight: 'dark', night: 'dark' };

export function applyLivery(livery: Livery, mode: Mode, colorTheme: ColorTheme = getColorTheme()): void {
  const theme = themeEngine.apply(document.documentElement, themeEngine.livery(livery) ?? 'system', themeEngine.mode(mode), undefined, themeEngine.colorTheme(colorTheme));
  const canvas = getComputedStyle(document.documentElement).getPropertyValue('--bg-root').trim();
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => { meta.content = canvas || (theme.appearance === 'dark' ? '#08090a' : '#f4f4f1'); });
}
export function getLivery(): Livery {
  try { return themeEngine.livery(localStorage.getItem('vest_livery')) ?? 'system'; } catch { return themeEngine.livery(document.documentElement.dataset.livery) ?? 'system'; }
}
export function getMode(): Mode {
  try { return themeEngine.mode(localStorage.getItem('vest_mode')); } catch { return themeEngine.mode(document.documentElement.dataset.mode); }
}
export function getColorTheme(): ColorTheme {
  try { return themeEngine.colorTheme(localStorage.getItem('vest_theme')); } catch { return themeEngine.colorTheme(document.documentElement.dataset.theme); }
}
/** Switch the VS Code colour theme; the livery and appearance stay as they are. */
export function setColorTheme(colorTheme: ColorTheme): void {
  const next = themeEngine.colorTheme(colorTheme);
  try { localStorage.setItem('vest_theme', next); } catch { /* applied for this page only */ }
  applyLivery(getLivery(), getMode(), next);
  window.dispatchEvent(new Event('vest:theme-change'));
  notifyPreferenceEdit({ theme: next });
}
export function cycleColorTheme(): ColorTheme {
  const next = COLOR_THEMES[(COLOR_THEMES.indexOf(getColorTheme()) + 1) % COLOR_THEMES.length];
  setColorTheme(next);
  return next;
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
/** dark → light → auto. Keeps the selected livery: appearance and paint are independent. */
export function toggleMode(): Mode {
  const current = getMode();
  const next: Mode = current === 'day' ? 'auto' : current === 'auto' ? 'night' : 'day';
  setTheme(getLivery(), next);
  return next;
}
export function getAppearance(): 'dark' | 'light' {
  return typeof document !== 'undefined' && !document.documentElement.classList.contains('dark') ? 'light' : 'dark';
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
  return `${getLivery()}|${getMode()}|${el.dataset.phase ?? 'day'}|${isLowPower() ? '1' : '0'}|${getColorTheme()}`;
}
export const serverThemeSnapshot = () => 'system|night|night|0|vestrippn';
export function isLowPower(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('low-power');
}
