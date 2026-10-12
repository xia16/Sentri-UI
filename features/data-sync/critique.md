# Data sync — critique of current study

Baseline: origin/main ccaa3f2, 390×844, review/data-sync-evidence/home-before-en-390.png and list-before-en-390.png. Current study is an in-memory Home drawer; the old mobile_webapp is a behaviour reference, not a finished visual reference. The existing Home screen is in design, and no screen has owner approval for this feature.

## Keep

- 首页入口直接说“3 records saved on this device”：本机保存与团队收到的区别是对的，必须保留同等可见性。
- 抽屉第一行给待处理总数，随后列任务、对象、地点和时间，工人能认出哪次操作仍在本机。
- 底部固定 Back 在戴手套时容易离开；离开不能改变队列状态。
- 网络状态单独一行，不用颜色替代文字。

## Problems

- **Major — wrong action:** 连接可用时仍要求手动 Upload；与 2026-10-12 用户裁决的自动上传相反。首页与抽屉都把“点上传”当下一步。
- **Major — wrong fact:** 三条记录被当成一批，一次成功全部清空，一次失败全部保留；旧版实际逐条结算，可有部分成功、冲突和受阻。
- **Major — recovery gap:** 行不可打开，没有单条原因、手动重试或冲突删除；旧版功能和新裁决均需要这些状态。
- **Major — work hierarchy:** 首页完整宽度的待同步卡放在第一张工作卡上方。Atlas backlog 已指出这挤掉工人的首要问题“今天做什么”。异常需要醒目，正常等待应更安静。
- **Major — long data:** 列表标题 12px，时间 10px，缺少长耳号/任务名换行；需要操作的行标题低于 13px 地板。
- **Minor — copy:** 入口与抽屉同时写“3 records”；详情再重复会抢注意力。页面需要一处主计数。
- **Minor — language:** 当前 Home 原型是英文固定文案，不能验证中文长文案。

## Parts

| Part | Drawn by | Decision |
|---|---|---|
| 首页本机记录入口 | Home 页自绘 syncCard，home-astra-prototype.js/css | 保留本机事实，减小正常态权重；异常态清晰 |
| 抽屉壳、Back | Home drawer + SentriUI sheetFooter/backButton | 保留原生底部动作与退出语义 |
| 待上传摘要 | Home 自绘 sync-summary | 替换为设计系统 Banner/Heading 组合，避免双重信息 |
| 网络说明 | Home 自绘 sync-connection | 保留语义，随状态更新 |
| 记录行 | Home 自绘 sync-record | 迁入设计系统 Row 的可打开记录行 |
| 上传按钮 | Home 自绘 btn | 删除主动上传；用逐条安全重试入口 |
| 完成与失败消息 | Home 自绘 sync-message | 每条状态对应事实与下一步 |

## Self-crit

尝试过两种首页层级：沿用旧版将完整告警卡放在首张任务卡前，及将普通本机记录入口缩成一行、放在首张任务卡后。选后者；首屏先回答“今天做什么”，仍在首张卡下方看到本机 3 条与无网络。异常态保留提前提示，不能让工人错过失败或冲突。

390px 前后对照：旧首页的黄色卡写“tap to upload”且先于 Today’s work；新首页首张 Pregnancy check 完整可见，后面紧跟“3 records saved on this device / uploads when online”。旧抽屉的三条行无法打开，底部是 Upload 3 records；新列表将需要处理、等待、已上传分组，单条行可打开，底部只保留 Back。新列表在 390px 首屏能看到三条完整行，行标题与状态达到字体地板。取舍：正常待上传状态比旧黄色卡安静；这是有意的注意力转移，异常态仍需在真实队列中验证其提醒强度。

360px 中文核对：冲突详情在首屏展示本机与服务端两份孕检结果，安全重试固定在底部；删除藏在详情后段并需二次确认。确认文案说明记录无法恢复，且后续依赖仍受阻。删除后打开依赖记录，可见“前置记录已删除”“不会上传”与逐条删除入口；再次删除仍需确认。登录失效只演示原账号续传状态，未接入账号验证。

结论：相对旧版，本方案修正了手动上传与整批结算的事实错误，且没有牺牲首页首张工作卡的可见性；可以作为待评审设计。真实队列、服务端差异获取、条件重试与原账号验证仍需 Android 实现阶段验证；此自评不代表 owner 批准或独立 gate 通过。
