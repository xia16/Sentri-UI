# Sentri drawer inventory

This is a source inventory of the current Home, Inspection, and Farrowing studies. It records the surface policy emitted by the source and the CSS policy that actually applies. It is not a rendered coverage claim.

## Reading the sizing fields

The shared surface policy defines four drawer presets in `ux/system/astra-surfaces.css:18-24` and `ux/research/home/SENTRI-SURFACE-POLICY.md:7-16`:

| Type | Minimum | Cap / maximum | Body and adjustment policy |
| --- | --- | --- | --- |
| `compact` | Content plus header/footer chrome intrinsic; no explicit minimum | `42%` of the phone height | `height:auto`; `.sheet-body` scrolls; content can grow until the cap; no user drag-resize control is defined |
| `short` | Content plus header/footer chrome intrinsic; no explicit minimum | `58%` | `height:auto`; `.sheet-body` scrolls; content can grow until the cap; no user drag-resize control is defined |
| `medium` | No separate minimum is declared; the preset computes `76%` height | `76%` | Fixed preset height with a scrolling `.sheet-body`; no user drag-resize control is defined |
| `long` | No separate minimum is declared; the preset computes `85%` | `85%` | Fixed tall preset with a scrolling `.sheet-body`; no user drag-resize control is defined |

Pages are a separate surface type. `AstraSurfaces.present` marks them `data-presentation="page"`; `astra-surfaces.css:2-17` gives them the full phone canvas (`height:100%; max-height:100%`), a flex body scroller, and a fixed footer. Their `data-size` attribute does not control height after page classification. Pages have no content-sized minimum or user resize control.

Every shared drawer has a scrim/close path plus a fixed footer Back path unless the source says otherwise. Escape handling and scrim dismissal are implemented in the owning study. A visual grab/handle is not a drag-resize API.

## Home

Home uses its own `.drawer` markup, but the final cascade applies the shared drawer selectors. `home-astra-prototype.html:11-13` loads `sentri-components.css` last; its `.device .drawer[data-st-context="drawer"]` rules at `sentri-components.css:84-88` set the medium default cap and override the earlier `home-astra-prototype.css:6` `max-height:90%`. The `drawer()` helper at `home-astra-prototype.js:254` emits `data-size` and `data-sizing="content"`; the final shared rule keeps `height:auto`, so Home drawers are content/intrinsic height up to their declared preset cap, with `.drawer-body` scrolling and no drag resize.

### Home drawers

| Named drawer and source entry | Type / declared preset | Minimum | Cap / effective maximum | Scroll, adjustment, and dismissal |
| --- | --- | --- | --- | --- |
| Report equipment issue — `reportFault()`; `home-astra-prototype.js:186` | Drawer / `medium`, `content` | Content plus chrome intrinsic | `76%` medium cap from `sentri-components.css:84` | `.drawer-body` scrolls; form primary is moved to the fixed footer; scrim, close icon, footer Back, and Escape dismiss |
| Equipment detail — `faultDetail()`; `home-astra-prototype.js:187` (title is the device name; open/resolved content varies) | Drawer / `medium`, `content` | Content plus chrome intrinsic | `76%` medium cap | Body scrolls; no user resize; scrim, close icon, footer Back, and Escape dismiss |
| Saved work — `showSync()`; `home-astra-prototype.js:205-208` | Drawer / `medium`, `content` | Content plus chrome intrinsic | `76%` medium cap | Body scrolls; Upload/Retry or Done is moved to the fixed footer; scrim, close icon, footer Back, and Escape dismiss |
| Section unit picker — `showUnits()`; `home-astra-prototype.js:263-265` | Drawer / `medium`, `content` | Content plus chrome intrinsic | `76%` medium cap | Body scrolls; unit rows are populated after opening; scrim, close icon, footer Back, and Escape dismiss |
| Scan an ear tag — `scan()`; `home-astra-prototype.js:273` | Drawer / `medium`, `content` | Content plus chrome intrinsic | `76%` medium cap | Body scrolls; form primary is moved to the fixed footer; scrim, close icon, footer Back, and Escape dismiss |
| Search results — `lookup()`; `home-astra-prototype.js:274` | Drawer / `medium`, `content` | Content plus chrome intrinsic | `76%` medium cap | Body scrolls; result rows or the empty state are dynamic; scrim, close icon, footer Back, and Escape dismiss |
| End task early? — click handler; `home-astra-prototype.js:284` | Drawer / `compact`, `content` | Content plus chrome intrinsic | `42%` compact cap from `sentri-components.css:85` | Body is short by content in the current source; destructive action is moved to the fixed footer; scrim, close icon, footer Back, and Escape dismiss |
| Find a pig or pen — click handler; `home-astra-prototype.js:314` | Drawer / `short`, `content` | Content plus chrome intrinsic | `58%` short cap from `sentri-components.css:86` | Body scrolls if needed; form primary is moved to the fixed footer; scrim, close icon, footer Back, and Escape dismiss |

