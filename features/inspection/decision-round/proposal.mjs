// Prepare canvas-only changes. Neither the production prototype nor Atlas loads these substitutions.
import fs from 'node:fs';
const lookup = fs.readFileSync(new URL('./lookup-study.js', import.meta.url), 'utf8');
function patch(src, before, after) {
  if (!src.includes(before)) throw new Error('Canvas source has moved: '+before.slice(0,120));
  return src.replace(before, after);
}
export function inspection(src) {
 const p=(before,after)=>{src=patch(src,before,after);};
 p("p.initialRecords=(record.events||[]).map", "if(record.studyCondition)p.cases=[record.studyCondition];\n p.initialRecords=(record.events||[]).map");
 p("const scanSequence=['000306','000267','000254','000801','000281','000312','000802'];",
   "const scanSequence=['000306','000267','000430','999999','000306','003012','000254','000801','000281','000312','000802'];"+lookup);
 p("if(!sc.items.includes(tag))sc.items.unshift(tag);\n c.selected.add(tag);",
   "if(!pig(c,tag)){notify(c,'No pig with this tag · '+tag);return true;}\n if(!sc.items.includes(tag))sc.items.unshift(tag);\n if(!studyOutOfScope(c,tag))c.selected.add(tag);");
 p("title:'Scan ear tags',back:{action:'back'},connected:sc.connected","title:sc.pen?'Scan · Pen '+sc.pen:'Scan ear tags',back:{action:'back'},connected:sc.connected");
 p("h=>pigRow(c,h.p,{'data-scan-tag':h.p.id})","h=>studyOutOfScope(c,h.p.id)?studyMoveDoor(c,h):pigRow(c,h.p,{'data-scan-tag':h.p.id})");
 p("h=>SentriUI.findRow({code:h.p.id","h=>h.unit?studyMoveDoor(c,h,true):SentriUI.findRow({code:h.p.id");
 p("function overlay(c){","function overlay(c){if(c.view.startsWith('study-move')){const under=c.studyMove.from==='search'?findPage(c):scanPage(c);return '<div class=\"page-background\" inert aria-hidden=\"true\">'+under+'</div>'+studyLookupLayer(c);}");
 p(" ],{label:str('pen.actions')});"," ],{label:str('pen.actions')})+SentriUI.button({label:'Scan this pen',register:'text',action:'scan-pen',value:pe.id});");
 p("const links=new Set(['production-task'","const links=new Set(['scan-pen','production-task'");
 p("if(c.logDatePicker&&(a==='back'||a==='dismiss'))", "if((c.view.startsWith('study-move')||a==='back'&&c.view==='scan')&&studyMoveAction(c,a,el.dataset.value)){e.stopImmediatePropagation();render(i);return;}\n  if(c.logDatePicker&&(a==='back'||a==='dismiss'))");
 p("if(a==='back')backTo(c);else if(a==='dismiss')", "if(studyMoveAction(c,a,v)){render(i);return;}\n if(a==='scan')delete c.scan.pen;\n if(a==='back')backTo(c);else if(a==='dismiss')");
 p("else location.href='farrowing-astra-concept.html?layout=focus';return;}",
  "else {const id=c.view==='actions'?picked(c)[0]?.id:c.pigId;if(id){sessionStorage.setItem('study-farrowing-return',JSON.stringify({path:location.pathname,url:location.href,tag:id,view:c.view,selected:[...c.selected]}));const unit=pigUnit(c,id).replace(/^Unit /,'');location.href='farrowing-astra-concept.html?layout=focus&studyFarrow='+encodeURIComponent(id)+'&studyUnit='+encodeURIComponent(unit)+'&lang='+new URLSearchParams(location.search).get('lang');}}return;}");
 p("states.forEach((_,i)=>render(i));",`const studyReturn=JSON.parse(sessionStorage.getItem('study-farrowing-return')||'null');
 if(studyReturn?.path===location.pathname&&pig(states[0],studyReturn.tag)){
  sessionStorage.removeItem('study-farrowing-return');const c=states[0]=makeExample('batch-farrowing');
  const origin=detailLocation(c);c.pigId=studyReturn.tag;c.view='pig';c.navTrail=[origin];
  if(studyReturn.view==='actions'){c.navTrail.push({...detailLocation(c),...selectionContext(c)});selectActionPig(c,c.pigId);c.view='actions';}
 }
 addEventListener('pageshow',event=>{if(event.persisted)sessionStorage.removeItem('study-farrowing-return');});
 states.forEach((_,i)=>render(i));`);
 p("const f=c.form,view=c.view,rows=bulkChanges(c).filter(r=>r.change&&r.eligible);",
  "const f=c.form,view=c.view,rows=bulkChanges(c).filter(r=>r.change&&r.eligible);const parents=c.navTrail||[],action=parents.findLast(x=>x.view==='actions'),index=parents.indexOf(action),source=index>0?parents[index-1]:null,keep=source?(source.selected?source:selectionContext(c)):null;");
 p("c.form={};c.view='list';c.reviewOnly=false;c.selected.clear();c.selectedPens.clear();c.selectedNoTags?.clear();return true;",
  "if(keep&&!c.actionEntry){const next=['pig','scan','review','list'].includes(source.view)?source:parents[0];if(next){c.navTrail=parents.slice(0,parents.indexOf(next));Object.assign(c,next,keep,{form:{}});return true;}}\n c.form={};c.view='list';c.reviewOnly=false;c.selected.clear();c.selectedPens.clear();c.selectedNoTags?.clear();return true;");
 return src;
}
export function home(src){
 for(const [before,after] of [
  ["action:'marked-pig',value:String(p.unit)","action:'marked-pig',value:p.tag"],
  ["const p=lookupPigs().find(x=>x.tag===state.pig);if(!p)return;","const p=(navStack.at(-1)?.page==='marked'?markedAll().find(x=>x.tag===state.pig):null)||lookupPigs().find(x=>x.tag===state.pig);if(!p)return;"],
  ["events:[]},tasks:[],destinations:section().units","events:[],studyCondition:p.cond?{name:p.cond,kind:'Symptom',triage:p.care||(p.level==='act'?'Treat in place':'Monitor'),issueStatus:'attention',day:p.wait||1}:null},tasks:[],destinations:section().units"],
  ["if(a==='marked-pig'){openDesigned('inspection-astra-concept.html',+v,'unit','Health','',state.marked.kind);return;}","if(a==='marked-pig'){push('pig',{pig:v});return;}"],
 ])src=patch(src,before,after);
 return src;
}
export function farrowing(src){
 const p=(before,after)=>{src=patch(src,before,after);};
 p("const records=fixtures.map","if(i===0&&new URLSearchParams(location.search).get('studyFarrow')==='000281')fixtures.push(['count','000281','C1',3,11,'Due today · day 114']);\n const records=fixtures.map");
 const start=src.indexOf('return sheet(f.device,');
 const end=src.indexOf('${f.open?SentriUI.optionalRow',start);
 if(start<0||end<0)throw new Error('Fault report card moved');
 src=src.slice(0,start)+"return sheet(f.device,SentriUI.facts([{label:'Description',value:f.description,meta:'Reported '+f.time+' · '+f.who}],{columns:1})+`"+src.slice(end);
 p("if(destinations[a]){const keep=", "if(destinations[a]){if(a==='room-pen-note')c.studyNoteReturn=s.view;const keep=");
 p("delete c.penKeeps?.['roomPenNote|'+c.detailPen];s.view='roomPenDetail';","delete c.penKeeps?.['roomPenNote|'+c.detailPen];s.view=c.studyNoteReturn==='roomPenReadNote'?'roomPenReadNote':'roomPenDetail';");
 p("if(p.key==='pen:device')(c.penDraft=c.penDraft||{}).device=v;", `if(p.key==='pen:device'){
  const existing=penInfo(c).faults.find(f=>f.open&&(f.deviceId||f.device)===v&&v!=='Other');
  if(existing){c.penKeeps||={};c.penKeeps['roomPenFault|'+c.detailPen]=clone(c.penDraft||{});handlePenAction(s,c,'room-pen-fault-record',existing.id);c.picker=null;render(i);return;}
  (c.penDraft=c.penDraft||{}).device=v;
 }`);
 p("id:String(pe.faults.length+1),device:d.device","id:String(pe.faults.length+1),deviceId:d.device,device:d.device");
 p("if(window.SentriHomeLink){", `const handoff=new URLSearchParams(location.search),sowTag=handoff.get('studyFarrow');
 if(sowTag){
  const c=roomContext(states[0]),hit=findSow(c,sowTag);
  if(hit){switchRoomUnit(c,hit.unit.id);states[0]=hit.record;hit.record.view=recordView(hit.record);render(0);}
  document.addEventListener('click',e=>{
   const a=e.target.closest('[data-action]')?.dataset.action;
   if((a==='close'&&['count','locked'].includes(states[0].view))||(a==='room-home'&&states[0].view==='room')){
    e.stopImmediatePropagation();const prior=JSON.parse(sessionStorage.getItem('study-farrowing-return')||'null');if(prior?.url){const to=new URL(prior.url);to.searchParams.delete('screen');location.replace(to);}else history.back();
   }
  },true);
 }
 if(window.SentriHomeLink){`);
 return src;
}
