'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle"; 
import TodaysCommand from "../components/TodaysCommand";
import NotificationCenter from '../components/NotificationCenter';
import ArcDate from '../components/ArcDate';
import DomainHealth from '../components/DomainHealth';
import QuickAccess from "../components/QuickAccess";
import Reminders from '../components/Reminders';
import AcademicsCard from '../components/AcademicsCard';
import ResearchCard from '../components/ResearchCard';
import FitnessCard from '../components/FitnessCard';
import IdentityAnchor from '../components/IdentityAnchor';
import TopNavProfile from '../components/TopNavProfile';
import { NavRail, MobileHubNav } from '../components/HubNav';
import TickNumber from '../components/TickNumber';
import CockpitIntelligencePanel from '../components/CockpitIntelligencePanel';
import BrandMark from '../components/BrandMark';
import SignatureIntro from '../components/SignatureIntro';
import { WilliamsIntro, SennaIntro, VerstappenIntro, FerrariIntro } from '../components/LiveryIntros';
import Link from 'next/link';

type SiteLivery = 'normal' | 'monza' | 'senna' | 'verstappen' | 'ferrari';
type DashboardTask = { id: string; title: string; completed: boolean; category: string };
type DashboardResearch = { title?: string; screening?: number; fullText?: number; extraction?: number };
type DashboardFitness = { workoutDays?: string; lastWorkout?: string; streak?: number };
type DashboardNotification = { id: string; source: 'CANVAS' | 'GMAIL' | string; title: string; message: string; time: string };

// --- ADD THE PROPS INTERFACE ---
interface DashboardProps {
  cloudCommand: string;
  cloudTasks: DashboardTask[];
  cloudResearch?: DashboardResearch | null;
  cloudFitness?: DashboardFitness | null;
  cloudNotifications?: DashboardNotification[];
}

