# Glossary

Every count and identity a task shows, defined once as **entity · population · time · scope**. A screen that prints a number uses the word below and no other; a number whose four parts differ from its label's definition is a bug in the screen. Sources: `ux/research/farrowing/RULINGS.md` (farrowing sections and *Piglet processing*).

## Piglet processing (仔猪处理)

The litter ledger, at all times: `Alive = Born − Dead − Moved out + Moved in ± Unexplained − Weaned`. Born never moves in processing.

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Born** 出生 | piglets | every piglet born to the sow, live and dead, at birth | fixed at the farrowing lock; changes only by an amended Edit | one litter. Never changed by processing |
| **Alive** 存活 | piglets | piglets currently in the litter: the ledger's result | now, from the latest stamped records | one litter, one crate |
| **Dead** 死亡 | piglets | piglets recorded dead in that litter, farrowing deaths and processing deaths together | cumulative since birth, each stamped | one litter |
| **Moved in** 转入 / **Moved out** 转出 | piglets | piglets a Move record added to or took from this litter | cumulative since birth, each stamped | one litter; a Move changes both litters in one record, across rooms too |
| **Unexplained gain** 不明增加 / **Unexplained loss** 不明减少 | piglets | the difference a Count writes between the number seen and the ledger's Alive | stamped when the count is recorded; stays **open** until explained | one litter. Each is its own item, never netted against another |
| **Open / explained** 未解释 / 已解释 | an unexplained gain or loss | open: no death or move accounts for it; explained: a death (the dead picker asks "one of the 2 missing?") or a Move the worker confirmed accounts for it | until explained; open items show on the room header and as a console anomaly | one litter; the app never pairs by itself |
| **Open unexplained loss** 不明减少 / **open unexplained gain** 不明增加 (room) | heads | sum of the room's litters' open (unexplained, not yet explained) losses, and separately of open gains | now | one room; printed as two figures beside net drift (`pp.room.loss_open`, `pp.room.gain_open`) |
| **Net drift** 净差 | heads | open unexplained gains minus open unexplained losses; explained items are history and drop out | now | one room; shown beside, never instead of, the open gain and loss lines |
| **Owed** 待处理 | piglets | live piglets still needing one scheduled dose: not treated, not exempt. Includes missed piglets: a missed piglet is still owed | now; from the dose's due day-age to task end (late stays owed and counts late) | one litter per scheduled dose. Iron day 3 and iron day 14 are two obligations |
| **Unfinished litters** 未完成的窝 | litters | litters that, when End task runs, have identity work not done under the farm's configured done rule (all alive identified, or the closed candidate set) or any unfulfilled scheduled dose | frozen at End; later corrections still write, stamped, but do not change this snapshot | one batch; unit: litters |
| **Unfinished piglet-doses** 未完成的头次 *(provisional, map ledger)* | piglet × scheduled dose | every configured scheduled dose not fulfilled that End makes unwritable, including doses not yet due; owed (with missed inside it) plus the not-yet-due | frozen at End, as above | one batch, broken down by litter and dose; unit: piglet-doses (头次) |
| **Treated** 已处理 | piglets | piglets a Record marked as having received the dose, plus treatment evidence carried into this litter by a Move (keeps the source mark's provenance: who, when, source crate) | stamped when recorded (early counts on time); carried evidence keeps its original stamp | one litter per scheduled dose; a Record snapshots the console's product and dose on the mark |
| **Treatment unknown after move** 转入后处理未知 | piglets | moved-in piglets whose invisible treatment (iron, toltrazuril, vaccines, 保健) the worker answered "Don't know" for | from the Move until resolved by recording the dose or marking "already had" | receiving litter, per invisible treatment (`1 arrived · iron unknown`) |
| **Possible double treatment** 疑似重复处理 | one collision | the same litter × scheduled dose with two or more records from different devices or hands, all kept and never merged | flagged at sync; stays until a hand resolves it through Edit | one litter per dose; the UI counts collisions, not records |
| **Skipped: deferred** 暂缓 | piglets | piglets the worker skipped for a passing reason (weak, sick) | until done or task end; still owed | one litter per dose; shows next visit |
| **Skipped: exempt** 免除 | piglets | piglets skipped for a lasting reason (hernia, cryptorchid, kept boar) | permanent; leaves the obligation | one litter per dose; hernia and cryptorchid also become a litter note |
| **Missed** 已过处理期 | piglets | the displayed subset of Owed that is past the treatment's console "last age-day" (window-bound treatments only, e.g. teeth d7, toltrazuril d7; iron has none); shown as missed, not overdue | from the day after the last age-day | one litter per dose; never outside Owed |
| **Castrated / not castrated** 已阉割 / 未阉割 | male piglets | castrated: 阉割 done; not castrated is split by reason (hernia, cryptorchid, deferred, kept boar). The two together are the male count; only deferred stays owed | stamped when recorded | one litter |
| **Identified** 已标识 | alive piglets | alive piglets with a current, non-withdrawn identity row (notch or tag; either identifies) | as of the latest stamped change, editable after entry and after End | one litter; on a farm configured with the *candidates* scheme it is shown as *identified so far* until the worker closes the candidate set |
| **Identity rows on record** 标识记录 | identity rows | every current, non-withdrawn row, including those of piglets since dead; the historical population, never counted as Identified | as of the latest stamped change | one litter |
| **Identified so far** 已标识（当前） | piglets | alive piglets with a notch or tag on a candidates farm before the candidate set is closed; no denominator, so nothing is "unidentified" yet | now | one litter |
| **Unidentified** 未标识 | piglets | alive piglets without a notch or tag, defined only for all-piglet schemes, or for a candidate set the worker has closed | now | one litter |
| **Identity done** 标识完成 | the litter | scheme *all*: every alive piglet is identified. Scheme *candidates*: the worker closes the candidate set, and `9 of 20 identified — done` is complete; the other 11 are not overdue | when the worker closes the set, or when the last alive piglet is identified | one litter; the scheme is farm config (none, notch, tag, notch-then-tag) |
| **Litter weight** 窝重 (weigh day) | the litter as it stands on the weigh day (alive piglets) | total weight; optional | the weigh day's day-age | one litter. Unit kg. Never blocks a row |
| **Birth litter weight** 初生窝重 *(provisional, map ledger)* | live-born piglets of this farrowing, weighed together (alternative not chosen: all born incl. stillborn) | total weight, farrowing's optional fact at Finish | at farrowing Finish | one litter. Unit kg. Not used in any per-piglet calculation until the owner rules the population. Processing records it only when missing, with no nag |
| **Day-age** 日龄 | the litter | days since the litter's birth date, birth day being day 0 | now | one litter; every scheduled dose is due at a day-age. Unit: days, printed `day {n}` |

### Identity and weigh (S4 · `pp.id`)

Terms the identity run, the litter's identified-piglets table and the weigh-day drawer print. *Identified*, *Identified so far*, *Identity rows on record*, *Identity done* and *Litter weight* above are used unchanged; the screens say *identified piglets* and *records*, never "rows".

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Identity record** 标识记录 (screen: *records*) | one piglet's identity | a tag **or** a notch (litter number + piglet number, `118-4`), with optional sex and weight; committed one at a time by `Record · next piglet`, stamped (who · when); a fact added later by a re-catch restamps the record with that commit, the first identification kept in its history | from its Record; viewable and editable after entry and after End task; a mistaken record is withdrawn by a stamped act (the run's `Undo` for this visit's newest one, Edit otherwise), never deleted | one litter. `11 records · 1 dead` counts every current record, dead piglets' included (= *Identity rows on record*) |
| **Piglet i of n** 第i头，共n头 | the run's position | i = identified + 1 (distinct identities of alive piglets with a current record — a same-tag pair counts once); n = the litter's Alive. On a candidates farm the label is `Keeper i`; past Alive there is no n (`Piglet 13 · ear tag`) | now | one litter, one run |
| **n identified · m alive** 已标识n头 · 存活m头 (amber) | alive piglets' records | shown when current records of living piglets exceed Alive; the excess is **records over alive** | now, until a record is withdrawn or linked in Edit, or the count is set | one litter |
| **Records over alive** 记录比存活多 | identity records | current records of living piglets − Alive; includes a **same tag twice** pair (two hands tagging one piglet offline), shown as an amber pair and never merged | now | one litter; resolved in Edit (S8): withdraw one, or link two records as one piglet |
| **Boars** 公仔猪 / **Gilts** 母仔猪 | alive piglets | identified piglets recorded boar (gilt), plus the residual weigh-day count for piglets **not identified**: each record identified after the counts were saved consumes its own bucket (a boar record a boar count, a gilt a gilt); an unsexed record consumes the pool, and when that makes the split unknowable it prints `split unresolved`. Residuals are clamped to Alive − Identified, so the total never passes Alive. A record with no sex counts in neither (`unsexed 1`) | now; counts are stamped by Save in the weigh-day drawer | one litter |
| **Not identified** 未标识 | alive piglets | Alive − Identified: the piglets the boar and gilt counts may describe | now | one litter; the counts' ceiling |
| **Litter weight · day n** 窝重 · n日龄 | the litter's alive piglets, weighed together | one record per weigh day; a second weighing the same day replaces the day's value (the later stamp stands; the ledger keeps both) | the weigh day's day-age | one litter; older days stay as their own records; a wrong one is withdrawn in Edit |
| **Refused litter weight** 拒绝记录的窝重 | one typed value | a value physically impossible for the litter: over 6 kg per alive piglet (`over 72 kg for 12 piglets`). Only this refuses; outside the usual range (`Usual 12.0–33.6 kg`) only warns | at Save | one litter |
| **Candidate set closed** 候选已关闭 | the litter's keepers | the distinct identities tagged when the worker recorded `Record 9 tagged · rest need none`; the count and stamp are stored at close, never recomputed | from the close until Edit reopens it (stamped); while closed no record can be added; closing waits while records exceed alive or a same-tag pair is open | one litter, candidates farms |
| **Duplicate tag** 耳标重复 | one tag or notch value | a tag (or notch) already on a current record of **another** litter; warned where it is used (`also on B04`), recorded anyway, never merged. On this litter's dead piglet it says `a dead piglet here` | at entry, or at sync for an offline entry | farm-wide |
| **Caught again** 再次抓到 | one piglet | a tag or notch already a current record of **this** litter; Record adds only the facts that record lacks (`kept boar · adds 1.4 kg`) and makes no second record; a differing value stays, with `Edit piglet i` | during the run | one litter |

Defined by farrowing and used here unchanged (RULINGS *Model*; the Finish sheet):

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Weak** 弱仔 / **Deformed** 畸形 | piglets | alive piglets of this farrowing classified by the hand at Finish (optional earlier) | committed per tap at Finish; amendable through Edit | one litter |
| **Healthy** | piglets | alive − weak − deformed; derived, no form row, printed on the record | as Weak / Deformed | one litter |
| **Weaned** 断奶 | piglets | piglets that left the litter at weaning; the last term of the ledger | stamped at weaning | one litter |

## Dead picker (slice 9)

The one shared dead drawer (farrowing, farrowing record, check-in, processing). It forks on the litter's phase (open · locked), not on the task. Counts in it use Alive and Dead above unchanged. Contract: `ux/tasks/piglet-processing/dead-contract.md`.

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Dead N** (drawer title) 死亡 N头 | piglets | the litter's Dead plus the bodies in this drawer's draft | now; the draft part is unsaved until Save | one litter |
| **Unsaved** 未保存 | piglets | bodies in the drawer's piglet draft: not-identified tallies plus picked identified piglets (the sow's draft is `sow cause unsaved`, never counted here). Back keeps them on the device; Clear discards them | from the first tally until Save or Clear | one litter, one device |
| **Born dead** 出生即死 | piglets | stillborn + mummified recorded by farrowing; printed on the drawer's context line after the lock, because those two causes leave the list there (a born-dead body found later is Born's correction, through Edit) | fixed at the farrowing lock | one litter |
| **Identified** 已标识 (in the picker) | alive piglets | the litter's live identity rows (tag or notch) with no death; each is picked by its tag, or its notch when it has no tag, and dies against that row | now | one litter |
| **Not identified** 未标识 (in the picker) | alive piglets | Alive − Identified; tallied by cause | now | one litter |
| **The N missing** 少了的N头 | piglets | Σ of the litter's open unexplained losses (see *Open / explained*) | now | one litter |
| **From the missing** 来自少了的N头 | piglets | how many of this draft's not-identified bodies were among the missing; drawn from the open losses oldest first, so they leave the loss, not Alive. Never an identified piglet | at Save | one litter |
| **Tally cap (locked)** | piglets | Not identified + the N missing: the most not-identified bodies one draft can hold after the lock | now | one litter |

