/* Shared presentation for the isolated Astra studies; sample data only. */
(()=>{
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
 function statusProgress({farrowed=0,active=0,awaiting=0},compact=false){
  const names=['farrowed','active','awaiting'],counts=[farrowed,active,awaiting].map(n=>Math.max(0,Number(n)||0)),total=counts.reduce((a,b)=>a+b,0);
  return `<span class="task-status-bar${compact?' task-status-bar-compact':''}" role="progressbar" aria-label="Farrowing progress" aria-valuemin="0" aria-valuemax="${total||1}" aria-valuenow="${counts[0]}" aria-valuetext="${counts.map((n,i)=>n+' '+names[i]).join(', ')}; ${total} sows">${counts.map((n,i)=>n?`<i class="task-status-${names[i]}" style="width:${100*n/total}%"></i>`:'').join('')}</span>`;
 }
 function render({unit,task,action='room-overview',href,headingIcons=false}){
  const unitIcon=headingIcons?'<svg class="tc-leading-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>':'';
  const taskIcon=headingIcons?'<svg class="tc-leading-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/></svg>':'';
  const bounded=task.total!=null&&task.total>0;
  const percent=bounded?Math.max(0,Math.min(100,100*Number(task.value)/task.total)):0;
  const tag=href?'a':'button';
  const door=href?`href="${e(href)}"`:`type="button" data-action="${e(action)}"`;
  return `<section class="task-context-card" aria-label="Unit performance and whole-task overview"><div class="tc-unit"><span class="tc-heading">${unitIcon}${e(unit.name)}</span><div class="tc-value"><strong>${e(unit.value)}</strong>${unit.suffix?`<span class="tc-suffix">${e(unit.suffix)}</span>`:''}</div><span class="tc-description">${e(unit.metric)}</span><span class="tc-support${unit.belowTarget?' tc-target-attention':''}">${e(unit.target)}</span></div><${tag} class="tc-task" ${door} aria-label="Task overview, all units, ${e(task.value)}${bounded?' of '+e(task.total):''} ${e(task.label)}"><span class="tc-heading">${taskIcon}Task overview ${arrow}</span><div class="tc-value"><strong>${e(task.value)}</strong>${bounded?`<span class="tc-denominator">/ ${e(task.total)}</span>`:''}</div><span class="tc-description">${e(task.label)} <span class="tc-scope">· all units</span></span>${task.statuses?statusProgress(task.statuses,true):bounded?`<span class="tc-progress${task.kind==='time'?' tc-progress-time':''}" aria-hidden="true"><i style="width:${percent}%"></i></span>`:''}<span class="tc-support">${e(task.support)}</span></${tag}></section>`;
 }
 const examples=[
  {name:'Farrowing',note:'Completed farrowing across the task cohort; other outcomes stay separate.',unit:{name:'Unit 7',value:10,metric:'Live / litter',target:'Target 12',belowTarget:true},task:{value:7,total:18,label:'Farrowed',statuses:{farrowed:7,active:2,awaiting:9},support:'2 active · 9 awaiting'}},
  {name:'Heat check',note:'A rate against a target, alongside a fixed cohort outcome.',unit:{name:'Unit 4',value:70,suffix:'%',metric:'Heat rate',target:'Target ≥ 90%',belowTarget:true},task:{value:62,total:100,label:'In heat',support:'Day 2 of 3'}},
  {name:'Return-heat check',note:'The bar measures days elapsed, not animals checked.',unit:{name:'Unit 4',value:5,suffix:'%',metric:'Return rate',target:'Target ≤ 5%'},task:{value:3,total:7,label:'Days monitored',support:'2 returned',kind:'time'}},
  {name:'Pregnancy check',note:'The unit outcome rate is distinct from task coverage.',unit:{name:'Unit 4',value:95,suffix:'%',metric:'Pregnant',target:'Target ≥ 90%'},task:{value:100,total:200,label:'Checked',support:'Day 1 of 3'}},
  {name:'Breeding',note:'Lower is better for elapsed time. The queue has no completion bar.',unit:{name:'Unit 4',value:1,suffix:'h',metric:'Heat to mating',target:'Target ≤ 12 h'},task:{value:32,label:'Mated',support:'14 to mate'}},
  {name:'Postpartum check',note:'A pass rate with a separate task coverage measure.',unit:{name:'Unit 7',value:90,suffix:'%',metric:'Pass rate',target:'Target ≥ 90%'},task:{value:100,total:200,label:'Checked',support:'Day 1 of 3'}},
  {name:'Weaning check',note:'A measured weight and an age-based target retain their units.',unit:{name:'Unit 7',value:10,suffix:'kg',metric:'Average wean weight',target:'Target by day-age'},task:{value:100,total:200,label:'Pens checked',support:'Day 3 window'}},
  {name:'Piglet processing',note:'On-time performance is separate from the number of pens completed.',unit:{name:'Unit 7',value:90,suffix:'%',metric:'On time',target:'Target ≥ 90%'},task:{value:100,total:200,label:'Pens completed',support:'Day 3 window'}}
 ];
 globalThis.AstraTaskOverview={render,statusProgress,examples};
})();
