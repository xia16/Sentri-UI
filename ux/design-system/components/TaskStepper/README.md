**Status: candidate.** Extracted from farrowing's stepper keys (`.entry-row`, `.row-stepper`, `.feature-stepper`, the count sheet's `.hero-stepper`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskStepper (the Stepper card in farrowing's face)

The design system's [Stepper](../Stepper/README.md) card — its behaviour, keyboard, strings, hint line and states — drawn the way farrowing draws its steppers. Task pages use this, not `SentriUI.stepper` directly.

**Faces** (`data-face` on `.st-stepper.tk-stepper`)
- **row** (default for `variant: 'row'`): farrowing's entry row. `entry-row-min` (66px) tall, a 1px `line` between rows; the label `entry-label` 15px/500; **both keys outlined**: 48px (`tap-min`), `radius-control`, 1px `task-key-border`, `paper`, the glyph `glyph-key-task` (17px) at 2.2; the value `step-value` 18px/600 mono, 3ch; zero stays `ink`; a draft value `green`, a changed value `amber`.
- **well** (default for `variant: 'hero'`): Foster piglets / Reconcile count. The label as a section title (13px/500 `ink`, left), then the keys and value on a `well` (`radius-inset`, `space-row-y` padding); keys 46px outlined; the value `figure-well` 28px/600 mono; the hint (the rule line) 11px, left.
- **count**: the count sheet's hero. The whole card on `green-wash` (`radius-count` 16px); the label 13px/500 `green`; keys `hero-key` 54px at `radius-hero-key` 15px — **−** outlined (`chip-green-border`, `green` glyph), **+** filled `green`; the value `hero-count` 68px `count-ink`.

**States**
- Pressed (every face): the key fills `ink`, glyph `paper` (farrowing's `.key:active`).
- Floor-gray (nothing to do): `well` fill, `line` edge, `disabled-ink` glyph (count face: `paper` fill).
- No hint line is reserved unless the host passes a hint or pointers (farrowing reserves none).

**Component contract**
- **Props:** `SentriTask.stepper({ …SentriUI.stepper props, face: 'row' | 'well' | 'count' })`. Events, keys and strings are the Stepper card's (`data-action`, `data-step`, `strs.decrease/increase`).

**Don'ts**
- Don't draw the Stepper card's filled **+** on a task page; that is the design system's own face.
