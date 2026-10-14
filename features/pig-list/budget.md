# pig-list: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The pig's tag, pen, unit, stage, days in stage, batch, counts of selected pigs, the finding's kind.

## Questions

1. What am I recording? (the title) 2. Is it the right pig? (the pig page, one Back away) 3. Can I save? (the primary)

## Levels

- The pig page carries her identity facts; the hubs her forms come back to carry the route (chip, pen); everything else is one Back away from one of them (see the table: chains walked in crit round 1).

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`). The default is no line. Crit round 1 (driver): the Back test is walked on the real chain, after this change. A surface that writes to or is about one pig shows her on screen or exactly one Back away; otherwise the screen it comes back to carries the route.

| Surface | Hub or action | Header line | The worker's question it answers there | Back reaches (after this change) | Subject on screen or one Back away? |
|---|---|---|---|---|---|
| Pig page (her own page; title is her tag) | hub | identity facts: `Unit 7 · C1 · Gestation` (where she is, what she is; days in stage cut: a count) | Is this the pig in front of me, and what work applies to her? | the walk list, or where she was opened from | on screen (title + line) |
| More actions (one pig) | hub for her record forms | route: `#000267 ›` · `C1` | Which pig will these actions write to? | her page | on screen (chip) |
| Measurements & condition (one pig) | hub for the measure forms | route: chip · pen | same | More actions (chip) | on screen |
| A finding (Fever, Arthritis…) | hub for Edit finding, treatment, Resolve | route: chip · pen | Which pig is this finding on? | her page | on screen |
| Production stats | hub for batch records | route: chip · pen | Whose batches are these? | her page | on screen |
| Feed plan (one pig) | hub for its curve and changes | route: chip · pen | Whose feed plan? | her page | on screen |
| Record health, treatment, note, task outcome, abortion, not in pig, batch membership, transfer, care instructions, resolve conditions | action | none | | More actions (chip) or her page (line) | one Back away |
| Record weight, temperature, backfat, body condition | action | none | | Measurements & condition (chip) | one Back away |
| Edit finding, Resolve or remove | action | none | | the finding (chip); her page shows behind it | one Back away |
| Batch record | action (read) | none | | Production stats (chip) | one Back away |
| General details, Origin, Pig log | action (read) | none | | her page (line) | one Back away |
| Medicine and condition pickers | step of a form (chooses from a catalogue, not about the pig) | none | | the form, then More actions | two Back away: the picker is about the catalogue, not the pig |
| Several pigs (More actions, bulk records) | action | none | | the walk with the pigs ticked; bulk pages list them | on screen |


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
