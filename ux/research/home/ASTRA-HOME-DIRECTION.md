# Home — first agreed direction

Interactive study: `../../system/home-astra-prototype.html`.
Run the existing preview server from the repository root with `node work/serve-astra.cjs`, then open `http://127.0.0.1:4317/ux/system/home-astra-prototype.html`.

## Agreed product decisions

- Daily workers need a view across sections and a detailed working scope within a section.
- A section chooser gives each section a concise workload summary. Selecting a section opens its Overview. Remember the last section.
- Overview groups work by task type, with separate batch/round identities, timing and progress.
- Unit selection narrows the task counts. Inspection is an entrance in the selected unit; there is no competing section-level inspection entrance.
- Support both a task sweep across units and moving between tasks within one unit.
- Keep task order stable. Important exceptions appear in a small attention area.
- Preserve Home / central Scan / Toolbox. Assistant opens from the Home header into a separate space.
- Overnight agent findings, decision requests and worker questions live inside Assistant. Home keeps the Assistant entrance without findings or decision-count badges, per the latest owner direction.
- Build on the detail studies' olive neutrals, type, control shapes and status semantics. Give Home its own composition without sacrificing legibility or action clarity.

## Prototype boundaries

This is a reviewable design, not a production integration. The original app skeleton and existing detail studies are unchanged.

- Four fictional sections; a quiet Nursery state; per-unit task counts.
- Pregnancy and heat-check sample records update both navigation paths in memory.
- Overview task entries open a whole-task summary with progress, a unit table and outcome/performance metrics. Unit rows open the work in that unit. Work pages offer another unit in the same task or another task in the current unit.
- Inspection entrance includes a sample pen note and a clearly labelled link to the existing independent Unit 7 study.
- Farrowing/other complex recording flows are handoffs, not replacements for established detail designs.
- Assistant conversations are explicitly simulated. A sample movement clarification can be answered; that removes the finding from Home and Assistant in the same session. No medical recommendation or live action is generated.
- Scan offers a sample tag lookup. Camera/NFC are not connected.
- Only the last-selected section preference is stored locally. Records, answers and conversations reset on reload.
- `?view=sections`, `?view=overview`, and `?view=unit` provide starting points; `?section=breeding|gestation|farrowing|nursery` selects a section.

The single agreed direction is intentional: this pass tests the settled navigation and visual brief rather than reopening the three earlier VI proposals.

## Second visual pass — owner screenshot feedback

- Desktop phone canvas is fixed at 390 × 844 CSS pixels. It no longer becomes a short phone when the desktop window is short; the surrounding study can scroll. Actual mobile layouts still use their viewport.
- Removed the repeated large unit title, decorative pen diagram and full-width inspection button panel. Unit context is now a 112-pixel strip: population, last-check time, inspection entrance, sensor readings and fault access.
- Current batch work stays in the task list. Upcoming batch/round information sits in a collapsed “Coming up in this unit” section to avoid duplicating the current tasks.
- Surfaced environmental and equipment context from the inspection design on Home. The independent inspection study is retained as a reference and has not been rewritten in this pass.
- Removed the large “Today's work” / “Work in this unit” titles, redundant batch-count headings and task-type icons. Reduced heading weight to 500 and numeric emphasis to 400; preserved action sizes.
- Replaced the route-card page with the supplied task-overview anatomy: whole-task progress, a unit table, and relevant metrics. Farrowing separates farrowed/active/awaiting and derives sample litter metrics. Check tasks show coverage and recorded outcomes from the same records as the unit screens.
- This prototype's summary footer navigates to a unit. Task-ending behavior stays in the existing detail study; it is not reimplemented here.

## What to review

### Work hierarchy and saved-work status

- One “Today's work” heading anchors the date. Task-type labels now sit inside their task cards, removing the disconnected Today/type heading stack.
- “Coming up” is a compact, softly bordered expandable card with the same corners and padding as nearby controls. Keyboard focus remains visible.
- A Saved work entrance replaces the unconditional “All records synced” footer. It distinguishes records saved on this device from records uploaded for the team, with a pending count and connection status.
- Pending uploads now appear at the top below the scope selector. The quiet all-uploaded status remains at the bottom. Agent findings no longer appear in this Home attention area or section chooser.
- Its drawer lists pending records, locations and save times. Upload/retry is explicit; the button is disabled during upload. Offline attempts and simulated upload failures retain the queue. Only a successful simulated completion clears it.
- The Connection preview selector outside the phone demonstrates no signal, connection restored, failed upload and all uploaded. This is an in-memory UI demonstration, not durable offline storage, connectivity detection or a live upload service; reload resets its sample queue. Existing detail pages do not feed this queue.
- Browser walkthrough verified offline retry retained three records, a failed upload retained all three, and reconnect/upload reached the empty-queue success state. JavaScript syntax validation passed.

### Unit navigation refinement

Replaced the horizontal unit tabs and icon-only browse button with a stable two-part scope control: Overview and Choose unit / selected unit. The owner clarified a maximum of around 15 units, so the picker has no search. It opens at medium height (460 px on the desktop phone, capped at 60% on smaller screens), with a fixed header and count above a vertically scrolling list of all units, including units with no tasks.

