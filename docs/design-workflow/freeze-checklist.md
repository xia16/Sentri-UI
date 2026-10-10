# Freeze checklist

Freeze a feature when **every screen is approved** by the owner. The frozen feature becomes the source the rest of the system is updated from. The freeze **publishes only after propagation verifies**: every item below is ticked, with evidence on one recorded commit.

Freeze automation isn't built yet. Until it is, the driver runs this list by hand and opens the propagation PRs.

## Checklist

- [ ] **Baseline.** Record the frozen commit and screenshot every screen at 390 and 360, in EN and ZH. From now on, any change to these screens fails the gate unless it reopens them.
- [ ] **Components.** For each variant the feature uses:
  - mark it **set** at this version;
  - update its "used by";
  - regenerate its specimens from the frozen screens.

  Then recheck every other feature that uses it. **Approval scope:** approving one feature doesn't approve a shared variant for the others. Each other feature passes its own before/after.
- [ ] **Section patterns.** Update the section's patterns (Task skeleton, Home task card) from the frozen screens and regenerate the section doc. Diff sibling features against the new pattern and file a backlog item for each gap.
- [ ] **Notes and PRD.** Reconcile each screen's notes (states tables, hidden logic, edge cases) with the frozen behaviour. Mark the PRD final, close its decisions, and remove the provisional flags.
- [ ] **Scenarios.** Every leaf in `features/<id>/scenarios.json` passes (`node scripts/run-scenarios.mjs`) on the frozen commit, or is blocked by a recorded owner decision that keeps it out of scope.
- [ ] **Copy.** Mark the feature's strings approved in EN and ZH. The copy-budget test passes. New terms go into the glossary (`ux/laws/glossary.md`).
- [ ] **Cross-feature.** Document the "adds to" contributions on host features, and check that the entry points and links are live.
- [ ] **Native handoff.** Name the native control for every component on every screen. Bundle the bare HTML, notes and PRD.
- [ ] **Evidence expires.** If propagation changes another screen, that screen's earlier approval evidence expires, even if only a behaviour rule changed. List the expired screens and send them back through the gate.
- [ ] **Backlog and retro.** Close fixed items, move open ones to the next map, and file declared misses.
- [ ] **Atlas.** `npm run atlas` and `npm run check` are clean. The feature shows as frozen, and its Old UI entries are marked superseded.

## Reopen rule

A later change reopens **only the touched screens**. The feature shows as in design until those screens are re-approved. The rest stay frozen, and their evidence stands unless the change expires it (above).