Home's `drawer()` default is `size='medium', sizing='content'` (`home-astra-prototype.js:254`). Device-specific drawer refinements are in `home-subpages-refinement.css:139-150,172-174,236`; they change colors and footer treatment, not the height cap. The current runtime examples therefore resolve as: Search = short/content with a `58%` cap; End task early = compact/content with a `42%` cap; Unit picker = medium/content with a `76%` cap.

### Home pages (separate from drawers)

The page registry is `home-astra-prototype.js:251`. All use the device canvas and an `.app-scroll` body; their footer/navigation differs by entry:

| Page view | Body and footer policy | Source |
| --- | --- | --- |
| `home` — Today’s work | `.app-scroll` plus persistent bottom navigation | `home-astra-prototype.js:189-197` |
| `sections` — Your sections | `.app-scroll` plus persistent bottom navigation | `home-astra-prototype.js:222` |
| `placeholder` — task preview, ready, or closed task | `.app-scroll` plus fixed `.page-footer` | `home-astra-prototype.js:240-245` |
| `environment` — Environment & devices | `.app-scroll`; no separate drawer or user resize | `home-astra-prototype.js:178-180` |
| `maintenance` — Maintenance | `.app-scroll`; no separate drawer or user resize | `home-astra-prototype.js:182-184` |
| `assistant` — Assistant | `.app-scroll` plus fixed composer footer | `home-astra-prototype.js:247` |
| `finding` — Movement needs clarification | `.app-scroll` plus fixed action footer | `home-astra-prototype.js:248` |
| `toolbox` — Toolbox | `.app-scroll` plus persistent bottom navigation | `home-astra-prototype.js:249` |
| `records` — Records | `.app-scroll` plus persistent bottom navigation | `home-astra-prototype.js:250` |

## Inspection

Inspection uses `sheet()` at `ux/system/inspection-astra-concept.js:1272` for named surfaces. `drawerSize()` at `1251-1270` is the complete preset resolver. `AstraSurfaces.isPage('inspection', view, context)` is the page registry at `ux/system/astra-surfaces.js:3,6`; the page views below are pages even though `sheet()` still emits their source `data-size`.

### Inspection pages

These views share the page policy: full phone canvas, no scrim, independently scrolling body, fixed footer, no content minimum, no user drag resize. The `bulkActionKinds` pages are conditional: they are pages only when `c.form.recordEditor && c.form.bulk` is true.

