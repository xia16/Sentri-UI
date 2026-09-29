# Retro — piglet processing (仔猪处理) design drive

Where the workflow, not the design, went wrong. One entry per event, written
when it happened. Cost: **low** (minutes, no user time) · **medium** (an agent
round or a rework) · **high** (user time, or a wrong design shipped to review).

## 1 · Start — the doctor command does not run on Windows

- **Stage:** Start, step 2.
- **What happened:** `python3 scripts/design_doctor.py` hit the Windows Store
  alias ("Python was not found"). `python` (3.13) runs it.
- **Why:** the skill names `python3`, which is not a real interpreter on a
  default Windows install.
- **Change:** name `python` (or `py -3`) in the skill, or have the skill say
  "the repo's Python 3" and let the driver pick.
- **Cost:** low.

## 2 · Start — the doctor finds no core gaps but reads the old hand-run file as current

- **Stage:** Start, step 2–3.
- **What happened:** `ux/design-system/DOCTOR.md` is the hand run from
  2026-09-28 and says it "is replaced by the tool's output" once the tool
  lands. The tool now exists; nothing in the skill says to write its output
  back, so the file and the tool now disagree (the file lists missing field
  cards — Stepper, Measure, Numpad — that the tool does not check for).
- **Why:** the doctor checks cards that exist; it cannot know which cards a
  README's law names but nobody has built.
- **Change:** the doctor should read component names the README's laws
  mention and report missing cards as growth; the skill should say where its
  output is kept.
- **Cost:** low.

## 3 · Start — `dispatch.py plan` is not in `drive`'s scripts

- **Stage:** Slices, step 1 (found while reading ahead).
- **What happened:** the skill says the designer's model comes from
  `dispatch.py plan` "in `drive`'s scripts". No such folder beside this
  skill; the only `dispatch.py` is in the adam-agent-workflow plugin's
  `events/` folder (several cached versions).
- **Why:** the reference points at a skill layout that does not exist here.
- **Update (Slices):** that `dispatch.py` is an event-hook dispatcher with no
  `plan` command at all. Tiering was decided by hand: Opus for slices that
  change a shared component or carry the ledger (S2, S5, S6, S7, S9), Sonnet
  for the rest.
- **Change:** name the path, or state the tiering rule in the skill.
- **Cost:** low.

## 4 · Charting — domain research missed the reference task's closure contract

- **Stage:** Charting, research.
- **What happened:** the domain agent reported that farrowing "never closes
  under RULINGS", so processing's wait-for-farrowing dependency "has nothing
  to wait on". `ux/research/farrowing/ASTRA-TASK-CLOSURE.md` (2026-09-17)
  defines farrowing's End task and supersedes `lifecycle.md`. The blind
  second-model pass caught it; my own merge would have carried the error into
  the grilling as a false premise.
- **Why:** the research brief named RULINGS and SYNTHESIS as the internal law
  but not the reference task's later contracts; RULINGS itself does not link
  them.
- **Change:** the research brief should list every signed-off contract of the
  reference task (`*-contract.html`, closure docs), not just the rulings file;
  or the config should name them.
- **Cost:** low (caught before the user saw it).

## 5 · Charting — the grilling asked for rulings the owner needed facts to make

- **Stage:** Charting, grilling round 1.
- **What happened:** the owner answered several questions with fact questions
  of their own: do piglets that skip iron get it later? how do farms handle a
  piglet fostered from an unprocessed litter into a processed one? are
  farrowing sows individually housed, so multi-sow pens don't arise? The
  research had most of these facts (domain.md A1, A5) but the questions
  showed only options and a recommendation, not the practice behind them.
  Three questions came back as "investigate first", costing a round.
- **Why:** the grilling format carries options and a recommendation; nothing
  in the skill says to put the domain fact that grounds each option in front
  of the owner.
- **Change:** each grilling question states the real-world practice it rests
  on (one or two sourced lines) before the options. The research brief should
  also ask "how do farms handle X today" for every open question, not only
  "what do the sources say".
- **Cost:** medium (a research round and a grilling round).

## 6 · Charting — wayfinder is not invocable and there is no tracker doc

