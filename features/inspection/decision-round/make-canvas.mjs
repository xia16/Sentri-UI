import fs from 'node:fs/promises';
const base='../consistency-round/screenshots/';
const pic=(id,title,caption,old=false)=>[id,title,caption,old];
const sections=[
 {id:'scan',title:'1. 扫码或查找发现异单元猪',intro:'巡检底部和查找页打开的是同一个全单元扫码。结果按实际单元和栏位显示。',rows:[
  ['从单元巡检扫码：点外单元猪可看档案或移入','巡检 → 底部 Scan → 读到 000306、000267、000430 → 点 000430 整行','000306 在 C2、000267 在 C1，都是 Unit 7 的猪，可以一起做批量操作。000430 在 Unit 6 / A2，点它那一行或右边箭头，打开「猪只在其他单元」弹窗。这里选查看档案，按 Back 回扫码时原来两头仍选中。',[
   pic('01-unit-scan','在 Unit 6 下点 000430','这头猪显示 Outside this unit，右侧有箭头。'),
   pic('04-outside-choices','点 000430 后的操作弹窗','这里可以查看猪只档案（View pig record）、只移入（Move only）或移入并选中（Move and select）。'),
   pic('02-outside-record','打开 000430 档案','档案仍显示 Unit 6 / A2。看档案不会移动猪或替它打勾。'),
   pic('03-unknown','读到系统找不到的耳标','显示没找到。原来已选的两头不受影响。再次读到同一耳标不会新增一行。'),
   pic('17-no-reader','没有连接读卡器','先连接设备，也可以回查找手输耳号。')]],
  ['发现外单元猪：先看两种移入方式','扫码结果 → 点 000430 整行 → 只移入／移入并选中 → 选目标栏','从上一条的弹窗继续。现场确认这头猪要放到本单元后，只登记位置就选「只移入」，接下来还要对它做批量操作就选「移入并选中」。在选栏页直接搜栏号，或点 Open pen map 打开标准 PenMap Sheet。点中具体栏后核对耳号、来源和目标。',[
   pic('05-choose-destination','本单元的目标栏列表','可以直接搜栏号，也可以打开栏位图。'),
   pic('05-map','PenMap Sheet','地图底部有返回。点具体栏会回核对。'),
   pic('05b-search-C12','输入 C12，只显示 C12','点中后回到移入确认；这一步不会转舍。'),
   pic('05a-no-matching-pens','栏号搜不到时可清空重搜','不会让没有登记的栏成为目的栏。'),
   pic('06-confirm-select','提交前再核对','图中从 Unit 6 / A2 到 Unit 7 / C12。点目标栏整行可以修改。'),
   pic('39-old-cross-unit-scan','旧分支对照：列表上的 Move into this unit','旧分支把按钮放在猪只列表里。当前版点 000430 整行，在弹窗里选移入方式。',true)]],
  ['只移入：猪到了新栏，原名单不变','Move only → 选 C1 → Confirm move → Back','适合只是把位置登记正确。收到成功回执后，它出现在 Unit 7 / C1，但不替你勾上。',[
   pic('06-confirm-move','确认只移入','目标是登记新栏。'),
   pic('07-receipt-move','转舍确认成功','回执只写耳号和目标栏。'),
   pic('08-returns-move','返回扫码','000430 在 C1，已选仍是两头。')]],
  ['移入并选中：成功后才加进批量','Move and select → 选 C1 → Confirm move → Back','适合猪确实到了新栏，而且你接下来还要对它记录治疗、备注等。回来先看已选数量和耳号。',[
   pic('07-receipt-select','转舍确认成功','返回扫码即可看到勾选结果。'),
   pic('08-returns-select','返回后已选三头','原来两头还在，新加入 000430。')]],
  ['从查找进入：同样可看档案或移入','巡检 → Search → 输入 000430 → 点结果 → 看档案或移入','输入耳号找到结果不会勾选。选了移入并选中，确认成功后回到同一个搜索词；此时结果在新栏，退回巡检就能看到加入的勾选。从查找点右侧扫码，则走上面的全单元扫码，Back 恢复原搜索。',[
   pic('09-find-outside','输耳号，仍显示原栏','点结果打开同一个选择弹窗。'),
   pic('10-find-return','移入后回原搜索','搜索内容不丢，结果改为真实的新栏位。')]],
  ['提交后的短提示和回执','选择目标栏 → 核对 → 确认转舍','接口报错以扫码 No pig with this tag 同款短提示显示，留在核对页，可修改目标栏。断网时直接回原入口，联网确认后更新位置和勾选。截图使用样例回执。',[
   pic('16-queued','断网后回扫码','页面继续照常使用，异单元猪暂时按原位置显示。'),
   pic('16-synced','后台确认后更新','这头猪移到 C12，并按此前选择加进已选名单。'),
   pic('16-error','接口提示的样例','目标栏已满。核对页保留目标和耳号，点目标栏可改。')]],
 ]},
 {id:'move',title:'通用转舍怎么点',intro:'要把猪从原栏移到另一个栏，点 Move。已经选好猪就直接看目标栏。先从栏位进入时，选择对象后再选栏。',rows:[
  ['从栏位进去，挑要转走的猪','巡检 → 点栏名 → Move → 选择猪只','耳标和耳缺都可以按头选。两者都没有的猪按数量选。选好后点 Choose pen。只有一头可识别猪时，直接选栏。',[
   pic('61-move-pick','从 D4 挑猪','用耳标或耳缺查找，也可输入无身份猪数量。'),
   pic('65-move-target','确认目标栏','核对页的 Confirm move 提交。点目标栏整行可以改选。')]],
  ['已经在巡检名单上勾选，核对两边位置','勾选 000254 + D4 的 5 头 → Actions → Move','样例共 6 头。D4 的 5 头来自两批，先分配为批次 18 的 3 头和批次 19 的 2 头。选到具体栏后打开核对页，看到原栏、耳号和批次头数。',[
   pic('62-move-batches','5 头分到两批','分批头数合计要等于选中的 5 头。'),
   pic('64-move-whole-room','整栋看 200 栏','在选栏页打开 PenMap Sheet，点底部 Whole room，再点 C21–30 跳到那段。'),
   pic('63-move-review','核对来源','C1 一头，D4 五头。只要成功转出无身份猪，D4 所有无身份猪的当前疾病和症状全部清空，包括仍留在 D4 的。'),
   pic('66-move-after','移完回巡检','两栏头数随之更新。到新栏的动物按新的位置显示。')]],
  ['转完去哪查','来源栏 D4 或目标栏 C4 → Pen log','来源栏记移出，目标栏记移入。原有病症提示按新规则在来源栏清理，两边的转舍记录可查。',[
   pic('67-move-out-log','D4 记录移出','写明本次从哪个栏移到哪里。'),
   pic('68-move-in-log','C4 记录移入','可以回看猪只和来源。')]],
  ['只转档案里这一头','猪只档案 → Actions → Move → 选房间和栏','可以换房间，再从地图或搜索挑栏。完成后回这头猪的档案看新位置。',[
   pic('69-move-single','直接来到选栏','用档案里的耳号确定转舍对象，选栏后在核对页再确认。'),
   pic('70-move-room','搜索房间','按房间名查找。选房后可搜栏号，有布局的长房间也可打开整栋图。')]],
  ['分娩也用同一套选栏','母猪 Actions → Move，或 Piglets → 勾选 → Actions → Move','移动母猪时完成后回母猪档案。已选仔猪移动完成后回仔猪名单，在 Sent and moved 看到目标栏和头数。',[
   pic('71-move-sow','母猪的整栋选栏','直接选目标栏。'),
   pic('72-move-piglets','已勾选仔猪的整栋选栏','沿用刚才的选择，选好栏后再提交。'),
   pic('73-move-piglets-after','回仔猪名单','能查本次移走几头、移到哪一个栏。')]],
 ]},
 {id:'pen',title:'2. 分娩和巡检的栏位工具怎么用',intro:'栏位备注、报障、解除以及栏位日志采用同一套操作规则；进来时是谁的页面，最后就回谁。巡检仍能观察、全选；分娩栏位没有 Observe 或 Tick all，Feed 只看该栏的饲喂指导。',rows:[
  ['从哪进，就回到哪','巡检 → C1 栏名；或分娩房间 → B1 栏名','备注可读、可编辑、默认显示七天，关闭后能在日志查。报障选设备，选 Other 时另填名称；已有同设备故障就去原记录处理。解除可写处理经过，最后一条解除后故障提示消失。',[
   pic('11-inspection-pen','巡检栏位页','可以从这里发起转舍。观察和全选仍在栏位操作里。'),
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
   pic('11-inspection-pen','Pigs 只读','现有头数照常看。'),
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
 {id:'feeding',title:'猪只档案：饲喂与查看计划',intro:'饲喂标题和「查看计划」在同一行居中对齐。点「查看计划」仍打开当前这头猪的饲喂计划。',rows:[
  ['从猪只档案查看计划','巡检 → 点耳号 → 饲喂 → 查看计划','标题与入口的位置对齐。',[
   pic('55-pig-feeding-old','调整前','「查看计划」比「饲喂」低。'),
   pic('55-pig-feeding-new','当前','饲喂标题和查看计划处于同一行。')]],
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
const document=({title,intro,chapters,tail})=>`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title>
<style>
:root{font:16px/1.65 system-ui,sans-serif;color:#253328;background:#f5f7f1}*{box-sizing:border-box}body{margin:0}main{max-width:1280px;margin:auto;padding:24px}header,section,footer{padding:clamp(18px,4vw,35px);margin-bottom:20px;background:#fff;border:1px solid #dbe2d6;border-radius:16px}h1,h2,h3{line-height:1.25;margin:0 0 .7em}p{max-width:78ch;margin:.5em 0 1em}nav{display:flex;flex-wrap:wrap;gap:.6em;margin-top:1.3em}a{color:#286149}nav a{padding:.35em .7em;border:1px solid #cdd9cc;border-radius:8px}.kicker{font-size:.75em;letter-spacing:.12em;color:#4c6452}.route{font-weight:650;color:#29523d}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(215px,100%),1fr));gap:15px;margin-bottom:16px}.flow{border-top:1px solid #e2e7dd;padding-top:1em;margin-top:1em}figure{margin:0;background:#f5f7f1;padding:9px;border:1px solid #e0e6da;border-radius:12px}img{display:block;width:100%;max-width:390px;height:auto;margin:auto;border-radius:10px}figcaption{font-size:.91em;padding:.6em}figcaption strong{display:block}.label{font-size:.75em;font-weight:650;color:#356149}.old{color:#6b5e48}li{max-width:85ch}
</style><body><main><header><h1>${esc(title)}</h1><p>${esc(intro)}</p><nav aria-label="章节">${chapters.map(s=>`<a href="#${s.id}">${esc(s.title)}</a>`).join('')}</nav></header>
${chapters.map(({id,title,intro,rows})=>`<section id="${id}"><h2>${esc(title)}</h2><p>${esc(intro)}</p>${rows.map(([title,route,desc,pics])=>`<article class="flow"><h3>${esc(title)}</h3><p class="route">${esc(route)}</p><p>${esc(desc)}</p><div class="row">${pics.map(([id,t,c,earlier])=>`<figure><img loading="lazy" src="${earlier?base:'screenshots/'}${id}.jpg" alt="${esc(t)}"><figcaption><span class="label${earlier?' old':''}">${id==='55-pig-feeding-old'?'调整前':earlier?'旧稿／未变更':'当前原型'}</span><strong>${esc(t)}</strong>${esc(c)}</figcaption></figure>`).join('')}</div></article>`).join('')}</section>`).join('')}
<footer><h2>流程依据</h2><ul>
<li>mobile_webapp @ 6a81b23e0：普通巡检把读到的耳号填入搜索；旧出栏流程进一步区分异单元和异栏。本巡检借鉴单元入口选目标栏，以及转舍成功后才按选择意图勾选的顺序（useOutboundScanException、OutboundFieldDetailPopup、useOutboundPigLocate）。旧出栏的已出栏撤回是独立操作，不带进巡检。</li>
<li>Sentri-UI 旧巡检设计 @ baa057e5：异单元保留归属，可看档案，选择只移入或移入并选择。旧稿确认键禁用，等待可追查转舍的接口。</li>
<li>Sentri-UI 巡检基线 @ af640dd3：本轮沿用共享 Lookup、Sheet、Row、Facts、Log 和现有任务页面；分娩和巡检共同使用栏位备注与报障表单。</li>
</ul>${tail}</footer></main></body></html>\n`;
const [scan, move, ...inspection] = sections;
const related = (href, name) => `<p>另见 <a href="${href}">${name}</a>。</p>`;
await fs.writeFile(new URL('canvas.src.html', import.meta.url), document({
 title:'巡检入口与操作',intro:'从巡检、查找、扫码、栏位及首页打开对应页面。截图取自合并后的 Sentri-UI 原型。',
 chapters:[{...scan,rows:scan.rows.slice(0,1)},...inspection],tail:related('move.html','巡检转舍图文')
}));
await fs.writeFile(new URL('move.src.html', import.meta.url), document({
 title:'巡检转舍 Move',intro:'先找目标栏，再核对转舍。通过栏位、已选名单、单猪档案或异单元扫码与查找进入。',
 chapters:[move,{...scan,title:'异单元猪移入当前单元',intro:'扫码或查找后点异单元猪整行，选择移入方式。',rows:scan.rows}],
 tail:related('inspection.html','巡检入口与操作图文')
}));
