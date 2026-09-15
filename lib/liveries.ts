/** The collection, appearance engine, boot script, and synced preferences share these IDs. */
export type ThemePalette = {
  canvas: string; surface: string; raised: string; inset: string;
  text: string; muted: string; accent: string; secondary: string;
  hero: string; heroAccent: string;
};
export type LiveryDefinition = {
  name: string; year: string; chassis: string; team: 'mercedes' | 'williams' | 'redbull' | 'drivers';
  description: string; finish: string; special?: boolean; tone: 'light' | 'dark';
  colors: readonly string[]; stripe: string; palette: ThemePalette;
};

export const MERCEDES_PALETTES: Record<'day' | 'twilight' | 'night', ThemePalette> = {
  day: { canvas: '#bac2c9', surface: '#d8dee3', raised: '#edf0f2', inset: '#c9d1d7', text: '#172127', muted: '#44535e', accent: '#006e64', secondary: '#596c79', hero: '#112227', heroAccent: '#67e6d0' },
  twilight: { canvas: '#444c54', surface: '#525c65', raised: '#606b74', inset: '#39434c', text: '#ffffff', muted: '#e1e8ed', accent: '#7ae9d6', secondary: '#bdcbd4', hero: '#19272d', heroAccent: '#7ae9d6' },
  night: { canvas: '#08090a', surface: '#101113', raised: '#1c2024', inset: '#0c0e10', text: '#f4f6f8', muted: '#a3adb7', accent: '#00d2be', secondary: '#c7ccd4', hero: '#0d0e10', heroAccent: '#00d2be' },
};

