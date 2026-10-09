Sentri is a phone-first tool for commercial pig farms: what needs doing, where, to which animals, and what has already been recorded. It is used standing in a barn, often gloved, often offline, reading for two seconds at a time. Every rule below serves that reader.

The system has one palette (Astra, light only), two type families, one shared component layer (`SentriUI`) and one icon registry (`SentriIcons`). Every screen is these parts, configured — never a fork. An operation that fits no existing container is a design smell, not a reason for a new one.

## Content fundamentals

Sentri copy says what to do, where, and how much. It is operational, not friendly.

- **Sentence case** for titles, rows, buttons and headings: "Record a death", "Farrowing room 3". Uppercase is reserved for mono chips and section keys (`LAST 45M`, `SIGNS`, `CYCLE`).
- **Verbs on buttons, states in segments.** Buttons name the act and its count: "Record for 12 pigs", "Confirm & next", "Foster 3 · B4 → B6", "Final · 10 total". Segments name the animal's state, never an action: "Open / Mated", "Not in heat / In heat". "To check / Checked" is the one licensed exception.
- **Never "Submit", "Save" or "Complete".** Every action commits itself; rooms are never completed. The unit commit is "Check-in", not "Inspection".
- **The count leads the word, and only from 2:** "3 SIGNS", "6 mated", "11 born" — but "SIGNS", never "1 SIGNS". Units are always written: `182 kg`, `3.8 kg/head × 12`, `40.6°`, `backfat 15 mm`. Deltas read `11 → 8`.
- **Time: working judgments stay elapsed, records stay absolute.** Past events read elapsed ("Mated 21 days ago", "Signs · 10h ago"); scheduled ones read until ("Due in 5 days"). Open rows carry relative times only, never clock stamps. Done rows and records carry the stamp: `Jul 8 · 07:14 · G.H`. Durations always carry a unit: `45m`, `9h`, `3d`.
- **A forecast admits it is one.** A state the task asks about prints at full weight ("Due · today"); a prediction prints lighter with a word that says so ("Expected · in 5 days").
- **IDs are set in mono and written as the barn writes them:** ear tags `000254`, pens `A2`, semen batches `JY001`. People are initials on records (`G.H`), full name on a check-in stamp (`G. Hansen`).
- **Missing is not zero, and empty is absent.** An empty section does not render — no "None" heading. A picker with nothing chosen reads "Select"; a multi-picker reads "None"; an empty log reads "No activity recorded yet".
- **Avoid:** "Unchecked" (reads as a defect, not a queue), an ellipsis on a status word, emoji, exclamation marks, "please".

## Visual foundations

### Colour

The ground is a green-tinted off-white; text is one deep green-black; colour appears only when it means something.

- Put the app on `app-background`; put page panels on `paper`. Inside a drawer the drawer is `paper` and its panels are `inset` — context belongs to the container, not the panel (`data-st-context="page" | "drawer"`).
- Set all primary text in `ink` and all secondary text (descriptions, meta, fact labels, group headings, chevrons) in `muted`. `muted` holds 4.5:1 on `paper`, `app-background` and `well` only.
- **Every primary button is `ink` with a white label.** Green is never a button fill: `green` means done, recorded, synced, selected.
- Status words are coloured text with a 4px dot, never filled badges: `amber` due now / waiting to upload, `progress` in progress, `green` done, `muted` waiting. A pending block may sit on `pending-surface` with a `pending-border`.
- `red` is for destructive and ending acts only — "Delete photo", "End task" (filled, white label) and "End early" (`red-wash` fill, `red` border and label). Destructive controls never inherit the green treatment.
- Borders: `line` between surfaces, `rule` between rows inside a panel (never above the first row), `control-border` on fields and secondary buttons, `back-border` on Back.
- No gradients, textures, photography or illustration. The only translucency is `scrim` (with a 1.4px blur) behind a drawer and `dialog-backdrop` behind a dialog.

### Type

- **Plus Jakarta Sans** for everything a person reads as language, at 400, 500 and 600. Headings are 500, not bold: `page-title` 22px, `sheet-title` 20px, `section-title` 13px, `panel-title` 12px, `group-label` 11px in `muted`.
- **IBM Plex Mono** for everything a person reads off the barn: ear tags and pen codes (`identifier`), counts and measurements (`figure`, `figure-lg`, `hero-count`), badge numbers and overlines. Use tabular numerals for counts that tick.
- Body text in rows is 13px (`row-title`) over 11px (`description`); fields and choices are 14px. `meta` at 10px is the floor.
- Headings take slight negative tracking (−0.5px at 22px, −0.4px at 20px); everything at 13px and below tracks at 0.

### Space, size and layout

