# One implementation per component

Step 1 of the component pass (branch `design/component-pass`). This file records what existed twice, what was done about it, and what is left. The design system in `ux/design-system/` is now the only implementation; every built screen loads `tokens.css` + `components/bundle.css` + `components/bundle.js` (namespace `SentriUI`, icons in `SentriIcons`).

## Before: two layers

| Layer | CSS | JS | Loaded by |
|---|---|---|---|
| Old (`ux/system/`) | `sentri-visual-foundation.css`, `sentri-components.css`, `astra-surfaces.css`, plus the `farrowing-astra-concept.css` base | `sentri-components.js`, `sentri-icons.js` | Home, Farrowing, Inspection, and two study pages (`sentri-components-study.html`, `task-cards-astra-prototype.html`) |
| Design system (`ux/design-system/`) | `tokens.css`, `components/bundle.css`, `task-skeleton.css` | `components/bundle.js`, `task-skeleton.js` | Piglet processing |

`bundle.js` and `bundle.css` were built *from* the old layer ("verbatim", then extended), so most of the old code existed twice, byte for byte or nearly.

## Inventory: JS (`sentri-components.js` vs `bundle.js`)

All 18 functions of the old file exist in the bundle. A differential run of 34 calls (default and option-heavy arguments, every function) gave identical HTML once the bundle's extra `data-ds="<Card>"` attribute is removed.

| Function | Status | How the bundle differs |
|---|---|---|
| `heading` | diverged (superset) | `data-ds`; `strs`/`args` string-id twins |
| `panel` | diverged (superset) | `data-ds`, `ds` option |
| `facts` | diverged (superset) | `data-ds`; `strs` per item |
| `rowGroup` | diverged (superset) | `data-ds`; `strs` for the title |
| `row` | diverged (superset) | adds `code`, `chip`, `trail`, typed `trailing`, `wrap`, `tight`, `mono`, token-list title/description, `id`; no change without them |
| `log` | diverged (superset) | `data-ds`; `strs` per entry; group description |
| `categoryFooter` | diverged (superset) | `data-ds`; `strs` for Back and each tab |
| `field` | diverged (superset) | `data-ds` option |
| `pickerField` | diverged (superset) | `strs` for label, value, placeholder |
| `chooserList` | diverged (superset) | `data-ds` |
| `pickerOptions` | diverged (superset) | per-option and per-group `strs` |
| `choiceRow` | diverged (superset) | adds `mode: 'radio'`, `mono`, `tabindex`, `strs` |
| `choiceGroup` | diverged (superset) | adds `radio`, `aside`, `id`, `strs` |
| `choiceSearch`, `choiceEmpty` | diverged (superset) | `data-ds`; `choiceEmpty` takes `strs` |
| `segment` | diverged (superset) | per-option `strs` |
| `iconButton` | diverged (superset) | `strs` for the badge |
| `optionalRow` | same | `data-ds="OptionalRow"` only; the document click handler for inline rows is the same in both |
| icon registry (`sentri-icons.js`) | same | 52 glyphs identical; the bundle adds `backspace` |

Only in the bundle (37): `stepper`, `measure`, `numpad` and its helpers (`numpadInput`, `numpadScan`, `numpadCommit`, `numpadKey`, `numpadScanner`), `rowSelect`, `rowAction`, `rowSelectChange`, `status`, `statusLine`, `statusText`, `announce`, `liveFill`, `banner`, `photos`, `button`, `buttonReason`, `guard`, `handFocus`, `holdButton`, `holdStep`, `holdBind`, `HOLD`, `choiceRadios`, `radioNext`, `radioBind`. Only in the old file: nothing.

Decision: the bundle is the implementation. The old file was already a strict subset, so there was nothing to port.

## Inventory: CSS

| Old file | In `bundle.css`? | Differences |
|---|---|---|
| `sentri-components.css` | yes, section 5 (verbatim) | the primary-button register rule skips `aria-disabled` (the waiting face, ADR 0002); optional-row rules use tokens. **Only in the old file:** `.st-optional-body textarea{height:90px}` and `.st-optional-list{display:block}` (ported into the bundle); `.farrowing-phone .finish-extras>.st-optional-row:first-child` and `.farrowing-phone .finish-field-answer` (Farrowing-only, moved to `farrowing-subpages-refinement.css`) |
| `sentri-visual-foundation.css` | yes, section 3 | its `:root` palette now comes from `tokens.css`; the primary / danger button rules gained the `aria-disabled` guard |
| `astra-surfaces.css` | yes, section 4 (verbatim) | none; Farrowing and Inspection no longer load the separate file |
| `farrowing-astra-concept.css` (common base) | yes, section 2 | the bundle's base is the shared subset; the pages keep their own page rules |
| `astra-task-header.css`, `astra-record-log.css`, `astra-home-link.css`, `astra-home-task-card.css`, `astra-task-overview.css` and their `.js` | no | page-specific. They stay with the pages. `astra-surfaces.js` (the page / drawer policy) stays too |

