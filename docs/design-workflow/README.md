# Design workflow

Sentri-UI is the design source of truth for a native-feel mobile app used by gloved, one-handed farm workers in English and Chinese. AI agents run its design work. This page is the workflow. Every session and every engineer runs this one. Words are defined in the [glossary](GLOSSARY.md).

## Legibility gate

Legibility gate: no-regression

The farm legibility check (`scripts/check-legibility.mjs`, law in `ux/design-system/README.md`) blocks a changed screen only if it is worse than at the base. When the type pass has merged, change the line above to `Legibility gate: strict`; the same check then holds changed screens to the absolute floors.

## Who decides what

| Who | Decides |
|---|---|
| **Agents** | Every design call: layout, hierarchy, copy within the rules, components and variants. They make the call, build it well and ship it behind the gates. They don't ask first. |
| **Gates** | Whether a change merges. Merges are automatic once every gate for the change class passes. |
| **Owner** | Product rules (behaviour, scope, what is saved, permissions) and approval of screens. The owner reacts to built work afterwards. Only **product rules** go to the backlog as decision items; design calls never do. |

An agent score is never shown as approval. The approved version of a screen stays visible until the owner promotes the new one.

## Owner rules (binding on every brief)

- **Platform first.** Under Mobile everything is the mobile app: touch-only states (Default, Pressed, Selected, Disabled, Error, Loading, Empty, Long label / Chinese). No designed hover, focus rings or keyboard rows. Screen-reader order and the keyboard covering Done are real and are checked.
- **Components come from real features.** Approved screens are the baseline. A component reproduces them and improves only by improving a feature.
- **A change must beat what it replaces**, side by side at 390px. Same or worse fails. A refactor must be identical.
- **Copy fits the component; real data wraps safely.** Labels we write meet the copy budget. Medicine names, ear tags and farm names can't be shortened, so each component states how it wraps and shows the full value.
- **Drawer convention.** Footer **Back** leaves and keeps the draft. **‹ Parent** goes up a level. No ✕. **Done** applies. **Reset** for filters, **Clear** for input.
- **No reason line above a disabled button.**
- **Green means approved or done only.**
- **No cards on cards; information budget.** One surface, and only items are boxes. Colour only where it means something. Nothing said twice. Rank what the farmer must see first.

## Room to design

The design system and the rules above are a floor, not a ceiling (owner, 2026-10-10). Agents are designers, not copyists. If a better layout, interaction, variant or component would serve the farmer, build it:
- **When a job is only adequate, look wider.** Before you build, sketch at least one alternative that departs from the current pattern. Then build the one that serves the farmer best.
- **The gate decides, not familiarity.** The new design must beat what it replaces, side by side. Being different never makes it worse, and matching the system never makes it better.
- **Prove it in a feature, then share it.** An enhancement starts in the feature that needs it. It reaches other features only as a shared-component change, gated on every feature that uses it, and never by restyling an approved screen to match.
- **The owner rules still bind.** They are what keeps the product one product. Everything they don't fix is open.

## The scenario step

New features and the polish loop both use the same scenario step. It has three parts:

