'use client';

import { usePathname } from 'next/navigation';
import { resolvePath } from '@/lib/system/navigation';
import { useHydrated } from './hooks';

/**
 * The current route, written as a VESTRIPPN path.
 *
 * `deferred` writes the path only after hydration. The root 404 is prerendered
 * once (as /_not-found) and served for every unmatched URL, so its server HTML
 * cannot know the requested path.
 */
export default function RequestedPath({ deferred = false }: { deferred?: boolean }) {
  const pathname = usePathname() ?? '/';
  const hydrated = useHydrated();
  if (deferred && !hydrated) return <>~/…</>;
  return <>{resolvePath(pathname).display}</>;
}
