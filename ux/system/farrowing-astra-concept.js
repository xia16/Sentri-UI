/* UI study only. No production records, network writes or persistent storage. */
(()=>{
'use strict';
// Farm configuration the prototype can flip (owner decision 2026-10-10: a rearing pen is a farm-level option; default on for the demo; ?rearing=off turns it off).
const farmConfig={rearingPen:!/[?&]rearing=(off|0|no)(&|$)/.test(globalThis.location?.search||'')};
const types=['Stillborn','Mummified','Crushed','Scours','Starve-out','Other'];
const mortalityCauses=['Cause unknown','Crushed','Scours','Starve-out','Other'];
const sum=a=>a.reduce((x,y)=>x+y,0), clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assistanceLabel=value=>value===true?'Yes':value===false?'No':'Not recorded';
const icon=k=>SentriIcons.icon(k);
const taskSyncPreview=typeof location==='undefined'?null:new URLSearchParams(location.search).get('taskSync');
// The task's saved-work badge (owner, 2026-10-13 and 2026-10-18): an upload icon and this task's record count, as the page action of
// every page in the task; nothing when this task has no records on this phone, even if other tasks do (Home holds the whole phone).
// Red only when signed out. ?taskSync= offline | syncing | failed (read as uploading with some not accepted) | expired | other | done.
function openTaskSync(){
 const url=new URL('data-sync-astra-prototype.html',location.href);
 url.searchParams.set('taskId','farrow28');
 url.searchParams.set('scenario',{failed:'partial',syncing:'syncing',expired:'expired'}[taskSyncPreview]||'offline');
 url.searchParams.set('from','task');
 location.assign(url.href);
}
function taskSyncBadge(){
 if(!['offline','syncing','failed','expired'].includes(taskSyncPreview))return '';
 const out=taskSyncPreview==='expired';
 return SentriUI.iconButton({action:'open-task-sync',icon:icon(out?'alert':'upload'),count:2,tone:out?'attention':'',label:out?'Sign in to keep uploading. This Farrowing task: 2 records on this phone':'This Farrowing task: 2 records on this phone'});
}
function placeTaskSyncBadge(root){
 const badge=taskSyncBadge();if(!badge)return;
 root.querySelectorAll('.phone .st-page-header').forEach(header=>{
  if(header.getClientRects().length)header.insertAdjacentHTML('beforeend',badge);
 });
}
// People are initials on every record stamp: "G. Hansen" is "G.H".
const initials=n=>{const m=/^([A-Za-z])[.]? ([A-Za-z])/.exec(n||'');return m?m[1]+'.'+m[2]:(n||'');};
function seed(preset='count'){
 const s={preset,view:'count',back:'count',finishAlive:9,due:'Due today · day 114',alive:9,dead:[1,1,2,0,0,1],anchor:10,pending:4,weak:1,deformed:1,weight:'',assisted:false,locked:false,ended:false,frozen:14,tag:'000418',pen:'B1',parity:3,deathDraft:[0,0,0,0,0,0],moved:0,handReared:null,mode:'piglets',sowCause:'',sowNote:'',photos:[],edit:null,expanded:false,popup:null,pointers:false,lens:'All',stamp:'08:41',finished:'Aug 27 · 08:12',markers:[{text:'Red line on left shoulder · monitor overnight',meta:'Today · 06:20 · G.H'}],markerDraft:null,pigletTab:'care',processingDirty:false,processingTasks:[{id:'dry',day:1,title:'Dry and warm',done:true,meta:'Aug 26 · 07:18 · G.H'},{id:'navel',day:1,title:'Disinfect navel',done:true,meta:'Aug 26 · 07:24 · G.H'},{id:'iron',day:3,title:'Iron supplement',done:false,meta:'Due today'},{id:'identity',day:3,title:'Ear tag, notch and weight',done:false,meta:'3 identified · 6 without identity'},{id:'health',day:5,title:'Health check',done:false,meta:'In 2 days'}],piglets:[{tag:'418001',notch:'36-38',sex:'Female',weight:'1.4',state:'Alive'},{tag:'418002',notch:'36-41',sex:'Male',weight:'1.5',state:'Alive'},{tag:'418003',notch:'',sex:'Female',weight:'',state:'Alive'}],unidentified:6,pigletQuery:'',pigletSelected:[],pigletDraft:null,pigletEditIndex:-1,fosterDraft:{direction:'out',target:'000392',count:1},mortalityDraft:{cause:'',unidentified:0,photos:[]},countDraft:9,countReason:'',events:[{text:'Crushed 3 → 2',day:'Aug 26',time:'08:20',who:'G. Hansen',kind:'correction'},{text:'+3 crushed · +1 other',day:'Aug 26',time:'08:12',who:'G. Hansen'},{text:'+5 alive',day:'Aug 26',time:'07:52',who:'G. Hansen'},{text:'+1 stillborn · +1 mummified',day:'Aug 26',time:'07:30',who:'G. Hansen'}]};
 if(preset==='room')s.view='room';
 if(/^search-/.test(preset))s.view='roomSearch';
 if(/^scan-/.test(preset)&&preset!=='scan-read')s.view=preset==='scan-pig'?'roomPig':'roomScan';   // scan-read: her drawer (the default view) over Scan
 if(preset.startsWith('task-'))s.view='roomEndTask';
 if(preset.startsWith('batch-'))s.view=preset==='batch-sheet'?'roomBatch':preset==='batch-form'?'roomBatchForm':preset==='batch-saved'?'room':'roomBatchPick';
 if(preset==='before'){Object.assign(s,{alive:0,dead:[0,0,0,0,0,0],anchor:0,pending:0,weak:0,deformed:0,tag:'000455',pen:'B4',events:[],stamp:'',parity:2});}
 if(preset==='finish')s.view='finish';
 if(preset==='draft'){s.deathDraft[2]=1;s.view='death';}
 if(preset==='leave'){s.edit=snap(s);s.edit.dead[2]+=1;s.back='count';s.view='edit';s.popup={kind:'leaveEdit'};}
 if(['locked','history','ended','allocate','born'].includes(preset)){Object.assign(s,{locked:true,view:'locked',alive:8,dead:[1,1,3,0,0,1],pending:0,weight:'12.6',assisted:true});s.events.unshift({text:'+4 alive',day:'Aug 26',time:'08:41',who:'G. Hansen'},{text:'Farrowing finished · born 14',day:'Aug 27',time:'08:12',who:'G. Hansen',kind:'milestone'});s.events=s.events.slice(0,2).reverse().concat(s.events.slice(2));s.events.unshift({text:'+1 crushed',day:'Aug 28',time:'14:02',who:'L. Madsen'});}
 if(preset==='ended'||preset==='allocate'){s.ended=true;s.deathStage='during';s.frozen=10;s.alive=7;s.dead=[2,0,1,0,0,0];s.sowCause='Prolapse';s.events=[{text:'Sow died · prolapse',day:'Aug 25',time:'06:20',who:'L. Madsen',kind:'danger'},{text:'7 alive · 3 dead',day:'Aug 25',time:'06:18',who:'L. Madsen'}];if(preset==='allocate')Object.assign(s,{tag:'000399',pen:'B3',parity:4,view:'allocate',back:'locked'});}
 if(preset==='history'){s.view='history';s.back='locked';}
 if(preset==='edit'||preset==='born'){enterEdit(s);if(preset==='born')s.popup={kind:'born',mode:'more',n:1,split:'alive',cause:5};}
 return s;
}
const born=s=>s.locked?s.frozen:s.alive+sum(s.dead)+(s.moved||0),floor=s=>Math.max(0,s.anchor-sum(s.dead)-(s.moved||0));
// Which face a row opens: the allocation sheet while piglets wait, the record for an abortion with live piglets, the production log for other outcomes.
const recordView=r=>toAllocate(r)?'allocate':r.productionOutcome==='abortion'&&r.alive>0?'locked':r.productionOutcome?'history':r.locked?'locked':'count';
// A sow whose piglets still need a home (owner decision 2026-10-10): she died and they are neither hand-reared here nor placed elsewhere.
const toAllocate=s=>s.ended&&!s.handReared&&s.alive>0?s.alive:0;
// She leaves the room list once nothing is left to look after: no live piglet on her record (placed on other sows, in a rearing pen, or recorded dead).
const leftTask=r=>(!!r.ended||r.productionOutcome==='abortion')&&r.alive<=0;
const onList=r=>!leftTask(r);
const snap=s=>({alive:s.alive,dead:[...s.dead],born:born(s),weak:s.weak,deformed:s.deformed,weight:s.weight,assisted:s.assisted});
// A death draft is kept on the device (the tab's session storage) so a restart finds it again (contract C5). One key per sow and fixture.
const draftKey=s=>'farrowing-draft:'+(s.preset||'')+':'+s.tag;
function persistDraft(s){try{if(sum(s.deathDraft)>0||(!s.ended&&s.sowCause))sessionStorage.setItem(draftKey(s),JSON.stringify({deathDraft:s.deathDraft,sowCause:s.sowCause||'',sowNote:s.sowNote||'',mode:s.mode}));else sessionStorage.removeItem(draftKey(s));}catch(e){/* private window: the draft stays in the page */}}
function restoreDraft(s){try{const d=JSON.parse(sessionStorage.getItem(draftKey(s))||'null');if(d&&Array.isArray(d.deathDraft)&&d.deathDraft.length===s.deathDraft.length){s.deathDraft=d.deathDraft;s.sowCause=d.sowCause||'';s.sowNote=d.sowNote||'';if(d.mode)s.mode=d.mode;}}catch(e){/* nothing kept */}}
function changes(s){if(!s.edit)return[];const a=snap(s),b=s.edit;let out=[];for(const k of s.locked?['born','weak','deformed','weight','assisted']:['alive'])if(String(a[k])!==String(b[k]))out.push(`${k==='born'?'Born':k==='alive'?'Alive':k==='weight'?'Litter weight':k==='assisted'?'Assisted':k[0].toUpperCase()+k.slice(1)} ${k==='assisted'?assistanceLabel(a[k]):(a[k]||0)} → ${k==='assisted'?assistanceLabel(b[k]):(b[k]||0)}`);types.forEach((t,i)=>{if(a.dead[i]!==b.dead[i])out.push(`${t} ${a.dead[i]} → ${b.dead[i]}`)});return out;}
const hasDraft=s=>sum(s.deathDraft)>0||(!s.ended&&s.sowCause)||changes(s).length>0;
function event(s,text,kind='',photos=[]){s.events.unshift({text,kind,day:'Today',time:'09:41',who:'G. Hansen',photos:[...photos]});s.stamp='09:41';}
function fold(s){if(s.pending){event(s,s.pending>0?`+${s.pending} alive`:`${-s.pending} died this visit`);s.pending=0;}s.anchor=born(s);}
function enterEdit(s){s.back=s.view==='finish'?'finish':s.locked?'locked':'count';if(!s.edit)s.edit=snap(s);s.view='edit';}
// The litter weight is typed on the phone's own decimal keyboard; on save or finish it is normalised to one decimal place,
// and an empty value or 0 is "not recorded".
const normWeight=w=>{const c=SentriUI.numpadCommit(String(w??'').trim(),{decimals:1});return c==null||+c===0?'':c;};
// The weight is typed on the system decimal keyboard: a comma (some locales) becomes a point, only digits and one point stay,
// at most 2 whole digits and 1 decimal (the limits the Numpad keeps elsewhere).
const cleanWeight=v=>{let t=String(v).replace(/,/g,'.').replace(/[^0-9.]/g,'');const p=t.indexOf('.');if(p>=0)t=t.slice(0,p+1)+t.slice(p+1).replace(/\./g,'');let [w,d]=t.split('.');w=(w||'').slice(0,2);return d===undefined?w:(w||'0')+'.'+d.slice(0,1);};
function act(s,a,v){
 if(['back','close','dismiss'].includes(a)&&s.popup?.kind==='born'){s.popup=null;return;}
 if(['back','close','dismiss'].includes(a)&&s.view==='edit'&&s.edit&&changes(s).length){s.popup={kind:'leaveEdit'};return;}
 if(a==='leaveDiscard'){s.popup=null;s.edit=null;s.view=s.back||'count';return;}
 if(a==='leaveSave'){s.popup=null;act(s,'saveEdit');return;}
 if(a==='alive'){const n=Number(v);if(n<0&&s.alive<=floor(s)){s.pointers=true;return;}s.alive=Math.max(floor(s),s.alive+n);s.pending+=n;s.stamp='09:41';s.pointers=false;}
 if(a==='close'){if(s.view==='count')fold(s);s.view=s.view==='roomEndTask'?'roomOverview':s.view==='roomTaskSows'?'roomEndTask':s.view==='roomTaskReceipt'?'roomHome':penParent(s.view);}
 if(a==='open')s.view=s.locked?'locked':'count';
 if(a==='back'){s.popup=null;s.view=s.view==='editFinish'?'edit':['history','profile','deathBreakdown'].includes(s.view)?s.pageBack||s.back||'count':s.back||'count';}
 if(a==='finish'){s.pointers=false;s.view='finish';}
 if(a==='death'){s.back=s.view==='finish'?'finish':s.locked?'locked':'count';if(s.ended)s.mode='piglets';s.view='death';}
 if(a==='mode')s.mode=v;
 if(a==='deadStep'){const [i,n]=v.split(',').map(Number);if(s.locked&&n>0&&sum(s.deathDraft)>=s.alive)return;s.deathDraft[i]=Math.max(0,s.deathDraft[i]+n);}
 if(a==='clearDeath'){s.deathDraft.fill(0);if(!s.ended){s.sowCause='';s.sowNote='';}s.photos=[];}
 if(a==='saveDeath'){if(s.mode==='sow'){if(!s.sowCause||s.ended||sum(s.deathDraft)||changes(s).length)return;s.deathStage=s.locked?'after':born(s)>0?'during':'before';fold(s);s.frozen=born(s);s.locked=true;s.ended=true;event(s,`Sow died · ${s.sowCause.toLowerCase()}${s.sowNote?' · '+s.sowNote:''}`,'danger',s.photos);s.deathDraft.fill(0);s.photos=[];s.view=toAllocate(s)?'allocate':'locked';return;}const n=sum(s.deathDraft);if(!n||(s.locked&&n>s.alive))return;const line=s.deathDraft.map((x,i)=>x?`+${x} ${types[i].toLowerCase()}`:'').filter(Boolean).join(' · ');s.dead=s.dead.map((x,i)=>x+s.deathDraft[i]);if(s.locked)s.alive=s.frozen-sum(s.dead)-(s.moved||0);event(s,line,'',s.photos);s.deathDraft.fill(0);s.photos=[];s.view=s.back;}
 if(a==='edit')enterEdit(s);
 if(a==='editStep'){const [k,i,n]=v.split(',');if(k==='dead'){const next=Math.max(0,s.edit.dead[+i]+(+n));if(s.locked&&sum(s.edit.dead)-s.edit.dead[+i]+next>s.edit.born)return;s.edit.dead[+i]=next;}else{let next=Math.max(0,s.edit[k]+(+n));const live=s.locked?Math.max(0,s.finishAlive+s.edit.born-s.frozen):s.edit.alive;if(['weak','deformed'].includes(k)&&next+s.edit[k==='weak'?'deformed':'weak']>live)return;s.edit[k]=next;} }
 if(a==='clearEdit'){s.edit=snap(s);}
 if(a==='saveEdit'){s.edit.weight=normWeight(s.edit.weight);const lines=changes(s);if(!lines.length)return;fold(s);const e=s.edit;s.dead=[...e.dead];if(s.locked){s.frozen=e.born;s.alive=s.frozen-sum(s.dead)-(s.moved||0);s.weak=e.weak;s.deformed=e.deformed;s.weight=e.weight;s.assisted=e.assisted;}else s.alive=e.alive;s.anchor=born(s);event(s,lines.join(' · '),'correction');s.edit=null;s.view=s.back==='finish'?'finish':s.locked?'locked':'count';}
 if(a==='expand')s.view='editFinish';
 if(a==='editCounts')s.view='edit';
 if(a==='assistance'||a==='editAssistance')(a==='editAssistance'?s.edit:s).assisted=v==='true';
 if(a==='classify'){const [k,n]=v.split(',');const next=Math.max(0,s[k]+(+n));if(next+s[k==='weak'?'deformed':'weak']<=s.alive)s[k]=next;}
 if(a==='lock'){s.weight=normWeight(s.weight);if(hasDraft(s)||!born(s))return;fold(s);s.frozen=born(s);s.finishAlive=s.alive;s.locked=true;s.finished='Today · 09:41';event(s,`Farrowing finished · born ${s.frozen}`,'milestone');s.view='locked';}
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
 if(a==='mortalityPhoto')s.photoOrigin={action:a,index:Number(v)};
 if(a==='mortalityPhoto')s.popup={kind:'photo',src:s.mortalityDraft.photos[Number(v)],index:Number(v),editable:true,mortality:true};
 if(a==='photo')s.photoOrigin={action:a,index:Number(v)};
 if(a==='photo')s.popup={kind:'photo',src:s.photos[Number(v)],index:Number(v),editable:true};
 if(a==='deletePhoto'){const list=s.popup.mortality?s.mortalityDraft.photos:s.photos;list.splice(s.popup.index,1);s.photoOrigin={action:'addPhoto',index:'photos'};s.popup=null;}
 if(a==='lens')s.lens=v;
 if(a==='marker'){if(s.markerDraft==null)s.markerDraft=s.markers[0]?.text||'';s.view='marker';} // Back keeps the draft (drawer law): reopening finds it
 if(a==='saveMarker'){const text=(s.markerDraft??s.markers[0]?.text??'').trim();if(!text)return;s.markers=[{text,meta:'Today · 09:41 · G.H'}];event(s,'Note updated · '+text,'milestone');s.markerDraft=null;if(s.scanReturn){s.scanReturn=false;s.actionsEntry=false;s.view=s.pageBack||'roomScan';}else{s.actionsEntry=true;s.view='profile';}}
 if(a==='piglets'){s.pigletSelected=[];s.view='pigletCare';}
 if(a==='pigletTab')s.pigletTab=v;
 if(a==='processingTask'){const task=s.processingTasks.find(x=>x.id===v);if(task){task.done=!task.done;task.meta=task.done?'This visit · G.H':task.id==='health'?'In 2 days':'Due today';s.processingDirty=true;}}
 if(a==='saveProcessing'){if(!s.processingDirty)return;const done=s.processingTasks.filter(x=>x.done).length;event(s,`Piglet processing updated · ${done} of ${s.processingTasks.length} items done`);s.processingDirty=false;s.actionsEntry=true;s.view='profile';}
 if(a==='togglePiglet'){s.pigletSelected=s.pigletSelected.includes(v)?s.pigletSelected.filter(x=>x!==v):[...s.pigletSelected,v];}
 if(a==='editPiglet'){const index=Number(v),p=s.piglets[index];if(!p)return;s.pigletEditIndex=index;s.pigletDraft={...p};s.view='pigletEdit';}
 if(a==='addPiglet'||a==='scanPiglet'||a==='notchPiglet'){s.pigletEditIndex=-1;s.pigletDraft={tag:a==='scanPiglet'?String(418001+s.piglets.length):'',notch:a==='notchPiglet'?'Choose notch':'',sex:'',weight:'',state:'Alive'};s.view='pigletEdit';}
 if(a==='savePiglet'){const p=s.pigletDraft;if(!p||![p.tag,p.notch,p.sex,p.weight].some(x=>String(x||'').trim()))return;const clean={tag:String(p.tag||'').trim(),notch:p.notch==='Choose notch'?'':String(p.notch||'').trim(),sex:p.sex||'',weight:String(p.weight||'').trim(),state:p.state||'Alive'};if(s.pigletEditIndex<0){s.piglets.push(clean);s.unidentified=Math.max(0,s.unidentified-1);}else s.piglets[s.pigletEditIndex]=clean;event(s,`${s.pigletEditIndex<0?'Piglet identity added':'Piglet identity updated'} · ${clean.tag||clean.notch||'identity pending'}`);s.pigletTab='records';s.view='pigletCare';}
 if(a==='foster'){s.featureReturn=s.view==='pigletCare'?'pigletCare':'profile';const candidate=roomContext(s).units.flatMap(u=>u.records).find(r=>r!==s&&!r.ended&&!r.productionOutcome&&born(r)>0);s.fosterDraft={direction:'out',target:candidate?.tag||'',count:1};s.view='foster';}
 if(a==='allocMove'){const candidate=fosterCandidates(s)[0];s.featureReturn='allocate';s.fosterDraft={direction:'out',target:candidate?.tag||'',count:s.alive};s.view='foster';}
 if(a==='allocHand'){const n=s.alive;s.handReared={at:'09:41',who:'G.H'};event(s,`${n} piglet${n===1?'':'s'} hand-reared in her crate`,'milestone');s.view='room';}
 if(a==='allocRear'&&farmConfig.rearingPen){const n=s.alive;s.alive=0;s.moved=(s.moved||0)+n;s.unidentified=0;s.anchor=born(s);event(s,`${n} piglet${n===1?'':'s'} moved to the rearing pen`,'milestone');s.view='room';}
 if(a==='fosterDirection'){s.fosterDraft.direction=v;s.fosterDraft.count=1;}
 if(a==='fosterTarget')s.fosterDraft.target=v;
 if(a==='fosterCount'){const max=s.fosterDraft.direction==='out'?s.alive:20;s.fosterDraft.count=Math.max(1,Math.min(max,s.fosterDraft.count+Number(v)));}
 if(a==='saveFoster'){const f=s.fosterDraft;if(!f.target||f.count<1||(f.direction==='out'&&f.count>s.alive))return;if(f.direction==='out'){s.alive-=f.count;s.moved=(s.moved||0)+f.count;s.unidentified=Math.max(0,s.unidentified-f.count);}else{s.alive+=f.count;s.moved=(s.moved||0)-f.count;s.unidentified+=f.count;}s.anchor=born(s);event(s,`${f.count} piglet${f.count===1?'':'s'} fostered ${f.direction==='out'?'to':'from'} ${f.target}`,'milestone');if(s.featureReturn==='allocate'){s.view=toAllocate(s)?'allocate':'room';}else if(s.featureReturn==='pigletCare'){s.pigletTab='records';s.view='pigletCare';}else{s.actionsEntry=true;s.view='profile';}}
 if(a==='openMortality'){if(!s.pigletSelected.length&&!s.unidentified)return;s.mortalityDraft={cause:'',unidentified:0,photos:[]};s.view='pigletDeath';}
 if(a==='mortalityCount'){const max=Math.min(s.unidentified,s.alive-s.pigletSelected.length);s.mortalityDraft.unidentified=Math.max(0,Math.min(max,s.mortalityDraft.unidentified+Number(v)));}
 if(a==='savePigletMortality'){const f=s.mortalityDraft,total=s.pigletSelected.length+f.unidentified;if(!f.cause||!total)return;const selected=new Set(s.pigletSelected);s.piglets.forEach(p=>{if(selected.has(p.tag))p.state='Dead';});s.unidentified=Math.max(0,s.unidentified-f.unidentified);s.alive=Math.max(0,s.alive-total);const typeIndex={Stillborn:0,Mummified:1,Crushed:2,Scours:3,'Starve-out':4,Other:5,'Cause unknown':5}[f.cause]??5;s.dead[typeIndex]+=total;s.frozen=Math.max(s.frozen,born(s));event(s,`${total} piglet${total===1?'':'s'} died · ${f.cause.toLowerCase()}`,'danger',f.photos);s.pigletSelected=[];s.pigletTab='records';s.view='pigletCare';}
 if(a==='countReconcile'){s.countDraft=s.alive;s.countReason='';s.view='countReconcile';}
 if(a==='countReconcileStep'){const identified=s.piglets.filter(p=>p.state==='Alive').length;s.countDraft=Math.max(identified,Math.min(30,s.countDraft+Number(v)));}
 if(a==='saveCountReconcile'){if(s.countDraft===s.alive||!s.countReason.trim())return;const before=s.alive,diff=s.countDraft-before;s.alive=s.countDraft;s.unidentified=Math.max(0,s.unidentified+diff);s.anchor=born(s);if(s.locked)s.frozen=Math.max(s.frozen,born(s));event(s,`Piglet count corrected · ${before} → ${s.alive} · ${s.countReason.trim()}`,'correction');s.actionsEntry=true;s.view='profile';}
 if(a==='featureBack'){if(s.view==='foster'&&s.featureReturn==='allocate'){s.view='allocate';}else if(['pigletEdit','pigletDeath'].includes(s.view)||s.view==='foster'&&s.featureReturn==='pigletCare'){s.pigletTab='records';s.view='pigletCare';}else if(s.scanReturn){s.scanReturn=false;s.actionsEntry=false;s.view=s.pageBack||'roomScan';}else{s.actionsEntry=true;s.view='profile';}}   // opened from Scan's Actions: Back returns to the scan list
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
 const abortions=rows.filter(x=>x.record.productionOutcome==='abortion'),notInPig=rows.filter(x=>x.record.productionOutcome==='not-in-pig'),removed=rows.filter(x=>x.record.productionOutcome==='removed');
 const regular=rows.filter(x=>!['abortion','not-in-pig','removed'].includes(x.record.productionOutcome));
 const left=rows.filter(x=>leftTask(x.record));
 const active=regular.filter(x=>!x.record.locked&&!x.record.ended&&born(x.record)>0),awaiting=regular.filter(x=>!x.record.locked&&!x.record.ended&&!born(x.record));
 const finished=regular.filter(x=>x.record.locked&&!x.record.ended),ended=regular.filter(x=>x.record.ended),drafts=rows.filter(x=>hasDraft(x.record));
 const completedLitters=regular.filter(x=>x.record.locked&&(!x.record.ended||x.record.deathStage==='after'));
 const totals={born:sum(completedLitters.map(x=>born(x.record))),alive:sum(completedLitters.map(x=>x.record.alive)),dead:sum(completedLitters.map(x=>sum(x.record.dead))),stillborn:sum(completedLitters.map(x=>x.record.dead[0])),mummified:sum(completedLitters.map(x=>x.record.dead[1]))};
 const performance={...totals,litters:completedLitters.length,bornAlivePerLitter:completedLitters.length?(totals.born-totals.stillborn-totals.mummified)/completedLitters.length:null,stillbornRate:totals.born?100*totals.stillborn/totals.born:null,target:c.bornAliveTarget??null};
 return {rows,active,awaiting,finished,ended,abortions,left,notInPig,removed,performance,drafts,blocked:!!active.length};
}
function closeTask(c,at=new Date().toISOString()){
 if(c.completion)return false;
 const review=taskClosureReview(c);if(review.blocked)return false;
 // A task closure receipt, not a frozen copy of the animals' live records.
 c.completion={early:review.awaiting.length>0,at,who:'G. Hansen',total:review.rows.length,finished:review.finished.length,removed:review.awaiting.length+review.removed.length,ended:review.ended.length,abortions:review.abortions.length,notInPig:review.notInPig.length,performance:review.performance};
 review.awaiting.forEach(({record})=>{record.taskDisposition='removed-at-close';});
 review.finished.forEach(({record})=>{fold(record);record.taskDisposition='retained';});
 return true;
}
globalThis.FarrowingStudy={seed,act,cleanWeight,normWeight,born,floor,changes,hasDraft,penLogEvents,taskClosureReview,closeTask,sowActionCatalogue,toAllocate,leftTask,config:farmConfig};
if(typeof document==='undefined')return;
// The atlas follows the demo (?screen=): which of the feature's screens this state is. Null when no screen is that state.
function atlasScreen(s,c){
 const v=s.view;
 if(!/^room/.test(v)&&c.returnToTaskReview==='roomScan')return 'farrowing.scan-read';   // a sow the reader opened, over Scan
 if(v==='room')return 'farrowing.room';
 if(v==='count')return born(s)?'farrowing.count':'farrowing.before';
 if(v==='death')return 'farrowing.death';
 if(v==='finish')return 'farrowing.finish';
 if(v==='locked')return s.ended?'farrowing.ended':'farrowing.locked';
 if(v==='edit')return s.popup?.kind==='born'?'farrowing.born':s.popup?.kind==='leaveEdit'?'farrowing.leave-edit':s.locked||s.ended?'farrowing.edit-finished':'farrowing.edit';
 if(v==='history')return 'farrowing.history';
 if(v==='foster')return 'farrowing.foster';
 if(v==='allocate')return 'farrowing.allocate';
 if(v==='countReconcile')return 'farrowing.reconcile';
 if(v==='roomOverview')return 'farrowing.overview';
 if(v==='roomTaskReceipt')return 'farrowing.task-receipt';
 if(v==='editFinish')return 'farrowing.edit-finished';
 if(v==='roomEndTask'){const r=taskClosureReview(c);return r.blocked?'farrowing.task-blocked':r.awaiting.length?'farrowing.task-ready':r.abortions.length?'farrowing.task-outcomes':'farrowing.task-complete';}
 if(v==='roomSearch'){const f=findHits(c);return !f?'farrowing.search':f.hits.length?'farrowing.search-results':'farrowing.search-none';}
 if(v==='roomScan'){const sc=c.scan;return !sc.connected?'farrowing.scan-no-reader':!sc.listening?'farrowing.scan-stopped':'farrowing.scan';}
 if(v==='roomPig')return 'farrowing.pig-not-in-task';
 if(v==='roomBatch')return 'farrowing.batch';
 if(v==='roomBatchPick'){const b=c.batch||{};return b.filtering?'farrowing.batch-filter':b.outside?'farrowing.batch-outside':b.scanning==='waiting'?'farrowing.batch-waiting':b.scanning?'farrowing.batch-scanning':b.q?'farrowing.batch-search':b.picked?.length?'farrowing.batch-pick':'farrowing.batch-pick-none';}
 if(v==='roomBatchForm')return 'farrowing.batch-form';
 const more={roomFilter:'filter',roomGrid:'pen-map',roomPenDetail:'pen',roomPenLog:'pen-log',roomPenNote:'pen-note',roomPenReadNote:'pen-read-note',roomPenFeed:'pen-feed',roomPenFault:'pen-fault',roomPenFaultRecord:'pen-fault-record',roomTaskSows:'task-sows',roomHome:'today',deathBreakdown:'death-breakdown',marker:'note',pigletCare:'piglet-care',pigletEdit:'piglet-identity',pigletDeath:'piglet-death'};
 if(more[v])return 'farrowing.'+more[v];
 if(v==='profile'&&s.actionsEntry)return 'farrowing.sow-actions';
 return null;
}
const presets=[['room','Room list'],['count','Counting'],['before','Before first count'],['draft','Death entry'],['finish','Finish'],['leave','Leave edit with changes'],['locked','Locked record'],['edit','Edit counts'],['born','Correct born'],['history','Farrowing log'],['ended','Sow died'],['allocate','Sow died · allocate piglets'],['task-blocked','End task · active sows'],['task-ready','End task · awaiting sows'],['task-complete','End task · all finished'],['task-outcomes','End task · production outcomes'],['foster','Foster piglets'],['reconcile','Reconcile piglet count'],['search-empty','Find a sow'],['search-results','Find a sow · results'],['search-none','Find a sow · no match'],['scan-none','Scan · reader not connected'],['scan-empty','Scan · listening'],['scan-read','Scan · her drawer opened'],['scan-pig','Scan · a pig not in Farrowing'],['scan-stopped','Scan · stopped'],['batch-sheet','Actions · pigs in this unit'],['batch-none','Choose pigs · none yet'],['batch-pick','Choose pigs · 3 chosen'],['batch-search','Choose pigs · search'],['batch-filter','Choose pigs · filter'],['batch-scanning','Choose pigs · scanning'],['batch-waiting','Choose pigs · waiting for the reader'],['batch-outside','Choose pigs · a pig from another unit'],['batch-form','Actions · the form'],['batch-saved','Actions · saved']];
const cards=[{title:'Find the next sow',caption:'<strong>The room, in context.</strong> Filter by state, jump to a pen, and open each sow’s live record.',initial:'room'},{title:'Finish with confidence',caption:'<strong>Two observations, then the lock.</strong> Clear rows, optional details and a deliberate final action.',initial:'finish'},{title:'Read the whole litter',caption:'<strong>Current facts, with their context.</strong> Finish details stay readable; the history opens on its own page.',initial:'locked'}];
const states=cards.map(c=>{const r=seed(c.initial);restoreDraft(r);return r;});
// Scenario gate hook (scripts/run-scenarios.mjs): read-only access to the live records for record assertions. Draws nothing.
Object.assign(globalThis.FarrowingStudy,{states,room:i=>roomContext(states[i])});
const reminderTimers=[];
const disabled=b=>b?' disabled':'';
const btn=(a,label,cls='button',v='',off=false)=>{
 if(cls==='dock-search')return SentriUI.iconButton({action:a,value:v,icon:roomIcon('search'),label:'Search ear tag'});
 if(cls.split(' ').includes('button')||cls==='text-button'||cls==='clear-answer'||cls==='finish-clear-answer'||cls.includes('record-toolbar-action'))return SentriUI.button({label:'',register:cls.includes('record-toolbar-action')?'tool':cls.includes('task-end-early')?'caution':cls.includes('danger')?'danger':cls.includes('primary')?'primary':cls==='text-button'||cls==='clear-answer'||cls==='finish-clear-answer'?'text':'secondary',action:a,value:v,disabled:off,className:cls.includes('record-toolbar-action')?'':cls.split(' ').filter(x=>x!=='button'&&x!=='primary').join(' ')}).replace('<span class="st-button-label"></span>',label);
 return `<button type="button" class="${cls}" data-action="${a}" data-value="${esc(v)}"${disabled(off)}>${label}</button>`;
};
const status=()=>`<div class="statusbar"><span>9:41</span><span class="status-icons">${icon('signal')}${icon('battery')}</span></div>`;
function causes(dead){return `<div class="causes">${dead.map((n,i)=>n?`<span>${types[i]} <b>${n}</b></span>`:'').join('')||'<span>No deaths recorded</span>'}</div>`;}
/* Born · Alive · Dead: Facts, figures. The one exception is the finished litter's Dead, which carries a door to the death breakdown; Facts never act, so that call keeps this own markup (open question: where the door lives). */
function metrics(items,{panel=true}={}){return SentriUI.facts(items.map(([label,value])=>({label,value})),{variant:'figures',panel});}
function summary(s){return SentriUI.panel(metrics([['Born',born(s)],[s.locked?'Alive now':'Alive',s.alive],['Dead',sum(s.dead)]],{panel:false})+causes(s.dead),{className:'summary facts-surface'});}
function recordStamp(s){
 if(!s.locked)return '';
 const event=s.events.find(e=>e.text.startsWith(s.ended?'Sow died':'Farrowing finished'));
 const when=s.ended?[event?.day,event?.time].filter(Boolean).join(' · '):s.finished;
 const date=when.replace(/^Today/, 'today').replace(' · ', ' at ');
 return `Finished ${date}${event?.who?' by '+initials(event.who):''}`;
}
// When and who, said once on the ended record: "Aug 25 06:20 · L.M".
function diedStamp(s){const e=s.events.find(e=>e.text.startsWith('Sow died'));return e?[[e.day,e.time].filter(Boolean).join(' '),initials(e.who)].filter(Boolean):[];}
// Her pen; "Unit 6 · A2" when she is in another unit than the room's, so it is clear she is elsewhere.
function sowPlace(s){const c=roomContext(s),own=c.units.find(u=>u.records.includes(s));return own&&own!==c.unit?own.name+' · '+s.pen:s.pen;}
function identity(s){
 // Headers (owner, 2026-10-13; features/farrowing/budget.md ## Headers): the sow's record drawer is the hub and carries the route line, her
 // chip and the two facts that tell her apart at farrowing (her pen, her parity). Actions launched from it carry no line: it is one Back away.
 const route=(facts)=>({chip:{id:s.tag,action:'profile',label:'View sow '+s.tag+' details'},facts});
 if(s.view==='allocate')return {surface:'menu',title:'Allocate piglets',close:false,label:'Allocate piglets'};
 if(s.view==='finish')return {title:'Finish farrowing',close:{action:'dismiss',label:'Close finish drawer'}};
 if(s.view==='death')return {title:'Record dead',close:false};
 if(['edit','editFinish'].includes(s.view))return {title:s.view==='editFinish'?'Edit finish details':'Edit record',close:false};
 return {title:'Farrowing record',line:route([sowPlace(s),'Parity '+s.parity]),close:{action:'dismiss',label:'Close sow drawer'},label:'Sow '+s.tag};
}
function farmStepper(props,prefix=''){return SentriUI.stepper(props).replace(/data-value="[^"]*" data-step="(-?\d+)"/g,(_,d)=>`data-value="${prefix}${d}" data-step="${d}"`);}
function row(label,val,action,value,min=false,max=false,cls='',draftStatus='',was){const isWas=was!==undefined&&was!==null&&was!==val;return farmStepper({label,value:val,action,key:value,min:typeof min==='number'?min:min?val:0,max:typeof max==='number'?max:max?val:null,draft:cls.includes('draft')||isWas,status:isWas?'was '+was:draftStatus,strs:!isWas&&draftStatus?{status:'ds.stepper.draft'}:undefined,args:!isWas&&draftStatus?{status:{n:draftStatus.match(/\d+/)?.[0]||'1'}}:undefined,reserveHint:false},value);}

/* The finish form, shared by Finish farrowing and Edit finish details: one flat list of 60px rows, every control in the Stepper's 136px right column.
   Assisted is a required No / Yes (No on a new finish; a record that never had it shows neither key chosen); the litter weight is optional,
   a Measure row typed on the phone's own decimal keyboard (Done closes it). */
const conditionHeading=()=>SentriUI.heading({kind:'section',level:3,title:'Piglet condition',icon:icon('health')});
function finishDetails(s,editing){
 const x=editing?s.edit:s,key=editing?'editWeight':'weight',name=editing?'editAssistance':'assistance';
 return SentriUI.choiceRadios({label:'Assisted',layout:'inline',face:'key',key:name,action:name,selected:x.assisted==null?'':String(x.assisted),options:[{value:'false',label:'No'},{value:'true',label:'Yes'}]})
  +SentriUI.measure({label:'Litter weight',optional:'Optional',layout:'row',input:'system',unit:'kg',value:x.weight,key,inputAttrs:`data-field="weight" data-edit="${editing}" aria-label="Litter weight in kilograms, optional"`});
}
const footer=(left,right,className='')=>SentriUI.sheetFooter({content:left+(right||''),className});
// Reset and Clear are quiet text in the footer, left of the primary (Headers law, 2026-10-13): never in a header.
/* Clear (or Reset) is the sheet header's corner action, top right (owner, 2026-10-14), passed only while there is something to clear. */
const cornerClear=(action,label='Clear')=>({label:{text:label,str:label==='Reset'?'act.reset':'act.clear'},action});
// A page's footer has no Back (Back is in its page header); a footer left with nothing is removed.
const pageFooter=(right,className='')=>right?footer('',right,className):false;
// What a header no longer carries and the worker still needs (a status, a stamp, a count) opens the body as its quiet group label:
// 13px muted, over the card it belongs to (the Heading's group kind), never a louder line than the subtitle it replaced.
const bodyLead=text=>SentriUI.heading({title:text,kind:'group',level:4,className:'body-lead'});
function hold(action,label,off=false,danger=false){
 return SentriUI.holdButton({action,label,tone:danger?'danger':'primary',waiting:off,className:action==='room-end-confirm'&&danger?'task-end-confirm':'',caption:'HOLD TO '+(action==='lock'?'FINISH':action==='room-end-confirm'?(label==='End task'?'END':'END EARLY'):'RECORD')});
}
/* The finished litter, read-only: Facts, three across. The death breakdown is one link below, not a button in a fact. */
function finishFacts(s){
 const dead=sum(s.dead);
 const items=[['Weak',s.weak],['Deformed',s.deformed],['Assisted',assistanceLabel(s.assisted)],['Litter weight',s.weight?s.weight+' kg':null]].map(([label,value])=>({label,value,...(label==='Litter weight'?{inline:true}:{})}));
 // the figures read (Facts never acts); the death causes are a door of their own under them, only when there are deaths (owner, 2026-10-22)
 const door=dead>0?SentriUI.rowGroup(SentriUI.row({title:'Death causes',action:'deathBreakdown',trail:'chevron'}),{className:'death-causes-door'}):'';
 return SentriUI.panel(SentriUI.facts([{label:'Born',value:born(s)},{label:'Alive now',value:s.alive},{label:'Dead',value:dead}],{variant:'figures',panel:false})+SentriUI.facts(items,{columns:3,variant:'record'}),{className:'facts-surface'})+door;
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
function visibleRoomRecords(c,f=c.filter){return c.listed.filter(r=>matchesRoomFilter(r,f)&&(c.lens==='All'||roomState(r)===c.lens));}
const roomIcon=k=>SentriIcons.icon(k);
const roomState=r=>r.productionOutcome||r.locked?'Done':born(r)>0?'Active':'Awaiting';
// Separate sample records for each task unit; references survive unit navigation.
// named: a few sows with a fixed ear tag, so Find a sow and Scan have real tags to find in the other units (record index → tag).
function sampleUnit(id,awaiting,active,done,named={}){
 const records=[];
 for(const [preset,n] of [['count',active],['before',awaiting],['locked',done]])for(let j=0;j<n;j++){
  const r=seed(preset),index=records.length;
  Object.assign(r,{tag:named[index]||String(Number(id)*100+index+1).padStart(6,'0'),pen:(id==='6'?'A':'C')+(Math.floor(index/2)+1),parity:2+index%5,lastBorn:10+index%4,view:'room'});
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
  c.query='';c.jump=null;c.highlightPen=null;c.highlightUntil=0;
 }
 return next.records[0];
}
function roomContext(s){
 const i=states.indexOf(s);if(roomContexts[i])return roomContexts[i];
 const fixtures=[['count','000418','B1',3,11,'Due today · day 114'],['before','000392','B2',5,11,'Due tomorrow · day 113'],['before','000455','B4',2,12,'Due today · day 114'],['before','000431','B4',6,9,'Overdue · 3 days · day 117'],['before','000467','B4',5,10,'Due in 2 days · day 112'],['locked','000406','B3',4,13,'Due yesterday · day 115'],['ended','000399','B3',4,10,'Due yesterday · day 115']];
 const records=fixtures.map(([p,tag,pen,parity,lastBorn,due])=>{if(s.tag===tag){s.lastBorn=lastBorn;return s;}const r=seed(p);Object.assign(r,{tag,pen,parity,lastBorn,due,view:'room'});if(tag==='000406'){r.alive=11;r.dead=[1,0,1,0,0,0];r.frozen=13;r.finished='Today · 05:58';r.events=[{text:'Farrowing finished · born 13',day:'Today',time:'05:58',who:'G. Hansen',kind:'milestone'}];}return r;});
 if(!records.includes(s))records.unshift(s);
 const context=roomContexts[i]={unitId:'7',bornAliveTarget:12,units:[sampleUnit('6',3,1,4,{2:'004318',6:'000437'}),{id:'7',name:'Unit 7',records,livePerLitter:10},sampleUnit('8',2,0,2,{0:'000943'})],unitPositions:{},get unit(){return this.units.find(u=>u.id===this.unitId)},get records(){return this.unit.records},get listed(){return this.unit.records.filter(onList)},lens:'All',filter:defaultRoomFilter(),filterDraft:defaultRoomFilter(),currentPen:s.pen,scroll:0,query:'',jump:null};
 scanSetup(context,s.preset);
 if(['task-ready','task-complete','task-outcomes'].includes(s.preset))context.units.forEach(u=>u.records.forEach(r=>{
  if(!r.locked&&(born(r)>0||s.preset==='task-complete'))Object.assign(r,{locked:true,frozen:born(r)||12,alive:born(r)?r.alive:12,pending:0,finished:'Today · 09:35'});
 }));
 if(s.preset==='task-outcomes'){
  const record=context.units[0].records.find(r=>!r.locked);Object.assign(record,{productionOutcome:'abortion',locked:true,frozen:0,alive:0,pending:0,events:[{text:'Abortion recorded',day:'Today',time:'08:10',who:'G. Hansen'}]});
 }
 return context;
}
function dueMatches(r,f){if(f.from===-7&&f.to===7)return true;const d=r.due||'';let day=d.startsWith('Due today')?0:d.startsWith('Due tomorrow')?1:d.startsWith('Due yesterday')?-1:d.startsWith('Overdue')?-Number(d.match(/(\d+) days?/)?.[1]||1):d.startsWith('Due in')?Number(d.match(/(\d+) days?/)?.[1]):null;return day!==null&&(f.from===-7||day>=f.from)&&(f.to===7||day<=f.to);}
function roomCounts(records){return Object.fromEntries(roomLenses.map(l=>[l,records.filter(r=>l==='All'||roomState(r)===l).length]));}
// Aggregate the same unfiltered records that each unit opens.
function taskOverview(c){
 const units=c.units.map(u=>{const counts=roomCounts(u.records.filter(onList));return {id:u.id,name:u.name,...counts,ProgressTotal:counts.All,current:u.id===c.unitId};});
 const totals=Object.fromEntries(['Awaiting','Active','Done','ProgressTotal','All'].map(k=>[k,sum(units.map(u=>u[k]))]));return {units,totals};
}
// THE sow row (owner approved 2026-10-12): the room list, Find a sow and Scan results all draw it here, and nowhere else. Two lines each side.
// Left: the ear tag exactly as stored (16px/600 mono, always ink, even for a sow that died) over 13px muted context: Parity on a waiting sow,
// when · who on a recorded one, "Pen B3 · …" in a flat result. Right, right-aligned: the figure (16px) over the state word (13px).
// The level sets the weight and colour. Act now (overdue; sow died with piglets to allocate): red figure, red word, the one "!" icon in a row.
// Live (farrowing): bold figure. Coming up (due today or tomorrow): ink figure, muted word. Settled (done, due in 2+ days, aborted, hand-reared
// piglets): muted. Recorded counts only: alive always, dead only above zero, never born. One quiet chevron, no pencil: the row opens the record.
// Row strings are in the registry (ux/laws/strings.json, fr.*); ?lang=zh draws these rows in Chinese (the rest of the page is English).
const ZH=/[?&]lang=zh(&|$)/.test(globalThis.location?.search||'');
const rowText={
 sowDied:ZH?'母猪死亡':'Sow died',farrowing:ZH?'分娩中':'Farrowing',aborted:ZH?'流产':'Aborted',yesterday:ZH?'昨天':'yesterday',
 dead:n=>ZH?`死亡${n}头`:`${n} dead`,alive:n=>ZH?`存活${n}头`:`${n} alive`,
 parity:n=>ZH?`胎次${n}`:`Parity ${n}`,ago:ZH?'1小时前':'1h ago',justNow:ZH?'刚刚':'just now',
 pen:p=>ZH?`${p}栏`:`Pen ${p}`,allocWord:ZH?'待分配':'to allocate',handWord:ZH?'人工哺育':'hand-reared',
 outcome:o=>ZH?{'not-in-pig':'未怀孕',removed:'已移出批次'}[o]:{'not-in-pig':'Not in pig',removed:'Removed from batch'}[o]
};
// Days to due from her due text: negative when late.
function dueDays(d){const n=Number((d.match(/(\d+)/)||[])[1]);return d.startsWith('Overdue')?-n:d.startsWith('Due yesterday')?-1:d.startsWith('Due tomorrow')?1:d.startsWith('Due today')?0:n;}
// What a sow's row says, once: the ear tag's context line, and the figure and word on the right (the ruling above).
function sowFacts(r){
 const state=roomState(r),dead=sum(r.dead),counts=n=>[rowText.alive(n),dead?rowText.dead(dead):''].filter(Boolean).join(' · ');
 const at=(time,who)=>[time,who].filter(Boolean).join(' · ');
 const diedAt=r.events.find(e=>e.text.startsWith('Sow died')),abortAt=r.events.find(e=>e.text.startsWith('Abortion'));
 let word,figure,level,context='';
 if(r.ended){word=rowText.sowDied;
  if(r.handReared){figure=`${r.alive} ${rowText.handWord}`;level='soon';context=at(r.handReared.at,r.handReared.who);}
  else{figure=`${r.alive} ${rowText.allocWord}`;level='act';context=at(diedAt?.day==='Today'?diedAt.time:rowText.yesterday,initials(diedAt?.who));}}
 else if(r.productionOutcome==='abortion'){word=rowText.aborted;figure=counts(r.alive);level='settled';context=at(abortAt?.time,initials(abortAt?.who||'G. Hansen'));}
 else if(r.productionOutcome){word=rowText.outcome(r.productionOutcome);figure='';level='settled';}
 else if(state==='Awaiting'){const n=dueDays(r.due||'Due today');context=rowText.parity(r.parity);
  if(n<0){word=ZH?'逾期':'Overdue';figure=ZH?`${-n}天`:`${-n} ${-n===1?'day':'days'}`;level='act';}
  else{word=ZH?'待产':'Due';figure=n===0?(ZH?'今天':'Today'):n===1?(ZH?'明天':'Tomorrow'):(ZH?`${n}天后`:`In ${n} days`);level=n<=1?'soon':'settled';}}
 else if(state==='Active'){word=rowText.farrowing;figure=counts(r.alive);level='live';context=at(r.stamp==='09:41'?rowText.justNow:rowText.ago,'G.H');}
 else{word=ZH?'完成':'Done';figure=counts(r.alive);level='settled';context=at(r.finished.split(' · ').at(-1),'G.H');}
 return {word,figure,level,context};
}
// place: a sow in another unit says only where she is ("Unit 6 · Pen A2").
function sowRow(r,{flat=false,where='',place='',action='room-sow',value=r.tag}={}){
 const f=sowFacts(r);let context=f.context;
 if(place)context=place;else if(flat||where)context=[where||rowText.pen(r.pen),context].filter(Boolean).join(' · ');
 return SentriUI.row({variant:'animal',code:r.tag,description:context,right:{kind:'state',figure:f.figure,word:f.word,level:f.level},action,value});
}
function room(s){
 const page=findPage(s);if(page)return page;
 const c=roomContext(s),filtered=c.listed.filter(r=>matchesRoomFilter(r,c.filter)),counts=roomCounts(filtered),allCounts=taskOverview(c).totals,avg=c.unit.livePerLitter;
 const visible=visibleRoomRecords(c);
 const pens=[...new Set(visible.map(r=>r.pen))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 if(!pens.includes(c.currentPen))c.currentPen=pens[0]||'';
 const latest=c.records.some(r=>r.stamp==='09:41')?'09:41':'08:41';
 if(s.view==='roomHome'||c.completion)return roomHome(c);
 return `${status()}${SentriTask.header({title:'Farrowing',back:{action:'room-home'},backLabel:'Back to Today',line:{text:[{text:'Last record '},{text:latest,strong:true},{text:' · G.H'}]}})}<div class="room-scroll" tabindex="-1" role="region" aria-label="${esc(c.unit.name)} farrowing sows"><div class="room-context-strip overview-host">${AstraTaskOverview.render({headingIcons:true,unit:{name:c.unit.name,value:avg,metric:'Live / litter',target:'Target 12',belowTarget:true},task:{value:allCounts.Done,total:allCounts.ProgressTotal,label:'Done',statuses:{farrowed:allCounts.Done,active:allCounts.Active,awaiting:allCounts.Awaiting}}})}</div><div class="room-controls"><div class="room-lensbar">${SentriUI.segment({variant:'two-line-lens',options:roomLenses.map(l=>[l,l,{count:counts[l]}]),active:c.lens,action:'room-lens',ariaLabel:'Farrowing state'})}${SentriUI.iconButton({action:'room-filter',icon:roomIcon('filter'),label:'Filter sows',className:'room-filter-button',badge:roomFilterCount(c.filter)||''})}</div>${roomFilterCount(c.filter)?`<div class="room-filter-summary"><span>${esc(roomFilterLabel(c.filter))}</span>${btn('room-clear-filter','Clear','text-button')}</div>`:''}</div><div class="room-list">${!visible.length?`<div class="room-empty"><strong>No ${c.lens==='All'?'matching':c.lens.toLowerCase()} sows</strong><p>${roomFilterCount(c.filter)?'Adjust the filters to see more task sows.':'Choose another status to see the other task sows in this unit.'}</p></div>`:''}${pens.map(p=>{const all=c.listed.filter(r=>r.pen===p),rows=visible.filter(r=>r.pen===p);return `<section class="st-panel pen-card" data-pen="${p}"><header class="pen-top">${btn('room-pen-detail',`<strong>${p}</strong><small>· ${all.length} ${all.length===1?'sow':'sows'}</small>${icon('chevron')}`,'room-pen-name',p).replace('<button',`<button aria-label="Pen ${p}, ${all.length} ${all.length===1?'sow':'sows'}, view details"`)}${rows.length!==all.length?`<span class="pen-visible-count">${rows.length} shown</span>`:''}</header>${rows.map(r=>sowRow(r)).join('')}</section>`;}).join('')}</div></div>${SentriUI.taskDock({label:'Farrowing tools',place:{action:'room-grid',label:penText.title},primary:{action:'room-scan',label:'Scan',attrs:{'aria-label':'Scan ear tag'}},tools:[{action:'room-search',icon:'search',label:'Search ear tag'},{action:'room-batch',icon:'more',label:'Actions'}]})}`;
}
function roomHome(c){if(c.completion)return `${status()}<div class="room-home"><p class="home-eyebrow">All units</p><h2>Today</h2><p class="home-intro">Ended tasks</p>${btn('room-task-receipt',`<span class="home-task-title">Farrowing ${icon('chevron')}</span><span class="home-task-states">Task ended · ${c.completion.finished} finished</span><span class="home-resume">View receipt</span>`,'home-task')}</div>`;const n=roomCounts(c.listed);return `${status()}<div class="room-home"><p class="home-eyebrow">${esc(c.unit.name)}</p><h2>Today</h2><p class="home-intro">Your work in this unit</p>${btn('room-return',`<span class="home-task-title">Farrowing ${icon('chevron')}</span><span class="home-task-states"><b>${n.Active} active</b> · ${n.Awaiting} awaiting · ${n.Done} done</span><span class="home-resume">Continue from pen ${c.currentPen}</span>`,'home-task')}</div>`;}
function roomSheet(title,body,actions,cls='',surface='',line=null){
 const page=cls.includes('task-overview-sheet')||cls.includes('task-end-sheet')||cls.includes('pen-detail-sheet')||cls.includes('pen-log-sheet')||cls.includes('pen-feed-page');
 const size=cls.includes('pen-note-sheet')?'short':cls==='picker-sheet'||cls.includes('task-end-expanded')||cls==='task-overview-sheet'?'long':'medium';
 return SentriUI.sheet({variant:page?'page':'drawer',surface,title,line,back:{action:'room-back'},body,footer:actions||(page?false:footer(SentriUI.backButton({action:'room-back'}))),className:('room-utility '+cls).trim(),size,label:title,close:{action:'room-back',label:'Close '+title},scrim:{action:'room-back',label:'Dismiss '+title},bar:page?status():''});
}
// Pen map: one PenMap (design-system/components/PenMap). A pen takes the loudest level among the sows the room list shows in it, read from
// sowFacts() like the animal row, so the map and the list say the same thing. A pen whose sows the tab or filter hides is "hidden", not empty.
const penLanes=['A','B','C','D'],penDepth=6;
const penText={title:ZH?'栏位图':'Pen map',back:ZH?'返回':'Back',entrance:ZH?'入口':'Entrance',need:ZH?'需处理':'need you',farrowing:rowText.farrowing.toLowerCase(),
 map:ZH?'栏位':'Pens',jump:ZH?'跳转栏位':'Jump to pens',pen:p=>rowText.pen(p),act:ZH?'需处理':'needs you',live:ZH?'分娩中':'farrowing',plain:ZH?'有母猪':'has sows',empty:ZH?'空栏':'empty',
 hidden:ZH?'没有符合条件的母猪':'no sows match',sows:n=>ZH?`${n}头母猪`:`${n} ${n===1?'sow':'sows'}`};
function penLevels(c){
 const shown=visibleRoomRecords(c),pens={};
 for(const lane of penLanes)for(let n=1;n<=penDepth;n++){
  const p=lane+n,levels=shown.filter(r=>r.pen===p).map(r=>sowFacts(r).level);
  if(levels.length)pens[p]=levels.includes('act')?'act':levels.includes('live')?'live':'plain';
  else if(c.listed.some(r=>r.pen===p))pens[p]='hidden';
 }
 return pens;
}
function penMapSheet(c,sheet){
 const shown=visibleRoomRecords(c);
 const peek=p=>{const rows=shown.filter(r=>r.pen===p);return SentriUI.penPeek({title:p,meta:penText.sows(rows.length),rows:rows.map(r=>{const f=sowFacts(r);return {code:r.tag,right:{kind:'state',figure:f.figure,word:f.word,level:f.level}};})});};
 const pens=penLevels(c),body=SentriUI.penMap({lanes:penLanes,depth:penDepth,pens,current:c.currentPen,action:'room-pen',key:'farrowing-pens-'+roomContexts.indexOf(c),entrance:penText.entrance,
  labels:{map:penText.map,pen:penText.pen,act:penText.act,live:penText.live,plain:penText.plain,empty:penText.empty,hidden:penText.hidden},peek});
 return sheet(penText.title,body,SentriUI.penMapFooter({back:{action:'room-back',label:{text:penText.back,str:'act.back'}},depth:penDepth,label:penText.jump}),'picker-sheet','menu',{key:SentriUI.penMapKey({pens,words:{act:penText.need,live:penText.farrowing}})});
}
/* ---- Find a sow and Scan ear tags (owner decisions 2026-10-12, amended 2026-10-22) ----
   Two full pages that replace the old search drawer and scan preview. Both look across every unit; neither switches unit by itself.
   Find a sow: nothing is listed until something is typed; results are grouped by unit, this unit first. A sow on the farrowing list shows
   her farrowing row; any other pig the generic row.
   Scan ear tags: Farrowing is a single-action task, so each read opens her (no list): a sow on the list opens her farrowing drawer over Scan,
   any other pig her pig profile. Her Back returns to Scan, still listening. */
const scannerOff=/[?&]scanner=(off|0|no)(&|$)/.test(globalThis.location?.search||'');   // ?scanner=off: the tag reader is not connected
const scanSequence=['000431','000434','004318','000418','000943','000392','000455','000467'];   // what "Simulate scan" scans, in turn
function findSow(c,tag){for(const unit of c.units){const record=unit.records.find(r=>r.tag===tag&&onList(r));if(record)return {record,unit};}return null;}
// Pigs that are not on the farrowing list (owner, 2026-10-22). Find and Scan reach every pig, but only a sow on this task's list is a
// farrowing sow: any other pig shows the generic row (her pen, her condition) and opens her pig profile, whose line says she is not in
// Farrowing. 004305 lives in Unit 7 but is not on the list: "in the task" is the list, not the unit.
const farmPigs=[{tag:'004305',unit:'7',pen:'D2',stage:'Gestating',cond:'Lameness'},{tag:'000434',unit:'3',pen:'A2',stage:'Gestating',cond:'Thin'},{tag:'004329',unit:'3',pen:'A4',stage:'Gestating',cond:''},{tag:'004811',unit:'7',pen:'D2',stage:'Gilt',cond:''}];
const farmUnit=(c,id)=>c.units.find(u=>u.id===id)||{id,name:ZH?id+'单元':'Unit '+id};
// One card per unit under a plain "Unit 7" section heading, this unit first, then the others in unit order (as Home's To treat groups pigs).
// The heading names the unit, so no row repeats it.
function byUnit(c,hits){return [...new Map(hits.map(h=>[h.unit.id,h.unit])).values()].sort((a,b)=>(b.id===c.unitId)-(a.id===c.unitId)||a.id-b.id).map(unit=>({unit,list:hits.filter(h=>h.unit.id===unit.id)}));}
// Every unit, one list. Tags that start with the typed text come first, then tags that contain it, then a pen that matches; her own unit leads.
function findHits(c){
 const q=c.query.trim().toLowerCase();if(!q)return null;
 const rank=h=>{const t=(h.record||h.pig).tag;return t.startsWith(q)?0:t.includes(q)?1:2;},match=r=>r.tag.includes(q)||r.pen.toLowerCase().includes(q);
 const hits=[...c.units.flatMap(unit=>unit.records.filter(onList).filter(match).map(record=>({record,unit}))),...farmPigs.filter(match).map(pig=>({pig,unit:farmUnit(c,pig.unit)}))]
  .sort((a,b)=>rank(a)-rank(b)||(a.record||a.pig).tag.localeCompare((b.record||b.pig).tag));
 return {q,hits};
}
// A sow on the list: her farrowing state on the right, as the room shows her. Any other pig: her condition, or nothing.
function findRow({record:r,pig:p},q){
 const f=r&&sowFacts(r),right=r?{kind:'state',figure:f.figure,word:f.word,level:f.level}:p.cond?{kind:'tags',tags:[{name:p.cond,level:'ongoing'}]}:null;
 return SentriUI.findRow({code:(r||p).tag,place:rowText.pen((r||p).pen),query:q,right,action:r?'room-sow':'room-pig',value:(r||p).tag});
}
function searchBody(c){
 const f=findHits(c);
 return SentriUI.findResults({query:c.query,groups:f?byUnit(c,f.hits).map(({unit,list})=>({title:unit.name,rows:list.map(h=>findRow(h,f.q))})):[],hint:'Type part of an ear tag or a pen, or scan a tag. Searches every unit.',none:`No sow matching “${c.query.trim()}” in any unit.`});
}
// Find a sow is the design system's Lookup find page (components/Lookup): the field pinned and focused, Clear, the scan icon and Cancel.
function searchPage(c){
 return SentriUI.findPage({query:c.query,placeholder:'Ear tag or pen',results:searchBody(c),scan:{action:'room-scan',label:'Scan ear tag'},clear:{action:'room-search-clear',label:'Clear'},cancel:{action:'room-back',label:'Cancel'},inputAttrs:{'data-room-search':''},bar:status()});
}
function scanSetup(c,preset=''){
 const scanning=/^scan-/.test(preset);
 c.scan={connected:preset==='scan-none'?false:scanning?true:!scannerOff,listening:preset!=='scan-stopped',seq:0};
 if(/^search-/.test(preset))c.query=preset==='search-results'?'43':preset==='search-none'?'909':'';
 if(preset==='scan-read')c.returnToTaskReview='roomScan';   // the reader read 000418: her drawer over Scan
 if(preset==='scan-pig')Object.assign(c,{pig:'000434',pigFrom:'roomScan'});   // the reader read 000434, a sow not on the list
 if(/^batch-/.test(preset)){
  const picked={'batch-pick':['000431','004305','000392'],'batch-scanning':['000431','004305'],'batch-outside':['000431','004305'],'batch-search':['000431'],'batch-filter':['000431','004305','000392'],'batch-form':['000431','004305','000392']}[preset]||[];
  c.scan.connected=true;c.batch={verb:'health',picked,q:preset==='batch-search'?'43':'',scanning:preset==='batch-waiting'?'waiting':['batch-scanning','batch-outside'].includes(preset),outside:preset==='batch-outside'?'000434':'',filter:{pigs:'any',cond:'any'},fresh:preset==='batch-scanning'?{'004305':Infinity}:{},last:preset==='batch-scanning'?'004305':'',filtering:preset==='batch-filter',seq:0};
  if(preset==='batch-filter')c.batch.draft={...c.batch.filter};
  if(preset==='batch-waiting')c.scan.connected=false;
 }
 if(preset==='batch-saved')c.toast={title:'Condition recorded · 3 pigs',until:Infinity};
}
/* ---- Actions for the pigs in this unit (owner story, 2026-10-22; reviewed twice the same day) ----
   "Perform other actions on pigs in this unit easily, without switching to Inspection." The room's dock carries ···: the everyday verbs
   for many pigs at once. The verb comes first, then the pigs: every pig in this unit, the farrowing sows and the rest (a gilt, a sow not on
   the list), and only this unit. Choosing is To treat's page (owner, 2026-10-20): the search field with scan inside it, the filter, the
   list. Scan turns the list itself to scanning: each read ticks her and marks her row; a pig from another unit is not added. Then the verb's
   own form (Inspection's), filled once and saved for every pig chosen. Death is not here: it can't be undone, so it stays one pig at a time.
   Copy (owner): the sheet is plain "Actions", its line "Pigs in Unit 7"; not "For several sows", "Many pigs at once" or "bulk". */
const batchVerbs=[['health','condition','Condition','Disease or symptom'],['treatment','treat','Treat','Record treatment'],['triage','alert','Care','Care instructions'],['note','note','Note','Add a note'],['body','measure','Measure','Measurements & condition'],['feed','feed','Feed','Adjust feed'],['transfer','transfer','Transfer','Transfer']];
const batchScans=['000431','004305','000434','000392','004811','000406'];   // what "Simulate scan" reads while choosing: 000434 is in Unit 3
function batchSheet(c){
 const tiles=batchVerbs.map(([value,symbol,label,title])=>({label,title,icon:icon(symbol),action:'room-batch-verb',value,attrs:value==='transfer'?{'data-entry':'move'}:{}}));
 return roomSheet('Actions',SentriUI.rowGrid(tiles,{label:'Actions for pigs in '+c.unit.name}),footer(SentriUI.backButton({action:'room-back'})),'batch-sheet','menu',{text:[{text:'Pigs in '+c.unit.name}]});
}
// Every pig in this unit: the sows on the farrowing list (not one that died) with their farrowing row, then every other pig with the generic row.
function unitPigs(c){
 return [...c.listed.filter(r=>!r.ended).map(r=>({tag:r.tag,pen:r.pen,rec:r})),...farmPigs.filter(p=>p.unit===c.unitId).map(p=>({tag:p.tag,pen:p.pen,pig:p}))];
}
const batchMatch=(p,f)=>(f.pigs==='any'||(f.pigs==='task')===!!p.rec)&&(f.cond==='any'||!!p.pig?.cond);
const batchFilterCount=f=>(f.pigs!=='any')+(f.cond!=='any');
function batchRows(c){
 const b=c.batch,q=b.q.trim().toLowerCase(),shown=unitPigs(c).filter(p=>batchMatch(p,b.filter)&&(!q||p.tag.includes(q)||p.pen.toLowerCase().includes(q)));
 const pick=p=>{const f=p.rec&&sowFacts(p.rec),right=p.rec?{kind:'state',figure:f.figure,word:f.word,level:f.level}:p.pig.cond?{kind:'tags',tags:[{name:p.pig.cond,level:'ongoing'}]}:{kind:'state',figure:'',word:'',level:'settled'};   // no condition: the animal row with nothing on the right
  const context=p.rec?f.context.split(' · ').filter(t=>!/^[A-Z]\.[A-Z]$/.test(t)).join(' · '):p.pig.stage;
  let html=SentriUI.rowSelect({code:p.tag,description:context,right,checked:b.picked.includes(p.tag),action:'room-batch-pick',value:p.tag,attrs:{'data-scan-tag':p.tag},inputAttrs:{'data-value':p.tag,'aria-label':'Choose '+p.tag}});
  return q?html.replace(`<strong class="st-animal-id">${p.tag}</strong>`,`<strong class="st-animal-id">${SentriUI.findMark(p.tag,q)}</strong>`):html;};
 const pens=[...new Set(shown.map(p=>p.pen))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 if(!pens.length)return `<p class="batch-none">${q?`No pig in ${esc(c.unit.name)} matching “${esc(b.q.trim())}”.`:'No pigs match the filter.'}</p>`;
 return pens.map(pen=>{const rows=shown.filter(p=>p.pen===pen);return `<section class="st-panel pen-card batch-pen" data-pen="${pen}"><header class="pen-top"><span class="room-pen-name"><strong>${pen}</strong><small>· ${rows.length} ${rows.length===1?'pig':'pigs'}</small></span></header>${rows.map(pick).join('')}</section>`;}).join('');
}
// Choose pigs: To treat's page. The bar is the shared search field with scan at its end, and the filter; scanning turns that bar into its
// one status ("Scanning", with Stop), and each read ticks her where she is in the list. The first quiet line names the verb.
function batchPickPage(c){
 const b=c.batch,verb=(batchVerbs.find(x=>x[0]===b.verb)||[])[2]||'',n=b.picked.length,fn=batchFilterCount(b.filter);
 // Scanning is the Lookup scan bar in place of the search field: waiting until the reader connects (Reader 1 is the phone's paired reader).
 const bar=b.scanning?SentriUI.scanBar({state:b.scanning==='waiting'?'waiting':'scanning',device:'Reader 1',stop:{action:'room-batch-scan-stop'}})
  :SentriUI.choiceSearch({label:'Search ear tag or pen',placeholder:'Ear tag or pen',value:b.q,attrs:{'data-batch-search':''},clear:{action:'room-batch-clear'},scan:{action:'room-batch-scan',label:'Scan ear tags'}});
 const filter=SentriUI.iconButton({action:'room-batch-filter',icon:icon('filter'),label:'Filter pigs'+(fn?', '+fn+' applied':''),badge:fn||'',className:'batch-filter'});
 // A read from another unit: a standing notice under the bar, one door to her pig record; it stays until the next read or Stop.
 const notice=b.outside?(()=>{const u=farmPigs.find(x=>x.tag===b.outside),where=u?farmUnit(c,u.unit).name:'another unit';return SentriUI.toast(`${b.outside} is in ${where}, not ${c.unit.name}`,{tone:'notice',standing:{action:'room-pig',value:b.outside,label:`${b.outside} is in ${where}, not ${c.unit.name}. Open her pig record`}});})():'';
 const body=`<div class="batch-top"><div class="batch-bar">${bar}${filter}</div>${notice}</div><p class="batch-hint"><b>${esc(verb)}</b> · tick each pig in ${esc(c.unit.name)}, or scan.</p><div class="batch-list">${batchRows(c)}</div>`;
 const next=SentriUI.button({label:n?`Next · ${n} ${n===1?'pig':'pigs'}`:'Next',register:'primary',action:'room-batch-next',disabled:!n});
 return SentriUI.sheet({variant:'page',title:'Choose pigs',back:{action:'room-back'},body,footer:footer(SentriUI.backButton({action:'room-back'}),next),className:'room-utility batch-pick',label:'Choose pigs',bar:status()});
}
// The filter, as To treat's: which pigs (in Farrowing or not) and whether she has a condition. Show N pigs applies it.
function batchFilterSheet(c){
 const b=c.batch,d=b.draft,n=unitPigs(c).filter(p=>batchMatch(p,d)).length;
 const sections=[{title:'Pigs',icon:icon('pig'),content:SentriUI.segment({variant:'facet',options:[['any','Any'],['task','In Farrowing'],['other','Others']],active:d.pigs,action:'room-batch-facet-pigs',ariaLabel:'Pigs'})},
  {title:'Condition',icon:icon('health'),content:SentriUI.segment({variant:'facet',options:[['any','Any'],['some','Has a condition']],active:d.cond,action:'room-batch-facet-cond',ariaLabel:'Condition'})}];
 return SentriUI.filterSheet({title:'Filter pigs',sections,apply:{label:`Show ${n} ${n===1?'pig':'pigs'}`,action:'room-batch-filter-apply'},reset:batchFilterCount(d)?{label:'Reset',action:'room-batch-filter-reset'}:false,backAction:'room-batch-filter-back',className:'batch-filter-sheet',size:'medium'});
}
// The verb's own form: Inspection's, embedded as her pig record is, for every pig chosen. Saving returns to the room with the count.
function batchFormPage(c){return `<iframe class="room-pig-frame batch-form-frame" title="${esc((batchVerbs.find(x=>x[0]===c.batch.verb)||[])[3]||'')}" src="inspection-astra-concept.html?layout=focus&embed=sow${ZH?'&lang=zh':''}"></iframe>`;}
function connectBatchForm(root,c){
 const frame=root.querySelector('.batch-form-frame');if(!frame)return;
 const pigs=unitPigs(c).filter(p=>c.batch.picked.includes(p.tag)).map(p=>p.rec?{id:p.tag,pen:p.pen,unit:c.unit.name,stage:'Lactating',parity:p.rec.parity}:{id:p.tag,pen:p.pen,unit:c.unit.name,stage:p.pig.stage});
 frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'open-bulk-action',view:c.batch.verb,pigs},location.origin),{once:true});
}
// "Simulate scan": the reader reads the next sample tag. While a sow is open the reader waits: only Scan itself listens.
function scanRead(c){const sc=c.scan;if(!sc.connected||!sc.listening)return '';return scanSequence[sc.seq++%scanSequence.length];}
function scanAction(s,c,a){if(a==='room-scan-toggle'&&c.scan.connected)c.scan.listening=!c.scan.listening;}
// Scan ear tags is the design system's Lookup scan page (components/Lookup) in its single-action form: nothing is listed, each read opens her.
function scanPage(c){
 const sc=c.scan;
 return SentriUI.scanPage({title:'Scan ear tags',back:{action:'room-back'},read:'open',connected:sc.connected,listening:sc.listening,toggle:{action:'room-scan-toggle'},empty:{text:'Each sow opens as soon as her tag is read.',stoppedText:'Resume scanning to open the next sow.'},bar:status()});
}
const pageUnder=(s,c)=>s.view==='roomPig'?c.pigFrom:!/^room/.test(s.view)&&['roomSearch','roomScan'].includes(c.returnToTaskReview)?c.returnToTaskReview:s.view;   // a sow opened from Find a sow or Scan rises over that page, where her Back returns
function findPage(s){const c=roomContext(s),under=pageUnder(s,c);return under==='roomSearch'?searchPage(c):under==='roomScan'?scanPage(c):'';}
// A pig not on the farrowing list opens her pig profile (the Inspection pig record, embedded as Home embeds it), over the page she was found
// on. Its line says she is not in Farrowing, so the worker knows why no farrowing drawer opened; its Back returns to that page.
function pigPage(c){return `<iframe class="room-pig-frame" title="${esc((ZH?'猪只档案 · ':'Pig record · ')+c.pig)}" src="inspection-astra-concept.html?layout=focus&embed=sow${ZH?'&lang=zh':''}"></iframe>`;}
function connectPig(root,c){
 const frame=root.querySelector('.room-pig-frame'),p=farmPigs.find(x=>x.tag===c.pig);if(!frame||!p)return;
 frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'open-sow-detail',record:{id:p.tag,pen:p.pen,unit:farmUnit(c,p.unit).name,stage:p.stage,events:[]},tasks:[],destinations:c.units.map(u=>({id:u.id,name:u.name,pens:[...new Set(u.records.map(r=>r.pen))]})),entry:'pig',actions:[],note:ZH?'不在分娩任务中':'Not in Farrowing'},location.origin),{once:true});
}
// Pen context is shared by its drawers within the unit; task rows stay sow-focused.
function penInfo(c){const pens=c.unit.penDetails||(c.unit.penDetails={});return pens[c.detailPen]||(pens[c.detailPen]={note:'',noteBy:'',faults:[],events:[],feed:null});}
function penEvent(c,text,note=''){penInfo(c).events.unshift({text,note,day:'Today',time:'09:41',who:'G. Hansen'});}
function penActionRow(action,symbol,title,sub,value=''){return SentriUI.row({action,icon:icon(symbol),title,description:sub,value});}
/* The pen page (owner, 2026-10-19; the sibling of Inspection's, PR #229): the pen is a door, not a tick. Everything done to the pen as a whole
   happens here, for this one pen: its verbs on top (Row tiles), then what needs someone (open faults, then the note, as rows in one group) only when
   something is open, then how the pen is now, then the door to its log. Only Farrowing's own verbs: Note, Feed, Fault.
   Names are the registry's (ux/laws/strings.json: actions.tile.*, pen.*, feed.copy.122-124, fr.pen.*), drawn in the page's language. */
