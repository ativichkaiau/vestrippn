'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from '../../components/Clock';
import ThemeToggle from '../../components/ThemeToggle';
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

const UPDATED = 'June 8, 2026';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'data', label: 'Data We Process' },
  { id: 'cookies', label: 'Cookies & Local Storage' },
  { id: 'sharing', label: 'Third Parties' },
  { id: 'rights', label: 'Your Choices & Rights' },
  { id: 'security', label: 'Security & Retention' },
  { id: 'terms', label: 'Terms of Use' },
  { id: 'medical', label: 'Medical Disclaimer' },
  { id: 'contact', label: 'Contact' },
];

export default function LegalConsole() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: false },
    { name: 'Research', icon: '◆', href: '/research', active: false },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: false },
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-cyan-500/30">

      {/* atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-12%] right-[6%] w-[52%] h-[52%] bg-gradient-to-br from-cyan-400/20 via-sky-400/15 to-blue-400/15 dark:from-cyan-600/15 dark:via-sky-600/10 dark:to-[#00A598]/10 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-12%] left-[2%] w-[44%] h-[44%] bg-gradient-to-tr from-indigo-400/15 to-cyan-300/15 dark:from-indigo-600/10 dark:to-teal-600/10 rounded-full blur-[120px] opacity-60"></div>
      </div>

      {/* header */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline"><span>VESTRIPPN</span><span className="text-cyan-500 dark:text-cyan-400 transition-colors duration-700">3.0</span></div>
          </Link>
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* sidebar */}
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'}`}>
          <nav className="space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} title={!isSidebarExpanded ? item.name : undefined} className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white`}>
                <span className="text-[18px] shrink-0 opacity-70 group-hover:opacity-100">{item.icon}</span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'}`}>
            {isSidebarExpanded ? <Clock /> : <span className="text-xl group-hover:rotate-12 transition-transform duration-300">⏱️</span>}
          </button>
        </aside>

        {/* main */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-12">
          <div className="max-w-[1100px] w-full mx-auto">

            {/* hero */}
            <div className="relative overflow-hidden rounded-[28px] lg:rounded-[40px] border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                Legal & Privacy Console
              </div>
              <h1 className="mt-5 text-[34px] sm:text-[46px] font-black leading-none tracking-tighter text-neutral-900 dark:text-white">
                Privacy, Terms &amp; Disclaimers
              </h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-[15px] font-medium leading-7 text-neutral-600 dark:text-neutral-400">
                VESTRIPPN 3.0 is a personal, cloud-integrated operating platform for medical study, research, fitness, and workflow automation. This page explains what data it processes, how it is handled, and the terms for using it.
              </p>
              <div className="mt-5 text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Last updated · {UPDATED}</div>
            </div>

            {/* table of contents */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 px-3 py-2.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-white/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  {s.label}
                </a>
              ))}
            </div>

            <div className="mt-8 space-y-5">
              <Section id="overview" title="Overview">
                <P>VESTRIPPN 3.0 (&ldquo;the platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated as a personal project by its sole operator. It is built for the operator&rsquo;s own academic and operational use and may be shared with a limited audience. By accessing the platform you agree to the practices and terms below.</P>
                <P>If you do not agree with any part of this document, please discontinue use. We may update this page from time to time; the &ldquo;Last updated&rdquo; date above reflects the current version.</P>
              </Section>

              <Section id="privacy" title="Privacy Policy">
                <P>We collect only the data needed to run the platform&rsquo;s features and to keep your account secure. We do not sell personal data, and we do not use it for advertising.</P>
                <H>Account &amp; authentication</H>
                <Ul items={[
                  'Sign-in is handled by NextAuth. You may authenticate with Google, LINE, or an email-and-password credential.',
                  'For social sign-in we receive your name, email address, profile image, and a provider account identifier from Google or LINE.',
                  'For email-and-password sign-in, your password is stored only as a salted hash — never in plain text.',
                  'Session and account records are kept to keep you signed in and to associate your data with your account.',
                ]} />
              </Section>

              <Section id="data" title="Data We Process">
                <P>Depending on which features you use, the platform may store the following in its database:</P>
                <Ul items={[
                  'Academic telemetry — tasks, daily command notes, exam/milestone tracking, Canvas-derived subjects and metrics, and IELTS modules and items.',
                  'Spaced-repetition stats — Anki review counts, due/new cards, and streaks you sync or enter.',
                  'Research data — saved literature extractions, DOIs and citation details, and research project records.',
                  'Clinical study data — clinical case progress, attempts, and usage counts for learning features.',
                  'Fitness logs — training entries and streak data you record.',
                  'AI assistant content — chat threads and messages created when you use AI-assisted features.',
                  'Notifications and study documents you create or upload, including extracted text chunks used for search.',
                ]} />
                <P>This data is provided by you or generated by your activity. You may choose not to use a feature, in which case its data is not created.</P>
              </Section>

              <Section id="cookies" title="Cookies & Local Storage">
                <P>We use a small number of strictly necessary cookies to keep you signed in (session and authentication cookies set by NextAuth). These are required for the platform to function and are not used for tracking or advertising.</P>
                <P>Your browser&rsquo;s local storage holds your display preferences on your device only — for example the selected livery, day/night mode, low-power mode, and Focus-Mode personal-best lap times. This information stays in your browser and is not transmitted to the server.</P>
              </Section>

              <Section id="sharing" title="Third Parties">
                <P>The platform relies on a few service providers to deliver its features. Data is shared with them only to the extent needed for the relevant function:</P>
                <Ul items={[
                  'Identity providers (Google, LINE) — used only to authenticate you.',
                  'Hosting and database infrastructure — used to run the application and store your records securely.',
                  'AI provider (Anthropic Claude) — used to power AI-assisted features; relevant content is sent only when you use those features.',
                  'Research data sources (e.g. PubMed, Europe PMC, Crossref, Scopus, ScienceDirect, Scholar, ClinicalKey) and your learning-management system (Canvas) — queried to retrieve the information you request.',
                ]} />
                <P>Each provider handles data under its own terms and privacy policy. We do not share your personal data with third parties for their own marketing.</P>
              </Section>

              <Section id="rights" title="Your Choices & Rights">
                <P>You can review and manage much of your information directly inside the platform. You may also request to access, correct, export, or delete the personal data associated with your account, and you can withdraw consent or close your account at any time.</P>
                <P>To make a request, use the contact details below. We will respond within a reasonable time and may need to verify your identity first.</P>
              </Section>

              <Section id="security" title="Security & Retention">
                <P>We apply reasonable technical and organizational measures to protect your data, including encrypted transport (HTTPS), hashed passwords, and access controls. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.</P>
                <P>We retain data for as long as your account is active or as needed to provide the platform. When data is no longer required, or upon a valid deletion request, we remove it or anonymize it.</P>
              </Section>

              <Section id="terms" title="Terms of Use">
                <Ul items={[
                  'The platform is provided on an “as is” and “as available” basis, without warranties of any kind. To the maximum extent permitted by law, the operator is not liable for any damages arising from its use.',
                  'You are responsible for activity under your account and for keeping your credentials secure.',
                  'Use the platform lawfully. Do not attempt to disrupt it, access other users’ data, reverse-engineer it, or misuse its automation or AI features.',
                  'All branding, code, design, and original content are the property of the operator unless otherwise noted. Third-party names, trademarks, and data belong to their respective owners.',
                  'We may modify, suspend, or discontinue any part of the platform, and may update these terms, at any time. Continued use after changes means you accept the updated terms.',
                ]} />
              </Section>

              <Section id="medical" title="Medical Disclaimer">
                <P>The platform includes medical study material such as clinical cases, mock exams, and reference content. This material is for education and personal study only. It is <strong>not medical advice</strong> and must not be used to diagnose, treat, or make decisions about any real patient.</P>
                <P>AI-assisted outputs can be incomplete or incorrect and should always be verified against authoritative clinical sources and professional judgment. Always defer to qualified supervisors, institutional guidelines, and licensed clinical practice.</P>
              </Section>

              <Section id="contact" title="Contact">
                <P>Questions about privacy, your data, or these terms can be sent to the platform operator. For data requests, please describe what you would like to access, correct, export, or delete.</P>
                <div className="mt-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-[13px] font-bold text-cyan-700 dark:text-cyan-300">
                  Operator contact · <a className="underline decoration-dotted underline-offset-2" href="mailto:ativich_2549@yahoo.com">ativich_2549@yahoo.com</a>
                </div>
              </Section>

              <p className="px-1 pt-4 text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
                This document is provided for transparency and is not legal advice. For a binding policy tailored to your jurisdiction and obligations, have it reviewed by a qualified professional.
              </p>

              <div className="pt-2">
                <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black px-5 py-3 text-[12px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[24px] border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-colors duration-700">
      <h2 className="flex items-center gap-3 text-[15px] sm:text-[17px] font-black tracking-tight text-neutral-900 dark:text-white">
        <span className="w-1.5 h-5 rounded-full bg-cyan-500" />
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] sm:text-[14px] leading-7 text-neutral-600 dark:text-neutral-400">{children}</p>;
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-1 text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{children}</h3>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[13px] sm:text-[14px] leading-7 text-neutral-600 dark:text-neutral-400">
          <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/70" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
