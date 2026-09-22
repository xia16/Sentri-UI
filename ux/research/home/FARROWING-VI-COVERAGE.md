# Farrowing subpage visual alignment coverage

Scope: `ux/system/farrowing-astra-concept.js` leaf views under `.farrowing-phone`, using `farrowing-subpages-refinement.css`. The shared foundation and parent routing stylesheet provide the generic type, sheet, control, and task overview treatment.

## View families audited

| Family | Generated views / entry points | Covered selectors |
| --- | --- | --- |
| Room and pen list | `room`, `roomHome`; pen cards, sow rows, status lenses, empty state, dock | `.room-scroll`, `.room-controls`, `.room-tabs`, `.room-list`, `.pen-card`, `.pen-top`, `.room-sow-row`, `.room-empty`, `.room-dock`, `.room-home`, `.home-task` |
| Search, scan, filter, pen picker | `roomSearch`, `roomScan`, `roomFilter`, `roomGrid` | `.room-search-label`, `.search-result`, `.scanner-demo`, `.room-filter-sheet`, `.filter-section`, `.due-options`, `.parity-options`, `.pen-map`, `.pen-cell` |
| Pen detail and pen subpages | `roomPenDetail`, `roomPenFeed`, `roomPenReadNote`, `roomPenNote`, `roomPenFault`, `roomPenFaultRecord`, `roomPenLog` | `.pen-detail-sheet`, `.pen-form-sheet`, `.pen-feed-page`, `.pen-log-sheet`, `.pen-information`, `.pen-notices`, `.pen-notice`, `.pen-detail-copy`, `.pen-field`, `.record-timeline` |
| Sow counting | `count` | `.sheet[data-view=count]`, `.count-area`, `.hero-stepper`, `.count-record-surface`, `.record-inline-actions` |
| Record sheets and safety states | `finish`, `locked`, `death`, `edit`, `editFinish`; blocked finish, disabled steppers, death/sow-death safety copy | `.sheet[data-view=finish]`, `.sheet[data-view=locked]`, `.sheet[data-view=death]`, `.sheet[data-view=edit]`, `.sheet[data-view=editFinish]`, `.danger-band`, `.change-summary` |
| History and record details | `history`, `deathBreakdown`; production outcome logs | `.detail-sheet`, `.record-timeline`, `.log-section`, `.death-breakdown-facts` |
| Piglet processing and linked actions | `pigletCare`, `pigletEdit`, `foster`, `pigletDeath`, `countReconcile`, `marker` | `.feature-page`, `.feature-callout`, `.feature-tabs`, `.processing-day`, `.processing-task`, `.piglet-roster`, `.feature-tool`, `.feature-choice`, `.foster-sows`, `.feature-warning`, `.feature-photo` |
| Task closure review and receipt | `roomEndTask`, `roomTaskSows`, `roomTaskReceipt`; warning, review, ended-sow detail, completion receipt | `.task-end-sheet`, `.task-warning-card`, `.task-review-sows`, `.task-review-sow`, `.task-death-review`, `.task-death-litter`, `.task-ended-mark` |

## Intentional exceptions

- `task-overview-sheet`, `task-progress-section`, and `task-unit-table` are deliberately absent. Parent task overview and routing work owns those surfaces.
- The embedded sow profile (`.sow-detail-frame`) is rendered by the Inspection prototype and is outside this leaf stylesheet. Its entry and return behavior remain unchanged.
- `farrowing-astra-concept.js` loads the stylesheet in the prototype HTML; no JS or HTML changes are part of this refinement.

## Verification

- Source audit confirms the generated `room-sow-row`, `detail-sheet`, `task-end-sheet`, `feature-page`, and `pen-detail-sheet` hooks are present in the prototype. The dynamic `data-view` values are emitted by `farrowingRecordSurface()` for count, finish, locked, death, edit, and edit-finish states.
- `git diff --check` passes for the owned files. The stylesheet has no behavioral changes and no new tests.
- Browser sweep is pending: the CUA browser inventory returned no available `iab` or Chrome browser, so no temporary rendered tab or screenshots could be opened in this environment.

## Unverified / follow-up

- Real camera/file attachment previews, iframe profile content, and native keyboard/range rendering may vary by browser and remain unverified here.
- Narrow-width rules are included at `max-width: 370px`; a final side-by-side phone review can confirm typography against the parent foundation after all shared wiring lands.
