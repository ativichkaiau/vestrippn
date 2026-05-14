'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
// Fixed paths for nested /legal folder
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

export default function LegalConsole() {
  const [isMounted, setIsMounted] = useState(false);
  const [cycle, setCycle] = useState('DAY_CYCLE');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  useEffect(() => {
    setIsMounted(true);
    const currentHour = new Date().getHours();
    setCycle(currentHour < 6 || currentHour >= 18 ? 'NIGHT_CYCLE' : 'DAY_CYCLE');
  }, []);

  if (!isMounted) return null;

  // 🚨 SYNCED: Full navigation array matches the main Dashboard and Academics pages
  const navItems = [
    { name: 'Dashboard', icon: '◉', href: '/', active: false },
    { name: 'Academics', icon: '▲', href: '/academics', active: false },
    { name: 'Research', icon: '◆', href: '/research', active: false },
    { name: 'Fitness', icon: '◈', href: '/fitness', active: false },
    { name: 'Archive', icon: '▥', href: '/archive', active: false },
    { name: 'IELTS', icon: '◎', href: '/ielts', active: false },
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: false },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-[#00A598]/30">
      
      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/15 dark:to-[#00A598]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[50%] h-[50%] bg-gradient-to-tr from-pink-400/20 to-teal-300/20 dark:from-purple-600/10 dark:to-teal-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
      </div>

      {/* --- MINIMALIST HEADER --- */}
      <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-2xl z-50 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex items-center gap-4 lg:gap-8">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-400 active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
            </svg>
          </button>
          <Link href="/" className="font-black text-[20px] lg:text-[22px] tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center text-[16px]">V</div>
            <div className="flex items-baseline">
              <span>VESTRIPPN</span>
              <span className="text-blue-600 dark:text-blue-400">3.0</span>
            </div>
          </Link>
        </div>
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="hidden sm:block font-medium text-[12px] tracking-tight text-neutral-400 dark:text-neutral-500 uppercase"><ArcDate /></div>
          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block"></div>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* --- RETRACTABLE DESKTOP SIDEBAR --- */}
        <aside className={`hidden lg:flex flex-col justify-between py-6 bg-white/40 dark:bg-black/20 border-r border-black/5 dark:border-white/5 shrink-0 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isSidebarExpanded ? 'w-[240px] px-6' : 'w-[88px] px-4'
        }`}>
          <nav className="space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                title={!isSidebarExpanded ? item.name : undefined}
                className={`flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl transition-all duration-300 group relative ${
                  item.active 
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span className={`text-[18px] shrink-0 transition-opacity duration-300 ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className={`text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${
                  isSidebarExpanded ? 'max-w-[150px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`mt-4 w-full rounded-3xl bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 active:scale-95 group ${
              isSidebarExpanded ? 'p-5' : 'p-4 aspect-square'
            }`}
          >
            {isSidebarExpanded ? <Clock /> : <span className="text-xl group-hover:rotate-12 transition-transform duration-300">⏱️</span>}
          </button>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10">
          <div className="max-w-[900px] mx-auto space-y-8">
            
            {/* HERO SECTION */}
            <section className="text-center space-y-4 pt-4 sm:pt-8">
              <h1 className="font-black tracking-tighter text-[42px] sm:text-[48px] lg:text-[56px] leading-none">
                LEGAL <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-3 py-1 rounded-[16px] shadow-sm">CONSOLE</span>
              </h1>
              <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-[0.3em]">
                {cycle} // <span className="text-[#00A598] font-bold">Terminal Security Protocol</span>
              </p>
            </section>

            {/* TAB SELECTOR */}
            <div className="flex justify-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl w-fit mx-auto border border-black/5 dark:border-white/5">
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'privacy' ? 'bg-white dark:bg-neutral-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Privacy Protocol
              </button>
              <button 
                onClick={() => setActiveTab('terms')}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'terms' ? 'bg-white dark:bg-neutral-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Terms of Service
              </button>
            </div>

            {/* CONTENT BOX */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] p-6 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
              {activeTab === 'privacy' ? (
                <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/10 pb-6">
                    <h2 className="text-2xl font-black tracking-tight">Privacy Protocol</h2>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Protocol Ver 3.2.0</span>
                  </div>
                  
                  <div className="space-y-8 text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">01. Core Identity & Authentication</h3>
                      <p>VESTRIPPN 3.0 utilizes Google OAuth 2.0 as its primary identity anchor. When you initiate a "Sign In," we collect your verified email address, full name, and profile image. This data is used exclusively to distinguish the administrative operator from guest visitors and is never sold, leased, or distributed to third-party marketing entities.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">02. Telemetry Persistence</h3>
                      <p>Academic performance data and research metrics are fetched via encrypted uplinks to Mango-CMU and PubMed APIs. While this telemetry is displayed within your terminal session, we do not maintain a permanent database of your clinical scores or research queries on our servers. All sensitive academic telemetry is cleared from volatile memory upon session termination.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">03. Security & Data Integrity</h3>
                      <p>We implement a "Zero-Retention" policy for external API tokens. Your Canvas and PubMed access keys are encrypted using AES-256 standards and are only stored within your private environment variables. We utilize industry-standard TLS encryption for all data in transit between the VESTRIPPN terminal and external cloud services.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">04. Cookies & Local Environment</h3>
                      <p>Our system uses essential cookies to maintain your login session. We also utilize browser local storage to save your UI configuration, including your preferred Day/Night theme cycle and sidebar expansion state. These cookies do not track your activity on external websites.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">05. Third-Party Uplinks</h3>
                      <p>By using the terminal, you acknowledge that VESTRIPPN acts as a data aggregator for Google Cloud, Mango-CMU, and PubMed. Each of these services maintains its own independent privacy protocol. We strongly advise the operator to review these external policies to understand how your raw data is handled at the source.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">06. Disclosure & Legal Compliance</h3>
                      <p>We reserve the right to disclose minimal identity data only if required by a valid legal subpoena. In all other scenarios, your VESTRIPPN instance remains a strictly private environment, inaccessible to the public internet.</p>
                    </section>
                  </div>
                </article>
              ) : (
                <article className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/10 pb-6">
                    <h2 className="text-2xl font-black tracking-tight">Operational Terms</h2>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">W06 Protocol Sync</span>
                  </div>
                  
                  <div className="space-y-8 text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">01. Acceptance of Terms</h3>
                      <p>By accessing the VESTRIPPN 3.0 terminal, you agree to comply with these Operational Terms. This terminal is provided as a productivity suite for medical research and academic management. Unauthorized access or attempt to bypass the Identity Anchor is a violation of these terms.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">02. Authorized Operator Conduct</h3>
                      <p>Access is restricted to the primary developer and authorized administrative users. The operator is responsible for maintaining the security of their Google credentials. Any activity performed under your authenticated session is your sole responsibility.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">03. Uplink Reliability & API Limits</h3>
                      <p>VESTRIPPN relies on external services (Mango-CMU, Vercel, and Google). We do not guarantee 100% uptime of these uplinks. Service interruptions, API rate limiting, or server-side outages from these providers may temporarily degrade the terminal's telemetry functions.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">04. Intellectual Property</h3>
                      <p>The VESTRIPPN 3.0 source code, UI/UX architecture, and the "AMG W06 Hybrid" design aesthetic are the intellectual property of the developer. No part of this dashboard may be reproduced, sold, or distributed without explicit written authorization.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">05. Limitation of Liability</h3>
                      <p>The developer shall not be held liable for any academic discrepancy, data synchronization errors, or missed deadlines resulting from terminal downtime. VESTRIPPN is a supplemental tool and should not be the sole source of critical academic or clinical information.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">06. Protocol Modifications</h3>
                      <p>We reserve the right to modify these terms at any time to reflect updates in the terminal's code or changes in third-party API requirements. Your continued use of the terminal after such modifications constitutes acceptance of the new protocol.</p>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-[11px]">07. Termination of Service</h3>
                      <p>The developer reserves the right to terminate access to the terminal at any time, for any reason, without prior notice, specifically in cases of detected security breaches or unauthorized credential sharing.</p>
                    </section>
                  </div>
                </article>
              )}
            </div>
          </div>
        </main>

        {/* --- MOBILE-ONLY FLOATING NAVIGATION HUD --- */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group ${
                item.active 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' 
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
               <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                 {item.icon}
               </span>
               {item.active && (
                 <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">
                   {item.name}
                 </span>
               )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}