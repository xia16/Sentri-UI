**Status: candidate.** Extracted from farrowing's room dock (`.room-dock`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskDock

The room's bottom bar: **one primary tool (Scan ear tag) and icon tools**. It is the screen's last row, not a layer: the list ends above it and never scrolls under it.

**One part (2026-10-22).** `SentriUI.taskDock({ label, place, primary, tools, content, className })` draws the dock of every task page: Farrowing's room and Inspection's walk call it, and it is drawn exactly as Farrowing's room dock was (`nav.room-dock`, `data-ds="TaskDock"`). `place` is the framed place control (`{ action, label, icon?, aria? }`: the Pen map); `primary` the one primary tool (`{ action, label, icon?, attrs? }`: Scan ear tag); `tools` the icon tools (`[{ action, icon, label, className? }]`: Search). A host's own bar for the moment takes the dock's place through `content` (Inspection's selection: the count and Actions). `SentriTask.dock` below is the older face the frozen piglet-processing room still calls; new work uses `SentriUI.taskDock`.

**Four slots at most (2026-10-22).** Farrowing's room adds a second tool, ··· (aria "Actions": everyday actions for pigs in this unit). Measured: with Pen map (110px), two 48px tools and 9px gaps, the primary is 125px at 390 and about 109px at 360, and "Scan ear tag" (≈131px with its glyph) wraps. So the primary reads **Scan** (the glyph says ear tag; its accessible name stays "Scan ear tag"), in every task's dock so the docks stay one look. The header's one icon action was not used: it is the sync badge whenever records wait.

**Anatomy** (`.tk-dock`, `data-ds="TaskDock"`, a `nav`)
- `paper`, 1px `line` on top, padded `space-heading space-panel space-section`, 9px gaps; the 92×4 `handle` bar 8px from the bottom.
- **Primary** (`.tk-dock-primary`): flex 1, `tap-min` tall, `ink` with a `paper` label, `radius-control`, the glyph 8px before a 12px/500 label.
- **Tool** (`.tk-dock-tool`): 48 × 50, `paper`, 1px `line`, `radius-control`, one glyph, an aria-label.

- **Place control** (`unit`, optional, first): the framed form is farrowing's **Pen map** button: the Search button's frame (`paper`, 1px `line`, `radius-control`, `footer-height` 56px tall) around an 18px icon and a 13px/600 `ink` label, 14px side padding, 8px between, width to content, no pen number or caption. The older frameless form (an icon, a 13px/600 mono place over a 9px `dock-caption`, padded `0 3px`) remains for Piglet processing's room until it migrates. Props: `dock({ unit: { icon = 'grid', label, action, value, aria, framed, caption }, primary, tools })`; `framed: true` draws the first form and ignores `caption`.

**States**
- Pressed: the framed place control takes IconButton's press (`press` fill, 2px down; none with reduced motion). The Primary and the Tools do not draw a press here yet. Disabled: never.

**Component contract**
- **Props:** `SentriTask.dock({ primary: { icon, label, action, value }, tools: [{ icon, label, action, value }] })`. `tools.label` names the nav.
- **Events:** each is `<button data-action data-value>`.
- **Port note:** a bottom bar inside the safe area, above the home indicator.

**Don'ts**
- Don't float the dock over the list (position it in flow, as the screen's last child).
- Don't put a text row (a status line, a count) in the dock.

**Strings**
- Host strings (`act.scan` for Scan ear tag).

**Changelog**
- 2026-10-17: the place control gains a framed form (Pen map) and loses the pen number in farrowing's dock; the sheet it opens is titled Pen map (was Go to pen). Farrowing's room dock uses the framed form (`.tk-dock-unit[data-framed]`, its markup built in the room page); the skeleton demo uses `framed`.
- 2026-10-22: Inspection's walk dock takes the framed Pen map button too (its old `Pens / Go to pen` place control is retired).
- 2026-10-22: the primary's label is "Scan" (accessible name "Scan ear tag"); Farrowing's room adds the ··· Actions tool.
