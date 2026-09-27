import { markPolygon, triangulate } from './mark-shape';
import { MAX_BANDS, type LiveryPaint } from './livery-paint';

/**
 * W100 — the VESTRIPPN "3" as a real 3D object, drawn with raw WebGL.
 *
 * Deliberately library-free: the mesh is ~80 triangles, so three.js (~150 KB
 * gzipped) would be almost entirely overhead in a PWA that boots daily. The
 * silhouette is extruded into a slab; the front face is painted in the active
 * livery's stripe bands, the sides and back are carbon twill, and a clearcoat
 * lighting model gives it an F1 bodywork finish.
 *
 * Live swap: two paints are bound at once (A = current, B = incoming) and
 * `swap` sweeps a wet-paint line across the mark along the livery's 114°
 * stripe axis, so a livery change is a physical repaint rather than a cut.
 */

const MAX_EDGES = 32;
const HALF_DEPTH = 0.16;
const CAMERA_DISTANCE = 4.6;
const FOV = (30 * Math.PI) / 180;
// CSS `linear-gradient(114deg, …)` runs right and slightly down; y is up here.
const STRIPE_DIR: readonly [number, number] = [Math.sin((114 * Math.PI) / 180), Math.cos((114 * Math.PI) / 180)];

const VERTEX = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aUV;
attribute float aFace;
uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMat;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vXY;
varying vec2 vUV;
varying float vFace;
void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  vWorld = world.xyz;
  vNormal = uNormalMat * aNormal;
  vXY = aPos.xy;
  vUV = aUV;
  vFace = aFace;
  gl_Position = uViewProj * world;
}`;

const FRAGMENT = `
precision highp float;
#define MAX_BANDS ${MAX_BANDS}
#define MAX_EDGES ${MAX_EDGES}
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vXY;
varying vec2 vUV;
varying float vFace;
uniform vec3 uCamera;
uniform vec3 uBandA[MAX_BANDS];
uniform float uEndA[MAX_BANDS];
uniform float uCountA;
uniform vec3 uBandB[MAX_BANDS];
uniform float uEndB[MAX_BANDS];
uniform float uCountB;
uniform vec3 uCarbonA; uniform vec3 uCarbonB;
uniform vec3 uOutlineA; uniform vec3 uOutlineB;
uniform vec3 uRimA; uniform vec3 uRimB;
uniform float uSwap;
uniform vec2 uStripeDir;
uniform vec2 uStripeRange;
uniform vec4 uEdges[MAX_EDGES];
uniform float uEdgeCount;

