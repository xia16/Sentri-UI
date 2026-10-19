# Conditions 病症

Status: **skeleton for review** (2026-10-17). Built inside Inspection's prototype (`ux/system/inspection-astra-concept.js`),
on the Medicines branch (PR #192). Replanned with the owner the same day: Actions, a Selected page, the count of pigs without ear tags
chosen at selection, and Record health as a page of fields like Record treatment.

## Problem

A worker on the pen walk tags pigs with what is wrong. Today's catalogue is two separate trees, 60 diseases by body system
and 59 symptoms by a mix of body area, body system and "general appearance". The first tap asks "disease or symptom?"
before showing anything; the same thing appears twice (nasal discharge, joint swelling, rectal prolapse); items sit in one
place only (PRRS under respiratory, never under reproduction); injuries and defects are filed as diseases. Pigs without an
ear tag have nowhere to carry a condition.

Research (`reports/Pig health observation data model.md`): every symptom tool starts from what the user notices; vets
diagnose and prescribe in China, the US and the EU/UK; any keeper must act on *suspicion* of a reportable disease; on farm
the pen is the unit for coughing and scours in growing pigs, and workers think in barn names, not body systems.

## The flow

Inspection list → tick pigs, a pen or a group row → dock "N pigs selected ›" + **Actions** (pencil icon) → **Disease or
symptom** → **Record health**, a page of fields like Record treatment: Conditions, Care, Note (optional); no pig list;
`Save · n` → Conditions picker (one drawer with levels: footer Back goes up, ✕ closes, Done · n applies) → Save → the tags
on the rows.

- "N pigs selected ›" opens the **Selected** page (not a drawer): Pens, Pigs, then Without ear tags, each untickable, with Clear
  selection; Back returns to Record health or the list, so the selection is edited in one place.
- **Actions** page holds **pig actions only**: no Pigs / Pens switch, no bottom Health / Routine bar. A pen's own actions
  (note, feed guidance, log) live on its pen page, through the header's › (owner, 2026-10-18). Feed-plan's "Actions for
  several pens" is now an earlier design.
- Ticking a pen is a quick way to tick all its pigs and its group row: the header keeps its colour, only its checkbox
  ticks; the rows it ticks take the row tint.

## What is new

**Words (owner, 2026-10-18).** "Tag" on its own only ever means a condition tag. A pig's identifier is its **ear tag**
(耳标) or ID. A group of pigs without ear tags is named by its count, **14 pigs** (14 头), after a struck-tag icon; where
the words stand alone (a heading, the picker, a screen reader) it is **without ear tags** (无耳标). Never "No tags" or
"untagged".

1. **The group row.** A pen with pigs without ear tags has one more row, always last, after its pigs (sorted by ID
   number): the struck-tag icon and `14 pigs` where a pig row has its ID, its conditions on one line under it with how
   many pigs have each (`Coughing · 3`, folding into +N). Same height as a pig row. It ticks like a pig; ticking the pen
   ticks it too. The pen header counts all its pigs (`D4 · 16 pigs`). With only the group row ticked, Actions offers
   Disease or symptom alone (the other health actions need individual pigs).
2. **How many — on the row.** The row's right side is always a number field (44px), so the count is visibly editable and
   the row never changes height. Idle it shows the group size in grey; tapping it brings the phone's number pad with the
   number selected, so the first digit replaces it. A number above 0 ticks the row, 0 unticks it, the field caps at the
   group size, and ticking the pen fills in all of them. The count is on the row, the dock (`16 pigs selected`), the
   Selected page (pen rows include it) and Save (`Save · 5 pigs`).
3. **The Conditions picker body.** One catalogue, three kinds: symptom (what you see), event (prolapse, hernia, tail
   bitten), disease. Each item exists once, in English and Chinese, with other names for search.
   **Not conditions (owner, 2026-10-19):** a death is **Report death** (its own record); an abortion is the sow's breeding
   record (**Record abortion**); what a pen shows as a whole (coughing heard, scours on the floor, huddling or piling,
   eating or drinking less, tail biting going on) is a **pen observation**: "How the pen looks" on the pen page, a
   multi-pick drawer like Pen note, no count and no pigs, shown on the pen page and in the pen log.
   - First level, for everyone: search, **On these pigs** (tag icon; what the selection already has, with who),
     **Recent** (clock), then two sections, one under the other (owner, 2026-10-18):
     **Symptoms** (heart): the groups by where you look: Whole animal, Breathing, Head, Skin, Legs and feet, Rear and belly.
     **Diseases** (medical cross): the six body systems, each opening its diseases in one tap. Sections, not tabs: with six and six rows both fit one scroll,
     search covers everything, and a tab would hide diseases from a worker who doesn't know to look.
   - A symptom with types opens a level of its types plus "Not sure which": Diarrhoea (watery, yellow, bloody, black),
     Skin colour, Lame, **Off feed** (eating less, not eating), **Nasal discharge** (clear, thick or yellow, bloody),
     **Vaginal discharge** (white or yellow, bloody), **Tail bitten** (scratched, open wound, infected). A type only where a
     worker can see the difference and it changes what the vet suspects or what happens next. A typed item reads
     `Diarrhoea (watery)`, so " · " only ever separates conditions in a field.
   - **Add condition**, as Add medicine (features/medicines): a search with no match shows one card, `Add "…"`. It opens
     **Add a condition**: Name (pre-filled) and **Category** (required, one pick from Symptoms and Diseases, so the kind is
     chosen with it: `Symptom · Breathing`, `Disease · Respiratory`; already set when added from inside a level). Back,
     Add. Adding lists it for the farm, ticks it and opens its level. Anyone may add a symptom or a disease.
   - Barn words lead: **Fever** (发热), with "hot to the touch" and "temperature" as search names.
   - Medicines' group headings take the same icons (Recently used: clock; Categories: grid).
   - Diseases by body system (Denmark's six VetStat groups); a disease can sit under two (PRRS: Respiratory and
     Reproductive), one tick.
   - **One disease list (owner, 2026-10-19).** No separate Report a disease and no "ASF?" copies: a reportable disease
     (China: ASF, FMD class 1; CSF, PRRS, PED class 2) stays in its system with "Reportable" on its second line, and on a
     pig's row it leads the tags at the act level. A disease a worker tags is a suspicion until a vet confirms it (the
     certainty, not in this skeleton). What saving a reportable disease starts is Q4.
   - **First level rows (owner, 2026-10-19):** the Actions row inside the drawer's ChoiceList card: an icon tile, the area,
     and a line of examples that says what is inside ("Coughing, breathing hard, sneezing"; "1 selected" once something
     inside is ticked). Ten body-area icons joined the registry; Breathing and Respiratory share the lungs, Whole animal
     and Whole body the pig. Tiles were tried and set aside: no room for the examples, long names wrap.
   - Sow-only symptoms are hidden for growers.
4. **Tag order on a row.** One line, the first never hides, the rest fold into +N.
   - by care level first (act, watch, ongoing: the approved animal row);
   - inside a level, a suspected reportable disease first, then a disease, then symptoms;
   - **a disease folds the symptoms it explains** (PRRS hides Coughing on that pig or group row);
   - one tag per symptom: Diarrhoea and Diarrhoea (bloody) are one tag (Scours), at the more urgent care level; a row shows
     the short name, the type stays on the record.

## Not in this skeleton

The stop-and-report record (banner, Report instead of Save), editing and resolving a tag, the disease certainty after a lab
result, linking a treatment to a tag, Chinese copy review with 饲养员, the Link condition picker in Record treatment (still
the old catalogue).

Known, not new: entering a picker level keeps the last level's scroll; PR #183 fixes it in the component.

## Questions

- ~~Q1. Who may tag a disease?~~ Answered (owner, 2026-10-18): anyone may tag and add a disease; the role switch is gone.
- **Q2. Folding:** automatic from the disease's typical signs (as drawn), or only the symptoms the vet links?
- **Q3. Group counts over time:** a later record replaces the count (as drawn), or adds?
- **Q4. Reporting:** a condition tag plus a stop-and-report record, or a separate alert outside Conditions?
