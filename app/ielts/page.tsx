'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  const [modules, setModules] = useState<Module[]>([
    { id: 1, text: 'Reading Strategies' },
    { id: 2, text: 'Listening Buffer' },
    { id: 3, text: 'Writing Framework' },
    { id: 4, text: 'Speaking Protocol' }
  ]);
  const [isEditingModules, setIsEditingModules] = useState(false);
  const [tempModules, setTempModules] = useState<Module[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedModules = localStorage.getItem('vest_ielts_modules');
    if (savedModules) setModules(JSON.parse(savedModules));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('vest_ielts_modules', JSON.stringify(modules));
  }, [modules, isLoaded]);

  const handleLexiconSearch = async () => {
    if (!lexiconQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setLexiconData(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lexiconQuery}`);
      const data = await response.json();
      if (response.ok && data.length > 0) setLexiconData(data[0]);
      else setSearchError('WORD_NOT_FOUND');
    } catch (e) { setSearchError('UPLINK_FAILURE'); }
    finally { setIsSearching(false); }
  };

  const commitModules = () => {
    setModules(tempModules);
    setIsEditingModules(false);
  };

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]', active: true },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentIndigo)]' },
  ];

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-[var(--accentViolet)]/5 rounded-full blur-[80px] lg:blur-[120px]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentViolet)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
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
              <span>LINGUISTIC_OS: <span className="text-statusGreen font-bold uppercase tracking-tighter">Nominal</span></span>
              <span>STATE: <span className={isEditingModules ? 'text-[var(--accentAmber)] animate-pulse' : 'text-[var(--accentViolet)] uppercase'}>{isEditingModules ? 'RECONFIGURING' : 'LOCKED'}</span></span>
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
              <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${item.active ? 'bg-[var(--accentViolet)]/10 border-[var(--accentViolet)]/20 font-bold' : 'hover:bg-surface'}`}>
                <span className={`text-[14px] transition-all ${item.active ? `${item.color} drop-shadow-[0_0_5px_currentColor]` : 'text-textMuted opacity-40 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={`text-[12px] tracking-tight ${item.active ? 'text-textPri' : 'text-textSec group-hover:text-textPri'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4"><Clock /></div>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 pb-24 lg:pb-8">
          
          {/* SECTOR 1: NOTEBOOK LM PORTAL */}
          <section className={`relative bg-surface/40 border rounded-[22px] p-6 lg:p-8 shadow-xl overflow-hidden group transition-all duration-500 ${isEditingModules ? 'border-[var(--accentAmber)]/50' : 'border-borderline'}`}>
            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[var(--accentViolet)]/10 rounded-full blur-[100px]"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
              <div className="flex items-center gap-4 lg:gap-5">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[20px] bg-base/50 border border-borderline flex items-center justify-center text-2xl lg:text-3xl shadow-inner group-hover:rotate-6 transition-transform">🎙️</div>
                <div>
                  <h2 className="font-orbitron font-black text-[16px] lg:text-[18px] text-textPri uppercase tracking-widest">NotebookLM IELTS Vault</h2>
                  <p className="text-[9px] lg:text-[10px] font-mono text-textMuted uppercase tracking-widest mt-1">
                    {isEditingModules ? '// RECONFIGURING LABELS' : 'AI-Synthesis Matrix Active'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 lg:gap-3 w-full md:w-auto">
                {isEditingModules ? (
                  <>
                    <button onClick={commitModules} className="flex-1 md:flex-none bg-[var(--statusGreen)] text-black font-black text-[9px] lg:text-[10px] px-4 lg:px-6 py-3 rounded-xl uppercase tracking-widest transition-all">Commit</button>
                    <button onClick={() => setIsEditingModules(false)} className="flex-1 md:flex-none border border-borderline text-textMuted font-black text-[9px] lg:text-[10px] px-4 lg:px-6 py-3 rounded-xl uppercase tracking-widest hover:text-textPri transition-all">Abort</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setTempModules([...modules]); setIsEditingModules(true); }} className="px-3 lg:px-4 py-3 rounded-xl border border-borderline text-[9px] lg:text-[10px] font-black uppercase text-textMuted hover:text-[var(--accentAmber)] transition-all whitespace-nowrap">Edit Matrix</button>
                    <a href="https://notebooklm.google.com/notebook/6b628a58-9950-4fa9-918b-111fc6953777" target="_blank" className="flex-1 md:flex-none bg-[var(--accentViolet)] text-white font-black text-[10px] lg:text-[11px] px-6 lg:px-8 py-3 rounded-xl shadow-[0_0_15px_var(--accentViolet)] transition-all uppercase tracking-[0.2em] text-center">Engage ↗</a>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-8 lg:mt-10 relative z-10">
              {(isEditingModules ? tempModules : modules).map((mod, i) => (
                <div key={mod.id} className="bg-base/40 border border-borderline rounded-xl p-3 lg:p-4 flex flex-col gap-1 lg:gap-2 relative overflow-hidden group/mod hover:border-[var(--accentViolet)]/50 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accentViolet)] opacity-20 group-hover/mod:opacity-100 transition-opacity"></div>
                  <span className="text-[8px] lg:text-[9px] text-[var(--accentViolet)] font-mono font-black tracking-widest uppercase">M_0{mod.id}</span>
                  {isEditingModules ? (
                    <input 
                      type="text" 
                      value={mod.text} 
                      onChange={(e) => {
                        const next = [...tempModules];
                        next[i].text = e.target.value;
                        setTempModules(next);
                      }}
                      className="bg-base border border-[var(--accentAmber)]/30 rounded px-2 py-1 text-[11px] lg:text-[13px] text-textPri font-bold outline-none"
                    />
                  ) : (
                    <span className="text-[11px] lg:text-[13px] text-textPri font-bold leading-tight truncate">{mod.text}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTOR 2: GRID WRAPPER FOR LEXICON & VAULTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* LEXICON TERMINAL */}
            <div className="lg:col-span-8 bg-surface/40 border border-borderline rounded-[22px] shadow-xl overflow-hidden flex flex-col">
              <div className="bg-base/80 px-5 lg:px-6 py-4 border-b border-borderline flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--accentViolet)] animate-pulse shadow-[0_0_8px_var(--accentViolet)]"></span>
                  <span className="font-mono text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-textPri">Lexicon Engine</span>
                </div>
              </div>
              <div className="p-6 lg:p-8 flex flex-col gap-6 flex-1 min-h-[400px]">
                <div className="flex gap-2 lg:gap-3">
                  <input 
                    type="text" 
                    placeholder="Input token..." 
                    value={lexiconQuery} 
                    onChange={(e) => setLexiconQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleLexiconSearch()} 
                    className="flex-1 bg-base/50 border border-borderline rounded-xl px-4 lg:px-5 py-3 lg:py-4 text-[12px] lg:text-[13px] text-textPri outline-none focus:border-[var(--accentViolet)]/50 transition-all font-mono" 
                  />
                  <button onClick={handleLexiconSearch} className="bg-[var(--accentViolet)]/10 border border-[var(--accentViolet)]/50 text-[var(--accentViolet)] px-4 lg:px-6 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Query</button>
                </div>
                <div className="bg-base/30 border border-borderline rounded-xl p-5 lg:p-6 flex-1 overflow-y-auto">
                  {lexiconData ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 lg:gap-4 border-b border-borderline pb-4">
                        <h3 className="text-2xl lg:text-3xl font-orbitron font-black text-textPri">{lexiconData.word}</h3>
                        <span className="text-[12px] lg:text-[14px] text-[var(--accentViolet)] font-mono tracking-widest uppercase">{lexiconData.phonetic}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {lexiconData.meanings.slice(0, 2).map((meaning: any, idx: number) => (
                           <div key={idx} className="space-y-2">
                             <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accentViolet)] bg-[var(--accentViolet)]/10 w-fit px-2 py-0.5 rounded">{meaning.partOfSpeech}</div>
                             <p className="text-[12px] lg:text-[13px] text-textSec leading-relaxed font-medium">{meaning.definitions[0].definition}</p>
                           </div>
                         ))}
                      </div>
                    </div>
                  ) : <div className="h-full flex items-center justify-center text-textMuted text-[9px] font-mono uppercase tracking-[0.4em] opacity-30 text-center px-4">{searchError || 'Awaiting Uplink...'}</div>}
                </div>
              </div>
            </div>

            {/* SIDE VAULTS */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8 pb-12 lg:pb-0">
              <div className="bg-surface/30 border border-borderline rounded-[22px] p-5 lg:p-6 shadow-xl">
                 <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-textMuted mb-5">Internal Vaults</div>
                 <div className="space-y-3">
                    <DriveTile title="Mock Tests by Kaiau" url="https://drive.google.com/drive/folders/1vPEPiASm7gRVLuE-KJr0ce1094eI0CjE" icon="📝" />
                    <DriveTile title="IELTS Master Vault" url="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR" icon="📂" />
                 </div>
              </div>
              <div className="bg-surface/30 border border-borderline rounded-[22px] p-5 lg:p-6 shadow-xl">
                 <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-textMuted mb-5">Practice Matrix</div>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'British', icon: '🇬🇧', url: 'https://takeielts.britishcouncil.org' },
                      { name: 'Cambridge', icon: '🏛️', url: 'https://www.cambridgeenglish.org' },
                      { name: 'Online', icon: '💻', url: 'https://ieltsonlinetests.com' },
                      { name: 'Liz', icon: '👩‍🏫', url: 'https://ieltsliz.com' },
                    ].map(site => (
                      <a key={site.name} href={site.url} target="_blank" className="flex flex-col items-center justify-center p-4 bg-base/40 border border-borderline rounded-xl hover:border-[var(--accentViolet)]/40 transition-all group">
                        <span className="text-xl lg:text-2xl mb-2 group-hover:scale-125 transition-transform">{site.icon}</span>
                        <span className="text-[8px] font-black uppercase text-textMuted group-hover:text-textPri tracking-tighter text-center">{site.name}</span>
                      </a>
                    ))}
                 </div>
              </div>
            </div>
          </div>
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
          <Link href="/identity" className="w-10 h-10 rounded-full bg-surface border border-borderline flex items-center justify-center text-[18px] text-[var(--accentCyan)]">
            ⚇
          </Link>
        </nav>

      </div>
    </div>
  );
}

function DriveTile({ title, url, icon }: { title: string, url: string, icon: string }) {
  return (
    <a href={url} target="_blank" className="flex items-center gap-3 lg:gap-4 p-4 bg-base/40 border border-borderline rounded-xl hover:border-[var(--accentViolet)]/30 transition-all group min-w-0">
      <div className="text-xl lg:text-2xl grayscale group-hover:grayscale-0 transition-all shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] lg:text-[13px] font-bold text-textPri truncate">{title}</div>
        <div className="text-[8px] lg:text-[9px] font-mono text-textMuted uppercase tracking-widest whitespace-nowrap">Cloud_Uplink</div>
      </div>
    </a>
  );
}