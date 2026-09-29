**Status: candidate.** Extracted from the dead drawer's Photos composition and the craft pass ([ADR 0002](../../adr/0002-candidates-2.md)). It is not approved.

# Photos

The record sheet's photo field: up to 12 photos attached to the event. It is the tenth field type in the record-sheet law and the last field in the sheet (`Photos · optional`), never per tally.

Call `SentriUI.photos({ label, optional, count, active, items, max, action, viewAction, key, hint })`.

**Anatomy**
- **Card.** A `well` fill with no outline (the emptiest element must not have the strongest border), `radius-control`, `space-row-x` padding on the left. Empty, it is one `touch-min` (44px) row.
- **Header row.** The label at `row-title` (13px/500), the optional word at `description` in `muted`, then the count (`3 attached · 1 waiting to upload`, a Status line with its values toned). The camera sits at the right end.
- **Camera.** A `touch-min` circle, `paper` fill, a `ring-width` `muted` ring, the registry's `camera` glyph at `glyph-pad` in `ink`. It is deliberately not the keys' squircle, so it never reads as another +. The word lives in the label; the button is the glyph, with a spoken label.
- **Thumbnails.** Beneath the header, inside the same card: `photo-tile` squares, `radius-segment`, a 1px `line` border, `space-key-gap` apart, five to a row on a 390px phone. A thumbnail opens the viewer.
- **Status region.** One persistent `role="status"` line at the foot (12px `muted`), referenced by the camera. It takes no space while empty.

**States**
- **Inactive** (`active: false`): there is nothing to attach to yet (no tally, no chosen reason). The camera is floor-gray: `well` fill, no ring, a `disabled-ink` glyph, `aria-disabled` and still tappable. The host answers the tap in the status line (`Record a death first · photos ride that record`). A scoped exception like the floor's (RULINGS, Photos).
- **Live** (default): the ringed `paper` circle.
- **Attached:** thumbnails under the header; the count says how many and how many wait to upload (amber). Uploads queue offline. Nothing ever waits on a photo, and Save never gates on one.
- **Full** (`items.length >= max`, 12): the camera grays the same way, and the tap is answered (`12 photos at most`).
- **Pressed:** the camera fills `press`. **Focus:** a 3px `focus` ring at 2px offset on the camera and on a thumbnail.
- **Error, loading:** not drawn. A failed upload is the amber `waiting to upload` count, not an error face.
- **Empty:** the one 44px row. The card is present whenever the sheet takes photos.

**Event contract**
- The camera is `<button data-action="photo-add" data-value="<key>">`. Tap → the camera, capture first (the library is the camera UI's own shortcut). An `aria-disabled` camera still fires: answer in the status line and open nothing.
- A thumbnail is `<button data-action="photo-view" data-value="<id>">`. It opens the viewer, where `Delete` is a full-size button beside `Back`. Deletion lives in the viewer, never as a badge on the thumbnail.
- Photos ride the sheet's Save. Once saved they are evidence, view-only from History (v1).

**Don'ts**
- Don't outline the card, or draw a dashed tile. Don't put a corner × on a thumbnail.
- Don't put a text button (`Add photo`) beside the camera.
- Don't gate Save on photos, and don't ask for photos per tally.

**Strings**
`strs: { label, optional, hint, camera, thumb, index }` and `args`. `camera` (`ds.c2.aria.camera`) and `thumb` (`ds.c2.aria.thumb`, with `{n}`) are aria-labels set through `data-str-attr`. The count is a token list with per-part `strs`. Without `strs` the output is unchanged.
