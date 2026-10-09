# Implementation verification — 2026-10-10

Branch: `45-stepper-field`. Self-review against component-standard.md §5; this does not replace the historical frontier-model judgment or owner approval.

| # | Checklist | Result / evidence |
| --- | --- | --- |
| 1 | Purpose | Pass — Purpose sentence and sibling alternative appear first. |
| 2 | When / when not | Pass — Both sections name existing alternatives. |
| 3 | Anatomy | Pass — Named parts; default and floor examples include description, status and pointer actions; Field includes help and errors. |
| 4 | Variants | Pass — Stepper: row/count/well. Field: text/number/textarea. Actual prototype adopters are named. |
| 5 | States | Pass — Each manifest state has its own data-state example; disabled shows a reason. Selection is inapplicable; submission loading belongs to Button for Field. |
| 6 | Targets | Pass — Chromium at 390×844: all six variants and visible controls on 15 atlas screens meet the 48px floor, without overlap. |
| 7 | Cap | Pass — Stepper documents at most seven rows in a scrollable drawer, one count/well per sheet. Field is not a chooser. |
| 8 | Non-colour cues | Pass — Draft +n unsaved, Corrected, Saving…, bound/disabled explanations, and visible corrective errors accompany colour. |
| 9 | Content | Pass — Sentence case, length budgets, units and wrapping documented; Chinese labels rendered without clipping. |
| 10 | Accessibility | Pass — Native label association; persistent described help/errors; spinbutton min/max/now, labelled keys, keyboard delta requests and focus rings. |
| 11 | Tokens | Pass — Component sizes, colours and fonts resolve to tokens. field-height and control-height already equal 48px; no token edit was needed. |
| 12 | Form fields | Pass — Visible labels, persistent help, corrective error text, decimal inputmode, sans auto-grow textarea and optional reveal pattern. |
| 13 | Overlays | Pass — Neither component owns an overlay. Hosts retain Sheet and their existing navigation/exit policy. |
| 14 | Related / classification | Pass — Related component links, component/variant/pattern distinctions and compatibility policy documented. |
| 15 | Rendered proof | Pass — 54 committed screenshots under proof/ show all manifest states at 375px. Separate 390px checks found no horizontal overflow or console/page errors. |

## Tests

`node --test ux/system/*.test.cjs tests/field-cards.test.mjs tests/selection-controls.test.mjs tests/picker-choice.test.mjs tests/candidates-2.test.mjs tests/stepper-field.test.mjs` — **153 passed, 0 failed**. No existing test assertions changed. New regressions cover preserving ARIA help links, corrective messages, disabled reasons, draft/correction words the host delta event contract, and keyboard focus after host remounts.

`node ux/tasks/piglet-processing/simple/build.mjs` rebuilt dist/app.html. Node syntax checks and git diff --check pass. Numpad and Measure implementations remain untouched.

## Chromium

All six variants loaded in a page with tokens.css, bundle.css and bundle.js; each manifest state was captured at 375px. At 390×844, no overflow, console/page errors or undersized component targets. The `proof/` PNG files are the per-state evidence. Both previews also run under the same injected assets.

Bare atlas screens checked at 390×844: farrowing.count, death, finish, edit, born, edit-finished; piglet-processing.counts, record-death, adjust-count, move-piglets, set-count; health-record.treatment, edit-finding; inspection.pen-note; pig-profile.note. Visible button/native text-control/spinbutton targets meet 48px. Inert backgrounds, hidden optional editors and visual radio/checkbox glyphs are excluded as independent targets; their enclosing controls own the tap.

An extended audit also opened all **115 reachable atlas URLs** for Home, Farrowing, Inspection and Piglet processing. Every URL became atlas-ready, with no console/page errors and no undersized visible button/native text-control/spinbutton targets. This includes 18 screens containing Fields and 13 containing Steppers. The reachability caveats below still apply to entries that do not replay into their named form.

Additional manual checks opened Farrowing foster and reconcile through their existing actions (well variants), and Home's report-equipment form (three Fields). Repeated ArrowUp / ArrowDown on Farrowing's spinbutton changed 9 → 11 → 10 through the same host delta handler and kept focus on the spinbutton across complete sheet re-renders. Home lookup, scan and clarification Fields and Farrowing's optional Other-cause detail were also checked manually. Error Fields injected into Farrowing, Inspection and Home hosts compute the red token border (`rgb(161, 58, 45)`), show corrective text and aria-describedby, and have a ≥48px input. Textareas compute the sans font, resize:none and field-sizing:content.

## Atlas limitations and owner decisions

Inspection's fault-resolve entry is a placeholder without a URL or an opening control, so it cannot be visited through a bare atlas URL. Its optional-note factory and the shared Field skin were verified. Home's report-issue atlas entry has no replay steps and opens the unit screen; its actual form was checked by invoking the existing report-fault action. These pre-existing reachability gaps are outside the component pass.

The count variant uses neutral outlined keys. Owner decision: whether a count + may use semantic green; recommend keeping neutral keys consistent across variants until decided. The Numpad / Measure split is explicitly deferred; recommend a separate owner decision and pass. No split was implemented.
