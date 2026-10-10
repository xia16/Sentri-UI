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
| **drawer** | One task step over the page: a form of about five fields, a count, a picker, a short read. Sized to its content on the bottom edge, a handle, no ✕. | A long record (page). A yes/no (dialog). A drawer on a drawer. |
| **page** | A full sub-page: a record, a log, an overview, a form of more than five fields. The whole canvas; Back in the footer. | One question (drawer or dialog). |
| **dialog** | One small decision over a sheet or page: confirm, correct one value. Rises from the bottom edge, where the thumb is. | A form (drawer). A message with no choice (Banner). |

Drawer sizes cap the height: `compact` 42%, `short` 58%, `medium` 76% (default), `long` 85%. The drawer is as tall as its content up to the cap (`sizing: 'content'`). `sizing: 'full'` holds it at the cap for content that grows as the worker taps (a count, a draft); the body then takes the spare height and the footer still sits on the bottom edge. A drawer is never taller than its content otherwise: no dead space, and the footer never floats.

## Anatomy

Parts, in order. Optional parts are marked.

1. **Scrim** (drawer): the dimmed page; a tap dismisses and keeps the draft.
2. **Grab** (drawer): the 42×4 bar. It is decoration; every gesture has a visible control.
3. **Head** (`utility-header`): **up** (optional, a drawer with levels only: "‹ Parent name", `up: { label, action, value }`), **title** (the current level), **subtitle** (optional, one line; parts may carry a tone), **aside** (optional: the text actions Clear or Reset). No ✕.
4. **Above** (optional): a bar that does not scroll (a filter bar).
5. **Body** (`sheet-body`): the one scroller.
6. **Status** (`sheet-status`, optional): a line above the footer only when it carries its own text action. A waiting primary's reason is never drawn: it is the primary's screen-reader description only.
7. **Footer** (`sheet-footer`): Back, then the primary or a hold, with the handle bar under them.

A **page** has a status bar in place of the grab and scrim, and its head, body and footer sit on the page gutter (18px). A **dialog** has a title (with an optional glyph), one description line, the body, and the footer inset to the body's edges; it has no grab and no ✕.

## The drawer convention (law)

This is the owner's rule for every drawer and page (2026-10-10); [the design system README](../../README.md) carries the same text.

- **Back** sits in the footer of every drawer and page. It means leave and return to where you came from, keeping the draft. Alone in a footer it fills the bar.
- **‹ Parent name** (`up`) sits in the header, only in a drawer with levels. It goes up one level and is never labelled "Back". The header back label names the parent; the title names the current level. **No breadcrumbs** in a drawer.
- **The commit** ("Done · 2", "Save · 2 pigs") sits in the footer on the right. It applies and closes. A single pick commits by itself, so a single-choice sheet has Back alone.
- **No ✕ on drawers** (nor on pages and dialogs). Swiping down and tapping the scrim do what Back does. `close` is accepted for old callers and ignored.
- **Reset** restores defaults (a filter). **Clear** empties what was entered or ticked. Both are head text actions (`aside`), present only when there is something to reset or clear, each with one meaning in `ux/laws/strings.json`.
- The word in the footer is **Back**, never Close or Cancel. Discarding a draft is its own act (Clear, Reset), never what Back does, so a sheet never loses typed work silently and needs no "discard changes?" question.
- **An empty selection closes.** A review of ticked subjects closes, and selection mode ends, when the last one is unticked; no empty selection sheet is ever shown.

## Footer

- **At most two controls, the primary on the right.** A third action moves to the aside (Reset on a filter drawer) or leaves the sheet.
- The primary is a [Button](../Button/README.md) (`primary` ink; `danger` for destructive verbs) or a hold-to-commit for an irreversible act.
- **No reason line.** A waiting primary or hold stands alone: `status.text` is never drawn above it; it stays in the markup visually hidden, as the primary's `aria-describedby` (the hold's `statusId`). A Button `reason` placed in `content` is hoisted and hidden the same way. A status with an `action` (one text action at its end, `42 is right`) is not a reason and is drawn.
- Geometry: padded 14 / 21 / 28 (`space-row-x`, `space-gutter-sheet`, `space-footer-bottom`), 14px apart. The buttons end 28px above the sheet's bottom; the 4px handle bar sits in the 8px below that, so a button never touches it.

## States

