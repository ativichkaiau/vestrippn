import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const tabs = await load('lib/system/editor-tabs.ts');
const { openTab, closeTab, closeOthers, closeToRight, closeAll, togglePin, moveTab, parseTabs, tabPath, describeTab, MAX_TABS } = tabs;
const { resolveNav, DEFAULT_NAV } = await load('lib/system/nav-layout.ts');
const paths = (list) => list.map((tab) => tab.path);

test('tab identity is the pathname', () => {
  assert.equal(tabPath('/workspace?tab=coverage'), '/workspace');
  assert.equal(tabPath('/systems/'), '/systems');
  assert.equal(tabPath('/'), '/');
});

test('opens to the right of the active tab and refocuses existing ones', () => {
  let list = openTab([], '/a');
  list = openTab(list, '/b', '/a');
  list = openTab(list, '/c', '/a');
  assert.deepEqual(paths(list), ['/a', '/c', '/b']);
  const again = openTab(list, '/b?x=1', '/c');
  assert.deepEqual(paths(again), ['/a', '/c', '/b'], 'no duplicate tab');
  assert.equal(again[2].href, '/b?x=1', 'remembers the latest query');
  assert.equal(openTab(list, '//evil.example'), list, 'rejects protocol-relative URLs');
});

test('never exceeds the limit and keeps pinned and active tabs', () => {
  let list = togglePin(openTab([], '/p0'), '/p0');
  for (let i = 1; i <= MAX_TABS + 4; i++) list = openTab(list, `/t${i}`, `/t${i - 1}`);
  assert.equal(list.length, MAX_TABS);
  assert.equal(list[0].path, '/p0');
  assert(list.some((tab) => tab.path === `/t${MAX_TABS + 4}`));
});

test('closing picks the right neighbour, then the left', () => {
  const list = ['/a', '/b', '/c'].reduce((acc, href) => openTab(acc, href), []);
  assert.equal(closeTab(list, '/b').next.path, '/c');
  assert.equal(closeTab(list, '/c').next.path, '/b');
  assert.equal(closeTab(openTab([], '/a'), '/a').next, undefined);
});

test('close others / to the right / all keep pinned tabs', () => {
  let list = ['/a', '/b', '/c', '/d'].reduce((acc, href) => openTab(acc, href), []);
  list = togglePin(list, '/d');
  assert.deepEqual(paths(list), ['/d', '/a', '/b', '/c']);
  assert.deepEqual(paths(closeOthers(list, '/b')), ['/d', '/b']);
  assert.deepEqual(paths(closeToRight(list, '/a')), ['/d', '/a']);
  assert.deepEqual(paths(closeAll(list)), ['/d']);
  assert.deepEqual(paths(togglePin(list, '/d')), ['/d', '/a', '/b', '/c'], 'unpinned tab leads the unpinned group');
});

test('moving stays within the pinned or unpinned group', () => {
  const list = togglePin(['/a', '/b', '/c'].reduce((acc, href) => openTab(acc, href), []), '/a');
  assert.deepEqual(paths(moveTab(list, 2, 0)), ['/a', '/c', '/b']);
  assert.deepEqual(paths(moveTab(list, 0, 2)), ['/a', '/b', '/c']);
});

test('parsing drops anything malformed', () => {
  const parsed = parseTabs(JSON.stringify([{ href: '/a' }, { href: '/a?x' }, { href: 'https://x.y' }, { href: '/b', pinned: true }, null, 3]));
  assert.deepEqual(parsed, [{ path: '/b', href: '/b', pinned: true }, { path: '/a', href: '/a' }]);
  assert.deepEqual(parseTabs('not json'), []);
});

test('tabs use the operator’s tab names', () => {
  const nav = resolveNav(DEFAULT_NAV);
  nav.environment.find((item) => item.id === 'env:medicine').label = 'med school';
  assert.equal(describeTab('/medicine', nav).label, 'med school');
  assert.equal(describeTab('/academics', nav).kind, 'runtime');
  assert.equal(describeTab('/systems/vestrippn', nav).kind, 'system');
  assert.equal(describeTab('/', nav).label, 'root');
});
