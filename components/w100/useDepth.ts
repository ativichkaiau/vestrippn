'use client';

import { useEffect, type RefObject } from 'react';

/**
 * W100 depth engine — every panel on every page becomes a physical slab.
 *
 * One delegated pointer listener on the route shell (like usePageMotion) finds
 * the card under a fine pointer and tilts it toward the pointer in real
 * perspective, with a specular glare and a shadow that shifts with the tilt.
 * Hub heroes add parallax: their livery artwork sinks behind the content.
 * No page opts in; nothing is wrapped, so framer-motion and Tailwind keep
 * owning the cards they already animate.
 *
 * How it composes safely — two paths, chosen per card on engage:
 * - `own`: a card nothing else transforms gets the whole tilt, perspective
 *   included, in its own `transform`. Tailwind v4's hover lifts write
 *   `translate`/`scale`, which still stack on top. Zero blast radius.
 * - `stage`: framer-motion (inline `transform`) or a CSS :hover transform
 *   already owns `transform`, so the tilt goes in the individual `rotate`
 *   property instead, and the card's parent supplies `perspective`. Because
 *   `perspective` makes the parent a containing block, it is only applied when
 *   no absolutely/fixed positioned descendant is anchored above the parent;
 *   otherwise the card tilts without foreshortening rather than moving
 *   anything.
 * - CSS withholds both from cards/stages holding a `fixed` element or an open
 *   dialog, which a transform would otherwise re-anchor.
 * - Glare paints as the card's background-image, and only on cards that have
 *   none, so gradient artwork is never replaced. Surfaces built from the
 *   spatial material (app/depth.css) take the pointer as their light instead.
 * - Never while someone is typing: form controls stop the tilt, and so does
 *   pointing at an interactive 3D viewer (the car showroom, which drags).
 *
 * Off for touch/coarse pointers, reduced motion and low power.
 */

const CARD_SELECTOR = [
  '[data-motion="hero"]',
  'main :is(section, article, div, a, button, li)[class*="rounded-"][class*="border"]',
  '[data-motion-card]',
  '.livery-card',
  '[data-w100-tilt="on"]',
].join(',');
const EXCLUDED = 'input, textarea, select, [contenteditable="true"], nav, [data-w100-tilt="off"], .w100-skel, .w100-skel-group';
const FIELDS = 'input, textarea, select, [contenteditable="true"]';
// Pointing here settles the tilt: form fields, and 3D viewers that drag.
const HOLD = `${FIELDS}, [data-spatial="off"], .w100-mark-interactive`;
const SETTLE_MS = 520;
const VARS = ['--w100-rx', '--w100-ry', '--w100-angle', '--w100-gx', '--w100-gy', '--w100-px', '--w100-py', '--w100-sx', '--w100-sy'];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
// Someone is typing in this card: it holds still until they leave the field.
const typingIn = (card: HTMLElement) => {
  const focused = document.activeElement;
  return focused instanceof Element && focused !== card && card.contains(focused) && focused.matches(FIELDS);
};

