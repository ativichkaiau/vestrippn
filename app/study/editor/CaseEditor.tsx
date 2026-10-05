'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { blankCase, deleteNode, freshId, hasErrors, OUTCOMES, PATIENT_STATUSES, renameNode, validateCase, type CaseIssue, type EditableCase } from '@/lib/learn/case-graph';
import type { BranchingChoice, BranchingNode, ChoiceOutcome, PatientStatus } from '@/lib/learn/content';
import type { CaseSummary } from '@/app/learn/cases/types';
import { toast } from '@/lib/toast-bus';

/* ════════════════════════════════════════════════════════════════════════
   The case editor (owner only). Left: the bank. Middle: the decision tree,
   walked from the start node, with problems underneath. Right: the
   selected node — its text, ending, and choices (outcome, score change,
   feedback, and where each one leads). Saves go through the same
   validator on the server.
   ════════════════════════════════════════════════════════════════════════ */

const OUTCOME_LABEL: Record<ChoiceOutcome, string> = { optimal: 'optimal', suboptimal: 'suboptimal', deadly: 'deadly' };
type Loaded = { id: string | null; value: EditableCase };

/** Depth-first walk from the start: each node once, with its depth. */
function walk(value: EditableCase): { id: string; depth: number }[] {
  const nodes = value.branches.nodes;
  const seen = new Set<string>();
  const out: { id: string; depth: number }[] = [];
  const visit = (id: string, depth: number) => {
    if (seen.has(id) || !nodes[id]) return;
    seen.add(id);
    out.push({ id, depth });
    for (const choice of nodes[id].choices) visit(choice.next, depth + 1);
  };
  visit(value.branches.startNodeId, 0);
  for (const id of Object.keys(nodes)) if (!seen.has(id)) out.push({ id, depth: -1 });
  return out;
}

