import type { CSSProperties } from 'react';
import Mark3D from './w100/Mark3D';

// Depth layers behind the "100", back to front (W100 wireframe extrusion).
const EXTRUDE = [7, 6, 5, 4, 3, 2, 1];

/**
 * Decorative W85 artwork; visible surfaces gain ambient motion via CSS.
 * W100 builds it into a diorama (app/w100.css, "HERO DIORAMA"): a track
 * floor runs toward you in perspective, the orbit rings are a 3D gyroscope
 * with the live 3D mark levitating inside (it turns to face the pointer), the
 * edition number is extruded, and each layer parallaxes at its own depth as
 * the hero tilts. Pass `mark={false}` where the hero shows its own mark.
 */
export default function LiveryDecoration({ mark = true }: { mark?: boolean }) {
  return (
    <div className="w85-livery-decoration" aria-hidden="true">
      <span className="w85-livery-cap" />
      <span className="w100-hero-floor" />
      <span className="w85-livery-ribbon" />
      <span className="w85-livery-orbits">
        <span className="w100-gyro">
          <svg className="w100-gyro-ring w100-gyro-outer" viewBox="0 0 360 360" fill="none" focusable="false">
            <g className="w85-orbit-outer">
              <circle cx="180" cy="180" r="148" pathLength="100" strokeDasharray="23 5 9 5 23 5 9 21" />
              <circle className="w85-orbit-node" cx="180" cy="32" r="5" />
              <circle className="w85-orbit-node" cx="180" cy="328" r="3" />
            </g>
          </svg>
          <svg className="w100-gyro-ring w100-gyro-inner" viewBox="0 0 360 360" fill="none" focusable="false">
            <g className="w85-orbit-inner">
              <circle cx="180" cy="180" r="114" pathLength="100" strokeDasharray="1 3" />
              <path d="M180 56v20m104 104h20M180 284v20M56 180h20" />
              <circle className="w85-orbit-node" cx="294" cy="180" r="4" />
            </g>
          </svg>
          <span className="w100-gyro-core" />
          {mark && <Mark3D follow interactive={false} className="w100-gyro-mark" label="" />}
        </span>
      </span>
      <svg className="w85-livery-art" viewBox="0 0 480 600" fill="none" focusable="false">
        <path className="w85-livery-outline" d="M240 -40 0 600M268 -40 28 600M476 -40 236 600" />
        <path className="w85-livery-primary" d="M346 -40h52L158 600h-52z" />
        <path className="w85-livery-silver" d="M409 -40h12L181 600h-12z" />
        <path className="w85-livery-secondary" d="M432 -40h23L215 600h-23z" />
        <path className="w85-livery-flow" pathLength="100" d="M268 -40 28 600" />
        <path className="w85-livery-flow w85-livery-flow-secondary" pathLength="100" d="M421 -40 181 600" />
        {EXTRUDE.map((depth) => (
          <text
            key={depth}
            className="w85-livery-number w100-extrude"
            style={{ '--w100-layer': depth } as CSSProperties}
            x="458"
            y="334"
            textAnchor="end"
          >
            100
          </text>
        ))}
        <text className="w85-livery-number" x="458" y="334" textAnchor="end">100</text>
        <path className="w85-livery-outline" d="M282 422h120m-106 10h88m-73 10h56" />
      </svg>
      <span className="w85-livery-corner" />
      <span className="w85-livery-equalizer">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} style={{ animationDelay: `${index * -0.17}s`, animationDuration: `${1.8 + (index % 3) * 0.4}s` }} />
        ))}
      </span>
      <span className="w85-livery-ticks" />
    </div>
  );
}
