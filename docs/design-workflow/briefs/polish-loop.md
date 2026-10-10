# Polish-loop brief

Use the polish loop for an **in-design feature whose product scope is settled**. Its design still has problems. You drive rounds: complete the scenario tree, grade every screen state, fix the worst, gate, merge and repeat. You add **no new product work**. The loop ends with a review packet; the owner picks details, not defects. Run it first on Farrowing, then Inspection and Piglet processing.

The driver fills in **FEATURE** (`features/<id>/`), **BASELINE** (the commit the loop starts from) and **ROUND CAP** (default 5).

Run it with the `/polish-loop <feature>` skill (`.claude/skills/polish-loop/`). Its tools:
- `node scripts/polish-loop.mjs`: the round ledger, the grade check, the stop conditions and the review packet;
- `node scripts/gate.mjs`: the gate on the exact merge candidate;
- [grade.md](grade.md): the grader's brief.

## 0. Before round 1

- **Pin the baselines.** Record the BASELINE commit. Screenshot every screen state at 390 and 360, in EN and ZH. The approved version of each screen stays visible in the atlas until the owner promotes the new one.
- Confirm `npm test` and `npm run check` pass on BASELINE.

## 1. Scope comes from rulings, not from what's built

List what the feature must do from the current rulings (`RULINGS.md` for its area), the decisions in `review/*.json`, and the PRD's **explicit** scope (`features/<id>/PRD.md`). A built screen is not scope. A screen with no ruling behind it is a finding.

Where the PRD, a contract and the screens disagree, record the contradiction as a **decision item** with options and a recommendation, and don't pick a side. Example: Farrowing's PRD parks fostering but the feature has fostering screens; the PRD blocks ending the task while a sow is farrowing but the contract says active sows never block closure. Both branches stay blocked until the owner rules.

## 2. The scenario step: a transition graph, read as a tree

This is the same scenario step the new-feature mode uses (see `docs/design-workflow/README.md`). The format example is `ux/tasks/piglet-processing/research/scenario-tree.md`: states × events, each branch **S** (cited) or **I** (reasoned), open branches as `? Qn`, and RULINGS wins.

Back, corrections and interruptions repeat, so paths can't simply be listed. Draw a graph and read it as a tree. Node types:

| Node | Is |
|---|---|
| **entry** | A way in (Home, Choose unit, a link from another feature) |
| **start** | A reset starting state (fixture + clock) |
| **action** | A tap or input |
| **outcome** | What must be visible and what must be recorded |
| **blocker** | A decision only the owner can make; the branch stops here |

Farrowing's main branches:
- Home or Choose unit → room → search/filter → sow.
- Awaiting → counting → death draft → Back / resume / Clear / Save.
- Finish blocked by a draft → resolve → Finish → locked record.
- Edit / correct born → history; sow death; overview → End → receipt.

Complete the tree. Add the missing leaves: a state with no screen, a path with no way back, a language not checked, offline, error, empty, long real data. Run persona walk rounds ([walk.md](walk.md)) to find branches the tree missed.

## 3. Executable leaves

Every leaf is a re-runnable gate. Write it into `features/<id>/scenarios.json`, which `node scripts/run-scenarios.mjs` runs. Each leaf has:

| Field | Holds |
|---|---|
| `id` | A stable id, e.g. `farrowing.death-draft.back-keeps` |
| `authority` | The ruling, decision or PRD line it comes from |
| `reset` | The starting state: fixture variant and screen |
| `clock` | A fixed time, so "1h ago" can't drift |
| `taps` | The ordered actions |
| `visible` | What must be on screen afterwards |
| `record` | What must, and must not, be saved |
| `runs` | EN and ZH × 360 and 390 (all four by default) |

Example: draft one death, tap Back, reopen. The draft is still there, the saved deaths haven't changed, and Finish stays blocked until the draft is resolved.

A leaf the screens can't run is marked **blocked** with the reason. A screenshot alone never counts as covering a leaf.

The file format (the tree of entry, state, action, outcome and decision-blocker nodes), the assertion kinds and the runner's results are in [scenarios.md](../scenarios.md). Farrowing's slice: `features/farrowing/scenario-tree.md` and `features/farrowing/scenarios.json`.

## 4. Grading per screen state

Score each dimension **0, 1 or 2**, with evidence (a screenshot and what is wrong) for every point lost:
- **Hierarchy**: the first thing seen is what the farmer needs first.
- **Alignment and density**: one track; even rows; information budget.
- **Legibility and copy**: copy budget, verbs, EN/ZH fit, real data wraps.
- **Touch and reach**: 48px targets; one-handed reach; no gesture-only action.
- **State clarity**: draft, saved, blocked and done are told apart; green only for done.
- **Native fit**: it looks and behaves like an iOS or Android app; native patterns where they fit, no web conventions.

**Hard failures** fail the screen whatever the score: a wrong fact, a lost draft, a dead end, an unreachable control, a broken ruling, or any rejected example in `gate.md`.

## 5. The product-neutral boundary

Agents may restore the specified behaviour and improve how it looks and reads. Changing any of these is a **product decision**: a calculation, eligibility, a default, what gets saved, a permission, how corrections work, or which actions exist.

When a branch hits the boundary:
1. File a decision item with the scenario, the conflicting sources, the options, a recommendation and the affected screens.
2. Mark the branch and its leaves **blocked**.
3. Carry on with independent work.

Never invent an expected result to make a leaf pass.

## 6. Each round

1. Run every leaf (`node scripts/run-scenarios.mjs`) and grade every screen state on the round's start commit.
2. **Select**: first the hard failures, then the worst usability defect with evidence. A fix must improve its target with no regression elsewhere. A shared component may change only if every other feature using it stays the same or better.
3. **Build** with `build.md`. Changes are presentation and behaviour restoration only, in the feature.
4. **Gate** with `gate.md` on the exact merge candidate. Presentation changes rerun the walks and leaves they touch.
5. **Merge** automatically when it passes. Record the round: commit, grades, leaf results, and what changed.

## 7. Stop conditions

- **Done**: two clean rounds in a row (no hard failure, no defect selected) with every required leaf covered or blocked by a filed decision.
- **Stopped incomplete**: after the round cap (5), or after a round that makes no progress (grades and leaf results unchanged).

## 8. Review packet (for the owner)

- The BASELINE and final candidate commits.
- Each screen state before and after (EN/ZH, 390/360).
- The grades per round.
- Scenario results: passed, failed and blocked leaves, with reasons.
- The open decisions, each with options and a recommendation.
- The declared gaps: what the loop couldn't cover, and why.

Send the packet whether or not every screen passes.
