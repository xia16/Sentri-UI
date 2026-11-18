# Farrowing follow-up verification · 2026-11-18

Verified against PR 317 head `f368b433945e2c7957b89525ae8c078f26553407` in the local Atlas at `http://127.0.0.1:4317/atlas/`.

## 1. Actions inside a production task

The current Farrowing sow Actions sheet has no `Open Farrowing` task-entry row. `productionActionsForPig()` in `ux/system/inspection-astra-concept.js` suppresses it when `embed=sow`. When Farrowing supplies its `piglets` host action, the generic Piglet processing task row is also deduplicated.

The Production group still contains concrete recording operations: Record abortion, Mark not in pig, Piglet processing (Care and identity), Reconcile (disabled), Foster piglets and Batch membership, subject to stage and availability. The owner explicitly retained the sow-level Care and identity entrance on 2026-11-17. The task-entry row and those recording operations must be distinguished before considering removal of the whole group.

## 2. Atlas default versions of Find and Scan

The actual Atlas flow reproduced the reported mismatch:

| Atlas entrance | Default | Current version (`Changed since`) |
|---|---|---|
| Find a sow (`farrowing.search`) | Historical bottom sheet, Unit 7 and `7 sows in this unit` | Full-page Find, empty until typed, searches every unit |
| Scan ear tags (`farrowing.scan`) | Historical bottom sheet, Scanner preview, Try sample tag and a sow list | Full-page Scan, listening / stopped / disconnected states; each read opens one record |
| Find a sow · results and other Scan states | Current full pages | Same current flow |

The two historical defaults come from `features/farrowing/approvals.json`: both point to `fc98e360417f0ba10b86bc3249f0258ee4a53949`, dated 2026-10-12, with a `changed` marker. `atlas/feature.js` intentionally defaults to that approved snapshot until the owner promotes a current version. Current feature presets and steps already reach the correct full pages.

The previous page and entrance audits replayed current prototypes only. They did not exercise the Atlas's approved-version default. Their passing route results do not cover these two historical display choices.

The proposed correction is limited to promoting these two existing full-page screens to the current approved version, rebuilding the Atlas and verifying its default selections. The prototype layout and native app need no redesign for this issue. The owner must explicitly confirm this promotion under `atlas/SCHEMA.md` → Approval records. No approval record, prototype or Atlas screen has been changed in this follow-up yet.

[Visual comparison](review.html) includes actual Atlas screenshots with the version controls visible.