| Page views / named content | Source |
| --- | --- |
| `actions` / pig and pen Actions (full page, fixed Back/category footer); `pig` / pig detail; `pig-profile` / pig profile | `astra-surfaces.js:3`; `inspection-astra-concept.js:1010-1013,1283` |
| `pig-production`, `pig-origin`, `pig-log` / production, origin, and pig log | `astra-surfaces.js:3`; `inspection-astra-concept.js:1013` |
| `pig-production-batch` / batch record | `astra-surfaces.js:3`; `inspection-astra-concept.js:939-947` |
| `pig-feed`, `pig-feed-curve`, `pig-feed-changes` / Feed plan variants | `astra-surfaces.js:3`; `inspection-astra-concept.js:1014,999-1002` |
| `history` / This walk | `astra-surfaces.js:3`; `inspection-astra-concept.js:1286` |
| `pen-detail` / pen detail; `pen-log` / Pen log | `astra-surfaces.js:3`; `inspection-astra-concept.js:757-758` |
| `feed` / Pen feeding; `feed-editor` / Adjust feed | `astra-surfaces.js:3`; `inspection-astra-concept.js:768,1014` |
| `unit-detail` / Environment & equipment; `environment` / Environment; `equipment` / Equipment faults | `astra-surfaces.js:3`; `inspection-astra-concept.js:755-756,849` |
| `batch-detail` / batch tracker | `astra-surfaces.js:3`; `inspection-astra-concept.js:848` |
| `treatment` / Record treatment or vaccination | `astra-surfaces.js:3`; `inspection-astra-concept.js:751` |
| `sow-transfer` / Transfer sow | `astra-surfaces.js:3`; `inspection-astra-concept.js:740` |
| `health`, `edit-conditions`, `triage`, `resolve`, `weight`, `temperature`, `backfat`, `treatment`, `note`, `body` when bulk record editing is active | `inspection-astra-concept.js:452,546-565`; page classification `astra-surfaces.js:6` |

Bulk record pages use the same page height policy but have the specialized `single-action-sheet` or `bulk-action-sheet` body layout (`inspection-astra-concept.js:563-565`; `astra-surfaces.css:28-33`). Their source `data-size` is still resolved by `drawerSize()` before page classification; it does not change the page cap.

### Inspection drawers: dynamic policies

| Named view / entry | Type and exact sizing rule | Minimum | Cap / maximum | Scroll, adjustment, and dismissal |
| --- | --- | --- | --- | --- |
| Unavailable actions — `unavailableActionsPage()`; `inspection-astra-concept.js:712` | Drawer / `short` when `groups item count≤1`; `medium` when `items + groups≤5`; otherwise `long`; `drawerSize():1258` | Content intrinsic for short; computed preset height for medium/long | `58%`, `76%`, or `85%` | `.sheet-body` scrolls; fixed Back footer; scrim, close/back, and Escape dismiss |
| Medicine picker — `medicinePicker()`; `inspection-astra-concept.js:582` | Drawer / `medium` for one subject; `long` for bulk; `drawerSize():1253` | Medium computed height or long computed height | `76%` or `85%` | Nested over its parent with an inert background wrapper; `.sheet-body` scrolls; one fixed footer Back (the shared presenter removes the legacy header Back); scrim/close and Escape dismiss |
| Bulk health picker — `bulkHealthPicker()`; `inspection-astra-concept.js:593` | Drawer / `long`; `drawerSize():1253` | Computed long height | `85%` | Nested over the health editor with inert background; `.sheet-body` scrolls; fixed Back/Save footer; scrim/close and Escape dismiss |
| Bulk record editor views when not bulk — `bulkActionPage()`; `inspection-astra-concept.js:546-565` | Drawer / `short` for `weight`, `temperature`, `backfat`, `note`, `body`; `medium` for the other `bulkActionKinds`; `drawerSize():1254` | Short content/chrome intrinsic; medium computed height | `58%` or `76%` | `.sheet-body` scrolls; fixed Back/Save footer; scrim/close and Escape dismiss |

### Inspection drawers: static policies

The following views use one stable resolver entry each. They are grouped only where the same view-to-policy rule applies exactly.

