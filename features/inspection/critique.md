# inspection: headers, critique

Scope: the headers of this feature's surfaces (the shared Headers change, the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13)).

## Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): bodies, rows and colours stay as they are, except where a Problem below names the change (a fact moved out of a header opens the body; a screen moved by this change is brought to the legibility floors); only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- The walk's last check-in line: kept as the page header's fact.
- The lens, filter and list: unchanged.

## Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · The walk header held a primary button (End walk) and the unit under the title; the Log link sat in the activity row.
- **major** · Every drawer and page repeated a count, pens or the unit (`2 pigs · C1 / C2`, `Pen C1 · Unit 7`).

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Walk header | page-built `task-header` + `inspection-page-title` | page header (TaskHeader) with its line | **fix** |
| End walk, Log | in the header / activity row | the body's first row, with the unit | **fix** |
| Selected: Clear | Sheet `aside` | footer `quiet` | **fix** |
| Filter pigs: Clear | FilterSheet head | FilterSheet footer | **fix** |

## Self-crit

The law and its boards fix the design (two headers, the line's three tests); there are no competing directions, so each screen is judged against its baseline and the Farrowing room. Rounds and the final look are below.

#### Round 1 (efbef80, renders at 390 EN beside origin/main)
- Scan ear tags: the Scanning pill, moved into the body, still sat at the right edge (its old head rule): fixed to start the body (9a7b72e).
- Page CSS: lines that only lost a dead header rule read as new visual CSS to the gate; restored as they were (9a7b72e).
- Everything else matched the boards: the room keeps "Last record" under the title and 24px to the cards; the record drawer reads "Farrowing record" over its chip and facts.

#### Final look of round 0 (9a7b72e, superseded below; the gate's pairs at 390 and 360, EN and ZH, base bea53d3)
- Reach: 165 screens moved, all in this change's 16 features; 126 identical; none broken.
- Problems fixed: nothing acts in a header (Clear and Reset in footers, Scanning and End walk in bodies); one line at most, only on the hubs the budgets name; every page has Back top left and no footer Back; the 24px is the header's on every surface.
- Keep as strong: titles, bodies, rows and primaries unchanged; the room still looks like itself.
- Squint: the room, the title, the summary card, the lens; a drawer, its title, then its first card (the chip is quiet).
- Against the original: less, not flatter: one muted line where there were two, no text action beside a title.
- **Better because** each header now says one thing, the same way everywhere, and the 360 Chinese lines fit on one line.
- Known gaps: the pig page lost its pen and unit line (one Back away); Inspection's End walk and Log now sit in the body row with the unit; Home pages lost their PREVIEW badges.

#### Crit round 1 (driver), then a final look (75e92ea, superseded below; the gate's pairs at 390 and 360, EN and ZH, base af23efc)
- The Back test walked on the real chain: the pig page carries her identity facts; More actions (one pig), Measurements & condition, a finding, Production stats, Feed plan, Piglets and farrowing's Piglet processing carry the route; Pen feeding names its pen. Every surface about one animal now shows it on screen or one Back away.
- Facts a header cut moved into bodies, never dropped: sow died (tag, pen, time), the receipt's closure stamp, Scan actions' count, Scanning / Stopped.
- Floors: the Assistant, Environment and Maintenance pages stay unmoved until their bodies reach the floors; Saved work and Find a pig are brought to them. Legibility and spacing pass on every moved screen.
- Reach: 153 screens moved, all in this change's features; 138 identical; none broken.
- **Better because** each header says one thing the same way everywhere, and no fact the worker needs was lost: it is in the header line or the body's first line.

#### Crit round 2 (judges on a39e84f), then Final look (the pushed head of ds/headers-build, the commit that adds this block; its screens are 8119836's, which the gate rendered at 390 and 360 in EN and ZH against base 515872e: mechanical pass)
- What left a header is designed into the body, not dropped: the Inspection walk takes the unit as its header line and keeps its check-in row (Last check-in · Log · End walk, quiet text actions, no second dark fill); farrowing's moved facts (sow died, the finished stamp, the receipt's closure, Scan actions' count) open their body as the quiet group label over their card.
- Restored: the sow-died banner's red wash and 17px margin in the record drawer; the finished record's stamp; 18px under More actions' Pigs / Pens tabs.
- The 24px under every header is the component's (the body's first element brings no top margin).
- Footers: fostering's primary stays on one line at 56px in Chinese at 390; Find a pig's primary is "Search".
- Reach: 153 screens move, all in this change's features; 138 identical; none broken. npm test 674 pass; legibility and spacing pass on every moved screen; farrowing scenarios 87 of 87 in EN (ZH blocked on main as well).
- **Better because** each header says one thing the same way everywhere, and every fact it no longer carries has a designed place in the body.

