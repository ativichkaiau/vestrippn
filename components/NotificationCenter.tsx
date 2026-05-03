'use client';

import { useState, useEffect } from 'react';

const systemNotifications = [
  { id: 'sys-1', type: 'success', title: 'System Update', message: 'Dark mode automatic toggle successfully initialized.', time: 'System' }
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>(systemNotifications);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Load your "Do Not Disturb" memory
    const savedDismissed = localStorage.getItem('vestrippn-dismissed-alerts');
    if (savedDismissed) {
      setDismissedIds(JSON.parse(savedDismissed));
    }

    async function fetchDashboardData() {
      let liveData: any[] = [];

      try {
        const canvasRes = await fetch('/api/canvas');
        if (canvasRes.ok) liveData = [...liveData, ...await canvasRes.json()];
      } catch (error) {}

      try {
        const mailRes = await fetch('/api/mail');
        if (mailRes.ok) liveData = [...liveData, ...await mailRes.json()];
      } catch (error) {}

      setNotifications([...liveData, ...systemNotifications]);
      setIsLoading(false);
    }

    fetchDashboardData();
  }, []);

  const clearNotification = (id: string | number) => {
    const stringId = String(id);
    const newDismissed = [...dismissedIds, stringId];
    setDismissedIds(newDismissed);
    
    // Save the dismissed ID permanently
    localStorage.setItem('vestrippn-dismissed-alerts', JSON.stringify(newDismissed));
  };

  // HYDRATION SAFETY
  if (!isMounted) {
    return <div className="w-full h-[300px] bg-base border border-borderline rounded-lg animate-pulse"></div>;
  }

  // Filter out any alerts that are on your Do Not Disturb list
  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(String(n.id)));

  return (
    <div className="w-full bg-base border border-borderline rounded-lg p-4 flex flex-col gap-3 transition-colors duration-300">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-textPri font-semibold text-sm uppercase tracking-wider">Notification Center</h2>
          {isLoading && <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse"></span>}
        </div>
        <span className="text-xs text-textSec font-mono">{visibleNotifications.length} ACTIVE</span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
        {visibleNotifications.length === 0 ? (
          <p className="text-textSec text-sm italic py-2">No new notifications. You're all caught up.</p>
        ) : (
          visibleNotifications.map((note) => (
            <div key={note.id} className="group flex justify-between items-start p-3 rounded border border-borderline bg-base hover:border-accentCyan transition-colors">
              <div className="flex flex-col gap-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${note.type === 'alert' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : note.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-accentCyan shadow-[0_0_8px_rgba(6,182,212,0.6)]'}`}></span>
                  <span className="text-textPri text-sm font-medium">{note.title}</span>
                </div>
                <p className="text-textSec text-xs pl-4 truncate max-w-[250px]">{note.message}</p>
                <span className="text-textSec text-[10px] pl-4 opacity-70">{note.time}</span>
              </div>
              <button onClick={() => clearNotification(note.id)} className="text-textSec hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none" title="Dismiss">×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}