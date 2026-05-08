'use client';

import Link from 'next/link';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';

export default function ToolsHub() {
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
          
          {/* F1 TELEMETRY GIMMICK */}
          <div className="hidden sm:flex items-center gap-1 bg-surface border border-borderline px-3 py-1 rounded">
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#06b6d4] transition-colors duration-300">SYS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#06b6d4] group-hover:border-[#06b6d4] group-hover:shadow-[0_0_12px_#06b6d4] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#22c55e] transition-colors duration-300">AERO</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#22c55e] group-hover:border-[#22c55e] group-hover:shadow-[0_0_12px_#22c55e] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#f59e0b] transition-colors duration-300">ERS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#f59e0b] group-hover:border-[#f59e0b] group-hover:shadow-[0_0_12px_#f59e0b] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#ef4444] transition-colors duration-300">DRS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#ef4444] group-hover:border-[#ef4444] group-hover:shadow-[0_0_12px_#ef4444] transition-all duration-300"></div>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-base">
        
        {/* SIDEBAR (Mobile optimized scrolling & touch targets) */}
        <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between px-4 py-3 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            <Link href="/" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Dashboard</Link>
            <Link href="/academics" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Academics</Link>
            <Link href="/research" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Research</Link>
            <Link href="/fitness" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Fitness & Diet</Link>
            <Link href="/archive" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Archive</Link>
            <Link href="/ielts" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>

            {/* ACTIVE: TOOLS & LINKS */}
            <div className="text-accentCyan cursor-default transition-all flex items-center gap-1.5 font-medium px-3 py-1.5 md:px-0 md:py-0 md:pl-4 bg-accentCyan/5 md:bg-transparent rounded md:rounded-none">
              <span className="text-[10px]">◉</span> Tools & Links
            </div>

            <Link href="/identity" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Identity</Link>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* TOOLS CONTENT: THE LAUNCHPAD */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto bg-base custom-scrollbar">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 mb-2 gap-2">
            <div>
              <h1 className="font-barlow text-[24px] sm:text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Global Launchpad</h1>
              <p className="text-[12px] sm:text-[13px] text-textSec mt-1">External Tools, Engines, and Integrations</p>
            </div>
          </div>

          {/* MASTER IGNITION: NOTION (Mobile Optimized Alignment) */}
          <div className="relative bg-[#0a0a0a] border border-accentCyan/50 rounded-xl p-5 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-6 shrink-0 group hover:border-accentCyan transition-colors">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-accentCyan/5 pointer-events-none group-hover:to-accentCyan/10 transition-colors"></div>
            
            <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#111] border border-accentCyan/30 rounded-lg flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                📓
              </div>
              <div className="flex-1">
                <h2 className="font-orbitron font-bold text-[16px] sm:text-[20px] text-white tracking-wider group-hover:text-accentCyan transition-colors leading-tight">2026 MASTER PLANNER</h2>
                <p className="text-[10px] sm:text-[12px] text-gray-400 font-mono mt-1 break-all sm:break-normal">WORKSPACE: NOTION_HQ | ENCRYPTED LINK</p>
              </div>
            </div>
            
            <a 
              href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 bg-accentCyan hover:bg-accentCyan/80 text-white px-6 sm:px-8 py-3 rounded text-[11px] sm:text-[12px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center gap-2 w-full lg:w-auto justify-center"
            >
              IGNITE ENGINE ↗
            </a>
          </div>

          {/* THE TOOL GRID */}
          <div className="flex flex-col gap-8 mt-2 sm:mt-4">

            {/* SECTOR A: Artificial Intelligence */}
            <div>
              <h3 className="font-orbitron text-[11px] text-[#a855f7] mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#a855f7] rounded-sm"></span> SECTOR A: AI & Synthesis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ToolLink title="ChatGPT" url="https://chat.openai.com" icon="🧠" color="hover:border-[#a855f7]" glow="group-hover/tool:text-[#a855f7]" />
                <ToolLink title="Claude" url="https://claude.ai" icon="🤖" color="hover:border-[#a855f7]" glow="group-hover/tool:text-[#a855f7]" />
                <ToolLink title="Perplexity" url="https://www.perplexity.ai" icon="🔍" color="hover:border-[#a855f7]" glow="group-hover/tool:text-[#a855f7]" />
                <ToolLink title="Memo AI" url="https://memo.ai" icon="🃏" color="hover:border-[#a855f7]" glow="group-hover/tool:text-[#a855f7]" />
                <ToolLink title="NotebookLM" url="https://notebooklm.google.com" icon="📓" color="hover:border-[#a855f7]" glow="group-hover/tool:text-[#a855f7]" />
              </div>
            </div>

            {/* SECTOR B: Development & Engineering */}
            <div>
              <h3 className="font-orbitron text-[11px] text-[#3b82f6] mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#3b82f6] rounded-sm"></span> SECTOR B: Software Engineering
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ToolLink title="GitHub" url="https://github.com" icon="🐙" color="hover:border-[#3b82f6]" glow="group-hover/tool:text-[#3b82f6]" />
                <ToolLink title="Vercel" url="https://vercel.com" icon="▲" color="hover:border-[#3b82f6]" glow="group-hover/tool:text-[#3b82f6]" />
                <ToolLink title="Next.js Docs" url="https://nextjs.org/docs" icon="⚛️" color="hover:border-[#3b82f6]" glow="group-hover/tool:text-[#3b82f6]" />
                <ToolLink title="Tailwind CSS" url="https://tailwindcss.com/docs" icon="💨" color="hover:border-[#3b82f6]" glow="group-hover/tool:text-[#3b82f6]" />
                <ToolLink title="Stack Overflow" url="https://stackoverflow.com" icon="💻" color="hover:border-[#3b82f6]" glow="group-hover/tool:text-[#3b82f6]" />
              </div>
            </div>

            {/* SECTOR C: Academic & Clinical */}
            <div>
              <h3 className="font-orbitron text-[11px] text-accentAmber mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-accentAmber rounded-sm"></span> SECTOR C: Academic & Clinical
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ToolLink title="Year 3 Calendar" url="https://docs.google.com/spreadsheets/d/1oWKicDOiqKpXXCzbd46Qu3yMV-XZnA-K/edit?gid=1369392573#gid=1369392573" icon="🗓️" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Research Tracker" url="https://docs.google.com/spreadsheets/d/1E-KPCBw3d7voDo72VYgfvEIc-TCf4gGXtmTVymA-_z8/edit?gid=0#gid=0" icon="📋" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="CMU Library" url="https://library.cmu.ac.th" icon="🏛️" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Covidence" url="https://www.covidence.org" icon="📊" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Google Scholar" url="https://scholar.google.com" icon="🎓" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Rayyan" url="https://www.rayyan.ai" icon="📑" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
              </div>
            </div>

            {/* SECTOR D: MSCA 2026 Operations */}
            <div>
              <h3 className="font-orbitron text-[11px] text-[#f43f5e] mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#f43f5e] rounded-sm"></span> SECTOR D: MSCA 2026 Operations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ToolLink title="Mega One Stop" url="https://docs.google.com/spreadsheets/d/1ciQIcqZ6fQwPqdSU3mEK3aasHcXb-yqMt1IoBlWotrU/edit?gid=2092898450#gid=2092898450" icon="🗃️" color="hover:border-[#f43f5e]" glow="group-hover/tool:text-[#f43f5e]" />
                <ToolLink title="Central PR & GD" url="https://docs.google.com/spreadsheets/d/1A1ATJuO-NXwWzdz5KFnDtw3N_6zPufOpd-FAbwAabgA/edit?ouid=101176181187135965293&usp=sheets_home&ths=true" icon="📢" color="hover:border-[#f43f5e]" glow="group-hover/tool:text-[#f43f5e]" />
                <ToolLink title="CMU-IMC Ops" url="https://docs.google.com/spreadsheets/d/1OuNCnY9GfjvLCYN8S73mUSuRs0ah0igucEA6-ROWiyI/edit?gid=1848395347#gid=1848395347" icon="⚙️" color="hover:border-[#f43f5e]" glow="group-hover/tool:text-[#f43f5e]" />
                <ToolLink title="Get Set GO" url="https://docs.google.com/spreadsheets/d/1CvvGvq0FooBNW60Khy9aO8eJ81aOT52cNbppysnCHeg/edit?gid=0#gid=0" icon="🚀" color="hover:border-[#f43f5e]" glow="group-hover/tool:text-[#f43f5e]" />
              </div>
            </div>

            {/* SECTOR E: Cloud & Utilities */}
            <div>
              <h3 className="font-orbitron text-[11px] text-statusGreen mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-statusGreen rounded-sm"></span> SECTOR E: Cloud Utilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ToolLink title="Google Drive" url="https://drive.google.com" icon="☁️" color="hover:border-statusGreen" glow="group-hover/tool:text-statusGreen" />
                <ToolLink title="Google Calendar" url="https://calendar.google.com" icon="📅" color="hover:border-statusGreen" glow="group-hover/tool:text-statusGreen" />
                <ToolLink title="Gmail" url="https://mail.google.com" icon="✉️" color="hover:border-statusGreen" glow="group-hover/tool:text-statusGreen" />
                <ToolLink title="Spotify" url="https://open.spotify.com" icon="🎧" color="hover:border-statusGreen" glow="group-hover/tool:text-statusGreen" />
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

// Reusable Subcomponent for the tool buttons 
function ToolLink({ title, url, icon, color, glow }: { title: string, url: string, icon: string, color: string, glow: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`group/tool bg-[#111] border border-[#333] p-4 sm:p-3 rounded-lg flex items-center justify-between transition-all overflow-hidden relative ${color}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <span className={`text-xl sm:text-2xl grayscale group-hover/tool:grayscale-0 transition-all ${glow}`}>{icon}</span>
        <span className={`text-[14px] sm:text-[13px] text-white font-medium truncate transition-colors ${glow}`}>{title}</span>
      </div>
      <span className={`opacity-100 sm:opacity-0 group-hover/tool:opacity-100 font-mono text-[10px] transition-all text-gray-500 sm:text-inherit ${glow}`}>
        LAUNCH ↗
      </span>
    </a>
  );
}