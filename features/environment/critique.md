# Environment sensor screen: critique

Scope: `environment.page`, `environment.sensor-week`, `environment.sensor-other`, `environment.fan-manual` (all drawn by `ux/system/home-astra-prototype.js` `environment()` and `home-astra-prototype.css`). Class: presentation. Mode: polish.
Baselines: `origin/main` 0d49608, shot at 390 and 360 (EN) with `scripts/shoot-screens.mjs`.

References checked: house references (Home, Unit, More actions, Farrowing room); R14, R15, R16 in gate.md (all three were rejected shots of this very screen).

## Keep

- Sensor switcher at the top (Segment, view-switch): one tap changes the whole card; stays first.
- One white card per topic: the sensor card, then Devices with its small heading outside the card. Structure stays (R15).
- The 34px mono reading with a small grey unit: the one hero of the screen. Stays the heaviest thing.
- The chart: line, soft fill, three gridlines, three x labels. Calm and readable; keep the form.
- Today / 7 days toggle and Low / High under the chart.
- Fan card: Auto / Manual segment, slider with live value, one dark Save setting button (the one dark control), helper line under it.
- Reading history as a collapsed disclosure; the table is an audit tail.

## Problems

1. **major** The Today / 7 days toggle touches the reading above it: no gap between the hero block and the toggle, while the fan card has 12px around its own segment. Evidence: render at 390 (toggle top edge at the baseline of "22.4").
2. **major** Quiet text under the 11px floor on the screen's main facts: "Last reading" 10px, chart axis labels 9px (8.4px at 360), Low / High 10px, history table 10px, fan status line 10px, Sample/connected helper 10px. Evidence: `check-legibility --strict` (35 small on `environment.page`).
3. **major** "Reading history" is a bare line with no sign it opens and about 30px of dead space below it, floating at the end of the card (R16). Evidence: render; the summary has a 48px minimum plus 13px padding, no chevron.
4. **minor** `Fan speed` label is a 13px-high `<label>` target (check: smallTargets 324x13 on `environment.fan-manual`), and the speed value, the key fact in Manual, is the same 11px as its label.
5. **minor** Offline Auto / Manual labels and the disabled Save setting read 2.6-2.7:1. This is the Segment and Button disabled state, a component rule: **questioned, not changed here** (shared component, own task).

Prototype chrome (PREVIEW badge, "Sample readings" line) is not designed; the badge's 9px is left alone.

## Parts

| Part | Drawn by | Component whose job it is | Verdict |
|---|---|---|---|
| Header, back | `head()` page-head | TaskHeader / page-head | keep |
| Sensor switcher | `SentriUI.segment` view-switch | Segment | keep |
| Reading + unit + Last reading | page-built `.sensor-detail-heading` | Measure (candidate, not live) | keep page-built; fix size of "Last reading" |
| Today / 7 days | Segment | Segment | keep; fix spacing (layout only) |
| Chart | page-built SVG | none | keep; fix axis text size |
| Low / High | page-built `.sensor-range-stats` | none (Facts is a panel list) | keep; fix size |
| Reading history | page-built `<details>` | Log is the history tail of a detail page, but this is a short sample table in a card | keep disclosure; fix affordance and spacing |
| Devices heading + status | page-built | TaskSection / Heading | keep; fix status size |
| Fan card, mode | Segment | Segment | keep |
| Fan speed | native range + label | none | fix label target and value size |
| Save setting | `btn` primary | Button | keep |

## Self-crit

### Direction A (the only one that held), round 1: spacing, floors, disclosure, speed value

Directions B (move the fan card above the chart) and C (cut the "Sample readings" note) were considered and not built: B changes layout order, which no problem names; C removes a fact and the note is prototype chrome that the gate does not ask to cut.

- P1 toggle touching the reading: fixed (12px above and below; the toggle now belongs to the card).
- P2 floors: fixed for every fact (Last reading, axis, Low / High, table, fan status, Devices tag, helpers now 11-12px). Remaining at `check-legibility --strict`: the PREVIEW badge (prototype chrome, 9px) and the offline contrast of the disabled Segment and Button (P5, component rule, questioned).
- P3 history: now a row with a chevron (turns when open) and no dead space under it.
- P4 fan speed: label is no longer a 13px-high target; the value is a 22px mono figure at the right of the label.
- Keep: sensor switcher, one card per topic, 34px mono hero, chart form, toggle, Low / High, one dark Save setting, collapsed history: all as strong; the hero stays the heaviest element (34px against 12px support).
- Squint test: (1) the reading 22.4, (2) the chart line, (3) the fan Auto / Manual segment, matching "is the room right / is it moving / what is the fan doing".
- Cluttered, flat or bulky against the original: not cluttered (support text only moved to 12px, hero unchanged: c1 avoided); not flat (cards, headings and the hero kept: c2 avoided); no new boxes or bold (c3 avoided). The sensor card is about 20px taller at 390 (Offline: Auto / Manual segment still above the fold).
- Held against: Unit reference (calm card, quiet grey support) and the farrowing room (mono hero, one dark control).
- Rejected examples: R14 history label and sample note no longer take prime space (history one row, note 11px); R15 no segment weight change; R16 no floating "Reading history": it is a labelled row with a chevron inside the card.
- **Better because** the toggle no longer collides with the reading, every figure is legible at the floor with the hero unchanged, and history reads as a row that opens.

### Final look

Commit faf1717 (after merging origin/main forward; all four screens at 390 and 360, EN; the page renders no Chinese strings, so ZH matches EN). Looked at the whole screen of each: toggle spaced, axis and Low / High legible at 360, chevron row clean, Humidity and 7-day variants hold. Fan in Manual (online) shows a 45% mono value above the slider with Save setting below. Better.
