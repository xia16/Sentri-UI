# ADR 0003: The task skeleton

- **Status:** candidate, on `fix/skeleton` (from `map/3-piglet-processing`). Not approved. No task page adopts it yet; piglet processing is rebuilt on it page by page, next.
- **Map:** [Piglet processing design map, issue #3](https://github.com/xia16/Sentri-UI/issues/3). Retro entries 29–32 (`ux/tasks/piglet-processing/retro.md`).
- **Parts:** [TaskPhone](../components/TaskPhone/README.md) · [TaskHeader](../components/TaskHeader/README.md) · [TaskSummary](../components/TaskSummary/README.md) · [TaskLens](../components/TaskLens/README.md) · [TaskGroup](../components/TaskGroup/README.md) · [TaskRow](../components/TaskRow/README.md) · [TaskDock](../components/TaskDock/README.md) · [TaskSheet](../components/TaskSheet/README.md) · [TaskHold](../components/TaskHold/README.md) · [TaskTotals](../components/TaskTotals/README.md) · [TaskProgress](../components/TaskProgress/README.md) · [TaskStepper](../components/TaskStepper/README.md) · [TaskPhotos](../components/TaskPhotos/README.md) · [TaskChoice](../components/TaskChoice/README.md) · [TaskRadios](../components/TaskRadios/README.md) · [TaskWarning](../components/TaskWarning/README.md) · [TaskTable](../components/TaskTable/README.md) · [TaskMetrics](../components/TaskMetrics/README.md) · [TaskSection](../components/TaskSection/README.md) · [TaskReceipt](../components/TaskReceipt/README.md) · [TaskDay](../components/TaskDay/README.md) · [TaskPage](../components/TaskPage/README.md) · [TaskDialog](../components/TaskDialog/README.md).
- **Code:** `components/task-skeleton.css` and `components/task-skeleton.js` (`window.SentriTask`), loaded after `tokens.css` and the bundle.
- **Demo:** `components/task-skeleton-demo.html`: each screen built from the parts beside farrowing's original at 390×844. `?screen=room|sheet|full|page|dialog` shows one screen on the harness (framed on a wide window, full-bleed on a phone). Strict lint pages `ds-task-skeleton`, `ds-task-skeleton-{room,sheet,full,page,dialog}` (phone and narrow, en and zh) and `ds-task-skeleton-wide` (1440×900): clean.
- **Parity inventory:** `ux/tasks/piglet-processing/parity.md`.

## Context

The owner's principle is that **all tasks look the same; only the information differs**. Piglet processing drifted from farrowing on every page: a different header (the unit as the title), no summary card, counts beside the tab labels, a flat list, rows headlined by treatment names over three lines of red mono, drawers without a grab, ✕ or divider, **Close** where farrowing says **Back**, bars floating over lists, and pages stretched to the window instead of sitting in a phone (retro 29–32).

The cause was structural: the design system had cards (Row, Segment, Sheet as a CSS contract) but **no task-level skeleton**. Farrowing's room list, sow row, summary card, grouping and sheet anatomy lived as page composition in `farrowing-astra-concept.*`, so each designer composed a new skeleton from generic cards. Nothing compared a screen with its reference.

## Decision

Extract farrowing's task anatomy into shared parts, **pixel-faithful to the reference** (sizes, radii, type and spacing measured from farrowing's phone at 390×844), with the reference's layout bugs fixed, and make them the only way to build a task screen.

