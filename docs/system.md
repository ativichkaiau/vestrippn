# VESTRIPPN system

VESTRIPPN is the root environment: a personal website, study runtime, research engine and archive in one codebase. The interface is an application shell around one shared grammar. A page starts with a label and a title, adds metadata, then sections of indexed content.

## Where things live

| Concern | File |
| --- | --- |
| Design tokens (colour, type, radius, motion) and the Tailwind scale remap | `app/globals.css` |
| Shared component styles (`sys-*`) | `app/system.css`, `app/garage.css` |
| Shell: masthead, path bar, sidebar, drawer, status bar | `components/system/Shell.tsx` |
| Command palette (⌘K / Ctrl+K) | `components/system/CommandPalette.tsx` |
| Primitives: `Page`, `PageHeader`, `Section`, `MetadataGrid`, `RegistryTable`, `StatusIndicator`, `CommandLink`, `Action`, `Pipeline` | `components/system/primitives.tsx` |
| Registry: systems, projects, runtime modules, logs, garage objects | `lib/system/registry.ts` |
| Archive records and university summaries | `lib/system/archive.ts` |
| Identity | `lib/system/identity.ts` |
| Navigation and the path system (`/academics` → `~/medicine/academics`) | `lib/system/navigation.ts` |
| The environment tree on the root page | `lib/system/tree.ts`, `components/system/SystemTree.tsx` |
| Which pages are public | `proxy.ts` |
| Assistant: hub personas, live context, request budget | `lib/assistant/`, `app/api/assistant/route.ts`, `components/assistant/AssistantClient.tsx` |
| Sources: parsing, chunking, embeddings, retrieval, grounded answers | `lib/das/`, `app/api/das/` |
| IELTS question bank | `lib/learn/ielts-bank.ts`, `app/api/learn/ielts/` |
| Social card, sitemap, robots | `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts` |

## Registry rule

Every count, index and inspector page is read from the registry. A field is filled in only when the fact is known. Unknown URLs, dates and stacks stay undefined, and the UI leaves them out. To add a system or project, add a `Node` to `NODES` with `system: true` and/or `project: true`. It then appears in the systems or projects registry, the palette, the status bar counts and its own inspector page. Everything in the registry and the archive is public, links included: the shell and the palette import them, so they reach every visitor's browser.

Open entries waiting on facts: launch URLs for `studyex_medeetomihub` and `Terra`, the source for `cardiac_sim_physics`, and the recording for `LOG_001`.

## Public and private

The portfolio is public: root, identity, systems, projects, medicine, research, logs, garage, archive, contact, legal, case practice and IELTS practice. The study hubs and the assistant need sign-in. `proxy.ts` holds the public list; every other page redirects to sign-in, so a new page stays private until it is added there. The proxy does not cover `/api`. Each private API route checks the session itself with `requireUserId`, and answers 401 without one.

- **Rendering.** Pages that read the session (root, research) render per request. The auth helpers in `lib/auth/owner.ts` rethrow Next's dynamic-render signal (`unstable_rethrow`), so these pages are never prerendered as a visitor's view.
- **Owner fallback.** `resolveUserId` falls back to the owner account when there is no session. Use `requireUserId` in anything a visitor can reach. Four case-bank routes under `app/api/learn/cases/` still use the fallback.

## Assistant

`/das` answers in two modes. Both count against one budget.

- **Hub data** (`POST /api/assistant`): streams plain text. It builds the brief from the live data of the chosen hub (tasks, exams, Canvas, Anki, research, fitness…) and up to 12 earlier turns. Opened from the palette, it starts on the hub of the page you were on; otherwise on root.
- **Your sources** (`POST /api/das/chat`): answers only from ingested documents and cites them as `[n]`. The stream is Server-Sent Events: `meta`, `token`, `citations`, `done`, `error`. Threads are stored in `ChatThread` and `ChatMessage`.

The palette offers `Ask: “…”` for any query when signed in. A query that starts with `ask ` or `? ` shows only that entry. Either opens `/das?q=…&hub=…`, with the hub taken from the current page. An answer can be saved as a task.

**Sources** (`/das/ingest`) accepts PDF or DOCX up to 15 MB, or pasted text. Documents are split by words with a character cap, because Thai has no spaces. Each document is limited to 800 passages, which are embedded with `text-embedding-3-small` into pgvector (`DocumentChunk`). Deleting a source removes its passages.

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | — | Required. Without it the assistant APIs answer 503. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Chat model for both modes. |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | For a proxy, or a local mock in tests. |
| `ASSISTANT_RATE_LIMIT` | `10` | Requests per window, shared by both modes (`AssistantUsage`). |
| `ASSISTANT_RATE_WINDOW_HOURS` | `5` | Sliding window for the limit. |
| `EMBEDDING_MONTHLY_TOKEN_BUDGET` | `1000000` | Embedding tokens per user per month (`UserUsage`). |

## IELTS practice

`/learn/ielts` is public. Questions come from `lib/learn/ielts-bank.ts` plus any `IELTSItem` rows in the database. Grading happens on the server, so correct answers never reach the browser. Attempts are saved to `UserAttempt` only for a signed-in user.

## Appearance and liveries

Two independent settings:

- **Appearance** (`vest_mode`): dark (default), light, or auto. Auto follows the sun over Chiang Mai, using the solar engine in `lib/theme-engine.ts`.
- **Livery** (`vest_livery`): repaints the environment and the garage objects. `environment()` in `lib/theme-engine.ts` derives the accent from the livery, tints the four surfaces and the lines toward the livery's colour, and recomputes the secondary and muted text so they stay at 4.5:1 or better. The shell shows the livery's stripe under the masthead, plus its name and swatch in the status bar and sidebar. Tailwind's cool hues follow the accent, so the hubs repaint too. `system` (VESTRIPPN graphite and blue) is the design as specified, with no tint and no stripe. First visits open on it, and a saved livery is kept.

`npm run validate:themes` checks every livery in both appearances: contrast on all four surfaces, distinct accents, pre-paint parity between the boot script and the hydrated engine, and that a light livery never lightens a dark interface.

## Mounted hubs

The study hubs (academics, workspace, cases, analytics, fitness, IELTS, assistant) keep their own components. They render inside `<Page hub>` and read the W09 theme contract, which `globals.css` now bridges to the system tokens. Tailwind's palette, radius, shadow and blur scales are remapped onto the tokens, so hub markup inherits the system without per-page CSS.

## Motion

Motion uses CSS only, at 120–220 ms: page fade-in, the drawer and palette reveal, and the blinking cursor in the masthead. Framer-motion components in the hubs run under `MotionPolicy` (`reducedMotion="always"`), so they fade but never spring or travel. The garage viewer is the one thing that moves on its own. It sleeps between frames at 30 fps and pauses when hidden, under reduced motion and in low power.

## Garage

`OBJECT_001` (Silver Arrow) is the procedural three.js car in `lib/three/`. `npm run validate:spatial` checks it. The viewer offers ¾, side and front presets, a turntable, keyboard control, and a live yaw and pitch readout. It reads mesh and triangle counts from the loaded model. `OBJECT_002` is the W100 WebGL mark (`components/w100/Mark3D.tsx`), kept as an object.
