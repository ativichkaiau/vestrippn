/* ════════════════════════════════════════════════════════════════════════
   Assistant contexts. Each hub gives the assistant a persona (server) and
   the live data `buildHubContext` pulls for it; the UI shows the label,
   three suggested requests and a caution. Isomorphic: no secrets here.
   ════════════════════════════════════════════════════════════════════════ */

export const HUBS = ['dashboard', 'academics', 'research', 'fitness', 'tools', 'archive', 'identity', 'ielts'] as const;
export type IntelligenceHub = (typeof HUBS)[number];

export function isHub(value: unknown): value is IntelligenceHub {
  return typeof value === 'string' && (HUBS as readonly string[]).includes(value);
}

export type Suggestion = { label: string; instruction: string };

export const HUB_CONFIG: Record<IntelligenceHub, { label: string; path: string; persona: string; suggestions: Suggestion[]; caution: string }> = {
  dashboard: {
    label: 'root',
    path: '~',
    persona: 'Context: root. Help with the day plan, pending tasks, and which part of VESTRIPPN to open next.',
    suggestions: [
      { label: 'Plan today', instruction: 'Turn my pending tasks into a short, ordered plan for today.' },
      { label: 'Review pending tasks', instruction: 'Group my pending tasks, flag anything stale, and suggest what to drop.' },
      { label: 'What should I open next?', instruction: 'Based on my tasks and study data, which module should I work in next, and why?' },
    ],
    caution: 'Suggestions only — nothing is changed until you act on it.',
  },
  academics: {
    label: 'academics',
    path: '~/medicine/academics',
    persona:
      'Context: academics. Help with study plans, upcoming exams, Canvas scores, Anki load and clinical case drills. Use the exam dates and scores in the live data; never assume an exam that is not listed.',
    suggestions: [
      { label: 'Build a study plan', instruction: 'Build a study plan around my upcoming exams, Anki load and Canvas scores.' },
      { label: 'Next exam brief', instruction: 'Brief me on my next exam: time left, weak areas from my scores, and what to cover first.' },
      { label: 'Clinical case drill', instruction: 'Give me a short clinical reasoning drill for my current course focus.' },
    ],
    caution: 'Verify medical content against course material and trusted references before relying on it.',
  },
  research: {
    label: 'research',
    path: '~/research',
    persona:
      'Context: research. Help with SRMA extraction notes, literature summaries, screening rationale and source triage (PubMed, Europe PMC, Scopus).',
    suggestions: [
      { label: 'Summarize extraction status', instruction: 'Summarize where my systematic review stands from the extraction and screening data.' },
      { label: 'Check source coverage', instruction: 'Which databases and search angles am I likely missing for a systematic review?' },
      { label: 'Draft screening rationale', instruction: 'Draft clear inclusion and exclusion criteria wording for title/abstract screening.' },
    ],
    caution: 'Verify sources, methods and citations before academic use.',
  },
  fitness: {
    label: 'fitness',
    path: '~/runtime/fitness',
    persona: 'Context: fitness. Help with weekly training structure, recovery rhythm and streak strategy.',
    suggestions: [
      { label: 'Review my week', instruction: 'Review my training cadence and streak, and suggest the structure for next week.' },
      { label: 'Plan recovery', instruction: 'Plan a recovery rhythm that protects my streak without overloading the week.' },
      { label: 'Fit training around exams', instruction: 'How should I adjust training in the weeks before an exam?' },
    ],
    caution: 'Adjust for injury and recovery; follow professional advice where it applies.',
  },
  tools: {
    label: 'tools',
    path: '~/runtime/tools',
    persona: 'Context: tools. Help choose and sequence utilities, planner flows and shortcuts.',
    suggestions: [
      { label: 'Which tool for this?', instruction: 'Given my pending tasks, which tools should I use and in what order?' },
      { label: 'Planner-first routine', instruction: 'Design a planner-first routine for a heavy study day.' },
      { label: 'Group my shortcuts', instruction: 'Suggest how to group my everyday tools by task.' },
    ],
    caution: 'External tools stay under your control — the assistant only suggests.',
  },
  archive: {
    label: 'archive',
    path: '~/archive',
    persona: 'Context: archive. Help find related notes, summarize entries and organise ingested documents.',
    suggestions: [
      { label: 'Summarize my documents', instruction: 'Summarize what my ingested documents cover and what is missing.' },
      { label: 'Find related material', instruction: 'Which of my documents relate to each other, and how?' },
      { label: 'Plan a revision set', instruction: 'Turn my documents into a revision set for the next two weeks.' },
    ],
    caution: 'Check summaries against the originals before you rely on them.',
  },
  identity: {
    label: 'identity',
    path: '~/identity',
    persona: 'Context: identity and portfolio. Help draft profile summaries, frame project evidence and shape outreach copy.',
    suggestions: [
      { label: 'Draft a profile summary', instruction: 'Draft a three-sentence profile summary for a research application.' },
      { label: 'Frame project evidence', instruction: 'How should I frame my software projects for a medical research position?' },
      { label: 'Outreach message', instruction: 'Draft a short, polite outreach message to a potential research supervisor.' },
    ],
    caution: 'Review tone and accuracy before sending anything to anyone.',
  },
  ielts: {
    label: 'ielts',
    path: '~/runtime/ielts',
    persona: 'Context: IELTS. Help build writing drills (Task 1 and 2), speaking practice (Parts 1–3) and vocabulary review loops.',
    suggestions: [
      { label: 'Task 2 drill', instruction: 'Give me a Writing Task 2 prompt with a plan outline and the band criteria to check against.' },
      { label: 'Speaking Part 2 card', instruction: 'Give me a Speaking Part 2 cue card and follow-up Part 3 questions.' },
      { label: 'Vocabulary loop', instruction: 'Turn my IELTS notes into a ten-word recall drill.' },
    ],
    caution: 'Check output against the official IELTS band descriptors.',
  },
};

/** Which assistant context a route belongs to — "ask" from ⌘K uses the page you're on. */
export function hubForPath(pathname: string): IntelligenceHub {
  const path = pathname.split('?')[0];
  const starts = (...prefixes: string[]) => prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  if (starts('/academics', '/workspace', '/learn/cases', '/medicine', '/analytics')) return 'academics';
  if (starts('/research')) return 'research';
  if (starts('/fitness')) return 'fitness';
  if (starts('/tools')) return 'tools';
  if (starts('/archive', '/das/ingest')) return 'archive';
  if (starts('/identity', '/projects', '/systems', '/logs', '/garage', '/contact')) return 'identity';
  if (starts('/ielts', '/learn/ielts')) return 'ielts';
  return 'dashboard';
}
