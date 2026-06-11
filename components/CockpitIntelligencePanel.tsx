'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, hoverLift, pressTap, softScale, staggerContainer } from './motionPresets';
import { useLowPower } from './useLowPower';

type IntelligenceHub = 'dashboard' | 'academics' | 'research' | 'fitness' | 'tools' | 'archive' | 'identity' | 'ielts';
type AssistantStatus = 'empty' | 'thinking' | 'ready' | 'error' | 'saved' | 'task-created';
type ConfirmIntent = 'archive' | 'task' | null;

type SuggestedAction = {
  label: string;
  detail: string;
  outcome: string;
};

type HubConfig = {
  title: string;
  subtitle: string;
  prompt: string;
  actions: SuggestedAction[];
  caution: string;
};

const HUB_CONFIG: Record<IntelligenceHub, HubConfig> = {
  dashboard: {
    title: 'VEStriPPN Assistant',
    subtitle: 'Command surface for mission, planner, and hub context.',
    prompt: 'Ask about today, pending tasks, or the next module to open.',
    caution: 'AI-assisted output will require review before changing planner, mission, or archive data.',
    actions: [
      { label: 'Generate today mission', detail: 'Use pending tasks and current hub priorities.', outcome: 'Daily mission brief layout prepared.' },
      { label: 'Review pending tasks', detail: 'Turn planner noise into a short action queue.', outcome: 'Pending-task summary layout prepared.' },
      { label: 'Open next module', detail: 'Recommend the next hub based on workflow context.', outcome: 'Module recommendation layout prepared.' },
    ],
  },
  academics: {
    title: 'Study Copilot',
    subtitle: 'Academic command surface for exams, Canvas, Anki, and cases.',
    prompt: 'Ask for a study plan, exam target, or clinical case drill.',
    caution: 'AI-assisted academic output. Verify against course material and trusted references before use.',
    actions: [
      { label: 'Generate study plan', detail: 'Build around HMS-2, Anki load, and clinical cases.', outcome: 'Study-plan response layout prepared.' },
      { label: 'Review next exam target', detail: 'Focus the cockpit on the nearest milestone.', outcome: 'Exam-target brief layout prepared.' },
      { label: 'Create case drill', detail: 'Turn current system focus into clinical practice.', outcome: 'Clinical drill layout prepared.' },
    ],
  },
  research: {
    title: 'Research Copilot',
    subtitle: 'SRMA command surface for extraction, screening, and sources.',
    prompt: 'Ask for extraction notes, a literature summary, or source triage.',
    caution: 'AI-assisted research output. Verify sources, methods, and citations before academic use.',
    actions: [
      { label: 'Summarize extraction notes', detail: 'Prepare a structured SRMA extraction brief.', outcome: 'Extraction-summary layout prepared.' },
      { label: 'Check source coverage', detail: 'Review PubMed, Europe PMC, Scopus, and vault context.', outcome: 'Source-coverage layout prepared.' },
      { label: 'Draft screening rationale', detail: 'Prepare inclusion/exclusion reasoning for review.', outcome: 'Screening-rationale layout prepared.' },
    ],
  },
  fitness: {
    title: 'Training Copilot',
    subtitle: 'Fitness command surface for streaks, recovery, and structure.',
    prompt: 'Ask for a weekly training review or recovery-focused adjustment.',
    caution: 'AI-assisted training output. Adjust for injury, recovery, and professional advice where needed.',
    actions: [
      { label: 'Review weekly structure', detail: 'Check training cadence, rest, and streak pressure.', outcome: 'Weekly-training review layout prepared.' },
      { label: 'Plan recovery rhythm', detail: 'Balance session intensity and recovery cues.', outcome: 'Recovery-plan layout prepared.' },
      { label: 'Update streak strategy', detail: 'Protect consistency without overloading the week.', outcome: 'Streak-strategy layout prepared.' },
    ],
  },
  tools: {
    title: 'Tool Copilot',
    subtitle: 'Launch command surface for planner, utilities, and references.',
    prompt: 'Ask which tool to launch or how to organize the next workflow.',
    caution: 'Assistant actions can suggest launch paths, but external tools still require user control.',
    actions: [
      { label: 'Recommend next tool', detail: 'Pick the most useful utility for the current workflow.', outcome: 'Tool-recommendation layout prepared.' },
      { label: 'Launch planner flow', detail: 'Prepare a planner-first action sequence.', outcome: 'Planner-flow layout prepared.' },
      { label: 'Group utility shortcuts', detail: 'Sort tools by current work context.', outcome: 'Shortcut-group layout prepared.' },
    ],
  },
  archive: {
    title: 'Archive Copilot',
    subtitle: 'Memory command surface for notes, references, and project entries.',
    prompt: 'Ask to find related notes, summarize recent entries, or prepare a save.',
    caution: 'Archive writes must be reviewed before saving, tagging, or updating stored notes.',
    actions: [
      { label: 'Find related notes', detail: 'Use current mission context to locate connected material.', outcome: 'Related-notes layout prepared.' },
      { label: 'Summarize recent entries', detail: 'Condense recent archive context into a short brief.', outcome: 'Archive-summary layout prepared.' },
      { label: 'Prepare save draft', detail: 'Format a future AI output for archive storage.', outcome: 'Archive-save draft layout prepared.' },
    ],
  },
  identity: {
    title: 'Portfolio Copilot',
    subtitle: 'Identity command surface for profile, projects, and achievements.',
    prompt: 'Ask for a portfolio summary, project framing, or application narrative.',
    caution: 'Profile edits should be reviewed for accuracy, tone, and audience before publishing.',
    actions: [
      { label: 'Draft portfolio summary', detail: 'Turn identity context into a concise profile draft.', outcome: 'Portfolio-summary layout prepared.' },
      { label: 'Frame project evidence', detail: 'Connect achievements, stack, and deployed systems.', outcome: 'Project-evidence layout prepared.' },
      { label: 'Prepare outreach copy', detail: 'Shape a controlled introduction for external use.', outcome: 'Outreach-copy layout prepared.' },
    ],
  },
  ielts: {
    title: 'IELTS Copilot',
    subtitle: 'Language command surface for writing, speaking, and vocabulary drills.',
    prompt: 'Ask for a writing drill, speaking prompt, or vocabulary review.',
    caution: 'AI-assisted language output should be checked against official IELTS criteria and trusted references.',
    actions: [
      { label: 'Create writing drill', detail: 'Prepare a Task 2 prompt with review checkpoints.', outcome: 'Writing-drill layout prepared.' },
      { label: 'Create speaking drill', detail: 'Build a Part 2/3 practice loop.', outcome: 'Speaking-drill layout prepared.' },
      { label: 'Review vocabulary buffer', detail: 'Turn saved words into targeted recall practice.', outcome: 'Vocabulary-review layout prepared.' },
    ],
  },
};

