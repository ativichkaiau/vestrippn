# W09 Theme Contract

Every W09 primitive in `components/w09/` renders **only** through the CSS custom
properties below. This is a hard rule:

> ❌ No hex literals in components. ❌ No Tailwind color classes (`bg-blue-500`,
> `text-emerald-400`, …). ✅ Only `var(--w09-*)` consumed via Tailwind arbitrary
> values (`bg-[var(--w09-surface)]`, `text-[color:var(--w09-text)]`).

Structural utilities (`flex`, `gap-3`, `p-4`, `text-sm`, `rounded-[var(--w09-radius)]`)
are fine — the restriction is on **color, accent, radius, shadow, typography
accent, and motion**, which must flow from the contract so a livery swap restyles
every primitive with zero component edits.

## Variable contract

| Variable | Role |
| --- | --- |
| `--w09-bg` | Page / app background behind surfaces |
| `--w09-surface` | Default card / panel fill |
| `--w09-surface-raised` | Elevated fill (inputs, popovers, message bubbles) |
| `--w09-border` | Hairline borders & dividers |
| `--w09-text` | Primary text |
| `--w09-text-muted` | Secondary / supporting text |
| `--w09-accent-primary` | Primary brand accent (buttons, active state) |
| `--w09-accent-secondary` | Secondary accent (chrome / pastel / green, per livery) |
| `--w09-accent-tertiary` | Optional third accent / sub-color (Williams: red flash, per livery) |
| `--w09-accent-contrast` | Text/icon color that sits **on** an accent fill |
| `--w09-success` | Positive state (correct answer, completed) |
| `--w09-danger` | Negative state (wrong answer, error) |
| `--w09-focus-ring` | Keyboard focus ring color |
| `--w09-radius` | Base corner radius |
| `--w09-shadow` | Elevation shadow |
| `--w09-font-display` | Display / heading font stack |
| `--w09-motion-duration` | Base transition duration |
| `--w09-motion-ease` | Base easing curve |

Defaults and the shared surface aliases are declared in `app/liveries.css`.
The `--w09-*` contract inherits the same palette as every W85 route. Semantic
success and danger colours retain their meaning across team selections.

## Liveries

`lib/liveries.ts` owns IDs, team groups, labels, stripes, and palettes.
`lib/theme-engine.ts` resolves the palette; `lib/theme.ts` applies it to `<html>`
with `data-livery`, `data-mode`, `data-phase`, and `data-tone`. The same engine
is serialized into the pre-paint script, and a global controller follows the
Chiang Mai solar cycle in Auto mode. Light-bodied liveries use light controls;
dark liveries use dark controls. The preview uses the real collection picker.

### Adding a livery

1. Add a definition to `LIVERY_CATALOG` in `lib/liveries.ts`.
2. Add an optional pattern in `app/liveries.css` using `data-livery` and the
   corresponding `data-design` preview. Avoid global colour-ramp remapping.
3. Run `npm run validate:themes`, check a real page, and check this preview.

## Consuming the contract (Tailwind v4 cheatsheet)

```tsx
// color utilities are type-ambiguous → prefix color: for text/border/ring
bg-[var(--w09-surface)]
text-[color:var(--w09-text)]
border border-[color:var(--w09-border)]
ring-[color:var(--w09-focus-ring)]
// unambiguous utilities take the var directly
rounded-[var(--w09-radius)]
shadow-[var(--w09-shadow)]
duration-[var(--w09-motion-duration)]
ease-[var(--w09-motion-ease)]
// anything else → arbitrary property
[font-family:var(--w09-font-display)]
```

## Primitives covered

- `ChatPane` — DAS chat (streaming-capable rendering; **no fetch logic** — Phase B)
- `CitationPopover` — DAS chat inline citations
- `QuestionCard` — IELTS practice (uncontrolled or controlled)
- `CaseStepper` — Clinical Cases progress (uncontrolled or controlled)

Legacy `monza` and `verstappen` preferences migrate to `williams-1996` and
`redbull-dutch-2026`. Retired team preferences migrate to Mercedes. Backup
restore and device sync run the same migration; obsolete classes are removed.
