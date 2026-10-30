# pig-profile: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The pig's tag, pen, unit, stage, days in stage, batch, counts of selected pigs, the finding's kind.

## Questions

1. What am I recording? (the title) 2. Is it the right pig? (the pig page, one Back away) 3. Can I save? (the primary)

## Levels

- The pig page carries her identity facts (where she is, what she is); the hubs her record forms come back to (More actions, Measurements & condition, a finding, Production stats, Feed plan) carry the route (chip, pen). Every other surface carries none: the pig is on screen or one Back away (walked on the real chain, crit round 1).

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


### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Measurements (one pig) | none | | **`Measurements`** (was `Measurements & condition`, 247px; crit round 1 rejected `Measure & condition`, a verb mashed with a noun): a noun phrase naming what the sheet holds. Every row is a reading taken off the pig: body condition (a score), weight, temperature, backfat; condition does not lead (one row of four), so it needs no place in the name. ZH `测量` when this surface is translated (the concept renders EN only). The More actions row that opens it keeps its longer label (rows have room) | 137px · 39px |

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

---

# The record: one screen of what matters (2026-10-30), information budget

Scope: the pig record (`pig-profile.full`, `.partial`, `.empty`, `.tasks`), the body below the header. Owner, 2026-10-30: "too much information for one screen". House pattern: the Inspection pen page (`inspection.pen`), the same job for a pen: what needs someone, then one **Now** panel of how it is, then the doors.

## Inventory (sow 000306, today)

Header: tag, unit, pen, stage. Conditions needing care (Fever · Treat in place · Day 2; Poor appetite · Monitor · Day 2), the pig note, ongoing conditions (Arthritis · 120 days · No action needed). Tasks: Vaccination (due today, Influenza booster, the word Health), Pregnancy check (tomorrow, 13 Sep, Batch 20, the word Production), the count "2 tasks". General details: Age 1080 days, Type Sow, Batch 20, Weight 192 kg (3 days ago), Temperature 39.5 °C (today), On farm Yes. Sow cycle: Last service, Expected farrowing, Backfat, Next task (Pregnancy check, in 1 day), Parity. Feeding: Gestation 1, Station-fed, 2.5 kg/day, View plan. Pig record: Production stats, Origin, Log, each with an explaining line.

## Questions, in order, at the pen

1. Is this her? (header)
2. What is wrong with her, and what do I do now? (conditions and their care, the note)
3. What is due for her? (tasks, today first)
4. Where is she in her cycle, and how is her body? (parity, farrowing date, service, latest readings)
5. Where do I go for more? (feed plan, production history, origin, log)

## Levels

- **Act now**: conditions needing care, the note, a task due today: unchanged, on top.
- **Coming up**: tomorrow's task.
- **Live**: the Now panel: Parity, Expected farrowing, Last service, Batch, Weight, Backfat, Temperature, Teat count (each with its reading age).
- **Audit**: the doors: Feed plan (its line is the plan and ration: content, not an explanation), Production stats, Origin, Log.

## Cut, and why

- **Next task** (Sow cycle): the task card says it. **"Batch 20" in the task line**: the Now panel says it. **The words Health and Production on the task cards**: the icon well already tells them apart, and the word read as a second door. **"2 tasks"**: the cards are the count.
- **Type**: the header line says her stage and Parity says she is a sow. **Age 1080 days, Breed**: who she is, not how she is: moved to Origin (Age as "2 yr 11 mo"). **On farm Yes**: always yes for a pig in front of you.
- **Two headings and two panels** (General details, Sow cycle) become one (Now). **The Feeding heading, panel and View plan link** become one door row. **The Pig record heading** goes: four doors in one group need no title (the pen page's log door has none).

Result at 390: the body scrolls 554px instead of 894px for 000306, and 321px instead of 762px for 000267; no fact the worker acts on is cut.

## The top of the record (2026-10-30, round 2)

Owner: the tinted banners and task cards look cluttered when a sow has problems, and the record must still look good when she has none (the usual case).

- **Questions**: Is anything wrong with her, or due for her, right now? If so, what first?
- **Act now / watch**: conditions under care, tasks due (in progress, today, overdue), the note: **one group of rows** under "Needs attention" (the pen page's section), ordered hospital → treat → task due → monitor → note. Every row has the same shape (lead · title · line · chevron); only the care mark carries colour.
- **Coming up**: the soonest task not yet due is the Now panel's **Next task** (a fact, not a card).
- **Settled**: conditions with no action needed are quiet rows at the head of the doors.
- **Nothing to do**: no group, no heading, no "all clear" line: the record opens on Now (000254 fits one screen).
- **Cut**: the tinted banner boxes, the "Current tasks" heading and its cards, the separate white card for ongoing conditions. Busy sow 000306 with a note: six boxes in three styles become one group of four rows.

