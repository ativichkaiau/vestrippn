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

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500 selection:bg-accentCyan/30">
      
      {/* --- HUD ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accentCyan)]/10 rounded-full blur-[120px] dark:opacity-100 opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accentFuchsia)]/10 rounded-full blur-[120px] dark:opacity-100 opacity-50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--borderline)_1px,transparent_1px),linear-gradient(to_bottom,var(--borderline)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15] dark:opacity-[0.07]"></div>
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentCyan)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <header className="h-[60px] border-b border-borderline flex items-center justify-between px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-orbitron font-black text-[17px] tracking-[0.2em] flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-1.5 h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_rgba(6,182,212,0.5)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          
          <div className="hidden lg:flex gap-4 border-l border-borderline pl-6 font-mono text-[9px] uppercase tracking-widest text-textSec">
            <div className="flex flex-col">
              <span>PWR: <span className="text-[var(--statusGreen)]">NOMINAL</span></span>
              <span>OS: <span className="text-[var(--accentCyan)] uppercase">Stable</span></span>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
           <div className="font-mono text-[11px] tracking-[0.2em] text-textPri uppercase">
              <ArcDate />
           </div>
        </div>

        <div className="flex gap-4 items-center">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- NAV SIDEBAR (RECALIBRATED) --- */}
        <aside className="hidden md:flex w-[230px] flex-col justify-between p-5 bg-surface/20 border-r border-borderline shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {[
              { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]', active: true },
              { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
              { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
              { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
              { name: 'Archive', icon: '▥', href: '/archive', color: 'text-[var(--textSec)]' },
              { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
              { name: 'Tools & Links', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
              { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${
                  item.active 
                  ? 'bg-[var(--accentCyan)]/10 border-[var(--accentCyan)]/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]' 
                  : 'hover:bg-surface hover:border-borderline'
                }`}
              >
                <span className={`${item.color} text-[14px] ${item.active ? 'drop-shadow-[0_0_5px_currentColor]' : 'opacity-40 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[12px] font-medium tracking-tight ${item.active ? 'text-textPri font-bold' : 'text-textSec group-hover:text-textPri'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4">
            <Clock />
          </div>
        </aside>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* MISSION CONTROL */}
            <div className="lg:col-span-5 min-w-0">
               <div className="h-full rounded-[22px] border border-borderline bg-surface/40 backdrop-blur-sm hover:border-[var(--accentCyan)]/50 transition-all overflow-hidden">
                  <TodaysCommand />
               </div>
            </div>

            <div className="lg:col-span-7 min-w-0">
               <div className="h-full rounded-[22px] border border-borderline bg-surface/40 backdrop-blur-sm overflow-hidden">
                  <NotificationCenter />
               </div>
            </div>

            {/* CORE TELEMETRY */}
            <div className="lg:col-span-6 min-w-0">
              <div className="rounded-[22px] border border-borderline bg-surface/40 hover:border-[var(--accentFuchsia)]/40 hover:shadow-[0_0_30px_rgba(217,70,239,0.05)] transition-all overflow-hidden">
                <AcademicsCard />
              </div>
            </div>

            <div className="lg:col-span-6 min-w-0">
              <div className="rounded-[22px] border border-borderline bg-surface/40 hover:border-[var(--accentAmber)]/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] transition-all overflow-hidden">
                <ResearchCard />
              </div>
            </div>

            {/* BIO-METRICS */}
            <div className="lg:col-span-8 min-w-0">
              <div className="rounded-[22px] border border-borderline bg-surface/40 hover:border-[var(--accentEmerald)]/40 h-full overflow-hidden transition-all">
                <FitnessCard />
              </div>
            </div>

            <div className="lg:col-span-4 min-w-0">
              <div className="bg-surface border border-borderline rounded-[22px] p-6 h-full shadow-sm relative overflow-hidden group">
                <div className="text-[10px] font-black text-[var(--accentCyan)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[var(--accentCyan)]"></span> Domain Status
                </div>
                <DomainHealth />
              </div>
            </div>

            {/* UTILITIES */}
            <div className="lg:col-span-4 min-w-0">
              <div className="bg-surface border border-borderline rounded-2xl p-6 hover:border-[var(--accentIndigo)]/30 transition-all">
                <QuickAccess />
              </div>
            </div>
            <div className="lg:col-span-4 min-w-0">
              <div className="bg-surface border border-borderline rounded-2xl p-6">
                <Reminders />
              </div>
            </div>
            <div className="lg:col-span-4 min-w-0">
              <IdentityAnchor />
            </div>

          </div>
          <div className="h-10"></div>
        </main>
      </div>
    </div>
  );
}