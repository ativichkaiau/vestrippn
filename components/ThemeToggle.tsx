'use client';
import { useEffect, useState } from "react";
import { setLowPowerMode } from "./useLowPower";
import { applyLivery, getLivery, getMode, LIVERY_LABEL, type Livery, type Mode } from "@/lib/theme";

// Trigger-button glyph per livery (the picker rows carry their own emoji).
const LIVERY_ICON: Record<Livery, string> = {
  normal: '☀️', monza: '🏁', senna: '🇧🇷', verstappen: '🇳🇱', ferrari: '🐎',
  forceindia: '🧡', mclaren: '🏎️', benetton: '🌈', jps: '🖤', alpine: '🇫🇷',
};

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
    const lv = getLivery();
    const md = getMode();

    applyLivery(lv, md);
    const handle = window.setTimeout(() => {
      setLivery(lv);
      setMode(md);
      setLowPower(document.documentElement.classList.contains('low-power'));
      setReady(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  // Re-sync when the theme/low-power is changed elsewhere (e.g. the ⌘K palette).
  useEffect(() => {
    const sync = () => {
      setLivery(getLivery());
      setMode(getMode());
      setLowPower(document.documentElement.classList.contains('low-power'));
    };
    window.addEventListener('vest:theme-change', sync);
    window.addEventListener('vest-lowpower', sync);
    return () => {
      window.removeEventListener('vest:theme-change', sync);
      window.removeEventListener('vest-lowpower', sync);
    };
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

  const label = livery === 'normal' ? (mode === 'night' ? 'Night' : 'Day') : LIVERY_LABEL[livery];
  const icon = livery === 'normal' ? (mode === 'night' ? '🌙' : '☀️') : LIVERY_ICON[livery];

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
            <LiveryRow active={livery === 'normal' && mode === 'day'} onClick={() => choose('normal', 'day')} emoji="☀️" title="Day" sub="Liquid Silver" />
            <LiveryRow active={livery === 'normal' && mode === 'night'} onClick={() => choose('normal', 'night')} emoji="🌙" title="Night" sub="Obsidian EQ" />
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
              sub="F1-75 · Deep Rosso · Verde"
              swatches={['#A80814', '#080304', '#009640', '#FFDD00']}
            />
            <LiveryRow
              active={livery === 'forceindia'}
              onClick={() => choose('forceindia')}
              emoji="🧡"
              title="Force India"
              sub="Saffron · Green · Silver"
              swatches={['#FF6D0A', '#00A94F', '#C9CED6', '#101216']}
            />
            <LiveryRow
              active={livery === 'mclaren'}
              onClick={() => choose('mclaren')}
              emoji="🏎️"
              title="McLaren Marlboro"
              sub="Race Red · White · Gold"
              swatches={['#E4002B', '#FFFFFF', '#B98A2A', '#160C0D']}
            />
            <LiveryRow
              active={livery === 'benetton'}
              onClick={() => choose('benetton')}
              emoji="🌈"
              title="Benetton"
              sub="Green · Blue · Yellow · Red"
              swatches={['#00A651', '#0072CE', '#F5B800', '#E02328']}
            />
            <LiveryRow
              active={livery === 'jps'}
              onClick={() => choose('jps')}
              emoji="🖤"
              title="JPS Lotus"
              sub="Black · Gold"
              swatches={['#080703', '#D4AF37', '#A37D20', '#F0E2B0']}
            />
            <LiveryRow
              active={livery === 'alpine'}
              onClick={() => choose('alpine')}
              emoji="🇫🇷"
              title="Alpine"
              sub="BWT Blue · Pink"
              swatches={['#0090D4', '#EC0080', '#FFFFFF', '#061524']}
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
