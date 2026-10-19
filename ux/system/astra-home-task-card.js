/* Shared, presentational Home task-card component. Prototype only; no task mutations.
 * Fields: identity, action, progress, timing, scope, status, exception, destination.
 * Progress must supply its meaning and unit; elapsed time never implies work completion.
 */
(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Home card glyphs come from the same registry as the rest of the design system.
  const iconNames=Object.freeze({stop:'minus',location:'place',arrow:'chevron'});
  const icon=name=>window.SentriIcons.icon(iconNames[name]||name);
  function render(model,{annotated=false}={}){
    const m=model,unit=m.scope.kind==='unit',p=m.progress||{},t=m.timing||{},pct=p.total>0?Math.max(0,Math.min(100,p.value/p.total*100)):0;
    const marker=n=>annotated?`<i class="slot-marker" aria-hidden="true">${n}</i>`:'';
    if(['complete','terminated'].includes(m.state))return `<button class="home-task-card hc-complete ${m.state==='terminated'?'hc-terminated':''}" data-card="${escape(m.id)}" data-scope="${unit?'unit':'overview'}" aria-label="Review ${escape(m.identity.title)}, ${escape(m.identity.context)}, ${escape(m.scope.label)}"><span class="hc-complete-icon">${icon(m.state==='terminated'?'stop':'check')}</span><span class="hc-complete-copy"><strong>${escape(m.identity.title)}</strong><small>${escape(m.identity.context)}${unit?'':' · '+escape(m.scope.label)}</small><small>${m.state==='terminated'?'Ended early':'Completed'} · ${escape(m.completedAt||'Today, 09:10')}</small></span>${icon('arrow')}</button>`;
    const quiet=['waiting','upcoming'].includes(m.state);
    let bar='';
    if(p.kind==='unknown')bar='';
    else if(p.kind==='days')bar=`<div class="hc-days" aria-hidden="true">${Array.from({length:p.total},(_,i)=>`<span class="${p.ended||i+1<p.value?'past':i+1===p.value?'current':''}"></span>`).join('')}</div>`;
    else if(p.kind==='distribution')bar=`<div class="hc-track" aria-hidden="true">${p.segments.map(s=>`<span class="${escape(s.tone)}" style="width:${s.value/p.total*100}%"></span>`).join('')}</div>`;
    else bar=`<div class="hc-track" aria-hidden="true"><span style="width:${pct}%"></span></div>`;
    const progressName=`${p.label}: ${p.value} of ${p.total} ${p.unit}`;
    const progressAttrs=p.kind==='unknown'?'':p.kind==='days'?`role="img" aria-label="Monitoring window, ${p.value?`day ${p.value} of ${p.total}`:'not started'}; elapsed time, not checks completed"`:`role="progressbar" aria-label="${escape(p.label)}" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.value}" aria-valuetext="${escape(progressName)}"`;
    const progressCount=p.kind==='unknown'?'No fixed duration':p.kind==='days'?(p.ended?'Window elapsed':p.value?`Day ${p.value} of ${p.total}`:`${p.total}-day window`):`<b>${p.value}</b> / ${p.total}`;
    const timingLabel=m.state==='overdue'?t.remaining:m.state==='undated'?t.elapsed.split(' · ')[0]:t.elapsed;
    return `<button class="home-task-card ${escape(m.state)} ${quiet?'hc-quiet':''} ${unit?'hc-unit':''}" ${m.entry?`data-entry="${escape(m.entry)}" `:''}data-card="${escape(m.id)}" data-scope="${unit?'unit':'overview'}" aria-label="Open ${escape(m.identity.title)}, ${escape(m.scope.label)}">
      <div class="hc-identity">${marker(1)}<span class="hc-symbol">${icon(m.identity.icon)}</span><span class="hc-heading"><strong>${escape(m.identity.title)}</strong><small>${escape(m.identity.context)}${timingLabel?' · '+escape(timingLabel):''}</small></span><span class="hc-header-meta">${m.state==='overdue'?SentriUI.status({variant:'chip',kind:'overdue',text:'Overdue'}):''}${unit?`<span class="hc-unit-arrow">${icon('arrow')}</span>`:''}</span></div>
      ${quiet?`<div class="hc-quiet-line">${icon('clock')}<span>${escape(m.action.message)}</span></div>`:`<div class="hc-action">${marker(2)}<span class="hc-action-value">${escape(m.action.value)}</span><span class="hc-action-copy"><span class="hc-action-label">${escape(m.action.label)}</span>${m.action.secondary?`<small>${escape(m.action.secondary)}</small>`:''}</span></div>`}
      ${!quiet&&m.route?`<div class="hc-route"><span>${escape(m.route.from)}</span>${icon('arrow')}<span>${escape(m.route.to)}</span></div>`:''}
      ${m.progress&&m.state!=='upcoming'?`<div class="hc-progress">${marker(3)}<div class="hc-progress-caption"><span>${escape(p.label)}</span><span>${progressCount}</span></div><div ${progressAttrs}>${bar}</div>${p.legend?`<div class="hc-legend">${p.legend.map(l=>`<span><i class="${escape(l.tone)}"></i>${escape(l.text)}</span>`).join('')}</div>`:''}${p.note?`<p class="hc-progress-note">${escape(p.note)}</p>`:''}</div>`:''}
      ${m.exception?`<div class="hc-exception">${escape(m.exception)}</div>`:''}
      ${!unit?`<div class="hc-footer">${marker(4)}${icon('location')}<span>${escape(m.scope.label)}</span><span>${escape(m.scope.action)}</span>${icon('arrow')}</div>`:''}
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
      "Overview: recorded in heat / configured target (outcome, not task progress)",
      "Unit: sows with signs awaiting confirmation",
      "Next reliable observation time"
    ],
    "support": "No legacy round label, no unit no-signs branch and no Home quick close. Reaching the target does not change task status.",
    "completion": "Task detail owns closure. The Home outcome bar is not an observation completion measure.",
    "source": "../research/tasks/heat-check.html"
  },
  "breeding": {
    "title": "Breeding",
    "label": "sows ready for service",
    "next": "Next service",
    "dependency": "heat check",
    "priority": [
      "Overview: mated at least once / heat-marked task sows",
      "Unit: sows eligible for a first or repeat service now",
      "Next service time",
      "Waiting for heat confirmations"
    ],
    "support": "Overview coverage is not service-sequence completion. Unit eligibility counts each sow once, with first/repeat detail where useful.",
    "completion": "Task detail owns closure. The legacy first-service timing and list eligibility need one authoritative rule before connected use.",
    "source": "../research/tasks/breeding.html"
  },
  "return-heat": {
    "title": "Return-heat check",
    "label": "sows to check",
    "next": "Next check",
    "priority": [
      "Temporary Overview: recorded returns and sows without a return record in the same historical scope",
      "Unit: estimated return-date count and submitted signs, which may overlap",
      "Next reliable estimated date"
    ],
    "support": "No Home pie, return-rate bar, round wording or quick close. Current backend daily statistics are unreliable for this card.",
    "completion": "Task detail owns closure. This temporary Home bridge will be reviewed when the Return-heat feature is settled.",
    "source": "../research/tasks/return-heat.html"
  },
  "farrowing": {
    "title": "Farrowing",
    "label": "sows due today",
    "next": "Next expected",
    "priority": [
      "Recorded farrowing underway",
      "Past expected date without a farrowing record",
      "Due today without a farrowing record",
      "Next expected date"
    ],
    "support": "Use one secondary expected-date fact. Missing start records never imply that a sow is not farrowing; unknown dates say Expected date to confirm.",
    "completion": "Home shows Farrowed X / Y current task sows. Death and abortion leave the task, so neither stays in the denominator. The Farrowing task feature is being revised separately.",
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
  "end-nursery": {
    "title": "End-nursery check",
    "label": "pens to check",
    "next": "Next pen check",
    "priority": [
      "Pens in the verified task set with no end-nursery check record",
      "Next configured check time",
      "Task entrance only when the pen set is unknown"
    ],
    "support": "The pending count and Checked X / Y use the same stable task pen set, filtered to the selected unit.",
    "completion": "A full bar never closes the task. Confirm the stable pen set and check_at before connected use.",
    "source": "../system/screens.html"
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
      if(f.late>0)return active(f.late,'sows past expected date',undefined,1);
      if(f.due>0)return active(f.due,'sows due today');
    }else if(f.due>0){
      const rule=displayRules[kind]||{};
      let secondary=f.secondary;
      if(['pregnancy','postpartum'].includes(kind))secondary=f.rechecks>0?f.rechecks+' rechecks due':f.later>0?f.later+' scheduled later':undefined;
      if(kind==='breeding'&&f.first!=null&&f.repeat!=null)secondary=f.first&&f.repeat?f.first+' first · '+f.repeat+' repeat':f.first?'First service':'Repeat service';
      if(f.overdue>0)secondary=f.overdue+' past due';
      return active(f.due,f.label||rule.label,secondary,f.overdue>0?1:2);
    }
    if(f.closureBlockedBy)return {state:'waiting',action:{message:'Waiting for '+f.closureBlockedBy+' to close'},attentionRank:3};
    if(f.unitComplete)return {state:'waiting',action:{message:'Unit work complete · task still open'},attentionRank:3};
    const names={breeding:'Next service',piglet:'Next care',pregnancy:'Next checks',farrowing:'Next expected',heat:'Next check','return-heat':'Next check'};
    const next=f.nextLabel;
    const message=next?(displayRules[kind]?.next||names[kind]||'Next')+' · '+next:kind==='breeding'?'Waiting for heat confirmations':kind==='piglet'?'Waiting for next scheduled care':kind==='postpartum'?'Waiting for farrowing records':'No work due now';
    return {state:'waiting',action:{message},nextAt:next?f.nextAt:undefined,attentionRank:3};
  }
  function attention(kind,f={}){return {...resolveAttention(kind,f),closureBlockedBy:f.closureBlockedBy};}
  const order=cards=>[...cards].sort((a,b)=>{
    const rank=m=>['complete','terminated'].includes(m.state)?4:m.attentionRank??(['waiting','upcoming'].includes(m.state)?3:2);
    const time=m=>m.actionAt??m.startAt??m.nextAt??Infinity;
    return rank(a)-rank(b)||time(a)-time(b)||String(a.id).localeCompare(String(b.id));
  });
  window.SentriHomeTaskCard={render,escape,icon,order,attention,displayRules};
})();
