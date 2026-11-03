# Vaccination and medical tasks (免疫 / 医疗任务)

Handover root: `C:\Users\ying_\Documents\Sentri-Dahua-Handover\Sentri-Dhua`. All paths below are relative to it; everything is under `Vaccine/` (a git repo of its own, 36 commits, 2026-04-02 to 2026-08-14).

**Summary.** Vaccination (免疫) is a Console-planned, Mobile-executed flow: master data (疫苗管理, later 物料管理) -> plan (普免计划 fixed-date, 跟批免疫计划 event-triggered) -> auto-generated or manually created vaccine task (疫苗任务) -> Mobile execution by room and pen (接种任务) with backend-decided exemption warnings (豁免) -> optional immune-effect review (免疫复核) with lab sampling results written back, which can spawn 补充接种 (top-up) and 重新接种 (re-vaccinate) tasks. Medical tasks (医疗任务) are a thin layer on top: one "create task" entry that forks to the vaccine flow or a separate treatment flow (治疗任务, multi-dose courses). The Console is the planning and review surface; the Mobile app is the only place pigs are marked vaccinated or treated.

**Source of truth, in order.** (1) `Vaccine/prds/vaccine prd/` 00-08 (the newer PRD folder; 01 is now Material management); (2) `Vaccine/prds/medical-task/00-疫苗任务与治疗任务统一入口方案.md` for the unified entry and treatment; (3) `Vaccine/prds/vaccine prd/09-疫苗计划与疫苗任务测试用例.md` (2026-07-06) as the most precise statement of expected behaviour; (4) `Vaccine/src/` for what was really built, including Mobile treatment, which has no PRD; (5) the dev-environment test reports (07-14, 08-04, 08-18) for what the real product does. The older `Vaccine/vaccine prds/` folder is superseded. Figma (🖥 📱 免疫) drops some things the PRDs still describe: see the contradictions section.

---

## Current flow

### 0. Actors and terms

| Term | Meaning | Source |
|---|---|---|
| 免疫管理员 | Maintains master data and plans | `Vaccine/prds/vaccine prd/00-疫苗业务总览.md` |
| 调度员 | Creates tasks manually, watches progress | same |
| 现场接种员 | Vaccinates on Mobile | same |
| 实验室人员 | Enters sample results in Console | `.../08-免疫复核采样结果管理.md` |
| 后端规则引擎 | Decides exemption hits, generates tasks | `.../06-后端强制豁免规则.md` |
| 普免计划 | Calendar-type plan: fixed dates, optional repeat | `.../02-普免计划.md` |
| 跟批免疫计划 | Event-type plan: fires on production events, status, age | `.../03-跟批免疫计划.md` |
| 免疫复核 | Post-vaccination antibody check (was called 效果追踪 early on; renamed, see versions) | `Vaccine/AGENTS.md` naming rule |
| 补充接种 / 重新接种 | Top-up for unvaccinated pigs / full redo after a failed review | `.../04-疫苗任务.md` |
| 补打状态 / 补打原因 | Two attributes on a finished task: `需补打` / `已安排补打`, and why (`未接种`, review failed) | `.../04`, `.../07` |

### 1. Console: master data

1. Settings > 物料管理 (Material management; the old 疫苗管理 page was widened to all materials on 2026-06-29). Tabs: 饲料 / 药品 / 消耗品 / 工具 / 其他, always shown. Vaccines live under 药品 > 疫苗兽药 > 疫苗. Source `.../01-疫苗管理.md`.
2. Add one item (modal) or bulk-add via Excel template (`.xls`; general fields only). Missing required vaccine-specific fields still save, and the item is flagged `资料待完善` (data incomplete).
3. Vaccine-specific fields: vaccine type\*, administration method\*, dosage form\*, cold chain, storage temperature, single dose, duration of immunity, withdrawal period, immune interval days (免疫间隔期). Target antibody comes from the vaccine record (see `Vaccine/src/mockData.ts` catalogue).
4. Rule: plans and tasks copy a snapshot of the brand parameters at creation; later master-data edits never change existing plans or tasks (tests VX-014, VX-015 in `.../09-...`).

### 2. Console: plans (免疫计划)

Entry: Console left menu 免疫 > 疫苗计划配置 (`Vaccine/src/App.tsx` nav). Default view is the annual 免疫日历.

