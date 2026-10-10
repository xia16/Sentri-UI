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
- **Attention budget before layout.** Showing too much is like showing nothing: when every fact gets equal weight, nothing stands out and workers stop reading. Every new or changed list, card or screen starts from an attention budget: the facts it could show, the worker's questions in order, an attention level for each fact, and a written cut list. Only then comes layout. Passing the legibility floors is not the same as being focused ([build.md §1b](briefs/build.md#1b-attention-budget-before-any-layout)).
- **Design for the medium.** The atlas is a web page; the designs in it are a native phone app. Use the iOS or Android native component wherever one fits: sheets, action sheets, segmented controls, switches, wheel pickers for dates and numbers, the system keyboard, a navigation bar. Build a custom one only where none fits, and say why. No web conventions: hover rows, breadcrumbs, dropdown selects, data tables, underlined text links, tooltips, visible scrollbars, pagination, centred web modals.
- **Simple beats complete.** Design for the 95% of real cases. Leave out what would add noise for farmers or need heavy infrastructure, and list it as not supported. Easy to act and to record matters more than feature count: a frustrated farmer stops using the app.
- **Design for gloves and reach; no device testing.** The screen in its natural state is the evidence.

## Room to design

The design system and the rules above are a floor, not a ceiling (owner, 2026-10-10). Agents are designers, not copyists. If a better layout, interaction, variant or component would serve the farmer, build it:
- **Budget first, then explore.** Visual and blind explorations start from the agreed attention budget. Every candidate is judged against the current screen, never only against the other candidates.
- **When a job is only adequate, look wider.** Before you build, sketch at least one alternative that departs from the current pattern. Then build the one that serves the farmer best.
- **The gate decides, not familiarity.** The new design must beat what it replaces, side by side. Being different never makes it worse, and matching the system never makes it better.
- **Only a much better design is worth the change.** The system stays consistent. A small improvement isn't built; a much better one is propagated to every feature that uses it.
- **Prove it in a feature, then share it.** An enhancement starts in the feature that needs it. It reaches other features only as a shared-component change, gated on every feature that uses it, and never by restyling an approved screen to match.
- **The owner rules still bind.** They are what keeps the product one product. Everything they don't fix is open.

## The scenario framework

Every feature and every map goes through it: first after scoping and research, again at the start of every polish loop. No map closes and no feature leaves design until its scenarios have settled. It answers: what do farmers really do around this job, which of those we support, and where the screens let them down.

