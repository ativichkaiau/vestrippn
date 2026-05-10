'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

interface Subject { id: string; name: string; progress: number; }
interface Exam { name: string; date: Date; color: string; border: string; }

export default function Academics() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [canvasData, setCanvasData] = useState<{ subjects: Subject[], metrics: any }>({ subjects: [], metrics: { quizzes: 0, assignments: 0 } });
  const [timers, setTimers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setIsLoaded(true);
    const fetchCanvas = async () => {
      try {
        const res = await fetch('/api/canvas');
        if (res.ok) setCanvasData(await res.json());
      } catch (e) { console.error("Canvas_Sync_Fail", e); }
    };
    fetchCanvas();
  }, []);

  useEffect(() => {
    const exams: Exam[] = [
      { name: 'HEN-2', date: new Date('2026-06-09T09:00:00'), color: 'text-[var(--accentFuchsia)]', border: 'border-[var(--accentFuchsia)]' },
      { name: 'HMS-2', date: new Date('2026-06-12T09:00:00'), color: 'text-[var(--accentAmber)]', border: 'border-[var(--accentAmber)]' },
      { name: 'HNS-2', date: new Date('2026-06-16T09:00:00'), color: 'text-[var(--accentCyan)]', border: 'border-[var(--accentCyan)]' },
    ];

    const tick = setInterval(() => {
      const newTimers: { [key: string]: string } = {};
      exams.forEach(exam => {
        const diff = exam.date.getTime() - Date.now();
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / 1000 / 60) % 60);
          newTimers[exam.name] = `${d}D ${h}H ${m}M`;
        } else { newTimers[exam.name] = "STATION_ARRIVAL"; }
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]', active: true },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
  ];

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-[var(--accentFuchsia)]/5 rounded-full blur-[80px] lg:blur-[120px]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentFuchsia)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
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
              <span>ACAD_OS: <span className="text-statusGreen font-bold">NOMINAL</span></span>
              <span>UPLINK: <span className="text-[var(--accentFuchsia)] uppercase">Active</span></span>
            </div>
          </div>
        </div>
        <div className="hidden sm:block font-mono text-[10px] lg:text-[11px] tracking-[0.2em] text-textPri uppercase"><ArcDate /></div>
        <div className="flex gap-3 lg:gap-4 items-center border-l border-borderline pl-4 lg:pl-6">
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
                  ? 'bg-[var(--accentFuchsia)]/10 border-[var(--accentFuchsia)]/20 shadow-[0_0_15px_rgba(167,139,246,0.05)] font-bold' 
                  : 'hover:bg-surface'
                }`}
              >
                <span className={`${item.color} text-[14px] transition-all duration-300 ${item.active ? 'drop-shadow-[0_0_5px_currentColor]' : 'opacity-40 group-hover:opacity-100'}`}>
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

        {/* --- MAIN HUD CONTENT (RESPONSIVE) --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 pb-24 lg:pb-8">
          
          {/* SECTOR 1: EXAMINATION COUNTDOWNS */}
          <div>
            <div className="font-mono text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.3em] text-textMuted mb-4 flex items-center gap-2 px-1">
              <span className="w-1.5 h-4 bg-[var(--accentFuchsia)] shadow-[0_0_8px_var(--accentFuchsia)]"></span> Critical Milestones
            </div>
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {[
                { name: 'HEN-2', date: '09 JUN', color: 'text-[var(--accentFuchsia)]' },
                { name: 'HMS-2', date: '12 JUN', color: 'text-[var(--accentAmber)]' },
                { name: 'HNS-2', date: '16 JUN', color: 'text-[var(--accentCyan)]' }
              ].map(exam => (
                <div key={exam.name} className="bg-surface/40 border border-borderline rounded-[22px] p-5 lg:p-6 transition-all hover:border-white/20 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`font-orbitron font-black text-[16px] lg:text-[18px] ${exam.color} drop-shadow-[0_0_8px_currentColor]`}>{exam.name}</span>
                    <span className="font-mono text-[8px] lg:text-[9px] text-textMuted uppercase tracking-widest">{exam.date} // 09:00</span>
                  </div>
                  <div className="text-[20px] lg:text-[24px] font-mono font-black text-textPri tracking-tighter relative z-10">
                    {timers[exam.name] || "--D --H --M"}
                  </div>
                  <div className="text-[8px] lg:text-[9px] font-mono text-textMuted mt-2 uppercase tracking-[0.2em] opacity-60">T-Minus Terminal</div>
                </div>
              ))}
            </section>
          </div>

          {/* SECTOR 2: CANVAS TELEMETRY & DRIVE HUB */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Live Subject Telemetry */}
            <div className="lg:col-span-8 border border-borderline rounded-[22px] p-6 lg:p-8 bg-surface/30 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="font-mono text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.3em] mb-6 lg:mb-8 flex justify-between text-textMuted px-1">
                <span>Canvas Live Telemetry</span>
                <span className="text-statusGreen flex items-center gap-1">
                   <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-statusGreen rounded-full animate-pulse"></span>
                   Uplink
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                {canvasData.subjects.length > 0 ? canvasData.subjects.map(sub => (
                  <div key={sub.id} className="group/sub min-w-0">
                    <div className="flex justify-between items-center text-[10px] lg:text-[11px] mb-2 uppercase font-mono tracking-tight">
                      <span className="font-bold text-textPri group-hover/sub:text-[var(--accentCyan)] transition-colors truncate pr-2">{sub.name}</span>
                      <span className="text-[var(--accentCyan)] font-black shrink-0">{sub.progress}%</span>
                    </div>
                    <div className="h-[3px] w-full bg-borderline/30 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accentCyan)] transition-all duration-1000 shadow-[0_0_10px_var(--accentCyan)]" style={{ width: `${sub.progress}%` }}></div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-10 text-textMuted font-mono text-[9px] uppercase tracking-widest opacity-40 italic">Awaiting Mango Cloud Sync...</div>
                )}
              </div>

              <div className="mt-10 lg:mt-12 pt-6 lg:pt-8 border-t border-borderline/50 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="p-4 lg:p-5 bg-base/30 rounded-2xl border border-borderline hover:border-[var(--accentFuchsia)]/30 transition-all">
                  <div className="text-[8px] lg:text-[9px] font-mono text-textMuted uppercase mb-1 lg:mb-2 tracking-widest">Global Quiz Average</div>
                  <div className="text-[20px] lg:text-[24px] font-orbitron font-black text-[var(--accentFuchsia)] drop-shadow-[0_0_8px_var(--accentFuchsia)]">{canvasData.metrics.quizzes}%</div>
                </div>
                <div className="p-4 lg:p-5 bg-base/30 rounded-2xl border border-borderline hover:border-[var(--accentAmber)]/30 transition-all">
                  <div className="text-[8px] lg:text-[9px] font-mono text-textMuted uppercase mb-1 lg:mb-2 tracking-widest">Assignment Completion</div>
                  <div className="text-[20px] lg:text-[24px] font-orbitron font-black text-[var(--accentAmber)] drop-shadow-[0_0_8px_var(--accentAmber)]">{canvasData.metrics.assignments}%</div>
                </div>
              </div>
            </div>

            {/* Google Drive Hub (Tactical Tile) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <a 
                href="https://drive.google.com/drive/folders/1tfZ8mT6WLWOjRezS9wkdwiltd2Ov4wuB" 
                target="_blank" 
                className="flex-1 border border-borderline rounded-[22px] p-6 lg:p-8 bg-surface/30 hover:border-statusGreen/50 transition-all group flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-statusGreen opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-statusGreen/10 rounded-[22px] border border-statusGreen/20 flex items-center justify-center text-3xl lg:text-4xl mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">📂</div>
                <div className="font-orbitron font-black text-[14px] lg:text-[16px] text-textPri uppercase tracking-widest leading-tight">Textbook Hub</div>
                <div className="text-[8px] lg:text-[9px] text-textMuted font-mono mt-3 uppercase tracking-widest opacity-60">Shared_Intelligence_Vault</div>
                <div className="mt-6 lg:mt-8 px-5 py-2.5 bg-statusGreen/10 border border-statusGreen/20 rounded-full text-[9px] font-bold text-statusGreen uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">Access Cloud ↗</div>
              </a>
            </div>
          </div>

          {/* SECTOR 3: INTELLIGENCE BUFFER (NotebookLM) */}
          <section className="border border-borderline rounded-[22px] p-6 lg:p-8 bg-surface/10 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[var(--accentFuchsia)]/5 rounded-full blur-[100px]"></div>
             <div className="font-mono text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.3em] text-textPri mb-8 lg:mb-10 flex items-center gap-2 relative z-10 px-1">
                <span className="w-1.5 h-4 bg-[var(--accentFuchsia)]"></span> AI Grounding Matrix
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 relative z-10">
                <a href="https://notebooklm.google.com/notebook/db9fd595-41ad-4c0d-848c-783a972904b1" target="_blank" className="p-5 lg:p-6 border border-borderline rounded-2xl hover:border-[var(--accentFuchsia)]/50 transition-all bg-base/40 group/nb overflow-hidden">
                   <div className="flex justify-between items-center mb-3 lg:mb-4">
                      <div className="text-[8px] lg:text-[9px] font-mono text-[var(--accentFuchsia)] font-black uppercase tracking-widest">Endocrine Vault</div>
                      <span className="text-xl group-hover/nb:scale-125 transition-transform shrink-0">📔</span>
                   </div>
                   <div className="text-[13px] lg:text-[14px] font-bold text-textPri mb-1 truncate pr-4">HEN-2: Endocrine Synthesis</div>
                   <div className="text-[8px] lg:text-[9px] text-textMuted font-mono uppercase tracking-widest opacity-60">Status: Uplink_Verified</div>
                </a>
                <div className="p-5 lg:p-6 border border-borderline border-dashed rounded-2xl opacity-40 flex flex-col items-center justify-center text-center bg-base/20">
                   <span className="text-xl lg:text-2xl mb-2">⌛</span>
                   <div className="text-[8px] lg:text-[9px] font-mono uppercase tracking-widest">HNS-2 Matrix Awaiting Sync</div>
                </div>
             </div>
          </section>

          <div className="h-12 lg:h-4"></div>
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