Only in the bundle: base for the DS pages, the field cards (Stepper, Measure, Numpad), Status, Banner, Photos, Button registers / waiting / hold, Row variants, ChoiceList radio, OptionalRow.

## Inventory: tokens

`sentri-visual-foundation.css` declared 14 custom properties (`ground`, `paper`, `app-background`, `surface`, `ink`, `muted`, `line`, `well`, `wash`, `green`, `green-wash`, `amber`, `red`, `focus`); `sentri-components.css` declared `--st-canvas|paper|inset|ink|muted|line|rule|space-section|radius` and the drawer sizes. Every value already matched `tokens.json` except `wash` (now an alias of `well` in `bundle.css`). The `--st-*` names stay as aliases of the tokens (`--st-ink: var(--ink)`), so no value is declared twice. The page stylesheets (`home-astra-prototype.css`, `farrowing-astra-concept.css`) redeclared a drifting palette in their own `:root` (for example `--ink:#20271f`, `--muted:#62695e`, `--ground:#f5f4ef`); those colour redeclarations were removed, because the old foundation file used to overwrite them anyway.

## After

- **Pages:** Home, Farrowing, Inspection and both study pages load their page CSS, then `tokens.css` (after it, as the old foundation did, so the shared palette wins over the page's own `:root`), then `bundle.css`, then `bundle.js`. The old files stay in place with the header `Retired — use ux/design-system/components/bundle.*`.
- **Cascade:** inside `bundle.css` the surfaces come before the foundation (the order Farrowing and Inspection loaded them in). The base section is in `@layer sentri-base`, so a page's own base (Home's `.scrim`, `.drawer`, buttons) always wins over it; unlayered, it re-styled Home's drawer. Layering the foundation as well was tried and rejected: it lost every foundation rule to the page CSS (about 100 visual differences).
- **Page rules touched:** the page `:root` palettes in `home-astra-prototype.css` and `farrowing-astra-concept.css` (redeclared colours that the old foundation overwrote); Home's `.scrim` gets `z-index:auto` (the base layer's `z-index:2` leaked through); Farrowing's `.detail-sheet[data-size] .sheet-body` rule gets the `.sheet` class to keep beating the foundation (a tie that used to be settled by load order); every page rule that set a target below 48px now reads `var(--tap-min)` (58 declarations in 8 files).
- **Tokens added** (`tokens.json` → `tokens.css`): `tap-min` replaces `touch-min` and is 48px (the glove floor); `field-height` is 48px; `control-height` stays 48px; `handle-width`; six colours the base layer used raw (`button-border`, `field-border`, `disabled-surface`, `disabled-border`, `back-press`, `focus-strong`); a px scale (`space-N`, `radius-N`, `size-N`, `font-size-N`, three `tracking-*`, `blur-scrim`) for the values that have no semantic name yet.
- **`bundle.css` has no raw colour or px value** except the 0 / 1px hairlines (`border:1px`, `translateY(1px)`), the `@media` / `@container` breakpoints (a media query cannot read a custom property), and the Google Fonts `@import`. Unitless numbers (weights, line-heights, `stroke-width`) are left as they are.
- **`scripts/tokenize-css.py`** is the helper that did the replacement; re-run it on any stylesheet with `--write --tokens`.

## Left for later

- `task-skeleton.css` still has raw px and six raw shadow colours (it already resolves every tap target through `tap-min`).
- Names for the scale tokens that deserve a role name (for example `size-20` as the glyph size).
- Deleting the retired files (the owner's call).
- The gate findings that are not about duplication, tokens or size (copy rules, variants, previews) are untouched: this step does not redesign.

## Sheet (component pass)

One implementation of the drawer, the page and the dialog: `SentriUI.sheet`, `sheetFooter`, `backButton` and `scrim` in `components/bundle.js`, styled in `bundle.css` section 3. It replaces three copies: the hand-built `.sheet` markup of Farrowing (`roomSheet`, `detailSheet`, `featurePage`, the record surface and the dialogs), Inspection (`sheet()`), Home (`drawer()` and its page footers), and the task skeleton's TaskSheet / TaskPage / TaskDialog (`SentriTask.sheet`, `drawer`, `page`, `dialog`, `footer` and `back` now call the component; their `tk-*` classes are gone). `AstraSurfaces.present`, `normalizeBack` and `markContext` (the regex rewrite of hand-built markup) are deleted; `AstraSurfaces.isPage` stays as the prototypes' page-or-drawer list.

## Button / IconButton pass (2026-10-10)

Button now owns primary, secondary, text action, tool, destructive and hold variants. Farrowing’s hold timer and Piglet’s `.sp-tool` are retired; `SentriTask.holdBind` delegates to the bundle. IconButton owns bordered and plain at `tap-min` square; Sheet Close and prototype toolbar/header tools use it. Host classes position controls; their forked geometry and colours have been removed. Waiting reasons stay visible and are linked to their control.
