import assert from 'node:assert/strict';
import { Box3, Color, Vector3 } from 'three';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { createRaceCar } = await jiti.import('../lib/three/livery-model.ts');
const { LIVERIES, LIVERY_CATALOG } = await jiti.import('../lib/liveries.ts');
const { themeEngine } = await jiti.import('../lib/theme-config.ts');
const theme = id => {
  const item = LIVERY_CATALOG[id];
  return { id, colors: item.colors, accent: item.palette.accent, isLight: item.tone === 'light', matte: /matte/i.test(item.finish) };
};

// Validate the actual mesh, independently of WebGL availability in CI.
const car = createRaceCar(theme('normal'));
car.group.updateMatrixWorld(true);
const bounds = new Box3().setFromObject(car.group);
const size = bounds.getSize(new Vector3());
assert(size.x > 4 && size.x < 6, 'The complete car fits the showroom camera');
assert(size.y > 1 && size.y < 1.5, 'The wings and cockpit remain in frame');
assert(size.z > 2 && size.z < 3, 'Both sets of wheels fit the platform');
assert(bounds.min.y >= -0.01, 'The wheels sit above the platform');
const meshes = [];
const geometries = new Set();
car.group.traverse(object => {
  if (!object.isMesh) return;
  meshes.push(object);
  geometries.add(object.geometry);
  for (const attribute of Object.values(object.geometry.attributes)) {
    assert(Array.from(attribute.array).every(Number.isFinite), `${object.name}: no invalid vertices or normals`);
  }
  const index = object.geometry.index;
  if (index) assert(Math.max(...index.array) < object.geometry.attributes.position.count, `${object.name}: triangle indices are valid`);
});
assert.equal(meshes.filter(mesh => mesh.name === 'Slick tire').length, 4, 'Four volumetric wheels');
assert(meshes.some(mesh => mesh.name === 'Recessed cockpit'));
assert(meshes.some(mesh => mesh.name === 'Front wing element'));
assert(meshes.some(mesh => mesh.name === 'Rear wing element'));
const originalGeometries = meshes.map(mesh => mesh.geometry);
for (const id of LIVERIES) {
  car.update(theme(id));
  assert.deepEqual(meshes.map(mesh => mesh.geometry), originalGeometries, 'Changing paint must not rebuild geometry');
  assert(car.materials[0].color.equals(new Color(LIVERY_CATALOG[id].colors[0])), `${id}: correct body paint`);
  for (const color of LIVERY_CATALOG[id].colors) {
    assert(meshes.some(mesh => mesh.material.color?.equals(new Color(color))), `${id}: every defining livery colour is used on the car`);
  }
}
car.update({ ...theme('redbull-2020'), matte: true });
const matteRoughness = car.materials[0].roughness;
car.update({ ...theme('redbull-porcelain'), matte: false });
assert(car.materials[0].roughness < matteRoughness, 'Matte and glazed finishes stay distinct');
for (const geometry of geometries) geometry.dispose();
for (const material of car.materials) material.dispose();
// The panel wash must improve contrast in both light and dark materials.
for (const id of LIVERIES) for (const mode of ['day', 'twilight', 'night']) {
  const resolved = themeEngine.resolve(id, mode);
  for (const surface of ['surface', 'raised', 'inset']) {
    const lit = '#' + resolved.palette[surface].slice(1).match(/../g).map(value => Math.round(parseInt(value, 16) * .88 + (resolved.dark ? 0 : 255) * .12).toString(16).padStart(2, '0')).join('');
    for (const key of ['text', 'muted', 'accent']) assert(themeEngine.contrast(resolved.palette[key], lit) >= 4.5, `${id}/${mode}: readable ${key} on lit ${surface}`);
  }
}
console.log(`3D model checks passed: ${meshes.length} meshes, ${LIVERIES.length} liveries, finite geometry, camera bounds, and live material updates.`);
