# Header

The top of a surface: the **page header** on a page, the **sheet header** on a drawer. A header holds the surface's title, at most one quiet header line, and the few controls the law allows. It is the Headers law (`ux/design-system/README.md` → [Headers](../../README.md#headers-law-owner-2026-10-13)) as a part.

The title inside it is a [Heading](../Heading/README.md) (the page or sheet title). A header owns everything around that title: Back, the corners, the line, the hairline and the gap to the body. A block or a run of rows is named by a Section or Group heading, never by a header.

Built by [Sheet](../Sheet/README.md): `SentriUI.sheet({ variant: 'page', title, back, line })` draws the page header, and `SentriUI.sheet({ title, line, corner, cross })` draws the sheet header. `SentriUI.pageHeader({ title, back, line })` is the page header alone (TaskHeader draws it). `SentriUI.headerLine(line)` is the line alone. Types are in `index.d.ts`.

## Which header

| | **Page header** | **Sheet header** |
|---|---|---|
| Where | a surface that fills the screen: a task page, a log, a scan, ending a task | a drawer that leaves the page visible above it |
| Parts | Back (48px, top left) · title (left) · optional header line under the title | centred title · optional header line under it · optional corner actions · a 1px `line` hairline |
| Gap to the body | `space-section` (24px) from the last header line, owned by the header | `space-section` (24px) from the hairline, owned by the header |
| Back | top left; the footer has no Back | in the footer (the drawer convention) |

Which one depends on whether the surface covers the page, not on which feature it belongs to. A drawer that fills the screen is a page and takes the page header. There are no other headers. A new kind goes through the rules ledger first.

## Anatomy

- **Title**: the page title (22px, `page-title`) or the sheet title (20px, `sheet-title`); see [Heading](../Heading/README.md). It is one line at 360px in English and Chinese between the corners, with 12px clear on each side. That is about 20 English or 10 Chinese characters for a sheet title (20px), a little fewer for a page title (22px), which sits beside Back. Copy is written to fit; the title is never truncated, wrapped or shrunk.
- **Back** (page header): the bordered 48px icon button at the top left. It goes up one level.
- **Levels** (sheet header, a drawer with levels only; owner ruling B, 2026-10-16): the title names the current level, and the ✕ at the top left closes the whole drawer. There is no "‹ Parent" in the header: the footer's Back goes up one level, and at the first level it leaves.
- **Header line**: absent by default. On a **hub** only (the farrowing record drawer, a pen sheet, a task page), it holds either a **route** or one **fact**:
  - A route is the subject chip `#ID ›`, plus at most two identity facts that the task's `budget.md` names.
  - A fact is something like `Last record 08:41 · G.H`.

  An **action** launched from a hub carries no line, because the hub is one Back away. The line is one line at 360px, `muted`, with no full stops.
- **Corner actions** (sheet header):
  - **Clear** or **Reset** sits at the top right as quiet text. It is present only while there is something to clear, or something away from its defaults.
  - A **✕** sits at the top left, only in a drawer with levels, at every level. It closes the whole drawer, keeping the draft (owner ruling B, 2026-10-16; [board](../../evidence/2026-10-16-drawer-levels.png)). A drawer without levels has none.
  - Each is a 48px target, vertically centred on the header's text block (the title, plus its line when there is one).
- **Hairline** (sheet header): 1px `line` under the header. It belongs to the header.

Nothing else goes in a header: no counts, status, Save or asides. Status is the first thing in the body.

## Variants

- **Page header**: [variants/page.html](variants/page.html).
- **Sheet header**: [variants/sheet.html](variants/sheet.html).

## States

| State | Rendering |
|---|---|
| Default | the title (and Back on a page) |
| Pressed | Back and a corner action: `press` fill on the 48px target |
| Hub | the header line under the title: a route (chip + named facts) or one fact |
| Something to clear / reset | Clear or Reset at the top right. Absent at defaults |
| Levels: ✕ closes, Back goes up | a drawer with levels: the level as the title, the ✕ at the top left (closes the whole drawer), Clear at the top right when there is something to clear; the footer's Back goes up one level |
| Long title | does not exist: the copy is rewritten shorter in the feature's budget |
| Chinese | same layout and the same room (about 10 characters) |
| Disabled, loading, error, empty | none. A header does not wait or fail; status goes in the body |

## Checks

`scripts/check-headers.mjs` measures the law on every atlas screen and every component page:
- the 24px gap;
- what a header holds;
- corner alignment (±2px of the text block, 48px targets);
- title room and line wrap at 360, in English and Chinese.

The gate runs it on changed screens and changed component pages, base against candidate.

## Changelog

2026-10-16 (owner ruling B): a drawer with levels drops "‹ Parent" (Up). Its title names the level, a ✕ at the top left closes the whole drawer, and the footer's Back goes up one level. The sheet variant's "Up (a drawer with levels)" state is now "Levels: ✕ closes, Back goes up".

2026-10-15: split out of Heading and Sheet (owner: "split heading (this is titles) and headers (sheet and page)"). Heading keeps the titles. The page and sheet headers, and their law, are here.
