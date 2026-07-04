import Link from 'next/link';

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`w10-brand-mark flex items-center gap-2 font-black tracking-tight transition-opacity hover:opacity-85 lg:gap-3 ${
        compact ? 'text-[17px] lg:text-[20px]' : 'text-[18px] lg:text-[22px]'
      }`}
      aria-label="VEStriPPN 3.0, W11 EQ Future"
    >
      <span
        className={`font-revolut flex shrink-0 items-center justify-center rounded-xl ${
          compact ? 'h-7 w-7 text-[15px]' : 'h-8 w-8 text-[17px]'
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
          W11
        </span>
      </span>
      <span className="hidden shrink-0 items-center rounded-full border border-[color:var(--w10-clay-edge)] px-3 py-1 shadow-[var(--w10-clay-shadow-pressed)] xl:inline-flex">
        <span className="font-revolut text-[13px] font-bold leading-none text-neutral-900 dark:text-white">
          EQ&nbsp;Future
        </span>
      </span>
    </Link>
  );
}
