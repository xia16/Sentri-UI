# Icon round: more icons, one meaning each

Status: **proposal, on the canvas for the owner** (2026-11-03; cut to what passed the blind test the same day). Nothing under `ux/` has changed. The canvas link is in [the design system's canvas.md](../../ux/design-system/canvas.md).

## Why

The registry (`SentriIcons` in `ux/design-system/components/bundle.js`) has 73 glyphs. Most are generic app symbols, and screens keep borrowing them for farm things they don't show:
- a person (`profile`) stands for a sow, a piglet, a parity and a pig's details;
- a warning triangle (`alert`) stands for a death and for "not in pig";
- a hospital pen stands for fostering;
- a bar chart stands for every production task;
- a note stands for breeding, sampling and piglet-processing tasks.

Five pairs are the same shape under two names:
- `chart` and `production` are the same three bars, and `signal` is bars again;
- `farrow` and `pregnancy` are the same pulse line;
- `note` and `record` are the same lined page;
- `up` and `back-chevron` are the same path;
- `humidity` and `drop` are the same drop (left as it is: owner, 2026-11-03).

## The drawing rules (taken from the current set)

1. **Grid:** a 24 × 24 viewBox. Content sits inside about 2 units of padding (x and y from 2 to 22). Small parts such as a tail, a tusk or an arrowhead may touch the edge.
2. **Stroke:** one open-stroke `path` per glyph (several subpaths are fine). The stroke weight comes from the CSS: `--icon-stroke` 1.6 at glyph sizes 14–20, and `--icon-key-stroke` 2.2 on Stepper keys. The path never sets its own weight, fill or colour.
3. **Ends:** round caps and round joins (`stroke-linecap/linejoin: round`, set by the host CSS).
4. **Shapes:** simple outlines with no fills and no occlusion tricks. Where one shape stands behind another, only its visible part is drawn (`farrow`).
5. **Dots:** a dot is a zero-length segment (`h.01`), so the round cap draws it. That includes eyes, teats and the dot in `tag`. `more` remains the only glyph with filled circles.
6. **One pig:** every animal is one parametric body in [pig-family.mjs](pig-family.mjs): a stadium facing right, with a square snout, a pointed ear, two legs, a curled tail and an eye. Kinds and ages (sow, boar, gilt, piglet) can't be told apart at 16 px, so they share it and the word says which. A pig plus a sign is allowed only where the sign reads: a piglet under her (`farrow`).
7. **No library:** every path is hand-written here. Lucide and Tabler served only as references for common shapes such as the clock with a back arrow and the clipboard.
8. **Good enough or not at all** (owner, 2026-11-03). Every new glyph passes a blind naming test ([BLIND-TEST.md](BLIND-TEST.md)). A glyph that fails is not used: its meaning takes an icon that passed, or the word alone.
9. **One meaning per icon, used freely** (owner, 2026-11-03). An icon goes wherever its meaning applies; reuse a passing icon instead of keeping a weaker one or drawing a near-duplicate. **Never repeat an icon across the sections of the same page:** each section names a different thing.

## What to draw: 13 new glyphs, 5 redrawn (all passed the blind test; two borderline)

| Group | Glyph | Meaning | First uses |
|---|---|---|---|
| Animals | **pig** (redrawn) | A pig of any kind or age: sow, gilt, boar, piglet (the word says which) | Farrowing Details: *This litter*; Parity; Report death: *The sow*; Piglet processing and Foster actions; + born chip; Pig profile; Home: Piglet processing, Nursery |
| | **batch** (borderline) | A batch, such as "Batch 27": a stack of cards | *Against her batch*; Move to another farrowing batch; Batch membership; Pig profile: Batches |
| | **missing** | A missing pig: a dashed circle with a question mark | Drawn for Report missing (no screen yet) |
| Events | **service** | Service (breeding): ♀♂ | Home: Breeding section and task |
| | **return-heat** | Return-heat check | Home: Return-heat task (was the Undo arrow) |
| | **farrow** (redrawn, borderline) | Farrowing: a sow lying down, a piglet at her belly | Home: Farrowing; Open Farrowing |
| | **death** | A death (a headstone, no cross) | Death key, Died after birth, − died chip, Record piglet and sow deaths |
| | **truck** | Pigs leaving the farm | Home: Outbound pickups (was `send`) |
| | **sample** | Sampling | Home: Sampling tasks |
| | **count** | A count of animals | Reconcile piglet count |
| Records | **record** (redrawn) | A record: a clipboard | Litter summary, Task outcomes, Pig record |
| | **note** (redrawn) | A note: a sticky note | Pen and sow notes, Add a note |
| | **history** | Past records, the log | Home: Records; Farrowing Details: *Against herself* (her past litters); Pig profile: Log |
| | **tasks** | A list of tasks | Pig profile: Current tasks |
| | **chart** (redrawn) | Performance over time: a line on axes | Performance metrics, Averages, Base curve |
| | **undo** | Undo (the old `return` shape) | Farrowing: Undo; `return` becomes its alias |
| Places | **pen** | A pen (a fence) | Fault pen rows |
| Farm | **fan** | A fan (a device) | Home unit: fan controls (was `air`) |

- **Owner, 2026-11-03:** moving pigs uses the generic `transfer`, unchanged ("we are a farm application, it is obvious we are moving pigs"). Mark as breeder uses the existing `bookmark`. Humidity stays as it is.
- **Drawn and cut by the blind test or the owner's review:** never in the registry; listed in [BLIND-TEST.md](BLIND-TEST.md) and on the canvas's cut board.

## The look-alike pairs

| Was | Becomes |
|---|---|
| `chart` = `production` (bars) | `chart` is a line on axes; `production` keeps the bars. `signal` (status bar only) is a rising staircase |
| `farrow` = `pregnancy` (pulse) | `farrow` is a sow with a piglet; `pregnancy` keeps the pulse |
| `note` = `record` (page) | `note` is a sticky note; `record` is a clipboard |
| `up` = `back-chevron` | `up` becomes an alias of `back-chevron` |
| `return` | Becomes `undo`; the old name stays as an alias, so nothing breaks |

## The usage swaps

49 swaps in five files are listed in [swaps.json](swaps.json), each with its reason. The mock applies them in memory, and `node review/icon-round/swaps.mjs --write` applies them for the build.
- **Inspection:** icon names only (`'clock'` → `'sow'`, and so on). No logic changes.
- **Farrowing:** two action entries that had no icon get one (`Record abortion` and `Record sow death`). Everything else is a name change.
- **Fallbacks for cut icons:**
  - sow, gilt, boar, piglet, litter and foster → `pig`; group of pigs → `batch`;
  - abortion and not in pig → `pregnancy`; ear notch → `tag` (an identity mark); pain relief → `pill`;
  - units keep `grid`.
- **Home:** the task card takes the task's own icon (`t.icon`) instead of `production` for every card.
- **Left alone:** the old piglet full-task pages, `weaning.handoff` and the built `piglet-processing/simple/dist`.

## One meaning per icon

[meanings.json](meanings.json) lists every one of the 84 glyphs after the round, each with its one meaning and the screens that use it. The canvas shows it as the sheet, and the build copies it into the Icon README.

## Open questions (recommendation first)

1. **batch and farrow are borderline:** each matched its label, but reads weakly on its own. *Recommend:* use both. Each always sits beside its word, and the alternatives tested worse.
2. **missing has no screen yet.** *Recommend:* add it now for Report missing.
