export default function Loading() {
  const steps = [
    'Preparing W10 clay cockpit',
    'Syncing mission context',
    'Loading study and research hubs',
    'Calibrating livery accents',
    'Command surface ready',
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--w10-canvas)] text-neutral-900 transition-colors duration-700 dark:text-neutral-100">
      <div className="w10-clay-surface w-[min(88vw,420px)] rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-[26px] font-black text-white shadow-[0_0_40px_rgba(0,165,152,0.25)] dark:bg-white dark:text-black">
            V
            <span className="w09-boot-ring lp-keep" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--hub-accent)]">W10 <span className="font-revolut normal-case tracking-normal">Revolut</span></div>
            <div className="mt-1 truncate text-lg font-black tracking-tight">Clay Cockpit Handoff</div>
          </div>
        </div>

        <div className="mt-6 h-[3px] overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full w-1/3 rounded-full animate-loader-sweep" style={{ background: 'linear-gradient(90deg,var(--hub-accent),var(--hub-accent-deep))' }} />
        </div>

        <div className="mt-5 space-y-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className="w09-boot-step w10-clay-inset flex items-center justify-between gap-3 rounded-2xl bg-black/[0.035] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 dark:bg-white/[0.045] dark:text-neutral-400"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="truncate">{step}</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hub-accent)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
