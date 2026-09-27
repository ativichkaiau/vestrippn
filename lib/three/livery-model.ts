import {
  BoxGeometry, BufferGeometry, CatmullRomCurve3, CylinderGeometry, DoubleSide,
  ExtrudeGeometry, Float32BufferAttribute, Group, LatheGeometry, Mesh,
  MeshPhysicalMaterial, MeshStandardMaterial, Shape, SphereGeometry,
  TorusGeometry, TubeGeometry, Vector2, Vector3,
} from 'three';

export type LiverySceneTheme = {
  id: string;
  colors: readonly string[];
  accent: string;
  isLight: boolean;
  matte: boolean;
};

/** A single original open-wheel concept, repainted from the app's livery collection. */
export function createRaceCar(theme: LiverySceneTheme) {
  const group = new Group();
  group.name = 'W85 open-wheel concept';
  const paints = Array.from({ length: 5 }, () => new MeshPhysicalMaterial({
    metalness: 0.55, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.2,
  }));
  const carbon = new MeshStandardMaterial({ color: '#111820', metalness: 0.28, roughness: 0.55 });
  const rubber = new MeshStandardMaterial({ color: '#151619', metalness: 0.02, roughness: 0.93 });
  const rubberEdge = new MeshStandardMaterial({ color: '#272a2c', roughness: 0.88 });
  const alloy = new MeshStandardMaterial({ color: '#8998a0', metalness: 0.92, roughness: 0.24 });
  const hub = new MeshStandardMaterial({ color: '#b63638', metalness: 0.7, roughness: 0.35 });
  const tireMark = new MeshStandardMaterial({ color: '#d2c9a4', roughness: 0.75 });
  const glass = new MeshPhysicalMaterial({ color: '#070e16', metalness: 0.6, roughness: 0.12, clearcoat: 1 });
  const allMaterials = [...paints, carbon, rubber, rubberEdge, alloy, hub, tireMark, glass];

  function add(geometry: BufferGeometry, material: MeshStandardMaterial, position: [number, number, number], name: string) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;
    group.add(mesh);
    return mesh;
  }
  function box(size: [number, number, number], position: [number, number, number], material: MeshStandardMaterial, name: string) {
    return add(new BoxGeometry(...size), material, position, name);
  }
  function rod(start: [number, number, number], end: [number, number, number], radius = 0.024, material = carbon) {
    const from = new Vector3(...start);
    const to = new Vector3(...end);
    const mesh = add(new CylinderGeometry(radius, radius, from.distanceTo(to), 8), material, [0, 0, 0], 'Suspension');
    mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), to.sub(from).normalize());
    return mesh;
  }
  type Station = [x: number, centerY: number, halfHeight: number, halfWidth: number];
  function body(stations: Station[], offsetZ: number, material: MeshStandardMaterial, name: string) {
    const vertices: number[] = [];
    const indices: number[] = [];
    const segments = 18;
    for (const [x, y, height, width] of stations) {
      for (let i = 0; i <= segments; i++) {
        const a = i / segments * Math.PI * 2;
        vertices.push(x, y + Math.sin(a) * height, offsetZ + Math.cos(a) * width);
      }
    }
    for (let s = 0; s < stations.length - 1; s++) {
      for (let i = 0; i < segments; i++) {
        const a = s * (segments + 1) + i;
        const b = a + segments + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    for (const end of [0, stations.length - 1]) {
      const [x, y] = stations[end];
      const center = vertices.length / 3;
      vertices.push(x, y, offsetZ);
      for (let i = 0; i < segments; i++) {
        const a = end * (segments + 1) + i;
        if (end === 0) indices.push(center, a + 1, a);
        else indices.push(center, a, a + 1);
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return add(geometry, material, [0, 0, 0], name);
  }
  function panel(points: [number, number][], depth: number, z: number, material: MeshStandardMaterial, name: string) {
    const shape = new Shape();
    points.forEach(([x, y], i) => i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y));
    shape.closePath();
    return add(new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.017, bevelThickness: 0.012 }), material, [0, 0, z - depth / 2], name);
  }

  // The floor and sculpted nose use real volume; the upper body is a smooth loft.
  panel([[-1.6, 0.24], [-1.45, 0.19], [1.6, 0.19], [1.83, 0.3], [0.7, 0.33], [-0.5, 0.31]], 1.4, 0, carbon, 'Carbon floor');
  body([
    [-2.38, 0.39, 0.055, 0.09], [-2.2, 0.44, 0.075, 0.13], [-1.52, 0.59, 0.105, 0.18],
    [-0.9, 0.64, 0.145, 0.27], [-0.48, 0.65, 0.2, 0.34], [0, 0.63, 0.24, 0.39],
    [0.55, 0.61, 0.24, 0.34], [1.2, 0.53, 0.19, 0.24], [1.7, 0.42, 0.08, 0.11], [1.85, 0.39, 0.035, 0.04],
  ], 0, paints[0], 'Sculpted monocoque');

  for (const side of [-1, 1]) {
    body([[-0.46, 0.47, 0.095, 0.08], [-0.25, 0.51, 0.195, 0.23], [0.1, 0.5, 0.2, 0.31],
      [0.75, 0.43, 0.15, 0.26], [1.3, 0.37, 0.08, 0.13], [1.48, 0.35, 0.015, 0.015]],
    side * 0.49, paints[0], 'Sculpted sidepod');
    const inlet = add(new SphereGeometry(1, 20, 12), carbon, [-0.21, 0.53, side * 0.57], 'Sidepod intake');
    inlet.scale.set(0.035, 0.113, 0.185);
    panel([[-0.2, 0.6], [0.45, 0.57], [1.17, 0.41], [0.75, 0.46], [0.04, 0.48]], 0.024, side * 0.775, paints[1], 'Livery side ribbon');
    panel([[0.1, 0.59], [0.8, 0.51], [1.12, 0.435], [0.74, 0.48], [0.1, 0.56]], 0.027, side * 0.793, paints[2], 'Livery pinstripe');
    panel([[-0.16, 0.55], [0.65, 0.49], [1.12, 0.407], [0.65, 0.455], [-0.16, 0.515]], 0.026, side * 0.8, paints[3], 'Livery secondary ribbon');
    panel([[-0.06, 0.465], [0.63, 0.415], [1.08, 0.365], [0.64, 0.38], [-0.06, 0.43]], 0.027, side * 0.78, paints[4], 'Livery lower ribbon');
    for (let i = 0; i < 3; i++) {
      const blade = box([0.38, 0.014, 0.038], [0.38 + i * 0.15, 0.667 - i * 0.034, side * 0.48], carbon, 'Cooling louvre');
      blade.rotation.z = -0.11;
    }
    rod([-1.05, 0.48, side * 0.18], [-1.55, 0.43, side * 0.99]);
    rod([-1.94, 0.46, side * 0.14], [-1.55, 0.43, side * 0.99]);
    rod([-1.06, 0.65, side * 0.15], [-1.55, 0.58, side * 0.99], 0.019);
    rod([0.83, 0.39, side * 0.29], [1.42, 0.43, side * 0.99]);
    rod([1.76, 0.43, side * 0.13], [1.42, 0.43, side * 0.99]);
    rod([0.86, 0.64, side * 0.21], [1.42, 0.58, side * 0.99], 0.019);
    const mirror = add(new SphereGeometry(1, 16, 10), paints[1], [-0.44, 0.84, side * 0.53], 'Mirror');
    mirror.scale.set(0.11, 0.048, 0.082);
    rod([-0.37, 0.73, side * 0.31], [-0.43, 0.82, side * 0.5], 0.016);
  }

  // Narrow contrasting paint strips follow the raised nose rather than floating above it.
  panel([[-2.31, 0.453], [-1.55, 0.709], [-0.86, 0.785], [-0.56, 0.829], [-0.78, 0.802], [-1.54, 0.731]], 0.1, 0, paints[2], 'Nose racing ribbon');
  for (const side of [-1, 1]) {
    panel([[-2.19, 0.497], [-1.54, 0.711], [-0.75, 0.798], [-0.73, 0.805], [-1.54, 0.724], [-2.19, 0.511]], 0.021, side * 0.072, paints[1], 'Nose pinstripe');
    panel([[-2.14, 0.522], [-1.54, 0.726], [-0.78, 0.807], [-0.78, 0.814], [-1.54, 0.737], [-2.14, 0.535]], 0.027, side * 0.037, paints[3], 'Nose accent stripe');
  }
  const cockpit = add(new SphereGeometry(1, 28, 14), glass, [0.05, 0.834, 0], 'Recessed cockpit');
  cockpit.scale.set(0.43, 0.068, 0.235);
  const seat = add(new SphereGeometry(1, 20, 12), carbon, [0.16, 0.872, 0], 'Cockpit seat');
  seat.scale.set(0.17, 0.035, 0.14);
  const haloCurve = new CatmullRomCurve3([
    new Vector3(0.38, 0.86, -0.3), new Vector3(-0.12, 1.01, -0.3),
    new Vector3(-0.46, 1.045, 0), new Vector3(-0.12, 1.01, 0.3), new Vector3(0.38, 0.86, 0.3),
  ]);
  add(new TubeGeometry(haloCurve, 30, 0.032, 8, false), carbon, [0, 0, 0], 'Halo');
  rod([-0.46, 1.045, 0], [-0.5, 0.79, 0], 0.023);
  body([[0.35, 0.85, 0.13, 0.15], [0.57, 0.91, 0.21, 0.145], [0.88, 0.83, 0.19, 0.12],
    [1.36, 0.62, 0.15, 0.06], [1.63, 0.49, 0.04, 0.015]], 0, paints[1], 'Engine cover');
  panel([[0.59, 0.99], [0.62, 1.16], [0.9, 1.08], [1.57, 0.67], [1.38, 0.64]], 0.035, 0, paints[0], 'Shark fin');
  const airbox = add(new SphereGeometry(1, 16, 12), carbon, [0.435, 1.048, 0], 'Airbox');
  airbox.scale.set(0.055, 0.065, 0.082);

  for (let layer = 0; layer < 3; layer++) {
    const frontWing = box([0.27, 0.045, 2.16 - layer * 0.12], [-2.36 + layer * 0.14, 0.19 + layer * 0.065, 0], layer === 1 ? paints[2] : carbon, 'Front wing element');
    frontWing.rotation.z = -0.12;
  }
  for (const side of [-1, 1]) {
    panel([[-2.58, 0.17], [-2.57, 0.34], [-2.12, 0.39], [-2.04, 0.19]], 0.045, side * 1.1, paints[0], 'Front wing endplate');
    panel([[1.62, 0.62], [1.77, 1.1], [2.17, 1.15], [2.23, 0.59]], 0.05, side * 0.82, paints[0], 'Rear wing endplate');
    box([0.26, 0.06, 0.055], [1.95, 1.16, side * 0.84], paints[2], 'Rear wing edge');
    rod([1.55, 0.39, side * 0.23], [1.9, 0.91, side * 0.23], 0.035);
  }
  for (let layer = 0; layer < 2; layer++) {
    const wing = box([0.43, 0.065, 1.7], [1.9 + layer * 0.06, 0.95 + layer * 0.15, 0], layer === 0 ? carbon : paints[1], 'Rear wing element');
    wing.rotation.z = 0.08;
  }
  const rearLight = new MeshStandardMaterial({ color: '#ee3d3f', emissive: '#a32323', emissiveIntensity: 0.7 });
  allMaterials.push(rearLight);
  box([0.07, 0.075, 0.1], [1.84, 0.33, 0], rearLight, 'Rear safety light');

  const tireProfile = [new Vector2(0.2, -0.21), new Vector2(0.31, -0.21), new Vector2(0.385, -0.17),
    new Vector2(0.416, -0.11), new Vector2(0.422, 0), new Vector2(0.416, 0.11), new Vector2(0.385, 0.17),
    new Vector2(0.31, 0.21), new Vector2(0.2, 0.21)];
  for (const x of [-1.55, 1.42]) {
    for (const side of [-1, 1]) {
      const z = side * 1.01;
      const tire = add(new LatheGeometry(tireProfile, 40), rubber, [x, 0.425, z], 'Slick tire');
      tire.rotation.x = Math.PI / 2;
      for (const offset of [-0.105, 0.105]) {
        add(new TorusGeometry(0.416, 0.0045, 5, 40), rubberEdge, [x, 0.425, z + offset], 'Tire seam');
      }
      add(new TorusGeometry(0.329, 0.01, 7, 40), tireMark, [x, 0.425, z + side * 0.21], 'Tire sidewall ring');
      const rim = add(new CylinderGeometry(0.23, 0.23, 0.022, 32), carbon, [x, 0.425, z + side * 0.216], 'Wheel rim');
      rim.rotation.x = Math.PI / 2;
      add(new TorusGeometry(0.218, 0.013, 8, 32), alloy, [x, 0.425, z + side * 0.235], 'Rim lip');
      for (let i = 0; i < 10; i++) {
        const angle = i / 10 * Math.PI * 2;
        const spoke = box([0.17, 0.023, 0.022], [x + Math.cos(angle) * 0.12, 0.425 + Math.sin(angle) * 0.12, z + side * 0.241], alloy, 'Wheel spoke');
        spoke.rotation.z = angle;
      }
      const center = add(new CylinderGeometry(0.047, 0.047, 0.032, 12), hub, [x, 0.425, z + side * 0.26], 'Wheel nut');
      center.rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) {
        const angle = 0.22 + i * 0.085;
        const mark = box([0.027, 0.046, 0.003], [x + Math.cos(angle) * 0.35, 0.425 + Math.sin(angle) * 0.35, z + side * 0.211], tireMark, 'Sidewall detail');
        mark.rotation.z = angle;
      }
    }
  }

  function update(next: LiverySceneTheme) {
    for (let i = 0; i < paints.length; i++) {
      paints[i].color.set(next.colors[i % next.colors.length] ?? '#b9c2c9');
      paints[i].metalness = next.id === 'normal' ? 0.85 : 0.26;
      paints[i].roughness = next.matte ? 0.58 : next.id === 'redbull-porcelain' ? 0.17 : 0.28;
      paints[i].clearcoat = next.matte ? 0.22 : 1;
      paints[i].side = DoubleSide;
    }
  }
  update(theme);
  return { group, update, materials: allMaterials };
}
