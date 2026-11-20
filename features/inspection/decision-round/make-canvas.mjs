import fs from 'node:fs/promises';
const base='../consistency-round/screenshots/';
const pic=(id,title,caption,old=false)=>[id,title,caption,old];
const sections=[
 {id:'scan',title:'1. 扫码或查找发现猪不在当前栏',intro:'先看你从哪里开始：巡检底部的 Scan 是扫整个单元；从栏位页点 Scan this pen 才是只扫这一栏。两者都按系统里真实的单元和栏位显示这头猪。滚动到哪一栏、刚看过哪一栏，都不会改变扫码范围。',rows:[
  ['从单元巡检扫码：本单元的猪正常勾选','巡检 → 底部 Scan → 读到 000306、000267、000430','000306 在 C2、000267 在 C1，只要都属于 Unit 7 就可以一起做批量操作。000430 记录在 Unit 6 / A2，单独显示在 Unit 6 下，没有勾选框。点这行 → 查看猪只档案，按 Back 回扫码，原来两头还在。',[
   pic('01-unit-scan','两个本单元结果已选','外单元结果看得见，但选中数量还是两头。'),
   pic('02-outside-record','打开 000430 档案','档案仍显示 Unit 6 / A2。看档案不会移动猪或替它打勾。'),
   pic('03-unknown','读到系统找不到的耳标','显示没找到。原来已选的两头不受影响。再次读到同一耳标不会新增一行。'),
   pic('17-no-reader','没有连接读卡器','先连接设备，也可以回查找手输耳号。')]],
  ['发现外单元猪：先看两种移入方式','扫码结果 → 点这头猪 → 只移入／移入并选中 → 选目标栏','如果现场确认这头猪要放到本单元，先选只移入，或移入后马上加入本轮操作；目标栏用独立的全屏选择页，列表可滚动，搜索始终在上方。选完再检查耳号、来源和目的栏。选错可以返回改，本轮其他猪的勾选都保留。',[
   pic('39-old-cross-unit-scan','旧分支的异单元扫码','读到异单元猪时，显示真实归属且不勾选。',true),
   pic('04-outside-choices','选择移入方式','在转舍之前，两个入口都不会把它加入批量操作。'),
   pic('05-choose-destination','48 个栏也可以翻','搜索固定在上方，下面只滚动栏位。'),
   pic('05b-search-C12','输入 C12，只显示 C12','点中后回到移入确认；这一步不会转舍。'),
   pic('05a-no-matching-pens','栏号搜不到时可清空重搜','不会让没有登记的栏成为目的栏。'),
   pic('06-confirm-select','提交前再核对','例如从 Unit 6 / A2 到 Unit 7 / C1。')]],
  ['只移入：猪到了新栏，原名单不变','Move only → 选 C1 → Confirm move → Back','适合只是把位置登记正确。收到成功回执后，它出现在 Unit 7 / C1，但不替你勾上。',[
   pic('06-confirm-move','确认只移入','目标是登记新栏。'),
   pic('07-receipt-move','转舍确认成功','样例回执明确这头猪没有加进名单。'),
   pic('08-returns-move','返回扫码','000430 在 C1，已选仍是两头。')]],
  ['移入并选中：成功后才加进批量','Move and select → 选 C1 → Confirm move → Back','适合猪确实到了新栏，而且你接下来还要对它记录治疗、备注等。回来先看已选数量和耳号。',[
   pic('07-receipt-select','确认移入并勾选','样例回执明确这头猪已加入。'),
   pic('08-returns-select','返回后已选三头','原来两头还在，新加入 000430。')]],
  ['从查找进入：同样可看档案或移入','巡检 → Search → 输入 000430 → 点结果 → 看档案或移入','输入耳号找到结果不会勾选。选了移入并选中，确认成功后回到同一个搜索词；此时结果在新栏，退回巡检就能看到加入的勾选。从查找点右侧扫码，则走上面的全单元扫码，Back 恢复原搜索。',[
   pic('09-find-outside','输耳号，仍显示原栏','点结果打开同一个选择弹窗。'),
   pic('10-find-return','移入后回原搜索','搜索内容不丢，结果改为真实的新栏位。')]],
  ['只扫指定栏：扫到隔壁栏也先别选','巡检 → C1 栏名 → Scan this pen → 读到 C1 的 000267、C2 的 000306','这次在 C1 做事，所以 C2 的猪虽然同属 Unit 7，也不会加入 C1 的选择。若它只是隔着栏杆被扫到，忽略就好；若它确实需要登记到 C1，点移入。目标已是 C1，不再让人挑栏。扫到 Unit 6 的猪也一样，先展示来源，再由人确认。',[
   pic('11-scan-entry-pen','从 C1 栏位页进','单元巡检和指定栏扫码是两个清楚的入口。'),
   pic('12-pen-scan','只有 C1 的猪先被勾选','其他栏位与单元分组列出。'),
   pic('13-other-pen','看到它目前在别栏','选只移入，还是移入后继续操作。'),
   pic('14-fixed-pen','目的栏自动固定为 C1','仍明确展示从哪移到哪，需要人确认。'),
   pic('15-fixed-pen-return','成功后回 C1 的扫码结果','再按 Back 回 C1 栏位页。')]],
  ['没有成功回执：不要当作已经转好','选择目的栏 → 点确认 → 按实际结果提示','下面是样例回执。等待确认时不改位置或勾选；失败、无权或离线保持这批猪不变。结果不明时先查询这一次提交，不自动重发。真实 App 启用前需要服务端能分辨是哪一次转舍、复查结果并防止重复写入。',[
   pic('16-offline','离线：还没提交','联网后重新核对位置，再提交。'),
   pic('16-denied','没有权限','不移动、不勾选；有权限的人处理。'),
   pic('16-failed','提交被拒绝','刷新实际位置和目标栏，再决定是否重试。'),
   pic('16-uncertain','提交结果不明','不把这头猪加入批量，也不能直接再提交一次。')]],
 ]},
 {id:'pen',title:'2. 分娩和巡检的栏位工具怎么用',intro:'栏位备注、报障、解除以及栏位日志采用同一套操作规则；进来时是谁的页面，最后就回谁。巡检仍能观察、全选；分娩栏位没有 Observe 或 Tick all，Feed 只看该栏的饲喂指导。',rows:[
  ['从哪进，就回到哪','巡检 → C1 栏名；或分娩房间 → B1 栏名','备注可读、可编辑、默认显示七天，关闭后能在日志查。报障选设备，选 Other 时另填名称；已有同设备故障就去原记录处理。解除可写处理经过，最后一条解除后故障提示消失。',[
   pic('26-inspection-pen','巡检栏位页','保留 Observe 和 Tick all。',true),
   pic('21-farrowing-pen','分娩栏位页','只给 Note、Feed、Fault；本栏记录在下方。'),
   pic('22-farrowing-note','写本栏的备注','保存后可在栏位和本栏日志查看。'),
   pic('22a-farrowing-note-read','读备注与修改','点铅笔修改；从阅读进编辑，保存回阅读。'),
   pic('23-farrowing-fault','上报设备故障','只针对当前栏的一台设备。'),
   pic('23a-farrowing-resolve','找到原故障并解除','已有故障的设备打开原报告；可填写处理经过。'),
   pic('24-farrowing-log','看本栏日志','Back 回栏位，再 Back 回原分娩房间。'),
   pic('25-farrowing-feed','看饲喂指导','没有配置时明确提示没有记录。')]],
 ]},
 {id:'count',title:'3. 这轮先不接盘点',intro:'栏位页的 Pigs 仍只显示头数。先不加 Set count、也不改存栏。单元环境设备仍从首页进入；独立 Count 设计完成后再接。',rows:[
  ['看数量和看设备，各走原入口','巡检 → 栏位页 → Now / Pigs；首页 → Environment & devices','看栏位现有头数不会发起盘点。',[
   pic('26-inspection-pen','Pigs 只读','现有头数照常看。',true),
   pic('01-home','首页原入口','环境和设备由首页进入。',true)]],
 ]},
 {id:'farrow',title:'4. 在巡检点 Open Farrowing，直接看到这头母猪',intro:'从当前任务卡或单猪 Actions 进去，匹配任务与耳号，打开这头母猪自己的分娩记录。记录已结束、母猪不再匹配任务时，不用别的猪代替，也不提供错误的继续入口。',rows:[
  ['从任务卡进去','巡检 → 000281 档案 → Current tasks → Open Farrowing → Back','进去可直接登记 000281 的分娩；退出回到这头猪的档案。',[
   pic('31-farrowing-from-card','点 000281 的当前任务','无需去分娩列表再找一遍。'),
   pic('32-target-sow','直接打开 000281 的分娩记录','标题下面清楚显示耳号与栏位。'),
   pic('33-farrowing-back-card','退出回档案','回到你进来的地方。')]],
  ['从单猪 Actions 进去','巡检 → 000281 档案 → Actions → Open Farrowing → Back','同一份分娩记录，退出回原来的单猪 Actions；向上返回继续看档案或原名单。',[
   pic('31-farrowing-from-actions','点 Actions 的分娩入口','还是 000281。'),
   pic('32-target-sow','同一头母猪的同一份记录','当前是在分娩中。'),
   pic('33-farrowing-back-actions','回原来的 Actions','已有巡检选择不应被重新建立或清空。'),
   pic('42-farrowing-completed-sow','已结束的样例','不显示继续活动任务。',true)]],
 ]},
 {id:'home',title:'5. 首页点名单上的一头猪，直接开它的档案',intro:'To treat 和 Monitoring 行上写的是一头猪，点行就打开这头猪。要看整个单元，使用首页的 Inspect unit。',rows:[
  ['待治疗','首页 → To treat → 点一个耳号 → 返回','先看这头猪的档案和对应情况，离开后回同一份待治疗名单，保留刚才的搜索、筛选和位置。',[
   pic('41-home-treat','选待治疗名单里的耳号','不用先进整个单元的 Health。'),
   pic('42-home-pig-treat','打开同一耳号的猪档案','按 Back 回原名单。')]],
  ['监测中','首页 → Monitoring → 点一个耳号 → 返回','同样直接开档案；返回保持原 Monitoring 名单。',[
   pic('41-home-monitor','点监测名单的一行','耳号明确是哪头。'),
   pic('42-home-pig-monitor','直接查看那头猪','返回仍是 Monitoring。')]],
 ]},
 {id:'save',title:'6. 保存后从原来的位置继续',intro:'保存确认说明谁被记录。原名单上的勾选仍在，方便继续对同一批操作。要换一批，请先核对并取消旧勾选。',rows:[
  ['从扫码选了一批猪','Scan → 选两头 → Actions → 记录 → 保存','成功后回扫码结果，仍选这两头。若是离线记录，提示存在本机待上传；不把它说成服务端已保存。',[
   pic('51-saved-scan','保存备注后仍在扫码名单','两头仍选中，可继续操作或取消。'),
   pic('54-treatment-online','保存治疗后保留名单','提示已记录治疗，仍然是原来两头。'),
   pic('54-treatment-offline','离线治疗存本机','提示联网后上传，两头的勾选保留。')]],
  ['从已选名单发起','巡检 → 已选数量 → Actions → 记录 → 保存','回已选名单，可以继续，也可以先核对、取消其中一头。',[
   pic('52-saved-selected','保存后仍在已选名单','勾选和记录对象一眼可见。')]],
  ['从某头猪的档案发起','扫码或巡检名单 → 点耳号 → 档案 → Actions → 保存','只给这头猪记，保存回它的档案；再返回原名单，原来多头的勾选照旧。从具体病症发起的治疗则回该病症。',[
   pic('53-saved-single','只保存给所点的猪','返回它的档案可核对记录。')]],
 ]},
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>巡检入口 · 决定后的操作链路</title>
<style>
:root{font:16px/1.65 system-ui,sans-serif;color:#253328;background:#f5f7f1}*{box-sizing:border-box}body{margin:0}main{max-width:1280px;margin:auto;padding:24px}header,section,footer{padding:clamp(18px,4vw,35px);margin-bottom:20px;background:#fff;border:1px solid #dbe2d6;border-radius:16px}h1,h2,h3{line-height:1.25;margin:0 0 .7em}p{max-width:78ch;margin:.5em 0 1em}nav{display:flex;flex-wrap:wrap;gap:.6em;margin-top:1.3em}a{color:#286149}nav a{padding:.35em .7em;border:1px solid #cdd9cc;border-radius:8px}.kicker{font-size:.75em;letter-spacing:.12em;color:#4c6452}.route{font-weight:650;color:#29523d}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(215px,100%),1fr));gap:15px;margin-bottom:16px}.flow{border-top:1px solid #e2e7dd;padding-top:1em;margin-top:1em}figure{margin:0;background:#f5f7f1;padding:9px;border:1px solid #e0e6da;border-radius:12px}img{display:block;width:100%;max-width:390px;height:auto;margin:auto;border-radius:10px}figcaption{font-size:.91em;padding:.6em}figcaption strong{display:block}.label{font-size:.75em;font-weight:650;color:#356149}.old{color:#6b5e48}li{max-width:85ch}
</style><body><main><header><p class="kicker">SENTRI · INSPECTION · 2026-11-20</p><h1>巡检入口：决定后的操作链路</h1><p>六项决定的操作档案。截图从已更新的 Sentri-UI 原型直接回放；转舍成功、被拒绝和回执不明是模拟结果，不会提交真实记录。</p><nav aria-label="章节">${sections.map(s=>`<a href="#${s.id}">${esc(s.title)}</a>`).join('')}</nav></header>
${sections.map(({id,title,intro,rows})=>`<section id="${id}"><h2>${esc(title)}</h2><p>${esc(intro)}</p>${rows.map(([title,route,desc,pics])=>`<article class="flow"><h3>${esc(title)}</h3><p class="route">${esc(route)}</p><p>${esc(desc)}</p><div class="row">${pics.map(([id,t,c,earlier])=>`<figure><img loading="lazy" src="${earlier?base:'screenshots/'}${id}.jpg" alt="${esc(t)}"><figcaption><span class="label${earlier?' old':''}">${earlier?'旧稿／未变更':'当前原型'}</span><strong>${esc(t)}</strong>${esc(c)}</figcaption></figure>`).join('')}</div></article>`).join('')}</section>`).join('')}
<footer><h2>流程依据</h2><ul>
<li>mobile_webapp @ 6a81b23e0：普通巡检把读到的耳号填入搜索；旧出栏流程进一步区分异单元和异栏。单元入口选目标栏，栏位入口使用当前栏；两处都在转舍成功、刷新名单后才按选择意图勾选（useOutboundScanException、OutboundFieldDetailPopup、useOutboundPigLocate）。旧出栏的已出栏撤回是独立操作，不带进巡检。</li>
<li>Sentri-UI 旧巡检设计 @ baa057e5：异单元保留归属，可看档案，选择只移入或移入并选择。旧稿确认键禁用，等待可追查转舍的接口。</li>
<li>Sentri-UI 巡检基线 @ af640dd3：本轮沿用共享 Lookup、Sheet、Row、Facts、Log 和现有任务页面；分娩和巡检共同使用栏位备注与报障表单。<a href="verification.json">浏览器回放记录</a>。</li>
</ul></footer></main></body></html>\n`;
await fs.writeFile(new URL('./canvas.src.html',import.meta.url),html);
