# Farrowing: Find a sow and Scan ear tags, critique of the original

Scope of this change: `farrowing.search` and `farrowing.scan` (and the screens added beside them). The owner approved the replacement designs on 2026-10-12 as static mockups; this critique is of the screens they replace, baselined on `origin/main` at `dd78778` (`node scripts/shoot-screens.mjs <out> --screens farrowing.room,farrowing.search,farrowing.scan --widths 390`).

## Keep

- **The room's sow row** (ear tag over context, figure over state word). It is the approved Row · animal variant and stays the row of Scan; Find a sow keeps the same row with her place on the right.
- **Pen codes match in search**, and a result opens her farrowing drawer by her status (`room-sow`). Both stay.
- **The dock's two doors** (Scan ear tag primary, Search icon). Unchanged.
- **Live results as you type**, updated in place without reloading the page.

## Problems

- **major** Find a sow is a drawer that names one unit ("Unit 7") and lists "7 sows in this unit" before anything is typed. A worker holding a tag from another unit finds nothing. Evidence: the old note "Find a sow in this unit"; the worker's first question ("which sow is this?") fails for any sow outside the unit.
- **major** Scan ear tag opens a placeholder "Scanner preview" with "Try sample tag": the primary button leads to a non-working preview, and the working path (a typed search) is hidden below it (the old issue "Two search doors"). Evidence: old `farrowing.scan` issues.
- **major** One scan opens one sow. A worker who scans a row of crates has to start again for every tag, and cannot act on several sows at once.
- **minor** A text field at the bottom of a half-height drawer: the keyboard hides the results. Evidence: the old drawer is `medium` (76%) with the field under the title.
- **minor** The old search has no clear control and no way to Scan from it.

## Parts

| Part | Drawn by today | Component whose job it is | Call |
|---|---|---|---|
| Search drawer | `roomSheet` (Sheet drawer) | Sheet **page** is for a form or a record, not a search; a pinned field is a page-level pattern | **fix**: a full-height page |
| Search field | page-built `<label>` + input | none (a field in a sheet body is `Field`; a pinned search field has no component) | **fix**: page-built in Farrowing's CSS, to move to the design system once the shared PR lands |
| Result row | `SentriUI.row` animal | Row · animal | **keep** the component; place on the right |
| Group label | none | Heading (section) is 16px/500 ink; the approved mock is 13px/600 muted | page-built label |
| Scan preview + button | page-built `.scanner-demo` | none | **cut** |
| Scan page header | `room-appbar` pattern | IconButton + a heading | **keep** the room's header pattern |
| Scanner state pill | none | Status is workflow state, not scanner state | page-built (ink dot, no green) |
| Scan rows | none (one sow only) | Row · animal as select + door (`rowSelectDoor`) | **fix**: component |
| Empty messages | page-built | none | page-built |
| Selection bar | none | the Room dock (`.room-dock`) + Button | **fix**: the room's dock |
| Actions sheet | none | Sheet drawer + Row navigation (the existing More actions rows) | **fix**: component |
| Stop glyph | none in the registry | Icon | added once, in `farrowing-icons.js`, until the registry takes it |

## Self-crit

Built to the owner's approved mockups (`mock2.html`, `scan3.html`), so there are no competing directions; the judgement is against the original.

