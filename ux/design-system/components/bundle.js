/* @ds-bundle: {"format":4,"namespace":"SentriUI","components":[{"name":"Heading"},{"name":"Panel"},{"name":"Facts"},{"name":"Row"},{"name":"Log"},{"name":"Segment"},{"name":"IconButton"},{"name":"Button"},{"name":"PickerField"},{"name":"ChoiceList"},{"name":"CategoryFooter"},{"name":"Sheet"},{"name":"Icon"},{"name":"Stepper"},{"name":"Measure"},{"name":"Numpad"}]} */
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
    backspace:'M9 5h12v14H9l-6-7zM12 9l6 6M18 9l-6 6',
    offline:'m3 3 18 18M4 9a13 13 0 0 1 2-1M10 6a14 14 0 0 1 10 3M7 13a8 8 0 0 1 3-1M14 12a8 8 0 0 1 3 1M10 17a3 3 0 0 1 4 0M12 21h.01'
  };
  const icon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.chevron}"/></svg>`;
  const api=Object.freeze({paths:Object.freeze({...paths}),icon});
  root.SentriIcons=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

/* Shared reading components. Business rules and navigation stay with callers.
   Every root carries data-ds="<CardName>". Every text slot has an optional string-id twin:
   pass strs:{slot:'registry.id'} (and args:{slot:{...}}) and the slot is wrapped in
   <span data-str="id" data-args="…"> for the screen shell to fill. Without strs, output is unchanged. */
