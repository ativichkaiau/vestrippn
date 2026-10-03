import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { LIVERIES, LIVERY_CATALOG, MODES, LEGACY_LIVERIES } = await jiti.import('../lib/liveries.ts');
const { themeEngine, THEME_BOOT_SCRIPT } = await jiti.import('../lib/theme-config.ts');
const { validatePreferences, reconcilePreferences } = await jiti.import('../lib/device-sync.ts');
const retired = ['ferrari', 'forceindia', 'mclaren', 'benetton', 'jps', 'alpine'];
assert(retired.every(id => !LIVERIES.includes(id)));
assert.equal(LIVERIES.filter(id => LIVERY_CATALOG[id].team === 'williams').length, 4);
assert.equal(LIVERIES.filter(id => LIVERY_CATALOG[id].team === 'redbull').length, 7);
assert(LIVERIES.includes('senna'), 'The existing driver tribute remains available');
for (const [old, current] of Object.entries(LEGACY_LIVERIES)) assert.equal(validatePreferences({ livery: old }).livery, current);
for (const id of LIVERIES) for (const mode of MODES) assert.deepEqual(validatePreferences({ livery: id, mode }), { livery: id, mode });
for (const bad of [{ livery: 'constructor' }, { livery: 'made-up-team' }, { mode: 'random' }, { lowPower: 1 }]) assert.throws(() => validatePreferences(bad));
assert.equal(themeEngine.livery('__proto__'), null);

const day = new Date('2026-09-15T12:00:00+07:00');
const night = new Date('2026-09-15T21:00:00+07:00');
assert.equal(themeEngine.resolve('normal', 'auto', day).phase, 'day');
assert.equal(themeEngine.resolve('normal', 'auto', night).phase, 'night');
assert.equal(themeEngine.resolve('normal', 'day', night).phase, 'day', 'A manual override stays fixed');
assert.equal(themeEngine.resolve('normal', 'night', day).phase, 'night');
for (const id of ['williams-2001', 'williams-2014', 'redbull-suzuka-2025', 'redbull-porcelain']) assert.equal(themeEngine.resolve(id, 'night', night).dark, false, `${id} retains its white bodywork`);

// Sample every minute of both transitions throughout the year. Text, muted
// labels, and interactive accents must survive every grey in the sunset fade.
let twilightSamples = 0;
for (let month = 1; month <= 12; month++) {
  for (const sunrise of [true, false]) {
    let previous = sunrise ? 1 : 0;
    for (let minute = 0; minute < 210; minute++) {
      const date = new Date(`2026-${String(month).padStart(2, '0')}-15T${sunrise ? '04' : '16'}:30:00+07:00`);
      date.setTime(date.getTime() + minute * 60000);
      const theme = themeEngine.resolve('normal', 'auto', date);
      assert(sunrise ? theme.progress <= previous : theme.progress >= previous, 'Solar transition is monotonic');
      previous = theme.progress;
      if (theme.phase === 'twilight') twilightSamples++;
      for (const text of ['text', 'muted', 'accent']) for (const surface of ['canvas', 'surface', 'raised', 'inset']) {
        assert(themeEngine.contrast(theme.palette[text], theme.palette[surface]) >= 4.5, `Low contrast: ${date.toISOString()} ${text}/${surface}`);
      }
    }
  }
}
assert(twilightSamples > 100, 'Auto has a real twilight interval');
for (const id of LIVERIES) {
  const { palette } = themeEngine.resolve(id, 'day', day);
  for (const text of ['text', 'muted', 'accent']) for (const surface of ['canvas', 'surface', 'raised', 'inset']) assert(themeEngine.contrast(palette[text], palette[surface]) >= 4.5, `${id}: ${text}/${surface} contrast`);
  assert(themeEngine.contrast(palette.heroAccent, palette.hero) >= 4.5, `${id}: hero accent contrast`);
}

function boot(saved, blockStorage = false) {
  const classes = new Set(['ferrari', 'w09-ferrari', 'w09-monza']);
  const properties = new Map();
  const root = { dataset: {}, style: { setProperty: (name, value) => properties.set(name, value), removeProperty: name => properties.delete(name) }, classList: { add: (...names) => names.forEach(n => classes.add(n)), remove: (...names) => names.forEach(n => classes.delete(n)), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) } };
  const localStorage = { getItem: key => { if (blockStorage) throw Error('blocked'); return saved[key] ?? null; }, setItem: (key, value) => { saved[key] = value; } };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [day.getTime()])); } }
  runInNewContext(THEME_BOOT_SCRIPT, { document: { documentElement: root }, localStorage, Date: Clock });
  return { root, classes, properties };
}
for (const id of [...LIVERIES, ...Object.keys(LEGACY_LIVERIES), 'bad-value']) {
  for (const mode of MODES) {
    const { root, classes, properties } = boot({ vest_livery: id, vest_mode: mode });
    const expected = themeEngine.resolve(themeEngine.livery(id) ?? 'system', mode, day);
    assert.equal(root.dataset.livery, expected.livery);
    assert.equal(root.dataset.phase, expected.phase);
    assert.equal(classes.has('dark'), expected.appearance === 'dark', 'Appearance follows the mode, not the livery');
    assert.equal(properties.get('--livery-canvas'), expected.palette.canvas, 'Boot and hydrated engine use the same palette');
    assert.equal(properties.get('--accent'), expected.environment?.['--accent'], 'Boot applies the livery accent before paint');
    assert(!classes.has('ferrari') && !classes.has('w09-monza'), 'Old classes cannot leak across selections');
  }
}
assert.equal(boot({}, true).root.dataset.mode, 'night', 'Blocked storage still produces a readable theme');
assert(boot({}).classes.has('dark'), 'Dark first: nothing stored opens dark');
assert(!boot({ vest_mode: 'day' }).classes.has('dark'), 'Light is available on request');
assert(boot({ vest_livery: 'williams-2014', vest_mode: 'night' }).classes.has('dark'), 'A light livery does not lighten the interface');
assert.equal(boot({}).root.dataset.livery, 'system', 'First visits open on the system paint');
assert.equal(boot({ vest_livery: 'normal' }).root.dataset.livery, 'normal', 'A saved livery is kept');

