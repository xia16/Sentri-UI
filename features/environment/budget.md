# environment: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The page's name, the farm, the section, the unit, a description of the page, the source of a finding.

## Questions

1. Where am I? (the title) 2. How do I get back? (Back, top left)

## Levels

- No header line on any Home page or drawer: the farm, section and unit are scope (on Home itself, one Back away); descriptions are cut.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Every page and drawer of this feature | action or destination off Home | none | | Back reaches Home, which shows the section and unit |

Ambiguous, quieter option taken: The PREVIEW badges (prototype chrome) are dropped with the old page heads.

Chains walked on the real Back path after this change (crit round 1): no surface here writes to or is about one animal without showing it on screen or one Back away; no line changed.

Until migrated (crit round 1): the Assistant, Environment & devices and Maintenance pages keep their page-built head, PREVIEW badge and subtitle. Their bodies are below the farm legibility floors (10px text, 9px chart labels) and a change that moves a screen must bring it to the floors; that body work is its own task. Their drawers (report issue, issue detail) take the sheet header.


### Corner actions and titles (2026-10-14)

By the Headers law → Corner actions and Title length (`ux/design-system/README.md`, owner ruling C, 2026-10-14; PR #165). Room at a true 360, as `scripts/check-headers.mjs` (workflow/header-checks) measures it: a drawer title has 360 − 2 × (18 + 48 + 12) = 204px (a missing corner counts as the room it would take); a page title has 216px beside Back. Titles measured at their own face (sheet 500 20px, page 500 22px), EN and ZH.

| Surface | Corner action (top right) | Present while | Title | Fits at 360 (EN · ZH) |
|---|---|---|---|---|
| Report fault | none | | **`Report fault`** (was `Report equipment issue`): Farrowing and Inspection name the same job `Report fault`; the Equipment field says what broke; the primary keeps `Record issue` | 108px |