const penPage={
 actions:ZH?'本栏操作':'Pen actions',note:ZH?'备注':'Note',feed:ZH?'饲喂':'Feed',fault:ZH?'故障':'Fault',
 noteAdd:ZH?'添加本栏备注':'Add pen note',noteEdit:ZH?'修改本栏备注':'Edit pen note',feedTitle:ZH?'饲喂指导':'Feed guidance',faultTitle:ZH?'上报设备故障':'Report equipment fault',
 attention:ZH?'需要处理':'Needs attention',now:ZH?'当前':'Now',log:ZH?'本栏记录':'Pen log',logLine:ZH?'全部已记录的操作':'All recorded activity',
 sows:ZH?'母猪':'Sows',piglets:ZH?'存活仔猪':'Piglets alive',
 state:{Awaiting:ZH?'待产':'awaiting',Active:ZH?'分娩中':'farrowing',Done:ZH?'已完成':'done'}
};
// Where the pen's task sows are: one word when they share a state ("Farrowing"), else each state with its count ("2 awaiting · 1 done").
function penSowStates(rows){
 const counts=roomLenses.filter(l=>l!=='All').map(l=>[l,rows.filter(r=>roomState(r)===l).length]).filter(([,n])=>n);
 if(counts.length===1){const w=penPage.state[counts[0][0]];return ZH?w:w[0].toUpperCase()+w.slice(1);}
 return counts.map(([l,n])=>ZH?penPage.state[l]+n+'头':n+' '+penPage.state[l]).join(' · ');
}
function penDetails(c){
 const pe=penInfo(c),rows=c.listed.filter(r=>r.pen===c.detailPen),faults=pe.faults.filter(f=>f.open);
 const verbs=SentriUI.rowGrid([
  {label:penPage.note,title:pe.note?penPage.noteEdit:penPage.noteAdd,icon:icon('note'),action:'room-pen-note'},
  {label:penPage.feed,title:penPage.feedTitle,icon:icon('feed'),action:'room-pen-feed'},
  {label:penPage.fault,title:penPage.faultTitle,icon:icon('wrench'),action:'room-pen-fault'}
 ],{label:penPage.actions});
 const faultRows=faults.map(f=>SentriUI.row({variant:'navigation',action:'room-pen-fault-record',value:f.id,icon:icon('wrench'),title:f.device,description:f.description,wrap:true}));
 // The note is a row like the faults (one white group on the page's tint, SURFACES.md): its text over its hand and time, the door to the note.
 const attention=[...faultRows,...(pe.note?[SentriUI.row({variant:'navigation',action:'room-pen-read-note',icon:icon('note'),title:pe.note,description:pe.noteBy,wrap:true})]:[])];
 const farrowed=rows.filter(r=>born(r)>0),alive=sum(farrowed.map(r=>r.alive)),dead=sum(farrowed.map(r=>sum(r.dead)));
 const now=[{label:penPage.sows,value:String(rows.length),meta:penSowStates(rows)},...(farrowed.length?[{label:penPage.piglets,value:String(alive),meta:dead?rowText.dead(dead):''}]:[]),...(pe.feed?[{label:penPage.feed,value:pe.feed.formula,meta:pe.feed.mode}]:[])];
 const section=(title,k,body)=>`<section class="pen-page-section">${SentriUI.heading({title,icon:icon(k),kind:'section',level:4})}${body}</section>`;
 return roomSheet(ZH?rowText.pen(c.detailPen):'Pen '+c.detailPen,
  `<section class="pen-page-section">${verbs}</section>`+
  (attention.length?section(penPage.attention,'alert',`<div class="compact-actions st-panel st-row-group">${attention.join('')}</div>`):'')+
  section(penPage.now,'details',SentriUI.facts(now,{columns:now.length}))+
  `<section class="pen-page-section"><div class="compact-actions st-panel st-row-group">${penActionRow('room-pen-log','clock',penPage.log,penPage.logLine)}</div></section>`,false,'pen-detail-sheet');
}
function penSubpage(s,c){
 if(!['roomPenFeed','roomPenReadNote','roomPenNote','roomPenFault','roomPenFaultRecord'].includes(s.view))return null;
 const pe=penInfo(c),draft=c.penDraft||{},feedPage=s.view==='roomPenFeed';
 const sheet=(title,body,action='')=>roomSheet(title,body,feedPage?pageFooter(action):footer(SentriUI.backButton({action:'room-back'}),action),feedPage?'pen-feed-page':['roomPenNote','roomPenReadNote'].includes(s.view)?'pen-form-sheet pen-note-sheet':'pen-form-sheet');
 if(s.view==='roomPenFeed')return sheet('Feed guidance',pe.feed?`<section class="pen-detail-section">${SentriUI.heading({title:'Feeding',icon:icon('feed'),kind:'section',level:4})}${SentriUI.facts([{label:'Formula',value:pe.feed.formula},{label:'Method',value:pe.feed.mode}])}${pe.feed.guidance?`<p class="pen-detail-copy">${esc(pe.feed.guidance)}</p>`:''}</section>`:'<p class="detail-empty">No feed guidance recorded for this pen.</p>');
 if(s.view==='roomPenReadNote')return sheet('Pen note',`<p class="pen-detail-copy">${esc(pe.note)}</p><p class="pen-detail-meta">${esc(pe.noteBy)}</p>`,btn('room-pen-note','Edit note','button primary'));
 if(s.view==='roomPenNote')return sheet('Pen note',SentriUI.field({label:'Note',control:`<textarea data-pen-field="note">${esc(draft.note||'')}</textarea>`,className:'pen-field'}),btn('room-pen-save-note','Save note','button primary','',!draft.note?.trim()));
 if(s.view==='roomPenFault')return sheet('Report fault',`${SentriUI.pickerField({label:'Device',value:draft.device||'',placeholder:'Select',key:'pen:device',className:'pen-field'})}${draft.device==='Other'?SentriUI.field({label:'Device name',control:`<input data-pen-field="name" value="${esc(draft.name||'')}">`,className:'pen-field'}):''}${SentriUI.field({label:'Description',control:`<textarea data-pen-field="description" placeholder="What is broken or not working?">${esc(draft.description||'')}</textarea>`,className:'pen-field'})}`,btn('room-pen-save-fault','Report fault','button primary','',!validPenFault(draft)));
 if(s.view==='roomPenFaultRecord'){
  const f=pe.faults.find(x=>x.id===c.penFaultId);if(!f)return sheet('Equipment fault','<p class="detail-empty">No fault found.</p>');
  return sheet(f.device,`<p class="pen-detail-copy">${esc(f.description)}</p><p class="pen-detail-meta">${f.open?'Open':'Resolved'} · Reported ${f.time} · ${esc(initials(f.who))}</p>${f.open?SentriUI.optionalRow({label:'Resolution note',value:draft.resolution||'',open:!!draft.resolution?.trim(),inline:SentriUI.field({label:'Resolution note',labelHidden:true,control:`<textarea data-pen-field="resolution">${esc(draft.resolution||'')}</textarea>`,className:'pen-field'})}):`<p class="pen-detail-copy">${esc(f.resolution||'')}</p>`}`,f.open?btn('room-pen-resolve-fault','Resolve fault','button primary'):'');
 }
 return null;
}
function validPenFault(draft){return !!draft.device&&!!draft.description?.trim()&&(draft.device!=='Other'||!!draft.name?.trim());}
function handlePenAction(s,c,a,v){
 const destinations={'room-pen-feed':'roomPenFeed','room-pen-read-note':'roomPenReadNote','room-pen-note':'roomPenNote','room-pen-fault':'roomPenFault','room-pen-fault-record':'roomPenFaultRecord'};
 if(destinations[a]){const keep=(c.penKeeps||{})[destinations[a]+'|'+c.detailPen+(a==='room-pen-fault-record'?'|'+v:'')];c.penDraft=keep?clone(keep):a==='room-pen-note'?{note:penInfo(c).note}:{};if(a==='room-pen-fault-record')c.penFaultId=v;s.view=destinations[a];return;}
 if(a==='room-pen-save-note'&&c.penDraft?.note?.trim()){const pe=penInfo(c),note=c.penDraft.note.trim();penEvent(c,pe.note?'Pen note updated':'Pen note added',note);pe.note=note;pe.noteBy='G.H · Today · 09:41';delete c.penKeeps?.['roomPenNote|'+c.detailPen];s.view='roomPenDetail';}
 if(a==='room-pen-save-fault'&&validPenFault(c.penDraft)){const d=c.penDraft,pe=penInfo(c),fault={id:String(pe.faults.length+1),device:d.device==='Other'?d.name.trim():d.device,description:d.description.trim(),time:'09:41',who:'G. Hansen',open:true};pe.faults.push(fault);penEvent(c,'Equipment fault reported',fault.device+' · '+fault.description);delete c.penKeeps?.['roomPenFault|'+c.detailPen];s.view='roomPenDetail';}
 if(a==='room-pen-resolve-fault'){const f=penInfo(c).faults.find(x=>x.id===c.penFaultId);if(f?.open){f.open=false;f.resolution=c.penDraft.resolution?.trim()||'';penEvent(c,'Equipment fault resolved',f.device+(f.resolution?' · '+f.resolution:''));delete c.penKeeps?.['roomPenFaultRecord|'+c.detailPen+'|'+f.id];s.view='roomPenDetail';}}
}
/* A log group is a day: Today, Yesterday, a weekday, or a date ("Aug 27"). "N days ago" is turned into one of those. */
function dayLabel(day){const m=String(day).match(/^(\d+) days? ago$/);return m?SentriUI.logDay(new Date(Date.now()-Number(m[1])*864e5)):day;}
function penLog(c){
 const entries=penLogEvents(c.records,c.detailPen,new Date(),penInfo(c).events);
 const groups=[];
 for(const e of entries){if(groups.at(-1)?.label!==dayLabel(e.day))groups.push({label:dayLabel(e.day),entries:[]});groups.at(-1).entries.push({title:e.text,detail:e.sow?`Sow ${e.sow}`:e.note||'',at:e.time,by:e.who,extraHtml:e.photos?.length?`<div class="photos">${e.photos.map((photo,i)=>btn('savedPhoto',`<img src="${esc(photo)}" alt="Recorded photo ${i+1}">`,'',photo)).join('')}</div>`:''});}
 const body=SentriUI.log(groups,{empty:'No activity recorded for this pen.'});
 return roomSheet('Pen log',body,false,'pen-log-sheet');
}
function taskPerformance(p){
 const number=n=>n==null?'—':n.toFixed(1);
 return `<section class="task-performance">${SentriUI.heading({title:'Performance metrics',icon:icon('chart'),meta:`${p.litters} finished ${p.litters===1?'litter':'litters'}`,kind:'section',level:4})}<div class="task-performance-surface st-panel"><div class="task-kpi-pair"><div><span>Born alive / litter</span><strong>${number(p.bornAlivePerLitter)}</strong><small class="${p.target!=null&&p.bornAlivePerLitter!=null&&p.bornAlivePerLitter<p.target?'kpi-below':''}">${p.target!=null?'Target '+p.target:'No target set'}</small></div><div><span>Stillborn rate</span><strong>${number(p.stillbornRate)}${p.stillbornRate==null?'':'<small>%</small>'}</strong><small>${p.stillborn} stillborn / ${p.born} born</small></div></div><dl class="task-performance-totals">${[['Born',p.born],['Alive now',p.alive],['Piglet deaths',p.dead]].map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></div></section>`;
}
function taskOutcomeSummary(o,closed=false){
 const door=(key,note)=>closed?null:{key,note};const rows=[['Finished farrowing',o.finished],...(o.active?[['Still farrowing',o.active,door('active','Finish before ending')]]:[]),[closed?'Removed · not farrowed':'Awaiting farrowing',o.awaiting,o.awaiting?door('awaiting','Leave the batch when the task ends'):null],...(o.removed?[['Removed earlier',o.removed]]:[]),...(o.abortions?[['Aborted',o.abortions]]:[]),...(o.notInPig?[['Not in pig',o.notInPig]]:[]),...(o.ended?[['Sow deaths',o.ended]]:[])];
 return `<section class="task-outcome-section">${SentriUI.heading({title:'Task outcomes',icon:icon('record'),meta:`${o.total} sows`,kind:'section',level:4})}<dl class="task-outcomes-list st-panel">${rows.map(([label,n,d])=>d?`<div class="task-outcome-warn"><dt><button type="button" class="task-outcome-door" data-action="room-task-list" data-value="${d.key}"><span><strong>${label}</strong><small>${d.note}</small></span></button></dt><dd>${n}${icon('chevron')}</dd></div>`:`<div><dt>${label}</dt><dd>${n}</dd></div>`).join('')}</dl></section>`;
}
function taskOtherOutcomes(r){
 const row=(key,label,n)=>SentriUI.row({title:label,variant:'summary-count',trailing:{text:String(n)},action:n?'room-task-list':'',value:key});
 // Sows that left the room list (owner decision 2026-10-10): said once, by reason. An empty section does not render.
 const aborted=r.left.filter(x=>x.record.productionOutcome==='abortion').length,died=r.left.length-aborted;
 const leftRow=r.left.length?SentriUI.row({title:'Left the task',description:[aborted?[{text:String(aborted),mono:true},'aborted']:'',died?[{text:String(died),mono:true},'sow died']:''].filter(Boolean),action:'room-task-list',value:'left',trail:'chevron'}):'';
 const rows=leftRow+(r.notInPig.length?row('notInPig','Not in pig',r.notInPig.length):'')+(r.removed.length?row('removed','Removed from batch',r.removed.length):'');
 return rows?`<section class="task-other-outcomes">${SentriUI.heading({title:'Other outcomes',icon:icon('record'),kind:'section',level:4})}<div class="task-other-surface st-panel st-row-group">${rows}</div></section>`:'';
}
function taskDeathReview({record,unit,unitId}){
 const timing={before:'Before farrowing',during:'During farrowing',after:'After farrowing'}[record.deathStage]||'Timing not recorded';
 const hasLitter=born(record)>0;
 return `<article class="task-death-review">${btn('room-task-sow',`<span><strong>${record.tag}</strong><small>${esc(unit)} · ${record.pen}</small></span><span class="task-review-state">${timing}</span>${icon('chevron')}`,'task-review-sow',unitId+':'+record.tag)}${hasLitter?`<div class="task-death-litter"><h4>${record.deathStage==='after'?'Finished litter':'Piglets recorded'}</h4><dl class="task-performance-totals">${[['Born',born(record)],['Alive now',record.alive],['Piglet deaths',sum(record.dead)]].map(([label,n])=>`<div><dt>${label}</dt><dd>${n}</dd></div>`).join('')}</dl><p>${record.deathStage==='after'?'Included in finished-farrowing KPIs.':'Excluded from finished-farrowing KPIs.'}</p></div>`:''}</article>`;
}
function taskEndSheet(s,c){
 const sheet=(title,body,actions,cls='')=>roomSheet(title,body,actions,'task-end-sheet '+cls);
 if(s.view==='roomTaskReceipt'){
  const end=c.completion;if(!end)return '';
  const at=new Date(end.at),when=at.toLocaleString('en-US',{month:'short'})+' '+at.getDate()+' · '+at.toLocaleString('en-GB',{hour:'2-digit',minute:'2-digit'});
  // Who closed the task and when is the receipt's own fact: the first line of its body (never the header).
  return sheet(end.early?'Task ended early':'Task ended',`${bodyLead(`Farrowing · ${when} · ${initials(end.who)}`)}${taskPerformance(end.performance)}${taskOutcomeSummary({...end,awaiting:end.removed},true)}`,false,'task-end-expanded task-receipt-sheet');
 }
 const r=taskClosureReview(c);
 if(s.view==='roomTaskSows'){
  const key=['active','awaiting','ended','abortions','left','notInPig','removed'].includes(c.taskReviewGroup)?c.taskReviewGroup:'active';
  const title={active:'Active farrowing',awaiting:'Awaiting farrowing',ended:'Sow deaths',abortions:'Aborted',left:'Left the task',notInPig:'Not in pig',removed:'Removed from batch'}[key];
  return sheet(title,`<div class="${key==='awaiting'?'task-removal-notice':'task-list-hint'}">${key==='awaiting'?`${icon('alert')}<div><strong>${r.awaiting.length} ${r.awaiting.length===1?'sow will':'sows will'} be removed from this batch</strong><p>These sows have not farrowed. Ending the task removes them from the batch.</p></div>`:key==='drafts'?'Open a sow to save or clear its changes.':['ended','abortions','left','notInPig','removed'].includes(key)?'Recorded outcomes across all units. Open a sow to view the record.':'Open a sow to review and finish the record.'}</div><div class="task-review-sows${key==='ended'?'':' st-panel st-row-group'}">${r[key].map(({record,unit,unitId})=>key==='ended'?taskDeathReview({record,unit,unitId}):sowRow(record,{where:unit+' · '+record.pen,action:'room-task-sow',value:unitId+':'+record.tag})).join('')||'<p>No sows to review.</p>'}</div>`,false,'task-sows-sheet');
 }
 const closureLabel=r.awaiting.length||r.blocked?'End task early':'End task';
 return sheet(closureLabel,`${taskPerformance(r.performance)}${taskOutcomeSummary({total:r.rows.length,finished:r.finished.length,active:r.active.length,awaiting:r.awaiting.length,removed:r.removed.length,ended:r.ended.length,abortions:r.abortions.length,notInPig:r.notInPig.length})}`,pageFooter(hold('room-end-confirm',closureLabel,r.blocked,closureLabel==='End task early').replace('button primary hold','button primary hold '+(closureLabel==='End task'?'task-complete':'task-end-confirm'))),'task-end-expanded');
}
function roomOverlay(s){const c=roomContext(s),unitSheet=(title,body,actions,cls='',surface='',line=null)=>roomSheet(title,body,actions,cls,surface,line);if(s.view==='roomFilter'){const f=c.filterDraft,n=visibleRoomRecords(c,f).length;return SentriUI.filterSheet({title:'Filter sows',sections:[{content:SentriUI.rangeSlider({min:-7,max:7,value:[f.from,f.to],title:'Expected farrowing',icon:icon('calendar'),key:'due',labels:['Earliest expected farrowing','Latest expected farrowing'],format:dueDay,summary:(from,to)=>dueRangeLabel({from,to}),ends:['7+ days ago','Today','In 7+ days']})},{title:'Parity',icon:icon('profile'),content:SentriUI.segment({variant:'facet',options:parityChoices.map(v=>[v,v]),active:f.parity,action:'room-parity',ariaLabel:'Parity'})}],apply:{label:`Show ${n} ${n===1?'sow':'sows'}`,action:'room-apply-filter'},reset:roomFilterCount(f)?{label:'Reset',action:'room-reset-filter'}:false,backAction:'room-back',className:'room-utility room-filter-sheet'});}
 if(s.view==='roomPicker'&&c.picker)return roomSheet(c.picker.label,SentriUI.pickerOptions({options:c.picker.options,selected:c.picker.selected}),footer(SentriUI.backButton({action:'room-back'})),'picker-sheet');
 if(['roomEndTask','roomTaskSows','roomTaskReceipt'].includes(s.view))return taskEndSheet(s,c);
 const penPage=penSubpage(s,c);if(penPage!==null)return penPage;
 if(s.view==='roomPenDetail')return penDetails(c);
 if(s.view==='roomPenLog')return penLog(c);
 if(s.view==='roomGrid')return penMapSheet(c,unitSheet);
 if(s.view==='roomPig')return pigPage(c);
 if(s.view==='roomBatch')return batchSheet(c);
 if(s.view==='roomBatchPick')return batchPickPage(c)+(c.batch.filtering?batchFilterSheet(c):'');
 if(s.view==='roomBatchForm')return batchPickPage(c)+batchFormPage(c);
 if(s.view==='roomOverview'){
  const {units,totals:t}=taskOverview(c),review=taskClosureReview(c);
  const columns=['Done','Active','Awaiting'],dotClass={Done:'farrowed',Active:'active',Awaiting:'awaiting'};
 const overview=`<section class="task-progress-section"><div class="task-progress st-panel">${SentriUI.heading({title:'Whole-task progress',meta:`${t.ProgressTotal} sows`,kind:'panel',level:4})}${AstraTaskOverview.statusProgress({farrowed:t.Done,active:t.Active,awaiting:t.Awaiting},false,['done','active','awaiting'])}<div class="task-metrics" style="--status-count:${columns.length}">${columns.map(k=>`<div><strong>${t[k]}</strong><span><i class="task-status-dot task-status-${dotClass[k]}"></i>${k}</span></div>`).join('')}</div></div><section class="unit-routing" aria-label="Farrowing by unit">${SentriUI.heading({title:'Choose a unit',icon:icon('grid'),kind:'section',level:4,className:'unit-routing-heading'})}<div class="unit-routing-surface"><div class="unit-routing-columns" aria-hidden="true"><span>Unit</span>${columns.map(k=>`<span>${k}</span>`).join('')}<span></span></div><div role="list">${units.map(u=>`<div role="listitem">${btn('room-unit',`<span class="unit-route-name"><strong>${u.name}</strong>${u.current?'<small>Current unit</small>':''}</span>${columns.map(k=>`<span class="unit-route-number" aria-hidden="true">${u[k]}</span>`).join('')}${icon('chevron')}`,'unit-route',u.id).replace('<button',`<button aria-label="Open ${u.name}${u.current?', current unit':''}, ${u.Done} done, ${u.Active} active, ${u.Awaiting} awaiting"${u.current?' aria-current="true"':''}`)}</div>`).join('')}</div></div></section></section>`;
  const details=`<div class="task-overview-details">${taskPerformance(review.performance)}${taskOtherOutcomes(review)}</div>`;
  return unitSheet('Task overview',`<div class="task-overview-content">${overview}${details}</div>`,pageFooter(btn('room-end-review',review.awaiting.length||review.blocked?'End task early':icon('check')+'End task',review.awaiting.length||review.blocked?'button primary task-end-early':'button primary task-complete')),'task-overview-sheet');
 }

 return '';
}
function roomAction(i,a,v){if(!a.startsWith('room-'))return false;const s=states[i],c=roomContext(s);if(a!=='room-pen'&&atlasStill())c.highlightUntil=0;const list=document.querySelector(`[data-card="${i}"] .room-scroll`);if(list)c.scroll=list.scrollTop;const intro=list?list.querySelector('.room-context-strip').offsetHeight+10:0;const nextScroll=c.scroll>=intro?intro:0;
  if(a==='room-sow'){const hit=findSow(c,v),r=hit?.record;if(r){const from=s.view;if(from==='roomScan'||from==='roomSearch')c.returnToTaskReview=from;states[i]=r;r.view=recordView(r);if(r.view==='history')r.pageBack='room';if(hit.unit.id===c.unitId)c.currentPen=r.pen;if(from!=='roomSearch')c.query='';}}   // Back returns to the list she was opened from; Find a sow keeps what was typed   // Farrowing is one task across its units: a sow in another unit opens the same drawer
 if(a==='room-back'||a==='room-return'){c.returnToTaskReview=false;if(s.view==='roomPenDetail')c.returnFocusPen=c.detailPen;const from=s.view;if(from==='roomFilter')c.filterKeep=clone(c.filterDraft);if(from==='roomPenNote'||from==='roomPenFault'||from==='roomPenFaultRecord')(c.penKeeps=c.penKeeps||{})[from+'|'+c.detailPen+(from==='roomPenFaultRecord'?'|'+c.penFaultId:'')]=clone(c.penDraft||{});if(from==='roomPenDetail'&&c.penKeeps)for(const k of Object.keys(c.penKeeps))if(k.endsWith('|'+c.detailPen))delete c.penKeeps[k];s.view=from==='roomBatchPick'?'roomBatch':from==='roomScanActions'?'roomScan':from==='roomScan'&&c.scanFrom?c.scanFrom:from==='roomPicker'&&c.picker?c.picker.returnView:from==='roomEndTask'?'roomOverview':from==='roomTaskSows'?c.taskListBack||'roomEndTask':from==='roomTaskReceipt'?'roomHome':penParent(from);if(from==='roomPicker')c.picker=null;}
 handlePenAction(s,c,a,v);
 if(a==='room-pen-log')s.view='roomPenLog';
 if(a==='room-pen-detail'&&c.records.some(r=>r.pen===v)){c.detailPen=v;c.currentPen=v;s.view='roomPenDetail';}
 if(a==='room-home')s.view='roomHome';
 if(a==='room-lens'){c.lens=v;c.scroll=nextScroll;c.tailSpace=0;s.view='room';}
 if(a==='room-filter'){c.filterDraft=clone(c.filterKeep||c.filter);s.view='roomFilter';}
 if(a==='room-parity')c.filterDraft.parity=v;
 if(a==='room-reset-filter')c.filterDraft=defaultRoomFilter();
 if(a==='room-apply-filter'){c.filterKeep=null;c.filter=clone(c.filterDraft);c.scroll=nextScroll;c.tailSpace=0;s.view='room';}
 if(a==='room-clear-filter'){c.filterKeep=null;c.filter=defaultRoomFilter();c.scroll=nextScroll;c.tailSpace=0;}
 if(a==='room-grid')s.view='roomGrid';
 if(a==='room-pen'){const L=landMs();c.currentPen=v;c.jump=v;c.highlightUntil=Date.now()+L.hold+L.fade;c.highlightPen=v;c.highlightLevel=penLevels(c)[v]||'plain';s.view='room';}

 if(a==='room-search'||a==='room-scan'){c.scanFrom=a==='room-scan'&&s.view==='roomSearch'?'roomSearch':'';if(!c.scanFrom)c.query='';s.view=a==='room-search'?'roomSearch':'roomScan';}   // Scan opened from Find a sow goes back to it, with what was typed
 if(a==='room-search-clear')c.query='';
 if(a==='room-pig'){c.pigFrom=s.view;c.pig=v;s.view='roomPig';}
 if(a==='room-batch'){c.batch={verb:'',picked:[],q:'',scanning:false,filter:{pigs:'any',cond:'any'},fresh:{},seq:0};c.toast=null;s.view='roomBatch';}
 if(a==='room-batch-scan'){c.batch.scanning=c.scan.connected?true:'waiting';c.batch.q='';}   // no reader yet: wait for it, then scan
 if(a==='room-batch-scan-stop'){c.batch.scanning=false;c.batch.outside='';}
 if(a==='room-batch-clear')c.batch.q='';
 if(a==='room-batch-filter'){c.batch.filtering=true;c.batch.draft={...c.batch.filter};}
 if(a==='room-batch-facet-pigs')c.batch.draft.pigs=v;
 if(a==='room-batch-facet-cond')c.batch.draft.cond=v;
 if(a==='room-batch-filter-reset')c.batch.draft={pigs:'any',cond:'any'};
 if(a==='room-batch-filter-apply'){c.batch.filter={...c.batch.draft};c.batch.filtering=false;}
 if(a==='room-batch-filter-back')c.batch.filtering=false;
 if(a==='room-batch-verb'){c.batch.verb=v;s.view='roomBatchPick';}
 if(a==='room-batch-pick'){const b=c.batch,k=b.picked.indexOf(v);if(k<0)b.picked.push(v);else b.picked.splice(k,1);}
 if(a==='room-batch-next'&&c.batch.picked.length)s.view='roomBatchForm';
 else if(a.startsWith('room-scan-'))scanAction(s,c,a,v);
 if(a==='room-overview')s.view=c.completion?'roomTaskReceipt':'roomOverview';
 if(a==='room-end-review')s.view=c.completion?'roomTaskReceipt':'roomEndTask';
 if(a==='room-task-list'){c.taskListBack=s.view;c.taskReviewGroup=v;s.view='roomTaskSows';}
 if(a==='room-task-sow'){const [unitId,tag]=v.split(':');switchRoomUnit(c,unitId);const record=c.records.find(r=>r.tag===tag);if(record){states[i]=record;record.view=recordView(record);if(record.view==='history')record.pageBack='roomTaskSows';c.currentPen=record.pen;c.lens='All';c.filter=defaultRoomFilter();c.returnToTaskReview=c.taskListBack||'roomEndTask';}}
 if(a==='room-end-confirm'){if(closeTask(c))s.view='roomTaskReceipt';else s.view='roomEndTask';}
 if(a==='room-task-receipt')s.view='roomTaskReceipt';
 if(a==='room-unit'){const record=switchRoomUnit(c,v);if(record){states[i]=record;record.view='room';c.focusUnit=true;}}
 return true;
}
function pageAfterRender(i,s,c,root){
 const demo=root.querySelector('[data-demo-scan]');if(demo){demo.hidden=s.view==='roomBatchPick'?!c.batch?.scanning:s.view!=='roomScan'||!c.scan.connected;demo.disabled=s.view==='roomScan'&&!c.scan.listening;demo.textContent=s.view==='roomBatchPick'&&c.batch?.scanning==='waiting'?'Simulate reader on':'Simulate scan';}
 if(s.view==='roomPig')connectPig(root,c);
 if(s.view==='roomBatchForm')connectBatchForm(root,c);
 // The pig just read is brought into view where she is, and her row keeps Row's Just scanned state for a moment.
 if(s.view==='roomBatchPick'&&c.batch.scanning){const r=root.querySelector(`.batch-list [data-scan-tag="${c.batch.last}"]`),body=r?.closest('.sheet-body');if(r&&body)body.scrollTop+=r.getBoundingClientRect().top-body.getBoundingClientRect().top-body.clientHeight/2+r.offsetHeight/2;SentriUI.scanArrive(root,{fresh:c.batch.fresh});c.batch.last='';}
 if(c.toast&&s.view===(c.toast.on||'room')){root.querySelector('.phone').insertAdjacentHTML('beforeend',SentriUI.toast(c.toast.title,{tone:c.toast.tone||'done'}));if(c.toast.until!==Infinity){const t=c.toast;setTimeout(()=>{if(c.toast===t){c.toast=null;root.querySelector('.phone .st-toast')?.remove();}},3200);}}
 // Find a sow opens with the field focused; Scan highlights the row of a sow that was scanned again.
 if(pageUnder(s,c)==='roomSearch'&&s.view==='roomSearch')root.querySelector('[data-room-search]')?.focus({preventScroll:true,focusVisible:false});
}
/* Landing on a pen: the list is placed on the pen first, under the sheet (no scroll the worker sees); the sheet then leaves with its own Sheet
   exit (data-leave, --sheet-out) and the pen's header takes the tapped tile's colour (--land-hold, fading over --land-fade). The atlas freezes motion
   (atlas-still) and reduced motion drops the slide, so there the pen is reached at once and the end state is the plain list. */
