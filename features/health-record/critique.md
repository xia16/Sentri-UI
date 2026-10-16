# health-record: headers, critique

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


# Header corners (2026-10-14)

Scope: the sheet header's corner actions and title room, by the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Baselines: `origin/main` at `39637ff`, shot with `node scripts/shoot-screens.mjs` at 390 and 360, EN and ZH; titles measured at a true 360 (the phone width forced after load, so a bare page pinned to 390 cannot hide an overflow).

### Keep

- Every title that already fits names its job (`Record dead`, `Edit record`, `Filter sows`, `Move piglets`): unchanged, still the heaviest thing in the header.
- Clear and Reset keep their one meaning (`ux/laws/strings.json`), their quiet text register, their words and their presence rule (only while there is something to clear or reset).
- Bodies, rows, footers' Back and primary, the hairline and the 24px to the body: untouched.

### Problems

- **major** · Clear on the Brand picker (empties the chosen brand) sat in the footer beside Back (law 2026-10-14).

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Clear on Brand | page-built `quiet()` button in the footer content | Sheet `corner` | **fix** |

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

- **minor** · Record treatment (a page): the form's 16px top padding (`single-action-sheet .bulk-controls`) stacked on the page header's 24px (40px).

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Single record form on a page | `.bulk-controls` padding (bundle.css, astra-surfaces.css) | Sheet page header (owns the 24px) | **fix**: the form keeps its side and bottom padding, no top |

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

# Drawers with levels: footer Back goes up, ✕ closes (owner ruling B, 2026-10-16)

Scope: the head and footer of the two catalogue pickers (`health-record.condition-picker`, `health-record.medicine-picker`) and the same drawers in Inspection's bulk records (the condition picker's custom-category step, Link condition's catalogue, Brand → Add a brand). Ruling: the owner's lettered board, option B (`ux/design-system/evidence/2026-10-16-drawer-levels.png`); it replaces the 2026-10-10 Sheet rule ("‹ Parent in the header, no ✕ on any sheet"). Baselines: `origin/main` at `1634cfd`, `node scripts/shoot-screens.mjs` at 390 EN.

### Keep

- The title names the level the worker is on (`Antibiotics`, `General appearance`), centred, the heaviest thing in the head: kept, now alone on its line.
- Clear at the top right (Brand, only while a brand is set): unchanged.
- The footer: Back on the left, Done · N on the right in the multi picker; its word stays "Back" (`act.back`).
- Back at the first level leaves and keeps the ticks as a draft (Done applies them): unchanged.
- No breadcrumb, search pinned at the top, one drawer height across levels: unchanged.

### Problems

- **major** · Two controls go "back" and they go to different places: "‹ Symptoms" in the head goes up a level, Back in the footer leaves the whole picker. A worker who taps Back at `General appearance` expecting to go up loses the level (owner's standing rule: Back goes up a level; ruling B, 2026-10-16).
- **major** · There is no single way to close the whole picker from a deep level other than Back, which on a level reads as "up" (ruling B).
- **minor** · "‹ Parent" adds a second line of text above the title, so the head of a level is taller than the head of the root and the title moves down when you drill in (board A against B).

### Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| "‹ Parent" in the head | Sheet `up` (`sheet-up`), fed by `pickerHead().up` or page-built `up` objects in `ux/system/inspection-astra-concept.js` `sheet()` | none (retired by ruling B) | **cut** |
| ✕ at the top left | — | Sheet `cross` (ruling C's start corner) | **fix** (add, every level of a drawer with levels) |
| Footer Back | PickerField `pickerFooter` / Sheet `sheetFooter` back, action `back` at every level | the same, given the level's Back by `pickerHead().levelBack` | **fix** (up one level below the root) |
| Title | Sheet title from `pickerHead().title` | the same | keep |
| Clear (Brand) | Sheet `corner` | the same | keep |

### Self-crit

The ruling fixes the design (board option B): no competing directions. Each screen is held against its baseline and the Farrowing room.

#### Round 1 (renders at 390 and 360, EN and ZH, beside `1634cfd`; the deeper levels shot by a scripted walk at 390)
- Problem 1 (two "backs" going to different places) fixed: below the root the footer Back carries the step action (`condition-step` / `medicine-step` with the path length to keep) and goes up one level; at Conditions / Medicines it is the leave action again. Walked in a browser: drill to General appearance, tick one, Back → Symptoms → Conditions → the form; reopen: the tick is still a draft.
- Problem 2 fixed: the ✕ at the top left (ruling C's slot, a 48px target centred on the title) closes the whole picker from the root and from General appearance / Antibiotics; the draft is kept as with Back; it is there at every level, so it never moves.
- Problem 3 fixed: the head of a level is one line, the same height as the root's; the title no longer drops when you drill in (board B).
- Keep: the title is still the heaviest thing in the head; Clear (Brand), the footer pair, search and the held height are untouched.
- Squint: the title, then the first rows, then Back / Done. The ✕ is a thin glyph, quieter than the title.
- Cluttered, flat or bulky: at the root one glyph is added (the ✕) and nothing else; at a level one line of text ("‹ Symptoms") goes. Held against the Farrowing room: a quiet head, the work in the body.
- **Better because** Back now means one thing (up a level, the owner's standing rule) and there is one visible way out from any depth, with a head that stays still between levels.

#### Final look (the pushed head of ds/drawer-levels-back-close, the commit that adds this block; its screens are 0de8652's, which the quick gate rendered at 390 and 360 in EN and ZH against base 1634cfd)
- Changed: `health-record.condition-picker`, `health-record.medicine-picker` (the ✕ at the top left of the root; nothing else moves) and the component pages ChoiceList/multi, Header/sheet, PickerField/cascade, PickerField/cascade-multi, Sheet/drawer. Every other screen in scope is the same.
- Headers, spacing and legibility on the changed screens: no new problem; check-states: no new problem.
- **Better because** Back means up a level and the ✕ is the one way out from any depth; the head no longer changes height between levels.
