import type { ResolvedNav } from './nav-layout';
import { resolvePath } from './navigation';
import { OBJECTS, PROJECTS, RUNTIME, SYSTEMS } from './registry';
import { COLOR_THEMES, COLOR_THEME_LABEL, type ColorTheme } from '../vscode-themes';
import { DRUGS, findDrug } from '../drugs';

/* ════════════════════════════════════════════════════════════════════════
   The panel's terminal: a tiny shell over the VESTRIPPN tree.

   `run(line, ctx)` is pure: it returns the lines to print and at most one
   effect (navigate, open a link, change a setting, clear). The Panel
   component performs the effect. Nothing here touches the network.
   ════════════════════════════════════════════════════════════════════════ */

export type TerminalContext = {
  pathname: string;
  nav: ResolvedNav;
  user: string | null;
  colorTheme: ColorTheme;
  livery: string;
  liveries: string[];
  appearance: string;
  watermark: boolean;
  tabs: string[];
  history: string[];
  now: Date;
};

export type TerminalEffect =
  | { type: 'navigate'; href: string }
  | { type: 'external'; href: string }
  | { type: 'theme'; value: ColorTheme }
  | { type: 'appearance'; value: 'dark' | 'light' | 'auto' }
  | { type: 'livery'; value: string | 'next' }
  | { type: 'watermark'; value: boolean }
  | { type: 'palette'; query: string }
  | { type: 'clear' };

export type TerminalResult = { output: string[]; effect?: TerminalEffect; error?: boolean };

const HELP = [
  'commands:',
  '  ls [dir]           list what is under a directory (default: here)',
  '  cd <dir|name>      go to a page: cd medicine, cd ~/systems, cd .., cd ~',
  '  open <name|url>    open a page, a system/project, or an https link',
  '  pwd                print where you are',
  '  find <words>       search everything (opens ⌘K with the query)',
  '  drug <name>        open a drug card (drug with no name lists them)',
  '  theme [name]       list or set the colour theme (vestrippn, modern, classic)',
  '  appearance <mode>  dark, light or auto',
  '  livery [id|next]   show, set or cycle the livery',
  '  watermark [on|off] show or set the dexmedetomidine background',
  '  tabs               list open editor tabs',
  '  whoami · date · echo · history · clear · help',
];

const SHORT_THEME: Record<string, ColorTheme> = { vestrippn: 'vestrippn', default: 'vestrippn', modern: 'vscode-modern', classic: 'vscode-classic', 'dark+': 'vscode-classic', 'light+': 'vscode-classic' };

type Child = { name: string; href: string };

/** What `ls` shows under a route. */
function children(path: string, nav: ResolvedNav): Child[] | null {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/') {
    return [...nav.environment, ...nav.runtime]
      .filter((item) => !item.hidden && item.href !== '/')
      .map((item) => ({ name: item.external ? `${item.label} ↗` : item.label, href: item.href }));
  }
  if (clean === '/systems') return SYSTEMS.map((node) => ({ name: node.slug, href: `/systems/${node.slug}` }));
  if (clean === '/projects') return PROJECTS.map((node) => ({ name: node.slug, href: `/projects/${node.slug}` }));
  if (clean === '/garage') return OBJECTS.map((object) => ({ name: object.slug, href: `/garage/${object.slug}` }));
  if (clean === '/medicine') return RUNTIME.filter((m) => m.branch === 'medicine').map((m) => ({ name: m.slug, href: m.href }));
  return null;
}

/** Resolve a cd/open target to an href, or null. */
export function resolveTarget(target: string, ctx: Pick<TerminalContext, 'pathname' | 'nav'>): string | null {
  const t = target.trim();
  if (!t) return null;
  if (t === '~' || t === '/' || t === '~/') return '/';
  if (t === '..') {
    const parts = ctx.pathname.split('/').filter(Boolean);
    return parts.length <= 1 ? '/' : `/${parts.slice(0, -1).join('/')}`;
  }
  if (t === '.') return ctx.pathname;
  if (t.startsWith('~/') || t.startsWith('/')) {
    const path = `/${t.replace(/^~?\//, '')}`.replace(/\/+$/, '') || '/';
    // A tree path like ~/medicine/academics points at its mounted route.
    const mounted = RUNTIME.find((m) => m.path === `~${path}`);
    return mounted ? mounted.href : path;
  }
  const name = t.toLowerCase();
  const fromHere = children(ctx.pathname, ctx.nav)?.find((child) => child.name.toLowerCase().replace(/ ↗$/, '') === name);
  if (fromHere) return fromHere.href;
  const tab = [...ctx.nav.environment, ...ctx.nav.runtime].find((item) => item.label.toLowerCase() === name || item.defaultLabel?.toLowerCase() === name);
  if (tab) return tab.href;
  if (SYSTEMS.some((node) => node.slug === name)) return `/systems/${name}`;
  if (PROJECTS.some((node) => node.slug === name)) return `/projects/${name}`;
  if (OBJECTS.some((object) => object.slug === name)) return `/garage/${name}`;
  return null;
}