const atlasStill=()=>document.documentElement.classList.contains('atlas-still');
const landMs=()=>{const cs=getComputedStyle(document.documentElement),ms=n=>parseFloat(cs.getPropertyValue(n))||0;return {hold:ms('--land-hold'),fade:ms('--land-fade'),out:ms('--sheet-out')};};
function jumpToPen(c,scroller,list,sticky){const target=[...list.querySelectorAll('[data-pen]')].find(x=>x.dataset.pen===c.jump);if(target){c.tailSpace=Math.max(18,scroller.clientHeight-sticky-target.offsetHeight);list.style.paddingBottom=c.tailSpace+'px';scroller.scrollTop+=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-sticky;}c.scroll=scroller.scrollTop;c.jump=null;}
function settleOnPen(i,pen){
 if(atlasStill()||matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
 const s=states[i],c=roomContext(s),root=document.querySelector(`[data-card="${i}"]`),scroller=root.querySelector('.room-scroll'),list=root.querySelector('.room-list'),leaving=root.querySelectorAll('.phone > .sheet,.phone > .scrim');
 if(!scroller||!list||!leaving.length)return false;
 c.scroll=scroller.scrollTop;c.jump=pen;jumpToPen(c,scroller,list,root.querySelector('.room-controls').offsetHeight);
 leaving.forEach(e=>{e.setAttribute('data-leave','');e.setAttribute('inert','');});
 setTimeout(()=>{if(states[i]!==s||s.view!=='roomGrid')return;roomAction(i,'room-pen',pen);render(i);},landMs().out);
 return true;
}
function roomAfterRender(i){
 const s=states[i],c=roomContext(s),root=document.querySelector(`[data-card="${i}"]`),scroller=root.querySelector('.room-scroll'),list=root.querySelector('.room-list');clearTimeout(penHighlightTimers[i]);pageAfterRender(i,s,c,root);if(!list)return;
 const controls=root.querySelector('.room-controls'),sticky=controls.offsetHeight;scroller.style.setProperty('--room-sticky-height',sticky+'px');list.style.paddingBottom=(c.tailSpace||18)+'px';scroller.scrollTop=c.scroll;if(c.returnFocusPen){root.querySelector(`[data-action="room-pen-detail"][data-value="${c.returnFocusPen}"]`)?.focus({preventScroll:true,focusVisible:false});c.returnFocusPen=null;}if(c.focusUnit){scroller.focus({preventScroll:true});c.focusUnit=false;}
 /* the jump measures the list and its viewport, so it is redone whenever either changes size or a font finishes loading (a late font
    reflows the rows; the viewport grows as a browser bar collapses), until the user touches or scrolls: otherwise the pen ends short of
    the tabs and they cover its top. */
 if(c.jump){const pen=c.jump;jumpToPen(c,scroller,list,sticky);let ro=null;const repin=()=>{if(!list.isConnected)return stop();c.jump=pen;jumpToPen(c,scroller,list,controls.offsetHeight);},stop=()=>{ro?.disconnect();document.fonts?.removeEventListener('loadingdone',repin);scroller.removeEventListener('touchstart',stop);scroller.removeEventListener('wheel',stop);scroller.removeEventListener('keydown',stop);};if(typeof ResizeObserver==='function'){ro=new ResizeObserver(repin);ro.observe(scroller);ro.observe(list);}document.fonts?.addEventListener('loadingdone',repin);for(const t of ['touchstart','wheel','keydown'])scroller.addEventListener(t,stop,{passive:true});}
 const still=atlasStill();if(still?c.highlightUntil>0:c.highlightUntil>Date.now()){const target=[...list.querySelectorAll('[data-pen]')].find(x=>x.dataset.pen===c.highlightPen),left=c.highlightUntil-Date.now(),L=landMs();if(target){target.dataset.penLand=c.highlightLevel||'plain';target.querySelector('.pen-top')?.setAttribute('data-pen-land-head','');target.style.setProperty('--land-elapsed',(L.hold+L.fade-left)+'ms');if(still)target.setAttribute('data-pen-land-held','');}if(!still)penHighlightTimers[i]=setTimeout(()=>{target?.removeAttribute('data-pen-land');target?.querySelector('.pen-top')?.removeAttribute('data-pen-land-head');c.highlightPen=null;c.highlightUntil=0;},left);}
}
function receipt(s){return s.pointers?'<span class="count-reminder">Use <strong>Record dead</strong> for deaths.<br>Use <strong>Edit</strong> for corrections.</span>':`<span class="count-save-state">${!s.events.length&&!s.alive?'Tap + as piglets are born':`${icon('check')}Saved${s.pending?`<span class="receipt-separator">·</span><strong>${s.pending>0?'+'+s.pending:-s.pending+' died'} this visit</strong>`:''}`} </span>`;}
function litterHeading(disabled=false){return SentriUI.heading({title:'Litter summary',icon:icon('record'),action:disabled?'':{label:'View log',action:'history',ariaLabel:'Open farrowing log'},kind:'section',level:3});}
function count(s){const pending=sum(s.deathDraft);return {cls:'',body:`${farmStepper({variant:'count',label:'Alive',value:s.alive,min:floor(s),action:'alive',reserveHint:true,hintHtml:receipt(s)}).replace('st-stepper-hint','st-stepper-hint receipt')}<section class="count-record">${litterHeading(!s.events.length&&!s.pending)}<div class="count-record-surface st-panel">${metrics([['Born',born(s)],['Dead',sum(s.dead)]],{panel:false})}${sum(s.dead)?causes(s.dead):''}</div>${recordActions(s)}</section>`,footer:recordNavigation(SentriUI.button({label:'Finish farrowing',register:'primary',action:'finish',waiting:born(s)>0&&hasDraft(s),disabled:!born(s)}))};}
function finish(s){
 const rows=row('Weak',s.weak,'classify','weak,',s.weak===0,s.weak+s.deformed>=s.alive)+row('Deformed',s.deformed,'classify','deformed,',s.deformed===0,s.weak+s.deformed>=s.alive)+finishDetails(s,false);
 return {cls:'finish-body',body:`${metrics([['Born',born(s)],['Alive',s.alive],['Dead',sum(s.dead)]])}<section class="finish-condition" aria-label="Piglet condition">${conditionHeading()}<div class="finish-rows">${rows}</div></section>`,footer:footer(SentriUI.backButton({action:'returnCount'}),hold('lock','Finish farrowing',!born(s)))};
}
function moreSowActions(s){return btn('sowActions',`Actions ${icon('chevron')}`,'more-sow-actions').replace('<button',`<button aria-label="Actions for sow ${s.tag}"`);}
function recordActions(s){const pending=sum(s.deathDraft);return `<div class="record-inline-actions" aria-label="Record actions"><div class="record-action-group" role="group" aria-label="Quick actions">${s.events.length||born(s)?btn('edit',`${icon('edit')}<span>Edit</span>`,'record-toolbar-action'):''}${btn('death',`${icon('alert')}<span>Record dead</span>${pending?`<small>${pending} unsaved</small>`:''}`,'record-toolbar-action')}${btn('sowActions',`${icon('more')}<span>Actions</span>`,'record-toolbar-action record-toolbar-more').replace('<button',`<button aria-label="Actions for sow ${s.tag}"`)}</div></div>`;}
function recordNavigation(primary=''){return footer(SentriUI.backButton({action:'close'}),primary,'execution-completion');}
// Right after the hold records her death (or from her row while piglets wait): where do her piglets go? Back = later.
function allocate(s){
 const rows=[SentriUI.choiceRow({mode:'navigate',label:'Move to other sows',meta:'Foster or nurse sow',action:'allocMove'}),SentriUI.choiceRow({mode:'navigate',label:'Hand-rear here',meta:'Bottle or milk replacer in her crate',action:'allocHand'}),...(farmConfig.rearingPen?[SentriUI.choiceRow({mode:'navigate',label:'Move to a rearing pen',meta:'Rescue deck',action:'allocRear'})]:[])];
 // Her death is status, so it is the body's first line, with her tag and pen (she is on screen; no header line repeats her).
 // The count left the title (owner, 2026-10-14: no counts in a title; the title is the job, `Allocate piglets`) and opens this line.
 const e=s.events.find(e=>e.text.startsWith('Sow died'));
 const died=bodyLead(`${s.alive} piglet${s.alive===1?'':'s'} · ${s.tag} · ${s.pen} · sow died ${[e?.day&&e.day!=='Today'?e.day:'',e?.time].filter(Boolean).join(' ')}`.trim());
 return {cls:'allocate-body',body:died+SentriUI.choiceGroup(rows),footer:footer(SentriUI.backButton({action:'close'}))};
}
function locked(s){
 const e=s.events[0];
 const ab=s.productionOutcome==='abortion'?s.events.find(e=>e.text.startsWith('Abortion')):null;
 const body=ab?` ${SentriUI.banner({tone:'danger',size:'inline',headline:['Aborted',ab.text.replace(/^Abortion · ?/,''),[ab.day,ab.time].filter(Boolean).join(' '),initials(ab.who)].filter(Boolean).join(' · ')})}<section class="read-section reading-section">${litterHeading()}${summary(s)}</section>`:s.ended?` ${SentriUI.banner({tone:'danger',size:'inline',headline:['Sow died',s.sowCause.toLowerCase(),...diedStamp(s)].join(' · ')})}<section class="read-section reading-section">${litterHeading()}${summary(s)}</section>`:`${recordStamp(s)?bodyLead(recordStamp(s)):''}<section class="read-section reading-section finish-record">${litterHeading()}${finishFacts(s)}</section>`;
 return {cls:'completed-record-body',body:`${body}${recordActions(s)}`,footer:recordNavigation()};
}
function death(s){const n=sum(s.deathDraft),sow=s.mode==='sow';return {cls:'',body:`${s.ended?'':SentriUI.segment({variant:'view-switch',options:s.ended?[['piglets','Piglets']]:[['piglets','Piglets'],['sow','The sow']],active:s.mode,action:'mode',ariaLabel:'Record death for'})}${sow?SentriUI.choiceRadios({label:'Cause',key:'sowCause',action:'sowCause',options:['Farrowing','Prolapse','Found dead','Other'].map(label=>({value:label,label})),selected:s.sowCause||''})+(s.sowCause==='Other'?SentriUI.optionalRow({label:'Details',value:s.sowNote||'',face:'row',icon:icon('note'),inline:SentriUI.field({label:'Details',labelHidden:true,control:`<input aria-label="Details" data-field="sowNote" value="${esc(s.sowNote)}">`})}):''):types.map((t,i)=>row(t,s.dead[i]+s.deathDraft[i],'deadStep',i+',',s.dead[i],s.locked?s.dead[i]+s.alive-n+s.deathDraft[i]:null,s.deathDraft[i]?'draft-value':'',s.deathDraft[i]?`+${s.deathDraft[i]} unsaved`:'')).join('')}<div class="photo-field">${SentriUI.photos({items:s.photos.map((src,i)=>({id:String(i),src})),action:'addPhoto',viewAction:'photo',active:sow?!!s.sowCause:!!n})}<input type="file" data-field="photo" accept="image/*" capture="environment" class="visually-hidden" tabindex="-1"></div>${sow?SentriUI.banner({tone:'danger',headline:'Saving ends farrowing',consequence:`${s.alive} alive stay under piglet care`}):''}`,corner:n||s.sowCause?cornerClear('clearDeath'):null,footer:footer(SentriUI.backButton({action:'back'}),sow?hold('saveDeath','Record sow death',!s.sowCause||!!sum(s.deathDraft)||!!changes(s).length,true):btn('saveDeath',n?`Record ${n} ${n===1?'death':'deaths'}`:'Record deaths','button primary','',!n),'death-footer')};
}
// Correct born opens in place under the Born row; its footer is Back (drop it) and Apply.
function bornPanel(s){
 const p=s.popup,more=p.mode==='more';
 return `<section class="born-correction" aria-label="Correct born">${SentriUI.segment({variant:'view-switch',options:[['more','More born'],['wrong','Count was wrong']],active:p.mode,action:'bornMode',ariaLabel:'Correct born'})}${farmStepper({label:more?'Extra piglets':'Born should be',prefix:more?'+':'',value:p.n,min:more?1:sum(s.edit.dead),action:'bornStep',reserveHint:false})}${more?`${SentriUI.segment({variant:'view-switch',options:[['alive','Alive'],['died','Died']],active:p.split,action:'bornSplit',ariaLabel:'Extra piglets'})}${p.split==='died'?SentriUI.pickerOptions({options:types.map((t,i)=>[String(i),t]),selected:String(p.cause),action:'bornCause'}):''}`:''}</section>`;
}
function edit(s){
 const e=s.edit,cs=changes(s);
 const bornRow=`<div class="entry-row"><span class="entry-label">Born${e.born!==s.frozen?` <small class="entry-was">was ${s.frozen}</small>`:''}</span><span class="step-value">${e.born}</span>${btn('bornPopup',icon('edit'),'key').replace('<button','<button aria-label="Correct born"')}</div>`;
 const bornOpen=s.popup?.kind==='born';
 return {cls:'edit-body',body:`<div class="edit-counts${bornOpen?' born-open':''}">${s.locked?bornRow+(bornOpen?bornPanel(s):''):row('Alive',e.alive,'editStep','alive,0,',!e.alive,false,'','',s.alive)}${types.map((t,i)=>row(t,e.dead[i],'editStep','dead,'+i+',',e.dead[i]===0,s.locked&&sum(e.dead)>=e.born,'','',s.dead[i])).join('')}</div>${s.locked&&!s.ended?btn('expand',`<span class="section-title">${icon('record')}Finish details</span>${icon('chevron')}`,'edit-finish-door'):''}`,corner:!bornOpen&&cs.length?cornerClear('clearEdit'):null,footer:bornOpen?footer(SentriUI.backButton({action:'cancelPopup'}),btn('applyBorn','Apply','button primary'),'edit-footer'):footer(SentriUI.backButton({action:'back'}),btn('saveEdit','Save correction','button primary','',!cs.length),'edit-footer')};
}
function editFinish(s){
 const e=s.edit,live=Math.max(0,s.finishAlive+e.born-s.frozen);
 const rows=row('Weak',e.weak,'editStep','weak,0,',!e.weak,e.weak+e.deformed>=live,'','',s.weak)+row('Deformed',e.deformed,'editStep','deformed,0,',!e.deformed,e.weak+e.deformed>=live,'','',s.deformed)+finishDetails(s,true);
 return {cls:'edit-body',body:`<section class="finish-condition" aria-label="Piglet condition">${conditionHeading()}<div class="finish-rows">${rows}</div></section>`,corner:changes(s).length?cornerClear('clearEdit'):null,footer:footer(SentriUI.backButton({action:'editCounts'}),btn('saveEdit','Save correction','button primary','',!changes(s).length),'edit-footer')};
}
// Reading destinations share Inspection's medium drawer and record timeline.
// The log and the death breakdown are read from the sow's record drawer, one Back away: no header line (Headers law, 2026-10-13).
function detailSheet(s,title,body,size='medium'){const page=s.view==='history';return SentriUI.sheet({variant:page?'page':'drawer',title,back:{action:'back'},body,footer:page?false:footer(SentriUI.backButton({action:'back'})),className:'detail-sheet',size,label:title,close:{action:'back',label:'Close '+title},scrim:{action:'back',label:'Dismiss '+title},bar:s.view==='history'?status():''});}
function history(s){
 const list=[...s.events];
 if(s.pending)list.unshift({text:s.pending>0?`+${s.pending} alive · this visit`:`${-s.pending} died · this visit`,day:'Today',time:s.stamp,who:'G. Hansen',kind:'open'});
 const groups=[];
 for(const e of list){if(groups.at(-1)?.day!==e.day)groups.push({day:e.day,events:[]});groups.at(-1).events.push(e);}
 const logGroups=groups.map(group=>({label:group.day,entries:group.events.map(e=>({title:e.text,detail:e.kind==='correction'?'Correction':'',at:e.time,by:e.who,extraHtml:e.photos?.length?`<div class="photos">${e.photos.map((p,i)=>btn('savedPhoto',`<img src="${esc(p)}" alt="Recorded photo ${i+1}">`,'',p)).join('')}</div>`:''}))}));
 const body=SentriUI.log(logGroups,{empty:'Counts and saved updates will appear here.'});
 return detailSheet(s,s.productionOutcome?'Production log':'Farrowing log',body);
}
function popup(s){const p=s.popup;if(!p)return'';if(p.kind==='leaveEdit')return SentriUI.sheet({variant:'dialog',title:'Save correction?',body:'',footer:footer(btn('leaveDiscard','Discard','button secondary'),btn('leaveSave','Save','button primary'))});if(p.kind==='photo')return SentriUI.sheet({variant:'dialog',title:'Photo',body:`<img src="${esc(p.src)}" alt="Death record attachment">`,footer:footer(SentriUI.backButton({action:'cancelPopup'}),p.editable?btn('deletePhoto','Delete','button primary danger'):'')});
return '';
}
function deathBreakdown(s){return detailSheet(s,'Death breakdown',SentriUI.facts([...s.dead.map((n,i)=>n?{label:types[i],value:n}:null).filter(Boolean),{label:'Total dead',value:sum(s.dead)}]),'compact');}
function profile(s){return `<iframe class="sow-detail-frame" title="Sow details · ${esc(s.tag)}" src="inspection-astra-concept.html?layout=focus&embed=sow&v=stage-actions-15${ZH?'&lang=zh':''}"></iframe>`;}
const sowDetailContexts=new WeakMap();
function sowActionCatalogue(s){return [
 {id:'miscarriage',title:'Record abortion',group:'production',scope:'farrowing',sub:'Record a pregnancy loss',reason:s.ended?'This sow has died.':s.productionOutcome?'A production outcome is already recorded.':s.locked?'Farrowing is already finished.':''},
 {id:'piglets',title:'Piglet processing',group:'production',scope:'piglet-processing',sub:`Care and identity · ${s.piglets.filter(p=>p.state==='Alive').length} identified · ${s.unidentified} without identity`,icon:'profile',reason:!born(s)?'Record the litter first.':''},
 {id:'death',inDrawer:true,title:'Record piglet deaths',group:'production',scope:'piglet-processing',sub:'Record stillbirths and deaths in this litter',icon:'alert',reason:s.productionOutcome?'A production outcome is already recorded.':!born(s)?'Record the litter first.':''},
 {id:'countReconcile',title:'Reconcile piglet count',group:'production',scope:'piglet-processing',sub:`System count ${s.alive} · explain a mismatch`,icon:'note',reason:!born(s)?'Record the litter first.':''},
 {id:'edit',inDrawer:true,title:'Edit litter record',group:'production',scope:'farrowing',sub:'Correct counts and recorded details',reason:born(s)?'':'No litter has been recorded yet.'},
 {id:'sow-death',inDrawer:true,title:'Record sow death',group:'health',sub:'Record the death of this sow',reason:s.ended?'Sow death is already recorded.':''},
 {id:'foster',title:'Foster piglets',group:'production',scope:'piglet-processing',sub:'Send or receive piglets between litters',icon:'hospital',reason:!s.alive?'No live piglets recorded.':''},
 {id:'remove-batch',title:'Remove from batch',group:'production',scope:'other',sub:'Remove this sow without recording a litter',icon:'close',reason:s.ended?'This sow has died.':s.productionOutcome?'A production outcome is already recorded.':born(s)?'A litter has already been recorded.':''},
 {id:'not-in-pig',title:'Mark not in pig',group:'production',scope:'farrowing',sub:'Record the outcome and return to rebreed watch',icon:'alert',reason:s.ended?'This sow has died.':s.productionOutcome?'A production outcome is already recorded.':born(s)?'A litter has already been recorded.':''},
 {id:'move-batch',title:'Move to another farrowing batch',group:'production',scope:'other',sub:'Keep the sow in the production plan',icon:'transfer',reason:'No destination farrowing batches are connected in this preview.'},
 {id:'marker',title:s.markers.length?'Edit note':'Add note',content:s.markers.length>0,group:'routine',sub:s.markers[0]?.text||'Leave a note or describe a visible marker',icon:'note',reason:s.ended?'This sow has died.':''},
 {id:'transfer',title:'Transfer sow',group:'routine',sub:'Move this sow to another unit or pen',icon:'transfer',reason:s.ended?'This sow has died.':''}
];}
// Scan's Actions: the embedded actions page opens for the first ticked sow, and the row the worker chose is opened in it.
const deepSelectors={transfer:'[data-action="sow-host-action"][data-value="transfer"]',marker:'[data-action="sow-host-action"][data-value="marker"]',health:'[data-action="health"]',treatment:'[data-action="treatment"]'};
function deepLinkInto(frame,key){let n=0;const t=setInterval(()=>{const el=frame.contentDocument?.querySelector(deepSelectors[key]);if(el){clearInterval(t);el.click();}else if(++n>50)clearInterval(t);},60);}
function connectSowDetail(root,s){
 const frame=root.querySelector('.sow-detail-frame');if(!frame)return;
 frame.addEventListener('load',()=>{
  const events=s.pending?[{text:(s.pending>0?'+':'')+s.pending+' alive · this visit',day:'Today',time:s.stamp,who:'G. Hansen'},...s.events]:s.events;
  const tasks=!s.productionOutcome&&!s.ended?[{id:'farrowing',title:'Farrowing',type:'Production',status:s.locked?'Finished':born(s)?'In progress':'Awaiting',summary:born(s)?s.alive+' alive · '+sum(s.dead)+' dead':'Record this sow’s litter'},...(born(s)?[{id:'piglet-processing',title:'Piglet processing',type:'Production',status:s.processingTasks.some(t=>!t.done)?'Due today':'Up to date',summary:s.processingTasks.filter(t=>t.done).length+' of '+s.processingTasks.length+' care steps done'}]:[]),...(s.tag==='000418'?[{id:'vaccination',title:'Vaccination',type:'Health',status:'Due today',summary:'Scheduled vaccination'},{id:'treatment-task',title:'Treatment',type:'Health',status:'Due today',summary:'Scheduled treatment'}]:[])]:[];
  if(s.deepLink){const key=s.deepLink;s.deepLink='';deepLinkInto(frame,key);}
  frame.contentWindow.postMessage({type:'open-sow-detail',record:{id:s.tag,pen:s.pen,unit:(roomContext(s).units.find(u=>u.records.includes(s))||roomContext(s).unit).name,parity:s.parity,batch:'28',breed:'Landrace × Large White',serviceDate:'2026-05-21',expectedFarrowing:'2026-09-12',stage:s.ended?'Sow died':s.locked?'Lactating':born(s)?'Farrowing':'Gestating',events},tasks,destinations:roomContext(s).units.map(u=>({id:u.id,name:u.name,pens:[...new Set(u.records.map(r=>r.pen))]})),context:sowDetailContexts.get(s),entry:s.actionsEntry?'actions':'pig',actions:sowActionCatalogue(s).filter(x=>!x.inDrawer)},location.origin);
 },{once:true});
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||!['sow-detail-state','sow-detail-close','sow-action'].includes(e.data?.type))return;
 const i=states.findIndex((s,i)=>s.view==='profile'&&document.querySelector(`[data-card="${i}"] .sow-detail-frame`)?.contentWindow===e.source);
 if(i<0)return;const s=states[i];sowDetailContexts.set(s,e.data.context);
 // Scan's Actions opened one of her flows directly: leaving that flow goes back to the scan list in one Back, not via her Actions sheet.
 if(e.data.type==='sow-detail-state'&&s.scanDeep){const v=e.data.context?.view;if(v&&v!=='actions')s.scanDeep='in';else if(s.scanDeep==='in'&&v==='actions'){s.scanDeep=false;s.actionsEntry=false;act(s,'back');render(i);return;}}
 const viaScan=!!s.scanDeep;if(e.data.type!=='sow-detail-state')s.scanDeep=false;
 if(e.data.type==='sow-action'){
  const a=e.data.action;if(a==='current-task'&&!s.productionOutcome&&!s.ended){s.actionReturn=false;s.actionsEntry=false;s.view=e.data.taskId==='piglet-processing'&&born(s)?'pigletCare':s.locked?'locked':'count';render(i);return;}const actionId={'save-miscarriage':'miscarriage','save-transfer':'transfer','save-batch-removal':'remove-batch','save-not-in-pig':'not-in-pig'}[a]||a,entry=sowActionCatalogue(s).find(x=>x.id===actionId&&!x.reason);if(!entry)return;
  if(a==='save-transfer'){const c=roomContext(s),from=c.units.find(u=>u.records.includes(s)),to=c.units.find(u=>u.id===e.data.unit),pen=String(e.data.pen||'');if(!from||!to||!to.records.some(r=>r.pen===pen)||(from===to&&s.pen===pen))return;const origin=from.name+' · '+s.pen;if(from!==to){from.records.splice(from.records.indexOf(s),1);to.records.push(s);}s.pen=pen;switchRoomUnit(c,to.id);c.currentPen=pen;event(s,'Transferred · '+origin+' → '+to.name+' · '+pen,'milestone');s.actionsEntry=true;s.view='profile';}
  else if(a==='save-miscarriage'){const reason=String(e.data.reason||'').trim();if(!reason)return;s.frozen=born(s);s.productionOutcome='abortion';s.locked=true;event(s,'Abortion · '+reason,'danger');s.actionsEntry=false;s.view='history';s.pageBack='room';}
  else if(a==='save-batch-removal'){const reason=String(e.data.reason||'').trim();if(!reason)return;s.productionOutcome='removed';s.locked=true;s.frozen=0;s.alive=0;s.pending=0;event(s,'Removed from farrowing batch · '+reason+(e.data.note?' · '+String(e.data.note).trim():''),'milestone');s.actionsEntry=false;s.view='history';s.pageBack='room';}
  else if(a==='save-not-in-pig'){const reason=String(e.data.reason||'').trim();if(!reason)return;s.productionOutcome='not-in-pig';s.locked=true;s.frozen=0;s.alive=0;s.pending=0;event(s,'Not in pig · '+reason+(e.data.note?' · '+String(e.data.note).trim():''),'milestone');s.actionsEntry=false;s.view='history';s.pageBack='room';}
  else {s.actionReturn=true;s.scanReturn=viaScan;s.view=s.locked?'locked':'count';if(a==='sow-death'){act(s,'death');s.mode='sow';}else act(s,a);}
  render(i);return;
 }
 if(e.data.type==='sow-detail-close'){s.actionsEntry=false;act(s,'back');render(i);document.querySelector(`[data-card="${i}"] [data-action="profile"]`)?.focus({preventScroll:true,focusVisible:false});}
});

