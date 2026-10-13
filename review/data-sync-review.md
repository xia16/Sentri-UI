# Offline processing · provisional design review

Date: 2026-10-13. Baseline: `origin/main` at `ccaa3f2`. Tested screen candidate: `codex/offline-flow-design` at `b04313d`. The owner selected the header badge form; all screens remain `in-design`.

## Product rules agreed with the owner

- Save an operation locally before showing success. Upload automatically when usable connectivity returns; keep individual results and offer manual handling for exceptions.
- Stop automatic retries for conflicts. Show the local and current server values before a manual retry, never overwrite the server value, and allow deletion only after a specific confirmation.
- Deleting a conflicted predecessor leaves direct and indirect dependents blocked. Each dependent can only be viewed or deleted with its own confirmation.
- Prevent account or farm switching while unsent work remains. An expired session resumes with the original account and then continues automatic upload.
- Reuse a stable operation ID. The server guarantees deduplication and final-result lookup. If a reply is lost, query by that ID before declaring success or sending again; if the result is still unknown, retain the local record.
- The top global indicator counts **all unsent records on this phone**. Its number does not narrow with the current task, page or identity; individual records retain their account and farm ownership.
- Confirmed uploaded history stays locally for 30 days from `syncedAt`. Older uploaded records and their local logs are cleared only when no unsent operation still depends on them; nonuploaded or uncertain records never age out under this rule. The overview shows only the last-30-days uploaded total.

## Follow-up design direction

- The native Android app shell shows a 48dp minimum tappable badge as the header's trailing control, inside the system safe area. It uses the phone-wide count in waiting, uploading and exception states, expands to an action label for an exception, and disappears for an empty queue. Home has no separate sync card. The badge and adjacent control now share a vertical center and 10px gap, with the header's 20px right inset on Home. The 360px English exception uses `Fix N` to keep the farm and section names on one line; the full reason remains in the accessible label and detail.
- The app-drawn centered island remains an interactive comparison. It makes the short state word visible but moves the work cards down about 40px; the owner chose the right header badge. Android Live Update chips can be investigated for qualifying active uploads, while waiting and exception awareness remains in the app. The system controls promotion and the user can dismiss or demote the notification.
- For a small queue, keep direct record rows. With at least nine ordinary waiting records spanning more than one business category, group those rows by category and show counts. Keep exceptional records directly accessible above the groups. Category → record is the navigation depth in this candidate; the four labels in the 30-record fixture are examples, not a final business taxonomy. Newly added or unmapped types must remain visible under Other work until mapped. Uploaded records no longer occupy individual rows; the overview shows the last-30-days total.
- A fresh interaction review found that the most useful enhancement is at the moment of saving: confirm once that the operation is stored on this phone and will upload automatically, then let the selected badge carry the persistent state. Repeated per-record upload popups would interrupt the work. This connection is specified for native Android validation in the first offline business operation; the Home sample has no real local-write event. The comparison with bottom navigation and a permanent bottom status strip is recorded in [the critique](../features/data-sync/critique.md).

## Review paths

| Path | Evidence |
|---|---|
| Home entry and list | [Before/after pairs](data-sync-evidence/README.md) |
| Aligned selected badge in waiting, exception and uploading states | [Current 390/360 px captures](data-sync-evidence/README.md) |
| Compact badge versus centered island; waiting, uploading and exception | [Current comparison captures](data-sync-evidence/README.md) |
| 30 records, category overview and category detail | [English and Chinese captures](data-sync-evidence/README.md) |
| Recent upload total and 30-day boundary | [Chinese 390 px captures](data-sync-evidence/README.md) |
| Conflict, deletion, blocked dependents, original-account sign-in | [Chinese 360 px states](data-sync-evidence/README.md) |
| Missing receipt → confirmed result | [English checking](data-sync-evidence/receipt-check-en-360.png) → [confirmed](data-sync-evidence/receipt-confirmed-en-360.png); [Chinese checking](data-sync-evidence/receipt-check-zh-360.png) → [confirmed](data-sync-evidence/receipt-confirmed-zh-360.png) |
| Interactive design study | `ux/system/data-sync-astra-prototype.html` |

## Verification and remaining work

- [Scenario report](scenarios-data-sync.json): candidate `b04313d`; 19 passed, 0 failed, 0 blocked, 0 pending. All leaves passed in English and Chinese at 360 and 390 px. A separate alignment probe checked 12 Home combinations of 360/390px, English/Chinese and waiting/uploading/exception states; all 12 held the same header center, 10px gap and 20px Home right inset.
- `npm test`: 661 passed, 0 failed, 2 skipped. Data-sync strict legibility: 16 screens, 0 failures. Workbench strict legibility still reports seven pre-existing `unit*` screen failures; the badge adds no reported contrast or touch-target failure. Global `npm run check` exited 0: atlas passed, 294 screens scanned, 127 existing legibility failures (the same count as the prior baseline). Its generated repository-wide report was not included in this design candidate.
- The scenario ledger remains **continue** because no persona walk rounds have run. The independent judge gate, formal per-screen grades and owner screen approval have not run. The repository instructions prohibit automatically starting a multi-agent design process; therefore this is a reviewable design candidate, not an approved or merged feature.
- The HTML prototypes communicate native Android interaction and use separate fictional local queues. The badge study does not yet share live state with the data-sync prototype or other business screens. Android and backend handoff must verify the persistent global queue and count across pages and identities, 30-day cleanup with dependency protection, operation-ID lookup fields, structured receipt statuses, conditional conflict retry, account binding and real offline-capable business operations.
