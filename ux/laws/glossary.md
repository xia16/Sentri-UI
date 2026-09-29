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
