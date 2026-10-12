# Data sync design evidence · 2026-10-12

Baseline: `origin/main` at `ccaa3f2`. After: the provisional `codex/offline-flow-design` branch. All images are atlas bare phone captures; the prototype uses fictional records and does not contact a server.

| Comparison | Before | After |
|---|---|---|
| Home, English 390 × 844 | [Old full-width upload card](home-before-en-390.png) | [Compact saved-work entry after first task](home-after-en-390.png) |
| Saved work, English 390 × 844 | [Old batch upload drawer](list-before-en-390.png) | [Per-record list](list-after-en-390.png) |

Additional Chinese 360 × 844 states: [conflict differences](conflict-detail-zh-360.png), [conflict deletion confirmation](delete-confirm-zh-360.png), [dependent after deletion](dependent-after-delete-zh-360.png), [dependent deletion confirmation](dependent-delete-confirm-zh-360.png), [queue after both deletions](after-dependent-delete-zh-360.png), [original-account sign-in](expired-login-zh-360.png).

[Home conflict entry at 390px](home-conflict-en-390.png) shows the exception above the first work card and opens the conflict list.

`features/data-sync/critique.md` records the driver's first look and the reason for choosing this direction. The screenshots show design behavior only. The real Android queue, server comparison, conditional retry and sign-in still require implementation validation.
