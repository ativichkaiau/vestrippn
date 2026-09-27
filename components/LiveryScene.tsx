'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { LIVERY_CATALOG, type Livery } from '@/lib/liveries';
import { serverThemeSnapshot, subscribeTheme, themeSnapshot } from '@/lib/theme';
import type { LiverySceneTheme, SceneController, SceneView } from '@/lib/three/livery-scene';

const reducedQuery = '(prefers-reduced-motion: reduce)';
const serverReduced = () => true;
const reducedSnapshot = () => window.matchMedia(reducedQuery).matches;
function subscribeReduced(listener: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
function readSceneTheme(): LiverySceneTheme {
  const root = document.documentElement;
  const id = (root.dataset.livery ?? 'normal') as Livery;
  const item = LIVERY_CATALOG[id] ?? LIVERY_CATALOG.normal;
  const styles = getComputedStyle(root);
  return {
    id, colors: id === 'normal' ? [styles.getPropertyValue('--livery-canvas').trim() || item.colors[0], ...item.colors.slice(1)] : item.colors,
    accent: styles.getPropertyValue('--livery-heroAccent').trim() || item.palette.heroAccent,
    isLight: root.dataset.tone === 'light', matte: /matte/i.test(item.finish),
  };
}
const VIEWS: { id: SceneView; label: string }[] = [
  { id: 'three-quarter', label: 'Three-quarter' }, { id: 'side', label: 'Side' }, { id: 'front', label: 'Front' },
];

/** HTML controls and a persistent illustration surround a lazily loaded 3D scene. */
export default function LiveryScene({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const snapshot = useSyncExternalStore(subscribeTheme, themeSnapshot, serverThemeSnapshot);
  const reduceMotion = useSyncExternalStore(subscribeReduced, reducedSnapshot, serverReduced);
  const [livery, , , power] = snapshot.split('|');
  const definition = LIVERY_CATALOG[livery as Livery] ?? LIVERY_CATALOG.normal;
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [view, setView] = useState<SceneView | 'custom'>('three-quarter');
  const [autoTurn, setAutoTurn] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const motionRef = useRef(false);
  const titleId = useId();
  const hintId = useId();
  const motionAllowed = autoTurn && !reduceMotion && power !== '1';

  useEffect(() => {
    motionRef.current = motionAllowed;
    controllerRef.current?.updateTheme(readSceneTheme());
    controllerRef.current?.setMotionAllowed(motionAllowed);
  }, [snapshot, motionAllowed]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      observer?.disconnect();
      // The graphics library stays out of the first-page JavaScript bundle.
      void import('@/lib/three/livery-scene').then(({ createLiveryScene }) => {
        if (cancelled) return;
        controllerRef.current = createLiveryScene(host, {
          theme: readSceneTheme(), motionAllowed: motionRef.current,
          onReady: () => { if (!cancelled) setStatus('ready'); },
          onFallback: () => { if (!cancelled) setStatus('fallback'); },
          onInteraction: () => { if (!cancelled) { setView('custom'); setAutoTurn(false); } },
        });
      }).catch(() => {
        if (!cancelled) { host.replaceChildren(); setStatus('fallback'); }
      });
    };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) start(); }, { rootMargin: '120px' });
      observer.observe(host);
    } else start();
    return () => {
      cancelled = true;
      observer?.disconnect();
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    if (status !== 'fallback') return;
    controllerRef.current?.dispose();
    controllerRef.current = null;
  }, [status]);

  function chooseView(next: SceneView) {
    controllerRef.current?.setView(next);
    setView(next);
    setAutoTurn(false);
  }
  function reset() {
    controllerRef.current?.reset();
    setView('three-quarter');
    setAutoTurn(true);
  }
  const style = {
    '--showroom-accent': definition.palette.heroAccent,
    '--showroom-paint': definition.colors[0],
    '--showroom-stripe': definition.colors[1],
    '--showroom-detail': definition.colors[2] ?? definition.colors[1],
  } as CSSProperties;
  return <section className={`w85-showroom ${compact ? 'w85-showroom-compact' : ''} ${className}`} style={style}
    aria-labelledby={titleId} data-scene-state={status} data-renderer={status === 'ready' ? 'webgl' : 'static'} data-spatial="off">
    <div className="w85-showroom-heading"><div><p>W100 / 3D garage</p><h3 id={titleId}>{definition.name}</h3></div><span>{definition.year}</span></div>
    <div className="w85-showroom-stage">
      <StaticCar />
      <div ref={hostRef} className="w85-showroom-host" aria-describedby={hintId} />
      <span className="w85-showroom-edition" aria-hidden="true">100</span>
    </div>
    <div className="w85-showroom-controls" role="group" aria-label="Car view">
      {VIEWS.map(item => <button key={item.id} type="button" disabled={status !== 'ready'} aria-pressed={view === item.id} onClick={() => chooseView(item.id)}>{item.label}</button>)}
      <button type="button" onClick={reset} disabled={status !== 'ready'} aria-label="Reset car view">↺</button>
      <button type="button" className="w85-showroom-orbit" aria-pressed={motionAllowed} disabled={status !== 'ready' || reduceMotion || power === '1'} onClick={() => { if (autoTurn) setAutoTurn(false); else reset(); }}>{motionAllowed ? 'Pause' : 'Auto turn'}</button>
    </div>
    <div className="w85-showroom-caption"><p id={hintId} role="status">{status === 'loading' ? 'Preparing the showroom…' : status === 'fallback' ? 'Static preview · 3D graphics unavailable' : reduceMotion || power === '1' ? 'Motion paused · view controls available' : 'Drag to turn · arrow keys to explore'}</p>
      {status === 'fallback' && <button type="button" onClick={() => { setStatus('loading'); setView('three-quarter'); setAutoTurn(true); setAttempt(value => value + 1); }}>Retry 3D</button>}
      <span>W100 concept</span>
    </div>
  </section>;
}

