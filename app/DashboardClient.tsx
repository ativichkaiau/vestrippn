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
import Link from 'next/link';

type SiteLivery = 'normal' | 'monza' | 'senna';
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
    let hideIntroTimer: number | undefined;
    const mountTimer = window.setTimeout(() => {
      setIsMounted(true);
      const currentHour = new Date().getHours();
      setCycle(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');

      // Pick livery before showing intro so the Williams variant can swap in.
      try {
        const stored = localStorage.getItem('vest_livery');
        setLivery(stored === 'monza' || stored === 'senna' ? stored : 'normal');
      } catch {}

      // Boot sequence plays on every page load.
      setShowIntro(true);
      hideIntroTimer = window.setTimeout(() => setShowIntro(false), 7000);
    }, 0);

    return () => {
      window.clearTimeout(mountTimer);
      if (hideIntroTimer) window.clearTimeout(hideIntroTimer);
    };
  }, []);

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

          <Link href="/" className="font-black text-[18px] lg:text-[20px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[14px] transition-colors duration-700">V</div>
            <div className="flex items-baseline">
              <span>VESTRIPPN</span>
              <span className="transition-colors duration-700" style={{ color: 'var(--hub-accent)' }}>3.0</span>
            </div>
          </Link>
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
                    Personal Telemetry & Operating System
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
                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
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
                        ['Version', 'W09'],
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
              className="overflow-hidden rounded-[32px] border border-black/5 bg-neutral-950 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)] dark:border-white/10 sm:p-7 lg:p-8"
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
      className="mt-8 grid w-[min(88vw,560px)] grid-cols-1 gap-2 sm:grid-cols-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {phases.map((phase, i) => (
        <motion.div
          key={phase.label}
          className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-left shadow-[0_16px_42px_rgba(0,0,0,0.20)] backdrop-blur-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.15 + i * 0.1, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[8px] font-black uppercase tracking-[0.22em] text-neutral-500">{phase.label}</div>
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

/* ════════════════════════════════════════════════════════════
   INTRO OVERLAY — boot sequence (every page load, ~7s)
   ════════════════════════════════════════════════════════════ */
