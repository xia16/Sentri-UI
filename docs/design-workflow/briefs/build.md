# Build brief

You design and build a screen, a feature or a component family for **Sentri-UI**. Sentri is a native-feel mobile app for gloved, one-handed pig-farm workers, in English and Chinese. You make the design calls yourself and build them well; the owner reacts afterwards. Work on your own branch in a worktree off `origin/main`. Never commit to `main`.

The driver fills in: **TITLE**, **SCOPE**, **CHANGE CLASS** (copy · presentation · behaviour · shared component) and **MODE** (new · polish · refactor). Every build gets this whole brief, including a narrow pass (type sizes, legibility, copy). A one-off instruction is added to it and never replaces it.

## How a run succeeds

The first design you hand over must be **clearly better than the screen it replaces**, side by side at 390px. Inside your run you may try as many times as you like; nobody sees your drafts. What leaves your hands is judged once, and a design that isn't clearly better is a failed run. When no direction beats the original, hand over **no change** with your critique: an honest "the original stands" beats a worse screen.

You work the way a senior product designer works on a screen someone else made:

1. **References** (§1): what exists for the job, and the baselines.
2. **Critique** (§1a): what the original does well (keep), what is broken (problems, with evidence), and what draws each part.
3. **Budget** (§1b): what the worker needs, in order, and what to cut.
4. **Extract** (§1c): a part worth keeping that the page hand-builds moves into the design system looking exactly as it does, before you change anything.
5. **Directions and self-crit** (§1d): two or three directions in real components, each put beside the original and criticised, iterated until one is clearly better.
6. **Deliver and verify** (§4, §5).

The size of the change follows the problems. A screen with two broken things gets two fixes, not a new layout. A redesign is earned by a problem list that a fix can't answer.

## Read first

- `docs/design-workflow/README.md`: owner rules, gates, who decides.
- `docs/design-workflow/taste.md`: the owner's eye, what good looks like here and what was rejected.
- `ux/design-system/README.md`: the laws (copy, colour, type, space, record-sheet law, optional inputs are optional rows). Also `tokens.json`/`tokens.css` and `IMPLEMENTATIONS.md`: one implementation in `components/bundle.js` + `bundle.css`, namespace `SentriUI`. Never edit the retired `ux/system/sentri-components.*`.
- `docs/design-workflow/research/component-standard.md`: page anatomy, the component/variant/pattern rule and per-type states.
- `docs/design-workflow/GLOSSARY.md` and `atlas/SCHEMA.md`.
- For a component: `ux/design-system/components/<Name>/README.md`, `preview.html`, `variants.json` and `gate.json`. Fix every open finding.

## 1. References

Do this before you draw anything. A new design built without looking at the old one is how a filter came out far worse than the one it replaced.

1. **Live screens of this job**: find every screen in `atlas/atlas.json` that does this job, in this feature and in its neighbours (same section, entry points, "adds to"). Search the prototypes (`ux/system/*-astra-*.js`, `ux/tasks/*/`) for hand-built copies of the job.
2. **The old UI**: look the job up in `references/figma/index.json` (and `index.md`) and note the file, the flow and the node.
3. **What's approved**: approved screens, components and variants (status `approved` / `set`), and the section patterns (`sections/`, e.g. the Task skeleton or the Home task card) that already cover the job.
4. **Ask the engineer** if the job exists in the live app and isn't in the repo.
5. **Capture baselines**: open each screen bare at 390×844 (`<screen url>&screen=<id>`, see `atlas/SCHEMA.md`) on `origin/main` and save one screenshot per screen. Record the commit.
6. **Write it into the brief or PR body** as a table: job · where it exists today · status · baseline screenshot · commit. The gate compares against these.

