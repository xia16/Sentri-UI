# Farm view v3: plan (owner review, 3 Nov evening)

Canvas: https://claude.ai/artifact/3d1Q4z2YMnFwmFBXtaCeMm (v68 live). Page: `aifirst/project/ActLayout3JS.dc.html`. View mode only; Edit layout stays as it is.

## The model in one line

**Left = the location card** (where you are: farm, zone, section, room, pen, the pig in it). **Right = batches** (calendar or list, a batch, its running task, a pig met through the batch). **Bottom bar = doing** (Select, Batches, Cameras, Equipment, Actions). Every Back and every click on empty ground goes **up one level**, never out.

## Tickets, in build order (each one shippable, each walked at 960 and 1360)

### T1 · Camera framing (small, first)
- Zone or section click: the area fills about 80% of the free stage (between the card, the right panel and the bar), a little of its surroundings left in view. Today it sits small in the middle.
- Room click: the room fills the free stage like screenshot 2 (rows readable), not screenshot 3 (whole site).
- Opening Batches never moves the camera. Opening a batch moves only if its pens are out of view.
- Done when: zone, section and room each fill 75–85% of the free area at both widths.

### T2 · The location card (replaces the room header pills and the pig panel)
- Rename: "location card" everywhere. One card, top left, ~360 px wide, collapsible to its title row.
- Every level: breadcrumb, title, then sections in this order, each only when it has something:
  1. **Pigs here**: a small breakdown (stacked bar, not a pie: easier to read at 360 px) by stage or status; clicking a segment filters the 3D to those pens. Replaces "186 sows · !5" and its ‹ › stepper; flags stay visible in 3D.
  2. **Unit details** (room): size, pens, places, door; folded by default.
  3. **Readings** (room sensors): one line each ("22.4 °C · 61 % · NH₃ 8 ppm · 2 min ago"); click opens a trend sub-page (24 h / 7 d chart).
  4. **Equipment** bound at this level (room, section or zone): name, state, its control; pen-targetable devices (moving floor, feeder) list per pen with a bulk action. Preview-marked ("nothing is sent yet").
- Pen click: the card becomes the pen. One pig: that pig directly. Several pigs: a list (tag, or for untagged pigs the batch and production status, as on the phone). Devices on the pen with their controls.
- Bar: remove the "Pen D17" chip and Clear. Add **Cameras** (opens the room's feed) and **Equipment** (opens the card's Equipment section). The room header pill row is removed.

### T3 · The pig (lean, as on the phone's pig profile, features/pig-profile)
- **Top**: tag, type and stage with days ("Gilt · 65 days", "In pig · day 61"), age, parity, batch chip, pen.
- **Running task** (only if one is active on her): the task, her state in it, who marked what and when ("Heat check · in heat · marked by Zhao Min 06:40").
- **Waiting on someone** and **Health** only when there is something (a health tag, a treatment, a decision). No empty health block.
- **Notes** only when there is a note.
- Click-through rows (sub-pages, each with Back): Performance (her past batches and litters), Feed, Weight & backfat, Log (moves and every event; "Moves" goes here).
- Group pens: the pigs listed first; untagged pigs shown as batch + status.

### T4 · Batches (right panel)
- Opens on a **batch calendar**: weeks across, one row per batch, its tasks as bars, today marked. A toggle at the top: Calendar | List.
- A batch selected: its pens get an **outline** (ring on the floor edge); pen colours are not changed. The rest stays as it is.
- Batch page, lean: header, Running now, next 3 coming up (+ "All dates ›"), and rows that open **sub-pages**: Compared with earlier batches ›, Plan ›, Flags ›.
- A running task: pen floors take the **phone's task colours** (status colour convention, PR 297: one hue per status; blue in progress, green done, amber attention). Clicking a progress-bar segment or a legend row highlights only those pigs.
- **Filters** for the task, like the phone (Farrowing: due in N days, parity; Breeding: in heat, bred; etc.): chips above the legend.
- A pig clicked while a batch is open opens as a sub-page of the batch (Back → the batch); same pig component as T3 (one look).

