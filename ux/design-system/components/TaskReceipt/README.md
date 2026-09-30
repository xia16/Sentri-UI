**Status: candidate.** Extracted from farrowing's ✓ receipt row on the task's end receipt (`.task-end-status`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskReceipt (the ✓ receipt row)

The first line of a receipt: what ended, when and by whom (`Farrowing task ended` / `30 Sept, 23:09 · G. Hansen`).

**Anatomy** (`.tk-receipt`, `data-ds="TaskReceipt"`, `role=status`): padded `6px 0 10px`, 12px between; a 36px `green-wash` disc with a 19px `green` check; the title 14px/600/1.5 `ink`; 5px under it the meta in 11px `muted`.

**Component contract**
- **Props:** `SentriTask.receipt({ title, meta, icon = 'check', label })` (text slots or parts).