export function depthAllowed() {
  return !document.documentElement.classList.contains('low-power') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Attach the engine to any root (the route shell, or the portaled livery garage). */
export function attachDepth(shell: HTMLElement): () => void {
  let active: HTMLElement | null = null;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const settling = new Map<HTMLElement, number>();

  const eligible = (element: HTMLElement) => {
    if (element.closest(EXCLUDED)) return false;
    const rect = element.getBoundingClientRect();
    if (rect.width < 140 || rect.height < 56) return false;
    // Whole-page columns are layout, not objects.
    if (rect.height > window.innerHeight * 1.35 || rect.width > window.innerWidth * 0.98) return false;
    const position = getComputedStyle(element).position;
    return position !== 'fixed' && position !== 'sticky';
  };

  const cardAt = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element) || target.closest(HOLD)) return null;
    // Inside a hero, the hero moves as one object.
    const hero = target.closest<HTMLElement>('[data-motion="hero"]');
    if (hero && shell.contains(hero)) return eligible(hero) && !typingIn(hero) ? hero : null;
    let card = target.closest<HTMLElement>(CARD_SELECTOR);
    while (card && !eligible(card)) card = card.parentElement?.closest<HTMLElement>(CARD_SELECTOR) ?? null;
    return card && shell.contains(card) && !typingIn(card) ? card : null;
  };

  // Would `perspective` on this parent re-anchor something positioned above it?
  const stageSafe = (stage: HTMLElement) => {
    for (const element of stage.querySelectorAll<HTMLElement>('.absolute, .fixed, [style*="position"]')) {
      const anchor = element.offsetParent;
      if (anchor && anchor !== stage && !stage.contains(anchor)) return false;
    }
    return true;
  };

  const clearStage = (card: HTMLElement) => {
    const stage = card.parentElement;
    if (!stage) return;
    // Another engaged or settling sibling may still need the stage.
    const busy = [...stage.children].some(child => child !== card && (child as HTMLElement).dataset?.w100Depth);
    if (!busy) {
      stage.removeAttribute('data-w100-stage');
      stage.style.removeProperty('perspective-origin');
    }
  };

  const settle = (card: HTMLElement) => {
    card.dataset.w100Depth = 'settle';
    for (const name of ['--w100-angle', '--w100-px', '--w100-py', '--w100-sx', '--w100-sy']) card.style.setProperty(name, name === '--w100-angle' ? '0deg' : '0');
    window.clearTimeout(settling.get(card));
    settling.set(card, window.setTimeout(() => {
      settling.delete(card);
      if (card === active) return;
      delete card.dataset.w100Depth;
      delete card.dataset.w100Mode;
      card.removeAttribute('data-w100-glare');
      for (const name of VARS) card.style.removeProperty(name);
      clearStage(card);
    }, SETTLE_MS));
  };

  const engage = (card: HTMLElement) => {
    window.clearTimeout(settling.get(card));
    settling.delete(card);
    if (!card.dataset.w100Depth) {
      const computed = getComputedStyle(card);
      if (computed.backgroundImage === 'none') card.setAttribute('data-w100-glare', '');
      card.dataset.w100Mode = !card.style.transform && computed.transform === 'none' ? 'own' : 'stage';
    }
    card.dataset.w100Depth = 'on';
    const stage = card.parentElement;
    if (card.dataset.w100Mode === 'stage' && stage && stage !== document.body &&
      (stage.hasAttribute('data-w100-stage') || stageSafe(stage))) {
      const cardRect = card.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      // Vanishing point at the card's own centre, so edge cards don't skew.
      stage.style.perspectiveOrigin = `${cardRect.left - stageRect.left + cardRect.width / 2}px ${cardRect.top - stageRect.top + cardRect.height / 2}px`;
      stage.setAttribute('data-w100-stage', '');
    }
  };

  const update = () => {
    frame = 0;
    const card = active;
    if (!card) return;
    if (!card.isConnected) { active = null; return; }
    if (typingIn(card)) { retarget(null); return; }
    const rect = card.getBoundingClientRect();
    const nx = clamp(((pointerX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const ny = clamp(((pointerY - rect.top) / rect.height) * 2 - 1, -1, 1);
    const hero = card.matches('[data-motion="hero"]');
    // Big slabs move less; small tiles can afford a livelier tilt.
    const max = hero ? 3.4 : clamp(3400 / Math.max(rect.width, rect.height), 2.6, 9);
    const magnitude = Math.hypot(nx, ny);
    // Press where the pointer is: that edge recedes, the opposite lifts.
    const axisX = magnitude < 0.001 ? 0 : -ny / magnitude;
    const axisY = magnitude < 0.001 ? 1 : nx / magnitude;
    const style = card.style;
    style.setProperty('--w100-rx', axisX.toFixed(3));
    style.setProperty('--w100-ry', axisY.toFixed(3));
    style.setProperty('--w100-angle', `${(Math.min(1, magnitude) * max).toFixed(2)}deg`);
    style.setProperty('--w100-gx', `${(((nx + 1) / 2) * 100).toFixed(1)}%`);
    style.setProperty('--w100-gy', `${(((ny + 1) / 2) * 100).toFixed(1)}%`);
    style.setProperty('--w100-px', nx.toFixed(3));
    style.setProperty('--w100-py', ny.toFixed(3));
    style.setProperty('--w100-sx', (-nx).toFixed(3));
    style.setProperty('--w100-sy', (-ny).toFixed(3));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

  const retarget = (target: EventTarget | null) => {
    const card = cardAt(target);
    if (card === active) return;
    if (active) settle(active);
    active = card;
    if (card) engage(card);
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    retarget(event.target);
    if (active) schedule();
  };
  const onLeave = () => {
    if (active) settle(active);
    active = null;
  };
  // Focus moved into a field under a still pointer (a click, or Tab).
  const onFocus = () => { if (active && typingIn(active)) retarget(null); };
  const onScroll = () => {
    if (!active) return;
    // Content moved under a still pointer.
    retarget(document.elementFromPoint(pointerX, pointerY));
    if (active) schedule();
  };

  shell.addEventListener('pointermove', onMove, { passive: true });
  shell.addEventListener('pointerleave', onLeave);
  shell.addEventListener('scroll', onScroll, { capture: true, passive: true });
  shell.addEventListener('focusin', onFocus);

  return () => {
    cancelAnimationFrame(frame);
    shell.removeEventListener('pointermove', onMove);
    shell.removeEventListener('pointerleave', onLeave);
    shell.removeEventListener('scroll', onScroll, true);
    shell.removeEventListener('focusin', onFocus);
    for (const timer of settling.values()) window.clearTimeout(timer);
    for (const card of shell.querySelectorAll<HTMLElement>('[data-w100-depth]')) {
      delete card.dataset.w100Depth;
      delete card.dataset.w100Mode;
      card.removeAttribute('data-w100-glare');
      for (const name of VARS) card.style.removeProperty(name);
    }
    for (const stage of shell.querySelectorAll<HTMLElement>('[data-w100-stage]')) {
      stage.removeAttribute('data-w100-stage');
      stage.style.removeProperty('perspective-origin');
    }
  };
}

export function useDepth(shellRef: RefObject<HTMLElement | null>, disabled: boolean) {
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || disabled || !depthAllowed()) return;
    return attachDepth(shell);
  }, [disabled, shellRef]);
}
