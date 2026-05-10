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

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]', active: true },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
  ];

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-[var(--accentEmerald)]/5 rounded-full blur-[80px] lg:blur-[120px]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentEmerald)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      <header className="h-[56px] lg:h-[64px] border-b border-borderline flex items-center justify-between px-4 lg:px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="font-orbitron font-black text-[15px] lg:text-[18px] tracking-[0.2em] flex items-center gap-2">
            <div className="w-1 h-4 lg:w-1.5 lg:h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="hidden lg:flex gap-4 border-l border-borderline pl-6 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>BIO_SYNC: <span className="text-statusGreen uppercase font-bold">Nominal</span></span>
              <span>STATE: <span className="text-[var(--accentEmerald)] uppercase tracking-tighter">On_Target</span></span>
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
                  ? 'bg-[var(--accentEmerald)]/10 border-[var(--accentEmerald)]/20 shadow-[0_0_15px_rgba(52,211,153,0.05)] font-bold' 
                  : 'hover:bg-surface'
                }`}
              >
                <span className={`text-[14px] transition-all duration-300 ${
                  item.active 
                    ? `${item.color} drop-shadow-[0_0_5px_currentColor]` 
                    : 'text-textMuted opacity-40 group-hover:opacity-100'
                }`}>
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
          
          {/* SECTOR 1: NUTRITIONAL PROTOCOL HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            <div className="lg:col-span-4 min-h-[200px]">
              <FitnessCard />
            </div>

            <div className="lg:col-span-8 bg-surface/40 border border-borderline rounded-[22px] p-6 lg:p-8 shadow-xl relative overflow-hidden group">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-[var(--accentEmerald)] shadow-[0_0_10px_var(--accentEmerald)]"></div>
                    <span className="font-mono text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.3em] text-textPri">Nutritional Protocol</span>
                  </div>
                  <div className="font-orbitron text-[14px] lg:text-[16px] font-black text-textPri drop-shadow-[0_0_8px_var(--accentEmerald)] uppercase">
                    {current.calories} <span className="text-[9px] lg:text-[10px] text-textMuted tracking-widest">/ {targets.calories} KCAL</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  <MacroBar label="Protein" val={current.protein} target={targets.protein} color="var(--accentIndigo)" />
                  <MacroBar label="Carbohydrates" val={current.carbs} target={targets.carbs} color="var(--accentEmerald)" />
                  <MacroBar label="Fats" val={current.fats} target={targets.fats} color="var(--accentAmber)" />
               </div>

               <div className="mt-6 lg:mt-8 pt-6 border-t border-borderline/40 flex justify-between items-center">
                  <button onClick={() => setIsLogging(true)} className="px-4 lg:px-6 py-2 bg-[var(--accentCyan)]/10 border border-[var(--accentCyan)]/30 rounded-lg text-[9px] lg:text-[10px] font-black uppercase text-[var(--accentCyan)] tracking-widest hover:bg-[var(--accentCyan)]/20 transition-all">
                    Data Injection +
                  </button>
                  <button onClick={() => setMeals([])} className="text-[8px] lg:text-[9px] font-mono text-textMuted hover:text-statusRed transition-colors uppercase tracking-[0.2em]">
                    Flush_Buffer
                  </button>
               </div>
            </div>
          </div>

          {/* SECTOR 2: TACTICAL MESOCYCLE SWITCHER */}
          <section className="bg-surface/30 border border-borderline rounded-[22px] p-6 lg:p-8 shadow-xl overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-[var(--accentViolet)] shadow-[0_0_10px_var(--accentViolet)]"></div>
                  <span className="font-mono text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.3em] text-textPri">Mesocycle Matrix</span>
                </div>
                
                <div className="flex bg-base/50 border border-borderline p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar no-scrollbar">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setActiveCycle(num)}
                      className={`flex-1 md:flex-none px-4 lg:px-6 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-4">
                {getCycleData(activeCycle).map((day, i) => (
                  <div key={i} className={`p-4 lg:p-5 rounded-xl border transition-all ${day.rest ? 'border-dashed border-borderline opacity-40' : 'bg-base/40 border-borderline group/day hover:border-[var(--accentViolet)]/50'}`}>
                    <div className="text-[8px] font-mono font-bold text-textMuted uppercase mb-2 tracking-widest">{day.label}</div>
                    <div className={`text-[11px] lg:text-[13px] font-bold leading-tight mb-3 lg:mb-4 ${day.rest ? 'text-textMuted' : 'text-textPri group-hover/day:text-[var(--accentViolet)]'}`}>{day.focus}</div>
                    <div className="space-y-1">
                       {day.moves.map((m, j) => (
                         <div key={j} className="text-[8px] lg:text-[9px] font-mono text-textMuted truncate flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-borderline rounded-full"></span> {m}
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* SECTOR 3: BIO RECOVERY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <RecoveryCard label="Sleep Architecture" val={metrics.sleep} status="Restorative" color="var(--accentFuchsia)" />
            <RecoveryCard label="Biometric Weight" val={`${metrics.weight} kg`} status="Stable" color="var(--accentCyan)" />
            <RecoveryCard label="Hydration Level" val={`${metrics.water} L`} status="Optimal" color="var(--accentCyan)" />
          </div>

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
          <Link href="/identity" className="w-10 h-10 rounded-full bg-surface border border-borderline flex items-center justify-center text-[18px] text-[var(--accentCyan)]">
            ⚇
          </Link>
        </nav>

      </div>

      {/* MOBILE OPTIMIZED LOGGING MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-base/60 backdrop-blur-md p-4">
           <div className="bg-surface border border-borderline rounded-[22px] p-6 lg:p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 border-t-[var(--accentCyan)] border-t-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg lg:text-xl font-orbitron font-black text-textPri uppercase tracking-wider">Intake_Injection</h2>
                <button onClick={() => setIsLogging(false)} className="text-textMuted hover:text-textPri text-xs uppercase font-mono tracking-widest">Abort</button>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-8">
                <input type="text" placeholder="Entry ID" className="col-span-2 bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none focus:border-[var(--accentCyan)] shadow-inner" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} />
                <input type="number" placeholder="Pro" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.protein} onChange={e => setNewMeal({...newMeal, protein: e.target.value})} />
                <input type="number" placeholder="Cho" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.carbs} onChange={e => setNewMeal({...newMeal, carbs: e.target.value})} />
                <input type="number" placeholder="Fat" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.fats} onChange={e => setNewMeal({...newMeal, fats: e.target.value})} />
                <input type="number" placeholder="Kcal" className="bg-base/50 border border-borderline rounded-xl p-4 text-sm outline-none" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} />
              </div>
              <button onClick={() => {
                if(newMeal.name && newMeal.calories) {
                  setMeals([...meals, { name: newMeal.name, protein: Number(newMeal.protein), carbs: Number(newMeal.carbs), fats: Number(newMeal.fats), calories: Number(newMeal.calories) }]);
                  setIsLogging(false);
                  setNewMeal({ name: '', protein: '', carbs: '', fats: '', calories: '' });
                }
              }} className="w-full py-4 bg-[var(--accentCyan)] text-white rounded-xl font-bold uppercase text-[12px] tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)]">Commit Entry</button>
           </div>
        </div>
      )}
    </div>
  );
}

function MacroBar({ label, val, target, color }: { label: string, val: number, target: number, color: string }) {
  const percent = Math.min((val / target) * 100, 100);
  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="flex justify-between items-end px-1">
        <span className="text-[9px] lg:text-[10px] font-mono font-black text-textMuted uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[13px] lg:text-[15px] font-orbitron font-bold" style={{ color }}>{val}<span className="text-[9px] lg:text-[10px] text-textMuted ml-1">/ {target}g</span></span>
      </div>
      <div className="h-1.5 lg:h-2 w-full bg-borderline/20 rounded-full overflow-hidden shadow-inner">
        <div className="h-full transition-all duration-1000 shadow-[0_0_12px_currentColor] rounded-full" style={{ width: `${percent}%`, backgroundColor: color, color }}></div>
      </div>
    </div>
  );
}

function RecoveryCard({ label, val, status, color }: { label: string, val: string, status: string, color: string }) {
  return (
    <div className="bg-surface/40 border border-borderline rounded-[22px] p-5 lg:p-6 hover:border-white/20 transition-all group shadow-lg">
      <div className="text-[8px] lg:text-[9px] font-mono font-bold text-textMuted uppercase tracking-[0.3em] mb-2 lg:mb-3">{label}</div>
      <div className="flex items-baseline justify-between gap-2">
         <div className="text-[22px] lg:text-[28px] font-orbitron font-black text-textPri truncate">{val}</div>
         <div className="text-[8px] lg:text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-borderline group-hover:text-white transition-all uppercase whitespace-nowrap">{status}</div>
      </div>
      <div className="mt-4 lg:mt-5 h-[2px] lg:h-[3px] w-full bg-borderline/10 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-700 opacity-30 group-hover:opacity-100 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, width: '70%', color }}></div>
      </div>
    </div>
  );
}

function getCycleData(cycle: number) {
  const base = [
    { label: 'Mon', focus: 'Upper Power', moves: ['Bench', 'Pull-ups'], rest: false },
    { label: 'Tue', focus: 'Lower Power', moves: ['Squat', 'RDL'], rest: false },
    { label: 'Wed', focus: 'Recovery', moves: ['Mobility', 'Z2'], rest: true },
    { label: 'Thu', focus: 'Upper Hyper', moves: ['Incl.', 'Rows'], rest: false },
    { label: 'Fri', focus: 'Lower Hyper', moves: ['Press', 'Curls'], rest: false },
    { label: 'Sat', focus: 'Weak Points', moves: ['Shoulder', 'Abs'], rest: false },
    { label: 'Sun', focus: 'Rest', moves: ['Sleep', 'Prep'], rest: true },
  ];
  if (cycle === 2) return base.map(d => d.rest ? d : { ...d, focus: d.focus + ' (+)', moves: d.moves.map(m => m + ' (+5%)') });
  if (cycle === 3) return base.map(d => d.rest ? d : { ...d, focus: 'Deload', moves: ['RPE 6', 'Tech'] });
  if (cycle === 4) return base.map(d => d.rest ? d : { ...d, focus: 'PR Calibration', moves: ['Max Effort', '1-RM'] });
  return base;
}