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

Defined by farrowing and used here unchanged (RULINGS *Model*; the Finish sheet):

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Weak** 弱仔 / **Deformed** 畸形 | piglets | alive piglets of this farrowing classified by the hand at Finish (optional earlier) | committed per tap at Finish; amendable through Edit | one litter |
| **Healthy** | piglets | alive − weak − deformed; derived, no form row, printed on the record | as Weak / Deformed | one litter |
| **Weaned** 断奶 | piglets | piglets that left the litter at weaning; the last term of the ledger | stamped at weaning | one litter |

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

Slice S1 (`room.html`). Counts the room's lenses and rows print; owed, missed, open loss/gain and net drift keep the definitions above.

| Term (zh) | Entity | Population | Time | Scope |
|---|---|---|---|---|
| **Owed litters** 待处理的窝 (lens `Owed {n}`) | litters | litters with at least one scheduled dose owed: due today, late, missed, or partly done, including a litter whose farrowing is not yet locked | now | one room; unit: litters. A missed dose keeps its litter here |
| **Done litters** 已处理的窝 (lens `Done {n}`) | litters | litters with every dose due today recorded (early counts) and nothing else owed | today | one room; unit: litters |
| **Later litters** 之后的窝 (lens `Later {n}`) | litters | litters in the task with nothing owed and nothing recorded today, whose next dose is due on a later day | now | one room; unit: litters. A litter done today is Done, not Later |
| **Piglets on a row** `{n} piglets` (line 2) | piglets | owed rows: alive piglets still needing the dose named on line 1 (the largest count when several doses are named); partly-done rows print `{left} of {n}`: owed of alive; Done and Later rows: alive | now | one litter |
| **Due {n} days ago** 逾期 (chip `Late`) | days | whole days since the oldest dose still owed and not window-bound was due | now | one litter. Late is still owed; the row never stops asking |
| **Last day {n}** (chip `Missed`) | day-age | the treatment's console last age-day, printed on a missed row instead of lateness | fixed by the treatment | one litter; missed stays inside Owed |
| **Open loss / open gain** chip | heads | the litter has an open unexplained loss (gain); the count prints on line 2 (`loss 2 open`), the chip only when no more urgent chip applies (Not locked > Missed > Late > Open loss > Open gain) | until explained | one litter |
| **Net drift** on the room header | heads | open unexplained gains minus open unexplained losses in the room, signed (`+1`, `−2`); shown only while a gain or loss is open | now | one room |
| **Litter found by tag or notch** | one piglet, one litter | a piglet whose current identity row carries the tag or notch typed or scanned, in this room | as of the latest stamped change | one room; not found means no identity row here, not that the piglet does not exist |
