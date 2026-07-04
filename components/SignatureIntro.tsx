'use client';

import { motion, useReducedMotion } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════════════
   SIGNATURE INTRO — the W traces in, expands to "W11", then the livery
   wordmark resolves beneath it. One theme-driven, futuristic boot sequence
   reused across the normal (Revolut) build and every special livery.
   ════════════════════════════════════════════════════════════════════════ */

export type IntroLivery = 'normal' | 'monza' | 'senna' | 'verstappen' | 'ferrari';

type IntroTheme = {
  accent: string;
  secondary: string;
  soft: string;
  glow: string;
  base: string;
  name: string;
  tagline: string;
};

const THEMES: Record<IntroLivery, IntroTheme> = {
  normal:     { accent: '#00d2be', secondary: '#e3e7ec', soft: '#d6f5f1', glow: 'rgba(0,210,190,0.55)',  base: '#07090c', name: 'Revolut',  tagline: 'The Future of Mercedes' },
  monza:      { accent: '#c59955', secondary: '#ffffff', soft: '#f3e3c6', glow: 'rgba(197,153,85,0.55)', base: '#070216', name: 'Williams',   tagline: 'Heritage Livery' },
  senna:      { accent: '#ffd400', secondary: '#00a651', soft: '#fff3b8', glow: 'rgba(255,212,0,0.52)',  base: '#061329', name: 'Senna',      tagline: 'Qualifying Focus' },
  verstappen: { accent: '#ff6b00', secondary: '#1d4ed8', soft: '#fed7aa', glow: 'rgba(255,107,0,0.55)',  base: '#050b16', name: 'Verstappen', tagline: 'Orange Attack' },
  ferrari:    { accent: '#ef1a2d', secondary: '#ffdd00', soft: '#ffd9dc', glow: 'rgba(239,26,45,0.55)',  base: '#0b0304', name: 'Ferrari',    tagline: 'Scuderia' },
};

