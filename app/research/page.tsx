'use client';

import Link from 'next/link';
import { useState } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import CovidenceBoard from '../../components/CovidenceBoard';

export default function ResearchHub() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (database: 'pubmed' | 'cochrane' | 'clinicalkey') => {
    if (!searchQuery.trim()) return;
    
    const encodedQuery = encodeURIComponent(searchQuery);
    let url = '';

    switch (database) {
      case 'pubmed':
        url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodedQuery}`;
        break;
      case 'cochrane':
        url = `https://www.cochranelibrary.com/en/search?p_p_id=scolarissearchresultsportlet_WAR_scolarissearchresults&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&p_p_col_id=column-1&p_p_col_count=1&q=${encodedQuery}`;
        break;
      case 'clinicalkey':
        url = `https://www.clinicalkey.com/#!/search/${encodedQuery}`;
        break;
    }

    window.open(url, '_blank');
  };

  return (
    <>
      {/* TOP BAR */}
      <header className="h-[56px] border-b border-borderline flex items-center justify-between px-4 md:px-6 shrink-0 bg-base">
        <div className="font-orbitron font-bold text-[15px] md:text-[18px] text-textPri uppercase tracking-wider truncate">
          vestrippn3point0
        </div>
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

          <ThemeToggle />
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-base">
        
        {/* SIDEBAR (Mobile optimized scrolling & touch targets) */}
        <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between px-4 py-3 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            <Link href="/" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Dashboard
            </Link>
            <Link href="/academics" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Academics
            </Link>
            
            {/* ACTIVE: RESEARCH */}
            <div className="text-accentCyan cursor-default transition-all flex items-center gap-1.5 font-medium px-3 py-1.5 md:px-0 md:py-0 md:pl-4 bg-accentCyan/5 md:bg-transparent rounded md:rounded-none">
              <span className="text-[10px] hidden md:block">◉</span> Research
            </div>

            <Link href="/fitness" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Fitness & Diet
            </Link>

            <Link href="/archive" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">
              Archive
            </Link>

            <Link href="/ielts" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>
            <Link href="/tools" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Tools & Links</Link>
            <Link href="/identity" className="px-3 py-1.5 md:px-0 md:py-0 md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Identity</Link>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* RESEARCH CONTENT */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          
          {/* HEADER SECTION (Responsive text sizes) */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 mb-2 gap-3">
            <div>
              <h1 className="font-barlow text-[24px] sm:text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Meta-Analysis War Room</h1>
              <p className="text-[12px] sm:text-[13px] text-textSec mt-1">Systematic Review Engine & Covidence Protocol</p>
            </div>
            <div className="flex">
              <div className="text-[10px] sm:text-[11px] font-mono text-accentAmber border border-accentAmber/30 bg-accentAmber/10 px-3 py-1 rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accentAmber rounded-full animate-pulse"></span>
                SCREENING PHASE
              </div>
            </div>
          </div>

          {/* OMNI-SEARCH FETCHER (Mobile Optimized Grid) */}
          <div className="bg-surface border border-borderline rounded-lg p-4 sm:p-5 shadow-sm shrink-0 hover:border-accentCyan/40 transition-colors">
            <div className="font-barlow font-semibold text-[11px] sm:text-[13px] uppercase tracking-wide text-textSec mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accentCyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Global Literature Fetcher
            </div>
            
            <div className="flex flex-col lg:flex-row gap-3">
              <input 
                type="text" 
                placeholder='Enter search string (e.g., "vaginal estrogen" AND "UTI")'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch('pubmed')}
                className="flex-1 bg-base border border-borderline rounded px-4 py-3 text-[13px] text-textPri outline-none focus:border-accentCyan/50 transition-colors font-mono placeholder:text-textMuted"
              />
              
              <div className="grid grid-cols-3 sm:flex gap-2 shrink-0">
                <button 
                  onClick={() => handleSearch('pubmed')}
                  className="bg-base border border-borderline hover:border-accentCyan hover:text-accentCyan hover:bg-accentCyan/5 text-textSec py-2.5 sm:px-4 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all"
                >
                  PubMed
                </button>
                <button 
                  onClick={() => handleSearch('cochrane')}
                  className="bg-base border border-borderline hover:border-accentCyan hover:text-accentCyan hover:bg-accentCyan/5 text-textSec py-2.5 sm:px-4 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all"
                >
                  Cochrane
                </button>
                <button 
                  onClick={() => handleSearch('clinicalkey')}
                  className="bg-base border border-borderline hover:border-accentCyan hover:text-accentCyan hover:bg-accentCyan/5 text-textSec py-2.5 sm:px-4 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all"
                >
                  ClinicalKey
                </button>
              </div>
            </div>
          </div>

          {/* COVIDENCE PROTOCOL BOARD */}
          <div className="flex-1 min-h-[600px] overflow-x-auto custom-scrollbar">
            <CovidenceBoard />
          </div>

        </main>
      </div>
    </>
  );
}