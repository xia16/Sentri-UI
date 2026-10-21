# Build brief

You design and build a screen, a feature or a component family for **Sentri-UI**, a native-feel mobile app for gloved, one-handed pig-farm workers, in English and Chinese. You make the design calls yourself; the owner reacts afterwards. Work on your own branch in a worktree off `origin/main`; never commit to `main`.

The driver fills in **TITLE**, **SCOPE**, **CHANGE CLASS** (copy · presentation · behaviour · shared component; the gate derives the same from the change, and its class is the one that counts) and **MODE** (new · polish · refactor). Every build gets this whole brief. A one-off instruction is added to it, never replaces it.

**What success is.** The first design you hand over is clearly better than the screen it replaces, side by side at 390px. Inside your run, try as many times as you like. If no direction beats the original, hand over **no change** with your critique; an honest "the original stands" beats a worse screen.

**How you work.** Read the six [workflow principles](../principles.md) first: P1 start from what exists, P2 every change has a known reach, P3 information before layout, P4 judge it by eye as the owner would, P5 prove it don't claim it, P6 the owner sees only finished, visual work. This brief is the order you apply them in and what each step leaves behind. The product's laws (farm legibility, drawers, colour, copy, design-system components only) are in `ux/design-system/README.md` and the owner rules in `docs/design-workflow/README.md`; follow them as binding. **Read [ux/design-system/SURFACES.md](../../../ux/design-system/SURFACES.md) before you build:** it fixes which colour is the base, which is the card, and how current, selected and pressed look, with good and bad examples as images. Footer and dock buttons are 56px.

## 1. Start from what exists (P1)

