# VESTRIPPN

The root environment for Kaiau's medicine, research, software and experiments: a personal website, study runtime, research engine and archive in one Next.js app, deployed at [vestrippn.vercel.app](https://vestrippn.vercel.app).

Everything sits inside one application shell laid out like VS Code: an activity bar with Explorer, Search, Outline, Study, Appearance and Account views, editor tabs for the pages you open, a split editor, breadcrumbs, a panel with an output log and a terminal, a status bar, a `settings.json`, and a ⌘K command palette with Open Recent. Colour themes include VS Code's Dark/Light Modern and Dark+/Light+. Pages are either **environment** pages (root, identity, systems, projects, medicine, research, garage, archive, contact) or **runtime** modules: the working study hubs (academics, workspace, cases, study, drugs, analytics, assistant, fitness, IELTS, tools).

See [`docs/system.md`](docs/system.md) for the design system, the registry and the appearance and livery model.

## Stack

- Next.js 16 (App Router, Turbopack) with React 19
- Auth.js v5, using Google, LINE and email/password, with the Prisma adapter
- Prisma 7 on PostgreSQL
- three.js for the garage objects, plus a raw WebGL mark
- Tailwind CSS 4, remapped onto the system design tokens

## Getting started

Requires Node.js 22 or newer, plus a PostgreSQL database.

```bash
npm ci
cp .env.example .env.local   # then fill in AUTH_SECRET and VESTRIPPN_PRISMA_DATABASE_URL
npx prisma migrate deploy    # apply migrations to your database
npm run dev                  # http://localhost:3000
```

Only two variables are critical: `AUTH_SECRET` and `VESTRIPPN_PRISMA_DATABASE_URL`. A local database without TLS also needs `VESTRIPPN_DB_SSL=disable`. Every other integration is optional, and a missing one just turns that feature off. The boot log (`instrumentation.ts` → `lib/env.ts`) prints which integrations are configured. [`.env.example`](.env.example) lists them all:

| Integration | Variables |
| --- | --- |
| Sign-in providers and access | `GOOGLE_CLIENT_ID/SECRET`, `LINE_CLIENT_ID/SECRET`, `OWNER_EMAIL`, `AUTH_ALLOWED_EMAILS` |
| Canvas grades and deadlines | `CANVAS_TOKEN`, `CANVAS_BASE_URL`, `CANVAS_COURSES` |
| Assistant and research search | `OPENAI_API_KEY`, `OPENAI_MODEL`, `NCBI_API_KEY`, `ELSEVIER_API_KEY`, `ELSEVIER_INSTTOKEN` |
| Gmail feed (owner only) | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_QUERY` |
| Anki add-on | `ANKI_SYNC_EMAIL`, `ANKI_SYNC_SECRET` |
| Exam reminders (web push) | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` |

To seed the clinical case bank, run `npx tsx scripts/seed-w08-learn.ts`. The seed script reads `.env`, not `.env.local`, so either export `VESTRIPPN_PRISMA_DATABASE_URL` or put it in `.env`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | `prisma generate`, `prisma migrate deploy`, then `next build`. Vercel runs this. |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint, with zero warnings allowed |
| `npm test` | Unit tests (`node:test`) for the pure modules: editor tabs, recent pages, settings.json, terminal, search, allow-list, rate limiter, workbench state, drug cards, case review scheduling, case graph validation, drills and exam countdowns |
| `npm run test:e2e` | Playwright end-to-end and accessibility (axe, WCAG 2.1 AA) tests against a production build. Run `npx next build` first. A preinstalled Chromium can be used with `PW_CHROMIUM_PATH` |
| `npm run validate:cases` | The 50 branching clinical cases are well-formed |
| `npm run validate:coverage` | The WilliamsHub exam coverage catalogue and backups |
| `npm run validate:themes` | Every livery in both appearances: contrast, sync and pre-paint parity |
| `npm run validate:spatial` | The 3D garage model: geometry, camera bounds and livery materials |
| `npm run validate:nav` | Editable navigation: layout round trip and rejection of hostile values |

