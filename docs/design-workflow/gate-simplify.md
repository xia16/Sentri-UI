# Gate: what to cut, what to keep

Status: decided by the owner, 2026-10-18 (§6); being built in the order of §7. Measured on this PC from the 90 gate runs since 2026-10-16, the evidence store
(`sentri-gate/evidence`, 2.6 GB) and main at `5e1fbdc`.

## 1. Where the time goes today

| Portion | Measured | Note |
|---|---|---|
| Waiting for the lock | 2–18 min per gate (10-17/18: 136–1107 s) | one gate at a time; often longer than the gate itself |
| Shooting and checking screens | 1–11 min | 4 runs per screen in reach: EN and ZH, at 390 and 360 |
| Behaviour leaves | 3.3–4 min when every leaf is in reach | 540 runs; the 4 workers are saturated, so running leaves beside the shots would not save time |
| Judge | 8–15 min for a component, 14–38 min for a feature | 4 pairs per moved screen, calibration, cold look, walk, re-measured claims |
| Rounds | 3–9 gate runs before a feature merges | feature/medicines ran 9 times, farrowing/finish-optional 7, ds/pen-land-ring 6 |

Three findings drive the proposal.

**A. The gate shoots screens it never looks at.** A shot's identity hashes everything the screen depends on. When base and
candidate give a screen the same identity, both sides share one shot and the diff is 0 by definition
(`evaluate.mjs:454`: `c.id === b.id ? 0 : pctDiff(…)`). Those shots, and the checks on them, are never compared and never read
(the checks are read only for changed screens). The gate still computes any that the store lacks:
- **#205**, a lock fix in `scripts/`, could not move a pixel, because the gate runs main's shooter. It reached "every screen"
  and took 7 minutes and 1,230 visits.
- **A change to `inspection-astra-concept.css`** reached all 404 screens. Any stylesheet does.
- **The first gate after each workflow merge** recomputes everything. A checker's code closure includes `playwright-path` and
  `process-start`, the lock code, so all identities change. 9 of the last 14 merged PRs were workflow PRs.

**B. The tripwire can never fire.** A screen outside the reach whose identity changed is already added to the reach
(`widenByIdentity`). A screen whose identity didn't change shares one shot across both sides, so it can't differ. The same
applies to the reach analyser's "every screen" for CSS: it gives no protection when the identity misses a stylesheet, because
the shared shot hides it. **The only real guarantee is that the identity is complete**, and that is where the effort belongs.

**C. Failed rounds were mostly knowable in seconds.** Since 10-17 there were 12 real failures and blocks. 9 needed no browser:
- **5 of them came after a full run**, 45 minutes in all:
  - design-system-only ×3, at 3–12 min each;
  - workflow edits mixed into a design PR, at 15 min;
  - `atlas.json` not rebuilt, at 6.5 min.
- **4 stopped at once:** main not merged forward, and the gate's checkout not on main ×3.

Only 3 needed shots: the scope check, and legibility ×2.

## 2. Cut

| # | Cut | Why it's safe | Saves |
|---|---|---|---|
| X1 | **Reach is the identity diff.** Compute evidence only for screens and leaves whose identity differs between base and candidate, plus added and removed ones. Drop `reachOf`'s screen set, `reach.all`, `identityMisses` and `widenByIdentity`. The analyser keeps one job: `identityInputs` and `leafInputs`. | A same-identity screen is already treated as unchanged (finding A); this only stops computing what is thrown away. | 7 min → ~1 min for tool PRs; ~8 min → ~2–3 min for one page's CSS; no cold store after workflow merges |
| X2 | **The tripwire and `--all`** (`--all` becomes the audit, K12) | It can't fire (finding B) | a block path, a flag, and docs |
| X3 | **`--quick`** | A full gate of a local change will take 1–3 min | a second code path |
| X4 | **The shared-component queue** ("first in line"), with G2 | GitHub's "up to date" rule plus the re-gate does the same job | failed gates and re-gates |
| X5 | **Pass records and the merge guard's pass check**, with G2 | The required `sentri/gate` status plus strict mode is the boundary already. The guard keeps its push and `--match-head-commit` rules. | one of two enforcement systems |
| X6 | **`--class`**: the gate derives the class from the diff and the moved screens, as it already does for "effective" | Declared and effective already disagree, and effective wins | one argument, and the escalation messages |
| X7 | **Scope forcing**: `--scope` no longer adds a feature's every screen and leaf. It stays as a declaration for the "only scope moved" check. | The identity decides what runs | full-feature runs |
| X8 | **ZH runs where the page has no Chinese**: 154 of 335 feature screens ignore `?lang=zh`, and 178 of Farrowing's 374 leaf runs end blocked on it | They are dropped from the pairs already (`zhIgnored`) | about 20% of shots and a third of leaf runs on a full gate |

