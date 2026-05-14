'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import CovidenceBoard from '../../components/CovidenceBoard';
import TopNavProfile from '../../components/TopNavProfile';
import { saveLiteratureResult } from '@/app/actions';

interface LitResult {
  id: string; title: string; authors: string; journal: string; date: string; url: string;
}

interface ResearchProps {
  cloudResearch?: any;
  cloudExtractions?: any[];
}

export default function ResearchClient({ cloudResearch, cloudExtractions = [] }: ResearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LitResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(cloudExtractions.map(ext => ext.pmid))
  );
  
  const [isMounted, setIsMounted] = useState(false);
  const [cycle, setCycle] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    const currentHour = new Date().getHours();
    setCycle(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
  }, []);

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

  const handleSaveToVault = async (result: LitResult, e: React.MouseEvent) => {
    e.preventDefault(); 
    if (savedIds.has(result.id)) return;
    
    try {
      await saveLiteratureResult(result.id, result.title, result.authors, result.journal, result.url);
      setSavedIds(prev => new Set(prev).add(result.id));
    } catch (err) {
      console.error("Vault Write Error:", err);
    }
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
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: false },
    { name: 'Research', icon: '◆', href: '/research', active: true },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: false },
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-br from-amber-400/20 to-orange-400/20 dark:from-amber-600/15 dark:to-[#00A598]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[50%] h-[50%] bg-gradient-to-tr from-blue-400/20 to-teal-300/20 dark:from-purple-600/10 dark:to-teal-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
            </svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline">
              <span>VESTRIPPN</span>
              <span className="text-blue-600 dark:text-blue-400 transition-colors duration-700">3.0</span>
            </div>
          </Link>
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500 transition-colors duration-700"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block transition-colors duration-700"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'
        }`}>
          <nav className="space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                title={!isSidebarExpanded ? item.name : undefined}
                className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative ${
                  item.active 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span className={`text-[18px] shrink-0 transition-opacity duration-300 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${
                  isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${
              isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'
            }`}
          >
            {isSidebarExpanded ? <Clock /> : <span className="text-xl group-hover:rotate-12 transition-transform duration-300">⏱️</span>}
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-12">
            
            <section className="flex flex-col items-center justify-center text-center pt-8 sm:pt-16 pb-6 relative">
              <div className="absolute left-[5%] xl:left-[10%] top-4 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-lg">🔬</span>
                <span className="text-[13px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Systematic Review</span>
              </div>
              <div className="absolute right-[5%] xl:right-[10%] bottom-0 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Extraction Active</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-6 flex flex-col xl:flex-row items-center justify-center gap-3 sm:gap-4 xl:gap-5 relative z-10">
                <div className="flex items-baseline text-[42px] sm:text-[64px] lg:text-[76px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">
                    RESEARCH
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 xl:mt-0 text-[32px] sm:text-[50px] lg:text-[60px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-4 py-1 sm:py-2 rounded-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-black/5 leading-none transition-colors duration-700">
                    HUB
                  </span>
                </div>
              </h1>
              <p className="max-w-2xl font-mono text-[11px] sm:text-[12px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.4em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycle} // <span className="text-amber-500 dark:text-amber-400 font-bold">Terminal Online</span>
              </p>
            </section>

            <section className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-6 px-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Intelligence Extraction</h3>
              </div>
              
              <form onSubmit={initiateExtraction} className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder='Enter query (e.g., "Meta-Analysis" AND "Urology")'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 focus:ring-2 focus:ring-amber-500/30 rounded-2xl px-5 py-4 text-[14px] text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={isExtracting || !searchQuery.trim()}
                    className="bg-amber-500 text-white px-8 py-4 md:py-0 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md"
                  >
                    {isExtracting ? 'Extracting...' : 'Fetch Feed'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <button type="button" onClick={() => pivotSearch('scopus')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🏛️ Scopus
                   </button>
                   <button type="button" onClick={() => pivotSearch('clinicalkey')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🔑 Clinical
                   </button>
                   <button type="button" onClick={() => pivotSearch('cochrane')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-pink-500/30 hover:bg-pink-50 dark:hover:bg-pink-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     📚 Cochrane
                   </button>
                   
                   {/* 🤖 UPGRADED: SRMA MACHINE UPLINK */}
                   <a 
                     href="https://vestrippn-srma-telemetry.vercel.app" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400"
                   >
                     🤖 SRMA Machine
                   </a>
                </div>
              </form>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {results.map((result) => {
                const isSaved = savedIds.has(result.id);
                
                return (
                  <a 
                    key={result.id} 
                    href={result.url} 
                    target="_blank" 
                    className="group flex flex-col justify-between p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] hover:border-amber-500/30 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 active:scale-[0.99] shadow-sm relative overflow-hidden"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest transition-colors duration-700">PMID {result.id}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 transition-colors duration-700">{result.date}</span>
                          <button 
                            onClick={(e) => handleSaveToVault(result, e)}
                            disabled={isSaved}
                            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                              isSaved 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-not-allowed' 
                                : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 shadow-sm'
                            }`}
                          >
                            {isSaved ? 'Vaulted ✓' : 'Save'}
                          </button>
                        </div>
                      </div>
                      <h3 className="text-[14px] lg:text-[15px] font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-4">
                        {result.title}
                      </h3>
                    </div>
                    <div className="flex justify-between items-end text-[11px] font-medium text-neutral-500 dark:text-neutral-400 tracking-tight transition-colors duration-700">
                      <span className="truncate pr-4 leading-tight">{result.authors}</span>
                      <span className="italic shrink-0 font-bold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md leading-tight">{result.journal}</span>
                    </div>
                  </a>
                );
              })}
              
              {results.length === 0 && !isExtracting && (
                 <div className="md:col-span-2 py-16 lg:py-24 border-[2px] border-dashed border-black/10 dark:border-white/10 rounded-[32px] flex flex-col items-center justify-center opacity-60 transition-colors duration-700">
                    <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Awaiting Extraction Command</span>
                 </div>
              )}
            </div>

            <section className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px] overflow-x-auto custom-scrollbar no-scrollbar transition-colors duration-700">
               <div className="flex items-center gap-2 mb-8 px-2">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse"></span>
                  <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Review Matrix</h3>
               </div>
               <div className="min-w-[800px] lg:min-w-0">
                 <CovidenceBoard 
                   initialTitle={cloudResearch?.title}
                   initialStats={cloudResearch ? { 
                     screening: cloudResearch.screening, 
                     fullText: cloudResearch.fullText, 
                     extraction: cloudResearch.extraction 
                   } : undefined}
                 />
               </div>
            </section>

          </div>
        </main>

        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group ${
                item.active 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                 {item.icon}
               </span>
               {item.active && (
                 <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">
                   {item.name}
                 </span>
               )}
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
}