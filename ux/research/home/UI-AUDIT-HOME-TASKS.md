# Astra Home and task surfaces UI audit

Date: 2026-09-21  
Viewport used for app checks: the Home phone canvas (390 × 844 inside the study shell). The outer browser viewport was left unchanged. The task-card and standalone overview pages are study harnesses; their desktop study chrome was checked separately from the phone-sized app surface.

## Source inventory

| Surface | Source | State or entry point |
| --- | --- | --- |
| Home overview | `ux/system/home-astra-prototype.js` → `home()` | Overview, mixed work; task groups Today / Next / Closed; sync card |
| Section chooser | `sectionChooser()` | `?view=sections`; four section cards |
| Unit hub | `home()` with `state.unit` | `?view=unit&section=gestation&unit=7`; inspection, attention, environment, maintenance, unit tasks |
| Environment & devices | `environment()` | Sensor tabs, Today / 7 days, device Auto / Manual, offline disabled state |
| Maintenance | `maintenance()` | Open/resolved issue cards, Report issue |
| Toolbox | `toolbox()` | Maintenance, search, records, sections, assistant, study links |
| Records | `recordLog()` | Empty and populated sample log |
| Assistant | `assistant()` | Needs you / Conversations, finding, empty state, composer |
| Movement clarification | `finding()` | Missing destination form, saved answer, View Unit |
| Task placeholder | `placeholder()` | Open, ready-to-complete, completed, ended-early states; Farrowing hands off to `farrowing-astra-concept.html` |
| Saved work drawer | `showSync()` / `uploadPending()` | Offline pending, connected, uploading, retry/failure, fully synced |
| Unit picker drawer | `showUnits()` / `unitChoices()` | Unit list, selected unit, task counts |
| Scan drawer | `scan()` | Ear-tag input, sample tag, lookup form |
| Search drawer/results | `search()` / `lookup()` | Ear tag or pen search; matching rows and empty result |
| Maintenance drawers | `reportFault()` / `faultDetail()` | Report issue, open issue, resolved issue, resolve action |
| Task early-end drawer | event handler for `end-task-early` | Keep open, red destructive confirmation |
| Task card component | `task-cards-astra-prototype.html`, `task-cards-astra-prototype.js` | Component tab; 11 task types; scenario controls; whole-task and Unit 7 cards |
| Task examples | same gallery | Library tab; mixed, due, waiting, round-complete, ended, upcoming, overdue and undated state filters |
| Task rules | same gallery | Rules & sources tab; task-specific progress, time, priority and closure rules |
| Gallery dialog | gallery event handler | Task destination, Farrowing link, placeholder, ready-to-complete, early-end confirmation |
| Standalone overview study | `task-overview-astra-study.html`, `astra-task-overview.js/css` | Eight overview-card examples, 320 / 370 / 410 px card width, example dialog |

The gallery task catalog is: Pregnancy check, Heat check, Breeding, Return-heat check, Farrowing, Postpartum check, Piglet processing, Weaning check, Treatments (proposed), Vaccinations (proposed), and Pig transfer (proposed). Scenario generation covers due, due + overdue, rechecks, unit waiting, waiting, unit work finished, ready to complete, completed, ended early, plus task-specific farrowing, breeding, piglet, pregnancy, heat and return-heat variants.

## Browser-verified coverage

Verified in the hidden local CUA tab:

