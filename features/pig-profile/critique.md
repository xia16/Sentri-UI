# pig-profile: headers, critique

Scope: the headers of this feature's surfaces (the shared Headers change, the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13)).

## Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): bodies, rows and colours stay as they are, except where a Problem below names the change (a fact moved out of a header opens the body; a screen moved by this change is brought to the legibility floors); only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- Titles that name the job; bodies, rows and footers' primaries unchanged.

## Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · Each drawer and page repeated the pig and its pen (`000267 · C1`), a count (`3 pigs`) or a stage (`Unit 7 · C1 · Gestation · 42 days`), facts the pig page shows one Back away.
- **major** · Pages kept Back in the footer and More actions kept Back beside its category tabs.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Header subtitle | Sheet `subtitle` | (none: no line) | **cut** |
| Page Back | footer / CategoryFooter Back | page header Back; CategoryFooter `backAction: false` | **fix** |

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

## Small fixes (2026-10-14): Unavailable actions in Chinese

### Problems
- **major** · `pig-profile.unavailable-actions` ZH shows the walk list, not the sheet: its first step taps `[aria-label="Select pig 000254"]`, and the Chinese page's label is `选择猪只000254`, so the step finds nothing and the screen stops on the list.

### Parts
| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| The screen's setup | atlas entry steps (`features/pig-profile/feature.json`), English aria-label | a language-free step: the row's `data-pig-select` | **fix** |

