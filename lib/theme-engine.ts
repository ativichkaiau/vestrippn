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
  function mode(value: unknown): Mode {
    return value === 'day' || value === 'twilight' || value === 'night' ? value : 'auto';
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
    return { livery: lv, mode: md, phase, dark, progress, palette, definition };
  }

  function apply(root: HTMLElement, lv: Livery, md: Mode, date = new Date()) {
    const theme = resolve(lv, md, date);
    const { palette, definition, dark } = theme;
    const oldClasses = [...Object.keys(config.legacy), ...Object.keys(config.liveries)];
    root.classList.remove(...oldClasses, ...oldClasses.map(id => `w09-${id}`));
    root.classList.toggle('dark', dark);
    root.classList.add('w10-eq-power');
    root.dataset.livery = lv;
    root.dataset.mode = md;
    root.dataset.phase = theme.phase;
    root.dataset.tone = dark ? 'dark' : 'light';
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
    root.style.colorScheme = dark ? 'dark' : 'light';
    return theme;
  }
  return { livery, mode, resolve, apply, solarElevation, contrast };
}
