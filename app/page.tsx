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

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]', active: true },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
  ];

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500 selection:bg-accentCyan/30">
      
      {/* --- HUD ATMOSPHERE (RECALIBRATED FOR MOBILE) --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] lg:w-[40%] h-[40%] bg-[var(--accentCyan)]/10 rounded-full blur-[80px] lg:blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[60%] lg:w-[40%] h-[40%] bg-[var(--accentFuchsia)]/10 rounded-full blur-[80px] lg:blur-[120px] opacity-50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--borderline)_1px,transparent_1px),linear-gradient(to_bottom,var(--borderline)_1px,transparent_1px)] bg-[size:30px_30px] lg:bg-[size:40px_40px] opacity-[0.1] dark:opacity-[0.05]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentCyan)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER (COMPACT FOR SMALL SCREENS) --- */}
      <header className="h-[56px] lg:h-[64px] border-b border-borderline flex items-center justify-between px-4 lg:px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="font-orbitron font-black text-[15px] lg:text-[18px] tracking-[0.2em] flex items-center gap-2">
            <div className="w-1 h-4 lg:w-1.5 lg:h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="hidden lg:flex gap-4 border-l border-borderline pl-6 font-mono text-[9px] uppercase tracking-widest text-textSec">
            <div className="flex flex-col">
              <span>PWR: <span className="text-statusGreen">NOMINAL</span></span>
              <span>OS_UPLINK: <span className="text-[var(--accentCyan)]">STABLE</span></span>
            </div>
          </div>
        </div>

        <div className="hidden sm:block font-mono text-[10px] lg:text-[11px] tracking-[0.2em] text-textPri uppercase">
           <ArcDate />
        </div>

        <div className="flex gap-3 lg:gap-4 items-center">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:flex w-[230px] flex-col justify-between p-5 bg-surface/20 border-r border-borderline shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${
                  item.active ? 'bg-[var(--accentCyan)]/10 border-[var(--accentCyan)]/20 font-bold' : 'hover:bg-surface'
                }`}
              >
                <span className={`${item.color} text-[14px] ${item.active ? 'drop-shadow-[0_0_5px_currentColor]' : 'opacity-40 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[12px] tracking-tight ${item.active ? 'text-textPri' : 'text-textSec group-hover:text-textPri'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4"><Clock /></div>
        </aside>

        {/* --- MAIN HUD WORKSPACE (RESPONSIVE GRID) --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
            
            {/* ROW 1: MISSION & NOTIFICATIONS */}
            <div className="lg:col-span-5">
              <div className="h-full rounded-[22px] border border-borderline bg-surface/40 backdrop-blur-sm overflow-hidden min-h-[300px]">
                <TodaysCommand />
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="h-full rounded-[22px] border border-borderline bg-surface/40 backdrop-blur-sm overflow-hidden min-h-[300px]">
                <NotificationCenter />
              </div>
            </div>

            {/* ROW 2: CORE TELEMETRY */}
            <div className="md:col-span-1 lg:col-span-6">
              <div className="rounded-[22px] border border-borderline bg-surface/40 hover:border-[var(--accentFuchsia)]/40 transition-all overflow-hidden">
                <AcademicsCard />
              </div>
            </div>
            <div className="md:col-span-1 lg:col-span-6">
              <div className="rounded-[22px] border border-borderline bg-surface/40 hover:border-[var(--accentAmber)]/40 transition-all overflow-hidden">
                <ResearchCard />
              </div>
            </div>

            {/* ROW 3: BIO & STATUS */}
            <div className="md:col-span-2 lg:col-span-8">
              <div className="rounded-[22px] border border-borderline bg-surface/40 overflow-hidden">
                <FitnessCard />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <div className="bg-surface border border-borderline rounded-[22px] p-6 h-full shadow-xl relative overflow-hidden group">
                <div className="text-[10px] font-black text-[var(--accentCyan)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[var(--accentCyan)] shadow-[0_0_8px_var(--accentCyan)]"></span> Domain Status
                </div>
                <DomainHealth />
              </div>
            </div>

            {/* ROW 4: UTILITIES */}
            <div className="md:col-span-1 lg:col-span-4">
              <div className="bg-surface border border-borderline rounded-[22px] p-6 hover:border-[var(--accentIndigo)]/30 transition-all">
                <QuickAccess />
              </div>
            </div>
            <div className="md:col-span-1 lg:col-span-4">
              <div className="bg-surface border border-borderline rounded-[22px] p-6">
                <Reminders />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <IdentityAnchor />
            </div>

          </div>
        </main>

        {/* --- MOBILE HUD NAV BAR (STANDBY FOR SMALL SCREENS) --- */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-[64px] bg-base/80 backdrop-blur-2xl border border-borderline rounded-2xl z-[100] flex items-center justify-around px-2 shadow-2xl">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center gap-1 group">
               <span className={`${item.color} text-[18px] ${item.active ? 'drop-shadow-[0_0_8px_currentColor]' : 'opacity-40'}`}>
                 {item.icon}
               </span>
               <span className={`text-[8px] font-black uppercase tracking-tighter ${item.active ? 'text-textPri' : 'text-textMuted'}`}>
                 {item.name.split(' ')[0]}
               </span>
            </Link>
          ))}
          <Link href="/identity" className="w-10 h-10 rounded-full bg-surface border border-borderline flex items-center justify-center text-[18px] text-[var(--accentCyan)]">
            ⚇
          </Link>
        </nav>

      </div>
    </div>
  );
}