| State | How it shows |
|---|---|
| Default | Over its scrim (drawer), on the canvas (page) or over a dimmed phone (dialog). |
| Pressed | Up takes `press`; Back takes `back-press`; the primary darkens and moves 1px (the Button's own). The sheet itself has none. |
| Selected / active | Not applicable to a sheet. |
| Disabled | The primary takes the waiting face (aria-disabled, still focusable) and stands alone. Its reason (`Say how many died`) is its screen-reader description, not a drawn line. |
| Error | The field says what is wrong and how to fix it (`48 kg is over the scale limit · check the number`), next to the value; the primary waits. |
| Loading | Not drawn. A hold that was sent shows its pending phase; the sheet stays. |
| Empty | The body holds the empty line of what it contains (`No activity recorded yet`). A selection review is never empty: it closes instead. |
| Long / Chinese | Titles wrap (`overflow-wrap: anywhere`), the subtitle wraps; Back is 86px wide and the primary takes the rest. A primary label longer than about 20 characters (10 Chinese) should be shortened. |

Every state is drawn in `variants/drawer.html`, `variants/page.html` and `variants/dialog.html`.

## Behaviour

- **Never a drawer on a drawer.** A drawer that must lead to a picker or a second step replaces its own content (Back returns to the form; ‹ Parent goes up a level) or becomes a page. The deepest stack is a page, then a drawer or a dialog over it. The layer model: z = base + 10 × layer (scrim 2, drawer 3, page 5, dialog 8); an overlay placed after a sheet in the phone rises a layer on its own, or set `layer: n`.
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
- Every tap target is at least 48px (`tap-min`): up, Back, the primary, the aside actions.
- Screen reader: the dialog is modal, so the background is not read; Back is the way out (and the scrim, named Dismiss).
- No action depends on a gesture: dragging the grab down does what Back does, and so does the scrim; Back is always visible.
- State is never colour alone: a waiting primary carries its reason as its description; an error line says what is wrong.

## Do / Don't

- Do put one idea in a sheet and end it with one primary.
- Do give a drawer a size cap that matches its content, and let it shrink to fit.
- Do put Reset or Clear in the aside, and keep the footer to Back and the primary.
- Don't put a second drawer on a drawer, or a dialog on a dialog.
- Don't say Close or Cancel in the footer; it is Back.
- Don't fix a drawer's height when the content does not grow: the dead space puts the footer far from the thumb.
- Don't put a ✕ in any head, or a breadcrumb in a drawer: Back is in the footer; ‹ Parent (a drawer with levels only) names the level above.
- Don't draw a reason line above a waiting primary: the disabled button stands alone.

## Bulk action page

The page for one act on several subjects (Record health · 2 pigs). One composition, every use:

1. **Subjects:** the ticked pigs as one Panel of select rows (checkbox left, ID and pen · stage, a per-row state only where rows differ: `Ready to save`, `Already recorded · unchanged`, or a dose or reading field). A column key appears only when the column has values (`Dose · mL`, `Current → New · kg`). The header subtitle carries the count once.
2. **Details:** the fields for the act, anchored on the bottom edge above the footer: the footer's `paper` with one `line` rule above, no card, no shadow, fields straight on it. Its heading folds it away (`aria-expanded`).
3. **Footer:** Back + `Save · n pigs` (`Save` alone while nothing would change; no reason line).

The sheet body is the only scroller: a short list leaves empty page between the list and the details; a long one scrolls as one column, and the details end above the footer. Never a card in a card, never a floating details card.

Used by Inspection: Record health, Edit conditions, Care instructions, Resolve conditions, Record weights, Record temperatures, Record backfat, Record treatment, Record vaccination, Add a note and Body condition (`bulkActionPage`), and Adjust feed (`feedEditorPage`), all through `bulkListOverlay`. With one subject the same act is a drawer of fields (no list, no card).

## Native

| Sentri | iOS | Android |
|---|---|---|
| drawer | `.sheet` with detents sized to content (`presentationDetents([.height(h), .large])`), grabber visible | `ModalBottomSheet` (Material 3) with drag handle, `skipPartiallyExpanded` when it fits |
| drawer with levels (‹ Parent) | `NavigationStack` inside the sheet; the system back button names the parent | `NavHost` inside the sheet; a top bar with an up arrow and the parent's name above the title |
| page | a pushed `NavigationStack` view; Back in a bottom toolbar | a full-screen destination; Back in a bottom app bar |
| dialog | `confirmationDialog` / `alert` | `AlertDialog` |
| scrim tap, swipe down = Back | default sheet dismissal, the draft kept in the view model | `onDismissRequest` = Back, the draft kept |
| commit (Done · n, Save · n) | bottom toolbar primary button | bottom app bar filled button |
| bulk action page | `List` in `EditMode` selection plus a `safeAreaInset(edge: .bottom)` details block above the toolbar | `LazyColumn` of checkbox rows plus a bottom details section above the bottom app bar |

## Related

[Button](../Button/README.md) (footer actions, the waiting face, hold) · [IconButton](../IconButton/README.md) · [Heading](../Heading/README.md) · [Panel](../Panel/README.md) (panels inside a drawer are `inset`, on a page `paper`) · [Banner](../Banner/README.md) · [Status](../Status/README.md) · [CategoryFooter](../CategoryFooter/README.md) (a footer with section tabs, built on Back).

## Tokens used

`paper` · `app-background` · `ink` · `muted` · `line` · `scrim` · `dialog-backdrop` · `handle` · `back-border` · `back-press` · `press` · `radius-sheet` · `radius-dialog` · `radius-control` · `radius-segment` · `shadow-sheet` · `shadow-dialog` · `blur-scrim` · `grab-height` · `grab-width` · `handle-width` · `tap-min` · `control-height` · `back-width` · `space-gutter` · `space-gutter-sheet` · `space-row-x` · `space-footer-bottom` · `drawer-compact-max` / `short` / `medium` / `long` · `sheet-in` · `sheet-out` · `fade` · `ease-arrive` · `type-sheet-title-size` · `type-page-title-size` · `type-description-size` · `tracking-sheet` · `tracking-page`.

## Changelog

2026-10-10 (multi-choice family): the drawer convention is the law; no ✕ on any sheet; `up` (‹ Parent) replaces the head lead for levels; the footer reason line is gone; the bulk action page is one composition; Native mapping added.
