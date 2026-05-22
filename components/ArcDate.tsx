'use client';

import { useEffect, useState } from 'react';

export default function ArcDate() {
  const [currentDate, setCurrentDate] = useState('');
  const [arcDay, setArcDay] = useState(0);

  useEffect(() => {
    const startDate = new Date('2026-04-23T00:00:00');
    const today = new Date();
    
    // Format to "Sunday, May 3"
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // UPGRADE: Strip the hours/minutes to strictly compare calendar dates 
    // This prevents timezone or late-night offset bugs.
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setCurrentDate(formattedDate);
    setArcDay(diffDays > 120 ? 120 : diffDays);
  }, []);

  // UPGRADE: The skeleton loader now matches the glassmorphic aesthetic
  if (!currentDate) {
    return <div className="h-6 w-48 animate-pulse bg-black/5 dark:bg-white/5 rounded-full"></div>;
  }

  return (
    <div className="flex items-center gap-2.5 text-[12.5px] font-medium tracking-tight text-neutral-500 dark:text-neutral-400 transition-colors duration-500">
      
      {/* The Standard Date */}
      <span>{currentDate}</span>
      
      {/* Modern Dot Divider (Replaces the harsh '|' pipe) */}
      <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 hidden sm:block transition-colors duration-500"></span>
      
      {/* The Active Arc Pill Badge */}
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-bold transition-colors duration-500">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
        Day {arcDay} of 120
      </span>
      
    </div>
  );
}