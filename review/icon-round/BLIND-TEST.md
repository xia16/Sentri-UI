# Blind test: is each icon good enough to use?

Owner, 2026-11-03: "if they are not good enough to represent then we won't use it."

## Method

- A fresh agent with no context saw each icon unlabelled and numbered, in shuffled order. It saw each one at 18 px in a row tile, at 16 px, and at 28 px, and judged the small sizes.
- It was told only that the icons come from a phone app for pig-farm workers.
- **Test A:** it named each icon freely and gave a confidence.
- **Test B:** it then matched each icon to the app's labels, with decoys among them, and said what else each could be misread as.
- Round 1 had 48 icons: every new and redrawn one, the round-2 candidates, and eight current icons as controls.
- Round 2 was a second fresh agent with 12 icons: two redraws each of pregnancy and move, plus farrow and room, against their near neighbours.
- The sheets are `blind.html` with the same names. The fixed shuffle key is printed to the console.

## The bar

An icon stays when one of these is true:
- the tester named it unprompted, with medium confidence or better;
- it matched its own label with no likely misreading against another label.

Otherwise it is cut. It never enters the registry, and its meaning falls back to an icon that passed, or to the word alone. All eight controls passed: health, scan, feed, treat, tag, heat, wrench and calendar.

## Result: 22 kept, 21 cut

The list with the tester's words is in [blind-test.json](blind-test.json). In short:
- **Kept:**
  - Animals: pig, piglet, pigs (a group), missing, breeder.
  - Events: service, return-heat, farrow, death, move, truck, sample, count.
  - Records: history, tasks, undo, note, record, chart.
  - Places and environment: pen, humidity, fan.
  - Farrow is borderline: read as "sow with a piglet", and matched to farrowing in the second test.
- **Cut:**
  - sow, gilt and boar: at 16 px they are the same blob as pig.
  - litter: a copy of pigs.
  - foster, production and wean: read as refresh arrows or "arrow into a pig".
  - pregnancy, all three drawings: read as an eye, a plain pig, or a favourite pig.
  - not-pregnant: read as "eye-slash".
  - notch and pain: read as "shark fin" and "power".
  - room: failed twice.
  - The ear tag, pig face, backfat, body condition, AI catheter and ultrasound candidates also failed.
- **What it changes:**
  - One pig glyph stands for every adult kind. The kind is in the word beside it (sow, gilt, boar).
  - Pregnancy and production keep their current glyphs. With farrow and chart redrawn, neither shares its shape any more.
