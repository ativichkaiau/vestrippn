'use client';

import { useState, useEffect } from 'react';

const categories = [
  { id: 'Core', colorClass: 'bg-blue-500', textClass: 'text-blue-500' },
  { id: 'Research', colorClass: 'bg-amber-500', textClass: 'text-amber-500' },
  { id: 'AI', colorClass: 'bg-pink-500', textClass: 'text-pink-500' },
  { id: 'Fitness', colorClass: 'bg-emerald-500', textClass: 'text-emerald-500' }
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

  if (!isMounted) return (
    <div className="flex flex-col gap-6 animate-pulse transition-colors duration-700">
      <div className="h-10 w-full bg-black/5 dark:bg-white/5 rounded-xl"></div>
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-black/5 dark:bg-white/5 rounded-2xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full transition-colors duration-700">
      
      {/* TACTICAL CATEGORY SELECTOR */}
      <div className="relative flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent dark:border-white/5 transition-colors duration-700">
        
        {/* Animated Background Slide (Tailwind Logic) */}
        <div 
          className={`absolute top-1 bottom-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-lg shadow-sm ${currentCat?.colorClass} opacity-10 dark:opacity-20`}
          style={{
            left: `calc(${(categories.findIndex(c => c.id === activeTab) * 25)}% + 4px)`,
            width: 'calc(25% - 8px)',
          }}
        />
        
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`relative z-10 flex-1 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
              activeTab === cat.id 
                ? `text-neutral-900 dark:text-white` 
                : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
            }`}
          >
            {cat.id}
            {activeTab === cat.id && (
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${cat.colorClass} shadow-sm animate-pulse`}></span>
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
            data-motion-card
            className="w09-launch-button group flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10 rounded-2xl p-4 transition-all duration-300 active:scale-95 animate-in fade-in zoom-in-95"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {link.icon}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-tight text-neutral-500 dark:text-neutral-400 group-hover:${currentCat?.textClass} text-center leading-tight transition-colors duration-300`}>
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
