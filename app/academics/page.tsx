'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile'; // <-- Imported Auth Status

export default function Academics() {
  // Deep Focus State Machine: 'idle' | 'countdown' | 'focused'
  const [focus, setFocus] = useState<{ mode: 'idle' | 'countdown' | 'focused', targetTime: number }>({ mode: 'idle', targetTime: 0 });
  const [displayTime, setDisplayTime] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Hydration & Persistence
  useEffect(() => {
    const saved = localStorage.getItem('vestrippn_focus');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.targetTime > Date.now()) {
        setFocus(parsed);
      } else {
        localStorage.removeItem('vestrippn_focus');
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. The Tick Engine
  useEffect(() => {
    if (focus.mode === 'idle') return;

    const interval = setInterval(() => {
      const remaining = focus.targetTime - Date.now();
      
      if (remaining <= 0) {
        if (focus.mode === 'countdown') {
          const newTarget = Date.now() + 25 * 60 * 1000;
          const newState = { mode: 'focused' as const, targetTime: newTarget };
          setFocus(newState);
          localStorage.setItem('vestrippn_focus', JSON.stringify(newState));
        } else {
          setFocus({ mode: 'idle', targetTime: 0 });
          localStorage.removeItem('vestrippn_focus');
        }
      } else {
        if (focus.mode === 'countdown') {
          setDisplayTime(Math.ceil(remaining / 1000).toString());
        } else {
          const m = Math.floor(remaining / 1000 / 60);
          const s = Math.floor((remaining / 1000) % 60);
          setDisplayTime(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }
      }
    }, 100); 

    return () => clearInterval(interval);
  }, [focus]);

  const toggleFocusProtocol = () => {
    if (focus.mode !== 'idle') {
      if (confirm("Abort Deep Work session?")) {
        setFocus({ mode: 'idle', targetTime: 0 });
        localStorage.removeItem('vestrippn_focus');
      }
    } else {
      const target = Date.now() + 10 * 1000;
      const newState = { mode: 'countdown' as const, targetTime: target };
      setFocus(newState);
      localStorage.setItem('vestrippn_focus', JSON.stringify(newState));
    }
  };

  const isLocked = focus.mode !== 'idle';
  if (!isLoaded) return null; 

  return (
    <>
      {/* TOP BAR */}
      <header className={`h-[56px] border-b border-borderline flex items-center justify-between px-4 md:px-6 shrink-0 bg-base transition-all duration-500 ${isLocked ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="font-orbitron font-bold text-[15px] md:text-[18px] text-textPri uppercase tracking-wider truncate">vestrippn3point0</div>
        <div className="hidden sm:block text-[13px] text-textSec font-medium">
          <ArcDate />
        </div>
        <div className="flex gap-4 items-center text-textSec text-[14px]">
          
          {/* F1 TELEMETRY GIMMICK */}
          <div className="hidden sm:flex items-center gap-1 bg-surface border border-borderline px-3 py-1 rounded">
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#06b6d4] transition-colors duration-300">SYS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#06b6d4] group-hover:border-[#06b6d4] group-hover:shadow-[0_0_12px_#06b6d4] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#22c55e] transition-colors duration-300">AERO</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#22c55e] group-hover:border-[#22c55e] group-hover:shadow-[0_0_12px_#22c55e] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#f59e0b] transition-colors duration-300">ERS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#f59e0b] group-hover:border-[#f59e0b] group-hover:shadow-[0_0_12px_#f59e0b] transition-all duration-300"></div>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 cursor-crosshair group">
              <span className="text-[8px] font-mono font-bold text-textMuted group-hover:text-[#ef4444] transition-colors duration-300">DRS</span>
              <div className="w-4 h-1.5 rounded-full bg-textMuted/20 border border-borderline group-hover:bg-[#ef4444] group-hover:border-[#ef4444] group-hover:shadow-[0_0_12px_#ef4444] transition-all duration-300"></div>
            </div>
          </div>

          {/* DYNAMIC AUTHENTICATION STATUS */}
          <TopNavProfile />

          <ThemeToggle />
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-base">
        
        {/* SIDEBAR (Mobile optimized scrolling & touch targets) */}
        <aside className={`w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between px-4 py-3 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10 transition-all duration-500 ${isLocked ? 'opacity-30' : 'opacity-100'} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            
            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 block">Dashboard</span>
            ) : (
              <Link href="/" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Dashboard</Link>
            )}
            
            <div className="text-accentCyan cursor-default transition-all flex items-center gap-1.5 font-medium px-3 py-1.5 md:px-0 md:py-0 md:pl-4 bg-accentCyan/5 md:bg-transparent rounded md:rounded-none">
              <span className="text-[10px]">◉</span> Academics
            </div>

            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 block">Research</span>
            ) : (
              <Link href="/research" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Research</Link>
            )}

            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 block">Fitness & Diet</span>
            ) : (
              <Link href="/fitness" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Fitness & Diet</Link>
            )}

            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 block">Archive</span>
            ) : (
              <Link href="/archive" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Archive</Link>
            )}

            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 block">IELTS</span>
            ) : (
              <Link href="/ielts" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>
            )}

            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 hidden md:block">Tools & Links</span>
            ) : (
              <Link href="/tools" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Tools & Links</Link>
            )}

            {isLocked ? (
              <span className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 text-textMuted cursor-not-allowed opacity-50 block">Identity</span>
            ) : (
              <Link href="/identity" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Identity</Link>
            )}
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* ACADEMICS CONTENT */}
        <main className={`flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto overflow-x-hidden transition-all duration-700 ${focus.mode === 'focused' ? 'bg-surface shadow-[inset_0_0_100px_rgba(6,182,212,0.03)]' : 'bg-base'}`}>
          
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 gap-3">
            <div>
              <h1 className="font-barlow text-[24px] sm:text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Preclinical Hub</h1>
              <p className="text-[12px] sm:text-[13px] text-textSec mt-1">Year 3 CMU Medical Curriculum & Intelligence Vault</p>
            </div>
            
            <button 
              onClick={toggleFocusProtocol}
              className={`text-[10px] sm:text-[11px] font-mono px-4 py-2 sm:py-1.5 rounded transition-all duration-300 flex items-center justify-center gap-2 font-bold tracking-widest w-full sm:w-auto
                ${focus.mode === 'countdown' ? 'bg-accentAmber text-base shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse' : 
                  focus.mode === 'focused' ? 'bg-accentCyan text-base shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 
                  'text-accentCyan border border-accentCyan/30 bg-accentCyan/10 hover:bg-accentCyan/20'}`}
            >
              {focus.mode === 'countdown' ? `[ LOCKDOWN IN: ${displayTime} ]` : 
               focus.mode === 'focused' ? `[ DEEP WORK: ${displayTime} ]` : 
               'INITIATE FOCUS PROTOCOL'}
            </button>
          </div>

          {/* NOTEBOOK LM PORTAL */}
          <div className={`relative border rounded-xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 shrink-0 transition-all duration-500 ${focus.mode === 'focused' ? 'bg-base border-accentCyan shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-[1.01]' : 'bg-surface border-accentCyan/40 shadow-[0_0_20px_rgba(6,182,212,0.05)]'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3 transition-all duration-1000 ${focus.mode === 'focused' ? 'bg-accentCyan/20' : 'bg-accentCyan/10'}`}></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-10 sm:h-10 rounded bg-base border border-borderline flex items-center justify-center text-2xl sm:text-xl shrink-0">📔</div>
                <div>
                  <h2 className="font-barlow font-bold text-[15px] sm:text-[16px] text-textPri uppercase tracking-wide leading-tight">NotebookLM Intelligence Vault</h2>
                  <p className="text-[11px] text-textSec mt-0.5">AI-Powered Synthesis & Source Grounding</p>
                </div>
              </div>
              <a 
                href="https://notebooklm.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accentCyan text-base font-bold text-[12px] px-6 py-3 sm:py-2.5 rounded hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Launch Main Engine ↗
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-2 relative z-10">
              <a 
                href="https://notebooklm.google.com/notebook/db9fd595-41ad-4c0d-848c-783a972904b1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`group bg-base border rounded p-3.5 transition-all flex flex-col gap-1 relative overflow-hidden ${focus.mode === 'focused' ? 'border-accentCyan shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-accentCyan/50 hover:border-accentCyan'}`}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accentCyan"></div>
                <span className="text-[10px] text-accentCyan font-mono pl-2 tracking-widest">ACTIVE</span>
                <span className="text-[13px] text-textPri font-medium group-hover:text-accentCyan transition-colors leading-tight pl-2 mt-1">Human Endocrine System-2</span>
              </a>
              
              <a 
                href="https://notebooklm.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group bg-base border border-borderline border-dashed rounded p-3.5 hover:border-accentCyan/50 transition-all flex flex-col gap-1 items-center justify-center opacity-60 hover:opacity-100 hidden sm:flex"
              >
                <span className="text-[20px] text-textMuted group-hover:text-accentCyan transition-colors">+</span>
                <span className="text-[9px] text-textMuted font-mono uppercase tracking-wider">New Vault</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 shrink-0 mb-6">
            <div className={`flex-[0.6] flex flex-col gap-4 transition-opacity duration-500 ${isLocked ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec border-b border-borderline pb-2">
                Current Block Materials
              </div>
              
              <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[14px] font-bold text-textPri">Human Endocrine System</h3>
                  <span className="text-[10px] text-statusGreen border border-statusGreen/30 bg-statusGreen/10 px-2 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="space-y-2">
                  <a href="#" className="block text-[12px] text-textSec hover:text-accentCyan transition-colors bg-base p-2 rounded border border-borderline">📄 Endocrine OnePager Summary.pdf</a>
                  <a href="#" className="block text-[12px] text-textSec hover:text-accentCyan transition-colors bg-base p-2 rounded border border-borderline">📝 Hormone Cascades Mock Exam</a>
                </div>
              </div>

              <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors opacity-70 hover:opacity-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[14px] font-bold text-textPri">Next Module (TBD)</h3>
                  <span className="text-[10px] text-accentAmber border border-accentAmber/30 bg-accentAmber/10 px-2 py-0.5 rounded">UPCOMING</span>
                </div>
                <div className="text-[11px] text-textMuted italic">Awaiting syllabus drop from Mango Canvas...</div>
              </div>
            </div>

            <div className={`flex-[0.4] flex flex-col gap-4 transition-opacity duration-500 ${isLocked ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec border-b border-borderline pb-2">
                External Databases
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <a href="https://mango-cmu.instructure.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🎓</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Mango Canvas</div>
                </a>
                <a href="https://www.uptodate.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🩺</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">UpToDate</div>
                </a>
                
                <a href="https://www.amboss.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">⚕️</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">AMBOSS</div>
                </a>
                <a href="https://www.clinicalkey.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🔑</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">ClinicalKey</div>
                </a>

                <a href="https://www.osmosis.org" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">💧</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Osmosis</div>
                </a>
                <a href="https://www.sketchy.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🎨</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Sketchy</div>
                </a>

                <a href="https://www.pathoma.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🔬</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Pathoma</div>
                </a>
                <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">📚</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">PubMed</div>
                </a>

                <a href="https://ankiweb.net" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🧠</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">AnkiWeb</div>
                </a>
                <a href="https://www.uworld.com" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🌍</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">UWorld</div>
                </a>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}