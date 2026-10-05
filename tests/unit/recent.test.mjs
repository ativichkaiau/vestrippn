import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { addRecent, parseRecent, MAX_RECENT } = await load('lib/system/recent.ts');

test('recent pages: newest first, one entry per route', () => {
  let list = [];
  list = addRecent(list, '/systems');
  list = addRecent(list, '/workspace?tab=coverage');
  list = addRecent(list, '/systems/');
  assert.deepEqual(list, ['/systems/', '/workspace?tab=coverage']);
  list = addRecent(list, '/workspace?tab=plan');
  assert.deepEqual(list, ['/workspace?tab=plan', '/systems/']);
});

test('recent pages: capped and validated', () => {
  let list = [];
  for (let i = 0; i < MAX_RECENT + 5; i++) list = addRecent(list, `/p${i}`);
  assert.equal(list.length, MAX_RECENT);
  assert.equal(list[0], `/p${MAX_RECENT + 4}`);
  assert.deepEqual(addRecent(['/a'], 'https://evil.example'), ['/a']);
  assert.deepEqual(addRecent(['/a'], '//evil.example'), ['/a']);
  assert.deepEqual(parseRecent('["/a","/a/","//x",3,"/b"]'), ['/a', '/b']);
  assert.deepEqual(parseRecent('not json'), []);
});
