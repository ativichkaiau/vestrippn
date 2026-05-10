'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

export default function ToolsHub() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accentIndigo)]/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentIndigo)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <header className="h-[64px] border-b border-borderline flex items-center justify-between px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-orbitron font-black text-[18px] tracking-[0.2em] flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-1.5 h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="h-5 w-[1px] bg-borderline mx-2"></div>
          <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>LAUNCH_OS: <span className="text-statusGreen font-bold">NOMINAL</span></span>
              <span>INDEX: <span className="text-[var(--accentIndigo)] uppercase tracking-tighter">Verified</span></span>
            </div>
          </div>
        </div>
        <div className="hidden md:block font-mono text-[11px] tracking-[0.2em] text-textPri uppercase"><ArcDate /></div>
        <div className="flex gap-4 items-center border-l border-borderline pl-6">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- NAV SIDEBAR (SYNCED MANIFEST) --- */}
        <aside className="w-[230px] border-r border-borderline flex flex-col justify-between p-5 bg-surface/20 shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {[
              { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
              { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
              { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
              { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
              { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
              { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
              { name: 'Tools & Links', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]', active: true },
              { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
            ].map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${item.active ? 'bg-[var(--accentIndigo)]/10 border-[var(--accentIndigo)]/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] font-bold' : 'hover:bg-surface'}`}>
                <span className={`text-[14px] transition-all ${item.active ? `${item.color} drop-shadow-[0_0_5px_currentColor]` : 'text-textMuted opacity-40 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={`text-[12px] tracking-tight ${item.active ? 'text-textPri font-bold' : 'text-textSec group-hover:text-textPri'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4"><Clock /></div>
        </aside>

        {/* --- MAIN HUD CONTENT (SCROLLABLE) --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
          
          {/* MASTER IGNITION: NOTION PLANNER */}
          <section className="relative bg-surface/40 border border-borderline rounded-[22px] p-8 shadow-xl overflow-hidden group hover:border-[var(--accentCyan)]/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accentCyan)]/[0.02] to-transparent group-hover:via-[var(--accentCyan)]/[0.05] transition-all"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-base/50 border border-[var(--accentCyan)]/30 rounded-[22px] flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">📓</div>
                <div>
                  <h2 className="font-orbitron font-black text-[22px] text-textPri uppercase tracking-widest leading-none">2026 Master Planner</h2>
                  <p className="text-[10px] font-mono text-textMuted uppercase tracking-[0.3em] mt-3">Workspace: Notion_HQ | System_Encrypted</p>
                </div>
              </div>
              <a 
                href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938" 
                target="_blank" 
                className="bg-[var(--accentCyan)] text-white font-black text-[12px] px-10 py-4 rounded-xl hover:shadow-[0_0_20px_var(--accentCyan)] transition-all uppercase tracking-[0.2em]"
              >
                Ignite Engine ↗
              </a>
            </div>
          </section>

          {/* THE TOOL MATRIX */}
          <div className="space-y-12">

            {/* SECTOR A: AI & SYNTHESIS */}
            <SectorContainer label="Sector A: AI & Synthesis" color="var(--accentFuchsia)">
              <ToolTile title="ChatGPT" url="https://chat.openai.com" icon="🧠" color="var(--accentFuchsia)" />
              <ToolTile title="Claude" url="https://claude.ai" icon="🤖" color="var(--accentFuchsia)" />
              <ToolTile title="Perplexity" url="https://www.perplexity.ai" icon="🔍" color="var(--accentFuchsia)" />
              <ToolTile title="Memo AI" url="https://memo.ai" icon="🃏" color="var(--accentFuchsia)" />
              <ToolTile title="NotebookLM" url="https://notebooklm.google.com" icon="📓" color="var(--accentFuchsia)" />
            </SectorContainer>

            {/* SECTOR B: SOFTWARE ENGINEERING */}
            <SectorContainer label="Sector B: Software Engineering" color="var(--accentIndigo)">
              <ToolTile title="GitHub" url="https://github.com" icon="🐙" color="var(--accentIndigo)" />
              <ToolTile title="Vercel" url="https://vercel.com" icon="▲" color="var(--accentIndigo)" />
              <ToolTile title="Next.js Docs" url="https://nextjs.org/docs" icon="⚛️" color="var(--accentIndigo)" />
              <ToolTile title="Tailwind CSS" url="https://tailwindcss.com" icon="💨" color="var(--accentIndigo)" />
              <ToolTile title="Stack Overflow" url="https://stackoverflow.com" icon="💻" color="var(--accentIndigo)" />
            </SectorContainer>

            {/* SECTOR C: ACADEMIC & CLINICAL */}
            <SectorContainer label="Sector C: Academic & Clinical" color="var(--accentAmber)">
              <ToolTile title="Year 3 Calendar" url="https://docs.google.com/spreadsheets/d/1oWKicDOiqKpXXCzbd46Qu3yMV-XZnA-K" icon="🗓️" color="var(--accentAmber)" />
              <ToolTile title="Research Tracker" url="https://docs.google.com/spreadsheets/d/1E-KPCBw3d7voDo72VYgfvEIc-TCf4gGXtmTVymA-_z8" icon="📋" color="var(--accentAmber)" />
              <ToolTile title="CMU Library" url="https://library.cmu.ac.th" icon="🏛️" color="var(--accentAmber)" />
              <ToolTile title="Covidence" url="https://www.covidence.org" icon="📊" color="var(--accentAmber)" />
              <ToolTile title="Rayyan AI" url="https://www.rayyan.ai" icon="📑" color="var(--accentAmber)" />
            </SectorContainer>

            {/* SECTOR D: MSCA 2026 OPERATIONS */}
            <SectorContainer label="Sector D: MSCA 2026 Operations" color="var(--statusRed)">
              <ToolTile title="Mega One Stop" url="https://docs.google.com/spreadsheets/d/1ciQIcqZ6fQwPqdSU3mEK3aasHcXb-yqMt1IoBlWotrU" icon="🗃️" color="var(--statusRed)" />
              <ToolTile title="Central PR" url="https://docs.google.com/spreadsheets/d/1A1ATJuO-NXwWzdz5KFnDtw3N_6zPufOpd-FAbwAabgA" icon="📢" color="var(--statusRed)" />
              <ToolTile title="CMU-IMC Ops" url="https://docs.google.com/spreadsheets/d/1OuNCnY9GfjvLCYN8S73mUSuRs0ah0igucEA6-ROWiyI" icon="⚙️" color="var(--statusRed)" />
              <ToolTile title="Get Set GO" url="https://docs.google.com/spreadsheets/d/1CvvGvq0FooBNW60Khy9aO8eJ81aOT52cNbppysnCHeg" icon="🚀" color="var(--statusRed)" />
            </SectorContainer>

            {/* SECTOR E: CLOUD UTILITIES */}
            <SectorContainer label="Sector E: Cloud Utilities" color="var(--accentEmerald)">
              <ToolTile title="Google Drive" url="https://drive.google.com" icon="☁️" color="var(--accentEmerald)" />
              <ToolTile title="Google Calendar" url="https://calendar.google.com" icon="📅" color="var(--accentEmerald)" />
              <ToolTile title="Gmail" url="https://mail.google.com" icon="✉️" color="var(--accentEmerald)" />
              <ToolTile title="Spotify" url="https://spotify.com" icon="🎧" color="var(--accentEmerald)" />
            </SectorContainer>

          </div>

          <div className="h-12"></div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SectorContainer({ label, color, children }: { label: string, color: string, children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-4 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: color, color }}></div>
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-textPri">{label}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

function ToolTile({ title, url, icon, color }: { title: string, url: string, icon: string, color: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative bg-surface/30 border border-borderline rounded-[20px] p-5 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }}></div>
      <div className="flex items-center gap-4 relative z-10">
        <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{icon}</span>
        <span className="text-[13px] text-textSec font-bold tracking-tight group-hover:text-textPri transition-colors">{title}</span>
      </div>
      <span className="text-[9px] font-mono font-black text-textMuted uppercase tracking-widest opacity-0 group-hover:opacity-50 transition-opacity relative z-10">Launch ↗</span>
    </a>
  );
}