'use client';

import { useEffect } from 'react';
import { useLowPower } from './useLowPower';

const BLOCK_MIN_HEIGHT = 72;
const BLOCK_MIN_WIDTH = 140;
const TYPEABLE_SELECTOR = 'h1,h2,h3,h4,p,li,dd,dt,span,div';
const CONTROL_SELECTOR = 'button,input,textarea,select,option,[contenteditable="true"],[data-no-typewriter]';
const CHROME_SELECTOR = 'header,aside,nav,footer,form,[data-no-typewriter]';

declare global {
  interface Window {
    __vestrippnTypedBlocks?: Set<string>;
  }
}

type TypeItem = {
  host: HTMLElement;
  node: Text;
  text: string;
  previousMinHeight: string;
};

type PreparedBlock = {
  block: HTMLElement;
  items: TypeItem[];
  key: string;
};

function getTypedBlocks() {
  if (!window.__vestrippnTypedBlocks) {
    window.__vestrippnTypedBlocks = new Set<string>();
  }

  return window.__vestrippnTypedBlocks;
}

// Module-scoped registries so prepared blocks survive across effect re-runs
// (needed to restore text the typewriter hid when low-power is toggled on).
const preparedBlocks = new WeakMap<HTMLElement, PreparedBlock>();
const preparedBlockList = new Set<PreparedBlock>();

// Reveal any text the typewriter has hidden and stop tracking it.
function revealAllTypewriterText() {
  for (const prepared of preparedBlockList) {
    if (!prepared.block.isConnected) {
      preparedBlockList.delete(prepared);
      continue;
    }
    for (const item of prepared.items) {
      if (item.node.isConnected) {
        item.node.data = item.text;
        item.host.style.minHeight = item.previousMinHeight;
        item.host.classList.remove('typewriter-text-active');
      }
    }
    prepared.block.dataset.typewriterState = 'typed';
  }
}

function classText(element: HTMLElement) {
  return typeof element.className === 'string' ? element.className : '';
}

function hasReadableText(element: HTMLElement) {
  const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  return text.length >= 8 && /[A-Za-z0-9]/.test(text);
}

function hasBlockSize(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.width >= BLOCK_MIN_WIDTH && rect.height >= BLOCK_MIN_HEIGHT;
}

// Opt-IN: a block participates only if it is (or is inside) an explicitly
// marked typewriter target. This replaces the old auto-detect heuristic that
// emptied text in *any* rounded/bordered block — a recurring footgun that
// silently blanked heroes and cards. Mark a single block with `data-typewriter`,
// or a wrapper with `data-typewriter-scope` to cover its rounded info-blocks.
function isOptedIn(element: HTMLElement) {
  return element.matches('[data-typewriter]') || Boolean(element.closest('[data-typewriter-scope]'));
}

function looksLikeInformationBlock(element: HTMLElement) {
  if (element.closest(CHROME_SELECTOR)) return false;
  if (element.matches(CONTROL_SELECTOR)) return false;
  if (!isOptedIn(element)) return false;
  if (element.dataset.typewriterState) return hasBlockSize(element);

  const classes = classText(element);
  if (classes.includes('pointer-events-none') || classes.includes('blur-')) return false;
  // Direct `data-typewriter` targets need no class signature; scoped blocks
  // still look like rounded info cards.
  if (!element.matches('[data-typewriter]') && !classes.includes('rounded-')) return false;
  if (!hasReadableText(element)) return false;

  return hasBlockSize(element);
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

function blockKey(block: HTMLElement, items: TypeItem[]) {
  const text = items.map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim().slice(0, 220);
  const blockCandidates = Array.from(document.querySelectorAll<HTMLElement>('.motion-route-shell [class*="rounded-"]'));
  const index = blockCandidates.indexOf(block);

  return `${window.location.pathname}:${index}:${text}`;
}

function elementDepth(element: HTMLElement) {
  let depth = 0;
  let node: HTMLElement | null = element;

  while (node) {
    depth += 1;
    node = node.parentElement;
  }

  return depth;
}

function textHost(node: Text) {
  const parent = node.parentElement;
  if (!parent) return null;
  if (parent.matches(TYPEABLE_SELECTOR)) return parent;

  return parent.closest<HTMLElement>(TYPEABLE_SELECTOR);
}

function collectTypeItems(block: HTMLElement, claimedNodes?: WeakSet<Text>): TypeItem[] {
  const items: TypeItem[] = [];
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!(node instanceof Text)) continue;
    if (claimedNodes?.has(node)) continue;

    const host = textHost(node);
    if (!host) continue;
    if (host.closest(CONTROL_SELECTOR)) continue;
    if (host.closest(CHROME_SELECTOR)) continue;
    if (host.closest('[aria-hidden="true"]')) continue;

    const text = node.data;
    const readableText = text.replace(/\s+/g, ' ').trim();
    if (readableText.length === 0) continue;

    items.push({
      host,
      node,
      text,
      previousMinHeight: host.style.minHeight,
    });
  }

  return items;
}

