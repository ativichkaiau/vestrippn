'use client';

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Using hour12: false for a clean 24-hour military/system time format
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    };
    
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-0.5 transition-colors duration-700">
        Local Time
      </div>
      <div className="text-[22px] font-black tracking-tighter tabular-nums text-neutral-900 dark:text-white transition-colors duration-700">
        {time}
      </div>
    </div>
  );
}