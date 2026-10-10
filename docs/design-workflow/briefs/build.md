# Build brief

You design and build a screen, a feature or a component family for **Sentri-UI**. Sentri is a native-feel mobile app for gloved, one-handed pig-farm workers, in English and Chinese. You make the design calls yourself and build them well; the owner reacts afterwards. Work on your own branch in a worktree off `origin/main`. Never commit to `main`.

The driver fills in: **TITLE**, **SCOPE**, **CHANGE CLASS** (copy · presentation · behaviour · shared component) and **MODE** (new · polish · refactor).

## Read first

- `docs/design-workflow/README.md`: owner rules, gates, who decides.
- `ux/design-system/README.md`: the laws (copy, colour, type, space, record-sheet law, optional inputs are optional rows). Also `tokens.json`/`tokens.css` and `IMPLEMENTATIONS.md`: one implementation in `components/bundle.js` + `bundle.css`, namespace `SentriUI`. Never edit the retired `ux/system/sentri-components.*`.
- `docs/design-workflow/research/component-standard.md`: page anatomy, the component/variant/pattern rule and per-type states.
- `docs/design-workflow/GLOSSARY.md` and `atlas/SCHEMA.md`.
- For a component: `ux/design-system/components/<Name>/README.md`, `preview.html`, `variants.json` and `gate.json`. Fix every open finding.

## 1. References

Do this before you draw anything. A new design built without looking at the old one is how a filter came out far worse than the one it replaced.

1. **Live screens of this job**: find every screen in `atlas/atlas.json` that does this job, in this feature and in its neighbours (same section, entry points, "adds to"). Search the prototypes (`ux/system/*-astra-*.js`, `ux/tasks/*/`) for hand-built copies of the job.
2. **The old UI**: look the job up in `references/figma/index.json` (and `index.md`) and note the file, the flow and the node.
3. **What's approved**: approved screens, components and variants (status `approved` / `set`), and the section patterns (`sections/`, e.g. the Task skeleton or the Home task card) that already cover the job.
4. **Ask the engineer** if the job exists in the live app and isn't in the repo.
5. **Capture baselines**: open each screen bare at 390×844 (`<screen url>&screen=<id>`, see `atlas/SCHEMA.md`) on `origin/main` and save one screenshot per screen. Record the commit.
6. **Write it into the brief or PR body** as a table: job · where it exists today · status · baseline screenshot · commit. The gate compares against these.