## 3. Simplify

| # | Change | Saves |
|---|---|---|
| S1 | **Fail fast**: run the file-only checks before any browser work and stop on a failure: contains main, conflict markers, coverage, atlas rebuilt, and design-system-only, now read from the diff whether or not a screen moves. Workflow edits mixed in, budget and critique, and the component-proposal check stay after the shots, because they depend on which screens moved. | 5 of the last 12 failed runs, 45 min in all |
| S2 | **The gate runs main's tools itself**: it already checks out a base worktree, so it runs `evaluate` from there. No "run it from a checkout of main" block, and no gate checkout to keep current. | 3 blocks since 10-17, and a step every driver gets wrong |
| S3 | **A checker's identity hashes only what decides its result**: its own module and the modules that compute. Not the lock, not Playwright discovery, not process identity. | the full re-shoot after a lock or logging change |
| S4 | **Fewer runs per moved screen**: EN 390, EN 360 and ZH 360. ZH 390 adds no case that ZH 360 doesn't cover worse. | 25% of shots and judge pairs |
| S5 | **Leaves at 360 only**, in EN and, where the entry page renders it, ZH | about half of leaf time |
| S6 | **The judge doesn't write pixel-identical pairs**: the gate fills them in as "same" | judge entries on runs that didn't move |
| S7 | **Split `gate.md`**: a judge brief (cold look, before/after, claims, walk, output) and the machine's behaviour in `gate-v2.md`. Today the judge reads §1's "run `npm test`, run `check-states` …" as steps of its own. | judge time, and stray browser runs that wait on the lock |
| S8 | **The gate writes the Results block** (G9) and the PR body states no numbers of its own, so §5 is only the critique's Keep check | the stale-claim failures (#163, #192) |

## 4. Keep

These carry the safety. Each has caught something real:
- **K1.** The exact candidate contains main, and is judged with main's tools.
- **K2.** Evidence by identity, conservative: anything the analyser can't bound hashes every page-loadable file.
- **K3.** **Identity hardening**, which replaces what the tripwire and the CSS "every screen" pretended to do:
  - stylesheets are read only in a checked syntax: lowercase `@import "…"` or `url()` at the top;
  - anything else makes that stylesheet's pages hash every stylesheet;
  - a test pins every way a page can load something.
- **K4.** Settle, shoot twice, and the fresh confirming visit of a changed screen: 0–6 s usually.
- **K5.** Machine errors are retried once, alone; the second blocks.
- **K6.** The inventory: added screens need a verdict, removed screens a reason, and missing evidence blocks.
- **K7.** Legibility, spacing and headers on changed screens, with main's existing defects kept as main's; `check-states`; `npm test`.
- **K8.** Leaves: a failure counts only once it repeats (L26), and main's debt is matched run by run.
- **K9.** The blind judge with calibration, and judges split by feature. Since 2026-10-20 (owner) a shared change is judged in full only on its own features and component pages; the features in progress get propagation pairs (propagated or broken), and the rest are not shot (gate-machine.md).
- **K10.** The re-gate after main moves, carrying judgements by image.
- **K11.** One browser gate at a time, and the required `sentri/gate` status.
- **K12.** **New: an audit run** (`--audit`), started by hand on main, say weekly.
  - It shoots every screen fresh, ignoring the store.
  - It compares each shot with the stored shot of the same identity.
  - A difference is an identity that missed an input, or a screen that draws nondeterministically.
  - This is what the tripwire was meant to be, but it runs off the merge path.

## 5. Expected times (estimates from the measured runs)

