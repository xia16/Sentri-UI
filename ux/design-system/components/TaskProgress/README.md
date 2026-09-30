**Status: candidate.** Extracted from farrowing's Task overview (`.task-progress`: *Whole-task progress*) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing). It is not approved.

# TaskProgress (the whole-task progress card)

The task's progress as one card: a head (`Whole-task progress` · `18 sows`), the segmented bar, then one count per segment (`7 Farrowed · 2 Active · 9 Awaiting`). It opens a task overview [page](../TaskPage/README.md); the room's [summary card](../TaskSummary/README.md) carries the same bar small.

**Anatomy** (`section.st-panel.tk-progress-card`, `data-ds="TaskProgress"`)
- The Panel (`paper` on a page, 1px `line`, `radius-panel`), padded `space-row-x space-panel` (14 × 16).
- **Head** (`.tk-progress-head`): the title in `panel-title` 12px/500 `ink`; the meta right, `meta` 10px `muted`; `space-heading` under it.
- **Bar** (`.tk-progress`, `role=progressbar`): 8px tall, `radius` 6px, 2px between segments; segments `done` `current-marker`, `active` `progress-active`, `rest` `handle`, on a `line` track.
- **Counts** (`.tk-progress-counts`): one column per count, 10px apart, `space-heading` under the bar. The figure in `figure-total` 23px/500 mono, −1px; under it (6px) the label in `meta` 10px `muted` after a 6px dot in its segment's colour.

**States**
- Default only: the card reads. It is not a door (the overview page is where it sits).

**Component contract**
- **Props:** `SentriTask.progress({ title, meta, segments: [{ tone: 'done' | 'active' | 'rest', share }], max, now, barLabel, counts: [{ value, label, tone }], label })`. Text slots take `{ text, str, args }`.
- **Port note:** a card with a stacked progress bar and a small legend of counts.

**Don'ts**
- Don't show more than three segments or counts, or percentages. The counts are the legend; the bar has no labels of its own.

**Strings**
- Host strings; figures are `{n}` strings.
