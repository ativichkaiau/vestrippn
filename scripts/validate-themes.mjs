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
  const root = { dataset: {}, style: { setProperty: (name, value) => properties.set(name, value) }, classList: { add: (...names) => names.forEach(n => classes.add(n)), remove: (...names) => names.forEach(n => classes.delete(n)), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) } };
  const localStorage = { getItem: key => { if (blockStorage) throw Error('blocked'); return saved[key] ?? null; }, setItem: (key, value) => { saved[key] = value; } };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [day.getTime()])); } }
  runInNewContext(THEME_BOOT_SCRIPT, { document: { documentElement: root }, localStorage, Date: Clock });
  return { root, classes, properties };
}
for (const id of [...LIVERIES, ...Object.keys(LEGACY_LIVERIES), 'bad-value']) {
  for (const mode of MODES) {
    const { root, classes, properties } = boot({ vest_livery: id, vest_mode: mode });
    const expected = themeEngine.resolve(themeEngine.livery(id) ?? 'normal', mode, day);
    assert.equal(root.dataset.livery, expected.livery);
    assert.equal(root.dataset.phase, expected.phase);
    assert.equal(classes.has('dark'), expected.dark);
    assert.equal(properties.get('--livery-canvas'), expected.palette.canvas, 'Boot and hydrated engine use the same palette');
    assert(!classes.has('ferrari') && !classes.has('w09-monza'), 'Old classes cannot leak across selections');
  }
}
assert.equal(boot({}, true).root.dataset.mode, 'auto', 'Blocked storage still produces a readable theme');
assert(boot({ vest_lowpower: '1' }).classes.has('low-power'));
const base = validatePreferences({ livery: 'monza', mode: 'day' });
const remote = validatePreferences({ livery: 'williams-1996', mode: 'day' });
assert.equal(reconcilePreferences(base, { mode: 'auto' }, remote).values.mode, 'auto', 'Migration does not create a false sync conflict');
console.log(`Theme checks passed: ${LIVERIES.length} liveries, ${twilightSamples} twilight samples, readable palettes, migration, sync, and pre-paint parity.`);
