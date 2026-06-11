'use client';

import { useState, useEffect } from 'react';

const initialDomains = [
  { name: 'Academics', status: 'good' },
  { name: 'Research', status: 'warning' },
  { name: 'Fitness', status: 'good' },
  { name: 'Diet', status: 'good' },
  { name: 'Chores', status: 'warning' },
  { name: 'IELTS', status: 'inactive' },
  { name: 'Gaming', status: 'good' },
];

export default function DomainHealth() {
  const [domains, setDomains] = useState(initialDomains);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      // Bumped to v3 to ensure a clean state with the new aesthetic
      const savedData = localStorage.getItem('vestrippn-domain-health-v3');
      if (savedData) {
        setDomains(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("Failed to load domain health", e);
    }
  }, []);

  const toggleStatus = (index: number) => {
    const newDomains = [...domains];
    const currentStatus = newDomains[index].status;
    
    if (currentStatus === 'good') newDomains[index].status = 'warning';
    else if (currentStatus === 'warning') newDomains[index].status = 'inactive';
    else newDomains[index].status = 'good';
    
    setDomains(newDomains);
    localStorage.setItem('vestrippn-domain-health-v3', JSON.stringify(newDomains));
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'good': 
        return 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] border-transparent';
      case 'warning': 
        return 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] border-transparent';
      case 'inactive': 
        return 'bg-transparent border-[1.5px] border-neutral-300 dark:border-neutral-600 opacity-60';
      default: 
        return 'bg-neutral-400 border-transparent';
    }
  };

  // Sleek loading skeleton seamlessly matching the Day/Night surface colors
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center mb-1 pb-2 border-b border-black/5 dark:border-white/5">
          <div className="h-3 w-16 bg-black/5 dark:bg-white/5 rounded animate-pulse"></div>
          <div className="h-3 w-12 bg-black/5 dark:bg-white/5 rounded animate-pulse"></div>
        </div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-8 w-full bg-black/5 dark:bg-white/5 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 -mt-2 w-full transition-colors duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">System</span>
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest transition-colors duration-700">Status</span>
      </div>

      {/* INTERACTIVE DOMAIN LIST */}
      <div className="flex flex-col gap-0.5">
        {domains.map((domain, index) => (
          <div 
            key={domain.name} 
            onClick={() => toggleStatus(index)}
            data-motion-card
            data-state={domain.status === 'good' ? 'online' : domain.status === 'warning' ? 'critical' : 'locked'}
            className="flex justify-between items-center group cursor-pointer p-2.5 -mx-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 active:scale-[0.98] select-none"
          >
            <span className="text-[13px] font-semibold tracking-tight text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-300">
              {domain.name}
            </span>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full border ${getStatusDot(domain.status)} transition-all duration-300 group-hover:scale-125`}></div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
