# 巡检六项决定 · 操作档案

[单文件图文档案](canvas.html)可下载后直接浏览，所有截图都内嵌。基于 PR #318 的 `af640dd3`，覆盖 2026-11-20 会话的六项决定。第 3 项盘点保持只读。

## 参考版本

| 参考 | 用在哪 |
| --- | --- |
| Sentri `mobile_webapp@6a81b23e0` · `src/pages/inspection/index.tsx` | 普通巡检一次扫码是填搜索；没有把独立出栏规则说成当前巡检规则。 |
| 同一版本 · `src/pages/task/pigOutbound/index.tsx`、`components/OutboundFieldDetailPopup.tsx`、`useOutboundScanException.ts`、`useOutboundPigLocate.ts` | 区分异单元、异栏、查不到；单元级选目的栏，栏位级目标已知；先等转舍结果再刷新与选择。 |
| Sentri-UI `codex/inspection-cross-unit-scan@baa057e5` · `features/inspection/PRD.md` 与原型 | 保留真实归属、看档案、只移入／移入并选择。旧稿禁用真正提交。 |
| Sentri-Android-App · `docs/home-inspection-health-delivery.md`、`docs/status.md` | 盘点现有预览及转舍写入边界。原型回执采用模拟结果；实际发布需确认服务端操作身份、权限和回执查询。 |

现在的原型支持这些入口。列表的移入动作合在异常猪的单行里；选目的栏使用单独的全屏可搜索列表，大单元的样例有 48 个登记栏。可用 `?movePens=large` 看相同大单元，`?moveResult=offline|denied|failed|uncertain` 选择模拟回执，默认是成功。转舍结果不明时保留选择，并拦住同一次再次提交。

不接真实转舍、部署或 Android 改动。上线前需核对后端能否识别本次操作、验证源位置/目标及权限、查询结果并阻止重复提交。

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
