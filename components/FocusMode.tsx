'use client';

/* ════════════════════════════════════════════════════════════════════════
   FOCUS MODE — "Qualifying Lap" study lock for the Academics Hub.
   Locks the whole page, you pick one of 15 iconic circuits, and an original
   animated onboard (track map + live telemetry HUD) runs continuous laps at
   the real 2017 pole-lap time. A lap counter + total focus time accumulate
   until you hit your target or hold-to-end.

   NOTE: This uses an original vector visualisation. It deliberately does NOT
   embed real F1 onboard footage — that material is copyrighted by F1/FOM.
   Lap times / lap counts are the 2017 qualifying-pole reference values.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Track = {
  id: string;
  name: string;
  country: string;
  flag: string;
  pole: number; // seconds (2017 qualifying pole)
  poleSitter: string;
  laps: number; // 2017 race lap count
  length: number; // km
  path: string; // stylised circuit silhouette
};

// viewBox for every silhouette: 0 0 220 140
const TRACKS: Track[] = [
  { id: 'aus', name: 'Albert Park', country: 'Australia', flag: '🇦🇺', pole: 82.188, poleSitter: 'Hamilton', laps: 58, length: 5.303,
    path: 'M40,95 C30,80 34,62 52,56 C70,50 84,58 100,52 C120,45 130,30 150,34 C172,38 190,46 186,66 C183,82 168,86 150,90 C128,95 118,108 96,106 C74,104 52,110 40,95 Z' },
  { id: 'bhr', name: 'Sakhir', country: 'Bahrain', flag: '🇧🇭', pole: 88.769, poleSitter: 'Bottas', laps: 57, length: 5.412,
    path: 'M42,100 C34,84 42,72 60,72 C76,72 82,60 78,48 C74,36 86,30 100,36 C112,41 112,56 128,58 C150,61 178,50 188,66 C196,79 182,90 162,88 C146,86 140,98 120,100 C96,103 56,112 42,100 Z' },
  { id: 'chn', name: 'Shanghai', country: 'China', flag: '🇨🇳', pole: 91.678, poleSitter: 'Hamilton', laps: 56, length: 5.451,
    path: 'M34,70 C30,52 46,44 64,48 C80,52 88,44 104,44 L168,44 C186,44 192,58 180,68 C170,76 152,72 146,84 C139,98 142,104 124,104 C108,104 102,92 88,94 C72,96 66,104 52,98 C40,93 36,84 34,70 Z' },
  { id: 'esp', name: 'Barcelona-Catalunya', country: 'Spain', flag: '🇪🇸', pole: 79.149, poleSitter: 'Hamilton', laps: 66, length: 4.655,
    path: 'M40,92 C32,76 38,60 56,56 C74,52 86,60 104,54 C124,47 132,34 154,38 C176,42 190,52 184,72 C179,88 160,90 140,90 C120,90 116,100 98,100 C76,100 50,106 40,92 Z' },
  { id: 'mon', name: 'Monte Carlo', country: 'Monaco', flag: '🇲🇨', pole: 72.178, poleSitter: 'Räikkönen', laps: 78, length: 3.337,
    path: 'M36,98 C34,78 44,70 58,70 C70,70 72,58 70,48 C68,36 78,30 90,34 C100,37 102,48 114,50 C130,52 150,44 166,50 C182,56 188,70 176,80 C164,89 146,84 130,88 C112,92 108,102 90,102 C68,102 44,110 36,98 Z' },
  { id: 'can', name: 'Gilles Villeneuve', country: 'Canada', flag: '🇨🇦', pole: 71.459, poleSitter: 'Hamilton', laps: 70, length: 4.361,
    path: 'M38,88 C30,72 40,60 58,60 L150,60 C172,60 190,66 186,80 C182,92 166,94 148,92 C130,90 124,98 108,98 L70,98 C52,98 44,98 38,88 Z' },
  { id: 'aut', name: 'Red Bull Ring', country: 'Austria', flag: '🇦🇹', pole: 64.251, poleSitter: 'Bottas', laps: 71, length: 4.318,
    path: 'M44,94 C34,78 42,62 62,60 C82,58 92,46 110,44 C134,41 158,40 178,52 C194,62 190,80 168,86 C146,91 132,96 110,98 C84,100 54,108 44,94 Z' },
  { id: 'gbr', name: 'Silverstone', country: 'Britain', flag: '🇬🇧', pole: 86.600, poleSitter: 'Hamilton', laps: 51, length: 5.891,
    path: 'M36,80 C32,62 46,52 66,54 C84,56 92,46 108,42 C128,37 138,28 158,34 C180,40 192,54 184,72 C177,86 158,88 140,86 C120,84 116,96 96,98 C72,100 50,98 40,90 C37,87 36,84 36,80 Z' },
  { id: 'hun', name: 'Hungaroring', country: 'Hungary', flag: '🇭🇺', pole: 76.276, poleSitter: 'Vettel', laps: 70, length: 4.381,
    path: 'M40,96 C34,80 42,70 56,70 C68,70 70,60 66,50 C62,38 74,32 86,36 C96,39 96,50 108,52 C124,55 132,44 148,46 C168,48 186,46 188,64 C190,80 172,84 154,82 C138,80 134,92 116,96 C96,100 54,108 40,96 Z' },
  { id: 'bel', name: 'Spa-Francorchamps', country: 'Belgium', flag: '🇧🇪', pole: 102.553, poleSitter: 'Hamilton', laps: 44, length: 7.004,
    path: 'M30,92 C26,74 38,66 56,68 C72,70 78,58 74,46 C70,32 84,24 98,30 C110,35 110,50 124,54 C146,60 176,48 192,62 C204,73 196,88 174,90 C154,92 148,100 126,100 C98,100 44,106 30,92 Z' },
  { id: 'ita', name: 'Monza', country: 'Italy', flag: '🇮🇹', pole: 95.554, poleSitter: 'Hamilton', laps: 53, length: 5.793,
    path: 'M40,96 C34,80 38,66 54,64 C84,60 84,40 110,40 L160,40 C182,40 192,52 184,68 C177,82 158,80 150,90 C144,98 140,100 124,100 C100,100 52,108 40,96 Z' },
  { id: 'sgp', name: 'Marina Bay', country: 'Singapore', flag: '🇸🇬', pole: 99.491, poleSitter: 'Vettel', laps: 61, length: 5.065,
    path: 'M36,100 L36,60 C36,50 44,46 56,48 C70,50 74,42 72,34 L100,34 C112,34 116,42 116,52 L160,52 C176,52 184,60 184,74 L184,96 C184,104 176,106 164,104 L70,104 C50,106 36,108 36,100 Z' },
  { id: 'jpn', name: 'Suzuka', country: 'Japan', flag: '🇯🇵', pole: 87.319, poleSitter: 'Hamilton', laps: 53, length: 5.807,
    path: 'M38,84 C32,68 44,58 62,60 C80,62 90,52 88,40 C86,30 96,26 106,32 C114,37 112,48 122,54 C138,63 168,54 184,68 C196,79 188,92 168,90 C150,88 146,80 128,78 C112,76 110,86 94,90 C72,95 50,96 38,84 Z' },
  { id: 'usa', name: 'Circuit of the Americas', country: 'United States', flag: '🇺🇸', pole: 93.108, poleSitter: 'Hamilton', laps: 56, length: 5.513,
    path: 'M40,90 C32,72 44,60 62,60 C78,60 82,48 78,38 C74,28 86,24 98,30 C108,35 108,48 120,52 C140,59 166,50 182,64 C196,76 188,90 168,90 C150,90 146,98 128,98 C104,98 54,104 40,90 Z' },
  { id: 'bra', name: 'Interlagos', country: 'Brazil', flag: '🇧🇷', pole: 68.322, poleSitter: 'Bottas', laps: 71, length: 4.309,
    path: 'M42,92 C34,76 40,62 58,60 C76,58 84,48 100,46 C120,43 130,34 150,38 C172,42 188,52 182,70 C177,84 158,86 140,86 C120,86 116,96 98,98 C76,100 52,104 42,92 Z' },
];

type Profile = { total: number; samples: number; speeds: number[]; scurv: number[] };

function buildProfile(pathEl: SVGPathElement, samples = 240): Profile {
  const total = pathEl.getTotalLength();
  const step = total / samples;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const p = pathEl.getPointAtLength(i * step);
    pts.push({ x: p.x, y: p.y });
  }
  // signed turn angle per sample (+ / − = left / right) and its magnitude
  const signed = new Array(samples).fill(0);
  for (let i = 0; i < samples; i++) {
    const a = pts[(i - 1 + samples) % samples];
    const b = pts[i];
    const c = pts[(i + 1) % samples];
    let ang = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (ang > Math.PI) ang -= 2 * Math.PI;
    while (ang < -Math.PI) ang += 2 * Math.PI;
    signed[i] = ang;
  }
  const smoothBy = (arr: number[], r: number) =>
    arr.map((_, i) => {
      let s = 0;
      for (let k = -r; k <= r; k++) s += arr[(i + k + samples) % samples];
      return s / (2 * r + 1);
    });
  const scurv = smoothBy(signed, 3); // signed curvature for the onboard road bend
  const curv = scurv.map(Math.abs);
  const maxc = Math.max(...curv, 0.0001);
  const raw = curv.map((c) => Math.round(330 - (c / maxc) * 250)); // 80..330 km/h
  const speeds = smoothBy(raw, 4).map(Math.round);
  return { total, samples, speeds, scurv };
}

/* Pseudo-3D onboard: draws the road bending through the corners that are coming
   up along the path (sampled from the track's own signed curvature), with kerbs,
   a scrolling tarmac, a vanishing point that leans into the turn, and a halo. */
