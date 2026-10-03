'use client';

import { useEffect, useRef, useState } from 'react';
import { LIVERY_CATALOG, type Livery } from '@/lib/liveries';
import { carbonPaint, liveryPaint } from '@/lib/w100/livery-paint';
import { MarkRenderer } from '@/lib/w100/mark-renderer';
import { motionAllowed } from '@/lib/motion';

/**
 * The W100 mark: the VESTRIPPN "3" in real 3D, painted in a livery.
 *
 * - `livery` previews a specific livery (the garage); omit it to follow the
 *   site's active livery live, repainting with a wet-paint sweep on change.
 * - `mode`: `idle` drifts on a slow turntable, `spin` rotates continuously
 *   (loaders), `intro` flies in unpainted and has its livery sprayed on.
 * - Drag to rotate, with inertia, when `interactive`.
 * - `follow` turns the idle mark to face a nearby mouse pointer (hero marks).
 *
 * Pass `label=""` when the mark is decorative next to a visible name.
 *
 * Reduced motion and low power render still frames on demand — the mark stays
 * 3D and draggable, it just never animates on its own. Without WebGL it falls
 * back to the flat logo.
 */
type Mode = 'idle' | 'spin' | 'intro';

const SWEEP_MS = 760;
// Idle drift and pointer-follow are slow: 30fps is indistinguishable and
// halves the GPU work. Flying in, painting and dragging run at full rate.
const IDLE_FRAME_MS = 1000 / 30;
const INTRO_FLY_S = 1.5;
const INTRO_PAINT_AT_S = 0.55;
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function activeLivery(): Livery {
  const value = document.documentElement.dataset.livery;
  return value && Object.prototype.hasOwnProperty.call(LIVERY_CATALOG, value) ? (value as Livery) : 'system';
}

