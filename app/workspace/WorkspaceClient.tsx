'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArcDate from '@/components/ArcDate';
import BrandMark from '@/components/BrandMark';
import ThemeToggle from '@/components/ThemeToggle';
import TopNavProfile from '@/components/TopNavProfile';
import { MobileHubNav, NavRail } from '@/components/HubNav';
import DailyStudyPlan from '@/components/DailyStudyPlan';
import CourseSemesterManager from '@/components/CourseSemesterManager';
import BackupManager from '@/components/BackupManager';

type Tab = 'plan' | 'courses' | 'backup';

const tabs: { id: Tab; label: string; eyebrow: string; description: string }[] = [
  { id: 'plan', label: 'Daily Plan', eyebrow: 'Priority agenda', description: 'Bring deadlines, reviews, tasks, and research into one time-boxed run sheet.' },
  { id: 'courses', label: 'Courses', eyebrow: 'Curriculum control', description: 'Edit course links and exam dates, then archive semesters when the block is complete.' },
  { id: 'backup', label: 'Backup & Sync', eyebrow: 'Portable state', description: 'Keep focus history and preferences moving with you, and export a restorable copy of your work.' },
];

export default function WorkspaceClient({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  function selectTab(next: Tab) {
    setTab(next);
    router.replace(`/workspace?tab=${next}`, { scroll: false });
  }

  const active = tabs.find((item) => item.id === tab) ?? tabs[0];

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#FAFAFA] font-sans text-neutral-900 transition-colors duration-700 dark:bg-[#050505] dark:text-neutral-100">
      <header className="z-50 flex h-[72px] shrink-0 items-center justify-between border-b border-black/5 bg-white/65 px-4 backdrop-blur-2xl transition-colors duration-700 dark:border-white/5 dark:bg-black/40 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            type="button"
            onClick={() => setIsSidebarExpanded((value) => !value)}
            className="hidden rounded-xl p-2 text-neutral-500 transition hover:bg-black/5 active:scale-95 dark:text-neutral-400 dark:hover:bg-white/10 lg:flex"
            aria-label="Toggle navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="14" y2="18" /></svg>
          </button>
          <BrandMark />
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden text-[11px] font-medium tracking-tight text-neutral-400 sm:block dark:text-neutral-500"><ArcDate /></div>
          <div className="hidden h-4 w-px bg-black/10 sm:block dark:bg-white/10" />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('vest:focus-open'))}
            className="hidden rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10 sm:inline-flex"
          >
            <span className="mr-2 text-sm">🏁</span> Focus
          </button>
          <TopNavProfile />
          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <NavRail active="Workspace" expanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded((value) => !value)} />
        <main className="custom-scrollbar flex-1 overflow-y-auto p-4 pb-32 transition-all duration-500 sm:p-6 lg:p-10 lg:pb-10">
          <div className="mx-auto max-w-[1400px] space-y-7 lg:space-y-9">
            <section className="w85-panel-accent relative overflow-hidden rounded-[28px] border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.035] sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--hub-accent)]/15 blur-3xl" />
              <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--hub-accent)]">W85 · Workspace</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Make the final edition usable every day.</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">A durable control layer for your course data, daily study time, and portable history. Your edits stay attached to your account and flow into the rest of the cockpit.</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-xs dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="font-black uppercase tracking-widest text-neutral-400">Active surface</p>
                  <p className="mt-1 font-bold">{active.label} · {active.eyebrow}</p>
                </div>
              </div>
              <nav className="relative z-10 mt-7 flex flex-wrap gap-2" aria-label="Workspace sections">
                {tabs.map((item) => (
                  <button key={item.id} type="button" onClick={() => selectTab(item.id)} aria-current={tab === item.id ? 'page' : undefined} className={`rounded-full border px-4 py-2.5 text-xs font-black transition ${tab === item.id ? 'border-[var(--hub-accent)] bg-[var(--hub-accent)] text-black shadow-[0_8px_24px_-12px_var(--hub-accent)]' : 'border-black/10 bg-white/55 hover:-translate-y-0.5 hover:bg-black/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10'}`}>
                    {item.label}
                  </button>
                ))}
              </nav>
            </section>

            <section key={tab} className="w85-reveal space-y-5" data-motion="workspace-panel">
              <div className="px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">{active.eyebrow}</p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{active.description}</p>
              </div>
              {tab === 'plan' && <DailyStudyPlan />}
              {tab === 'courses' && <CourseSemesterManager />}
              {tab === 'backup' && <BackupManager />}
            </section>
          </div>
        </main>
        <MobileHubNav active="Workspace" />
      </div>
    </div>
  );
}
