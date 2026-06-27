'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import FitnessCard from '../../components/FitnessCard';
import TopNavProfile from '../../components/TopNavProfile';
import MissionBlock from '../../components/MissionBlock';
import { NavRail, MobileHubNav } from '../../components/HubNav';
import HubIntro from '../../components/HubIntro';
import CockpitIntelligencePanel from '../../components/CockpitIntelligencePanel';
import BrandMark from '../../components/BrandMark';
import { syncFitnessHubData } from '@/app/actions';

export default function FitnessClient({ cloudFitness }: { cloudFitness: any }) {
  const targets = { protein: 160, carbs: 300, fats: 70, calories: 2470 };

  // 1. Cloud-Seeded State Initialization
  const [meals, setMeals] = useState<{name: string, protein: number, carbs: number, fats: number, calories: number}[]>(() => {
    if (!cloudFitness?.mealsPayload) return [];
    try {
      const parsed = JSON.parse(cloudFitness.mealsPayload);
      return parsed.date === new Date().toLocaleDateString() ? parsed.meals : [];
    } catch { return []; }
  });
  
  const [metrics, setMetrics] = useState(() => {
    if (!cloudFitness?.metrics) return { sleepHours: 7, sleepMinutes: 30, weight: 72.4, height: 175, water: 2.1 };
    try { return JSON.parse(cloudFitness.metrics); } 
    catch { return { sleepHours: 7, sleepMinutes: 30, weight: 72.4, height: 175, water: 2.1 }; }
  });
  
  const [activeCycle, setActiveCycle] = useState(cloudFitness?.activeCycle || 1); 

  const [isLogging, setIsLogging] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', protein: '', carbs: '', fats: '', calories: '' });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. The Debounced Cloud Sync Engine
  useEffect(() => {
    if (!isMounted) return;

    // Wait 1 second after the user finishes interacting before saving to protect DB limits
    const timer = setTimeout(() => {
      const mealsPayload = JSON.stringify({ date: new Date().toLocaleDateString(), meals });
      syncFitnessHubData(activeCycle, JSON.stringify(metrics), mealsPayload).catch(e => console.error("Cloud Sync Error:", e));
    }, 1000);

    return () => clearTimeout(timer);
  }, [meals, metrics, activeCycle, isMounted]);

  const current = {
    protein: meals.reduce((s, m) => s + m.protein, 0),
    carbs: meals.reduce((s, m) => s + m.carbs, 0),
    fats: meals.reduce((s, m) => s + m.fats, 0),
    calories: meals.reduce((s, m) => s + m.calories, 0),
  };

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">
      
      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-emerald-400/30 via-teal-400/25 to-cyan-400/25 dark:from-emerald-600/20 dark:via-teal-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-blue-400/25 via-cyan-400/20 to-emerald-300/25 dark:from-blue-600/15 dark:via-cyan-600/10 dark:to-teal-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-sky-300/20 to-teal-300/20 dark:from-sky-500/10 dark:to-teal-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
          </button>
          <BrandMark />
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500 transition-colors duration-700"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block transition-colors duration-700"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- RETRACTABLE DESKTOP SIDEBAR --- */}
        <NavRail active="Fitness" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-14">
            
            <HubIntro
              eyebrow="Body System Telemetry"
              title="Train with"
              titleAccent="operational discipline"
              description="The Fitness Hub turns workouts, nutrition, macros, and recovery cues into a dashboard for consistency rather than guesswork."
              primaryHref="#vitality-monitor"
              primaryLabel="View Metrics"
              secondaryHref="https://vestrippn-food-screener.vercel.app"
              secondaryLabel="Food Screener ↗"
              chips={['Workout Streak', 'Macro Protocol', 'Nutrition Log', 'Recovery']}
              panelTitle="Fitness Ops"
              panelSubtitle="Current focus: protect the streak"
              contextLabel="Training target: log today's session"
              metrics={[
                { label: 'Streak', value: `${cloudFitness?.streak ?? 0}` },
                { label: 'Mode', value: 'Train' },
                { label: 'Kcal', value: '2200' },
              ]}
              capabilities={[
                { icon: '🏃', title: 'Training Rhythm', desc: 'Workout days, streaks, and body-system consistency stay visible.' },
                { icon: '🍳', title: 'Nutrition Control', desc: 'Macro targets and food screening support better day-to-day execution.' },
              ]}
              hub="fitness"
            />

            <MissionBlock
              accent="rose"
              title="Today's Session · Protect the Streak"
              detail="Log training to keep cadence and streak telemetry alive."
              cta={{ label: 'Open monitor', href: '#vitality-monitor' }}
            />

            <CockpitIntelligencePanel
              hub="fitness"
              contextItems={[
                { label: 'Current focus', value: 'Protect the streak' },
                { label: 'Streak', value: `${cloudFitness?.streak ?? 0} days` },
                { label: 'Calories', value: `${targets.calories} target` },
              ]}
            />

            {/* SECTOR 1: VITALITY MONITOR (3-PANE) */}
            <motion.div
              id="vitality-monitor"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full w-full cursor-default"
            >
              <FitnessCard
                initialWorkoutDays={cloudFitness?.workoutDays ? JSON.parse(cloudFitness.workoutDays) : undefined}
                initialLastWorkout={cloudFitness?.lastWorkout}
                initialStreak={cloudFitness?.streak}
              />
            </motion.div>

            {/* SECTOR 2: NUTRITIONAL PROTOCOL */}
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.2 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-default"
            >
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Nutritional Protocol</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[32px] lg:text-[42px] font-black tabular-nums tracking-tighter text-neutral-900 dark:text-white transition-colors duration-700 leading-none">{current.calories}</span>
                    <span className="text-[12px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">/ {targets.calories} KCAL</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                  <MacroBar label="Protein" val={current.protein} target={targets.protein} theme="blue" />
                  <MacroBar label="Carbohydrates" val={current.carbs} target={targets.carbs} theme="emerald" />
                  <MacroBar label="Fats" val={current.fats} target={targets.fats} theme="amber" />
               </div>

               <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 transition-colors duration-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setIsLogging(true)} className="px-6 py-3 bg-emerald-500 text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-md">Log Intake +</button>
                    <motion.a
                      href="https://vestrippn-food-screener.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, scale: 1.03, boxShadow: '0 14px 32px rgba(16,185,129,0.28)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-colors"
                    >
                      <span className="text-[14px] leading-none">🍳</span>
                      Food Screener
                      <span className="text-[12px] leading-none">↗</span>
                    </motion.a>
                  </div>
                  <button onClick={() => setMeals([])} className="text-[10px] font-bold text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 self-end sm:self-auto">Flush Buffer</button>
               </div>
            </motion.div>

            {/* SECTOR 3: TACTICAL MESOCYCLE SWITCHER */}
            <motion.section
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.3 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden cursor-default"
            >
               <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse"></span>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Mesocycle Matrix</h3>
                  </div>
                  <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar no-scrollbar border border-transparent dark:border-white/5 transition-colors duration-700">
                    {[1, 2, 3, 4].map((num) => (
                      <button key={num} onClick={() => setActiveCycle(num)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap active:scale-[0.98] ${activeCycle === num ? 'bg-purple-500 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}>Cycle {num}</button>
                    ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-4">
                  {getCycleData(activeCycle).map((day, i) => (
                    <div key={i} className={`p-4 lg:p-5 rounded-2xl border transition-all duration-300 ${day.rest ? 'border-dashed border-black/10 dark:border-white/10 opacity-60' : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 active:scale-[0.98] cursor-default'}`}>
                      <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-2 tracking-widest transition-colors duration-700">{day.label}</div>
                      <div className={`text-[13px] lg:text-[14px] font-black tracking-tight leading-tight mb-3 lg:mb-4 transition-colors duration-700 ${day.rest ? 'text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>{day.focus}</div>
                      <div className="space-y-1.5">
                         {day.moves.map((m, j) => (
                           <div key={j} className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-2 transition-colors duration-700"><span className={`w-1.5 h-1.5 rounded-full ${day.rest ? 'bg-neutral-300 dark:bg-neutral-600' : 'bg-purple-500'}`}></span> {m}</div>
                         ))}
                      </div>
                    </div>
                  ))}
               </div>
            </motion.section>

            {/* SECTOR 4: INTERACTIVE BIO RECOVERY */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}
            >
              {[
                <SleepCard key="sleep" metrics={metrics} setMetrics={setMetrics} />,
                <WeightCard key="weight" metrics={metrics} setMetrics={setMetrics} />,
                <WaterCard key="water" metrics={metrics} setMetrics={setMetrics} />,
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 30, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
                  whileHover={{ y: -6, scale: 1.02, boxShadow: '0 20px 48px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  {card}
                </motion.div>
              ))}
            </motion.div>

          </div>
        </main>

        {/* --- MOBILE-ONLY FLOATING NAVIGATION HUD --- */}
        <MobileHubNav active="Fitness" />

      </div>

      {/* MOBILE OPTIMIZED LOGGING MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md p-4 transition-all duration-500">
           <div className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-[32px] p-6 lg:p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 transition-colors">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[18px] lg:text-[20px] font-black text-neutral-900 dark:text-white tracking-tight">Intake Logging</h2>
                <button onClick={() => setIsLogging(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[11px] uppercase font-bold tracking-widest transition-colors px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-95">Abort</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <input type="text" placeholder="Entry Title" className="col-span-2 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} />
                <input type="number" placeholder="Protein (g)" className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" value={newMeal.protein} onChange={e => setNewMeal({...newMeal, protein: e.target.value})} />
                <input type="number" placeholder="Carbs (g)" className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" value={newMeal.carbs} onChange={e => setNewMeal({...newMeal, carbs: e.target.value})} />
                <input type="number" placeholder="Fats (g)" className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" value={newMeal.fats} onChange={e => setNewMeal({...newMeal, fats: e.target.value})} />
                <input type="number" placeholder="Kcal" className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} />
              </div>
              <button 
                onClick={() => {
                  if(newMeal.name && newMeal.calories) {
                    setMeals([...meals, { name: newMeal.name, protein: Number(newMeal.protein), carbs: Number(newMeal.carbs), fats: Number(newMeal.fats), calories: Number(newMeal.calories) }]);
                    setIsLogging(false);
                    setNewMeal({ name: '', protein: '', carbs: '', fats: '', calories: '' });
                  }
                }} 
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[13px] tracking-widest hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md"
              >
                Commit Entry
              </button>
           </div>
        </div>
      )}
    </div>
  );
}


// ============================================================================
// NEW INTERACTIVE RECOVERY COMPONENTS
// ============================================================================

function SleepCard({ metrics, setMetrics }: any) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Calculate exact 90-minute REM cycles
  const totalMinutes = (metrics.sleepHours * 60) + metrics.sleepMinutes;
  const cycles = Math.floor(totalMinutes / 90);
  const color = "bg-purple-500";

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors">Sleep Architecture</div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">⚙️</button>
      </div>
      
      {isEditing ? (
        <div className="flex items-center gap-2 mb-6">
          <input type="number" value={metrics.sleepHours} onChange={(e) => setMetrics({...metrics, sleepHours: Number(e.target.value)})} className="w-16 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-center text-lg font-black outline-none focus:ring-2 focus:ring-purple-500/50" />
          <span className="font-bold text-neutral-500">h</span>
          <input type="number" value={metrics.sleepMinutes} onChange={(e) => setMetrics({...metrics, sleepMinutes: Number(e.target.value)})} className="w-16 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-center text-lg font-black outline-none focus:ring-2 focus:ring-purple-500/50" />
          <span className="font-bold text-neutral-500">m</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between gap-2 mb-6">
           <div className="text-[28px] lg:text-[32px] font-black tracking-tighter text-neutral-900 dark:text-white truncate transition-colors">
             {metrics.sleepHours}h {metrics.sleepMinutes}m
           </div>
           <div className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-purple-600 dark:text-purple-400 uppercase whitespace-nowrap transition-colors">{cycles} Cycles</div>
        </div>
      )}
      
      <div className="h-[4px] w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
        <div className={`h-full transition-all duration-1000 rounded-full ${color}`} style={{ width: `${Math.min((cycles / 5) * 100, 100)}%` }}></div>
      </div>
    </div>
  );
}

function WeightCard({ metrics, setMetrics }: any) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Dynamic BMI Calculation
  const heightM = metrics.height / 100;
  const bmi = (metrics.weight / (heightM * heightM)).toFixed(1);
  const color = "bg-blue-500";

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors">Biometrics & BMI</div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">⚙️</button>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2 mb-6">
          <input type="number" step="0.1" value={metrics.weight} onChange={(e) => setMetrics({...metrics, weight: Number(e.target.value)})} className="w-20 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-center text-lg font-black outline-none focus:ring-2 focus:ring-blue-500/50" />
          <span className="font-bold text-neutral-500 text-xs">kg</span>
          <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1"></div>
          <input type="number" value={metrics.height} onChange={(e) => setMetrics({...metrics, height: Number(e.target.value)})} className="w-20 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-center text-lg font-black outline-none focus:ring-2 focus:ring-blue-500/50" />
          <span className="font-bold text-neutral-500 text-xs">cm</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between gap-2 mb-6">
           <div className="text-[28px] lg:text-[32px] font-black tracking-tighter text-neutral-900 dark:text-white truncate transition-colors">
             {metrics.weight} <span className="text-[14px] text-neutral-400">kg</span>
           </div>
           <div className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-blue-600 dark:text-blue-400 uppercase whitespace-nowrap transition-colors">BMI {bmi}</div>
        </div>
      )}

      <div className="h-[4px] w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
        <div className={`h-full transition-all duration-1000 rounded-full ${color}`} style={{ width: '70%' }}></div>
      </div>
    </div>
  );
}

function WaterCard({ metrics, setMetrics }: any) {
  // Metabolically Accurate Target: 35ml per kg of body weight
  const targetWater = Number((metrics.weight * 0.035).toFixed(1));
  const percent = Math.min((metrics.water / targetWater) * 100, 100);
  const color = "bg-cyan-500";

  const addWater = (amount: number) => {
    setMetrics({ ...metrics, water: Number((metrics.water + amount).toFixed(2)) });
  };

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors">Metabolic Hydration</div>
        
        {/* Quick Add Buttons visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => addWater(0.25)} className="text-[9px] font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 px-2 py-1 rounded-md transition-colors">+250</button>
          <button onClick={() => setMetrics({...metrics, water: 0})} className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-md hover:bg-red-500/20 transition-colors">RST</button>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-6">
         <div className="text-[28px] lg:text-[32px] font-black tracking-tighter text-neutral-900 dark:text-white truncate transition-colors">
           {metrics.water.toFixed(1)} <span className="text-[14px] text-neutral-400">L</span>
         </div>
         <div className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-cyan-600 dark:text-cyan-400 uppercase whitespace-nowrap transition-colors">
           TGT {targetWater}L
         </div>
      </div>

      <div className="h-[4px] w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors">
        <div className={`h-full transition-all duration-1000 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}


// ============================================================================
// DATA ENGINES
// ============================================================================

function MacroBar({ label, val, target, theme }: { label: string, val: number, target: number, theme: 'blue' | 'emerald' | 'amber' }) {
  const percent = Math.min((val / target) * 100, 100);
  const colors = {
    blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500 dark:bg-blue-400' },
    emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500 dark:bg-emerald-400' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500 dark:bg-amber-400' }
  };
  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="flex justify-between items-end px-1">
        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest transition-colors duration-700">{label}</span>
        <span className={`text-[20px] lg:text-[24px] font-black tabular-nums tracking-tighter ${colors[theme].text} transition-colors duration-700 leading-none`}>
          {val}<span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-1.5 tracking-widest uppercase">/ {target}g</span>
        </span>
      </div>
      <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-700">
        <div className={`h-full transition-all duration-1000 rounded-full ${colors[theme].bg}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function getCycleData(cycle: number) {
  const base = [
    { label: 'Mon', focus: 'Chest & Triceps', moves: ['Sternal Pecs', 'Long Head Tri'], rest: false },
    { label: 'Tue', focus: 'Quads & Calves', moves: ['VMO (Inner Quad)', 'Gastrocnemius'], rest: false },
    { label: 'Wed', focus: 'Active Recovery', moves: ['Thoracic Spine', 'Hip Flexors'], rest: true },
    { label: 'Thu', focus: 'Back & Biceps', moves: ['Latissimus Dorsi', 'Bicep Peak'], rest: false },
    { label: 'Fri', focus: 'Glutes & Hams', moves: ['Glute Medius', 'Hamstring Sweep'], rest: false },
    { label: 'Sat', focus: 'Shoulders & Core', moves: ['Lateral Deltoids', 'Lower Abs'], rest: false },
    { label: 'Sun', focus: 'System Rest', moves: ['CNS Recovery', 'Joint Health'], rest: true },
  ];
  if (cycle === 2) return base.map(d => d.rest ? d : { ...d, focus: d.focus + ' (Hyper)', moves: d.moves.map(m => m + ' Focus') });
  if (cycle === 3) return base.map(d => d.rest ? d : { ...d, focus: 'Deload Phase', moves: ['Muscle Tension', 'Form Check'] });
  if (cycle === 4) return base.map(d => d.rest ? d : { ...d, focus: 'Peak Intensity', moves: ['Fast Twitch', 'Deep Stretch'] });
  return base;
}