// Actions launched from the sow's record (More actions): pages with the page header and no line; More actions (her chip) is one Back away.
// Piglet processing is the page the piglet identity, mortality and foster pages come back to, so it carries the route (her chip,
// her pen): every surface about her shows her on screen or one Back away.
function featurePage(s,title,body,primary='',cls='',line=null){
 return SentriUI.sheet({variant:'page',title,line,back:{action:'featureBack'},body,footer:pageFooter(primary),className:('feature-page '+cls).trim(),label:title,bar:status()});
}
function markerPage(s){
 const existing=s.markers[0];
 const body=`${existing?SentriUI.panel(`<span>Current note</span><strong>${esc(existing.text)}</strong><small>${esc(existing.meta)}</small>`,{className:'feature-summary',tag:'section'}):''}${SentriUI.field({label:'Note',control:`<textarea data-marker-draft rows="5" placeholder="For example: red line on left shoulder · monitor overnight">${esc(s.markerDraft??existing?.text??'')}</textarea>`,className:'feature-field'})}<p class="feature-hint">Use this for handover information or a visible marker on the sow. The update stays in her history.</p>`;
 return featurePage(s,existing?'Edit note':'Add note',body,btn('saveMarker','Save note','button primary','',!(s.markerDraft??existing?.text??'').trim()),'marker-page');
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
 return featurePage(s,'Piglet processing',tabs+(care?processingCare(s):processingRecords(s)),primary,'piglet-care-page',{chip:{id:s.tag,action:'profile',label:'View sow '+s.tag+' details'},facts:[sowPlace(s)]});
}
function pigletEditPage(s){
 const p=s.pigletDraft||{tag:'',notch:'',sex:'',weight:''},valid=[p.tag,p.notch,p.sex,p.weight].some(x=>String(x||'').trim()&&x!=='Choose notch');
 const body=SentriUI.panel(`<strong>${s.pigletEditIndex<0?'New identity':'Edit identity'}</strong><span>Enter what is known. Empty fields remain visibly incomplete.</span>`,{className:'feature-callout'})+`<div class="piglet-edit-grid">${SentriUI.field({label:'Ear tag',control:`<input data-piglet-field="tag" value="${esc(p.tag)}" inputmode="numeric" placeholder="Scan or enter tag">`,className:'feature-field'})}${SentriUI.field({label:'Ear notch',control:`<input data-piglet-field="notch" value="${esc(p.notch==='Choose notch'?'':p.notch)}" placeholder="Choose or enter notch">`,className:'feature-field'})}${SentriUI.pickerField({label:'Sex',value:p.sex||'',placeholder:'Select',key:'piglet:sex',className:'feature-field'})}${SentriUI.field({label:'Weight <span>kg</span>',control:`<input data-piglet-field="weight" value="${esc(p.weight)}" inputmode="decimal" type="number" min="0" step="0.1" placeholder="—">`,className:'feature-field'})}</div>`;
 return featurePage(s,s.pigletEditIndex<0?'Add piglet identity':'Piglet identity',body,btn('savePiglet','Save identity','button primary','',!valid),'piglet-edit-page');
}
function fosterCandidates(s){return roomContext(s).units.flatMap(u=>u.records).filter(r=>r!==s&&!r.ended&&!r.productionOutcome&&born(r)>0).slice(0,4);}
function fosterPage(s){
 const f=s.fosterDraft,context=roomContext(s),candidates=fosterCandidates(s),max=f.direction==='out'?s.alive:20;
 const body=`${SentriUI.segment({variant:'view-switch',options:[['out','Send piglets'],['in','Receive piglets']],active:f.direction,action:'fosterDirection',ariaLabel:'Direction'})}${SentriUI.choiceGroup(candidates.map(r=>{const unit=context.units.find(u=>u.records.includes(r))?.name||'';return SentriUI.choiceRow({label:r.tag,mono:true,meta:`${unit} · ${r.pen} · ${r.alive} alive`,action:'fosterTarget',value:r.tag,selected:f.target===r.tag});}),{title:'Other sow',className:'foster-choice'})}<section class="feature-section">${farmStepper({variant:'well',label:'Number of piglets',value:f.count,min:1,max,action:'fosterCount',reserveHint:false})}<p class="feature-hint">${f.direction==='out'?'The current litter decreases immediately. Piglets without identity are moved first.':'The received piglets are added without identity until their details are known.'}</p></section>`;
 return featurePage(s,'Foster piglets',body,btn('saveFoster',`${f.direction==='out'?'Send':'Receive'} ${f.count} piglet${f.count===1?'':'s'}`,'button primary','',!f.target||f.count<1),'foster-page');
}
function pigletDeathPage(s){
 const f=s.mortalityDraft,total=s.pigletSelected.length+f.unidentified;
 const body=SentriUI.panel(`<strong>${s.pigletSelected.length} identified selected</strong><span>${s.pigletSelected.join(' · ')||'No identified piglets selected'}</span>`,{className:'feature-callout'})+`${s.unidentified?`<section class="feature-section">${farmStepper({variant:'well',label:'Unidentified piglets',value:f.unidentified,max:Math.min(s.unidentified,s.alive-s.pigletSelected.length),action:'mortalityCount',reserveHint:false})}</section>`:''}${SentriUI.pickerField({label:'Cause',value:f.cause,placeholder:'Select',key:'mortality:cause',className:'feature-field'})}<div class="photo-field">${SentriUI.photos({items:f.photos.map((src,i)=>({id:String(i),src})),action:'addPhoto',viewAction:'mortalityPhoto'})}<input type="file" data-piglet-photo accept="image/*" capture="environment" multiple class="visually-hidden" tabindex="-1"></div><p class="feature-hint">One cause is applied to this save. Use another pass when the causes differ.</p>`;
 return featurePage(s,'Record piglet deaths',body,btn('savePigletMortality',`Save mortality${total?' · '+total:''}`,'button primary','',!f.cause||!total),'piglet-death-page');
}
function countReconcilePage(s){
 const identified=s.piglets.filter(p=>p.state==='Alive').length,changed=s.countDraft!==s.alive;
 const body=`<section class="count-compare"><div><span>System count</span><strong>${s.alive}</strong></div></section><section class="feature-section">${farmStepper({variant:'well',label:'Count the piglets in this litter',value:s.countDraft,min:identified,max:30,action:'countReconcileStep',reserveHint:false})}<p class="feature-hint">The count cannot be lower than the ${identified} identified piglets still recorded alive.</p></section>${changed?`<div class="feature-warning">${icon('alert')}<span><strong>Your count will replace ${s.alive}</strong><small>${s.countDraft>s.alive?s.countDraft-s.alive+' piglets will be added without identity.':s.alive-s.countDraft+' piglets without identity will be removed.'}</small></span></div>`:''}${SentriUI.field({label:'Reason for mismatch',control:`<textarea rows="3" data-count-reason placeholder="What explains the difference?">${esc(s.countReason)}</textarea>`,className:'feature-field'})}`;
 return featurePage(s,'Correct piglet count',body,btn('saveCountReconcile','Save corrected count','button primary','',!changed||!s.countReason.trim()),'count-reconcile-page');
}
function capabilitySurface(s){return s.view==='marker'?markerPage(s):s.view==='pigletCare'?pigletCarePage(s):s.view==='pigletEdit'?pigletEditPage(s):s.view==='foster'?fosterPage(s):s.view==='pigletDeath'?pigletDeathPage(s):s.view==='countReconcile'?countReconcilePage(s):'';}

