// Shared pen records for Inspection and Farrowing. Each task owns its pen data and Back destination.
(function(root){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=k=>root.SentriIcons.icon(k);
 const DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONTH=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const noteEnd=(day,n)=>{const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return d;};
 const dateText=(day,n)=>{const d=noteEnd(day,n);return DAY[d.getDay()]+' '+d.getDate()+' '+MONTH[d.getMonth()];};
 const noteMeta=(day,pe)=>pe.noteBy+' · until '+DAY[noteEnd(day,pe.noteDays||7).getDay()];
 function noteDaysField(day,draft,action){
  const n=draft.days||7;
  return root.SentriUI.panel(root.SentriUI.stepper({label:'Show for',description:n+(n===1?' day':' days')+' · Until '+dateText(day,n),value:n,min:1,max:60,action,key:'days',variant:'row'}),{className:'st-note-days'});
 }
 function noteCard(text,by,foot,footIcon,editAction,value=''){
  const [name,...when]=String(by||'').split(' · ');
  return root.SentriUI.panel('<div class="st-note-head"><p class="st-note-by"><b>'+esc(name)+'</b>'+(when.length?' · '+esc(when.join(' · ')):'')+'</p>'+
   (editAction?root.SentriUI.iconButton({variant:'plain',icon:icon('edit'),label:'Edit note',action:editAction,value}):'')+
   '</div><p class="st-note-text">'+esc(text)+'</p><p class="st-note-foot">'+icon(footIcon)+esc(foot)+'</p>',{className:'st-note'});
 }
 function noteField(draft,attr,className=''){
  return root.SentriUI.field({label:'Note',control:`<textarea class="st-note-input" ${attr}="note">${esc(draft.note||'')}</textarea>`,className});
 }
 const devices=Object.freeze(['Feeding station','Drinking station','Other']);
 const openFaultForDevice=(pen,device)=>device==='Other'?undefined:pen?.faults.find(x=>x.open&&(x.deviceId||x.device)===device);
 const faultReady=d=>!!d.device&&!!d.description?.trim()&&(d.device!=='Other'||!!d.name?.trim());
 function faultFields(draft,picker,attr,className=''){
  return picker+(draft.device==='Other'?root.SentriUI.field({label:'Device name',control:`<input ${attr}="name" value="${esc(draft.name||'')}" placeholder="e.g. gate beside the aisle">`,className}):'')+
   root.SentriUI.field({label:'Description',control:`<textarea ${attr}="description" placeholder="What is broken or not working?">${esc(draft.description||'')}</textarea>`,className});
 }
 function faultReportCard(fault){
  return root.SentriUI.facts([{label:'Description',value:fault.description,meta:`Reported ${fault.time} · ${fault.who}`}],{columns:1});
 }
 root.SentriPenTools=Object.freeze({dateText,noteMeta,noteDaysField,noteCard,noteField,devices,openFaultForDevice,faultReady,faultFields,faultReportCard});
})(globalThis);
