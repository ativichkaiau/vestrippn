'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

export default function ArchiveHub() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  if (!isLoaded) return null;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textPri', active: true },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
  ];

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accentCyan)]/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentCyan)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <header className="h-[56px] lg:h-[64px] border-b border-borderline flex items-center justify-between px-4 lg:px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="font-orbitron font-black text-[15px] lg:text-[18px] tracking-[0.2em] flex items-center gap-2">
            <div className="w-1 h-4 lg:w-1.5 lg:h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="hidden lg:flex gap-4 border-l border-borderline pl-6 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>ARCHIVE_OS: <span className="text-statusGreen">STABLE</span></span>
              <span>INDEX: <span className="text-[var(--accentCyan)]">ENCRYPTED</span></span>
            </div>
          </div>
        </div>
        <div className="hidden sm:block font-mono text-[10px] lg:text-[11px] tracking-[0.2em] text-textPri uppercase"><ArcDate /></div>
        <div className="flex gap-3 lg:gap-4 items-center">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:flex w-[230px] border-r border-borderline flex flex-col justify-between p-5 bg-surface/20 shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${
                  item.active 
                  ? 'bg-surface border-borderline shadow-[0_0_15px_rgba(255,255,255,0.05)] font-bold' 
                  : 'hover:bg-surface'
                }`}
              >
                <span className={`${item.active ? item.color : 'text-textMuted opacity-40'} text-[14px] transition-all group-hover:opacity-100`}>
                  {item.icon}
                </span>
                <span className={`text-[12px] tracking-tight transition-colors ${item.active ? 'text-textPri font-bold' : 'text-textSec group-hover:text-textPri'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4"><Clock /></div>
        </aside>

        {/* --- MAIN HUD: F1 COCKPIT ARCHIVE --- */}
        <main className="flex-1 flex flex-col gap-4 lg:gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden pb-24 lg:pb-8"> 
          
          <div className="group flex-1 bg-[#05070a] border border-white/10 rounded-[22px] shadow-2xl flex flex-col overflow-hidden relative"> 
            
            {/* RPM LED Strip (Adaptive width) */} 
            <div className="h-4 bg-[#0a0a0a] border-b border-white/5 flex justify-center items-center gap-1 lg:gap-1.5 px-2 pt-1 shrink-0"> 
              {[...Array(8)].map((_, i) => ( 
                <div key={`g-${i}`} className="flex-1 lg:w-6 h-1.5 rounded-full bg-white/5 transition-all duration-300 group-hover:bg-[var(--statusGreen)] group-hover:shadow-[0_0_8px_var(--statusGreen)]" style={{ transitionDelay: `${i * 30}ms` }}></div> 
              ))} 
              {[...Array(3)].map((_, i) => ( 
                <div key={`a-${i}`} className="flex-1 lg:w-6 h-1.5 rounded-full bg-white/5 transition-all duration-300 group-hover:bg-[var(--accentAmber)] group-hover:shadow-[0_0_8px_var(--accentAmber)]" style={{ transitionDelay: `${(i + 8) * 30}ms` }}></div> 
              ))} 
              {[...Array(2)].map((_, i) => ( 
                <div key={`r-${i}`} className="flex-1 lg:w-6 h-1.5 rounded-full bg-white/5 transition-all duration-300 group-hover:bg-[var(--statusRed)] group-hover:shadow-[0_0_8px_var(--statusRed)]" style={{ transitionDelay: `${(i + 11) * 30}ms` }}></div> 
              ))} 
            </div> 

            {/* Steering Wheel Dashboard Data (Grid on Mobile, Flex on Desktop) */} 
            <div className="grid grid-cols-2 lg:flex lg:justify-between items-center bg-[#0a0a0a] px-4 lg:px-8 py-4 lg:py-6 border-b border-white/5 shrink-0 gap-4"> 
              <div className="flex gap-6 lg:gap-10 font-mono order-2 lg:order-1"> 
                <div> 
                  <div className="text-[8px] lg:text-[9px] text-white/30 mb-0.5 uppercase tracking-widest">SPD</div> 
                  <div className="text-[18px] lg:text-[24px] text-[var(--accentCyan)] font-black leading-none font-orbitron">314</div> 
                </div> 
                <div> 
                  <div className="text-[8px] lg:text-[9px] text-white/30 mb-0.5 uppercase tracking-widest">IDX</div> 
                  <div className="text-[18px] lg:text-[24px] text-white/80 font-black leading-none font-orbitron">56.5<span className="text-[10px] opacity-40 ml-0.5">%</span></div> 
                </div> 
              </div> 
              
              <div className="flex flex-col items-center col-span-2 lg:col-span-1 order-1 lg:order-2 border-b lg:border-none border-white/5 pb-3 lg:pb-0"> 
                <div className="text-[8px] lg:text-[9px] text-white/30 mb-1 uppercase tracking-widest">TIER</div> 
                <div className="text-4xl lg:text-5xl text-[var(--statusGreen)] drop-shadow-[0_0_15px_var(--statusGreen)] font-black leading-none font-orbitron">8</div> 
              </div> 

              <div className="flex gap-6 lg:gap-10 font-mono text-right justify-end order-3"> 
                <div> 
                  <div className="text-[8px] lg:text-[9px] text-white/30 mb-0.5 uppercase tracking-widest">MODE</div> 
                  <div className="text-[18px] lg:text-[24px] text-white/80 font-black leading-none font-orbitron uppercase">V3.0</div> 
                </div> 
                <div> 
                  <div className="text-[8px] lg:text-[9px] text-white/30 mb-0.5 uppercase tracking-widest">BAT</div> 
                  <div className="text-[18px] lg:text-[24px] text-[var(--accentAmber)] font-black leading-none font-orbitron">82<span className="text-[10px] opacity-40 ml-0.5">%</span></div> 
                </div> 
              </div> 
            </div> 

            {/* Action Bar */} 
            <div className="bg-white/[0.02] px-4 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center border-b border-white/5 shrink-0 gap-3"> 
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accentCyan)] rounded-full animate-pulse shadow-[0_0_8px_var(--accentCyan)]"></div>
                <span className="text-[9px] lg:text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Target: Master Database Registry</span> 
              </div>
              <a 
                href="https://linktr.ee/shankusu.studygram" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full md:w-auto bg-[var(--accentCyan)]/10 hover:bg-[var(--accentCyan)]/20 border border-[var(--accentCyan)]/50 text-[var(--accentCyan)] px-6 py-2 rounded-lg text-[9px] lg:text-[10px] font-black tracking-[0.2em] uppercase transition-all text-center" 
              > 
                Launch Linktree ↗ 
              </a> 
            </div> 

            {/* DIRECTORY GRID (Responsive Columns) */} 
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 lg:gap-10 custom-scrollbar relative"> 
              
              {/* Sector A */} 
              <section> 
                <h3 className="font-orbitron text-[10px] lg:text-[11px] text-[var(--accentCyan)] mb-4 border-b border-white/10 pb-2 tracking-[0.3em] uppercase flex items-center gap-3"> 
                  <span className="w-1.5 h-4 bg-[var(--accentCyan)] shadow-[0_0_8px_var(--accentCyan)]"></span> Sector A: Medical Foundations 
                </h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4"> 
                  <ArchiveLink title="University Summaries" url="https://drive.google.com/drive/folders/1Wp9C_rP2ybeVUPgfXJCOganRNjuWaViS" icon="📁" /> 
                  <ArchiveLink title="Portfolio Showcase" url="https://drive.google.com/drive/folders/1-34E1ClpDxzP5-3Hr_b52svDZX7J2ucF" icon="🎯" /> 
                </div> 
              </section> 

              {/* Sector B */} 
              <section> 
                <h3 className="font-orbitron text-[10px] lg:text-[11px] text-[var(--accentAmber)] mb-4 border-b border-white/10 pb-2 tracking-[0.3em] uppercase flex items-center gap-3"> 
                  <span className="w-1.5 h-4 bg-[var(--accentAmber)] shadow-[0_0_8px_var(--accentAmber)]"></span> Sector B: Olympiad Intelligence 
                </h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"> 
                  <ArchiveLink title="Astrophysics" url="https://drive.google.com/drive/folders/1ta_ydTUk8YLe91z_tgBWawMAlxHxqs06" icon="🌌" /> 
                  <ArchiveLink title="Astronomy" url="https://drive.google.com/drive/folders/1FIy_K00EC4I9UGy-LyP0_eRxHGGkqtJZ" icon="🔭" /> 
                  <ArchiveLink title="Earth Science" url="https://drive.google.com/drive/folders/1--FnoZZe4GWo4i7YYXyzSZNjwIX5HHks" icon="🌍" /> 
                </div> 
              </section> 

              {/* Sector C */} 
              <section> 
                <h3 className="font-orbitron text-[10px] lg:text-[11px] text-[var(--statusGreen)] mb-4 border-b border-white/10 pb-2 tracking-[0.3em] uppercase flex items-center gap-3"> 
                  <span className="w-1.5 h-4 bg-[var(--statusGreen)] shadow-[0_0_8px_var(--statusGreen)]"></span> Sector C: Preparation Vault 
                </h3> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"> 
                  <ArchiveLink title="High School Notes" url="https://drive.google.com/drive/folders/1rs2HtVZBXJ_4IOf_HkPMIRCW0XwuMSk5" icon="🎒" /> 
                  <ArchiveLink title="Linguistics" url="https://drive.google.com/drive/folders/1-2RoL8dU8UjiSJZqQRIVZhh1LJ_yRgBw" icon="📝" /> 
                  <ArchiveLink title="IELTS Master" url="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR" icon="🇬🇧" /> 
                </div> 
              </section> 

            </div> 

            {/* Bottom Trim */}
            <div className="h-1.5 bg-gradient-to-r from-[var(--accentCyan)] to-transparent opacity-20"></div> 
          </div> 
        </main>

        {/* --- MOBILE HUD NAV BAR --- */}
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
          <Link href="/identity" className="w-10 h-10 rounded-full bg-surface border border-borderline flex items-center justify-center text-[18px] text-[var(--accentCyan)] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            ⚇
          </Link>
        </nav>

      </div>
    </div>
  ); 
} 

function ArchiveLink({ title, url, icon }: { title: string, url: string, icon: string }) { 
  return ( 
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group/link bg-white/[0.03] border border-white/10 p-4 lg:p-5 rounded-xl flex items-center justify-between hover:border-[var(--accentCyan)]/50 hover:bg-white/[0.05] transition-all relative overflow-hidden" 
    > 
      <div className="absolute top-0 left-0 w-1 h-full bg-white/10 group-hover/link:bg-[var(--accentCyan)] transition-all"></div> 
      <div className="flex items-center gap-3 lg:gap-4 relative z-10 min-w-0"> 
        <span className="text-xl lg:text-2xl group-hover/link:scale-125 transition-transform shrink-0">{icon}</span> 
        <span className="text-[13px] lg:text-[14px] text-white font-bold tracking-tight truncate">{title}</span> 
      </div> 
      <span className="text-white/20 group-hover/link:text-[var(--accentCyan)] transition-colors font-mono text-[8px] lg:text-[9px] uppercase tracking-widest relative z-10 shrink-0 ml-2"> 
        Access ↗ 
      </span> 
    </a> 
  ); 
}