'use client';

import { motion, useReducedMotion } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════════════
   LIVERY INTROS — W11 Revolut generation. Each special livery boots with
   its own cinematic mechanic (not a recolor):
     · Williams    — wind-tunnel streamlines around an FW monogram
     · Senna       — the Interlagos "Senna S" traced with a magic-lap pulse
     · Verstappen  — RPM gauge revs to redline, shift lights ignite
     · Ferrari     — five start lights… lights out and away we go
   The normal build keeps the W-trace SignatureIntro.
   ════════════════════════════════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const;
const SWOOSH = [0.76, 0, 0.24, 1] as const;

function dly(reduce: boolean, s: number) {
  return reduce ? Math.min(s * 0.16, 0.4) : s;
}

function Shell({
  base,
  glow,
  reduce,
  children,
}: {
  base: string;
  glow: string;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed left-0 top-0 z-[200] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden text-white"
      style={{ background: base }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduce ? 'none' : 'blur(12px)', scale: reduce ? 1 : 1.03 }}
      transition={{ duration: reduce ? 0.2 : 0.72, ease: SWOOSH }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${glow}, transparent 48%), linear-gradient(180deg, ${base} 0%, #010204 78%, #000 100%)` }}
      />
      {children}
    </motion.div>
  );
}

function Telemetry({ left, right, accent, reduce }: { left: string; right: string; accent: string; reduce: boolean }) {
  return (
    <motion.div
      className="absolute left-6 right-6 top-8 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.34em] text-white/55"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 0.7, y: 0 }}
      transition={{ delay: dly(reduce, 0.45), duration: 0.5, ease: EASE }}
    >
      <span style={{ color: accent }}>{left}</span>
      <span>{right}</span>
    </motion.div>
  );
}

function Loader({ from, to, glow, reduce }: { from: string; to: string; glow: string; reduce: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-white/10">
      <motion.div
        className="h-full"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})`, boxShadow: `0 0 14px ${glow}` }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ delay: dly(reduce, 0.4), duration: reduce ? 0.3 : 4.6, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

function NameReveal({ text, accent, secondary, glow, delay, reduce }: { text: string; accent: string; secondary: string; glow: string; delay: number; reduce: boolean }) {
  return (
    <div className="flex overflow-hidden text-[clamp(38px,8.5vw,92px)] font-black uppercase leading-none tracking-[-0.01em]">
      {[...text].map((ch, i) => (
        <motion.span
          key={ch + i}
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(120deg, ${secondary} 0%, ${accent} 100%)`, filter: `drop-shadow(0 4px 24px ${glow})` }}
          initial={{ opacity: 0, y: '0.7em', rotateX: reduce ? 0 : -80 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: dly(reduce, delay + i * 0.05), duration: reduce ? 0.2 : 0.6, ease: EASE }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </div>
  );
}

/* ── WILLIAMS — wind tunnel: brass/white/red streamlines flow around the
   monogram like air over a wing; the wing-band sweeps behind "FW". ── */
