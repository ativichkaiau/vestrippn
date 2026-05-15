'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Clock from "../../components/Clock";
import ThemeToggle from "../../components/ThemeToggle"; 
import ArcDate from '../../components/ArcDate';
import TopNavProfile from '../../components/TopNavProfile';

export default function IdentityHub() {
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
    { name: 'Tools', icon: '⚙', href: '/tools', active: false },
    { name: 'Identity', icon: '⚇', href: '/identity', active: true },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 relative overflow-hidden transition-colors duration-700 font-sans selection:bg-cyan-500/30">
      
      {/* --- CUSTOM ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(-2deg); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
      `}} />

      {/* --- DAY/NIGHT ATMOSPHERE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-400/20 to-blue-400/20 dark:from-cyan-600/15 dark:to-[#00A598]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-60 transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-gradient-to-tr from-emerald-400/20 to-cyan-300/20 dark:from-blue-600/10 dark:to-teal-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-50 transition-all duration-1000"></div>
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
        <main className="flex-1 flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-10 pb-32 lg:pb-10 overflow-y-auto custom-scrollbar relative">
          
          <div className="max-w-[1400px] w-full mx-auto space-y-8 lg:space-y-10">
            
            {/* HERO SECTION */}
            <section className="flex flex-col items-center justify-center text-center pt-8 sm:pt-16 pb-6 relative">
              <div className="absolute left-[5%] xl:left-[10%] top-4 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-slow">
                <span className="text-lg">⚇</span>
                <span className="text-[13px] font-bold tracking-tight text-neutral-700 dark:text-neutral-200">Operator Manifest</span>
              </div>
              <div className="absolute right-[5%] xl:right-[10%] bottom-0 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 transition-colors duration-700 animate-float-fast">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Authorized</span>
              </div>

              <h1 className="font-black tracking-tighter leading-none mb-6 flex flex-col xl:flex-row items-center justify-center gap-3 sm:gap-4 xl:gap-5 relative z-10">
                <div className="flex items-baseline text-[42px] sm:text-[64px] lg:text-[76px]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 transition-colors duration-700">IDENTITY</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 xl:mt-0 text-[32px] sm:text-[50px] lg:text-[60px]">
                  <span className="italic text-white dark:text-black bg-neutral-900 dark:bg-white px-4 py-1 sm:py-2 rounded-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-black/5 leading-none transition-colors duration-700">HUB</span>
                </div>
              </h1>
              <p className="max-w-2xl font-mono text-[11px] sm:text-[12px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.4em] leading-relaxed px-4 transition-colors duration-700 relative z-10">
                {cycleTime} // <span className="text-cyan-500 dark:text-cyan-400 font-bold">MFD Active</span>
              </p>
            </section>

            {/* --- MAIN HUD: THE IDENTITY MFD --- */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[32px] lg:rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden relative transition-colors duration-700"> 
              
              {/* RPM LED Strip (Adaptive width) */} 
              <div className="h-4 lg:h-6 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex justify-center items-center gap-1.5 lg:gap-2 px-4 shrink-0 transition-colors duration-700 group cursor-default"> 
                {[...Array(8)].map((_, i) => ( 
                  <div key={`g-${i}`} className="flex-1 max-w-[40px] h-1.5 lg:h-2 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-emerald-500 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]" style={{ transitionDelay: `${i * 20}ms` }}></div> 
                ))} 
                {[...Array(3)].map((_, i) => ( 
                  <div key={`a-${i}`} className="flex-1 max-w-[40px] h-1.5 lg:h-2 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-amber-500 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)]" style={{ transitionDelay: `${(i + 8) * 20}ms` }}></div> 
                ))} 
                {[...Array(2)].map((_, i) => ( 
                  <div key={`r-${i}`} className="flex-1 max-w-[40px] h-1.5 lg:h-2 rounded-full bg-black/10 dark:bg-white/10 transition-all duration-300 group-hover:bg-red-500 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]" style={{ transitionDelay: `${(i + 11) * 20}ms` }}></div> 
                ))} 
              </div> 

              <div className="flex-1 flex flex-col xl:flex-row relative z-10">
                
                {/* 🚀 LEFT ZONE: UPDATED OPERATOR MANIFESTO */}
                <div className="w-full xl:w-[40%] flex flex-col gap-6 p-6 lg:p-10 border-b xl:border-b-0 xl:border-r border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] shrink-0 transition-colors duration-700">
                  
                  {/* Operator ID */}
                  <div className="space-y-3 mb-2">
                    <h2 className="font-black text-[28px] lg:text-[34px] text-neutral-900 dark:text-white tracking-tighter leading-none transition-colors duration-700">
                      KAIAU,<br/>
                      <span className="text-[20px] lg:text-[24px] text-neutral-500 dark:text-neutral-400">ATIVICH VICHITTRAGOONTHAVON</span>
                    </h2>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-[10px] font-bold px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg uppercase tracking-widest transition-colors duration-700">MD_CANDIDATE</span>
                      <span className="text-[10px] font-bold px-3 py-1 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/10 text-neutral-600 dark:text-neutral-400 rounded-lg uppercase tracking-widest transition-colors duration-700">FULL_STACK_ENG</span>
                    </div>
                  </div>

                  {/* Bio block */}
                  <div className="space-y-4 text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium transition-colors duration-700">
                    <p>
                      3rd-Year Medical Student at Chiang Mai University, currently focused on Cardiac Electrophysiology, clinical research systems, and full-stack engineering.
                    </p>
                    <p>
                      Former Academic President and Research Club President of MedCMU, with international Olympiad experience across Astronomy, Astrophysics, Earth Science, and Linguistics.
                    </p>
                    <p>
                      Builder of the <span className="font-bold text-cyan-600 dark:text-cyan-400">VESTRIPPN3.0-AMG W06 Hybrid</span> ecosystem — a cloud-integrated operational platform designed for research telemetry, academic management, workflow automation, and AI-assisted medical infrastructure.
                    </p>
                  </div>

                  {/* Special Interests */}
                  <div className="space-y-3 mt-2">
                     <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2 transition-colors duration-700">Special Interests</h4>
                     <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] font-bold text-neutral-600 dark:text-neutral-400 transition-colors duration-700">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500"></span> Cardiac Electrophysiology</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500"></span> Clinical Research Systems</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> Full-Stack Development</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> Medical AI & Automation</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500"></span> Workflow Engineering</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500"></span> Human Performance Opt.</li>
                     </ul>
                  </div>

                  {/* Mission Status */}
                  <div className="p-5 mt-2 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center gap-4 transition-colors duration-700">
                     <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shrink-0"></div>
                     <div>
                       <div className="text-[10px] font-bold text-cyan-700/80 dark:text-cyan-400/80 uppercase tracking-widest transition-colors duration-700">Mission Status</div>
                       <div className="text-[14px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-tight transition-colors duration-700">Keep Building. Keep Winning.</div>
                     </div>
                  </div>

                  {/* Tech Stack Array */}
                  <div className="space-y-5 mt-4">
                     <h4 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2 transition-colors duration-700">Languages & Engineering Stack</h4>
                     
                     <StackRow title="FRONTEND SYSTEMS" color="blue" items={['Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML/CSS', 'Swift']} />
                     <StackRow title="BACKEND & INFRASTRUCTURE" color="emerald" items={['Python', 'Node.js', 'Prisma ORM', 'REST APIs', 'Google OAuth', 'PostgreSQL']} />
                     <StackRow title="AI & AUTOMATION" color="pink" items={['OpenAI API', 'Custom GPT Systems', 'PyTorch', 'Research Workflow Automation']} />
                     <StackRow title="DEVOPS & TOOLING" color="amber" items={['Git', 'GitHub Actions', 'Vercel Deployment', 'Cloud Environment Config']} />
                     <StackRow title="RESEARCH & MEDICAL" color="indigo" items={['Systematic Review Ops', 'Covidence Workflows', 'PubMed / Scopus / ClinicalKey', 'Clinical Telemetry Arch']} />
                  </div>

                  {/* Network Uplinks */}
                  <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-3 transition-colors duration-700">
                     <NetworkLink name="Instagram" href="https://www.instagram.com/kaiau.atv" />
                     <NetworkLink name="Facebook" href="https://www.facebook.com/kaiau.atv/" />
                     <NetworkLink name="GitHub" href="https://github.com/ativichkaiau" />
                     <NetworkLink name="LinkedIn" href="https://www.linkedin.com/in/ativich-vichittragoonthavon-b08b01258/" />
                  </div>

                </div>

                {/* RIGHT ZONE: DATA MATRIX (Unchanged) */}
                <div className="flex-1 flex flex-col p-6 lg:p-10 bg-transparent transition-colors duration-700">
                  
                  {/* Sector A: Science Olympiads */}
                  <h3 className="text-[12px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-6 flex items-center gap-3 transition-colors duration-700">
                    <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                    Sector Alpha: Science Olympiads 🥴
                  </h3>

                  <div className="space-y-4 mb-14">
                     <AchievementNode 
                       title="16th International Earth Science Olympiad (IESO 2023)" 
                       rank="RANK_72nd GLOBAL" 
                       medal="BRONZE MEDALIST 🥉" 
                       theme="amber"
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
                       theme="emerald"
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
                       theme="neutral"
                       details={[
                         "Silver Medalist 🥈 (ranked 14th) in the senior division of the 19th TAO to qualify for IOAA",
                         "Silver Medalist 🥈 (ranked 18th) in the senior division of the 20th TAO to qualify for IOAA"
                       ]}
                     />
                     <AchievementNode 
                       title="18th Thailand Astronomy Olympiad (TAO Junior)" 
                       rank="RANK_4th NATIONAL" 
                       medal="GOLD MEDALIST 🥇" 
                       theme="emerald"
                       details={[
                         "Gold Medalist 🥇 (ranked 4th) in the junior division of the 18th TAO to qualify for IAO",
                         "1. Qualified to become the Substitute Representative of Thailand to participate in IRAO 2021"
                       ]}
                     />
                     <AchievementNode 
                       title="17th Thailand Astronomy Olympiad (TAO Junior)" 
                       rank="RANK_24th NATIONAL" 
                       medal="BRONZE MEDALIST 🥉" 
                       theme="amber"
                       details={["Bronze Medalist 🥉 (ranked 24th) in the junior division of the 17th TAO to qualify for IAO"]}
                     />
                  </div>

                  {/* Sector B: Scientific Competitions */}
                  <h3 className="text-[12px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-6 flex items-center gap-3 transition-colors duration-700">
                    <div className="w-1.5 h-4 bg-pink-500 rounded-full"></div>
                    Sector Beta: Scientific Competitions 😎
                  </h3>

                  <div className="space-y-4 mb-14">
                     <AchievementNode 
                       title="YSC 2023 (Young Scientist’s Competition) - Chemistry" 
                       rank="ISEF QUALIFIER" 
                       medal="REGIONAL 1st PRIZE 🏆" 
                       theme="pink"
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
                       theme="amber"
                       details={[
                         "Physics and Material Science ⚛️ to qualify for the Regeneron ISEF 2024 🥉",
                         "Bronze Medal on the Regional Competition",
                         "Special Award: Best Material Science Innovation Project 🏆"
                       ]}
                     />
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl transition-colors duration-700">
                          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-widest transition-colors duration-700">Astro Challenge 2021</div>
                          <div className="text-[14px] font-bold text-neutral-900 dark:text-white transition-colors duration-700">3rd Prize Winner 🥉</div>
                        </div>
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl transition-colors duration-700">
                          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-widest transition-colors duration-700">Alumni Node</div>
                          <div className="text-[14px] font-bold text-neutral-900 dark:text-white transition-colors duration-700">JSTP 24th Gen</div>
                        </div>
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl transition-colors duration-700">
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-widest transition-colors duration-700">PM Science Award</div>
                          <div className="text-[14px] font-bold text-neutral-900 dark:text-white transition-colors duration-700">Top 5 Project</div>
                        </div>
                     </div>
                  </div>

                  {/* Sector C: Proficiency Telemetry */}
                  <h3 className="text-[12px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-3 transition-colors duration-700">
                    <div className="w-1.5 h-4 bg-cyan-500 rounded-full"></div>
                    Sector Gamma: Proficiency Telemetry 🔖
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
                     <div className="p-6 lg:p-8 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-500/20 rounded-3xl relative overflow-hidden transition-colors duration-700">
                        <div className="absolute top-0 right-0 p-5 text-[48px] lg:text-[64px] font-black text-cyan-500/20 dark:text-cyan-400/20 leading-none">8.0</div>
                        <div className="text-[14px] lg:text-[15px] font-black text-cyan-800 dark:text-cyan-100 uppercase mb-3 tracking-widest transition-colors duration-700">IELTS Overall</div>
                        <div className="text-[11px] lg:text-[12px] font-bold text-cyan-700/80 dark:text-cyan-300/80 uppercase tracking-widest transition-colors duration-700">(L8.5, R8.5, S7.5, W7 → avg. 7.875)</div>
                     </div>
                     <div className="p-6 lg:p-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-3xl relative overflow-hidden transition-colors duration-700">
                        <div className="absolute top-0 right-0 p-5 text-[48px] lg:text-[64px] font-black text-amber-500/20 dark:text-amber-400/20 leading-none">14.0A</div>
                        <div className="text-[14px] lg:text-[15px] font-black text-amber-800 dark:text-amber-100 uppercase mb-3 tracking-widest transition-colors duration-700">BMAT Overall</div>
                        <div className="text-[11px] lg:text-[12px] font-bold text-amber-700/80 dark:text-amber-300/80 uppercase tracking-widest transition-colors duration-700">(Part1=4.6, Part2=6.4, Part3=3A)</div>
                     </div>
                     <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl text-center transition-colors duration-700">
                          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 transition-colors duration-700">PET (B1)</div>
                          <div className="text-[18px] lg:text-[20px] font-black text-neutral-900 dark:text-white tracking-tighter transition-colors duration-700">168/170</div>
                        </div>
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl text-center transition-colors duration-700">
                          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 transition-colors duration-700">KET (A2)</div>
                          <div className="text-[18px] lg:text-[20px] font-black text-neutral-900 dark:text-white tracking-tighter transition-colors duration-700">170/170</div>
                        </div>
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl text-center transition-colors duration-700">
                          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 transition-colors duration-700">TGAT1 (Eng)</div>
                          <div className="text-[18px] lg:text-[20px] font-black text-neutral-900 dark:text-white tracking-tighter transition-colors duration-700">93.33/100</div>
                        </div>
                        <div className="p-5 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl text-center flex items-center justify-center transition-colors duration-700">
                          <div className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase leading-tight tracking-widest transition-colors duration-700">Pet Yod Mongkut<br/>Hon. Mention</div>
                        </div>
                     </div>
                  </div>

                  {/* Sector D: Archetype Archive */}
                  <h3 className="text-[12px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mb-6 flex items-center gap-3 transition-colors duration-700">
                    <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                    Sector Sigma: Legacy Archetypes // F1 Hall of Fame
                  </h3>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <LegendTile 
                      name="Michael Schumacher" 
                      titles="7" 
                      wins={91} 
                      poles={68} 
                      podiums={155} 
                      theme="red" 
                      epicMoment="1996 Spanish GP: A masterclass in torrential rain, winning his first race for Ferrari by over 45 seconds."
                      fact="Transformed Ferrari through total tactical discipline; established the 'Super-Athlete' driver standard." 
                    />
                    <LegendTile 
                      name="Lewis Hamilton" 
                      titles="7" 
                      wins={103} 
                      poles={104} 
                      podiums={197} 
                      theme="purple" 
                      epicMoment="2008 Brazilian GP: Secured his first World Championship by overtaking Timo Glock on the final corner of the final lap."
                      fact="Record holder for most wins/poles; used global platform to redefine cultural impact in racing." 
                    />
                    <LegendTile 
                      name="Juan Manuel Fangio" 
                      titles="5" 
                      wins={24} 
                      poles={29} 
                      podiums={35} 
                      theme="amber" 
                      epicMoment="1957 German GP: Overcame a 48-second deficit at the Nürburgring Nordschleife, breaking the lap record 9 times to win."
                      fact="The original master; won 5 championships with 4 different teams with a 46% win-to-race ratio." 
                    />
                    <LegendTile 
                      name="Max Verstappen" 
                      titles="4" 
                      wins={61} 
                      poles={40} 
                      podiums={107} 
                      theme="cyan" 
                      epicMoment="2021 Abu Dhabi GP: Executed a dramatic last-lap overtake to secure his maiden World Championship."
                      fact="Defined a new era of dominance with a relentless, aggressive pace and clinical consistency." 
                    />
                    <LegendTile 
                      name="Sebastian Vettel" 
                      titles="4" 
                      wins={53} 
                      poles={57} 
                      podiums={122} 
                      theme="indigo" 
                      epicMoment="2012 Brazilian GP: Spun to last place on lap 1, drove a damaged car through the rain to finish 6th and win the title."
                      fact="Youngest world champion; known for hyper-strategic intelligence and absolute work ethic." 
                    />
                    <LegendTile 
                      name="Alain Prost" 
                      titles="4" 
                      wins={51} 
                      poles={33} 
                      podiums={106} 
                      theme="emerald" 
                      epicMoment="1986 Australian GP: Masterminded a tire-conservation strategy to snatch the title after Mansell's dramatic blowout."
                      fact="'The Professor'; won through intellectual precision, risk-mitigation, and calculated execution." 
                    />
                    <LegendTile 
                      name="Ayrton Senna" 
                      titles="3" 
                      wins={41} 
                      poles={65} 
                      podiums={80} 
                      theme="amber" 
                      epicMoment="1993 European GP (Donington): Passed four cars on the opening lap in the wet, widely considered the greatest lap in F1 history."
                      fact="Redefined limits in Monaco and wet-weather; the spiritual master of absolute speed." 
                    />
                    <LegendTile 
                      name="Niki Lauda" 
                      titles="3" 
                      wins={25} 
                      poles={24} 
                      podiums={54} 
                      theme="red" 
                      epicMoment="1976 Italian GP: Returned to race and finished 4th just 40 days after receiving last rites following his fiery Nürburgring crash."
                      fact="Used engineering logic to survive the unsurvivable and out-calculate his rivals." 
                    />
                  </div>

                  <div className="h-12 lg:h-24"></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* --- MOBILE HUD NAV BAR --- */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-[64px] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-full z-[100] flex items-center justify-center px-3 gap-1 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] w-[95%] sm:w-auto overflow-x-auto no-scrollbar transition-all duration-700">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group ${item.active ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}>
               <span className={`text-[16px] ${item.active ? '' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
               {item.active && <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">{item.name}</span>}
            </Link>
          ))}
          <Link href="/identity" className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 group bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md">
             <span className="text-[16px]">⚇</span>
             <span className="text-[11px] font-bold tracking-tight pr-1 animate-in fade-in zoom-in duration-300">Identity</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StackRow({ title, items, color }: { title: string, items: string[], color: string }) {
  const badgeColors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  const textColors: Record<string, string> = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    pink: 'text-pink-500',
    amber: 'text-amber-500',
    indigo: 'text-indigo-500',
  };

  return (
    <div>
      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${textColors[color]}`}>{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`text-[10px] font-bold px-2 py-1 border rounded-md transition-colors duration-700 whitespace-nowrap ${badgeColors[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function NetworkLink({ name, href }: { name: string, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 lg:p-4 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 group active:scale-95">
       <span className="text-[11px] lg:text-[12px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest transition-colors duration-700 group-hover:text-neutral-900 dark:group-hover:text-white">{name}</span>
       <span className="text-[14px] text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">↗</span>
    </a>
  );
}

function AchievementNode({ title, rank, medal, details, theme }: { title: string, rank: string, medal: string, details: string[], theme: 'amber' | 'emerald' | 'neutral' | 'pink' | 'cyan' | 'red' }) {
  const borderColors = {
    amber: 'hover:border-amber-500/30',
    emerald: 'hover:border-emerald-500/30',
    neutral: 'hover:border-neutral-500/30',
    pink: 'hover:border-pink-500/30',
    cyan: 'hover:border-cyan-500/30',
    red: 'hover:border-red-500/30',
  };

  const badgeColors = {
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    neutral: 'text-neutral-600 dark:text-neutral-400',
    pink: 'text-pink-600 dark:text-pink-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`group/node p-6 lg:p-8 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-3xl transition-all duration-300 relative overflow-hidden hover:shadow-md active:scale-[0.99] ${borderColors[theme]}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-5 gap-2">
        <span className="text-[16px] lg:text-[18px] font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-tight transition-colors duration-700">{title}</span>
        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md transition-colors duration-700 whitespace-nowrap">{rank}</span>
      </div>
      <div>
        <div className={`text-[12px] font-black uppercase tracking-widest mb-4 transition-colors duration-700 ${badgeColors[theme]}`}>{medal}</div>
        <ul className="space-y-2">
           {details.map((line, i) => (
             <li key={i} className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed group-hover/node:text-neutral-900 dark:group-hover/node:text-white transition-colors duration-300">• {line}</li>
           ))}
        </ul>
      </div>
    </div>
  );
}

