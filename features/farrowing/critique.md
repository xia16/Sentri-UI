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

#### Crit round 1 (driver, on bc996b1): "the photo still looks exactly as it did, a lone half-width card, and the footer now cuts it in half"
- Photos draws its own documented face again (README `line`): full width, `Photos` with the muted `Optional`, the outlined camera at the right (dashed while it waits). The shared quiet-card restyle of OptionalRow had reached Photos; the fix is in the component (`bundle.css`, `.st-photos-camera`), so Report piglet mortality shows the same row (farrowing, in scope).
- The drawer: Record dead is held at the Sheet's outer cap (`100% - size-80`, top at 80px) instead of the long 85%. Measured on every state at 390 and 360, EN and ZH: the body no longer scrolls in Piglets (draft or not, with the hint) or The sow (with or without a cause), so the Photos row and the sow's danger banner are whole on the first frame; only thumbnails a worker adds scroll.
- Kept: the 24px under the switch, the steppers and the header, untouched.
- **Better because** the photo now reads as one optional row of the form, whole on screen, waiting visibly, and nothing sits under the footer.

#### Final look, round 2 (the pushed head of farrowing/record-dead-spacing, the commit that adds this block; its screens are c62ef74's: the gate's pairs at 390 and 360 in EN and ZH against base e9e4052, plus both modes and every state rendered at 390 and 360, EN and ZH)
- Reach: 2 screens changed, 289 same, none broken: `farrowing.death` and `farrowing.piglet-death` (the Photos row face), both farrowing.
- Piglets and The sow, with and without a draft or cause: the switch has its 24px, the Photos row (label, Optional, outlined camera) and its hint are whole above the footer, the sow's banner is whole; the body scrolls only once thumbnails are added.
- Report piglet mortality shows the same Photos row in place of the half-width card.
- **Better because** the photo reads as one optional row of the form, whole on the first frame and waiting visibly, and nothing sits under the footer.

#### Crit round 2 (judge on 3423d63: 8 pairs better, 0 worse; failed on states outside the pairs)
- **The waiting Photos row drew a standing reason line** ("Record a death first · photos ride that record") under it with no death drafted: the rejected reason-line pattern (R4). Now the floor-gray: the row stays, its camera dashed; the reason is the row's screen-reader description and shows in its hint line only while a tap is answered (4 s, scrolled into view). Done in the Photos component (an inactive row's hint is visually hidden until `guard` marks it answered), so every host gets it.
- **Two optional faces on one sheet** (The sow, cause Other: a half-width Details card over the full-width Photos row). OptionalRow now has `face:'row'`, the full-width row Photos always draws (README `line`); Details on Record dead uses it, so both optionals share one face and one track. The law's line "empty, an optional is a small quiet '+ Label' card (two sit side by side)" conflicts with Photos' own face ("the one face for optional evidence") on a sheet that holds both. Resolved: a sheet that holds Photos gives its optionals the row face (Field README); sheets without Photos (Finish's Litter weight · Assistance) keep the paired cards. To confirm with the owner as a wording change to the law.
- **The sow's banner was not whole** with cause Other. My round-1 claim ("the body no longer scrolls … The sow (with or without a cause)") was wrong: it held for Farrowing, Prolapse and Found dead only; with Other the body overflowed 3px at 390 and 23px at 360 (the judge's measure on 3423d63; 9px and 29px on mine once Details took the row face). Fixed by sizing: the drawer now sits 56px under the phone's top (just under the status bar) and Details sits 12px under the causes. Measured on every state at 390×844 and 360×800, EN and ZH: Piglets (draft, none, tap), The sow (no cause, tap, a cause, Other) all overflow 0; the banner is whole. Two states scroll by design after a worker's act: thumbnails added (29px) and Details opened for typing (34px at 390, 54px at 360), where the host scrolls the banner back into view.
- Untouched: the switch's 24px, the steppers, the header.

