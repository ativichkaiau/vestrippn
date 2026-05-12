'use client';

import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  text: string;
}

const defaultReminders: Reminder[] = [
  { id: '1', text: 'Laundry Protocol — Sunday' },
  { id: '2', text: 'Research Sync — 15:00' },
  { id: '3', text: 'IELTS Prep: Reading — 10:00' }
];

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
  const [inputValue, setInputValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      // Bumped to v3 for a clean state match with the new UI
      const saved = localStorage.getItem('vestrippn-reminders-v3');
      if (saved) setReminders(JSON.parse(saved));
    } catch (e) { console.error("Buffer Load Failure", e); }
  }, []);

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newReminder = { id: Date.now().toString(), text: inputValue.trim() };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    setInputValue('');
    localStorage.setItem('vestrippn-reminders-v3', JSON.stringify(updated));
  };

  const removeReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('vestrippn-reminders-v3', JSON.stringify(updated));
  };

  // Minimal skeleton matching Day/Night surface
  if (!isMounted) return (
    <div className="flex flex-col gap-4 animate-pulse transition-colors duration-700">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 w-32 bg-black/5 dark:bg-white/5 rounded-full"></div>
      </div>
      {[1, 2, 3].map(i => <div key={i} className="h-10 bg-black/5 dark:bg-white/5 rounded-xl"></div>)}
      <div className="h-12 w-full bg-black/5 dark:bg-white/5 rounded-xl mt-4"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full relative transition-colors duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="text-[16px] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
            🔔
          </div>
          <h2 className="font-bold text-[18px] tracking-tight text-neutral-900 dark:text-white transition-colors duration-700">
            Utility Alerts
          </h2>
        </div>
        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest tabular-nums px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 transition-colors duration-700">
          {reminders.length} Active
        </span>
      </div>

      {/* REMINDER LIST */}
      <ul className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2 mb-6 min-h-[150px]">
        {reminders.length === 0 ? (
          <li className="h-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-[12px] font-medium italic transition-colors duration-700">
            Buffer empty. No alerts active.
          </li>
        ) : (
          reminders.map((reminder) => (
            <li 
              key={reminder.id} 
              className="group/item flex items-center justify-between gap-3 px-3.5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 active:scale-[0.98] select-none cursor-default border border-transparent dark:border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-500/50 group-hover/item:bg-blue-500 dark:bg-blue-400/50 dark:group-hover/item:bg-blue-400 transition-colors duration-300"></span>
                <span className="text-[14px] text-neutral-700 dark:text-neutral-200 group-hover/item:text-neutral-900 dark:group-hover/item:text-white transition-colors duration-300 truncate tracking-tight font-medium">
                  {reminder.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeReminder(reminder.id)}
                className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300 px-2 font-black text-[18px] leading-none"
                title="Purge Alert"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>

      {/* INPUT SECTOR */}
      <form onSubmit={addReminder} className="relative shrink-0 flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Inject new alert..."
          className="w-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl pl-4 pr-16 py-3.5 text-[13px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-2 text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-300 px-3 py-1.5 rounded-lg tracking-widest"
        >
          Add
        </button>
      </form>
    </div>
  );
}