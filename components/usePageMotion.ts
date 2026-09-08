'use client';

import { useEffect, type RefObject } from 'react';

// Semantic sections cover the reading pages; bordered cards cover the hubs.
// Pages can explicitly opt a block in/out with data-w85-reveal="on" / "off".
const REVEAL_SELECTOR = [
  'main section', 'main article', 'main h1', 'main h2', 'main h3',
  'main [data-motion-card]', 'main [data-w85-reveal="on"]',
  'main div[class*="rounded-"][class*="border"]',
  'main a[class*="rounded-"][class*="border"]',
].join(',');
const IDLE_SELECTOR = '.w85-livery-decoration, .w10-brand-mark';
const EXCLUDED = 'dialog, [role="dialog"], [class~="fixed"], nav, aside, [contenteditable="true"], [data-w85-reveal="off"]';

/** Progressive enhancement: content is never hidden while waiting for JS. */
export function usePageMotion(
  shellRef: RefObject<HTMLDivElement | null>,
  progressRef: RefObject<HTMLSpanElement | null>,
  disabled: boolean,
) {
  useEffect(() => {
    const shell = shellRef.current;
    const progress = progressRef.current;
    if (!shell || !progress || disabled ||
      document.documentElement.classList.contains('low-power') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined' || typeof ResizeObserver === 'undefined') return;

    const registered = new Set<HTMLElement>();
    const idle = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    const resizeTargets = new Set<Element>();
    const pendingNodes = new Set<HTMLElement>();
    let main: HTMLElement | null = null;
    let scrollport: HTMLElement | null = null;
    let scrollFrame = 0;
    let scanFrame = 0;

    const finish = (element: HTMLElement, animation: Animation) => {
      if (animations.get(element) !== animation) return;
      animations.delete(element);
      element.dataset.w85RevealState = 'done';
    };

    const reveals = new IntersectionObserver((entries) => {
      let stagger = 0;
      // Parents run first, so a card and its own heading don't move twice.
      entries.sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        reveals.unobserve(element);
        element.dataset.w85RevealState = 'done';
        const rect = element.getBoundingClientRect();
        const heading = /^H[123]$/.test(element.tagName);
        if ((!heading && (rect.width < 150 || rect.height < 64)) ||
          rect.height > Math.max(window.innerHeight, 640) * 1.25 ||
          element.closest(EXCLUDED) ||
          element.parentElement?.closest('[data-w85-reveal-state="running"]') ||
          element.contains(document.activeElement) ||
          ['fixed', 'sticky'].includes(getComputedStyle(element).position) ||
          typeof element.animate !== 'function') continue;

        const style = getComputedStyle(element);
        const from: Keyframe = { translate: '0 18px' };
        const to: Keyframe = { translate: style.translate === 'none' ? '0 0' : style.translate };
        // Framer owns inline opacity on its panels. Leave that untouched;
        // static cards fade toward their actual opacity (including done states).
        if (!element.style.opacity) {
          const opacity = Number(style.opacity);
          from.opacity = opacity * 0.6;
          to.opacity = opacity;
        }
        const animation = element.animate([from, to], {
          duration: 560,
          delay: Math.min(stagger++, 4) * 45,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        });
        element.dataset.w85RevealState = 'running';
        animations.set(element, animation);
        if (document.hidden) animation.pause();
        animation.finished.then(() => finish(element, animation), () => finish(element, animation));
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    const idleVisibility = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.toggleAttribute('data-w85-in-view', entry.isIntersecting);
      }
    });

    const updateProgress = () => {
      scrollFrame = 0;
      if (!scrollport?.isConnected) {
        progress.style.transform = 'scaleX(0)';
        shell.removeAttribute('data-w85-scrollable');
        return;
      }
      const distance = scrollport.scrollHeight - scrollport.clientHeight;
      const ratio = distance > 1 ? Math.max(0, Math.min(1, scrollport.scrollTop / distance)) : 0;
      progress.style.transform = `scaleX(${ratio})`;
      shell.toggleAttribute('data-w85-scrollable', distance > 1);
    };
    const scheduleProgress = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
    };
    const refreshScrollport = () => {
      main = shell.querySelector('main');
      scrollport = main;
      if (main && main.scrollHeight <= main.clientHeight + 1) {
        // Chat and other workspaces can scroll an inner pane instead of main.
        scrollport = [...main.querySelectorAll<HTMLElement>('[class*="overflow-"]')]
          .filter(el => !el.closest('dialog, nav') && el.clientHeight > 160 &&
            el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY))
          .sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth)[0] ?? main;
      }
      if (main) {
        for (const element of [main, ...main.children]) {
          if (!resizeTargets.has(element)) {
            resizeTargets.add(element);
            resize.observe(element);
          }
        }
      }
      scheduleProgress();
    };
    const resize = new ResizeObserver(refreshScrollport);

    const register = (node: HTMLElement) => {
      const candidates = [node, ...node.querySelectorAll<HTMLElement>(`${REVEAL_SELECTOR},${IDLE_SELECTOR}`)];
      for (const element of candidates) {
        if (element.matches(REVEAL_SELECTOR) && !element.closest(EXCLUDED) && !registered.has(element)) {
          registered.add(element);
          element.dataset.w85RevealState = 'ready';
          reveals.observe(element);
        }
        if (element.matches(IDLE_SELECTOR) && !idle.has(element)) {
          idle.add(element);
          idleVisibility.observe(element);
        }
      }
    };
    const scanAddedContent = () => {
      scanFrame = 0;
      for (const node of pendingNodes) if (node.isConnected) register(node);
      pendingNodes.clear();
      // Release replaced tabs/cards without retaining detached DOM subtrees.
      for (const element of registered) if (!element.isConnected) {
        reveals.unobserve(element);
        animations.get(element)?.cancel();
        animations.delete(element);
        registered.delete(element);
      }
      for (const element of idle) if (!element.isConnected) {
        idleVisibility.unobserve(element);
        idle.delete(element);
      }
      for (const element of resizeTargets) if (!element.isConnected) {
        resize.unobserve(element);
        resizeTargets.delete(element);
      }
      refreshScrollport();
    };
    const mutations = new MutationObserver((records) => {
      let structuralChange = false;
      for (const record of records) {
        for (const node of record.addedNodes) if (node instanceof HTMLElement) {
          pendingNodes.add(node);
          structuralChange = true;
        }
        if ([...record.removedNodes].some(node => node instanceof HTMLElement)) structuralChange = true;
      }
      // Ignore ticking counters, text streaming, and Framer's per-frame styles.
      if (structuralChange && !scanFrame) scanFrame = requestAnimationFrame(scanAddedContent);
    });
    const onScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLElement && main?.contains(target) &&
        main.scrollHeight <= main.clientHeight + 1 && target.clientHeight > 160 &&
        !target.matches('textarea, input') && !target.closest(EXCLUDED)) scrollport = target;
      if (event.target === scrollport) scheduleProgress();
    };
    const onFocus = (event: FocusEvent) => {
      for (const [element, animation] of animations) {
        if (event.target instanceof Node && element.contains(event.target)) animation.cancel();
      }
    };
    const onVisibility = () => {
      shell.toggleAttribute('data-w85-active', !document.hidden);
      for (const animation of animations.values()) {
        if (document.hidden) animation.pause();
        else animation.play();
      }
    };

    register(shell);
    refreshScrollport();
    onVisibility();
    mutations.observe(shell, { childList: true, subtree: true });
    shell.addEventListener('scroll', onScroll, { capture: true, passive: true });
    shell.addEventListener('focusin', onFocus);
    window.addEventListener('resize', refreshScrollport);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      reveals.disconnect();
      idleVisibility.disconnect();
      resize.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(scanFrame);
      shell.removeEventListener('scroll', onScroll, true);
      shell.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', refreshScrollport);
      document.removeEventListener('visibilitychange', onVisibility);
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
      for (const element of registered) delete element.dataset.w85RevealState;
      for (const element of idle) element.removeAttribute('data-w85-in-view');
      shell.removeAttribute('data-w85-active');
      shell.removeAttribute('data-w85-scrollable');
      progress.style.transform = 'scaleX(0)';
    };
  }, [disabled, shellRef, progressRef]);
}
