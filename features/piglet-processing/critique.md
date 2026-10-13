# piglet-processing: headers, critique

Scope: the headers of this feature's surfaces (the shared Headers change, the Headers law (`ux/design-system/README.md#headers-law-owner-2026-10-13`, owner 2026-10-13)).

## Keep

- The sheet's anatomy (grab, body as the one scroller, the footer with Back and the primary on drawers): every body, row and colour stays as it is; only the header and the footer's Back/Clear move.
- The titles: they name the job (`Record dead`, `Edit record`, `Pen log`); they stay, and stay the heaviest thing in the header.
- The house reference's look (the Farrowing room): Back as a 48px bordered icon button, the 22px title, the last-record line in muted text with the time in ink.
- The pen list's last-record line: kept as the task page's header line.
- The pen sheet as the hub of a pen: it keeps the sow's identity, now as the chip.

## Problems

- **major** · Nothing in a header acts but Back and the subject chip (law): Clear, Reset, a Scanning pill, an End walk button or a Log link sat in a header.
- **major** · The default is no header line (law): almost every drawer and page carried a subtitle that repeated the subject, the pen, the unit, a count or a date, facts the hub one Back away already shows (P3: nothing the header says twice).
- **major** · Two headers and no others (law): drawers had a left-aligned title with no 24px gap owned by the header; pages had Back in the footer and a title with no Back beside it; a task page had a hand-built app bar (`room-appbar`, `task-header`, `page-head`).
- **minor** · Pages set their own top padding under the header (18px, 20px, 12px, 16px), so the gap to the body differed screen to screen.
- **major** · The pen list had no Back (law: every top page of a task has Back).
- **major** · The pen sheet's title was the sow's tag and its subtitle `B05 · parity 3 · 11 piglets · day 1`: counts and a day in a header, two lines at 360 in Chinese.
- **major** · Every action drawer repeated `A03 · day 4` or `A03 · 12 alive`; pages (Piglets, Give IDs, Move piglets, Pen log, End task) had Back in the footer and a subtitle.

## Parts

| Part | Drawn by today | The component whose job it is | Keep / fix / cut |
|---|---|---|---|
| Pen list header | TaskHeader without Back + TaskLatest in the scroller | TaskHeader with Back and its line | **fix** |
| Pen sheet header | Sheet head, tag as title, subtitle | Sheet header, `Piglet processing` + route line | **fix** |
| Page Back | footer Back | page header Back | **fix** |
| shell-ui `litterHeader` (hand-built `utility-header`) | page-built, no caller | (none needed) | **cut** |

## Self-crit

The law and its boards fix the design (two headers, the line's three tests); there are no competing directions, so each screen is judged against its baseline and the Farrowing room. Rounds and the final look are below.
