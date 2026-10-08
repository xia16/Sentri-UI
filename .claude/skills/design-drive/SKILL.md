---
name: design-drive
description: Run a feature's product and UI design to a developer handoff - research, grilling, a wayfinder map of design slices, designers building HTML states, lenses reviewing them - with the user judging only product.
argument-hint: "What to design, and in which repo - e.g. piglet processing in Sentri-UI"
disable-model-invocation: true
---

# Design drive

This session is the **design driver** for one feature. The user is head of
product: they settle the product in one grilling and judge the result. You own
everything between: research, flows, screens, copy, review, and when a slice is
done. Designers, researchers and lenses are subagents you brief and whose work
you accept or decline, each with a written reason.

The design is **HTML that works**: every screen state reachable by URL, final
copy in English and Chinese, built only from the repo's design system. The
handoff is a contract developers can build from without deciding product
behaviour.

The loop is new and still being proven. **Every place the workflow itself
fails** — a step that stalls, a lens that misses, a question the user had to
answer that the loop should have — is a **retro** entry, written when it
happens (see *Retro*). The retro is as much the output as the design.

Conventions every step relies on — folders, URL states, `data-str` and
`data-ds`, branches and commits — are in [conventions.md](conventions.md).
The lenses and their checklists are in [lenses.md](lenses.md).

## Start

1. **Read `docs/agents/design.md`.** No file: set it up. List every candidate
   design system — folders in the repo, and the user's claude.ai Design
   System artifacts (Artifact `list` with `type: "Design System"`) with their
   last-changed dates — and ask the user which is canonical. Import it
   (its `project/` files into the repo), archive the others, write the config,
   and stop for the user to confirm it.
2. **Run the doctor**: `python3 scripts/design_doctor.py --repo <repo>` beside
   this file. A **core** gap (colour, type, spacing, radius, touch size)
   stops the session: tell the user. Every other gap is **growth**: note it;
   the component ladder fills it when a design first needs it.
3. **Calibrate the lint** on the reference tasks named in the config:
   `node scripts/design_lint.mjs --repo <repo> --page <reference>`. Geometry
   findings on signed-off screens are presumed to be the rule's fault: check
   each against a screenshot, and fix the rule or the config before any
   designer sees it. Token drift on reference screens is reported, never
   fixed here.
4. **Find the map.** An open issue labelled `wayfinder:map` whose title
   matches the argument, with `Stage: working`: go to *Slices*. Otherwise
   chart one (*Charting*).

## Charting

Charting ends with a map on GitHub at `Stage: working`, a map branch
`map/<n>-<slug>` in the design repo, and nothing left for the user to settle
before design starts.

1. **Research**, in background subagents, before a single question to the
   user. Each writes into `ux/tasks/<task>/research/`:
   - an **inventory** of existing screens for this task (the repo's
     prototypes and, if the config names one, the Figma file — frames, flow
     arrows, annotation notes);
   - **domain sources**, each claim tagged *sourced* (with its citation) or
     *inferred* (with why it seems real);
   - a **scenario tree**: every entity state crossed with every event, each
     branch ending in an outcome, a handoff to another task, or `?`;
   - an **evaluation set**: 12–20 cases (ordinary, exception, cross-task)
     stating behaviour, never screens. It is frozen before design and kept
     from every designer and lens; it judges the run.
2. **Grill** with Matt's `grilling`. The agenda: the open questions the
   research raised; what is recorded and what identity and count mean;
   irreversible actions; permissions; scope; any change to a component a
   finished task uses; and, on a repo's first map, the verb set's meanings.
   Record each answer in the repo's rulings file as it is given.
3. **Chart the map** with Matt's `wayfinder`: one ticket per design slice (a
   sub-flow that can be designed and reviewed alone), each linking the map.
   The Notes carry: the design-system version, *Waiting on you*, *Decided
   for you*, the **provisional** ledger (see *Deciding*), and
   `Stage: working` once the user agrees the map.

## Slices

Work the map's frontier. Slices that touch different screens run in parallel.

1. **Brief a designer** (a subagent; its model from `dispatch.py plan` in
   `drive`'s scripts, tier by the slice). The brief: the slice ticket, the
   rulings, the scenario branches this slice owns, the design system's
   README and the cards it will use, the reference task, and the rule to
   run the lint after every edit and leave nothing at error.
2. **The ladder.** A designer that needs something the design system lacks
   climbs it: use as is → existing variant → compose a pattern → new
   variant → new component. The top two rungs are a **candidate**: it goes
   to a design panel (see [lenses.md](lenses.md)) and enters the design
   system marked `candidate`, never `approved`.
3. **Review with the lenses** for this slice. Each lens is a fresh subagent
   with one question; at least one runs on the other model family through
   `collab`, handed screenshots and the lint report as files. Findings name
   an element (`data-str`, `data-ds`, or a selector), never "the page".
4. **Decide each finding**: accept it (the designer fixes it; the lens
   re-runs, fresh) or decline it with the reason. Commit each round with
   the findings applied and declined in the message.
5. **Done** when the lint is clean, no lens finding stands, every state in
   the slice is reachable by URL, and the doctor passes for every component
   the slice uses (`--used`). Merge the slice PR into the map branch.

## Scenario rounds

Scenarios surface from the design as much as from planning. After slices
land, send **walk-through** agents — one per scenario, playing the worker —
through the whole task in a real browser, plus one **breaker** with no script.
Each new scenario goes to `scenarios.md` and is classified: already handled ·
change a slice · new slice (a ticket) · new module (simple: spec it and add
slices; complex: *Waiting on you*). The task is **settled** after two
consecutive whole-task rounds find nothing that changes the design.

## Deciding

You decide everything the grilling did not reserve for the user. The user
decides: what is recorded and what identity and count mean, irreversible
actions, permissions, scope, and changes to components or tokens a finished
task uses. When something the grilling missed turns up:

- **Small**: decide, and add it to *Decided for you* with the reason.
- **Reserved for the user**: proceed on your recommended default, marked
  **provisional** — a ledger entry naming the states that rest on it and the
  alternatives. The user's answer confirms it or reopens exactly those states.
- **A real divergence from what the user agreed**: *Waiting on you*, and work
  the rest of the map.

## Closing

1. **Score** the design against the evaluation set: each case passed,
   partial or missed, with the screen states that show it.
2. **Handoff**: `contract.html` (states, transitions, preconditions, cancel
   and retry), the scenario-to-state matrix, the ADRs, the candidate
   components, and the zh strings.
3. **The review page** for the user: decisions made for them, provisional
   entries, candidates to approve, and strings new or changed — contents or
   usage — since the last approved version, each in context.
4. **One PR** from the map branch to `main`. Its merge is the user's
   approval; tag it. Approved candidates become `approved` in the design
   system and its version moves.
5. **File the retro** (below).

## Retro

Keep a retro file for the map (`ux/tasks/<task>/retro.md`) from the first
step. An entry is any point where the workflow — not the design — went wrong:
the stage, what happened, why, and the change to the workflow it implies.
Write it when it happens. At close, open one issue in this plugin's repo
labelled `workflow-retro` linking the file, the evaluation-set score, and the
entries in order of cost.
