'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from "../../components/ThemeToggle";
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';
import HubIntro from '../../components/HubIntro';
import MissionBlock from '../../components/MissionBlock';
import { NavRail, MobileHubNav } from '../../components/HubNav';

export default function ArchiveHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [cycleTime, setCycleTime] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    const currentHour = new Date().getHours();
    setCycleTime(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
  }, []);

  if (!isMounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">
      
      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-cyan-400/30 via-sky-400/25 to-blue-400/25 dark:from-cyan-600/20 dark:via-sky-600/15 dark:to-[#00A598]/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-cyan-300/25 dark:from-blue-600/15 dark:via-indigo-600/10 dark:to-teal-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-sky-300/20 to-cyan-300/20 dark:from-sky-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline"><span>VESTRIPPN</span><span className="text-cyan-500 dark:text-cyan-400 transition-colors duration-700">3.0</span></div>
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
        
        {/* --- W09 NAV RAIL --- */}
        <NavRail active="Archive" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 overflow-y-auto custom-scrollbar relative">
          
          <div className="max-w-[1400px] w-full mx-auto space-y-8 lg:space-y-10">
            
            <HubIntro
              eyebrow="Archive & Project Registry"
              title="Open the"
              titleAccent="knowledge vault"
              description="The Archive Hub collects medical foundations, olympiad intelligence, preparation vaults, and your deployed project architecture into one indexed launchpad."
              primaryHref="#archive-directory"
              primaryLabel="Browse Archive"
              secondaryHref="https://linktr.ee/shankusu.studygram"
              secondaryLabel="Launch Linktree ↗"
              chips={['Medical Notes', 'Olympiad Vault', 'Project Apps', 'Drive Registry']}
              panelTitle="Archive Ops"
              panelSubtitle={`${cycleTime} // Vault Secure`}
              metrics={[
                { label: 'Sectors', value: '4' },
                { label: 'Apps', value: '6' },
                { label: 'Vault', value: 'Secure' },
              ]}
              capabilities={[
                { icon: '📁', title: 'Structured Memory', desc: 'Important folders and learning materials stay visible without hunting.' },
                { icon: '🧠', title: 'Project Architecture', desc: 'Clinical apps, neuro pathways, and research tools launch from one grid.' },
              ]}
              hub="archive"
            />

            <MissionBlock
              accent="purple"
              title="Knowledge Vault · 6 Apps Deployed"
              detail="Medical foundations, olympiad vaults, and project architecture stay indexed and launch-ready."
              cta={{ label: 'Browse archive', href: '#archive-directory' }}
            />

            {/* --- MAIN HUD: F1 COCKPIT ARCHIVE (Neo-Glassmorphic) --- */}
            <div id="archive-directory" className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden relative transition-colors duration-700"> 
              
              {/* RPM LED Strip (Adaptive width) */} 
              <div className="h-4 lg:h-6 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex justify-center items-center gap-1.5 lg:gap-2 px-4 shrink-0 transition-colors duration-700 group cursor-default"> 
                {[...Array(8)].map((_, i) => ( 
                  <div key={`g-${i}`} className="flex-1 max-w-[40px] h-1.5 lg:h-2 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-emerald-500 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]" style={{ transitionDelay: `${i * 30}ms` }}></div> 
                ))} 
                {[...Array(3)].map((_, i) => ( 
                  <div key={`a-${i}`} className="flex-1 max-w-[40px] h-1.5 lg:h-2 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-amber-500 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)]" style={{ transitionDelay: `${(i + 8) * 30}ms` }}></div> 
                ))} 
                {[...Array(2)].map((_, i) => ( 
                  <div key={`r-${i}`} className="flex-1 max-w-[40px] h-1.5 lg:h-2 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-red-500 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]" style={{ transitionDelay: `${(i + 11) * 30}ms` }}></div> 
                ))} 
              </div> 

              {/* Steering Wheel Dashboard Data */} 
              <div className="grid grid-cols-2 lg:flex lg:justify-between items-center bg-transparent px-6 lg:px-10 py-6 lg:py-8 border-b border-black/5 dark:border-white/5 shrink-0 gap-6 transition-colors duration-700"> 
                
                <div className="flex gap-8 lg:gap-12 order-2 lg:order-1"> 
                  <div> 
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-1 uppercase tracking-widest transition-colors duration-700">Speed</div> 
                    <div className="text-[28px] lg:text-[36px] text-cyan-600 dark:text-cyan-400 font-black leading-none tracking-tighter transition-colors duration-700">314</div> 
                  </div> 
                  <div> 
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-1 uppercase tracking-widest transition-colors duration-700">Index</div> 
                    <div className="text-[28px] lg:text-[36px] text-neutral-900 dark:text-white font-black leading-none tracking-tighter transition-colors duration-700">56.5<span className="text-[14px] text-neutral-400 ml-1">%</span></div> 
                  </div> 
                </div> 
                
                <div className="flex flex-col items-center col-span-2 lg:col-span-1 order-1 lg:order-2 border-b lg:border-none border-black/5 dark:border-white/5 pb-6 lg:pb-0 transition-colors duration-700"> 
                  <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-widest transition-colors duration-700">Vault Tier</div> 
                  <div className="text-[48px] lg:text-[64px] text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black leading-none tracking-tighter transition-colors duration-700">8</div> 
                </div> 

                <div className="flex gap-8 lg:gap-12 text-right justify-end order-3"> 
                  <div> 
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-1 uppercase tracking-widest transition-colors duration-700">Mode</div> 
                    <div className="text-[28px] lg:text-[36px] text-neutral-900 dark:text-white font-black leading-none uppercase tracking-tighter transition-colors duration-700">V3.0</div> 
                  </div> 
                  <div> 
                    <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-1 uppercase tracking-widest transition-colors duration-700">Battery</div> 
                    <div className="text-[28px] lg:text-[36px] text-amber-500 dark:text-amber-400 font-black leading-none tracking-tighter transition-colors duration-700">82<span className="text-[14px] text-neutral-400 ml-1">%</span></div> 
                  </div> 
                </div> 
              </div> 

              {/* Action Bar */} 
              <div className="bg-black/5 dark:bg-white/5 px-6 lg:px-10 py-4 flex flex-col md:flex-row justify-between items-center border-b border-black/5 dark:border-white/5 shrink-0 gap-4 transition-colors duration-700"> 
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest transition-colors duration-700">Target: Master Database Registry</span> 
                </div>
                <a 
                  href="https://linktr.ee/shankusu.studygram" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full md:w-auto bg-cyan-500 text-white px-8 py-3 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all text-center hover:bg-cyan-600 active:scale-95 shadow-md hover:shadow-lg" 
                > 
                  Launch Linktree ↗ 
                </a> 
              </div> 

              {/* DIRECTORY GRID (Responsive Columns) */}
              <motion.div
                className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col gap-10 lg:gap-12 custom-scrollbar relative"
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
              >
                {/* Sector A */}
                <motion.section
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                  className="rounded-[28px] border border-black/5 dark:border-white/5 bg-white/45 dark:bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/5 pb-3 dark:border-white/5">
                    <h3 className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase flex items-center gap-3 transition-colors duration-700">
                      <span className="w-1.5 h-4 bg-cyan-500 rounded-full shadow-[0_0_14px_rgba(6,182,212,0.45)]"></span> Sector A: Medical Foundations
                    </h3>
                    <span className="hidden sm:inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-300">3 Links</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <ArchiveLink title="University Summaries" url="https://drive.google.com/drive/folders/1Wp9C_rP2ybeVUPgfXJCOganRNjuWaViS" icon="📁" theme="cyan" />
                    <ArchiveLink title="Clinical Mock Exams" url="https://vestrippn.vercel.app/learn/cases" icon="🩺" theme="cyan" />
                    <ArchiveLink title="Portfolio Showcase" url="https://drive.google.com/drive/folders/1-34E1ClpDxzP5-3Hr_b52svDZX7J2ucF" icon="🎯" theme="cyan" />
                  </div>
                </motion.section>

                {/* Sector B */}
                <motion.section
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                  className="rounded-[28px] border border-black/5 dark:border-white/5 bg-white/45 dark:bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/5 pb-3 dark:border-white/5">
                    <h3 className="text-[12px] font-bold text-amber-600 dark:text-amber-400 tracking-widest uppercase flex items-center gap-3 transition-colors duration-700">
                      <span className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_14px_rgba(245,158,11,0.45)]"></span> Sector B: Olympiad Intelligence
                    </h3>
                    <span className="hidden sm:inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">3 Links</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <ArchiveLink title="Astrophysics" url="https://drive.google.com/drive/folders/1ta_ydTUk8YLe91z_tgBWawMAlxHxqs06" icon="🌌" theme="amber" />
                    <ArchiveLink title="Astronomy" url="https://drive.google.com/drive/folders/1FIy_K00EC4I9UGy-LyP0_eRxHGGkqtJZ" icon="🔭" theme="amber" />
                    <ArchiveLink title="Earth Science" url="https://drive.google.com/drive/folders/1--FnoZZe4GWo4i7YYXyzSZNjwIX5HHks" icon="🌍" theme="amber" />
                  </div>
                </motion.section>

                {/* Sector C */}
                <motion.section
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                  className="rounded-[28px] border border-black/5 dark:border-white/5 bg-white/45 dark:bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/5 pb-3 dark:border-white/5">
                    <h3 className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase flex items-center gap-3 transition-colors duration-700">
                      <span className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.45)]"></span> Sector C: Preparation Vault
                    </h3>
                    <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">3 Links</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <ArchiveLink title="High School Notes" url="https://drive.google.com/drive/folders/1rs2HtVZBXJ_4IOf_HkPMIRCW0XwuMSk5" icon="🎒" theme="emerald" />
                    <ArchiveLink title="Linguistics" url="https://drive.google.com/drive/folders/1-2RoL8dU8UjiSJZqQRIVZhh1LJ_yRgBw" icon="📝" theme="emerald" />
                    <ArchiveLink title="IELTS Master" url="https://drive.google.com/drive/folders/1-1if13M7Pg0PNGiyFJ6YuXZe04AH9rKR" icon="🇬🇧" theme="emerald" />
                  </div>
                </motion.section>

                {/* Sector D */}
                <motion.section
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                  className="rounded-[28px] border border-black/5 dark:border-white/5 bg-white/45 dark:bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/5 pb-3 dark:border-white/5">
                    <h3 className="text-[12px] font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase flex items-center gap-3 transition-colors duration-700">
                      <span className="w-1.5 h-4 bg-purple-500 rounded-full shadow-[0_0_14px_rgba(168,85,247,0.45)]"></span> Sector D: Projects & Architecture
                    </h3>
                    <span className="hidden sm:inline-flex rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-300">6 Apps</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    <ArchiveLink title="Food Screener" url="https://vestrippn-food-screener.vercel.app" icon="🍳" theme="purple" />
                    <ArchiveLink title="SRMA Screener" url="https://vestrippn-srma-telemetry.vercel.app" icon="📊" theme="purple" />
                    <ArchiveLink title="Microbiology Pokedex" url="https://vestrippn-pokedex.vercel.app" icon="🦠" theme="purple" />
                    <ArchiveLink title="Neuro Pathway" url="https://vestrippn-neuro-pathway.vercel.app" icon="🧠" theme="purple" />
                    <ArchiveLink title="Biochem Pathway" url="https://vestrippn-biochem-pathway.vercel.app" icon="🧬" theme="purple" />
                    <ArchiveLink title="PhysioHub" url="https://vestrippn-physiohub.vercel.app" icon="🫀" theme="purple" />
                  </div>
                </motion.section>

              </motion.div> 
            </div> 

          </div>
        </main>

        {/* --- W09 MOBILE HUB CHIPS --- */}
        <MobileHubNav active="Archive" />

      </div>
    </div>
  ); 
} 

