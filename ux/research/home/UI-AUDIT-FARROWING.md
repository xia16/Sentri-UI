# Farrowing Astra UI audit

Date: 2026-09-21  
Scope: `ux/system/farrowing-astra-concept.js`, `farrowing-astra-concept.css`, `farrowing-astra-room.css`, `farrowing-astra-unified.css`, `farrowing-subpages-refinement.css`, and `task-overview-routing.css`.

The audit follows `SENTRI-COMPONENT-CONTRACT.md` and `SENTRI-SURFACE-POLICY.md`. It preserves existing record math, completion gates, routes, disabled states, and hold-to-finish behavior.

## View inventory

| Surface / state | Entry or source state | Browser checked | Source checked |
| --- | --- | ---: | ---: |
| Farrowing room list | `room` / preset `room` | Yes (preset) | Yes |
| Today return card | `roomHome` | No | Yes |
| Whole-task overview | `roomOverview` | No (reachable from room) | Yes |
| Due/parity filter | `roomFilter` | No (reachable from room) | Yes |
| Pen map / go to pen | `roomGrid` | No (reachable from room) | Yes |
| Ear-tag search | `roomSearch` | No (reachable from room) | Yes |
| Scanner sample flow | `roomScan` | No (reachable from room) | Yes |
| Pen detail | `roomPenDetail` | No | Yes |
| Feed guidance | `roomPenFeed` | No | Yes |
| Pen log | `roomPenLog` | No | Yes |
| Read pen note | `roomPenReadNote` | No | Yes |
| Edit pen note | `roomPenNote` | No | Yes |
| Report equipment fault | `roomPenFault` | No | Yes |
| Resolve equipment fault | `roomPenFaultRecord` | No | Yes |
| End-task review | `roomEndTask` / presets `task-blocked`, `task-ready`, `task-complete`, `task-outcomes` | Yes (4 presets) | Yes |
| End-task grouped sow list | `roomTaskSows` (active, awaiting, drafts, ended, miscarriages, not-in-pig, removed) | No (reachable from review) | Yes |
| End-task receipt | `roomTaskReceipt` | No (after completing review) | Yes |
| Count alive | `count` / preset `count` | Yes (preset) | Yes |
| Before first count | preset `before` | Yes (preset) | Yes |
| Finish farrowing | `finish` / preset `finish` | Yes (preset) | Yes |
| Lock blocked by draft | preset `blocked` | Yes (preset) | Yes |
| Locked/completed record | `locked` / presets `locked`, `ended` | Yes (2 presets) | Yes |
| Record piglet death | `death` / preset `draft` | Yes (preset) | Yes |
| Edit counts | `edit` / preset `edit` | Yes (preset) | Yes |
| Edit finish details | `editFinish` (from locked edit) | No (reachable from edit) | Yes |
| Correct born dialog | preset `born`, popup `born` | Yes (preset) | Yes |
| Farrowing history | `history` / preset `history` | Yes (preset) | Yes |
| Death breakdown | `deathBreakdown` (from locked facts) | No (reachable from locked) | Yes |
| Sow detail / action host | `profile` (embedded Inspection surface) | No | Yes (host only) |
| Marker note | `marker` (from profile > More actions) | No (reachable from profile) | Yes |
| Piglet care | `pigletCare` (from profile > Piglet processing) | No (reachable from profile) | Yes |
| Piglet identity editor | `pigletEdit` (from piglet records) | No (reachable from piglet care) | Yes |
| Foster piglets | `foster` (from piglet care or profile actions) | No (reachable from piglet care/profile) | Yes |
| Piglet mortality | `pigletDeath` (select records > Report mortality) | No (reachable from piglet care) | Yes |
| Reconcile piglet count | `countReconcile` (from profile > More actions) | No (reachable from profile) | Yes |
| Photo attachment dialog | popup `photo` (from death/history attachment) | No (reachable from death/history) | Yes |

The source inventory was exercised through all declared presets and view branches. The parent browser pass rendered all 15 presets at 390px: no horizontal overflow was found. That pass also found and fixed the sow title link and death-breakdown link hit areas, which were below the 44px touch target. The preset pass was a geometry/overflow check; the non-preset paths above remain source-only in this delegated audit.

## Fixes applied

- Affirmative `Complete task` now uses the policy black primary (`var(--ink)`). Early task ending and task confirmation retain explicit red treatment.
- Room rows, task review rows, unit routing rows, piglet processing rows, foster rows, and task warning rows keep title and supporting text on one line with ellipsis. Their flex parents now allow the text column to shrink, preventing long tags, outcomes, or notes from widening the phone.
- The born correction and photo preview dialogs use the mobile bottom-sheet geometry, with the existing Back/action footer still reachable while content scrolls.
- Photo deletion is marked with the explicit `danger` class so the destructive action remains red even when primary button styles apply.
- Segmented controls, feature tabs, room lens tabs, and filter Clear controls meet the 44px touch target.
- Sow title links and the death-breakdown link now retain their existing typography while exposing a 44px hit area.
- The unit-routing heading follows the 12px heading-to-content spacing in the shared contract.

## Checks

- `node --check ux/system/farrowing-astra-concept.js` passed.
- All Farrowing-owned stylesheets are present and non-empty.
- `git diff --check` passed for the changed Farrowing files.
- Model/source exercise passed for every preset (`room`, `count`, `before`, `draft`, `finish`, `blocked`, `locked`, `edit`, `born`, `history`, `ended`, and all four task closure presets). The closure review preserved active/awaiting/finished classification and did not alter business rules.
- Parent browser geometry pass: all 15 presets rendered at 390px without horizontal overflow; small sow-title and death-breakdown targets were fixed afterward.

## Pattern decisions

- Reused existing `SentriUI.heading`, `SentriUI.panel`, `SentriUI.row`, and `SentriUI.log` output already present in the Farrowing implementation. No new shared API was needed.
- Kept room, pen, task-review, piglet-care, and feature-row visuals local because their action payloads and record semantics are Farrowing-specific. The changes are bounded CSS refinements to existing selectors rather than a second component system.
- Kept the embedded sow-detail host and action handoff intact. Piglog/Inspection internals, utility-header spacing, and shared Astra surface normalization remain with their owning agents.

## Remaining gaps

- Full visual screenshot comparison, 360px overflow measurement, and non-preset navigation walkthroughs still need a parent-agent CUA pass.
- Embedded sow detail / Piglog filter and action-row internals are intentionally outside this audit's ownership; verify the host iframe context and return routing after the Inspection pass lands.
- Shared page-heading margin and other shared `SentriUI`/`AstraSurfaces` changes are intentionally not duplicated here.
