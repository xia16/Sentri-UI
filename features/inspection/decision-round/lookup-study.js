// Canvas fixture; inserted into the real Inspection renderer by capture.mjs.
// A scan may be for the whole unit or explicitly for one pen. The destination is never inferred from scroll position.
function studyPlacement(c,id){
 const pe=penOf(c,id);
 return pe&&{pe,unit:pigUnit(c,id),otherUnit:!c.pens.includes(pe),outsidePen:!!c.scan.pen&&c.scan.pen!==pe.id};
}
function studyOutOfScope(c,id){const place=studyPlacement(c,id);return !!place&&(place.otherUnit||place.outsidePen);}
function studyMoveDoor(c,h,find=false){
 const target=(!find&&c.scan.pen)?'Pen '+c.scan.pen:'this unit';
 const row=find?SentriUI.findRow({code:h.p.id,place:compactStage(stageSummary(h.p)),query:c.query,action:'search-pig',value:h.p.id}):SentriUI.row({variant:'animal',code:h.p.id,description:compactStage(stageSummary(h.p)),action:'pig',value:h.p.id,trail:'chevron',attrs:{'data-scan-tag':h.p.id}});
 return row+SentriUI.button({label:'Move into '+target,register:'text',action:'study-move',value:h.p.id});
}
function studyLookupLayer(c){
 const m=c.studyMove;
 if(!m)return '';
 const pe=penOf(c,m.id),target=m.fixed||m.destination;
 const place=SentriUI.facts([{label:'Ear tag',value:m.id,mono:true},{label:'Recorded in',value:m.originPlace}],{columns:2});
 if(c.view==='study-move'){
  const label=m.fixed?'this pen':'this unit';
  const choices=SentriUI.rowGroup([
   {title:'Move into '+label,description:'Move without adding to the selection',value:'move'},
   {title:'Move into '+label+' and select',description:'Select only after the move is confirmed',value:'select'}
  ].map(x=>SentriUI.row({...x,variant:'navigation',action:'study-move-mode',wrap:true})).join(''));
  return sheet(c,m.fixed?'Pig in another pen':'Pig in another unit','',place+choices,footer(back(),''),'menu');
 }
 const targetText=target?unitName(c)+' · '+target:unitName(c);
 if(c.view==='study-move-result'){
  const details=m.result==='ok'?(m.mode==='select'?'The pig is in the destination pen and selected.':'The pig is in the destination pen. Your selection is unchanged.'):
   m.result==='offline'?'Go online before submitting. The pig has not been moved or selected.':
   m.result==='denied'?'You cannot move this pig with your current access. The pig was not moved or selected.':
   m.result==='uncertain'?'Check the result of this move before trying again. The pig has not been selected.':
   'The move was rejected. Refresh the pig’s location before trying again. Your selection is unchanged.';
  const title={ok:'Move confirmed',offline:'You are offline',denied:'Move unavailable',uncertain:'Move not confirmed',failed:'Move failed'}[m.result];
  const facts=SentriUI.facts([{label:'Ear tag',value:m.id,mono:true},{label:'Destination',value:targetText}],{columns:2});
  return sheet(c,title,'',facts+SentriUI.banner({tone:m.result==='ok'?'notice':'correction',headline:m.result==='ok'?(m.mode==='select'?'Added to the selection':'Selection unchanged'):'Selection unchanged',consequence:details}),footer(back(),''),'menu');
 }
 const choices=m.fixed?'':SentriUI.choiceGroup(c.pens.map(p=>SentriUI.choiceRow({label:'Pen '+p.id,value:p.id,mode:'single',action:'study-target',selected:p.id===target})));
 const facts=SentriUI.facts([{label:'Move from',value:pe?m.originPlace:'Location unavailable'},{label:'Move to',value:targetText}],{columns:2});
 return sheet(c,m.mode==='select'?'Move and select':'Move pig','',facts+choices,footer(back(),button('study-confirm','Confirm move','button primary','',!target)),'menu');
}
function studyMoveBack(c){
 const m=c.studyMove;
 if(c.view==='study-move-target'){c.view='study-move';return;}
 if(c.view==='study-move-result'&&['offline','failed'].includes(m.result)){c.view='study-move-target';return;}
 c.view=m.from;c.scan.listening=m.listening;delete c.studyMove;
}
function studyMoveAction(c,a,v){
 if(a==='scan-pen'){
  c.scan.pen=v;c.scan.entrySelection=selectionContext(c);
  c.selected=new Set([...c.selected].filter(id=>!studyOutOfScope(c,id)));
  c.selectedPens=new Set();c.selectedNoTags=new Set();c.noTagsCount={};
  c.view='scan';return true;
 }
 if(a==='back'&&c.view==='scan'&&c.scan.entrySelection){
  const old=c.scan.entrySelection;
  c.selected=new Set([...old.selected].filter(id=>studyOutOfScope(c,id)).concat([...c.selected]));
  Object.assign(c,old,{selected:c.selected});delete c.scan.entrySelection;delete c.scan.pen;
  return false;
 }
 if(a==='study-move'){
  if(c.studyPending?.id===v){c.studyMove={...c.studyPending,from:c.view,listening:c.scan.listening};c.scan.listening=false;c.view='study-move-result';return true;}
  const place=studyPlacement(c,v),find=c.view==='search';if(!place||!(place.otherUnit||!find&&place.outsidePen))return false;
  c.studyMove={id:v,from:c.view,fixed:find?'':c.scan.pen||'',originPlace:place.unit+' · '+place.pe.id,listening:c.scan.listening};
  c.scan.listening=false;c.view='study-move';return true;
 }
 const m=c.studyMove;if(!m)return false;
 if(a==='back'||a==='dismiss'){studyMoveBack(c);return true;}
 if(a==='study-move-mode'&&['move','select'].includes(v)){m.mode=v;c.view='study-move-target';return true;}
 if(a==='study-target'&&c.pens.some(p=>p.id===v)){m.destination=v;return true;}
 if(a==='study-confirm'&&c.view==='study-move-target'){
  const place=studyPlacement(c,m.id),target=c.pens.find(p=>p.id===(m.fixed||m.destination));
  if(!place||!target||place.pe===target)return true;
  m.result=new URLSearchParams(location.search).get('studyMove')||'ok';
  if(m.result==='uncertain')c.studyPending={...m};
  if(m.result==='ok'){
   const p=place.pe.pigs.find(p=>p.id===m.id);
   place.pe.pigs=place.pe.pigs.filter(x=>x!==p);target.pigs.push(p);
   addEvent(c,'Pig moved',[m.id,place.pe.id,target.id],m.originPlace+' → '+unitName(c)+' · '+target.id,'Movement');
   if(m.mode==='select')c.selected.add(m.id);else c.selected.delete(m.id);
  }
  c.view='study-move-result';return true;
 }
 return false;
}
