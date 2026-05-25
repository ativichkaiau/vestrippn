'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  type SearchTarget = 'scopus' | 'clinicalkey' | 'cochrane' | 'sciencedirect' | 'springerlink' | 'uptodate' | 'embase' | 'cambridge' | 'scholar';

  const pivotSearch = (target: SearchTarget) => {
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery);
    let url = '';
    switch (target) {
      case 'scopus': url = `https://www.scopus.com/results/results.uri?sort=plf-f&src=s&st1=${q}&sot=b&sdt=b&origin=searchbasic`; break;
      case 'clinicalkey': url = `https://www.clinicalkey.com/#!/search/${q}`; break;
      case 'cochrane': url = `https://www.cochranelibrary.com/en/search?q=${q}`; break;
      case 'sciencedirect': url = `https://www.sciencedirect.com/search?qs=${q}`; break;
      case 'springerlink': url = `https://link.springer.com/search?query=${q}`; break;
      case 'uptodate': url = `https://www.uptodate.com/contents/search?search=${q}`; break;
      case 'embase': url = `https://www.embase.com/search/results?b_query=${q}`; break;
      case 'cambridge': url = `https://www.cambridge.org/core/search?q=${q}`; break;
      case 'scholar': url = `https://scholar.google.com/scholar?q=${q}`; break;
    }
    if (url) window.open(url, '_blank');
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
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-amber-400/30 via-orange-400/25 to-rose-400/20 dark:from-amber-600/20 dark:via-orange-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-blue-400/25 via-cyan-400/20 to-teal-300/25 dark:from-blue-600/15 dark:via-cyan-600/10 dark:to-teal-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-amber-300/20 to-cyan-300/20 dark:from-amber-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
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
            
            <motion.section
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center pt-8 sm:pt-16 pb-6 relative"
            >
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
            </motion.section>

            {/* SECTOR 1: EXTRACTION MATRIX */}
            <motion.section
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden cursor-default"
            >
              <div className="flex items-center gap-2 mb-6 px-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Omni-Search Extraction Matrix</h3>
              </div>
              
              <form onSubmit={initiateExtraction} className="flex flex-col gap-5 relative z-10">
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder='Enter Boolean Query (e.g., "Meta-Analysis" AND "Urology")'
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                   <button type="button" onClick={() => pivotSearch('scopus')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🏛️ Scopus
                   </button>
                   <button type="button" onClick={() => pivotSearch('clinicalkey')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🔑 ClinicalKey
                   </button>
                   <button type="button" onClick={() => pivotSearch('cochrane')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-pink-500/30 hover:bg-pink-50 dark:hover:bg-pink-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     📚 Cochrane
                   </button>
                   <button type="button" onClick={() => pivotSearch('embase')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🏥 Embase
                   </button>
                   <button type="button" onClick={() => pivotSearch('scholar')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-400/30 hover:bg-blue-50/50 dark:hover:bg-blue-400/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🎓 G-Scholar
                   </button>
                   <button type="button" onClick={() => pivotSearch('sciencedirect')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🧬 ScienceDirect
                   </button>
                   <button type="button" onClick={() => pivotSearch('springerlink')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     📘 SpringerLink
                   </button>
                   <button type="button" onClick={() => pivotSearch('uptodate')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🩺 UpToDate
                   </button>
                   <button type="button" onClick={() => pivotSearch('cambridge')} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
                     🏛️ Cambridge
                   </button>
                   
                   <a 
                     href="https://vestrippn-srma-telemetry.vercel.app" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/10 p-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 shadow-sm"
                   >
                     🤖 SRMA Machine
                   </a>
                </div>
              </form>
            </motion.section>

            {/* SECTOR 2: RESULTS FEED */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }}
            >
              {results.map((result) => {
                const isSaved = savedIds.has(result.id);
                return (
                  <motion.a
                    key={result.id}
                    href={result.url}
                    target="_blank"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } } }}
                    whileHover={{ y: -5, scale: 1.01, boxShadow: '0 16px 40px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex flex-col justify-between p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] hover:border-amber-500/30 hover:bg-white/90 dark:hover:bg-white/10 shadow-sm relative overflow-hidden"
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
                  </motion.a>
                );
              })}

              {results.length === 0 && !isExtracting && (
                 <div className="md:col-span-2 py-16 lg:py-24 border-[2px] border-dashed border-black/10 dark:border-white/10 rounded-[32px] flex flex-col items-center justify-center opacity-60 transition-colors duration-700">
                    <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Awaiting Extraction Command</span>
                 </div>
              )}
            </motion.div>

            {/* SECTOR 3: COVIDENCE WORKSPACE */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px] overflow-x-auto custom-scrollbar no-scrollbar cursor-default"
            >
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
            </motion.section>

            {/* 📋 SECTOR 4: CLINICAL SIMULATION GUIDE (BRUGADA SYNDROME) */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ y: -6, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden cursor-default"
            >
              <div className="flex items-center gap-2 mb-6 px-2">
                <span className="w-1.5 h-4 bg-pink-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Clinical Application Guide</h3>
              </div>
              
              {/* Module Header */}
              <div className="mb-8 border-b border-black/5 dark:border-white/10 pb-6 px-2 relative z-10">
                 <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-3">CASE STUDY ANALYSIS</h2>
                 <div className="flex flex-wrap items-center gap-3 mb-4">
                   <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-pink-500/20 shadow-sm">Brugada Syndrome</span>
                   <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full shadow-sm">Scenario Guide</span>
                 </div>
                 <p className="text-[14px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed max-w-3xl">
                   เจาะลึกการนำทรัพยากรไปใช้จริงในการวิเคราะห์เคสผู้ป่วย Brugada Syndrome (โรคไหลตาย) เพื่อจำลองการทำ Case Discussion ในระดับคลินิก (Clinical Year).
                 </p>
              </div>

              {/* Module Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative z-10">
                
                {/* Intro Card (Case Profile) */}
                <div className="md:col-span-2 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-6 transition-colors duration-700 hover:bg-black/10 dark:hover:bg-white/10">
                   <div className="text-[12px] font-black text-neutral-800 dark:text-white uppercase tracking-widest mb-4">Case Information (Full Version)</div>
                   
                   <div className="space-y-4">
                     <div>
                       <span className="inline-block px-2.5 py-1 bg-white dark:bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 rounded-md shadow-sm border border-black/5 dark:border-white/5 mb-1">History</span>
                       <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed ml-1">
                         <strong>Patient:</strong> 38-year-old Thai male, no prior structural heart disease.<br/>
                         <strong>Chief Complaint:</strong> Brought to ER after an episode of unexplained syncope during rest/sleep. Wife reported episodes of nocturnal agonal respiration (gasping) before waking up confused.<br/>
                         <strong>Family Hx:</strong> Uncle died suddenly in his sleep at age 42 (Sudden Unexplained Death Syndrome - SUDS).
                       </p>
                     </div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                         <span className="inline-block px-2.5 py-1 bg-white dark:bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 rounded-md shadow-sm border border-black/5 dark:border-white/5 mb-1">Condition</span>
                         <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium ml-1">Post-syncopal state, hemodynamically stable. No chest pain.</p>
                       </div>
                       <div className="flex-1">
                         <span className="inline-block px-2.5 py-1 bg-white dark:bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 rounded-md shadow-sm border border-black/5 dark:border-white/5 mb-1">Marker</span>
                         <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium ml-1">High index of suspicion for primary electrical disease.</p>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Step 1 */}
                <div className="flex flex-col bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-blue-200 dark:border-blue-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[13px] font-black shadow-sm">1</span>
                     <h4 className="text-[14px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-wide">Lab & ECG Interpretation</h4>
                  </div>
                  <ul className="text-[13px] font-medium text-blue-800 dark:text-blue-200 leading-relaxed space-y-2 list-disc pl-5 flex-1">
                    <li><strong className="text-blue-900 dark:text-white">12-Lead ECG:</strong> Shows <span className="underline decoration-blue-400 decoration-2 font-bold">Type 1 Brugada pattern</span> in right precordial leads (V1-V2). Coved ST-segment elevation ≥ 2mm followed by a negative T wave.</li>
                    <li><strong className="text-blue-900 dark:text-white">Cardiac Biomarkers:</strong> High-sensitivity Troponin T is normal (rules out acute STEMI/myocarditis).</li>
                    <li><strong className="text-blue-900 dark:text-white">Electrolytes:</strong> Potassium, Magnesium, and Calcium levels are normal (rules out acquired ST-elevation).</li>
                  </ul>
                  
                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-blue-100 dark:border-blue-500/10 text-neutral-700 dark:text-neutral-300">🩺 UpToDate</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-blue-100 dark:border-blue-500/10 text-neutral-700 dark:text-neutral-300">🔑 ClinicalKey</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-amber-200 dark:border-amber-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[13px] font-black shadow-sm">2</span>
                     <h4 className="text-[14px] font-black text-amber-900 dark:text-amber-100 uppercase tracking-wide">Symptoms & Differential</h4>
                  </div>
                  <div className="space-y-3 flex-1">
                    <p className="text-[13px] font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                      <strong>Key Symptom:</strong> Syncope typically occurs during rest, sleep, or vagal predominance, unlike exertion-induced syncope (e.g., HCM, LQTS).
                    </p>
                    <div className="bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20 text-[12px] font-medium text-amber-900 dark:text-amber-100">
                      <strong>Differential Diagnosis (DDx):</strong>
                      <ul className="list-disc pl-4 mt-1">
                        <li>Arrhythmogenic Right Ventricular Cardiomyopathy (ARVC)</li>
                        <li>Acute Anterior/Septal STEMI</li>
                        <li>Early Repolarization Syndrome</li>
                        <li>Acute Pulmonary Embolism</li>
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-amber-100 dark:border-amber-500/10 text-neutral-700 dark:text-neutral-300">🧬 ScienceDirect</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-amber-100 dark:border-amber-500/10 text-neutral-700 dark:text-neutral-300">🏛️ Scopus</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-emerald-200 dark:border-emerald-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[13px] font-black shadow-sm">3</span>
                     <h4 className="text-[14px] font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">Treatment & Management</h4>
                  </div>
                  <ul className="text-[13px] font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed space-y-3 flex-1">
                    <li><strong className="text-emerald-900 dark:text-white block mb-0.5">Immediate Protocol:</strong> Admit to CCU for continuous telemetry monitoring. Treat any fever aggressively with antipyretics (fever unmasks Brugada ECG and triggers VF).</li>
                    <li><strong className="text-emerald-900 dark:text-white block mb-0.5">Electrical Storm Mgmt:</strong> IV Isoproterenol infusion or oral Quinidine to normalize the ST segment.</li>
                    <li><strong className="text-emerald-900 dark:text-white block mb-0.5">Definitive Treatment:</strong> Implantable Cardioverter Defibrillator (ICD) is the only proven therapy to prevent sudden cardiac death in symptomatic patients.</li>
                  </ul>

                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-emerald-100 dark:border-emerald-500/10 text-neutral-700 dark:text-neutral-300">📚 Cochrane</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-emerald-100 dark:border-emerald-500/10 text-neutral-700 dark:text-neutral-300">🩺 UpToDate</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 rounded-2xl p-6 transition-colors duration-700 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4 border-b border-purple-200 dark:border-purple-500/20 pb-3">
                     <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[13px] font-black shadow-sm">4</span>
                     <h4 className="text-[14px] font-black text-purple-900 dark:text-purple-100 uppercase tracking-wide">Mechanism & Understanding</h4>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-purple-800 dark:text-purple-200 leading-relaxed mb-3">
                      <strong>Pathophysiology:</strong> Brugada is primarily an autosomal dominant genetic channelopathy.
                    </p>
                    <div className="bg-purple-100 dark:bg-purple-500/10 p-3 rounded-xl border border-purple-200 dark:border-purple-500/20 text-[12px] font-medium text-purple-900 dark:text-purple-100">
                       Mutation in the <strong>SCN5A</strong> gene → Loss of function of the cardiac sodium channel (I<sub>Na</sub>) → Heterogeneity of action potentials between the endocardium and epicardium in the Right Ventricular Outflow Tract (RVOT) → Phase 2 reentry → Polymorphic VT / Ventricular Fibrillation (VF).
                    </div>
                  </div>

                  {/* Recommended Engine */}
                  <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-500/20 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Target Uplink:</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-purple-100 dark:border-purple-500/10 text-neutral-700 dark:text-neutral-300">🏥 Embase</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-purple-100 dark:border-purple-500/10 text-neutral-700 dark:text-neutral-300">📘 SpringerLink</span>
                    <span className="px-2.5 py-1 bg-white dark:bg-black/20 rounded-md text-[10px] font-bold shadow-sm border border-purple-100 dark:border-purple-500/10 text-neutral-700 dark:text-neutral-300">🏛️ Cambridge</span>
                  </div>
                </div>

              </div>
            </motion.section>

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