**Status: candidate.** Extracted from farrowing's ruled counter and revised after the design panel ([ADR 0001](../../adr/0001-field-cards.md)). It is not approved.

# Stepper

The record sheet's counting field, drawn as `− n +`. Use it whenever the worker counts animals, as opposed to reading a number off a scale or a tag. A count in a sheet changes only this way: up is +, and down is −, a body, or Edit. Nobody types a count.

Call `SentriUI.stepper({ label, description, value, min, max, step, key, action, variant, changed, hint, pointers, reserveHint })`.

**Anatomy**
- **One silhouette in every state.** The label (with an optional description) sits on the left. `[−] n [+]` sits on the right, with the digit centred between its keys. No row ever changes shape as it wakes.
- **Row.**
  - Height is at least `stepper-row-min` (60px, the craft pass's glove spacing).
  - The label is `choice-label` (14px at 600) in `ink`. The description is `description` (11px) in `muted`.
  - When steppers stack, `rule` divides them, never above the first.
- **Keys.**
  - Each key's face is `field-height` (48px) square with `radius-control`. The faces are `space-key-gap` (8px) from the value.
  - Each key's hit area spans the whole row height, so a gloved tap anywhere in the row's column counts.
  - − is `paper` with a `control-border` edge and an `ink` glyph.
  - **+ is filled `ink` with a `paper` glyph.**
  - Glyphs are the registry's `minus` and `plus` strokes at `glyph-key` (14px), stroke 2.2, centred in the face. They are never text characters sitting on a baseline.
- **Value.** IBM Plex Mono `figure` (21px/500), with tabular numerals.
  - The cell is 3ch wide, or 4ch when `max ≥ 1000`, so the keys never move as the count gains a digit.
  - The value is a `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and is labelled by the label.
- **Status region (the hint line).** One persistent `role="status"` line under the row, always mounted. Both keys and the value point to it with `aria-describedby`. It is reserved, so no row slides under the thumb when a pointer appears.
  - It is `tap-min` (48px) tall where pointers can appear: the hero, `min > 0`, or `pointers` given.
  - It is one text line where only a ceiling note can appear (`max` given).
  - In a row that can do neither, it takes no space.
  - `reserveHint: false` or `true` overrides this.

**Variants**
- `row` (the default): a counting row in a drawer, in Edit or in Finish.
- `hero`: the one number a count sheet exists to set (farrowing's Alive).
  - The label is centred above, in `section-title` (13px) `muted`.
  - The keys are `hero-key` (54px) with `radius-inset` and `glyph-key-hero` (18px) glyphs, one at each edge.
  - The value is `hero-count` (68px/600, −3px) in `count-ink`.
  - The reserved line beneath holds the receipt (`Saved · +4 this visit`) or the pointers.
  - There is no box around the numeral.

**States**
- **Default:** − is outlined, + is filled `ink`, and the value is in `ink`.
- **Empty:** the value always prints. An empty count is a quiet `0` in `muted`, never blank or "—".
- **Pressed:** the key face scales to .96 over 120ms. The − face fills `press`, and + stays `ink`. Under reduced motion there is no transform.
- **Disabled: the floor-gray** (see *States* in the design-system README).
  - − at the floor (`value <= min`) and + at the ceiling (`value >= max`) take `disabled-fill` with a `disabled-ink` glyph.
  - They stay `aria-disabled` and tappable. The host answers the tap in the hint line:
    - At the floor, with **pointers**. These are text actions (the fourth register: 13px/600, no container, at least 48px): `Found dead? Record dead` · `Wrong count? Edit`.
    - At the ceiling, with **host-supplied copy**, which is required (`Weak and deformed can't pass 11 alive`).
  - − is present even when there is nothing to undo.
- **Focus:** a 3px `focus` ring, offset 2px, on the key face. The spinbutton value takes the same ring.
- **Error or out of range:** none. A stepper cannot hold an invalid value: the floor and ceiling gray the key instead of refusing a tap.
- **Corrected:** a figure corrected in Edit (`changed: true`) prints in `amber`.
- **Draft** (`draft: true` or `tone: 'draft'`): in a staged host, while the value carries an unsaved addition (posted 2, tapped + once, now 3), the value prints in `green`.
  - RULINGS, dead drawer: "the value itself turns green while it carries the draft's additions … the number is the receipt, same grammar as Alive". There is no chip.
  - − is live down to the posted value, which is the draft's floor, and grays there.
  - Save posts the draft and the value returns to `ink`. Clear discards it the same way.
  - `draft` and `changed` belong to different hosts (the dead drawer and Edit). If both are set, `draft` wins.
- **Loading:** none. The digit ticks at once, whatever kind of host it is (see *Commit contract*).

**Behaviour, decided deliberately**
- There is no auto-repeat on hold. A double tap is two steps. Counts are small, and a runaway repeat under a wet glove costs more than a second tap.
- `step` defaults to 1. `data-step` carries `−step` or `step`.
- The keys are `user-select: none` and `-webkit-touch-callout: none`, so a long press never selects or opens a callout.

**Commit contract**

A key emits a **requested delta** (`data-step`). The component never commits. The host decides what the delta does, and there are two kinds of host.
- **Immediate hosts** are recording surfaces: farrowing's Alive counter, the litter sheet's counts. Each accepted tap posts one stamped event at once (who · when), live-synced, append-only. Nothing is pending on the device, and a hand that bolts mid-count loses nothing. The visit nets these events into one row when it ends (RULINGS: the visit ends on sheet dismiss, at Lock, at session end, or after about 90 minutes idle).
- **Staged hosts** are drawers that edit a draft: the dead drawer, Edit. Each tap changes a **draft** held on the device and posts nothing.
  - **Save** posts the whole draft as one stamped event.
  - **Clear** discards the draft. It is a text action, present only while a draft exists.
  - **Back** leaves and keeps the draft on the device (pure navigation, RULINGS verbs).
  - The draft survives interruption and is shown as `N unsaved` until it is saved or cleared.
- Either way the host applies the floor and the ceiling before it accepts a delta. A delta against a floor-gray key is answered with pointers and never applied.

**Event contract**
- Every key is `<button data-action="<action, default step>" data-value="<key>" data-step="-step | step">`. The root carries `data-field="<key>"`.
- Delegate with `event.target.closest('[data-action]')`. A floor-gray key still fires. Check `aria-disabled` and answer in the status region; don't apply the delta.
- Pointers are text actions with their own `data-action` (for example `record-dead`, `edit`).
- Hardware keyboard: ArrowUp and ArrowDown on the focused value request + and −, through the same handler (the host binds them on `[role=spinbutton]`).
- Re-render by patching the one stepper keyed by `data-field`. Keep the root mounted so focus, the `aria-live` value and the status region survive.
- **Announcements are concise:** the value announces its number, and the status region announces the pointer or ceiling sentence. The label is never re-announced on a tap.

**What the caller provides**
- `label`: the thing counted, in sentence case, 14 characters or fewer in en.
- `min` and `max`: the floor (farrowing's Born floor for Alive, 0 elsewhere) and the ceiling (weak + deformed ≤ alive). Pass ceiling copy whenever `max` is set.
- `description`: only when the row needs its population ("among 11 alive").

**Don'ts**
- Don't let the worker type a count, and don't box the value.
- Don't hide − at zero, or swap the row for a "+ Add" button until the first tap.
- Don't colour + green. Farrowing's green hero + (`count-key`) waits on the owner (ADR 0001).
- Don't use a stepper for a measured value. That is a Measure.

**Strings**
- `strs: { label, description, value, hint, decrease, increase }` and `args`. Without `strs`, the output is unchanged.
- `value` gets `{ n }` automatically (`ds.field.figure`).
- `decrease` and `increase` are set through `data-str-attr="aria-label:…"` (`ds.field.aria.decrease` and `.increase`). Each key is labelled by the row label plus its own label, so it reads "Weak Decrease" in any language.
- Each pointer takes `{ label, action, value, strs: { label }, args }`.
