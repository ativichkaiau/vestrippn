/* ════════════════════════════════════════════════════════════════════════
   VS Code colour themes.

   A colour theme is independent of the livery: it sets the whole interface
   palette (surfaces, text, lines, accent, and the shell's title, activity,
   tab and status bars). The livery then only adds its stripe and the garage
   paint. Each theme has a dark and a light variant; the appearance setting
   (dark / light / auto) picks between them, the way VS Code pairs a
   preferred dark and light theme.

   Colours follow VS Code's built-in themes. Text and accent values are the
   starting points: the theme engine nudges them until they read at 4.5:1
   on every surface (validate:themes checks it).
   ════════════════════════════════════════════════════════════════════════ */

export const COLOR_THEMES = ['vestrippn', 'vscode-modern', 'vscode-classic'] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

export type ThemeVariant = {
  /** VS Code's own name for this variant. */
  name: string;
  root: string; // editor
  b1: string; // side bar, title bar
  b2: string; // list hover
  b3: string; // inputs, widgets
  strong: string;
  primary: string;
  secondary: string;
  muted: string;
  faint: string;
  subtle: string;
  line: string;
  lineStrong: string;
  accent: string;
  selection: string;
  title: string;
  activity: string;
  activityFg: string;
  activityFgActive: string;
  indicator: string;
  status: string;
  statusFg: string;
  tab: string;
  tabActive: string;
  panel: string;
};

export type ThemeDefinition = { label: string; description: string; dark: ThemeVariant; light: ThemeVariant };

export const VSCODE_THEMES: Record<Exclude<ColorTheme, 'vestrippn'>, ThemeDefinition> = {
  'vscode-modern': {
    label: 'VS Code Modern',
    description: 'Dark Modern / Light Modern — the current VS Code default',
    dark: {
      name: 'Dark Modern',
      root: '#1f1f1f', b1: '#181818', b2: '#2a2d2e', b3: '#313131',
      strong: '#ffffff', primary: '#cccccc', secondary: '#b5b5b5', muted: '#9d9d9d', faint: '#5a5a5a',
      subtle: '#2b2b2b', line: '#2b2b2b', lineStrong: '#454545',
      accent: '#4daafc', selection: '#264f78',
      title: '#181818', activity: '#181818', activityFg: '#868686', activityFgActive: '#d7d7d7', indicator: '#0078d4',
      status: '#181818', statusFg: '#a8a8a8', tab: '#181818', tabActive: '#1f1f1f', panel: '#181818',
    },
    light: {
      name: 'Light Modern',
      root: '#ffffff', b1: '#f8f8f8', b2: '#f2f2f2', b3: '#ececec',
      strong: '#1f1f1f', primary: '#3b3b3b', secondary: '#555555', muted: '#666666', faint: '#c4c4c4',
      subtle: '#ebebeb', line: '#e5e5e5', lineStrong: '#cecece',
      accent: '#005fb8', selection: '#add6ff',
      title: '#f8f8f8', activity: '#f8f8f8', activityFg: '#6e6e6e', activityFgActive: '#1f1f1f', indicator: '#005fb8',
      status: '#f8f8f8', statusFg: '#3b3b3b', tab: '#f8f8f8', tabActive: '#ffffff', panel: '#f8f8f8',
    },
  },
  'vscode-classic': {
    label: 'VS Code Classic',
    description: 'Dark+ / Light+ — the original VS Code look, blue status bar',
    dark: {
      name: 'Dark+',
      root: '#1e1e1e', b1: '#252526', b2: '#2a2d2e', b3: '#3c3c3c',
      strong: '#ffffff', primary: '#d4d4d4', secondary: '#bbbbbb', muted: '#a6a6a6', faint: '#5a5a5a',
      subtle: '#303031', line: '#3c3c3c', lineStrong: '#474747',
      accent: '#3794ff', selection: '#264f78',
      title: '#3c3c3c', activity: '#333333', activityFg: '#858585', activityFgActive: '#ffffff', indicator: '#ffffff',
      status: '#007acc', statusFg: '#ffffff', tab: '#2d2d2d', tabActive: '#1e1e1e', panel: '#1e1e1e',
    },
    light: {
      name: 'Light+',
      root: '#ffffff', b1: '#f3f3f3', b2: '#e8e8e8', b3: '#dddddd',
      strong: '#000000', primary: '#333333', secondary: '#555555', muted: '#616161', faint: '#c4c4c4',
      subtle: '#e7e7e7', line: '#dddddd', lineStrong: '#c8c8c8',
      accent: '#006ab1', selection: '#add6ff',
      title: '#dddddd', activity: '#2c2c2c', activityFg: '#a0a0a0', activityFgActive: '#ffffff', indicator: '#ffffff',
      status: '#007acc', statusFg: '#ffffff', tab: '#ececec', tabActive: '#ffffff', panel: '#ffffff',
    },
  },
};

export const COLOR_THEME_LABEL: Record<ColorTheme, string> = {
  vestrippn: 'VESTRIPPN',
  'vscode-modern': VSCODE_THEMES['vscode-modern'].label,
  'vscode-classic': VSCODE_THEMES['vscode-classic'].label,
};
