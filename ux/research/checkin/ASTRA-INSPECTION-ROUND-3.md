# Inspection: dynamic summary cards and explicit subjects

This revision follows the user's correction: feed is guidance, not a completion checklist. It supersedes the second study's refill and formula-change completion interactions.

## Overview

The user's health-app screenshot informs the asymmetrical layout: one square batch card alongside three smaller cards. The batch number is the main identity; population/stage support it, and the next scheduled task and date sit below. Paging changes the batch card only. Opening a batch shows its context and offers a deliberate list filter; swiping does not silently change the list.

Temperature, ammonia and equipment occupy the companion cards. Environmental values are absent, not zero. Opening a sensor card shows Temperature, Humidity, Ammonia and Fan speed with explicit disconnected/no-reading states. Future readings need source, freshness and trend. Fan/controller percentage and measured airflow are separate fields, not interchangeable indications of ventilation quality. No environmental threshold or reassuring health score is invented.

The inspected [Apple Health summary](https://mobbin.com/screens/e60672f4-262f-478f-9326-6a6a2262f43f) supports distinct metric modules and honest no-data states. Its [pinned category list](https://mobbin.com/screens/84593ad2-5c22-4fe6-8598-8bcb23cce724) suggests future prioritization; customization is not implemented in this study. Colours remain in the existing Astra family rather than copying the user's screenshot palette.

Batch/task assignments remain illustrative prototype data. They are not claims about a live production schedule. The environment module has no connected sensors.

## Selection and actions

- A pen checkbox selects that pen and its currently visible pigs. Explicit pen selection is stored independently from pig identities. Counts remain visible.
- The action sheet has a Pen / Pigs switch. Pen offers device fault reporting and pen notes; Pigs offers health and animal records. The selected subject is stated in each resulting form.
- Reporting a fault across several selected pens first asks which one pen contains the device. A shared pen note can be applied to selected pens without being recorded on their pigs.
- A pig checkbox does not implicitly select its pen. Individual deselection can refine the animal set independently; the pen selection remains available in its tab.

## List hierarchy and feed

Fever, Off feed and other cases now have a primary-weight line each. Their day count is subordinate. Tag, parity, stage and batch remain identification/context. A triage label and relevant feed guidance can coexist with these conditions.

The feeder-low alert is removed. Manual feeding information has no Record as done button. Ad-lib formula/timing information is read-only; it creates no feeding-completion event. Body-condition records and configuration review remain separate, legitimate records. Maintenance faults still support report/resolution because those are equipment records, not feed compliance.

## Checks

Checked batch paging, explicit batch filtering, Pen/Pigs switching, pen-note scope and selection clearing, guidance-only feed details, and disconnected environment details in the browser. At 360 CSS pixels, the square batch card measured 189 × 189 pixels and the unit list had no unintended horizontal overflow. The batch carousel intentionally scrolls horizontally. Existing model checks for health-case identity and condition-linked plans still pass.

## Density revision — units with hundreds of pigs

Health cases now share one bold line rather than one large block per condition. ID/parity occupy a narrow identity column; day, triage and an active feed adjustment share the second line. Full case history remains in the pig detail. More than two conditions show an explicit additional-condition count.

In All, open health cases and manual feeding guidance are initially visible. Other matching pigs are collapsed per pen behind a counted Show remaining pigs control. Selected pigs stay visible. Pen order remains spatial; Health/Feed filters and direct pen navigation remain available. Parent selection applies only to the displayed pigs, with the number stated in its accessible label. Expanding a pen makes the additional pigs available to select.

Browser verification measured the Thin, Fever/Off feed and Diarrhoea rows at 60 CSS pixels on a 360 CSS-pixel viewport, with no horizontal overflow. A synthetic 400-pig model check showed four relevant rows initially, revealed all matching pigs on expansion, retained selected rows, and returned three rows in Health. This checks the collapsed-list logic, not a production performance benchmark.

### Batch card hierarchy correction

The next task and its due date now lead the square card. Batch ID is a small header identifier; pig count and production stage form the quiet footer. The batch number is not a metric and no longer receives oversized typography. Verified the revised card in the browser.

### Pen navigation parity with farrowing

Inspection now reuses farrowing's four-column, six-row pen map, cell styles, current-location outline, tap-to-jump, and 350 ms hold-to-peek interaction. The sample inspection roster occupies C1, C2 and D4; unavailable positions remain disabled. These are prototype map positions, not a discovered live unit layout.

Cell summaries prioritize pigs with health findings and open equipment faults. The bounded preview includes pig count, feeding mode/allocation, health findings, individual feed guidance and equipment faults. Feed remains information, with no completion action. Navigation preserves the current filters; pens with no matching pigs cannot be opened from that view. The destination aligns below the sticky filter controls and uses the existing 900 ms arrival cue. The bottom navigation shows the current pen using farrowing's control.

Verified the map's enabled/disabled states, filter retention, destination alignment and compact-list regression checks. Original farrowing files were not changed.

### Inspection detail-page consistency pass

- Pen information now uses the same compact icon / title / description / chevron row as the pen actions, without a separate oversized section. The pattern also covers pen feed links, unit and batch entry points, equipment and fault details.
- Pig details put open health findings first, with onset day and triage separated from the condition name. Individual feed guidance follows; batch ID stays quiet context. Existing readings, notes and the latest recorded treatment remain available.
- Feed details prioritize the current guidance and manual instructions. Per-pig allocation/station plans expand on demand. Ad-lib formula information has no completion action.
- Unit details include batches and next work, production-stage links, environment, equipment and walk updates. Sensor placeholders have aligned units and compact rows.
- Detail Back navigation follows the actual entry path and restores its scroll position. Closing returns to the list. Back discards unsaved form input without a warning. Successful saves retain their existing record behavior.
- Browser checks covered pen and pig details, health/treatment/measurement/adjustment forms, notes, equipment reporting, batch/environment navigation, feeding disclosures and walk completion. Dose/unit alignment, filtered row density and existing model checks passed. Sample test records were reset before delivery.

### Full roster and explicit human labels

This replaces the earlier quiet-pig collapse: All renders every pig matching the selected filters. There is no additional per-pen reveal control. Health and Feed provide the explicit narrower views, and parent selection includes all displayed matching pigs.

Each row has an identity / recorded-label line, followed by plain production stage, parity or age, and batch ID. Recorded health conditions and care instructions use tags; human feed guidance has a separate Feed note tag. Automatic individual feed-plan adjustments remain a plain line with a feed icon. Rows without labels still show their metadata, without an invented healthy status.

A persistent Note icon and label appears in the pen header when a note exists. It opens a reading sheet with the full text and author/time, plus Edit. It is a presence indicator, not an unread alert, and viewing it does not select the pen. The list does not display the full pen note. A sample note on C1 demonstrates the flow.

Verified All = 7 rows, Health = 3, all 400 synthetic pigs remain visible under All, no reveal controls or horizontal row overflow, and note read/edit/save/back behavior. Recorded rows are approximately 65–89 px and unlabelled rows approximately 64 px in the current preview.

### Two-line roster refinement

Rows now place the ear tag and persistent metadata together on the first line. Human-recorded labels occupy a single, non-wrapping second line. Long labels truncate with an ellipsis; labels that do not fit collapse into an accurate +N indicator, with all information retained in pig details and the row's accessible name. Automatic feed changes remain plain text on that second line. Unlabelled pigs retain their metadata without an empty status placeholder.

The fit calculation reruns after rendering, font loading and resizing. Verified five recorded labels produce three visible tags and +2 at the current preview width, without wrapping or horizontal overflow. Conditional rows are approximately 64 px; unlabelled rows are 58 px.

### Toolbar and selection placement

The default bottom toolbar now matches farrowing: Go to pen, the primary Scan ear tag button, and Search. Finish walk is a text action at the top right; walk history remains accessible beside it.

Selection changes only the bottom toolbar: Clear, a Selected summary that distinguishes pens from pigs, and Actions. All / Health / Feed and the detailed filter remain in place. Counts include selections outside the current filtered view. Tapping the summary opens a list grouped into selected pens and pigs, where either subject can be removed independently. It does not override the current list filters.

Verified mixed and pen-only selection, retaining Health while changing selection, clearing back to the default toolbar, and the scan/search/finish entry points.

### Single selection control

The selection bar now has Clear and one expandable control: “Selected · 1 pen · 3 pigs” with an upward chevron. The separate Actions button is removed. Tapping the count opens the existing Pen/Pigs operations sheet, while filters stay unchanged.

Reference: Gmail's attachment picker uses “Show Selected (2)” to open the selection, with a separate Add control: https://mobbin.com/screens/7732a48c-9dfd-49d4-8fdb-ee8504496c42 . This study adapts the count-as-entry-point idea to inspection's varied operations; it does not claim Gmail's count opens an actions menu. Browser verification confirmed mixed counts, both subject tabs, Back preserving selection, and no duplicate bottom action button.

### Unit readings above responsive batch cards

Unit-level temperature, ammonia and equipment indicators now sit in a compact strip under the unit heading. Batch cards occupy their own horizontal row below it. One batch fills the content width; two share it evenly; three or more show two-and-a-half cards with horizontal scrolling. Each card retains batch ID, next task, timing and population/stage context. Opening a batch and returning preserves the horizontal position. Readings remain placeholders until sensors are connected.

The scenario selector includes consistent one-batch and three-batch fixtures for review. Verified 350 px available width gives one 350 px card, two 170 px cards, or 132 px cards with a half-card cue; horizontal navigation, position restoration and environment entry points work.

### Recorded cards and two levels of pig information

Human-recorded health findings, manual feed instructions, treatments and pig notes each occupy a separate card in the quick pig overview. Warm cards identify open health findings; muted green identifies manual feed instructions. Pen faults and pen notes use the same structure, with links to the existing record and note reading sheets. Derived feed plans and stable pig facts remain ordinary reading sections below the cards. Feed remains guidance, with no completion action.

“View details” beside Pig overview opens a fuller reading sheet: cycle and next batch work, health and instructions, location and batch, feed plan, available body measurements, identity/provenance and pig-specific history. This follows the existing pig-page anatomy in `../../system/components.html`, section 07, while preserving Astra's visual style. Missing cycle dates, performance totals and registry data are not invented; the identity disclosure states the preview's data limit. History displays records from this walk only.

Verified the quick overview for pigs with two conditions, a manual feed instruction, and a newly saved condition; the new record also appears in that pig's history. Verified the nested Pig overview → View details → Pen information → Fault record route and Back at each level. Existing record-model and 400-pig filtering checks pass.

Current selection-bar decision supersedes the earlier single-control experiment above: plain selected counts, an underlined “View selected” link beneath, and a separate prominent Actions button.

### Standard drawer heights

Inspection drawers use three fixed sizes: short (46% of the phone), medium (70%), and long (the available height below a 74 px top inset). Size is assigned by destination, not content length. Headers and footers remain fixed while the body scrolls. Brief confirmations and single measurements use short; compact forms and pen details use medium; profiles, health recording and longer lists use long.

Actions uses medium for both subject tabs. Pigs is first and opens by default when pigs are selected; pen-only selection opens Pens. The subject tabs stay outside the scrolling body. The redundant scope / View selected row inside Actions is removed; optional selection review remains in the main selection bar. Switching Pigs and Pens keeps the same drawer bounds and resets only the action list's scroll position.

Refinement: medium is the default, including both pig overview and pig details, feed, filters, history and search. Content length alone does not justify a large drawer. Large is reserved for the health catalogue, treatment form and pen map; short remains for brief destinations. This supersedes the broader use of long drawers described above.

### Readability audit across inspection drawers

Removed the overlapping section and disclosure borders that produced several consecutive horizontal rules on pig details. Reading sections now use headings and a consistent 24 px gap. Action rows use their icons and spacing instead of additional rules. Repeated record lists keep only one separator between records, without a trailing divider. Input outlines and the fixed drawer header/footer boundaries remain.

Identity and feed breakdown disclosures use a quiet inset background and a chevron, with breathing room around expanded content. Supporting text and empty-state text are slightly larger. The existing recorded-condition cards, roster density, standard drawer heights and business logic are retained.

Rendered 74 layout fixtures covering 34 drawer destinations, both Actions subjects and all three feed modes at 320 px and 390 px widths. Browser checks with the actual fonts loaded found no horizontal body overflow, footers outside drawers or remaining borders on reading sections/disclosures. Checkbox labels retain at least 44 px targets. Visually checked live pig details (identity collapsed and expanded), station feed breakdown and Actions navigation. These are layout checks, not a claim to test every possible data or workflow combination.

### Compact notices and independent review

Human-entered records now use compact notice rows with explicit Health, Feed, Equipment, Treatment or Note tags. Disease/symptom names lead. Manual feed qualifications and equipment fault descriptions are distinct from author/time metadata. Identical triage across several findings is shown once as “Care for N findings”; differing triage remains with its own finding. This grouping is presentation only and does not merge the underlying cases.

Basic profile facts are consolidated in an About this pig grid. View pen and View feed are quiet header links with 44 px tap height. A single divider separates the fact group from Feed plan. Updates this walk accurately names the available history scope. Medium drawer heights are retained.

An independent reviewer with no conversation history or implementation rationale reviewed the live pig 000306 overview/profile, pig 000254, and Pen C2. The reviewer initially withheld acceptance because care text, feed qualifications and fault descriptions were too quiet, the full profile was long, and History implied a broader record scope. The changes above address those findings. Final checks rerendered 74 fixtures without horizontal overflow; the existing model and 400-pig selection/filter checks pass.

## Direct records and separate pig/feed destinations — 16 September

Health notices now open a case-scoped action view: edit finding/care, record treatment with that target prefilled, and resolve or mark entered in error. Body-condition findings also link to their individual adjustment. Changes preserve other cases and unrelated roster selection. Closing a linked body-condition case ends its adjustment; case snapshots and change-log entries remain available in memory.

The quick pig sheet links to a distinct Pig record destination with fixed Details / Log / Provenance tabs. It no longer repeats the quick sheet's health notices and feed summary. Origin fields without source data explicitly say Not supplied; the example is not connected to an animal registry. Existing findings are distinguished from newly saved walk records.

View plan now opens the individual pig's Feed plan, not pen feeding. Plan / Changes tabs separate today's base ration, active condition adjustment, read-only base curve, delivery context and manual top-dressing from the adjustment trail. Both destinations retain medium height and fixed tab positions. Back returns to the original pig and scroll context.

Feed design checked against feed-mobile.md (PRD v2.1 extraction, sections 6, 7, 9.6, 9.11 and 11.1) and components.html section 07. Farmhands use configured condition bands; this does not introduce curve/formula authoring or a Done action for feeding. Ad-lib pigs show formula and switch context without a ration or ration curve. Weekly curve anchors added here are explicitly sample farm configuration, consistent with the example's current base value; they are not sourced clinical guidance or live telemetry. Exact preset values remain illustrative.

Verification: syntax and existing model/density checks pass. Additional behavior checks cover case-specific editing and treatment scope, preservation of other cases/selection, archived outcomes, linked-adjustment clearing and no curve on ad-lib pigs. Browser checks cover notice actions, the distinct profile tabs, individual plan editing with prefilled values, save-back navigation and resulting history.

## Compact notices and live-record field coverage — 16 September

Health notices now place care on the second line alongside type/day. Monitor is quiet text; action-bearing care uses a compact tint. Every finding retains its own care label and direct action target; the extra shared-care row is removed.

Pig record tabs are Details, Production, Provenance and Log. The live-screen fields supplied by the user are retained: tag and other identities, type, breed, location, age, weight, teat count, parity, next expected heat, on-farm state, entry type, first heat, breeding number, alternate ear tag, birth and arrival dates; litters, production days, average liveborn and total born, mating-to-farrowing rate, weaning rate, average weaning weight, matings per litter, farrowing interval, non-productive days and liveborn litter weight. Current stage, batch, service/due dates and parentage remain available as additional context.

Production gives three compact figures priority, with the remaining values in the same two-column fact grid as Details and Provenance. Missing values retain muted labels and em dashes, with no explanatory placeholder paragraphs. Numeric zero remains a real value. Empty sections use muted headings. Other identities expand inline.

The scenario picker includes populated (000267), partial (000254) and empty-field (000306) profiles. Fixtures are explicitly sample data under the existing study label; the source live values were not copied as if they belonged to these pigs. Browser checks covered two-line notices, populated production values, fixed-height tabs and empty production styling. Existing model and 400-pig density checks pass.

## Mobile overview grouping and scroll chrome — 16 September

General measurements now share the quick Pig overview fact grid with stage, batch, place and parity/age. The separate Latest body measurements section is removed. Feeding becomes one compact, tappable summary row linking to the existing individual feed-plan destination. A few small outline symbols identify overview, feeding and major record sections; individual field labels and record tabs remain text.

The record tab bar now has its own fixed padded container aligned with the header and body. Origin replaces the long Provenance tab label while retaining all provenance fields. Native desktop scrollbar tracks/gutters/arrows are hidden inside the inspection phone only. The sheet and roster display a three-pixel overlay indicator during scrolling, fading after 650 ms; their scroll regions and touch/wheel access remain intact. The surrounding desktop study page keeps its normal scrollbar.

Reference: Apple's Scroll views HIG describes a translucent scroll indicator that typically appears after scrolling begins: https://developer.apple.com/design/human-interface-guidelines/scroll-views . Browser checks confirmed merged measurements, the feed-plan entry, aligned fixed tabs, scroll movement and the temporary indicator. Existing model and density checks pass.
