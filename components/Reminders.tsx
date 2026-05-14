'use client';

import { useState, useEffect } from 'react';
import { addTask, deleteTask } from '@/app/actions'; // <-- Cloud Uplinks

// Aligning with your Prisma Database Schema
interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

interface RemindersProps {
  initialTasks?: Task[];
}

export default function Reminders({ initialTasks = [] }: RemindersProps) {
  const [reminders, setReminders] = useState<Task[]>(initialTasks);
  const [inputValue, setInputValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // FIX: Inject the mount signal to remove the skeleton
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Smart Sync: Only update if the actual data changed from the cloud
  useEffect(() => {
    setReminders(prevReminders => {
      if (JSON.stringify(prevReminders) === JSON.stringify(initialTasks)) {
        return prevReminders;
      }
      return initialTasks;
    });
  }, [initialTasks]);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const tempText = inputValue.trim();
    const tempId = `temp-${Date.now()}`;
    setInputValue('');

    // 1. Instant Optimistic UI Update
    const newReminder: Task = { 
      id: tempId, 
      title: tempText, 
      completed: false, 
      category: "ALERT" 
    };
    setReminders(prev => [...prev, newReminder]);

    // 2. Silent Cloud Sync
    try {
      await addTask(tempText, "ALERT");
    } catch (error) {
      console.error("Failed to inject alert to cloud", error);
    }
  };

  const handleRemoveReminder = async (id: string) => {
    // 1. Instant Optimistic UI Update
    setReminders(prev => prev.filter(r => r.id !== id));

    // 2. Silent Cloud Sync
    try {
      await deleteTask(id);
    } catch (error) {
      console.error("Failed to purge alert from cloud", error);
    }
  };

  // Minimal skeleton matching Day/Night surface
  if (!isMounted) return (
    <div className="flex flex-col gap-4 animate-pulse transition-colors duration-700 h-full min-h-[250px]">
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
                  {reminder.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveReminder(reminder.id)}
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
      <form onSubmit={handleAddReminder} className="relative shrink-0 flex items-center">
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