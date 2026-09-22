# Home visual alignment coverage

Scope: `home-astra-prototype.js` and `task-cards-astra-prototype.js`, with the
leaf refinement in `ux/system/home-subpages-refinement.css`. The refinement is
loaded after the current Home and task-card study styles. It changes surfaces,
spacing, selected states and action emphasis only; it does not change routes,
labels, records, task state calculation or event handling.

## Verification status

The view-family and selector audit below is source verified against every
renderer and event route in both prototype scripts. Browser verification of the
representative environment/device, maintenance, sync drawer, Assistant and
gallery detail states was attempted in a temporary tab, but the current
subagent browser surface does not expose temporary tabs (`IAB visibility is not
supported in a subagent thread`). Those states remain explicitly unverified in
this subtask; the parent can perform the final rendered pass in its own tab.

## Audited Home view families

| View family | Entry and states audited | Refinement coverage |
| --- | --- | --- |
| Section picker | `sections`, selected section, no scheduled work | Whole-row cards, selected background, readable population/work facts, touch height |
| Overview and unit home | `home`, overview/unit scope, today/next/closed task groups | Existing task-card composition is preserved; leaf file only adjusts surrounding hierarchy and action semantics |
| Unit picker | `scope-unit` drawer, selected unit, no-task unit | Selected row surface and unit row height; drawer header/body rhythm |
| Environment and sensors | `environment`, temperature/humidity/ammonia tabs, today/7 days, history disclosure | Neutral sensor selection, paper detail surface, numeric hierarchy, 44px controls |
| Devices | connected fan, auto/manual, speed slider, offline/disabled, applied preview setting | Control grouping, selected mode surface, disabled readability; no command or state change |
| Maintenance | open issue list, resolved issue, empty state, report issue form, issue detail drawer, resolve action | Amber open attention, quiet resolved surface, row height, drawer rhythm; clinical/status meaning retained |
| Saved work / sync | inline sync card, saved-work drawer, waiting/uploading/synced/failed/offline, retry | Amber pending state, green uploaded state, disabled upload; upload logic and status text untouched |
| Assistant | findings tab with open finding, up-to-date finding state, conversations, composer | Amber input-needed surface, green saved state, neutral composer/send treatment |
| Assistant clarification | movement clarification page, evidence, answer form, saved answer, Unit 7 return | Evidence grouping and form hierarchy; existing response/log behavior untouched |
| Toolbox | search, records, sections, Assistant, gallery link | Neutral navigation rows and readable metadata; no universal green action treatment |
| Records | populated log and empty log state | Row minimum height and empty-state completion mark |
| Scan/search | scan drawer, sample tag lookup, search form, result rows, no-match state | Neutral scanner/search surfaces and route rows; existing sample lookup preserved |
| Placeholder task pages | task preview, ready-to-complete, completed, ended early, back footer | Placeholder closure surface; green completion only for eligible completion and red early-end doorway |

## Audited task-card gallery families

| Family | Coverage |
| --- | --- |
| Component study | Overview and selected-unit cards, scenario chips, status/state variants and anatomy view remain owned by the existing task-card composition |
| Library | Due, next, ready, completed and ended-early group headings/cards retain current status colors and layout |
| Rules | Rule cards and priority/closure copy retain existing information hierarchy |
| Detail dialog | Whole-task and unit entrances, Farrowing link, placeholder detail, closure-blocked state, ready-to-complete state, complete action and early-end confirmation are covered by dialog refinements |
| Lifecycle states | `complete`, `terminated`, ready, dependency-blocked and open states retain their existing data semantics; green is reserved for complete, red for ending early |

## Exceptions and unverified areas

- Farrowing remains routed to `farrowing-astra-concept.html` and is owned by the
  Farrowing alignment work; this audit covers only the Home entrance and gallery
  detail link.
- Inspection is an external destination from the unit hub and remains outside
  this leaf stylesheet.
- The gallery's shared task-card internals are deliberately unchanged. The
  refinement covers the surrounding detail dialog and lifecycle controls.
- The stylesheet uses `body:has(#detail)` for gallery-only dialog scoping;
  browsers without `:has()` retain the existing dialog styling.
- Visual checks were made from rendered source structure and selector coverage;
  no new styling tests were added per the visual-conventions guidance.
