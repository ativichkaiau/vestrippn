'use client';

import { useState } from 'react';

export default function CovidenceBoard() {
  const [activeTab, setActiveTab] = useState<'PICO' | 'PROGRESS'>('PICO');

  return (
    <div className="bg-surface border border-borderline rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* HEADER */}
      <div className="p-5 border-b border-borderline flex justify-between items-start bg-base/50">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-mono text-accentCyan border border-accentCyan/30 bg-accentCyan/10 px-2 py-0.5 rounded tracking-widest">SYSTEMATIC REVIEW</span>
            <a 
              href="https://www.crd.york.ac.uk/PROSPERO/view/CRD420261303222" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] text-textSec hover:text-accentCyan transition-colors flex items-center gap-1"
            >
              PROSPERO: CRD420261303222 ↗
            </a>
          </div>
          <h2 className="font-barlow font-bold text-[18px] text-textPri leading-tight pr-4">
            Comparative Effectiveness of Local Estrogen Formulations for Preventing rUTIs in Postmenopausal Women
          </h2>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-borderline px-5 text-[12px] font-medium uppercase tracking-wider text-textSec">
        <button 
          onClick={() => setActiveTab('PICO')}
          className={`py-3 mr-6 transition-colors relative ${activeTab === 'PICO' ? 'text-accentCyan' : 'hover:text-textPri'}`}
        >
          PICO Protocol
          {activeTab === 'PICO' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accentCyan"></div>}
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-base">
        
        {/* ACTIVE QUERIES / FLAGS */}
        <div className="mb-6 bg-accentAmber/5 border border-accentAmber/20 rounded p-4">
          <div className="flex items-center gap-2 text-accentAmber font-bold text-[12px] uppercase tracking-wider mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Pending Protocol Decision
          </div>
          <p className="text-[13px] text-textPri font-medium">Population Definition: Postmenopausal Women</p>
          <p className="text-[12px] text-textSec mt-1">Does this include both natural and surgical menopause? Are patients with premature menopause included? <span className="text-accentCyan cursor-pointer hover:underline">Resolve with PI</span></p>
        </div>

        {/* PICO GRID */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* INCLUSION COLUMN */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-statusGreen font-bold text-[13px] uppercase tracking-wider border-b border-statusGreen/20 pb-2">
              <span className="w-2 h-2 rounded-full bg-statusGreen"></span>
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
            <div className="flex items-center gap-2 text-red-500 font-bold text-[13px] uppercase tracking-wider border-b border-red-500/20 pb-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
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
  const colorClass = isExclusion ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-statusGreen bg-statusGreen/10 border-statusGreen/20';
  
  return (
    <div className="bg-surface border border-borderline rounded p-3 text-[12px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${colorClass}`}>
          {letter}
        </span>
        <span className="font-bold text-textPri uppercase tracking-wide text-[11px]">{title}</span>
      </div>
      <p className="text-textSec leading-relaxed pl-7">{children}</p>
    </div>
  );
}