function ArchiveLink({ title, url, icon, theme }: { title: string, url: string, icon: string, theme: 'cyan' | 'amber' | 'emerald' | 'purple' }) { 
  const textColors = {
    cyan: 'group-hover/link:text-cyan-600 dark:group-hover/link:text-cyan-400',
    amber: 'group-hover/link:text-amber-600 dark:group-hover/link:text-amber-400',
    emerald: 'group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400',
    purple: 'group-hover/link:text-purple-600 dark:group-hover/link:text-purple-400',
  };

  const bgColors = {
    cyan: 'group-hover/link:bg-cyan-50 dark:group-hover/link:bg-cyan-500/10 hover:border-cyan-500/30',
    amber: 'group-hover/link:bg-amber-50 dark:group-hover/link:bg-amber-500/10 hover:border-amber-500/30',
    emerald: 'group-hover/link:bg-emerald-50 dark:group-hover/link:bg-emerald-500/10 hover:border-emerald-500/30',
    purple: 'group-hover/link:bg-purple-50 dark:group-hover/link:bg-purple-500/10 hover:border-purple-500/30',
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -5, scale: 1.02, boxShadow: '0 16px 36px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Open ${title}`}
      className={`group/link relative min-h-[96px] overflow-hidden bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl border border-black/5 dark:border-white/5 p-5 lg:p-6 rounded-2xl flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.035)] transition-all duration-300 ${bgColors[theme]}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80 dark:via-white/20" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/60 blur-2xl opacity-0 transition-opacity duration-500 group-hover/link:opacity-70 dark:bg-white/10" />
      <div className="flex items-center gap-4 lg:gap-5 relative z-10 min-w-0">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-2xl shadow-inner transition-transform duration-300 group-hover/link:scale-110 dark:bg-white/10 lg:text-3xl">{icon}</span>
        <span className={`text-[14px] lg:text-[15px] text-neutral-900 dark:text-white font-bold tracking-tight transition-colors duration-300 line-clamp-2 ${textColors[theme]}`}>{title}</span>
      </div>
      <span className="relative z-10 ml-3 inline-flex h-8 shrink-0 items-center rounded-full border border-black/5 bg-white/55 px-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-all duration-300 group-hover/link:translate-x-0.5 group-hover/link:text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-500 dark:group-hover/link:text-white">
        Open ↗
      </span>
    </motion.a>
  ); 
} 
