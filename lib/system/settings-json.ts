import { LIVERIES, type Livery, type Mode } from '../liveries';
import { themeEngine } from '../theme-config';
import { COLOR_THEMES, type ColorTheme } from '../vscode-themes';
import { DEFAULT_NAV, parseNavLayout, serializeNavLayout, type NavEntry } from './nav-layout';

/* ════════════════════════════════════════════════════════════════════════
   settings.json — every synced setting as one VS Code-style JSON document.

   The text is JSONC, like VS Code's: // and /* *\/ comments and trailing
   commas are allowed. A key that is left out goes back to its default, as
   in VS Code; an unknown key or a bad value is an error with its line
   number, and nothing is applied until the whole document is valid.
   Pure functions; the settings page reads and applies them.
   ════════════════════════════════════════════════════════════════════════ */

export type Appearance = 'dark' | 'light' | 'auto';
export type Settings = {
  colorTheme: ColorTheme;
  appearance: Appearance;
  livery: Livery;
  lowPower: boolean;
  watermark: boolean;
  tabs: NavEntry[];
};
export type SettingsError = { message: string; line?: number };
export type SettingsResult = { ok: true; settings: Settings } | { ok: false; errors: SettingsError[] };

export const DEFAULT_SETTINGS: Settings = {
  colorTheme: 'vestrippn',
  appearance: 'dark',
  livery: 'system',
  lowPower: false,
  watermark: true,
  tabs: DEFAULT_NAV,
};

const KEY = {
  colorTheme: 'workbench.colorTheme',
  appearance: 'window.appearance',
  livery: 'vestrippn.livery',
  lowPower: 'vestrippn.lowPower',
  watermark: 'vestrippn.watermark',
  tabs: 'vestrippn.tabs',
} as const;
const KNOWN = new Set<string>(Object.values(KEY));

export const appearanceOf = (mode: Mode): Appearance => (mode === 'day' ? 'light' : mode === 'auto' ? 'auto' : 'dark');
export const modeOf = (appearance: Appearance): Mode => (appearance === 'light' ? 'day' : appearance === 'auto' ? 'auto' : 'night');

const HEADER = [
  '// VESTRIPPN settings, synced to your account.',
  '// Edit, then Save (Ctrl+S). A key you remove goes back to its default.',
  `// workbench.colorTheme: ${COLOR_THEMES.map((id) => `"${id}"`).join(' | ')}`,
  '// window.appearance: "dark" | "light" | "auto"',
  '// vestrippn.livery: see the Appearance view or `livery` in the terminal',
  '// vestrippn.tabs: the side bar tabs, in order (Customize Tabs edits the same list)',
];

export function toSettingsJson(settings: Settings): string {
  const body = {
    [KEY.colorTheme]: settings.colorTheme,
    [KEY.appearance]: settings.appearance,
    [KEY.livery]: settings.livery,
    [KEY.lowPower]: settings.lowPower,
    [KEY.watermark]: settings.watermark,
    [KEY.tabs]: JSON.parse(serializeNavLayout(settings.tabs)) as NavEntry[],
  };
  // Tabs one per line: readable without wrapping every field.
  const tabs = body[KEY.tabs].map((entry) => `    ${JSON.stringify(entry)}`).join(',\n');
  const lines = Object.entries(body).map(([key, value]) =>
    key === KEY.tabs ? `  "${key}": [\n${tabs}\n  ]` : `  "${key}": ${JSON.stringify(value)}`,
  );
  return `${HEADER.join('\n')}\n{\n${lines.join(',\n')}\n}\n`;
}

/** Remove comments and trailing commas outside strings; keeps every newline so line numbers hold. */
export function stripJsonc(text: string): string {
  let out = '';
  let i = 0;
  let inString = false;
  while (i < text.length) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === '\\' && i + 1 < text.length) {
        out += text[i + 1];
        i += 2;
        continue;
      }
      if (c === '"') inString = false;
      i += 1;
    } else if (c === '"') {
      inString = true;
      out += c;
      i += 1;
    } else if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i += 1;
    } else if (c === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        if (text[i] === '\n') out += '\n';
        i += 1;
      }
      i += 2;
    } else {
      out += c;
      i += 1;
    }
  }
  return dropTrailingCommas(out);
}