export function WilliamsIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const navy = '#0a0322', white = '#ffffff', brass = '#c59955', red = '#d5172d';
  const flows = [
    { d: 'M -40 240 C 200 240 320 150 500 150 S 800 240 1040 240', stroke: 'rgba(197,153,85,0.5)', w: 2, delay: 0.25 },
    { d: 'M -40 300 C 200 300 300 210 500 210 S 800 300 1040 300', stroke: brass, w: 3, delay: 0.4 },
    { d: 'M -40 360 C 200 360 320 450 500 450 S 800 360 1040 360', stroke: 'rgba(255,255,255,0.55)', w: 2.5, delay: 0.55 },
    { d: 'M -40 420 C 200 420 320 510 500 510 S 800 420 1040 420', stroke: red, w: 2, delay: 0.7 },
  ];
  return (
    <Shell base={navy} glow="rgba(197,153,85,0.4)" reduce={reduce}>
      {/* wind-tunnel streamlines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" fill="none">
        {flows.map((f) => (
          <motion.path
            key={f.d}
            d={f.d}
            stroke={f.stroke}
            strokeWidth={f.w}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(197,153,85,0.4))' }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: dly(reduce, f.delay), duration: reduce ? 0.1 : 1.5, ease: EASE }}
          />
        ))}
      </svg>

      <Telemetry left="Grove // wind tunnel" right={cycle.replace('_', ' ')} accent={brass} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* FW monogram with the wing-band sweeping behind */}
        <div className="relative mb-6 grid place-items-center px-10 py-4">
          <motion.div
            className="absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 bg-white/90"
            initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
            animate={{ scaleX: 1 }}
            transition={{ delay: dly(reduce, 0.9), duration: reduce ? 0.15 : 0.8, ease: SWOOSH }}
          />
          <motion.div
            className="absolute inset-x-0 top-[calc(50%+26px)] h-[3px]"
            style={{ background: brass }}
            initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
            animate={{ scaleX: 1 }}
            transition={{ delay: dly(reduce, 1.05), duration: reduce ? 0.15 : 0.7, ease: SWOOSH }}
          />
          <motion.div
            className="absolute inset-x-0 top-[calc(50%+33px)] h-[3px]"
            style={{ background: red }}
            initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
            animate={{ scaleX: 1 }}
            transition={{ delay: dly(reduce, 1.15), duration: reduce ? 0.15 : 0.7, ease: SWOOSH }}
          />
          <motion.span
            className="relative text-[clamp(64px,13vw,130px)] font-black leading-[0.85] tracking-[-0.03em]"
            style={{ color: navy, WebkitTextStroke: `2px ${brass}`, textShadow: '0 0 40px rgba(197,153,85,0.45)' }}
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: dly(reduce, 1.0), duration: reduce ? 0.2 : 0.6, ease: EASE }}
          >
            FW
          </motion.span>
        </div>

        <NameReveal text="Williams" accent={brass} secondary={white} glow="rgba(197,153,85,0.4)" delay={1.45} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.46em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.46em' }}
          transition={{ delay: dly(reduce, 2.0), duration: reduce ? 0.2 : 0.7, ease: EASE }}
        >
          Aero Spec · Heritage
        </motion.div>
      </div>

      <Loader from={white} to={brass} glow="rgba(197,153,85,0.4)" reduce={reduce} />
    </Shell>
  );
}

/* ── SENNA — the Senna S: the Interlagos esses draw in as a wide track with
   a yellow racing line, a magic-lap pulse travels it, apexes flash. ── */
export function SennaIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const yellow = '#ffd400', green = '#00a651', blue = '#1f6feb';
  const S_PATH = 'M 40 225 C 40 170 80 165 95 135 C 110 108 82 92 100 62 C 114 38 152 40 160 18';
  return (
    <Shell base="#061329" glow="rgba(255,212,0,0.34)" reduce={reduce}>
      <Telemetry left="Interlagos // magic lap" right={cycle.replace('_', ' ')} accent={yellow} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* the Senna S */}
        <motion.svg
          viewBox="0 0 200 240"
          className="mb-5 h-[150px] w-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: dly(reduce, 0.3), duration: reduce ? 0.2 : 0.6, ease: EASE }}
          style={{ filter: 'drop-shadow(0 0 26px rgba(255,212,0,0.35))' }}
        >
          {/* track ribbon */}
          <motion.path
            d={S_PATH}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={22}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: dly(reduce, 0.35), duration: reduce ? 0.1 : 1.2, ease: EASE }}
          />
          {/* racing line */}
          <motion.path
            d={S_PATH}
            stroke={yellow}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,212,0,0.7))' }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: dly(reduce, 0.8), duration: reduce ? 0.1 : 1.3, ease: EASE }}
          />
          {/* apex markers */}
          {[
            { cx: 95, cy: 135, fill: green, delay: 1.5 },
            { cx: 100, cy: 62, fill: blue, delay: 1.68 },
          ].map((a) => (
            <motion.circle
              key={a.cx}
              cx={a.cx} cy={a.cy} r={5}
              fill={a.fill}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: dly(reduce, a.delay), duration: reduce ? 0.1 : 0.35, ease: EASE }}
            />
          ))}
          {/* magic-lap pulse riding the esses */}
          {!reduce && (
            <motion.circle
              r={6}
              fill="#ffffff"
              style={{ filter: 'drop-shadow(0 0 10px #fff7cc)' }}
              initial={{ cx: 40, cy: 225, opacity: 0 }}
              animate={{ cx: [40, 62, 95, 95, 112, 160], cy: [225, 168, 135, 88, 55, 18], opacity: [0, 1, 1, 1, 1, 0] }}
              transition={{ delay: 0.85, duration: 1.35, times: [0, 0.22, 0.42, 0.62, 0.8, 1], ease: 'easeInOut' }}
            />
          )}
        </motion.svg>

        {/* sector readout */}
        <motion.div
          className="mb-3 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.36em]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dly(reduce, 1.6), duration: 0.5, ease: EASE }}
        >
          <span style={{ color: yellow }}>S1 purple</span>
          <span className="text-white/40">/</span>
          <span style={{ color: green }}>S2 purple</span>
          <span className="text-white/40">/</span>
          <span style={{ color: blue }}>S3 purple</span>
        </motion.div>

        <NameReveal text="Senna" accent={yellow} secondary="#fff7cc" glow="rgba(255,212,0,0.4)" delay={1.85} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.46em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.46em' }}
          transition={{ delay: dly(reduce, 2.4), duration: reduce ? 0.2 : 0.6, ease: EASE }}
        >
          The Senna S · Flying Lap
        </motion.div>
      </div>

      <Loader from={yellow} to={blue} glow="rgba(255,212,0,0.4)" reduce={reduce} />
    </Shell>
  );
}

