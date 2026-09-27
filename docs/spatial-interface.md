# W100 spatial interface

W100 ("Third dimension") combines two 3D layers: the W100 depth system and the spatial showroom that first shipped with W85.

## What the user sees

- **The mark** — the VESTRIPPN "3" as a real 3D object painted in the active livery: it flies in during the boot, spins on the route loader, turns to follow the pointer in the dashboard hero and the hub gyroscopes, and previews liveries in the garage.
- **The showroom** — an interactive, original open-wheel concept car in the dashboard and hub heroes, the livery collection, and the desktop sign-in. It is a procedural model inspired by the selected palette, not a replica of any historical chassis. Drag the car or use the view controls to inspect it.
- **Depth everywhere** — panels are built from a machined material (lit face, stepped edge, contact shade) and tilt toward the pointer; heroes are small dioramas (track floor, gyroscope, extruded edition number); page blocks rise out of depth as they scroll in; hubs turn like a carousel; numbers roll on 3D digit drums; dialogs swing in; a livery change sweeps the whole app along its stripe angle.

Content and form controls remain normal, accessible HTML. The 13 livery selections and Mercedes solar lighting remain the source of paint and interface colours.

## Implementation

- `components/w100/` + `lib/w100/` — the WebGL mark (`Mark3D`, no library), the depth engine (`useDepth`), the livery swap, and skeletons. Styles: `app/w100.css`, loaded last.
- `components/LiveryScene.tsx` + `lib/three/` — the three.js showroom: accessible viewer, lazy loading, theme subscription (`livery-scene.ts`), and the car geometry, repainted without rebuilding (`livery-model.ts`). Styles: `app/showroom.css`, `app/spatial-layout.css`.
- `app/depth.css` — the static spatial material. The W100 depth engine drives its light (`--spatial-light-x/y`) and owns all tilting; there is one tilt engine.
- `components/usePageMotion.ts` tags the page's top-level blocks for the scroll-driven depth in `app/w100.css`.

Graphics load only in the browser. The showroom keeps a static illustration while loading and when WebGL cannot run; the mark falls back to the flat logo. Low power and reduced motion pause decorative movement (the mark renders still frames, numbers show as text); view controls remain usable. Offscreen or hidden scenes pause, and closing the collection releases its renderer.

## Validation

`npm run validate:spatial` checks finite mesh data, camera bounds, four wheels, complete wings and cockpit, all catalog paints, and updates that reuse geometry. It runs in CI alongside the existing theme, coverage, and clinical-case validators.

For browser verification, check a dashboard, shared hub, sign-in form, content-only route, and the livery dialog. Verify drag and keyboard views, colour changes, Escape dismissal and focus return, narrow layouts, live Low power, reduced motion, and the static fallbacks. A local fixture may supply sample dashboard data; never add an authentication bypass to production for visual checks.
