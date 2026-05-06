'use client';

import { useState, useEffect } from 'react';

interface PubMedResult {
  id: string;
  title: string;
  authors: string;
  pubdate: string;
}

export default function ResearchCard() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Project State
  const [projectName, setProjectName] = useState('Brugada Phenotypes in SE Asia');
  const [currentPhase, setCurrentPhase] = useState('Extraction Phase');
  const [nextStep, setNextStep] = useState('Finish data table for cohort A');
  const [projectDay, setProjectDay] = useState('Day 5');

  // PubMed API State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [papers, setPapers] = useState<PubMedResult[]>([]);

  // WAKE UP: Load saved project data
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('vestrippn-research');
      if (saved) {
        const data = JSON.parse(saved);
        setProjectName(data.name || projectName);
        setCurrentPhase(data.phase || currentPhase);
        setNextStep(data.step || nextStep);
        setProjectDay(data.day || projectDay);
      }
    } catch (e) {
      console.error("Failed to load research data", e);
    }
  }, []);

  // Save Project Updates
  const saveProject = (updates: any) => {
    const newData = { name: projectName, phase: currentPhase, step: nextStep, day: projectDay, ...updates };
    localStorage.setItem('vestrippn-research', JSON.stringify(newData));
  };

  // PubMed Live Fetcher
  const searchPubMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setPapers([]);

    try {
      // 1. Get IDs from PubMed
      const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3&sort=date`);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult.idlist;

      if (!ids || ids.length === 0) {
        setIsSearching(false);
        return; // No results
      }

      // 2. Get summaries for those IDs
      const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
      const summaryData = await summaryRes.json();

      const results = ids.map((id: string) => {
        const paper = summaryData.result[id];
        return {
          id,
          title: paper.title,
          authors: paper.authors && paper.authors.length > 0 ? paper.authors[0].name + (paper.authors.length > 1 ? ' et al.' : '') : 'Unknown',
          pubdate: paper.pubdate.split(' ')[0] // Just get the year/month
        };
      });

      setPapers(results);
    } catch (error) {
      console.error("PubMed Fetch Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isMounted) return <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm flex-1 animate-pulse min-h-[200px]" />;

  return (
    <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors flex-1 flex flex-col h-[320px]">
      
      {/* HEADER */}
      <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex justify-between items-center mb-4">
        <span>Research</span>
        <input
          type="text"
          value={projectDay}
          onChange={(e) => { setProjectDay(e.target.value); saveProject({ day: e.target.value }); }}
          className="bg-transparent text-right text-textSec text-[11px] normal-case outline-none hover:bg-borderline/30 focus:bg-base focus:ring-1 focus:ring-accentCyan/50 rounded w-16 transition-colors"
        />
      </div>

      {/* ACTIVE PROJECT */}
      <div className="mb-5 pb-5 border-b border-borderline/50">
        <input
          type="text"
          value={projectName}
          onChange={(e) => { setProjectName(e.target.value); saveProject({ name: e.target.value }); }}
          className="w-full bg-transparent text-[13px] text-textPri mb-1 outline-none hover:bg-borderline/30 focus:bg-base focus:ring-1 focus:ring-accentCyan/50 rounded -ml-1 px-1 transition-colors font-medium truncate"
        />
        <input
          type="text"
          value={currentPhase}
          onChange={(e) => { setCurrentPhase(e.target.value); saveProject({ phase: e.target.value }); }}
          className="bg-accentAmber/10 text-accentAmber text-[11px] border border-accentAmber/30 px-2 py-0.5 rounded outline-none hover:bg-accentAmber/20 focus:ring-1 focus:ring-accentAmber transition-colors block w-fit mb-2"
        />
        <div className="flex gap-1 items-center">
          <span className="text-[11px] text-textSec shrink-0">Next:</span>
          <input
            type="text"
            value={nextStep}
            onChange={(e) => { setNextStep(e.target.value); saveProject({ step: e.target.value }); }}
            className="w-full bg-transparent text-[11px] text-textSec outline-none hover:bg-borderline/30 focus:bg-base focus:ring-1 focus:ring-accentCyan/50 rounded px-1 transition-colors truncate"
          />
        </div>
      </div>

      {/* PUBMED INTEGRATION */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <form onSubmit={searchPubMed} className="relative mb-3 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PubMed..."
            className="w-full bg-base border border-borderline rounded px-3 py-1.5 text-[11px] text-textPri placeholder:text-textMuted focus:outline-none focus:border-accentCyan transition-colors"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono text-textSec hover:text-accentCyan disabled:opacity-50 px-2 py-1"
          >
            {isSearching ? '...' : 'Fetch'}
          </button>
        </form>

        {/* RESULTS AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
          {papers.length === 0 && !isSearching ? (
             <div className="text-[10px] text-textMuted text-center mt-4">NCBI E-utilities Ready.</div>
          ) : (
            papers.map((paper) => (
              <a
                key={paper.id}
                href={`https://pubmed.ncbi.nlm.nih.gov/${paper.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-base border border-borderline rounded p-2 hover:border-accentCyan/50 transition-colors"
              >
                <div className="text-[11px] text-textPri line-clamp-2 leading-tight group-hover:text-accentCyan transition-colors mb-1">
                  {paper.title}
                </div>
                <div className="flex justify-between text-[9px] text-textSec font-mono">
                  <span className="truncate pr-2">{paper.authors}</span>
                  <span>{paper.pubdate}</span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}