import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { isMiss, nextReview, isDue, REVIEW_INTERVAL_DAYS } = await load('lib/learn/review.ts');
const DAY = 86_400_000;
const now = new Date('2026-10-05T00:00:00Z');
const days = (state) => (state.dueAt.getTime() - now.getTime()) / DAY;

test('a miss is a death or any deadly choice', () => {
  assert.equal(isMiss('died', []), true);
  assert.equal(isMiss('survived', [{ outcome: 'optimal' }, { outcome: 'deadly' }]), true);
  assert.equal(isMiss('survived', [{ outcome: 'suboptimal' }, { outcome: 'optimal' }]), false);
});

test('missed cases come back after 1, 3, 7, 14 days, then graduate', () => {
  assert.deepEqual(REVIEW_INTERVAL_DAYS, [1, 3, 7, 14]);
  let state = nextReview(null, true, now);
  assert.equal(state.step, 0);
  assert.equal(days(state), 1);
  for (const expected of [3, 7, 14]) {
    state = nextReview(state, false, now);
    assert.equal(days(state), expected);
  }
  state = nextReview(state, false, now);
  assert.equal(state.dueAt, null, 'graduated');
  // A graduated case stays out of the queue on clean runs...
  assert.equal(nextReview(state, false, now).dueAt, null);
  // ...and a new miss starts again at 1 day.
  assert.equal(days(nextReview(state, true, now)), 1);
});

test('clean runs of never-missed cases store nothing; due is inclusive', () => {
  assert.equal(nextReview(null, false, now), null);
  assert.equal(isDue({ dueAt: now }, now), true);
  assert.equal(isDue({ dueAt: new Date(now.getTime() + 1) }, now), false);
  assert.equal(isDue({ dueAt: null }, now), false);
});
