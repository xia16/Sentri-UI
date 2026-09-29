**Status: candidate.** Extracted from the dead drawer's Photos composition and the craft pass, then revised after the design panel ([ADR 0002](../../adr/0002-candidates-2.md)). It is not approved.

# Photos

The record sheet's photo field: up to 12 photos attached to the event. It is the tenth field type in the record-sheet law and the last field in the sheet (`Photos · optional`), never per tally.

Call `SentriUI.photos({ label, optional, count, active, items, max, action, viewAction, key, hint, error, id })`.

**Anatomy**
- **Card:** a `well` fill with **no outline**. This is the owner's craft-pass ruling: the emptiest element must not have the strongest border.
  - `radius-control`, `space-row-x` padding on the left.
  - Empty, it is one `touch-min` (44px) row.
  - It sits **20px** below the field before it, so a thumb overshooting `Other +` cannot hit the camera.
- **Header row:**
  - The label at `row-title` (13px/500), then the optional word at `description` in `muted`.
  - Then the count (`3 attached · 1 waiting to upload`: tokens, the upload value amber).
  - The camera sits at the right end.
- **Camera:** a `touch-min` circle with a `paper` fill, a **`ring-width-fine` (1.5px) ring in `muted`** (the rulings' ink3 maps to `muted`), and the registry's `camera` glyph at `glyph-pad` in `ink`.
  - It is deliberately not the keys' squircle, so it never reads as another +.
  - The word lives in the label; the button is the glyph, with a spoken label.
- **Answer line:** one persistent `role="status"` line **directly under the header row**, 12px, referenced by the camera. It takes no space while empty.
- **Thumbnails:** beneath the answer line, inside the same card.
  - `photo-tile` squares with `radius-segment` and a 1px `line` border, `space-key-gap` apart.
  - **Five to a row at 390px, four at 360px.**
  - A pending upload wears a `status-dot` in `amber` at its corner, and its spoken label adds "waiting to upload".
  - A thumbnail opens the viewer.

**States**
- **Inactive** (`active: false`): there is nothing to attach to yet (no tally, no chosen reason).
  - The camera is floor-gray: a `well` fill, no ring, a `disabled-ink` glyph. It is `aria-disabled` and still tappable, with `data-reason="inactive"`.
  - The host answers the tap in the answer line (`Record a death first · photos ride that record`).
  - This is a scoped exception like the floor's (RULINGS, Photos).
- **Live** (the default): the ringed `paper` circle.
- **Attached:** thumbnails under the header. The count says how many photos there are and how many wait to upload. Uploads queue offline. Nothing ever waits on a photo, and Save never gates on one.
- **Full** (`items.length >= max`, 12): the camera grays the same way (`data-reason="full"`), and the tap is answered (`12 photos at most`).
- **Errors:** the card resolves each kind to its own registered message (en and zh, in `strings.json`), in amber in the answer line. The caller passes only `error`, never a hint for it, and an error wins over `hint`.
  - `error: 'denied'`: camera permission was refused. The answer is amber (`Camera not allowed · allow it in Settings, then try again`).
  - `error: 'too-large'`: amber (`Photo too large to attach · take it again`).
  - `error: 'cancelled'`: the worker backed out of the camera, so **nothing is said**.
  - No error ever blocks Save.
- **Pressed:** the camera fills `press`.
- **Focus:** a 3px `focus` ring at 2px offset on the camera and on a thumbnail.
- **Loading:** not drawn. A pending upload is the amber count and dot, not a spinner.
- **Empty:** the one 44px row. The card is present whenever the sheet takes photos.

**Component contract**
- **Props:** `label`, `optional`, `count`, `active`, `items: [{ id, src, alt, pending }]`, `max = 12`, `action = 'photo-add'`, `viewAction = 'photo-view'`, `key`, `hint`, `error: '' | 'denied' | 'too-large' | 'cancelled'`, `id`, `className`, `strs`, `args`.
- **Ids:** the root is `id`, the camera `<id>-camera`, the thumbnails `<id>-thumb-<n>`.
- **Events:**
  - `photo-add`, with the payload `{ key: data-value, reason: data-reason }`. `reason` is `''` when the camera is live, or `'inactive'` / `'full'` when it is floor-gray. Answer those taps in the answer line and open nothing.
  - `photo-view`, with the payload `{ id: data-value }`: open the viewer.
- **Capture first:** a tap opens the camera, not a library picker; the library is the camera UI's own shortcut. On the platforms:
  - uni-app: `uni.chooseMedia({ mediaType: ['image'], sourceType: ['camera', 'album'], camera: 'back' })`, which opens the camera first.
  - React Native: the camera module's capture screen, with the library behind its own button.
  - The web: `<input type="file" accept="image/*" capture="environment">`.
- **The viewer contract:**
  - The viewer shows one photo, full size, with `Back` on the left and, **only while drafting**, `Delete` as a full-size danger button on the right, 24px from Back.
  - `Delete` removes the photo from the draft and returns to the sheet with `Photo deleted · Undo` for 5 seconds in the answer line. Focus goes to that line's `Undo`.
  - Once saved, photos are evidence: the viewer opened from History shows `Back` only. There is no Delete from History in v1.
- **Focus return:**
  - After the viewer closes, focus returns to the thumbnail that opened it, or to the camera if that thumbnail was deleted.
  - When the answer line's `Undo` expires, use `SentriUI.handFocus(line, camera)`: focus moves only if it is still on the expiring `Undo`.
  - After a capture, focus returns to the camera.
- **Slots:** the label, optional word and count; the answer line; the thumbnails.

**Don'ts**
- Don't outline the card or draw a dashed tile, and don't put a corner × on a thumbnail.
- Don't put a text button (`Add photo`) beside the camera.
- Don't gate Save on photos, and don't ask for photos per tally.
- Don't delete from History.

**Strings**
- `strs: { label, optional, hint, camera, thumb, thumbPending, index }` and `args`.
- `camera` (`ds.c2.aria.camera`), `thumb` (`ds.c2.aria.thumb`, `{n}`) and `thumbPending` (`ds.c2.aria.thumb_pending`) are aria-labels set through `data-str-attr`.
- The answers are `ds.c2.photos.inactive`, `.full`, `.denied` and `.too_large`.
- The count is a token list with per-part `strs`.
- Without `strs` the output is unchanged.
