# Sentri prototype visual conventions

Scope: the current Home, Inspection and Farrowing prototypes, their task overviews, records, forms, pickers, logs, dialogs and embedded subject pages, plus the shared task-card study. Legacy research/reference screens are not the application.

## Palette and surfaces
- Outside canvas #f3f4ee; app background #f6f7f1; paper/card #ffffff; subdued header surface #f8faf5; control wash #eef1e7.
- Ink #20291f; secondary text #657060; borders #dfe4d8; inner dividers #e8eddf.
- Green #276640 for affirmative completion/saving. Ink remains suitable for ordinary navigation/actions such as Scan. Do not turn every control green.
- Red #a13a2d for destructive action: pale #fff1ee doorway, filled red final confirmation. Amber #896017 for attention. Keep existing clinical status meanings distinct; do not infer severity or recolor all conditions red.
- Selected backgrounds #eaf2e5. Visible focus #577fa6. Disabled controls remain recognizably disabled.

## Hierarchy and layout
- Plus Jakarta Sans for UI; IBM Plex Mono for animal IDs and deliberate numeric data only.
- Page headings 20–22px / weight 500. Section labels 12–14px / 500. Body 12–14px; metadata 10–11px. Avoid tiny new copy; retain readable existing forms. Data identifiers weight 500, not heavy bold.
- App inset 18px (12px at <=370px); rhythm 8/12/16/24px. White cards radius18px; controls12px; tags6px. No new card nested inside a card unless it represents a distinct interactive form grouping.
- Borders and subtle surface contrast establish hierarchy. Shadows are minimal. Do not use decorative gradients or heavy outlines.
- Touch targets >=44px. Keep scroll areas, sticky controls, anchored footer actions, keyboard focus and header/back behavior intact. Never shrink controls just to fit more text.

## Navigation and task overview
- Unit navigation is the main purpose of task overview. Whole-row unit buttons, right-edge chevrons, explicit contextual entrance labels, consistent numeric columns. Status facts support choosing a unit.
- Whole-task progress title belongs within its compact summary surface. Detailed performance metrics are secondary to unit navigation.
- Complete task: green, only when eligible. End task early: red, retain existing gates/confirmation. Never alter record logic, scheduling, closure dependencies or warning semantics during visual alignment.

## Implementation and review
- Use scoped additive refinement styles for the current prototypes. Parent agent owns the shared base and HTML wiring. Each subagent owns its named leaf stylesheet and coverage note only.
- Audit every generated page/view family in assigned JS, not just the initial screenshot. List covered families and any exceptions in coverage notes.
- Preserve all functionality, labels, data, clinical warnings, routes and form fields unless the parent specifically owns an authorized structural change.
- Validate rendered examples at phone size and narrow widths where feasible. No new tests for styling alone.
