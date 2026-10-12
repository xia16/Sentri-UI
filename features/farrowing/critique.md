# Farrowing: Find a sow and Scan ear tags, critique of the original

Scope of this change: `farrowing.search` and `farrowing.scan` (and the screens added beside them). The owner approved the replacement designs on 2026-10-12 as static mockups; this critique is of the screens they replace, baselined on `origin/main` at `dd78778` (`node scripts/shoot-screens.mjs <out> --screens farrowing.room,farrowing.search,farrowing.scan --widths 390`).

## Keep

- **The room's sow row** (ear tag over context, figure over state word). It is the approved Row · animal variant and stays the row of Scan; Find a sow keeps the same row with her place on the right.
- **Pen codes match in search**, and a result opens her farrowing drawer by her status (`room-sow`). Both stay.
- **The dock's two doors** (Scan ear tag primary, Search icon). Unchanged.
- **Live results as you type**, updated in place without reloading the page.

## Problems

- **major** Find a sow is a drawer that names one unit ("Unit 7") and lists "7 sows in this unit" before anything is typed. A worker holding a tag from another unit finds nothing. Evidence: the old note "Find a sow in this unit"; the worker's first question ("which sow is this?") fails for any sow outside the unit.
- **major** Scan ear tag opens a placeholder "Scanner preview" with "Try sample tag": the primary button leads to a non-working preview, and the working path (a typed search) is hidden below it (the old issue "Two search doors"). Evidence: old `farrowing.scan` issues.
- **major** One scan opens one sow. A worker who scans a row of crates has to start again for every tag, and cannot act on several sows at once.
- **minor** A text field at the bottom of a half-height drawer: the keyboard hides the results. Evidence: the old drawer is `medium` (76%) with the field under the title.
- **minor** The old search has no clear control and no way to Scan from it.

## Parts

| Part | Drawn by today | Component whose job it is | Call |
|---|---|---|---|
| Search drawer | `roomSheet` (Sheet drawer) | Sheet **page** is for a form or a record, not a search; a pinned field is a page-level pattern | **fix**: a full-height page |
| Search field | page-built `<label>` + input | none (a field in a sheet body is `Field`; a pinned search field has no component) | **fix**: page-built in Farrowing's CSS, to move to the design system once the shared PR lands |
| Result row | `SentriUI.row` animal | Row · animal | **keep** the component; place on the right |
| Group label | none | Heading (section) is 16px/500 ink; the approved mock is 13px/600 muted | page-built label |
| Scan preview + button | page-built `.scanner-demo` | none | **cut** |
| Scan page header | `room-appbar` pattern | IconButton + a heading | **keep** the room's header pattern |
| Scanner state pill | none | Status is workflow state, not scanner state | page-built (ink dot, no green) |
| Scan rows | none (one sow only) | Row · animal as select + door (`rowSelectDoor`) | **fix**: component |
| Empty messages | page-built | none | page-built |
| Selection bar | none | the Room dock (`.room-dock`) + Button | **fix**: the room's dock |
| Actions sheet | none | Sheet drawer + Row navigation (Inspection's More actions rows) | **fix**: component |
| Stop glyph | none in the registry | Icon | added once, in `farrowing-icons.js`, until the registry takes it |

## Self-crit

Built to the owner's approved mockups (`mock2.html`, `scan3.html`), so there are no competing directions; the judgement is against the original.

**Final look** (this branch, after the last commit; every state of Find a sow and Scan ear tags at 390 and 360, EN and ZH; screenshots are in the PR):
- Problems fixed: global search with grouped results (fixed); Scan is a list, always listening, with bulk Actions (fixed); one primary on Scan that leads somewhere real (fixed); a clear control and a scan icon in the search field (fixed). The field is pinned at the top of a full page, so the results sit between the field and the keyboard, not under a half drawer.
- Keep items as strong: the room row is unchanged and reused; pen codes and live results are kept.
- Squint test: Find a sow, the field and the groups; Scan, the status pill, the newest sow and the footer button. These are the worker's first three questions (what do I type or hold? which sow came up? what can I do with them?).
- Cluttered, flat or bulky against the original: lighter than the old drawer (one field and two groups against a field, a count line, and a sample-tag preview), and the scan page shows at most the list and one footer.
- **Better because** it finds a sow in any unit, takes many tags in a row, and every control leads somewhere.
- Known gap: at 360 a Scan row whose context reads "Pen B1 · 1h ago · G.H" wraps to a second line beside the tick box (the design system's animal row; not restyled on the page).
