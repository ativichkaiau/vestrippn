'use client';

/* ════════════════════════════════════════════════════════════════════════
   W09 HUB HERO — cockpit-style intro used by all seven hubs.
   Structure: system strip (hub badge · eyebrow · ops · signature · status)
   → title zone (gradient headline, description, CTAs, chips)
   → telemetry stack (ticking metrics, capability rows, status footer).
   Same props API as the W08 version, so hub pages need no changes.
   ════════════════════════════════════════════════════════════════════════ */

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import HubSignature, { type HubKey } from './HubSignature';
import TickNumber from './TickNumber';

/* W09 per-hub accents (Tailwind classes so liveries can remap them) */
const HUB_ACCENT: Record<HubKey, { dot: string; grad: string; text: string; chipBg: string; icon: string }> = {
  academics: { dot: 'bg-blue-400', grad: 'from-blue-400 to-cyan-400', text: 'text-blue-300', chipBg: 'bg-blue-400/15', icon: '▲' },
  research: { dot: 'bg-cyan-400', grad: 'from-cyan-400 to-teal-400', text: 'text-cyan-300', chipBg: 'bg-cyan-400/15', icon: '◆' },
  fitness: { dot: 'bg-rose-400', grad: 'from-rose-400 to-orange-300', text: 'text-rose-300', chipBg: 'bg-rose-400/15', icon: '◈' },
  tools: { dot: 'bg-amber-400', grad: 'from-amber-400 to-yellow-300', text: 'text-amber-300', chipBg: 'bg-amber-400/15', icon: '⚙' },
  archive: { dot: 'bg-purple-400', grad: 'from-purple-400 to-fuchsia-400', text: 'text-purple-300', chipBg: 'bg-purple-400/15', icon: '▥' },
  identity: { dot: 'bg-teal-400', grad: 'from-teal-400 to-cyan-400', text: 'text-teal-300', chipBg: 'bg-teal-400/15', icon: '⚇' },
  ielts: { dot: 'bg-indigo-400', grad: 'from-indigo-400 to-purple-400', text: 'text-indigo-300', chipBg: 'bg-indigo-400/15', icon: '◎' },
};

type HubIntroMetric = {
  label: string;
  value: string;
};

type HubIntroCapability = {
  icon: string;
  title: string;
  desc: string;
};

type HubIntroProps = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  chips: string[];
  panelTitle: string;
  panelSubtitle: string;
  metrics: HubIntroMetric[];
  capabilities: HubIntroCapability[];
  hub?: HubKey;
};

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function IntroAction({
  href,
  children,
  variant,
}: {
  href: string;
  children: ReactNode;
  variant: 'primary' | 'secondary';
}) {
  const className =
    variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-[12px] font-black uppercase tracking-widest text-slate-950 transition-transform hover:-translate-y-0.5 active:scale-95'
      : 'inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-[12px] font-black uppercase tracking-widest text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/15 active:scale-95';

  const style =
    variant === 'primary'
      ? { boxShadow: '0 18px 36px rgba(var(--hub-accent-rgb), 0.22)' }
      : undefined;

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export default function HubIntro({
  eyebrow,
  title,
  titleAccent,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  chips,
  panelTitle,
  panelSubtitle,
  metrics,
  capabilities,
  hub,
}: HubIntroProps) {
  const acc = hub ? HUB_ACCENT[hub] : null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[32px] border border-white/10 px-5 py-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:rounded-[40px] lg:px-10 lg:py-9"
      style={{ backgroundColor: 'var(--hub-bg)' }}
    >
      {/* atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 18%, rgba(var(--hub-accent-rgb), 0.32), transparent 32%), radial-gradient(circle at 82% 20%, rgba(var(--hub-secondary-rgb), 0.28), transparent 28%), linear-gradient(180deg, rgba(var(--hub-grad-rgb), 0.25), rgba(0, 0, 0, 0.62))',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse at top, #000 20%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, #000 20%, transparent 72%)',
        }}
      />
      {/* hub-colored hairline — the W09 color signature of the page */}
      {acc && <span className={`absolute left-8 top-0 h-[3px] w-28 rounded-b-full opacity-90 sm:left-12 ${acc.dot}`} />}

      {/* cockpit corner brackets */}
      <span className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-white/15" />
      <span className="pointer-events-none absolute right-3.5 top-3.5 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-white/15" />
      <span className="pointer-events-none absolute bottom-3.5 left-3.5 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-white/15" />
      <span className="pointer-events-none absolute bottom-3.5 right-3.5 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-white/15" />

      <div className="relative z-10">
        {/* ── SYSTEM STRIP ── */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-white/10 pb-5">
          <div className="flex min-w-0 items-center gap-3 text-left">
            {acc && (
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[17px] ${acc.chipBg} ${acc.text}`}>
                {acc.icon}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">{eyebrow}</div>
              <div className="mt-0.5 truncate text-[13px] font-black tracking-tight">{panelTitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 md:block">
              {panelSubtitle}
            </span>
            {hub && <HubSignature hub={hub} />}
            <span
              className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(var(--hub-accent-rgb), 0.15)', color: 'var(--hub-text-soft-2)' }}
            >
              Online
            </span>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* title zone */}
          <div className="text-center lg:text-left">
            <h1 className="mx-auto max-w-4xl text-[34px] font-black leading-[0.95] tracking-tighter sm:text-[52px] lg:mx-0 lg:text-[64px]">
              {title}{' '}
              {acc ? (
                <span className={`bg-gradient-to-r bg-clip-text text-transparent ${acc.grad}`}>{titleAccent}</span>
              ) : (
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(120deg, var(--hub-accent) 0%, var(--hub-accent-deep) 100%)' }}
                >
                  {titleAccent}
                </span>
              )}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px] lg:mx-0">
              {description}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <IntroAction href={primaryHref} variant="primary">
                {primaryLabel}
              </IntroAction>
              {secondaryHref && secondaryLabel && (
                <IntroAction href={secondaryHref} variant="secondary">
                  {secondaryLabel}
                </IntroAction>
              )}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 lg:justify-start">
              {chips.map((label) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <span
                    className={`h-1 w-1 rounded-full ${acc ? acc.dot : ''}`}
                    style={acc ? undefined : { backgroundColor: 'var(--hub-accent)' }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* telemetry stack */}
          <div className="relative">
            <div
              className="absolute -inset-8 rounded-[36px] blur-3xl"
              style={{ backgroundColor: 'rgba(var(--hub-accent-rgb), 0.10)' }}
            />
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              {/* ticking metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-center">
                    <div className={`truncate text-[17px] font-black tabular-nums leading-tight ${acc ? acc.text : 'text-white'}`}>
                      <TickNumber value={metric.value} />
                    </div>
                    <div className="mt-1 truncate text-[8px] font-black uppercase tracking-widest text-slate-500">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* capability rows */}
              <div className="mt-3 space-y-2">
                {capabilities.map((card) => (
                  <div key={card.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-3 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">{card.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[12px] font-black tracking-tight">{card.title}</div>
                      <div className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-4 text-slate-400">{card.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* status footer */}
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/20 px-3.5 py-2">
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">Hub Telemetry</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1 w-1 animate-pulse rounded-full ${acc ? acc.dot : ''}`}
                    style={acc ? undefined : { backgroundColor: 'var(--hub-accent)' }}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nominal</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
