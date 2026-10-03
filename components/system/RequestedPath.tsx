'use client';

import { usePathname } from 'next/navigation';
import { resolvePath } from '@/lib/system/navigation';

/** The current route, written as a VESTRIPPN path. */
export default function RequestedPath() {
  return <>{resolvePath(usePathname() ?? '/').display}</>;
}
