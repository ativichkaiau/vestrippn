'use client';

import { motion, useReducedMotion } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════════════
   LIVERY INTROS — a distinct boot sequence per special livery, each built
   around that livery's own identity (Williams wing-band, Senna helmet,
   Verstappen orange attack, Ferrari shield). The normal build keeps the
   W-trace SignatureIntro; these replace the recolored template.
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
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </div>
  );
}

/* ── WILLIAMS — heritage pit-wall release: navy, white wing-band, brass + red
   pinstripes sweep across; a brass roundel settles; FW18 heritage. ── */
export function WilliamsIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const navy = '#0a0322', white = '#ffffff', brass = '#c59955', red = '#d5172d';
  return (
    <Shell base={navy} glow="rgba(197,153,85,0.42)" reduce={reduce}>
      {/* wing band + trim lines sweeping across */}
      {[
        { top: '30%', h: 26, bg: 'rgba(255,255,255,0.14)', delay: 0.2, dur: 1.2 },
        { top: 'calc(30% + 30px)', h: 3, bg: brass, delay: 0.42, dur: 1.0 },
        { top: 'calc(30% + 38px)', h: 3, bg: red, delay: 0.52, dur: 1.0 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0"
          style={{ top: b.top, height: b.h, background: b.bg }}
          initial={{ scaleX: 0, transformOrigin: '0% 50%', opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: dly(reduce, b.delay), duration: reduce ? 0.12 : b.dur, ease: SWOOSH }}
        />
      ))}

      <Telemetry left="Pit wall // release" right={cycle.replace('_', ' ')} accent={brass} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* brass roundel with mini wing-band */}
        <motion.div
          className="mb-7 grid h-[92px] w-[92px] place-items-center rounded-full"
          style={{ background: navy, border: `2px solid ${brass}`, boxShadow: `0 0 36px rgba(197,153,85,0.4)` }}
          initial={{ scale: 0.4, opacity: 0, rotate: reduce ? 0 : -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: dly(reduce, 1.0), duration: reduce ? 0.2 : 0.7, ease: EASE }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 bg-white/85" />
            <div className="absolute left-0 right-0 top-[58%] h-[2px]" style={{ background: brass }} />
            <div className="absolute left-0 right-0 top-[64%] h-[2px]" style={{ background: red }} />
          </div>
        </motion.div>

        <motion.div
          className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.4em]"
          style={{ color: brass }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: dly(reduce, 1.2), duration: 0.5 }}
        >
          Heritage Livery
        </motion.div>
        <NameReveal text="Williams" accent={brass} secondary={white} glow="rgba(197,153,85,0.4)" delay={1.35} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[12px] font-black uppercase tracking-[0.5em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ delay: dly(reduce, 2.0), duration: reduce ? 0.2 : 0.7, ease: EASE }}
        >
          FW18
        </motion.div>
      </div>

      <Loader from={white} to={brass} glow="rgba(197,153,85,0.4)" reduce={reduce} />
    </Shell>
  );
}

/* ── SENNA — qualifying helmet: the helmet bands assemble, an apex line
   traces, a lap timer ticks. Yellow / green / blue. ── */
export function SennaIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const yellow = '#ffd400', green = '#00a651', blue = '#1f6feb';
  return (
    <Shell base="#061329" glow="rgba(255,212,0,0.34)" reduce={reduce}>
      {/* apex racing line traced behind */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" fill="none">
        <motion.path
          d="M-40 470 C 250 470 250 150 520 150 S 820 470 1080 470"
          stroke={yellow}
          strokeWidth={2}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(255,212,0,0.6))', opacity: 0.5 }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: dly(reduce, 0.3), duration: reduce ? 0.1 : 1.7, ease: EASE }}
        />
      </svg>

      <Telemetry left="Qualifying // S1" right={cycle.replace('_', ' ')} accent={yellow} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* helmet */}
        <motion.svg
          viewBox="0 0 100 100"
          className="mb-6 h-[110px] w-[110px]"
          initial={{ scale: 0.5, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: dly(reduce, 0.5), duration: reduce ? 0.2 : 0.7, ease: EASE }}
          style={{ filter: 'drop-shadow(0 8px 26px rgba(255,212,0,0.4))' }}
        >
          <defs>
            <clipPath id="senna-helmet">
              <path d="M50 16 C28 16 15 32 15 54 L15 66 C15 73 19 77 28 77 L42 77 L48 69 L74 69 C82 69 86 64 86 54 C86 30 71 16 50 16 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#senna-helmet)">
            <rect x="0" y="0" width="100" height="100" fill={yellow} />
            <rect x="0" y="40" width="100" height="9" fill={green} />
            <rect x="0" y="49" width="100" height="6" fill={blue} />
            {/* visor */}
            <path d="M40 44 L80 44 C84 44 86 47 86 52 C86 58 82 61 75 61 L46 61 Z" fill="#0a1424" opacity="0.92" />
          </g>
          <path d="M50 16 C28 16 15 32 15 54 L15 66 C15 73 19 77 28 77 L42 77 L48 69 L74 69 C82 69 86 64 86 54 C86 30 71 16 50 16 Z" fill="none" stroke="#0a1424" strokeWidth="2" />
        </motion.svg>

        <NameReveal text="Senna" accent={yellow} secondary="#fff7cc" glow="rgba(255,212,0,0.4)" delay={1.0} reduce={reduce} />

        <motion.div
          className="mt-5 flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.36em]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dly(reduce, 1.5), duration: 0.5, ease: EASE }}
        >
          <span style={{ color: green }}>Apex</span>
          <span className="text-white/40">/</span>
          <span style={{ color: blue }}>Flying lap</span>
        </motion.div>
      </div>

      <Loader from={yellow} to={blue} glow="rgba(255,212,0,0.4)" reduce={reduce} />
    </Shell>
  );
}

