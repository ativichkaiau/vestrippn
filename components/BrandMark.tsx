import Link from 'next/link';
import Image from 'next/image';

// The VESTRIPPN "3" mark (public/vestrippn-logo.png) + wordmark lockup. The
// logo art is transparent, so it reads on any header background; the "W12" tag
// picks up the livery accent.
export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`w10-brand-mark flex items-center gap-2 font-black tracking-tight transition-opacity hover:opacity-85 lg:gap-3 ${
        compact ? 'text-[17px] lg:text-[20px]' : 'text-[18px] lg:text-[22px]'
      }`}
      aria-label="VESTRIPPN, W12"
    >
      <Image
        src="/vestrippn-logo.png"
        alt="VESTRIPPN"
        width={64}
        height={64}
        priority
        className={`shrink-0 object-contain drop-shadow-sm ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
      />
      <span className="flex min-w-0 items-baseline">
        <span>VESTRIPPN</span>
        <span className="ml-1.5 font-mono text-[8px] font-black uppercase tracking-[0.14em] text-[color:var(--hub-accent)] transition-colors duration-700">
          W12
        </span>
      </span>
    </Link>
  );
}
