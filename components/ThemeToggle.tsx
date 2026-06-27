'use client';
import { useEffect, useState } from "react";
import { setLowPowerMode } from "./useLowPower";

type Livery = 'normal' | 'monza' | 'senna' | 'verstappen' | 'ferrari';
type Mode = 'day' | 'night';

function applyLivery(lv: Livery, md: Mode) {
  const el = document.documentElement;
  el.classList.remove('monza', 'senna', 'verstappen', 'ferrari', 'w09-monza', 'w09-senna', 'w09-verstappen', 'w09-ferrari');
  if (lv === 'monza' || lv === 'senna' || lv === 'verstappen' || lv === 'ferrari') {
    el.classList.add('dark', lv, `w09-${lv}`);
  } else {
    if (md === 'night') el.classList.add('dark');
    else el.classList.remove('dark');
  }
}

function isLivery(value: string | null): value is Livery {
  return value === 'normal' || value === 'monza' || value === 'senna' || value === 'verstappen' || value === 'ferrari';
}

function LiveryRow({
  active,
  onClick,
  emoji,
  title,
  sub,
  swatches = [],
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  sub: string;
  swatches?: string[];
}) {
  return (
    <button
      onClick={onClick}
      className={`w10-clay-tab w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left ${
        active ? 'bg-[#00A598]/10 dark:bg-[#00D2BE]/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
      }`}
      data-state={active ? 'active' : undefined}
    >
      <span className="shrink-0 text-[18px] leading-none">{emoji}</span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-[12px] font-bold text-neutral-900 dark:text-white">{title}</div>
        <div className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{sub}</div>
      </div>
      {swatches.length > 0 && (
        <div className="flex h-4 w-12 shrink-0 overflow-hidden rounded-[4px] border border-black/10 bg-white/40 p-px shadow-sm dark:border-white/20 dark:bg-black/25" aria-hidden>
          {swatches.map((swatch) => (
            <span key={swatch} className="h-full min-w-0 flex-1" style={{ backgroundColor: swatch }} />
          ))}
        </div>
      )}
      {active && <span className="shrink-0 text-[12px] font-black text-[#00A598] dark:text-[#00D2BE]">✓</span>}
    </button>
  );
}

export default function ThemeToggle() {
  const [livery, setLivery] = useState<Livery>('normal');
  const [mode, setMode] = useState<Mode>('night');
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  // Initialise from storage, falling back to time-of-day for Normal livery
  useEffect(() => {
    const storedLivery = localStorage.getItem('vest_livery') as Livery | null;
    const storedMode = localStorage.getItem('vest_mode') as Mode | null;
    const hour = new Date().getHours();
    const autoMode: Mode = hour < 6 || hour >= 18 ? 'night' : 'day';

    const lv: Livery = isLivery(storedLivery) ? storedLivery : 'normal';
    const md: Mode = storedMode === 'day' || storedMode === 'night' ? storedMode : autoMode;

    applyLivery(lv, md);
    const handle = window.setTimeout(() => {
      setLivery(lv);
      setMode(md);
      setLowPower(document.documentElement.classList.contains('low-power'));
      setReady(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const toggleLowPower = () => {
    const next = !lowPower;
    setLowPower(next);
    setLowPowerMode(next);
  };

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
    return <div className="w10-livery-skeleton h-[38px] w-[38px] rounded-full bg-black/5 animate-pulse dark:bg-white/5 sm:w-[104px]" />;
  }

  const label = livery === 'monza' ? 'Williams' : livery === 'senna' ? 'Senna' : livery === 'verstappen' ? 'Verstappen' : livery === 'ferrari' ? 'Ferrari' : mode === 'night' ? 'Night' : 'Day';
  const icon = livery === 'monza' ? '🏁' : livery === 'senna' ? '🇧🇷' : livery === 'verstappen' ? '🇳🇱' : livery === 'ferrari' ? '🐎' : mode === 'night' ? '🌙' : '☀️';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w10-livery-trigger w10-clay-control flex h-[38px] w-[38px] items-center justify-center gap-2 rounded-full border border-transparent bg-black/5 p-0 shadow-sm transition-all duration-300 hover:bg-black/10 active:scale-95 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 sm:h-auto sm:w-auto sm:justify-start sm:px-3 sm:py-1.5"
        title="Select livery"
      >
        <div className="hidden flex-col items-start leading-none sm:flex">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Livery</span>
          <span className="text-[11px] font-bold tracking-tight text-neutral-900 dark:text-white">{label}</span>
        </div>
        <span className="text-[16px] leading-none group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setOpen(false)} />
          <div className="w10-clay-surface absolute right-0 mt-2 w-56 z-[60] p-2 rounded-2xl bg-white/95 dark:bg-[#0e0e10]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgb(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="px-3 pt-1.5 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Normal Livery</div>
            <LiveryRow active={livery === 'normal' && mode === 'day'} onClick={() => choose('normal', 'day')} emoji="☀️" title="Day" sub="Pristine White" />
            <LiveryRow active={livery === 'normal' && mode === 'night'} onClick={() => choose('normal', 'night')} emoji="🌙" title="Night" sub="Deep Carbon" />
            <div className="my-1.5 h-px bg-black/5 dark:bg-white/10" />
            <div className="px-3 pt-0.5 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Special Liveries</div>
            <LiveryRow
              active={livery === 'monza'}
              onClick={() => choose('monza')}
              emoji="🏁"
              title="Williams"
              sub="Navy · Gold · Red"
              swatches={['#210E6F', '#FFFFFF', '#C59955', '#D5172D']}
            />
            <LiveryRow
              active={livery === 'senna'}
              onClick={() => choose('senna')}
              emoji="🇧🇷"
              title="Senna"
              sub="Helmet Yellow · Green · Blue"
              swatches={['#061329', '#FFD400', '#00A651', '#1F6FEB']}
            />
            <LiveryRow
              active={livery === 'verstappen'}
              onClick={() => choose('verstappen')}
              emoji="🇳🇱"
              title="Verstappen"
              sub="Orange · Red · White · Blue"
              swatches={['#FF6B00', '#DC2626', '#FFFFFF', '#1D4ED8', '#061A3A']}
            />
            <LiveryRow
              active={livery === 'ferrari'}
              onClick={() => choose('ferrari')}
              emoji="🐎"
              title="Ferrari"
              sub="Rosso · Giallo · Nero"
              swatches={['#EF1A2D', '#FFDD00', '#0B0304', '#FFFFFF']}
            />
            <div className="my-1.5 h-px bg-black/5 dark:bg-white/10" />
            <div className="px-3 pt-0.5 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Performance</div>
            <button
              onClick={toggleLowPower}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="text-[18px] leading-none">🔋</span>
              <div className="flex-1 leading-tight">
                <div className="text-[12px] font-bold text-neutral-900 dark:text-white">Low-Power Mode</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Stops animations · saves battery</div>
              </div>
              <span
                className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${lowPower ? 'bg-[#00A598] dark:bg-[#00D2BE]' : 'bg-black/15 dark:bg-white/15'}`}
              >
                <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all ${lowPower ? 'left-[16px]' : 'left-[2px]'}`} />
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