function farrowingRecordSurface(s){const surface=({count,finish,locked,death,edit,editFinish,allocate})[s.view];if(!surface)return '';const v=surface(s),h=identity(s),page=AstraSurfaces.isPage('farrowing',s.view);
 const label={allocate:'Allocate piglets',count:'Count alive',finish:'Finish farrowing',locked:'Locked litter',death:'Record dead',editFinish:'Edit finish details',edit:'Edit record'}[s.view];
 return SentriUI.sheet(Object.assign({variant:page?'page':'drawer',body:v.body,bodyClass:v.cls,corner:v.corner||null,footer:v.footer,size:['death','edit','editFinish','finish'].includes(s.view)?'long':'medium',sizing:['count','death','edit'].includes(s.view)?'full':'content',view:s.view,label,scrim:{action:'dismiss',label:'Dismiss sheet'},bar:page?status():''},h));}
function farrowingBackground(s){
 if(s.view==='roomPicker'){const c=roomContext(s),back=c.picker?.returnView||'';const behind=['roomPenReadNote','roomPenNote','roomPenFault','roomPenFaultRecord'].includes(back)?penSubpage({...s,view:back},c):['marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile'].includes(back)?capabilitySurface({...s,view:back}):'';return behind?'<div class="page-background" inert aria-hidden="true">'+behind+'</div>':'';}
 if(['roomPenReadNote','roomPenNote','roomPenFault','roomPenFaultRecord'].includes(s.view))return '<div class="page-background" inert aria-hidden="true">'+penDetails(roomContext(s))+'</div>';
 if(!['death','edit','editFinish','deathBreakdown','profile'].includes(s.view))return '';
 const parent=s.view==='profile'||s.view==='deathBreakdown'?s.pageBack:s.back;
 if(!['count','finish'].includes(parent))return '';
 return '<div class="page-background" inert aria-hidden="true">'+farrowingRecordSurface({...s,view:parent})+'</div>';
}
function render(i,focusKey){const s=states[i],context=roomContext(s);persistDraft(s);if(s.view==='profile'&&s.actionsEntry)s.actionReturn=false; /* back at the actions drawer: the pending return is spent, or the drawer's own Back would reopen it */if(s.actionReturn&&['count','locked'].includes(s.view)){s.actionReturn=false;if(!s.ended){s.view='profile';s.actionsEntry=true;}}if(s.view==='room'&&context.returnToTaskReview){s.view=context.returnToTaskReview;context.returnToTaskReview=false;}const root=document.querySelector(`[data-card="${i}"]`);clearTimeout(reminderTimers[i]);if(s.view!=='count')s.pointers=false;if(s.pointers)reminderTimers[i]=setTimeout(()=>{if(states[i]!==s||s.view!=='count')return;s.pointers=false;const status=root.querySelector('.receipt');if(status)status.innerHTML=receipt(s);},4000);const active=root.contains(document.activeElement)?document.activeElement:null,field=active?.dataset?.field,fieldValue=active?.value;if(root.dataset.view==='roomOverview')context.overviewScroll=root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0;const previousPopup=root.dataset.popup||'';const popupChanged=previousPopup!==(s.popup?.kind||'');root.dataset.popup=s.popup?.kind||'';const sameView=root.dataset.view===s.view;const scroll=sameView?root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0:0;root.dataset.view=s.view;root.querySelector('.phone').innerHTML=`<div class="room-surface"${!['room','roomHome','roomSearch','roomScan'].includes(s.view)?' inert':''}>${room(s)}</div>`+farrowingBackground(s)+farrowingRecordSurface(s)+roomOverlay(s)+capabilitySurface(s)+(s.view==='history'?history(s):s.view==='profile'?profile(s):s.view==='deathBreakdown'?deathBreakdown(s):'')+popup(s);placeTaskSyncBadge(root);connectSowDetail(root,s);if(root.querySelector('.phone > .sheet > .sheet-body'))root.querySelector('.phone > .sheet > .sheet-body').scrollTop=s.view==='roomOverview'?(context.overviewScroll||0):scroll;if(s.popup&&s.popup.kind!=='born'){root.querySelectorAll('.phone > :not(.dialog-backdrop)').forEach(e=>e.setAttribute('inert',''));root.querySelector('.record-page')?.setAttribute('inert','');}if(!sameView){root.querySelector('.phone > .sheet,.phone > .record-page')?.focus({preventScroll:true,focusVisible:false});}if(popupChanged&&s.popup)root.querySelector('.dialog input,.dialog button')?.focus({preventScroll:true,focusVisible:false});else if(popupChanged&&previousPopup==='born')root.querySelector('[data-action="bornPopup"]')?.focus({preventScroll:true,focusVisible:false});if(field){[...root.querySelectorAll('.phone > .sheet [data-field]')].find(x=>x.dataset.field===field&&(x.type!=='radio'||x.value===fieldValue))?.focus({preventScroll:true,focusVisible:false});}if(focusKey){const target=Array.from(root.querySelectorAll('.phone > .sheet [data-action]')).find(e=>e.dataset.action===focusKey.a&&e.dataset.value===focusKey.v);const focusTarget=target&&!target.disabled?target:target?.closest('.st-stepper')?.querySelector('button:not(:disabled)')||root.querySelector('.phone > .sheet,.phone > .record-page');focusTarget?.focus({preventScroll:true,focusVisible:false});}SentriUI.liveFill(root,{delay:0});if(popupChanged&&previousPopup==='photo'&&!s.popup){const origin=s.photoOrigin;root.querySelector(`[data-action="${origin?.action||'addPhoto'}"][data-value="${origin?.index??'photos'}"]`)?.focus();}roomAfterRender(i);if(i===0&&window.AtlasBare)AtlasBare.watch(()=>atlasScreen(s,context)); }
// Pointer taps keep keyboard focus position without drawing a keyboard-only ring.
document.addEventListener('pointerdown',()=>document.documentElement.dataset.inputMode='pointer',true);
document.addEventListener('keydown',()=>delete document.documentElement.dataset.inputMode,true);
const gallery=document.getElementById('gallery');gallery.innerHTML=cards.map((c,i)=>`<article class="spec" data-card="${i}"><div class="spec-head"><div class="spec-title"><span>0${i+1}</span>${c.title}</div><button type="button" class="demo-scan" data-demo-scan hidden>Simulate scan</button><select class="scenario" aria-label="Example for ${c.title}">${presets.map(([v,l])=>`<option value="${v}"${v===c.initial?' selected':''}>${l}</option>`).join('')}</select></div><div class="phone farrowing-phone"></div><p class="caption">${c.caption}</p></article>`).join('');states.forEach((_,i)=>render(i));
// The range slider reports each change; keep the draft and the live count in step.
gallery.addEventListener('sentri-range-change',e=>{const root=e.target.closest('[data-card]'),c=roomContext(states[+root.dataset.card]);Object.assign(c.filterDraft,e.detail.values);const n=visibleRoomRecords(c,c.filterDraft).length;e.target.closest('.sheet').querySelector('[data-action="room-apply-filter"]').textContent='Show '+n+' '+(n===1?'sow':'sows');});
// Choose pigs: typing narrows the list where it is, so the field keeps focus; Clear shows only while something is typed.
gallery.addEventListener('input',e=>{if(!e.target.matches('[data-batch-search]'))return;const i=+e.target.closest('[data-card]').dataset.card,c=roomContext(states[i]),page=e.target.closest('.batch-pick');c.batch.q=e.target.value;page.querySelector('.batch-list').innerHTML=batchRows(c);page.querySelector('[data-action="room-batch-clear"]')?.toggleAttribute('hidden',!c.batch.q);});
gallery.addEventListener('input',e=>{if(!e.target.matches('[data-room-search]'))return;const i=+e.target.closest('[data-card]').dataset.card,c=roomContext(states[i]),page=e.target.closest('.st-find');c.query=e.target.value;page.querySelector('.st-find-results').innerHTML=searchBody(c);page.querySelector('.st-find-clear').hidden=!c.query;if(i===0&&window.AtlasBare)AtlasBare.watch(()=>atlasScreen(states[0],c));});
// The demo's own control, outside the phone: the reader reads the next sample sow.
document.addEventListener('click',e=>{const b=e.target.closest('[data-demo-scan]');if(!b||b.disabled)return;const i=+b.closest('[data-card]').dataset.card,s=states[i],c=roomContext(s);
 // Choosing sows: a read ticks her (a repeat read keeps her ticked); a pig from outside the room joins above the pens.
 // Choosing pigs, scanning: a read ticks her and marks her row (a repeat read keeps her ticked); a pig from another unit is not added.
 if(s.view==='roomBatchPick'&&c.batch.scanning){const b=c.batch,tag=b.scanning==='waiting'?'':batchScans[b.seq++%batchScans.length],p=unitPigs(c).find(x=>x.tag===tag);if(b.scanning==='waiting'){c.scan.connected=true;b.scanning=true;render(i);return;}   // the reader connects: scanning starts
  if(p){if(!b.picked.includes(tag))b.picked.push(tag);b.fresh[tag]=Date.now()+1600;b.last=tag;b.outside='';}else b.outside=tag;render(i);return;}
 const tag=scanRead(c);if(tag){roomAction(i,findSow(c,tag)?'room-sow':'room-pig',tag);render(i);}});