#### Final look, round 3 (the pushed head of farrowing/record-dead-spacing, the commit that adds this block; its screens are 7ef6a6f's: gate MECHANICAL PASS on base 57bc4c7, pairs at 390 and 360 in EN and ZH; plus every state rendered at 390×844 and 360×800, EN and ZH: Piglets draft / none / waiting tap / photo, The sow no cause / waiting tap / a cause / Other / Details open)
- Reach: 3 screens differ; `farrowing.death` and `farrowing.piglet-death` by design, `fostering.result` zh-390 by 0.0003% (render noise, also seen on round 2's run before any component change of this round).
- No standing reason line: the waiting Photos row shows only its dashed camera; a tap shows the reason in its hint line.
- One optional face: Details and Photos are the same full-width row on the rows' track.
- The sow's banner is whole in every state at both widths (body overflow 0); only added thumbnails and an opened Details scroll, and opening Details brings the banner back into view.
- **Better because** the photo is one quiet optional row that waits without explaining itself, the sow's optionals match it, and nothing sits under the footer.

#### Crit round 4 (judge on 0bbd5a0: 8 pairs better, 0 worse; failed on the drawer's height and two stale claims)
- **The drawer sat 56px from the top**, 24px past the Sheet's own 80px limit, so the 14px strip above it showed the parent's blurred "Farrowing" title and Back cut in half. It now opens at the Sheet's limit (`100% - size-80`), like every other drawer.
- **That cost the sow's banner 1px** with cause Other (the body overflowed by 1px at 390 and 360, EN and ZH). Fixed by spacing, not size: on Record dead, the banner follows Photos at the rows' own 8px step instead of the photo strip's 12px trailing margin. The banner now has 3px to spare.
- **Stale claims, corrected in the PR body:** the drawer is at 80px (not "as the task overview sheet does"). The waiting Photos row's hint shows only once the camera is tapped. It is not a standing line.
- Measured at a true 390 and 360 (the phone forced to width), 844 tall, EN and ZH: Piglets first frame, The sow, The sow with Other, and The sow with Other after a camera tap. Each opens at top 80 with body overflow 0. `farrowing.piglet-death` is unchanged.
- **A shorter phone still scrolls.** At a true 360×800 (the phone forced to 800 tall after load; the judge's measure on cb4366b), the body scrolls: Piglets by 13px (the Photos row under the footer edge), The sow with Other by 41px (the banner's second line under the footer). Main scrolls more in both (35px and 73px). Making both fit at 800 tall would need a change to the causes list or the banner, which is a design decision outside this PR. So the claim is scoped to what was measured: whole at 844 tall (the gate's frame) at 390 and 360, and less cut than main at 800 tall.
- **Better because** the drawer is the Sheet's own drawer again (no half-cut page behind it), every state is whole in the gate's frame, and a short phone hides less than on main.


# Header corners (2026-10-14)

Scope: the sheet header's corner actions and title room, by the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Baselines: `origin/main` at `39637ff`, shot with `node scripts/shoot-screens.mjs` at 390 and 360, EN and ZH; titles measured at a true 360 (the phone width forced after load, so a bare page pinned to 390 cannot hide an overflow).

### Keep

- Every title that already fits names its job (`Record dead`, `Edit record`, `Filter sows`, `Move piglets`): unchanged, still the heaviest thing in the header.
- Clear and Reset keep their one meaning (`ux/laws/strings.json`), their quiet text register, their words and their presence rule (only while there is something to clear or reset).
- Bodies, rows, footers' Back and primary, the hairline and the 24px to the body: untouched.

### Problems

- **major** · Clear (Record dead, Edit record, Edit finish details) and Reset (Filter sows) sat in the footer between Back and the primary (law 2026-10-14: they are the sheet header's corner action; the footer keeps Back and the primary).
- **major** · `7 piglets to allocate` puts a count in the title (law: no counts in a title) and is the job named by its leftovers, not the job.
- **minor** · Filter sows showed Reset with every facet at its default (law: present only when there is something to reset).
- **major** · Two page titles overrun the room beside Back at a true 360 (216px): `Reconcile piglet count` and `Report piglet mortality` (223px each; header check, workflow/header-checks).

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Clear on Record dead, Edit record, Edit finish details | sheetFooter `quiet` (via `quietClear`) | Sheet `corner` | **fix** |
| Reset on Filter sows | FilterSheet footer | FilterSheet → Sheet `corner` | **fix** |
| Allocation title | identity() title with the count | Sheet title (the job) + the body's first line (the count) | **fix** |
| `Reconcile piglet count`, `Report piglet mortality` page titles | featurePage() title | Sheet page header title | **fix** (copy) |

### Self-crit

The ruling fixes the design (the boards `evidence/2026-10-14-header-corners.png` and `-header-room.png`, direction C): no competing directions. Each screen is held against its baseline and the Farrowing room.

#### Round 1 (renders at 390 and 360, EN and ZH, beside `39637ff`)
- Clear / Reset sit at the top right, 48px targets (Clear 52px, 清除 48px), vertically centred on the title block: measured 0px off its centre on every changed drawer, with and without a header line (`Farrowing record` + route line: the corner sits between the two lines, as board C).
- The footer is Back and the primary alone: the primary gains the width the quiet word took.
- Squint: the title, then the first card; the corner word is quiet and does not compete with the title.
- Cluttered, flat or bulky against the original: less in the footer, nothing added to the body; the header gains one quiet word only while there is something to clear.
- **Better because** the destructive-but-safe act (empty the draft) leaves the thumb zone beside the commit, and every drawer clears and resets in one place.

#### Final look (61bc01e, pushed head; renders at 390 and 360, EN and ZH, beside 39637ff; the gate's pairs at 4571e5e)
- Reach: 19 screens moved (gate, base 39637ff), all in this change's scope (farrowing, inspection, pig-list, pig-profile, health-record, environment, fostering); `assistant.up-to-date` is the gate's known flaky screen. 272 identical, none broken.
- Problems fixed: Clear and Reset sit at the top right, 0px off the title block's centre (with and without a line), present only while there is something to clear; the footers are Back and the primary; every drawer title fits 204px and every page title 216px at a true 360 (header check: 0 defects on the changed screens); the 24px under each header is the header's alone.
- Keep as strong: titles that fit, bodies, rows and primaries unchanged; Filter sows and Filter pigs at their defaults now show no Reset.
- Squint: the title, then the first card; the corner word stays quiet.
- **Better because** the act that empties a draft leaves the thumb's commit zone, every drawer clears in the same place, and no title can collide with a corner at 360.

#### Final look after crit round 1 (2449cb7, origin/main merged; renders at 390 and 360, EN and ZH, beside 39637ff)
- Screens with changed titles, and fostering after the merge: `pig-profile.measurements` (`Measurements`), `environment.report-issue`, `farrowing.allocate`, `farrowing.reconcile`, `farrowing.piglet-death`, `fostering.piglets`, `fostering.result`. Header check: 0 defects (room, corner, gap, contents, wrap).
- Fostering keeps main's primary (`Move 2 to C05`, #159) beside Back; Clear stays at the top right, now at a true 360.
- **Better because** each title is a name that fits its room, and nothing else moved.

#### Final look after merging #167 (the pushed head of farrowing/record-dead-spacing, the commit that adds this block; screens of ac662ad, the merge of origin/main with the corner Clear; no design change)
- Both hold: main's header (Clear at the top right only while something is drafted or a cause is chosen; the footer is Back and the primary) and this branch's switch spacing, Photos/Details row face, floor-gray hint and drawer height.
- (Corrected in round 4: the 360×800 measures here were taken with the atlas phone still 844 tall, not a true 360×800.) Measured every state at 390×844 and 360×800, EN and ZH (Piglets draft / none / waiting tap / photo, The sow no cause / waiting tap / a cause / Other / Details open): body overflow 0 everywhere except added thumbnails (29px) and Details opened for typing (34px), which scroll by design; the Photos row and the sow's banner are whole. At 360 the narrower footer now keeps "Record sow death" on one line.
- `farrowing.death` and `farrowing.piglet-death` rendered at 390 and 360, EN and ZH: the switch's 24px, the full-width optional rows, nothing under the footer. check-headers: 0 defects on both; spacing and strict legibility pass.

---

# Disabled is not faded (shared change, ds/disabled-not-faded), critique

Scope: the disabled and waiting states of the design-system components (Button in every register, Segment, the floor-gray Stepper and Numpad keys, PickerField / ChoiceList rows, OptionalRow, the text action, the Hold button's pending and done faces) and every screen that renders one. Law: `ux/design-system/README.md`, Visual foundations → "Disabled is not faded" and States. Base: origin/main 7f5b627. The same block sits in every feature whose screens this change moves; the screens of this feature it moves are listed under Reach.

## Keep

- **The waiting Button stays present, quiet and focusable** (ADR 0002): the grey `disabled-fill` face, the ink label, no reason line above it, the screen-reader description. Only its rim changes.
- **Omission first.** Blocked verbs stay left out; nothing becomes disabled that was hidden.
- **The floor-gray keys stay `aria-disabled`, tappable, answered in the hint line** (owner, 2026-08-30): only their face changes.
- **Segment's dashed rim for an unavailable option** (already the system's word for "not available here", with Banner and the Photos camera): kept, and made the one rim of every unavailable control.
- **Labels, counts, layout, sizes and the live faces of every control**: unchanged. No new colour or token.

## Problems

- **major** · A disabled Segment option draws faded text: `Auto` / `Manual` on Environment & devices measure 2.6-2.7:1 (`check-legibility`, 3 screens: environment.page, environment.sensor-week, environment.sensor-other). The component sets no opacity of its own, so a page's base `button:disabled{opacity:.45}` (home-astra-prototype.css) fades it.
- **major** · A disabled Button draws faded text and loses its surface on the same screens: `Save setting` 2.7:1 with no fill (the page base wins over the layered `.button.primary:disabled` fill). It reads as a link, not a control.
- **major** · Trial 6's fix (opacity back to 1 on the page) made both controls look live: the selected `Auto` kept its raised white pill and `Save setting` became bare ink text (owner: "the opacity fix made controls look live"). Unavailable has to be carried by the surface and the rim, in the component.
- **major** · The tool Button's disabled and waiting face fades itself: `opacity:.45`, 2.7:1 (Button/tool variants, `ds` state probe).
- **major** · The Hold button's Pending, Loading and Done faces draw ink on red, 2.1:1 (Button/hold variants): the waiting rule's ink label also caught the phases that keep their register.
- **major** · The floor-gray glyph is `disabled-ink` on `disabled-fill`, 2.45:1 (count variant `#a0b3a5` on `#f8fbf8`, 2.1:1): below the law the brief holds it to ("their glyph still meets the law").
- **major** · A disabled PickerField trigger draws its value in `disabled-ink`, 2.6:1 (PickerField multi / cascade-multi, Disabled).
- **minor** · The disabled text action fades itself to 2.0:1 (`opacity:.5`, Button/text Disabled; and in a heading action); OptionalRow's disabled face is `opacity:.5`. No screen renders either today.
- **minor** · The waiting face's rim is `disabled-border` (1.4:1 on paper), so next to a live secondary a waiting primary reads as a grey button, not an unavailable one.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Disabled Segment option / whole segment | Segment (faded by page base CSS) | Segment | **fix**: ink text, opacity pinned; a whole unavailable segment is one dashed track on `disabled-surface`, no raised pill |
| Disabled / waiting Button (primary, secondary, danger, caution, tool) | Button (tool fades itself; native disabled faded by page base CSS) | Button | **fix**: one disabled face for every register: `disabled-fill`, dashed `control-border` rim, ink label, opacity pinned |
| Hold Pending / Done | Button (hold) | Button | **fix**: the register's own text colour (paper on red / ink) |
| Floor-gray key | Stepper, Numpad | Stepper, Numpad | **fix**: `disabled-surface`, dashed rim, `ink-2` glyph (7.4:1) |
| Disabled picker trigger / choice row | PickerField, ChoiceList | PickerField | **fix**: ink value, dashed rim on the trigger |
| Disabled text action, OptionalRow | Button (text), Field (OptionalRow) | Button, Field | **fix**: `muted` word at full opacity (4.8:1); OptionalRow on `disabled-surface` with the dashed rim |
| Disabled IconButton glyph | IconButton (`disabled-ink`) | IconButton | keep (an icon, no text; out of this brief: noted for the owner) |

## Self-crit

Held against the Farrowing room (its dock: one dark primary, Back outlined) and More actions (Back alone in the footer). Every state is shown before / after in its component's variants (Button primary, secondary, tool, text, hold; Segment four variants; Stepper count, row, well; PickerField) and on the screens below.

#### Direction A (surface only: opacity pinned, ink text, the existing solid `disabled-border` rim), renders at 390 EN on 7f5b627
- Fixed the contrast (every disabled text 4.5:1 or more) but not the look: a waiting primary is a grey button with a bold ink label, next to a live outlined Back it reads as a second live button; a floor − with an ink glyph on a near-white key reads as live. Trial 6 was rejected for exactly this. **Not better because** legible but live-looking.

#### Direction B (surface and a dashed rim, one face for every unavailable control), round 1 on 8ba7e17, round 2 on 4d59150
- Problems: Segment `Auto` / `Manual` 2.6 → 13.1:1 and the whole segment one flat dashed track with no raised pill (it can no longer pass for a live lens); `Save setting` 2.7 → 12.6:1 on a dashed grey face (was bare faded text); tool 2.7 → 12.6; hold Pending / Done 2.1 → paper on red; floor-gray glyph 2.45 → 7.4 (`ink-2`); picker value 2.6 → 13.4; text action 2.0 → 4.8. All fixed: the probe finds 0 disabled-text failures on 291 screens (was 9) and in every variant state (was 8).
- Round 2: the waiting `End task early` (farrowing task-blocked) still wore the page's red wash and red rim, a live destructive button; the component's face now outranks that page paint (4d59150).
- Keep: the waiting button stays present, quiet, alone; labels, sizes, layout and live faces unchanged; the dashed rim was already Segment's, Banner's and Photos' word for unavailable.
- Squint (a record sheet): the title, the count, then the footer; the dashed Save is quieter than the live Back beside it, as it should be. On Environment: the reading, the chart, then the fan; the dashed fan controls recede.
- Cluttered / flat / bulky: no box, weight or size added; one hairline style changes. A column of floor keys in Record death shows four dashed − keys: busier than four pale keys, but each reads as "not now" and its glyph is legible. Rejected examples (gate.md): none of c1 (nothing enlarged), c2 (no structure removed), c3 (no box or bold added).
- **Better because** every unavailable control now reads as unavailable by its face and rim while its words stay readable, the same way everywhere, and nothing looks live that is not.

#### Final look (the pushed head of ds/disabled-not-faded, the commit that adds this block; its screens are 5f0884a's, which the gate rendered at 390 and 360 in EN and ZH against base 851dcba, and shoot-screens rendered beside 7f5b627)
- Reach: 50 screens move, all of them rendering a disabled or waiting control: environment (page, sensor-week, sensor-other), farrowing 14 (before, death, leave-edit, edit, born, task-blocked, edit-finished, foster, reconcile, pen-note, pen-fault, piglet-care, piglet-identity, piglet-death), piglet-processing 13 (sheet-coming, sheet-todo, sheet-breeders, sheet-late, sheet-done, sheet-notch, adjust-count, give-ids, counts, weight, record-death, move-piglets, set-count), pregnancy.check, feed-plan (editor, end-date), pig-list.health, pig-profile 7 (production-task, miscarriage, batch-membership, measure, body-condition, note, not-in-pig), health-record 5 (record-health, condition-picker, care-instructions, resolve-conditions, treatment), fostering (type, receive, result), move.transfer-sow. 4 more differ in one shot only by under 0.04% (assistant.finding and farrowing.search-results, which the gate marks unstable on base; farrowing.search-none, piglet-processing.more-actions): identical by eye, render noise. 237 identical; none broken.
- Every moved screen: only the waiting footer button (dashed rim), a floor key (dashed, `ink-2` glyph), a disabled picker (Move's Destination pen: solid rim to dashed) or the Environment fan controls changed; layout, copy and the 360 Chinese footers are unchanged.
- **Better because** unavailable is now said by the face and the rim, never by faded words, and no waiting control looks live.

---

# Finish farrowing: one titled condition form (2026-10-15)

Scope: `farrowing.finish` and `farrowing.edit-finished` (the Finish sheet, and the "Edit finish details" form that shares its fields). Change class: behaviour (Assisted is a required No / Yes, No preselected) with an opt-in shared-component variant (ChoiceList's boxed key face, Measure's row layout). Mode: polish. Owner ruling 2026-10-15: the design is decided (option "Ink ring" of `ux/system/finish-form-rhythm.html`); there are no competing directions, so each render is judged against its baseline. Baseline: `c4f98e2` (the worktree base), `node scripts/shoot-screens.mjs <out> --screens farrowing.finish,farrowing.edit-finished --widths 390 --langs en`, plus the answered and open-field states of the old optional chips.

## Keep

- **The Born · Alive · Dead totals panel.** One look at what was counted; the first question on this sheet ("is the count right before I lock it?"). Unchanged.
- **The Weak and Deformed steppers** (Stepper `row`: label left, `− n +` right, a rule between rows, 60px). They are the sheet's real questions and each tap saves at once; their behaviour and the 144px right column are the grid the new rows follow.
- **The footer: Back and the Finish farrowing hold** (56px, HOLD TO FINISH). Unchanged.
- **Litter weight and Assisted remain facts the worker can record at finish**, and read as before on the locked record.

## Problems

- **major** The two boxed optional chips (`+ Litter weight`, `+ Assistance`) outweigh the questions above them: two filled, bordered half-width boxes under two quiet rows, the inverse of the hierarchy (Weak and Deformed are the questions; the chips are afterthoughts). Evidence: `base/farrowing.finish/en-390.png`; owner 2026-10-15 ("no boxed optional rows").
- **major** The chips reflow and swap places after an answer, so targets move under the thumb. Evidence (baseline probe at 390): Litter weight is at y 673 before Assistance is answered and at y 533 after, and widens from 172px to full width; the answered Assistance row and its radios take over the space.
- **major** The answer renders detached under the wrong chip: after tapping Litter weight the field sits below Assistance (`base-weight-open.png`); after tapping Assistance its No / Yes radios sit under the row, and a Clear. The worker reads a question and finds its answer under a different one.
- **major** The weight is a page-built `<input type="number">`: a second tap into a field opens the system keyboard, which covers Hold to finish. The design system's Measure and Numpad do this job (docked pad, no system keyboard, the same pad as piglet processing's litter weight).
- **minor** The "Piglet condition" legend (14px / 600) is bold, which the type law forbids for headings (section titles are 16px / 500 with a 16px muted icon), and its description line ("Among the 9 alive piglets · 0 if none") repeats a fact the totals panel shows two lines above (Alive 9); the steppers already stop at the alive count. P3: nothing said twice.
- **minor** Assisted has an unanswered state and a Clear for a yes / no fact. Owner 2026-10-15: a required No / Yes with No preselected; no Clear.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Born · Alive · Dead | `metrics()` (TaskTotals) | TaskTotals | **keep** |
| "Piglet condition" legend | page-built `<fieldset><legend>` (14px / 600) | Heading, kind `section` (16px / 500, 16px icon) | **fix**: Heading with the `health` icon |
| "Among the N alive piglets · 0 if none" | page-built `<p>` | none (cut) | **cut**: Alive is on screen, the steppers stop at it |
| Weak, Deformed | `farmStepper` → Stepper `row` | Stepper | **keep** |
| Assisted | `optRow` + ChoiceList inline radios (page-built reveal) | ChoiceList Inline Choice | **fix**: ChoiceList inline, boxed key face (opt-in `face:'key'`), No preselected, no Clear |
| Litter weight | `optRow` + page-built `<input type=number>` | Measure (+ Numpad) | **fix**: Measure row layout, the docked Numpad; "Optional" beside the label |
| Edit finish details form | the same fields, page-built twice (`optional()`, `finish-question`) | the same components | **fix**: one set of rows for both forms |
| Footer, hold | `footer()`, `hold()` | Sheet footer, Button hold | **keep** |

## Self-crit

(Filled in below as each render is judged against `c4f98e2`.)
