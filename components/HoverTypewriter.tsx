'use client';

import { useEffect } from 'react';

const BLOCK_MIN_HEIGHT = 72;
const BLOCK_MIN_WIDTH = 140;
const TYPEABLE_SELECTOR = 'h1,h2,h3,h4,p,li,dd,dt';
const CONTROL_SELECTOR = 'button,input,textarea,select,option,[contenteditable="true"],[data-no-typewriter]';
const CHROME_SELECTOR = 'header,aside,nav,footer,form,[data-no-typewriter]';

declare global {
  interface Window {
    __vestrippnTypedBlocks?: Set<string>;
  }
}

type TypeItem = {
  element: HTMLElement;
  text: string;
  previousMinHeight: string;
};

function getTypedBlocks() {
  if (!window.__vestrippnTypedBlocks) {
    window.__vestrippnTypedBlocks = new Set<string>();
  }

  return window.__vestrippnTypedBlocks;
}

function classText(element: HTMLElement) {
  return typeof element.className === 'string' ? element.className : '';
}

function hasReadableText(element: HTMLElement) {
  const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return text.length >= 8 && /[A-Za-z0-9]/.test(text);
}

function looksLikeInformationBlock(element: HTMLElement) {
  if (element.closest(CHROME_SELECTOR)) return false;
  if (element.matches(CONTROL_SELECTOR)) return false;

  const classes = classText(element);
  if (!classes.includes('rounded-')) return false;
  if (classes.includes('pointer-events-none') || classes.includes('blur-')) return false;
  if (!/(^|\s)(bg-|dark:bg-|border|shadow-|backdrop-blur|ring-)/.test(classes)) return false;
  if (!hasReadableText(element)) return false;

  const rect = element.getBoundingClientRect();
  return rect.width >= BLOCK_MIN_WIDTH && rect.height >= BLOCK_MIN_HEIGHT;
}

function findInformationBlock(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  let node: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;

  while (node && !node.classList.contains('motion-route-shell')) {
    if (node.matches(CONTROL_SELECTOR)) return null;
    if (looksLikeInformationBlock(node)) return node;
    node = node.parentElement;
  }

  return null;
}

function blockKey(block: HTMLElement) {
  const text = block.textContent?.replace(/\s+/g, ' ').trim().slice(0, 220) ?? '';
  const blockCandidates = Array.from(document.querySelectorAll<HTMLElement>('.motion-route-shell [class*="rounded-"]'));
  const index = blockCandidates.indexOf(block);

  return `${window.location.pathname}:${index}:${text}`;
}

function collectTypeItems(block: HTMLElement): TypeItem[] {
  const textElements = [
    ...(block.matches(TYPEABLE_SELECTOR) ? [block] : []),
    ...Array.from(block.querySelectorAll<HTMLElement>(TYPEABLE_SELECTOR)),
  ];

  return textElements
    .filter((element) => {
      if (element.closest(CONTROL_SELECTOR)) return false;
      if (element.closest(CHROME_SELECTOR)) return false;
      if (element.children.length > 0) return false;

      const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      return text.length >= 3 && /[A-Za-z0-9]/.test(text);
    })
    .slice(0, 8)
    .map((element) => ({
      element,
      text: element.textContent ?? '',
      previousMinHeight: element.style.minHeight,
    }));
}

function delayForCharacter(character: string) {
  if (/[.!?]/.test(character)) return 58;
  if (/[,;:]/.test(character)) return 38;
  if (/\s/.test(character)) return 8;
  return 13;
}

export default function HoverTypewriter() {
  useEffect(() => {
    const typedBlocks = getTypedBlocks();
    const activeTimers = new Set<number>();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        activeTimers.delete(timer);
        callback();
      }, delay);

      activeTimers.add(timer);
    };

    const finish = (block: HTMLElement, items: TypeItem[]) => {
      for (const item of items) {
        item.element.textContent = item.text;
        item.element.style.minHeight = item.previousMinHeight;
        item.element.classList.remove('typewriter-text-active');
      }

      block.dataset.typewriterState = 'typed';
    };

    const startTyping = (block: HTMLElement) => {
      if (block.dataset.typewriterState === 'typing' || block.dataset.typewriterState === 'typed') return;

      const key = blockKey(block);
      if (typedBlocks.has(key)) {
        block.dataset.typewriterState = 'typed';
        return;
      }

      const items = collectTypeItems(block);
      if (items.length === 0) return;

      typedBlocks.add(key);
      block.dataset.typewriterState = 'typing';

      if (reduceMotion) {
        finish(block, items);
        return;
      }

      for (const item of items) {
        const rect = item.element.getBoundingClientRect();
        if (rect.height > 0) {
          item.element.style.minHeight = `${rect.height}px`;
        }
        item.element.textContent = '';
      }

      let itemIndex = 0;
      let charIndex = 0;

      const step = () => {
        if (!block.isConnected) return;

        const item = items[itemIndex];
        if (!item) {
          finish(block, items);
          return;
        }

        item.element.classList.add('typewriter-text-active');

        const nextIndex = Math.min(item.text.length, charIndex + Math.max(1, Math.ceil(item.text.length / 140)));
        item.element.textContent = item.text.slice(0, nextIndex);
        const nextDelay = delayForCharacter(item.text.charAt(nextIndex - 1));
        charIndex = nextIndex;

        if (charIndex >= item.text.length) {
          item.element.classList.remove('typewriter-text-active');
          itemIndex += 1;
          charIndex = 0;
          schedule(step, 70);
          return;
        }

        schedule(step, nextDelay);
      };

      schedule(step, 45);
    };

    const handleInteraction = (event: Event) => {
      const block = findInformationBlock(event.target);
      if (!block) return;
      startTyping(block);
    };

    document.addEventListener('pointerover', handleInteraction, { passive: true });
    document.addEventListener('pointermove', handleInteraction, { passive: true });
    document.addEventListener('mouseover', handleInteraction, { passive: true });
    document.addEventListener('mousemove', handleInteraction, { passive: true });
    document.addEventListener('focusin', handleInteraction);

    return () => {
      document.removeEventListener('pointerover', handleInteraction);
      document.removeEventListener('pointermove', handleInteraction);
      document.removeEventListener('mouseover', handleInteraction);
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('focusin', handleInteraction);
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return null;
}
