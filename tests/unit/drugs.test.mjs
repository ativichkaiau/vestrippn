import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const { DRUGS, drugStructure } = await load('lib/drugs.ts');

test('every drug card is complete, and every SMILES has a drawn structure', () => {
  const slugs = new Set();
  for (const drug of DRUGS) {
    assert.ok(!slugs.has(drug.slug), `duplicate ${drug.slug}`);
    slugs.add(drug.slug);
    assert.match(drug.slug, /^[a-z0-9-]+$/);
    for (const field of ['name', 'class', 'mechanism']) assert.ok(drug[field]?.length > 3, `${drug.slug}.${field}`);
    assert.ok(drug.dose.length > 0 && drug.dose.every((dose) => dose.use && dose.dose), `${drug.slug} dose`);
    assert.ok(drug.pitfalls.length > 0, `${drug.slug} pitfalls`);
    if (drug.smiles) {
      const structure = drugStructure(drug.slug);
      assert.ok(structure, `${drug.slug}: run scripts/generate-drug-structures.py`);
      assert.ok(structure.lines.length > 0 && /^C\d/.test(structure.formula), drug.slug);
    } else {
      assert.ok(drug.structureNote, `${drug.slug} needs a SMILES or a structureNote`);
    }
  }
});
