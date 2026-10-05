'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { REVIEW_CHANGE_EVENT } from '@/lib/learn/review';
import type { CourseCountdown } from '@/lib/study-overview';

export type StudyOverview = {
  countdowns: CourseCountdown[];
  review: { due: number; next: string | null };
  anki: { due: number; lastSync: string } | null;
};

/** Countdowns, case reviews due and Anki due, for the Study view and hub. */
export function useStudyOverview(): { overview: StudyOverview | null; signedIn: boolean; error: string | null } {
  const { status } = useSession();
  const [overview, setOverview] = useState<StudyOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch('/api/study/overview', { cache: 'no-store' });
        const body = (await res.json().catch(() => null)) as (StudyOverview & { error?: string }) | null;
        if (stopped) return;
        if (!res.ok || !body) setError(body?.error ?? 'Could not load your study overview.');
        else {
          setOverview(body);
          setError(null);
        }
      } catch {
        if (!stopped) setError('Offline: showing what was loaded last.');
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

  return { overview: status === 'authenticated' ? overview : null, signedIn: status === 'authenticated', error };
}
