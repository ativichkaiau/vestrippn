import Link from 'next/link';

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`w10-brand-mark flex items-center gap-2 font-black tracking-tight transition-opacity hover:opacity-85 lg:gap-3 ${
        compact ? 'text-[17px] lg:text-[20px]' : 'text-[18px] lg:text-[22px]'
      }`}
      aria-label="VEStriPPN 3.0, W10 EQ Power"
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl ${
          compact ? 'h-7 w-7 text-[14px]' : 'h-8 w-8 text-[16px]'
        }`}
      >
        V
      </span>
      <span className="flex min-w-0 items-baseline">
        <span>VESTRIPPN</span>
        <span className="transition-colors duration-700" style={{ color: 'var(--hub-accent)' }}>
          3.0
        </span>
        <span className="ml-1 font-mono text-[7px] font-black uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
          W10
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--w10-clay-edge)] px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-neutral-500 shadow-[var(--w10-clay-shadow-pressed)] dark:text-neutral-400 xl:inline-flex">
        <span style={{ color: 'var(--hub-accent)' }}>EQ Power</span>
      </span>
    </Link>
  );
}