| Change | Now | After X1, X8, S1–S6 |
|---|---|---|
| Docs, PRD, workflow prose | 0.5–1.3 min | 0.5–1 min |
| Gate or tool code (#205) | 7 min | ~1 min |
| One feature's page or CSS | 2–8.5 min | 1.5–3 min |
| Shared `bundle.css`, tokens or bundle | 8.5–15.5 min | 5–9 min |
| Big feature (Medicines, 112 pairs) | 10–13 min, then a 14–38 min judge | 5–7 min, 84 pairs or fewer, then a ~10–25 min judge |
| A failed round on a file-only rule | 3–15 min | under 30 s |

With most gates at 1–3 minutes, the lock queue shrinks with them, so G11 (smallest first) can wait.

## 6. Decisions (owner, 2026-10-18)

1. **X1 + K3 + K12: decided.** Reach is the identity diff, with identity hardening and a weekly hand-run `--audit`.
2. **S4: decided.** Three runs per moved screen: EN 390, EN 360, ZH 360.
3. **S5: decided.** Leaves at 360 only, ZH where the entry page renders it.
4. **S1: decided.** The gate stops before any browser work when a file-only rule fails.
5. **G2 (X4 + X5): decided.** Strict "up to date" on main, admins included. The shared queue and the pass records go; the merge
   guard keeps its push rule and `--match-head-commit`.
6. **X3, X6, X7: decided.** Drop `--quick` and `--class`; `--scope` stays only for the "only scope moved" check.
7. **S7 + S8: decided.** A judge-only brief, with the machine's behaviour in `gate-v2.md`, and numbers only from the gate: it
   writes the Results block, and §5 becomes the critique's Keep check. **S6 is dropped**: no real PR since 10-16 had a
   pixel-identical pair on a moved screen (Medicines: 0 of 112).
8. **G15: decided.** A runtime change that moves no screen needs a walk, refactors included.

## 7. Build order (one workflow PR each)

1. **Done (#211):** S1 + S2: fail fast, and main's tools from the base worktree. One rule changed meaning: design-system-only is read from the diff whether or not a screen moves.
2. **Done (2026-10-18):** K3, then X1 + X2: identity hardening first (stylesheets and `<style>` blocks in the checked syntax), so
   the identity can carry the reach alone. Then the reach set, the tripwire, `--all`, `identityMisses` and `widenByIdentity` are
   cut, and `--audit` is added. `reachOf` stays in `static-reach.mjs` for its tests and the planning step (change-map); the gate
   no longer calls it.
3. **Done (2026-10-18):** S3: checker identities hash only what computes. `scripts/playwright-path.mjs` and
   `scripts/process-start.mjs` are left out of every code closure (`NOT_RESULTS` in evidence.mjs).
4. **Done (2026-10-18):** S4, S5, X8: the run matrix. A moved screen is shot at EN 390, EN 360 and ZH 360 (`RUNS` in
   evaluate.mjs). Leaves run at the narrowest width their spec lists. A ZH run goes only where its start renders Chinese: one per
   start goes first, and the rest are blocked without running when it finds none. ZH shots of screens that ignore `?lang=zh` stay as
   one run, and are dropped from the pairs as before.
5. **Done (2026-10-18):** X3, X6, X7 and G15: `--quick` and `--class` are gone, and the gate derives the class (`classOfFiles`:
   behaviour for a page-runnable script, copy for the strings registry alone, presentation otherwise; shared and what moved raise
   it). `--scope` is optional and only a declaration: it brings no screen or leaf into the reach, and the known-reach check skips
   a change that touches the shared system. G15: a screen that runs changed code and draws the same is named in `walkNeed`, one
   per page; such a change needs a judge's walk, and `--verdict` refuses one left unwalked.
6. **Done (2026-10-18):** G2 (X4, X5). Main requires branches to be up to date (`strict`), admins included. The shared-component
   queue and the local pass records are gone; a gate run posts `pending` at its start and `failure` when it fails or blocks, so
   the `sentri/gate` status is the one record. The merge guard keeps only the merge's form and the push rule.
7. **Done (2026-10-18):** S7 and S8 (S6 dropped, §6). `briefs/gate.md` is the judge's brief alone, about half its length;
   what the machine does moved to `gate-machine.md`. Every gate run writes `results.md`, the PR's Results block, and the PR body
   states no measurements of its own; §5 re-measures only what a body still claims. G9's obligations and `Docs:` trailers wait on
   their own decisions (change-map.md §9, 4 and 5).
