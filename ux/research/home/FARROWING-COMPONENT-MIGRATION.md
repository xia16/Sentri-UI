# Farrowing component migration

The farrowing study now uses the shared `SentriUI` contract for its bounded title, panel, and activity patterns.

## Coverage

- `litterHeading()` uses `SentriUI.heading({kind: 'section'})` and keeps the existing `history` action, label, disabled state, and accessibility attribute.
- Count, finish, and completed litter information surfaces carry `st-panel`; existing structure and data remain unchanged.
- Farrowing history and pen activity are grouped by their source date and rendered through `SentriUI.log`. Entry order, correction/milestone labels, author/time metadata, and photo actions are preserved.
- Task overview uses shared headings for Whole-task progress (`panel`), Farrowing by unit (`section` with description), Performance metrics, Task outcomes, and Other outcomes. Existing performance and outcome surfaces carry `st-panel` without an extra wrapper.
- Pen information and feed guidance section headings use the shared heading helper.

## Remaining exceptions

Leaf form labels, filters, action rows, modal titles, task review headings, and feature-page headings remain local because they are control labels or route-specific interaction surfaces. The task overview routing table keeps its grid and row layout; only its section heading is shared.

## Checks

Source coverage was checked with targeted searches for legacy timeline and heading wrappers. JavaScript syntax was checked with Node after migration. Rendered browser coverage still depends on the parent page loading `SentriUI` and `sentri-components.css` last, as required by the contract.

## Integrated review

Utility page/drawer headers also use the shared page title. See `SENTRI-COMPONENT-VALIDATION.md` for the assembled browser checks and known coverage boundaries.
