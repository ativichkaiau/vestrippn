'use client';
import { useEffect, useState } from "react";

type Livery = 'normal' | 'monza' | 'senna';
type Mode = 'day' | 'night';

function applyLivery(lv: Livery, md: Mode) {
  const el = document.documentElement;
  el.classList.remove('monza', 'senna', 'w08-monza', 'w08-senna');
  if (lv === 'monza' || lv === 'senna') {
    el.classList.add('dark', lv, `w08-${lv}`);
  } else {
    if (md === 'night') el.classList.add('dark');
    else el.classList.remove('dark');
  }
}

function isLivery(value: string | null): value is Livery {
  return value === 'normal' || value === 'monza' || value === 'senna';
}

function LiveryRow({ active, onClick, emoji, title, sub }: { active: boolean; onClick: () => void; emoji: string; title: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
        active ? 'bg-[#00A598]/10 dark:bg-[#00D2BE]/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
      }`}
    >
      <span className="text-[18px] leading-none">{emoji}</span>
      <div className="flex-1 leading-tight">
        <div className="text-[12px] font-bold text-neutral-900 dark:text-white">{title}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{sub}</div>
      </div>
      {active && <span className="text-[12px] text-[#00A598] dark:text-[#00D2BE] font-black">✓</span>}
    </button>
  );
}

export default function ThemeToggle() {
  const [livery, setLivery] = useState<Livery>('normal');
  const [mode, setMode] = useState<Mode>('night');
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Initialise from storage, falling back to time-of-day for Normal livery
  useEffect(() => {
    const storedLivery = localStorage.getItem('vest_livery') as Livery | null;
    const storedMode = localStorage.getItem('vest_mode') as Mode | null;
    const hour = new Date().getHours();
    const autoMode: Mode = hour < 6 || hour >= 18 ? 'night' : 'day';

    const lv: Livery = isLivery(storedLivery) ? storedLivery : 'normal';
    const md: Mode = storedMode === 'day' || storedMode === 'night' ? storedMode : autoMode;

    setLivery(lv);
    setMode(md);
    applyLivery(lv, md);
    setReady(true);
  }, []);

  const choose = (lv: Livery, md?: Mode) => {
    const nextMode = md ?? mode;
    setLivery(lv);
    if (md) setMode(md);
    applyLivery(lv, nextMode);
    localStorage.setItem('vest_livery', lv);
    if (md) localStorage.setItem('vest_mode', md);
    setOpen(false);
  };

  if (!ready) {
    return <div className="w-[104px] h-[38px] rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />;
  }

  const label = livery === 'monza' ? 'Rothmans' : livery === 'senna' ? 'Senna' : mode === 'night' ? 'Night' : 'Day';
  const icon = livery === 'monza' ? '🏁' : livery === 'senna' ? '🇧🇷' : mode === 'night' ? '🌙' : '☀️';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 border border-transparent dark:border-white/5 active:scale-95 group shadow-sm"
        title="Select livery"
      >
        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Livery</span>
          <span className="text-[11px] font-bold tracking-tight text-neutral-900 dark:text-white">{label}</span>
        </div>
        <span className="text-[16px] leading-none group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 z-[60] p-2 rounded-2xl bg-white/95 dark:bg-[#0e0e10]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgb(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="px-3 pt-1.5 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Normal Livery</div>
            <LiveryRow active={livery === 'normal' && mode === 'day'} onClick={() => choose('normal', 'day')} emoji="☀️" title="Day" sub="Pristine White" />
            <LiveryRow active={livery === 'normal' && mode === 'night'} onClick={() => choose('normal', 'night')} emoji="🌙" title="Night" sub="Deep Carbon" />
            <div className="my-1.5 h-px bg-black/5 dark:bg-white/10" />
            <div className="px-3 pt-0.5 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Special Liveries</div>
            <LiveryRow active={livery === 'monza'} onClick={() => choose('monza')} emoji="🏁" title="Rothmans" sub="Williams · Navy · Brass · Red" />
            <LiveryRow active={livery === 'senna'} onClick={() => choose('senna')} emoji="🇧🇷" title="Senna" sub="Yellow · Green · Blue" />
          </div>
        </>
      )}
    </div>
  );
}
