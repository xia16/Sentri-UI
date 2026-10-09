# Button / IconButton verification — 2026-10-10

Branch: `45-button`. This is an implementation self-review; the original frontier-model gates remain historical evidence, with remediation links. It does not mark either component human-approved.

## Gate findings addressed

Button: component-owned `tap-min` targets; shared Button-based footer Back/text actions; visible linked waiting/disabled reasons; shared registry Piglet labels changed from Submit to Record (local strings already used Record); one Farrowing hold caption face; token colours, border and radius; Piglet tools and Farrowing toolbar tools use the tool register. The unused end-early skin is removed; the review entry uses secondary and the real terminal act remains a danger hold. Home's ready/early end actions also use the shared hold, preserving their existing record writes. Farrowing's timer/keyboard fork and TaskHold caption-restoration binding are retired.

IconButton: bordered / plain share square 48px geometry, pressed fill/movement, focus and labelled reasons. Sheet ✕ renders plain IconButton. Inspection, Home and Farrowing use the shared factory; their geometry/colour forks are removed. Header returns use bordered; Piglet breeder marks use plain with selected ARIA and a check.

## The standard's 15-line checklist

| Line | Result and evidence |
| --- | --- |
| 1 Purpose | Pass: one sentence and named alternative on both READMEs. |
| 2 When / when not | Pass: Button, IconButton, Row and ChoiceList alternatives named. |
| 3 Anatomy | Pass: container, label/glyph, optional icon/badge/reason; hold sweep and caption demonstrated. |
| 4 Variants | Pass: six Button variants and two IconButton variants; destructive is the real Farrowing Delete photo act; no end-early skin. |
| 5 States | Pass: all manifest states rendered; Hold has progress, keyboard, pending and terminal/failure states; async states live on Button. |
| 6 Targets | Pass: Chromium measured every visible button on 69 bare atlas screens and all eight variants, none under 48 × 48. Targets remain separate; state examples have token gutters. |
| 7 Choice cap | Pass: at most two footer actions; three mid-sheet tools; these execute actions rather than choose outcomes. |
| 8 Not colour-only | Pass: reasons for disabled/waiting, loading marker/caption, selected mark check and ARIA. |
| 9 Content | Pass: writing budgets, sentence case, verb registry meanings and complete wrapped Chinese example. No act label ellipses. |
| 10 Accessibility | Pass: native buttons, decorative glyphs, status links, focus ring, keyboard hold path and cancellation. |
| 11 Tokens | Pass: shared colours, tap geometry, radii and type sizes use existing tokens; removed screen colour/geometry forks. Hold motion reads the existing hold tokens. |
| 12 Fields | Not applicable: field validation stays on the field; optional inputs remain optional rows. |
| 13 Overlays | Not applicable to these controls; Sheet supplies its shared plain Close and Back. |
| 14 Related / classification | Pass: related-component tables; generic components, variants and footer composition clearly classified; TaskHold retirement documented. |
| 15 Rendered proof | Pass: full state sheets at 375px in [Button proof](proof/) and [IconButton proof](../IconButton/proof/), with no horizontal overflow or clipped labels. |

Browser checks can be reproduced with [check-button-components.cjs](../../../../scripts/check-button-components.cjs) after starting `scripts/serve-ux.cjs`; `SENTRI_PLAYWRIGHT` can point to an installed Playwright package.

## Automated and rendered checks

- `node --test ux/system/*.test.cjs tests/candidates-2.test.mjs tests/field-cards.test.mjs tests/ledger.test.mjs`: **304 passed**. Sheet assertions that required standalone Close/Back markup now require the shared IconButton/Button classes; no behavioural assertions were weakened.
- Piglet `build.mjs`: rebuilt and committed `simple/dist/app.html` from the final bundle.
- Playwright / Chromium: **69 atlas screens**, each opened at its exact atlas URL plus `screen=<id>`, 390 × 844; **8 variant documents** at 375px with tokens/bundle injected; **both previews** load. No application console errors, undersized visible button targets or horizontal overflow. External Google font requests were blocked for deterministic offline checks; the token font stack supplies fallback fonts.
- Actual Farrowing and Home interaction: short pointer hold cancels; Enter arms then a second Enter commits; Home ready-task keyboard confirmation commits only after arming; receipt replay holds to completion without errors.
- Original gate scores/status are preserved; component approval still belongs to the owner. Existing waiting/hold candidate-token status is unchanged; recommendation: approve these unified variants after owner visual review.
