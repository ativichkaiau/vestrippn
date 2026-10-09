import { parseBranchingCase } from './content';
import { validateCase, type CaseIssue, type EditableCase } from './case-graph';

/* Turn an editor request body into a case, or the reasons it cannot be saved. */
export function readCaseInput(raw: string): { ok: true; value: EditableCase } | { ok: false; status: number; issues: CaseIssue[] } {
  const fail = (message: string, status = 400) => ({ ok: false as const, status, issues: [{ level: 'error' as const, message }] });
  if (raw.length > 400_000) return fail('This case is too large to save.', 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('The request is not valid JSON.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('Invalid case.');
  const data = body as Record<string, unknown>;
  const branches = parseBranchingCase({ ...(data.branches as object), type: 'branching' });
  if (!branches) return fail('The case needs nodes and a start node that exists.');
  const value: EditableCase = {
    title: typeof data.title === 'string' ? data.title.trim() : '',
    specialty: typeof data.specialty === 'string' ? data.specialty.trim() : '',
    scenario: typeof data.scenario === 'string' ? data.scenario.trim() : '',
    citations: Array.isArray(data.citations) ? data.citations.filter((c): c is string => typeof c === 'string').map((c) => c.trim()).filter(Boolean) : [],
    branches,
  };
  const issues = validateCase(value).filter((issue) => issue.level === 'error');
  return issues.length ? { ok: false, status: 422, issues } : { ok: true, value };
}

/** The stored shape of ClinicalCase.branches for a branching case. */
export const storedBranches = (value: EditableCase) => ({ type: 'branching', ...value.branches });
