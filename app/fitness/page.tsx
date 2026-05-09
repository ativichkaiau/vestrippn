'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import FitnessCard from '../../components/FitnessCard';
import TopNavProfile from '../../components/TopNavProfile'; // <-- Imported Auth Status

export default function FitnessHub() {
  // Target Macros
  const targets = { protein: 160, carbs: 300, fats: 70, calories: 2470 };

  // Live State
  const [meals, setMeals] = useState<{name: string, protein: number, carbs: number, fats: number, calories: number}[]>([]);
  const [metrics, setMetrics] = useState({ sleep: "7h 20m", weight: "72.4", water: "2.1" });
  
  // UI State
  const [isLogging, setIsLogging] = useState(false);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', protein: '', carbs: '', fats: '', calories: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  // --- THE STORAGE ENGINE ---
  useEffect(() => {
    const savedMealData = localStorage.getItem('vestrippn_meals');
    const today = new Date().toLocaleDateString();
    
    if (savedMealData) {
      const parsed = JSON.parse(savedMealData);
      if (parsed.date === today) {
        setMeals(parsed.meals);
      } else {
        setMeals([]);
      }
    }

    const savedMetrics = localStorage.getItem('vestrippn_metrics');
    if (savedMetrics) {
      setMetrics(JSON.parse(savedMetrics));
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const today = new Date().toLocaleDateString();
      localStorage.setItem('vestrippn_meals', JSON.stringify({ date: today, meals }));
    }
  }, [meals, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vestrippn_metrics', JSON.stringify(metrics));
    }
  }, [metrics, isLoaded]);

  // Dynamic Calculations
  const current = {
    protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
    carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
    fats: meals.reduce((sum, meal) => sum + meal.fats, 0),
    calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
  };

  let metabolicState = "OPTIMAL";
  let stateColors = "text-statusGreen border-statusGreen/30 bg-statusGreen/10";
  let dotColor = "bg-statusGreen";

  if (current.calories === 0 || current.calories < targets.calories * 0.4) {
    metabolicState = "FASTING STATE";
    stateColors = "text-accentCyan border-accentCyan/30 bg-accentCyan/10";
    dotColor = "bg-accentCyan";
  } else if (current.calories > targets.calories) {
    metabolicState = "CALORIC SURPLUS";
    stateColors = "text-accentAmber border-accentAmber/30 bg-accentAmber/10";
    dotColor = "bg-accentAmber";
  }

  const handleLogMeal = () => {
    if (meals.length >= 3) return;
    if (!newMeal.name || !newMeal.calories) return;

    setMeals([...meals, {
      name: newMeal.name,
      protein: Number(newMeal.protein) || 0,
      carbs: Number(newMeal.carbs) || 0,
      fats: Number(newMeal.fats) || 0,
      calories: Number(newMeal.calories) || 0
    }]);

    setNewMeal({ name: '', protein: '', carbs: '', fats: '', calories: '' });
    setIsLogging(false);
  };

  const handleResetMeals = () => {
    if(confirm("Clear today's macros?")) {
      setMeals([]);
    }
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* TOP BAR */}
      <header className="h-[56px] border-b border-borderline flex items-center justify-between px-4 md:px-6 shrink-0 bg-base">
        <div className="font-orbitron font-bold text-[15px] md:text-[18px] text-textPri uppercase tracking-wider truncate">
          vestrippn3point0
        </div>
        <div className="hidden sm:block text-[13px] text-textSec font-medium">
          <ArcDate />
        </div>
        <div className="flex gap-4 items-center text-textSec text-[14px]">
          
          {/* F1 TELEMETRY GIMMICK */}
          <div className="hidden sm:flex items-center gap-1 bg-surface border border-borderline px-3 py-1 rounded">
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#06b6d4] transition-colors duration-300">SYS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#06b6d4] group-hover:border-[#06b6d4] group-hover:shadow-[0_0_12px_#06b6d4] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#22c55e] transition-colors duration-300">AERO</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#22c55e] group-hover:border-[#22c55e] group-hover:shadow-[0_0_12px_#22c55e] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#f59e0b] transition-colors duration-300">ERS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#f59e0b] group-hover:border-[#f59e0b] group-hover:shadow-[0_0_12px_#f59e0b] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#ef4444] transition-colors duration-300">DRS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#ef4444] group-hover:border-[#ef4444] group-hover:shadow-[0_0_12px_#ef4444] transition-all duration-300"></div>
            </div>
          </div>

          {/* DYNAMIC AUTHENTICATION STATUS */}
          <TopNavProfile />

          <ThemeToggle />
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-base">
        
        {/* SIDEBAR (Mobile optimized scrolling & touch targets) */}
        <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between px-4 py-3 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            <Link href="/" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Dashboard
            </Link>
            <Link href="/academics" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Academics
            </Link>
            <Link href="/research" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Research
            </Link>
            
            {/* ACTIVE: FITNESS */}
            <div className="text-accentCyan cursor-default transition-all flex items-center gap-1.5 font-medium px-3 py-1.5 md:px-0 md:py-0 md:pl-4 bg-accentCyan/5 md:bg-transparent rounded md:rounded-none">
              <span className="text-[10px]">◉</span> Fitness & Diet
            </div>

            <Link href="/archive" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Archive
            </Link>

            <Link href="/ielts" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>
            <Link href="/tools" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Tools & Links</Link>
            <Link href="/identity" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Identity</Link>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* FITNESS CONTENT */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          
          {/* HEADER SECTION (Responsive Text & Spacing) */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 mb-2 gap-3">
            <div>
              <h1 className="font-barlow text-[24px] sm:text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Physical Command</h1>
              <p className="text-[12px] sm:text-[13px] text-textSec mt-1">Biomarkers, Nutrition, and Training Mesocycle</p>
            </div>
            <div className="flex">
              <div className={`text-[10px] sm:text-[11px] font-mono border px-3 py-1.5 sm:py-1 rounded flex items-center gap-2 transition-colors ${stateColors}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`}></span>
                METABOLIC STATE: {metabolicState}
              </div>
            </div>
          </div>

          {/* TOP GRID: STREAK & MACROS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
            
            <div className="min-h-[180px] h-full flex flex-col justify-end">
              <FitnessCard />
            </div>

            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm min-h-[180px] flex flex-col hover:border-accentCyan/40 transition-colors relative">
              {!isLogging ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex items-center gap-2">
                      Daily Fuel ({meals.length}/3)
                      {meals.length > 0 && (
                        <button onClick={handleResetMeals} className="text-[9px] text-textMuted border border-textMuted/30 px-1.5 py-0.5 rounded hover:text-red-400 hover:border-red-400/50 transition-colors">RESET</button>
                      )}
                    </span>
                    <span className="font-plex text-textPri text-[13px]">
                      {current.calories} / <span className="text-textSec">{targets.calories} kcal</span>
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-textPri font-medium">Protein</span>
                        <span className="text-textSec font-mono">{current.protein}g / {targets.protein}g</span>
                      </div>
                      <div className="h-1.5 w-full bg-base rounded-full overflow-hidden">
                        <div className="h-full bg-accentCyan transition-all duration-500" style={{ width: `${Math.min((current.protein / targets.protein) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-textPri font-medium">Carbohydrates</span>
                        <span className="text-textSec font-mono">{current.carbs}g / {targets.carbs}g</span>
                      </div>
                      <div className="h-1.5 w-full bg-base rounded-full overflow-hidden">
                        <div className="h-full bg-statusGreen transition-all duration-500" style={{ width: `${Math.min((current.carbs / targets.carbs) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-textPri font-medium">Fats</span>
                        <span className="text-textSec font-mono">{current.fats}g / {targets.fats}g</span>
                      </div>
                      <div className="h-1.5 w-full bg-base rounded-full overflow-hidden">
                        <div className="h-full bg-accentAmber transition-all duration-500" style={{ width: `${Math.min((current.fats / targets.fats) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsLogging(true)}
                    disabled={meals.length >= 3}
                    className="mt-auto w-full py-2 sm:py-1.5 border border-borderline rounded text-[11px] text-textSec uppercase tracking-wider font-bold hover:text-accentCyan hover:border-accentCyan/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {meals.length >= 3 ? 'DAILY LIMIT REACHED' : '+ LOG MEAL'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-accentCyan">Log Intake</span>
                    <button onClick={() => setIsLogging(false)} className="text-[10px] text-textMuted hover:text-textPri p-1">CANCEL</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Meal Name (e.g. Chicken Rice)" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} className="col-span-2 bg-base border border-borderline rounded px-3 py-2 sm:py-1.5 text-[12px] text-textPri outline-none focus:border-accentCyan/50" />
                    <input type="number" placeholder="Protein (g)" value={newMeal.protein} onChange={e => setNewMeal({...newMeal, protein: e.target.value})} className="bg-base border border-borderline rounded px-3 py-2 sm:py-1.5 text-[12px] text-textPri outline-none focus:border-accentCyan/50" />
                    <input type="number" placeholder="Carbs (g)" value={newMeal.carbs} onChange={e => setNewMeal({...newMeal, carbs: e.target.value})} className="bg-base border border-borderline rounded px-3 py-2 sm:py-1.5 text-[12px] text-textPri outline-none focus:border-accentCyan/50" />
                    <input type="number" placeholder="Fats (g)" value={newMeal.fats} onChange={e => setNewMeal({...newMeal, fats: e.target.value})} className="bg-base border border-borderline rounded px-3 py-2 sm:py-1.5 text-[12px] text-textPri outline-none focus:border-accentCyan/50" />
                    <input type="number" placeholder="Calories" value={newMeal.calories} onChange={e => setNewMeal({...newMeal, calories: e.target.value})} className="bg-base border border-borderline rounded px-3 py-2 sm:py-1.5 text-[12px] text-textPri outline-none focus:border-accentCyan/50" />
                  </div>

                  <button 
                    onClick={handleLogMeal}
                    className="mt-auto w-full py-2 sm:py-1.5 bg-accentCyan/10 border border-accentCyan/50 text-accentCyan rounded text-[11px] uppercase tracking-wider font-bold hover:bg-accentCyan/20 transition-all"
                  >
                    CONFIRM MACROS
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
            
            <div className="xl:col-span-2 bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec border-b border-borderline pb-3 mb-4 flex justify-between">
                <span>Current Mesocycle: Hypertrophy Block</span>
                <span className="text-accentCyan">Week 3 / 10</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SplitDay day="MON" focus="Upper Power" exercises={['Bench Press', 'Weighted Pull-ups', 'Rows']} active />
                <SplitDay day="TUE" focus="Lower Power" exercises={['Squats', 'RDLs', 'Calf Raises']} />
                <SplitDay day="WED" focus="Active Recovery" exercises={['Zone 2 Cardio', 'Mobility']} isRest />
                <SplitDay day="THU" focus="Upper Hypertrophy" exercises={['Incline DB', 'Lat Pulldowns', 'Arms']} />
                <SplitDay day="FRI" focus="Lower Hypertrophy" exercises={['Leg Press', 'Ham Curls', 'Extensions']} />
                <SplitDay day="SAT" focus="Weak Points" exercises={['Shoulders', 'Abs', 'Forearms']} />
                <SplitDay day="SUN" focus="Complete Rest" exercises={['Meal Prep', 'Sleep']} isRest />
              </div>
            </div>

            <div className="xl:col-span-1 bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors flex flex-col">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec border-b border-borderline pb-3 mb-4 flex justify-between items-center">
                <span>Recovery Metrics</span>
                <button 
                  onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                  className="text-[10px] text-accentCyan border border-accentCyan/30 px-3 sm:px-2 py-1 sm:py-0.5 rounded hover:bg-accentCyan/10 transition-colors"
                >
                  {isEditingMetrics ? 'SAVE' : 'EDIT'}
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-base border border-borderline rounded p-3 relative group">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Sleep Quality</div>
                  <div className="flex items-end gap-2">
                    {isEditingMetrics ? (
                      <input 
                        type="text" 
                        value={metrics.sleep} 
                        onChange={(e) => setMetrics({...metrics, sleep: e.target.value})}
                        className="bg-surface border border-accentCyan/50 text-[16px] text-textPri font-bold px-2 py-1 rounded w-24 outline-none"
                      />
                    ) : (
                      <span className="text-[20px] text-textPri font-bold leading-none">{metrics.sleep}</span>
                    )}
                    <span className="text-[11px] text-statusGreen">Optimal</span>
                  </div>
                </div>

                <div className="bg-base border border-borderline rounded p-3 relative group">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Morning Weight</div>
                  <div className="flex items-end gap-2">
                    {isEditingMetrics ? (
                      <div className="flex items-end gap-1">
                        <input 
                          type="text" 
                          value={metrics.weight} 
                          onChange={(e) => setMetrics({...metrics, weight: e.target.value})}
                          className="bg-surface border border-accentCyan/50 text-[16px] text-textPri font-bold px-2 py-1 rounded w-20 outline-none"
                        />
                        <span className="text-[12px] text-textSec mb-1">kg</span>
                      </div>
                    ) : (
                      <span className="text-[20px] text-textPri font-bold leading-none">{metrics.weight} kg</span>
                    )}
                    <span className="text-[11px] text-accentCyan">On Target</span>
                  </div>
                </div>

                <div className="bg-base border border-borderline rounded p-3 relative group">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Water Intake</div>
                  <div className="flex items-end gap-2">
                    {isEditingMetrics ? (
                      <div className="flex items-end gap-1">
                        <input 
                          type="text" 
                          value={metrics.water} 
                          onChange={(e) => setMetrics({...metrics, water: e.target.value})}
                          className="bg-surface border border-accentCyan/50 text-[16px] text-textPri font-bold px-2 py-1 rounded w-16 outline-none"
                        />
                        <span className="text-[12px] text-textSec mb-1">L</span>
                      </div>
                    ) : (
                      <span className="text-[20px] text-textPri font-bold leading-none">{metrics.water} L</span>
                    )}
                    <span className="text-[11px] text-accentAmber">Target: 3.0L</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </>
  );
}

function SplitDay({ day, focus, exercises, active = false, isRest = false }: { day: string, focus: string, exercises: string[], active?: boolean, isRest?: boolean }) {
  return (
    <div className={`p-3 rounded border ${active ? 'bg-accentCyan/5 border-accentCyan shadow-[0_0_10px_rgba(6,182,212,0.1)]' : isRest ? 'bg-base/50 border-borderline border-dashed opacity-70' : 'bg-base border-borderline'} transition-colors`}>
      <div className={`text-[10px] font-bold tracking-widest mb-1 ${active ? 'text-accentCyan' : 'text-textSec'}`}>{day}</div>
      <div className="text-[12px] text-textPri font-medium mb-2 leading-tight">{focus}</div>
      <ul className="text-[10px] text-textMuted space-y-1">
        {exercises.map((ex, i) => (
          <li key={i} className="truncate">• {ex}</li>
        ))}
      </ul>
    </div>
  );
}