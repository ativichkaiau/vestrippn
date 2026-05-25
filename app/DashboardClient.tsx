'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Clock from "../components/Clock";
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
import Link from 'next/link';

// --- ADD THE PROPS INTERFACE ---
interface DashboardProps {
  cloudCommand: string;
  cloudTasks: any[];
  cloudResearch?: any;
  cloudFitness?: any;
  cloudNotifications?: any[];
}

// --- RECEIVE THE PROPS FROM THE SERVER ---
export default function DashboardClient({ cloudCommand, cloudTasks, cloudResearch, cloudFitness, cloudNotifications }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cycle, setCycle] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour >= 18) {
      setCycle('NIGHT_CYCLE');
    } else {
      setCycle('DAY_CYCLE');
    }

    // Boot sequence plays on every page load
    setShowIntro(true);
    const t = setTimeout(() => setShowIntro(false), 7000);
    return () => clearTimeout(t);
  }, []);

  if (!isMounted) return <LoadingScreen />;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: true },
    { name: 'Academics', icon: '▲', href: '/academics' },
    { name: 'Research', icon: '◆', href: '/research' },
    { name: 'Fitness', icon: '◈', href: '/fitness' },
    { name: 'Archive', icon: '▥', href: '/archive' },
    { name: 'IELTS', icon: '◎', href: '/ielts' },
    { name: 'Tools', icon: '⚙', href: '/tools' },
    { name: 'Identity', icon: '⚇', href: '/identity' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">

      <AnimatePresence>
        {showIntro && <IntroOverlay cycle={cycle} />}
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
              <span className="text-blue-600 dark:text-blue-400 transition-colors duration-700">3.0</span>
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
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isSidebarExpanded ? 'w-[220px] px-5' : 'w-[80px] px-3'
        }`}>
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                title={!isSidebarExpanded ? item.name : undefined}
                className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-2.5 rounded-xl transition-all duration-300 group relative ${
                  item.active 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm' 
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span className={`text-[16px] shrink-0 transition-opacity duration-300 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[12px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${
                  isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            title={isSidebarExpanded ? "Collapse Panel" : "Expand Time Sync"}
            className={`mt-4 w-full rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${
              isSidebarExpanded ? 'p-4' : 'p-3 aspect-square'
            }`}
          >
            {isSidebarExpanded ? (
              <Clock />
            ) : (
              <span className="text-lg group-hover:rotate-12 transition-transform duration-300">⏱️</span>
            )}
          </button>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 lg:p-8 pb-32 lg:pb-8 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8">
            
            {/* COMPACT HERO SECTION */}
            <motion.section
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center pt-8 sm:pt-10 pb-4 relative"
            >
              <div className="absolute left-[5%] xl:left-[10%] top-2 hidden lg:flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-md backdrop-saturate-150 px-4 py-2 rounded-full shadow-sm dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-sm">🧠</span>
                <span className="text-[11px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Cognitive Focus</span>
              </div>

              <div className="absolute right-[5%] xl:right-[10%] bottom-2 hidden lg:flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-md backdrop-saturate-150 px-4 py-2 rounded-full shadow-sm dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-sm">🏁</span>
                <span className="text-[11px] font-bold tracking-tight text-[#00A598]">Aero Nominal</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-4 flex flex-col xl:flex-row items-center justify-center gap-2 sm:gap-3 xl:gap-4 relative z-10">
                <div className="flex items-baseline text-[36px] sm:text-[48px] lg:text-[56px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">
                    VESTRIPPN
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-fuchsia-500 dark:from-blue-400 dark:to-fuchsia-400 transition-colors duration-700">
                    3.0
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mt-1 xl:mt-0 text-[24px] sm:text-[32px] lg:text-[40px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-3 py-1 sm:py-1.5 rounded-[12px] shadow-sm border border-black/5 leading-none transition-colors duration-700">
                    ///AMG
                  </span>
                  <span className="transition-all duration-700">
                    <span className="text-[#00A598] drop-shadow-[0_0_15px_rgba(0,165,152,0.3)] dark:drop-shadow-[0_0_20px_rgba(0,165,152,0.5)]">W08</span>{' '}
                    <span
                      className="bg-clip-text text-transparent whitespace-nowrap drop-shadow-[0_0_18px_rgba(99,102,241,0.35)]"
                      style={{ backgroundImage: 'linear-gradient(120deg, #14b8a6 0%, #0ea5e9 35%, #6366f1 70%, #d946ef 100%)' }}
                    >
                      EQ Power+
                    </span>
                  </span>
                </div>
              </h1>

              <p className="mb-3 text-[11px] sm:text-[12px] font-bold tracking-[0.25em] uppercase text-neutral-400 dark:text-neutral-500 transition-colors duration-700 relative z-10">
                Powered by <span className="text-[#D97757]">Claude</span>
              </p>

              <p className="max-w-2xl font-mono text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycle} // <span className="text-[#00A598] font-bold">System Nominal</span>
              </p>

              <div className="mt-6 w-full max-w-xl mx-auto px-4 relative z-10">
                <TodaysCommand initialTasks={cloudTasks} />
              </div>
            </motion.section>

            {/* THE COMPACT BENTO BOX GRID */}
            <motion.div
              className="flex flex-col gap-4 lg:gap-6"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
            >
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
                         screening: cloudResearch.screening,
                         fullText: cloudResearch.fullText,
                         extraction: cloudResearch.extraction
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
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A598] animate-pulse"></span> Domain Health
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
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[60px] bg-white/80 dark:bg-[#111111]/80 backdrop-blur-3xl backdrop-saturate-150 border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-2 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300 shrink-0 group ${
                item.active 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <span className={`text-[15px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                 {item.icon}
               </span>
               {item.active && (
                 <span className="text-[10px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">
                   {item.name}
                 </span>
               )}
            </Link>
          ))}
        </nav>

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
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45), rgba(20,184,166,0.25) 45%, transparent 72%)' }}
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
            style={{ background: 'linear-gradient(90deg,#2dd4bf,#0ea5e9,#6366f1,#d946ef)' }}
            animate={{ x: ['-120%', '380%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   INTRO OVERLAY — boot sequence (every page load, ~7s)
   ════════════════════════════════════════════════════════════ */
function IntroOverlay({ cycle }: { cycle: string }) {
  const word = 'VESTRIPPN'.split('');
  const status = [
    { t: 'INITIALIZING TELEMETRY CORE', at: 1.8 },
    { t: 'SYNCING CLOUD UPLINK', at: 3.2 },
    { t: 'CALIBRATING NEURAL MATRIX', at: 4.6 },
    { t: `${cycle} // SYSTEM ONLINE`, at: 6.0 },
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
            style={{ background: 'linear-gradient(120deg,#2dd4bf,#0ea5e9,#6366f1,#d946ef)' }}
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
            style={{ backgroundImage: 'linear-gradient(120deg, #2dd4bf, #0ea5e9, #6366f1, #d946ef)' }}
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
          <span className="italic text-black bg-white px-3 py-1 rounded-[10px] tracking-tight">///AMG</span>
          <span>
            <span className="text-[#00A598]">W08</span>{' '}
            <span
              className="bg-clip-text text-transparent whitespace-nowrap"
              style={{ backgroundImage: 'linear-gradient(120deg, #14b8a6 0%, #0ea5e9 35%, #6366f1 70%, #d946ef 100%)' }}
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
          Powered by <span className="text-[#D97757]">Claude</span>
        </motion.div>

        {/* Telemetry progress bar */}
        <div className="mt-12 h-[3px] w-56 sm:w-72 bg-white/10 rounded-full overflow-hidden shadow-[0_0_22px_rgba(99,102,241,0.35)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#2dd4bf,#0ea5e9,#6366f1,#d946ef)' }}
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