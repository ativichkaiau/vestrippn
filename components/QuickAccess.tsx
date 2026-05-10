'use client';

import { useState, useEffect } from 'react';

const categories = [
  { id: 'Core', color: 'var(--accentCyan)' },
  { id: 'Research', color: 'var(--accentAmber)' },
  { id: 'AI', color: 'var(--accentFuchsia)' },
  { id: 'Fitness', color: 'var(--accentEmerald)' }
];

const links = [
  { name: 'Canvas', url: 'https://mango-cmu.instructure.com', icon: '🎓', cat: 'Core' },
  { name: 'Notion', url: 'https://www.notion.so', icon: '📓', cat: 'Core' },
  { name: 'Calendar', url: 'https://calendar.google.com', icon: '📅', cat: 'Core' },
  { name: 'Mail', url: 'https://mail.google.com', icon: '✉️', cat: 'Core' },
  { name: 'OnePager', url: 'https://drive.google.com/drive/folders/1nobEj31AcMk0PhHu2YxNKaihVYsPJRCi', icon: '📁', cat: 'Core' },
  { name: 'Osmosis', url: 'https://www.osmosis.org', icon: '💧', cat: 'Core' },
  { name: 'IELTS', url: 'https://linktr.ee/ielts_package', icon: '🇬🇧', cat: 'Core' },
  { name: 'Prospero', url: 'https://www.crd.york.ac.uk/prospero/', icon: '📜', cat: 'Research' },
  { name: 'Covidence', url: 'https://www.covidence.org', icon: '🔍', cat: 'Research' },
  { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', icon: '🔬', cat: 'Research' },
  { name: 'ClinicalKey', url: 'https://www.clinicalkey.com', icon: '🔑', cat: 'Research' },
  { name: 'UpToDate', url: 'https://www.uptodate.com', icon: '🩺', cat: 'Research' },
  { name: 'Scholar', url: 'https://scholar.google.com', icon: '🏛️', cat: 'Research' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: '✨', cat: 'AI' },
  { name: 'Claude', url: 'https://claude.ai', icon: '🌩️', cat: 'AI' },
  { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: '📔', cat: 'AI' },
  { name: 'Strava', url: 'https://www.strava.com', icon: '🏃', cat: 'Fitness' },
  { name: 'Hevy', url: 'https://www.hevyapp.com', icon: '🏋️', cat: 'Fitness' },
  { name: 'Examine', url: 'https://examine.com', icon: '🧪', cat: 'Fitness' },
];

export default function QuickAccess() {
  const [activeTab, setActiveTab] = useState('Core');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const currentCat = categories.find(c => c.id === activeTab);
  const filteredLinks = links.filter(link => link.cat === activeTab);

  if (!isMounted) return <div className="h-[200px] animate-pulse bg-[var(--borderline)]/10 rounded-xl" />;

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* TACTICAL CATEGORY SELECTOR */}
      <div className="relative flex p-1 bg-[var(--base)]/50 border border-[var(--borderline)] rounded-xl backdrop-blur-sm shadow-inner">
        {/* Animated Background Slide */}
        <div 
          className="absolute top-1 bottom-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-lg shadow-lg"
          style={{
            left: `${(categories.findIndex(c => c.id === activeTab) * 25) + 0.5}%`,
            width: '24%',
            backgroundColor: currentCat?.color,
            opacity: 0.15,
            border: `1px solid ${currentCat?.color}`
          }}
        />
        
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`relative z-10 flex-1 py-2 text-[9px] font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === cat.id ? 'text-[var(--textPri)]' : 'text-[var(--textMuted)] hover:text-[var(--textSec)]'
            }`}
          >
            {cat.id}
            {activeTab === cat.id && (
              <span 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: cat.color, color: cat.color }}
              ></span>
            )}
          </button>
        ))}
      </div>

      {/* MODULE GRID */}
      <div className="grid grid-cols-3 gap-3 min-h-[180px] content-start">
        {filteredLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center bg-[var(--base)]/30 border border-[var(--borderline)] rounded-xl p-4 transition-all duration-300 hover:scale-[1.03] animate-in fade-in zoom-in-95"
            style={{ 
              borderColor: activeTab === 'Core' ? 'transparent' : '' // Subtle logic for hover
            }}
          >
            {/* Dynamic Hover Border */}
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border"
              style={{ borderColor: currentCat?.color }}
            ></div>

            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 relative z-10">
              {link.icon}
            </span>
            <span className="text-[9px] font-mono text-[var(--textSec)] font-black uppercase tracking-tighter group-hover:text-[var(--textPri)] text-center leading-tight relative z-10">
              {link.name}
            </span>
            
            {/* Technical Detail */}
            <div 
              className="mt-2 w-4 h-[1px] opacity-20"
              style={{ backgroundColor: currentCat?.color }}
            ></div>
          </a>
        ))}
      </div>

      {/* SYSTEM STATUS OVERLAY (Decorative) */}
      <div className="absolute -bottom-2 -right-2 font-mono text-[7px] text-[var(--textMuted)] opacity-20 uppercase tracking-[0.4em] rotate-90 origin-bottom-right">
        Quick_Access_Protocol_v3.0
      </div>
    </div>
  );
}