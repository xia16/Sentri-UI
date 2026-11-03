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
- `humidity` and `drop` are the same drop.

## The drawing rules (taken from the current set)

1. **Grid:** a 24 × 24 viewBox. Content sits inside about 2 units of padding (x and y from 2 to 22). Small parts such as a tail, a tusk or an arrowhead may touch the edge.
2. **Stroke:** one open-stroke `path` per glyph (several subpaths are fine). The stroke weight comes from the CSS: `--icon-stroke` 1.6 at glyph sizes 14–20, and `--icon-key-stroke` 2.2 on Stepper keys. The path never sets its own weight, fill or colour.
3. **Ends:** round caps and round joins (`stroke-linecap/linejoin: round`, set by the host CSS).
4. **Shapes:** simple outlines with no fills and no occlusion tricks. Where one shape stands behind another, only its visible part is drawn (`pigs`, `litter`).
5. **Dots:** a dot is a zero-length segment (`h.01`), so the round cap draws it. That includes eyes, teats and the dot in `tag`. `more` remains the only glyph with filled circles.
6. **One family:** every animal comes from one parametric body in [pig-family.mjs](pig-family.mjs): a stadium facing right, with a square snout, a pointed ear, two legs, a curled tail and an eye. Only what reads at 16 px may differ: size (piglet), a second pig behind (pigs), a sign beside it (missing ?, breeder flag), a piglet under it (farrow).
7. **No library:** every path is hand-written here. Lucide and Tabler served only as references for common shapes such as the clock with a back arrow and the clipboard.
8. **Good enough or not at all** (owner, 2026-11-03). Every new glyph passes a blind naming test ([BLIND-TEST.md](BLIND-TEST.md)). A glyph that fails is not used: its meaning takes an icon that passed, or the word alone.
9. **One meaning per icon.** A new screen that needs a meaning with no glyph gets a new glyph, never a borrowed one.

## What to draw: 16 new glyphs, 6 redrawn (all passed the blind test)

| Group | Glyph | Meaning | First uses |
|---|---|---|---|
| Animals | **pig** (redrawn) | A pig of any kind: sow, gilt, boar, finisher | Farrowing Details: *Against herself*; Parity facet; Report death: *The sow*; Pig profile: title, General details, Basic information, *Sow & cycle* |
| | **piglet** | A piglet, or piglets as a subject | Piglet processing and Foster piglets actions; *This litter*; + born chip; Home: Piglet processing task, Nursery section |
| | **pigs** | A group of pigs: a batch | *Against her batch*; Move to another farrowing batch; Batch membership |
| | **missing** | A missing pig | Drawn for Report missing (no screen yet) |
| | **breeder** | Marked as a breeder | Drawn for Mark as breeder (no screen yet) |
| Events | **service** | Service (breeding) | Home: Breeding section and task |
| | **return-heat** | Return-heat check | Home: Return-heat task (was the Undo arrow) |
| | **farrow** (redrawn) | Farrowing: a sow lying down, a piglet at her belly | Home: Farrowing; Open Farrowing |
| | **death** | A death (a headstone, no cross) | Death key, Died after birth, − died chip, Record piglet and sow deaths |
| | **move** | Moving pigs into another pen (an arrow into a fence) | Transfer, Pig transfer tasks; `transfer` becomes its alias |
| | **truck** | Pigs leaving the farm | Home: Outbound pickups (was `send`) |
| | **sample** | Sampling | Home: Sampling tasks |
| | **count** | A count of animals | Reconcile piglet count |
| Records | **record** (redrawn) | A record: a clipboard | Litter summary, Task outcomes, Pig record |
| | **note** (redrawn) | A note: a sticky note | Pen and sow notes, Add a note |
| | **history** | Past records, the log | Home: Records |
| | **tasks** | A list of tasks | Pig profile: Current tasks |
| | **chart** (redrawn) | Performance over time: a line on axes | Performance metrics, Averages, Base curve |
| | **undo** | Undo (the old `return` shape) | Farrowing: Undo; `return` becomes its alias |
| Places | **pen** | A pen (a fence) | Fault pen rows |
| Environment | **humidity** (redrawn) | Air humidity: a drop over waves | Sensors |
| | **fan** | A fan (a device) | Home unit: fan controls (was `air`) |

Drawn and cut by the blind test (never in the registry; listed in [BLIND-TEST.md](BLIND-TEST.md)):
- sow, gilt, boar, litter, foster, wean;
- pregnancy (three drawings), not-pregnant;
- notch, pain, room, production (redraw);
- ear tag, pig face, backfat, body condition, AI catheter, ultrasound.

## The look-alike pairs

| Was | Becomes |
|---|---|
| `chart` = `production` (bars) | `chart` is a line on axes; `production` keeps the bars. `signal` (status bar only) is a rising staircase |
| `farrow` = `pregnancy` (pulse) | `farrow` is a sow with a piglet; `pregnancy` keeps the pulse |
| `note` = `record` (page) | `note` is a sticky note; `record` is a clipboard |
| `up` = `back-chevron` | `up` becomes an alias of `back-chevron` |
| `humidity` = `drop` | `humidity` is a drop over waves; `drop` stays for vitamins and the udder |
| `transfer`, `return` | Become `move` and `undo`; the old names stay as aliases, so nothing breaks |

## The usage swaps

49 swaps in five files are listed in [swaps.json](swaps.json), each with its reason. The mock applies them in memory, and `node review/icon-round/swaps.mjs --write` applies them for the build.
- **Inspection:** icon names only (`'clock'` → `'sow'`, and so on). No logic changes.
- **Farrowing:** two action entries that had no icon get one (`Record abortion` and `Record sow death`). Everything else is a name change.
- **Fallbacks for cut icons:**
  - sow, gilt and boar → `pig`; litter and foster → `piglet`;
  - abortion and not in pig → `pregnancy`; ear notch → `tag` (an identity mark); pain relief → `pill`;
  - units keep `grid`.
- **Home:** the task card takes the task's own icon (`t.icon`) instead of `production` for every card.
- **Left alone:** the old piglet full-task pages, `weaning.handoff` and the built `piglet-processing/simple/dist`.

## One meaning per icon

[meanings.json](meanings.json) lists every one of the 86 glyphs after the round, each with its one meaning and the screens that use it. The canvas shows it as the sheet, and the build copies it into the Icon README.

## Open questions (recommendation first)

1. **Home "Other" heading** uses `transfer` (now `move`), because most Other items are moves. *Recommend:* keep it until Other has a mix of jobs, then use no icon.
2. **missing and breeder have no screen yet.** *Recommend:* add them now. Both passed the test, and Report missing and Mark as breeder need them next.
3. **One pig for every kind.** sow, gilt and boar can't be told apart at 16 px, so the word carries the kind. *Recommend:* keep it that way. Don't add a bigger icon size for animals.
