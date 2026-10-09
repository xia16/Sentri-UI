/* @ds-bundle: {"format":4,"namespace":"SentriUI","components":[{"name":"Heading"},{"name":"Panel"},{"name":"Facts"},{"name":"Row"},{"name":"Log"},{"name":"Segment"},{"name":"IconButton"},{"name":"Button"},{"name":"PickerField"},{"name":"ChoiceList"},{"name":"CategoryFooter"},{"name":"Sheet"},{"name":"Icon"},{"name":"Stepper"},{"name":"Measure"},{"name":"Numpad"},{"name":"Status"},{"name":"ConditionTag"},{"name":"Banner"},{"name":"Photos"}]} */
/* SentriIcons (sentri-icons.js) and the SentriUI parts, in one file. */
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
  /* Heading: three kinds. page = the title of a screen or sheet (title + description only). section = the title of a block,
     above its panel (the only kind with icon, meta and action). group = labels a run of rows or log entries inside one
     panel (muted; title + description only). "panel" is retired: it reads as section. A slot the kind does not carry is
     dropped with a dev warning. action is raw HTML, or { label, action, value, ariaLabel, disabled } for the standard
     text link with its › (48px). */
  function headingAction(a){
    if(!a||typeof a==='string')return a||'';
    const attrs=a.ariaLabel?{'aria-label':a.ariaLabel}:{};
    return button({label:a.label,register:'text',action:a.action,value:a.value||'',waiting:!!a.disabled,attrs,strs:a.strs,args:a.args}).replace(/<\/button>$/,arrow+'</button>');
  }
  function heading({title,icon='',description='',meta='',action='',kind='section',level=4,className='',strs,args}={}){
    const o={strs,args};
    const k=oneOf('Heading','kind',kind==='panel'?'section':kind,['page','section','group'],'section'),h=Math.max(1,Math.min(6,Number(level)||4));
    if(k!=='section'&&(icon||meta||action||has(o,'meta'))){warn('Heading',`${k}: icon, meta and action belong to a section heading; dropped`);icon='';meta='';action='';}
    const act=headingAction(action);
    const showDesc=description||has(o,'description'),showMeta=meta||has(o,'meta');
    return `<div class="st-heading ${esc(className)}" data-ds="Heading" data-kind="${k}"${icon?' data-has-icon="true"':''}><div class="st-heading-main"><h${h} class="st-heading-title">${icon?`<span class="st-heading-icon">${icon}</span>`:''}<span${sa(strs&&strs.title,args&&args.title)}>${esc(title)}</span></h${h}>${showDesc?`<p class="st-heading-description">${tx(description,o,'description')}</p>`:''}</div>${showMeta||act?`<div class="st-heading-aside">${showMeta?`<span class="st-heading-meta">${tx(meta,o,'meta')}</span>`:''}${act?`<span class="st-heading-action">${act}</span>`:''}</div>`:''}</div>`;
  }
  function panel(content,{className='',tag='div',ds='Panel'}={}){
    const t=['div','section','article','aside','dl'].includes(tag)?tag:'div';
    return `<${t} class="st-panel ${esc(className)}" data-ds="${esc(ds)}">${content}</${t}>`;
  }
  /* Facts: read-only label–value pairs. They never act: no button or link in a value (valueHtml is for markup such as an
     ID in mono, and is refused when it holds a control). columns: 2 (default), 3 (short counts) or 1 (a long value that needs the full width). mono: true sets an ID. */
  function facts(items,{className='',columns=2}={}){
    const cols=columns===3?3:columns===1?1:2;
    const valueOf=i=>{
      if(i.valueHtml!=null){
        if(/<(button|a)[\s>]|role=["']?button/i.test(i.valueHtml)){warn('Facts','valueHtml holds a control; facts never act, so it was dropped. Put the action in a Row or a link below.');return esc(i.value==null||i.value===''?'—':i.value);}
        return i.valueHtml;
      }
      if(has(i,'value'))return tx(i.value,i,'value');
      const v=i.value==null||i.value===''?'—':i.value;
      return i.mono?`<span class="st-fact-id">${esc(v)}</span>`:esc(v);
    };
    return `<dl class="st-panel st-facts ${esc(className)}" data-ds="Facts" data-columns="${cols}">${items.map(i=>`<div class="st-fact"><dt>${tx(i.label,i,'label')}</dt><dd>${valueOf(i)}</dd>${i.meta||has(i,'meta')?`<small>${tx(i.meta,i,'meta')}</small>`:''}</div>`).join('')}</dl>`;
  }
  function rowGroup(content,{title='',level=5,className='',strs,args}={}){
    return panel((title||has({strs},'title')?heading({title,kind:'group',level,className:'st-row-group-label',strs,args}):'')+content,{className:'st-row-group '+className,ds:'Row'});
  }
  /* Row family: button or inert row, select label and sibling door + act targets.
     All variants share the copy renderer, Status chips and token-based layout. */
  function rowCopy({title,description,code,mono,tight,o,titleId=''}){
    const tList=Array.isArray(title),dList=Array.isArray(description);
    const titleHtml=tList?toks(title,{tight}):tx(title,o,'title');
    const showDesc=dList?description.length>0:(description||has(o,'description'));
    const small=showDesc?`<small${mono?' data-mono=""':''}>${dList?toks(description,{tight,dot:true}):tx(description,o,'description')}</small>`:'';
    const codeHtml=code||has(o,'code')?`<span class="st-row-code">${tx(code,o,'code')}</span>`:'';
    return {codeHtml,titleHtml,small,strong:inner=>`<strong${titleId?` id="${esc(titleId)}"`:''}>${titleHtml}${inner||''}</strong>`};
  }
  const safeAttr=attrs=>Object.entries(attrs||{}).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
  /* mark: a leading tick for a row that is ticked in place — 'due' (empty ring) or 'ticked' (check disc). Saved is a Done chip, not a mark. */
  const rowMark=m=>m==='due'||m==='ticked'?`<span class="st-row-mark" data-mark="${m}" aria-hidden="true">${m==='ticked'?check:''}</span>`:'';
  function rowChip(chip,trailing,card){
    if(chip&&trailing)warn(card,'chip and trailing together: a row says one thing on the right; the chip wins');
    return chip?status(Object.assign({},chip,{className:'st-row-chip'})):'';
  }
  function row({title,description='',icon='',action='',value='',className='',disabled=false,trailing='',trail='auto',attrs={},strs,args,code='',mono=false,chip=null,wrap=false,tight=false,id='',variant='',reason='',mark=''}={}){
    const o={strs,args};
    variant=variant||(mark?'tick':code?'animal':trail==='edit'||(chip&&chip.kind==='done')?'record':icon?'navigation':attrs['aria-current']?'scope':'plain');
    if(disabled) description=reason||description||'Unavailable — try again later';
    if(code&&icon)warn('Row','code and icon together: a row leads with one; the code wins');
    const tr=oneOf('Row','trail',trail,['auto','chevron','edit','none'],'auto');
    const typed=trailing&&typeof trailing==='object';
    // Typed trailing words support tone and localization; legacy strings are escaped.
    const trailHtml=chip?'':typed?`<span class="st-row-trailing">${part(trailing)}</span>`:has(o,'trailing')?`<span class="st-row-trailing">${tx(trailing,o,'trailing')}</span>`:trailing?`<span class="st-row-trailing">${esc(trailing)}</span>`:'';
    const c=rowCopy({title,description,code,mono,tight,o,titleId:id?id+'-title':''});
    const tag=action?'button':'div';
    const railHtml=disabled?'':variant==='tick'&&tr==='auto'?'':tr==='edit'?`<span class="st-row-chevron" data-rail="edit">${glyph('edit')}<span data-str="act.edit">Edit</span></span>`:(tr==='chevron'||(tr==='auto'&&action))?`<span class="st-row-chevron">${arrow}</span>`:'';
    return `<${tag} class="st-row ${esc(className)}" data-ds="Row" data-variant="${esc(variant)}"${id?` id="${esc(id)}"`:''}${action?` type="button" data-action="${esc(action)}" data-value="${esc(value)}"${disabled?' disabled aria-disabled="true"':''}`:''}${wrap?' data-wrap=""':''}${safeAttr(attrs)}>${rowMark(mark)}${icon&&!code&&variant==='navigation'?`<span class="st-row-icon">${icon}</span>`:''}${code?`<span class="st-row-identity">${c.codeHtml}${rowChip(chip,trailing,'Row')}</span>`:c.codeHtml}<span class="st-row-copy">${c.strong()}${c.small}</span>${code?'':rowChip(chip,trailing,'Row')}${trailHtml}${railHtml}</${tag}>`;
  }
  /* rowSelect: the select + door variant without the door (a select-only list): the whole row is a <label>, leading box. Payload is change-only: rowSelectChange(event) → { value, checked }. */
  function rowSelect({title,description='',code='',mono=false,chip=null,wrap=false,tight=false,checked=false,action='select',value='',id='',className='',attrs={},strs,args,inputAttrs={},disabled=false,reason=''}={}){
    if(disabled) description=reason||description||'Unavailable — try again later';
    const o={strs,args},c=rowCopy({title,description,code,mono,tight,o});
    return `<label class="st-row ${esc(className)}" data-ds="Row" data-variant="select-door" data-select=""${id?` id="${esc(id)}"`:''}${wrap?' data-wrap=""':''}${safeAttr(attrs)}><span class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${checked?' checked':''}${disabled?' disabled':''}${safeAttr(inputAttrs)}></span>${title||description||code?`${code?`<span class="st-row-identity">${c.codeHtml}${rowChip(chip,'','Row')}</span>`:c.codeHtml}<span class="st-row-copy">${c.strong()}${c.small}</span>${code?'':rowChip(chip,'','Row')}`:''}</label>`;
  }
  /* rowSelectDoor: a list that both selects (a bulk act) and opens. Two sibling targets, none nested: the checkbox (48px hit area,
     the same box as rowSelect) toggles; the door (copy + ›) opens. contentHtml: trusted markup in place of the title/description copy. */
  function rowSelectDoor({title='',description='',code='',mono=false,wrap=false,tight=false,checked=false,action='select',value='',openAction='open',openValue='',label='',id='',className='',doorClass='',attrs={},strs,args,inputAttrs={},contentHtml=''}={}){
    const o={strs,args},c=rowCopy({title,description,code,mono,tight,o});
    const copy=contentHtml||`${c.codeHtml}<span class="st-row-copy">${c.strong()}${c.small}</span>`;
    return `<div class="st-row ${esc(className)}" data-ds="Row" data-variant="select-door" data-select=""${id?` id="${esc(id)}"`:''}${wrap?' data-wrap=""':''}${safeAttr(attrs)}><label class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${checked?' checked':''}${safeAttr(inputAttrs)}></label><button type="button" class="st-row-door ${esc(doorClass)}" data-action="${esc(openAction)}" data-value="${esc(openValue)}"${label?` aria-label="${esc(label)}"`:''}>${copy}<span class="st-row-chevron">${arrow}</span></button></div>`;
  }
  function rowSelectChange(ev){
    const t=ev&&ev.target;
    if(!t||t.type!=='checkbox'||!(t.closest&&t.closest('.st-row[data-select]')))return null;
    return {value:t.value,checked:!!t.checked,action:t.getAttribute('data-action')};
  }
  /* rowAction: two sibling targets. The copy is the door (action, an inline ›); the act button records in one tap. The act
     button is named by its label plus the row title. act.pending: the pending face after the first tap, until the host settles. */
  function rowAction({title,description='',code='',mono=false,chip=null,wrap=false,tight=false,action='',value='',act={},id='',className='',attrs={},strs,args,mark=''}={}){
    const o={strs,args},rid=id||fieldId('st-row'),tid=rid+'-title',aid=rid+'-act';
    const c=rowCopy({title,description,code,mono,tight,o,titleId:tid});
    const door=`<button type="button" class="st-row-door" data-action="${esc(action)}" data-value="${esc(value)}">${rowMark(mark)}${c.codeHtml}<span class="st-row-copy">${c.strong(`<span class="st-row-door-chevron">${arrow}</span>`)}${c.small}</span></button>`;
    const btn=button(Object.assign({register:'secondary'},act,{id:aid,labelledby:`${aid} ${tid}`}));
    return `<div class="st-row ${esc(className)}" data-ds="Row" data-variant="door-act" data-act="" id="${esc(rid)}"${wrap?' data-wrap=""':''}${safeAttr(attrs)}>${door}${rowChip(chip,'','Row')}${btn}</div>`;
  }
  /* Log: the history tail. One entry per recorded act; the group label carries the day; an entry's stamp is "time · who"
     with an absent part left out. Two variants: day (default) and categorised (a kind word above each title, with a kind
     filter above the panel).
     groups: [{label, description, strs, args, entries:[{title, detail, meta | at+by, category, corrected, was, extraHtml, strs, args}]}]
     options: empty, kind ('day' | 'categorised'), correctedLabel, strs.empty. */
  const pad2=n=>String(n).padStart(2,'0');
  /* at: a Date, epoch ms, 'HH:MM' (today), or 'YYYY-MM-DD' / 'YYYY-MM-DDTHH:MM' (read as local time). Returns {date, timed} or null. */
  function logWhen(at){
    if(at==null||at==='')return null;
    if(at instanceof Date)return isNaN(at)?null:{date:at,timed:true};
    if(typeof at==='number')return {date:new Date(at),timed:true};
    const t=String(at).match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if(t){const d=new Date();d.setHours(+t[1],+t[2],0,0);return {date:d,timed:true};}
    const m=String(at).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
    return m?{date:new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)),timed:!!m[4]}:null;
  }
  /* The stamp on an entry: "07:14 · G.H". A missing time or author is left out, never printed as a placeholder. A full
     name ("G. Hansen") is written as initials: records carry initials. */
  const initialsOf=n=>{const p=String(n||'').trim().split(/\s+/).filter(Boolean);return p.length>1?`${p[0][0]}.${p[p.length-1][0]}`:p[0]||'';};
  function logStamp(at,by=''){
    const w=logWhen(at);
    return [w&&w.timed?`${pad2(w.date.getHours())}:${pad2(w.date.getMinutes())}`:'',initialsOf(by)].filter(Boolean).join(' · ');
  }
  /* The group label for a day: Today, Yesterday, the weekday within the past week, then "Jul 8" (with the year when it
     is not this year). lang picks the weekday and month names; today and yesterday are the caller's words. */
  function logDay(at,{now=new Date(),lang='en',today='Today',yesterday='Yesterday'}={}){
    const w=logWhen(at),n=logWhen(now);if(!w||!n)return '';
    const day=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()),diff=Math.round((day(n.date)-day(w.date))/864e5);
    if(diff===0)return today;
    if(diff===1)return yesterday;
    if(diff>1&&diff<7)return w.date.toLocaleDateString(lang,{weekday:'short'});
    return w.date.toLocaleDateString(lang,Object.assign({month:'short',day:'numeric'},w.date.getFullYear()!==n.date.getFullYear()?{year:'numeric'}:{}));
  }
  /* Flat entries with an `at` become newest-first day groups; entries with no date go last under `earlier`. */
  function logGroups(entries,{now=new Date(),lang='en',today='Today',yesterday='Yesterday',earlier='Earlier'}={}){
    const dated=[],undated=[];
    entries.forEach((e,i)=>{const w=logWhen(e.at);(w?dated:undated).push({e,i,t:w?w.date.getTime():0});});
    dated.sort((a,b)=>b.t-a.t||a.i-b.i);
    const groups=[];
    const add=(label,e)=>{const g=groups[groups.length-1];if(g&&g.label===label)g.entries.push(e);else groups.push({label,entries:[e]});};
    dated.forEach(x=>add(logDay(x.e.at,{now,lang,today,yesterday}),x.e));
    undated.forEach(x=>add(earlier,x.e));
    return groups;
  }
  function log(groups,{className='',empty='No activity recorded yet',kind='day',correctedLabel='Corrected',strs,args}={}){
    const k=oneOf('Log','kind',kind,['day','categorised'],'day');
    const nonempty=groups.filter(g=>g.entries?.length);
    const mark=h=>h.replace('class="st-panel',`data-kind="${k}" class="st-panel`);
    if(!nonempty.length)return mark(panel(`<p class="st-empty">${tx(empty,{strs,args},'empty')}</p>`,{className:'st-log '+className,ds:'Log'}));
    const same=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
    const entry=e=>{
      let detail=e.detail;
      if(detail&&same(detail,e.title)){warn('Log',`detail repeats the title ("${e.title}"); dropped`);detail='';}
      if(k==='day'&&e.category)warn('Log','category belongs to the categorised variant; dropped');
      const meta=e.meta||(e.at!=null||e.by?logStamp(e.at,e.by):'');
      const word=k==='categorised'&&(e.category||has(e,'category'))?tx(e.category,e,'category'):'';
      const fixed=e.corrected||e.was?esc(correctedLabel):'';
      return `<li class="st-log-entry"${fixed?' data-corrected=""':''}>${word||fixed?`<span class="st-log-category">${[word,fixed].filter(Boolean).join(' · ')}</span>`:''}<strong class="st-log-title">${tx(e.title,e,'title')}</strong>${detail||has(e,'detail')?`<p>${tx(detail,e,'detail')}</p>`:''}${e.was?`<p class="st-log-was">${esc(e.was)}</p>`:''}${meta||has(e,'meta')?`<small>${tx(meta,e,'meta')}</small>`:''}${e.extraHtml?`<div class="st-log-extra">${e.extraHtml}</div>`:''}</li>`;
    };
    return mark(panel(nonempty.map(g=>`<section class="st-log-group">${g.label||has(g,'label')?heading({title:g.label,kind:'group',description:g.description||'',strs:has(g,'label')||has(g,'description')?{title:g.strs.label,description:g.strs.description}:undefined,args:g.args&&(g.args.label||g.args.description)?{title:g.args.label,description:g.args.description}:undefined}):''}<ol class="st-log-entries">${g.entries.map(entry).join('')}</ol></section>`).join(''),{className:'st-log '+className,ds:'Log'}));
  }
  /* strs.back = the Back text; categories[i].strs.label = each tab. The nav aria-label stays plain text. */
  function categoryFooter({categories=[],active='',backAction='back',categoryAction='action-category',label='Action categories',className='',strs,args}={}){
    const current=categories.some(c=>c.id===active)?active:categories[0]?.id;
    return `<footer class="sheet-footer st-category-footer ${esc(className)}" data-ds="CategoryFooter">${backButton({action:backAction,label:strs&&strs.back?{text:'Back',str:strs.back,args:args&&args.back}:'Back'})}<nav class="st-category-tabs action-category-nav" aria-label="${esc(label)}">${categories.map(c=>`<button type="button" data-action="${esc(categoryAction)}" data-value="${esc(c.id)}" aria-current="${c.id===current?'location':'false'}"${c.disabled?' disabled':''}>${tx(c.label,c,'label')}</button>`).join('')}</nav></footer>`;
  }
  const chevron='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  const check='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>';
  function field({label='',control='',className='',ds=''}={}){
    return `<label class="field ${esc(className)}"${ds?` data-ds="${esc(ds)}"`:''}>${label}${control}</label>`;
  }
  /* Mobile-standard choice control: a trigger button that opens a picker sheet.
     Replaces native <select>; the host app owns the picker view and state.
     strs: label (raw label wrapped in a span), display or value (the shown value), placeholder. */
  function pickerField({label='',value='',display='',placeholder='Select',action='open-picker',key='',disabled=false,reason='',error='',loading=false,variant='single',selected=[],names=[],path=[],pressed=false,active=false,ariaLabel='',className='',strs,args}={}){
    const multi=variant.includes('multi'), named=multi&&names.length>0;
    const text=named?names.slice(0,3).join(' · ')+(names.length>3?' · +'+(names.length-3):''):multi?(selected.length?selected.length+' selected':'None'):path.length?path.join(' › '):display||value;
    const more=named&&names.length>3?'+'+(names.length-3):'';
    const shown=text!==''&&text!=null, id=fieldId('st-picker'), hint=error||reason||(loading?'Loading options…':'');
    return `<div class="field st-picker-field ${esc(className)}" data-ds="PickerField" data-variant="${esc(variant)}"><span id="${id}-label">${tx(label,{strs,args},'label')}</span><button type="button" class="st-picker-trigger${shown?'':' is-placeholder'}" ${ariaLabel?`aria-label="${esc(ariaLabel)}, ${esc(shown?text:placeholder)}"`:`aria-labelledby="${id}-label ${id}-value"`} aria-haspopup="dialog" aria-expanded="${active}"${hint?` aria-describedby="${id}-hint"`:''}${error?' aria-invalid="true"':''}${disabled||loading?' aria-disabled="true"':''}${loading?' aria-busy="true"':''}${pressed?' data-preview="pressed"':''} data-action="${esc(action)}" data-picker-key="${esc(key)}"><span id="${id}-value" class="st-picker-value${named?' is-names':''}"${named?'':sa(multi?(strs?.display|| (selected.length?'ds.picker.selected':'ds.picker.none')):shown?(strs?.display||strs?.value):(strs?.placeholder||(placeholder==='Select'?'ds.picker.select':undefined)),multi?{n:selected.length,...args?.display}:args?.display||args?.value)}>${named?`<span class="st-picker-names">${esc(names.slice(0,3).join(' · '))}</span>${more?`<span class="st-picker-more">${esc(more)}</span>`:''}`:esc(shown?text:placeholder)}</span>${chevron}</button>${hint?`<span id="${id}-hint" class="st-picker-hint" role="status">${esc(hint)}</span>`:''}</div>`;
  }
  // Shared chooser surface: flat catalogue lists or a muted inset for short choices.
  function chooserList(content,{className='',tone='flat',ds='ChoiceList'}={}){
    return `<div class="st-chooser-list ${esc(className)}" data-ds="${esc(ds)}" data-chooser-tone="${tone==='inset'?'inset':'flat'}">${content}</div>`;
  }
  /* options: [value,label,sub?,group?,{strs:{label,sub,group},args:{…}}?]; the group's strs come from its first option. */
  function pickerOptions({options=[],selected='',action='picker-select',className='',variant='single',loading=false,error=''}={}){
    if(loading||error||!options.length)return choiceEmpty(loading?'Loading options…':error||'No options available.');
    const groups=[];
    for(const option of options){const name=option[3]||'';let group=groups.find(g=>g.name===name);if(!group){group={name,items:[],x:option[4]};groups.push(group);}group.items.push(option);}
    return groups.map(g=>choiceGroup(g.items.map(([value,label,meta,,x])=>choiceRow({value,label,meta,action,mode:variant.includes('multi')?'multi':'single',selected:Array.isArray(selected)?selected.includes(value):selected===value,disabled:!!x?.disabled,reason:x?.reason||'',strs:x?.strs?{label:x.strs.label,meta:x.strs.sub}:undefined,args:x?.args})),{title:g.name,className,strs:g.x?.strs?{title:g.x.strs.group}:undefined})).join('');
  }
  // A controlled picker body. Hosts keep draft selection/path and own the modal shell.
  function pickerBody({variant='single',items=[],selected=[],path=[],query='',action='picker-select',stepAction='picker-step',searchAttrs={},loading=false,error='',strs={},args={}}={}){
    const multi=variant.includes('multi'), cascade=variant.startsWith('cascade');
    const leaves=(nodes,trail=[])=>nodes.flatMap(n=>n.children?leaves(n.children,[...trail,n.label]):[{...n,trail}]);
    let nodes=items;const steps=[];
    for(const value of path){const n=nodes.find(n=>n.value===value);if(!n?.children)break;steps.push(n);nodes=n.children;}
    const q=query.trim().toLocaleLowerCase();
    const visible=q?leaves(items).filter(n=>[n.label,n.group||'',...n.trail,...(n.aliases||[])].join(' ').toLocaleLowerCase().includes(q)):cascade?nodes:leaves(items);
    const count=n=>leaves([n]).filter(x=>selected.includes(x.value)).length;
    const rows=visible.map(n=>{
      const row=choiceRow({label:n.label,meta:n.children?(multi&&count(n)?count(n)+' selected':''):q?n.trail.join(' › '):n.meta||'',mode:n.children?'navigate':multi?'multi':'single',action:n.children||!multi?action:'',value:n.value,selected:selected.includes(n.value),disabled:!!n.disabled,reason:n.reason||'',attrs:n.attrs||{},strs:{...n.strs,...(n.children&&multi&&count(n)?{meta:'ds.picker.selected'}:{})},args:{...n.args,...(n.children&&multi&&count(n)?{meta:{n:count(n)}}:{})}});
      const extra=n.secondaryAction?`<div class="st-choice-extra">${button({label:n.secondaryAction.label,action:n.secondaryAction.action,value:n.value,register:'text',attrs:{'aria-label':n.secondaryAction.label+' '+n.label}})}</div>`:'';
      return row+extra;
    });
    const search=choiceSearch({label:'Search all options',value:query,attrs:searchAttrs,strs:{label:strs.search||'ds.picker.search',placeholder:strs.search||'ds.picker.search'}});
    const sep='<span class="st-picker-sep" aria-hidden="true">›</span>';
    const trail=cascade?`<nav class="st-picker-steps" aria-label="Chosen levels"><button type="button" data-action="${esc(stepAction)}" data-value="0">${tx('All',{strs:{all:strs.all||'ds.picker.all'}},'all')}</button>${steps.map((n,i)=>sep+`<button type="button" data-action="${esc(stepAction)}" data-value="${i+1}"${i===steps.length-1?' aria-current="step"':''}>${tx(n.label,n,'label')}</button>`).join('')}</nav>`:'';
    const groups=[];
    visible.forEach((n,i)=>{const title=n.group||n.trail?.join(' › ')||'';let group=groups.find(g=>g.title===title);if(!group){group={title,rows:[]};groups.push(group);}group.rows.push(rows[i]);});
    const list=!cascade&&!q?groups.map(g=>choiceGroup(g.rows,{title:g.title})).join(''):choiceGroup(rows);
    const content=loading||error?choiceEmpty(loading?'Loading options…':error,{strs:{text:loading?strs.loading||'ds.picker.loading':strs.error}}):visible.length?list:choiceEmpty(q?'No options match “'+query+'”.':'No options available.',{strs:{text:q?strs.noMatch||'ds.picker.no_match':strs.empty||'ds.picker.empty'},args:{text:{query}}});
    return `<div class="st-picker-body" data-ds="PickerField" data-variant="${esc(variant)}">${search}${trail}${content}</div>`;
  }

  /* Back leaves and keeps the draft (pure navigation); Done confirms it. A single pick commits, so single has Back only. */
  function pickerFooter({selected=[],multi=false,backAction='back',doneAction='picker-done',strs={},args={}}={}){
    const backBtn=`<button type="button" class="button secondary" data-action="${esc(backAction)}">${tx('Back',{strs:{back:strs.back||'act.back'}},'back')}</button>`;
    if(!multi)return `<footer class="sheet-footer st-picker-footer">${backBtn}</footer>`;
    return `<footer class="sheet-footer st-picker-footer">${backBtn}<button type="button" class="button primary" data-action="${esc(doneAction)}">${tx('Done · '+selected.length,{strs:{done:strs.done||'ds.picker.done_count'},args:{done:{n:selected.length,...args.done}}},'done')}</button></footer>`;
  }
  /* Choice chooser primitives. Every chooser shape is composed from these three:
     flat list = one untitled group; sectioned list = several titled groups;
     nested = navigate rows, then a leaf list (flat or sectioned) under a new sheet title.
     Row geometry never varies: label, optional meta line, one trailing slot on the right.
     mode: 'navigate' (chevron), 'single' (check when selected), 'multi' (checkbox). */
  function choiceRow({label='',meta='',mode='single',action='',value='',selected=false,attrs={},className='',mono=false,tabindex=null,disabled=false,reason='',pressed=false,strs,args}={}){
    if(reason)meta=meta?meta+' · '+reason:reason;
    const o={strs,args};
    attrs={...attrs,...(disabled?{'aria-disabled':'true'}:{}),...(pressed?{'data-preview':'pressed'}:{})};
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const copy=`<span class="st-choice-copy"><span class="st-choice-label"${mono?' data-mono=""':''}>${tx(label,o,'label')}</span>${meta||has(o,'meta')?`<span class="st-choice-meta">${tx(meta,o,'meta')}</span>`:''}</span>`;
    // radio (candidate, ADR 0002): a visible ring in the trailing slot; role=radio inside a radiogroup (choiceGroup radio:true).
    if(mode==='radio')return `<button type="button" class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="radio" role="radio" aria-checked="${selected?'true':'false'}"${tabindex!=null?` tabindex="${esc(tabindex)}"`:''} data-action="${esc(action)}" data-value="${esc(value)}"${extra}>${copy}<span class="st-choice-trail" aria-hidden="true"><span class="st-radio"></span></span></button>`;
    if(mode==='multi')return `<label class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="multi"${disabled?' aria-disabled="true"':''}${pressed?' data-preview="pressed"':''}>${copy}<span class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${selected?' checked':''}${disabled?' disabled':''}${extra}></span></label>`;
    const trail=mode==='navigate'?chevron:selected?check:'';
    const state=mode==='single'?` aria-pressed="${selected?'true':'false'}"`:'';
    return `<button type="button" class="st-choice-row ${esc(className)}" data-ds="ChoiceList" data-mode="${mode==='navigate'?'navigate':'single'}" data-action="${esc(action)}" data-value="${esc(value)}"${state}${extra}>${copy}<span class="st-choice-trail" aria-hidden="true">${trail}</span></button>`;
  }
  // lead: optional control between heading and panel (e.g. a segment that filters only this group).
  // radio (candidate, ADR 0002): the panel is the radiogroup, labelled by the heading.
  function choiceGroup(rows,{title='',lead='',className='',radio=false,aside='',id='',strs,args}={}){
    const body=Array.isArray(rows)?rows.join(''):rows;
    const showTitle=title||has({strs},'title');
    const hid=radio&&showTitle?(id||fieldId('st-choice'))+'-title':'';
    return `<section class="st-choice-group ${esc(className)}" data-ds="ChoiceList"${title?` aria-label="${esc(title)}"`:''}>${showTitle?(aside?`<div class="st-choice-heading-row"><h5 class="st-choice-heading"${hid?` id="${esc(hid)}"`:''}>${tx(title,{strs,args},'title')}</h5>${aside}</div>`:`<h5 class="st-choice-heading"${hid?` id="${esc(hid)}"`:''}>${tx(title,{strs,args},'title')}</h5>`):''}${lead?`<div class="st-choice-lead">${lead}</div>`:''}<div class="st-choice-panel"${radio?` role="radiogroup"${hid?` aria-labelledby="${esc(hid)}"`:''}`:''}>${body}</div></section>`;
  }
  function choiceSearch({label='Search',placeholder='',value='',attrs={},strs={}}={}){
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    return `<label class="field catalog-search st-choice-search" data-ds="ChoiceList"><input type="search" aria-label="${esc(label)}"${strs.label?` data-str-attr="aria-label:${esc(strs.label)}${strs.placeholder?`;placeholder:${esc(strs.placeholder)}`:''}"`:''} placeholder="${esc(placeholder||label)}" value="${esc(value)}"${extra}></label>`;
  }
  function choiceEmpty(text,{strs,args}={}){return `<p class="st-choice-empty" data-ds="ChoiceList" role="status">${tx(text,{strs,args},'text')}</p>`;}
  /* options: [value,label,{strs:{label},args:{label}}?]; label is raw HTML, kept as the span's fallback. */
  function segment({options=[],active='',action='',className='',ariaLabel='',variant='two-line-lens',state='Default',disabled=false,reason=''}={}){
    if(!options.length)return '';
    return `<div class="st-selection"><div class="st-segment ${esc(className)}" data-ds="Segment" data-variant="${esc(variant)}" data-state="${esc(state)}" role="group" aria-label="${esc(ariaLabel)}">${options.map(([v,label,x={}])=>{const blocked=disabled||x.disabled;return `<button type="button" data-action="${esc(action)}" data-value="${esc(v)}" aria-pressed="${v===active}"${x.ariaLabel?` aria-label="${esc(x.ariaLabel)}"`:""}${blocked?' disabled':''}><span class="st-selection-label"${has(x,'label')?sa(x.strs.label,x.args&&x.args.label):''}>${label}</span>${x.count!=null?`<span class="st-selection-count">${x.count}</span>`:variant==='two-line-lens'?'<span class="st-selection-count" aria-hidden="true"></span>':''}</button>`;}).join('')}</div>${reason?`<p class="st-selection-reason">${esc(reason)}</p>`:''}</div>`;
  }
  function filterChips({items=[],action='chip',key='chips',label='',state='Default',reason=''}={}){
    if(!items.length)return '';
    const on=(items.find(i=>i.checked)||items[0]).value;
    return `<div class="st-filter-chips" data-ds="FilterChips" data-field="${esc(key)}" data-state="${esc(state)}"><div class="st-filter-chips-track" role="radiogroup" aria-label="${esc(label)}">${items.map(i=>`<button type="button" role="radio" aria-checked="${i.value===on}" tabindex="${i.value===on?0:-1}" data-action="${esc(action)}" data-value="${esc(i.value)}"${i.aria?` aria-label="${esc(i.aria)}"`:""}${i.disabled?' disabled':''}>${i.value===on?`<span class="st-chip-check" aria-hidden="true">${globalThis.SentriIcons?globalThis.SentriIcons.icon('check'):''}</span>`:''}<span class="st-selection-label">${i.label}</span>${i.count!=null?`<span class="st-selection-count">${i.count}</span>`:''}</button>`).join('')}</div>${reason?`<p class="st-selection-reason">${esc(reason)}</p>`:''}</div>`;
  }
  function iconButton({action='',icon='',label='',variant='bordered',className='',value='',badge='',disabled=false,pressed=false,selected=null,reason='',describedby='',attrs={},strs,args}={}){
    const o={strs,args},hasBadge=(badge!==''&&badge!=null)||has(o,'badge');
    const v=oneOf('IconButton','variant',variant,['bordered','plain'],'bordered');
    const rid=reason?(describedby||fieldId('st-icon-reason')):describedby;
    return `<button type="button" class="icon-button ${esc(className)}" data-ds="IconButton" data-variant="${v}" data-action="${esc(action)}" data-value="${esc(value)}" aria-label="${esc(label)}"${disabled?' aria-disabled="true"':''}${pressed?' data-preview="pressed"':''}${selected!=null?` aria-pressed="${!!selected}"`:''}${rid?` aria-describedby="${esc(rid)}"`:''}${safeAttr(attrs)}><span aria-hidden="true">${icon}</span>${selected?`<span class="st-icon-selected" aria-hidden="true">${sGlyph('check')}</span>`:''}${hasBadge?`<span class="filter-badge">${tx(badge,o,'badge')}</span>`:''}</button>${reason?buttonReason({id:rid,text:reason}):''}`;
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
  const textActions=(list,key)=>(list||[]).map(p=>button({label:p.label||'',register:'text',action:p.action||'',value:p.value!=null?p.value:key,strs:p.strs,args:p.args})).join('');
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
     text / tool registers, waiting face and hold, ChoiceList radio, the Row roots. ----
     Colour lives on the value, the word stays ink (RULINGS, 2026-09-03). A part is a string or
     { text, tone, mono, strs:{text}, args:{text} }; a token is a part or a list of parts (a word and its value);
     tone is amber · progress · green · red · muted and colours only that part (at 600). */
  const isDev=()=>!!(root.SentriUIDev||(root.location&&/^(localhost|127\.0\.0\.1|\[::1\])$/.test(root.location.hostname||'')));
  function warn(card,msg){if(isDev()&&root.console&&root.console.warn)root.console.warn(`[SentriUI ${card}] ${msg}`);}
  function oneOf(card,prop,v,list,def){if(v==null||v==='')return def;if(!list.includes(v)){warn(card,`${prop}: unknown value "${v}", using "${def}"`);return def;}return v;}
  const TONES=['amber','progress','green','red','muted'];
  const toneOf=(t,card='Status')=>t==null||t===''?'':oneOf(card,'tone',t,TONES,'');
  function part(p){
    if(p==null||p==='')return '';
    if(typeof p!=='object')return esc(p);
    const t=toneOf(p.tone),inner=tx(p.text,p,'text');
    return t||p.mono?`<span class="st-part"${t?` data-tone="${t}"`:''}${p.mono?' data-mono=""':''}>${inner}</span>`:inner;
  }
  // The `·` between tokens is a real text node, styled (never a pseudo-element), so it copies and reads.
  const SEP='<span class="st-sep" data-str="ds.sep">·</span>';
  function toks(list,{tight=false,dot=false}={}){
    return (list||[]).filter(t=>t!=null&&t!=='').map(t=>`<span class="st-tok">${Array.isArray(t)?t.map(part).join(tight?'':' '):part(t)}</span>`).join(dot?SEP:tight?'':' ');
  }
  /* A live region is mounted empty and filled afterwards: content inserted with the region is not announced.
     The card writes the content into a <template> inside the region; liveFill(root) moves it in (clear, then set). */
  const live=(tag,attrs,html)=>`<${tag}${attrs} role="status" aria-live="polite" aria-atomic="true" data-live=""><template>${html}</template></${tag}>`;
  /* The latest message per region is kept here, not read back from the DOM (which is empty while an announcement is
     in flight); a newer announcement cancels the one it supersedes. */
  const liveState=new WeakMap();
  function announce(el,html,{delay=60,then}={}){
    if(!el)return;
    const prev=liveState.get(el);if(prev&&prev.timer)clearTimeout(prev.timer);
    const st={html,then,timer:null};liveState.set(el,st);
    el.innerHTML='';
    const set=()=>{st.timer=null;if(liveState.get(el)!==st)return;el.innerHTML=st.html;if(then)then(el);};
    if(delay<=0)set();else st.timer=setTimeout(set,delay);
  }
  /* The message a region holds or is about to hold, with the host's `then` (its localization), so a replay renders
     exactly as the first announcement did, whether it lands before or after that first one rendered. */
  const liveMessage=el=>{const st=liveState.get(el);return st?{html:st.html,then:st.then}:{html:el.innerHTML,then:null};};
  function liveFill(scope,{delay=60,then}={}){
    (scope&&scope.querySelectorAll?Array.from(scope.querySelectorAll('[data-live]')):[]).forEach(el=>{
      const tpl=el.querySelector(':scope > template');
      if(tpl)announce(el,tpl.innerHTML,{delay,then});
    });
  }
  /* Status: how a state is said. One colour map for every status, here and in the README:
       awaiting muted · active progress · done green · late amber · overdue red · died red
     `kind` picks a row of the map (tone, and the icon a chip carries); `tone` alone is the old word call and still works.
     variant: 'word' (a 4px dot and the word, inline) · 'chip' (a filled badge in a row). Text is always given: colour never carries a state alone. */
  const KINDS={awaiting:{tone:'muted',icon:''},active:{tone:'progress',icon:''},done:{tone:'green',icon:'check'},late:{tone:'amber',icon:'clock'},overdue:{tone:'red',icon:'alert'},died:{tone:'red',icon:''}};
  const STATUS_VARIANTS=['word','chip'];
  function status({text='',tone,kind='',variant='word',icon,id='',className='',strs,args}={}){
    const k=kind?oneOf('Status','kind',kind,Object.keys(KINDS),''):'';
    const t=toneOf(tone)||(k&&KINDS[k].tone)||'muted';
    const v=oneOf('Status','variant',variant,STATUS_VARIANTS,'word');
    const o={strs,args};
    const attrs=`class="st-status ${esc(className)}" data-ds="Status" data-variant="${v}"${id?` id="${esc(id)}"`:''} data-tone="${t}"${k?` data-kind="${k}"`:''}`;
    const g=v==='chip'?(icon!=null?icon:(k?KINDS[k].icon:'')):'';
    return `<span ${attrs}>${g?glyph(g):''}${tx(text,o,'text')}</span>`;
  }
  /* ConditionTag: a recorded health condition with its care level, never colour-only.
       care  attention (needs action: level monitor · treat · hospital) · ongoing (recorded, no action) · resolved ·
             notice (a standing instruction on the animal, e.g. Feed held — not a condition)
     variant 'tag' (in a row: icon, name, day count) · 'detail' (in a record header: the care-level word, the day, a note).
     careText is the care-level word (the caller localizes it); the tag keeps it for assistive tech, the detail prints it. */
  const CARES=['attention','ongoing','resolved','notice'];
  const LEVELS={monitor:{icon:'monitor',text:'Monitor',short:''},treat:{icon:'treat',text:'Treat in place',short:'Treat'},hospital:{icon:'hospital',text:'Hospital pen',short:'Hospital'}};
  const CARE_ICON={ongoing:'note',resolved:'check',notice:'note'};
  const CARE_TEXT={attention:'Needs attention',ongoing:'Ongoing',resolved:'Resolved',notice:''};
  function conditionTag({name='',day='',care='ongoing',level='',careText,levelText,note='',pending=false,icon,variant='tag',id='',className='',strs,args}={}){
    const c=oneOf('ConditionTag','care',care,CARES,'ongoing');
    const lv=c==='attention'?oneOf('ConditionTag','level',level||'monitor',Object.keys(LEVELS),'monitor'):'';
    const v=oneOf('ConditionTag','variant',variant,['tag','detail','mark'],'tag');
    const o={strs,args};
    const word=careText!=null?careText:(c==='attention'?LEVELS[lv].text:CARE_TEXT[c]);
    const g=icon!=null?icon:(c==='attention'?LEVELS[lv].icon:CARE_ICON[c]);
    const attrs=`class="st-condition ${esc(className)}" data-ds="ConditionTag" data-variant="${v}" data-care="${c}"${lv?` data-level="${lv}"`:''}${pending?' data-pending=""':''}${id?` id="${esc(id)}"`:''}`;
    const dayHtml=day?`<small class="st-condition-day">${tx(day,o,'day')}</small>`:'';
    if(v==='mark')return `<span ${attrs} role="img" aria-label="${esc(word)}"><span class="st-condition-mark">${g?glyph(g):''}</span></span>`;
    if(v==='detail'){
      return `<div ${attrs}><span class="st-condition-mark">${g?glyph(g):''}</span><span class="st-condition-copy"><strong class="st-condition-level">${tx(word,o,'careText')}</strong>${name||day?`<span class="st-condition-meta">${name?tx(name,o,'name'):''}${name&&day?' · ':''}${day?tx(day,o,'day'):''}</span>`:''}${note?`<span class="st-condition-note">${tx(note,o,'note')}</span>`:''}</span></div>`;
    }
    const title=[name,day,word].filter(Boolean).join(' · ');
    return `<span ${attrs} title="${esc(title)}">${g?glyph(g):''}<span class="st-condition-name">${tx(name,o,'name')}</span>${dayHtml}${lv&&(levelText!=null?levelText:LEVELS[lv].short)?`<small class="st-condition-level-word">${tx(levelText!=null?levelText:LEVELS[lv].short,o,'levelText')}</small>`:''}${word?`<span class="st-visually-hidden"> · ${tx(word,o,'careText')}</span>`:''}</span>`;
  }
  /* The tokens as HTML, for announce() into a region the host already holds. */
  function statusText(tokens,{sep='',tight=false}={}){return toks(tokens,{tight,dot:sep==='dot'});}
  /* Status · line: one body line whose values carry the colour (the receipt: `Saved · +4 this visit`).
     live: a persistent role=status region, mounted empty and filled by liveFill (or announce). */
  function statusLine(tokens,{live:isLive=false,sep='',mono=false,tight=false,id='',className=''}={}){
    const s=oneOf('Status','sep',sep,['dot',''],'');
    const attrs=` class="st-status-line ${esc(className)}" data-ds="Status"${id?` id="${esc(id)}"`:''}${mono?' data-mono=""':''}`;
    const html=toks(tokens,{tight,dot:s==='dot'});
    return isLive?live('p',attrs,html):`<p${attrs}>${html}</p>`;
  }
  /* Banner: a headline over its consequence, on a wash. tone 'danger' (red: an irreversible act or a terminal
     fact) or 'correction' (a strong amber wash with an amber border: Edit's banner, with a live change summary and
     Clear, then `Cleared · Undo`). One live region per banner: the summary when there is one, else the banner itself. */
  function banner({tone='danger',headline='',consequence='',summary=null,actions=[],live:isLive=false,id='',className='',strs,args}={}){
    const o={strs,args},t=oneOf('Banner','tone',tone,['danger','correction'],'danger');
    const bid=id||fieldId('st-banner');
    const cons=consequence||has(o,'consequence')?`<span class="st-banner-consequence">${tx(consequence,o,'consequence')}</span>`:'';
    const hasSum=summary!=null||has(o,'summary');
    const sumHtml=summary==null?tx('',o,'summary'):Array.isArray(summary)?toks(summary,{dot:true}):tx(summary,o,'summary');
    const sum=hasSum?`<div class="st-banner-summary">${live('p',` class="st-banner-summary-text" id="${esc(bid)}-summary"`,sumHtml)}${textActions(actions,'')}</div>`:'';
    const body=`<strong class="st-banner-headline">${tx(headline,o,'headline')}</strong>${cons}`;
    if(isLive&&hasSum)warn('Banner','live and summary together: the summary is the one live region');
    const attrs=` class="st-banner ${esc(className)}" data-ds="Banner" data-tone="${t}" id="${esc(bid)}"`;
    return isLive&&!hasSum?live('div',attrs,body):`<div${attrs}>${body}${sum}</div>`;
  }
  /* Photos: the record's photo field — a well card, the label and the camera circle on one 44px row, the answer line
     under it, thumbnails beneath. Inactive until there is something to attach to; at max the camera grays the same way
     (floor-gray: aria-disabled, still tappable, data-reason says why, answered in the line). Thumbnails open the viewer.
     error: 'denied' (camera permission) · 'too-large' — answered amber; a cancelled capture says nothing. */
  const PHOTO_ERRORS={denied:{id:'ds.c2.photos.denied',en:'Camera not allowed · allow it in Settings, then try again'},'too-large':{id:'ds.c2.photos.too_large',en:'Photo too large to attach · take it again'}};
  function photos({label='Photos',optional='',count=null,active=true,items=[],max=12,action='photo-add',viewAction='photo-view',key='photos',hint='',error='',id='',className='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},pid=id||fieldId('st-photos'),hid=pid+'-hint',lid=pid+'-label';
    const err=oneOf('Photos','error',error,['denied','too-large','cancelled'],'');
    const ERR=PHOTO_ERRORS[err];
    const list=items||[],full=list.length>=max,reason=!active?'inactive':full?'full':'';
    const countHtml=count==null?'':`<small class="st-photos-count">${Array.isArray(count)?toks(count,{dot:true}):part(count)}</small>`;
    const head=`<div class="st-photos-head"><span class="st-photos-label" id="${esc(lid)}"><span${sa(s.label,a.label)}>${esc(label)}</span>${optional||has(o,'optional')?`<small>${tx(optional,o,'optional')}</small>`:''}${countHtml}</span><button type="button" class="st-photos-camera" id="${esc(pid)}-camera" data-action="${esc(action)}" data-value="${esc(key)}" aria-describedby="${esc(hid)}"${reason?` aria-disabled="true" data-reason="${reason}"`:''}${ariaText('Take a photo',s.camera,a.camera)}>${glyph('camera')}</button></div>`;
    const thumb=(it,i)=>`<li><button type="button" class="st-photos-thumb" id="${esc(pid)}-thumb-${i+1}" data-action="${esc(viewAction)}" data-value="${esc(it.id!=null?it.id:i)}"${it.pending?' data-pending=""':''}${ariaText(it.alt||`Photo ${i+1}${it.pending?' · waiting to upload':''}`,it.pending?s.thumbPending:s.thumb,{n:i+1})}>${it.src?`<img src="${esc(it.src)}" alt="">`:`<span class="st-photos-index"${sa(s.index,{n:i+1})}>${i+1}</span>`}</button></li>`;
    const thumbs=list.length?`<ul class="st-photos-items" aria-labelledby="${esc(lid)}">${list.map(thumb).join('')}</ul>`:'';
    // An error is answered with its own registered message (it wins over hint); a cancelled capture says nothing.
    const hl=ERR?hintLine('st-photos-hint',{id:hid,text:ERR.en,tone:'warn',o:{strs:{hint:ERR.id}}}):hintLine('st-photos-hint',{id:hid,text:err==='cancelled'?'':hint,o});
    return `<div class="st-photos ${esc(className)}" data-ds="Photos" id="${esc(pid)}" data-field="${esc(key)}"${!active?' data-inactive=""':''}${full?' data-full=""':''}${err?` data-error="${err}"`:''}>${head}${hl}${thumbs}</div>`;
  }
  /* Button, as a factory. Registers (RULINGS, three button registers + the text action): primary (the one commit,
     ink) · secondary (an exit, outlined) · tool (a mid-sheet act, a soft well, no border) · text (the quietest: a bare
     word, 13/700 ink-2, no container, ≥48px) · danger. waiting: the waiting face — present, quiet,
     focusable (aria-disabled, never disabled); guard() answers its tap. busy: sent, until the host settles. */
  const REGISTER={primary:'button primary',secondary:'button secondary',tool:'button tool',danger:'button danger'};
  function button({label='',register='secondary',action='',value='',waiting=false,disabled=false,busy=false,icon='',reason='',describedby='',labelledby='',id='',attrs={},className='',strs,args}={}){
    const o={strs,args},r=oneOf('Button','register',register,['primary','secondary','tool','text','danger'],'secondary');
    const cls=r==='text'?'st-text-action':REGISTER[r];
    const rid=reason?(describedby||fieldId('st-button-reason')):describedby;
    return `<button type="button" class="${cls}${className?' '+esc(className):''}" data-ds="Button" data-register="${r}"${id?` id="${esc(id)}"`:''} data-action="${esc(action)}" data-value="${esc(value)}"${waiting||busy?' aria-disabled="true"':''}${disabled?' disabled':''}${busy?' aria-busy="true" data-busy=""':''}${rid?` aria-describedby="${esc(rid)}"`:''}${labelledby?` aria-labelledby="${esc(labelledby)}"`:''}${r==='tool'&&typeof label==='string'&&label&&!strs?` title="${esc(label)}"`:''}${safeAttr(attrs)}>${icon?`<span aria-hidden="true">${icon}</span>`:''}<span class="st-button-label">${tx(label,o,'label')}</span>${busy?'<span class="st-button-busy" aria-hidden="true">…</span>':''}</button>${reason?buttonReason({id:rid,text:reason}):''}`;
  }
  /* The reason a waiting button waits, one persistent status line beside the bar (row-title size). */
  function buttonReason({text='',id='',actions=[],className='',strs,args}={}){
    const o={strs,args},show=text||has(o,'text');
    return `<p class="st-field-hint st-button-reason ${esc(className)}" data-ds="Button"${id?` id="${esc(id)}"`:''} role="status" aria-live="polite" data-tone="muted">${show?`<span class="st-field-hint-text">${tx(text,o,'text')}</span>`:''}${textActions(actions,'')}</p>`;
  }
  /* The shared guard for delegated clicks: true when the control is aria-disabled (waiting, busy, floor-gray). It answers
     the tap: every status line the control is described by flashes (data-answer) and re-announces (clear, then set). */
  function guard(el,{answer=true,flash=1200}={}){
    if(!el||!el.getAttribute||el.getAttribute('aria-disabled')!=='true')return false;
    if(answer&&root.document){
      (el.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean).forEach(rid=>{
        const r=root.document.getElementById(rid);if(!r||!/status/.test(r.getAttribute('role')||''))return;
        const m=liveMessage(r);announce(r,m.html,{then:m.then||undefined});r.setAttribute('data-answer','');clearTimeout(r._stAnswer);r._stAnswer=setTimeout(()=>r.removeAttribute('data-answer'),flash);
      });
    }
    return true;
  }
  /* When something leaves (a banner at its Undo timeout, a cleared field's Clear), move focus to target only if focus is
     still inside what is leaving; focus the worker put elsewhere is left alone. Returns whether it moved focus. */
  function handFocus(leaving,target){
    const a=root.document&&root.document.activeElement;
    if(!leaving||!a||!leaving.contains||!leaving.contains(a))return false;
    if(target&&target.focus)target.focus();
    return true;
  }
  /* Hold-to-commit (Button `hold`): the suite's irreversible acts (Lock born N, the sow's death, End task).
     phase idle · holding (the sweep runs for hold-commit) · armed (keyboard: a second press ≥ minArm later commits) ·
     pending (sent) · done · unknown (the answer never came: never idle again — an irreversible act is not re-offered).
     statusId: a status line outside the thumb's footprint (above the bar) that echoes the progress. */
  const HOLD=Object.freeze({commit:850,arm:5000,minArm:400,slop:20,vibrateCommit:40,vibrateRelease:[15,60,15]});
  const HOLD_PHASES=['idle','holding','armed','pending','done','unknown'];
  function holdButton({label='',caption='',action='hold',value='',tone='danger',phase='idle',waiting=false,describedby='',statusId='',id='',className='',strs,args}={}){
    const o={strs,args},bid=id||fieldId('st-hold'),cid=bid+'-caption';
    const p=oneOf('Button','phase',phase,HOLD_PHASES,'idle'),t=oneOf('Button','tone',tone,['danger','primary'],'danger');
    const off=waiting||['pending','done','unknown'].includes(p);
    const desc=[cid,statusId,describedby].filter(Boolean).join(' ');
    return `<button type="button" class="button ${t} st-hold${className?' '+esc(className):''}" id="${esc(bid)}" data-ds="Button" data-register="hold" data-action="${esc(action)}" data-value="${esc(value)}" data-phase="${p}"${waiting?' data-waiting=""':''}${statusId?` data-hold-status="${esc(statusId)}"`:''} aria-describedby="${esc(desc)}"${off?' aria-disabled="true"':''}${p==='pending'?' aria-busy="true"':''}><span class="st-hold-label">${tx(label,o,'label')}</span><small class="st-hold-caption" id="${esc(cid)}">${tx(caption,o,'caption')}</small></button>`;
  }
  /* The hold's rules, pure. state { phase, armedAt }. event: 'down' · { type:'up', held } · 'leave' · 'cancel' · 'blur' ·
     'escape' · 'elapsed' · { type:'key', at, repeat } · 'timeout' · { type:'settle', outcome:'done'|'failed'|'unknown' }.
     Returns { phase, armedAt, commit, cue }: commit is true exactly once. A repeated key (held Enter) is ignored, and a
     second press sooner than minArm after arming is answered ('early') and does not commit. */
  function holdStep(state,event,{minArm=HOLD.minArm,arm=HOLD.arm}={}){
    const phase=(state&&state.phase)||'idle',armedAt=state&&state.armedAt!=null?state.armedAt:null;
    const ev=typeof event==='string'?{type:event}:(event||{});
    const out=(p,commit=false,cue=null,at=null)=>({phase:p,armedAt:at,commit,cue});
    if(phase==='done'||phase==='unknown')return out(phase);
    if(phase==='pending'){
      if(ev.type!=='settle')return out('pending');
      return ev.outcome==='done'?out('done',false,'done'):ev.outcome==='failed'?out('idle',false,'failed'):out('unknown',false,'unknown');
    }
    switch(ev.type){
      case 'down':return phase==='holding'?out('holding'):out('holding',false,'keep');
      case 'elapsed':return phase==='holding'?out('pending',true,'pending'):out(phase,false,null,armedAt);
      case 'up':return phase==='holding'?out('idle',false,(ev.held||0)<300?'tap':'released'):out(phase,false,null,armedAt);
      case 'leave':case 'cancel':case 'blur':case 'escape':
        return phase==='holding'?out('idle',false,'released'):phase==='armed'?out('idle',false,'disarmed'):out(phase);
      case 'key':
        if(ev.repeat)return out(phase,false,null,armedAt);
        if(phase==='idle')return out('armed',false,'again',ev.at!=null?ev.at:0);
        if(phase==='armed'){
          // Past the arm window (whatever the timers did): this press is a fresh first press.
          if(armedAt!=null&&ev.at!=null&&ev.at-armedAt>arm)return out('armed',false,'again',ev.at);
          if(armedAt!=null&&ev.at!=null&&ev.at-armedAt<minArm)return out('armed',false,'early',armedAt);
          return out('pending',true,'pending');
        }
        return out(phase,false,null,armedAt);
      case 'timeout':return phase==='armed'?out('idle',false,'disarmed'):out(phase,false,null,armedAt);
      default:return out(phase,false,null,armedAt);
    }
  }
  const tokenMs=(name,def)=>{try{const v=root.getComputedStyle&&root.document?root.getComputedStyle(root.document.documentElement).getPropertyValue(name).trim():'';const n=parseFloat(v);return Number.isFinite(n)?(/ms$/.test(v)?n:/s$/.test(v)?n*1000:n):def;}catch(e){return def;}};
  /* Wires every hold button under root. It owns data-phase, aria-disabled and aria-busy; restores the idle caption on every
     idle transition; sets the caption and the status line from cues ({ keep, tap, released, disarmed, again, early,
     pending, done, failed, unknown } → string ids, through t(id)); vibrates on commit and release where supported.
     onCommit(el) runs once per completed hold or second press; the host then calls settle(el, 'done'|'failed'|'unknown').
     A waiting hold (waiting: true) answers its press through guard() and onRefused(el). Returns { settle, destroy }. */
  function holdBind(scope,{selector='.st-hold',ms,armMs,minArm=HOLD.minArm,slop=HOLD.slop,cues={},t=id=>id,vibrate=true,onPhase=()=>{},onCommit=()=>{},onRefused=()=>{},now=()=>Date.now()}={}){
    const commitMs=ms!=null?ms:tokenMs('--hold-commit',HOLD.commit),armFor=armMs!=null?armMs:tokenMs('--hold-arm',HOLD.arm);
    const idleCap=new WeakMap(),armedAt=new WeakMap();
    let el=null,pid=null,t0=0,timer=null,armTimer=null,lastKey=0;
    const buzz=p=>{if(vibrate&&root.navigator&&root.navigator.vibrate)try{root.navigator.vibrate(p);}catch(e){}};
    const remember=b=>{const c=b.querySelector('.st-hold-caption');if(c&&!idleCap.has(b)&&b.getAttribute('data-phase')==='idle')idleCap.set(b,c.outerHTML);};
    scope.querySelectorAll(selector).forEach(remember);
    function apply(b,r){
      b.setAttribute('data-phase',r.phase);
      if(r.armedAt!=null)armedAt.set(b,r.armedAt);else armedAt.delete(b);
      const off=b.hasAttribute('data-waiting')||['pending','done','unknown'].includes(r.phase);
      if(off)b.setAttribute('aria-disabled','true');else b.removeAttribute('aria-disabled');
      if(r.phase==='pending')b.setAttribute('aria-busy','true');else b.removeAttribute('aria-busy');
      const cap=b.querySelector('.st-hold-caption'),id=r.cue&&cues[r.cue];
      // Every idle transition restores the idle caption; the cue for it goes to the status line only.
      if(r.phase==='idle'){if(idleCap.has(b)&&cap)cap.outerHTML=idleCap.get(b);}
      else if(id&&cap&&['armed','pending','done','unknown'].includes(r.phase)){cap.setAttribute('data-str',id);cap.textContent=t(id);}
      const line=b.getAttribute('data-hold-status')&&root.document&&root.document.getElementById(b.getAttribute('data-hold-status'));
      if(line&&id)announce(line,`<span data-str="${esc(id)}">${esc(t(id))}</span>`);
      if(r.commit)buzz(HOLD.vibrateCommit);else if(r.cue==='released')buzz(HOLD.vibrateRelease);
      onPhase(b,r.phase,r.cue);
      if(r.commit)onCommit(b);
      return r;
    }
    const step=(b,e)=>apply(b,holdStep({phase:b.getAttribute('data-phase'),armedAt:armedAt.get(b)},e,{minArm,arm:armFor}));
    const stop=()=>{clearTimeout(timer);timer=null;el=null;pid=null;};
    const refuse=b=>{guard(b);onRefused(b);};
    const down=e=>{const b=e.target.closest&&e.target.closest(selector);if(!b||e.button!==0||el)return;remember(b);
      if(b.hasAttribute('data-waiting')){refuse(b);return;}
      if(b.getAttribute('aria-disabled')==='true')return;
      e.preventDefault();if(b.setPointerCapture&&e.pointerId!=null)try{b.setPointerCapture(e.pointerId);}catch(x){}
      el=b;pid=e.pointerId;t0=now();clearTimeout(armTimer);step(b,'down');
      timer=setTimeout(()=>{const x=el;stop();if(x&&x.isConnected)step(x,'elapsed');},commitMs);};
    const mine=e=>el&&(pid==null||e.pointerId==null||e.pointerId===pid);
    const up=e=>{if(!mine(e))return;const x=el,held=now()-t0;stop();step(x,{type:'up',held});};
    const move=e=>{if(!mine(e))return;const r=el.getBoundingClientRect();
      if(e.clientX<r.left-slop||e.clientX>r.right+slop||e.clientY<r.top-slop||e.clientY>r.bottom+slop){const x=el;stop();step(x,'leave');}};
    const cancel=e=>{if(!mine(e))return;const x=el;stop();step(x,'cancel');};
    // A repeat (a key held down) is ignored before anything else: it never touches the timers or the phase.
    const press=(b,repeat)=>{if(repeat)return;remember(b);
      if(b.hasAttribute('data-waiting')){refuse(b);return;}
      if(b.getAttribute('aria-disabled')==='true')return;
      const was=armedAt.get(b),r=step(b,{type:'key',at:now()});
      // The deadline belongs to armedAt: a new timer only when a new arm began, and it fires at armedAt + armFor.
      if(r.phase!=='armed'){clearTimeout(armTimer);armTimer=null;return;}
      if(r.armedAt!==was){clearTimeout(armTimer);const at=r.armedAt;armTimer=setTimeout(()=>{if(b.getAttribute('data-phase')==='armed'&&armedAt.get(b)===at)step(b,'timeout');},Math.max(0,at+armFor-now()));}};
    const key=e=>{
      if(e.key==='Escape'){let hit=false;scope.querySelectorAll(selector).forEach(b=>{if(['holding','armed'].includes(b.getAttribute('data-phase'))){hit=true;if(el===b)stop();step(b,'escape');}});if(hit){e.stopPropagation();e.preventDefault();}return;}
      const b=e.target.closest&&e.target.closest(selector);if(!b||(e.key!=='Enter'&&e.key!==' '))return;
      e.preventDefault();lastKey=now();press(b,!!e.repeat);};
    const keyup=e=>{const b=e.target.closest&&e.target.closest(selector);if(b&&e.key===' ')e.preventDefault();};
    // A switch or an assistive click arrives as a click with detail 0 and no keydown before it.
    const click=e=>{const b=e.target.closest&&e.target.closest(selector);if(!b)return;e.preventDefault();if(e.detail!==0||now()-lastKey<100)return;press(b,false);};
    const blur=e=>{const b=e.target.closest&&e.target.closest(selector);if(b&&['holding','armed'].includes(b.getAttribute('data-phase'))){if(el===b)stop();step(b,'blur');}};
    const menu=e=>{if(e.target.closest&&e.target.closest(selector))e.preventDefault();};
    const on=[['pointerdown',down],['pointerup',up],['pointermove',move],['pointercancel',cancel],['click',click],['focusout',blur],['keydown',key],['keyup',keyup],['contextmenu',menu]];
    on.forEach(([n,f])=>scope.addEventListener(n,f));
    return {
      settle(b,outcome){return step(b,{type:'settle',outcome:oneOf('Button','outcome',outcome,['done','failed','unknown'],'unknown')}).phase;},
      destroy(){stop();clearTimeout(armTimer);on.forEach(([n,f])=>scope.removeEventListener(n,f));}
    };
  }
  /* ChoiceList radio as a field (candidate, ADR 0002). layout 'rows': a ChoiceList group of 60px radio rows (the whole row
     is the target). layout 'inline': the Stepper's silhouette — label left, two or three short options right, one 60px
     row (the sex field). Roving tab stop (radioBind moves it). An optional field clears through a visible `Clear` text
     action while a value is chosen (data-action "<action>-clear"); focus then returns to the group's tab stop. */
  const MONO_OK=/^[A-Za-z0-9 .·:/-]*$/;
  function choiceRadios({label='',optional='',options=[],selected='',action='choose',key='',layout='rows',lead='',clear='Clear',id='',className='',disabled=false,reason='',pressed=false,labelHidden=false,strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},rid=id||fieldId('st-radios');
    const lay=oneOf('ChoiceList','layout',layout,['rows','inline'],'rows');
    options.forEach(x=>{if(x.mono&&!MONO_OK.test(String(x.label||'')))warn('ChoiceList',`mono is for Latin and digit codes only: "${x.label}"`);});
    const chosen=options.some(x=>x.value===selected),stop=chosen?selected:(options[0]&&options[0].value);
    const isOptional=!!(optional||has(o,'optional'));
    const clearBtn=isOptional&&chosen?button({label:clear,register:'text',action:action+'-clear',value:key,id:rid+'-clear',strs:s.clear?{label:s.clear}:undefined}):'';
    if(lay==='rows'){
      const rows=options.map(x=>choiceRow({mode:'radio',label:x.label,meta:x.meta||'',value:x.value,action,selected:x.value===selected,mono:!!x.mono,disabled,reason,pressed,tabindex:x.value===stop?0:-1,attrs:{'data-field':key},strs:x.strs,args:x.args}));
      return choiceGroup(rows,{title:label,lead,radio:true,aside:clearBtn,id:rid,className,strs:s.label?{title:s.label}:undefined,args:a.label?{title:a.label}:undefined});
    }
    const lid=rid+'-label';
    const opt=x=>`<button type="button" class="st-choice-inline-opt"${disabled?' aria-disabled="true"':''}${pressed&&x===options[0]?' data-preview="pressed"':''} role="radio" aria-checked="${x.value===selected?'true':'false'}" tabindex="${x.value===stop?0:-1}" data-action="${esc(action)}" data-value="${esc(x.value)}"><span class="st-radio" aria-hidden="true"></span><span${x.mono?' data-mono=""':''}>${tx(x.label,x,'label')}</span></button>`;
    return `<div class="st-choice-inline ${esc(className)}" data-ds="ChoiceList" data-mode="radio" id="${esc(rid)}" data-field="${esc(key)}"><span class="st-choice-inline-label"><span id="${esc(lid)}"${labelHidden?' class="st-visually-hidden"':''}><span${sa(s.label,a.label)}>${esc(label)}</span>${isOptional?`<small>${tx(optional,o,'optional')}</small>`:''}</span>${isOptional?`<span class="st-choice-inline-clear">${clearBtn}</span>`:''}</span><span class="st-choice-inline-opts" role="radiogroup" aria-labelledby="${esc(lid)}">${options.map(opt).join('')}</span>${reason?`<span class="st-choice-meta" role="status">${esc(reason)}</span>`:''}</div>`;
  }
  /* The radio keyboard model, pure: ArrowDown/ArrowRight → next, ArrowUp/ArrowLeft → previous (both wrap), Home → first,
     End → last. Returns the value to select and focus, or null for any other key. */
  function radioNext(values,current,k){
    const n=values.length;if(!n)return null;
    const i=values.indexOf(current);
    if(k==='Home')return values[0];
    if(k==='End')return values[n-1];
    if(k==='ArrowDown'||k==='ArrowRight')return values[i<0?0:(i+1)%n];
    if(k==='ArrowUp'||k==='ArrowLeft')return values[i<0?n-1:(i-1+n)%n];
    return null;
  }
  /* Wires the keyboard model under root: the arrow keys select and focus (onChange(key, value) re-renders; the radio with
     that value then takes focus). Space and Enter select through the ordinary click. Returns { destroy }. */
  function radioBind(scope,{onChange=()=>{}}={}){
    const key=e=>{
      const r=e.target.closest&&e.target.closest('[role="radio"]');if(!r)return;
      const group=r.closest('[role="radiogroup"]');if(!group)return;
      const radios=Array.from(group.querySelectorAll('[role="radio"]')).filter(x=>x.getAttribute('aria-disabled')!=='true'&&!x.disabled);
      const cur=radios.find(x=>x.getAttribute('aria-checked')==='true')||r;
      const next=radioNext(radios.map(x=>x.getAttribute('data-value')),r.getAttribute('data-value')||cur.getAttribute('data-value'),e.key);
      if(next==null)return;
      e.preventDefault();
      const field=(r.closest('[data-field]')||{}).getAttribute?r.closest('[data-field]').getAttribute('data-field'):'';
      onChange(field,next);
      const target=Array.from(scope.querySelectorAll('[role="radio"]')).find(x=>x.getAttribute('data-value')===next&&(x.closest('[data-field]')||{}).getAttribute&&x.closest('[data-field]').getAttribute('data-field')===field);
      if(target&&target.focus)target.focus();
    };
    scope.addEventListener('keydown',key);
    return {destroy(){scope.removeEventListener('keydown',key);}};
  }
  /* Optional row: the one look and behaviour of every optional input. Label (row-title 13/500), the word "Optional" (muted),
     a trailing icon action. Empty it shows `icon`; filled it shows the value as its answer line and `editIcon`.
     Host mode: `action` makes the row a button that asks the host to open the editor (picker, note page, camera).
     Inline mode: `inline` (the field's own markup) is revealed under the row on tap; the row tracks its value as the answer line. */
  function optionalRow({label='',value='',icon='',editIcon='',action='',key='',inline='',open=false,optionalWord='Optional',editLabel='Edit',disabled=false,className='',attrs={}}={}){
    const filled=value!=null&&String(value).trim()!=='',glyph=filled?(editIcon||icon):icon,extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const copy=`<span class="st-optional-copy"><span class="st-optional-head"><span class="st-optional-label">${esc(label)}</span><small class="st-optional-word">${esc(optionalWord)}</small></span><span class="st-optional-answer" role="status">${filled&&!(inline&&open)?esc(value):''}</span></span><span class="st-optional-act" aria-hidden="true">${glyph}</span>`;
    const aria=` aria-label="${esc(filled?`${editLabel} ${label.toLowerCase()}, ${value}`:`${label}, ${optionalWord.toLowerCase()}`)}"`;
    if(!inline)return `<button type="button" data-ds="OptionalRow" class="st-optional-row ${esc(className)}" data-filled="${filled}" data-action="${esc(action)}" data-value="${esc(key)}"${disabled?' disabled':''}${aria}${extra}>${copy}</button>`;
    return `<div data-ds="OptionalRow" class="st-optional ${esc(className)}" data-open="${open}" data-filled="${filled}"><button type="button" class="st-optional-row" data-filled="${filled}" data-st-optional aria-expanded="${open}"${aria}${extra}>${copy}</button><div class="st-optional-body"${open?'':' hidden'}>${inline}</div></div>`;
  }
  if(typeof document!=='undefined'){
    document.addEventListener('click',e=>{const control=e.target.closest('.st-picker-trigger[aria-disabled="true"],.st-choice-row[aria-disabled="true"],.st-choice-inline-opt[aria-disabled="true"]');if(control){e.preventDefault();e.stopImmediatePropagation();}},true);
    const sync=box=>{const field=box.querySelector('.st-optional-body :is(input,textarea)'),v=field?field.value.trim():'',row=box.querySelector('.st-optional-row'),open=box.dataset.open==='true';
      box.dataset.filled=row.dataset.filled=String(!!v);box.querySelector('.st-optional-answer').textContent=open?'':v;};
    document.addEventListener('click',e=>{const row=e.target.closest('[data-st-optional]');if(!row)return;const box=row.closest('.st-optional'),open=box.dataset.open!=='true';
      box.dataset.open=String(open);row.setAttribute('aria-expanded',String(open));box.querySelector('.st-optional-body').hidden=!open;sync(box);if(open)box.querySelector('.st-optional-body :is(input,textarea,select)')?.focus();},true);
  }

  /* Sheet: the one surface presented over a task. variant 'drawer' (default; content-sized, a grab strip, a ✕) |
     'page' (a full sub-page; Back in the footer, never a ✕) | 'dialog' (one small decision). Returns the surface's HTML:
     a drawer is its scrim + the sheet, a page the sheet, a dialog its backdrop + the dialog. Footers come from
     sheetFooter(); the Back control from backButton(). Text slots take a string, { text, str, args } (with `str` the text
     is wrapped for the screen shell's string registry) or { html } (trusted markup, e.g. a title that is a link). */
  const sObj=v=>(v&&typeof v==='object'&&!Array.isArray(v))?v:{text:v};
  const sArgs=a=>a&&Object.keys(a).length?` data-args="${esc(JSON.stringify(a))}"`:'';
  function sT(v){if(v==null||v==='')return '';const o=sObj(v);if(o.html!=null)return String(o.html);return o.str?`<span data-str="${esc(o.str)}"${sArgs(o.args)}>${esc(o.text??'')}</span>`:esc(o.text);}
  function sL(v,fallback){const o=sObj(v==null||v===''?fallback:v);if(o.text==null&&!o.str)return '';return ` aria-label="${esc(o.text??'')}"`+(o.str?` data-str-attr="aria-label:${esc(o.str)}"${sArgs(o.args)}`:'');}
  const sA=(action,value)=>action?` data-action="${esc(action)}" data-value="${esc(value??'')}"`:'';
  const sPaths={'back-chevron':'M15 5l-7 7 7 7'};
  const sGlyph=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${sPaths[k]||(root.SentriIcons&&root.SentriIcons.paths&&root.SentriIcons.paths[k])||''}"/></svg>`;
  /* A line of parts, each a text slot with an optional tone: [{ text, str, args, tone }]; { sep: true } is the shared separator. */
  const sParts=v=>Array.isArray(v)?v.map(p=>{const o=sObj(p);if(o.sep)return SEP;return o.tone?`<span class="st-part" data-tone="${esc(o.tone)}">${sT(o)}</span>`:sT(o);}).join(''):sT(v);
  /* Back: the footer's exit, the same on every sheet (a 16px chevron + the word). Alone in a footer it fills the bar. */
  function backButton({action='back',value='',label={text:'Back',str:'act.back'},className=''}={}){
    return button({register:'secondary',action,value,label:'',className:'surface-back'+(className?' '+className:'')}).replace('<span class="st-button-label"></span>',sGlyph('back-chevron')+'<span>'+sT(label)+'</span>');
  }
  /* A Button from a { label, action, value, register, waiting, describedby } spec (a string is already HTML). */
  function sButton(b){
    if(!b)return '';if(typeof b==='string')return b;
    const l=sObj(b.label),props={label:l.text??'',register:b.register||'primary',action:b.action||'',value:b.value||'',waiting:!!b.waiting,disabled:!!b.disabled,busy:!!b.busy,describedby:b.describedby||'',className:b.className||'',attrs:b.attrs||{}};
    if(l.str){props.strs={label:l.str};if(l.args)props.args={label:l.args};}
    return button(props);
  }
  function sHold(h){
    const l=sObj(h.label),c=sObj(h.caption),props={label:l.text??'',caption:c.text??'',action:h.action||'hold',value:h.value||'',tone:h.tone||'primary',phase:h.phase||'idle',statusId:h.statusId||'',waiting:!!h.waiting,describedby:h.describedby||''},strs={},args={};
    if(l.str){strs.label=l.str;if(l.args)args.label=l.args;}if(c.str){strs.caption=c.str;if(c.args)args.caption=c.args;}
    props.strs=strs;props.args=args;return holdButton(props);
  }
  /* The footer: at most two controls, the primary on the right: Back + a Button spec / a hold / HTML. Alone, Back fills the bar.
     status { text, str, args, id, tone, visible, action }: the one line above the bar that says why the primary waits (wired as
     its aria-describedby) or a hold's progress (its statusId). It is drawn whenever the primary or hold is waiting, or the
     line carries an action; `visible: false` keeps it read-only (still role=status, visually hidden). `content` is trusted
     footer markup in place of back/primary/hold (a host's own two controls); className adds a page hook. */
  function sheetFooter({back:b={},primary,hold:h,status:st,content='',className=''}={}){
    let line='';
    if(!st&&primary&&typeof primary==='object'&&primary.reason){st=sObj(primary.reason);primary=Object.assign({},primary,{reason:''});}
    if(st){
      const id=st.id||fieldId('st-sheet-status'),waiting=!!((primary&&typeof primary==='object'&&primary.waiting)||(h&&h.waiting));
      const vis=waiting||!!st.action||!!st.visible,tone=st.tone?` data-tone="${esc(st.tone)}"`:'';
      const act=vis&&st.action?sButton(Object.assign({register:'text'},st.action)):'';
      if(!vis)line=`<p class="sheet-status st-visually-hidden" id="${esc(id)}" role="status" aria-live="polite"${tone}>${sT(st)}</p>`;
      else line=act?`<div class="sheet-status" data-action-slot><p id="${esc(id)}" role="status" aria-live="polite"${tone}>${sT(st)}</p>${act}</div>`:`<p class="sheet-status" id="${esc(id)}" role="status" aria-live="polite"${tone}>${sT(st)}</p>`;
      if(h&&!h.statusId)h=Object.assign({},h,{statusId:id});
      if(primary&&typeof primary==='object'&&!primary.describedby)primary=Object.assign({},primary,{describedby:id});
    }
    if(content){content=content.replace(/<p class="st-field-hint st-button-reason[^]*?<\/p>/g,reason=>{line+=reason;return '';});}
    const inner=content||`${b?backButton(b):''}${h?sHold(h):sButton(primary)}`;
    return `${line}<div class="sheet-footer${className?' '+esc(className):''}" data-ds="Sheet">${inner}</div>`;
  }
  /* The overlay layer model: z = base + 10 × layer (scrim 2, drawer 3, page 5, dialog 8). An overlay placed after a sheet in the
     phone rises a layer by itself (CSS); `layer: n` sets it. A drawer is never opened over a drawer (replace its content
     instead) — a page, then a drawer or dialog over it, is the deepest stack. */
  const sLayer=n=>n?` data-layer="${esc(n)}"`:'';
  function scrim({action='dismiss',value='',label={text:'Dismiss sheet',str:'tk.sheet.dismiss'},layer=0}={}){
    return `<button type="button" class="scrim" data-ds="Sheet"${sLayer(layer)}${sA(action,value)}${sL(label)}></button>`;
  }
  const SHEET_SIZES=['compact','short','medium','long'];
  function sheet({variant='drawer',title,subtitle,subtitleTone='',icon='',close={action:'dismiss'},lead='',aside='',above='',body='',bodyClass='',footer:f,size='medium',sizing='content',label,view='',className='',id='',layer=0,inert=false,bar='',scrim:sc={},attrs={}}={}){
    const v=oneOf('Sheet','variant',variant,['drawer','page','dialog'],'drawer'),sz=oneOf('Sheet','size',size,SHEET_SIZES,'medium');
    const foot=f===false?'':(f==null?sheetFooter({}):f),ex=safeAttr(attrs),cls=className?' '+esc(className):'',vw=view?` data-view="${esc(view)}"`:'';
    if(v==='dialog'){
      return `<div class="dialog-backdrop" data-ds="Sheet" data-variant="dialog"${sLayer(layer)}><div class="dialog${cls}" role="dialog" aria-modal="true" tabindex="-1"${id?` id="${esc(id)}"`:''}${vw}${inert?' inert':''}${sL(label??title)}${ex}><div class="dialog-body${bodyClass?' '+esc(bodyClass):''}"><h2 class="dialog-title">${icon?sGlyph(icon):''}${sT(title)}</h2>${subtitle?`<p class="dialog-desc">${sParts(subtitle)}</p>`:''}${body}</div>${foot}</div></div>`;
    }
    const sub=subtitle?`<p class="sheet-subtitle"${subtitleTone?` data-tone="${esc(subtitleTone)}"`:''}>${sParts(subtitle)}</p>`:'';
    const cl=Object.assign({action:'dismiss'},close||{}),closeLabel=sObj(cl.label||{text:'Close',str:'act.close'}),x=v==='drawer'?iconButton({variant:'plain',action:cl.action,value:cl.value,icon:sGlyph('close'),label:closeLabel.text||'Close',className:'sheet-close',attrs:closeLabel.str?{'data-str-attr':'aria-label:'+closeLabel.str}: {}}):'';
    const head=`<header class="utility-header">${lead}<div class="sheet-titles"><h2 class="sheet-title">${sT(title)}</h2>${sub}</div>${aside?`<div class="sheet-aside">${aside}</div>`:''}${x}</header>`;
    const common=`data-ds="Sheet" tabindex="-1"${sLayer(layer)}${inert?' inert':''}${id?` id="${esc(id)}"`:''}${vw}${sL(label??title)}${ex}`;
    const main=`${head}${above}<div class="sheet-body${bodyClass?' '+esc(bodyClass):''}">${body}</div>${foot}`;
    if(v==='page')return `<section class="sheet${cls}" ${common} role="region" data-st-context="page" data-presentation="page">${bar}${main}</section>`;
    const scrimHtml=sc===false?'':scrim(Object.assign({layer},sc));
    return `${scrimHtml}<section class="sheet${cls}" ${common} role="dialog" aria-modal="true" data-st-context="drawer" data-size="${sz}"${sizing==='full'?' data-sizing="full"':' data-sizing="content"'}><div class="grab" aria-hidden="true"></div>${main}</section>`;
  }
  if(typeof document!=='undefined')document.addEventListener('keydown',e=>{
    const b=e.target.closest?.('.st-segment button,.st-filter-chips button');if(!b||b.disabled)return;
    const host=b.closest('.spec,.tk-phone,.phone')||document;
    const row=b.parentElement, buttons=Array.from(row.querySelectorAll('button')).filter(x=>!x.disabled);
    const next=radioNext(buttons.map(x=>x.dataset.value),b.dataset.value,e.key);if(next==null)return;
    e.preventDefault();e.stopImmediatePropagation();const target=buttons.find(x=>x.dataset.value===next);target.click();
    const fresh=Array.from(host.querySelectorAll('[data-ds="Segment"] button,[data-ds="FilterChips"] button')).find(x=>x.dataset.action===b.dataset.action&&x.dataset.value===next);fresh?.focus();fresh?.scrollIntoView({block:'nearest',inline:'nearest'});
  },true);
  function rangeSlider({min=0,max=10,step=1,value=[min,max],label='Range',unit='',key='range',state='Default',disabled=false,reason='',error=''}={}){
    if(!(max>min&&step>0))throw new RangeError('RangeSlider requires max > min and step > 0');
    const v=value.map(x=>Math.max(min,Math.min(max,min+Math.round((Number(x)-min)/step)*step))).sort((a,b)=>a-b),id=fieldId('st-range'),fmt=x=>x+(unit?' '+unit:'');
    return `<div class="st-range" data-ds="RangeSlider" data-state="${esc(state)}" data-key="${esc(key)}" data-min="${min}" data-max="${max}" data-step="${step}" data-unit="${esc(unit)}"><p id="${id}">${esc(label)} <output>${v[0]}–${v[1]}${unit?' '+esc(unit):''}</output></p><div class="st-range-rail">${v.map((x,i)=>`<button type="button" class="st-range-handle" role="slider" aria-label="${esc(label)} ${i?'maximum':'minimum'}" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${x}" aria-valuetext="${esc(fmt(x))}" data-handle="${i}" style="left:${(x-min)/(max-min)*100}%"${disabled?' disabled':''}${reason||error?` aria-describedby="${id}-reason"`:''}>${i?'›':'‹'}</button>`).join('')}</div><div class="st-range-ends"><span>${esc(fmt(min))}</span><span>${esc(fmt(max))}</span></div>${reason||error?`<p id="${id}-reason" role="status">${esc(error||reason)}</p>`:''}</div>`;
  }
  function filterSheet({title='Filter',subtitle='',groups=[],count=0,noun='items',emptyReason='No items match',backAction='filter-back',clearAction='filter-clear',applyAction='filter-apply',state='Default',loading=false,error='',className='',scrim=true}={}){
    const blocked=count===0||loading||!!error,reason=error||(loading?'Counting results…':count===0?emptyReason:'');
    return sheet({title,subtitle,className:'st-filter-sheet '+className,close:{action:backAction},scrim:scrim?{action:backAction}:false,aside:button({label:'Clear',register:'text',action:clearAction,strs:{label:'act.clear'}}),body:`<div data-ds="FilterSheet" data-state="${esc(state)}">${groups.map(g=>`<section class="st-filter-group">${g.label?`<h3>${esc(g.label)}</h3>`:''}${g.content}${g.help?`<p>${esc(g.help)}</p>`:''}</section>`).join('')}</div>`,footer:sheetFooter({back:{action:backAction},primary:{label:loading?'Counting results…':`Show ${count} ${noun}`,action:applyAction,disabled:blocked,attrs:{'aria-live':'polite','aria-atomic':'true'}},status:{text:reason,id:fieldId('st-filter-status'),visible:!!reason}})});
  }
  if(typeof document!=='undefined'){
    const update=(root,handle,n)=>{
      const hs=[...root.querySelectorAll('[role="slider"]')],min=+root.dataset.min,max=+root.dataset.max,step=+root.dataset.step,i=+handle.dataset.handle;
      n=Math.max(min,Math.min(max,min+Math.round((n-min)/step)*step));n=i?Math.max(n,+hs[0].getAttribute('aria-valuenow')):Math.min(n,+hs[1].getAttribute('aria-valuenow'));
      handle.setAttribute('aria-valuenow',n);handle.setAttribute('aria-valuetext',n+(root.dataset.unit?' '+root.dataset.unit:''));handle.style.left=(n-min)/(max-min)*100+'%';
      const value=hs.map(h=>+h.getAttribute('aria-valuenow'));root.querySelector('output').textContent=value.join('–')+(root.dataset.unit?' '+root.dataset.unit:'');
      root.dispatchEvent(new CustomEvent('sentri-range-change',{bubbles:true,detail:{key:root.dataset.key,value}}));
    };
    document.addEventListener('keydown',e=>{const h=e.target.closest?.('.st-range-handle');if(!h||h.disabled)return;const r=h.closest('.st-range'),n=+h.getAttribute('aria-valuenow'),step=+r.dataset.step;const v={ArrowLeft:n-step,ArrowDown:n-step,ArrowRight:n+step,ArrowUp:n+step,Home:+r.dataset.min,End:+r.dataset.max}[e.key];if(v==null)return;e.preventDefault();update(r,h,v);});
    let drag;
    document.addEventListener('pointerdown',e=>{const rail=e.target.closest?.('.st-range-rail');if(!rail||e.button!==0)return;const r=rail.closest('.st-range'),hs=[...rail.querySelectorAll('button')];if(hs[0].disabled)return;e.preventDefault();const rect=rail.getBoundingClientRect(),n=+r.dataset.min+(e.clientX-rect.left)/rect.width*(r.dataset.max-r.dataset.min),h=e.target.closest('.st-range-handle')||hs.reduce((a,b)=>Math.abs(n-a.getAttribute('aria-valuenow'))<=Math.abs(n-b.getAttribute('aria-valuenow'))?a:b);drag={r,h,rect};rail.setPointerCapture(e.pointerId);r.dataset.dragging='true';h.focus();update(r,h,n);});
    document.addEventListener('pointermove',e=>{if(drag){const {r,h,rect}=drag;update(r,h,+r.dataset.min+(e.clientX-rect.left)/rect.width*(r.dataset.max-r.dataset.min));}});
    const end=()=>{if(drag)delete drag.r.dataset.dragging;drag=null;};document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);window.addEventListener('blur',end);
  }
  const api=Object.freeze({rangeSlider,filterSheet,optionalRow,heading,panel,facts,row,rowGroup,log,logDay,logStamp,logGroups,categoryFooter,field,pickerField,pickerOptions,pickerBody,pickerFooter,filterChips,chooserList,choiceRow,choiceGroup,choiceSearch,choiceEmpty,segment,iconButton,stepper,measure,numpad,numpadInput,numpadScan,numpadCommit,numpadKey,numpadScanner,rowSelect,rowSelectDoor,rowAction,rowSelectChange,status,conditionTag,statusLine,statusText,announce,liveFill,banner,photos,button,buttonReason,guard,handFocus,holdButton,holdStep,holdBind,HOLD,choiceRadios,radioNext,radioBind,sheet,sheetFooter,backButton,scrim});
  root.SentriUI=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
