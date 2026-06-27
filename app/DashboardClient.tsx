'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
import Link from 'next/link';

type SiteLivery = 'normal' | 'monza' | 'senna' | 'verstappen';
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
        setLivery(stored === 'monza' || stored === 'senna' || stored === 'verstappen' ? stored : 'normal');
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
            ? <WilliamsIntroOverlay cycle={cycle} />
            : livery === 'senna'
              ? <SennaIntroOverlay cycle={cycle} />
              : livery === 'verstappen'
                ? <VerstappenIntroOverlay cycle={cycle} />
                : <IntroOverlay cycle={cycle} />
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
              className="w10-clay-hero relative overflow-hidden rounded-[32px] lg:rounded-[44px] border border-white/10 px-5 py-7 text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
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
                    W10 EQ Power · Clay Cockpit
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
                  <div className="w10-clay-dark-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl" data-w10-tone="dark">
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
                        ['Version', 'W10'],
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
              className="w10-clay-dark-panel overflow-hidden rounded-[32px] border border-black/5 bg-neutral-950 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)] dark:border-white/10 sm:p-7 lg:p-8"
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

function IntroPhaseRail({
  phases,
  accent,
  halo,
}: {
  phases: { label: string; value: string }[];
  accent: string;
  halo: string;
}) {
  return (
    <motion.div
      className="mt-7 grid w-full max-w-2xl grid-cols-1 border border-white/10 bg-white/10 sm:grid-cols-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {phases.map((phase, i) => (
        <motion.div
          key={phase.label}
          className="min-w-0 bg-black/45 px-3 py-2.5 text-left backdrop-blur-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.65 + i * 0.08, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-mono text-[8px] font-black uppercase tracking-[0.22em] text-white/38">{phase.label}</div>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] font-black uppercase text-white">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: accent, boxShadow: `0 0 18px ${halo}` }}
            />
            <span className="truncate">{phase.value}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

type RaceIntroTheme = {
  id: 'w10' | 'williams' | 'senna' | 'verstappen';
  title: string;
  chassis: string;
  eyebrow: string;
  mode: string;
  subtitle: string;
  bg: string;
  accent: string;
  secondary: string;
  tertiary: string;
  softText: string;
  halo: string;
  stripe: string;
  metrics: { label: string; value: string }[];
  phases: { label: string; value: string }[];
  status: (cycle: string) => string[];
};

const RACE_INTROS: Record<RaceIntroTheme['id'], RaceIntroTheme> = {
  w10: {
    id: 'w10',
    title: 'W10 EQ POWER',
    chassis: 'VEStriPPN 3.0',
    eyebrow: 'Grid Launch Sequence',
    mode: 'Carbon Silver Petronas',
    subtitle: 'Cockpit online for mission, study, research, and planner handoff.',
    bg: '#030506',
    accent: '#00d2be',
    secondary: '#d9e2ea',
    tertiary: '#6be6ff',
    softText: '#b9fff4',
    halo: 'rgba(0,210,190,0.58)',
    stripe: 'linear-gradient(90deg, transparent, rgba(217,226,234,0.92), rgba(0,210,190,0.88), transparent)',
    metrics: [
      { label: 'ERS', value: 'DEPLOY' },
      { label: 'DRS', value: 'READY' },
      { label: 'TYRE', value: 'WINDOW' },
    ],
    phases: [
      { label: 'Pit Wall', value: 'Mission map' },
      { label: 'Power Unit', value: 'Planner queue' },
      { label: 'Telemetry', value: 'Hub sync' },
    ],
    status: (cycle) => [
      'FIVE LIGHTS HOLDING',
      'ERS DEPLOYMENT MAP LOADED',
      'TYRE WINDOW AND BRAKE BIAS LOCKED',
      `${cycle} // LIGHTS OUT TO W10`,
    ],
  },
  williams: {
    id: 'williams',
    title: 'WILLIAMS FW18',
    chassis: 'VEStriPPN Heritage',
    eyebrow: 'Pit Wall Release',
    mode: 'Navy White Gold Red',
    subtitle: 'A premium heritage livery handoff with clean race-control precision.',
    bg: '#070216',
    accent: '#c59955',
    secondary: '#ffffff',
    tertiary: '#d5172d',
    softText: '#f3e3c6',
    halo: 'rgba(197,153,85,0.62)',
    stripe: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.92), rgba(197,153,85,0.88), rgba(213,23,45,0.74), transparent)',
    metrics: [
      { label: 'GARAGE', value: 'CLEAR' },
      { label: 'RADIO', value: 'CHECK' },
      { label: 'LIVERY', value: 'FW18' },
    ],
    phases: [
      { label: 'Pit Wall', value: 'Release window' },
      { label: 'Heritage', value: 'Stripe armed' },
      { label: 'Cockpit', value: 'Mission ready' },
    ],
    status: (cycle) => [
      'GANTRY LIGHTS SET',
      'PIT WALL RADIO CHECK COMPLETE',
      'HERITAGE STRIPE AND OUT-LAP MAP ARMED',
      `${cycle} // WILLIAMS OUT-LAP`,
    ],
  },
  senna: {
    id: 'senna',
    title: 'SENNA S1',
    chassis: 'VEStriPPN Focus',
    eyebrow: 'Qualifying Run',
    mode: 'Helmet Yellow Green Blue',
    subtitle: 'Apex-first focus mode with rapid telemetry and clean handoff.',
    bg: '#061329',
    accent: '#ffd400',
    secondary: '#00a651',
    tertiary: '#1f6feb',
    softText: '#fff3b8',
    halo: 'rgba(255,212,0,0.60)',
    stripe: 'linear-gradient(90deg, transparent, rgba(255,212,0,0.96), rgba(0,166,81,0.76), rgba(31,111,235,0.82), transparent)',
    metrics: [
      { label: 'APEX', value: 'TRACE' },
      { label: 'THROTTLE', value: 'CLEAN' },
      { label: 'FOCUS', value: 'Q-LAP' },
    ],
    phases: [
      { label: 'Helmet Band', value: 'Locked' },
      { label: 'Apex Line', value: 'Loaded' },
      { label: 'Throttle Map', value: 'Clean' },
    ],
    status: (cycle) => [
      'YELLOW BAND LOCKED',
      'APEX TRACE AND BRAKE MARKERS LOADED',
      'THROTTLE MAP CLEAN FOR FLYING LAP',
      `${cycle} // SENNA FLYING LAP`,
    ],
  },
  verstappen: {
    id: 'verstappen',
    title: 'VERSTAPPEN MV1',
    chassis: 'VEStriPPN Dutch Lion',
    eyebrow: 'Orange Attack Launch',
    mode: 'Dutch Orange Red White Blue',
    subtitle: 'Aggressive push-lap energy with a precise command cockpit handoff.',
    bg: '#050b16',
    accent: '#ff6b00',
    secondary: '#ffffff',
    tertiary: '#1d4ed8',
    softText: '#fed7aa',
    halo: 'rgba(255,107,0,0.66)',
    stripe: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.96), rgba(220,38,38,0.82), rgba(255,255,255,0.90), rgba(29,78,216,0.86), transparent)',
    metrics: [
      { label: 'ATTACK', value: 'PUSH' },
      { label: 'DELTA', value: 'PURPLE' },
      { label: 'ORANGE', value: 'ARMED' },
    ],
    phases: [
      { label: 'Dutch Line', value: 'Loaded' },
      { label: 'Brake Bias', value: 'Forward' },
      { label: 'Beast Mode', value: 'Released' },
    ],
    status: (cycle) => [
      'ORANGE SIGNAL ARMED',
      'DUTCH STRIPE AND PUSH MAP LOADED',
      'OVERTAKE MODE READY FOR LAP ONE',
      `${cycle} // VERSTAPPEN ATTACK LAP`,
    ],
  },
};

