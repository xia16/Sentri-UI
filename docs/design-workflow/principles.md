# Workflow principles

How design work is done here. Six principles; every brief, gate and tool serves one of them. They change only through the ladder below, never by appending a sentence after an incident.

Each principle has the same four parts and nothing else: **the principle**, **why** (the incidents behind it), **show it** (the artifact a builder produces) and **checked by** (what in the gate tests it). Product laws (farm legibility, drawers, colour, copy) are not workflow principles; they live in `ux/design-system/README.md` and the owner rules in [README.md](README.md).

## The ladder: rules become principles

1. **A problem is a rule first.** When a trial, an audit or the owner finds a defect, it goes into the [rules ledger](rules.md) under the principle it broke, with the incident it came from. It is never written into a brief.
2. **A rule leaves the ledger one of two ways.** **Absorbed**: the principle's wording is sharpened so it plainly covers the case, and the rule is closed. **Automated**: a check or tool enforces it (the gate, a test, the atlas build), the principle's "checked by" names it, and the rule is closed. Prefer automated: a check never gets skimmed. A check is accepted only when it fails the case it came from and passes the [house references](references/README.md): a check that flags what the owner holds up as good is measuring the wrong thing.
3. **Consolidation is triggered.** A principle with three open rules, or the same failure twice, is consolidated before the next trial; every map close sweeps the ledger. A rule open across two consolidations is absorbed, automated or dropped.
4. **The framework doesn't grow.** Six principles, four parts each. A lesson that fits none of them means a principle is worded too narrowly (rewrite it) or the lesson is a check (automate it). Adding a principle means merging or retiring one.

**Principles and gates are different layers.** A principle guides the builder before the design exists; a gate check tests the result after. Every gate check names the principle it tests, and no gate check asks for something no principle states: a check with no principle is a gap in the principles, resolved through the ledger.

---

## P1 · Start from what exists

**The principle.** Before drawing, know the job as it is: every live screen that does it, the old UI, what is approved, the [house references](references/README.md) the owner holds up as the product's taste, and the design-system component whose job each part is (`node scripts/component-jobs.mjs`). Separate product from prototype chrome: a PREVIEW badge, "sample data" lines and study links are never shown to workers and are not designed. Base designs on what the product already does well.

**Why.** Environment trial 1 rebuilt a working screen from generic components and lost to it everywhere. Trials 2–4 kept reading history as a web table when Log does that job, and each named the same new components differently. A run spent a gate cycle on a prototype badge.

**Show it.** The references table (job · where it exists · status · baseline · commit) and `features/<id>/critique.md` with `## Keep` (what works and why) and `## Parts` (each part, what draws it today, the existing component whose job it is, keep / fix / cut).

**Checked by.** The gate refuses a screen change without `critique.md` (Keep, Problems, Parts, Self-crit); the judge re-reads Keep against the pairs (gate.md §5).

## P2 · Every change has a known reach

**The principle.** Scope is the problem list, and it binds everyone who touches the change, the driver's crit rounds included: change what a problem names and nothing else, and keep every Keep item at least as strong. Everything the change should reach, it reaches (every screen, pattern and demo that uses a changed component, updated or marked "until migrated"); everything else stays exactly as it was. A part the page hand-builds moves into the design system unchanged, proven by renders, before it improves; a part a component already does moves onto that component. A check that fails a kept part is questioned, not obeyed. A deliberate shared change is its own task.

**Why.** Trial 3 turned segmented controls into pill buttons to satisfy a check. In trial 6 the driver's own crit round asked for a header change across two features and moved screens outside SCOPE. Trial 4 changed a shared token for its own screen and moved 60 screens in ten features, the house references among them. An audit of the approved animal row (#113, #138) found it reached 7 places and missed 7.

**Show it.** `## Problems` (each with evidence, major or minor), the extraction commit with identical renders, and the full screen diff of the pushed branch showing only the intended screens moved.

**Checked by.** The gate's screen diff on every screen and its "known reach" check, which fails a change declared for its own features that moves another feature's screen; the shared-component queue; the judge's keep-list check (gate.md §5). To automate (ledger): the reach list of every component change.

