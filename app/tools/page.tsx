'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

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
        <div className="absolute top-[-10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/15 dark:to-purple-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[50%] h-[50%] bg-gradient-to-tr from-cyan-400/20 to-indigo-300/20 dark:from-cyan-600/10 dark:to-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
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
            
            {/* HERO SECTION */}
            <motion.section
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center pt-8 sm:pt-16 pb-6 relative"
            >
              <div className="absolute left-[5%] xl:left-[10%] top-4 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-lg">⚙️</span>
                <span className="text-[13px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">System Core</span>
              </div>
              <div className="absolute right-[5%] xl:right-[10%] bottom-0 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">API Active</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-6 flex flex-col xl:flex-row items-center justify-center gap-3 sm:gap-4 xl:gap-5 relative z-10">
                <div className="flex items-baseline text-[42px] sm:text-[64px] lg:text-[76px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">TOOLS</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 xl:mt-0 text-[32px] sm:text-[50px] lg:text-[60px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-4 py-1 sm:py-2 rounded-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-black/5 leading-none transition-colors duration-700">HUB</span>
                </div>
              </h1>
              <p className="max-w-2xl font-mono text-[11px] sm:text-[12px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.4em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycleTime} // <span className="text-indigo-500 dark:text-indigo-400 font-bold">System Nominal</span>
              </p>
            </motion.section>

            {/* MASTER IGNITION: NOTION PLANNER */}
            <motion.section
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 24px 56px rgb(0,0,0,0.09)', transition: { type: 'spring', stiffness: 400, damping: 28 } }}
              className="relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden cursor-default transition-colors duration-700"
            >
              <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-6 lg:gap-10 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-8">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[24px] flex items-center justify-center text-3xl lg:text-4xl shadow-sm transition-all duration-700">📓</div>
                  <div>
                    <h2 className="font-black text-[22px] lg:text-[28px] text-neutral-900 dark:text-white tracking-tight leading-none transition-colors duration-700">2026 Master Planner</h2>
                    <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-2 transition-colors duration-700">Workspace: Notion HQ</p>
                  </div>
                </div>
                <a 
                  href="https://www.notion.so/2026-PLANNER-478a66b0e071827fa2380129a0030938" 
                  target="_blank" 
                  className="w-full md:w-auto bg-indigo-500 text-white font-bold text-[11px] px-10 lg:px-12 py-4 lg:py-5 rounded-2xl hover:bg-indigo-600 active:scale-95 transition-all uppercase tracking-widest shadow-md"
                >
                  Ignite Engine ↗
                </a>
              </div>
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

              <SectorContainer label="Sector Delta: MSCA Operations" theme="rose">
                <ToolTile title="One Stop" url="https://docs.google.com/spreadsheets/d/1ciQIcqZ6fQwPqdSU3mEK3aasHcXb-yqMt1IoBlWotrU" icon="🗃️" theme="rose" />
                <ToolTile title="Central PR" url="https://docs.google.com/spreadsheets/d/1A1ATJuO-NXwWzdz5KFnDtw3N_6zPufOpd-FAbwAabgA" icon="📢" theme="rose" />
                <ToolTile title="CMU-IMC" url="https://docs.google.com/spreadsheets/d/1OuNCnY9GfjvLCYN8S73mUSuRs0ah0igucEA6-ROWiyI" icon="⚙️" theme="rose" />
                <ToolTile title="GetSetGO" url="https://docs.google.com/spreadsheets/d/1CvvGvq0FooBNW60Khy9aO8eJ81aOT52cNbppysnCHeg" icon="🚀" theme="rose" />
              </SectorContainer>

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
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
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
      className={`group bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[24px] p-5 lg:p-6 flex items-center justify-between hover:bg-white/90 dark:hover:bg-white/10 transition-colors duration-300 ${borderColors[theme]}`}
    >
      <div className="flex items-center gap-4 lg:gap-5 relative z-10 min-w-0">
        <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-500 shrink-0">{icon}</span>
        <span className={`text-[14px] lg:text-[15px] text-neutral-700 dark:text-neutral-300 font-bold tracking-tight transition-colors duration-300 truncate ${textColors[theme]}`}>{title}</span>
      </div>
      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10 shrink-0 ml-2">Open ↗</span>
    </motion.a>
  );
}