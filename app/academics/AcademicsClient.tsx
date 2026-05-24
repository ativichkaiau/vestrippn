'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';
import { syncAnkiData } from '@/app/actions';
import CaseStepper from '@/components/w08/CaseStepper';

interface Subject { id: string; name: string; progress: number | null; }
interface Exam { name: string; date: Date; color: string; }

interface AcademicsProps {
  initialCanvasData?: {
    subjects: Subject[];
    metrics: any;
  };
  ankiData?: {
    due: number;
    new: number;
    reviewedToday: number;
    streak: number;
  };
}

const DEFAULT_ANKI = { due: 0, new: 0, reviewedToday: 0, streak: 0 };

export default function AcademicsClient({ initialCanvasData, ankiData }: AcademicsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [cycle, setCycle] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [timers, setTimers] = useState<{ [key: string]: string }>({});

  const canvasData = initialCanvasData || { subjects: [], metrics: { quizzes: 0, assignments: 0 } };
  
  // 🚀 UPGRADE: Local State for Interactive Anki
  const [liveAnki, setLiveAnki] = useState(ankiData || DEFAULT_ANKI);
  const prevAnkiRef = useRef(ankiData);

  // 🔌 AnkiConnect live bridge state
  const [bridge, setBridge] = useState<'idle' | 'syncing' | 'online' | 'offline'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const currentHour = new Date().getHours();
    setCycle(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
  }, []);

  // 🚀 UPGRADE: Smart Sync Protection
  useEffect(() => {
    if (JSON.stringify(ankiData) !== JSON.stringify(prevAnkiRef.current)) {
      setLiveAnki(ankiData || DEFAULT_ANKI);
      prevAnkiRef.current = ankiData;
    }
  }, [ankiData]);

  // 🚀 UPGRADE: Edit Handler — now persists to Postgres
  const handleEditAnki = async (key: keyof typeof DEFAULT_ANKI) => {
    const currentVal = liveAnki[key];
    const input = window.prompt(`Update ANKI ${key.toUpperCase()} count:`, currentVal.toString());
    if (input === null) return;

    const newVal = parseInt(input, 10);
    if (isNaN(newVal)) return;

    // Optimistic UI update
    const next = { ...liveAnki, [key]: newVal };
    setLiveAnki(next);
    // Keep the sync-protection ref in step so the revalidated prop doesn't clobber the edit
    prevAnkiRef.current = next;

    try {
      await syncAnkiData(next.due, next.new, next.reviewedToday, next.streak);
      console.log(`[UPLINK] ANKI ${key} -> ${newVal} synced to Postgres`);
    } catch (e) {
      console.error('[UPLINK] ANKI sync failed:', e);
      // Roll back on failure
      setLiveAnki(liveAnki);
      prevAnkiRef.current = liveAnki;
    }
  };

  // 🔌 Low-level AnkiConnect call (talks to Anki Desktop on 127.0.0.1:8765)
  const ankiConnect = async (action: string, params: object = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    try {
      const res = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, version: 6, params }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.result;
    } finally {
      clearTimeout(timeout);
    }
  };

  // Build streak by walking back from today over reviewed days
  const computeStreak = (byDay: [string, number][]): number => {
    const reviewed = new Set(byDay.filter(([, n]) => n > 0).map(([d]) => d));
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let streak = 0;
    const cur = new Date();
    // If today hasn't been studied yet, start counting from yesterday
    if (!reviewed.has(fmt(cur))) cur.setDate(cur.getDate() - 1);
    while (reviewed.has(fmt(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  };

  // 🔌 Pull live stats from Anki Desktop and persist them to Postgres
  const syncFromAnki = async (silent = false) => {
    setBridge('syncing');
    try {
      const [due, fresh, reviewedToday, byDay] = await Promise.all([
        ankiConnect('findCards', { query: 'is:due' }),
        ankiConnect('findCards', { query: 'is:new' }),
        ankiConnect('getNumCardsReviewedToday'),
        ankiConnect('getNumCardsReviewedByDay'),
      ]);

      const next = {
        due: Array.isArray(due) ? due.length : 0,
        new: Array.isArray(fresh) ? fresh.length : 0,
        reviewedToday: typeof reviewedToday === 'number' ? reviewedToday : 0,
        streak: Array.isArray(byDay) ? computeStreak(byDay) : 0,
      };

      setLiveAnki(next);
      prevAnkiRef.current = next;
      await syncAnkiData(next.due, next.new, next.reviewedToday, next.streak);

      setBridge('online');
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      console.log('[ANKI BRIDGE] Live sync complete:', next);
    } catch (e) {
      setBridge('offline');
      if (!silent) {
        console.warn('[ANKI BRIDGE] Could not reach Anki Desktop on 127.0.0.1:8765.', e);
        window.alert(
          'Anki Bridge offline.\n\nMake sure Anki Desktop is OPEN with the AnkiConnect add-on installed, and that this site is allowed in AnkiConnect\'s "webCorsOriginList".'
        );
      }
    }
  };

  // 🔌 Auto-attempt a silent live sync on mount.
  // Safari blocks HTTPS->127.0.0.1, so we skip the browser bridge there and
  // rely on the desktop add-on (which pushes straight to Postgres instead).
  useEffect(() => {
    const safari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
    setIsSafari(safari);
    if (!safari) syncFromAnki(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const exams: Exam[] = [
      { name: 'HEN-2', date: new Date('2026-06-09T09:00:00'), color: 'text-pink-500 dark:text-pink-400' },
      { name: 'HMS-2', date: new Date('2026-06-12T09:00:00'), color: 'text-amber-500 dark:text-amber-400' },
      { name: 'HNS-2', date: new Date('2026-06-16T09:00:00'), color: 'text-blue-500 dark:text-blue-400' },
    ];

    const tick = setInterval(() => {
      const newTimers: { [key: string]: string } = {};
      exams.forEach(exam => {
        const diff = exam.date.getTime() - Date.now();
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
          const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
          newTimers[exam.name] = `${d}D ${h}H ${m}M`;
        } else { newTimers[exam.name] = "STATION_ARRIVAL"; }
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: true },
    { name: 'Research', icon: '◆', href: '/research', active: false },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: false },
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-br from-pink-400/20 to-purple-400/20 dark:from-pink-600/15 dark:to-[#00A598]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[50%] h-[50%] bg-gradient-to-tr from-blue-400/20 to-teal-300/20 dark:from-purple-600/10 dark:to-teal-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
            </svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline">
              <span>VESTRIPPN</span>
              <span className="text-blue-600 dark:text-blue-400 transition-colors duration-700">3.0</span>
            </div>
          </Link>
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500 transition-colors duration-700"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block transition-colors duration-700"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'
        }`}>
          <nav className="space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                title={!isSidebarExpanded ? item.name : undefined}
                className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative ${
                  item.active 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span className={`text-[18px] shrink-0 transition-opacity duration-300 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${
                  isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${
              isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'
            }`}
          >
            {isSidebarExpanded ? <Clock /> : <span className="text-xl group-hover:rotate-12 transition-transform duration-300">⏱️</span>}
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-12">
            
            <motion.section
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center pt-8 sm:pt-16 pb-6 relative"
            >
              <div className="absolute left-[5%] xl:left-[10%] top-4 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-lg">📚</span>
                <span className="text-[13px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Knowledge Base</span>
              </div>
              <div className="absolute right-[5%] xl:right-[10%] bottom-0 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Sync</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-6 flex flex-col xl:flex-row items-center justify-center gap-3 sm:gap-4 xl:gap-5 relative z-10">
                <div className="flex items-baseline text-[42px] sm:text-[64px] lg:text-[76px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">
                    ACADEMIC
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 xl:mt-0 text-[32px] sm:text-[50px] lg:text-[60px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-4 py-1 sm:py-2 rounded-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-black/5 leading-none transition-colors duration-700">
                    OPS
                  </span>
                </div>
              </h1>
              <p className="max-w-2xl font-mono text-[11px] sm:text-[12px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.4em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycle} // <span className="text-blue-600 dark:text-blue-400 font-bold">System Nominal</span>
              </p>
            </motion.section>

            {/* SECTOR 1: EXAMINATION COUNTDOWNS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Critical Milestones</h3>
              </div>
              <motion.section
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8"
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
              >
                {[
                  { name: 'HEN-2', date: '09 JUN', color: 'text-pink-500 dark:text-pink-400' },
                  { name: 'HMS-2', date: '12 JUN', color: 'text-amber-500 dark:text-amber-400' },
                  { name: 'HNS-2', date: '16 JUN', color: 'text-blue-500 dark:text-blue-400' }
                ].map(exam => (
                  <motion.div
                    key={exam.name}
                    variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } } }}
                    whileHover={{ y: -8, scale: 1.03, boxShadow: '0 24px 56px rgb(0,0,0,0.12)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden cursor-default"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className={`font-black tracking-tight text-[20px] lg:text-[22px] ${exam.color} transition-colors duration-700`}>{exam.name}</span>
                      <span className="font-bold text-[10px] lg:text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">{exam.date} // 09:00</span>
                    </div>
                    <div className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-neutral-900 dark:text-white transition-colors duration-700 relative z-10">
                      {timers[exam.name] || "--D --H --M"}
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest opacity-80 transition-colors duration-700">T-Minus Terminal</div>
                  </motion.div>
                ))}
              </motion.section>
            </div>

            {/* SECTOR 2: CANVAS TELEMETRY & CLINICAL HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

              {/* Live Subject Telemetry */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.2 }}
                whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                className="lg:col-span-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col cursor-default"
              >
                <div className="flex justify-between items-center mb-8 px-2">
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Canvas Telemetry</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     <span className="text-[10px] font-bold uppercase tracking-widest">Uplink</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 flex-1">
                  {canvasData.subjects.length > 0 ? canvasData.subjects.map(sub => (
                    <a 
                      key={sub.id} 
                      href={`https://mango-cmu.instructure.com/courses/${sub.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/sub min-w-0 block"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 group-hover/sub:text-blue-600 dark:group-hover/sub:text-blue-400 transition-colors truncate pr-2 flex items-center gap-1.5">
                          {sub.name}
                          <svg className="w-3.5 h-3.5 opacity-0 group-hover/sub:opacity-100 transition-opacity text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-black shrink-0 transition-colors duration-700">
                          {sub.progress !== null ? `${sub.progress}%` : '--%'}
                        </span>
                      </div>
                      <div className="h-[4px] w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-700">
                        <div className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-1000 rounded-full" style={{ width: `${sub.progress || 0}%` }}></div>
                      </div>
                    </a>
                  )) : (
                    <div className="col-span-full flex items-center justify-center py-10 text-neutral-400 dark:text-neutral-500 font-medium italic text-[13px] transition-colors duration-700">Awaiting Mango Cloud Sync...</div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 transition-colors duration-700">
                  <div className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all duration-300">
                    <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 transition-colors duration-700">Global Quiz Average</div>
                    <div className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-pink-500 dark:text-pink-400 transition-colors duration-700">{canvasData.metrics?.quizzes || 0}%</div>
                  </div>
                  <div className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all duration-300">
                    <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 transition-colors duration-700">Assignment Completion</div>
                    <div className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-amber-500 dark:text-amber-400 transition-colors duration-700">{canvasData.metrics?.assignments || 0}%</div>
                  </div>
                </div>
              </motion.div>

              {/* Clinical & Storage Hub */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.35 }}
                className="lg:col-span-4 flex flex-col gap-4 lg:gap-5 h-full"
              >
                <motion.a
                  href="https://accessmedicine.mhmedical.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.02, boxShadow: '0 16px 40px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <div className="w-14 h-14 bg-rose-500/10 rounded-[18px] flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">⚕️</div>
                  <div>
                    <div className="font-black text-[16px] text-neutral-900 dark:text-white leading-tight">AccessMedicine</div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Clinical Library</div>
                  </div>
                </motion.a>

                <motion.a
                  href="https://www.osmosis.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.02, boxShadow: '0 16px 40px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:border-teal-500/30 transition-colors duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <div className="w-14 h-14 bg-teal-500/10 rounded-[18px] flex items-center justify-center text-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">🧠</div>
                  <div>
                    <div className="font-black text-[16px] text-neutral-900 dark:text-white leading-tight">Osmosis</div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Visual Medicine</div>
                  </div>
                </motion.a>

                <motion.a
                  href="https://drive.google.com/drive/folders/1tfZ8mT6WLWOjRezS9wkdwiltd2Ov4wuB"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.02, boxShadow: '0 16px 40px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-[18px] flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-300">📂</div>
                  <div>
                    <div className="font-black text-[16px] text-neutral-900 dark:text-white leading-tight">Textbook Hub</div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Shared Vault</div>
                  </div>
                </motion.a>
              </motion.div>
            </div>

            {/* SECTOR 2.6: CLINICAL CASES (W08) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Clinical Cases</h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 uppercase tracking-widest">Phase C</span>
              </div>

              {/* Case browser placeholder */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-700"
                  >
                    <div className="text-[15px] font-bold text-neutral-900 dark:text-white tracking-tight">Case {n}</div>
                    <div className="mt-1 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Awaiting Phase C content</div>
                  </div>
                ))}
              </div>

              {/* Case player placeholder — uses the W08 CaseStepper primitive */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-700"
              >
                <CaseStepper
                  steps={[
                    { id: 'presentation', label: 'Presentation' },
                    { id: 'history', label: 'History' },
                    { id: 'exam', label: 'Examination' },
                    { id: 'investigations', label: 'Investigations' },
                    { id: 'diagnosis', label: 'Diagnosis' },
                  ]}
                />
                <div className="mt-6 grid min-h-40 place-items-center rounded-[24px] bg-black/5 dark:bg-white/5 text-[13px] text-neutral-400 dark:text-neutral-500">
                  Case player surface
                </div>
              </motion.div>
            </div>

            {/* SECTOR 2.5: INTERACTIVE CODEX — SELF-BUILT STUDY ENGINES */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Interactive Codex</h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 uppercase tracking-widest">Self-Built</span>
              </div>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                initial="hidden" whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {[
                  {
                    href: 'https://vestrippn-pokedex.vercel.app',
                    icon: '🦠',
                    title: 'Microbiology Pokédex',
                    desc: 'Searchable pathogen codex — bacteria, viruses, fungi & parasites with high-yield clinical profiles.',
                    tag: 'Pathogen Codex',
                    accent: 'purple',
                    glow: 'rgba(168,85,247,0.20)',
                  },
                  {
                    href: 'https://vestrippn-biochem-pathway.vercel.app',
                    icon: '🧬',
                    title: 'Biochem Pathway Engine',
                    desc: 'Interactive metabolic map — trace glycolysis, TCA, and enzyme cascades node by node.',
                    tag: 'Metabolic Map',
                    accent: 'amber',
                    glow: 'rgba(245,158,11,0.20)',
                  },
                ].map((app) => (
                  <motion.a
                    key={app.href}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={{ hidden: { opacity: 0, y: 30, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                    whileHover={{ y: -8, scale: 1.02, boxShadow: `0 24px 56px ${app.glow}`, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                    whileTap={{ scale: 0.97 }}
                    className={`group/codex relative overflow-hidden bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col ${app.accent === 'purple' ? 'hover:border-purple-500/30' : 'hover:border-amber-500/30'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center text-3xl group-hover/codex:scale-110 group-hover/codex:rotate-6 transition-transform duration-300 ${app.accent === 'purple' ? 'bg-purple-500/10' : 'bg-amber-500/10'}`}>{app.icon}</div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${app.accent === 'purple' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>Beta</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-black text-[18px] lg:text-[20px] text-neutral-900 dark:text-white tracking-tight leading-tight">{app.title}</h4>
                    </div>
                    <p className="text-[13px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed mb-6 flex-1">{app.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${app.accent === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'}`}>{app.tag}</span>
                      <span className="text-[11px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest group-hover/codex:translate-x-1 transition-transform duration-300">Launch ↗</span>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </div>

            {/* 🚀 UPGRADE: SECTOR 3: ANKIWEB TELEMETRY (NOW EDITABLE) */}
            <motion.section
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -4, boxShadow: '0 24px 56px rgb(0,0,0,0.08)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-700 relative overflow-hidden cursor-default"
            >
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-2">
                 <div className="flex items-center gap-3 flex-wrap">
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-4 bg-sky-500 rounded-full animate-pulse"></span>
                     <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Spaced Repetition Telemetry</h3>
                   </div>
                   {/* Status pill */}
                   {isSafari ? (
                     <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400" title="Safari blocks the in-browser bridge. The desktop add-on pushes your stats automatically.">
                       <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                       Add-on Sync
                     </span>
                   ) : (
                     <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors ${
                       bridge === 'online' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                       : bridge === 'syncing' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                       : bridge === 'offline' ? 'bg-neutral-500/10 text-neutral-500 dark:text-neutral-400'
                       : 'bg-neutral-500/10 text-neutral-400'
                     }`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${
                         bridge === 'online' ? 'bg-emerald-500 animate-pulse'
                         : bridge === 'syncing' ? 'bg-sky-500 animate-pulse'
                         : 'bg-neutral-400'
                       }`}></span>
                       {bridge === 'online' ? `Live${lastSync ? ` · ${lastSync}` : ''}`
                         : bridge === 'syncing' ? 'Syncing…'
                         : bridge === 'offline' ? 'Bridge Offline'
                         : 'Bridge Idle'}
                     </span>
                   )}
                 </div>
                 <div className="flex items-center gap-2">
                   {isSafari ? (
                     <span
                       title="Safari blocks HTTPS→localhost. Install the VESTRIPPN Anki add-on for automatic background sync."
                       className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest cursor-help"
                     >
                       ⤵ Desktop Add-on Mode
                     </span>
                   ) : (
                     <button
                       onClick={() => syncFromAnki(false)}
                       disabled={bridge === 'syncing'}
                       className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all text-[10px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                     >
                       <span className={bridge === 'syncing' ? 'animate-spin' : ''}>⟳</span>
                       {bridge === 'syncing' ? 'Syncing' : 'Sync Live'}
                     </button>
                   )}
                   <a
                     href="https://ankiweb.net/decks"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-all text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95"
                   >
                     Launch AnkiWeb ↗
                   </a>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                 
                 {/* Due Cards */}
                 <div onClick={() => handleEditAnki('due')} className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer group active:scale-95 shadow-sm hover:shadow-md">
                   <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                     <span>Review Due</span>
                     <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-emerald-500 transition-opacity">Edit</span>
                   </div>
                   <div className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-emerald-500">{liveAnki.due}</div>
                 </div>
                 
                 {/* New Cards */}
                 <div onClick={() => handleEditAnki('new')} className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer group active:scale-95 shadow-sm hover:shadow-md">
                   <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                     <span>New Cards</span>
                     <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-blue-500 transition-opacity">Edit</span>
                   </div>
                   <div className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-blue-500">{liveAnki.new}</div>
                 </div>
                 
                 {/* Reviewed Today */}
                 <div onClick={() => handleEditAnki('reviewedToday')} className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer group active:scale-95 shadow-sm hover:shadow-md">
                   <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                     <span>Studied Today</span>
                     <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-purple-500 transition-opacity">Edit</span>
                   </div>
                   <div className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-purple-500">{liveAnki.reviewedToday}</div>
                 </div>
                 
                 {/* Streak */}
                 <div onClick={() => handleEditAnki('streak')} className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-all duration-300 hover:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer group active:scale-95 shadow-sm hover:shadow-md">
                   <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                     <span>Day Streak</span>
                     <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-amber-500 transition-opacity">Edit</span>
                   </div>
                   <div className="flex items-baseline gap-1">
                     <span className="text-[28px] lg:text-[32px] font-black tabular-nums tracking-tighter text-amber-500">{liveAnki.streak}</span>
                     <span className="text-xl">🔥</span>
                   </div>
                 </div>

               </div>
            </motion.section>

            {/* SECTOR 4: INTELLIGENCE BUFFER (NotebookLM) */}
            <motion.section
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -4, boxShadow: '0 24px 56px rgb(0,0,0,0.08)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-700 relative overflow-hidden cursor-default"
            >
               <div className="flex items-center gap-2 mb-8 px-2">
                 <span className="w-1.5 h-4 bg-pink-500 rounded-full animate-pulse"></span>
                 <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">AI Grounding Matrix</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                  <a href="https://notebooklm.google.com/notebook/db9fd595-41ad-4c0d-848c-783a972904b1" target="_blank" rel="noopener noreferrer" className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 group/nb active:scale-[0.98]">
                     <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest transition-colors duration-700">Endocrine Vault</div>
                        <span className="text-2xl group-hover/nb:scale-110 group-hover/nb:rotate-6 transition-transform">📔</span>
                     </div>
                     <div className="text-[16px] font-bold text-neutral-900 dark:text-white mb-2 truncate pr-4 transition-colors duration-700">HEN-2: Endocrine Synthesis</div>
                     <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">Status: Verified</div>
                  </a>
                  <a href="https://notebooklm.google.com/notebook/d3cb8676-b859-4263-b5ff-65afaaf665e5" target="_blank" rel="noopener noreferrer" className="p-5 lg:p-6 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 group/nb active:scale-[0.98]">
                     <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest transition-colors duration-700">Neuro &amp; Senses Vault</div>
                        <span className="text-2xl group-hover/nb:scale-110 group-hover/nb:rotate-6 transition-transform">🧠</span>
                     </div>
                     <div className="text-[16px] font-bold text-neutral-900 dark:text-white mb-2 truncate pr-4 transition-colors duration-700">HNS-2: Nervous &amp; Special Senses</div>
                     <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">Status: Verified</div>
                  </a>
               </div>
            </motion.section>

          </div>
        </main>

        {/* --- MOBILE-ONLY FLOATING NAVIGATION HUD --- */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group ${
                item.active 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                 {item.icon}
               </span>
               {item.active && (
                 <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">
                   {item.name}
                 </span>
               )}
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
}