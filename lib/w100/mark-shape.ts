/**
 * The VESTRIPPN "3" mark as geometry.
 *
 * Traced from public/vestrippn-logo.png (512×512): the outer silhouette of every
 * opaque pixel, Moore-traced and simplified with Ramer–Douglas–Peucker (ε 2.5px).
 * The two- and three-vertex runs at each corner are the logo's rounded outline,
 * kept on purpose — extruded, they read as small chamfers.
 *
 * One source of truth for the WebGL mark (components/w100/Mark3D) and the SVG
 * watermarks (skeletons, loaders), so every rendering of the mark agrees.
 */

type Point = readonly [number, number];

export const MARK_POLYGON_PX: readonly Point[] = [
  [249, 75], [432, 75], [435, 83], [401, 138], [453, 139], [459, 143], [458, 150],
  [312, 390], [306, 397], [50, 397], [47, 393], [49, 386], [111, 292], [179, 292],
  [182, 300], [172, 321], [274, 321], [302, 281], [304, 274], [253, 274], [249, 270],
  [251, 261], [290, 202], [349, 201], [379, 152], [208, 150], [206, 141],
];

/** Tight viewBox around the silhouette, for inline SVG. */
export const MARK_VIEWBOX = '44 72 418 328';
export const MARK_PATH = `M${MARK_POLYGON_PX.map(([x, y]) => `${x} ${y}`).join('L')}Z`;

const signedArea = (points: readonly Point[]) =>
  points.reduce((sum, a, i) => {
    const b = points[(i + 1) % points.length];
    return sum + a[0] * b[1] - b[0] * a[1];
  }, 0) / 2;

const cross = (a: Point, b: Point, c: Point) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

/**
 * The silhouette in model space: centred, x ∈ [-1, 1], y up, counter-clockwise.
 * (Traced order is clockwise once y is flipped, so it is reversed here — side
 * normals and ear clipping both assume CCW.)
 */
export function markPolygon(): Point[] {
  const cx = 253, cy = 236, half = 206; // bbox (47..459, 75..397)
  const points: Point[] = MARK_POLYGON_PX.map(([x, y]) => [(x - cx) / half, -(y - cy) / half]);
  return signedArea(points) < 0 ? points.reverse() : points;
}

/**
 * Ear-clipping triangulation for a simple CCW polygon. Verified against the
 * mark: 25 triangles (n − 2), all CCW, areas summing exactly to the polygon's.
 */
export function triangulate(points: readonly Point[]): number[] {
  const inTriangle = (p: Point, a: Point, b: Point, c: Point) =>
    cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0;
  const remaining = points.map((_, i) => i);
  const triangles: number[] = [];
  for (let guard = 0; remaining.length > 3 && guard < 5000; guard++) {
    let clipped = false;
    for (let i = 0; i < remaining.length; i++) {
      const a = remaining[(i + remaining.length - 1) % remaining.length];
      const b = remaining[i];
      const c = remaining[(i + 1) % remaining.length];
      if (cross(points[a], points[b], points[c]) <= 1e-9) continue; // reflex corner
      const blocked = remaining.some(q => q !== a && q !== b && q !== c && inTriangle(points[q], points[a], points[b], points[c]));
      if (blocked) continue;
      triangles.push(a, b, c);
      remaining.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) break; // degenerate input — emit what we have rather than loop
  }
  if (remaining.length === 3) triangles.push(remaining[0], remaining[1], remaining[2]);
  return triangles;
}
