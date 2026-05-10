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
      const saved = localStorage.getItem('vestrippn-reminders-v2');
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
    localStorage.setItem('vestrippn-reminders-v2', JSON.stringify(updated));
  };

  const removeReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('vestrippn-reminders-v2', JSON.stringify(updated));
  };

  if (!isMounted) return <div className="h-[250px] bg-[var(--surface)]/20 border border-[var(--borderline)] rounded-[22px] animate-pulse" />;

  return (
    <div className="bg-[var(--surface)]/40 border border-[var(--borderline)] rounded-[22px] p-6 shadow-2xl flex-1 flex flex-col min-h-[300px] relative overflow-hidden group transition-all hover:border-[var(--accentIndigo)]/30">
      
      {/* TACTICAL OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accentIndigo)] shadow-[0_0_10px_var(--accentIndigo)]"></div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--textPri)]">
            Utility Reminders
          </span>
        </div>
        <span className="text-[9px] font-mono text-[var(--textMuted)] uppercase tracking-widest tabular-nums border border-[var(--borderline)]/40 px-2 py-0.5 rounded">
          {reminders.length} Active
        </span>
      </div>

      {/* REMINDER LIST */}
      <ul className="relative z-10 flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 mb-6">
        {reminders.length === 0 ? (
          <li className="h-full flex items-center justify-center text-[var(--textMuted)] text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 italic">
            Buffer Empty // No Alerts
          </li>
        ) : (
          reminders.map((reminder) => (
            <li 
              key={reminder.id} 
              className="group/item flex items-center justify-between gap-3 p-2.5 bg-[var(--base)]/20 border border-transparent hover:border-[var(--accentIndigo)]/20 hover:bg-[var(--base)]/40 rounded-lg transition-all cursor-default"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accentIndigo)]/40 group-hover/item:bg-[var(--accentIndigo)] transition-colors shadow-[0_0_5px_var(--accentIndigo)]"></span>
                <span className="text-[13px] text-[var(--textSec)] group-hover/item:text-[var(--textPri)] transition-colors truncate tracking-tight font-medium">
                  {reminder.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeReminder(reminder.id)}
                className="text-[var(--textMuted)] hover:text-[var(--statusRed)] opacity-0 group-hover/item:opacity-100 transition-all px-2 font-black text-[14px]"
                title="Purge"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>

      {/* INPUT SECTOR */}
      <form onSubmit={addReminder} className="relative z-10 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New system alert..."
          className="w-full bg-[var(--base)]/50 border border-[var(--borderline)] rounded-xl px-4 py-3 text-[12px] text-[var(--textPri)] placeholder:text-[var(--textMuted)] focus:outline-none focus:border-[var(--accentIndigo)]/50 transition-all font-mono shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-black font-mono text-[var(--textSec)] hover:text-[var(--accentIndigo)] disabled:opacity-30 transition-all px-2 tracking-widest"
        >
          Inject
        </button>
      </form>
    </div>
  );
}