// Every livery repaints the environment, and stays readable doing it: text and
// accent on all four surfaces, in both appearances, day and night.
let environmentChecks = 0;
for (const id of LIVERIES) {
  for (const [mode, date] of [['night', night], ['day', day], ['auto', day], ['auto', night]]) {
    const theme = themeEngine.resolve(id, mode, date);
    if (id === 'system') { assert.equal(theme.environment, null, 'The system paint keeps the stylesheet tokens'); continue; }
    const env = theme.environment;
    const strong = theme.appearance === 'dark' ? '#f0f1ed' : '#0c0e10';
    for (const surface of ['--bg-root', '--bg-01', '--bg-02', '--bg-03']) {
      for (const text of ['--text-secondary', '--text-muted', '--accent']) {
        assert(themeEngine.contrast(env[text], env[surface]) >= 4.5, `${id}/${mode}/${theme.appearance}: ${text} on ${surface}`);
      }
      assert(themeEngine.contrast(strong, env[surface]) >= 7, `${id}/${theme.appearance}: strong text on ${surface}`);
      environmentChecks++;
    }
    // Labels on accent fills are short and medium weight: 3:1 is the floor.
    assert(themeEngine.contrast(env['--on-accent'], env['--accent']) >= 3, `${id}: label on accent`);
  }
}
const accents = new Set(LIVERIES.map(id => themeEngine.resolve(id, 'night', night).environment?.['--accent'] ?? 'system'));
assert(accents.size >= LIVERIES.length - 1, 'Liveries produce distinct accents');
assert(boot({ vest_lowpower: '1' }).classes.has('low-power'));
const base = validatePreferences({ livery: 'monza', mode: 'day' });
const remote = validatePreferences({ livery: 'williams-1996', mode: 'day' });
assert.equal(reconcilePreferences(base, { mode: 'auto' }, remote).values.mode, 'auto', 'Migration does not create a false sync conflict');
// VS Code colour themes: independent of the livery, readable in both
// variants, applied before paint exactly as after hydration, and synced.
const { COLOR_THEMES } = await jiti.import('../lib/vscode-themes.ts');
let themeChecks = 0;
for (const th of COLOR_THEMES.filter((id) => id !== 'vestrippn')) {
  for (const mode of ['night', 'day']) {
    const first = themeEngine.resolve('system', mode, day, th);
    const env = first.environment;
    for (const surface of ['--bg-root', '--bg-01', '--bg-02', '--bg-03']) {
      for (const text of ['--text-strong', '--text-primary', '--text-secondary', '--text-muted', '--accent']) {
        assert(themeEngine.contrast(env[text], env[surface]) >= 4.5, `${th}/${mode}: ${text} on ${surface}`);
        themeChecks++;
      }
    }
    assert(themeEngine.contrast(env['--shell-status-fg'], env['--shell-status-bg']) >= 4.5, `${th}/${mode}: status bar text`);
    assert(themeEngine.contrast(env['--shell-title-fg'], env['--shell-title-bg']) >= 4.5, `${th}/${mode}: title bar text`);
    assert(themeEngine.contrast(env['--on-accent'], env['--accent']) >= 3, `${th}/${mode}: label on accent`);
    for (const id of ['normal', 'williams-1993', 'redbull-porcelain', 'senna']) {
      const other = themeEngine.resolve(id, mode, day, th);
      assert.deepEqual(other.environment, env, `${th}: the livery (${id}) does not tint a VS Code theme`);
      assert.equal(other.appearance, first.appearance, `${th}: appearance still follows the mode`);
    }
    const { root, properties, classes } = boot({ vest_livery: 'senna', vest_mode: mode, vest_theme: th });
    assert.equal(root.dataset.theme, th, 'Boot applies the saved colour theme');
    assert.equal(classes.has('dark'), mode === 'night');
    for (const [key, value] of Object.entries(env)) assert.equal(properties.get(key), value, `${th}/${mode}: boot parity for ${key}`);
    assert.equal(properties.get('--livery-stripe'), LIVERY_CATALOG.senna.stripe, 'The livery stripe stays with a VS Code theme');
  }
}
const plain = boot({ vest_theme: 'made-up' });
assert.equal(plain.root.dataset.theme, 'vestrippn', 'Unknown themes fall back to VESTRIPPN');
assert(!plain.properties.has('--shell-status-bg'), 'The default theme keeps the stylesheet shell tokens');
assert.deepEqual(validatePreferences({ theme: 'vscode-modern' }), { theme: 'vscode-modern' });
assert.throws(() => validatePreferences({ theme: 'monokai-hacked' }));
console.log(`Theme checks passed: ${COLOR_THEMES.length - 1} VS Code themes x 2 variants (${themeChecks} contrast checks, boot parity, livery independence),`);
console.log(`Theme checks passed: ${LIVERIES.length} liveries, ${twilightSamples} twilight samples, ${environmentChecks} environment surface checks, readable palettes, migration, sync, and pre-paint parity.`);
