'use client';

/* ════════════════════════════════════════════════════════════════════════
   W09 NAVIGATION — shared desktop rail + mobile hub chips.
   Replaces the 8 per-page copies of the <aside> rail and bottom nav.

   NavRail (desktop):
   - collapsed: icon column; the ACTIVE hub keeps a mini label under its
     icon, every other item reveals its label on hover (in-rail tooltip —
     nothing escapes the rail, so the overflow-hidden aside never clips).
   - expanded: full labels (toggled from the page header hamburger).
   - active item: livery-aware accent bar + pill highlight.

   MobileHubNav: labeled hub-selector chips in a scrollable bottom dock;
   the active chip auto-centers on mount. first/last auto margins center
   the row when it fits and allow scrolling when it doesn't.
   ════════════════════════════════════════════════════════════════════════ */

import Link from 'next/link';
import { Fragment, useEffect, useRef } from 'react';
import Clock from './Clock';

export type HubName =
  | 'Dashboard'
  | 'Academics'
  | 'Research'
  | 'Fitness'
  | 'Archive'
  | 'IELTS'
  | 'Tools'
  | 'Identity';

export const HUBS: { name: HubName; icon: string; href: string }[] = [
  { name: 'Dashboard', icon: '◉', href: '/' },
  { name: 'Academics', icon: '▲', href: '/academics' },
  { name: 'Research', icon: '◆', href: '/research' },
  { name: 'Fitness', icon: '◈', href: '/fitness' },
  { name: 'Archive', icon: '▥', href: '/archive' },
  { name: 'IELTS', icon: '◎', href: '/ielts' },
  { name: 'Tools', icon: '⚙', href: '/tools' },
  { name: 'Identity', icon: '⚇', href: '/identity' },
];

/* W09 color coding — every hub owns a hue, used by the rail, the mobile
   chips, and the hero. Tailwind classes (not inline hex) so the special
   liveries can remap the whole system through their color-ramp overrides. */
export const HUB_THEME: Record<HubName, { bar: string; icon: string }> = {
  Dashboard: { bar: 'bg-sky-400', icon: 'text-sky-400' },
  Academics: { bar: 'bg-blue-400', icon: 'text-blue-400' },
  Research: { bar: 'bg-cyan-400', icon: 'text-cyan-400' },
  Fitness: { bar: 'bg-rose-400', icon: 'text-rose-400' },
  Archive: { bar: 'bg-purple-400', icon: 'text-purple-400' },
  IELTS: { bar: 'bg-indigo-400', icon: 'text-indigo-400' },
  Tools: { bar: 'bg-amber-400', icon: 'text-amber-400' },
  Identity: { bar: 'bg-teal-400', icon: 'text-teal-400' },
};

export function NavRail({ active, expanded, onToggle }: { active: HubName; expanded: boolean; onToggle: () => void }) {
  return (
    <aside
      className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        expanded ? 'w-[240px] px-6' : 'w-[88px] px-4'
      }`}
    >
      <nav className="space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {HUBS.map((item, i) => {
          const isActive = item.name === active;
          const theme = HUB_THEME[item.name];
          return (
            <Fragment key={item.name}>
              {i === 1 && <div className="mx-2 my-2 h-px bg-black/5 dark:bg-white/10" />}
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex rounded-2xl transition-all duration-300 ${
                  expanded ? 'flex-row items-center px-4 py-3' : 'flex-col items-center justify-center px-1 py-2.5'
                } ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md'
                    : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <span className={`absolute left-[3px] top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full ${theme.bar}`} />
                )}
                <span
                  className={`text-[18px] shrink-0 leading-none transition-transform duration-300 ${
                    isActive ? theme.icon : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'
                  }`}
                >
                  {item.icon}
                </span>
                {expanded ? (
                  <>
                    <span className="ml-4 max-w-[150px] whitespace-nowrap text-[13px] font-bold tracking-tight">{item.name}</span>
                    {isActive && <span className={`ml-auto h-1.5 w-1.5 rounded-full ${theme.bar}`} />}
                  </>
                ) : (
                  <span
                    className={`mt-1 overflow-hidden whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${
                      isActive ? 'max-h-4 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-4 group-hover:opacity-100'
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            </Fragment>
          );
        })}
      </nav>
      <button
        onClick={onToggle}
        title={expanded ? 'Collapse rail' : 'Expand rail'}
        className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${
          expanded ? 'p-5' : 'p-4 aspect-square'
        }`}
      >
        {expanded ? <Clock /> : <span className="text-xl transition-transform duration-300 group-hover:rotate-12">⏱️</span>}
      </button>
    </aside>
  );
}

export function MobileHubNav({ active }: { active: HubName }) {
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // Bring the active chip into view without disturbing page scroll
    const el = activeRef.current;
    const dock = el?.parentElement;
    if (el && dock) {
      dock.scrollLeft = el.offsetLeft - dock.clientWidth / 2 + el.clientWidth / 2;
    }
  }, []);

  return (
    <nav className="lg:hidden fixed bottom-6 inset-x-0 mx-auto h-[60px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center px-2 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-fit sm:max-w-[92vw] overflow-x-auto no-scrollbar transition-all duration-700">
      {HUBS.map((item) => {
        const isActive = item.name === active;
        const theme = HUB_THEME[item.name];
        return (
          <Link
            key={item.name}
            href={item.href}
            ref={isActive ? activeRef : undefined}
            aria-current={isActive ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 transition-all duration-300 first:ml-auto last:mr-auto ${
              isActive
                ? 'bg-neutral-900 text-white shadow-md dark:bg-white dark:text-black'
                : 'text-neutral-500 hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/10'
            }`}
          >
            {isActive && <span className={`h-1.5 w-1.5 rounded-full ${theme.bar}`} />}
            <span className={`text-[14px] leading-none ${isActive ? theme.icon : ''}`}>{item.icon}</span>
            <span className="whitespace-nowrap text-[10px] font-bold tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
