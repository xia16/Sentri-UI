**Status: candidate.** Extracted from farrowing's full pages (`.sheet[data-presentation="page"]`: Farrowing log, Task overview, End task, Pen) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskPage (the record page)

A full page over the task: **status bar, a page head (title + one description line), a scrolling body, the footer with Back**. For a record (the log), an overview, an end review, a receipt, a pen.

**Anatomy** (`.tk-page`, `data-ds="TaskPage"`, `role="region"`)
- Absolute over the whole phone (z 5), `app-background`, a flex column; its own [status bar](../TaskPhone/README.md).
- **Head** (`.tk-page-head`): padded `8px space-gutter 18px`, a 1px `line` under it.
  - **Aside** (optional, `aside`): text actions at the right end of the title line (`Clear`, `Tick all owed`), as a sheet's aside; the description runs the full width under it.
  - **Title:** `page-title` 22px/500/1.3, −0.5px, `ink`.
  - **Description:** 6px under it, `description` 11px/1.5 `muted`. Parts may carry colour.
- **Body** (`.tk-page-body`): flex 1, scrolls, padded `20px space-gutter space-section`. Panels on it are `paper`.
- **Footer:** the [TaskSheet footer](../TaskSheet/README.md) at `space-gutter` sides: Back alone (filled, as farrowing's log), or Back + the primary / a hold (End task).

**One left edge.** Head, body and footer sit at `space-gutter` (18px), the same edge as the room's header.

**States**
- Default only. The page takes no focus ring (`tabindex="-1"` for focus hand-off).

**Component contract**
- **Props:** `SentriTask.page({ title, description, body, footer, label, bar = true, aside, inert })`. `footer` defaults to Back alone. `inert: true` while a drawer or dialog is over the page.
- **Over a page:** a [drawer](../TaskSheet/README.md) or dialog placed after the page in the phone rises above it (the layer model in TaskSheet); `layer: n` sets a page's layer explicitly.
- **Status slot:** the footer's `status` (TaskSheet) works on a page too, at the page's gutter.
- **A list on a page:** `SentriTask.list` in the body drops its own gutter (the body has it), and its headers do not stick (no lens above them).
- **Events:** the footer's.
- **Slots:** `title` (text slot), `description` (text slot or parts), `body`, `footer` (HTML).
- **Port note:** a pushed screen with a bottom action bar; no navigation bar back button (Back is in the footer).

**Don'ts**
- Don't put a back arrow or an ✕ in the page head. Back is in the footer.
- Don't say Close on a page.

**Strings**
- Host strings; Back is `act.back`.
