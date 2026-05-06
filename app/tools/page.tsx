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
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between p-4 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10">
          <nav className="flex flex-row md:flex-col gap-6 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            <Link href="/" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Dashboard</Link>
            <Link href="/academics" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Academics</Link>
            <Link href="/research" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Research</Link>
            <Link href="/fitness" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Fitness & Diet</Link>
            <Link href="/archive" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Archive</Link>
            <Link href="/ielts" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>

            {/* ACTIVE: TOOLS & LINKS */}
            <div className="text-accentCyan cursor-pointer transition-all flex items-center gap-2 font-medium">
              <span className="text-[10px] hidden md:block">◉</span> Tools & Links
            </div>

            <div className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Identity</div>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* TOOLS CONTENT: THE LAUNCHPAD */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto bg-base custom-scrollbar">
          
          {/* HEADER SECTION */}
          <div className="flex justify-between items-end shrink-0 mb-2">
            <div>
              <h1 className="font-barlow text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Global Launchpad</h1>
              <p className="text-[13px] text-textSec mt-1">External Tools, Engines, and Integrations</p>
            </div>
          </div>

          {/* MASTER IGNITION: NOTION (Absolute Dark Mode Enforced) */}
          <div className="relative bg-[#0a0a0a] border border-accentCyan/50 rounded-xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 group hover:border-accentCyan transition-colors">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-accentCyan/5 pointer-events-none group-hover:to-accentCyan/10 transition-colors"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-[#111] border border-accentCyan/30 rounded-lg flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                📓
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-[20px] text-white tracking-wider group-hover:text-accentCyan transition-colors">2026 MASTER PLANNER</h2>
                <p className="text-[12px] text-gray-400 font-mono">WORKSPACE: NOTION_HQ | ENCRYPTED LINK</p>
              </div>
            </div>
            
            <a 
              href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 bg-accentCyan hover:bg-accentCyan/80 text-white px-8 py-3 rounded text-[12px] font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center gap-2 w-full md:w-auto justify-center"
            >
              IGNITE ENGINE ↗
            </a>
          </div>

          {/* THE TOOL GRID */}
          <div className="flex flex-col gap-8 mt-4">

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

            {/* SECTOR C: Research & Clinical */}
            <div>
              <h3 className="font-orbitron text-[11px] text-accentAmber mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-accentAmber rounded-sm"></span> SECTOR C: Academic & Clinical
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <ToolLink title="CMU Library" url="https://library.cmu.ac.th" icon="🏛️" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Covidence" url="https://www.covidence.org" icon="📊" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Google Scholar" url="https://scholar.google.com" icon="🎓" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
                <ToolLink title="Rayyan" url="https://www.rayyan.ai" icon="📑" color="hover:border-accentAmber" glow="group-hover/tool:text-accentAmber" />
              </div>
            </div>

            {/* SECTOR D: Cloud & Utilities */}
            <div>
              <h3 className="font-orbitron text-[11px] text-statusGreen mb-3 border-b border-borderline pb-1 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-statusGreen rounded-sm"></span> SECTOR D: Cloud Utilities
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

// Reusable Subcomponent for the tool buttons - hardcoded for dark mode readability
function ToolLink({ title, url, icon, color, glow }: { title: string, url: string, icon: string, color: string, glow: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`group/tool bg-[#111] border border-[#333] p-3 rounded-lg flex items-center justify-between transition-all overflow-hidden relative ${color}`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-xl grayscale group-hover/tool:grayscale-0 transition-all ${glow}`}>{icon}</span>
        <span className={`text-[13px] text-white font-medium truncate transition-colors ${glow}`}>{title}</span>
      </div>
      <span className={`opacity-0 group-hover/tool:opacity-100 font-mono text-[10px] transition-all ${glow}`}>
        LAUNCH ↗
      </span>
    </a>
  );
}