'use client';

import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  text: string;
}

const defaultReminders: Reminder[] = [
  { id: '1', text: 'Laundry — Today' },
  { id: '2', text: 'Research call — 3:00 PM' },
  { id: '3', text: 'IELTS prep — Sun 10:00 AM' }
];

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
  const [inputValue, setInputValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('vestrippn-reminders-v2');
      if (saved) {
        setReminders(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse reminders", e);
    }
  }, []);

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newReminder = {
      id: Date.now().toString(),
      text: inputValue.trim()
    };

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

  // Safe hydration skeleton
  if (!isMounted) {
    return (
      <div className="flex flex-col h-full animate-pulse">
        <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4">Reminders</div>
        <div className="h-4 w-full bg-borderline/20 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-borderline/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4">
        Reminders
      </div>

      <ul className="text-[13px] text-textPri space-y-1 mb-4 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[150px]">
        {reminders.length === 0 ? (
          <li className="text-textSec italic text-[11px] py-2">No active reminders.</li>
        ) : (
          reminders.map((reminder) => (
            <li 
              key={reminder.id} 
              className="group flex items-start justify-between gap-2 p-1.5 -mx-1.5 rounded hover:bg-borderline/30 transition-colors"
            >
              <div className="flex items-start gap-2 pt-0.5">
                <span className="text-accentCyan leading-none">·</span>
                <span className="leading-tight break-words pr-2">{reminder.text}</span>
              </div>
              <button
                type="button"
                onClick={() => removeReminder(reminder.id)}
                className="text-textSec hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-1 cursor-pointer shrink-0"
                title="Dismiss"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={addReminder} className="relative mt-auto shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New reminder..."
          className="w-full bg-base border border-borderline rounded px-3 py-2 text-[12px] text-textPri placeholder:text-textMuted focus:outline-none focus:border-accentCyan transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono text-textSec hover:text-accentCyan disabled:opacity-50 disabled:hover:text-textMuted transition-colors px-2 py-1 cursor-pointer bg-base"
        >
          Add
        </button>
      </form>
    </div>
  );
}