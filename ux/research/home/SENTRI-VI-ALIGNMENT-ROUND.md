# Sentri visual alignment round

This round aligns the current working prototypes and their generated subpages. Legacy research pages remain reference material. No farm records or production data are affected.

## Shared foundation

See [visual conventions](SENTRI-VISUAL-CONVENTIONS.md). `sentri-visual-foundation.css` establishes the palette, app/paper surfaces, typography hierarchy, control sizes, focus treatment and completion/destructive action colors. Each prototype has a scoped leaf stylesheet for its task-specific pages.

## Page coverage

- [Home and task-card dialogs](HOME-VI-COVERAGE.md)
- [Inspection, records, feed, health and embedded subjects](INSPECTION-VI-COVERAGE.md)
- [Farrowing, counting, corrections, records and closure](FARROWING-VI-COVERAGE.md)

Coverage notes distinguish source audits from pages exercised in the browser. Interactive verification uses fictional in-memory examples.

## Farrowing overview routing

- The whole-task progress label and total now sit inside one compact summary card.
- The unit section is a navigation list with aligned numeric columns, retaining the useful comparison of farrowed, active and awaiting counts.
- Each entire unit row is a keyboard-accessible button with an explicit accessible name and right-edge chevron. Counts are included in the accessible name. Current unit is a quiet secondary label.
- Unit navigation occupies the main part of the initial page under “By unit,” supporting review as well as entering work. Performance and other outcomes are always shown below it in the same scroll, with no disclosure step.
- The footer retains existing task-close behavior and safeguards. End task early stays red; eligible Complete task stays green.

## Parent integration verification

- All local CSS/JS references resolve to existing files for Home, Inspection, Farrowing and the task-card study.
- Farrowing JavaScript syntax check passes.
- Browser: whole-unit row opens the matching unit, overview returns with the correct current-unit marker, and performance/outcome disclosure opens with its existing details.
- Browser: all 15 Farrowing preset states were opened, including counting, finish, locked records, corrections, logs and closure variants. The rendered phone and sheet surfaces had no horizontal overflow. Counting and the redesigned overview were visually reviewed.
- Browser: Inspection roster, animal detail, action menu, health-record form, condition picker, feed adjustment, walk log and finish-walk confirmation were exercised. Animal detail, health recording, feed adjustment and the finish drawer were visually reviewed. The extra outer panel around current tasks was removed to avoid nesting a card inside another card.
- Browser: Home environment/device page, sensor switching, maintenance empty state and report form, saved-work drawer and Assistant were exercised. The sensor page and saved-work drawer were visually reviewed; offline device controls remained disabled.
- No console errors were captured in the three tested page families. The subagent reports are source audits; these representative browser checks do not claim that every individual state was visually exercised.
- The attempted 360px browser override did not change the reported layout viewport. Narrow-device validation is therefore not claimed; the temporary override was reset.
- Source and browser review remain limited to the prototype; camera hardware and live device operations are not connected.

## Follow-up: overview and log refinement

- Removed the performance disclosure after user review; metrics and outcomes now render directly below the unit routes.
- Replaced “Units / Choose where to work” with the neutral heading “By unit.”
- Corrected the Farrowing log alignment regression: white reading surface, compact date labels, tighter date-group spacing, visible sage timeline markers, no trailing connector after a group's final event, and normal text for author metadata.
- Browser verified the complete log sample and the always-rendered performance/outcome sections; JavaScript syntax check passed.

## Follow-up: unified unit entrance

- One sage unit-status surface groups the inspection entrance, population, last check-in, health findings, feed updates and maintenance. White task cards retain the work/progress hierarchy below it.
- Environment and devices use a slim footer strip; the strip remains absent when neither readings nor devices exist. Saved work stays separate because its records span units.
- Health and feed summaries link to the matching Inspection lens through a validated `lens` query value. The primary inspection entrance opens All; maintenance retains its own page.
- Summary counts are illustrative and match the reused Inspection sample roster (four pigs with findings, three with feed updates); they are not live unit aggregates or task counts. Maintenance continues to use the preview's per-unit issue records.
- Browser verified Health and Feed destinations with the correct unit and selected lens, the open-issue/no-issue variants, and summary widths without horizontal overflow. Both edited scripts pass syntax checks.

## Follow-up: conditional attention chips

- Replaced the fixed summary columns with informational chips, without arrows or separate health/feed links. Inspect unit remains the primary entrance. A quiet Maintenance text link preserves the separate maintenance destination, including reporting an issue when there are none open.
- Show positive actionable counts only, naming pigs for health/feed and issues for maintenance. Zero categories disappear. Nothing flagged yields one quiet line; unavailable health/feed data is explicitly labelled rather than interpreted as zero.
- The illustrative attention snapshot excludes the chronic, no-action-needed finding: three pigs need health attention, versus four with any health finding in the Inspection fixture. This is still a visual prototype, not a live aggregate.
- Added the external Unit attention preview selector for mixed, empty, health-only, feed-only, maintenance-only, high-count and unavailable states. Chip wrapping and all six alternate states were checked in the browser without horizontal overflow.
- Further refinement: chips now show only a category icon and number, with full accessible names and hover titles identifying category and counting unit. The inspection entrance uses a stronger green icon, light yellow-green surface and warm-white sensor strip. Browser screenshot and accessibility labels reviewed; conditional chip logic is unchanged.

## Follow-up: flat surfaces and alignment

- Replaced the unit gradient with a flat pale-green fill. Attention chips now show icon, category label and count, retaining accessible descriptions and conditional visibility.
- Removed the standalone Maintenance link from the unit card; the unit-scoped Maintenance entrance is in Toolbox. Browser verified it opens the selected unit's maintenance page.
- Grouped the task timing badge and unit chevron in the shared card component, aligning their vertical centers. Browser geometry confirmed a zero-pixel center difference for active and waiting cards; the shared component update also applies to the card gallery.
- Reviewed the rendered unit card and task card; both edited scripts pass syntax checks.

## Follow-up: task overview hierarchy

- The route section now reads “Farrowing by unit,” with the grid icon used for unit entrances and “Tap a unit to open its task.” as supporting copy. Full-row buttons retain a right chevron without redundant leading icons.
- Removed the decorative divider above performance metrics; spacing separates the sections.
- Other outcomes now share a white, bordered surface with subtle internal row separators. Only rows with records retain navigation chevrons; the zero-count row remains informational.
- Reviewed both the initial overview and scrolled metrics/outcomes in the browser; script syntax passes.