If something approved already does the job, start from it. You may improve it ([Room to design](../README.md#room-to-design)). When the job is only adequate, sketch at least one alternative that departs from the current pattern before you pick, and build the one that serves the farmer best. A shared component changes only by improving a feature.

## 2. Owner rules (binding)

- **Farm legibility (binding).** Barn, glare, gloves, arm's length, two seconds. Primary values and body text ≥ 16px; secondary and meta text ≥ 13px; nothing visible under 13px except the phone status bar. Contrast ≥ 4.5:1 for all text and ≥ 7:1 for primary values and numbers a farmer acts on. Tap targets ≥ 48×48 (the control or an invisible hit area). Ink, not pale grey, for anything that must be read. Fix crowding by tightening copy and layout, never by shrinking type. Full law: `ux/design-system/README.md`, "The farm legibility law".
- **Platform first, touch only.** States: Default, Pressed, Selected/Checked, Disabled, Error, Loading/Waiting, Empty, Long label / Chinese, whichever apply. No designed Hover, Focus or keyboard rows. Accessibility: screen-reader role, name and state; reading order matches visual order; no gesture-only action; targets ≥ 48px (`tap-min`).
- **Components come from real features.** Start from the approved screen and reproduce it, then improve only where it makes the feature better. A component is generic or used by 2+ sections. The same job with a different look is a **variant**, never a copy. One implementation.
- **Beat what you replace.** Compare against your baselines at 390px. If yours isn't clearly better, keep the original. In **refactor** mode nothing visible may change.
- **Copy fits the component.** Labels we write stay inside the copy budget in EN and ZH, with verbs from `ux/laws/strings.json` (one meaning per verb). Real data (medicine names, ear tags, farm names) is never shortened. State how it wraps and show the full value.
- **Drawers.** Footer **Back** leaves and keeps the draft. **‹ Parent** goes up a level. No ✕. **Done** applies. **Reset** for filters, **Clear** for input.
- **No reason line above a disabled button.**
- **Green means approved or done only.** Colour only where it means something.
- **No cards on cards.** One surface; only items are boxes. **Information budget**: nothing said twice; rank what the farmer needs first; extra detail goes behind a link or count.
- **Don't decide product rules.** Calculations, eligibility, defaults, what gets saved, permissions, corrections and which actions exist belong to the owner. Build to the current ruling. If a ruling is missing, file a decision item with options and a recommendation.

## 3. Atlas rules (for anything the atlas renders)

- **Previews render directly.** `preview.html` and `variants/*.html` call `SentriUI.*` directly. Don't link tokens, bundle or fonts (the atlas injects them). Don't use `new URL(relative)` (the atlas runs them in a srcdoc iframe), and don't nest your own iframe.
- **Variant scripts iterate `[data-state]`.** Each top-level element carries `data-state="<State>"` and renders one state. Scripts draw by `document.querySelectorAll('[data-state]')` or from `document.currentScript.parentElement`, never by looking up one named state.
- **Tokens only.** No raw hex or px in component CSS.
- **Specimens sit in their real container.** A picker trigger sits in its form row, and a sheet's search sits in a sheet. Never stack a specimen loose beside unrelated parts.
- **No stress-test copy.** Specimens use real Sentri words and data. Show long data the way real data is long, not invented long labels.
- **`atlas/atlas.json` is generated.** Edit the sources, then run `npm run atlas`.

## 4. Deliver (commit all of it)

For a feature or screen, deliver the screens, each one's notes (only what the demo can't show: states tables, hidden logic, interaction rules, edge cases), and the `feature.json` entries.

For a component, deliver:
1. `components/<Name>/variants.json`: `[{ "id", "name", "use", "notUse", "states": [...] }]`. Keep it to the smallest set that covers real Sentri screens.
2. `components/<Name>/variants/<id>.html` per variant, with every state that applies.
3. A `README.md` in the standard's anatomy: purpose, when / when not, anatomy, variants, states, behaviour, content and wrapping rules, accessibility, do / don't, related, classification.
4. The implementation in `bundle.js` + `bundle.css` (+ `index.d.ts`). Keep call signatures working or update every caller.
5. Migrate every prototype that hand-builds this job onto the component, and delete the copies. Rebuild any generated prototype (e.g. `ux/tasks/piglet-processing/simple/build.mjs`).

## 5. Verify before you hand to the gate

Two tiers: run the mechanical checks after each edit (`node scripts/check-states.mjs`, `node scripts/check-legibility.mjs --feature <id>`); they say nothing when clean. Judgement happens once, at the gate, by someone else.

- Run `npm test` and `npm run check`. Both pass. Run `node scripts/check-legibility.mjs --changed <your screen ids> --compare <a server on origin/main>`: it exits non-zero if a screen you touched is worse than on main (or, once the README says `strict`, breaks the law at all). Never make it worse; aim to meet the floors. Change a test only when it asserted the old structure, and say so.
- Run `npm run ux` and open every changed screen bare at 390×844 and 360×800, in EN and ZH. Check for no console errors and targets ≥ 48px, and take after-screenshots on the same states as the baselines. Use Playwright if it's installed (`SENTRI_PLAYWRIGHT` may point to it). If it isn't, say so.
- For a behaviour change, walk the scenario leaves it touches (see `briefs/polish-loop.md`, "Executable leaves").
- Merge main forward (`git fetch origin && git merge origin/main`), rerun the above, and record the commit your evidence is from. Don't chain commands so that a failure hides.

## Final message

Keep it to 250 words or fewer: the references table (or a link to it), what you built (variants, screens), what you migrated and retired, test results with the commit, before/after pairs you expect to be better, and any product decision you filed (with its recommendation). Don't claim a pass; the gate measures it.
