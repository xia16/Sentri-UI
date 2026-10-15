# Data sync design evidence · 2026-10-13

Baseline: `origin/main` at `ccaa3f2`. After: the provisional `codex/offline-flow-design` branch. All images are atlas bare phone captures; the prototype uses fictional records and does not contact a server.

| Comparison | Before | After |
|---|---|---|
| Home, English 390 × 844 | [Old full-width upload card](home-before-en-390.png) | [Compact saved-work entry after first task](home-after-en-390.png) |
| Saved work, English 390 × 844 | [Old batch upload drawer](list-before-en-390.png) | [Per-record list](list-after-en-390.png) |

The 2026-10-12 compact Home entry and the first 2026-10-13 full-width app-shell row were revised after further owner feedback. The selected native Android direction is the header badge. Its current aligned states are [waiting on Home at 390px](badge-aligned-home-offline-zh-390.png), [exception on Home at 390px](badge-aligned-home-failed-zh-390.png), [English exception at 360px](badge-aligned-home-error-en-360.png), and [uploading in Toolbox at 360px](badge-aligned-toolbox-upload-en-360.png). The [centered app-drawn island](island-home-wait-zh-390.png) remains an earlier interactive comparison: it states “待传 3” but moves the work cards down about 40px. The [full-width status row](global-home-wait-zh-390.png) and [narrow capsule exploration](compact-pill-exploration-en-390.png) remain baseline evidence.

For 30 mixed records: [English overview](grouped-en-360.png) → [production category](category-en-360.png); [Chinese overview](grouped-zh-360.png) → [production category](category-zh-360.png). Exceptions remain directly accessible before the category summaries.

The dynamic threshold has a separate 390px Chinese pair: [nine waiting records in two categories](grouping-nine-zh-390.png) → [eight waiting and one confirmed upload](grouping-eight-stable-zh-390.png). Category rows remain in place during the same visit, and the total changes without the list switching to a flat layout.

Confirmed uploads now appear only as a [recent 30-day total](uploaded-summary-zh-390.png), with a [boundary fixture](retention-30d-zh-390.png) showing that one older upload no longer counts. The prototype does not delete a real local database; the 30-day cleanup rule is specified in the PRD for Android implementation.

Additional Chinese 360 × 844 states: [conflict differences](conflict-detail-zh-360.png), [conflict deletion confirmation](delete-confirm-zh-360.png), [dependent after deletion](dependent-after-delete-zh-360.png), [dependent deletion confirmation](dependent-delete-confirm-zh-360.png), [queue after both deletions](after-dependent-delete-zh-360.png), [original-account sign-in](expired-login-zh-360.png).

Missing-receipt reconciliation at 360 × 844: [checking in English](receipt-check-en-360.png) → [server-confirmed in English](receipt-confirmed-en-360.png), and [checking in Chinese](receipt-check-zh-360.png) → [server-confirmed in Chinese](receipt-confirmed-zh-360.png). The transition is a local fixture showing the product rule; no server request occurs.

[Earlier Home conflict entry at 390px](home-conflict-en-390.png) shows the prior exception placement; the selected Home uses the header badge as its single global sync entry.

Task-owned status study: the [Farrowing task before](task-header-before-farrowing-390.png) and [after](task-header-after-farrowing-390.png) at 390px keep the same first work row height while adding “Task 2” to the right header slot. The [sow count drawer](task-sow-layer-en-390.png) keeps that same task count while the worker records a litter. Tapping it opens [two records from this task](task-list-farrowing-en-390.png); the [360px Chinese task list](task-list-farrowing-zh-360.png) exposes “本机全部 · 3”, which opens the [phone-wide list](task-to-all-zh-360.png). These task and phone counts are independent fixed fixtures, not a shared queue.

When this task has zero unsent records but other tasks still have three, the header [explicitly says “All 3”](task-fallback-all-en-390.png) and opens the phone-wide list. This keeps the global entry available without mislabelling the number as this task's count.

`features/data-sync/critique.md` records the driver's first look and the reason for choosing this direction. The screenshots show design behavior only. The real Android queue, result lookup by operation ID, server comparison, conditional retry and sign-in still require implementation validation.
