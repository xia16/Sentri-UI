# Inspection UI audit

Audit date: 2026-09-21. Scope: `ux/system/inspection-astra-concept.js`, `inspection-astra-concept.css`, `inspection-home-refinement.css`, `inspection-subpages-refinement.css`, `inspection-sow-embed.css`, `sow-actions-navigation.css`, `sow-record-toolbar.css`, and `astra-record-log.css`.

## Coverage and evidence

Source coverage is complete for every render state in `InspectionStudy.overlay`, `recordFlowOverlay`, `round3Overlay`, `legacyOverlay`, and the `drawerSize` / `AstraSurfaces` page sets.

Root browser coverage checked 28 UI presets for geometry, page-level overflow, and small-button regressions. The Actions footer was visually checked and its category tabs were tapped through navigation. Profile and pig-log screenshots were checked. The embedded SOW screenshot is pending the root recheck after the filter-bar fix. The CUA browser is isolated per agent, so this subagent could not bind the root agent's tab; direct `file://` navigation was also blocked by browser policy. Render states outside those 28 presets remain source-checked unless listed as browser-checked below.

### Full-page surfaces (source checked; browser evidence from 28 presets)

`pig`, `pig-profile`, `pig-production`, `pig-production-batch`, `pig-origin`, `pig-log`, `pig-feed`, `pig-feed-curve`, `pig-feed-changes`, `history`, `pen-detail`, `pen-log`, `feed`, `feed-editor`, `unit-detail`, `environment`, `equipment`, `batch-detail`, `treatment`, and `sow-transfer`.

### Drawer and nested surface states (source checked; browser evidence from presets where reachable)

`actions` (pig and pen scopes), `unavailable-actions`, `measurements-menu`, `miscarriage`, `production-task`, `batch-membership`, `batch-removal`, `not-in-pig`, `feed-date`, `feed-note`, `feed-breakdown`, `health`, `edit-conditions`, `body`, `individual-plan`, `resolve`, `triage`, `temperature`, `backfat`, `note`, `weight`, `record-optional`, `medicine-picker`, `bulk-health-picker`, `filters`, `pen-faults`, `fault-form`, `fault-record`, `pen-note`, `read-pen-note`, `selected-pen-note`, `choose-fault-pen`, `review`, `condition`, `plan`, `exception`, `report`, `finish`, `complete`, `home`, `grid`, `search`, and `scan`.

Nested log date picker (`logDatePicker`) was checked in source as a drawer over both `pig-log` and `pen-log`. Nested feed and health pickers were checked through their parent overlays. The embedded SOW detail entry (`?embed=sow`, `sowDetailContext`, `open-sow-detail` message flow) was checked in source; its post-fix screenshot remains pending the root recheck. The browser preset matrix did not independently open every nested state, so those remain source-only where unreachable.

## Findings and fixes

- Pig and pen log filters had a later refinement rule setting horizontal padding to zero, and the shared filterbar background was forced to white. Removing that competing rule, using an 18px inset, and inheriting `var(--st-context-bg)` keeps page logs on the pale page canvas while drawer filters remain white. Date grouping still uses source date/time metadata; no dates are inferred for `Before this walk` records.
- Legacy log labels such as `Aug 26 · 08:41` now group by the supplied `Aug 26` label and keep `08:41` in the entry metadata. Relative labels such as `5 days ago · 07:10` follow the same display-only split; filtering, ordering, and date inference remain unchanged. A focused regression test covers same-day grouping and retained times.
- Actions rendered transparent row stacks. Existing `.compact-actions` elements now carry `st-panel st-row-group`, reusing the shared tinted drawer panel and internal row separators without adding a wrapper. Production subgroup panels use the same structure.
- Action sheet heading-to-content spacing now follows the 12px contract. Production subgroup spacing is 16px, and the dead `.action-row` override was removed.
- The action footer now calls `SentriUI.categoryFooter` while retaining the `action-category-nav` hook used by scroll synchronization. The obsolete pill navigation and duplicate footer tab rules were removed from `sow-actions-navigation.css`; the shared white fixed footer, outlined Back, and active underline remain component-owned.
- Mobile control floors were audited for 44px touch targets. Compact Inspection controls that were below that floor (catalog search, stage tabs, record tabs, filter-clear, unit/profile links, feed percentage/range controls, log-clear, bulk fields and toggles) now receive bounded rules; the nested bulk `Details` toggle and `Choose conditions` button are explicitly scoped to `.inspection-phone` so their base 32px/42px sizing cannot bypass the touch floor when the study viewport is wider than the phone preview. Native HTML selects remain acceptable OS pickers.
- Legacy Home and Search navigation now use the shared `st-panel st-row-group` structure. Search results use `SentriUI.row` while preserving the existing `search-pig` action and pig-id `data-value`; Selection review uses shared group headings and panel rows while retaining each row's inner Remove button and action payload.

## Mobile interaction review

All actionable rows, footer controls, log filters, tabs, and check targets are at least 44px after responsive rules. Text and metadata rows use single-line ellipsis where they are shared `SentriUI.row` instances. No double-click handlers or hover-only content were found. Existing hover rules only change cosmetic background/border color. There is no desktop-only menu in the Inspection surface.

Contained horizontal rails exist for current tasks, status chips, health tags, and action category tabs; the phone surface itself uses vertical scrolling and does not require page-level horizontal scrolling. The pen-map long-press preview (`pointerdown` with a 350ms hold) is an existing interaction and may need a product decision for mobile; it is not required to understand a pen because the map cell remains a normal tap target.

## Component decisions

- Reuse `SentriUI.heading`, `SentriUI.panel`, `SentriUI.row`, `SentriUI.log`, and `SentriUI.categoryFooter`. No new shared component was introduced in this audit.
- The grouped action panel is an existing `st-panel st-row-group` applied to the existing `.compact-actions` structural element, so action routing and data remain local to Inspection.
- The log filter bar remains a specialized control because it combines a native category select, date-range bottom drawer, result count, and clear action. Its spacing now follows the page surface rather than adding a second panel abstraction.
- No new component was introduced for the filterbar; the fix edits its existing surface and spacing rules.
- Legacy Home/Search rows reuse the shared navigation row panel. Selection review rows keep list semantics and distinct Remove buttons; the main roster's selectable checkbox rows remain native checkboxes and were not converted into navigation buttons.
- Follow-up source fixes: the Pig feed-plan summary now carries `st-panel`; Unit environment/equipment sections no longer add whole-section dividers; Pig current-task and unit-work titles/subtitles use one-line ellipsis; and the 44px touch floor is scoped to `.inspection-phone` so it applies when the phone shell is rendered inside a wider desktop viewport.
- The footer audit item at `sow-record-toolbar.css:2,16` remains a stale competing selector for the approved `categoryFooter` geometry. It was intentionally left unchanged because the parent owns the visually verified footer treatment; reconcile that legacy rule during shared footer cleanup.
