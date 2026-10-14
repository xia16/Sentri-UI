# fostering: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The crate or sow, alive count, age in days, unit.

## Questions

1. What am I doing? (the title) 2. From which litter? (the body's From tiles) 

## Levels

- No header line: an action launched from a hub one Back away.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Move piglets (from the litter) | action | none | | Back reaches the hub, which shows the subject |

Chains walked on the real Back path after this change (crit round 1): no surface here writes to or is about one animal without showing it on screen or one Back away (Move piglets comes back to the litter drawer, titled with its crate); no line changed.

Crit round 2: the footer keeps its primary on one line at 56px in Chinese at 390: the quiet Clear takes 4px less each side, and the zh label drops two spaces and a separator (`转移{n}头 {from}→{to}`). At 360 the fostering screens overflow sideways on main as well (not this change).

## The Move primary (2026-10-14, crit round 1)

| Fact | Level | Question it answers | Change |
|---|---|---|---|
| Verb and count (`Move 2`) | Act now (the primary) | What will Save record? | kept |
| The receiving crate (`to C05`) | Act now | Where do they go? | kept |
| The source crate (`C03 →`) | | Where from? (the selected tile and the crate field above say it) | **cut** from the label |

### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Move piglets | Clear | a draft (or an explaining link) exists | unchanged `Move piglets` · `转移仔猪` | 118px · 78px |

At a true 360 the footer's primary now has the whole width beside Back (the quiet Clear took it before).

---

# Disabled is not faded (shared change, ds/disabled-not-faded), information budget

Scope: the facts a disabled or waiting control displays. The change adds and cuts no fact; it changes how loud each one is.

## Inventory

- The control's label (the verb: `Save setting`, `Record deaths`, `Finish farrowing`).
- The current option of a disabled segment (`Auto` of Auto / Manual).
- The other options of a disabled segment.
- The floor key's glyph (− at the floor, + at the ceiling, a digit on a full pad).
- A disabled picker's current value (`None`, the chosen names).
- That the control is unavailable now (today: faded text).

## Questions

1. What will this do once it is available? (the label, at full legibility)
2. Can I use it now? (the surface and the rim: dashed means not now)
3. What is it set to? (the current option: weight, not a raised pill)
4. Why not, and what do I do? (the host's reason line or hint; unchanged by this change)

## Levels

- **Settled**: the label, the current option and the picker value, in ink (or `ink-2` on a floor key), at the control's own size and weight.
- **Watch**: unavailability, quiet: the flat disabled surface and the 1px dashed `control-border` rim. No colour, no icon added.
- **Cut**: faded text as the signal (opacity, `disabled-ink` text).