| Step | Screen and behaviour | Rules | Source |
|---|---|---|---|
| 2.1 | 免疫日历: 12-month calendar, dots with counts on dates that have a plan node or a real task. Click a date -> right drawer lists that day's cards. Plan cards open a read-only plan view; real-task cards open task detail. Back from detail returns to the calendar | Calendar page never enables or disables a plan. A "today" button must select today (bug BUG-03 / ST-02 on dev) | `.../02-普免计划.md`; tests VP-CAL-001..008 |
| 2.2 | 创建疫苗计划: modal to pick type, 普免 or 跟批 | Closing the modal without a choice creates nothing | `Vaccine/src/components/VaccinePlanPage.tsx`; VP-CAL-008 |
| 2.3 | Common form: plan name, production line, target pig group, **猪只筛选条件** (match ALL / ANY conditions; advanced filter), vaccine -> brand -> method -> dose -> unit (brand auto-fills method/dose/unit, all editable), 免疫复核 toggle | No estimated pig count shown; the text only says pigs matching at task time are added. Backend computes the real list at task time | `.../02`, `.../03` |
| 2.4 | 免疫复核 block (when on): target antibody (read-only, from vaccine), sampling method, sample container, check interval days (default 28), sampling ratio (default 5%), pass threshold (default 80%) | Required when on. Ranges validated (interval > 0; ratio and threshold 1-100) | `Vaccine/src/planEffectTracking.tsx`; VT-CRT-016 |
| 2.5a | **普免** date block: first date, repeat toggle, presets (monthly / quarterly / yearly / custom), end = never / on a date, or manual dates | Repeat and manual dates are mutually exclusive. Expanded dates are previewed and shown on the calendar. Max 120 generated dates in the prototype | `.../02`; `VaccinePlanPage.tsx` |
| 2.5b | **跟批** trigger block: one or more 下发规则 groups, each "event + offset" (e.g. 实际生产任务结束后 + 查情 + 结束后 1 天) | At least one group required. Production line(s) scope the plan. Task rows keep `生产线-批次` | `.../03`; dev report 07-14 |
| 2.6 | Preview page, then save | Save failure keeps the draft. Exemption rules are NOT configurable: payload carries `exemptions = []` | `.../06`; `VaccinePlanPage.tsx` lines 4068, 5490 |
| 2.7 | Plan list (per type) | List shows plan name, target group, merged "vaccine / method" column (vaccine on line 1, method line 2), review on/off, next date (普免) or execution time (跟批), enable switch, view icon. Brand, dose, last updated, creator only in detail | `.../02`, `.../03` |
| 2.8 | Plan detail | Plan info, pig filter conditions, vaccine info, task settings, review settings only if on, and at the bottom the plan's tasks (task ID clickable; 跟批 shows `生产线-批次` after ID and `目标猪只` before date; cancelled tasks kept for audit) | `.../02`, `.../03` |
| 2.9 | Enable / disable | Disabling is blocked or confirmed once tasks are issued or part-executed. Disabling only affects future generation; issued tasks continue. Editing a plan never touches already generated task snapshots | `Vaccine/vaccine prds/01-跟批免疫计划-PRD.md` and `02-普免计划-PRD.md` (old folder; the lock is only stated there and in `.../03`, `.../02` as "restricted"), VX-013, VX-014 |

Plan states (old PRDs, not restated in the new set): `DRAFT -> ACTIVE -> INACTIVE`; `Vaccine/vaccine prds/01-跟批免疫计划-PRD.md` section 3.3.

### 3. Task generation

| Step | What happens | Source |
|---|---|---|
| 3.1 | On the plan date (普免) or when an event fires (跟批), the backend builds a vaccine task: evaluates the pig filter at that moment, freezes a task snapshot (vaccine, brand, method, dose, date, review config), marks createType = 自动, stores production line and batch for 跟批 | `.../03-跟批免疫计划.md`, `.../04-疫苗任务.md` |
| 3.2 | Manual alternative: Console 疫苗任务 > 创建疫苗任务. Three steps: select pigs -> fill form (vaccine, brand, method, dose, unit, date, optional review block) -> preview -> submit. createType = 手动. No multi-dose, no interval fields | `.../04`; `Vaccine/src/components/VaccineTaskWizard.tsx` |
| 3.3 | Task starts as `待接种` and is pushed to Mobile as one task per pig. Task states: `待接种 / 接种中 / 已完成 / 已取消` | `.../09` header; VX-003 |
| 3.4 | While `待接种` the task can be edited (date, method, dose, unit, target pigs; same ID, Mobile rows regenerated) or deleted (state becomes `已取消`, Mobile rows removed, Console row kept for audit) | `.../04`, `.../07`; VT-CRT-024..025, VT-LST-010 |

### 4. Mobile: executing a vaccination task

Navigation and layout law: `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` (select location first, task cards on Home, workshop -> room drawer -> pig list; one main colour; touch targets >= 44px).

| Step | Screen | Behaviour | Source |
|---|---|---|---|
| 4.1 | Home task card | Title fixed "接种任务", top-right "已下发 X 天" (from task creation time), summary line (batch, vaccine), progress, enter hint. Whole card taps. Sits beside 断奶检查 and 治疗任务 cards | `.../05-Mobile接种任务.md` |
| 4.2 | Room / unit drawer | Shown when scope is a workshop: rooms with pending / total pigs, plus a "distribution" view. Skipped when scope is a single room | MOBILE_FIELD_LAYOUT section 5; VMOB-003..005 |
| 4.3 | Room task page, two tabs 免疫任务 and 任务详情 | Unit progress card (room, vaccine, brand, method, dose, done / total); search by ear tag, notch number, pen; filter all / pending / done; list grouped by pen with counts; tick all in room, tick all in pen, tick single | `.../05`; VMOB-005..012 |
| 4.4 | Exemption mark | A red "!" on a pig row. Tap opens a floating card with the specific reason from the backend. Never blocks | `.../05`, `.../06` |
| 4.5 | Bottom bar | One main action 接种 (batch). Disabled with no selection. The new PRD removes 移出接种列表 from this bar | `.../05` (new) vs `Vaccine/vaccine prds/05-Mobile接种任务-PRD.md` (old) |
| 4.6 | Single pig drawer | Pig, pen, state, exemption and immune-interval warnings, button 接种; for an exempt pig the button reads "仍然接种" and the result is recorded as `forced` (人工覆盖) | `.../06`; VMOB-017..019; `MobileVaccinationPage.tsx` |
| 4.7 | Interval warning | Copy: "{ear tag} last vaccinated with "{vaccine}" ({date}) and the immune interval of {N} days has not passed" (from old 05, test VMOB-019) | `Vaccine/vaccine prds/05-...-PRD.md` section 3.4 |
| 4.8 | 结束任务 (end task) | Confirm dialog shows done, not done, details; user must tick "I understand". Unvaccinated pigs stay for Console to top up later. Console task goes to `已完成` | VMOB-023..026 |
| 4.9 | Prototype extras (not in new PRD) | 暂缓 (defer) with an `Is_Retry` retry task cloned into a "补打" pool on Home; "本间完成" room close-out that warns about deferred pigs | `MobileVaccinationPage.tsx`; `Vaccine/docs/GLOBAL_IMMUNITY_DATA_FLOW.md` stage two |

