'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

export default function IdentityHub() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  if (!isLoaded) return null;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', color: 'text-[var(--accentCyan)]' },
    { name: 'Academics', icon: '▲', href: '/academics', color: 'text-[var(--accentFuchsia)]' },
    { name: 'Research', icon: '◆', href: '/research', color: 'text-[var(--accentAmber)]' },
    { name: 'Fitness', icon: '◈', href: '/fitness', color: 'text-[var(--accentEmerald)]' },
    { name: 'Archive', icon: '▥', href: '/archive', color: 'text-textSec' },
    { name: 'IELTS', icon: '◎', href: '/ielts', color: 'text-[var(--accentViolet)]' },
    { name: 'Tools', icon: '⚙', href: '/tools', color: 'text-[var(--accentIndigo)]' },
    { name: 'Identity', icon: '⚇', href: '/identity', color: 'text-[var(--accentCyan)]', active: true },
  ];

  return (
    <div className="h-screen flex flex-col bg-base text-textPri relative overflow-hidden transition-colors duration-500">
      
      {/* HUD ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accentCyan)]/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accentCyan)]/20 to-transparent absolute top-0 animate-scanline opacity-40"></div>
      </div>

      {/* --- HUD HEADER --- */}
      <header className="h-[56px] lg:h-[64px] border-b border-borderline flex items-center justify-between px-4 lg:px-6 shrink-0 bg-base/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="font-orbitron font-black text-[15px] lg:text-[18px] tracking-[0.2em] flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-1 h-4 lg:w-1.5 lg:h-5 bg-[var(--accentCyan)] shadow-[0_0_12px_var(--accentCyan)]"></div>
            <span>VEST<span className="text-[var(--accentCyan)]">3.0</span></span>
          </Link>
          <div className="hidden lg:flex gap-4 border-l border-borderline pl-6 font-mono text-[9px] uppercase tracking-widest text-textMuted">
            <div className="flex flex-col">
              <span>OPERATOR_ID: <span className="text-statusGreen font-bold uppercase">Authorized</span></span>
              <span>THEME_LOCK: <span className="text-[var(--accentAmber)] uppercase">Night_MFD_Enforced</span></span>
            </div>
          </div>
        </div>
        <div className="hidden sm:block font-mono text-[10px] lg:text-[11px] tracking-[0.2em] text-textPri uppercase"><ArcDate /></div>
        <div className="flex gap-3 lg:gap-4 items-center">
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:flex w-[230px] border-r border-borderline flex flex-col justify-between p-5 bg-surface/20 shrink-0 backdrop-blur-md">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group border border-transparent ${item.active ? 'bg-[var(--accentCyan)]/10 border-[var(--accentCyan)]/20 font-bold' : 'hover:bg-surface'}`}>
                <span className={`text-[14px] transition-all ${item.active ? `${item.color} drop-shadow-[0_0_5px_currentColor]` : 'text-textMuted opacity-40 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={`text-[12px] tracking-tight ${item.active ? 'text-textPri' : 'text-textSec group-hover:text-textPri'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 rounded-2xl bg-surface border border-borderline mt-4"><Clock /></div>
        </aside>

        {/* --- MAIN HUD: THE IDENTITY MFD (Absolute Dark Mode) --- */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto lg:overflow-hidden bg-base pb-24 lg:pb-6">
          
          <div className="group flex-1 bg-[#05070a] border border-white/10 rounded-[22px] shadow-2xl flex flex-col overflow-hidden relative min-h-[800px] lg:min-h-0">
            
            {/* RPM LED STRIP */}
            <div className="h-4 bg-[#0a0a0a] border-b border-white/5 flex justify-center items-center gap-1 lg:gap-1.5 px-2 lg:px-4 pt-1 shrink-0">
               {[...Array(8)].map((_, i) => <div key={`g-${i}`} className="flex-1 lg:w-6 h-1.5 rounded-full bg-white/5 transition-all group-hover:bg-[var(--statusGreen)] group-hover:shadow-[0_0_8px_var(--statusGreen)]" style={{ transitionDelay: `${i * 20}ms` }}></div>)}
               {[...Array(3)].map((_, i) => <div key={`a-${i}`} className="flex-1 lg:w-6 h-1.5 rounded-full bg-white/5 transition-all group-hover:bg-[var(--accentAmber)] group-hover:shadow-[0_0_8px_var(--accentAmber)]" style={{ transitionDelay: `${(i+8) * 20}ms` }}></div>)}
               {[...Array(2)].map((_, i) => <div key={`r-${i}`} className="flex-1 lg:w-6 h-1.5 rounded-full bg-white/5 transition-all group-hover:bg-[var(--statusRed)] group-hover:shadow-[0_0_8px_var(--statusRed)]" style={{ transitionDelay: `${(i+11) * 20}ms` }}></div>)}
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
              
              {/* LEFT ZONE: OPERATOR MANIFESTO (Hardcoded Dark) */}
              <div className="w-full lg:flex-[0.32] flex flex-col gap-6 p-6 lg:p-8 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-white/5 bg-[#07090d] shrink-0">
                <div className="space-y-2 mb-2">
                  <h2 className="font-orbitron font-black text-[22px] lg:text-[26px] !text-white tracking-[0.2em] uppercase">VESTRIPPN 3.0</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] lg:text-[10px] font-mono font-bold px-2 py-0.5 bg-[var(--accentCyan)]/20 border border-[var(--accentCyan)]/40 !text-[var(--accentCyan)] rounded">MED_STUDENT</span>
                    <span className="text-[9px] lg:text-[10px] font-mono font-bold px-2 py-0.5 bg-white/5 border border-white/10 !text-slate-400 rounded uppercase">SYSTEMS_OP</span>
                  </div>
                </div>

                <div className="p-5 lg:p-6 bg-white/[0.03] border border-white/10 rounded-xl space-y-4">
                   <div className="text-[10px] font-mono !text-[var(--accentCyan)] font-bold uppercase tracking-[0.3em]"># DAS_SYSTEM_v3</div>
                   <p className="text-[12px] lg:text-[13px] !text-slate-200 leading-relaxed italic">"Transforming chaos into clarity through discipline, failure, adaptation, and relentless iteration."</p>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-mono !text-[var(--accentAmber)] uppercase tracking-[0.4em] border-b border-white/5 pb-2">Institutional_Station</h4>
                   <div className="space-y-2">
                      <div className="p-3 lg:p-4 bg-[var(--statusGreen)]/10 border border-[var(--statusGreen)]/30 rounded-xl">
                        <div className="text-[11px] lg:text-[12px] font-bold !text-white uppercase leading-tight">Faculty of Medicine, CMU</div>
                        <div className="text-[9px] font-mono !text-[var(--statusGreen)] mt-1 uppercase">Portfolio // Olympiad (ตัวจริง)</div>
                      </div>
                      <div className="p-3 lg:p-4 bg-white/[0.03] border border-white/10 rounded-xl opacity-60">
                        <div className="text-[11px] lg:text-[12px] font-bold !text-white uppercase leading-tight">Medicine Siriraj, Mahidol</div>
                        <div className="text-[9px] font-mono !text-slate-400 mt-1 uppercase">Portfolio // Olympiad (ตัวจริง)</div>
                      </div>
                      <div className="p-3 lg:p-4 bg-white/[0.03] border border-white/10 rounded-xl opacity-60">
                        <div className="text-[11px] lg:text-[12px] font-bold !text-white uppercase leading-tight">Medicine, Khon Kaen</div>
                        <div className="text-[9px] font-mono !text-slate-400 mt-1 uppercase">MDX-1 (Interview)</div>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 text-center hidden lg:block">
                   <div className="text-[9px] font-mono !text-white/20 uppercase tracking-[0.5em] mb-4">Final Directive</div>
                   <div className="font-orbitron text-[13px] lg:text-[14px] font-black !text-white tracking-[0.2em] space-y-1">
                      <div>PLAN INTELLIGENTLY</div>
                      <div>EXECUTE CALMLY</div>
                      <div className="!text-[var(--accentCyan)]">ADAPT RELENTLESSLY</div>
                   </div>
                </div>
              </div>

              {/* RIGHT ZONE: DATA MATRIX (ACHIEVEMENTS + LEGENDS) */}
              <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-white/[0.01]">
                
                {/* Sector A: Science Olympiads */}
                <h3 className="font-mono text-[10px] lg:text-[11px] font-bold !text-[var(--accentAmber)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-[var(--accentAmber)] shadow-[0_0_8px_var(--accentAmber)]"></div>
                  Sector Alpha: Science Olympiads 🥴
                </h3>

                <div className="space-y-4 mb-12">
                   <AchievementNode 
                     title="16th International Earth Science Olympiad (IESO 2023)" 
                     rank="RANK_72nd GLOBAL" 
                     medal="BRONZE MEDALIST 🥉" 
                     color="var(--accentAmber)"
                     details={[
                       "Bronze Medalist (ranked 72th globally) in the 16th International Earth Science Olympiad (IESO 2023)",
                       "1. Data Mining Test (DMT) 🥉",
                       "2. National Team Field Investigation (NTFI) 🥉",
                       "3. Earth System Project (ESP) 🥉",
                       "4. IESO Art in Earth Science 🥉"
                     ]}
                   />
                   <AchievementNode 
                     title="3rd Thailand Earth Science Olympiad (TESO 2023)" 
                     rank="RANK_2nd NATIONAL" 
                     medal="GOLD MEDALIST 🥇" 
                     color="var(--statusGreen)"
                     details={[
                       "Gold Medalist (ranked 2nd) in the 3rd Thailand Earth Science Olympiad (TESO 2023)",
                       "1. Best Earth System Project (ESP) Research Team 🏆",
                       "2. Highest Practical Test Scorer (Best Practical) 🏆",
                       "3. Highest Regional Student Scorer (Best Regional) 🏆",
                       "4. Qualified to become the Representative of Thailand for IESO 2023"
                     ]}
                   />
                   <AchievementNode 
                     title="Thailand Astronomy Olympiad (TAO Senior)" 
                     rank="19th & 20th TAO" 
                     medal="SILVER MEDALIST 🥈" 
                     color="var(--textMuted)"
                     details={[
                       "Silver Medalist 🥈 (ranked 14th) in the senior division of the 19th TAO to qualify for IOAA",
                       "Silver Medalist 🥈 (ranked 18th) in the senior division of the 20th TAO to qualify for IOAA"
                     ]}
                   />
                   <AchievementNode 
                     title="18th Thailand Astronomy Olympiad (TAO Junior)" 
                     rank="RANK_4th NATIONAL" 
                     medal="GOLD MEDALIST 🥇" 
                     color="var(--statusGreen)"
                     details={[
                       "Gold Medalist 🥇 (ranked 4th) in the junior division of the 18th TAO to qualify for IAO",
                       "1. Qualified to become the Substitute Representative of Thailand to participate in IRAO 2021"
                     ]}
                   />
                   <AchievementNode 
                     title="17th Thailand Astronomy Olympiad (TAO Junior)" 
                     rank="RANK_24th NATIONAL" 
                     medal="BRONZE MEDALIST 🥉" 
                     color="var(--accentAmber)"
                     details={["Bronze Medalist 🥉 (ranked 24th) in the junior division of the 17th TAO to qualify for IAO"]}
                   />
                </div>

                {/* Sector B: Scientific Competitions */}
                <h3 className="font-mono text-[10px] lg:text-[11px] font-bold !text-[var(--accentFuchsia)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-[var(--accentFuchsia)] shadow-[0_0_8px_var(--accentFuchsia)]"></div>
                  Sector Beta: Scientific Competitions 😎
                </h3>

                <div className="space-y-4 mb-12">
                   <AchievementNode 
                     title="YSC 2023 (Young Scientist’s Competition) - Chemistry" 
                     rank="ISEF QUALIFIER" 
                     medal="REGIONAL 1st PRIZE 🏆" 
                     color="var(--accentFuchsia)"
                     details={[
                       "Chemistry 🧪 to qualify for the International Science and Engineering Fair (Regeneron ISEF 2023) 🏆",
                       "1st Prize Project on the Regional Competition 🔖",
                       "Honourable Mention Project on the National Competition"
                     ]}
                   />
                   <AchievementNode 
                     title="TYSF 2023 (Thailand Youth Science Fair)" 
                     rank="ISEF QUALIFIER" 
                     medal="BRONZE / BEST INNOVATION 🥉" 
                     color="var(--accentAmber)"
                     details={[
                       "Physics and Material Science ⚛️ to qualify for the Regeneron ISEF 2024 🥉",
                       "Bronze Medal on the Regional Competition",
                       "Special Award: Best Material Science Innovation Project 🏆"
                     ]}
                   />
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                        <div className="text-[8px] font-mono !text-[var(--accentAmber)] mb-1 uppercase font-black tracking-tighter">Astro Challenge 2021</div>
                        <div className="text-[12px] font-bold !text-white">3rd Prize Winner 🥉</div>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                        <div className="text-[8px] font-mono !text-slate-400 mb-1 uppercase font-black tracking-tighter">Alumni Node</div>
                        <div className="text-[12px] font-bold !text-white">JSTP 24th Gen</div>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                        <div className="text-[8px] font-mono !text-[var(--statusGreen)] mb-1 uppercase font-black tracking-tighter">PM Science Award</div>
                        <div className="text-[12px] font-bold !text-white">Top 5 Project</div>
                      </div>
                   </div>
                </div>

                {/* Sector C: Proficiency Telemetry */}
                <h3 className="font-mono text-[10px] lg:text-[11px] font-bold !text-[var(--accentCyan)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-[var(--accentCyan)] shadow-[0_0_8px_var(--accentCyan)]"></div>
                  Sector Gamma: Proficiency Telemetry 🔖
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                   <div className="p-5 lg:p-6 bg-white/[0.03] border border-[var(--accentCyan)]/30 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 font-orbitron text-[28px] lg:text-[32px] font-black !text-[var(--accentCyan)] opacity-20">8.0</div>
                      <div className="text-[12px] lg:text-[13px] font-black !text-white uppercase mb-3 tracking-widest">IELTS Overall</div>
                      <div className="text-[10px] lg:text-[11px] font-mono !text-slate-400 uppercase tracking-tighter">(L8.5, R8.5, S7.5, W7 → avg. 7.875)</div>
                   </div>
                   <div className="p-5 lg:p-6 bg-white/[0.03] border border-[var(--accentAmber)]/30 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 font-orbitron text-[28px] lg:text-[32px] font-black !text-[var(--accentAmber)] opacity-20">14.0A</div>
                      <div className="text-[12px] lg:text-[13px] font-black !text-white uppercase mb-3 tracking-widest">BMAT Overall</div>
                      <div className="text-[10px] lg:text-[11px] font-mono !text-slate-400 uppercase tracking-tighter">(Part1=4.6, Part2=6.4, Part3=3A)</div>
                   </div>
                   <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-center">
                        <div className="text-[8px] font-mono !text-slate-500 uppercase mb-1">PET (B1)</div>
                        <div className="text-[14px] lg:text-[16px] font-bold !text-white font-orbitron">168/170</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-center">
                        <div className="text-[8px] font-mono !text-slate-500 uppercase mb-1">KET (A2)</div>
                        <div className="text-[14px] lg:text-[16px] font-bold !text-white font-orbitron">170/170</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-center">
                        <div className="text-[8px] font-mono !text-slate-500 uppercase mb-1">TGAT1 (Eng)</div>
                        <div className="text-[14px] lg:text-[16px] font-bold !text-white font-orbitron">93.33/100</div>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-center flex items-center justify-center">
                        <div className="text-[8px] font-mono !text-[var(--accentCyan)] font-black uppercase leading-tight">Pet Yod Mongkut Hon. Mention</div>
                      </div>
                   </div>
                </div>

                {/* Sector D: Archetype Archive (F1 LEGENDS) */}
                <h3 className="font-mono text-[10px] lg:text-[11px] font-bold !text-[var(--statusRed)] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-[var(--statusRed)] shadow-[0_0_8px_var(--statusRed)]"></div>
                  Sector Sigma: Legacy Archetypes // F1 Hall of Fame
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LegendTile name="Michael Schumacher" title="7 Titles" color="var(--statusRed)" fact="Transformed Ferrari through total tactical discipline; established the 'Super-Athlete' driver standard." />
                  <LegendTile name="Lewis Hamilton" title="7 Titles" color="var(--accentViolet)" fact="Record holder for most wins/poles; used global platform to redefine cultural impact in racing." />
                  <LegendTile name="Juan Manuel Fangio" title="5 Titles" color="var(--accentAmber)" fact="The original master; won 5 championships with 4 different teams with a 46% win-to-race ratio." />
                  <LegendTile name="Max Verstappen" title="4 Titles" color="var(--accentCyan)" fact="Defined a new era of dominance with a relentless, aggressive pace and clinical consistency." />
                  <LegendTile name="Sebastian Vettel" title="4 Titles" color="var(--accentIndigo)" fact="Youngest world champion; known for hyper-strategic intelligence and absolute work ethic." />
                  <LegendTile name="Alain Prost" title="4 Titles" color="var(--accentEmerald)" fact="'The Professor'; won through intellectual precision, risk-mitigation, and calculated execution." />
                  <AchievementNode 
                    title="Ayrton Senna" 
                    rank="3 TITLES" 
                    medal="PURE INSTINCT" 
                    color="var(--statusRed)"
                    details={["Redefined limits in Monaco and wet-weather; the spiritual master of absolute speed."]}
                  />
                  <AchievementNode 
                    title="Niki Lauda" 
                    rank="3 TITLES" 
                    medal="THE COMPUTER" 
                    color="var(--statusRed)"
                    details={["Used engineering logic to survive the unsurvivable and out-calculate his rivals."]}
                  />
                </div>

                <div className="h-20 lg:h-32"></div>
              </div>
            </div>

            {/* BOTTOM TRIM */}
            <div className="h-1.5 bg-gradient-to-r from-[var(--accentCyan)] via-[var(--statusGreen)] to-[var(--accentAmber)] opacity-30"></div>
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

// --- SUB-COMPONENTS (With Enforced Tactical Colors) ---

function AchievementNode({ title, rank, medal, details, color }: { title: string, rank: string, medal: string, details: string[], color: string }) {
  return (
    <div className="group/node p-5 lg:p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 transition-all relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full opacity-30 group-hover/node:opacity-100 transition-opacity" style={{ backgroundColor: color }}></div>
      <div className="flex justify-between items-start mb-3 lg:mb-4 pl-2">
        <span className="text-[13px] lg:text-[14px] font-orbitron font-black !text-white uppercase tracking-tighter">{title}</span>
        <span className="text-[8px] lg:text-[9px] font-mono font-black !text-slate-400 uppercase tracking-widest">{rank}</span>
      </div>
      <div className="pl-2">
        <div className="text-[10px] lg:text-[11px] font-mono font-black uppercase tracking-widest mb-3" style={{ color }}>{medal}</div>
        <ul className="space-y-1.5 lg:space-y-2">
           {details.map((line, i) => (
             <li key={i} className="text-[11px] lg:text-[12px] !text-slate-300 font-medium leading-relaxed group-hover/node:!text-white transition-colors">• {line}</li>
           ))}
        </ul>
      </div>
    </div>
  );
}

function LegendTile({ name, title, color, fact }: { name: string, title: string, color: string, fact: string }) {
  return (
    <div className="group/legend p-5 lg:p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 transition-all relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full opacity-20 group-hover/legend:opacity-100 transition-opacity" style={{ backgroundColor: color }}></div>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[14px] lg:text-[15px] font-orbitron font-black !text-white uppercase tracking-tight">{name}</span>
        <span className="text-[9px] lg:text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border border-white/10" style={{ color }}>{title}</span>
      </div>
      <p className="text-[11px] lg:text-[12px] !text-slate-400 leading-snug group-hover/legend:!text-white/90 transition-colors italic">"{fact}"</p>
    </div>
  );
}