- Home section chooser (`?view=sections`) with all four sections and fixed bottom navigation.
- Home overview (`?view=overview&section=gestation`) with active, waiting, completed and saved-work states.
- Home ready-to-complete (`work=ready`) and its black Complete task footer action.
- Unit 7 hub (`?view=unit&section=gestation&unit=7`) with attention chips, missing-sensor-safe environment summary, task groups, and Coming up.
- Environment & devices with Temperature / Humidity / Ammonia tabs, chart period, offline disabled controls and fixed Back.
- Maintenance with open issue and Report equipment issue drawer.
- Toolbox with the shared `SentriUI.row` rows, study links and fixed Back.
- Assistant Needs you and Movement needs clarification pages.
- Unit picker, Saved work, Scan, Search, and Report equipment issue drawers, including their footer Back and primary action placement.
- Task placeholder open state and its single fixed-footer Back action after the hierarchy fix.
- Task gallery Component, Task examples, and Task rules tabs; every task type was selected and rendered (Pregnancy 9 scenarios, Heat 5, Breeding 12, Return-heat 6, Farrowing 10, Postpartum 8, Piglet 9, Weaning 7, Treatments 5, Vaccinations 7, Pig transfer 7). Every gallery state filter (mixed, due, waiting, round-complete, explicitly ended, upcoming, overdue, undated) rendered without overflow; Pregnancy due and ready scenarios also exercised the destination dialog and early-end confirmation.
- Gallery card title/context truncation styles, 44 px scenario chips, 44 px dialog close control, and black ready-to-complete action.
- Standalone task overview study with all eight examples, mobile-safe 44 px navigation/select/link targets, and the example dialog.

Source-only branches remain covered by inspection and are listed for follow-up: Records populated log, search matches/empty result, resolved maintenance detail, sync upload success/failure/retry, sensor selection and 7-day chart, Manual fan mode, Assistant conversation/answer saved/empty finding, completed and ended-early task cards, the Farrowing handoff route, all non-Pregnancy gallery task/scenario combinations, and all standalone card-width selections. These branches share the checked render/layout paths and preserve the existing state handlers; no additional browser mutation was needed to validate them.

## Fixes made

- Enforced one-line ellipsis for Home/task-card identity titles and context, and for Home navigation and information rows where the contract calls for title/subtitle truncation. The complete accessible button name remains intact.
- Moved the Home task placeholder Back into the fixed footer and removed the header Back. Open tasks now pair outlined Back with the task action; completed/ended read-only states expose a single full-width black Back.
- Set Home drawers to the white drawer canvas and retained tinted information panels for sync/warning content.
- Restored black treatment for enabled primary actions: saved-work upload, Home Complete task, and gallery Complete task. Destructive early-end actions remain red.
- Raised gallery scenario chips and task-dialog close controls to 44 px minimum touch targets.
- Raised standalone overview study navigation links, card-width select, and reference link to 44 px touch targets. This change applies to study controls only and does not alter the phone app interaction model.
- Bumped owned stylesheet cache keys in Home and the task gallery so these corrections load in static previews.

## Component decisions

Existing shared pieces were reused: `SentriUI.heading`, `SentriUI.panel`, `SentriUI.row`, and `SentriUI.log`; `SentriHomeTaskCard.render` remains the single Home/gallery card renderer; and `AstraTaskOverview.render` remains the standalone overview renderer. No new shared component API was needed. The only local additions are presentation constraints in the owned Home/card/study styles: ellipsis belongs to the row/card text container, touch sizing belongs to the local study controls, and the task placeholder is local because its lifecycle is owned by Home state/navigation.

## Validation and remaining gaps

Final parent integration check: task placeholders reuse the shared Home footer styling, with an 86 px outlined Back on the left and a 254 px task action on the right in the 390 px phone. Open and ready states were rechecked in the browser at 48 px button height; completed read-only state has one 352 px black Back. Header Back is omitted on these nested pages. All six test files subsequently passed when invoked directly (62 tests after the legacy log regression), resolving the subagent's test-launch limitation.

`node --check` passed for the edited Home, gallery, card and overview JavaScript files. `git diff --check` passed. The two existing Node test files could not start their child process in this managed Windows sandbox (`spawn EPERM`), so their result is environmental rather than an assertion failure. The live browser checks found no horizontal overflow in the checked phone surfaces and showed all checked app controls at or above 44 px.

Remaining product/design gaps are intentional source behavior: task-detail pages other than the existing Farrowing handoff are placeholders, sensor/device data and sync are simulations, and proposed Treatments/Vaccinations/Pig transfer rules remain explicitly marked proposed in the gallery. Those gaps were not expanded during this audit so task semantics, stage progress, missing-sensor hiding and sync simulations remain unchanged.
