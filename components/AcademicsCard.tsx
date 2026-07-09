'use client';

import { useState, useEffect } from 'react';

interface Subject { id: string; name: string; progress: number | null; }
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
        // 🚨 THE FIX: Aggressive Cache Busting
        // This forces Next.js and Vercel's CDN to bypass all cached files and fetch fresh telemetry.
        const response = await fetch(`/api/canvas?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
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

  // Average over graded subjects only (null = no data yet), so ungraded
  // courses don't drag the ring down — same treatment as the Academics hub.
  const graded = data.subjects.filter((s) => s.progress !== null);
  const overallProgress = graded.length > 0
    ? Math.round(graded.reduce((sum, sub) => sum + (sub.progress ?? 0), 0) / graded.length)
    : 0;

  // Clean, day/night compatible skeleton loader
  if (!isMounted) return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="h-24 bg-black/5 dark:bg-white/5 rounded-2xl w-full"></div>
      <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl w-full"></div>
    </div>
  );

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * overallProgress) / 100;

  return (
    <div className="flex flex-col h-full w-full relative group">
      
      {/* STATUS INDICATOR */}
      <div className="absolute -top-12 right-0 flex items-center gap-2">
        {error ? (
          <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">{error}</span>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5">
            <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span className="text-[10px] font-bold tracking-wide text-neutral-500 dark:text-neutral-400 uppercase">
              {isLoading ? 'Syncing' : 'Live'}
            </span>
          </div>
        )}
      </div>

      {/* MAIN TELEMETRY SECTOR */}
      <div className="flex flex-col sm:flex-row gap-8 items-center mb-8">
        
        {/* PROGRESS RING */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background Track */}
            <circle 
              cx="56" cy="56" r={radius} 
              stroke="currentColor" strokeWidth="6" fill="transparent" 
              className="text-black/5 dark:text-white/10 transition-colors duration-700" 
            />
            {/* Progress Fill */}
            <circle
              cx="56" cy="56" r={radius} 
              stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[26px] font-black tracking-tighter text-neutral-900 dark:text-white transition-colors duration-700">
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* LIVE SUBJECT BARS */}
        <div className="flex-1 w-full space-y-5">
          {data.subjects.length > 0 ? data.subjects.map((sub) => (
            <div key={sub.id} className="group/item">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[13px] font-bold tracking-tight text-neutral-700 dark:text-neutral-300 truncate pr-4 transition-colors duration-700">
                  {sub.name}
                </span>
                <span className="text-[12px] font-black text-blue-600 dark:text-blue-400 transition-colors duration-700">
                  {sub.progress !== null ? `${sub.progress}%` : '--%'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-700">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${sub.progress ?? 0}%` }}
                ></div>
              </div>
            </div>
          )) : (
            <div className="text-[12px] font-medium text-neutral-400 dark:text-neutral-500 italic py-4 text-center sm:text-left">
              Establishing Uplink...
            </div>
          )}
        </div>
      </div>

      {/* SUB-METRICS: Quizzes & Assignments */}
      <div className="grid grid-cols-2 gap-6 mt-auto pt-6 border-t border-black/5 dark:border-white/5 transition-colors duration-700">
        
        {/* Quizzes (Fuchsia/Pink Accent) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Quizzes</span>
            <span className="text-[14px] font-black text-pink-500 dark:text-pink-400 transition-colors duration-700">{data.metrics.quizzes}%</span>
          </div>
          <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-700">
            <div className="h-full bg-pink-500 dark:bg-pink-400 transition-all duration-1000 ease-out rounded-full" style={{ width: `${data.metrics.quizzes}%` }}></div>
          </div>
        </div>
        
        {/* Assignments (Amber/Orange Accent) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Assignments</span>
            <span className="text-[14px] font-black text-amber-500 dark:text-amber-400 transition-colors duration-700">{data.metrics.assignments}%</span>
          </div>
          <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-700">
            <div className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-1000 ease-out rounded-full" style={{ width: `${data.metrics.assignments}%` }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}