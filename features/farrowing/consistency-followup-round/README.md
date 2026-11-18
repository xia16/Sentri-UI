# Farrowing follow-up verification · 2026-11-18

The before/current comparison was captured from implementation commit `f368b433945e2c7957b89525ae8c078f26553407` in the local Atlas at `http://127.0.0.1:4317/atlas/`. The owner confirmed both decisions below on 2026-11-18; the correction stays in PR 317.

## 1. Actions inside a production task

The current Farrowing sow Actions sheet has no `Open Farrowing` task-entry row. `productionActionsForPig()` in `ux/system/inspection-astra-concept.js` suppresses it when `embed=sow`. When Farrowing supplies its `piglets` host action, the generic Piglet processing task row is also deduplicated.

The Production group still contains concrete recording operations: Record abortion, Mark not in pig, Piglet processing (Care and identity), Reconcile (disabled), Foster piglets and Batch membership, subject to stage and availability. The owner explicitly retained the sow-level Care and identity entrance on 2026-11-17 and confirmed on 2026-11-18: suppress reopening the current task, retain the concrete operations. The existing Actions behavior implements that rule.

## 2. Atlas default versions of Find and Scan

The actual Atlas flow reproduced the reported mismatch:

| Atlas entrance | Default before correction | Current version, confirmed as default |
|---|---|---|
| Find a sow (`farrowing.search`) | Historical bottom sheet, Unit 7 and `7 sows in this unit` | Full-page Find, empty until typed, searches every unit |
| Scan ear tags (`farrowing.scan`) | Historical bottom sheet, Scanner preview, Try sample tag and a sow list | Full-page Scan, listening / stopped / disconnected states; each read opens one record |
| Find a sow · results and other Scan states | Current full pages | Same current flow |

The two historical defaults came from `features/farrowing/approvals.json`: both pointed to `fc98e360417f0ba10b86bc3249f0258ee4a53949`, dated 2026-10-12, with a `changed` marker. `atlas/feature.js` intentionally defaults to that approved snapshot until the owner promotes a current version. Current feature presets and steps already reach the correct full pages.

The previous page and entrance audits replayed current prototypes only. They did not exercise the Atlas's approved-version default. Their passing route results do not cover these two historical display choices.

After the owner's explicit confirmation on 2026-11-18, `node scripts/approve.mjs farrowing.search,farrowing.scan --commit f368b433945e2c7957b89525ae8c078f26553407` recorded approval of these two existing full-page screens, and `node scripts/build-atlas.mjs` regenerated the Atlas. Only these two screen approvals were promoted; the prototype layout and the feature's overall maturity stay as they were. A sow record appearing over Scan after a read is intentional: the underlying Scan page is full-screen, and Back returns to it.

[Visual comparison](review.html) includes actual Atlas screenshots with the version controls visible.

## Verification after promotion

The actual Atlas UI was reloaded after rebuilding, without selecting a current-version override:

| Entrance or action | Observed result |
|---|---|
| Find a sow | `Approved · 2026-11-18`; full page, empty input lists no sows, hint searches every unit |
| Scan ear tags | `Approved · 2026-11-18`; full page, listening, no Scanner preview or Try sample tag |
| Find → type `43` | Full-page results grouped under Unit 7, 3, 6 and 8 |
| Find results → Scan icon → Back | The same full-page Scan; Back restores query `43` and its results |
| Scan · her drawer opened → record Back | The sow record closes onto the full-page Scan, still listening |
| Scan → Stop scanning | Full-page stopped state with Resume scanning |
| Scan · reader not connected | Full page with Scanner not connected and pairing instructions |
| Sow Actions | No Open Farrowing row; one Care and identity action; Record abortion, Foster and Batch membership retained, with unavailable operations greyed |

The [Find default](find-default-approved.jpg) and [Scan default](scan-default-approved.jpg) screenshots show the new approval date and the actual default pages. The sow Actions metadata and PRD now explicitly record the confirmed task-entry rule and the existing shared Batch membership and disabled-row behavior. The existing Lookup component already supplies both full-page layouts, so this correction requires no component code change.
