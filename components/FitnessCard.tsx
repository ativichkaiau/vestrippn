'use client';

import { useState, useEffect } from 'react';

export default function FitnessCard() {
  const [isMounted, setIsMounted] = useState(false);

  // State: 7 days.
  const [workoutDays, setWorkoutDays] = useState<boolean[]>([true, true, true, true, true, false, true]);
  const [lastWorkout, setLastWorkout] = useState('Upper Body Hypertrophy');
  const [streak, setStreak] = useState(5);
  
  // The Gatekeeper State
  const [isUnlocked, setIsUnlocked] = useState(false);

  // WAKE UP: Load saved fitness data
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('vestrippn-fitness');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.workoutDays && data.workoutDays.length === 7) {
            setWorkoutDays(data.workoutDays);
        } else if (data.workoutDays && data.workoutDays.length === 5) {
            setWorkoutDays([...data.workoutDays, false, false]);
        }
        if (data.lastWorkout) setLastWorkout(data.lastWorkout);
        if (data.streak !== undefined) setStreak(data.streak);
      }
    } catch (e) {
      console.error("Failed to load fitness data", e);
    }
  }, []);

  // Save Function
  const saveData = (updates: any) => {
    const newData = { workoutDays, lastWorkout, streak, ...updates };
    localStorage.setItem('vestrippn-fitness', JSON.stringify(newData));
  };

  // The "Streak Killer" Algorithm
  const checkStreakReset = (days: boolean[]) => {
    let consecutiveMisses = 0;
    for (let i = 0; i < days.length; i++) {
      if (!days[i]) {
        consecutiveMisses++;
        if (consecutiveMisses >= 2) return true;
      } else {
        consecutiveMisses = 0;
      }
    }
    return false;
  };

  // Interactions
  const toggleDay = (index: number) => {
    const isTryingToCheck = !workoutDays[index];

    // THE GATE: Block the click if they haven't synced, UNLESS they are just unchecking a mistake
    if (isTryingToCheck && !isUnlocked) {
      return; 
    }

    const newDays = [...workoutDays];
    newDays[index] = !newDays[index];
    setWorkoutDays(newDays);

    let newStreak = streak;
    if (checkStreakReset(newDays)) {
      newStreak = 0; 
    }

    setStreak(newStreak);
    saveData({ workoutDays: newDays, streak: newStreak });

    // Lock the gate immediately after they claim their day
    if (isTryingToCheck) {
      setIsUnlocked(false);
    }
  };

  const updateLastWorkout = (val: string) => {
    setLastWorkout(val);
    saveData({ lastWorkout: val });
  };

  // 🗓️ GOOGLE CALENDAR SYNC ENGINE (The Key)
  const handleSyncCalendar = () => {
    // Format dates for Google Calendar (YYYYMMDD)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Default to an all-day event
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    const nextDateStr = nextDay.toISOString().split('T')[0].replace(/-/g, '');

    // CALCULATE PROJECTED STREAK
    // Since you are unlocking the gate to claim today, your calendar should reflect the earned streak.
    const projectedStreak = streak + 1;

    // Encode the data to be URL safe
    const title = encodeURIComponent(`🏋️ Workout: ${lastWorkout}`);
    const details = encodeURIComponent(`Logged via VEStriPPN Dashboard.\nEarned Streak: ${projectedStreak} Days 🔥\n\n"Train, recover, repeat. No drama."`);
    
    // Construct the direct sync URL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${nextDateStr}&details=${details}`;
    
    // Launch the calendar and UNLOCK THE GATE
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsUnlocked(true);
  };
  // Hydration safety
  if (!isMounted) return <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm h-[130px] animate-pulse" />;

  // Math for the header
  const completedCount = workoutDays.filter(Boolean).length;
  const totalCount = workoutDays.length;

  return (
    <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors h-full flex flex-col justify-between">
      
      {/* HEADER */}
      <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex justify-between items-center mb-4">
        <span>Fitness This Week</span>
        <span className="font-plex text-textPri normal-case">{completedCount}/{totalCount} Done</span>
      </div>

      <div className="flex items-end justify-between mt-auto">
        <div className="w-full mr-8">
          
          {/* INTERACTIVE PROGRESS BARS */}
          <div className="flex gap-1 mb-2 h-[8px]">
            {workoutDays.map((isDone, idx) => (
              <button
                key={idx}
                onClick={() => toggleDay(idx)}
                className={`flex-1 rounded-sm transition-all duration-300 ${
                  isDone 
                    ? 'bg-statusGreen shadow-[0_0_8px_rgba(34,197,94,0.3)] cursor-pointer' 
                    : isUnlocked
                        ? 'bg-base border border-accentCyan/80 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.4)] cursor-pointer'
                        : 'bg-base border border-borderline cursor-not-allowed opacity-70'
                }`}
                title={!isDone && !isUnlocked ? "Sync to Google Calendar to unlock" : `Toggle Day ${idx + 1}`}
              />
            ))}
          </div>

          {/* EDITABLE LAST WORKOUT & CALENDAR SYNC */}
          <div className="flex items-center gap-1 text-[11px] text-textSec group/sync w-full">
            <span>Last:</span>
            <input
              type="text"
              value={lastWorkout}
              onChange={(e) => updateLastWorkout(e.target.value)}
              className="bg-transparent outline-none hover:bg-borderline/30 focus:bg-base focus:ring-1 focus:ring-accentCyan/50 rounded px-1 -ml-1 transition-colors truncate w-full max-w-[140px]"
            />
            
            {/* The Hidden Calendar Button (The Key) */}
            <button
              onClick={handleSyncCalendar}
              className={`transition-all duration-200 p-1 rounded hover:bg-accentCyan/10 ${isUnlocked ? 'text-accentCyan opacity-100' : 'text-textMuted hover:text-accentCyan opacity-0 group-hover/sync:opacity-100'}`}
              title="Log to Google Calendar to Unlock"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* LOCKED STREAK */}
        <div className="text-right shrink-0 flex flex-col items-end">
          <div className="flex items-center font-barlow text-[28px] text-textPri leading-none group">
            <span className={`transition-colors ${streak === 0 ? 'text-red-500' : ''}`}>
              {streak}
            </span>
            <span className={`ml-1 tracking-wider text-[24px] transition-colors ${streak === 0 ? 'grayscale opacity-50' : ''}`}>🔥</span>
          </div>
          <div className="text-[11px] text-textSec mt-1">Current Streak</div>
        </div>
      </div>
    </div>
  );
}