export const LIVERY_CATALOG = {
  normal: {
    name: 'Silver Arrow', year: '2014', chassis: 'W05', team: 'mercedes',
    description: 'Brushed silver, PETRONAS teal, carbon edges.', finish: 'Brushed metal', tone: 'light',
    colors: ['#c4ccd2', '#eff3f5', '#00a99c', '#151c22'],
    stripe: 'linear-gradient(115deg, #222d33 0% 12%, #bac5cc 12% 43%, #eff3f5 43% 46%, #00a99c 46% 65%, #086860 65% 70%, #151c22 70% 100%)',
    palette: MERCEDES_PALETTES.day,
  },
  'williams-1993': {
    name: 'Canon Williams', year: '1993', chassis: 'FW15C', team: 'williams',
    description: 'Royal blue, a yellow shoulder, crisp white.', finish: 'Heritage gloss', tone: 'dark',
    colors: ['#123d95', '#ffe044', '#ffffff', '#d92d38'],
    stripe: 'linear-gradient(114deg, #123d95 0% 34%, #ffe044 34% 60%, #ffffff 60% 77%, #d92d38 77% 81%, #123d95 81% 100%)',
    palette: { canvas: '#081d49', surface: '#102e66', raised: '#193d7a', inset: '#0c2451', text: '#f7f9ff', muted: '#bccfed', accent: '#ffe044', secondary: '#74a4ee', hero: '#082056', heroAccent: '#ffe044' },
  },
  'williams-1996': {
    name: 'Williams Heritage', year: '1996', chassis: 'FW18', team: 'williams',
    description: 'The original navy, white, gold, and red.', finish: 'Heritage gloss', tone: 'dark',
    colors: ['#210e6f', '#ffffff', '#c59955', '#d5172d'],
    stripe: 'linear-gradient(114deg, #210e6f 0% 43%, #ffffff 43% 65%, #c59955 65% 69%, #d5172d 69% 83%, #ffffff 83% 86%, #210e6f 86% 100%)',
    palette: { canvas: '#100c30', surface: '#1b1640', raised: '#2c235b', inset: '#130e30', text: '#faf7ef', muted: '#c2bcd8', accent: '#d8b777', secondary: '#ed6c78', hero: '#120c36', heroAccent: '#d8b777' },
  },
  'williams-2001': {
    name: 'BMW Williams', year: '2001', chassis: 'FW23', team: 'williams',
    description: 'White bodywork and broad midnight blue.', finish: 'Two-tone gloss', tone: 'light',
    colors: ['#ffffff', '#082557', '#2677b9', '#cbd6e1'],
    stripe: 'linear-gradient(114deg, #082557 0% 24%, #2677b9 24% 27%, #ffffff 27% 62%, #082557 62% 92%, #cbd6e1 92% 100%)',
    palette: { canvas: '#e1e8f0', surface: '#f8fbff', raised: '#ffffff', inset: '#e6edf5', text: '#142844', muted: '#4a607b', accent: '#164b8c', secondary: '#2677b9', hero: '#082557', heroAccent: '#aad5ff' },
  },
  'williams-2014': {
    name: 'Williams Martini', year: '2014', chassis: 'FW36', team: 'williams',
    description: 'White with the red and blue racing ribbon.', finish: 'Racing stripes', tone: 'light',
    colors: ['#ffffff', '#091e42', '#69badd', '#d92339'],
    stripe: 'linear-gradient(114deg, #ffffff 0% 25%, #091e42 25% 33%, #69badd 33% 40%, #091e42 40% 44%, #d92339 44% 57%, #091e42 57% 61%, #69badd 61% 68%, #091e42 68% 76%, #ffffff 76% 100%)',
    palette: { canvas: '#e9eef1', surface: '#ffffff', raised: '#f3f8fb', inset: '#e5edf3', text: '#16273d', muted: '#4b6077', accent: '#16456f', secondary: '#b91c34', hero: '#091e42', heroAccent: '#a1d9ef' },
  },
  'redbull-2013': {
    name: 'Infiniti Red Bull Racing', year: '2013', chassis: 'RB9', team: 'redbull',
    description: 'Midnight blue, Infiniti violet, a yellow flash.', finish: 'Violet gloss', tone: 'dark',
    colors: ['#171d43', '#7546a0', '#f5cb2f', '#e32339'],
    stripe: 'linear-gradient(114deg, #171d43 0% 30%, #7546a0 30% 65%, #f5cb2f 65% 76%, #e32339 76% 81%, #171d43 81% 100%)',
    palette: { canvas: '#100f25', surface: '#201a38', raised: '#30254d', inset: '#161027', text: '#f8f5ff', muted: '#c5b6d9', accent: '#c7a2f5', secondary: '#f5cb2f', hero: '#1b1232', heroAccent: '#c7a2f5' },
  },
  'redbull-2020': {
    name: 'Aston Martin Red Bull Racing', year: '2020', chassis: 'RB16', team: 'redbull',
    description: 'Matte navy, yellow nose, silver detailing.', finish: 'Matte navy', tone: 'dark',
    colors: ['#172337', '#f2c832', '#df2336', '#bdc6cb'],
    stripe: 'linear-gradient(114deg, #172337 0% 42%, #bdc6cb 42% 44%, #f2c832 44% 68%, #df2336 68% 80%, #172337 80% 100%)',
    palette: { canvas: '#0e1723', surface: '#192737', raised: '#233549', inset: '#121e2a', text: '#f5f8fb', muted: '#b5c3cf', accent: '#f2d45b', secondary: '#de6473', hero: '#132133', heroAccent: '#f2d45b' },
  },
  'redbull-oracle': {
    name: 'Oracle Red Bull Racing', year: '2022–25', chassis: 'Oracle era', team: 'redbull',
    description: 'Deep navy with the unmistakable red and yellow.', finish: 'Matte carbon', tone: 'dark',
    colors: ['#06152d', '#ec2442', '#ffcd26', '#ffffff'],
    stripe: 'linear-gradient(114deg, #06152d 0% 43%, #ec2442 43% 65%, #ffcd26 65% 77%, #ffffff 77% 79%, #06152d 79% 100%)',
    palette: { canvas: '#070e20', surface: '#111d35', raised: '#1c2d4e', inset: '#0b152b', text: '#f5f8ff', muted: '#b6c4dd', accent: '#ffcf3a', secondary: '#f55b74', hero: '#07172f', heroAccent: '#ffcf3a' },
  },
  'redbull-2026': {
    name: 'Red Bull Ford', year: '2026', chassis: 'RB22', team: 'redbull',
    description: 'Racing blue gloss, woven detail, white outlines.', finish: 'Gloss jacquard', tone: 'dark',
    colors: ['#124cce', '#061b5d', '#ffffff', '#ffca23', '#ec2340'],
    stripe: 'linear-gradient(114deg, #124cce 0% 41%, #ffffff 41% 44%, #ec2340 44% 63%, #ffca23 63% 76%, #ffffff 76% 79%, #061b5d 79% 100%)',
    palette: { canvas: '#091847', surface: '#122b6c', raised: '#1b3c86', inset: '#0c2056', text: '#f8faff', muted: '#bdcef2', accent: '#9bc9ff', secondary: '#ffd44e', hero: '#0c286d', heroAccent: '#b2d8ff' },
  },
  'redbull-suzuka-2025': {
    name: 'Suzuka White Bull', year: '2025', chassis: 'Japanese GP', team: 'redbull', special: true,
    description: 'Championship white and red. The Honda tribute.', finish: 'Championship white', tone: 'light',
    colors: ['#fffdf7', '#c72436', '#171a20'],
    stripe: 'linear-gradient(114deg, #fffdf7 0% 41%, #c72436 41% 72%, #171a20 72% 76%, #fffdf7 76% 100%)',
    palette: { canvas: '#efece6', surface: '#fffdf7', raised: '#ffffff', inset: '#e9e5dd', text: '#272128', muted: '#655c61', accent: '#ad1e31', secondary: '#36313b', hero: '#481421', heroAccent: '#ffb4bd' },
  },
  'redbull-dutch-2026': {
    name: 'Verstappen · Netherlands', year: '2026', chassis: 'Dutch GP tribute', team: 'redbull', special: true,
    description: 'Your original orange, red, white, and blue.', finish: 'Oranje edition', tone: 'dark',
    colors: ['#ff6b00', '#dc2626', '#ffffff', '#1d4ed8', '#061a3a'],
    stripe: 'linear-gradient(114deg, #ff6b00 0% 44%, #dc2626 44% 57%, #ffffff 57% 70%, #1d4ed8 70% 83%, #061a3a 83% 100%)',
    palette: { canvas: '#050b16', surface: '#101e33', raised: '#1a2d48', inset: '#0a1425', text: '#f8fafc', muted: '#bccde3', accent: '#ff943e', secondary: '#75a3ff', hero: '#07152e', heroAccent: '#ff943e' },
  },
  'redbull-porcelain': {
    name: 'Dutch Porcelain', year: 'Special', chassis: 'Delft blue · Custom', team: 'redbull', special: true,
    description: 'Cobalt florals on a glazed porcelain white.', finish: 'Delft glaze', tone: 'light',
    colors: ['#f9fcff', '#174b98', '#6994cb'],
    stripe: 'linear-gradient(114deg, #f9fcff 0% 23%, #174b98 23% 27%, #f9fcff 27% 45%, #6994cb 45% 48%, #174b98 48% 67%, #f9fcff 67% 100%)',
    palette: { canvas: '#e9eff7', surface: '#fcfdff', raised: '#ffffff', inset: '#e3ecf8', text: '#172d4c', muted: '#4c6281', accent: '#184c94', secondary: '#3f71b0', hero: '#12396e', heroAccent: '#c0dfff' },
  },
  senna: {
    name: 'Senna', year: 'Heritage', chassis: 'Helmet tribute', team: 'drivers',
    description: 'Helmet yellow, Brazilian green, racing blue.', finish: 'Driver tribute', tone: 'dark',
    colors: ['#ffd400', '#00a651', '#1f6feb', '#061329'],
    stripe: 'linear-gradient(114deg, #ffd400 0% 42%, #00a651 42% 64%, #1f6feb 64% 79%, #061329 79% 100%)',
    palette: { canvas: '#061329', surface: '#10233a', raised: '#1a3653', inset: '#091b30', text: '#f5f9ff', muted: '#b3c7de', accent: '#ffd400', secondary: '#45d18c', hero: '#0a2036', heroAccent: '#ffd400' },
  },
} as const satisfies Record<string, LiveryDefinition>;

export type Livery = keyof typeof LIVERY_CATALOG;
export type Mode = 'auto' | 'day' | 'twilight' | 'night';
export type ThemePhase = Exclude<Mode, 'auto'>;
export const LIVERIES = Object.keys(LIVERY_CATALOG) as Livery[];
export const MODES: Mode[] = ['auto', 'day', 'twilight', 'night'];
export const LIVERY_TEAMS = [
  { id: 'mercedes', name: 'Mercedes' }, { id: 'williams', name: 'Williams' },
  { id: 'redbull', name: 'Red Bull' }, { id: 'drivers', name: 'Drivers' },
] as const;
export const LEGACY_LIVERIES: Record<string, Livery> = {
  monza: 'williams-1996', verstappen: 'redbull-dutch-2026',
  ferrari: 'normal', forceindia: 'normal', mclaren: 'normal', benetton: 'normal', jps: 'normal', alpine: 'normal',
};
export const THEME_CONFIG = {
  liveries: LIVERY_CATALOG, legacy: LEGACY_LIVERIES, mercedes: MERCEDES_PALETTES,
  location: { latitude: 18.7883, longitude: 98.9853, name: 'Chiang Mai' },
};
