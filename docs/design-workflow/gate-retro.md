# Gate retro (2026-10-16)

The owner asked: "1 PR takes like few hrs just to pass the gate. Where is it dumb, too brute force?" This is the answer, measured on the last 30 merged PRs (#151–#189) and the gate's own `mechanical.json` from the runs this session drove. Each entry gives what happens, what it costs, why it is brute force, and the change. The ranked plan is at the end.

## The numbers

**Open to merge** (wall clock, last 30 merged PRs):

| | PRs | Open → merge |
|---|---|---|
| Tooling and docs that moved no screen (#151–#156, #168, #172, #174, #176, #182) | 11 | 0.1–0.3h |
| Gate tooling that moved screens or needed a second round (#161, #166, #171, #173, #189) | 5 | 1.0–2.8h |
| Screen changes (#159, #162, #163, #165, #167, #170, #180) | 7 | 0.7–10.9h, median 4.2h |
| Long-lived workflow PRs (#155, #157, #169, #177, #178, #181) | 6 | 5.6–10.2h |

**One gate run** (`took` in `mechanical.json`):

| Run | Class | Reach | Shots | Scenarios | Total |
|---|---|---|---|---|---|
| #172 | copy | scoped | 307s | 0s | 5m |
| #176, #182 | copy | scoped | 365–369s | 0s | 6m |
| #168 | copy | scoped | | | 11m |
| #174 | copy | **all 371 screens** | 651s | 89s | 12m |
| #171, #173 | copy | **all 371 screens** | 700–775s | 90s | 13–15m |
| #170 | presentation | **all 371 screens** | 775s | 0s | 13m |
| #163 | shared | | | | 23m |
| #180 | shared | **all 371 screens** | 670s | 626s | 26m |
| #167 | shared | | | | 26m |
| #162 | shared | | | | 36m |

**So one gate run is 5–36 minutes. The hours go elsewhere.** A screen PR runs the gate 3–5 times before it merges, a judge takes 5–18 minutes for each verdict, and each new commit to main voids every gate and verdict already stamped. Where the time went on the slowest screen PRs:

- **#163 (10.9h):** four gates (one judge finding about the drawer height, two finding stale claims in the PR body, one restamp because main moved), and three judge rounds.
- **#170 (5.8h):** four gates. The first failed the split rule (a tool edit beside moved screens), so the tool edit was split out as #173. The second hit a check-states clip in a demo frame. The third met a FilterChips raster flake, which needed #174 to fix the shot itself. The fourth followed a judge finding.
- **#162 (9.4h):** two gates at 36m each (50 changed screens), then a queue behind #163.

## What is brute force

### G1 · reach · `atlas.json` makes every change "draw on every screen"

**What happens.** `reachOf` reads `atlas/atlas.json` as a file every screen renders from. The atlas build stamps the generating commit and time, so the file changes on every PR that touches anything the atlas lists, and reach becomes all 371 screens. Of the full-reach runs above, #170, #171 and #173 were full reach only because of the atlas (#173 changed one registry line). The same is true for `shoot-screens.mjs` (#174) and the vendored font CSS (#171).

**Cost.** 650–775s of shots instead of 300–370s: about 6 extra minutes on each gate run, and on each re-gate.

**Why it is brute force.** The atlas stamp is metadata, not pixels. A screen only moves if its page, its assets or the shared CSS/JS it loads changed.

**Change.** Compute reach from the atlas content with the stamps stripped (a `generated`/`commit` diff draws nothing). Better still, stop committing the stamps: write them at deploy time. That also ends the `atlas.json` merge conflict on every forward merge (G6).

### G2 · re-gate · each merge to main voids every other PR's gate and verdict

**What happens.** R10 refuses a verdict when origin/main moved after the gate ran. So every merge sends every PR in flight back through merge-forward, a full gate and a judge restamp. With one gate per machine, N PRs in flight cost O(N²) gate runs. #163 and #170 were each re-gated at least once for a main commit that touched nothing they draw.

**Cost.** 13–36 minutes of gate, plus 5–15 minutes of judge, per PR per unrelated merge. This is the largest single driver of the multi-hour PRs.

**Why it is brute force.** R10 exists so "0 pixels different" is never measured against a stale main. That only matters when main's new commits can move a screen the PR also moves. Most can't: a docs PR, a gate-tool PR, or a feature PR in another folder.

**Change.** *Carry* the gate and the verdict when main's new commits are disjoint from the PR. That means the reach of main's new commits does not intersect the PR's reach, and none of them touches the shared system or the gate tools. `carryDecision` already exists in `loop-rules.mjs` for a narrower case; widen it to this rule and have `--verdict` accept a carried stamp. When they do intersect, re-shoot only the intersection, not the whole reach.

### G3 · fix cycles · the judge rounds are mostly about the PR body

**What happens.** The judge reads a hand-written Results block and critique, and checks every claim against the pairs. Two of #163's three rounds, and one of #170's, were stale claims ("the title sits at 56px" after it moved to 80px), not design defects. Each costs a push, a gate and a judge.

**Cost.** One whole gate and judge cycle (20–50 minutes) per stale claim.

**Change.** The gate writes the Results block from `mechanical.json`: screens moved, checks, and the pairs link. The builder writes only the one-line "better because…" per changed screen. Facts the gate measured are never typed by hand, so they can't go stale.

### G4 · checks run on everything, then report only the changed screens

**What happens.**
- Legibility renders all 305 screens on both sides, then blocks only on the changed ones (#180: "305 screens, 125 fail" to judge two).
- check-states runs every screen.
- Scenarios run every leaf of each feature in scope at 360 and 390 in both languages: 626s on #180, though only two pickers changed.

**Cost.** About 3–10 minutes per gate.

**Change.**
- Run legibility and check-states on the reach only.
- Run scenarios only on the leaves whose walked screens are in the reach, and only at 390 EN plus 360 ZH. Those two cover both failure modes found so far: the narrowest width and the longest copy.
- Keep the full sweep as a nightly run on main that files debts, not as a step in every PR.

### G5 · the split rule turns one fix into two PRs

**What happens.** A PR that both changes a gate tool and moves a screen is refused, so the tool part goes first as its own PR. #170 lost a full round to this when the tool change was one line in `build-atlas.mjs` (the GROUPS registry).

**Why it exists.** A tool can't vouch for the change it is gating. That is right for a check (a check edited to pass its own PR). It is not right for a registry or list a check reads.

**Change.** Split only when the PR edits a *check* (`scripts/check-*.mjs`, `loop-rules.mjs`, `gate.mjs`, `run-scenarios.mjs`). A registry, a list, or the atlas builder's grouping ride along with the screen change.

### G6 · merge-forward conflicts on generated and duplicated files

**What happens.** Each forward merge conflicted on `atlas.json` (generated), on per-feature `critique.md` files (the same cross-cutting critique pasted into ten features), and once on a test file. Each conflict was hand-resolved, and one lost a closing `});`.

**Change.**
- Stop committing generated atlas fields (G1), or give `atlas.json` a merge driver that regenerates it.
- Put a cross-cutting critique in one shared file that the features link to, instead of pasting it into each one.

### G7 · flakes found by brute force

**What happens.** Shots differed by one or two channel values between two runs of the same commit, so unchanged screens showed as "changed". Each case was triaged by hand until #174 pinned rasterization to one thread. The workbench still varies run to run.

**Change.** Done for shots (#174). Next: a screen that differs between two base runs goes on a flaky list automatically and is never shown to a judge (#166 started this). Freeze the workbench's time-dependent parts the way #178 froze atlas motion.

### G8 · one gate per machine, and nothing survives a restart

**What happens.** The machine runs one gate at a time, and every other PR waits in the queue. A container restart killed the #180 gate mid-run, and it started over from zero.

**Change.**
- Gate copy-class PRs that move no screen without the browser lock. They take five minutes and only run unit checks and a scoped shot.
- Since #189, scenarios run in parallel; do the same for shots (the base side is cached already).
- Write shots incrementally, keyed by screen and commit, so a restarted gate resumes.

### G9 · environment drift

**What happens.** Playwright 1.63 was installed against browsers built for 1.56, so the gate failed to launch until `SENTRI_PLAYWRIGHT` pointed at the global 1.56.1.

**Change.** Pin Playwright in `package.json` to the version whose browsers the container ships, and have the doctor check it before a gate starts.

## What is not dumb (keep)

- **Base against candidate, in pixels.** It is what caught the 56px drawer slicing the parent title on #163, and the Chinese route line on #170. No unit check would.
- **A judge on any change that moves a screen,** component pages included.
- **Base-relative failures.** Main's debt is never a PR's failure (#172, L24).
- **Pinned merges.** The gated SHA is the merged SHA.

## Ranked plan

| # | Change | Saves per screen PR | Effort |
|---|---|---|---|
| 1 | G2: carry gate and verdict across disjoint main commits | 1–3 re-gates (30–120m) | medium: widen `carryDecision`, teach `--verdict` |
| 2 | G3: the gate writes the Results block | 1–2 judge rounds (20–100m) | small |
| 3 | G1: atlas stamps out of reach (and out of the repo) | 6m per gate run, plus a conflict per merge | small |
| 4 | G4: legibility, check-states and scenarios on the reach only; full sweep nightly | 3–10m per gate run | small–medium |
| 5 | G5: split only for edited checks | one PR round when it applies | rule text |
| 6 | G8: copy-class without the lock; resumable shots | queue time; restart losses | medium |
| 7 | G6, G7, G9: merge driver, shared critique, auto-flaky, pinned Playwright | intermittent hours | small each |

The target is under an hour from open to merge for a screen PR that passes on its first judge, and 15 minutes for a tooling PR. Items 1–3 alone should take today's 4–11h screen PRs to about 1–2h, because they remove the loops (re-gate, re-judge), not just seconds from each step.
