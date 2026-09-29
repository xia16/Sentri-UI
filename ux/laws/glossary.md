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
