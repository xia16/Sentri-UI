/* UI study only. No production records, network writes or persistent storage. */
(()=>{
'use strict';
const types=['Stillborn','Mummified','Crushed','Scours','Starve-out','Other'];
const mortalityCauses=['Cause unknown','Crushed','Scours','Starve-out','Other'];
const sum=a=>a.reduce((x,y)=>x+y,0), clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assistanceLabel=value=>value===true?'Yes':value===false?'No':'Not recorded';
const icons={back:'M15 5l-7 7 7 7M8 12h13',chevron:'M9 5l7 7-7 7',minus:'M5 12h14',plus:'M5 12h14M12 5v14',record:'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',camera:'M3 7h4l2-3h6l2 3h4v14H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',signal:'M4 18v-3M9 18v-7M14 18V7M19 18V3',battery:'M3 6h16v12H3zM22 10v4M6 9h10v6H6z',edit:'M4 20l4-1L20 7l-4-4L4 15zM13 6l4 4'};
Object.assign(icons,{more:'M5 12h.01M12 12h.01M19 12h.01',feed:'M4 7h16l-2 12H6zM8 3v4M16 3v4M8 11h8',wrench:'M14 3a6 6 0 0 0-7 8L2 16a3 3 0 0 0 4 4l5-5a6 6 0 0 0 8-7l-4 4-3-3 4-4z',profile:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',chart:'M4 20V10M12 20V4M20 20v-7',clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',check:'M5 12l4 4L19 6',alert:'M12 3L2 21h20zM12 9v5M12 17v1',details:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',calendar:'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',bookmark:'M6 3h12v18l-6-4-6 4z',transfer:'M7 7h11l-3-3M18 7l-3 3M17 17H6l3-3M6 17l3 3',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',scan:'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10'});
const icon=k=>globalThis.SentriIcons?SentriIcons.icon(k):`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[k]||icons.chevron}"/></svg>`;
function seed(preset='count'){
 const s={preset,view:'count',back:'count',finishAlive:9,due:'Due today · day 114',alive:9,dead:[1,1,2,0,0,1],anchor:10,pending:4,weak:1,deformed:1,weight:'',assisted:null,locked:false,ended:false,frozen:14,tag:'000418',pen:'B1',parity:3,deathDraft:[0,0,0,0,0,0],mode:'piglets',sowCause:'',sowNote:'',photos:[],edit:null,expanded:false,popup:null,pointers:false,lens:'All',stamp:'08:41',finished:'Aug 27 · 08:12',markers:[{text:'Red line on left shoulder · monitor overnight',meta:'Today · 06:20 · G. Hansen'}],markerDraft:'',pigletTab:'care',processingDirty:false,processingTasks:[{id:'dry',day:1,title:'Dry and warm',done:true,meta:'Aug 26 · 07:18 · G. Hansen'},{id:'navel',day:1,title:'Disinfect navel',done:true,meta:'Aug 26 · 07:24 · G. Hansen'},{id:'iron',day:3,title:'Iron supplement',done:false,meta:'Due today'},{id:'identity',day:3,title:'Ear tag, notch and weight',done:false,meta:'3 identified · 6 without identity'},{id:'health',day:5,title:'Health check',done:false,meta:'In 2 days'}],piglets:[{tag:'418001',notch:'36-38',sex:'Female',weight:'1.4',state:'Alive'},{tag:'418002',notch:'36-41',sex:'Male',weight:'1.5',state:'Alive'},{tag:'418003',notch:'',sex:'Female',weight:'',state:'Alive'}],unidentified:6,pigletQuery:'',pigletSelected:[],pigletDraft:null,pigletEditIndex:-1,fosterDraft:{direction:'out',target:'000392',count:1},mortalityDraft:{cause:'',unidentified:0,photos:[]},countDraft:9,countReason:'',events:[{text:'Crushed 3 → 2',day:'Aug 26',time:'08:20',who:'G. Hansen',kind:'correction'},{text:'+3 crushed · +1 other',day:'Aug 26',time:'08:12',who:'G. Hansen'},{text:'+5 alive',day:'Aug 26',time:'07:52',who:'G. Hansen'},{text:'+1 stillborn · +1 mummified',day:'Aug 26',time:'07:30',who:'G. Hansen'}]};
 if(preset==='room')s.view='room';
 if(preset.startsWith('task-'))s.view='roomEndTask';
 if(preset==='before'){Object.assign(s,{alive:0,dead:[0,0,0,0,0,0],anchor:0,pending:0,weak:0,deformed:0,tag:'000455',pen:'B4',events:[],stamp:'',parity:2});}
 if(['finish','blocked'].includes(preset))s.view='finish';
 if(preset==='draft'){s.deathDraft[2]=1;s.view='death';}
 if(preset==='blocked'){s.edit=snap(s);s.edit.dead[2]+=1;}
 if(['locked','history','ended','born'].includes(preset)){Object.assign(s,{locked:true,view:'locked',alive:8,dead:[1,1,3,0,0,1],pending:0,weight:'12.6',assisted:true});s.events.unshift({text:'+4 alive',day:'Aug 26',time:'08:41',who:'G. Hansen'},{text:'Farrowing finished · born 14',day:'Aug 27',time:'08:12',who:'G. Hansen',kind:'milestone'});s.events=s.events.slice(0,2).reverse().concat(s.events.slice(2));s.events.unshift({text:'+1 crushed',day:'Aug 28',time:'14:02',who:'L. Madsen'});}
 if(preset==='ended'){s.ended=true;s.deathStage='during';s.frozen=10;s.alive=7;s.dead=[2,0,1,0,0,0];s.sowCause='Prolapse';s.events=[{text:'Sow died · prolapse',day:'Aug 25',time:'06:20',who:'L. Madsen',kind:'danger'},{text:'7 alive · 3 dead',day:'Aug 25',time:'06:18',who:'L. Madsen'}];}
 if(preset==='history'){s.view='history';s.back='locked';}
 if(preset==='edit'||preset==='born'){enterEdit(s);if(preset==='born')s.popup={kind:'born',mode:'more',n:1,split:'alive',cause:5};}
 return s;
}
const born=s=>s.locked?s.frozen:s.alive+sum(s.dead),floor=s=>Math.max(0,s.anchor-sum(s.dead));
const snap=s=>({alive:s.alive,dead:[...s.dead],born:born(s),weak:s.weak,deformed:s.deformed,weight:s.weight,assisted:s.assisted});
function changes(s){if(!s.edit)return[];const a=snap(s),b=s.edit;let out=[];for(const k of s.locked?['born','weak','deformed','weight','assisted']:['alive'])if(String(a[k])!==String(b[k]))out.push(`${k==='born'?'Born':k==='alive'?'Alive':k==='weight'?'Litter weight':k==='assisted'?'Assisted':k[0].toUpperCase()+k.slice(1)} ${k==='assisted'?assistanceLabel(a[k]):(a[k]||0)} → ${k==='assisted'?assistanceLabel(b[k]):(b[k]||0)}`);types.forEach((t,i)=>{if(a.dead[i]!==b.dead[i])out.push(`${t} ${a.dead[i]} → ${b.dead[i]}`)});return out;}
const hasDraft=s=>sum(s.deathDraft)>0||(!s.ended&&s.sowCause)||changes(s).length>0;
function event(s,text,kind='',photos=[]){s.events.unshift({text,kind,day:'Today',time:'09:41',who:'G. Hansen',photos:[...photos]});s.stamp='09:41';}
function fold(s){if(s.pending){event(s,s.pending>0?`+${s.pending} alive`:`${-s.pending} died this visit`);s.pending=0;}s.anchor=born(s);}
function enterEdit(s){s.back=s.view==='finish'?'finish':s.locked?'locked':'count';if(!s.edit)s.edit=snap(s);s.view='edit';}
function act(s,a,v){
 if(a==='alive'){const n=Number(v);if(n<0&&s.alive<=floor(s)){s.pointers=true;return;}s.alive=Math.max(floor(s),s.alive+n);s.pending+=n;s.stamp='09:41';s.pointers=false;}
 if(a==='close'){if(s.view==='count')fold(s);s.view=s.view==='roomEndTask'?'roomOverview':s.view==='roomTaskSows'?'roomEndTask':s.view==='roomTaskReceipt'?'roomHome':penParent(s.view);}
 if(a==='open')s.view=s.locked?'locked':'count';
 if(a==='back'){if(s.view==='death'){act(s,'clearDeath');s.mode='piglets';}s.popup=null;s.view=s.view==='editFinish'?'edit':['history','profile','deathBreakdown'].includes(s.view)?s.pageBack||s.back||'count':s.back||'count';}
 if(a==='finish'){s.pointers=false;s.view='finish';}
 if(a==='death'){s.back=s.view==='finish'?'finish':s.locked?'locked':'count';if(s.ended)s.mode='piglets';s.view='death';}
 if(a==='mode')s.mode=v;
 if(a==='deadStep'){const [i,n]=v.split(',').map(Number);if(s.locked&&n>0&&sum(s.deathDraft)>=s.alive)return;s.deathDraft[i]=Math.max(0,s.deathDraft[i]+n);}
 if(a==='clearDeath'){s.deathDraft.fill(0);if(!s.ended){s.sowCause='';s.sowNote='';}s.photos=[];}
 if(a==='saveDeath'){if(s.mode==='sow'){if(!s.sowCause||s.ended||sum(s.deathDraft)||changes(s).length)return;s.deathStage=s.locked?'after':born(s)>0?'during':'before';fold(s);s.frozen=born(s);s.locked=true;s.ended=true;event(s,`Sow died · ${s.sowCause.toLowerCase()}${s.sowNote?' · '+s.sowNote:''}`,'danger',s.photos);s.deathDraft.fill(0);s.photos=[];s.view='locked';return;}const n=sum(s.deathDraft);if(!n||(s.locked&&n>s.alive))return;const line=s.deathDraft.map((x,i)=>x?`+${x} ${types[i].toLowerCase()}`:'').filter(Boolean).join(' · ');s.dead=s.dead.map((x,i)=>x+s.deathDraft[i]);if(s.locked)s.alive=s.frozen-sum(s.dead);event(s,line,'',s.photos);s.deathDraft.fill(0);s.photos=[];s.view=s.back;}
 if(a==='edit')enterEdit(s);
 if(a==='editStep'){const [k,i,n]=v.split(',');if(k==='dead'){const next=Math.max(0,s.edit.dead[+i]+(+n));if(s.locked&&sum(s.edit.dead)-s.edit.dead[+i]+next>s.edit.born)return;s.edit.dead[+i]=next;}else{let next=Math.max(0,s.edit[k]+(+n));const live=s.locked?Math.max(0,s.finishAlive+s.edit.born-s.frozen):s.edit.alive;if(['weak','deformed'].includes(k)&&next+s.edit[k==='weak'?'deformed':'weak']>live)return;s.edit[k]=next;} }
 if(a==='clearEdit'){s.edit=snap(s);}
 if(a==='saveEdit'){const lines=changes(s);if(!lines.length)return;fold(s);const e=s.edit;s.dead=[...e.dead];if(s.locked){s.frozen=e.born;s.alive=s.frozen-sum(s.dead);s.weak=e.weak;s.deformed=e.deformed;s.weight=e.weight;s.assisted=e.assisted;}else s.alive=e.alive;s.anchor=born(s);event(s,lines.join(' · '),'correction');s.edit=null;s.view=s.back==='finish'?'finish':s.locked?'locked':'count';}
 if(a==='expand')s.view='editFinish';
 if(a==='editCounts')s.view='edit';
 if(a==='finishOptional'){s.finishOptional=s.finishOptional===v?null:v;}
 if(a==='assistance'||a==='editAssistance')(a==='editAssistance'?s.edit:s).assisted=v==='true';
 if(a==='assistance-clear'||a==='editAssistance-clear')(a==='editAssistance-clear'?s.edit:s).assisted=null;
 if(a==='clearAssistance'){const target=v==='true'?s.edit:s;target.assisted=null;}
 if(a==='classify'){const [k,n]=v.split(',');const next=Math.max(0,s[k]+(+n));if(next+s[k==='weak'?'deformed':'weak']<=s.alive)s[k]=next;}
 if(a==='lock'){if(hasDraft(s)||!born(s))return;fold(s);s.frozen=born(s);s.finishAlive=s.alive;s.locked=true;s.finished='Today · 09:41';event(s,`Farrowing finished · born ${s.frozen}`,'milestone');s.view='locked';}
 if(a==='sowActions'){s.pageBack=s.view;s.actionsEntry=true;s.view='profile';}
 if(a==='profile')s.actionsEntry=false;
 if(a==='history'||a==='profile'||a==='deathBreakdown'){s.pageBack=s.view;s.view=a;}
 if(a==='bornPopup')s.popup={kind:'born',mode:'more',n:1,split:'alive',cause:5};
 if(a==='sowCause')s.sowCause=v;
 if(a==='bornMode'){s.popup.mode=v;s.popup.n=v==='more'?1:s.edit.born;}
 if(a==='bornStep')s.popup.n=Math.max(s.popup.mode==='more'?1:sum(s.edit.dead),s.popup.n+Number(v));
 if(a==='bornSplit')s.popup.split=v;
 if(a==='bornCause')s.popup.cause=+v;
 if(a==='applyBorn'){const p=s.popup;s.edit.born=p.mode==='more'?s.edit.born+p.n:p.n;if(p.mode==='more'&&p.split==='died')s.edit.dead[p.cause]+=p.n;s.popup=null;}
 if(a==='cancelPopup')s.popup=null;
 if(a==='photo')s.popup={kind:'photo',src:s.photos[Number(v)],index:Number(v),editable:true};
 if(a==='deletePhoto'){s.photos.splice(s.popup.index,1);s.popup=null;}
 if(a==='lens')s.lens=v;
 if(a==='marker'){s.markerDraft=s.markers[0]?.text||'';s.view='marker';}
 if(a==='saveMarker'){const text=s.markerDraft.trim();if(!text)return;s.markers=[{text,meta:'Today · 09:41 · G. Hansen'}];event(s,'Note updated · '+text,'milestone');s.actionsEntry=true;s.view='profile';}
 if(a==='piglets'){s.pigletSelected=[];s.view='pigletCare';}
 if(a==='pigletTab')s.pigletTab=v;
 if(a==='processingTask'){const task=s.processingTasks.find(x=>x.id===v);if(task){task.done=!task.done;task.meta=task.done?'This visit · G. Hansen':task.id==='health'?'In 2 days':'Due today';s.processingDirty=true;}}
 if(a==='saveProcessing'){if(!s.processingDirty)return;const done=s.processingTasks.filter(x=>x.done).length;event(s,`Piglet processing updated · ${done} of ${s.processingTasks.length} items done`);s.processingDirty=false;s.actionsEntry=true;s.view='profile';}
 if(a==='togglePiglet'){s.pigletSelected=s.pigletSelected.includes(v)?s.pigletSelected.filter(x=>x!==v):[...s.pigletSelected,v];}
 if(a==='editPiglet'){const index=Number(v),p=s.piglets[index];if(!p)return;s.pigletEditIndex=index;s.pigletDraft={...p};s.view='pigletEdit';}
 if(a==='addPiglet'||a==='scanPiglet'||a==='notchPiglet'){s.pigletEditIndex=-1;s.pigletDraft={tag:a==='scanPiglet'?String(418001+s.piglets.length):'',notch:a==='notchPiglet'?'Choose notch':'',sex:'',weight:'',state:'Alive'};s.view='pigletEdit';}
 if(a==='savePiglet'){const p=s.pigletDraft;if(!p||![p.tag,p.notch,p.sex,p.weight].some(x=>String(x||'').trim()))return;const clean={tag:String(p.tag||'').trim(),notch:p.notch==='Choose notch'?'':String(p.notch||'').trim(),sex:p.sex||'',weight:String(p.weight||'').trim(),state:p.state||'Alive'};if(s.pigletEditIndex<0){s.piglets.push(clean);s.unidentified=Math.max(0,s.unidentified-1);}else s.piglets[s.pigletEditIndex]=clean;event(s,`${s.pigletEditIndex<0?'Piglet identity added':'Piglet identity updated'} · ${clean.tag||clean.notch||'identity pending'}`);s.pigletTab='records';s.view='pigletCare';}
 if(a==='foster'){s.featureReturn=s.view==='pigletCare'?'pigletCare':'profile';const candidate=roomContext(s).units.flatMap(u=>u.records).find(r=>r!==s&&!r.ended&&!r.productionOutcome&&born(r)>0);s.fosterDraft={direction:'out',target:candidate?.tag||'',count:1};s.view='foster';}
 if(a==='fosterDirection'){s.fosterDraft.direction=v;s.fosterDraft.count=1;}
 if(a==='fosterTarget')s.fosterDraft.target=v;
 if(a==='fosterCount'){const max=s.fosterDraft.direction==='out'?s.alive:20;s.fosterDraft.count=Math.max(1,Math.min(max,s.fosterDraft.count+Number(v)));}
 if(a==='saveFoster'){const f=s.fosterDraft;if(!f.target||f.count<1||(f.direction==='out'&&f.count>s.alive))return;if(f.direction==='out'){s.alive-=f.count;s.unidentified=Math.max(0,s.unidentified-f.count);}else{s.alive+=f.count;s.unidentified+=f.count;}s.anchor=born(s);event(s,`${f.count} piglet${f.count===1?'':'s'} fostered ${f.direction==='out'?'to':'from'} ${f.target}`,'milestone');if(s.featureReturn==='pigletCare'){s.pigletTab='records';s.view='pigletCare';}else{s.actionsEntry=true;s.view='profile';}}
 if(a==='openMortality'){if(!s.pigletSelected.length&&!s.unidentified)return;s.mortalityDraft={cause:'',unidentified:0,photos:[]};s.view='pigletDeath';}
 if(a==='mortalityCount'){const max=Math.min(s.unidentified,s.alive-s.pigletSelected.length);s.mortalityDraft.unidentified=Math.max(0,Math.min(max,s.mortalityDraft.unidentified+Number(v)));}
 if(a==='savePigletMortality'){const f=s.mortalityDraft,total=s.pigletSelected.length+f.unidentified;if(!f.cause||!total)return;const selected=new Set(s.pigletSelected);s.piglets.forEach(p=>{if(selected.has(p.tag))p.state='Dead';});s.unidentified=Math.max(0,s.unidentified-f.unidentified);s.alive=Math.max(0,s.alive-total);const typeIndex={Stillborn:0,Mummified:1,Crushed:2,Scours:3,'Starve-out':4,Other:5,'Cause unknown':5}[f.cause]??5;s.dead[typeIndex]+=total;s.frozen=Math.max(s.frozen,born(s));event(s,`${total} piglet${total===1?'':'s'} died · ${f.cause.toLowerCase()}`,'danger',f.photos);s.pigletSelected=[];s.pigletTab='records';s.view='pigletCare';}
 if(a==='countReconcile'){s.countDraft=s.alive;s.countReason='';s.view='countReconcile';}
 if(a==='countReconcileStep'){const identified=s.piglets.filter(p=>p.state==='Alive').length;s.countDraft=Math.max(identified,Math.min(30,s.countDraft+Number(v)));}
 if(a==='saveCountReconcile'){if(s.countDraft===s.alive||!s.countReason.trim())return;const before=s.alive,diff=s.countDraft-before;s.alive=s.countDraft;s.unidentified=Math.max(0,s.unidentified+diff);s.anchor=born(s);if(s.locked)s.frozen=Math.max(s.frozen,born(s));event(s,`Piglet count corrected · ${before} → ${s.alive} · ${s.countReason.trim()}`,'correction');s.actionsEntry=true;s.view='profile';}
 if(a==='featureBack'){if(['pigletEdit','pigletDeath'].includes(s.view)||s.view==='foster'&&s.featureReturn==='pigletCare'){s.pigletTab='records';s.view='pigletCare';}else{s.actionsEntry=true;s.view='profile';}}
}
// Merge every saved event in the pen, independent of the current list filters.
// Resolve the prototype's relative date labels against one reference day.
function penLogEvents(records,penId,today=new Date(),penEvents=[]){
 const midnight=new Date(today.getFullYear(),today.getMonth(),today.getDate()).getTime();
 const time=e=>{
  const relative=e.day.match(/^(\d+) days? ago$/);
  const day=e.day==='Today'?midnight:e.day==='Yesterday'?midnight-86400000:relative?midnight-Number(relative[1])*86400000:Date.parse(e.day+' '+today.getFullYear());
  const [h,m]=(e.time||'00:00').split(':').map(Number);
  return Number.isFinite(day)?day+(h*60+m)*60000:0;
 };
 return [...penEvents,...records.filter(r=>r.pen===penId).flatMap(r=>r.events.map(e=>({...e,sow:r.tag})))].sort((a,b)=>time(b)-time(a));
}
function penParent(view){return ['roomPenLog','roomPenFeed','roomPenNote','roomPenReadNote','roomPenFault','roomPenFaultRecord'].includes(view)?'roomPenDetail':'room';}
// Exposed only for deterministic checks of the in-memory prototype rules.
function taskClosureReview(c){
 const rows=c.units.flatMap(u=>u.records.map(record=>({record,unitId:u.id,unit:u.name})));
 const miscarriages=rows.filter(x=>x.record.productionOutcome==='miscarriage'),notInPig=rows.filter(x=>x.record.productionOutcome==='not-in-pig'),removed=rows.filter(x=>x.record.productionOutcome==='removed');
 const regular=rows.filter(x=>!['miscarriage','not-in-pig','removed'].includes(x.record.productionOutcome));
 const active=regular.filter(x=>!x.record.locked&&!x.record.ended&&born(x.record)>0),awaiting=regular.filter(x=>!x.record.locked&&!x.record.ended&&!born(x.record));
 const finished=regular.filter(x=>x.record.locked&&!x.record.ended),ended=regular.filter(x=>x.record.ended),drafts=rows.filter(x=>hasDraft(x.record));
 const completedLitters=regular.filter(x=>x.record.locked&&(!x.record.ended||x.record.deathStage==='after'));
 const totals={born:sum(completedLitters.map(x=>born(x.record))),alive:sum(completedLitters.map(x=>x.record.alive)),dead:sum(completedLitters.map(x=>sum(x.record.dead))),stillborn:sum(completedLitters.map(x=>x.record.dead[0])),mummified:sum(completedLitters.map(x=>x.record.dead[1]))};
 const performance={...totals,litters:completedLitters.length,bornAlivePerLitter:completedLitters.length?(totals.born-totals.stillborn-totals.mummified)/completedLitters.length:null,stillbornRate:totals.born?100*totals.stillborn/totals.born:null,target:c.bornAliveTarget??null};
 return {rows,active,awaiting,finished,ended,miscarriages,notInPig,removed,performance,drafts,blocked:!!(active.length||drafts.length)};
}
function closeTask(c,at=new Date().toISOString()){
 if(c.completion)return false;
 const review=taskClosureReview(c);if(review.blocked)return false;
 // A task closure receipt, not a frozen copy of the animals' live records.
 c.completion={early:review.awaiting.length>0,at,who:'G. Hansen',total:review.rows.length,finished:review.finished.length,removed:review.awaiting.length+review.removed.length,ended:review.ended.length,miscarriages:review.miscarriages.length,notInPig:review.notInPig.length,performance:review.performance};
 review.awaiting.forEach(({record})=>{record.taskDisposition='removed-at-close';});
 review.finished.forEach(({record})=>{fold(record);record.taskDisposition='retained';});
 return true;
}
globalThis.FarrowingStudy={seed,act,born,floor,changes,hasDraft,penLogEvents,taskClosureReview,closeTask,sowActionCatalogue};
if(typeof document==='undefined')return;
// The atlas follows the demo (?screen=): which of the feature's screens this state is. Null when no screen is that state.
function atlasScreen(s,c){
 const v=s.view;
 if(v==='room')return 'farrowing.room';
 if(v==='count')return born(s)?'farrowing.count':'farrowing.before';
 if(v==='death')return 'farrowing.death';
 if(v==='finish')return hasDraft(s)?'farrowing.blocked':'farrowing.finish';
 if(v==='locked')return s.ended?'farrowing.ended':'farrowing.locked';
 if(v==='edit')return s.popup?.kind==='born'?'farrowing.born':s.locked||s.ended?'farrowing.edit-finished':'farrowing.edit';
 if(v==='history')return 'farrowing.history';
 if(v==='roomOverview')return 'farrowing.overview';
 if(v==='roomTaskReceipt')return 'farrowing.task-receipt';
 if(v==='editFinish')return 'farrowing.edit-finished';
 if(v==='roomEndTask'){const r=taskClosureReview(c);return r.blocked?'farrowing.task-blocked':r.awaiting.length?'farrowing.task-ready':r.miscarriages.length?'farrowing.task-outcomes':'farrowing.task-complete';}
 return null;
}
const presets=[['room','Room list'],['count','Counting'],['before','Before first count'],['draft','Death entry'],['finish','Finish'],['blocked','Lock blocked'],['locked','Locked record'],['edit','Edit counts'],['born','Correct born'],['history','Farrowing log'],['ended','Sow died'],['task-blocked','End task · active sows'],['task-ready','End task · awaiting sows'],['task-complete','End task · all finished'],['task-outcomes','End task · production outcomes']];
const cards=[{title:'Find the next sow',caption:'<strong>The room, in context.</strong> Filter by state, jump to a pen, and open each sow’s live record.',initial:'room'},{title:'Finish with confidence',caption:'<strong>Two observations, then the lock.</strong> Clear rows, optional details and a deliberate final action.',initial:'finish'},{title:'Read the whole litter',caption:'<strong>Current facts, with their context.</strong> Finish details stay readable; the history opens on its own page.',initial:'locked'}];
const states=cards.map(c=>seed(c.initial));
const reminderTimers=[];
const disabled=b=>b?' disabled':'';
const btn=(a,label,cls='button',v='',off=false)=>`<button class="${cls}" data-action="${a}" data-value="${esc(v)}"${disabled(off)}>${label}</button>`;
const status=()=>`<div class="statusbar"><span>9:41</span><span class="status-icons">${icon('signal')}${icon('battery')}</span></div>`;
function causes(dead){return `<div class="causes">${dead.map((n,i)=>n?`<span>${types[i]} <b>${n}</b></span>`:'').join('')||'<span>No deaths recorded</span>'}</div>`;}
function summary(s){return SentriUI.panel(`<div class="summary-grid">${[[born(s),'Born'],[s.alive,s.locked?'Alive now':'Alive'],[sum(s.dead),'Dead']].map(([n,l])=>`<div class="metric"><strong>${n}</strong><span>${l}</span></div>`).join('')}</div>${causes(s.dead)}`,{className:'summary'});}
function recordStamp(s){
 if(!s.locked)return '';
 const event=s.events.find(e=>e.text.startsWith(s.ended?'Sow died':'Farrowing finished'));
 const when=s.ended?[event?.day,event?.time].filter(Boolean).join(' · '):s.finished;
 const date=when.replace(/^Today/, 'today').replace(' · ', ' at ');
 return `${s.ended?'Died':'Finished'} ${date}${event?.who?' by '+event.who:''}`;
}
function identity(s){
 if(s.view==='finish')return {title:'Finish farrowing',subtitle:`${s.tag} · ${s.pen} · Parity ${s.parity}`,close:{action:'dismiss',label:'Close finish drawer'}};
 if(s.view==='death'){const n=sum(s.deathDraft),sow=s.mode==='sow';return {title:sow?'Sow died':`Dead ${sum(s.dead)+n}`,subtitle:sow?'Choose the cause':'Born dead or died',aside:btn('clearDeath','Clear','st-text-action','',!n&&!s.sowCause),close:{action:'dismiss',label:'Close record dead'}};}
 if(['edit','editFinish'].includes(s.view))return {title:s.view==='editFinish'?'Edit finish details':'Edit record',subtitle:`${s.tag} · ${s.pen}`,aside:btn('clearEdit','Clear','st-text-action','',!changes(s).length),close:{action:'dismiss',label:'Close edit'}};
 const state=s.ended?'Sow died':s.locked?'Finished':s.view==='finish'?'Finishing':born(s)?'Farrowing':s.due.split(' · day')[0];
 return {title:{html:btn('profile',esc(s.tag)+icon('chevron'),'sow-title-link').replace('<button',`<button aria-label="View sow ${s.tag} details"`)},subtitle:{html:`<span class="sow-context"><span class="sow-location">${esc(s.pen)} / Parity ${s.parity}</span> <span>${esc(recordStamp(s)||state)}</span></span>`},close:{action:'dismiss',label:'Close sow drawer'},label:'Sow '+s.tag};
}
function farmStepper(props,prefix=''){return SentriUI.stepper(props).replace(/data-value="[^"]*" data-step="(-?\d+)"/g,(_,d)=>`data-value="${prefix}${d}" data-step="${d}"`);}
function row(label,val,action,value,min=false,max=false,cls='',draftStatus=''){return farmStepper({label,value:val,action,key:value,min:typeof min==='number'?min:min?val:0,max:typeof max==='number'?max:max?val:null,draft:cls.includes('draft'),status:draftStatus,strs:draftStatus?{status:'ds.stepper.draft'}:undefined,args:draftStatus?{status:{n:draftStatus.match(/\d+/)?.[0]||'1'}}:undefined,changed:cls.includes('changed'),reserveHint:false},value);}

const optRow=o=>SentriUI.optionalRow({icon:icon('plus'),editIcon:icon('edit'),...o});
function assistanceChoices(x,editing){return SentriUI.choiceRadios({label:'Was farrowing assisted?',labelHidden:true,optional:'Optional',layout:'inline',key:editing?'editAssistance':'assistance',action:editing?'editAssistance':'assistance',selected:x.assisted==null?'':String(x.assisted),options:[{value:'false',label:'No'},{value:'true',label:'Yes'}]});}
function optional(s,editing=false){
 const x=editing?s.edit:s,hasW=x.weight!==''&&x.weight!=null;
 const weight=`<label class="question-field"><span class="weight-control"><input aria-label="Litter weight in kilograms" data-field="weight" data-edit="${editing}" inputmode="decimal" type="number" min="0" step="0.1" placeholder="e.g. 12.6" value="${esc(x.weight)}"><span>kg</span></span></label>`;
 const assisted=assistanceChoices(x,editing);
 return `<div class="optional finish-form-details">${optRow({label:'Litter weight',value:hasW?x.weight+' kg':'',inline:weight,open:hasW})}${optRow({label:'Was farrowing assisted?',value:x.assisted!=null?assistanceLabel(x.assisted):'',inline:assisted,open:x.assisted!=null})}</div>`;
}
const footer=(left,right)=>SentriUI.sheetFooter({content:left+(right||'')});
function hold(action,label,off=false,danger=false){return btn(action,`<span>${label}</span><small>HOLD TO ${action==='lock'?'FINISH':action==='room-end-confirm'?(label==='End task'?'END':'END EARLY'):'SAVE'}</small>`,`button primary hold${danger?' danger':''}`,'',off);}
/* The finished litter, read-only: Facts, three across. The death breakdown is one link below, not a button in a fact. */
function finishFacts(s){
 const dead=sum(s.dead);
 const items=[['Born',born(s)],['Alive now',s.alive],['Dead',dead],['Weak',s.weak],['Deformed',s.deformed],['Assisted',assistanceLabel(s.assisted)],['Litter weight',s.weight?s.weight+' kg':null]].map(([label,value])=>({label,value}));
 return SentriUI.facts(items,{columns:3})+(dead?SentriUI.button({label:'Death breakdown',register:'text',action:'deathBreakdown',attrs:{'aria-label':'View death breakdown'}}).replace(/<\/button>$/,icon('chevron')+'</button>'):'');
}
// Room fixtures and navigation share each sow's existing farrowing state.
const roomContexts=[];
const penHighlightTimers=[];
const roomLenses=['Awaiting','Active','Done','All'];
const defaultRoomFilter=()=>({from:-7,to:7,parity:'Any'});
const parityChoices=['Any','0','1','2–5','6+'];
const dueDay=n=>n===-7?'7+ days ago':n===7?'In 7+ days':n===0?'Today':n===-1?'Yesterday':n===1?'Tomorrow':n<0?(-n)+' days ago':'In '+n+' days';
function dueRangeLabel(f){return f.from===-7&&f.to===7?'Any time':f.from===f.to?dueDay(f.from):dueDay(f.from)+' – '+dueDay(f.to);}
function roomFilterCount(f){return Number(f.from!==-7||f.to!==7)+Number(f.parity!=='Any');}
function roomFilterLabel(f){return [f.from!==-7||f.to!==7?'Due: '+dueRangeLabel(f):'',f.parity!=='Any'?'Parity '+f.parity:''].filter(Boolean).join(' · ');}
function matchesRoomFilter(r,f){return dueMatches(r,f)&&(f.parity==='Any'||f.parity==='6+'&&r.parity>=6||f.parity==='2–5'&&r.parity>=2&&r.parity<=5||String(r.parity)===f.parity);}
function visibleRoomRecords(c,f=c.filter){return c.records.filter(r=>matchesRoomFilter(r,f)&&(c.lens==='All'||roomState(r)===c.lens));}
const roomPaths={filter:'M4 5h16l-6 7v6l-4 2v-8z',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',scan:'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',close:'M6 6l12 12M18 6L6 18'};
const roomIcon=k=>globalThis.SentriIcons?SentriIcons.icon(k):`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${roomPaths[k]}"/></svg>`;
const roomState=r=>r.productionOutcome||r.locked?'Done':born(r)>0?'Active':'Awaiting';
// Separate sample records for each task unit; references survive unit navigation.
function sampleUnit(id,awaiting,active,done){
 const records=[];
 for(const [preset,n] of [['count',active],['before',awaiting],['locked',done]])for(let j=0;j<n;j++){
  const r=seed(preset),index=records.length;
  Object.assign(r,{tag:String(Number(id)*100+index+1).padStart(6,'0'),pen:(id==='6'?'A':'C')+(Math.floor(index/2)+1),parity:2+index%5,lastBorn:10+index%4,view:'room'});
  if(preset==='before')r.due=j===0?'Due today · day 114':j===1?'Due tomorrow · day 113':'Due in 2 days · day 112';
  records.push(r);
 }
 return {id,name:'Unit '+id,records,livePerLitter:10};
}
function switchRoomUnit(c,id){
 const next=c.units.find(u=>u.id===id);if(!next)return null;
 if(id!==c.unitId){
  const key=JSON.stringify([c.lens,c.filter]);c.unitPositions[c.unitId]={key,scroll:c.scroll,currentPen:c.currentPen,tailSpace:c.tailSpace};
  c.unitId=id;const position=c.unitPositions[id];
  Object.assign(c,position?.key===key?position:{scroll:0,currentPen:next.records[0]?.pen||'',tailSpace:0});
  c.query='';c.jump=null;c.peek=null;c.highlightPen=null;c.highlightUntil=0;
 }
 return next.records[0];
}
function roomContext(s){
 const i=states.indexOf(s);if(roomContexts[i])return roomContexts[i];
 const fixtures=[['count','000418','B1',3,11,'Due today · day 114'],['before','000392','B2',5,11,'Due tomorrow · day 113'],['before','000455','B4',2,12,'Due today · day 114'],['before','000431','B4',6,9,'Overdue · 3 days · day 117'],['before','000467','B4',5,10,'Due in 2 days · day 112'],['locked','000406','B3',4,13,'Due yesterday · day 115'],['ended','000399','B3',4,10,'Due yesterday · day 115']];
 const records=fixtures.map(([p,tag,pen,parity,lastBorn,due])=>{if(s.tag===tag){s.lastBorn=lastBorn;return s;}const r=seed(p);Object.assign(r,{tag,pen,parity,lastBorn,due,view:'room'});if(tag==='000406'){r.alive=11;r.dead=[1,0,1,0,0,0];r.frozen=13;r.finished='Today · 05:58';r.events=[{text:'Farrowing finished · born 13',day:'Today',time:'05:58',who:'G. Hansen',kind:'milestone'}];}return r;});
 if(!records.includes(s))records.unshift(s);
 const context=roomContexts[i]={unitId:'7',bornAliveTarget:12,units:[sampleUnit('6',3,1,4),{id:'7',name:'Unit 7',records,livePerLitter:10},sampleUnit('8',2,0,2)],unitPositions:{},get unit(){return this.units.find(u=>u.id===this.unitId)},get records(){return this.unit.records},lens:'All',filter:defaultRoomFilter(),filterDraft:defaultRoomFilter(),currentPen:s.pen,scroll:0,query:'',jump:null,peek:null};
 if(['task-ready','task-complete','task-outcomes'].includes(s.preset))context.units.forEach(u=>u.records.forEach(r=>{
  if(!r.locked&&(born(r)>0||s.preset==='task-complete'))Object.assign(r,{locked:true,frozen:born(r)||12,alive:born(r)?r.alive:12,pending:0,finished:'Today · 09:35'});
 }));
 if(s.preset==='task-outcomes'){
  const record=context.units[0].records.find(r=>!r.locked);Object.assign(record,{productionOutcome:'miscarriage',locked:true,frozen:0,alive:0,pending:0,events:[{text:'Miscarriage recorded',day:'Today',time:'08:10',who:'G. Hansen'}]});
 }
 return context;
}
function dueMatches(r,f){if(f.from===-7&&f.to===7)return true;const d=r.due||'';let day=d.startsWith('Due today')?0:d.startsWith('Due tomorrow')?1:d.startsWith('Due yesterday')?-1:d.startsWith('Overdue')?-Number(d.match(/(\d+) days?/)?.[1]||1):d.startsWith('Due in')?Number(d.match(/(\d+) days?/)?.[1]):null;return day!==null&&(f.from===-7||day>=f.from)&&(f.to===7||day<=f.to);}
function roomCounts(records){return Object.fromEntries(roomLenses.map(l=>[l,records.filter(r=>l==='All'||roomState(r)===l).length]));}
// Aggregate the same unfiltered records that each unit opens.
function taskOverview(c){
 const units=c.units.map(u=>{const counts=roomCounts(u.records),Farrowed=u.records.filter(r=>!r.productionOutcome&&r.locked&&(!r.ended||r.deathStage==='after')).length;return {id:u.id,name:u.name,...counts,Farrowed,ProgressTotal:Farrowed+counts.Active+counts.Awaiting,current:u.id===c.unitId};});
 const totals=Object.fromEntries(['Awaiting','Active','Done','Farrowed','ProgressTotal','All'].map(k=>[k,sum(units.map(u=>u[k]))]));return {units,totals};
}
function roomRow(r){const state=roomState(r),forecast=state==='Awaiting'&&(/tomorrow|Due in/.test(r.due));let main=state==='Awaiting'?esc((r.due||'Due today').split(' · day')[0]):`${r.alive} alive · ${sum(r.dead)} dead`;const overdue=state==='Awaiting'&&(r.due||'').startsWith('Overdue');if(overdue){const n=+(r.due.match(/(\d+) days?/)?.[1]||1);main=`Due ${n} ${n===1?'day':'days'} ago`;}if(r.productionOutcome){const outcome={miscarriage:'Miscarriage','not-in-pig':'Not in pig',removed:'Removed from batch'}[r.productionOutcome]||'Production outcome';return btn('room-sow',`<span class="sow-identity"><span class="sow-id">${r.tag}</span></span><span class="row-detail"><span class="row-main">${outcome}</span><span class="row-sub">Recorded · ${r.events[0]?.time||'Today'} · G.H</span></span>${icon('chevron')}`,'sow-row room-sow-row',r.tag);}const hand=r.ended?'L.M':'G.H';const trail=state==='Awaiting'?`parity ${r.parity} · ${r.lastBorn||12} born last`:`born ${born(r)} · ${r.ended?'yesterday':r.locked?'final '+r.finished.split(' · ').at(-1):r.stamp==='09:41'?'just now':'1h ago'} · ${hand}`;return btn('room-sow',`<span class="sow-identity"><span class="sow-id">${r.tag}</span>${overdue?SentriUI.status({variant:'chip',kind:'overdue',text:'Overdue'}):state==='Active'?SentriUI.status({variant:'chip',kind:'active',text:'Active'}):r.ended?SentriUI.status({variant:'chip',kind:'died',text:'Sow died'}):r.locked?SentriUI.status({variant:'chip',kind:'done',text:'Done'}):''}</span><span class="row-detail"><span class="row-main${forecast?' forecast':''}">${main}</span><span class="row-sub">${trail}</span></span>${icon(r.locked?'edit':'chevron')}`,'sow-row room-sow-row',r.tag);}
function room(s){
 const c=roomContext(s),filtered=c.records.filter(r=>matchesRoomFilter(r,c.filter)),counts=roomCounts(filtered),allCounts=taskOverview(c).totals,avg=c.unit.livePerLitter;
 const visible=visibleRoomRecords(c);
 const pens=[...new Set(visible.map(r=>r.pen))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 if(!pens.includes(c.currentPen))c.currentPen=pens[0]||'';
 const latest=c.records.some(r=>r.stamp==='09:41')?'09:41':'08:41';
 if(s.view==='roomHome'||c.completion)return roomHome(c);
 return `${status()}<header class="room-appbar task-header">${SentriUI.iconButton({action:'room-home',icon:icon('chevron'),label:'Back to Today',className:'task-return'})}<h2>Farrowing</h2></header><div class="room-scroll" tabindex="-1" role="region" aria-label="${esc(c.unit.name)} farrowing sows"><div class="room-intro task-activity"><p class="room-latest">Last record <strong>${latest}</strong><span> · G. Hansen</span></p></div><div class="room-context-strip overview-host">${AstraTaskOverview.render({headingIcons:true,unit:{name:c.unit.name,value:avg,metric:'Live / litter',target:'Target 12',belowTarget:true},task:{value:allCounts.Farrowed,total:allCounts.ProgressTotal,label:'Farrowed',statuses:{farrowed:allCounts.Farrowed,active:allCounts.Active,awaiting:allCounts.Awaiting},support:allCounts.Active+' active · '+allCounts.Awaiting+' awaiting'}})}</div><div class="room-controls"><div class="room-lensbar">${SentriUI.segment({variant:'two-line-lens',options:roomLenses.map(l=>[l,l,{count:counts[l]}]),active:c.lens,action:'room-lens',ariaLabel:'Farrowing state'})}${SentriUI.iconButton({action:'room-filter',icon:roomIcon('filter'),label:'Filter sows',className:'room-filter-button',badge:roomFilterCount(c.filter)||''})}</div>${roomFilterCount(c.filter)?`<div class="room-filter-summary"><span>${esc(roomFilterLabel(c.filter))}</span>${btn('room-clear-filter','Clear','text-button')}</div>`:''}</div><div class="room-list">${!visible.length?`<div class="room-empty"><strong>No ${c.lens==='All'?'matching':c.lens.toLowerCase()} sows</strong><p>${roomFilterCount(c.filter)?'Adjust the filters to see more task sows.':'Choose another status to see the other task sows in this unit.'}</p></div>`:''}${pens.map(p=>{const all=c.records.filter(r=>r.pen===p),rows=visible.filter(r=>r.pen===p);return `<section class="pen-card" data-pen="${p}"><header class="pen-top">${btn('room-pen-detail',`<strong>${p}</strong><small>· ${all.length} ${all.length===1?'sow':'sows'}</small>${icon('chevron')}`,'room-pen-name',p).replace('<button',`<button aria-label="Pen ${p}, ${all.length} ${all.length===1?'sow':'sows'}, view details"`)}${rows.length!==all.length?`<span class="pen-visible-count">${rows.length} shown</span>`:''}</header>${rows.map(roomRow).join('')}</section>`;}).join('')}</div></div><nav class="room-dock" aria-label="Farrowing tools">${btn('room-grid',`${roomIcon('grid')}<span>${c.currentPen||'Pens'}<small>Go to pen</small></span>`,'dock-pen').replace('<button','<button aria-label="Go to pen"')}${btn('room-scan',`${roomIcon('scan')}<span>Scan ear tag</span>`,'button primary dock-scan')}${btn('room-search',roomIcon('search'),'dock-search').replace('<button','<button aria-label="Search ear tag"')}</nav>`;
}
function roomHome(c){if(c.completion)return `${status()}<div class="room-home"><p class="home-eyebrow">All units</p><h2>Today</h2><p class="home-intro">Ended tasks</p>${btn('room-task-receipt',`<span class="home-task-title">Farrowing ${icon('chevron')}</span><span class="home-task-states">Task ended · ${c.completion.finished} finished</span><span class="home-resume">View receipt</span>`,'home-task')}</div>`;const n=roomCounts(c.records);return `${status()}<div class="room-home"><p class="home-eyebrow">${esc(c.unit.name)}</p><h2>Today</h2><p class="home-intro">Your work in this unit</p>${btn('room-return',`<span class="home-task-title">Farrowing ${icon('chevron')}</span><span class="home-task-states"><b>${n.Active} active</b> · ${n.Awaiting} awaiting · ${n.Done} done</span><span class="home-resume">Continue from pen ${c.currentPen}</span>`,'home-task')}</div>`;}
function roomSheet(title,body,actions,cls='',scope='Unit 7',aside=''){
 const page=cls.includes('task-overview-sheet')||cls.includes('task-end-sheet')||cls.includes('pen-detail-sheet')||cls.includes('pen-log-sheet')||cls.includes('pen-feed-page');
 const size=cls.includes('pen-note-sheet')?'short':cls==='picker-sheet'||cls.includes('task-end-expanded')||cls==='task-overview-sheet'?'long':'medium';
 return SentriUI.sheet({variant:page?'page':'drawer',title,subtitle:scope,body,footer:actions||footer(SentriUI.backButton({action:'room-back'})),className:('room-utility '+cls).trim(),size,aside,label:title,close:{action:'room-back',label:'Close '+title},scrim:{action:'room-back',label:'Dismiss '+title},bar:page?status():''});
}
function penFact(rows){if(!rows.length)return {text:'Empty',kind:'empty'};const active=rows.filter(r=>roomState(r)==='Active').length;if(active)return {text:active>1?active+' active':'Active',kind:'active'};const late=rows.filter(r=>roomState(r)==='Awaiting'&&r.due.startsWith('Overdue')).length;if(late)return {text:late>1?late+' overdue':'Overdue',kind:'overdue'};if(rows.every(r=>r.locked))return {text:sum(rows.map(born))+' born',kind:'done'};const today=rows.filter(r=>roomState(r)==='Awaiting'&&r.due.startsWith('Due today')).length;return {text:today?'Due today':rows[0].due.split(' · day')[0].replace('Due ','Due '),kind:today?'due':'waiting'};}
function roomSearchResults(c){const q=c.query.trim().toLowerCase();const rows=c.records.filter(r=>!q||r.tag.includes(q)||r.pen.toLowerCase().includes(q));return `<p class="search-count">${rows.length} ${rows.length===1?'sow':'sows'}${q?' found':' in this unit'}</p>${rows.map(r=>`<div class="search-result"><span class="search-pen">${r.pen}</span>${roomRow(r)}</div>`).join('')||'<p>No matching ear tags.</p>'}`;}
// Pen context is shared by its drawers within the unit; task rows stay sow-focused.
function penInfo(c){const pens=c.unit.penDetails||(c.unit.penDetails={});return pens[c.detailPen]||(pens[c.detailPen]={note:'',noteBy:'',faults:[],events:[],feed:null});}
function penEvent(c,text,note=''){penInfo(c).events.unshift({text,note,day:'Today',time:'09:41',who:'G. Hansen'});}
function penActionRow(action,symbol,title,sub,value=''){return SentriUI.row({action,icon:icon(symbol),title,description:sub,value});}
function penNotice(action,kind,title,copy,meta,value='',tone=''){return btn(action,`<span class="pen-notice-heading"><span>${kind}</span><strong>${esc(title)}</strong>${icon('chevron')}</span>${copy?`<span class="pen-notice-copy">${esc(copy)}</span>`:''}<small>${esc(meta)}</small>`,'pen-notice '+tone,value);}
function penDetails(c){
 const pe=penInfo(c),rows=c.records.filter(r=>r.pen===c.detailPen);
 const notices=pe.faults.filter(f=>f.open).map(f=>penNotice('room-pen-fault-record','Equipment',f.device,f.description,'Open · Reported '+f.time+' · '+f.who,f.id,'pen-notice-fault'));
 if(pe.note)notices.push(penNotice('room-pen-read-note','Note',pe.note,'',pe.noteBy));
 return roomSheet('Pen '+c.detailPen,`${notices.length?`<div class="pen-notices" aria-label="Reported faults and notes">${notices.join('')}</div>`:''}<section class="pen-information">${SentriUI.heading({title:'Pen information',icon:roomIcon('grid'),kind:'section',level:4})}<div class="compact-actions st-panel st-row-group">${penActionRow('room-pen-feed','feed','Feed guidance',pe.feed?pe.feed.formula+' · '+pe.feed.mode:'View feeding information')}${penActionRow('room-pen-fault','wrench','Report equipment fault','Name the device and what is wrong')}${penActionRow('room-pen-note','record',pe.note?'Edit pen note':'Add pen note',pe.note?'Update the note for this pen':'Leave information for the next person')}${penActionRow('room-pen-log','clock','Pen log','All recorded activity')}</div></section>`,footer(SentriUI.backButton({action:'room-back'})),'pen-detail-sheet',`${rows.length} ${rows.length===1?'sow':'sows'} · ${c.unit.name}`);
}
function penSubpage(s,c){
 if(!['roomPenFeed','roomPenReadNote','roomPenNote','roomPenFault','roomPenFaultRecord'].includes(s.view))return null;
 const pe=penInfo(c),draft=c.penDraft||{},scope='Pen '+c.detailPen+' · '+c.unit.name;
 const sheet=(title,body,action='')=>roomSheet(title,body,footer(SentriUI.backButton({action:'room-back'}),action),s.view==='roomPenFeed'?'pen-feed-page':['roomPenNote','roomPenReadNote'].includes(s.view)?'pen-form-sheet pen-note-sheet':'pen-form-sheet',scope);
 if(s.view==='roomPenFeed')return sheet('Feed guidance',pe.feed?`<section class="pen-detail-section">${SentriUI.heading({title:'Feeding',icon:icon('feed'),kind:'section',level:4})}${SentriUI.facts([{label:'Formula',value:pe.feed.formula},{label:'Method',value:pe.feed.mode}])}${pe.feed.guidance?`<p class="pen-detail-copy">${esc(pe.feed.guidance)}</p>`:''}</section>`:'<p class="detail-empty">No feed guidance recorded for this pen.</p>');
 if(s.view==='roomPenReadNote')return sheet('Pen note',`<p class="pen-detail-copy">${esc(pe.note)}</p><p class="pen-detail-meta">${esc(pe.noteBy)}</p>`,btn('room-pen-note','Edit note','button primary'));
 if(s.view==='roomPenNote')return sheet('Pen note',SentriUI.field({label:'Note',control:`<textarea data-pen-field="note">${esc(draft.note||'')}</textarea>`,className:'pen-field'}),btn('room-pen-save-note','Save note','button primary','',!draft.note?.trim()));
 if(s.view==='roomPenFault')return sheet('Report fault',`${SentriUI.pickerField({label:'Device',value:draft.device||'',placeholder:'Select',key:'pen:device',className:'pen-field'})}${draft.device==='Other'?SentriUI.field({label:'Device name',control:`<input data-pen-field="name" value="${esc(draft.name||'')}">`,className:'pen-field'}):''}${SentriUI.field({label:'Description',control:`<textarea data-pen-field="description" placeholder="What is broken or not working?">${esc(draft.description||'')}</textarea>`,className:'pen-field'})}`,btn('room-pen-save-fault','Report fault','button primary','',!validPenFault(draft)));
 if(s.view==='roomPenFaultRecord'){
  const f=pe.faults.find(x=>x.id===c.penFaultId);if(!f)return sheet('Equipment fault','<p class="detail-empty">No fault found.</p>');
  return sheet(f.device,`<p class="pen-detail-copy">${esc(f.description)}</p><p class="pen-detail-meta">${f.open?'Open':'Resolved'} · Reported ${f.time} · ${esc(f.who)}</p>${f.open?SentriUI.optionalRow({label:'Resolution note',inline:SentriUI.field({label:'Resolution note',labelHidden:true,control:'<textarea data-pen-field="resolution"></textarea>',className:'pen-field'})}):`<p class="pen-detail-copy">${esc(f.resolution||'')}</p>`}`,f.open?btn('room-pen-resolve-fault','Resolve fault','button primary'):'');
 }
 return null;
}
function validPenFault(draft){return !!draft.device&&!!draft.description?.trim()&&(draft.device!=='Other'||!!draft.name?.trim());}
function handlePenAction(s,c,a,v){
 const destinations={'room-pen-feed':'roomPenFeed','room-pen-read-note':'roomPenReadNote','room-pen-note':'roomPenNote','room-pen-fault':'roomPenFault','room-pen-fault-record':'roomPenFaultRecord'};
 if(destinations[a]){c.penDraft=a==='room-pen-note'?{note:penInfo(c).note}:{};if(a==='room-pen-fault-record')c.penFaultId=v;s.view=destinations[a];return;}
 if(a==='room-pen-save-note'&&c.penDraft?.note?.trim()){const pe=penInfo(c),note=c.penDraft.note.trim();penEvent(c,pe.note?'Pen note updated':'Pen note added',note);pe.note=note;pe.noteBy='G. Hansen · Today · 09:41';s.view='roomPenDetail';}
 if(a==='room-pen-save-fault'&&validPenFault(c.penDraft)){const d=c.penDraft,pe=penInfo(c),fault={id:String(pe.faults.length+1),device:d.device==='Other'?d.name.trim():d.device,description:d.description.trim(),time:'09:41',who:'G. Hansen',open:true};pe.faults.push(fault);penEvent(c,'Equipment fault reported',fault.device+' · '+fault.description);s.view='roomPenDetail';}
 if(a==='room-pen-resolve-fault'){const f=penInfo(c).faults.find(x=>x.id===c.penFaultId);if(f?.open){f.open=false;f.resolution=c.penDraft.resolution?.trim()||'';penEvent(c,'Equipment fault resolved',f.device+(f.resolution?' · '+f.resolution:''));s.view='roomPenDetail';}}
}
/* A log group is a day: Today, Yesterday, a weekday, or a date ("Aug 27"). "N days ago" is turned into one of those. */
function dayLabel(day){const m=String(day).match(/^(\d+) days? ago$/);return m?SentriUI.logDay(new Date(Date.now()-Number(m[1])*864e5)):day;}
function penLog(c){
 const entries=penLogEvents(c.records,c.detailPen,new Date(),penInfo(c).events);
 const groups=[];
 for(const e of entries){if(groups.at(-1)?.label!==dayLabel(e.day))groups.push({label:dayLabel(e.day),entries:[]});groups.at(-1).entries.push({title:e.text,detail:e.sow?`Sow ${e.sow}`:e.note||'',at:e.time,by:e.who,extraHtml:e.photos?.length?`<div class="photos">${e.photos.map((photo,i)=>btn('savedPhoto',`<img src="${esc(photo)}" alt="Recorded photo ${i+1}">`,'',photo)).join('')}</div>`:''});}
 const body=SentriUI.log(groups,{empty:'No activity recorded for this pen.'});
 return roomSheet('Pen log',body,footer(SentriUI.backButton({action:'room-back'})),'pen-log-sheet',c.unit.name+' · Pen '+c.detailPen);
}
function taskPerformance(p){
 const number=n=>n==null?'—':n.toFixed(1);
 return `<section class="task-performance">${SentriUI.heading({title:'Performance metrics',icon:icon('chart'),meta:`${p.litters} finished ${p.litters===1?'litter':'litters'}`,kind:'section',level:4})}<div class="task-performance-surface st-panel"><div class="task-kpi-pair"><div><span>Born alive / litter</span><strong>${number(p.bornAlivePerLitter)}</strong><small class="${p.target!=null&&p.bornAlivePerLitter!=null&&p.bornAlivePerLitter<p.target?'kpi-below':''}">${p.target!=null?'Target '+p.target:'No target set'}</small></div><div><span>Stillborn rate</span><strong>${number(p.stillbornRate)}${p.stillbornRate==null?'':'<small>%</small>'}</strong><small>${p.stillborn} stillborn / ${p.born} born</small></div></div><dl class="task-performance-totals">${[['Born',p.born],['Alive now',p.alive],['Piglet deaths',p.dead]].map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></div></section>`;
}
function taskOutcomeSummary(o,closed=false){
 const rows=[['Finished farrowing',o.finished],...(o.active?[['Still farrowing',o.active]]:[]),[closed?'Removed · not farrowed':'Awaiting farrowing',o.awaiting],...(o.removed?[['Removed earlier',o.removed]]:[]),...(o.miscarriages?[['Miscarriages',o.miscarriages]]:[]),...(o.notInPig?[['Not in pig',o.notInPig]]:[]),...(o.ended?[['Sow deaths',o.ended]]:[])];
 return `<section class="task-outcome-section">${SentriUI.heading({title:'Task outcomes',icon:icon('record'),meta:`${o.total} sows`,kind:'section',level:4})}<dl class="task-outcomes-list st-panel">${rows.map(([label,n])=>`<div><dt>${label}</dt><dd>${n}</dd></div>`).join('')}</dl></section>`;
}
function taskOtherOutcomes(r){
 const row=(key,label,n)=>SentriUI.row({title:label,trailing:String(n),action:n?'room-task-list':'',value:key});
 return `<section class="task-other-outcomes">${SentriUI.heading({title:'Other outcomes',icon:icon('record'),kind:'section',level:4})}<div class="task-other-surface st-panel st-row-group">${row('miscarriages','Miscarriages',r.miscarriages.length)}${row('ended','Sow deaths',r.ended.length)}${r.notInPig.length?row('notInPig','Not in pig',r.notInPig.length):''}${r.removed.length?row('removed','Removed from batch',r.removed.length):''}</div></section>`;
}
function taskDeathReview({record,unit,unitId}){
 const timing={before:'Before farrowing',during:'During farrowing',after:'After farrowing'}[record.deathStage]||'Timing not recorded';
 const hasLitter=born(record)>0;
 return `<article class="task-death-review">${btn('room-task-sow',`<span><strong>${record.tag}</strong><small>${esc(unit)} · ${record.pen}</small></span><span class="task-review-state">${timing}</span>${icon('chevron')}`,'task-review-sow',unitId+':'+record.tag)}${hasLitter?`<div class="task-death-litter"><h4>${record.deathStage==='after'?'Finished litter':'Piglets recorded'}</h4><dl class="task-performance-totals">${[['Born',born(record)],['Alive now',record.alive],['Piglet deaths',sum(record.dead)]].map(([label,n])=>`<div><dt>${label}</dt><dd>${n}</dd></div>`).join('')}</dl><p>${record.deathStage==='after'?'Included in finished-farrowing KPIs.':'Excluded from finished-farrowing KPIs.'}</p></div>`:''}</article>`;
}
function taskWarning(group,title,description){
 return btn('room-task-list',`${icon('alert')}<span class="task-warning-copy"><strong>${esc(title)}</strong><span>${esc(description)}</span></span>${icon('chevron')}`,'task-warning-card',group);
}
function taskEndSheet(s,c){
 const scope='Farrowing · All '+c.units.length+' units';
 const sheet=(title,body,actions,cls='')=>roomSheet(title,body,actions,'task-end-sheet '+cls,scope);
 if(s.view==='roomTaskReceipt'){
  const end=c.completion;if(!end)return '';
  const when=new Date(end.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  return sheet(end.early?'Task ended early':'Task ended',`<div class="task-end-status"><span class="task-ended-mark">${icon('check')}</span><div><h4>${end.removed?'Ended with '+end.removed+' sows awaiting':'Farrowing task ended'}</h4><p>${esc(when)} · ${esc(end.who)}</p></div></div>${taskPerformance(end.performance)}${taskOutcomeSummary({...end,awaiting:end.removed},true)}`,footer(SentriUI.backButton({action:'room-back'}),btn('room-home','Back to Today','button primary')),'task-end-expanded task-receipt-sheet');
 }
 const r=taskClosureReview(c);
 if(s.view==='roomTaskSows'){
  const key=['active','awaiting','drafts','ended','miscarriages','notInPig','removed'].includes(c.taskReviewGroup)?c.taskReviewGroup:'active';
  const title={active:'Active farrowing',awaiting:'Awaiting farrowing',drafts:'Unsaved records',ended:'Sow deaths',miscarriages:'Miscarriages',notInPig:'Not in pig',removed:'Removed from batch'}[key];
  return sheet(title,`<div class="${key==='awaiting'?'task-removal-notice':'task-list-hint'}">${key==='awaiting'?`${icon('alert')}<div><strong>${r.awaiting.length} ${r.awaiting.length===1?'sow will':'sows will'} be removed from this batch</strong><p>These sows have not farrowed. Ending the task removes them from the batch.</p></div>`:key==='drafts'?'Open a sow to save or clear its changes.':['ended','miscarriages','notInPig','removed'].includes(key)?'Recorded outcomes across all units. Open a sow to view the record.':'Open a sow to review and finish the record.'}</div><div class="task-review-sows">${r[key].map(({record,unit,unitId})=>key==='ended'?taskDeathReview({record,unit,unitId}):btn('room-task-sow',`<span><strong>${record.tag}</strong><small>${esc(unit)} · ${record.pen}</small></span><span class="task-review-state">${key==='awaiting'?esc(record.due.split(' · ')[0]):key==='drafts'?'Unsaved':key==='miscarriages'?'Miscarriage':key==='notInPig'?'Not in pig':key==='removed'?'Removed':record.alive+' alive'}</span>${icon('chevron')}`,'task-review-sow',unitId+':'+record.tag)).join('')||'<p>No sows to review.</p>'}</div>`,footer(SentriUI.backButton({action:'room-back'})),'task-sows-sheet');
 }
 const warning=r.active.length?taskWarning('active',`${r.active.length} ${r.active.length===1?'sow is':'sows are'} still farrowing`,'Finish these records before ending.'):'';
 const drafts=r.drafts.length?taskWarning('drafts',`${r.drafts.length} unsaved ${r.drafts.length===1?'record':'records'}`,'Save or clear the changes first.'):'';
 const removal=r.awaiting.length?taskWarning('awaiting',`${r.awaiting.length} ${r.awaiting.length===1?'sow will':'sows will'} be removed from this batch`,'These sows have not farrowed.'):'';
 const closureLabel=r.awaiting.length||r.blocked?'End task early':'End task';
 return sheet(closureLabel,`${removal}${warning}${drafts}${taskPerformance(r.performance)}${taskOutcomeSummary({total:r.rows.length,finished:r.finished.length,active:r.active.length,awaiting:r.awaiting.length,removed:r.removed.length,ended:r.ended.length,miscarriages:r.miscarriages.length,notInPig:r.notInPig.length})}`,footer(SentriUI.backButton({action:'room-back'}),hold('room-end-confirm',closureLabel,r.blocked,closureLabel==='End task early').replace('button primary hold','button primary hold '+(closureLabel==='End task'?'task-complete':'task-end-confirm'))),'task-end-expanded');
}
function roomOverlay(s){const c=roomContext(s),unitSheet=(title,body,actions,cls='',scope=c.unit.name,aside='')=>roomSheet(title,body,actions,cls,scope,aside);if(s.view==='roomFilter'){const f=c.filterDraft,n=visibleRoomRecords(c,f).length;return unitSheet('Filter sows',`<section class="filter-section"><div class="filter-section-head">${SentriUI.heading({title:'Expected farrowing',icon:icon('calendar'),kind:'section',level:4,className:'filter-title'})}<output class="due-range-value">${esc(dueRangeLabel(f))}</output></div><div class="due-range" style="--from:${(f.from+7)/14*100}%;--to:${(f.to+7)/14*100}%"><div class="due-range-track"></div><input type="range" min="-7" max="7" step="1" value="${f.from}" data-room-range="from" aria-label="Earliest expected farrowing" aria-valuetext="${dueDay(f.from)}"><input type="range" min="-7" max="7" step="1" value="${f.to}" data-room-range="to" aria-label="Latest expected farrowing" aria-valuetext="${dueDay(f.to)}"></div><div class="range-ticks"><span>7+ days ago</span><span>Today</span><span>In 7+ days</span></div></section><section class="filter-section">${SentriUI.heading({title:'Parity',icon:icon('profile'),kind:'section',level:4,className:'filter-title'})}${SentriUI.segment({variant:'facet',options:parityChoices.map(v=>[v,v]),active:f.parity,action:'room-parity',ariaLabel:'Parity'})}<p class="filter-explanation">Use the parity recorded on the sow’s profile.</p></section>`,footer(SentriUI.backButton({action:'room-back'}),btn('room-apply-filter',`Show ${n} ${n===1?'sow':'sows'}`,'button primary')),'room-filter-sheet',c.unit.name,btn('room-reset-filter','Reset','st-text-action'));}
 if(s.view==='roomPicker'&&c.picker)return roomSheet(c.picker.label,SentriUI.pickerOptions({options:c.picker.options,selected:c.picker.selected}),footer(SentriUI.backButton({action:'room-back'})),'picker-sheet',c.unit.name);
 if(['roomEndTask','roomTaskSows','roomTaskReceipt'].includes(s.view))return taskEndSheet(s,c);
 const penPage=penSubpage(s,c);if(penPage!==null)return penPage;
 if(s.view==='roomPenDetail')return penDetails(c);
 if(s.view==='roomPenLog')return penLog(c);
 if(s.view==='roomGrid'){const cells=Array.from({length:6},(_,row)=>`<span class="map-row-label">${row+1}</span>${['A','B','C','D'].map(col=>{const p=col+(row+1),all=c.records.filter(r=>r.pen===p),rows=visibleRoomRecords(c).filter(r=>r.pen===p),f=rows.length?penFact(rows):{text:all.length?'No matches':'Not in task',kind:'empty'};return btn('room-pen',`<strong>${p}${f.kind==='done'?' <span aria-label="Done">✓</span>':''}</strong><small>${f.kind==='active'||f.kind==='overdue'?SentriUI.status({variant:'word',kind:f.kind,text:f.text}):esc(f.text)}</small>`,`pen-cell ${f.kind}${c.currentPen===p?' current':''}`,p,!rows.length).replace('<button',`<button aria-label="Pen ${p}, ${esc(f.text)}"`);}).join('')}`).join('');return unitSheet('Go to pen',`<p class="picker-intro">Tap a pen to go to its sows. Hold to peek.</p><div class="pen-map"><span></span>${['A','B','C','D'].map(x=>`<span class="map-column-label">${x}</span>`).join('')}${cells}</div><p class="picker-note">Pen layout · only pens matching this view can be opened.</p><div class="pen-peek" hidden></div>`,'','picker-sheet');}
 if(s.view==='roomSearch'||s.view==='roomScan'){const scanning=s.view==='roomScan';return unitSheet(scanning?'Scan ear tag':'Find a sow',`${scanning?`<div class="scanner-demo">${roomIcon('scan')}<strong>Scanner preview</strong><p>Camera scanning isn’t connected in this prototype. Enter a tag or try the sample below.</p>${btn('room-demo-scan','Try sample tag '+c.records[0].tag,'button secondary')}</div>`:''}<label class="room-search-label">Ear tag or pen<input data-room-search type="search" inputmode="search" placeholder="e.g. ${c.records[0].tag} or ${c.records[0].pen}" value="${esc(c.query)}" autocomplete="off"></label><div class="room-search-results">${roomSearchResults(c)}</div>`,'');}
 if(s.view==='roomOverview'){
  const {units,totals:t}=taskOverview(c),review=taskClosureReview(c);
  const columns=['Farrowed','Active','Awaiting'];
 const overview=`<section class="task-progress-section">${SentriUI.heading({title:'Whole-task progress',meta:`${t.ProgressTotal} sows`,kind:'section',level:4})}<div class="task-progress st-panel">${AstraTaskOverview.statusProgress({farrowed:t.Farrowed,active:t.Active,awaiting:t.Awaiting})}<div class="task-metrics" style="--status-count:${columns.length}">${columns.map(k=>`<div><strong>${t[k]}</strong><span><i class="task-status-dot task-status-${k.toLowerCase()}"></i>${k}</span></div>`).join('')}</div></div><section class="unit-routing" aria-label="Farrowing by unit">${SentriUI.heading({title:'Choose a unit',icon:icon('grid'),kind:'section',level:4,className:'unit-routing-heading'})}<div class="unit-routing-surface"><div class="unit-routing-columns" aria-hidden="true"><span>Unit</span>${columns.map(k=>`<span>${k}</span>`).join('')}<span></span></div><div role="list">${units.map(u=>`<div role="listitem">${btn('room-unit',`<span class="unit-route-name"><strong>${u.name}</strong>${u.current?'<small>Current unit</small>':''}</span>${columns.map(k=>`<span class="unit-route-number" aria-hidden="true">${u[k]}</span>`).join('')}${icon('chevron')}`,'unit-route',u.id).replace('<button',`<button aria-label="Open ${u.name}${u.current?', current unit':''}, ${u.Farrowed} farrowed, ${u.Active} active, ${u.Awaiting} awaiting"${u.current?' aria-current="true"':''}`)}</div>`).join('')}</div></div></section></section>`;
  const details=`<div class="task-overview-details">${taskPerformance(review.performance)}${taskOtherOutcomes(review)}</div>`;
  return unitSheet('Task overview',`<div class="task-overview-content">${overview}${details}</div>`,footer(SentriUI.backButton({action:'room-back'}),btn('room-end-review',review.awaiting.length||review.blocked?'End task early':icon('check')+'End task',review.awaiting.length||review.blocked?'button primary task-end-early':'button primary task-complete')),'task-overview-sheet','Farrowing · All '+units.length+' units');
 }

 return '';
}
function roomAction(i,a,v){if(!a.startsWith('room-'))return false;const s=states[i],c=roomContext(s);const list=document.querySelector(`[data-card="${i}"] .room-scroll`);if(list)c.scroll=list.scrollTop;const intro=list?list.querySelector('.room-intro').offsetHeight+list.querySelector('.room-context-strip').offsetHeight+10:0;const nextScroll=c.scroll>=intro?intro:0;
 if(a==='room-sow'||a==='room-demo-scan'){const r=c.records.find(r=>r.tag===(a==='room-demo-scan'?c.records[0].tag:v));if(r){states[i]=r;r.view=r.productionOutcome?'history':r.locked?'locked':'count';if(r.productionOutcome)r.pageBack='room';c.currentPen=r.pen;c.query='';}}
 if(a==='room-back'||a==='room-return'){c.returnToTaskReview=false;if(s.view==='roomPenDetail')c.returnFocusPen=c.detailPen;const from=s.view;s.view=from==='roomPicker'&&c.picker?c.picker.returnView:from==='roomEndTask'?'roomOverview':from==='roomTaskSows'?c.taskListBack||'roomEndTask':from==='roomTaskReceipt'?'roomHome':penParent(from);if(from==='roomPicker')c.picker=null;}
 handlePenAction(s,c,a,v);
 if(a==='room-pen-log')s.view='roomPenLog';
 if(a==='room-pen-detail'&&c.records.some(r=>r.pen===v)){c.detailPen=v;c.currentPen=v;s.view='roomPenDetail';}
 if(a==='room-home')s.view='roomHome';
 if(a==='room-lens'){c.lens=v;c.scroll=nextScroll;c.tailSpace=0;s.view='room';}
 if(a==='room-filter'){c.filterDraft=clone(c.filter);s.view='roomFilter';}
 if(a==='room-parity')c.filterDraft.parity=v;
 if(a==='room-reset-filter')c.filterDraft=defaultRoomFilter();
 if(a==='room-apply-filter'){c.filter=clone(c.filterDraft);c.scroll=nextScroll;c.tailSpace=0;s.view='room';}
 if(a==='room-clear-filter'){c.filter=defaultRoomFilter();c.scroll=nextScroll;c.tailSpace=0;}
 if(a==='room-grid')s.view='roomGrid';
 if(a==='room-pen'){if(c.peek){c.peek=null;return true;}c.currentPen=v;c.jump=v;c.highlightUntil=Date.now()+900;c.highlightPen=v;s.view='room';}

 if(a==='room-search'||a==='room-scan'){c.query='';s.view=a==='room-search'?'roomSearch':'roomScan';}
 if(a==='room-overview')s.view=c.completion?'roomTaskReceipt':'roomOverview';
 if(a==='room-end-review')s.view=c.completion?'roomTaskReceipt':'roomEndTask';
 if(a==='room-task-list'){c.taskListBack=s.view;c.taskReviewGroup=v;s.view='roomTaskSows';}
 if(a==='room-task-sow'){const [unitId,tag]=v.split(':');switchRoomUnit(c,unitId);const record=c.records.find(r=>r.tag===tag);if(record){states[i]=record;record.view=record.productionOutcome?'history':record.locked?'locked':'count';if(record.productionOutcome)record.pageBack='roomTaskSows';c.currentPen=record.pen;c.lens='All';c.filter=defaultRoomFilter();c.returnToTaskReview=c.taskListBack||'roomEndTask';}}
 if(a==='room-end-confirm'){if(closeTask(c))s.view='roomTaskReceipt';else s.view='roomEndTask';}
 if(a==='room-task-receipt')s.view='roomTaskReceipt';
 if(a==='room-unit'){const record=switchRoomUnit(c,v);if(record){states[i]=record;record.view='room';c.focusUnit=true;}}
 return true;
}
function roomAfterRender(i){
 const s=states[i],c=roomContext(s),root=document.querySelector(`[data-card="${i}"]`),scroller=root.querySelector('.room-scroll'),list=root.querySelector('.room-list');clearTimeout(penHighlightTimers[i]);if(!list)return;
 const controls=root.querySelector('.room-controls'),sticky=controls.offsetHeight;scroller.style.setProperty('--room-sticky-height',sticky+'px');list.style.paddingBottom=(c.tailSpace||18)+'px';scroller.scrollTop=c.scroll;if(c.returnFocusPen){root.querySelector(`[data-action="room-pen-detail"][data-value="${c.returnFocusPen}"]`)?.focus({preventScroll:true});c.returnFocusPen=null;}if(c.focusUnit){scroller.focus({preventScroll:true});c.focusUnit=false;}
 if(c.jump){const target=[...list.querySelectorAll('[data-pen]')].find(x=>x.dataset.pen===c.jump);if(target){c.tailSpace=Math.max(18,scroller.clientHeight-sticky-target.offsetHeight);list.style.paddingBottom=c.tailSpace+'px';scroller.scrollTop+=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-sticky;}c.scroll=scroller.scrollTop;c.jump=null;}
 if(c.highlightUntil>Date.now()){const target=[...list.querySelectorAll('[data-pen]')].find(x=>x.dataset.pen===c.highlightPen);target?.classList.add('pen-arrival');penHighlightTimers[i]=setTimeout(()=>{target?.classList.remove('pen-arrival');c.highlightPen=null;c.highlightUntil=0;},c.highlightUntil-Date.now());}
}
function receipt(s){return s.pointers?'<span class="count-reminder">Use <strong>Record dead</strong> for deaths.<br>Use <strong>Edit</strong> for corrections.</span>':`<span class="count-save-state">${!s.events.length&&!s.alive?'Tap + as piglets are born':`${icon('check')}Saved${s.pending?`<span class="receipt-separator">·</span><strong>${s.pending>0?'+'+s.pending:-s.pending+' died'} this visit</strong>`:''}`} </span>`;}
function litterHeading(disabled=false){return SentriUI.heading({title:'Litter summary',icon:icon('record'),action:disabled?'':{label:'View log',action:'history',ariaLabel:'Open farrowing log'},kind:'section',level:3});}
function count(s){const pending=sum(s.deathDraft);return {cls:'',body:`${farmStepper({variant:'count',label:'Alive',value:s.alive,min:floor(s),action:'alive',reserveHint:true,hintHtml:receipt(s)}).replace('st-stepper-hint','st-stepper-hint receipt')}<section class="count-record">${litterHeading(!s.events.length&&!s.pending)}<div class="count-record-surface st-panel"><div class="count-record-facts"><div><span>Born</span><strong>${born(s)}</strong></div><div><span>Dead</span><strong>${sum(s.dead)}</strong></div></div>${sum(s.dead)?causes(s.dead):''}</div>${recordActions(s)}</section>`,footer:recordNavigation(btn('finish','Finish farrowing','button primary','',!born(s)))};}
function finish(s){
 const unsaved=sum(s.deathDraft),blocked=hasDraft(s);
 const review=blocked?`<div class="finish-pending"><div><strong>${unsaved?'Save piglet deaths first':changes(s).length?'Save your correction first':'Save or clear the sow record'}</strong><span>Resolve this before finishing.</span></div>${btn(unsaved||s.sowCause?'death':'edit',`Review ${icon('chevron')}`,'finish-review-link')}</div>`:'';
 return {cls:'finish-body',body:`${review}<dl class="finish-totals st-panel">${[['Born',born(s)],['Alive',s.alive],['Dead',sum(s.dead)]].map(([label,n])=>`<div><dt>${label}</dt><dd>${n}</dd></div>`).join('')}</dl><fieldset class="finish-condition"><legend>Piglet condition</legend><p>Among the ${s.alive} alive piglets · 0 if none</p>${row('Weak',s.weak,'classify','weak,',s.weak===0,s.weak+s.deformed>=s.alive)}${row('Deformed',s.deformed,'classify','deformed,',s.deformed===0,s.weak+s.deformed>=s.alive)}</fieldset><section class="finish-extras" aria-label="Optional details">${optRow({label:'Litter weight',value:s.weight!==''&&s.weight!=null?s.weight+' kg':'',action:'finishOptional',key:'weight',attrs:{'aria-expanded':s.finishOptional==='weight'}})}${s.finishOptional==='weight'?`<label class="finish-field finish-field-answer"><span class="finish-weight-control"><input aria-label="Litter weight in kilograms, optional" data-field="weight" data-edit="false" inputmode="decimal" type="number" min="0" step="0.1" placeholder="—" value="${esc(s.weight)}"><span>kg</span></span></label>`:''}${optRow({label:'Assisted farrowing',value:s.assisted!=null?assistanceLabel(s.assisted):'',action:'finishOptional',key:'assisted',attrs:{'aria-expanded':s.finishOptional==='assisted'}})}${s.finishOptional==='assisted'?assistanceChoices(s,false):''}</section>`,footer:footer(SentriUI.backButton({action:'returnCount'}),hold('lock','Finish farrowing',!!blocked||!born(s)))};

}
function moreSowActions(s){return btn('sowActions',`More actions ${icon('chevron')}`,'more-sow-actions').replace('<button',`<button aria-label="More actions for sow ${s.tag}"`);}
function recordActions(s){const pending=sum(s.deathDraft);return `<div class="record-inline-actions" aria-label="Record actions"><div class="record-action-group" role="group" aria-label="Quick actions">${btn('edit',`${icon('edit')}<span>Edit</span>`,'record-toolbar-action','',!s.events.length&&!born(s))}${btn('death',`${icon('alert')}<span>Record death</span>${pending?'<small>Unsaved</small>':''}`,'record-toolbar-action')}${btn('sowActions',`${icon('more')}<span>More actions</span>`,'record-toolbar-action record-toolbar-more').replace('<button',`<button aria-label="More actions for sow ${s.tag}"`)}</div></div>`;}
function recordNavigation(primary=''){return footer(SentriUI.backButton({action:'close'}),primary);}
function locked(s){
 const e=s.events[0];
 const body=s.ended?`<div class="danger-band"><strong>Sow died · ${esc(s.sowCause.toLowerCase())}</strong></div><section class="read-section reading-section">${litterHeading()}${summary(s)}</section>`:`<section class="read-section reading-section finish-record">${litterHeading()}${finishFacts(s)}</section>`;
 return {cls:'completed-record-body',body:`${body}${recordActions(s)}`,footer:recordNavigation()};
}
function death(s){const n=sum(s.deathDraft),sow=s.mode==='sow';return {cls:'',body:`${s.ended?'':SentriUI.segment({variant:'view-switch',options:s.ended?[['piglets','Piglets']]:[['piglets','Piglets'],['sow','The sow']],active:s.mode,action:'mode',ariaLabel:'Record death for'})}${sow?SentriUI.choiceRadios({label:'Cause',key:'sowCause',action:'sowCause',options:['Farrowing','Prolapse','Found dead','Other'].map(label=>({value:label,label})),selected:s.sowCause||''})+(s.sowCause==='Other'?SentriUI.optionalRow({label:'Details',value:s.sowNote||'',icon:icon('note'),inline:SentriUI.field({label:'Details',labelHidden:true,control:`<input aria-label="Details" data-field="sowNote" value="${esc(s.sowNote)}">`})}):''):types.map((t,i)=>row(t,s.dead[i]+s.deathDraft[i],'deadStep',i+',',s.dead[i],s.locked?s.dead[i]+s.alive-n+s.deathDraft[i]:null,s.deathDraft[i]?'draft-value':'',s.deathDraft[i]?`+${s.deathDraft[i]} unsaved`:'')).join('')}<div class="photo-field">${optRow({label:'Photos',value:s.photos.length?`${s.photos.length} attached`:'',icon:icon('camera'),editIcon:icon('camera'),action:'addPhoto',editLabel:'Add to',disabled:sow?!s.sowCause:!n})}<input type="file" data-field="photo" accept="image/*" capture="environment" class="visually-hidden" tabindex="-1">${s.photos.length?`<div class="photos">${s.photos.map((p,i)=>btn('photo',`<img src="${esc(p)}" alt="Attached photo ${i+1}">`,'',i)).join('')}</div>`:''}</div>${sow?`<div class="danger-band">${sum(s.deathDraft)||changes(s).length?`<p>Save or clear the pending ${sum(s.deathDraft)?'piglet deaths':'correction'} before ending.</p>${btn(sum(s.deathDraft)?'mode':'edit',sum(s.deathDraft)?'Review piglet deaths':'Review correction','text-button','piglets')}`:''}<strong>Saving ends farrowing</strong><small>${s.alive} alive stay under piglet care</small></div>`:''}`,footer:footer(SentriUI.backButton({action:'back'}),sow?hold('saveDeath','Record death',!s.sowCause||!!sum(s.deathDraft)||!!changes(s).length,true):btn('saveDeath',n?`Record ${n} ${n===1?'death':'deaths'}`:'Record deaths','button primary','',!n))};
}
function editSummary(s){const cs=changes(s),visible=cs.filter(x=>/^(Weak|Deformed|Litter weight|Assisted) /.test(x)===(s.view==='editFinish'));return `<div class="edit-review">${cs.length?`<div class="change-summary"><strong>Correcting a past record · logged as G. Hansen</strong>${visible.length?`<div class="change-list">${visible.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</div>`:''}</div>`;}
function edit(s){
 const e=s.edit,cs=changes(s);
 const bornRow=`<div class="entry-row"><span class="entry-label">Born</span><span class="step-value${e.born!==s.frozen?' changed':''}">${e.born}</span>${btn('bornPopup',icon('edit'),'key').replace('<button','<button aria-label="Correct born"')}</div>`;
 return {cls:'edit-body',body:`${editSummary(s)}<div class="edit-counts">${s.locked?bornRow:row('Alive',e.alive,'editStep','alive,0,',!e.alive,false,e.alive!==s.alive?'changed':'')}${types.map((t,i)=>row(t,e.dead[i],'editStep','dead,'+i+',',e.dead[i]===0,s.locked&&sum(e.dead)>=e.born,e.dead[i]!==s.dead[i]?'changed':'')).join('')}</div>${s.locked&&!s.ended?btn('expand',`<span class="section-title">${icon('record')}Finish details</span>${icon('chevron')}`,'edit-finish-door'):''}`,footer:footer(SentriUI.backButton({action:'back'}),btn('saveEdit','Save correction','button primary','',!cs.length))};
}
function editFinish(s){
 const e=s.edit,live=Math.max(0,s.finishAlive+e.born-s.frozen);
 return {cls:'edit-body',body:`${editSummary(s)}<fieldset class="finish-question"><legend>Any weak or deformed piglets?</legend><p class="question-hint">Of the alive piglets · 0 if none</p><div class="condition-counts">${row('Weak',e.weak,'editStep','weak,0,',!e.weak,e.weak+e.deformed>=live)}${row('Deformed',e.deformed,'editStep','deformed,0,',!e.deformed,e.weak+e.deformed>=live)}</div></fieldset>${optional(s,true)}`,footer:footer(SentriUI.backButton({action:'editCounts'}),btn('saveEdit','Save correction','button primary','',!changes(s).length))};
}
// Reading destinations share Inspection's medium drawer and record timeline.
function detailSheet(s,title,body,size='medium'){const outcome={miscarriage:'Miscarriage','not-in-pig':'Not in pig',removed:'Removed from batch'}[s.productionOutcome],scope=`${s.pen} · ${s.tag} · ${outcome||(s.locked?'born '+born(s)+' · '+s.alive+' alive now':'farrowing · '+s.alive+' alive')}`;return SentriUI.sheet({variant:s.view==='history'?'page':'drawer',title,subtitle:scope,body,footer:footer(SentriUI.backButton({action:'back'})),className:'detail-sheet',size,label:title,close:{action:'back',label:'Close '+title},scrim:{action:'back',label:'Dismiss '+title},bar:s.view==='history'?status():''});}
function history(s){
 const list=[...s.events];
 if(s.pending)list.unshift({text:s.pending>0?`+${s.pending} alive · this visit`:`${-s.pending} died · this visit`,day:'Today',time:s.stamp,who:'G. Hansen',kind:'open'});
 const groups=[];
 for(const e of list){if(groups.at(-1)?.day!==e.day)groups.push({day:e.day,events:[]});groups.at(-1).events.push(e);}
 const logGroups=groups.map(group=>({label:dayLabel(group.day),entries:group.events.map(e=>({title:e.text,corrected:e.kind==='correction',at:e.time,by:e.who,extraHtml:e.photos?.length?`<div class="photos">${e.photos.map((p,i)=>btn('savedPhoto',`<img src="${esc(p)}" alt="Recorded photo ${i+1}">`,'',p)).join('')}</div>`:''}))}));
 const body=SentriUI.log(logGroups,{empty:'Counts and saved updates will appear here.'});
 return detailSheet(s,s.productionOutcome?'Production log':'Farrowing log',body);
}
function popup(s){const p=s.popup;if(!p)return'';if(p.kind==='photo')return SentriUI.sheet({variant:'dialog',title:'Photo',body:`<img src="${esc(p.src)}" alt="Death record attachment">`,footer:footer(SentriUI.backButton({action:'cancelPopup'}),p.editable?btn('deletePhoto','Delete','button primary danger'):'')});
 const body=`${SentriUI.choiceRadios({label:'Correction',options:[{value:'more',label:'More born'},{value:'wrong',label:'Count was wrong'}],selected:p.mode,action:'bornMode',key:'bornMode'})}${farmStepper({label:'Born adjustment',value:p.n,min:p.mode==='more'?1:sum(s.edit.dead),action:'bornStep',reserveHint:false})}${p.mode==='more'?`${SentriUI.segment({variant:'view-switch',options:[['alive','Alive'],['died','Died']],active:p.split,action:'bornSplit',ariaLabel:'Additional born'})}${p.split==='died'?SentriUI.pickerOptions({options:types.map((t,i)=>[String(i),t]),selected:String(p.cause),action:'bornCause'}):''}`:''}`;
 return SentriUI.sheet({variant:'dialog',title:`Born ${s.edit.born} · correct it`,icon:'edit',subtitle:'Choose what changed.',body,footer:footer(SentriUI.backButton({action:'cancelPopup'}),btn('applyBorn','Apply','button primary'))});
}
function deathBreakdown(s){return detailSheet(s,'Death breakdown',`<dl class="death-breakdown-facts">${s.dead.map((n,i)=>n?`<div><dt>${types[i]}</dt><dd>${n}</dd></div>`:'').join('')}<div class="death-breakdown-total"><dt>Total dead</dt><dd>${sum(s.dead)}</dd></div></dl>`,'compact');}
function profile(s){return `<iframe class="sow-detail-frame" title="Sow details · ${esc(s.tag)}" src="inspection-astra-concept.html?layout=focus&embed=sow&v=stage-actions-15"></iframe>`;}
const sowDetailContexts=new WeakMap();
function sowActionCatalogue(s){return [
 {id:'miscarriage',title:'Record miscarriage',group:'production',scope:'farrowing',sub:'Record a pregnancy loss',reason:s.ended?'This sow has died.':s.productionOutcome?'A production outcome is already recorded.':s.locked?'Farrowing is already finished.':''},
 {id:'piglets',title:'Piglet processing',group:'production',scope:'piglet-processing',sub:`Care and identity · ${s.piglets.filter(p=>p.state==='Alive').length} identified · ${s.unidentified} without identity`,icon:'profile',reason:!born(s)?'Record the litter first.':''},
 {id:'death',title:'Record piglet deaths',group:'production',scope:'piglet-processing',sub:'Record stillbirths and deaths in this litter',icon:'alert',reason:s.productionOutcome?'A production outcome is already recorded.':!born(s)?'Record the litter first.':''},
 {id:'countReconcile',title:'Reconcile piglet count',group:'production',scope:'piglet-processing',sub:`System count ${s.alive} · explain a mismatch`,icon:'note',reason:!born(s)?'Record the litter first.':''},
 {id:'edit',title:'Edit litter record',group:'production',scope:'farrowing',sub:'Correct counts and recorded details',reason:born(s)?'':'No litter has been recorded yet.'},
 {id:'sow-death',title:'Record sow death',group:'health',sub:'Record the death of this sow',reason:s.ended?'Sow death is already recorded.':''},
 {id:'foster',title:'Foster piglets',group:'production',scope:'piglet-processing',sub:'Send or receive piglets between litters',icon:'hospital',reason:!s.alive?'No live piglets recorded.':''},
 {id:'remove-batch',title:'Remove from batch',group:'production',scope:'other',sub:'Remove this sow without recording a litter',icon:'close',reason:s.ended?'This sow has died.':s.productionOutcome?'A production outcome is already recorded.':born(s)?'A litter has already been recorded.':''},
 {id:'not-in-pig',title:'Mark not in pig',group:'production',scope:'farrowing',sub:'Record the outcome and return to rebreed watch',icon:'alert',reason:s.ended?'This sow has died.':s.productionOutcome?'A production outcome is already recorded.':born(s)?'A litter has already been recorded.':''},
 {id:'move-batch',title:'Move to another farrowing batch',group:'production',scope:'other',sub:'Keep the sow in the production plan',icon:'transfer',reason:'No destination farrowing batches are connected in this preview.'},
 {id:'marker',title:s.markers.length?'Edit note':'Add note',group:'general',sub:s.markers[0]?.text||'Leave a note or describe a visible marker',icon:'note',reason:s.ended?'This sow has died.':''},
 {id:'transfer',title:'Transfer sow',group:'general',sub:'Move this sow to another unit or pen',icon:'chevron',reason:s.ended?'This sow has died.':''}
];}
function connectSowDetail(root,s){
 const frame=root.querySelector('.sow-detail-frame');if(!frame)return;
 frame.addEventListener('load',()=>{
  const events=s.pending?[{text:(s.pending>0?'+':'')+s.pending+' alive · this visit',day:'Today',time:s.stamp,who:'G. Hansen'},...s.events]:s.events;
  const tasks=!s.productionOutcome&&!s.ended?[{id:'farrowing',title:'Farrowing',type:'Production',status:s.locked?'Finished':born(s)?'In progress':'Awaiting',summary:born(s)?s.alive+' alive · '+sum(s.dead)+' dead':'Record this sow’s litter'},...(born(s)?[{id:'piglet-processing',title:'Piglet processing',type:'Production',status:s.processingTasks.some(t=>!t.done)?'Due today':'Up to date',summary:s.processingTasks.filter(t=>t.done).length+' of '+s.processingTasks.length+' care steps done'}]:[]),...(s.tag==='000418'?[{id:'vaccination',title:'Vaccination',type:'Health',status:'Due today',summary:'Scheduled vaccination'},{id:'treatment-task',title:'Treatment',type:'Health',status:'Due today',summary:'Scheduled treatment'}]:[])]:[];
  frame.contentWindow.postMessage({type:'open-sow-detail',record:{id:s.tag,pen:s.pen,unit:roomContext(s).unit.name,parity:s.parity,stage:s.ended?'Sow died':s.locked?'Lactating':born(s)?'Farrowing':'Gestating',events},tasks,destinations:roomContext(s).units.map(u=>({id:u.id,name:u.name,pens:[...new Set(u.records.map(r=>r.pen))]})),context:sowDetailContexts.get(s),entry:s.actionsEntry?'actions':'pig',actions:sowActionCatalogue(s)},location.origin);
 },{once:true});
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||!['sow-detail-state','sow-detail-close','sow-action'].includes(e.data?.type))return;
 const i=states.findIndex((s,i)=>s.view==='profile'&&document.querySelector(`[data-card="${i}"] .sow-detail-frame`)?.contentWindow===e.source);
 if(i<0)return;const s=states[i];sowDetailContexts.set(s,e.data.context);
 if(e.data.type==='sow-action'){
  const a=e.data.action;if(a==='current-task'&&!s.productionOutcome&&!s.ended){s.actionReturn=false;s.actionsEntry=false;s.view=e.data.taskId==='piglet-processing'&&born(s)?'pigletCare':s.locked?'locked':'count';render(i);return;}const actionId={'save-miscarriage':'miscarriage','save-transfer':'transfer','save-batch-removal':'remove-batch','save-not-in-pig':'not-in-pig'}[a]||a,entry=sowActionCatalogue(s).find(x=>x.id===actionId&&!x.reason);if(!entry)return;
  if(a==='save-transfer'){const c=roomContext(s),from=c.units.find(u=>u.records.includes(s)),to=c.units.find(u=>u.id===e.data.unit),pen=String(e.data.pen||'');if(!from||!to||!to.records.some(r=>r.pen===pen)||(from===to&&s.pen===pen))return;const origin=from.name+' · '+s.pen;if(from!==to){from.records.splice(from.records.indexOf(s),1);to.records.push(s);}s.pen=pen;switchRoomUnit(c,to.id);c.currentPen=pen;event(s,'Transferred · '+origin+' → '+to.name+' · '+pen,'milestone');s.actionsEntry=true;s.view='profile';}
  else if(a==='save-miscarriage'){const reason=String(e.data.reason||'').trim();if(!reason)return;s.frozen=born(s);s.productionOutcome='miscarriage';s.locked=true;event(s,'Miscarriage · '+reason,'danger');s.actionsEntry=false;s.view='history';s.pageBack='room';}
  else if(a==='save-batch-removal'){const reason=String(e.data.reason||'').trim();if(!reason)return;s.productionOutcome='removed';s.locked=true;s.frozen=0;s.alive=0;s.pending=0;event(s,'Removed from farrowing batch · '+reason+(e.data.note?' · '+String(e.data.note).trim():''),'milestone');s.actionsEntry=false;s.view='history';s.pageBack='room';}
  else if(a==='save-not-in-pig'){const reason=String(e.data.reason||'').trim();if(!reason)return;s.productionOutcome='not-in-pig';s.locked=true;s.frozen=0;s.alive=0;s.pending=0;event(s,'Not in pig · '+reason+(e.data.note?' · '+String(e.data.note).trim():''),'milestone');s.actionsEntry=false;s.view='history';s.pageBack='room';}
  else {s.actionReturn=true;s.view=s.locked?'locked':'count';if(a==='sow-death'){act(s,'death');s.mode='sow';}else act(s,a);}
  render(i);return;
 }
 if(e.data.type==='sow-detail-close'){s.actionsEntry=false;act(s,'back');render(i);document.querySelector(`[data-card="${i}"] [data-action="profile"]`)?.focus({preventScroll:true});}
});

function featurePage(s,title,subtitle,body,primary='',cls=''){
 return SentriUI.sheet({variant:'page',title,subtitle,body,footer:footer(SentriUI.backButton({action:'featureBack'}),primary),className:('feature-page '+cls).trim(),label:title,bar:status()});
}
function markerPage(s){
 const existing=s.markers[0];
 const body=`${existing?SentriUI.panel(`<span>Current note</span><strong>${esc(existing.text)}</strong><small>${esc(existing.meta)}</small>`,{className:'feature-summary',tag:'section'}):''}${SentriUI.field({label:'Note',control:`<textarea data-marker-draft rows="5" placeholder="For example: red line on left shoulder · monitor overnight">${esc(s.markerDraft)}</textarea>`,className:'feature-field'})}<p class="feature-hint">Use this for handover information or a visible marker on the sow. The update stays in her history.</p>`;
 return featurePage(s,existing?'Edit note':'Add note',`${s.pen} · ${s.tag}`,body,btn('saveMarker','Save note','button primary','',!s.markerDraft.trim()),'marker-page');
}
function processingCare(s){
 const days=[...new Set(s.processingTasks.map(t=>t.day))];
 return SentriUI.panel(`<strong>${s.processingTasks.filter(t=>t.done).length} of ${s.processingTasks.length} care items done</strong><span>Due items stay visible until this litter is saved.</span>`,{className:'feature-callout'})+`<div class="processing-days">${days.map(day=>`<section class="processing-day"><div class="processing-day-head"><strong>Day ${day}</strong><span>${day===3?'Due today':day<3?'Recorded':`In ${day-3} days`}</span></div>${s.processingTasks.filter(t=>t.day===day).map(t=>btn('processingTask',`${t.done?icon('check'):'<span class="task-dot"></span>'}<span><strong>${esc(t.title)}</strong><small>${esc(t.meta)}</small></span>`,'processing-task'+(t.done?' is-done':''),t.id)).join('')}</section>`).join('')}</div>`;
}
function processingRecords(s){
 const q=s.pigletQuery.trim().toLowerCase(),rows=s.piglets.map((p,index)=>({p,index})).filter(({p})=>!q||p.tag.toLowerCase().includes(q)||p.notch.toLowerCase().includes(q));
 const alive=s.piglets.filter(p=>p.state==='Alive').length;
 return SentriUI.facts([{label:'Alive litter',value:s.alive},{label:'Identified',value:alive},{label:'Without identity',value:s.unidentified}],{columns:3})+`${s.unidentified?`<div class="feature-warning">${icon('alert')}<span><strong>${s.unidentified} piglets do not have identity details</strong><small>The litter count remains valid. Add identity only when it is known.</small></span></div>`:''}<label class="piglet-search">${icon('search')}<input type="search" data-piglet-search value="${esc(s.pigletQuery)}" placeholder="Search ear tag or notch"></label><div class="identity-tools">${btn('scanPiglet',`${icon('scan')}<span>Scan tag</span>`,'feature-tool')}${btn('notchPiglet',`${icon('details')}<span>Ear notch</span>`,'feature-tool')}${btn('addPiglet',`${icon('plus')}<span>Add piglet</span>`,'feature-tool')}</div><div class="piglet-roster">${rows.map(({p,index})=>`<article class="piglet-row${p.state==='Dead'?' is-dead':''}"><label class="piglet-select"><input type="checkbox" data-action="togglePiglet" data-value="${esc(p.tag)}"${s.pigletSelected.includes(p.tag)?' checked':''}${p.state==='Dead'?' disabled':''}><span class="visually-hidden">Select ${esc(p.tag)}</span></label><button data-action="editPiglet" data-value="${index}" class="piglet-row-main"><strong>${esc(p.tag||'Identity pending')}</strong><span>${esc([p.notch&&'notch '+p.notch,p.sex,p.weight&&p.weight+' kg'].filter(Boolean).join(' · ')||'Add identity details')}</span><small>${esc(p.state)}</small>${icon('chevron')}</button></article>`).join('')||'<p class="detail-empty">No piglets match this search.</p>'}</div>${SentriUI.panel(SentriUI.row({action:'foster',icon:icon('transfer'),title:'Foster piglets',description:'Send or receive piglets between litters'}),{className:'st-row-group'})}`;
}
function pigletCarePage(s){
 const care=s.pigletTab==='care';
 const tabs=SentriUI.segment({variant:'view-switch',options:[['care','Care'],['records','Piglet records']],active:s.pigletTab,action:'pigletTab',className:'feature-tabs',ariaLabel:'Piglet processing sections'});
 const primary=care?btn('saveProcessing','Save care updates','button primary','',!s.processingDirty):btn('openMortality',`Report mortality${s.pigletSelected.length?' · '+s.pigletSelected.length:''}`,'button primary','',!s.pigletSelected.length&&!s.unidentified);
 return featurePage(s,'Piglet processing',`${s.pen} · sow ${s.tag} · ${s.alive} alive`,tabs+(care?processingCare(s):processingRecords(s)),primary,'piglet-care-page');
}
function pigletEditPage(s){
 const p=s.pigletDraft||{tag:'',notch:'',sex:'',weight:''},valid=[p.tag,p.notch,p.sex,p.weight].some(x=>String(x||'').trim()&&x!=='Choose notch');
 const body=SentriUI.panel(`<strong>${s.pigletEditIndex<0?'New identity':'Edit identity'}</strong><span>Enter what is known. Empty fields remain visibly incomplete.</span>`,{className:'feature-callout'})+`<div class="piglet-edit-grid">${SentriUI.field({label:'Ear tag',control:`<input data-piglet-field="tag" value="${esc(p.tag)}" inputmode="numeric" placeholder="Scan or enter tag">`,className:'feature-field'})}${SentriUI.field({label:'Ear notch',control:`<input data-piglet-field="notch" value="${esc(p.notch==='Choose notch'?'':p.notch)}" placeholder="Choose or enter notch">`,className:'feature-field'})}${SentriUI.pickerField({label:'Sex',value:p.sex||'',placeholder:'Select',key:'piglet:sex',className:'feature-field'})}${SentriUI.field({label:'Weight <span>kg</span>',control:`<input data-piglet-field="weight" value="${esc(p.weight)}" inputmode="decimal" type="number" min="0" step="0.1" placeholder="—">`,className:'feature-field'})}</div>`;
 return featurePage(s,s.pigletEditIndex<0?'Add piglet identity':'Piglet identity',`${s.pen} · sow ${s.tag}`,body,btn('savePiglet','Save identity','button primary','',!valid),'piglet-edit-page');
}
function fosterPage(s){
 const f=s.fosterDraft,context=roomContext(s),candidates=context.units.flatMap(u=>u.records).filter(r=>r!==s&&!r.ended&&!r.productionOutcome&&born(r)>0).slice(0,4),max=f.direction==='out'?s.alive:20;
 const body=`<div class="feature-choice">${[['out','Send piglets'],['in','Receive piglets']].map(([id,label])=>btn('fosterDirection',`${icon('transfer')}<span>${label}</span>`,'',id).replace('<button',`<button aria-pressed="${f.direction===id}"`)).join('')}</div><section class="feature-section">${SentriUI.heading({title:'Other sow',kind:'section',level:4})}<div class="foster-sows">${candidates.map(r=>{const unit=context.units.find(u=>u.records.includes(r))?.name||'';return btn('fosterTarget',`<span><strong>${esc(r.tag)}</strong><small>${esc(unit)} · ${esc(r.pen)} · ${r.alive} alive</small></span>${f.target===r.tag?icon('check'):''}`,'',r.tag).replace('<button',`<button aria-pressed="${f.target===r.tag}"`);}).join('')}</div></section><section class="feature-section">${farmStepper({variant:'well',label:'Number of piglets',value:f.count,min:1,max,action:'fosterCount',reserveHint:false})}<p class="feature-hint">${f.direction==='out'?'The current litter decreases immediately. Piglets without identity are moved first.':'The received piglets are added without identity until their details are known.'}</p></section>`;
 return featurePage(s,'Foster piglets',`${s.pen} · sow ${s.tag}`,body,btn('saveFoster',`${f.direction==='out'?'Send':'Receive'} ${f.count} piglet${f.count===1?'':'s'}`,'button primary','',!f.target||f.count<1),'foster-page');
}
function pigletDeathPage(s){
 const f=s.mortalityDraft,total=s.pigletSelected.length+f.unidentified;
 const body=SentriUI.panel(`<strong>${s.pigletSelected.length} identified selected</strong><span>${s.pigletSelected.join(' · ')||'No identified piglets selected'}</span>`,{className:'feature-callout'})+`${s.unidentified?`<section class="feature-section">${farmStepper({variant:'well',label:'Unidentified piglets',value:f.unidentified,max:Math.min(s.unidentified,s.alive-s.pigletSelected.length),action:'mortalityCount',reserveHint:false})}</section>`:''}${SentriUI.pickerField({label:'Cause',value:f.cause,placeholder:'Select',key:'mortality:cause',className:'feature-field'})}<div class="photo-field">${optRow({label:'Photos',value:f.photos.length?`${f.photos.length} attached`:'',icon:icon('camera'),editIcon:icon('camera'),action:'addPhoto',editLabel:'Add to'})}<input type="file" data-piglet-photo accept="image/*" capture="environment" multiple class="visually-hidden" tabindex="-1"></div><p class="feature-hint">One cause is applied to this save. Use another pass when the causes differ.</p>`;
 return featurePage(s,'Report piglet mortality',`${s.pen} · sow ${s.tag} · ${total} to report`,body,btn('savePigletMortality',`Save mortality${total?' · '+total:''}`,'button primary','',!f.cause||!total),'piglet-death-page');
}
function countReconcilePage(s){
 const identified=s.piglets.filter(p=>p.state==='Alive').length,changed=s.countDraft!==s.alive;
 const body=`<section class="count-compare"><div><span>System count</span><strong>${s.alive}</strong></div><div><span>Reported count</span><strong>${s.countDraft}</strong></div></section><section class="feature-section">${farmStepper({variant:'well',label:'Count the piglets in this litter',value:s.countDraft,min:identified,max:30,action:'countReconcileStep',reserveHint:false})}<p class="feature-hint">The count cannot be lower than the ${identified} identified piglets still recorded alive.</p></section>${changed?`<div class="feature-warning">${icon('alert')}<span><strong>The reported count will replace ${s.alive}</strong><small>${s.countDraft>s.alive?s.countDraft-s.alive+' piglets will be added without identity.':s.alive-s.countDraft+' piglets without identity will be removed.'}</small></span></div>`:''}${SentriUI.field({label:'Reason for mismatch',control:`<textarea rows="3" data-count-reason placeholder="What explains the difference?">${esc(s.countReason)}</textarea>`,className:'feature-field'})}`;
 return featurePage(s,'Reconcile piglet count',`${s.pen} · sow ${s.tag}`,body,btn('saveCountReconcile','Save corrected count','button primary','',!changed||!s.countReason.trim()),'count-reconcile-page');
}
function capabilitySurface(s){return s.view==='marker'?markerPage(s):s.view==='pigletCare'?pigletCarePage(s):s.view==='pigletEdit'?pigletEditPage(s):s.view==='foster'?fosterPage(s):s.view==='pigletDeath'?pigletDeathPage(s):s.view==='countReconcile'?countReconcilePage(s):'';}

function farrowingRecordSurface(s){const surface=({count,finish,locked,death,edit,editFinish})[s.view];if(!surface)return '';const v=surface(s),h=identity(s),page=AstraSurfaces.isPage('farrowing',s.view);
 const label={count:'Count alive',finish:'Finish farrowing',locked:'Locked litter',death:'Record dead',editFinish:'Edit finish details',edit:'Edit record'}[s.view];
 return SentriUI.sheet(Object.assign({variant:page?'page':'drawer',body:v.body,bodyClass:v.cls,footer:v.footer,size:['death','edit','editFinish','finish'].includes(s.view)?'long':'medium',sizing:['count','death','edit','editFinish'].includes(s.view)?'full':'content',view:s.view,label,scrim:{action:'dismiss',label:'Dismiss sheet'},bar:page?status():''},h));}
function farrowingBackground(s){
 if(s.view==='roomPicker'){const c=roomContext(s),back=c.picker?.returnView||'';const behind=['roomPenReadNote','roomPenNote','roomPenFault','roomPenFaultRecord'].includes(back)?penSubpage({...s,view:back},c):['marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile'].includes(back)?capabilitySurface({...s,view:back}):'';return behind?'<div class="page-background" inert aria-hidden="true">'+behind+'</div>':'';}
 if(['roomPenReadNote','roomPenNote','roomPenFault','roomPenFaultRecord'].includes(s.view))return '<div class="page-background" inert aria-hidden="true">'+penDetails(roomContext(s))+'</div>';
 return '';
}
function render(i,focusKey){const s=states[i],context=roomContext(s);if(s.actionReturn&&['count','locked'].includes(s.view)){s.actionReturn=false;if(!s.ended){s.view='profile';s.actionsEntry=true;}}if(s.view==='room'&&context.returnToTaskReview){s.view=context.returnToTaskReview;context.returnToTaskReview=false;}const root=document.querySelector(`[data-card="${i}"]`);clearTimeout(reminderTimers[i]);if(s.view!=='count')s.pointers=false;if(s.pointers)reminderTimers[i]=setTimeout(()=>{if(states[i]!==s||s.view!=='count')return;s.pointers=false;const status=root.querySelector('.receipt');if(status)status.innerHTML=receipt(s);},4000);const active=root.contains(document.activeElement)?document.activeElement:null,field=active?.dataset?.field,fieldValue=active?.value;if(root.dataset.view==='roomOverview')context.overviewScroll=root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0;const previousPopup=root.dataset.popup||'';const popupChanged=previousPopup!==(s.popup?.kind||'');root.dataset.popup=s.popup?.kind||'';const sameView=root.dataset.view===s.view;const scroll=sameView?root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0:0;root.dataset.view=s.view;root.querySelector('.phone').innerHTML=`<div class="room-surface"${!['room','roomHome'].includes(s.view)?' inert':''}>${room(s)}</div>`+farrowingBackground(s)+farrowingRecordSurface(s)+roomOverlay(s)+capabilitySurface(s)+(s.view==='history'?history(s):s.view==='profile'?profile(s):s.view==='deathBreakdown'?deathBreakdown(s):'')+popup(s);connectSowDetail(root,s);if(root.querySelector('.phone > .sheet > .sheet-body'))root.querySelector('.phone > .sheet > .sheet-body').scrollTop=s.view==='roomOverview'?(context.overviewScroll||0):scroll;if(s.popup){root.querySelectorAll('.phone > :not(.dialog-backdrop)').forEach(e=>e.setAttribute('inert',''));root.querySelector('.record-page')?.setAttribute('inert','');}if(!sameView){root.querySelector('.phone > .sheet,.phone > .record-page')?.focus({preventScroll:true});}if(popupChanged&&s.popup)root.querySelector('.dialog input,.dialog button')?.focus({preventScroll:true});else if(popupChanged&&previousPopup==='born')root.querySelector('[data-action="bornPopup"]')?.focus({preventScroll:true});if(field){[...root.querySelectorAll('.phone > .sheet [data-field]')].find(x=>x.dataset.field===field&&(x.type!=='radio'||x.value===fieldValue))?.focus({preventScroll:true});}if(focusKey){const target=Array.from(root.querySelectorAll('.phone > .sheet [data-action]')).find(e=>e.dataset.action===focusKey.a&&e.dataset.value===focusKey.v);const focusTarget=target&&!target.disabled?target:target?.closest('.st-stepper')?.querySelector('button:not(:disabled)')||root.querySelector('.phone > .sheet,.phone > .record-page');focusTarget?.focus({preventScroll:true});}roomAfterRender(i);if(i===0&&window.AtlasBare)AtlasBare.watch(()=>atlasScreen(s,context)); }
// Pointer taps keep keyboard focus position without drawing a keyboard-only ring.
document.addEventListener('pointerdown',()=>document.documentElement.dataset.inputMode='pointer',true);
document.addEventListener('keydown',()=>delete document.documentElement.dataset.inputMode,true);
const gallery=document.getElementById('gallery');gallery.innerHTML=cards.map((c,i)=>`<article class="spec" data-card="${i}"><div class="spec-head"><div class="spec-title"><span>0${i+1}</span>${c.title}</div><select class="scenario" aria-label="Example for ${c.title}">${presets.map(([v,l])=>`<option value="${v}"${v===c.initial?' selected':''}>${l}</option>`).join('')}</select></div><div class="phone farrowing-phone"></div><p class="caption">${c.caption}</p></article>`).join('');states.forEach((_,i)=>render(i));
function updateRoomRange(el){const root=el.closest('[data-card]'),c=roomContext(states[+root.dataset.card]),f=c.filterDraft,k=el.dataset.roomRange;f[k]=+el.value;if(f.from>f.to)f[k==='from'?'to':'from']=f[k];const sheet=el.closest('.sheet'),range=sheet.querySelector('.due-range');range.style.setProperty('--from',(f.from+7)/14*100+'%');range.style.setProperty('--to',(f.to+7)/14*100+'%');sheet.querySelectorAll('[data-room-range]').forEach(x=>{x.value=f[x.dataset.roomRange];if(x.type==='range')x.setAttribute('aria-valuetext',dueDay(+x.value));});sheet.querySelector('.due-range-value').textContent=dueRangeLabel(f);const n=visibleRoomRecords(c,f).length;sheet.querySelector('[data-action="room-apply-filter"]').textContent='Show '+n+' '+(n===1?'sow':'sows');}
// Capture the range gesture once, including when both date bounds coincide.
let dueGesture=null;
gallery.addEventListener('pointerdown',e=>{const rail=e.target.closest('.due-range');if(!rail||e.button!==0)return;e.preventDefault();const rect=rail.getBoundingClientRect(),inputs=[...rail.querySelectorAll('input')],day=Math.max(-7,Math.min(7,(e.clientX-rect.left)/rect.width*14-7)),lo=+inputs[0].value,hi=+inputs[1].value;const input=Math.abs(day-lo)<Math.abs(day-hi)||lo===hi&&day<=lo?inputs[0]:inputs[1];dueGesture={rail,input,rect};rail.setPointerCapture(e.pointerId);input.focus({preventScroll:true});input.value=Math.round(day);updateRoomRange(input);});
gallery.addEventListener('pointermove',e=>{if(!dueGesture)return;const {input,rect}=dueGesture;input.value=Math.max(-7,Math.min(7,Math.round((e.clientX-rect.left)/rect.width*14-7)));updateRoomRange(input);});
gallery.addEventListener('pointerup',()=>dueGesture=null);
gallery.addEventListener('pointercancel',()=>dueGesture=null);
window.addEventListener('blur',()=>dueGesture=null);
gallery.addEventListener('input',e=>{if(e.target.matches('[data-room-range]')){updateRoomRange(e.target);return;}if(!e.target.matches('[data-room-search]'))return;const i=+e.target.closest('[data-card]').dataset.card,c=roomContext(states[i]);c.query=e.target.value;e.target.closest('.sheet-body').querySelector('.room-search-results').innerHTML=roomSearchResults(c);});
gallery.addEventListener('scroll',e=>{if(!e.target.matches('.room-scroll'))return;const list=e.target,i=+list.closest('[data-card]').dataset.card,c=roomContext(states[i]);c.scroll=list.scrollTop;if(states[i].view!=='room')return;const top=list.getBoundingClientRect().top+list.querySelector('.room-controls').offsetHeight;const pen=[...list.querySelectorAll('[data-pen]')].find(p=>p.getBoundingClientRect().bottom>top+35);if(pen){c.currentPen=pen.dataset.pen;const label=list.closest('.phone').querySelector('.dock-pen>span');if(label)label.innerHTML=`${c.currentPen}<small>Go to pen</small>`;}},true);
let peekTimer=null,peekGesture=null;
function stopPeek(){clearTimeout(peekTimer);if(peekGesture){const root=document.querySelector(`[data-card="${peekGesture.i}"]`),peek=root.querySelector('.pen-peek');if(peek)peek.hidden=true;}peekGesture=null;}
gallery.addEventListener('pointerdown',e=>{const cell=e.target.closest('.pen-cell:not(:disabled)');if(!cell)return;stopPeek();const i=+cell.closest('[data-card]').dataset.card,c=roomContext(states[i]);c.peek=null;peekGesture={i,x:e.clientX,y:e.clientY};peekTimer=setTimeout(()=>{if(!peekGesture)return;c.peek=cell.dataset.value;const rows=visibleRoomRecords(c).filter(r=>r.pen===c.peek),peek=cell.closest('.sheet-body').querySelector('.pen-peek');peek.innerHTML=`<strong>${c.peek} · ${rows.length} ${rows.length===1?'sow':'sows'}</strong>${rows.map(r=>`<p>${r.tag} · ${roomState(r)}<br>${r.locked||born(r)?`${r.alive} alive · ${sum(r.dead)} dead`:esc(r.due.split(' · day')[0])}</p>`).join('')}`;peek.hidden=false;},350);});
gallery.addEventListener('pointermove',e=>{if(peekGesture&&Math.hypot(e.clientX-peekGesture.x,e.clientY-peekGesture.y)>12)stopPeek();});
gallery.addEventListener('pointerup',stopPeek);
gallery.addEventListener('pointercancel',stopPeek);
window.addEventListener('blur',stopPeek);
let holdTimer=null,holdTarget=null,grabStart=null;
function stopHold(){clearTimeout(holdTimer);holdTarget?.classList.remove('holding');holdTarget=null;}
function startHold(el){if(el.disabled||holdTarget)return;holdTarget=el;el.classList.add('holding');const i=+el.closest('[data-card]').dataset.card,record=states[i],view=record.view;holdTimer=setTimeout(()=>{const a=el.dataset.action,valid=el.isConnected&&!el.disabled&&states[i]===record&&record.view===view;stopHold();if(!valid)return;if(!roomAction(i,a,el.dataset.value))act(record,a);render(i);},850);}
gallery.addEventListener('focusout',e=>{if(e.target===holdTarget)stopHold();});
gallery.addEventListener('pointerdown',e=>{if(e.button!==0)return;const holdEl=e.target.closest('.hold');if(holdEl){holdEl.setPointerCapture?.(e.pointerId);startHold(holdEl);}if(e.target.closest('.grab'))grabStart={y:e.clientY,i:+e.target.closest('[data-card]').dataset.card};});
gallery.addEventListener('pointerup',e=>{stopHold();if(grabStart){if(e.clientY-grabStart.y>100){const s=states[grabStart.i];if(['marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile'].includes(s.view))act(s,'featureBack');else if(['death','edit','editFinish','history','profile','deathBreakdown'].includes(s.view))act(s,'back');else if(s.view==='finish')s.view='count';else if(s.view.startsWith('room'))roomAction(grabStart.i,'room-back');else act(s,'close');render(grabStart.i);}grabStart=null;}});
gallery.addEventListener('pointercancel',()=>{stopHold();grabStart=null});window.addEventListener('blur',stopHold);
gallery.addEventListener('keydown',e=>{if(e.key==='Tab'&&e.target.closest('.dialog,.sheet')){const items=[...e.target.closest('.dialog,.sheet').querySelectorAll('button:not(:disabled),input:not(:disabled):not([tabindex="-1"]),select,textarea')],first=items[0],last=items[items.length-1];if(e.shiftKey&&e.target===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&e.target===last){e.preventDefault();first?.focus();}}if(e.target.matches('.hold')&&[' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)startHold(e.target);}if(e.key==='Escape'){stopHold();const i=+e.target.closest('[data-card]').dataset.card,s=states[i];if(s.popup)s.popup=null;else if(['marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile'].includes(s.view))act(s,'featureBack');else if(['death','edit','editFinish','history','profile','deathBreakdown'].includes(s.view))act(s,'back');else if(s.view==='finish')s.view='count';else if(s.view.startsWith('room'))roomAction(i,'room-back');else act(s,'close');render(i);}});
gallery.addEventListener('keyup',e=>{if(e.target.matches('.hold')&&[' ','Enter'].includes(e.key)){e.preventDefault();stopHold();}});
gallery.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled||el.classList.contains('hold'))return;const i=+el.closest('[data-card]').dataset.card,s=states[i];let a=el.dataset.action,v=el.dataset.value;const before=s.view,beforePopup=s.popup?.kind;if(roomAction(i,a,v)){render(i,s.view===before?{a,v}:null);return;}if(a==='addPhoto'){el.closest('.photo-field').querySelector('input[type=file]').click();return;}if(a==='savedPhoto'){s.popup={kind:'photo',src:v,editable:false};render(i);return;}if(a==='otherSow'){states[i]=seed('before');states[i].pen='B2';states[i].tag='000392';states[i].parity=5;states[i].due='Due tomorrow · day 113';render(i);return;}if(a==='open-picker'){const c=roomContext(s),key=el.dataset.pickerKey,configs={'pen:device':{label:'Device',options:['Feeding station','Drinking station','Other'].map(d=>[d,d]),selected:c.penDraft?.device||'',returnView:'roomPenFault'},'piglet:sex':{label:'Sex',options:[['Female','Female'],['Male','Male']],selected:s.pigletDraft?.sex||'',returnView:'pigletEdit'},'mortality:cause':{label:'Cause',options:mortalityCauses.map(x=>[x,x]),selected:s.mortalityDraft?.cause||'',returnView:'pigletDeath'}},config=configs[key];if(!config)return;c.picker={key,...config};s.view='roomPicker';render(i);return;}if(a==='picker-select'){const c=roomContext(s),p=c.picker;if(!p)return;if(p.key==='pen:device')(c.penDraft=c.penDraft||{}).device=v;else if(p.key==='piglet:sex')s.pigletDraft.sex=v;else if(p.key==='mortality:cause')s.mortalityDraft.cause=v;s.view=p.returnView;c.picker=null;render(i);return;}if(a==='returnCount'){s.view='count';}else if(a==='dismiss'){if(['death','edit','editFinish','history','profile','deathBreakdown'].includes(s.view))act(s,'back');else if(s.view==='finish')s.view='count';else act(s,'close');}else act(s,a,v);render(i,s.view===before&&s.popup?.kind===beforePopup?{a,v}:null);if(s.view!==before){const body=el.closest('.spec')?.querySelector('.sheet-body');if(body)body.scrollTop=0;} });
gallery.addEventListener('input',e=>{
 const field=e.target.dataset.penField;if(!field)return;
 const i=+e.target.closest('[data-card]').dataset.card,c=roomContext(states[i]);c.penDraft[field]=e.target.value;
 const save=e.target.closest('.sheet').querySelector('[data-action="room-pen-save-note"],[data-action="room-pen-save-fault"]');
 if(save)save.disabled=states[i].view==='roomPenNote'?!c.penDraft.note?.trim():!validPenFault(c.penDraft);
});
gallery.addEventListener('input',e=>{
 const root=e.target.closest('[data-card]');if(!root)return;const i=+root.dataset.card,s=states[i];
 if(e.target.hasAttribute('data-marker-draft')){s.markerDraft=e.target.value;root.querySelector('[data-action="saveMarker"]').disabled=!s.markerDraft.trim();return;}
 if(e.target.hasAttribute('data-count-reason')){s.countReason=e.target.value;root.querySelector('[data-action="saveCountReconcile"]').disabled=s.countDraft===s.alive||!s.countReason.trim();return;}
 if(e.target.hasAttribute('data-piglet-field')){s.pigletDraft[e.target.dataset.pigletField]=e.target.value;const valid=[s.pigletDraft.tag,s.pigletDraft.notch,s.pigletDraft.sex,s.pigletDraft.weight].some(x=>String(x||'').trim()&&x!=='Choose notch');root.querySelector('[data-action="savePiglet"]').disabled=!valid;return;}
 if(e.target.hasAttribute('data-piglet-search')){s.pigletQuery=e.target.value;render(i);root.querySelector('[data-piglet-search]')?.focus({preventScroll:true});}
});
SentriUI.radioBind(gallery,{onChange:(field,value)=>{if(!['bornMode','sowCause','assistance','editAssistance'].includes(field))return;const i=+document.activeElement.closest('[data-card]').dataset.card;act(states[i],field,value);render(i);}});
gallery.addEventListener('change',e=>{
 const root=e.target.closest('[data-card]');if(!root)return;const i=+root.dataset.card,s=states[i];
 if(e.target.hasAttribute('data-piglet-field')){s.pigletDraft[e.target.dataset.pigletField]=e.target.value;render(i);return;}
 if(e.target.hasAttribute('data-piglet-photo')){for(const file of e.target.files)s.mortalityDraft.photos.push(URL.createObjectURL(file));render(i);}
});
function updateTextField(el,i){
 const s=states[i],target=el.dataset.edit==='true'?s.edit:s,f=el.dataset.field;
 target[f]=el.value;
 if(f==='weight'){
  if(target[f]!==''&&+target[f]<0){target[f]='';el.value='';}
  if(el.dataset.edit==='true'){
   const root=el.closest('.spec'),cs=changes(s);
   root.querySelector('[data-action="saveEdit"]').disabled=!cs.length;
   root.querySelector('.edit-review').outerHTML=editSummary(s);
   const clear=root.querySelector('.edit-header [data-action="clearEdit"]');
   if(clear)clear.disabled=!cs.length;
   

  }
 }
}
gallery.addEventListener('input',e=>{if(['weight','sowNote'].includes(e.target.dataset.field))updateTextField(e.target,+e.target.closest('[data-card]').dataset.card);});
gallery.addEventListener('change',e=>{const el=e.target,i=+el.closest('[data-card]').dataset.card,s=states[i];if(el.matches('.scenario')){roomContexts[i]=null;states[i]=seed(el.value);render(i);return;}const f=el.dataset.field;if(!f)return;if(['weight','sowNote'].includes(f)){updateTextField(el,i);return;}if(f==='photo'){for(const file of el.files)s.photos.push(URL.createObjectURL(file));}else{const target=el.dataset.edit==='true'?s.edit:s;target[f]=f==='assisted'?el.value==='true':el.type==='checkbox'?el.checked:el.value;if(f==='weight'&&target[f]!==''&&+target[f]<0)target[f]='';}render(i);});
document.getElementById('reset-all').onclick=()=>{stopHold();states.forEach((s,i)=>{roomContexts[i]=null;states[i]=seed(cards[i].initial);document.querySelector(`[data-card="${i}"] .scenario`).value=cards[i].initial;render(i);});};
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const focus=b.dataset.layout==='focus';gallery.classList.toggle('focus',focus);document.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',x===b));const u=new URL(location.href);u.searchParams.set('layout',focus?'focus':'overview');window.history.replaceState(null,'',u);});
if(new URLSearchParams(location.search).get('layout')==='focus')document.querySelector('[data-layout="focus"]').click();
// Home opens the existing whole-task overview or the selected unit directly.
if(window.SentriHomeLink){
 const link=window.SentriHomeLink,c=roomContext(states[0]);
 if(link.unit){const record=switchRoomUnit(c,link.unit);if(record)states[0]=record;}
 let homeOverview=link.entry==='overview';
 states[0].view=homeOverview?'roomOverview':'room';render(0);
 document.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='room-unit')homeOverview=false;
  if(!homeOverview||states[0].view!=='roomOverview'||action!=='room-back')return;
  e.preventDefault();e.stopImmediatePropagation();link.back();
 },true);
}
})();

