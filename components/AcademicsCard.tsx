'use client';

import { useState, useEffect } from 'react';

interface Subject { id: string; name: string; progress: number; }
interface AcademicsData {
  subjects: Subject[];
  metrics: { quizzes: number; assignments: number; };
}

export default function AcademicsCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<AcademicsData>({ subjects: [], metrics: { quizzes: 0, assignments: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const fetchCanvasData = async () => {
      try {
        const response = await fetch('/api/canvas');
        if (!response.ok) throw new Error(`${response.status}`);
        const json = await response.json();
        setData({
          subjects: Array.isArray(json.subjects) ? json.subjects : [],
          metrics: json.metrics || { quizzes: 0, assignments: 0 }
        });
      } catch (e: any) {
        setError(e.message === '500' ? 'SERVER_OFFLINE' : 'SYNC_ERR');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCanvasData();
  }, []);

  const overallProgress = data.subjects?.length > 0 
    ? Math.round(data.subjects.reduce((sum, sub) => sum + sub.progress, 0) / data.subjects.length)
    : 0;

  if (!isMounted) return <div className="h-[260px] bg-[var(--surface)]/20 border border-[var(--borderline)] rounded-[22px] animate-pulse" />;

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * overallProgress) / 100;

  return (
    <div className="bg-[var(--surface)]/40 border border-[var(--borderline)] rounded-[22px] p-6 shadow-2xl flex flex-col h-full relative overflow-hidden transition-all duration-500 hover:border-[var(--accentCyan)]/50 group">
      
      {/* HUD SCANLINES */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--textPri)]">Academics</span>
        </div>
        <div className="flex items-center gap-2">
          {error ? (
            <span className="text-[var(--statusRed)] text-[9px] font-mono animate-pulse uppercase">{error}</span>
          ) : (
            <span className="text-[var(--textMuted)] text-[9px] font-mono uppercase tracking-[0.2em]">{isLoading ? 'Syncing...' : 'Canvas_Link: OK'}</span>
          )}
        </div>
      </div>

      {/* MAIN TELEMETRY SECTOR */}
      <div className="flex gap-8 items-center mb-8 relative z-10">
        
        {/* PROGRESS RING (The Glow Center) */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--borderline)]/20" />
            <circle
              cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[var(--accentCyan)] transition-all duration-1000 ease-in-out drop-shadow-[0_0_10px_var(--accentCyan)]"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[22px] font-orbitron font-black text-[var(--textPri)] drop-shadow-[0_0_8px_var(--accentCyan)]">{overallProgress}%</span>
          </div>
        </div>

        {/* LIVE SUBJECT BARS (Hardcoded for Vibrance) */}
        <div className="flex-1 space-y-4">
          {data.subjects.length > 0 ? data.subjects.map((sub) => (
            <div key={sub.id} className="group/item">
              <div className="flex justify-between text-[10px] font-mono mb-1.5 uppercase font-bold">
                <span className="text-[var(--textSec)] tracking-tighter truncate max-w-[120px] group-hover/item:text-[var(--textPri)] transition-colors">{sub.name}</span>
                <span className="text-[var(--accentCyan)] drop-shadow-[0_0_4px_var(--accentCyan)]">{sub.progress}%</span>
              </div>
              <div className="h-[3px] w-full bg-[var(--borderline)]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accentCyan)] shadow-[0_0_8px_var(--accentCyan)] transition-all duration-1000"
                  style={{ width: `${sub.progress}%` }}
                ></div>
              </div>
            </div>
          )) : (
            <div className="text-[10px] font-mono text-[var(--textMuted)] italic py-2">Establishing Uplink...</div>
          )}
        </div>
      </div>

      {/* SUB-METRICS: The Neon Finish */}
      <div className="grid grid-cols-2 gap-6 mt-auto pt-5 border-t border-[var(--borderline)]/30 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] font-mono font-black uppercase tracking-widest">
            <span className="text-[var(--textMuted)]">Quizzes</span>
            <span className="text-[var(--accentFuchsia)] drop-shadow-[0_0_5px_var(--accentFuchsia)]">{data.metrics.quizzes}%</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--borderline)]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accentFuchsia)] shadow-[0_0_8px_var(--accentFuchsia)] transition-all duration-1000" style={{ width: `${data.metrics.quizzes}%` }}></div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] font-mono font-black uppercase tracking-widest">
            <span className="text-[var(--textMuted)]">Assignments</span>
            <span className="text-[var(--accentAmber)] drop-shadow-[0_0_5px_var(--accentAmber)]">{data.metrics.assignments}%</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--borderline)]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accentAmber)] shadow-[0_0_8px_var(--accentAmber)] transition-all duration-1000" style={{ width: `${data.metrics.assignments}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  );
}