| Named views / titles | Type / preset | Minimum | Cap / maximum | Scroll, adjustment, and dismissal | Source |
| --- | --- | --- | --- | --- | --- |
| `record-optional` / optional record editor; `feed-date` / feed date; `feed-note` / feed note; `pen-note` / Pen note; `read-pen-note` / Pen note; `note` / Add a note; `complete` / walk complete; `home` / Today; `temperature`; `backfat` | Drawer / `short` | Content plus chrome intrinsic | `58%` | `.sheet-body` scrolls; fixed Back and any primary action; scrim/close and Escape dismiss | `drawerSize():1253,1260-1263`; `overlay():749,762,1279-1285`; `round3Overlay():839` |
| `measurements-menu` / Measurements & condition; `body`, `individual-plan`, `resolve`, and `triage` when reached outside the bulk record-editor branch; `filters` / Filter pigs; `pen-faults`; `fault-form`; `fault-record`; `selected-pen-note`; `choose-fault-pen`; `finish` / Finish walk; `switch-feed`; `miscarriage`; `production-task`; `batch-membership`; `batch-removal`; `not-in-pig`; `feed-breakdown`; `finding`; `finding-edit`; `finding-close`; `review`; `search`; `scan`; `report`; `exception`; `condition`; `plan`; `weight` outside the record-editor branch; `edit-conditions` outside the record-editor branch | Drawer / `medium` | Computed `76%` height | `76%` | `.sheet-body` scrolls; fixed Back plus any source primary; scrim/close and Escape dismiss | `drawerSize():1253,1260-1268`; `overlay():749-769`; `round3Overlay():839-849`; `recordFlowOverlay():1015-1023`; `legacyOverlay():1279-1291` |
| `grid` / Go to pen; `health` outside the record-editor branch | Drawer / `long` | Computed 85% height | `85%` | `.sheet-body` scrolls; fixed Back/footer; scrim/close and Escape dismiss | `drawerSize():1253,1265,1267`; `penMapSheet():1300-1305`; `round3Overlay():845`; `astra-surfaces.js:3,6` |
| `log-date-picker` / Date range | Drawer / `medium` | Computed `76%` height | `76%` | Nested over Pig log or Pen log with inert background; `.sheet-body` scrolls; fixed Back/Apply footer; scrim/close and Escape dismiss | `drawerSize():1252`; `logDatePicker():904-906`; `overlay():749` |

Inspection's nested `drawer-background` is a source wrapper, not another named drawer: `overlay()` creates it for `logDatePicker` and for `record-optional`, `feed-date`, `feed-note`, `medicine-picker`, and `bulk-health-picker` (`inspection-astra-concept.js:749`). The parent surface remains inert while the child drawer is active.

## Farrowing

Farrowing has three distinct source paths:

1. `roomSheet()` (`farrowing-astra-concept.js:224`) emits a drawer by default and promotes `task-overview-sheet`, `task-end-sheet`, `pen-detail-sheet`, `pen-log-sheet`, and `pen-feed-page` to pages.
2. `detailSheet()` (`farrowing-astra-concept.js:384`) emits a drawer except for `history`, which is a page through `AstraSurfaces.isPage`.
3. `farrowingRecordSurface()` (`farrowing-astra-concept.js:482`) emits record sheets and promotes only views in the Farrowing page registry. Its `locked` view opts into `data-sizing="content"`.

The Farrowing page registry is `ux/system/astra-surfaces.js:3,6`: `history`, `roomOverview`, `roomEndTask`, `roomTaskReceipt`, `roomTaskSows`, `roomPenDetail`, `roomPenFeed`, `roomPenLog`, `marker`, `pigletCare`, `pigletEdit`, `foster`, `pigletDeath`, and `countReconcile`.

### Farrowing drawers

