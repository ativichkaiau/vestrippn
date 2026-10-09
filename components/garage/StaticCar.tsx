'use client';

import { useId } from 'react';

/* The flat drawing of OBJECT_001: the viewer's placeholder and WebGL fallback,
   and the root page teaser. Paint comes from --viewer-paint / --viewer-stripe /
   --viewer-detail set by the parent. */
export default function StaticCar({ className = 'sys-viewer-static' }: { className?: string }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 600 340" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--viewer-paint)" />
          <stop offset="1" stopColor="var(--viewer-stripe)" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="258" rx="247" ry="59" fill="none" stroke="var(--line-strong)" />
      <ellipse cx="295" cy="249" rx="176" ry="29" fill="#000" opacity=".22" />
      <g fill="#14191e" stroke="#5e646d" strokeWidth="3">
        <ellipse cx="375" cy="155" rx="28" ry="39" transform="rotate(-16 375 155)" />
        <ellipse cx="445" cy="217" rx="29" ry="39" transform="rotate(-16 445 217)" />
        <ellipse cx="184" cy="222" rx="30" ry="39" transform="rotate(-16 184 222)" />
        <ellipse cx="256" cy="269" rx="29" ry="38" transform="rotate(-16 256 269)" />
      </g>
      <path d="m148 258 109 24 174-75-34-28-184 57Z" fill="#0d171e" />
      <path d="m137 254 64 12 205-78-33-30-104 23-54 35Z" fill={`url(#${id})`} stroke="#dae7f0" strokeOpacity=".35" />
      <path d="m224 236 75-51 33-1 78 24-49 28-68 8Z" fill="var(--viewer-paint)" />
      <path d="m169 252 56-28 34-1 111-42" stroke="var(--viewer-detail)" strokeWidth="7" />
      <path d="m272 189 60-51 37 19-5 29-52 17Z" fill="var(--viewer-stripe)" />
      <ellipse cx="280" cy="200" rx="29" ry="13" transform="rotate(-22 280 200)" fill="#101922" stroke="#8998a4" strokeWidth="3" />
      <path d="m349 162 3-34 99 31 1 33Z" fill="var(--viewer-paint)" stroke="#81949f" />
      <path d="m350 129 88-26 57 22-44 36Z" fill="var(--viewer-stripe)" stroke="#c5d1d8" strokeOpacity=".3" />
      <path d="m101 262 60-23 97 29-51 27Z" fill="var(--viewer-paint)" stroke="#8998a4" />
      <path d="m106 266 97 26 49-21" stroke="var(--viewer-detail)" strokeWidth="5" />
    </svg>
  );
}
