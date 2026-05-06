'use client';

import Link from 'next/link';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';

export default function ArchiveHub() {
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

            {/* ACTIVE: ARCHIVE */}
            <div className="text-accentCyan cursor-default transition-all flex items-center gap-1.5 font-medium px-3 py-1.5 md:px-0 md:py-0 md:pl-4 bg-accentCyan/5 md:bg-transparent rounded md:rounded-none">
              <span className="text-[10px]">◉</span> Archive
            </div>

            <Link href="/ielts" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>
            <Link href="/tools" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Tools & Links</Link>
            <Link href="/identity" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Identity</Link>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* ARCHIVE CONTENT: F1 COCKPIT */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto overflow-x-hidden bg-base">
          
          {/* HEADER SECTION (Responsive sizing) */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 mb-2 gap-3">
            <div>
              <h1 className="font-barlow text-[24px] sm:text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Telemetry Archive</h1>
              <p className="text-[12px] sm:text-[13px] text-textSec mt-1">Global Database Matrix & Identity Nodes</p>
            </div>
            <div className="flex">
              <div className="text-[10px] sm:text-[11px] font-mono text-[#22c55e] border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 sm:py-1 rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse"></span>
                SYSTEM NATIVE
              </div>
            </div>
          </div>

          {/* F1 MFD WRAPPER - ABSOLUTE DARK MODE ENFORCED */}
          <div className="group flex-1 bg-[#0a0a0a] border-4 border-[#1a1a1a] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative cursor-crosshair">
            
            {/* RPM LED Strip (Adaptive width for mobile) */}
            <div className="h-4 bg-[#111] border-b border-[#222] flex justify-center items-center gap-1 sm:gap-1.5 px-2 sm:px-4 pt-1 shrink-0">
              {[...Array(10)].map((_, i) => (
                <div key={`g-${i}`} className="w-4 sm:w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#22c55e] group-hover:shadow-[0_0_8px_rgba(34,197,94,0.8)]" style={{ transitionDelay: `${i * 30}ms` }}></div>
              ))}
              {[...Array(4)].map((_, i) => (
                <div key={`a-${i}`} className="w-4 sm:w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#f59e0b] group-hover:shadow-[0_0_8px_rgba(245,158,11,0.8)]" style={{ transitionDelay: `${(i + 10) * 30}ms` }}></div>
              ))}
              {[...Array(3)].map((_, i) => (
                <div key={`r-${i}`} className="w-4 sm:w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#ef4444] group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" style={{ transitionDelay: `${(i + 14) * 30}ms` }}></div>
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={`b-${i}`} className="w-4 sm:w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#3b82f6] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ transitionDelay: `${(i + 17) * 30}ms` }}></div>
              ))}
            </div>

            {/* Steering Wheel Dashboard Data - Responsive Grid */}
            <div className="grid grid-cols-2 md:flex md:justify-between items-center bg-[#111] px-4 sm:px-6 py-3 border-b border-[#333] shrink-0 gap-y-4">
              <div className="flex gap-4 sm:gap-6 font-mono">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 uppercase">Speed</div>
                  <div className="text-[16px] sm:text-[18px] text-[#06b6d4]/50 group-hover:text-[#06b6d4] group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-500 font-bold leading-none">
                    314<span className="text-[9px] text-gray-400 ml-1">KPH</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 uppercase">BBW</div>
                  <div className="text-[16px] sm:text-[18px] text-white/50 group-hover:text-white transition-all duration-500 font-bold leading-none">
                    56.5<span className="text-[9px] text-gray-400 ml-1">%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center order-first md:order-none col-span-2 md:col-span-1 border-b border-[#222] md:border-none pb-2 md:pb-0">
                <div className="text-[9px] sm:text-[10px] text-gray-500 mb-1 uppercase">Gear</div>
                <div className="text-3xl sm:text-4xl text-[#22c55e]/30 group-hover:text-[#22c55e] group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] transition-all duration-500 font-bold leading-none">
                  8
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6 font-mono text-right justify-end">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 uppercase">Strat</div>
                  <div className="text-[16px] sm:text-[18px] text-white/50 group-hover:text-white transition-all duration-500 font-bold leading-none uppercase">Mode 2</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 uppercase">SOC</div>
                  <div className="text-[16px] sm:text-[18px] text-[#f59e0b]/50 group-hover:text-[#f59e0b] group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition-all duration-500 font-bold leading-none">
                    82<span className="text-[9px] text-gray-400 ml-1">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-[#1a1a1a] px-4 py-2 flex flex-col sm:flex-row justify-between items-center z-10 border-b border-[#2a2a2a] shrink-0 gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono text-gray-400">TARGET: MASTER DIRECTORY</span>
              <a 
                href="https://linktr.ee/shankusu.studygram" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/50 text-[#06b6d4] px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-colors w-full sm:w-auto text-center"
              >
                OG Linktree ↗
              </a>
            </div>

            {/* NATIVE DIRECTORY (Mobile-optimized card spacing) */}
            <div className="flex-1 w-full bg-[#0a0a0a] overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 sm:gap-8 custom-scrollbar relative z-20">
              
              {/* Sector 1 */}
              <div>
                <h3 className="font-orbitron text-[11px] text-[#06b6d4] mb-3 border-b border-[#222] pb-1 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#06b6d4] rounded-sm"></span> SECTOR A: Medicine & Portfolio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ArchiveLink title="University Summaries" url="https://drive.google.com/drive/folders/1Wp9C_rP2ybeVUPgfXJCOganRNjuWaViS" icon="📁" />
                  <ArchiveLink title="Portfolio Giveaway" url="https://drive.google.com/drive/folders/1-34E1ClpDxzP5-3Hr_b52svDZX7J2ucF" icon="🎯" />
                </div>
              </div>

              {/* Sector 2 */}
              <div>
                <h3 className="font-orbitron text-[11px] text-[#f59e0b] mb-3 border-b border-[#222] pb-1 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#f59e0b] rounded-sm"></span> SECTOR B: Olympiad Archives
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ArchiveLink title="Astrophysics Olympiad" url="https://drive.google.com/drive/folders/1ta_ydTUk8YLe91z_tgBWawMAlxHxqs06" icon="🌌" />
                  <ArchiveLink title="Astronomy Olympiad" url="https://drive.google.com/drive/folders/1FIy_K00EC4I9UGy-LyP0_eRxHGGkqtJZ" icon="🔭" />
                  <ArchiveLink title="Earth Science Olympiad" url="https://drive.google.com/drive/folders/1--FnoZZe4GWo4i7YYXyzSZNjwIX5HHks" icon="🌍" />
                </div>
              </div>

              {/* Sector 3 */}
              <div>
                <h3 className="font-orbitron text-[11px] text-[#22c55e] mb-3 border-b border-[#222] pb-1 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#22c55e] rounded-sm"></span> SECTOR C: Foundations & Prep
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ArchiveLink title="High School Notes" url="https://drive.google.com/drive/folders/1rs2HtVZBXJ_4IOf_HkPMIRCW0XwuMSk5" icon="🎒" />
                  <ArchiveLink title="English Notes" url="https://drive.google.com/drive/folders/1-2RoL8dU8UjiSJZqQRIVZhh1LJ_yRgBw" icon="📝" />
                  <ArchiveLink title="IELTS Preparation" url="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR" icon="🇬🇧" />
                </div>
              </div>

            </div>

            <div className="h-2 bg-[#111] border-t border-[#333] shrink-0"></div>
          </div>
        </main>
      </div>
    </>
  );
}

function ArchiveLink({ title, url, icon }: { title: string, url: string, icon: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group/link bg-[#111] border border-[#222] p-4 sm:p-3 rounded-lg flex items-center justify-between hover:border-[#06b6d4] hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all overflow-hidden relative z-30"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#222] group-hover/link:bg-[#06b6d4] transition-colors"></div>
      <div className="flex items-center gap-3 pl-2">
        <span className="text-xl grayscale group-hover/link:grayscale-0 transition-all">{icon}</span>
        <span className="text-[13px] sm:text-[13px] text-white font-medium truncate max-w-[150px] sm:max-w-none">{title}</span>
      </div>
      <span className="text-gray-500 group-hover/link:text-[#06b6d4] transition-colors opacity-0 sm:opacity-50 group-hover/link:opacity-100 font-mono text-[10px]">
        ACCESS ↗
      </span>
    </a>
  );
}