/* Component-first study. Task rules cite Claude's consolidated docs; sample data only. */
(() => {
  const {render:card,escape:e}=window.SentriHomeTaskCard;
  const tasks=[
    {id:'pregnancy',title:'Pregnancy check',context:'Batch 31 · first check',counts:[[8,20],[2,6]],action:['5','2'],verb:'sows ready to check',progress:'Checks recorded',unit:'sows',kind:'completion',day:2,days:3,next:'Window ends tomorrow',rule:'Checked / eligible for this specific check. Unclear counts as a performed check, but its follow-up remains separate.',timing:'Day N of the configured three-day sweep. Scheduled first/second checks and unclear-result rechecks are different instances.',inside:'Pregnant, not pregnant and unclear outcomes, pregnancy rate, unit breakdown and recheck dates.',source:'pregnancy-check'},
    {id:'heat',title:'Heat check',context:'Batch 34 · heat window',counts:[[32,50],[6,12]],action:['18','6'],verb:'to check',progress:'Recorded in heat',unit:'sows',kind:'outcome',day:2,days:3,next:'Next observation 14:30',rule:'The Home count is the eligible cohort for the current scheduled observation. The Recorded in heat bar shows the cumulative outcome, not completion of observations. Detailed targets remain in task overview. Unmarked animals retain their state.',timing:'Day N of the configured heat window, days left and next observation time. The docs contain different sample durations; use the actual batch configuration.',inside:'Heat-rate KPI and target, signs, observation activity and per-unit outcomes.',source:'heat-check'},
    {id:'breeding',title:'Breeding',context:'Batch 34 · service sequence',counts:[[12,24],[4,8]],action:['7','3'],verb:'sows ready for service',progress:'Service sequences complete',unit:'sows',kind:'sequence',day:3,days:7,next:'Next eligibility 14:00',rule:'Sows that reached the configured service count / enrolled in-heat sows. A single service is not a completed sequence.',timing:'Day N of the batch window. Animal-specific service intervals determine readiness; the next eligibility time is separate from the overall deadline.',inside:'First/repeat service breakdown, semen records, intervals and heat-to-mating performance.',source:'breeding'},
    {id:'return-heat',title:'Return-heat check',context:'Batch 30 · first monitoring pass',counts:[[2,40],[1,16]],action:['38','15'],verb:'to check',progress:'Monitoring window',unit:'days',kind:'days',day:3,days:7,next:'Next observation 14:30',rule:'Home shows eligible sows in the current scheduled observation. No monitoring bar or returned count on Home; those details live in task overview. A round-complete state requires explicit activity evidence and is never inferred from missing return marks.',timing:'Day 3 of a configured seven-day window, four days after today remaining. Next observation follows the configured daily schedule.',inside:'Returned animals, signs, check activity, missed checks and return-rate KPI.',source:'return-heat'},
    {id:'farrowing',title:'Farrowing',context:'Batch 28 · farrowing window',counts:[[7,18],[1,6]],action:['2','1'],verb:'sows farrowing now',progress:'Farrowed',unit:'sows',kind:'distribution',day:2,days:7,next:'4 due today across the task',rule:'Final farrowing records / enrolled sows. Due today comes from expected dates for sows without a final record. Explicit in-progress records are optional: final-only recording works without classifying unrecorded animals as awaiting. Birth counts and litter KPIs stay inside the task.',timing:'Use a configured batch window when available. Otherwise show days since task start without inventing an end date; individual sow due dates stay independent.',inside:'Farrowed/active/awaiting by unit, litter outcomes, live-birth and stillbirth metrics. Existing Farrowing experience remains the destination.',source:'farrowing'},
    {id:'postpartum',title:'Postpartum check',context:'Batch 28 · scheduled assessment',counts:[[5,13],[2,5]],action:['8','3'],verb:'sows to assess',progress:'Checked / farrowed',unit:'sows',kind:'completion',day:1,days:3,next:'Assessments due today',rule:'Checked / farrowed sows. The denominator grows as more sows farrow, so the displayed ratio can change without losing any records.',timing:'Configured start after farrowing and three-day assessment window. Recheck triggers are not fully specified and are not invented on the card.',inside:'Assessment answers, abnormal findings, rechecks, pass-rate KPI and unit breakdown.',source:'postpartum'},
    {id:'piglet',title:'Piglet processing',context:'Batch 28 · age-day schedule',counts:[[3,12],[1,5]],action:['9','4'],verb:'litters with work due',progress:'All scheduled items complete',unit:'pens',kind:'milestones',day:3,days:7,next:'Next scheduled work tomorrow',rule:'Fully processed pens / eligible pens. Partially completed litters do not count as finished. The action count describes work due now; the bar covers the whole schedule.',timing:'Task elapsed time comes from the batch instance. Each litter’s age-day schedule determines its next work; litter age and task age must not be conflated.',inside:'Required care items by age-day, partial/completed states, identification, litter weights and on-time KPI.',source:'piglet-processing'},
    {id:'weaning',title:'Weaning check',context:'Batch 26 · weaning assessment',counts:[[5,12],[2,5]],action:['7','3'],verb:'pens to assess',progress:'Assessments recorded',unit:'pens',kind:'completion',day:2,days:3,next:'Planned weaning tomorrow',rule:'Checked / eligible pens, as specified in the shared task configuration. Assessment does not itself move the pigs.',timing:'Use the configured day window. The shared task screens define a window, but not a universal duration; three days here is illustrative.',inside:'Litter counts and weights, sow assessment, average-weight KPI and unit breakdown.',source:'../system/screens.html',sourceLabel:'Shared task configuration'},
    {id:'treatment',title:'Treatments',context:'Care plan 04 · today’s session',counts:[[8,20],[3,8]],action:['12','5'],verb:'pigs due this session',progress:'Today’s session recorded',unit:'pigs',kind:'completion',day:2,days:5,next:'Next session 16:00',rule:'Proposed: recorded / due animals for the named session. The progress label must distinguish this session from completion of an entire course.',timing:'Proposed plan-level elapsed and remaining days plus the next session. Treatment-action docs define recording fields, not scheduled course completion.',inside:'Assigned plan, treatment/administration history and remaining sessions. Course completion needs a defined product rule.',source:'../ops/health.md',draft:true},
    {id:'vaccine',title:'Vaccinations',context:'Batch 31 · vaccination campaign',counts:[[32,80],[12,30]],action:['48','18'],verb:'pigs to vaccinate',progress:'This vaccination recorded',unit:'pigs',kind:'completion',day:2,days:4,next:'Session today, 10:00',rule:'Proposed: animals recorded / eligible for this scheduled vaccination. A future booster is a separate scheduled instance, not implicitly complete.',timing:'Proposed campaign start/end dates. The existing action spec supports vaccination but does not define campaign scheduling or progress.',inside:'Assigned vaccine, eligibility, previous vaccination records, lot details and administration recording.',source:'../ops/health.md',draft:true},
    {id:'transfer',title:'Pig transfer',context:'Movement order · Batch 31',counts:[[12,36],[4,14]],action:['24','10'],verb:'pigs remaining to move',progress:'Movement recorded',unit:'pigs',kind:'completion',day:1,days:2,next:'Receiving window 14:00–16:00',rule:'Proposed: confirmed movements / animals in the order. Selecting animals or choosing a destination does not advance progress.',timing:'Proposed order start date and deadline. The movement docs establish placement and record handling, not an order lifecycle.',inside:'Exact source/destination pens, receiving capacity, selected animals and transfer of group records.',source:'../ops/place-identity.md',draft:true}
  ];
  const closures=new Map();
  const query=new URLSearchParams(location.search);
  const state={task:tasks.some(t=>t.id===query.get('task'))?query.get('task'):'pregnancy',scenario:query.get('scenario')||'',status:['mixed','active','waiting','round-complete','complete','upcoming','overdue','undated'].includes(query.get('state'))?query.get('state'):'active',view:['component','library','rules'].includes(query.get('view'))?query.get('view'):'component',annotated:true};
  const commonScenarios=[{id:'due',label:'Due now',state:'active'},{id:'waiting',label:'Waiting',state:'waiting'},{id:'complete',label:'Completed',state:'complete'}];
  const scenarios={
    farrowing:[
      {id:'due',label:'Due today',state:'active',note:'No recorded in-progress or past-date cases in this example, so due today becomes the main count.'},
      {id:'live',label:'Farrowing underway',state:'active',note:'Recorded farrowing takes priority over past expected dates and due-today counts. One supporting line shows the next most important fact.'},
      {id:'final-only',label:'Final records only',state:'active',note:'Same due dates and final-record progress. No start records are required, and unrecorded sows are not labelled awaiting or inactive.'},
      {id:'unit-waiting',label:'Nothing due in this unit',state:'active',note:'Overview still has work due elsewhere. Unit 7 has no due or in-progress sows recorded; its card shows the next expected day.'},
      {id:'late',label:'Past expected date',state:'active',note:'Past the expected date with no final record. This calls for checking the animal or updating the record; it does not prove farrowing has not happened.'},
      {id:'waiting',label:'Next due tomorrow',state:'waiting'},
      {id:'complete',label:'Completed',state:'complete'}
    ],
    breeding:[{id:'due',label:'Services due',state:'active'},{id:'first',label:'First service due',state:'active'},{id:'repeat',label:'Repeat service due',state:'active'},{id:'unit-waiting',label:'Unit waiting',state:'active'},{id:'waiting',label:'Next service',state:'waiting'},{id:'candidates',label:'Waiting for heat',state:'waiting'},commonScenarios[2]],
    piglet:[{id:'due',label:'Care due now',state:'active'},{id:'waiting',label:'Next scheduled care',state:'waiting'},{id:'unit-waiting',label:'Unit waiting',state:'active'},commonScenarios[2]],
    pregnancy:[{id:'due',label:'Checks due',state:'active'},{id:'recheck',label:'Rechecks due',state:'active'},{id:'unit-waiting',label:'Unit waiting',state:'active'},...commonScenarios.slice(1)],
    heat:[...commonScenarios.slice(0,2),{id:'round-complete',label:'Round complete',state:'round-complete'},commonScenarios[2]],
    'return-heat':[{id:'due',label:'Round due',state:'active'},{id:'one-day',label:'One-day check',state:'active'},commonScenarios[1],{id:'round-complete',label:'Round complete',state:'round-complete'},commonScenarios[2]]
  };
  const scenarioOptions=t=>{const options=[...(scenarios[t.id]||commonScenarios)];const lifecycle=['breeding','piglet','pregnancy','farrowing','weaning','postpartum','vaccine','transfer'].includes(t.id);if(lifecycle)options.splice(options.length-1,0,{id:'unit-finished',label:'Unit work finished',state:'waiting',note:'Unit 7 is finished, but other units still have work. Its full bar does not complete the whole task.'},{id:'ready',label:'Ready to complete',state:'ready',note:'All required work across all units is recorded and closure dependencies are satisfied. Open the card to review and explicitly complete the task.'});if(!['heat','return-heat','farrowing'].includes(t.id))options.splice(1,0,{id:'overdue-due',label:'Due + overdue',state:'active',note:'The main count includes all work due now. An explicitly overdue subset replaces the usual supporting line.'});if(window.SentriHomeTaskCard.displayRules[t.id].dependency)options.splice(options.length-1,0,{id:'dependency',label:'Full bar · dependency open',state:'ready',note:'Work currently recorded is complete, but the upstream task can still add candidates. Completion and early ending stay unavailable until it closes.'});options.push({id:'terminated',label:'Ended early',state:'terminated'});return options;};
  const sourceHref=t=>t.source==='../system/screens.html'?'screens.html':t.source.startsWith('../ops/')?`../research/ops/${t.source.split('/').pop()}`:`../research/tasks/${t.source}.html`;
  const sourceLink=t=>`<a href="${sourceHref(t)}">${t.sourceLabel|| (t.draft?'Read the action specification':'Read Claude’s task document')} ↗</a>`;
  function baseModel(t,scope,status){
    const idx=scope==='unit'?1:0,[done,total]=t.counts[idx],upcoming=status==='upcoming',overdue=status==='overdue',undated=status==='undated';
    const day=overdue?t.days+2:t.day;
    const p={kind:t.kind,label:t.progress,value:upcoming?0:done,total,unit:t.unit};
    let a={value:t.action[idx],label:t.verb};
    if(t.kind==='days'){p.value=upcoming?0:Math.min(day,t.days);p.ended=overdue;p.total=t.days;p.note='Elapsed time · not check completion';a.secondary=upcoming?'Scheduled monitoring cohort':`${done} ${done===1?'return':'returns'} recorded`;if(undated){p.kind='unknown';p.note='Window duration not configured';}}
    if(t.kind==='outcome')p.note='Outcome progress · not observation coverage';
    if(t.kind==='distribution'){const active=upcoming?0:Number(t.action[idx]),finished=upcoming?0:done;p.segments=[{value:finished,tone:'done'},{value:active,tone:'active'},{value:total-finished-active,tone:'waiting'}];p.legend=[{text:`${finished} farrowed`,tone:'done'},{text:`${active} active`,tone:'active'},{text:`${total-finished-active} awaiting`,tone:'waiting'}];}
    if(upcoming){a={value:String(total),label:t.kind==='days'?'sows enrolled':'planned '+(t.unit==='pens'?'pens':'sows')};if(t.draft)a.label='planned pigs';if(t.kind==='distribution')a.label='sows expected';}
    if(a.value==='1')a.label=a.label.replace('sows','sow').replace('pens','pen').replace('pigs','pig').replace('litters','litter');
    const remaining=t.days-day;
    return {id:t.id,state:status,identity:{title:t.title,context:upcoming?t.context.replace('today’s session','next session'):t.context,icon:t.id==='transfer'?'transfer':t.draft?'care':'production'},action:a,progress:p,status:{label:upcoming?'Upcoming':overdue?'Overdue':'In progress',tone:upcoming?'':overdue?'red':'blue'},timing:{elapsed:upcoming?'Starts tomorrow':undated?`Day ${day} · ongoing`:overdue?`Day ${day} · ${t.days}-day window`:`Day ${day} of ${t.days}`,remaining:upcoming?`${t.days}-day window`:undated?'No end date':overdue?'2 days overdue':remaining===0?'Ends today':`${remaining} ${remaining===1?'day':'days'} left`,next:upcoming?'Scheduled work has not started':overdue?'Scheduled window has ended':undated&&t.id==='pregnancy'?'Checks can still be recorded':t.id==='farrowing'&&idx===1?'2 due today in this unit':t.next,tone:overdue?'red':''},scope:{kind:scope,label:idx?'Unit 7':t.id==='transfer'?'2 source units':'Across 3 units',action:idx?'Open unit task':'View task'},route:t.id==='transfer'?{from:idx?'Unit 7':'Units 7 & 8',to:'Farrowing · Unit 6'}:null};
  }
  function model(t,scope='overview',scenario=null){
    const requested=scenario?.state||state.status,idx=scope==='unit'?1:0;
    const mixed={heat:'waiting',breeding:'waiting',piglet:'waiting',weaning:'complete',postpartum:'upcoming'};
    const current=requested==='mixed'?(mixed[t.id]||'active'):requested;
    const m=baseModel(t,scope,current);
    const next=t.id==='breeding'?'14:00':['heat','return-heat'].includes(t.id)?'14:30':t.id==='treatment'?'16:00':'Tomorrow';
    const f={due:Number(t.action[idx]),label:t.verb,nextLabel:next,nextAt:next==='Tomorrow'?1440:Number(next.slice(0,2))*60+Number(next.slice(3))};
    if(t.id==='pregnancy')f.later=t.counts[idx][1]-t.counts[idx][0]-f.due;
    if(t.id==='breeding'){f.first=idx?1:3;f.repeat=idx?2:4;}
    if(t.id==='return-heat')m.progress=null;
    if(t.id==='heat')delete m.progress.note;
    if(t.id==='farrowing'){
      m.progress={kind:'completion',label:'Farrowings recorded',value:current==='upcoming'?0:t.counts[idx][0],total:t.counts[idx][1],unit:'sows'};
      f.due=idx?2:4;f.live=idx?1:2;f.late=0;
      if(['due','final-only','late'].includes(scenario?.id))f.live=0;
      if(['live','late'].includes(scenario?.id))f.late=idx?1:3;
    }
    if(scenario?.id==='first'){f.repeat=0;f.due=f.first;}
    if(scenario?.id==='repeat'){f.first=0;f.due=f.repeat;}
    if(scenario?.id==='recheck'){
      m.identity.context='Batch 31 · follow-up';f.due=idx?1:3;f.rechecks=f.due;f.later=0;
      m.progress={kind:'completion',label:'Rechecks recorded',value:idx?1:2,total:idx?2:5,unit:'sows'};
    }
    if((['waiting','round-complete','upcoming'].includes(current)&&scenario?.id!=='unit-finished')||(scenario?.id==='unit-waiting'&&idx)){
      f.due=0;f.live=0;f.late=0;f.roundComplete=current==='round-complete';
    }
    if(current==='upcoming'){f.nextLabel='Tomorrow';f.nextAt=1440;m.timing.elapsed='';}
    if(scenario?.id==='candidates'){f.nextLabel=null;f.nextAt=null;}
    if(current==='ready'||current==='complete'||(scenario?.id==='unit-finished'&&idx)){
      f.due=0;f.live=0;f.late=0;
      if(m.progress)m.progress.value=m.progress.total;
      f.readyToComplete=current==='ready';f.unitComplete=scenario?.id==='unit-finished'&&!!idx;
    }
    if(scenario?.id==='overdue-due')f.overdue=idx?1:2;
    if(scenario?.id==='dependency')f.closureBlockedBy=window.SentriHomeTaskCard.displayRules[t.id].dependency;
    if(current==='complete')f.closedAt='Today, 09:10';
    if(current==='terminated')f.terminatedAt='Today, 09:10';
    if(closures.has(t.id))Object.assign(f,closures.get(t.id));
    if(scenario?.id==='one-day')m.timing.elapsed='Today';
    const attention=window.SentriHomeTaskCard.attention(t.id,f);
    Object.assign(m,attention);
    m.status={label:m.state==='active'?'Due now':m.state==='complete'?'Task ended':'Waiting',tone:m.state==='active'?'blue':''};
    if(current==='overdue'){m.status={label:'Window overdue',tone:'red'};if(m.state==='active')m.state='overdue';}
    return m;
  }
  const displayRule=t=>window.SentriHomeTaskCard.displayRules[t.id];
  const hierarchy=t=>displayRule(t).priority.join(' → ');
  function priorityRule(t){const r=displayRule(t);return '<div class="display-rule"><h3>Display priority'+(r.draft?' · proposed':'')+'</h3><ol>'+r.priority.map(p=>'<li>'+e(p)+'</li>').join('')+'</ol><p><strong>Supporting line</strong> · '+e(r.support)+'</p><p><strong>Ready to complete</strong> · '+e(r.completion)+'</p></div>';}
  function rule(t){return `<div><h3>${t.draft?'Proposed task rule':'From the task specification'}</h3><p>${e(t.rule)}</p>${sourceLink(t)}</div><div><h3>Time & detail boundary</h3><p>${e(t.timing)}</p><p>Inside: ${e(t.inside)}</p></div>${priorityRule(t)}`;}
  function render(){
    const task=tasks.find(t=>t.id===state.task);
    const options=scenarioOptions(task);
    if(!options.some(o=>o.id===state.scenario))state.scenario=options[0].id;
    const selected=options.find(o=>o.id===state.scenario);
    document.querySelector('#scenario-chips').innerHTML=options.map(o=>`<button data-scenario="${o.id}" aria-pressed="${o.id===state.scenario}">${e(o.label)}</button>`).join('');
    document.querySelector('#attention-hierarchy').textContent=hierarchy(task);
    document.querySelector('#scenario-note').textContent=selected.note||'Illustrative schedule and records. Clearing the current workload keeps the task open; completion is confirmed inside the task. Ending early has a separate status.';
    document.querySelector('#component-card').innerHTML=card(model(task,'overview',selected),{annotated:state.annotated});
    document.querySelector('#unit-component-card').innerHTML=card(model(task,'unit',selected));
    document.querySelector('#selected-rule').innerHTML=rule(task);
    let previousGroup='';
    document.querySelector('#card-library').innerHTML=window.SentriHomeTaskCard.order(tasks.map(t=>model(t))).map(m=>{
      const t=tasks.find(t=>t.id===m.id),group=m.state==='terminated'?'Ended early':m.state==='complete'?'Completed':m.state==='ready'?'Ready to complete':['waiting','round-complete','upcoming'].includes(m.state)?'Next':'Due now';
      const heading=group!==previousGroup?'<h3 class="library-state-heading">'+group+'</h3>':'';previousGroup=group;
      return heading+`<article><p class="library-label"><span>${e(t.title)}</span><span>${t.draft?'PROPOSED RULE':''}</span></p>${card(m)}</article>`;
    }).join('');
    document.querySelector('#rules-list').innerHTML=tasks.map(t=>`<article class="rule-card"><h3>${e(t.title)}${t.draft?' · proposed':''}</h3><p><strong>Progress</strong> · ${e(t.rule)}</p><p><strong>Time</strong> · ${e(t.timing)}</p>${priorityRule(t)}${sourceLink(t)}</article>`).join('');
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
    ['component','library','rules'].forEach(v=>document.querySelector(`#${v}-view`).hidden=v!==state.view);
    document.querySelector('#task-select').value=state.task;document.querySelector('#state-select').value=state.status;
    document.querySelector('#state-select').closest('label').hidden=state.view==='component';
    document.querySelector('#task-select').disabled=state.view!=='component';
    document.querySelector('.anatomy-toggle').hidden=state.view!=='component';
    const url=new URL(location.href);url.search='';['task','scenario','state','view'].forEach(k=>url.searchParams.set(k,k==='state'?state.status:state[k]));history.replaceState(null,'',url);
  }
  document.querySelector('#task-select').innerHTML=tasks.map(t=>`<option value="${t.id}">${e(t.title)}</option>`).join('');
  [['task-select','task'],['state-select','status']].forEach(([id,key])=>document.querySelector('#'+id).addEventListener('change',ev=>{state[key]=ev.target.value;if(key==='task')state.scenario='';render();}));
  document.querySelector('#anatomy').addEventListener('change',ev=>{state.annotated=ev.target.checked;render();});
  const dialog=document.querySelector('#detail');let opener;
  document.addEventListener('click',ev=>{const button=ev.target.closest('button');if(!button)return;if(button.hasAttribute('data-finish-task')){closures.set(opener.dataset.card,{closedAt:'Today · just now'});state.scenario='complete';render();dialog.close();return;}if(button.hasAttribute('data-end-early')){document.querySelector('#detail-content').innerHTML='<div class="detail-heading"><h2 id="detail-title">End task early?</h2><button data-close aria-label="Close">×</button></div><p>Unfinished work will remain recorded as incomplete. Existing records are kept.</p><div class="lifecycle-actions"><button data-close>Keep task open</button><button data-confirm-end>End task early</button></div>';return;}if(button.hasAttribute('data-confirm-end')){closures.set(opener.dataset.card,{terminatedAt:'Today · just now'});state.scenario='terminated';render();dialog.close();return;}if(button.dataset.scenario){closures.delete(state.task);state.scenario=button.dataset.scenario;render();}else if(button.dataset.view){state.view=button.dataset.view;render();}else if(button.dataset.card){opener=button;const t=tasks.find(t=>t.id===button.dataset.card),unit=button.dataset.scope==='unit';document.querySelector('#detail-content').innerHTML=`<div class="detail-heading"><h2 id="detail-title">${e(t.title)}</h2><button data-close aria-label="Close task preview">×</button></div><p>${unit?'Opens the selected unit’s working page.':'Opens the whole-task overview, with navigation into each unit.'}</p><p>${e(t.inside)}</p>${t.id==='farrowing'?`<a class="detail-link" href="farrowing-astra-concept.html?layout=focus&from=home&section=farrowing&entry=${unit?'unit':'overview'}&unit=7&returnUnit=${unit?'7':''}">Open existing Farrowing page ↗</a>`:'<div class="placeholder">Task overview not designed yet<small>This study defines the card component and its fields.</small></div>'}`;const selected=scenarioOptions(t).find(o=>o.id===state.scenario);const preview=model(t,unit?'unit':'overview',state.view==='component'?selected:null);if(preview.state==='ready')document.querySelector('#detail-content p').textContent='Review the whole task across all units before completing.';if(!['complete','terminated'].includes(preview.state))document.querySelector('#detail-content').insertAdjacentHTML('beforeend',preview.closureBlockedBy?'<div class="lifecycle-review"><p>Close '+e(preview.closureBlockedBy)+' before ending this task.</p><button class="lifecycle-primary" disabled>Complete task</button></div>':preview.state==='ready'?'<div class="lifecycle-review"><p>All required work across all units is recorded. Ready to close this task.</p><button class="lifecycle-primary" data-finish-task>✓ Complete task</button></div>':'<div class="lifecycle-review"><p>The task remains open between scheduled work.</p><button class="lifecycle-early" data-end-early>End task early</button></div>');dialog.showModal();}else if(button.hasAttribute('data-close'))dialog.close();});
  dialog.addEventListener('close',()=>opener?.focus());render();
})();
