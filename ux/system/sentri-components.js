/* Shared reading components. Business rules and navigation stay with callers. */
(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  function heading({title,icon='',description='',meta='',action='',kind='section',level=4,className=''}={}){
    const k=['page','section','group','panel'].includes(kind)?kind:'section',h=Math.max(1,Math.min(6,Number(level)||4));
    return `<div class="st-heading ${esc(className)}" data-kind="${k}"${icon?' data-has-icon="true"':''}><div class="st-heading-main"><h${h} class="st-heading-title">${icon?`<span class="st-heading-icon">${icon}</span>`:''}<span>${esc(title)}</span></h${h}>${description?`<p class="st-heading-description">${esc(description)}</p>`:''}</div>${meta||action?`<div class="st-heading-aside">${meta?`<span class="st-heading-meta">${esc(meta)}</span>`:''}${action?`<span class="st-heading-action">${action}</span>`:''}</div>`:''}</div>`;
  }
  function panel(content,{className='',tag='div'}={}){
    const t=['div','section','article','aside','dl'].includes(tag)?tag:'div';
    return `<${t} class="st-panel ${esc(className)}">${content}</${t}>`;
  }
  function facts(items,{className='',columns=2}={}){
    return `<dl class="st-panel st-facts ${esc(className)}" data-columns="${columns===3?3:columns===1?1:2}">${items.map(i=>`<div class="st-fact"><dt>${esc(i.label)}</dt><dd>${i.valueHtml!=null?i.valueHtml:esc(i.value==null||i.value===''?'—':i.value)}</dd>${i.meta?`<small>${esc(i.meta)}</small>`:''}</div>`).join('')}</dl>`;
  }
  function rowGroup(content,{title='',level=5,className=''}={}){
    return panel((title?heading({title,kind:'group',level,className:'st-row-group-label'}):'')+content,{className:'st-row-group '+className});
  }
  function row({title,description='',icon='',action='',value='',className='',disabled=false,trailing='',attrs={}}={}){
    const tag=action?'button':'div',safeAttrs=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    return `<${tag} class="st-row ${esc(className)}"${action?` type="button" data-action="${esc(action)}" data-value="${esc(value)}"${disabled?' disabled aria-disabled="true"':''}`:''}${safeAttrs}>${icon?`<span class="st-row-icon">${icon}</span>`:''}<span class="st-row-copy"><strong>${esc(title)}</strong>${description?`<small>${esc(description)}</small>`:''}</span>${trailing?`<span class="st-row-trailing">${trailing}</span>`:''}${action?`<span class="st-row-chevron">${arrow}</span>`:''}</${tag}>`;
  }
  function log(groups,{className='',empty='No activity recorded yet'}={}){
    const nonempty=groups.filter(g=>g.entries?.length);
    if(!nonempty.length)return panel(`<p class="st-empty">${esc(empty)}</p>`,{className:'st-log '+className});
    return panel(nonempty.map(g=>`<section class="st-log-group">${g.label?heading({title:g.label,kind:'group'}):''}<div class="st-log-entries">${g.entries.map(e=>`<article class="st-log-entry">${e.category?`<span class="st-log-category">${esc(e.category)}</span>`:''}<strong class="st-log-title">${esc(e.title)}</strong>${e.detail?`<p>${esc(e.detail)}</p>`:''}${e.meta?`<small>${esc(e.meta)}</small>`:''}${e.extraHtml?`<div class="st-log-extra">${e.extraHtml}</div>`:''}</article>`).join('')}</div></section>`).join(''),{className:'st-log '+className});
  }
  function categoryFooter({categories=[],active='',backAction='back',categoryAction='action-category',label='Action categories',className=''}={}){
    const current=categories.some(c=>c.id===active)?active:categories[0]?.id;
    return `<footer class="sheet-footer st-category-footer ${esc(className)}"><button type="button" class="surface-back record-back" data-action="${esc(backAction)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>Back</span></button><nav class="st-category-tabs action-category-nav" aria-label="${esc(label)}">${categories.map(c=>`<button type="button" data-action="${esc(categoryAction)}" data-value="${esc(c.id)}" aria-current="${c.id===current?'location':'false'}"${c.disabled?' disabled':''}>${esc(c.label)}</button>`).join('')}</nav></footer>`;
  }
  const api=Object.freeze({heading,panel,facts,row,rowGroup,log,categoryFooter});
  root.SentriUI=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
