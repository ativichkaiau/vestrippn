import { LIVERIES } from '../liveries';
import type { GarageObject, LogEntry, Node, RuntimeModule } from './types';

/* ════════════════════════════════════════════════════════════════════════
   VESTRIPPN registry — the systems, projects, runtime modules, logs and
   garage objects mounted under the root namespace.

   To add or correct an entry, edit this file. Fields are optional on
   purpose: leave a URL, date or stack undefined until it is real.
   ════════════════════════════════════════════════════════════════════════ */

const REPO = 'https://github.com/ativichkaiau/vestrippn';

export const NODES: Node[] = [
  {
    slug: 'vestrippn',
    name: 'VESTRIPPN',
    path: '~',
    type: 'environment',
    summary: 'root namespace',
    description: [
      'The root environment: personal website, study runtime, research engine and archive in one codebase. Everything else on this page is mounted beneath it.',
      'Built with Claude and ChatGPT Codex. Earlier builds are kept as records in the archive.',
    ],
    state: 'active',
    domains: ['software'],
    system: true,
    project: true,
    language: 'TypeScript',
    stack: ['Next.js 16', 'React 19', 'Prisma 7', 'PostgreSQL', 'Auth.js 5', 'three.js', 'Tailwind CSS 4', 'Vercel'],
    created: '2026-05-03',
    url: 'https://vestrippn.vercel.app',
    source: REPO,
    files: ['app/', 'components/', 'lib/', 'prisma/', 'scripts/', 'anki-addon/', 'docs/', 'auth.ts', 'middleware.ts', 'package.json'],
    excerpt: {
      file: 'lib/theme-engine.ts',
      language: 'ts',
      code: `// NOAA fractional-year solar position. UTC + longitude keeps this independent
// of the browser's timezone. No location permission or network call is needed.
function solarElevation(date: Date): number {
  const year = date.getUTCFullYear();
  const day = (Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - Date.UTC(year, 0, 1)) / 86400000 + 1;
  const yearDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gamma = 2 * Math.PI / yearDays * (day - 1 + (hour - 12) / 24);`,
    },
    related: ['anki_sync', 'studyex', 'research'],
  },
  {
    slug: 'studyex',
    name: 'studyex_medeetomihub',
    path: '~/systems/studyex',
    type: 'study-os',
    summary: 'medical knowledge runtime',
    description: [
      'The medical knowledge runtime: the study application mounted under VESTRIPPN.',
      'Studyex shares the VESTRIPPN grammar — type, spacing, system notation — but is denser and more operational, with its own accent. VESTRIPPN is the environment; Studyex is an application inside it.',
    ],
    state: 'active',
    domains: ['medicine', 'software'],
    system: true,
    project: true,
    language: 'web',
    featured: true,
    related: ['onepager', 'cardiac_sim_physics'],
  },
  {
    slug: 'terra',
    name: 'Terra',
    path: '~/research/terra',
    type: 'agent',
    summary: 'research agent system',
    description: ['An agent system for research work, part of the research branch of VESTRIPPN.'],
    state: 'active',
    domains: ['research', 'software'],
    system: true,
    project: true,
    language: 'AI / research',
    featured: true,
    related: ['research', 'williamslab'],
  },
  {
    slug: 'research',
    name: 'research',
    path: '~/research',
    type: 'research-os',
    summary: 'systematic review infrastructure',
    description: [
      'Infrastructure for systematic reviews and meta-analyses: search, deduplication, screening, extraction, analysis and synthesis.',
      'WilliamsLab runs the engine today. A successor research environment is planned to replace it.',
    ],
    state: 'active',
    domains: ['research'],
    system: true,
    internal: '/research',
    featured: true,
    related: ['williamslab', 'srma_screener', 'terra'],
  },
  {
    slug: 'williamslab',
    name: 'WilliamsLab',
    path: '~/research/williamslab',
    type: 'research engine',
    summary: 'literature intelligence, extraction and SRMA workflow',
    description: [
      'The current research engine: literature intelligence, extraction and the SRMA workflow, with a knowledge-graph backbone.',
      'Scheduled to be replaced by the successor research environment.',
    ],
    state: 'active',
    domains: ['research', 'software'],
    system: true,
    project: true,
    language: 'web',
    url: 'https://williamslab.vercel.app',
    related: ['research', 'srma_screener'],
  },
  {
    slug: 'srma_screener',
    name: 'srma_screener',
    path: '~/research/srma_screener',
    type: 'web app',
    summary: 'screening tool for systematic reviews',
    state: 'available',
    domains: ['research', 'software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-srma-telemetry.vercel.app',
    related: ['research', 'williamslab'],
  },
  {
    slug: 'cardiac_sim_physics',
    name: 'cardiac_sim_physics',
    path: '~/projects/cardiac_sim_physics',
    type: 'simulation',
    summary: 'cardiovascular physiology simulation',
    description: [
      'A physics simulation of cardiovascular physiology, written in Python.',
      'The target of the first code_till_i_am_bored entry. Development ended the way the series says it will.',
    ],
    state: 'experimental',
    domains: ['medicine', 'software'],
    system: true,
    project: true,
    language: 'Python',
    files: ['cardiac_sim_physics.py'],
    featured: true,
    related: ['code_till_i_am_bored'],
  },
  {
    slug: 'code_till_i_am_bored',
    name: 'code_till_i_am_bored',
    path: '~/logs/code_till_i_am_bored',
    type: 'series',
    summary: 'development log',
    description: [
      'A development log series: pick a target, code until bored, record what happened. Each entry lives in ~/logs with its target, runtime and termination reason.',
    ],
    state: 'active',
    domains: ['media', 'software'],
    system: true,
    internal: '/logs',
    featured: true,
    related: ['cardiac_sim_physics'],
  },
  {
    slug: 'williamshub',
    name: 'WilliamsHub',
    path: '~/medicine/williamshub',
    type: 'study hub',
    summary: 'study operations hub and exam coverage catalog',
    description: ['The study operations hub. Its topic catalog feeds the exam coverage map in the VESTRIPPN workspace.'],
    state: 'active',
    domains: ['medicine', 'software'],
    system: true,
    project: true,
    language: 'web',
    url: 'https://williamshub.vercel.app',
    related: ['williamspod', 'studyex'],
  },
  {
    slug: 'williamspod',
    name: 'WilliamsPod',
    path: '~/medicine/williamspod',
    type: 'exam pod',
    summary: 'timed mock exams under exam conditions',
    state: 'active',
    domains: ['medicine', 'software'],
    system: true,
    project: true,
    language: 'web',
    url: 'https://williamspod.vercel.app',
    related: ['williamshub'],
  },
  {
    slug: 'anki_sync',
    name: 'anki_sync',
    path: '~/projects/anki_sync',
    type: 'add-on',
    summary: 'Anki Desktop → VESTRIPPN telemetry',
    description: [
      'An Anki Desktop add-on that pushes due, new, reviewed-today and streak counts to the VESTRIPPN dashboard while Anki is open.',
      'Syncs on launch, after every AnkiWeb sync and on a timer (default 15 minutes). Manual push: Tools → Sync to VESTRIPPN now.',
    ],
    state: 'active',
    domains: ['software', 'medicine'],
    project: true,
    language: 'Python',
    stack: ['Anki add-on API', 'Qt'],
    source: `${REPO}/tree/main/anki-addon`,
    files: ['anki-addon/__init__.py', 'anki-addon/config.json', 'anki-addon/config.md'],
    excerpt: {
      file: 'anki-addon/__init__.py',
      language: 'py',
      code: `def _gather_stats():
    col = mw.col
    if not col:
        return None
    cutoff = col.sched.day_cutoff  # epoch seconds, end of the current Anki day
    today_start_ms = int((cutoff - 86400) * 1000)
    reviewed_today = col.db.scalar(
        "select count() from revlog where id >= ?", today_start_ms
    ) or 0
    return {
        "due": len(col.find_cards("is:due")),
        "new": len(col.find_cards("is:new")),
        "reviewedToday": int(reviewed_today),
        "streak": _compute_streak(col, cutoff),
    }`,
    },
    related: ['vestrippn'],
  },
  {
    slug: 'onepager',
    name: 'OnePager',
    path: '~/medicine/onepager',
    type: 'notes',
    summary: 'one-page study summaries',
    state: 'active',
    domains: ['medicine'],
    project: true,
    url: 'https://drive.google.com/drive/folders/1nobEj31AcMk0PhHu2YxNKaihVYsPJRCi',
    related: ['studyex'],
  },
  {
    slug: 'physiohub',
    name: 'PhysioHub',
    path: '~/projects/physiohub',
    type: 'systems atlas',
    summary: 'body-systems physiology hub',
    description: ['Body-systems physiology hub — explore organ-system mechanics, homeostatic loops, and integrated regulation. Beta.'],
    state: 'available',
    domains: ['medicine', 'software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-physiohub.vercel.app',
  },
  {
    slug: 'neuro_pathway',
    name: 'neuro_pathway',
    path: '~/projects/neuro_pathway',
    type: 'neuro map',
    summary: 'nervous-system pathway engine',
    description: ['Interactive nervous-system pathway engine — map neuroanatomy, lesions, reflexes, and signal flow. Beta.'],
    state: 'available',
    domains: ['medicine', 'software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-neuro-pathway.vercel.app',
  },
  {
    slug: 'biochem_pathway',
    name: 'biochem_pathway',
    path: '~/projects/biochem_pathway',
    type: 'metabolic map',
    summary: 'interactive metabolic map',
    description: ['Interactive metabolic map — trace glycolysis, TCA, and enzyme cascades node by node. Beta.'],
    state: 'available',
    domains: ['medicine', 'software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-biochem-pathway.vercel.app',
  },
  {
    slug: 'microbiology_pokedex',
    name: 'microbiology_pokedex',
    path: '~/projects/microbiology_pokedex',
    type: 'pathogen codex',
    summary: 'searchable pathogen codex',
    description: ['Searchable pathogen codex — bacteria, viruses, fungi and parasites with high-yield clinical profiles. Beta.'],
    state: 'available',
    domains: ['medicine', 'software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-pokedex.vercel.app',
  },
  {
    slug: 'immunopath',
    name: 'immunopath',
    path: '~/projects/immunopath',
    type: 'immune map',
    summary: 'interactive immunology pathway',
    description: ['Interactive immunology pathway — map immune cascades, cell lineages, and hypersensitivity mechanisms node by node. Beta.'],
    state: 'available',
    domains: ['medicine', 'software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-immunopath.vercel.app',
  },
  {
    slug: 'food_screener',
    name: 'food_screener',
    path: '~/projects/food_screener',
    type: 'web app',
    summary: 'food screening tool',
    state: 'available',
    domains: ['software'],
    project: true,
    language: 'web',
    url: 'https://vestrippn-food-screener.vercel.app',
  },
];

export const SYSTEMS = NODES.filter((node) => node.system);
export const PROJECTS = NODES.filter((node) => node.project);
export const FEATURED = NODES.filter((node) => node.featured);

export function getNode(slug: string): Node | undefined {
  return NODES.find((node) => node.slug === slug);
}

/** Display index in a registry: systems `00`, projects `001`. */
export function systemIndex(node: Node): string {
  return String(SYSTEMS.indexOf(node)).padStart(2, '0');
}
export function projectIndex(node: Node): string {
  return String(PROJECTS.indexOf(node) + 1).padStart(3, '0');
}

/* ── Runtime: modules mounted inside this app ─────────────────────────── */

export const RUNTIME: RuntimeModule[] = [
  { slug: 'academics', name: 'academics', href: '/academics', path: '~/medicine/academics', branch: 'medicine', summary: 'courses, exam milestones, Anki trend', keywords: 'class exams milestones anki study' },
  { slug: 'workspace', name: 'workspace', href: '/workspace?tab=plan', path: '~/medicine/workspace', branch: 'medicine', summary: 'daily plan, coverage map, courses, backup', keywords: 'plan coverage courses backup semester' },
  { slug: 'cases', name: 'cases', href: '/learn/cases', path: '~/medicine/cases', branch: 'medicine', summary: 'branching clinical cases', keywords: 'clinical case bank branching' },
  { slug: 'analytics', name: 'analytics', href: '/analytics', path: '~/runtime/analytics', branch: 'personal', summary: 'study telemetry across sources', keywords: 'telemetry canvas anki charts' },
  { slug: 'assistant', name: 'assistant', href: '/das', path: '~/runtime/assistant', branch: 'research', summary: 'cited question answering', keywords: 'chat das citations ask' },
  { slug: 'fitness', name: 'fitness', href: '/fitness', path: '~/runtime/fitness', branch: 'personal', summary: 'training log and streaks', keywords: 'workout gym streak training' },
  { slug: 'ielts', name: 'ielts', href: '/ielts', path: '~/runtime/ielts', branch: 'personal', summary: 'IELTS preparation', keywords: 'english band writing speaking' },
  { slug: 'tools', name: 'tools', href: '/tools', path: '~/runtime/tools', branch: 'tools', summary: 'planner and external tool index', keywords: 'links planner msca launch' },
];

/* ── Logs ─────────────────────────────────────────────────────────────── */

export const LOGS: LogEntry[] = [
  {
    id: 'LOG_001',
    slug: '001',
    series: 'code_till_i_am_bored',
    title: 'code till I am bored #1',
    target: 'cardiac_sim_physics',
    targetFile: 'cardiac_sim_physics.py',
    runtime: 'Python',
    kind: 'development log',
    status: 'got bored.',
    termination: 'boredom',
  },
];

export function getLog(slug: string): LogEntry | undefined {
  return LOGS.find((log) => log.slug === slug);
}

/* ── Garage ───────────────────────────────────────────────────────────── */

export const OBJECTS: GarageObject[] = [
  {
    id: 'OBJECT_001',
    slug: 'silver_arrow',
    name: 'Silver Arrow',
    type: 'vehicle',
    state: 'active',
    viewer: '3D · three.js',
    summary: 'open-wheel concept in the 2014 Silver Arrow livery',
    fields: [
      { key: 'livery', value: 'Silver Arrow · 2014 · W05 Hybrid' },
      { key: 'model', value: 'procedural open-wheel concept' },
      { key: 'renderer', value: 'three.js · WebGL' },
      { key: 'paints', value: `${LIVERIES.length} liveries` },
    ],
    notes: [
      'A procedural model, inspired by the palette — not a replica of any historical chassis. Geometry is generated in code and repainted without rebuilding.',
    ],
  },
  {
    id: 'OBJECT_002',
    slug: 'mark',
    name: 'VESTRIPPN mark',
    type: 'identity object',
    state: 'archived',
    viewer: '3D · raw WebGL',
    summary: 'the W100 three-dimensional mark',
    fields: [
      { key: 'build', value: 'W100 · 2026-09-27' },
      { key: 'geometry', value: 'traced from vestrippn-logo.png' },
      { key: 'renderer', value: 'raw WebGL · no library' },
      { key: 'paint', value: 'active livery stripe' },
    ],
    notes: ['The mark from the W100 build, kept as an object rather than chrome.'],
  },
];

export function getObject(slug: string): GarageObject | undefined {
  return OBJECTS.find((object) => object.slug === slug);
}
