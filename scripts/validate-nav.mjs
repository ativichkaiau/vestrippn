import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

// Editable navigation: the stored layout is validated on every device and on
// the server, so a bad or hostile value must never reach the sidebar.
const jiti = createJiti(import.meta.url);
const nav = await jiti.import('../lib/system/nav-layout.ts');
const { ENVIRONMENT_NAV, RUNTIME_NAV, isCurrent } = await jiti.import('../lib/system/navigation.ts');
const { validatePreferences, reconcilePreferences } = await jiti.import('../lib/device-sync.ts');
const { DEFAULT_NAV, DEFAULT_NAV_STRING, parseNavLayout, readNavLayout, resolveNav, serializeNavLayout, toEntries, checkHref, MAX_CUSTOM } = nav;

// Defaults reproduce the shipped navigation exactly.
const defaults = resolveNav(DEFAULT_NAV);
assert.deepEqual(defaults.environment.map((item) => [item.label, item.href]), ENVIRONMENT_NAV.map((item) => [item.label, item.href]));
assert.deepEqual(defaults.runtime.map((item) => [item.label, item.href]), RUNTIME_NAV.map((item) => [item.label, item.href]));
assert.deepEqual(defaults.environment.map((item) => item.index), ENVIRONMENT_NAV.map((item) => item.index), 'Default numbering is unchanged');
assert.equal(serializeNavLayout(toEntries(defaults)), DEFAULT_NAV_STRING);
assert.deepEqual(readNavLayout(null), DEFAULT_NAV);
assert.deepEqual(readNavLayout('{not json'), DEFAULT_NAV, 'Corrupt storage falls back to the default');

// Rename, hide, reorder and a custom link survive the sync round trip.
const edited = resolveNav(DEFAULT_NAV);
edited.environment.reverse();
edited.environment.find((item) => item.id === 'env:medicine').label = 'med school';
edited.environment.find((item) => item.id === 'env:logs').hidden = true;
edited.runtime.unshift({ id: 'custom:abc123', group: 'runtime', label: 'WilliamsHub', href: 'https://williamshub.vercel.app', match: [], custom: true, external: true, hidden: false });
edited.environment.push({ id: 'custom:cases1', group: 'environment', label: 'cases', href: '/learn/cases', match: ['/learn/cases'], custom: true, external: false, hidden: false });
const stored = serializeNavLayout(toEntries(edited));
const synced = validatePreferences({ nav: stored });
assert.equal(synced.nav, stored, 'Canonical layouts pass through device sync unchanged');
const again = resolveNav(parseNavLayout(synced.nav));
assert.equal(again.environment[0].id, 'env:contact');
assert.equal(again.environment.find((item) => item.id === 'env:medicine').label, 'med school');
assert.equal(again.environment.find((item) => item.id === 'env:logs').hidden, true);
assert.equal(again.environment.find((item) => item.id === 'env:logs').index, undefined, 'Hidden tabs take no number');
assert.deepEqual(again.environment.filter((item) => !item.hidden).map((item) => item.index), ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09']);
assert.equal(again.runtime[0].external, true);
assert.equal(isCurrent(again.environment.at(-1), '/learn/cases'), true, 'Custom in-app tabs light up on their route');
assert.equal(reconcilePreferences({ nav: DEFAULT_NAV_STRING }, { nav: stored }, { nav: DEFAULT_NAV_STRING }).conflicts, 0);
assert.equal(reconcilePreferences({ nav: DEFAULT_NAV_STRING }, { nav: stored }, { nav: serializeNavLayout([]) }).conflicts, 0, 'Equivalent layouts compare equal');

// root can be renamed but never hidden; built-ins can't change group or gain links.
assert.equal(resolveNav(parseNavLayout([{ id: 'env:root', group: 'environment', hidden: true }])).environment[0].hidden, false);
assert.equal(resolveNav(parseNavLayout([{ id: 'rt:tools', group: 'environment' }])).runtime.some((item) => item.id === 'rt:tools'), true);
assert.throws(() => parseNavLayout([{ id: 'env:root', group: 'environment', href: 'https://evil.example' }]));

// Missing built-ins return; retired ones are dropped quietly.
const partial = resolveNav(parseNavLayout([{ id: 'env:garage', group: 'environment' }, { id: 'env:retired-page', group: 'environment' }]));
assert.equal(partial.environment[0].id, 'env:garage');
assert.equal(partial.environment.length, ENVIRONMENT_NAV.length);
assert.equal(partial.runtime.length, RUNTIME_NAV.length);

// Hostile or malformed values are rejected.
const custom = (extra) => [{ id: 'custom:x1', group: 'environment', label: 'x', href: '/x', ...extra }];
for (const bad of [
  'not json',
  {},
  [null],
  [{ id: 'env:root', group: 'sidebar' }],
  [{ id: 'env:root', group: 'environment' }, { id: 'env:root', group: 'environment' }],
  [{ id: 'env:root', group: 'environment', colour: 'red' }],
  [{ id: 'env:root', group: 'environment', label: '' }],
  [{ id: 'env:root', group: 'environment', label: 'x'.repeat(33) }],
  [{ id: 'env:root', group: 'environment', label: 'a\u0000b' }],
  [{ id: 'env:root', group: 'environment', hidden: 'yes' }],
  custom({ href: 'javascript:alert(1)' }),
  custom({ href: '//evil.example' }),
  custom({ href: 'data:text/html,hi' }),
  custom({ href: '/has space' }),
  custom({ href: undefined }),
  custom({ label: undefined }),
  [{ id: 'custom:BAD', group: 'environment', label: 'x', href: '/x' }],
  Array.from({ length: MAX_CUSTOM + 1 }, (_, i) => ({ id: `custom:c${i}`, group: 'runtime', label: `c${i}`, href: '/x' })),
]) {
  assert.throws(() => parseNavLayout(bad), undefined, `Rejects ${JSON.stringify(bad).slice(0, 80)}`);
  assert.throws(() => validatePreferences({ nav: typeof bad === 'string' ? bad : JSON.stringify(bad) }));
}
assert.equal(checkHref('HTTPS://Example.com/a b').error !== undefined, true);
assert.equal(checkHref('https://example.com/path'), 'https://example.com/path');
assert.equal(checkHref(' /learn/cases '), '/learn/cases');

console.log(`Navigation checks passed: ${ENVIRONMENT_NAV.length} environment + ${RUNTIME_NAV.length} runtime tabs, rename/hide/reorder/custom round trip, sync equality, and hostile layouts rejected.`);
