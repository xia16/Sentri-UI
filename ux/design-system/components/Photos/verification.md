# Component pass verification · 2026-10-10

Original frontier-model findings remain in `gate.json` as the review history; this records the implementation fixes and self-check, not new model scores or owner approval.

## Gate resolutions

Banner: TaskWarning and the Home offline box now delegate to one Banner. Danger / correction / notice and the whole-box door are implemented. Text actions use control-height and a minimum tap-min width; summaries use tap-min. Cleared + Undo is rendered and exercised in Farrowing for 5 seconds. Fine borders use border-width; all new styles use tokens. Headline is capped at one line; Chinese overflow is rendered. TaskWarning CSS, Farrowing's danger/door/correction copies and Home's sync-card styles are removed. Inspection's consequence boxes use Banner.

Photos: the unused well/circle face and TaskPhotos CSS are retired. One padded line uses the existing optionalRow with a choice-label label and muted Optional. The trailing camera region and row meet the glove floor. Count and pending status are derived without repeated copy. Adding, permission denial, too-large, pressed, focus, disabled with reason, full and Chinese states render. Farrowing death and piglet mortality use Photos, with capture/viewer focus return. Farrowing already uses optional rows for litter weight; there are no weight pills to migrate. Measure on Give IDs remains unchanged as explicitly scoped by the owner.

## Section 5 checklist

| Line | Result / evidence |
| --- | --- |
| 1 Purpose | Pass: one-sentence purpose plus named sibling alternative |
| 2 When / when not | Pass: operational scope and named alternatives |
| 3 Anatomy | Pass: named optional parts; rendered state documents |
| 4 Minimal variants | Pass: three Banner tones used by Home, Farrowing, Inspection and Piglet processing; one Photos line used by Farrowing |
| 5 States | Pass: variants.json and each isolated state render; no selection state because neither is selectable |
| 6 Target size | Pass: Chromium measures every visible target in states and 69 bare atlas screens; all ≥48px (native checkbox/radio hit area includes its label) |
| 7 Choice cap | Pass: at most two Banner text actions; Photos maximum 12, shown in Full |
| 8 Beyond colour | Pass: leading words/icons, explicit errors, visible disabled reasons and dashed camera/door border |
| 9 Content | Pass: casing, lengths, one-line Banner ellipsis and wrapping Photos Chinese examples |
| 10 Accessibility | Pass: native button keyboard operation, visible focus, labelled thumbnails, linked hints, live summary; interactive focus return checked |
| 11 Tokens | Pass: all Banner/Photos dimensional, font-size and colour styles resolve to tokens; variable lists in READMEs |
| 12 Fields | Pass: visible Photos label, persistent hint, registered actionable errors, camera-first image capture |
| 13 Overlays | Pass / host contract: Banner/Photos create no overlay; viewers use Sheet, visible Back and draft-only Delete |
| 14 Classification | Pass: generic components, links to related components and retired task aliases |
| 15 Rendered proof | Pass: every state has a 375px screenshot under proof/; no page overflow; both atlas-injected previews work |

## Checks

- `node --test ux/system/*.test.cjs tests/{banner-photos,candidates-2,field-cards,picker-choice,row-family,selection-controls}.test.mjs`: 160 passed. No existing test assertions changed; five regression tests added for adapter identity, localized slots/counts, door nesting and disabled/error precedence.
- `node ux/tasks/piglet-processing/simple/build.mjs`: rebuilt dist/app.html.
- Chromium: 33 isolated variant states at 375px; 69 bare atlas screens at 390×844; two atlas-injected previews; zero console/page errors, overflow in the state documents, or undersized effective targets. Interactive checks cover Home saved-work door, Farrowing correction review, Clear/Undo, five-second expiry focus, photo capture/viewer and focus return.
- Reproduce: start `node scripts/serve-ux.cjs 4310`, then `SENTRI_PLAYWRIGHT=<installed module path> node scripts/check-banner-photos.cjs`. JSON report is [Banner proof/report.json](../Banner/proof/report.json). Screenshots are in each component's proof/ directory.

Owner decision: the Give IDs Measure / Numpad split remains undecided. Recommendation: decide it in the Measure/Numpad family pass; this pass leaves that control intact.