function RaceStartLights({ theme, reduceMotion }: { theme: RaceIntroTheme; reduceMotion: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      {[0, 1, 2, 3, 4].map((light) => (
        <motion.span
          key={light}
          className="h-3 w-3 rounded-full border border-white/15 sm:h-3.5 sm:w-3.5"
          style={{ background: theme.tertiary }}
          initial={{ opacity: 0.18, scale: 0.86 }}
          animate={
            reduceMotion
              ? { opacity: 0.78, scale: 1 }
              : {
                  opacity: [0.18, 1, 1, 0.2],
                  scale: [0.86, 1.08, 1.08, 0.9],
                  boxShadow: [`0 0 0 ${theme.tertiary}`, `0 0 24px ${theme.tertiary}`, `0 0 24px ${theme.tertiary}`, `0 0 0 ${theme.tertiary}`],
                }
          }
          transition={{ delay: 0.35 + light * 0.22, duration: 2.9, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function RaceIntroTelemetry({ theme }: { theme: RaceIntroTheme }) {
  return (
    <motion.div
      className="grid w-full grid-cols-3 border border-white/10 bg-white/10"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.28, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
    >
      {theme.metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          className="min-w-0 bg-black/48 px-3 py-2.5 text-left backdrop-blur-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 + i * 0.08, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-mono text-[8px] font-black uppercase tracking-[0.24em] text-white/38">{metric.label}</div>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] font-black uppercase text-white">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 18px ${theme.halo}` }} />
            <span className="truncate">{metric.value}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function RaceIntroOverlay({ cycle, theme }: { cycle: string; theme: RaceIntroTheme }) {
  const reduceMotion = useReducedMotion();
  const reduced = Boolean(reduceMotion);
  const statuses = [
    ['01', 'Cockpit glass calibrated'],
    ['02', 'Mission queue synchronized'],
    ['03', `${cycle} // W10 ready`],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden text-white"
      style={{ backgroundColor: theme.bg }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduced ? 'none' : 'blur(8px)' }}
      transition={{ duration: reduced ? 0.18 : 0.62, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `radial-gradient(circle at 50% -18%, ${theme.halo}, transparent 31%)`,
            `radial-gradient(ellipse at 90% 90%, ${theme.tertiary}24, transparent 44%)`,
            'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 26%)',
            `linear-gradient(140deg, ${theme.bg} 0%, #020405 56%, #000 100%)`,
          ].join(', '),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.105]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.72) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.58) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 20%, #000 72%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 20%, #000 72%, transparent 100%)',
        }}
      />
      <motion.div
        className="absolute left-[-20%] top-[17%] h-px w-[140%]"
        style={{ background: theme.stripe, boxShadow: `0 0 34px ${theme.halo}` }}
        initial={{ scaleX: 0, opacity: 0, transformOrigin: '0% 50%' }}
        animate={{ scaleX: 1, opacity: reduced ? 0.55 : [0, 0.95, 0.68] }}
        transition={{ delay: 0.18, duration: reduced ? 0.1 : 1.18, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute bottom-[13%] left-[-18%] h-[2px] w-[136%]"
        style={{ background: theme.stripe }}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '0%', opacity: 0.7 }}
        transition={{ delay: 0.52, duration: reduced ? 0.1 : 1.15, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 left-[12%] w-px bg-white/12"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.42, duration: reduced ? 0.1 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 right-[13%] w-px bg-white/10"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.58, duration: reduced ? 0.1 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-5 py-6 sm:px-9 sm:py-8 lg:px-12">
        <motion.header
          className="flex items-start justify-between gap-5"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-[0.34em]" style={{ color: theme.softText }}>
              {theme.eyebrow}
            </div>
            <div className="mt-2 text-[11px] font-black uppercase tracking-[0.26em] text-white/42">Silver arrow calibration</div>
          </div>
          <RaceStartLights theme={theme} reduceMotion={reduced} />
        </motion.header>

        <main className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[0.88fr_1.12fr] lg:py-0">
          <motion.section
            className="min-w-0"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.72, duration: reduced ? 0.15 : 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-white/44">{theme.chassis}</div>
            <h1 className="mt-3 text-[clamp(58px,13vw,148px)] font-black uppercase leading-[0.76] tracking-[-0.08em] text-white">
              W10
            </h1>
            <motion.div
              className="mt-4 h-[3px] w-[min(82vw,560px)] origin-left"
              style={{ background: theme.stripe, boxShadow: `0 0 26px ${theme.halo}` }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.24, duration: reduced ? 0.1 : 0.82, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="mt-5 text-[clamp(22px,4.8vw,54px)] font-black uppercase leading-none tracking-[-0.04em]"
              style={{ color: theme.accent }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.42, duration: reduced ? 0.15 : 0.56, ease: [0.16, 1, 0.3, 1] }}
            >
              EQ Power
            </motion.div>
            <motion.p
              className="mt-5 max-w-xl text-sm font-semibold leading-7 text-white/60 sm:text-base"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.68, duration: 0.44 }}
            >
              {theme.subtitle}
            </motion.p>
            <IntroPhaseRail phases={theme.phases} accent={theme.accent} halo={theme.halo} />
          </motion.section>

          <motion.section
            className="relative min-h-[300px] overflow-hidden lg:min-h-[560px]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.86, duration: reduced ? 0.15 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(ellipse at center, ${theme.halo}, transparent 44%)`,
                opacity: 0.22,
              }}
            />
            <motion.div
              className="absolute left-[8%] right-[4%] top-[22%] h-px bg-white/18"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.0, duration: reduced ? 0.1 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: '0% 50%' }}
            />
            <motion.div
              className="absolute bottom-[24%] left-[4%] right-[8%] h-px"
              style={{ background: theme.stripe }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.8 }}
              transition={{ delay: 1.2, duration: reduced ? 0.1 : 0.82, ease: [0.16, 1, 0.3, 1] }}
            />
            <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 820 520" aria-hidden>
              <motion.path
                d="M112 292 L226 224 L392 198 L568 232 L736 302"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="52"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.02, duration: reduced ? 0.1 : 0.92, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M124 280 L250 230 L396 214 L540 238 L740 292"
                fill="none"
                stroke={theme.secondary}
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.96 }}
                transition={{ delay: 1.18, duration: reduced ? 0.1 : 0.82, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M132 314 L278 278 L434 278 L594 302 L742 324"
                fill="none"
                stroke={theme.accent}
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ delay: 1.46, duration: reduced ? 0.1 : 0.86, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M242 252 L398 184 L594 226 L666 278 L452 298 L210 294 Z"
                fill="rgba(255,255,255,0.055)"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.38, duration: reduced ? 0.1 : 0.58 }}
              />
              <motion.path
                d="M354 188 L494 214 L418 252 Z"
                fill={theme.accent}
                opacity="0.78"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.72, duration: reduced ? 0.1 : 0.44, ease: [0.76, 0, 0.24, 1] }}
                style={{ transformOrigin: '360px 218px' }}
              />
              <motion.path
                d="M254 252 L154 224 M594 226 L710 204 M404 184 L404 134 M450 298 L450 372"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.95, duration: reduced ? 0.1 : 0.72, ease: [0.16, 1, 0.3, 1] }}
              />
              {[250, 604].map((cx, i) => (
                <motion.g key={cx} initial={{ scale: 0.72, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.58 + i * 0.12, duration: 0.42 }}>
                  <circle cx={cx} cy="306" r="43" fill="#030506" stroke="rgba(255,255,255,0.44)" strokeWidth="8" />
                  <circle cx={cx} cy="306" r="17" fill={theme.accent} opacity="0.82" />
                </motion.g>
              ))}
              <motion.line
                x1="88"
                y1="156"
                x2="768"
                y2="156"
                stroke={theme.accent}
                strokeWidth="2"
                strokeDasharray="10 18"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.64 }}
                transition={{ delay: 2.05, duration: reduced ? 0.1 : 0.82 }}
              />
            </svg>

            <motion.div
              className="absolute bottom-2 right-0 w-[min(94vw,430px)] sm:bottom-9"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.18, duration: 0.45 }}
            >
              <RaceIntroTelemetry theme={theme} />
            </motion.div>
          </motion.section>
        </main>

        <motion.footer
          className="grid gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white/46 sm:grid-cols-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.9, duration: 0.45 }}
        >
          {statuses.map(([index, status], i) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 border-t border-white/12 pt-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.02 + i * 0.1, duration: 0.34 }}
            >
              <span style={{ color: i === statuses.length - 1 ? theme.accent : theme.secondary }}>{index}</span>
              <span>{status}</span>
            </motion.div>
          ))}
        </motion.footer>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   INTRO OVERLAY — boot sequence (every page load, ~7s)
   ════════════════════════════════════════════════════════════ */