1. **Operations inventory.** Start from the baseline: the old Figma flows, the current screens, the PRD and research. List the real-world operations around the job: routine work, exceptions, corrections, handoffs, things that go wrong. For each: do farmers do it, and how often; what's at stake; should it be recorded; where (here, another feature, nowhere); and the least UI that covers it.
2. **The cut (the 95% line).** Each operation lands in one of three places: **supported here** (common or high-stakes, and it fits the screens without new top-level actions or heavy infrastructure), **handled by another feature** (a link, not a copy) or **not supported** (rare, noisy or needing heavy infrastructure, with the reason). Agents make the cut and mark each estimate sourced or inferred; the owner reacts in the review. Only a high-stakes operation that needs heavy infrastructure becomes a decision ticket. The PRD carries the not-supported list. No low-value scope creep.
3. **Scenario tree.** For every supported operation: every entity state × every event and every entry point, completely. Interruptions apply to every path that writes a record (Back mid-draft, the app closed and reopened, offline then online, time passing, another worker's record arriving, a double tap). Data, people, device and time are combined pairwise. Sequences across time, workers and features are added wherever they could lose work, double-write, show a wrong fact or block recovery. A branch ends in an outcome, a handoff or an open question, marked **S** (sourced) or **I** (inferred). Where sources disagree, RULINGS wins; no ruling makes it a question, never a guess. Traversal stops at the 95% line: below it a branch ends as not supported. Format: [scenarios.md](scenarios.md).
4. **The matrix ledger.** Before any browser work, every scenario is written down as Pending. A walk moves it to passed, failed or blocked. A blocked scenario is never quietly re-queued, and a product question goes to a decision ticket.
5. **Walks.** Personas from the tree, a first-time worker and a breaker walk the live screens ([walk.md](briefs/walk.md)). Each walker is split in two: a driver that performs the taps reliably, and a persona with no product context that decides what a farmer would try. A problem counts when two or more stumble in the same place. Walk findings are hypotheses that find defects, never proof of real farm behaviour.
6. **Stopping.** A scenario loop ends as **settled** (two clean rounds with every branch walked or blocked, the last round by fresh walkers who weren't given the paths), **capped** (4 rounds, with a report of what's open), or **stuck** (only repeats or only product questions, a fix undoing another, or findings growing round on round).
7. **Leaves.** Every walked branch becomes an executable leaf in `features/<id>/scenarios.json`, run by `node scripts/run-scenarios.mjs` in EN and ZH at 360 and 390. Each carries a plain **given / when / then** for testing the live app, as well as its prototype binding. The gate reruns the leaves of every touched feature; deleting or weakening a leaf is a workflow change in its own PR. The scenario base becomes the testing ground for the live app.

## Approvals

Only the owner approves a screen, by saying "approve <screens or feature>" in any session. An agent records who, when and which commit. A screen a later change touches is **changed since approval**: back in design, with its approved version still viewable until the owner promotes the new one. A new or stricter gate binds changed screens; screens that already passed keep their status until a change touches them.

## Retros

A workflow failure is a retro: a step that stalled, a check that missed, a question the loop should have answered. Anyone files one by hand as a `workflow-retro` issue, and every map close and loop end adds the agents' own reflection. Retros feed the workflow's own backlog.

## The three modes

One entry point drives them all: `/design <feature>` ([.claude/skills/design/](../../.claude/skills/design/SKILL.md)). It reads where the feature stands (`node scripts/feature-state.mjs <feature>`) and runs the next step until a stop condition. Planning a new feature uses Matt Pocock's Wayfinder unchanged: a map of decision tickets on GitHub ([tracker operations](../agents/issue-tracker.md)). A feature's product questions are always grilling tickets on its map.

**1 · New feature.** Chart a Wayfinder map for the feature and claim it in the atlas. Then work through references ([build.md](briefs/build.md#1-references)), research and a PRD draft, and the **scenario framework**. Next come decisions: undecided screens stay provisional. Then design and build. Build screens first; components come from the feature. When it's built, the feature enters the polish loop.

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

**One queue for shared-component changes.** Two sessions changing the bundle at once is how one undoes the other. A change is shared when it touches the bundle, the tokens, the bare-screen harness, a shared stylesheet or any file that pages of two or more features load, or when it changes a screen outside its scope; `gate.mjs` decides that itself. Shared changes merge one at a time, oldest open PR first. The next one merges main forward and is gated against the new main, which re-checks every screen of every feature. Feature-only changes don't queue.

Every rejected owner example is a fixture each gate must fail ([gate.md](briefs/gate.md#rejected-examples)). All evidence records the commit it was taken on.

## Commands

| Command | Does |
|---|---|
| `npm test` | Every unit and guard test: `node --test ux/system/*.test.cjs tests/*.test.mjs` |
| `npm run atlas` | Rebuilds `atlas/atlas.json` from its sources (`atlas/SCHEMA.md`) |
| `npm run check` | Checks the atlas sources without writing |
| `npm run ux` | Serves the repo for the atlas and the prototypes (`http://localhost:4317/atlas/`) |
| `node scripts/run-scenarios.mjs` | Runs a feature's executable leaves (`features/<id>/scenarios.json`) |
| `node scripts/gate.mjs --candidate <branch> --scope <features>` | The mechanical gate on the exact merge candidate: every check, every screen diffed against main, the before/after pairs for the judge ([gate.md](briefs/gate.md)) |
| `node scripts/polish-loop.mjs <command> <feature>` | The polish loop's ledger: baseline, rounds, grades, stop conditions and the review packet ([polish-loop.md](briefs/polish-loop.md)) |
| `node scripts/feature-state.mjs <feature>` | Where a feature stands and what `/design` drives next: chart, plan, scenarios, build, polish, review or freeze |
| `node scripts/shoot-screens.mjs <out>` | Screenshots atlas screens bare at any widths and languages, and says where Chinese doesn't render |

## Briefs

| Brief | Used by |
|---|---|
| [briefs/build.md](briefs/build.md) | The builder of a screen, feature or component |
| [briefs/gate.md](briefs/gate.md) | The single gate. It replaces `component-judge` and the checklist judge, which are **retired**. |
| [briefs/walk.md](briefs/walk.md) | A persona walker or the breaker in a scenario round |
| [briefs/polish-loop.md](briefs/polish-loop.md) | The polish-loop driver, run with the `/polish-loop <feature>` skill |
| [briefs/grade.md](briefs/grade.md) | The grader at the start of each polish-loop round |
| [briefs/populate.md](briefs/populate.md) | Atlas population. It maps existing screens and designs nothing. |
| [briefs/review.md](briefs/review.md) | Screen and atlas reviews that feed the backlog |
| [freeze-checklist.md](freeze-checklist.md) | Freeze and propagation |

Standards these briefs point to: `ux/design-system/README.md` (laws), `docs/design-workflow/research/component-standard.md` (component page anatomy and checklist), and `atlas/SCHEMA.md` (atlas data and backlog item format).

## Background

- `/design-drive`, the earlier driver built on Wayfinder, is retired in favour of `/design`; its config is kept in [`docs/agents/design.md`](../agents/design.md) for history.
- Why the workflow is shaped this way: [design-loop.md](design-loop.md) and [design-loop-research.md](design-loop-research.md). What went wrong: [pilot-retro.md](pilot-retro.md). The map is [Team design workflow #20](https://github.com/xia16/Sentri-UI/issues/20).

Change the workflow in its own pull request, never inside a design PR.
