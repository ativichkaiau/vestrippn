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

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accentFuchsia)]/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentFuchsia)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <header className="h-[64px] border-b border-borderline flex items-center justify-between px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-orbitron font-black text-[18px] tracking-[0.2em] flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-1.5 h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_rgba(0,194,255,0.5)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="h-5 w-[1px] bg-borderline mx-2"></div>
          <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>ACAD_OS: <span className="text-statusGreen">NOMINAL</span></span>
              <span>SYNC: <span className="text-[var(--accentFuchsia)]">ENCRYPTED</span></span>
            </div>
          </div>
        </div>

        <div className="hidden md:block font-mono text-[11px] tracking-[0.2em] text-textPri">
          SUNDAY, MAY 10 | <span className="text-textMuted">DAY 18 OF 30</span>
        </div>

        <div className="flex gap-4 items-center border-l border-borderline pl-6">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- NAV SIDEBAR (RECALIBRATED) --- */}
        <aside className="w-[230px] border-r border-borderline flex flex-col justify-between p-5 bg-surface/20 shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {[
              { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
              { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]', active: true },
              { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
              { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
              { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
              { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
              { name: 'Tools & Links', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
              { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${
                  item.active 
                  ? 'bg-[var(--accentFuchsia)]/10 border-[var(--accentFuchsia)]/20 shadow-[0_0_15px_rgba(167,139,250,0.05)]' 
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
          <div className="p-4 rounded-2xl bg-surface border border-borderline">
            <Clock />
          </div>
        </aside>

        {/* --- MAIN HUD CONTENT --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          
          {/* SECTOR 1: EXAMINATION COUNTDOWNS */}
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-textMuted mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[var(--accentFuchsia)] shadow-[0_0_8px_var(--accentFuchsia)]"></span> Critical Milestones
          </div>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'HEN-2', date: '09 JUN', color: 'text-[var(--accentFuchsia)]', border: 'border-[var(--accentFuchsia)]/30' },
              { name: 'HMS-2', date: '12 JUN', color: 'text-[var(--accentAmber)]', border: 'border-[var(--accentAmber)]/30' },
              { name: 'HNS-2', date: '16 JUN', color: 'text-[var(--accentCyan)]', border: 'border-[var(--accentCyan)]/30' }
            ].map(exam => (
              <div key={exam.name} className={`bg-surface/40 border border-borderline rounded-[22px] p-6 transition-all hover:scale-[1.02] hover:border-white/30 group shadow-xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className={`font-orbitron font-black text-[18px] ${exam.color} drop-shadow-[0_0_8px_currentColor]`}>{exam.name}</span>
                  <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest">{exam.date} // 09:00</span>
                </div>
                <div className="text-[24px] font-mono font-black text-textPri tracking-tighter relative z-10">
                  {timers[exam.name] || "--D --H --M"}
                </div>
                <div className="text-[9px] font-mono text-textMuted mt-2 uppercase tracking-[0.2em] opacity-60">System_Clock // T-Minus</div>
              </div>
            ))}
          </section>

          {/* SECTOR 2: CANVAS TELEMETRY & DRIVE HUB */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Live Subject Telemetry */}
            <div className="lg:col-span-8 border border-borderline rounded-[22px] p-8 bg-surface/30 backdrop-blur-sm shadow-xl">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] mb-8 flex justify-between text-textMuted">
                <span>Canvas Live Telemetry</span>
                <span className="text-statusGreen flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-statusGreen rounded-full animate-pulse"></span>
                   Uplink Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {canvasData.subjects.length > 0 ? canvasData.subjects.map(sub => (
                  <div key={sub.id} className="group/sub">
                    <div className="flex justify-between items-center text-[11px] mb-2 uppercase font-mono tracking-tight">
                      <span className="font-bold text-textPri group-hover/sub:text-[var(--accentCyan)] transition-colors">{sub.name}</span>
                      <span className="text-[var(--accentCyan)] font-black">{sub.progress}%</span>
                    </div>
                    <div className="h-[3px] w-full bg-borderline/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--accentCyan)] transition-all duration-1000 shadow-[0_0_10px_var(--accentCyan)]" 
                        style={{ width: `${sub.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-10 text-textMuted font-mono text-[10px] uppercase tracking-widest opacity-40">
                    Awaiting Handshake with Mango Cloud...
                  </div>
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-borderline/50 grid grid-cols-2 gap-6">
                <div className="p-5 bg-base/30 rounded-2xl border border-borderline hover:border-[var(--accentFuchsia)]/30 transition-all group/stat">
                  <div className="text-[9px] font-mono text-textMuted uppercase mb-2 tracking-widest">Global Quiz Average</div>
                  <div className="text-2xl font-orbitron font-black text-[var(--accentFuchsia)] drop-shadow-[0_0_8px_var(--accentFuchsia)]">{canvasData.metrics.quizzes}%</div>
                </div>
                <div className="p-5 bg-base/30 rounded-2xl border border-borderline hover:border-[var(--accentAmber)]/30 transition-all group/stat">
                  <div className="text-[9px] font-mono text-textMuted uppercase mb-2 tracking-widest">Assignment Completion</div>
                  <div className="text-2xl font-orbitron font-black text-[var(--accentAmber)] drop-shadow-[0_0_8px_var(--accentAmber)]">{canvasData.metrics.assignments}%</div>
                </div>
              </div>
            </div>

            {/* Google Drive Hub (Tactical Tile) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <a 
                href="https://drive.google.com/drive/folders/1tfZ8mT6WLWOjRezS9wkdwiltd2Ov4wuB" 
                target="_blank" 
                className="flex-1 border border-borderline rounded-[22px] p-8 bg-surface/30 hover:border-statusGreen/50 transition-all group flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-statusGreen opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-20 h-20 bg-statusGreen/10 rounded-[22px] border border-statusGreen/20 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  📂
                </div>
                <div className="font-orbitron font-black text-[16px] text-textPri uppercase tracking-widest">Textbook Hub</div>
                <div className="text-[9px] text-textMuted font-mono mt-3 uppercase tracking-widest opacity-60">G_Drive // Shared Intelligence</div>
                <div className="mt-8 px-6 py-2.5 bg-statusGreen/10 border border-statusGreen/20 rounded-full text-[10px] font-bold text-statusGreen uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
                  Access Cloud_Vault ↗
                </div>
              </a>
            </div>
          </div>

          {/* SECTOR 3: INTELLIGENCE BUFFER (NotebookLM) */}
          <section className="border border-borderline rounded-[22px] p-8 bg-surface/10 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[var(--accentFuchsia)]/5 rounded-full blur-[100px]"></div>
             <div className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-textPri mb-10 flex items-center gap-2 relative z-10">
                <span className="w-1.5 h-4 bg-[var(--accentFuchsia)]"></span> Intelligence Buffer // AI Grounding
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <a href="https://notebooklm.google.com/notebook/db9fd595-41ad-4c0d-848c-783a972904b1" target="_blank" className="p-6 border border-borderline rounded-2xl hover:border-[var(--accentFuchsia)]/50 transition-all bg-base/40 group/nb">
                   <div className="flex justify-between items-center mb-4">
                      <div className="text-[10px] font-mono text-[var(--accentFuchsia)] font-black uppercase tracking-widest">Endocrine Vault</div>
                      <span className="text-xl group-hover/nb:scale-125 transition-transform">📔</span>
                   </div>
                   <div className="text-[15px] font-bold text-textPri mb-1">HEN-2: Endocrine Synthesis</div>
                   <div className="text-[10px] text-textMuted font-mono uppercase">Status: Grounding_Active</div>
                </a>
                <div className="p-6 border border-borderline border-dashed rounded-2xl opacity-40 flex flex-col items-center justify-center text-center bg-base/20 group/nb">
                   <span className="text-2xl mb-2">⌛</span>
                   <div className="text-[10px] font-mono uppercase tracking-widest">HNS-2 Vault Awaiting Sync</div>
                </div>
             </div>
          </section>

          <div className="h-12"></div>
        </main>
      </div>
    </div>
  );
}