function IntroOverlay({ cycle }: { cycle: string }) {
  return <RaceIntroOverlay cycle={cycle} theme={RACE_INTROS.w10} />;
}

/* ════════════════════════════════════════════════════════════
   WILLIAMS INTRO OVERLAY — heritage navy/gold/red boot sequence.
   Activates when the Williams special livery is on.
   Uses public palette navy #210E6F · brass #C59955 · red #D5172D
   and a generic bold sans-serif — not the trademarked logotype.
   ════════════════════════════════════════════════════════════ */
function WilliamsIntroOverlay({ cycle }: { cycle: string }) {
  const reduceMotion = useReducedMotion();
  const reduced = Boolean(reduceMotion);
  const readouts = [
    ['Garage', 'Heritage bay open'],
    ['Stripe', 'White / brass / red'],
    ['Release', `${cycle} ready`],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-[#080316] text-white"
      data-livery-intro="williams"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduced ? 'none' : 'blur(10px)' }}
      transition={{ duration: reduced ? 0.18 : 0.72, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            'linear-gradient(rgba(255,255,255,0.038) 1px, transparent 1px)',
            'radial-gradient(circle at 17% 8%, rgba(197,153,85,0.28), transparent 34%)',
            'radial-gradient(ellipse at 90% 92%, rgba(213,23,45,0.18), transparent 45%)',
            'linear-gradient(135deg, #210e6f 0%, #0a0322 62%, #05010f 100%)',
          ].join(', '),
          backgroundSize: '52px 52px, 52px 52px, auto, auto, auto',
        }}
      />
      <motion.div
        className="absolute left-[-5%] top-[12%] h-[13vh] w-[115%] -skew-y-6 bg-white shadow-[0_26px_90px_rgba(255,255,255,0.22)]"
        initial={{ x: '-120%' }}
        animate={{ x: 0 }}
        transition={{ delay: 0.1, duration: reduced ? 0.1 : 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute left-[-5%] top-[25%] h-[8px] w-[115%] -skew-y-6 bg-[#c59955]"
        initial={{ x: '120%' }}
        animate={{ x: 0 }}
        transition={{ delay: 0.34, duration: reduced ? 0.1 : 0.74, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute left-[-5%] top-[27%] h-[5px] w-[115%] -skew-y-6 bg-[#d5172d]"
        initial={{ x: '-120%' }}
        animate={{ x: 0 }}
        transition={{ delay: 0.48, duration: reduced ? 0.1 : 0.74, ease: [0.76, 0, 0.24, 1] }}
      />

      <motion.div
        className="absolute bottom-[3%] right-[2%] hidden text-[min(22vw,220px)] font-black leading-none text-white/[0.04] sm:block"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        FW18
      </motion.div>

      <motion.div
        className="absolute left-5 right-5 top-5 flex min-w-0 items-center gap-3 sm:left-10 sm:right-auto sm:top-9"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62, duration: 0.48 }}
      >
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#c59955] shadow-[0_0_28px_rgba(197,153,85,0.75)]" />
        <span className="min-w-0 truncate font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 sm:tracking-[0.28em]">Heritage garage</span>
      </motion.div>

      <div className="relative z-10 grid h-full min-h-0 px-5 pb-14 pt-5 sm:px-10 sm:pb-16 sm:pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.section
          className="flex min-h-0 flex-col justify-center pt-16 sm:pt-24 lg:pt-0"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.82, duration: reduced ? 0.15 : 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#c59955] sm:tracking-[0.32em]">Pit board release</div>
          <h1 className="mt-4 max-w-[12ch] text-[clamp(42px,10vw,118px)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
            Williams
            <span className="block text-white/72">FW18</span>
          </h1>
          <div className="mt-6 flex w-full max-w-[440px] flex-col gap-2">
            {['#ffffff', '#c59955', '#d5172d'].map((color, i) => (
              <motion.span
                key={color}
                className="h-2 origin-left"
                style={{ background: color }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.05 + i * 0.16, duration: reduced ? 0.1 : 0.74, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
          <p className="mt-6 max-w-[34rem] text-sm font-semibold leading-6 text-white/58 sm:text-base sm:leading-7">
            Heritage livery armed like a garage door opening: quiet navy, white wing band, brass trim, red release line.
          </p>
        </motion.section>

        <motion.section
          className="relative flex min-h-[220px] items-center justify-center sm:min-h-[300px] lg:min-h-[520px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.02, duration: reduced ? 0.15 : 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg className="h-[min(42vh,370px)] w-[min(84vw,600px)] max-w-full overflow-visible" viewBox="0 0 620 360" aria-hidden>
            <motion.path
              d="M70 248 C146 176 208 156 296 166 C378 176 438 208 540 226"
              fill="none"
              stroke="rgba(255,255,255,0.20)"
              strokeWidth="42"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.12, duration: reduced ? 0.1 : 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M96 226 C176 150 280 136 390 180 C454 205 500 214 558 204"
              fill="none"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.34, duration: reduced ? 0.1 : 1.0, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M116 247 C206 195 292 185 392 212 C444 225 490 232 548 225"
              fill="none"
              stroke="#c59955"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.56, duration: reduced ? 0.1 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M130 264 C224 231 300 225 388 244 C438 255 493 259 552 249"
              fill="none"
              stroke="#d5172d"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.72, duration: reduced ? 0.1 : 0.82, ease: [0.16, 1, 0.3, 1] }}
            />
            {[142, 474].map((cx, i) => (
              <motion.g key={cx} initial={{ scale: 0.65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5 + i * 0.18, duration: 0.48 }}>
                <circle cx={cx} cy="264" r="37" fill="#070216" stroke="#ffffff" strokeWidth="6" />
                <circle cx={cx} cy="264" r="17" fill="#c59955" />
              </motion.g>
            ))}
            <motion.rect x="402" y="134" width="86" height="18" fill="#ffffff" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.88, duration: 0.42 }} />
            <motion.rect x="492" y="142" width="44" height="8" fill="#d5172d" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.02, duration: 0.32 }} />
          </svg>

          <div className="absolute bottom-0 right-0 grid w-[min(82vw,350px)] gap-2 sm:bottom-3 lg:bottom-10">
            {readouts.map(([label, value], i) => (
              <motion.div
                key={label}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border border-white/12 bg-black/28 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.08 + i * 0.12, duration: 0.38 }}
              >
                <span className="font-mono text-[8px] font-black uppercase tracking-[0.18em] text-white/42 sm:tracking-[0.24em]">{label}</span>
                <span className="min-w-0 text-right text-[10px] font-black uppercase leading-4 text-white sm:text-[11px]">{value}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.div
        className="absolute bottom-4 left-5 right-5 z-20 truncate font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/42 sm:left-10 sm:right-auto sm:text-[10px] sm:tracking-[0.28em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.75, duration: 0.45 }}
      >
        {`${cycle} // Williams iconic sequence`}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   SENNA INTRO OVERLAY — helmet yellow, Brazil green, racing blue.
   Uses a generic motorsport tribute treatment, not a sponsor logotype.
   ════════════════════════════════════════════════════════════ */
function SennaIntroOverlay({ cycle }: { cycle: string }) {
  const reduceMotion = useReducedMotion();
  const reduced = Boolean(reduceMotion);
  const sectors = [
    ['Sector 1', 'Brake marker'],
    ['Sector 2', 'Apex rhythm'],
    ['Sector 3', 'Exit clean'],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-[#020712] text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduced ? 'none' : 'blur(10px)' }}
      transition={{ duration: reduced ? 0.18 : 0.72, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 50% 18%, rgba(255,212,0,0.28), transparent 34%)',
            'radial-gradient(ellipse at 92% 88%, rgba(31,111,235,0.22), transparent 42%)',
            'radial-gradient(ellipse at 8% 92%, rgba(0,166,81,0.20), transparent 42%)',
            'linear-gradient(180deg, #061329 0%, #020712 82%)',
          ].join(', '),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.62) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.62) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 78%)',
        }}
      />

      <div className="absolute left-[-10%] top-[13%] w-[120%] -rotate-6">
        <motion.div
          className="h-[clamp(58px,11vh,110px)] bg-[#ffd400]"
          initial={{ x: '-110%', opacity: 0 }}
          animate={{ x: '0%', opacity: 0.94 }}
          transition={{ delay: 0.18, duration: reduced ? 0.1 : 0.9, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="mt-2 h-[clamp(12px,2.1vh,22px)] bg-[#00a651]"
          initial={{ x: '110%', opacity: 0 }}
          animate={{ x: '0%', opacity: 0.9 }}
          transition={{ delay: 0.38, duration: reduced ? 0.1 : 0.82, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="mt-2 h-[clamp(9px,1.55vh,16px)] bg-[#1f6feb]"
          initial={{ x: '-110%', opacity: 0 }}
          animate={{ x: '0%', opacity: 0.86 }}
          transition={{ delay: 0.54, duration: reduced ? 0.1 : 0.76, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>

      <div className="relative z-10 grid h-full place-items-center px-5 py-6">
        <motion.div
          className="relative flex h-[min(74vh,680px)] w-[min(92vw,940px)] items-center justify-center"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.72, duration: reduced ? 0.15 : 0.76, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full bg-[#ffd400] shadow-[0_0_120px_rgba(255,212,0,0.36)]"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ delay: 0.9, duration: reduced ? 0.1 : 0.84, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute h-[min(53vw,390px)] w-[min(68vw,520px)] rounded-[999px] bg-[#020712] shadow-[inset_0_0_42px_rgba(255,255,255,0.10)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.18, duration: reduced ? 0.1 : 0.68, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute h-[min(15vw,96px)] w-[min(62vw,470px)] -rotate-3 rounded-full bg-gradient-to-r from-[#00a651] via-[#00a651] to-[#1f6feb]"
            initial={{ x: '-110%', opacity: 0 }}
            animate={{ x: 0, opacity: 0.58 }}
            transition={{ delay: 1.45, duration: reduced ? 0.1 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute h-[min(13vw,82px)] w-[min(54vw,410px)] -rotate-3 rounded-full bg-black/88"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.68, duration: reduced ? 0.1 : 0.48, ease: [0.76, 0, 0.24, 1] }}
          />

          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.95, duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.38em] text-[#a7f3c7]">Visor focus sequence</div>
            <h1 className="mt-3 text-[clamp(56px,15vw,148px)] font-black uppercase leading-[0.82] tracking-[-0.08em] text-white">
              Senna
            </h1>
            <div className="mt-4 text-[11px] font-black uppercase tracking-[0.32em] text-white/52">{`${cycle} // apex memory armed`}</div>
          </motion.div>

          <svg className="absolute bottom-[8%] h-[120px] w-[min(86vw,620px)]" viewBox="0 0 620 120" aria-hidden>
            <motion.path
              d="M20 78 C112 12 168 95 240 52 C304 14 354 68 410 58 C478 46 512 30 600 68"
              fill="none"
              stroke="#ffd400"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ delay: 2.2, duration: reduced ? 0.1 : 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M20 94 C124 48 168 104 262 74 C345 47 401 87 600 82"
              fill="none"
              stroke="#00a651"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.42 }}
              transition={{ delay: 2.42, duration: reduced ? 0.1 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-6 left-5 right-5 grid gap-2 sm:left-10 sm:right-10 sm:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.62, duration: 0.5 }}
        >
          {sectors.map(([label, value]) => (
            <div key={label} className="border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-xl">
              <div className="font-mono text-[8px] font-black uppercase tracking-[0.24em] text-white/36">{label}</div>
              <div className="mt-1 text-[12px] font-black uppercase text-white">{value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function VerstappenIntroOverlay({ cycle }: { cycle: string }) {
  const reduceMotion = useReducedMotion();
  const reduced = Boolean(reduceMotion);
  const telemetry = [
    ['Delta', '-0.318'],
    ['Mode', 'Attack'],
    ['ERS', 'Full send'],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-[#030712] text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduced ? 'none' : 'blur(10px)' }}
      transition={{ duration: reduced ? 0.18 : 0.72, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 28% 18%, rgba(255,107,0,0.36), transparent 34%)',
            'radial-gradient(ellipse at 82% 86%, rgba(29,78,216,0.24), transparent 44%)',
            'linear-gradient(145deg, #061a3a 0%, #030712 68%)',
          ].join(', '),
        }}
      />
      <div className="absolute left-[-18%] top-[-10%] h-[125%] w-[34%] rotate-12">
        <motion.div
          className="h-full w-full bg-[#ff6b00] shadow-[0_0_110px_rgba(255,107,0,0.45)]"
          initial={{ y: '-120%' }}
          animate={{ y: '0%' }}
          transition={{ delay: 0.08, duration: reduced ? 0.1 : 0.82, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>
      <div className="absolute right-[-15%] top-[8%] w-[76%] -rotate-12">
        <motion.div
          className="h-[clamp(28px,5.6vh,50px)] bg-[#dc2626]"
          initial={{ x: '120%' }}
          animate={{ x: 0 }}
          transition={{ delay: 0.28, duration: reduced ? 0.1 : 0.76, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="mt-2 h-[clamp(28px,5.6vh,50px)] bg-white/95"
          initial={{ x: '-120%' }}
          animate={{ x: 0 }}
          transition={{ delay: 0.42, duration: reduced ? 0.1 : 0.7, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="mt-2 h-[clamp(28px,5.6vh,50px)] bg-[#1d4ed8]"
          initial={{ x: '120%' }}
          animate={{ x: 0 }}
          transition={{ delay: 0.54, duration: reduced ? 0.1 : 0.64, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0, rgba(255,255,255,0.55) 1px, transparent 1px, transparent 24px)',
        }}
      />

      <div className="relative z-10 grid h-full place-items-center px-5 py-6">
        <motion.div
          className="relative h-[min(74vh,680px)] w-[min(94vw,1080px)]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.68, duration: reduced ? 0.15 : 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg className="absolute inset-0 h-full w-full overflow-visible opacity-60" viewBox="0 0 1100 760" aria-hidden>
            <defs>
              <linearGradient id="mvGauge" x1="0" x2="1">
                <stop offset="0%" stopColor="#ff6b00" />
                <stop offset="54%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <circle cx="550" cy="390" r="250" fill="rgba(3,7,18,0.50)" stroke="rgba(255,255,255,0.12)" strokeWidth="34" />
            <motion.path
              d="M314 472 A250 250 0 1 1 786 472"
              fill="none"
              stroke="url(#mvGauge)"
              strokeWidth="22"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.94, duration: reduced ? 0.1 : 1.25, ease: [0.16, 1, 0.3, 1] }}
            />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((tick) => {
              const angle = -142 + tick * 35.5;
              return (
                <motion.line
                  key={tick}
                  x1="550"
                  y1="138"
                  x2="550"
                  y2="180"
                  stroke={tick > 5 ? '#ff6b00' : 'rgba(255,255,255,0.68)'}
                  strokeWidth={tick > 5 ? 8 : 5}
                  strokeLinecap="round"
                  transform={`rotate(${angle} 550 390)`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.18 + tick * 0.055, duration: 0.24 }}
                />
              );
            })}
            <motion.line
              x1="550"
              y1="390"
              x2="550"
              y2="186"
              stroke="#ff6b00"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ rotate: -118, opacity: 0 }}
              animate={{ rotate: reduced ? 34 : [-118, 44, 30], opacity: 1 }}
              transition={{ delay: 1.48, duration: reduced ? 0.1 : 1.22, ease: [0.76, 0, 0.24, 1] }}
              style={{ transformOrigin: '550px 390px', filter: 'drop-shadow(0 0 18px rgba(255,107,0,0.72))' }}
            />
            <circle cx="550" cy="390" r="24" fill="#ff6b00" />
          </svg>

          <motion.div
            className="absolute inset-x-0 top-[40%] z-10 flex -translate-y-1/2 flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.78, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.38em] text-orange-200">Dutch attack sequence</div>
            <h1 className="mt-3 text-[clamp(72px,18vw,186px)] font-black uppercase leading-[0.76] tracking-[-0.09em]">
              MV1
            </h1>
            <div className="mt-3 text-[clamp(22px,5vw,52px)] font-black uppercase tracking-[-0.04em] text-[#ff6b00]">
              Verstappen
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.34em] text-white/52">{`${cycle} // beast mode released`}</div>
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20 mx-auto grid max-w-3xl gap-2 sm:grid-cols-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.52, duration: 0.46 }}
          >
            {telemetry.map(([label, value], i) => (
              <motion.div
                key={label}
                className="border border-orange-300/20 bg-black/34 px-4 py-3 text-center backdrop-blur-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.62 + i * 0.09, duration: 0.32 }}
              >
                <div className="font-mono text-[8px] font-black uppercase tracking-[0.24em] text-white/38">{label}</div>
                <div className="mt-1 text-[13px] font-black uppercase text-white">{value}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
