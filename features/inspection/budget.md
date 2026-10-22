# inspection: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The task, the last check-in (time, hand), the unit, counts of pigs and pens, pen codes, the walk's recorder.

## Questions

1. Which unit am I walking? (the body's first row) 2. Can I trust the list (last check-in)? 3. What needs me? (the lens)

## Levels

- Header line: the unit, the walk's subject (settled). The last check-in is the body's first row, with Log and End walk as quiet text actions: the activity row the walk already had, now holding its two walk actions, with no second dark fill. Counts, pens and the unit are cut from every drawer: the selection bar and the list say them.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Walk (task page) | hub | fact: `Unit 7`, the walk's subject | Which unit am I walking? (the first question; the unit card is not on this page) | Back reaches Today, which spans units |
| Walk, the row under the header | body | `Last check-in 06:40 · G. Hansen`, then Log and End walk as quiet text actions (crit round 2) | Can I trust this list (who checked in last)? Where do I read or end this walk? | |
| Pen sheet (title `Pen C1`), Pen log, Pen note, Filter pigs, Go to pen, Find or scan, Selected, This walk, End walk, Walk recorded | action | none | | Back reaches the walk, or the pen sheet that names the pen |
| More actions for one pig, and the pig's surfaces | see `features/pig-profile/budget.md` | route on the hubs her forms come back to | | walked on the real chain (crit round 1) |

Crit round 2: the first design (unit as a grey label beside Log and a dark End walk in a new row) read as a stray label and a floating button; the unit is the header line and End walk is a quiet text action in the check-in row.

Chains walked on the real Back path after this change (crit round 1): no surface here writes to or is about one animal without showing it on screen or one Back away; no line changed.

## Check in again (2026-10-14)

| Fact | Level | Question it answers | Change |
|---|---|---|---|
| `Check in again` (EN) / `再次签到` (ZH), the check-in row's action once the unit is checked in | action, quiet text | Can I record another check-in for this unit? | kept; Chinese copy added, nothing else drawn |
| `Check in to Unit 7` / `7单元签到`, the End walk sheet's primary | Act now (the primary) | What does this tap record, and for which unit? | kept; Chinese copy added |

### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Filter pigs | Reset | a facet is off its default | unchanged | 89px |
| Selected | Clear | always (an empty selection closes) | unchanged | 84px |
| Report fault (choose one pen) | none | | **`Report fault`** (was `Report equipment fault`, 213px): the pen sheet's own row and Farrowing's drawer already call it a fault; `equipment` is what every fault is here | 108px |

## Pen page (2026-10-19)

Owner ruling, 2026-10-19: the pen is a door, not a tick. The pen header's `›` opens the pen page, and everything done to the pen as a whole happens there, for that one pen. Ticking pigs gives pig actions only. No multi-pen actions (`feed-plan.bulk` is already an earlier design, 2026-10-18). `Tick all` on the pen page ticks the pen's pigs for the pig Actions.

| Fact | Level | Question it answers | Change |
|---|---|---|---|
| `Pen C1`, line `3 pigs · Unit 7` | header | Which pen, how many pigs? | kept |
| Pen verbs: Note, Feed, Observe, Fault, Tick all | Act now (one grid, Row tile) | What can I do to this pen? | verbs move to the top; their explanatory second lines are cut |
| Open equipment fault (`Drinker · leaking`, its description) | Needs someone | Is something broken here? | new on this page (today one tap away, in the pen's fault list) |
| Pen note (its text, who and when) | Needs someone | What did the last person leave me? | kept as its card (same weight as on main), under the faults |
| Feed today (`7.6 kg`, the formula) | Now | What does this pen eat today? | new on the page (was the second line of Feed guidance) |
| Pigs (`3`, `2 without tags`) | Now | How many are here, tagged or not? | new on the page |
| Looked (`Huddling`) | Now | How did the pen look last? | new on the page (was the second line of How the pen looks); left out when nothing is recorded |
| Pen log | door | What has happened here? | kept as one row at the end: a preview repeated the note, which is already on the page |

Cut: the `Pen information` heading; the verb rows' second lines; the pen header's checkbox on the walk (it ticked the pen and its pigs; `Tick all` does that from the pen page). Count (`Set count`) is not a verb Inspection has today, so it is not drawn.

# Find a pig and Scan ear tags (2026-10-20)

The walk's Search and Scan ear tag open the design system's Lookup pages (owner decisions 2026-10-12 and 2026-10-20), as Farrowing's do.

## Inventory

- Find: the typed text, the hint, every unit's matches, each match's tag, pen, stage, conditions and unit, the count of matches, the no-match line.
- Scan: each pig read, her tag, stage and days in it, conditions with their care level, her pen and unit, the order of reading, the reader's state, what is ticked, the walk's Actions.

## Questions

1. Find: is this the pig whose tag I am reading? Where is she? 2. Scan: which pigs have I read? Does any of them need me? Which do I act on?

## Levels

| Fact | Find | Scan |
|---|---|---|
| Tag | settled, the typed part in ink and the rest muted | settled (mono, the row's lead) |
| Pen | settled, right ("Pen C2"): the answer to "where is she" | cut: the worker is at the pig when the reader reads her; her record (one tap) has the pen |
| Unit | the card's heading, this unit first | the card's heading |
| Stage and days | cut: not the question when looking a tag up | settled context line, as on the walk |
| Conditions | cut: shown on her record, one tap | the walk's roster tags, the most urgent first (act / watch / ongoing levels) |
| Reader state | n/a | the footer's Stop / Resume scanning, nothing else |
| Ticks | n/a | the tick box; the footer becomes "N pigs selected" and Actions |

## Cut list

- The old drawer's "7 pigs found" count and the whole unit listed before typing (a browse list is not a search).
- The header's unit line: Find covers every unit.
- "Camera scanning is not connected in this prototype" and "Try sample tag 000306": the reader always listens; the prototype's own Simulate scan sits outside the phone.
- The search field's label above the field: the placeholder names it (Lookup's field).

# Pen map (2026-10-22)

The walk's Go to pen moves onto the design system's PenMap, as Farrowing's Pen map ([its budget](../farrowing/budget.md#farrowing-pen-map-information-budget-2026-10-14)). The dock's entry is the framed Pen map button and the sheet is titled Pen map, as in Farrowing's room.

## Inventory

- Header: the title, `Pen map`, and the colour key as its one line: the pens that need the worker, with the amber swatch.
- The Entrance band, the column letters and row numbers, one tile per pen with its code; the tile's colour is its status.
- Peek (hold a tile): the pen code and its pig count, then the pen's rows as the walk draws them: ID over the stage line, condition tags; the group of pigs without tags after the struck tag.
- Footer: Back.
- Could have shown and does not: the old fact line in every cell (`2 health`, `3 pigs`, `Not in unit`, `No matches`); the intro `Tap a pen to go to its pigs. Hold to peek.`; the note `Pen layout · only pens matching this view can be opened.`; the unit name under the title; the ring on the current pen; the current pen on the dock button (`C1 / Go to pen`); the peek's feed line, `Formula change due`, the manual-feed count, `Pen note available` and the open fault; a checked mark per pen; a blue level.

## Questions

1. Where am I in the unit, and which end is the door? (the Entrance band, the letters and numbers, the map opening on the pen at the top of the walk.)
2. Which pens need me now? (the amber tiles, the key.)
3. Which pens have pigs I can go to, and which are empty or hidden by my lens or filter? (white against the quiet tiles.)
4. Which pen is this, so I can tap it? (the code.)
5. Who is in it, and what do they have, before I go? (hold: the peek.)
6. Have I been through this pen yet? Not a map question: see Checked and not checked.

## Levels

| Fact | Level | Question it answers there |
|---|---|---|
| Header line, the key (`1 needs you`, `2 need you`) | **Watch** | Where does anything need me, and what does amber mean? A count of 0 is not drawn; with none the sheet has no header line. |
| Tile fill, amber | **Act now** | Which pens hold a pig to treat or move now (the roster's red `!` tag). The only loud thing. |
| White tile with a line | **Settled** | Which pens have pigs shown under the current lens and filter. |
| Quiet tile (disabled) | **Settled** | Which pens have nothing to go to, or nothing this lens or filter shows. |
| Pen code (`C2`) | **Settled** | Which pen is this? The tile's only text. |
| `Entrance` band, letters and numbers | **Settled** | Which end is the door, which lane, which row. |
| Peek: pen code and pig count (`D4 · 16 pigs`) | **Settled** | Which pen, how many pigs. |
| Peek: the rows (`000306 · Gestation`, `! Fever`, `Appetite`) | the roster's own levels | Who is in it and does anyone need me: the same ID, stage line and tags as the walk, most urgent first. |
| Peek: `+3 more` | **Settled** | Are there more pigs than the card shows? Only past four rows (a pen of 30). |

## Pen colours: the mapping table

The rule is [PenMap's](../../ux/design-system/components/PenMap/README.md#the-colour-rule-every-tasks-pen-map): a pen shows the loudest level among the rows the walk list shows in it. The roster's tag levels (`rowConditionTags`) sit on the rungs so:

| Rung | Row level | Row states |
|---|---|---|
| Needs you (amber) | `act` | a shown pig, or the pen's group of pigs without tags, with a Treat in place or Hospital pen condition, or a reportable disease (the red `!` tag) |
| In progress (blue) | none | Inspection has no in-progress state: the map is never blue |
| Has animals (white) | every other shown row | Monitor (outlined tag), ongoing (plain name), no condition |
| Empty / filtered out (quiet, disabled) | none | no pen or no pigs there, or every pig hidden by the lens or the filter |

Pen facts that are not animals (feed, formula due, a note, an open fault) do not colour a tile: they are on the pen's header in the walk and on the pen page, one tap from the tile.

## Checked and not checked

Decision: a pen the walk has been through and one it has not take the same face. The map draws no checked state.

- What the walk can know. A pen leaves a trace only when something is recorded on it or its pigs. A pen the worker looked at and found fine leaves none. The walk is checked in as a unit (End walk, `Check in to Unit 7`), and finishing a walk does not mark pigs healthy (PRD, Rules). There is no per-pen check to show.
- Why not mark recorded pens. A tick or a dimmed face from records would call every healthy pen the worker did look at "not checked": the wrong answer on exactly the pens with nothing wrong, pushing a second walk. It would also be a second channel in a tile that the colour rule keeps to one (one pen, one colour; a tile says its code only).
- Why not blue. Blue is In progress; nothing on the walk is in progress.
- Where "where was I" is answered. The walk list is in walking order and the map opens centred on the pen at the top of the list, so the pen the worker stopped at is in view and the pens still ahead follow it. What was recorded this walk is in the walk's Log.

## Cut list

The fact line in every cell and its second vocabulary (`N health`, which also counted ongoing conditions); `Not in unit` and `No matches` (the quiet tile says both); the intro and layout notes; the unit name under the title (the walk's header has it); the current-pen ring and the pen number on the dock button; the peek's feed, formula, manual-feed, note and fault lines (the pen page has them, one tap away); a checked mark.
