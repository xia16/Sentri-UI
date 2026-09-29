**Status: candidate.** Consolidated from the slices' DangerBand and EditBanner compositions and farrowing's two bands ([ADR 0002](../../adr/0002-candidates-2.md)). It is not approved.

# Banner

A headline over its consequence, on a wash, at the top of what it governs. There are two tones and no others.

Call `SentriUI.banner({ tone, headline, consequence, summary, actions, live, id })`.

**Tones**
- `danger`: an irreversible act about to happen, or a terminal fact. Farrowing's sow warning above `Save · HOLD` (`Saving ends farrowing` over `7 alive stay under piglet care`), and the record face's band (`Sow died · prolapse` over `aug 25 · 06:20 · L.M`).
- `correction`: Edit's banner (`Correcting a past record` over `logged as G.H`), with the live change summary (`stillborn 1 → 0 · alive 10 → 11`) and the `Clear` text action. It appears at the first change, not on entry (RULINGS, Edit).

**Anatomy**
- Box: `space-row-y` × `space-panel` padding, `radius-inset`, a 1px border, no shadow, no left-border accent.
  - `danger`: `red-wash` fill, `red` border.
  - `correction`: `amber-wash` fill, `pending-border` border.
- Headline: `choice-label` (14px/600). `red` on danger, `ink` on correction.
- Consequence: `choice-meta` (12px) in IBM Plex Mono, `muted`. It is what the act costs, or the stamp.
- Summary (correction): a row at least `touch-min` tall under a `pending-border` rule. The text is 12px mono `ink`, one token per corrected figure, the corrected value `amber` (the correction mark is the amber value). `Clear` is a text action at the right end.

**States**
- Default: the headline and consequence.
- Live: the summary text is a persistent `role="status"` region; patch it per change. Pass `live: true` when the whole banner appears in answer to a choice (the sow warning appears when the sow is chosen).
- Pressed, focus: only the `Clear` text action has them (the Button card's text register).
- Disabled, loading: not drawn.
- Error: none. The banner is not an error message; a refused value speaks in its field's status line.
- Empty: absent. A correction with no change has no banner, and Clearing the last change removes it.

**Event contract**
- `Clear` is `<button class="st-text-action" data-action="clear">`. Delegate with `closest('[data-action]')`. It discards the draft; the host removes the banner.
- The banner itself takes no taps.

**Don'ts**
- Don't use `danger` for a warning that still records (a duplicate tag, a weight out of range). That is amber, in the field's status line.
- Don't stack two banners. Don't add an icon.
- Don't put the primary act inside the banner: it stays in the bar, under the banner.

**Strings**
`strs: { headline, consequence, summary }` and `args`. A token summary takes per-part `strs`. Each action takes `{ label, action, strs: { label }, args }`. Without `strs` the output is unchanged.
