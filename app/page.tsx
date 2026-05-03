import Clock from "../components/Clock";
import ThemeToggle from "../components/ThemeToggle"; 
import TodaysCommand from "../components/TodaysCommand";
import NotificationCenter from '../components/NotificationCenter';
import ArcDate from '../components/ArcDate';
import DomainHealth from '../components/DomainHealth';
import QuickAccess from "@/components/QuickAccess";

export default function Home() {
  return (
    <>
      {/* TOP BAR */}
      <header className="h-[56px] border-b border-borderline flex items-center justify-between px-6 shrink-0">
        <div className="font-orbitron font-bold text-[18px] text-textPri uppercase tracking-wider">vestrippn3point0</div>
        <div className="text-[13px] text-textSec font-medium">
          <ArcDate />
        </div>
        <div className="flex gap-4 text-textSec text-[14px]">
          <span className="cursor-help" title="Academics">📚</span>
          <span className="cursor-help" title="Fitness">🏋️</span>
          <span className="cursor-help" title="Research">🔬</span>
          <ThemeToggle />
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[220px] border-r border-borderline flex flex-col justify-between p-6 shrink-0">
          <nav className="flex flex-col gap-4 text-[13px] text-textSec">
            <div className="text-accentCyan cursor-pointer transition-all flex items-center gap-2">
              <span className="text-[10px]">◉</span> Dashboard
            </div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">Academics</div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">Research</div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">Fitness & Diet</div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">Archive</div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">IELTS</div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">Tools & Links</div>
            <div className="pl-4 hover:text-accentCyan cursor-pointer transition-all">Identity</div>
          </nav>
          
          <div className="border-t border-borderline pt-4">
            <Clock />
            <div className="text-[11px] text-textSec">Schumacher standard.</div>
          </div>
        </aside>

        {/* DASHBOARD CONTENT */}
        <main className="flex-1 flex gap-6 p-6 overflow-y-auto">
          
          {/* LEFT PANEL (Main Panel ~60%) */}
          <div className="flex-[0.6] flex flex-col gap-6 min-w-[400px]">
            
            {/* CARD 1: TODAY'S COMMAND */}
            <TodaysCommand/>
            <NotificationCenter />

            {/* CARDS 2 & 3: ACADEMICS & RESEARCH */}
            <div className="flex gap-6">
              {/* Academics */}
              <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors flex-1">
                <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex justify-between items-center mb-4">
                  <span>Academics</span>
                  <span className="text-statusGreen text-[11px] normal-case">On Track</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-textPri">KUB Module</span>
                      <span className="text-textSec">60%</span>
                    </div>
                    <div className="h-[4px] w-full bg-base rounded overflow-hidden">
                      <div className="h-full bg-textSec w-[60%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-textPri">GI Module</span>
                      <span className="text-textSec">20%</span>
                    </div>
                    <div className="h-[4px] w-full bg-base rounded overflow-hidden">
                      <div className="h-full bg-textMuted w-[20%]"></div>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-accentCyan hover:underline cursor-pointer">
                    ↗ Open Mango Canvas
                  </div>
                </div>
              </div>

              {/* Research */}
              <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors flex-1">
                <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex justify-between items-center mb-4">
                  <span>Research</span>
                  <span className="text-textSec text-[11px] normal-case">Day 5</span>
                </div>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[13px] text-textPri mb-1 line-clamp-2">Brugada Phenotypes in SE Asia</div>
                    <div className="text-[11px] text-accentAmber border border-accentAmber/30 bg-accentAmber/10 inline-block px-2 py-0.5 rounded mt-1">Extraction Phase</div>
                  </div>
                  <div className="text-[11px] text-textSec mt-4">
                    Next: Finish data table for cohort A
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: FITNESS */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec flex justify-between items-center mb-4">
                <span>Fitness This Week</span>
                <span className="font-plex text-textPri normal-case">3/5 Done</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="w-full mr-8">
                  <div className="flex gap-1 mb-2 h-[8px]">
                    <div className="flex-1 bg-statusGreen rounded-sm"></div>
                    <div className="flex-1 bg-statusGreen rounded-sm"></div>
                    <div className="flex-1 bg-statusGreen rounded-sm"></div>
                    <div className="flex-1 bg-base border border-borderline rounded-sm"></div>
                    <div className="flex-1 bg-base border border-borderline rounded-sm"></div>
                  </div>
                  <div className="text-[11px] text-textSec">Last: Upper Body Hypertrophy</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-barlow text-[28px] text-textPri leading-none">5 DAYS 🔥</div>
                  <div className="text-[11px] text-textSec mt-1">Current Streak</div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL (~40%) */}
          <div className="flex-[0.4] flex flex-col gap-6 min-w-[280px]">
            
            {/* CARD 5: DOMAIN HEALTH */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4">Domain Health</div>
           <DomainHealth />
            </div>
            {/* CARD 6: QUICK ACCESS */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4 flex justify-between items-center">
                <span>Quick Access</span>
                <span className="text-[10px] font-mono text-textMuted">External Links</span>
              </div>
              <QuickAccess />
            </div>
           

            {/* CARD 7: REMINDERS */}
            <div className="bg-surface border border-borderline rounded-lg p-5 shadow-sm hover:border-accentCyan/40 transition-colors">
              <div className="font-barlow font-semibold text-[13px] uppercase tracking-wide text-textSec mb-4">Reminders</div>
              <ul className="text-[13px] text-textPri space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accentCyan mt-[2px]">·</span> 
                  <span>Laundry — <span className="text-accentAmber">Today</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-textMuted mt-[2px]">·</span> 
                  <span className="text-textSec">Research call — 3:00 PM</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-textMuted mt-[2px]">·</span> 
                  <span className="text-textSec">IELTS prep — Sun 10:00 AM</span>
                </li>
              </ul>
            </div>

            {/* CARD 8: IDENTITY ANCHOR */}
            <div className="bg-surface border border-borderline border-dashed rounded-lg p-5 shadow-sm mt-auto">
              <div className="text-[13px] text-textSec italic text-center px-4">
                "Train, recover, repeat. No drama."
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