function drawOnboard(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  baseIdx: number,
  prof: Profile,
  accent: string,
  speed: number,
) {
  const { scurv, samples } = prof;
  const horizon = Math.round(H * 0.4);
  const sampleAt = (k: number) => scurv[((Math.floor(k) % samples) + samples) % samples];

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#0a1130');
  sky.addColorStop(1, '#1a2750');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon);
  // grass / run-off
  const grass = ctx.createLinearGradient(0, horizon, 0, H);
  grass.addColorStop(0, '#10301a');
  grass.addColorStop(1, '#0a1f12');
  ctx.fillStyle = grass;
  ctx.fillRect(0, horizon, W, H - horizon);

  const segs = 60;
  const aheadSamples = samples * 0.17; // how far up the track the view sees
  const scroll = baseIdx * 2; // tarmac band motion

  // geometry near(i=0, bottom) → far(i=segs, horizon)
  const cx: number[] = [];
  const cy: number[] = [];
  const hw: number[] = [];
  let x = W / 2;
  let dx = 0;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    cx[i] = x;
    cy[i] = horizon + (H - horizon) * Math.pow(1 - t, 1.7);
    hw[i] = W * 0.6 * Math.pow(1 - t, 1.35) + 4;
    const c = sampleAt(baseIdx + t * aheadSamples);
    dx += c * W * 0.011; // curvature → heading
    x += dx; // heading → screen offset
  }

  // accent glow at the vanishing point
  const vp = ctx.createRadialGradient(cx[segs], horizon, 2, cx[segs], horizon, H * 0.4);
  vp.addColorStop(0, accent.replace(')', ', 0.22)').replace('rgb', 'rgba'));
  vp.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vp;
  ctx.fillRect(0, 0, W, H);

  // road, far → near (painter's order)
  for (let i = segs; i > 0; i--) {
    const xF = cx[i];
    const yF = cy[i];
    const wF = hw[i];
    const xN = cx[i - 1];
    const yN = cy[i - 1];
    const wN = hw[i - 1];
    const band = (i + Math.floor(scroll)) & 1;

    ctx.fillStyle = band ? '#2b2b31' : '#242429';
    ctx.beginPath();
    ctx.moveTo(xF - wF, yF);
    ctx.lineTo(xF + wF, yF);
    ctx.lineTo(xN + wN, yN);
    ctx.lineTo(xN - wN, yN);
    ctx.closePath();
    ctx.fill();

    // kerbs on corners
    const c = sampleAt(baseIdx + (i / segs) * aheadSamples);
    if (Math.abs(c) > 0.02) {
      const kerb = band ? '#d2233a' : '#f3f3f3';
      const kF = wF * 0.16;
      const kN = wN * 0.16;
      ctx.fillStyle = kerb;
      // left
      ctx.beginPath();
      ctx.moveTo(xF - wF, yF);
      ctx.lineTo(xF - wF + kF, yF);
      ctx.lineTo(xN - wN + kN, yN);
      ctx.lineTo(xN - wN, yN);
      ctx.closePath();
      ctx.fill();
      // right
      ctx.beginPath();
      ctx.moveTo(xF + wF, yF);
      ctx.lineTo(xF + wF - kF, yF);
      ctx.lineTo(xN + wN - kN, yN);
      ctx.lineTo(xN + wN, yN);
      ctx.closePath();
      ctx.fill();
    }

    // dashed centre line
    if (((i + Math.floor(scroll)) >> 1) & 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      const cwF = wF * 0.04;
      const cwN = wN * 0.04;
      ctx.beginPath();
      ctx.moveTo(xF - cwF, yF);
      ctx.lineTo(xF + cwF, yF);
      ctx.lineTo(xN + cwN, yN);
      ctx.lineTo(xN - cwN, yN);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ── cockpit halo (sells the onboard view) ──
  const cxm = W / 2;
  ctx.fillStyle = 'rgba(10,10,12,0.92)';
  // centre strut
  ctx.fillRect(cxm - W * 0.012, horizon - 6, W * 0.024, H - horizon);
  // top arc
  ctx.beginPath();
  ctx.lineWidth = W * 0.03;
  ctx.strokeStyle = 'rgba(10,10,12,0.92)';
  ctx.moveTo(W * 0.12, H * 0.2);
  ctx.quadraticCurveTo(cxm, H * 0.06, W * 0.88, H * 0.2);
  ctx.stroke();
  // thin accent rim on the halo arc
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.moveTo(W * 0.12, H * 0.2 + W * 0.016);
  ctx.quadraticCurveTo(cxm, H * 0.06 + W * 0.016, W * 0.88, H * 0.2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // bottom vignette
  const vig = ctx.createLinearGradient(0, H * 0.78, 0, H);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, H * 0.78, W, H * 0.22);
}

const fmtLap = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(3).padStart(6, '0')}`;
};
const fmtClock = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

// Standard F1 live-timing colours
const TIMING = { purple: '#b026ff', green: '#22c55e', yellow: '#eab308', idle: '#e5e7eb' } as const;
type TimingColor = keyof typeof TIMING;
type Sec = { t: number; c: TimingColor };
type LapRec = { t: number; c: TimingColor; secs: Sec[] };

// Sector split (roughly even) — each lap's sectors get a small, mostly-slower
// jitter so no two laps are identical, the way a real stint drifts around pole.
const SECTOR_FRAC = [0.345, 0.335, 0.32];
const planLap = (pole: number): number[] => SECTOR_FRAC.map((f) => pole * f * (1 + (Math.random() * 0.018 - 0.005)));

type Phase = 'setup' | 'running' | 'complete';
type TargetType = 'open' | 'min' | 'laps';

export default function FocusMode() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('setup');
  const [selected, setSelected] = useState<Track | null>(null);
  const [targetType, setTargetType] = useState<TargetType>('min');
  const [targetValue, setTargetValue] = useState<number>(25);

  const [elapsed, setElapsed] = useState(0); // throttled HUD clock
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [holding, setHolding] = useState(false);

  // sector timing + variable-lap display state
  const [curSec, setCurSec] = useState<(Sec | null)[]>([null, null, null]);
  const [lastLap, setLastLap] = useState<LapRec | null>(null);
  const [bestLap, setBestLap] = useState<number | null>(null);
  const [lapNo, setLapNo] = useState(0);

  const pathRef = useRef<SVGPathElement | null>(null);
  const trailRef = useRef<SVGPathElement | null>(null);
  const carRef = useRef<SVGGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const accentRef = useRef<string>('rgb(0, 210, 190)');
  const profileRef = useRef<Profile | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const lastHudRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const finalRef = useRef<number>(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // variable-lap / sector engine refs
  const lapStartRef = useRef(0); // elapsed-seconds at which the current lap began
  const planRef = useRef<number[]>([0, 0, 0]); // planned sector times for current lap
  const sectorMarkRef = useRef(0); // next sector index to finalize (0..2)
  const lapNoRef = useRef(0);
  const bestSecRef = useRef<(number | null)[]>([null, null, null]);
  const lastSecRef = useRef<(number | null)[]>([null, null, null]);
  const curSecRef = useRef<(Sec | null)[]>([null, null, null]);
  const bestLapRef = useRef<number | null>(null);
  const lastLapRef = useRef<number | null>(null);
  const hudRef = useRef({ leD: 0, dist: 0, speed: 0, gear: 1, onThrottle: true, drs: false });

  useEffect(() => setMounted(true), []);

  // Lock the page while the overlay is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const launch = useCallback((track: Track) => {
    setSelected(track);
    setReady(false);
    setPaused(false);
    setElapsed(0);
    pausedAtRef.current = 0;
    lastHudRef.current = 0;
    finishedRef.current = false;
    finalRef.current = 0;
    profileRef.current = null;
    // reset sector / variable-lap engine
    lapStartRef.current = 0;
    planRef.current = planLap(track.pole);
    sectorMarkRef.current = 0;
    lapNoRef.current = 0;
    bestSecRef.current = [null, null, null];
    lastSecRef.current = [null, null, null];
    curSecRef.current = [null, null, null];
    bestLapRef.current = null;
    lastLapRef.current = null;
    hudRef.current = { leD: 0, dist: 0, speed: 0, gear: 1, onThrottle: true, drs: false };
    setCurSec([null, null, null]);
    setLastLap(null);
    setBestLap(null);
    setLapNo(0);
    setPhase('running');
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('complete');
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPhase('setup');
    setSelected(null);
    setReady(false);
    setPaused(false);
  }, []);

  // Build the speed/length profile once the running SVG is mounted
  useEffect(() => {
    if (phase !== 'running' || !selected || !pathRef.current) return;
    profileRef.current = buildProfile(pathRef.current);
    if (trailRef.current) {
      trailRef.current.style.strokeDasharray = `${profileRef.current.total}`;
      trailRef.current.style.strokeDashoffset = `${profileRef.current.total}`;
    }
    // size the onboard canvas to its box (device-pixel-ratio aware) + resolve accent
    const sizeCanvas = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = cv.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const col = getComputedStyle(cv).color;
      if (col) accentRef.current = col;
    };
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    setReady(true);
    return () => window.removeEventListener('resize', sizeCanvas);
  }, [phase, selected]);

  // The animation / timing loop
  useEffect(() => {
    if (phase !== 'running' || paused || !ready || !selected) return;
    const pole = selected.pole;
    startRef.current = performance.now() - pausedAtRef.current * 1000;

    const finalizeSector = (i: number, t: number) => {
      const best = bestSecRef.current[i];
      const last = lastSecRef.current[i];
      let c: TimingColor = 'yellow';
      if (best == null || t < best) {
        c = 'purple';
        bestSecRef.current[i] = t;
      } else if (last != null && t < last) {
        c = 'green';
      }
      curSecRef.current[i] = { t, c };
      sectorMarkRef.current = i + 1;
      setCurSec([...curSecRef.current]);
    };

    const finalizeLap = (t: number) => {
      let c: TimingColor = 'yellow';
      if (bestLapRef.current == null || t < bestLapRef.current) {
        c = 'purple';
        bestLapRef.current = t;
        setBestLap(t);
      } else if (lastLapRef.current != null && t < lastLapRef.current) {
        c = 'green';
      }
      const secs = curSecRef.current.map((s) => s ?? { t: 0, c: 'yellow' as TimingColor });
      setLastLap({ t, c, secs });
      lastLapRef.current = t;
      lastSecRef.current = curSecRef.current.map((s) => (s ? s.t : null));
      lapNoRef.current += 1;
      setLapNo(lapNoRef.current);
      curSecRef.current = [null, null, null];
      setCurSec([null, null, null]);
    };

    const tick = (now: number) => {
      const e = (now - startRef.current) / 1000;
      const prof = profileRef.current;

      // ── advance the lap / sector state machine ──
      let p = planRef.current;
      let le = e - lapStartRef.current;
      let t1 = p[0];
      let t2 = p[0] + p[1];
      const t3 = p[0] + p[1] + p[2];

      if (sectorMarkRef.current < 1 && le >= t1) finalizeSector(0, p[0]);
      if (sectorMarkRef.current < 2 && le >= t2) finalizeSector(1, p[1]);
      if (le >= t3) {
        finalizeSector(2, p[2]);
        finalizeLap(t3);
        lapStartRef.current += t3;
        planRef.current = planLap(pole);
        sectorMarkRef.current = 0;
        p = planRef.current;
        le = e - lapStartRef.current;
        t1 = p[0];
        t2 = p[0] + p[1];
      }

      // ── place the car (paced per sector so it hits the 1/3 + 2/3 marks
      //    exactly when the sector clock does) ──
      if (prof && pathRef.current && carRef.current) {
        const third = prof.total / 3;
        let dist;
        if (le < t1) dist = (le / p[0]) * third;
        else if (le < t2) dist = third + ((le - t1) / p[1]) * third;
        else dist = 2 * third + ((le - t2) / p[2]) * third;
        dist = Math.max(0, Math.min(prof.total - 0.001, dist));
        const pos = pathRef.current.getPointAtLength(dist);
        const ahead = pathRef.current.getPointAtLength((dist + 2) % prof.total);
        const angle = (Math.atan2(ahead.y - pos.y, ahead.x - pos.x) * 180) / Math.PI;
        carRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`;
        if (trailRef.current) trailRef.current.style.strokeDashoffset = `${prof.total * (1 - dist / prof.total)}`;
        const idx = Math.min(prof.samples - 1, Math.floor((dist / prof.total) * prof.samples));
        const sp = prof.speeds[idx];
        const nx = prof.speeds[(idx + 1) % prof.samples];
        hudRef.current = {
          leD: le,
          dist,
          speed: sp,
          gear: Math.max(1, Math.min(8, 1 + Math.floor((sp - 60) / 35))),
          onThrottle: nx >= sp,
          drs: sp > 290,
        };

        // ── draw the pseudo-3D onboard ──
        const cv = canvasRef.current;
        const ctx = cv?.getContext('2d');
        if (cv && ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          drawOnboard(ctx, cv.width / dpr, cv.height / dpr, (dist / prof.total) * prof.samples, prof, accentRef.current, sp);
        }
      }

      // target checks
      if (targetType === 'min' && e >= targetValue * 60) {
        finalRef.current = e;
        setElapsed(e);
        finish();
        return;
      }
      if (targetType === 'laps' && lapNoRef.current >= targetValue) {
        finalRef.current = e;
        setElapsed(e);
        finish();
        return;
      }

      if (now - lastHudRef.current >= 60) {
        lastHudRef.current = now;
        finalRef.current = e;
        setElapsed(e);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, paused, ready, selected, targetType, targetValue, finish]);

  // Space = pause/resume while running
  useEffect(() => {
    if (phase !== 'running') return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.code === 'Space') {
        ev.preventDefault();
        setPaused((p) => {
          if (!p) pausedAtRef.current = finalRef.current;
          return !p;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const togglePause = () =>
    setPaused((p) => {
      if (!p) pausedAtRef.current = finalRef.current;
      return !p;
    });

  const startHold = () => {
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      setHolding(false);
      finish();
    }, 1100);
  };
  const cancelHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  // ---- derived HUD values (read per-frame state mirrored into hudRef) ----
  const hud = hudRef.current;
  const speed = hud.speed;
  const gear = hud.gear;
  const onThrottle = hud.onThrottle;
  const drs = hud.drs;
  const leD = hud.leD; // current-lap elapsed
  const activeIdx = curSec.findIndex((s) => s == null); // sector currently running (-1 if none)
  const cumPrev = activeIdx <= 0 ? 0 : planRef.current.slice(0, activeIdx).reduce((a, b) => a + b, 0);
  const liveSec = activeIdx >= 0 ? Math.max(0, leD - cumPrev) : 0;
  const sector = activeIdx < 0 ? 3 : activeIdx + 1;
  const remaining = targetType === 'min' ? Math.max(0, targetValue * 60 - elapsed) : 0;
  const distanceKm = selected ? (lapNo * selected.length).toFixed(1) : '0.0';

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => {
          setPhase('setup');
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-neutral-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
        title="Lock the page and run a focus lap"
      >
        <span className="text-[14px] leading-none">🏁</span>
        <span className="hidden sm:inline">Focus</span>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[999] overflow-hidden text-white" style={{ backgroundColor: '#070b16' }}>
          {/* carbon + accent atmosphere */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px), radial-gradient(circle at 20% -10%, rgba(var(--hub-accent-rgb), 0.18), transparent 45%), radial-gradient(ellipse at 100% 110%, rgba(var(--hub-accent-rgb), 0.12), transparent 55%)',
            }}
          />

          {/* ════════ SETUP ════════ */}
          {phase === 'setup' && (
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between px-5 py-5 sm:px-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--hub-text-soft-2)' }}>
                    Focus Mode · Qualifying
                  </div>
                  <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Pick your circuit</h2>
                </div>
                <button
                  onClick={close}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-neutral-300 transition-colors hover:bg-white/10"
                >
                  Close ✕
                </button>
              </div>

              {/* target selector */}
              <div className="flex flex-wrap items-center gap-3 px-5 pb-4 sm:px-8">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">Session</span>
                {([
                  ['min', '25 min', 25, 'min'],
                  ['min', '50 min', 50, 'min'],
                  ['laps', '20 laps', 20, 'laps'],
                  ['open', 'Open-ended', 0, 'open'],
                ] as [TargetType, string, number, string][]).map(([type, label, val]) => {
                  const active = targetType === type && (type === 'open' || targetValue === val);
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        setTargetType(type);
                        if (type !== 'open') setTargetValue(val);
                      }}
                      className="rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all"
                      style={
                        active
                          ? { backgroundColor: 'var(--hub-accent)', color: '#0a0a0a' }
                          : { backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
                <span className="ml-auto hidden text-[10px] font-medium text-neutral-500 sm:block">
                  Pick a track to start · page locks until you hold-to-end
                </span>
              </div>

              {/* track grid */}
              <div className="custom-scrollbar grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-5 pb-8 sm:grid-cols-3 sm:px-8 lg:grid-cols-4 xl:grid-cols-5">
                {TRACKS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => launch(t)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    <svg viewBox="0 0 220 140" className="h-20 w-full">
                      <path
                        d={t.path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/20 transition-colors group-hover:text-white/40"
                      />
                      <path
                        d={t.path}
                        fill="none"
                        stroke="var(--hub-accent)"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="14 320"
                        opacity={0.9}
                      />
                    </svg>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[15px] leading-none">{t.flag}</span>
                      <span className="truncate text-[13px] font-black tracking-tight">{t.country}</span>
                    </div>
                    <div className="truncate text-[10px] font-medium text-neutral-400">{t.name}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[12px] font-black" style={{ color: 'var(--hub-text-soft-2)' }}>
                        {fmtLap(t.pole)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{t.poleSitter}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════ RUNNING ════════ */}
          {phase === 'running' && selected && (
            <div className="relative flex h-full flex-col">
              {/* top strip */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{selected.flag}</span>
                  <div>
                    <div className="text-[15px] font-black leading-tight tracking-tight sm:text-lg">{selected.country}</div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                      {selected.name} · 2017 pole {selected.poleSitter}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePause}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-neutral-200 transition-colors hover:bg-white/10"
                  >
                    {paused ? '▶ Resume' : '❚❚ Pause'}
                  </button>
                  <button
                    onPointerDown={startHold}
                    onPointerUp={cancelHold}
                    onPointerLeave={cancelHold}
                    className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-neutral-200"
                    title="Hold to end the session"
                  >
                    <span
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: holding ? '100%' : '0%',
                        backgroundColor: 'rgba(var(--hub-accent-rgb), 0.35)',
                        transition: `width ${holding ? 1100 : 150}ms linear`,
                      }}
                    />
                    <span className="relative">Hold to end</span>
                  </button>
                </div>
              </div>

              {/* onboard view (hero) + track-map inset */}
              <div className="relative flex-1 overflow-hidden">
                {/* pseudo-3D onboard */}
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ color: 'var(--hub-accent)' }} />

                {/* current sector tag */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--hub-accent)' }} />
                  <span className="font-mono text-[12px] font-black tabular-nums" style={{ color: 'var(--hub-accent)' }}>
                    S{sector}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">Sector {sector} / 3</span>
                </div>

                {/* track-map inset (whole circuit + position) */}
                <div className="absolute right-3 top-3 w-32 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md sm:w-44">
                  <svg viewBox="0 0 220 140" className="h-full w-full">
                    <path
                      ref={pathRef}
                      d={selected.path}
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      ref={trailRef}
                      d={selected.path}
                      fill="none"
                      stroke="var(--hub-accent)"
                      strokeWidth={7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(var(--hub-accent-rgb),0.7))' }}
                    />
                    <g ref={carRef} style={{ transform: 'translate(0px,0px)' }}>
                      <circle r={6} fill="#ffffff" />
                      <circle r={10} fill="none" stroke="var(--hub-accent)" strokeWidth={2.5} opacity={0.8} />
                    </g>
                  </svg>
                </div>

                {paused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">Paused</div>
                      <div className="mt-2 text-2xl font-black">Press ▶ or Space to resume</div>
                    </div>
                  </div>
                )}
              </div>

              {/* telemetry HUD */}
              <div className="px-5 pb-6 sm:px-8">
                {/* big readouts */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Readout label="Lap Clock" value={fmtLap(leD)} accent />
                  <Readout label="Speed" value={`${speed}`} unit="km/h" />
                  <Readout label="Lap" value={`${lapNo}`} sub={targetType === 'laps' ? `/ ${targetValue}` : undefined} />
                  <Readout
                    label={targetType === 'min' ? 'Remaining' : 'Focus Time'}
                    value={targetType === 'min' ? fmtClock(remaining) : fmtClock(elapsed)}
                  />
                </div>

                {/* sector timing — live current lap + last / best */}
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  <SectorBox idx={0} sec={curSec[0]} live={activeIdx === 0 ? liveSec : null} />
                  <SectorBox idx={1} sec={curSec[1]} live={activeIdx === 1 ? liveSec : null} />
                  <SectorBox idx={2} sec={curSec[2]} live={activeIdx === 2 ? liveSec : null} />
                  <TimeBox label="Last Lap" value={lastLap ? fmtLap(lastLap.t) : '—'} color={lastLap ? TIMING[lastLap.c] : undefined} />
                  <TimeBox label="Best Lap" value={bestLap != null ? fmtLap(bestLap) : '—'} color={bestLap != null ? TIMING.purple : undefined} />
                </div>

                {/* gear / drs / sector / throttle */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Pill label="Gear" value={`${gear}`} />
                  <Pill label="Sector" value={`S${sector}`} />
                  <Pill label="DRS" value={drs ? 'OPEN' : '—'} on={drs} />
                  <Pill label="Pole Ref" value={fmtLap(selected.pole)} />
                  <Pill label="Distance" value={`${distanceKm} km`} />
                  {/* throttle / brake bar */}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{onThrottle ? 'Throttle' : 'Brake'}</span>
                    <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{
                          width: `${Math.round((speed / 330) * 100)}%`,
                          backgroundColor: onThrottle ? 'var(--hub-accent)' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ COMPLETE ════════ */}
          {phase === 'complete' && selected && (
            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--hub-text-soft-2)' }}>
                Chequered Flag
              </div>
              <div className="mt-3 text-5xl">🏁</div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Session complete</h2>
              <p className="mt-2 text-sm font-medium text-neutral-400">
                {selected.flag} {selected.country} · {selected.name}
              </p>

              <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                <Readout label="Laps" value={`${lapNo}`} accent />
                <Readout label="Distance" value={distanceKm} unit="km" />
                <Readout label="Best Lap" value={bestLap != null ? fmtLap(bestLap) : '—'} />
                <Readout label="Focus" value={fmtClock(elapsed)} />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => launch(selected)}
                  className="rounded-full px-6 py-3 text-[12px] font-black uppercase tracking-widest text-black"
                  style={{ backgroundColor: 'var(--hub-accent)' }}
                >
                  Run again
                </button>
                <button
                  onClick={() => setPhase('setup')}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[12px] font-black uppercase tracking-widest text-neutral-200 transition-colors hover:bg-white/10"
                >
                  Pick another track
                </button>
                <button
                  onClick={close}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[12px] font-black uppercase tracking-widest text-neutral-200 transition-colors hover:bg-white/10"
                >
                  Exit focus
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

function Readout({ label, value, unit, sub, accent }: { label: string; value: string; unit?: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="font-mono text-2xl font-black tabular-nums tracking-tight sm:text-3xl"
          style={accent ? { color: 'var(--hub-accent)' } : undefined}
        >
          {value}
        </span>
        {unit && <span className="text-[11px] font-bold text-neutral-500">{unit}</span>}
        {sub && <span className="text-[11px] font-bold text-neutral-500">{sub}</span>}
      </div>
    </div>
  );
}

function SectorBox({ idx, sec, live }: { idx: number; sec: Sec | null; live: number | null }) {
  let value = '—';
  let color: string | undefined;
  const running = !sec && live != null;
  if (sec) {
    value = sec.t.toFixed(3);
    color = TIMING[sec.c];
  } else if (live != null) {
    value = live.toFixed(3);
    color = '#ffffff';
  }
  return (
    <div
      className="rounded-xl border bg-white/[0.05] px-3 py-2"
      style={{ borderColor: running ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)' }}
    >
      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">S{idx + 1}</div>
      <div className="mt-0.5 font-mono text-[15px] font-black tabular-nums sm:text-[17px]" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function TimeBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
      <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-0.5 font-mono text-[15px] font-black tabular-nums sm:text-[17px]" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function Pill({ label, value, on }: { label: string; value: string; on?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-3 py-1.5"
      style={{
        borderColor: on ? 'var(--hub-accent)' : 'rgba(255,255,255,0.1)',
        backgroundColor: on ? 'rgba(var(--hub-accent-rgb),0.15)' : 'rgba(255,255,255,0.04)',
      }}
    >
      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
      <span className="font-mono text-[12px] font-black tabular-nums" style={on ? { color: 'var(--hub-accent)' } : undefined}>
        {value}
      </span>
    </div>
  );
}
