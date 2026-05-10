'use client';

import { useState, useEffect } from 'react';

export default function FitnessCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [workoutDays, setWorkoutDays] = useState<boolean[]>([true, true, true, true, true, false, true]);
  const [lastWorkout, setLastWorkout] = useState('Upper Body Hypertrophy');
  const [streak, setStreak] = useState(5);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('vestrippn-fitness');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.workoutDays && data.workoutDays.length === 7) setWorkoutDays(data.workoutDays);
        if (data.lastWorkout) setLastWorkout(data.lastWorkout);
        if (data.streak !== undefined) setStreak(data.streak);
      }
    } catch (e) { console.error("Bio-Link Error", e); }
  }, []);

  const saveData = (updates: any) => {
    const newData = { workoutDays, lastWorkout, streak, ...updates };
    localStorage.setItem('vestrippn-fitness', JSON.stringify(newData));
  };

  const checkStreakReset = (days: boolean[]) => {
    let consecutiveMisses = 0;
    for (let i = 0; i < days.length; i++) {
      if (!days[i]) {
        consecutiveMisses++;
        if (consecutiveMisses >= 2) return true;
      } else { consecutiveMisses = 0; }
    }
    return false;
  };

  const toggleDay = (index: number) => {
    const isTryingToCheck = !workoutDays[index];
    if (isTryingToCheck && !isUnlocked) return; 

    const newDays = [...workoutDays];
    newDays[index] = !newDays[index];
    setWorkoutDays(newDays);

    let newStreak = streak;
    if (checkStreakReset(newDays)) newStreak = 0; 

    setStreak(newStreak);
    saveData({ workoutDays: newDays, streak: newStreak });
    if (isTryingToCheck) setIsUnlocked(false);
  };

  const handleSyncCalendar = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const nextDateStr = nextDay.toISOString().split('T')[0].replace(/-/g, '');

    const title = encodeURIComponent(`🏋️ Workout: ${lastWorkout}`);
    const details = encodeURIComponent(`Logged via VEStriPPN Dashboard.\nEarned Streak: ${streak + 1} Days 🔥`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${nextDateStr}&details=${details}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsUnlocked(true);
  };

  if (!isMounted) return <div className="h-[200px] bg-[var(--surface)]/20 border border-[var(--borderline)] rounded-[22px] animate-pulse" />;

  const completedCount = workoutDays.filter(Boolean).length;

  return (
    <div className="bg-[var(--surface)]/40 border border-[var(--borderline)] rounded-[22px] p-6 shadow-2xl flex flex-col h-full relative overflow-hidden group transition-all hover:border-[var(--accentEmerald)]/30">
      
      {/* TACTICAL OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accentEmerald)] shadow-[0_0_10px_var(--accentEmerald)]"></div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--textPri)]">Vitality Monitor</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--textMuted)] uppercase tracking-widest tabular-nums">
          {completedCount}/7 Modules_Active
        </span>
      </div>

      <div className="relative z-10 flex flex-1 items-end justify-between">
        <div className="w-full mr-8 flex flex-col justify-end h-full">
          
          {/* INTERACTIVE BIOMETRIC BARS */}
          <div className="flex gap-1.5 mb-6 h-[10px]">
            {workoutDays.map((isDone, idx) => (
              <button
                key={idx}
                onClick={() => toggleDay(idx)}
                className={`flex-1 rounded-sm transition-all duration-500 ${
                  isDone 
                    ? 'bg-[var(--accentEmerald)] shadow-[0_0_12px_var(--accentEmerald)] opacity-90' 
                    : isUnlocked
                        ? 'bg-[var(--base)] border border-[var(--accentCyan)] animate-pulse shadow-[0_0_8px_var(--accentCyan)]'
                        : 'bg-[var(--borderline)]/10 border border-[var(--borderline)]/20 opacity-40 cursor-not-allowed'
                }`}
              />
            ))}
          </div>

          {/* LAST WORKOUT TERMINAL FIELD */}
          <div className="flex items-center gap-3 p-3 bg-[var(--base)]/30 border border-[var(--borderline)] rounded-xl group/sync transition-all hover:border-[var(--accentEmerald)]/30">
            <div className="flex flex-col flex-1 min-w-0">
               <span className="text-[8px] font-mono text-[var(--textMuted)] uppercase tracking-widest mb-1">Last_Session</span>
               <input
                 type="text"
                 value={lastWorkout}
                 onChange={(e) => { setLastWorkout(e.target.value); saveData({ lastWorkout: e.target.value }); }}
                 className="bg-transparent outline-none text-[12px] text-[var(--textPri)] font-bold truncate w-full"
               />
            </div>
            
            <button
              onClick={handleSyncCalendar}
              className={`p-2 rounded-lg border transition-all ${isUnlocked ? 'bg-[var(--accentCyan)]/10 border-[var(--accentCyan)] text-[var(--accentCyan)]' : 'bg-[var(--borderline)]/20 border-transparent text-[var(--textMuted)] hover:text-[var(--accentCyan)] hover:border-[var(--accentCyan)]'}`}
              title="Sync to Cloud to Unlock"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* STREAK COUNTER (Orbitron Match) */}
        <div className="text-right shrink-0 flex flex-col items-end pb-1">
          <div className="flex items-baseline font-orbitron text-[36px] font-black text-[var(--textPri)] leading-none drop-shadow-[0_0_15px_rgba(34,211,153,0.2)]">
            <span className={streak === 0 ? 'text-[var(--statusRed)] animate-pulse' : 'text-[var(--accentEmerald)]'}>
              {streak}
            </span>
            <span className={`ml-1 text-[24px] ${streak === 0 ? 'grayscale opacity-30' : ''}`}>🔥</span>
          </div>
          <div className="text-[9px] font-mono text-[var(--textMuted)] mt-2 uppercase tracking-[0.2em]">Bio_Streak</div>
        </div>
      </div>
    </div>
  );
}