**Status: candidate.** Extracted from farrowing's room dock (`.room-dock`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskDock

The room's bottom bar: **one primary tool (Scan ear tag) and icon tools**. It is the screen's last row, not a layer: the list ends above it and never scrolls under it.

**Anatomy** (`.tk-dock`, `data-ds="TaskDock"`, a `nav`)
- `paper`, 1px `line` on top, padded `space-heading space-panel space-section`, 9px gaps; the 92×4 `handle` bar 8px from the bottom.
- **Primary** (`.tk-dock-primary`): flex 1, `touch-min` tall, `ink` with a `paper` label, `radius-control`, the glyph 8px before a 12px/500 label.
- **Tool** (`.tk-dock-tool`): 48 × 50, `paper`, 1px `line`, `radius-control`, one glyph, an aria-label.

**States**
- Pressed: the Button press (darken, 1px down) is not drawn yet. Focus: the global ring. Disabled: never.

**Component contract**
- **Props:** `SentriTask.dock({ primary: { icon, label, action, value }, tools: [{ icon, label, action, value }] })`. `tools.label` names the nav.
- **Events:** each is `<button data-action data-value>`.
- **Port note:** a bottom bar inside the safe area, above the home indicator.

**Don'ts**
- Don't float the dock over the list (position it in flow, as the screen's last child).
- Don't put a text row (a status line, a count) in the dock.

**Strings**
- Host strings (`act.scan` for Scan ear tag).
