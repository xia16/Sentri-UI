# Sheet

**Classification: component** (used by every feature). It has three variants: **drawer**, **page** and **dialog**. It replaces TaskSheet, TaskPage and TaskDialog, which are retired.

A sheet is the one surface presented over a task: it holds a step the worker finishes and then leaves. Use **Banner** for a message that needs no answer, **Status** for a quiet line, and a screen of the task (not a sheet) for a destination the worker returns to often.

`SentriUI.sheet({ variant, title, subtitle, body, footer, … })` returns the markup; `SentriUI.sheetFooter({ back, primary, hold, status })` builds the footer; `SentriUI.backButton()` and `SentriUI.scrim()` are the parts a host may place itself. Types are in `index.d.ts`.

## When to use / when not

**Use a sheet when**
- the worker records or reads one thing and returns to the list under it (a death, a weight, a filter, a pen log);
- the step has an end: a primary that commits, and Back that does not.

**Do not use a sheet when**
- the information is a destination of its own, opened often: make it a screen of the task;
- there is no choice to make: use Banner (a message) or Status (a line);
- you would stack a second drawer on the first: replace the first drawer's content, or open a dialog for the one question.

## Variants

| Variant | Use for | Not for |
|---|---|---|
| **drawer** | One task step over the page: a form of about five fields, a count, a picker, a short read. Sized to its content, a handle, a ✕. | A long record (page). A yes/no (dialog). A drawer on a drawer. |
| **page** | A full sub-page: a record, a log, an overview, a form of more than five fields. The whole canvas; Back in the footer. | One question (drawer or dialog). |
| **dialog** | One small decision over a sheet or page: confirm, correct one value. Rises from the bottom edge, where the thumb is. | A form (drawer). A message with no choice (Banner). |

Drawer sizes cap the height: `compact` 42%, `short` 58%, `medium` 76% (default), `long` 85%. The drawer is as tall as its content up to the cap (`sizing: 'content'`). `sizing: 'full'` holds it at the cap for content that grows as the worker taps (a count, a draft); the body then takes the spare height and the footer still sits on the bottom edge. A drawer is never taller than its content otherwise: no dead space, and the footer never floats.

## Anatomy

Parts, in order. Optional parts are marked.

1. **Scrim** (drawer): the dimmed page; a tap dismisses and keeps the draft.
2. **Grab** (drawer): the 42×4 bar. It is decoration; every gesture has a visible control.
3. **Head** (`utility-header`): **lead** (optional: an up-one-level control for a drawer that drills into categories), **title**, **subtitle** (optional, one line; parts may carry a tone), **aside** (optional: text actions such as Clear or Reset), **close ✕** (drawer only).
4. **Above** (optional): a bar that does not scroll (a filter bar).
5. **Body** (`sheet-body`): the one scroller.
6. **Status** (`sheet-status`, optional): one line above the footer.
7. **Footer** (`sheet-footer`): Back, then the primary or a hold, with the handle bar under them.

A **page** has a status bar in place of the grab and scrim, no ✕, and its head, body and footer sit on the page gutter (18px). A **dialog** has a title (with an optional glyph), one description line, the body, and the footer inset to the body's edges; it has no grab and no ✕.

## One exit rule: ✕ and Back

- **Back is the footer's exit, on every variant.** It returns to what is under the sheet and keeps what the worker typed. Alone in a footer it fills the bar and turns `ink`.
- **A drawer also carries the ✕** in its head (a second way out for a worker who looks up, not down). A page has no ✕ (it has no scrim to tap), and a dialog has no ✕ (Back is its Cancel).
- **An aside never replaces the ✕.** Text actions such as Clear sit to its left.
- The word is **Back**, never Close or Cancel (the ✕'s accessible name is the one place "Close" appears).
- Discarding a draft is its own act (Clear, Reset), never what Back or ✕ do. So a sheet never loses typed work silently and needs no "discard changes?" question.

## Footer

- **At most two controls, the primary on the right.** A third action moves to the aside (Reset on a filter drawer) or leaves the sheet.
- The primary is a [Button](../Button/README.md) (`primary` ink; `danger` for destructive verbs) or a hold-to-commit for an irreversible act.
- **Why the primary waits:** when the primary or hold is `waiting`, give `status.text` and the line is drawn above the footer (11px, `muted`; `amber` or `red` by tone) and wired as the primary's `aria-describedby` (the hold's `statusId`). Without `waiting` the status stays read-only (still `role="status"`). A status with an `action` (one text action at its end, `42 is right`) is always drawn.
- Geometry: padded 14 / 21 / 28 (`space-row-x`, `space-gutter-sheet`, `space-footer-bottom`), 14px apart. The buttons end 28px above the sheet's bottom; the 4px handle bar sits in the 8px below that, so a button never touches it.

## States