/* ── VERSTAPPEN — redline: the RPM arc revs to the limiter, shift lights
   ignite across the top, the race "1" holds the middle of the gauge. ── */
export function VerstappenIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const orange = '#ff6b00', blue = '#1d4ed8';
  // gauge geometry: center (100,100), radius 70, sweep 180°→0°
  const ticks = [180, 150, 120, 90, 60, 30, 0].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x1: 100 + 62 * Math.cos(rad), y1: 100 - 62 * Math.sin(rad),
      x2: 100 + 80 * Math.cos(rad), y2: 100 - 80 * Math.sin(rad),
      key: deg,
    };
  });
  const shiftLights = [orange, orange, '#ffffff', blue, blue];
  return (
    <Shell base="#050b16" glow="rgba(255,107,0,0.4)" reduce={reduce}>
      <Telemetry left="Zandvoort // full send" right={cycle.replace('_', ' ')} accent={orange} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* shift lights */}
        <div className="mb-4 flex items-center gap-2.5">
          {shiftLights.map((c, i) => (
            <motion.span
              key={i}
              className="h-3.5 w-3.5 rounded-full"
              initial={{ backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              animate={{ backgroundColor: c, boxShadow: `0 0 14px ${c}` }}
              transition={{ delay: dly(reduce, 1.5 + i * 0.14), duration: reduce ? 0.1 : 0.18 }}
            />
          ))}
        </div>

        {/* RPM gauge revving to the limiter */}
        <motion.svg
          viewBox="0 0 200 120"
          className="mb-5 h-[120px] w-auto overflow-visible"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: dly(reduce, 0.3), duration: reduce ? 0.2 : 0.5, ease: EASE }}
          style={{ filter: 'drop-shadow(0 0 26px rgba(255,107,0,0.4))' }}
        >
          <path d="M 30 100 A 70 70 0 0 1 170 100" stroke="rgba(255,255,255,0.10)" strokeWidth={10} strokeLinecap="round" fill="none" />
          {ticks.map((t) => (
            <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
          ))}
          <motion.path
            d="M 30 100 A 70 70 0 0 1 170 100"
            stroke={orange}
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,0,0.8))' }}
            initial={{ pathLength: 0 }}
            animate={reduce ? { pathLength: 1 } : { pathLength: [0, 0.55, 0.42, 1] }}
            transition={{ delay: dly(reduce, 0.45), duration: reduce ? 0.15 : 1.15, times: reduce ? undefined : [0, 0.45, 0.58, 1], ease: SWOOSH }}
          />
          {/* the race "1" holds the gauge */}
          <motion.text
            x="100" y="98"
            textAnchor="middle"
            fontSize="58"
            fontWeight="900"
            fill={orange}
            style={{ textShadow: '0 0 40px rgba(255,107,0,0.7)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dly(reduce, 1.15), duration: reduce ? 0.2 : 0.45, ease: SWOOSH }}
          >
            1
          </motion.text>
        </motion.svg>

        <NameReveal text="Verstappen" accent={orange} secondary="#ffd9b8" glow="rgba(255,107,0,0.45)" delay={1.9} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.42em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.8em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ delay: dly(reduce, 2.45), duration: reduce ? 0.2 : 0.6, ease: EASE }}
        >
          Redline · Flat Out
        </motion.div>
      </div>

      <Loader from={orange} to={blue} glow="rgba(255,107,0,0.45)" reduce={reduce} />
    </Shell>
  );
}