CI (`.github/workflows/ci.yml`) runs Prisma validation, the typecheck, lint, unit tests and every validator, and in a second job builds the app and runs the Playwright suite (workbench, nav editor, themes, phone layout, security headers and auth, drug cards, study tools, and an axe scan of 16 pages in three themes) on each push to `main` and on every pull request.

## Layout

```
app/                  routes; each page.tsx sets its own <title> via metadata
  api/                route handlers (each one checks auth itself)
  system.css          shared sys-* component styles; tokens live in globals.css
components/system/    shell, command palette, nav editor, primitives, hooks
lib/system/           registry, navigation, editable nav layout
lib/                  integrations (canvas, anki, research sources, push), theme engine
prisma/               schema and migrations
scripts/              validators, seeds, coverage import
anki-addon/           Anki add-on that pushes review stats to /api/anki
proxy.ts              page auth gate (Next 16 proxy, formerly middleware)
```

## Study tools

- **Exam countdowns.** For each exam in the next 90 days, the objectives still to cover (untouched first, then reviewed) are spread evenly over the days left. The last two days are kept for a weak-spot drill. Today's share appears in the daily plan (Workspace → plan) and in the Study view.
- **Weak-spot drill** (`/study/drill`). Your ten weakest objectives in one course: untouched first, then low recent test scores, then reviewed but never tested. You grade each prompt *got it / shaky / missed*, and the score is saved to the coverage map as a practice result. Cases from the same body system are suggested at the end.
- **Case review.** A case where the patient died, or where you made a deadly choice, comes back after 1, 3, 7 and 14 days (`CaseReview` table). A clean run moves it up a step; another miss starts it again. Due cases show on the case bank, the Study view and `/study`.
- **Case editor** (`/study/editor`, owner only). Edit the decision tree of any branching case, or write a new one. The same validator runs in the browser and on save: every choice must lead somewhere, every node must be reachable, every path must end, and choice text may not give the outcome away. Note that `scripts/seed-w08-learn.ts` upserts the seeded cases, so re-running it overwrites edits to them.
- **Drug cards** (`/drugs`, ⌘K, `drug <name>` in the terminal). Class, mechanism, typical adult dose, pitfalls and the skeletal formula of 33 high-yield drugs; a study aid, not a prescribing reference. The text is in `content/drugs/drugs.json`. After adding or changing a SMILES, run `python scripts/generate-drug-structures.py` (needs `pip install rdkit`) to redraw the structures and recompute formula and mass.

## Navigation tabs

The sidebar tabs can be edited from **customize tabs** at the bottom of the sidebar or the phone drawer, or from ⌘K → *Customize tabs*. You can:

- rename, reorder (drag, or the ↑ ↓ buttons) and hide any tab
- add your own tabs that point at an in-app path or an `https://` link

`root` can be renamed but never hidden. The layout is saved as the `nav` preference and synced to your account through `/api/device-sync`, alongside your livery and appearance. If you add a new page to `lib/system/navigation.ts` or `RUNTIME`, it appears automatically at the end of its group in every saved layout.

## Auth

`proxy.ts` sends anyone without a session to `/auth/signin`, except on `/auth`, `/learn` and `/legal`. Pages and API routes still verify the session themselves with `auth()` / `requireUserId()`; API routes are not behind the proxy, so every one must.

- Google and LINE sign-in follow `AUTH_ALLOWED_EMAILS` (default: the owner plus any `@gmail.com` account). Every account gets its own data.
- Integrations that run on the owner's credentials (Canvas grades, the Gmail and Canvas feed) are served to the owner only (`requireOwnerId` / `isOwner` in `lib/auth/owner.ts`).
- Email/password sign-in and sign-up are rate-limited per address. The counters live in Postgres (`RateLimit` table, keys stored as SHA-256 hashes), so every serverless instance shares them; if the database is unreachable an in-memory limiter takes over. A password can't be added to an existing Google/LINE account except by that account, signed in.
- Security headers (framing limited to this site, which the split editor uses; nosniff, referrer and permissions policies, HSTS) are set in `next.config.ts`.

## Anki add-on

Copy `anki-addon/` into Anki's add-ons folder and set `secret` to your `ANKI_SYNC_SECRET`. [`anki-addon/config.md`](anki-addon/config.md) covers the rest. It pushes stats to `/api/anki` while Anki is open.
