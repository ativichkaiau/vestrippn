/* ════════════════════════════════════════════════════════════════════════
   Dexmedetomidine — the background watermark of the editor area.

   (S)-4-[1-(2,3-dimethylphenyl)ethyl]-1H-imidazole, C13H16N2, the
   (S)-enantiomer of medetomidine (Studyex_Medeetomihub's namesake).
   Skeletal formula from RDKit 2D coordinates (CoordGen) of the SMILES
   C[C@H](c1cnc[nH]1)c1cccc(C)c1C, with the stereocentre's methyl as a
   wedge. Decorative: hidden from assistive technology, never interactive,
   drawn in the text colour at a few percent so it never costs contrast.
   ════════════════════════════════════════════════════════════════════════ */

export default function MoleculeBackdrop() {
  return (
    <div className="sys-molecule" aria-hidden="true">
      <svg viewBox="0 0 319.3 400" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M181.0 135.9L235.4 110.1L230.4 101.5Z" fill="currentColor" stroke="none" />
        <line x1="181.0" y1="135.9" x2="129.0" y2="106.0" />
        <line x1="129.0" y1="106.0" x2="122.6" y2="46.4" />
        <line x1="120.0" y1="97.3" x2="115.7" y2="56.8" />
        <line x1="122.6" y1="46.4" x2="76.6" y2="36.7" />
        <line x1="57.4" y1="45.3" x2="34.0" y2="86.0" />
        <line x1="60.6" y1="55.8" x2="44.7" y2="83.5" />
        <line x1="34.0" y1="86.0" x2="65.5" y2="120.9" />
        <line x1="181.0" y1="135.9" x2="181.1" y2="195.9" />
        <line x1="181.1" y1="195.9" x2="129.2" y2="226.0" />
        <line x1="176.8" y1="207.6" x2="141.5" y2="228.1" />
        <line x1="129.2" y1="226.0" x2="129.4" y2="286.0" />
        <line x1="129.4" y1="286.0" x2="181.4" y2="315.9" />
        <line x1="141.7" y1="283.8" x2="177.1" y2="304.2" />
        <line x1="181.4" y1="315.9" x2="233.3" y2="285.8" />
        <line x1="233.3" y1="285.8" x2="285.3" y2="315.7" />
        <line x1="233.3" y1="285.8" x2="233.2" y2="225.8" />
        <line x1="225.3" y1="276.2" x2="225.2" y2="235.4" />
        <line x1="233.2" y1="225.8" x2="285.1" y2="195.7" />
        <line x1="86.1" y1="125.2" x2="129.0" y2="106.0" />
        <line x1="233.2" y1="225.8" x2="181.1" y2="195.9" />
        <text x="63.9" y="34.0">N</text>
        <text x="74.2" y="130.5">N</text>
        <text x="74.2" y="150.5">H</text>
        <text className="sys-molecule-caption" x="159.6" y="385">
          dexmedetomidine · C<tspan baselineShift="sub">13</tspan>H<tspan baselineShift="sub">16</tspan>N<tspan baselineShift="sub">2</tspan>
        </text>
      </svg>
    </div>
  );
}
