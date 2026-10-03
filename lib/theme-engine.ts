import type { Livery, LiveryDefinition, Mode, ThemePalette, ThemePhase } from './liveries';

type EngineConfig = {
  liveries: Record<Livery, LiveryDefinition>; legacy: Record<string, Livery>;
  mercedes: Record<ThemePhase, ThemePalette>; location: { latitude: number; longitude: number; name: string };
};

/** Self-contained factory: the exact same implementation runs before paint and after hydration. */
export function createThemeEngine(config: EngineConfig) {
  const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const rgb = (hex: string) => [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
  const mix = (a: string, b: string, amount: number) => `#${rgb(a).map((channel, i) => Math.round(channel + (rgb(b)[i] - channel) * amount).toString(16).padStart(2, '0')).join('')}`;
  function luminance(hex: string) {
    const channels = rgb(hex).map(channel => { const c = channel / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  function contrast(a: string, b: string) {
    const first = luminance(a), second = luminance(b);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  }
  function legible(color: string, grounds: string[], fallback: string) {
    for (let step = 0; step <= 20; step++) {
      const candidate = mix(color, fallback, step / 20);
      if (grounds.every(ground => contrast(candidate, ground) >= 4.5)) return candidate;
    }
    return fallback;
  }
  function livery(value: unknown): Livery | null {
    if (typeof value !== 'string') return null;
    if (Object.prototype.hasOwnProperty.call(config.liveries, value)) return value as Livery;
    return Object.prototype.hasOwnProperty.call(config.legacy, value) ? config.legacy[value] : null;
  }
  // Dark first: with nothing stored, the environment opens dark.
  function mode(value: unknown): Mode {
    return value === 'day' || value === 'twilight' || value === 'auto' ? value : 'night';
  }

  // The environment's appearance follows the mode alone — a livery paints the
  // garage object, never the interface. Auto follows the sun over Chiang Mai.
  function appearance(md: Mode, phase: ThemePhase): 'dark' | 'light' {
    return md === 'day' || (md === 'auto' && phase === 'day') ? 'light' : 'dark';
  }

  // NOAA fractional-year solar position. UTC + longitude keeps this independent
  // of the browser's timezone. No location permission or network call is needed.
  function solarElevation(date: Date): number {
    const year = date.getUTCFullYear();
    const day = (Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - Date.UTC(year, 0, 1)) / 86400000 + 1;
    const yearDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const gamma = 2 * Math.PI / yearDays * (day - 1 + (hour - 12) / 24);
    const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    const solarMinutes = ((hour * 60 + eq + 4 * config.location.longitude) % 1440 + 1440) % 1440;
    const angle = (solarMinutes / 4 - 180) * Math.PI / 180;
    const lat = config.location.latitude * Math.PI / 180;
    return Math.asin(clamp(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(angle), -1, 1)) * 180 / Math.PI;
  }

  // Neutral VESTRIPPN surfaces and text (mirrors app/globals.css). A livery
  // tints the surfaces toward its own colour and supplies the accent; the
  // system paint keeps these exactly.
  const BASE = {
    dark: { root: '#08090a', b1: '#0d0f11', b2: '#121417', b3: '#181b1f', subtle: '#16191d', line: '#22262b', strong: '#353b43', secondary: '#9a9fa6', muted: '#7a8089' },
    light: { root: '#f4f4f1', b1: '#ebebe7', b2: '#e4e4df', b3: '#dadad4', subtle: '#e1e1dc', line: '#d2d3cd', strong: '#b9bbb6', secondary: '#50565e', muted: '#5f656d' },
  };

  function environment(lv: Livery, appearanceValue: 'dark' | 'light', palette: ThemePalette, tone: 'light' | 'dark') {
    const dark = appearanceValue === 'dark';
    const base = dark ? BASE.dark : BASE.light;
    if (lv === 'system') return null;
    const tint = dark ? palette.hero : tone === 'light' ? palette.canvas : mix(palette.hero, '#ffffff', 0.86);
    const [r0, r1, r2, r3, rl] = dark ? [0.3, 0.34, 0.36, 0.38, 0.3] : [0.5, 0.55, 0.58, 0.6, 0.4];
    const bg = { root: mix(base.root, tint, r0), b1: mix(base.b1, tint, r1), b2: mix(base.b2, tint, r2), b3: mix(base.b3, tint, r3) };
    const grounds = [bg.root, bg.b1, bg.b2, bg.b3];
    const ink = dark ? '#ffffff' : '#000000';
    const accent = legible(dark ? palette.heroAccent : palette.accent, grounds, ink);
    return {
      '--bg-root': bg.root,
      '--bg-01': bg.b1,
      '--bg-02': bg.b2,
      '--bg-03': bg.b3,
      '--line-subtle': mix(base.subtle, tint, rl),
      '--line-default': mix(base.line, tint, rl),
      '--line-strong': mix(base.strong, tint, rl),
      '--text-secondary': legible(base.secondary, grounds, ink),
      '--text-muted': legible(base.muted, grounds, ink),
      '--accent': accent,
      '--accent-strong': mix(accent, ink, 0.2),
      '--accent-soft': `rgb(${rgb(accent).join(' ')} / ${dark ? 0.14 : 0.1})`,
      '--accent-line': `rgb(${rgb(accent).join(' ')} / 0.45)`,
      '--on-accent': contrast('#ffffff', accent) >= 4.5 ? '#ffffff' : '#07090c',
      '--selection': `rgb(${rgb(accent).join(' ')} / ${dark ? 0.3 : 0.2})`,
      '--hub-accent-rgb': rgb(accent).join(', '),
    } as Record<string, string>;
  }
  const ENVIRONMENT_KEYS = ['--bg-root', '--bg-01', '--bg-02', '--bg-03', '--line-subtle', '--line-default', '--line-strong', '--text-secondary', '--text-muted', '--accent', '--accent-strong', '--accent-soft', '--accent-line', '--on-accent', '--selection', '--hub-accent-rgb'];

  function resolve(lv: Livery, md: Mode, date = new Date()) {
    const definition = config.liveries[lv];
    const elevation = solarElevation(date);
    const progress = md === 'auto' ? clamp((6 - elevation) / 12) : md === 'day' ? 0 : md === 'twilight' ? 0.5 : 1;
    const phase: ThemePhase = progress === 0 ? 'day' : progress === 1 ? 'night' : 'twilight';
    const palette: ThemePalette = { ...definition.palette };
    let dark = definition.tone === 'dark';
    if (lv === 'normal') {
      const a = config.mercedes[progress < 0.5 ? 'day' : 'twilight'];
      const b = config.mercedes[progress < 0.5 ? 'twilight' : 'night'];
      for (const key of Object.keys(a) as (keyof ThemePalette)[]) palette[key] = mix(a[key], b[key], progress < 0.5 ? progress * 2 : (progress - 0.5) * 2);
      // Keep content readable through the middle greys: never fade text through
      // a low-contrast midpoint along with its background.
      const grounds = [palette.canvas, palette.surface, palette.raised, palette.inset];
      dark = Math.min(...grounds.map(ground => contrast('#ffffff', ground))) > Math.min(...grounds.map(ground => contrast('#000000', ground)));
      // During the brief crossover, bring the extreme surfaces together so a
      // single foreground can remain readable on every surface.
      const fallback = dark ? '#ffffff' : '#000000';
      for (const key of ['canvas', 'surface', 'raised', 'inset'] as const) palette[key] = legible(palette[key], [fallback], dark ? '#000000' : '#ffffff');
      const safeGrounds = [palette.canvas, palette.surface, palette.raised, palette.inset];
      palette.text = legible(dark ? '#f4f6f8' : '#172127', safeGrounds, fallback);
      palette.muted = legible(dark ? '#a3adb7' : '#44535e', safeGrounds, fallback);
      palette.accent = legible(dark ? '#00d2be' : '#006e64', safeGrounds, fallback);
    }
    const look = appearance(md, phase);
    return { livery: lv, mode: md, phase, dark, appearance: look, progress, palette, definition, environment: environment(lv, look, palette, definition.tone) };
  }

  function apply(root: HTMLElement, lv: Livery, md: Mode, date = new Date()) {
    const theme = resolve(lv, md, date);
    const { palette, definition, dark } = theme;
    const environmentDark = theme.appearance === 'dark';
    const oldClasses = [...Object.keys(config.legacy), ...Object.keys(config.liveries)];
    root.classList.remove(...oldClasses, ...oldClasses.map(id => `w09-${id}`));
    root.classList.toggle('dark', environmentDark);
    // The livery's environment tokens; the system paint falls back to the stylesheet.
    for (const key of ENVIRONMENT_KEYS) {
      const value = theme.environment?.[key];
      if (value) root.style.setProperty(key, value);
      else root.style.removeProperty(key);
    }
    root.dataset.livery = lv;
    root.dataset.mode = md;
    root.dataset.phase = theme.phase;
    root.dataset.tone = environmentDark ? 'dark' : 'light';
    root.dataset.liveryTeam = definition.team;
    for (const [name, value] of Object.entries(palette)) root.style.setProperty(`--livery-${name}`, value);
    root.style.setProperty('--livery-accent-rgb', rgb(palette.accent).join(', '));
    root.style.setProperty('--livery-secondary-rgb', rgb(palette.secondary).join(', '));
    root.style.setProperty('--livery-hero-rgb', rgb(palette.hero).join(', '));
    root.style.setProperty('--livery-on-accent', contrast('#ffffff', palette.accent) >= 4.5 ? '#ffffff' : '#07121c');
    root.style.setProperty('--livery-stripe', definition.stripe);
    root.style.setProperty('--livery-line', dark ? 'rgba(230, 239, 250, 0.16)' : 'rgba(18, 37, 57, 0.18)');
    root.style.setProperty('--livery-line-strong', dark ? 'rgba(230, 239, 250, 0.26)' : 'rgba(18, 37, 57, 0.3)');
    root.style.setProperty('--livery-grid', dark ? 'rgba(230, 239, 250, 0.04)' : 'rgba(18, 37, 57, 0.05)');
    root.style.colorScheme = environmentDark ? 'dark' : 'light';
    return theme;
  }
  return { livery, mode, resolve, apply, solarElevation, contrast };
}
