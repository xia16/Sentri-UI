/* Inspection study: in-memory sample farm plans; no production writes. */
(()=>{
'use strict';
// Fixed walk date keeps relative ages stable across the sample scenarios.
const walkDate='2026-09-12';
const unitName=c=>c.unitLabel||(globalThis.SentriHomeLink?.unit?'Unit '+globalThis.SentriHomeLink.unit:'Unit 7');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={more:'M5 12h.01M12 12h.01M19 12h.01',monitor:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',treat:'M15 3l6 6M16 4l-4 4M20 8l-4 4M10 6l8 8M11 7l-7 7v6h6l7-7M4 20l-2 2M8 12l3 3M11 9l3 3',hospital:'M13 3h8v18h-8M17 3v18M13 7h8M13 17h8M2 12h12M9 8l5 4-5 4',profile:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',chart:'M4 20V10M12 20V4M20 20v-7',origin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',back:'M15 5l-7 7 7 7M8 12h13',chevron:'M9 5l7 7-7 7',close:'M6 6l12 12M18 6L6 18',check:'M5 12l4 4L19 6',note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',feed:'M3 12h18l-3 7H6zM7 8l1-2 2 1-1 2zM12 5l1-2 2 1-1 2zM15 9l1-2 2 1-1 2z',condition:'M12 4v16M4 12h16',weight:'M5 6h14l2 15H3zM8 6a4 4 0 0 1 8 0M12 11v4',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',scan:'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10',clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',alert:'M12 3L2 21h20zM12 9v5M12 17v1',signal:'M4 18v-3M9 18v-7M14 18V7M19 18V3',battery:'M3 6h16v12H3zM22 10v4M6 9h10v6H6z',filter:'M4 5h16l-6 7v6l-4 2v-8z'};
const icon=k=>globalThis.SentriIcons?SentriIcons.icon(k):`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.chevron}"/></svg>`;
// SentriUI is the shared reading vocabulary; fallbacks keep the study importable
// in source-only checks before the runtime bundle is mounted.
const stHeading=(o,fallback='')=>globalThis.SentriUI?.heading?globalThis.SentriUI.heading(o):fallback;
const stPanel=(content,options={},fallback=content)=>globalThis.SentriUI?.panel?globalThis.SentriUI.panel(content,options):fallback;
const stFacts=(items,options={},fallback='')=>globalThis.SentriUI?.facts?globalThis.SentriUI.facts(items,options):fallback;
const stRow=o=>globalThis.SentriUI?.row?globalThis.SentriUI.row(o):button(o.action||'',`<span class="action-symbol">${o.icon||icon('chevron')}</span><span><strong>${esc(o.title)}</strong><small>${esc(o.description||'')}</small></span>${icon('chevron')}`,'action-item',o.value||'');
const stLog=(groups,options={},fallback='')=>globalThis.SentriUI?.log?globalThis.SentriUI.log(groups,options):fallback;
const stIconButton=o=>{
 if(globalThis.SentriUI?.iconButton)return globalThis.SentriUI.iconButton(o);
 const badge=o.badge!==''&&o.badge!=null?`<span class="filter-badge">${esc(o.badge)}</span>`:'';
 return button(o.action||'',(o.icon||'')+badge,`icon-button${o.className?' '+o.className:''}`,o.value||'',o.disabled).replace('<button',`<button aria-label="${esc(o.label||'')}"`);
};
const stPickerField=o=>{
 if(globalThis.SentriUI?.pickerField)return globalThis.SentriUI.pickerField(o);
 const text=o.display!==''&&o.display!=null?o.display:o.value,has=text!=null&&text!=='';
 return `<label class="field st-picker-field ${o.className||''}">${o.label||''}<button type="button" class="st-picker-trigger${has?'':' is-placeholder'}" data-action="${o.action||'open-picker'}" data-picker-key="${esc(o.key||'')}"${o.disabled?' disabled':''}><span class="st-picker-value">${esc(has?text:o.placeholder||'Choose')}</span>${icon('chevron')}</button></label>`;
};
const stPickerOptions=o=>{
 if(globalThis.SentriUI?.pickerOptions)return globalThis.SentriUI.pickerOptions(o);
 return `<div class="st-picker-options" role="listbox">${(o.options||[]).map(([v,label,sub])=>`<button type="button" class="st-picker-option" data-action="${o.action||'picker-select'}" data-value="${esc(v)}" role="option" aria-selected="${v===o.selected}"><span class="st-picker-option-copy"><strong>${esc(label)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</span>${v===o.selected?icon('check'):''}</button>`).join('')}</div>`;
};
const button=(a,label,cls='button',v='',disabled=false)=>`<button type="button" class="${cls}" data-action="${a}" data-value="${esc(v)}"${disabled?' disabled':''}>${label}</button>`;
const ib=(a,k,label,v='')=>button(a,icon(k),'icon-button',v).replace('<button',`<button aria-label="${label}"`);
const footer=(left,right)=>`<footer class="sheet-footer">${left}${right||''}</footer>`;
const status=()=>`<div class="statusbar"><span>9:41</span><span class="status-icons">${icon('signal')}${icon('battery')}</span></div>`;
const countLabel=n=>`${n} ${n===1?'pig':'pigs'}`;
const quantity=n=>(Math.round(n*10)/10).toFixed(1);
function baseSeed(){return {view:'list',lens:'All',selected:new Set(),scroll:0,reviewOnly:false,query:'',events:[],checkedIn:false,form:{},toast:'',toastUntil:0,pens:[
{id:'C1',mode:'trough',formula:'Gestation 1',issue:'',pigs:[{id:'000254',stage:'Gestating',parity:3,base:2.6,factor:1,instruction:''},{id:'000267',stage:'Gestating',parity:2,base:2.4,factor:1.1,condition:'Thin',review:7},{id:'000281',stage:'Gestating',parity:4,base:2.4,factor:1}]},
{id:'C2',mode:'station',formula:'Gestation 1',issue:'',pigs:[{id:'000306',stage:'Gestating',parity:5,base:2.5,factor:1,instruction:'Check appetite today',instructionBy:'G. Hansen · yesterday',instructionDone:false,tasks:[{id:'vaccination',title:'Vaccination',type:'Health',status:'Due today',summary:'Influenza booster'}]},{id:'000312',stage:'Gestating',parity:2,base:2.4,factor:1}]},
{id:'D4',mode:'adlib',formula:'Grower 1',issue:'Feeder low',issueTime:'06:40',pigs:[{id:'000801',stage:'Grower',age:63},{id:'000802',stage:'Grower',age:63}]}
]};}
const pigs=c=>c.pens.flatMap(p=>p.pigs);
const pig=(c,id)=>pigs(c).find(p=>p.id===id);
const penOf=(c,id)=>c.pens.find(p=>p.pigs.some(x=>x.id===id));
const pen=(c,id)=>c.pens.find(p=>p.id===id);
const picked=c=>pigs(c).filter(p=>c.selected.has(p.id));
const baseAllocation=pe=>pe.pigs.reduce((s,p)=>s+p.base*p.factor,0);
function pigAllocation(p,pe){
 if(p.noFeed)return 0;
 if(Number.isFinite(p.feedHold))return p.feedHold;
 return p.base*(p.factor??1);
}
const allocation=pe=>pe.pigs.reduce((sum,p)=>sum+pigAllocation(p,pe),0);
const manual=p=>!!p.instruction;
const feedNews=(p,pe)=>p.noFeed||Number.isFinite(p.feedHold)||(p.factor!==undefined&&p.factor!==1)||!!pe.switchDue;
const visiblePigs=(c,pe)=>pe.pigs.filter(p=>c.reviewOnly?c.selected.has(p.id):matches(c,p)&&matchesLens(c,p,c.lens));
const logTypes=['Production','Health','Movement','Feed','Measurements','Notes','Equipment'];
function eventCategory(e){
 if(logTypes.includes(e.category))return e.category;
 const types={Production:['Service recorded','Pregnancy check','Farrowing recorded','Weaning recorded'],Health:['Health recorded','Body condition recorded','Treatment recorded','Triage updated','Recovered','Record corrected','Finding edited','Finding entered in error','Thin','Fever','Poor appetite','Coughing','Diarrhoea'],Movement:['3 pigs transferred in','1 pig transferred out','Transferred in','Transferred out'],Feed:['Feed adjustment cleared','Condition support plan','Standard feed plan','Individual adjustment active','Individual adjustment changed','Individual adjustment cleared','Manual feeding instruction','Feeding exception'],Measurements:['Weight recorded','Temperature','Backfat'],Equipment:['Fault reported','Fault resolved','Equipment fault reported','Pen issue']};
 return Object.keys(types).find(k=>types[k].includes(e.title))||'Notes';
}
function addEvent(c,title,subjects,note='',category){
 const penSubjects=c.pens.map(pe=>({id:pe.id,subjects:subjects.filter(id=>id===pe.id||pe.pigs.some(p=>p.id===id))})).filter(pe=>pe.subjects.length);
 c.events.unshift({title,category:category||eventCategory({title}),subjects:[...subjects],penSubjects,note,time:'09:41',recordedAt:walkDate+'T09:41',who:'G. Hansen'});
}
function penLogEntries(c,id){
 return c.events.filter(e=>e.penSubjects?.some(pe=>pe.id===id)).map(e=>({...e,time:'Today · '+e.time,note:[e.penSubjects.find(pe=>pe.id===id).subjects.filter(x=>x!==id).join(', '),e.note].filter(Boolean).join(' · ')})).concat(c.penHistory?.[id]||[]);
}
function closePenNote(c,id){
 const pe=pen(c,id);if(!pe?.note)return false;
 const note={id:'note-'+Date.now()+'-'+(pe.closedNotes?.length||0),text:pe.note,by:pe.noteBy,closedAt:'Today · 09:41',closedBy:'G. Hansen'};
 (pe.closedNotes||=[]).push(note);pe.note='';pe.noteBy='';c.closedNoteId=note.id;
 addEvent(c,'Pen note closed',[id],note.text+' · Originally added by '+note.by,'Notes');return true;
}
function undoPenNoteClose(c,id){
 const pe=pen(c,id),note=pe?.closedNotes?.find(n=>n.id===c.closedNoteId);
 if(!note||note.reopenedAt||pe.note)return false;
 pe.note=note.text;pe.noteBy=note.by;note.reopenedAt='Today · 09:41';c.closedNoteId=null;
 addEvent(c,'Pen note reopened',[id],note.text,'Notes');return true;
}
function applyRecord(c){const f=c.form,subjects=f.subjects||[],targets=subjects.map(id=>pig(c,id)).filter(Boolean);if(!targets.length)return false;
 if(c.view==='condition'){if(!f.choice||f.choice==='Other'&&!f.note?.trim())return false;targets.forEach(p=>{p.condition=f.choice;p.last='Condition recorded just now';});addEvent(c,f.choice,subjects,f.note,'Health');}
 else if(c.view==='note'){if(!f.note?.trim())return false;targets.forEach(p=>{p.note=f.note.trim();p.last='Note added just now';});addEvent(c,'Note',subjects,f.note.trim());}
 else if(c.view==='plan'){if(targets.length!==1||!f.preset||targets.some(p=>penOf(c,p.id).mode==='adlib'))return false;targets.forEach(p=>{p.factor=f.preset==='support'?1.1:1;p.review=+f.review;p.last='Feed plan updated just now';});addEvent(c,f.preset==='support'?'Condition support plan':'Standard feed plan',subjects,`Starts today · review in ${f.review} days`);}
 else return false;
 c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';return true;
}
// Unit composition and product-scoped inspection records.
function catalogGroup(kind,section,group,entries){return entries.map(entry=>{const [name,...aliases]=Array.isArray(entry)?entry:[entry];return {name,kind,section,group,aliases};});}
// English translations of the disease and symptom hierarchy supplied in Figma.
const catalog=[
 ...catalogGroup('Disease','Diseases','Respiratory diseases',[
  ['Porcine reproductive and respiratory syndrome','PRRS'],['Swine influenza','pig flu'],['Mycoplasma pneumonia','enzootic pneumonia'],['Actinobacillus pleuropneumonia','APP'],['Pasteurellosis','Pasteurella'],['Bordetella bronchiseptica infection','atrophic rhinitis'],['Inclusion body rhinitis']]),
 ...catalogGroup('Disease','Diseases','Gastrointestinal diseases',[
  ['Colibacillosis','E. coli','Escherichia coli'],['Clostridial enteritis','Clostridium'],['Swine dysentery'],['Porcine epidemic diarrhoea','PEDV','porcine epidemic diarrhea'],['Transmissible gastroenteritis','TGE'],['Lawsonia intracellularis infection','ileitis'],['Salmonellosis','Salmonella'],['Rotavirus infection'],['Proliferative enteropathy']]),
 ...catalogGroup('Disease','Diseases','Reproductive and neonatal diseases',[
  ['Porcine parvovirus','PPV'],['Leptospirosis'],['Mastitis–metritis–agalactia syndrome','MMA syndrome'],['Zearalenone toxicosis'],['Brucellosis'],["Pseudorabies","Aujeszky's disease"],['SMEDI syndrome','stillbirth mummification embryonic death infertility']]),
 ...catalogGroup('Disease','Diseases','Skin and external diseases',[
  ['Sarcoptic mange'],['Greasy pig disease','exudative epidermitis'],['Erysipelas'],['Swine pox'],['Ringworm','dermatophytosis'],['Lice infestation','hog lice'],['Sunburn']]),
 ...catalogGroup('Disease','Diseases','Nervous system diseases',[
  ['Streptococcus suis infection','Strep suis'],['Salt poisoning','water deprivation'],['Oedema disease','edema disease'],['Teschen or Talfan disease'],["Glässer's disease",'Glasser disease'],['Vitamin A deficiency']]),
 ...catalogGroup('Disease','Diseases','Systemic diseases',[
  ['Classical swine fever','CSF'],['African swine fever','ASF'],['Septicaemia','septicemia'],['Porcine circovirus-associated disease','PCVAD'],['Eperythrozoonosis','porcine haemoplasmosis','porcine hemoplasmosis'],['Anthrax'],['Actinomycosis']]),
 ...catalogGroup('Disease','Diseases','Musculoskeletal diseases',[
  ['Porcine stress syndrome','PSS'],['Arthritis'],['Foot rot'],['Rickets'],['Osteochondrosis']]),
 ...catalogGroup('Disease','Diseases','Nutritional and metabolic diseases',[
  ['Iron-deficiency anaemia','iron deficiency anemia'],['Vitamin D deficiency'],['Selenium and vitamin E deficiency','mulberry heart disease'],['Calcium deficiency'],['Gastric ulcer'],['Zinc deficiency','parakeratosis']]),
 ...catalogGroup('Disease','Diseases','Other diseases and conditions',[
  ['Tail-bite injury'],['Rectal prolapse'],['Umbilical hernia'],['Vaginal prolapse'],['Cryptorchidism'],['Coccidiosis']]),
 ...catalogGroup('Symptom','General appearance','General appearance',[
  ['Weakness or unsteady stance','weak standing unstable'],['Reduced appetite','poor appetite anorexia reduced feed intake'],['Depression or lethargy','dull depressed'],['Poor growth or weight loss','long hair coat slow growth'],['Pale mucous membranes','pale mucus membranes'],['Circling or paddling while lying'],['Arched back or swayback'],['Generalised tremors','generalized tremors shaking'],['Abdominal hernia'],['Generalised joint swelling','generalized joint swelling']]),
 ...catalogGroup('Symptom','Body area','Limbs',[
  ['Inward- or outward-turned feet','pigeon toed splay footed'],['Joint swelling'],['Lameness','limping'],['Overgrown claws','long toenails'],['Hoof wall loss','hoof shell loss'],['Blisters at the hoof edge']]),
 ...catalogGroup('Symptom','Body area','Tail',[
  ['Tail biting'],['Bleeding tail tip']]),
 ...catalogGroup('Symptom','Body area','Head and neck',[
  ['Head tilt or head shaking'],['Stiff neck']]),
 ...catalogGroup('Symptom','Body area','Eyes',[
  ['Eye redness'],['Eye discharge'],['Eye swelling']]),
 ...catalogGroup('Symptom','Body area','Ears',[
  ['Ear haematoma','ear hematoma'],['Ear discharge'],['Ear inflammation'],['Ear cyanosis','blue ears'],['Partial ear tissue loss']]),
 ...catalogGroup('Symptom','Body area','Nose',[
  ['Dry nose'],['Nasal blisters'],['Sneezing'],['Nasal discharge'],['Nosebleed, crooked nose or short snout','epistaxis']]),
 ...catalogGroup('Symptom','Body area','Mouth',[
  ['Oral ulcers','mouth ulcers'],['Excessive salivation','drooling'],['Mouth swelling'],['Teeth grinding']]),
 ...catalogGroup('Symptom','Body area','Skin',[
  ['Rash or dermatitis'],['Skin lesions or ulcers'],['Itching and hair loss','mange'],['Skin oedema or bruising','skin edema'],['Round or diamond-shaped skin lesions'],['Pale, red or purple skin','skin discolouration','skin discoloration']]),
 ...catalogGroup('Symptom','Body system','Urinary system',[
  ['Frequent urination'],['Yellow or bloody urine'],['White residue after urination']]),
 ...catalogGroup('Symptom','Body system','Respiratory system',[
  ['Coughing','long cough short cough'],['Difficulty breathing','laboured breathing dyspnoea'],['Clear or coloured nasal discharge','colored nasal discharge']]),
 ...catalogGroup('Symptom','Body system','Digestive system',[
  ['Diarrhoea','diarrhea yellow red grey white black faeces feces'],['Constipation','blood intestinal lining'],['Vomiting','foam'],['Abdominal pain or bloating','belly on floor distended abdomen']]),
 ...catalogGroup('Symptom','Body system','Reproductive system',[
  ['Rectal prolapse observed'],['Vulvar oedema','vulvar edema purple black vulva'],['Vaginal infection or discharge','white yellow discharge'],['Uterine prolapse'],['Mastitis','swollen painful udder'],['Penile discharge, swelling or bleeding']])
];
function seed(){const c=baseSeed();c.selectedPens=new Set();c.customHealthCatalog={};c.actionScope='pigs';c.batchFilter='All';c.batches=[{id:'20',stage:'Gestating',stageStartedAt:'2026-08-03',pigIds:['000254','000267','000281','000306','000312'],pens:['C1','C2'],next:'Pregnancy check',when:'Tomorrow · 13 Sep',nextDate:'2026-09-13'},{id:'18',stage:'Grower',stageStartedAt:'2026-08-15',pigIds:['000801','000802'],pens:['D4'],next:'Spot-check weight',when:'Fri · 18 Sep',nextDate:'2026-09-18'}];Object.assign(c,{stage:'All',healthFilter:'All',healthStatus:'All',manualOnly:false,triageFilter:'All'});c.pens.forEach(pe=>{pe.faults=[];pe.note='';pe.issue='';pe.pigs.forEach(p=>{p.batchId=pe.id==='D4'?'18':'20';p.cases=[];p.band=p.id==='000267'?'mild':'standard';p.adjustmentActive=p.id==='000267';});});const a=c.pens[0];a.note='Close the aisle gate after passing.';a.noteBy='G. Hansen · today · 06:40';a.pigs[1].cases=[{name:'Thin',kind:'Body condition',day:12,triage:'Monitor',feedLinked:true}];c.pens[1].pigs[0].cases=[{name:'Fever',kind:'Symptom',day:2,triage:'Treat in place'},{name:'Poor appetite',kind:'Symptom',day:2,triage:'Monitor'}];c.pens[1].pigs[0].instruction='';c.pens[1].faults=[{id:'fault-initial',device:'Drinking station',name:'Drinking station',description:'Drinker valve leaking on the east side.',time:'06:40',who:'G. Hansen',open:true}];c.pens[2].pigs[0].cases=[{name:'Diarrhoea',kind:'Symptom',day:1,triage:'Monitor'}];c.pens[2].switchDue=true;
 c.pens.forEach(pe=>pe.pigs.forEach(p=>{
  p.initialRecords=cases(p).map(k=>({category:'Health',title:k.name,note:k.kind+' · Day '+k.day+' · '+k.triage,time:'Before this walk',who:'Author not supplied'}));
  p.feedChanges=[];p.closedCases=[];
  if(pe.mode!=='adlib')p.feedCurve={today:42,source:'Sample farm curve',points:[{day:35,kg:p.base-.1},{day:42,kg:p.base},{day:49,kg:p.base+.1},{day:56,kg:p.base+.2}]};
  if(p.adjustmentActive){p.ends='when recovered';p.feedChanges.push({title:'Individual adjustment active',note:'Thin · mild · +10% · until resolved',time:'Before this walk',who:'Start date and author not supplied'});}

  }));
 c.penHistory={C1:[{category:'Notes',title:'Pen note added',note:a.note,time:'Today · 06:40',who:'G. Hansen'},{category:'Movement',title:'3 pigs transferred in',note:'Unit 6 · B2 → Unit 7 · C1 · 000254, 000267, 000281',time:'10 Sep · 14:20',who:'M. Larsen'}],C2:[{category:'Equipment',title:'Equipment fault reported',note:'Drinking station · Drinker valve leaking on the east side.',time:'Today · 06:40',who:'G. Hansen'},{category:'Movement',title:'1 pig transferred out',note:'Unit 7 · C2 → Hospital · H1 · 000299',time:'Yesterday · 15:10',who:'M. Larsen'}]};
 seedProfileExamples(c);
 // Sample stage-entry records; duration never falls back to lifetime age.
 for(const [id,date] of Object.entries({"000254":"2026-08-03","000281":"2026-07-28","000312":"2026-08-08","000801":"2026-08-15","000802":"2026-08-15"}))pig(c,id).stageStartedAt=date;
 c.pens.forEach(pe=>pe.pigs.forEach(p=>{p.initialRecords.push(...p.feedChanges.map(e=>({...e,category:'Feed'})));}));
 pig(c,'000267').initialRecords.push({category:'Movement',title:'Transferred in',note:'Unit 6 · B2 → Unit 7 · C1',time:'10 Sep · 14:20',who:'M. Larsen'});
 return c;}
const cases=p=>p.cases||[];
const openFaults=pe=>pe.faults.filter(f=>f.open);
const stageList=c=>[...new Set(pigs(c).map(p=>p.stage))];
function matches(c,p){return (c.batchFilter==='All'||p.batchId===c.batchFilter)&&(c.stage==='All'||p.stage===c.stage)&&(c.healthFilter==='All'||cases(p).some(k=>k.name===c.healthFilter))&&(c.healthStatus===undefined||c.healthStatus==='All'||cases(p).some(k=>c.healthStatus==='ongoing'?issueStatus(k)==='ongoing':needsHealthAttention(k)))&&(!c.manualOnly||manual(p))&&(c.triageFilter==='All'||cases(p).some(k=>k.triage===c.triageFilter));}
function matchesLens(c,p,lens){return lens==='All'||lens==='Health'&&cases(p).length>0||lens==='Feed'&&feedNews(p,penOf(c,p.id));}
const careOptions=[['None','No action needed'],['Monitor','Monitor'],['Treat in place','Treat in place'],['Hospital pen','Move to hospital pen']];
function careLabel(value){return careOptions.find(([key])=>key===value)?.[1]||'No action needed';}
function issueStatus(k){return needsHealthAttention(k)?'attention':'ongoing';}
function needsHealthAttention(k){return ['Monitor','Treat in place','Hospital pen'].includes(k.triage);}
function healthStateFields(c){return fieldSelect(c,'Care','triage',careOptions,c.form.triage||'None');}
function attentionOverview(p){
 const active=cases(p).filter(needsHealthAttention);
 const row=(type,title,detail,link,value,tone='')=>button(link,'<span class="attention-type">'+esc(type)+'</span><span class="attention-copy"><strong>'+esc(title)+'</strong>'+(detail?'<small>'+esc(detail)+'</small>':'')+'</span>'+icon('chevron'),'attention-row '+tone,value);
 const records=active.map(k=>row('Health',k.name,[k.triage&&k.triage!=='None'?k.triage:'', 'Day '+k.day].filter(Boolean).join(' · '),'finding',p.id+'|'+k.name,careAppearance(k).cls));
 if(p.note)records.push(row('Note',p.note,'','pig-log',p.id));
 return records.length?'<div class="attention-overview"><div class="attention-list" aria-label="Current notifications">'+records.join('')+'</div></div>':'';
}
function feedAdjustmentReason(p){return p.adjustmentReason||bands.find(x=>x[0]===p.band)?.[1]||'Individual adjustment';}
function conditionDefinition(f,name){return catalog.find(k=>k.name===name&&(!f?.conditionKinds?.[name]||k.kind===f.conditionKinds[name]))||f?.customConditions?.[name]||catalog.find(k=>k.name===name);}
function saveHealth(c){const f=c.form;if(!f.conditions?.length)return false;for(const id of f.subjects){const p=pig(c,id);for(const name of f.conditions){if(cases(p).some(k=>k.name===name))continue;const item=conditionDefinition(f,name);if(item)p.cases.push({name,kind:item.kind,day:1,triage:f.triage||'None',issueStatus:issueStatus(f),recordedDate:'12 Sep 2026',recordedBy:'G. Hansen'});}p.last='Health record updated just now';}addEvent(c,'Health recorded',f.subjects,f.conditions.join(' · ')+' · '+careLabel(f.triage));c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';return true;}
const bands=[['mild','Thin · mild'],['moderate','Thin · moderate'],['severe','Thin · severe'],['over','Over-conditioned']];
const bandFactors={mild:1.1,moderate:1.15,severe:1.2,over:.97,standard:1};
function saveBody(c){const f=c.form;if(!f.band||!f.end||!f.start)return false;if(f.band==='custom')return saveIndependentAdjustment(c);if(!Object.hasOwn(bandFactors,f.band))return false;if(c.view==='individual-plan'&&f.subjects.length!==1)return false;for(const id of f.subjects){if(!pig(c,id)||penOf(c,id).mode==='adlib')return false;}for(const id of f.subjects){const p=pig(c,id),name=f.band==='over'?'Over-conditioned':'Thin',old=cases(p).find(k=>k.feedLinked&&k.name===name);if(f.band==='standard'){p.cases.forEach(k=>{if(k.feedLinked)k.feedLinked=false;});}else p.cases=p.cases.filter(k=>!k.feedLinked);if(f.band!=='standard')p.cases.push(old||{name,kind:'Body condition',day:1,triage:'Monitor',feedLinked:true});(p.feedChanges||=[]).unshift({title:f.band==='standard'?'Individual adjustment cleared':'Individual adjustment changed',note:quantity(p.base*p.factor)+' → '+quantity(p.base*bandFactors[f.band])+' kg/day · '+(bands.find(x=>x[0]===f.band)?.[1]||'Base plan')+' · '+(f.end==='when recovered'?'until resolved':'ends '+f.end),time:'Today · 09:41',who:'G. Hansen'});delete p.feedHold;p.noFeed=false;p.adjustmentReason='';p.adjustmentStart=f.start;p.band=f.band;p.factor=bandFactors[f.band];p.adjustmentActive=f.band!=='standard';p.ends=f.end;p.review=undefined;p.last='Body condition recorded';}addEvent(c,f.band==='standard'?'Feed adjustment cleared':'Body condition recorded',f.subjects,(f.band==='standard'?'Base plan restored':bands.find(b=>b[0]===f.band)[1])+' · starts '+f.start+' · ends '+f.end);c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';return true;}
function unitSensors(c){return (c.sensors||[]).filter(s=>s.installed!==false);}
function batchCurrentTasks(batch){
 return (batch?.currentTasks??(batch?.currentTask?[batch.currentTask]:[])).filter(task=>task?.title&&!task.completedAt&&!['completed','cancelled'].includes(String(task.status||'').toLowerCase()));
}
function batchTaskForPig(batch,id){
 if(!batch?.pigIds.includes(id))return null;
 const current=batchCurrentTasks(batch).find(task=>(task.pigIds||batch.pigIds).includes(id)&&!task.completedPigIds?.includes(id));
 if(current)return {...current,kind:'current'};
 return batch.next?{id:'batch-'+batch.id+'-next',title:batch.next,when:batch.when,kind:'next'}:null;
}
function batchTrackerRows(c,batch){
 const members=[...new Set(batch.pigIds)].filter(id=>!!pig(c,id));
 const ongoing=batchCurrentTasks(batch).map(task=>({...task,kind:'current',count:members.filter(id=>(task.pigIds||batch.pigIds).includes(id)&&!task.completedPigIds?.includes(id)).length})).filter(task=>task.count>0);
 // A batch advances only once every current production task has finished.
 const rows=ongoing.length?ongoing:batch.next&&members.length?[{id:'batch-'+batch.id+'-next',title:batch.next,when:batch.when,kind:'next',count:members.length}]:[];
 return rows.map(task=>{
  const days=daysFromWalk(task.startedAt);
  const timing=task.kind==='current'?(days===null||days<0?'In progress':days===0?'Started today':days+' '+(days===1?'day':'days')+' in progress'):['Next',task.when].filter(Boolean).join(' · ');
  return {...task,timing};
 });
}
function batchTrackerContent(c,batch){
 const rows=batchTrackerRows(c,batch);
 return rows.length?rows.map(row=>'<div class="batch-tracker-task"><strong>'+esc(row.title)+'</strong><small>'+countLabel(row.count)+' · '+esc(row.timing)+'</small></div>').join(''):'<div class="batch-tracker-task"><strong>No active production task</strong></div>';
}
function unitOverview(c){
 const faults=c.pens.reduce((n,p)=>n+openFaults(p).length,0),sensors=unitSensors(c);
 return '<section class="unit-summary unit-card" aria-label="'+unitName(c)+' overview"><div class="unit-summary-heading">'+button('unit-detail',icon('grid')+unitName(c)+' '+icon('chevron'),'text-button')+'<div class="unit-summary-meta">'+(faults?'<span class="unit-equipment-summary has-fault" aria-label="'+faults+' open equipment '+(faults===1?'fault':'faults')+'">'+icon('wrench')+'<strong>'+faults+' '+(faults===1?'fault':'faults')+'</strong></span>':'')+'<span class="unit-population">'+pigs(c).length+' pigs · '+c.pens.length+' pens</span></div></div>'+
 (sensors.length?'<div class="unit-environment-summary" aria-label="Latest environmental readings">'+sensors.map(s=>'<span class="unit-environment-metric'+(s.value==null?' is-unavailable':'')+'" title="'+esc(s.label+': '+(s.value==null?'Reading unavailable':s.value+' '+s.unit))+'" aria-label="'+esc(s.label+': '+(s.value==null?'Reading unavailable':s.value+' '+s.unit))+'">'+icon(s.icon||'air')+'<strong>'+(s.value==null?'—':esc(s.value))+'</strong><small>'+esc(s.label==='Ammonia'?'ppm NH₃':s.unit)+'</small></span>').join('')+'</div>':'<p class="unit-sensors-empty">No connected sensors</p>')+
 (c.batches.length?'<section class="unit-work-summary" aria-label="Batch tracker"><div class="unit-work-heading"><strong>Batch tracker</strong><span>'+c.batches.length+' '+(c.batches.length===1?'batch':'batches')+'</span></div><div class="unit-work-list">'+c.batches.map(b=>'<div class="unit-work-row"><div class="unit-work-batch"><strong>Batch '+esc(b.id)+'</strong><small>'+countLabel(b.pigIds.length)+'</small></div><div class="batch-tracker-tasks">'+batchTrackerContent(c,b)+'</div></div>').join('')+'</div></section>':'')+'</section>';
}
function unitEnvironment(c){
 const sensors=unitSensors(c);
 return '<section class="unit-detail-section"><h4 class="section-title">'+icon('air')+'Environment</h4>'+(sensors.length?'<div class="unit-sensor-grid">'+sensors.map(s=>'<div class="unit-sensor-reading'+(s.value==null?' is-unavailable':'')+'"><span>'+icon(s.icon||'air')+esc(s.label)+'</span><strong>'+(s.value==null?'—':esc(s.value)+' <small>'+esc(s.unit)+'</small>')+'</strong><small>'+esc(s.value==null?'Reading unavailable':s.updated||'Latest reading')+'</small></div>').join('')+'</div>':'<p class="unit-empty-state">No sensors installed</p>')+'</section>';
}
function unitEquipment(c){
 const faults=c.pens.flatMap(pe=>openFaults(pe).map(f=>({pe,f})));
 return '<section class="unit-detail-section"><div class="unit-section-heading"><h4 class="section-title">'+icon('wrench')+'Equipment faults</h4><span>'+faults.length+' open</span></div>'+(faults.length?'<div class="unit-fault-list">'+faults.map(({pe,f})=>'<article class="unit-fault-card"><div class="unit-fault-heading"><span>Pen '+esc(pe.id)+'</span><small>Open</small></div><h5>'+esc(f.name)+'</h5><p>'+esc(f.description)+'</p><small>Reported '+esc(f.time)+' · '+esc(f.who)+'</small>'+'</article>').join('')+'</div>':'<p class="unit-empty-state">'+icon('check')+'No open equipment faults</p>')+'</section>';
}
function returnFromFault(c){c.view=[...(c.navTrail||[])].reverse().find(p=>['unit-detail','equipment','pen-detail','pen-faults','actions'].includes(p.view))?.view||'pen-detail';}
function environmentBody(c){
 const sensors=unitSensors(c);
 return sensors.length?'<section class="detail-section"><div class="detail-heading"><h4 class="section-title">'+icon('air')+'Readings</h4></div>'+sensors.map(s=>'<div class="sensor-slot"><span>'+esc(s.label)+'<small>'+esc(s.value==null?'Reading unavailable':s.updated||'Latest reading')+'</small></span><strong>'+(s.value==null?'—':esc(s.value)+' <small>'+esc(s.unit)+'</small>')+'</strong></div>').join('')+'</section>':'<p class="detail-empty">No sensors installed</p>';
}

function careAppearance(k){
 if(k.triage==='Hospital pen')return {cls:'care-hospital',symbol:'hospital',status:'Move to hospital pen'};
 if(k.triage==='Treat in place')return {cls:'care-treatment',symbol:'treat',status:'Treat in place'};
 if(k.triage==='Monitor')return {cls:'care-monitor',symbol:'monitor',status:'Monitor'};
 return {cls:'care-ongoing',symbol:'note',status:'No action needed'};
}
function pigFeedTags(p){
 const tags=[];
 if(p.noFeed)tags.push({kind:'stop',label:'No feed',cls:'feed-tag feed-stopped',symbol:'feed',status:'0.0 kg/day'});
 else if(Number.isFinite(p.feedHold))tags.push({kind:'hold',label:'Feed held',cls:'feed-tag feed-notice',symbol:'feed',status:quantity(p.feedHold)+' kg/day · fixed amount'});
 else if(Number.isFinite(p.factor)&&Math.abs(p.factor-1)>.000001){const delta=(p.factor>=1?'+':'')+Number(((p.factor-1)*100).toFixed(1))+'%';tags.push({kind:'ration',label:'Feed '+delta,delta,cls:'feed-tag feed-notice',symbol:'feed',status:'Included in daily feed'});}
 return tags;
}
const tagDescription=t=>[t.label,t.day,t.status].filter(Boolean).join(' · ');
function recordedTag(t){return '<span class="recorded-tag '+t.cls+'" title="'+esc(tagDescription(t))+'">'+(t.symbol?icon(t.symbol):'')+'<span class="tag-label">'+esc(t.label)+'</span>'+(t.day?'<small>'+esc(t.day)+'</small>':'')+'</span>';}
function animalType(p){return p.registry?.type||p.type||(p.parity?'Sow':p.stage)||'Pig';}
function stageSummary(p){
 const type=animalType(p);
 if(type!=='Sow'){
  const age=Number.isFinite(p.age)?p.age:daysFromWalk(p.registry?.birthDate);
  return type+' · '+(age!==null&&age>=0?age+' '+(age===1?'day':'days')+' old':'Age —');
 }
 // Open is an explicit breeding status, not a guess from missing service data.
 const label=(p.stage==='Off production'&&p.breedingStatus==='Open'?'Open':null)||({Gestating:'Gestation',Lactating:'Lactation'})[p.stage]||p.stage||'Stage';
 const start=p.stageStartedAt||(p.stage==='Gestating'?p.registry?.serviceDate:p.stage==='Lactating'?p.registry?.farrowingDate:p.stage==='Off production'?p.registry?.offProductionSince:null);
 const days=daysFromWalk(start);
 return label+' · '+(days!==null&&days>=0?days+' '+(days===1?'day':'days'):'—');
}
function penFeedStatus(pe){
 return pe.mode!=='adlib'&&pe.pigs.length&&pe.pigs.every(p=>p.noFeed)?'No feed':pe.switchDue?'Formula due':'';
}
function penFeedEntry(pe){
 const current=allocation(pe),value=pe.mode==='adlib'?'Ad-lib':quantity(current)+' kg';
 const state=penFeedStatus(pe)||(pe.mode==='station'?'Auto':'');
 const label='Adjust feed for pen '+pe.id+' · '+(pe.mode==='adlib'?'Ad-lib':quantity(current)+' kg daily');
 return button('feed-edit-pen','<span class="pen-feed-value">'+icon('feed')+'<strong>'+value+'</strong></span>'+(state?'<small class="pen-feed-state">'+esc(state)+'</small>':''),'pen-feed'+(state?' has-state':'')+(state==='No feed'?' is-stopped':''),pe.id).replace('<button','<button aria-label="'+esc(label+(state==='No feed'?' · No feed':'') )+'"');
}
function pigRow(c,p){
 const cs=cases(p);
 const metadata=stageSummary(p);
 const tags=[...cs.slice().sort((a,b)=>Number(needsHealthAttention(b))-Number(needsHealthAttention(a))).map(k=>({label:k.name,day:Number.isFinite(k.day)?(issueStatus(k)==='ongoing'?k.day+' days':'Day '+k.day):'',...careAppearance(k)})),...pigFeedTags(p)];
 const labels=tags.map(recordedTag).join('');
 const accessible=[p.id,metadata,...tags.map(tagDescription)].filter(Boolean).join('. ');
 return '<div class="inspect-pig roster-pig'+(c.selected.has(p.id)?' selected':'')+'"><label class="check-target"><input type="checkbox" data-pig-select="'+p.id+'" aria-label="Select pig '+p.id+'"'+(c.selected.has(p.id)?' checked':'')+'></label>'+button('pig','<span class="roster-content"><span class="roster-top"><strong class="roster-id">'+p.id+'</strong><span class="roster-meta" title="'+esc(metadata)+'">'+esc(metadata)+'</span></span>'+(labels?'<span class="roster-second"><span class="recorded-tags">'+labels+'<span class="tag-more" hidden></span></span></span>':'')+'</span>'+icon('chevron'),'pig-open',p.id).replace('<button','<button aria-label="'+esc(accessible)+'"')+'</div>';
}
function fitRecordedTags(root){
 root.querySelectorAll('.recorded-tags').forEach(line=>{
  const tags=[...line.querySelectorAll('.recorded-tag')],more=line.querySelector('.tag-more'),width=line.clientWidth;
  if(!width)return;
  tags.forEach(tag=>{tag.hidden=false;tag.style.maxWidth=Math.min(tags.length>1?160:width,width)+'px';});more.hidden=true;
  const gap=4;let shown=tags.length;
  const used=()=>tags.slice(0,shown).reduce((sum,t)=>sum+t.getBoundingClientRect().width,0)+Math.max(0,shown-1)*gap+(more.hidden?0:more.getBoundingClientRect().width+gap);
  while(shown>1&&used()>width){tags[--shown].hidden=true;more.hidden=false;more.textContent='+'+(tags.length-shown);}
  if(!more.hidden){if(shown===1)tags[0].style.maxWidth=Math.max(0,width-more.getBoundingClientRect().width-gap)+'px';more.title=(tags.length-shown)+' more · open pig details';}
 });
}
function displayPigs(c,pe){return visiblePigs(c,pe);}
function penEntry(pe){
 const signals=pe.note?'<span class="pen-notification" aria-hidden="true">'+icon('note')+'</span>':'';
 const label='Pen '+pe.id+', '+countLabel(pe.pigs.length)+(pe.note?', note available':'')+'. View pen details';
 return button('pen-detail','<strong>'+esc(pe.id)+'</strong><small>· '+countLabel(pe.pigs.length)+'</small>'+signals+icon('chevron'),'pen-name',pe.id).replace('<button','<button aria-label="'+esc(label)+'"');
}
function main(c){const n=c.selected.size+c.selectedPens.size,filtered=pigs(c).filter(p=>matches(c,p)),filterN=(c.batchFilter!=='All')+(c.stage!=='All')+(c.healthFilter!=='All')+c.manualOnly+(c.triageFilter!=='All')+(c.healthStatus!=='All');return `<div class="inspect-main"${c.view!=='list'?' inert':''}>${status()}<header class="inspect-header task-header">${stIconButton({action:'home',icon:icon('chevron'),label:'Back to Today',className:'task-return'})}<div class="inspection-page-title"><h2>Inspection</h2><small>${unitName(c)}</small></div>${button('finish',c.checkedIn?'Check in again':'Finish walk','text-button finish-walk')}</header><div class="inspect-scroll" role="region" aria-label="${unitName(c)} inspection list" tabindex="-1"><div class="inspect-intro task-activity"><p>Last check-in <strong>${c.checkedIn?'09:41':'06:40'}</strong><span> · G. Hansen</span></p>${button('history',icon('clock')+'<span>Log</span>','task-history').replace('<button','<button aria-label="Updates this walk"')}</div><div class="inspect-controls"><div class="room-tabs">${['All','Health','Feed'].map(v=>button('lens',`<span>${v}</span><span class="lens-count">${filtered.filter(p=>matchesLens(c,p,v)).length}</span>`,'',v).replace('<button',`<button aria-pressed="${c.lens===v}"`)).join('')}</div>${stIconButton({action:'filters',icon:icon('filter'),label:'Filter pigs',className:'room-filter-button',badge:filterN||''})}</div>${filterN?`<div class="inspection-filter-summary"><span>${[c.batchFilter!=='All'?'Batch '+c.batchFilter:'',c.stage!=='All'?c.stage:'',c.healthFilter!=='All'?c.healthFilter:'',c.healthStatus!=='All'?(c.healthStatus==='ongoing'?'No action needed':'Needs attention'):'',c.manualOnly?'Manual feed':'',c.triageFilter!=='All'?careLabel(c.triageFilter):''].filter(Boolean).join(' · ')}</span>${button('reset-filters','Clear','text-button')}</div>`:''}<div class="inspect-list">${c.pens.map(pe=>{const matchesInPen=visiblePigs(c,pe),rows=displayPigs(c,pe);if(!matchesInPen.length&&!(c.reviewOnly&&c.selectedPens.has(pe.id)))return '';const num=rows.filter(p=>c.selected.has(p.id)).length;return `<section class="inspect-pen" data-pen="${pe.id}"><header class="inspect-pen-head">${penEntry(pe)}${penFeedEntry(pe)}<label class="check-target pen-select-target"><input type="checkbox" data-pen-select="${pe.id}" data-mixed="${num>0&&num<rows.length}" aria-label="Select pen ${pe.id} and ${rows.length} displayed ${rows.length===1?'pig':'pigs'}"${c.selectedPens.has(pe.id)?' checked':''}></label></header>${pe.issue?`<div class="pen-attention">${icon('alert')}${esc(pe.issue)} · ${pe.issueTime}</div>`:''}${rows.map(p=>pigRow(c,p)).join('')}</section>`;}).join('')||`<div class="empty-inspect"><strong>No pigs match</strong>${button('reset-filters','Show all pigs','text-button')}</div>`}</div></div><nav class="inspect-dock room-dock" aria-label="Inspection tools">${n?`${stIconButton({action:'clear',icon:icon('close'),label:'Clear selection'})}<div class="dock-selection-summary"><p>Selected · <strong>${selectionLabel(c)}</strong></p>${button('review-sheet','View selected','selection-review')}</div>${button('actions','Actions','button primary selection-action')}`:`${button('grid',icon('grid')+'<span>'+(c.currentPen||'Pens')+'<small>Go to pen</small></span>','dock-pen').replace('<button','<button aria-label="Go to pen"')}${button('scan',icon('scan')+'<span>Scan ear tag</span>','button primary dock-scan')}${button('search',icon('search'),'dock-search').replace('<button','<button aria-label="Search ear tag"')}`}</nav></div>`;}
function pickerEntry(c,key,entry){(c.pickerOptions||={})[key]=entry;return entry;}
function fieldSelect(c,label,key,items,value,target='form',disabled=false){
 pickerEntry(c,key,{items,label,target,value});
 return stPickerField({label,value,display:value===''||value==null?'':(items.find(([v])=>v===value)||[])[1]??'',placeholder:(items.find(([v])=>v==='')||[])[1]||'Choose',key,disabled});
}
function pickerTriggerButton(entry,key,className='',ariaLabel=''){
 const display=entry.value===''||entry.value==null?null:(entry.items.find(([v])=>v===entry.value)||[])[1]??null;
 const placeholder=(entry.items.find(([v])=>v==='')||[])[1]||'Choose';
 return `<button type="button" class="st-picker-trigger${className?' '+className:''}${display==null?' is-placeholder':''}" data-action="open-picker" data-picker-key="${esc(key)}"${ariaLabel?` aria-label="${esc(ariaLabel)}"`:''}><span class="st-picker-value">${esc(display??placeholder)}</span></button>`;
}
function pickerCurrentValue(c,key,entry){
 if(entry.target==='filter')return c.filterDraft?.[key]??'';
 if(entry.target==='optional')return c.form.optionalDraft??'';
 if(entry.target==='verdict')return c.form.verdicts?.[key]??'';
 if(entry.target==='transfer')return c.transferDraft?.[key]??'';
 if(entry.target==='feed'||entry.target==='log')return entry.value??'';
 return c.form[key]??'';
}
function pickerPage(c){
 const key=c.form.pickerKey,entry=c.pickerOptions?.[key]||{items:[],label:'Choose',target:'form'};
 return sheet(c,entry.label||'Choose','',stPickerOptions({options:entry.items,selected:pickerCurrentValue(c,key,entry),action:'picker-select'}),footer(back(),'')).replace('class="sheet"','class="sheet picker-step option-picker-step"');
}
function pickerCommit(c,v){
 const key=c.form.pickerKey,entry=c.pickerOptions?.[key];if(!entry)return false;
 if(entry.target==='filter')c.filterDraft[key]=v;
 else if(entry.target==='optional')c.form.optionalDraft=v;
 else if(entry.target==='verdict')c.form.verdicts[key]=v;
 else if(entry.target==='transfer'){c.transferDraft[key]=v;if(key==='unit')c.transferDraft.pen='';}
 else if(entry.target==='feed')updateFeedInput(c,key,v);
 else if(entry.target==='log')handleRecordAction(c,'log-filter',entry.scope+'|'+v);
 else if(entry.target==='bulk'){c.form[key]=v;if(key==='dose')c.form.values={};}
 else {c.form[key]=v;
  if(c.form.pickerReturn==='fault-form'&&key==='device'&&v!=='Other'){const x=pen(c,c.penId).faults.find(x=>x.open&&x.device===v);if(x){c.faultId=x.id;c.form={};c.view='fault-record';return true;}}
 }
 return false;
}
function normalizedCondition(value){return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();}
function conditionSearchText(item){return [item.name,item.group,item.section,...(item.aliases||[])].join(' ').toLocaleLowerCase();}
function healthCatalogue(f){return catalog.concat(Object.values(f.customConditions||{}));}
function customFirst(items){return items.slice().sort((a,b)=>Number(!!b.custom)-Number(!!a.custom));}
function catalogItem(c,item){
 const f=c.form,existing=f.subjects.filter(id=>cases(pig(c,id)).some(x=>x.name===item.name)).length,details=[];
 if(item.custom)details.push('Custom · '+item.group);if(existing)details.push('Already on '+existing+' selected');
 const choice='<input type="checkbox" data-condition="'+esc(item.name)+'" data-condition-kind="'+item.kind+'"'+(f.conditions.includes(item.name)?' checked':'')+'><span><strong>'+esc(item.name)+'</strong>'+(details.length?'<small>'+esc(details.join(' · '))+'</small>':'')+'</span>';
 return item.custom?'<div class="catalog-item is-custom"><label class="catalog-item-main">'+choice+'</label>'+button('health-remove-custom',icon('close'),'catalog-custom-remove',item.name).replace('<button','<button aria-label="Remove custom '+item.kind.toLowerCase()+' '+esc(item.name)+'"')+'</div>':'<label class="catalog-item">'+choice+'</label>';
}
function catalogDoor(c,action,label,value,items,type){const selected=items.filter(item=>c.form.conditions.includes(item.name)).length,summary=type?.includes(' · ')?type:items.length+' '+(type||(c.form.kind==='Disease'?'diseases':'symptoms'));return button(action,'<span><strong>'+esc(label)+'</strong><small>'+summary+(selected?' · '+selected+' selected':'')+'</small></span>'+icon('chevron'),'catalog-category',value);}
function catalogPath(label,context){return '<div class="catalog-path">'+ib('health-catalog-back','back','Back in health categories').replace('icon-button','catalog-path-back')+'<span><small>'+esc(context)+'</small><strong>'+esc(label)+'</strong></span></div>';}
function customCategoryPicker(c){
 const f=c.form,draft=f.customDraft,available=healthCatalogue(f).filter(item=>item.kind===draft.kind&&!item.custom),choices=[];
 for(const item of available){const key=item.section+'|'+item.group;if(!choices.some(choice=>choice.key===key))choices.push({key,section:item.section,group:item.group});}
 return catalogPath('Choose a category','Custom '+draft.kind.toLowerCase())+'<p class="catalog-category-prompt">Where should “'+esc(draft.name)+'” appear?</p><nav class="catalog-categories custom-category-options" aria-label="Categories for custom '+draft.kind.toLowerCase()+'">'+choices.map(choice=>button('health-custom-category','<span><strong>'+esc(choice.group)+'</strong><small>'+esc(choice.section===choice.group?(draft.kind==='Disease'?'Disease category':'Symptom category'):choice.section)+'</small></span>'+icon('chevron'),'catalog-category',choice.key)).join('')+'</nav>';
}
function healthSearchResults(c,available,raw,q){
 const f=c.form,matches=available.filter(item=>conditionSearchText(item).includes(q)),groups=[];for(const item of matches){const key=item.section+'|'+item.group;let group=groups.find(x=>x.key===key);if(!group){group={key,section:item.section,group:item.group,items:[]};groups.push(group);}group.items.push(item);}
 const items=groups.map((group,index)=>'<section class="catalog-group">'+((!index||groups[index-1].section!==group.section)&&group.section!==group.group?'<h4 class="catalog-section-title">'+esc(group.section)+'</h4>':'')+'<h5>'+esc(group.group)+'</h5>'+customFirst(group.items).map(item=>catalogItem(c,item)).join('')+'</section>').join('');
 const exact=available.some(item=>normalizedCondition(item.name)===q),custom=raw&&!exact?button('health-add-custom','<span><strong>Add “'+esc(raw)+'”</strong><small>Use as a custom '+f.kind.toLowerCase()+'</small></span>'+icon('condition'),'catalog-custom',raw):'';
 return items+custom||'<p class="quiet-note catalog-empty">No matching '+f.kind.toLowerCase()+'s.</p>';
}
function healthList(c){
 const f=c.form;if(f.customDraft)return customCategoryPicker(c);const raw=(f.search||'').trim(),q=normalizedCondition(raw),available=healthCatalogue(f).filter(item=>item.kind===f.kind);if(q)return healthSearchResults(c,available,raw,q);
 if(f.kind==='Disease'){
  const groups=[...new Set(available.map(item=>item.group))];
  if(!f.catalogGroup)return '<nav class="catalog-categories" aria-label="Disease categories">'+groups.map(group=>catalogDoor(c,'health-catalog-group',group,group,available.filter(item=>item.group===group))).join('')+'</nav>';
  const items=available.filter(item=>item.group===f.catalogGroup);return catalogPath(f.catalogGroup,'Disease category')+'<div class="catalog-items">'+customFirst(items).map(item=>catalogItem(c,item)).join('')+'</div>';
 }
 const sections=[...new Set(available.map(item=>item.section))];
 if(!f.catalogSection){
  const doors=[];
  for(const section of sections){
   const sectionItems=available.filter(item=>item.section===section),groups=[...new Set(sectionItems.map(item=>item.group))];
   if(section==='Body area')for(const group of groups)doors.push(catalogDoor(c,'health-catalog-group',group,group,sectionItems.filter(item=>item.group===group)));
   else doors.push(catalogDoor(c,'health-catalog-section',section,section,sectionItems,groups.length===1?'symptoms':groups.length+' groups · '+sectionItems.length+' symptoms'));
  }
  return '<nav class="catalog-categories" aria-label="Symptom categories">'+doors.join('')+'</nav>';
 }
 const sectionItems=available.filter(item=>item.section===f.catalogSection),groups=[...new Set(sectionItems.map(item=>item.group))],activeGroup=f.catalogGroup||(groups.length===1?groups[0]:'');
 if(!activeGroup)return catalogPath(f.catalogSection,'Symptom category')+'<nav class="catalog-categories" aria-label="'+esc(f.catalogSection)+' categories">'+groups.map(group=>catalogDoor(c,'health-catalog-group',group,group,sectionItems.filter(item=>item.group===group))).join('')+'</nav>';
 const items=sectionItems.filter(item=>item.group===activeGroup);return catalogPath(activeGroup,f.catalogSection)+'<div class="catalog-items">'+customFirst(items).map(item=>catalogItem(c,item)).join('')+'</div>';
}
function healthForm(c){const f=c.form;return sheet(c,'Record health',scope(c),`<div class="health-tabs">${['Disease','Symptom'].map(k=>button('health-kind',`${k==='Disease'?'Diseases':'Symptoms'} <span>${f.conditions.filter(n=>conditionDefinition(f,n)?.kind===k).length}</span>`,'',k).replace('<button',`<button aria-pressed="${f.kind===k}"`)).join('')}</div><label class="field catalog-search">Search ${f.kind.toLowerCase()}s<input type="search" data-v2="search" value="${esc(f.search||'')}" placeholder="Name, category or abbreviation"></label><div class="health-catalog">${healthList(c)}</div><p class="selected-conditions">${f.conditions.length?f.conditions.map(esc).join(' · '):'Choose diseases or symptoms'}</p>${healthStateFields(c)}<p class="quiet-note">Existing cases keep their original start date.</p>`,footer(back(),button('save-health',`Record · ${countLabel(f.subjects.length)}`,'button primary','',!f.conditions.length)));}
function validIndependentAdjustment(f){return f.subjects?.length===1&&!!f.reason?.trim()&&String(f.percent??'').trim()!==''&&Number.isFinite(+f.percent)&&+f.percent>-100&&+f.percent!==0&&!!f.start&&!!f.end&&f.end!=='when recovered';}
function saveIndependentAdjustment(c){
 const f=c.form;if(c.view!=='individual-plan'||!validIndependentAdjustment(f))return false;
 const p=pig(c,f.subjects[0]);if(!p||penOf(c,p.id).mode==='adlib')return false;
 const previous=pigAllocation(p,penOf(c,p.id));delete p.feedHold;p.noFeed=false;p.cases.forEach(k=>{if(k.feedLinked)k.feedLinked=false;});
 p.factor=1+(+f.percent/100);p.band='custom';p.adjustmentReason=f.reason.trim();p.adjustmentActive=true;p.adjustmentStart=f.start;p.ends=f.end;p.review=undefined;
 const note=quantity(previous)+' → '+quantity(p.base*p.factor)+' kg/day · '+p.adjustmentReason+' · ends '+f.end;
 (p.feedChanges||=[]).unshift({title:'Individual adjustment changed',note,time:'Today · 09:41',who:'G. Hansen'});
 addEvent(c,'Feed adjustment changed',[p.id],note,'Feed');p.last='Feed adjustment updated';c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';return true;
}
function bodyForm(c){
 const f=c.form,single=c.view==='individual-plan',custom=single&&f.band==='custom',factor=custom?1+(+f.percent/100):bandFactors[f.band];
 const ready=custom?validIndependentAdjustment(f):!!f.band&&!!f.end&&!!f.start;
 return sheet(c,single?'Individual feed adjustment':'Body condition',single?f.subjects[0]+' · '+penOf(c,f.subjects[0]).id:scope(c),
 fieldSelect(c,single?'Adjustment':'Observed condition','band',[['',single?'Choose adjustment':'Choose condition'],...(single?[['custom','Other reason · custom amount']]:[]),...bands,...(single?[['standard','Clear adjustment · return to base plan']]:[])],f.band)+
 (custom?'<label class="field">Reason<input data-v2="reason" value="'+esc(f.reason||'')+'" placeholder="e.g. cold weather"></label><label class="field">Change · %<input type="number" inputmode="decimal" step="any" data-v2="percent" value="'+esc(f.percent??'')+'" placeholder="Enter increase or decrease"></label>':'')+
 '<div class="detail-line plan-start"><span>Starts</span><span>Today · 12 Sep</span></div>'+fieldSelect(c,'Ends','end',[['','Choose an end'],['2026-09-15','15 Sep · after 3 days'],['2026-09-19','19 Sep · after 7 days'],['2026-09-26','26 Sep · after 14 days'],...(!custom?[['when recovered','When the condition is resolved']]:[])],f.end)+
 (f.band&&Number.isFinite(factor)&&(!custom||String(f.percent??'').trim()!=='')?'<div class="plan-preview">'+f.subjects.map(id=>{const p=pig(c,id);return '<div class="detail-line"><span>'+id+'</span><strong>'+quantity(p.base*p.factor)+' → '+quantity(p.base*factor)+' kg/day</strong></div>';}).join('')+'</div>':'')+
 '<p class="quiet-note">'+(custom?'Updates the feed plan without adding a health finding.':'Body-condition bands link the finding and feed plan.')+'</p>',footer(back(),button('save-body',single?'Apply adjustment':'Record · '+countLabel(f.subjects.length),'button primary','',!ready)));
}


// Human-entered records lead; derived plans and stable facts stay in reading sections.
function recordCard({kind,title,meta='',badge='',copy='',qualification='',tone='',link='',value=''}){
 const health=/^(Symptom|Disease|Body condition|Health finding)/.test(kind);
 const type=health?'Health':kind==='Equipment fault'?'Equipment':kind==='Latest treatment'?'Treatment':kind==='Feed instruction'?'Feed':'Note';
 const context=[health?kind:'',!health?badge:'',meta].filter(Boolean).join(' · ');
 const body='<span class="record-notice-heading"><span class="record-type">'+esc(type)+'</span><strong>'+esc(title)+'</strong>'+(link?icon('chevron'):'')+'</span>'+(copy?'<span class="record-notice-issue">'+esc(copy)+'</span>':'')+(qualification?'<strong class="record-notice-qualification">'+esc(qualification)+'</strong>':'')+(context||health&&badge?'<span class="record-notice-bottom"><span class="record-notice-context">'+esc(context)+'</span>'+(health&&badge?'<span class="notice-care '+(badge==='Monitor'?'is-monitor':'')+'" aria-label="Care: '+esc(badge)+'">'+esc(badge)+'</span>':'')+'</span>':'');
 return link?button(link,body,'record-card '+tone,value):'<article class="record-card '+tone+'">'+body+'</article>';
}
function pigRecordCards(p){
 return attentionOverview(p)+(p.treatment?'<div class="recent-treatment"><span>Last treatment</span><strong>'+esc(p.treatment.medicine)+'</strong><small>'+esc(p.treatment.dose+' '+p.treatment.unit+' · '+p.treatment.method)+'</small></div>':'');
}
function currentTasksForPig(c,p){
 if(!p)return [];
 const completed=new Set(c.completedHostTasks||[]),tasks=[...(c.hostTasks||[]),...(p.currentTasks||[]),...(p.tasks||[])];
 const batch=c.batches?.find(b=>b.id===p.batchId&&b.pigIds.includes(p.id)),task=batchTaskForPig(batch,p.id);
 if(!batch?.currentTask&&p.stage==='Farrowing')tasks.push({id:'farrowing',title:'Farrowing',type:'Production',status:'In progress',summary:'Record this sow’s litter',action:'open-farrowing'});
 else if(task){const farrowing=task.kind==='current'&&task.id==='farrowing';tasks.push({id:task.id,title:task.title,type:'Production',status:task.kind==='current'?'In progress':task.when||'Scheduled',summary:'Batch '+batch.id,batchId:batch.id,action:farrowing?'open-farrowing':'sow-current-task',value:task.id});}
 const unique=[];
 for(const item of tasks){
  if(!item||completed.has(item.id))continue;
  const key=item.id||String(item.title||'').trim().toLowerCase();
  if(!key||unique.some(existing=>(existing.id||String(existing.title||'').trim().toLowerCase())===key))continue;
  unique.push(item);
 }
 const priority=item=>/in progress/i.test(item.status||'')?0:/due today|today/i.test(item.status||'')?1:/tomorrow/i.test(item.status||'')?2:3;
 return unique.sort((a,b)=>priority(a)-priority(b));
}
function completeCurrentTask(c,taskId,subjects=[]){
 c.completedHostTasks=[...new Set([...(c.completedHostTasks||[]),taskId])];
 c.hostTasks=(c.hostTasks||[]).filter(t=>t.id!==taskId);
 for(const id of subjects){const p=pig(c,id);if(!p)continue;p.tasks=(p.tasks||[]).filter(t=>t.id!==taskId);p.currentTasks=(p.currentTasks||[]).filter(t=>t.id!==taskId);}
}
function openProductionTask(c,task,subject){
 if(!task||!subject)return false;
 c.selected=new Set([subject.id]);c.selectedPens.clear();
 c.form={taskId:task.id,taskTitle:task.title,taskBatchId:task.batchId||subject.batchId||'',subjects:[subject.id],taskOutcome:'',taskNote:''};
 c.view='production-task';return true;
}
function productionTaskPage(c){
 const f=c.form||{},p=pig(c,f.subjects?.[0]||c.pigId),pregnancy=/pregnan/i.test(f.taskTitle||'');
 const choices=pregnancy?[['pregnant','Pregnant','Keep in the current gestation batch'],['not-in-pig','Not in pig','Close this task and return the sow to rebreed watch'],['recheck','Recheck later','Keep the task open for another check']]:[['complete','Complete task','Record this task as done'],['recheck','Follow up','Keep it open for another visit']];
 return sheet(c,f.taskTitle||'Production task',(p?.id||'')+(f.taskBatchId?' · Batch '+f.taskBatchId:''),'<section class="task-action-panel"><h4>Record outcome</h4><div class="choice-list task-outcome-list">'+choices.map(([value,label,sub])=>button('task-outcome','<span><strong>'+label+'</strong><small>'+sub+'</small></span>'+icon('check'),'choice-option'+(f.taskOutcome===value?' is-selected':''),value).replace('<button','<button aria-pressed="'+(f.taskOutcome===value)+'"')).join('')+'</div><label class="field">Note · optional<textarea data-v2="taskNote" placeholder="Add useful context for the next person">'+esc(f.taskNote||'')+'</textarea></label></section>',footer(back(),button('save-production-task',f.taskOutcome==='recheck'?'Save follow-up':'Save and complete','button primary','',!f.taskOutcome)));
}
function saveProductionTask(c){
 const f=c.form||{},p=pig(c,f.subjects?.[0]);if(!p||!f.taskOutcome)return false;
 const outcome={pregnant:'Pregnant','not-in-pig':'Not in pig',recheck:'Recheck later',complete:'Completed'}[f.taskOutcome]||f.taskOutcome;
 if(f.taskOutcome!=='recheck')completeCurrentTask(c,f.taskId,[p.id]);
 if(f.taskOutcome==='not-in-pig'){
  const batch=c.batches?.find(b=>b.id===p.batchId);if(batch)batch.pigIds=batch.pigIds.filter(id=>id!==p.id);
  p.batchId='';p.stage='Off production';p.breedingStatus='Open';
 }
 addEvent(c,f.taskTitle||'Production task',[p.id],outcome+(f.taskNote?.trim()?' · '+f.taskNote.trim():''),'Production');
 c.pigId=p.id;c.selected.clear();c.navTrail=[];c.form={};c.view='pig';return true;
}
function pigCurrentTasks(c){
 const tasks=currentTasksForPig(c,pig(c,c.pigId));if(!tasks.length)return '';
 const taskIcon=t=>t.id==='vaccination'||/vaccin/i.test(t.title||'')?'treat':(t.type||'').toLowerCase()==='production'?'chart':'condition';
 const heading=stHeading({title:'Current tasks',icon:icon('note'),meta:tasks.length+' '+(tasks.length===1?'task':'tasks'),kind:'section',level:4,className:'pig-current-tasks-heading'},'<div class="pig-current-tasks-heading"><h4 class="section-title">'+icon('note')+'Current tasks</h4><span>'+tasks.length+' '+(tasks.length===1?'task':'tasks')+'</span></div>');
 return '<section class="pig-current-tasks" aria-label="Current tasks">'+heading+'<div class="pig-current-task-list" role="region" aria-label="Current task cards" tabindex="0" data-task-count="'+tasks.length+'">'+tasks.map(t=>{const type=t.type||'General',slug=type.toLowerCase().replace(/[^a-z0-9]+/g,'-'),state=/in progress/i.test(t.status||'')?' is-active':/due today|today/i.test(t.status||'')?' is-due':'';return button(t.action||'sow-current-task','<span class="pig-current-task-icon">'+icon(taskIcon(t))+'</span><span class="pig-current-task-copy"><strong>'+esc(t.title)+'</strong><small>'+esc([t.status,t.summary].filter(Boolean).join(' · '))+'</small></span><span class="pig-current-task-type">'+esc(type)+'</span>'+icon('chevron'),'pig-current-task-entry task-'+slug+state,t.value||t.id);}).join('')+'</div></section>';
}
function pigFeedFacts(p,pe){
 if(pe.mode==='unknown')return '<section class="detail-section reading-section pig-feeding-facts">'+stHeading({title:'Feeding',icon:icon('feed'),kind:'section',level:4},'<div class="detail-heading"><h4 class="section-title">'+icon('feed')+'Feeding</h4></div>')+'<p class="detail-empty facts-surface">No feeding plan recorded.</p></section>';
 const amount=pe.mode==='adlib'?'Ad-lib':quantity(pigAllocation(p,pe))+' <small>kg/day</small>';
 const context=pe.mode==='station'?'Station-fed':pe.mode==='trough'?'Included in pen allocation':'No fixed ration';
 const tags=pigFeedTags(p).map(t=>t.kind==='ration'?{...t,label:'Feed '+t.delta,day:feedAdjustmentReason(p)}:t);
 const heading=stHeading({title:'Feeding',icon:icon('feed'),kind:'section',level:4,action:button('pig-feed','View plan '+icon('chevron'),'profile-details-link',p.id)},'<div class="detail-heading"><h4 class="section-title">'+icon('feed')+'Feeding</h4>'+button('pig-feed','View plan '+icon('chevron'),'profile-details-link',p.id)+'</div>');
 const inner='<div class="pig-feed-fact-row"><span class="pig-feed-copy"><strong>'+esc(pe.formula)+'</strong><small>'+esc(context)+'</small></span><span class="pig-feed-amount">'+amount+'</span></div>'+(tags.length?'<div class="feeding-status-tags">'+tags.map(recordedTag).join('')+'</div>':'');
 return '<section class="detail-section reading-section pig-feeding-facts">'+heading+stPanel(inner,{className:'facts-surface'},'<div class="facts-surface st-panel">'+inner+'</div>')+'</section>';
}
function daysFromWalk(date){
 if(!date)return null;const value=Date.parse(date),today=Date.parse(walkDate);return Number.isFinite(value)?Math.floor((today-value)/86400000):null;
}
function measurementAge(p,key){
 const days=daysFromWalk(p.measurementDates?.[key]);return days===null||days<0?'Date unknown':days===0?'Today':days===1?'1 day ago':days+' days ago';
}
function overviewNextTask(p,c){
 const batch=c?.batches?.find(b=>b.id===p.batchId&&b.pigIds.includes(p.id)),name=batch?.next;
 const days=daysFromWalk(batch?.nextDate),timing=days===null?'':days===0?'Today':days<0?'In '+(-days)+' '+(days===-1?'day':'days'):(days===1?'1 day':days+' days')+' overdue';
 return '<div class="overview-fact'+(!name?' is-empty':'')+'"><span class="overview-fact-label">Next task</span><strong>'+esc(name||'—')+'</strong>'+(name&&timing?'<small>'+esc(timing)+'</small>':'')+'</div>';
}
function overviewDetails(p,c){
 const facts=[],ongoing=cases(p).filter(k=>!needsHealthAttention(k)),r=p.registry||{};
 const fact=(label,value,unit='',meta='')=>'<div class="overview-fact'+(!hasRecordValue(value)?' is-empty':'')+'"><span class="overview-fact-label">'+esc(label)+'</span><strong>'+recordValue(value,unit)+'</strong>'+(hasRecordValue(value)&&meta?'<small>'+esc(meta)+'</small>':'')+'</div>';
 const health='<div class="overview-health-row'+(!ongoing.length?' is-empty':'')+'"><span class="overview-fact-label">Health</span><div class="overview-health-list"'+(ongoing.length?' role="region" aria-label="Persistent health conditions" tabindex="0"':'')+'>'+(ongoing.length?ongoing.map(k=>button('finding',recordedTag({label:k.name,day:Number.isFinite(k.day)?k.day+' days':'',...careAppearance(k)}),'overview-health-value',p.id+'|'+k.name).replace('<button','<button aria-label="'+esc(k.name+' · '+(Number.isFinite(k.day)?k.day+' days':'Duration unknown')+' · View condition')+'"')).join(''):'<span class="overview-health-empty">—</span>')+'</div></div>';
 facts.push(fact('Age',p.age??daysFromWalk(r.birthDate),'days'),fact('Type',animalType(p)),fact('Breed',r.breed),fact('Batch',p.batchId));
 for(const [key,label,unit] of [['weight','Weight','kg'],['temperature','Temperature','°C']])facts.push(fact(label,p[key],unit,measurementAge(p,key)));
 facts.push(fact('On farm',r.onFarm===undefined?null:r.onFarm?'Yes':'No'));
 return stPanel('<div class="overview-details-grid">'+facts.join('')+health+'</div>',{className:'facts-surface'},'<div class="overview-details-grid facts-surface st-panel">'+facts.join('')+health+'</div>');
}
function typeDetails(p,c){
 const r=p.registry||{},type=animalType(p);let title='',items=[];
 if(type==='Sow'||type==='Gilt'){
  title=type==='Sow'?'Sow cycle':'Gilt breeding';
  items=[['Last service',r.serviceDate,'',r.serviceDate?measurementDateAge(r.serviceDate):''],['Expected farrowing',r.expectedFarrowing,'',r.expectedFarrowing?dueDateLabel(r.expectedFarrowing):''],['Backfat',p.backfat,'mm',measurementAge(p,'backfat')],['Teat count',r.teats]];
  if(type==='Gilt'&&p.stage!=='Gestating')items=[['First heat',r.firstHeat],['Next heat',r.expectedHeat],['Backfat',p.backfat,'mm',measurementAge(p,'backfat')],['Teat count',r.teats]];
 }else if(type==='Boar'){title='Boar breeding';items=[['Last service',r.serviceDate,'',r.serviceDate?measurementDateAge(r.serviceDate):''],['Breeding number',r.breedingId]];}
 else if(type==='Piglet'){title='Piglet growth';items=[['Birth weight',r.birthWeight,'kg'],['Weaning date',r.weaningDate],['Dam',r.dam],['Weaning weight',r.weaningWeight,'kg']];}
 else if(['Grower','Finisher','Weaner'].includes(type)){title='Growth';items=[['Entry weight',r.entryWeight,'kg'],['Entry date',r.growthEntryDate]];}
 if(!title)return '';
 const titleHeading=stHeading({title,icon:icon(type==='Sow'||type==='Gilt'?'clock':type==='Boar'?'profile':'weight'),kind:'section',level:4},'<div class="detail-heading"><h4 class="section-title">'+icon(type==='Sow'||type==='Gilt'?'clock':type==='Boar'?'profile':'weight')+title+'</h4></div>');
 return '<section class="detail-section reading-section animal-type-section">'+titleHeading+'<div class="overview-details-grid facts-surface st-panel">'+items.map(([label,value,unit,meta])=>'<div class="overview-fact'+(!hasRecordValue(value)?' is-empty':'')+'"><span class="overview-fact-label">'+label+'</span><strong>'+recordValue(value,unit)+'</strong>'+(hasRecordValue(value)&&meta?'<small>'+esc(meta)+'</small>':'')+'</div>').join('')+overviewNextTask(p,c)+(['Sow','Gilt'].includes(type)?'<div class="overview-fact'+(!hasRecordValue(p.parity)?' is-empty':'')+'"><span class="overview-fact-label">Parity</span><strong>'+recordValue(p.parity)+'</strong></div>':'')+'</div></section>';
}
function measurementDateAge(date){const days=daysFromWalk(date);return days===null?'':days===0?'Today':days>0?days+' days ago':'';}
function dueDateLabel(date){const days=daysFromWalk(date);return days===null?'':days===0?'Today':days<0?'In '+(-days)+' days':days+' days past expected';}
function pigRecordToolbar(p){return `<footer class="sheet-footer record-toolbar pig-detail-footer" aria-label="Pig actions">${button('back',`${icon('chevron')}<span>Back</span>`,'record-back')}${button('pig-actions',`${icon('grid')}<span>Actions</span>`,'button primary pig-actions-entry',p.id)}</footer>`;}
function pigOverview(c){
 const p=pig(c,c.pigId),pe=penOf(c,p.id);

 const general=stHeading({title:'General details',icon:icon('profile'),kind:'section',level:4},'<div class="detail-heading"><h4 class="section-title">'+icon('profile')+'General details</h4></div>');
 const record=stHeading({title:'Pig record',icon:icon('note'),kind:'section',level:4},'<div class="detail-heading"><h4 class="section-title">'+icon('note')+'Pig record</h4></div>');
 return sheet(c,p.id,unitName(c)+' · '+pe.id+' · '+stageSummary(p),pigRecordCards(p)+pigCurrentTasks(c)+'<section class="detail-section reading-section pig-overview-facts">'+general+overviewDetails(p,c)+'</section>'+typeDetails(p,c)+pigFeedFacts(p,pe)+'<section class="detail-section reading-section pig-record-links">'+record+'<div class="compact-actions detail-destinations st-panel st-row-group">'+action('pig-production','chart','Production stats','Averages and batch records',p.id)+action('pig-origin','origin','Origin','Provenance, dates and identities',p.id)+action('pig-log','clock','Log','Production, health and movement',p.id)+'</div></section>',pigRecordToolbar(p));
}
function penOverview(c){const pe=pen(c,c.penId),records=[];if(pe.note)records.push(recordCard({kind:'Pen note',title:pe.note,meta:pe.noteBy,tone:'record-neutral record-note-preview',link:'read-pen-note',value:pe.id}));return sheet(c,'Pen '+pe.id,countLabel(pe.pigs.length)+' · '+unitName(c),
 (records.length?'<div class="record-card-stack" aria-label="Pen notes">'+records.join('')+'</div>':'')+'<section class="detail-section">'+stHeading({title:'Pen information',icon:icon('grid'),kind:'section',level:4})+'<div class="compact-actions st-panel st-row-group">'+action('feed','feed','Feed guidance',pe.formula+' · '+feedLabel(pe),pe.id)+action('pen-note','note',pe.note?'Edit pen note':'Add pen note',pe.note?'Update the note for this pen':'Leave information for the next person',pe.id)+action('pen-log','clock','Pen log','Transfers, health and notes',pe.id)+'</div></section>',footer(back(),''));}

// Bulk actions are drafts over explicit pig IDs; pens only provide selection context.
const bulkActionKinds=['health','edit-conditions','triage','resolve','weight','temperature','backfat','treatment','note','body'];
const bulkMeasurements={weight:{label:'Weight',unit:'kg'},temperature:{label:'Temperature',unit:'°C'},backfat:{label:'Backfat',unit:'mm'}};
const bulkTitles={health:'Record health','edit-conditions':'Edit conditions',triage:'Care instructions',resolve:'Resolve conditions',weight:'Record weights',temperature:'Record temperatures',backfat:'Record backfat',treatment:'Record treatment',note:'Add a note',body:'Body condition'};
function openBulkAction(c,view,subjects=picked(c).map(p=>p.id)){
 c.form={recordEditor:true,bulk:subjects.length>1,subjects,excluded:[],values:{},conditions:[],conditionKinds:{},customConditions:{...(c.customHealthCatalog||{})},kind:'Symptom',search:'',catalogSection:'',catalogGroup:'',target:'',triage:view==='health'?'None':'keep',note:'',outcome:'',condition:'',medicine:'',brand:'',method:'',doseUnit:'',dose:''};
 c.view=view;if(subjects.length>1)delete c.actionEntry;
}
function bulkChanges(c){
 const f=c.form,view=c.view;
 return f.subjects.map(id=>{
  const p=pig(c,id),row={id,p,eligible:true,change:false,error:false,summary:''};
  if(!p||p.stage==='Sow died'&&view!=='note')return {...row,eligible:false,summary:'Not eligible'};
  if(view==='backfat'&&!['Sow','Gilt'].includes(animalType(p)))return {...row,eligible:false,summary:'Sows and gilts only'};
  if(f.excluded.includes(id))return {...row,eligible:false,summary:'Excluded'};
  if(bulkMeasurements[view]){
   const value=f.values[id];row.value=value;
   if(value===undefined||value==='')row.summary='No reading · unchanged';
   else if(!Number.isFinite(+value)||+value<=0){row.error=true;row.summary='Enter a value above 0';}
   else {row.change=true;row.summary=(p[view]??'—')+' → '+Number(value)+' '+bulkMeasurements[view].unit;}
  }else if(view==='health'){
   row.additions=f.conditions.filter(name=>conditionDefinition(f,name)&&!cases(p).some(k=>k.name===name));
   row.change=!!row.additions.length;row.summary=!f.conditions.length?'Choose conditions':row.change?'Add '+row.additions.join(', ')+' · '+careLabel(f.triage):'Already recorded · unchanged';
  }else if(['edit-conditions','triage','resolve'].includes(view)){
   row.finding=cases(p).find(k=>k.name===f.target);
   if(!f.target)row.summary=cases(p).map(k=>k.name).join(', ')||'No open conditions';
   else if(!row.finding){row.eligible=false;row.summary='No '+f.target+' · unchanged';}
   else if(view==='resolve'){row.change=['recover','strike'].includes(f.outcome);row.summary=f.target+(row.change?' → '+(f.outcome==='recover'?'Recovered':'Entered in error'):' · choose outcome');}
   else {
    const k=row.finding,changes=[];
    if(f.triage!=='keep'&&(k.triage||'None')!==f.triage)changes.push(careLabel(k.triage)+' → '+careLabel(f.triage));
    if(f.note.trim()&&f.note.trim()!==(k.note||''))changes.push('Note updated');
    row.change=!!changes.length;row.summary=f.target+' · '+(changes.join(' · ')||'Unchanged');
   }
  }else if(view==='treatment'){
   if(f.target&&!cases(p).some(k=>k.name===f.target))return {...row,eligible:false,summary:'No '+f.target+' · unchanged'};
   row.value=Object.hasOwn(f.values,id)?f.values[id]:f.dose;
   row.error=row.value!==''&&row.value!==undefined&&(!Number.isFinite(+row.value)||+row.value<=0);
   row.change=!!f.medicine.trim()&&!!f.method&&!!f.doseUnit&&row.value!==''&&row.value!==undefined&&!row.error;
   row.summary=row.error?'Enter a dose above 0':row.change?f.medicine.trim()+' · '+Number(row.value)+' '+f.doseUnit:'Complete treatment details';
  }else if(view==='note'){row.change=!!f.note.trim();row.summary=row.change?f.note.trim():'No note entered';}
  else if(view==='body'){
   const current=p.bodyCondition||cases(p).find(k=>k.kind==='Body condition')?.name||'—';
   row.change=['Thin','Over-conditioned'].includes(f.condition)&&current!==f.condition;row.summary=f.condition?current+' → '+f.condition:current;
  }
  return row;
 });
}
function bulkActionValid(c){const rows=bulkChanges(c);return rows.some(r=>r.change)&&!rows.some(r=>r.error);}
function saveBulkAction(c){
 if(!bulkActionValid(c))return false;
 const f=c.form,view=c.view,rows=bulkChanges(c).filter(r=>r.change&&r.eligible);
 for(const row of rows){
  const p=row.p,id=p.id;
  if(bulkMeasurements[view]){p[view]=Number(row.value);(p.measurementDates||={})[view]=walkDate;addEvent(c,view==='weight'?'Weight recorded':bulkMeasurements[view].label,[id],row.summary+(f.note.trim()?' · '+f.note.trim():''));}
  else if(view==='health'){
   for(const name of row.additions){const item=conditionDefinition(f,name);p.cases.push({name,kind:item.kind,day:1,triage:f.triage,issueStatus:issueStatus(f),recordedDate:walkDate,recordedBy:'G. Hansen',note:f.note.trim()});}
   addEvent(c,'Health recorded',[id],row.additions.join(' · ')+' · '+careLabel(f.triage));
  }else if(view==='edit-conditions'||view==='triage'){
   if(f.triage!=='keep'){row.finding.triage=f.triage;row.finding.issueStatus=issueStatus(row.finding);}
   if(f.note.trim())row.finding.note=f.note.trim();
   addEvent(c,view==='triage'?'Triage updated':'Finding edited',[id],row.summary);
  }else if(view==='resolve'){
   const k=row.finding;(p.closedCases||=[]).push({...k,outcome:f.outcome,closedAt:'09:41',closedBy:'G. Hansen',closeNote:f.note.trim()});p.cases=p.cases.filter(x=>x!==k);
   if(k.feedLinked){p.factor=1;p.adjustmentActive=false;p.band='standard';p.ends=undefined;}
   addEvent(c,f.outcome==='recover'?'Recovered':'Record corrected',[id],k.name+(f.note.trim()?' · '+f.note.trim():''));
  }else if(view==='treatment'){
   p[f.taskId==='vaccination'?'vaccination':'treatment']={medicineId:f.medicineId||null,medicine:f.medicine.trim(),brand:f.brand.trim(),dose:Number(row.value),unit:f.doseUnit,method:f.method,target:f.target||null};
   addEvent(c,f.taskId==='vaccination'?'Vaccination recorded':'Treatment recorded',[id],row.summary+' · '+f.method+(f.brand.trim()?' · '+f.brand.trim():'')+(f.note.trim()?' · '+f.note.trim():''));
  }else if(view==='note'){p.note=f.note.trim();addEvent(c,'Note',[id],f.note.trim());}
  else if(view==='body'){
   p.bodyCondition=f.condition;const k=cases(p).find(k=>k.kind==='Body condition');
   if(k){k.name=f.condition;}else p.cases.push({name:f.condition,kind:'Body condition',day:1,triage:'Monitor',issueStatus:'attention',recordedDate:walkDate,recordedBy:'G. Hansen',note:f.note.trim()});
   addEvent(c,'Body condition recorded',[id],row.summary+' · feed unchanged');
  }
  p.last='Updated just now';
 }
 if(f.taskId)completeCurrentTask(c,f.taskId,f.subjects);
 if(f.returnFinding){c.findingName=f.returnFinding;c.form={};c.view='finding';return true;}
 c.form={};c.view='list';c.reviewOnly=false;c.selected.clear();c.selectedPens.clear();return true;
}
function bulkSelect(c,label,key,options){return fieldSelect(c,label,key,options,c.form[key],'bulk');}
function bulkInput(c,label,key,type='text'){return '<label class="field">'+label+'<input data-bulk-key="'+key+'" type="'+type+'"'+(type==='number'?' min="0" step="any" inputmode="decimal"':'')+' value="'+esc(c.form[key]||'')+'"></label>';}
function bulkRowState(row){return !row.eligible||row.error?row.summary:row.change?'Ready to save':row.summary;}
function bulkRows(c){
 const f=c.form,m=bulkMeasurements[c.view],dose=c.view==='treatment';
 return bulkChanges(c).map(row=>{
  const p=row.p,blocked=p?.stage==='Sow died'&&c.view!=='note'||c.view==='backfat'&&!['Sow','Gilt'].includes(animalType(p));
  const value=m?f.values[row.id]:Object.hasOwn(f.values,row.id)?f.values[row.id]:f.dose;
  const state=bulkRowState(row);
  const change=(m||dose)?'<span class="pig-review-change bulk-pig-change"><span class="feed-pig-values">'+(m?'<span class="feed-reading"><small>Current</small><span>'+esc(p?.[c.view]??'—')+'</span></span><span class="feed-change-arrow" aria-hidden="true">→</span>':'')+'<label class="feed-reading is-new bulk-reading"><small>'+(m?'New':esc(f.doseUnit||'Dose'))+'</small><input type="number" inputmode="decimal" min="0" step="any" data-bulk-value="'+esc(row.id)+'" value="'+esc(value??'')+'" aria-label="'+(m?m.label:'Dose')+' for '+esc(row.id)+'" placeholder="—"'+(!row.eligible?' disabled':'')+' aria-invalid="'+row.error+'"></label></span><small class="feed-change-state" data-bulk-summary="'+esc(row.id)+'">'+esc(state)+'</small></span>':'<span class="pig-review-change bulk-pig-change"><small class="feed-change-state" data-bulk-summary="'+esc(row.id)+'">'+esc(state)+'</small></span>';
  const include=f.bulk?'<label class="bulk-pig-check"><input type="checkbox" data-bulk-include="'+esc(row.id)+'" aria-label="Include pig '+esc(row.id)+'"'+(!f.excluded.includes(row.id)&&!blocked?' checked':'')+(blocked?' disabled':'')+'></label>':'';
  return '<div class="pig-review-row bulk-pig-row'+(!f.bulk?' is-single':'')+(!row.eligible?' is-excluded':row.change?' is-changed':' is-unchanged')+'">'+include+'<span class="pig-review-identity bulk-pig-copy"><strong>'+esc(row.id)+'</strong><small>'+esc(p?penOf(c,row.id).id+' · '+stageSummary(p):'Unavailable')+'</small>'+(c.view==='resolve'&&row.finding?.feedLinked?'<small>Resets linked feed adjustment</small>':'')+'</span>'+change+'</div>';
 }).join('');
}
function bulkActionPage(c){
 const f=c.form,view=c.view,single=!f.bulk,conditions=[...new Set(f.subjects.flatMap(id=>cases(pig(c,id)).map(k=>k.name)))],target=bulkSelect(c,'Condition','target',[['','Choose condition'],...conditions.map(n=>[n,n])]);let controls='';
 if(view==='health')controls=button('bulk-pick-health','<span>'+esc(f.conditions.length?f.conditions.join(', '):'Choose conditions')+'</span>'+icon('chevron'),'bulk-condition-button')+bulkSelect(c,'Care','triage',careOptions);
 if(view==='edit-conditions'||view==='triage')controls=target+bulkSelect(c,'Care','triage',[['keep','Keep current care'],...careOptions]);
 if(view==='resolve')controls='<div class="bulk-control-grid">'+target+bulkSelect(c,'Outcome','outcome',[['','Choose outcome'],['recover','Recovered'],['strike','Entered in error']])+'</div>';
 if(view==='treatment'){
  const method=bulkSelect(c,'Method','method',[['','Choose method'],['Injection','Injection'],['Oral','Oral'],['Topical','Topical'],['In feed','In feed'],['In water','In water']]);
  const dose=bulkInput(c,single?'Dose':'Set dose for all','dose','number'),unit=bulkSelect(c,'Unit','doseUnit',[['','Choose unit'],['mL','mL'],['mg','mg'],['g','g']]);
  controls='<div class="field">'+(f.taskId==='vaccination'?'Vaccine':'Medicine')+button('medicine-open','<span>'+esc(f.medicine||'Select medicine')+'</span>'+icon('chevron'),'bulk-condition-button medicine-field')+'</div>'+(single?method:'')+'<div class="bulk-control-grid">'+(single?dose+unit:method+unit+dose)+(f.returnFinding?'<div class="field">Condition<strong>'+esc(f.returnFinding)+'</strong></div>':'')+'</div>';
 }
 if(view==='body')controls=bulkSelect(c,'Condition','condition',[['','Choose condition'],['Thin','Thin'],['Over-conditioned','Over-conditioned']])+'<p class="quiet-note">Records condition. Feed stays unchanged.</p>';
 const note=view==='note'?'<label class="field">Note<textarea data-bulk-key="note" rows="2" placeholder="Add a note">'+esc(f.note)+'</textarea></label>':recordOptionalControls(c);
 const rows=bulkChanges(c),count=rows.filter(r=>r.change&&r.eligible).length;
 if(single&&view!=='health'){
  const p=pig(c,f.subjects[0]),m=bulkMeasurements[view];
  if(m)controls='<label class="field">'+m.label+' · '+m.unit+'<input type="number" min="0" step="any" inputmode="decimal" data-bulk-value="'+esc(p.id)+'" value="'+esc(f.values[p.id]??'')+'" aria-label="'+m.label+' for '+esc(p.id)+'" placeholder="—"></label><p class="quiet-note">Last recorded: '+esc(p[view]??'—')+(p[view]!=null?' '+m.unit+' · '+measurementAge(p,view):'')+'</p>';
  const title=f.taskId==='vaccination'?'Record vaccination':m?'Record '+m.label.toLowerCase():bulkTitles[view];
  return sheet(c,title,p.id+' · '+penOf(c,p.id).id,'<section class="bulk-controls facts-surface" aria-label="Record details">'+controls+note+'</section>',footer(back(),button('bulk-save',f.taskId?'Save and complete task':'Save','button primary','',!bulkActionValid(c)))).replace('class="sheet"','class="sheet single-action-sheet"');
 }
 return sheet(c,bulkTitles[view],countLabel(f.subjects.length),'<div class="bulk-action-layout"><section class="pig-review-card bulk-pigs'+(f.subjects.length<=3?' is-short':'')+'"><div class="pig-review-heading feed-pigs-heading"><span><h4>Pigs</h4><small>'+f.subjects.length+' selected</small></span><strong>'+(bulkMeasurements[view]?'Current → New · '+bulkMeasurements[view].unit:'Preview changes')+'</strong></div><div class="pig-review-list bulk-pig-list" role="region" aria-label="Selected pigs" tabindex="0" data-bulk-rows>'+bulkRows(c)+'</div></section><section class="bulk-controls facts-surface'+(f.controlsCollapsed?' is-collapsed':'')+'" aria-label="Apply to selected pigs">'+button('bulk-toggle-controls','<span>'+(view==='treatment'?'Treatment details':'Details')+'</span>'+icon('chevron'),'bulk-controls-toggle').replace('<button','<button aria-expanded="'+!f.controlsCollapsed+'"')+(!f.controlsCollapsed?'<div class="bulk-control-fields">'+controls+note+'</div>':'')+'</section></div>',footer(back(),button('bulk-save',single?'Save':'Save · '+countLabel(count),'button primary','',!bulkActionValid(c)))).replace('class="sheet"','class="sheet bulk-action-sheet"');
}
// Sample catalogue illustrates browsing and selection; it is not a treatment recommendation.
const medicineCatalogue=[
 {id:'antibiotic-a',category:'Antibiotics',name:'Antibiotic A',detail:'Injectable solution · Sample product'},
 {id:'antibiotic-b',category:'Antibiotics',name:'Antibiotic B',detail:'Oral solution · Sample product'},
 {id:'pain-a',category:'Pain relief',name:'Pain relief A',detail:'Injectable solution · Sample product'},
 {id:'parasite-a',category:'Parasite control',name:'Parasite control A',detail:'Oral suspension · Sample product'},
 {id:'vaccine-a',category:'Vaccines',name:'Vaccine A',detail:'Injectable suspension · Sample product'},
 {id:'vaccine-b',category:'Vaccines',name:'Vaccine B',detail:'Oral suspension · Sample product'}
];
function medicineResults(c){
 const f=c.form,q=(f.medicineSearch||'').trim().toLowerCase(),catalogue=medicineCatalogue.filter(m=>f.taskId!=='vaccination'||m.category==='Vaccines');
 if(!q&&!f.medicineCategory)return '<h4>Browse categories</h4>'+[...new Set(catalogue.map(m=>m.category))].map(category=>action('medicine-category','treat',category,catalogue.filter(m=>m.category===category).length+(catalogue.filter(m=>m.category===category).length===1?' medicine':' medicines'),category)).join('');
 const matches=catalogue.filter(m=>q?(m.name+' '+m.category+' '+m.detail).toLowerCase().includes(q):m.category===f.medicineCategory);
 return (f.medicineCategory&&!q?button('medicine-root','All categories','text-button')+'<h4>'+esc(f.medicineCategory)+'</h4>':'<h4>Search results</h4>')+(matches.length?matches.map(m=>button('medicine-select','<span><strong>'+esc(m.name)+'</strong><small>'+esc((q?m.category+' · ':'')+m.detail)+'</small></span>'+icon(f.medicineId===m.id?'check':'chevron'),'medicine-option',m.id)).join(''):'<p class="quiet-note">No medicines found. Try another name or category.</p>');
}
function medicinePicker(c){return sheet(c,'Select medicine','Farm catalogue · sample products','<label class="field">Search medicines<input type="search" data-medicine-search placeholder="Name or category" value="'+esc(c.form.medicineSearch||'')+'"></label><div class="medicine-results" aria-live="polite">'+medicineResults(c)+'</div>',footer(back(),'')).replace('class="sheet"','class="sheet picker-step medicine-picker-step"');}
function optionalFieldControls(items,openAction,clearAction){return '<div class="feed-optional-controls">'+items.map(({key,symbol,label,value})=>'<div class="feed-optional-item'+(value?' has-value':'')+'">'+button(openAction,icon(symbol)+'<span>'+esc(value||label)+'</span>','feed-optional-open',key).replace('<button','<button aria-label="'+esc(value?'Edit '+label.toLowerCase().replace(/^add /,'')+', '+value:label)+'"')+(value?ib(clearAction,'close','Remove '+label.toLowerCase().replace(/^add /,''),key):'')+'</div>').join('')+'</div>';}
function recordOptionalControls(c){const f=c.form,fields=c.view==='treatment'?[['brand','note','Brand'],...(!f.returnFinding&&f.taskId!=='vaccination'?[['target','condition','Condition']]:[]),['note','note','Add note']]:[['note','note','Add note']];return optionalFieldControls(fields.map(([key,symbol,label])=>({key,symbol,label,value:f[key]})),'record-optional-open','record-optional-clear');}
function optionalEditorChanged(c){const f=c.form,key=c.view==='record-optional'?f.optionalKey:c.view==='feed-date'?'until':'reason',value=(f.optionalDraft||'').trim();return value!==(f[key]||'').trim()&&(c.view!=='feed-date'||!value||value>=walkDate);}
function conditionSelectionChanged(c){const before=c.form.conditionsBeforePicker||[],after=c.form.conditions||[];return before.length!==after.length||before.some(name=>!after.includes(name));}
function recordOptionalEditor(c){
 const f=c.form,key=f.optionalKey,label={brand:'Brand',target:'Condition',note:'Note'}[key],value=f.optionalDraft||'';
 const conditions=[...new Set(f.subjects.flatMap(id=>cases(pig(c,id)).map(k=>k.name)))];
 const field=key==='target'?fieldSelect(c,'Condition','recordOptionalCondition',[['','No linked condition'],...conditions.map(n=>[n,n])],value,'optional'):key==='note'?'<label class="field">Note<textarea rows="3" data-record-optional-input placeholder="Write a note">'+esc(value)+'</textarea></label>':'<label class="field">Brand<input data-record-optional-input value="'+esc(value)+'" placeholder="Brand or formulation"></label>';
 return sheet(c,label,countLabel(f.subjects.length),field+(f[key]?button('record-optional-remove','Remove '+label.toLowerCase(),'text-button feed-optional-remove'):''),footer(button('back','Back','button secondary'),button('record-optional-save','Save','button primary','',!optionalEditorChanged(c)))).replace('class="sheet"','class="sheet feed-optional-sheet"');
}
function bulkHealthPicker(c){const f=c.form;return sheet(c,'Choose conditions',countLabel(f.subjects.length),'<div class="health-tabs">'+['Disease','Symptom'].map(k=>button('health-kind',(k==='Disease'?'Diseases':'Symptoms')+' <span>'+f.conditions.filter(name=>conditionDefinition(f,name)?.kind===k).length+'</span>','',k).replace('<button','<button aria-pressed="'+(f.kind===k)+'"')).join('')+'</div><label class="field catalog-search">Search<input type="search" data-v2="search" value="'+esc(f.search)+'" placeholder="Name, category or abbreviation"></label><div class="health-catalog">'+healthList(c)+'</div>',footer(back(),button('bulk-health-done','Save','button primary','',!conditionSelectionChanged(c)))).replace('class="sheet"','class="sheet picker-step health-picker-step"');}
function installBulkInputs(){
 gallery.addEventListener('input',e=>{const el=e.target,root=el.closest('[data-card]');if(!root)return;const c=states[+root.dataset.card];if(el.hasAttribute('data-medicine-search')){e.stopImmediatePropagation();c.form.medicineSearch=el.value;root.querySelector('.medicine-results').innerHTML=medicineResults(c);}else if(el.hasAttribute('data-record-optional-input')){e.stopImmediatePropagation();c.form.optionalDraft=el.value;root.querySelector('[data-action="record-optional-save"]').disabled=!optionalEditorChanged(c);}},true);
 gallery.addEventListener('change',e=>{if(!e.target.hasAttribute('data-record-optional-input'))return;e.stopImmediatePropagation();const root=e.target.closest('[data-card]');const c=states[+root.dataset.card];c.form.optionalDraft=e.target.value;root.querySelector('[data-action="record-optional-save"]').disabled=!optionalEditorChanged(c);},true);

 const update=(e)=>{
  const el=e.target,root=el.closest('[data-card]');if(!root)return;
  const i=+root.dataset.card,c=states[i];if(!c.form?.recordEditor)return;
  if(!el.hasAttribute('data-bulk-key')&&!el.hasAttribute('data-bulk-value')&&!el.hasAttribute('data-bulk-include'))return;
  e.stopImmediatePropagation();const f=c.form;
  if(el.hasAttribute('data-bulk-include')){f.excluded=el.checked?f.excluded.filter(id=>id!==el.dataset.bulkInclude):[...new Set([...f.excluded,el.dataset.bulkInclude])];}
  else if(el.hasAttribute('data-bulk-value'))f.values[el.dataset.bulkValue]=el.value;
  else {f[el.dataset.bulkKey]=el.value;if(el.dataset.bulkKey==='dose')f.values={};}
  const rail=root.querySelector('[data-bulk-rows]');
  if(el.hasAttribute('data-bulk-value')){
   for(const row of bulkChanges(c)){const text=[...root.querySelectorAll('[data-bulk-summary]')].find(x=>x.dataset.bulkSummary===row.id);if(text)text.textContent=bulkRowState(row);}
   el.setAttribute('aria-invalid',bulkChanges(c).find(r=>r.id===el.dataset.bulkValue)?.error?'true':'false');
  }else if(rail){const scroll=rail.scrollTop;rail.innerHTML=bulkRows(c);rail.scrollTop=scroll;}
  const save=root.querySelector('[data-action="bulk-save"]');save.disabled=!bulkActionValid(c);save.textContent=f.bulk?'Save · '+countLabel(bulkChanges(c).filter(r=>r.change&&r.eligible).length):f.taskId?'Save and complete task':'Save';
 };
 gallery.addEventListener('input',update,true);gallery.addEventListener('change',update,true);
}

function productionTaskScope(task,p){
 const name=((task?.id||'')+' '+(task?.title||'')).toLowerCase();
 if(/piglet/.test(name))return 'piglet-processing';
 if(/farrow/.test(name))return 'farrowing';
 if(/pregnan/.test(name))return 'pregnancy-check';
 if(/heat|breed|service|insemin/.test(name))return 'breeding';
 if(/lactat|wean/.test(name))return 'lactation';
 if(/grow|finish|weight/.test(name))return 'growth';
 const stage=String(p?.stage||'').toLowerCase();
 if(/gestat|pregnan/.test(stage))return 'gestation';
 if(/farrow/.test(stage))return 'farrowing';
 if(/lactat/.test(stage))return 'lactation';
 if(/heat|breed|service|off production|open/.test(stage))return 'breeding';
 if(/grow|finish|wean/.test(stage))return 'growth';
 return 'other';
}
function hostProductionScope(action){
 if(action.scope)return action.scope;
 if(['miscarriage','edit','not-in-pig'].includes(action.id))return 'farrowing';
 if(['piglets','death','countReconcile','foster'].includes(action.id))return 'piglet-processing';
 return 'other';
}
function eligibleProductionScopes(c,p){
 const scopes=new Set(currentTasksForPig(c,p).filter(task=>(task.type||'').toLowerCase()==='production').map(task=>productionTaskScope(task,p)));
 const stage=productionTaskScope(null,p);if(stage!=='other')scopes.add(stage);
 return scopes;
}
function productionHostActionEligible(c,p,action){
 if(['remove-batch','move-batch'].includes(action.id))return false;
 const scope=hostProductionScope(action);return scope!=='other'&&eligibleProductionScopes(c,p).has(scope);
}
function productionActionsForPig(c,p){
 if(!p||p.stage==='Sow died')return [];
 const rows=[],tasks=currentTasksForPig(c,p).filter(task=>(task.type||'').toLowerCase()==='production');
 for(const task of tasks){
  if(task.id==='farrowing'||/farrowing/i.test(task.title||''))rows.push({a:'open-farrowing',k:'chart',title:'Open Farrowing',sub:'Continue the active farrowing task',value:'farrowing',section:'farrowing'});
  else if(task.id==='piglet-processing'&&(c.hostActions||[]).some(action=>action.id==='piglets'&&!action.reason))continue;
  else rows.push({a:task.id==='piglet-processing'?'sow-current-task':'production-task',k:'chart',title:task.title,sub:[task.status,task.summary].filter(Boolean).join(' · '),value:task.id,section:productionTaskScope(task,p)});
 }
 if(/gestat|in heat|breeding/i.test(p.stage||''))rows.push({a:'miscarriage',k:'chart',title:'Record miscarriage',sub:'Record a pregnancy loss',value:'miscarriage',section:'gestation'});
 const hostBatch=(c.hostActions||[]).some(action=>['remove-batch','move-batch'].includes(action.id)&&!action.reason);
 const localBatches=(c.batches||[]).filter(batch=>batch.id!==p.batchId);
 rows.push({a:'batch-membership',k:'transfer',title:'Batch membership',sub:p.batchId?'Batch '+p.batchId+' · move or remove':'Add this pig to a batch',value:p.id,section:'other',reason:!p.batchId&&!localBatches.length&&!hostBatch?'No production batches are available.':''});
 return rows;
}
function actionCatalogue(c){
 const rows=picked(c),single=rows.length===1,live=rows.some(p=>p.stage!=='Sow died'),fed=rows.every(p=>penOf(c,p.id).mode!=='adlib'),hasCases=rows.some(p=>cases(p).length),host=single&&!c.selectedPens.size?(c.hostActions||[]):[];
 const groups=[];const replacedHostBatch=new Set(['remove-batch','move-batch']);
 const currentPig=single?rows[0]:null,hostVisible=x=>x.group!=='production'||productionHostActionEligible(c,currentPig,x);
 const unavailable=host.filter(x=>x.reason&&!replacedHostBatch.has(x.id)&&hostVisible(x)).map(x=>({title:x.title,reason:x.reason,group:x.group==='records'?'general':x.group,section:x.group==='production'?hostProductionScope(x):x.scope||'',k:x.icon||(x.group==='health'?'alert':x.group==='production'?'chart':'note')}));
 const add=(id,label,items)=>{if(items.length)groups.push({id,label,items,empty:''});};
 const item=(a,k,title,sub,value='',section='')=>({a,k,title,sub,value,section});
 const nativeProduction=single&&!c.selectedPens.size?productionActionsForPig(c,rows[0]):[],nativeIds=new Set(nativeProduction.map(x=>x.value));
 const hostProduction=host.filter(x=>x.group==='production'&&!x.reason&&!replacedHostBatch.has(x.id)&&!nativeIds.has(x.id)&&hostVisible(x)).map(x=>item('sow-host-action',x.icon||'chart',x.title,x.sub,x.id,hostProductionScope(x)));
 const availableProduction=nativeProduction.filter(x=>!x.reason),unavailableProduction=nativeProduction.filter(x=>x.reason).map(x=>({title:x.title,reason:x.reason,group:'production',section:x.section,k:x.k}));
 unavailable.push(...unavailableProduction);add('production','Production',[...availableProduction,...hostProduction]);
 add('health','Health',live?[item('health','condition','Disease or symptom','Record a health finding'),item('treatment','treat','Record treatment','Medicine, dose and method'),...(hasCases?[...(single?[]:[item('edit-conditions','note','Edit conditions','Review changes for each pig')]),item('resolve','check','Resolve conditions','Recover or correct a finding'),item('triage','alert','Care instructions','Monitor, treat or move')]:[]),...host.filter(x=>x.group==='health'&&!x.reason).map(x=>item('sow-host-action','alert',x.title,x.sub,x.id))]:[]);
 if(!hasCases&&live)unavailable.push({title:'Resolve conditions',group:'health',k:'check',reason:'No open conditions to resolve.'},{title:'Care instructions',group:'health',k:'alert',reason:'Record a health finding first.'});
 
 const hostGeneral=host.filter(x=>x.group==='general'&&!x.reason),hostRecords=host.filter(x=>x.group==='records'&&!x.reason),hasUnifiedNote=hostGeneral.some(x=>x.id==='marker');
 const measurements=live?[item('measurements-menu','measure','Measurements & condition',single?'Body condition, weight, temperature and backfat':'Body condition and measurements')]:[];
 const adjustFeed=live&&rows.some(p=>!feedUnavailableReason(p,penOf(c,p.id)))?[item('feed-edit-selected','feed','Adjust feed','Review the current daily allowance')]:[];
 if(live&&!adjustFeed.length)unavailable.push({title:'Adjust feed',group:'general',k:'feed',reason:feedUnavailableReason(rows[0],penOf(c,rows[0].id))+'.'});
 add('general','General',[...hostGeneral.map(x=>item('sow-host-action',x.icon||'note',x.title,x.sub,x.id)),...(!hasUnifiedNote?[item('note','note','Add a note',single?'Leave a note for this sow':'The same note for these pigs')]:[]),...hostRecords.map(x=>item('sow-host-action',x.icon||'note',x.title,x.sub,x.id)),...measurements,...adjustFeed]);
 if(!fed&&live&&single)unavailable.push({title:'Body condition adjustment',group:'general',k:'measure',reason:'Ad-lib pigs do not have an individual ration.'});
 const order=['production','health','general'];groups.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 return {groups,unavailable};
}
function sowTaskCard(c){if(picked(c).length!==1||c.selectedPens.size)return '';const tasks=currentTasksForPig(c,picked(c)[0]);if(!tasks.length)return '';const heading=stHeading({title:'Current tasks',meta:String(tasks.length),kind:'section',level:4},'<div class="sow-task-heading"><h4>Current tasks <span>'+tasks.length+'</span></h4></div>');return `<section class="sow-task-section" aria-label="Linked tasks">${heading}<div class="sow-task-rail" aria-label="Current tasks">${tasks.map(t=>button(t.action||'sow-current-task',`<span class="sow-task-card-main"><strong>${esc(t.title)}</strong>${icon('chevron')}</span><span class="sow-task-card-meta"><span class="sow-task-status">${esc(t.status)}</span><span class="sow-task-type" data-type="${esc((t.type||'General').toLowerCase())}">${esc(t.type||'General')}</span></span>`,'sow-task-card',t.value||t.id)).join('')}</div></section>`;}

function actionRows(items,disabled=false){return items.map(x=>{const row=action(x.a,x.k,x.title,x.sub,x.value);return disabled?row.replace('<button','<button disabled aria-disabled="true"'):row;}).join('');}
function productionActionGroups(c,items,disabled=false){
 const farrowingIds=new Set(['miscarriage','edit']),processingIds=new Set(['piglets','death','countReconcile','foster']);
 const taskScope=x=>['farrowing','piglet-processing','pregnancy-check','gestation','breeding','lactation','growth','other'].includes(x.section)?x.section:farrowingIds.has(x.value)?'farrowing':processingIds.has(x.value)?'piglet-processing':'other';
 const byScope=scope=>items.filter(x=>taskScope(x)===scope),farrowing=byScope('farrowing'),processing=byScope('piglet-processing'),pregnancy=byScope('pregnancy-check'),gestation=byScope('gestation'),breeding=byScope('breeding'),lactation=byScope('lactation'),growth=byScope('growth'),other=byScope('other');
 const cluster=(title,rows)=>rows.length?'<section class="production-action-cluster" aria-label="'+title+' actions">'+SentriUI.rowGroup(actionRows(rows,disabled),{title,className:'compact-actions st-action-list'})+'</section>':'';
 return '<div class="production-action-groups">'+cluster('Farrowing',farrowing)+cluster('Piglet processing',processing)+cluster('Pregnancy check',pregnancy)+cluster('Gestation',gestation)+cluster('Breeding',breeding)+cluster('Lactation',lactation)+cluster('Growth',growth)+cluster('Shared',other)+'</div>';
}
function actionSections(c,groups,disabled=false){return groups.map(g=>{const categoryIcon=icon(g.id==='production'?'chart':g.id==='health'?'condition':g.id==='feed'?'feed':'note');const heading=stHeading({title:g.label,icon:categoryIcon,kind:'section',level:4,className:'section-title st-category-heading'},'<h4 class="section-title">'+categoryIcon+g.label+'</h4>');return `<section class="sow-action-group st-action-section${disabled?' unavailable-action-group':''}" data-action-group="${g.id}" aria-label="${g.label}">${heading}${g.id==='production'&&g.items.length?productionActionGroups(c,g.items,disabled):'<div class="compact-actions st-panel st-row-group st-action-list">'+actionRows(g.items,disabled)+'</div>'}${g.empty?'<p class="action-category-empty">'+esc(g.empty)+'</p>':''}</section>`;}).join('');}
function unavailableActionGroups(c){const rows=actionCatalogue(c).unavailable;return [['production','Production'],['health','Health'],['general','General']].map(([id,label])=>({id,label,items:rows.filter(x=>(x.group||'general')===id).map(x=>({a:'unavailable-action',k:x.k||'note',title:x.title,sub:x.reason,value:'',section:x.section||''}))})).filter(g=>g.items.length);}
function actionsPage(c){
 const {groups,unavailable}=actionCatalogue(c),single=picked(c).length===1,p=single?picked(c)[0]:null;
 const body=actionSections(c,groups)+(unavailable.length?button('unavailable-actions',`Unavailable actions (${unavailable.length}) ${icon('chevron')}`,'unavailable-actions-link'):'');
 return sheet(c,'Actions',single?p.id+' · '+penOf(c,p.id).id:selectionLabel(c),body,'');
}
function actionCategoryNav(c){const batch=picked(c).length!==1||c.selectedPens.size>0,groups=actionCatalogue(c).groups.filter(g=>!batch||g.id!=='production'),current=groups.some(g=>g.id===c.actionCategory)?c.actionCategory:groups[0]?.id;return globalThis.SentriUI?.categoryFooter?globalThis.SentriUI.categoryFooter({categories:groups.map(g=>({id:g.id,label:g.label})),active:current,backAction:'back',categoryAction:'action-category',label:'Action categories',className:'record-toolbar actions-bottom-bar'}):`<footer class="sheet-footer record-toolbar actions-bottom-bar"><button type="button" class="surface-back record-back" data-action="back" aria-label="Back">${icon('back')}<span>Back</span></button><nav class="action-category-nav" aria-label="Action categories">${groups.map(g=>button('action-category',g.label,'',g.id).replace('<button',`<button aria-current="${g.id===current?'location':'false'}"`)).join('')}</nav></footer>`;}

function measurementsMenu(c){
 const rows=picked(c),single=rows.length===1,items=[];
 if(rows.every(p=>penOf(c,p.id).mode!=='adlib')||!single)items.push({a:'body',k:'condition',title:'Record body condition',sub:single?'Condition and linked care':'Record condition for selected pigs'});
 items.push({a:'weight',k:'weight',title:'Record weight',sub:single?'Weight in kg':'A separate value for each pig'});
 if(single)items.push({a:'temperature',k:'temperature',title:'Record temperature',sub:'Body temperature in °C'});
 if(rows.some(p=>['Sow','Gilt'].includes(animalType(p))))items.push({a:'backfat',k:'measure',title:'Record backfat',sub:single?'Backfat depth in mm':'Sows and gilts · separate readings'});
 return sheet(c,'Measurements & condition',single?rows[0].id:selectionLabel(c),'<div class="compact-actions st-panel st-row-group st-action-list">'+actionRows(items)+'</div>',footer(back(),''));
}

function unavailableActionsPage(c){return sheet(c,'Unavailable actions',picked(c).length===1?picked(c)[0].id+' · '+penOf(c,picked(c)[0].id).id:selectionLabel(c),actionSections(c,unavailableActionGroups(c),true),footer(back(),''));}
function miscarriagePage(c){return sheet(c,'Record miscarriage',picked(c)[0].id+' · '+penOf(c,picked(c)[0].id).id,`<div class="sow-action-warning">${icon('alert')}<p>This sow will be removed from the batch. Saved records are kept.</p></div><label class="sow-action-field">Reason<input data-loss-reason value="${esc(c.lossReason||'')}" placeholder="Enter the reason" autocomplete="off"></label>`,footer(back(),button('save-miscarriage','Save','button primary','',!c.lossReason?.trim())));}
function productionDispositionPage(c){
 const removing=c.view==='batch-removal',f=c.form||{},options=removing?[['','Choose a reason'],['assignment','Assigned to this batch in error'],['timing','Not due in this farrowing window'],['other','Other production reason']]:[['','Choose evidence'],['pregnancy-check','Pregnancy check result'],['returned-to-heat','Returned to heat'],['other','Other observation']];
 const title=removing?'Remove from batch':'Mark not in pig',copy=removing?'This removes the sow from the current farrowing batch without creating a litter or pregnancy outcome.':'This records a production outcome, removes the sow from this batch, and returns her to rebreed watch.';
 return sheet(c,title,picked(c)[0].id+' · '+penOf(c,picked(c)[0].id).id,'<div class="sow-action-warning">'+icon('alert')+'<p>'+copy+'</p></div>'+fieldSelect(c,'Reason','dispositionReason',options,f.dispositionReason||'')+'<label class="field">Note · optional<textarea data-v2="dispositionNote">'+esc(f.dispositionNote||'')+'</textarea></label>',footer(back(),button(removing?'save-batch-removal':'save-not-in-pig',removing?'Remove from batch':'Save outcome','button primary','',!f.dispositionReason)));
}
function batchMembershipPage(c){
 const f=c.form||{},p=pig(c,f.subjects?.[0]||c.pigId),current=c.batches?.find(batch=>batch.id===p?.batchId),choices=(c.batches||[]).filter(batch=>batch.id!==p?.batchId).map(batch=>[batch.id,'Batch '+batch.id+' · '+batch.stage]);
 if(current)choices.push(['__none__','Remove from batch']);
 const body='<section class="batch-membership-card facts-surface"><span>Current batch</span><strong>'+(current?'Batch '+esc(current.id):'No batch')+'</strong>'+(current?'<small>'+esc(current.stage)+' · '+current.pigIds.length+' pigs</small>':'<small>This pig is not assigned to a production batch.</small>')+'</section>'+(choices.length?fieldSelect(c,current?'Change membership':'Add to batch','batchTarget',[['','Choose a batch'],...choices],f.batchTarget||''):'<p class="detail-empty">No production batches are available.</p>')+'<label class="field">Note · optional<textarea data-v2="batchNote" placeholder="Why is this changing?">'+esc(f.batchNote||'')+'</textarea></label>';
 return sheet(c,'Batch membership',p?.id||'',body,footer(back(),button('save-batch-membership',f.batchTarget==='__none__'?'Remove from batch':current?'Move pig':'Add to batch','button primary','',!f.batchTarget)));
}
function saveBatchMembership(c){
 const f=c.form||{},p=pig(c,f.subjects?.[0]),target=f.batchTarget;if(!p||!target)return false;
 const old=c.batches?.find(batch=>batch.id===p.batchId);if(old)old.pigIds=old.pigIds.filter(id=>id!==p.id);
 if(target==='__none__')p.batchId='';
 else {const next=c.batches?.find(batch=>batch.id===target);if(!next)return false;next.pigIds=[...new Set([...next.pigIds,p.id])];p.batchId=next.id;p.stage=next.stage;}
 addEvent(c,'Batch membership changed',[p.id],(old?'Batch '+old.id:'No batch')+' → '+(target==='__none__'?'No batch':'Batch '+target)+(f.batchNote?.trim()?' · '+f.batchNote.trim():''),'Production');
 c.pigId=p.id;c.selected.clear();c.navTrail=[];c.form={};c.view='pig';return true;
}
function saveMiscarriage(c){
 const p=picked(c)[0],reason=String(c.lossReason||'').trim();if(!p||!reason)return false;
 const batch=c.batches?.find(batch=>batch.id===p.batchId);if(batch)batch.pigIds=batch.pigIds.filter(id=>id!==p.id);
 p.batchId='';p.stage='Off production';p.breedingStatus='Open';addEvent(c,'Miscarriage recorded',[p.id],reason,'Production');
 c.pigId=p.id;c.selected.clear();c.navTrail=[];c.lossReason='';c.form={};c.view='pig';return true;
}
function transferReady(c){const d=c.transferDraft||{},p=picked(c)[0],pe=p&&penOf(c,p.id);return !!d.unit&&!!d.pen&&c.transferDestinations?.some(u=>u.id===d.unit&&u.pens.includes(d.pen))&&!(d.unit===c.transferOrigin?.unit&&d.pen===pe?.id);}
function transferPage(c){const p=picked(c)[0],d=c.transferDraft||{},units=c.transferDestinations||[],pens=units.find(u=>u.id===d.unit)?.pens||[];return sheet(c,'Transfer sow',p.id+' · '+penOf(c,p.id).id,`<div class="transfer-origin"><span>From</span><strong>${esc(c.transferOrigin?.name||'')} · ${esc(penOf(c,p.id).id)}</strong></div>${fieldSelect(c,'Destination unit','unit',[['','Choose unit'],...units.map(u=>[u.id,u.name])],d.unit||'','transfer')}${fieldSelect(c,'Destination pen','pen',[['','Choose pen'],...pens.filter(pen=>!(d.unit===c.transferOrigin?.unit&&pen===penOf(c,p.id).id)).map(pen=>[pen,pen])],d.pen||'','transfer',!d.unit)}`,footer(back(),button('save-transfer','Transfer sow','button primary','',!transferReady(c))));}
function updateActionCategory(root,c){
 const body=root.querySelector('.actions-sheet .sheet-body');if(!body)return;const categories=new Set([...root.querySelectorAll('[data-action="action-category"]')].map(b=>b.dataset.value)),groups=[...body.querySelectorAll('[data-action-group]')].filter(g=>categories.has(g.dataset.actionGroup));if(!groups.length)return;
 const edge=body.getBoundingClientRect().top+12;let current=groups.filter(g=>g.getBoundingClientRect().top<=edge).at(-1)||groups[0];if(body.scrollTop>0&&body.scrollTop+body.clientHeight>=body.scrollHeight-2)current=groups.at(-1);
 const jump=c.actionCategoryJump;if(jump&&Math.abs(body.scrollTop-jump.scrollTop)<2){current=groups.find(g=>g.dataset.actionGroup===jump.id)||current;}else delete c.actionCategoryJump;
 c.actionCategory=current.dataset.actionGroup;c.actionMenuScroll=body.scrollTop;
 root.querySelectorAll('[data-action="action-category"]').forEach(b=>b.setAttribute('aria-current',b.dataset.value===c.actionCategory?'location':'false'));
 const nav=root.querySelector('.action-category-nav'),active=nav?.querySelector('[aria-current="location"]');if(active){const n=nav.getBoundingClientRect(),b=active.getBoundingClientRect();if(b.left<n.left+16)nav.scrollLeft-=n.left+16-b.left;else if(b.right>n.right-16)nav.scrollLeft+=b.right-(n.right-16);}
}
function overlay(c){if(c.logDatePicker)return '<div class="drawer-background" inert aria-hidden="true">'+overlay({...c,logDatePicker:false})+'</div>'+logDatePicker(c);if(['record-optional','feed-date','feed-note','medicine-picker','bulk-health-picker','picker'].includes(c.view)&&!c.isDrawerBackground){const parent={...c,view:c.view==='picker'?c.form.pickerReturn:c.view==='record-optional'?c.form.optionalReturn:c.view==='medicine-picker'?'treatment':c.view==='bulk-health-picker'?'health':'feed-editor',isDrawerBackground:true};return '<div class="drawer-background" inert aria-hidden="true">'+overlay(parent)+'</div>'+overlay({...c,isDrawerBackground:true});}if(c.view==='medicine-picker')return medicinePicker(c);if(c.view==='picker')return pickerPage(c);if(c.view==='record-optional')return recordOptionalEditor(c);if(c.form?.recordEditor&&bulkActionKinds.includes(c.view))return bulkActionPage(c);if(c.view==='bulk-health-picker')return bulkHealthPicker(c);if(c.view==='sow-transfer')return transferPage(c);if(c.view==='unavailable-actions')return unavailableActionsPage(c);if(c.view==='measurements-menu')return measurementsMenu(c);if(c.view==='miscarriage')return miscarriagePage(c);if(c.view==='production-task')return productionTaskPage(c);if(c.view==='batch-membership')return batchMembershipPage(c);if(['batch-removal','not-in-pig'].includes(c.view))return productionDispositionPage(c);if(c.view==='feed-date'||c.view==='feed-note')return feedOptionalEditor(c);if(c.view==='feed-breakdown')return feedBreakdown(c);if(c.view==='pig-production-batch')return productionBatchPage(c);if(c.view==='feed-editor')return feedEditor(c);const recordView=recordFlowOverlay(c);if(recordView!==null)return recordView;const revised=round3Overlay(c);if(revised!==null)return revised;const f=c.form;
 if(c.view==='actions')return actionsPage(c);
 if(c.view==='treatment')return sheet(c,f.taskId==='vaccination'?'Record vaccination':'Record treatment',f.returnFinding?c.pigId+' · '+f.returnFinding:scope(c),`<label class="field">${f.taskId==='vaccination'?'Vaccine':'Medicine'}<input data-v2="medicine" value="${esc(f.medicine||'')}" placeholder="${f.taskId==='vaccination'?'Vaccine administered':'Medicine administered'}"></label><label class="field">Brand / formulation · optional<input data-v2="brand" value="${esc(f.brand||'')}"></label>${fieldSelect(c,'Method','method',[['','Choose method'],['Injection','Injection'],['Oral','Oral'],['Topical','Topical'],['In feed','In feed'],['In water','In water']],f.method||'')}<div class="plan-meta"><label class="field">Dose per pig<input type="number" min="0" step="any" data-v2="dose" value="${esc(f.dose||'')}"></label>${fieldSelect(c,'Unit','doseUnit',[['','Choose unit'],['mL','mL'],['mg','mg'],['g','g']],f.doseUnit||'')}</div>${f.taskId==='vaccination'?'':f.returnFinding?'<div class="detail-line"><span>For this finding</span><strong>'+esc(f.returnFinding)+'</strong></div>':fieldSelect(c,'Target condition · optional','target',[['','No linked condition'],...[...new Set(f.subjects.flatMap(id=>cases(pig(c,id)).map(k=>k.name)))].map(n=>[n,n])],f.target||'')}<p class="quiet-note">${f.taskId==='vaccination'?'Record the vaccination administered for this task.':'Records the treatment already administered to these pigs. A target links only to pigs carrying that condition.'}</p>`,footer(back(),button('save-treatment',f.taskId?'Save and complete task':`Record · ${countLabel(f.subjects.length)}`,'button primary','',!valid(c))));
 if(c.view==='health')return healthForm(c);
 if(c.view==='body'||c.view==='individual-plan')return bodyForm(c);
 if(c.view==='filters'){const d=c.filterDraft;return sheet(c,'Filter pigs',unitName(c),`${fieldSelect(c,'Production stage','stage',[['All','All production stages'],...stageList(c).map(s=>[s,s])],d.stage,'filter')}${fieldSelect(c,'Disease or symptom','healthFilter',[['All','Any condition'],...[...new Set(pigs(c).flatMap(p=>cases(p).map(k=>k.name)))].map(k=>[k,k])],d.healthFilter,'filter')}${fieldSelect(c,'Care','triageFilter',[['All','Any care'],...careOptions],d.triageFilter,'filter')}`,footer(button('filter-reset','Reset','button secondary'),button('filter-apply','Show pigs','button primary')));}
 if(c.view==='unit-detail')return sheet(c,unitName(c),'Environment & equipment',unitEnvironment(c)+unitEquipment(c),footer(back(),''));
 if(c.view==='equipment')return sheet(c,'Equipment faults',unitName(c),unitEquipment(c),footer(back(),''));
 if(c.view==='pen-detail')return penOverview(c);
 if(c.view==='pen-log')return sheet(c,'Pen log','Pen '+c.penId+' · '+unitName(c),categorizedLog(c,penLogEntries(c,c.penId),'pen'),footer(back(),''));
 if(c.view==='pen-faults'){const pe=pen(c,c.penId),faults=openFaults(pe);return sheet(c,'Equipment faults','Pen '+pe.id+' · '+faults.length+' open',faults.length?'<div class="compact-actions st-panel st-row-group st-action-list">'+faults.map(x=>action('fault-record','wrench',x.name,x.description,pe.id+'|'+x.id)).join('')+'</div>':'<p class="detail-empty">No open faults</p>',footer(back(),button('new-fault','Report fault','button primary',pe.id)));}
 if(c.view==='fault-form')return sheet(c,'Report fault','Pen '+c.penId,`${fieldSelect(c,'Device','device',[['','Choose device'],['Feeding station','Feeding station'],['Drinking station','Drinking station'],['Other','Other equipment']],f.device)}${f.device==='Other'?`<label class="field">Device name<input data-v2="name" value="${esc(f.name||'')}" placeholder="e.g. gate beside the aisle"></label>`:''}<label class="field">Description<textarea data-v2="description" placeholder="What is broken or not working?">${esc(f.description||'')}</textarea></label>`,footer(back(),button('save-fault','Report fault','button primary','',!valid(c))));
 if(c.view==='fault-record'){const pe=pen(c,c.penId),x=pe.faults.find(x=>x.id===c.faultId);return sheet(c,x.name,`Pen ${pe.id} · ${x.open?'Open fault':'Resolved'}`,`<div class="instruction-detail">${esc(x.description)}<small>Reported ${x.time} · ${x.who}</small></div>${x.open?'<label class="field">Resolution note · optional<textarea data-v2="resolution" placeholder="What was done?"></textarea></label>':`<p class="quiet-note">Resolved 09:41 · G. Hansen${x.resolution?'<br>'+esc(x.resolution):''}</p>`}`,footer(back(),x.open?button('close-fault','Resolve fault','button primary'):''));}
 if(c.view==='pen-note')return sheet(c,'Pen note','Pen '+c.penId,`<label class="field">Note<textarea data-v2="note">${esc(f.note||'')}</textarea></label>`,footer(back(),button('save-pen-note','Save note','button primary','',!valid(c))));
 if(c.view==='resolve'){const rows=f.subjects.flatMap(id=>cases(pig(c,id)).map(k=>({id,k})));return sheet(c,'Resolve conditions',scope(c),rows.map(({id,k})=>{const key=id+'|'+k.name,entry=pickerEntry(c,key,{items:[['','Keep open'],['recover','Recovered'],['strike','Entered in error']],label:'Outcome for '+k.name+' on '+id,target:'verdict',value:f.verdicts[key]||''});return `<div class="resolve-case"><div><strong>${id}</strong><span>${esc(k.name)} · day ${k.day}</span>${k.feedLinked?'<small>Recovery ends this case’s feed adjustment</small>':''}</div>${pickerTriggerButton(entry,key,'','Outcome for '+k.name+' on '+id)}</div>`;}).join('')+`<p class="quiet-note">Recovery keeps the case in history. Entered in error marks it as a correction.</p>`,footer(back(),button('save-resolve','Save outcomes','button primary','',!Object.values(f.verdicts).some(Boolean))));}
 if(c.view==='triage')return sheet(c,'Care instructions',scope(c),`${fieldSelect(c,'Care instruction','triage',careOptions,f.triage)}<p class="quiet-note">Care determines which conditions need attention. ${f.subjects.filter(id=>!cases(pig(c,id)).length).length} selected pigs have no open case and will stay unchanged.</p>`,footer(back(),button('save-triage','Save instructions','button primary')));
 if(c.view==='temperature'||c.view==='backfat')return sheet(c,c.view==='temperature'?'Record temperature':'Record backfat',scope(c),`<label class="field">${c.view==='temperature'?'Temperature · °C':'Backfat · mm'}<input type="number" inputmode="decimal" step="0.1" data-v2="measurement" value="${esc(f.measurement||'')}"></label>`,footer(back(),button('save-measurement','Save reading','button primary','',!valid(c))));
 if(c.view==='pig')return pigOverview(c);
 
 if(c.view==='feed'){const pe=pen(c,c.penId);return sheet(c,'Pen feeding','Pen '+pe.id+' · '+countLabel(pe.pigs.length),feedBody(c,pe),footer(back(),button('feed-edit-pen',icon('feed')+'Adjust feed','button primary',pe.id)));}
 return legacyOverlay(c);}
function valid(c){const f=c.form;if(c.view==='treatment')return !!f.medicine?.trim()&&!!f.method&&Number.isFinite(+f.dose)&&+f.dose>0&&!!f.doseUnit;if(c.view==='fault-form')return !!f.device&&!!f.description?.trim()&&(f.device!=='Other'||!!f.name?.trim());if(c.view==='pen-note'||c.view==='selected-pen-note')return !!f.note?.trim();if(c.view==='temperature'||c.view==='backfat')return Number.isFinite(+f.measurement)&&+f.measurement>0;return legacyValid(c);}
function installV2(){
 installBulkInputs();
 gallery.addEventListener('input',e=>{
 const el=e.target;if(el.hasAttribute('data-feed-optional-input')){const root=el.closest('[data-card]'),c=states[+root.dataset.card];e.stopImmediatePropagation();c.form.optionalDraft=el.value;root.querySelector('[data-action="feed-optional-save"]').disabled=!optionalEditorChanged(c);return;}const key=el.dataset.feedEdit;if(!key)return;const root=el.closest('[data-card]'),i=+root.dataset.card,c=states[i];e.stopImmediatePropagation();updateFeedInput(c,key,el.value);
 if(key==='feedingState'){render(i);return;}
 if(key==='percent'){
  root.querySelectorAll('[data-feed-edit="percent"]').forEach(input=>{if(input!==el)input.value=Number.isFinite(+c.form.percent)?Number((+c.form.percent).toFixed(2)):'';});
  const state=root.querySelector('[data-feed-edit="feedingState"]');if(state)state.value='adjust';
 }
 root.querySelector('[data-feed-pigs]').innerHTML=feedPigPreview(c);root.querySelector('[data-action="feed-edit-save"]').disabled=!feedEditorValid(c);
 const hint=root.querySelector('[data-feed-input-hint]');hint.textContent=c.form.mode==='adjust'&&(!Number.isFinite(+c.form.percent)||+c.form.percent < -50.000001||+c.form.percent > 50.000001)?'Choose −50% to +50%.':c.form.mode==='stop'?'No feed · 0.0 kg/day':feedEditorHeld(c)?'Daily amounts stay fixed':'Replaces existing adjustments';
 },true);
paths.humidity='M12 3C9 8 5 12 5 16a7 7 0 0 0 14 0c0-4-4-8-7-13z';paths.air='M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6';paths.wrench='M14 3a6 6 0 0 0-7 7L2 17a3 3 0 0 0 5 5l7-7a6 6 0 0 0 7-7l-4 4-5-5z';paths.temperature='M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0M12 9v9';paths.measure='M3 5h18v14H3zM7 5v5M11 5v3M15 5v5';
 gallery.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const i=+el.closest('[data-card]').dataset.card,c=states[i],a=el.dataset.action,v=el.dataset.value,fromMeasurements=c.view==='measurements-menu';let handled=true;
 if(handleRecordAction(c,a,v)){if(fromMeasurements)c.measurementsReturn=true;}
 else if(a==='open-picker'){c.form.pickerKey=el.dataset.pickerKey;c.form.pickerReturn=c.view;c.view='picker';}
 else if(a==='picker-select'){if(!pickerCommit(c,v))c.view=c.form.pickerReturn||'list';delete c.form.pickerKey;delete c.form.pickerReturn;}
 else if(a==='batch-page'){c.batchPreview=+v;}
 else if(a==='action-scope'){c.actionScope=v;c.restoreSheetScroll=0;}
 else if(a==='selected-fault'){c.form={faultPenIds:[...c.selectedPens]};if(c.selectedPens.size===1){c.penId=[...c.selectedPens][0];c.form={device:'',description:'',name:''};c.view='fault-form';}else c.view='choose-fault-pen';}
 else if(a==='selected-pen-note'){c.form={note:''};c.view='selected-pen-note';}
 else if(a==='save-selected-note'&&c.form.note?.trim()){const ids=[...c.selectedPens];ids.forEach(id=>{pen(c,id).note=c.form.note.trim();pen(c,id).noteBy='G. Hansen · today · 09:41';});addEvent(c,'Pen note',ids,c.form.note.trim());c.selected.clear();c.selectedPens.clear();c.reviewOnly=false;c.view='list';}
 else if(a==='batch-detail'){c.batchId=v;c.view='batch-detail';}
 else if(a==='show-batch'){c.batchFilter=v;c.stage='All';c.healthFilter='All';c.healthStatus='All';c.manualOnly=false;c.triageFilter='All';c.lens='All';c.scroll=0;c.view='list';}
 else if(a==='environment')c.view='environment';
 else if(a==='back'&&['selected-pen-note','choose-fault-pen'].includes(c.view))c.view='actions';
 else if(a==='stage'){c.stage=c.stage===v?'All':v;c.scroll=0;}
 else if(a==='scope-stage'){c.stage=v;c.scroll=0;c.view='list';}
 else if(a==='reset-filters'){Object.assign(c,{batchFilter:'All',stage:'All',healthFilter:'All',healthStatus:'All',manualOnly:false,triageFilter:'All',lens:'All',reviewOnly:false,scroll:0});}
 else if(a==='filters'){c.filterDraft={stage:c.stage,healthFilter:c.healthFilter,healthStatus:c.healthStatus,manualOnly:c.manualOnly,triageFilter:c.triageFilter};c.view='filters';}
 else if(a==='filter-reset'){c.filterDraft={stage:'All',healthFilter:'All',healthStatus:'All',manualOnly:false,triageFilter:'All'};}
 else if(a==='filter-apply'){Object.assign(c,c.filterDraft);c.reviewOnly=false;c.view='list';c.scroll=0;}
 else if(a==='unit-detail'||a==='equipment'){c.view=a;}
 else if(['pen-detail','pen-faults','pen-log'].includes(a)){c.penId=v;c.view=a;if(a==='pen-log'){c.penLogFilter='All';c.penLogDate={preset:'all'};}}
 else if(a==='new-fault'){c.penId=v;c.form={device:'',name:'',description:''};c.view='fault-form';}
 else if(a==='fault-record'){[c.penId,c.faultId]=v.split('|');c.form={resolution:''};c.view='fault-record';}
 else if(a==='save-fault'&&valid(c)){const pe=pen(c,c.penId),f=c.form,existing=pe.faults.find(x=>x.open&&x.device===f.device&&f.device!=='Other');if(existing){c.faultId=existing.id;c.view='fault-record';}else{const x={id:'fault-'+Date.now(),device:f.device,name:f.device==='Other'?f.name.trim():f.device,description:f.description.trim(),time:'09:41',who:'G. Hansen',open:true};pe.faults.push(x);addEvent(c,'Fault reported',[pe.id],x.name+' · '+x.description);returnFromFault(c);}}
 else if(a==='close-fault'){const pe=pen(c,c.penId),x=pe.faults.find(x=>x.id===c.faultId);x.open=false;x.resolution=c.form.resolution||'';addEvent(c,'Fault resolved',[pe.id],x.name+' · '+x.resolution);returnFromFault(c);}
 else if(a==='read-pen-note'){c.penId=v;c.closedNoteId=null;c.view='read-pen-note';}
 else if(a==='close-pen-note'){closePenNote(c,c.penId);}
 else if(a==='undo-close-pen-note'){undoPenNoteClose(c,c.penId);}
 else if(a==='pen-note'){c.penId=v;c.form={note:pen(c,v).note};c.view='pen-note';}
 else if(a==='save-pen-note'&&valid(c)){pen(c,c.penId).note=c.form.note.trim();pen(c,c.penId).noteBy='G. Hansen · today · 09:41';addEvent(c,'Pen note',[c.penId],c.form.note.trim());c.view=c.navTrail?.at(-1)?.view==='read-pen-note'?'read-pen-note':'pen-detail';}
 else if(a==='pig-profile'){c.pigId=v;c.profileTab='details';c.pigLogFilter='All';c.view='pig-profile';}
 else if(a==='pig-actions'){c.selected=new Set([v]);c.selectedPens.clear();c.actionScope='pigs';c.form={};c.view='actions';}
 else if(a==='measurements-menu'){c.view='measurements-menu';}
 else if(['health','body','individual-plan','resolve','triage','temperature','backfat','treatment'].includes(a)){const ids=[...c.selected];if((a==='individual-plan'||a==='temperature'||a==='backfat')&&ids.length!==1)return;c.form={subjects:ids,conditions:[],conditionKinds:{},customConditions:{...(c.customHealthCatalog||{})},kind:'Symptom',search:'',catalogSection:'',catalogGroup:'',triage:'None',issueStatus:'attention',band:'',start:'2026-09-12',end:'',verdicts:{}};c.view=a;if(fromMeasurements)c.measurementsReturn=true;}
 else if(a==='health-kind'){delete c.form.customDraft;Object.assign(c.form,{kind:v,search:'',catalogSection:'',catalogGroup:''});}
 else if(a==='save-treatment'&&valid(c)){const f=c.form;f.subjects.forEach(id=>{const p=pig(c,id);p[f.taskId==='vaccination'?'vaccination':'treatment']={medicine:f.medicine,dose:+f.dose,unit:f.doseUnit,method:f.method,target:cases(p).some(k=>k.name===f.target)?f.target:null};p.last=f.taskId==='vaccination'?'Vaccinated just now':'Treated just now';});addEvent(c,f.taskId==='vaccination'?'Vaccination recorded':'Treatment recorded',f.subjects,f.medicine+(f.brand?' · '+f.brand:'')+' · '+f.dose+' '+f.doseUnit+' per pig · '+f.method+(f.target?' · target '+f.target:''));if(f.taskId){completeCurrentTask(c,f.taskId,f.subjects);notify(c,'Task completed');}if(f.returnFinding){c.findingName=f.returnFinding;c.view='finding';notify(c,'Treatment recorded for '+c.pigId);}else{c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';}}
 else if(a==='save-health'){saveHealth(c);}
 else if(a==='save-body'){const direct=c.form.returnPigFeed,sel=[...c.selected],pens=[...c.selectedPens];if(saveBody(c)&&direct){c.selected=new Set(sel);c.selectedPens=new Set(pens);c.view='pig-feed';c.feedTab='plan';}}
 else if(a==='save-triage'){const ids=c.form.subjects.filter(id=>cases(pig(c,id)).length);ids.forEach(id=>cases(pig(c,id)).forEach(k=>k.triage=c.form.triage));addEvent(c,'Triage updated',ids,c.form.triage);c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';}
 else if(a==='save-resolve'){for(const [key,outcome] of Object.entries(c.form.verdicts)){if(!outcome)continue;const [id,name]=key.split('|'),p=pig(c,id),k=cases(p).find(x=>x.name===name);if(!k)continue;(p.closedCases||=[]).push({...k,outcome,closedAt:'09:41',closedBy:'G. Hansen'});p.cases=p.cases.filter(x=>x!==k);if(k.feedLinked){p.factor=1;p.adjustmentActive=false;p.band='standard';p.ends=undefined;}addEvent(c,outcome==='recover'?'Recovered':'Record corrected',[id],name);}c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';}
 else if(a==='save-measurement'&&valid(c)){const id=c.form.subjects[0];pig(c,id)[c.view]=+c.form.measurement;(pig(c,id).measurementDates||={})[c.view]=walkDate;addEvent(c,c.view==='temperature'?'Temperature':'Backfat',[id],c.form.measurement+(c.view==='temperature'?' °C':' mm'));c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';}
 else if(a==='switch-feed')c.view='switch-feed';
 else if(a==='back'&&c.view==='measurements-menu'){c.view='actions';}
 else if(a==='back'&&['health','body','individual-plan','resolve','triage','temperature','backfat'].includes(c.view)){c.form={};c.view=c.measurementsReturn?'measurements-menu':'actions';delete c.measurementsReturn;}
 else if(a==='back'&&['fault-form','fault-record','pen-note'].includes(c.view))c.view='pen-detail';
 else if(a==='back'&&c.view==='switch-feed')c.view='feed';
 else handled=false;
 if(handled){e.stopImmediatePropagation();render(i,{a,v});}
 },true);
 gallery.addEventListener('change',e=>{const el=e.target,root=el.closest('[data-card]');if(!root)return;const i=+root.dataset.card,c=states[i];if(el.dataset.logDateField){c.logDateDraft[el.dataset.logDateField]=el.value;e.stopImmediatePropagation();render(i);return;}if(el.dataset.logCategory){handleRecordAction(c,'log-filter',el.dataset.logCategory+'|'+el.value);e.stopImmediatePropagation();render(i);return;}if(el.dataset.condition){const key=el.dataset.condition;c.form.conditionKinds||={};if(el.checked)c.form.conditionKinds[key]=el.dataset.conditionKind||c.form.kind;else delete c.form.conditionKinds[key];c.form.conditions=el.checked?[...c.form.conditions,key]:c.form.conditions.filter(x=>x!==key);e.stopImmediatePropagation();render(i);return;}if(el.dataset.verdict){c.form.verdicts[el.dataset.verdict]=el.value;e.stopImmediatePropagation();render(i);return;}if(el.dataset.v2){const f=c.view==='filters'?c.filterDraft:c.form;f[el.dataset.v2]=el.type==='checkbox'?el.checked:el.value;if(c.view==='fault-form'&&el.dataset.v2==='device'&&el.value!=='Other'){const x=pen(c,c.penId).faults.find(x=>x.open&&x.device===el.value);if(x){c.faultId=x.id;c.form={};c.view='fault-record';}}e.stopImmediatePropagation();if(el.tagName==='SELECT'||el.type==='checkbox')render(i);}
 },true);
 gallery.addEventListener('input',e=>{const el=e.target;if(!el.dataset.v2)return;const i=+el.closest('[data-card]').dataset.card,c=states[i],f=c.view==='filters'?c.filterDraft:c.form;f[el.dataset.v2]=el.value;if(el.dataset.v2==='search'){el.closest('.sheet').querySelector('.health-catalog').innerHTML=healthList(c);return;}const save=el.closest('.sheet').querySelector('[data-action="save-fault"],[data-action="save-pen-note"],[data-action="save-measurement"],[data-action="save-treatment"],[data-action="save-selected-note"]');if(save)save.disabled=!valid(c);},true);
}

function scopeTabs(c){return `<div class="scope-tabs" role="tablist" aria-label="Action subject">${[['pigs','Pigs',c.selected.size],['pens','Pen'+(c.selectedPens.size===1?'':'s'),c.selectedPens.size]].map(([v,t,n])=>button('action-scope',`<span>${t}</span><strong>${n}</strong>`,'',v,!n).replace('<button',`<button role="tab" aria-selected="${c.actionScope===v}"`)).join('')}</div>`;}
function selectionLabel(c){return [c.selectedPens.size?c.selectedPens.size+' '+(c.selectedPens.size===1?'pen':'pens'):'',c.selected.size?countLabel(c.selected.size):''].filter(Boolean).join(' · ');}
function round3Overlay(c){const pe=pen(c,c.penId);
 if(c.view==='read-pen-note'){
  const closed=pe.closedNotes?.find(n=>n.id===c.closedNoteId&&!n.reopenedAt);
  const text=closed?closed.text:pe.note,author=closed?closed.by:pe.noteBy;
  return sheet(c,'Pen note','Pen '+pe.id,(closed?'<p class="note-closed-status">'+icon('check')+'Closed · Kept in pen log</p>':'')+'<p class="pen-note-body">'+esc(text)+'</p><div class="pen-note-meta"><p class="quiet-note">'+esc(author)+'</p>'+(!closed&&pe.note?button('pen-note','Edit note','text-button',pe.id):'')+'</div>'+(closed?'<p class="quiet-note">Closed '+esc(closed.closedAt)+' · '+esc(closed.closedBy)+'</p>':''),footer(back(),closed?button('undo-close-pen-note','Undo close','button primary','',!!pe.note):pe.note?button('close-pen-note','Close note','button primary'):''));
 }

 if(c.view==='actions'&&c.actionScope==='pens'&&c.selectedPens.size)return sheet(c,'Actions',selectionLabel(c),`<div class="compact-actions st-panel st-row-group st-action-list">${action('selected-pen-note','note','Pen note','A note attached to the selected pens')}${action('feed-edit-selected','feed','Feed','Adjust daily feed for these pigs')}</div>`,footer(back(),''));
 if(c.view==='choose-fault-pen')return sheet(c,'Report equipment fault','Choose one pen',`<p class="quiet-note">A fault belongs to one device in one pen.</p><div class="compact-actions st-panel st-row-group st-action-list">${(c.form.faultPenIds||[...c.selectedPens]).map(id=>action('new-fault','grid','Pen '+id,countLabel(pen(c,id).pigs.length),id)).join('')}</div>`,footer(back(),''));
 if(c.view==='selected-pen-note')return sheet(c,'Pen note',[...c.selectedPens].join(' · '),`<label class="field">Note<textarea data-v2="note">${esc(c.form.note||'')}</textarea></label>`,footer(back(),button('save-selected-note',`Save to ${c.selectedPens.size} ${c.selectedPens.size===1?'pen':'pens'}`,'button primary','',!c.form.note?.trim())));
 if(c.view==='batch-detail'){const b=c.batches.find(b=>b.id===c.batchId);return sheet(c,'Batch '+b.id,`${b.stage} · ${b.pigIds.length} pigs · ${unitName(c)}`,`<section class="detail-section"><h4>Batch tracker</h4><div class="batch-tracker-tasks batch-tracker-detail">${batchTrackerContent(c,b)}</div></section><div class="detail-line"><span>Pens</span><strong>${b.pens.join(' · ')}</strong></div>`,footer(back(),button('show-batch','Show pigs in this batch','button primary',b.id)));}
 if(c.view==='environment')return sheet(c,'Environment',unitName(c),environmentBody(c),footer(back(),''));
 return null;
}

// Dedicated reading destinations and case-scoped actions. All data remains in this study.
function recordLog(events,empty){return events.length?'<div class="record-timeline">'+events.map(e=>'<article><strong>'+esc(e.title)+'</strong>'+(e.note?'<p>'+esc(e.note)+'</p>':'')+'<small>'+esc(e.time)+' · '+esc(e.who)+'</small></article>').join('')+'</div>':'<p class="detail-empty">'+empty+'</p>';}
function hasRecordValue(value){return value!==null&&value!==undefined&&value!=='';}
function recordValue(value,unit=''){return hasRecordValue(value)?esc(value)+(unit?(unit==='%'?'':' ')+unit:''):'—';}
function profileFacts(title,items){
 const empty=items.every(([,value])=>!hasRecordValue(value));const symbol={'Basic information':'profile','Sow & cycle':'clock','Body & cycle':'weight','Production totals & averages':'chart','Origin & dates':'origin','Identity records':'profile'}[title];
 const heading=stHeading({title,icon:symbol?icon(symbol):'',kind:'section',level:4},'<h4 class="section-title">'+(symbol?icon(symbol):'')+title+'</h4>');
 return '<section class="profile-section'+(empty?' is-empty':'')+'">'+heading+'<dl class="profile-facts facts-surface st-panel">'+items.map(([label,value,unit])=>'<div'+(!hasRecordValue(value)?' class="is-empty"':'')+'><dt>'+label+'</dt><dd>'+recordValue(value,unit)+'</dd></div>').join('')+'</dl></section>';
}
function filterLogEntries(events,category){return category==='All'?events:events.filter(e=>eventCategory(e)===category);}
function pigLogEntries(c){const p=pig(c,c.pigId);return [...c.events.filter(e=>e.subjects.includes(p.id)).map(e=>({...e,time:'Today · '+e.time})),...(p.initialRecords||[])];}
const logDatePresets=[['all','All dates'],['today','Today'],['7','Last 7 days'],['30','Last 30 days'],['custom','Custom range']];
// Legacy sample records carry display dates; keep unknown dates unknown.
function logEntryDate(e){
 const raw=e.recordedAt||e.date||e.time||'',iso=raw.match(/^(\d{4}-\d{2}-\d{2})(?:T|\s+)?(\d{2}:\d{2})?/),clock=raw.match(/\b([01]\d|2[0-3]):[0-5]\d\b/);
 let date=iso?.[1];
 if(!date&&/\b(today|yesterday)\b/i.test(raw)){const d=new Date(walkDate+'T12:00:00Z');if(/yesterday/i.test(raw))d.setUTCDate(d.getUTCDate()-1);date=d.toISOString().slice(0,10);}
 if(!date){const match=raw.match(/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?: (\d{4}))?\b/i);if(match){const month=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[2].toLowerCase())+1;date=(match[3]||walkDate.slice(0,4))+'-'+String(month).padStart(2,'0')+'-'+match[1].padStart(2,'0');}}
 return date?{date,time:iso?.[2]||clock?.[0]||''}:null;
}
function logDateBounds(filter={preset:'all'}){
 if(filter.preset==='all')return null;
 if(filter.preset==='custom')return {start:filter.start,end:filter.end};
 const start=new Date(walkDate+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-(filter.preset==='today'?0:Number(filter.preset)-1));
 return {start:start.toISOString().slice(0,10),end:walkDate};
}
function visibleLogEntries(c,events,scope){
 const range=logDateBounds(c[scope+'LogDate']),category=c[scope+'LogFilter']||'All';
 return filterLogEntries(events,category).filter(e=>{
  if(!range)return true;const value=logEntryDate(e);if(!value||value.date<range.start||value.date>range.end)return false;
  return true;
 }).sort((a,b)=>{const key=e=>{const d=logEntryDate(e);return d?d.date+'T'+(d.time||'00:00'):'';};return key(b).localeCompare(key(a));});
}
function logDateLabel(filter){
 if(!filter||filter.preset!=='custom')return logDatePresets.find(([key])=>key===(filter?.preset||'all'))[1];
 const format=date=>new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',...(date.slice(0,4)!==walkDate.slice(0,4)?{year:'numeric'}:{})});
 return format(filter.start)+(filter.start===filter.end?'':'–'+format(filter.end));
}
function logDateDraftError(d){
 if(d.preset!=='custom')return '';
 if(!d.start||!d.end)return 'Choose a start and end date.';
 if(d.start>d.end)return 'End date must be on or after start date.';
 return '';
}
function logDisplayStamp(e,stamp){
 if(stamp){
  return {label:new Date(stamp.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),time:stamp.time||''};
 }
 const raw=String(e.time||'').trim(),match=raw.match(/^(.+?)\s*·\s*((?:[01]\d|2[0-3]):[0-5]\d)$/);
 return {label:(match?match[1]:raw)||'Date unknown',time:match?.[2]||''};
}
function logDatePicker(c){
 const d=c.logDateDraft,field=(label,key,type,value)=>'<label class="field">'+label+'<input type="'+type+'" data-log-date-field="'+key+'" value="'+esc(value||'')+'"></label>',custom=d.preset==='custom',error=logDateDraftError(d);
 return sheet({...c,view:'log-date-picker'},'Date range',c.view==='pig-log'?'Pig log':'Pen log','<div class="log-date-options" role="group" aria-label="Date range">'+logDatePresets.map(([key,label])=>button('log-date-preset','<span>'+label+'</span>'+icon('check'),'log-date-option',key).replace('<button','<button aria-pressed="'+(d.preset===key)+'"')).join('')+'</div>'+(custom?'<div class="log-range-fields">'+field('Start date','start','date',d.start)+field('End date','end','date',d.end)+'</div>'+(error?'<p class="log-range-error" role="status">'+error+'</p>':''):'') ,footer(button('log-date-cancel','Cancel','button secondary'),button('log-date-apply','Apply','button primary','',!!error)));
}
function logFilterBar(c,events,scope){
 const current=c[scope+'LogFilter']||'All',types=['All',...logTypes.filter(t=>scope==='pen'||t!=='Equipment')];
 const date=c[scope+'LogDate'],count=visibleLogEntries(c,events,scope).length,filtered=current!=='All'||(date&&date.preset!=='all');
 const entry=pickerEntry(c,'log-category',{items:types.map(t=>[t,t==='All'?'All activity':t]),label:'Filter '+scope+' log',target:'log',scope,value:current});
 return '<div class="sheet-filterbar log-filterbar"><div class="log-filter-controls"><span class="log-category-select">'+pickerTriggerButton(entry,'log-category','log-category-trigger','Filter '+scope+' log')+icon('chevron')+'</span>'+button('log-date-open','<span>'+esc(logDateLabel(date))+'</span>'+icon('chevron'),'log-date-trigger',scope).replace('<button','<button aria-haspopup="dialog"')+'</div><div class="log-results"><span role="status">'+count+' '+(count===1?'entry':'entries')+' · Newest first</span>'+(filtered?button('log-clear','Clear','text-button',scope):'')+'</div></div>';
}
function categorizedLog(c,events,scope){
 const visible=visibleLogEntries(c,events,scope);
 const fallback=visible.length?'<div class="record-timeline categorized-timeline facts-surface">'+visible.map(e=>{const stamp=logEntryDate(e),display=logDisplayStamp(e,stamp),label=display.label+(display.time?' · '+display.time:'');return '<article><div class="log-entry-heading"><span class="log-type" data-kind="'+eventCategory(e)+'">'+eventCategory(e)+'</span><strong>'+esc(e.title)+'</strong></div>'+(e.note?'<p>'+esc(e.note)+'</p>':'')+'<small>'+esc(label)+' · '+esc(e.who)+'</small></article>';}).join('')+'</div>':'<div class="detail-empty log-empty facts-surface"><strong>'+(events.length?'No matching entries':'No activity recorded yet')+'</strong>'+(events.length?'<p>Try another activity or date range.</p>':'')+'</div>';
 const groups=[];for(const e of visible){const display=logDisplayStamp(e,logEntryDate(e));let group=groups.find(g=>g.label===display.label);if(!group){group={label:display.label,entries:[]};groups.push(group);}group.entries.push({title:e.title,detail:e.note||'',meta:[display.time,e.who].filter(Boolean).join(' · '),category:eventCategory(e)});}return stLog(groups,{className:'categorized-timeline',empty:events.length?'No matching entries':'No activity recorded yet'},fallback);
}

function productionRecords(c,p){
 const records=[...(p.productionBatches||[])];
 if(p.batchId&&!records.some(r=>r.batchId===p.batchId&&r.status==='current'))records.unshift({id:p.id+'-current',batchId:p.batchId,status:'current',serviceDate:p.registry?.serviceDate,expectedFarrowing:p.registry?.expectedFarrowing});
 return records;
}
function productionAverages(records){
 const finished=records.filter(r=>r.status==='completed');
 const mean=key=>{const values=finished.map(r=>r[key]).filter(Number.isFinite);return values.length?+(values.reduce((sum,n)=>sum+n,0)/values.length).toFixed(1):null;};
 const weighed=finished.filter(r=>Number.isFinite(r.weaningLitterWeight)&&Number.isFinite(r.weaned)&&r.weaned>0);
 return {count:finished.length,bornAlive:mean('bornAlive'),weaned:mean('weaned'),weaningWeight:weighed.length?+(weighed.reduce((sum,r)=>sum+r.weaningLitterWeight,0)/weighed.reduce((sum,r)=>sum+r.weaned,0)).toFixed(1):null,entryWeight:mean('entryWeight'),exitWeight:mean('exitWeight'),services:mean('services')};
}
function productionOverview(c,p){
 const records=productionRecords(c,p),avg=productionAverages(records),type=animalType(p),litter=type==='Sow'||type==='Gilt';
 const metrics=litter?[['Born alive',avg.bornAlive],['Weaned',avg.weaned],['Weaning wt.',avg.weaningWeight,'kg']]:type==='Boar'?[['Services / batch',avg.services]]:[['Entry weight',avg.entryWeight,'kg'],['Exit weight',avg.exitWeight,'kg']];
 // Design law: an empty section is absent, never rendered as "none".
 const summary=avg.count?'<section class="batch-averages">'+stHeading({title:'Averages',icon:icon('chart'),meta:avg.count+' completed '+(avg.count===1?'batch':'batches'),kind:'section',level:4},'<div class="detail-heading"><h4>Averages</h4><small>'+avg.count+' completed '+(avg.count===1?'batch':'batches')+'</small></div>')+'<div class="production-highlights">'+metrics.map(([label,value,unit])=>'<div><strong>'+recordValue(value,unit)+'</strong><span>'+label+'</span></div>').join('')+'</div></section>':'';
 return summary+'<section class="detail-section production-batch-section">'+stHeading({title:'Batches',icon:icon('record'),kind:'section',level:4},'<div class="detail-heading"><h4>Batches</h4></div>')+(records.length?'<div class="production-batch-list st-panel st-row-group">'+records.map(r=>{
  const current=r.status==='current';const result=current?stageSummary(p):litter?(hasRecordValue(r.weaned)?r.weaned+' weaned':'Weaned —')+(Number.isFinite(r.weaningLitterWeight)&&r.weaned>0?' · '+quantity(r.weaningLitterWeight/r.weaned)+' kg':''):type==='Boar'?(r.services??'—')+' services':(r.exitWeight??'—')+' kg at finish';
  const sub=current?result:result+' · '+(r.finishedDate||'Date unknown')+(r.rating?' · '+r.rating:'');
  return stRow({action:'pig-production-batch',value:p.id+'|'+r.id,icon:icon(current?'clock':'check'),title:'Batch '+r.batchId,description:sub,trailing:current?'<small class="batch-record-status">Current</small>':'',className:'production-batch-row'});
 }).join('')+'</div>':'<p class="detail-empty facts-surface">No batch records.</p>')+'</section>';
}
function productionBatchPage(c){
 const p=pig(c,c.pigId),record=productionRecords(c,p).find(r=>r.id===c.productionRecordId);if(!record)return sheet(c,'Batch record',p.id,'<p class="detail-empty">Record unavailable.</p>',footer(back(),''));
 const current=record.status==='current',type=animalType(p),litter=type==='Sow'||type==='Gilt';let body='';
 if(current)body='<p class="batch-current-label">Current batch</p>'+profileFacts('This cycle',litter?[['Last service',record.serviceDate],['Expected farrowing',record.expectedFarrowing]]:[['Type',type],['Age',p.age,'days']]);
 else {
  const metrics=litter?[['Born alive',record.bornAlive],['Stillborn',record.stillborn],['Weaned',record.weaned],['Weaning weight',record.weaned>0&&Number.isFinite(record.weaningLitterWeight)?+(record.weaningLitterWeight/record.weaned).toFixed(1):null,'kg/pig']]:type==='Boar'?[['Services',record.services]]:[['Entry weight',record.entryWeight,'kg'],['Exit weight',record.exitWeight,'kg']];
  body=profileFacts('Results',metrics)+profileFacts(litter?'Finish weaning':'Finish record',litter?[['Farrowed',record.farrowedDate],['Weaned',record.finishedDate],['Parity',record.parity],['Rating',record.rating],['Sow weight',record.sowWeight,'kg'],['Backfat',record.backfat,'mm']]:[['Finished',record.finishedDate],['Rating',record.rating]])+'<p class="batch-record-author">'+esc([record.finishedDate,record.recordedBy].filter(Boolean).join(' · '))+'</p>'+(record.note?'<div class="batch-finish-note facts-surface"><span>Note</span><p>'+esc(record.note)+'</p></div>':'');
 }
 return sheet(c,'Batch '+record.batchId,p.id+' · '+(current?'In progress':'Finished'),body,footer(back(),''));
}

function pigRecordPage(c){
 const p=pig(c,c.pigId),pe=penOf(c,p.id),b=c.batches.find(b=>b.id===p.batchId),tab=({'pig-production':'production','pig-origin':'provenance','pig-log':'log'}[c.view]||'details'),r=p.registry||{},stats=p.production||{};let body='';
 if(tab==='details')body=
  (b?'<section class="profile-next-card"><span>Next task · Batch '+esc(b.id)+'</span><strong>'+esc(b.next)+'</strong><small>'+esc(b.when)+'</small></section>':'')+
  profileFacts('Basic information',[
   ['Ear tag',p.id],['Type',animalType(p)],['Breed',r.breed],['Location',unitName(c)+' · '+pe.id],['Age',p.age??daysFromWalk(r.birthDate),'days'],['Parity',p.parity],['Weight',p.weight,'kg'],['Temperature',p.temperature,'°C'],['Stage',p.stage],['Batch ID',p.batchId],['On farm',r.onFarm===undefined?null:r.onFarm?'Yes':'No']
  ])+
  typeDetails(p,c);
 if(tab==='production')body=productionOverview(c,p);
 if(tab==='provenance')body=
  profileFacts('Origin & dates',[
   ['Entry type',r.entryType],['Birth date',r.birthDate],['Arrival date',r.arrivalDate],['First heat',r.firstHeat],['Birth farm',r.birthFarm],['Genetic line',r.geneticLine],['Dam',r.dam],['Sire',r.sire]
  ])+
  profileFacts('Identity records',[
   ['Current ear tag',p.id],['Breeding number',r.breedingId],['Other ear tag',r.otherTag]
  ])+
  (r.identities?.length?'<details class="detail-disclosure profile-identities"><summary><span>Other identities <small>'+r.identities.length+'</small></span>'+icon('chevron')+'</summary><dl class="identity-list">'+r.identities.map(x=>'<div><dt>'+esc(x.type)+'</dt><dd>'+esc(x.value)+'</dd></div>').join('')+'</dl></details>':'<div class="profile-empty-row"><span>Other identities</span><span>—</span></div>');
 if(tab==='log')body=categorizedLog(c,pigLogEntries(c),'pig');
 return sheet(c,({details:'General details',production:'Production stats',provenance:'Origin',log:'Pig log'}[tab]),p.id+' · '+unitName(c)+' · '+pe.id,body,footer(back(),''));
}
// Deliberate populated / partial / missing examples; all remain sample farm data.
function seedProfileExamples(c){
 const full=pig(c,'000267');Object.assign(full,{age:966,weight:180,backfat:13,temperature:38.8,measurementDates:{weight:'2026-09-10',backfat:'2026-09-10',temperature:'2026-09-12'},
  registry:{type:'Sow',breed:'Duroc',onFarm:true,teats:14,serviceDate:'1 Aug 2026',expectedFarrowing:'23 Nov 2026',expectedHeat:null,entryType:'Farm-born',birthDate:'20 Jan 2024',arrivalDate:'20 Jan 2024',firstHeat:'20 Aug 2024',birthFarm:'Home farm',geneticLine:'Duroc line A',dam:'000118',sire:'B-024',breedingId:'S-000267',otherTag:'M-267',identities:[{type:'RFID',value:'982 000 000 267'},{type:'Birth record',value:'BR-2024-0267'}]},
  production:{litters:2,days:440,bornAlive:13,bornTotal:14,farrowingRate:100,weaningRate:93,weaningWeight:6.6,matingsPerLitter:2,farrowingInterval:153,nonProductiveDays:0,livebornWeight:22}
 });
 full.initialRecords.push({category:'Measurements',title:'Weight recorded',note:'180 kg · backfat 13 mm',time:'10 Sep 2026',who:'G. Hansen'},{category:'Production',title:'Service recorded',note:'Sire B-024',time:'1 Aug 2026',who:'G. Hansen'});
 Object.assign(pig(c,'000254'),{age:1172,weight:205,measurementDates:{weight:'2026-09-05'},registry:{type:'Sow',breed:'Landrace × Yorkshire',onFarm:true,teats:14,entryType:'Purchased',arrivalDate:'4 May 2024',breedingId:'S-000254'},production:{litters:3,bornAlive:12.7,bornTotal:14,farrowingRate:100}});
 pig(c,'000306').registry={type:'Sow',onFarm:true};
 const sow=pig(c,'000281');Object.assign(sow,{age:1280,weight:192,backfat:14,measurementDates:{weight:'2026-09-09',backfat:'2026-09-09'},registry:{type:'Sow',breed:'Yorkshire',onFarm:true,teats:14,serviceDate:'28 Jul 2026',expectedFarrowing:'19 Nov 2026'}});
 for(const p of [full,sow])p.productionBatches=[
  {id:p.id+'-batch16',batchId:'16',status:'completed',parity:p.parity,bornAlive:14,stillborn:1,weaned:13,weaningLitterWeight:85.8,farrowedDate:'10 Jun 2026',finishedDate:'8 Jul 2026',sowWeight:182,backfat:13,recordedBy:'G. Hansen'},
  {id:p.id+'-batch12',batchId:'12',status:'completed',parity:p.parity-1,bornAlive:12,stillborn:0,weaned:11,weaningLitterWeight:72.6,farrowedDate:'8 Jan 2026',finishedDate:'5 Feb 2026',sowWeight:180,backfat:12,recordedBy:'M. Larsen'}
 ];

}

function feedCurve(p){
 const points=p.feedCurve?.points;if(!points?.length)return '<p class="detail-empty">No curve points supplied.</p>';
 const min=Math.floor((Math.min(...points.map(x=>x.kg))-.2)*10)/10,max=Math.ceil((Math.max(...points.map(x=>x.kg))+.2)*10)/10;
 const x=d=>32+(d-points[0].day)/(points.at(-1).day-points[0].day)*258,y=k=>102-(k-min)/(max-min)*76;
 const path=points.map((pt,i)=>(i?'L':'M')+x(pt.day).toFixed(1)+','+y(pt.kg).toFixed(1)).join(' '),today=points.find(pt=>pt.day===p.feedCurve.today);
 return '<figure class="pig-feed-curve"><svg viewBox="0 0 310 140" role="img" aria-label="Sample base feed curve. Today '+quantity(p.base)+' kilograms per pig per day. Individual adjustment is shown separately."><path class="curve-grid" d="M32 26H290 M32 102H290"/><text x="1" y="30">'+max.toFixed(1)+'</text><text x="1" y="106">'+min.toFixed(1)+'</text><path class="curve-line" d="'+path+'"/>'+(today?'<path class="curve-today" d="M'+x(today.day)+' 20V108"/><circle cx="'+x(today.day)+'" cy="'+y(today.kg)+'" r="4"/>':'')+points.map(pt=>'<text text-anchor="middle" x="'+x(pt.day)+'" y="127">'+(pt.day===p.feedCurve.today?'Today':'Day '+pt.day)+'</text>').join('')+'</svg><figcaption>kg/day · before individual adjustments</figcaption></figure>';
}
function feedingHeader(pe){return '<div class="feeding-card-heading"><strong>'+esc(pe.formula)+'</strong><span>'+({trough:'Shared trough',station:'Station-fed',adlib:'Ad-lib'}[pe.mode])+'</span></div>';}
function pigFeedingToday(p,pe){
 const amount=pe.mode==='adlib'?'Ad-lib':quantity(pigAllocation(p,pe))+' <small>kg/day</small>';
 const context=pe.mode==='station'?'Station-fed':pe.mode==='trough'?'Included in pen allocation':'No fixed ration';
 const tags=pigFeedTags(p).map(t=>t.kind==='ration'?{...t,label:'Feed '+t.delta,day:feedAdjustmentReason(p)}:t);
 const inner='<div class="pig-feed-fact-row"><span class="pig-feed-copy"><strong>'+esc(pe.formula||'Feed plan')+'</strong><small>'+esc(context)+'</small></span><span class="pig-feed-amount">'+amount+'</span></div>'+(tags.length?'<div class="feeding-status-tags">'+tags.map(recordedTag).join('')+'</div>':'');
 return stPanel(inner,{className:'facts-surface'},'<div class="facts-surface st-panel">'+inner+'</div>');
}
function pigFeedPage(c){
 const p=pig(c,c.pigId),pe=penOf(c,p.id);
 const feeding='<section class="detail-section reading-section pig-feeding-facts">'+stHeading({title:'Feeding',icon:icon('feed'),kind:'section',level:4},'<div class="detail-heading"><h4 class="section-title">'+icon('feed')+'Feeding</h4></div>')+pigFeedingToday(p,pe)+'</section>';
 const curve=pe.mode==='adlib'?'':'<section class="detail-section pig-plan-curve">'+stHeading({title:'Base curve',icon:icon('chart'),kind:'section',level:4},'<div class="detail-heading"><h4>Base curve</h4></div>')+stPanel(feedCurve(p),{className:'facts-surface pig-plan-curve-panel'},feedCurve(p))+'</section>';
 return sheet(c,'Feed plan',p.id,feeding+curve,footer(back(),''));
}
function feedBody(c,pe){
 const plans=pe.mode==='adlib'?'':pe.pigs.map(p=>button('pig-feed','<span><strong>'+p.id+'</strong><small>'+esc(pigFeedTags(p).map(t=>t.label).join(' · ')||'Follow curve')+'</small></span><strong>'+quantity(pigAllocation(p,pe))+' <small>kg/day</small></strong>'+icon('chevron'),'feeding-pig-row',p.id)).join('');
 const heading=stHeading({title:pe.formula,meta:({trough:'Shared trough',station:'Station-fed',adlib:'Ad-lib'})[pe.mode]||'',kind:'section',level:4,className:'feeding-card-heading'},feedingHeader(pe));
 return '<section class="feeding-today">'+heading+'<div class="feeding-main-amount"><span>Daily feed</span><strong>'+(pe.mode==='adlib'?'Ad-lib':quantity(allocation(pe))+' <small>kg/day</small>')+'</strong></div></section>'+plans;
}

function currentFinding(c){return cases(pig(c,c.pigId)).find(k=>k.name===c.findingName);}
function recordFlowOverlay(c){
 const p=pig(c,c.pigId),f=c.form;
 if(c.view==='pig-profile')return pigOverview(c);
 if(['pig-production','pig-origin','pig-log'].includes(c.view))return pigRecordPage(c);
 if(['pig-feed','pig-feed-curve','pig-feed-changes'].includes(c.view))return pigFeedPage(c);
 if(!['finding','finding-edit','finding-close'].includes(c.view))return null;
 const k=currentFinding(c);if(!k)return sheet(c,'Finding closed',c.pigId,'<p class="quiet-note">The record is retained in this pig’s log.</p>',footer(back(),''));
 if(c.view==='finding')return sheet(c,k.name,p.id+' · '+k.kind+' · Day '+k.day,
  '<div class="finding-summary"><span class="record-type">Care</span><strong>'+esc(careLabel(k.triage))+'</strong>'+(k.note?'<p>'+esc(k.note)+'</p>':'')+'</div>'+'<p class="quiet-note">Recorded '+esc(k.recordedDate||'—')+' · '+esc(k.recordedBy||'—')+'</p>'+(k.feedLinked?'<p class="quiet-note">Linked feed adjustment: '+(p.factor>=1?'+':'')+Math.round((p.factor-1)*100)+'%. Resolving this finding restores the base plan.</p>':'')+
  (p.treatment?.target===k.name?'<p class="quiet-note">Latest treatment: '+esc(p.treatment.medicine)+' · '+esc(p.treatment.dose)+' '+esc(p.treatment.unit)+' · '+esc(p.treatment.method)+'</p>':'')+'<div class="compact-actions st-panel st-row-group st-action-list">'+action('finding-edit','note','Edit finding','Care and notes')+action('finding-treat','condition','Record treatment','For '+k.name+' on this pig')+(k.feedLinked?action('pig-adjustment','feed','Review feed adjustment','Condition band and end date',p.id):'')+action('finding-close','check','Resolve or remove','Recovered, or entered in error')+'</div>',footer(back(),''));
 if(c.view==='finding-edit')return sheet(c,'Edit finding',p.id+' · '+k.name,
  (k.feedLinked?'<p class="quiet-note">'+esc(k.name)+' · Body condition. Use Review feed adjustment to change the condition band.</p>':fieldSelect(c,'Finding','findingLabel',[[k.name,k.name],...catalog.filter(x=>x.name!==k.name&&!cases(p).some(y=>y.name===x.name)).map(x=>[x.name,x.name])],f.findingLabel))+
  healthStateFields(c)+'<label class="field">Note · optional<textarea data-v2="caseNote">'+esc(f.caseNote||'')+'</textarea></label>',footer(back(),button('save-finding','Save changes','button primary')));
 return sheet(c,'Resolve or remove',p.id+' · '+k.name,fieldSelect(c,'Outcome','outcome',[['recover','Recovered'],['strike','Entered in error']],f.outcome)+(k.feedLinked?'<p class="quiet-note">This also ends the linked feed adjustment and returns this pig to the base plan.</p>':'')+'<label class="field">Note · optional<textarea data-v2="closeNote">'+esc(f.closeNote||'')+'</textarea></label><p class="quiet-note">The finding leaves the active list. Its record and this change remain in the pig’s log.</p>',footer(back(),button('save-finding-close','Save outcome','button primary')));
}
function saveFinding(c){
 const k=currentFinding(c),f=c.form,p=pig(c,c.pigId);if(!k)return false;
 const next=k.feedLinked?k.name:f.findingLabel;
 if(!next||cases(p).some(x=>x!==k&&x.name===next))return false;
 const old=k.name,oldCare=k.triage;k.name=next;k.kind=catalog.find(x=>x.name===next)?.kind||k.kind;k.triage=f.triage;k.issueStatus=issueStatus(k);k.note=f.caseNote||'';
 if(p.treatment?.target===old)p.treatment.target=next;
 addEvent(c,'Finding edited',[p.id],old+(old!==next?' → '+next:'')+' · '+careLabel(oldCare)+' → '+careLabel(k.triage)+(k.note?' · '+k.note:''));
 for(const entry of c.navTrail||[]){if(entry.pigId===p.id&&entry.findingName===old)entry.findingName=next;}c.findingName=next;c.view='finding';return true;
}
function closeFinding(c){
 const p=pig(c,c.pigId),k=currentFinding(c),f=c.form;if(!k)return false;
 (p.closedCases||=[]).push({...k,outcome:f.outcome,closedBy:'G. Hansen',closedAt:'09:41',closeNote:f.closeNote||''});p.cases=p.cases.filter(x=>x!==k);
 if(k.feedLinked){p.factor=1;p.adjustmentActive=false;p.band='standard';p.ends=undefined;(p.feedChanges||=[]).unshift({title:'Individual adjustment ended',note:k.name+' · base plan restored',time:'Today · 09:41',who:'G. Hansen'});}
 addEvent(c,f.outcome==='recover'?'Recovered':'Finding entered in error',[p.id],k.name+(f.closeNote?' · '+f.closeNote:''));c.view='pig';c.form={};return true;
}
function handleRecordAction(c,a,v){
 if(a==='log-date-open'){c.logDateScope=v;c.logDateDraft={preset:'all',start:'',end:'',...c[v+'LogDate']};c.logDatePicker=true;c.logDateFocus='dialog';c.restoreSheetScroll=0;return true;}
 if(a==='log-date-cancel'){c.logDatePicker=false;delete c.logDateDraft;c.logDateFocus='trigger';c.restoreSheetScroll=c.logDateScroll||0;return true;}
 if(a==='log-date-preset'){c.logDateDraft.preset=v;return true;}
 if(a==='log-date-apply'){if(logDateDraftError(c.logDateDraft))return true;c[c.logDateScope+'LogDate']={...c.logDateDraft};c.logDatePicker=false;delete c.logDateDraft;c.logDateFocus='trigger';c.restoreSheetScroll=0;return true;}
 if(a==='log-clear'){c[v+'LogDate']={preset:'all'};c[v+'LogFilter']='All';c.restoreSheetScroll=0;return true;}
 if(a==='production-task'){const p=picked(c)[0],task=currentTasksForPig(c,p).find(task=>task.id===v);return openProductionTask(c,task,p);}
 if(a==='batch-membership'){const p=picked(c)[0];if(!p)return true;c.form={subjects:[p.id],batchTarget:'',batchNote:''};c.view='batch-membership';return true;}
 if(a==='miscarriage'){c.lossReason='';c.view='miscarriage';return true;}
 if(a==='task-outcome'){c.form.taskOutcome=v;return true;}
 if(a==='save-production-task'){saveProductionTask(c);return true;}
 if(a==='save-batch-membership'){saveBatchMembership(c);return true;}
 if(bulkActionKinds.includes(a)&&picked(c).length){openBulkAction(c,a);return true;}
 if(a==='health-catalog-section'){c.form.catalogSection=v;c.form.catalogGroup='';return true;}
 if(a==='health-catalog-group'){if(c.form.kind==='Symptom'&&!c.form.catalogSection)c.form.catalogSection=healthCatalogue(c.form).find(item=>item.kind==='Symptom'&&item.group===v)?.section||'';c.form.catalogGroup=v;return true;}
 if(a==='health-catalog-back'){
  if(c.form.customDraft){c.form.search=c.form.customDraft.name;delete c.form.customDraft;return true;}
  if(c.form.catalogGroup){const groups=[...new Set(healthCatalogue(c.form).filter(item=>item.kind===c.form.kind&&item.section===c.form.catalogSection).map(item=>item.group))];c.form.catalogGroup='';if(c.form.kind==='Disease'||c.form.catalogSection==='Body area'||groups.length<=1)c.form.catalogSection='';}
  else c.form.catalogSection='';return true;
 }
 if(a==='health-add-custom'){
  const raw=String(v||c.form.search||'').trim().replace(/\s+/g,' ').slice(0,80);if(!raw)return true;
  const existing=healthCatalogue(c.form).find(item=>normalizedCondition(item.name)===normalizedCondition(raw)&&item.kind===c.form.kind),name=existing?.name||raw;
  if(existing){c.form.conditionKinds||={};c.form.conditionKinds[name]=existing.kind;if(!c.form.conditions.includes(name))c.form.conditions.push(name);c.form.search='';c.form.catalogSection=existing.section;c.form.catalogGroup=existing.group;return true;}
  c.form.customDraft={name,kind:c.form.kind};c.form.search='';return true;
 }
 if(a==='health-custom-category'){
  const draft=c.form.customDraft;if(!draft)return true;const [section,group]=String(v).split('|'),item={name:draft.name,kind:draft.kind,section,group,aliases:[],custom:true};
  c.customHealthCatalog||={};c.customHealthCatalog[item.name]=item;c.form.customConditions||={};c.form.customConditions[item.name]=item;c.form.conditionKinds||={};c.form.conditionKinds[item.name]=item.kind;if(!c.form.conditions.includes(item.name))c.form.conditions.push(item.name);delete c.form.customDraft;c.form.catalogSection=section;c.form.catalogGroup=group;return true;
 }
 if(a==='health-remove-custom'){
  const name=String(v);delete c.customHealthCatalog?.[name];delete c.form.customConditions?.[name];delete c.form.conditionKinds?.[name];c.form.conditions=c.form.conditions.filter(item=>item!==name);return true;
 }
 if(a==='bulk-toggle-controls'){c.form.controlsCollapsed=!c.form.controlsCollapsed;return true;}
 if(a==='bulk-save'){if(c.actionEntry)c.returnAfterActionSave=true;saveBulkAction(c);return true;}
 if(a==='medicine-open'){c.form.medicineSearch='';c.form.medicineCategory='';c.view='medicine-picker';return true;}
 if(a==='medicine-category'){c.form.medicineCategory=v;return true;}
 if(a==='medicine-root'){c.form.medicineCategory='';return true;}
 if(a==='medicine-cancel'){c.view='treatment';return true;}
 if(a==='medicine-select'){const m=medicineCatalogue.find(m=>m.id===v);if(m){c.form.medicine=m.name;c.form.medicineId=m.id;c.view='treatment';}return true;}
 if(a==='record-optional-open'){Object.assign(c.form,{optionalKey:v,optionalDraft:c.form[v]||'',optionalReturn:c.view});c.view='record-optional';return true;}
 if(a==='record-optional-clear'){c.form[v]='';return true;}
 if(a==='record-optional-save'||a==='record-optional-remove'){if(a==='record-optional-save'&&!optionalEditorChanged(c))return true;c.form[c.form.optionalKey]=a==='record-optional-remove'?'':c.form.optionalDraft.trim();c.view=c.form.optionalReturn;delete c.form.optionalDraft;return true;}
 if(a==='bulk-pick-health'){c.form.conditionsBeforePicker=[...c.form.conditions];c.view='bulk-health-picker';return true;}
 if(a==='bulk-health-done'){if(!conditionSelectionChanged(c))return true;delete c.form.conditionsBeforePicker;c.view='health';return true;}
 if(a==='feed-edit-pen'){openFeedEditor(c,'pens',[v]);}
 else if(a==='feed-edit-selected'){openFeedEditor(c,c.actionScope,c.actionScope==='pens'?[...c.selectedPens]:[...c.selected]);}
 else if(a==='feed-breakdown'){c.view='feed-breakdown';}
 else if(a==='feed-edit-mode'){c.form.mode=v;}
 else if(a==='feed-edit-hold'){c.form.mode=feedEditorHeld(c)?'adjust':'hold';}
 else if(a==='feed-optional-open'){c.form.optionalDraft=c.form[v]||'';c.view=v==='until'?'feed-date':'feed-note';}
 else if(a==='feed-optional-save'){if(!optionalEditorChanged(c))return true;const key=c.view==='feed-date'?'until':'reason',value=(c.form.optionalDraft||'').trim();if(key==='until'&&value&&value<walkDate)return true;c.form[key]=value;c.form.metadataDirty=true;delete c.form.optionalDraft;c.view='feed-editor';}
 else if(a==='feed-optional-clear'){c.form[v]='';c.form.metadataDirty=true;}
 else if(a==='feed-optional-remove'){c.form[c.view==='feed-date'?'until':'reason']='';c.form.metadataDirty=true;delete c.form.optionalDraft;c.view='feed-editor';}
 else if(a==='feed-edit-reset'){Object.assign(c.form,{mode:'resume',percent:0,mixed:false,until:''});c.form.amount=Number(feedTotals(c).after.toFixed(2));}
 else if(a==='feed-edit-save'){saveFeedEditor(c);}
 else if(a==='finding'){const [id,name]=v.split('|');c.pigId=id;c.findingName=name;c.view='finding';c.form={};}
 else if(a==='finding-edit'){const k=currentFinding(c);c.form={findingLabel:k.name,triage:k.triage||'None',issueStatus:issueStatus(k),caseNote:k.note||''};c.view='finding-edit';}
 else if(a==='finding-close'){c.form={outcome:'recover',closeNote:''};c.view='finding-close';}
 else if(a==='save-finding')saveFinding(c);
 else if(a==='save-finding-close')closeFinding(c);
 else if(a==='finding-treat'){openBulkAction(c,'treatment',[c.pigId]);Object.assign(c.form,{target:c.findingName,returnFinding:c.findingName});}
 else if(a==='pig-production-batch'){const [id,recordId]=v.split('|');c.pigId=id;c.productionRecordId=recordId;c.view='pig-production-batch';}
 else if(a==='pig-feed'){c.pigId=v;c.feedTab='plan';c.view='pig-feed';}
 else if(a==='log-filter'){const [scope,type]=v.split('|');if(['pig','pen'].includes(scope)&&['All',...logTypes].includes(type)){c[scope+'LogFilter']=type;c.restoreSheetScroll=0;}}
 else if(['pig-production','pig-origin','pig-log'].includes(a)){c.pigId=v;c.view=a;if(a==='pig-log'){c.pigLogFilter='All';c.pigLogDate={preset:'all'};}}
 else if(['pig-feed-curve','pig-feed-changes'].includes(a)){c.pigId=v;c.view=a;}
 else if(a==='pig-adjustment'){openFeedEditor(c,'pigs',[v]);}
 else return false;
 return true;
}

// Shared, in-memory feed editor: scope changes, interaction stays the same.
function openFeedEditor(c,kind,ids){
 // A pen is only an entry point: capture its current pigs as the edit subjects.
 const subjects=kind==='pens'?ids.flatMap(id=>pen(c,id).pigs.map(p=>p.id)):ids;
 c.form={feedScope:'pigs',feedIds:[...new Set(subjects)],mode:'keep',percent:0,until:'',reason:''};c.view='feed-editor';
 const rows=feedEditorTargets(c).filter(t=>!t.blocked).flatMap(t=>t.rows),b=feedBasis(c);
 c.form.percent=b.variable?Number(((b.current/b.variable-1)*100).toFixed(8)):0;
 c.form.amount=Number(b.current.toFixed(2));c.form.mixed=new Set(rows.map(p=>p.noFeed?'stop':Number.isFinite(p.feedHold)?'hold:'+p.feedHold:p.factor??1)).size>1;
 if(rows.length===1){c.form.until=rows[0].ends==='when recovered'?'':rows[0].ends||'';c.form.reason=rows[0].adjustmentReason||'';}
}
function feedUnavailableReason(p,pe){return p?.stage==='Sow died'?'Pig has died':pe.mode==='adlib'?'Ad-lib feeding has no fixed daily allowance':pe.mode==='unknown'||!Number.isFinite(p?.base)||p.base<=0?'No feeding plan recorded':'';}
function feedEditorTargets(c){
 const f=c.form;return f.feedIds.map(id=>{const pe=f.feedScope==='pens'?pen(c,id):penOf(c,id),p=f.feedScope==='pigs'?pig(c,id):null;
 return {id,pe,p,label:p?p.id:'Pen '+id,blocked:p?feedUnavailableReason(p,pe):pe.mode==='adlib'?'Ad-lib feeding has no fixed daily allowance':'',rows:p?[p]:pe.pigs};});
}
function proposedPigAllocation(p,pe,f){
 if(f.mode==='keep'||f.mode==='hold')return pigAllocation(p,pe);
 if(f.mode==='stop')return 0;
 return p.base*(f.mode==='resume'?1:1+Number(f.percent)/100);
}
function feedEditorValid(c){const f=c.form;return feedEditorTargets(c).some(t=>!t.blocked)&&(f.mode!=='keep'||f.metadataDirty)&&['keep','adjust','hold','stop','resume'].includes(f.mode)&&(f.mode!=='adjust'||(String(f.percent).trim()!==''&&Number.isFinite(+f.percent)&&+f.percent>=-50&&+f.percent<=50))&&(!f.until||f.until>=walkDate);}
function feedBasis(c){
 let variable=0,current=0;
 for(const t of feedEditorTargets(c).filter(t=>!t.blocked))for(const p of t.rows){current+=pigAllocation(p,t.pe);variable+=p.base;}
 return {variable,fixed:0,current};
}
function feedTotals(c){
 let before=0,after=0;
 for(const t of feedEditorTargets(c).filter(t=>!t.blocked))for(const p of t.rows){before+=pigAllocation(p,t.pe);after+=proposedPigAllocation(p,t.pe,c.form);}
 return {before,after};
}
function feedPreview(c){
 const t=feedTotals(c),excluded=feedEditorTargets(c).filter(x=>x.blocked);
 return '<div class="feed-preview-total facts-surface"><small>Total · kg/day</small><strong>'+quantity(t.before)+' <span>→</span> '+(Number.isFinite(t.after)?quantity(t.after):'—')+'</strong></div>'+(excluded.length?'<small class="feed-excluded-summary">Ad-lib pigs unchanged</small>':'');
}
function feedEditorHeld(c){return c.form.mode==='hold'||c.form.mode==='keep'&&feedEditorTargets(c).filter(t=>!t.blocked).flatMap(t=>t.rows).every(p=>Number.isFinite(p.feedHold)&&!p.noFeed);}
function updateFeedInput(c,key,value){
 const f=c.form;
 if(key==='percent'){f.mixed=false;f.percent=String(value).trim()===''?NaN:Number(value);f.mode='adjust';}
 else if(key==='feedingState'){f.mode=value;if(value==='adjust'&&(f.mixed||!Number.isFinite(f.percent)||f.percent < -50))f.percent=0;f.amount=Number(feedTotals(c).after.toFixed(2));}
 else {f[key]=value;if(key==='until'||key==='reason')f.metadataDirty=true;}
}
function feedBreakdown(c){
 const body=feedEditorTargets(c).map(t=>'<section class="feed-breakdown-section"><h4>'+esc(t.label)+'</h4>'+(t.blocked?'<p class="quiet-note">'+esc(t.blocked)+' · unchanged</p>':t.rows.map(p=>'<div class="detail-line"><span>'+esc(p.id)+'</span><strong>'+quantity(pigAllocation(p,t.pe))+' → '+quantity(proposedPigAllocation(p,t.pe,c.form))+' kg</strong></div>').join(''))+'</section>').join('');
 return sheet(c,'Feed breakdown','Current → New · kg/day',body,footer(back(),''));
}
function feedPigPreview(c){
 const kg=n=>Number.isFinite(n)?Number(n.toFixed(2)).toString():'—';
 return feedEditorTargets(c).flatMap(t=>t.rows.map(p=>{
  const before=pigAllocation(p,t.pe),after=proposedPigAllocation(p,t.pe,c.form);
  const tags=pigFeedTags(p).map(tag=>{
   const f=c.form,adjusting=f.mode==='resume'||f.mode==='adjust'&&Number.isFinite(+f.percent)&&+f.percent>=-50&&+f.percent<=50;
   const replaced=!t.blocked&&(f.mode==='stop'?tag.kind!=='stop':f.mode==='hold'?tag.kind!=='hold':adjusting?tag.kind!=='ration'||Math.abs((p.factor??1)-(f.mode==='resume'?1:1+Number(f.percent)/100))>.000001:false);
   return replaced?'<del class="pending-feed-tag" aria-label="'+esc(tag.label+' will be removed or replaced on Save')+'">'+recordedTag({...tag,status:'Removed or replaced on Save'})+'</del>':recordedTag(tag);
  }).join(''),plan=p.feedPlan||t.pe.formula,changed=!t.blocked&&Number.isFinite(after)&&Math.abs(after-before)>.0001,delta=after-before;
  const change=t.blocked?'<span class="feed-change-state">'+esc(t.blocked)+'</span>':'<span class="feed-pig-values"><span class="feed-reading"><small>Current</small><span>'+kg(before)+'</span></span><span class="feed-change-arrow" aria-hidden="true">→</span><span class="feed-reading is-new"><small>New</small><strong>'+kg(after)+'</strong></span></span><small class="feed-change-state">'+(changed?(delta>0?'+':'')+kg(delta)+' kg/day':'Unchanged')+'</small>';
  return '<div class="pig-review-row feed-pig-preview '+(t.blocked?'is-blocked':changed?'is-changed':'is-unchanged')+'"><span class="pig-review-identity feed-pig-identity"><strong>'+esc(p.id)+'</strong><small>'+esc(plan)+'</small>'+(tags?'<span class="feed-pig-badge">'+tags+'</span>':'')+'</span><span class="pig-review-change feed-pig-change">'+change+'</span></div>';
 })).join('');
}
function feedOptionalControls(c){
 const f=c.form,date=f.until?new Date(f.until+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'';
 return optionalFieldControls([{key:'until',symbol:'clock',label:'End date',value:date?'Until '+date:''},{key:'reason',symbol:'note',label:'Add note',value:f.reason}], 'feed-optional-open','feed-optional-clear');
}
function feedOptionalEditor(c){
 const date=c.view==='feed-date',value=c.form.optionalDraft||'',key=date?'until':'reason';
 const field=date?'<label class="field">Until<input type="date" min="'+walkDate+'" data-feed-optional-input value="'+esc(value)+'"></label>':'<label class="field">Note<textarea rows="3" data-feed-optional-input placeholder="Write a note">'+esc(value)+'</textarea></label>';
 return sheet(c,date?'End date':'Feed note',countLabel(c.form.feedIds.length),field+(c.form[key]?button('feed-optional-remove',date?'Remove date':'Remove note','text-button feed-optional-remove'):'') ,footer(button('back','Back','button secondary'),button('feed-optional-save','Save','button primary','',!optionalEditorChanged(c)))).replace('class="sheet"','class="sheet feed-optional-sheet"');
}
function feedEditor(c){
 const f=c.form,targets=feedEditorTargets(c),rows=targets.filter(t=>!t.blocked).flatMap(t=>t.rows),held=feedEditorHeld(c),stopped=f.mode==='stop'||f.mode==='keep'&&rows.length&&rows.every(p=>p.noFeed);
 const previewCount=targets.reduce((n,t)=>n+t.rows.length,0),scope=countLabel(previewCount),title='Adjust feed';
 if(!rows.length)return sheet(c,title,scope,'<div class="facts-surface"><strong>Feed adjustment unavailable</strong><p class="quiet-note">'+esc(targets[0]?.blocked||'No feeding plan recorded')+'.</p></div>',footer(back(),''));
 const mixed=f.mode==='keep'&&f.mixed,disabled=held||stopped?' disabled':'',pct=Number.isFinite(+f.percent)?Number((+f.percent).toFixed(2)):'';
 const controls='<div class="plan-meta feed-main-fields">'+fieldSelect(c,'Feeding mode','feedingState',[['adjust','Follow curve'],['hold','Hold amount'],['stop','Stop feed']],stopped?'stop':held?'hold':'adjust','feed')+'<div class="field"><div class="feed-adjustment-heading"><span>Adjustment · %</span>'+button('feed-edit-reset','Reset','text-button feed-reset').replace('<button','<button aria-label="Reset to curve"')+'</div><input type="number" min="-50" max="50" step="any" inputmode="decimal" data-feed-edit="percent" aria-label="Curve adjustment percent" placeholder="Mixed" value="'+(stopped||mixed?'':pct)+'"'+disabled+'></div></div>'+ 
 '<div class="feed-amount-fields"><input type="range" min="-50" max="50" step="5" data-feed-edit="percent" aria-label="Feed adjustment slider" value="'+(mixed?0:pct)+'"'+disabled+'><div class="feed-range-labels"><span>−50%</span><span>0</span><span>+50%</span></div><div class="feed-control-caption"><small data-feed-input-hint>'+(stopped?'No feed · 0.0 kg/day':held?'Daily amounts stay fixed':mixed?'Choose one % for all pigs':'Replaces existing adjustments')+'</small></div></div>'+feedOptionalControls(c);
 const body='<div class="feed-fixed-form bulk-action-layout">'+
 '<section class="pig-review-card feed-inline-pigs'+(previewCount<=3?' is-short':'')+'"><div class="pig-review-heading feed-pigs-heading"><span><h4>Pigs</h4><small>'+previewCount+' selected</small></span><strong>Daily feed · kg/day</strong></div><div class="pig-review-list feed-pig-rows" data-feed-pigs role="region" aria-label="Feed changes by pig" tabindex="0">'+feedPigPreview(c)+'</div></section>'+ 
 '<section class="feed-action-panel bulk-controls facts-surface'+(f.controlsCollapsed?' is-collapsed':'')+'" aria-label="Feed adjustment">'+button('bulk-toggle-controls','<span>Adjustment</span>'+icon('chevron'),'bulk-controls-toggle').replace('<button','<button aria-expanded="'+!f.controlsCollapsed+'"')+(!f.controlsCollapsed?'<div class="bulk-control-fields">'+controls+'</div>':'')+'</section></div>';
 return sheet(c,title,scope,body,footer(back(),button('feed-edit-save','Save','button primary','',!feedEditorValid(c)))).replace('class="sheet"','class="sheet feed-editor-sheet'+(c.form.feedIds.length===1?' single-feed-sheet':'')+'"');
}

function saveFeedEditor(c){
 if(!feedEditorValid(c))return false;
 const f=c.form;
 for(const t of feedEditorTargets(c).filter(t=>!t.blocked))for(const p of t.rows){
  const before=pigAllocation(p,t.pe),next=proposedPigAllocation(p,t.pe,f);
  if(f.mode!=='keep'){
   delete p.feedHold;p.noFeed=f.mode==='stop';
   if(f.mode==='hold')p.feedHold=before;
   else if(f.mode!=='stop')p.factor=f.mode==='resume'?1:1+Number(f.percent)/100;
   p.adjustmentActive=p.factor!==1;p.band=p.adjustmentActive?'custom':'standard';
   cases(p).forEach(k=>{if(k.feedLinked)k.feedLinked=false;});
  }
  p.ends=f.until||'';p.adjustmentReason=f.reason||'Feed plan';
  const note=quantity(before)+' → '+quantity(next)+' kg/day · '+({keep:'Plan unchanged',adjust:(+f.percent>=0?'+':'')+Number((+f.percent).toFixed(2))+'% of curve',hold:'Amount held',stop:'No feed',resume:'Reset to curve'}[f.mode])+(f.until?' · Until '+f.until:'')+(f.reason?' · '+f.reason:'');
  (p.feedChanges||=[]).unshift({category:'Feed',title:'Feed plan changed',note,time:'Today · 09:41',who:'G. Hansen'});addEvent(c,'Feed plan changed',[p.id],note,'Feed');
 }
 c.form={};c.view='list';return true;
}

// A transient overlay indicator follows touch/wheel scrolling without a desktop gutter.
function showMobileScrollIndicator(scroller){
 const overflow=scroller.scrollHeight-scroller.clientHeight;if(overflow<=1)return;
 const host=scroller.parentElement;let thumb=host.querySelector(':scope > .mobile-scroll-thumb');
 if(!thumb){thumb=document.createElement('span');thumb.className='mobile-scroll-thumb';thumb.setAttribute('aria-hidden','true');host.appendChild(thumb);}
 const travel=scroller.clientHeight-8,height=Math.min(travel,Math.max(28,travel*scroller.clientHeight/scroller.scrollHeight));
 const top=scroller.getBoundingClientRect().top-host.getBoundingClientRect().top+4+(travel-height)*Math.min(1,Math.max(0,scroller.scrollTop/overflow));
 thumb.style.height=height+'px';thumb.style.top=top+'px';thumb.classList.add('is-scrolling');
 clearTimeout(scroller.scrollFadeTimer);scroller.scrollFadeTimer=setTimeout(()=>thumb.classList.remove('is-scrolling'),650);
}
// The same record screens can be opened from another task without a second UI implementation.
function sowDetailContext(record,previous){
 const c=previous||seed(),existing=previous&&pig(c,record.id);
 const p=existing||{id:record.id,base:0,factor:1,cases:[],registry:{type:'Sow'},initialRecords:[]};
 Object.assign(p,{id:record.id,parity:record.parity,stage:record.stage});
 p.initialRecords=(record.events||[]).map(e=>({category:'Production',title:e.text,time:[e.day,e.time].filter(Boolean).join(' · '),who:e.who}));
 const pe=previous&&penOf(c,p.id)||{mode:'unknown',formula:'',faults:[],pigs:[]};
 pe.id=record.pen;pe.pigs=[p];c.pens=[pe];c.batches=[];c.unitLabel=record.unit;
 Object.assign(c,{view:'pig',pigId:p.id,penId:pe.id,navTrail:[],form:{},toast:'',scroll:0});delete c.navOrigin;
 c.selected.clear();c.selectedPens.clear();return c;
}
// Model exports permit small, isolated checks without starting the UI.
globalThis.InspectionStudy={catalog,healthList,conditionDefinition,batchTaskForPig,batchTrackerRows,unitOverview,overlay,inspectionSurface,drawerSize,actionCatalogue,productionActionsForPig,sowTaskCard,pigCurrentTasks,currentTasksForPig,openProductionTask,saveProductionTask,saveBatchMembership,saveMiscarriage,openBulkAction,bulkChanges,bulkActionValid,saveBulkAction,bulkActionPage,sowDetailContext,seed,animalType,typeDetails,productionOverview,productionAverages,productionRecords,feedBasis,feedTotals,updateFeedInput,openFeedEditor,feedEditorTargets,proposedPigAllocation,feedEditorValid,saveFeedEditor,pigAllocation,feedPreview,stageSummary,penFeedEntry,penFeedStatus,baseAllocation,feedBody,careAppearance,pigFeedTags,pigRow,overviewDetails,measurementAge,daysFromWalk,attentionOverview,validIndependentAdjustment,issueStatus,needsHealthAttention,closePenNote,undoPenNoteClose,eventCategory,filterLogEntries,logEntryDate,logDateBounds,visibleLogEntries,logDateDraftError,logFilterBar,categorizedLog,addEvent,penLogEntries,pigs,pig,penOf,picked,allocation,visiblePigs,applyRecord,saveHealth,saveBody,cases,matches,displayPigs,saveFinding,closeFinding,handleRecordAction};
if(typeof document==='undefined')return;
const embeddedSow=window.parent!==window&&new URLSearchParams(location.search).get('embed')==='sow';
let embeddedSowReady=false;
if(embeddedSow)document.documentElement.classList.add('inspection-embedded');
function sendSowDetail(type,c){window.parent.postMessage({type,context:{...c,toastTimer:undefined}},location.origin);}

const examples=[{title:'Walk & select',initial:'walk',caption:'Individual checkboxes name the pigs. Pen feeding stays in the pen header.'},{title:'Act on a finding',initial:'selected',caption:'One payload for a group; a separate entry per pig when the values differ.'},{title:'Read the feed plan',initial:'adlib',caption:'Feed is guidance: formula, timing and individual plans, with no completion record.'}];
const scenarios=[['walk','Unit walk'],['stage-times','Stage · elapsed days'],['animal-types','Types · boars and piglets'],['health-mixed','Attention · mixed items'],['health-ongoing','Disease · ongoing arthritis'],['health-many','Health · multiple ongoing conditions'],['care-states','Health · care states'],['sensors','Unit · connected sensors'],['no-sensors','Unit · no sensors'],['sensor-unavailable','Unit · sensor unavailable'],['no-batches','Unit · no batches'],['one-batch','Unit · one batch'],['many-batches','Unit · three batches'],['batch-farrowing','Unit · batch in farrowing'],['batch-concurrent','Unit · heat check and breeding'],['pen-signals','Pen · note and fault'],['pig-tasks','Pig · multiple current tasks'],['selected','Multiple pigs'],['feed','Pen feed'],['feed-bulk','Feed · multiple pens'],['pen-feed-up','Pen feed · increased'],['pen-feed-down','Pen feed · decreased'],['pen-feed-held','Pen feed · held'],['adlib','Ad-lib feeding'],['production-batches','Production · batch history'],['profile-full','Pig record · populated'],['profile-partial','Pig record · partial'],['profile-empty','Pig record · empty fields']];
const states=examples.map(e=>makeExample(e.initial));
const entryLens=new URLSearchParams(location.search).get('lens');
if(['Health','Feed'].includes(entryLens))states[0].lens=entryLens;
function makeExample(type){const c=seed();if(type==='pig-tasks'){c.pigId='000254';c.view='pig';pig(c,c.pigId).currentTasks=[{id:'vaccination',title:'Vaccination',type:'Health',status:'Due today',summary:'Scheduled vaccination'}];}if(type==='batch-concurrent'){const b=c.batches[0];b.stage='In heat';b.currentTasks=[{id:'heat-check',title:'In-heat check',startedAt:'2026-09-10',pigIds:b.pigIds.slice(0,2)},{id:'breeding',title:'Breeding',startedAt:'2026-09-11',pigIds:b.pigIds.slice(2)}];b.next='Pregnancy check';b.when='Mon · 5 Oct';b.nextDate='2026-10-05';b.pigIds.forEach(id=>{const p=pig(c,id);p.stage='In heat';p.stageStartedAt='2026-09-10';});}if(type==='batch-farrowing'){const b=c.batches[0];b.stage='Farrowing';b.stageStartedAt='2026-09-10';b.next='Weaning';b.when='Thu · 1 Oct';b.nextDate='2026-10-01';b.currentTask={id:'farrowing',title:'Farrowing',startedAt:b.stageStartedAt,completedPigIds:['000254','000267']};b.pigIds.forEach(id=>{const p=pig(c,id);p.stage=b.currentTask.completedPigIds.includes(id)?'Lactating':'Farrowing';p.stageStartedAt=b.stageStartedAt;});}if(type==='production-batches'){c.pigId='000281';c.view='pig-production';}if(type==='feed-bulk'){c.selectedPens=new Set(c.pens.map(pe=>pe.id));c.selected=new Set(pigs(c).map(p=>p.id));c.actionScope='pens';c.view='actions';}if(type.startsWith('pen-feed-'))c.pens[0].pigs.forEach(p=>{if(type==='pen-feed-held')p.feedHold=pigAllocation(p,c.pens[0]);else {p.factor=type==='pen-feed-up'?1.1:.95;p.adjustmentActive=true;}});if(type==='stage-times'||type==='animal-types'){const p=pig(c,'000312');p.stage='Off production';p.breedingStatus='Open';p.stageStartedAt='2026-09-04';p.batchId='21';c.batches[0].pigIds=c.batches[0].pigIds.filter(id=>id!==p.id);c.batches.push({id:'21',stage:'Off production',stageStartedAt:'2026-09-04',pigIds:[p.id],pens:['C2'],next:'Breeding review',when:'Today · 12 Sep',nextDate:'2026-09-12'});}if(type==='animal-types'){c.pens.push({id:'B1',mode:'adlib',formula:'Boar feed',faults:[],pigs:[{id:'B-024',type:'Boar',stage:'Boar',age:420,cases:[],initialRecords:[],registry:{type:'Boar',onFarm:true}}]},{id:'P1',mode:'adlib',formula:'Piglet starter',faults:[],pigs:[{id:'001104',type:'Piglet',stage:'Piglet',age:18,cases:[],initialRecords:[],registry:{type:'Piglet',onFarm:true}}]});}if(['walk','stage-times','animal-types','care-states','health-mixed','health-ongoing','health-many'].includes(type)){const p=pig(c,type==='health-mixed'?'000306':'000281');p.cases.push({name:'Arthritis',kind:'Disease',day:120,issueStatus:'ongoing',triage:'None',recordedDate:'15 May 2026',recordedBy:'G. Hansen',note:'Condition recorded. No action needed.'});if(type==='health-mixed'){Object.assign(p,{age:1080,weight:192,backfat:14,temperature:39.5,measurementDates:{weight:'2026-09-09',backfat:'2026-09-09',temperature:'2026-09-12'}});Object.assign(p.registry,{serviceDate:'3 Aug 2026',expectedFarrowing:'25 Nov 2026'});}p.initialRecords.push({category:'Health',title:'Condition recorded',note:'Arthritis · No action needed',time:'15 May 2026',who:'G. Hansen'});c.pigId=p.id;if(type==='health-many')p.cases.push({name:'Lameness',kind:'Symptom',day:45,issueStatus:'ongoing',triage:'None',recordedBy:'G. Hansen'},{name:'Coughing',kind:'Symptom',day:30,issueStatus:'ongoing',triage:'None',recordedBy:'G. Hansen'});if(['health-mixed','health-ongoing','health-many'].includes(type))c.view='pig';if(type==='care-states')pig(c,'000801').cases[0].triage='Hospital pen';}c.sensors=type==='no-sensors'?[]:[{label:'Temperature',icon:'temperature',value:22.4,unit:'°C',updated:'09:40 · '+unitName(c)},{label:'Humidity',icon:'humidity',value:64,unit:'%',updated:'09:40 · '+unitName(c)},{label:'Ammonia',icon:'air',value:8,unit:'ppm',updated:'09:40 · '+unitName(c)}];if(type==='pen-signals'){c.pens[0].faults=[{id:'fault-c1',device:'Drinking station',name:'Drinking station',description:'Leaking valve at the east end.',time:'06:40',who:'G. Hansen',open:true}];}if(type==='sensor-unavailable')c.sensors[1].value=null;if(type.startsWith('profile-')){c.pigId=type==='profile-full'?'000267':type==='profile-partial'?'000254':'000306';c.profileTab='details';c.view='pig';}if(type==='no-batches'){c.batches=[];c.pens.forEach(pe=>pe.pigs.forEach(p=>p.batchId=''));}if(type==='one-batch'){c.pens=c.pens.filter(pe=>pe.id!=='D4');c.batches=c.batches.filter(b=>b.id==='20');}if(type==='many-batches'){const b=c.batches[0];b.pigIds=c.pens[0].pigs.map(p=>p.id);b.pens=['C1'];c.pens[1].pigs.forEach(p=>p.batchId='21');c.batches.splice(1,0,{id:'21',stage:'Gestating',stageStartedAt:'2026-08-08',pigIds:c.pens[1].pigs.map(p=>p.id),pens:['C2'],next:'Pregnancy check',when:'Mon · 14 Sep',nextDate:'2026-09-14'});}if(type==='selected'){c.selected=new Set(['000254','000267']);c.view='actions';}if(type==='feed'||type==='adlib'){c.view='feed';c.penId=type==='feed'?'C1':'D4';}return c;}
const gallery=document.getElementById('gallery');
gallery.innerHTML=examples.map((e,i)=>`<article class="spec" data-card="${i}"><div class="spec-head"><div class="spec-title"><span>0${i+1}</span>${e.title}</div><select class="scenario" aria-label="Example for ${e.title}">${scenarios.map(([v,t])=>`<option value="${v}"${e.initial===v?' selected':''}>${t}</option>`).join('')}</select></div><div class="phone inspection-phone"></div><p class="caption">${e.caption}</p></article>`).join('');
function feedLabel(pe){return pe.mode==='adlib'?'Ad-lib':pe.mode==='station'?'Station-fed':quantity(allocation(pe))+' kg';}
// Choose a standard height for the form; catalogues grow with their available rows.
function drawerSize(view,c){
 if(view==='log-date-picker')return 'medium';
 if(view==='picker'){const n=c?.pickerOptions?.[c?.form?.pickerKey]?.items?.length||0;return n<=4?'short':'medium';}
 if(view==='record-optional')return 'short';if(view==='measurements-menu')return 'medium';if(view==='bulk-health-picker')return 'long';if(view==='medicine-picker')return c?.form?.bulk?'long':'medium';
 if(c?.form?.recordEditor&&bulkActionKinds.includes(view))return c.form.bulk?'long':['weight','temperature','backfat','note','body'].includes(view)?'short':'medium';
 if(view==='feed-editor'&&c?.form?.feedIds?.length===1)return 'medium';
 
 if(view==='actions'&&c?.actionScope!=='pens'){const n=actionCatalogue(c).groups.reduce((sum,g)=>sum+g.items.length,0);return n<=2?'short':n<=5?'medium':'long';}
 if(view==='unavailable-actions'&&c){const groups=unavailableActionGroups(c),n=groups.reduce((n,g)=>n+g.items.length,0);return n<=1?'short':n+groups.length<=5?'medium':'long';}
 const sizes={
  'feed-date':'short','feed-note':'short',complete:'short',home:'short',temperature:'short',backfat:'short',
  'batch-detail':'medium','pen-detail':'medium','pen-faults':'medium','pen-log':'medium','fault-form':'medium','fault-record':'medium',
  'pen-note':'short','read-pen-note':'short','selected-pen-note':'medium',
  'choose-fault-pen':'medium',note:'short',weight:'medium',triage:'medium',
  finish:'medium',equipment:'medium','switch-feed':'medium',
  'sow-transfer':'medium',actions:'long','unavailable-actions':'medium',miscarriage:'medium','production-task':'medium','batch-membership':'medium','batch-removal':'medium','not-in-pig':'medium',pig:'medium','pig-profile':'medium',feed:'medium',health:'long',
  'pig-production-batch':'medium','feed-breakdown':'medium','feed-editor':'long',body:'medium','individual-plan':'medium',treatment:'long',resolve:'medium',review:'medium',
  filters:'medium',history:'medium','unit-detail':'medium',environment:'medium',grid:'long',
  search:'medium',scan:'medium',condition:'medium',plan:'medium',report:'medium',exception:'medium'
 };
 return sizes[view]||'medium';
}
function sheet(c,title,scope,body,actions){const picker=['bulk-health-picker','medicine-picker'].includes(c.view);const bottomNavigation=(c.view==='actions'&&c.actionScope!=='pens'?actionCategoryNav(c):'')+(actions||'');const hasBottomBack=bottomNavigation.includes('data-action="back"');const heading=stHeading({title,description:scope,kind:'page',level:3,className:'sheet-page-heading'},'<h3>'+title+'</h3><p>'+scope+'</p>');const markup=`<button class="scrim" data-action="dismiss" aria-label="Dismiss ${title}"></button><section class="sheet${c.view==='actions'?' actions-sheet':''}" data-size="${drawerSize(c.view,c)}" role="dialog" aria-modal="true" aria-label="${title}" tabindex="-1"><div class="grab" aria-hidden="true"></div><header class="utility-header">${hasBottomBack?'':ib('back','back',picker?(c.view==='medicine-picker'&&c.form.medicineCategory?'Back to categories':'Back to '+(c.view==='medicine-picker'?'treatment':'record health')):'Back').replace('icon-button','icon-button drawer-header-back')}<div>${heading}</div></header>${c.view==='actions'&&c.selectedPens.size?'<div class="actions-subjects">'+scopeTabs(c)+'</div>':''}${c.view==='pig-log'?logFilterBar(c,pigLogEntries(c),'pig'):c.view==='pen-log'?logFilterBar(c,penLogEntries(c,c.penId),'pen'):''}<div class="sheet-body">${body}</div>${bottomNavigation}</section>`;return AstraSurfaces.present(markup,{page:AstraSurfaces.isPage('inspection',c.view,c),status:status()});}
function back(){return button('back','Back','button secondary');}
function scope(c){const ids=c.form.subjects||[...c.selected],pens=[...new Set(ids.map(id=>penOf(c,id)?.id))];return `${countLabel(ids.length)} · ${pens.join(' / ')}`;}
function action(a,k,title,sub,v=''){return stRow({action:a,title,description:sub,icon:icon(k),value:v,className:'action-item'});}
function textField(label,key,value='',placeholder=''){return `<label class="field">${label}<textarea data-field="${key}" placeholder="${placeholder}">${esc(value)}</textarea></label>`;}
function choices(items,current,key,group){return `<div class="choice-list">${items.map(([v,label,sub])=>`<label class="choice-option"><span>${label}${sub?`<small>${sub}</small>`:''}</span><input type="radio" name="${key}-${group}" data-field="${key}" value="${v}"${current===v?' checked':''}></label>`).join('')}</div>`;}
function selectionReviewGroup(label,items){
 if(!items.length)return '';
 const heading=stHeading({title:label,kind:'group',level:4},'<h4 class="action-group-label">'+esc(label)+'</h4>');
 const rows=items.map(item=>'<li class="st-row review-list-row"><span class="st-row-copy"><strong>'+esc(item.title)+'</strong><small>'+esc(item.detail)+'</small></span>'+button(item.action,'Remove','text-button',item.value).replace('<button','<button aria-label="'+esc(item.ariaLabel)+'"')+'</li>').join('');
 return heading+'<ul class="review-list st-panel st-row-group" aria-label="'+esc(label)+'">'+rows+'</ul>';
}
function legacyOverlay(c){
 if(c.view==='list')return '';
 if(c.view==='review')return sheet(c,'Selected',selectionLabel(c),selectionReviewGroup('Pens',[...c.selectedPens].map(id=>({title:id,detail:countLabel(pen(c,id).pigs.length),action:'unselect-pen',value:id,ariaLabel:'Remove pen '+id+' from selection'})))+selectionReviewGroup('Pigs',picked(c).map(p=>({title:p.id,detail:penOf(c,p.id).id+' · '+p.stage,action:'unselect',value:p.id,ariaLabel:'Remove pig '+p.id+' from selection'}))),footer(back(),button('actions','Actions','button primary','',!c.selected.size&&!c.selectedPens.size)));
 if(c.view==='note')return sheet(c,'Add a note',scope(c),textField('Note','note',c.form.note,'Write what the next person should know.'),footer(back(),button('save-record',`Save for ${countLabel(c.form.subjects.length)}`,'button primary','',!valid(c))));
 if(c.view==='weight'){const id=c.form.subjects[c.form.index],p=pig(c,id);return sheet(c,'Record weight',`${c.form.index+1} of ${c.form.subjects.length} · ${penOf(c,id).id} / ${id}`,`<div class="feed-feature"><p class="kicker">${p.stage}</p><strong class="word">${p.id}</strong><p>${p.weight?'Last recorded '+p.weight+' kg':'No previous weight recorded'}</p></div><label class="field">Weight · kg<input data-field="weight" inputmode="decimal" type="number" min="0.1" step="0.1" placeholder="0.0" value="${esc(c.form.weight||'')}"></label><p class="quiet-note">Each weight saves to this pig before moving to the next.</p>`,footer(back(),button('save-weight',c.form.index+1<c.form.subjects.length?'Save & next pig':'Save weight','button primary','',!valid(c))));}
 if(c.view==='pig'){const p=pig(c,c.pigId),pe=penOf(c,p.id);return sheet(c,p.id,`${pe.id} · ${p.stage} · ${p.parity?'parity '+p.parity:p.age+' days'}`,`${manual(p)?`<section class="detail-section"><h4>To do for this pig</h4><div class="instruction-detail">${esc(p.instruction)}<small>${esc(p.instructionBy)}</small></div></section>`:''}<section class="detail-section"><h4>Current observations</h4><p class="quiet-note">${esc(p.condition||'No open observation recorded')}${p.note?'<br>'+esc(p.note):''}</p></section><section class="detail-section"><h4>Feeding</h4><div class="detail-line"><span>${pe.formula}</span><strong>${pe.mode==='adlib'?'Ad-lib':quantity(p.base*p.factor)+' kg / day'}</strong></div><p class="quiet-note">${pe.mode==='adlib'?'No fixed individual ration.':pe.mode==='station'?'Delivered by the feeding station.':'Included in the shared pen allocation.'}${p.factor>1?' Condition support preset.':''}</p>${button('feed','View pen feeding '+icon('chevron'),'action-item',pe.id)}</section>${p.weight?`<div class="detail-line"><span>Last weight</span><strong>${p.weight} kg</strong></div>`:''}`,footer(back(),button('select-pig',c.selected.has(p.id)?'Return to selection':'Select this pig','button primary',p.id)));}
 if(c.view==='exception'){const pe=pen(c,c.penId);if(pe.mode==='station')return sheet(c,'Feeding exception',`Pen ${pe.id} · station-fed`,`${choices([['Feed not dispensed','Feed not dispensed'],['Pig did not visit','Pig did not visit'],['Other','Other']],c.form.choice,'choice',states.indexOf(c))}${textField('Note · optional','note',c.form.note,'Add the ear tag or equipment details.')}`,footer(back(),button('save-pen','Save exception','button primary','',!valid(c))));return sheet(c,'Record feed exception',`Pen ${pe.id} · ${countLabel(pe.pigs.length)}`,`<div class="detail-line"><span>Planned allocation today</span><strong>${quantity(allocation(pe))} kg</strong></div><label class="field">Actually delivered · kg<input type="number" min="0" step="0.1" inputmode="decimal" data-field="actual" value="${esc(c.form.actual||'')}" placeholder="Enter amount"></label>${choices([['Feed left over','Feed left over'],['Spillage','Spillage'],['Other','Other']],c.form.choice,'choice',states.indexOf(c))}${textField('Note · optional','note',c.form.note,'Why was the amount different?')}<p class="quiet-note">Records the delivery exception. The planned allocation is unchanged.</p>`,footer(back(),button('save-pen','Save exception','button primary','',!valid(c))));}
 if(c.view==='report')return sheet(c,'Report an issue',`Pen ${c.penId}`,`${choices([['Feeder empty','Feeder empty'],['Feed flow blocked','Feed flow blocked'],['Water point issue','Water point issue'],['Other','Other']],c.form.choice,'choice',states.indexOf(c))}${textField(c.form.choice==='Other'?'Describe the issue':'Note · optional','note',c.form.note,'Where is the problem?')}`,footer(back(),button('save-pen','Save issue','button primary','',!valid(c))));
 if(c.view==='history')return sheet(c,'This walk',unitName(c)+' · G. Hansen',`${c.events.map(e=>`<article class="walk-event"><strong>${esc(e.title)}</strong><p>${esc(e.subjects.join(' · '))}${e.note?'<br>'+esc(e.note):''}</p><small>${e.time} · ${e.who}</small></article>`).join('')||'<div class="empty-inspect"><strong>No updates yet</strong>Health findings, measurements and pen updates will appear here.</div>'}`,footer(back(),''));
 if(c.view==='finish')return sheet(c,'Finish walk',unitName(c),`<div class="feed-feature"><p class="kicker">Recorded during this walk</p><strong>${c.events.length}</strong><p>Updates already saved to their pigs or pens.</p></div><p class="quiet-note">Check in as G. Hansen to record that you walked this unit. This does not mark every pig as healthy or every instruction as completed.</p>`,footer(back(),button('check-in','Check in to '+unitName(c),'button primary')));
 if(c.view==='complete')return sheet(c,'Walk recorded',unitName(c),`<div class="walk-complete"><span class="complete-mark">${icon('check')}</span><h4>Checked in at 09:41</h4><p>G. Hansen · ${unitName(c)}<br>${c.events.length} ${c.events.length===1?'update':'updates'} recorded</p></div>`,footer(button('back','Back to unit','button primary'),''));
 if(c.view==='home')return sheet(c,'Today','Your work',`<div class="action-list st-panel st-row-group">${action('back','check','Inspection · '+unitName(c),c.checkedIn?'Checked in at 09:41':'Last check-in 06:40')}</div>`,footer(back(),''));
 if(c.view==='grid')return penMapSheet(c);
 if(c.view==='search'||c.view==='scan')return sheet(c,c.view==='scan'?'Scan ear tag':'Find a pig',unitName(c),`${c.view==='scan'?`<p class="quiet-note">Camera scanning is not connected in this prototype.</p>${button('sample-scan','Try sample tag 000306','button secondary')}`:''}<label class="field inspect-search">Ear tag or pen<input type="search" data-search placeholder="e.g. 000254 or C1" value="${esc(c.query)}"></label><div class="search-results">${searchResults(c)}</div>`,footer(back(),''));
 return '';
}
function inspectionPenFact(c,pe){
 if(!pe)return {text:'Not in unit',kind:'empty',rows:[]};
 const rows=visiblePigs(c,pe);if(!rows.length)return {text:'No matches',kind:'empty',rows};
 const health=rows.filter(p=>cases(p).length).length;
 return {rows,text:health?health+' health':countLabel(rows.length),kind:health?'due':'waiting'};
}
function penMapSheet(c){
 const cells=Array.from({length:6},(_,row)=>'<span class="map-row-label">'+(row+1)+'</span>'+['A','B','C','D'].map(col=>{
  const id=col+(row+1),f=inspectionPenFact(c,pen(c,id));
  return button('jump','<strong>'+id+'</strong><small>'+esc(f.text)+'</small>','pen-cell '+f.kind+(c.currentPen===id?' current':''),id,!f.rows.length).replace('<button','<button aria-label="Pen '+id+', '+esc(f.text)+'"'+(c.currentPen===id?' aria-current="location"':''));
 }).join('')).join('');
 return sheet(c,'Go to pen',unitName(c),'<p class="picker-intro">Tap a pen to go to its pigs. Hold to peek.</p><div class="pen-map"><span></span>'+['A','B','C','D'].map(x=>'<span class="map-column-label">'+x+'</span>').join('')+cells+'</div><p class="picker-note">Pen layout · only pens matching this view can be opened.</p><div class="pen-peek" role="status" hidden></div>','').replace('class="sheet"','class="sheet room-utility picker-sheet"');
}
function inspectionPenPreview(c,id){
 const pe=pen(c,id),rows=visiblePigs(c,pe),health=rows.filter(p=>cases(p).length),guides=rows.filter(manual),faults=[];
 const feed=pe.mode==='trough'?quantity(allocation(pe))+' kg / day · '+pe.formula:pe.mode==='station'?'Station-fed · '+pe.formula:'Ad-lib · '+pe.formula;
 return '<strong>'+id+' · '+countLabel(pe.pigs.length)+'</strong>'+(rows.length!==pe.pigs.length?'<p>'+countLabel(rows.length)+' in this view</p>':'')+'<p>'+esc(feed)+(pe.switchDue?'<br>Formula change due':'')+'</p>'+health.slice(0,3).map(p=>'<p><b>'+p.id+'</b> · '+cases(p).map(k=>esc(k.name)).join(' · ')+'</p>').join('')+(health.length>3?'<p>+'+(health.length-3)+' more pigs with health findings</p>':'')+(guides.length?'<p>'+guides.length+' '+(guides.length===1?'pig has':'pigs have')+' individual feed guidance</p>':'')+(pe.note?'<p>Pen note available</p>':'')+(faults.length?'<p>'+faults.length+' open '+(faults.length===1?'fault':'faults')+' · '+esc(faults[0].device)+'</p>':'');
}
function searchResults(c){const q=c.query.trim().toLowerCase(),rows=pigs(c).filter(p=>!q||p.id.includes(q)||penOf(c,p.id).id.toLowerCase().includes(q));return `<p class="quiet-note">${countLabel(rows.length)} found</p>${rows.length?`<div class="search-result-list st-panel st-row-group">${rows.map(p=>action('search-pig','profile',p.id,penOf(c,p.id).id+' · '+p.stage,p.id)).join('')}</div>`:'<p class="quiet-note">No matching pigs in this unit.</p>'}`;}
function legacyValid(c){const f=c.form;if(c.view==='condition'||c.view==='report')return !!f.choice&&(f.choice!=='Other'||!!f.note?.trim());if(c.view==='note')return !!f.note?.trim();if(c.view==='weight')return !!f.weight&&Number.isFinite(+f.weight)&&+f.weight>0;if(c.view==='plan')return !!f.preset;if(c.view==='exception')return !!f.choice&&(pen(c,c.penId).mode==='station'||f.actual!==''&&f.actual!=null&&Number.isFinite(+f.actual)&&+f.actual>=0);return true;}
function notify(c,text){c.toast=text;c.toastUntil=Date.now()+3200;clearTimeout(c.toastTimer);c.toastTimer=setTimeout(()=>{c.toast='';const i=states.indexOf(c);document.querySelector(`[data-card="${i}"] .inspect-toast`)?.remove();},3200);}
function inspectionSurface(c){
 const content=overlay(c);
 if(AstraSurfaces.isPage('inspection',c.view,c)||c.isDrawerBackground||['record-optional','feed-date','feed-note','medicine-picker','bulk-health-picker','picker'].includes(c.view))return content;
 const parent=[...(c.navTrail||[])].reverse().find(p=>AstraSurfaces.isPage('inspection',p.view,{...c,...p}));
 if(!parent)return content;
 return '<div class="page-background" inert aria-hidden="true">'+overlay({...c,...parent,isDrawerBackground:true})+'</div>'+content;
}
function render(i,focus){if(states[i].actionEntry&&states[i].view==='list'&&states[i].returnAfterActionSave){states[i].selected=new Set([states[i].actionEntry]);states[i].actionScope='pigs';states[i].view='actions';states[i].restoreSheetScroll=states[i].actionMenuScroll||0;}delete states[i].returnAfterActionSave;settleDetailNavigation(states[i]);if(embeddedSow&&embeddedSowReady&&i===0){sendSowDetail(states[i].view==='list'?'sow-detail-close':'sow-detail-state',states[i]);if(states[i].view==='list')return;}const c=states[i],root=gallery.querySelector(`[data-card="${i}"]`),previous=root.dataset.view;const active=document.activeElement;const focusKey=active&&root.contains(active)?['data-v2','data-condition','data-verdict','data-log-category','data-log-date-field','data-feed-edit'].find(k=>active.hasAttribute(k)):null;const focusValue=focusKey?active.getAttribute(focusKey):null;const catalogScroll=root.querySelector('.health-catalog')?.scrollTop||0;const sheetScroll=previous===c.view?root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0:0;root.dataset.view=c.view;root.querySelector('.phone').innerHTML=main(c)+inspectionSurface(c)+(c.toast&&Date.now()<c.toastUntil?`<div class="inspect-toast" role="status">${esc(c.toast)}</div>`:'');fitRecordedTags(root);if(previous!==c.view)root.querySelector('.phone > .sheet')?.classList.add('drawer-enter');const parentList=root.querySelector('.bulk-pig-list,.feed-pig-rows');if(parentList&&c.form?.parentListScroll!=null)parentList.scrollTop=c.form.parentListScroll;const pigTaskRail=root.querySelector('.pig-current-task-list');if(pigTaskRail)pigTaskRail.scrollLeft=c.pigTaskRailScroll?.[c.pigId]||0;const taskRail=root.querySelector('.sow-task-rail');if(taskRail){taskRail.scrollLeft=c.taskRailScroll||0;}root.querySelector('.inspect-list').style.paddingBottom=(c.tailSpace||18)+'px';root.querySelector('.inspect-scroll').scrollTop=c.scroll;const carousel=root.querySelector('.batch-carousel');if(carousel)carousel.scrollLeft=c.batchScroll||0;root.querySelectorAll('[data-mixed]').forEach(x=>x.indeterminate=x.dataset.mixed==='true');if(root.querySelector('.phone > .sheet > .sheet-body'))root.querySelector('.phone > .sheet > .sheet-body').scrollTop=c.restoreSheetScroll??sheetScroll;delete c.restoreSheetScroll;if(previous!==c.view)root.querySelector(c.view==='list'?'.inspect-scroll':'.phone > .sheet')?.focus({preventScroll:true});if(focus){const el=[...root.querySelectorAll('[data-action],[data-pig-select],[data-pen-select],[data-field]')].find(e=>focus.a?e.dataset.action===focus.a&&e.dataset.value===focus.v:focus.p?e.dataset.pigSelect===focus.p:focus.pe?e.dataset.penSelect===focus.pe:e.dataset.field===focus.f&&e.value===focus.v);(el||root.querySelector(c.view==='weight'?'[data-field="weight"]':c.view==='list'?'.inspect-scroll':'.phone > .sheet'))?.focus({preventScroll:true});}if(root.querySelector('.health-catalog'))root.querySelector('.health-catalog').scrollTop=catalogScroll;if(focusKey&&previous===c.view){[...root.querySelectorAll('['+focusKey+']')].find(x=>x.getAttribute(focusKey)===focusValue)?.focus({preventScroll:true});}if(c.logDateFocus){root.querySelector(c.logDateFocus==='dialog'?'.phone > .sheet [data-action="log-date-preset"][aria-pressed="true"]':'.phone > .sheet [data-action="log-date-open"]')?.focus({preventScroll:true});delete c.logDateFocus;}const list=root.querySelector('.inspect-list');list.style.paddingBottom=(c.tailSpace||18)+'px';if(c.jump){const target=root.querySelector(`[data-pen="${c.jump}"]`),scroll=root.querySelector('.inspect-scroll'),sticky=root.querySelector('.inspect-controls').offsetHeight;if(target){c.tailSpace=Math.max(18,scroll.clientHeight-sticky-target.offsetHeight);list.style.paddingBottom=c.tailSpace+'px';scroll.scrollTop+=target.getBoundingClientRect().top-scroll.getBoundingClientRect().top-sticky;target.classList.add('arrival');setTimeout(()=>target.classList.remove('arrival'),900);}c.scroll=scroll.scrollTop;c.jump=null;}}
function backTo(c){if(c.view==='picker'){c.view=c.form.pickerReturn||'list';delete c.form.pickerKey;delete c.form.pickerReturn;return;}if(c.navTrail?.length){const parent=c.navTrail.pop();Object.assign(c,parent);c.restoreSheetScroll=parent.sheetScroll;return;}if(['health','body','individual-plan','resolve','triage','temperature','backfat','treatment'].includes(c.view)){c.form={};c.view='actions';return;}if(['fault-form','fault-record','pen-note'].includes(c.view)){c.view='pen-detail';return;}if(['condition','note','plan','weight'].includes(c.view)){c.form={};c.view='actions';}else if(['report','exception'].includes(c.view)){c.form={};c.view='feed';}else if(c.view==='review')c.view=c.reviewBack||'actions';else c.view='list';}

// Detail sheets return to the actual entry page; form values are discarded on Back.
function detailLocation(c){return {view:c.view,productionRecordId:c.productionRecordId,penId:c.penId,pigId:c.pigId,batchId:c.batchId,faultId:c.faultId,closedNoteId:c.closedNoteId,findingName:c.findingName,profileTab:c.profileTab,feedTab:c.feedTab,form:JSON.parse(JSON.stringify(c.form||{}))};}
function sameDetail(a,b){return a.view===b.view&&(!['pen-detail','pen-faults','pen-log','feed','fault-form','pen-note','read-pen-note'].includes(a.view)||a.penId===b.penId)&&(!['pig','pig-profile','pig-production','pig-origin','pig-log','pig-feed','pig-feed-curve','pig-feed-changes','finding','finding-edit','finding-close'].includes(a.view)||a.pigId===b.pigId)&&(!['finding','finding-edit','finding-close'].includes(a.view)||a.findingName===b.findingName)&&(a.view!=='pig-production-batch'||a.productionRecordId===b.productionRecordId)&&(a.view!=='batch-detail'||a.batchId===b.batchId)&&(a.view!=='fault-record'||a.faultId===b.faultId);}
function settleDetailNavigation(c){
 const origin=c.navOrigin;delete c.navOrigin;
 if(c.view==='list'){c.navTrail=[];return;}
 if(origin&&!sameDetail(origin,c)){
  c.navTrail=c.navTrail||[];
  const existing=c.navTrail.findLastIndex(p=>sameDetail(p,c));
  if(existing>=0){c.restoreSheetScroll=c.navTrail[existing].sheetScroll;c.navTrail.length=existing;}
  else c.navTrail.push(origin);
 }else if(!origin&&c.navTrail?.length){
  const existing=c.navTrail.findLastIndex(p=>sameDetail(p,c));
  if(existing>=0){c.restoreSheetScroll=c.navTrail[existing].sheetScroll;c.navTrail.length=existing;}
 }
}
function installDetailNavigation(){
 const links=new Set(['production-task','batch-membership','miscarriage','unavailable-actions','measurements-menu','feed-breakdown','pig-production-batch','feed-edit-pen','feed-edit-selected','finding','finding-edit','finding-close','finding-treat','pig-feed','pig-adjustment','pig-profile','pig-production','pig-origin','pig-log','pig-feed-curve','pig-feed-changes','actions','pig-actions','pen-detail','pen-faults','pen-log','read-pen-note','feed','pig','search-pig','unit-detail','environment','batch-detail','equipment','history','new-fault','fault-record','pen-note','selected-fault','selected-pen-note','review-sheet','edit-conditions','health','body','individual-plan','resolve','triage','temperature','backfat','treatment','note','weight']);
 gallery.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
  const root=el.closest('[data-card]');if(!root)return;
  const i=+root.dataset.card,c=states[i],a=el.dataset.action;
  if(['bulk-pick-health','medicine-open','record-optional-open','feed-optional-open','open-picker'].includes(a)){c.form.parentListScroll=root.querySelector('.bulk-pig-list,.feed-pig-rows')?.scrollTop||0;}
  if(a==='log-date-open')c.logDateScroll=root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0;
  if(c.logDatePicker&&(a==='back'||a==='dismiss')){e.stopImmediatePropagation();handleRecordAction(c,'log-date-cancel');render(i);return;}
  if(c.view==='medicine-picker'&&(a==='back'||a==='dismiss')){e.stopImmediatePropagation();if(a==='back'&&c.form.medicineCategory){c.form.medicineCategory='';c.form.medicineSearch='';}else c.view='treatment';render(i);return;}
  if(c.view==='record-optional'&&(a==='back'||a==='dismiss')){e.stopImmediatePropagation();c.view=c.form.optionalReturn;delete c.form.optionalDraft;render(i);return;}
  if(c.view==='picker'&&(a==='back'||a==='dismiss')){e.stopImmediatePropagation();c.view=c.form.pickerReturn||'list';delete c.form.pickerKey;delete c.form.pickerReturn;render(i);return;}
  if(c.view==='bulk-health-picker'&&(a==='back'||a==='dismiss')){e.stopImmediatePropagation();if(c.form.conditionsBeforePicker)c.form.conditions=c.form.conditionsBeforePicker;delete c.form.conditionsBeforePicker;c.view='health';render(i);return;}
  if((c.view==='feed-date'||c.view==='feed-note')&&(a==='back'||a==='dismiss')){e.stopImmediatePropagation();delete c.form.optionalDraft;c.view='feed-editor';render(i);return;}
  if(a==='back'&&c.navTrail?.length){e.stopImmediatePropagation();const parent=c.navTrail.pop();Object.assign(c,parent);c.restoreSheetScroll=parent.sheetScroll;render(i);return;}
  if(a==='dismiss'){c.navTrail=[];delete c.navOrigin;return;}
  if(links.has(a)){c.navOrigin={...detailLocation(c),sheetScroll:root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0};}
 },true);
}

const rosterSizeObserver=new ResizeObserver(()=>fitRecordedTags(gallery));gallery.querySelectorAll('.phone').forEach(phone=>rosterSizeObserver.observe(phone));document.fonts.ready.then(()=>fitRecordedTags(gallery));
gallery.addEventListener('click',e=>{
 const el=e.target.closest('[data-action]'),root=el?.closest('[data-card]');if(!el||!root)return;const i=+root.dataset.card,c=states[i],a=el.dataset.action,v=el.dataset.value;
 if(a==='open-farrowing'){e.stopImmediatePropagation();if(embeddedSow)window.parent.postMessage({type:'sow-action',action:'current-task',taskId:'farrowing',context:{...c,toastTimer:undefined}},location.origin);else location.href='farrowing-astra-concept.html?layout=focus';return;}
 if(a==='sow-current-task'){e.stopImmediatePropagation();const subject=pig(c,c.pigId)||picked(c)[0],task=currentTasksForPig(c,subject).find(t=>t.id===v);if(!task||!subject||c.selectedPens.size)return;c.selected=new Set([subject.id]);c.actionMenuScroll=root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0;if(['farrowing','piglet-processing'].includes(task.id)&&embeddedSow)window.parent.postMessage({type:'sow-action',action:'current-task',taskId:task.id,context:{...c,toastTimer:undefined}},location.origin);else{c.navTrail=c.navTrail||[];c.navTrail.push({...detailLocation(c),sheetScroll:c.actionMenuScroll});if((task.type||'').toLowerCase()==='health'||/vaccin/i.test(task.title||'')){openBulkAction(c,'treatment');c.form.taskId=task.id;}else openProductionTask(c,task,subject);render(i);}return;}
 if(a==='action-category'){e.stopImmediatePropagation();const body=root.querySelector('.actions-sheet .sheet-body'),target=body?.querySelector(`[data-action-group="${v}"]`);if(target){if(v==='production'&&c.hostTasks?.length)body.scrollTop=0;else body.scrollTop+=target.getBoundingClientRect().top-body.getBoundingClientRect().top-12;c.actionCategoryJump={id:v,scrollTop:body.scrollTop};updateActionCategory(root,c);}return;}
 if(a==='unavailable-actions'){e.stopImmediatePropagation();c.actionMenuScroll=root.querySelector('.phone > .sheet > .sheet-body').scrollTop;c.navTrail=c.navTrail||[];c.navTrail.push({...detailLocation(c),sheetScroll:c.actionMenuScroll});c.view='unavailable-actions';render(i);return;}
 if(a==='sow-host-action'){e.stopImmediatePropagation();if(picked(c).length!==1||c.selectedPens.size)return;const entry=c.hostActions?.find(x=>x.id===v&&!x.reason);if(!entry||!embeddedSow)return;c.actionMenuScroll=root.querySelector('.phone > .sheet > .sheet-body').scrollTop;if(v==='transfer'){c.navTrail=c.navTrail||[];c.navTrail.push({...detailLocation(c),sheetScroll:c.actionMenuScroll});c.transferDraft={unit:'',pen:''};c.view='sow-transfer';render(i);}else if(v==='miscarriage'){c.navTrail=c.navTrail||[];c.navTrail.push({...detailLocation(c),sheetScroll:c.actionMenuScroll});c.view='miscarriage';c.lossReason='';render(i);}else if(['remove-batch','not-in-pig'].includes(v)){c.navTrail=c.navTrail||[];c.navTrail.push({...detailLocation(c),sheetScroll:c.actionMenuScroll});c.form={dispositionReason:'',dispositionNote:''};c.view=v==='remove-batch'?'batch-removal':'not-in-pig';render(i);}else window.parent.postMessage({type:'sow-action',action:v,context:{...c,toastTimer:undefined}},location.origin);return;}
 if(a==='save-transfer'){e.stopImmediatePropagation();if(picked(c).length===1&&!c.selectedPens.size&&transferReady(c))window.parent.postMessage({type:'sow-action',action:'save-transfer',unit:c.transferDraft.unit,pen:c.transferDraft.pen,context:{...c,toastTimer:undefined}},location.origin);return;}
 if(a==='save-miscarriage'){e.stopImmediatePropagation();if(picked(c).length!==1||c.selectedPens.size||!c.lossReason?.trim())return;if(embeddedSow&&c.hostActions?.some(x=>x.id==='miscarriage'&&!x.reason))window.parent.postMessage({type:'sow-action',action:'save-miscarriage',reason:c.lossReason.trim(),context:{...c,toastTimer:undefined}},location.origin);else {saveMiscarriage(c);render(i);}return;}
 if(['save-batch-removal','save-not-in-pig'].includes(a)){e.stopImmediatePropagation();if(picked(c).length===1&&!c.selectedPens.size&&c.form.dispositionReason)window.parent.postMessage({type:'sow-action',action:a,reason:c.form.dispositionReason,note:(c.form.dispositionNote||'').trim(),context:{...c,toastTimer:undefined}},location.origin);return;}
 if(c.actionEntry&&a.startsWith('save-')&&!el.disabled)c.returnAfterActionSave=true;
 if(c.view==='actions')c.actionMenuScroll=root.querySelector('.phone > .sheet > .sheet-body')?.scrollTop||0;
},true);
gallery.addEventListener('scroll',e=>{if(e.target.matches('.pig-current-task-list')){const root=e.target.closest('[data-card]'),c=states[+root.dataset.card];(c.pigTaskRailScroll||={})[c.pigId]=e.target.scrollLeft;}if(e.target.matches('.sow-task-rail')){const root=e.target.closest('[data-card]');states[+root.dataset.card].taskRailScroll=e.target.scrollLeft;}if(e.target.matches('.actions-sheet .sheet-body')){const root=e.target.closest('[data-card]');updateActionCategory(root,states[+root.dataset.card]);}},true);
gallery.addEventListener('input',e=>{if(!e.target.matches('[data-loss-reason]'))return;const root=e.target.closest('[data-card]'),c=states[+root.dataset.card];c.lossReason=e.target.value;root.querySelector('[data-action="save-miscarriage"]').disabled=!c.lossReason.trim();});
installDetailNavigation();
installV2();
// Match farrowing's hold-to-peek gesture without turning a hold into navigation.
let penPeekTimer=null,penPeekGesture=null;
function stopPenPeek(){clearTimeout(penPeekTimer);if(penPeekGesture){penPeekGesture.root.querySelector('.pen-peek')?.setAttribute('hidden','');}penPeekGesture=null;}
gallery.addEventListener('pointerdown',e=>{const cell=e.target.closest('.pen-cell:not(:disabled)');if(!cell||e.button!==0)return;stopPenPeek();const root=cell.closest('[data-card]'),c=states[+root.dataset.card];c.peek=null;penPeekGesture={root,x:e.clientX,y:e.clientY};penPeekTimer=setTimeout(()=>{if(!penPeekGesture||!cell.isConnected)return;c.peek=cell.dataset.value;const preview=root.querySelector('.pen-peek');preview.innerHTML=inspectionPenPreview(c,c.peek);preview.hidden=false;},350);});
gallery.addEventListener('pointermove',e=>{if(penPeekGesture&&Math.hypot(e.clientX-penPeekGesture.x,e.clientY-penPeekGesture.y)>12)stopPenPeek();});
gallery.addEventListener('pointerup',stopPenPeek);gallery.addEventListener('pointercancel',stopPenPeek);window.addEventListener('blur',stopPenPeek);
gallery.addEventListener('contextmenu',e=>{if(e.target.closest('.pen-cell'))e.preventDefault();});
gallery.addEventListener('scroll',e=>{if(e.target.matches('.sheet-body,.inspect-scroll'))showMobileScrollIndicator(e.target);if(e.target.matches('.batch-carousel')){const root=e.target.closest('[data-card]'),c=states[+root.dataset.card];c.batchScroll=e.target.scrollLeft;}if(e.target.matches('.inspect-scroll')){const root=e.target.closest('[data-card]'),c=states[+root.dataset.card];c.scroll=e.target.scrollTop;if(c.view==='list'){const edge=e.target.getBoundingClientRect().top+root.querySelector('.inspect-controls').offsetHeight,items=[...e.target.querySelectorAll('[data-pen]')],current=items.find(p=>p.getBoundingClientRect().bottom>edge+12);if(current){c.currentPen=current.dataset.pen;const label=root.querySelector('.dock-pen>span');if(label)label.innerHTML=c.currentPen+'<small>Go to pen</small>';}}}},true);
gallery.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const i=+el.closest('[data-card]').dataset.card,c=states[i],a=el.dataset.action,v=el.dataset.value,old=c.view;
 if(a==='back')backTo(c);else if(a==='dismiss'){c.form={};c.view='list';}
 else if(a==='lens'){c.lens=v;c.reviewOnly=false;c.scroll=0;}
 else if(a==='clear'){c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;c.view='list';}
 else if(a==='actions'){if(c.selected.size||c.selectedPens.size){c.form={};c.actionScope=c.selected.size?'pigs':'pens';c.view='actions';}}
 else if(a==='review'){c.reviewOnly=!c.reviewOnly;}
 else if(a==='review-sheet'){c.reviewBack=c.view;c.view='review';}
 else if(a==='unselect'){c.selected.delete(v);}
 else if(a==='unselect-pen'){c.selectedPens.delete(v);c.actionScope=c.selectedPens.size?'pens':'pigs';}
 else if(['condition','note','weight','plan'].includes(a)){if(c.selected.size){c.form={subjects:[...c.selected],choice:'',note:'',preset:'',review:7,index:0,weight:''};c.view=a;}}
 else if(a==='save-record'&&valid(c)){const n=c.form.subjects.length;if(applyRecord(c))notify(c,`Saved for ${countLabel(n)}`);}
 else if(a==='save-weight'&&valid(c)){const id=c.form.subjects[c.form.index],p=pig(c,id);p.weight=+c.form.weight;(p.measurementDates||={}).weight=walkDate;p.last='Weight recorded just now';addEvent(c,'Weight recorded',[id],p.weight+' kg');c.selected.delete(id);if(++c.form.index<c.form.subjects.length)c.form.weight='';else{c.view='list';c.reviewOnly=false;notify(c,'Weights saved');}}
 else if(a==='pig'||a==='search-pig'){c.pigId=v;c.view='pig';}
 else if(a==='select-pig'){c.selected.add(v);c.view='list';}
 else if(a==='feed'){c.penId=v;c.view='feed';}
 else if(a==='select-pen-pigs'){pen(c,v).pigs.forEach(p=>c.selected.add(p.id));c.view='list';}
 else if(a==='report'||a==='exception'){c.form={choice:'',note:'',actual:''};c.view=a;}
 else if(a==='save-pen'&&valid(c)){const pe=pen(c,c.penId),f=c.form;if(c.view==='report'){pe.issue=f.choice;pe.issueTime='09:41';}pe.last=f.choice+(f.actual!==''&&f.actual!=null?' · '+f.actual+' kg delivered':'')+' · 09:41';addEvent(c,c.view==='report'?'Pen issue':'Feeding exception',[pe.id],pe.last+(f.note?' · '+f.note:''));c.view='feed';c.form={};notify(c,'Saved to pen '+pe.id);}
 else if(a==='check-in'){c.checkedIn=true;c.view='complete';}
 else if(a==='jump'){if(c.peek===v){c.peek=null;return;}if(!pen(c,v)||!visiblePigs(c,pen(c,v)).length)return;c.currentPen=v;c.jump=v;c.view='list';}
 else if(a==='sample-scan'){c.pigId='000306';c.view='pig';}
 else if(['history','finish','home','grid','search','scan'].includes(a)){c.query='';c.view=a;}
 render(i,old===c.view?{a,v}:null);
});
gallery.addEventListener('change',e=>{const el=e.target,root=el.closest('[data-card]');if(!root)return;const i=+root.dataset.card,c=states[i];if(el.matches('.scenario')){clearTimeout(c.toastTimer);states[i]=makeExample(el.value);render(i);return;}if(el.dataset.pigSelect){c.actionScope='pigs';el.checked?c.selected.add(el.dataset.pigSelect):c.selected.delete(el.dataset.pigSelect);if(!c.selected.size)c.reviewOnly=false;render(i,{p:el.dataset.pigSelect});}else if(el.dataset.penSelect){el.checked?c.selectedPens.add(el.dataset.penSelect):c.selectedPens.delete(el.dataset.penSelect);c.actionScope=c.selectedPens.size?'pens':'pigs';displayPigs(c,pen(c,el.dataset.penSelect)).forEach(p=>el.checked?c.selected.add(p.id):c.selected.delete(p.id));if(!c.selected.size)c.reviewOnly=false;render(i,{pe:el.dataset.penSelect});}else if(el.dataset.field&&el.type!=='textarea'&&el.type!=='number'){c.form[el.dataset.field]=el.value;render(i,{f:el.dataset.field,v:el.value});}});
gallery.addEventListener('input',e=>{const el=e.target,i=+el.closest('[data-card]').dataset.card,c=states[i];if(el.matches('[data-search]')){c.query=el.value;el.closest('.sheet').querySelector('.search-results').innerHTML=searchResults(c);return;}if(el.dataset.field){c.form[el.dataset.field]=el.value;const save=el.closest('.sheet')?.querySelector('[data-action="save-record"],[data-action="save-weight"],[data-action="save-pen"]');if(save)save.disabled=!valid(c);}});
gallery.addEventListener('keydown',e=>{const root=e.target.closest('[data-card]');if(!root)return;const i=+root.dataset.card,c=states[i];if(e.key==='Escape'){if(c.logDatePicker){e.preventDefault();handleRecordAction(c,'log-date-cancel');render(i);return;}if(c.view!=='list'){backTo(c);render(i);}else if(c.selected.size||c.selectedPens.size){c.selected.clear();c.selectedPens?.clear();c.reviewOnly=false;render(i);}return;}const sheet=e.target.closest('.sheet');if(e.key==='Tab'&&sheet){const items=[...sheet.querySelectorAll('button:not(:disabled),input,textarea,select,summary')],first=items[0],last=items.at(-1);if(e.shiftKey&&e.target===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&e.target===last){e.preventDefault();first.focus();}}});
document.addEventListener('pointerdown',()=>document.documentElement.dataset.inputMode='pointer',true);document.addEventListener('keydown',()=>delete document.documentElement.dataset.inputMode,true);
document.getElementById('reset-all').onclick=()=>{states.forEach((c,i)=>{clearTimeout(c.toastTimer);states[i]=makeExample(examples[i].initial);gallery.querySelector(`[data-card="${i}"] .scenario`).value=examples[i].initial;render(i);});};
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{gallery.classList.toggle('focus',b.dataset.layout==='focus');document.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const url=new URL(location.href);url.searchParams.set('layout',b.dataset.layout);history.replaceState(null,'',url);});
if(embeddedSow)window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==window.parent||e.data?.type!=='open-sow-detail')return;
 const r=e.data.record;if(!r||typeof r.id!=='string'||typeof r.pen!=='string')return;
 states[0]=sowDetailContext(r,e.data.context);states[0].hostActions=e.data.actions||[];states[0].transferDestinations=e.data.destinations||[];const origin=states[0].transferDestinations.find(u=>u.name===r.unit);states[0].transferOrigin=origin?{unit:origin.id,name:origin.name}:null;states[0].hostTasks=(e.data.tasks||[]).filter(t=>!states[0].completedHostTasks?.includes(t.id));if(e.data.entry==='actions'){states[0].selected=new Set([r.id]);states[0].actionScope='pigs';states[0].view='actions';states[0].actionEntry=r.id;states[0].restoreSheetScroll=states[0].actionMenuScroll||0;}else delete states[0].actionEntry;embeddedSowReady=true;document.documentElement.classList.add('inspection-embedded-ready');render(0);
});
states.forEach((_,i)=>render(i));if(new URLSearchParams(location.search).get('layout')==='overview')document.querySelector('[data-layout="overview"]').click();
})();
