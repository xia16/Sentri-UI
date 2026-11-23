// One pen picker for Inspection moves, scan exceptions and Farrowing.
(function(root){
'use strict';
const zh=new URLSearchParams(root.location?.search||'').get('lang')==='zh';
const t=(en,cn)=>zh?cn:en;
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const sortCodes=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
const normalize=q=>q.trim().toLowerCase().replace(/\s+/g,'');
const penCount=n=>t(n+(n===1?' pen':' pens'),n+' 个栏');
const place=(room,code)=>[room.zone,room.section!==room.name?room.section:null,room.name,code].filter(Boolean).join(' · ');

function layout(codes){
 const ends=new Map(),apart=[];
 for(const code of codes){
  const m=/^([A-Z]+)([1-9]\d*)$/.exec(code);
  if(m)ends.set(m[1],Math.max(+m[2],ends.get(m[1])||0));
  else apart.push({code});
 }
 return {lanes:[...ends.keys()].sort(sortCodes).map(letter=>({letter,n:ends.get(letter)})),apart};
}
function codesFor({lanes=[],depth=6,rows=[],apart=[]}){
 const runSize=runs=>runs.reduce((n,r)=>n+r.n,0);
 const codes=(letter,n)=>Array.from({length:n},(_,i)=>letter+(i+1));
 return [...lanes.flatMap((l,i)=>typeof l==='string'?codes(l,depth):codes(l.letter||String.fromCharCode(65+i),l.runs?.length?runSize(l.runs):l.n||depth)),
  ...rows.flatMap((r,i)=>codes(r.letter||String.fromCharCode(65+lanes.length+i),runSize(r.runs))),...apart.map(p=>p.code)];
}
const unavailable=pen=>pen.registered===false||pen.available===false?t('Pen unavailable','栏位不可用'):
 pen.full?t('Pen full','栏位已满'):pen.allowed===false?t('No permission','无权限'):'';

function results({room,query='',selected='',current='',action,key,blocked={}}){
 const q=normalize(query),pens=room.pens.filter(p=>p.registered!==false);
 if(!pens.length)return SentriUI.choiceEmpty(t('No registered pens','没有登记的栏位'),{icon:'search'});
 const disabled=Object.fromEntries(pens.map(p=>[p.id,blocked[p.id]||unavailable(p)]).filter(([,reason])=>reason));
 if(q||pens.length===1){
  const found=pens.filter(p=>normalize(p.id).includes(q)).sort((a,b)=>sortCodes(a.id,b.id));
  return found.length?SentriUI.chooserList(found.map(p=>SentriUI.choiceRow({
   label:p.id,meta:disabled[p.id]||place(room),mono:true,action,value:p.id,mode:'single',selected:selected===p.id,disabled:!!disabled[p.id],reason:disabled[p.id]
  })).join('')):SentriUI.choiceEmpty(t('Try another pen code.','试试其他栏号。'),{title:t('No matching pens','没有匹配的栏位'),icon:'search'});
 }
 return SentriUI.penMap({
  ...(room.layout||layout(pens.map(p=>p.id))),pens:Object.fromEntries(pens.map(p=>[p.id,'plain'])),disabled,selected,current,
  action,key,wholeControl:'map',entrance:t('Entrance','入口'),
  labels:{pen:code=>code,plain:'',map:t('Pens','栏位'),whole:t('Whole room','整栋'),byPen:t('Pen by pen','逐栏'),pens:range=>t('Pens '+range,range+' 栏')}
 });
}

function search(kind,value=''){
 const pen=kind==='pen',label=pen?t('Search pen code','搜索栏号'):t('Find a room','搜索房间');
 return SentriUI.choiceSearch({label,placeholder:pen?t('e.g. C12','例如 C12'):label,value,attrs:{[pen?'data-move-pen-search':'data-move-room-search']:''}});
}
function roomRow(room,action){
 return SentriUI.rowGroup(SentriUI.row({variant:'navigation',title:room.name,description:[room.zone,room.section!==room.name?room.section:null].filter(Boolean).join(' · ')||penCount(room.pens.length),
  icon:SentriIcons.icon('grid'),action,wrap:true}));
}
function roomResults(rooms,home,selected,action,query=''){
 const q=normalize(query),groups=new Map();
 for(const room of [...rooms].sort((a,b)=>Number(b.id===home)-Number(a.id===home))){
  if(q&&!normalize(place(room)).includes(q))continue;
  const group=[room.zone,room.section].filter(Boolean).join(' · ');
  if(!groups.has(group))groups.set(group,[]);
  groups.get(group).push(SentriUI.row({variant:'navigation',icon:SentriIcons.icon('grid'),title:room.name,
   description:[room.id===home?t('This room','本房间'):'',penCount(room.pens.length)].filter(Boolean).join(' · '),action,value:room.id,
   attrs:room.id===selected?{'aria-current':'true'}:{},wrap:true}));
 }
 return groups.size?[...groups].map(([name,rows])=>'<section>'+
  (name?SentriUI.heading({title:name,kind:'section',level:3}):'')+SentriUI.rowGroup(rows.join(''))+'</section>').join(''):
  SentriUI.choiceEmpty(t('Try another room name.','试试其他房间名称。'),{title:t('No matching rooms','没有匹配的房间'),icon:'search'});
}
function page({title,line,bar,back='back',above='',body,primary=null}){
 return SentriUI.sheet({variant:'page',className:'move-page',title,line,back:{action:back},bar,
  above:above?'<div class="move-picker-tools">'+above+'</div>':'',body,footer:primary?SentriUI.sheetFooter({back:false,primary}):false});
}
root.SentriMovePicker={t,esc,sortCodes,place,codesFor,unavailable,results,search,roomRow,roomResults,page};
})(globalThis);
