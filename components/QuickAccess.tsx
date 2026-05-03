'use client';

import { useState } from 'react';

const categories = ['Core', 'Research', 'AI', 'Fitness'];

const links = [
  // CORE - Daily essentials for a Med Student
  { name: 'Canvas', url: 'https://cmu.instructure.com', icon: '🎓', cat: 'Core' },
  { name: 'Notion', url: 'https://www.notion.so', icon: '📓', cat: 'Core' },
  { name: 'Calendar', url: 'https://calendar.google.com', icon: '📅', cat: 'Core' },
  { name: 'Mail', url: 'https://mail.google.com', icon: '✉️', cat: 'Core' },
  { name: 'Drive', url: 'https://drive.google.com', icon: '📁', cat: 'Core' },
  { name: 'Osmosis', url: 'https://www.osmosis.org', icon: '💧', cat: 'Core' },
  { name: 'PDF Tool', url: 'https://www.ilovepdf.com', icon: '📄', cat: 'Core' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺', cat: 'Core' },
  
  // RESEARCH - Deep work tools
  { name: 'Prospero', url: 'https://www.crd.york.ac.uk/prospero/', icon: '📜', cat: 'Research' },
  { name: 'Covidence', url: 'https://www.covidence.org', icon: '🔍', cat: 'Research' },
  { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', icon: '🔬', cat: 'Research' },
  { name: 'ClinicalKey', url: 'https://www.clinicalkey.com', icon: '🔑', cat: 'Research' },
  { name: 'Elsevier', url: 'https://www.elsevier.com', icon: '📑', cat: 'Research' },
  { name: 'UpToDate', url: 'https://www.uptodate.com', icon: '🩺', cat: 'Research' },
  { name: 'Scholar', url: 'https://scholar.google.com', icon: '🏛️', cat: 'Research' },
  { name: 'Cochrane', url: 'https://www.cochranelibrary.com', icon: '📚', cat: 'Research' },

  // AI - The Accelerator Suite
  { name: 'Gemini', url: 'https://gemini.google.com', icon: '✨', cat: 'AI' },
  { name: 'Claude', url: 'https://claude.ai', icon: '🌩️', cat: 'AI' },
  { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: '📔', cat: 'AI' },

  // FITNESS - Recovery & Training
  { name: 'Strava', url: 'https://www.strava.com', icon: '🏃', cat: 'Fitness' },
  { name: 'MyFitnessPal', url: 'https://www.myfitnesspal.com', icon: '⚖️', cat: 'Fitness' },
  { name: 'Hevy', url: 'https://www.hevyapp.com', icon: '🏋️', cat: 'Fitness' },
  { name: 'Strong', url: 'https://www.strong.app', icon: '💪', cat: 'Fitness' },
  { name: 'Examine', url: 'https://examine.com', icon: '🧪', cat: 'Fitness' },
];

export default function QuickAccess() {
  const [activeTab, setActiveTab] = useState('Core');

  const filteredLinks = links.filter(link => link.cat === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Sliding Tab Navigation (4 Categories) */}
      <div className="relative flex p-1 bg-base border border-borderline rounded-md">
        <div 
          className="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-borderline/40 rounded-sm"
          style={{
            left: `${(categories.indexOf(activeTab) * 25) + 0.5}%`,
            width: '24%',
          }}
        />
        
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`relative z-10 flex-1 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors duration-300 ${
              activeTab === cat ? 'text-textPri' : 'text-textSec hover:text-textPri'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-3 gap-2 min-h-[160px] content-start">
        {filteredLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center bg-base border border-borderline rounded p-2.5 transition-all duration-200 hover:border-accentCyan hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-in fade-in zoom-in-95 duration-300"
          >
            <span className="text-lg mb-1 group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <span className="text-[9px] font-mono text-textSec uppercase tracking-tighter group-hover:text-textPri text-center leading-tight">
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}