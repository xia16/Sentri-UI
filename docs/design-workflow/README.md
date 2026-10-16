# Design workflow

Sentri-UI is the design source of truth for a native-feel mobile app used by gloved, one-handed farm workers in English and Chinese. AI agents run its design work. This page is the workflow. Every session and every engineer runs this one. Words are defined in the [glossary](GLOSSARY.md).

## Getting started

The workflow runs from this repository alone: nothing on one person's machine and no private repository is needed.

1. Install [Node.js](https://nodejs.org) 22.13 or later and [Claude Code](https://code.claude.com).
2. Clone Sentri-UI, then in the repo run `npm install` and `npx playwright install chromium`. Playwright is pinned (1.63.0) so every machine renders screens the same way; the gate, the scenario leaves and the screenshots all use it.
3. Open the repo in Claude Code and accept the workspace trust prompt. The project settings declare Matt Pocock's public skills (`mattpocock/skills`, pinned to one commit) for Wayfinder and grilling; install them once with `claude plugin install mattpocock-skills@mattpocock`.
4. `npm run ux` serves the atlas at `http://localhost:4317/atlas/`; `npm test` runs the guard tests; `/design <feature>` starts work on a feature.

When a designed feature is implemented in the native Android app, use the
[implementation and feedback workflow](../implementation-workflow.md) to trace
the feature, design version, native behavior and findings in both repositories.

## Legibility gate

Legibility gate: strict

The farm legibility check (`scripts/check-legibility.mjs`, law in `ux/design-system/README.md`) holds every screen a change moves to the absolute floors. Screens a change doesn't move are reported, not blocking. Screens still drawn from the pre-workflow prototypes in `ux/archive/` and `ux/research/` fail the floors today; each meets them when its feature is redesigned through `/design`, and any feature change that moves one must bring it up to the floors. A **shared-component change** (declared `--class shared`) is held to *no worse than main* on the screens it moves instead: it may not add a violation, but the pages' own debt is fixed in each feature's pass, not by a component change (owner, 2026-10-14: components and their usages first, features later).

## Who decides what

| Who | Decides |
|---|---|
| **Agents** | Every design call: layout, hierarchy, copy within the rules, components and variants. They make the call, build it well and ship it behind the gates. They don't ask first. |
| **Gates** | Whether a change merges. Merges are automatic once every gate for the change class passes. A change that moves any screen merges only on `GATE PASS`: the mechanical checks AND the blind judge. A mechanical pass alone merges only a change that moves no screen. A design-system component page (the atlas's Components → <Name> → <variant>) counts as a screen: the page teaches the law, so it must follow it, and a change that moves one is judged before/after like any screen, never as copy only. |
| **Owner** | Product rules (behaviour, scope, what is saved, permissions) and approval of screens. The owner reacts to built work afterwards. Only **product rules** go to the backlog as decision items; design calls never do. |

An agent score is never shown as approval. The approved version of a screen stays visible until the owner promotes the new one.

## Owner rules (binding on every brief)

- **Platform first.** Under Mobile everything is the mobile app: touch-only states (Default, Pressed, Selected, Disabled, Error, Loading, Empty, Long label / Chinese). No designed hover, focus rings or keyboard rows. Screen-reader order and the keyboard covering Done are real and are checked.
- **Components come from real features.** Approved screens are the baseline. A component reproduces them and improves only by improving a feature.
- **A change must beat what it replaces**, side by side at 390px. Same or worse fails. A refactor must be identical. **The driver looks first:** before any judge or the owner sees a change, the driver opens the before/after pairs and writes one line, better or not and why. A change the driver can't call better goes back, not forward: to the same builder, with the one reason that decided it (a crit round), at most twice. The builder fixes that and anything like it, reruns its final look and hands over again. After two rounds that still aren't better, the driver files a workflow retro for the step that let it through, and a fresh builder starts from main. The owner sees only what the driver, the gate and the judge all call better.
- **Copy fits the component; real data wraps safely.** Labels we write meet the copy budget. Medicine names, ear tags and farm names can't be shortened, so each component states how it wraps and shows the full value.
- **Drawer convention.** Footer **Back** leaves and keeps the draft. **‹ Parent** goes up a level. No ✕. **Done** applies. **Reset** for filters, **Clear** for input.
- **No reason line above a disabled button.**
- **Green means approved or done only.**
- **No cards on cards; information budget.** One surface, and only items are boxes. Colour only where it means something. Nothing said twice. Rank what the farmer must see first.
- **The workflow principles.** All design work follows the six [workflow principles](principles.md) (start from what exists; every change has a known reach; information before layout; judge it by eye; prove it, don't claim it; the owner sees only finished, visual work). New lessons go into the [rules ledger](rules.md) under the principle they broke, and leave it by being absorbed into a principle or automated as a check, never as another sentence in a brief.
- **Attention budget before layout.** Showing too much is like showing nothing: when every fact gets equal weight, nothing stands out and workers stop reading. Every new or changed list, card or screen starts from an attention budget: the facts it could show, the worker's questions in order, an attention level for each fact, and a written cut list. Only then comes layout. Passing the legibility floors is not the same as being focused ([build.md §2](briefs/build.md#2-information-before-layout-p3)).
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

1. **Operations inventory.** Written to `features/<id>/operations.md` in the [operations template](operations-template.md): one table, one row per operation. Start from the baseline: the old Figma flows, the current screens, the PRD and research. List the real-world operations around the job: routine work, exceptions, corrections, handoffs, things that go wrong. For each: do farmers do it, and how often (marked sourced or inferred, with why); what's at stake; should it be recorded; where (here, another feature, nowhere); and the least UI that covers it.
2. **The cut (the 95% line).** Each operation lands in one of three places: **supported here** (common or high-stakes, and it fits the screens without new top-level actions or heavy infrastructure), **handled by another feature** (a link, not a copy) or **not supported** (rare, noisy or needing heavy infrastructure, with the reason). Agents make the cut and mark each estimate sourced or inferred; the owner reacts in the review. Only a high-stakes operation that needs heavy infrastructure becomes a decision ticket. The PRD carries the not-supported list, and `node scripts/scenario-ledger.mjs <feature> check` fails when the PRD's `## Not supported` doesn't name every not-supported row. No low-value scope creep.
3. **Scenario tree.** For every supported operation: every entity state × every event and every entry point, completely. Interruptions apply to every path that writes a record (Back mid-draft, the app closed and reopened, offline then online, time passing, another worker's record arriving, a double tap). Data, people, device and time are combined pairwise. Sequences across time, workers and features are added wherever they could lose work, double-write, show a wrong fact or block recovery. A branch ends in an outcome, a handoff or an open question, marked **S** (sourced) or **I** (inferred). Where sources disagree, RULINGS wins; no ruling makes it a question, never a guess. Traversal stops at the 95% line: below it a branch ends as not supported. Format: [scenarios.md](scenarios.md).
4. **The matrix ledger.** Before any browser work, every scenario is written down as Pending: `node scripts/scenario-ledger.mjs <feature> init` makes one row per branch of the tree. A walk moves a row to passed, failed or blocked (`mark`). A blocked scenario is never quietly re-queued (it takes the answered question to unblock it), and a product question goes to a decision ticket.
5. **Walks.** Personas from the tree, a first-time worker and a breaker walk the live screens ([walk.md](briefs/walk.md)). Each walker is split in two: a driver that performs the taps reliably, and a persona with no product context that decides what a farmer would try. A problem counts when two or more stumble in the same place (a hard defect, from one). The driver opens a round with `round` and closes it with `close`, which classifies the findings and applies the stop rules. Walk findings are hypotheses that find defects, never proof of real farm behaviour.
6. **Stopping.** The ledger decides (`scenario-ledger status`; the rules are in `scripts/scenario-rules.mjs`). A scenario loop ends as **settled** (two clean rounds with every branch walked or blocked, the last round by fresh walkers who weren't given the paths), **capped** (4 rounds, with a report of what's open), or **stuck** (only repeats or only product questions, a fix undoing another, or findings growing round on round).
7. **Leaves.** Every walked branch becomes an executable leaf in `features/<id>/scenarios.json`, run by `node scripts/run-scenarios.mjs` in EN and ZH at 360 and 390. Each carries a plain **given / when / then** for testing the live app, as well as its prototype binding. The gate reruns the leaves of every touched feature; deleting or weakening a leaf is a workflow change in its own PR. The scenario base becomes the testing ground for the live app.

## Approvals

Only the owner approves a screen, by saying "approve <screens or feature>" in any session. An agent records who, when and which commit. A screen a later change touches is **changed since approval**: back in design, with its approved version still viewable until the owner promotes the new one. A new or stricter gate binds changed screens; screens that already passed keep their status until a change touches them.

## Retros

A workflow failure is a retro: a step that stalled, a check that missed, a question the loop should have answered. Anyone files one by hand as a `workflow-retro` issue, and every map close and loop end adds the agents' own reflection. Retros feed the workflow's own backlog.

## The three modes

One entry point drives them all: `/design <feature>` ([.claude/skills/design/](../../.claude/skills/design/SKILL.md)). It reads where the feature stands (`node scripts/feature-state.mjs <feature>`) and runs the next step until a stop condition. Planning a new feature uses Matt Pocock's Wayfinder unchanged: a map of decision tickets on GitHub ([tracker operations](../agents/issue-tracker.md)). A feature's product questions are always grilling tickets on its map.

**1 · New feature.** Chart a Wayfinder map for the feature and claim it in the atlas. Then work through references ([build.md](briefs/build.md#1-start-from-what-exists-p1)), research and a PRD draft, and the **scenario framework**. Next come decisions: undecided screens stay provisional. Then design and build. Build screens first; components come from the feature. When it's built, the feature enters the polish loop.

**2 · Polish loop.** An in-design feature whose product scope is settled improves on its own. Agents complete the scenario tree, grade every screen, fix the worst, rerun the walks and leaves, and gate each round. They add no new product work. The loop ends with a review packet for the owner. See [polish-loop.md](briefs/polish-loop.md).

**3 · Freeze.** When every screen is approved, the frozen feature becomes the source the rest of the system is updated from. The freeze publishes only after propagation verifies. See [freeze-checklist.md](freeze-checklist.md).

## Order of steps for any change

1. **Class it**: copy, presentation, behaviour or shared component (table below).
2. **References**: find what exists for the job and capture the baselines before building ([build.md §1](briefs/build.md#1-start-from-what-exists-p1)).
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
| Opt-in component change (proved) | A bundle change the gate proves opt-in (existing calls render the same; added CSS needs a new hook; [gate.md](briefs/gate.md)): the gates of its own class on the features that use the new option and on the component pages, the tripwire on every other screen. No queue. |

**One queue for shared-component changes.** Two sessions changing the bundle at once is how one undoes the other. A change is shared when it touches the bundle, the tokens, the bare-screen harness, a shared stylesheet or any file that pages of two or more features load, or when it changes a screen outside its scope; `gate.mjs` decides that itself. A bundle change the gate proves opt-in is not shared. Shared changes merge one at a time, oldest open PR first. Only a PR that has passed the gate holds its place: an older one still being built or fixed doesn't block the line. The next one merges main forward and is gated against the new main, which re-checks every screen of every feature. Feature-only changes don't queue.

Every rejected owner example is a fixture each gate must fail ([gate.md](briefs/gate.md#rejected-examples)). All evidence records the commit it was taken on.

## Commands

| Command | Does |
|---|---|
| `npm test` | Every unit and guard test: `node --test ux/system/*.test.cjs tests/*.test.mjs` |
| `npm run atlas` | Rebuilds `atlas/atlas.json` from its sources (`atlas/SCHEMA.md`) |
| `npm run check` | Checks the atlas sources without writing |
| `npm run ux` | Serves the repo for the atlas and the prototypes (`http://localhost:4317/atlas/`) |
| `npm run layers` | Writes `atlas/layers.json`: every unmerged branch as a layer over the features it changes, so `npm run ux` shows them locally. The published atlas rebuilds them on its own ([SCHEMA.md](../../atlas/SCHEMA.md#branch-layers-atlaslayersjson)) |
| `node scripts/run-scenarios.mjs` | Runs a feature's executable leaves (`features/<id>/scenarios.json`). A run that fails only on a navigation timeout runs once more; twice is reported as a slow machine, not a design failure |
| `node scripts/gate.mjs --candidate <branch> --scope <features>` | The mechanical gate on the exact merge candidate: every check, the screens the change can reach diffed against main in full and every other screen at 390 EN as a tripwire (`--all`: every screen in full), the before/after pairs for the judge ([gate.md](briefs/gate.md)). One gate at a time per machine, and no other browser run from this repo beside it (each waits for the other); base shots are cached per main commit; a GitHub call that fails on the network is retried twice |
| `node scripts/gate.mjs --carry <out>` | After main moves on by files that draw no pixel and the PR merged it in and nothing else: records the gate's pass for the new head without shooting a screen; otherwise says why to gate again |
| `node scripts/polish-loop.mjs <command> <feature>` | The polish loop's ledger: baseline, rounds, grades, stop conditions and the review packet ([polish-loop.md](briefs/polish-loop.md)) |
| `node scripts/feature-state.mjs <feature>` | Where a feature stands and what `/design` drives next: chart, plan, scenarios, build, polish, review or freeze |
| `node scripts/component-jobs.mjs [word]` | One line per design-system component saying what job it does, so a builder names the existing component before building a new one |
| `node scripts/shoot-screens.mjs <out>` | Screenshots atlas screens bare at any widths and languages, and says where Chinese doesn't render; `--components` adds the design system's variant pages |

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

The owner's taste, drawn from their rulings, is [taste.md](taste.md): builders aim at it and judges stand in for it.

Standards these briefs point to: `ux/design-system/README.md` (laws), `ux/design-system/SURFACES.md` (bases, cards and the colour of current, selected and pressed: read it before building a screen), `docs/design-workflow/research/component-standard.md` (component page anatomy and checklist), and `atlas/SCHEMA.md` (atlas data and backlog item format).

## Background

- `/design-drive`, the earlier driver built on Wayfinder, is retired in favour of `/design`; its config is kept in [`docs/agents/design.md`](../agents/design.md) for history.
- Why the workflow is shaped this way: [design-loop.md](design-loop.md) and [design-loop-research.md](design-loop-research.md). What went wrong: [pilot-retro.md](pilot-retro.md). The map is [Team design workflow #20](https://github.com/xia16/Sentri-UI/issues/20).

Change the workflow in its own pull request, never inside a design PR.