// A pig profile's own Back returns to the page she was found on.
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='sow-detail-close')return;const i=states.findIndex((s,k)=>['roomPig','roomBatchForm'].includes(s.view)&&document.querySelector(`[data-card="${k}"] .room-pig-frame`)?.contentWindow===e.source);if(i<0)return;const s=states[i],c=roomContext(s);
 // The form's Back returns to Choose sows; its save returns to the room, which names the count.
 if(s.view==='roomBatchForm'){if(e.data.saved){c.toast={title:e.data.saved,until:Date.now()+3200};c.batch=null;s.view='room';}else s.view='roomBatchPick';render(i);return;}
 s.view=c.pigFrom||'room';render(i);});
gallery.addEventListener('scroll',e=>{if(!e.target.matches('.room-scroll'))return;const list=e.target,i=+list.closest('[data-card]').dataset.card,c=roomContext(states[i]);c.scroll=list.scrollTop;if(states[i].view!=='room')return;const top=list.getBoundingClientRect().top+list.querySelector('.room-controls').offsetHeight;const pen=[...list.querySelectorAll('[data-pen]')].find(p=>p.getBoundingClientRect().bottom>top+35);if(pen)c.currentPen=pen.dataset.pen;},true);
let grabStart=null;
SentriUI.holdBind(gallery,{onCommit(el){const i=+el.closest('[data-card]').dataset.card,record=states[i];if(!roomAction(i,el.dataset.action,el.dataset.value))act(record,el.dataset.action);render(i);}});
gallery.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(e.target.closest('.grab'))grabStart={y:e.clientY,i:+e.target.closest('[data-card]').dataset.card};});
gallery.addEventListener('pointerup',e=>{if(grabStart){if(e.clientY-grabStart.y>100||Math.abs(e.clientY-grabStart.y)<8){const s=states[grabStart.i];if(['marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile'].includes(s.view))act(s,'featureBack');else if(['death','edit','editFinish','history','profile','deathBreakdown'].includes(s.view))act(s,'back');else if(s.view==='finish')s.view='count';else if(s.view.startsWith('room'))roomAction(grabStart.i,'room-back');else act(s,'close');render(grabStart.i);}grabStart=null;}});
gallery.addEventListener('pointercancel',()=>{grabStart=null});
gallery.addEventListener('keydown',e=>{const pi=e.target.closest?.('[data-card]')?+e.target.closest('[data-card]').dataset.card:-1;if(e.key==='Tab'&&e.target.closest('.dialog,.sheet')){const items=[...e.target.closest('.dialog,.sheet').querySelectorAll('button:not(:disabled),input:not(:disabled):not([tabindex="-1"]),select,textarea')],first=items[0],last=items[items.length-1];if(e.shiftKey&&e.target===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&e.target===last){e.preventDefault();first?.focus();}}if(e.key==='Escape'){const i=+e.target.closest('[data-card]').dataset.card,s=states[i];if(s.popup)s.popup=null;else if(['marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile'].includes(s.view))act(s,'featureBack');else if(['death','edit','editFinish','history','profile','deathBreakdown'].includes(s.view))act(s,'back');else if(s.view==='finish')s.view='count';else if(s.view.startsWith('room'))roomAction(i,'room-back');else act(s,'close');render(i);}});
// Record dead: opening the sow's Details grows the body; keep the danger banner whole above the footer (crit round 2).
gallery.addEventListener('click',e=>{const row=e.target.closest('.sheet[data-view=death] [data-st-optional]');if(row)requestAnimationFrame(()=>row.closest('.sheet-body')?.querySelector(':scope > .st-banner')?.scrollIntoView({block:'nearest'}));});
gallery.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled||el.classList.contains('st-hold'))return;
 // Finish waits while a draft is open; the tap brings the worker to Record dead, where the draft is said ("1 unsaved") and can be saved.
 if(el.dataset.action==='finish'&&el.getAttribute('aria-disabled')==='true'){const k=+el.closest('[data-card]').dataset.card,w=states[k];if(hasDraft(w)){act(w,'death');render(k);}return;}
 if(el.dataset.action==='open-task-sync'){if(!SentriUI.guard(el))openTaskSync();return;}
 // A waiting camera (floor-gray) answers in its hint line, shown only for the answer: long enough to read, and in view.
 if(el.dataset.action==='addPhoto'&&el.getAttribute('aria-disabled')==='true'){SentriUI.guard(el,{flash:4000});document.getElementById(el.getAttribute('aria-describedby'))?.scrollIntoView({block:'nearest'});return;}
 if(SentriUI.guard(el))return;const i=+el.closest('[data-card]').dataset.card,s=states[i];let a=el.dataset.action,v=el.dataset.value;const before=s.view,beforePopup=s.popup?.kind;if(a==='room-pen'&&s.view==='roomGrid'&&settleOnPen(i,v))return;if(roomAction(i,a,v)){render(i,s.view===before?{a,v}:null);return;}if(a==='addPhoto'){el.closest('.photo-field').querySelector('input[type=file]').click();return;}if(a==='savedPhoto'){s.popup={kind:'photo',src:v,editable:false};render(i);return;}if(a==='otherSow'){states[i]=seed('before');states[i].pen='B2';states[i].tag='000392';states[i].parity=5;states[i].due='Due tomorrow · day 113';render(i);return;}if(a==='open-picker'){const c=roomContext(s),key=el.dataset.pickerKey,configs={'pen:device':{label:'Device',options:['Feeding station','Drinking station','Other'].map(d=>[d,d]),selected:c.penDraft?.device||'',returnView:'roomPenFault'},'piglet:sex':{label:'Sex',options:[['Female','Female'],['Male','Male']],selected:s.pigletDraft?.sex||'',returnView:'pigletEdit'},'mortality:cause':{label:'Cause',options:mortalityCauses.map(x=>[x,x]),selected:s.mortalityDraft?.cause||'',returnView:'pigletDeath'}},config=configs[key];if(!config)return;c.picker={key,...config};s.view='roomPicker';render(i);return;}if(a==='picker-select'){const c=roomContext(s),p=c.picker;if(!p)return;if(p.key==='pen:device')(c.penDraft=c.penDraft||{}).device=v;else if(p.key==='piglet:sex')s.pigletDraft.sex=v;else if(p.key==='mortality:cause')s.mortalityDraft.cause=v;s.view=p.returnView;c.picker=null;render(i);return;}if(a==='returnCount'){s.view='count';}else if(a==='dismiss'){if(['death','edit','editFinish','history','profile','deathBreakdown'].includes(s.view))act(s,'back');else if(s.view==='finish')s.view='count';else act(s,'close');}else act(s,a,v);render(i,s.view===before&&s.popup?.kind===beforePopup?{a,v}:null);if(s.view!==before){const body=el.closest('.spec')?.querySelector('.sheet-body');if(body)body.scrollTop=0;} });
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
 if(e.target.hasAttribute('data-piglet-search')){s.pigletQuery=e.target.value;render(i);root.querySelector('[data-piglet-search]')?.focus({preventScroll:true,focusVisible:false});}
});
SentriUI.radioBind(gallery,{onChange:(field,value)=>{if(!['bornMode','sowCause','assistance','editAssistance'].includes(field))return;const i=+document.activeElement.closest('[data-card]').dataset.card;act(states[i],field,value);render(i);}});
gallery.addEventListener('change',e=>{
 const root=e.target.closest('[data-card]');if(!root)return;const i=+root.dataset.card,s=states[i];
 if(e.target.hasAttribute('data-piglet-field')){s.pigletDraft[e.target.dataset.pigletField]=e.target.value;render(i);return;}
 if(e.target.hasAttribute('data-piglet-photo')){for(const file of e.target.files){if(s.mortalityDraft.photos.length>=12)break;s.mortalityDraft.photos.push(URL.createObjectURL(file));};render(i);}
});
function updateTextField(el,i){
 const s=states[i],target=el.dataset.edit==='true'?s.edit:s,f=el.dataset.field;
 if(f==='weight'){const c=cleanWeight(el.value);if(c!==el.value)el.value=c;}
 target[f]=el.value;
 if(f==='weight'&&el.dataset.edit==='true'){const save=el.closest('.spec')?.querySelector('[data-action="saveEdit"]');if(save)save.disabled=!changes(s).length;}
 }