### 5. Backend forced exemption (豁免)

1. Console has no exemption setting. Backend decides per pig at task creation and again on query, returning `exemptionHit`, a readable reason, rule code and rule version. Source `.../06-后端强制豁免规则.md`.
2. Mobile only renders. If the worker vaccinates anyway, backend records a manual override (`OVERRIDDEN_AND_VACCINATED`).
3. Rule engine failure degrades to "no hit" with an alarm; missing event dates mean that rule is "cannot compute", not silently passed.
4. The explicit 15-rule list (post-move 0-5 d, post-entry 0-7 d, 5 d before / after farrowing, 3 d before / 7 d after mating, current disease, <7 d since last vaccine, post-wean 0-5 d, after castrate / tail dock 0-3 d, after transport 0-3 d, after feed change 0-3 d, age 0-3 d, maternal antibody window 21-35 d by vaccine, peri-natal 7 d) is **only** in the old `Vaccine/vaccine prds/06-后端强制豁免规则-PRD.md`. The new 06 dropped it. See contradictions.

### 6. Console task detail

Entered by the eye icon in the plan's task list, the calendar, or a related-task bar. Layout is one vertical stack (`.../07`, `.../04`):

| Block | Content | Shown when |
|---|---|---|
| 所属免疫计划信息 | Plan name, type, created, plan state, enabled | Always; manual tasks fall back to a vaccine-name placeholder (VT-DTL-006) |
| 疫苗任务信息 | Task ID, state, vaccine, brand, method, dose, date, target scope, creator / time, operator / time once started, progress bar `已接种 / 目标接种` | Always |
| 免疫复核设置 | Echo of the config entered at creation | Only if review was on |
| 免疫复核结果 | Progress overview on top, metric cards below (current pass rate, positives, negatives, threshold, verdict) | Only after lab results are written back |
| 接种猪只列表 | Pig ID, `批次-生产线` (shows `—` if empty), room, pen, exemption hit; `已接种` and `未接种` groups; done rows show operator / time | Every state |
| 关联任务条 | Parent or child task links (补充接种, 重新接种) | If any exist |

| State | Edit | Delete | Main actions |
|---|---|---|---|
| 待接种 | yes | yes | Edit, Delete |
| 接种中 | no | no | Read progress, unvaccinated and exempt lists |
| 已完成 | no | no | 补充接种 (on 未接种 tab only), 重新接种 (on the review result card) |
| 已取消 | no | no | Audit only |

### 7. Follow-up tasks on a finished task

| Action | Visible when | Behaviour | Source |
|---|---|---|---|
| 补充接种 | `已完成`, unvaccinated pigs exist, `补打状态 = 需补打`, and **only on the 未接种 tab** | All unvaccinated pigs pre-ticked, user may untick some. Opens step 2 with vaccine, brand, method, dose, unit prefilled and locked; date empty and required. Step 3 button `完成补打`. New task is 待接种, createType 手动, linked to source | `.../04`, `.../07`; VT-SUP-001..008 |
| 重新接种 | Review result is 不合格 and 需补打; button on the 免疫复核结果 card | Target pigs = original target group. If some pigs already have a top-up task: confirm "already-arranged pigs will not enter the redo", then only the rest. Page title `重新接种`, final button `确认接种` | `.../04`, `.../07`; VT-REV-001..008 |
| Button disabled | A whole-batch redo already exists | 补充接种 greys out with a "?" hint "no need to top up, whole task being redone" | `.../07` edge cases |
| Review chain | Redo task has review on | Finishing it creates a new review sampling task; earlier rounds are kept | `.../08`; VRV-011 |

### 8. Immune-effect review (免疫复核采样结果管理)

Source `.../08-免疫复核采样结果管理.md`; code `Vaccine/src/components/ReviewSamplingManagementPage.tsx`. Console menu 免疫 > 免疫复核采样.

1. Trigger: a vaccine task with review on is finished (Mobile 结束任务 or all pigs done) -> Console auto-creates one review sampling task linked to it (VRV-001). No review -> nothing created (VRV-002).
2. List page: only the `已检测` tab remains; sub-tabs `常规检测` (one row per sampling task: antibody, container, target count, creator, result 合格 / 不合格, created time, view) and `免疫复核` (one row per pig sample: ear tag, antibody, container, creator, 阳性 / 阴性; view only, no upload).
3. 创建采样 button (top right) asks 病毒 or 抗体. 病毒 is a stub ("not open yet"). 抗体 opens a create page: antibody to test, sampling method, container, pass threshold, pick pigs; creates samples but does not show them in the checked list.
4. Result entry page `复核结果上传`: a field help block, pick the **detection unit** once for the round (S/P value, OD value, blocking rate, titre), search by ear tag or sample ID, one table row per sample with a detection value (stored only; it does not drive the verdict) and a result 阳性 / 阴性 chosen by the lab, bottom counter of filled rows, upload the report file. Leaving with unsaved input asks for confirmation.
5. Submit rule: 常规检测 needs every row filled; 免疫复核 can save progress in batches, but each started sample needs both value and result.
6. Maths: `pass rate = positives / total samples`; positive means qualified; `rate >= threshold` -> 合格, else 不合格 (20 samples, 14 positive = 70%, threshold 80% -> 不合格). Zero positives is a valid 0% result. Mismatch between sampled count and sample rows blocks submit.
7. Write-back to the vaccine task is immediate: review result block, 补打状态, 补打原因, and whether 重新接种 shows. If the write-back fails after submit, show "submitted but write-back failed" and retry in the background.
8. Detail page `复核结果详情`: summary (progress `uploaded / total` bar and metric cards; final when all uploaded) plus read-only sample rows.

