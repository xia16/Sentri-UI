# Design loop — decisions so far

Status: grilled 2026-09-28; pilot next. Nothing built. First target:
仔猪处理 (piglet processing) in `xia16/Sentri-UI`.

## What it is

An autonomous product/UI design workflow. The user brings a goal, spec or
existing references; after one discussion and grilling, agents do the rest —
research, scenarios, flows, screens, review — and hand developers a design
that is ~95% done. The user judges high-level product only. It must work for a
brand-new feature and for one with existing references, in any repo.

## Why

Single-pass AI design misses interactions, labelling, information, scenario
enumeration, alignment and cross-screen consistency. One agent designing and
then checking its own work runs out of attention before it runs out of issues.
The fix is separate single-question reviewers who did not make the thing,
repeated until nothing they raise changes the design.

## Settled

**Shape.** Research → grilling → a wayfinder map on GitHub (one per feature,
in the design repo) → a design driver works the map's slices → close. Slices
are the map's tickets; new slices found mid-run are added as tickets. The
Notes hold *Waiting on you* and *Decided for you*.

**Grilling settles the product.** What is recorded and what identity/count
mean, irreversible actions, permissions, scope, and changes to components that
finished tasks use. After grilling the agents decide, and surface only a real
divergence. An unknown found mid-run proceeds on a recommended default marked
provisional.

**The driver owns delivery**, as a product owner. Lenses and panels advise; the
driver accepts or declines each finding with a reason and decides when a slice
is done.

**Scope.** Every scenario ends in an outcome or an explicit handoff to an
adjacent task (information passed, owner, where the worker returns). A missed
module that is simple is re-specced and designed by the agents; a complex one
goes to the user.

**Scenarios are found in iterations.** Planning finds ~60%; the rest appear
once there is a design to walk. A living scenario register per task; its main
source is walk-through agents playing workers on the actual design. Each new
scenario is classified: already handled / change this slice / new slice / new
module. Stops after two consecutive whole-task walk-through rounds that change
nothing.

**Source authority.** Behaviour: user rulings > verified domain research >
old-UI annotations > unfinished new screens (intent only). Presentation: the
design system and finished tasks > everything else. For a feature from zero,
only rulings, research and the design system apply.

**Handoff** is HTML and an executable contract: every state reachable by URL,
final copy, validation and recovery shown, and a state-contract document.
Automated checks prove consistency and behaviour, not field usability; the
handoff says so.

