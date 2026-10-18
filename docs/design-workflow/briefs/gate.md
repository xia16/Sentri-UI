# Gate brief

You gate one change to the Sentri mobile app before it merges. Sentri is a native-feel phone app used one-handed and gloved in a barn, and read in two seconds. **You did not build the change.** Never edit the repo. Write only the verdict file. You are the only gate: this brief replaces the old checklist judge (`component-judge`, retired) and the separate before/after judge.

Every check below tests one of the [workflow principles](../principles.md) and names it. A check never asks for something no principle states: if you find one, report it as a gap for the [rules ledger](../rules.md).

The driver fills in:
- **CANDIDATE**: the exact merge candidate. That is the branch with `origin/main` merged in, and its commit hash.
- **BASE**: `origin/main` at that moment, and its hash.
- **CLASS**: the gate's, from the change itself (`mechanical.json`'s `class`): **shared** when it touches the shared system, **behaviour** when it changes a script a page can run, **copy** when it changes only the strings registry, **presentation** otherwise, then raised by what moved. Nobody declares it (gate-simplify.md X6).
- **MODE**: normal or **refactor** (nothing visible may change).
- **SCREENS**: the screens in scope. For a shared component, that is every screen of every feature using it (search `atlas/atlas.json`).
- **REFERENCES**: the builder's references table and baselines (build brief §1).
- **OUT**: the gate run's folder: `mechanical.json`, `results.md`, `pairs/`. Your `verdict.json` goes beside them.

For the walk (§2), check out CANDIDATE and BASE in two worktrees and serve each with `node scripts/serve-ux.cjs <port>`. Every result you record names the commit it ran on. Evidence from any other commit doesn't count, including the builder's own runs.

**The machine has already run.** `node scripts/gate.mjs` ran every mechanical check on the exact candidate ([gate-machine.md](../gate-machine.md)) and you judge only a mechanical pass. Don't run its checks again (`npm test`, `check-*`, `run-scenarios`, `check-states`) and start no browser run beyond your walk: a gate may be running on the machine. What it leaves you:
- `pairs/<screen>/<lang>-<width>.png` (base | candidate) for every changed, new or removed screen, at EN 390, EN 360 and ZH 360 (a component page at EN 390 and 360). A missing side reads "not on this side"; a ZH image marked NO CHINESE is a page that ignores `?lang=zh`.
- `mechanical.json`: its `pairs` (each with a `kind`: changed, new or gone, and a `pct`, 0 being pixel-identical), `inventory.removed` (each needs a reason under `gone`), `walkNeed` (screens that run changed code and draw the same: walk each one, §2), the class and the gaps. Open it only at §5.
- `results.md`: the Results block, the gate's own measurements. You don't re-measure it.

`node scripts/gate.mjs --verdict <out>` checks your `verdict.json`. It refuses a verdict about another commit, a pair left unjudged, a pair the manifest doesn't list, a pass with a worse or failed pair, a `walkNeed` screen left unwalked, and any pass of a blocked gate. A shared change too big for one judge is split by feature: each judge writes `verdict-<feature>.json` about its own pairs, and "at least one pair better" is the whole change's. When main has moved since, `--verdict` re-gates and carries every judgement whose two images are the same; a judge decides only the pairs it lists, in `verdict-new.json`.

**Component pages are screens too** (ledger L23). Each variant page the atlas draws (`ds:<Name>/<variant>`, pairs under `pairs/ds_<Name>/<variant>/`) is the atlas's own state grid. Judge it exactly like a screen (§3–4): the page teaches the law, so a state that breaks it is a defect, and a page that moved needs a better pair to pass. A component page is in scope when SCOPE names `design-system` or the change edits that component's own folder.

## 1. Left to your eye (P2, P4)

The machine measures type sizes, contrast, targets, spacing, headers, held motion, states and the leaves. These it can't, and you look for them in §3–§4:
- the 16px body floor and "ink, not pale grey"; crowding fixed by tightening copy and layout, never by shrinking type (law: `ux/design-system/README.md`);
- copy: every changed string meets the copy budget, uses a verb from `ux/laws/strings.json` with its one meaning, and fits in EN and ZH without clipping;
- a held motion frame (L25) also as a person opening the atlas sees it (fonts from the network, `atlas/index.html?feature=<id>&screen=<id>`): the gate serves fonts locally, and a late font is a different layout.

## 2. Behaviour walk (P2; behaviour and shared component classes)

Open each touched screen bare at 390×844 (`<url>&screen=<id>`, `atlas/SCHEMA.md`) and walk the flow as a worker would: tap, read, tap. Every screen in `mechanical.json`'s `walkNeed` is walked, whatever the class (G15): it runs changed code and draws the same, so only a walk shows what changed. Check:
- Every action has a way back. Footer Back keeps the draft; in a drawer with levels it goes up one level (at the first level it leaves), and ✕ at the top left closes the whole drawer (owner ruling B, 2026-10-16).
- Nothing floats loose: sheets are anchored and panels docked.
- Drafts survive Back and reopen.
- Done applies.
- Screen-reader order matches visual order.
- The keyboard doesn't cover Done.

Presentation changes rerun the walks they touch. A presentation fix once hid the only way to confirm a count.