### 9. Medical tasks: unified entry and treatment (医疗任务)

Source `Vaccine/prds/medical-task/00-疫苗任务与治疗任务统一入口方案.md` and its 5 change logs; code `MedicalTaskSchemePage.tsx`, `mobileTreatmentTaskUtils.ts`, `MobileVaccinationPage.tsx`.

**Decision: scheme A, "split at the door".** One "create task" button -> modal 选择任务类型 -> 疫苗接种任务 (existing vaccine flow, unchanged) or 治疗用药任务 (treatment flow). Scheme B (pick the drug first and let drug type decide the form) is kept as a long-term idea. Both are wired into the prototype menu 治疗 as "先选任务类型" (A) and "先选药品" (B).

| Step (Console, treatment) | Behaviour | Source |
|---|---|---|
| 9.1 Health page (健康诊疗) | Opens with no pig list. User must first narrow by pen / unit, disease tag, symptom tag or health-diagnosis status. Ear-tag search only narrows within an existing filter result (10^5 pigs assumed) | change log 2026-06-17 |
| 9.2 Selection bar | Green bar with count and 创建任务 appears only after >= 1 pig is ticked; hides again at 0 | change log 2026-06-19 |
| 9.3 Pick task type | Modal with the two cards; 下一步 | `MedicalTaskSchemePage.tsx` |
| 9.4 Config page | Top summary has 3 blocks only: creation method, target pig count, source (e.g. "健康诊疗 · 手动勾选" or disease / symptom tags); **never ear tags**. Then the drug form directly: no explanatory card between | change logs 2026-06-19 (x2) |
| 9.5 Treatment form | Pigs, drug (category: 兽药 / 保健品 / 消毒用品 / 其他), brand or form, administration method, dose + unit (mg / mL), start date, notes. `多次用药` off by default = one dose and no dose-count field. On = 剂次 (min 2, default 2), interval, interval unit | change log 2026-06-19; PRD 00 table |
| 9.6 Confirm | One confirm panel (not three cards): 任务信息 (content, time, target pigs) and 执行对象 (creation method, source, disease / symptom tags), buttons 上一步 / 确认下发 at its foot | change log 2026-06-29 |
| 9.7 Result | Separate business objects: vaccine task or treatment task / prescription. Suggested fields `taskCategory = medical`, `taskType = vaccination | treatment`, `source = vaccine_task | health_diagnosis | unified_create` | PRD 00 "状态与数据建议" |

Page skeleton for vaccine, veterinary drug and health product configuration is identical (summary, form, footer); only field content changes.

**Mobile treatment (code only; no PRD in the handover).** Home gets a 治疗任务 card (drug name, "dose N" pending, done / pending / total pigs), visible only while the task is not terminated. Opens a room drawer, then a list by pen. Per dose: select pigs and execute. "More" sheet: 跳过剂次 (skip dose, reason required), 移出处方 (remove pigs, reason required), 添加猪只, 终止处方 (terminate, reason required). Task states `执行中 / 已完成 / 已终止`; per-pig states `pending / done / skipped / removed`. A mock task: prescription `RX-25G009`, 3 doses, 24 h apart, with disease and symptom tags (`mobileTreatmentTaskUtils.ts`).

---

## Versions

Dates are from git (`git -C Vaccine log`), file mtimes and in-file dates. "Superseded" says which earlier thing the change replaced.

