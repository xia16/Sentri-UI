# Blind test: is each icon good enough to use?

Owner, 2026-11-03: "if they are not good enough to represent then we won't use it."

## Method

- A fresh agent with no context sees each icon unlabelled and numbered, in shuffled order. It sees each one at 18 px in a row tile, at 16 px, and at 28 px, and judges the small sizes.
- It is told only that the icons come from a phone app for pig-farm workers.
- **Test A:** it names each icon freely and gives a confidence.
- **Test B:** it then matches each icon to the app's labels, with decoys among them, and says what else each could be misread as.
- Every round used a new agent.
- The sheets are `blind.html` with the round's names. The fixed shuffle key is printed to the console.

| Round | What | Icons |
|---|---|---|
| 1 | Every new and redrawn icon, round-2 candidates, eight current icons as controls | 48 |
| 2 | Pregnancy and move redraws, farrow and room, beside their neighbours | 12 |
| 3 | After the owner's review: four moves, four batches, two piglets, three missing signs | 20 |
| 4 | Batch only: three more ideas and the round-3 card stack | 10 |

## The bar

An icon stays when one of these is true:
- the tester named it unprompted, with medium confidence or better;
- it matched its own label with no likely misreading against another label.

**Borderline** means it matched its label but is weak on its own, and it is flagged on the canvas. Everything else is cut: it never enters the registry, and its meaning falls back to an icon that passed, or to the word alone. All eight controls in round 1 passed: health, scan, feed, treat, tag, heat, wrench and calendar.

## Owner review (2026-11-03, after round 2)

- **Move** needs more work. Round 3's winner was a pig with an arrow ("move a pig", medium-high). The owner then ruled that a farm app can use the generic `transfer` arrows, so there is no new move glyph.
- **Mark as breeder** uses the generic mark, `bookmark`.
- **Batch** needs an icon, and it can't be several pigs. Seven ideas were tested in rounds 3 and 4. Only the card stack matched "batch", and only beside the word. It is kept as **borderline**, without the minus bar, which read as "remove".
- **Piglet** is just a small pig, hard to tell apart. Round 3 agreed: the chubby piglet read as a piggy bank, the one with a bottle as "medicate". Piglets use `pig`, and the word says piglet, as for sow, gilt and boar.
- **Missing** needs no pig. It is now **a dashed circle with a question mark** (medium in round 3).
- **Humidity:** no redraw.

## Result: 13 new, 5 redrawn

The list with the tester's words is in [blind-test.json](blind-test.json).
- **New:** batch (borderline), missing, service, return-heat, death, truck, sample, count, history, tasks, undo, pen, fan.
- **Redrawn:** pig, farrow (borderline), note, record, chart.
- **Cut:** every other drawing, each shown on the canvas's "cut" board with what the tester read.
- **One pig glyph** stands for every kind and age: sow, gilt, boar and piglet. The word beside it gives the kind.
- **Pregnancy and production** keep their current glyphs. With farrow and chart redrawn, neither shares its shape any more.
