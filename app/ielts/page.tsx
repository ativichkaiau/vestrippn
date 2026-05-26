'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

interface Module { id: number; text: string; }

export default function IELTSHub() {
  const [lexiconQuery, setLexiconQuery] = useState('');
  const [lexiconData, setLexiconData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [cycleTime, setCycleTime] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [modules, setModules] = useState<Module[]>([
    { id: 1, text: 'Reading Strategies' },
    { id: 2, text: 'Listening Buffer' },
    { id: 3, text: 'Writing Framework' },
    { id: 4, text: 'Speaking Protocol' }
  ]);
  const [isEditingModules, setIsEditingModules] = useState(false);
  const [tempModules, setTempModules] = useState<Module[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const currentHour = new Date().getHours();
    setCycleTime(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');

    const savedModules = localStorage.getItem('vest_ielts_modules_v3');
    if (savedModules) setModules(JSON.parse(savedModules));
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('vest_ielts_modules_v3', JSON.stringify(modules));
  }, [modules, isMounted]);

  const handleLexiconSearch = async () => {
    if (!lexiconQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setLexiconData(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lexiconQuery}`);
      const data = await response.json();
      if (response.ok && data.length > 0) setLexiconData(data[0]);
      else setSearchError('TOKEN_NOT_FOUND');
    } catch (e) { setSearchError('UPLINK_FAILURE'); }
    finally { setIsSearching(false); }
  };

  const commitModules = () => {
    setModules(tempModules);
    setIsEditingModules(false);
  };

  if (!isMounted) return null;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: false },
    { name: 'Research', icon: '◆', href: '/research', active: false },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: true },
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-purple-500/30">
      
      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-purple-400/30 via-fuchsia-400/25 to-pink-400/25 dark:from-purple-600/20 dark:via-fuchsia-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-purple-300/25 dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-purple-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-fuchsia-300/20 to-indigo-300/20 dark:from-fuchsia-500/10 dark:to-indigo-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline"><span>VESTRIPPN</span><span className="text-purple-600 dark:text-purple-400 transition-colors duration-700">3.0</span></div>
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
        
        {/* --- RETRACTABLE SIDEBAR --- */}
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'}`}>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                <span className={`text-[18px] shrink-0 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 ${isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'}`}>
            {isSidebarExpanded ? <Clock /> : <span className="text-xl">⏱️</span>}
          </button>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-12">
            
            {/* HERO SECTION */}
            <motion.section
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center pt-8 sm:pt-16 pb-6 relative"
            >
              <div className="absolute left-[5%] xl:left-[10%] top-4 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-lg">🌐</span>
                <span className="text-[13px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Linguistic Core</span>
              </div>
              <div className="absolute right-[5%] xl:right-[10%] bottom-0 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Lexicon Active</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-6 flex flex-col xl:flex-row items-center justify-center gap-3 sm:gap-4 xl:gap-5 relative z-10">
                <div className="flex items-baseline text-[42px] sm:text-[64px] lg:text-[76px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">
                    IELTS
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 xl:mt-0 text-[32px] sm:text-[50px] lg:text-[60px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-4 py-1 sm:py-2 rounded-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-black/5 leading-none transition-colors duration-700">
                    VAULT
                  </span>
                </div>
              </h1>
              <p className="max-w-2xl font-mono text-[11px] sm:text-[12px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.4em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycleTime} // <span className="text-purple-600 dark:text-purple-400 font-bold">System Nominal</span>
              </p>
            </motion.section>

            {/* SECTOR 1: AI VAULT PORTAL */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Intelligence Buffer</h3>
              </div>
              <motion.section
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 24px 56px rgb(0,0,0,0.08)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl border rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-default ${isEditingModules ? 'border-amber-500/30 ring-4 ring-amber-500/5' : 'border-black/5 dark:border-white/5'}`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl shadow-sm transition-colors duration-700">🎙️</div>
                    <div>
                      <h2 className="font-black text-[18px] lg:text-[20px] text-neutral-900 dark:text-white tracking-tight">NotebookLM Integration</h2>
                      <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
                        {isEditingModules ? 'Reconfiguring Matrix' : 'AI-Synthesis Active'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    {isEditingModules ? (
                      <>
                        <button onClick={commitModules} className="flex-1 md:flex-none bg-emerald-500 text-white font-bold text-[11px] px-6 py-3 rounded-xl uppercase tracking-widest transition-all active:scale-95 shadow-md">Commit</button>
                        <button onClick={() => setIsEditingModules(false)} className="flex-1 md:flex-none bg-black/5 dark:bg-white/5 text-neutral-500 font-bold text-[11px] px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-black/10 transition-all">Abort</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setTempModules([...modules]); setIsEditingModules(true); }} className="px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 text-[11px] font-bold uppercase text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all active:scale-95">Edit Labels</button>
                        <a href="https://notebooklm.google.com/notebook/6b628a58-9950-4fa9-918b-111fc6953777" target="_blank" className="flex-1 md:flex-none bg-purple-500 text-white font-bold text-[11px] px-8 py-3 rounded-xl shadow-lg hover:bg-purple-600 transition-all active:scale-95 uppercase tracking-widest text-center">Engage Vault</a>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(isEditingModules ? tempModules : modules).map((mod, i) => (
                    <div key={mod.id} className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2 transition-all hover:bg-black/10 active:scale-[0.98]">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase">M-0{mod.id}</span>
                      {isEditingModules ? (
                        <input type="text" value={mod.text} onChange={(e) => { const next = [...tempModules]; next[i].text = e.target.value; setTempModules(next); }} className="bg-white dark:bg-neutral-800 border border-amber-500/30 rounded-lg px-3 py-2 text-[13px] text-neutral-900 dark:text-white font-bold outline-none focus:ring-2 ring-amber-500/20" />
                      ) : (
                        <span className="text-[14px] text-neutral-800 dark:text-neutral-200 font-bold tracking-tight truncate">{mod.text}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* SECTOR 2: LEXICON & THESAURUS ENGINE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

              <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.2 }}
                whileHover={{ y: -4, boxShadow: '0 24px 56px rgb(0,0,0,0.08)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                className="lg:col-span-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-colors duration-700 cursor-default"
              >
                <div className="px-6 lg:px-8 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Lexicon & Thesaurus</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Uplink</span>
                  </div>
                </div>

                <div className="p-6 lg:p-8 space-y-8 flex-1 min-h-[500px]">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="Input token for synthesis..." value={lexiconQuery} onChange={(e) => setLexiconQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLexiconSearch()} className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 text-[15px] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium placeholder:text-neutral-400" />
                    <button onClick={handleLexiconSearch} className="bg-purple-500 text-white px-8 py-4 sm:py-0 rounded-2xl text-[11px] font-bold uppercase tracking-widest active:scale-95 shadow-md">Query</button>
                  </div>

                  <div className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-[24px] p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {lexiconData ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 border-b border-black/5 dark:border-white/10 pb-6">
                          <h3 className="text-[32px] lg:text-[42px] font-black text-neutral-900 dark:text-white tracking-tighter leading-none">{lexiconData.word}</h3>
                          <span className="text-[14px] lg:text-[16px] text-purple-600 dark:text-purple-400 font-bold italic tracking-wide">{lexiconData.phonetic}</span>
                        </div>

                        {/* Definitions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {lexiconData.meanings.slice(0, 2).map((meaning: any, idx: number) => (
                            <div key={idx} className="space-y-3">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 w-fit px-2.5 py-1 rounded-md">{meaning.partOfSpeech}</div>
                              <p className="text-[15px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">{meaning.definitions[0].definition}</p>
                            </div>
                          ))}
                        </div>

                        {/* THESAURUS SUB-SECTION */}
                        <div className="pt-6 border-t border-black/5 dark:border-white/10 space-y-6">
                          <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Thesaurus: Synonyms</h4>
                            <div className="flex flex-wrap gap-2">
                              {lexiconData.meanings[0].synonyms.length > 0 ? (
                                lexiconData.meanings[0].synonyms.slice(0, 8).map((syn: string) => (
                                  <button key={syn} onClick={() => { setLexiconQuery(syn); setTimeout(handleLexiconSearch, 50); }} className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-[13px] font-bold hover:bg-purple-500 hover:text-white transition-all active:scale-95 border border-transparent dark:border-purple-500/20">
                                    {syn}
                                  </button>
                                ))
                              ) : <span className="text-[13px] italic text-neutral-400">No primary synonyms found.</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                         <span className="text-4xl mb-4">📖</span>
                         <p className="text-[13px] font-bold uppercase tracking-[0.3em]">{searchError || 'Awaiting Linguistic Uplink'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* SIDE VAULTS */}
              <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.35 }}
                className="lg:col-span-4 flex flex-col gap-6 lg:gap-8"
              >
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 20px 48px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full cursor-default"
                >
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-6">Internal Vaults</h3>
                   <div className="space-y-4">
                      <DriveTile title="Mock Tests by Kaiau" icon="📝" url="https://drive.google.com/drive/folders/1vPEPiASm7gRVLuE-KJr0ce1094eI0CjE" />
                      <DriveTile title="IELTS Master Vault" icon="📂" url="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR" />
                   </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 20px 48px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full cursor-default"
                >
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-6">Practice Matrix</h3>
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: 'British', icon: '🇬🇧', url: 'https://takeielts.britishcouncil.org' },
                        { name: 'Cambridge', icon: '🏛️', url: 'https://www.cambridgeenglish.org' },
                        { name: 'Online', icon: '💻', url: 'https://ieltsonlinetests.com' },
                        { name: 'Liz', icon: '👩‍🏫', url: 'https://ieltsliz.com' },
                      ].map(site => (
                        <motion.a key={site.name} href={site.url} target="_blank"
                          whileHover={{ y: -4, scale: 1.04, boxShadow: '0 12px 28px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                          whileTap={{ scale: 0.96 }}
                          className="flex flex-col items-center justify-center p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl hover:bg-black/10 transition-colors group"
                        >
                          <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{site.icon}</span>
                          <span className="text-[10px] font-bold uppercase text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white tracking-tight text-center">{site.name}</span>
                        </motion.a>
                      ))}
                   </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* --- MOBILE NAVIGATION --- */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-2xl w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all shrink-0 group ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
               <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
               {item.active && <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">{item.name}</span>}
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
}

function DriveTile({ title, icon, url }: { title: string, icon: string, url: string }) {
  return (
    <motion.a
      href={url} target="_blank"
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 32px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-[20px] hover:bg-black/10 transition-colors group"
    >
      <div className="text-2xl group-hover:scale-110 transition-transform shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100 truncate">{title}</div>
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Uplink Active</div>
      </div>
    </motion.a>
  );
}