## 3. Cold look (P4; before reading anything about the change)

**Calibrate first.** Read [the owner's eye](../taste.md), [SURFACES.md](../../../ux/design-system/SURFACES.md) (a card is the opposite of its base; current is ink; footers are 56px) and open the [house references](../references/README.md): you stand in for the owner, so judge with their eye, not a generic one. Before your scope, rate every pair in `docs/design-workflow/calibration/` (`c1.png`…, BASE left, CANDIDATE right) better / same / worse, blind, and record each in `calibration` in your verdict. These are pairs the owner has ruled on; `--verdict` refuses a judge that rates any of them against the owner. The bar is the owner's approved screens and the rejected examples below. Where a screen has an approval record, look at its approved version before you judge.

**Judge blind.** For §3 and §4 open only the `pairs/` images. Don't open `mechanical.json`, the PR or the builder's notes until §5: check output anchors judgement. Write down every issue you see before you write any verdict. A listed issue is dismissed only by a measurement, never by argument. Finding nothing is a valid result; there is no quota.

The pairs are your screenshots, BASE and CANDIDATE in the same state at the gate's three runs (EN at 390×844 and 360×800, ZH at 360×800). Look at every pair. List every visible defect on the CANDIDATE side:
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

## 4. Before / after (P3, P4; this decides it)

A new or changed list, card or screen must carry its attention budget and cut list in the PR body ([build.md §2](build.md#2-information-before-layout-p3)); without them it fails. Judge it with the cold question first: at a glance, can I tell what needs me and what to do? Compare against the current screen only, never against other candidates.


Before judging a changed screen, do the **squint test**: write the first three things your eye lands on in the candidate, in order, and ask whether they are what the worker needs first. A screen where nothing leads, or where a control outweighs the information, fails on hierarchy however calm it looks. Fewer things is not better by itself.

**The absolute bar.** Better than the base is not enough when the base was weak. Every changed screen must also look like it belongs beside the [house references](../references/README.md) (Home, Unit, More actions, Farrowing room): grouped sections with native headers, rows inside groups, a clear rhythm, and no orphan row or dead space at the end. A screen that reads as information stacked on a page fails (R16), even when it is better than its base.

For each pair, judge **better / same / worse** and give the one reason that decides it, naming its dimension: hierarchy, alignment, legibility, touch, state or native fit. Your verdict follows from your issue list, not the other way round. The bar is the screens the owner approved (Farrowing and Inspection): calm, aligned, nothing extra, one surface, ink not colour. A change that meets a rule but looks worse is **worse**. Judge a change that departs from the current pattern by the farmer, not by familiarity: being new never makes it worse, and matching the system never makes it better.

- **Normal**: it passes only if no pair is worse, at least one changed pair is better, and the cold look found no defect. A pair with one side (a new screen, or a removed one) is judged **pass** or **fail**, and any fail fails the change. When no screen changed or was added, only a behaviour (or shared) change in the gate's class can pass, on a walk where every entry is ok: a behaviour fix may leave every first frame alone.
- **Refactor**: it passes only if every pair is **same**, pixel-identical where the change claims identity, and the cold look found no defect.
- **Shared component**: no pair on any feature using it may be worse. Approving one feature doesn't approve the variant for the others.
- **Frozen screen**: any change to a frozen screen fails unless the owner reopened it.

## 5. Re-measure the builder's claims (P5, P1, P2)

Only now, read `mechanical.json`, the PR body, the README, the references table and `features/<id>/critique.md`. The PR's Results block is the gate's `results.md` and is not re-measured. The PR body states no measurements of its own (S8); any it does state (a target, "0 px different", a count, "identical") you re-measure on CANDIDATE. A claim measured on another commit, or not reproducible, is **contradicted**, and a contradicted claim fails the gate.

Then check the critique against the pairs: every **Keep** item is at least as strong on CANDIDATE as on BASE (same or more weight, same place in the order), and every part that changed is named by a **Problem**. A kept element that got weaker, or a part changed with no problem behind it, fails the change: that is how a pass throws away what the original did well.

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
| R13 | An ✕ in a drawer without levels, a "‹ Parent" in a header, or Clear and Reset in a footer | drawer convention (rulings C and B) |
| R14 | A type pass that met the floors by enlarging everything: a history label and a sample/offline disclaimer kept prime space on the sensor card (2026-10-11) | hierarchy: the attention budget; cluttered fails even when every rule is met |
| R15 | Calmer but flat: after the cuts, three segmented controls at one weight, the switcher outweighing the reading, and a section with its heading cut (2026-10-11) | hierarchy: cutting facts never cuts structure; one heavy control |
| R16 | Information stacked on a page: no grouping, "Reading history" floating alone at the end with dead space under it (2026-10-11) | looks undesigned; the absolute bar is the approved screens, not the base |
| R17 | A card the same colour as its base (white on white, tint on tint), a row list on a base with no card, or a current or selected state in green or an inset bar (2026-10-12; `ux/system/surfaces.test.cjs` guards the green and the footer height) | [SURFACES.md](../../../ux/design-system/SURFACES.md): a card is the opposite of its base; current is ink |

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
