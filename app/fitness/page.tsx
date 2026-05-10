'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import FitnessCard from '../../components/FitnessCard';
import TopNavProfile from '../../components/TopNavProfile';

export default function FitnessHub() {
  const targets = { protein: 160, carbs: 300, fats: 70, calories: 2470 };

  const [meals, setMeals] = useState<{name: string, protein: number, carbs: number, fats: number, calories: number}[]>([]);
  const [metrics, setMetrics] = useState({ sleep: "7h 20m", weight: "72.4", water: "2.1" });
  const [activeCycle, setActiveCycle] = useState(1); 
  const [isLogging, setIsLogging] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', protein: '', carbs: '', fats: '', calories: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMeals = localStorage.getItem('vestrippn_meals');
    const savedMetrics = localStorage.getItem('vestrippn_metrics');
    const savedCycle = localStorage.getItem('vestrippn_cycle');
    if (savedMeals) {
      const parsed = JSON.parse(savedMeals);
      if (parsed.date === new Date().toLocaleDateString()) setMeals(parsed.meals);
    }
    if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
    if (savedCycle) setActiveCycle(Number(savedCycle));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vestrippn_meals', JSON.stringify({ date: new Date().toLocaleDateString(), meals }));
      localStorage.setItem('vestrippn_metrics', JSON.stringify(metrics));
      localStorage.setItem('vestrippn_cycle', activeCycle.toString());
    }
  }, [meals, metrics, activeCycle, isLoaded]);

  const current = {
    protein: meals.reduce((s, m) => s + m.protein, 0),
    carbs: meals.reduce((s, m) => s + m.carbs, 0),
    fats: meals.reduce((s, m) => s + m.fats, 0),
    calories: meals.reduce((s, m) => s + m.calories, 0),
  };

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accentEmerald)]/5 rounded-full blur-[120px]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentEmerald)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      <header className="h-[64px] border-b border-borderline flex items-center justify-between px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-orbitron font-black text-[18px] tracking-[0.2em] flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-1.5 h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="h-5 w-[1px] bg-borderline mx-2"></div>
          <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>BIO_SYNC: <span className="text-statusGreen uppercase">Nominal</span></span>
              <span>STATE: <span className="text-[var(--accentEmerald)] uppercase tracking-tighter">On_Target</span></span>
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
        
        {/* --- FIXED SIDEBAR NAVIGATION --- */}
        <aside className="w-[230px] border-r border-borderline flex flex-col justify-between p-5 bg-surface/20 shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {[
              { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
              { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
              { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
              { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]', active: true },
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
                  ? 'bg-[var(--accentEmerald)]/10 border-[var(--accentEmerald)]/20 shadow-[0_0_15px_rgba(52,211,153,0.05)] font-bold' 
                  : 'hover:bg-surface'
                }`}
              >
                {/* ICON LOGIC: Only colorizes and glows if item is ACTIVE */}
                <span className={`text-[14px] transition-all duration-300 ${
                  item.active 
                    ? `${item.color} drop-shadow-[0_0_5px_currentColor]` 
                    : 'text-textMuted opacity-40 group-hover:opacity-100'
                }`}>
                  {item.icon}
                </span>

                {/* TEXT LOGIC: Bold only if ACTIVE */}
                <span className={`text-[12px] tracking-tight transition-colors ${
                  item.active ? 'text-textPri font-bold' : 'text-textSec group-hover:text-textPri'
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4">
            <Clock />
          </div>
        </aside>

        {/* --- MAIN HUD CONTENT --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          
          {/* SECTOR 1: NUTRITIONAL PROTOCOL HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 min-h-[220px]">
              <FitnessCard />
            </div>

            <div className="lg:col-span-8 bg-surface/40 border border-borderline rounded-[22px] p-8 shadow-xl relative overflow-hidden group">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-[var(--accentEmerald)] shadow-[0_0_10px_var(--accentEmerald)]"></div>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-textPri">Nutritional Protocol</span>
                  </div>
                  <div className="font-orbitron text-[16px] font-black text-textPri drop-shadow-[0_0_8px_var(--accentEmerald)] uppercase">
                    {current.calories} <span className="text-[10px] text-textMuted tracking-widest">/ {targets.calories} KCAL</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MacroBar label="Protein" val={current.protein} target={targets.protein} color="var(--accentIndigo)" />
                  <MacroBar label="Carbohydrates" val={current.carbs} target={targets.carbs} color="var(--accentEmerald)" />
                  <MacroBar label="Fats" val={current.fats} target={targets.fats} color="var(--accentAmber)" />
               </div>

               <div className="mt-8 pt-6 border-t border-borderline/40 flex justify-between">
                  <button onClick={() => setIsLogging(true)} className="px-6 py-2 bg-[var(--accentCyan)]/10 border border-[var(--accentCyan)]/30 rounded-lg text-[10px] font-black uppercase text-[var(--accentCyan)] tracking-widest hover:bg-[var(--accentCyan)]/20 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    Inject Intake Data +
                  </button>
                  <button onClick={() => setMeals([])} className="text-[9px] font-mono text-textMuted hover:text-statusRed transition-colors uppercase tracking-[0.2em]">
                    Flush_Macro_Buffer
                  </button>
               </div>
            </div>
          </div>

          {/* SECTOR 2: TACTICAL MESOCYCLE SWITCHER */}
          <section className="bg-surface/30 border border-borderline rounded-[22px] p-8 shadow-xl">
             <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-[var(--accentViolet)] shadow-[0_0_10px_var(--accentViolet)]"></div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-textPri">Tactical Mesocycle Matrix</span>
                </div>
                
                <div className="flex bg-base/50 border border-borderline p-1.5 rounded-xl shadow-inner">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setActiveCycle(num)}
                      className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeCycle === num 
                        ? 'bg-[var(--accentViolet)] text-white shadow-[0_0_15px_var(--accentViolet)]' 
                        : 'text-textMuted hover:text-textPri'
                      }`}
                    >
                      Cycle {num}
                    </button>
                  ))}
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {getCycleData(activeCycle).map((day, i) => (
                  <div key={i} className={`p-5 rounded-xl border transition-all ${day.rest ? 'border-dashed border-borderline opacity-40 bg-transparent' : 'bg-base/40 border-borderline hover:border-[var(--accentViolet)]/50 group/day'}`}>
                    <div className="text-[9px] font-mono font-bold text-textMuted uppercase mb-2 tracking-widest">{day.label}</div>
                    <div className={`text-[13px] font-bold leading-tight mb-4 ${day.rest ? 'text-textMuted' : 'text-textPri group-hover/day:text-[var(--accentViolet)] transition-colors'}`}>{day.focus}</div>
                    <div className="space-y-1.5">
                       {day.moves.map((m, j) => (
                         <div key={j} className="text-[9px] font-mono text-textMuted truncate flex items-center gap-2">
                            <span className="w-1 h-1 bg-borderline rounded-full"></span> {m}
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* SECTOR 3: NEURAL & BIO RECOVERY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecoveryCard label="Sleep Architecture" val={metrics.sleep} status="Restorative" color="var(--accentFuchsia)" />
            <RecoveryCard label="Biometric Weight" val={`${metrics.weight} kg`} status="Stable" color="var(--accentCyan)" />
            <RecoveryCard label="Hydration Level" val={`${metrics.water} L`} status="Optimal" color="var(--accentCyan)" />
          </div>

          <div className="h-12"></div>
        </main>
      </div>

      {/* TACTICAL LOGGING MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface border border-borderline rounded-[22px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 border-t-[var(--accentCyan)] border-t-4">
              <h2 className="text-xl font-orbitron font-black text-textPri mb-6 uppercase tracking-wider">Intake_Injection</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <input type="text" placeholder="Entry ID" className="col-span-2 bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none focus:border-[var(--accentCyan)] shadow-inner" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} />
                <input type="number" placeholder="Pro (g)" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.protein} onChange={e => setNewMeal({...newMeal, protein: e.target.value})} />
                <input type="number" placeholder="Cho (g)" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.carbs} onChange={e => setNewMeal({...newMeal, carbs: e.target.value})} />
                <input type="number" placeholder="Fat (g)" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.fats} onChange={e => setNewMeal({...newMeal, fats: e.target.value})} />
                <input type="number" placeholder="Kcal" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => {
                  if(newMeal.name && newMeal.calories) {
                    setMeals([...meals, { name: newMeal.name, protein: Number(newMeal.protein), carbs: Number(newMeal.carbs), fats: Number(newMeal.fats), calories: Number(newMeal.calories) }]);
                    setIsLogging(false);
                    setNewMeal({ name: '', protein: '', carbs: '', fats: '', calories: '' });
                  }
                }} className="flex-1 py-4 bg-[var(--accentCyan)] text-white rounded-xl font-bold uppercase text-[12px] tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)]">Commit Entry</button>
                <button onClick={() => setIsLogging(false)} className="px-6 py-4 border border-borderline rounded-xl text-textMuted uppercase text-[12px]">Abort</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function MacroBar({ label, val, target, color }: { label: string, val: number, target: number, color: string }) {
  const percent = Math.min((val / target) * 100, 100);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-mono font-black text-textMuted uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[15px] font-orbitron font-bold" style={{ color }}>{val}<span className="text-[10px] text-textMuted ml-1">/ {target}g</span></span>
      </div>
      <div className="h-2 w-full bg-borderline/20 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full transition-all duration-1000 shadow-[0_0_12px_currentColor] rounded-full" 
          style={{ width: `${percent}%`, backgroundColor: color, color }}
        ></div>
      </div>
    </div>
  );
}

function RecoveryCard({ label, val, status, color }: { label: string, val: string, status: string, color: string }) {
  return (
    <div className="bg-surface/40 border border-borderline rounded-[22px] p-6 hover:border-white/20 transition-all group shadow-lg">
      <div className="text-[9px] font-mono font-bold text-textMuted uppercase tracking-[0.3em] mb-3">{label}</div>
      <div className="flex items-baseline justify-between">
         <div className="text-[28px] font-orbitron font-black text-textPri drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">{val}</div>
         <div className="text-[9px] font-mono font-bold px-2.5 py-1 rounded border border-borderline group-hover:text-white group-hover:bg-white/10 transition-all uppercase tracking-widest">{status}</div>
      </div>
      <div className="mt-5 h-[3px] w-full bg-borderline/10 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-700 opacity-30 group-hover:opacity-100 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, width: '70%', color }}></div>
      </div>
    </div>
  );
}

function getCycleData(cycle: number) {
  const base = [
    { label: 'Mon', focus: 'Upper Power', moves: ['Bench Press', 'Pull-ups'], rest: false },
    { label: 'Tue', focus: 'Lower Power', moves: ['Squat', 'RDL'], rest: false },
    { label: 'Wed', focus: 'Active Recovery', moves: ['Mobility', 'Z2 Cardio'], rest: true },
    { label: 'Thu', focus: 'Upper Hyper', moves: ['Incl. DB', 'Rows'], rest: false },
    { label: 'Fri', focus: 'Lower Hyper', moves: ['Leg Press', 'Curls'], rest: false },
    { label: 'Sat', focus: 'Weak Points', moves: ['Shoulders', 'Arms'], rest: false },
    { label: 'Sun', focus: 'System Rest', moves: ['Sleep', 'Meal Prep'], rest: true },
  ];
  if (cycle === 2) return base.map(d => d.rest ? d : { ...d, focus: d.focus + ' (Heavy)', moves: d.moves.map(m => m + ' (+5%)') });
  if (cycle === 3) return base.map(d => d.rest ? d : { ...d, focus: 'Deload Focus', moves: ['Technique', 'RPE 6'] });
  if (cycle === 4) return base.map(d => d.rest ? d : { ...d, focus: 'PR Calibration', moves: ['1-Rep Max', 'Max Effort'] });
  return base;
}