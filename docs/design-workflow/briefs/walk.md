# Walk brief (persona rounds)

A walk round sends one walker per persona, plus one **breaker**, through a feature's live screens in a real browser. Each walker is a subagent with fresh context. Walkers find what the screens make impossible, wrong or confusing. They don't review style. Walks are part of the scenario step in both new-feature mode and the polish loop.

Worked example (Piglet processing): the tree is `ux/tasks/piglet-processing/research/scenario-tree.md`. The old walker brief is `research/walks/walk-brief.md`, and the rounds are in `research/walks/r1|r2|r3/`. The personas and the condensed record are in `ux/tasks/piglet-processing/scenarios.md`.

## Driver: set up a round

1. **Personas from the tree.** Take one persona per main branch of the feature's scenario tree, usually 6–8. Each has a role (worker or supervisor), a day and starting situation (a fixture variant), and a script of what they came to do. Piglet processing used: s1 day-3 round, s2 tag & weigh, s3 deaths, s4 fostering, s5 counts, s6 orphans, s7 supervisor End, s8 offline collisions.
2. **One breaker.** The breaker has no script. They try to make the feature lose work, show a wrong fact, dead-end or double-write. They use extremes (0, all, +N), interruptions (Back, reload, offline), widths (320/360/390) and ZH.
3. **A first-time worker.** One persona has never used the app; they find what a daily user has learned to step around.
4. **Held out.** Keep any eval set closed to walkers.
5. **Pin the commit.** Every walker records `git log --oneline -1`. Findings are only valid for that commit.
6. **The matrix ledger.** Before the round, every scenario of the tree is in the ledger as Pending. Each walker owns named rows and moves each to passed, failed or blocked. A blocked row is never quietly re-queued.
7. Give each walker this brief, their persona, the previous rounds' condensed findings (so they say "R2-n still broken" instead of filing it as new), and `RULINGS.md` for the feature's area.

## Walker: how to walk

Each walker is two roles. The **driver** performs the taps reliably and records what happened. The **persona** decides what a farmer would try next and where they'd get confused. The persona works from the job, never from product knowledge: it isn't told which control does what.

- Be a barn worker on a phone: gloved, one hand, interrupted, reading for two seconds. Supervisors where the persona says so. You didn't design it.
- Read-only: never edit the repo. Save screenshots and scripts in your own scratch folder.
- Serve the repo with `node scripts/serve-ux.cjs <your port>`. Drive it with Playwright at 390×844, plus once at 360 and once in ZH (`?lang=zh`).
- **Start where a worker starts** (Home or the feature's list), not from a state URL. Use a fixture variant only to set the day's starting situation.
- Tap, read, tap. Do the job your persona came to do, then the interruptions it would meet.
- Read the owner's rulings so you know what was ruled, but judge as a worker first.

## Report format (your final message is the report)

The first line names the persona, the commit and the widths/languages walked. Then the sections below, condensed with one line per finding:

```
# r<round> s<n> <persona> (condensed)
N<n>-1 <what broke, the fact shown vs the fact expected> (<screen/page>) [= s<k> <id>] — R<r>-<m> still broken
...
Fixed: R2-17, R1-25, ...
New: <scenarios the script didn't mention that the feature must handle>
Worked: <what worked, briefly>
```

- A finding is anything where the design **doesn't let you do the right thing, shows a wrong or contradictory fact, dead-ends, loses work, or confuses you on tap**. Give the step, the screen, what you tried, what happened and what you expected, with a screenshot name.
- **Duplicate tags**: `[= s4 P12]` when another walker hit the same thing, and `[= all walks]` for shared ones.
- **Class** each finding: handled (found on a second look) · change a slice (name the page) · new slice · new module · **owner** (a product rule; give options and never pick one).
- Don't give generic UX advice.

## Driver: close the round

1. Merge the reports into one numbered table per round (`R<n>-<m>`), grouped by the fix they need: blockers, wrong facts, dead ends, then the rest. List the walkers who hit each one.
2. Record which earlier items are confirmed fixed.
3. Turn every new branch a walker found into a scenario-tree branch, and a walked branch into an executable leaf in `features/<id>/scenarios.json` (run by `node scripts/run-scenarios.mjs`).
4. File owner items as decision tickets on the feature's map. Keep the affected branch blocked; don't invent an expected result.
5. **What counts.** A confusion counts as a defect when two or more walkers stumble in the same place; one walker's stumble is noted, not fixed. Hard defects (wrong fact, lost work, dead end, unreachable control, double write, broken ruling) count from one walker. Walk findings are hypotheses that find defects, never proof of real farm behaviour.
6. **Stopping.** A round is **clean** when no walk finds anything that changes the design. The walks are **settled** after two clean rounds in a row, with every branch walked or blocked; the last round uses fresh walkers who weren't given the paths. They're **capped** after 4 rounds (report what's open), and **stuck** when a round finds only repeats or only product questions, a fix undoes another, or findings grow round on round. Walking never grows scope: an operation that needs a new module or product rule becomes a decision ticket.
