import type { BranchingCase, BranchingChoice, BranchingNode, ChoiceOutcome, PatientStatus } from './content';

/* ════════════════════════════════════════════════════════════════════════
   Branching case validation for the case editor (and its save API).

   Errors block saving: broken links, unreachable nodes, dead ends, an
   active node with no optimal choice, terminal nodes with choices, and
   choice text that gives the outcome away. Warnings are the case bank's
   house style (4–5 choices per decision, both endings reachable) and
   never block. Pure functions; mirrors scripts/validate-branching-cases.
   ════════════════════════════════════════════════════════════════════════ */

export type CaseIssue = { level: 'error' | 'warning'; message: string; nodeId?: string; choiceId?: string };
export type EditableCase = {
  title: string;
  specialty: string;
  scenario: string;
  citations: string[];
  branches: BranchingCase;
};

export const OUTCOMES: ChoiceOutcome[] = ['optimal', 'suboptimal', 'deadly'];
export const PATIENT_STATUSES: PatientStatus[] = ['stable', 'guarded', 'improving', 'worsening', 'unstable', 'critical'];
const ID = /^[a-z0-9][a-z0-9_-]{0,39}$/;
// Choice text is shown before the choice is made: it must not name the outcome.
const LEAK = /\b(optimal|suboptimal|deadly|correct choice|incorrect choice)\b/i;

const LIMITS = { title: 160, specialty: 80, scenario: 4000, content: 4000, label: 300, detail: 400, feedback: 1500, prompt: 300, citation: 500, citations: 20, nodes: 80, choices: 8 };

function text(issues: CaseIssue[], value: unknown, label: string, max: number, where: Partial<CaseIssue> = {}, required = true) {
  if (value === undefined && !required) return;
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) {
    issues.push({ level: 'error', message: `${label} must be ${required ? '1' : '0'}–${max} characters.`, ...where });
  }
}

export function validateCase(input: EditableCase): CaseIssue[] {
  const issues: CaseIssue[] = [];
  text(issues, input.title, 'Title', LIMITS.title);
  text(issues, input.specialty, 'System / specialty', LIMITS.specialty);
  text(issues, input.scenario, 'Scenario', LIMITS.scenario);
  // Blank lines are ignored (the editor keeps them while you type).
  const citations = Array.isArray(input.citations) ? input.citations.filter((c) => typeof c !== 'string' || c.trim()) : null;
  if (!citations || citations.length > LIMITS.citations || citations.some((c) => typeof c !== 'string' || c.length > LIMITS.citation)) {
    issues.push({ level: 'error', message: `Citations: up to ${LIMITS.citations}, one per line, each up to ${LIMITS.citation} characters.` });
  }

  const bc = input.branches;
  const nodes = bc?.nodes && typeof bc.nodes === 'object' ? bc.nodes : {};
  const ids = Object.keys(nodes);
  if (!Number.isInteger(bc?.startScore) || bc.startScore < 1 || bc.startScore > 1000) issues.push({ level: 'error', message: 'Starting score must be a whole number from 1 to 1000.' });
  if (!ids.length) issues.push({ level: 'error', message: 'Add at least one node.' });
  if (ids.length > LIMITS.nodes) issues.push({ level: 'error', message: `At most ${LIMITS.nodes} nodes.` });
  if (!nodes[bc?.startNodeId]) issues.push({ level: 'error', message: 'Choose a start node that exists.' });

  for (const [nodeId, node] of Object.entries(nodes) as [string, BranchingNode][]) {
    const at = { nodeId };
    if (!ID.test(nodeId)) issues.push({ level: 'error', message: 'Node ids use lowercase letters, digits, - and _ (up to 40).', ...at });
    text(issues, node.content, 'Node text', LIMITS.content, at);
    text(issues, node.prompt, 'Prompt', LIMITS.prompt, at, false);
    if (node.end) {
      if (node.choices.length) issues.push({ level: 'error', message: 'An ending cannot have choices.', ...at });
      continue;
    }
    if (!node.choices.length) {
      issues.push({ level: 'error', message: 'A decision needs choices, or mark it as an ending.', ...at });
      continue;
    }
    if (node.choices.length > LIMITS.choices) issues.push({ level: 'error', message: `At most ${LIMITS.choices} choices.`, ...at });
    else if (node.choices.length < 4 || node.choices.length > 5) issues.push({ level: 'warning', message: `The case bank uses 4–5 choices per decision (this has ${node.choices.length}).`, ...at });
    if (!node.choices.some((choice) => choice.outcome === 'optimal')) issues.push({ level: 'error', message: 'Every decision needs at least one optimal choice.', ...at });
    const seen = new Set<string>();
    for (const choice of node.choices as BranchingChoice[]) {
      const where = { nodeId, choiceId: choice.id };
      if (!ID.test(choice.id) || seen.has(choice.id)) issues.push({ level: 'error', message: 'Choice ids must be unique within a node (lowercase, digits, - and _).', ...where });
      seen.add(choice.id);
      text(issues, choice.label, 'Choice text', LIMITS.label, where);
      text(issues, choice.detail, 'Choice detail', LIMITS.detail, where, false);
      text(issues, choice.feedback, 'Feedback', LIMITS.feedback, where);
      if (!OUTCOMES.includes(choice.outcome)) issues.push({ level: 'error', message: 'Pick an outcome.', ...where });
      if (!Number.isInteger(choice.scoreDelta) || Math.abs(choice.scoreDelta) > 1000) issues.push({ level: 'error', message: 'Score change must be a whole number (±1000).', ...where });
      if (!nodes[choice.next]) issues.push({ level: 'error', message: `Leads to “${choice.next || '—'}”, which does not exist.`, ...where });
      if (LEAK.test(`${choice.label ?? ''} ${choice.detail ?? ''}`)) issues.push({ level: 'error', message: 'Choice text gives the outcome away (optimal / deadly / correct…).', ...where });
    }
  }

  // Reachability from the start, and whether every reachable node can still end.
  if (nodes[bc?.startNodeId]) {
    const reachable = new Set<string>();
    const stack = [bc.startNodeId];
    while (stack.length) {
      const id = stack.pop()!;
      if (reachable.has(id) || !nodes[id]) continue;
      reachable.add(id);
      for (const choice of nodes[id].choices) stack.push(choice.next);
    }
    for (const id of ids) if (!reachable.has(id)) issues.push({ level: 'error', message: 'No path from the start reaches this node.', nodeId: id });

    const canEnd = new Set(ids.filter((id) => nodes[id].end));
    for (let changed = true; changed; ) {
      changed = false;
      for (const id of ids) {
        if (!canEnd.has(id) && nodes[id].choices.some((choice) => canEnd.has(choice.next))) {
          canEnd.add(id);
          changed = true;
        }
      }
    }
    for (const id of reachable) if (!canEnd.has(id)) issues.push({ level: 'error', message: 'Every path from here loops forever: no ending can be reached.', nodeId: id });

    const ends = new Set([...reachable].map((id) => nodes[id].end).filter(Boolean));
    if (!ends.has('survived')) issues.push({ level: 'warning', message: 'No reachable “survived” ending.' });
    if (!ends.has('died')) issues.push({ level: 'warning', message: 'No reachable “died” ending.' });
  }
  return issues;
}

