# Rules ledger

The bottom of the ladder ([principles.md](principles.md#the-ladder-rules-become-principles)). Every defect a trial, an audit, a retro or the owner finds is entered here, under the principle it broke, with the incident it came from. It is never written into a brief. A rule leaves by being **absorbed** (the principle's wording now covers it) or **automated** (a check enforces it and the principle's "checked by" names it). This ledger is meant to empty.

Consolidate a principle when it has three open rules or the same failure twice, and at every map close.

**Consolidation 1 (2026-10-12, P2: L3, L11, L15 open).** L3 automated as the gate's known-reach check; L15 absorbed into P2's wording; L11 stays open to automate with L10 (it needs the derived "used by").

**Next: consolidation 2 (P5: L8, L9, L10, L14 open).** All four are automations; they land as checks before the next trial.

## Open

| # | Principle | Rule | From | Exit |
|---|---|---|---|---|
| L8 | P5 | A screen's notes are checked against the rendered screen: when a screen's pixels change its notes are flagged, and every string the notes quote must appear in the rendered text. | Animal-row propagation audit (#113, #138), 2026-10-12: notes quoted text the screens no longer show | Automate: atlas build or gate. |
| L9 | P5 | Changing a component variant resets its score to "in design" until it is judged again. | Same audit: scores survived changes to the component | Automate: a source-hash guard test per variant. |
| L10 | P5 | "Used by" is derived, not kept by hand. | Same audit: hand-kept "used by" lists missed users | Automate: derive it at atlas build from the screens that actually render the component. |
| L14 | P5 | The builder's own self-check finishes in minutes, so it is run and seen: a builder twice abandoned a gate run after an hour and never saw a styling failure. | Environment trial 6 (2026-10-12); the runs were competing with the driver's gate on one machine | Automate: a fast reach mode that shoots only the features that load the changed files; one gate run per machine at a time. |
| L11 | P2 | A component change lists every screen, pattern (e.g. the task skeleton) and demo that uses it; each is updated or marked "until migrated", and repropagation runs on every change, not only at freeze. | Same audit: patterns weren't counted as users; the approved row reached 7 places and missed 7 | Automate: the gate prints the reach list from L10 and fails a user that is neither updated nor marked. |

## Closed

| # | Principle | Rule | From | Exit |
|---|---|---|---|---|
| L3 | P2 | A change scoped to one feature that moves another feature's screen fails, rather than being escalated to a shared change. | Environment trial 4: a shared token changed for one screen moved 60 screens in ten features (2026-10-12) | Automated: `gate.mjs` "known reach: only SCOPE moved (P2)" (consolidation 1, 2026-10-12). |
| L15 | P2 | The driver's crit rounds stay inside SCOPE too. | Environment trial 6: the driver asked for the PREVIEW badge to go from Assistant and Maintenance headers; screens outside SCOPE moved (2026-10-12) | Absorbed into P2 ("binds everyone who touches the change"), consolidation 1. |
| L1 | P4 | The last look is at the pushed head after the last edit, at 390 and 360. | Trial 2: a badge raised after the crit wrapped the title (2026-10-12) | Absorbed into P4. |
| L2 | P2 | A check that fails a kept part is questioned, not obeyed. | Trial 3: segmented controls turned into pills to satisfy check-states rule b (2026-10-12) | Absorbed into P2; rule b narrowed (#131). |
| L4 | P1 | Designs start from the house references (Home, Unit, More actions, Farrowing room). | Owner, 2026-10-12 | Absorbed into P1 (#133). |
| L5 | P1 | Name the existing component whose job each part is before building a new one. | Trials 2–4: reading history kept as a web table (Log's job); new components named differently each run | Absorbed into P1; `scripts/component-jobs.mjs` (#133). |
| L6 | P6 | Owner decisions arrive as rendered, lettered boards, never a text question. | Owner, 2026-10-12 | Absorbed into P6. |
| L7 | P1 | Prototype chrome (PREVIEW badges, sample-data lines) is not product and is not designed. | Owner, 2026-10-12 | Absorbed into P1; the badge removed (#137). |
| L12 | P2 | Keep the before/after pixel check against main on every shared-component change. | The audit's success: it caught the Piglet processing regression before merge | Already automated: the gate's screen diff on every screen. |
| L13 | P3 | Act-now means something to do; weight follows the worker's questions; cut before you enlarge. | Environment trial 1 and the type pass (#120, #122, #125) | Absorbed into P3. |