| Date | Change | Supersedes / effect | Source |
|---|---|---|---|
| 2026-04-02 | Vaccine Management project created (React, TS, Ant Design) | | git `bce234d` |
| 2026-04-07 | Catalogue gets dosage form, standard dose, immunity duration, withdrawal, routes, target pathogen | Basis of the later brand fields | git `3402993` |
| 2026-04-14 | Two learning notes written: four-stage immunity data flow and immune-effect review flow. Plan -> Mobile double check -> lab sampling -> PASS (archive plan) / FAIL (vet must confirm "wild virus excluded", auto 【效果补免】 task cloned from live headcount) | Early model; the FAIL branch is replaced by 重新接种 below (05-04, 05-18) | `Vaccine/docs/GLOBAL_IMMUNITY_DATA_FLOW.md`, `.../IMMUNE_EFFECT_REVIEW_FLOW.md` |
| 2026-04-15 | Plan opened from annual calendar becomes read-only | Calendar view never edits | git `ba198df` |
| 2026-04-20 | Mobile layout rules written (location first, task cards, drawer, one primary colour) | Still referenced as law in 2026-07 | `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` |
| 2026-04-23 to 05-03 | First PRD set "最新实现" in `Vaccine/vaccine prds/` 01-06. Front-end exemption configuration removed; backend fixed 15-rule list. Task form: vaccine, brand, dose, unit, date, **剂次**; only `未开始` tasks deletable. Mobile: bulk 接种 + 移出接种列表 | Replaced 2026-05-04 | old folder, git `51ea9d3`, `c2a45cb` |
| 2026-05-04 | New numbered PRD set `Vaccine/prds/vaccine prd/` 00-07 created (adds overview, plan detail and lists, task detail, edit / delete / 已取消, auto vs manual, first 补打 wording). Its 05 still had 移出接种列表 with a confirm step. Old folder touched for the last time same day | **Supersedes** the old folder entirely | git `c2a45cb` |
| 2026-05-18 | 08 免疫复核采样结果管理 added: per-sample lab entry, auto pass rate, write-back, 重新接种 chain. Same commit introduces the state word 已检测 in 07 (absent on 05-04) | Replaces the 04-14 "effect review page" idea (record sample count + positives only; vet checkbox; auto 效果补免) | git `2c109b8` |
| 2026-05-19 to 05-22 | Plan list and detail rewritten (merged vaccine / method column, brand to detail only); 04 is reworked around 补充接种 / 重新接种 and 补打状态 (13 mentions by 05-19); by 05-22 05 Mobile no longer has 移出接种列表 | Old 05 bottom bar replaced; 07 not updated to 已完成 | git `becca76`, `438a9a1` |
| 2026-05-20 | UI checklist: reuse field and state names across modules | | `Vaccine/docs/UI_CHANGE_CHECKLIST.md` |
| 2026-05-25 | "Rename antibody review tab": review list split into 常规检测 and 免疫复核 | | git `5e3c842` |
| 2026-06-01/02 | Unified access (login / register) flow decided. **Not task access; out of this area** | | `Vaccine/docs/UNIFIED_ACCESS_FLOW.md` |
| 2026-06-04, 06-08 | "Update vaccine calendar and task linking"; "Refine login and vaccine workflows" | Calendar and task-to-plan links | git `b495345`, `8e4c0c7` |
| 2026-06-17 to 06-19 | Medical-task change logs: health page needs filters first; green bar only after ticking; no explanatory card; multi-dose fields hidden by default; creation summary without ear tags | New treatment rules | `Vaccine/prds/medical-task/修改日志/` |
| 2026-06-20 | Medical-task unified entry plan 00 added; scheme A chosen for phase 1 | | git `71ba152` |
| 2026-06-29 | Confirm page becomes one panel (medical task). Same day 疫苗管理 widened to 物料管理 with unified material model and batch add | Old vaccine-only master data page; ARCHIVED state dropped | git `84a6226`, `.../01-疫苗管理.md`, change log 2026-06-29 |
| 2026-07-06 | 5-category material standard. Test-case document 09 written (task states fixed as 待接种 / 接种中 / 已完成 / 已取消; task types 疫苗计划 / 手动创建 / 补充接种 / 重新接种) | Fixes status wording for tests; 07 and AGENTS.md still use older words | `.../09-...`, change logs 2026-07-06 |
| 2026-07-14, 07-15 | Test of the real dev product: calendar, plans, task detail, history popup. 12 bugs (3 P1: calendar "today", plan date saved one day early, white screen on custom repeat date) | Shows the product has no manual create or task list page | `Vaccine/docs/测试报告-2026-07-14-免疫计划/` |
| 2026-07-29 | "Publish current vaccine workspace updates" | | git `fa6e73d` |
| 2026-08-04/05 | Integration test on Pixel 8: one pig vaccinated on Mobile, written back to Console. 4 confirmed defects incl. exemption count mismatch | | `Vaccine/测试报告/2026-08-04-疫苗功能联调/` |
| 2026-08-14 | 01 material doc updated for the inventory category change | | git `a739577` |
| 2026-08-18 | Multi-role dev test: do not release. 11 P1, 14 P2, 1 P3 | Open defects, see contradictions | `Vaccine/docs/测试报告-2026-08-18-免疫计划-多角色.md` |
| 2026-08-24 | Console information-architecture prototype: task center, search, pinned favourites (includes 免疫计划, 健康诊疗) | Menu context | `Vaccine/docs/修改日志-2026-08-24-Console信息架构原型.md` |
| 2026-09-03 | Offline test of Mobile production tasks. Vaccine side only incidental: 73 `vaccinationTask` rows cached, vaccine cards push production tasks off the first screen | | `Vaccine/docs/offline-test-2026-09-03/` |
| undated | Figma: manual vaccine task creation marked "先不做"; vaccine task list pages marked "没了"; Mobile pen pig list, 本间完成 second confirm, grid view dropped | Aligns with dev behaviour, not with PRD 04 | `references/figma/web/index.md` |

---

## Superseded and duplicate material