function delayForCharacter(character: string) {
  if (/[.!?]/.test(character)) return 58;
  if (/[,;:]/.test(character)) return 38;
  if (/\s/.test(character)) return 8;
  return 13;
}

export default function HoverTypewriter() {
  const lowPower = useLowPower();

  useEffect(() => {
    // Low-power: never hide/type text. Reveal anything already hidden and bail.
    if (lowPower) {
      revealAllTypewriterText();
      return;
    }

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

    const applyEmptyState = (prepared: PreparedBlock) => {
      for (const item of prepared.items) {
        const rect = item.host.getBoundingClientRect();
        if (rect.height > 0) {
          item.host.style.minHeight = `${rect.height}px`;
        }

        item.node.data = '';
      }

      prepared.block.dataset.typewriterState = 'empty';
    };

    const finish = (block: HTMLElement, items: TypeItem[]) => {
      for (const item of items) {
        item.node.data = item.text;
        item.host.style.minHeight = item.previousMinHeight;
        item.host.classList.remove('typewriter-text-active');
      }

      block.dataset.typewriterState = 'typed';
    };

    const prepareBlock = (block: HTMLElement, claimedNodes?: WeakSet<Text>) => {
      const existing = preparedBlocks.get(block);
      if (existing) {
        for (const item of existing.items) {
          claimedNodes?.add(item.node);
        }

        if (existing.block.dataset.typewriterState === 'empty') {
          applyEmptyState(existing);
        }

        return existing;
      }

      const items = collectTypeItems(block, claimedNodes);
      if (items.length === 0) return null;

      for (const item of items) {
        claimedNodes?.add(item.node);
      }

      const key = blockKey(block, items);
      const prepared = { block, items, key };
      preparedBlocks.set(block, prepared);
      preparedBlockList.add(prepared);
      block.dataset.typewriterKey = key;

      if (typedBlocks.has(key)) {
        block.dataset.typewriterState = 'typed';
        return prepared;
      }

      applyEmptyState(prepared);
      return prepared;
    };

    const preparePendingBlocks = (root: ParentNode = document) => {
      const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(
          '.motion-route-shell [data-typewriter], .motion-route-shell [data-typewriter-scope] [class*="rounded-"]',
        ),
      )
        .filter(looksLikeInformationBlock)
        .sort((a, b) => elementDepth(b) - elementDepth(a));
      const claimedNodes = new WeakSet<Text>();

      for (const prepared of preparedBlockList) {
        if (!prepared.block.isConnected) {
          preparedBlockList.delete(prepared);
          continue;
        }

        for (const item of prepared.items) {
          if (item.node.isConnected) {
            claimedNodes.add(item.node);
          }
        }
      }

      for (const block of candidates) {
        prepareBlock(block, claimedNodes);
      }
    };

    const startTyping = (block: HTMLElement) => {
      if (block.dataset.typewriterState === 'typing' || block.dataset.typewriterState === 'typed') return;

      const prepared = prepareBlock(block);
      if (!prepared) return;

      if (typedBlocks.has(prepared.key)) {
        block.dataset.typewriterState = 'typed';
        finish(block, prepared.items);
        return;
      }

      typedBlocks.add(prepared.key);
      block.dataset.typewriterState = 'typing';

      if (reduceMotion) {
        finish(block, prepared.items);
        return;
      }

      let itemIndex = 0;
      let charIndex = 0;

      const step = () => {
        if (!block.isConnected) return;

        const item = prepared.items[itemIndex];
        if (!item) {
          finish(block, prepared.items);
          return;
        }

        item.host.classList.add('typewriter-text-active');

        const nextIndex = Math.min(item.text.length, charIndex + Math.max(1, Math.ceil(item.text.length / 140)));
        item.node.data = item.text.slice(0, nextIndex);
        const nextDelay = delayForCharacter(item.text.charAt(nextIndex - 1));
        charIndex = nextIndex;

        if (charIndex >= item.text.length) {
          item.host.classList.remove('typewriter-text-active');
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

    preparePendingBlocks();

    let scanTimer: number | null = null;
    const observer = new MutationObserver(() => {
      if (scanTimer !== null) {
        window.clearTimeout(scanTimer);
      }

      scanTimer = window.setTimeout(() => {
        scanTimer = null;
        preparePendingBlocks();
      }, 80);
    });

    const routeShell = document.querySelector('.motion-route-shell');
    observer.observe(routeShell ?? document.body, { childList: true, subtree: true });

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
      observer.disconnect();
      if (scanTimer !== null) {
        window.clearTimeout(scanTimer);
      }
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, [lowPower]);

  return null;
}