vec3 bandA(float t) {
  vec3 c = uBandA[0];
  for (int i = 0; i < MAX_BANDS; i++) {
    if (float(i) >= uCountA) break;
    c = uBandA[i];
    if (t <= uEndA[i]) break;
  }
  return c;
}
vec3 bandB(float t) {
  vec3 c = uBandB[0];
  for (int i = 0; i < MAX_BANDS; i++) {
    if (float(i) >= uCountB) break;
    c = uBandB[i];
    if (t <= uEndB[i]) break;
  }
  return c;
}
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
float edgeDistance(vec2 p) {
  float d = 10.0;
  for (int i = 0; i < MAX_EDGES; i++) {
    if (float(i) >= uEdgeCount) break;
    d = min(d, segmentDistance(p, uEdges[i].xy, uEdges[i].zw));
  }
  return d;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCamera - vWorld);
  float t = clamp((dot(vXY, uStripeDir) - uStripeRange.x) / (uStripeRange.y - uStripeRange.x), 0.0, 1.0);
  // The wet-paint line: behind it the incoming livery, ahead the outgoing one.
  float front = uSwap * 1.3 - 0.15;
  float incoming = step(t, front);
  vec3 carbon = mix(uCarbonA, uCarbonB, incoming);
  vec3 outline = mix(uOutlineA, uOutlineB, incoming);
  vec3 rim = mix(uRimA, uRimB, clamp(uSwap, 0.0, 1.0));
  bool face = vFace < 0.5;

  vec3 base;
  float edge = 1.0;
  if (face) {
    vec3 paint = mix(bandA(t), bandB(t), incoming);
    edge = edgeDistance(vXY);
    base = mix(outline, paint, smoothstep(0.018, 0.03, edge));
  } else {
    // Carbon twill: diagonal 2/2 weave with a little per-tow sheen.
    vec2 w = vUV * 52.0;
    float twill = step(0.5, fract((floor(w.x) - floor(w.y)) * 0.25));
    float sheen = 1.0 - abs(fract(twill > 0.5 ? w.x : w.y) - 0.5) * 0.9;
    base = carbon * (0.72 + 0.28 * twill) * (0.85 + 0.25 * sheen);
  }

  vec3 L1 = normalize(vec3(-0.45, 0.75, 0.85));
  vec3 L2 = normalize(vec3(0.8, -0.35, 0.5));
  float diffuse = 0.36 + 0.7 * max(dot(N, L1), 0.0) + 0.22 * max(dot(N, L2), 0.0);
  vec3 H = normalize(L1 + V);
  float spec = pow(max(dot(N, H), 0.0), face ? 120.0 : 36.0) * (face ? 0.8 : 0.3);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 R = reflect(-V, N);
  // A studio softbox reflected in the clearcoat.
  float softbox = smoothstep(0.32, 0.52, R.y) * (1.0 - smoothstep(0.72, 0.94, R.y));

  vec3 color = base * diffuse + vec3(spec) + rim * fresnel * 0.6 + vec3(softbox) * (face ? 0.16 : 0.05);
  if (face) color += (1.0 - smoothstep(0.0, 0.012, edge)) * 0.22 * max(dot(N, L1), 0.0);
  float seam = (1.0 - smoothstep(0.0, 0.03, abs(t - front))) * step(0.001, uSwap) * step(uSwap, 0.999);
  color += seam * (face ? 0.6 : 0.25);
  gl_FragColor = vec4(color, 1.0);
}`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

function multiply(a: number[], b: number[]) {
  const out = new Array<number>(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let sum = 0;
    for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
    out[c * 4 + r] = sum;
  }
  return out;
}
const rotateX = (a: number) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
const rotateY = (a: number) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
const rotateZ = (a: number) => { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
const translate = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const scaling = (s: number) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
function perspective(aspect: number) {
  // Fit by width on tall canvases so the mark never clips.
  const f = (1 / Math.tan(FOV / 2)) * Math.min(1, aspect);
  const near = 0.1, far = 20;
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
}

/** Interleaved mesh: position(3) normal(3) uv(2) face(1). face 0 = front, 1 = back, 2 = side. */
function buildMesh() {
  const polygon = markPolygon();
  const triangles = triangulate(polygon);
  const data: number[] = [];
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number, face: number) =>
    data.push(x, y, z, nx, ny, nz, u, v, face);

  for (let i = 0; i < triangles.length; i += 3) {
    for (const index of [triangles[i], triangles[i + 1], triangles[i + 2]]) {
      const [x, y] = polygon[index];
      push(x, y, HALF_DEPTH, 0, 0, 1, x, y, 0);
    }
    for (const index of [triangles[i], triangles[i + 2], triangles[i + 1]]) {
      const [x, y] = polygon[index];
      push(x, y, -HALF_DEPTH, 0, 0, -1, x, y, 1);
    }
  }
  let run = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [ax, ay] = polygon[i];
    const [bx, by] = polygon[(i + 1) % polygon.length];
    const length = Math.hypot(bx - ax, by - ay);
    // Outward normal of a CCW edge.
    const nx = (by - ay) / length, ny = -(bx - ax) / length;
    const u0 = run, u1 = run + length;
    run = u1;
    const quad: [number, number, number, number][] = [
      [ax, ay, HALF_DEPTH, u0], [bx, by, HALF_DEPTH, u1], [bx, by, -HALF_DEPTH, u1],
      [ax, ay, HALF_DEPTH, u0], [bx, by, -HALF_DEPTH, u1], [ax, ay, -HALF_DEPTH, u0],
    ];
    for (const [x, y, z, u] of quad) push(x, y, z, nx, ny, 0, u, z, 2);
  }

  const edges = new Float32Array(MAX_EDGES * 4);
  polygon.forEach(([ax, ay], i) => {
    const [bx, by] = polygon[(i + 1) % polygon.length];
    edges.set([ax, ay, bx, by], i * 4);
  });
  const projections = polygon.map(([x, y]) => x * STRIPE_DIR[0] + y * STRIPE_DIR[1]);
  return {
    vertices: new Float32Array(data),
    count: data.length / 9,
    edges,
    edgeCount: Math.min(polygon.length, MAX_EDGES),
    stripeRange: [Math.min(...projections), Math.max(...projections)] as const,
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[W100] mark shader failed to compile', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export type MarkPose = { yaw: number; pitch: number; roll: number; scale: number; z: number };

export class MarkRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly uniforms: Uniforms;
  private readonly count: number;
  private paintA: LiveryPaint;
  private paintB: LiveryPaint;
  private aspect = 1;
  swap = 1;
  pose: MarkPose = { yaw: 0.35, pitch: -0.1, roll: 0, scale: 1, z: 0 };

  /** Returns null where WebGL is unavailable, so callers can fall back to the PNG. */
  static create(canvas: HTMLCanvasElement, paint: LiveryPaint): MarkRenderer | null {
    const attributes: WebGLContextAttributes = { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' };
    const gl = (canvas.getContext('webgl2', attributes) ?? canvas.getContext('webgl', attributes)) as WebGLRenderingContext | null;
    if (!gl) return null;
    try {
      return new MarkRenderer(gl, paint);
    } catch (error) {
      console.warn('[W100] mark renderer unavailable', error);
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext, paint: LiveryPaint) {
    this.gl = gl;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) throw new Error('shader setup failed');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed');
    this.program = program;

    const mesh = buildMesh();
    this.count = mesh.count;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('buffer allocation failed');
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    gl.useProgram(program);
    const stride = 9 * 4;
    const attribute = (name: string, size: number, offset: number) => {
      const location = gl.getAttribLocation(program, name);
      if (location < 0) return;
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset * 4);
    };
    attribute('aPos', 3, 0);
    attribute('aNormal', 3, 3);
    attribute('aUV', 2, 6);
    attribute('aFace', 1, 8);

    const names = ['uModel', 'uViewProj', 'uNormalMat', 'uCamera', 'uBandA[0]', 'uEndA[0]', 'uCountA', 'uBandB[0]', 'uEndB[0]', 'uCountB',
      'uCarbonA', 'uCarbonB', 'uOutlineA', 'uOutlineB', 'uRimA', 'uRimB', 'uSwap', 'uStripeDir', 'uStripeRange', 'uEdges[0]', 'uEdgeCount'];
    this.uniforms = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform3f(this.uniforms.uCamera, 0, 0, CAMERA_DISTANCE);
    gl.uniform2f(this.uniforms.uStripeDir, STRIPE_DIR[0], STRIPE_DIR[1]);
    gl.uniform2f(this.uniforms.uStripeRange, mesh.stripeRange[0], mesh.stripeRange[1]);
    gl.uniform4fv(this.uniforms['uEdges[0]'], mesh.edges);
    gl.uniform1f(this.uniforms.uEdgeCount, mesh.edgeCount);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    this.paintA = paint;
    this.paintB = paint;
    this.uploadPaint('A', paint);
    this.uploadPaint('B', paint);
  }

  private uploadPaint(slot: 'A' | 'B', paint: LiveryPaint) {
    const { gl, uniforms } = this;
    const colors = new Float32Array(MAX_BANDS * 3);
    const ends = new Float32Array(MAX_BANDS);
    paint.bands.forEach((band, i) => { colors.set(band.color, i * 3); ends[i] = band.end; });
    gl.useProgram(this.program);
    gl.uniform3fv(uniforms[`uBand${slot}[0]`], colors);
    gl.uniform1fv(uniforms[`uEnd${slot}[0]`], ends);
    gl.uniform1f(uniforms[`uCount${slot}`], Math.max(1, paint.bands.length));
    gl.uniform3fv(uniforms[`uCarbon${slot}`], [...paint.carbon]);
    gl.uniform3fv(uniforms[`uOutline${slot}`], [...paint.outline]);
    gl.uniform3fv(uniforms[`uRim${slot}`], [...paint.rim]);
  }

  /**
   * Bind a new livery. With `sweep`, the current paint becomes the outgoing
   * layer and the caller animates `swap` 0 → 1; otherwise it applies at once.
   * Returns false when `paint` is already the target (paints are cached per
   * livery, so identity is enough), so callers don't replay a sweep.
   */
  setPaint(paint: LiveryPaint, sweep: boolean): boolean {
    if (paint === this.paintB) return false;
    if (sweep) {
      // Mid-sweep changes restart from whatever was arriving.
      this.paintA = this.paintB;
      this.uploadPaint('A', this.paintA);
      this.swap = 0;
    } else {
      this.paintA = paint;
      this.uploadPaint('A', paint);
      this.swap = 1;
    }
    this.paintB = paint;
    this.uploadPaint('B', paint);
    return true;
  }

  resize(width: number, height: number) {
    const canvas = this.gl.canvas as HTMLCanvasElement;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    this.aspect = width / Math.max(1, height);
    this.gl.viewport(0, 0, width, height);
  }

  render() {
    const { gl, uniforms, pose } = this;
    const rotation = multiply(rotateY(pose.yaw), multiply(rotateX(pose.pitch), rotateZ(pose.roll)));
    const model = multiply(translate(0, 0, pose.z), multiply(rotation, scaling(pose.scale)));
    const viewProjection = multiply(perspective(this.aspect), translate(0, 0, -CAMERA_DISTANCE));
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(uniforms.uModel, false, model);
    gl.uniformMatrix4fv(uniforms.uViewProj, false, viewProjection);
    gl.uniformMatrix3fv(uniforms.uNormalMat, false, [rotation[0], rotation[1], rotation[2], rotation[4], rotation[5], rotation[6], rotation[8], rotation[9], rotation[10]]);
    gl.uniform1f(uniforms.uSwap, this.swap);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, this.count);
  }

  dispose() {
    const { gl } = this;
    // No loseContext(): a canvas hands back the same context object, so forcing
    // loss here would break React StrictMode's dev remount on that canvas.
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }
}

