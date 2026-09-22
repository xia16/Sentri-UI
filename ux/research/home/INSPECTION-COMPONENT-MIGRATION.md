# Inspection component migration

The inspection study now routes shared reading patterns through `SentriUI` in `ux/system/inspection-astra-concept.js`.

## Coverage

- Pig overview: General details, type and cycle fact surfaces, Current tasks, Pig record navigation, and profile section headings use `SentriUI.heading`, `SentriUI.panel`, or `SentriUI.row`.
- Production actions: Production subgroup labels use group headings and action rows use the shared row renderer while preserving action ids, values, disabled states, and routing.
- Pen and pig information grids retain their source markup and add `st-panel` where custom semantics are required.
- Pig and pen logs preserve filtering, date ranges, categories, source order, timestamps, authors, and empty states while rendering through `SentriUI.log`.
- Leaf CSS no longer supplies the migrated panel, action-row, or categorized-log surface rules; the shared component stylesheet owns those visuals.

## Source-only exceptions

The study still contains bespoke task cards, feed previews, form controls, and record-card summaries. These retain custom markup because they carry interaction-specific state or editing semantics. Browser rendering coverage remains the responsibility of the assembled app; syntax checks cover this source migration.

## Integrated review

Utility page/drawer headers also use the shared page title. See `SENTRI-COMPONENT-VALIDATION.md` for the assembled browser checks and known coverage boundaries.