- **Stage:** Charting, step 3.
- **What happened:** the skill says to chart with Matt's `wayfinder`; the
  plugin ships it with `disable-model-invocation`, so it is not in the
  session's skill list, and the repo has no tracker doc
  (`docs/agents/issue-tracker.md`) naming how sub-issues and blocking are
  expressed. I read wayfinder's SKILL.md directly and used GitHub's native
  sub-issues and `blocked_by` dependencies. Wayfinder's own rule — tickets are
  *decisions*, "plan, don't do" — contradicts design-drive's "one ticket per
  design slice"; the map's Notes override it explicitly.
- **Change:** design-drive should either carry the map/ticket shape itself or
  name the tracker operations; and say plainly that its tickets are build
  slices, so wayfinder's decision-ticket rule is overridden.
- **Cost:** low.

## 7 · Charting — the map branch cannot be cut from `main`

- **Stage:** Charting, map branch.
- **What happened:** conventions say `map/<n>-<slug>` is cut from `main`, but
  the design-system import, the design config and this map's research sit on
  `design/piglet-processing-pilot`, 10 commits ahead of `main`. Cutting from
  `main` would leave the map without its design system. Cut from the pilot
  branch's head instead; the closing PR to `main` will carry those 10 commits.
- **Change:** Start should end by landing the setup (import, config, doctor)
  on `main`, or conventions should say the map branch is cut from wherever
  the setup lives.
- **Cost:** low now; the closing PR is larger to review.

## 8 · Slices — the lint has no notion of a screen state

- **Stage:** Slices, S0.
- **What happened:** the lint renders `pages` from the config, one URL each.
  Every `?state=` a slice adds must be its own `pages` entry in
  `docs/agents/design.md`, so six parallel slices all edit one JSON block —
  a merge conflict per slice — and a state not listed there is never linted.
- **Change:** let a page entry carry `states: [...]` (the lint appends
  `?state=` for each), or let the lint discover states from a page's own
  index (`data-states` on the root).
- **Cost:** low per slice; the driver resolves the conflicts.

## 9 · Slices — the design system's tokens were never consumable, and the doctor passed it

- **Stage:** Slices, S0.
- **What happened:** `bundle.css` reads `--ink`, `--red`, `--line`,
  `--app-background`, `--font-sans` … but nothing defines them: the import
  brought `tokens.json` and no `tokens.css` (the artifact generates its CSS
  at render). Any screen built "only from the design system" rendered with
  inherited or missing colours. The doctor reported **core present** because
  it checks that token categories exist in `tokens.json`, not that a page can
  use them. Fixed by generating `tokens.css` from `tokens.json`
  (`scripts/tokens-css.py`), no values changed.
- **Change:** the doctor's core check should render one probe element with the
  bundle and assert the core tokens resolve; the import step should generate
  or copy the CSS the bundle expects.
- **Cost:** medium — caught by the first designer, before any slice screens.

## 10 · Slices — the components cannot be used on a strict page

- **Stage:** Slices, S0.
- **What happened:** `SentriUI` factories escape every string and mark no
  component root, but strict pages need `data-str` on text and `data-ds` on
  roots. The S0 designer hand-copied component markup to pass the lint — the
  drift the design system exists to prevent. Added an additive `strs`/`args`
  option and a `data-ds` root marker to the bundle before the parallel slices.
- **Change:** the contract the lint enforces (`data-str`, `data-ds`) should be
  checked against the component layer at Start: the doctor can render each
  card's preview and require `data-ds` on its root.
- **Cost:** medium.

## 11 · Slices — the ladder assumes one slice meets a missing card at a time

- **Stage:** Slices, before the first parallel wave.
- **What happened:** the doctor's growth rule says the ladder fills a missing
  card "when a design first needs it". Five of six frontier slices need
  Stepper, and two need Numpad and Measure. Run in parallel, each designer
  would climb the ladder alone and five steppers would reach the panel.
  Resequenced: a field-cards step (extract farrowing's ruled `− n +` stepper
  and pad grammar as candidates, one panel) runs first; slices that need no
  new field start alongside it.
- **Change:** at chart time, cross the slices with the doctor's growth gaps;
  any card two or more frontier slices need becomes its own first ticket.
- **Cost:** low (caught before dispatch).

