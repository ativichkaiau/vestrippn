'use client';

import { useEffect, type RefObject } from 'react';

const SURFACES = [
  'main .w10-clay-hero', 'main .w10-clay-surface',
  'main [data-motion-card]', 'main [data-w85-ambient-card]',
  'main :is(section, article, div, a)[class*="rounded-"][class*="border"]',
].join(',');
const EXCLUDED = 'dialog, [role="dialog"], nav, aside, table, [role="grid"], [role="alert"], [contenteditable="true"], [data-spatial="off"], [class~="fixed"], [class~="sticky"]';
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const FLOATING_CONTENT = 'dialog, [role="dialog"], [class~="fixed"], [class~="sticky"]';
const PROPERTIES = ['--spatial-axis-x', '--spatial-axis-y', '--spatial-angle', '--spatial-light-x', '--spatial-light-y'] as const;

/** Adds pointer lighting to CSS depth without wrapping or replacing route cards.
 * Individual `rotate` composes with Framer's transform and reveal's translate.
 * There is no idle render loop: only one requested frame per pointer update.
 */
export function useSpatialDepth(shellRef: RefObject<HTMLElement | null>, disabled: boolean) {
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const registered = new Set<HTMLElement>();
    const tiltable = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const pending = new Set<HTMLElement>();
    const finePointer = window.matchMedia(FINE_POINTER);
    const reducedMotion = window.matchMedia(REDUCED_MOTION);
    let current: HTMLElement | null = null;
    let pointerFrame = 0;
    let scanFrame = 0;
    let point = { x: 0, y: 0 };

    const clearTilt = (element: HTMLElement) => {
      element.removeAttribute('data-spatial-active');
      element.removeAttribute('data-spatial-pressed');
      element.removeAttribute('data-spatial-surface');
      element.removeAttribute('data-spatial-tiltable');
      for (const property of PROPERTIES) element.style.removeProperty(property);
    };
    const reset = () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      if (current) clearTilt(current);
      current = null;
    };
    const canMove = () => !disabled && finePointer.matches && !reducedMotion.matches &&
      !document.hidden && !document.documentElement.classList.contains('low-power');

    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(element);
        else {
          visible.delete(element);
          if (current === element) reset();
        }
      }
    }, { rootMargin: '60px' });

    const register = (node: HTMLElement) => {
      const candidates = [node, ...node.querySelectorAll<HTMLElement>(SURFACES)];
      for (const element of candidates) {
        let parent = element.parentElement;
        while (parent && !registered.has(parent)) parent = parent.parentElement;
        if (!element.matches(SURFACES) || registered.has(element) || element.closest(EXCLUDED) || parent ||
          element.matches('[class*="rounded-full"]')) continue;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (rect.width < 180 || rect.height < 76 || rect.height > 1000 ||
          ['fixed', 'sticky', 'absolute'].includes(style.position)) continue;
        // Registration only reads the DOM. Streaming children may not have
        // hydrated yet; writing attributes here would cause hydration mismatches.
        if (style.rotate === 'none' && !element.style.rotate && !element.querySelector(FLOATING_CONTENT)) {
          tiltable.add(element);
        }
        registered.add(element);
        if (observer) observer.observe(element);
        else visible.add(element);
      }
    };
    const scan = () => {
      scanFrame = 0;
      for (const node of pending) if (node.isConnected) register(node);
      pending.clear();
      for (const element of registered) if (!element.isConnected) {
        if (current === element) reset();
        observer?.unobserve(element);
        registered.delete(element);
        tiltable.delete(element);
        visible.delete(element);
      } else if (element.hasAttribute('data-spatial-tiltable') && element.querySelector(FLOATING_CONTENT)) {
        // A lazily opened in-card menu must keep its viewport positioning.
        if (current === element) reset();
        element.removeAttribute('data-spatial-tiltable');
      }
    };
    const mutations = new MutationObserver(records => {
      let changed = false;
      for (const record of records) {
        for (const node of record.addedNodes) if (node instanceof HTMLElement) {
          pending.add(node);
          changed = true;
        }
        if ([...record.removedNodes].some(node => node instanceof HTMLElement)) changed = true;
      }
      if (changed && !scanFrame) scanFrame = requestAnimationFrame(scan);
    });

    const paintPointer = () => {
      pointerFrame = 0;
      if (!current || !canMove() || !current.isConnected || current.contains(document.activeElement)) {
        reset();
        return;
      }
      const rect = current.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((point.x - rect.left) / rect.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((point.y - rect.top) / rect.height - 0.5) * 2));
      current.style.setProperty('--spatial-axis-x', (-y || 0.001).toFixed(3));
      current.style.setProperty('--spatial-axis-y', (x || 0.001).toFixed(3));
      current.style.setProperty('--spatial-angle', `${(Math.min(1, Math.hypot(x, y)) * 1.6).toFixed(2)}deg`);
      current.style.setProperty('--spatial-light-x', `${((x + 1) * 50).toFixed(1)}%`);
      current.style.setProperty('--spatial-light-y', `${((y + 1) * 50).toFixed(1)}%`);
      current.setAttribute('data-spatial-surface', current.matches('.w10-clay-hero') ? 'hero' : 'card');
      current.setAttribute('data-spatial-tiltable', '');
      current.setAttribute('data-spatial-active', '');
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!canMove() || event.pointerType !== 'mouse' || event.buttons !== 0 || !(event.target instanceof Element)) {
        reset();
        return;
      }
      // Never tilt a surface while its form controls are being used.
      let target = event.target instanceof HTMLElement ? event.target : event.target.parentElement;
      while (target && !registered.has(target)) target = target.parentElement;
      if (!target || !tiltable.has(target) || !visible.has(target) || target.contains(document.activeElement) ||
          target.querySelector(FLOATING_CONTENT) ||
          event.target.closest('input, textarea, select, [contenteditable="true"]')) {
        reset();
        return;
      }
      if (current !== target) {
        reset();
        current = target;
      }
      point = { x: event.clientX, y: event.clientY };
      if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
    };
    const onPointerDown = (event: PointerEvent) => {
      reset();
      // Press feedback belongs only to a whole-card link, never its nested form.
      if (canMove() && event.target instanceof Element) {
        const link = event.target.closest<HTMLElement>('a');
        if (link && registered.has(link)) {
          link.setAttribute('data-spatial-surface', 'card');
          link.setAttribute('data-spatial-pressed', '');
        }
      }
    };
    const onPointerUp = () => {
      for (const element of registered) {
        element.removeAttribute('data-spatial-pressed');
        if (current !== element) element.removeAttribute('data-spatial-surface');
      }
    };
    const onFocus = () => reset();
    const onVisibility = () => { if (document.hidden) reset(); };

    register(shell);
    mutations.observe(shell, { subtree: true, childList: true });
    shell.addEventListener('pointermove', onPointerMove, { passive: true });
    shell.addEventListener('pointerleave', reset);
    shell.addEventListener('pointerdown', onPointerDown, { passive: true });
    shell.addEventListener('focusin', onFocus);
    shell.addEventListener('scroll', reset, { passive: true, capture: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', reset);
    window.addEventListener('resize', reset);
    document.addEventListener('visibilitychange', onVisibility);
    finePointer.addEventListener('change', reset);
    reducedMotion.addEventListener('change', reset);

    return () => {
      reset();
      cancelAnimationFrame(scanFrame);
      observer?.disconnect();
      mutations.disconnect();
      shell.removeEventListener('pointermove', onPointerMove);
      shell.removeEventListener('pointerleave', reset);
      shell.removeEventListener('pointerdown', onPointerDown);
      shell.removeEventListener('focusin', onFocus);
      shell.removeEventListener('scroll', reset, true);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', reset);
      document.removeEventListener('visibilitychange', onVisibility);
      finePointer.removeEventListener('change', reset);
      reducedMotion.removeEventListener('change', reset);
      for (const element of registered) {
        clearTilt(element);
        element.removeAttribute('data-spatial-surface');
        element.removeAttribute('data-spatial-tiltable');
      }
    };
  }, [disabled, shellRef]);
}
