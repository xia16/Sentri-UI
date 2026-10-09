**Status: candidate.** Extracted from farrowing's photo line (`.photo-field`, `.photo-title`, `.photos`) for the task skeleton ([ADR 0003](../../adr/0003-task-skeleton.md)), owner round 5 (match farrowing exactly). It is not approved.

# TaskPhotos (the Photos card in farrowing's face)

The design system's [Photos](../Photos/README.md) card drawn as farrowing's photo **line**: no well; a 14px camera glyph, the label (13px/500), `Optional` (10px `muted`), and at the right an **outlined camera key** (48px, `radius-segment`, 1px `task-key-border`, `paper`); thumbnails `photo-thumb-task` (50px), radius 8, 8px apart, under the line. `space-section` above it when it follows content.

**Component contract**
- **Props:** `SentriTask.photos({ …SentriUI.photos props })` — items, max, active, error, hint, strs as the Photos card.

**States**
- The Photos card's: inactive (the camera answers, greyed), full, error hint, pending thumbnail dot.
