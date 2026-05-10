'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import CovidenceBoard from '../../components/CovidenceBoard';
import TopNavProfile from '../../components/TopNavProfile';

interface LitResult {
  id: string; title: string; authors: string; journal: string; date: string; url: string;
}

export default function ResearchHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LitResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const initiateExtraction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch(`/api/literature?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Extraction_Uplink_Failure"); }
    finally { setIsExtracting(false); }
  };

  const pivotSearch = (target: 'scopus' | 'clinicalkey' | 'cochrane') => {
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery);
    let url = '';
    switch (target) {
      case 'scopus': url = `https://www.scopus.com/results/results.uri?sort=plf-f&src=s&st1=${q}&sot=b&sdt=b&origin=searchbasic`; break;
      case 'clinicalkey': url = `https://www.clinicalkey.com/#!/search/${q}`; break;
      case 'cochrane': url = `https://www.cochranelibrary.com/en/search?q=${q}`; break;
    }
    window.open(url, '_blank');
  };

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]', active: true },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
  ];

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-[var(--accentAmber)]/5 rounded-full blur-[80px] lg:blur-[120px]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentAmber)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <header className="h-[56px] lg:h-[64px] border-b border-borderline flex items-center justify-between px-4 lg:px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="font-orbitron font-black text-[15px] lg:text-[18px] tracking-[0.2em] flex items-center gap-2">
            <div className="w-1 h-4 lg:w-1.5 lg:h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="hidden lg:flex gap-4 border-l border-borderline pl-6 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>RESEARCH_OS: <span className="text-statusGreen uppercase font-bold tracking-tighter">Stable</span></span>
              <span>EXTRACTION: <span className={isExtracting ? 'text-[var(--accentAmber)] animate-pulse' : 'text-textMuted uppercase tracking-tighter'}>{isExtracting ? 'Running' : 'Ready'}</span></span>
            </div>
          </div>
        </div>
        <div className="hidden sm:block font-mono text-[10px] lg:text-[11px] tracking-[0.2em] text-textPri uppercase"><ArcDate /></div>
        <div className="flex gap-3 lg:gap-4 items-center border-l border-borderline pl-4 lg:pl-6">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:flex w-[230px] border-r border-borderline flex flex-col justify-between p-5 bg-surface/20 shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${item.active ? 'bg-[var(--accentAmber)]/10 border-[var(--accentAmber)]/20 font-bold' : 'hover:bg-surface'}`}>
                <span className={`${item.active ? item.color : 'text-textMuted opacity-40'} text-[14px]`}>{item.icon}</span>
                <span className={`text-[12px] tracking-tight ${item.active ? 'text-textPri' : 'text-textSec group-hover:text-textPri'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4"><Clock /></div>
        </aside>

        {/* --- MAIN HUD CONTENT (RESPONSIVE) --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 pb-24 lg:pb-8">
          
          {/* SECTOR 1: OMNI-SEARCH EXTRACTION TERMINAL */}
          <section className="bg-surface/30 border border-borderline rounded-[22px] p-6 lg:p-8 shadow-xl relative overflow-hidden group hover:border-[var(--accentAmber)]/30 transition-all">
            <div className="font-mono text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.3em] text-textMuted mb-6 flex items-center gap-3">
              <div className="w-1.5 h-4 bg-[var(--accentAmber)] shadow-[0_0_8px_var(--accentAmber)]"></div>
              Intelligence Extraction
            </div>
            
            <form onSubmit={initiateExtraction} className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col md:flex-row gap-3 lg:gap-4">
                <input 
                  type="text" 
                  placeholder='Enter query (e.g., "Meta-Analysis" AND "Urology")'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-base/50 border border-borderline rounded-xl px-4 lg:px-5 py-3 lg:py-4 text-[12px] lg:text-[13px] text-textPri outline-none focus:border-[var(--accentAmber)]/50 transition-all font-mono"
                />
                <button 
                  type="submit"
                  disabled={isExtracting}
                  className="bg-[var(--accentAmber)] text-black px-6 lg:px-10 py-3 lg:py-0 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_var(--accentAmber)] transition-all disabled:opacity-50"
                >
                  {isExtracting ? 'Extacting...' : 'Fetch Feed'}
                </button>
              </div>

              {/* SECTOR JUMPS (Responsive Grid) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3">
                 <button onClick={() => pivotSearch('scopus')} className="bg-base border border-borderline hover:border-[var(--accentCyan)]/40 hover:text-[var(--accentCyan)] p-3 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">🏛️ Scopus</button>
                 <button onClick={() => pivotSearch('clinicalkey')} className="bg-base border border-borderline hover:border-[var(--accentAmber)]/40 hover:text-[var(--accentAmber)] p-3 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">🔑 Clinical</button>
                 <button onClick={() => pivotSearch('cochrane')} className="bg-base border border-borderline hover:border-[var(--accentFuchsia)]/40 hover:text-[var(--accentFuchsia)] p-3 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">📚 Cochrane</button>
                 <div className="hidden md:flex bg-[var(--base)]/20 border border-[var(--borderline)]/40 p-3 rounded-xl text-[8px] font-mono text-[var(--textMuted)] items-center justify-center uppercase tracking-tighter italic">Institutional_Uplink</div>
              </div>
            </form>
          </section>

          {/* SECTOR 2: LIVE EXTRACTION FEED (Adaptive Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {results.map((result) => (
              <a 
                key={result.id} 
                href={result.url} 
                target="_blank" 
                className="group relative p-5 lg:p-6 bg-surface/40 border border-borderline rounded-[22px] hover:border-[var(--accentCyan)]/40 transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accentCyan)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-3 lg:mb-4 font-mono text-[8px] lg:text-[9px] uppercase tracking-widest text-textMuted">
                  <span className="text-[var(--accentCyan)] font-bold">PMID_{result.id}</span>
                  <span>{result.date}</span>
                </div>
                <h3 className="text-[13px] lg:text-[14px] font-bold text-textPri group-hover:text-[var(--accentCyan)] transition-colors line-clamp-2 leading-snug mb-3 lg:mb-4">
                  {result.title}
                </h3>
                <div className="flex justify-between text-[9px] lg:text-[10px] font-mono text-textMuted uppercase tracking-tighter">
                  <span className="truncate pr-4">{result.authors}</span>
                  <span className="italic shrink-0">{result.journal}</span>
                </div>
              </a>
            ))}
            {results.length === 0 && !isExtracting && (
               <div className="md:col-span-2 py-16 lg:py-24 border border-borderline border-dashed rounded-[22px] flex flex-col items-center justify-center opacity-30">
                  <span className="text-[9px] lg:text-[10px] font-mono uppercase tracking-[0.4em]">Awaiting Extraction Command</span>
               </div>
            )}
          </div>

          {/* SECTOR 3: COVIDENCE WORKSPACE (Horizontal Scroll Guard) */}
          <section className="border border-borderline rounded-[22px] p-6 lg:p-8 bg-surface/10 backdrop-blur-sm min-h-[500px] shadow-xl overflow-x-auto custom-scrollbar no-scrollbar">
             <div className="font-mono text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.3em] text-textPri mb-6 lg:mb-8 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[var(--accentAmber)] shadow-[0_0_10px_var(--accentAmber)]"></span> Review Matrix
             </div>
             <div className="min-w-[800px] lg:min-w-0">
               <CovidenceBoard />
             </div>
          </section>

          <div className="h-12 lg:h-4"></div>
        </main>

        {/* --- MOBILE HUD NAV BAR --- */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-[64px] bg-base/80 backdrop-blur-2xl border border-borderline rounded-2xl z-[100] flex items-center justify-around px-2 shadow-2xl">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center gap-1 group">
               <span className={`${item.color} text-[18px] ${item.active ? 'drop-shadow-[0_0_8px_currentColor]' : 'opacity-40'}`}>
                 {item.icon}
               </span>
               <span className={`text-[8px] font-black uppercase tracking-tighter ${item.active ? 'text-textPri' : 'text-textMuted'}`}>
                 {item.name.split(' ')[0]}
               </span>
            </Link>
          ))}
          <Link href="/identity" className="w-10 h-10 rounded-full bg-surface border border-borderline flex items-center justify-center text-[18px] text-[var(--accentCyan)] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            ⚇
          </Link>
        </nav>

      </div>
    </div>
  );
}