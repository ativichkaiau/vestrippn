import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, CircleGeometry, Color,
  CylinderGeometry, DirectionalLight, Group, HemisphereLight, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator,
  RingGeometry, Scene, SRGBColorSpace, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRaceCar, type LiverySceneTheme } from './livery-model';

export type { LiverySceneTheme } from './livery-model';
export type SceneView = 'three-quarter' | 'side' | 'front';
export type SceneStats = { meshes: number; triangles: number };
export type SceneController = {
  updateTheme: (theme: LiverySceneTheme) => void;
  setMotionAllowed: (allowed: boolean) => void;
  /** Continuous turntable rotation (only while motion is allowed). */
  setRotating: (rotating: boolean) => void;
  setView: (view: SceneView) => void;
  reset: () => void;
  /** Geometry of the object itself (the turntable excluded). */
  stats: () => SceneStats;
  dispose: () => void;
};
type Options = {
  theme: LiverySceneTheme;
  motionAllowed: boolean;
  onReady: () => void;
  onFallback: () => void;
  onInteraction: () => void;
  /** Called after each rendered frame with the camera angles, in degrees. */
  onCamera?: (yaw: number, pitch: number) => void;
};

/** Owns one canvas and its complete GPU / observer lifecycle. Imported only in the browser. */
export function createLiveryScene(host: HTMLElement, options: Options): SceneController {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(0, 0);
  const canvas = renderer.domElement;
  canvas.className = 'sys-viewer-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Silver Arrow, an interactive three-dimensional open-wheel concept car. Drag to turn, use arrow keys to rotate, or use the view buttons.');
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 50);
  const ambient = new AmbientLight('#c3d5ed', 0.48);
  const hemi = new HemisphereLight('#e9f3ff', '#252d38', 2.4);
  const key = new DirectionalLight('#fff9ec', 4.2);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.035;
  const rim = new DirectionalLight('#a9d5ff', 3);
  rim.position.set(2, 4, -4);
  const frontFill = new DirectionalLight('#ffffff', 1.2);
  frontFill.position.set(-5, 1, -2);
  scene.add(ambient, hemi, key, rim, frontFill);

  const room = new RoomEnvironment();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const car = createRaceCar(options.theme);
  scene.add(car.group);

  const podium = new Group();
  podium.name = 'Machined turntable';
  const platformMaterial = new MeshStandardMaterial({ color: '#1b1e22', metalness: 0.6, roughness: 0.4 });
  const platform = new Mesh(new CylinderGeometry(3.2, 3.29, 0.13, 96), platformMaterial);
  platform.position.y = -0.074;
  platform.receiveShadow = true;
  podium.add(platform);
  const trimMaterial = new MeshStandardMaterial({ color: '#3b4148', metalness: 0.85, roughness: 0.3 });
  const trim = new Mesh(new CylinderGeometry(3.28, 3.28, 0.026, 96), trimMaterial);
  trim.position.y = -0.115;
  podium.add(trim);
  const lightMaterial = new MeshBasicMaterial({ color: options.theme.accent, toneMapped: false });
  const lightRing = new Mesh(new RingGeometry(3.11, 3.135, 96), lightMaterial);
  lightRing.rotation.x = -Math.PI / 2;
  lightRing.position.y = -0.006;
  podium.add(lightRing);
  const lineMaterial = new MeshBasicMaterial({ color: '#9aa0a8', transparent: true, opacity: 0.14 });
  for (const radius of [2.65, 2.8, 2.95]) {
    const circle = new Mesh(new RingGeometry(radius, radius + 0.006, 96), lineMaterial);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = -0.004;
    podium.add(circle);
  }
  for (let i = 0; i < 36; i++) {
    const angle = i / 36 * Math.PI * 2;
    const tick = new Mesh(new RingGeometry(2.98, i % 3 === 0 ? 3.075 : 3.035, 1, 1, angle, 0.006), lineMaterial);
    tick.rotation.x = -Math.PI / 2;
    tick.position.y = -0.003;
    podium.add(tick);
  }
  // A soft contact wash anchors the model even on devices with coarse shadow maps.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 64;
  const context = shadowCanvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 3, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  const shadowTexture = new CanvasTexture(shadowCanvas);
  const contactMaterial = new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  const contact = new Mesh(new CircleGeometry(1, 48), contactMaterial);
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = -0.001;
  contact.scale.set(2.6, 1.25, 1);
  podium.add(contact);
  scene.add(podium);

  let disposed = false;
  let failed = false;
  let ready = false;
  let frame = 0;
  let idleTimer = 0;
  let lastFrame = -Infinity;
  let intersects = true;
  let occluded = false;
  let motionAllowed = options.motionAllowed;
  let rotating = false;
  let lastSpin = 0;
  let yaw = -0.82;
  let pitch = 0.44;
  let aspect = 1;
  let activePointer: number | null = null;
  let previousX = 0;
  let previousY = 0;
  let previousWidth = 0;
  let previousHeight = 0;

  const visible = () => intersects && !occluded && document.visibilityState !== 'hidden';
  const canOrbit = () => motionAllowed && rotating && activePointer === null && visible();
  const stopFrame = () => {
    if (frame) cancelAnimationFrame(frame);
    if (idleTimer) window.clearTimeout(idleTimer);
    frame = idleTimer = 0;
  };
  // The turntable sleeps between frames on a timer; a rAF that skips most
  // vsyncs still wakes the whole page 60 times a second. One revolution takes
  // ~25 s, so 30 fps is smooth.
  const IDLE_FRAME_MS = 1000 / 30;
  const SPIN_RAD_PER_S = 0.25;
  const sleepThenDraw = () => { idleTimer = window.setTimeout(() => { idleTimer = 0; if (!frame) frame = requestAnimationFrame(draw); }, IDLE_FRAME_MS); };
  function draw(time: number) {
    frame = 0;
    if (disposed || failed || !visible()) return;
    const orbit = canOrbit();
    const motion = orbit ? 'orbit' : 'still';
    if (host.dataset.sceneMotion !== motion) host.dataset.sceneMotion = motion;
    if (orbit && time - lastFrame < IDLE_FRAME_MS - 4) {
      sleepThenDraw();
      return;
    }
    const width = Math.round(host.clientWidth);
    const height = Math.round(host.clientHeight);
    if (width <= 0 || height <= 0) return;
    if (width !== previousWidth || height !== previousHeight) {
      previousWidth = width;
      previousHeight = height;
      aspect = width / height;
      renderer.setSize(width, height, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    if (orbit) yaw -= Math.min(time - (lastSpin || time), 100) / 1000 * SPIN_RAD_PER_S;
    lastSpin = orbit ? time : 0;
    const angle = yaw;
    // Framed for the garage stage: the whole turntable stays in view.
    const distance = 9.4 * Math.max(1, 1.75 / aspect);
    camera.position.set(Math.sin(angle) * Math.cos(pitch) * distance, Math.sin(pitch) * distance + 0.38, Math.cos(angle) * Math.cos(pitch) * distance);
    camera.lookAt(-0.12, 0.38, 0);
    try {
      renderer.render(scene, camera);
      if (!ready) { ready = true; options.onReady(); }
      options.onCamera?.(((-angle * 180 / Math.PI) % 360 + 360) % 360, pitch * 180 / Math.PI);
    } catch {
      failed = true;
      options.onFallback();
      return;
    }
    lastFrame = time;
    if (orbit) sleepThenDraw();
  }
  function invalidate() {
    if (idleTimer) { window.clearTimeout(idleTimer); idleTimer = 0; }
    if (!frame && !disposed && !failed && visible()) frame = requestAnimationFrame(draw);
  }
  function updateTheme(theme: LiverySceneTheme) {
    car.update(theme);
    lightMaterial.color.set(theme.accent);
    // The turntable is neutral: it belongs to the viewer, not the paint.
    platformMaterial.color.set(theme.isLight ? '#b9bbb6' : '#1b1e22');
    trimMaterial.color.set(theme.isLight ? '#d2d3cd' : '#3b4148');
    lineMaterial.opacity = theme.isLight ? 0.25 : 0.14;
    rim.color.copy(new Color(theme.accent).lerp(new Color('#ffffff'), 0.6));
    invalidate();
  }
  function setMotionAllowed(allowed: boolean) {
    motionAllowed = allowed;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, allowed ? 1.5 : 1.25));
    previousWidth = previousHeight = 0;
    stopFrame();
    invalidate();
  }
  function interaction() {
    rotating = false;
    options.onInteraction();
  }
  function setRotating(next: boolean) {
    rotating = next;
    lastSpin = 0;
    stopFrame();
    invalidate();
  }
  function setView(view: SceneView) {
    rotating = false;
    yaw = view === 'front' ? -Math.PI / 2 : view === 'side' ? 0 : -0.82;
    pitch = view === 'front' ? 0.18 : view === 'side' ? 0.22 : 0.44;
    invalidate();
  }
  function reset() {
    yaw = -0.82;
    pitch = 0.44;
    invalidate();
  }
  function stats(): SceneStats {
    let meshes = 0;
    let triangles = 0;
    car.group.traverse(object => {
      if (!(object instanceof Mesh)) return;
      meshes += 1;
      const geometry = object.geometry;
      triangles += (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3;
    });
    return { meshes, triangles: Math.round(triangles) };
  }
  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || activePointer !== null) return;
    activePointer = event.pointerId;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
    canvas.focus({ preventScroll: true });
    interaction();
  }
  function pointerMove(event: PointerEvent) {
    if (activePointer !== event.pointerId) return;
    yaw -= (event.clientX - previousX) * 0.009;
    if (event.pointerType !== 'touch') pitch = Math.max(0.1, Math.min(0.95, pitch + (event.clientY - previousY) * 0.005));
    previousX = event.clientX;
    previousY = event.clientY;
    invalidate();
  }
  function pointerUp(event: PointerEvent) {
    if (activePointer !== event.pointerId) return;
    activePointer = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.classList.remove('is-dragging');
  }
  function keyDown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') reset();
    else {
      interaction();
      if (event.key === 'ArrowLeft') yaw += 0.18;
      if (event.key === 'ArrowRight') yaw -= 0.18;
      if (event.key === 'ArrowUp') pitch = Math.min(0.95, pitch + 0.1);
      if (event.key === 'ArrowDown') pitch = Math.max(0.1, pitch - 0.1);
      invalidate();
    }
  }
  function visibilityChanged() {
    if (visible()) invalidate(); else { stopFrame(); host.dataset.sceneMotion = 'paused'; }
  }
  function modalChanged() {
    const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
    const topDialog = dialogs[dialogs.length - 1];
    occluded = Boolean(topDialog && !topDialog.contains(host));
    visibilityChanged();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    failed = true;
    stopFrame();
    options.onFallback();
  }
  const resizeObserver = new ResizeObserver(invalidate);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    intersects = entry.isIntersecting;
    visibilityChanged();
  }, { threshold: 0.01 });
  intersectionObserver.observe(host);
  const modalObserver = new MutationObserver(modalChanged);
  modalObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'], childList: true });
  document.addEventListener('visibilitychange', visibilityChanged);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('keydown', keyDown);
  canvas.addEventListener('webglcontextlost', contextLost);
  updateTheme(options.theme);
  setMotionAllowed(motionAllowed);
  modalChanged();

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopFrame();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    modalObserver.disconnect();
    document.removeEventListener('visibilitychange', visibilityChanged);
    canvas.removeEventListener('pointerdown', pointerDown);
    canvas.removeEventListener('pointermove', pointerMove);
    canvas.removeEventListener('pointerup', pointerUp);
    canvas.removeEventListener('pointercancel', pointerUp);
    canvas.removeEventListener('keydown', keyDown);
    canvas.removeEventListener('webglcontextlost', contextLost);
    const geometries = new Set<import('three').BufferGeometry>();
    const materials = new Set<import('three').Material>();
    scene.traverse(object => {
      if (object instanceof Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    // Include materials which may not have been assigned by a particular design.
    car.materials.forEach(material => materials.add(material));
    materials.forEach(material => material.dispose());
    shadowTexture.dispose();
    environment.dispose();
    key.shadow.dispose();
    renderer.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    canvas.remove();
    delete host.dataset.sceneMotion;
    scene.clear();
  }
  return { updateTheme, setMotionAllowed, setRotating, setView, reset, stats, dispose };
}
