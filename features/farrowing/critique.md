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

#### Final look (9a7b72e, pushed head; the gate's pairs at 390 and 360, EN and ZH, base bea53d3)
- Reach: 165 screens moved, all in this change's 16 features; 126 identical; none broken.
- Problems fixed: nothing acts in a header (Clear and Reset in footers, Scanning and End walk in bodies); one line at most, only on the hubs the budgets name; every page has Back top left and no footer Back; the 24px is the header's on every surface.
- Keep as strong: titles, bodies, rows and primaries unchanged; the room still looks like itself.
- Squint: the room, the title, the summary card, the lens; a drawer, its title, then its first card (the chip is quiet).
- Against the original: less, not flatter: one muted line where there were two, no text action beside a title.
- **Better because** each header now says one thing, the same way everywhere, and the 360 Chinese lines fit on one line.
- Known gaps: the pig page lost its pen and unit line (one Back away); Inspection's End walk and Log now sit in the body row with the unit; Home pages lost their PREVIEW badges.

#### Crit round 1 (driver), then Final look (75e92ea, pushed head; the gate's pairs at 390 and 360, EN and ZH, base af23efc)
- The Back test walked on the real chain: the pig page carries her identity facts; More actions (one pig), Measurements & condition, a finding, Production stats, Feed plan, Piglets and farrowing's Piglet processing carry the route; Pen feeding names its pen. Every surface about one animal now shows it on screen or one Back away.
- Facts a header cut moved into bodies, never dropped: sow died (tag, pen, time), the receipt's closure stamp, Scan actions' count, Scanning / Stopped.
- Floors: the Assistant, Environment and Maintenance pages stay unmoved until their bodies reach the floors; Saved work and Find a pig are brought to them. Legibility and spacing pass on every moved screen.
- Reach: 153 screens moved, all in this change's features; 138 identical; none broken.
- **Better because** each header says one thing the same way everywhere, and no fact the worker needs was lost: it is in the header line or the body's first line.
