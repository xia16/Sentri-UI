# Dahua handover: old flows

The Sentri/Dahua handover is a zip of PRDs, changelogs, test reports and two runnable prototypes. The previous team wrote it between 2026-04 and 2026-10. It covers Console and Mobile work that this repo has not designed: inventory, vaccination, treatment tasks, culling and replacement, semen, feed, the Console menu, login and access, and transfers. This folder is an English map of it, made on 2026-11-02. Each doc gives the newest flow, how it got there, what is stale or duplicated, and where the same job sits in Figma and in `features/`.

The handover itself is not in the repo. It lives at `C:\Users\ying_\Documents\Sentri-Dahua-Handover\Sentri-Dhua`, and every path in these docs is relative to that folder. Most of its ~290k files are `node_modules`. The material is ~700 Markdown files, mostly dated changelogs (修改日志).

**When someone says "look at the old flows", check three places:**

| Era | What | Where |
|---|---|---|
| Old app UI (Figma, before this repo) | Mobile production tasks, inspection, pig list, health, sync, sampling | [../figma/index.md](../figma/index.md) |
| Old web/console UI (Figma, indexed 2026-10-19) | Workbench, barns, immunization, biosecurity, users and access, settings, console setup | [../figma/web/index.md](../figma/web/index.md) |
| Dahua handover (PRDs + prototypes, 2026-04 → 2026-10) | The areas below | this folder |

## Areas

| Doc | Covers | Platforms | Newest source in the handover | In Figma? | In `features/`? |
|---|---|---|---|---|---|
| [inventory.md](inventory.md) | Stock in, stocktake, scrap, ledger, negative stock, receipts, purchase orders, task deduction rules | Console-first; Mobile toolbox: view stock, receive, count | `Inventory management/Inventory PRD/05` (08-26) + `02-Mobile` (09-09) + `06` back end; changelogs to 08-14 | No (`[Web] 库存管理` is an empty cover) | No; `treat` and `feed-plan` leave stock to "future inventory" |
| [vaccination-and-treatment.md](vaccination-and-treatment.md) | Material master, blanket and batch-following vaccination plans, vaccine tasks, Mobile room/pen vaccination, forced exemption, immune-effect review, unified vaccine/treatment entry | Console plans, Mobile executes | `Vaccine/prds/vaccine prd/` 00–09 (the top-level `Vaccine/vaccine prds/` is the older copy) + `prds/medical-task/00` | Partly: 🖥 📱 免疫 | `treat`, `prescriptions` overlap; no vaccination feature |
| [culling-replacement-semen.md](culling-replacement-semen.md) | Sow culling plan and scoring, culling review on Mobile, keep for breeding (留种), piglet scoring, semen management and matching, sale (brainstorm only) | Console plans and confirms; Mobile reviews and marks; semen is Console-only | `Vaccine/prds/culling&replacement/` 00–05 + rc.7 piglet scoring (08-06); `prds/semen/00` | No | `keep-breeding` (same core job, different untagged-pig model) |
| [console-ia-workbench-access.md](console-ia-workbench-access.md) | Console menu (two competing versions), Console and Mobile home/toolbox, login and farm choice, staff and visitor entry, onboarding, offline test findings | Both | `线上Console侧边栏整理预览.html` (08-25) for the online Console; `prds/saas-login/04` (07-03) for login | Diverges from "Users and access" and "Console setup" | `workbench`, `data-sync` |
| [transfers-feed-lines-legacy.md](transfers-feed-lines-legacy.md) | Transfers and pig exits (no PRD), feed management PRD v2.1, production lines, the old `Sentri-UI/` copy | Both | Feed: `Sentri_Feed_Management_PRD_v2_1_中文.html`; transfers: scattered | Workbench 转舍 drawer only; `[Web] 饲喂计划` is empty | `move` (draft from the same deck), `feed-plan` |

## Workflows

One spec per job in [flows/](flows/). Each spec has the job, the trigger, a flow diagram, steps by platform, states, rules, data, edge cases, versions, its Figma/repo match and open questions.

Maturity: **built** = specified and built in the handover's prototype · **spec** = specified, no screens · **code** = built with no PRD · **live** = seen only on the real product in a test report · **idea** = brainstorm.

