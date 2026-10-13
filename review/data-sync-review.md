# Offline processing · provisional design review

Date: 2026-10-13. Baseline: `origin/main` at `ccaa3f2`. Design candidate: `codex/offline-flow-design` at `eadadd7` (the code and screen commit); the scenario report and this review note are later documentation commits. All screens remain `in-design`.

## Product rules agreed with the owner

- Save an operation locally before showing success. Upload automatically when usable connectivity returns; keep individual results and offer manual handling for exceptions.
- Stop automatic retries for conflicts. Show the local and current server values before a manual retry, never overwrite the server value, and allow deletion only after a specific confirmation.
- Deleting a conflicted predecessor leaves direct and indirect dependents blocked. Each dependent can only be viewed or deleted with its own confirmation.
- Prevent account or farm switching while unsent work remains. An expired session resumes with the original account and then continues automatic upload.
- Reuse a stable operation ID. The server guarantees deduplication and final-result lookup. If a reply is lost, query by that ID before declaring success or sending again; if the result is still unknown, retain the local record.

## Review paths

| Path | Evidence |
|---|---|
| Home entry and list | [Before/after pairs](data-sync-evidence/README.md) |
| Conflict, deletion, blocked dependents, original-account sign-in | [Chinese 360 px states](data-sync-evidence/README.md) |
| Missing receipt → confirmed result | [English checking](data-sync-evidence/receipt-check-en-360.png) → [confirmed](data-sync-evidence/receipt-confirmed-en-360.png); [Chinese checking](data-sync-evidence/receipt-check-zh-360.png) → [confirmed](data-sync-evidence/receipt-confirmed-zh-360.png) |
| Interactive design study | `ux/system/data-sync-astra-prototype.html` |

## Verification and remaining work

- [Scenario report](scenarios-data-sync.json): 14 executable leaves passed in English and Chinese at 360 and 390 px; no failed, blocked or pending executable leaf. The report is stamped to `eadadd7` with a clean working tree.
- `npm test`: 660 passed, 0 failed, 2 skipped. The data-sync strict legibility run: 12 screens, 0 failures. `npm run check` exits successfully; its 127 reported legibility failures are in existing screens outside this feature.
- The scenario ledger remains **continue** because no persona walk rounds have run. The independent judge gate, formal per-screen grades and owner screen approval have not run. The repository instructions prohibit automatically starting a multi-agent design process; therefore this is a reviewable design candidate, not an approved or merged feature.
- The prototype uses fictional local records. Android and backend handoff must verify the operation-ID lookup fields, structured receipt statuses, dependency persistence, conditional conflict retry, account binding and real offline-capable business operations.
