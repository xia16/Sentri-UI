# Populate brief (atlas population)

You add designed screens that already exist in the prototypes, but aren't shown, to the **atlas**. **You design nothing.** No screen's look changes; you map, document and verify.

The atlas (`atlas/`) is built by `npm run atlas` (`scripts/build-atlas.mjs`) from `features/<id>/feature.json`, `features/<id>/PRD.md` and `sections/sections.json`. Read `atlas/SCHEMA.md` first: screen addressing (`url`, `preset`, `steps`, deck and archive addresses), `status`, `aliasOf`. Screens open bare at 390×844 through `ux/system/atlas-bare.js`.

The driver fills in **BATCH** (a name) and **FEATURES**, with a scope note listing known wrong placements.

## For each feature in your batch

1. **Screens.** Add every designed screen to `features/<id>/feature.json`, each with an id, a name, an address and the status it deserves:
   - Current designs are `in-design`.
   - Superseded archive designs are `earlier`.
   - A screen that is the same as another feature's uses `aliasOf`.
   - A placeholder feature with real screens stops being a placeholder.
   - Fix the wrong placements the scope note lists.
2. **Verify each screen renders.** Run `npm run ux` and open each screen bare at 390×844 with Playwright. It must show the intended screen (not a hub, a blank or another slide), post `atlasReady`, and log no console errors. Save one screenshot per screen to your scratch folder. A screen that won't render correctly stays out, and your report says why.
3. **Notes.** Notes cover only what the live demo can't show: states tables for data-driven elements, hidden logic, interaction rules and edge cases. Take them from the feature's existing docs (research, ops notes, contracts, ADRs). Don't invent behaviour. Where docs disagree, add a decision item (the `review/*.json` format in `atlas/SCHEMA.md`) instead of choosing.
4. **PRD.** If `PRD.md` is a stub, fill it as a **draft** strictly from existing docs: purpose, users, jobs, screens, rules, open questions, and links to the sources. Mark it "Draft — compiled from existing docs, not yet confirmed". Make no new product decisions.
5. **Section.** Put the feature in the right section in `sections/sections.json`. A new feature gets a feature folder and a section entry.

## Rules

- Don't edit prototype visuals, components, `bundle.js`/`bundle.css` or tokens. You may add atlas-only mapping (screen ids, data attributes, presets) to a prototype when it's the only way to open a screen. Keep it minimal and say so.
- `atlas/atlas.json` is generated. Run `npm run atlas` to check your data builds, then `npm run check`. Commit the regenerated file only if the driver says this PR is the one that regenerates it; parallel batches leave it out (`git checkout -- atlas/atlas.json`).
- `npm test` passes.
- Other batches run in parallel. Touch only your features' folders, your prototype mapping, and your features' lines in `sections.json`.
- Merge main forward before pushing (`git fetch origin && git merge origin/main`). Never force-push.

## Ship

1. Work on branch `atlas/populate-<batch>`, in a worktree off `origin/main`.
2. Open a PR "Atlas: populate <features>" with a table: feature · screens added · placeholders filled · decisions filed.
3. Data and docs only, so it merges once `npm test` and `npm run check` pass. If the merge hits a conflict, merge main in again and retry.

## Report

Keep it to 150 words or fewer:
- the PR;
- per feature: screens added, earlier, alias, and any left out, with why;
- the decisions filed;
- any mapping you added to a prototype.
