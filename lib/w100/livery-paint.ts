import { LIVERY_CATALOG, type Livery } from '../liveries';

/**
 * A livery as paint: the hard-stop bands of its stripe, plus the colours the
 * 3D mark needs for carbon sides, outline and rim light. Derived from
 * lib/liveries.ts so a new livery paints itself with no extra data.
 */
export type RGB = readonly [number, number, number];
export type LiveryPaint = {
  bands: { color: RGB; end: number }[]; // end ∈ [0, 1], ascending
  carbon: RGB;
  outline: RGB;
  rim: RGB;
};

export const MAX_BANDS = 10;

const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const BLACK: RGB = [0, 0, 0];

/** `linear-gradient(114deg, #123d95 0% 34%, #ffe044 34% 60%, …)` → bands. */
export function stripeBands(stripe: string): LiveryPaint['bands'] {
  const bands: LiveryPaint['bands'] = [];
  for (const match of stripe.matchAll(/(#[0-9a-f]{6})\s+([\d.]+)%\s+([\d.]+)%/gi)) {
    bands.push({ color: hexToRgb(match[1]), end: Number(match[3]) / 100 });
  }
  return bands.slice(0, MAX_BANDS);
}

const cache = new Map<Livery, LiveryPaint>();

export function liveryPaint(livery: Livery): LiveryPaint {
  const hit = cache.get(livery);
  if (hit) return hit;
  const definition = LIVERY_CATALOG[livery] ?? LIVERY_CATALOG.normal;
  const hero = hexToRgb(definition.palette.hero);
  const paint: LiveryPaint = {
    bands: stripeBands(definition.stripe),
    carbon: mix(hero, BLACK, 0.55),
    outline: mix(hero, BLACK, 0.25),
    rim: hexToRgb(definition.palette.heroAccent),
  };
  cache.set(livery, paint);
  return paint;
}

/** Unpainted carbon — what the mark is before its livery sweeps on. */
export function carbonPaint(): LiveryPaint {
  const carbon: RGB = [0.07, 0.08, 0.09];
  return { bands: [{ color: [0.12, 0.13, 0.15], end: 1 }], carbon, outline: [0.04, 0.045, 0.05], rim: [0.5, 0.56, 0.6] };
}
