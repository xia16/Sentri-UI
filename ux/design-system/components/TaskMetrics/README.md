**Status: candidate.** Extracted from farrowing's performance card on the Task overview (`.task-performance`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskMetrics (the performance card)

Two headline measures with their sublines, a rule, then small totals: `Born alive / litter 12.0 · Target 12` | `Stillborn rate 7.2% · 7 stillborn / 97 born` — `Born 97 · Alive now 59 · Piglet deaths 38`.

**Anatomy** (`.tk-metrics`, `data-ds="TaskMetrics"`)
- A section heading with its icon and meta (`7 finished litters`), `space-heading` under it.
- One card: 1px `line`, `radius-panel`, `paper`, padded `space-panel`.
- **Measures:** two columns, 18px apart; each: the label `description` 11px `muted`, 4px, the figure `metric` 28px/500 mono −1px (a unit at 15px, 2px after), 4px, the subline `meta` 10px `muted` (`amber` when below target).
- **Totals:** three columns, 10px apart, `space-panel` under the measures, a 1px `line` above, `space-row-x` padding; the label 10px `muted`, the figure `metric-total` 17px/500 mono.

**Component contract**
- **Props:** `SentriTask.metrics({ title, icon, meta, measures: [{ label, value, unit, sub, subTone }], totals: [{ label, value }], label })`. Text slots throughout.
