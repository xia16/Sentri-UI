# 巡检入口核对 · 2026-11-19

这是初次核对的存档。已确认的六项决定及当前原型截图见 [操作链路](../decision-round/canvas.html)。

- [已同步：点按链路与修正前后截图](review.html)
- [待复核：现有状态、差异和建议](decisions.html)
- [逐页版本和入口清单](routes.md)
- [浏览器检查结果](verification.json)

图取自实际原型的 390 × 844 手机视口。`old` 指 `main` 基线 `df82ba5d` 或注明的历史稿；`now` 指本轮沿用的现有状态；`new` 指本轮改完后的状态。跨单元转入旧稿只用来说明待定选择。原型使用样例数据，报障、解除或填备注都只改当前页面的模拟数据。

## 复现

在提交 `af640dd3` 的巡检基线中，从仓库根目录启动预览。独立 worktree 若没安装 Playwright，把 `SENTRI_PLAYWRIGHT` 指向其已安装路径。

```sh
node scripts/serve-ux.cjs 4319
# 在另一个终端执行
node features/inspection/consistency-round/capture.mjs
node scripts/canvas.mjs features/inspection/consistency-round/review.src.html features/inspection/consistency-round/review.html
node scripts/canvas.mjs features/inspection/consistency-round/decisions.src.html features/inspection/consistency-round/decisions.html
```

`capture.mjs --check` 只回放和断言，不覆盖已有图片。源文件和截图在这里，`.html` 成品内嵌图片，可以单独保存打开。跨单元旧稿所在分支未合并；新克隆的仓库会保留已经提交的三张旧稿截图。