| Area | Workflow | Platforms | Maturity |
|---|---|---|---|
| Inventory | [Material master](flows/material-master.md) | Console | built |
| | [Stock overview](flows/stock-overview.md) | Console, Mobile | built |
| | [Receive stock](flows/receive-stock.md) | Console, Mobile | built |
| | [Stocktake](flows/stocktake.md) | Console, Mobile | built (the difference-handling branch is legacy) |
| | [Scrap a batch](flows/scrap-expired-batch.md) | Console | built |
| | [Negative-stock correction](flows/negative-stock-correction.md) | Console | built |
| | [Manual issue](flows/manual-issue.md) | Console | built, but out of the back-end design |
| | [Generate purchase order](flows/purchase-order.md) | Console | built (changelogs only) |
| | [Deduction from tasks and events](flows/task-stock-deduction.md) | Back end | spec |
| Vaccination and treatment | [Vaccination plans](flows/vaccination-plan.md) | Console | built |
| | [Vaccine task](flows/vaccine-task.md) | Console | built |
| | [Mobile vaccination](flows/mobile-vaccination.md) | Mobile | built |
| | [Forced exemption](flows/vaccination-exemption.md) | Back end | built (display only; the rule engine isn't in the handover) |
| | [Immune-effect review](flows/immune-effect-review.md) | Console | built (the PRD and the prototype disagree) |
| | [Treatment task](flows/treatment-task.md) | Console, Mobile | Console built; Mobile code |
| Culling, replacement, semen | [Sow culling plan](flows/culling-plan.md) | Console | built |
| | [Cull review and confirmation](flows/cull-review.md) | Mobile, Console | built |
| | [Replacement plan](flows/replacement-plan.md) | Console | built |
| | [Keep for breeding](flows/keep-for-breeding.md) | Mobile, Console | built; compared with `features/keep-breeding` |
| | [Semen production and stock](flows/semen-production.md) | Console | code |
| | [Semen matching and picking](flows/semen-matching.md) | Console | spec |
| Console, home, access | [Console workbench](flows/console-workbench.md) | Console | code |
| | [Mobile home and toolbox](flows/mobile-home-toolbox.md) | Mobile | code |
| | [Login and farm switching](flows/login-and-farm-switch.md) | Console | built |
| | [Staff registration and presence](flows/staff-registration-and-entry.md) | Console, web | built |
| | [Visitor entry](flows/visitor-entry.md) | Console, web | built (illustration only) |
| | [Onboarding / setup hub](flows/onboarding-setup.md) | Console | built (demo wiring incomplete) |
| | [Offline production tasks](flows/offline-production-tasks.md) | Mobile | live; compared with `features/data-sync` |
| Movement, feed, lines | [Pig transfer](flows/pig-transfer.md) | Mobile, Console | built for single and mixed moves; group transfer implied |
| | [Pig exit and sale](flows/pig-exit-and-sale.md) | Console | idea |
| | [Feed requirement resolution](flows/feed-requirement.md) | Back end, Console | spec |
| | [Feed stock and reconciliation](flows/feed-stock-reconciliation.md) | Console, Mobile | spec |
| | [Production line setup](flows/production-line-setup.md) | Console | live |

## Versions at a glance

| When | What happened in the handover |
|---|---|
| 2025-11 | Domain primers: `General copy/Sentri_Primer.md`, `Pig_Status.md` (pig statuses, production lines, single and group transfer). |
| 2026-04 | Vaccine prototype starts (`Vaccine/` git, 04-02). First vaccine PRDs (`Vaccine/vaccine prds/`). Brainstorms for culling and sale; the culling-task model is dropped on 04-22. |
| 2026-05 | Numbered vaccine PRD set (`prds/vaccine prd/`) replaces the first set on 05-04. Immune review moves to per-sample lab entry on 05-18. |
| 2026-06 | Inventory PRDs become the dev baseline (06-17). Big inventory churn on 06-24 to 06-30: stocktake modes, auto-freezing expired stock, a difference-handling page. Medical-task unified entry (06-29). New login (07-03). |
| 2026-07 | Inventory simplifies: direct stocktake, five categories, no safety stock, one receive workbench. Replacement moves to a shared Console/Mobile list (07-23 to 07-28). Production-line test report (07-28). |
| 2026-08 | Inventory categories settle on four (08-07). Feed goes in and out of stock (08-10 to 08-14). Event-driven deduction rules (08-19). Sow culling score V1.3 (08-13). Console "revised home 1" (08-07 to 08-17), then the online-Console IA preview (08-21 to 08-25). Mobile inventory redesigned (08-20 to 08-26). Last commit in the `Vaccine/` git is 08-14. |
| 2026-09 | Offline test of the real Android app (09-03). Mobile stocktake filters (09-09). Semen bug reports from `dev.sentri.cn` (09-11, 09-15). The `Sentri-UI/` copy matches this repo at `4d2fbd83` (09-22). |
| 2026-10 | Last changelogs in the `Sentri-UI/` copy (10-10 to 10-12). |

## Where the areas meet: one flow, not four

These docs were written one area at a time, but several areas describe the same object in different ways. Where they disagree, this is the combined reading to use when designing. Each item is a design suggestion and needs the owner's call before it becomes a rule.

1. **One material list.** Medicine is classified four ways:
   - inventory: 疫苗 / 兽药 / 保健品, one level since 07-08;
   - the vaccine-folder 物料管理 PRD: five classes;
   - the medical-task prototype;
   - the repo's `treat` Medicines catalogue.

   Combined reading: one material master, owned by inventory, with the flat three-way medicine class. Vaccination plans, treatment and `treat`'s Medicines list all read from it, and only stock fields stay Console-side. Sources: [inventory.md](inventory.md) "Shared model", [vaccination-and-treatment.md](vaccination-and-treatment.md) contradiction 16.
2. **Tasks deduct stock when they finish.** Vaccine tasks, treatment tasks and feed plans write stock out through events (`Inventory PRD/06`). A finished task deducts what was actually used, FEFO, and may push stock negative; production is never blocked. So the Mobile task pages have to record a material ID and amount. The repo's `treat` records free-text medicine today. Source: [inventory.md](inventory.md) "Back-end deduction rules".
3. **Feed stock is a projection.** There are three models: the feed PRD (purchases minus curve consumption, closed by optional counts), inventory after 08-14 (预计库存 plus days of supply, no batches), and back end `06` (SKU total). Combined reading: they agree if feed stock means projected balance, corrected by counts, without batches. Feed is then not counted in the inventory stocktake, which takes medicine and semen only. Sources: [inventory.md](inventory.md) contradiction 3, [transfers-feed-lines-legacy.md](transfers-feed-lines-legacy.md) (b).
4. **One semen stock.** Semen stock is kept twice: an inventory category with per-batch rows, and the semen module's own 库存 tab. Combined reading: the semen module owns the batches and inventory only lists them. Sources: [inventory.md](inventory.md) contradiction 8, [culling-replacement-semen.md](culling-replacement-semen.md) §3.
5. **Culling ends where transfer starts.** Culling is a decision: the Console suggests, the Mobile weaning check reviews, the Console confirms. Moving or selling the culled sow is a separate exit. The only exit design is `brainstorm/&&sale.md`: internal move with a destination capacity check, or transfer or sale off the farm. The only transfer UI is the deck already in this repo (`ux/system/workflows/place.html` → `features/move`). Sources: [culling-replacement-semen.md](culling-replacement-semen.md), [transfers-feed-lines-legacy.md](transfers-feed-lines-legacy.md) (a).
6. **Keep for breeding: two candidates.** The handover and `features/keep-breeding` share Mark, Unmark and the rule that an ear tag is needed. The handover adds scoring and a shared Console list. It tags one tapped pig at a time, where the repo uses an identity conveyor over untagged pigs. Treat the handover as prior art for the Console side; it does not replace the repo flow. Source: [culling-replacement-semen.md](culling-replacement-semen.md).
7. **The Console menu was never settled.** The Vaccine prototype has five entries with a 业务中心 (business centre). The online Console preview has three entries with a 功能中心 (function centre), and it drops 淘汰/留种 and has no inventory home. Neither matches the repo's AI-first desktop direction. Use them as a list of modules, not as a navigation to copy. Source: [console-ia-workbench-access.md](console-ia-workbench-access.md).

## How these docs were made

Only distilled English is here. The raw handover (PRDs, changelogs, prototype code, mock data) stays off the repo, and scoring rules are described by their inputs, not their weights. On 2026-11-02, one reader per area read the handover; on 2026-11-03 one writer per area turned the maps into the workflow specs and appended corrections to each area doc. Each was pointed at its folders, both Figma indexes and `features/`, then the result was spot-checked against the sources (file names, dates, prototype code). Dates come from changelog headers and the `Vaccine/` git log. File modified times are copy dates, so they were not used. Nothing in the handover was changed, and nothing here is approved design. Each doc ends with its own list of contradictions and open questions.
