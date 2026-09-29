/* @ds-bundle: {"format":4,"namespace":"SentriUI","components":[{"name":"Heading"},{"name":"Panel"},{"name":"Facts"},{"name":"Row"},{"name":"Log"},{"name":"Segment"},{"name":"IconButton"},{"name":"Button"},{"name":"PickerField"},{"name":"ChoiceList"},{"name":"CategoryFooter"},{"name":"Sheet"},{"name":"Icon"},{"name":"Stepper"},{"name":"Measure"},{"name":"Numpad"},{"name":"Status"},{"name":"Banner"},{"name":"Photos"}]} */
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
  /* Candidate (ADR 0002) row options: code (leading mono identifier), title/description as token lists with colour on
     the value, mono (the row law's line 2), chip (one Status word), wrap, rail ('edit' = the ✎ of a done row, 'none'),
     select (a checkbox trail on a <label>), act (a second, one-tap target: the copy is the door, the button acts).
     Without them the output is unchanged. */
  function row({title,description='',icon='',action='',value='',className='',disabled=false,trailing='',attrs={},strs,args,code='',mono=false,chip=null,wrap=false,rail='',select=null,act=null,tight=false}={}){
    const o={strs,args};
    const safeAttrs=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    // With strs.trailing the value is plain fallback text (escaped); without it, trailing stays trusted raw HTML.
    const trail=has(o,'trailing')?`<span class="st-row-trailing">${tx(trailing,o,'trailing')}</span>`:trailing?`<span class="st-row-trailing">${trailing}</span>`:'';
    const tList=Array.isArray(title),dList=Array.isArray(description);
    const titleHtml=tList?toks(title,{tight}):tx(title,o,'title');
    const showDesc=dList?description.length>0:(description||has(o,'description'));
    const small=showDesc?`<small${mono?' data-mono=""':''}${dList?' data-sep="dot"':''}>${dList?toks(description,{tight,dot:true}):tx(description,o,'description')}</small>`:'';
    const codeHtml=code||has(o,'code')?`<span class="st-row-code">${tx(code,o,'code')}</span>`:'';
    const chipHtml=chip?status(Object.assign({},chip,{className:'st-row-chip'})):'';
    const wrapAttr=wrap?' data-wrap=""':'';
    const edit=`<span class="st-row-chevron" data-rail="edit">${glyph('edit')}</span>`;
    if(select){
      return `<label class="st-row ${esc(className)}" data-ds="Row" data-select=""${wrapAttr}${safeAttrs}>${codeHtml}<span class="st-row-copy"><strong>${titleHtml}</strong>${small}</span>${chipHtml}<span class="st-choice-trail"><input type="checkbox" data-action="${esc(select.action||'select')}" value="${esc(select.value!=null?select.value:value)}"${select.checked?' checked':''}></span></label>`;
    }
    if(act){
      const door=`<button type="button" class="st-row-door" data-action="${esc(action)}" data-value="${esc(value)}">${codeHtml}<span class="st-row-copy"><strong>${titleHtml}<span class="st-row-door-chevron">${arrow}</span></strong>${small}</span></button>`;
      return `<div class="st-row ${esc(className)}" data-ds="Row" data-act=""${wrapAttr}${safeAttrs}>${door}${chipHtml}${button(Object.assign({register:'secondary'},act))}</div>`;
    }
    const tag=action?'button':'div';
    const railHtml=rail==='edit'?edit:action&&rail!=='none'?`<span class="st-row-chevron">${arrow}</span>`:'';
    return `<${tag} class="st-row ${esc(className)}" data-ds="Row"${action?` type="button" data-action="${esc(action)}" data-value="${esc(value)}"${disabled?' disabled aria-disabled="true"':''}`:''}${wrapAttr}${safeAttrs}>${icon?`<span class="st-row-icon">${icon}</span>`:''}${codeHtml}<span class="st-row-copy"><strong>${titleHtml}</strong>${small}</span>${chipHtml}${trail}${railHtml}</${tag}>`;
  }
  /* groups: [{label, strs:{label}, args:{label}, entries:[{category,title,detail,meta,strs:{…},args:{…}}]}]; options.strs.empty for the empty line. */
  function log(groups,{className='',empty='No activity recorded yet',strs,args}={}){
    const nonempty=groups.filter(g=>g.entries?.length);
    if(!nonempty.length)return panel(`<p class="st-empty">${tx(empty,{strs,args},'empty')}</p>`,{className:'st-log '+className,ds:'Log'});
    return panel(nonempty.map(g=>`<section class="st-log-group">${g.label||has(g,'label')?heading({title:g.label,kind:'group',description:g.description||'',strs:has(g,'label')||has(g,'description')?{title:g.strs.label,description:g.strs.description}:undefined,args:g.args&&(g.args.label||g.args.description)?{title:g.args.label,description:g.args.description}:undefined}):''}<div class="st-log-entries">${g.entries.map(e=>`<article class="st-log-entry">${e.category||has(e,'category')?`<span class="st-log-category">${tx(e.category,e,'category')}</span>`:''}<strong class="st-log-title">${tx(e.title,e,'title')}</strong>${e.detail||has(e,'detail')?`<p>${tx(e.detail,e,'detail')}</p>`:''}${e.meta||has(e,'meta')?`<small>${tx(e.meta,e,'meta')}</small>`:''}${e.extraHtml?`<div class="st-log-extra">${e.extraHtml}</div>`:''}</article>`).join('')}</div></section>`).join(''),{className:'st-log '+className,ds:'Log'});
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
  function choiceRow({label='',meta='',mode='single',action='',value='',selected=false,attrs={},className='',mono=false,tabindex=null,strs,args}={}){
    const o={strs,args};
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const copy=`<span class="st-choice-copy"><span class="st-choice-label"${mono?' data-mono=""':''}>${tx(label,o,'label')}</span>${meta||has(o,'meta')?`<span class="st-choice-meta">${tx(meta,o,'meta')}</span>`:''}</span>`;
    // radio (candidate, ADR 0002): a visible ring in the trailing slot; role=radio inside a radiogroup (choiceGroup radio:true).
    if(mode==='radio')return `<button type="button" class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="radio" role="radio" aria-checked="${selected?'true':'false'}"${tabindex!=null?` tabindex="${esc(tabindex)}"`:''} data-action="${esc(action)}" data-value="${esc(value)}"${extra}>${copy}<span class="st-choice-trail" aria-hidden="true"><span class="st-radio"></span></span></button>`;
    if(mode==='multi')return `<label class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="multi">${copy}<span class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${selected?' checked':''}${extra}></span></label>`;
    const trail=mode==='navigate'?chevron:selected?check:'';
    const state=mode==='single'?` aria-pressed="${selected?'true':'false'}"`:'';
    return `<button type="button" class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="${mode==='navigate'?'navigate':'single'}" data-action="${esc(action)}" data-value="${esc(value)}"${state}${extra}>${copy}<span class="st-choice-trail" aria-hidden="true">${trail}</span></button>`;
  }
  // lead: optional control between heading and panel (e.g. a segment that filters only this group).
  // radio (candidate, ADR 0002): the panel is the radiogroup, labelled by the heading.
  function choiceGroup(rows,{title='',lead='',className='',radio=false,id='',strs,args}={}){
    const body=Array.isArray(rows)?rows.join(''):rows;
    const showTitle=title||has({strs},'title');
    const hid=radio&&showTitle?(id||fieldId('st-choice'))+'-title':'';
    return `<section class="st-choice-group ${esc(className)}" data-ds="ChoiceList"${title?` aria-label="${esc(title)}"`:''}>${showTitle?`<h5 class="st-choice-heading"${hid?` id="${esc(hid)}"`:''}>${tx(title,{strs,args},'title')}</h5>`:''}${lead?`<div class="st-choice-lead">${lead}</div>`:''}<div class="st-choice-panel"${radio?` role="radiogroup"${hid?` aria-labelledby="${esc(hid)}"`:''}`:''}>${body}</div></section>`;
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
     Stepper keys add data-step (a requested delta, −step | step), Numpad keys add data-key (0–9 | . | back),
     hint actions add their own action. Delegate with closest('[data-action]'). The components never commit:
     the host decides whether a request posts at once (immediate hosts) or changes a draft (staged hosts).
     Each card keeps one persistent status region (its hint line, role=status) that its controls point to
     with aria-describedby; patch by field key and keep roots mounted so focus and live regions survive.
     The floor-gray (DS README, States): a key with nothing to do is aria-disabled, still tappable, and the
     host answers the tap in that status region. */
  let fieldUid=0;
  const fieldId=p=>`${p}-${++fieldUid}`;
  const glyph=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${(root.SentriIcons&&root.SentriIcons.paths[k])||''}"/></svg>`;
  // aria-label with an optional registry twin (the shell fills it through data-str-attr).
  const ariaText=(text,id,args)=>` aria-label="${esc(text)}"${id?` data-str-attr="aria-label:${esc(id)}"${args?` data-args="${esc(JSON.stringify(args))}"`:''}`:''}`;
  const hintTone=t=>t==='warn'||t==='refused'?'amber':'muted';
  // Text actions (the fourth register, ≥44px): [{label, action, value, strs:{label}, args}].
  const textActions=(list,key)=>(list||[]).map(p=>`<button type="button" class="st-text-action" data-action="${esc(p.action||'')}" data-value="${esc(p.value!=null?p.value:key)}">${tx(p.label,p,'label')}</button>`).join('');
  /* The card's one persistent status region. Always mounted (an empty live region still announces later);
     reserve: '' (no height when empty) · 'text' (one line) · 'action' (44px: room for a text action or two lines). */
  function hintLine(cls,{id='',text='',tone='',o={},key='hint',reserve='',actions=[],fieldKey=''}={}){
    const show=text||has(o,key);
    const acts=textActions(actions,fieldKey);
    const body=`${show?`<span class="st-field-hint-text">${tx(text,o,key)}</span>`:''}${acts}`;
    return `<p class="st-field-hint ${cls}" id="${esc(id)}" role="status" aria-live="polite" data-tone="${show?hintTone(tone):'muted'}"${reserve?` data-reserve="${esc(reserve)}"`:''}>${body}</p>`;
  }
  /* Stepper: `− n +`, the one counting shape. variant 'row' (a 60px sheet row) or 'hero' (the count sheet's one number).
     A key emits a requested delta; the host posts it (immediate host) or adds it to a draft (staged host).
     pointers: text actions shown in the status region at the floor. */
  function stepper({label='',description='',value=0,min=0,max=null,step=1,action='step',key='',variant='row',changed=false,draft=false,tone='',hint='',pointers=[],reserveHint,id='',className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{};
    const n=Number(value)||0,hero=variant==='hero',lid=id||fieldId('st-stepper'),hid=lid+'-hint',d=Math.abs(Number(step)||1);
    const floorGray=n<=min,ceilGray=max!=null&&n>=max;
    // draft: the value carries an unsaved staged addition (green, the number is the receipt); it wins over changed.
    const isDraft=draft||tone==='draft',isChanged=!isDraft&&(changed||tone==='changed');
    const key1=(dir,gray)=>{const kid=`${lid}-${dir<0?'dec':'inc'}`;return `<button type="button" class="st-stepper-key" id="${esc(kid)}" data-action="${esc(action)}" data-value="${esc(key)}" data-step="${dir*d}" aria-labelledby="${esc(lid)} ${esc(kid)}" aria-describedby="${esc(hid)}"${gray?' aria-disabled="true"':''}${dir<0?ariaText('Decrease',s.decrease,a.decrease):ariaText('Increase',s.increase,a.increase)}><span class="st-stepper-face">${glyph(dir<0?'minus':'plus')}</span></button>`;};
    const copy=`<span class="st-stepper-copy"><span class="st-stepper-label" id="${esc(lid)}">${tx(label,o,'label')}</span>${description||has(o,'description')?`<small class="st-stepper-description">${tx(description,o,'description')}</small>`:''}</span>`;
    const vargs=a.value||(s.value?{n:String(n)}:null);
    const val=`<span class="st-stepper-value" role="spinbutton" tabindex="0" aria-labelledby="${esc(lid)}" aria-describedby="${esc(hid)}" aria-valuenow="${n}" aria-valuemin="${esc(min)}"${max!=null?` aria-valuemax="${esc(max)}"`:''} aria-live="polite"${sa(s.value,vargs)}>${esc(n)}</span>`;
    const canPoint=hero||min>0||pointers.length>0;
    const reserve=reserveHint!=null?(reserveHint?(canPoint?'action':'text'):''):(canPoint?'action':max!=null?'text':'');
    const hl=hintLine('st-stepper-hint',{id:hid,text:hint,o,reserve,actions:pointers,fieldKey:key});
    return `<div class="st-stepper ${esc(className)}" data-ds="Stepper" data-variant="${hero?'hero':'row'}" data-field="${esc(key)}" role="group" aria-labelledby="${esc(lid)}"${n===0?' data-zero=""':''}${isChanged?' data-changed=""':''}${isDraft?' data-draft=""':''}${max!=null&&max>=1000?' data-wide=""':''}>${copy}<span class="st-stepper-keys">${key1(-1,floorGray)}${val}${key1(1,ceilGray)}</span>${hl}</div>`;
  }
  /* The box a measured or typed value sits in; shared by Measure (a button) and the Numpad readout (static).
     live: the value announces as it is typed (concise: the value only, never the label). */
  function valueBox(tag,{value='',unit='',unitGap=true,placeholder='—',active=false,live=false,attrs='',vid='',uid=''},o){
    const empty=value===''||value==null,s=o.strs||{},a=o.args||{};
    const shown=empty?(active?'':placeholder):String(value);
    const sid=empty?(active?'':s.placeholder):s.value,sargs=empty?a.placeholder:(a.value||(s.value?{n:String(value)}:null));
    return `<${tag} class="st-measure-box"${unitGap?'':' data-unit-gap="none"'}${attrs}><span class="st-measure-value"${vid?` id="${esc(vid)}"`:''}${live?' aria-live="polite" aria-atomic="true"':''}${sid?sa(sid,sargs):''}>${esc(shown)}</span>${unit||has(o,'unit')?`<span class="st-measure-unit"${uid?` id="${esc(uid)}"`:''}>${tx(unit,o,'unit')}</span>`:''}</${tag}>`;
  }
  /* Measure: one measured value, mono, unit always written. A button that opens the docked Numpad (active).
     range is evaluated only when the pad is closed (active false), never per keystroke. */
  function measure({label='',optional='',value='',unit='',unitGap=true,placeholder='—',action='open-numpad',key='',active=false,controls='',range=null,tone='',changed=false,hint='',note='',id='',className='',strs,args}={}){
    const o={strs,args},lid=id||fieldId('st-measure'),v=value==null?'':String(value),num=parseFloat(v);
    const out=!active&&Array.isArray(range)&&v!==''&&!Number.isNaN(num)&&(num<range[0]||num>range[1]);
    const t=tone==='refused'?'refused':tone==='warn'||out?'warn':'';
    const isChanged=changed||tone==='changed';
    const lab=`<span class="st-measure-label" id="${esc(lid)}"><span${sa(o.strs&&o.strs.label,o.args&&o.args.label)}>${esc(label)}</span>${optional||has(o,'optional')?`<small>${tx(optional,o,'optional')}</small>`:''}</span>`;
    const vid=lid+'-value',uid=lid+'-unit',hid=lid+'-hint',nid=lid+'-note';
    const hasNote=!!(note||has(o,'note'));
    const box=valueBox('button',{value:v,unit,unitGap,placeholder,active,live:active,vid,uid,attrs:` type="button" data-action="${esc(action)}" data-value="${esc(key)}" aria-labelledby="${esc(lid)} ${esc(vid)} ${esc(uid)}" aria-describedby="${esc(hid)}${hasNote?' '+esc(nid):''}" aria-expanded="${active?'true':'false'}"${controls?` aria-controls="${esc(controls)}"`:''}`},o);
    const hl=hintLine('st-measure-hint',{id:hid,text:hint,tone:t,o});
    const nl=hasNote?`<p class="st-field-hint st-measure-note" id="${esc(nid)}" data-tone="muted">${tx(note,o,'note')}</p>`:'';
    return `<div class="st-measure ${esc(className)}" data-ds="Measure" data-field="${esc(key)}"${v===''?' data-empty=""':''}${active?' data-active=""':''}${t?` data-tone="${t}"`:''}${isChanged?' data-changed=""':''}>${lab}${box}${hl}${nl}</div>`;
  }
  /* Numpad: the one type-to-set pad, for real typed input only (ear tags, weights), docked above the bar.
     1–9 · [. or a gap] 0 ⌫. No commit key: the bar's primary commits. Keys never move: the feedback region
     (status line + running list) above them has a fixed height and scrolls inside itself. */
  function numpadLimits(v,{decimals=0,maxLength=null,intLength=null}={}){
    const dot=v.indexOf('.'),intPart=dot<0?v:v.slice(0,dot),frac=dot<0?'':v.slice(dot+1);
    const digitsDead=dot>=0?frac.length>=decimals:((maxLength!=null&&v.length>=maxLength)||(intLength!=null&&intPart.length>=intLength));
    return {dot,digitsDead,pointDead:decimals<=0||dot>=0};
  }
  function numpad({compact=false,label='',value='',unit='',placeholder='—',suggested=false,decimals=0,maxLength=null,intLength=null,recent=null,id='',action='numpad',key='',tone='',hint='',actions=[],className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},pid=id||fieldId('st-numpad'),hid=pid+'-hint';
    const v=value==null?'':String(value),typing=suggested?'':v;
    const L=numpadLimits(typing,{decimals,maxLength,intLength});
    const t=tone==='warn'?'warn':'';
    const run=!!(label||has(o,'label'));
    const readout=run?`<div class="st-numpad-readout"${suggested?' data-suggested=""':''}><span class="st-numpad-label"${sa(s.label,a.label)}>${esc(label)}</span>${valueBox('div',{value:v,unit,placeholder,active:!suggested,live:true},o)}</div>`:'';
    const items=(recent||[]).slice(0,3);
    const list=run&&!compact?`<ol class="st-numpad-recent"${ariaText('Recorded',s.recent,a.recent)}>${items.map(r=>`<li${r.tone==='warn'?' data-tone="amber"':''}>${tx(r.text,r,'text')}</li>`).join('')}</ol>`:'';
    const feedback=`<div class="st-numpad-feedback"${run?' data-run=""':''}${compact?' data-compact=""':''}>${hintLine('st-numpad-hint',{id:hid,text:hint,tone:t,o,reserve:'action',actions,fieldKey:key})}${list}</div>`;
    const k=(d,gray)=>`<button type="button" class="st-numpad-key" data-action="${esc(action)}" data-value="${esc(key)}" data-key="${d}"${gray?' aria-disabled="true"':''}><span${d==='.'?sa(s.decimal,a.decimal):sa(s.digit,s.digit?{n:d}:null)}>${d}</span></button>`;
    const keys=['1','2','3','4','5','6','7','8','9'].map(d=>k(d,L.digitsDead)).join('')
      +(decimals>0?k('.',L.pointDead):'<span class="st-numpad-gap" aria-hidden="true"></span>')
      +k('0',L.digitsDead)
      +`<button type="button" class="st-numpad-key" data-action="${esc(action)}" data-value="${esc(key)}" data-key="back"${typing===''&&!suggested?' aria-disabled="true"':''}${ariaText('Backspace',s.back,a.back)}>${glyph('backspace')}</button>`;
    return `<div class="st-numpad ${esc(className)}" data-ds="Numpad" id="${esc(pid)}" data-field="${esc(key)}"${t?` data-tone="${t}"`:''}${L.digitsDead?' data-full=""':''}>${readout}${feedback}<div class="st-numpad-keys" role="group" aria-describedby="${esc(hid)}"${ariaText('Number pad',s.pad,a.pad)}>${keys}</div></div>`;
  }
  /* The pad's string rules, so every host types the same way. state {value, suggested, suggestion}; value is
     always a string. Keys: '0'–'9' · '.' · 'back' · 'suggestion' (the named "Use 000258" transition).
     Returns the next state plus dead: null | 'full' | 'point' | 'empty' (answer it in the status region). */
  function numpadInput(state,k,{decimals=0,maxLength=null,intLength=null}={}){
    const st={value:String(state&&state.value!=null?state.value:''),suggested:!!(state&&state.suggested),suggestion:String(state&&state.suggestion!=null?state.suggestion:'')};
    const done=(value,suggested=false,dead=null)=>({value,suggested,suggestion:st.suggestion,dead});
    if(k==='suggestion')return st.suggestion?done(st.suggestion,true):done(st.value,st.suggested,'empty');
    if(k==='back'){
      if(st.suggested)return done(st.value.slice(0,-1));       // a suggestion becomes typed ink, minus its last digit
      if(st.value==='')return done('',false,'empty');          // cleared is a stable empty (missing); never back to the suggestion
      return done(st.value.slice(0,-1));
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
  /* A scan (camera, or a wedge burst) is one atomic replacement: it replaces whatever is typed or suggested.
     Valid when digits only and, for tags, exactly maxLength long; otherwise the state is kept and dead is 'scan'. */
  function numpadScan(state,scanned,{maxLength=null}={}){
    const st={value:String(state&&state.value!=null?state.value:''),suggested:!!(state&&state.suggested),suggestion:String(state&&state.suggestion!=null?state.suggestion:'')};
    const v=String(scanned==null?'':scanned).trim();
    if(!/^[0-9]+$/.test(v)||(maxLength!=null&&v.length!==maxLength))return {...st,dead:'scan',scanned:false};
    return {value:v,suggested:false,suggestion:st.suggestion,dead:null,scanned:true};
  }
  /* The committed value: a string, or null when empty (missing is not zero). '16.' → '16'; weights lose leading zeros. */
  function numpadCommit(value,{decimals=0}={}){
    let v=value==null?'':String(value);
    if(v==='')return null;
    if(v.endsWith('.'))v=v.slice(0,-1);
    if(decimals>0)v=v.replace(/^0+(?=\d)/,'');
    return v===''?null:v;
  }
  /* Hardware keyboard: map a KeyboardEvent to a pad key. Enter returns 'enter' — it never commits. */
  function numpadKey(ev){
    const k=ev&&ev.key;
    if(/^[0-9]$/.test(k||''))return k;
    if(k==='.'||k===','||k==='Decimal')return '.';
    if(k==='Backspace')return 'back';
    if(k==='Enter')return 'enter';
    return null;
  }
  /* Wedge-scanner burst detection. A burst is ≥ minKeys digits, each within gap ms of the one before, ending
     in Enter within gap ms: it is delivered once to onScan(digits) and never typed. Anything else is released
     to onKey(key) as ordinary keystrokes (held at most gap ms). Enter outside a burst is dropped: it never commits.
     now and later are injectable for tests. */
  function numpadScanner({onKey=()=>{},onScan=()=>{},gap=35,minKeys=4,now=()=>Date.now(),later=(f,ms)=>setTimeout(f,ms),cancel=h=>clearTimeout(h)}={}){
    let buf=[],last=0,timer=null;
    const release=()=>{const b=buf;buf=[];if(timer!=null){cancel(timer);timer=null;}b.forEach(x=>onKey(x));};
    return {
      handle(ev){
        const k=numpadKey(ev);if(k==null)return false;
        const t=now();
        if(buf.length&&t-last>gap)release();
        last=t;
        if(k==='enter'){
          const digits=buf.join('');
          if(buf.length>=minKeys&&/^[0-9]+$/.test(digits)){buf=[];if(timer!=null){cancel(timer);timer=null;}onScan(digits);}
          else release();
          return true;
        }
        if(!/^[0-9]$/.test(k)){release();onKey(k);return true;}
        buf.push(k);
        if(timer!=null)cancel(timer);
        timer=later(()=>{timer=null;release();},gap);
        return true;
      },
      flush:release
    };
  }
  /* ---- Design-system candidates 2 (candidate, ADR 0002): Status, Banner, Photos, the Button factory with its
     text / tool registers, waiting face and hold, ChoiceList radio. ----
     Colour lives on the value, the word stays ink (RULINGS, 2026-09-03). A part is a string or
     { text, tone, mono, strs:{text}, args:{text} }; a token is a part or a list of parts (a word and its value);
     tone is amber · progress · green · red · muted and colours only that part. */
  const TONES=['amber','progress','green','red','muted'];
  const toneOf=t=>TONES.includes(t)?t:'';
  function part(p){
    if(p==null||p==='')return '';
    if(typeof p!=='object')return esc(p);
    const t=toneOf(p.tone),inner=tx(p.text,p,'text');
    return t||p.mono?`<span class="st-part"${t?` data-tone="${t}"`:''}${p.mono?' data-mono=""':''}>${inner}</span>`:inner;
  }
  // tokens: each is wrapped so a container with data-sep="dot" draws the `·` between them; parts in a token join by a space
  // (tight: no space, for zh strings that carry none).
  function toks(list,{tight=false,dot=false}={}){
    return (list||[]).filter(t=>t!=null&&t!=='').map(t=>`<span class="st-tok">${Array.isArray(t)?t.map(part).join(tight?'':' '):part(t)}</span>`).join(tight||dot?'':' ');
  }
  /* Status · word: a coloured state word with a 4px dot (`due now`, `sow died`) — never a filled badge. */
  function status({text='',tone='muted',className='',strs,args}={}){
    return `<span class="st-status ${esc(className)}" data-ds="Status" data-tone="${toneOf(tone)||'muted'}">${tx(text,{strs,args},'text')}</span>`;
  }
  /* Status · line: one body line whose values carry the colour (the receipt: `Saved · +4 this visit`).
     live: a persistent role=status region the host patches in place. sep 'dot' draws `·` between tokens. */
  function statusLine(tokens,{live=false,sep='',mono=false,tight=false,id='',className=''}={}){
    return `<p class="st-status-line ${esc(className)}" data-ds="Status"${id?` id="${esc(id)}"`:''}${live?' role="status" aria-live="polite"':''}${mono?' data-mono=""':''}${sep==='dot'?' data-sep="dot"':''}>${toks(tokens,{tight,dot:sep==='dot'})}</p>`;
  }
  /* Banner: a headline over its consequence, on a wash. tone 'danger' (red: an irreversible act or a terminal
     fact) or 'correction' (amber wash: Edit's banner, with a live change summary and the Clear text action). */
  function banner({tone='danger',headline='',consequence='',summary=null,actions=[],live=false,id='',className='',strs,args}={}){
    const o={strs,args},t=tone==='correction'?'correction':'danger';
    const cons=consequence||has(o,'consequence')?`<span class="st-banner-consequence">${tx(consequence,o,'consequence')}</span>`:'';
    const sumHtml=summary==null?'':Array.isArray(summary)?toks(summary,{dot:true}):tx(summary,o,'summary');
    const sum=summary==null&&!has(o,'summary')?'':`<div class="st-banner-summary"><p class="st-banner-summary-text"${id?` id="${esc(id)}-summary"`:''} role="status" aria-live="polite"${Array.isArray(summary)?' data-sep="dot"':''}>${sumHtml}</p>${textActions(actions,'')}</div>`;
    return `<div class="st-banner ${esc(className)}" data-ds="Banner" data-tone="${t}"${id?` id="${esc(id)}"`:''}${live?' role="status" aria-live="polite"':''}><strong class="st-banner-headline">${tx(headline,o,'headline')}</strong>${cons}${sum}</div>`;
  }
  /* Photos: the record's photo field — a well card, the label and the camera circle on one 44px row, thumbnails
     beneath it. Inactive until there is something to attach to (the camera is floor-gray: aria-disabled, still
     tappable, answered in the hint). At max the camera grays the same way. Thumbnails open the viewer. */
  function photos({label='Photos',optional='',count=null,active=true,items=[],max=12,action='photo-add',viewAction='photo-view',key='photos',hint='',id='',className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},pid=id||fieldId('st-photos'),hid=pid+'-hint',lid=pid+'-label';
    const list=items||[],full=list.length>=max,gray=!active||full;
    const countHtml=count==null?'':`<small class="st-photos-count"${Array.isArray(count)?' data-sep="dot"':''}>${Array.isArray(count)?toks(count,{dot:true}):part(count)}</small>`;
    const head=`<div class="st-photos-head"><span class="st-photos-label" id="${esc(lid)}"><span${sa(s.label,a.label)}>${esc(label)}</span>${optional||has(o,'optional')?`<small>${tx(optional,o,'optional')}</small>`:''}${countHtml}</span><button type="button" class="st-photos-camera" data-action="${esc(action)}" data-value="${esc(key)}" aria-describedby="${esc(hid)}"${gray?' aria-disabled="true"':''}${ariaText('Take a photo',s.camera,a.camera)}>${glyph('camera')}</button></div>`;
    const thumbs=list.length?`<ul class="st-photos-items" aria-labelledby="${esc(lid)}">${list.map((it,i)=>`<li><button type="button" class="st-photos-thumb" data-action="${esc(viewAction)}" data-value="${esc(it.id!=null?it.id:i)}"${ariaText(it.alt||`Photo ${i+1}`,s.thumb,{n:i+1})}>${it.src?`<img src="${esc(it.src)}" alt="">`:`<span class="st-photos-index"${sa(s.index,{n:i+1})}>${i+1}</span>`}</button></li>`).join('')}</ul>`:'';
    return `<div class="st-photos ${esc(className)}" data-ds="Photos" data-field="${esc(key)}"${!active?' data-inactive=""':''}${full?' data-full=""':''}>${head}${thumbs}${hintLine('st-photos-hint',{id:hid,text:hint,o})}</div>`;
  }
  /* Button, as a factory. Registers (RULINGS, three button registers + the text action): primary (the one commit,
     ink) · secondary (an exit, outlined) · tool (a mid-sheet act, a soft well, no border) · text (the quietest: a bare
     word, 13px, no container, ≥44px) · danger · end-early. waiting: the waiting face — present, quiet, focusable
     (aria-disabled, never disabled); the tap reaches the host, which answers in a buttonReason line. */
  const REGISTER={primary:'button primary',secondary:'button secondary',tool:'button tool',danger:'button danger','end-early':'button task-end-early'};
  function button({label='',register='secondary',action='',value='',waiting=false,describedby='',attrs={},className='',strs,args}={}){
    const o={strs,args},r=register==='text'||REGISTER[register]?register:'secondary';
    const safe=Object.entries(attrs||{}).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const cls=r==='text'?'st-text-action':REGISTER[r];
    return `<button type="button" class="${cls}${className?' '+esc(className):''}" data-ds="Button" data-register="${r}" data-action="${esc(action)}" data-value="${esc(value)}"${waiting?' aria-disabled="true"':''}${describedby?` aria-describedby="${esc(describedby)}"`:''}${safe}>${tx(label,o,'label')}</button>`;
  }
  /* The reason a waiting button waits (or a refused tap's answer), one persistent status line beside the bar. */
  function buttonReason({text='',id='',actions=[],className='',strs,args}={}){
    const o={strs,args},show=text||has(o,'text');
    return `<p class="st-field-hint st-button-reason ${esc(className)}" data-ds="Button"${id?` id="${esc(id)}"`:''} role="status" aria-live="polite" data-tone="muted">${show?`<span class="st-field-hint-text">${tx(text,o,'text')}</span>`:''}${textActions(actions,'')}</p>`;
  }
  /* Hold-to-commit (Button `hold`): the suite's irreversible acts (Lock born N, the sow's death, End task).
     phase idle · holding (the sweep runs for hold-commit) · armed (keyboard: the second press commits) · pending (sent).
     The caption under the verb is the button's own live line; the host sets it per phase. */
  function holdButton({label='',caption='',action='hold',value='',tone='danger',phase='idle',id='',className='',strs,args}={}){
    const o={strs,args},bid=id||fieldId('st-hold'),cid=bid+'-caption';
    const p=['idle','holding','armed','pending'].includes(phase)?phase:'idle';
    return `<button type="button" class="button ${tone==='primary'?'primary':'danger'} st-hold${className?' '+esc(className):''}" id="${esc(bid)}" data-ds="Button" data-register="hold" data-action="${esc(action)}" data-value="${esc(value)}" data-phase="${p}" aria-describedby="${esc(cid)}"${p==='pending'?' aria-disabled="true" aria-busy="true"':''}><span class="st-hold-label">${tx(label,o,'label')}</span><small class="st-hold-caption" id="${esc(cid)}" aria-live="polite">${tx(caption,o,'caption')}</small></button>`;
  }
  /* The hold's rules, pure. event: 'down' · 'up' (with held ms) · 'leave' · 'cancel' · 'blur' · 'escape' · 'elapsed'
     (hold-commit ran out) · 'key' (a keyboard or switch press) · 'timeout' (hold-arm ran out) · 'done' · 'failed'.
     Returns { phase, commit, cue }: commit is true exactly once; cue names what the caption should say
     ('keep' holding · 'tap' a tap, not a hold · 'released' · 'again' press again · null). */
  function holdStep(state,event){
    const phase=(state&&state.phase)||'idle',ev=typeof event==='string'?{type:event}:(event||{});
    const out=(p,commit=false,cue=null)=>({phase:p,commit,cue});
    if(phase==='pending')return ev.type==='done'||ev.type==='failed'?out('idle'):out('pending');
    switch(ev.type){
      case 'down':return phase==='holding'?out('holding'):out('holding',false,'keep');
      case 'elapsed':return phase==='holding'?out('pending',true):out(phase);
      case 'up':return phase==='holding'?out('idle',false,(ev.held||0)<300?'tap':'released'):out(phase);
      case 'leave':case 'cancel':case 'blur':case 'escape':return phase==='holding'||phase==='armed'?out('idle',false,phase==='holding'?'released':null):out(phase);
      case 'key':return phase==='armed'?out('pending',true):phase==='idle'?out('armed',false,'again'):out(phase);
      case 'timeout':return phase==='armed'?out('idle'):out(phase);
      default:return out(phase);
    }
  }
  /* Wires every hold button under root. onPhase(el, phase, cue) lets the host set the caption; onCommit(el) runs once
     per completed hold or second keyboard press. Returns { destroy }. */
  function holdBind(root,{selector='.st-hold',ms=850,armMs=5000,onPhase=()=>{},onCommit=()=>{},now=()=>Date.now()}={}){
    let el=null,t0=0,timer=null,armTimer=null;
    const step=(b,e)=>{const r=holdStep({phase:b.getAttribute('data-phase')},e);b.setAttribute('data-phase',r.phase);if(r.phase==='pending')b.setAttribute('aria-disabled','true');onPhase(b,r.phase,r.cue);if(r.commit)onCommit(b);return r;};
    const clear=()=>{clearTimeout(timer);timer=null;el=null;};
    const down=e=>{const b=e.target.closest&&e.target.closest(selector);if(!b||e.button!==0||b.getAttribute('aria-disabled')==='true')return;e.preventDefault();if(b.setPointerCapture&&e.pointerId!=null)b.setPointerCapture(e.pointerId);el=b;t0=now();clearTimeout(armTimer);step(b,'down');timer=setTimeout(()=>{const x=el;clear();if(x&&x.isConnected)step(x,'elapsed');},ms);};
    const up=()=>{if(!el)return;const x=el,held=now()-t0;clear();step(x,{type:'up',held});};
    const move=e=>{if(!el)return;const r=el.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){const x=el;clear();step(x,'leave');}};
    const cancel=()=>{if(!el)return;const x=el;clear();step(x,'cancel');};
    const click=e=>{const b=e.target.closest&&e.target.closest(selector);if(!b||e.detail!==0)return;if(b.getAttribute('aria-disabled')==='true')return;const r=step(b,'key');clearTimeout(armTimer);if(r.phase==='armed')armTimer=setTimeout(()=>{if(b.getAttribute('data-phase')==='armed')step(b,'timeout');},armMs);};
    const blur=e=>{const b=e.target.closest&&e.target.closest(selector);if(b&&['holding','armed'].includes(b.getAttribute('data-phase'))){if(el===b)clear();step(b,'blur');}};
    const key=e=>{if(e.key!=='Escape')return;root.querySelectorAll(selector).forEach(b=>{if(['holding','armed'].includes(b.getAttribute('data-phase'))){if(el===b)clear();step(b,'escape');}});};
    const menu=e=>{if(e.target.closest&&e.target.closest(selector))e.preventDefault();};
    const on=[['pointerdown',down],['pointerup',up],['pointermove',move],['pointercancel',cancel],['click',click],['focusout',blur],['keydown',key],['contextmenu',menu]];
    on.forEach(([n,f])=>root.addEventListener(n,f));
    return {destroy(){clear();clearTimeout(armTimer);on.forEach(([n,f])=>root.removeEventListener(n,f));}};
  }
  /* ChoiceList radio as a field (candidate, ADR 0002). layout 'rows': a ChoiceList group whose rows carry a visible
     radio (the whole row is the target). layout 'inline': the Stepper's silhouette — label left, two or three short
     options right, one 60px row (the sex field). Roving tabindex: the selected option (or the first) is the tab stop;
     the host moves selection on ArrowUp/Down/Left/Right. An optional field clears when its chosen radio is tapped again. */
  function choiceRadios({label='',optional='',options=[],selected='',action='choose',key='',layout='rows',lead='',id='',className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},rid=id||fieldId('st-radios');
    const stop=options.some(x=>x.value===selected)?selected:(options[0]&&options[0].value);
    if(layout!=='inline'){
      const rows=options.map(x=>choiceRow({mode:'radio',label:x.label,meta:x.meta||'',value:x.value,action,selected:x.value===selected,mono:!!x.mono,tabindex:x.value===stop?0:-1,attrs:{'data-field':key},strs:x.strs,args:x.args}));
      return choiceGroup(rows,{title:label,lead,radio:true,id:rid,className,strs:s.label?{title:s.label}:undefined,args:a.label?{title:a.label}:undefined});
    }
    const lid=rid+'-label';
    const opt=x=>`<button type="button" class="st-choice-inline-opt" role="radio" aria-checked="${x.value===selected?'true':'false'}" tabindex="${x.value===stop?0:-1}" data-action="${esc(action)}" data-value="${esc(x.value)}"><span class="st-radio" aria-hidden="true"></span><span${x.mono?' data-mono=""':''}>${tx(x.label,x,'label')}</span></button>`;
    return `<div class="st-choice-inline ${esc(className)}" data-ds="ChoiceList" data-mode="radio" data-field="${esc(key)}" role="radiogroup" aria-labelledby="${esc(lid)}"><span class="st-choice-inline-label" id="${esc(lid)}"><span${sa(s.label,a.label)}>${esc(label)}</span>${optional||has(o,'optional')?`<small>${tx(optional,o,'optional')}</small>`:''}</span><span class="st-choice-inline-opts">${options.map(opt).join('')}</span></div>`;
  }
  const api=Object.freeze({heading,panel,facts,row,rowGroup,log,categoryFooter,field,pickerField,pickerOptions,chooserList,choiceRow,choiceGroup,choiceSearch,choiceEmpty,segment,iconButton,stepper,measure,numpad,numpadInput,numpadScan,numpadCommit,numpadKey,numpadScanner,status,statusLine,banner,photos,button,buttonReason,holdButton,holdStep,holdBind,choiceRadios});
  root.SentriUI=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