function LegendTile({ name, titles, wins, poles, podiums, theme, epicMoment, fact }: { name: string, titles: string, wins: number, poles: number, podiums: number, theme: 'red' | 'purple' | 'amber' | 'cyan' | 'indigo' | 'emerald', epicMoment: string, fact: string }) {
  const badgeColors = {
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-500/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-500/20',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500/20',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20',
  };

  const textColors = {
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
  };

  const borderHover = {
    red: 'hover:border-red-500/30',
    purple: 'hover:border-purple-500/30',
    amber: 'hover:border-amber-500/30',
    cyan: 'hover:border-cyan-500/30',
    indigo: 'hover:border-indigo-500/30',
    emerald: 'hover:border-emerald-500/30',
  };

  return (
    <div className={`group/legend p-6 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-3xl transition-all duration-300 relative overflow-hidden hover:shadow-md active:scale-[0.98] ${borderHover[theme]}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 gap-2">
        <span className="text-[16px] lg:text-[18px] font-black text-neutral-900 dark:text-white uppercase tracking-tight transition-colors duration-700">{name}</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border transition-colors duration-700 whitespace-nowrap ${badgeColors[theme]}`}>{titles} Titles</span>
      </div>

      {/* Telemetry Grid */}
      <div className="flex gap-4 lg:gap-6 mb-6 pb-5 border-b border-black/5 dark:border-white/5 transition-colors duration-700">
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">Wins</span>
           <span className={`text-[20px] font-black tabular-nums leading-none ${textColors[theme]}`}>{wins}</span>
        </div>
        <div className="flex flex-col border-l border-black/5 dark:border-white/5 pl-4 lg:pl-6 transition-colors duration-700">
           <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">Poles</span>
           <span className={`text-[20px] font-black tabular-nums leading-none ${textColors[theme]}`}>{poles}</span>
        </div>
        <div className="flex flex-col border-l border-black/5 dark:border-white/5 pl-4 lg:pl-6 transition-colors duration-700">
           <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">Podiums</span>
           <span className={`text-[20px] font-black tabular-nums leading-none ${textColors[theme]}`}>{podiums}</span>
        </div>
      </div>

      {/* Epic Moment */}
      <div className="mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 block ${textColors[theme]}`}>Epic Moment</span>
        <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed transition-colors duration-700">
          {epicMoment}
        </p>
      </div>

      {/* Legacy Fact */}
      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed group-hover/legend:text-neutral-700 dark:group-hover/legend:text-neutral-300 transition-colors duration-300 italic font-medium">
        "{fact}"
      </p>
    </div>
  );
}