**Components.** A ladder — use as is → existing variant → compose a pattern →
new variant → new component. The top two rungs go to a design panel: pattern
research (Mobbin, Chinese mobile libraries such as Ant Design Mobile / Vant /
TDesign, the old UI's attempts), two or three designers from different
patterns, a crit by distinct roles (farm worker, design-system steward,
interaction critic, developer cost), then the other model family refutes. A
gap is decided inside the task; a weak component used by finished tasks is a
design-system change for the user.

**Copy.** Designed in English first, translated to Chinese; i18n kept. One
string registry per repo, keyed by meaning, with a fixed verb set (Done /
Save / Back / Cancel / Submit … each with one meaning) and the domain glossary.
A script flags any string not in the registry; a lens judges new strings
against the voice guide and prior designs. Geometry and stress checks run on
both locales, since Chinese length is what breaks layouts.

**Visual checks, in order.** Geometry in a real browser (overlap, overflow,
off-grid, tap targets, off-viewport, keyboard open) → stress data (0/1/30+,
longest names, missing fields) → vision (hierarchy, crowding, side-by-side
with finished tasks) → click-through (scripted scenario walks and a free
breaker agent). Requires every state to be URL-addressable and elements to
carry their design-system component.

**Lenses**, each a separate agent with one question: scenarios, interaction,
labelling/copy, information, visual, cross-task consistency, simplicity
(Colborne's remove / organise / hide / displace; Tesler — say where the
complexity went). A miss the user catches at final review is a missing line in
a lens's checklist, and is added there.

**Models** come from the existing catalog: a role names a capability level and
`dispatch.py` picks the model, as `drive` does.

**Per-repo config.** `docs/agents/design.md` names the design system path,
tokens, component registry, rulings file, string registry, the prototype serve
command, viewports and the finished reference tasks. Absent → the skill offers
to set it up and stops. For Sentri it points at the newest design system
(`ux/system/`, Astra).

**Lineage.** One branch and PR per slice, merged by the driver; one commit per
loop round whose message lists findings applied and declined; a tag at each
user review. No images are ever stored. Every render input is committed or pinned —
fonts vendored, fixture data, the Playwright version in the lockfile — so any
commit re-renders. A baseline is the tag the user approved: drift is checked
by rendering that tag and the current head side by side in the same run, on
the same machine, which also cancels font-rendering differences between
Windows and macOS.

**From the research** ([design-loop-research.md](./design-loop-research.md)),
adopted whole: lint runs inside the designer's own loop as a CLI, not only as
a gate; anything the design-system config does not list is forbidden (v0);
the design system is served as short files read on demand; every visible text
node carries a registry ID, plus a banned-synonym table; zh gets glossary,
length and punctuation checks and a pseudo-locale render (~+40%); a fixed
state checklist per screen (ideal, empty, loading, error, partial, offline);
screenshot baselines once a state is approved (see Lineage: a baseline is a re-render of the approved tag, not a stored image); axe on every state; a
cross-screen geometry check; lens rounds use fresh reviewers and point at
element IDs, never at pixel alignment; a panel explores alternatives but has
one author refined by critics, never a merge of drafts.

**Verb meanings** are drafted by the driver from Carbon, NN/g, Ant Design and
the repo's existing usage, approved by the user once in the first task's
grilling, and change only through the user afterwards.

**A sibling skill to `drive`**, reusing its map operations, `dispatch.py` and
`collab`, not a mode inside `drive`.

**Check tools ship with the plugin**, generic, configured per repo by
`docs/agents/design.md`. Node and Playwright become a `doctor.py` check.

**Chinese copy**: agents translate under the checks; the user's final review
page lists only strings new or changed since the last approved version.

**From the challenge round** (the other family, attacking the settled design;
each checked before adoption):

- *Provisional decisions graduate.* Each is a ledger entry naming the
  scenarios and states that rest on it and the evidence that would settle it.
  The user's review page resolves it; a changed answer reopens exactly those
  states and voids their acceptance evidence.
- *Facts are not field meanings.* Before the source ranking applies, every
  count or identity rule is written with its entity, population, time and
  scope in the glossary. Farm research says how farms work; it is not
  evidence of what a Sentri field means. The ranking settles only real
  conflicts about the same thing.
- *The contract covers transitions, not only states:* preconditions, effects,
  cancel, retry and invariants. The pilot drives at least one interruption and
  retry through real UI actions.
- *A handoff is an endpoint only with its outcomes owned:* accepted,
  cancelled, partial, and the return failing, with what each does to this
  task's counts and completion.
- *Browser-bound lenses run on this machine.* `collab` reviewers get read-only
  tools and a `git archive` of HEAD, and a dispatched reviewer cannot reach
  the local preview server. So geometry, stress, vision and click-through run
  as local subagents; a cross-family lens gets the rendered evidence
  (screenshots, lint reports) as files, never a localhost URL.
- *New components are a transaction:* candidate registry entry, component,
  usages and panel record move together through the slice. The lint accepts a
  `candidate` for exploration and only `approved` for delivery; promotion is
  an explicit step.
- *The review delta covers string usages,* not only contents: an unchanged
  string used for a new action or in a new context is shown in context.
- *The pilot is judged against an evaluation set fixed before it runs* — from
  the user's grilling answers, the old UI's annotations and
  `ux/research/tasks/piglet-processing.html`: an ordinary path, an exception,
  a cross-task boundary. The report says what one slice proves and what it
  leaves untested (whole-task convergence, cross-slice consistency).

**Where the work lands.** The map owns the process, not the files: its
deliverables go to the one living design in the repo, filed by what they
describe. For Sentri:

```
ux/
  system/     design system: tokens, components, icons, component registry
  laws/       RULINGS.md · strings.json (en + zh, verb set) · glossary.md
  app/        the shell (home, navigation); every task reachable from it
  tasks/<task>/   screens built only from system/ · contract.html ·
                  scenarios.md · research/ (sources, evaluation set)
  adr/        one decision per file, linking the map that made it
```

A task folder may not restyle `system/` (linted). A change to `system/` or
`laws/` re-renders every task, so the user sees each finished task before and
after. The map's Notes list the paths it touched; each task's README links the
maps that shaped it.

**Main is what the user approved and developers can take.** Slice PRs merge
into a map branch (`map/<n>-<slug>`) under the driver's authority; the user's
final review is one PR from the map branch to main, tagged — the tag is also
the render baseline. Concurrent maps rebase on main after each merge and
re-run their checks.

**Sentri migrates gradually.** The pilot uses the new layout; `system/` stays
where it is. Farrowing, inspection and folding the `*-refinement.css` patches
back into `system/` are a later map of their own. The uncommitted work in
`ux/system/` is committed before the pilot starts.

**The design system comes first.** The loop designs only against a system
that passes the design-system doctor.

- *Contract:* the Claude Design System artifact type's own structure —
  `tokens.json`, a README of laws, a card per component (README + preview),
  types, assets — plus what the loop needs: every state per component,
  adherence rules, a link to the string registry, a version.
- *Grows as you design.* A required core from day one (colour, type scale,
  spacing, radius, touch size); everything else fills in as features land.
  A candidate becomes part of the system when the user approves it in a
  review; a rejected one is dropped. The doctor checks the core exists and
  that everything a delivered design uses is complete.
- *Three starting points, one doctor:* an existing system is imported and its
  gap list becomes the first design-system map; a new one is a short grilling
  on direction, generated with Claude's Design System tooling; an adopted
  library (shadcn etc.) supplies components from its registry while the
  doctor flags what the conditions need that it lacks.
- *The repo is the source.* The artifact's files live in the repo;
  `tokens.json` is the contract CSS reads from; the artifact is republished
  from the repo at each version, never edited on its own.
- *Versioned.* Each design records the version it was built against.
  Additions ride in feature maps as candidates; a change to an existing
  token or component is its own design-system map with a before/after of
  every task.

**Sentri.** The artifact (24 Sep, built from Astra) is the design system;
imported to `ux/design-system/` and the August export archived. The first
doctor run (`ux/design-system/DOCTOR.md`) found: eight record-sheet field
types without cards (Stepper, Measure and Numpad block the pilot); no
standard States section; the prototype CSS off-token (909 of 3205 spacing
values, 628 raw colours); no adherence rules; no string registry; no
semantic version. Those gaps are the design-system map that runs before the
pilot.

## Pilot

Piglet processing (仔猪处理), before building the rest: grilling → map → one
slice with three lenses (scenarios, copy, visual) plus the geometry and copy
lints. Measure what it misses, then add the remaining lenses and the panel.
The pilot also sets the effort budget left open.

## Open

- Model capability beyond tier: the visual lens needs a vision-capable model;
  add that as a requirement `dispatch.py` honours.
- The skill's name.
