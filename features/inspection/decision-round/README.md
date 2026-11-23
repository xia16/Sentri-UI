# 巡检六项决定 · 操作档案

[单文件图文档案](canvas.html)可下载后直接浏览，所有截图都内嵌。档案随 PR #318 更新，覆盖巡检六项决定和后续确认的转舍流程。第 3 项盘点保持只读。

## 参考版本

| 参考 | 用在哪 |
| --- | --- |
| Sentri `mobile_webapp@6a81b23e0` · `src/pages/inspection/index.tsx` | 普通巡检一次扫码是填搜索；没有把独立出栏规则说成当前巡检规则。 |
| 同一版本 · `src/pages/task/pigOutbound/index.tsx`、`components/OutboundFieldDetailPopup.tsx`、`useOutboundScanException.ts`、`useOutboundPigLocate.ts` | 区分异单元、异栏、查不到；单元级选目的栏，栏位级目标已知；先等转舍结果再刷新与选择。 |
| Sentri-UI `codex/inspection-cross-unit-scan@baa057e5` · `features/inspection/PRD.md` 与原型 | 保留真实归属、看档案、只移入／移入并选择。旧稿禁用真正提交。 |
| Sentri-Android-App · `docs/home-inspection-health-delivery.md`、`docs/status.md` | 盘点现有预览及转舍写入边界。原型回执采用模拟结果；实际发布需确认服务端操作身份、权限和回执查询。 |

扫码或查找时照实际位置显示异单元猪。选择移入方式后，可用 PenMap 或按栏号搜索当前单元，再核对来源和目标。用 `?moveResult=offline|denied|failed|uncertain` 切换模拟回执。离线提交直接回原入口，联网事件触发样例队列。结果不明时会拦住同一次提交。

通用 Move 从栏位、已选名单、单猪档案进入。用 `?penmap=long` 查看 200 栏 Whole room 样例，用 `?moveFixture=batches` 看耳缺、两批头数和不可用栏。来源栏只要成功转出无身份猪，该栏无身份猪的当前疾病和症状全部清空。分娩母猪和已选仔猪共用目标栏选择页。详见 [Move 规则](../../move/PRD.md)。

回执、队列和位置更新均为原型样例。

## 复现

从巡检 worktree 根目录：

```sh
node scripts/serve-ux.cjs 4319
# 另一个终端；若 worktree 内未装 Playwright，设置 SENTRI_PLAYWRIGHT 指向已安装的目录
node features/inspection/decision-round/capture.mjs
node features/inspection/decision-round/make-canvas.mjs
node scripts/canvas.mjs features/inspection/decision-round/canvas.src.html features/inspection/decision-round/canvas.html
```

操作图用 390 × 844 浏览器视口直接从正式原型回放；`capture.mjs --check` 只验证链路。详见 [回放记录](verification.json)。
