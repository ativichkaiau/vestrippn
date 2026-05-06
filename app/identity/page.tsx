'use client';

import Link from 'next/link';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';

export default function IdentityHub() {
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
            <Link href="/ielts" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all block">IELTS</Link>
            <Link href="/tools" className="md:pl-4 hover:text-accentCyan cursor-pointer transition-all hidden md:block">Tools & Links</Link>

            {/* ACTIVE: IDENTITY */}
            <div className="text-accentCyan cursor-pointer transition-all flex items-center gap-2 font-medium">
              <span className="text-[10px] hidden md:block">◉</span> Identity
            </div>
          </nav>
          
          <div className="hidden md:block border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* IDENTITY CONTENT: F1 COCKPIT */}
        <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-hidden bg-base">
          
          {/* HEADER SECTION */}
          <div className="flex justify-between items-end shrink-0 mb-2">
            <div>
              <h1 className="font-barlow text-[28px] text-textPri font-bold uppercase tracking-wide leading-none">Operator Profile</h1>
              <p className="text-[13px] text-textSec mt-1">Core Directives, Philosophy, and System Portfolio</p>
            </div>
            <div className="flex gap-3">
              <div className="text-[11px] font-mono text-[#06b6d4] border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-1 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full animate-pulse"></span>
                IDENTITY VERIFIED
              </div>
            </div>
          </div>

          {/* F1 MFD WRAPPER - ABSOLUTE DARK MODE ENFORCED */}
          <div className="group flex-1 bg-[#0a0a0a] border-4 border-[#1a1a1a] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative cursor-default">
            
            {/* RPM LED Strip */}
            <div className="h-4 bg-[#111] border-b border-[#222] flex justify-center items-center gap-1.5 px-4 pt-1 shrink-0">
              {[...Array(10)].map((_, i) => <div key={`g-${i}`} className="w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#22c55e] group-hover:shadow-[0_0_8px_rgba(34,197,94,0.8)]" style={{ transitionDelay: `${i * 30}ms` }}></div>)}
              {[...Array(4)].map((_, i) => <div key={`a-${i}`} className="w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#f59e0b] group-hover:shadow-[0_0_8px_rgba(245,158,11,0.8)]" style={{ transitionDelay: `${(i + 10) * 30}ms` }}></div>)}
              {[...Array(3)].map((_, i) => <div key={`r-${i}`} className="w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#ef4444] group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" style={{ transitionDelay: `${(i + 14) * 30}ms` }}></div>)}
              {[...Array(2)].map((_, i) => <div key={`b-${i}`} className="w-6 h-2 rounded-sm bg-[#222] transition-all duration-75 group-hover:bg-[#3b82f6] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ transitionDelay: `${(i + 17) * 30}ms` }}></div>)}
            </div>

            {/* THE DUAL-ZONE SCROLL MATRIX */}
            {/* Note: changed overflow-y-auto to lg:overflow-hidden on the parent, added scrolling to columns */}
            <div className="flex-1 w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8 relative z-20 overflow-y-auto lg:overflow-hidden">
              
              {/* LEFT COLUMN: THE MANIFESTO (Independent Scroll) */}
              <div className="flex-[0.35] flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-4 pb-4">
                
                {/* VESTRIPPN3POINT0 Profile */}
                <div className="bg-[#111] border border-[#222] rounded-lg p-5 shrink-0">
                  <h2 className="font-orbitron font-bold text-[22px] text-white tracking-widest uppercase mb-1">VESTRIPPN3POINT0</h2>
                  <div className="text-[12px] font-mono text-[#06b6d4] mb-4 flex flex-wrap gap-2">
                    <span className="bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">Medical student</span>
                    <span className="bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">Systems builder</span>
                    <span className="bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">Research operator</span>
                  </div>
                  <p className="text-gray-400 text-[13px] leading-relaxed italic border-l-2 border-[#333] pl-3 mb-4">
                    "Built through discipline, failure, adaptation, and relentless iteration."
                  </p>
                  <p className="text-gray-300 text-[13px] leading-relaxed">
                    This platform exists for one purpose: <strong className="text-white">To transform chaos into clarity.</strong> From academics to research, from fitness to leadership, every system here is designed around one principle:
                  </p>
                </div>

                {/* DAS SYSTEM */}
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#333] rounded-lg p-5 shadow-[0_0_20px_rgba(6,182,212,0.05)] relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/5 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="font-orbitron text-[20px] text-[#06b6d4] font-bold mb-1"># DAS SYSTEM</h3>
                  <div className="text-[11px] font-mono text-gray-500 mb-4 tracking-widest uppercase">Delegating Anticipatory Standards <span className="text-white">→</span> Dominating All Season.</div>
                  <p className="text-gray-400 text-[13px] leading-relaxed mb-4">
                    Not through burnout.<br/>
                    Not through panic.<br/>
                    Through <span className="text-white">structure, consistency, strategy,</span> and repeatable execution.
                  </p>
                  
                  <h4 className="text-[11px] font-mono text-white tracking-widest uppercase mb-2 border-b border-[#333] pb-1">Core Philosophy</h4>
                  <ul className="text-[12px] text-gray-400 space-y-1.5 font-mono list-disc pl-4">
                    <li><span className="text-gray-300">Strong days accumulate.</span></li>
                    <li>Systems outperform motivation.</li>
                    <li>Strategy beats raw firepower.</li>
                    <li>Calm execution under pressure.</li>
                    <li>Every setback contains data.</li>
                    <li>Optimization is an act of perseverance.</li>
                  </ul>
                </div>

                {/* MISSION & ORIGIN */}
                <div className="bg-[#111] border border-[#222] rounded-lg p-5 shrink-0">
                  <h4 className="text-[11px] font-mono text-[#f59e0b] tracking-widest uppercase mb-3 border-b border-[#333] pb-1">The Mission</h4>
                  <div className="text-[13px] text-gray-300 mb-4">
                    To become:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>a reliable doctor</li>
                      <li>a capable researcher</li>
                      <li>a disciplined leader</li>
                      <li>and a person who fully lives each day with intention.</li>
                    </ul>
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-5">
                    This website is not a showcase.<br/>It is a command center for continuous improvement.
                  </p>

                  <h4 className="text-[11px] font-mono text-[#22c55e] tracking-widest uppercase mb-3 border-b border-[#333] pb-1">Built From</h4>
                  <ul className="list-disc pl-5 text-[12px] text-gray-400 space-y-1 mb-5">
                    <li>Olympiad discipline</li>
                    <li>Medical school pressure</li>
                    <li>Leadership experience</li>
                    <li>Research ambition</li>
                    <li>Late-night failures</li>
                    <li>Early-morning recovery drives</li>
                  </ul>

                  <div className="bg-[#1a1a1a] border-l-2 border-[#06b6d4] p-3 text-[12px] text-white italic">
                    And above all:<br/>
                    "the decision to keep moving forward."
                  </div>
                </div>

                {/* FINAL DIRECTIVE */}
                <div className="text-center py-4 bg-[#111] border border-[#222] rounded-lg shrink-0">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 border-b border-[#333] pb-2 mx-4">FINAL DIRECTIVE</h4>
                  <div className="font-orbitron text-[14px] text-white tracking-[0.2em] mb-1">PLAN INTELLIGENTLY.</div>
                  <div className="font-orbitron text-[14px] text-white tracking-[0.2em] mb-1">EXECUTE CALMLY.</div>
                  <div className="font-orbitron text-[14px] text-white tracking-[0.2em] mb-3">ADAPT RELENTLESSLY.</div>
                  <div className="text-[#06b6d4] font-bold tracking-widest text-[14px]">#DASSystem 🏁</div>
                </div>

              </div>

              {/* RIGHT COLUMN: THE EXPANDED PORTFOLIO TELEMETRY (Independent Scroll) */}
              <div className="flex-[0.65] flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-4 pb-4">
                
                {/* 1. Science Olympiads */}
                <div className="bg-[#111] border border-[#222] rounded-lg p-5 shrink-0">
                  <h3 className="font-orbitron text-[15px] text-white mb-5 border-b border-[#333] pb-2 tracking-widest uppercase flex items-center gap-2">
                    <span className="text-2xl">🥴</span> Science Olympiads
                  </h3>
                  
                  <div className="space-y-4">
                    {/* IESO */}
                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded group hover:border-[#d97706] transition-colors relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-[#d97706]"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 pl-2 gap-2">
                        <div className="text-[14px] font-bold text-white leading-tight">16th International Earth Science Olympiad (IESO 2023)</div>
                        <div className="text-[10px] font-mono text-[#d97706] bg-[#d97706]/10 px-2 py-0.5 rounded whitespace-nowrap shrink-0 border border-[#d97706]/30">RANK: 72th GLOBALLY</div>
                      </div>
                      <div className="text-[13px] text-gray-300 pl-2 mt-2 leading-relaxed">
                        <span className="text-[#d97706] font-bold bg-[#d97706]/10 px-1 rounded">Bronze Medalist 🥉</span> in the following examinations:
                        <ul className="list-none space-y-1 mt-2 text-gray-400">
                          <li>1. Data Mining Test (DMT) 🥉</li>
                          <li>2. National Team Field Investigation (NTFI) 🥉</li>
                          <li>3. Earth System Project (ESP) 🥉</li>
                          <li>4. <strong className="text-gray-200">IESO Art in Earth Science</strong> 🥉</li>
                        </ul>
                      </div>
                    </div>

                    {/* TESO */}
                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded group hover:border-[#eab308] transition-colors relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-[#eab308]"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 pl-2 gap-2">
                        <div className="text-[14px] font-bold text-white leading-tight">3rd Thailand Earth Science Olympiad (TESO 2023)</div>
                        <div className="text-[10px] font-mono text-[#eab308] bg-[#eab308]/10 px-2 py-0.5 rounded whitespace-nowrap shrink-0 border border-[#eab308]/30">RANK: 2nd</div>
                      </div>
                      <div className="text-[13px] text-gray-300 pl-2 mt-2 leading-relaxed">
                        <span className="text-[#eab308] font-bold bg-[#eab308]/10 px-1 rounded">Gold Medalist 🥇</span> with the following special awards:
                        <ul className="list-none space-y-1 mt-2 text-gray-400">
                          <li>1. Best Earth System Project (ESP) Research Team 🏆</li>
                          <li>2. Highest Practical Test Scorer (Best Practical) 🏆</li>
                          <li>3. Highest Regional Student Scorer (Best Regional) 🏆</li>
                          <li className="text-gray-200 mt-2">4. Qualified to become the <strong className="text-white">Representative of Thailand</strong> to participate in the 16th International Earth Science Olympiad (IESO 2023)</li>
                        </ul>
                      </div>
                    </div>

                    {/* Astronomy Senior */}
                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded group hover:border-[#9ca3af] transition-colors relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-[#9ca3af]"></div>
                      <div className="text-[14px] font-bold text-white mb-3 pl-2">Thailand Astronomy Olympiad (Senior Division)</div>
                      <div className="text-[13px] text-gray-300 pl-2 space-y-4">
                        <div className="border-l border-[#333] pl-3">
                          <span className="text-[#9ca3af] font-bold bg-[#9ca3af]/10 px-1 rounded">Silver Medalist 🥈</span> (ranked 18th) in the senior division of the <strong>20th Thailand Astronomy Olympiad (20th TAO)</strong> to qualify for the International Olympiad on Astronomy and Astrophysics (IOAA).
                        </div>
                        <div className="border-l border-[#333] pl-3">
                          <span className="text-[#9ca3af] font-bold bg-[#9ca3af]/10 px-1 rounded">Silver Medalist 🥈</span> (ranked 14th) in the senior division of the <strong>19th Thailand Astronomy Olympiad (19th TAO)</strong> to qualify for the International Olympiad on Astronomy and Astrophysics (IOAA).
                        </div>
                      </div>
                    </div>

                    {/* Astronomy Junior */}
                    <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded group hover:border-[#eab308] transition-colors relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-[#eab308]"></div>
                      <div className="text-[14px] font-bold text-white mb-3 pl-2">Thailand Astronomy Olympiad (Junior Division)</div>
                      <div className="text-[13px] text-gray-300 pl-2 space-y-4">
                        <div className="border-l border-[#333] pl-3">
                          <span className="text-[#eab308] font-bold bg-[#eab308]/10 px-1 rounded">Gold Medalist 🥇</span> (ranked 4th) in the <strong>junior division of the 18th Thailand Astronomy Olympiad (18th TAO)</strong> to qualify for the International Astronomy Olympiad (IAO) with the following special awards:
                          <div className="mt-2 text-gray-400">
                            1. Qualified to become the <strong className="text-gray-200">Substitute Representative of Thailand</strong> to participate in the International Remote Astronomy Olympiad (IRAO 2021).
                          </div>
                        </div>
                        <div className="border-l border-[#333] pl-3">
                          <span className="text-[#d97706] font-bold bg-[#d97706]/10 px-1 rounded">Bronze Medalist 🥉</span> (ranked 24th) in the <strong>junior division of the 17th Thailand Astronomy Olympiad (17th TAO)</strong> to qualify for the International Astronomy Olympiad (IAO).
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* 2. Scientific Competitions */}
                <div className="bg-[#111] border border-[#222] rounded-lg p-5 shrink-0">
                  <h3 className="font-orbitron text-[15px] text-white mb-5 border-b border-[#333] pb-2 tracking-widest uppercase flex items-center gap-2">
                    <span className="text-2xl">😎</span> Scientifically-Related Competitions
                  </h3>
                  <div className="space-y-5">
                    <div className="border-l-2 border-[#06b6d4] pl-4">
                      <div className="text-[14px] font-bold text-white mb-1">YSC 2023 (2023 Young Scientist’s Competition) - Chemistry 🧪</div>
                      <div className="text-[13px] text-gray-300 space-y-1">
                        <div>to qualify for the <strong className="text-white">International Science and Engineering Fair (Regeneron ISEF 2023)</strong> 🏆</div>
                        <ul className="list-none text-gray-400 mt-2 space-y-1">
                          <li>- 🔖 1st Prize Project on the Regional Competition</li>
                          <li>- Honourable Mention Project on the National Competition</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-2 border-[#22c55e] pl-4">
                      <div className="text-[14px] font-bold text-white mb-1">TYSF 2023 (2023 Thailand Youth Science Fair) - Physics and Material Science ⚛️</div>
                      <div className="text-[13px] text-gray-300 space-y-1">
                        <div>to qualify for the <strong className="text-white">International Science and Engineering Fair (Regeneron ISEF 2024)</strong> 🥉</div>
                        <ul className="list-none text-gray-400 mt-2 space-y-1">
                          <li>- 🥉 Bronze Medal on the Regional Competition with a special award of:</li>
                          <li>- 🏆 Best Material Science Innovation Project</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-2 border-[#333] pl-4 text-[13px] text-gray-300 space-y-3 pt-2">
                      <div><strong className="text-white">Astro Challenge 2021</strong> - 🥉- 3rd Prize Winner</div>
                      <div><strong className="text-white">Junior Science Talent Project</strong> (24th Generation Alumni)</div>
                      <div><strong className="text-white">PM Science Award</strong> - Top 5 Project (National-level award)</div>
                      <div className="italic text-gray-500 font-mono text-[11px] mt-2">and other more small-scale awards.....</div>
                    </div>
                  </div>
                </div>

                {/* 3. English & University (Split Row) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                  
                  {/* English Proficiency Test */}
                  <div className="bg-[#111] border border-[#222] rounded-lg p-5">
                    <h3 className="font-orbitron text-[13px] text-white mb-4 border-b border-[#333] pb-2 tracking-widest uppercase flex items-center gap-2">
                      <span className="text-xl">🔖</span> English Proficiency Test
                    </h3>
                    <div className="space-y-4 text-[13px]">
                      <div>
                        <div className="text-white font-bold mb-1">IELTS Overall = <span className="text-[#06b6d4]">8.0</span></div>
                        <div className="text-gray-400 font-mono text-[11px] bg-[#1a1a1a] p-2 rounded border border-[#333]">
                          ( L8.5, R8.5, S7.5, W7 → avg. 7.875 ~ 8 )
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-white font-bold mb-1">BMAT (BioMedical Admissions Test)</div>
                        <div className="text-gray-400 font-mono text-[11px] bg-[#1a1a1a] p-2 rounded border border-[#333]">
                          Overall <span className="text-[#f59e0b] font-bold">14.0 A</span> ( Part1=4.6, Part2=6.4, Part3=3A )
                        </div>
                      </div>

                      <ul className="text-gray-300 space-y-2 border-t border-[#333] pt-3">
                        <li><strong className="text-white">Cambridge Assessments Test: PET</strong> (CEFR=B1) 168/170</li>
                        <li><strong className="text-white">Cambridge Assessments Test: KET</strong> (CEFR=A2) 170/170</li>
                        <li className="text-gray-400">🔖 - Honourable Mention at the Pet Yod Mongkut English Test (Junior Division)</li>
                        <li className="text-gray-400">🔖 - TGAT1 (English Part) 93.333/100</li>
                        <li className="italic text-gray-500 font-mono text-[10px] pt-1">and other more small-scale awards.....</li>
                      </ul>
                    </div>
                  </div>

                  {/* University Acceptance */}
                  <div className="bg-[#111] border border-[#222] rounded-lg p-5">
                    <h3 className="font-orbitron text-[13px] text-white mb-4 border-b border-[#333] pb-2 tracking-widest uppercase flex items-center gap-2">
                      <span className="text-xl">😁</span> University Acceptance
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded group hover:border-[#06b6d4] transition-colors">
                        <div className="text-[13px] font-bold text-white leading-tight mb-1">Faculty of Medicine, Chiang Mai University</div>
                        <div className="text-[11px] text-[#06b6d4] font-mono">(Portfolio Round, Olympiad (ตัวจริง))</div>
                      </div>
                      
                      <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded group hover:border-[#22c55e] transition-colors">
                        <div className="text-[13px] font-bold text-white leading-tight mb-1">Faculty of Medicine Siriraj Hospital, Mahidol University</div>
                        <div className="text-[11px] text-[#22c55e] font-mono">(Portfolio Round, Olympiad (ตัวจริง))</div>
                      </div>
                      
                      <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded group hover:border-[#f59e0b] transition-colors">
                        <div className="text-[13px] font-bold text-white leading-tight mb-1">Faculty of Medicine, Khon Kaen University</div>
                        <div className="text-[11px] text-[#f59e0b] font-mono">(Portfolio Round, MDX-1 (Interview-Round))</div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            <div className="h-2 bg-[#111] border-t border-[#333] shrink-0"></div>
          </div>
        </main>
      </div>
    </>
  );
}