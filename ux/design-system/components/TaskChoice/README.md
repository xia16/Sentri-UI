**Status: candidate.** Extracted from farrowing's choice tiles on Foster piglets (`.feature-choice`: Send piglets / Receive piglets) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskChoice (choice tiles)

Two (or three) big tiles for a choice that changes the whole page below it (the direction of a move). Replaces a Segment on task pages.

**Anatomy** (`.tk-choice`, `data-ds="TaskChoice"`, `role=group`)
- A grid of equal columns, 10px apart. Each tile (`.tk-choice-tile`, a button with `aria-pressed`): at least `choice-tile-min` (92px), `radius-inset`, 1px `task-key-border`, `paper`, `muted`; a 24px icon over the label (14px/600), 10px apart.
- **Chosen:** `green-wash`, 1px `choice-pressed-border`, `ink`.

**Component contract**
- **Props:** `SentriTask.choice({ options: [{ value, label, icon, pressed, aria }], action = 'choose', label })`. Events: `<button data-action=action data-value=value aria-pressed>`.

**Don'ts**
- Don't use it for more than three options, or for a filter (the lens does that).
