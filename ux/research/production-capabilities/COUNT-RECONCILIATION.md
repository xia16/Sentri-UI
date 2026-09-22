# Piglet count reconciliation

Figma references: the count-confirm and “quantity anomaly” states around `2519:9350` and `2523:20226`.

## Intent

Correct a litter count without translating the difference into invented deaths, fostering, or identity records.

## Interaction

- Entry: **Actions → Production → Reconcile piglet count**.
- Show the system count and reported count side by side.
- The reported count cannot be lower than the number of identified piglets still recorded alive.
- A difference reveals its consequence and requires a reason.
- Save is disabled until the number differs and the reason is present.

Increasing the count adds unidentified piglets. Decreasing it removes from the unidentified count. The correction is recorded as a history event with before, after, reason, author, and time.