| State | How it shows |
|---|---|
| Default | Over its scrim (drawer), on the canvas (page) or over a dimmed phone (dialog). |
| Pressed | The ✕ takes `press`; Back takes `back-press`; the primary darkens and moves 1px (the Button's own). The sheet itself has none. |
| Selected / active | Not applicable to a sheet. |
| Disabled | The primary takes the waiting face (aria-disabled, still focusable), and the status line states the reason: a verb phrase naming what is missing (`Say how many died`, `Pick a pen first`). Never a bare grey button. |
| Error | A `red` status line says what is wrong and how to fix it (`48 kg is over the scale limit · check the number`); the primary waits. |
| Loading | Not drawn. A hold that was sent shows its pending phase; the sheet stays. |
| Empty | The body holds the empty line of what it contains (`Nothing selected yet. Tap a pig in the list to add it.`). |
| Long / Chinese | Titles wrap (`overflow-wrap: anywhere`), the subtitle wraps; Back is 86px wide and the primary takes the rest. A primary label longer than about 20 characters (10 Chinese) should be shortened. |

Every state is drawn in `variants/drawer.html`, `variants/page.html` and `variants/dialog.html`.

## Behaviour

- **Never a drawer on a drawer.** A drawer that must lead to a picker or a second step replaces its own content (the lead control returns up one level) or becomes a page. The deepest stack is a page, then a drawer or a dialog over it. The layer model: z = base + 10 × layer (scrim 2, drawer 3, page 5, dialog 8); an overlay placed after a sheet in the phone rises a layer on its own, or set `layer: n`.
- **Re-entering a session resumes it.** Opening the same record again shows the draft; it never opens a fresh sheet on top.
- **The page behind is inert** while a sheet is open (`inert` on the screen, or `inert: true` on a page under a drawer).
- **The screen reader's focus** moves to the sheet when it opens and returns to the control that opened it when it closes.
- **Motion:** a drawer rises (`sheet-in`, 240ms), a page slides in from the side, a scrim or dialog backdrop fades (`fade`). The host sets `data-enter` on the render that opens a surface and `data-leave` before it removes it. Reduced motion turns it off.
- **A sheet is sized by its nearest positioned ancestor.** Give the phone root `position: relative; height: 100dvh; overflow: hidden`. Without it a page fills a far ancestor and percent heights collapse.

## Content rules

- **Title:** a noun or verb phrase, sentence case, up to 28 characters in English (about 14 Chinese). It names the step (`Record a death`), not the screen under it.
- **Subtitle:** one line of context in the form `place · amount · day` (`B4 · 11 alive`); `muted`; no full stops.
- **Primary label:** a verb with its count and place (`Record 12 piglets`, `Move 3 to B6`), not Save, Submit or Done (see Button).
- **Status line:** a short instruction, no colon, no full stop.
- Chinese strings are shorter than the English; nothing is clipped, titles wrap to two lines.

## Accessibility

- A drawer and a dialog are `role="dialog"` with `aria-modal="true"` and an accessible name (the title). A page is `role="region"` with the title as its name. Each takes `tabindex="-1"` for focus hand-off.
- Every tap target is at least 48px (`tap-min`): ✕, Back, the primary, the aside actions.
- Screen reader: the dialog is modal, so the background is not read; ✕ and Back are the ways out.
- No action depends on a gesture: dragging the grab dismisses, and so do the scrim, ✕ and Back.
- State is never colour alone: a waiting primary has a status line with words; an error line says what is wrong.

## Do / Don't

- Do put one idea in a sheet and end it with one primary.
- Do give a drawer a size cap that matches its content, and let it shrink to fit.
- Do put Reset or Clear in the aside, and keep the footer to Back and the primary.
- Don't put a second drawer on a drawer, or a dialog on a dialog.
- Don't say Close or Cancel in the footer; it is Back.
- Don't fix a drawer's height when the content does not grow: the dead space puts the footer far from the thumb.
- Don't put a ✕ or back arrow in a page head: the page's Back is in the footer.
- Don't hide why a primary waits.

## Related

[Button](../Button/README.md) (footer actions, the waiting face, hold) · [IconButton](../IconButton/README.md) · [Heading](../Heading/README.md) · [Panel](../Panel/README.md) (panels inside a drawer are `inset`, on a page `paper`) · [Banner](../Banner/README.md) · [Status](../Status/README.md) · [CategoryFooter](../CategoryFooter/README.md) (a footer with section tabs, built on Back).

## Tokens used

`paper` · `app-background` · `ink` · `muted` · `line` · `scrim` · `dialog-backdrop` · `handle` · `back-border` · `back-press` · `press` · `radius-sheet` · `radius-dialog` · `radius-control` · `radius-segment` · `shadow-sheet` · `shadow-dialog` · `blur-scrim` · `grab-height` · `grab-width` · `handle-width` · `tap-min` · `control-height` · `back-width` · `space-gutter` · `space-gutter-sheet` · `space-row-x` · `space-footer-bottom` · `drawer-compact-max` / `short` / `medium` / `long` · `sheet-in` · `sheet-out` · `fade` · `ease-arrive` · `type-sheet-title-size` · `type-page-title-size` · `type-description-size` · `tracking-sheet` · `tracking-page`.
