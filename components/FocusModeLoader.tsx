'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { FocusLaunchDetail } from './FocusMode';

/* Focus mode (the F1 lap timer) is large and only used on request, so it is
   loaded the first time something asks for it: a `vest:focus-open` event,
   or the cross-page sessionStorage flag set by ⌘K. Once mounted, FocusMode
   listens for later requests itself. */

const FocusMode = dynamic(() => import('./FocusMode'), { ssr: false });

export default function FocusModeLoader() {
  const [launch, setLaunch] = useState<FocusLaunchDetail | true | null>(null);

  useEffect(() => {
    if (launch) return;
    const onOpen = (event: Event) => setLaunch((event as CustomEvent<FocusLaunchDetail | undefined>).detail ?? true);
    let timer: number | undefined;
    try {
      // FocusMode reads (and clears) the flag itself once mounted.
      if (sessionStorage.getItem('vest_focus_open') === '1') timer = window.setTimeout(() => setLaunch(true), 0);
    } catch {
      /* storage unavailable */
    }
    window.addEventListener('vest:focus-open', onOpen);
    return () => {
      window.removeEventListener('vest:focus-open', onOpen);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [launch]);

  return launch ? <FocusMode showTrigger={false} launch={launch} /> : null;
}
