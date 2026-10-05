import type { DrugStructure } from '@/lib/drugs';

/* A skeletal formula from scripts/generate-drug-structures.py, drawn in the
   text colour like the dexmedetomidine watermark. Decorative to assistive
   technology: the card states the name and formula in text. */
export default function Structure({ data, className }: { data: DrugStructure; className?: string }) {
  return (
    <svg
      className={className ?? 'sys-structure'}
      viewBox={`0 0 ${data.width} ${data.height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {data.lines.map(([x1, y1, x2, y2], i) => (
        <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {data.hashes.map(([x1, y1, x2, y2], i) => (
        <line key={`h${i}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.2} />
      ))}
      {data.wedges.map(([x1, y1, x2, y2, x3, y3], i) => (
        <path key={`w${i}`} d={`M${x1} ${y1}L${x2} ${y2}L${x3} ${y3}Z`} fill="currentColor" stroke="none" />
      ))}
      {data.labels.map(([x, y, text], i) => (
        <text key={`t${i}`} x={x} y={y}>
          {text}
        </text>
      ))}
    </svg>
  );
}