1. **References.** Every live screen in `atlas/atlas.json` that does this job, in this feature and its neighbours; hand-built copies in `ux/system/*-astra-*.js` and `ux/tasks/*/`; the old UI in `references/figma/index.json`; what is approved (status `approved` / `set`) and the section patterns in `sections/`. Capture a baseline of each screen in scope at 390×844 on `origin/main` (`node scripts/shoot-screens.mjs <out> --screens <ids>`) and record the commit. Write the references table (job · where it exists · status · baseline · commit) into the PR body.
2. **The owner's eye.** Read [taste.md](../taste.md) and open the [house references](../references/README.md) (Home, Unit, More actions, Farrowing room). Look at your baselines beside them.
3. **What each part is.** Run `node scripts/component-jobs.mjs` and read the job of every component.
4. **Write `features/<id>/critique.md`** and commit it before any screen change:
   - `## Keep`: what works, element by element, and why. A kept element stays at least as strong.
   - `## Problems`: what is broken, each with its evidence (a check's output, an owner law, a worker question it fails), marked **major** or **minor**. Taste without evidence is not a problem.
   - `## Parts`: every visible part, what draws it today (a component, or "page-built" and its file), the existing component whose job it is, and keep / fix / cut. A part drawn by hand or by the wrong component, when one does its job, is a problem.
   - `## Self-crit` follows in step 4.

   Prototype chrome (PREVIEW badges, sample-data lines, study links) is not product: leave it out of the critique.

## 2. Information before layout (P3)

Write `features/<id>/budget.md` and commit it before any layout, for every new screen, redesign and component variant that shows facts. **Every fact the finished screen displays is in it with the question it answers there**, including the header line, the identity facts beside a subject chip (chosen per task: parity matters at farrowing, not everywhere) and whatever a shared component draws by default. A fact not in the budget is not drawn. On an existing screen, kept facts are listed as kept with their question; the budget decides what the problem parts show and what to cut, and never overrides Keep without a problem behind it.

1. `## Inventory`: every fact the screen could show, per item and state.
2. `## Questions`: the worker's questions at that moment, in order (where am I? does anything need me? what do I do? is this the right animal? who did it, when?).
3. `## Levels`: each fact gets one level. **Act now** (something to do now; the only loud thing), **Watch**, **Coming up**, **Settled** (quiet), **Audit** (smallest). A state that qualifies facts (offline, stale) sits quietly beside them. A fact that answers no question is cut.
4. Budget it against real volumes and the real header and bar: one coloured element per row at most, a second line only when it changes what the worker does, nothing the header says, no zeros, no derived figure beside its parts. The answer to the first question is the heaviest thing on the screen.
5. The cut list goes in the PR body. Its **Results** block is the gate's `results.md`, pasted whole; the body states no measurements of its own (test counts, pixel differences, sizes, "identical"), since the gate's are on the gated commit and yours go stale with the next push (gate-simplify.md S8). Cut before you enlarge; cutting facts never cuts structure (sections keep their headings, rows stay in groups, the page ends on a group).

Worked example, the Farrowing room row: Act now "3 days overdue" in dark red; Watch "Farrowing now · 9 alive · 5 dead"; Coming up "Due today · P2"; Settled "11 alive · 2 dead" in grey with a small "05:58 · G.H"; cut born N, "Done", the pencil, chips, zeros.

## 3. Change only what the problems name (P2)

- **Scope is the problem list.** In polish mode change only parts a problem names. In new mode the critique is of the old UI, and Keep says what the new design carries over.
- **Use the component whose job it is.** A part a component already does moves onto it (a variant if needed). A page-built part with no component is built in the design system **as it looks today**, proven identical by renders before and after, committed on its own, and only then improved. Never restyle a component on the page or leave a workaround; the page's CSS sets layout only. Component delivery: `docs/design-workflow/research/component-standard.md`; atlas authoring: `atlas/SCHEMA.md`.
- **A check that fails a kept part is questioned, not obeyed.** Leave the part, name the check in your final message.
- **Know the reach.** A shared rule, token or component you change reaches every screen, pattern and demo using it. Before your final look, run the full screen diff on your pushed branch (from any checkout: the gate runs main's own tools): `node scripts/gate.mjs --candidate origin/<branch> --scope <features>` (minutes for a change to one feature; longer for a shared one). Every changed screen outside SCOPE is a bug in your change: give your component its own rule or token. A deliberate shared change is its own task.
- **Don't decide product rules** (calculations, eligibility, what is saved, permissions, which actions exist). Build to the current ruling; a missing one becomes a decision item for the owner.

## 4. Judge it by eye (P4)

1. Build two or three **directions** in real components, each answering the problems; in polish mode they differ only in the problem parts. A direction is a render, not a finished build.
2. **Render each** at 390×844 in EN beside its baseline (`node scripts/shoot-screens.mjs <out>/<direction> --screens <ids> --widths 390 --langs en`) and open both images. A design you haven't seen rendered isn't criticised.
3. **Criticise it in writing** in `## Self-crit`, per direction and round: each problem fixed or not; each Keep item as strong or not; the squint test (the first three things the eye lands on against the worker's first three questions); cluttered, flat or bulky against the original ([taste.md](../taste.md)); the house reference you held it against; the rejected examples it could show (gate.md); one line, **better because …** or **not better because …**.
4. **Iterate** while each round gets closer. Hand over only a direction whose crit is clean; otherwise reset the screens to `origin/main`, keep `critique.md` and report no change. Never compare directions only with each other.
5. **The final look.** After the last commit and the merge of main, render every screen in scope from the pushed head at 390 **and** 360, beside its baseline, and look at the whole screen. Write it as the last Self-crit block, `Final look`, naming the commit. Any edit after it voids it.

## 5. Prove it (P5)

- Run `npm test` and `npm run check`; both pass. Run `node scripts/check-states.mjs`, `node scripts/check-legibility.mjs --changed <your screen ids> --strict`, `node scripts/check-spacing.mjs --changed <your screen ids>` and `node scripts/check-headers.mjs --changed <your screen ids>`; fix what they report on your screens. Change a test only when it asserted the old structure, and say so.
- Open every changed screen at 390 and 360 in EN and ZH: no console errors, targets ≥ 48px. For a behaviour change, run the scenario leaves it touches (`node scripts/run-scenarios.mjs`).
- Merge main forward with `node scripts/merge-main.mjs` (it regenerates `atlas/atlas.json` and `tokens.css` instead of resolving them by hand), rerun, and name the commit every result comes from.

## 6. Hand over (P6)

The driver looks at your pairs first. If they can't call it better they send it back with the one reason that decided it: fix that and what it points at, without touching what was right, redo the final look and hand over again. A reason you disagree with gets a one-line answer, not a silent change.

**Final message**, 250 words or fewer: the commit of your final look (the pushed head); the outcome (**a design** or **no change**); Keep and the problems fixed (or a link to `critique.md`); the last self-crit line; the references table (or a link); what you built, migrated and retired; the screen diff's result (only your screens moved, or what else did and why); test results with the commit; any check you questioned; any product decision filed with its recommendation. Don't claim a pass; the gate measures it.
