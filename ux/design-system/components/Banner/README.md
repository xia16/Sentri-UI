**Status: candidate.** Consolidated from the slices' DangerBand and EditBanner compositions and farrowing's two bands, then revised after the design panel ([ADR 0002](../../adr/0002-candidates-2.md)). It is not approved.

# Banner

A headline over its consequence, on a wash, at the top of what it governs. There are two tones and no others.

Call `SentriUI.banner({ tone, headline, consequence, summary, actions, live, id })`.

**Tones**
- **`danger`:** an irreversible act about to happen, or a terminal fact.
  - Farrowing's sow warning above `Save · HOLD` (`Saving ends farrowing` over `7 alive stay under piglet care`).
  - The record face's band (`Sow died · prolapse` over `aug 25 · 06:20 · L.M`).
- **`correction`:** Edit's banner (`Correcting a past record` over `logged as G.H`), with the live change summary (`stillborn 1 → 0 · alive 10 → 11`) and the `Clear` text action.
  - It appears at the first change, not on entry (RULINGS, Edit).

**Anatomy**
- **Box:** `space-row-y` × `space-panel` padding, `radius-inset`, a 1px border, no shadow, no left-border accent.
  - `danger`: a `red-wash` fill and a `red` border.
  - `correction`: an `amber-wash-strong` fill and an **`amber` border** (5.6:1, so the box reads as amber in sunlight). `amber` text holds 4.6:1 on the wash.
- **Headline:** `choice-label` (14px).
  - `danger`: **`type-weight-strong` (700)** in `red`, the ruled 14/700 red headline.
  - `correction`: 600 in `ink`.
- **Consequence:** `choice-meta` (12px) in IBM Plex Mono, `muted` (the ruled "12 mono ink2"). It says what the act costs, or gives the stamp.
- **Summary (correction):** a row at least `tap-min` tall under an `amber` rule.
  - The text is 12px/500 mono in `ink`, one token per corrected figure, joined by the `·` text node. The corrected value is `amber` at 600 (the correction mark is the amber value).
  - `Clear` is a text action at the right end, `space-row-y` from the text.

**States**
- **Default:** the headline and the consequence.
- **Live — one region per banner:**
  - With a summary, the summary text is the banner's only live region (`role="status"`, `aria-live="polite"`, `aria-atomic`).
  - Without one, `live: true` makes the whole banner the region (the sow warning appears when the sow is chosen).
  - Regions mount empty, and `liveFill`/`announce` fill them (see Status). Never nest two.
- **Cleared:** after `Clear`, the summary reads `Cleared` with an `Undo` text action for 5 seconds.
  - Undo restores the draft.
  - When the time runs out, the host removes the banner.
- **Pressed and focus:** only the text actions have them (the Button card's text register).
- **Disabled, loading:** not drawn.
- **Error:** none. The banner is not an error message; a refused value speaks in its field's status line.
- **Empty:** absent. A correction with no change has no banner.

**Component contract**
- **Props:** `tone: 'danger' | 'correction'` (an unknown tone warns in development and falls back to `danger`), `headline`, `consequence`, `summary: string | Token[]`, `actions: FieldAction[]`, `live`, `id`, `className`, `strs`, `args`.
- **Ids:** the root is `id`; the summary region is `<id>-summary`.
- **Events:**
  - `Clear` is `<button class="st-text-action" data-action="clear">`. The host discards the draft, re-renders the summary as `Cleared` with `Undo` (`data-action="undo-clear"`), and starts a 5s timer.
  - `Undo` restores the draft.
- **Focus return:**
  - After `Clear`, focus moves to `Undo`.
  - After `Undo`, focus moves to `Clear`.
  - When the banner goes away (the Undo timeout, or the last change undone by hand), call `SentriUI.handFocus(banner, firstField)` before removing it. It moves focus to the sheet's first field (which the host names) **only if focus is still inside the banner**; focus the worker has put elsewhere is left alone.
- **Slots:** headline, consequence, summary tokens, and actions.

**Don'ts**
- Don't use `danger` for a warning that still records (a duplicate tag, a weight out of range). That is amber, in the field's status line.
- Don't stack two banners, and don't add an icon.
- Don't put the primary act inside the banner. It stays in the bar, under the banner.
- Don't make `Clear` final with no way back. It always offers `Undo`.

**Strings**
- `strs: { headline, consequence, summary }` and `args`. A token summary takes per-part `strs`.
- Each action takes `{ label, action, strs: { label }, args }`.
- `ds.c2.demo.cleared` (`Cleared`) and `ds.c2.undo` (`Undo`) are in the registry.
- Without `strs` the output is unchanged.