| File | Date | Status | Superseded by | Note |
|---|---|---|---|---|
| `Vaccine/vaccine prds/01-跟批免疫计划-PRD.md` | 2026-04-23 | superseded | `Vaccine/prds/vaccine prd/03-跟批免疫计划.md` | Still the only place with plan state machine `DRAFT/ACTIVE/INACTIVE`, field table, brand-less edge case |
| `Vaccine/vaccine prds/02-普免计划-PRD.md` | 2026-04-23 | superseded | `.../02-普免计划.md` | Same; adds recurrence fallback rule (expansion failure falls back to manual dates) |
| `Vaccine/vaccine prds/03-疫苗任务-PRD.md` | 2026-05-03 | superseded | `.../04-疫苗任务.md` | Has 剂次 field and `未开始` delete rule |
| `Vaccine/vaccine prds/04-疫苗管理-PRD.md` | 2026-05-03 | superseded | `.../01-疫苗管理.md` (now 物料管理) | Only source of ACTIVE / ARCHIVED rule and "no hard delete of referenced brands" |
| `Vaccine/vaccine prds/05-Mobile接种任务-PRD.md` | 2026-04-23 | superseded | `.../05-Mobile接种任务.md` | Old bottom bar (接种 + 移出接种列表); only copy of interval-warning wording and wire-frame navigation rules |
| `Vaccine/vaccine prds/06-后端强制豁免规则-PRD.md` | 2026-04-23 | superseded but **content lost** | `.../06-后端强制豁免规则.md` | Only copy of the 15 fixed rules, rule-version fields and state machine. Keep as reference |
| `Vaccine/prds/vaccine prd/00-疫苗业务总览.md` | 2026-05-18 | current | | Module map and main chain; mermaid has a typo (two nodes labelled K) |
| `.../01-疫苗管理.md` | 2026-08-14 | current (retitled "物料管理") | | Whole-material doc, vaccine is one category |
| `.../02-普免计划.md`, `.../03-跟批免疫计划.md` | 2026-05-22 | current | | Status words differ: 02 says 进行中, 03 says 接种中 |
| `.../04-疫苗任务.md` | 2026-05-22 | current | | Most complete task rules |
| `.../05-Mobile接种任务.md` | 2026-05-21 | current, thin | | Does not describe 结束任务, 暂缓 or the retry pool that the code has |
| `.../06-后端强制豁免规则.md` | 2026-04-29 | current, thin | | See above |
| `.../07-Console接种任务详情.md` | 2026-05-22 | stale in wording | `04` for status words | Uses 已检测 and 进行中 where 04 uses 已完成 and 接种中; flow logic still right |
| `.../08-免疫复核采样结果管理.md` | 2026-05-25 | current | | Internally inconsistent on partial save (see contradictions) |
| `.../09-疫苗计划与疫苗任务测试用例.md` | 2026-07-06 | current (tests) | | Most recent statement of expected behaviour; 41 KB |
| `Vaccine/prds/vaccine prd/修改日志/` (11 files) | 2026-06-29 to 2026-09-08 | mostly **unrelated** | | Only the 07-06 test-case entry concerns vaccines; the rest are inventory, material model, Mobile toolbox / workbench / stocktake UI. Filed here by mistake |
| `Vaccine/prds/medical-task/00-...统一入口方案.md` | 2026-06-20, edited 06-29 | current | | Phase 1 only |
| `Vaccine/prds/medical-task/修改日志/` (5 files) | 2026-06-17 to 06-29 | current | | Rules already folded into 00 |
| `Vaccine/docs/GLOBAL_IMMUNITY_DATA_FLOW.md` | 2026-04-14 | stale / exploratory | PRDs 04, 07, 08 | Status column (✅/🟡/⬜) is out of date. Useful for the four-stage idea and key naming |
| `Vaccine/docs/IMMUNE_EFFECT_REVIEW_FLOW.md` | 2026-04-14 | stale / exploratory | `08` | Records an earlier abandoned attempt (reverted; Tailwind clash) |
| `Vaccine/docs/UNIFIED_ACCESS_FLOW.md` | 2026-06-01 | out of area | | Login / register / join-site flow, not task access |
| `Vaccine/docs/MOBILE_FIELD_LAYOUT.md` | 2026-04-20 | current (style law) | | Applies to all Mobile modules |
| `Vaccine/docs/UI_CHANGE_CHECKLIST.md` | 2026-05-20 | current | | Process rules, no product flow |
| `Vaccine/docs/测试报告-2026-07-14-免疫计划/` (3 files + screenshots) | 2026-07-14/15 | current evidence | | Test of dev.sentri.cn, not the prototype |
| `Vaccine/测试报告/2026-08-04-疫苗功能联调/` | 2026-08-04 | current evidence | | Real device + dev; bug numbers reuse 07-14 IDs (BUG-03, BUG-04 marked "historical") |
| `Vaccine/docs/测试报告-2026-08-18-免疫计划-多角色.md` | 2026-08-18 | current evidence | | Rewritten with new IDs ST-01..26; English UI labels |
| `Vaccine/docs/offline-test-2026-09-03/` | 2026-09-03 | peripheral | | Production tasks, not vaccines |
| `Vaccine/AGENTS.md` | 2026-07-13 | current (rules) | | Naming rules, PRD format, no field dictionary |

---

## Where it is in Figma and the repo

Web Figma file for all Console immunization screens: 🖥 📱 免疫, key `8BkIL2azMuBS2w6Vn26Cac` (indexed in `references/figma/web/index.md` under "Immunization · 免疫", 59 screens). The repo's `features/` are all mobile and contain no immunization feature.

