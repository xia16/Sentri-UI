# Farrowing task filters

Research date: 12 September 2026. Scope: practical filters for selecting sows within an existing farrowing task. The controls below are product recommendations inferred from husbandry guidance, not published clinical scoring rules.

## Recommended initial controls

### 1. Expected farrowing date

Use a dual-handle date range, accompanied by editable **From** and **Through** dates. Both endpoints are inclusive calendar dates in the farm's timezone. Show the selected dates as text while dragging, an **Any date** reset, and a live result count. A short preview horizon can keep dragging useful, but precise date fields must reach all available dates. Optional shortcuts: **Today**, **Next 3 days**, and **Next 7 days**; define these consistently (including today). Do not silently drop missing dates: expose **Date not recorded** with its count.

Data needed: per-pregnancy expected date, source or calculation provenance, farm timezone, and pregnancy/farrowing state. Prefer the farm's established expected-date calculation. Merck describes individual breeding dates and herd average gestation as essential records; its current guidance gives typical gestation as approximately 115–116 days with variation. This supports calling the field *expected*, rather than treating a universal day count as certainty. [Merck Veterinary Manual, Breeding Management of Pigs](https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-pigs/breeding-management-of-pigs)

Product implication: a date filter helps organize observation work. AHDB emphasizes staff presence and routine checks during farrowing, including reducing unsupervised time. A missed expected date alone should not create a diagnosis or an automatic emergency label. [AHDB, Monitoring farrowing and piglet behaviour](https://ahdb.org.uk/knowledge-library/monitoring-farrowing-and-piglet-behaviour)

### 2. Previous litters

Recommended label: **Previous litters**, helper **Completed litters before this farrowing**. Options: **Any**, **0 (gilt)**, **1**, **2–5**, **6+**. Keep zero and one separate, so the farmer can select first-time farrowing animals specifically. These numeric buckets are browsing conveniences, not validated risk bands.

University of Minnesota Extension defines parity as the number of times a female has given birth and distinguishes gilts from first-parity sows after their first farrowing. Therefore a female awaiting her first litter has zero previous litters under this definition. The article discusses parity grouping in gestation housing; it does not establish a farrowing emergency classifier. [UMN Extension, Sorting sows by parity](https://extension.umn.edu/agriculture/animals-and-livestock/swine/sorting-sows-by-parity-reduces-aggression)

Data needed: a reliable completed-litter count captured before the current farrowing. Check the application's field semantics before relabeling: an upcoming litter number is one greater than the prior completed count. If that mapping cannot be established, retain **Recorded parity** with numerical options and do not attach **gilt** to an ambiguous value. Unknown values stay unknown, never zero. AHDB separately discusses management through the first gestation and first lactation, supporting an identifiable gilt cohort. [AHDB, Gilt service to farrowing](https://ahdb.org.uk/knowledge-library/gilt-service-to-farrowing)

### 3. Recorded follow-up (only when real records exist)

An optional **Follow-up** filter can offer **Any** / **Follow-up recorded**, driven by an explicit stockperson or veterinary task/flag with a reason and time. This directly finds work someone has already identified. Preserve the existing task scope and selected sow identities when adjusting filters.

If assistance history is added later, label it precisely, for example **Assistance recorded at last farrowing**. Require a dated event and a complete-record flag; absence of an entry is not evidence that no help was needed. The reviewed sources do not establish that previous assistance alone predicts current complications, so avoid **High risk** labels derived from that flag.

## Duration is observation data, not a clinical filter shortcut

For animals actively farrowing, **Time since recorded start** or **Time since last recorded piglet** can support sorting when timestamps are reliable. They measure different things and should not be interchanged. Merck discusses prolonged farrowing and longer birth intervals as relevant to piglet outcomes, while also describing variable duration and multiple causes of difficulty. A timer alone cannot identify the cause. Any clinical alert thresholds must come from the farm's agreed veterinary protocol and separate alert logic, not an invented universal “over X hours” filter. [Merck Veterinary Manual, Parturition in Pigs section](https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-pigs/breeding-management-of-pigs)

## Interaction reference

The parent implementation agent inspected an [Airbnb filter screen on Mobbin](https://mobbin.com/screens/7f04f4bf-bdfd-4dcd-ad10-2b4225a08b7f) and reported a dual range control, exact minimum/maximum fields, and a result-count action. Borrow that interaction structure for dates: broad drag selection plus precise From/Through entry and an explicit matching-sow count. This is an interaction reference, not evidence for livestock filter categories. The research agent did not independently inspect the screen.

On the task list, filter changes should narrow candidates without changing which task is being configured. Explain a zero-result state and offer **Clear filters**. Keep unknown data visible through explicit options or counts; do not invent missing parity, expected dates, assistance history, or clinical status.

## Implemented prototype and checks

The Astra concept now hides pen groups with no matching task sows. All clears the status restriction within the existing task/unit population; it does not include unrelated animals. The spatial pen grid keeps its layout but disables pens without matching task sows. Whole-task overview totals remain unfiltered.

Implemented expected-date range and numerical **Parity** filters, retaining the existing profile field's semantics. The sample uses relative due-date fixtures, with precise daily choices inside a seven-day window and open-ended outer bounds (7+ days ago / in 7+ days). Production should replace these fixtures with actual expected dates and full calendar entry as described above. No follow-up, risk, or clinical classification was invented.

Verified in the browser: Done shows only B3, Active only B1; dragging both range ends updates the displayed bounds and result count; Today through Tomorrow with parity 2–5 produces three sample sows; filtered-out B3 is disabled in the pen grid; zero results contain no empty pen cards; dismissing unapplied changes preserves the applied view; keyboard range adjustment works; narrow-phone content fits without horizontal overflow. Range gestures update existing controls in place. Existing farrowing-rule checks and additional filter-combination checks pass. The original farrowing.html is unchanged.

### Simplified after review

The user chose a slider-only date control. Removed the shortcut buttons and From/Through selectors. The selected range remains as read-only text above the slider; the footer Reset restores the full range and parity Any. Native keyboard adjustment remains available. Verified the range updates the result count and Reset restores all seven sample sows. This supersedes the earlier exact-field recommendation for this concept.