## P3 · Information before layout

**The principle.** Decide what the worker needs, in what order, and what to cut, before any layout, on every new screen, every redesign and every component variant that shows facts. Every fact a screen displays, in the header, a row, a chip or a footer, is a decision recorded in the budget with the worker's question it answers there; nothing is shown by default, carried over unexamined, or filled in by a shared component. The answer to the worker's first question is the heaviest thing on the screen; only what the worker must do now is loud; cut before you enlarge; cutting facts never cuts structure.

**Why.** Passes that met the type floors by enlarging everything (c1, R14), that went calm but flat (c2, R15) or stacked facts on a page (R16) all skipped the budget. Drawer headers repeated the pen, unit and parity the page behind already showed, and a header spec nearly made `#ID › pen · parity` a default for every task when parity matters at farrowing only (owner, 2026-10-13: "each display needs a clear decision, not made randomly").

**Show it.** `features/<id>/budget.md` with `## Inventory`, `## Questions` and `## Levels`, then the cut list, and the squint test's first three things in the PR body.

**Checked by.** The gate refuses a screen change without `budget.md`; `scripts/check-headers.mjs` on the changed screens (the Headers law: 24px to the body; nothing acting but Back, the subject chip and a sheet's corner actions, each centred on the title and its line; no count in a header; the title and its line each on one line at 360 in EN and ZH, the title 12px clear of the corners); the judge's squint test and cold question (gate.md §3–4). To automate (ledger): every fact the changed screens render traced to the budget, the header line and its identity facts among them (L18).

## P4 · Judge it by eye, as the owner would

**The principle.** Nothing is judged unrendered. Render what you ship at 390 and 360 beside the original and a house reference; criticise each direction in writing with [the owner's eye](taste.md); iterate until one is clearly better, or hand over no change. The last look is at the pushed head, after the last edit: any edit after a crit voids it.

**Why.** Two judges rated pair c3 better when the owner called it a bulky brute: the default eye prefers boxes, bold and size. Trial 2 raised a badge after its crit and wrapped the title onto two lines unseen.

**Show it.** `## Self-crit` in `critique.md`: per direction and round, each problem fixed or not, each Keep item as strong or not, the squint test, cluttered / flat / bulky against the original, the reference it was held against, and **better because** or **not better because**; last, a `Final look` block naming the commit it rendered.

**Checked by.** The driver's look; the judge's calibration on the owner's rulings, cold look and before/after (gate.md §3–4); `scripts/check-spacing.mjs` for the clearly wrong spacing the eye reads as clutter (a block closer to a list than its rows, crowded boxes, doubled lines).

## P5 · Prove it, don't claim it

**The principle.** Every claim is evidence from the exact commit, measured or derived, never kept by hand: a score, an approval, "identical", "used by", a screen's notes. When the thing a claim is about changes, the claim is void until measured again.

**Why.** "0 pixels different" was measured against a stale main (R10). An audit found screen notes quoting text the screens no longer show, component scores that survived changes to the component, and "used by" lists kept by hand.

**Show it.** Every result in the PR names its commit; claims link to the measurement.

**Checked by.** The gate runs every check on the exact merge candidate and re-measures the builder's claims (gate.md §1, §5); `--verdict` refuses a moved head or main. To automate (ledger): notes checked against the rendered screen, a component change resetting its score, "used by" derived at atlas build.

## P6 · The owner sees only finished, visual work

**The principle.** The owner's attention goes to finished work and real decisions only. The driver looks first and sends a change back with its one deciding reason (up to two crit rounds) before any judge or the owner sees it. Anything that needs the owner's call reaches them as a rendered board: the options side by side at 390, lettered, the current screen among them, never a question in words. Agents make design calls; product rules (what is saved, eligibility, permissions) go to the owner as decision items.

**Why.** The owner asked to see visual proposals, not text questions with options described in words (2026-10-12), and to spend no time on prototype marks.

**Show it.** The driver's one-line call on each pair; boards for decisions.

**Checked by.** The merge rule: a change that moves a screen merges only on the gate's pass and the judge's verdict (README, "Who decides what").
