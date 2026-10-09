# Banner

Banner states a consequence or pending condition before the action it governs. Use [Field](../Field/README.md) instead for validation of one input.

## When
Use above a destructive commit, when a correction needs review, or for offline work waiting to upload. Farrowing uses danger and correction; Home and Piglet processing use notice.

## When not
Use [Status](../Status/README.md) for a quiet recorded fact; use Field for a refused value. Do not stack banners or repeat the same consequence in a card below.

## Anatomy
Box; leading icon (alert for danger, edit for correction, note for notice; the headline's own words carry the meaning too, never colour alone); one-line headline; optional consequence; optional detail; optional live summary; optional text actions. With `door`, the whole box is one button with a trailing ›; it contains no nested actions.

## Variants
- **Danger** (`danger`): consequence before a destructive commit or a terminal fact, as in Farrowing death and Inspection removal.
- **Correction** (`correction`): amber review before recording a changed fact. `door` opens Review; a summary supports Clear and Undo.
- **Notice** (`notice`): pending offline uploads or work waiting, as on Home and the ended Piglet task.

`door`, `icon` and `size: 'small'` are properties, not extra variants. TaskWarning is a compatibility alias to Banner, not another face.

## States
| State | Rendered behavior |
| --- | --- |
| Default | Headline, consequence; optional actions or whole-box door |
| Pressed / Focus | Press fill or visible focus ring on the action/door |
| Disabled | Door disabled with a visible reason and dashed border |
| Error | Upload interrupted; notice door offers retry and keeps local work |
| Loading | Notice states what is uploading; host retains the review door |
| Changed | Live change summary with Clear; appears at the first correction |
| Cleared | Correction summary says Cleared; Undo remains for 5 seconds |
| Long label / Chinese | Headline ellipsizes on one line; consequence wraps |

No selected state: a banner is not a choice. Input validation belongs in Field; a failed upload uses notice with a retry door. An empty correction is omitted. [State documents](variants.json) render every applicable state.

## Behavior
`SentriUI.banner({tone, headline, consequence, summary, actions, live, id, door, icon, size, state, reason, detail, strs, args})` returns HTML. String slots also accept trusted `{html}` from the task skeleton. Unknown tone falls back to danger with a development warning. `actions` accepts text-action descriptors (or legacy trusted task markup). Maximum two text actions; the primary commit stays in the footer.

The host handles review, Clear and Undo events. Clear snapshots the draft, empties it, renders `summary: 'Cleared'` and an `undo-clear` action, focuses Undo and starts a 5-second timer. Undo restores the snapshot and returns focus to Clear. On expiry call `SentriUI.handFocus(banner, firstField)` before removing it; do not steal focus from elsewhere. Summary is the only live region when present. Call `SentriUI.liveFill` after mounting. The state demo keeps Cleared visible for inspection; the host owns its timer.

## Content rules
Sentence case. Aim for at most 42 English characters or 18 Chinese characters in a headline; cap at one visual line, with ellipsis for excess. Keep the full text in the DOM and put necessary consequences in the wrapping line (up to 100 English / 45 Chinese characters). Example: “先保存更正记录” / “Save your correction first”. Action labels are verbs, at most 16 English / 6 Chinese characters. Never rely on colour: every tone has a leading word or icon.

## Accessibility
Static box: `role="note"`; dynamic summary: `role="status"`, polite and atomic. Door is a native button; Tab focuses it, Enter/Space activates. Text actions use Button keyboard/focus behavior. Disabled doors have a visible reason and native disabled semantics. No gesture-only action. All targets and summary rows use the 48px glove floor.

## Do / don't
Do name the consequence once and place the commit below it. Don't nest buttons in a door, put banners inside cards, or use red for connectivity. Do offer Undo after Clear; don't remove the focused Undo without returning focus.

## Tokens
`space-row-y`, `space-row-x`, `space-4`, `space-8`, `tap-min`, `control-height`, `border-width`, `size-2`, `size-3`, `radius-control`, `danger-border`, `red-wash`, `red`, `pending-border`, `amber-wash`, `ink`, `muted`, `press`, `focus`, `glyph-pad`, `type-weight-regular`, `type-weight-medium`, `type-weight-semibold`, `type-weight-strong`, `type-choice-label-size`, `type-choice-meta-size`, `font-sans`, `font-mono`. No local colour or size values.

## Related and classification
Generic **component**, shared across sections. [Button](../Button/README.md) owns text-action targets. [Status](../Status/README.md) owns quiet feedback. [TaskWarning](../TaskWarning/README.md) is its retired compatibility alias. Door and size are properties (the icon follows the tone), not copies.

## Changelog
2026-10-10: merged TaskWarning and Home offline banner; added notice/door, padded targets, rendered Cleared and Chinese states. See [verification](verification.md).