export const hasErrors = (issues: CaseIssue[]) => issues.some((issue) => issue.level === 'error');

/** Rename a node and every choice that leads to it. */
export function renameNode(bc: BranchingCase, from: string, to: string): BranchingCase {
  if (from === to || !bc.nodes[from] || bc.nodes[to]) return bc;
  const nodes: Record<string, BranchingNode> = {};
  for (const [id, node] of Object.entries(bc.nodes)) {
    nodes[id === from ? to : id] = { ...node, choices: node.choices.map((choice) => (choice.next === from ? { ...choice, next: to } : choice)) };
  }
  return { ...bc, nodes, startNodeId: bc.startNodeId === from ? to : bc.startNodeId };
}

/** Remove a node; choices that led to it are pointed at nothing (an error until fixed). */
export function deleteNode(bc: BranchingCase, id: string): BranchingCase {
  if (!bc.nodes[id] || id === bc.startNodeId) return bc;
  const nodes: Record<string, BranchingNode> = {};
  for (const [key, node] of Object.entries(bc.nodes)) {
    if (key !== id) nodes[key] = { ...node, choices: node.choices.map((choice) => (choice.next === id ? { ...choice, next: '' } : choice)) };
  }
  return { ...bc, nodes };
}

/** A fresh id like `node-3` that is not taken. */
export function freshId(taken: Iterable<string>, base = 'node'): string {
  const used = new Set(taken);
  for (let n = 1; ; n++) if (!used.has(`${base}-${n}`)) return `${base}-${n}`;
}

/** A minimal new case: one decision with two choices leading to the two endings. */
export function blankCase(): EditableCase {
  return {
    title: 'New case',
    specialty: '',
    scenario: '',
    citations: [],
    branches: {
      startNodeId: 'start',
      startScore: 100,
      nodes: {
        start: {
          content: 'Describe the presentation.',
          prompt: 'What do you do first?',
          choices: [
            { id: 'a', label: 'First option', outcome: 'optimal', scoreDelta: 10, feedback: 'Why this helps.', next: 'survived' },
            { id: 'b', label: 'Second option', outcome: 'deadly', scoreDelta: -100, feedback: 'Why this harms.', next: 'died' },
          ],
        },
        survived: { content: 'The patient recovers.', choices: [], end: 'survived' },
        died: { content: 'The patient dies.', choices: [], end: 'died' },
      },
    },
  };
}