If something approved already does the job, start from it. You may improve it ([Room to design](../README.md#room-to-design)). When the job is only adequate, sketch at least one alternative that departs from the current pattern before you pick, and build the one that serves the farmer best. A shared component changes only by improving a feature.

## 1a. Critique the original (before the budget)

Do this before the budget and before you draw. Read [the owner's eye](../taste.md) first: what good looks like here and the three ways earlier passes lost (cluttered, flat, bulky). Then look at your baselines at 390px, beside an approved screen (Farrowing), and at the calibration pairs in `docs/design-workflow/calibration/`. Write **`features/<id>/critique.md`** and commit it before any screen change; the gate refuses screen changes without it. It has `## Keep`, `## Problems` and `## Parts`, written now, and `## Self-crit`, written in §1d:

- **`## Keep`**: what the original does well, named element by element, with why it works (e.g. "the 34px reading is the first thing the eye lands on: it answers 'is the room OK?'"). A designer keeps what works. A kept element survives at least as strong as it was: same or more weight, same position in the order. It changes only when a problem below names it.
- **`## Problems`**: what is broken, each with its evidence: a check's output (`check-legibility`, `check-states`), an owner rule or rejected example it breaks, or a worker question it fails to answer, with the element named. Mark each **major** (the worker misreads, can't act, or can't read it in the barn) or **minor**. Taste without evidence is not a problem.
- **`## Parts`**: every visible part of the screen, what draws it (a SentriUI component by name, or "page-built" with its file) and whether you keep it, fix it or cut it.

**Scope follows the critique.** In **polish** mode you change only the parts a problem names; everything else stays as it is. In **new** mode the critique is of the old UI and its closest live screens, and the keep-list says what the new design must carry over. If the problems are all minor, make the minor fixes and stop.

## 1b. Attention budget (before any layout)

Do this for every new or changed list, card or screen, before you draw, and **write it to `features/<id>/budget.md` and commit it before any layout**. It has three sections, `## Inventory`, `## Questions` and `## Levels` (then the budget and the cut list); the gate refuses screen changes for a feature without it. Don't decide the layout until the budget is written: the layout comes from the levels, not the other way round. That includes a pass that only raises sizes: bigger type leaves room for fewer facts, so **cut first, then enlarge**. A screen that meets the floors by enlarging everything it had is rejected (R14). Attention is scarcer than pixels: every fact you show takes attention from the others, and a list where every row looks busy teaches the worker to stop looking. The budget decides what *not* to show.

1. **Inventory.** List every fact the screen could show, for each item and each state, and for every feature that reuses the pattern. Be exhaustive; cut nothing yet.
2. **The worker's questions.** Write the questions the worker asks at that moment of the job, in the order they ask them. For a barn list: where am I? Does anything here need me? What do I do? Is this the right animal? Does anything change how I do it? Who did it, and when?
3. **Attention levels.** Give each fact one level:
   - **Act now:** something the worker must *do* now; the only thing allowed to be loud. A state that changes how facts read (offline, stale, sample data) is not act-now: it sits quietly beside the facts it qualifies.
   - **Watch:** in progress.
   - **Coming up:** plan for it.
   - **Settled:** reference only, visually quiet.
   - **Audit:** who and when; smallest and quietest.

   A fact that answers none of the worker's questions at that moment is cut, or moved to the detail screen.
4. **Budget against real space.** Use real volumes (24 crates, 32 pigs in a pen, 6 pens in a room) with the real header and bottom bar. The limits:
   - at most one coloured element per row;
   - a second line only when it changes what the worker does;
   - nothing the header already says;
   - no zeros;
   - no derived figure beside its parts (born = alive + dead).

   **Weight follows the questions.** The answer to the worker's first question about the job is the largest, heaviest thing on the screen; the next answers are progressively quieter. The levels never override that order.

5. **The cut list.** Write down what was removed and why, in the PR body. It is the proof this step happened.
6. **Rebuild the hierarchy.** Cutting facts never cuts structure. Sections keep their native headings. Each attention level gets its own visual weight, and a screen has one heavy control at most: the one the worker acts on. Then do the **squint test**: blur the screenshot, or step back, and write the first three things the eye lands on. They must be the answers to the worker's first three questions, in order. Calmer but flat is rejected (R15). Put the three in the PR body.
7. **Design it, don't rearrange it.** After the budget, compose the screen in the approved screens' language: grouped sections with native headers, every row inside a group, the page ending on a group. Information stacked on a page is rejected (R16).

On an existing screen the budget works inside the critique: it decides what the problem parts show and what to cut. It never overrides the keep-list without a problem behind it.

Worked example, the Farrowing room row:

| Level | Shown |
|---|---|
| Act now | "3 days overdue", "7 to allocate": a dark-red dot and a bold dark-red message |
| Watch | "Farrowing now · 9 alive · 5 dead", with the last record time |
| Coming up | "Due today · P2" |
| Settled | "11 alive · 2 dead" in grey, with a small "05:58 · G.H" |
| Cut | born N, "Done" where the counts already show it, the pencil, chips, zeros, the stage on every row |

## 1c. Extract before you change

Do this after the budget, so you don't extract what you are about to cut. The owner's rule is design-system components only, and many live screens were built before it, by hand in the page's own CSS. Never "comply" by tearing a working part down and redrawing it from a generic component that looks different: a Segment is not a reading, and a hand-drawn chart is not replaced by a list. That is how a run throws away the screen's best parts.

For each page-built part on the keep-list, or one a problem asks you to change:

1. **Extract it as it is.** Build it in the design system (`bundle.js` / `bundle.css`, a README and its variants) from the page's current markup and look, in tokens. Point the page at it and delete the page's styling for it.
2. **Prove identity.** Render the screen before and after the extraction (`node scripts/shoot-screens.mjs`, or Playwright at 390×844). They must match; commit the extraction on its own.
3. **Then improve it**, in the component, and only where a problem names it.

A part a component already draws stays on that component; improve the component (or add a variant) rather than restyling it on the page. Never leave a workaround on the page: the gate fails added `ds-exception` lines and additions to `_proposed.json` in a screen change.

## 1d. Directions and self-crit (before you hand over)

1. **Directions.** Build two or three directions in real components, each answering the problem list. In polish mode they differ only in the problem parts. Keep them cheap: a direction is a render, not a finished build.
2. **Put each beside the original.** Render it at 390×844 in EN next to the baseline, the same size, the same state: `node scripts/shoot-screens.mjs <scratch>/<direction> --screens <ids> --widths 390 --langs en` on your branch, and the same on an `origin/main` worktree for the baseline. Open both images and look at them; a design you haven't seen rendered isn't criticised. Look at the pair as the owner will: the whole screen, at a glance, before reading any text.
3. **Criticise it in writing**, in `## Self-crit` in `critique.md`, one block per direction and round:
   - each problem: fixed or not;
   - each keep item: as strong as before or not;
   - the squint test: the first three things the eye lands on, and the worker's first three questions;
   - [the owner's eye](../taste.md): is it more cluttered (c1: everything bigger), flatter (c2: structure removed) or bulkier (c3: more boxes, bold and size) than the original? Is there one light hero per group with small quiet support?
   - does it look like the same product as the approved screens, at their level of finish?
   - the rejected examples (gate.md, R1–R16) it could show;
   - one line: **better because …** or **not better because …**.
4. **Iterate.** Fix what the crit found, re-render and criticise again. Keep going while each round gets closer; drop a direction that doesn't.
5. **Decide.** Hand over the direction whose crit is clean on every point. If none is clearly better than the original, reset the screens to `origin/main`, keep `critique.md`, and report **no change** with the reason. Never hand over a direction you called "not better", and never compare directions only with each other.
6. **The final look.** Any edit after a crit voids it, however small: a badge raised from 9 to 11px once wrapped the page title onto two lines, and nobody saw it. The last thing you do, after the last commit and the merge of main, is render every screen in scope from the pushed head at 390 **and** 360, open each beside its baseline, and look at the whole screen: header, wrapping, what moved down the page. Write it as the last `## Self-crit` block, headed `Final look` and naming the commit it rendered. If anything got worse, fix it and look again.

## 2. Owner rules (binding)

- **Design-system components only.** Build the screen from the SentriUI components in `ux/design-system/components/` (bundle.js / bundle.css; their READMEs say when to use each). The page's own CSS sets layout only: margin, padding, gap, grid, flex, size, position. Never colour, borders, radius, shadow, type or a selection mark: the gate fails any such declaration added outside `ux/design-system`. When no component fits, build it in the design system as part of this change, from this feature's need: `bundle.js` / `bundle.css`, a README and its variants, in the language of the approved screens. Never press another component into a job it isn't for (a control is not a display), never style one on the page, and never ship a workaround beside a proposal: the gate fails a screen change that adds to `_proposed.json`.
- **A narrow pass changes only what's broken.** A type, legibility, defect or polish pass fixes the problems in its critique and nothing else (§1a). A redesign happens only when the task asks for one, or the critique earns it.
- **Farm legibility (binding).** Barn, glare, gloves, arm's length, two seconds. Text a worker reads to act on (control labels, acted-on values, row titles, warnings) ≥ 13px; quiet descriptive text (labels, units, timestamps, axes, who/when) may be 11px; nothing under 11px except the phone status bar. Size follows hierarchy; never enlarge text just to clear a floor. Contrast ≥ 4.5:1 for all text and ≥ 7:1 for primary values and numbers a farmer acts on. Tap targets ≥ 48×48 (the control or an invisible hit area). Ink, not pale grey, for anything that must be read. Fix crowding by tightening copy and layout, never by shrinking type. Full law: `ux/design-system/README.md`, "The farm legibility law".
- **Platform first, touch only.** States: Default, Pressed, Selected/Checked, Disabled, Error, Loading/Waiting, Empty, Long label / Chinese, whichever apply. No designed Hover, Focus or keyboard rows. Accessibility: screen-reader role, name and state; reading order matches visual order; no gesture-only action; targets ≥ 48px (`tap-min`).
- **Components come from real features.** Start from the approved screen and reproduce it, then improve only where it makes the feature better. A component is generic or used by 2+ sections. The same job with a different look is a **variant**, never a copy. One implementation.
- **Beat what you replace.** Compare against your baselines at 390px. If yours isn't clearly better, keep the original. In **refactor** mode nothing visible may change.
- **Copy fits the component.** Labels we write stay inside the copy budget in EN and ZH, with verbs from `ux/laws/strings.json` (one meaning per verb). Real data (medicine names, ear tags, farm names) is never shortened. State how it wraps and show the full value.
- **Drawers.** Footer **Back** leaves and keeps the draft. **‹ Parent** goes up a level. No ✕. **Done** applies. **Reset** for filters, **Clear** for input.
- **No reason line above a disabled button.**
- **Green means approved or done only.** Colour only where it means something.
- **No cards on cards.** One surface; only items are boxes. **Information budget**: nothing said twice; rank what the farmer needs first; extra detail goes behind a link or count.
- **Don't decide product rules.** Calculations, eligibility, defaults, what gets saved, permissions, corrections and which actions exist belong to the owner. Build to the current ruling. If a ruling is missing, file a decision item with options and a recommendation.

## 3. Atlas rules (for anything the atlas renders)

- **Previews render directly.** `preview.html` and `variants/*.html` call `SentriUI.*` directly. Don't link tokens, bundle or fonts (the atlas injects them). Don't use `new URL(relative)` (the atlas runs them in a srcdoc iframe), and don't nest your own iframe.
- **Variant scripts iterate `[data-state]`.** Each top-level element carries `data-state="<State>"` and renders one state. Scripts draw by `document.querySelectorAll('[data-state]')` or from `document.currentScript.parentElement`, never by looking up one named state.
- **Tokens only.** No raw hex or px in component CSS.
- **Specimens sit in their real container.** A picker trigger sits in its form row, and a sheet's search sits in a sheet. Never stack a specimen loose beside unrelated parts.
- **No stress-test copy.** Specimens use real Sentri words and data. Show long data the way real data is long, not invented long labels.
- **`atlas/atlas.json` is generated.** Edit the sources, then run `npm run atlas`.

## 4. Deliver (commit all of it)

For a feature or screen, deliver the screens, each one's notes (only what the demo can't show: states tables, hidden logic, interaction rules, edge cases), and the `feature.json` entries.

For a component, deliver:
1. `components/<Name>/variants.json`: `[{ "id", "name", "use", "notUse", "states": [...] }]`. Keep it to the smallest set that covers real Sentri screens.
2. `components/<Name>/variants/<id>.html` per variant, with every state that applies.
3. A `README.md` in the standard's anatomy: purpose, when / when not, anatomy, variants, states, behaviour, content and wrapping rules, accessibility, do / don't, related, classification.
4. The implementation in `bundle.js` + `bundle.css` (+ `index.d.ts`). Keep call signatures working or update every caller.
5. Migrate every prototype that hand-builds this job onto the component, and delete the copies. Rebuild any generated prototype (e.g. `ux/tasks/piglet-processing/simple/build.mjs`).

## 5. Verify before you hand to the gate

Two tiers: run the mechanical checks after each edit (`node scripts/check-states.mjs`, `node scripts/check-legibility.mjs --feature <id>`); they say nothing when clean. Judgement happens once, at the gate, by someone else.

- Run `npm test` and `npm run check`. Both pass. Run `node scripts/check-legibility.mjs --changed <your screen ids> --compare <a server on origin/main>`: it exits non-zero if a screen you touched is worse than on main (or, once the README says `strict`, breaks the law at all). Never make it worse; aim to meet the floors. Change a test only when it asserted the old structure, and say so.
- Run `npm run ux` and open every changed screen bare at 390×844 and 360×800, in EN and ZH. Check for no console errors and targets ≥ 48px, and take after-screenshots on the same states as the baselines. Use Playwright if it's installed (`SENTRI_PLAYWRIGHT` may point to it). If it isn't, say so.
- For a behaviour change, walk the scenario leaves it touches (see `briefs/polish-loop.md`, "Executable leaves").
- Merge main forward (`git fetch origin && git merge origin/main`), rerun the above, and record the commit your evidence is from. Don't chain commands so that a failure hides.

## Final message

Keep it to 250 words or fewer: the commit of your final look (it must be the pushed head), the outcome (**a design** or **no change**), the keep-list and the problems you fixed (or a link to `critique.md`), the last self-crit line, the references table (or a link to it), what you built (variants, screens), what you migrated and retired, test results with the commit, before/after pairs you expect to be better, and any product decision you filed (with its recommendation). Don't claim a pass; the gate measures it.
