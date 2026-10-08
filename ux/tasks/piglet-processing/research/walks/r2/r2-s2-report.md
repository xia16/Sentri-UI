**Walk report: scenario 2, tag and weigh day (worker)**
Head `dd44ca2`, branch `map/3-piglet-processing`, port 4952. I walked A02 on the tag farm, A04 on `?data=notch` and A07 on `?data=keepers`, at 390×844 (en), 360×740 and zh. I entered every state from the room list. Screenshots and scripts are in `…/scratchpad/walk/r2-s2/`, abbreviated below as `r2-s2/`.

### Findings

**F1. "More than 12? Set count" does nothing.** Class: change a slice (`id.html`).
- Step: A02, tag all 12 piglets.
- Screen: the entry page after the 12th piglet, with the line "All 12 alive identified · More than 12? Set count" (`r2-s2/b1-setcount.png`).
- I tapped the link. Nothing happened: no sheet, no navigation, same URL.
- I expected the Set count sheet. In `id.html`, `action:'set-count'` is set at line 312 but has no click handler.
- This is the only way out for a worker who finds a 13th piglet.

**F2. Record on an empty tag field records the greyed "next tag" as a real tag.** Class: change a slice (`id.html`).
- Step: A02, piglet 3, right after piglet 2 was recorded.
- The tag field shows a grey ghost `004303`. I pressed Record without typing a tag (`r2-s2/c1-empty.png`).
- It recorded a piglet with tag 004302 and no sex or weight, silently.
- On the first piglet, where there is no ghost, the same press correctly says "No tag yet". The ghost looks like a placeholder but it gets recorded.
- A worker who weighs, forgets the tag and taps Record writes a wrong fact.
- I expected Record to refuse, or the ghost to read "Use 004303" as an explicit tap. That "Use …" link exists in code (`numpad-suggestion`) but is hidden whenever a "Last … · Undo" line is showing.

**F3. A re-caught tag silently drops what you just entered.** Class: change a slice (`id.html`).
- Step: A02. I set Boar and 1.7 kg on the next piglet, then mistyped a tag already on piglet 2 (gilt, 1.3).
- The screen shows 004302 is piglet 2, the entered Boar and 1.7, and a button "Record · same piglet 2" (`r2-s2/18b-dup-after-weight.png`).
- Pressing it gave "Piglet 2 · nothing new". The Boar and 1.7 were discarded.
- Nothing before the tap says the entry won't be applied.
- On the notch farm the same case reads "118-2 again · piglet 2 · kept gilt · kept 1.25 kg" before you tap. The tag farm needs that wording.
- The route through "Different piglet?" and "Record · second 004302" works, and Backspace-and-retype works.

**F4. Fixing a wrong tag in Edit: the duplicate warning is hidden and the confirmation loses the old tag.** Class: change a slice (`edit.html`).
- Step: the table, tap 004302, tap Ear tag, backspace twice, type 03 so it becomes 004303 (already piglet 3).
- The tag pad leaves about 80 px of content visible. The warning "Tag 004303 is already on this litter · saves anyway" sits below that and is out of view (`r2-s2/21-dup-edit.png`).
- Save is enabled. The confirmation reads "Correction saved · 004303 tag → 004303" (`r2-s2/22-save-dup.png`). The "from" value is lost.
- The litter now has two 004303 rows. Only the edited one is amber; nothing marks them as duplicates.
- At 360×740 only the single "Ear tag 004301" row is visible above the pad, so you can't see what you typed except in that row (`r2-s2/97-edit360.png`).
- It is a correction, so "saves anyway" is acceptable. The warning needs to be visible and the receipt needs the real before and after.

**F5. The table header mixes "identified" with "in all".** Class: change a slice (`id.html`).
- Step: after saving a litter weight with Boars 3 and Gilts 2 on A02 with 4 piglets identified.
- The header reads "Identified 4 of 12 | Boars 3 | Gilts 2" and the receipt says "3 boars · 2 gilts in all" (`r2-s2/35-saved.png`).
- 3 + 2 is more than 4. The same thing shows with fixture `a02-tags-seven`: 7 identified, Boars 7, Gilts 5.
- After the 12th piglet in my run the header read "unsexed 12 | Boars 0 | Gilts 0" (first run: "Boars 6 | Gilts 6").
- Boars and Gilts are not the identified piglets' sexes, and the card doesn't say so.
- R1-23 "litter-weight receipt contradicts its tile" is partly fixed. The receipt is now honest but the header contradicts it.

**F6. The weigh-day litter weight is saved but never shown again.** Class: change a slice (`room.html` drawer and litter log).
- Step: weigh the litter (16.8 kg), Back to the drawer, open View log.
- The drawer summary still shows "Litter weight 15.2 kg", which is the birth weight, under the same label as the table's "Litter weight · day 3" (`r2-s2/t.js`).
- The log lists "2 identified · 004301–004302" but no weigh-day weight and no boar/gilt counts.
- A worker can't confirm the weigh happened.
- The table row does show "16.8 kg" once saved.

**F7. Weigh-day sheet: the numpad covers the boar/gilt steppers.** Class: change a slice (`id.html`).
- At 390 the "Boars not identified" stepper is half-clipped under the pad (`r2-s2/33-lw-4id.png`). At 360×740 the steppers are fully hidden. Only the strip "Boars and gilts · 10 not identified" and a bar with Save and Back remain (`r2-s2/96-lw360.png`).
- A "to-counts" action exists in code, but nothing visible tells you to use it.
- R1-23 "numpad hides counters" still broken.