/* ── FERRARI — lights out: the five-light gantry ignites one by one, holds,
   then drops to black — and the rosso wordmark launches. ── */
export function FerrariIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const rosso = '#ef1a2d', giallo = '#ffdd00';
  const dark = '#2a090c';
  const LIGHT_ON = 0.55; // first light
  const STEP = 0.34;
  const OUT_AT = LIGHT_ON + 4 * STEP + 0.7; // all-out moment ≈ 2.61s
  return (
    <Shell base="#0b0304" glow="rgba(239,26,45,0.4)" reduce={reduce}>
      {/* launch streaks at lights-out */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute h-[2px] w-full"
            style={{
              top: `${34 + i * 5}%`,
              background: `linear-gradient(90deg, transparent, ${i === 1 ? giallo : rosso}, transparent)`,
              boxShadow: `0 0 16px ${i === 1 ? 'rgba(255,221,0,0.5)' : 'rgba(239,26,45,0.5)'}`,
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: [0, 1, 0] }}
            transition={{ delay: OUT_AT + 0.1 + i * 0.08, duration: 0.9, ease: SWOOSH }}
          />
        ))}

      <Telemetry left="Maranello // race start" right={cycle.replace('_', ' ')} accent={rosso} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* start-light gantry */}
        <motion.div
          className="mb-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-5 py-3.5"
          style={{ boxShadow: '0 14px 40px rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dly(reduce, 0.25), duration: reduce ? 0.2 : 0.55, ease: EASE }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const on = LIGHT_ON + i * STEP;
            const dur = OUT_AT - on + 0.22;
            return (
              <motion.span
                key={i}
                className="h-6 w-6 rounded-full sm:h-7 sm:w-7"
                initial={{ backgroundColor: dark, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
                animate={
                  reduce
                    ? { backgroundColor: dark }
                    : {
                        backgroundColor: [dark, rosso, rosso, dark],
                        boxShadow: [
                          '0 0 0 rgba(239,26,45,0)',
                          '0 0 18px rgba(239,26,45,0.9)',
                          '0 0 18px rgba(239,26,45,0.9)',
                          '0 0 0 rgba(239,26,45,0)',
                        ],
                      }
                }
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : { delay: on, duration: dur, times: [0, Math.min(0.16 / dur, 0.3), (dur - 0.22) / dur, 1], ease: 'linear' }
                }
              />
            );
          })}
        </motion.div>

        {/* lights-out call */}
        <motion.div
          className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.5em]"
          style={{ color: giallo }}
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.9 } : { opacity: [0, 0, 1] }}
          transition={reduce ? { delay: 0.3, duration: 0.2 } : { delay: OUT_AT, duration: 0.35 }}
        >
          Lights out
        </motion.div>

        <NameReveal text="Ferrari" accent={rosso} secondary={giallo} glow="rgba(239,26,45,0.45)" delay={reduce ? 0.4 : OUT_AT + 0.15} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.46em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.46em' }}
          transition={{ delay: reduce ? 0.5 : OUT_AT + 0.75, duration: reduce ? 0.2 : 0.6, ease: EASE }}
        >
          Andiamo · Scuderia
        </motion.div>
      </div>

      <Loader from={rosso} to={giallo} glow="rgba(239,26,45,0.45)" reduce={reduce} />
    </Shell>
  );
}
