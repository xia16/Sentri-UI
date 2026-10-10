# Data sync 数据同步

Draft: compiled from existing docs, not yet confirmed.

## Problem

Workers often have no signal. Records made on the phone are saved there and must reach the team later. The worker needs to see what is waiting, whether there is a connection, and to upload on purpose, without risk of losing anything.

## Who

Floor workers, often offline, and the supervisors who wait for their records.

## Anchor

None. The only lifecycle is a record: saved on the phone, then uploaded.

## Rules

- The queue is device-wide, not scoped to a section or unit.
- Home shows a saved-work card first while records wait (with the connection state); when the queue is empty, a quiet "All records uploaded" row sits at the bottom.
- The card opens a Saved work drawer: how many records wait, the connection, each record (task and animal, place, time), and Upload.
- Upload is explicit. The button is disabled while uploading. A failure or no connection keeps every record and offers Retry. Only a successful upload clears the queue.
- The drawer separates records saved on this device from records the team already has.
- The queue is simulated in the study; nothing the other prototypes record feeds it.

## Scope

In: the Home entry card, the Saved work drawer (waiting, offline, uploading, failed, done).

Out (old UI, not built): the per-pig and per-treatment detail with conflict and empty states; the all-treatments list entry. The old design has 17 screens (2025.4): entry banner, list, detail, upload.

## Decisions

- Decided (ASTRA-HOME-DIRECTION): a Saved work entrance replaces the unconditional "All records synced" footer; upload is explicit.
- Open: whether Data sync is a page or part of the drawer, and which owns conflicts and detail (both filed under To confirm); how the real queue is fed; how treatment sync relates to Prescriptions.

## Sources

- ux/research/home/ASTRA-HOME-DIRECTION.md (Saved work status)
- ux/research/home/SENTRI-DRAWER-INVENTORY.md
- Old UI Figma: https://www.figma.com/design/LhQhJho192tNKCFvf5Drnf?node-id=10541-8073
- Prototype: ux/system/home-astra-prototype.html
