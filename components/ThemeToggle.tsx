"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // 1. Function to evaluate time and set the theme
    const evaluateAutoTheme = () => {
      const currentHour = new Date().getHours();
      // Night mode is before 6 AM or after 6 PM (18:00)
      const isNightTime = currentHour < 6 || currentHour >= 18;
      
      if (isNightTime) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    };

    // 2. Run immediately when the dashboard loads
    evaluateAutoTheme();

    // 3. Keep checking every minute so it shifts smoothly if you leave the tab open
    const timeCheckInterval = setInterval(evaluateAutoTheme, 60000);

    return () => clearInterval(timeCheckInterval);
  }, []);

  // Manual override (temporary until the next minute check, or next refresh)
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div 
      onClick={toggleTheme} 
      className="cursor-pointer hover:text-textPri transition-colors select-none flex items-center gap-2"
      title="Click to override"
    >
      <span className="text-[10px] text-textMuted uppercase font-barlow tracking-wider">
        {isDark ? 'Auto: Night' : 'Auto: Day'}
      </span>
      <span>{isDark ? '🌙' : '☀️'}</span>
    </div>
  );
}