function IntroOverlay({ cycle }: { cycle: string }) {
  const word = 'VESTRIPPN'.split('');
  const status = [
    { t: 'INITIALIZING W09 COMMAND SURFACE', at: 1.8 },
    { t: 'SYNCING MISSION + TASK QUEUE', at: 3.2 },
    { t: 'CALIBRATING STUDY / RESEARCH HUBS', at: 4.6 },
    { t: `${cycle} // W09 READY`, at: 6.0 },
  ];
  const phases = [
    { label: 'Focus', value: 'Current mission' },
    { label: 'Queue', value: 'Planner tasks' },
    { label: 'Access', value: 'Hub shortcuts' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Animated aurora — layered colored glows */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full blur-[140px] bg-gradient-to-br from-teal-400/40 to-cyan-500/30"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.9, 0.6, 0.9], scale: [0.6, 1.1, 1], x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 7, ease: 'easeInOut', times: [0, 0.3, 0.6, 1] }}
      />
      <motion.div
        className="absolute top-[8%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[150px] bg-gradient-to-br from-indigo-500/35 to-fuchsia-500/30"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.8, 0.55, 0.8], scale: [0.6, 1, 1.1], x: [0, -30, 0] }}
        transition={{ duration: 7, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.div
        className="absolute -bottom-[20%] left-[18%] w-[55%] h-[55%] rounded-full blur-[150px] bg-gradient-to-tr from-amber-400/25 to-rose-500/25"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.7, 0.5, 0.7], scale: [0.6, 1.1, 1], y: [0, -30, 0] }}
        transition={{ duration: 7, ease: 'easeInOut', delay: 0.6 }}
      />

      {/* Telemetry grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 78%)',
        }}
      />

      {/* Logo + Wordmark */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative w-16 h-16 lg:w-20 lg:h-20 bg-white text-black rounded-2xl flex items-center justify-center text-[34px] lg:text-[42px] font-black mb-8 shadow-[0_0_60px_rgba(99,102,241,0.5)]"
          initial={{ scale: 0, rotate: -120, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 17, delay: 0.4 }}
        >
          <motion.span
            className="absolute -inset-[3px] rounded-[18px] -z-10"
            style={{ background: 'linear-gradient(120deg,#00d2be,#036b62)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          V
        </motion.div>

        <div className="relative flex items-baseline tracking-tighter font-black text-[44px] sm:text-[64px] lg:text-[80px] leading-none">
          {word.map((ch, i) => (
            <motion.span
              key={i}
              className="text-white inline-block"
              initial={{ y: 60, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.9 + i * 0.09 }}
            >
              {ch}
            </motion.span>
          ))}
          <motion.span
            className="inline-block bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(120deg, #00d2be, #036b62)' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 1.9 }}
          >
            3.0
          </motion.span>
          {/* shimmer sweep across the wordmark */}
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.5) 50%, transparent 62%)', mixBlendMode: 'overlay' }}
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 1, 1, 0] }}
            transition={{ delay: 2.2, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          className="mt-4 flex items-center gap-3 text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.4em] text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.5 }}
        >
          <span className="italic text-black bg-white px-3 py-1 rounded-[10px] tracking-tight">{'///AMG'}</span>
          <span>
            <span className="text-[#00A598]">W09</span>{' '}
            <span
              className="bg-clip-text text-transparent whitespace-nowrap"
              style={{ backgroundImage: 'linear-gradient(120deg, #00d2be 0%, #036b62 100%)' }}
            >
              EQ Power+
            </span>
          </span>
        </motion.div>

        <motion.div
          className="mt-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.7, duration: 0.5 }}
        >
          Mission, study, research, planner
        </motion.div>

        <IntroPhaseRail phases={phases} accent="#00d2be" halo="rgba(0,210,190,0.72)" />

        {/* Telemetry progress bar */}
        <div className="mt-8 h-[3px] w-56 sm:w-72 bg-white/10 rounded-full overflow-hidden shadow-[0_0_22px_rgba(99,102,241,0.35)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#00d2be,#036b62)' }}
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '38%', '64%', '100%'] }}
            transition={{ delay: 1.6, duration: 4.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] }}
          />
        </div>

        {/* Boot status */}
        <div className="mt-5 h-4 relative w-full text-center">
          {status.map((s, i) => {
            const isLast = i === status.length - 1;
            return (
              <motion.span
                key={i}
                className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLast ? [0, 1, 1] : [0, 1, 1, 0] }}
                transition={{
                  delay: s.at,
                  duration: isLast ? 1.0 : 1.3,
                  times: isLast ? [0, 0.4, 1] : [0, 0.2, 0.75, 1],
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLast ? 'bg-teal-400' : 'bg-indigo-400'}`} />
                {s.t}
              </motion.span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   WILLIAMS INTRO OVERLAY — heritage navy/gold/red boot sequence.
   Activates when the Williams special livery is on.
   Uses public palette navy #210E6F · brass #C59955 · red #D5172D
   and a generic bold sans-serif — not the trademarked logotype.
   ════════════════════════════════════════════════════════════ */
function WilliamsIntroOverlay({ cycle }: { cycle: string }) {
  const word = 'VESTRIPPN'.split('');
  const status = [
    { t: 'LOADING WILLIAMS LIVERY', at: 1.8 },
    { t: 'ALIGNING HERITAGE TRIM', at: 3.2 },
    { t: 'SYNCING MISSION HANDOFF', at: 4.6 },
    { t: `${cycle} // WILLIAMS READY`, at: 6.0 },
  ];
  const phases = [
    { label: 'Livery', value: 'Williams heritage' },
    { label: 'Palette', value: 'Navy / gold / red' },
    { label: 'Handoff', value: 'Mission ready' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0a0322' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Navy base + pinstripes + gold/red ambient washes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 7px), radial-gradient(circle at 28% -10%, rgba(197,153,85,0.32), transparent 48%), radial-gradient(ellipse at 105% 110%, rgba(213,23,45,0.20), transparent 55%), linear-gradient(180deg, #210e6f 0%, #0a0322 78%)',
        }}
      />

      {/* Gold + red trim bars sweep in along top & bottom edges */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: '#C59955' }}
        initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute top-[4px] left-0 right-0 h-[2px]"
        style={{ background: '#D5172D' }}
        initial={{ scaleX: 0, transformOrigin: '100% 50%' }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-[4px] left-0 right-0 h-[2px]"
        style={{ background: '#D5172D' }}
        initial={{ scaleX: 0, transformOrigin: '0% 50%' }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: '#C59955' }}
        initial={{ scaleX: 0, transformOrigin: '100% 50%' }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
      />

      {/* Checkered-flag wedge sweeping in from the left */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-0 h-40 w-40 sm:h-56 sm:w-56"
        style={{
          backgroundImage:
            'repeating-conic-gradient(#ffffff 0deg 90deg, #0a0322 90deg 180deg)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(90deg, #000, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(90deg, #000, transparent 75%)',
          opacity: 0.22,
        }}
        initial={{ x: '-120%' }}
        animate={{ x: '0%' }}
        transition={{ delay: 0.6, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 right-0 h-40 w-40 sm:h-56 sm:w-56"
        style={{
          backgroundImage:
            'repeating-conic-gradient(#ffffff 0deg 90deg, #0a0322 90deg 180deg)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(270deg, #000, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(270deg, #000, transparent 75%)',
          opacity: 0.22,
        }}
        initial={{ x: '120%' }}
        animate={{ x: '0%' }}
        transition={{ delay: 0.6, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Logo + Wordmark */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-[34px] lg:text-[42px] font-black mb-8 shadow-[0_0_60px_rgba(197,153,85,0.55)]"
          style={{ background: '#ffffff', color: '#210e6f' }}
          initial={{ scale: 0, rotate: -120, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 17, delay: 0.4 }}
        >
          <motion.span
            className="absolute -inset-[3px] rounded-[18px] -z-10"
            style={{ background: 'linear-gradient(120deg,#C59955,#D5172D)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          V
        </motion.div>

        <div className="relative flex items-baseline tracking-tighter font-black text-[44px] sm:text-[64px] lg:text-[80px] leading-none">
          {word.map((ch, i) => (
            <motion.span
              key={i}
              className="text-white inline-block"
              initial={{ y: 60, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.9 + i * 0.09 }}
            >
              {ch}
            </motion.span>
          ))}
          <motion.span
            className="inline-block"
            style={{ color: '#C59955' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 1.9 }}
          >
            FW
          </motion.span>
          <motion.span
            className="inline-block"
            style={{ color: '#D5172D' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 2.05 }}
          >
            18
          </motion.span>
          {/* shimmer sweep across the wordmark */}
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.55) 50%, transparent 62%)', mixBlendMode: 'overlay' }}
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 1, 1, 0] }}
            transition={{ delay: 2.2, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>

        {/* Wing-band team reference — original layout, generic typography */}
        <motion.div
          className="mt-7 flex flex-col items-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-[2px] w-48 sm:w-64" style={{ background: '#C59955' }} />
          <div
            className="mt-[3px] px-6 py-1.5 text-[15px] sm:text-[19px] font-black tracking-tight"
            style={{ color: '#210e6f', background: '#ffffff' }}
          >
            WILLIAMS
          </div>
          <div
            className="mt-[3px] px-6 py-1 text-[11px] sm:text-[13px] font-black tracking-[0.22em]"
            style={{ color: '#ffffff' }}
          >
            R E N A U L T
          </div>
          <div className="mt-[2px] h-[2px] w-48 sm:w-64" style={{ background: '#D5172D' }} />
        </motion.div>

        <motion.div
          className="mt-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.7, duration: 0.5 }}
        >
          Williams special livery
        </motion.div>

        <IntroPhaseRail phases={phases} accent="#C59955" halo="rgba(197,153,85,0.74)" />

        {/* Telemetry progress bar — gold→red */}
        <div className="mt-8 h-[3px] w-56 sm:w-72 bg-white/10 rounded-full overflow-hidden shadow-[0_0_22px_rgba(197,153,85,0.4)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#C59955,#D5172D)' }}
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '38%', '64%', '100%'] }}
            transition={{ delay: 1.6, duration: 4.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] }}
          />
        </div>

        {/* Boot status */}
        <div className="mt-5 h-4 relative w-full text-center">
          {status.map((s, i) => {
            const isLast = i === status.length - 1;
            return (
              <motion.span
                key={i}
                className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLast ? [0, 1, 1] : [0, 1, 1, 0] }}
                transition={{
                  delay: s.at,
                  duration: isLast ? 1.0 : 1.3,
                  times: isLast ? [0, 0.4, 1] : [0, 0.2, 0.75, 1],
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: isLast ? '#C59955' : '#D5172D' }}
                />
                {s.t}
              </motion.span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   SENNA INTRO OVERLAY — helmet yellow, Brazil green, racing blue.
   Uses a generic motorsport tribute treatment, not a sponsor logotype.
   ════════════════════════════════════════════════════════════ */
function SennaIntroOverlay({ cycle }: { cycle: string }) {
  const word = 'VESTRIPPN'.split('');
  const status = [
    { t: 'LOADING SENNA LIVERY', at: 1.8 },
    { t: 'CALIBRATING FOCUS SIGNAL', at: 3.2 },
    { t: 'SYNCING LAP-LINE HANDOFF', at: 4.6 },
    { t: `${cycle} // SENNA READY`, at: 6.0 },
  ];
  const phases = [
    { label: 'Livery', value: 'Senna special' },
    { label: 'Signal', value: 'Focus line' },
    { label: 'Flow', value: 'Rapid handoff' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#061329' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,212,0,0.06) 0, rgba(255,212,0,0.06) 1px, transparent 1px, transparent 14px), radial-gradient(circle at 22% -12%, rgba(255,212,0,0.36), transparent 42%), radial-gradient(ellipse at 104% 2%, rgba(31,111,235,0.32), transparent 46%), radial-gradient(ellipse at 12% 110%, rgba(0,166,81,0.28), transparent 50%), linear-gradient(180deg, #0d1b2a 0%, #061329 82%)',
        }}
      />

      <motion.div
        className="absolute left-[-18%] top-[18%] h-16 w-[140%] -rotate-6"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,212,0,0.92), transparent)' }}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '12%', opacity: [0, 1, 0.92] }}
        transition={{ delay: 0.25, duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute left-[-18%] top-[30%] h-7 w-[140%] -rotate-6"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,166,81,0.88), transparent)' }}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: '-12%', opacity: [0, 1, 0.86] }}
        transition={{ delay: 0.45, duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute left-[-18%] top-[37%] h-5 w-[140%] -rotate-6"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(31,111,235,0.90), transparent)' }}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '8%', opacity: [0, 1, 0.9] }}
        transition={{ delay: 0.6, duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,212,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(31,111,235,0.8) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(ellipse at center, #000 32%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 32%, transparent 80%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-[34px] lg:text-[42px] font-black mb-8 shadow-[0_0_60px_rgba(255,212,0,0.52)]"
          style={{ background: '#ffd400', color: '#061329' }}
          initial={{ scale: 0, rotate: -120, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 17, delay: 0.4 }}
        >
          <motion.span
            className="absolute -inset-[3px] rounded-[18px] -z-10"
            style={{ background: 'linear-gradient(120deg,#ffd400,#00a651,#1f6feb)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          V
        </motion.div>

        <div className="relative flex items-baseline tracking-tighter font-black text-[44px] sm:text-[64px] lg:text-[80px] leading-none">
          {word.map((ch, i) => (
            <motion.span
              key={i}
              className="text-white inline-block"
              initial={{ y: 60, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.9 + i * 0.09 }}
            >
              {ch}
            </motion.span>
          ))}
          <motion.span
            className="inline-block"
            style={{ color: '#ffd400' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 1.9 }}
          >
            S
          </motion.span>
          <motion.span
            className="inline-block"
            style={{ color: '#00a651' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 2.05 }}
          >
            1
          </motion.span>
          <motion.span
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(105deg, transparent 38%, rgba(255,212,0,0.48) 50%, transparent 62%)', mixBlendMode: 'screen' }}
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 1, 1, 0] }}
            transition={{ delay: 2.2, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          className="mt-7 flex flex-col items-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-[3px] w-52 sm:w-72" style={{ background: 'linear-gradient(90deg,#ffd400,#00a651,#1f6feb)' }} />
          <div
            className="mt-[4px] px-7 py-1.5 text-[15px] sm:text-[20px] font-black tracking-[0.28em]"
            style={{ color: '#061329', background: '#ffd400' }}
          >
            SENNA
          </div>
          <div
            className="mt-[4px] px-6 py-1 text-[10px] sm:text-[12px] font-black tracking-[0.24em]"
            style={{ color: '#a7f3c7' }}
          >
            YELLOW GREEN BLUE
          </div>
        </motion.div>

        <motion.div
          className="mt-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.7, duration: 0.5 }}
        >
          Precision focus livery
        </motion.div>

        <IntroPhaseRail phases={phases} accent="#ffd400" halo="rgba(255,212,0,0.70)" />

        <div className="mt-8 h-[3px] w-56 sm:w-72 bg-white/10 rounded-full overflow-hidden shadow-[0_0_22px_rgba(255,212,0,0.42)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#ffd400,#00a651,#1f6feb)' }}
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '38%', '64%', '100%'] }}
            transition={{ delay: 1.6, duration: 4.6, ease: 'easeInOut', times: [0, 0.35, 0.7, 1] }}
          />
        </div>

        <div className="mt-5 h-4 relative w-full text-center">
          {status.map((s, i) => {
            const isLast = i === status.length - 1;
            return (
              <motion.span
                key={i}
                className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLast ? [0, 1, 1] : [0, 1, 1, 0] }}
                transition={{
                  delay: s.at,
                  duration: isLast ? 1.0 : 1.3,
                  times: isLast ? [0, 0.4, 1] : [0, 0.2, 0.75, 1],
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: isLast ? '#ffd400' : '#1f6feb' }}
                />
                {s.t}
              </motion.span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
