'use client';

import Link from 'next/link';
import { useState } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';

export default function IELTSHub() {
  // Lexicon Engine (Dictionary & Thesaurus) State
  const [lexiconQuery, setLexiconQuery] = useState('');
  const [lexiconData, setLexiconData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch from Free Dictionary API
  const handleLexiconSearch = async () => {
    if (!lexiconQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setLexiconData(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lexiconQuery}`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        setLexiconData(data[0]);
      } else {
        setSearchError('Word not found in the database.');
      }
    } catch (error) {
      setSearchError('Network error. Unable to connect to lexical servers.');
    } finally {
      setIsSearching(false);
    }
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
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-borderline flex flex-row md:flex-col justify-between p-4 md:p-6 shrink-0 overflow-x-auto md:overflow-hidden bg-base z-10">
          <nav className="flex flex-row md:flex-col gap-6 md:gap-4 text-[13px] text-textSec items-center md:items-start whitespace-nowrap">
            <Link href="/" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Dashboard</Link>
            <Link href="/academics" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Academics</Link>
            <Link href="/research" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Research</Link>
            <Link href="/fitness" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Fitness & Diet</Link>
            <Link href="/archive" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">Archive</Link>

            {/* ACTIVE: IELTS */}
            <div className="text-accentCyan cursor-pointer transition-all flex items-center gap-2 font-medium">
              <span className="text-[10px] hidden md:block">◉</span> IELTS
            </div>

           <Link href="/tools" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Tools & Links</Link>
           <Link href="/identity" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block"> Identity </Link>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* IELTS CONTENT */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto overflow-x-hidden bg-base">
          
          {/* HEADER SECTION */}
          <div className="flex justify-between items-end shrink-0">
            <div>
              <h1 className="font-barlow text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Linguistic Command</h1>
              <p className="text-[13px] text-textSec mt-1">IELTS Certification & English Proficiency Engine</p>
            </div>
            <div className="text-[11px] font-mono text-accentCyan border border-accentCyan/30 bg-accentCyan/10 px-3 py-1 rounded">
              SYSTEM: NOMINAL
            </div>
          </div>

          {/* NOTEBOOK LM PORTAL (The Hero Card) */}
          <div className="relative bg-surface border border-accentCyan/40 rounded-lg p-6 shadow-[0_0_20px_rgba(6,182,212,0.05)] overflow-hidden flex flex-col gap-4 shrink-0">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accentCyan/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-base border border-borderline flex items-center justify-center text-xl">🎙️</div>
                <div>
                  <h2 className="font-barlow font-bold text-[16px] text-textPri uppercase tracking-wide">NotebookLM IELTS Vault</h2>
                  <p className="text-[11px] text-textSec">AI-Powered Synthesis for Writing & Speaking Tasks</p>
                </div>
              </div>
              <a 
                href="https://notebooklm.google.com/notebook/6b628a58-9950-4fa9-918b-111fc6953777" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accentCyan text-base font-bold text-[12px] px-6 py-2.5 rounded hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Launch Main Engine ↗
              </a>
            </div>

            {/* Quick Summary/Sub-links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 relative z-10">
              <div className="bg-base border border-accentCyan/50 rounded p-3 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accentCyan"></div>
                <span className="text-[10px] text-accentCyan font-mono pl-2 tracking-widest">MODULE 1</span>
                <span className="text-[13px] text-textPri font-medium leading-tight pl-2 mt-1">Reading Strategies</span>
              </div>
              <div className="bg-base border border-accentCyan/50 rounded p-3 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accentCyan"></div>
                <span className="text-[10px] text-accentCyan font-mono pl-2 tracking-widest">MODULE 2</span>
                <span className="text-[13px] text-textPri font-medium leading-tight pl-2 mt-1">Listening Transcripts</span>
              </div>
              <div className="bg-base border border-accentCyan/50 rounded p-3 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accentCyan"></div>
                <span className="text-[10px] text-accentCyan font-mono pl-2 tracking-widest">MODULE 3</span>
                <span className="text-[13px] text-textPri font-medium leading-tight pl-2 mt-1">Writing Task 1 & 2</span>
              </div>
              <div className="bg-base border border-accentCyan/50 rounded p-3 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accentCyan"></div>
                <span className="text-[10px] text-accentCyan font-mono pl-2 tracking-widest">MODULE 4</span>
                <span className="text-[13px] text-textPri font-medium leading-tight pl-2 mt-1">Speaking Frameworks</span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="flex flex-col lg:flex-row gap-6 shrink-0 mb-6">
            
            {/* Left Column: Local Archives & Dictionary */}
            <div className="flex-[0.6] flex flex-col gap-6">
              
              {/* Core Archives */}
              <div>
                <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec border-b border-borderline pb-2 mb-4">
                  Internal Storage Vaults
                </div>
                
                <div className="flex flex-col gap-3">
                  <a href="https://drive.google.com/drive/folders/1vPEPiASm7gRVLuE-KJr0ce1094eI0CjE?usp=sharing" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded-lg p-4 flex items-center justify-between hover:border-accentCyan/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">📝</span>
                      <div>
                        <div className="text-[14px] font-bold text-textPri">Mock Tests by Kaiau</div>
                        <div className="text-[11px] text-textSec">Personalized practice exams & grading</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-accentCyan font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">ACCESS ↗</span>
                  </a>

                  <a href="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR?usp=share_link" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded-lg p-4 flex items-center justify-between hover:border-accentCyan/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">📂</span>
                      <div>
                        <div className="text-[14px] font-bold text-textPri">IELTS Master GG Drive</div>
                        <div className="text-[11px] text-textSec">Compiled PDFs, Audio Files & Frameworks</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-accentCyan font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">ACCESS ↗</span>
                  </a>
                </div>
              </div>

              {/* Lexicon Engine (Dictionary/Thesaurus) */}
              <div className="bg-surface border border-borderline rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="bg-[#111] px-5 py-3 border-b border-borderline flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse"></span>
                  <span className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textPri">Lexicon Engine</span>
                  <span className="text-[10px] font-mono text-textMuted ml-auto">DICTIONARY_API_V2</span>
                </div>
                
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter word to define..."
                      value={lexiconQuery}
                      onChange={(e) => setLexiconQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLexiconSearch()}
                      className="flex-1 bg-base border border-borderline rounded px-4 py-2 text-[13px] text-textPri outline-none focus:border-accentCyan/50 transition-colors font-mono"
                    />
                    <button 
                      onClick={handleLexiconSearch}
                      disabled={isSearching}
                      className="bg-accentCyan/10 border border-accentCyan/50 text-accentCyan px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-accentCyan/20 transition-all disabled:opacity-50"
                    >
                      {isSearching ? '...' : 'QUERY'}
                    </button>
                  </div>

                  {/* Results Display */}
                  <div className="bg-base border border-borderline rounded p-4 min-h-[150px] overflow-y-auto">
                    {searchError && (
                      <div className="text-accentAmber text-[12px] font-mono">{searchError}</div>
                    )}
                    
                    {!lexiconData && !searchError && !isSearching && (
                      <div className="text-textMuted text-[11px] font-mono flex h-full items-center justify-center opacity-50">
                        Awaiting input query...
                      </div>
                    )}

                    {lexiconData && (
                      <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-xl font-bold text-textPri">{lexiconData.word}</h3>
                          {lexiconData.phonetic && <span className="text-[13px] text-accentCyan font-mono">{lexiconData.phonetic}</span>}
                        </div>

                        {lexiconData.meanings.slice(0, 2).map((meaning: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-textMuted font-bold border-b border-borderline pb-1 mb-1">
                              {meaning.partOfSpeech}
                            </span>
                            <p className="text-[13px] text-textSec leading-relaxed">
                              1. {meaning.definitions[0].definition}
                            </p>
                            
                            {/* Thesaurus / Synonyms */}
                            {meaning.synonyms && meaning.synonyms.length > 0 && (
                              <div className="mt-2 text-[11px]">
                                <span className="text-textMuted">Synonyms: </span>
                                <span className="text-accentCyan">{meaning.synonyms.slice(0, 5).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: External Databases */}
            <div className="flex-[0.4] flex flex-col gap-4">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec border-b border-borderline pb-2">
                External Practice Matrix
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                {/* Official Sources */}
                <a href="https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🇬🇧</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">British Council</div>
                </a>
                <a href="https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🏛️</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Cambridge Eng</div>
                </a>
                
                {/* Mock Tests */}
                <a href="https://ieltsonlinetests.com/" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">💻</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Online Tests</div>
                </a>
                <a href="https://ieltsliz.com/" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">👩‍🏫</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">IELTS Liz</div>
                </a>

                {/* Additional Practice */}
                <a href="https://www.ieltsadvantage.com/" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">📈</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Advantage</div>
                </a>
                <a href="https://ielts-simon.study/" target="_blank" rel="noopener noreferrer" className="bg-surface border border-borderline rounded p-4 text-center hover:border-accentCyan/50 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🧠</div>
                  <div className="text-[10px] font-bold text-textPri uppercase tracking-wider">Simon Study</div>
                </a>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}