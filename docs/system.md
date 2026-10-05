# VESTRIPPN system

VESTRIPPN is the root environment: a personal website, study runtime, research engine and archive in one codebase. The interface is an application shell around one shared grammar. A page starts with a label and a title, adds metadata, then sections of indexed content.

## Where things live

| Concern | File |
| --- | --- |
| Design tokens (colour, type, radius, motion) and the Tailwind scale remap | `app/globals.css` |
| Shared component styles (`sys-*`) | `app/system.css`, `app/garage.css` |
| Shell (VS Code workbench): title bar, activity bar, side views, editor tabs, breadcrumbs, panel, status bar, drawer | `components/system/Shell.tsx`, `ActivityBar.tsx`, `SideViews.tsx`, `EditorTabs.tsx`, `Panel.tsx`, `Shortcuts.tsx` |
| Workbench state, editor tabs, output log, terminal, shared search index | `lib/system/workbench.ts`, `editor-tabs.ts`, `output-log.ts`, `terminal.ts`, `search.ts` |
| Command palette (⌘K / Ctrl+K) | `components/system/CommandPalette.tsx` |
| Primitives: `Page`, `PageHeader`, `Section`, `MetadataGrid`, `RegistryTable`, `StatusIndicator`, `CommandLink`, `Action`, `Pipeline` | `components/system/primitives.tsx` |
| Registry: systems, projects, runtime modules, garage objects | `lib/system/registry.ts` |
| Archive records and university summaries | `lib/system/archive.ts` |
| Identity | `lib/system/identity.ts` |
| Navigation and the path system (`/academics` → `~/medicine/academics`) | `lib/system/navigation.ts` |
| Editable tabs: layout model, device store, editor dialog | `lib/system/nav-layout.ts`, `lib/system/nav-store.ts`, `components/system/NavEditor.tsx` |

## Registry rule

Every count, index and inspector page is read from the registry. A field is filled in only when the fact is known. Unknown URLs, dates and stacks stay undefined, and the UI leaves them out. To add a system or project, add a `Node` to `NODES` with `system: true` and/or `project: true`. It then appears in the systems or projects registry, the palette, the status bar counts and its own inspector page, all generated statically.

Retired entries (Terra, cardiac_sim_physics, code_till_i_am_bored, the old studyex entry and the logs) redirect: `/systems/williamshub` and `/systems/studyex` go to `studyex_medeetomihub` (formerly WilliamsHub), `/logs` goes to root (`next.config.ts`).

## Appearance, colour themes and liveries

Three independent settings:

- **Appearance** (`vest_mode`): dark (default), light, or auto. Auto follows the sun over Chiang Mai, using the solar engine in `lib/theme-engine.ts`.
- **Colour theme** (`vest_theme`): `vestrippn` (default), `vscode-modern` (Dark Modern / Light Modern) or `vscode-classic` (Dark+ / Light+, blue status bar). The appearance picks the dark or light variant. A VS Code theme sets the whole palette, including the shell's title, activity, tab and status bar tokens (`--shell-*`), from `lib/vscode-themes.ts`; the livery then contributes only its stripe and the garage paint. Switch it from ⌘K → *Color Theme* or the sidebar's session block.
- **Livery** (`vest_livery`): repaints the environment and the garage objects. `environment()` in `lib/theme-engine.ts` derives the accent from the livery, tints the four surfaces and the lines toward the livery's colour, and recomputes the secondary and muted text so they stay at 4.5:1 or better. The shell shows the livery's stripe under the masthead, plus its name and swatch in the status bar and sidebar. Tailwind's cool hues follow the accent, so the hubs repaint too. `system` (VESTRIPPN graphite and blue) is the design as specified, with no tint and no stripe. First visits open on it, and a saved livery is kept.

`npm run validate:themes` checks every livery in both appearances: contrast on all four surfaces, distinct accents, pre-paint parity between the boot script and the hydrated engine, and that a light livery never lightens a dark interface.

## Mounted hubs

The study hubs (academics, workspace, cases, analytics, fitness, IELTS, assistant) keep their own components. They render inside `<Page hub>` and read the W09 theme contract, which `globals.css` now bridges to the system tokens. Tailwind's palette, radius, shadow and blur scales are remapped onto the tokens, so hub markup inherits the system without per-page CSS.

## Motion

Motion uses CSS only, at 120–220 ms: page fade-in, the drawer and palette reveal, and the blinking cursor in the masthead. Framer-motion is loaded only by the four hubs that use it (academics, fitness, IELTS, research), whose route pages wrap them in `MotionPolicy` (`reducedMotion="always"`), so they fade but never spring or travel. Toasts and notices use CSS (`.sys-pop-in`). Focus mode loads on first request (`FocusModeLoader`). The garage viewer is the one thing that moves on its own. It sleeps between frames at 30 fps and pauses when hidden, under reduced motion and in low power.

## Garage

`OBJECT_001` (Silver Arrow) is the procedural three.js car in `lib/three/`. `npm run validate:spatial` checks it. The viewer offers ¾, side and front presets, a turntable, keyboard control, and a live yaw and pitch readout. It reads mesh and triangle counts from the loaded model. `OBJECT_002` is the W100 WebGL mark (`components/w100/Mark3D.tsx`), kept as an object.

## Workbench

The shell follows VS Code's layout. The **activity bar** switches the side view: Explorer (environment and runtime tabs, systems, projects as collapsible folders), Search (the same index as ⌘K), Appearance (colour theme, appearance, livery) and Account (session and device sync). Selecting the open view again hides the side bar.

Every page you open gets an **editor tab**. Pinned tabs stay at the front. Tabs, the side view and the panel are saved per device (`vest_editor_tabs`, `vest_workbench`); the nav layout and colour theme sync to the account.

The **panel** has OUTPUT (what the environment did this session: routes, sync, theme, notifications) and TERMINAL, a small shell over the tree: `ls`, `cd medicine`, `open studyex_medeetomihub`, `theme classic`, `appearance light`, `livery next`, `find anki`, `tabs`, `help`.

| Keys | Action |
| --- | --- |
| ⌘/Ctrl+K, ⌘/Ctrl+P | Search everything / quick open |
| ⌘/Ctrl+Shift+P | Commands only (or type `>` in the palette) |
| ⌘/Ctrl+B | Toggle the side bar (the drawer on phones) |
| ⌘/Ctrl+Shift+E / F | Explorer / Search view |
| ⌘/Ctrl+` | Toggle the panel |
| Alt+W, Alt+[ / ], Alt+1…9 | Close tab, previous/next tab, go to tab (browsers reserve Ctrl+W and Ctrl+Tab) |
| ⌘/Ctrl+/ | Keyboard shortcuts sheet |
