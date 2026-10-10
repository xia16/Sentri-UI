# Segment / FilterChips verification — 2026-10-10

The original frontier gate remains historical evidence; this pass addresses every finding without assigning human approval or inventing new judge scores.

| Checklist | Evidence |
|---|---|
| 1 Purpose + sibling | Both README purpose lines name the alternative. |
| 2 When / when not | Both documented; form outcomes point to ChoiceList. |
| 3 Anatomy | Track, label, count, selection cue, reason; all demonstrated. Filter IconButton belongs to host layout. |
| 4 Minimal variants | Segment lens, two-line lens, view switch, facet; FilterChips tags. Real callers cover each. |
| 5 States | Default, Pressed, Selected, Disabled with reason, Focus, Chinese long-label files. Error/loading belong to content; no asynchronous operation here. Empty option sets omit controls. |
| 6 Targets | Chromium at 390×844: component buttons at least 48×48; also checked visible phone buttons, links and editable inputs. Hidden upload inputs excluded; checkbox/radio targets are their wrapping rows. Inspection Clear selection corrected to tap-min. |
| 7 Choice cap | Segment 2–5; view switch 2–3; dynamic tags scroll. Ended sow death view omits its now single-option switch. |
| 8 Non-colour cues | Segment paper face and weight; chip check and weight; disabled dashed outline and reason. |
| 9 Content | Length, casing and wrapping rules; Chinese examples. No status ellipsis. |
| 10 Accessibility | Named group / radiogroup, selection ARIA, focus, arrows/Home/End, Enter/Space, skipped disabled options. Piglet keyboard walkthrough passed with focus restored after rendering. |
| 11 Tokens | Added CSS references existing tokens only; prototype selectors removed. |
| 12 Fields | Not a record input; optional-input law unchanged. |
| 13 Overlays | Not an overlay; host Sheet owns dismissal and positioning. |
| 14 Classification | Components, variants, adapter classification and related links documented. |
| 15 Runnable demos | Five standalone atlas-injected variant documents and previews; no phone scope or separately loaded icon registry required. |

Gate fixes: scope-dependent track and active face removed; 48px floor; view switches documented and migrated; TaskLens delegates to two-line Segment; TaskChips delegates to FilterChips; immediate press feedback, static focus examples, keyboard support and Chinese wrapping added. Owner instruction supersedes the old proposal prohibiting simultaneous lens and tags: Done is now a Segment state, job chips narrow To do.

Validation: `node --test ux/system/*.test.cjs tests/field-cards.test.mjs tests/candidates-2.test.mjs tests/selection-controls.test.mjs` — 132 passed. Existing assertions were retained; six source-only Inspection/system test setups now load the shared bundle. The new contract tests cover zero counts, disabled reasons, single selection and dynamic tag counts. Piglet `build.mjs` rebuilt dist/app.html. Chromium checked 115 atlas-linked prototype URLs and five variant documents with no page errors or undersized component targets; live Piglet Home/End and chip arrow selection passed. Visual inspection included facet states, scrolling/Chinese chips and the Piglet list.

No remaining owner-only product decision was introduced. Human approval / a new frontier judgment remains a separate workflow step; current status stays in-design.