**F8. 360×740: sex and weight can't be seen together on the new-piglet page.** Class: change a slice (`id.html`).
- The pinned pad leaves about 110 px, so one field shows and the other is clipped, for example "Weight Optional" with its box hidden (`r2-s2/92a-entry360.png`, `r2-s2/92b-scrolled360.png`).
- You scroll up for sex, down for weight, and the Ear tag row is pinned between them.
- In weight mode the page fits (`r2-s2/98b.png`). There is no horizontal overflow (scrollWidth equals clientWidth, 360).

**F9. Weighing before reading the tag hides the tag field.** Class: change a slice (`id.html`).
- Step: tap the Weight box first, which is the natural order with the pig on the scale (`r2-s2/99-390.png`).
- The Ear tag field disappears and the pad types weight. There is no "Back to tag", because that appears only once a tag has been typed.
- The only way back is pressing Record. It doesn't record; it says "No tag yet · scan or type it".
- It works but is not discoverable.

**F10. Room row doesn't show a half-finished identity.** Class: change a slice (`room.html`).
- Step: tag 4 of 12 piglets on A02, leave to the room (and reload).
- The row still reads "Iron · Dock tail · Tag · due today · 12 piglets". Rows A05 and C04 do say "8 still owed".
- Inside the drawer it is correct: "8 to identify", "Record identity · a piglet in hand · not saved".
- I do know where I was once I open the litter, but not from the list.

**F11. Room headline contradicts its own overview.** Class: change a slice (`room.html`).
- The headline card says "15 litters owe today" while the Task overview beside it says "13 owe today · 7 later" (`r2-s2/01-room.png`).
- Same on the zh screen.

**F12. Keepers farm, before the set is closed: the Identity row appears twice.** Class: change a slice (`room.html` drawer).
- Step: `?data=keepers`, open A07.
- "Identity · tag" appears under Day 3 · Due today and again under Day 3 · Recorded with a green tick. Both read "keepers · 9 tagged · close the set when done" (`r2-s2/80b-keepers-drawer-scroll.png`).
- After closing, it is correctly a single "Recorded · set closed" row.

**F13. Smaller points** (change a slice, `id.html`):
- On piglet 12 of 12 the button still says "Record · next piglet".
- After 12 of 12 the keypad stays live with no button.
- On the table at 12 of 12 the primary button is still "Record identity".
- Records tapped within 600 ms of each other are ignored. That is deliberate (`lastCommit`) and sensible for gloves, but there is no feedback. On the notch farm, with one-digit entries, I hit it as a silent no-op and my next digit appended to the old one ("5" then "6" became "56").

### Questions in the brief
- **Leave and come back:** work and position are intact.
  - Back keeps the rows and says "Record identity · 1 unsaved". The litter drawer reads "a piglet in hand · not saved".
  - Reload and reopening from the room restore the half-typed piglet: "00430 kept on this phone · not recorded yet".
  - This fixes R1-23's "interrupted piglet dropped silently" and the R1-24 draft loss on this page. It is already handled apart from F10.
- **Duplicate tag, same litter:** handled, apart from F3 and F4.
  - It offers re-catch or "Different piglet?" (R1-23 same-litter and N7 fixed).
  - Undo works: "Withdrew 004305 · back on the pad to fix".
- **Cross-litter duplicate:** flagged ("271002 is already on crate B06 · records anyway") and carried as "also on B06". The notch farm does the same ("118-7 is already on crate B02"). R1-23 is fixed.
- **Weigh the whole litter once:** it works (Weigh day sheet, "Saved · 16.8 kg …"), apart from F5, F6 and F7.
- **Notch farm:** no Scan button; multi-digit numbers work; the re-catch hint is the best wording (F3); 0 or 99 gives a range hint, so "notch 99 refused silently" is fixed.
- **Keepers-only farm:**
  - The "close the set" dialog works ("Done tagging? 9 tagged · the other 5 need none · Edit reopens it").
  - Close then reads "Identity done · set closed at 9 · 10:31 · G.H".
  - Fixed: "so far" after closing. Open: F12.

### Round 1 status
- R1-1 (identity page takes no taps): fixed.
- R1-23 numpad hides counters: still broken (F7).
- R1-23 litter-weight receipt vs tile: header still mismatches (F5).
- R1-24 draft on Back: fixed here.

### New scenarios discovered
- The 13th piglet or a recount in the middle of tagging (F1). Class: change a slice (`id.html`).
- Tagging by a sequential run (ghost "next tag"). The ghost must never be accepted by an empty Record (F2). Class: change a slice (`id.html`).
- Weigh-first order, with the piglet on the scale before the tag is read (F9). Class: change a slice (`id.html`).
- Correcting a duplicate tag after the fact needs a visible warning and a before/after receipt (F4). Class: change a slice (`edit.html`).
- A weigh-day litter weight needs to appear in the drawer and the log (F6). Class: change a slice (`room.html`). I did not test a weigh day other than day 3, so N8 is still open.

### What worked well
- The draft survives Back and reload and is surfaced on both the table and the drawer.
- The re-catch and "Different piglet?" model, and the cross-litter duplicate flag.
- The weight plausibility guard: "Outside the usual 1.0–2.8 kg at day 3 · Record anyway".
- The keypad disables past 6 digits, and the pad shows 5 of 6 digits.
- The tag/notch/keepers wording is correct per farm.
- zh renders fully.
- Visually the pages match the farrowing skeleton: lone filled Back, dock, drawer.