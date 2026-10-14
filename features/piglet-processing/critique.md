# piglet-processing: headers, critique

Scope: the headers of this feature's surfaces (the shared Headers change, the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13)).

## Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): bodies, rows and colours stay as they are, except where a Problem below names the change (a fact moved out of a header opens the body; a screen moved by this change is brought to the legibility floors); only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- The pen list's last-record line: kept as the task page's header line.
- The pen sheet as the hub of a pen: it keeps the sow's identity, now as the chip.
- (Back keeps the draft, 2026-10-14) Every drawer's first frame: Record death, Give IDs, Litter weight, Set count, Move piglets, Boars and gilts and a ticked item's count open exactly as on main (no Clear until something is entered).

## Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · The pen list had no Back (law: every top page of a task has Back).
- **major** · The pen sheet's title was the sow's tag and its subtitle `B05 · parity 3 · 11 piglets · day 1`: counts and a day in a header, two lines at 360 in Chinese.
- **major** · Every action drawer repeated `A03 · day 4` or `A03 · 12 alive`; pages (Piglets, Give IDs, Move piglets, Pen log, End task) had Back in the footer and a subtitle.
- **major** · (Back keeps the draft, 2026-10-14) Back lost the draft (drawer convention; RULINGS exit grammar: "`Back` (and swipe) keeps the draft on the device, `Clear` discards it"; scenario tree T-23, C-15, X-5; gate judges on #150): Record death, Give IDs (and a piglet's correction), Litter weight, Set count, Move piglets, Boars and gilts and a ticked item's count each reopened blank; none had a Clear. Evidence: `features/piglet-processing/scenarios.json` leaves `pp-dd3`, `pp-dg3`, `pp-dw3`, `pp-dc3` fail on origin/main.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Pen list header | TaskHeader without Back + TaskLatest in the scroller | TaskHeader with Back and its line | **fix** |
| Pen sheet header | Sheet head, tag as title, subtitle | Sheet header, `Piglet processing` + route line | **fix** |
| Page Back | footer Back | page header Back | **fix** |
| shell-ui `litterHeader` (hand-built `utility-header`) | page-built, no caller | (none needed) | **cut** |
| Staged drawers' draft (Record death, Give IDs, Litter weight, Set count, Move piglets, Boars and gilts, item count) | page-built: `V.death`, `V.give`, … reset on every open | the drawer convention's draft, parked per pen and drawer | **fix** |
| Clear on those drawers | absent | Sheet footer `quiet` (`st-footer-quiet`), only while something is entered | **fix** |

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

#### Back keeps the draft (behaviour/back-keeps-draft, 2026-10-14)
- One direction only: the law and the exit grammar fix the behaviour, and the first frames do not change.
- Problem fixed: each staged drawer parks what was entered per pen and drawer on every way out (Back, scrim, the phone's Back) and picks it up on the next open; Save drops it; Clear puts the drawer back as it opened and goes. An untouched tag suggestion follows the strip; the last piglet's Undo line is not carried into a reopened draft.
- Keep as strong: every first frame is the baseline's; Clear is the footer's existing quiet action, left of the primary.
- Not changed, filed for the owner: the pen sheet's ticked items (its atlas note says "Back drops unsaved ticks", the drawer convention says ticks wait as a draft).
- **Better because** a worker who steps back mid-entry (to check the pen, or after a call) finds the deaths, the tag and the sex they entered, as Farrowing's Record dead already does.

#### Final look (the pushed head of behaviour/back-keeps-draft, the commit that adds this block; code as of 89f58f3, main merged at 3854322)
- First frames: Record death, Give IDs, Litter weight, the pen list and the scope's other screens rendered at 390 and 360, EN and ZH, beside origin/main: byte-identical.
- The reopened drawers (scenario evidence in `review/scenarios/piglet-processing/`): Record death reads Back · Clear · Record 2 deaths with Crushed at 2; Give IDs keeps Gilt picked; after Clear the commit waits again.
- Scenarios: 27 of 27 pass in EN and ZH at 360 and 390 (89f58f3); on origin/main 20 of 27 fail (the leaves that pass there are "opens without Clear" and "Back records nothing").
- **Better because** a worker who steps back mid-entry finds the deaths, the tag and the sex they entered, and only Clear or Save ends it.
