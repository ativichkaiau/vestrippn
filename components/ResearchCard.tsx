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
          const saved = localStorage.getItem('research-manual-stats');
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
    localStorage.setItem('research-manual-stats', JSON.stringify(newStats));
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

  if (!isMounted) return <div className="bg-[var(--surface)]/20 border border-[var(--borderline)] rounded-[22px] p-6 h-[400px] animate-pulse" />;

  return (
    <div className="bg-[var(--surface)]/40 border border-[var(--borderline)] rounded-[22px] p-6 shadow-2xl flex-1 flex flex-col min-h-[400px] relative overflow-hidden group transition-all hover:border-[var(--accentAmber)]/30">
      
      {/* TACTICAL OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accentAmber)] shadow-[0_0_10px_var(--accentAmber)]"></div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--textPri)]">
            Research Hub
          </span>
        </div>
        <span className="text-[9px] font-mono text-[var(--textMuted)] uppercase tracking-widest tabular-nums border border-[var(--borderline)] px-2 py-0.5 rounded">
          {isLoading ? 'SYNCING...' : 'HYBRID_MODE'}
        </span>
      </div>

      {/* PROJECT TELEMETRY */}
      <div className="relative z-10 mb-6 p-4 bg-[var(--base)]/30 rounded-xl border border-[var(--borderline)]">
        <div className="text-[10px] font-mono text-[var(--accentAmber)] uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1 h-1 bg-[var(--accentAmber)] rounded-full animate-ping"></span>
          {projectName}
        </div>
        
        <div className="space-y-4">
          {[
            { id: 'screening', label: 'Screening', val: stats.screening, color: 'bg-[var(--accentCyan)]' },
            { id: 'fullText', label: 'Full Text', val: stats.fullText, color: 'bg-[var(--accentAmber)]' },
            { id: 'extraction', label: 'Extraction', val: stats.extraction, color: 'bg-[var(--statusGreen)]' }
          ].map((stat) => (
            <div key={stat.id} className="group/stat cursor-pointer" onClick={() => {
              const newVal = window.prompt(`Update ${stat.label} %:`, stat.val.toString());
              if (newVal) updateManualStat(stat.id, parseInt(newVal));
            }}>
              <div className="flex justify-between text-[9px] font-mono mb-1.5 uppercase tracking-tighter">
                <span className="text-[var(--textSec)] group-hover/stat:text-[var(--textPri)] transition-colors">{stat.label}</span>
                <span className="text-[var(--textPri)] font-bold">{stat.val}%</span>
              </div>
              <div className="h-[2px] w-full bg-[var(--borderline)]/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} transition-all duration-1000 shadow-[0_0_5px_currentColor] opacity-70 group-hover/stat:opacity-100`} 
                  style={{ width: `${stat.val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PUBMED SEARCH SECTOR */}
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <form onSubmit={searchPubMed} className="relative mb-4">
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Library Query..."
            className="w-full bg-[var(--base)]/50 border border-[var(--borderline)] rounded-lg px-4 py-2 text-[12px] text-[var(--textPri)] outline-none focus:border-[var(--accentCyan)]/50 transition-all font-mono placeholder:text-[var(--textMuted)]"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black font-mono text-[var(--textSec)] hover:text-[var(--accentCyan)] uppercase tracking-widest">
            {isSearching ? '...' : 'Fetch'}
          </button>
        </form>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {papers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[10px] font-mono text-[var(--textMuted)] uppercase tracking-widest opacity-30">
              No recent fetches.
            </div>
          ) : (
            papers.map((paper) => (
              <a 
                key={paper.id} 
                href={`https://pubmed.ncbi.nlm.nih.gov/${paper.id}/`} 
                target="_blank" 
                className="group/paper block bg-[var(--base)]/30 border border-[var(--borderline)] rounded-lg p-3 hover:border-[var(--accentCyan)]/40 transition-all"
              >
                <div className="text-[11px] text-[var(--textPri)] line-clamp-2 leading-snug group-hover/paper:text-[var(--accentCyan)] transition-colors mb-2 font-medium">
                  {paper.title}
                </div>
                <div className="flex justify-between text-[9px] text-[var(--textMuted)] font-mono uppercase tracking-tighter">
                  <span className="truncate pr-4">{paper.authors}</span>
                  <span className="shrink-0">{paper.pubdate}</span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}