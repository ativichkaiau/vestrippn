"use client";
import { useState, useEffect } from "react";

type Task = { id: string; text: string; done: boolean };

export default function TodaysCommand() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from Notion API on mount with safety checks
  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        // SHIELD: Check if the data is actually a list (array)
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.log("Notion API Error:", data);
          setTasks([]); // Default to empty list so it doesn't crash
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Network Error:", error);
        setTasks([]);
        setIsLoading(false);
      });
  }, []);

  // Update checkbox status in Notion
  const toggleTask = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update (feels instant to you)
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !currentStatus } : t));
    
    // Background API call to Notion
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, done: !currentStatus }),
    });
  };

  // Add a new task to Notion
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const tempId = Date.now().toString();
    setTasks([{ id: tempId, text: newTask, done: false }, ...tasks]); // Optimistic load
    setNewTask("");

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTask }),
    });
    
    // Refresh to get real Notion ID
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  return (
    <div className="bg-surface border border-accentCyan/50 border-t-4 border-t-accentCyan rounded-lg p-[18px] shadow-sm transition-colors">
      
      <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-accentCyan flex justify-between items-center mb-4">
        <span>Today's Command</span>
        <span>{today}</span>
      </div>
      
      <div className="flex flex-col gap-3 text-[14px] mt-4">
        {isLoading ? (
          <span className="text-textMuted text-[12px]">Syncing with Notion...</span>
        ) : (
          tasks.map(task => (
            <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={task.done}
                onChange={() => toggleTask(task.id, task.done)}
                className="mt-[2px] appearance-none w-[14px] h-[14px] border border-borderline bg-base checked:bg-accentCyan checked:border-accentCyan rounded-sm cursor-pointer transition-colors" 
              />
              <span className={`transition-colors ${task.done ? 'text-textSec line-through' : 'text-textPri group-hover:text-accentCyan'}`}>
                {task.text}
              </span>
            </label>
          ))
        )}
      </div>

      {/* Quick Add Task Input */}
      <form onSubmit={addTask} className="mt-4 flex border border-borderline rounded overflow-hidden focus-within:border-accentCyan transition-colors">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Deploy new task..." 
          className="bg-base w-full px-3 py-1.5 text-[12px] text-textPri outline-none placeholder:text-textMuted"
        />
        <button type="submit" className="bg-borderline hover:bg-accentCyan hover:text-base text-textSec px-3 text-[12px] font-bold transition-colors">
          +
        </button>
      </form>

      
    </div>
  );
}