'use client';

import { useState, useEffect } from 'react';

interface Subject {
  id: string;
  name: string;
  progress: number;
}

const defaultSubjects: Subject[] = [
  { id: '1', name: 'Renal & KUB', progress: 80 },
  { id: '2', name: 'Microbiology', progress: 45 }
];

export default function AcademicsCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);

  // WAKE UP: Load saved academic data
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedSubjects = localStorage.getItem('vestrippn-acad-subjects');
      if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    } catch (e) {
      console.error("Failed to load academic data", e);
    }
  }, []);

  // AUTOMATED MEAN CALCULATION
  const overallProgress = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, sub) => sum + sub.progress, 0) / subjects.length)
    : 0;

  // SAVING LOGIC
  const updateSubjectName = (id: string, newName: string) => {
    const updated = subjects.map(sub => sub.id === id ? { ...sub, name: newName } : sub);
    setSubjects(updated);
    localStorage.setItem('vestrippn-acad-subjects', JSON.stringify(updated));
  };

  const updateSubjectProgress = (id: string, newProg: string) => {
    let num = parseInt(newProg) || 0;
    if (num > 100) num = 100;
    if (num < 0) num = 0;
    const updated = subjects.map(sub => sub.id === id ? { ...sub, progress: num } : sub);
    setSubjects(updated);
    localStorage.setItem('vestrippn-acad-subjects', JSON.stringify(updated));
  };

  const addSubject = () => {
    if (subjects.length >= 4) return; // Keep UI clean, max 4 subjects
    const updated = [...subjects, { id: Date.now().toString(), name: 'New Module', progress: 0 }];
    setSubjects(updated);
    localStorage.setItem('vestrippn-acad-subjects', JSON.stringify(updated));
  };

  const removeSubject = (id: string) => {
    const updated = subjects.filter(sub => sub.id !== id);
    setSubjects(updated);
    localStorage.setItem('vestrippn-acad-subjects', JSON.stringify(updated));
  };

  // HYDRATION SAFETY
  if (!isMounted) {
    return <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm flex-1 animate-pulse min-h-[200px]" />;
  }

  // MATH FOR SVG RING
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * overallProgress) / 100;

  return (
    <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors flex-1 flex flex-col">
      {/* HEADER */}
      <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex justify-between items-center mb-5">
        <span>Academics</span>
        <span className="text-statusGreen text-[11px] normal-case flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-statusGreen rounded-full animate-pulse"></span>
          Year 3 Active
        </span>
      </div>

      {/* VISUALIZATION: Circular + Linear */}
      <div className="flex gap-4 items-center mb-5">
        
        {/* AUTOMATED Circular Progress */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-borderline/50" />
            <circle
              cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-accentCyan transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <div className="flex items-center">
              {/* Changed from input to standard text since it is now a calculated mean */}
              <span className="text-[16px] font-barlow font-bold text-textPri leading-none">{overallProgress}</span>
              <span className="text-[12px] font-barlow font-bold text-textPri leading-none">%</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE Linear Bars */}
        <div className="flex-1 space-y-3">
          {subjects.map((sub) => (
            <div key={sub.id} className="group/item relative">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => updateSubjectName(sub.id, e.target.value)}
                  className="bg-transparent text-textPri outline-none hover:bg-borderline/30 focus:bg-base focus:ring-1 focus:ring-accentCyan/50 rounded px-1 -ml-1 transition-colors w-[100px] truncate"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={sub.progress || ''}
                    onChange={(e) => updateSubjectProgress(sub.id, e.target.value)}
                    className="w-6 bg-transparent text-right text-textSec font-mono outline-none hover:bg-borderline/30 focus:bg-base focus:ring-1 focus:ring-accentCyan/50 rounded no-spinners transition-colors"
                  />
                  <span className="text-textSec font-mono">%</span>
                </div>
              </div>
              <div className="h-[4px] w-full bg-borderline/30 rounded overflow-hidden">
                <div 
                  className="h-full bg-textSec group-first/item:bg-accentCyan rounded transition-all duration-500 ease-out"
                  style={{ width: `${sub.progress}%` }}
                ></div>
              </div>
              
              {/* Delete Button (Appears on Hover) */}
              <button 
                onClick={() => removeSubject(sub.id)}
                className="absolute -right-4 top-0 text-[10px] text-red-500/50 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                title="Remove Module"
              >×</button>
            </div>
          ))}
          
          {/* Add Module Button */}
          {subjects.length < 4 && (
            <button 
              onClick={addSubject}
              className="text-[10px] text-textMuted hover:text-accentCyan transition-colors flex items-center gap-1 mt-1"
            >
              + Add Subject
            </button>
          )}
        </div>
      </div>

      {/* FOOTER LINK */}
      <div className="mt-auto pt-3 border-t border-borderline/50">
        <a 
          href="https://mango-cmu.instructure.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 text-[11px] text-textSec hover:text-accentCyan transition-colors w-fit"
        >
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Mango Canvas
        </a>
      </div>
    </div>
  );
}