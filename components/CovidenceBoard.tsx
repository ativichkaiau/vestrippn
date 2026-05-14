'use client';

import { useState, useEffect } from 'react';

interface CovidenceStats {
  screening: number;
  fullText: number;
  extraction: number;
}

interface CovidenceBoardProps {
  initialTitle?: string;
  initialStats?: CovidenceStats;
}

const DEFAULT_STATS = { screening: 0, fullText: 0, extraction: 0 };

export default function CovidenceBoard({ 
  initialTitle = "Systematic Review Database", 
  initialStats = DEFAULT_STATS 
}: CovidenceBoardProps) {
  
  const [stats, setStats] = useState<CovidenceStats>(initialStats);
  const [title, setTitle] = useState(initialTitle);
  const [activeTab, setActiveTab] = useState<'PICO' | 'PROGRESS'>('PROGRESS'); 

  useEffect(() => {
    setStats(prev => {
      if (JSON.stringify(prev) === JSON.stringify(initialStats)) {
        return prev; 
      }
      return initialStats || DEFAULT_STATS;
    });

    setTitle(prev => {
      if (prev === initialTitle) return prev;
      return initialTitle || "Systematic Review Database";
    });
  }, [initialStats, initialTitle]);

  // --- NEW: EDIT LOGIC ---
  const handleEditStat = (key: keyof CovidenceStats) => {
    const currentVal = stats[key];
    const input = window.prompt(`Update ${key.toUpperCase()} count:`, currentVal.toString());
    
    if (input !== null) {
      const newVal = parseInt(input, 10);
      if (!isNaN(newVal)) {
        setStats(prev => ({
          ...prev,
          [key]: newVal
        }));
        // Note: You can trigger a server action here to sync with Postgres/Prisma
        console.log(`Syncing ${key}: ${newVal} to cloud...`);
      }
    }
  };

  const total = stats.screening + stats.fullText + stats.extraction;
  const progress = total === 0 ? 0 : Math.round(((stats.extraction) / total) * 100);

  return (
    <div className="flex flex-col h-full overflow-hidden transition-colors duration-700">
      
      {/* HEADER */}
      <div className="pb-6 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest transition-colors duration-700">
            Systematic Review
          </span>
          <a 
            href="https://www.crd.york.ac.uk/PROSPERO/view/CRD420261303222" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center gap-1"
          >
            PROSPERO: CRD420261303222 ↗
          </a>
        </div>
        <h2 className="font-black text-[22px] lg:text-[24px] text-neutral-900 dark:text-white leading-tight tracking-tight pr-4 transition-colors duration-700">
          {title}
        </h2>
      </div>

      {/* TABS */}
      <div className="flex border-b border-black/5 dark:border-white/5 pt-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 transition-colors duration-700">
        <button 
          onClick={() => setActiveTab('PROGRESS')}
          className={`pb-3 mr-8 transition-colors duration-300 relative ${activeTab === 'PROGRESS' ? 'text-emerald-600 dark:text-emerald-400' : 'hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Review Progress
          {activeTab === 'PROGRESS' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-emerald-600 dark:bg-emerald-400 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('PICO')}
          className={`pb-3 mr-8 transition-colors duration-300 relative ${activeTab === 'PICO' ? 'text-blue-600 dark:text-blue-400' : 'hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          PICO Protocol
          {activeTab === 'PICO' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
        
        {activeTab === 'PROGRESS' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/5 dark:bg-white/5 p-5 lg:p-6 rounded-2xl border border-transparent dark:border-white/5 gap-4 transition-colors duration-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg transition-colors duration-700">
                  📊
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1 transition-colors duration-700">Database Status</div>
                  <div className="font-bold text-[16px] text-neutral-900 dark:text-white transition-colors duration-700">Covidence Sync Active</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Completion</div>
                 <div className="text-[14px] font-black tracking-tighter text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors duration-700">
                   {progress}%
                 </div>
              </div>
            </div>
            
            {/* Funnel Stats Grid - NOW EDITABLE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Screening */}
              <div 
                onClick={() => handleEditStat('screening')}
                className="flex flex-col p-6 rounded-2xl border bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group active:scale-95"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest transition-colors duration-700">Screening</div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                </div>
                <div className="text-[42px] font-black leading-none tracking-tighter text-blue-600 dark:text-blue-400 transition-colors duration-700">{stats.screening}</div>
                <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest flex items-center justify-between">
                  <span>Pending Review</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black transition-opacity">Click to Edit</span>
                </div>
              </div>

              {/* Full Text */}
              <div 
                onClick={() => handleEditStat('fullText')}
                className="flex flex-col p-6 rounded-2xl border bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group active:scale-95"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest transition-colors duration-700">Full Text</div>
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                </div>
                <div className="text-[42px] font-black leading-none tracking-tighter text-amber-600 dark:text-amber-400 transition-colors duration-700">{stats.fullText}</div>
                <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest flex items-center justify-between">
                  <span>Awaiting PDF</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black transition-opacity">Click to Edit</span>
                </div>
              </div>

              {/* Extraction */}
              <div 
                onClick={() => handleEditStat('extraction')}
                className="flex flex-col p-6 rounded-2xl border bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group active:scale-95"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest transition-colors duration-700">Extraction</div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="text-[42px] font-black leading-none tracking-tighter text-emerald-600 dark:text-emerald-400 transition-colors duration-700">{stats.extraction}</div>
                <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2 uppercase tracking-widest flex items-center justify-between">
                  <span>Data Pulled</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[9px] font-black transition-opacity">Click to Edit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ... PICO Tab ... */}
        {activeTab === 'PICO' && (
          <div className="animate-in fade-in duration-500">
            {/* PICO Grid Content */}
            <div className="mb-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[24px] p-6">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-widest mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Pending Protocol Decision
              </div>
              <p className="text-[14px] text-neutral-900 dark:text-white font-bold tracking-tight">
                Population Definition: Postmenopausal Women
              </p>
              <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-1.5 font-medium leading-relaxed">
                Does this include both natural and surgical menopause? Are patients with premature menopause included?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 lg:gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[12px] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  Inclusion Criteria
                </div>
                <PicoCard letter="P" title="Population">Postmenopausal women diagnosed with rUTIs.</PicoCard>
                <PicoCard letter="I" title="Intervention">Local (vaginal) estrogen therapy.</PicoCard>
                <PicoCard letter="C" title="Comparison">Placebo or no treatment.</PicoCard>
                <PicoCard letter="O" title="Outcomes">≥1 objective urinary outcome.</PicoCard>
                <PicoCard letter="S" title="Study Design">RCTs and observational studies.</PicoCard>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold text-[12px] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                  Exclusion Criteria
                </div>
                <PicoCard letter="P" title="Population" isExclusion>Major urogenital abnormalities; DM patients.</PicoCard>
                <PicoCard letter="I" title="Intervention" isExclusion>Systemic estrogen therapy without local arm.</PicoCard>
                <PicoCard letter="C" title="Comparison" isExclusion>Direct comparisons against antibiotics.</PicoCard>
                <PicoCard letter="O" title="Outcomes" isExclusion>No report of objective rUTI measures.</PicoCard>
                <PicoCard letter="S" title="Study Design" isExclusion>Case reports, case series, narrative reviews.</PicoCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PicoCard({ letter, title, children, isExclusion = false }: { letter: string, title: string, children: React.ReactNode, isExclusion?: boolean }) {
  const badgeColor = isExclusion 
    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' 
    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
  
  return (
    <div className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent dark:border-white/5 rounded-2xl p-5 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2.5">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[13px] transition-colors duration-700 ${badgeColor}`}>
          {letter}
        </span>
        <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-widest text-[11px] transition-colors duration-700">
          {title}
        </span>
      </div>
      <p className="text-neutral-600 dark:text-neutral-300 text-[13px] leading-relaxed pl-[40px] font-medium transition-colors duration-700">
        {children}
      </p>
    </div>
  );
}