/* Homepage design prototype. Fictional data, in-memory records, no agent or camera connection.
   One agreed visual direction; sections, overview and unit states are shareable via ?view=.
   Existing designed details are linked; unfinished tasks use a simple placeholder. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = key => window.SentriIcons.icon(key);
  const btn = (action, text, cls='', value='', extra='') => {
    if(action==='complete-task')return SentriUI.holdButton({action,label:'End task',caption:'HOLD TO END',tone:'primary'});
    if(['primary','secondary'].includes(cls))return SentriUI.button({action,value,register:cls,label:text}).replace('<button',`<button ${extra}`);
    return `<button type="button" class="${cls}" data-action="${action}" data-value="${esc(value)}" ${extra}>${text}</button>`;
  };
  const ib = (action, key, label, value='') => SentriUI.iconButton({action,icon:icon(key),label,value,variant:key==='more'?'plain':'bordered'});
  const manyMode=new URLSearchParams(location.search).get('many');
  const sections = [
    {id:'breeding',name:'Breeding',units:[1,2,3,4],population:184,icon:'heat',detail:'Heat checks & service'},
    {id:'gestation',name:'Gestation',units:[7,8,9],population:246,icon:'pregnancy',detail:'Pregnancy & return checks'},
    {id:'farrowing',name:'Farrowing',units:[6,7,8],population:19,icon:'farrow',detail:'Farrowing & litter care'},
    {id:'nursery',name:'Nursery',units:[12,13],population:360,icon:'barn',detail:'Growth & daily care'}
  ];
  const units = {
    1:{pigs:48,pens:6,checked:'Today, 08:20 · M. Chen'},2:{pigs:46,pens:6,checked:'Yesterday, 16:10 · G. Hansen'},3:{pigs:44,pens:6,checked:'Today, 08:45 · M. Chen'},4:{pigs:46,pens:6,checked:'Yesterday, 15:40 · G. Hansen'},
    6:{pigs:8,pens:4,checked:'Today, 08:15 · G. Hansen'},
    7:{pigs:86,pens:8,checked:'Today, '+SentriUnitSnapshot.checkIn.time+' · '+SentriUnitSnapshot.checkIn.who},8:{pigs:74,pens:7,checked:'Today, 08:35 · M. Chen'},9:{pigs:86,pens:8,checked:'Yesterday, 16:40 · G. Hansen'},
    10:{pigs:24,pens:24,checked:'Today, 08:15 · G. Hansen'},11:{pigs:24,pens:24,checked:'Yesterday, 17:00 · M. Chen'},12:{pigs:180,pens:6,checked:'Today, 08:30 · M. Chen'},13:{pigs:180,pens:6,checked:'Today, 08:50 · M. Chen'}
  };
  // Unit context belongs at the entrance; values remain sample data for this study.
  const unitContext = {
    7:{devices:['fan'],readings:[22.4,64,8],updated:'09:40',fault:{pen:'Pen C2',device:'Drinking station',note:'Leaking valve at the east end.',by:'G. Hansen · 06:40'},next:[{batch:'Batch 31',title:'Pregnancy check',when:'Next round · tomorrow'},{batch:'Batch 30',title:'Return-heat check',when:'Next round · 14:30'}]},
    8:{devices:['fan'],readings:[22.1,62,7],updated:'09:40',next:[{batch:'Batch 31',title:'Pregnancy check',when:'Next round · tomorrow'}]},
    9:{devices:['fan'],readings:[22.7,65,8],updated:'09:39',next:[{batch:'Batch 31',title:'Pregnancy check',when:'Next round · tomorrow'}]},
    12:{devices:['fan'],readings:[25.2,63,6],updated:'09:40',next:[{batch:'Batch 26',title:'Growth check',when:'Tomorrow · sample weights'}]},
    13:{devices:['fan'],readings:[25.4,62,6],updated:'09:40',next:[{batch:'Batch 26',title:'Growth check',when:'Tomorrow · sample weights'}]}
  };
  const tasks = [
    {id:'preg31',section:'gestation',type:'Pregnancy check',icon:'pregnancy',batch:'Batch 31',context:'First check · day 1 of 3',timing:'Window ends Saturday',status:'In progress',counts:{7:[6,2],8:[8,4],9:[6,2]},outcomes:['Pregnant','Not pregnant','Recheck']},
    {id:'preg32',section:'gestation',type:'Pregnancy check',icon:'pregnancy',batch:'Batch 32',context:'Follow-up · previously unclear',timing:'Due today',status:'Due today',counts:{7:[4,0],9:[4,0]},outcomes:['Pregnant','Not pregnant','Recheck']},
    {id:'return30',section:'gestation',type:'Return-heat check',icon:'return',batch:'Batch 30',context:'Morning round · day 3 of 7',timing:'Next round 14:30',status:'Due today',counts:{7:[4,1],8:[6,2]},outcomes:['No return signs','Return signs']},
    {id:'heat34',section:'breeding',type:'Heat check',icon:'heat',batch:'Batch 34',context:'Morning round · weaned sows',timing:'Next round 14:30',status:'In progress',counts:{1:[8,3],2:[6,2],3:[6,0]},outcomes:['No signs','Heat signs']},
    {id:'heat35',section:'breeding',type:'Heat check',icon:'heat',batch:'Batch 35',context:'Morning round · replacement gilts',timing:'Next round 14:30',status:'Due today',counts:{2:[4,0],4:[6,0]},outcomes:['No signs','Heat signs']},
    {id:'service34',section:'breeding',type:'Breeding',icon:'note',batch:'Batch 34',context:'Second service',timing:'Ready now',status:'Due today',counts:{1:[4,1],3:[4,0]},outcomes:null},
    {id:'farrow28',section:'farrowing',type:'Farrowing',icon:'farrow',batch:'Batch 28',context:'Expected today',timing:'Attend as needed',status:'In progress',counts:{6:[8,4],7:[6,1],8:[4,2]},outcomes:null},
    {id:'piglet27',section:'farrowing',type:'Piglet processing',icon:'note',batch:'Batch 27',context:'Day 3 · litter care',timing:'Due today',status:'Due today',counts:{6:[4,1],7:[4,0]},outcomes:null,measure:'pens'}
  ];
  // Completed examples are separate, explicitly ended task instances.
  tasks.push(
    {id:'preg29done',section:'gestation',type:'Pregnancy check',batch:'Batch 29',counts:{7:[6,6],8:[4,4],9:[4,4]},completedAt:'Today, 08:45'},
    {id:'service33done',section:'breeding',type:'Breeding',batch:'Batch 33',counts:{1:[4,4],2:[4,4],3:[4,4],4:[4,4]},completedAt:'Today, 08:50'},
    {id:'piglet26done',section:'farrowing',type:'Piglet processing',batch:'Batch 26',counts:{6:[4,4],7:[4,4],8:[4,4]},measure:'pens',completedAt:'Today, 09:10'}
  );
  // Extra fictional task instances for the list-overflow review URL: ?section=gestation&many=1.
  if(manyMode==='1'){
    [33,34,35,36].forEach(n=>tasks.push({...tasks[0],id:'preg'+n,batch:'Batch '+n,counts:{7:[4,1],8:[5,2]}}));
  }
  // Mixed-work review only: two distinct instances of each non-production type, beside the existing production cards.
  // Due counts are explicit sample schedule facts; they are not inferred from total minus recorded.
  if(manyMode==='operations')tasks.push(
    {id:'care04',section:'gestation',type:'Treatment course',batch:'Care plan 04',counts:{7:[6,3],8:[4,3]},measure:'pigs',preview:{context:'Dose 2 of 3',icon:'care',due:{7:3,8:1},label:'pigs due for this dose',progress:'This dose recorded',timing:'Today · 15:00',actionAt:900}},
    {id:'care08',section:'gestation',type:'Treatment course',batch:'Care plan 08',counts:{8:[5,5],9:[4,4]},measure:'pigs',preview:{context:'Dose 1 of 2',icon:'care',due:{8:0,9:0},label:'pigs due for this dose',progress:'This dose recorded',timing:'In progress',next:'Next dose · tomorrow 08:00'}},
    {id:'vax21',section:'gestation',type:'Vaccination',batch:'Plan V-21',counts:{7:[10,6],8:[6,4]},measure:'pigs',preview:{context:'PRRS · dose 1',icon:'care',due:{7:4,8:2},overdue:{7:1,8:1},label:'pigs due for vaccination',progress:'This vaccination recorded',timing:'',actionAt:540}},
    {id:'vax22',section:'gestation',type:'Vaccination',batch:'Plan V-22',counts:{7:[7,2],9:[5,0]},measure:'pigs',preview:{context:'Influenza · dose 1',icon:'care',due:{7:3,9:1},label:'pigs due for vaccination',secondary:'Next session · 17:00',progress:'This vaccination recorded',timing:'Today',actionAt:1020}},
    {id:'move241',section:'gestation',type:'Pig transfer',batch:'Order TR-241',counts:{7:[12,7],8:[8,5]},measure:'pigs',preview:{context:'Scheduled move',icon:'transfer',due:{7:5,8:3},label:'pigs to confirm moved',secondary:'Units 7 & 8 → Farrowing 6',secondaryByUnit:{7:'Unit 7 → Farrowing 6',8:'Unit 8 → Farrowing 6'},progress:'Move confirmed',timing:'Today · 14:00',actionAt:840}},
    {id:'move242',section:'gestation',type:'Pig transfer',batch:'Order TR-242',counts:{8:[6,3],9:[4,2]},measure:'pigs',preview:{context:'To Nursery · Unit 12',icon:'transfer',due:{8:0,9:0},label:'pigs to confirm moved',progress:'Move confirmed',timing:'In progress',next:'Next receiving window · tomorrow 09:00'}},
    {id:'out61',section:'gestation',type:'Outbound',batch:'Order OB-61',counts:{7:[12,7],9:[8,4]},measure:'pigs',preview:{context:'Cull group',icon:'note',due:{7:5,9:4},label:'pigs awaiting confirmation',progress:'Outbound confirmed',timing:'No deadline',undated:true}},
    {id:'out62',section:'gestation',type:'Outbound',batch:'Order OB-62',counts:{8:[6,0]},measure:'pigs',preview:{context:'Sale group',icon:'note',due:{8:6},label:'pigs awaiting confirmation',progress:'Outbound confirmed',timing:'No deadline',undated:true}},
    {id:'sample15',section:'gestation',type:'Sampling',batch:'Task SP-15',counts:{7:[3,1],8:[2,1]},measure:'targets',preview:{context:'Pig targets',icon:'note',due:{7:2,8:1},label:'targets to sample',progress:'Targets sampled',timing:'Today · 15:20',actionAt:920}},
    {id:'sample16',section:'gestation',type:'Sampling',batch:'Task SP-16',counts:{9:[4,1]},measure:'targets',preview:{context:'Environment targets',icon:'note',due:{9:3},label:'targets to sample',progress:'Targets sampled',timing:'Due today',actionAt:1080}}
  );
  // Future, unstarted task instances within the next seven sample farm-calendar days.
  const futureTasks=[
    {id:'preg38',section:'gestation',units:[7,8],batch:'Batch 38',title:'Pregnancy check',startDay:1,when:'Tomorrow'},
    {id:'return39',section:'gestation',units:[7,9],batch:'Batch 39',title:'Return-heat check',startDay:3,when:'In 3 days'},
    {id:'heat37',section:'breeding',units:[1,2],batch:'Batch 37',title:'Heat check',startDay:2,when:'In 2 days'},
    {id:'nursery27',section:'nursery',units:[12,13],batch:'Batch 27',title:'End-nursery check',startDay:4,when:'In 4 days'},
    ...(manyMode==='1'?[
      {id:'preg40',section:'gestation',units:[7],batch:'Batch 40',title:'Pregnancy check',startDay:4,when:'In 4 days'},
      {id:'preg41',section:'gestation',units:[7],batch:'Batch 41',title:'Pregnancy check',startDay:5,when:'In 5 days'}
    ]:[])
  ];
  const records = new Map();
  tasks.forEach((task,ti) => Object.entries(task.counts).forEach(([unit,[total,done]]) => {
    const list = Array.from({length:total},(_,i) => ({id:String(230+ti*100+Number(unit)*10+i).padStart(6,'0'),pen:'A'+(Math.floor(i/3)+1),result:i<done?(task.outcomes?.[i%2]||'Recorded'):'',active:task.id==='farrow28'&&Number(unit)!==8&&i===done,birth:task.id==='farrow28'&&i<done?{live:10+i,stillborn:i%2,deaths:i%2}:null}));
    records.set(`${task.id}:${unit}`,list);
  }));
  const params = new URLSearchParams(location.search);
  const requestedDay=Number(params.get('day'));
  const compactPreview=params.get('variant')==='compact';
  const joinedPreview=params.get('variant')==='joined';
  const connectedPreview=params.get('variant')==='connected';
  const seamlessPreview=params.get('variant')==='seamless'||connectedPreview;
  const groupedPreview=params.get('variant')==='grouped'||joinedPreview||seamlessPreview;
  const groupMode=['collapsed','all'].includes(params.get('groups'))?params.get('groups'):'';
  if(groupedPreview){
    const switcher=$('.grouped-prototype-switch');
    switcher.hidden=false;
    $('[data-grouped-label]').textContent=connectedPreview?(manyMode==='operations'?'13 open · connected groups':'3 open · full cards'):manyMode==='operations'?'13 tasks · accordion':'3 tasks · full cards';
    const nextUrl=new URL(location.href);
    if(manyMode==='operations')nextUrl.searchParams.delete('many');else nextUrl.searchParams.set('many','operations');
    nextUrl.searchParams.delete('tasks');
    switcher.querySelectorAll('a').forEach(link=>{link.href=nextUrl.href;link.setAttribute('aria-label',manyMode==='operations'?'Show three full task cards':'Show thirteen grouped tasks');});
    document.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.target.closest('input,textarea,[contenteditable]'))return;
      location.assign($('[data-grouped-'+(event.key==='ArrowLeft'?'previous':'next')+']').href);
    });
  }
  const attentionModes=['current','clear','health','feed','maintenance','busy','unknown'];
  let attentionPreview=attentionModes.includes(params.get('attention'))?params.get('attention'):'current';
  let workPreview=['mixed','active','waiting'].includes(params.get('work'))?params.get('work'):'mixed';
  let rememberedSection;
  try { rememberedSection=localStorage.getItem('sentri-home-prototype-section'); } catch { /* File previews may disable storage. */ }
  const requestedSection=params.get('section')||rememberedSection;
  const initialSection = sections.some(s=>s.id===requestedSection) ? requestedSection : 'gestation';
  let state = {page:'home',section:initialSection,unit:null,task:null,workUnit:null,expandedTasks:params.get('tasks')==='expanded',expandedUpcoming:false,scheduleDay:Number.isInteger(requestedDay)&&requestedDay>=1&&requestedDay<=7?requestedDay:0,typeGroupOverrides:{},assistantTab:'findings',chat:[],answered:false,notes:[],log:[],overlay:null};
  // UI-only queue: no device database or upload service is connected to this study.
  const pendingExamples=[{title:'Pregnancy check · 000308',context:'Gestation · Unit 7 · Batch 31',time:'09:32'},{title:'Pen note · C2',context:'Gestation · Unit 8',time:'09:35'},{title:'Feed adjustment · 000267',context:'Gestation · Unit 7 · Pen C1',time:'09:38'}];
  const syncPreset=params.get('sync')||(params.get('connection')==='online'?'online':'offline');
  const sync={connection:syncPreset==='offline'?'offline':'online',pending:syncPreset==='synced'?[]:syncPreset==='failed'?[pendingExamples[2]]:syncPreset==='conflict'?pendingExamples.slice(0,2):[...pendingExamples],status:syncPreset==='synced'?'synced':syncPreset==='failed'?'failed':syncPreset==='conflict'?'conflict':syncPreset==='online'?'uploading':'waiting'};
  if(params.get('view')==='sections')state.page='sections';
  if(params.get('view')==='toolbox')state.page='toolbox';
  // Atlas-only start states for the screens a tap cannot reach (typing an answer): ?answered=1 (answer on file), ?view=finding.
  if(params.get('answered')==='1'){state.answered=true;state.answer='Unit 8, pen B3';}
  if(params.get('view')==='finding')state.page='finding';
  if(params.get('view')==='unit'){const available=sections.find(s=>s.id===initialSection).units;state.unit=available.includes(+params.get('unit'))?+params.get('unit'):available[0];}
  const app = $('#app'), overlay = $('#overlay');
  let returnFocus = null, toastTimer, navStack = [];
  const section = () => sections.find(s=>s.id===state.section);
  const farrowingUnits={6:{pigs:8,pens:4},7:{pigs:7,pens:4},8:{pigs:4,pens:2}};
  const unitInfo = id => state.section==='farrowing'?{...units[id],...farrowingUnits[id]}:units[id];
  const taskBy = id => tasks.find(t=>t.id===id);
  const task = () => taskBy(state.task);
  const taskRecords = (t,unit=null) => unit ? (records.get(`${t.id}:${unit}`)||[]) : Object.keys(t.counts).flatMap(u=>records.get(`${t.id}:${u}`)||[]);
  const metric = (t,unit=null) => {const rows=taskRecords(t,unit);return {total:rows.length,done:rows.filter(r=>r.result).length,left:rows.filter(r=>!r.result).length};};
  const scopedTasks = () => tasks.filter(t=>t.section===state.section&&(!state.unit||t.counts[state.unit]));
  const openTaskCount = (sectionId,unit=null) => tasks.filter(t=>!t.completedAt&&!t.terminatedAt&&t.section===sectionId&&(!unit||t.counts[unit])).length;
  const nouns = (t,n) => t.measure==='pens'?`${n===1?'pen':'pens'}`:`${n===1?'sow':'sows'}`;
  function toast(text){clearTimeout(toastTimer);$('#notice').textContent=text;toastTimer=setTimeout(()=>$('#notice').textContent='',3500);}
  function reflectTaskExpansion(){const url=new URL(location.href);if(state.expandedTasks)url.searchParams.set('tasks','expanded');else url.searchParams.delete('tasks');history.replaceState(null,'',url);}
  function sectionMotion(direction,update){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){update();return;}
    if(!document.startViewTransition){
      document.documentElement.dataset.sectionMotion=direction;
      update();
      const entering=[...app.children].filter(child=>!child.classList.contains('bottom-nav')).map(child=>child.animate([{opacity:0,transform:`translateX(${direction==='forward'?'33.333%':'-16.667%'})`},{opacity:1,transform:'translateX(0)'}],{duration:260,easing:'ease-out'}));
      Promise.allSettled(entering.map(animation=>animation.finished)).then(()=>delete document.documentElement.dataset.sectionMotion);
      return;
    }
    document.documentElement.dataset.sectionMotion=direction;
    const transition=document.startViewTransition(update);
    transition.finished.then(()=>delete document.documentElement.dataset.sectionMotion,()=>delete document.documentElement.dataset.sectionMotion);
  }
  function push(page,patch={}) {
    const fromHome=state.page==='home'&&page==='sections';
    const update=()=>{navStack.push({page:state.page,unit:state.unit,task:state.task,workUnit:state.workUnit,section:state.section,scroll:app.querySelector('.app-scroll')?.scrollTop||0});if(state.page==='home'){state.expandedTasks=false;state.expandedUpcoming=false;reflectTaskExpansion();}Object.assign(state,patch,{page});render();};
    if(fromHome)sectionMotion('forward',update);else update();
  }
  function back(){
    const prior=navStack.pop();
    if(prior){
      const toHome=state.page==='sections'&&prior.page==='home';
      const resetHomeGroups=prior.page==='home'&&['toolbox','records','assistant','environment','maintenance'].includes(state.page);
      const update=()=>{Object.assign(state,prior);if(resetHomeGroups){state.typeGroupOverrides={};state.scheduleDay=0;const url=new URL(location.href);url.searchParams.delete('day');history.replaceState(null,'',url);}render();const scroll=app.querySelector('.app-scroll');if(scroll)scroll.scrollTop=prior.scroll||0;};
      if(toHome)sectionMotion('back',update);else update();
    }else{state.page='home';render();}
  }
  function goHome(){
    const fromSections=state.page==='sections';
    const update=()=>{if(['toolbox','records','assistant','environment','maintenance'].includes(state.page)){state.typeGroupOverrides={};state.scheduleDay=0;const url=new URL(location.href);url.searchParams.delete('day');history.replaceState(null,'',url);}state.page='home';navStack=[];render();};
    if(fromSections)sectionMotion('back',update);else update();
  }
  function nav(active='home'){return `<nav class="bottom-nav" aria-label="Main navigation">${btn('home',icon('home')+'Home',active==='home'?'active':'')}${btn('scan',icon('scan')+'Scan','scan-button')}${btn('toolbox',icon('toolbox')+'Toolbox',active==='toolbox'?'active':'','',state.unit?'data-entry="environment" data-entry-via="toolbox"':'')}</nav>`;}
  /* The page header (Headers law, 2026-10-13): Back at the top left, the title, no line on these pages (scope, sources and
     descriptions are not header facts); 24px to the body. Every page has Back; its footer has none. */
  function head(title,extra=''){const h=SentriUI.pageHeader({title,back:{action:'back',label:'Back'},level:2});return extra?h.replace(/<\/header>$/,extra+'</header>'):h;}
  /* Until migrated: the Assistant (and its finding), Environment and Maintenance pages keep their page-built head. Their bodies are below the farm
     legibility floors (10px text, 9px chart labels), and a change that moves a screen brings it up to the floors; that is its own
     task. features/environment and features/assistant budget.md, ## Headers. */
  function legacyHead(title,sub='',extra='',showBack=true){return `<header class="page-head">${showBack?ib('back','back','Back'):''}<div class="head-copy">${SentriUI.heading({title,description:sub,kind:'page',level:2})}</div>${extra}</header>`;}
  function header(){return `<header class="app-header">${btn('sections',`<span class="farm-label">GREEN VALLEY FARM</span><strong>${section().name}${icon('down')}</strong>`,'section-trigger','','aria-label="Change section, '+section().name+'"')}${btn('assistant',`${icon('spark')}Assistant`,'assistant-door','','aria-label="Assistant"')}</header>`;}
  function scopeRail(){return `<nav class="scope-switch" aria-label="Work scope">${btn('scope','Overview','scope-overview','',`aria-pressed="${!state.unit}"`)}${btn('units',`<span>${state.unit?'Unit '+state.unit:'Choose unit'}</span>${icon('down')}`,'scope-unit','',`${state.section==='farrowing'?'data-entry="farrowing" data-entry-via="choose-unit" ':''}aria-haspopup="dialog" aria-label="${state.unit?'Change unit, Unit '+state.unit:'Choose unit'}, ${section().units.length} units" aria-pressed="${!!state.unit}"`)}</nav>`;}
  function overviewShortcuts(){
    if(state.unit)return connectedPreview?'':`<nav class="overview-shortcuts unit-shortcuts" aria-label="Unit tools">${btn('inventory-entry',`<span class="overview-shortcut-icon">${icon('barn')}</span><span><strong>Unit ${state.unit} inventory</strong><small>${unitInfo(state.unit).pigs} pigs · ${unitInfo(state.unit).pens} pens</small></span>${icon('arrow')}`,'overview-shortcut')}</nav>`;
    return `<nav class="overview-shortcuts" aria-label="Area tools">
      ${btn('inspection-entry',`<span class="overview-shortcut-icon">${icon('grid')}</span><span><strong>Inspection</strong>${connectedPreview?'':'<small>Choose a unit</small>'}</span>${icon('arrow')}`,'overview-shortcut')}
      ${btn('inventory-entry',`<span class="overview-shortcut-icon">${icon('barn')}</span><span><strong>Inventory</strong><small>${section().population} pigs${connectedPreview?'':' · '+section().units.length+' units'}</small></span>${icon('arrow')}`,'overview-shortcut')}
    </nav>`;
  }
  // Illustrative task windows. Unit selection changes counts, not batch time.
  const cardFields = {
    preg31:{context:'First check',day:1,days:3,label:'Checks recorded',verb:'sows ready to check',due:{7:2,8:2,9:1},nextAt:1440},
    preg32:{context:'Follow-up',day:1,days:1,label:'Checks recorded',verb:'sows ready to check',due:{7:4,9:4},state:'waiting',nextAt:1440},
    return30:{context:'Monitoring',day:3,days:7,kind:'observation',verb:'sows at estimated return date',due:{7:4,8:6},nextAt:870},
    heat34:{context:'Weaned sows',day:2,days:3,kind:'observation',verb:'sows ready to check',due:{1:8,2:6,3:6},nextAt:870},
    heat35:{context:'Replacement gilts',day:1,days:3,kind:'observation',verb:'sows with signs to confirm',due:{2:4,4:6},nextAt:870},
    service34:{context:'Service sequence',day:3,days:7,label:'Mated at least once / heat-marked',verb:'sows ready for service',due:{1:2,3:3},nextAt:840},
    farrow28:{context:'Farrowing window',day:2,days:7,label:'Farrowings recorded',verb:'sows due today',kind:'distribution',due:{6:2,7:2,8:0},nextAt:1440},
    piglet27:{context:'Age-day schedule',day:3,days:7,label:'Pens done',verb:'litters due',due:{6:2,7:2},state:'waiting',nextAt:1440}
  };
  function taskModel(t){
    const count=Object.keys(t.counts).length,scope={kind:state.unit?'unit':'overview',label:state.unit?'Unit '+state.unit:(count===1?'One unit':t.preview?'Across '+count+' units':'All units'),action:state.unit?'Open unit task':'View task'};
    if(t.completedAt||t.terminatedAt)return {id:t.id,state:t.terminatedAt?'terminated':'complete',identity:{title:t.type,context:t.batch},scope,completedAt:t.completedAt||t.terminatedAt};
    if(t.preview){
      const f=t.preview,m=metric(t,state.unit),due=state.unit?f.due[state.unit]||0:Object.values(f.due).reduce((a,b)=>a+b,0);
      const overdueCount=state.unit?f.overdue?.[state.unit]||0:Object.values(f.overdue||{}).reduce((a,b)=>a+b,0);
      const waiting=due===0,overdue=!waiting&&overdueCount>0,stateName=waiting?'waiting':overdue?'overdue':f.undated?'undated':'active';
      return {id:t.id,state:stateName,attentionRank:waiting?3:overdue?1:f.undated?2.5:2,actionAt:f.actionAt,
        identity:{title:t.type,context:t.batch+' · '+f.context,icon:f.icon},
        action:waiting?{message:f.next||'In progress · next time not set'}:{value:due,label:f.label,secondary:overdueCount?overdueCount+' past due':state.unit?f.secondaryByUnit?.[state.unit]||f.secondary:f.secondary},
        progress:{kind:'completion',label:f.progress,value:m.done,total:m.total,unit:t.measure},
        timing:{elapsed:f.timing,remaining:f.remaining||''},scope};
    }
    const m=metric(t,state.unit),f=cardFields[t.id]||cardFields.preg31,rows=taskRecords(t,state.unit);
    let p=f.kind==='observation'?null:{kind:f.kind||'completion',label:f.label,value:m.done,total:m.total,unit:t.measure||'sows'};
    const due=f.due?(state.unit?f.due[state.unit]||0:Object.values(f.due).reduce((a,b)=>a+b,0)):0;
    const kind=({'Pregnancy check':'pregnancy','Heat check':'heat','Return-heat check':'return-heat','Breeding':'breeding','Farrowing':'farrowing','Piglet processing':'piglet'})[t.type];
    const recordedInHeat=kind==='heat'?rows.filter(r=>r.result==='Heat signs').length:0;
    if(kind==='heat')p=state.unit?null:{kind:'outcome',label:'Recorded in heat / target',value:recordedInHeat,total:t.id==='heat34'?8:5,unit:'sows'};
    if(kind==='breeding')p=state.unit?null:{kind:'outcome',label:'Mated at least once / heat-marked',value:m.done,total:m.total,unit:'sows'};
    if(kind==='farrowing'){p.kind='completion';p.label='Farrowed';}
    const facts={due,label:f.verb,live:kind==='farrowing'?rows.filter(r=>r.active).length:0,
      later:kind==='pregnancy'?Math.max(0,m.left-due):0,nextAt:f.nextAt,
      nextLabel:f.nextAt>=1440?'Tomorrow':Math.floor(f.nextAt/60)+':'+String(f.nextAt%60).padStart(2,'0')};
    if(kind==='heat'){
      facts.due=state.unit?Math.min(due,recordedInHeat):recordedInHeat;
      facts.label=state.unit?'sows with signs to confirm':'sows recorded in heat';
      facts.secondary=state.unit?undefined:'Target '+p.total+' sows';
    }
    if(kind==='breeding'&&!state.unit){facts.due=m.done;facts.label='sows mated at least once';facts.secondary=m.total+' heat-marked sows';}
    if(kind==='return-heat'){
      const returned=rows.filter(r=>r.result==='Return signs').length;
      facts.due=state.unit?due:returned;
      facts.label=state.unit?'sows at estimated return date':'sows recorded returned';
      facts.secondary=state.unit?(returned?returned+' signs submitted':undefined):(m.total-returned)+' without return record';
    }
    // These are explicit preview schedule facts, not completion inferred from an empty list.
    const current=workPreview==='mixed'?(f.state||'active'):workPreview;
    if(current==='waiting'){facts.due=0;facts.live=0;}
    const resolved=window.SentriHomeTaskCard.attention(kind,facts);
    return {id:t.id,entry:({farrowing:'farrowing',piglet:'piglet-processing'})[kind],...resolved,actionAt:manyMode==='operations'&&resolved.state==='active'?f.nextAt:undefined,identity:{title:t.type,context:t.batch+' · '+f.context,icon:'production'},progress:p,
      status:{label:resolved.state==='active'?'Due now':'Waiting',tone:resolved.state==='active'?'blue':''},
      timing:{elapsed:f.days===1?'Today':'Day '+f.day+' of '+f.days},scope};
  }
  function unitStrip(){
    const u=unitInfo(state.unit),sensors=availableSensors(),devices=unitDevices(),faults=maintenanceRecords().filter(f=>!f.resolved);
    // Attention is distinct from all recorded findings: exclude no-action-needed conditions.
    // Counts are fictional snapshot values; null means unavailable, never zero.
    const care=attentionPreview==='unknown'?{health:null,feed:null}:attentionPreview==='busy'?{health:24,feed:13}:attentionPreview==='clear'||attentionPreview==='maintenance'?{health:0,feed:0}:attentionPreview==='health'?{health:SentriUnitSnapshot.health,feed:0}:attentionPreview==='feed'?{health:0,feed:3}:{health:SentriUnitSnapshot.health,feed:SentriUnitSnapshot.feed};
    const signals=[{label:'Health',count:care.health,unit:'pig',icon:'health'},{label:'Feed',count:care.feed,unit:'pig',icon:'feed'},{label:'Maintenance',count:faults.length,unit:'issue',icon:'wrench'}];
    const active=signals.filter(s=>Number.isFinite(s.count)&&s.count>0),unavailable=signals.some(s=>s.count===null);
    const inspectLabel = `Inspect unit, ${u.pigs} pigs, ${u.pens} pens`;
    if(connectedPreview)return `<section class="unit-hub-compact" aria-label="Unit ${state.unit} status">
      <div class="unit-hub-compact-head"><strong>Unit ${state.unit} · ${u.pigs} pigs · ${u.pens} pens</strong><small>Checked ${esc(u.checked.split(' · ')[0])}</small></div>
      <div class="unit-hub-compact-attention" aria-label="Unit attention">${active.length?active.map(s=>s.label==='Maintenance'?btn('maintenance',`${icon(s.icon)}${s.label} ${s.count}${icon('arrow')}`,'unit-hub-compact-chip issue'): `<span class="unit-hub-compact-chip">${icon(s.icon)}${s.label} ${s.count}</span>`).join(''):!unavailable?'<span class="unit-hub-compact-clear">No flagged items</span>':''}${unavailable?'<span class="unit-hub-compact-unknown">Health and feed summary unavailable</span>':''}</div>
      <div class="unit-hub-compact-actions">${btn('inspect','Inspect unit','primary')} ${btn('inventory-entry','Inventory','secondary')} ${sensors.length||devices.length?btn('environment','Environment','secondary','','data-entry="environment"'):''}</div>
    </section>`;
    return `<section class="unit-hub unit-hub-unified" aria-label="Unit ${state.unit} status">
      <button type="button" class="unit-hub-inspect" data-action="inspect" data-entry="inspection" aria-label="${esc(inspectLabel)}">
        <span class="uhi-head">${icon('grid')}<span class="uhi-title">Inspect unit<small>${u.pigs} pigs · ${u.pens} pens</small></span>${icon('arrow')}</span>
        <span class="unit-check-row"><small>Checked ${esc(u.checked.split(' · ')[0])}</small></span>
        <span class="unit-attention" aria-label="Unit attention">${active.length?`<span class="unit-attention-chips">${active.map(s=>`<span class="unit-attention-chip" role="img" aria-label="${s.label}: ${s.count} ${s.unit}${s.count===1?'':'s'} needing attention" title="${s.label}: ${s.count} ${s.unit}${s.count===1?'':'s'} needing attention">${icon(s.icon)}<span aria-hidden="true">${s.label}</span><strong aria-hidden="true">${s.count}</strong></span>`).join('')}</span>`:!unavailable?`<span class="unit-attention-clear">${icon('check')}No flagged items</span>`:''}${unavailable?'<span class="unit-attention-unknown">Health and feed summary unavailable</span>':''}</span>
      </button>
      ${sensors.length||devices.length?btn('environment',`<span class="unit-environment-label">Environment & devices</span><span class="unit-environment-bottom">${sensors.length?`<span class="unit-live-readings">${sensors.map(s=>`<span>${icon(s.icon)}${s.value}<small>${s.unit}</small></span>`).join('')}</span>`:`<span class="unit-device-count">${devices.length} ${devices.length===1?'device':'devices'}</span>`}${icon('arrow')}</span>`,'unit-hub-environment','','data-entry="environment"'):''}
    </section>`;
  }
  const sensorKinds=[{name:'Temperature',unit:'°C',icon:'temperature'},{name:'Humidity',unit:'%',icon:'humidity'},{name:'Ammonia',unit:'ppm NH₃',icon:'air'}];
  const deviceCache=new Map(),maintenanceCache=new Map();
  const unitKey=()=>state.section+':'+state.unit;
  const currentUnitContext=()=>state.section==='farrowing'?{}:unitContext[state.unit]||{};
  function availableSensors(){return (currentUnitContext().readings||[]).map((value,id)=>({...sensorKinds[id],id,value})).filter(s=>s.name&&typeof s.value==='number'&&Number.isFinite(s.value));}
  function unitDevices(){
    if(!deviceCache.has(unitKey()))deviceCache.set(unitKey(),currentUnitContext().devices?.includes('fan')?[{id:'fan-1',name:'Ventilation fan',mode:'auto',speed:45,draftMode:'auto',draftSpeed:45}]:[]);
    return deviceCache.get(unitKey());
  }
  function maintenanceRecords(){
    if(!maintenanceCache.has(unitKey())){const hidden=['clear','health','feed'].includes(attentionPreview);const f=hidden?null:currentUnitContext().fault||(['maintenance','busy'].includes(attentionPreview)?{pen:'Pen C2',device:'Drinking station',note:'Leaking valve.',by:'G. Hansen · 06:40'}:null);maintenanceCache.set(unitKey(),f?[{...f,id:'existing',resolved:false}]:[]);}
    return maintenanceCache.get(unitKey());
  }
  function sensorHistory(sensor){
    const factors=state.sensorRange==='week'?[-.6,-.2,.4,.1,-.3,.2,0]:[-.5,-.3,-.4,.2,.4,.1,-.1,0];
    const scale=sensor.id===0?1:sensor.id===1?6:2;
    const labels=state.sensorRange==='week'?['6d ago','5d ago','4d ago','3d ago','2d ago','Yesterday','Today']:['00:00','02:00','04:00','06:00','07:00','08:00','09:00',currentUnitContext().updated];
    return factors.map((n,i)=>({time:labels[i],value:+(sensor.value+n*scale).toFixed(sensor.id===0?1:0)}));
  }
  function sensorChart(sensor){
    const rows=sensorHistory(sensor),values=rows.map(r=>r.value),min=Math.min(...values),max=Math.max(...values),pad=sensor.id===0?0.5:1,low=min-pad,high=max+pad;
    const points=rows.map((r,i)=>[38+i*254/(rows.length-1),148-(r.value-low)/(high-low)*118]);
    const line=points.map(p=>p.join(',')).join(' '),path='M'+points.map(p=>p.join(',')).join(' L');
    return `<div class="sensor-chart" role="img" aria-label="${sensor.name} sample trend. Minimum ${min}, maximum ${max} ${sensor.unit}. Reading history below."><svg viewBox="0 0 316 184"><defs><linearGradient id="sensor-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#91ab7c" stop-opacity=".25"/><stop offset="1" stop-color="#91ab7c" stop-opacity="0"/></linearGradient></defs>${[0,1,2].map(i=>{const y=30+i*59;return `<line x1="38" x2="292" y1="${y}" y2="${y}" stroke="#e2e6db"/><text x="1" y="${y+3}">${(high-i*(high-low)/2).toFixed(sensor.id===0?1:0)}</text>`;}).join('')}<path d="${path} L292,148 L38,148 Z" fill="url(#sensor-fill)" stroke="none"/><polyline points="${line}" stroke="#57784a" stroke-width="2.5" fill="none"/>${points.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#57784a" stroke="white"/>`).join('')}<text x="38" y="173">${rows[0].time}</text><text x="166" y="173" text-anchor="middle">${rows[Math.floor(rows.length/2)].time}</text><text x="292" y="173" text-anchor="end">${rows.at(-1).time}</text></svg></div><div class="sensor-range-stats"><span>Low <strong>${min} ${sensor.unit}</strong></span><span>High <strong>${max} ${sensor.unit}</strong></span></div><details class="sensor-history"><summary>Reading history</summary><table><caption class="visually-hidden">${sensor.name} sample readings</caption><thead><tr><th>Time</th><th>${sensor.unit}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.time}</td><td>${r.value}</td></tr>`).join('')}</tbody></table></details>`;
  }
  function environment(){
    const sensors=availableSensors(),selected=sensors.find(s=>s.id===state.sensor)||sensors[0],offline=sync.connection==='offline';
    return legacyHead('Environment & devices','Unit '+state.unit,'<span class="preview-badge">PREVIEW</span>')+`<div class="app-scroll environment-page">${selected?`${SentriUI.segment({variant:'view-switch',options:sensors.map(s=>[s.id,s.name]),active:selected.id,action:'sensor',ariaLabel:'Sensor'})}<section class="sensor-detail"><div class="sensor-detail-heading"><div><p>${selected.name}</p><strong>${selected.value}<small>${selected.unit}</small></strong></div><span>Last reading<br>${currentUnitContext().updated}</span></div>${SentriUI.segment({variant:'view-switch',options:[['today','Today'],['week','7 days']],active:state.sensorRange==='week'?'week':'today',action:'sensor-range',ariaLabel:'Chart period'})}${sensorChart(selected)}<p class="helper">Sample readings · ${offline?'offline, showing last available values':'connected'}</p></section>`:''}${unitDevices().length?`<div class="device-section-heading"><h3>Devices</h3><span>${offline?'Offline':'Connected'}</span></div>${unitDevices().map(d=>`<section class="device-control"><div class="device-control-heading">${icon('air')}<div><h3>${d.name}</h3><p>${d.mode==='auto'?'Auto · following unit schedule':'Manual · '+d.speed+'% speed'}</p></div></div>${SentriUI.segment({variant:'view-switch',options:[['auto','Auto'],['manual','Manual']],active:d.draftMode,action:'fan-mode',ariaLabel:'Fan mode',disabled:offline})}${d.draftMode==='manual'?`<label class="fan-speed-label" for="fan-speed">Fan speed <output id="fan-speed-value">${d.draftSpeed}%</output></label><input id="fan-speed" type="range" min="0" max="100" step="5" value="${d.draftSpeed}" ${offline?'disabled':''}>`:''}${btn('apply-device','Save setting','primary','',offline||d.draftMode===d.mode&&(d.draftMode==='auto'||d.draftSpeed===d.speed)?'disabled':'')}<p class="helper">${offline?'Reconnect to change device settings.':'Preview controls only · no command is sent to equipment.'}</p>${d.updated?`<p class="device-updated">${d.updated}</p>`:''}</section>`).join('')}`:''}</div>`;
  }
  function maintenance(){
    const rows=maintenanceRecords(),open=rows.filter(f=>!f.resolved);
    return legacyHead('Maintenance','Unit '+state.unit,'<span class="preview-badge">PREVIEW</span>')+`<div class="app-scroll maintenance-page"><div class="maintenance-heading"><span>${open.length} open ${open.length===1?'issue':'issues'}</span>${SentriUI.button({action:'report-fault',label:'Report issue',register:'text'})}</div>${rows.length?rows.map(f=>btn('fault-detail',`<span class="maintenance-card-top"><span>${esc(f.device)}</span><small>${f.resolved?'Resolved':'Open'}</small></span><span class="maintenance-location">${esc(f.pen)}</span><p>${esc(f.note)}</p><small>${esc(f.by)}</small>${icon('arrow')}`,'maintenance-card'+(f.resolved?' resolved':''),f.id)).join(''):'<div class="empty-state"><h3>No open issues</h3><p>Report equipment that needs attention in this unit.</p></div>'}<p class="helper">Sample maintenance records · changes stay in this preview.</p></div>`;
  }
  function reportFault(){drawer('Report issue',`<form id="fault-form">${SentriUI.field({label:`Equipment`,control:`<input id="fault-device" name="device" placeholder="e.g. Drinking station" maxlength="80" required>`})}${SentriUI.field({label:`Location in Unit ${state.unit}`,control:`<input id="fault-location" name="location" placeholder="e.g. Pen C2" maxlength="80" required>`})}${SentriUI.field({label:`What needs attention?`,control:`<textarea id="fault-note" name="note" maxlength="500" required></textarea>`})}${SentriUI.button({label:"Record issue",strs:{label:"record.issue"},register:"primary"}).replace('type="button"','type="submit"')}</form>`);}
  function faultDetail(id){const f=maintenanceRecords().find(f=>f.id===id);if(!f)return;state.faultId=id;drawer(f.device,`<p>${esc(f.pen)} · ${f.resolved?'Resolved':'Open'}</p><div class="evidence"><p>${esc(f.note)}</p><small>${esc(f.by)}</small></div>${f.resolved?'':btn('resolve-fault','Mark resolved','primary')}`);}
  function comingUp(){
    const next=futureTasks.filter(t=>t.section===state.section&&(!state.unit||t.units.includes(state.unit))&&t.startDay>=1&&t.startDay<=7).sort((a,b)=>a.startDay-b.startDay||a.id.localeCompare(b.id));
    if(!next.length)return '';
    const visible=state.expandedUpcoming?next:next.slice(0,3);
    return `<section class="upcoming-work"><div class="work-section-heading"><h2>Coming up</h2><span>${next.length} tasks</span></div>${visible.map(n=>`<div class="upcoming-row"><span>${n.batch}</span><div>${n.title}<small>${n.when}</small></div></div>`).join('')}${next.length>3?btn('toggle-upcoming',state.expandedUpcoming?'Show first 3 tasks':`See all ${next.length} upcoming tasks`,'task-list-toggle','','aria-expanded="'+state.expandedUpcoming+'"'):''}</section>`;
  }
  function schedulePreview(){
    const next=futureTasks.filter(t=>t.section===state.section&&(!state.unit||t.units.includes(state.unit))&&t.startDay>=1&&t.startDay<=7);
    const weekdays=['Fri','Sat','Sun','Mon','Tue','Wed','Thu'];
    const days=Array.from({length:7},(_,i)=>i+1);
    const selected=next.filter(t=>t.startDay===state.scheduleDay);
    const selectedLabel=state.scheduleDay?`${weekdays[state.scheduleDay-1]} ${state.scheduleDay+8} Jul`:'';
    const selectedSummary=selected.length===1?`${selected[0].title} · ${selected[0].batch}`:selected.length?`${selected.length} tasks start`:'No tasks start';
    return `<section class="schedule-preview" aria-label="Next seven days schedule">
      <div class="work-section-heading"><h2>Next 7 days</h2><span>Today 8 Jul · ${next.length} starts</span></div>
      <div class="schedule-days" aria-label="Choose a date">${days.map((day,i)=>btn('schedule-day',`<span>${weekdays[i]}</span><strong>${day+8}</strong><i class="${next.some(t=>t.startDay===day)?'has-task':''}" aria-hidden="true"></i>`,'schedule-day'+(state.scheduleDay===day?' selected':''),day,`aria-pressed="${state.scheduleDay===day}" aria-label="July ${day+8}, ${next.filter(t=>t.startDay===day).length} tasks start"`)).join('')}</div>
      ${state.scheduleDay?`<div class="schedule-selected" role="status"><strong>${selectedLabel}</strong><span>${esc(selectedSummary)}</span>${selected.length?btn('schedule-details',`View ${icon('arrow')}`,'schedule-selected-view','','aria-label="View '+selected.length+' task starts on '+selectedLabel+'"'):''}</div>`:''}
    </section>`;
  }
  function showScheduleDetails(){
    const day=state.scheduleDay;
    if(!day)return;
    const next=futureTasks.filter(t=>t.section===state.section&&(!state.unit||t.units.includes(state.unit))&&t.startDay===day);
    if(!next.length)return;
    drawer(`${['Fri','Sat','Sun','Mon','Tue','Wed','Thu'][day-1]} ${day+8} Jul`,`${next.map(t=>`<div class="schedule-detail-row"><strong>${esc(t.title)}</strong><small>${esc(t.batch)} · planned to start</small></div>`).join('')}<p class="work-note">These tasks have not started. Ongoing tasks stay in Today’s work.</p>`,{size:'short'});
  }
  function compactTaskRow(m){
    const source=taskBy(m.id),details=m.identity.context.split(' · '),instance=details.shift();
    const due=m.action?.value;
    const dueLabel=({
      'Pregnancy check':'sows due','Heat check':'sows in heat','Return-heat check':'sows returned',
      'Breeding':'sows mated','Farrowing':'sows due','Piglet processing':'litters due',
      'Treatment course':'pigs due','Vaccination':'pigs due','Pig transfer':'pigs to move',
      'Outbound':'pigs to confirm','Sampling':'targets due'
    })[source.type]||((source.measure||'sows')+' due');
    const waiting=['waiting','upcoming'].includes(m.state);
    const context=details.join(' · '),secondary=m.action?.secondary;
    const detail=[context==='Scheduled move'&&secondary?'':context,secondary,m.timing?.elapsed].filter(Boolean).join(' · ');
    const displayDetail=waiting?m.action?.message||detail:detail;
    return `<button type="button" class="home-task-card compact-task-row ${esc(m.state)}" data-card="${esc(m.id)}" aria-label="${esc(m.identity.title+', '+instance+', '+(waiting?displayDetail:due+' '+dueLabel+', '+displayDetail))}">
      <span class="compact-task-icon" aria-hidden="true">${icon(m.identity.icon||'note')}</span>
      <span class="compact-task-copy"><span class="compact-task-title"><strong>${esc(m.identity.title)}</strong><small>${esc(instance)}</small></span><span class="compact-task-detail">${esc(displayDetail)}</span></span>
      <span class="compact-task-value">${waiting?'<strong class="compact-task-waiting">In progress</strong>':`<strong>${esc(due)}</strong><small>${esc(dueLabel)}</small>`}</span>
      <span class="compact-task-arrow" aria-hidden="true">${icon('arrow')}</span>
    </button>`;
  }
  function joinedTaskRow(m,category){
    const source=taskBy(m.id),details=m.identity.context.split(' · ');details.shift();
    const waiting=['waiting','upcoming'].includes(m.state);
    const title=category==='Production tasks'?m.identity.title:source.batch;
    const instance=category==='Production tasks'?source.batch:'';
    const context=details.join(' · '),secondary=m.action?.secondary;
    const timing=m.timing?.elapsed==='Today'&&secondary?'':m.timing?.elapsed;
    const detail=waiting?m.action?.message||context:[context==='Scheduled move'&&secondary?'':context,secondary,timing].filter(Boolean).join(' · ');
    const number=waiting?'In progress':m.action?.value;
    const unit=source.measure||'sows';
    const label=({'Pregnancy check':'sows due','Heat check':'sows in heat','Return-heat check':'sows returned','Breeding':'sows mated','Farrowing':'sows due','Piglet processing':'litters due','Treatment course':'pigs due','Vaccination':'pigs due','Pig transfer':'pigs to move','Outbound':'pigs to confirm','Sampling':'targets due'})[source.type]||unit+' due';
    return `<button type="button" class="home-task-card joined-task-row ${esc(m.state)}" data-card="${esc(m.id)}" aria-label="${esc(m.identity.title+', '+source.batch+', '+(waiting?detail:number+' '+label+', '+detail))}">
      <span class="joined-task-copy"><span class="joined-task-title"><strong>${esc(title)}</strong>${instance?`<small>${esc(instance)}</small>`:''}</span><span class="joined-task-detail">${esc(detail)}</span></span>
      <span class="joined-task-value"><strong class="${waiting?'joined-task-waiting':''}">${esc(number)}</strong>${waiting?'':`<small>${esc(label)}</small>`}</span>
      <span class="joined-task-arrow" aria-hidden="true">${icon('arrow')}</span>
    </button>`;
  }
  function groupedTaskCards(models){
    const categoryFor=type=>({
      'Treatment course':'Treatment','Vaccination':'Vaccination','Pig transfer':'Pig transfer',
      'Outbound':'Outbound','Sampling':'Sampling'
    })[type]||'Production tasks';
    const groups=new Map();
    models.forEach(model=>{
      const category=categoryFor(model.identity.title);
      if(!groups.has(category))groups.set(category,[]);
      groups.get(category).push(model);
    });
    const urgentTypes=[...groups].filter(([,items])=>items.some(item=>item.attentionRank===0||item.state==='overdue')).map(([category])=>category);
    const defaultOpenType=urgentTypes.length?null:groups.keys().next().value;
    const rows=[...groups].map(([category,items])=>{
      const overdue=items.filter(item=>item.state==='overdue').length;
      const exceptions=items.filter(item=>item.attentionRank===0).length;
      const completedCount=connectedPreview?items.filter(item=>['complete','terminated'].includes(item.state)).length:0;
      const currentItems=connectedPreview?items.filter(item=>!['complete','terminated'].includes(item.state)):items;
      const urgent=overdue+exceptions;
      const defaultOpen=connectedPreview&&groupMode==='collapsed'?false:connectedPreview&&groupMode==='all'?true:urgent>0||category===defaultOpenType;
      const isOpen=state.typeGroupOverrides[category]??defaultOpen;
      const status=connectedPreview?[exceptions?`${exceptions} exception${exceptions===1?'':'s'}`:'',overdue?`${overdue} overdue`:'',`${currentItems.length} open`,completedCount?`${completedCount} done`:''].filter(Boolean).join(' · '):(()=>{
        const subtypeCounts=new Map();
        currentItems.forEach(item=>subtypeCounts.set(item.identity.title,(subtypeCounts.get(item.identity.title)||0)+1));
        const summary=category==='Production tasks'?[...subtypeCounts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([type,count])=>`${type.replace(/ check$/,'')} ×${count}`).join(' · '):currentItems.map(item=>taskBy(item.id).batch.replace(/^(Care plan|Order|Plan|Task)\s+/,'')).join(' · ');
        return [exceptions?`${exceptions} exception${exceptions===1?'':'s'}`:'',overdue?`${overdue} overdue`:'',summary].filter(Boolean).join(' · ');
      })();
      const categoryIcon=category==='Production tasks'?'production':category==='Pig transfer'?'transfer':['Sampling','Outbound'].includes(category)?'note':'care';
      return `<section class="task-type-group ${isOpen?'is-open':''} ${urgent?'has-urgent':''}">
        <button type="button" class="task-type-toggle" data-action="toggle-type" data-value="${esc(category)}" aria-expanded="${isOpen}" aria-label="${esc(category+', '+items.length+' tasks, '+status+', '+(isOpen?'collapse':'expand'))}">
          <span class="task-type-icon" aria-hidden="true">${icon(categoryIcon)}</span>
          <span class="task-type-copy"><strong>${esc(category)}</strong><small>${esc(status)}</small></span>
          <span class="task-type-count">${items.length}<small>${items.length===1?'task':'tasks'}</small></span>
          <span class="task-type-arrow" aria-hidden="true">${icon('arrow')}</span>
        </button>
        ${isOpen?`<div class="task-type-cards">${connectedPreview?items.map(item=>window.SentriHomeTaskCard.render(item,{groupCategory:category,showRecordLink:true})).join(''):seamlessPreview?items.map(item=>window.SentriHomeTaskCard.render(item)).join(''):joinedPreview?items.map(item=>joinedTaskRow(item,category)).join(''):items.map(compactTaskRow).join('')}</div>`:''}
      </section>`;
    }).join('');
    return {count:groups.size,html:`<div class="task-type-list ${joinedPreview?'joined-task-list':''} ${seamlessPreview?'seamless-task-list':''}">${rows}</div>`};
  }
  function home(){
    const models=window.SentriHomeTaskCard.order(scopedTasks().map(taskModel));
    const open=models.filter(m=>!['complete','terminated'].includes(m.state));
    const endedAt=m=>{const stamp=String(m.completedAt||'');const clock=stamp.match(/(\d{1,2}):(\d{2})/);return clock?Number(clock[1])*60+Number(clock[2]):Date.parse(stamp)||0;};
    const completed=models.filter(m=>['complete','terminated'].includes(m.state)).sort((a,b)=>endedAt(b)-endedAt(a)||String(a.id).localeCompare(String(b.id)));
    const visible=state.expandedTasks?open:open.slice(0,5);
    const hidden=open.slice(5),hiddenAlerts=hidden.filter(m=>m.attentionRank===0).length,hiddenOverdue=hidden.filter(m=>m.state==='overdue'||m.attentionRank===1).length;
    const grouped=groupedPreview&&(connectedPreview?open.length+completed.length>=5:open.length>=4)?groupedTaskCards(connectedPreview?[...open,...completed]:open):null;
    const cards=(compactPreview?visible.map(compactTaskRow).join(''):visible.map((m,i,list)=>{
      const quiet=['waiting','upcoming'].includes(m.state),firstQuiet=quiet&&(i===0||!['waiting','upcoming'].includes(list[i-1].state));
      return (firstQuiet&&!groupedPreview?'<div class="work-section-heading next-work-heading"><h2>Next</h2></div>':'')+window.SentriHomeTaskCard.render(m);
    }).join(''))+(connectedPreview?completed.map(m=>window.SentriHomeTaskCard.render(m,{showRecordLink:true})).join(''):'');
    const completedHTML=!connectedPreview&&completed.length?'<details class="completed-work"><summary class="work-section-heading"><h2>Closed tasks</h2><span>'+completed.length+'</span></summary><div class="home-task-list">'+completed.map(m=>window.SentriHomeTaskCard.render(m)).join('')+'</div></details>':'';
    const toggle=!grouped&&open.length>5?btn('toggle-tasks',state.expandedTasks?'Show first 5 tasks':`See all ${open.length} tasks${hiddenAlerts?' · '+hiddenAlerts+' exceptions':''}${hiddenOverdue?' · '+hiddenOverdue+' overdue':''}`,'task-list-toggle','','aria-expanded="'+state.expandedTasks+'"'):'';
    const work=grouped?grouped.html:cards?`<div class="home-task-list ${compactPreview?'compact-task-list':''}">${cards}</div>${toggle}`:`<div class="empty-state">${connectedPreview?'':`<div class="complete-mark">${icon('check')}</div>`}<h3>${connectedPreview?'No current tasks':'No tasks in progress'}</h3><p>${state.unit?'You can still inspect this unit and record anything you find.':'Select a unit to inspect pens or record anything you find.'}</p></div>`;
    const workCount=connectedPreview?`Thu 8 Jul · ${open.length} open${completed.length?' · '+completed.length+' done':''}`:groupedPreview?`${open.length} tasks${grouped?' · '+grouped.count+' types':''}`:compactPreview?open.length+' tasks':'Sample · Thu, 8 Jul';
    return header()+scopeRail()+`<div class="app-scroll screen-enter ${compactPreview?'compact-preview':''} ${groupedPreview?'grouped-preview':''} ${joinedPreview?'joined-preview':''} ${seamlessPreview?'seamless-preview':''} ${connectedPreview?'connected-preview':''}">${state.unit?unitStrip():''}${seamlessPreview?overviewShortcuts()+schedulePreview():''}<div class="work-section-heading"><h2>Today’s work</h2><span>${workCount}</span></div>${work}${seamlessPreview?'':comingUp()}${completedHTML}</div>`+nav();
  }
  function globalSync(){
    const n=sync.pending.length;
    if(!n)return '';
    const zh=params.get('lang')==='zh',error=['failed','conflict'].includes(sync.status),busy=sync.status==='uploading';
    const island=params.get('indicator')==='island';
    const title=zh?(error?`${n} 条记录需要处理`:busy?`正在上传 ${n} 条记录`:`${n} 条记录保存在本机`):(error?`${n} record${n===1?'':'s'} ${n===1?'needs':'need'} attention`:busy?`Uploading ${n} saved records`:`${n} records saved on this phone`);
    const detail=zh?(error?'查看原因':busy?'自动上传中':'联网后自动上传'):(error?'Review records':busy?'Automatic upload':'Uploads when connected');
    const short=zh?(error?'异常':busy?'上传':'待传'):(error?'Fix':busy?'Sending':'Saved');
    return `<div class="global-sync ${error?'needs-attention':busy?'uploading':'waiting'}">${btn('sync',`<span class="global-sync-mark" aria-hidden="true">${busy?'↻':error?'!':'↑'}</span>${island||error?`<span class="global-sync-short">${short}</span>`:''}<strong class="global-sync-count">${n}</strong>`,'global-sync-control','','aria-label="'+esc(title+'. '+detail)+'"'+(busy?' aria-busy="true"':''))}</div>`;
  }
  function showSync(){
    const scenario=sync.pending.length===0?'done':sync.status==='uploading'?'syncing':sync.status==='failed'?'partial':sync.status==='conflict'?'conflict':sync.connection==='offline'?'offline':'syncing';
    const url=new URL('data-sync-astra-prototype.html',location.href);
    url.searchParams.set('scenario',scenario);
    url.searchParams.set('from','home');
    if(params.get('lang')==='zh')url.searchParams.set('lang','zh');
    location.assign(url.href);
  }
  function renderSync(){const top=app.querySelector('.app-scroll')?.scrollTop||0;render();const scroller=app.querySelector('.app-scroll');if(scroller)scroller.scrollTop=top;}
  function sectionChooser(){return head('Your sections')+`<div class="app-scroll screen-enter"><p class="work-note">Select where you're working.</p>${SentriUI.choiceGroup(sections.map(s=>{const count=openTaskCount(s.id);return SentriUI.choiceRow({label:s.name,meta:s.units.length+' units · '+s.population+' pigs · '+(count?count+' '+(count===1?'task':'tasks'):'No open tasks'),mode:'single',selected:s.id===state.section,action:'section',value:s.id});}))}<p class="work-note">Work is shared with your team. Your section selection changes the view for you.</p></div>`+nav();}
  function openDesigned(file,unit,entry,lens=null,taskSync=''){
    const url=new URL(file,location.href);
    url.searchParams.set('layout','focus');url.searchParams.set('from','home');
    url.searchParams.set('section',state.section);url.searchParams.set('entry',entry);
    if(unit)url.searchParams.set('unit',unit);
    if(taskSync)url.searchParams.set('taskSync',taskSync);
    if(['Health','Feed'].includes(lens))url.searchParams.set('lens',lens);
    if(state.unit)url.searchParams.set('returnUnit',state.unit);
    // Save the exact Home scope for the browser's Back button too.
    const homeURL=new URL(location.href);homeURL.searchParams.set('section',state.section);
    homeURL.searchParams.set('view',state.unit?'unit':'overview');
    if(state.unit)homeURL.searchParams.set('unit',state.unit);else homeURL.searchParams.delete('unit');
    history.replaceState(null,'',homeURL);location.assign(url.href);
  }
  function openTask(id,unit=null){
    if(id==='farrow28'){openDesigned('farrowing-astra-concept.html',unit,unit?'unit':'overview',null,sync.pending.length?'other':'done');return;}
    if(id==='piglet27'){openDesigned('../tasks/piglet-processing/simple/index.html',unit,unit?'unit':'overview');return;}
    push('placeholder',{task:id,workUnit:unit});
  }
  function placeholder(){
    const t=task();
    if(t.completedAt||t.terminatedAt)return head(t.type)+'<div class="app-scroll"><div class="empty-state"><div class="complete-mark">'+icon('check')+'</div><h3>'+(t.terminatedAt?'Task ended early':'Task complete')+'</h3><p>'+esc(t.completedAt||t.terminatedAt)+'</p><p>Results page not designed yet.</p></div></div>';
    if(t.preview)return head(t.type)+'<div class="app-scroll"><div class="empty-state"><h3>Task detail preview</h3><p>'+esc(t.batch)+' · '+esc(t.preview.context)+'</p><p>This example shows how the task appears on Home. Its detail and actions are not connected in this study.</p></div></div>';
    return head(t.type)+
      '<div class="app-scroll"><div class="empty-state"><h3>Task preview</h3><p>This task page is still to come. The task stays open between scheduled work.</p></div></div>'+
      SentriUI.sheetFooter({content:btn('end-task-early','End task early','secondary'),className:'page-footer'});
  }
  function assistant(){const showFinding=!state.answered;return legacyHead('Assistant',state.workUnit?`${section().name} · Unit ${state.workUnit}`:section().name,'<span class="preview-badge">PREVIEW</span>')+`<div class="app-scroll screen-enter"><div class="assistant-hero"><div class="assistant-orbit">${icon('spark')}</div><h3>A second look.<br>A little less to carry.</h3><p>Ask about your work, or pick up a finding from the overnight review.</p></div><div class="assistant-tabs">${btn('assistant-tab','Needs you'+(showFinding?' · 1':''),'','findings',`aria-pressed="${state.assistantTab==='findings'}"`)}${btn('assistant-tab','Conversations','','chat',`aria-pressed="${state.assistantTab==='chat'}"`)}</div>${state.assistantTab==='findings'?(showFinding?btn('finding',`<span class="overline">INPUT NEEDED · OVERNIGHT REVIEW</span><h3>Where did the 4 pigs from Unit 7 go?</h3><p>A movement note names Pen A2, but its destination is missing.</p><footer><span>Gestation · reviewed at 05:30</span>${icon('arrow')}</footer>`,'finding'):`<div class="empty-state"><div class="complete-mark">${icon('check')}</div><h3>You're up to date</h3><p>Your answer is saved in this preview. There are no other decisions waiting.</p></div>`)+`<div class="evidence"><strong>Overnight review</strong><p>Sample finding for this design. A background agent is not connected to this prototype.</p></div>`:`${state.chat.length?state.chat.map(m=>`<div class="message ${m.who}">${esc(m.text)}</div>`).join(''):`<p class="work-note">What would you like to look into?</p>${btn('suggestion','Help me plan a move','choice','Help me plan a move')}${btn('suggestion','Review records in this unit','choice','Review records in this unit')}`}`}</div><footer class="page-footer"><form id="ask-form" class="composer"><input name="question" aria-label="Ask Assistant" placeholder="Ask about your work…" autocomplete="off" required maxlength="1000"><button aria-label="Send preview request">${icon('send')}</button></form><p class="helper">Preview only · requests are not sent to an agent.</p></footer>`;}
  function finding(){return legacyHead('Movement needs clarification','Assistant · overnight review','<span class="preview-badge">PREVIEW</span>',false)+`<div class="app-scroll screen-enter"><div class="scope-label">${icon('place')}Gestation / Unit 7 / Pen A2</div><div class="assistant-hero"><p class="overline">YOUR INPUT NEEDED</p><h3>Where did these pigs go?</h3><p>The overnight review found a movement note without a destination.</p></div><div class="evidence"><strong>Movement note · yesterday, 15:40</strong><p>“Moved 4 pigs out of A2.”<br>Recorded by G. Hansen · Unit 7</p></div><div class="evidence"><strong>What is missing</strong><p>The destination unit and pen. No movement record has been changed.</p></div>${state.answered?`<div class="message">Your answer: ${esc(state.answer)}<br>Saved in this preview. No live record was changed.</div>`:`<form id="answer-form">${SentriUI.field({label:`Destination or clarification`,control:`<textarea id="answer" name="answer" placeholder="For example: Unit 8, pen B3" required maxlength="500"></textarea>`})}</form>`}<p class="work-note">Sample decision for reviewing the Assistant experience.</p>${btn('finding-unit','View Unit 7','secondary')}</div>${SentriUI.sheetFooter({content:SentriUI.backButton({action:'back'})+(state.answered?'':'<button class="primary" type="submit" form="answer-form">Send clarification</button>'),className:'page-footer'})}`;}
  function toolbox(){const rows=[...(state.unit?[{action:'maintenance',icon:icon('wrench'),title:'Maintenance',description:'Unit '+state.unit+' · equipment issues'}]:[]),{action:'search',icon:icon('search'),title:'Find a pig or pen',description:'Search by ear tag or pen code'},{action:'records',icon:icon('note'),title:'Records',description:'Updates made in this preview'},{action:'sections',icon:icon('barn'),title:'Sections & units',description:'Browse the farm'},{action:'assistant',icon:icon('spark'),title:'Assistant',description:'Questions, findings and decisions'}];return head('Toolbox')+'<div class="app-scroll screen-enter">'+SentriUI.panel(rows.map(r=>SentriUI.row(r)).join(''),{className:'st-row-group'})+'</div>'+nav('toolbox');}
  function recordLog(){return head('Records')+'<div class="app-scroll screen-enter">'+SentriUI.log(SentriUI.logGroups(state.log.map(l=>({title:l.title,detail:l.context,at:l.at,by:'G. Hansen'}))),{empty:'No new records yet. Answers to overnight findings will appear here.'})+'</div>'+nav('toolbox');}
  const pages={home,sections:sectionChooser,placeholder,environment,maintenance,assistant,finding,toolbox,records:recordLog};
  // The atlas follows the demo (?screen=): the screen whose url holds this scope (view, section, unit, work, attention), else null.
  function atlasScreen(screens){
    const dr=overlay.querySelector('.sheet,.dialog');
    if(state.page==='environment')return unitDevices()[0]?.draftMode==='manual'?'environment.fan-manual':state.sensorRange==='week'?'environment.sensor-week':(state.sensor||0)>0?'environment.sensor-other':'environment.page';
    if(state.page==='assistant')return state.assistantTab==='chat'?(state.chat.length?'assistant.conversation':'assistant.conversations'):state.answered?'assistant.up-to-date':'assistant.needs-you';
    if(state.page==='finding')return state.answered?'assistant.answered':'assistant.finding';
    if(state.page==='toolbox'&&!dr)return 'workbench.toolbox';
    if(state.page==='records')return 'workbench.records';
    if(state.page==='maintenance'){if(dr)return dr.querySelector('#fault-form')?'environment.report-issue':maintenanceRecords().find(f=>f.id===state.faultId)?.resolved?'environment.issue-resolved':'environment.issue-detail';return maintenanceRecords().length?'environment.maintenance':'environment.maintenance-empty';}
    if(dr){
      if(dr.classList.contains('unit-picker'))return 'workbench.choose-unit';
      if(dr.querySelector('#lookup-form'))return dr.querySelector('#tag')?'find-pig.scan':'find-pig.search';
      if((dr.querySelector('[data-action="lookup-result"]')||/No matching sample pig/.test(dr.textContent)))return 'find-pig.results';
      return state.page==='placeholder'&&dr.querySelector('[data-action="confirm-end-task"]')?'workbench.end-task-early':null;
    }
    if(state.page==='placeholder'){const t=task();return t.completedAt||t.terminatedAt?'workbench.closed-task':'workbench.task-preview';}
    if(!['home','sections'].includes(state.page))return null;
    const view=state.page==='sections'?'sections':state.unit?'unit':'';
    const hit=(screens||[]).filter(c=>c.id.startsWith('workbench.')).find(c=>{const u=new URL(c.url,location.href).searchParams;
      return (u.get('view')||'')===view&&(view==='sections'||(u.get('section')||'gestation')===state.section)&&(view!=='unit'||u.get('unit')===String(state.unit))&&(u.get('work')||'mixed')===workPreview&&(u.get('attention')||'current')===attentionPreview&&(u.get('many')||'')===(params.get('many')||'')&&(u.get('variant')||'')===(params.get('variant')||'')&&(u.get('groups')||'')===groupMode&&(u.get('day')||'')===(state.scheduleDay?String(state.scheduleDay):'')&&(u.get('tasks')||'')===(state.expandedTasks?'expanded':'');});
    return hit?hit.id:null;
  }
  function render(){
    const island=params.get('indicator')==='island',badge=globalSync();
    app.classList.toggle('has-global-sync',!!badge);
    app.classList.toggle('island-sync',island);
    app.innerHTML=(island?badge:'')+(pages[state.page]||home)();
    if(badge&&!island)(app.querySelector('.app-header,.page-head,.st-page-header')||app).insertAdjacentHTML('beforeend',badge);
    window.AtlasBare&&AtlasBare.watch(atlasScreen);
    document.querySelectorAll('[data-demo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demo===(state.page==='sections'?'sections':state.unit?'unit':'overview'))));
  }
  if(window.AtlasBare&&AtlasBare.bare)new MutationObserver(()=>AtlasBare.watch(atlasScreen)).observe(overlay,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  function closeDrawer(){overlay.innerHTML='';state.overlay=null;app.inert=false;if(returnFocus?.isConnected)returnFocus.focus();}
  function dialog(title,description,primary){returnFocus=document.activeElement;app.inert=true;overlay.innerHTML=SentriUI.sheet({variant:'dialog',title,icon:'alert',description,label:title,footer:SentriUI.sheetFooter({back:{action:'close'},hold:{label:primary.label,caption:'HOLD TO END',action:primary.action,tone:'danger'}})});overlay.querySelector('.dialog')?.focus({preventScroll:true});}
  function drawer(title,body,{size='medium',sizing='content',surface=''}={}){returnFocus=document.activeElement;app.inert=true;overlay.innerHTML=SentriUI.sheet({title,body,size,sizing,surface,label:title,close:{action:'close',label:'Close dialog'},scrim:{action:'close',label:'Close dialog'},footer:SentriUI.sheetFooter({back:{action:'close'}})});const primary=overlay.querySelector('.sheet-body .primary, .sheet-body [data-drawer-primary]');if(primary){const form=primary.closest('form');if(form)primary.setAttribute('form',form.id);overlay.querySelector('.sheet-footer').append(primary);}overlay.querySelector('.sheet,.dialog')?.focus({preventScroll:true});}
  // Choose a unit: the unit's own overview (pigs, pens, open tasks), not any one task's state. The list follows Your sections and
  // More actions: one white grouped card on the tinted sheet, the current unit ticked.
  function unitChoices(){
    const all=section().units;
    const list=overlay.querySelector('#unit-options');
    // Rows as on More actions: a unit tile (the Inspect unit card's grid icon), the unit name over its overview; the current unit is the highlighted row.
    list.innerHTML='<div class="st-panel st-row-group unit-group">'+all.map(u=>{
      const info=unitInfo(u),count=openTaskCount(state.section,u),current=state.unit===u;
      return SentriUI.row({variant:'navigation',icon:icon('grid'),title:'Unit '+u,description:info.pigs+' pigs · '+info.pens+' pens · '+(count?count+' '+(count===1?'task':'tasks'):'No tasks'),trail:'none',attrs:current?{'aria-current':'location'}:{},action:'pick-unit',value:u});
    }).join('')+'</div>';
  }
  function showUnits(){
    drawer('Choose a unit',`<div id="unit-options" class="unit-options"></div>`,{surface:'menu'});
    overlay.querySelector('.sheet,.dialog').classList.add('unit-picker');unitChoices();
  }
  function showInspectionEntry(){
    if(state.unit){openDesigned('inspection-astra-concept.html',state.unit,'unit');return;}
    drawer('Inspect a unit',`<p class="work-note">Choose where to begin the pen walk.</p><div class="st-panel st-row-group">${section().units.map(u=>SentriUI.row({variant:'navigation',icon:icon('grid'),title:'Unit '+u,description:unitInfo(u).checked,trail:'none',action:'inspect-unit',value:u})).join('')}</div>`,{surface:'menu'});
  }
  function showInventoryEntry(){
    const list=state.unit?[state.unit]:section().units;
    const pigs=list.reduce((n,u)=>n+unitInfo(u).pigs,0);
    drawer('Inventory',`<div class="inventory-summary"><small>${state.unit?'Unit '+state.unit:section().name+' · '+list.length+' units'}</small><strong>${pigs}<span>pigs</span></strong><small>Sample snapshot · Today, 09:40</small></div><div class="st-panel st-row-group">${list.map(u=>SentriUI.row({variant:'navigation',icon:icon('barn'),title:'Unit '+u,description:unitInfo(u).pigs+' pigs · '+unitInfo(u).pens+' pens',trail:'none',action:'inventory-unit',value:u})).join('')}</div><p class="work-note">Sample location snapshot · not a live inventory count.</p>`);
  }
  function selectScope(unit){
    state.unit=unit;state.workUnit=null;state.expandedTasks=false;state.expandedUpcoming=false;state.typeGroupOverrides={};state.scheduleDay=0;
    const url=new URL(location.href);url.searchParams.set('section',state.section);url.searchParams.set('view',unit?'unit':'overview');
    if(unit)url.searchParams.set('unit',unit);else url.searchParams.delete('unit');url.searchParams.delete('tasks');url.searchParams.delete('day');
    history.replaceState(null,'',url);goHome();
  }
  function scan(){drawer('Scan an ear tag',`<div class="scan-frame">${icon('scan')}</div><p>Scanner preview. Use a sample ear tag to try the lookup.</p><form id="lookup-form">${SentriUI.field({label:'Ear tag',control:`<input id="tag" name="tag" inputmode="numeric" placeholder="${taskRecords(taskBy('preg31'),7)[2].id}" required maxlength="12">`})}<button type="submit" class="button primary">Find sample pig</button></form>${btn('sample-scan','Use a sample tag','secondary')}`);}
  function lookup(query){const term=query.trim().toLowerCase();const matches=[];tasks.filter(t=>!t.preview).forEach(t=>Object.keys(t.counts).forEach(u=>taskRecords(t,+u).filter(r=>r.id===term||r.pen.toLowerCase()===term).forEach(r=>matches.push({t,u,r}))));drawer('Search results',matches.length?SentriUI.panel(matches.slice(0,12).map(({t,u,r})=>SentriUI.row({title:r.id+' · Pen '+r.pen,description:'Unit '+u+' · '+t.type+' · '+t.batch,action:'lookup-result',value:t.id+':'+u+':'+r.id})).join(''),{className:'st-row-group'}):'<p>No matching sample pig or pen. Try the suggested sample tag or pen A1.</p>'+btn('search','Search again','secondary'));}
  function chat(question){state.assistantTab='chat';state.chat.push({who:'user',text:question},{who:'assistant',text:'This is a preview of the conversation entrance. In the connected app, I would use your current '+(state.workUnit?'Unit '+state.workUnit:section().name)+' context to investigate this request and ask for any missing details. No analysis or farm action has been performed.'});render();const scroller=app.querySelector('.app-scroll');scroller.scrollTop=scroller.scrollHeight;}
  SentriUI.holdBind(document.body,{onCommit(el){if(el.dataset.action==='confirm-end-task'){task().terminatedAt='Today · just now';closeDrawer();goHome();}}});
  document.addEventListener('click',e=>{
    const demo=e.target.closest('[data-demo]');if(demo){const url=new URL(location.href);if(demo.dataset.demo==='mixed'){url.searchParams.set('section','gestation');url.searchParams.set('many','operations');url.searchParams.set('focus','task-fold');url.searchParams.delete('view');url.searchParams.delete('unit');url.searchParams.delete('tasks');location.assign(url.href);return;}if(manyMode==='operations'){url.searchParams.delete('many');url.searchParams.delete('focus');url.searchParams.delete('tasks');url.searchParams.set('view',demo.dataset.demo);url.searchParams.set('section','gestation');if(demo.dataset.demo==='unit')url.searchParams.set('unit','7');else url.searchParams.delete('unit');location.assign(url.href);return;}closeDrawer();navStack=[];state.section='gestation';state.unit=demo.dataset.demo==='unit'?7:null;state.page=demo.dataset.demo==='sections'?'sections':'home';url.searchParams.set('view',demo.dataset.demo);url.searchParams.set('section','gestation');history.replaceState(null,'',url);render();return;}
    const card=e.target.closest('.home-task-card[data-card]');if(card){openTask(card.dataset.card,state.unit);return;}
    const el=e.target.closest('[data-action]');if(!el||el.disabled||el.matches('.st-hold')||SentriUI.guard(el))return;const a=el.dataset.action,v=el.dataset.value;
    if(a==='close'){closeDrawer();return;}
    if(a==='sync'){showSync();return;}
    if(a==='toggle-tasks'){const scroll=app.querySelector('.app-scroll')?.scrollTop||0;state.expandedTasks=!state.expandedTasks;reflectTaskExpansion();render();app.querySelector('.app-scroll').scrollTop=scroll;return;}
    if(a==='toggle-type'){const scroll=app.querySelector('.app-scroll')?.scrollTop||0;const group=app.querySelector('.task-type-toggle[data-value="'+CSS.escape(v)+'"]');state.typeGroupOverrides[v]=group?.getAttribute('aria-expanded')!=='true';render();app.querySelector('.app-scroll').scrollTop=scroll;return;}
    if(a==='toggle-upcoming'){const scroll=app.querySelector('.app-scroll')?.scrollTop||0;state.expandedUpcoming=!state.expandedUpcoming;render();app.querySelector('.app-scroll').scrollTop=scroll;return;}
    if(a==='schedule-day'){const scroll=app.querySelector('.app-scroll')?.scrollTop||0;state.scheduleDay=state.scheduleDay===+v?0:+v;const url=new URL(location.href);if(state.scheduleDay)url.searchParams.set('day',state.scheduleDay);else url.searchParams.delete('day');history.replaceState(null,'',url);render();app.querySelector('.app-scroll').scrollTop=scroll;return;}
    if(a==='schedule-details'){showScheduleDetails();return;}
    if(a==='end-task-early'){dialog('End task early?','Unfinished work will remain incomplete. Existing records are kept.',{label:'End task early',action:'confirm-end-task'});return;}
    if(a==='confirm-end-task'){task().terminatedAt='Today · just now';closeDrawer();goHome();return;}
    if(a==='back'){back();return;}
    if(a==='home'){goHome();return;}
    if(a==='sections'){push('sections');return;}
    if(a==='section'){state.section=v;state.unit=null;state.workUnit=null;state.expandedTasks=false;state.expandedUpcoming=false;state.typeGroupOverrides={};state.scheduleDay=0;try{localStorage.setItem('sentri-home-prototype-section',v);}catch{/* Optional preview preference. */}const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.delete('tasks');url.searchParams.delete('day');url.searchParams.set('section',v);history.replaceState(null,'',url);goHome();return;}
    if(a==='scope'){selectScope(null);return;}
    if(a==='units'){showUnits();return;}
    if(a==='inspection-entry'){showInspectionEntry();return;}
    if(a==='inventory-entry'){showInventoryEntry();return;}
    if(a==='inspect-unit'){closeDrawer();openDesigned('inspection-astra-concept.html',+v,'unit');return;}
    if(a==='inventory-unit'){closeDrawer();selectScope(+v);return;}
    if(a==='pick-unit'){closeDrawer();selectScope(+v);app.querySelector('.scope-unit')?.focus();return;}
    if(a==='task'){openTask(v,state.unit);return;}
    if(a==='unit-home'){state.unit=+v;goHome();return;}
    if(a==='inspect'){openDesigned('inspection-astra-concept.html',state.unit,'unit',v);return;}
    if(a==='environment'){push('environment',{sensor:0,sensorRange:'today'});return;}
    if(a==='maintenance'||a==='unit-fault'){push('maintenance');return;}
    if(a==='sensor'){state.sensor=+v;render();return;}
    if(a==='sensor-range'){state.sensorRange=v;render();return;}
    if(a==='fan-mode'){if(sync.connection==='offline')return;unitDevices()[0].draftMode=v;render();return;}
    if(a==='apply-device'){if(sync.connection==='offline')return;const d=unitDevices()[0];d.mode=d.draftMode;d.speed=d.draftSpeed;d.updated='Preview setting applied · just now';render();toast('Sample setting saved · no equipment command sent');return;}
    if(a==='report-fault'){reportFault();return;}
    if(a==='fault-detail'){faultDetail(v);return;}
    if(a==='resolve-fault'){const f=maintenanceRecords().find(f=>f.id===state.faultId);if(f)f.resolved=true;closeDrawer();render();faultDetail(state.faultId);return;}
    if(a==='assistant'||a==='context-assistant'){if(a==='assistant')state.workUnit=state.unit;state.assistantTab=a==='context-assistant'?'chat':'findings';push('assistant');return;}
    if(a==='assistant-tab'){state.assistantTab=v;render();return;}
    if(a==='suggestion'){chat(v);return;}
    if(a==='finding'){push('finding');return;}
    if(a==='finding-unit'){state.section='gestation';state.unit=7;goHome();return;}
    if(a==='toolbox'){push('toolbox');return;}
    if(a==='records'){push('records');return;}
    if(a==='scan'){scan();return;}
    if(a==='sample-scan'){lookup(taskRecords(taskBy('preg31'),7)[2].id);return;}
    if(a==='search'){drawer('Find a pig or pen',`<form id="lookup-form">${SentriUI.field({label:'Ear tag or pen code',control:`<input id="query" name="tag" placeholder="${taskRecords(taskBy('preg31'),7)[2].id} or A1" required maxlength="30">`})}<button type="submit" class="button primary">Search</button></form>`,{size:'short'});return;}
    if(a==='lookup-result'){const [tid,u]=v.split(':');closeDrawer();state.section=taskBy(tid).section;openTask(tid,+u);return;}
  });
  document.addEventListener('input',e=>{if(e.target.id!=='fan-speed')return;const d=unitDevices()[0];d.draftSpeed=+e.target.value;document.getElementById('fan-speed-value').textContent=d.draftSpeed+'%';app.querySelector('[data-action="apply-device"]').disabled=sync.connection==='offline'||d.mode===d.draftMode&&d.speed===d.draftSpeed;});
  document.addEventListener('submit',e=>{
    if(!['ask-form','answer-form','note-form','lookup-form','fault-form'].includes(e.target.id))return;e.preventDefault();const data=new FormData(e.target);
    if(e.target.id==='fault-form'){const device=String(data.get('device')).trim(),pen=String(data.get('location')).trim(),note=String(data.get('note')).trim();if(!device||!pen||!note)return;maintenanceRecords().unshift({id:'fault-'+Date.now(),device,pen,note,by:'G. Hansen · just now',resolved:false});closeDrawer();render();toast('Issue saved in this preview');}
    if(e.target.id==='ask-form'){const q=String(data.get('question')).trim();if(q)chat(q);}
    if(e.target.id==='answer-form'){const answer=String(data.get('answer')).trim();if(!answer)return;state.answered=true;state.answer=answer;state.log.unshift({at:Date.now(),title:'Movement clarification received',context:'Unit 7 · Pen A2 · '+answer});render();toast('Clarification saved in this preview');}
    if(e.target.id==='lookup-form')lookup(String(data.get('tag')));
  });
  document.addEventListener('keydown',e=>{if(!overlay.children.length)return;if(e.key==='Escape'){closeDrawer();return;}if(e.key==='Tab'){const focusable=[...overlay.querySelectorAll('.sheet button,.sheet input,.sheet textarea,.sheet a[href],.dialog button')].filter(el=>!el.disabled);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===overlay.querySelector('.sheet,.dialog'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
  $('#sync-demo').addEventListener('change',e=>{
    sync.connection=e.target.value==='offline'?'offline':'online';
    sync.pending=e.target.value==='synced'?[]:e.target.value==='failed'?[pendingExamples[2]]:e.target.value==='conflict'?pendingExamples.slice(0,2):[...pendingExamples];
    sync.status=e.target.value==='synced'?'synced':e.target.value==='failed'?'failed':e.target.value==='conflict'?'conflict':e.target.value==='online'?'uploading':'waiting';
    renderSync();
  });
  $('#sync-demo').value=syncPreset;
  $('#attention-preview').value=attentionPreview;
  $('#attention-preview').addEventListener('change',e=>{attentionPreview=e.target.value;maintenanceCache.clear();const url=new URL(location.href);url.searchParams.set('attention',attentionPreview);history.replaceState(null,'',url);goHome();});
  $('#work-preview').value=workPreview;
  if(manyMode==='operations')$('#work-preview').closest('.sync-demo').hidden=true;
  $('#work-preview').addEventListener('change',e=>{workPreview=e.target.value;const url=new URL(location.href);url.searchParams.set('work',workPreview);history.replaceState(null,'',url);goHome();});
  $('#reset-study').addEventListener('click',()=>location.reload());
  document.querySelectorAll("[data-status-icons]").forEach(e=>{e.innerHTML=icon("signal")+icon("battery");});
  render();
  if(params.get('focus')==='task-fold')requestAnimationFrame(()=>{
    const scroller=app.querySelector('.app-scroll'),toggle=app.querySelector('[data-action="toggle-tasks"]');
    if(scroller&&toggle)scroller.scrollTop+=toggle.getBoundingClientRect().top-scroller.getBoundingClientRect().top-420;
  });
})();
