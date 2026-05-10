'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  source: 'CANVAS' | 'GMAIL';
  title: string;
  message: string;
  time: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error(`${response.status}`);
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("Hub Sync Error:", e);
        setError(e.message || 'OFFLINE'); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="bg-[var(--surface)]/40 border border-[var(--borderline)] rounded-[22px] p-6 shadow-2xl flex-1 flex flex-col min-h-[320px] relative overflow-hidden group transition-all hover:border-[var(--accentCyan)]/30">
      
      {/* TACTICAL OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {/* HEADER (Screenshot Matched) */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accentCyan)] shadow-[0_0_10px_var(--accentCyan)]"></div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--textPri)]">
            Comms Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-[var(--statusRed)] text-[9px] font-mono animate-pulse uppercase">Link_Err: {error}</span>}
          <span className="text-[var(--statusGreen)] text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[var(--statusGreen)] rounded-full animate-pulse shadow-[0_0_5px_var(--statusGreen)]"></span>
            Live_Feed
          </span>
        </div>
      </div>

      {/* FEED */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative z-10">
        {isLoading ? (
          <div className="h-full flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full bg-[var(--borderline)]/10 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--textMuted)] text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
            No active alerts in sector.
          </div>
        ) : (
          notifications.map((note) => (
            <div 
              key={note.id} 
              className="relative pl-4 border-l-[3px] py-3 px-4 bg-white/[0.01] hover:bg-white/[0.03] border-white/5 rounded-r-lg transition-all group/note cursor-default overflow-hidden"
              style={{ borderLeftColor: note.source === 'CANVAS' ? 'var(--statusRed)' : 'var(--accentCyan)' }}
            >
              {/* Source-specific Glow */}
              <div className={`absolute top-0 left-0 w-16 h-full blur-2xl opacity-0 group-hover/note:opacity-10 transition-opacity pointer-events-none ${
                note.source === 'CANVAS' ? 'bg-[var(--statusRed)]' : 'bg-[var(--accentCyan)]'
              }`}></div>

              <div className="flex justify-between items-center mb-2">
                <span className={`text-[8px] font-black font-mono uppercase px-2 py-0.5 rounded border ${
                  note.source === 'CANVAS' 
                    ? 'border-[var(--statusRed)]/30 bg-[var(--statusRed)]/10 text-[var(--statusRed)]' 
                    : 'border-[var(--accentCyan)]/30 bg-[var(--accentCyan)]/10 text-[var(--accentCyan)]'
                }`}>
                  {note.source}
                </span>
                <span className="text-[9px] text-[var(--textMuted)] font-mono tracking-tighter uppercase">{note.time}</span>
              </div>

              <div className="text-[10px] text-[var(--textSec)] font-bold truncate mb-1 uppercase tracking-tight group-hover/note:text-[var(--textPri)] transition-colors">
                {note.title}
              </div>
              
              <div className="text-[13px] text-[var(--textPri)] font-medium leading-relaxed line-clamp-2">
                {note.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER SCAN STATUS */}
      {!isLoading && (
        <div className="mt-4 pt-3 border-t border-[var(--borderline)]/30 flex justify-end relative z-10">
          <div className="text-[8px] font-mono text-[var(--textMuted)] uppercase tracking-[0.3em]">
            Frequency: <span className="text-[var(--textPri)]">Secure_SSL</span>
          </div>
        </div>
      )}
    </div>
  );
}