(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // String-id twin helpers. sa: attribute text for an id; tx: escaped text, wrapped in a span when an id is given.
  const sa=(id,args)=>id?` data-str="${esc(id)}"${args&&Object.keys(args).length?` data-args="${esc(JSON.stringify(args))}"`:''}`:'';
  const tx=(text,o,key)=>{const id=o&&o.strs&&o.strs[key];return id?`<span${sa(id,o.args&&o.args[key])}>${esc(text)}</span>`:esc(text);};
  const has=(o,key)=>!!(o&&o.strs&&o.strs[key]);
  const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  function heading({title,icon='',description='',meta='',action='',kind='section',level=4,className='',strs,args}={}){
    const o={strs,args};
    const k=['page','section','group','panel'].includes(kind)?kind:'section',h=Math.max(1,Math.min(6,Number(level)||4));
    const showDesc=description||has(o,'description'),showMeta=meta||has(o,'meta');
    return `<div class="st-heading ${esc(className)}" data-ds="Heading" data-kind="${k}"${icon?' data-has-icon="true"':''}><div class="st-heading-main"><h${h} class="st-heading-title">${icon?`<span class="st-heading-icon">${icon}</span>`:''}<span${sa(strs&&strs.title,args&&args.title)}>${esc(title)}</span></h${h}>${showDesc?`<p class="st-heading-description">${tx(description,o,'description')}</p>`:''}</div>${showMeta||action?`<div class="st-heading-aside">${showMeta?`<span class="st-heading-meta">${tx(meta,o,'meta')}</span>`:''}${action?`<span class="st-heading-action">${action}</span>`:''}</div>`:''}</div>`;
  }
  function panel(content,{className='',tag='div',ds='Panel'}={}){
    const t=['div','section','article','aside','dl'].includes(tag)?tag:'div';
    return `<${t} class="st-panel ${esc(className)}" data-ds="${esc(ds)}">${content}</${t}>`;
  }
  function facts(items,{className='',columns=2}={}){
    return `<dl class="st-panel st-facts ${esc(className)}" data-ds="Facts" data-columns="${columns===3?3:columns===1?1:2}">${items.map(i=>`<div class="st-fact"><dt>${tx(i.label,i,'label')}</dt><dd>${i.valueHtml!=null?i.valueHtml:has(i,'value')?tx(i.value,i,'value'):esc(i.value==null||i.value===''?'—':i.value)}</dd>${i.meta||has(i,'meta')?`<small>${tx(i.meta,i,'meta')}</small>`:''}</div>`).join('')}</dl>`;
  }
  function rowGroup(content,{title='',level=5,className='',strs,args}={}){
    return panel((title||has({strs},'title')?heading({title,kind:'group',level,className:'st-row-group-label',strs,args}):'')+content,{className:'st-row-group '+className,ds:'Row'});
  }
  function row({title,description='',icon='',action='',value='',className='',disabled=false,trailing='',attrs={},strs,args}={}){
    const o={strs,args};
    const tag=action?'button':'div',safeAttrs=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    // With strs.trailing the value is plain fallback text (escaped); without it, trailing stays trusted raw HTML.
    const trail=has(o,'trailing')?`<span class="st-row-trailing">${tx(trailing,o,'trailing')}</span>`:trailing?`<span class="st-row-trailing">${trailing}</span>`:'';
    return `<${tag} class="st-row ${esc(className)}" data-ds="Row"${action?` type="button" data-action="${esc(action)}" data-value="${esc(value)}"${disabled?' disabled aria-disabled="true"':''}`:''}${safeAttrs}>${icon?`<span class="st-row-icon">${icon}</span>`:''}<span class="st-row-copy"><strong>${tx(title,o,'title')}</strong>${description||has(o,'description')?`<small>${tx(description,o,'description')}</small>`:''}</span>${trail}${action?`<span class="st-row-chevron">${arrow}</span>`:''}</${tag}>`;
  }
  /* groups: [{label, strs:{label}, args:{label}, entries:[{category,title,detail,meta,strs:{…},args:{…}}]}]; options.strs.empty for the empty line. */
  function log(groups,{className='',empty='No activity recorded yet',strs,args}={}){
    const nonempty=groups.filter(g=>g.entries?.length);
    if(!nonempty.length)return panel(`<p class="st-empty">${tx(empty,{strs,args},'empty')}</p>`,{className:'st-log '+className,ds:'Log'});
    return panel(nonempty.map(g=>`<section class="st-log-group">${g.label||has(g,'label')?heading({title:g.label,kind:'group',strs:has(g,'label')?{title:g.strs.label}:undefined,args:g.args&&g.args.label?{title:g.args.label}:undefined}):''}<div class="st-log-entries">${g.entries.map(e=>`<article class="st-log-entry">${e.category||has(e,'category')?`<span class="st-log-category">${tx(e.category,e,'category')}</span>`:''}<strong class="st-log-title">${tx(e.title,e,'title')}</strong>${e.detail||has(e,'detail')?`<p>${tx(e.detail,e,'detail')}</p>`:''}${e.meta||has(e,'meta')?`<small>${tx(e.meta,e,'meta')}</small>`:''}${e.extraHtml?`<div class="st-log-extra">${e.extraHtml}</div>`:''}</article>`).join('')}</div></section>`).join(''),{className:'st-log '+className,ds:'Log'});
  }
  /* strs.back = the Back text; categories[i].strs.label = each tab. The nav aria-label stays plain text. */
  function categoryFooter({categories=[],active='',backAction='back',categoryAction='action-category',label='Action categories',className='',strs,args}={}){
    const current=categories.some(c=>c.id===active)?active:categories[0]?.id;
    return `<footer class="sheet-footer st-category-footer ${esc(className)}" data-ds="CategoryFooter"><button type="button" class="surface-back record-back" data-action="${esc(backAction)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span${sa(strs&&strs.back,args&&args.back)}>Back</span></button><nav class="st-category-tabs action-category-nav" aria-label="${esc(label)}">${categories.map(c=>`<button type="button" data-action="${esc(categoryAction)}" data-value="${esc(c.id)}" aria-current="${c.id===current?'location':'false'}"${c.disabled?' disabled':''}>${tx(c.label,c,'label')}</button>`).join('')}</nav></footer>`;
  }
  const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  const check='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>';
  function field({label='',control='',className='',ds=''}={}){
    return `<label class="field ${esc(className)}"${ds?` data-ds="${esc(ds)}"`:''}>${label}${control}</label>`;
  }
  /* Mobile-standard choice control: a trigger button that opens a picker sheet.
     Replaces native <select>; the host app owns the picker view and state.
     strs: label (raw label wrapped in a span), display or value (the shown value), placeholder. */
  function pickerField({label='',value='',display='',placeholder='Choose',action='open-picker',key='',disabled=false,className='',strs,args}={}){
    const text=display!==''?display:value,shown=text!=null&&text!=='';
    const s=strs||{},a=args||{};
    let id,idArgs,vtext;
    if(shown){id=s.display||s.value;idArgs=s.display?a.display:a.value;vtext=text;}
    else if(s.placeholder){id=s.placeholder;idArgs=a.placeholder;vtext=placeholder;}
    else if(s.display||s.value){id=s.display||s.value;idArgs=s.display?a.display:a.value;vtext='';}
    else vtext=placeholder;
    const lab=s.label?`<span${sa(s.label,a.label)}>${label}</span>`:label;
    return field({label:lab,className:'st-picker-field '+className,ds:'PickerField',control:`<button type="button" class="st-picker-trigger${shown?'':' is-placeholder'}" data-action="${esc(action)}" data-picker-key="${esc(key)}"${disabled?' disabled':''}><span class="st-picker-value"${sa(id,idArgs)}>${esc(vtext)}</span>${chevron}</button>`});
  }
  // Shared chooser surface: flat catalogue lists or a muted inset for short choices.
  function chooserList(content,{className='',tone='flat',ds='ChoiceList'}={}){
    return `<div class="st-chooser-list ${esc(className)}" data-ds="${esc(ds)}" data-chooser-tone="${tone==='inset'?'inset':'flat'}">${content}</div>`;
  }
  /* options: [value,label,sub?,group?,{strs:{label,sub,group},args:{…}}?]; the group's strs come from its first option. */
  function pickerOptions({options=[],selected='',action='picker-select',className=''}={}){
    const groups=[];
    for(const option of options){const name=option[3]||'';let group=groups.find(g=>g.name===name);if(!group){group={name,items:[],x:option[4]};groups.push(group);}group.items.push(option);}
    const row=([v,label,sub,,x])=>`<button type="button" class="st-picker-option st-chooser-row" data-action="${esc(action)}" data-value="${esc(v)}" role="option" aria-selected="${v===selected}"><span class="st-picker-option-copy"><strong>${tx(label,x,'label')}</strong>${sub||has(x,'sub')?`<small>${tx(sub,x,'sub')}</small>`:''}</span>${v===selected?check:''}</button>`;
    const content=groups.map(g=>g.name?`<div class="st-chooser-section" role="group" aria-label="${esc(g.name)}"><h5 class="st-chooser-subtitle" aria-hidden="true">${tx(g.name,g.x,'group')}</h5><div class="st-chooser-section-options">${g.items.map(row).join('')}</div></div>`:g.items.map(row).join('')).join('');
    return chooserList(`<div class="st-picker-options ${esc(className)}" role="listbox">${content}</div>`,{tone:groups.some(g=>g.name)?'flat':'inset',ds:'PickerField'});
  }
  /* Choice chooser primitives. Every chooser shape is composed from these three:
     flat list = one untitled group; sectioned list = several titled groups;
     nested = navigate rows, then a leaf list (flat or sectioned) under a new sheet title.
     Row geometry never varies: label, optional meta line, one trailing slot on the right.
     mode: 'navigate' (chevron), 'single' (check when selected), 'multi' (checkbox). */
  function choiceRow({label='',meta='',mode='single',action='',value='',selected=false,attrs={},className='',strs,args}={}){
    const o={strs,args};
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const copy=`<span class="st-choice-copy"><span class="st-choice-label">${tx(label,o,'label')}</span>${meta||has(o,'meta')?`<span class="st-choice-meta">${tx(meta,o,'meta')}</span>`:''}</span>`;
    if(mode==='multi')return `<label class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="multi">${copy}<span class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${selected?' checked':''}${extra}></span></label>`;
    const trail=mode==='navigate'?chevron:selected?check:'';
    const state=mode==='single'?` aria-pressed="${selected?'true':'false'}"`:'';
    return `<button type="button" class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="${mode==='navigate'?'navigate':'single'}" data-action="${esc(action)}" data-value="${esc(value)}"${state}${extra}>${copy}<span class="st-choice-trail" aria-hidden="true">${trail}</span></button>`;
  }
  // lead: optional control between heading and panel (e.g. a segment that filters only this group).
  function choiceGroup(rows,{title='',lead='',className='',strs,args}={}){
    const body=Array.isArray(rows)?rows.join(''):rows;
    const showTitle=title||has({strs},'title');
    return `<section class="st-choice-group ${esc(className)}" data-ds="ChoiceList"${title?` aria-label="${esc(title)}"`:''}>${showTitle?`<h5 class="st-choice-heading">${tx(title,{strs,args},'title')}</h5>`:''}${lead?`<div class="st-choice-lead">${lead}</div>`:''}<div class="st-choice-panel">${body}</div></section>`;
  }
  function choiceSearch({label='Search',placeholder='',value='',attrs={}}={}){
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    return `<label class="field catalog-search st-choice-search" data-ds="ChoiceList"><input type="search" aria-label="${esc(label)}" placeholder="${esc(placeholder||label)}" value="${esc(value)}"${extra}></label>`;
  }
  function choiceEmpty(text,{strs,args}={}){return `<p class="st-choice-empty" data-ds="ChoiceList">${tx(text,{strs,args},'text')}</p>`;}
  /* options: [value,label,{strs:{label},args:{label}}?]; label is raw HTML, kept as the span's fallback. */
  function segment({options=[],active='',action='',className='',ariaLabel=''}={}){
    return `<div class="st-segment segment ${esc(className)}" data-ds="Segment" role="group"${ariaLabel?` aria-label="${esc(ariaLabel)}"`:''}>${options.map(([v,label,x])=>`<button type="button" data-action="${esc(action)}" data-value="${esc(v)}" aria-pressed="${v===active}">${has(x,'label')?`<span${sa(x.strs.label,x.args&&x.args.label)}>${label}</span>`:label}</button>`).join('')}</div>`;
  }
  function iconButton({action='',icon='',label='',className='',value='',badge='',disabled=false,strs,args}={}){
    const o={strs,args},hasBadge=(badge!==''&&badge!=null)||has(o,'badge');
    return `<button type="button" class="icon-button ${esc(className)}" data-ds="IconButton" data-action="${esc(action)}" data-value="${esc(value)}" aria-label="${esc(label)}"${disabled?' disabled':''}>${icon}${hasBadge?`<span class="filter-badge">${tx(badge,o,'badge')}</span>`:''}</button>`;
  }
  /* ---- Field cards (candidate, ADR 0001): Stepper, Measure, Numpad ----
     Event contract: every control is a <button data-action> whose data-value is the caller's field key;
     Stepper keys add data-step (−step | step), Numpad keys add data-key (0–9 | . | back). Delegate with
     closest('[data-action]'). The caller holds the value (always a string for typed input), commits and
     re-renders; patch by field key and keep the roots mounted so focus and live regions survive.
     The floor-gray (DS README, States): a key with nothing to do is aria-disabled, still tappable, and the
     host answers the tap in the field's hint line. */
  let fieldUid=0;
  const fieldId=p=>`${p}-${++fieldUid}`;
  const glyph=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${(root.SentriIcons&&root.SentriIcons.paths[k])||''}"/></svg>`;
  // aria-label with an optional registry twin (the shell fills it through data-str-attr).
  const ariaText=(text,id,args)=>` aria-label="${esc(text)}"${id?` data-str-attr="aria-label:${esc(id)}"${args?` data-args="${esc(JSON.stringify(args))}"`:''}`:''}`;
  const hintTone=t=>t==='warn'||t==='refused'?'amber':'muted';
  // One hint line. reserve keeps its height when empty, so nothing below it moves when a hint appears.
  function hintLine(cls,{text='',tone='',o={},key='hint',reserve=false,inner=''}={}){
    const show=text||has(o,key)||inner;
    if(!show&&!reserve)return '';
    const body=inner||(show?tx(text,o,key):'');
    return `<p class="st-field-hint ${cls}" data-tone="${hintTone(tone)}"${reserve?` data-reserve="${reserve===true?'text':esc(reserve)}"`:''}${show?'':' aria-hidden="true"'}>${body}</p>`;
  }
  /* Stepper: `− n +`, the one counting shape. variant 'row' (a 60px sheet row) or 'hero' (the count sheet's one number).
     pointers: [{label, action, value, strs:{label}, args}] — text actions (≥44px) shown in the hint line at the floor. */
  function stepper({label='',description='',value=0,min=0,max=null,step=1,action='step',key='',variant='row',changed=false,tone='',hint='',pointers=[],reserveHint,id='',className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{};
    const n=Number(value)||0,hero=variant==='hero',lid=id||fieldId('st-stepper'),d=Math.abs(Number(step)||1);
    const floorGray=n<=min,ceilGray=max!=null&&n>=max;
    const isChanged=changed||tone==='changed';
    const key1=(dir,gray)=>{const kid=`${lid}-${dir<0?'dec':'inc'}`;return `<button type="button" class="st-stepper-key" id="${esc(kid)}" data-action="${esc(action)}" data-value="${esc(key)}" data-step="${dir*d}" aria-labelledby="${esc(lid)} ${esc(kid)}"${gray?' aria-disabled="true"':''}${dir<0?ariaText('Decrease',s.decrease,a.decrease):ariaText('Increase',s.increase,a.increase)}><span class="st-stepper-face">${glyph(dir<0?'minus':'plus')}</span></button>`;};
    const copy=`<span class="st-stepper-copy"><span class="st-stepper-label" id="${esc(lid)}">${tx(label,o,'label')}</span>${description||has(o,'description')?`<small class="st-stepper-description">${tx(description,o,'description')}</small>`:''}</span>`;
    const vargs=a.value||(s.value?{n:String(n)}:null);
    const val=`<span class="st-stepper-value" role="spinbutton" tabindex="0" aria-labelledby="${esc(lid)}" aria-valuenow="${n}" aria-valuemin="${esc(min)}"${max!=null?` aria-valuemax="${esc(max)}"`:''} aria-live="polite"${sa(s.value,vargs)}>${esc(n)}</span>`;
    const ptr=pointers.map(p=>`<button type="button" class="st-text-action" data-action="${esc(p.action||'')}" data-value="${esc(p.value!=null?p.value:key)}">${tx(p.label,p,'label')}</button>`).join('');
    const canPoint=hero||min>0||pointers.length>0,reserve=reserveHint!=null?(reserveHint?(canPoint?'action':'text'):''):(canPoint?'action':max!=null?'text':'');
    const hl=hintLine('st-stepper-hint',{text:ptr?'':hint,o,reserve,inner:ptr?`${hint||has(o,'hint')?`<span class="st-stepper-hint-text">${tx(hint,o,'hint')}</span>`:''}${ptr}`:''});
    return `<div class="st-stepper ${esc(className)}" data-ds="Stepper" data-variant="${hero?'hero':'row'}" data-field="${esc(key)}" role="group" aria-labelledby="${esc(lid)}"${n===0?' data-zero=""':''}${isChanged?' data-changed=""':''}${max!=null&&max>=1000?' data-wide=""':''}>${copy}<span class="st-stepper-keys">${key1(-1,floorGray)}${val}${key1(1,ceilGray)}</span>${hl}</div>`;
  }
  /* The box a measured or typed value sits in; shared by Measure (a button) and the Numpad readout (static). */
  function valueBox(tag,{value='',unit='',unitGap=true,placeholder='—',active=false,attrs='',vid='',uid=''},o){
    const empty=value===''||value==null,s=o.strs||{},a=o.args||{};
    const shown=empty?(active?'':placeholder):String(value);
    const sid=empty?(active?'':s.placeholder):s.value,sargs=empty?a.placeholder:(a.value||(s.value?{n:String(value)}:null));
    return `<${tag} class="st-measure-box"${unitGap?'':' data-unit-gap="none"'}${attrs}><span class="st-measure-value"${vid?` id="${esc(vid)}"`:''}${sid?sa(sid,sargs):''}>${esc(shown)}</span>${unit||has(o,'unit')?`<span class="st-measure-unit"${uid?` id="${esc(uid)}"`:''}>${tx(unit,o,'unit')}</span>`:''}</${tag}>`;
  }
  /* Measure: one measured value, mono, unit always written. A button that opens the docked Numpad (active).
     range is evaluated only when the pad is closed (active false), never per keystroke. */
  function measure({label='',optional='',value='',unit='',unitGap=true,placeholder='—',action='open-numpad',key='',active=false,controls='',range=null,tone='',changed=false,hint='',note='',id='',className='',strs,args}={}){
    const o={strs,args},lid=id||fieldId('st-measure'),v=value==null?'':String(value),num=parseFloat(v);
    const out=!active&&Array.isArray(range)&&v!==''&&!Number.isNaN(num)&&(num<range[0]||num>range[1]);
    const t=tone==='refused'?'refused':tone==='warn'||out?'warn':'';
    const isChanged=changed||tone==='changed';
    const lab=`<span class="st-measure-label" id="${esc(lid)}"><span${sa(o.strs&&o.strs.label,o.args&&o.args.label)}>${esc(label)}</span>${optional||has(o,'optional')?`<small>${tx(optional,o,'optional')}</small>`:''}</span>`;
    const vid=lid+'-value',uid=lid+'-unit';
    const box=valueBox('button',{value:v,unit,unitGap,placeholder,active,vid,uid,attrs:` type="button" data-action="${esc(action)}" data-value="${esc(key)}" aria-labelledby="${esc(lid)} ${esc(vid)} ${esc(uid)}" aria-expanded="${active?'true':'false'}"${controls?` aria-controls="${esc(controls)}"`:''}`},o);
    const hl=t?hintLine('st-measure-hint',{text:hint,tone:t,o}):hintLine('st-measure-hint',{text:hint,o});
    const nl=note||has(o,'note')?hintLine('st-measure-note',{text:note,o,key:'note'}):'';
    return `<div class="st-measure ${esc(className)}" data-ds="Measure" data-field="${esc(key)}"${v===''?' data-empty=""':''}${active?' data-active=""':''}${t?` data-tone="${t}"`:''}${isChanged?' data-changed=""':''}>${lab}${box}${hl}${nl}</div>`;
  }
  /* Numpad: the one type-to-set pad, for real typed input only (ear tags, weights), docked above the bar.
     1–9 · [. or a gap] 0 ⌫. No commit key: the bar's primary commits. Keys never move: the hint line is
     always reserved and, in a run, so are three lines of the running list. */
  function numpadLimits(v,{decimals=0,maxLength=null,intLength=null}={}){
    const dot=v.indexOf('.'),intPart=dot<0?v:v.slice(0,dot),frac=dot<0?'':v.slice(dot+1);
    const digitsDead=dot>=0?frac.length>=decimals:((maxLength!=null&&v.length>=maxLength)||(intLength!=null&&intPart.length>=intLength));
    return {dot,digitsDead,pointDead:decimals<=0||dot>=0};
  }
  function numpad({label='',value='',unit='',placeholder='—',suggested=false,decimals=0,maxLength=null,intLength=null,recent=null,id='',action='numpad',key='',tone='',hint='',className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},pid=id||fieldId('st-numpad');
    const v=value==null?'':String(value),typing=suggested?'':v;
    const L=numpadLimits(typing,{decimals,maxLength,intLength});
    const t=tone==='warn'?'warn':'';
    const run=!!(label||has(o,'label'));
    const readout=run?`<div class="st-numpad-readout" role="status" aria-live="polite"${suggested?' data-suggested=""':''}><span class="st-numpad-label"${sa(s.label,a.label)}>${esc(label)}</span>${valueBox('div',{value:v,unit,placeholder,active:!suggested},o)}</div>`:'';
    const items=(recent||[]).slice(0,3);
    const list=run||items.length?`<ol class="st-numpad-recent" data-reserve=""${ariaText('Recorded',s.recent,a.recent)}>${items.map(r=>`<li>${tx(r.text,r,'text')}</li>`).join('')}</ol>`:'';
    const k=(d,gray)=>`<button type="button" class="st-numpad-key" data-action="${esc(action)}" data-value="${esc(key)}" data-key="${d}"${gray?' aria-disabled="true"':''}><span${d==='.'?sa(s.decimal,a.decimal):sa(s.digit,s.digit?{n:d}:null)}>${d}</span></button>`;
    const keys=['1','2','3','4','5','6','7','8','9'].map(d=>k(d,L.digitsDead)).join('')
      +(decimals>0?k('.',L.pointDead):'<span class="st-numpad-gap" aria-hidden="true"></span>')
      +k('0',L.digitsDead)
      +`<button type="button" class="st-numpad-key" data-action="${esc(action)}" data-value="${esc(key)}" data-key="back"${typing===''&&!suggested?' aria-disabled="true"':''}${ariaText('Backspace',s.back,a.back)}>${glyph('backspace')}</button>`;
    return `<div class="st-numpad ${esc(className)}" data-ds="Numpad" id="${esc(pid)}" data-field="${esc(key)}"${t?` data-tone="${t}"`:''}${L.digitsDead?' data-full=""':''}>${readout}${hintLine('st-numpad-hint',{text:hint,tone:t,o,reserve:true})}${list}<div class="st-numpad-keys" role="group"${ariaText('Number pad',s.pad,a.pad)}>${keys}</div></div>`;
  }
  /* The pad's string rules, so every host types the same way. state {value, suggested, suggestion};
     returns the next state plus dead: null | 'full' | 'point' | 'empty' (answer it in the hint line). */
  function numpadInput(state,k,{decimals=0,maxLength=null,intLength=null}={}){
    const st={value:String(state&&state.value!=null?state.value:''),suggested:!!(state&&state.suggested),suggestion:String(state&&state.suggestion!=null?state.suggestion:'')};
    const done=(value,suggested=false,dead=null)=>({value,suggested,suggestion:st.suggestion,dead});
    if(k==='back'){
      if(st.suggested)return done(st.value.slice(0,-1));
      if(st.value==='')return st.suggestion?done(st.suggestion,true):done('',false,'empty');
      const next=st.value.slice(0,-1);
      return next===''&&st.suggestion?done(st.suggestion,true):done(next);
    }
    const base=st.suggested?'':st.value,L=numpadLimits(base,{decimals,maxLength,intLength});
    if(k==='.'){
      if(L.pointDead)return done(st.value,st.suggested,'point');
      return done(base===''?'0.':base+'.');
    }
    if(/^[0-9]$/.test(k)){
      if(L.digitsDead)return done(st.value,st.suggested,'full');
      if(decimals>0&&base==='0')return done(k); // weights strip a leading zero; tags keep theirs
      return done(base+k);
    }
    return done(st.value,st.suggested,null);
  }
  /* The committed value: a string, or null when empty (missing is not zero). '16.' → '16'; weights lose leading zeros. */
  function numpadCommit(value,{decimals=0}={}){
    let v=value==null?'':String(value);
    if(v==='')return null;
    if(v.endsWith('.'))v=v.slice(0,-1);
    if(decimals>0)v=v.replace(/^0+(?=\d)/,'');
    return v===''?null:v;
  }
  /* Hardware keyboard and wedge scanners: map a KeyboardEvent to a pad key through the same path.
     Enter returns 'enter' — it never commits; a scanner's trailing Enter only ends its burst. */
  function numpadKey(ev){
    const k=ev&&ev.key;
    if(/^[0-9]$/.test(k||''))return k;
    if(k==='.'||k===','||k==='Decimal')return '.';
    if(k==='Backspace')return 'back';
    if(k==='Enter')return 'enter';
    return null;
  }
  const api=Object.freeze({heading,panel,facts,row,rowGroup,log,categoryFooter,field,pickerField,pickerOptions,chooserList,choiceRow,choiceGroup,choiceSearch,choiceEmpty,segment,iconButton,stepper,measure,numpad,numpadInput,numpadCommit,numpadKey});
  root.SentriUI=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
