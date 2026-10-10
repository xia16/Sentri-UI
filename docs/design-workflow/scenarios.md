# Scenario tree and the behaviour gate

A feature's behaviour is specified as a **scenario tree** derived from its rulings, and checked by a **runner** that
replays every executable leaf in a real browser. The method is the one piglet processing used from 29 Sep to 6 Oct
(`ux/tasks/piglet-processing/research/scenario-tree.md`, walks in `research/walks/`); the runner is what makes its
leaves re-runnable and lets them gate a merge. Persona walks, which find what the tree is missing, are in
[briefs/walk.md](briefs/walk.md); the leaf fields as the polish loop names them are in
[briefs/polish-loop.md](briefs/polish-loop.md#3-executable-leaves).

| File | Holds |
|---|---|
| `features/<id>/scenario-tree.md` | the tree for people: states × events, each row S (sourced, cited) or I (inferred, reasoned), ending in → outcome, handoff:`<task>` or ? Qn; questions stated once at the end |
| `features/<id>/scenarios.json` | the same tree's executable leaves, for the runner (below); each leaf names its tree row |
| `scripts/run-scenarios.mjs` | the runner |
| `review/scenarios-<id>.json` | the last run's results (committed; the atlas build skips it) |
| `review/scenarios/<id>/<leaf>/<lang>-<width>/` | a screenshot after every step (git-ignored; regenerate with the runner) |

## Deriving the tree

Scope comes from the rulings, never from what is built. Sources, in authority order: RULINGS, then the PRD's explicit
scope and decisions, the state contract, the synthesis and handover, then owner decisions recorded in `review/*.json`
(a review *recommendation* is not a ruling). List each entity's states, cross them with the events that can reach
them, and write what must follow. Where the sources disagree and RULINGS does not settle it, or nothing says what
must happen, the row is a **? Qn** and its leaf is a **decision-blocker**: it records the question and the
conflicting sources, and it never gets an expected result.

## `scenarios.json`

```jsonc
{
  "feature": "farrowing",
  "defaults": { "url": "/ux/system/farrowing-astra-concept.html?layout=focus", "clock": "2026-08-27T09:41:00",
                "langs": ["en", "zh"], "widths": [360, 390], "height": 844, "clipCheck": true },
  "tree": [ <node>, ... ]          // the branches, each an `entry` node
}
```

A node is `{ "type", "id", "label", "children"? }` plus, by type:

| type | adds | meaning |
|---|---|---|
| `entry` | — | a branch: a way into the feature (Home → room, the death draft, …) |
| `state` | `reset`, `clock`?, `tree` (section letter) | a **reset fixture**: every leaf below starts here, from scratch |
| `action` | `taps` | what the worker does; actions chain, so Back / reopen / resume are just more actions |
| `outcome` | `tree` (row id), `authority`, `visible`, `record`, `status`?, `why`?, `langs`? and `widths`? (the polish loop's `runs`; default all four), `clip`? | an **executable leaf** |
| `decision-blocker` | `tree`, `question` (Qn), `sources` | a leaf with no authority or conflicting sources: reported `blocked`, never run |

A leaf runs as: the nearest `state` above it (its `reset` fixture), then the `taps` of every `action` between them in order.

**Ids** are stable: a leaf id never changes meaning; retire it rather than reuse it.

**`reset`**: `{ "url"?, "screen"?, "preset"?, "params"?, "taps"? }`. `screen` is an atlas screen id: the page opens
bare (`?screen=`, `ux/system/atlas-bare.js`), with that screen's preset and steps. `preset` then resets the prototype
to its own deterministic seed for that preset (`select.scenario`). `taps` finish the setup (no screenshot, no checks).
`clock` fixes `Date` for the run (Playwright's clock, time still flows from there).

**`taps`**: the atlas step syntax (`atlas/SCHEMA.md`, *steps*): a control's visible text, its `aria-label`/`title`,
or a CSS selector (starts with `[`, `.` or `#`); `{ "tap": ..., "hold": ms }` for hold-to-commit. Prefer selectors on
`data-action` where the leaf must run in every language. Also: `{ "fill": "<selector>", "value": "..." }` (the field may sit in a same-origin iframe of the page),
`{ "expect": [<assertion>...] }` (a check mid-path), `{ "reload": true }` (the app is closed and reopened),
`{ "wait": ms }`. A tap is a real pointer click: a control that is covered, disabled or missing fails the leaf as an
**unreachable control**.

**`authority`**: `[{ "src": "RUL|PRD|contract|SYN|HANDOVER|STR|review|atlas", "at": "section or item id", "says": "short quote" }]`.
An outcome without authority is refused by the runner: make it a decision-blocker.

**Assertions** (`visible` and `record`, and `expect` steps). Each may carry `says` (how it reads in the report) and
`hard` (below).

| assertion | holds when |
|---|---|
| `{ "text": "1 unsaved", "in"?: "sheet" \| "phone" \| "<selector>", "absent"?: true }` | the text is visible (case-insensitive) in the topmost open sheet / the phone. A plain string is EN only (skipped in other languages, listed as skipped); `{ "en": "...", "zh": "..." }` checks both |
| `{ "verb": "Back", "in"? }` | the verb's text from `ux/laws/strings.json` in the run's language |
| `{ "el": "<selector>", "is"?: "present" \| "absent" \| "enabled" \| "disabled", "in"? }` | a visible element in that state |
| `{ "screen": "farrowing.blocked" }` | the page reports that atlas screen (`AtlasBare.current()`) |
| `{ "expr": "s.deathDraft[2] === 1" }` | a record assertion: a JS expression over the prototype's live state, true. Farrowing: `s` = the open sow record, `c` = the room/task context, `F` = `FarrowingStudy`, `sum` |

Every run also checks that **nothing is clipped** at the end (text past the phone's edge or cut by its own box) unless
the leaf says `"clip": false`, and that the page threw no error.

**`status`: `"pending"`** marks a leaf the prototype cannot run yet (`why` says what is missing). It is reported, not
run.

## The runner

```
node scripts/run-scenarios.mjs <feature> [--lang en,zh] [--width 360,390] [--base <url>] [--only leaf,leaf]
```

It uses the cached Playwright at `C:/Users/ying_/.cache/adam-design/playwright-1.63.0`, serves the repo with
`scripts/serve-ux.cjs` on a free port (unless `--base`), and runs every leaf × language × width from its reset
fixture in a fresh browser context, the phone drawn at the run's width. Results per leaf:

- **pass**: every run passed;
- **fail**: any run failed (the exit code is 1 when any leaf fails);
- **blocked**: a decision-blocker, or no failures but a language the page cannot render (`?lang=zh` ignored): a
  screenshot of English never counts as covering Chinese;
- **pending**: not runnable yet.

In a language the page does not render, copy checks (`text`, `verb`) are skipped and listed; behaviour and record
checks still run, so a Chinese run still catches a lost draft. `summary.byLang` gives each language's pass / fail /
blocked on its own.

**Hard failures** are tagged on the assertion (`hard`) and summarised per leaf: `wrong-fact`, `lost-draft`,
`dead-end`, `unreachable-control`, `broken-ruling`. A failed tap is `unreachable-control` unless the step says
otherwise; a crashed run is `dead-end`.

`review/scenarios-<feature>.json`: `{ feature, commit, dirty, ran, langs, widths, nodes (count by type), summary
{ pass, fail, blocked, pending }, byBranch, hardFailures, leaves: [{ id, tree, branch, result, hard, authority,
runs: [{ lang, width, result, failures: [{ what, got, tag }], skipped, notes, evidence: [png paths] }] }] }`.
`--only` runs never write it.

## Hooks a prototype may need

A leaf must reach its state through the prototype's own controls. Where it cannot, add an atlas-only hook (an id,
a data attribute, a preset, read-only state access) that draws nothing, and list it here.

- Farrowing: `FarrowingStudy.states` and `FarrowingStudy.room(i)` (read-only access to the live records, for record
  assertions), in `ux/system/farrowing-astra-concept.js`.

## When it runs

Behaviour changes rerun the walk-throughs they touch (390/360, EN/ZH); shared components rerun every feature that uses
them. The evidence records the commit it ran on. Fixing a failure is design work on the feature's own branch; the
gate never edits the expectation to make a leaf pass.
