# Farrowing: Find a sow and Scan ear tags, information budget

## Inventory

**Find a sow, per state**
- Field: the typed text, a clear control, a scan icon, Cancel.
- Empty: the hint. Typed: matching sows with her ear tag, her pen, her unit (other units only), grouped by unit. No match: one line quoting the text.
- Could have shown and does not: her state, her parity, her pen's other sows, a count line ("N sows found"), the unit in the header, recent searches.

**Scan ear tags, per state**
- Header: back, the title, the context (Farrowing · Unit 7), the scanner state (Scanning / Stopped).
- Not connected: one message and how to fix it. Nothing scanned: one invitation. Scanned: groups with counts, one row per sow (ear tag, where she is, her state), a tick box. Footer: Stop or Resume scanning, or the selection count and Actions.
- Could have shown and does not: a "ready for the next tag" banner, a "Not found" row, scan times, battery or signal of the reader, a totals line, her born or dead counts as separate facts.

## Questions

1. Which sow is this? (Find a sow: type a part of the tag; Scan: hold the reader.)
2. Is she in my unit? (the group: "In Unit 7" or "Other units"; the place on the right.)
3. Is the reader working? (the pill, or the not-connected message.)
4. What can I do with her, or with these? (tap a row to open her; tick several, then Actions.)
5. How do I stop? (Stop scanning; the back arrow.)

## Levels

