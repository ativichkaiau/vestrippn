import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { run, resolveTarget } = await load('lib/system/terminal.ts');
const { resolveNav, DEFAULT_NAV } = await load('lib/system/nav-layout.ts');
const nav = resolveNav(DEFAULT_NAV);
const ctx = (over = {}) => ({ pathname: '/', nav, user: null, colorTheme: 'vestrippn', livery: 'system', liveries: ['system', 'senna'], appearance: 'dark', tabs: [], history: [], now: new Date(0), ...over });

test('help, pwd and unknown commands', () => {
  assert(run('help', ctx()).output.length > 5);
  assert.deepEqual(run('pwd', ctx({ pathname: '/academics' })).output, ['~/medicine/academics']);
  const unknown = run('rm -rf /', ctx());
  assert.equal(unknown.error, true);
  assert.match(unknown.output[0], /command not found/);
  assert.deepEqual(run('   ', ctx()).output, []);
});

test('ls lists the tree', () => {
  const root = run('ls', ctx()).output;
  assert(root.includes('medicine') && root.includes('academics') && !root.includes('root'));
  assert(run('ls', ctx({ pathname: '/systems' })).output.includes('vestrippn'));
  assert.equal(run('ls /nowhere', ctx()).error, true);
});

test('cd and open resolve names, paths and parents', () => {
  assert.deepEqual(run('cd medicine', ctx()).effect, { type: 'navigate', href: '/medicine' });
  assert.deepEqual(run('cd ~/medicine/academics', ctx()).effect, { type: 'navigate', href: '/academics' });
  assert.deepEqual(run('cd ..', ctx({ pathname: '/systems/vestrippn' })).effect, { type: 'navigate', href: '/systems' });
  assert.deepEqual(run('cd', ctx()).effect, { type: 'navigate', href: '/' });
  assert.equal(resolveTarget('vestrippn', ctx()), '/systems/vestrippn');
  assert.equal(run('cd nowhere', ctx()).error, true);
  assert.deepEqual(run('open https://example.com', ctx()).effect, { type: 'external', href: 'https://example.com/' });
  assert.equal(run('open javascript:alert(1)', ctx()).error, true);
});

test('settings commands return effects, not side effects', () => {
  assert.deepEqual(run('theme classic', ctx()).effect, { type: 'theme', value: 'vscode-classic' });
  assert.equal(run('theme neon', ctx()).error, true);
  assert.match(run('theme', ctx({ colorTheme: 'vscode-modern' })).output.join('\n'), /\* modern/);
  assert.deepEqual(run('appearance light', ctx()).effect, { type: 'appearance', value: 'light' });
  assert.deepEqual(run('livery senna', ctx()).effect, { type: 'livery', value: 'senna' });
  assert.equal(run('livery ferrari', ctx()).error, true);
  assert.deepEqual(run('find anki', ctx()).effect, { type: 'palette', query: 'anki' });
  assert.deepEqual(run('clear', ctx()).effect, { type: 'clear' });
});
