'use client';

import { useState } from 'react';

export default function CovidenceBoard() {
  const [activeTab, setActiveTab] = useState<'PICO' | 'PROGRESS'>('PICO');

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
          Comparative Effectiveness of Local Estrogen Formulations for Preventing rUTIs in Postmenopausal Women
        </h2>
      </div>

      {/* TABS */}
      <div className="flex border-b border-black/5 dark:border-white/5 pt-4 text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 transition-colors duration-700">
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
        
        {/* ACTIVE QUERIES / FLAGS */}
        <div className="mb-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[24px] p-6 transition-colors duration-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-widest mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Pending Protocol Decision
          </div>
          <p className="text-[14px] text-neutral-900 dark:text-white font-bold tracking-tight transition-colors duration-700">
            Population Definition: Postmenopausal Women
          </p>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-1.5 font-medium leading-relaxed transition-colors duration-700">
            Does this include both natural and surgical menopause? Are patients with premature menopause included?{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline transition-all active:scale-95 inline-block">
              Resolve with PI
            </span>
          </p>
        </div>

        {/* PICO GRID */}
        <div className="grid grid-cols-2 gap-6 lg:gap-8">
          
          {/* INCLUSION COLUMN */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[12px] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-3 mb-2 transition-colors duration-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Inclusion Criteria
            </div>

            <PicoCard letter="P" title="Population">
              Postmenopausal women diagnosed with rUTIs (&gt;2 episodes/6mo OR &gt;3 episodes/12mo).
            </PicoCard>
            <PicoCard letter="I" title="Intervention">
              Local (vaginal) estrogen therapy (any formulation or molecule).
            </PicoCard>
            <PicoCard letter="C" title="Comparison">
              Different vaginal estrogen formulations, placebo, or no treatment.
            </PicoCard>
            <PicoCard letter="O" title="Outcomes">
              ≥1 objective urinary outcome (e.g., number of UTI recurrences, time to first recurrence).
            </PicoCard>
            <PicoCard letter="S" title="Study Design">
              RCTs and analytical observational studies (prospective/retrospective cohort, case-control).
            </PicoCard>
          </div>

          {/* EXCLUSION COLUMN */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold text-[12px] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-3 mb-2 transition-colors duration-700">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              Exclusion Criteria
            </div>

            <PicoCard letter="P" title="Population" isExclusion>
              Major urogenital abnormalities (e.g., advanced pelvic organ prolapse, catheters) independently increasing UTI risk; DM patients.
            </PicoCard>
            <PicoCard letter="I" title="Intervention" isExclusion>
              Systemic estrogen therapy (oral/transdermal) without a local arm, or combined systemic + local therapy.
            </PicoCard>
            <PicoCard letter="C" title="Comparison" isExclusion>
              Studies comparing estrogen directly against antibiotics.
            </PicoCard>
            <PicoCard letter="O" title="Outcomes" isExclusion>
              Does not report any objective measures of rUTIs.
            </PicoCard>
            <PicoCard letter="S" title="Study Design" isExclusion>
              Case reports, case series, narrative reviews, editorials, abstracts (insufficient data), animal/in-vitro, systematic reviews/meta-analyses.
            </PicoCard>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-component for clean PICO formatting
function PicoCard({ letter, title, children, isExclusion = false }: { letter: string, title: string, children: React.ReactNode, isExclusion?: boolean }) {
  // Dynamic color routing based on Inclusion vs Exclusion
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