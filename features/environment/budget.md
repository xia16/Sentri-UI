# environment: headers, information budget

Scope: the headers only (the shared Headers change). Bodies keep their own budgets.

## Inventory

- The page's name, the farm, the section, the unit, a description of the page, the source of a finding.

## Questions

1. Where am I? (the title) 2. How do I get back? (Back, top left)

## Levels

- No header line on any Home page or drawer: the farm, section and unit are scope (on Home itself, one Back away); descriptions are cut.

## Headers (2026-10-13)

The header line of every surface of this feature, decided by the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13). The default is no line; each kept fact names its question and passes the Back test.

| Surface | Hub or action | Header line | The worker's question it answers there | Back test |
|---|---|---|---|---|
| Every page and drawer of this feature | action or destination off Home | none | | Back reaches Home, which shows the section and unit |

Ambiguous, quieter option taken: The PREVIEW badges (prototype chrome) are dropped with the old page heads.

Chains walked on the real Back path after this change (crit round 1): no surface here writes to or is about one animal without showing it on screen or one Back away; no line changed.

Until migrated (crit round 1): the Assistant, Environment & devices and Maintenance pages keep their page-built head, PREVIEW badge and subtitle. Their bodies are below the farm legibility floors (10px text, 9px chart labels) and a change that moves a screen must bring it to the floors; that body work is its own task. Their drawers (report issue, issue detail) take the sheet header.

---

# Disabled is not faded (shared change, ds/disabled-not-faded), information budget

Scope: the facts a disabled or waiting control displays. The change adds and cuts no fact; it changes how loud each one is.

## Inventory

- The control's label (the verb: `Save setting`, `Record deaths`, `Finish farrowing`).
- The current option of a disabled segment (`Auto` of Auto / Manual).
- The other options of a disabled segment.
- The floor key's glyph (− at the floor, + at the ceiling, a digit on a full pad).
- A disabled picker's current value (`None`, the chosen names).
- That the control is unavailable now (today: faded text).

## Questions

1. What will this do once it is available? (the label, at full legibility)
2. Can I use it now? (the surface and the rim: dashed means not now)
3. What is it set to? (the current option: weight, not a raised pill)
4. Why not, and what do I do? (the host's reason line or hint; unchanged by this change)

## Levels

- **Settled**: the label, the current option and the picker value, in ink (or `ink-2` on a floor key), at the control's own size and weight.
- **Watch**: unavailability, quiet: the flat disabled surface and the 1px dashed `control-border` rim. No colour, no icon added.
- **Cut**: faded text as the signal (opacity, `disabled-ink` text).
