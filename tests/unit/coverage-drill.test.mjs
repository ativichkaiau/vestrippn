import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { weakness, pickWeakest, caseSpecialtyFor, countdown, daysUntil } = await load('lib/coverage-drill.ts');
const result = (correct, total, recordedAt) => ({ id: `r${recordedAt}`, label: 'x', correct, total, recordedAt, url: null });
const obj = (key, status, results = [], updatedAt = null) => ({ key, status, results, updatedAt });

test('weakness: untouched, then low test scores, then reviewed, then good scores', () => {
  assert.equal(weakness(obj('a', 'untouched')), 1);
  assert.equal(weakness(obj('b', 'tested', [result(1, 5, '2026-01-01')])), 0.8);
  assert.equal(weakness(obj('c', 'reviewed')), 0.6);
  assert.equal(weakness(obj('d', 'tested', [result(9, 10, '2026-01-01')])), 0.1);
  // Only the last three results count.
  const many = [result(0, 1, '2026-01-01'), result(1, 1, '2026-01-02'), result(1, 1, '2026-01-03'), result(1, 1, '2026-01-04')];
  assert.equal(weakness(obj('e', 'tested', many)), 0);
  const order = pickWeakest([obj('good', 'tested', [result(9, 10, '2026-01-01')]), obj('rev', 'reviewed'), obj('low', 'tested', [result(1, 5, '2026-01-01')]), obj('new', 'untouched')], 3);
  assert.deepEqual(order.map((o) => o.key), ['new', 'low', 'rev']);
});

test('ties go to the objective touched longest ago', () => {
  const order = pickWeakest([obj('recent', 'reviewed', [], '2026-02-01T00:00:00Z'), obj('old', 'reviewed', [], '2026-01-01T00:00:00Z')]);
  assert.deepEqual(order.map((o) => o.key), ['old', 'recent']);
});

test('cases match courses by system', () => {
  assert.equal(caseSpecialtyFor('HRS-2'), 'Respiratory System');
  assert.equal(caseSpecialtyFor('HCVS-1'), 'Cardiovascular System');
  assert.equal(caseSpecialtyFor('BEH'), null);
  assert.equal(caseSpecialtyFor(null), null);
});

test('countdown spreads untouched then reviewed over the days left, keeping two for a drill', () => {
  const now = new Date('2026-10-05T03:00:00Z');
  const exam = new Date('2026-10-15T02:00:00Z');
  assert.equal(daysUntil(exam, now), 10);
  const objectives = [...Array.from({ length: 20 }, (_, i) => obj(`u${i}`, 'untouched')), ...Array.from({ length: 5 }, (_, i) => obj(`r${i}`, 'reviewed')), obj('t', 'tested')];
  const plan = countdown(objectives, exam, now);
  assert.equal(plan.phase, 'cover');
  assert.equal(plan.remaining, 25);
  assert.equal(plan.perDay, 4); // 25 over 8 study days
  assert.deepEqual(plan.today, ['u0', 'u1', 'u2', 'u3']);
  assert.equal(countdown(objectives, new Date('2026-10-07T02:00:00Z'), now).phase, 'drill'); // two days out
  assert.equal(countdown(objectives, new Date('2026-10-08T02:00:00Z'), now).perDay, 25); // one study day left
  assert.equal(countdown([obj('t', 'tested')], exam, now).phase, 'done');
  assert.equal(countdown(objectives, new Date('2026-10-04T02:00:00Z'), now), null);
});

test('the daily agenda carries the exam countdown', async () => {
  const { buildAgenda, studyDay } = await load('lib/daily-plan.ts');
  const now = new Date('2026-10-05T03:00:00Z');
  const base = { tasks: [], milestones: [], deadlines: [], ankiDue: 0, completedItems: [], now };
  const cover = { phase: 'cover', daysLeft: 10, remaining: 25, perDay: 4, today: ['a', 'b', 'c', 'd'] };
  const [item] = buildAgenda({ ...base, countdowns: [{ courseId: 'c1', courseCode: 'HHL', examTitle: 'Final', plan: cover }] });
  assert.equal(item.kind, 'coverage');
  assert.equal(item.id, `coverage:c1:${studyDay(now)}`);
  assert.match(item.title, /HHL: cover 4 objectives today/);
  assert.equal(item.estimatedMinutes, 40);
  const [drill] = buildAgenda({ ...base, countdowns: [{ courseId: 'c1', courseCode: 'HHL', examTitle: 'Final', plan: { phase: 'drill', daysLeft: 1, remaining: 3 } }] });
  assert.equal(drill.href, '/study/drill?course=c1');
  assert.deepEqual(buildAgenda({ ...base, countdowns: [{ courseId: 'c1', courseCode: 'HHL', examTitle: 'Final', plan: { phase: 'done', daysLeft: 3, remaining: 0 } }] }), []);
  const done = buildAgenda({ ...base, completedItems: [`coverage:c1:${studyDay(now)}`], countdowns: [{ courseId: 'c1', courseCode: 'HHL', examTitle: 'Final', plan: cover }] });
  assert.equal(done[0].completed, true);
});