export function run(line: string, ctx: TerminalContext): TerminalResult {
  const trimmed = line.trim();
  if (!trimmed) return { output: [] };
  const [command, ...args] = trimmed.split(/\s+/);
  const rest = args.join(' ');
  switch (command.toLowerCase()) {
    case 'help':
    case '?':
      return { output: HELP };
    case 'clear':
    case 'cls':
      return { output: [], effect: { type: 'clear' } };
    case 'pwd':
      return { output: [resolvePath(ctx.pathname).display] };
    case 'whoami':
      return { output: [ctx.user ?? 'guest (not signed in)'] };
    case 'date':
      return { output: [ctx.now.toString()] };
    case 'echo':
      return { output: [rest] };
    case 'history':
      return { output: ctx.history.length ? ctx.history.map((entry, i) => `${String(i + 1).padStart(3)}  ${entry}`) : ['(empty)'] };
    case 'tabs':
      return { output: ctx.tabs.length ? ctx.tabs : ['(no open tabs)'] };
    case 'ls':
    case 'dir': {
      const where = rest ? resolveTarget(rest, ctx) : ctx.pathname;
      const list = where ? children(where, ctx.nav) : null;
      if (!list) return { output: [`ls: ${rest || resolvePath(ctx.pathname).display}: nothing listed here`], error: true };
      return { output: list.map((child) => child.name) };
    }
    case 'cd':
    case 'open': {
      if (!rest) return command === 'cd' ? { output: [], effect: { type: 'navigate', href: '/' } } : { output: ['open: what should I open?'], error: true };
      if (command === 'open' && /^https?:\/\//i.test(rest)) {
        try {
          return { output: [`opening ${new URL(rest).toString()}`], effect: { type: 'external', href: new URL(rest).toString() } };
        } catch {
          return { output: [`open: not a valid link: ${rest}`], error: true };
        }
      }
      const href = resolveTarget(rest, ctx);
      if (!href) return { output: [`${command}: no such page: ${rest}`], error: true };
      if (/^https?:\/\//i.test(href)) return { output: [`opening ${href}`], effect: { type: 'external', href } };
      return { output: [], effect: { type: 'navigate', href } };
    }
    case 'find':
    case 'search':
      return rest ? { output: [], effect: { type: 'palette', query: rest } } : { output: ['find: what should I look for?'], error: true };
    case 'theme': {
      if (!rest) return { output: COLOR_THEMES.map((id) => `${id === ctx.colorTheme ? '*' : ' '} ${id.replace('vscode-', '').padEnd(10)} ${COLOR_THEME_LABEL[id]}`) };
      const value = SHORT_THEME[rest.toLowerCase()] ?? (COLOR_THEMES as readonly string[]).find((id) => id === rest.toLowerCase());
      if (!value) return { output: [`theme: unknown theme '${rest}'. Try: vestrippn, modern, classic`], error: true };
      return { output: [`colour theme: ${COLOR_THEME_LABEL[value as ColorTheme]}`], effect: { type: 'theme', value: value as ColorTheme } };
    }
    case 'appearance':
    case 'mode': {
      const value = rest.toLowerCase();
      if (value !== 'dark' && value !== 'light' && value !== 'auto') return { output: [`appearance: ${ctx.appearance}. Set with: appearance dark|light|auto`], error: !!rest };
      return { output: [`appearance: ${value}`], effect: { type: 'appearance', value } };
    }
    case 'livery': {
      if (!rest) return { output: [`livery: ${ctx.livery}`, `available: ${ctx.liveries.join(', ')}`] };
      if (rest === 'next') return { output: [], effect: { type: 'livery', value: 'next' } };
      if (!ctx.liveries.includes(rest)) return { output: [`livery: unknown livery '${rest}'`], error: true };
      return { output: [`livery: ${rest}`], effect: { type: 'livery', value: rest } };
    }
    case 'watermark': {
      const value = rest.toLowerCase();
      if (!value) return { output: [`watermark: ${ctx.watermark ? 'on' : 'off'}`] };
      if (value !== 'on' && value !== 'off') return { output: [`watermark: expected on or off, got '${rest}'`], error: true };
      return { output: [`watermark: ${value}`], effect: { type: 'watermark', value: value === 'on' } };
    }
    case 'drug':
    case 'drugs': {
      if (!rest) return { output: [`${DRUGS.length} drug cards:`, DRUGS.map((drug) => drug.slug).join('  ')] };
      const drug = findDrug(rest);
      if (!drug) return { output: [`drug: no card for '${rest}'. Type 'drug' for the list.`], error: true };
      return { output: [`${drug.name} — ${drug.class}`], effect: { type: 'navigate', href: `/drugs/${drug.slug}` } };
    }
    case 'sudo':
      return { output: ['nice try. VESTRIPPN runs as you.'] };
    default:
      return { output: [`${command}: command not found. Type 'help'.`], error: true };
  }
}
