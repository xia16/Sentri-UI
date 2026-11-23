# 巡检六项决定 · 操作档案

[巡检入口与操作](../../../ux/review/farrowing-inspection/inspection.html)与[巡检转舍 Move](../../../ux/review/farrowing-inspection/move.html)都内嵌了截图，可下载后直接打开。第 3 项盘点保持只读。

## 参考版本

| 参考 | 用在哪 |
| --- | --- |
| Sentri `mobile_webapp@6a81b23e0` · `src/pages/inspection/index.tsx` | 普通巡检一次扫码是填搜索；没有把独立出栏规则说成当前巡检规则。 |
| 同一版本 · `src/pages/task/pigOutbound/index.tsx`、`components/OutboundFieldDetailPopup.tsx`、`useOutboundScanException.ts`、`useOutboundPigLocate.ts` | 区分异单元、异栏、查不到；单元级选目的栏，栏位级目标已知；先等转舍结果再刷新与选择。 |
| Sentri-UI `codex/inspection-cross-unit-scan@baa057e5` · `features/inspection/PRD.md` 与原型 | 保留真实归属、看档案、只移入／移入并选择。旧稿禁用真正提交。 |
| Sentri-Android-App · `docs/home-inspection-health-delivery.md`、`docs/status.md` | 盘点现有预览及转舍写入边界。原型回执采用模拟结果；实际发布需确认服务端操作身份、权限和回执查询。 |

扫码或查找时照实际位置显示异单元猪。选择移入方式后，从底部弹出当前巡检单元的 PenMap Sheet，点栏即进入核对。点核对页的目标栏可回弹窗改选。用 `?moveResult=error` 查看接口短提示的样例，用 `?moveResult=offline` 查看离线返回和联网后的样例更新。

通用 Move 从栏位、已选名单、单猪档案进入。用 `?penmap=long` 查看 200 栏 Whole room 样例，用 `?moveFixture=batches` 验证耳缺、混批无身份猪按总头数选择、以及不可用栏。每个来源栏只录一次总头数。转舍的加减按钮中央数字和巡检名单行尾数字都打开底部数字键盘。服务端处理批次扣减，原型回执用固定顺序模拟。来源栏只要成功转出无身份猪，该栏无身份猪的当前疾病和症状全部清空。分娩母猪和已选仔猪共用目标栏选择页。详见 [Move 规则](../../move/PRD.md)。

回执、队列和位置更新均为原型样例。

## 复现

从巡检 worktree 根目录：

```sh
node scripts/serve-ux.cjs 4319
# 另一个终端；若 worktree 内未装 Playwright，设置 SENTRI_PLAYWRIGHT 指向已安装的目录
node features/inspection/decision-round/capture.mjs
node features/inspection/decision-round/make-canvas.mjs
node scripts/canvas.mjs features/inspection/decision-round/canvas.src.html ux/review/farrowing-inspection/inspection.html
node scripts/canvas.mjs features/inspection/decision-round/move.src.html ux/review/farrowing-inspection/move.html
```

操作图用 390 × 844 浏览器视口直接从正式原型回放；`capture.mjs --check` 只验证链路。详见 [回放记录](verification.json)。