### Self-crit (small fixes, 2026-10-14)
No competing directions: each problem has one fix that changes only the named part. Final look: screens of d658bce (this block's commit adds no pixel), rendered at 390 and 360 in EN and ZH beside base 7f5b627. The gate's diff moves exactly six screens: inspection.walk-recorded ZH (再次签到 in the check-in row), pig-profile.unavailable-actions ZH (the sheet, as in EN), and the four fostering.* at 360 (the sheet now fits the screen: both choice tiles, checkboxes and the footer whole); 285 screens identical.
- Known, not fixed: at 360 the Move sheet's primary (`Move 2 · C03 → C05`, `转移1头 B10→B08`) wraps to two lines; the crop used to hide it. It is the footer component's fit, not this page's layout.
- **Better because** each screen now shows what it claims: Chinese copy in the check-in row, the sheet in ZH, and the whole Move sheet at 360.

### Self-crit, crit round 1 (2026-10-14), then Final look
Final look: screens of a2990df (this block's commit adds no pixel), every inspection and fostering screen plus pig-profile.unavailable-actions rendered at 390 and 360 in EN and ZH beside base 7f5b627. Moved: inspection.walk-recorded, inspection.finish (`7单元签到`), inspection.review-selected (the Selected sheet, as in EN) and pig-profile.unavailable-actions in ZH; the four fostering.* at 360, and fostering.piglets and fostering.result at 390 for the label. The Move primary is one line at 360 in EN (`Move 2 to C05`) and ZH (`转移1头至B08`), 56px, type unchanged; the source crate stays in the selected tile and the crate field.
- Known, not fixed: the End walk sheet's body copy (`Recorded during this walk`, the check-in note) is still English in ZH.
- **Better because** the Move sheet fits 360 with a one-line primary that says verb, count and place, and every Inspection sheet named opens and speaks Chinese in ZH.
- Final look after the merge of main (851dcba, docs and gate only): the screens of 3b81324, rendered by the gate at 390 and 360 in EN and ZH against base 851dcba, mechanical pass; only SCOPE moved (health-record.care-states en-360, 0.03%, renders differently twice on base: noise). This line's commit adds no pixel.

# Header corners (2026-10-14)

Scope: the sheet header's corner actions and title room, by the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Baselines: `origin/main` at `39637ff`, shot with `node scripts/shoot-screens.mjs` at 390 and 360, EN and ZH; titles measured at a true 360 (the phone width forced after load, so a bare page pinned to 390 cannot hide an overflow).

### Keep

- Every title that already fits names its job (`Record dead`, `Edit record`, `Filter sows`, `Move piglets`): unchanged, still the heaviest thing in the header.
- Clear and Reset keep their one meaning (`ux/laws/strings.json`), their quiet text register, their words and their presence rule (only while there is something to clear or reset).
- Bodies, rows, footers' Back and primary, the hairline and the 24px to the body: untouched.

### Problems

- **major** · `Measurements & condition` (247px) overruns the title room at 360 (204px): it would collide with a corner and is one of the board's named cases.

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| `Measurements & condition` title | sheet() title | Sheet title | **fix** (copy) |

### Self-crit

The ruling fixes the design (the boards `evidence/2026-10-14-header-corners.png` and `-header-room.png`, direction C): no competing directions. Each screen is held against its baseline and the Farrowing room.

#### Round 1 (renders at 390 and 360, EN and ZH, beside `39637ff`)
- Clear / Reset sit at the top right, 48px targets (Clear 52px, 清除 48px), vertically centred on the title block: measured 0px off its centre on every changed drawer, with and without a header line (`Farrowing record` + route line: the corner sits between the two lines, as board C).
- The footer is Back and the primary alone: the primary gains the width the quiet word took.
- Squint: the title, then the first card; the corner word is quiet and does not compete with the title.
- Cluttered, flat or bulky against the original: less in the footer, nothing added to the body; the header gains one quiet word only while there is something to clear.
- **Better because** the destructive-but-safe act (empty the draft) leaves the thumb zone beside the commit, and every drawer clears and resets in one place.


# Header gaps (2026-10-14)

Scope: the header-to-body gap (Headers law: `space-section`, 24px, the header's), flagged on `origin/main` by the header check (`scripts/check-headers.mjs`, workflow/header-checks). Layout only: nothing in the body changes but where it starts.

### Keep

- The bodies themselves (the log filter, the treatment form, the walk receipt): unchanged.

### Problems

- **minor** · Pig log (a page): the log filter bar's 10px top padding stacked on the page header's 24px (34px).

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Log filter bar under a page header | `.sheet-filterbar` padding | Sheet page header | **fix** |

### Self-crit

#### Round 1
- The header check now reads 24px on these screens (0 defects at the candidate); the body rises by the stacked padding and nothing else moves.
- **Better because** the gap under every header is the header's alone, as on every other page.

#### Final look (61bc01e, pushed head; renders at 390 and 360, EN and ZH, beside 39637ff; the gate's pairs at 4571e5e)
- Reach: 19 screens moved (gate, base 39637ff), all in this change's scope (farrowing, inspection, pig-list, pig-profile, health-record, environment, fostering); `assistant.up-to-date` is the gate's known flaky screen. 272 identical, none broken.
- Problems fixed: Clear and Reset sit at the top right, 0px off the title block's centre (with and without a line), present only while there is something to clear; the footers are Back and the primary; every drawer title fits 204px and every page title 216px at a true 360 (header check: 0 defects on the changed screens); the 24px under each header is the header's alone.
- Keep as strong: titles that fit, bodies, rows and primaries unchanged; Filter sows and Filter pigs at their defaults now show no Reset.
- Squint: the title, then the first card; the corner word stays quiet.
- **Better because** the act that empties a draft leaves the thumb's commit zone, every drawer clears in the same place, and no title can collide with a corner at 360.

#### Crit round 1 (driver, on 50e04b7)
- Reason: `Measure & condition` is not a name (a verb mashed with a noun). Fixed: the sheet is `Measurements` (137px), a noun phrase for what it holds; recorded in `budget.md`. The other rewrites were checked against the same test: `Report fault`, `Allocate piglets`, `Correct piglet count`, `Record piglet deaths` name a task as every task title here does (`Record dead`); `Feed adjustment` and `Feeding exception` are nouns. Nothing else changed.
