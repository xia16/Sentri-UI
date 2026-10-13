# feed-plan: headers, information budget

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
| Pen feeding (from the walk's pen row) | about one pen | fact: `Pen C1` | Which pen am I adjusting? (the title does not say) | the walk list, which does not say which pen I opened | on screen |
| Adjust feed, End date and note | action | none | | the pens or pigs are listed on the editor | on screen |