const W_PATH = 'M6 8 L31 72 L60 30 L89 72 L114 8';
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SWOOSH: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function SignatureIntro({ livery, cycle }: { livery: IntroLivery; cycle: string }) {
  const reduce = Boolean(useReducedMotion());
  const t = THEMES[livery] ?? THEMES.normal;
  const chars = [...t.name];

  // Timeline anchors (seconds)
  const TRACE_AT = 0.3;
  const TRACE_DUR = reduce ? 0.01 : 1.4;
  const IGNITE_AT = TRACE_AT + TRACE_DUR + 0.05;
  const TEN_AT = IGNITE_AT + 0.18;
  const NAME_AT = TEN_AT + 0.78;
  const TAG_AT = NAME_AT + 0.5;

  const d = (s: number) => (reduce ? Math.min(s * 0.18, 0.4) : s);

  return (
    <motion.div
      className="fixed left-0 top-0 z-[200] h-[100dvh] w-screen overflow-hidden text-white"
      style={{ background: t.base }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduce ? 'none' : 'blur(12px)', scale: reduce ? 1 : 1.04 }}
      transition={{ duration: reduce ? 0.2 : 0.72, ease: SWOOSH }}
    >
      {/* ── Atmosphere: radial bloom + deep vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(circle at 50% 38%, ${t.glow}, transparent 42%)`,
            `radial-gradient(ellipse at 50% 120%, ${t.accent}1f, transparent 55%)`,
            `linear-gradient(180deg, ${t.base} 0%, #020406 60%, #000 100%)`,
          ].join(', '),
        }}
      />
      {/* Perspective grid floor */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] origin-bottom"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          transform: 'perspective(420px) rotateX(64deg)',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 70%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 70%)',
          opacity: 0.16,
        }}
        initial={{ opacity: 0, backgroundPositionY: '0px' }}
        animate={reduce ? { opacity: 0.12 } : { opacity: 0.16, backgroundPositionY: ['0px', '46px'] }}
        transition={reduce ? { duration: 0.3 } : { backgroundPositionY: { duration: 3.4, repeat: Infinity, ease: 'linear' }, opacity: { duration: 1 } }}
      />
      {/* Silver-arrow streak — a light trail flashing across on ignition */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute left-0 top-[24%] h-[3px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${t.secondary}e6 45%, ${t.accent}cc 55%, transparent)`,
            boxShadow: `0 0 22px ${t.glow}`,
          }}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ delay: d(0.2), duration: 1.3, ease: SWOOSH }}
        />
      )}

      {/* Scanline sweep on ignition */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 h-[34vh]"
          style={{ background: `linear-gradient(180deg, transparent, ${t.accent}22 60%, ${t.soft}55 92%, transparent)` }}
          initial={{ top: '-40vh', opacity: 0 }}
          animate={{ top: ['-40vh', '120vh'], opacity: [0, 0.9, 0] }}
          transition={{ delay: IGNITE_AT - 0.1, duration: 1.1, ease: SWOOSH }}
        />
      )}

      {/* ── HUD frame corners ── */}
      {([
        'left-5 top-5 border-l-2 border-t-2',
        'right-5 top-5 border-r-2 border-t-2',
        'left-5 bottom-5 border-l-2 border-b-2',
        'right-5 bottom-5 border-r-2 border-b-2',
      ]).map((c, i) => (
        <motion.div
          key={c}
          className={`absolute h-9 w-9 ${c}`}
          style={{ borderColor: `${t.accent}66` }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: d(0.15 + i * 0.06), duration: 0.5, ease: EASE }}
        />
      ))}

      {/* ── Top telemetry line ── */}
      <motion.div
        className="absolute left-6 right-6 top-8 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.34em]"
        style={{ color: `${t.soft}` }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: d(0.45), duration: 0.5, ease: EASE }}
      >
        <span>VEStriPPN // boot</span>
        <span className="hidden sm:inline" style={{ color: `${t.accent}` }}>{cycle.replace('_', ' ')}</span>
        <span>sys.online</span>
      </motion.div>

      {/* ── Center stage ── */}
      <div className="relative z-10 grid h-full place-items-center px-6">
        <div className="flex flex-col items-center">
          {/* W10 lockup */}
          <div className="flex items-center gap-[0.06em]" style={{ filter: `drop-shadow(0 0 30px ${t.glow})` }}>
            <svg
              viewBox="0 0 120 80"
              className="h-[clamp(70px,15vw,150px)] w-auto overflow-visible"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id={`wgrad-${livery}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={t.secondary} />
                  <stop offset="100%" stopColor={t.accent} />
                </linearGradient>
              </defs>
              {/* soft glow underlay */}
              <motion.path
                d={W_PATH}
                stroke={t.accent}
                strokeWidth={11}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'blur(7px)', opacity: 0.6 }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: TRACE_AT, duration: TRACE_DUR, ease: EASE }}
              />
              {/* crisp stroke */}
              <motion.path
                d={W_PATH}
                stroke={`url(#wgrad-${livery})`}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: TRACE_AT, duration: TRACE_DUR, ease: EASE }}
              />
              {/* traveling spark */}
              {!reduce && (
                <motion.circle
                  r={4}
                  fill="#ffffff"
                  style={{ filter: `drop-shadow(0 0 8px ${t.soft})` }}
                  initial={{ cx: 6, cy: 8, opacity: 0 }}
                  animate={{ cx: [6, 31, 60, 89, 114], cy: [8, 72, 30, 72, 8], opacity: [0, 1, 1, 1, 0] }}
                  transition={{ delay: TRACE_AT, duration: TRACE_DUR, times: [0, 0.25, 0.5, 0.75, 1], ease: 'linear' }}
                />
              )}
            </svg>

            {/* "11" expands in beside the W */}
            <div className="flex">
              {['1', '1'].map((n, i) => (
                <motion.span
                  key={n + i}
                  className="text-[clamp(64px,13.5vw,140px)] font-black leading-[0.8] tracking-[-0.04em]"
                  style={{ color: '#fff', textShadow: `0 0 32px ${t.glow}` }}
                  initial={{ opacity: 0, y: 26, filter: 'blur(10px)', scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  transition={{ delay: d(TEN_AT + i * 0.12), duration: reduce ? 0.2 : 0.6, ease: EASE }}
                >
                  {n}
                </motion.span>
              ))}
            </div>
          </div>

          {/* underline sweep */}
          <motion.div
            className="mt-5 h-[2px] w-[min(74vw,520px)] origin-center rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, ${t.secondary}, transparent)`, boxShadow: `0 0 22px ${t.glow}` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: d(TEN_AT + 0.32), duration: reduce ? 0.2 : 0.7, ease: SWOOSH }}
          />

          {/* livery wordmark resolves */}
          <div className="mt-6 flex overflow-hidden font-revolut text-[clamp(34px,8vw,82px)] font-bold leading-none">
            {chars.map((ch, i) => (
              <motion.span
                key={ch + i}
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(120deg, ${t.secondary} 0%, ${t.accent} 100%)`, filter: `drop-shadow(0 4px 26px ${t.glow})` }}
                initial={{ opacity: 0, y: '0.7em', rotateX: reduce ? 0 : -75 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: d(NAME_AT + i * 0.045), duration: reduce ? 0.2 : 0.62, ease: EASE }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          {/* tagline */}
          <motion.div
            className="mt-5 font-mono text-[10px] font-black uppercase tracking-[0.42em]"
            style={{ color: `${t.soft}` }}
            initial={{ opacity: 0, letterSpacing: '0.7em' }}
            animate={{ opacity: 0.78, letterSpacing: '0.42em' }}
            transition={{ delay: d(TAG_AT), duration: reduce ? 0.2 : 0.7, ease: EASE }}
          >
            {t.tagline}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom loader + status ── */}
      <div className="absolute inset-x-6 bottom-8">
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white/45">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: d(0.6), duration: 0.5 }}
            style={{ color: t.accent }}
          >
            W11 // {t.name}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.3, 0.8] }}
            transition={{ delay: d(0.6), duration: 2.4, repeat: Infinity }}
          >
            ▸ cockpit handoff
          </motion.span>
        </div>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.secondary})`, boxShadow: `0 0 14px ${t.glow}` }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: d(0.55), duration: reduce ? 0.3 : 4.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
