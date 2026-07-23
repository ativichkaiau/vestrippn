'use client';

import { useState, useEffect } from 'react';
import { updateFitnessData } from '@/app/actions';

interface FitnessCardProps {
  initialWorkoutDays?: boolean[];
  initialLastWorkout?: string;
  initialStreak?: number;
}

export default function FitnessCard({
  // Defaulting to absolute zero / 0% state
  initialWorkoutDays = [false, false, false, false, false, false, false],
  initialLastWorkout = "Awaiting Log...",
  initialStreak = 0
}: FitnessCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [workoutDays, setWorkoutDays] = useState<boolean[]>(initialWorkoutDays);
  const [lastWorkout, setLastWorkout] = useState(initialLastWorkout);
  const [streak, setStreak] = useState(initialStreak);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Smart Sync: Prevent Infinite Loops while fetching fresh cloud data
  useEffect(() => {
    setWorkoutDays(prevDays => {
      if (JSON.stringify(prevDays) === JSON.stringify(initialWorkoutDays)) return prevDays;
      return initialWorkoutDays;
    });
    setLastWorkout(prev => prev === initialLastWorkout ? prev : initialLastWorkout);
    setStreak(prev => prev === initialStreak ? prev : initialStreak);
  }, [initialWorkoutDays, initialLastWorkout, initialStreak]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
  }, []);

  const handleCloudSync = async (newDays: boolean[], newLastWorkout: string, newStreak: number) => {
    try {
      await updateFitnessData(newDays, newLastWorkout, newStreak);
    } catch (e) {
      console.error("Bio-Link Error", e);
    }
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

    // 1. Optimistic UI Update
    const newDays = [...workoutDays];
    newDays[index] = !newDays[index];
    setWorkoutDays(newDays);

    let newStreak = streak;
    if (checkStreakReset(newDays)) newStreak = 0; 
    setStreak(newStreak);

    if (isTryingToCheck) setIsUnlocked(false);

    // 2. Sync to Cloud
    handleCloudSync(newDays, lastWorkout, newStreak);
  };

  const handleWorkoutTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastWorkout(e.target.value);
  };

  const handleWorkoutTextBlur = () => {
    handleCloudSync(workoutDays, lastWorkout, streak);
  };

  const handleSyncCalendar = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const nextDateStr = nextDay.toISOString().split('T')[0].replace(/-/g, '');

    const title = encodeURIComponent(`🏋️ Workout: ${lastWorkout}`);
    const details = encodeURIComponent(`Logged via VESTRIPPN Dashboard.\nEarned Streak: ${streak + 1} Days 🔥`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${nextDateStr}&details=${details}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsUnlocked(true);
  };

  // --- Calendar Logic ---
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const todayDate = currentDate.getDate();

  const calendarSlots: (number | null)[] = [
    ...Array.from({ length: firstDayOfMonth }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  // --- Skeleton Loader ---
  if (!isMounted) return (
    <div className="w-full flex items-center justify-between animate-pulse">
       <div className="h-10 w-1/2 bg-black/5 dark:bg-white/5 rounded-xl"></div>
       <div className="h-24 w-[200px] bg-black/5 dark:bg-white/5 rounded-xl"></div>
    </div>
  );

  const completedCount = workoutDays.filter(Boolean).length;

  return (
    <div className="flex flex-col xl:flex-row w-full h-full gap-8 xl:gap-10 xl:items-center justify-between group transition-colors duration-700">
      
      {/* PANE 1: Interactive Module */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm transition-colors duration-700">
              ⚡
            </div>
            <h2 className="font-bold text-[18px] tracking-tight text-neutral-900 dark:text-white transition-colors duration-700">
              Vitality Monitor
            </h2>
          </div>
          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest tabular-nums transition-colors duration-700">
            {completedCount}/7 Active
          </span>
        </div>

        <div className="flex gap-1.5 h-[10px] w-full shrink-0">
          {workoutDays.map((isDone, idx) => (
            <button
              key={idx}
              onClick={() => toggleDay(idx)}
              title={`Module ${idx + 1}`}
              className={`flex-1 rounded-full transition-all duration-300 ${
                isDone 
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] opacity-100 active:scale-95' 
                  : isUnlocked
                      ? 'bg-transparent border border-blue-500 animate-pulse'
                      : 'bg-black/5 dark:bg-white/10 opacity-60 cursor-not-allowed'
              }`}
            />
          ))}
        </div>

        <div className="flex w-full items-center gap-2 p-1.5 pl-4 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors duration-300 focus-within:ring-2 focus-within:ring-emerald-500/30">
          <input
            type="text"
            value={lastWorkout}
            onChange={handleWorkoutTextChange}
            onBlur={handleWorkoutTextBlur}
            className="bg-transparent outline-none text-[13px] text-neutral-700 dark:text-neutral-200 font-bold truncate w-full transition-colors duration-700"
            placeholder="Session type..."
          />
          <button
            onClick={handleSyncCalendar}
            className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider ${
              isUnlocked 
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                : 'bg-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Sync to Google Calendar"
          >
            <span className="hidden sm:block">{isUnlocked ? 'Ready' : 'Sync'}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

      </div>

      {/* PANE 2: The Streak Counter */}
      <div className="shrink-0 flex items-center gap-3 xl:px-8 xl:border-x border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex flex-col items-end xl:items-center">
          <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1 transition-colors duration-700">
            Bio Streak
          </div>
          <div className="flex items-baseline text-[42px] font-black leading-none tracking-tighter">
            <span className={`transition-colors duration-700 ${streak === 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
              {streak}
            </span>
            <span className={`text-[28px] ml-1 transition-all ${streak === 0 ? 'grayscale opacity-30' : 'drop-shadow-md'}`}>🔥</span>
          </div>
        </div>
      </div>

      {/* PANE 3: Live Calendar Integration */}
      <div className="shrink-0 w-full xl:w-[220px] flex flex-col justify-center">
        
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[12px] font-bold text-neutral-900 dark:text-white transition-colors duration-700 tracking-tight">
            {currentMonth} {currentYear}
          </span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest transition-colors duration-700">
            Live
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-[9px] font-bold text-neutral-400 text-center uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarSlots.map((day, idx) => (
            <div 
              key={idx} 
              className={`w-full aspect-square flex items-center justify-center text-[11px] font-bold rounded-full transition-all duration-300 ${
                day === todayDate 
                  ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-110' 
                  : day 
                    ? 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 cursor-default' 
                    : 'bg-transparent'
              }`}
            >
              {day || ''}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}