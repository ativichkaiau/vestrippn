'use client';
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    const evaluateAutoTheme = () => {
      // If the user manually toggled, stop the auto-override
      if (isManual) return;

      const currentHour = new Date().getHours();
      const isNightTime = currentHour < 6 || currentHour >= 18;
      
      if (isNightTime) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    };

    evaluateAutoTheme();
    const timeCheckInterval = setInterval(evaluateAutoTheme, 60000);
    return () => clearInterval(timeCheckInterval);
  }, [isManual]);

  const toggleTheme = () => {
    setIsManual(true); // Disable auto-switching for this session
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 border border-transparent dark:border-white/5 active:scale-95 group shadow-sm"
      title={isManual ? "Manual Control Active" : "Auto-Theme Active"}
    >
      <div className="flex flex-col items-start leading-none">
        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Mode
        </span>
        <span className="text-[11px] font-bold tracking-tight text-neutral-900 dark:text-white">
          {isDark ? 'Night' : 'Day'} {isManual && '•'}
        </span>
      </div>
      <span className="text-[16px] leading-none group-hover:scale-110 transition-transform duration-300">
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}