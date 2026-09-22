# Farrowing room — parity audit

Reference: `ux/system/farrowing.html`, section 09, with the shared controls in `ux/system/components.html` sections 01c and 02. The latest dated farrowing rulings and subsequent owner messages supersede older explanatory prose.

| Area | Reference requirement | Astra gap / direction |
| --- | --- | --- |
| Header | Task title, last record and hand, unit context | Restore last-record provenance and Unit 7; keep task instructions secondary |
| Overview | Unit live/litter KPI with target; task overview door | Restore a compact two-part strip and overview sheet; task counts derive from records, unit KPI retains the reference's sample 10 / target 12 |
| State tabs | Awaiting / Active / Done / All, with counts | Restore order and counts, update on first record and finish; preserve row location while its sheet is open |
| Filter | Funnel at end of tabs, applied count and summary, Reset / Show N | Missing. Old interval filter conflicts with newer no-interval guidance; owner clarification requested |
| Pen grouping | One header per pen; census; multiple sow rows; sticky header | Replace the two-sow placeholder with a coherent seven-sow example across four occupied pens |
| Awaiting | Due tomorrow/today/yesterday; overdue days; parity/last litter; optional induction history | Restore the due ladder; overdue colour ends when an actual count makes her Active |
| Active | Alive + dead; Born + newest record recency + hand; explicit ACTIVE | Restore explicit state without crowding the two fact lines |
| Done | Alive now + dead; fixed Born + final time/hand; edit glyph opens same record sheet | Restore the row's completion affordance; retain sow-ended example in Done per the newer farrowing contract |
| Bottom dock | Grid / current pen, wide Scan ear tag, Search | Missing. Restore as navigation, not batch actions |
| Pen picker | Full spatial map independent of filters; tap lands at pen; optional readonly long-press peek | Implement the shared navigation contract. Empty task pens remain identifiable |
| Hidden results | Filtered census n of m; empty pen headers remain; landing can reveal hidden work | Provide a local explanation and explicit Show action, without silently changing the current view |
| State changes | First event -> Active; finish -> Done; counts update immediately; avoid row movement under a working hand | Connect every sample row to its own existing farrowing state |

Existing accepted changes remain: Back discards unsaved Record dead entries without warning; the count-floor reminder replaces Saved for four seconds; finish timestamp/author live in At finish. The reference HTML remains unchanged.

The room is still a local prototype. Ear-tag scanning needs a device integration; show that limitation explicitly in the scanner demo rather than implying a working camera/scanner.

## Implemented and checked

The room now opens by default in the first Astra preview. Due timing is the provisional filter, following the newer no-interval rule; it can be revised independently if the owner chooses the older interval criterion. Filtering changes the current unit's state-tab match counts. Task overview aggregates every unit in the task, independently of the room filters.

Browser checks covered applied Overdue filtering and its count, a first count moving an overdue sow into Active, independent counts when switching between two sows, search by partial ear tag, and jumping to B4 under the Active lens. That jump pins B4 at the top (measured offset 0), explains its hidden sows and provides an explicit Show action. At a 360 CSS-pixel viewport, the page and grid have no horizontal overflow and dock controls remain 50 pixels tall. Model checks passed for first-event death, discarded unsaved death entries, count floor, lock gating, post-lock death, amendments and sow end.

The scanner is an explicitly labelled sample-tag demo. Long-press peek is optional; every occupied pen remains directly accessible by tap. These checks validate the prototype's behavior, not field usability with farm workers.

## Second refinement — navigation and emphasis

Owner feedback: the overview blended into the background, too much of the screen stayed fixed, status labels needed clearer emphasis, and the room lacked a back destination.

- The fixed app bar is now 56 px with Back and Farrowing. Unit 7 appears once in the scrolling overview rather than as a duplicate navigation door.
- Provenance, instructions and the white overview card scroll away. State/filter controls stick at the top of that scroll area (63 px without an applied-filter summary); pen headers stick directly beneath them. Switching state while scrolled keeps the overview collapsed.
- Active uses a soft green tag, Done a neutral tag, and Sow died a muted red tag. The tags are labels, not buttons.
- Go to pen pins the destination below the filters. Following owner feedback that the emphasis lingered, its tint and outline now rise briefly and fade within 900 ms, with no sustained hold or movement. Reduced-motion mode uses a brief static cue. The selected grid tile also has a quiet persistent fill.
- Back opens a minimal Today navigation preview containing the Farrowing return card. It preserves the room's lens, scroll position and in-memory records; it does not claim to implement the rest of the home application.

Browser checks confirmed the destination sits directly below the sticky filters, its emphasis expires, returning from Today restores B4 and the previous scroll position, and filtered-out pens still offer Show sows. At 360 CSS pixels, the page and list have no horizontal overflow, the dock stays within the phone, and state switching keeps filters pinned. Existing model checks still pass. The original reference's SHA-256 remains unchanged.

## Scope correction — Task overview

Owner clarification: Task overview represents the entire Farrowing task, not the current unit. The source task detail in `screens.html` labels its progress “whole task”; its old single-unit subtitle does not override this scope.

Both the overview door and its sheet now use one task aggregate, while the left KPI and room lenses remain scoped to Unit 7. The sheet has read-only totals, a by-unit breakdown, a task KPI and Back to Unit 7. Its progress figures no longer masquerade as controls that filter the current room.

Prototype-only fixtures: Unit 6 = 3 awaiting / 1 active / 4 done; Unit 8 = 2 / 0 / 2. Unit 7 derives counts from its live in-memory records. Initial whole-task totals are 9 / 2 / 8 = 19 sows, matching the reference's example totals. The task KPI remains illustrative (10, target 12); these are not connected farm data. Browser checks verified that an Overdue room filter leaves task totals unchanged, and a first count in Unit 7 changes whole-task totals to 8 / 3 / 8 while the other units remain unchanged.