1. **Scenario tree.** In the feature's research folder, write a tree that crosses every entity state with every event that can reach it. Each branch ends in an outcome, a handoff to another feature, or an open question `? Qn`. Mark each branch **S** (sourced, with a citation) or **I** (inferred, with the reasoning). Where sources disagree, RULINGS wins. If no ruling covers the conflict, the branch becomes a `?`. The format example is [`ux/tasks/piglet-processing/research/scenario-tree.md`](../../ux/tasks/piglet-processing/research/scenario-tree.md).
2. **Persona walks.** Run rounds of walkers, one per persona from the tree, plus a breaker. Subagents walk the live screens in a real browser. See [walk.md](briefs/walk.md). Examples are in `ux/tasks/piglet-processing/research/walks/r1|r2|r3/`, condensed in `ux/tasks/piglet-processing/scenarios.md`.
3. **Executable leaves.** A walked branch becomes a re-runnable gate: an entry in `features/<id>/scenarios.json`, run by `node scripts/run-scenarios.mjs`. Leaf fields are in [polish-loop.md](briefs/polish-loop.md#executable-leaves); the file format, assertions and runner are in [scenarios.md](scenarios.md).

## The three modes

**1 · New feature.** Open a map per feature and claim it in the atlas. Then work through references ([build.md](briefs/build.md#1-references)), research and a PRD draft, and the **scenario step** (tree, then walks). Next come decisions: undecided screens stay provisional. Then design and build. Build screens first; components come from the feature. When it's built, the feature enters the polish loop.

**2 · Polish loop.** An in-design feature whose product scope is settled improves on its own. Agents complete the scenario tree, grade every screen, fix the worst, rerun the walks and leaves, and gate each round. They add no new product work. The loop ends with a review packet for the owner. See [polish-loop.md](briefs/polish-loop.md).

**3 · Freeze.** When every screen is approved, the frozen feature becomes the source the rest of the system is updated from. The freeze publishes only after propagation verifies. See [freeze-checklist.md](freeze-checklist.md).

## Order of steps for any change

1. **Class it**: copy, presentation, behaviour or shared component (table below).
2. **References**: find what exists for the job and capture the baselines before building ([build.md §1](briefs/build.md#1-references)).
3. **Build** on a branch in a worktree off `origin/main` ([build.md](briefs/build.md)).
4. **Gate** it on the exact merge candidate. A different agent from the builder runs [gate.md](briefs/gate.md).
5. **Merge** it automatically once the gates pass. Merge main forward (`git fetch origin && git merge origin/main`); never rebase or force-push. Rerun the checks on the merged result.
6. **File** owner-only product questions as decision items, with options and a recommendation.

## Gates by change class

| Change | Runs |
|---|---|
| Copy only | Copy budget and wrapping rules, verb registry (`ux/laws/strings.json`), EN/ZH render of the touched screens |
| Presentation in one feature | The above, plus the mechanical checks (incl. `node scripts/check-states.mjs`), plus before/after on the feature's screens |
| Behaviour | The above, plus the scenario leaves and walks that touch it (390/360, EN/ZH), screen-reader order and keyboard cover |
| Shared component | All of the above on **every** feature that uses it. A refactor must be identical. Any change to a frozen screen needs the owner's approval. |

Every rejected owner example is a fixture each gate must fail ([gate.md](briefs/gate.md#rejected-examples)). All evidence records the commit it was taken on.

## Commands

| Command | Does |
|---|---|
| `npm test` | Every unit and guard test: `node --test ux/system/*.test.cjs tests/*.test.mjs` |
| `npm run atlas` | Rebuilds `atlas/atlas.json` from its sources (`atlas/SCHEMA.md`) |
| `npm run check` | Checks the atlas sources without writing |
| `npm run ux` | Serves the repo for the atlas and the prototypes (`http://localhost:4317/atlas/`) |
| `node scripts/run-scenarios.mjs` | Runs a feature's executable leaves (`features/<id>/scenarios.json`) |

## Briefs

| Brief | Used by |
|---|---|
| [briefs/build.md](briefs/build.md) | The builder of a screen, feature or component |
| [briefs/gate.md](briefs/gate.md) | The single gate. It replaces `component-judge` and the checklist judge, which are **retired**. |
| [briefs/walk.md](briefs/walk.md) | A persona walker or the breaker in a scenario round |
| [briefs/polish-loop.md](briefs/polish-loop.md) | The polish-loop driver |
| [briefs/populate.md](briefs/populate.md) | Atlas population. It maps existing screens and designs nothing. |
| [briefs/review.md](briefs/review.md) | Screen and atlas reviews that feed the backlog |
| [freeze-checklist.md](freeze-checklist.md) | Freeze and propagation |

Standards these briefs point to: `ux/design-system/README.md` (laws), `docs/design-workflow/research/component-standard.md` (component page anatomy and checklist), and `atlas/SCHEMA.md` (atlas data and backlog item format).

## Background

- The `/design-drive` skill and its lint: [`.claude/skills/design-drive/`](../../.claude/skills/design-drive/SKILL.md), with its config in [`docs/agents/design.md`](../agents/design.md).
- Why the workflow is shaped this way: [design-loop.md](design-loop.md) and [design-loop-research.md](design-loop-research.md). What went wrong: [pilot-retro.md](pilot-retro.md). The map is [Team design workflow #20](https://github.com/xia16/Sentri-UI/issues/20).

Change the workflow in its own pull request, never inside a design PR.