| Named drawer / reachable entry | Type / preset | Minimum | Cap / maximum | Scroll, adjustment, and dismissal |
| --- | --- | --- | --- | --- |
| Filter sows — `roomFilter`; `farrowing-astra-concept.js:307` | Drawer / `medium` via `roomSheet()` | Computed `76%` height | `76%` | `.sheet-body` scrolls; fixed Reset/Show footer; scrim, close/back, and Escape dismiss |
| Go to pen — `roomGrid`; `farrowing-astra-concept.js:312` | Drawer / `long` (`picker-sheet`) | Computed 85% height | `85%` | `.sheet-body` scrolls; fixed Back footer; scrim, close/back, and Escape dismiss |
| Find a sow — `roomSearch`; `farrowing-astra-concept.js:313` | Drawer / `medium` | Computed `76%` height | `76%` | `.sheet-body` scrolls; footer is supplied by `roomSheet()`; scrim, close/back, and Escape dismiss |
| Scan ear tag — `roomScan`; `farrowing-astra-concept.js:313` | Drawer / `medium` | Computed `76%` height | `76%` | `.sheet-body` scrolls; footer is supplied by `roomSheet()`; scrim, close/back, and Escape dismiss |
| Pen note, read — `roomPenReadNote`; `penSubpage()` and `roomSheet()` at `farrowing-astra-concept.js:241,243` | Drawer / `short` (`pen-note-sheet`) | Content plus chrome intrinsic | `58%` | `.sheet-body` scrolls; fixed Back/Edit footer; scrim, close/back, and Escape dismiss |
| Pen note, edit — `roomPenNote`; `farrowing-astra-concept.js:241,244` | Drawer / `short` (`pen-note-sheet`) | Content plus chrome intrinsic | `58%` | `.sheet-body` scrolls; fixed Back/Save footer; scrim, close/back, and Escape dismiss |
| Report fault — `roomPenFault`; `farrowing-astra-concept.js:241,245` | Drawer / `medium` | Computed `76%` height | `76%` | `.sheet-body` scrolls; fixed Back/Report footer; scrim, close/back, and Escape dismiss |
| Equipment fault detail — `roomPenFaultRecord`; `farrowing-astra-concept.js:246-248` | Drawer / `medium` | Computed `76%` height | `76%` | `.sheet-body` scrolls; fixed Back/Resolve footer when open; scrim, close/back, and Escape dismiss |
| Death breakdown — `deathBreakdown()`; `farrowing-astra-concept.js:395` | Drawer / `compact` via `detailSheet(...,'compact')` | Content plus chrome intrinsic | `42%` | `.sheet-body` scrolls if needed; fixed Back footer; scrim, close/back, and Escape dismiss |
| Count alive — `farrowingRecordSurface()` view `count`; `farrowing-astra-concept.js:482` | Drawer / `medium` | Computed `76%` height | `76%` | `.sheet-body` scrolls; record footer actions remain fixed; scrim, close/dismiss, and Escape dismiss |
| Finish farrowing — record view `finish`; `farrowing-astra-concept.js:482` | Drawer / `long` | Computed 85% height | `85%` | `.sheet-body` scrolls; fixed Back/hold-to-finish footer; scrim, close/dismiss, and Escape dismiss |
| Record dead — record view `death`; `farrowing-astra-concept.js:482` | Drawer / `long` | Computed 85% height | `85%` | `.sheet-body` scrolls; fixed Back/Save or hold-to-save footer; scrim, close/dismiss, and Escape dismiss |
| Edit record — record view `edit`; `farrowing-astra-concept.js:482` | Drawer / `long` | Computed 85% height | `85%` | `.sheet-body` scrolls; fixed Back/Save footer; scrim, close/dismiss, and Escape dismiss |
| Edit finish details — record view `editFinish`; `farrowing-astra-concept.js:482` | Drawer / `long` | Computed 85% height | `85%` | `.sheet-body` scrolls; fixed Back/Save footer; scrim, close/dismiss, and Escape dismiss |
| Locked litter — record view `locked`; `farrowing-astra-concept.js:482` | Drawer / `medium`, `data-sizing="content"` | Content plus chrome intrinsic because content sizing overrides the preset height | `76%` maximum from the medium preset | `.sheet-body` scrolls if content reaches the cap; fixed Back/actions footer; scrim, close/dismiss, and Escape dismiss |

The Farrowing record `finish`/`death`/`edit`/`editFinish` size rule is emitted by `farrowingRecordSurface():482`; `count` and `locked` emit `medium`, and only `locked` emits content sizing. The page registry does not contain these record view names, so they remain drawers.

