/** Decorative W85 artwork; visible surfaces gain ambient motion via CSS. */
export default function LiveryDecoration() {
  return (
    <div className="w85-livery-decoration" aria-hidden="true">
      <span className="w85-livery-cap" />
      <svg className="w85-livery-art" viewBox="0 0 480 600" fill="none" focusable="false">
        <path className="w85-livery-outline" d="M240 -40 0 600M268 -40 28 600M476 -40 236 600" />
        <path className="w85-livery-primary" d="M346 -40h52L158 600h-52z" />
        <path className="w85-livery-silver" d="M409 -40h12L181 600h-12z" />
        <path className="w85-livery-secondary" d="M432 -40h23L215 600h-23z" />
        <path className="w85-livery-flow" pathLength="100" d="M268 -40 28 600" />
        <path className="w85-livery-flow w85-livery-flow-secondary" pathLength="100" d="M421 -40 181 600" />
        <text className="w85-livery-number" x="458" y="334" textAnchor="end">85</text>
        <path className="w85-livery-outline" d="M282 422h120m-106 10h88m-73 10h56" />
      </svg>
      <span className="w85-livery-corner" />
      <span className="w85-livery-ticks" />
    </div>
  );
}
