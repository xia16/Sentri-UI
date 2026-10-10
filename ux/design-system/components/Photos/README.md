# Photos

Photos attaches optional image evidence to one event through the record sheet's optional row. Use Note instead for a fact that needs words.

## When
Use last in capture order, beneath required fields, for up to 12 event photos. Farrowing death and piglet mortality use this line face; the task skeleton delegates to it.

## When not
A fact that needs words — use Note (the optional note field in [Field](../Field/README.md)). Use [Measure](../Measure/README.md) for quantities. Never require a photo to record a fact or attach it per tally.

## Anatomy
Optional row: visible label, muted Optional word, optional attached/upload count, trailing outlined camera action. Persistent answer line (optional content). Optional thumbnail list below. No well card, no leading duplicate camera, no thumbnail corner delete. The entire optional row is one button; its trailing camera region is 48px, with `space-row-y` / `space-row-x` padding inside the component.

## Variants
**Optional photo row** (`line`): the one face for optional evidence, built on `SentriUI.optionalRow`. The unused circle/well face is retired. TaskPhotos is a thin alias, not a variant.

## States
| State | Rendered behavior |
| --- | --- |
| Default | Label · Optional · camera; no count (a cancelled capture on an empty row looks the same) |
| One / Several photos | Thumbnails and one count, maximum 12 |
| Adding | Adding photo… in the answer line; camera temporarily unavailable |
| Uploading | Count and spoken thumbnail label say waiting to upload; pending dot |
| Denied | Camera not allowed · allow it in Settings, then try again |
| Too large | Photo too large to attach · take it again |
| Pressed | Static press fill on the row |
| Disabled | Inactive or custom visible reason, aria-disabled, dashed camera outline |
| Full | 12 photos at most; same reason pattern |
| Cancelled | No error message; the photos already attached remain |
| Longest label (and Longest label · 中文) | Real copy at the Copy budget, in the real container at 390px; longer copy is rewritten. |

No selected state: tapping a thumbnail opens it. [State documents](variants.json) show every state.

## Behavior and API
`SentriUI.photos({label='Photos', optional='Optional', count, active=true, items=[], max=12, action='photo-add', viewAction='photo-view', key='photos', hint, error, id, className, strs, args, adding=false, disabledReason, preview})` returns HTML. Items are `{id, src, alt, pending}`. Count is derived once from items unless provided; offline queues never block recording. Error is `denied`, `too-large` or `cancelled`; registered error messages win over hints. Hint remains mounted under the row and linked to the camera. `preview` renders static pressed proof.

The host guards aria-disabled taps with `SentriUI.guard`, answers the visible reason and opens nothing. Camera events carry `data-value=key`, `data-reason=inactive|full|busy`; thumbnails carry the item id. Camera-first capture: web uses an image file input with `capture="environment"`; native hosts use their capture screen, with library access behind it. Permission and file-size failures set `error`. Keep current photos after cancelled capture.

Viewer has visible Back. Draft viewer offers Delete as a full-size danger Button; saved evidence has no Delete. Deletion returns “Photo deleted · Undo” for 5 seconds; host restores the snapshot on Undo. Return focus to the originating thumbnail, or camera if deleted. Capture returns focus to camera. Before Undo expires use `SentriUI.handFocus` so only focus still on Undo moves. The viewer is a Sheet, never another nested overlay.

## Content rules

### Copy budget

| Text | English | 中文 | Lines |
| --- | --- | --- | --- |
| Label | 24 | 12 | 1 |
| Help | 60 | 30 | 2 |

Over-budget copy is rewritten, never wrapped, shrunk or ellipsised. The “Longest label” state shows real copy at this limit in the real container at 390px; budgets come from what fits at 390px inside the screen gutters.

### Writing rules

Sentence case; Optional stays visible. Example “照片 · 选填”; Derived counts say “3 attached · 1 waiting to upload”, not a second copy elsewhere. Alt labels name the evidence; fallback labels give the photo index and pending status.

## Accessibility
Optional row is a native button with a visible label and spoken label; hint is `role="status"`, linked by `aria-describedby`. Thumbnails are labelled native buttons; images have empty alt to avoid duplicate announcements. ≥48px targets, no gesture-only deletion. Disabled reason is readable and the camera outline changes shape, not just colour.

## Do / don't
Do attach photos to the event and let recording proceed offline. Don't use a dashed empty tile, another card, a separate Add photo button, or delete from History. Do keep the trailing camera padded inside the row; don't shrink it to fit Chinese text.

## Tokens
`space-row-y`, `space-row-x`, `space-8`, `space-key-gap`, `space-4`, `control-height`, `tap-min`, `border-width`, `type-weight-semibold`, `size-2`, `size-3`, `radius-control`, `radius-segment`, `task-key-border`, `paper`, `ink`, `muted`, `disabled-ink`, `press`, `amber`, `line`, `status-dot`, `photo-tile`, `glyph-pad`, `type-choice-label-size`, `type-choice-meta-size`, `font-sans`; OptionalRow also uses `type-description-size`, `font-size-12`, `space-7`, `space-12`.

## Related and classification
Generic **component**, using the optional-row arrangement documented in [Field](../Field/README.md). [TaskPhotos](../TaskPhotos/README.md) is its retired compatibility alias; [Sheet](../Sheet/README.md) owns the viewer and [Button](../Button/README.md) owns Delete/Undo. Optional inputs remain one row per input. `SentriUI.optionalRow` is the shared optional row; it may get its own component page later (proposed by the round-1 gate, deferred). Photos adds no horizontal padding of its own: the host row list sets the inset. Give IDs Measure is unchanged pending the owner's Numpad decision.

## Changelog
2026-10-10: one line face, merged TaskPhotos, migrated Farrowing, padded 48px camera, derived counts, adding/error/Chinese examples. See [verification](verification.md).
