/* Homepage design prototype. Fictional data, in-memory records, no agent or camera connection.
   One agreed visual direction; sections, overview and unit states are shareable via ?view=.
   Existing designed details are linked; unfinished tasks use a simple placeholder. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    down:'m6 9 6 6 6-6', arrow:'m9 5 7 7-7 7', back:'m14 5-7 7 7 7M7 12h14', close:'m6 6 12 12M18 6 6 18',
    home:'m3 10 9-7 9 7v11h-6v-7H9v7H3z', scan:'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10',
    toolbox:'M3 8h18v12H3zM8 8V4h8v4M3 13h18M10 12v3h4v-3', spark:'m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z',
    grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', check:'m5 12 4 4L19 6',
    clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v6l4 2', note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
    heat:'M12 3c1 5-4 5-4 9 0 2 2 3 3 3-1-3 3-4 3-7 4 4 6 7 4 10-2 4-9 4-12 0-3-5 3-10 6-15z',
    pregnancy:'M3 15h4l3-8 4 12 3-7h4M3 4h18', place:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    barn:'m3 9 9-6 9 6v12H3zM9 21V11h6v10M3 9h18', return:'M4 8h11a6 6 0 0 1 0 12h-3M8 3 3 8l5 5',
    farrow:'M3 12h4l3-7 4 14 3-7h4', send:'M12 20V4m-6 6 6-6 6 6', search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 6 6',
    health:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8M8 12h8M12 8v8',
    alert:'M12 3 2 21h20zM12 9v5M12 17v1', feed:'M3 12h18l-3 7H6zM8 5v3M12 3v4M16 5v3',
    temperature:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0M12 8v9',
    humidity:'M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12z',
    air:'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5',
    wrench:'m14 6 4 4 4-4a7 7 0 0 1-9 9l-7 7-4-4 7-7a7 7 0 0 1 9-9z',
    chart:'M5 20V10M12 20V4M19 20v-8',
    upload:'M12 16V4m-4 4 4-4 4 4M4 15v6h16v-6',
    offline:'m3 3 18 18M4 9a13 13 0 0 1 2-1M10 6a14 14 0 0 1 10 3M7 13a8 8 0 0 1 3-1M14 12a8 8 0 0 1 3 1M10 17a3 3 0 0 1 4 0M12 21h.01'
  };
  const icon = key => window.SentriIcons ? window.SentriIcons.icon(key) : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[key] || paths.arrow}"/></svg>`;
  const btn = (action, text, cls='', value='', extra='') => `<button type="button" class="${cls}" data-action="${action}" data-value="${esc(value)}" ${extra}>${text}</button>`;
  const ib = (action, key, label, value='') => btn(action, icon(key), 'icon-button', value, `aria-label="${esc(label)}"`);
  const sections = [
    {id:'breeding',name:'Breeding',units:[1,2,3,4],population:184,icon:'heat',detail:'Heat checks & service'},
    {id:'gestation',name:'Gestation',units:[7,8,9],population:246,icon:'pregnancy',detail:'Pregnancy & return checks'},
    {id:'farrowing',name:'Farrowing',units:[6,7,8],population:19,icon:'farrow',detail:'Farrowing & litter care'},
    {id:'nursery',name:'Nursery',units:[12,13],population:360,icon:'barn',detail:'Growth & daily care'}
  ];
  const units = {
    1:{pigs:48,pens:6,checked:'Today, 08:20 · M. Chen'},2:{pigs:46,pens:6,checked:'Yesterday, 16:10 · G. Hansen'},3:{pigs:44,pens:6,checked:'Today, 08:45 · M. Chen'},4:{pigs:46,pens:6,checked:'Yesterday, 15:40 · G. Hansen'},
    6:{pigs:8,pens:4,checked:'Today, 08:15 · G. Hansen'},
    7:{pigs:86,pens:8,checked:'Yesterday, 16:10 · G. Hansen'},8:{pigs:74,pens:7,checked:'Today, 08:35 · M. Chen'},9:{pigs:86,pens:8,checked:'Yesterday, 16:40 · G. Hansen'},
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
  const records = new Map();
  tasks.forEach((task,ti) => Object.entries(task.counts).forEach(([unit,[total,done]]) => {
    const list = Array.from({length:total},(_,i) => ({id:String(230+ti*100+Number(unit)*10+i).padStart(6,'0'),pen:'A'+(Math.floor(i/3)+1),result:i<done?(task.outcomes?.[0]||'Recorded'):'',active:task.id==='farrow28'&&Number(unit)!==8&&i===done,birth:task.id==='farrow28'&&i<done?{live:10+i,stillborn:i%2,deaths:i%2}:null}));
    records.set(`${task.id}:${unit}`,list);
  }));
  const params = new URLSearchParams(location.search);
  const attentionModes=['current','clear','health','feed','maintenance','busy','unknown'];
  let attentionPreview=attentionModes.includes(params.get('attention'))?params.get('attention'):'current';
  let workPreview=['mixed','active','waiting','round-complete','ready'].includes(params.get('work'))?params.get('work'):'mixed';
  let rememberedSection;
  try { rememberedSection=localStorage.getItem('sentri-home-prototype-section'); } catch { /* File previews may disable storage. */ }
  const requestedSection=params.get('section')||rememberedSection;
  const initialSection = sections.some(s=>s.id===requestedSection) ? requestedSection : 'gestation';
  let state = {page:'home',section:initialSection,unit:null,task:null,workUnit:null,assistantTab:'findings',chat:[],answered:false,notes:[],log:[],overlay:null};
  // UI-only queue: no device database or upload service is connected to this study.
  const pendingExamples=[{title:'Pregnancy check · 000308',context:'Gestation · Unit 7 · Batch 31',time:'09:32'},{title:'Pen note · C2',context:'Gestation · Unit 8',time:'09:35'},{title:'Feed adjustment · 000267',context:'Gestation · Unit 7 · Pen C1',time:'09:38'}];
  const sync={connection:'offline',pending:[...pendingExamples],status:'waiting',message:'',attempt:0};
  if(params.get('view')==='sections')state.page='sections';
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
  const remaining = unit => tasks.filter(t=>!t.completedAt&&!t.terminatedAt&&t.section===state.section&&t.counts[unit]&&metric(t,unit).left>0);
  const pendingTypes = s => new Set(tasks.filter(t=>!t.completedAt&&!t.terminatedAt&&t.section===s&&metric(t).left>0).map(t=>t.type)).size;
  const nouns = (t,n) => t.measure==='pens'?`${n===1?'pen':'pens'}`:`${n===1?'sow':'sows'}`;
  function toast(text){clearTimeout(toastTimer);$('#notice').textContent=text;toastTimer=setTimeout(()=>$('#notice').textContent='',3500);}
  function push(page,patch={}) {navStack.push({page:state.page,unit:state.unit,task:state.task,workUnit:state.workUnit,section:state.section,scroll:app.querySelector('.app-scroll')?.scrollTop||0});Object.assign(state,patch,{page});render();}
  function back(){const prior=navStack.pop();if(prior){Object.assign(state,prior);render();const scroll=app.querySelector('.app-scroll');if(scroll)scroll.scrollTop=prior.scroll||0;}else{state.page='home';render();}}
  function goHome(){state.page='home';navStack=[];render();}
  function nav(active='home'){return `<nav class="bottom-nav" aria-label="Main navigation">${btn('home',icon('home')+'Home',active==='home'?'active':'')}${btn('scan',icon('scan')+'Scan','scan-button')}${btn('toolbox',icon('toolbox')+'Toolbox',active==='toolbox'?'active':'')}</nav>`;}
  function head(title,sub='',extra='',showBack=true){return `<header class="page-head">${showBack?ib('back','back','Back'):''}<div class="head-copy">${SentriUI.heading({title,description:sub,kind:'page',level:2})}</div>${extra}</header>`;}
  function header(){return `<header class="app-header">${btn('sections',`<span class="farm-label">GREEN VALLEY FARM</span><strong>${section().name}${icon('down')}</strong>`,'section-trigger','','aria-label="Change section, '+section().name+'"')}${btn('assistant',`${icon('spark')}Assistant`,'assistant-door','','aria-label="Assistant"')}</header>`;}
  function scopeRail(){return `<nav class="scope-switch" aria-label="Work scope">${btn('scope','Overview','scope-overview','',`aria-pressed="${!state.unit}"`)}${btn('units',`<span>${state.unit?'Unit '+state.unit:'Choose unit'}<small>${section().units.length} units</small></span>${icon('down')}`,'scope-unit','',`aria-haspopup="dialog" aria-label="${state.unit?'Change unit, Unit '+state.unit:'Choose unit'}, ${section().units.length} units" aria-pressed="${!!state.unit}"`)}</nav>`;}
  // Illustrative task windows. Unit selection changes counts, not batch time.
  const cardFields = {
    preg31:{context:'First check',day:1,days:3,label:'Checks recorded',verb:'sows ready to check',due:{7:2,8:2,9:1},nextAt:1440},
    preg32:{context:'Follow-up',day:1,days:1,label:'Checks recorded',verb:'sows ready to check',due:{7:4,9:4},state:'waiting',nextAt:1440},
    return30:{context:'First monitoring pass',day:3,days:7,kind:'observation',verb:'sows ready to check',due:{7:4,8:6},state:'round-complete',nextAt:870},
    heat34:{context:'Weaned sows',day:2,days:3,kind:'observation',verb:'sows ready to check',due:{1:8,2:6,3:6},nextAt:870},
    heat35:{context:'Replacement gilts',day:1,days:3,kind:'observation',verb:'sows ready to check',due:{2:4,4:6},state:'round-complete',nextAt:870},
    service34:{context:'Service sequence',day:3,days:7,label:'Service sequences complete',verb:'sows ready for service',due:{1:2,3:3},state:'waiting',nextAt:840},
    farrow28:{context:'Farrowing window',day:2,days:7,label:'Farrowings recorded',verb:'sows due today',kind:'distribution',due:{6:2,7:2,8:0},nextAt:1440},
    piglet27:{context:'Age-day schedule',day:3,days:7,label:'All scheduled items complete',verb:'litters due',due:{6:2,7:2},state:'waiting',nextAt:1440}
  };
  function taskModel(t){
    const count=Object.keys(t.counts).length,scope={kind:state.unit?'unit':'overview',label:state.unit?'Unit '+state.unit:'Across '+count+' '+(count===1?'unit':'units'),action:state.unit?'Open unit task':'View task'};
    if(t.completedAt||t.terminatedAt)return {id:t.id,state:t.terminatedAt?'terminated':'complete',identity:{title:t.type,context:t.batch},scope,completedAt:t.completedAt||t.terminatedAt};
    const m=metric(t,state.unit),f=cardFields[t.id],rows=taskRecords(t,state.unit);
    let p=f.kind==='observation'?null:{kind:f.kind||'completion',label:f.label,value:m.done,total:m.total,unit:t.measure||'sows'};
    const due=f.due?(state.unit?f.due[state.unit]||0:Object.values(f.due).reduce((a,b)=>a+b,0)):0;
    const kind=({'Pregnancy check':'pregnancy','Heat check':'heat','Return-heat check':'return-heat','Breeding':'breeding','Farrowing':'farrowing','Piglet processing':'piglet'})[t.type];
    if(kind==='heat')p={kind:'outcome',label:'Recorded in heat',value:rows.filter(r=>r.result==='Heat signs').length,total:m.total,unit:'sows'};
    if(kind==='farrowing')p.kind='completion';
    const facts={due,label:f.verb,live:kind==='farrowing'?rows.filter(r=>r.active).length:0,
      later:kind==='pregnancy'?Math.max(0,m.left-due):0,nextAt:f.nextAt,
      nextLabel:f.nextAt>=1440?'Tomorrow':Math.floor(f.nextAt/60)+':'+String(f.nextAt%60).padStart(2,'0')};
    // These are explicit preview schedule facts, not completion inferred from an empty list.
    const current=workPreview==='mixed'?(f.state||'active'):workPreview;
    if(['waiting','round-complete'].includes(current)){facts.due=0;facts.live=0;facts.roundComplete=current==='round-complete';}
    if(workPreview==='ready'&&p&&p.kind!=='outcome'){p.value=p.total;facts.due=0;facts.live=0;facts.readyToComplete=true;}
    const resolved=window.SentriHomeTaskCard.attention(kind,facts);
    return {id:t.id,...resolved,identity:{title:t.type,context:t.batch+' · '+f.context,icon:'production'},progress:p,
      status:{label:resolved.state==='active'?'Due now':'Waiting',tone:resolved.state==='active'?'blue':''},
      timing:{elapsed:f.days===1?'Today':'Day '+f.day+' of '+f.days},scope};
  }
  function unitStrip(){
    const u=unitInfo(state.unit),sensors=availableSensors(),devices=unitDevices(),faults=maintenanceRecords().filter(f=>!f.resolved);
    // Attention is distinct from all recorded findings: exclude no-action-needed conditions.
    // Counts are fictional snapshot values; null means unavailable, never zero.
    const care=attentionPreview==='unknown'?{health:null,feed:null}:attentionPreview==='busy'?{health:24,feed:13}:attentionPreview==='clear'||attentionPreview==='maintenance'?{health:0,feed:0}:attentionPreview==='health'?{health:3,feed:0}:attentionPreview==='feed'?{health:0,feed:3}:{health:3,feed:3};
    const signals=[{label:'Health',count:care.health,unit:'pig',icon:'health'},{label:'Feed',count:care.feed,unit:'pig',icon:'feed'},{label:'Maintenance',count:faults.length,unit:'issue',icon:'wrench'}];
    const active=signals.filter(s=>Number.isFinite(s.count)&&s.count>0),unavailable=signals.some(s=>s.count===null);
    return `<section class="unit-hub unit-hub-unified" aria-label="Unit ${state.unit} status">
      ${btn('inspect',`${icon('grid')}<span>Inspect unit<small>${u.pigs} pigs · ${u.pens} pens</small></span>${icon('arrow')}`,'unit-hub-inspect')}
      <div class="unit-check-row"><small>Checked ${esc(u.checked.split(' · ')[0])}</small></div>
      <div class="unit-attention" aria-label="Unit attention">${active.length?`<div class="unit-attention-chips">${active.map(s=>`<span class="unit-attention-chip" role="img" aria-label="${s.label}: ${s.count} ${s.unit}${s.count===1?'':'s'} needing attention" title="${s.label}: ${s.count} ${s.unit}${s.count===1?'':'s'} needing attention">${icon(s.icon)}<span aria-hidden="true">${s.label}</span><strong aria-hidden="true">${s.count}</strong></span>`).join('')}</div>`:!unavailable?`<p class="unit-attention-clear">${icon('check')}No flagged items</p>`:''}${unavailable?'<p class="unit-attention-unknown">Health and feed summary unavailable</p>':''}</div>
      ${sensors.length||devices.length?btn('environment',`<span class="unit-environment-label">Environment & devices</span><span class="unit-environment-bottom">${sensors.length?`<span class="unit-live-readings">${sensors.map(s=>`<span>${icon(s.icon)}${s.value}<small>${s.unit}</small></span>`).join('')}</span>`:`<span class="unit-device-count">${devices.length} ${devices.length===1?'device':'devices'}</span>`}${icon('arrow')}</span>`,'unit-hub-environment'):''}
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
    return head('Environment & devices','Unit '+state.unit,'<span class="preview-badge">PREVIEW</span>')+`<div class="app-scroll environment-page">${selected?`<div class="sensor-tabs" role="group" aria-label="Sensor">${sensors.map(s=>btn('sensor',`${icon(s.icon)}${s.name}`,'',s.id,`aria-pressed="${s.id===selected.id}"`)).join('')}</div><section class="sensor-detail"><div class="sensor-detail-heading"><div><p>${selected.name}</p><strong>${selected.value}<small>${selected.unit}</small></strong></div><span>Last reading<br>${currentUnitContext().updated}</span></div><div class="sensor-period" aria-label="Chart period">${btn('sensor-range','Today','','today',`aria-pressed="${state.sensorRange!=='week'}"`)}${btn('sensor-range','7 days','','week',`aria-pressed="${state.sensorRange==='week'}"`)}</div>${sensorChart(selected)}<p class="helper">Sample readings · ${offline?'offline, showing last available values':'connected'}</p></section>`:''}${unitDevices().length?`<div class="device-section-heading"><h3>Devices</h3><span>${offline?'Offline':'Connected'}</span></div>${unitDevices().map(d=>`<section class="device-control"><div class="device-control-heading">${icon('air')}<div><h3>${d.name}</h3><p>${d.mode==='auto'?'Auto · following unit schedule':'Manual · '+d.speed+'% speed'}</p></div></div><div class="device-mode" role="group" aria-label="Fan mode">${['auto','manual'].map(m=>btn('fan-mode',m==='auto'?'Auto':'Manual','',m,`aria-pressed="${d.draftMode===m}" ${offline?'disabled':''}`)).join('')}</div>${d.draftMode==='manual'?`<label class="fan-speed-label" for="fan-speed">Fan speed <output id="fan-speed-value">${d.draftSpeed}%</output></label><input id="fan-speed" type="range" min="0" max="100" step="5" value="${d.draftSpeed}" ${offline?'disabled':''}>`:''}${btn('apply-device','Apply preview setting','secondary','',offline||d.draftMode===d.mode&&(d.draftMode==='auto'||d.draftSpeed===d.speed)?'disabled':'')}<p class="helper">${offline?'Reconnect to change device settings.':'Preview controls only · no command is sent to equipment.'}</p>${d.updated?`<p class="device-updated">${d.updated}</p>`:''}</section>`).join('')}`:''}</div>`;
  }
  function maintenance(){
    const rows=maintenanceRecords(),open=rows.filter(f=>!f.resolved);
    return head('Maintenance','Unit '+state.unit,'<span class="preview-badge">PREVIEW</span>')+`<div class="app-scroll maintenance-page"><div class="maintenance-heading"><span>${open.length} open ${open.length===1?'issue':'issues'}</span>${btn('report-fault','Report issue','text-button')}</div>${rows.length?rows.map(f=>btn('fault-detail',`<span class="maintenance-card-top"><span>${esc(f.device)}</span><small>${f.resolved?'Resolved':'Open'}</small></span><span class="maintenance-location">${esc(f.pen)}</span><p>${esc(f.note)}</p><small>${esc(f.by)}</small>${icon('arrow')}`,'maintenance-card'+(f.resolved?' resolved':''),f.id)).join(''):'<div class="empty-state"><h3>No open issues</h3><p>Report equipment that needs attention in this unit.</p></div>'}<p class="helper">Sample maintenance records · changes stay in this preview.</p></div>`;
  }
  function reportFault(){drawer('Report equipment issue',`<form id="fault-form"><label class="form-label" for="fault-device">Equipment</label><input id="fault-device" name="device" placeholder="e.g. Drinking station" maxlength="80" required><label class="form-label" for="fault-location">Location in Unit ${state.unit}</label><input id="fault-location" name="location" placeholder="e.g. Pen C2" maxlength="80" required><label class="form-label" for="fault-note">What needs attention?</label><textarea id="fault-note" name="note" maxlength="500" required></textarea><button class="primary" type="submit">Save sample issue</button></form>`);}
  function faultDetail(id){const f=maintenanceRecords().find(f=>f.id===id);if(!f)return;state.faultId=id;drawer(f.device,`<p>${esc(f.pen)} · ${f.resolved?'Resolved':'Open'}</p><div class="evidence"><p>${esc(f.note)}</p><small>${esc(f.by)}</small></div>${f.resolved?'<p>Resolved in this preview.</p>':btn('resolve-fault','Mark resolved','primary')}`);}
  function comingUp(){const next=state.section==='farrowing'?null:unitContext[state.unit]?.next;if(!next?.length)return '';return `<details class="upcoming-work"><summary><span>Coming up</span><small>${next.length} ${next.length===1?'batch':'batches'}</small>${icon('down')}</summary>${next.map(n=>`<div class="upcoming-row"><span>${n.batch}</span><div>${n.title}<small>${n.when}</small></div></div>`).join('')}</details>`;}
  function home(){
    const models=window.SentriHomeTaskCard.order(scopedTasks().map(taskModel));
    const cards=models.filter(m=>!['complete','terminated'].includes(m.state)).map((m,i,list)=>{
      const quiet=['waiting','round-complete','upcoming'].includes(m.state),firstQuiet=quiet&&(i===0||!['waiting','round-complete','upcoming'].includes(list[i-1].state));
      return (firstQuiet?'<div class="work-section-heading next-work-heading"><h2>Next</h2></div>':'')+window.SentriHomeTaskCard.render(m);
    }).join('');
    const completed=models.filter(m=>['complete','terminated'].includes(m.state));
    const completedHTML=completed.length?'<section class="completed-work"><div class="work-section-heading"><h2>Closed tasks</h2><span>'+completed.length+'</span></div><div class="home-task-list">'+completed.map(m=>window.SentriHomeTaskCard.render(m)).join('')+'</div></section>':'';
    return header()+scopeRail()+`<div class="app-scroll screen-enter"><div class="home-attention">${sync.pending.length?syncCard():''}</div>${state.unit?unitStrip():''}<div class="work-section-heading"><h2>Today’s work</h2><span>Thu, 8 Jul</span></div>${cards?`<div class="home-task-list">${cards}</div>`:`<div class="empty-state"><div class="complete-mark">${icon('check')}</div><h3>No scheduled tasks today</h3><p>${state.unit?'You can still inspect this unit and record anything you find.':'Select a unit to inspect pens or record anything you find.'}</p>${state.unit?'':'<div class="tomorrow"><p class="overline">Tomorrow</p><strong>Growth check · Batch 26</strong><p>Units 12–13 · sample weights</p></div>'}</div>`}${state.unit?comingUp():''}${completedHTML}${sync.pending.length?'':syncCard()}</div>`+nav();
  }
  function syncCard(){
    const n=sync.pending.length,busy=sync.status==='uploading';
    const title=n?(busy?'Uploading '+n+' records':n+' records saved on this device'):'All records uploaded';
    const subtitle=n?(busy?'Sending saved work…':sync.connection==='offline'?'No connection · waiting to upload':sync.status==='failed'?'Upload interrupted · tap to retry':'Connection available · tap to upload'):'No records waiting on this device';
    return btn('sync',icon(n?(sync.connection==='offline'?'offline':'upload'):'check')+'<span><strong>'+title+'</strong><small>'+subtitle+'</small></span>'+icon('arrow'),'sync-card'+(n?' pending':''),'','aria-label="'+title+'. '+subtitle+'"');
  }
  function showSync(){
    const n=sync.pending.length,busy=sync.status==='uploading',offline=sync.connection==='offline';
    drawer('Saved work',`<div class="sync-summary ${n?'pending':''}">${icon(n?(offline?'offline':'upload'):'check')}<div><strong>${n?n+' records waiting to upload':'Everything is uploaded'}</strong><p>${n?'Saved on this device. Your team will see these changes after upload.':'There are no records waiting on this device.'}</p></div></div><p class="sync-connection">${offline?'No connection · check Wi-Fi or mobile signal':'Connection available'}</p><div class="sync-records">${sync.pending.map(r=>`<div class="sync-record"><div><span>${r.title}</span><small>${r.context}</small></div><time>${r.time}</time></div>`).join('')}</div><p class="sync-message" role="status" aria-live="polite">${busy?'Uploading saved records…':esc(sync.message)}</p>${n?btn('upload',busy?'Uploading…':sync.status==='failed'?'Retry upload':'Upload '+n+' records','primary','',busy?'disabled':''):btn('close','Done','primary')}`);
    overlay.querySelector('.drawer').classList.add('sync-drawer');
  }
  function renderSync(){const top=app.querySelector('.app-scroll')?.scrollTop||0;render();const scroller=app.querySelector('.app-scroll');if(scroller)scroller.scrollTop=top;}
  function uploadPending(){
    if(sync.status==='uploading'||!sync.pending.length)return;
    if(sync.connection==='offline'){sync.status='failed';sync.message='Still no connection. All '+sync.pending.length+' records remain on this device.';showSync();return;}
    sync.status='uploading';sync.message='';const attempt=++sync.attempt;renderSync();showSync();
    setTimeout(()=>{
      if(attempt!==sync.attempt)return;
      if(sync.connection==='failed'){sync.status='failed';sync.message='Upload did not complete. Your records are still on this device. Try again.';}
      else{sync.pending=[];sync.status='synced';sync.message='Upload complete.';}
      renderSync();if(overlay.querySelector('.sync-drawer'))showSync();
    },900);
  }
  function sectionChooser(){return head('Your sections','Green Valley Farm')+`<div class="app-scroll screen-enter"><p class="work-note">Choose where you're working.</p><div class="section-list">${sections.map(s=>{const count=pendingTypes(s.id);return btn('section',`<div class="section-card-top"><span class="section-symbol">${icon(s.icon)}</span><strong>${s.name}</strong>${icon(s.id===state.section?'check':'arrow')}</div><p class="population">${s.units.length} units · ${s.population} pigs</p><div class="section-work"><strong>${count?count+' task types ready':'No scheduled work today'}</strong></div>`,'section-card'+(s.id===state.section?' selected':''),s.id);}).join('')}</div><p class="work-note">Work is shared with your team. Your section selection changes the view for you.</p></div>`+nav();}
  function openDesigned(file,unit,entry,lens=null){
    const url=new URL(file,location.href);
    url.searchParams.set('layout','focus');url.searchParams.set('from','home');
    url.searchParams.set('section',state.section);url.searchParams.set('entry',entry);
    if(unit)url.searchParams.set('unit',unit);
    if(['Health','Feed'].includes(lens))url.searchParams.set('lens',lens);
    if(state.unit)url.searchParams.set('returnUnit',state.unit);
    // Save the exact Home scope for the browser's Back button too.
    const homeURL=new URL(location.href);homeURL.searchParams.set('section',state.section);
    homeURL.searchParams.set('view',state.unit?'unit':'overview');
    if(state.unit)homeURL.searchParams.set('unit',state.unit);else homeURL.searchParams.delete('unit');
    history.replaceState(null,'',homeURL);location.assign(url.href);
  }
  function openTask(id,unit=null){
    if(id==='farrow28'){openDesigned('farrowing-astra-concept.html',unit,unit?'unit':'overview');return;}
    push('placeholder',{task:id,workUnit:unit});
  }
  function placeholder(){
    const t=task();
    if(t.completedAt||t.terminatedAt)return head(t.type,t.batch+(t.terminatedAt?' · Ended early':' · Completed'),'',false)+'<div class="app-scroll"><div class="empty-state"><div class="complete-mark">'+icon('check')+'</div><h3>'+(t.terminatedAt?'Task ended early':'Task complete')+'</h3><p>'+esc(t.completedAt||t.terminatedAt)+'</p><p>Results page not designed yet.</p></div></div><footer class="page-footer st-home-drawer-footer">'+btn('back',icon('back')+'Back','st-home-back')+'</footer>';
    return head(t.type,t.batch+(taskModel(t).state==='ready'?' · All units':state.workUnit?' · Unit '+state.workUnit:' · All units'),'',false)+
      '<div class="app-scroll"><div class="empty-state"><h3>'+(taskModel(t).state==='ready'?'Ready to complete':'Task preview')+'</h3><p>'+(taskModel(t).state==='ready'?'All required work across all units is recorded. Complete the task to move it into closed tasks.':'This task page is still to come. The task stays open between scheduled work.')+'</p></div></div>'+ 
      '<footer class="page-footer st-home-drawer-footer">'+btn('back',icon('back')+'Back','st-home-back')+(taskModel(t).state==='ready'?btn('complete-task','Complete task','primary'):btn('end-task-early','End task early','secondary'))+'</footer>';
  }
  function assistant(){const showFinding=!state.answered;return head('Assistant',state.workUnit?`${section().name} · Unit ${state.workUnit}`:section().name,'<span class="preview-badge">PREVIEW</span>')+`<div class="app-scroll screen-enter"><div class="assistant-hero"><div class="assistant-orbit">${icon('spark')}</div><h3>A second look.<br>A little less to carry.</h3><p>Ask about your work, or pick up a finding from the overnight review.</p></div><div class="assistant-tabs">${btn('assistant-tab','Needs you'+(showFinding?' · 1':''),'','findings',`aria-pressed="${state.assistantTab==='findings'}"`)}${btn('assistant-tab','Conversations','','chat',`aria-pressed="${state.assistantTab==='chat'}"`)}</div>${state.assistantTab==='findings'?(showFinding?btn('finding',`<span class="overline">INPUT NEEDED · OVERNIGHT REVIEW</span><h3>Where did the 4 pigs from Unit 7 go?</h3><p>A movement note names Pen A2, but its destination is missing.</p><footer><span>Gestation · reviewed at 05:30</span>${icon('arrow')}</footer>`,'finding'):`<div class="empty-state"><div class="complete-mark">${icon('check')}</div><h3>You're up to date</h3><p>Your answer is saved in this preview. There are no other decisions waiting.</p></div>`)+`<div class="evidence"><strong>Overnight review</strong><p>Sample finding for this design. A background agent is not connected to this prototype.</p></div>`:`${state.chat.length?state.chat.map(m=>`<div class="message ${m.who}">${esc(m.text)}</div>`).join(''):`<p class="work-note">What would you like to look into?</p>${btn('suggestion','Help me plan a move','choice','Help me plan a move')}${btn('suggestion','Review records in this unit','choice','Review records in this unit')}`}`}</div><footer class="page-footer"><form id="ask-form" class="composer"><input name="question" aria-label="Ask Assistant" placeholder="Ask about your work…" autocomplete="off" required maxlength="1000"><button aria-label="Send preview request">${icon('send')}</button></form><p class="helper">Preview only · requests are not sent to an agent.</p></footer>`;}
  function finding(){return head('Movement needs clarification','Assistant · overnight review','<span class="preview-badge">PREVIEW</span>',false)+`<div class="app-scroll screen-enter"><div class="scope-label">${icon('place')}Gestation / Unit 7 / Pen A2</div><div class="assistant-hero"><p class="overline">YOUR INPUT NEEDED</p><h3>Where did these pigs go?</h3><p>The overnight review found a movement note without a destination.</p></div><div class="evidence"><strong>Movement note · yesterday, 15:40</strong><p>“Moved 4 pigs out of A2.”<br>Recorded by G. Hansen · Unit 7</p></div><div class="evidence"><strong>What is missing</strong><p>The destination unit and pen. No movement record has been changed.</p></div>${state.answered?`<div class="message">Your answer: ${esc(state.answer)}<br>Saved in this preview. No live record was changed.</div>`:`<form id="answer-form"><label class="form-label" for="answer">Destination or clarification</label><textarea id="answer" name="answer" placeholder="For example: Unit 8, pen B3" required maxlength="500"></textarea></form>`}<p class="work-note">Sample decision for reviewing the Assistant experience.</p>${btn('finding-unit','View Unit 7','secondary')}</div><footer class="page-footer st-home-drawer-footer">${btn('back',icon('back')+'Back','st-home-back')}${state.answered?'':'<button class="primary" type="submit" form="answer-form">Send clarification</button>'}</footer>`;}
  function toolbox(){const rows=[...(state.unit?[{action:'maintenance',icon:icon('wrench'),title:'Maintenance',description:'Unit '+state.unit+' · equipment issues'}]:[]),{action:'search',icon:icon('search'),title:'Find a pig or pen',description:'Search by ear tag or pen code'},{action:'records',icon:icon('note'),title:'Records',description:'Updates made in this preview'},{action:'sections',icon:icon('barn'),title:'Sections & units',description:'Browse the farm'},{action:'assistant',icon:icon('spark'),title:'Assistant',description:'Questions, findings and decisions'}];return head('Toolbox','Find records and specific tools')+'<div class="app-scroll screen-enter">'+SentriUI.panel(rows.map(r=>SentriUI.row(r)).join(''),{className:'st-row-group'})+'<a class="tool-row gallery-tool-link" href="sentri-components-study.html">Shared component study ↗</a><a class="tool-row gallery-tool-link" href="task-cards-astra-prototype.html">Task card gallery ↗</a></div>'+nav('toolbox');}
  function recordLog(){return head('Records','Updates in this prototype')+'<div class="app-scroll screen-enter">'+SentriUI.log([{label:'Today',entries:state.log.map(l=>({title:l.title,detail:l.context,meta:'G. Hansen · just now'}))}],{empty:'No new records yet. Answers to overnight findings will appear here.'})+'</div>'+nav('toolbox');}
  const pages={home,sections:sectionChooser,placeholder,environment,maintenance,assistant,finding,toolbox,records:recordLog};
  function render(){app.innerHTML=(pages[state.page]||home)();document.querySelectorAll('[data-demo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demo===(state.page==='sections'?'sections':state.unit?'unit':'overview'))));}
  function closeDrawer(){overlay.innerHTML='';state.overlay=null;app.inert=false;if(returnFocus?.isConnected)returnFocus.focus();}
  function drawer(title,body,{size='medium',sizing='content'}={}){returnFocus=document.activeElement;app.inert=true;overlay.innerHTML=`<button class="scrim" data-action="close" aria-label="Close dialog"></button><section class="drawer" data-st-context="drawer" data-size="${size}" data-sizing="${sizing}" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1"><div class="drawer-handle"></div><header class="drawer-head">${SentriUI.heading({title,kind:'page',level:2}).replace('<h2','<h2 id="drawer-title"')}${ib('close','close','Close dialog')}</header><div class="drawer-body">${body}</div><footer class="st-home-drawer-footer">${btn('close',icon('back')+'<span>Back</span>','st-home-back')}</footer></section>`;const primary=overlay.querySelector('.drawer-body .primary, .drawer-body [data-drawer-primary]');if(primary){const form=primary.closest('form');if(form)primary.setAttribute('form',form.id);overlay.querySelector('.st-home-drawer-footer').append(primary);}overlay.querySelector('.drawer')?.focus({preventScroll:true});}
  function unitChoices(){
    const all=section().units;
    const list=overlay.querySelector('#unit-options');
    list.innerHTML=all.map(u=>{
      const info=unitInfo(u),count=remaining(u).length;
      return SentriUI.row({title:'Unit '+u,description:info.pigs+' pigs · '+info.pens+' pens',trailing:count?count+' '+(count===1?'task':'tasks'):'No tasks',action:'pick-unit',value:u,attrs:{'aria-current':state.unit===u?'location':'false'}});
    }).join('');
  }
  function showUnits(){
    drawer(section().name+' units',`<p class="unit-picker-count">All ${section().units.length} units</p><div id="unit-options" class="unit-options st-panel st-row-group" role="group" aria-label="Units"></div>`);
    overlay.querySelector('.drawer').classList.add('unit-picker');unitChoices();
  }
  function selectScope(unit){
    state.unit=unit;state.workUnit=null;
    const url=new URL(location.href);url.searchParams.set('section',state.section);url.searchParams.set('view',unit?'unit':'overview');
    if(unit)url.searchParams.set('unit',unit);else url.searchParams.delete('unit');
    history.replaceState(null,'',url);goHome();
  }
  function scan(){drawer('Scan an ear tag',`<div class="scan-frame">${icon('scan')}</div><p>Scanner preview. Use a sample ear tag to try the lookup.</p><form id="lookup-form"><label class="form-label" for="tag">Ear tag</label><input id="tag" name="tag" inputmode="numeric" placeholder="${taskRecords(taskBy('preg31'),7)[2].id}" required maxlength="12"><button type="submit" class="primary">Find sample pig</button></form>${btn('sample-scan','Use a sample tag','secondary')}<p class="helper">Camera and tag-reader hardware are not connected.</p>`);}
  function lookup(query){const term=query.trim().toLowerCase();const matches=[];tasks.forEach(t=>Object.keys(t.counts).forEach(u=>taskRecords(t,+u).filter(r=>r.id===term||r.pen.toLowerCase()===term).forEach(r=>matches.push({t,u,r}))));drawer('Search results',matches.length?SentriUI.panel(matches.slice(0,12).map(({t,u,r})=>SentriUI.row({title:r.id+' · Pen '+r.pen,description:'Unit '+u+' · '+t.type+' · '+t.batch,action:'lookup-result',value:t.id+':'+u+':'+r.id})).join(''),{className:'st-row-group'}):'<p>No matching sample pig or pen. Try the suggested sample tag or pen A1.</p>'+btn('search','Search again','secondary'));}
  function chat(question){state.assistantTab='chat';state.chat.push({who:'user',text:question},{who:'assistant',text:'This is a preview of the conversation entrance. In the connected app, I would use your current '+(state.workUnit?'Unit '+state.workUnit:section().name)+' context to investigate this request and ask for any missing details. No analysis or farm action has been performed.'});render();const scroller=app.querySelector('.app-scroll');scroller.scrollTop=scroller.scrollHeight;}
  document.addEventListener('click',e=>{
    const demo=e.target.closest('[data-demo]');if(demo){closeDrawer();navStack=[];state.section='gestation';state.unit=demo.dataset.demo==='unit'?7:null;state.page=demo.dataset.demo==='sections'?'sections':'home';const url=new URL(location.href);url.searchParams.set('view',demo.dataset.demo);url.searchParams.set('section','gestation');history.replaceState(null,'',url);render();return;}
    const card=e.target.closest('.home-task-card[data-card]');if(card){openTask(card.dataset.card,state.unit);return;}
    const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action,v=el.dataset.value;
    if(a==='close'){closeDrawer();return;}
    if(a==='sync'){showSync();return;}
    if(a==='upload'){uploadPending();return;}
    if(a==='complete-task'){if(taskModel(task()).state!=='ready')return;task().completedAt='Today · just now';goHome();return;}
    if(a==='end-task-early'){drawer('End task early?','<p>Unfinished work will remain incomplete. Existing records are kept.</p>'+btn('confirm-end-task','End task early','secondary danger','','data-drawer-primary'),{size:'compact'});return;}
    if(a==='confirm-end-task'){task().terminatedAt='Today · just now';closeDrawer();goHome();return;}
    if(a==='back'){back();return;}
    if(a==='home'){goHome();return;}
    if(a==='sections'){push('sections');return;}
    if(a==='section'){state.section=v;state.unit=null;state.workUnit=null;try{localStorage.setItem('sentri-home-prototype-section',v);}catch{/* Optional preview preference. */}const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.set('section',v);history.replaceState(null,'',url);goHome();return;}
    if(a==='scope'){selectScope(null);return;}
    if(a==='units'){showUnits();return;}
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
    if(a==='resolve-fault'){const f=maintenanceRecords().find(f=>f.id===state.faultId);if(f)f.resolved=true;closeDrawer();render();toast('Issue resolved in this preview');return;}
    if(a==='assistant'||a==='context-assistant'){if(a==='assistant')state.workUnit=state.unit;state.assistantTab=a==='context-assistant'?'chat':'findings';push('assistant');return;}
    if(a==='assistant-tab'){state.assistantTab=v;render();return;}
    if(a==='suggestion'){chat(v);return;}
    if(a==='finding'){push('finding');return;}
    if(a==='finding-unit'){state.section='gestation';state.unit=7;goHome();return;}
    if(a==='toolbox'){push('toolbox');return;}
    if(a==='records'){push('records');return;}
    if(a==='scan'){scan();return;}
    if(a==='sample-scan'){lookup(taskRecords(taskBy('preg31'),7)[2].id);return;}
    if(a==='search'){drawer('Find a pig or pen',`<form id="lookup-form"><label class="form-label" for="query">Ear tag or pen code</label><input id="query" name="tag" placeholder="${taskRecords(taskBy('preg31'),7)[2].id} or A1" required maxlength="30"><button type="submit" class="primary">Search sample records</button></form>`,{size:'short'});return;}
    if(a==='lookup-result'){const [tid,u]=v.split(':');closeDrawer();state.section=taskBy(tid).section;openTask(tid,+u);return;}
  });
  document.addEventListener('input',e=>{if(e.target.id!=='fan-speed')return;const d=unitDevices()[0];d.draftSpeed=+e.target.value;document.getElementById('fan-speed-value').textContent=d.draftSpeed+'%';app.querySelector('[data-action="apply-device"]').disabled=sync.connection==='offline'||d.mode===d.draftMode&&d.speed===d.draftSpeed;});
  document.addEventListener('submit',e=>{
    if(!['ask-form','answer-form','note-form','lookup-form','fault-form'].includes(e.target.id))return;e.preventDefault();const data=new FormData(e.target);
    if(e.target.id==='fault-form'){const device=String(data.get('device')).trim(),pen=String(data.get('location')).trim(),note=String(data.get('note')).trim();if(!device||!pen||!note)return;maintenanceRecords().unshift({id:'fault-'+Date.now(),device,pen,note,by:'G. Hansen · just now',resolved:false});closeDrawer();render();toast('Issue saved in this preview');}
    if(e.target.id==='ask-form'){const q=String(data.get('question')).trim();if(q)chat(q);}
    if(e.target.id==='answer-form'){const answer=String(data.get('answer')).trim();if(!answer)return;state.answered=true;state.answer=answer;state.log.unshift({title:'Movement clarification received',context:'Unit 7 · Pen A2 · '+answer});render();toast('Clarification saved in this preview');}
    if(e.target.id==='lookup-form')lookup(String(data.get('tag')));
  });
  document.addEventListener('keydown',e=>{if(!overlay.children.length)return;if(e.key==='Escape'){closeDrawer();return;}if(e.key==='Tab'){const focusable=[...overlay.querySelectorAll('.drawer button,.drawer input,.drawer textarea,.drawer a[href]')].filter(el=>!el.disabled);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===overlay.querySelector('.drawer'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
  $('#sync-demo').addEventListener('change',e=>{
    sync.attempt++;sync.connection=e.target.value;sync.pending=e.target.value==='synced'?[]:[...pendingExamples];sync.status=e.target.value==='synced'?'synced':'waiting';sync.message='';
    const open=!!overlay.querySelector('.sync-drawer');renderSync();if(open)showSync();
  });
  $('#attention-preview').value=attentionPreview;
  $('#attention-preview').addEventListener('change',e=>{attentionPreview=e.target.value;maintenanceCache.clear();const url=new URL(location.href);url.searchParams.set('attention',attentionPreview);history.replaceState(null,'',url);goHome();});
  $('#work-preview').value=workPreview;
  $('#work-preview').addEventListener('change',e=>{workPreview=e.target.value;const url=new URL(location.href);url.searchParams.set('work',workPreview);history.replaceState(null,'',url);goHome();});
  $('#reset-study').addEventListener('click',()=>location.reload());
  render();
})();