## Small fixes (2026-10-14): Check in again in Chinese

Scope: one label in the walk's check-in row; everything else in Keep above stands.

### Keep
- The check-in row (Last check-in · Log · End walk / Check in again, quiet text actions): its place, register and order stay.

### Problems
- **major** · After a check-in the row's action reads `Check in again` in English on the Chinese screen (`inspection.walk-recorded` ZH, the gate's judges on PR #150): the label was never registered in `ux/laws/strings.json`, while `End walk` in the same slot is (copy law: every label in both languages).

### Parts
| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Check in again | Button (text register), `ux/system/inspection-astra-concept.js`, English only | Button + the strings registry (a verb with one meaning, and its feed copy) | **fix** |

### Self-crit (small fixes, 2026-10-14)
No competing directions: each problem has one fix that changes only the named part. Final look: screens of d658bce (this block's commit adds no pixel), rendered at 390 and 360 in EN and ZH beside base 7f5b627. The gate's diff moves exactly six screens: inspection.walk-recorded ZH (再次签到 in the check-in row), pig-profile.unavailable-actions ZH (the sheet, as in EN), and the four fostering.* at 360 (the sheet now fits the screen: both choice tiles, checkboxes and the footer whole); 285 screens identical.
- Known, not fixed: at 360 the Move sheet's primary (`Move 2 · C03 → C05`, `转移1头 B10→B08`) wraps to two lines; the crop used to hide it. It is the footer component's fit, not this page's layout.
- **Better because** each screen now shows what it claims: Chinese copy in the check-in row, the sheet in ZH, and the whole Move sheet at 360.

## Crit round 1 (driver, c65d58b): the same faults next door

### Problems
- **major** · `inspection.review-selected` ZH stops on the list: its tap step is `[aria-label="Select pig 000254"]`, which the Chinese page labels `选择猪只000254`.
- **major** · The End walk sheet's primary `Check in to Unit 7` stays English on the Chinese screen (`inspection.finish` ZH): not in `ux/laws/strings.json`.

### Parts
| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| review-selected setup | atlas steps (`features/inspection/feature.json`) | the row's `data-pig-select` | **fix** |
| Check in to Unit 7 | footer primary, English only | Button + strings registry (verb `Check in`, feed copy) | **fix** |

### Self-crit, crit round 1 (2026-10-14), then Final look
Final look: screens of a2990df (this block's commit adds no pixel), every inspection and fostering screen plus pig-profile.unavailable-actions rendered at 390 and 360 in EN and ZH beside base 7f5b627. Moved: inspection.walk-recorded, inspection.finish (`7单元签到`), inspection.review-selected (the Selected sheet, as in EN) and pig-profile.unavailable-actions in ZH; the four fostering.* at 360, and fostering.piglets and fostering.result at 390 for the label. The Move primary is one line at 360 in EN (`Move 2 to C05`) and ZH (`转移1头至B08`), 56px, type unchanged; the source crate stays in the selected tile and the crate field.
- Known, not fixed: the End walk sheet's body copy (`Recorded during this walk`, the check-in note) is still English in ZH.
- **Better because** the Move sheet fits 360 with a one-line primary that says verb, count and place, and every Inspection sheet named opens and speaks Chinese in ZH.
- Final look after the merge of main (851dcba, docs and gate only): the screens of 3b81324, rendered by the gate at 390 and 360 in EN and ZH against base 851dcba, mechanical pass; only SCOPE moved (health-record.care-states en-360, 0.03%, renders differently twice on base: noise). This line's commit adds no pixel.
