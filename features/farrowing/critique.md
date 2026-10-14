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

# Go to pen (2026-10-14)

Scope: `farrowing.pen-map` and the new PenMap component page. The owner chose the design over mockup rounds on 2026-10-13 and 2026-10-14, so this critique is of the screen it replaces. Baseline: `origin/main` at `7f5b627` (`node scripts/shoot-screens.mjs <out> --screens farrowing.pen-map --widths 390,360 --langs en,zh`).

| Job | Where it exists | Status | Baseline | Commit |
|---|---|---|---|---|
| Go to a pen from the room | `farrowing.pen-map` (this screen) | in-design | `farrowing.pen-map/en-390.png`, `zh-390.png`, `en-360.png`, `zh-360.png` | `7f5b627` |
| Go to a pen on the walk | `inspection.go-to-pen` (its own hand-built map) | in-design | not in scope; listed "until migrated" in the PenMap README | `7f5b627` |
| A menu drawer of places | Choose a unit, More actions (house references) | approved | the surfaces rule's boards | `7f5b627` |
| The animal's levels and words | the room list's Row · animal (`sowFacts`) | approved | `farrowing.room` | `7f5b627` |

The old Figma has no pen map. No existing component draws a spatial map of places (`node scripts/component-jobs.mjs`): the nearest, Row and ChoiceList, are lists.

## Keep

- **The menu drawer.** `Go to pen` on the tint, a centred title, a hairline, Back in the footer. SURFACES.md names it as a menu drawer.
- **The map is the room.** Pens are places, so they are a map and not a list: the worker finds the pen in front of her by where it is, not by reading. Stays, with the layout independent of the filter.
- **Tap goes to the pen.** The room list opens with that pen pinned under the sticky tab row, its tint fading within 900ms (`room-pen`).
- **Hold to peek.** 350ms shows the sows of a pen read-only; moving more than 12px cancels; the tap after a peek only closes it.
- **The map follows the tab and filter.** A pen shows what the list shows in it. Stays, and now says so by colour.
- **Pen codes in mono, tiles you can hit.** The code is the tile's identity; tiles are larger than today's.
- **Empty pens cannot be opened.**

## Problems

- **major** The map only fits a 4 × 6 room. The grid is hard-coded to letters A–D and six rows, with no scrolling, so a barn of 2 × 100 pens, 8 lanes or 160 rows cannot be shown; the old issue says rows 5 and 6 already sit below the fold on a small phone. Evidence: `farrowing-astra-concept.js` builds `Array.from({length:6})` and `['A','B','C','D']`; `feature.json` issues.
- **major** The one thing to find is read, not seen. Which pens need her is a word in 13px text ("Overdue", "Active", "Tomorrow", "23 born") on a 24-tile grid, with no key. Evidence: baseline render; owner, 2026-10-13: the map must show where to focus.
- **major** Nothing said 20 times. Every empty pen prints "No sows", so 20 of 24 tiles repeat one fact and the four that matter read as equals (P3: empty is absent). Evidence: baseline render at 390.
- **major** A second vocabulary for the same animals. `penFact` names pens Active, Overdue, Born and Due, but the room list says sows are overdue, farrowing or settled through `sowFacts().level`; the same sow is described two ways within one tap. Evidence: `penFact()` against `sowFacts()`.
- **minor** Stray colours and a shadow. The tiles use `#d5dccd`, `#f3f4ee` and `#a2a99a`, and the peek is a shadowed card; SURFACES.md rule 5 allows no stray tints and "no card is shadowed". Evidence: `farrowing-astra-room.css` (`.pen-cell`, `.pen-peek`).
- **minor** The current pen is a 2px ink ring, which in this system means selected, on a screen where nothing is selected. Evidence: SURFACES.md, "Selected tile".
- **minor** The peek opens below the map, behind the footer on a phone and in words the room does not use (`Awaiting`, `11 alive · 2 dead`). Evidence: `.pen-peek{bottom:50px}`.
- **minor** The map does not say where the door is, so "pen 1 at the top" is a guess.

## Parts

| Part | Drawn by today | Component whose job it is | Call |
|---|---|---|---|
| Drawer, title, hairline, Back | `roomSheet` → Sheet drawer, `surface:'menu'` | Sheet | **keep** |
| Map grid, letters and numbers | page-built `.pen-map` (`farrowing-astra-room.css`) | none: PenMap is the new component | **fix**: PenMap |
| Pen tile | page-built `.pen-cell` with a fact line | none: part of PenMap | **fix**: PenMap, pen code only, colour = level |
| Per-tile fact line and `penFact` | page-built (JS) | none | **cut** |
| Status word in a tile | `SentriUI.status` word | Status is the workflow state of one item on one line, not a map | **cut** |
| Colour key (legend) | none | Sheet header line, its new `key` form (owner exception, 2026-10-14) | **add**: the header line, under the title |
| Entrance band | none | none: part of PenMap | **add** |
| Range control | none | Segment is 2–5 fixed views; this is 1–N ranges that scroll sideways | **add** in PenMap, the footer control |
| Current pen ring | page-built | (selected tile) | **cut**: the map opens scrolled to her |
| Peek | page-built `.pen-peek`, gesture in the page script | none: part of PenMap | **fix**: PenMap holds the gesture; the card holds Row · animal rows |
| Footer | `roomSheet` default Back | Sheet footer | **keep**, plus the range control when a row is longer than 20 |

