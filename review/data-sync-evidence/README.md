# Data sync design evidence · 2026-10-12

Baseline: `origin/main` at `ccaa3f2`. After: the provisional `codex/offline-flow-design` branch. All images are atlas bare phone captures; the prototype uses fictional records and does not contact a server.

| Comparison | Before | After |
|---|---|---|
| Home, English 390 × 844 | [Old full-width upload card](home-before-en-390.png) | [Compact saved-work entry after first task](home-after-en-390.png) |
| Saved work, English 390 × 844 | [Old batch upload drawer](list-before-en-390.png) | [Per-record list](list-after-en-390.png) |

Additional Chinese 360 × 844 states: [conflict differences](conflict-detail-zh-360.png), [conflict deletion confirmation](delete-confirm-zh-360.png), [dependent after deletion](dependent-after-delete-zh-360.png), [dependent deletion confirmation](dependent-delete-confirm-zh-360.png), [queue after both deletions](after-dependent-delete-zh-360.png), [original-account sign-in](expired-login-zh-360.png).

Missing-receipt reconciliation at 360 × 844: [checking in English](receipt-check-en-360.png) → [server-confirmed in English](receipt-confirmed-en-360.png), and [checking in Chinese](receipt-check-zh-360.png) → [server-confirmed in Chinese](receipt-confirmed-zh-360.png). The transition is a local fixture showing the product rule; no server request occurs.

[Home conflict entry at 390px](home-conflict-en-390.png) shows the exception above the first work card and opens the conflict list.

`features/data-sync/critique.md` records the driver's first look and the reason for choosing this direction. The screenshots show design behavior only. The real Android queue, result lookup by operation ID, server comparison, conditional retry and sign-in still require implementation validation.
