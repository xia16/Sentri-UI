# Persona walk rounds

How piglet processing was walked from 29 Sep to 6 Oct (`ux/tasks/piglet-processing/scenarios.md`, reports in
`ux/tasks/piglet-processing/research/walks/r1`–`r3`, brief `research/walks/walk-brief.md`), written down so a loop
round can spawn walkers on any feature the same way. Walks find what the scenario tree is missing; the runner
([scenarios.md](scenarios.md)) re-checks what the tree already holds. A walk finding that becomes a rule becomes a
tree row and, when it can run, a leaf.

## A round

- **Walkers.** One per persona plus one **breaker**, each a fresh subagent (Sonnet for briefed walks; a model from
  another family for the breaker is better still). Piglet processing ran eight personas (s1–s8) and a breaker per round.
- **Personas come from the tree's states**, one per lived situation that crosses several of them: for farrowing, e.g.
  s1 night-shift counting several sows at once (C, D), s2 a sow dying mid-farrowing (M), s3 a next-shift hand
  continuing someone's records (E, D-1, F), s4 a wrong figure found after the lock (X), s5 a stillborn as the first
  record (A), s6 a supervisor ending the task with laggards (K), s7 an interrupted worker (phone pocketed, app
  closed: D-7), s8 two phones on one room (D-9). The breaker has no persona: it hunts dead ends, wrong facts, lost
  work and contradictions anywhere.
- **The brief** (one shared file, per-walker scenario appended): you are a gloved worker (or the supervisor) on a phone,
  one hand, interrupted, reading for two seconds; you did not design this. Serve the repo on your own port
  (`node scripts/serve-ux.cjs <port>`), drive the prototype with the cached Playwright at 390×844, once at 360, once
  `?lang=zh`; **start from the room list, not a state URL**, and walk as a worker would: tap, read, tap. Read RULINGS
  so you know what was ruled, but judge as a worker first. Never edit the repo; never open a held-out eval set. Know
  the previous round's numbered findings, and say "R1-n still broken" rather than reporting it as new.
- **The report** is the walker's final message (no report files; screenshots in its scratch folder): every point
  where the design does not let you do the right thing, shows a wrong or contradictory fact, dead-ends, loses work or
  confuses you on tap: the step, the screen (URL/state + screenshot), what you tried, what happened, what you
  expected, and a suggested class. Then **new scenarios** found while walking, then what worked.

## Condensing

The driver condenses each report to a short numbered list, one line per finding, naming the screen in brackets, and
tags duplicates across walkers in place: `[= s2 1]` (same as s2's finding 1), `[= all walks]`. Findings already
listed in an earlier round keep their id (`R1-16 still broken`). Each condensed copy ends with **New:** (scenarios the
tree lacks) and **Worked:** (what held up, briefly). Condensed copies live with the feature's research
(`research/walks/r<n>/<walker>.md`).

## Consolidating

The round's findings go into the feature's `scenarios.md` as a table per kind (blockers, wrong facts, …), one row per
distinct finding (`R<round>-<n>`), with the walkers who hit it in brackets and a class: **handled** · **change a
slice** (page named) · **new slice** · **new module** · **owner** (a reserved decision: it becomes a `? Qn` in the tree
and a decision-blocker leaf). New scenarios become tree rows. The round header records the commit walked and which
earlier findings are confirmed fixed.

A feature is settled after **two consecutive rounds** that find nothing that changes the design, with every required
leaf of its tree passing in the runner.