## Edge litters (slice 14)

Terms for the litter faces that differ from the ordinary litter sheet. Counts on these faces use the terms above unchanged (Born, Alive, Dead, Owed, Birth litter weight).

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Litter outside a task** 无任务的窝 | the litter | a real litter that no processing task covers (late farrower, re-entered sow). Deaths, counts and moves are recordable; treatments are not | now | one litter. Which task it should join is open (map question Q33) |
| **Orphan litter** 孤儿窝 | the litter | a litter whose sow died after farrowing was locked; it keeps its schedule and stays in the task. Alive is the ledger's Alive, unchanged by the death | from the sow's death | one litter; the red `sow died` word and band come from farrowing's Done-register grammar |
| **Orphan litter, sow died mid-farrowing** 分娩中母猪死亡的窝 | the litter | a litter whose sow died before Finish: her session ended without a lock, so Born is derived (counted at her death, never locked) and no birth litter weight was asked | from the sow's death | one litter |
| **Litter before lock** 未锁定的窝 | the litter | a litter whose farrowing session is still open: Born is not final, so processing prints Alive and Dead only, with `count still open`. Count changes and deaths are recorded on the farrowing sheet; owed treatments are recorded here | until the farrowing lock | one litter |
| **Owed line** `{n} piglets owed · due day {d}` | piglets | Owed (above) for one dose, with the day-age it falls due (`due day`, so it never reads as the litter's age) | now | one litter per dose |
| **Owed after an earlier mark** `{n} piglet owed · born after the mark` 标记后出生 | piglets | on a litter before its lock, a treatment mark records the heads counted at tap time (stored, never recomputed); piglets born after the mark raise that dose's Owed by their number, and a later count change does not falsify the mark | from the tap until the dose is recorded for them | one litter per dose |
| **Live-born weighed** `{n} live-born piglets weighed at birth` | piglets | the live-born piglets of this farrowing, weighed together: the provisional population of Birth litter weight. Born = live-born + stillborn | at farrowing Finish, or when processing records it while missing | one litter |

## Litter sheet (slice 6)

The ordinary litter face: what one litter owes today and what has been recorded on it. Counts use the terms above unchanged (Born, Alive, Dead, Owed, Treated, Skipped: deferred / exempt, Missed, Castrated / not castrated, Possible double treatment, Identified).

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Treatments left today** `{left} of {total} treatments left` 剩{left}项处理，共{total}项 | scheduled doses | left: doses due at or before today (late and missed included) whose owed is above 0; total: every dose due at or before today. Identity is not a dose here (S4 owns it) | now | one litter; unit: treatments (doses), never piglets |
| **Owed (stored)** 待处理 | piglets | a count stored per scheduled dose: every live piglet until the first record; then the last record's deferred piglets (castration: its deferred males); moved-in piglets that owe it raise it. Shown as `min(owed, alive)`, so a death lowers the shown number only when owed would exceed alive | now | one litter per dose |
| **Owed line** `due day {d} · {n} owed`; `late {k} days · {n} owed`; `missed after day {d} · {n} owed`; `{n} owed · deferred: weak` | piglets | the shown Owed for one dose. `late {k} days`: k = the litter's day-age − the dose's due day-age (k is red, the word ink). `missed after day {d}`: d = the dose's last age-day (d is red) | now | one litter per dose |
| **Record {n}** 记录{n}头 | piglets | the one-tap population: the shown Owed for that dose. **Count-grammar exception (en):** the unit is dropped (`Record 12`, not `Record 12 piglets`) because `Coccidiosis treatment` plus `Record 12 piglets` truncates at 360px; zh keeps its classifier (`记录12头`). The row's line 2 carries the unit word (`12 owed`) | the tap; stamped | one litter per dose. Castration has no one-tap until its first record (males unknown) |
| **N unsaved** `1 unsaved` 1条未保存 | drafts | a drawer draft left by Back for this dose; while it waits the row's one-tap is replaced by `Resume` | until saved or cleared | one litter per dose |
| **Treated** (drawer) `of {n} owed` 已处理 · 共{n}头待处理 | piglets | the piglets this record treats; starts at the shown Owed and only comes down | the record being drafted | one litter per dose |
| **Not treated** `{n} not treated · why?` | piglets | shown Owed − Treated in this record; one reason for all of them. Weak and sick defer: they stay owed and show next visit | the record being drafted | one litter per dose |
| **Males** `{n} males` 公猪 | male piglets | first castration: castrated + every not-castrated reason, derived, never entered up front; `No males` records castrated 0 and nothing owed | the record being drafted; printed as `castrated 5 · not castrated 1: hernia` | one litter |
| **Males owed** `{n} males owed` 公猪待阉割 | male piglets | the stored owed of castration: the last castration record's deferred males. A catch-up works on these only: castrated + exempt + deferred must equal it; earlier exemptions and notes stand | now | one litter |
| **Receipt** `Saved · iron · day 3 · 12 piglets` | piglets | the change the last record made on this phone (piglets it treated, in green), never the litter's total; `· 2 deferred` counts that record's deferred piglets. `Nothing recorded · … · now 2 owed`: a tap whose label no longer matched the current owed | the last record on this phone | one litter; the Owed heading's count owns the total |
| **early / late / after day {d}** (a record) 提前 / 迟做 / {d}日龄后 | one record | early: the record's day-age is before the dose's due day (counts on time); late: after it (counts late); after day d: past the dose's last age-day (counts late) | the record's stamp | one record |
| **Possible double treatment** (litter sheet) 疑似重复 | records | two records of one dose written without either seeing the other (a sync collision); both kept, never merged. Never inferred from treated > alive | flagged at sync, until resolved in Edit | one litter per dose |
| **Product snapshot** | one record | the console's product and dose at the moment of the record, stored on it and printed from it; a later console change never rewrites it | the record's stamp | one record |
| **Litter note** 窝备注 | piglets | not castrated for hernia or cryptorchid, from the castration record | the castration record's stamp | one litter |
| **Fact line** `Born 13 · Alive 12 · Dead 1 ›` / `day 3 · born Sep 26` | piglets / the litter | the three ledger numbers above and the day-age; the line is the door to the litter's record page | now | one litter |
| **Identify line** `notch · {k} of {n} identified` | alive piglets | Identified of Alive, on an all-piglet notch farm | now | one litter; the door to S4 |

### Move (slice #11, `move.html`)

Counts the Move sheet, its receipt and the receiving litter print. A Move is one record that changes both litters (`12 → 10 · 9 → 11`); it opens only on a litter whose farrowing is locked or ended by the sow's death.

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Moved** 转移头数 (`Move 2 · B06 → B04`) | piglets | the piglets one Move takes from the source litter and adds to the receiving litter; untagged: a count; tagged: the ear tags picked | stamped at Save; one record | one Move, two litters |
| **Before → after** (`12 → 10`) | piglets | a litter's Alive just before and just after this Move, printed for both litters before Save and on the receipt | the moment of Save | one litter each side of one Move |
| **Arrived** 转入 (`1 arrived`) | piglets | piglets a Move added to this litter, while any treatment they brought is still owed, unknown or to check | from the Move until those items resolve | receiving litter, per Move (`from crate B09`) |
| **Owed (from a move)** 待处理（转入） | piglets | arrived piglets whose source had done none of a dose; they owe it here even when this litter is done for it (the litter goes back to due for them) | from the Move until recorded, skipped with a reason, or task end | receiving litter, per scheduled dose |
| **Arrive done** 已做，随猪带入 | piglets | moved piglets whose source had done a dose for every piglet; the evidence (who, when, source crate) travels with them and they do not owe it here | carried with its original stamp | receiving litter, per scheduled dose |
| **Check on the pig** 看猪确认 | piglets | arrived piglets from a part-done source for a visible dose (teeth, tail, castration, identity): no question is asked at the Move; the hand looks when recording | from the Move until resolved by quantity: `How many already had it?` (0…n); the rest recorded now or left owed | receiving litter, per visible dose |
| **Unknown — check spray mark** 情况不明 — 查看喷漆标记 | piglets | as *Treatment unknown after move* above: the invisible dose answered `Don't know` at the Move (iron, coccidiosis, health shot) | from the Move until resolved by quantity, as *Check on the pig* | receiving litter, per invisible dose |
| **Arrived done** 转入已做 (`8 owed · 2 arrived done`) | piglets | arrived piglets that carry a dose done in their source; excluded from the receiver's owed count, so its one-tap Record opens at the owed number, never all alive | carried with the source's stamp | receiving litter, per dose, per source |
| **Already had (check outcome)** 已经做过（确认） | piglets | arrived piglets a hand confirmed already had a dose; written as a check with who and when, never as a treatment record | stamped at the check | receiving litter, per dose |
| **Source after a Move** (`Iron 6–8 of 8 · check`) | piglets | the source's done count for a part-done dose after an unknown or visible departure: a range, never rounded up to all done; a Yes answer debits n exactly | from the Move until checked | source litter, per dose |
| **Explaining Move** 解释性转移 | one Move | a Move that pairs an open unexplained loss with an open unexplained gain (`explains: [loss, gain]`); Alive changes by 0 on both litters, both open lines close, Moved out/in are written | stamped at Save | two litters |
| **Moves** 转移记录 (`Moved in 3 · 2 moves`) | Move records | every Move on this litter, in or out, each one correctable through Edit as one record | cumulative, stamped | one litter |
| **Sow with no piglets** 无仔猪的母猪 | sows | locked sows in the room whose litter is at 0 alive (nurse-sow candidates); listed apart from the age-sorted litters | now | one room |

## Count grammar

The count leads the word and the unit is written: `{n} piglets`, singular `{n} piglet` (`pp.common.unit.piglet.one` / `.many`, `PP.tn`); zh has one form and no space between numeral and classifier (`14头`, `3日龄`). Ruled anchors that stay as they are: `born {n}` and `day {n}` (en), `Saved · +{n} this visit` and `Saved · {n} died this visit` (farrowing's, under `fr.*`; a processing receipt names its outcome and is registered by the slice that writes it), and label-then-count headers such as `Dead 6` and `Unexplained loss {n}`.

## Verbs

Buttons name the act. The register is `ux/laws/strings.json` (`verbs`); an action string starts with one of these.

| Verb (zh) | Meaning |
|---|---|
| **Record** 记录 | commit an act or observation |
| **Edit** 修改 | correct something already posted; stamped, original kept, corrected value amber |
| **Set count** 设定头数 | assert the head count seen; the difference is written as an unexplained gain or loss |
| **End task** 结束任务 | close the task for the batch; manual only, hold-to-commit, with a receipt |
| **Move** 转移 | move n piglets from one litter to another in one record that changes both litters |
| **Back** 返回 | leave a screen and keep any draft on the device; pure navigation |
| **Clear** 清除 | discard the draft; a text action, present only while a draft exists |
| **Save** 保存 | commit a staged draft as one stamped event |
| **Close** 关闭 | leave a sheet that saves per tap; names the sheet, not the data |
| **Finish** 结束 | end a farrowing; always `Finish farrowing` |
| **Lock** 锁定 | freeze Born at the end of farrowing; hold-to-commit |
| **Scan** 扫描 | read an ear tag with the camera |

Banned: **Submit**, **Confirm**, **Complete**. The design system README's "Confirm & next" example is superseded by the rulings.

## Room list (仔猪处理 · 单元)

Slice S1 (`room.html`). Owed, missed, open loss/gain and net drift keep the definitions above. The four lenses partition by the same test on every fixture:

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Owed** 待处理 (lens `Owed {n}`) | litters | litters in the task with at least one dose doable now: due today or late. A litter whose only outstanding items are missed leaves this lens; a litter with a live dose and a lapse leads with the live dose | now | one room; unit: litters |
| **Done** 已处理 (lens `Done {n}`) | litters | litters with every dose due today recorded today, nothing owed and nothing missed | today | one room; unit: litters |
| **Later** 之后 (lens `Later {n}`) | litters | litters in the task with nothing due today and nothing recorded today; includes litters whose only outstanding items are missed | now | one room; unit: litters |
| **All** 全部 (lens `All {n}`) | litters | every litter in the room, including those not in the task | now | one room; unit: litters |
| **Finished litter** 处理完毕的窝 | litters | a litter with nothing owed, nothing missed and no next dose: every configured treatment is done; sits in Later with `All treatments done` and its last record stamp (in Done on the day of that record) | now | one room |
| **Coming up** 接下来 (block) | litters | on an empty Owed pile: litters whose next dose falls soonest, not tied to the Later count (a litter done today can appear here) | now | one room |
| **Litters owing today** (lead figure) | litters | the Owed count as displayed: held rows included, and under an active filter only the filtered litters | now | one room |
| **Piglets on a row** | piglets | owed rows: piglets still needing the oldest dose named on line 1; castration counts males (`6 males`); partly-done rows print `{left} still owed` of the dose's population; Done and Later rows: alive | now | one litter |
| **Due {n} days ago** (red) | days | whole days since the oldest dose still owed was due; `due yesterday` at 1 | now | one litter. Late is still owed |
| **Window ended day {n}** (amber) | day-age | the treatment's console last age-day, on a missed litter's row | fixed by the treatment | one litter |
| **N records · check** (amber) | records | two or more records from different hands for one dose (possible double treatment); the flag lives on the litter page | until resolved | one litter |
| **Open loss / gain on a row** | heads | appended last on line 2 of any row, whatever its state, including a litter not in the task (`loss 2 open` red, `gain 1 open` blue) | until explained | one litter |
| **Net drift** | heads | open gains minus open losses, signed with unit (`−2 piglets`); printed only while both a gain and a loss are open | now | one room |
| **Sow died** 母猪死亡 (chip) | litter | the litter's sow died; line 2 still shows what the litter owes, and the chip outranks `Farrowing not locked` | until weaning | one litter |
| **Litter found by tag or notch** | piglets, litters | every piglet whose current identity row matches the full tag (6 digits), the last 4 digits of a tag, or a notch (`n-n`, separators trimmed); a notch may match several litters; a match outside this room prints its unit or `weaned` | as of the latest stamped change | all rooms; opens the litter with `&piglet=` |

Recency words on a row come from the record's timestamp: `1h ago` under a day, `yesterday`, `N days ago` to six, the date from seven days.

**Developer note: hold, then depart.** A row that a hand's record or a sync moves out of the current lens stays in place for 800ms of idle (any touch or scroll resets the timer), flashes `green-wash`, then leaves. The same law covers rows changed by another worker (`PP.sync`).

**Missed, one term.** English `missed`, Chinese `已过处理期`, on the row, the filter and the `n litters missed a treatment ›` line.

**On-time KPI (T-27) is not on the room.** The room shows what is owed now; the on-time share (marks on or before the planned day over scheduled marks, early counting as on time) is a task-level figure that belongs to the Task overview and End review (slice S9) and to the console. The room's header door `Task overview` leads there (`end.html?state=overview`); End task is never in the dock.

**Registry exception.** If the string registry itself fails to load, the page prints one hard-coded English line and a Retry button, because there is nothing to look strings up in. It is the only unregistered visible text on the page.

**Last record (header).** The newest stamped event of any kind in the room: a treatment, a Set count, a Move, a death or an Edit, printed with its own words (`Set count 11 · D03 · 1h ago · G.H`), so a just-made record stays findable after its row departs.

**Rail glyphs.** Every litter row ends in `›`, done rows included: RULINGS "Names and glyphs" reserves ✎ for editing a locked figure (one glyph, one meaning), and RULINGS outranks the README row law's ✎-when-done. This reverses the round-1 decline.

## Ledger module (`ux/tasks/piglet-processing/ledger.js`)

One module computes every figure above from the litter's events; pages render its output and its selectors and hold no ledger arithmetic of their own. `derive(events, config, { today })` replays the log and returns per litter, per room, `rejected[]` (event, reason, detail), `flags[]` and `ended`; `append(events, event, config, opts)` also returns `dependents`, the earlier records the new event made invalid. Tests: `tests/ledger.test.mjs`.

**Config.** `doses` (id, tx, due day-age, optional last age-day, visible, castration, product + amount), `identity` (scheme, who, day), optional `task` (`id`, `litters[]`, `ended: {at, who}` when End is not in the log, `farrowingTask: 'open'` while the batch's farrowing task is open).

**Events.** `farrowed` (born, dead at birth by cause, locked) · `count` (observed, the Alive the device saw, `missingRows` naming identified piglets not found) · `death` (lines by cause or by identity row; `lossAlloc` or `fromMissing`) · `sow_died` · `move` (from, to, n, rows, per-dose answers yes/no/unknown, optional `explains: [lossId, gainId]`) · `treat` (dose, n, deferred n + reason, exempt n + reason; castration as castrated + not castrated by reason, `females` for arrivals of unknown sex; `target: 'unknown'` records the dose on unknown arrivals) · `check` (arrivals: had / lacks, optionally one `group`) · `identity` (add, edit, withdraw, close; names the litter that holds the row) · `correction` (target id; `set`, or `void` with an optional `fresh` treat for the right litter) · `weaned` (n, rows) · `farrowing_task_ended` · `end_task`. Every event carries `id`, `at`, `who` and optionally `seen`: the ids the device had when it wrote it. Without `seen` the event saw the whole log before it. Device clocks never decide a conflict.

| Derived term | Computed from |
|---|---|
| **Alive** | Born − Dead − Moved out + Moved in − open loss + open gain − Weaned; `balances()` checks it. Never below 0: an event that would take it there is refused; an untagged Move above a source without rows is clamped and flagged `sync review` |
| **Born / Dead** | the `farrowed` figures; while the farrowing is open a death adds to both (Born = Alive + Σ Dead) |
| **Unexplained loss / gain** | one item per Count, `observed − Alive now` (never against the device's base, so two counts of one crate never sum). Open = qty − what deaths and Moves took from it. Never netted |
| **Explained** | a death's allocation or a Move's `explains`: the named side relabels, Alive does not move there. Allocations aggregate per loss; untagged bodies and untagged Moves spend only a loss's unnamed part — a named missing piglet's share is spent by that row's death or Move, once. Over-consumption becomes a plain death flagged `sync review` |
| **Owed** (`owedStored` the reading, `owed` shown) | every live-born piglet owes every dose (castration: nothing until its first record counts the males); births after a pre-lock mark, arrivals that owe it, gains before the first record and a check's `lacks` add; untreated piglets moving out take away. A record leaves `left` — what remained in its writer's view (its alive and owed as seen). The reading is the minimum, over the frontier (records no other record saw), of `left` plus the changes that record did not see: order-independent, and overlapping records never prove a deferred piglet treated beyond what one record's own count proves. When alive reaches 0 the population is gone (a zero point): its debt, unknowns and evidence do not re-attach to later arrivals. An explained gain answered Yes lowers owed only if no record has absorbed the gain since. Shown as `min(reading, Alive)`; `owedFrom` says why (deferred, `born_after_mark`, `arrival`, `gain`, `lacks`) |
| **Tap guard / possible double treatment** | a record is judged first in its writer's view: a writer that had seen the dose done records nothing (`nothing_owed`). Records neither of which saw the other — ordinary or on unknown arrivals — are both kept and flagged **possible double treatment** |
| **Treated** | Σ n of the litter's own records for the dose (including records on unknown arrivals); history, never retired |
| **Deferred / exempt** | deferred: the largest deferral among the frontier records, capped at owed. Exempt: Σ exempt piglets (castration: hernia, cryptorchid, kept boar); hernia and cryptorchid also write a litter note |
| **Missed** | owed, when today's day-age is past the dose's last age-day |
| **Unknown after move / carried from move** | groups, one per arrival or gain; a group carried by named rows retires or travels with each row (death, missing, Move, weaning, withdrawal). Unknown resolves by a `check`, a `treat` with `target: 'unknown'`, or the explaining Move of that gain. **Exclusive per dose:** owed ≤ Alive, unknown ≤ Alive − owed, carried ≤ the rest — so no figure counts more piglet-doses than exist |
| **Early / late / after window; on time** | a record's day-age against the dose's due day-age and last age-day; early counts on time. A litter × dose is on time when owed **and** unknown both reached 0 by its due day-age (`fullAt`) |
| **Identified / rows** | `liveRows`: rows here with status alive. A departure the untagged piglets cannot cover names its rows: refused online (`name_the_rows`); an offline writer that could not know the rows is kept and raises `identity_reconcile` (`identity.conflict` = rows above Alive) until a count names the missing, a death or a withdrawal settles it. Statuses: alive, missing, dead, weaned, withdrawn; rows are never deleted |
| **Sync review** | loss over-consumed, a Move clamped or naming more than is open, a count concurrent with a death, Move or weaning, a second death of one row, `identity_reconcile` |
| **Task** | `treat` outside the task's litters is refused (`no_task`). End is `end_task` in the log, refused while the batch's farrowing task is open (`farrowing_task_open`, RULINGS Q5). After End (a writer that **saw** End is after it whatever its clock; otherwise its place in the log, then its stamp) a treat is refused (`task_ended`) unless stamped before End and synced after (accepted, `arrived_after_end`), carried by a correction's `fresh` mark (`correction_after_end`), or a **catch-up** of piglets moved in after End (*provisional, map ledger*: the owner will confirm or reopen). Deaths, counts, moves, identity and corrections keep their permissions. `movedOutAfterEnd` lists piglets moved out after End with the owed doses they took. End freezes the closure figures (`ended.snapshot`, from the log as it stood at End) |
| **Room: open loss, open gain, net drift** | Σ open items of the room's litters; net drift = open gain − open loss |

**Selectors.** Drafts are validated by the same replay `append` runs, with the page's stamp, so a draft is gray for exactly the reasons `append` would refuse it (`task_ended` included), and its effect is the replay's result. `select.room(derived, { room, lens, filter, missedOnly })`: lens membership (Owed, Done, Later, All, as in *Room list*), rows in walk order with line-1 doses oldest first and per-dose counts, missed tokens, next obligation, lead figure, drift strip, coming up, last record. `select.litter(derived, id, { drafts, stamp })`: owed now with the one-tap figure, doses left, recorded with stamps, later, and treat drafts (owed, not treated, why, the event, the dose after). `select.deathDraft(derived, litterId, { tallies, picks, k }, stamp)`: causes by phase, roster, cap, kMin / kMax for the missing, why (the drawer's own steps first, then `append`'s), the event, Alive after. `select.moveDraft(derived, { from, to, n, rows, answers, explains }, stamp)`: clamp, before → after on both sides (unchanged on an explained side), carry per dose, the questions to ask, the source's coverage range, why, the event. `select.end(derived)`: `atEnd` (frozen at End) and `now` (live, amendments since End included) — unfinished litters and piglet-doses by litter (owed, missed, not due), progress, the on-time share (litter × dose fully recorded by its planned day over those recorded or past it), identity done, moved out after End.

**Page concern.** Unsaved drafts live on the device; the ledger cannot see them. End review must warn from the device's own drafts before End.

**Shared fixture** (`fixtures.js`, ticket #19). Every page opens one variant of one event log + config (Unit 7, Unit 8 for cross-room cases; `?data=` names the variant) and renders the selectors above; a page state is a variant plus UI state. Commits go through `append` and stay in the tab's log (sessionStorage), so a record on one page shows on the next. Facts the ledger does not hold travel beside it in the fixture: the sow's tag and parity, the birth litter weight, weigh-day litter weights and boar/gilt counts for piglets not identified, drafts held on the phone.

### Known limits (not fixed before merge)

Each with the event sequence that shows it.

1. **Non-record changes are sized when applied.** A Move answered No lowers owed by `min(n, owed then)`. Litter 10; online record 4 treated + 6 deferred; an offline Move of 8 answered No (saw only the birth) lowers owed by 6, not 8 — the contradiction (8 untreated leaving, 6 untreated known) is clamped, not flagged.
2. **Untagged departures keep evidence and unknowns uncertain.** Move 1 untagged Yes into R (carried 1); an untagged death in R. The group stays; only the exclusive display (carried ≤ Alive − owed − unknown) bounds it. Named rows retire exactly.
3. **A `check` or unknown-target `treat` without `group` resolves the oldest group.** Two untagged arrivals, unknown, from S1 then S2; `check had 1` with no group resolves S1's group whichever piglet the hand looked at.
4. **Skip reasons and exemptions do not travel with moved piglets.** A defers 2 weak; Move 1 answered No into B: B owes 1 as `arrival`, the reason `weak` is not carried.
5. **Arrivals ride the receiver's schedule.** Day-2 piglets moved into a day-9 litter: their iron d3 reads late and teeth missed by the receiver's day-age (nurse-sow scheduling on arrivals is out of v1).
6. **A stale identity op after a Move is refused, not routed.** Row r1 moves B09 → B02; an offline edit naming B09 is refused `row_in_other_litter` (the detail names B02).
7. **A stale writer's Alive is the sum of the Alive changes it saw.** A count's change is sized against the ledger when applied, not against the writer's base; `baseAlive` is kept for display only.
8. **Concurrent records on unknown arrivals both add to Treated.** Two phones record the one unknown arrival: Treated rises by 2, the unknown falls by 1, flagged.
9. **An identity conflict holds the rows until a hand settles it.** Two tagged rows, an offline count of 1: `identity.conflict` 1; a Move or death of a row while Alive is 0 is refused `alive_negative`.
10. **Catch-up after End is provisional** (map ledger) — see *Task* above.
11. **The End snapshot is the log prefix at End.** A treat stamped before End but synced after is in `now` (flagged `arrived_after_end`), not in `atEnd`.
12. **Castration `females`** is this module's addition for arrivals of unknown sex; Q16 names no such reason.

## End task, the ended task and the handoff to weaning (仔猪处理 · 结束任务)

Slice S9 (`end.html`). *Unfinished litters* and *Unfinished piglet-doses* keep the definitions above (the not-yet-due line is provisional). A **treatment** here is one litter × one scheduled dose (the unit a mark is dated on); a **piglet-dose** (头次) is one piglet × one scheduled dose. Every value prints its unit (`11 piglet-doses`, `6 of 9 litters`, `92 of 95 piglets`).

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Farrowing task open** 分娩任务尚未结束 (the guard) | the batch's farrowing task | the farrowing task of this batch, across all its units, not ended; a sow still farrowing is its detail, not the guard | now; rechecked on the final End | one batch |
| **Unsaved drafts on this phone** 本机未保存的草稿 | drafts | death drafts and correction (Edit) drafts held on this phone for the task's litters, each with its route | now | this phone only (drafts never leave the device) |
| **Done** 已处理 (progress, row `done {n}`) | piglet-doses | piglets a Record marked for a scheduled dose (castration counts males) | cumulative to now | whole task / one litter |
| **Owed** 待处理 (progress, row `owed {n}`) | piglet-doses | Owed as defined above; the value is red on a row when any of it is late; `{n} of them missed` is its missed part | now | whole task / one litter |
| **Not yet due** 未到期 | piglet-doses | scheduled doses whose due day-age is still ahead | now (review and receipt: at End) | whole task / one litter |
| **Whole-task progress total** (`{n} piglet-doses`) | piglet-doses | Done + Owed + Not yet due | now | whole task |
| **Identity done** 标识完成 (`{n} of {k} litters`) | litters | litters whose identity step is done under the farm's rule: every alive piglet identified, or a candidates farm's closed set | now | whole task |
| **{n} unidentified** (row token) | piglets | alive piglets without a notch or tag, once the identity day has come | now | one litter |
| **With work left** 仍有待处理 / **Only doses not yet due** 仅有未到期 | litters | the Unfinished litters split: owed or missed doses, or identity not done / nothing but doses not yet due | at End | one batch |
| **On-time treatments** 准时处理率 (`{n}%`, `{n} of {k} scheduled treatments (litter × dose) due by today`) | treatments | on time: fully recorded on or before the planned day (early counts) ÷ treatments recorded or past their planned day. Overview: due today and later are left out (`{n} due today or later, left out`). At End: a dose due that day and never recorded counts as not on time; only not-yet-due are left out (`{n} not yet due at End, left out`) | now (overview) / at End (review, receipt) | whole task. Not on the room |
| **Not on time** 不准时 | treatments | k − n of the on-time line | as above | whole task |
| **Piglet deaths** 仔猪死亡 / **Piglets moved** 转移仔猪 | piglets | deaths recorded in processing (farrowing's are farrowing's) / piglets carried by Move records inside the task, each printed `from → to` | task start to now (receipt: to End) | whole task |
| **Unexplained loss / gain** (`{n} piglets open`) | piglets | open unexplained items, as on the room header | now (receipt: at End) | whole task |
| **Sow deaths** 母猪死亡 | sows | sows of the task's litters recorded dead | as above | whole task |
| **Finished litters** 已完成的窝 | litters | litters in the task that are not Unfinished litters | frozen at End | one batch |
| **Not done at End** 结束时未完成 (`{name} · {n} not done`) | piglet-doses | a litter's unfinished piglet-doses, final: `owed at End`, `window ended day n` or `not due at End`. Frozen at End, except piglets that died or moved out after End, which leave it (`{n} died · {n} moved out after End`); never above the litter's alive | frozen at End, less piglets gone since | one litter; can no longer be recorded |
| **Arrived after End** (`{n} arrived after End · catch-up`) | piglets | piglets moved into an ended task's litter after End; the doses they owe stay recordable as catch-up (`{name} · {n} owed`) *(provisional)* | from the Move | one litter |
| **Catch-up after End** (`{name} {n} · catch-up after End`) | records | the one treatment record End still allows: a dose owed by piglets moved in after End, stamped and flagged `after End` *(provisional)* | from its stamp | one litter; the ended face's header names this exception |
| **Treatment done after End** (`{n} treatment done after End`) | records | a treatment physically done after End that synced from an offline phone: kept, stamped, flagged `after End`, never dropped; frozen figures unchanged; that phone shows it `saved · after End` *(provisional)* | from its arrival | one litter; flagged on the receipt |
| **Mark arrived after End** (`{n} mark arrived after End`) | records | a mark stamped before End that synced after it: accepted, counted, flagged (merge contract: flag, never drop); the receipt's figures stay as at End *(provisional)* | from its arrival | one litter |
| **Correction after End** (`{name} {n} · correction after End`) | records | the fresh record a wrong-litter correction writes on the right litter after End, stamped as a correction *(provisional)* | from its stamp | one litter |
| **Since End** 结束后的记录 | records | every record written after End: deaths, Set counts, Moves, Edits, wrong-litter corrections, identity rows, late-arriving marks | after End | whole task; newest first |
| **Alive** 存活 (ended face, For weaning, the receipt's `For weaning · Alive n`) | piglets | the ledger's Alive, summed | now, live (deaths and moves after End change it) | whole task / one litter |
| **Identified** 已标识 (For weaning, `{n} of {k} piglets`) | piglets | identified alive piglets of k live alive (identity rows since End add; piglets moved in arrive unidentified) | now | whole task / one litter |
| **Recorded since End** (For weaning, owed lines) | flag | a not-done line whose litter and dose has a record since End (a mark stamped before End, a correction, a catch-up, a treatment done after End) | now | one line |
| **Litter weights** 窝重 (For weaning, `{n} of {k} litters`) | litters | litters with a weigh-day litter weight; `{n} litters not yet at day 21` for those whose weigh day is still ahead | now | whole task; per litter `{kg} kg` or `weigh day 21 not yet due` |

**Receipt figures describe the closure event.** Everything on the receipt is as at End; the litter records stay live, so the ended face can differ from the receipt. For weaning reads the live ledger.

**Mandatory changes words only.** `Mandatory · {n} litters unfinished` and `reported to the farm as not done` replace the plain lines; End is never blocked by it.

**End is a shared-state commit.** After the hold the phone waits for the server's recheck (`Checking every litter`); offline, End is refused (`End needs a connection`); a change found by the recheck is said in one line (`Figures changed while you held · review again`) and the review shows again. Two more exits: `Already ended by {who} · {date} · {time}` opens their receipt; `No answer from the farm system · End may have gone through` points to the task as it stands and never offers the hold again. Once ended, Back never reopens the End flow: an overview or review left in history lands on the ended face. The task can't be reopened *(provisional, map ledger)*.

## Corrections and the litter record (仔猪处理 · 修改与窝记录)

Slice S8 (`edit.html`, ticket #12). Edit is one screen per litter; everything on it is the ledger's (`select.edit`, the draft replayed as `append` would) and Save commits one stamped act. The record page is `select.record`. Nothing is ever deleted: a withdrawn mark or row stays on the record with the act that withdrew it.

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Mark** 处理记录 (a stepper row in Edit, `Iron · day 3 · 12`) | piglets | the piglets one treat record marked (castration: the males castrated), as it stands now (after any earlier correction) | the record's own stamp (`09:14 · G.H`) | one record, one litter |
| **Recorded then** (the stepper's ceiling, `12 were recorded`) | piglets | treated + deferred + exempt on that record: what it accounted for when it was written; a correction can lower or redistribute it, never raise it (a missed piglet is a new record) | the record's stamp | one record |
| **Not treated here** 未在此处理 (`2 not treated here · why?`) | piglets | recorded-then minus the corrected mark; each needs a reason: weak or sick (deferred, stays owed), or the whole record was a mistake / done on another crate | the draft | one record |
| **Change** (`12 → 10`, amber) | piglets / crates / fields | a value before and after the draft, printed in the banner and on the record page; the value is amber, the words ink | from the first change until Save or Clear; on the record page forever | one record, row, Move or set |
| **Withdrawn** 已撤回 | one record or row | a mark or identity row recorded by mistake; stays on the record page with its original stamp and the withdrawing act's stamp; leaves every count | stamped at Save | one litter |
| **Recorded here by correction** 经修改记在此窝 | piglets | the right litter's fresh record when a mark was done on another crate: the right litter's owed for that dose at Save (castration: the males castrated, up to what it owes) | the correction's stamp, not the original's (ledger) | the right litter |
| **Corrected (amber)** 已修改 | a figure | any mark, Move, row value that a correction changed or created; prints amber on the litter sheet, in Edit and on the record page, forever | since the correction | one litter |
| **After End** 任务结束后 (`flagged for review`) | corrections | a correction saved after End; a fresh record it creates is flagged `correction_after_end`; End's closing figures stay as closed | stamped after End | one task |
| **Day header** (`today · G.H`) | record-page day | the records written on one date, newest first; the hand prints on the header when one hand wrote the whole day, else on each row | the date, relative within the week (`today`, `yesterday`, `3 days ago`, then `Sep 26`) | one litter |
