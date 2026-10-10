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

A shared change that touches too many screens for one judge is split by feature. Each judge writes `verdict-<feature>.json`, and `--verdict` merges them: one failing part fails the change. `check-states` runs on both sides for every class. A problem main already has is reported as main's, and only a new one fails.

## 1. Mechanical checks (run first; any failure ends the gate)

On CANDIDATE:
1. `npm test`. All pass. Skips must state a reason.
2. `npm run check`. It also runs the farm legibility check in report mode. It must report the atlas OK. `npm run atlas` must produce no diff in `atlas/atlas.json` beyond its `generated` and `commit` stamps.
3. **Farm legibility, blocking for changed screens.** Start BASE's server, then `node scripts/check-legibility.mjs --changed <the SCREENS ids> --compare <BASE url>` on CANDIDATE. It renders each screen bare at 390×844. While `docs/design-workflow/README.md` says `Legibility gate: no-regression`, a screen in scope fails only if it has more violations than at BASE in any category (text under 13px, contrast under 4.5:1 or 7:1 for 16px+ primary values, targets under 48×48; an invisible hit area counts), or a violation on an element that had none. When that line says `strict`, a screen in scope fails on any violation and `--compare` is not needed. Screens outside `--changed` are reported, not blocking. Any failure ends the gate. The 16px body floor and "ink, not pale grey" are judged by eye in step 3. Crowding is fixed by tightening copy and layout, never by shrinking type. Law: `ux/design-system/README.md`.
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

Screenshot each screen on BASE and on CANDIDATE in the same state, at 390×844 and 360×800, in EN and ZH. Look at every pair. List every visible defect on the CANDIDATE side:
- misalignment, or values off their track;
- uneven spacing, or rows of uneven height;
- stray marks;
- wrapping that breaks a row, or clipping;
- inner scrollbars;
- nested frames (a card on a card);
- text said twice;
- controls glued together;
- floating elements;
- colour that means nothing (green means approved or done only);
- decoration added to satisfy a rule (giant handles, underlines, glyphs);
- a reason line above a disabled button;
- an ✕ in a drawer;
- designed hover or focus rings.

## 4. Before / after (this decides it)

For each pair, judge **better / same / worse** and give the one reason that decides it. The bar is the screens the owner approved (Farrowing and Inspection): calm, aligned, nothing extra, one surface, ink not colour. A change that meets a rule but looks worse is **worse**.

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

## Output

Write `OUT/verdict.json`:
```json
{ "pass": false, "candidate": "<hash>", "base": "<hash>", "class": "", "mode": "",
  "mechanical": [{ "check": "npm test", "result": "pass|fail", "detail": "" }],
  "walk": [{ "screen": "", "ok": true, "issue": "" }],
  "pairs": [{ "screen": "", "lang": "en|zh", "width": 390, "verdict": "better|same|worse (both sides) | pass|fail (one side)", "why": "" }],
  "defects": [{ "screen": "", "what": "", "fix": "" }],
  "gone": [{ "screen": "", "why": "" }],
  "rejected": ["R#"], "contradicted": [""] }
```
`pairs` judges every pair in `mechanical.json`, not only EN 390; a pixel-identical pair is **same**. `gone` accounts for every screen `mechanical.json` lists as removed from the atlas: where its job went, or why it no longer exists.
Report in 150 words or fewer: pass or fail, the commit, failed checks, the pairs table, and the defects. Don't suggest redesigns; name the smallest fix.
