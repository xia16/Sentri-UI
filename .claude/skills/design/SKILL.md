---
name: design
description: Drive one Sentri feature through the design workflow. Reads where the feature stands and runs the next mode (chart a Wayfinder map, work its frontier, the scenario framework, build, the polish loop, freeze) until a stop condition. Design calls are made, never asked; product questions become grilling tickets on the feature's map.
argument-hint: "<feature id>"
disable-model-invocation: true
---

# Design

This session drives **one feature** through the workflow in [docs/design-workflow/README.md](../../../docs/design-workflow/README.md). Read it first: the owner rules, room to design, the scenario framework, approvals, the gates and retros all bind here.

## The loop

1. `node scripts/feature-state.mjs <feature>` says the mode, why, and what's next.
2. Do that mode (below).
3. Run it again, and keep going. Stop only when it says **review** or **freeze** (the owner's turn), when a mode's own stop condition fires (settled, capped or stuck), or when only grilling tickets are left and the owner isn't here.

Drive continuously. Don't wait for the owner between steps, and don't ask design questions: make the call, build it well, and let the owner react.

## Modes

**chart.** Nothing is designed and there's no map. Follow Matt Pocock's Wayfinder "Chart the map" unchanged. Its skill file is user-invoked, so read it from the installed plugin (the newest `~/.claude/plugins/cache/mattpocock/mattpocock-skills/*/skills/engineering/wayfinder/SKILL.md`), with the tracker operations in [docs/agents/issue-tracker.md](../../../docs/agents/issue-tracker.md).
- **Destination:** "<Feature>: a PRD with its not-supported list, and a settled scenario base, ready to build."
- **Notes** name this skill, the workflow README and the owner rules.
- **Research tickets** build the operations inventory from the baseline: the old UI in `references/figma/index.md`, the current screens in the atlas, and research.
- **Grilling tickets** are product questions only. **Out of scope** is the not-supported list.

**plan.** The map has open tickets. Work the frontier as Wayfinder's "Work through the map" says. Research runs in parallel subagents, and tasks the agent can do alone run back to back. Grilling tickets are the owner's: grill them with the grilling skill when the owner is in the session; otherwise leave them and carry on with independent work. When the frontier is empty, write `features/<id>/PRD.md`: Problem · Who · Anchor · Rules · Scope · Not supported · Decisions.

**scenarios.** Run the scenario framework from the README:
1. The operations inventory from the baseline.
2. The 95% cut, written into the PRD's "Not supported" section.
3. The tree in `features/<id>/scenario-tree.md`.
4. The matrix ledger.
5. Walk rounds with [walk.md](../../../docs/design-workflow/briefs/walk.md) until settled, capped or stuck.
6. Leaves in `features/<id>/scenarios.json`, each with its given / when / then.

A product question becomes a grilling ticket on the feature's map. For a feature with no map, open a small one, with the question as its first ticket.

**build.** Screens first, components from the feature. One builder per change with [build.md](../../../docs/design-workflow/briefs/build.md), gated by `scripts/gate.mjs`, merged behind the merge guard.

**polish.** Follow [.claude/skills/polish-loop/SKILL.md](../polish-loop/SKILL.md) to its stop.

**review.** The loop is done. Publish its packet for the owner; approvals are theirs.

**freeze.** Every screen is approved. Run [freeze-checklist.md](../../../docs/design-workflow/freeze-checklist.md) by hand; there's no automation yet.

## Discipline

- **One session drives one feature.** Coordinate only through git branches and PRs, the feature's map and tickets, ledger files and the shared-component queue. Never message other sessions or watch them.
- **Subagents get a brief and file paths, and return a short, capped report.** Evidence (screenshots, reports) stays in files, not in this conversation.
- **Models:** `opus` for judgement (grader, judge, personas, scenario trees), `sonnet` for builds and for driving taps. Use the other model family when one is available, otherwise a fresh local agent.
- **Never weaken a check, a leaf or a stop rule to move on.** A rule that is wrong is a workflow change in its own PR.
- **Retro:** when a map closes or a loop ends, write the agents' reflection into a `workflow-retro` issue. Workflow misses found on the way go there too.