const STATUS_COPY: Record<AssistantStatus, { label: string; detail: string }> = {
  empty: { label: 'No context selected yet.', detail: 'Choose a suggested action or draft a prompt to preview the response surface.' },
  thinking: { label: 'Preparing response...', detail: 'The frontend is showing the loading state reserved for the future assistant.' },
  ready: { label: 'Response ready for review.', detail: 'This is the layout Claude will fill once the backend is connected.' },
  error: { label: 'Could not generate a response.', detail: 'The retry state is ready for failed assistant calls.' },
  saved: { label: 'Saved to Archive.', detail: 'Preview state only. F3 does not write archive data.' },
  'task-created': { label: 'Task created.', detail: 'Preview state only. F3 does not modify planner data.' },
};

export default function CockpitIntelligencePanel({
  hub,
  contextItems = [],
  className = '',
}: {
  hub: IntelligenceHub;
  contextItems?: Array<{ label: string; value: string }>;
  className?: string;
}) {
  const [status, setStatus] = useState<AssistantStatus>('empty');
  const [selectedAction, setSelectedAction] = useState<SuggestedAction | null>(null);
  const [prompt, setPrompt] = useState('');
  const [confirmIntent, setConfirmIntent] = useState<ConfirmIntent>(null);
  const reduceMotion = useReducedMotion();
  const lowPower = useLowPower();
  const motionOff = Boolean(reduceMotion || lowPower);
  const config = HUB_CONFIG[hub];

  const activeTitle = selectedAction?.label || 'Assistant response layout';
  const activeOutcome = selectedAction?.outcome || 'Choose an action to prepare the response surface.';
  const context = useMemo(() => contextItems.filter((item) => item.value), [contextItems]);

  const previewAction = (action?: SuggestedAction) => {
    if (action) setSelectedAction(action);
    setStatus('thinking');
    window.setTimeout(() => setStatus('ready'), 620);
  };

  const runPrompt = () => {
    if (!prompt.trim()) return;
    previewAction({
      label: 'Custom prompt preview',
      detail: prompt.trim(),
      outcome: 'Custom response layout prepared.',
    });
  };

  const confirm = () => {
    setStatus(confirmIntent === 'archive' ? 'saved' : 'task-created');
    setConfirmIntent(null);
  };

  const statusCopy = STATUS_COPY[status];

  return (
    <>
      <motion.section
      variants={motionOff ? undefined : fadeUp}
      initial={motionOff ? false : 'hidden'}
      animate={motionOff ? undefined : 'show'}
      className={`relative overflow-hidden rounded-[28px] border border-black/5 bg-white/70 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-colors duration-700 dark:border-white/5 dark:bg-white/[0.055] sm:p-5 lg:p-6 ${className}`}
      data-motion-card
      data-ai-command-surface
      data-no-typewriter
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(var(--hub-accent-rgb), 0.12)' }}
      />

      <div className="relative z-10 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={motionOff ? undefined : staggerContainer(0.04, 0.06)} className="space-y-4">
          <motion.div variants={motionOff ? undefined : fadeUp}>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
              Cockpit Intelligence
            </div>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[22px] font-black tracking-tight text-neutral-950 dark:text-white">{config.title}</h2>
                <p className="mt-1 max-w-xl text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">{config.subtitle}</p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-black/5 bg-black/[0.035] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-400">
                Frontend only
              </span>
            </div>
          </motion.div>

          {context.length > 0 && (
            <motion.div variants={motionOff ? undefined : softScale} className="grid gap-2 sm:grid-cols-3">
              {context.slice(0, 3).map((item) => (
                <div key={item.label} className="rounded-2xl border border-black/5 bg-black/[0.025] px-3 py-3 dark:border-white/5 dark:bg-white/[0.045]">
                  <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{item.label}</div>
                  <div className="mt-1 truncate text-[12px] font-black text-neutral-800 dark:text-neutral-100">{item.value}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div variants={motionOff ? undefined : fadeUp} className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Suggested actions</div>
            <div className="grid gap-2">
              {config.actions.map((action) => (
                <motion.button
                  key={action.label}
                  type="button"
                  whileHover={motionOff ? undefined : hoverLift}
                  whileTap={motionOff ? undefined : pressTap}
                  onClick={() => previewAction(action)}
                  className="group rounded-2xl border border-black/5 bg-white/65 px-4 py-3 text-left shadow-sm transition-colors hover:border-black/10 hover:bg-white dark:border-white/5 dark:bg-white/[0.045] dark:hover:border-white/10 dark:hover:bg-white/[0.075]"
                  data-motion-card
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black tracking-tight text-neutral-900 dark:text-white">{action.label}</span>
                    <span className="text-[11px] font-black text-neutral-400 transition-transform group-hover:translate-x-0.5">-&gt;</span>
                  </div>
                  <p className="mt-1 text-xs font-medium leading-5 text-neutral-500 dark:text-neutral-400">{action.detail}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={motionOff ? undefined : fadeUp} className="rounded-2xl border border-black/5 bg-black/[0.025] p-2 dark:border-white/5 dark:bg-black/20">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={config.prompt}
                className="min-w-0 flex-1 rounded-xl border border-transparent bg-white px-3 py-3 text-sm font-medium text-neutral-900 outline-none transition focus:border-black/10 focus:ring-2 focus:ring-black/5 dark:bg-white/[0.08] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white/10"
              />
              <button
                type="button"
                onClick={runPrompt}
                disabled={!prompt.trim()}
                className="w09-launch-button rounded-xl bg-neutral-950 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition active:scale-95 disabled:opacity-40 dark:bg-white dark:text-black"
              >
                Preview
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={motionOff ? undefined : softScale} className="rounded-[24px] border border-black/5 bg-neutral-950 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)] dark:border-white/10 dark:bg-black/40">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">AI response card</div>
              <h3 className="mt-1 text-lg font-black tracking-tight">{statusCopy.label}</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-white/55">{statusCopy.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus('error')}
              className="w-fit rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              Retry state
            </button>
          </div>

          <div className="min-h-[260px] py-4">
            {status === 'thinking' && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 overflow-hidden rounded-2xl bg-white/[0.06]">
                    <div className="h-full w-1/3 animate-loader-sweep rounded-2xl bg-white/10" />
                  </div>
                ))}
              </div>
            )}

            {status === 'empty' && (
              <div className="flex h-full min-h-[220px] flex-col justify-center rounded-2xl border border-dashed border-white/10 px-5 text-center">
                <div className="text-sm font-black">No context selected yet.</div>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">
                  The assistant surface is staged here. Pick an action to preview response, source, confirmation, and save/task states.
                </p>
              </div>
            )}

            {(status === 'ready' || status === 'saved' || status === 'task-created') && (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{activeTitle}</div>
                  <p className="mt-2 text-sm font-medium leading-6 text-white/70">
                    {activeOutcome} Claude is not connected in F3, so no generated content or data mutation is performed.
                  </p>
                </div>
                <div className="grid gap-2">
                  {['Use the selected hub context.', 'Show steps before any action is applied.', 'Ask for confirmation before saving or creating tasks.'].map((step, index) => (
                    <div key={step} className="flex gap-3 rounded-2xl bg-white/[0.055] px-3 py-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-black">{index + 1}</span>
                      <span className="text-sm font-medium leading-6 text-white/70">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <div className="font-black text-amber-100">Could not generate a response. Try again.</div>
                <p className="mt-2 text-sm leading-6 text-amber-50/70">
                  This state is reserved for failed assistant calls, missing context, or unavailable sources.
                </p>
                <button
                  type="button"
                  onClick={() => previewAction(selectedAction || config.actions[0])}
                  className="mt-4 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-neutral-950"
                >
                  Retry preview
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Sources and verification</div>
            <p className="mt-1 text-xs font-medium leading-5 text-white/55">
              Sources will appear here after backend integration. {config.caution}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  void navigator.clipboard.writeText(`${activeTitle}\n${activeOutcome}`);
                }
              }}
              className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Copy
            </button>
            <button type="button" onClick={() => setConfirmIntent('archive')} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white">
              Save to Archive
            </button>
            <button type="button" onClick={() => setConfirmIntent('task')} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:bg-white/10 hover:text-white">
              Convert to Task
            </button>
            <button type="button" onClick={() => previewAction(selectedAction || config.actions[0])} className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-950 transition active:scale-95">
              Regenerate
            </button>
          </div>
        </motion.div>
      </div>

      </motion.section>

      {confirmIntent && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" data-no-typewriter>
          <motion.div
            initial={motionOff ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={motionOff ? undefined : { opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-neutral-950"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">Confirmation required</div>
            <h3 className="mt-2 text-xl font-black tracking-tight text-neutral-950 dark:text-white">Review before applying changes</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">
              This prepares the {confirmIntent === 'archive' ? 'save-to-archive' : 'convert-to-task'} workflow. In F3, confirming only displays the success state; no data is changed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmIntent(null)} className="rounded-full border border-black/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-neutral-500 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="button" onClick={confirm} className="rounded-full bg-neutral-950 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition active:scale-95 dark:bg-white dark:text-black">
                Confirm preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
