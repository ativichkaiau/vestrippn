'use client';

import { useState, useEffect } from "react";
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

  useEffect(() => {
    setIsMounted(true);
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour >= 18) {
      setCycle('NIGHT_CYCLE');
    } else {
      setCycle('DAY_CYCLE');
    }
  }, []);

  if (!isMounted) return null;

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
        <div className="absolute top-[-10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/15 dark:to-[#00A598]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[50%] h-[50%] bg-gradient-to-tr from-pink-400/20 to-teal-300/20 dark:from-purple-600/10 dark:to-teal-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[64px] lg:h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
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
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
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
            <section className="flex flex-col items-center justify-center text-center pt-8 sm:pt-10 pb-4 relative">
              
              <div className="absolute left-[5%] xl:left-[10%] top-2 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full shadow-sm dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-sm">🧠</span>
                <span className="text-[11px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Cognitive Focus</span>
              </div>

              <div className="absolute right-[5%] xl:right-[10%] bottom-2 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full shadow-sm dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-sm">🏁</span>
                <span className="text-[11px] font-bold tracking-tight text-[#00A598]">Aero Nominal</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-4 flex flex-col xl:flex-row items-center justify-center gap-2 sm:gap-3 xl:gap-4 relative z-10">
                <div className="flex items-baseline text-[36px] sm:text-[48px] lg:text-[56px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">
                    VESTRIPPN
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 transition-colors duration-700">
                    3.0
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mt-1 xl:mt-0 text-[24px] sm:text-[32px] lg:text-[40px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-3 py-1 sm:py-1.5 rounded-[12px] shadow-sm border border-black/5 leading-none transition-colors duration-700">
                    ///AMG
                  </span>
                  <span className="text-[#00A598] drop-shadow-[0_0_15px_rgba(0,165,152,0.3)] dark:drop-shadow-[0_0_20px_rgba(0,165,152,0.5)] transition-all duration-700">
                    W06 Hybrid
                  </span>
                </div>
              </h1>

              <p className="max-w-2xl font-mono text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycle} // <span className="text-[#00A598] font-bold">System Nominal</span>
              </p>
              
              <div className="mt-6 w-full max-w-xl mx-auto px-4 relative z-10">
                {/* INJECTED PROPS HERE */}
                <TodaysCommand initialTasks={cloudTasks} />
              </div>
            </section>

            {/* THE COMPACT BENTO BOX GRID */}
            <div className="flex flex-col gap-4 lg:gap-6">
              
              {/* ROW 1: PRIMARY FOCUS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="flex flex-col rounded-[24px] lg:rounded-[32px] bg-white dark:bg-[#0A0A0A] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(255,255,255,0.02)] border border-black/5 dark:border-white/5 transition-all hover:scale-[1.01] duration-500">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm transition-colors duration-700">📚</div>
                    <h2 className="font-bold text-[18px] tracking-tight">Academic Overview</h2>
                  </div>
                  <AcademicsCard />
                </div>

                <div className="flex flex-col rounded-[24px] lg:rounded-[32px] bg-neutral-50 dark:bg-[#050505] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/5 transition-all hover:scale-[1.01] duration-500">
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
                </div>
              </div>

              {/* ROW 2: SECONDARY FOCUS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                
                <div className="lg:col-span-8 flex flex-col rounded-[24px] lg:rounded-[32px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-colors duration-700 h-full">
                  <FitnessCard 
                    initialWorkoutDays={cloudFitness?.workoutDays ? JSON.parse(cloudFitness.workoutDays) : undefined}
                    initialLastWorkout={cloudFitness?.lastWorkout}
                    initialStreak={cloudFitness?.streak}
                  />
                </div>

                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
                  <div className="flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] lg:rounded-[32px] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-colors duration-700">
                    <h3 className="font-bold text-[14px] tracking-tight mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A598] animate-pulse"></span> Domain Health
                    </h3>
                    <DomainHealth />
                  </div>
                  <div className="flex-1 flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] lg:rounded-[32px] p-5 lg:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-colors duration-700">
                    <Reminders initialTasks={cloudTasks} />
                  </div>
                </div>
              </div>

              {/* ROW 3: UTILITY FOOTER */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div className="flex flex-col h-full rounded-[24px] lg:rounded-[32px] bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 lg:p-6 backdrop-blur-md transition-colors duration-700 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <QuickAccess />
                </div>
                <div className="flex flex-col h-full rounded-[24px] lg:rounded-[32px] bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 lg:p-6 backdrop-blur-md transition-colors duration-700 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <NotificationCenter initialNotifications={cloudNotifications} />
                </div>
                <div className="flex flex-col h-full rounded-[24px] lg:rounded-[32px] bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5 lg:p-6 backdrop-blur-md transition-colors duration-700 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <IdentityAnchor />
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* --- MOBILE-ONLY FLOATING NAVIGATION HUD --- */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[60px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-2 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
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