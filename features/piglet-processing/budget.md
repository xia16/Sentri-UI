# piglet-processing: animal lists, information budget

Scope: the rows of the three animal lists. These are the pen list (To do / Done), End task's not-done pens and a pen's tagged piglets. They move from the classic row onto the approved Animal row, following the Farrowing room (owner 2026-10-11). The headers are kept, under Headers below.

## Inventory

- **Pen list:** the sow's tag; the pen (its card header); every job owed today, in the day's order; each job's state (due, late, piglets left); sow died; the litter size; its age in days; the last record's time and hand; jobs coming later and when; done; task ended.
- **End task:** the pen; the jobs not done; late with its day; the amount left; why it is left (weak, sick).
- **Tagged piglets:** the tag (· notch); sex; weight; when and who tagged it; kept for breeding.

## Questions

1. **Pen list:** Which litter needs me? Is anything late, or did the sow die? What do I bring to this pen? How many piglets?
2. **End task:** What is still open, and is any of it late?
3. **Tagged piglets:** Is this the piglet I mean? Is its record right? Is it kept for breeding?

## Levels

- **Act** (red, the one "!"): Late; Sow died.
- **Soon** (regular ink): the job owed today, as one figure. That is the first job in the day's order and how many more (`Castrate +2`); the job chips above the list name and count every job.
- **Settled** (grey):
  - a coming job and when (`Iron` · `In 2 days`);
  - Done, with the litter;
  - a tagged piglet's sex over its weight.
- **Context** (left, under the ID): `12 piglets · day 5` on To do rows. On Done and ended rows it is when · who, as Farrowing shows for recorded sows.
- **Cut:**
  - the whole job list in the headline, since the chips and the pen sheet carry it;
  - the Late chip under the ID, now the state word;
  - the mono meta line;
  - the last record's time on To do rows, which is history and not direction;
  - `due today` (the To do lens and End task already say it);
  - `Task ended` on every row after the end (the card above says it once);
  - the chevron beside the tagged piglet's breeding flag.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Pen list (task page) | hub | fact: `Last record 08:20 · G. Hansen` (none while a phone-clash note shows: the note is the newer fact) | Can I trust this list? | Back (new) reaches Today, as the Farrowing room's does |
| Pen sheet | hub | route: `#000245 ›` · `A03` | chip: open the sow; pen: is this the pen in front of me | Back reaches the list, which does not say which pen I opened |
| Boars and gilts, Litter weight, Record death, Set count, Fewer piglets, More actions | action | none | | Back reaches the pen sheet |
| Piglets (identified piglets) | hub for Give IDs | route: `#000238 ›` · `A02` | Whose litter am I identifying? | the pen sheet (chip) | on screen |
| Give IDs | action (page) | none | | Piglets (chip), walked in crit round 1 | one Back away |
| Move piglets, Pen log | action (pages) | none | | Back reaches the pen sheet (chip) | one Back away |
| End task, Task ended | action (page) | none | the receipt in the body says who and when | Back reaches the list |
| Round pages outside the atlas (room, litter, count, dead, edit, id, bulk, move, end) | room: hub; the rest actions | room: fact (last record); others none; their status and instructions are the body's first line | | |

Ambiguous, quieter option taken: Give IDs: `Fixing 001216` is cut, not moved (the tag field shows the number being fixed); the litter is one Back away on Piglets. The litter drawer of the round pages has no route line (that round has no sow page for a chip to open).


### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Round pages' drawers (dead, tagged, count, edit, weigh, litter weight, dose, room filter) | Clear / Reset | as before: a draft, a change or a filter | unchanged | |
| Bulk record (a page) | Clear moves to the list, beside Tick all (a page header has no corners; the footer keeps the primary) | something is ticked | unchanged | |

Known, not changed here: the round pages outside the atlas carry question titles that overrun 204px (`Which tagged piglets are missing?`, `Same body recorded twice?`, `Found outside its crate?`); they are not atlas screens, so they are listed for the feature's own pass. The simplified prototype's titles (the atlas screens) all fit.

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