export default function Mark3D({
  livery,
  mode = 'idle',
  interactive = true,
  follow = false,
  className = '',
  label = 'VESTRIPPN mark',
}: {
  livery?: Livery;
  mode?: Mode;
  interactive?: boolean;
  follow?: boolean;
  className?: string;
  label?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveryRef = useRef(livery);
  const repaintRef = useRef<(target: Livery) => void>(() => {});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const target = () => liveryRef.current ?? activeLivery();
    const renderer = MarkRenderer.create(canvas, mode === 'intro' ? carbonPaint() : liveryPaint(target()));
    if (!renderer) {
      // WebGL is missing or blocked: show the flat logo instead of an empty box.
      queueMicrotask(() => setFailed(true));
      return;
    }

    let still = !motionAllowed();
    let visible = true;
    let frame = 0;
    let idleTimer = 0;
    const started = performance.now();
    let last = started;
    let sweepStart = -1;
    let painted = mode !== 'intro';
    const drag = { active: false, x: 0, y: 0, vx: 0, lastMove: -Infinity, pointer: -1 };
    const look = { yaw: 0, pitch: 0, at: -Infinity };
    const pose = renderer.pose;
    pose.yaw = mode === 'intro' ? -2.4 : 0.42;
    pose.pitch = -0.12;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      renderer.resize(Math.max(1, Math.round(rect.width * dpr)), Math.max(1, Math.round(rect.height * dpr)));
    };

    const repaint = (next: Livery) => {
      painted = true;
      // ThemeController re-announces the same livery every 30s in Auto mode.
      if (!renderer.setPaint(liveryPaint(next), !still)) return;
      sweepStart = still ? -1 : performance.now();
      requestFrame();
    };
    repaintRef.current = repaint;

    const tick = (now: number) => {
      frame = 0;
      const t = (now - started) / 1000;
      const brisk = drag.active || Math.abs(drag.vx) > 0.02 || sweepStart >= 0 || (mode === 'intro' && t < INTRO_FLY_S + 0.2);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (still) {
        // Static but faithful: intro lands painted, sweeps apply instantly.
        pose.scale = 1; pose.z = 0;
        if (mode === 'intro' && !painted) { renderer.setPaint(liveryPaint(target()), false); painted = true; }
        if (!drag.active && drag.lastMove < 0) { pose.yaw = 0.42; pose.pitch = -0.12; }
        renderer.swap = 1;
        renderer.render();
        return;
      }

      if (mode === 'intro') {
        const k = easeOut(clamp(t / INTRO_FLY_S));
        pose.scale = 0.5 + 0.5 * k;
        pose.z = -2.6 * (1 - k);
        pose.roll = -0.35 * (1 - k);
        if (!painted && t >= INTRO_PAINT_AT_S) repaint(target());
      }

      const since = (now - drag.lastMove) / 1000;
      if (drag.active) {
        // Pose follows the pointer directly (pointermove updates it).
      } else if (Math.abs(drag.vx) > 0.02) {
        pose.yaw += drag.vx * dt;
        drag.vx *= Math.pow(0.05, dt);
      } else if (mode === 'spin') {
        pose.yaw += dt * 1.2;
        pose.pitch += (-0.16 - pose.pitch) * (1 - Math.pow(0.1, dt));
      } else if (since > 1.1) {
        // Ease back onto the turntable once the user lets go — or, while a
        // mouse is moving nearby, turn to face it.
        const looking = now - look.at < 2400;
        const idleYaw = looking ? look.yaw : 0.34 + Math.sin(t * 0.36) * 0.36;
        const idlePitch = looking ? look.pitch : -0.12 + Math.sin(t * 0.27) * 0.05;
        const pull = 1 - Math.pow(mode === 'intro' && t < INTRO_FLY_S ? 0.02 : looking ? 0.08 : 0.25, dt);
        pose.yaw += (idleYaw - pose.yaw) * pull;
        pose.pitch += (idlePitch - pose.pitch) * pull;
      }

      if (sweepStart >= 0) {
        const k = clamp((now - sweepStart) / SWEEP_MS);
        renderer.swap = easeInOut(k);
        if (k >= 1) sweepStart = -1;
      }
      renderer.render();
      if (!visible || document.hidden) return;
      // Between idle frames the page sleeps: a timer, not a rAF that wakes
      // the browser every vsync only to skip the draw.
      if (brisk) frame = requestAnimationFrame(tick);
      else idleTimer = window.setTimeout(() => { idleTimer = 0; requestFrame(); }, IDLE_FRAME_MS);
    };

    function requestFrame() {
      if (idleTimer) { window.clearTimeout(idleTimer); idleTimer = 0; }
      if (!frame) frame = requestAnimationFrame(tick);
    }

    const onThemeChange = () => {
      if (liveryRef.current === undefined && painted) repaint(activeLivery());
    };
    const onPower = () => {
      still = !motionAllowed();
      requestFrame();
    };
    const onVisibility = () => { if (!document.hidden) requestFrame(); };

    const onPointerDown = (event: PointerEvent) => {
      if (!interactive || drag.pointer !== -1) return;
      drag.active = true;
      drag.pointer = event.pointerId;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.vx = 0;
      drag.lastMove = performance.now();
      wrap.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active || event.pointerId !== drag.pointer) return;
      const now = performance.now();
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      const dYaw = dx * 0.012;
      pose.yaw += dYaw;
      pose.pitch = clamp(pose.pitch + dy * 0.008, -0.75, 0.55);
      drag.vx = dYaw / Math.max(0.008, (now - drag.lastMove) / 1000);
      drag.lastMove = now;
      requestFrame();
    };
    const onLook = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || still || !visible) return;
      const rect = wrap.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth * 0.5);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight * 0.5);
      // Bias toward the three-quarter view so the livery face stays readable.
      look.yaw = 0.3 + clamp(dx, -1, 1) * 0.6;
      look.pitch = -0.1 + clamp(dy, -1, 1) * 0.3;
      look.at = performance.now();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointer) return;
      drag.active = false;
      drag.pointer = -1;
      if (still) drag.vx = 0;
      requestFrame();
    };

    const resizeObserver = new ResizeObserver(() => { resize(); requestFrame(); });
    resizeObserver.observe(wrap);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestFrame();
    });
    intersection.observe(wrap);
    const onLost = (event: Event) => {
      event.preventDefault();
      // Stop drawing into a dead context; the flat logo takes over.
      visible = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      frame = 0;
      setFailed(true);
    };

    resize();
    requestFrame();
    window.addEventListener('vest:theme-change', onThemeChange);
    window.addEventListener('vest-lowpower', onPower);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);
    wrap.addEventListener('pointerdown', onPointerDown);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerup', onPointerUp);
    wrap.addEventListener('pointercancel', onPointerUp);
    if (follow) window.addEventListener('pointermove', onLook, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('vest:theme-change', onThemeChange);
      window.removeEventListener('vest-lowpower', onPower);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      wrap.removeEventListener('pointerdown', onPointerDown);
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerup', onPointerUp);
      wrap.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('pointermove', onLook);
      repaintRef.current = () => {};
      renderer.dispose();
    };
  }, [mode, interactive, follow]);

  // A preview livery (the garage) repaints without rebuilding the renderer.
  useEffect(() => {
    const previous = liveryRef.current;
    liveryRef.current = livery;
    if (livery !== previous) repaintRef.current(livery ?? activeLivery());
  }, [livery]);

  return (
    <div
      ref={wrapRef}
      className={`w100-mark ${interactive ? 'w100-mark-interactive' : ''} ${className}`}
      // An empty label means decorative (a heading beside it already names it).
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-mode={mode}
    >
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- static fallback art, no layout shift concerns
        <img src="/vestrippn-logo.png" alt="" className="w100-mark-fallback" />
      ) : (
        <canvas ref={canvasRef} className="w100-mark-canvas" />
      )}
    </div>
  );
}
