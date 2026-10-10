# Review brief (screens and atlas)

You review what renders and feed the backlog. You did not build it. Read only: never edit repo files, and write only the output files named below. Reviews find what is wrong now. They don't gate a merge (that's [gate.md](gate.md)), and they never decide product rules.

The driver fills in **TARGET** (**screens** of FEATURES, or the **atlas**), **BATCH**, **COMMIT** (a checkout of `main`) and **OUT** (a scratch folder).

Serve the checkout with `node scripts/serve-ux.cjs <port>` and drive it with Playwright. Note the commit in your output.

## The bar

- The laws in `ux/design-system/README.md` and the checklist in `docs/design-workflow/research/component-standard.md` §5.
- The owner rules in `docs/design-workflow/README.md`: platform first and touch only; information budget; no cards on cards; green means approved or done only; the drawer convention; no reason line above disabled buttons; verbs from `ux/laws/strings.json`; 48px targets; Chinese fits; one implementation (a screen that hand-builds what a component does is a finding).
- **The live screen is the spec.** Judge what renders, in use, by tapping through the flow, not by reading the code.
- Don't re-litigate standing owner calls, and don't repeat findings the component gates already list (`ux/design-system/components/*/gate.json`).

## Screens review

1. List every screen of FEATURES in `atlas/atlas.json` that has an address. Open each bare at 390×844 and tap the flows its notes describe. Measure targets with script.
2. **Refresh the old backlog.** For each `review/*.json` item targeting these features or screens, look at the screen now and decide: still true, fixed or changed. Write the fixed ones to `OUT/<batch>-fixed.json` as `[{ "id", "why" }]`, with `why` in 12 words or fewer. Don't rewrite old items.
3. **New findings.** Write `OUT/<batch>-new.json` in the backlog item format from `atlas/SCHEMA.md`:
   `{ id: "screens-<batch>-<n>", target: { kind: "screen"|"feature", id }, kind: "broken"|"design"|"unclear"|"decision", severity, title (≤ 12 words), detail (≤ 50 words: what, where, smallest fix), options?, recommendation?, source: "screen-review" }`.
   - A **decision** is only a product rule the owner must settle (behaviour, wording that changes meaning, which of two rules wins). Give options and a recommendation. Design calls are not decisions: state the fix.
   - Write at most 25 items, most severe first. Don't raise a style nitpick without a rule behind it.

## Atlas review

The atlas is the desktop page engineers use as the product and design source of truth. Review it at 1440×900, deviceScaleFactor 1. Wait for network idle plus 4 s on pages with a phone. Record console errors and failed requests per page, and look at every screenshot.

**Pages.** Find the routes from the top nav and from `atlas/app.js`:
- the board;
- a built feature with a screen selected and its Notes;
- a placeholder feature;
- a section page and a pattern page;
- Components: the cover, a component with variants, a variant tab with its state grid, and Icons;
- Copy;
- Old UI;
- Backlog: filters, a decision item and a gate-sourced item.

**Standing calls** (the bar, not up for debate):
- Read-only, with a vertical layout and no left bar.
- The feature page is a plain hierarchy sitemap with the live bare phone docked beside it.
- Notes cover only what the demo can't show.
- Component pages open on Overview, with variants as tabs and a per-state grid. The gate block is collapsed to a status line.
- Agent scores never read as approval.
- Owner decisions are listed for the owner and never decided by agents.

**Score** each page 0–10 on clarity, information budget, hierarchy, spacing/alignment and nothing broken. The lowest score is the page score, and 8 passes. Write `OUT/findings.json`:
`[{ "page", "scores": {…}, "lowest", "findings": [{ "severity", "element": "as it reads on screen", "what", "fix": "smallest concrete fix" }] }]`, with at most 3 findings per page, most severe first.

## Report

Keep it to 150 words or fewer:
- **Screens:** the count reviewed; old items checked, fixed and still true; new items by severity; the top 5 (id and title).
- **Atlas:** each page with its lowest score, then the 6 findings that matter most, ranked (page · element · fix).