/* ── VERSTAPPEN — orange attack: diagonal speed chevrons slash in, a bold
   race "1" punches up, the Dutch tricolor flashes. Fast + aggressive. ── */
export function VerstappenIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const orange = '#ff6b00', red = '#dc2626', blue = '#1d4ed8';
  return (
    <Shell base="#050b16" glow="rgba(255,107,0,0.4)" reduce={reduce}>
      {/* diagonal speed chevrons */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute -skew-x-[20deg]"
          style={{ left: `${8 + i * 5}%`, top: 0, bottom: 0, width: '7px', background: i % 2 ? orange : 'rgba(255,107,0,0.35)' }}
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: i % 2 ? 0.9 : 0.5 }}
          transition={{ delay: dly(reduce, 0.2 + i * 0.07), duration: reduce ? 0.12 : 0.5, ease: SWOOSH }}
        />
      ))}
      {/* dutch tricolor slash */}
      <motion.div
        className="absolute right-[-10%] top-[16%] h-[14px] w-[60%] -rotate-[8deg]"
        style={{ background: `linear-gradient(90deg, ${red} 0 33%, #fff 33% 66%, ${blue} 66% 100%)` }}
        initial={{ x: '120%', opacity: 0 }}
        animate={{ x: '0%', opacity: 0.92 }}
        transition={{ delay: dly(reduce, 0.55), duration: reduce ? 0.12 : 0.7, ease: SWOOSH }}
      />

      <Telemetry left="Push lap // attack" right={cycle.replace('_', ' ')} accent={orange} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="mb-2 text-[clamp(120px,22vw,230px)] font-black leading-[0.8]"
          style={{ color: orange, textShadow: '0 0 50px rgba(255,107,0,0.7)' }}
          initial={{ opacity: 0, y: 40, scale: 0.7, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: dly(reduce, 0.7), duration: reduce ? 0.2 : 0.6, ease: SWOOSH }}
        >
          1
        </motion.div>
        <NameReveal text="Verstappen" accent={orange} secondary="#ffd9b8" glow="rgba(255,107,0,0.45)" delay={1.15} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.42em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.8em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ delay: dly(reduce, 1.7), duration: reduce ? 0.2 : 0.6, ease: EASE }}
        >
          MV1 · Orange Attack
        </motion.div>
      </div>

      <Loader from={orange} to={blue} glow="rgba(255,107,0,0.45)" reduce={reduce} />
    </Shell>
  );
}

/* ── FERRARI — Scuderia ignition: the Modena shield draws in, rosso glow
   ignites, the wordmark resolves. Rosso / giallo / nero. ── */
export function FerrariIntro({ cycle }: { cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const rosso = '#ef1a2d', giallo = '#ffdd00';
  return (
    <Shell base="#0b0304" glow="rgba(239,26,45,0.4)" reduce={reduce}>
      {/* rosso ignition pulse */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(239,26,45,0.5), transparent 62%)' }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={reduce ? { scale: 1, opacity: 0.5 } : { scale: [0.2, 1.1, 1], opacity: [0, 0.8, 0.45] }}
        transition={{ delay: dly(reduce, 0.5), duration: reduce ? 0.2 : 1.2, ease: EASE }}
      />

      <Telemetry left="Scuderia // SF" right={cycle.replace('_', ' ')} accent={rosso} reduce={reduce} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Modena shield */}
        <motion.svg
          viewBox="0 0 100 110"
          className="mb-6 h-[112px] w-auto"
          initial={{ scale: 0.5, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: dly(reduce, 0.7), duration: reduce ? 0.2 : 0.7, ease: EASE }}
          style={{ filter: 'drop-shadow(0 8px 28px rgba(239,26,45,0.5))' }}
        >
          <motion.path
            d="M50 6 L88 6 C92 6 92 12 92 22 C92 60 70 92 50 104 C30 92 8 60 8 22 C8 12 8 6 12 6 Z"
            fill={giallo}
            stroke="#0b0304"
            strokeWidth={3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: dly(reduce, 0.7), duration: reduce ? 0.1 : 1.0, ease: EASE }}
          />
          {/* top stripe (tricolore nod) + SF */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dly(reduce, 1.4), duration: 0.4 }}>
            <rect x="14" y="12" width="72" height="8" fill="#0b8a3a" />
            <rect x="14" y="12" width="24" height="8" fill="#0b8a3a" />
            <rect x="62" y="12" width="24" height="8" fill={rosso} />
            <text x="50" y="74" textAnchor="middle" fontSize="40" fontWeight="900" fill="#0b0304" style={{ fontFamily: 'var(--font-revolut), system-ui, sans-serif' }}>SF</text>
          </motion.g>
        </motion.svg>

        <NameReveal text="Ferrari" accent={rosso} secondary={giallo} glow="rgba(239,26,45,0.45)" delay={1.1} reduce={reduce} />
        <motion.div
          className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.46em] text-white/70"
          initial={{ opacity: 0, letterSpacing: '0.9em' }}
          animate={{ opacity: 1, letterSpacing: '0.46em' }}
          transition={{ delay: dly(reduce, 1.7), duration: reduce ? 0.2 : 0.6, ease: EASE }}
        >
          Scuderia · Tifosi
        </motion.div>
      </div>

      <Loader from={rosso} to={giallo} glow="rgba(239,26,45,0.45)" reduce={reduce} />
    </Shell>
  );
}