// --- RECEIVE THE PROPS FROM THE SERVER ---
export default function DashboardClient({ cloudCommand, cloudTasks, cloudResearch, cloudFitness, cloudNotifications }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cycle, setCycle] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [livery, setLivery] = useState<SiteLivery>('normal');
  const pendingTaskCount = Array.isArray(cloudTasks) ? cloudTasks.filter((task) => !task.completed).length : 0;

  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setIsMounted(true);
      const currentHour = new Date().getHours();
      setCycle(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');

      // Pick livery before showing intro so special variants can swap in.
      try {
        const stored = localStorage.getItem('vest_livery');
        setLivery(stored === 'monza' || stored === 'senna' || stored === 'verstappen' || stored === 'ferrari' ? stored : 'normal');
      } catch {}

      // Boot sequence plays on every page load.
      setShowIntro(true);
    }, 0);

    return () => {
      window.clearTimeout(mountTimer);
    };
  }, []);

  useEffect(() => {
    if (!showIntro) return undefined;
    const hideIntroTimer = window.setTimeout(() => setShowIntro(false), 7000);
    return () => window.clearTimeout(hideIntroTimer);
  }, [showIntro]);

  if (!isMounted) return <LoadingScreen />;

  const platformModules = [
    { title: 'Academics', href: '/academics', icon: '📚', desc: 'Class command, exams, cases, and study telemetry in one place.', stat: 'MedCMU OS' },
    { title: 'Research', href: '/research', icon: '🔬', desc: 'Federated literature search, saved extractions, and SRMA workflow tools.', stat: 'Multi-source' },
    { title: 'Fitness', href: '/fitness', icon: '🏃', desc: 'Training cadence, streaks, and body-system discipline tracking.', stat: 'Streak ready' },
    { title: 'Archive', href: '/archive', icon: '▥', desc: 'A vault for notes, olympiad prep, clinical apps, and system architecture.', stat: 'Indexed' },
    { title: 'Tools', href: '/tools', icon: '⚙', desc: 'Planner embeds, MSCA hub, and fast-launch utilities for daily ops.', stat: 'Tool hub' },
    { title: 'Identity', href: '/identity', icon: '⚇', desc: 'The operator profile: story, achievements, values, and trajectory.', stat: 'Signal' },
  ];

  const capabilityCards = [
    { title: 'Clinical Intelligence', icon: '🩺', desc: 'Interactive cases, mock exams, and medical reasoning surfaces built for repetition.' },
    { title: 'Research Acceleration', icon: '📡', desc: 'PubMed, Europe PMC, Crossref, Scopus, ScienceDirect, Scholar, and ClinicalKey all orbit one search flow.' },
    { title: 'Personal Telemetry', icon: '🏁', desc: 'Academic, research, fitness, archive, and identity data wrapped into a single cockpit.' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">

      <AnimatePresence>
        {showIntro && (
          livery === 'monza'
            ? <WilliamsIntro cycle={cycle} />
            : livery === 'senna'
              ? <SennaIntro cycle={cycle} />
              : livery === 'verstappen'
                ? <VerstappenIntro cycle={cycle} />
                : livery === 'ferrari'
                  ? <FerrariIntro cycle={cycle} />
                  : <SignatureIntro livery="normal" cycle={cycle} />
        )}
      </AnimatePresence>

      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-blue-400/30 via-indigo-400/25 to-fuchsia-400/20 dark:from-blue-600/20 dark:via-indigo-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-pink-400/25 via-rose-400/20 to-teal-300/25 dark:from-purple-600/15 dark:via-pink-600/10 dark:to-teal-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[28%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-amber-300/20 to-cyan-300/25 dark:from-amber-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000 animate-float-slow"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[64px] lg:h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95"
            title="Toggle Telemetry Panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
            </svg>
          </button>

          <BrandMark compact />
        </div>

        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[11px] tracking-tight text-neutral-400 dark:text-neutral-500 transition-colors duration-700">
             <ArcDate />
          </div>
          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block transition-colors duration-700"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- RETRACTABLE DESKTOP SIDEBAR --- */}
        <NavRail active="Dashboard" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 lg:p-8 pb-32 lg:pb-8 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-8 lg:space-y-12">
            
            {/* PRODUCT INTRO HERO */}
            <motion.section
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="dark w10-clay-hero relative overflow-hidden rounded-[32px] lg:rounded-[44px] border border-white/10 px-5 py-7 text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
              style={{ backgroundColor: 'var(--hub-bg)' }}
              data-motion="hero"
              data-no-typewriter
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

              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="text-center lg:text-left">
                  <div
                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-xl"
                    style={{ color: 'var(--hub-text-soft)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--hub-accent)', boxShadow: '0 0 14px rgba(var(--hub-accent-rgb), 0.8)' }}
                    />
                    W11 <span className="font-revolut font-semibold">EQ Future</span> · Silver Arrow Cockpit
                  </div>

                  <h1 className="mx-auto max-w-4xl text-[38px] font-black leading-[0.95] tracking-tighter sm:text-[58px] lg:mx-0 lg:text-[72px]">
                    Meet the cockpit behind{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(120deg, var(--hub-accent) 0%, var(--hub-accent-deep) 100%)' }}
                    >
                      VESTRIPPN 3.0
                    </span>
                  </h1>

                  <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base lg:mx-0">
                    A cloud-integrated command center for medical school, research, fitness, archive systems, and AI-assisted daily operations — built to make every part of the work visible, fast, and beautifully navigable.
                  </p>

                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                    <Link
                      href="/academics"
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-[12px] font-black uppercase tracking-widest text-slate-950 transition-transform hover:-translate-y-0.5 active:scale-95"
                      style={{ boxShadow: '0 18px 36px rgba(var(--hub-accent-rgb), 0.22)' }}
                    >
                      Start Exploring
                    </Link>
                    <Link href="/research" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-[12px] font-black uppercase tracking-widest text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/15 active:scale-95">
                      Research Hub ↗
                    </Link>
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 lg:justify-start">
                    {['Medical OS', 'SRMA Engine', 'Clinical Cases', 'Master Planner'].map((label) => (
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
                  <div className="dark w10-clay-dark-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl" data-w10-tone="dark">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Live Command</p>
                        <h2 className="mt-1 text-lg font-black tracking-tight">Operator Dashboard</h2>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                        style={{ backgroundColor: 'rgba(var(--hub-accent-rgb), 0.15)', color: 'var(--hub-text-soft-2)' }}
                      >
                        {cycle}
                      </span>
                    </div>

                    <TodaysCommand initialTasks={cloudTasks} />

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        ['Domains', '8'],
                        ['Version', 'W11'],
                        ['Pending', `${pendingTaskCount}`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</div>
                          <div className="mt-1 truncate text-sm font-black tabular-nums text-white"><TickNumber value={value} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <CockpitIntelligencePanel
              hub="dashboard"
              contextItems={[
                { label: 'Current mission', value: cloudCommand || 'Daily command' },
                { label: 'Pending tasks', value: `${pendingTaskCount}` },
                { label: 'Research', value: cloudResearch?.title || 'SRMA pipeline' },
              ]}
            />

            {/* PLATFORM INTRO MODULES */}
            <motion.section
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-2 px-1 text-center sm:text-left">
                <h2 className="text-[22px] font-black tracking-tight text-neutral-900 dark:text-white sm:text-[28px]">Everything inside one command platform</h2>
                <p className="max-w-2xl text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">
                  Pick a module and drop straight into the part of the system you need. Each hub keeps its own workflow, but the dashboard keeps the whole machine in view.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {platformModules.map((module, i) => (
                  <motion.div
                    key={module.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 + i * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
                    whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 48px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  >
                    <Link href={module.href} className="group block h-full overflow-hidden rounded-[24px] border border-black/5 bg-white/60 p-5 shadow-[0_8px_28px_rgba(0,0,0,0.035)] backdrop-blur-xl backdrop-saturate-150 transition-colors hover:bg-white/90 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 dark:bg-white/10">{module.icon}</span>
                        <span className="rounded-full border border-black/5 bg-white/60 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:border-white/10 dark:bg-white/5 dark:text-neutral-500">{module.stat}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-black tracking-tight text-neutral-900 dark:text-white">{module.title}</h3>
                      <p className="mt-2 min-h-[48px] text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">{module.desc}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--hub-accent)' }}>Open module</span>
                        <span className="text-neutral-300 transition-transform group-hover:translate-x-1 dark:text-neutral-600">→</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* INTELLIGENCE LAYER */}
            <motion.section
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="dark w10-clay-dark-panel overflow-hidden rounded-[32px] border border-black/5 bg-neutral-950 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)] dark:border-white/10 sm:p-7 lg:p-8"
              data-w10-tone="dark"
            >
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--hub-text-soft-2)' }}>What powers the system</p>
                  <h2 className="mt-3 text-[28px] font-black leading-tight tracking-tight sm:text-[36px]">
                    Designed for speed, memory, and control.
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-400">
                    VESTRIPPN is not a landing page wrapped around links. It is a working cockpit: clinical training, research engines, planning surfaces, and personal telemetry stitched together.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {capabilityCards.map((card) => (
                    <div key={card.title} className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl">{card.icon}</div>
                      <h3 className="text-sm font-black tracking-tight">{card.title}</h3>
                      <p className="mt-2 text-xs font-medium leading-5 text-slate-400">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* THE COMPACT BENTO BOX GRID */}
            <motion.div
              id="command-center"
              className="flex flex-col gap-4 lg:gap-6"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
            >
              <div className="flex flex-col gap-2 px-1 text-center sm:text-left">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-white/5 dark:text-neutral-500 sm:mx-0">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--hub-accent)', boxShadow: '0 0 12px rgba(var(--hub-accent-rgb), 0.65)' }} />
                  Live cockpit
                </div>
                <h2 className="text-[22px] font-black tracking-tight text-neutral-900 dark:text-white sm:text-[28px]">Today’s command center</h2>
                <p className="max-w-2xl text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">
                  Your active academic, research, fitness, reminders, notifications, and identity surfaces stay below the introduction for everyday operation.
                </p>
              </div>

              {/* ROW 1: PRIMARY FOCUS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                  whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 48px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col rounded-[24px] lg:rounded-[32px] bg-white/60 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(255,255,255,0.02)] border border-black/5 dark:border-white/5 cursor-default"
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm transition-colors duration-700">📚</div>
                    <h2 className="font-bold text-[18px] tracking-tight">Academic Overview</h2>
                  </div>
                  <AcademicsCard />
                </motion.div>

                <motion.div
                  variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                  whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 48px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col rounded-[24px] lg:rounded-[32px] bg-white/55 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/5 cursor-default"
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-neutral-700 dark:text-white text-sm transition-colors duration-700">🔬</div>
                    <h2 className="font-bold text-[18px] tracking-tight text-neutral-900 dark:text-white transition-colors duration-700">Research Ops</h2>
                  </div>
                  <div className="flex-1 flex flex-col text-neutral-700 dark:text-neutral-200 transition-colors duration-700">
                    <ResearchCard
                       initialTitle={cloudResearch?.title}
                       initialStats={cloudResearch ? {
                         screening: cloudResearch.screening ?? 0,
                         fullText: cloudResearch.fullText ?? 0,
                         extraction: cloudResearch.extraction ?? 0
                       } : undefined}
                    />
                  </div>
                </motion.div>
              </div>

              {/* ROW 2: SECONDARY FOCUS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                  whileHover={{ y: -6, boxShadow: '0 20px 48px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  className="lg:col-span-8 flex flex-col rounded-[24px] lg:rounded-[32px] bg-white/60 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 border border-black/5 dark:border-white/5 p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-colors duration-700 h-full cursor-default"
                >
                  <FitnessCard
                    initialWorkoutDays={cloudFitness?.workoutDays ? JSON.parse(cloudFitness.workoutDays) : undefined}
                    initialLastWorkout={cloudFitness?.lastWorkout}
                    initialStreak={cloudFitness?.streak}
                  />
                </motion.div>

                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                    whileHover={{ y: -5, boxShadow: '0 16px 40px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                    className="flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 border border-black/5 dark:border-white/5 rounded-[24px] lg:rounded-[32px] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-colors duration-700 cursor-default"
                  >
                    <h3 className="font-bold text-[14px] tracking-tight mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--hub-accent)' }}></span> Domain Health
                    </h3>
                    <DomainHealth />
                  </motion.div>
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                    whileHover={{ y: -5, boxShadow: '0 16px 40px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                    className="flex-1 flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 border border-black/5 dark:border-white/5 rounded-[24px] lg:rounded-[32px] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-colors duration-700 cursor-default"
                  >
                    <Reminders initialTasks={cloudTasks} />
                  </motion.div>
                </div>
              </div>

              {/* ROW 3: UTILITY FOOTER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {[<QuickAccess key="qa" />, <NotificationCenter key="nc" initialNotifications={cloudNotifications} />, <IdentityAnchor key="ia" />].map((child, i) => (
                  <motion.div
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                    whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col h-full rounded-[24px] lg:rounded-[32px] bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 lg:p-6 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_20px_rgb(0,0,0,0.02)] cursor-default"
                  >
                    {child}
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>
        </main>

        {/* --- MOBILE-ONLY FLOATING NAVIGATION HUD --- */}
        <MobileHubNav active="Dashboard" />

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LOADING SCREEN — brief pre-mount state
   ════════════════════════════════════════════════════════════ */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#FAFAFA] dark:bg-[#050505] transition-colors duration-700">
      <div className="relative flex flex-col items-center gap-6">
        <div
          className="absolute -inset-10 rounded-full blur-3xl opacity-40 dark:opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(var(--hub-accent-rgb),0.38), rgba(var(--hub-secondary-rgb),0.20) 45%, transparent 72%)' }}
        />
        <motion.div
          className="relative w-14 h-14 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center text-[26px] font-black"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          V
        </motion.div>
        <div className="relative h-[3px] w-32 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-1/3 rounded-full"
            style={{ background: 'linear-gradient(90deg,var(--hub-accent),var(--hub-accent-deep))' }}
            animate={{ x: ['-120%', '380%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}

