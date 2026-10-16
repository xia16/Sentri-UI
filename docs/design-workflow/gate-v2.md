# Gate v2: one module, static reach, evidence by identity

Status: approved by the owner (2026-10-16, "fix everything") after a blind review and a challenge by another model family (GPT-6), whose every finding is folded in. Both halves are built: the evidence half (§1, §3, §4, §5: `scripts/evaluate.mjs`, `evidence.mjs`, `scheduler.mjs`, `visit.mjs`, `settle.mjs`, `machine.mjs`) and the analyser (§2: `scripts/static-reach.mjs`, `bundle-graph.mjs`). It replaces the "lanes" plan (opt-in fast path, reach by caller), the replay proof and the tripwire as acceptance.

## The owner's rules it has to keep
- No screen changes that nobody saw: every moved screen gets its four pairs (390/360 × EN/ZH) and the blind judge.
- Scenario leaves pass for every feature the change can affect.
- "Unsure is everything": a gate that can't decide checks everything, and if it can't finish, it blocks. It never passes.
- Fast on small changes. Not bulky, no brute force. Local PC only, one gate at a time.

## 1. One entry point
`evaluate(base, candidate, mode) → pass(evidence) | fail(findings) | blocked(reason)`

Reach, scheduling, evidence reuse, failure accounting and verdict completeness all live inside it. Callers never assemble these facts themselves.

## 2. Reach: static, conservative, both revisions
- **The bundle.** Parse base and candidate.
  - The changed units are exports and every top-level binding: helpers, constants, objects built at start-up.
  - Unchanged IIFE scaffolding is recognised as such, and its declarations are analysed one by one, so a one-function edit stays one function.
  - Any assignment, mutation or start-up effect the analyser doesn't model reaches everything. Example: `defaults.pickerSize = 'compact'` reaches its consumers, or everything.
  - The affected exports are the reverse closure over *references*, not only calls: reading a changed binding counts.
- **How pages use the bundle.** Every reference to the `SentriUI` namespace in a page is classified.
  - A supported direct access (`SentriUI.X`, `SentriUI['X']`) uses X.
  - An alias, destructuring, a computed key or the namespace escaping means the page uses **every** export.
  - Not finding a name never proves it isn't used.
- **Files a page loads.** Script, link and fetch literals are resolved against the page's real URL.
  - A load with a computed URL that can't be bounded makes that page depend on every changed runtime file.
  - A file another page names literally doesn't let the computed-URL page off.
