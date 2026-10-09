'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { describeTab, tabPath } from '@/lib/system/editor-tabs';
import { SPLIT_PATH_MESSAGE } from '@/lib/system/embed';
import { closeSplit, openToSide, setSplitSize, SPLIT_MAX, SPLIT_MIN } from '@/lib/system/workbench';
import Icon from './Icon';
import { useNav } from './hooks';

/* ════════════════════════════════════════════════════════════════════════
   The right-hand editor group (VS Code: Open to the Side).

   It shows a page of this site in a frame. The page inside knows it is
   embedded (lib/system/embed) and reports each route it moves to, so the
   group's title and the saved split follow it without reloading the frame.
   The divider is a keyboard-operable separator; dragging it stops the
   frame from swallowing the pointer.
   ════════════════════════════════════════════════════════════════════════ */

export function SplitDivider({ size, groupsRef }: { size: number; groupsRef: React.RefObject<HTMLDivElement | null> }) {
  const [dragging, setDragging] = useState(false);
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !groupsRef.current) return;
    const rect = groupsRef.current.getBoundingClientRect();
    setSplitSize((event.clientX - rect.left) / rect.width);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.05;
    const next =
      event.key === 'ArrowLeft' ? size - step : event.key === 'ArrowRight' ? size + step : event.key === 'Home' ? SPLIT_MIN : event.key === 'End' ? SPLIT_MAX : null;
    if (next === null) return;
    event.preventDefault();
    setSplitSize(next);
  };
  useEffect(() => {
    groupsRef.current?.toggleAttribute('data-dragging', dragging);
  }, [dragging, groupsRef]);
  return (
    <div
      className="sys-split-sep"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize editor groups"
      aria-valuemin={SPLIT_MIN * 100}
      aria-valuemax={SPLIT_MAX * 100}
      aria-valuenow={Math.round(size * 100)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onDoubleClick={() => setSplitSize(0.5)}
    />
  );
}

export default function SplitEditor({ href }: { href: string }) {
  const router = useRouter();
  const nav = useNav();
  const frameRef = useRef<HTMLIFrameElement>(null);
  // The route the frame last reported: when the saved split equals it, the
  // change came from inside the frame and needs no reload.
  const reported = useRef<string | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || href === reported.current) return;
    reported.current = href;
    frame.src = href;
  }, [href]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: unknown; href?: unknown } | null;
      if (data?.type !== SPLIT_PATH_MESSAGE || typeof data.href !== 'string') return;
      reported.current = data.href;
      openToSide(data.href);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const info = describeTab(tabPath(href), nav);
  return (
    <section className="sys-split-pane" aria-label={`Side editor: ${info.label}`}>
      <div className="sys-split-head">
        <span className="sys-split-title" title={info.detail}>
          <Icon name="split" size={14} /> {info.label}
        </span>
        <button
          type="button"
          className="sys-tab-action"
          aria-label="Open in the main editor"
          title="Open in the main editor"
          onClick={() => {
            router.push(href);
            closeSplit();
          }}
        >
          <Icon name="page" size={14} />
        </button>
        <button type="button" className="sys-tab-action" aria-label="Close the side editor" title="Close the side editor (Ctrl+\)" onClick={closeSplit}>
          <Icon name="close" size={14} />
        </button>
      </div>
      <iframe ref={frameRef} className="sys-split-frame" title={`Side editor: ${info.label}`} />
    </section>
  );
}
