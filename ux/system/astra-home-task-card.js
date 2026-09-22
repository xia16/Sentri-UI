/* Shared, presentational Home task-card component. Prototype only; no task mutations.
 * Fields: identity, action, progress, timing, scope, status, exception, destination.
 * Progress must supply its meaning and unit; elapsed time never implies work completion.
 */
(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons={stop:'M5 12h14',check:'m5 12 4 4L19 6',care:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',transfer:'M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5',production:'M6 19V9m6 10V4m6 15v-6',location:'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2',arrow:'m9 5 7 7-7 7'};
  const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]||icons.production}"/></svg>`;
  function render(model,{annotated=false}={}){
    const m=model,unit=m.scope.kind==='unit',p=m.progress||{},t=m.timing||{},pct=p.total>0?Math.max(0,Math.min(100,p.value/p.total*100)):0;
    const marker=n=>annotated?`<i class="slot-marker" aria-hidden="true">${n}</i>`:'';
    if(['complete','terminated'].includes(m.state))return `<button class="home-task-card hc-complete ${m.state==='terminated'?'hc-terminated':''}" data-card="${escape(m.id)}" data-scope="${unit?'unit':'overview'}" aria-label="Review ${escape(m.identity.title)}, ${escape(m.identity.context)}, ${escape(m.scope.label)}"><span class="hc-complete-icon">${icon(m.state==='terminated'?'stop':'check')}</span><span class="hc-complete-copy"><strong>${escape(m.identity.title)}</strong><small>${escape(m.identity.context)}${unit?'':' · '+escape(m.scope.label)}</small><small>${m.state==='terminated'?'Ended early':'Completed'} · ${escape(m.completedAt||'Today, 09:10')}</small></span>${icon('arrow')}</button>`;
    const ready=m.state==='ready',quiet=['waiting','round-complete','upcoming','ready'].includes(m.state);
    let bar='';
    if(p.kind==='unknown')bar='';
    else if(p.kind==='days')bar=`<div class="hc-days" aria-hidden="true">${Array.from({length:p.total},(_,i)=>`<span class="${p.ended||i+1<p.value?'past':i+1===p.value?'current':''}"></span>`).join('')}</div>`;
    else if(p.kind==='distribution')bar=`<div class="hc-track" aria-hidden="true">${p.segments.map(s=>`<span class="${escape(s.tone)}" style="width:${s.value/p.total*100}%"></span>`).join('')}</div>`;
    else bar=`<div class="hc-track" aria-hidden="true"><span style="width:${pct}%"></span></div>`;
    const progressName=`${p.label}: ${p.value} of ${p.total} ${p.unit}`;
    const progressAttrs=p.kind==='unknown'?'':p.kind==='days'?`role="img" aria-label="Monitoring window, ${p.value?`day ${p.value} of ${p.total}`:'not started'}; elapsed time, not checks completed"`:`role="progressbar" aria-label="${escape(p.label)}" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.value}" aria-valuetext="${escape(progressName)}"`;
    const progressCount=p.kind==='unknown'?'No fixed duration':p.kind==='days'?(p.ended?'Window elapsed':p.value?`Day ${p.value} of ${p.total}`:`${p.total}-day window`):`<b>${p.value}</b> / ${p.total} ${escape(p.unit)}`;
    const timingLabel=ready?'':m.state==='overdue'?t.remaining:m.state==='undated'?t.elapsed.split(' · ')[0]:t.elapsed;
    return `<button class="home-task-card ${escape(m.state)} ${quiet?'hc-quiet':''} ${unit?'hc-unit':''}" data-card="${escape(m.id)}" data-scope="${unit?'unit':'overview'}" aria-label="Open ${escape(m.identity.title)}, ${escape(m.scope.label)}">
      <div class="hc-identity">${marker(1)}<span class="hc-symbol">${icon(m.identity.icon)}</span><span class="hc-heading"><strong>${escape(m.identity.title)}</strong><small>${escape(m.identity.context)}</small></span><span class="hc-header-meta">${timingLabel?`<span class="hc-status ${escape(m.status.tone)}" aria-label="${escape(m.status.label)}, ${escape(timingLabel)}">${icon('clock')}${escape(timingLabel)}</span>`:''}${unit?`<span class="hc-unit-arrow">${icon('arrow')}</span>`:''}</span></div>
      ${quiet?`<div class="hc-quiet-line">${icon(ready||m.state==='round-complete'?'check':'clock')}<span>${escape(m.action.message)}</span></div>`:`<div class="hc-action">${marker(2)}<span class="hc-action-value">${escape(m.action.value)}</span><span class="hc-action-copy"><span class="hc-action-label">${escape(m.action.label)}</span>${m.action.secondary?`<small>${escape(m.action.secondary)}</small>`:''}</span></div>`}
      ${!quiet&&m.route?`<div class="hc-route"><span>${escape(m.route.from)}</span>${icon('arrow')}<span>${escape(m.route.to)}</span></div>`:''}
      ${m.progress&&m.state!=='upcoming'?`<div class="hc-progress">${marker(3)}<div class="hc-progress-caption"><span>${escape(p.label)}</span><span>${progressCount}</span></div><div ${progressAttrs}>${bar}</div>${p.legend?`<div class="hc-legend">${p.legend.map(l=>`<span><i class="${escape(l.tone)}"></i>${escape(l.text)}</span>`).join('')}</div>`:''}${p.note?`<p class="hc-progress-note">${escape(p.note)}</p>`:''}</div>`:''}
      ${m.exception?`<div class="hc-exception">${escape(m.exception)}</div>`:''}
      ${ready?`<div class="hc-ready-cta"><span>Review & complete task</span>${icon('arrow')}</div>`:''}
      ${!unit&&!ready?`<div class="hc-footer">${marker(4)}${icon('location')}<span>${escape(m.scope.label)}</span><span>${escape(m.scope.action)}</span>${icon('arrow')}</div>`:''}
    </button>`;
  }
  const displayRules={
  "pregnancy": {
    "title": "Pregnancy check",
    "label": "sows ready to check",
    "next": "Next checks",
    "priority": [
      "Checks whose configured window is open, including due rechecks in this task instance",
      "Next eligible check date",
      "No checks due"
    ],
    "support": "Overdue checks → due rechecks → scheduled later. Show only the first applicable line; rechecks are included in the main count.",
    "completion": "All required checks in this named sweep recorded; unclear results retain their separate follow-up. A full first-check bar does not complete later checks.",
    "source": "../research/tasks/pregnancy-check.html"
  },
  "heat": {
    "title": "Heat check",
    "label": "sows to check",
    "next": "Next check",
    "priority": [
      "Eligible sows still needing the current observation",
      "Next scheduled observation",
      "Waiting for the configured heat window"
    ],
    "support": "Current round. Use an overdue count only with explicit observation records and a configured deadline; no heat mark is not evidence of a missed check.",
    "completion": "Review the configured window and observation activity. Recorded-in-heat is an outcome, not task completion; reaching the heat target does not silently close observation work.",
    "source": "../research/tasks/heat-check.html"
  },
  "breeding": {
    "title": "Breeding",
    "label": "sows ready for service",
    "next": "Next service",
    "dependency": "heat check",
    "priority": [
      "Sows eligible for a first or repeat service now",
      "Next service time",
      "Waiting for heat confirmations"
    ],
    "support": "Past service window → first/repeat breakdown. Main count includes both first and repeat services; one sow is counted once.",
    "completion": "All required service sequences complete AND heat check closed. A full bar while heat check remains open shows Waiting for heat check to close.",
    "source": "../research/tasks/breeding.html"
  },
  "return-heat": {
    "title": "Return-heat check",
    "label": "sows to check",
    "next": "Next check",
    "priority": [
      "Sows within their individual return window needing the current observation",
      "Next observation or next cohort entering its window",
      "No checks due"
    ],
    "support": "Current round. Returning is an outcome; neither returned counts nor blank marks establish observation completion.",
    "completion": "Review all configured monitoring windows and recorded activity before closing. No Home progress bar, return-rate result or elapsed-time bar.",
    "source": "../research/tasks/return-heat.html"
  },
  "farrowing": {
    "title": "Farrowing",
    "label": "sows due today",
    "next": "Next expected",
    "priority": [
      "Recorded farrowing underway",
      "Past expected date without a final record",
      "Due today without a final record",
      "Next expected date"
    ],
    "support": "While farrowing is underway: past expected date → due today. Otherwise, past-date cases show No final record. Missing start records never imply that a sow is not farrowing.",
    "completion": "Final records or resolved outcomes across the cohort, no active farrowing or unsaved drafts. Review before closing; legitimate other outcomes are not fabricated as completed farrowings.",
    "source": "../research/tasks/farrowing.html"
  },
  "postpartum": {
    "title": "Postpartum check",
    "label": "sows ready to assess",
    "next": "Next assessment",
    "dependency": "farrowing",
    "priority": [
      "Assessments due from each sow’s farrowing date, including explicitly scheduled rechecks",
      "Next scheduled assessment",
      "Waiting for more farrowing records"
    ],
    "support": "Overdue assessments → explicitly scheduled rechecks. Do not create a recheck from an abnormal answer without an agreed scheduling rule.",
    "completion": "Required assessments recorded AND farrowing closed. The denominator can grow while farrowing remains open.",
    "source": "../research/tasks/postpartum.html"
  },
  "piglet": {
    "title": "Piglet processing",
    "label": "litters with care due",
    "next": "Next care",
    "dependency": "farrowing",
    "priority": [
      "Litters with at least one scheduled care item due and unfinished",
      "Next scheduled care date",
      "Waiting for new litters or scheduled care"
    ],
    "support": "Litters with overdue required care. Count unique litters, not the number of procedures; optional skipped items need an explicit farm rule.",
    "completion": "All required items across the entire age-day schedule recorded AND farrowing closed. Finishing today’s items is not finishing the schedule.",
    "source": "../research/tasks/piglet-processing.html"
  },
  "weaning": {
    "title": "Weaning check",
    "label": "pens ready to assess",
    "next": "Next assessment",
    "priority": [
      "Eligible pens with a weaning assessment due",
      "Next scheduled assessment",
      "No assessments due"
    ],
    "support": "Overdue assessments, if a deadline is configured. Body weight and readiness results belong inside the assessment.",
    "completion": "Required assessments for the cohort recorded. This completes the check, not the physical transfer. Other closure dependencies are not specified.",
    "source": "screens.html"
  },
  "treatment": {
    "title": "Treatments",
    "label": "pigs due this session",
    "next": "Next treatment",
    "draft": true,
    "priority": [
      "Animals due for the scheduled treatment session",
      "Next scheduled session",
      "No treatment due"
    ],
    "support": "Unrecorded past-due administrations only when the plan defines that status. The UI reports records and schedules; it does not recommend a replacement dose.",
    "completion": "Session completion does not complete a course. Course-level close rules remain a proposal; the existing docs specify administration recording only.",
    "source": "../research/ops/health.md"
  },
  "vaccine": {
    "title": "Vaccinations",
    "label": "pigs due vaccination",
    "next": "Next vaccination",
    "draft": true,
    "priority": [
      "Eligible animals due for this scheduled vaccination",
      "Next scheduled vaccination date",
      "No vaccinations due"
    ],
    "support": "Overdue animals if the campaign defines a deadline. Boosters belong to their own scheduled instance.",
    "completion": "Required records for this vaccination instance complete; future boosters are not implicitly completed. Campaign lifecycle remains a proposal.",
    "source": "../research/ops/health.md"
  },
  "transfer": {
    "title": "Pig transfer",
    "label": "pigs ready to move",
    "next": "Next move",
    "draft": true,
    "priority": [
      "Confirmed issue preventing a scheduled move, when present",
      "Animals eligible to move in the current receiving window",
      "Next receiving window",
      "Waiting for the movement plan"
    ],
    "support": "A confirmed receiving/location issue supersedes the movement count only when the worker has an action to resolve it. Do not infer capacity problems.",
    "completion": "All required movements confirmed; selection or a destination choice is not a movement record. Order scheduling and closure remain a proposal.",
    "source": "../research/ops/place-identity.md"
  }
};
  // Attention is resolved from facts, independently from the progress numerator.
  function resolveAttention(kind,f={}){
    if(f.terminatedAt)return {state:'terminated',completedAt:f.terminatedAt,attentionRank:4};
    if(f.closedAt)return {state:'complete',completedAt:f.closedAt,attentionRank:4};
    const active=(value,label,secondary,rank=2)=>({state:'active',action:{value,label:Number(value)===1?label.replace('sows','sow').replace('litters','litter').replace('pigs','pig').replace('pens','pen'):label,secondary},attentionRank:rank});
    if(f.alert?.count>0)return active(f.alert.count,f.alert.label,f.alert.detail,0);
    if(kind==='farrowing'){
      if(f.live>0)return active(f.live,'sows farrowing',f.late>0?f.late+' past expected date':f.due>0?f.due+' due today':undefined,0);
      if(f.late>0)return active(f.late,'sows past expected date','No final record',1);
      if(f.due>0)return active(f.due,'sows due today');
    }else if(f.due>0){
      const rule=displayRules[kind]||{};
      let secondary=f.secondary;
      if(['pregnancy','postpartum'].includes(kind))secondary=f.rechecks>0?f.rechecks+' rechecks due':f.later>0?f.later+' scheduled later':undefined;
      if(kind==='breeding'&&f.first!=null&&f.repeat!=null)secondary=f.first&&f.repeat?f.first+' first · '+f.repeat+' repeat':f.first?'First service':'Repeat service';
      if(['heat','return-heat'].includes(kind))secondary='Current round';
      if(f.overdue>0)secondary=f.overdue+' past due';
      return active(f.due,rule.label||f.label,secondary,f.overdue>0?1:2);
    }
    if(f.readyToComplete&&f.closureBlockedBy)return {state:'waiting',action:{message:'Waiting for '+f.closureBlockedBy+' to close'},attentionRank:3};
    if(f.readyToComplete)return {state:'ready',action:{message:'All required work recorded'},attentionRank:2.5};
    if(f.unitComplete)return {state:'waiting',action:{message:'Unit work complete · task still open'},attentionRank:3};
    const names={breeding:'Next service',piglet:'Next care',pregnancy:'Next checks',farrowing:'Next expected',heat:'Next check','return-heat':'Next check'};
    const next=f.nextLabel;
    const message=next?(displayRules[kind]?.next||names[kind]||'Next')+' · '+next:kind==='breeding'?'Waiting for heat confirmations':kind==='piglet'?'Waiting for next scheduled care':kind==='postpartum'?'Waiting for farrowing records':'No work due now';
    const roundComplete=f.roundComplete&&['heat','return-heat'].includes(kind);
    return {state:roundComplete?'round-complete':'waiting',action:{message:roundComplete?'Round complete · '+message:message},nextAt:next?f.nextAt:undefined,attentionRank:3};
  }
  function attention(kind,f={}){return {...resolveAttention(kind,f),closureBlockedBy:f.closureBlockedBy};}
  const order=cards=>[...cards].sort((a,b)=>{
    const rank=m=>['complete','terminated'].includes(m.state)?4:m.attentionRank??(['waiting','round-complete','upcoming'].includes(m.state)?3:2);
    return rank(a)-rank(b)||(rank(a)===3?(a.nextAt??Infinity)-(b.nextAt??Infinity):0);
  });
  window.SentriHomeTaskCard={render,escape,icon,order,attention,displayRules};
})();