function StaticCar() {
  const id = useId();
  return <svg className="w85-showroom-static" viewBox="0 0 600 340" fill="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--showroom-paint)" /><stop offset="1" stopColor="var(--showroom-stripe)" /></linearGradient></defs>
    <ellipse cx="300" cy="262" rx="247" ry="59" fill="#13212c" stroke="#64727e" />
    <ellipse cx="300" cy="254" rx="243" ry="58" fill="#34434e" stroke="var(--showroom-accent)" strokeOpacity=".45" />
    <ellipse cx="295" cy="249" rx="176" ry="29" fill="#000" opacity=".28" />
    <g fill="#14191e" stroke="#66727b" strokeWidth="3"><ellipse cx="375" cy="155" rx="28" ry="39" transform="rotate(-16 375 155)" /><ellipse cx="445" cy="217" rx="29" ry="39" transform="rotate(-16 445 217)" /><ellipse cx="184" cy="222" rx="30" ry="39" transform="rotate(-16 184 222)" /><ellipse cx="256" cy="269" rx="29" ry="38" transform="rotate(-16 256 269)" /></g>
    <path d="m148 258 109 24 174-75-34-28-184 57Z" fill="#0d171e" />
    <path d="m137 254 64 12 205-78-33-30-104 23-54 35Z" fill={`url(#${id})`} stroke="#dae7f0" strokeOpacity=".35" />
    <path d="m224 236 75-51 33-1 78 24-49 28-68 8Z" fill="var(--showroom-paint)" />
    <path d="m169 252 56-28 34-1 111-42" stroke="var(--showroom-detail)" strokeWidth="7" />
    <path d="m272 189 60-51 37 19-5 29-52 17Z" fill="var(--showroom-stripe)" />
    <ellipse cx="280" cy="200" rx="29" ry="13" transform="rotate(-22 280 200)" fill="#101922" stroke="#8998a4" strokeWidth="3" />
    <path d="m349 162 3-34 99 31 1 33Z" fill="var(--showroom-paint)" stroke="#81949f" />
    <path d="m350 129 88-26 57 22-44 36Z" fill="var(--showroom-stripe)" stroke="#c5d1d8" strokeOpacity=".3" />
    <path d="m101 262 60-23 97 29-51 27Z" fill="var(--showroom-paint)" stroke="#8998a4" />
    <path d="m106 266 97 26 49-21" stroke="var(--showroom-detail)" strokeWidth="5" />
    <g fill="#536473" stroke="#a1aab0" strokeWidth="2"><ellipse cx="450" cy="219" rx="16" ry="27" transform="rotate(-16 450 219)" /><ellipse cx="260" cy="271" rx="16" ry="26" transform="rotate(-16 260 271)" /></g>
  </svg>;
}