Units use compact single-column cards: white surfaces, thin neutral borders, 13 px corners and 9 px gaps, following the existing Inspection pen/record cards. Plain divider rows remain appropriate for actions and tabular information elsewhere. The selected unit has a muted green tint, border and checkmark. Each card shows task count, population and last check-in without bold numeric emphasis or decorative shadows. Selecting a unit updates the shareable URL; Overview remains one tap away. This supersedes both the earlier horizontal unit rail and searchable picker.

1. Whether the section summary gives enough information to choose where to work.
2. Whether task grouping is readable at realistic batch density.
3. Whether the selected unit feels like the same Home with a narrower scope.
4. Whether the Assistant is discoverable without dominating daily work.

## Verification

### Unit context, environment and maintenance — latest pass

This supersedes the earlier compact unit strip and retained Inspection summary. Unit Home owns population and last-check context, today's batch work, upcoming work, environment/device access and maintenance. Inspection owns the pen walk, animal observations and recording actions.

- Unit Home uses a quiet facts line, a white Inspect unit card, a muted environment card and a compact Maintenance row with an open-issue count.
- Inspection no longer repeats the unit summary, sensor readings or batch tracker. It retains a small unit identity beneath its title. Equipment badges, fault cards and maintenance actions have been removed from its active pen navigation and action menus.
- Sensor readings with no numeric data are omitted entirely. A unit without readings or devices has no environment entrance. Controllable devices are independent of readings, so an installed device can remain accessible without sensor data.
- Environment & devices has sensor chips, Today/7-day charts and expandable reading history. A sample ventilation fan offers Auto/Manual modes, a manual speed slider and an explicit Apply preview setting action. Device changes are disabled in the offline preview.
- Maintenance offers unit-scoped issue cards, reporting with a pen/location and resolving an issue. These changes update the unit's open count within the current preview session.
- Charts are illustrative sample history. Device settings and maintenance changes are held in memory; no equipment command, work order or server update is sent. Navigating to an independent detail study or reloading resets this sample state.

Browser verification covered sensor and period switching, offline controls, applying a sample manual fan speed, reporting/resolving an issue, the sensor-free Breeding Unit 1, and Inspection's simplified landing/pen details. Reviewed the unit and environment layouts. No browser errors were reported. Script syntax checks and all 39 existing surface/batch-tracker checks passed; the 35 surface checks were rerun after the final Inspection cleanup.

### Linked detail pages — current behavior

The owner requested reuse of existing designed pages. This supersedes the duplicate task overview, recording and inspection flows described in the earlier passes below.

- Farrowing from section Overview opens the existing `farrowing-astra-concept.html` whole-task overview. Its unit rows navigate through the original Farrowing experience.
- Farrowing from a selected unit opens that unit directly. Home's Farrowing sample now uses the existing study's Units 6–8 and 7/18 farrowed totals.
- Inspect unit opens `inspection-astra-concept.html` directly. Its existing pen, pig and action screens remain in use; the displayed unit follows the Home entrance.
- Back to Today restores the originating Home section and scope, including the exact unit. The initial whole-task overview Back also returns to Home; subsequent overview navigation inside Farrowing retains its native Back behavior.
- Pregnancy check, return-heat check, heat check, breeding and piglet processing have a minimal “Not designed yet” page. The substitute recording flows have been removed.
- Linked studies use the same 390 × 844 desktop phone dimensions and fill the viewport on mobile. Standalone study layouts are unaffected.
- These remain independent in-memory design fixtures: Inspection reuses its sample animals and batches for the selected unit, and records are not synchronized with Home or persisted across page navigation. Unit population and inspection fixture counts may therefore differ.

Browser checks covered the unfinished task placeholder, direct Farrowing overview, overview-to-Unit 8 navigation, direct Unit 8 task entry, Inspection and its pig/unit details, and return to the original overview/unit. No console errors were reported. Syntax checks passed for all changed scripts. The existing surface and batch-tracker checks passed (39 tests, run directly because the sandbox blocks the test runner's child processes).

### Earlier pass checks (superseded inner flows)

Browser walkthrough verified section switching, last-section restoration on a fresh base URL, the quiet Nursery state, section-to-task-to-unit navigation, a sample heat-check result updating the remaining count, both continuation choices, unit-scoped Home and inspection entrance, pen-note saving, sample scan lookup, contextual Assistant requests, and removal of an answered finding from both Home and Assistant. Reviewed the desktop composition and mobile layout. JavaScript syntax check passed; the browser reported no console errors during the walkthrough.

Second-pass verification: measured the phone at 390 × 844 and the unit strip at 112 pixels; opened the environmental details; verified table navigation into Unit 8; saved a recheck result and confirmed whole-task coverage changed from 8/20 to 9/20, the Unit 8 row from 4/8 to 5/8, and outcome counts from 0 to 1 recheck. Reviewed the three-status farrowing summary and derived performance metrics. No browser errors were reported.
