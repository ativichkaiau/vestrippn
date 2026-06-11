import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const EXPECTED_CASE_COUNT = 29;
const EXPECTED_SPECIALTIES = new Set([
  "Cardiovascular System",
  "Digestive and Biliary Tract System",
  "Endocrine System",
  "Gross Anatomy",
  "Microbiology and Parasitology",
  "Nervous and Special Senses System",
  "Renal and Urinary Tract",
  "Reproductive System and Perinatal Period",
  "Respiratory System",
]);
const PUBLIC_LEAK_RE = /\b(optimal|suboptimal|deadly|correct choice|incorrect choice)\b/i;

function loadCases() {
  const sourcePath = join(process.cwd(), "scripts", "branching-cases.ts");
  const source = readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: sourcePath,
  }).outputText;

  const tempDir = mkdtempSync(join(tmpdir(), "vestrippn-cases-"));
  const tempFile = join(tempDir, "branching-cases.mjs");
  writeFileSync(tempFile, output);
  return import(pathToFileURL(tempFile).href).finally(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });
}

function validateCase(entry, errors) {
  const prefix = entry?.id ?? "<missing id>";
  if (!entry || typeof entry !== "object") {
    errors.push("Case entry is not an object");
    return;
  }
  if (!entry.nodes || typeof entry.nodes !== "object") {
    errors.push(`${prefix}: missing nodes`);
    return;
  }
  if (!entry.nodes[entry.startNodeId]) {
    errors.push(`${prefix}: startNodeId does not exist`);
  }

  const terminalEnds = new Set();
  const reachable = new Set();
  const stack = entry.nodes[entry.startNodeId] ? [entry.startNodeId] : [];
  let hasNonAOptimal = false;

  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (reachable.has(nodeId)) continue;
    reachable.add(nodeId);
    const node = entry.nodes[nodeId];
    if (!node) continue;

    if (node.end) {
      terminalEnds.add(node.end);
      if (Array.isArray(node.choices) && node.choices.length > 0) {
        errors.push(`${prefix}/${nodeId}: terminal node should not expose choices`);
      }
      continue;
    }

    if (!Array.isArray(node.choices)) {
      errors.push(`${prefix}/${nodeId}: active node has no choices array`);
      continue;
    }
    if (node.choices.length < 4 || node.choices.length > 5) {
      errors.push(`${prefix}/${nodeId}: expected 4-5 choices, found ${node.choices.length}`);
    }
    if (!node.choices.some((choice) => choice.outcome === "optimal")) {
      errors.push(`${prefix}/${nodeId}: active node has no optimal choice`);
    }

    const choiceIds = new Set();
    for (const choice of node.choices) {
      if (choiceIds.has(choice.id)) {
        errors.push(`${prefix}/${nodeId}: duplicate choice id ${choice.id}`);
      }
      choiceIds.add(choice.id);
      if (!entry.nodes[choice.next]) {
        errors.push(`${prefix}/${nodeId}/${choice.id}: next node ${choice.next} does not exist`);
      } else {
        stack.push(choice.next);
      }
      if (choice.outcome === "optimal" && choice.id !== "a") {
        hasNonAOptimal = true;
      }
      const publicText = `${choice.label ?? ""} ${choice.detail ?? ""}`;
      if (PUBLIC_LEAK_RE.test(publicText)) {
        errors.push(`${prefix}/${nodeId}/${choice.id}: public choice text leaks outcome language`);
      }
    }
  }

  for (const nodeId of Object.keys(entry.nodes)) {
    if (!reachable.has(nodeId)) {
      errors.push(`${prefix}/${nodeId}: node is unreachable from startNodeId`);
    }
  }
  if (!terminalEnds.has("survived")) {
    errors.push(`${prefix}: no reachable survived terminal`);
  }
  if (!terminalEnds.has("died")) {
    errors.push(`${prefix}: no reachable died terminal`);
  }
  if (!hasNonAOptimal) {
    errors.push(`${prefix}: every optimal choice landed on A after shuffling`);
  }
}

const { branchingCases } = await loadCases();
const errors = [];

if (!Array.isArray(branchingCases)) {
  errors.push("branchingCases is not an array");
} else {
  if (branchingCases.length !== EXPECTED_CASE_COUNT) {
    errors.push(`Expected ${EXPECTED_CASE_COUNT} cases, found ${branchingCases.length}`);
  }

  const ids = new Set();
  const specialties = new Set();
  for (const entry of branchingCases) {
    if (ids.has(entry.id)) {
      errors.push(`Duplicate case id ${entry.id}`);
    }
    ids.add(entry.id);
    specialties.add(entry.specialty);
    validateCase(entry, errors);
  }

  for (const specialty of EXPECTED_SPECIALTIES) {
    if (!specialties.has(specialty)) {
      errors.push(`Missing specialty ${specialty}`);
    }
  }
  for (const specialty of specialties) {
    if (!EXPECTED_SPECIALTIES.has(specialty)) {
      errors.push(`Unexpected specialty ${specialty}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Branching case validation failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Branching case validation passed: ${branchingCases.length} cases across ${EXPECTED_SPECIALTIES.size} systems.`);
