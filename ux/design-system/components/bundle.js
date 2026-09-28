/* @ds-bundle: {"format":4,"namespace":"SentriUI","components":[{"name":"Heading"},{"name":"Panel"},{"name":"Facts"},{"name":"Row"},{"name":"Log"},{"name":"Segment"},{"name":"IconButton"},{"name":"Button"},{"name":"PickerField"},{"name":"ChoiceList"},{"name":"CategoryFooter"},{"name":"Sheet"},{"name":"Icon"}]} */
/* SentriIcons (sentri-icons.js) and SentriUI (sentri-components.js), verbatim. */
/* Shared icon registry for the Sentri prototypes. One path vocabulary so every
   app renders the same glyphs; apps keep a local fallback for source-only checks. */
(function(root){
  'use strict';
  const paths={
    more:'M5 12h.01M12 12h.01M19 12h.01',
    monitor:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    treat:'M15 3l6 6M16 4l-4 4M20 8l-4 4M10 6l8 8M11 7l-7 7v6h6l7-7M4 20l-2 2M8 12l3 3M11 9l3 3',
    hospital:'M13 3h8v18h-8M17 3v18M13 7h8M13 17h8M2 12h12M9 8l5 4-5 4',
    profile:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    chart:'M4 20V10M12 20V4M20 20v-7',
    origin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    back:'M15 5l-7 7 7 7M8 12h13',
    chevron:'M9 5l7 7-7 7',
    close:'M6 6l12 12M18 6L6 18',
    check:'M5 12l4 4L19 6',
    note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
    feed:'M3 12h18l-3 7H6zM7 8l1-2 2 1-1 2zM12 5l1-2 2 1-1 2zM15 9l1-2 2 1-1 2z',
    link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2',condition:'M12 4v16M4 12h16',
    weight:'M5 6h14l2 15H3zM8 6a4 4 0 0 1 8 0M12 11v4',
    search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',
    grid:'M3 3h7v7H3zM14 3h7v7H3zM3 14h7v7H3zM14 14h7v7H3z',
    scan:'M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M7 12h10',
    clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    alert:'M12 3L2 21h20zM12 9v5M12 17v1',
    signal:'M4 18v-3M9 18v-7M14 18V7M19 18V3',
    battery:'M3 6h16v12H3zM22 10v4M6 9h10v6H6z',
    filter:'M4 5h16l-6 7v6l-4 2v-8z',
    minus:'M5 12h14',
    plus:'M5 12h14M12 5v14',
    record:'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',
    camera:'M3 7h4l2-3h6l2 3h4v14H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    edit:'M4 20l4-1L20 7l-4-4L4 15zM13 6l4 4',
    wrench:'M14 3a6 6 0 0 0-7 8L2 16a3 3 0 0 0 4 4l5-5a6 6 0 0 0 8-7l-4 4-3-3 4-4z',
    details:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
    calendar:'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16',
    bookmark:'M6 3h12v18l-6-4-6 4z',
    transfer:'M7 7h11l-3-3M18 7l-3 3M17 17H6l3-3M6 17l3 3',
    down:'m6 9 6 6 6-6',
    arrow:'m9 5 7 7-7 7',
    place:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    home:'m3 10 9-7 9 7v11h-6v-7H9v7H3z',
    toolbox:'M3 8h18v12H3zM8 8V4h8v4M3 13h18M10 12v3h4v-3',
    spark:'m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z',
    heat:'M12 3c1 5-4 5-4 9 0 2 2 3 3 3-1-3 3-4 3-7 4 4 6 7 4 10-2 4-9 4-12 0-3-5 3-10 6-15z',
    pregnancy:'M3 15h4l3-8 4 12 3-7h4M3 4h18',
    farrow:'M3 12h4l3-7 4 14 3-7h4',
    barn:'m3 9 9-6 9 6v12H3zM9 21V11h6v10M3 9h18',
    return:'M4 8h11a6 6 0 0 1 0 12h-3M8 3 3 8l5 5',
    send:'M12 20V4m-6 6 6-6 6 6',
    health:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8M8 12h8M12 8v8',
    temperature:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0M12 8v9',
    humidity:'M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12z',
    air:'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5',
    upload:'M12 16V4m-4 4 4-4 4 4M4 15v6h16v-6',
    offline:'m3 3 18 18M4 9a13 13 0 0 1 2-1M10 6a14 14 0 0 1 10 3M7 13a8 8 0 0 1 3-1M14 12a8 8 0 0 1 3 1M10 17a3 3 0 0 1 4 0M12 21h.01'
  };
  const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.chevron}"/></svg>`;
  const api=Object.freeze({paths:Object.freeze({...paths}),icon});
  root.SentriIcons=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

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
  const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  const check='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>';
  function field({label='',control='',className=''}={}){
    return `<label class="field ${esc(className)}">${label}${control}</label>`;
  }
  /* Mobile-standard choice control: a trigger button that opens a picker sheet.
     Replaces native <select>; the host app owns the picker view and state. */
  function pickerField({label='',value='',display='',placeholder='Choose',action='open-picker',key='',disabled=false,className=''}={}){
    const text=display!==''?display:value,has=text!=null&&text!=='';
    return field({label,className:'st-picker-field '+className,control:`<button type="button" class="st-picker-trigger${has?'':' is-placeholder'}" data-action="${esc(action)}" data-picker-key="${esc(key)}"${disabled?' disabled':''}><span class="st-picker-value">${esc(has?text:placeholder)}</span>${chevron}</button>`});
  }
  // Shared chooser surface: flat catalogue lists or a muted inset for short choices.
  function chooserList(content,{className='',tone='flat'}={}){
    return `<div class="st-chooser-list ${esc(className)}" data-chooser-tone="${tone==='inset'?'inset':'flat'}">${content}</div>`;
  }
  function pickerOptions({options=[],selected='',action='picker-select',className=''}={}){
    const groups=[];
    for(const option of options){const name=option[3]||'';let group=groups.find(g=>g.name===name);if(!group){group={name,items:[]};groups.push(group);}group.items.push(option);}
    const row=([v,label,sub])=>`<button type="button" class="st-picker-option st-chooser-row" data-action="${esc(action)}" data-value="${esc(v)}" role="option" aria-selected="${v===selected}"><span class="st-picker-option-copy"><strong>${esc(label)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</span>${v===selected?check:''}</button>`;
    const content=groups.map(g=>g.name?`<div class="st-chooser-section" role="group" aria-label="${esc(g.name)}"><h5 class="st-chooser-subtitle" aria-hidden="true">${esc(g.name)}</h5><div class="st-chooser-section-options">${g.items.map(row).join('')}</div></div>`:g.items.map(row).join('')).join('');
    return chooserList(`<div class="st-picker-options ${esc(className)}" role="listbox">${content}</div>`,{tone:groups.some(g=>g.name)?'flat':'inset'});
  }
  /* Choice chooser primitives. Every chooser shape is composed from these three:
     flat list = one untitled group; sectioned list = several titled groups;
     nested = navigate rows, then a leaf list (flat or sectioned) under a new sheet title.
     Row geometry never varies: label, optional meta line, one trailing slot on the right.
     mode: 'navigate' (chevron), 'single' (check when selected), 'multi' (checkbox). */
  function choiceRow({label='',meta='',mode='single',action='',value='',selected=false,attrs={},className=''}={}){
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const copy=`<span class="st-choice-copy"><span class="st-choice-label">${esc(label)}</span>${meta?`<span class="st-choice-meta">${esc(meta)}</span>`:''}</span>`;
    if(mode==='multi')return `<label class="st-choice-row ${esc(className)}" data-mode="multi">${copy}<span class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${selected?' checked':''}${extra}></span></label>`;
    const trail=mode==='navigate'?chevron:selected?check:'';
    const state=mode==='single'?` aria-pressed="${selected?'true':'false'}"`:'';
    return `<button type="button" class="st-choice-row ${esc(className)}" data-mode="${mode==='navigate'?'navigate':'single'}" data-action="${esc(action)}" data-value="${esc(value)}"${state}${extra}>${copy}<span class="st-choice-trail" aria-hidden="true">${trail}</span></button>`;
  }
  // lead: optional control between heading and panel (e.g. a segment that filters only this group).
  function choiceGroup(rows,{title='',lead='',className=''}={}){
    const body=Array.isArray(rows)?rows.join(''):rows;
    return `<section class="st-choice-group ${esc(className)}"${title?` aria-label="${esc(title)}"`:''}>${title?`<h5 class="st-choice-heading">${esc(title)}</h5>`:''}${lead?`<div class="st-choice-lead">${lead}</div>`:''}<div class="st-choice-panel">${body}</div></section>`;
  }
  function choiceSearch({label='Search',placeholder='',value='',attrs={}}={}){
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    return `<label class="field catalog-search st-choice-search"><input type="search" aria-label="${esc(label)}" placeholder="${esc(placeholder||label)}" value="${esc(value)}"${extra}></label>`;
  }
  function choiceEmpty(text){return `<p class="st-choice-empty">${esc(text)}</p>`;}
  function segment({options=[],active='',action='',className='',ariaLabel=''}={}){
    return `<div class="st-segment segment ${esc(className)}" role="group"${ariaLabel?` aria-label="${esc(ariaLabel)}"`:''}>${options.map(([v,label])=>`<button type="button" data-action="${esc(action)}" data-value="${esc(v)}" aria-pressed="${v===active}">${label}</button>`).join('')}</div>`;
  }
  function iconButton({action='',icon='',label='',className='',value='',badge='',disabled=false}={}){
    return `<button type="button" class="icon-button ${esc(className)}" data-action="${esc(action)}" data-value="${esc(value)}" aria-label="${esc(label)}"${disabled?' disabled':''}>${icon}${badge!==''&&badge!=null?`<span class="filter-badge">${esc(badge)}</span>`:''}</button>`;
  }
  const api=Object.freeze({heading,panel,facts,row,rowGroup,log,categoryFooter,field,pickerField,pickerOptions,chooserList,choiceRow,choiceGroup,choiceSearch,choiceEmpty,segment,iconButton});
  root.SentriUI=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
