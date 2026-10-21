# find-pig: headers, critique

Scope: the headers of this feature's surfaces (the shared Headers change, the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13)).

## Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): bodies, rows and colours stay as they are, except where a Problem below names the change (a fact moved out of a header opens the body; a screen moved by this change is brought to the legibility floors); only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- Home's own header (farm, section chooser, Assistant door) is the app's home, not a page or sheet header: unchanged.

## Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · Pages (Your sections, Toolbox, Records, Environment, Maintenance, Assistant, a finding, a task page) used a page-built `page-head` with a subtitle (the farm, the unit, a description) and, on two, Back in the footer.
- **minor** · Drawers (Choose a unit, Report issue, Issue detail, Saved work, Find a pig, Scan) had a left-aligned title; Choose a unit repeated the section.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Page header | page-built `page-head` | SentriUI.pageHeader | **fix** |
| PREVIEW badge in the header | page-built | (prototype chrome, not product) | **cut** |

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

# Find a pig and Scan ear tags (2026-10-20)

Scope: Home's scan drawer (bottom bar) and Find a pig or pen drawer (Toolbox), and their results drawer. They now open the design system's Lookup pages, as Farrowing and Inspection do.

## Keep

- The two entrances: Scan in the middle of the bottom bar, Find a pig or pen in Toolbox.
- Search by part of a tag or a pen.
- One Back returns to where the worker came from.

## Problems

- **major** · Scan was a form: a typed tag and "Find sample pig" (owner 2026-10-12: the reader always listens, each scan adds the pig to a list).
- **major** · Search needed a whole tag or pen code and a Search button, then opened a second drawer of results.
- **major** · A result opened a task in its unit, not the pig (owner, 2026-10-20: from Home a pig opens her pig record).
- **minor** · The result row was a title "000320 · Pen A1" with a task and batch line, not the animal row.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Scan drawer | page-built (`home-astra-prototype.js` scan()) | Lookup (scan) | **fix** |
| Find drawer and results drawer | page-built form and Row list | Lookup (find) | **fix** |
| A pig's record | none (a task opened) | the Inspection pig record, embedded | **fix** |
| Bulk Actions | none | More actions' verb grid (Row tile) | **new** |

## Self-crit

#### Final look (the pushed head of claude/adoring-antonelli-34e06a; its screens are b61dca2's, which the gate rendered at 390 and 360 against main 6f747c0: mechanical pass)
- Problems fixed: scan collects pigs hands-free; Find follows typing on one page; a pig opens her record; rows are the animal row.
- Keep as strong: both entrances unchanged; Back returns to Home or Toolbox in one tap.
- Squint: Find, the field, then the first card; Scan, the title, the rows, the footer's one act.
- **Better because** Home's Scan and Find are the same pages the worker uses in Farrowing and Inspection, and a pig opens the pig.
- Known gap: the four bulk actions open nothing yet from Home (a notice says so).