- **Act now**: the worker's own input (the field in Find a sow; the scan itself, which needs no tap). In a Scan row the one act-now fact is her overdue state, exactly as in the room (red figure, one "!").
- **Watch**: the scanner state (the pill), and the selection count once something is ticked.
- **Settled**: group counts, the context line, her place on the right in Find a sow (ink, 16px; the typed part of the tag is the only bold).
- **Audit**: nothing: no times, no names beyond the row's own context line.
- Cut list: the "N sows found" line, the unit in the search header, the "ready for the next tag" banner, the "Not found" row, the Scanner preview and Try sample tag, the old second search door inside Scan.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Room list (task page) | hub | fact: `Last record 08:41 · G.H` | Can I trust this list; who was here last? | Back reaches Today, which does not show it |
| Farrowing record (before, counting, finished, sow died) | hub | route: `#000418 ›` · `B1` · `Parity 3` (`Unit 6 · A2` when she is in another unit) | chip: open her page; pen: is this the crate in front of me; parity: what to expect of this litter (first or a later one) | Back reaches the room, which lists many sows: it is the hub |
| N piglets to allocate (sow died) | hub (her row opens it) | none; her tag, pen and the time she died label the options (`000399 · B3 · sow died Aug 25 06:20`, settled: the 13px muted group label over the card) | Which sow died, and when? (body) | Back reaches the room; she is on screen |
| Finish farrowing, Record dead, Edit record, Edit finish details, Correct born | action | none | (the record is one Back away) | Back reaches the record, which has the chip |
| Farrowing log, Death breakdown | action (read) | none | | Back reaches the record |
| More actions (her sow page's actions, shown in the drawer) | hub for her action pages | route: chip · pen (Pig profile's More actions) | Which sow will these write to? | the record (chip) | on screen |
| Piglet processing (her piglets' care and records) | hub for identity, mortality and foster | route: chip · pen | Whose piglets are these? | More actions (chip) | on screen |
| Note, reconcile, transfer, not in pig | action | none | | More actions (chip) | one Back away |
| Piglet identity, Report piglet mortality, Foster piglets (from Piglet processing) | action | none | | Piglet processing (chip), walked in crit round 1 | one Back away |
| Task overview, End task (early), Task ended, task sows lists | action (from the room's summary card) | none | the scope is in the body (Choose a unit, the outcomes) | Back reaches the room |
| Filter sows, Scan actions | action | none | Reset in the footer | Back reaches the room |
| Pen map | action | the colour key: `2 need you · 1 farrowing` (owner exception, 2026-10-14; below) | Where does anything need me, and what do the colours mean? | Back reaches the room |
| Pen page, Pen log, Pen note, Feed guidance, Report fault, Equipment fault | action | none | | Back reaches the room or the pen page |
| Scan ear tags | action (page) | none; Scanning / Stopped is the body's first line | | Back reaches the room |
| Find a sow | search page | not a title header: its pinned field is its head (owner, 2026-10-12) | | |

Moved, not cut (crit rounds 1 and 2): the task receipt's closure stamp (`Farrowing · Oct 11 · 09:41 · G.H`), Scan actions' count (`2 sows`), the allocation's sow-died line and the finished record's stamp (`Finished Aug 27 at 08:12 by G.H`, Audit) each open their body as the quiet group label (13px muted, 8px over their card); Scan's Scanning / Stopped is the body's first line.

Chains walked (crit round 1): the room, the record drawer, the logs and the pen pages read as before; More actions and Piglet processing now carry the route, so every action page about her is one Back from her chip.

# Farrowing: Pen map, information budget (2026-10-14)

Built on the shared PenMap component. Owner design, chosen over mockup rounds on 2026-10-13 and 2026-10-14.

## Inventory

Every fact the map could show, per pen and per state:
- Header: the title, `Pen map`, and one header line, the colour key: the pens that need her and the pens farrowing now, each a count with its swatch. Owner ruling, 2026-10-14: a surface whose body is colour-coded may use its colour key as the header line (plain text, never tappable, one line at 360 in EN and ZH, the only header line). It is an exception to the three tests of the Headers law; it is named here with its question.
- The entrance band, saying which end of the map is the door.
- The map: column letters, row numbers, one tile per pen with its pen code. The tile's colour is its status.
- Peek (hold a tile): the pen code and its sow count, and for each sow her ear tag, state word and figure.
- Footer: Back; and, only when a row has more than 20 pens, the range control (`1–20`, `21–40`…).
- Could have shown and does not: a fact line in every tile (Active, Overdue, Due today, N born, No sows, No match), a sow count per tile, the ear tags, the unit name, a count of empty pens, a ring on the current pen, the current pen number on the dock's Pen map button (2026-10-17: the button is the icon and the label), an intro line ("Tap a pen to go to its pigs. Hold to peek."), a note about the layout, the filter in force.

## Questions

1. Where am I in the room, and which end is the door? (the entrance band, the letters and numbers, the map opening on the pen she came from.)
2. Which pens need me? (the amber tiles, the key's first count.)
3. Where is farrowing happening now? (the blue tiles.)
4. Which pens have sows I could go to, and which are empty? (the white tiles against the quiet empty ones.)
5. Which pen is this one, so I can tap it? (the pen code in the tile.)
6. Who is in that pen before I go? (hold: the peek.)

## Levels

| Fact | Level | Question it answers there |
|---|---|---|
| Header line, the key (`2 need you`, `2 farrowing`) | **Watch** | Where does anything need me, and what do the colours mean? Decodes the two colours and counts the pens. A count of 0 is not drawn, and with none of either the sheet has no header line. |
| Tile fill, amber | **Act now** | Which pens need me (a sow overdue, or a sow died with piglets to allocate: the animal row's `act` level). The only loud thing. |
| Tile fill, blue | **Watch** | Where is farrowing happening now (the animal row's `live` level). |
| Pen code (`B3`) | **Settled** | Which pen is this? It is the tile's only text, set in mono at 15px. |
| White tile with a line | **Settled** | Which pens have sows shown in the current tab and filter. |
| Quiet empty tile (disabled) | **Settled** | Which pens have nothing to go to. No text but the pen code. |
| `Entrance` band | **Settled** | Which end of the map is the door (pen 1 is nearest it, at the top). |
| Column letters and row numbers | **Settled** | Which lane and which row. Muted, 13px mono, on the tint. |
| Range buttons (`1–20`…) | **Watch** | Where in a long row am I, and how do I jump? Only when a row has more than 20 pens. |
| Peek: pen code and sow count (`B3 · 2 sows`) | **Settled** | Which pen is this, and how many sows does the list show in it? |
| Peek: ear tag, state word and figure (`000418 · Overdue · 2 days`) | the animal row's own levels | Who is in it, and does anyone need me? The same words and levels as the room list (`sowFacts`). |

The answer to the first question (where do I go) is the heaviest thing on the screen: the colour of the tiles. Nothing but a pen code is written inside a tile.

## Pen colours: the mapping table

The generic rule is in [PenMap](../../ux/design-system/components/PenMap/README.md#the-colour-rule-every-tasks-pen-map): a pen shows the loudest level among the sows the list shows in it. Farrowing's row levels (`sowFacts().level`) sit on the rungs so:

| Rung | Row level | Row states |
|---|---|---|
| Needs you (amber) | `act` | Overdue; Sow died with piglets to allocate |
| In progress (blue) | `live` | Active (farrowing now) |
| Has animals (white) | every other shown sow | Due today or tomorrow, Due later, Done, Aborted, outcomes, hand-reared |
| Empty / filtered out (quiet, disabled) | none | no sows in the pen, or every sow hidden by the tab or filter |

## Cut list

The fact line in every tile (and with it the second status vocabulary `penFact`: Active, Overdue, Born, Due, No match, No sows); the 2px ink ring on the current pen (the map opens scrolled to her instead); the intro and note copy; the sow count and the ear tags in a tile (the peek has them); a zero count in the legend.

## Header

The title, centred, then the colour key as the one header line, then the hairline (owner exception, 2026-10-14). The body starts with the Entrance band, 24px under the hairline.

## Record dead (2026-10-14)

Kept facts (not changed by this pass), with the question each answers: the title `Record dead` (what am I doing?); the switch `Piglets` / `The sow` (whose death?); each cause's label and count (how many of each so far, with this draft?); `+n unsaved` beside a drafted cause (what will this save add?); the sow's four causes and the banner `Saving ends farrowing · N alive stay under piglet care` (what does saving her death do?); the primary `Record N deaths` / `Record sow death` (what will the tap commit?).

Facts this pass touches:

| Fact | State | Question it answers there | Level |
|---|---|---|---|
| `Photos` (the optional row's label, camera glyph) | always, last in capture order | Can I attach a photo to this record? | Settled (quiet card) |
| `Record a death first · photos ride that record` (the hint line, the Photos component's registered `ds.c2.photos.inactive`) | no death drafted (piglets) or no cause chosen (the sow), **only after a tap on the waiting camera** (crit round 2: the floor-gray; otherwise it is the row's screen-reader description, never a standing line) | Why can't I take a photo yet? | Settled (muted hint line, shown while the tap is answered) |
| `N attached` (the row's answer) and thumbnails | after a photo | Did my photo go on this record? | Settled |

Cut: nothing new. Hiding the Photos row until a death is drafted is cut (the row waits visibly instead). Nothing is added to the header.

Crit round 2: the sow's `Details` (cause Other) keeps its fact (what else about her death?) and takes the same full-width optional row as Photos.


### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Record dead | Clear | the draft has a death or a sow cause | `Record dead` (unchanged) | 120px · — |
| Edit record, Edit finish details | Clear | a correction is pending (not while Correct born is open) | unchanged | ≤ 153px |
| Filter sows | Reset | a facet is off its default (`roomFilterCount`) | unchanged | 97px |
| Allocate piglets (sow died) | none | | **`Allocate piglets`** (was `N piglets to allocate`): the job, not its leftovers; the count is status and opens the body's first line, `7 piglets · 000399 · B3 · sow died Aug 25 06:20` (Act now: how many still need a home; it was the title, so the worker loses nothing). ZH `安置仔猪` (`fr.alloc.title`, was `{n}头仔猪待安置`) | 143px · 78px |
| Correct piglet count (page) | none (a page has no corners) | | **`Correct piglet count`** (was `Reconcile piglet count`, 223px > 216px beside Back): the job is to save a corrected count, as its primary says (`Save corrected count`); `reconcile` was the accountant's word for it | 202px (page title, 22px) |
| Record piglet deaths (page) | none | | **`Record piglet deaths`** (was `Report piglet mortality`, 223px): the verb every other death record uses (`Record dead`), and `deaths` is the worker's word for `mortality` | 208px (page title) |
| Every other drawer title | none | | unchanged; all measured under 204px (the header check's room: 360 − 2 × (18 + 48 + 12)) | |

The PRD's owner decision of 2026-10-10 ("the sheet becomes `N piglets to allocate`") is kept in substance: the sheet says how many, in its first body line; the scenarios' visible text for the allocation sheet now reads `Allocate piglets`, and their count facts read `N piglets ·` (the first body line).

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

## Finish farrowing and Edit finish details (2026-10-15)

Owner ruling 2026-10-15 (behaviour: Assisted is required, No preselected; litter weight stays optional). Every fact the Finish sheet displays, kept facts included, with the question it answers there.

### Inventory and questions

| Fact | State | Question it answers there | Level |
|---|---|---|---|
| Title `Finish farrowing` | always | What am I doing? | Settled (the header) |
| Born · Alive · Dead (the totals) | always | Is the count right before I lock it? | Watch (the figures lead the body) |
| Section heading `Piglet condition` (health icon) | always | What is this group of questions about? | Settled (quiet) |
| `Weak` and its count, `Deformed` and its count | always; counts start at 0 and stop at Alive | How many of the alive piglets are weak? deformed? | Act now (the stepper keys) |
| `Assisted` and `No` · `Yes` | always; No chosen on a new finish | Was this farrowing assisted? | Act now (the keys) when the answer is Yes, else Settled |
| `Litter weight` and `Optional`, the kg box | always; the box shows a dash until a weight is typed | Do I have the litter's weight to add? | Settled (quiet word, empty dash) |
| The system decimal keyboard | only while the weight field is being typed in | What weight am I typing? | Act now (while open; drawn by the phone) |
| Footer: Back, `Finish farrowing` / HOLD TO FINISH | always | How do I leave, and how do I commit? | Act now (the one dark control) |

### Cut

- **The description line `Among the 9 alive piglets · 0 if none`.** It answers nothing new: Alive is in the totals panel two lines above, the steppers start at 0 and stop at the alive count, so "0 if none" is what the stepper already shows.
- **The two boxed optional chips `+ Litter weight` and `+ Assistance`**, and everything they revealed (the system-keyboard weight field, the `Clear` link). Assisted is a required No / Yes now (no unanswered state, no Clear); the weight is a row.
- **`Optional` once, on the weight row, beside its label (13px muted).** Not twice, and not on Assisted (it is required).
- **Zeros in the weight box.** Empty is a muted dash with its unit, never `0 kg` (missing is not zero).

### Levels

Only Weak, Deformed and Assisted ask for an action, and each is one row of one 48px control in the same right column; the Finish hold is the only dark control. The weight row is quieter: the word `Optional` and a dash. Nothing the header says is repeated; the structure (a titled section, the rows in one list, the footer) is kept.

### Edit finish details

The same three rows with the same controls (the totals panel does not appear there). Kept facts and their questions are the Edit record's (what was recorded, what changes). The `was N` notes on the steppers and the changes summary behind the Save correction button are kept. For an old record whose Assisted was never recorded (null), the keys show neither chosen and the read-only facts still read `Not recorded`; history is not rewritten.

---

## Pen page (2026-10-20)

Scope: the room's pen page (`farrowing.pen`, `roomPenDetail`), moved onto the layout of its sibling, the Inspection pen page (`inspection.pen`, PR #229). Owner ruling 2026-10-19: the pen is a door; everything done to the pen as a whole happens on its page; its verbs on top. Base: origin/main 7c22bed.

### Inventory

- Title `Pen B1`; Back.
- The pen's verbs today: Feed guidance, Report equipment fault, Add / Edit pen note, Pen log (each with an explanatory second line).
- Open equipment faults: device, description, `Open · Reported 09:41 · G.H`.
- The pen note: its text, who and when.
- The pen's feed (formula, method), when recorded; no pen in the prototype has any.
- The task sows in the pen and their states (Awaiting, Farrowing, Done; sow died, aborted).
- Piglets alive and dead across the pen's sows.
- The pen log (pen events and every sow event in the pen).

### Questions

1. Which pen am I on? (the title)
2. What can I do to this pen? (its verbs)
3. Does anything here need someone? (an open fault, the note left for me)
4. How is the pen now? (who is in it and where they are; the piglets; what it eats)
5. What has happened here? (the log)

### Levels

| Fact | Level | Question it answers | Change |
|---|---|---|---|
| `Pen B1` | header | Which pen? | kept (no second line: the sow count is said once, in Now) |
| Pen verbs: Note, Feed, Fault | Act now (one grid, Row tile) | What can I do to this pen? | verbs move to the top as tiles; their explanatory second lines are cut. Only the verbs Farrowing has: no Observe, no Tick all (Farrowing's room list has no ticking) |
| Open equipment fault (device, its description) | Needs attention | Is something broken here? | kept, as a Row navigation row (as on Inspection), under `Needs attention`; the reported stamp is on the fault's record, one tap in |
| Pen note (its text, who and when) | Needs attention | What did the last person leave me? | kept, as a row after the faults in the same white group (its text in ink, who and when under it); its `Note` chip is cut (the row's note icon and the heading say it) |
| Sows (`1`, `Farrowing`; `3`, `Awaiting`; `2`, `1 done · 1 sow died`) | Now | Who is in this pen, and where are they? | new on the page (today only on the room list's rows) |
| Piglets alive (`9`, `5 dead`) | Now | How many piglets are here? | new on the page; left out when no sow in the pen has farrowed (no zeros); dead is said only when there are any |
| Feed (formula, method) | Now | What does this pen eat? | new on the page (was the second line of Feed guidance); left out when nothing is recorded |
| Pen log (`All recorded activity`) | door | What has happened here? | kept as one row at the end |

Cut: the notices' kind chips (`Equipment`, `Note`); the verb rows' second lines (`View feeding information`, `Name the device and what is wrong`, `Leave information for the next person`, `Update the note for this pen`); the fault notice's `Equipment` chip and its stamp line on the pen page (the fault row is the door to both). No `Observe` or `Tick all` tile: Farrowing has neither verb, and none is invented.