| Part | From farrowing | What it fixes or fixes in place |
|---|---|---|
| TaskPhone | `.phone`, `.statusbar` | Framed 390×844 on a wide window, full-bleed on a phone (retro 32). |
| TaskHeader + last record | `.task-header`, `.room-latest` | The task's name as the title; one last-record line. |
| TaskSummary | `.task-context-card` | Unit figure | task-overview progress. |
| TaskLens | `.room-controls`, `.room-tabs` | Count **under** the label; filter beside. |
| TaskGroup | `.pen-card`, `.pen-top` | Rows grouped by place; the header is one door. `overflow: clip`, so the header can stick. |
| TaskRow | `.sow-row` | id + one chip under it, one headline, one meta line, chevron or ✎ (retro 30's budget). |
| TaskDock | `.room-dock` | In flow as the screen's last row, never over the list. |
| TaskSheet | `.sheet[data-st-context=drawer]`, `.sheet-footer`, `.surface-back` | **Sized to its content up to its max; the footer is always the last child, so it sits on the bottom edge** (farrowing's Finish farrowing floats it 144px up). `data-height="full"` holds a growing sheet at its max. One left edge (21px). Back, never Close. |
| TaskHold | footer hold (Finish farrowing, End task) | Uses the ruled hold face (ADR 0002). |
| TaskPage | `.sheet[data-presentation=page]` | One left edge (18px). |
| TaskDialog | `.dialog-backdrop`, `.dialog` | The footer's bottom is the dialog's bottom (no padding under it). |

**Where the skeleton departs from the reference, and why**
1. **Footers never float.** A drawer is as tall as its content; only `data-height="full"` fixes its height, and then its body, not the space under the footer, takes the slack.
2. **One left edge per surface.** Farrowing's drawer head is at 18px over a 21px body; its page head is at 21px over an 18px body. The skeleton puts the drawer at 21 throughout and the page at 18 throughout (the room's edge).
3. **Colours snap to the palette** where farrowing's value is a near-duplicate of a token: `#394432` → `ink-2`; `#6e7965`, `#738069`, `#748068`, `#69765e` → `muted`; `#8a672c` → `amber`; `#24613a` → `green`, `#e4f1e6` → `green-wash`; `#596351` → `muted`, `#eef1e9` → `well`, `#dde3d5` → `line`; `#914032` → `red`, `#fbede8` → `red-wash`; `#e2e6dc` → `line`; `#57724e` → `current-marker`; `#dce2d4` → `handle`; the grab bar `#bac1b2` → `back-border`. The step is visible side by side only on the chips.
4. ~~**The hold uses the ruled face** (ADR 0002: 11px/700 sentence-case caption), not farrowing's 9px capitals.~~ **Superseded by owner round 5 (match farrowing exactly):** a task footer's hold caption is farrowing's face, `hold-caption` 9px/500 capitals, `0.07em` apart, at `task-hold-caption-opacity` (80%). The skeleton uppercases it; English caption and cue strings are written in capitals so the strict lint matches. See *Round 5 additions* below.
5. **The room header is 60px** (farrowing's height, which comes from an unnamed 46px inner height), the lens bar 68px (a 1px transparent edge), the dock's bottom padding 24px (farrowing 25px, not a token: the dock is 1px shorter).
6. **The dock has no "Go to pen" tool.** It is farrowing's own; the dock takes any icon tools.

**What the skeleton does not decide.** Content inside a sheet (steppers, facts, fields, numpads) stays with the existing cards (ADR 0001, 0002). The demo uses them as they are, which is why the demo's steppers are the DS Stepper (filled +), not farrowing's outlined keys.

## Round 5 additions (rebuild, `rebuild/bulkfarrow`)

Additive only: no class or API renamed. Found while composing bulk (no farrowing counterpart) on the parts.
- **TaskHold caption:** farrowing's face (decision 4 above).
- **[TaskTotals](../components/TaskTotals/README.md)** (`SentriTask.totals`): the two or three figures a sheet commits, at farrowing's Finish size (`figure-total` 23px/600 sans, label 11px `muted`, a 3-column Panel).
- **TaskRow tick trail** (`trail: 'tick'`, `tick: { action, value, checked, label }`): the row becomes a `<label>` around ChoiceList's checkbox, the whole row the target. Plus `still` (a row with no action, a `<div>`) and `data` (host data attributes such as `data-flash`).
- **TaskPage `aside`** (text actions at the right end of the title line) and **`inert`**.
- **One overlay layer model:** z = base + 10 × layer (scrim 2, sheet 3, page 5, dialog 8); every page or sheet before an overlay in the phone raises it one layer (up to 3), so a sheet, page or dialog opened over a sheet or a page stacks above it; `layer: n` sets it explicitly.
- **[TaskProgress](../components/TaskProgress/README.md)** (`SentriTask.progress`): farrowing's Whole-task progress card (Task overview) as its own part: head, an 8px segmented bar, one count per segment.
- **Footer status slot** (`footer({ status })`): one line directly above a sheet's or page's footer for a waiting reason or a hold's progress line.
- **TaskGroup `face: 'word'`** for a title that is a word, not a place code.
- **TaskRow parts wrap whole** (each headline/meta part is an inline block).
- **TaskGroup headers stick only under a lens bar** (`.tk-lens ~ .tk-list`); a list in a page or sheet body drops its own gutter.

## Skeleton 2 (rebuild/skeleton-2): the design system's own faces replaced by farrowing's

Round 5 is "match farrowing exactly"; page workers found four places the design system still drew its own face, and four skeleton gaps. Additive only.
- **[TaskStepper](../components/TaskStepper/README.md)** (`SentriTask.stepper`, faces `row` · `well` · `count`): the Stepper card with farrowing's outlined keys (pressed: ink), 15px label, 18px mono value; the well and the green count area.
- **[TaskPhotos](../components/TaskPhotos/README.md)** (`SentriTask.photos`): farrowing's photo line with an outlined camera key.
- **TaskRow door** (`SentriTask.door`): farrowing's `.disclosure` row, no id column.
- **[TaskChoice](../components/TaskChoice/README.md)** (`SentriTask.choice`): the Foster Send / Receive tiles.
- **`footer({ status: { …, action } })`**: one text action on the status line.
- **One left edge:** ChoiceList group titles inside a page/sheet body lose their 17px inset.
- **TaskRow id column holds its width**; a wide chip ellipses under the id.
- **`page({ view, descriptionTone })`, `sheet({ subtitleTone })`.**
- Candidate tokens: colour `task-key-border` #919a8c, `choice-pressed-border` #8ea88a; type `entry-label` 15px/500, `step-value` 18px/600 mono, `figure-well` 28px/600 mono; radius `radius-count` 16px, `radius-hero-key` 15px; size `entry-row-min` 66px, `glyph-key-task` 17px, `glyph-key-count` 22px, `photo-thumb-task` 50px, `choice-tile-min` 92px. Snapped to existing tokens: the disabled key (`well` / `line` / `disabled-ink` for #f1f2ed / #d9ddd3 / #92998d), the count sheet's green keys (`chip-green-border`, `green` for #c3d6c7, #345841, #28734b).
- Demo pairs: `?screen=full` (TaskStepper row + TaskPhotos beside Death entry), `?screen=foster` (TaskChoice, door rows, well stepper beside Foster piglets), `?screen=count` (count face, a door, a status with a text action beside Counting).

## Skeleton 3 (rebuild/skeleton-3)

Additive. Farrowing's remaining own faces, so dead, count and end can drop their scoped fakes (`.dd-flat`, `.ct-flat`, `Candidate:TaskTable`, `Candidate:TaskMetrics`).
- **[TaskRadios](../components/TaskRadios/README.md)** (`SentriTask.radios`): ChoiceList radios as farrowing's flat `.radio-row`s.
- **[TaskWarning](../components/TaskWarning/README.md)** (`SentriTask.warning`): the danger band (new colour `danger-border` #edc8c0).
- **`SentriTask.doors({ card })`** (TaskRow README): flat door rows, or the Pen page's card of icon doors.
- **[TaskTable](../components/TaskTable/README.md)** (`SentriTask.table`): the Choose-a-unit comparison table, its column headings and sublines at farrowing's **9px** (`table-heading`, below the floor by the owner's ruling, like the hold caption).
- **[TaskMetrics](../components/TaskMetrics/README.md)** (`SentriTask.metrics`): the performance card (`metric` 28px, `metric-total` 17px mono; `table-figure` 15px mono for the table).
- **Door with a one-tap** (`door({ act })`): care rows leave `SentriUI.rowAction`.
- **Narrow gutters:** the 12px override at 370px and below is gone; drawers keep 21, pages 18 (farrowing, ruling 16); the footer's gap is 10 there, as farrowing's.
- **TaskSummary no longer clips** its halves; the task half carries the right corners itself.
- Demo pairs: `?screen=sow` (radios, photos, warning beside the sow-death drawer), `?screen=pen` (card doors beside the Pen page), `?screen=overview` (progress, table, metrics beside the Task overview).

## Skeleton 4 (rebuild/skeleton-4)

Parity review round 2 (fix-brief-2, items 2–7). Additive, except that TaskWarning's `amber` tone now draws farrowing's End banner colours.
- **TaskWarning** gains `title` (bold, item 4) and the End banner (`icon`, `door`: a chevron, the whole band one button; item 2).
- **[TaskSection](../components/TaskSection/README.md)** (`SentriTask.section`): the icon-headed card section (Task outcomes list, or Other outcomes rows; item 2).
- **[TaskDay](../components/TaskDay/README.md)** (`SentriTask.day`): the day card — band, door rows with a mark and a mono meta, an optional trailing act, no chevron (item 3).
- **[TaskReceipt](../components/TaskReceipt/README.md)** (`SentriTask.receipt`): the ✓ receipt row (item 5).
- **`SentriTask.holdBind`**: the hold's caption stays unchanged through the hold, as farrowing (item 6).
- **`dock({ unit })`**: the dock's labelled place control, `B1 / Go to pen` (item 7).
- **`radios({ layout: 'row' })`**: farrowing's inline field (label, Optional tag and Clear on one row with the option pills); id's sex field can drop its page CSS.
- **The footer's status slot is visually hidden by default** (a new design-system utility `.st-visually-hidden` in bundle.css); `status.visible` shows it. With `SentriTask.holdBind`, the hold's caption never changes, so the progress goes only to that hidden status.
- Candidate tokens: `banner-wash` #fff5df, `banner-border` #efdbb0, `dock-caption` 9px (below the floor by ruling).
- Demo pairs: `?screen=end`, `?screen=receipt`, `?screen=care`; the room screen's dock now carries the place control.

## Candidate tokens

In `tokens.json` with usage "Candidate (task skeleton, fix/skeleton, ADR 0003) — not approved", generated into `tokens.css`. They carry farrowing's measured values that no token held.
- **colour:** `frame-border` #c7d0bd (device chrome), `chip-green-border` #c9e2cf, `chip-red-border` #f0d6cd, `progress-active` #9daa87.
- **type (Figures):** `figure-card` 31px/600 mono −1.4px, `figure-denominator` 15px/400 mono −0.5px, `figure-total` 23px/600 sans (TaskTotals, round 5), `hold-caption` 9px/500 sans 0.07em (TaskHold, round 5; below the 10px floor by the owner's ruling).
- **opacity:** `task-hold-caption-opacity` 0.8 (TaskHold, round 5).
- **spacing:** `space-card-x` 15px, `space-animal-row-y` 13px.
- **radius:** `radius-tab` 7px, `radius-chip` 6px, `radius-device` 34px (device chrome).
- **size:** `phone-width` 390px, `phone-height` 844px, `statusbar-height` 42px, `animal-row-min` 76px, `animal-id-col` 59px, `grab-height` 24px.

## Lint

The design lint (`.claude/skills/design-drive/scripts/design_lint.mjs`, outside the repo) gains four rules, run on every page and state:
- `geo-footer-float`: a sheet's footer (a direct child `.sheet-footer`, `.tk-footer`, `footer` or `[data-footer]`) must end on the sheet's bottom edge (±1px). Sheets are `.sheet`, `.tk-sheet`, `.dialog`, `.tk-dialog`, `.tk-page`, `.record-page`, `[role=dialog]`, `[data-sheet]`.
- `geo-sheet-dead-space`: a sheet not held at full height (`data-height="full"`, a page, or as tall as its screen) may not be taller than its content plus its footer. A flex-grown or scrolling child counts at its content's height.
- `geo-sibling-overlap`: no in-flow element's box may intersect a sibling's (absolute and fixed layers are exempt; inline elements are compared fragment by fragment).
- `geo-untappable`: every `button` and `[data-action]`, scrolled into view, must receive a tap at its centre (`elementFromPoint` is the control or inside it). Controls in an `inert` subtree are skipped; a scrim (an empty positioned layer) passes if any point down its centre line reaches it.
- And `geo-unreachable` now ignores bars inside an `inert` subtree (the page behind a drawer covers nothing).

On the reference they report: Finish farrowing (footer 144px above the edge, 144px dead space), Filter sows (148px dead space), Correct born (footer inside 28px of padding; the scrim live under the dialog). On processing today: the room's dock over the list, and every drawer page whose background is not inert.

## Open questions (owner)

1. **Litter as a drawer or a page?** Farrowing opens a sow as a drawer over the room; processing opens a litter as its own page with a litter header, and every drawer rises over that page. The skeleton supports both (TaskSheet, TaskPage). Parity says drawer; processing's litter carries more (treatments by day), and farrowing's own *Piglet processing* page is a page. Which anchors the litter?
2. **Chips or status words?** Farrowing's rows carry filled, bordered chips (`Active`, `Done`, `Sow died`); the README says status words are coloured text with a 4px dot, never filled badges. The skeleton draws farrowing's chip. Keep it (and amend the law), or draw the Status word?
3. **A lone Back:** farrowing fills it in `ink` (the primary's face). Keep, or outline it like every other Back?
4. **Hold caption:** the ruled 11px/700 sentence case (skeleton) or farrowing's 9px capitals?
5. **The candidate tokens** above, and the colour snaps in *Decision 3*.
6. **Full-bleed status bar:** the simulated status bar stays at phone width (so a phone screenshot matches the frame pixel for pixel). A real phone has its own; drop it at phone width?

## Adoption

Next step, page by page on the skeleton, each screen checked beside its counterpart in the parity inventory: room → litter → drawers → dead → count/explain → move → id → edit/record → end → bulk → edge. Each rebuilt page: loads `task-skeleton.css/js`, drops `shell.css`'s `.phone` frame, and must lint clean with the four new rules.