export default function CaseEditor() {
  const [bank, setBank] = useState<CaseSummary[]>([]);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [savedJson, setSavedJson] = useState('');
  const [selected, setSelected] = useState<string>('start');
  const [busy, setBusy] = useState(false);
  const [serverIssues, setServerIssues] = useState<CaseIssue[]>([]);
  const [rename, setRename] = useState('');
  const select = (id: string) => {
    setSelected(id);
    setRename('');
  };

  const refreshBank = useCallback(() => {
    fetch('/api/learn/cases')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: CaseSummary[]) => setBank(list.filter((item) => item.type === 'branching')))
      .catch(() => {});
  }, []);
  useEffect(refreshBank, [refreshBank]);

  const open = async (id: string | null) => {
    if (loaded && JSON.stringify(loaded.value) !== savedJson && !window.confirm('Discard unsaved changes?')) return;
    setServerIssues([]);
    if (!id) {
      const value = blankCase();
      setLoaded({ id: null, value });
      setSavedJson('');
      setSelected(value.branches.startNodeId);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/learn/cases/${encodeURIComponent(id)}/source`, { cache: 'no-store' });
      const body = (await res.json()) as EditableCase & { id: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? `Could not open the case (${res.status}).`);
      const value: EditableCase = { title: body.title, specialty: body.specialty, scenario: body.scenario, citations: body.citations, branches: body.branches };
      setLoaded({ id, value });
      setSavedJson(JSON.stringify(value));
      setSelected(value.branches.startNodeId);
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Could not open the case.', variant: 'warn' });
    } finally {
      setBusy(false);
    }
  };

  const issues = useMemo(() => (loaded ? validateCase(loaded.value) : []), [loaded]);
  const tree = useMemo(() => (loaded ? walk(loaded.value) : []), [loaded]);
  const dirty = !!loaded && JSON.stringify(loaded.value) !== savedJson;

  if (!loaded) {
    return (
      <div className="sys-editor-pick">
        <button type="button" className="sys-action" data-variant="primary" onClick={() => open(null)}>
          New case
        </button>
        <ul className="sys-review-list" aria-label="Cases in the bank">
          {bank.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => open(item.id)} disabled={busy}>
                <b>{item.title}</b>
                <small>
                  {item.specialty} · {item.difficulty ?? 'case'}
                </small>
              </button>
            </li>
          ))}
        </ul>
        {bank.length === 0 && <p className="sys-muted">No branching cases in the bank yet (or the database is unreachable).</p>}
      </div>
    );
  }

  const value = loaded.value;
  const nodes = value.branches.nodes;
  const node: BranchingNode | undefined = nodes[selected];
  const set = (next: EditableCase) => setLoaded({ ...loaded, value: next });
  const setBranches = (branches: EditableCase['branches']) => set({ ...value, branches });
  const setNode = (patch: Partial<BranchingNode>) => setBranches({ ...value.branches, nodes: { ...nodes, [selected]: { ...nodes[selected], ...patch } } });
  const setChoice = (index: number, patch: Partial<BranchingChoice>) =>
    setNode({ choices: node!.choices.map((choice, i) => (i === index ? { ...choice, ...patch } : choice)) });

  const addNode = (from?: number) => {
    const id = freshId(Object.keys(nodes));
    const branches = { ...value.branches, nodes: { ...nodes, [id]: { content: 'What happens next.', choices: [] } } };
    if (from !== undefined && node) branches.nodes[selected] = { ...node, choices: node.choices.map((c, i) => (i === from ? { ...c, next: id } : c)) };
    setBranches(branches);
    setSelected(id);
  };

  const save = async () => {
    if (hasErrors(issues)) {
      toast({ title: 'Fix the problems before saving.', variant: 'warn' });
      return;
    }
    setBusy(true);
    setServerIssues([]);
    try {
      const res = await fetch(loaded.id ? `/api/learn/cases/${encodeURIComponent(loaded.id)}/source` : '/api/learn/cases', {
        method: loaded.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });
      const body = (await res.json().catch(() => null)) as { id?: string; error?: string; issues?: CaseIssue[] } | null;
      if (!res.ok || !body?.id) {
        setServerIssues(body?.issues ?? []);
        throw new Error(body?.error ?? `Could not save (${res.status}).`);
      }
      setLoaded({ id: body.id, value });
      setSavedJson(JSON.stringify(value));
      refreshBank();
      toast({ title: `saved · ${value.title}`, variant: 'success' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Could not save.', variant: 'warn' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!loaded.id || !window.confirm(`Delete “${value.title}” and everyone's progress on it? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/learn/cases/${encodeURIComponent(loaded.id)}/source`, { method: 'DELETE' }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      toast({ title: 'Could not delete the case.', variant: 'warn' });
      return;
    }
    setLoaded(null);
    setSavedJson('');
    refreshBank();
    toast({ title: 'case deleted', variant: 'success' });
  };

  const all = [...issues, ...serverIssues];
  const errorCount = all.filter((issue) => issue.level === 'error').length;
  const nodeIssues = (id: string) => all.filter((issue) => issue.nodeId === id);

  return (
    <div className="sys-case-editor">
      <div className="sys-case-editor-bar">
        <button type="button" className="sys-action" onClick={() => (dirty && !window.confirm('Discard unsaved changes?') ? null : (setLoaded(null), setSavedJson('')))}>
          ← All cases
        </button>
        <span className="sys-settings-file">
          {value.title || 'untitled'}
          {dirty && <span className="sys-settings-dirty" aria-label="unsaved changes"> ●</span>}
        </span>
        <span className="sys-muted" role="status">
          {errorCount ? `${errorCount} problem${errorCount === 1 ? '' : 's'}` : 'graph ok'} · {Object.keys(nodes).length} nodes
        </span>
        <div className="sys-settings-actions">
          {loaded.id && (
            <Link className="sys-action" href={`/learn/cases?case=${encodeURIComponent(loaded.id)}&review=1`}>
              Play
            </Link>
          )}
          {loaded.id && (
            <button type="button" className="sys-action" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          <button type="button" className="sys-action" data-variant="primary" onClick={save} disabled={busy || !dirty}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <CaseMeta value={value} onChange={set} nodeIds={Object.keys(nodes)} />

      <div className="sys-case-editor-main">
        <nav className="sys-case-tree" aria-label="Decision tree">
          <p className="sys-label">decision tree</p>
          <ul>
            {tree.map(({ id, depth }) => {
              const item = nodes[id];
              const problems = nodeIssues(id).filter((issue) => issue.level === 'error').length;
              return (
                <li key={id} style={{ paddingLeft: `${Math.max(0, depth) * 14}px` }}>
                  <button type="button" aria-current={id === selected ? 'true' : undefined} onClick={() => select(id)} data-unreachable={depth < 0 || undefined}>
                    <span className="sys-case-node-id">{id}</span>
                    {item.end && <span className="sys-case-end" data-end={item.end}>{item.end}</span>}
                    {!item.end && <span className="sys-muted">{item.choices.length} choices</span>}
                    {problems > 0 && <span className="sys-case-problem">{problems}!</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="sys-action" onClick={() => addNode()}>
            + Node
          </button>
          {all.length > 0 && (
            <div className="sys-case-problems">
              <p className="sys-label">problems · {all.length}</p>
              <ul>
                {all.map((issue, i) => (
                  <li key={i} data-level={issue.level}>
                    <button type="button" onClick={() => issue.nodeId && select(issue.nodeId)}>
                      {issue.nodeId ? <kbd>{issue.nodeId}{issue.choiceId ? `/${issue.choiceId}` : ''}</kbd> : null} {issue.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {node ? (
          <section className="sys-case-node" aria-label={`Node ${selected}`}>
            <div className="sys-case-row">
              <label>
                <span className="sys-label">node id</span>
                <input className="sys-input" value={rename || selected} onChange={(event) => setRename(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} />
              </label>
              <button
                type="button"
                className="sys-action"
                disabled={!rename || rename === selected || !!nodes[rename]}
                onClick={() => {
                  setBranches(renameNode(value.branches, selected, rename));
                  setSelected(rename);
                  setRename('');
                }}
              >
                Rename
              </button>
              <button
                type="button"
                className="sys-action"
                disabled={selected === value.branches.startNodeId}
                onClick={() => {
                  setBranches(deleteNode(value.branches, selected));
                  setSelected(value.branches.startNodeId);
                }}
              >
                Delete node
              </button>
            </div>
            <div className="sys-case-row">
              <label>
                <span className="sys-label">stage</span>
                <input className="sys-input" value={node.stageLabel ?? ''} onChange={(event) => setNode({ stageLabel: event.target.value || undefined })} />
              </label>
              <label>
                <span className="sys-label">patient</span>
                <select className="sys-input" value={node.patientStatus ?? ''} onChange={(event) => setNode({ patientStatus: (event.target.value || undefined) as PatientStatus | undefined })}>
                  <option value="">—</option>
                  {PATIENT_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sys-label">ending</span>
                <select
                  className="sys-input"
                  value={node.end ?? ''}
                  onChange={(event) => setNode({ end: (event.target.value || undefined) as BranchingNode['end'], ...(event.target.value ? { choices: [] } : {}) })}
                >
                  <option value="">no, a decision</option>
                  <option value="survived">survived</option>
                  <option value="died">died</option>
                </select>
              </label>
            </div>
            <label className="sys-case-block">
              <span className="sys-label">what the player reads</span>
              <textarea className="sys-input" rows={5} value={node.content} onChange={(event) => setNode({ content: event.target.value })} />
            </label>
            {!node.end && (
              <>
                <label className="sys-case-block">
                  <span className="sys-label">question</span>
                  <input className="sys-input" value={node.prompt ?? ''} onChange={(event) => setNode({ prompt: event.target.value || undefined })} />
                </label>
                <p className="sys-label">choices · {node.choices.length}</p>
                <ol className="sys-case-choices">
                  {node.choices.map((choice, i) => (
                    <li key={i} data-outcome={choice.outcome}>
                      <div className="sys-case-row">
                        <label>
                          <span className="sys-label">id</span>
                          <input className="sys-input sys-case-short" value={choice.id} onChange={(event) => setChoice(i, { id: event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })} />
                        </label>
                        <label className="sys-case-grow">
                          <span className="sys-label">choice text</span>
                          <input className="sys-input" value={choice.label} onChange={(event) => setChoice(i, { label: event.target.value })} />
                        </label>
                      </div>
                      <div className="sys-case-row">
                        <label>
                          <span className="sys-label">outcome</span>
                          <select className="sys-input" value={choice.outcome} onChange={(event) => setChoice(i, { outcome: event.target.value as ChoiceOutcome })}>
                            {OUTCOMES.map((outcome) => (
                              <option key={outcome} value={outcome}>
                                {OUTCOME_LABEL[outcome]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span className="sys-label">score ±</span>
                          <input className="sys-input sys-case-short" type="number" step={1} value={choice.scoreDelta} onChange={(event) => setChoice(i, { scoreDelta: Math.trunc(Number(event.target.value) || 0) })} />
                        </label>
                        <label className="sys-case-grow">
                          <span className="sys-label">leads to</span>
                          <select
                            className="sys-input"
                            value={choice.next}
                            onChange={(event) => (event.target.value === '__new' ? addNode(i) : setChoice(i, { next: event.target.value }))}
                          >
                            {!nodes[choice.next] && <option value={choice.next}>— choose —</option>}
                            {Object.keys(nodes).map((id) => (
                              <option key={id} value={id}>
                                {id}
                                {nodes[id].end ? ` (${nodes[id].end})` : ''}
                              </option>
                            ))}
                            <option value="__new">+ new node</option>
                          </select>
                        </label>
                        <button type="button" className="sys-action" onClick={() => nodes[choice.next] && select(choice.next)} disabled={!nodes[choice.next]}>
                          Go
                        </button>
                      </div>
                      <label className="sys-case-block">
                        <span className="sys-label">feedback after choosing</span>
                        <textarea className="sys-input" rows={2} value={choice.feedback} onChange={(event) => setChoice(i, { feedback: event.target.value })} />
                      </label>
                      <button type="button" className="sys-case-remove" onClick={() => setNode({ choices: node.choices.filter((_, j) => j !== i) })}>
                        remove choice
                      </button>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className="sys-action"
                  onClick={() =>
                    setNode({
                      choices: [
                        ...node.choices,
                        { id: freshId(node.choices.map((c) => c.id), 'c'), label: '', outcome: 'suboptimal', scoreDelta: 0, feedback: '', next: '' },
                      ],
                    })
                  }
                >
                  + Choice
                </button>
              </>
            )}
            {(node.vitals?.length ?? 0) > 0 && <p className="sys-muted">{node.vitals!.length} vitals on this node are kept as they are.</p>}
          </section>
        ) : (
          <p className="sys-muted">Select a node in the tree.</p>
        )}
      </div>
    </div>
  );
}

function CaseMeta({ value, onChange, nodeIds }: { value: EditableCase; onChange: (value: EditableCase) => void; nodeIds: string[] }) {
  const listId = useId();
  const bc = value.branches;
  return (
    <details className="sys-case-meta" open={!value.specialty || !value.scenario}>
      <summary className="sys-label">case details</summary>
      <div className="sys-case-row">
        <label className="sys-case-grow">
          <span className="sys-label">title</span>
          <input className="sys-input" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
        <label>
          <span className="sys-label">system</span>
          <input className="sys-input" list={listId} value={value.specialty} onChange={(event) => onChange({ ...value, specialty: event.target.value })} />
          <datalist id={listId}>
            {['Cardiovascular System', 'Respiratory System', 'Digestive and Biliary Tract System', 'Endocrine System', 'Renal and Urinary Tract', 'Nervous and Special Senses System', 'Reproductive System and Perinatal Period', 'Haematopoietic and Lymphoreticular System', 'Skin and Connective Tissue System', 'Microbiology and Parasitology', 'Immunology', 'Biochemistry', 'Gross Anatomy'].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label>
          <span className="sys-label">difficulty</span>
          <select className="sys-input" value={bc.difficulty ?? ''} onChange={(event) => onChange({ ...value, branches: { ...bc, difficulty: event.target.value || undefined } })}>
            <option value="">—</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>
      </div>
      <div className="sys-case-row">
        <label>
          <span className="sys-label">start node</span>
          <select className="sys-input" value={bc.startNodeId} onChange={(event) => onChange({ ...value, branches: { ...bc, startNodeId: event.target.value } })}>
            {nodeIds.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sys-label">starting score</span>
          <input className="sys-input sys-case-short" type="number" min={1} max={1000} value={bc.startScore} onChange={(event) => onChange({ ...value, branches: { ...bc, startScore: Math.trunc(Number(event.target.value) || 0) } })} />
        </label>
        <label className="sys-case-grow">
          <span className="sys-label">one-line summary (card)</span>
          <input className="sys-input" value={bc.summary ?? ''} onChange={(event) => onChange({ ...value, branches: { ...bc, summary: event.target.value || undefined } })} />
        </label>
      </div>
      <label className="sys-case-block">
        <span className="sys-label">scenario</span>
        <textarea className="sys-input" rows={3} value={value.scenario} onChange={(event) => onChange({ ...value, scenario: event.target.value })} />
      </label>
      <label className="sys-case-block">
        <span className="sys-label">citations · one per line</span>
        <textarea
          className="sys-input"
          rows={2}
          value={value.citations.join('\n')}
          onChange={(event) => onChange({ ...value, citations: event.target.value.split('\n').map((line) => line.trimStart()) })}
        />
      </label>
    </details>
  );
}
