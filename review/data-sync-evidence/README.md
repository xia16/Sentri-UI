# Data sync design evidence · 2026-10-13

Baseline: `origin/main` at `ccaa3f2`. After: the provisional `codex/offline-flow-design` branch. All images are atlas bare phone captures; the prototype uses fictional records and does not contact a server.

| Comparison | Before | After |
|---|---|---|
| Home, English 390 × 844 | [Old full-width upload card](home-before-en-390.png) | [Compact saved-work entry after first task](home-after-en-390.png) |
| Saved work, English 390 × 844 | [Old batch upload drawer](list-before-en-390.png) | [Per-record list](list-after-en-390.png) |

The 2026-10-12 compact Home entry was revised after owner feedback. Current candidate: [global waiting status on Home](global-home-wait-en-390.png) and [Chinese variant](global-home-wait-zh-390.png); [uploading](global-toolbox-upload-en-390.png) and [exception](global-toolbox-error-en-390.png) remain visible in Toolbox. The [compact capsule exploration](compact-pill-exploration-en-390.png) truncates the critical count/meaning at 390px, so the safe-area status row is the selected direction.

For 30 mixed records: [English overview](grouped-en-360.png) → [production category](category-en-360.png); [Chinese overview](grouped-zh-360.png) → [production category](category-zh-360.png). Exceptions remain directly accessible before the category summaries.

Additional Chinese 360 × 844 states: [conflict differences](conflict-detail-zh-360.png), [conflict deletion confirmation](delete-confirm-zh-360.png), [dependent after deletion](dependent-after-delete-zh-360.png), [dependent deletion confirmation](dependent-delete-confirm-zh-360.png), [queue after both deletions](after-dependent-delete-zh-360.png), [original-account sign-in](expired-login-zh-360.png).

Missing-receipt reconciliation at 360 × 844: [checking in English](receipt-check-en-360.png) → [server-confirmed in English](receipt-confirmed-en-360.png), and [checking in Chinese](receipt-check-zh-360.png) → [server-confirmed in Chinese](receipt-confirmed-zh-360.png). The transition is a local fixture showing the product rule; no server request occurs.

[Earlier Home conflict entry at 390px](home-conflict-en-390.png) shows the prior exception placement; the current Home keeps a content prompt for exceptions in addition to the global app-shell status.

`features/data-sync/critique.md` records the driver's first look and the reason for choosing this direction. The screenshots show design behavior only. The real Android queue, result lookup by operation ID, server comparison, conditional retry and sign-in still require implementation validation.
