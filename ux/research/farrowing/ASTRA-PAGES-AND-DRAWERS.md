# Pages, drawers and bottom controls

Applies to the Farrowing and Inspection Astra prototypes.

## Presentation

| Screen | Presentation |
| --- | --- |
| Pig detail, production stats and batch history | Full page |
| Record history, pen history and feeding details | Full page |
| Task overview and performance | Full page |
| Farrowing execution and finish review | Drawers for quick action and return to the task list |
| End-task review and task receipt | Full page |
| Treatment, transfer and bulk recording workflows | Full page |
| Completed litter and sow-death summary | Content-fitting review drawer |
| More actions and unavailable actions | Drawer, sized to its contents |
| Note, weight, temperature, backfat and body condition | Short drawer for a single pig |
| Count corrections and expanded finish corrections | Tall drawer, matching Record death; keep space between counter rows |
| Medicine, condition and optional-detail pickers | Focused drawer over the current form |

## Navigation and controls

- A full page has one Back control in its header. It has no grab handle, dimmed backdrop or duplicate footer Back.
- A drawer uses its bottom Back control when it has a footer. Keep the title aligned with the content. A close icon can dismiss a review drawer; it does not replace Back in a nested workflow.
- Pig detail has one neutral **Actions** entry. It does not predict whether the user wants Health, Notes or another action.
- Active farrowing, completed-litter and sow-death drawers share the same outlined action row beneath their record summary: Edit, Record death and More actions, with icons beside labels. Back sits in a separate bottom bar; only active farrowing adds Finish farrowing.
- Forms and execution screens use a prominent completion control: Save, Finish or Hold to end. Farrowing execution puts Edit, Record death and More actions in a row of outlined buttons directly beneath the litter summary. Icons sit beside labels. The fixed bottom bar contains only Back and Finish farrowing.
- An information page's entry into another workflow, such as Adjust feed or End task review, is neutral. The actual completion control is on the workflow page.
- Bodies scroll independently above fixed footers. Keep 24 px bottom padding on full pages and a visible gap above drawer footers.
- A picker keeps the current form and its entered values underneath. Back restores the actual entry screen and its scroll position.

The shared policy and page styling live in `ux/system/astra-surfaces.js` and `ux/system/astra-surfaces.css`. Presentation and navigation regression checks are in `ux/system/astra-surfaces.test.cjs`.
