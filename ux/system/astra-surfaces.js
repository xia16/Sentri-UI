/* Shared page/drawer policy for the interactive studies. */
(function(root){
'use strict';
const inspectionPages=new Set(['actions','pig','pig-profile','pig-production','pig-production-batch','pig-origin','pig-log','pig-feed','pig-feed-curve','pig-feed-changes','history','pen-detail','pen-log','feed','feed-editor','unit-detail','environment','equipment','batch-detail','treatment','sow-transfer']);
const farrowingPages=new Set(['history','roomOverview','roomEndTask','roomTaskReceipt','roomTaskSows','roomPenDetail','roomPenFeed','roomPenLog','marker','pigletCare','pigletEdit','foster','pigletDeath','countReconcile']);
function isPage(app,view,context){return app==='inspection'?(inspectionPages.has(view)||!!(context?.form?.recordEditor&&context.form.bulk)):farrowingPages.has(view);}
const backContent='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>Back</span>';
function normalizeBack(html){
 return html.replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/g,(button,attrs,body)=>{
  if(body.replace(/<[^>]*>/g,'').trim()!=='Back')return button;
  const classes='class="surface-back record-back"';
  attrs=/\bclass="[^"]*"/.test(attrs)?attrs.replace(/\bclass="[^"]*"/,classes):attrs+' '+classes;
  return '<button'+attrs+'>'+backContent+'</button>';
 });
}
function markContext(html,page){
 const context=page?'page':'drawer';
 return html.replace(/(<(?:section|div)\b[^>]*\bclass="[^"]*"[^>]*)(>)/g,(match,attrs,end)=>{
  const classes=attrs.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/)||[];
  if(!classes.includes('sheet'))return match;
  const next=attrs.replace(/\sdata-st-context="(?:page|drawer)"/g,'');
  return next+' data-st-context="'+context+'"'+end;
 });
}
function present(html,{page=false,backAction='back',status='' }={}){
 html=normalizeBack(html);
 html=markContext(html,page);
 if(!page){
  // Nested drawers use footer navigation too; keep a separate Close control.
  html=html.replace(/<header\b([^>]*)>([\s\S]*?)<\/header>/,(_,attrs,body)=>'<header'+attrs+'>'+body.replace(/<button\b[^>]*class="[^"]*\bdrawer-header-back\b[^"]*"[^>]*>[\s\S]*?<\/button>/g,'')+'</header>');
  const hasFooterBack=/<(?:div|footer)\b[^>]*class="[^"]*\bsheet-footer\b[^\"]*"[^>]*>[\s\S]*?\bclass="[^"]*\bsurface-back\b/.test(html);
  if(hasFooterBack)return html;
  const back='<button type="button" class="surface-back record-back" data-action="'+backAction+'" aria-label="Back">'+backContent+'</button>';
  const footer=/(<(?:div|footer)\b[^>]*class="[^"]*\bsheet-footer\b[^\"]*"[^>]*>)/;
  return footer.test(html)?html.replace(footer,'$1'+back):html.replace(/<\/section>\s*$/,'<footer class="sheet-footer">'+back+'</footer></section>');
 }
 html=html.replace(/<button\b[^>]*class="scrim"[^>]*>[\s\S]*?<\/button>/,'');
 html=html.replace(/<section\b([^>]*\bclass="[^"]*"[^>]*)>/,(_,attrs)=>{
  const classes=attrs.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/)||[];
  if(!classes.includes('sheet'))return '<section'+attrs+'>';
  return '<section'+attrs.replace(/ role="dialog"/,' role="region"').replace(/ aria-modal="true"/,'')+' data-presentation="page">';
 });
 html=html.replace(/<div class="grab"[^>]*><\/div>/,status);
 // Pages keep navigation in the bottom action bar, never beside the title.
 html=html.replace(/<header\b([^>]*)>([\s\S]*?)<\/header>/,(_,attrs,body)=>'<header'+attrs+'>'+body.replace(/<button\b[^>]*data-action="(?:back|close|dismiss|room-back)"[^>]*>[\s\S]*?<\/button>/g,'')+'</header>');
 const back='<button type="button" class="surface-back record-back" data-action="'+backAction+'" aria-label="Back">'+backContent+'</button>';
 if(/class="surface-back record-back"/.test(html))return html;
 const footer=/(<(?:div|footer)\b[^>]*class="sheet-footer\b[^"]*"[^>]*>)/;
 return footer.test(html)?html.replace(footer,'$1'+back):html.replace(/<\/section>$/,'<footer class="sheet-footer">'+back+'</footer></section>');
}
const api={isPage,present,normalizeBack,markContext};root.AstraSurfaces=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
