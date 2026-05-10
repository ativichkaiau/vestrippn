"use client";
import { useState, useEffect } from "react";

type Task = { id: string; text: string; done: boolean };

export default function TodaysCommand() {
  const [isMounted, setIsMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !currentStatus } : t));
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, done: !currentStatus }),
      });
    } catch (e) {
      fetchTasks();
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const tempText = newTask;
    const tempId = Date.now().toString();
    setNewTask("");
    setTasks(prev => [{ id: tempId, text: tempText, done: false }, ...prev]);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tempText }),
      });
      const savedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: savedTask.id } : t));
    } catch (e) {
      fetchTasks();
    }
  };

  if (!isMounted) return <div className="bg-[var(--surface)]/20 border border-[var(--borderline)] rounded-[22px] p-6 h-[350px] animate-pulse" />;

  const displayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="bg-[var(--surface)]/40 border border-[var(--borderline)] rounded-[22px] p-6 shadow-2xl flex flex-col h-full min-h-[350px] relative overflow-hidden group transition-all hover:border-[var(--accentCyan)]/30">
      
      {/* TACTICAL OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {/* HEADER */}
      <div className="relative z-10 font-mono font-bold text-[11px] uppercase tracking-[0.3em] text-[var(--accentCyan)] flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accentCyan)] shadow-[0_0_10px_var(--accentCyan)]"></div>
          <span className="text-[var(--textPri)]">Tactical Objectives</span>
        </div>
        <span className="text-[var(--textMuted)] tracking-widest">{displayDate}</span>
      </div>
      
      {/* TASK LIST */}
      <div className="relative z-10 flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-[var(--borderline)]/10 rounded-lg animate-pulse" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-mono text-[var(--textMuted)] uppercase tracking-[0.3em] opacity-40">
            Sector Clear // All Objectives Complete
          </div>
        ) : (
          tasks.map(task => (
            <label key={task.id} className="flex items-start gap-4 cursor-pointer group/task py-1 transition-all">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                  className="peer appearance-none w-[18px] h-[18px] border border-[var(--borderline)] rounded bg-[var(--base)] checked:bg-[var(--accentCyan)] checked:border-[var(--accentCyan)] transition-all cursor-pointer shadow-inner" 
                />
                <svg className="absolute w-3.5 h-3.5 text-[var(--base)] pointer-events-none hidden peer-checked:block left-[2px] top-[2px] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-[13px] leading-snug transition-all duration-300 font-medium ${
                task.done ? 'text-[var(--textMuted)] line-through opacity-40' : 'text-[var(--textPri)] group-hover/task:text-[var(--accentCyan)]'
              }`}>
                {task.text}
              </span>
            </label>
          ))
        )}
      </div>

      {/* INPUT FIELD */}
      <form onSubmit={addTask} className="relative z-10 mt-6 flex bg-[var(--base)]/50 border border-[var(--borderline)] rounded-xl overflow-hidden focus-within:border-[var(--accentCyan)]/50 transition-all shadow-inner">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Deploy new command..." 
          className="bg-transparent w-full px-4 py-3 text-[12px] text-[var(--textPri)] outline-none placeholder:text-[var(--textMuted)] font-mono tracking-tight"
        />
        <button type="submit" className="bg-[var(--borderline)]/20 hover:bg-[var(--accentCyan)] hover:text-[var(--base)] text-[var(--accentCyan)] px-5 text-[16px] font-bold transition-all border-l border-[var(--borderline)]">
          +
        </button>
      </form>
    </div>
  );
}