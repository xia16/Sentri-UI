# Inspection subpage visual coverage

Scope: `ux/system/inspection-astra-concept.js`, with task-specific refinement in `ux/system/inspection-subpages-refinement.css`. The roster/list remains owned by `inspection-home-refinement.css`; shared colors, type, controls and generic sheet geometry come from `sentri-visual-foundation.css`.

## View families found

| Family | View states audited |
| --- | --- |
| Main inspection and entry | `list`, `review`, `filters`, `grid`, `search`, `scan`, `home` |
| Actions and records | `actions`, `condition`, `note`, `weight`, `health`, `body`, `individual-plan`, `plan`, `measurements-menu`, `temperature`, `backfat`, `triage`, `treatment`, `resolve`, `finding`, `finding-edit` |
| Feed | `feed`, `feed-editor`, `feed-breakdown`, `switch-feed`, `exception`, `feed-date`, `feed-note`, `record-optional`, `medicine-picker`, `bulk-health-picker` |
| Pig records | `pig`, `pig-profile`, `pig-production-batch`, `pig-log`, `pig-feed`, `production-task` |
| Pen records | `pen-detail`, `pen-faults`, `pen-log`, `pen-note`, `read-pen-note`, `selected-pen-note`, `fault-record`, `fault-form`, `choose-fault-pen`, `equipment`, `report` |
| Unit and batch detail | `unit-detail`, `batch-detail`, `batch-membership` |
| Sow and disposition flows | `sow-transfer`, `miscarriage`, `batch-removal`, `unavailable-actions` |
| Walk completion | `history`, `finish`, `complete` |

The JS also contains the `production` route family and its task-specific child states where the renderer delegates through the same record/action surfaces; these inherit the scoped detail, action, footer and record rules above.

## Selectors covered

- Subpage shell: `.sheet`, `.dialog`, `.utility-header`, `.sheet-body`, `.sheet-footer`, page-size sheets, narrow-width insets.
- Action and record navigation: `.actions-sheet`, `.actions-subjects`, `.compact-actions`, `.action-group-label`, `.review-list`, `.detail-section`, `.detail-line`, `.facts-surface`, `.record-tabs`, `.pig-detail-footer`.
- Embedded animal/pen views: `.pig-current-tasks`, `.pig-current-task-list`, `.detail-destinations`, `.record-card-stack` inheritance, `.unit-detail-section`, `.unit-sensor-reading`, `.unit-fault-card`, `.unit-empty-state`.
- Health/catalog forms: `.health-tabs`, `.health-catalog`, `.catalog-item`, `.selected-conditions`, `.choice-list`, `.choice-option`.
- Feed and bulk editors: `.feed-pig-rows`, `.feed-inline-pigs`, `.feed-pig-row`, `.feed-reading`, `.feed-change-state`, `.feed-optional-*`, `.plan-preview`, `.individual-ration`, `.bulk-action-sheet`, `.bulk-pigs`, `.bulk-pig-row`, `.bulk-controls`, `.bulk-control-grid`, `.bulk-condition-button`.
- Logs and pickers: `.log-filterbar`, `.log-filter-controls`, `.log-category-select`, `.log-date-trigger`, `.categorized-timeline`, `.log-empty`, `.walk-event`, `.log-date-option`, `.picker-step`, `.medicine-option`, `.catalog-path`, `.dialog`.
- Completion states: `.walk-complete`, `.complete-mark`, `.feed-feature`.

## Exceptions and unverified areas

- No JS, HTML, shared styles or existing roster refinement were changed. Clinical status colors remain supplied by the existing stylesheet; this leaf adds only neutral surfaces, selected wash, focus-compatible spacing and semantic green completion wash.
- `production` is a renderer/delegated route family rather than a standalone `c.view` equality branch; it was audited through the shared record/action output and is listed as inherited above.
- `inspection-sow-embed.css` remains an integration boundary. Embedded sow host behavior and cross-frame sizing were not changed or visually verified here.
- Narrow-width CSS was authored for `<=370px`, but a live browser pass was not performed in this subtask. Verify after the parent reloads the newly wired stylesheet, especially long catalog labels, optional feed controls and dialogs with the keyboard open.
- No new tests were added because this is a reversible visual-only refinement.
