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
      // Changed the memory key to 'v2' to force it to bypass any corrupted old data
      const savedData = localStorage.getItem('vestrippn-domain-health-v2');
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
    localStorage.setItem('vestrippn-domain-health-v2', JSON.stringify(newDomains));
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'good': 
        // Using standard green-500 instead of statusGreen
        return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'warning': 
        // Using standard amber-500 instead of accentAmber
        return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
      case 'inactive': 
        // Using standard neutral-500 for the hollow circle
        return 'bg-transparent border border-neutral-500 opacity-50';
      default: 
        return 'bg-neutral-400';
    }
  };

  // Sleek loading skeleton that perfectly matches your surface color
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-6 w-full bg-borderline/20 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 -mt-2">
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-borderline">
        <span className="text-[10px] font-mono text-textSec uppercase tracking-widest">System</span>
        <span className="text-[10px] font-mono text-textSec uppercase tracking-widest">Status</span>
      </div>

      {domains.map((domain, index) => (
        <div 
          key={domain.name} 
          onClick={() => toggleStatus(index)}
          // Uses your custom variables so hover works in both Dark and Light mode
          className="flex justify-between items-center group cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-borderline/30 transition-colors"
        >
          <span className="text-[13px] font-medium text-textSec group-hover:text-textPri transition-colors duration-200">
            {domain.name}
          </span>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${getStatusDot(domain.status)} transition-all duration-300 group-hover:scale-125`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}