**Final look** (this branch, after the last commit; every state of Find a sow and Scan ear tags at 390 and 360, EN and ZH; screenshots are in the PR):
- Problems fixed: global search with grouped results (fixed); Scan is a list, always listening, with bulk Actions (fixed); one primary on Scan that leads somewhere real (fixed); a clear control and a scan icon in the search field (fixed). The field is pinned at the top of a full page, so the results sit between the field and the keyboard, not under a half drawer.
- Keep items as strong: the room row is unchanged and reused; pen codes and live results are kept.
- Squint test: Find a sow, the field and the groups; Scan, the status pill, the newest sow and the footer button. These are the worker's first three questions (what do I type or hold? which sow came up? what can I do with them?).
- Cluttered, flat or bulky against the original: lighter than the old drawer (one field and two groups against a field, a count line, and a sample-tag preview), and the scan page shows at most the list and one footer.
- **Better because** it finds a sow in any unit, takes many tags in a row, and every control leads somewhere.
- Known gap: at 360 a Scan row whose context reads "Pen B1 · 1h ago · G.H" wraps to a second line beside the tick box (the design system's animal row; not restyled on the page).

# Headers (2026-10-13)

### Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): bodies, rows and colours stay as they are, except where a Problem below names the change (a fact moved out of a header opens the body; a screen moved by this change is brought to the legibility floors); only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- The room's last-record line (`Last record 08:41 · G.H`): the one fact the next shift needs to trust the list; it stays, now under the title.
- The sow drawer's door to her page (the tag link): it becomes the subject chip, the route the law names.

### Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · The sow drawer's title was her ear tag and its subtitle mixed pen, parity, a state word and a stamp (`B1 / Parity 3 · Farrowing`, `Finished Aug 27 at 08:12 by G.H`): status and dates in a header (law), two lines at 360.
- **major** · Record dead and Edit record carried Clear in the head and the subject (`000418 · B1`) one Back from the record that shows it.
- **major** · Scan ear tags put its status pill (Scanning / Stopped) in the head and Back in the footer.
- **minor** · Room drawers repeated the unit (`Unit 7`), task pages the scope (`Farrowing · All 3 units`), the pen page a count (`1 sow · Unit 7`).

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Room header (Back, title, last record) | page-built `room-appbar` + `room-intro`, now TaskHeader | TaskHeader (page header) with its line | **fix** (extracted unchanged first) |
| Sow drawer header | Sheet head, tag link as title, `sow-context` subtitle | Sheet header with a route line | **fix** |
| Clear on Record dead / Edit | Sheet `aside` | sheetFooter `quiet` | **fix** |
| Reset on Filter sows | FilterSheet head | FilterSheet footer | **fix** |
| Scanning / Stopped pill | Sheet `aside` | first line of the body | **fix** |
| Page Back (log, scan, pen, task pages, sow-action pages) | footer `surface-back` | page header Back | **fix** |
| Find a sow's search field | page-built pinned field | (its own head, owner 2026-10-12) | **keep** |

### Self-crit

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

# Record dead: spacing and the optional photo (2026-10-14)

Scope: `farrowing.death` (the one Record dead drawer). `farrowing.death-breakdown` is a separate read view (`deathBreakdown()`), not this sheet, so it is out of scope. Owner ruling 2026-10-13, board option **B**. Baseline: `origin/main` at `7f5b627`, `farrowing.death` at 390 and 360, EN and ZH, plus its no-draft and The sow states.

## Keep

- **The Piglets / The sow switch** (Segment `view-switch`): one switch at the top of the body, the sow offered only while she is alive.
- **The six cause rows** (Stepper `row`): label left, `− n +` right, hairlines between rows, the unsaved draft in muted text beside its label. Option C (a quieter − at its floor) was not chosen: the stepper stays as it is.
- **The sow's causes** (ChoiceList radios in one card), the danger banner and the hold-to-record footer.
- **The footer**: Back, Clear only when there is something to clear, the primary naming the count.
- **The header** (title, its hairline and the 24px gap from the Headers law, #150): unchanged.

## Problems

- **major** · The first cause row reads as part of the switch. The switch ends 10px above the first `−` while the rows' keys are 22px apart; `scripts/check-spacing.mjs --changed farrowing.death` on `7f5b627`: "inversion div.st-selection is 21px from the list of 6 Stepper.st-stepper whose rows are 43px apart" and "crowding button and Stepper.st-stepper are 4px apart". Owner, 2026-10-13 (option B).
- **major** · The optional photo is hidden until a death is drafted (`death()` renders `SentriUI.photos` only when `n` or a sow cause is set), so the worker cannot see that a photo can ride the record; the spec says optional photos with the camera disabled until a death is entered, and the screen's notes said so while the screen did not (ledger L8). Owner: "the optional photo part seems weird".
- **minor** · The screen's notes describe a "Dead header" with "Dead 6", "Born dead or died" and Clear in the head, none of which the screen shows since #150 (ledger L8).

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Piglets / The sow switch | `SentriUI.segment` (`view-switch`) | Segment | **keep** the component; **fix** the space under it (page layout) |
| Divider on the switch | none today (the first row has no top rule) | | nothing to remove |
| Cause rows | `farmStepper` → Stepper `row` | Stepper | **keep** |
| Sow cause | `SentriUI.choiceRadios` | ChoiceList | **keep** |
| Photos | `SentriUI.photos`, rendered only once a death is drafted | Photos (the optional row, Field's optional-row law) | **fix**: always rendered, last in capture order; inactive until a death, its reason in the component's hint line |
| Danger banner (the sow) | `SentriUI.banner` | Banner | **keep** |
| Footer | `footer()` + Button / hold | Sheet footer | **keep** |

## Self-crit

Held against its baseline (`7f5b627`) and the house reference the Farrowing room; the owner's board fixed the direction (B), so the directions differ only in the space under the switch.

#### Round 1 (renders at 390 EN of the screen and its states: draft, no draft, a waiting tap, a photo, The sow with and without a cause)
- **Direction A** (24px under the switch, `--space-24`; Photos always rendered): the switch now reads as its own block, the first `−` is 34px under it against 22px between rows; `check-spacing` passes (inversion and crowding gone). Photos sits under Other from the start, inactive until a death, its reason in the component's hint line. At 844px the long drawer (85%) is full, so the Photos card meets the footer's edge and its hint is below it: a tap on the waiting camera did not show its answer. Fixed in the host: the guarded tap scrolls the hint line above the footer, then `SentriUI.guard` re-announces it.
- **Direction B** (16px): the first `−` 26px under the switch against 22px between rows, still close to reading as one list, and Photos is still cut by the footer. Not better than A.
- Problems: the inversion is fixed; the hidden Photos is fixed (always visible, waits visibly, answers in its hint line); the notes are rewritten to what the screen shows.
- Keep as strong: the switch, the six stepper rows (unchanged, option C not taken), the sow's causes, banner, footer and header are untouched. With a photo the row turns full width with its count and thumbnail (the Photos component's own face).
- Squint: the title, the switch, the counts (the drafted row's dark `−`); Photos is a quiet card last. These answer whose death, how many, what will save.
- Against the original: the same screen with more air under the switch and one quiet card that no longer appears from nowhere; not cluttered, not bulkier.
- Known gaps: in The sow before a cause, Photos and its hint push the danger banner's lower edge under the footer at 844 (its headline and consequence stay visible). The empty card shows the Photos component's camera glyph, not a "+": that is the component's face (shared with Report piglet mortality), not restyled on the page.
- **Better because** the first cause no longer reads as part of the switch and the worker can see from the start that a photo can ride the record, and why it waits.

#### Final look (the pushed head of farrowing/record-dead-spacing, the commit that adds this block; its screens are fed5e07's, which the gate rendered at 390 and 360 in EN and ZH against base 7f5b627)
- Reach: 4 screens changed, 287 same, none broken. `farrowing.death` moved in all four renders (10.3%); `assistant.up-to-date` (0.015%), `farrowing.search` (0.004%) and `fostering.result` (0.0003%) are render noise: the first and last pages load none of the changed files, and the death rule is scoped to `.sheet[data-view=death]`.
- The switch stands apart from the list at 390 and 360; the six rows, the footer and the header are unchanged pixel for pixel in shape.
- Photos is on screen from the start under Other, the quiet card's top edge peeking above the footer at 844 (the long drawer is full); scrolling or a tap on the waiting camera shows it whole with its hint.
- **Better because** the first cause no longer reads as part of the switch, and the optional photo is always there, waiting visibly instead of appearing from nowhere.
