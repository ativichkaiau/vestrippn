'use client';

import { useEffect, useState } from 'react';

/* W85 — just the date. The "Day N of 120" arc pill (and the 2026-04-23 arc
   start it counted from) is retired: the countdown was cockpit telemetry, not
   information the header needed to carry. */

export default function ArcDate() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Format to "Sunday, May 3"
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  if (!currentDate) {
    return <div className="h-6 w-40 rounded-full bg-black/5 dark:bg-white/5"></div>;
  }

  return (
    <div className="text-[12.5px] font-medium tracking-tight text-neutral-500 transition-colors duration-500 dark:text-neutral-400">
      {currentDate}
    </div>
  );
}