// Done (Enter) on the weight closes the system keyboard; leaving the field redraws the sheet (the edit form's Clear, the kept value).
gallery.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset?.field==='weight'){e.preventDefault();e.target.blur();}});
gallery.addEventListener('change',e=>{if(e.target.dataset?.field!=='weight')return;render(+e.target.closest('[data-card]').dataset.card);});
gallery.addEventListener('input',e=>{if(['weight','sowNote'].includes(e.target.dataset.field))updateTextField(e.target,+e.target.closest('[data-card]').dataset.card);});
gallery.addEventListener('change',e=>{const el=e.target,card=el.closest('[data-card]');if(!card)return;const i=+card.dataset.card,s=states[i];if(el.matches('.scenario')){roomContexts[i]=null;states[i]=seed(el.value);restoreDraft(states[i]);if(el.value==='foster')act(states[i],'foster');if(el.value==='reconcile')act(states[i],'countReconcile');render(i);return;}const f=el.dataset.field;if(!f)return;if(f==='sowNote'){updateTextField(el,i);return;}if(f==='photo'){for(const file of el.files){if(s.photos.length>=12)break;s.photos.push(URL.createObjectURL(file));}}else{const target=el.dataset.edit==='true'?s.edit:s;target[f]=f==='assisted'?el.value==='true':el.type==='checkbox'?el.checked:el.value;}render(i,f==='photo'?{a:'addPhoto',v:'photos'}:undefined);});
document.getElementById('reset-all').onclick=()=>{states.forEach((s,i)=>{roomContexts[i]=null;try{sessionStorage.removeItem(draftKey(s));}catch(e){}states[i]=seed(cards[i].initial);document.querySelector(`[data-card="${i}"] .scenario`).value=cards[i].initial;render(i);});};
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const focus=b.dataset.layout==='focus';gallery.classList.toggle('focus',focus);document.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',x===b));const u=new URL(location.href);u.searchParams.set('layout',focus?'focus':'overview');window.history.replaceState(null,'',u);});
if(new URLSearchParams(location.search).get('layout')==='focus')document.querySelector('[data-layout="focus"]').click();
// Home opens the existing whole-task overview or the selected unit directly.
if(window.SentriHomeLink){
 const link=window.SentriHomeLink,c=roomContext(states[0]);
 if(link.unit){const record=switchRoomUnit(c,link.unit);if(record)states[0]=record;}
 let homeOverview=false;
 states[0].view='room';render(0);
 document.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='room-unit')homeOverview=false;
  if(!homeOverview||states[0].view!=='roomOverview'||action!=='room-back')return;
  e.preventDefault();e.stopImmediatePropagation();link.back();
 },true);
}
})();


{const m=(globalThis.location?.search||'').match(/[?&]desc=(\d+)/);if(m&&globalThis.document){const st=document.createElement('style');st.textContent='.tw-info{font-size:'+m[1]+'px!important;line-height:'+(+m[1]+5)+'px!important}';document.head.appendChild(st);}}
