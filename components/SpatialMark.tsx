/** A six-faced W85 badge. All lettering is decorative; the page owns its title. */
export default function SpatialMark({
  className = '',
  compact = false,
  animated = false,
}: {
  className?: string;
  compact?: boolean;
  animated?: boolean;
}) {
  return (
    <span className={`spatial-mark ${compact ? 'spatial-mark-compact' : ''} ${className}`} data-animated={animated} aria-hidden="true">
      <span className="spatial-mark-plinth" />
      <span className="spatial-mark-cube">
        <span className="spatial-mark-face spatial-mark-back" />
        <span className="spatial-mark-face spatial-mark-left" />
        <span className="spatial-mark-face spatial-mark-right" />
        <span className="spatial-mark-face spatial-mark-top" />
        <span className="spatial-mark-face spatial-mark-bottom" />
        <span className="spatial-mark-face spatial-mark-front">
          <span className="spatial-mark-label">VESTRIPPN</span>
          <span className="spatial-mark-number">W85</span>
          <span className="spatial-mark-stripe" />
        </span>
      </span>
      <span className="spatial-mark-coordinate">FINAL / 85</span>
    </span>
  );
}
