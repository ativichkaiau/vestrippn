'use client';
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

  // Sleek Glassmorphic Skeleton
  if (!isMounted) return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[350px] animate-pulse flex flex-col gap-4">
      <div className="h-6 w-48 bg-black/5 dark:bg-white/5 rounded-full mb-4"></div>
      <div className="h-12 w-full bg-black/5 dark:bg-white/5 rounded-2xl"></div>
      <div className="h-12 w-full bg-black/5 dark:bg-white/5 rounded-2xl"></div>
    </div>
  );

  const displayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full min-h-[350px] transition-colors duration-700 group text-left">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm transition-colors duration-700">
            🎯
          </div>
          <h2 className="font-bold text-[18px] lg:text-[20px] tracking-tight text-neutral-900 dark:text-white transition-colors duration-700">
            Tactical Objectives
          </h2>
        </div>
        <span className="text-[12px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">
          {displayDate}
        </span>
      </div>
      
      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 min-h-[150px]">
        {isLoading ? (
          <div className="flex flex-col gap-3 mt-2">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse transition-colors duration-700" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[13px] font-medium text-neutral-400 dark:text-neutral-500 italic transition-colors duration-700">
            Sector Clear. All objectives complete.
          </div>
        ) : (
          tasks.map(task => (
            <label key={task.id} className="flex items-start gap-4 cursor-pointer group/task p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 active:scale-[0.99] select-none">
              
              {/* Custom Animated Checkbox */}
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={task.done}
                  onChange={() => toggleTask(task.id, task.done)}
                  className="peer appearance-none w-5 h-5 border-[1.5px] border-neutral-300 dark:border-neutral-600 rounded-md bg-transparent checked:bg-blue-500 checked:border-blue-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 transition-all duration-300 cursor-pointer" 
                />
                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300 drop-shadow-sm scale-50 peer-checked:scale-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Task Text */}
              <span className={`text-[15px] leading-snug transition-all duration-300 tracking-tight ${
                task.done 
                  ? 'text-neutral-400 dark:text-neutral-600 line-through' 
                  : 'text-neutral-700 dark:text-neutral-200 font-medium group-hover/task:text-neutral-900 dark:group-hover/task:text-white'
              }`}>
                {task.text}
              </span>
            </label>
          ))
        )}
      </div>

      {/* INPUT FIELD */}
      <form onSubmit={addTask} className="mt-6 flex bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 border border-transparent dark:border-white/5 transition-all duration-300">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Deploy new command..." 
          className="bg-transparent w-full px-5 py-3.5 text-[14px] text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium transition-colors duration-700"
        />
        <button 
          type="submit" 
          disabled={!newTask.trim()}
          className="px-6 text-blue-600 dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-black text-[20px]"
        >
          +
        </button>
      </form>
    </div>
  );
}