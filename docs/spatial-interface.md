# W85 spatial interface

The dashboard, shared hub heroes, desktop sign-in, and livery collection show an interactive, original open-wheel concept. It is a procedural model inspired by the selected palette, not a replica of each historical chassis. Drag the car or use the view controls to inspect it. The 13 existing selections and Mercedes solar lighting remain the source of paint and interface colours.

The shared route shell adds physical edges, inset controls, a perspective floor, and gentle pointer lighting to existing HTML panels. `SpatialMark` builds the boot and loading emblem from six CSS faces. The content and form controls remain normal, accessible HTML.

## Implementation

- `components/LiveryScene.tsx` owns the accessible viewer, lazy loading, and theme subscription.
- `lib/three/livery-model.ts` constructs the car geometry and updates paint without rebuilding it.
- `lib/three/livery-scene.ts` owns the camera, lighting, renderer, input, and resource lifecycle.
- `components/useSpatialDepth.ts` enhances route panels without replacing their content or Framer transforms.
- `app/depth.css`, `app/showroom.css`, and `app/spatial-layout.css` apply shared materials and responsive layouts after the livery stylesheet.

Graphics are loaded only in the browser. A static illustration remains available while loading and when WebGL cannot run. Low power and reduced motion pause decorative movement; view controls remain usable. Offscreen or hidden scenes pause, and closing the collection releases its renderer.

## Validation

`npm run validate:spatial` checks finite mesh data, camera bounds, four wheels, complete wings and cockpit, all catalog paints, and updates that reuse geometry. It runs in CI alongside the existing theme, coverage, and clinical-case validators.

For browser verification, check a dashboard, shared hub, sign-in form, content-only route, and the livery dialog. Verify drag and keyboard views, colour changes, Escape dismissal and focus return, narrow layouts, live Low power, reduced motion, and the static fallback. A local fixture may supply sample dashboard data; never add an authentication bypass to production for visual checks.
