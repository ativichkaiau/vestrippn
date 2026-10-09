import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { rankEntries, navEntries, STATIC_ENTRIES, score } = await load('lib/system/search.ts');
const { resolveNav, DEFAULT_NAV } = await load('lib/system/nav-layout.ts');

test('search ranks substrings first and finds renamed tabs by old names', () => {
  const nav = resolveNav(DEFAULT_NAV);
  nav.environment.find((item) => item.id === 'env:medicine').label = 'med school';
  const all = [...navEntries(nav), ...STATIC_ENTRIES];
  assert.equal(rankEntries(all, 'med school')[0].label, 'Open med school');
  assert(rankEntries(all, 'medicine').some((entry) => entry.label === 'Open med school'));
  assert.equal(rankEntries(all, 'zzzzqqq').length, 0);
  assert.equal(score('abc', 'xyz'), null);
});

test('workbench state parses defensively', async () => {
  // workbench.ts is a client module; its parser is pure.
  const { parseWorkbench, DEFAULT_WORKBENCH } = await load('lib/system/workbench.ts');
  assert.deepEqual(parseWorkbench(null), DEFAULT_WORKBENCH);
  assert.deepEqual(parseWorkbench('{bad'), DEFAULT_WORKBENCH);
  const parsed = parseWorkbench(JSON.stringify({ sidebar: false, view: 'search', panel: true, panelTab: 'output', collapsed: ['systems', 4] }));
  assert.deepEqual(parsed, { sidebar: false, view: 'search', panel: true, panelTab: 'output', collapsed: ['systems'], split: null, splitSize: 0.5 });
  assert.equal(parseWorkbench(JSON.stringify({ view: 'evil' })).view, 'explorer');
  assert.equal(parseWorkbench(JSON.stringify({ view: 'outline' })).view, 'outline');
  // The split group only ever holds an in-app page, and its width is clamped.
  assert.equal(parseWorkbench(JSON.stringify({ split: '/research?x=1', splitSize: 0.9 })).split, '/research?x=1');
  assert.equal(parseWorkbench(JSON.stringify({ splitSize: 0.9 })).splitSize, 0.75);
  for (const bad of ['https://evil.example', '//evil.example', '/auth/signin', 'javascript:alert(1)', 7]) {
    assert.equal(parseWorkbench(JSON.stringify({ split: bad })).split, null, String(bad));
  }
});
