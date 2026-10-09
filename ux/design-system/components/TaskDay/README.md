**Status: candidate.** Extracted from farrowing's day cards on the Piglet processing care page (`.processing-day`, `.processing-task`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskDay (the day card)

What a litter owes, grouped by day: a card per day, its rows the items.

**Anatomy** (`.tk-day`, `data-ds="TaskDay"`)
- The card: 1px `line`, `radius-inset`, `paper`, clipped.
- **Band** (`.tk-day-head`): `surface`, padded `space-row-y space-row-x`; the day bold 13px/700 left (`Day 3`), the status 10px mono `muted` right (`Due today`, `Recorded`).
- **Rows**: [Row](../Row/README.md) navigation/record doors and door + act variants. TaskDay arranges them under a band; it owns no row markup or row CSS. Done is the shared Status chip; actionable records show Edit. Items with a `noop` action remain inert.
- **Act** (optional): the row's one-tap at its end (`Record 12`, the Button card, 48px), beside the door; its accessible name is its label plus the row's title.

**Component contract**
- **Props:** `SentriTask.day({ title, status, items: [{ title, meta, mark: 'done' | 'due' | '', action, value, label, act: { label, action, value, register, waiting, busy }, id }], label })`.
- **Events:** the door is `<button data-action data-value>`; the act is a Button with its own `data-action`.