- **Features.** A feature's own files add its screens. Owning a feature never *removes* a dependency: a dashboard that reads another feature's data, or embeds its page, is in reach.
- **Behaviour reach** is the scenario leaves whose entry points, and whatever they navigate to, can touch the reach. If that closure can't be resolved, all leaves of the affected features run. Leaves run even when screens are pixel-identical.
- **Always everything:** CSS (bundle.css, tokens, any shared stylesheet; there's no CSS proof in v1), the harness, the shooter, the server, fonts and packages.
- **Recorded calls and fetches are diagnostics only.** They never exclude a screen.

## 3. Evidence by identity, one scheme
- **What an identity covers.** Every piece of evidence has an identity: one shot at one width and language, one state check, one leaf run. The identity hashes everything that piece *transitively* depends on:
  - for the bundle, the supported binding closure it uses, not the whole file;
  - the screen definition, preset and steps;
  - the page and its loaded files;
  - for state checks, the specimen HTML and its data;
  - for leaves, the scenario definition, fixtures and initial state;
  - the checker's source and its imported helpers;
  - render settings: browser, fonts, viewport, device scale factor, locale.
- **Reuse only on a matching identity.** This one rule replaces both caches and "carry a pass". A stricter checker landing on main invalidates exactly the results it produces.
- **Identity and reach are defined together, first,** so a one-function bundle change doesn't invalidate every screenshot.

**What each identity hashes.** Files are hashed by their git blob on the side's commit. Code is hashed with its local import closure from the gate's own checkout (main's tools). The side, base or candidate, is never an input: equal identities mean equal evidence, whichever side computed it. Reach (§2, `scripts/static-reach.mjs`) supplies two inputs per screen through `identityInputs({ side, screen })`: `files`, the page and its resolved load closure, and `bundle`, the used binding closure. With `bundle.unitHashes` and `bundle.setupHash` (each unit's own source, and everything else), a one-function bundle edit is a new identity only for the screens that can run that unit; the bundle file itself then leaves the `files` hash. A screen whose loads the analyser can't bound (`unbounded`) also hashes every page-loadable file of a fitting type. A component page (the analyser reads screens only) hashes the atlas, the design system, the strings and the fonts.

| Evidence | Its identity hashes |
|---|---|
| **Shot**: one screen at one width and language | the screen definition (atlas entry: url, preset, steps); `files`; `bundle` (the whole `bundle.js` when `all`); the harness (`atlas-bare.js`), the server and the side's vendored fonts; the visit and capture code (`visit.mjs`, `settle.mjs`, `font-route.mjs`); render settings (Playwright and browser build, platform, launch flags, viewport width × 844, device scale 1, language, clock time) |
| **Visit check**: legibility, spacing or headers on one screen at one width and language | the shot's inputs without the capture step, plus the checker's source and its imported helpers (`check-legibility.mjs`, `check-spacing.mjs`, `check-headers.mjs`) and the check's own parameters (which checks run at that width) |
| **Component page**: a design-system variant page, shot or header-checked | the atlas page and its data (`atlas/`), the component's folder, the tokens, `bundle.css` and `bundle` as above; the shooter or checker; render settings |
| **State check**: one variant file, every state in it | the specimen HTML (the variant file) and every file it names; `tokens.css`, `bundle.css`, `bundle`; the vendored fonts; `check-states.mjs` and its helpers; viewport width, render settings. A specimen whose own scripts load by a computed URL hashes the whole page tree |
| **Leaf run**: one leaf in one language at one width | the leaf as walked (its state's reset fixture and preset, every action step, its own checks, the spec's defaults); the files its entry page can load (the stub: the whole page tree); `ux/laws/strings.json`; the runner and its helpers (`scenario-runner.mjs`, `scenario-tree.mjs`, `machine.mjs`); render settings (viewport, locale) |
| **Repository check**: `npm test`, the atlas rebuild | the whole tree of the commit, Node's version, Playwright's |

Base evidence is kept per main commit (an index of the identities each base used; the store keeps what the last 10 mains used and anything used in the last 3 days). Candidate evidence is computed only for identities the store doesn't hold. A result is stored only when it is a design result: a machine error, an unstable capture or a crash is never stored, so it is computed again.

## 4. Capture and failure accounting
- **The screen inventory is reconciled on both sides.**
  - An added screen needs its own verdict (pass or fail), since there is no "better" without a base.
  - A removed screen needs a stated reason.
  - Missing evidence is never equal to unchanged.
- **Capture has a defined settling protocol** (fonts, scroll, timers). If instability is observed, the gate **blocks**. It never picks the good-looking shot.
- **Main's debt is structural:** leaf × width × language × assertion contract × failure category. If equivalence can't be shown, it blocks.
- **Recognised machine errors** (a navigation timeout, `net::ERR`) retry once, under controlled conditions. Every other failure stands. Passing when run alone is not absolution.
- **One machine scheduler for all browser work,** at 4 workers (a measured setting, not a rule scattered through scripts). It may go lower under load.
- **One visit per screen state:** the screenshot and every compatible mechanical check share the same prepared visit.

## 5. Verdict
- Every pair in the evidence manifest gets a judgement.
- The change passes only with no "worse" and at least one "better". In refactor mode, every pair must be "same".
- The tripwire is not acceptance. It can stay as a diagnostic while v2 rolls out.
- **A moved main never voids work by itself** (driver, 2026-10-16, after #187 paid a full re-gate for a main that moved by gate scripts only). At verdict and merge time the gate recomputes the candidate's identities against the new main, keeps every result and every judged pair whose identity is unchanged (a pair is judged by its two images: the same base and candidate shot identities), recomputes only what changed, and sends to a judge only the pairs whose images changed. Anything that matters still has to pass.

## 6. Proving it works
- **Faults that must fail to get a pass through `evaluate`:**
  - a changed shared helper;
  - a changed start-up constant;
  - a mutation;
  - a CSS leak;
  - a start-up change;
  - a computed export name;
  - a page aliasing SentriUI;
  - a computed fetch beside a literal consumer;
  - a cross-feature dependency;
  - an added screen and a removed screen;
  - an unstable capture.
- **Good changes that must stay fast:** a localised one-function edit stays localised, and an intended default change is selected and judged rather than rejected out of hand. The suite checks selection and evidence completeness, not just rejection.
- **A full sweep of main** audits the analyser during rollout and after any change to the analyser, harness or evidence engine. It isn't nightly forever, and it's never what justifies leaving a screen out.

## 7. Build order
1. Identity and reach semantics, written down together.
2. The evidence store and scheduler, with shared visits.
3. Structural debt, inventory reconciliation and the settling protocol.
4. The static analyser: namespace classification, IIFE and mutation rules, and the load resolver.
5. The fault and good-change suites, end to end through `evaluate`.
6. Rollout behind the full-sweep audit.

## Times (provisional; measured per job count once built)
| Case | Estimate |
|---|---|
| Docs only | under a minute |
| A one-function bundle change, warm evidence | about 6–10 minutes |
| CSS or tokens | full reach; cold and warm cases measured separately |

Everything is reported per case: warm cache, cold cache and full reach.

**Measured (evidence half, with the analyser's stand-in: every screen and leaf in reach; 4 workers; 2026-10-17, quiet machine).** 373 screens and component pages, 2,716 visits, 450 leaf runs, 138 state checks:

| Case | Wall | Where the time went |
|---|---|---|
| Cold: an added and a removed screen, empty store | 20.8 min | visits (shots and visit checks, both sides) 14.7 min, leaves 6.0 min, the rest under 10 s; npm test and the state checks ran beside the visits |
| Warm: the same change gated again | 10 s | everything reused (2,716 shots, 2,745 visit checks, 450 leaf runs, 138 state checks, npm test) |
| Main moved by a README, `--verdict` | 24 s | 0 visits; npm test and the atlas rebuild again (whole-tree identity); 4 of 4 judgements and the removed screen's reason carried |
| A checker (check-spacing) changed on main | 3.6 min | 610 visits for the 610 spacing results only; npm test and the atlas rebuild again; nothing else |
| An unstable screen (the candidate changes one page) | 13.1 min | the candidate's half recomputed (1,358 visits, 448 leaf runs: the stand-in's whole-tree identity), base reused; blocked on that screen |

## What happens to work already built
| Work | Fate |
|---|---|
| Lighter gate (#169, on main): lock, base shot cache, reach by files, `--carry` | Folded into §3. `--carry` is replaced by identity reuse. |
| Round-2 branch: AIMD scenario runner | **Kept**, as the scheduler's leaf executor, capped at 4. |
| Round-2 branch: lone rerun as a pass | **Dropped.** Recognised machine errors only. |
| Round-2 branch: specimen defaults proof | **Dropped.** Defaults become explicit state cases. |
| Farrowing session: acorn parser and call graph | **Kept**, as the core of the §2 analyser, with the namespace, IIFE and mutation rules added. |
| Farrowing session: call recorder | **Kept, as diagnostics only.** |
| Farrowing session: replay proof and CSS hook proof | **Dropped from acceptance.** |
| Two holes in today's gate: leaf-level debt, carrying over checker changes | **Fixed now, ahead of v2**, as a small PR. |
