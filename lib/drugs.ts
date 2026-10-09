import catalog from '../content/drugs/drugs.json';
import structures from '../content/drugs/structures.json';

/* ════════════════════════════════════════════════════════════════════════
   Drug cards: class, mechanism, typical adult dose, pitfalls, and the
   skeletal formula. The text lives in content/drugs/drugs.json; the
   structures (and the formula and molar mass) are generated from each
   SMILES by scripts/generate-drug-structures.py, so nothing chemical is
   typed by hand. A study aid, not a prescribing reference.
   ════════════════════════════════════════════════════════════════════════ */

export type DrugDose = { use: string; dose: string };
export type DrugStructure = {
  formula: string;
  mass: number;
  width: number;
  height: number;
  lines: number[][];
  wedges: number[][];
  hashes: number[][];
  labels: [number, number, string][];
};
export type Drug = {
  slug: string;
  name: string;
  aliases: string[];
  class: string;
  mechanism: string;
  dose: DrugDose[];
  onset?: string;
  pitfalls: string[];
  cid?: number;
  smiles?: string;
  structureNote?: string;
};

export const DRUG_BASIS: string = catalog.basis;
export const DRUGS: Drug[] = (catalog.drugs as Drug[]).slice().sort((a, b) => a.name.localeCompare(b.name));
const STRUCTURES = structures as unknown as Record<string, DrugStructure>;

export function getDrug(slug: string): Drug | undefined {
  return DRUGS.find((drug) => drug.slug === slug);
}

export function drugStructure(slug: string): DrugStructure | undefined {
  return STRUCTURES[slug];
}

const norm = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();

/** Find a drug by name, alias or slug: exact first, then prefix, then substring. */
export function findDrug(query: string): Drug | undefined {
  const q = norm(query);
  if (!q) return undefined;
  const names = (drug: Drug) => [drug.slug, drug.name, ...drug.aliases].map(norm);
  return (
    DRUGS.find((drug) => names(drug).some((name) => name === q)) ??
    DRUGS.find((drug) => names(drug).some((name) => name.startsWith(q))) ??
    DRUGS.find((drug) => names(drug).some((name) => name.includes(q)))
  );
}

/** Drugs matching a free-text filter over names, class and mechanism. */
export function filterDrugs(query: string): Drug[] {
  const q = norm(query);
  if (!q) return DRUGS;
  return DRUGS.filter((drug) => norm([drug.name, ...drug.aliases, drug.class, drug.mechanism].join(' ')).includes(q));
}