- Single column, 390px phone canvas. Gutters: `space-gutter` (18px) for headers and drawer footers, `space-gutter-sheet` (21px) for full-page bodies; at 370px and below every gutter and panel padding drops to `space-gutter-narrow` (12px).
- Panels pad `space-panel` (16px). Rows pad `space-row-y` × `space-row-x` (12 × 14) with a `row-min` of 68px. Sections sit `space-section` (24px) apart; action categories `space-action-section` (32px).
- **Touch:** nothing tappable is smaller than `tap-min` (48px). Footer buttons, Back and icon buttons are `control-height` (48px); fields are `field-height` (48px); chooser rows `choice-row-min` (56px).
- Footers pad `14px 18px 28px`; the bottom 28px leaves room for the 92×4px `handle` bar.

### Surfaces, borders, radii and elevation

- **Two presentations.** A *page* fills the canvas: square corners, a utility header with a divider, a sticky footer whose Back sits left at `back-width` (86px). A *drawer* rises from the bottom with `radius-sheet` top corners and `shadow-sheet`, at one of four heights: `drawer-compact-max` 42%, `drawer-short-max` 58%, `drawer-medium-max` 76%, `drawer-long-max` 85%.
- **The task skeleton (candidate, ADR 0003).** Every task is built on farrowing's anatomy, with only its information changed: [TaskPhone](components/TaskPhone/README.md) (the 390×844 frame on a wide screen, full-bleed on a phone), [TaskHeader](components/TaskHeader/README.md) with the last-record line, [TaskSummary](components/TaskSummary/README.md), [TaskLens](components/TaskLens/README.md), [TaskGroup](components/TaskGroup/README.md) of [TaskRow](components/TaskRow/README.md)s, [TaskDock](components/TaskDock/README.md), [TaskSheet](components/TaskSheet/README.md) (sized to its content; the footer always on its bottom edge), [TaskHold](components/TaskHold/README.md), [TaskTotals](components/TaskTotals/README.md), [TaskProgress](components/TaskProgress/README.md), [TaskStepper](components/TaskStepper/README.md), [TaskPhotos](components/TaskPhotos/README.md), [TaskChoice](components/TaskChoice/README.md), [TaskRadios](components/TaskRadios/README.md), [TaskWarning](components/TaskWarning/README.md), [TaskTable](components/TaskTable/README.md), [TaskMetrics](components/TaskMetrics/README.md), [TaskSection](components/TaskSection/README.md), [TaskReceipt](components/TaskReceipt/README.md), [TaskDay](components/TaskDay/README.md), [TaskPage](components/TaskPage/README.md) and [TaskDialog](components/TaskDialog/README.md). The exit in every footer is **Back**.
- **Panels are bordered, not shadowed:** 1px `line`, `radius-panel` (18px), no shadow. The one card with a shadow is the task context card (`shadow-card`).
- Radii: `radius-panel` 18 for panels, `radius-inset` 14 for insets, `radius-control` 12 for buttons, fields and icon buttons, `radius-segment` 10 for segment tracks and row icon tiles (8 for the segment's buttons), `radius-dialog` 22.
- No left-border accent stripes on cards. The one inset bar is the 3px `current-marker` on the row you are standing in.

### States

- **Press:** rows and options fill `press` (choosers `choice-press`); buttons darken (`brightness(.96)`) and move down 1px. Stepper keys scale to .96.
- **Disabled:** primary buttons go `disabled-fill` with `disabled-ink`. But prefer omission: blocked verbs are left out, not greyed, with one line saying why ("4 not available for a gilt ›"). Done rows differ by ✓, stamp and ✎ — never by grey.
- **The floor-gray (the one scoped exception to "no dim-as-disabled"; owner, 2026-08-30).** A field key with nothing to do — a stepper's − at its floor or + at its ceiling, a Numpad's ⌫ on an empty value, `.` after a point, digits when the value is full — fills `disabled-fill` with a `disabled-ink` glyph. It is `aria-disabled`, never `disabled`: the tap still reaches the host, which answers it in the field's reserved hint line (pointers such as `Found dead? Record dead` · `Wrong count? Edit` at a floor, a sentence at a ceiling, `Tag is 6 digits` on a full pad). Nothing else is ever greyed. Used by [Stepper](components/Stepper/README.md) and [Numpad](components/Numpad/README.md).
- **Waiting (candidate, ADR 0002).** A button that one visible step will make live stays present and quiet: `aria-disabled` with the `disabled-fill` face, focusable, its reason in one status line beside the bar ([Button](components/Button/README.md)). Prefer omission otherwise.
- **Focus:** a solid 3px `focus` ring, offset 2px (rows: −3px, inside the row). It holds 3.9:1 or better on every Sentri surface.
- **Current location:** `green-wash` background plus the `current-marker` inset bar (`aria-current="location"`).

### Motion

State changes in place instantly; position changes only when the hand is done.

- **0 ms — commit.** The write never waits for motion. Counts tick immediately (a 120ms digit swap at most).
- **0–200 ms — settle.** In bulk, the selection bar leaves first (`translateY(110%)`, 200ms `ease`). Committed rows flash one shared `green-wash`, fading over 1.1s `ease-out`.
- **Hold, then depart.** A row that crosses to the finished lens waits 800ms of idle (1200ms for a terminal exit like a death) — any touch in the list resets the timer — then collapses in 180ms `ease`, never staggered. Scrolling past departs it immediately.
- CSS only (`grid-template-rows`, `opacity`, `transform`, `background`); no JS animation loops. Under `prefers-reduced-motion: reduce`, drop transitions, the wash and the press transform.

## The laws

### The row

"Left is information, right is what happens there." Two lines, every row, one height across the product. Line 1 is the fact in sentence case; line 2 is lowercase mono tokens separated by `·` in a fixed order — time → counts → codes (`started 6h · parity 3`).

A chip is the reason this row needs you first — an escalated measurement (`LAST 45M`), a flagged observation (`SIGNS`) or a standing instruction (`+0.4 KG`, `NO FEED`). One chip per row at most; nothing is said twice; an empty slot stays empty. The rail on the right is empty when the bar acts, a verdict word + › when the tap acts, and ✎ when done.

### Segments (lenses)

First segment is the working pile, second the finished pile, All always last. Four states is the ceiling. Copy budget: 12 characters at three segments, 8 at four; when space runs out, inactive segments drop their counts first.

### The record sheet

Fields stack in capture order, never in columns. The bar holds at most two actions, primary right. Only these fields may enter a sheet: **Choice** (2–4 outcomes; a fifth makes it a picker), **Scale** (3–5 graded steps), **Stepper** (counting animals; + filled `ink` — [card](components/Stepper/README.md)), **Measure** (mono, unit always shown — [card](components/Measure/README.md)), **Checklist**, **Numpad** (typed input only: ear tags and weights, under a Measure or in a run — [card](components/Numpad/README.md)), **Picker**, **Multi-picker**, **Note** (optional unless a choice requires it; never the primary way to capture a fact) and **Photos** (up to 12, attached to the event — [card](components/Photos/README.md), candidate). A **Choice** of 2–3 short outcomes is ChoiceList's inline radio (candidate, ADR 0002). **Optional inputs are optional rows**, never chips or a label with a small "Optional": a full-width row of label, a muted "Optional" and a trailing icon action, below the required fields in capture order, one per line ([card](components/Field/README.md)). A dependent field appears inline beneath its trigger; if a reveal would push more than two fields, the event is a composite of summary rows.

### Containers

Drawer (about five fields, one primary), page form (Back, never a grab bar), conveyor (per-confirm commit, Skip advances without recording), roster, composite, session (re-entering resumes — nothing is draft; "Final" is the only end), pairing (both subjects named before anything moves; both deltas print, `11 → 8 · 9 → 12`).

### The verb sheet

Selection names the subject; the sheet holds the verbs — verbs only, no facts or counts. One tile size in a five-column grid; a verb that will not shorten to one word is a pill. Three strips — Health, Routine, Production; an empty strip is absent. Death is the last health verb and the only unfilled tile, outlined in `red`.

### The detail page

It reads; it never acts. The fact line puts words left and the trail (when · who · qualifier) right. Sections are keyed, and an empty section is absent. The tail is history, or the end-act. The page outlives its subject: a departed animal keeps its page with a terminal line in `red`.

## Iconography

- One registry, `SentriIcons` (`sentri-icons.js`): 52 single-path glyphs on a 24×24 grid, drawn as open strokes. `SentriIcons.icon(name)` returns the `<svg>`; the stylesheet supplies `fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round`.
- Stroke 1.6 at 14–18px (headings 16px, rows 18px, chevrons 15px); 1.8–2 for checks and choice trails at 16–20px. Icons take the colour of their text — `muted` beside secondary text, `row-icon-ink` in row tiles, `green` for a selected check.
- Every icon keeps its word. Glyphs are for recognition, never meaning on their own: verb tiles, rows and buttons always carry a label; icon-only buttons carry an `aria-label`.
- Never hand-draw an inline SVG in a screen: add the path to the registry so every app renders the same glyph. No emoji; the only glyph characters in copy are `·` (separator), `→` (movement and deltas), `›` (more) and `×` (multiples).
- The `Icons` asset group holds each glyph as a standalone SVG drawn in `ink` at stroke 1.6.
- Field keys are the one heavier exception: the Stepper's `minus` / `plus` draw at stroke 2.2 (`glyph-key` 14px, `glyph-key-hero` 18px) and the Numpad's `backspace` at 1.8 (`glyph-pad` 20px), so a key reads at arm's length in glare. `backspace` (a left-pointing key cap with an ×) is the registry's 53rd glyph, candidate with the field cards (ADR 0001); it means "delete the last typed character" and nothing else.

## The wordmark

There is no logo file. The wordmark is the word **sentri** in lowercase Plus Jakarta Sans at 800, tracked tight (−1.8px at 29px), followed by a `green` bullet: sentri•. Set it in type; never draw a mark.
