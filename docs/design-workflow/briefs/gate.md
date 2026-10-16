# Gate brief

You gate one change to the Sentri mobile app before it merges. Sentri is a native-feel phone app used one-handed and gloved in a barn, and read in two seconds. **You did not build the change.** Never edit the repo. Write only the verdict file. You are the only gate: this brief replaces the old checklist judge (`component-judge`, retired) and the separate before/after judge.

Every check below tests one of the [workflow principles](../principles.md) and names it. A check never asks for something no principle states: if you find one, report it as a gap for the [rules ledger](../rules.md).

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
- It works out the change's **reach** from its files and prints it (`reach: N screen(s) in features a, b (why)`, `reach: all screens (why)` or `reach: no screen (why)`): a page, or a file only one feature's pages load, reaches that feature; `features/<id>/` reaches `<id>`; the scope is always in; a file pages of two or more features load (a shared script, a prototype stylesheet) reaches those features, and its class is still shared; the bundle, the tokens, the bare-screen harness, the shooter and server, `atlas/`, `sections/`, `vendor/`, `package*.json` and any `ux/` file no page loads by name reach every screen; docs, prose outside `ux/`, `.github/`, `tests/`, `.claude/` and the other scripts reach none. Anything it can't place reaches every screen.
- It shoots the reach on both sides at 390 and 360, in EN and ZH; a screen changed if any of those differs. Every other screen is shot once, at 390 in EN, as a **tripwire**: one of them that moves fails the gate (the change reaches further than its files say; gate again with `--all`, which shoots every screen in full). It escalates the class to **shared** when the bundle, the tokens, a file that pages of two or more features load (e.g. `ux/system/astra-surfaces.js`), or another feature's screens change.
- **Opt-in component change.** When the only system files a change touches are the bundle (`bundle.js`, `bundle.css`, `index.d.ts`), the gate first tries to prove the change opt-in (`scripts/opt-in-proof.mjs`): every distinct call the base screens make into `SentriUI` (recorded once per main commit by `scripts/record-calls.mjs`, kept under `sentri-gate/calls/`) renders byte-identical markup through the candidate's bundle; no existing CSS rule is removed, edited or reordered; and every selector of every added rule requires a hook (a class, an id, an attribute or attribute value) that no base markup or `ux/` source can carry, outside `:not()`, `:is()` and the other functional pseudo-classes. Proved (`opt-in proof: proved …`), the bundle files reach only the component pages, beside whatever the change's other files reach, raise no class and join no queue; the tripwire still shoots every other screen and fails the gate if one moves. Not proved, the reasons are printed and the change is gated as shared, as before. `--all` skips the proof. A token, the bare-screen harness or a shared stylesheet is never opt-in.
- Base shots are taken once per main commit: they are kept under the git common dir (`sentri-gate/base-shots/<base>/<key>/`, the key hashing the shooter, the fonts, the base side's harness and server, the Playwright build, the widths and languages) and reused by every later gate against that base. A changed screen is still shot again on base, fresh, to tell a change from noise.
- One gate runs at a time on a machine: a second one prints `waiting for the gate on <sha> (pid N)` and starts when the first ends. A lock left by a gate that died is taken over. No other browser run from this repo shares the machine with a gate either: `npm test`'s browser suites, `run-scenarios`, `check-states` or `shoot-screens` started on their own wait while a gate runs, and a gate waits for them to end (they may run beside each other).
- It fails a candidate that removes behaviour coverage (`scripts/run-scenarios.mjs`, a feature's `scenarios.json`, or an outcome leaf). That is its own workflow PR.
- It writes `mechanical.json`, plus `pairs/<screen>/<lang>-<width>.png` (base | candidate) for every changed, new or removed screen; a missing side reads "not on this side". Each pair in `mechanical.json` has a `kind` (changed, new, gone) and a `pct` (0 means pixel-identical).
- **Component pages are screens too** (ledger L23). Every variant page the atlas draws (Components → <Name> → <variant>) is shot like a screen, in EN only (its Chinese cells are its own states): at 390 and 360 when it is in the reach, once at 390 as a tripwire otherwise. A component's own variant pages, `variants.json`, `gate.json` and README reach its pages (feature `design-system`), not every screen. The shot is the atlas's own state grid, each state's frame at that width, two to a row, whole. Its id is `ds:<Name>/<variant>`, its feature `design-system`, and its pairs are `pairs/ds_<Name>/<variant>/en-<width>.png`. Judge them exactly like a screen's (§3–4): the page teaches the law, so a state that breaks it is a defect, and a page that moved needs a better pair to pass. A change that moves a component page is at least **presentation**, never copy only. A component page is in scope when SCOPE names `design-system` or the change edits that component's own folder (`ux/design-system/components/<Name>/`); another component's page moving is outside it (known reach).

Judge from those pairs and write `verdict.json` beside them. `node scripts/gate.mjs --verdict <out>` refuses a verdict that is about another commit, leaves a pair unjudged, or passes with a worse or failed pair. It also fails when the PR head or `origin/main` has moved since the gate ran, or can't be read. Merge only on `GATE PASS`, pinned to the gated commit: `gh pr merge <n> --squash --match-head-commit <candidate sha>`.

When main moves on after a `GATE PASS`, merge it forward and run `node scripts/gate.mjs --carry <out>` before gating again. It records the pass for the new head without shooting a screen only when the new head is the gated commit merged with main and nothing else (no commit of its own, no conflict resolved, no file both sides changed) and main's own change reaches no screen (docs, the workflow, gate and check scripts, tests). It names the gated commit, both mains and the carried verdict; anything else says why and the gate runs again.

`--verdict` also posts the result as the `sentri/gate` commit status on GitHub. Every GitHub call the gate makes (the queue, PR files, statuses) is tried twice more after a network error (EOF, TLS, a timeout, a 5xx); after that it says `GitHub could not be reached`, which is not a queue verdict or a status: run it again. An answer from GitHub is never retried. A branch-protection rule on main that requires it makes GitHub refuse an ungated merge however it is attempted. The local merge guard (`scripts/merge-guard.mjs`) only stops our own sessions early and says why; it is not the boundary.

A shared change that touches too many screens for one judge is split by feature. Each judge writes `verdict-<feature>.json`, and `--verdict` merges them: one failing part fails the change. `check-states` runs on both sides for every class. A problem main already has is reported as main's, and only a new one fails.

## 1. Mechanical checks (P2, P5; run first; any failure ends the gate)

On CANDIDATE:
1. `npm test`. All pass. Skips must state a reason.
2. `npm run check`. It also runs the farm legibility check in report mode. It must report the atlas OK. `npm run atlas` must produce no diff in `atlas/atlas.json` beyond its `generated` and `commit` stamps.
3. **Farm legibility, blocking for changed screens.** Run `node scripts/check-legibility.mjs --changed <the SCREENS ids> --strict` on CANDIDATE. It renders each screen bare at 390×844. While `docs/design-workflow/README.md` says `Legibility gate: strict`, a screen in scope fails on any violation: text under 11px, or under 13px inside a control, contrast under 4.5:1 (7:1 for 16px+ primary values), or a target under 48×48 (an invisible hit area counts). If that line ever says `no-regression`, or the change is declared **shared component**, pass `--compare <BASE url>` instead of `--strict`; a screen in scope then fails only if it has more violations than at BASE in any category, or a violation on an element that had none. Screens outside `--changed` are reported, not blocking. Any failure ends the gate. The 16px body floor and "ink, not pale grey" are judged by eye in step 3. Crowding is fixed by tightening copy and layout, never by shrinking type. Law: `ux/design-system/README.md`.
4. `git grep -n '^<<<<<<<\|^>>>>>>>'` finds nothing.
4b. **Clear spacing (P4)** on changed screens: `scripts/check-spacing.mjs` (a block closer to a list than its rows, crowded boxes, doubled lines). A defect main already has there is main's; only a new one fails.
4c. **Headers (P3)** on changed screens: `scripts/check-headers.mjs` (the Headers law: 24px from the header to the body; nothing acting in a header but Back, the subject chip and a sheet's corner actions (Clear or Reset top right, ✕ top left), each a 48px target centred ±2px on the title and its line; no count in the title or line; the line on one line, and the title on one line 12px clear of the corner targets, at 360 in EN and ZH). Its known-bad fixtures are `scripts/check-headers.fixtures/` (`--self-test`). A defect main already has there is main's; only a new one fails. The moved component pages get the same check (`check-headers.mjs --components <Name,…>`: room, wrap, contents and corner at 360 on every state the atlas draws), base against candidate by page and detail: "component pages follow the Headers law (P3)".
5. For every class: `node scripts/check-states.mjs`. It renders every design-system state the way the atlas draws it and writes `review/state-check.json`; its known-bad fixtures (`scripts/check-states.fixtures/`) are the rejected examples it already catches. If the component has its own check script (e.g. `node scripts/check-button-components.cjs`), run that too, with the server running. Set `SENTRI_PREVIEW_ORIGIN` and `SENTRI_PLAYWRIGHT`. No console errors, no target under 48px, no horizontal overflow.
6. For behaviour (and presentation that touches a walked screen): `node scripts/run-scenarios.mjs` for each affected feature. Every leaf the change touches passes, in EN and ZH at 360 and 390. A blocked leaf stays blocked; it never becomes a pass. The gate runs the leaves alone, after the shots and check-states. A run whose only failure is a navigation timeout runs once more; timing out again fails it as `slow machine (timed out twice)`, which is the machine, not the design: rerun the gate when it is idle. An assertion failure never retries. A leaf that fails on the candidate is asked again on base: if it fails there too, it is main's debt (a gap that names it), not this change's; the check fails only on a leaf that passes on main and fails here, or a new leaf that fails (owner, 2026-10-15). A run that crashes or reads a bad tree fails as it is.
7. For copy: every changed string meets the copy budget, uses a verb from `ux/laws/strings.json` with its one meaning, and renders in EN and ZH without clipping.

## 2. Behaviour walk (P2; behaviour and shared component classes)

Open each touched screen bare at 390×844 (`<url>&screen=<id>`, `atlas/SCHEMA.md`) and walk the flow as a worker would: tap, read, tap. Check:
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

## 4. Before / after (P3, P4; this decides it)

A new or changed list, card or screen must carry its attention budget and cut list in the PR body ([build.md §2](build.md#2-information-before-layout-p3)); without them it fails. Judge it with the cold question first: at a glance, can I tell what needs me and what to do? Compare against the current screen only, never against other candidates.


Before judging a changed screen, do the **squint test**: write the first three things your eye lands on in the candidate, in order, and ask whether they are what the worker needs first. A screen where nothing leads, or where a control outweighs the information, fails on hierarchy however calm it looks. Fewer things is not better by itself.

**The absolute bar.** Better than the base is not enough when the base was weak. Every changed screen must also look like it belongs beside the [house references](../references/README.md) (Home, Unit, More actions, Farrowing room): grouped sections with native headers, rows inside groups, a clear rhythm, and no orphan row or dead space at the end. A screen that reads as information stacked on a page fails (R16), even when it is better than its base.

For each pair, judge **better / same / worse** and give the one reason that decides it, naming its dimension: hierarchy, alignment, legibility, touch, state or native fit. Your verdict follows from your issue list, not the other way round. The bar is the screens the owner approved (Farrowing and Inspection): calm, aligned, nothing extra, one surface, ink not colour. A change that meets a rule but looks worse is **worse**. Judge a change that departs from the current pattern by the farmer, not by familiarity: being new never makes it worse, and matching the system never makes it better.

- **Normal**: it passes only if no pair is worse, at least one changed pair is better, and the cold look found no defect. A pair with one side (a new screen, or a removed one) is judged **pass** or **fail**, and any fail fails the change. When no screen changed or was added, only a change declared behaviour (or shared) can pass, on a walk where every entry is ok: a behaviour fix may leave every first frame alone.
- **Refactor**: it passes only if every pair is **same**, pixel-identical where the change claims identity, and the cold look found no defect.
- **Shared component**: no pair on any feature using it may be worse. Approving one feature doesn't approve the variant for the others.
- **Frozen screen**: any change to a frozen screen fails unless the owner reopened it.

## 5. Re-measure the builder's claims (P5, P1, P2)

Only now, read the PR body, the README, the references table and `features/<id>/critique.md`. Re-measure every numeric or visual claim yourself on CANDIDATE: targets, "0 px different", test counts and "identical". A claim measured on another commit, or not reproducible, is **contradicted**, and a contradicted claim fails the gate.

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
