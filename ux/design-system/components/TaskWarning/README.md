**Status: candidate.** Extracted from farrowing's danger band (`.danger-band`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskWarning (the danger band)

A consequence the worker must see before a commit: a pale red box with the warning, optional text actions, and one muted consequence line (`Save or clear the pending piglet deaths before ending.` · `Review piglet deaths` · `9 alive stay under piglet care`).

**Anatomy** (`.tk-warning`, `data-ds="TaskWarning"`, `role=note`)
- `red-wash`, 1px `danger-border` (#edc8c0, candidate), `radius-control`, padded `space-row-y`; text `choice-meta` 12px/1.6 `red`.
- **Actions** (optional): a wrapping line of text actions (and a bold fact), 4px under the text, in the band's colour.
- **Detail** (optional): 4px under, `meta` 10px/1.6 `muted`.
- `tone: 'amber'`: `amber-wash`, `pending-border`, `amber`.
- The host sets the band's outer margin (farrowing: 17px above and below).

**Title** (`title`): a bold first line, 12px/600 (farrowing's banners and bands lead with it); the text under it is 11px/1.6.

**End banner** (`icon` and/or `door`): farrowing's `.task-warning-card` (⚠ `9 sows will be removed from this batch` / `These sows have not farrowed.` ›): a flex row at least 80px, the 16px icon at the top left (2px down), the copy (4px between lines), a 14px chevron; with `door: { action, value, label }` the whole band is one button. `tone: 'amber'` is the banner's colours: `banner-wash` #fff5df, 1px `banner-border` #efdbb0, `amber` text (candidates).

**Component contract**
- **Props:** `SentriTask.warning({ title, text, actions, detail, tone = 'red' | 'amber', icon, door: { action, value, label }, label })`. `text`, `detail`: text slots or parts; `actions`: HTML (text-register Buttons).