| Flow / screen | Figma (file 🖥 📱 免疫, node) | Repo `features/` | Relation |
|---|---|---|---|
| 免疫日历 (calendar, today panel, upcoming, date list modal, first-use, history of vaccine tasks) | `11748:13312` (1920), `12012:10234` (1440), `11849:10712`, `12053:20945`, `12053:21472`, `11849:9240`, `11676:12555`, `11878:21483` (history, status unclear) | none | Calendar is current in Figma and in dev; PRD only describes it inside 02 |
| Create plan: type chooser, 普免 and 跟批 forms, custom repeat, advanced filter, task settings | `11004:3454`, `11004:2810`, `11013:1050`, `11082:6919`, `11084:7544`, `11037:6232`, `11024:8228`, `11092:10140` | none | Same job as 02 / 03. Two frames named 废弃 (`11128:9844`, `11139:10710`) are archived |
| Plan list and detail | `12053:16307` (empty), `12053:16620` (跟批 list), `11017:1896` (普免 detail), `11092:7263` (跟批 detail), `11849:9567` (state sheet) | none | Matches 02 / 03 |
| Task detail by state, tabs 任务详情 and 任务猪只列表 | `11019:3284`, `11536:12508` (待接种), `11081:5660`, `11536:13025` (接种中), `11081:6410`, `11536:13810` (已接种), `11684:16663` (related tasks) | none | Matches 07. State sheets `11536:14768`, `11531:11441`, `11531:11609`, `11536:12067` are reference |
| 补充接种 / 重新接种 | `11169:10470` | none | Matches 04 / 07 |
| Create vaccine task (3 steps + pig list) | `11019:3521`, `11022:6658`, `11022:8027`, `11024:3562` marked "这个功能先不做" | none | **Conflicts** with PRD 04 and the prototype wizard |
| Vaccine task list (4 frames) | `11017:2647`, `11019:2803`, `11017:2699`, `11019:2122` marked "这些页面没了" | none | **Conflicts** with PRD 04 list section and 09 section 6 |
| Mobile: overview, choose task, task detail list, unit single dose, goal reached / not reached, more actions, result | `11047:13784`, `11047:13667`, `11056:5538`, `11067:6734`, `11047:13941`, `11416:9530`, `11416:9562`, `11416:9786`, `11141:21702`; health jump `11416:9883` | `pig-profile` (single-pig "Record vaccination" task card only) | Figma is room / unit based like the PRD; repo thinks single pig |
| Mobile: grid view, pen pig list, 本间完成 second confirm | `11067:5850`, `11067:6234`, `11067:6634` archived | none | Dropped; prototype still has 本间完成 |
| Mobile: 结束任务 (two frames, red note "执行详情没意义"), 移出接种列表 | `11067:7385`, `11067:7463`, `11067:6654` (unclear) | none | 结束任务 is kept in PRD / code; execution-detail block questioned |
| Vaccine / material management | `11024:4223` (疫苗管理), `11024:4145`, `11024:7930`, `11076:9170`; heading says "药品管理（还要改，改成入库出库）" | `treat` (Medicines page and catalogue, Home > Toolbox > Medicines) | Figma draft, handover PRD 01 and `treat` each define a different taxonomy and owner |
| Immune-effect review lab entry (Console) | not found in the immunization file | none | Lab pages may sit in 🖥 采样与检测 (`WJYP32oqthOUHOa7xdjDcb`, node `6001:4860`); not compared |
| Sampling on the phone (collecting samples) | mobile file 采样与检测 `PqMXbJLyoJ9lFGjmqBv5Cs`, node `6032:6415` | `sampling` (placeholder, "Not designed yet") | Handover PRD 08 has no Mobile sampling step |
| Unified medical-task entry (modal, 疫苗 vs 治疗) | not in Figma | none | Prototype only |
| Console treatment creation (health page filters, config, confirm) | not in Figma | none | Prototype only. Related health pages: `triage` (draft), `disease`, `health-record` |
| Mobile treatment task (dose, skip, remove, add pigs, terminate) | mobile file 健康与治疗 `pvx1wum54VYOsIjep7haoZ`, node `6003:11580` (28 screens, 9 groups, dated 2025.9.4) | `prescriptions` (placeholder, "Not designed yet"); `treat` is the ad-hoc, per-pig version | Same job as handover Mobile treatment. `prescriptions` PRD defines it as "a planned or prescribed course, dose by dose" |
| Ad-hoc treatment of a sick pig | none | `treat` (designed; decided 2026-10-19 that vaccination is a task, a course is `prescriptions`) | No handover equivalent; handover treatment is always a created task |

---

## Contradictions and open questions

### Contradictions between documents

| # | Topic | A says | B says | Notes |
|---|---|---|---|---|
| 1 | Task state words | `.../04`, `.../09`, code: 待接种 / 接种中 / 已完成 / 已取消 | `.../07`: 待接种 / 进行中 / **已检测**. `Vaccine/AGENTS.md` and `.../02`: 待接种 / 进行中 / 已完成. Old `Vaccine/vaccine prds/03`: 未开始 | 09 explicitly forbids 进行中 and 未开始. Figma archived list frames still say 未开始 / 进行中 |
| 2 | Manual task creation and task list page | PRD 04, 09, prototype: Console has 创建疫苗任务, a state-tabbed list, delete icon | Figma marks create "先不做" and list "没了"; dev product tests (07-14, 08-18) show calendar + plan + detail only | PRD 04 may describe a dropped surface. Needs an owner call |
| 3 | Where task types come from | 04: createType only 自动 / 手动 | 09 and code: four types 疫苗计划 / 手动创建 / 补充接种 / 重新接种 | The two lists are different dimensions that got merged |
| 4 | Mobile batch 接种 confirmation | Old 05: "no confirmation" | 09 (VMOB-014/015) and code (title "确认接种"): confirm dialog | New 05 is silent |
| 5 | 移出接种列表 | Old 05 had it; new 05 removes it ("不处理") | Figma keeps one confirm frame (unclear) | Moving pigs out now only happens by editing a 待接种 task |
| 6 | Exemption semantics | 06: advisory warning, worker may override, override logged | `VaccinePlanPage.tsx` copy (still in code): "豁免期内自动跳过接种，待状态恢复后系统自动安排补打" | Two meanings: warn vs skip-and-reschedule. Also GLOBAL doc: warn then 强制接种 (reason) or 暂缓 |
| 7 | Exemption rule list | Old 06: 15 fixed rules, versioned | New 06: no list, says only "backend fixed rules, versioned" | The rules exist nowhere else in the handover |
| 8 | Exemption config in code | PRDs: removed | `VaccinePlanPage.tsx` still holds a full rule builder (PRE_START / POST_END / POST_TRANSFER / POST_ENTRY / STATUS / DISEASE / SYMPTOM), saved as `exemptions: []` | Dead code or half-removed |
| 9 | Unvaccinated pigs after task end | New 04 / 07: top-up from Console (补充接种) | Code and GLOBAL doc: Mobile 暂缓 -> `Is_Retry` retry pool + 本间完成 warning | Two routes for the same pigs |
| 10 | Review: partial entry | 08 goal text: "不允许部分提交 / one-shot" | 08 entry table: 免疫复核 can save in batches | Same doc. Test VRV-004 flags it |
| 11 | Review verdict | 08: lab marks 阳性 / 阴性 by hand; detection value is only stored | Early notes: lab enters sample count and positives only, system derives rate | Same maths, different entry grain; old notes are superseded |
| 12 | Failed review follow-up | 04 / 07 / 08: Console user presses 重新接种 on the original target pigs | GLOBAL / IMMUNE notes: vet confirms "wild virus excluded", system clones task from live headcount with 【效果补免】 tag, passing plan is archived | Vet gate, live-headcount cloning and plan archiving are dropped. Not recorded as a decision |
| 13 | 补充接种 inheritance | 04: prefilled and locked | Dev product (ST-21): fields empty, user must re-pick | Dev is behind the PRD |
| 14 | Related status columns on list | 04: list hides 补打状态 / 原因 | 07 / 09 (VT-SUP-001): detail shows them; list not mentioned | Probably detail only |
| 15 | Master-data lifecycle | Old 04: ACTIVE / ARCHIVED, delete = archive | New 01: confirm then delete the row; "backend should archive" | Rule weakened to a suggestion |
| 16 | Master-data taxonomy | Handover 01: 饲料 / 药品 / 消耗品 / 工具 / 其他; 药品 = 疫苗兽药 (疫苗 / 兽药) or 保健品 | Medical-task prototype: 疫苗 / 兽药 / 保健品 / 消毒用品 / 其他. Repo `treat`: Antibiotics, Pain relief, Parasite control, Vaccines, Hormones, Vitamins, Other. Figma: 药品管理 draft "改成入库出库" | Four taxonomies for one list |
| 17 | Vaccination unit | Handover and Figma: batch task, executed by room and pen | Repo `pig-profile`: vaccination is a single-pig task completed by saving "Record vaccination" | Different task grain |
| 18 | Multi-dose | Vaccine: removed on purpose (no 剂次, interval) | Treatment: kept (剂次 >= 2, interval) | Intentional split (`medical-task/00` non-goals). Old 03 still lists 剂次 |
| 19 | Medical-task phase 1 vs prototype | Plan: entry split only | Prototype adds scheme B in the menu | Prototype ahead of plan |
| 20 | Entry name | Plan 00 open question: 创建任务 or 创建医疗任务? | Prototype modal: 选择任务类型 | Unresolved |

