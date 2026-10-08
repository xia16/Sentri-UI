**Status: candidate.** Extracted from farrowing's icon-headed card sections on the End task / overview pages (`Task outcomes`, `Other outcomes`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskSection (an icon-headed card section)

A section heading (13px/500 with its 16px `muted` icon, the meta right in 10px `muted`), `space-heading` under it, then one card.

**Cards**
- `body`: any HTML (a Log, a Facts card, a TaskMetrics surface…).
- `items` (`rows: false`, default): farrowing's outcomes list — a `paper` panel padded `space-panel`; each line at least 27px, the label 12px `ink` left, the figure 14px/500 mono right (`Finished farrowing 9`).
- `items` (`rows: true`): farrowing's Other outcomes — the design system's Rows (label 13px/500, the figure as the muted trailing text, a chevron when the item has an action).

**Component contract**
- **Props:** `SentriTask.section({ title, icon, meta, body, items: [{ label, value, action, target }], rows = false, label })`. `target` is the row's `data-value`.
