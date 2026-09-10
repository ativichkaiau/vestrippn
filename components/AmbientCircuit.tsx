const traces = [
  'M-40 116H120L154 82H368',
  'M-40 140H96L130 106H282',
  'M714 -30V38L752 76H928V244L966 282V460',
  'M738 -30V14L776 52H952V220L990 258V484',
  'M1040 590H834L796 628H576',
  'M1040 614H858L820 652H666',
  'M48 740V538L18 508V332',
  'M72 740V562L42 532V420',
];

/** Shared, inert artwork keeps idle motion present on every route. */
export default function AmbientCircuit() {
  return (
    <div className="w85-ambient-circuit">
      <span className="w85-circuit-aura w85-circuit-aura-primary" />
      <span className="w85-circuit-aura w85-circuit-aura-secondary" />
      <svg viewBox="0 0 1000 700" preserveAspectRatio="none" fill="none" focusable="false">
        {traces.map((d, index) => (
          <g key={d} style={{ animationDelay: `${index * -0.65}s` }}>
            <path className="w85-circuit-rail" d={d} />
            <path className="w85-circuit-current" d={d} pathLength="100" />
          </g>
        ))}
        <g className="w85-circuit-beacons">
          <circle cx="154" cy="82" r="4" />
          <circle cx="928" cy="76" r="5" />
          <circle cx="796" cy="628" r="4" />
          <circle cx="48" cy="538" r="4" />
        </g>
      </svg>
      <span className="w85-circuit-ribbon w85-circuit-ribbon-top" />
      <span className="w85-circuit-ribbon w85-circuit-ribbon-bottom" />
    </div>
  );
}