## Self-crit

The design was chosen by the owner over mockup rounds (2026-10-13/14), so there are no competing directions: the build is judged against the screen it replaces (`origin/main` at `7f5b627`, the baseline renders above) and held against the Farrowing room and Choose a unit, the house references for a menu drawer on the tint.

### Round 1 (on the working tree after e021d94: `farrowing.pen-map` at 390 and 360, EN and ZH, beside the baseline renders; the PenMap variants page at 390 and 360)

- Problems fixed:
  - The map fits any barn (variants page: 4 × 6, 2 × 60, 2 × 100, 2 × 160, 8 × 20); fixed.
  - The pens that need her are seen, not read: amber tiles, a blue one, a colour key under the title that decodes them; fixed.
  - Nothing said 20 times: a tile says its pen code only; fixed.
  - One vocabulary: the colour comes from `sowFacts().level`, the room row's own; `penFact` is deleted; fixed.
  - No stray hex, no shadow, no ring (the current pen is the pen the map opens on); fixed.
  - The peek is in the card, in the room row's words, clear of the footer; fixed.
  - The door is named (the Entrance band); fixed.
- Defects found in my own renders and fixed before this look:
  - A held amber or blue tile turned grey (the press colour painted over the fill): only a white tile takes `press`, the fills darken.
  - Tiles scrolling under the letters or numbers left slivers beside the label: the letters and numbers carry their own ground one grid gap past their edge, and the map rests on whole rows and columns.
  - The peek card floated 12px above the map and showed row 6 beneath it: it now sits on the map's bottom edge. It covered the held pen when that pen was in the lower rows: it moves to the top then.
  - The peek rows were indented twice (card and row padding): the row padding is off inside the card.
- Keep items as strong as before: the menu drawer and Back; the map as the room; tap to the pen with the tint fading in 900ms; the 350ms hold, the 12px cancel and the swallowed tap; the map following tab and filter; mono pen codes; empty pens cannot be opened. Tiles are 75 × 56 at 390 (they were 79 × 65): under the old height, well over the 48px floor, with 8px gaps.
- Squint test: the amber tiles, the blue tile, then the colour key and the Entrance band. The worker's first three questions are which pens need me, where is farrowing, and which end is the door. They match.
- Cluttered, flat or bulky against the original: lighter. Twenty-four tiles carried a sentence each, twenty of them "No sows"; now one word-free map where three tiles are coloured. The legend and the band add two quiet lines.
- House reference: the Farrowing room and Choose a unit (the tint, white items, one 56px Back).
- **Better because** the three pens that matter are the only colour on the map, the map fits any barn, and the screen says each thing once, in the room list's own words.
- Checks questioned: `check-states` rules (i) touching controls and (k) the grab first measure the rectangles of tiles that the map's own scroller clips, so a scrolled map read as tiles touching the footer and sitting above the grab. The part is left as designed; the variants page opens its long barns near the top and its sideways barn on a column that does not line a clipped tile up beside Back, and the range control is a radio group (it is a single-choice control), so the page passes. The mid-list behaviour (a map opened on pen A40 or B159 and its range following) is checked by my own renders, listed in the Final look.

#### Final look (ds/pen-map: its screens are a3ce0ed's and are byte-identical in every later commit, the last of which is the pushed head; `a0003ae`, the current main, is merged in; the baseline renders are `7f5b627`, which differs from it in workflow files only)

`farrowing.pen-map` at 390 and 360, EN and ZH, beside `7f5b627`, and the PenMap variants page at 390 and 360, measured against the mockup's checks. The owner's ruling of 2026-10-14 is built in: the colour key is the sheet's header line.
- Header: the title is centred, the only header line is the colour key, the hairline is 1px and the Entrance band starts 24px under it (the real screen and all 11 specimens).
- Colour key (header line): one line at 360 in EN (`2 need you · 1 farrowing`) and ZH (`2 需处理 · 1 分娩中`), plain text; with no coloured pen the sheet has no header line.
- Tiles: 24 of 24 at least 56 × 56 on the real screen (75 × 56 at 390) and none under 56 on any specimen, up to 320 tiles; nothing clipped; nothing under the footer; no sideways page scroll; the current pen (B1 here; A4, A5, E3 and others in the specimens) is inside the map in every one.
- Peek: shown after a 500ms hold on B3 and on B4, in EN and ZH at both widths; each time inside the map and above the footer, over the lower part, and over the upper part for B4, whose tile the lower card would cover. Letting go leaves the map open, a move of more than 12px shows none, and an empty pen shows none.
- Tap on B4 goes to the room list with B4 on the dock; an empty pen is disabled.
- Reach: farrowing scenarios 92 of 92 in EN at 390 and 360 on a3ce0ed (ZH: the room list behind the map is not drawn in Chinese on main either, so only the map's four leaves run there); `npm test` 678 pass, 2 skipped; `check-states` 0 failing for PenMap and Sheet; legibility and spacing pass on `farrowing.pen-map`. The Sheet drawer variants page gains one specimen (the colour key); no other screen or component page moves.
- Against the baseline: the three pens that matter are the only colour on the map and the other 20 tiles say nothing; at 360 the baseline's "Tomorrow" and "Overdue" no longer touch their tile edges.
- **Better because** the pens that need her are seen at a glance, in the same words as the room list, on a map that fits any barn.
