'use client';

import { useSyncExternalStore } from 'react';

/* The time where the environment lives (Chiang Mai, ICT, UTC+7) — rendered
   after hydration so the server and client never disagree about the minute. */

const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false });

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

export default function LocalTime() {
  const time = useSyncExternalStore(subscribe, () => format.format(new Date()), () => '');
  return (
    <time className="sys-local-time" suppressHydrationWarning>
      {time ? `Chiang Mai · ${time} ICT` : 'Chiang Mai · ICT'}
    </time>
  );
}
