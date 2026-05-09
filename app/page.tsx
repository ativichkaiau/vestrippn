'use client';

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
import LoginControl from '../components/LoginControl'; 
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* TOP BAR */}
      <header className="h-[56px] border-b border-borderline flex items-center justify-between px-4 md:px-6 shrink-0 bg-base">
        <div className="font-orbitron font-bold text-[15px] md:text-[18px] text-textPri uppercase tracking-wider truncate">
          vestrippn3point0
        </div>
        <div className="hidden sm:block text-[13px] text-textSec font-medium">
          <ArcDate />
        </div>
        <div className="flex gap-4 items-center text-textSec text-[14px]">
          
          {/* F1 TELEMETRY GIMMICK (Fixed Hover States & Larger Hit Area) */}
          <div className="hidden sm:flex items-center gap-1 bg-surface border border-borderline px-3 py-1 rounded">
            
            {/* SYS - Cyan */}
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#06b6d4] transition-colors duration-300">SYS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#06b6d4] group-hover:border-[#06b6d4] group-hover:shadow-[0_0_12px_#06b6d4] transition-all duration-300"></div>
            </div>

            {/* AERO - Green */}
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#22c55e] transition-colors duration-300">AERO</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#22c55e] group-hover:border-[#22c55e] group-hover:shadow-[0_0_12px_#22c55e] transition-all duration-300"></div>
            </div>

            {/* ERS - Amber */}
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#f59e0b] transition-colors duration-300">ERS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#f59e0b] group-hover:border-[#f59e0b] group-hover:shadow-[0_0_12px_#f59e0b] transition-all duration-300"></div>
            </div>

            {/* DRS - Red */}
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#ef4444] transition-colors duration-300">DRS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#ef4444] group-hover:border-[#ef4444] group-hover:shadow-[0_0_12px_#ef4444] transition-all duration-300"></div>
            </div>

          </div>

          {/* <-- 2. INJECTED HERE (Before ThemeToggle) --> */}
          <LoginControl />
          <ThemeToggle />
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-base">
        
        {/* SIDEBAR (Mobile optimized scrolling & touch targets) */}
        <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between px-4 py-3 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            
            {/* DASHBOARD - ACTIVE */}
            <div className="text-accentCyan cursor-default transition-all flex items-center gap-1.5 font-medium px-3 py-1.5 md:px-0 md:py-0 md:pl-4 bg-accentCyan/5 md:bg-transparent rounded md:rounded-none">
              <span className="text-[10px]">◉</span> Dashboard
            </div>
      
            <Link href="/academics" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Academics
            </Link>

            <Link href="/research" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Research
            </Link>

            <Link href="/fitness" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Fitness & Diet
            </Link>

            <Link href="/archive" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Archive
            </Link>
            
            <Link href="/ielts" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              IELTS
            </Link>
            
            <Link href="/tools" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">
              Tools & Links
            </Link>
            
            <Link href="/identity" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block"> 
              Identity 
            </Link>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* DASHBOARD CONTENT */}
        <main className="flex-1 flex gap-6 p-4 md:p-6 overflow-y-auto overflow-x-hidden bg-base custom-scrollbar">
          
          {/* Main Column */}
          <div className="w-full md:flex-[0.6] mx-auto flex flex-col gap-6 min-w-0 md:min-w-[400px] max-w-[900px]">
            
            {/* CARD 1: TODAY'S COMMAND */}
            <div className="flex flex-col gap-6">
              <TodaysCommand/>
              <NotificationCenter />
            </div>

            {/* CARDS 2 & 3: ACADEMICS & RESEARCH */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full"><AcademicsCard/></div>
              <div className="w-full"><ResearchCard/></div>
            </div>

            {/* CARD 4: FITNESS */}
            <FitnessCard/>
            
            {/* CARD 5: DOMAIN HEALTH */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4">Domain Health</div>
              <DomainHealth />
            </div>

            {/* CARD 6: QUICK ACCESS */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4 flex justify-between items-center">
                <span>Quick Access</span>
                <span className="text-[10px] font-mono text-textMuted hidden sm:inline">External Links</span>
              </div>
              <QuickAccess />
            </div>
           
            {/* CARD 7: REMINDERS */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors flex flex-col min-h-[250px]">
              <Reminders />
            </div>

            {/* CARD 8: IDENTITY ANCHOR */}
            <IdentityAnchor/>

          </div>
        </main>
      </div>
    </>
  );
}