### Defects on the real product that expose unclear behaviour

| Item | Evidence | What it reveals |
|---|---|---|
| Plan date saved one day early | BUG-07 (07-14), ST-01 (08-18), still open 08-04 | Date must be a plain calendar date, not a timestamp |
| New plans default to 停用 and show no estimated pigs | BUG-08, BUG-09 | PRD never says what a new plan's state is |
| Zero-pig plans can be enabled; impossible filters accepted | ST-04 | Needs validation and a "no matches" rule |
| Exemption summary says 5 but rows say Miss | ST-07, ST-26 | Hit count and per-pig flag come from different sources; Hit / Miss wording is confusing |
| 10 of 74 task pigs have no pig ID and no batch | ST-08, BUG-02 | Pig identity is not guaranteed in a task |
| Review toggle on, antibody field empty and disabled | ST-06 | Target antibody must default from vaccine or be selectable |
| Duplicate 跟批 dispatch rule groups saved | ST-05 | No de-duplication rule in PRD 03 |
| Line shown as internal ID `LINE-3A5D0651` | BUG-05, ST-11 | Display name missing |
| History popup shows `-` for actual date on part-done tasks | BUG-12 | No rule for "actual vaccination date" on partial completion |
| Vaccine cards crowd production tasks off Mobile home | OT-10 (09-03) | Home ordering rule missing |

### Open questions

1. Is Console manual task creation (and the task list) in or out? Figma and the dev product say out or deferred; PRD 04, 09 and the prototype say in.
2. Which doc owns the 15 exemption rules now? Who edits them? Does a hit warn only or also auto-skip and auto-reschedule?
3. Does the Mobile 暂缓 / 补打 pool survive, or is 补充接种 from Console the only route?
4. Where do review samples get collected on Mobile? 08 only covers lab entry; repo `sampling` is a placeholder.
5. What is the expected default state of a new plan, and how is "enabled with zero matching pigs" handled?
6. Is the vet confirmation and plan archiving after a passing review wanted? It is not in any PRD.
7. Treatment: is it a task or a prescription object that generates dose tasks (backend question 4 in `medical-task/00`)? Who expands multiple doses, at creation or by scheduler? No Mobile treatment PRD exists.
8. Where does the unified medical-task entry live: vaccine page, health page or a new page (frontend question 1)? Prototype puts treatment under its own 治疗 menu.
9. Which taxonomy is the medicine list? The handover (5 material classes) or the repo `treat` catalogue? Who owns it: Settings 物料管理 or Home > Toolbox > Medicines?
10. How do the repo's ad-hoc `treat`, planned `prescriptions` and a vaccination task map onto the handover's single "treatment task" concept?
11. Should plan state `DRAFT/ACTIVE/INACTIVE` and the master-data `ARCHIVED` rule be restored into the new PRDs? They exist only in the old folder.
12. Permission differences were not tested (07-14 report); concurrency, network failure and real cross-day generation are also untested (08-18 section 13).

## Corrections found while writing the workflow specs (2026-11-03)

- §4, deferral (暂缓): the clone helper `spawnRetryTask` exists, but no screen calls it. The pig drawer offers only 接种 or 仍然接种, and the re-do list is still rendered.
- §8: `ReviewSamplingManagementPage.tsx` still has the tabs 待采样, 待检测 and 已检测, plus a 继续上传 action. It is not "已检测 only".
- §9: the treatment dose units also include grams (克). The prototype's treatment form and confirm panel show static mock values.
