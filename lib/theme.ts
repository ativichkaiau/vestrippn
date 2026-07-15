'use client';

// Shared theme controls (livery, day/night). Both ThemeToggle and the command
// palette drive the theme through here so there's one source of truth; changes
// fire a `vest:theme-change` event that ThemeToggle listens for to re-sync its
// popover. Low-power lives in useLowPower (its own `vest-lowpower` channel).

export type Livery = 'normal' | 'monza' | 'senna' | 'verstappen' | 'ferrari';
export type Mode = 'day' | 'night';

export const LIVERY_CYCLE: Livery[] = ['normal', 'monza', 'senna', 'verstappen', 'ferrari'];
export const LIVERY_LABEL: Record<Livery, string> = {
  normal: 'Normal',
  monza: 'Williams',
  senna: 'Senna',
  verstappen: 'Verstappen',
  ferrari: 'Ferrari',
};

// Apply livery + mode classes to <html> (mirrors the boot script in layout.tsx).
export function applyLivery(lv: Livery, md: Mode): void {
  const el = document.documentElement;
  el.classList.remove('monza', 'senna', 'verstappen', 'ferrari', 'w09-monza', 'w09-senna', 'w09-verstappen', 'w09-ferrari');
  if (lv === 'monza' || lv === 'senna' || lv === 'verstappen' || lv === 'ferrari') {
    el.classList.add('dark', lv, `w09-${lv}`);
  } else if (md === 'night') {
    el.classList.add('dark');
  } else {
    el.classList.remove('dark');
  }
}

export function getLivery(): Livery {
  try {
    const v = localStorage.getItem('vest_livery');
    if (v === 'normal' || v === 'monza' || v === 'senna' || v === 'verstappen' || v === 'ferrari') return v;
  } catch {
    /* ignore */
  }
  return 'normal';
}

export function getMode(): Mode {
  try {
    const v = localStorage.getItem('vest_mode');
    if (v === 'day' || v === 'night') return v;
  } catch {
    /* ignore */
  }
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18 ? 'night' : 'day';
}

// Persist + apply + notify.
export function setTheme(lv: Livery, md?: Mode): void {
  const mode = md ?? getMode();
  applyLivery(lv, mode);
  try {
    localStorage.setItem('vest_livery', lv);
    if (md) localStorage.setItem('vest_mode', md);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('vest:theme-change'));
}

// Cycle to the next livery (wraps). Returns the new livery for a toast label.
export function cycleLivery(): Livery {
  const next = LIVERY_CYCLE[(LIVERY_CYCLE.indexOf(getLivery()) + 1) % LIVERY_CYCLE.length];
  setTheme(next);
  return next;
}

// Flip day/night. Special liveries are always dark, so drop back to Normal to
// make the switch visible. Returns the new mode.
export function toggleMode(): Mode {
  const next: Mode = getMode() === 'night' ? 'day' : 'night';
  setTheme('normal', next);
  return next;
}

export function isLowPower(): boolean {
  try {
    return document.documentElement.classList.contains('low-power');
  } catch {
    return false;
  }
}
