**Status: candidate.** Extracted from farrowing's dialog (`.farrowing-phone .dialog-backdrop`, `.dialog`: Correct born) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)). It is not approved.

# TaskDialog

**One question over a drawer**, rising from the bottom: title (optionally with a glyph), one description line, the answer, and the footer with Back + the primary. No grab, no ✕: Back is the way out.

**Anatomy** (`.tk-dialog-backdrop`, `data-ds="TaskDialog"`)
- **Backdrop:** the whole phone (z 8), `dialog-backdrop`; the dialog sits at its bottom.
- **Dialog** (`.tk-dialog`, `role="dialog"`): full width, `paper`, `radius-dialog` top corners, `shadow-dialog`, at most `100% − 24px`, a flex column.
- **Body** (`.tk-dialog-body`): padded `space-gutter-sheet` on top and sides; scrolls if it must.
  - **Title:** `sheet-title` 20px/500/1.3, −0.4px; a 16px glyph 7px before it.
  - **Description:** 10px under it, `description` 11px/1.7 `muted`.
- **Footer:** the [TaskSheet footer](../TaskSheet/README.md), inset to the body's edges: 15px above, a 1px `line` on top, `18px 0 space-footer-bottom` padding, no handle bar. Its bottom is the dialog's bottom.

**States**
- Default: over a drawer that is `inert` (and its scrim with it).

**Component contract**
- **Props:** `SentriTask.dialog({ title, icon, description, body, footer, label })`.
- **Events:** the footer's.
- **Slots:** `title` (text slot), `description` (text slot or parts), `body`, `footer` (HTML).
- **Port note:** a modal bottom sheet at content height with no drag handle.

**Don'ts**
- Don't ask two questions in one dialog. Don't open a dialog from a dialog.
- Don't pad the footer off the dialog's bottom edge.

**Strings**
- Host strings.
