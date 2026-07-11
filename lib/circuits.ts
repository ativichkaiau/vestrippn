// Read-only circuit reference for the analytics "season standings" — the Focus
// Mode qualifying PBs are stored as `vest_focus_pb_<id>`, and this maps each id
// back to a name/flag and its 2017 pole time so we can rank gap-to-pole.
// The gameplay source of truth is TRACKS in components/FocusMode.tsx; these are
// immutable historical facts (2017 qualifying poles), so duplication is safe.

export type CircuitMeta = { name: string; country: string; flag: string; pole: number };

export const CIRCUIT_META: Record<string, CircuitMeta> = {
  aus: { name: 'Albert Park', country: 'Australia', flag: '🇦🇺', pole: 82.188 },
  bhr: { name: 'Sakhir', country: 'Bahrain', flag: '🇧🇭', pole: 88.769 },
  chn: { name: 'Shanghai', country: 'China', flag: '🇨🇳', pole: 91.678 },
  esp: { name: 'Barcelona-Catalunya', country: 'Spain', flag: '🇪🇸', pole: 79.149 },
  mon: { name: 'Monte Carlo', country: 'Monaco', flag: '🇲🇨', pole: 72.178 },
  can: { name: 'Gilles Villeneuve', country: 'Canada', flag: '🇨🇦', pole: 71.459 },
  aut: { name: 'Red Bull Ring', country: 'Austria', flag: '🇦🇹', pole: 64.251 },
  gbr: { name: 'Silverstone', country: 'Britain', flag: '🇬🇧', pole: 86.600 },
  hun: { name: 'Hungaroring', country: 'Hungary', flag: '🇭🇺', pole: 76.276 },
  bel: { name: 'Spa-Francorchamps', country: 'Belgium', flag: '🇧🇪', pole: 102.553 },
  ita: { name: 'Monza', country: 'Italy', flag: '🇮🇹', pole: 95.554 },
  sgp: { name: 'Marina Bay', country: 'Singapore', flag: '🇸🇬', pole: 99.491 },
  jpn: { name: 'Suzuka', country: 'Japan', flag: '🇯🇵', pole: 87.319 },
  usa: { name: 'Circuit of the Americas', country: 'United States', flag: '🇺🇸', pole: 93.108 },
  bra: { name: 'Interlagos', country: 'Brazil', flag: '🇧🇷', pole: 68.322 },
};

export const CIRCUIT_COUNT = Object.keys(CIRCUIT_META).length;
