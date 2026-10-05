'use client';

import { useEffect, useState } from 'react';

/* ════════════════════════════════════════════════════════════════════════
   Outline (VS Code's Outline view): the headings of the open page, indented
   by level. Clicking one scrolls it to the top and moves focus there; the
   heading in view is marked current as you scroll.

   Pages render their headings from data that may arrive after load, so the
   list is rebuilt whenever the page's DOM changes. A heading without an id
   gets one from its text so it can be linked to.
   ════════════════════════════════════════════════════════════════════════ */

type Heading = { id: string; text: string; level: number };

const SELECTOR = 'h1, h2, h3';
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'section';

function collect(main: HTMLElement): Heading[] {
  const used = new Set<string>();
  const list: Heading[] = [];
  for (const element of main.querySelectorAll<HTMLElement>(SELECTOR)) {
    // Skip headings that are hidden or inside closed dialogs and menus.
    if (!element.getClientRects().length || element.closest('dialog:not([open]), [hidden], [aria-hidden="true"]')) continue;
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (!element.id || used.has(element.id)) {
      const base = `h-${slug(text)}`;
      let id = base;
      for (let n = 2; used.has(id) || (document.getElementById(id) && document.getElementById(id) !== element); n++) id = `${base}-${n}`;
      element.id = id;
    }
    used.add(element.id);
    list.push({ id: element.id, text, level: Number(element.tagName[1]) });
  }
  return list;
}

export default function OutlineView({ pathname }: { pathname: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let list: Heading[] = [];
    const markCurrent = () => {
      const top = main.getBoundingClientRect().top + 72;
      let id: string | null = list[0]?.id ?? null;
      for (const heading of list) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= top) id = heading.id;
      }
      setCurrent(id);
    };
    const refresh = () => {
      list = collect(main);
      setHeadings(list);
      markCurrent();
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 150);
    };
    refresh();
    const observer = new MutationObserver(schedule);
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    main.addEventListener('scroll', markCurrent, { passive: true });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      main.removeEventListener('scroll', markCurrent);
    };
  }, [pathname]);

  const go = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ block: 'start' });
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, '', `#${id}`);
    setCurrent(id);
  };

  if (!headings.length) return <p className="sys-muted sys-view-empty">This page has no headings.</p>;

  const min = Math.min(...headings.map((heading) => heading.level));
  return (
    <nav aria-label="Outline of this page">
      <ul className="sys-outline">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - min) * 14}px` }}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === current ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                go(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
