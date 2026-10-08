# Piglet processing (仔猪处理) — domain research

Researcher's brief for the piglet-processing design run. Every claim is tagged
**sourced** (citation: URL, or repo file + section) or **inferred** (with why it seems real).
Precedence for internal sources: `ux/research/farrowing/RULINGS.md` > everything else in the
repo. `ux/research/tasks/piglet-processing.html` §3–§5 are an earlier design proposal and are
**not** treated as requirements here. The held-out `eval-set.md` was not opened.

---

## A · External husbandry practice

### A1 · What processing is, and the day schedule

"Processing" = the bundle of neonatal procedures done to each piglet in its first days, usually
while the litter is handled once or twice: navel care, teeth, tail, iron, castration of males,
identification, and on many farms an oral coccidiostat and a nasal vaccine.
— **sourced**: Pork Information Gateway, *How To Process Piglets*
(https://porkgateway.org/resource/how-to-process-piglets/); VT Extension *Piglet Processing and
Swine Welfare* (https://www.sites.ext.vt.edu/newsletter-archive/livestock/aps-09_05/aps-0513.html).

| Procedure | Typical age | Notes | Tag |
|---|---|---|---|
| Navel / cord (断脐) | at birth, minutes old | squeeze blood back, cut leaving 3–5 cm, disinfect. Done by the farrowing attendant, i.e. often *before* the processing task exists. | **sourced**: 河南畜牧兽医信息网 (http://www.hnxmsyzz.com/jstg/show-5577.html); 大畜牧网 "5–10 min after birth" (https://www.dxumu.com/19176.html) |
| Needle teeth clip / grind (剪牙/磨牙) | first 24–48 h (CN sources: within 6–24 h) | partial clip preferred over full; grinding raises stress hormones more than clipping | **sourced**: PIG *How To Process* (24–48 h); PIG *Neonatal Management Practices* (https://porkgateway.org/resource/neonatal-management-practices/, day 1, partial preferred); 盐城市政府 Q&A (https://www.yancheng.gov.cn/art/2024/3/28/art_34252_17411.html, "出生后六小时内"); VT aps-0513 (cortisol) |
| Tail docking (断尾) | day 1–3 | cold side-cutter preferred to hot blade | **sourced**: PIG *How To Process* ("up to 3 days old"); 盐城 ("产后2到3天内"); VT aps-0513 |
| Iron (补铁) | injection day 1–4 (US 200 mg iron dextran IM, neck); oral only within ~18 h and less effective | injection strongly preferred | **sourced**: PIG *Neonatal Mgmt* (1–4 d inj., oral within 18 h, 100–200 mg); PIG *How To Process* (24–48 h) |
| Iron, second dose | ~day 14–15, or 3–5 d before weaning | increasingly common; improves Hb and growth. CN extension states it as routine ("14日龄左右进行二次补铁") | **sourced**: 盐城; J Anim Sci 2023 (https://academic.oup.com/jas/article/doi/10.1093/jas/skad270/7240545, d3 + d15); Applied Animal Science coop. study (https://www.appliedanimalscience.org/article/S2590-2865(24)00019-3/fulltext) |
| Castration (阉割/去势) | US: days 3–7 (range 4–14); CN: 3–7 d (prefer 4–6), "not before 3 d, not after 10 d"; some CN farms 7–14 d | avoid first days (colostrum, hernia detection). Scrotal hernia/cryptorchid males are exceptions a hand must be able to skip. | **sourced**: PIG *How To Process* (3–7 d); UMN open text (https://open.lib.umn.edu/largeanimalsurgery/chapter/piglet-castration/, 4–14 d); 大畜牧网 19176 (3–7 d, ≤10 d); 河南 (7–14 d). Hernia exception — **inferred** from UMN's "easier to identify inguinal hernias" rationale. |
| Coccidiostat, toltrazuril (托曲珠利 / 百球清) | single oral dose day 3–5 (20 mg/kg ≈ 1 mL/piglet) | per-piglet oral drench | **sourced**: NADIS (https://www.nadis.org.uk/disease-a-z/pigs/coccidiosis-in-piglets/); Drugs.com Baycox label (https://www.drugs.com/vet/baycox-toltrazuril-5-oral-suspension-can.html); 163.com product note (https://www.163.com/dy/article/IOORPCM20514E1NL.html, "3～5日龄…每头仔猪内服1mL") |
| Nasal vaccine (滴鼻), typically pseudorabies/伪狂犬 live vaccine | day 1–3, "best within 24 h"; boosters by injection ~40–50 d and 80–90 d (i.e. outside this task) | one dose per piglet; operator-sensitive, fails often | **sourced**: search digest of 牧通人才网 / 百度知道 / gdaav (e.g. https://www.gdaav.org/mobile/article/14291.html) — secondary sources, treat schedule as indicative |
| Identification — ear notch / tag / tattoo / RFID | notch best before day 3; CN: 耳号 ~day 3 | see A3 | **sourced**: PIG *Neonatal Mgmt*; 河南 ("出生后3天左右") |
| Weighing | birth: often whole-litter (出生整窝重); individual at processing day on stud/data-heavy farms; weaning weight | litter vs individual is a farm choice | **inferred** from repo (identity.md §1; SYNTHESIS §6 A1 owner: weights optional) plus absence of any extension source mandating per-piglet birth weight |

**One-step vs two-step processing** (the single most design-relevant schedule fact from CN
practice): *two-step* = ~24 h: cord, teeth, tail, iron, toltrazuril; day 3–5: castration.
*One-step* = everything (tail, iron, toltrazuril, castration) at day 3.
— **sourced**: search snippet attributed to 猪知乐, *种猪及母猪高效产房的关键点*
(https://zhuanlan.zhihu.com/p/105220677 — page itself returned 403; snippet via search engine,
corroborated by 163.com toltrazuril note). Consequence — **inferred**: the "day ladder" is not
universal; a farm's schedule may be 1 day, 2 days, or the 5-rung 1/2/3/5/7 production shows.
Confirms ladder.md §1 "whether d2/d3 are collapsed … console".

### A2 · Legal limits

- **EU Council Directive 2008/120/EC, Annex I Ch. I §8** — **sourced** (https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02008L0120-20191214):
  - Corner-teeth reduction by grinding/clipping allowed only "not later than the seventh day of
    life", uniform, leaving a smooth surface.
  - Tail docking and teeth reduction must **not be routine** — only "where there is evidence that
    injuries … have occurred", and only after other measures (environment, stocking density).
  - Castration "by other means than tearing of tissues".
  - Castration or docking **after day 7** only "under anaesthetic and additional prolonged
    analgesia by a veterinarian".
  - Procedures only by a vet or a trained, experienced person (Art. 6).
  - Weaning not before 28 days (Ch. II C) unless welfare/health requires.
- **US (AVMA policy, not law)** — castrate ≥5 days before weaning; after 14 days use
  analgesia/anaesthesia; after 28 days vet with anaesthesia/analgesia. — **sourced**: AVMA
  (https://www.avma.org/resources-tools/avma-policies/swine-castration) via VT APSC-174 summary
  (https://www.pubs.ext.vt.edu/APSC/APSC-174/APSC-174.html).
- **Certification schemes** (e.g. Global Animal Partnership): castration on/before day 10; teeth
  grinding/filing only if the litter is damaging each other/the udder, and the *number of animals
  affected* and date must be recorded. — **sourced**: GAP Pig v2.2 record template
  (https://globalanimalpartnership.org/wp-content/uploads/2019/02/Pig-v2.2-Sow-Farrowing-Pig-v2.2let-Processing-and-Weaning-record-template.pdf).
- **China** —
  - No statutory age limit or anaesthesia rule for castration/docking/teeth was found.
    — **inferred** (searched MOA/GB sources; only voluntary guidance surfaced). A voluntary group
    standard *农场动物福利要求 猪* (China Association for Standardization, 2014) exists but its text
    was not reachable; do not assume it binds customers.
  - GB/T 17824.2 *规模猪场生产技术规程* (2008) covers herd management and **record-keeping**;
    a replacement GB/T 17824.2-2026 *规模猪场饲养管理规范* takes effect **2026-10-01**. Clause text
    not reachable. — **sourced** (existence/dates): 全国标准信息公共服务平台 search results
    (https://std.samr.gov.cn/), gb-gbt.com listing. Content — unknown.
  - **畜禽标识和养殖档案管理办法 (MOA regulation)** — **sourced**
    (https://www.moa.gov.cn/gk/nyncbgzk/gzk/202210/t20221010_6412931.htm; digest via gd.gov.cn):
    newborn livestock get the national 畜禽标识 **within 30 days of birth** (or before leaving the
    site), pigs **left ear middle**; the farm must keep a 养殖档案 with breed, **numbers**,
    breeding records, tag status, origin and in/out dates, and for **veterinary drugs: source,
    name, subject, time and dose**; commercial pig records kept 2 years, breeding stock long-term;
    breeding animals need individual files (tag code, sex, birth date, dam's tag code).
    Design-relevant — **inferred**: iron, toltrazuril and nasal vaccine are 兽药/biologics, so a
    treatment mark that carries no product/dose (PRD §2 "the mark is the record; no payload")
    satisfies the archive only if product and dose come from the console config at the time of the
    mark.

### A3 · Identification systems

- **US Universal ear notching**: pig's **right ear = litter number** (positions 1, 3, 9, 27, 81),
  **left ear = pig number within litter** (1, 3, 9); every littermate shares the right-ear notches
  and differs on the left. Values 1–161 per ear. — **sourced**: K-State *Universal Ear Notching
  System* (https://www.asi.k-state.edu/extension/youth-programs/nominated-livestock/KSU%20Ear%20Notching_from%20Show%20Guide.pdf);
  NMSU B-602 (https://pubs.nmsu.edu/_b/B602/index.html). Consequence — **inferred**: a notch
  *encodes the birth litter*, so a fostered, notched piglet carries its birth-litter identity into
  the foster crate forever; notching before fostering is a data hazard if the system treats the
  notch as the foster litter's.
- Chinese farms use 耳缺 (notch) and/or 耳标 (tags); record 耳号 on the sow's 生产记录卡.
  — **sourced**: 河南 ("种母猪生产记录卡内，同时记载仔猪出生日期及耳号").
- Methods overall: notch, tattoo, tag, transponder/RFID. Tagging is faster than notching
  (≈20 vs 32 s/pig) and notching scores worse on vocalisation and wounds. — **sourced**: PIG
  *How To Process*; VT aps-0513.
- The national 动物防疫耳标 (left ear, within 30 d) is a separate legal tag from any farm
  management tag. — **sourced** (rule) / **inferred** (that farms often apply it later, at
  weaning/nursery, because 30 d > the suckling window of 21–28 d is borderline).

### A4 · Workflow reality

- One piglet at a time, restrained by hand; instruments disinfected between piglets.
  — **sourced**: PIG *How To Process*.
- Litter caught out of the crate and moved to a holding box/crate in the alley, then processed and
  returned. — **sourced**: J Anim Sci ergonomic study, "catch all piglets in a litter and transfer
  them to a crate in the alley" (https://academic.oup.com/jas/article-abstract/67/10/2627/4697038).
- Per-piglet time: teeth 39–56 s, tail 17–20 s, castration 70–96 s, ID 20–32 s → a full
  one-step process of a 14-piglet litter is ~10+ minutes of hands-full work. — **sourced** (unit
  times): VT aps-0513; arithmetic **inferred**.
- Two-person crew (one catches/holds, one cuts/injects) with a processing trolley carrying iron
  gun, cutters, drench, disinfectant, marker. — **inferred**: universal in farm training material
  and consistent with identity.md §1 and ladder.md §1; no extension page found stating it
  explicitly. Teagasc's fostering kit lists "spray marker · tagger & tags · notebook" — the
  notebook is the record. — **sourced**: Teagasc Pig Skills factsheet *Cross Fostering Piglets*
  (https://teagasc.ie/wp-content/uploads/media/website/news/daily/pdfs/Teagasc-Pig-Skills-Series-Factsheet---Cross-Fostering-Piglets.pdf).
- Paper records: the **sow card** travels with the crate and carries born alive / stillborn /
  mummified, **number fostered on/off and to which sow**, losses with cause, treatments with date
  and type, weaned count and date. — **sourced**: pig333 *Sow card: accurate record keeping*
  (https://www.3tres3.com/en/articles/sow-card-accurate-record-keeping-is-essential-to-improve-performance_21297/).
  GAP's template records castration date + method, teeth date + number affected, weaned count.
  — **sourced**: GAP template (above).
- Record granularity is **per litter, not per piglet**, for treatments ("date + type"; "number
  affected"). — **sourced**: pig333; GAP. Per-piglet records exist only where identity is
  individually tagged (stud/genetics). — **inferred**.
- Common errors — **inferred** (no single source; derived from the workflow above and the repo's
  error analysis in identity.md §1 and count.md §1):
  - *Skipped litter*: two hands, one room, no crate mark → a crate missed; spray-marking the sow
    card or crate is the paper guard.
  - *Double treatment*: second hand re-does a crate (iron twice is the harmful case).
  - *Fostered after processing*: piglet moved to a crate whose litter is on a different day; it
    either gets a second round (double) or none (missed castration/toltrazuril).
  - *Record lag*: entries written at end of row from memory (ladder.md §4 treats this as normal).
  - *Count drift*: crushed piglets removed without a record, so the processing-day head count
    disagrees with the card.

### A5 · Cross-fostering relative to processing

- Timing: after the piglet has had colostrum from its own dam (≥4–6 h; Teagasc: not in the first
  12 h), and preferably **within 24 h, at most the first 48 h**; age gap between merged litters
  ≤3 days (CN). — **sourced**: Ceva (https://swinehealth.ceva.com/blog/cross-fostering); Teagasc
  factsheet; PIG *Neonatal Mgmt* ("restricted to the first two days post partum"); 河南 ("吃完初乳
  24小时内 … 日龄相差不超过3天").
- So fostering normally lands **between cord care and the main processing round** — after
  day-0/1 items (cord, maybe teeth, drops) but before castration/day-3 items. — **inferred** from
  the two schedules above.
- Late fostering (week 1–2, nurse sows, fall-behinds) exists and produces different lesion
  profiles. — **sourced**: PMC5997804 / PubMed 32241314 (via search digest).
- Treatment records of fostered piglets: on paper the foster count is written on both sow cards;
  individual treatment history does **not** travel unless the piglet is identified. Fostered
  piglets are sometimes spray-marked "resident vs adopted". — **sourced** (card fields): pig333;
  (marking): search digest of cross-fostering study, Translational Animal Science
  (https://academic.oup.com/tas/article/doi/10.1093/tas/txaf074/8169811). That anonymous fostered
  piglets inherit the receiver's schedule — **inferred** (it's the only thing a hand can see).

### A6 · Counting and reconciliation

- Most pre-weaning deaths happen in the **first 48–72 h** (≈54% on days 1–3); crushing is the
  top cause (~48%); pre-weaning mortality 10–20%. — **sourced**: VT APSC-195
  (https://www.pubs.ext.vt.edu/APSC/apsc-195/apsc-195.html); FAWEC fact sheet
  (https://www.fawec.org/en/fact-sheets/36-swine/116-pre-weaning-mortality-in-piglets).
  Consequence — **inferred**: the processing window coincides with peak mortality, so the count
  at farrowing and the count at processing routinely differ; processing is where drift is found.
- Chinese farm software (猪场管家) books unweaned-piglet exits as **死亡 · 赠出 · 淘汰 · 盘亏**,
  counted by head, with sow tag, pen, reason, operator; 盘亏 ("inventory shortfall") exists
  explicitly to bring system stock down to actual; exits draw oldest-first. — **sourced**:
  help.gxswine.com *仔猪离场（哺乳仔猪）*
  (http://help.gxswine.com/doku.php?id=pigfarm7.0%3Ascgl_xzgl_xzlc).
- Chinese farm management rules: births, weaning, transfers counted and **signed**; monthly
  inventory must match the books, discrepancies fined. — **sourced**: search digest of 猪场管理制度
  (https://www.diyifanwen.com/fanwen/guizhangzhidu/22366158.html). Consequence — **inferred**:
  there is a pay/penalty incentive to make counts match *without* recording deaths — the
  laundering risk count.md §1 describes is real, not theoretical.
- Formal counts: at farrowing (born alive), at processing (every piglet handled), at weaning
  transfer (nursery receipt). — **sourced**: repo count.md §1 (internal); external support for
  weaning count as the load-bearing one via pig333 sow card ("piglets weaned").

---

## B · Internal sources — what the repo already establishes

### B1 · `ux/research/tasks/piglet-processing.html` §1, §2, §6 (production = requirements)

- **§1 Inventory** — production schedule 1/2/3/5/7 日龄; 8 config items: 滴鼻 drops · 剪牙 teeth ·
  补铁 iron · 阉割 castrate · 断尾 tail · 耳缺/耳标/体重 tag/notch/weigh · 断脐带 cord · 保健 health.
  Filter's day-age list is 1/2/3/4/6/7/≥8 — mismatched with the schedule. Items due on a later day
  are **pre-fillable** (可提前填). Tag/notch/weigh sub-form captures per-piglet rows for **any
  subset** of the litter (9 of 20) plus litter total weight and 公/母 sex counts; a foster warning
  says identity added to a pen with un-identified fostered-in pigs "may be inaccurate". Count
  confirm has 3 variants (match / under → auto-remove / over → auto-add) with a reason textarea and
  a confirm checkbox; 补录 updates system count. End task: "unfinished treatments **cannot be
  backfilled later**"; blocked until the batch's **farrowing task ends**; task is console-
  configured and **not mandatory**. More-sheet: foster · report death · count anomaly · (sow
  abortion — leftover). Ended state keeps the piglet identity table viewable (contradicting
  "提交后不可再查看").
- **§2 Requirements** — captured: treatment done per litter × age-day × treatment (bool +
  who + when, 7 bulk treatments); litter total weight at weigh day; litter sex counts; per-piglet
  row (tag, notch, sex, weight; never bulk); birth litter weight backfill; observed count;
  mismatch reason; foster/death/count-anomaly events; end acknowledgement. Derived: age-day,
  planned dates, countdown, litter status, progress, 准时率 on-time KPI (target ≥90%), system
  count incl. fostered, unidentified count, end totals. Config: schedule, KPI target, mandatory
  flag, SOP, dependency on farrowing end.
- **§6 Open questions** (production's) — 提交后不可再查看 compliance vs artefact; non-mandatory
  overdue lifetime; mismatch removal should pick death vs error; postpartum/processing cross-task
  jump; filter day list config-driven; fostered-in piglets without identity.

### B2 · `ux/research/tasks/BRIEF.md` (house laws for task docs)
- Piglet treatments are a **box task** (stateless mark → bar acts). No Save/Submit/Complete on room
  screens; actions commit themselves; End task only in the task detail sheet (sweeps yes, event
  tasks no). Everything derivable is derived; no per-sow negative confirmations. Row = two lines;
  lens = pig-state pair, negative first. (BRIEF "Non-negotiable laws".)

### B3 · `ux/research/farrowing/RULINGS.md` (settled law — outranks all)
- **Litter model**: Born = Alive + ΣDead + fostered out − fostered in; derived; locks at Finish.
  Born floor: alive may drop only by recorded bodies since the last count; below it the hand must
  `Record dead` or `Edit`; a vanished piglet post-lock goes through "the litter census (count
  drawer → just set count → unexplained anomaly), never a fabricated death". (Model.)
- **Dead causes**: stillborn · mummified · crushed · scours · starve-out · Other (euthanized under
  Other). (Model.)
- **No WHEN anywhere** — the stamp is the date; Today/Yesterday/Not-sure chips are dead. (Model.)
- **ONE dead drawer product-wide**; ONE correction door `Edit`; corrections print amber forever.
  (Surfaces & entrances; After the lock.)
- **Staged vs self-committing**: recording surfaces commit per tap; drawer and Edit are staged
  `Back · Save` with `Clear`. "No Save on recording surfaces." (Surfaces & entrances, exit grammar.)
- **Fostering is PARKED**: v1 ships **no foster doors anywhere**; ledger keeps foster terms with
  foster = 0. "Do not design, draw, or build foster flows until the owner reopens them."
  (After the lock.)
- **Provenance over sign-off**: anyone may amend, stamped; no role gate. (After the lock.)
- Style: words carry actions, icons only from a closed vocabulary (camera, scan, magnifier,
  funnel, grid, ›, +/−, ✎); status never an icon; no toasts; no submit buttons; dates relative
  within a week. (Names and glyphs; Style laws.)
- Type-to-set retired on count figures; pad grammar only where typing is real (ear tags,
  weights). (Surfaces & entrances.)

### B4 · `ux/research/farrowing/SYNTHESIS.md`
- Ledger is truth: `count = live-born − deaths ± fosters`; a disagreeing count is "news that one
  ledger line is missing". Working set = **day-cohort in crate walk order**; ladder survives only
  as the litter record's schedule strip. (§1.)
- Laws: assertion always commits, reasons are doors not gates; a tagged piglet is never
  subtracted namelessly; taps-per-piglet is the metric; **late is not gone** (missed treatment goes
  overdue, stamps actual who/when); timestamps must not lie. (§3.)
- Sins register: submit buttons, 提交后不可再查看, the count red wall, per-sow ladder as
  workplace, batch edit-table for tags, **the 结束任务 ceremony**. (§4.)
- Owner answers: tags visual + RFID; weights optional ("no enrichment field ever gates a
  confirm"); compliance = provenance, entry-time stamping stands; **no tag range management** (+1
  is a typing hint; duplicates warn, never block); notch-first/never/only all supported, lookup by
  notch wherever by tag; unexplained count = compliance anomaly on the console; **fosters ride the
  crate schedule** (`incl. 3 fostered · 2d older`); **overdue stays overdue**, no conversion in v1;
  offline duplicate marks dedupe as same litter · treatment · day. (§6, §7.)

### B5 · `count-entry-pattern.md`
- Three layers: posted fact · pending session buffer (− drains only the buffer) · correction as
  an event. Who/when always; why only on the amend path. Steppers tap deltas, numpads type
  absolutes. Large-variance soft check ("recount?") as a nudge. Blind count is console-someday.

### B6 · `count.md`
- Processing day with tag/weigh is "the most trustworthy number of the week"; bulk-treatment days
  are weak counts (§1). Under-report ≈ unrecorded death; over-report never a death (§1).
- Recommended: count row → drawer; non-zero delta renders doors `Record n deaths ›` ·
  `Record a foster ›` · `Just set count` (trail `2 unexplained`); never auto-add/remove (§3, §4).
- Tagged piglets can't be decremented anonymously — roster instead (§4).

### B7 · `identity.md`
- Two-role job; taps per piglet is the metric; error shapes: tagged-not-recorded (off-by-one
  cascade), recorded-tag-failed, duplicate, misordered, weight-to-wrong-piglet (§1).
- Range-armed conveyor, `Confirm & next` commits each piglet; scan overrides; sex Choice(2);
  notch optional; weight numpad with previous weight ghosted; subset legal (keepers-only);
  sex-count steppers only for the un-rowed remainder (§3, §4).

### B8 · `ladder.md`
- Hand works treatment-set-by-walk down the crate row; knows the schedule by heart; needs the app
  for *drift* (late farrowers, fostered-in, other hand's work) (§1).
- Mark = litter × day × treatment; **whole-litter default, exception by count** (`iron · 7 of 12`,
  residual stays due) (§2). Inline tokens on the cohort row recommended; conveyor only for
  tag/weigh day; bulk select = catch-up (§3).
- Behind schedule → tokens accumulate oldest-first, no forced order; refusal = count exception,
  no reason field; end-of-row catch-up is the normal case (§4).

### B9 · `ux/model/product-model.html`
- "Tasks do not own records. They observe events." Progress derived, never asserted (§2).
- Event catalogue: **Piglet treatments = Bulk** ("the age-day's treatments, ticked per litter,
  task only"); **Piglet tag/weigh = Conveyor** (ear tag*, notch, sex, weight); **Foster = Single**;
  **Count correction = Single** ("system vs observed, reason, allocations"); Death = Conveyor (§4).
- Law 2 payload decides bulk; Law 3 gate on the animal's state, not the surface; Law 4 one
  record, two doors (§5). Assign identity: ear tag* and sex* required (§6).

### B10 · Conflicts (internal ↔ internal, internal ↔ external)

| # | Conflict | Where |
|---|---|---|
| 1 | **Fostering**: PRD §1/§2 and count.md/SYNTHESIS §7.7 carry foster doors and fostered-in rules; **RULINGS parks fostering — no foster doors in v1**. HANDOVER still lists `Foster = Pairing, 12–48 h`. RULINGS wins → count.md's `Record a foster ›` door and the "incl. 3 fostered" line cannot ship as foster *actions*; the ledger still carries foster terms (= 0). External practice: fostering is routine and happens *before* processing (A5), so fostered litters will exist in the data. | RULINGS "After the lock"; count.md §3; SYNTHESIS §7.7; HANDOVER |
| 2 | **Late-death dating**: SYNTHESIS §7.5 rules Today/Yesterday/Not-sure chips; **RULINGS: "No WHEN anywhere … chips are dead."** RULINGS wins; count.md OQ3 is closed by it. | SYNTHESIS §7.5 vs RULINGS Model |
| 3 | **End task**: production and BRIEF keep End task in the detail sheet with "cannot backfill later"; SYNTHESIS §4 lists the 结束任务 ceremony as a sin; lifecycle.md §2 says sweeps **auto-close** at window end, End task = early close. SYNTHESIS §3 law 5 "late is not gone" contradicts production's "cannot backfill after end". Piglet processing is neither a clean sweep nor an event task (per-litter windows, lifecycle §4). | PRD §1; BRIEF; SYNTHESIS §2 row "Task lifecycle", §4; lifecycle.md §2, §4 |
| 4 | **Blocking dependency**: production blocks ending processing until farrowing's task ends; RULINGS/lifecycle make farrowing a standing surface that **never closes** ("it drains"). The dependency has nothing to wait on. | PRD §1/§2 config; lifecycle.md §4 |
| 5 | **Disabled rows**: product-model Law 3 says unavailable verbs are "disabled with a reason"; RULINGS: no dim-as-disabled except the Born floor. | product-model §5; RULINGS Style laws |
| 6 | **Identity required fields**: product-model §6 makes ear tag* and sex* required; SYNTHESIS §7.2 says notch-only farms exist (notch IS identity) and §6 "no enrichment field ever gates a confirm". | product-model §6 vs SYNTHESIS §6–7 |
| 7 | **Duplicate tags**: identity.md "refuse inline"; SYNTHESIS §7.1 downgraded to warn, never block. SYNTHESIS (later, owner) wins. | identity.md §3 vs SYNTHESIS §7.1 |
| 8 | **Save vocabulary**: BRIEF "no Save/Submit on any screen"; RULINGS allows `Back · Save` on staged surfaces (drawers, Edit). A count/death drawer opened from processing inherits `Save`. | BRIEF vs RULINGS exit grammar |
| 9 | **Treatment payload vs law**: PRD §2 "the mark is the record; no payload"; China's 养殖档案 rule requires drug name, time and **dose** for 兽药 (iron, toltrazuril, vaccine). | PRD §2 vs A2 (MOA regulation) |
| 10 | **Partial treatment**: production marks treatment per litter as bool; ladder.md proposes count exception (`7 of 12`, residual due); GAP/EU records "number affected" for teeth. Bool can't express "castrated 5 of 6 males, 1 hernia". | PRD §2 vs ladder.md §2 vs A2 |
| 11 | **Schedule shape**: production 1/2/3/5/7 with d5 tag/weigh & d7 health; external practice ranges from one-step (all at d3) to two-step (d1 + d3–5); castration windows 3–7 / 7–14; toltrazuril d3–5; second iron ~d14 (outside a d1–7 ladder). Ladder must be fully config-driven, including days beyond 7. | PRD §1 vs A1 |
| 12 | **Castration legal edge**: EU requires anaesthesia + vet after day 7; production schedules castration by config with "overdue stays overdue" (SYNTHESIS §7.8). A late castration mark on day 8+ is lawful only under vet/anaesthesia in the EU. Irrelevant for CN law as found, but relevant if export/certification schemes apply. | SYNTHESIS §7.8 vs A2 |
| 13 | **Cause list**: RULINGS dead causes (stillborn, mummified, crushed, scours, starve-out, Other) vs SYNTHESIS §9 (crushed, scours, starve-out, unknown). RULINGS wins. Stillborn/mummified are meaningless post-birth, so a processing-time death drawer shows a cause list where two of five defaults can't apply. | RULINGS Model vs SYNTHESIS §9 |
| 14 | **Count mismatch mechanism**: production auto-removes/adds; count.md routes deltas to doors; RULINGS names the post-lock route "count drawer → just set count → unexplained anomaly". Consistent between count.md and RULINGS, both against production. | PRD §1; count.md §3; RULINGS Model |

---

## C · Open questions for the product owner (behaviour only)

1. **Fostered litters while fostering is parked.** Farms foster before processing (A5). With no
   foster doors in v1, how does a hand explain a processing-day count that is up or down because of
   an unrecorded foster — `Just set count` (unexplained anomaly) only? And do fostered-in heads
   inherit the receiver crate's schedule (SYNTHESIS §7.7) even though the foster itself is never
   recorded?
2. **Partial treatments.** Is a treatment mark whole-litter bool (production) or a count
   (`castrate · 5 of 6`, residual stays due — ladder.md)? Castration is inherently males-only and
   has legitimate exclusions (hernia, cryptorchid, kept boars); does "castrate" count against males,
   and where does the male count come from if tag/weigh is later (d5) than castration (d3)?
3. **Dose/product on the mark.** Must the treatment record carry drug product, dose and batch to
   satisfy the 养殖档案 (A2), or does the console config snapshot at mark time suffice? Can a hand
   ever deviate (e.g. oral iron instead of injection, different vaccine lot)?
4. **End of the task.** Auto-close at a window end, manual End task, or no end (litters drain at
   weaning)? Is production's "cannot backfill after end" kept, or does "late is not gone" hold
   until weaning? What does the farrowing-must-end-first dependency mean when farrowing never ends?
5. **Overdue ceiling.** Does a treatment past its useful window (castration after day 7 under EU
   rules; toltrazuril after ~day 5; iron day 1 at day 10) stay due forever, convert, or expire?
   (SYNTHESIS §7.8 says overdue stays overdue in v1 — confirm for castration specifically.)
6. **Schedule beyond day 7.** Is a second iron at ~day 14 part of this task, and can a rung sit
   after the farm's weaning-prep boundary? Are one-step (all at d3) farms configured as a
   single-rung ladder?
7. **Double-treatment guard.** When a second hand marks a treatment already marked today, is that
   a silent dedupe (SYNTHESIS §7.9 offline rule), a warning, or recorded twice? Iron twice is a
   welfare incident, not a data duplicate.
8. **Count moments.** Is the processing-day head count a required observation (production's
   仔猪数量确认 on submit) or optional? Which day's count is authoritative for the on-time KPI
   denominator and the unit's piglet inventory?
9. **Deaths found during processing.** Processing is peak crushing time (A6). Does the hand record
   deaths from the processing surface via the ONE dead drawer, and which cause defaults apply to a
   live-born litter (stillborn/mummified don't)?
10. **Identity: which tag.** Is the 耳标 captured here the farm's management tag or the national
    动物防疫耳标 (left ear, within 30 days)? Does notching encode birth litter (US system) such that a
    later foster must not re-notch?
11. **Per-piglet vs litter weight.** Is litter total weight at the weigh day required, optional, or
    derived from per-piglet rows when every piglet is rowed? (Owner already ruled weights optional
    — confirm this covers the litter total and the birth-weight backfill.)
12. **Pre-fill of future days (可提前填).** When a later-day treatment is marked early, is the
    on-time KPI satisfied, and does the mark count against its scheduled day or the actual day?
13. **Postpartum ↔ processing overlap** (production designer's note): same pens, same days — one
    walk or two? Behavioural, touches the task model.
14. **EU/certification jurisdictions.** Is any target farm under EU-type rules (teeth/tail not
    routine, documented reason required)? If so, teeth/tail marks need a reason or an evidence
    trail, not just a tick.
</content>
</invoke>
