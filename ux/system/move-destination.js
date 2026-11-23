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

function codesFor({lanes=[],depth=6,rows=[],apart=[]}){
 const runSize=runs=>runs.reduce((n,r)=>n+r.n,0);
 const codes=(letter,n)=>Array.from({length:n},(_,i)=>letter+(i+1));
 return [...lanes.flatMap((l,i)=>typeof l==='string'?codes(l,depth):codes(l.letter||String.fromCharCode(65+i),l.runs?.length?runSize(l.runs):l.n||depth)),
  ...rows.flatMap((r,i)=>codes(r.letter||String.fromCharCode(65+lanes.length+i),runSize(r.runs))),...apart.map(p=>p.code)];
}
const unavailable=pen=>pen.registered===false||pen.available===false?t('Pen unavailable','栏位不可用'):
 pen.full?t('Pen full','栏位已满'):pen.allowed===false?t('No permission','无权限'):'';

function layoutFor(room,pens){
 if(room.layout){
  const known=new Set(codesFor(room.layout));
  const extra=pens.filter(p=>!known.has(p.id)).map(p=>({code:p.id}));
  return extra.length?{...room.layout,apart:[...(room.layout.apart||[]),...extra]}:room.layout;
 }
 // Sample rooms without a saved layout supply their existing pen codes.
 const lanes=new Map(),apart=[];
 for(const {id} of pens){
  const match=/^([A-Z]+)([1-9]\d*)$/.exec(id);
  if(!match){apart.push({code:id});continue;}
  const [,letter,n]=match;
  lanes.set(letter,Math.max(lanes.get(letter)||0,Number(n)));
 }
 return {lanes:[...lanes].sort(([a],[b])=>sortCodes(a,b)).map(([letter,n])=>({letter,n})),apart};
}

function picker({room,selected='',current='',blocked={},bar,back='back',key,roomAction='',action,reviewAction}){
 const pens=room.pens.filter(p=>p.registered!==false);
 const disabled=Object.fromEntries(pens.map(p=>[p.id,blocked[p.id]||unavailable(p)]).filter(([,reason])=>reason));
 const body=pens.length?SentriUI.penMap({...layoutFor(room,pens),pens:Object.fromEntries(pens.map(p=>[p.id,'plain'])),
  disabled,selected,current:selected||current,action,key,entrance:t('Entrance','入口'),
  labels:{pen:code=>code,plain:'',map:t('Pens','栏位'),whole:t('Whole room','整栋'),byPen:t('Pen by pen','逐栏'),pens:range=>t('Pens '+range,range+' 栏')}}):
  SentriUI.choiceEmpty(t('No registered pens','没有登记的栏位'),{icon:'grid'});
 const roomRow=roomAction?SentriUI.row({variant:'navigation',title:room.name,
  description:[room.zone,room.section!==room.name?room.section:null].filter(Boolean).join(' · '),
  icon:SentriIcons.icon('grid'),action:roomAction,wrap:true}):'';
 return page({title:t('Choose a pen','选择目标栏'),line:roomAction?null:{text:room.name},bar,back,
  above:roomRow?SentriUI.rowGroup(roomRow):'',body,
  primary:{label:t('Review move','核对转舍'),action:reviewAction,waiting:!selected||!pens.some(p=>p.id===selected)||!!disabled[selected]}});
}

function targetRow(room,code,action){
 return SentriUI.row({variant:'navigation',title:room.name+' · '+code,description:t('Destination pen','目标栏'),action,wrap:true});
}

function roomSearch(value=''){
 const label=t('Find a room','搜索房间');
 return SentriUI.choiceSearch({label,placeholder:label,value,attrs:{'data-move-room-search':''}});
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
root.SentriMovePicker={t,esc,sortCodes,place,codesFor,unavailable,picker,targetRow,roomSearch,roomResults,page};
})(globalThis);
