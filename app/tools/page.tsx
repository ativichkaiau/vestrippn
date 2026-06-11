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

export default function ToolsHub() {
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
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-indigo-500/30">
      
      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-12%] right-[8%] w-[62%] h-[62%] bg-gradient-to-br from-indigo-400/30 via-blue-400/25 to-fuchsia-400/25 dark:from-indigo-600/20 dark:via-blue-600/15 dark:to-purple-900/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-70 transition-all duration-1000"></div>
        <div className="absolute bottom-[-12%] left-[3%] w-[55%] h-[55%] bg-gradient-to-tr from-cyan-400/25 via-sky-400/20 to-indigo-300/25 dark:from-cyan-600/15 dark:via-sky-600/10 dark:to-indigo-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute top-[30%] left-[38%] w-[42%] h-[42%] bg-gradient-to-br from-fuchsia-300/20 to-cyan-300/20 dark:from-fuchsia-500/10 dark:to-cyan-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="14" y2="18"></line></svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px] transition-colors duration-700">V</div>
            <div className="flex items-baseline"><span>VESTRIPPN</span><span className="text-amber-500 dark:text-amber-400 transition-colors duration-700">3.0</span></div>
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
        <NavRail active="Tools" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-14">
            
            <HubIntro
              eyebrow="Utility & Planning Surface"
              title="Launch every"
              titleAccent="daily tool"
              description="The Tools Hub is a clean launch cockpit for your planner, MSCA sheets, AI utilities, clinical resources, engineering references, and daily operations."
              primaryHref="#tool-matrix"
              primaryLabel="Browse Tools"
              secondaryHref="#msca-hub"
              secondaryLabel="MSCA Hub"
              chips={['Planner Link', 'MSCA Sheets', 'AI Tools', 'Utilities']}
              panelTitle="Tools Ops"
              panelSubtitle={`${cycleTime} // API Active`}
              metrics={[
                { label: 'Sectors', value: '5' },
                { label: 'Planner', value: 'Link' },
                { label: 'MSCA', value: 'Sheets' },
              ]}
              capabilities={[
                { icon: '📓', title: 'Planner Launch', desc: 'Jump to the 2026 Master Planner through a fast external launch path.' },
                { icon: '📊', title: 'MSCA Launcher', desc: 'Grouped sheet shortcuts keep the MSCA hub fast, readable, and direct.' },
              ]}
              hub="tools"
            />

            <MissionBlock
              accent="amber"
              title="Daily Ops · Planner + MSCA Hub"
              detail="Set today's plan in the Master Planner, then deploy shortcuts from the tool matrix."
              cta={{ label: 'Open planner', href: '#master-planner' }}
            />

            {/* MASTER IGNITION: NOTION PLANNER — fast launch card */}
            <motion.section
              id="master-planner"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="relative overflow-hidden rounded-[32px] lg:rounded-[40px] border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-700"
            >
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

              <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex items-start gap-4 lg:gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-indigo-50 text-4xl shadow-inner dark:bg-indigo-500/10">📓</div>
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Master Ignition</div>
                    <h2 className="text-[24px] font-black tracking-tight text-neutral-900 dark:text-white lg:text-[32px]">2026 Master Planner</h2>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-neutral-500 dark:text-neutral-400">
                      Your Notion HQ stays one click away. Fast launch, clean page, no cramped Notion viewport.
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-indigo-600 active:scale-95"
                >
                  Open Planner <span>↗</span>
                </a>
              </div>
            </motion.section>

            {/* THE TOOL MATRIX */}
            <div id="tool-matrix" className="space-y-12 lg:space-y-16">

              <SectorContainer label="Sector Alpha: AI & Synthesis" theme="fuchsia">
                <ToolTile title="ChatGPT" url="https://chat.openai.com" icon="🧠" theme="fuchsia" />
                <ToolTile title="Gemini" url="https://gemini.google.com" icon="✨" theme="fuchsia" />
                <ToolTile title="Claude" url="https://claude.ai" icon="🤖" theme="fuchsia" />
                <ToolTile title="NotebookLM" url="https://notebooklm.google.com" icon="📓" theme="fuchsia" />
                <ToolTile title="Perplexity" url="https://www.perplexity.ai" icon="🔍" theme="fuchsia" />
                <ToolTile title="Memo AI" url="https://memo.ai" icon="🃏" theme="fuchsia" />
                <ToolTile title="DeepL" url="https://www.deepl.com" icon="🌍" theme="fuchsia" />
              </SectorContainer>

              <SectorContainer label="Sector Beta: Engineering" theme="indigo">
                <ToolTile title="GitHub" url="https://github.com" icon="🐙" theme="indigo" />
                <ToolTile title="Vercel" url="https://vercel.com" icon="▲" theme="indigo" />
                <ToolTile title="React" url="https://react.dev" icon="📘" theme="indigo" />
                <ToolTile title="Next.js" url="https://nextjs.org/docs" icon="⚛️" theme="indigo" />
                <ToolTile title="Tailwind" url="https://tailwindcss.com" icon="💨" theme="indigo" />
                <ToolTile title="Figma" url="https://www.figma.com" icon="🎨" theme="indigo" />
                <ToolTile title="Stack" url="https://stackoverflow.com" icon="💻" theme="indigo" />
              </SectorContainer>

              <SectorContainer label="Sector Gamma: Clinical" theme="amber">
                <ToolTile title="PubMed" url="https://pubmed.ncbi.nlm.nih.gov" icon="🔬" theme="amber" />
                <ToolTile title="UpToDate" url="https://www.uptodate.com" icon="🩺" theme="amber" />
                <ToolTile title="Covidence" url="https://www.covidence.org" icon="📊" theme="amber" />
                <ToolTile title="Scholar" url="https://scholar.google.com" icon="🎓" theme="amber" />
                <ToolTile title="CMU Lib" url="https://library.cmu.ac.th" icon="🏛️" theme="amber" />
                <ToolTile title="Calendar" url="https://docs.google.com/spreadsheets/d/1oWKicDOiqKpXXCzbd46Qu3yMV-XZnA-K" icon="🗓️" theme="amber" />
                <ToolTile title="Research" url="https://docs.google.com/spreadsheets/d/1E-KPCBw3d7voDo72VYgfvEIc-TCf4gGXtmTVymA-_z8" icon="📋" theme="amber" />
              </SectorContainer>

              {/* SECTOR DELTA: MSCA — launch cockpit */}
              <div id="msca-hub" className="relative space-y-6 lg:space-y-8">
                <div className="flex flex-col gap-2 px-2 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 lg:h-5 rounded-full bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.45)] transition-colors duration-700"></div>
                    <h3 className="text-[12px] lg:text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Sector Delta: MSCA</h3>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Grouped sheet launchers · external tabs</p>
                </div>

                <div className="space-y-5">
                  {MSCA_GROUPS.map((group) => (
                    <div key={group.label} className="rounded-[28px] border border-black/5 bg-white/60 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-white/5 dark:bg-white/5 lg:p-5">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-xl">{group.icon}</span>
                          <div>
                            <h4 className="text-[12px] font-black uppercase tracking-widest text-rose-600 transition-colors duration-700 dark:text-rose-400">{group.label}</h4>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{group.sheets.length} sheets</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1 snap-x">
                        {group.sheets.map((sheet) => (
                          <motion.a
                            key={sheet.url}
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
                            whileTap={{ scale: 0.97 }}
                            className="group shrink-0 snap-start flex w-[220px] items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/70 px-4 py-4 text-left shadow-sm backdrop-blur-xl transition-colors hover:border-rose-500/30 hover:bg-rose-50 dark:border-white/5 dark:bg-white/5 dark:hover:bg-rose-500/10 sm:w-[240px]"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-xl shadow-inner dark:bg-white/10">{sheet.icon ?? '📊'}</span>
                              <span className="truncate text-[13px] font-black tracking-tight text-neutral-800 transition-colors group-hover:text-rose-600 dark:text-neutral-200 dark:group-hover:text-rose-300">{sheet.title}</span>
                            </div>
                            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-transform group-hover:translate-x-0.5">↗</span>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <SectorContainer label="Sector Epsilon: Utilities" theme="emerald">
                <ToolTile title="Gmail" url="https://mail.google.com" icon="✉️" theme="emerald" />
                <ToolTile title="G-Cal" url="https://calendar.google.com" icon="📅" theme="emerald" />
                <ToolTile title="G-Drive" url="https://drive.google.com" icon="☁️" theme="emerald" />
                <ToolTile title="Strava" url="https://www.strava.com" icon="🏃" theme="emerald" />
                <ToolTile title="Hevy" url="https://www.hevyapp.com" icon="🏋️" theme="emerald" />
                <ToolTile title="Spotify" url="https://spotify.com" icon="🎧" theme="emerald" />
                <ToolTile title="YouTube" url="https://youtube.com" icon="▶️" theme="emerald" />
              </SectorContainer>

            </div>
          </div>
        </main>

        {/* --- W09 MOBILE HUB CHIPS --- */}
        <MobileHubNav active="Tools" />

      </div>
    </div>
  );
}

// --- MSCA DATA + EMBED HELPERS ---

type MscaSheet = { title: string; url: string; icon?: string };
type MscaGroupData = { label: string; icon: string; sheets: MscaSheet[] };

const MSCA_GROUPS: MscaGroupData[] = [
  {
    label: 'Get Set Go',
    icon: '🚀',
    sheets: [
      { title: 'Sheet 01', url: 'https://docs.google.com/spreadsheets/d/1CvvGvq0FooBNW60Khy9aO8eJ81aOT52cNbppysnCHeg' },
      { title: 'Sheet 02', url: 'https://docs.google.com/spreadsheets/d/1mwSeuYYJl9DDeBZIcWRH7QkT0EAo-4TeINIGTvkATiI/edit?gid=0#gid=0' },
      { title: 'Sheet 03', url: 'https://docs.google.com/spreadsheets/d/10Cscw_PVeE4LtdxjE9q1d16uJ0eQqD3Yg5Wq8nzoTYw/edit?gid=0#gid=0' },
      { title: 'Sheet 04', url: 'https://docs.google.com/spreadsheets/d/1SJUO_SYMcXbPzd4AAYCwaaIXORKeFC7y_DKB9JhXstI/edit?gid=0#gid=0' },
    ],
  },
  {
    label: 'CMU-IMC',
    icon: '⚙️',
    sheets: [
      { title: 'Sheet 01', url: 'https://docs.google.com/spreadsheets/d/1OuNCnY9GfjvLCYN8S73mUSuRs0ah0igucEA6-ROWiyI' },
      { title: 'Sheet 02', url: 'https://docs.google.com/spreadsheets/d/1zcv9TKx-22aemvog2LSGeULfkFulN0KSCL1rZcvolOE/edit?gid=1681603729#gid=1681603729' },
      { title: 'Sheet 03', url: 'https://docs.google.com/spreadsheets/d/1uRwloyKqWXcDpa_JWZIedGGw6D5OGbBCTat8rZjo2zE/edit?gid=1312765885#gid=1312765885' },
    ],
  },
  {
    label: 'Core Ops',
    icon: '📌',
    sheets: [
      { title: 'One Stop', url: 'https://docs.google.com/spreadsheets/d/1ciQIcqZ6fQwPqdSU3mEK3aasHcXb-yqMt1IoBlWotrU', icon: '🗃️' },
      { title: 'Central PR', url: 'https://docs.google.com/spreadsheets/d/1A1ATJuO-NXwWzdz5KFnDtw3N_6zPufOpd-FAbwAabgA', icon: '📢' },
    ],
  },
];

// --- REFACTORED SUB-COMPONENTS ---

function SectorContainer({ label, theme, children }: { label: string, theme: 'fuchsia' | 'indigo' | 'amber' | 'rose' | 'emerald', children: React.ReactNode }) {
  const dotColors = {
    fuchsia: 'bg-fuchsia-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-4 px-2 lg:mb-7">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-4 lg:w-1.5 lg:h-5 rounded-full ${dotColors[theme]} transition-colors duration-700 shadow-[0_0_14px_rgba(99,102,241,0.25)]`}></div>
          <h3 className="text-[12px] lg:text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">{label}</h3>
        </div>
        <span className="hidden sm:inline-flex rounded-full border border-black/5 bg-white/60 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-white/5 dark:text-neutral-500">Scroll →</span>
      </div>
      <motion.div
        className="flex gap-4 lg:gap-6 overflow-x-auto custom-scrollbar pb-3 -mx-2 px-2 py-2 snap-x"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ToolTile({ title, url, icon, theme }: { title: string, url: string, icon: string, theme: 'fuchsia' | 'indigo' | 'amber' | 'rose' | 'emerald' }) {
  
  const textColors = {
    fuchsia: 'group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400',
    indigo: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    amber: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    rose: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    emerald: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
  };

  const borderColors = {
    fuchsia: 'hover:border-fuchsia-500/30',
    indigo: 'hover:border-indigo-500/30',
    amber: 'hover:border-amber-500/30',
    rose: 'hover:border-rose-500/30',
    emerald: 'hover:border-emerald-500/30'
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } } }}
      whileHover={{ y: -6, scale: 1.02, boxShadow: '0 16px 40px rgb(0,0,0,0.10)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
      whileTap={{ scale: 0.97 }}
      className={`group relative shrink-0 snap-start w-[240px] sm:w-[260px] lg:w-[280px] overflow-hidden bg-white/65 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] p-5 lg:p-6 flex items-center justify-between shadow-[0_8px_28px_rgba(0,0,0,0.035)] hover:bg-white/90 dark:hover:bg-white/10 transition-colors duration-300 ${borderColors[theme]}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
      <div className="flex items-center gap-4 lg:gap-5 relative z-10 min-w-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-2xl shadow-inner transition-transform duration-500 group-hover:scale-110 dark:bg-white/10 lg:text-3xl">{icon}</span>
        <span className={`text-[14px] lg:text-[15px] text-neutral-700 dark:text-neutral-300 font-bold tracking-tight transition-colors duration-300 truncate ${textColors[theme]}`}>{title}</span>
      </div>
      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10 shrink-0 ml-2 group-hover:translate-x-0.5">Open ↗</span>
    </motion.a>
  );
}
