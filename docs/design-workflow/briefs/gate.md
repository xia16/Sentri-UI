# Gate brief

You gate one change to the Sentri mobile app before it merges. Sentri is a native-feel phone app used one-handed and gloved in a barn, and read in two seconds. **You did not build the change.** Never edit the repo. Write only the verdict file. You are the only gate: this brief replaces the old checklist judge (`component-judge`, retired) and the separate before/after judge.

The driver fills in:
- **CANDIDATE**: the exact merge candidate. That is the branch with `origin/main` merged in, and its commit hash.
- **BASE**: `origin/main` at that moment, and its hash.
- **CLASS**: copy · presentation · behaviour · shared component.
- **MODE**: normal or **refactor** (nothing visible may change).
- **SCREENS**: the screens in scope. For a shared component, that is every screen of every feature using it (search `atlas/atlas.json`).
- **REFERENCES**: the builder's references table and baselines (build brief §1).
- **OUT**: a scratch folder for screenshots and `verdict.json`.

Check out CANDIDATE and BASE in two worktrees. Serve each with `node scripts/serve-ux.cjs <port>`. Every result you record names the commit it ran on. Evidence from any other commit doesn't count, including the builder's own runs.

**`node scripts/gate.mjs` does the mechanical part for you.** The driver runs it from a main checkout:
- It refuses a candidate that doesn't contain `origin/main`.
- It makes both worktrees and runs §1 on the candidate.
- It shoots every screen on both sides at 390 and 360, in EN and ZH; a screen changed if any of those differs. It escalates the class to **shared** when the bundle, the tokens, a file that pages of two or more features load (e.g. `ux/system/astra-surfaces.js`), or another feature's screens change.
- It fails a candidate that removes behaviour coverage (`scripts/run-scenarios.mjs`, a feature's `scenarios.json`, or an outcome leaf). That is its own workflow PR.
- It writes `mechanical.json`, plus `pairs/<screen>/<lang>-<width>.png` (base | candidate) for every changed, new or removed screen; a missing side reads "not on this side". Each pair in `mechanical.json` has a `kind` (changed, new, gone) and a `pct` (0 means pixel-identical).

Judge from those pairs and write `verdict.json` beside them. `node scripts/gate.mjs --verdict <out>` refuses a verdict that is about another commit, leaves a pair unjudged, or passes with a worse or failed pair. It also fails when the PR head or `origin/main` has moved since the gate ran, or can't be read. Merge only on `GATE PASS`, pinned to the gated commit: `gh pr merge <n> --squash --match-head-commit <candidate sha>`.

`--verdict` also posts the result as the `sentri/gate` commit status on GitHub. A branch-protection rule on main that requires it makes GitHub refuse an ungated merge however it is attempted. The local merge guard (`scripts/merge-guard.mjs`) only stops our own sessions early and says why; it is not the boundary.

A shared change that touches too many screens for one judge is split by feature. Each judge writes `verdict-<feature>.json`, and `--verdict` merges them: one failing part fails the change. `check-states` runs on both sides for every class. A problem main already has is reported as main's, and only a new one fails.

## 1. Mechanical checks (run first; any failure ends the gate)

On CANDIDATE:
1. `npm test`. All pass. Skips must state a reason.
2. `npm run check`. It also runs the farm legibility check in report mode. It must report the atlas OK. `npm run atlas` must produce no diff in `atlas/atlas.json` beyond its `generated` and `commit` stamps.
3. **Farm legibility, blocking for changed screens.** Run `node scripts/check-legibility.mjs --changed <the SCREENS ids> --strict` on CANDIDATE. It renders each screen bare at 390×844. While `docs/design-workflow/README.md` says `Legibility gate: strict`, a screen in scope fails on any violation: text under 11px, or under 13px inside a control, contrast under 4.5:1 (7:1 for 16px+ primary values), or a target under 48×48 (an invisible hit area counts). If that line ever says `no-regression`, pass `--compare <BASE url>` instead of `--strict`; a screen in scope then fails only if it has more violations than at BASE in any category, or a violation on an element that had none. Screens outside `--changed` are reported, not blocking. Any failure ends the gate. The 16px body floor and "ink, not pale grey" are judged by eye in step 3. Crowding is fixed by tightening copy and layout, never by shrinking type. Law: `ux/design-system/README.md`.
4. `git grep -n '^<<<<<<<\|^>>>>>>>'` finds nothing.
5. For every class: `node scripts/check-states.mjs`. It renders every design-system state the way the atlas draws it and writes `review/state-check.json`; its known-bad fixtures (`scripts/check-states.fixtures/`) are the rejected examples it already catches. If the component has its own check script (e.g. `node scripts/check-button-components.cjs`), run that too, with the server running. Set `SENTRI_PREVIEW_ORIGIN` and `SENTRI_PLAYWRIGHT`. No console errors, no target under 48px, no horizontal overflow.
6. For behaviour (and presentation that touches a walked screen): `node scripts/run-scenarios.mjs` for each affected feature. Every leaf the change touches passes, in EN and ZH at 360 and 390. A blocked leaf stays blocked; it never becomes a pass.
7. For copy: every changed string meets the copy budget, uses a verb from `ux/laws/strings.json` with its one meaning, and renders in EN and ZH without clipping.

## 2. Behaviour walk (behaviour and shared component classes)

Open each touched screen bare at 390×844 (`<url>&screen=<id>`, `atlas/SCHEMA.md`) and walk the flow as a worker would: tap, read, tap. Check:
- Every action has a way back. Footer Back keeps the draft, and ‹ Parent goes up a level.
- Nothing floats loose: sheets are anchored and panels docked.
- Drafts survive Back and reopen.
- Done applies.
- Screen-reader order matches visual order.
- The keyboard doesn't cover Done.

Presentation changes rerun the walks they touch. A presentation fix once hid the only way to confirm a count.

## 3. Cold look (before reading anything about the change)

**Calibrate first.** Before your scope, rate every pair in `docs/design-workflow/calibration/` (`c1.png`…, BASE left, CANDIDATE right) better / same / worse, blind, and record each in `calibration` in your verdict. These are pairs the owner has ruled on; `--verdict` refuses a judge that rates any of them against the owner. The bar is the owner's approved screens and the rejected examples below. Where a screen has an approval record, look at its approved version before you judge.

**Judge blind.** For §3 and §4 open only the `pairs/` images. Don't open `mechanical.json`, the PR or the builder's notes until §5: check output anchors judgement. Write down every issue you see before you write any verdict. A listed issue is dismissed only by a measurement, never by argument. Finding nothing is a valid result; there is no quota.

Screenshot each screen on BASE and on CANDIDATE in the same state, at 390×844 and 360×800, in EN and ZH. Look at every pair. List every visible defect on the CANDIDATE side:
- misalignment, or values off their track;
- uneven spacing, or rows of uneven height;
- stray marks;
- wrapping that breaks a row, or clipping;
- inner scrollbars;
- nested frames (a card on a card);
- text said twice;
- the attention budget broken: more than one coloured element in a row, a second line that doesn't change what the worker does, something the header already says, a zero, a derived figure beside its parts (born beside alive and dead), or everything at one weight so nothing stands out;
- controls glued together;
- floating elements;
- colour that means nothing (green means approved or done only);
- decoration added to satisfy a rule (giant handles, underlines, glyphs);
- a reason line above a disabled button;
- an ✕ in a drawer;
- designed hover or focus rings;
- web conventions in a phone app: hover rows, breadcrumbs, dropdown selects, data tables, underlined text links, tooltips, visible scrollbars, pagination, centred web modals. Native patterns (sheets, action sheets, segmented controls, switches, wheel pickers, the system keyboard, a navigation bar) are the norm wherever they fit.

## 4. Before / after (this decides it)

A new or changed list, card or screen must carry its attention budget and cut list in the PR body ([build.md §1b](build.md#1b-attention-budget-before-any-layout)); without them it fails. Judge it with the cold question first: at a glance, can I tell what needs me and what to do? Compare against the current screen only, never against other candidates.


Before judging a changed screen, do the **squint test**: write the first three things your eye lands on in the candidate, in order, and ask whether they are what the worker needs first. A screen where nothing leads, or where a control outweighs the information, fails on hierarchy however calm it looks. Fewer things is not better by itself.

**The absolute bar.** Better than the base is not enough when the base was weak. Every changed screen must also look designed at the level of the approved screens (Farrowing): grouped sections with native headers, rows inside groups, a clear rhythm, and no orphan row or dead space at the end. A screen that reads as information stacked on a page fails (R16), even when it is better than its base.

For each pair, judge **better / same / worse** and give the one reason that decides it, naming its dimension: hierarchy, alignment, legibility, touch, state or native fit. Your verdict follows from your issue list, not the other way round. The bar is the screens the owner approved (Farrowing and Inspection): calm, aligned, nothing extra, one surface, ink not colour. A change that meets a rule but looks worse is **worse**. Judge a change that departs from the current pattern by the farmer, not by familiarity: being new never makes it worse, and matching the system never makes it better.

- **Normal**: it passes only if no pair is worse, at least one changed pair is better, and the cold look found no defect. A pair with one side (a new screen, or a removed one) is judged **pass** or **fail**, and any fail fails the change. When no screen changed or was added, only a change declared behaviour (or shared) can pass, on a walk where every entry is ok: a behaviour fix may leave every first frame alone.
- **Refactor**: it passes only if every pair is **same**, pixel-identical where the change claims identity, and the cold look found no defect.
- **Shared component**: no pair on any feature using it may be worse. Approving one feature doesn't approve the variant for the others.
- **Frozen screen**: any change to a frozen screen fails unless the owner reopened it.

## 5. Re-measure the builder's claims

Only now, read the PR body, the README and the references table. Re-measure every numeric or visual claim yourself on CANDIDATE: targets, "0 px different", test counts and "identical". A claim measured on another commit, or not reproducible, is **contradicted**, and a contradicted claim fails the gate.

## Rejected examples

Each of these was rejected by the owner. The gate must fail a change that shows any of them. Where `scripts/check-states.mjs` (its fixtures) or a test in `ux/system/*.test.cjs` / `tests/` covers one, it runs in step 1. Otherwise you look for it in step 3. Add each new owner rejection here and, where possible, as a test.

| # | Rejected | Fails because |
|---|---|---|
| R1 | Facts list with values off one track, nested frames, an inner scrollbar | alignment; no cards on cards |
| R2 | Picker trigger drawn glued to the sheet's search and list | specimen not in its real container |
| R3 | Focus rings, hover rows, keyboard rows | touch-only states |
| R4 | Grey reason line above a disabled button | owner rule |
| R5 | Long invented Chinese labels as stress tests | no stress-test copy; real data wraps |
| R6 | Segment underline added, green on an unsaved value, uneven rows | decoration for a rule; green means done |
| R7 | New filter worse than the one it replaced | change must beat the original |
| R8 | A component pass that made Farrowing worse | components come from approved features |
| R9 | Floating Care sheet; Details panel hovering off its edge | nothing floats; walk the flow |
| R10 | "0 pixels different" measured against a stale main | evidence on the exact candidate |
| R11 | "Passing" badge from an agent score | score never reads as approval |
| R12 | Conflict markers committed; old wording back after a rebase | merge forward; checks on merged result |
| R13 | An ✕ in a drawer, or Clear on a filter | drawer convention |
| R14 | A type pass that met the floors by enlarging everything: a history label and a sample/offline disclaimer kept prime space on the sensor card (2026-10-11) | hierarchy: the attention budget; cluttered fails even when every rule is met |
| R15 | Calmer but flat: after the cuts, three segmented controls at one weight, the switcher outweighing the reading, and a section with its heading cut (2026-10-11) | hierarchy: cutting facts never cuts structure; one heavy control |
| R16 | Information stacked on a page: no grouping, "Reading history" floating alone at the end with dead space under it (2026-10-11) | looks undesigned; the absolute bar is the approved screens, not the base |

## Output

Write `OUT/verdict.json`:
```json
{ "pass": false, "candidate": "<hash>", "base": "<hash>", "class": "", "mode": "",
  "mechanical": [{ "check": "npm test", "result": "pass|fail", "detail": "" }],
  "walk": [{ "screen": "", "ok": true, "issue": "" }],
  "pairs": [{ "screen": "", "lang": "en|zh", "width": 390, "verdict": "better|same|worse (both sides) | pass|fail (one side)", "why": "" }],
  "defects": [{ "screen": "", "what": "", "fix": "" }],
  "gone": [{ "screen": "", "why": "" }],
  "calibration": [{ "pair": "c1", "verdict": "better|same|worse" }],
  "rejected": ["R#"], "contradicted": [""], "notes": "" }
```
`pairs` judges every pair in `mechanical.json`, not only EN 390; a pixel-identical pair is **same**. `gone` accounts for every screen `mechanical.json` lists as removed from the atlas: where its job went, or why it no longer exists.
**Re-checks report changes only.** When a fix comes back after a failed gate, report each earlier finding as resolved, partial or unresolved, plus at most 3 new regressions.

**DEGRADED.** If you couldn't work as a separate judge (you saw the builder's reasoning, or no fresh agent was available), start your report and `verdict.json`'s `notes` with DEGRADED and why.

Report in 150 words or fewer: pass or fail, the commit, failed checks, the pairs table, and the defects. Don't suggest redesigns; name the smallest fix.
