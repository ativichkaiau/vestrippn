'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { LIVERY_CATALOG, type Livery } from '@/lib/liveries';
import { serverThemeSnapshot, subscribeTheme, themeSnapshot } from '@/lib/theme';
import type { LiverySceneTheme, SceneController, SceneStats, SceneView } from '@/lib/three/livery-scene';
import StaticCar from './StaticCar';

/* ════════════════════════════════════════════════════════════════════════
   Engineering object viewer for OBJECT_001.

   A lazily loaded three.js scene inside a plain HTML frame: view presets,
   turntable rotation, keyboard control, a live camera readout, and a static
   drawing whenever WebGL is unavailable. Paint follows the selected livery;
   the frame follows the environment.
   ════════════════════════════════════════════════════════════════════════ */

const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReduced(listener: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

function readSceneTheme(): LiverySceneTheme {
  const root = document.documentElement;
  const id = (root.dataset.livery ?? 'system') as Livery;
  const item = LIVERY_CATALOG[id] ?? LIVERY_CATALOG.system;
  return {
    id,
    colors: item.colors,
    accent: item.palette.heroAccent,
    isLight: !root.classList.contains('dark'),
    matte: /matte/i.test(item.finish),
  };
}

const VIEWS: { id: SceneView; label: string; title: string }[] = [
  { id: 'three-quarter', label: '¾', title: 'Three-quarter view' },
  { id: 'side', label: 'side', title: 'Side view' },
  { id: 'front', label: 'front', title: 'Front view' },
];

export default function VehicleViewer({ onStats }: { onStats?: (stats: SceneStats) => void }) {
  const snapshot = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot);
  const reduceMotion = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => true);
  const [livery, , , power] = snapshot.split('|');
  const definition = LIVERY_CATALOG[livery as Livery] ?? LIVERY_CATALOG.system;
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [view, setView] = useState<SceneView | 'free'>('three-quarter');
  const [rotate, setRotate] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const motionRef = useRef(false);
  const statsRef = useRef(onStats);
  const hintId = useId();
  const motionAllowed = !reduceMotion && power !== '1';
  const spinning = rotate && motionAllowed;

  useEffect(() => {
    statsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    motionRef.current = motionAllowed;
    controllerRef.current?.updateTheme(readSceneTheme());
    controllerRef.current?.setMotionAllowed(motionAllowed);
  }, [snapshot, motionAllowed]);

  useEffect(() => {
    controllerRef.current?.setRotating(rotate);
  }, [rotate, status]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    // The graphics library stays out of the first-page JavaScript bundle.
    void import('@/lib/three/livery-scene')
      .then(({ createLiveryScene }) => {
        if (cancelled) return;
        const controller = createLiveryScene(host, {
          theme: readSceneTheme(),
          motionAllowed: motionRef.current,
          onReady: () => {
            if (cancelled) return;
            setStatus('ready');
            statsRef.current?.(controller.stats());
          },
          onFallback: () => {
            if (!cancelled) setStatus('fallback');
          },
          onInteraction: () => {
            if (cancelled) return;
            setView('free');
            setRotate(false);
          },
          onCamera: (yaw, pitch) => {
            const node = readoutRef.current;
            if (node) node.textContent = `yaw ${String(Math.round(yaw)).padStart(3, '0')}° · pitch ${String(Math.round(pitch)).padStart(2, '0')}°`;
          },
        });
        controllerRef.current = controller;
      })
      .catch(() => {
        if (!cancelled) {
          host.replaceChildren();
          setStatus('fallback');
        }
      });
    return () => {
      cancelled = true;
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    if (status !== 'fallback') return;
    controllerRef.current?.dispose();
    controllerRef.current = null;
  }, [status]);

  function choose(next: SceneView) {
    controllerRef.current?.setView(next);
    setView(next);
    setRotate(false);
  }
  function reset() {
    controllerRef.current?.reset();
    setView('three-quarter');
  }

  const paint = {
    '--viewer-paint': definition.colors[0],
    '--viewer-stripe': definition.colors[1],
    '--viewer-detail': definition.colors[2] ?? definition.colors[1],
  } as CSSProperties;

  const ready = status === 'ready';
  const caption =
    status === 'loading'
      ? 'loading geometry…'
      : status === 'fallback'
        ? 'static drawing · WebGL unavailable'
        : !motionAllowed
          ? 'motion paused · views available'
          : 'drag to turn · ← → ↑ ↓ rotate · home resets';

  return (
    <section className="sys-viewer" style={paint} data-scene-state={status} aria-label="Silver Arrow viewer">
      <div className="sys-viewer-bar">
        <div className="sys-viewer-views" role="group" aria-label="View">
          <span className="sys-label">view</span>
          {VIEWS.map((item) => (
            <button key={item.id} type="button" title={item.title} aria-label={item.title} disabled={!ready} aria-pressed={view === item.id} onClick={() => choose(item.id)}>
              {item.label}
            </button>
          ))}
          <button
            type="button"
            disabled={!ready || !motionAllowed}
            aria-pressed={spinning}
            onClick={() => setRotate((value) => !value)}
            title={motionAllowed ? 'Turntable rotation' : 'Rotation is off while reduced motion or low power is on'}
          >
            rotate
          </button>
          <button type="button" disabled={!ready} onClick={reset} aria-label="Reset view">
            reset
          </button>
        </div>
        <span className="sys-status" data-state={ready ? 'active' : status === 'fallback' ? 'idle' : 'available'}>
          {ready ? 'webgl' : status === 'fallback' ? 'static' : 'loading'}
        </span>
      </div>

      <div className="sys-viewer-stage">
        <span className="sys-viewer-corner" data-corner="tl" aria-hidden="true" />
        <span className="sys-viewer-corner" data-corner="tr" aria-hidden="true" />
        <span className="sys-viewer-corner" data-corner="bl" aria-hidden="true" />
        <span className="sys-viewer-corner" data-corner="br" aria-hidden="true" />
        <StaticCar />
        <div ref={hostRef} className="sys-viewer-host" aria-describedby={hintId} />
      </div>

      <div className="sys-viewer-foot">
        <p id={hintId} role="status">
          {caption}
        </p>
        <span className="sys-viewer-readout" aria-hidden="true">
          <span>{definition.name.toLowerCase()} · {definition.year}</span>
          <span ref={readoutRef}>yaw 047° · pitch 25°</span>
        </span>
        {status === 'fallback' && (
          <button
            type="button"
            className="sys-command"
            onClick={() => {
              setStatus('loading');
              setView('three-quarter');
              setAttempt((value) => value + 1);
            }}
          >
            retry 3D
          </button>
        )}
      </div>
    </section>
  );
}
