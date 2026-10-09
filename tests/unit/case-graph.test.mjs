import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { validateCase, hasErrors, renameNode, deleteNode, blankCase, freshId } = await load('lib/learn/case-graph.ts');
const errors = (c) => validateCase(c).filter((i) => i.level === 'error');
const clone = (v) => JSON.parse(JSON.stringify(v));

test('a blank case is valid apart from house-style warnings and empty fields', () => {
  const c = blankCase();
  c.specialty = 'Respiratory System';
  c.scenario = 'A patient arrives.';
  assert.deepEqual(errors(c), []);
  assert.ok(validateCase(c).some((i) => i.level === 'warning' && /4–5 choices/.test(i.message)));
});

test('broken links, unreachable nodes, loops and leaks are errors', () => {
  const base = blankCase();
  base.specialty = 'x';
  base.scenario = 'y';

  const broken = clone(base);
  broken.branches.nodes.start.choices[0].next = 'nowhere';
  assert.ok(errors(broken).some((i) => /does not exist/.test(i.message) && i.choiceId === 'a'));

  const orphan = clone(base);
  orphan.branches.nodes.orphan = { content: 'lost', choices: [], end: 'died' };
  assert.ok(errors(orphan).some((i) => i.nodeId === 'orphan' && /No path/.test(i.message)));

  const loop = clone(base);
  loop.branches.nodes.start.choices = [{ id: 'a', label: 'Wait', outcome: 'optimal', scoreDelta: 0, feedback: 'Again.', next: 'start' }];
  assert.ok(errors(loop).some((i) => i.nodeId === 'start' && /loops forever/.test(i.message)));

  const leak = clone(base);
  leak.branches.nodes.start.choices[0].label = 'The optimal move';
  assert.ok(errors(leak).some((i) => /gives the outcome away/.test(i.message)));

  const noOptimal = clone(base);
  noOptimal.branches.nodes.start.choices[0].outcome = 'suboptimal';
  assert.ok(errors(noOptimal).some((i) => /optimal choice/.test(i.message)));

  const endingWithChoices = clone(base);
  endingWithChoices.branches.nodes.died.choices = clone(base.branches.nodes.start.choices);
  assert.ok(hasErrors(validateCase(endingWithChoices)));
});

test('renaming a node rewires its links; deleting one leaves links to fix', () => {
  const c = blankCase().branches;
  const renamed = renameNode(c, 'survived', 'recovery');
  assert.equal(renamed.nodes.start.choices[0].next, 'recovery');
  assert.ok(renamed.nodes.recovery && !renamed.nodes.survived);
  assert.equal(renameNode(c, 'start', 'begin').startNodeId, 'begin');
  assert.equal(renameNode(c, 'start', 'died'), c, 'no rename onto an existing id');
  const deleted = deleteNode(c, 'died');
  assert.equal(deleted.nodes.start.choices[1].next, '');
  assert.equal(deleteNode(c, 'start'), c, 'the start node stays');
  assert.equal(freshId(['node-1', 'node-2']), 'node-3');
});
