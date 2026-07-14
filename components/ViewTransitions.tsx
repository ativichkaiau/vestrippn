'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { setVtNavigate, startViewTransition, vtActive } from '@/lib/view-transition';

// Drives cross-hub navigation through the native View Transitions API. Intercepts
// internal <a> clicks (the nav rail, mobile dock, brand mark) and publishes a
// navigate fn the command palette reuses, so every hub switch morphs the shared
// chrome (brand, nav rail, hero) instead of hard-swapping. Falls back to a plain
// router.push where the API is unavailable or motion is reduced/low-power.
export default function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const finish = useRef<null | (() => void)>(null);

  // Resolve the in-flight transition once the new route commits (the browser
  // then captures the "after" snapshot and animates between the two).
  useEffect(() => {
    if (finish.current) {
      finish.current();
      finish.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    const navigate = (href: string) => {
      const path = href.split('#')[0];
      if (path === window.location.pathname || !vtActive()) {
        router.push(href);
        return;
      }
      startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finish.current = resolve;
            router.push(href);
          }),
      );
      // Failsafe: never leave the page frozen if the route effect doesn't fire.
      window.setTimeout(() => {
        if (finish.current) {
          finish.current();
          finish.current = null;
        }
      }, 900);
    };
    setVtNavigate(navigate);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (
        !href.startsWith('/') ||
        a.getAttribute('target') === '_blank' ||
        a.hasAttribute('download') ||
        a.hasAttribute('data-no-vt')
      ) {
        return;
      }
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      setVtNavigate(null);
    };
  }, [router]);

  return null;
}
