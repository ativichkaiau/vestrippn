'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { REVIEW_CHANGE_EVENT } from '@/lib/learn/review';
import type { ReviewQueue } from '@/app/learn/cases/types';

/** The signed-in user's case review queue; refreshed after each finished run and on focus. */
export function useReviewQueue(): ReviewQueue | null {
  const { status } = useSession();
  const [queue, setQueue] = useState<ReviewQueue | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch('/api/learn/review', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as ReviewQueue;
        if (!stopped) setQueue(data);
      } catch {
        /* offline: keep what we had */
      }
    };
    void load();
    window.addEventListener(REVIEW_CHANGE_EVENT, load);
    window.addEventListener('focus', load);
    return () => {
      stopped = true;
      window.removeEventListener(REVIEW_CHANGE_EVENT, load);
      window.removeEventListener('focus', load);
    };
  }, [status]);

  return status === 'authenticated' ? queue : null;
}
