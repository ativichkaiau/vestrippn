'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';
import HubIntro from '../../components/HubIntro';

export default function ToolsHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [cycleTime, setCycleTime] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(DEFAULT_SHEET);

  useEffect(() => { 
    setIsMounted(true); 
    const currentHour = new Date().getHours();
    setCycleTime(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
  }, []);

  if (!isMounted) return null;

  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: false },
    { name: 'Research', icon: '◆', href: '/research', active: false },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: false },
    { name: 'Tools', icon: '⚙', href: '/tools', active: true },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

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
            <div className="flex items-baseline"><span>VESTRIPPN</span><span className="text-indigo-500 dark:text-indigo-400 transition-colors duration-700">3.0</span></div>
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
        
        {/* --- RETRACTABLE DESKTOP SIDEBAR --- */}
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'}`}>
          <nav className="space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
                <span className={`text-[18px] shrink-0 transition-opacity duration-300 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>{item.name}</span>
              </Link>
            ))}
          </nav>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'}`}>
            {isSidebarExpanded ? <Clock /> : <span className="text-xl group-hover:rotate-12 transition-transform duration-300">⏱️</span>}
          </button>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-8 lg:space-y-12">
            
            <HubIntro
              eyebrow="Utility & Planning Surface"
              title="Launch every"
              titleAccent="daily tool"
              description="The Tools Hub embeds your planner, MSCA sheets, AI utilities, clinical resources, and operational links in one fast-launch workspace."
              primaryHref="#master-planner"
              primaryLabel="Open Planner"
              secondaryHref="#msca-hub"
              secondaryLabel="MSCA Hub"
              chips={['Notion Planner', 'MSCA Sheets', 'AI Tools', 'Utilities']}
              panelTitle="Tools Ops"
              panelSubtitle={`${cycleTime} // API Active`}
              metrics={[
                { label: 'Sectors', value: '5' },
                { label: 'Planner', value: 'Embed' },
                { label: 'MSCA', value: 'Live' },
              ]}
              capabilities={[
                { icon: '📓', title: 'Planner Embedded', desc: 'The 2026 Master Planner stays inside the site with an external fallback.' },
                { icon: '📊', title: 'Sheet Cockpit', desc: 'MSCA sheets are selected through a compact tabbed viewer.' },
              ]}
            />

            {/* MASTER IGNITION: NOTION PLANNER — embedded inline */}
            <motion.section
              id="master-planner"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
              className="relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 lg:px-8 py-4 lg:py-5 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                  <div className="w-11 h-11 lg:w-12 lg:h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl lg:text-3xl shadow-sm shrink-0">📓</div>
                  <div className="min-w-0">
                    <h2 className="font-black text-[16px] lg:text-[18px] text-neutral-900 dark:text-white tracking-tight leading-none truncate">2026 Master Planner</h2>
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Workspace: Notion HQ</p>
                  </div>
                </div>
                <a
                  href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:ml-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300 transition-all active:scale-95 shadow-sm shrink-0"
                >
                  Open in Notion <span>↗</span>
                </a>
              </div>
              <iframe
                src="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938"
                title="2026 Master Planner — Notion"
                loading="lazy"
                allow="clipboard-read; clipboard-write"
                className="w-full h-[600px] lg:h-[760px] bg-white"
              />
            </motion.section>

            {/* THE TOOL MATRIX */}
            <div className="space-y-12 lg:space-y-16">

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

              {/* SECTOR DELTA: MSCA — embedded tabbed viewer */}
              <div id="msca-hub" className="relative space-y-6 lg:space-y-8">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-1.5 h-4 lg:h-5 rounded-full bg-rose-500 transition-colors duration-700"></div>
                  <h3 className="text-[12px] lg:text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">Sector Delta: MSCA</h3>
                </div>

                {/* Sheet selector — grouped chips that load the embed below */}
                <div className="space-y-5">
                  {MSCA_GROUPS.map((group) => (
                    <div key={group.label} className="pl-3 lg:pl-5 border-l-2 border-rose-500/20 space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[15px] leading-none">{group.icon}</span>
                        <h4 className="text-[11px] lg:text-[12px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 transition-colors duration-700">{group.label}</h4>
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                        {group.sheets.map((sheet) => {
                          const isActive = activeSheet.url === sheet.url;
                          return (
                            <button
                              key={sheet.url}
                              onClick={() => setActiveSheet({ ...sheet, group: group.label })}
                              aria-pressed={isActive}
                              className={`group shrink-0 flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-left backdrop-blur-xl transition-all duration-300 active:scale-95 ${
                                isActive
                                  ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                                  : 'bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-white/90 dark:hover:bg-white/10 hover:border-rose-500/30 text-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              <span className="text-[18px] leading-none shrink-0">{sheet.icon ?? '📊'}</span>
                              <span className="text-[13px] lg:text-[14px] font-bold tracking-tight whitespace-nowrap">{sheet.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scrollable embedded sheet viewer */}
                <div className="rounded-[28px] lg:rounded-[32px] border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-colors duration-700">
                  <div className="flex items-center justify-between gap-4 px-5 lg:px-6 py-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{activeSheet.icon ?? '📊'}</span>
                      <div className="min-w-0">
                        <div className="text-[14px] lg:text-[15px] font-bold tracking-tight text-neutral-800 dark:text-neutral-100 truncate">{activeSheet.title}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-rose-500/80">{activeSheet.group}</div>
                      </div>
                    </div>
                    <a
                      href={activeSheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      Open ↗
                    </a>
                  </div>
                  <iframe
                    key={activeSheet.url}
                    src={toSheetEmbed(activeSheet.url)}
                    title={`${activeSheet.group} — ${activeSheet.title}`}
                    loading="lazy"
                    className="w-full h-[560px] lg:h-[680px] bg-white"
                  />
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

        {/* --- MOBILE HUD NAV BAR --- */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
               <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
               {item.active && <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">{item.name}</span>}
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
}

// --- MSCA DATA + EMBED HELPERS ---

type MscaSheet = { title: string; url: string; icon?: string };
type MscaGroupData = { label: string; icon: string; sheets: MscaSheet[] };
type ActiveSheet = MscaSheet & { group: string };

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

/** Convert a Google Sheets edit/share URL into a scrollable read-only /preview embed URL. */
function toSheetEmbed(url: string): string {
  const id = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!id) return url;
  const gid = url.match(/[?#&]gid=(\d+)/)?.[1];
  return `https://docs.google.com/spreadsheets/d/${id}/preview${gid ? `?gid=${gid}` : ''}`;
}

const DEFAULT_SHEET: ActiveSheet = { ...MSCA_GROUPS[0].sheets[0], group: MSCA_GROUPS[0].label };

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
      <div className="flex items-center gap-3 mb-6 lg:mb-8 px-2">
        <div className={`w-1.5 h-4 lg:w-1.5 lg:h-5 rounded-full ${dotColors[theme]} transition-colors duration-700`}></div>
        <h3 className="text-[12px] lg:text-[13px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 transition-colors duration-700">{label}</h3>
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
      className={`group shrink-0 snap-start w-[240px] sm:w-[260px] lg:w-[280px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] p-5 lg:p-6 flex items-center justify-between hover:bg-white/90 dark:hover:bg-white/10 transition-colors duration-300 ${borderColors[theme]}`}
    >
      <div className="flex items-center gap-4 lg:gap-5 relative z-10 min-w-0">
        <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-500 shrink-0">{icon}</span>
        <span className={`text-[14px] lg:text-[15px] text-neutral-700 dark:text-neutral-300 font-bold tracking-tight transition-colors duration-300 truncate ${textColors[theme]}`}>{title}</span>
      </div>
      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10 shrink-0 ml-2">Open ↗</span>
    </motion.a>
  );
}
