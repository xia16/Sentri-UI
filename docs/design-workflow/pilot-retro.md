# Design loop — pilot retro

The piglet-processing pilot exists to find what is wrong with the design loop,
not to produce piglet-processing screens. The screens in the repo are
placeholders; the product of the pilot is this log. Each entry: the stage, what
happened, why, and what the workflow changes. Scored at the end against
`ux/tasks/piglet-processing/research/eval-set.md` in Sentri-UI, which was fixed
before any design existed.

## Found while setting up (2026-09-28/29)

### R1 · setup · the loop designed against the wrong design system

**What happened.** Three design systems sat in the repo and one on claude.ai.
The driver compared against the August export in `Sentri Design System/`,
called Astra "older", and proposed deriving scales that already existed. The
user corrected it: the claude.ai artifact (24 Sep, built from Astra) was the
newest and most complete.

**Why.** Nothing named the canonical system, so the driver ranked by folder
name and git dates, and read a stale export as the source.

**Workflow change.** `docs/agents/design.md` names the design system, and the
doctor refuses to run without it. When setting up a repo, the loop lists every
candidate (repo folders and claude.ai Design System artifacts, with their
last-changed dates) and asks which one is canonical, instead of guessing.
Stale copies are archived in the same step.

### R2 · tools · a new lint's first findings were mostly false

**What happened.** The first rendered lint reported 262 collisions on
owner-signed screens. All of them were false: rows scrolled out of view, a
scrim behind a drawer, a tap area deliberately enlarged, a checkbox tapped
through its label. After four corrections the finished screens came out clean
on geometry. A synthetic fixture then showed the unreachable-content rule had
never fired at all.

**Why.** Rules written from first principles, without running them on screens
that are known to be good and known to be bad.

**Workflow change.** Before a rule may fail a design, it is calibrated twice:
silent on the repo's signed-off reference tasks (a finding there is presumed
to be the rule's fault until a screenshot proves otherwise), and firing on a
fixture made to break it. Designers never see an uncalibrated rule's
findings.

### R3 · plan · "fix the design system first" contradicted "grow as you design"

**What happened.** After the first doctor run the driver planned a
design-system map, adding the Stepper, Measure and Numpad cards, before the
pilot. That is the component ladder's job during design, and doing it by hand
first would have kept the pilot from exercising the ladder and the panel.

**Why.** The doctor reported every gap at once. The driver read the gap list
as a to-do list rather than asking which gaps block the *core*.

**Workflow change.** The doctor separates **core gaps** (block all design)
from **growth gaps** (filled by the component ladder when a design first needs
them). Only core gaps block a pilot or a feature map. Token drift in existing
screens is reported, never a blocker for new work.

### R4 · evidence · the old designs are boards, not states

**What happened.** Sentri's finished screens are studio boards (several phones
and captions on one page, state driven by in-page JavaScript), not
URL-addressable states. The lint had to learn to measure each phone canvas as
its own screen, and none of the reference states can be opened by URL.

**Why.** The loop assumed its own output format (one state per URL) for
reference material that predates it.

**Workflow change.** Reference tasks are measured as boards: the lint's
`screen_root` treats each phone as a screen. New work is always
URL-addressable. Consistency checks against a reference compare what a board
shows at load; states behind interactions are not reachable, and the
cross-task lens is told so.

## Found while building the gate (2026-10-10)

### R5 · gate · a guard that parses shell command lines can always be talked around

**What happened.** The merge guard first accepted any line with a pinned commit somewhere on it. A gate judge got a second, unpinned merge through by chaining it (`;`, then `&`), by putting the commit in a quoted subject or after `#`, by repeating the flag, and by writing `gh.exe` or quoting the words.

**Why.** Each fix closed one spelling. A parser of shell syntax written as patterns is always one spelling short.

**Workflow change.** Guards are allowlists. Anything that looks like a merge, after quotes and `.exe` are stripped, or any push to main is blocked unless the whole command is exactly one pinned merge. Every bypass a judge finds becomes a test (`tests/merge-guard.test.mjs`).

### R6 · gate · pixel diffs failed on things the change never touched

**What happened.** Three gate runs of a no-change workflow PR failed:
- a font that failed to load once (prototype pages load Google Fonts) rendered in the fallback face on 98 screens;
- a resource error showed up as a new state-check problem;
- a blurred backdrop behind a sheet rendered a few pixels differently on each run.

**Why.** The renders depend on the network and on timing, not only on the code.

**Workflow change.** Shots wait for fonts and retry a screen whose font failed. A new state-check problem must reproduce on a rerun. A screen that renders differently twice on base still goes to the judge, but it doesn't fail a refactor or escalate the class by itself. Vendoring the fonts into the repo would remove the network from renders entirely; it's a later design-system change.

### R7 · gate · main itself failed a check every PR is held to

**What happened.** Two merges to main (#109, #110) left `atlas/atlas.json` stale against its sources. Every candidate then failed "atlas.json is regenerated", whatever it changed.

**Why.** Those merges ran before the gate runner existed, and nothing on main checks main.

**Workflow change.** Main's debt is reported, not charged to the next PR: a stale atlas blocks only a change that touches the atlas sources. The gate on every merge stops main from going stale again.
