**Status: candidate.** Extracted from farrowing's drawers (`.scrim`, `.sheet[data-st-context="drawer"]`, `.grab`, `.utility-header`, `.sheet-body`, `.sheet-footer`, `.surface-back`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), with the floating-footer bug fixed. It is not approved.

# TaskSheet (the drawer, its footer and Back)

Every drawer in a task: **grab, title, subtitle, ✕, divider, scrolling body, footer pinned to the drawer's bottom with Back + the primary.** The drawer is as tall as its content, up to its size's max. It is never taller than its content: no dead space, and the footer never floats.

**Anatomy**
- **Scrim** (`.tk-scrim`, a button, `data-ds="TaskSheet"`): from under the status bar to the bottom, `scrim` with a 1.4px blur. A tap dismisses (the host keeps any draft).
- **Drawer** (`.tk-sheet`, `role="dialog"`, `data-st-context="drawer"`): bottom 0, full width, `paper`, `radius-sheet` top corners, `shadow-sheet`, a flex column, clipped.
  - **Height:** as tall as its content. `data-size` sets the max: `compact` 42%, `short` 58%, `medium` 76%, `long` 85% (default `calc(100% − 80px)`).
  - `data-height="full"` holds the drawer at its max, for a sheet whose content grows as the worker taps (a count, a draft of deaths): the body takes the spare height and scrolls. The footer still sits on the bottom edge.
- **Grab** (`.tk-grab`): `grab-height` (24px); the 42×4 bar 10px from the top, `back-border`, radius 3.
- **Head** (`.tk-sheet-head`): padded `5px space-gutter-sheet 17px`, a 1px `line` divider under it, items at the top, 10px gap.
  - **Title:** `sheet-title` 20px/500/1.3, −0.4px, `ink`.
  - **Subtitle:** 6px under it, `description` 11px/1.6 `muted` (`000418 · B1 · Parity 3`). Parts may carry colour (`1 unsaved` green).
  - **✕** (`.tk-sheet-close`): `tap-min` square, `radius-segment`, transparent, the close glyph at 20px. `aside` replaces it with a text action (`Clear`) while a draft exists.
- **Body** (`.tk-sheet-body`): padded `18px space-gutter-sheet space-panel`, scrolls (`overscroll-behavior: contain`).
- **Footer** (`.tk-footer`, `data-ds="TaskFooter"`): always the drawer's last child. `paper`, 1px `line` on top, padded `space-row-x space-gutter-sheet space-footer-bottom` (14 / 21 / 28), 14px gap, the 92×4 `handle` bar 8px from the bottom.
  - **Back** (`.tk-back`): `back-width` × `control-height` (86 × 48), `paper`, 1px `back-border`, `radius-control`, a 16px chevron-left 4px before `Back` (14px/500). Alone in the footer it fills it in the primary's face (`ink`, 600).
  - **Primary:** a [Button](../Button/README.md) (`.button.primary`), flex 1, 48px, `radius-control`, 14px/500 — or a [hold](../TaskHold/README.md).

**One left edge.** Head, body and footer all sit at `space-gutter-sheet` (21px). At 370px and below they all drop to `space-gutter-narrow`.

**States**
- Default: over its scrim, the screen under it `inert`.
- Pressed, disabled, focus: the buttons' own. The sheet takes no focus ring.
- Error, loading: not drawn. Empty: the body holds the empty line of what it contains.

**Component contract**
- **Layers (one model for every overlay):** z = base + 10 × layer, with the bases scrim 2, sheet 3, page 5, dialog 8. Layer 0 is over the task screen. Each [TaskPage](../TaskPage/README.md) or TaskSheet placed *before* an overlay in the phone raises it one layer by itself (up to 3), so a sheet, page or [dialog](../TaskDialog/README.md) opened over a sheet or a page, in DOM order, always stacks above it. `layer: n` on `drawer`, `sheet`, `scrim`, `page` and `dialog` sets it explicitly (`data-layer`). The host makes what is under the top overlay `inert` (`page({ inert })`, `sheet({ inert })`).
- **Status slot:** `footer({ …, status: { text, str, args, id, tone, visible, action } })`. **Visually hidden by default** (the design system's `.st-visually-hidden`): farrowing draws no line above a footer. It stays `role=status` / `aria-live` and is still the primary's `aria-describedby` and the hold's `statusId`, so the reason and the hold's progress are read. `visible: true` shows it (a page opts in, e.g. after a tap on the waiting primary). A line with an `action` is shown by default (its act must be reachable) unless `visible: false`; a hidden line never draws its action. Visible, it draws one line (`.tk-footer-status`, `role=status`, 11px/500 `muted`, `amber` or `red` by tone) directly above the footer: the reason a waiting primary waits (wired as its `aria-describedby`) or a hold's progress line (wired as its `statusId`). It sits on the footer's top border; the footer stays the surface's last child. `status.action: { label, action, value }` adds **one text action** at the line's end (`9 is right`); the line then becomes a row, the action right.
- **`subtitleTone`** (`'amber' | 'red' | 'green'`) colours the whole subtitle line.
- **Narrow phones** (370px and below) keep farrowing's gutters: 21px in a drawer (18 on a page); only the footer's gap narrows to 10px, as farrowing's. There is no 12px override (parity review 16, ruling).
- **Props:** `SentriTask.drawer({ …sheet, scrim })` = `scrim({ action, label })` + `sheet({ title, subtitle, close: { action, value, label } | false, aside, body, footer, size, height: 'content' | 'full', label, view })`. `SentriTask.footer({ back: { action, value, label } | false, primary: { label, action, value, register, waiting, describedby } | html, hold })`; `SentriTask.back({ action, value, label })`.
- **Events:** the scrim and ✕ emit `data-action` (`dismiss` by default); Back emits `back`; the primary its own.
- **Slots:** `title` (text slot), `subtitle` (text slot or parts), `body` (HTML), `aside` (HTML), `footer` (HTML).
- **Ids:** `view` is written as `data-view` for the host.
- **Port note:** a bottom sheet with content-driven height (detents: content, or the size's max for `full`); the footer is a sticky bottom bar inside the sheet, never absolutely positioned.

**Don'ts**
- **Don't say Close.** The footer's exit is **Back** (it keeps the draft). The ✕ in the head is the only other exit.
- Don't set a fixed height on a drawer whose content doesn't grow. Use `data-height="full"` only when taps add content, and never leave the footer anywhere but the bottom edge.
- Don't put the title under an animal's face or anything else from the screen behind: the head is the drawer's.
- Don't put more than two actions in the footer. The primary is on the right.

**Strings**
- `act.back` (Back), `act.close` (the ✕'s aria-label), `tk.sheet.dismiss` (the scrim's aria-label).