/** A comma followed only by whitespace before } or ] (outside strings) becomes a space. */
function dropTrailingCommas(text: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === '\\') out += text[++i] ?? '';
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === ',' && /^\s*[}\]]/.test(text.slice(i + 1, i + 200))) {
      out += ' ';
    } else out += c;
  }
  return out;
}

const lineAt = (text: string, index: number) => text.slice(0, Math.max(0, index)).split('\n').length;

/** The line a top-level key is written on, for error messages. */
function keyLine(text: string, key: string): number | undefined {
  const index = text.indexOf(`"${key}"`);
  return index < 0 ? undefined : lineAt(text, index);
}

export function parseSettingsJson(text: string): SettingsResult {
  if (text.length > 50_000) return { ok: false, errors: [{ message: 'settings.json is too large.' }] };
  const clean = stripJsonc(text);
  let data: unknown;
  try {
    data = JSON.parse(clean);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON.';
    const position = /position (\d+)/.exec(message);
    const line = /line (\d+)/.exec(message);
    return { ok: false, errors: [{ message: `Not valid JSON: ${message.replace(/^JSON\.parse: /, '').replace(/ in JSON at.*$/, '')}`, line: line ? Number(line[1]) : position ? lineAt(clean, Number(position[1])) : undefined }] };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errors: [{ message: 'settings.json must be one JSON object: { … }.' }] };

  const record = data as Record<string, unknown>;
  const errors: SettingsError[] = [];
  const settings: Settings = { ...DEFAULT_SETTINGS };
  const fail = (key: string, message: string) => errors.push({ message: `"${key}": ${message}`, line: keyLine(clean, key) });

  for (const key of Object.keys(record)) if (!KNOWN.has(key)) fail(key, 'unknown setting.');

  const theme = record[KEY.colorTheme];
  if (theme !== undefined) {
    if (typeof theme === 'string' && (COLOR_THEMES as readonly string[]).includes(theme)) settings.colorTheme = theme as ColorTheme;
    else fail(KEY.colorTheme, `expected one of ${COLOR_THEMES.join(', ')}.`);
  }
  const appearance = record[KEY.appearance];
  if (appearance !== undefined) {
    if (appearance === 'dark' || appearance === 'light' || appearance === 'auto') settings.appearance = appearance;
    else fail(KEY.appearance, 'expected "dark", "light" or "auto".');
  }
  const livery = record[KEY.livery];
  if (livery !== undefined) {
    // Old livery names migrate the way synced preferences do.
    const id = typeof livery === 'string' ? themeEngine.livery(livery) : null;
    if (id && (LIVERIES as string[]).includes(id)) settings.livery = id as Livery;
    else fail(KEY.livery, 'unknown livery.');
  }
  for (const [field, key] of [['lowPower', KEY.lowPower], ['watermark', KEY.watermark]] as const) {
    const value = record[key];
    if (value === undefined) continue;
    if (typeof value === 'boolean') settings[field] = value;
    else fail(key, 'expected true or false.');
  }
  const tabs = record[KEY.tabs];
  if (tabs !== undefined) {
    try {
      settings.tabs = parseNavLayout(tabs);
    } catch (error) {
      fail(KEY.tabs, error instanceof Error ? error.message : 'invalid tab list.');
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true, settings };
}

/** Which settings differ, so applying only touches (and syncs) what changed. */
export function changedSettings(before: Settings, after: Settings): (keyof Settings)[] {
  return (Object.keys(after) as (keyof Settings)[]).filter((key) =>
    key === 'tabs' ? serializeNavLayout(before.tabs) !== serializeNavLayout(after.tabs) : before[key] !== after[key],
  );
}
