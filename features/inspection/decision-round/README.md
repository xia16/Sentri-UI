# 巡检六项决定 · 画布

[单文件图文档案](canvas.html)可下载后直接浏览，所有截图都内嵌。基于 PR #318 的 `af640dd3`，覆盖 2026-11-20 会话的六项决定。第 3 项盘点保持只读。

## 参考版本

| 参考 | 用在哪 |
| --- | --- |
| Sentri `mobile_webapp@6a81b23e0` · `src/pages/inspection/index.tsx` | 普通巡检一次扫码是填搜索；没有把独立出栏规则说成当前巡检规则。 |
| 同一版本 · `src/pages/task/pigOutbound/index.tsx`、`components/OutboundFieldDetailPopup.tsx`、`useOutboundScanException.ts`、`useOutboundPigLocate.ts` | 区分异单元、异栏、查不到；单元级选目的栏，栏位级目标已知；先等转舍结果再刷新与选择。 |
| Sentri-UI `codex/inspection-cross-unit-scan@baa057e5` · `features/inspection/PRD.md` 与原型 | 保留真实归属、看档案、只移入／移入并选择。旧稿禁用真正提交。 |
| Sentri-Android-App · `docs/home-inspection-health-delivery.md`、`docs/status.md` | 盘点现有预览及转舍写入边界。原型回执采用模拟结果；实际发布需确认服务端操作身份、权限和回执查询。 |

单栏扫码入口、转舍结果页、直开母猪、首页直开档案和保存后保留选择在此画布通过路由注入做演示；当前原型和 Atlas 仍显示原有版本。确认后的实现要保留原入口页面的状态，验证源单元和栏位在提交期间变化、待处理和结果不明的查询恢复，以及相同栏号不会跨单元串联。

## 复现

从巡检 worktree 根目录：

```sh
node scripts/serve-ux.cjs 4319
# 另一个终端；若 worktree 内未装 Playwright，设置 SENTRI_PLAYWRIGHT 指向已安装的目录
node features/inspection/decision-round/capture.mjs
node features/inspection/decision-round/make-canvas.mjs
node scripts/canvas.mjs features/inspection/decision-round/canvas.src.html features/inspection/decision-round/canvas.html
```

画布用 390 × 844 浏览器视口回放（沿用原型中的手机尺寸）。`proposal.mjs` 只替换该次浏览器会话加载的脚本，`lookup-study.js` 的转舍服务返回固定样例。详见 [回放记录](verification.json)；它证明画布中的操作表现，不代表后端、Android 或 Atlas 通过验收。