### Farrowing pages

All entries below use the page policy: full phone canvas (`height:100%; max-height:100%`), one `.sheet-body` scroller, fixed footer, no content minimum, no user drag resize. `room` and `roomHome` are the main Farrowing host views rather than Astra sheet pages; they use their own fixed room dock or Today card and are listed separately.

| Page view / named content | Source and sizing |
| --- | --- |
| Main `room` / Farrowing unit list | `farrowing-astra-concept.js:214-221`; host `.room-scroll` is the single list scroller and `.room-dock` is fixed |
| Main `roomHome` / Today in a unit or All units | `farrowing-astra-concept.js:220,222`; host room home has no drawer sizing |
| Task overview — `roomOverview`; `farrowing-astra-concept.js:314-319` | `roomSheet(...,'task-overview-sheet')`; page registry and page CSS |
| End task review — `roomEndTask`; `farrowing-astra-concept.js:287-305` | `roomSheet(...,'task-end-sheet task-end-expanded')`; page registry and page CSS |
| Task completion/early-end receipt — `roomTaskReceipt`; `farrowing-astra-concept.js:290-293` | Same task-end page policy; title is dynamic from completion state |
| Task review sow list — `roomTaskSows`; `farrowing-astra-concept.js:296-300` | Same task-end page policy; title is dynamic from review group |
| Pen detail — `roomPenDetail`; `farrowing-astra-concept.js:232-236` | `roomSheet(...,'pen-detail-sheet')`; page registry and page CSS |
| Feed guidance — `roomPenFeed`; `farrowing-astra-concept.js:241-242` | `roomSheet(...,'pen-feed-page')`; page registry and page CSS |
| Pen log — `roomPenLog`; `farrowing-astra-concept.js:260-265` | `roomSheet(...,'pen-log-sheet')`; page registry and page CSS |
| Farrowing log / production log — `history`; `farrowing-astra-concept.js:384-392` | `detailSheet()` plus page registry; page CSS |
| Add/Edit note — `marker`; `farrowing-astra-concept.js:436-443` | `featurePage()` always calls `AstraSurfaces.present(...,{page:true})`; page CSS |
| Piglet processing — `pigletCare`; `farrowing-astra-concept.js:445-458` | Feature page; page CSS |
| Piglet identity — `pigletEdit`; `farrowing-astra-concept.js:460-463` | Feature page; page CSS |
| Foster piglets — `foster`; `farrowing-astra-concept.js:465-468` | Feature page; page CSS |
| Report piglet mortality — `pigletDeath`; `farrowing-astra-concept.js:470-473` | Feature page; page CSS |
| Reconcile piglet count — `countReconcile`; `farrowing-astra-concept.js:475-478` | Feature page; page CSS |

The sow profile reached from Farrowing is an embedded Inspection document (`profile()` at `farrowing-astra-concept.js:396`, `inspection-astra-concept.html?embed=sow`). Its internal drawers belong to Inspection and are not double-counted as Farrowing drawers.

## Non-drawer overlays and unknowns

- Farrowing Born correction and photo attachment are modal `.dialog` overlays from `farrowing-astra-concept.js:394`, not drawers and therefore have no `data-size` preset. Their dialog height is content/CSS-defined; no source minimum or maximum is declared in the inventory inputs.
- Inspection nested background sheets are wrappers around named child drawers, not additional catalog entries (`inspection-astra-concept.js:749`, `1315-1320`).
- Dynamic titles and content lengths are state-dependent: Home fault device names and sync queue length; Inspection action counts, selected subjects, bulk mode, feed target count, and log rows; Farrowing task review group, completion state, pen id, sow tag, fault state, and record counts. Their sizing rule is explicit above, but their final pixel height is not knowable from source alone.
- No source in these three studies provides a user-controlled drag handle, resize gesture, or adjustable-height preference. The visible drawer handles are decorative affordances.
