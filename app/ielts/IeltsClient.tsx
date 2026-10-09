'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Action, Page, PageHeader } from '@/components/system/primitives';
import { useStoredValue, writeStored } from '@/components/system/useStoredValue';

interface Module { id: number; text: string; }

// dictionaryapi.dev response, the fields this page reads.
type LexiconEntry = {
  word: string;
  phonetic?: string;
  meanings: { partOfSpeech: string; definitions: { definition: string }[]; synonyms: string[] }[];
};

const MODULES_KEY = 'vest_ielts_modules_v3';
const MODULES_EVENT = 'vest:ielts-modules-change';
const DEFAULT_MODULES: Module[] = [
  { id: 1, text: 'Reading Strategies' },
  { id: 2, text: 'Listening' },
  { id: 3, text: 'Writing Framework' },
  { id: 4, text: 'Speaking' },
];
function readModules(): Module[] {
  const saved = localStorage.getItem(MODULES_KEY);
  const parsed: unknown = saved ? JSON.parse(saved) : null;
  return Array.isArray(parsed) ? (parsed as Module[]) : DEFAULT_MODULES;
}

export default function IELTSHub() {
  const [lexiconQuery, setLexiconQuery] = useState('');
  const [lexiconData, setLexiconData] = useState<LexiconEntry | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const modules = useStoredValue(readModules, DEFAULT_MODULES, [MODULES_EVENT]);
  const [isEditingModules, setIsEditingModules] = useState(false);
  const [tempModules, setTempModules] = useState<Module[]>([]);

  const handleLexiconSearch = async (word = lexiconQuery) => {
    const query = word.trim();
    if (!query) return;
    setIsSearching(true);
    setSearchError('');
    setLexiconData(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
      const data = await response.json();
      if (response.ok && data.length > 0) setLexiconData(data[0]);
      else setSearchError('TOKEN_NOT_FOUND');
    } catch { setSearchError('SEARCH_UNAVAILABLE'); }
    finally { setIsSearching(false); }
  };

  const commitModules = () => {
    writeStored(MODULES_KEY, tempModules, MODULES_EVENT);
    setIsEditingModules(false);
  };

  return (
    <Page wide hub>
      <PageHeader
        label="runtime / personal"
        title="IELTS"
        lede="Preparation modules and practice for IELTS Academic."
        actions={<Action href="/learn/ielts">practice questions</Action>}
      />
            



            {/* SECTOR 1: AI VAULT PORTAL */}
            <div id="ielts-vault" className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">NotebookLM</h3>
              </div>
              <motion.section
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
                className={`bg-white/60 dark:bg-white/5 border rounded-md p-6 lg:p-8 cursor-default ${isEditingModules ? 'border-amber-500/30 ring-4 ring-amber-500/5' : 'border-black/5 dark:border-white/5'}`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl shadow-sm transition-colors duration-700">🎙️</div>
                    <div>
                      <h2 className="font-black text-[18px] lg:text-[20px] text-neutral-900 dark:text-white tracking-tight">NotebookLM Integration</h2>
                      <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
                        {isEditingModules ? 'editing modules' : 'IELTS notebook'}
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
                        <a href="https://notebooklm.google.com/notebook/6b628a58-9950-4fa9-918b-111fc6953777" target="_blank" className="flex-1 md:flex-none bg-purple-500 text-white font-bold text-[11px] px-8 py-3 rounded-xl shadow-lg hover:bg-purple-600 transition-all active:scale-95 uppercase tracking-widest text-center">Open notebook ↗</a>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(isEditingModules ? tempModules : modules).map((mod, i) => (
                    <div key={mod.id} className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2 transition-all hover:bg-black/10 active:scale-[0.98]">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase">M-0{mod.id}</span>
                      {isEditingModules ? (
                        <input type="text" value={mod.text} onChange={(e) => { const text = e.target.value; setTempModules(tempModules.map((m, j) => (j === i ? { ...m, text } : m))); }} className="bg-white dark:bg-neutral-800 border border-amber-500/30 rounded-lg px-3 py-2 text-[13px] text-neutral-900 dark:text-white font-bold outline-none focus:ring-2 ring-amber-500/20" />
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
                className="lg:col-span-8 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-md overflow-hidden flex flex-col transition-colors duration-700 cursor-default"
              >
                <div className="px-6 lg:px-8 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Lexicon & Thesaurus</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                     <span className="text-[10px] font-bold uppercase tracking-widest">dictionary</span>
                  </div>
                </div>

                <div className="p-6 lg:p-8 space-y-8 flex-1 min-h-[500px]">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="look up a word…" value={lexiconQuery} onChange={(e) => setLexiconQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLexiconSearch()} className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 text-[15px] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium placeholder:text-neutral-400" />
                    <button onClick={() => handleLexiconSearch()} disabled={isSearching} aria-busy={isSearching} className="disabled:opacity-60 bg-purple-500 text-white px-8 py-4 sm:py-0 rounded-2xl text-[11px] font-bold uppercase tracking-widest active:scale-95 shadow-md">{isSearching ? 'Searching…' : 'Query'}</button>
                  </div>

                  <div className="bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-md p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {lexiconData ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 border-b border-black/5 dark:border-white/10 pb-6">
                          <h3 className="text-[32px] lg:text-[42px] font-black text-neutral-900 dark:text-white tracking-tighter leading-none">{lexiconData.word}</h3>
                          <span className="text-[14px] lg:text-[16px] text-purple-600 dark:text-purple-400 font-bold italic tracking-wide">{lexiconData.phonetic}</span>
                        </div>

                        {/* Definitions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {lexiconData.meanings.slice(0, 2).map((meaning, idx) => (
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
                                  <button key={syn} onClick={() => { setLexiconQuery(syn); void handleLexiconSearch(syn); }} className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-[13px] font-bold hover:bg-purple-500 hover:text-white transition-all active:scale-95 border border-transparent dark:border-purple-500/20">
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
                         <p className="text-[13px] font-bold uppercase tracking-[0.3em]">{searchError || 'no word looked up yet'}</p>
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
                  className="bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-md p-6 lg:p-8 h-full cursor-default"
                >
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-6">Internal Vaults</h3>
                   <div className="space-y-4">
                      <DriveTile title="Mock Tests by Kaiau" icon="📝" url="https://drive.google.com/drive/folders/1vPEPiASm7gRVLuE-KJr0ce1094eI0CjE" />
                      <DriveTile title="IELTS Master Vault" icon="📂" url="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR" />
                   </div>
                </motion.div>

                <motion.div
                  className="bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-md p-6 lg:p-8 h-full cursor-default"
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
    </Page>
  );
}

function DriveTile({ title, icon, url }: { title: string, icon: string, url: string }) {
  return (
    <motion.a
      href={url} target="_blank"
      className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-md hover:bg-black/10 transition-colors group"
    >
      <div className="text-2xl group-hover:scale-110 transition-transform shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100 truncate">{title}</div>
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Google Drive</div>
      </div>
    </motion.a>
  );
}