### T5 · Devices and readings (after T2)
- Device control sub-page from the card: state, setting (Auto or a value), reason field, "Preview: nothing is sent to equipment yet". Pen-level vs room-level per the device kind (the engine's `serves`).
- Readings sub-page: 24 h and 7 d line charts with the room's range shaded.

## Calls I made (owner said design calls are mine; say if any is wrong)
1. Breakdown is a stacked bar, not a pie (narrow card, clickable segments).
2. Pig info lives in the left card normally, and as a batch sub-page only when a batch is open (both render the same component).
3. The left card widens from 280 to ~360 px to hold pig and device content.

## Who builds
- T1 here (small). T2–T5 by Codex (`gpt-6.1-sol`, the worker tier) on `mini`, one ticket at a time (they all edit the same file), each with a brief, then reviewed and walked here before publishing.
- Transport: dispatch sends a git branch. The canvas is not in the repo, so the sources need a working branch in Sentri-UI (proposed `aifirst-canvas`, a `prototypes/aifirst/` folder, never merged). That push needs the owner's OK.

### Location card and equipment (canvas `LocationCard.dc.html`, owner 2026-11-04) — supersedes T2/T5 where they differ
- The location card is a supporting card: only the lowest level you are at; hover shows the breadcrumb; hovering a crumb drops its siblings with their pig counts, never a kind (click → go there). A red dot when something under it is wrong; the farm shows what and where (a broken connected device in 3D, the red ! on the pen). No fault text on the card.
- Chips only: the pigs (by kind, never production status; three chips, the rest behind +N) and the sensors (amber when out of range). A sensor chip opens its small trend (24 h / 7 d).
- Equipment and controls live on the bottom bar (the left shows, the bottom does); cameras are equipment (no Cameras button). Equipment opens tiles (icon, name, one word of state; on bright, off muted, fault red); a tile opens the device card (one big drag control, mode, last change, Apply).
- A device that serves pens: picking pens **switches the farm to Plan (bird's-eye)**, a box on each pen it serves; the bar becomes the control (On/Off, level, Cancel, Apply to N pens). **Do not change the 3D view for this yet.**
- The main card holds the pigs of a pen: a fixed-height scrolling list; pigs without an ID as one row.
- Moving floor (canvas F1–F2; owner 2026-11-04): bound to a **lane**; it can run per pen. **Auto**: a model decides when and in which pens to run; the card shows its day (ammonia, each run and each wait marked); hovering a mark gives why (reasons, skipped pens); a click pins it, and **Show pens** opens Plan with the pens that ran inked and the skipped ones hatched (no word on the pen; hover a skipped pen for why). The model's reasons (e.g. pigs at the feeder) assume inputs not yet confirmed. "Run once now" overrides. **Manual**: the user runs the whole lane or picked pens (Plan); the model only suggests, on the card. No link to the decision board.
- 3D follow-up (not now): add moving floors to the unit level in the 3D model, bound to lanes and targetable on individual pens.

### Views: 3D, Plan and the levels (owner 2026-11-04; canvas LocationCard "Moving between 3D, Plan and the levels")
- 3D is home. Plan is a tool: a task that needs pens (Show pens, Pick pens, Pick rows) tilts the camera straight down over the same place, framed to the pens involved.
- The task ends with Done, Apply, Cancel or Esc and the camera returns to the exact 3D camera the user had (save it on entry).
- Choosing Plan with the 3D | Plan switch is a choice, not a task: it stays until switched back.
- While Plan is open for a task, a pill at the top names it and holds Done; the location card and the bar stay.
- Going to another place (a crumb, another room) ends the task; the new place opens in 3D.
- Esc: closes a popover, then ends the task (back to 3D), then goes up one level.
- Farm › Room › Section › Lane › Pen are the same levels in both views; switching view keeps place and level. One short tilt and zoom (~0.4 s) on the same centre; reduced motion: a quick fade.

## Overhaul (owner 2026-11-04): build the farm view to the two boards
A presentation demo: the farm view (`ActLayout3JS.dc.html`) rebuilt to `BatchPages.dc.html` and `LocationCard.dc.html`. One ticket at a time (same file), each reviewed and walked before the canvas is published. Briefs: `briefs/O1.md` … `O6.md` (common rules at the top of each).
- **O1** · the bottom bar (Select · Batches · Equipment · Actions) and the batch panel's running side: Batches, a batch, a running task, the filter dropdown, All dates.
- **O2** · done tasks, Compare (stacked bars, tooltip), Compare on the farm, her card beside Compare, the pen hover card.
- **O3** · the pig profile (tags, cycle ring, tasks, litters, details), Performance, Log; the main card for a pen.
- **O4** · the location card: lowest level, breadcrumb on hover, sibling menus, chips, sensor trend, fault dot.
- **O5** · Equipment tiles from the bar, device cards, picking pens in Plan, and the view rules (task Plan, restore the 3D camera, pill, Esc).
- **O6** · the moving floor (demo): Auto with its day and hover reasons, Manual, Show pens in Plan.
