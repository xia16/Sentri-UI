**Status: candidate.** Extracted from farrowing's day cards on the Piglet processing care page (`.processing-day`, `.processing-task`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskDay (the day card)

What a litter owes, grouped by day: a card per day, its rows the items.

**Anatomy** (`.tk-day`, `data-ds="TaskDay"`)
- The card: 1px `line`, `radius-inset`, `paper`, clipped.
- **Band** (`.tk-day-head`): `surface`, padded `space-row-y space-row-x`; the day bold 13px/700 left (`Day 3`), the status 10px mono `muted` right (`Due today`, `Recorded`).
- **Rows** (`.tk-day-row`, a 1px `line` above each): the whole row is the door (`.tk-day-door`, at least 62px, padded `10px space-row-x`, 12px between): an optional **mark** — `done`: a 22px `green-wash` disc with a `current-marker` check; `due`: a 22px open ring (1px `task-key-border`); then the title 12px/700 (a done row's title `muted`) over a 10px mono `muted` meta line. **No chevron.**
- **Act** (optional): the row's one-tap at its end (`Record 12`, the Button card, 48px), beside the door; its accessible name is its label plus the row's title.

**Component contract**
- **Props:** `SentriTask.day({ title, status, items: [{ title, meta, mark: 'done' | 'due' | '', action, value, label, act: { label, action, value, register, waiting, busy }, id }], label })`.
- **Events:** the door is `<button data-action data-value>`; the act is a Button with its own `data-action`.
