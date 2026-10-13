# find-pig: headers, critique

Scope: the headers of this feature's surfaces (the shared Headers change, the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13)).

## Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): every body, row and colour stays as it is; only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- Home's own header (farm, section chooser, Assistant door) is the app's home, not a page or sheet header: unchanged.

## Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · Pages (Your sections, Toolbox, Records, Environment, Maintenance, Assistant, a finding, a task page) used a page-built `page-head` with a subtitle (the farm, the unit, a description) and, on two, Back in the footer.
- **minor** · Drawers (Choose a unit, Report issue, Issue detail, Saved work, Find a pig, Scan) had a left-aligned title; Choose a unit repeated the section.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Page header | page-built `page-head` | SentriUI.pageHeader | **fix** |
| PREVIEW badge in the header | page-built | (prototype chrome, not product) | **cut** |

## Self-crit

The law and its boards fix the design (two headers, the line's three tests); there are no competing directions, so each screen is judged against its baseline and the Farrowing room. Rounds and the final look are below.
