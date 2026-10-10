---
name: polish-loop
description: Drive the polish loop on one Sentri feature. Grade every screen, fix the worst first (and take one enhancement once nothing is broken), gate each change on the exact merge candidate, merge it, and stop after two clean rounds or the cap. Ends with a review packet for the owner.
argument-hint: "<feature id> [the job, e.g. 'type-size pass']"
disable-model-invocation: true
---

# Polish loop

This session is the **driver** of the polish loop for one feature. The brief is [polish-loop.md](../../../docs/design-workflow/briefs/polish-loop.md); read it, the [workflow README](../../../docs/design-workflow/README.md) and the [gate brief](../../../docs/design-workflow/briefs/gate.md) first. You choose what each round fixes, and you accept or send back each subagent's work. The scripts decide what a script can decide: whether evidence is on the right commit, whether grades are complete, whether a verdict covers every changed screen, and when the loop stops. You add no product work. A product question becomes a decision item, never a guess.

## Setup

1. **A ledger checkout.** `git worktree add --detach ../Sentri-UI-loop-<feature> origin/main`. You run every `polish-loop.mjs` and `gate.mjs` command here. Nobody builds here.
2. **Read the feature**: `features/<id>/PRD.md`, `feature.json`, the area's `RULINGS.md`, `review/*.json` items for it, and its scenario tree and `scenarios.json` if it has them.
3. **Start**: `node scripts/polish-loop.mjs start <feature> --job "<the job>"`. This checks that main is healthy, pins the baseline and shoots every screen at 390/360 × EN/ZH.

## Each round

1. **Evidence.** `git fetch origin && git switch --detach origin/main`, then `node scripts/polish-loop.mjs round <feature>`.
2. **Grade.** Dispatch one fresh grader (`model: opus`; it needs vision and judgment) with [grade.md](../../../docs/design-workflow/briefs/grade.md) and the round folder. Then run `node scripts/polish-loop.mjs grades <feature>`. Rejected grades go back to the grader with the script's list.
3. **Select.** Take the top hard failure; with none, the worst defect with evidence. A round's fix is **one PR** for the selected defect, plus any defect that shares its cause.
   - **Enhancement.** With no hard failure left, you may take one enhancement as well or instead: a grader's idea or your own, for a screen graded 1 ([Room to design](../../../docs/design-workflow/README.md#room-to-design)). Ask the designer for two or three sketches, at least one breaking from the current pattern, and pick one.
   - **Product questions.** If the fix needs a product change, file it with `node scripts/polish-loop.mjs decide <feature> --title … --options "a | b" --recommend …` and select the next item.
4. **Build.** Dispatch one builder with [build.md](../../../docs/design-workflow/briefs/build.md) and the selected evidence (screens, `what`, shots). Use `model: sonnet` for a fix and `opus` for an enhancement's design. Give it SCOPE = the feature, MODE = polish and its CHANGE CLASS. It works in its own worktree off `origin/main`, merges main forward before handing over, and opens a PR. It never merges.
5. **Gate.** In the ledger checkout, run `node scripts/gate.mjs --candidate origin/<branch> --scope <feature> --class <class> --out review/loop/<feature>/r<n>/gate`.
   - **Mechanical fail.** The failures go back to the builder; allow two tries.
   - **Mechanical pass.** Dispatch the judge: a fresh agent, never the builder (`model: opus`). Give it gate.md, `mechanical.json` and the `pairs/` images. It writes `verdict.json` beside them. Then run `node scripts/gate.mjs --verdict <out>`.
6. **Merge** only on `GATE PASS`, pinned to the commit the gate ran on: `gh pr merge <n> --squash --match-head-commit <candidate sha>` (`--verdict` prints the sha). If the PR head or main moved since the gate ran, merge main forward and gate again. A failed gate rejects the fix for this round; close the PR with the verdict's reason.
7. **Record.** `node scripts/polish-loop.mjs record <feature> --fix defect|enhancement|none --pr <n> --merged yes|no --what "<one line>"`. It prints whether the loop goes on.

**Shared components.** A fix that changes the bundle, the tokens, a file that pages of two or more features load (Farrowing's page also draws Move and Pig profile screens), or another feature's screens is a shared-component change. The gate escalates it by itself. Don't hide it inside a feature fix: build it as its own PR, gated on every feature that uses the component.

## Stop

`node scripts/polish-loop.mjs status <feature>` says **done** (two clean rounds, every leaf covered or blocked) or **stopped** (the cap, or a round with no progress). Then:
1. `node scripts/polish-loop.mjs packet <feature>`.
2. Publish `review/loop/<feature>/packet/` as a private artifact for the owner. Use the `index.html` page with `img/` as its files.
3. Commit `review/polish-<feature>.json` in a small PR. Its `items` are the loop's decisions, and they enter the atlas decision queue.
4. Tell the owner in five lines: the status, what changed, the open decisions, the gaps, and the link. Send the packet whether or not every screen passes.

## Discipline

- Evidence is only good for the commit it was taken on. The scripts refuse a stale checkout; don't work around them.
- One builder per PR, a different agent to judge it, and a fresh grader each round.
- Never weaken a check or a leaf to make a round pass. A check that is wrong is a workflow change: its own PR, never inside a design PR.
- Write workflow failures (a stalled step, a check that missed, a question the loop should have answered) into `docs/design-workflow/pilot-retro.md` as they happen.