## 12 · Slices — S0's copy lens did not converge: the glossary defined states no slice had designed

- **Stage:** Slices, S0 review rounds 1–3.
- **What happened:** three fresh Copy-lens rounds each found real, different
  defects — nearly all in glossary terms for states that belong to later
  slices (owed vs missed, unfinished at End, identified vs alive). Each fix
  exposed the next edge. One (an early End freezes not-yet-due doses) was a
  product gap the grilling missed and went to the provisional ledger.
- **Why:** S0 was asked to define every count up front, before any slice had
  drawn the state that shows it; a lens attacking definitions with no screen
  behind them has unlimited surface.
- **Change:** S0 defines verbs, shared strings and only the counts already
  ruled; each slice adds the glossary terms for the states it draws, and its
  Copy lens attacks them with the screen beside them. Also: an exit rule per
  lens loop ("stop when a round finds nothing that changes a record or a
  ruling") should be in lenses.md, not improvised.
- **Cost:** medium (three lens rounds; one real product gap found, which is
  the loop working).

## 13 · Slices — parallel lints would have checked each other's worktrees

- **Stage:** Slices, before the first parallel wave.
- **What happened:** the lint reuses whatever answers on the config's port
  (`if (await up(base)) return null`). Two designers linting at once from two
  worktrees would render each other's files and pass or fail on the wrong
  design. Added `--port N` to the lint; each designer gets its own port.
  Also, `.claude/` is untracked, so worktrees have no copy of the skill's
  scripts: designers run them from the main checkout with `--repo <worktree>`.
- **Change:** the lint should start its own server on a free port unless told
  to reuse one; the skill should say worktrees need the scripts by path.
- **Cost:** low (caught before dispatch).

## 14 · Slices — lint calibration never rendered the component bundle

- **Stage:** Slices, S10 (first slice screens).
- **What happened:** every strict slice page failed the lint with 164 errors,
  all from the design system's own components (spacing 5 / 9 / 10, radius 6).
  Start's calibration ran only on farrowing and inspection, which use their
  own prototype CSS, never `bundle.css`, so the bundle's drift was invisible
  until a designer built from it — the one path the loop mandates.
- **Change:** calibrate the lint on the design system's own card previews too
  (every `components/*/preview.html`), and treat drift found there as the
  design system's, reported once, never charged to a slice.
- **Cost:** medium (a designer's lint run spent; config patched by the driver).

## 15 · Slices — the other-family lens cannot be handed screenshots as files

- **Stage:** Slices, S10 review (Consistency lens).
- **What happened:** the skill says the other-family lens is "handed
  screenshots and the lint report as files". `collab.py discuss --context`
  reads every context file as UTF-8 text and crashed on the first PNG. Worked
  around by naming the image paths inside the prompt for the colleague's CLI
  to open itself — whether it actually looked at them is unverified.
- **Change:** `collab` should accept `--image <path>` and pass images through
  the backend's image input; until then the skill should say "name the image
  paths in the prompt" and ask the lens to cite what it saw in each image.
- **Cost:** low.

## 16 · Slices — lint side effects designers tripped on

- **Stage:** Slices, first wave (field cards, S1, S10).
- **What happened:** (a) on Windows the lint's `server.kill()` on a
  `shell:true` spawn leaves `serve-ux` listening, so the next run on that
  port silently reuses a server rooted in whichever worktree started it;
  (b) the tap-size rule measures the transformed rect, so a 44px control
  that scales to .96 on press (the design-system's press law) fails the
  44px minimum — the Stepper author moved keys to 46px to pass; (c) a
  content-sized drawer under ~30% of the screen is not treated as a layer,
  so the page behind reports collisions — S1 forced its scan sheet to
  `long`; (d) the first slice designers each widened `allow` themselves.
- **Change:** kill the process tree (or serve in-process); measure tap size
  on the untransformed box; treat any `[data-st-context=drawer]` as a layer;
  the brief says `allow` is the driver's.
- **Cost:** low each; (b) and (c) bent designs toward the tool.

## 17 · Slices — seven lenses per round overlap heavily

- **Stage:** Slices, S10 and S1 round 1.
- **What happened:** of S10's ~45 lens findings, the same five defects were
  raised by three or four lenses each (stale weight label, missing record
  group on orphan, sow-died said three times, Edit target too small, weight
  field above the actions). S1 repeated the pattern (scan vs find by five
  lenses, the chip/line-2 duplication by four). Each round costs seven agent
  runs plus the driver's merge of overlapping reports; the unique yield came
  mostly from Scenarios (the mid-farrowing sow death, list reflow under the
  thumb) and Consistency (rulings the designer missed).
- **Change:** run Scenarios, Consistency (other family) and one combined
  "craft" lens (interaction + copy + information + visual + simplicity with
  their checklists) in round 1; split the craft lens only when it returns
  more than ~15 findings. Re-runs after a fix round only need the lenses
  whose findings were applied.
- **Cost:** medium (tokens and driver time; no design harm).

## 18 · Slices — the lint cannot see inside a drawer, and trusts any card name

- **Stage:** Slices, S7 (Move), S10.
- **What happened:** (a) the lint's full-page screenshot captures the page,
  not the content of an internally scrolling drawer, so everything below a
  drawer's fold (the Move's questions, the tag list, the owed section) was
  never seen by the lint or by lenses reading its screenshots; S7's designer
  wrote a tall-viewport Playwright script to look. (b) `ds-unmarked` checks
  that a control sits inside *some* `data-ds`, not that the name is a card:
  S10 marks wrappers `data-ds="Section"` and passes.
- **Change:** the lint scrolls each `[data-st-context=drawer]` body and
  screenshots it in pages; `data-ds` values must match a folder in
  `components/` or start with `Candidate:`.
- **Cost:** medium — lenses judged states from partial pictures.

## 19 · Slices — parallel slices invented their own litters

- **Stage:** Slices, S1 × S2 × S10 × S7.
- **What happened:** each designer made up fixtures for the same room: crate
  A02 owes iron + tail on the room list and five doses on the litter sheet;
  C04 is day 3 on one and day 2 on another; S10 and S2 registered duplicate
  strings for the same Record group because neither was on the map branch.
  "Every number on every mock agrees" held inside a slice and broke across
  them. The walk-through agents would hit contradictions the moment they
  click from room to litter.
- **Why:** the brief gave each slice the rule but no shared data; parallel
  slices cannot see each other's branches.
- **Change:** the first slice ticket (or the driver at charting) writes one
  fixture module for the task — the room, its crates and litters, their
  day-ages and schedule — and every page reads it; shared UI (a header, a
  Record group) is extracted to the shell the first time two slices need it.
- **Cost:** medium (a reconciliation pass at integration).

## 20 · Slices — every slice re-implemented the ledger, and the lenses became code reviewers

- **Stage:** Slices, S1 · S2 · S5 · S7 review rounds.
- **What happened:** because the design is "HTML that works", each page
  carries its own arithmetic for alive, owed, treated, open losses and moves.
  The blockers the lenses found in rounds 2–3 were almost all arithmetic in
  those private copies: negative alive in the dead drawer (cap vs allocation),
  owed read from "the last record" (castration catch-up), `Σn > alive` as a
  double-treatment test, a Move receipt that reversed its own record, a
  finished litter crashing the room list. Each fix was local; the same class
  reappeared in the next slice. Exit rounds kept finding real majors (S1 took
  four rounds, S5 three).
- **Why:** the loop gives each slice a page and a fixture but no shared
  domain model, so the ruled ledger (RULINGS round 2) exists only in prose.
- **Change:** when a map rules a ledger or state model, its first ticket
  builds it once as a small shared module (`ledger.js`: events in, derived
  facts out, with tests from the ruling's scenarios), and slices render from
  it. Lenses then judge the design, and the module's tests judge the
  arithmetic. It would also be the contract developers build from.
- **Cost:** high — most review-round blockers, several fix rounds per slice.

## 21 · Slices — the doctor's verb rule reads only the first word

- **Stage:** Slices, S9.
- **What happened:** the doctor checks that an `action` string starts with a
  registered verb by its first word, so the ruled multi-word verbs (`End
  task`, `Set count`) always fail; designers either live with a false gap or
  relabel strings to hide it.
- **Change:** match the longest registered verb as a prefix.
- **Cost:** low.
