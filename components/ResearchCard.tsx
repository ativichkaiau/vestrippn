'use client';

import { useState, useEffect } from 'react';

interface PubMedResult {
  id: string; title: string; authors: string; pubdate: string;
}

export default function ResearchCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [projectName, setProjectName] = useState('Local Estrogen Formulations and rUTI');
  const [stats, setStats] = useState({ screening: 45, fullText: 12, extraction: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [papers, setPapers] = useState<PubMedResult[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const initializeData = async () => {
      try {
        const res = await fetch('/api/research');
        if (res.ok) {
          const data = await res.json();
          setProjectName(data.title);
          setStats(data.stats);
        } else {
          // Bumped local storage key to v2 for clean state
          const saved = localStorage.getItem('vestrippn-research-stats-v2');
          if (saved) setStats(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("Covidence Bridge Offline");
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  const updateManualStat = (key: string, val: number) => {
    const newStats = { ...stats, [key]: val };
    setStats(newStats);
    localStorage.setItem('vestrippn-research-stats-v2', JSON.stringify(newStats));
  };

  const searchPubMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const sRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`);
      const sData = await sRes.json();
      const ids = sData.esearchresult.idlist;
      if (!ids?.length) { setPapers([]); return; }
      const sumRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
      const sumData = await sumRes.json();
      setPapers(ids.map((id: string) => ({
        id, title: sumData.result[id].title,
        authors: sumData.result[id].authors?.[0]?.name + ' et al.',
        pubdate: sumData.result[id].pubdate.split(' ')[0]
      })));
    } finally { setIsSearching(false); }
  };

  // Sleek Glassmorphic Skeleton
  if (!isMounted) return (
    <div className="flex flex-col gap-6 w-full animate-pulse transition-colors duration-700">
      <div className="h-32 bg-black/5 dark:bg-white/5 rounded-2xl w-full"></div>
      <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl w-full"></div>
      <div className="flex-1 space-y-3">
        <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl w-full"></div>
        <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl w-full"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full relative group transition-colors duration-700">
      
      {/* STATUS INDICATOR */}
      <div className="absolute -top-12 right-0 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 transition-colors duration-700">
          <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span className="text-[10px] font-bold tracking-wide text-neutral-500 dark:text-neutral-400 uppercase transition-colors duration-700">
            {isLoading ? 'Syncing' : 'Covidence Live'}
          </span>
        </div>
      </div>

      {/* PROJECT TELEMETRY */}
      <div className="mb-6 p-5 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 transition-colors duration-700">
        <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors duration-700">
          <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-colors duration-700"></span>
          Active Review
        </div>
        
        <h3 className="font-bold text-[15px] leading-tight text-neutral-800 dark:text-neutral-200 mb-6 transition-colors duration-700">
          {projectName}
        </h3>
        
        <div className="space-y-4">
          {[
            { id: 'screening', label: 'Screening', val: stats.screening, color: 'bg-blue-500 dark:bg-blue-400' },
            { id: 'fullText', label: 'Full Text', val: stats.fullText, color: 'bg-amber-500 dark:bg-amber-400' },
            { id: 'extraction', label: 'Extraction', val: stats.extraction, color: 'bg-emerald-500 dark:bg-emerald-400' }
          ].map((stat) => (
            <div key={stat.id} className="group/stat cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 -mx-2 px-2 py-1 rounded-lg transition-all duration-300" onClick={() => {
              const newVal = window.prompt(`Update ${stat.label} %:`, stat.val.toString());
              if (newVal) updateManualStat(stat.id, parseInt(newVal));
            }}>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1.5 transition-colors duration-700">
                <span className="text-neutral-500 dark:text-neutral-400 group-hover/stat:text-neutral-700 dark:group-hover/stat:text-neutral-200 transition-colors duration-300">
                  {stat.label}
                </span>
                <span className="text-neutral-900 dark:text-white transition-colors duration-700">
                  {stat.val}%
                </span>
              </div>
              <div className="h-[4px] w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-700">
                <div 
                  className={`h-full ${stat.color} transition-all duration-1000 rounded-full`} 
                  style={{ width: `${stat.val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PUBMED SEARCH SECTOR */}
      <div className="flex flex-col flex-1 overflow-hidden min-h-[200px]">
        
        {/* Soft Search Input */}
        <form onSubmit={searchPubMed} className="relative mb-4 flex">
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PubMed Library..."
            className="w-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 focus:ring-2 focus:ring-blue-500/30 rounded-xl px-4 py-2.5 text-[13px] text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium"
          />
          <button 
            type="submit" 
            disabled={!searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:hover:shadow-none"
          >
            {isSearching ? '...' : 'Fetch'}
          </button>
        </form>

        {/* Dynamic Paper Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {papers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[12px] font-medium text-neutral-400 dark:text-neutral-500 italic transition-colors duration-700">
              Awaiting query...
            </div>
          ) : (
            papers.map((paper) => (
              <a 
                key={paper.id} 
                href={`https://pubmed.ncbi.nlm.nih.gov/${paper.id}/`} 
                target="_blank" 
                className="group/paper block bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl p-3.5 transition-all duration-300 border border-transparent dark:border-white/5 active:scale-[0.99]"
              >
                <div className="text-[13px] text-neutral-800 dark:text-neutral-200 font-bold line-clamp-2 leading-snug group-hover/paper:text-blue-600 dark:group-hover/paper:text-blue-400 transition-colors mb-2">
                  {paper.title}
                </div>
                <div className="flex justify-between items-center text-[11px] text-neutral-500 dark:text-neutral-400 font-medium tracking-tight transition-colors duration-700">
                  <span className="truncate pr-4">{paper.authors}</span>
                  <span className="shrink-0 font-bold bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md transition-colors duration-700">
                    {paper.pubdate}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

    </div>
  );
}