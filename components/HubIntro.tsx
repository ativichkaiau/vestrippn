'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

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
}: HubIntroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[32px] lg:rounded-[44px] border border-white/10 px-5 py-7 text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
      style={{ backgroundColor: 'var(--hub-bg)' }}
    >
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

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="text-center lg:text-left">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-xl"
            style={{ color: 'var(--hub-text-soft)' }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--hub-accent)', boxShadow: '0 0 14px rgba(var(--hub-accent-rgb), 0.8)' }}
            />
            {eyebrow}
          </div>

          <h1 className="mx-auto max-w-4xl text-[38px] font-black leading-[0.95] tracking-tighter sm:text-[58px] lg:mx-0 lg:text-[72px]">
            {title}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(120deg, var(--hub-accent) 0%, var(--hub-accent-deep) 100%)' }}
            >
              {titleAccent}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base lg:mx-0">
            {description}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <IntroAction href={primaryHref} variant="primary">
              {primaryLabel}
            </IntroAction>
            {secondaryHref && secondaryLabel && (
              <IntroAction href={secondaryHref} variant="secondary">
                {secondaryLabel}
              </IntroAction>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 lg:justify-start">
            {chips.map((label) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--hub-accent)' }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-8 rounded-[36px] blur-3xl"
            style={{ backgroundColor: 'rgba(var(--hub-accent-rgb), 0.10)' }}
          />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{panelSubtitle}</p>
                <h2 className="mt-1 text-lg font-black tracking-tight">{panelTitle}</h2>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(var(--hub-accent-rgb), 0.15)', color: 'var(--hub-text-soft-2)' }}
              >
                Online
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{metric.label}</div>
                  <div className="mt-1 truncate text-sm font-black text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              {capabilities.map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">{card.icon}</span>
                    <div>
                      <h3 className="text-sm font-black tracking-tight">{card.title}</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-400">{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
