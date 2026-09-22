# Farrowing drawer: optional actions and completion

Research date: 2026-09-17. Scope: Edit, Record death, and More actions currently presented as icon-over-label controls above Back and Finish farrowing. Official sources only; no UI changes.

## What the sources say

### Apple Human Interface Guidelines: Toolbars

- Toolbars contain commands acting on the current view; tab bars switch between areas of an app. The distinction is functional, not simply whether controls appear at the bottom.
- Prioritize actions supporting the main task, avoid overcrowding, and group controls by function and frequency. Less important actions can go in More when needed.
- Give completion actions such as Done or Submit a prominent style, with only one primary action. Separate navigation and critical completion controls into visually distinct groups.
- Control meanings should be clear. Apple explicitly recognizes Edit as an action that may need text because a symbol alone does not express it well.
- These recommendations do not mandate inline pills. For native Apple toolbars, Apple actually prefers familiar system symbols without borders; that advice should not be cited as endorsement of outlined custom buttons.

Source: [Apple HIG — Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars?changes=la).

### Material Web: Buttons

- Filled buttons serve important final actions that complete a flow. Outlined buttons provide medium emphasis for important secondary actions; text buttons provide the lowest emphasis, particularly among multiple options.
- Button labels describe the resulting action. An optional icon can help communicate that action.
- The official usage example pairs an outlined Back button with a filled Complete button. This is especially close to this drawer's Back / Finish farrowing relationship.

Source: [Material Web — Buttons](https://material-web.dev/components/button/), particularly Usage, Filled button, Outlined button, and Text button. This is the official Material implementation documentation; the Material 3 guidelines page was JavaScript-only in the text browser and is not treated as independently inspected evidence.

## Implications for this drawer — design inference

1. Keep Finish farrowing as the single highest-emphasis action, with Back visibly secondary. A separate footer containing this pair is consistent with the hierarchy above; its fixed positioning is our product choice, not a requirement established by these sources.
2. Treat Edit, Record death, and More actions as optional commands on the displayed record. Place them near the litter summary they affect, using compact single-line labels with optional leading icons. Light outlines can make each target explicit without giving the group the prominence of Finish.
3. Avoid equal-width icon-over-label styling that resembles destination navigation. The current row is not inherently an incorrect toolbar; the concern is its visual competition and possible navigation-like appearance in this particular composition. This is a hypothesis, not a documented usability result.
4. More actions should disclose genuinely additional commands. Whether Record death stays visible should follow its real task frequency and discoverability needs; these sources alone do not justify hiding it or labeling it destructive.

Recommended direction: a compact secondary-action row near the litter summary, with a separate Back / Finish farrowing footer. Validate narrow-width fit, text scaling, and touch targets in the eventual implementation.
