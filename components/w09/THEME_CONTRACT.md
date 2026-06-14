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

Defaults are declared in `app/globals.css`:

- `:root` → **Neutral (light)**
- `.dark` → **Neutral (dark)** — so W09 surfaces sit correctly inside W07's
  existing dark mode with no livery applied.

## Liveries

A livery is a single class that overrides the contract for itself and all
descendants. Apply it to `<html>` (app-wide) **or** any wrapper element
(scoped / preview):

| Livery | Class | Identity |
| --- | --- | --- |
| Williams | `.w09-monza` | navy · white · brass-gold · classic red |
| Esther Bunny | `.w09-esther` | pink · pastel · soft motion · cozy (larger radius, slower motion) |
| Senna | `.w09-senna` | yellow · blue · green · analog motorsport |
| Verstappen | `.w09-verstappen` | Dutch orange · deep navy · white/blue/red flash |

Because CSS variables inherit, a value declared on a closer element always wins,
so wrapper-scoped liveries override the neutral root regardless of selector
specificity. (Neutral-dark is keyed on `.dark` — a plain class — so a livery
class on the same `<html>` element wins by source order.)

### Adding a livery

1. Add a `.w09-<name> { … }` block in `globals.css` overriding any subset of the
   variables above (unset variables fall back to neutral).
2. No component changes required.

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

> Scope note: `.w09-monza` remains the class name for compatibility with older
> stored preferences, but the visible livery identity is Williams.
