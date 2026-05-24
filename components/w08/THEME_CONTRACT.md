# W08 Theme Contract

Every W08 primitive in `components/w08/` renders **only** through the CSS custom
properties below. This is a hard rule:

> ❌ No hex literals in components. ❌ No Tailwind color classes (`bg-blue-500`,
> `text-emerald-400`, …). ✅ Only `var(--w08-*)` consumed via Tailwind arbitrary
> values (`bg-[var(--w08-surface)]`, `text-[color:var(--w08-text)]`).

Structural utilities (`flex`, `gap-3`, `p-4`, `text-sm`, `rounded-[var(--w08-radius)]`)
are fine — the restriction is on **color, accent, radius, shadow, typography
accent, and motion**, which must flow from the contract so a livery swap restyles
every primitive with zero component edits.

## Variable contract

| Variable | Role |
| --- | --- |
| `--w08-bg` | Page / app background behind surfaces |
| `--w08-surface` | Default card / panel fill |
| `--w08-surface-raised` | Elevated fill (inputs, popovers, message bubbles) |
| `--w08-border` | Hairline borders & dividers |
| `--w08-text` | Primary text |
| `--w08-text-muted` | Secondary / supporting text |
| `--w08-accent-primary` | Primary brand accent (buttons, active state) |
| `--w08-accent-secondary` | Secondary accent (chrome / pastel / green, per livery) |
| `--w08-accent-contrast` | Text/icon color that sits **on** an accent fill |
| `--w08-success` | Positive state (correct answer, completed) |
| `--w08-danger` | Negative state (wrong answer, error) |
| `--w08-focus-ring` | Keyboard focus ring color |
| `--w08-radius` | Base corner radius |
| `--w08-shadow` | Elevation shadow |
| `--w08-font-display` | Display / heading font stack |
| `--w08-motion-duration` | Base transition duration |
| `--w08-motion-ease` | Base easing curve |

Defaults are declared in `app/globals.css`:

- `:root` → **Neutral (light)**
- `.dark` → **Neutral (dark)** — so W08 surfaces sit correctly inside W07's
  existing dark mode with no livery applied.

## Liveries

A livery is a single class that overrides the contract for itself and all
descendants. Apply it to `<html>` (app-wide) **or** any wrapper element
(scoped / preview):

| Livery | Class | Identity |
| --- | --- | --- |
| Monza | `.w08-monza` | carbon fibre · chrome · Petronas cyan · black-silver |
| Esther Bunny | `.w08-esther` | pink · pastel · soft motion · cozy (larger radius, slower motion) |
| Senna | `.w08-senna` | yellow · blue · green · analog motorsport |

Because CSS variables inherit, a value declared on a closer element always wins,
so wrapper-scoped liveries override the neutral root regardless of selector
specificity. (Neutral-dark is keyed on `.dark` — a plain class — so a livery
class on the same `<html>` element wins by source order.)

### Adding a livery

1. Add a `.w08-<name> { … }` block in `globals.css` overriding any subset of the
   variables above (unset variables fall back to neutral).
2. No component changes required.

## Consuming the contract (Tailwind v4 cheatsheet)

```tsx
// color utilities are type-ambiguous → prefix color: for text/border/ring
bg-[var(--w08-surface)]
text-[color:var(--w08-text)]
border border-[color:var(--w08-border)]
ring-[color:var(--w08-focus-ring)]
// unambiguous utilities take the var directly
rounded-[var(--w08-radius)]
shadow-[var(--w08-shadow)]
duration-[var(--w08-motion-duration)]
ease-[var(--w08-motion-ease)]
// anything else → arbitrary property
[font-family:var(--w08-font-display)]
```

## Primitives covered

- `ChatPane` — DAS chat (streaming-capable rendering; **no fetch logic** — Phase B)
- `CitationPopover` — DAS chat inline citations
- `QuestionCard` — IELTS practice (uncontrolled or controlled)
- `CaseStepper` — Clinical Cases progress (uncontrolled or controlled)

> Scope note: Phase A ships the **contract + neutral defaults + livery stubs**.
> Final palette tuning for each livery is a later phase. The existing global
> `html.monza` retint in `globals.css` is a separate W07-era system and is left
> untouched (additive decision).
