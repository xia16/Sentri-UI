# Component alignment review

The live reference is `ux/system/sentri-components-study.html`, linked from the Home study header and Toolbox. Its Components and Assembled screens views use the same SentriUI and AstraSurfaces implementations as the app.

## Reviewed in the browser

- Farrowing overview: progress, unit routing, performance and outcome panels; white surfaces on the pale page; red early-ending action.
- Farrowing log: contextual timeline, date groups, readable corrections and author metadata.
- Completed litter drawer: pale information panel on white; adaptive medium sizing shows the summary and actions without a clipped body.
- Inspection pig detail: full-width fact grid, section hierarchy, white panels, secondary Back and black Actions.
- Inspection details embedded inside Farrowing: same 22px page title, white information panels and shared action groups.
- Embedded action drawer: 20px title, 13px sections, 11px groups, no subgroup dividers; fixed Back/category footer, internally scrolling body.
- Home saved-work drawer: white canvas, outlined Back and black Upload in its fixed footer.
- Home search: the relocated footer submit button still submits its associated form and returns sample records.
- Shared study: page/drawer comparison, assembled screens, alternative heights, long content, empty values, and enabled/disabled/destructive footers.

## Automated coverage

Shared component contracts cover escaped text, zero versus unknown, disabled/navigation semantics, source log ordering and attachment actions. Existing surface, log-filter, health-catalogue, feed-availability and batch-tracker checks cover preserved navigation and record behavior. Run each `*.test.cjs` directly with Node in this Windows environment.

## Boundaries

This is a prototype component migration, not a production backend change. Bespoke task cards, routing tables, clinical entry controls and specialized feed editors retain their own layouts. Their shared reading surfaces, titles and navigation policy are aligned where migrated; not every combination of every form state has been visually reviewed. The Inspection and Farrowing migration documents list source coverage. New reading patterns should use the contract instead of adding another screen-specific skin.
