'use client';

import { useEffect, useState } from 'react';

export default function ArcDate() {
  const [currentDate, setCurrentDate] = useState('');
  const [arcDay, setArcDay] = useState(0);

  useEffect(() => {
    // Your exact starting point (April 23, 2026)
    const startDate = new Date('2026-04-23T00:00:00');
    const today = new Date();
    
    // Format to "Sunday, May 3"
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    // Calculate how many days have passed
    const diffTime = today.getTime() - startDate.getTime();
    // Math.floor rounds down to whole days, +1 makes the start date "Day 1"
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setCurrentDate(formattedDate);
    
    // Cap the day at 30 so it doesn't say "Day 31 of 30" later
    setArcDay(diffDays > 30 ? 30 : diffDays);
  }, []);

  // Prevents Next.js hydration errors by rendering a blank space for a millisecond
  if (!currentDate) return <div className="h-6 w-48 animate-pulse bg-borderline/20 rounded"></div>;

  return (
    <div className="flex items-center gap-2 font-mono text-sm tracking-wider uppercase transition-colors">
      <span className="text-textSec">{currentDate}</span>
      <span className="text-borderline">|</span>
      <span className="text-textPri font-semibold">
        Day <span className="text-accentCyan">{arcDay}</span> of 30
      </span>
    </div>
  );
}