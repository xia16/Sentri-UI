/* @ds-bundle: {"format":4,"namespace":"SentriUI","components":[{"name":"Heading"},{"name":"Panel"},{"name":"Facts"},{"name":"Row"},{"name":"Log"},{"name":"Segment"},{"name":"IconButton"},{"name":"Button"},{"name":"Field"},{"name":"PickerField"},{"name":"ChoiceList"},{"name":"Sheet"},{"name":"FilterSheet"},{"name":"RangeSlider"},{"name":"PenMap"},{"name":"TaskTile"},{"name":"WeekBoard"},{"name":"Icon"},{"name":"Stepper"},{"name":"Measure"},{"name":"Numpad"},{"name":"Status"},{"name":"ConditionTag"},{"name":"Banner"},{"name":"Photos"}]} */
/* SentriIcons (sentri-icons.js) and the SentriUI parts, in one file. */
/* Shared icon registry for the Sentri prototypes. One path vocabulary so every
   app renders the same glyphs; apps keep a local fallback for source-only checks. */
(function(root){
  'use strict';
  const paths={
    more:'M6.5 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 1 0 3 0M13.5 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 1 0 3 0M20.5 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 1 0 3 0',
    monitor:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    treat:'M15 3l6 6M16 4l-4 4M20 8l-4 4M10 6l8 8M11 7l-7 7v6h6l7-7M4 20l-2 2M8 12l3 3M11 9l3 3',
    hospital:'M13 3h8v18h-8M17 3v18M13 7h8M13 17h8M2 12h12M9 8l5 4-5 4',
    profile:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    chart:'M4 20V10M12 20V4M20 20v-7',
    production:'M6 19V9m6 10V4m6 15v-6',
    care:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
    back:'M15 5l-7 7 7 7M8 12h13',
    chevron:'M9 5l7 7-7 7',
    up:'M15 5l-7 7 7 7',
    close:'M6 6l12 12M18 6L6 18',
    check:'M5 12l4 4L19 6',
    note:'M5 3h14v18H5zM8 8h8M8 12h8M8 16h5',
    feed:'M3 12h18l-3 7H6zM7 8l1-2 2 1-1 2zM12 5l1-2 2 1-1 2zM15 9l1-2 2 1-1 2z',
    link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2',
    measure:'M3 5h18v14H3zM7 5v5M11 5v3M15 5v5',
    weight:'M5 6h14l2 15H3zM8 6a4 4 0 0 1 8 0M12 11v4',
    search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6',
    'back-chevron':'M15 5l-7 7 7 7',
    grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
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
    details:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
    calendar:'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16',
    bookmark:'M6 3h12v18l-6-4-6 4z',tag:'M3.5 4.5v6.3a1 1 0 0 0 .3.7l8.7 8.7a1.5 1.5 0 0 0 2.1 0l5.6-5.6a1.5 1.5 0 0 0 0-2.1L11.5 3.8a1 1 0 0 0-.7-.3H4.5a1 1 0 0 0-1 1zM8 8h.01','tag-off':'M3.5 4.5v6.3a1 1 0 0 0 .3.7l8.7 8.7a1.5 1.5 0 0 0 2.1 0l5.6-5.6a1.5 1.5 0 0 0 0-2.1L11.5 3.8a1 1 0 0 0-.7-.3H4.5a1 1 0 0 0-1 1zM3 3l18 18',pig:'M5 12.5a5 4.5 0 0 1 5-4.5h5a4.5 4.5 0 0 1 4.3 3.2H21v3.3h-1.7a4.5 4.5 0 0 1-2.3 2.3V19h-2.2v-2h-5.6v2H7v-2.4a4.5 4.5 0 0 1-2-4.1zM16.5 10.6h.01M5 12.5H3.5',lungs:'M12 4v7.5M12 11.5l-2.5 2M12 11.5l2.5 2M9.5 7.5C6.6 7.5 4.5 11.4 4.5 15.4c0 2.2 1 3.6 2.8 3.6 1.6 0 2.7-1 2.7-2.8V10M14.5 7.5c2.9 0 5 3.9 5 7.9 0 2.2-1 3.6-2.8 3.6-1.6 0-2.7-1-2.7-2.8V10',head:'M7.5 8.5 5.5 4l4.3 2.4M16.5 8.5 18.5 4l-4.3 2.4M6 13.5a6 6 0 1 0 12 0 6 6 0 1 0-12 0M9.8 15.2h4.4a1 1 0 0 1 1 1v.6a1 1 0 0 1-1 1H9.8a1 1 0 0 1-1-1v-.6a1 1 0 0 1 1-1zM10 11.5h.01M14 11.5h.01',skin:'M4 8.5c2.7-1.8 5.3 1.8 8 0s5.3-1.8 8 0M4 13c2.7-1.8 5.3 1.8 8 0s5.3-1.8 8 0M4 17.5c2.7-1.8 5.3 1.8 8 0s5.3-1.8 8 0',leg:'M10 3.5v10.5l-2.2 5.5h3.4l.8-2.6.8 2.6h3.4L14 14V3.5',tail:'M4.5 12.5h6.5c2.2 0 4 1.6 4 3.6 0 1.5-1.1 2.6-2.4 2.6-1.1 0-1.9-.8-1.9-1.8 0-1.6 1.6-2.5 3.3-2.5 2.6 0 4.5 1.9 4.5 4.1M4.5 8.5h11',gut:'M8 4.5h8a2.8 2.8 0 0 1 0 5.6H8a2.8 2.8 0 0 0 0 5.6h8a2.8 2.8 0 0 1 0 5.6',repro:'M12 4a4.8 4.8 0 1 0 0 9.6A4.8 4.8 0 1 0 12 4M12 13.6V21M8.8 17.6h6.4',drop:'M12 3.5c3 4 6 7 6 10.8a6 6 0 0 1-12 0C6 10.5 9 7.5 12 3.5z',bone:'M9.2 9.2l5.6 5.6M8 10.4a2.3 2.3 0 1 1-2.4-3.9 2.3 2.3 0 1 1 3.9-2.4M16 13.6a2.3 2.3 0 1 1 2.4 3.9 2.3 2.3 0 1 1-3.9 2.4',
    transfer:'M7 7h11l-3-3M18 7l-3 3M17 17H6l3-3M6 17l3 3',
    down:'m6 9 6 6 6-6',
    'arrow-down':'M12 5v14M6 13l6 6 6-6',
    'trend-down':'M3 6l7 7 4-4 7 7M21 11v5h-5',
    place:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    home:'m3 10 9-7 9 7v11h-6v-7H9v7H3z',
    toolbox:'M3 8h18v12H3zM8 8V4h8v4M3 13h18M10 12v3h4v-3',
    spark:'m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z',
    pill:'M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7',
    bug:'M8 10a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0zM12 10v8M8 12H4M16 12h4M8 16l-3 2M16 16l3 2M8.5 8 6 6M15.5 8 18 6M10 6 9 3M14 6l1-3',
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
    offline:'m3 3 18 18M4 9a13 13 0 0 1 2-1M10 6a14 14 0 0 1 10 3M7 13a8 8 0 0 1 3-1M14 12a8 8 0 0 1 3 1M10 17a3 3 0 0 1 4 0M12 21h.01',
    stop:'M8.5 6.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z'
  };
  const aliases=Object.freeze({origin:'place',arrow:'chevron',condition:'plus'});
  // Compatibility aliases do not add duplicate glyphs to the enumerable registry.
  for(const [alias,name] of Object.entries(aliases))Object.defineProperty(paths,alias,{value:paths[name],enumerable:false});
  const icon=k=>{
    const name=Object.hasOwn(aliases,k)?aliases[k]:k, path=Object.hasOwn(paths,name)?paths[name]:'';
    if(!path)console.warn(`SentriIcons: unknown icon "${k}"`);
    const body=!path?'':name==='more'?[5,12,19].map(cx=>`<circle cx="${cx}" cy="12" r="1.5" fill="currentColor" stroke="none"/>`).join(''):`<path d="${path}"/>`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  };
  const api=Object.freeze({paths:Object.freeze(paths),aliases,icon});
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
  const arrow=root.SentriIcons.icon('chevron');
  /* Heading: three kinds. page = the title of a screen or sheet (title + description only). section = the title of a block,
     above its panel (the only kind with icon, meta and action). group = labels a run of rows or log entries inside one
     panel (muted; title + description only). "panel" is retired: it reads as section. A slot the kind does not carry is
     dropped with a dev warning. action is raw HTML, or { label, action, value, ariaLabel, disabled } for the standard
     text link with its › (48px). */
  function headingAction(a){
    if(!a||typeof a==='string')return a||'';
    const attrs=a.ariaLabel?{'aria-label':a.ariaLabel}:{};
    return button({label:a.label,register:'text',action:a.action,value:a.value||'',disabled:!!a.disabled,attrs,strs:a.strs,args:a.args}).replace(/<\/button>$/,arrow+'</button>');
  }
  function heading({title,icon='',description='',meta='',action='',kind='section',level=4,className='',strs,args}={}){
    const o={strs,args};
    const k=oneOf('Heading','kind',kind,['page','section','group','panel'],'section'),h=Math.max(1,Math.min(6,Number(level)||4));
    if(k!=='section'&&k!=='panel'&&(icon||meta||action||has(o,'meta'))){warn('Heading',`${k}: icon, meta and action belong to a section heading; dropped`);icon='';meta='';action='';}
    const act=headingAction(action);
    const showDesc=description||has(o,'description'),showMeta=meta||has(o,'meta');
    return `<div class="st-heading ${esc(className)}" data-ds="Heading" data-kind="${k}"${icon?' data-has-icon="true"':''}><div class="st-heading-main"><h${h} class="st-heading-title">${icon?`<span class="st-heading-icon">${icon}</span>`:''}<span${sa(strs&&strs.title,args&&args.title)}>${esc(title)}</span></h${h}>${showDesc?`<p class="st-heading-description">${tx(description,o,'description')}</p>`:''}</div>${showMeta||act?`<div class="st-heading-aside">${showMeta?`<span class="st-heading-meta">${tx(meta,o,'meta')}</span>`:''}${act?`<span class="st-heading-action">${act}</span>`:''}</div>`:''}</div>`;
  }
  /* empty: a panel with nothing in it is absent, unless the host keeps its place and names what is missing: then it is one quiet
     line with a tick ("No production work open"; Home's Overview, owner 2026-10-20). */
  function panel(content,{className='',tag='div',ds='Panel',empty=''}={}){
    if(!content||!String(content).trim())return empty?`<div class="st-panel st-panel--empty ${esc(className)}" data-ds="${esc(ds)}"><span aria-hidden="true">${check}</span><p>${esc(empty)}</p></div>`:'';
    const t=['div','section','article','aside','dl'].includes(tag)?tag:'div';
    return `<${t} class="st-panel ${esc(className)}" data-ds="${esc(ds)}">${content}</${t}>`;
  }
  /* Facts: read-only label–value pairs. They never act: no button or link in a value (valueHtml is for markup such as an
     ID in mono, and is refused when it holds a control). columns: 2 (default), 3 (short counts) or 1 (a long value that needs the full width). mono: true sets an ID. */
  function facts(items,{className='',columns=2,variant=''}={}){
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
    const lead=i=>tx(i.label,i,'label'); // Facts never act: a fact that opens something is a Row
    const rec=variant==='record';
    return `<dl class="${rec?'':'st-panel '}st-facts ${esc(className)}" data-ds="Facts" data-columns="${cols}"${variant?` data-variant="${esc(variant)}"`:''}>${items.map(i=>`<div class="st-fact${i.inline?' st-fact-inline':''}"><dt>${lead(i)}</dt><dd>${valueOf(i)}</dd>${i.meta||has(i,'meta')?`<small>${tx(i.meta,i,'meta')}</small>`:''}</div>`).join('')}</dl>`;
  }
  function rowGroup(content,{title='',level=5,className='',strs,args}={}){
    return panel((title||has({strs},'title')?heading({title,kind:'group',level,className:'st-row-group-label',strs,args}):'')+content,{className:'st-row-group '+className,ds:'Row'});
  }
  /* Row tile (owner, 2026-10-19): one action as an icon well over one word, for the grid of everyday verbs in More actions.
     The word is the short verb ("Treat"); the accessible name always contains that word (label in name: voice control says what it sees):
     it is the full action name when that holds the word as a whole word ("Add a note"), else the word, then the full name ("Condition, Disease or symptom", "Treat, Record treatment"). tone 'danger' is
     the one irreversible verb (Death): red ink on its well and word, nothing louder. */
  function rowTile({label,title='',icon='',action='',value='',tone='',attrs={},className=''}={}){
    const word=new RegExp('(^|[^\\p{L}\\p{N}])'+String(label).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^\\p{L}\\p{N}])','iu');
    const holds=/\p{Script=Han}/u.test(String(label))?String(title).includes(String(label)):word.test(String(title)); // Chinese has no spaces: containment is the word test
    const danger=tone==='danger',name=title&&!holds?label+', '+title:(title||label);
    return `<button type="button" class="st-row-tile${danger?' is-danger':''}${className?' '+esc(className):''}" data-ds="Row" data-variant="tile" data-action="${esc(action)}" data-value="${esc(value)}" aria-label="${esc(name)}"${safeAttr(attrs)}><span class="st-row-tile-icon" aria-hidden="true">${icon}</span><span class="st-row-tile-label">${esc(label)}</span></button>`;
  }
  /* The tile grid: one panel. One to five tiles sit in one row (owner, 2026-10-20: two rows only from six); six to ten take two rows,
     split as evenly as possible (6 = 3+3, 7 = 4+3, 8 = 4+4, 9 = 5+4, 10 = 5+5), at most five across. Danger tiles never fold and are always the last tile. Over ten,
     nine show and `more` (a tile that opens the rest in place) sits just before the danger tiles; `expanded` shows them all in
     even rows of at most five (11 = 4+4+3). */
  function rowGrid(tiles=[],{more=null,expanded=false,label='',className=''}={}){
    const calm=tiles.filter(t=>t.tone!=='danger'),danger=tiles.filter(t=>t.tone==='danger'),ordered=[...calm,...danger];
    const folded=ordered.length>10&&!expanded&&!!more,shown=folded?[...calm.slice(0,Math.max(0,9-danger.length)),...danger]:ordered,slots=shown.length+(folded?1:0);
    if(!slots)return '';
    const rows=Math.ceil(slots/5),cols=Math.ceil(slots/rows);
    const moreTile=folded?rowTile(Object.assign({label:'More',title:`${ordered.length-9} more actions`,icon:SentriIcons.icon('more')},more)):'';
    const calmShown=shown.filter(t=>t.tone!=='danger'),dangerShown=shown.filter(t=>t.tone==='danger');
    return `<div class="st-panel st-row-grid${className?' '+esc(className):''}" data-ds="Row" role="group"${label?` aria-label="${esc(label)}"`:''} style="--st-row-grid-cols:${cols}">${calmShown.map(rowTile).join('')}${moreTile}${dangerShown.map(rowTile).join('')}</div>`;
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
  function row({title,description='',icon='',action='',value='',className='',disabled=false,trailing='',trail='auto',attrs={},strs,args,code='',mono=false,chip=null,wrap=false,tight=false,id='',variant='',reason='',mark='',right=null,contextWidth=''}={}){
    const o={strs,args};
    variant=variant||(mark?'tick':code?'animal':trail==='edit'||(chip&&chip.kind==='done')?'record':icon?'navigation':attrs['aria-current']?'scope':'plain');
    if(disabled) description=reason||description||'Unavailable — try again later';
    if(code&&icon)warn('Row','code and icon together: a row leads with one; the code wins');
    const tr=oneOf('Row','trail',trail,['auto','chevron','edit','none'],'auto');
    const typed=trailing&&typeof trailing==='object';
    // Typed trailing words support tone and localization; legacy strings are escaped.
    const trailHtml=chip?'':typed?`<span class="st-row-trailing">${part(trailing)}</span>`:has(o,'trailing')?`<span class="st-row-trailing">${tx(trailing,o,'trailing')}</span>`:trailing?`<span class="st-row-trailing">${esc(trailing)}</span>`:'';
    const tag=action?'button':'div';
    const railHtml=disabled?'':attrs['aria-current']&&attrs['aria-current']!=='false'?`<span class="st-row-chevron" data-rail="current" aria-hidden="true">${check}</span>`:variant==='tick'&&tr==='auto'?'':tr==='edit'?`<span class="st-row-chevron" data-rail="edit">${glyph('edit')}<span data-str="act.edit">Edit</span></span>`:(tr==='chevron'||(tr==='auto'&&action))?`<span class="st-row-chevron">${arrow}</span>`:'';
    if(variant==='animal'&&right){
      const a=animalBody({code,description,right,contextWidth,tight,o});
      return `<${tag} class="st-row ${esc(className)}" data-ds="Row" data-variant="animal" data-animal="${a.kind}"${id?` id="${esc(id)}"`:''}${action?` type="button" data-action="${esc(action)}" data-value="${esc(value)}"${disabled?' disabled aria-disabled="true"':''}`:''}${safeAttr(attrs)}>${a.html}${railHtml}</${tag}>`;
    }
    const c=rowCopy({title,description,code,mono,tight,o,titleId:id?id+'-title':''});
    return `<${tag} class="st-row ${esc(className)}" data-ds="Row" data-variant="${esc(variant)}"${id?` id="${esc(id)}"`:''}${action?` type="button" data-action="${esc(action)}" data-value="${esc(value)}"${disabled?' disabled aria-disabled="true"':''}`:''}${wrap?' data-wrap=""':''}${safeAttr(attrs)}>${rowMark(mark)}${icon&&!code&&variant==='navigation'?`<span class="st-row-icon">${icon}</span>`:''}${code?`<span class="st-row-identity">${c.codeHtml}${rowChip(chip,trailing,'Row')}</span>`:c.codeHtml}<span class="st-row-copy">${c.strong()}${c.small}</span>${code?'':rowChip(chip,trailing,'Row')}${trailHtml}${railHtml}</${tag}>`;
  }
  /* rowSelect: the select + door variant without the door (a select-only list): the whole row is a <label>, leading box. Payload is change-only: rowSelectChange(event) → { value, checked }. */
  function rowSelect({title,description='',code='',mono=false,chip=null,wrap=false,tight=false,checked=false,action='select',value='',id='',className='',attrs={},strs,args,inputAttrs={},disabled=false,reason='',fill=true}={}){
    if(disabled) description=reason||description||'Unavailable — try again later';
    const o={strs,args},c=rowCopy({title,description,code,mono,tight,o});
    return `<label class="st-row ${esc(className)}" data-ds="Row" data-variant="select-door" data-select=""${fill?'':' data-fill="none"'}${id?` id="${esc(id)}"`:''}${wrap?' data-wrap=""':''}${safeAttr(attrs)}><span class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${checked?' checked':''}${disabled?' disabled':''}${safeAttr(inputAttrs)}></span>${title||description||code?`${code?`<span class="st-row-identity">${c.codeHtml}${rowChip(chip,'','Row')}</span>`:c.codeHtml}<span class="st-row-copy">${c.strong()}${c.small}</span>${code?'':rowChip(chip,'','Row')}`:''}</label>`;
  }
  /* rowSelectDoor: a list that both selects (a bulk act) and opens. Two sibling targets, none nested: the checkbox (48px hit area,
     the same box as rowSelect) toggles; the door (copy + ›) opens. contentHtml: trusted markup in place of the title/description copy. */
  function rowSelectDoor({title='',description='',code='',mono=false,wrap=false,tight=false,checked=false,action='select',value='',openAction='open',openValue='',label='',id='',className='',doorClass='',attrs={},strs,args,inputAttrs={},contentHtml='',right=null,contextWidth='',lead='',count=null}={}){
    const o={strs,args},c=rowCopy({title,description,code,mono,tight,o});
    const an=right?animalBody({code,description,right,contextWidth,tight,o}):null;
    /* Group (an Animal row for animals without an ID, owner 2026-10-18): a lead glyph before the name, the tags on the line under it,
       and a count field after the door, always there, so the row keeps the Animal row's height ticked or not. */
    if(an&&lead)an.html=an.html.replace('<strong class="st-animal-id">','<strong class="st-animal-id">'+(root.SentriIcons?root.SentriIcons.icon(lead):''));
    const countHtml=count?`<label class="st-row-count"${count.idle?' data-idle=""':''}><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" value="${esc(String(count.value??''))}"${safeAttr(count.attrs||{})}></label>`:'';
    const copy=contentHtml||(an?an.html:'')||`${c.codeHtml}<span class="st-row-copy">${c.strong()}${c.small}</span>`;
    return `<div class="st-row ${esc(className)}" data-ds="Row" data-variant="select-door"${an?` data-animal="${an.kind}"`:''}${count?' data-group=""':''} data-select=""${id?` id="${esc(id)}"`:''}${wrap?' data-wrap=""':''}${safeAttr(attrs)}><label class="st-choice-trail"><input type="checkbox"${action?` data-action="${esc(action)}"`:''} value="${esc(value)}"${checked?' checked':''}${safeAttr(inputAttrs)}></label><button type="button" class="st-row-door ${esc(doorClass)}" data-action="${esc(openAction)}" data-value="${esc(openValue)}"${label?` aria-label="${esc(label)}"`:''}>${copy}<span class="st-row-chevron">${arrow}</span></button>${countHtml}</div>`;
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
  const chevron=root.SentriIcons.icon('chevron');
  const check=root.SentriIcons.icon('check');
  /* optional: a muted "Optional" beside the label (the treatment's optional fields, owner 2026-10-16). true draws the registry word
     (ds.field.optional); a string is the word already in the page's language. */
  const optionalWord=on=>on===true?` <small class="st-field-optional"><span data-str="ds.field.optional">Optional</span></small>`:on?` <small class="st-field-optional">${esc(on)}</small>`:'';
  function field({label='',control='',className='',ds='Field',variant='text',value='',unit='',hint='',error='',disabled=false,reason='',id='',placeholder='',labelHidden=false,optional=false}={}){
    const fid=id||fieldId('st-field'),hid=fid+'-hint';
    const bad=!!error||className.split(' ').includes('error');
    const message=error|| (bad?'Invalid value. Enter a valid value.':disabled?(reason||'This record cannot be edited.'):hint);
    if(control)variant=/<textarea\b/i.test(control)?'textarea':/type=["']number["']/i.test(control)?'number':variant;
    if(!control)control=variant==='textarea'?`<textarea id="${esc(fid)}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`:`<input id="${esc(fid)}" type="${variant==='number'?'number':'text'}"${variant==='number'?' inputmode="decimal"':''} value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    control=control.replace(/<(input|textarea)\b([^>]*)>/i,(_,tag,attrs)=>{
      const previous=attrs.match(/aria-describedby=["']([^"']*)["']/i)?.[1]||'';
      if(message)attrs=attrs.replace(/\saria-describedby=["'][^"']*["']/i,'');
      if(bad)attrs=attrs.replace(/\saria-invalid=["'][^"']*["']/i,'');
      return `<${tag}${attrs}${label&&!/aria-label(?:ledby)?=/.test(attrs)?` aria-labelledby="${esc(fid)}-label"`:""}${message?` aria-describedby="${esc([previous,hid].filter(Boolean).join(' '))}"`:''}${bad?' aria-invalid="true"':''}${disabled&&!/\bdisabled\b/.test(attrs)?' disabled':''}>`;
    });
    return `<label class="field ${bad?'error ':''}${esc(className)}" data-ds="${esc(ds||'Field')}" data-variant="${esc(variant)}">${label||unit?`<span${labelHidden?' class="visually-hidden"':''} id="${esc(fid)}-label">${label}${unit?` (${esc(unit)})`:''}${optionalWord(optional)}</span>`: ''}${control}${message?`<span class="st-field-message" id="${esc(hid)}" role="${bad?'alert':'status'}">${esc(message)}</span>`:''}</label>`;
  }
  /* Mobile-standard choice control: a trigger button that opens a picker sheet.
     Replaces native <select>; the host app owns the picker view and state.
     strs: label (raw label wrapped in a span), display or value (the shown value), placeholder. */
  function pickerField({label='',value='',display='',placeholder='Select',action='open-picker',key='',disabled=false,reason='',error='',loading=false,variant='single',selected=[],names=[],path=[],pressed=false,active=false,required=false,optional=false,ariaLabel='',className='',strs,args}={}){
    const multi=variant.includes('multi'), named=multi&&names.length>0;
    /* Record forms show the chosen names in up to two lines, then +n: names are kept while they fit a two-line budget
       (about 30 characters a line at the narrowest phone; CJK counts double), so the line is never clamped mid-name; the first name is always shown. */
    const w=t=>[...String(t)].reduce((n,ch)=>n+(/[⺀-￿]/.test(ch)?2:1),0);let fit=0;for(let used=0;fit<names.length;fit++){const add=w(names[fit])+(fit?3:0);if(fit&&used+add>60)break;used+=add;}
    const shownNames=names.slice(0,Math.max(1,fit)),hiddenN=names.length-shownNames.length;
    const text=named?shownNames.join(' · ')+(hiddenN?' · +'+hiddenN:''):multi?(selected.length?selected.length+' selected':'None'):path.length?path[path.length-1]:display||value;
    const more=named&&hiddenN?'+'+hiddenN:'';
    const shown=text!==''&&text!=null, id=fieldId('st-picker'), hint=error||reason||(loading?'Loading options…':'');
    return `<div class="field st-picker-field ${esc(className)}${error?' error':''}" data-ds="PickerField" data-variant="${esc(variant)}"${required?' data-required=""':''}><span id="${id}-label">${tx(label,{strs,args},'label')}${optionalWord(optional)}</span><button type="button" class="st-picker-trigger${shown?'':' is-placeholder'}" ${ariaLabel?`aria-label="${esc(ariaLabel)}, ${esc(shown?text:placeholder)}"`:`aria-labelledby="${id}-label ${id}-value"`} aria-haspopup="dialog" aria-expanded="${active}"${hint?` aria-describedby="${id}-hint"`:''}${error?' aria-invalid="true"':''}${disabled||loading?' aria-disabled="true"':''}${loading?' aria-busy="true"':''}${pressed?' data-preview="pressed"':''} data-action="${esc(action)}" data-picker-key="${esc(key)}"><span id="${id}-value" class="st-picker-value${named?' is-names':''}"${named?'':sa(multi?(strs?.display|| (selected.length?'ds.picker.selected':'ds.picker.none')):shown?(strs?.display||strs?.value):(strs?.placeholder||(placeholder==='Select'?'ds.picker.select':undefined)),multi?{n:selected.length,...args?.display}:args?.display||args?.value)}>${named?`<span class="st-picker-names">${esc(shownNames.join(' · '))}</span>${more?`<span class="st-picker-more">${esc(more)}</span>`:''}`:esc(shown?text:placeholder)}</span>${chevron}</button>${hint?`<span id="${id}-hint" class="st-picker-hint" role="status">${esc(hint)}</span>`:''}</div>`;
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
    /* Search covers the level you are on (the whole tree at the root), so a result never sits under a level it is not in.
       Its meta is the path below this level. */
    const q=query.trim().toLocaleLowerCase(),scope=cascade&&steps.length?nodes:items,here=steps[steps.length-1];
    const visible=q?leaves(scope).filter(n=>[n.label,n.group||'',...n.trail,...(n.aliases||[])].join(' ').toLocaleLowerCase().includes(q)):cascade?nodes:leaves(items);
    const count=n=>leaves([n]).filter(x=>selected.includes(x.value)).length;
    const rows=visible.map(n=>{
      const row=choiceRow({label:n.label,meta:n.children?(multi&&count(n)?count(n)+' selected':''):q?n.trail.join(' › '):n.meta||'',mode:n.children?'navigate':multi?'multi':'single',action:n.children||!multi?action:'',value:n.value,selected:selected.includes(n.value),disabled:!!n.disabled,reason:n.reason||'',attrs:n.attrs||{},strs:{...n.strs,...(n.children&&multi&&count(n)?{meta:'ds.picker.selected'}:{})},args:{...n.args,...(n.children&&multi&&count(n)?{meta:{n:count(n)}}:{})}});
      const extra=n.secondaryAction?`<div class="st-choice-extra">${button({label:n.secondaryAction.label,action:n.secondaryAction.action,value:n.value,register:'text',attrs:{'aria-label':n.secondaryAction.label+' '+n.label}})}</div>`:'';
      return row+extra;
    });
    const search=here?choiceSearch({label:'Search in '+here.label,value:query,attrs:searchAttrs,strs:{label:'ds.picker.search_in',placeholder:'ds.picker.search_in'},args:{level:here.label}}):choiceSearch({label:'Search all options',value:query,attrs:searchAttrs,strs:{label:strs.search||'ds.picker.search',placeholder:strs.search||'ds.picker.search'}});
    /* No breadcrumb: the sheet's title names the level (pickerHead); the footer's Back goes up one. */
    const groups=[];
    visible.forEach((n,i)=>{const title=n.group||n.trail?.join(' › ')||'';let group=groups.find(g=>g.title===title);if(!group){group={title,rows:[]};groups.push(group);}group.rows.push(rows[i]);});
    const list=!cascade&&!q?groups.map(g=>choiceGroup(g.rows,{title:g.title})).join(''):choiceGroup(rows);
    const content=loading||error?choiceEmpty(loading?'Loading options…':error,{strs:{text:loading?strs.loading||'ds.picker.loading':strs.error}}):visible.length?list:choiceEmpty(q?'No options match “'+query+'”.':'No options available.',{strs:{text:q?strs.noMatch||'ds.picker.no_match':strs.empty||'ds.picker.empty'},args:{text:{query}}});
    return `<div class="st-picker-body" data-ds="PickerField" data-variant="${esc(variant)}">${search}${content}</div>`;
  }

  /* A drawer with levels (owner ruling B, 2026-10-16): the title names the level you are on; a ✕ at the top left closes the
     whole drawer from any level; the footer's Back goes up one level, and at the first level it leaves (the draft is kept).
     No "‹ Parent" in the header. Spread title, cross and rows into sheet(): sheet({...pickerHead({…}), body, footer}), and
     hand `levelBack` to the footer: pickerFooter({back: head.levelBack}) or sheetFooter({back: head.levelBack}). Below the
     root `levelBack` is { action: stepAction, value }: the path length to keep, so the host's stepAction slices the path
     exactly as before; at the root it is { action: backAction } (leave). `cross` uses closeAction, which the host handles as
     leaving (the scrim's action by default). */
  function pickerHead({items=[],path=[],title='',stepAction='picker-step',backAction='back',closeAction='dismiss'}={}){
    let nodes=items;const steps=[];
    for(const value of path){const n=nodes.find(n=>n.value===value);if(!n?.children)break;steps.push(n);nodes=n.children;}
    const most=list=>Math.max(list.length,...list.filter(n=>n.children).map(n=>most(n.children)));
    const rows=most(items),cross={action:closeAction,label:{text:'Close',str:'act.close'}};
    if(!steps.length)return {title,cross,levelBack:{action:backAction},rows};
    const here=steps[steps.length-1];
    const name=n=>n.strs?.label?{text:n.label,str:n.strs.label,args:n.args?.label}:n.label;
    return {title:name(here),cross,levelBack:{action:stepAction,value:String(steps.length-1)},rows};
  }
  /* Back goes up one level (back: pickerHead().levelBack) and at the first level leaves, keeping the draft (pure navigation);
     Done confirms it. A single pick commits, so single has Back alone. The word is always Back. */
  function pickerFooter({selected=[],multi=false,waiting=false,back=null,backAction='back',doneAction='picker-done',strs={},args={}}={}){
    const backBtn=backButton({action:back?.action||backAction,value:back?.value??'',label:strs.back?{text:'Back',str:strs.back}:{text:'Back',str:'act.back'}});
    if(!multi)return sheetFooter({content:backBtn,className:'st-picker-footer'});
    return sheetFooter({content:backBtn+`<button type="button" class="button primary" data-ds="Button" data-register="primary" data-action="${esc(doneAction)}"${waiting?' aria-disabled="true"':''}>${tx('Done · '+selected.length,{strs:{done:strs.done||'ds.picker.done_count'},args:{done:{n:selected.length,...args.done}}},'done')}</button>`,className:'st-picker-footer'});
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
  function choiceGroup(rows,{title='',lead='',className='',radio=false,aside='',id='',icon='',strs,args}={}){
    const body=Array.isArray(rows)?rows.join(''):rows;
    const showTitle=title||has({strs},'title');
    const hid=radio&&showTitle?(id||fieldId('st-choice'))+'-title':'';
    return `<section class="st-choice-group ${esc(className)}" data-ds="ChoiceList"${title?` aria-label="${esc(title)}"`:''}>${showTitle?(aside?`<div class="st-choice-heading-row"><h5 class="st-choice-heading"${hid?` id="${esc(hid)}"`:''}>${icon?glyph(icon):''}${tx(title,{strs,args},'title')}</h5>${aside}</div>`:`<h5 class="st-choice-heading"${hid?` id="${esc(hid)}"`:''}>${icon?glyph(icon):''}${tx(title,{strs,args},'title')}</h5>`):''}${lead?`<div class="st-choice-lead">${lead}</div>`:''}<div class="st-panel st-choice-panel"${radio?` role="radiogroup"${hid?` aria-labelledby="${esc(hid)}"`:''}`:''}>${body}</div></section>`;
  }
  /* The search field's ends, one look wherever a worker types to narrow (Lookup's Find, a picker's catalogue, a list's ear-tag
     search): Clear (✕, only while something is typed) and the scan glyph when the host has a reader. `clear.action` is the host's,
     else the shared handler below empties the field and fires `input`. */
  function searchTools({value='',scan=null,clear={}}={}){
    let clearBtn=iconButton({variant:'plain',action:clear.action||'',icon:SentriIcons.icon('close'),label:clear.label||'Clear',className:'st-find-clear st-search-clear',attrs:clear.label?{}:{'data-str-attr':'aria-label:act.clear'}}).replace('<button',`<button${value?'':' hidden'}${clear.action?'':' data-search-clear=""'}`);
    // the shared Clear is no host action: an empty data-action would reach the host's own action handler first
    if(!clear.action)clearBtn=clearBtn.replace(' data-action=""','');
    const scanBtn=scan?iconButton({variant:'plain',action:scan.action,icon:SentriIcons.icon('scan'),label:scan.label||'Scan ear tag',className:'st-find-scan'}):'';
    return clearBtn+scanBtn;
  }
  /* Find's field (Lookup): a box of its own holding the search glyph, the host's <input> and the ends. */
  function searchBox({input='',value='',scan=null,clear={},tag='div',className=''}={}){
    return `<${tag} class="st-find-field${className?' '+esc(className):''}">${SentriIcons.icon('search')}${input}${searchTools({value,scan,clear})}</${tag}>`;
  }
  /* Search in a picker, a sheet or a list (ChoiceList): the same look as Find's field, built on the field every host already sizes:
     the input is the box (each host keeps its own height and width), the search glyph sits in its left padding and the ends
     (✕ Clear, scan) in its right. The browser's cancel glyph is hidden. Clear empties the field and fires `input`, so the host's
     own input handler refreshes the list. */
  function choiceSearch({label='Search',placeholder='',value='',attrs={},scan=null,clear={},strs={},args}={}){
    const extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const input=`<input type="search" aria-label="${esc(label)}"${strs.label?` data-str-attr="aria-label:${esc(strs.label)}${strs.placeholder?`;placeholder:${esc(strs.placeholder)}`:''}"${sArgs(args)}`:''} placeholder="${esc(placeholder||label)}" value="${esc(value)}"${extra}>`;
    return `<label class="field catalog-search st-choice-search" data-ds="ChoiceList"><span class="st-search-box">${SentriIcons.icon('search')}${input}<span class="st-search-ends">${searchTools({value,scan,clear})}</span></span></label>`;
  }
  /* Toast: what was just saved, over the page above its dock, for a few seconds. title: what was done; detail: for whom, or where it went;
     tone 'done' (a check on the green) or 'offline' (no-signal on the ink: saved on this phone), else no glyph. */
  /* Toast: a save confirmed for a few seconds (done, offline, plain). standing ({ action, value, label }): the standing form (owner,
     2026-10-20) — it stays in the page's flow until what it reports is looked at, and the whole box is one door with a chevron.
     notice (a neutral note glyph): records that weren't accepted; attention (a red disc): a person must act (signed out). */
  function toast(title,{detail='',tone='',standing=null,strs,args}={}){const glyph=tone==='done'?'check':tone==='offline'?'offline':tone==='notice'?'note':tone==='attention'?'alert':'';const inner=`${glyph&&root.SentriIcons?`<span class="st-toast-glyph" aria-hidden="true">${root.SentriIcons.icon(glyph)}</span>`:''}<span class="st-toast-copy"><strong class="st-toast-title">${tx(title,{strs,args},'title')}</strong>${detail?`<span class="st-toast-detail">${tx(detail,{strs,args},'detail')}</span>`:''}</span>`;if(standing)return `<button type="button" class="st-toast st-toast--standing${tone?' st-toast--'+tone:''}" data-ds="Toast" data-variant="standing" data-action="${esc(standing.action||'')}" data-value="${esc(standing.value||'')}"${standing.label?` aria-label="${esc(standing.label)}"`:''}>${inner}<span class="st-toast-chevron" aria-hidden="true">${root.SentriIcons?root.SentriIcons.icon('chevron'):''}</span></button>`;return `<div class="st-toast${tone?' st-toast--'+tone:''}" data-ds="Toast" role="status">${inner}</div>`}
  function choiceEmpty(text,{strs,args,title,icon}={}){if(title)return `<div class="st-choice-empty st-choice-empty--lead" data-ds="ChoiceList" role="status">${icon&&globalThis.SentriIcons?`<span class="st-choice-empty-icon" aria-hidden="true">${globalThis.SentriIcons.icon(icon)}</span>`:''}<strong class="st-choice-empty-title">${tx(title,{strs,args},'title')}</strong><span class="st-choice-empty-text">${tx(text,{strs,args},'text')}</span></div>`;return `<p class="st-choice-empty" data-ds="ChoiceList" role="status">${tx(text,{strs,args},'text')}</p>`;}
  /* options: [value,label,{strs:{label},args:{label}}?]; label is raw HTML, kept as the span's fallback. */
  /* variant 'scope' (owner, 2026-10-20; from Home's Overview | Choose unit): the whole list, or one part of it picked in a drawer.
     Two options: the whole (with its count) and a door ({door:true}) that names the current part, or "Choose …" when none is picked. */
  function segment({options=[],active='',action='',className='',ariaLabel='',variant='two-line-lens',state='Default',disabled=false,reason=''}={}){
    if(!options.length)return '';
    return `<div class="st-selection"><div class="st-segment ${esc(className)}" data-ds="Segment" data-variant="${esc(variant)}" data-state="${esc(state)}" role="group" aria-label="${esc(ariaLabel)}">${options.map(([v,label,x={}])=>{const blocked=disabled||x.disabled;return `<button type="button" data-action="${esc(action)}" data-value="${esc(v)}" aria-pressed="${v===active}"${x.ariaLabel?` aria-label="${esc(x.ariaLabel)}"`:""}${x.door?' aria-haspopup="dialog"':''}${blocked?' disabled':''}><span class="st-selection-label"${has(x,'label')?sa(x.strs.label,x.args&&x.args.label):''}>${label}</span>${x.count!=null?`<span class="st-selection-count">${x.count}</span>`:variant==='two-line-lens'?'<span class="st-selection-count" aria-hidden="true"></span>':''}${x.door&&root.SentriIcons?`<span class="st-segment-door" aria-hidden="true">${root.SentriIcons.icon('down')}</span>`:''}</button>`;}).join('')}</div>${reason?`<p class="st-selection-reason">${esc(reason)}</p>`:''}</div>`;
  }
  function filterChips({items=[],action='chip',key='chips',label='',state='Default',reason=''}={}){
    if(!items.length)return '';
    const on=(items.find(i=>i.checked)||items[0]).value;
    return `<div class="st-filter-chips" data-ds="FilterChips" data-field="${esc(key)}" data-state="${esc(state)}"><div class="st-filter-chips-track" role="radiogroup" aria-label="${esc(label)}">${items.map(i=>`<button type="button" role="radio" aria-checked="${i.value===on}" tabindex="${i.value===on?0:-1}" data-action="${esc(action)}" data-value="${esc(i.value)}"${i.aria?` aria-label="${esc(i.aria)}"`:""}${i.disabled?' disabled':''}>${i.value===on?`<span class="st-chip-check" aria-hidden="true">${globalThis.SentriIcons?globalThis.SentriIcons.icon('check'):''}</span>`:''}<span class="st-selection-label">${i.label}</span>${i.count!=null?`<span class="st-selection-count">${i.count}</span>`:''}</button>`).join('')}</div>${reason?`<p class="st-selection-reason">${esc(reason)}</p>`:''}</div>`;
  }
  function iconButton({action='',icon='',label='',variant='bordered',className='',value='',badge='',count='',tone='',disabled=false,pressed=false,selected=null,reason='',describedby='',attrs={},strs,args}={}){
    const o={strs,args},hasBadge=(badge!==''&&badge!=null)||has(o,'badge');
    const v=oneOf('IconButton','variant',variant,['bordered','plain'],'bordered');
    const rid=reason?(describedby||fieldId('st-icon-reason')):describedby;
    return `<button type="button" class="icon-button ${esc(className)}" data-ds="IconButton" data-variant="${v}" data-action="${esc(action)}" data-value="${esc(value)}" aria-label="${esc(label)}"${count!==''&&count!=null?' data-count=""':''}${tone==='attention'?' data-tone="attention"':''}${disabled?' aria-disabled="true"':''}${pressed?' data-preview="pressed"':''}${selected!=null?` aria-pressed="${!!selected}"`:''}${rid?` aria-describedby="${esc(rid)}"`:''}${safeAttr(attrs)}><span aria-hidden="true">${icon}</span>${count!==''&&count!=null?`<span class="icon-button-count" aria-hidden="true">${esc(count)}</span>`:''}${selected?`<span class="st-icon-selected" aria-hidden="true">${sGlyph('check')}</span>`:''}${hasBadge?`<span class="filter-badge">${tx(badge,o,'badge')}</span>`:''}</button>${reason?buttonReason({id:rid,text:reason}):''}`;
  }
  /* TaskDock: a task page's bottom bar, lifted unchanged from Farrowing's room dock (owner proposal, 2026-10-21). The place (a
     framed button: Farrowing's pen map, Inspection's pen), the one primary tool (Scan ear tag) and icon tools (Search). A host's own
     bar for the moment (Inspection's selection: the count and Actions) takes the dock's place through `content`. The frozen
     piglet-processing room keeps SentriTask.dock's older face. */
  function taskDock({label='Task tools',place=null,primary=null,tools=[],content='',className=''}={}){
    const pl=place?`<button data-framed type="button" class="tk-dock-unit dock-map"${place.aria?` aria-label="${esc(place.aria)}"`:''} data-action="${esc(place.action)}" data-value="${esc(place.value??'')}">${SentriIcons.icon(place.icon||'grid')}<span><strong>${esc(place.label)}</strong></span></button>`:'';
    const pr=primary?button({label:'',register:'primary',action:primary.action,value:primary.value??'',className:'dock-scan',attrs:primary.attrs||{}}).replace('<span class="st-button-label"></span>',`${SentriIcons.icon(primary.icon||'scan')}<span>${esc(primary.label)}</span>`):'';
    const tl=tools.map(x=>iconButton({action:x.action,value:x.value??'',icon:SentriIcons.icon(x.icon),label:x.label,className:x.className||''})).join('');
    return `<nav class="room-dock${className?' '+esc(className):''}" data-ds="TaskDock" aria-label="${esc(label)}">${content||pl+pr+tl}</nav>`;
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
  const glyph=k=>root.SentriIcons.icon(k);
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
  function stepper({label='',prefix='',description='',value=0,min=0,max=null,step=1,action='step',key='',variant='row',changed=false,draft=false,tone='',hint='',pointers=[],reserveHint,id='',className='',disabled=false,reason='',error='',loading=false,pressed=false,status='',hintHtml='',strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{};
    const n=Number(value)||0,hero=variant!=='row',lid=id||fieldId('st-stepper'),hid=lid+'-hint',d=Math.abs(Number(step)||1);
    variant=variant==='hero'?'count':variant;
    const floorGray=disabled||loading||n<=min,ceilGray=disabled||loading||(max!=null&&n>=max);
    // draft: the value carries an unsaved staged addition. The value stays ink (green means approved only); the word "unsaved" carries the state; it wins over changed.
    const isDraft=draft||tone==='draft',isChanged=!isDraft&&(changed||tone==='changed');
    // The draft or corrected word: beside the label in a row (no extra line, every row keeps one height); under the number in count and well.
    const stateWord=isDraft?tx(status||'Unsaved',{strs:{status:s.status||(!status?'ds.stepper.unsaved':undefined)},args:{status:a.status}},'status'):isChanged?tx(status||'Corrected',{strs:{status:s.status||(!status?'ds.stepper.corrected':undefined)},args:{status:a.status}},'status'):'',nid=lid+'-note',inline=variant==='row'&&stateWord;
    const key1=(dir,gray)=>{const kid=`${lid}-${dir<0?'dec':'inc'}`;return `<button type="button" class="st-stepper-key" id="${esc(kid)}" data-action="${esc(action)}" data-value="${esc(key)}" data-step="${dir*d}" aria-labelledby="${esc(lid)} ${esc(kid)}" aria-describedby="${esc(hid)}${inline?' '+esc(nid):''}"${pressed&&dir>0?' data-preview="pressed"':''}${gray?' aria-disabled="true"':''}${dir<0?ariaText('Decrease',s.decrease,a.decrease):ariaText('Increase',s.increase,a.increase)}><span class="st-stepper-face">${glyph(dir<0?'minus':'plus')}</span></button>`;};
    const copy=`<span class="st-stepper-copy"><span class="st-stepper-label" id="${esc(lid)}">${tx(label,o,'label')}</span>${inline?`<span class="st-stepper-note" id="${esc(nid)}" role="status" aria-live="polite">${stateWord}</span>`:''}${description||has(o,'description')?`<small class="st-stepper-description">${tx(description,o,'description')}</small>`:''}</span>`;
    const vargs=a.value||(s.value?{n:String(n)}:null);
    const val=`<span class="st-stepper-value" role="spinbutton" tabindex="0" data-st-spin${disabled||loading?' aria-disabled="true"':''}${error?' aria-invalid="true"':''} aria-labelledby="${esc(lid)}" aria-describedby="${esc(hid)}${inline?' '+esc(nid):''}" aria-valuenow="${n}" aria-valuemin="${esc(min)}"${max!=null?` aria-valuemax="${esc(max)}"`:''} aria-live="polite"${sa(s.value,vargs)}>${esc(prefix)}${esc(n)}</span>`;
    const canPoint=pointers.length>0;
    const reserve=reserveHint!=null?(reserveHint?(canPoint?'action':'text'):''):'';
    const messages=[hint||has(o,'hint')?tx(hint,o,'hint'):'',error?esc(error):'',disabled?esc(reason||'This record cannot be edited.'):'',loading?tx('Saving…',{strs:{status:'ds.stepper.saving'}},'status'):'',''].filter(Boolean);
    if(stateWord&&!inline)messages.push(stateWord);
    let hl=hintLine('st-stepper-hint',{id:hid,reserve,fieldKey:key});
    hl=hl.replace(/>.*<\/p>$/,`>${hintHtml||messages.join('<span aria-hidden="true"> · </span>')}${textActions(pointers,key)}</p>`);
    return `<div class="st-stepper ${esc(className)}" data-ds="Stepper" data-variant="${esc(variant)}" data-field="${esc(key)}"${loading?' aria-busy="true"':''}${error?' data-error="true"':''} role="group" aria-labelledby="${esc(lid)}"${n===0?' data-zero=""':''}${isChanged?' data-changed=""':''}${isDraft?' data-draft=""':''}${max!=null&&max>=1000?' data-wide=""':''}>${copy}<span class="st-stepper-keys">${key1(-1,floorGray)}${val}${key1(1,ceilGray)}</span>${hl}</div>`;
  }
  if(typeof document!=='undefined')document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-search-clear]');if(!b)return;
    const i=b.closest('.st-search-box')?.querySelector('input');if(!i)return;
    e.preventDefault();e.stopPropagation();i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));i.focus();
  },true); // captured: the field empties before any host handler sees the tap
  /* The search field's ✕ shows only while something is typed, also when the host does not redraw on input. */
  if(typeof document!=='undefined')document.addEventListener('input',e=>{
    const f=e.target.closest?.('.st-find-field, .st-search-box');if(f&&e.target.matches('input'))f.querySelector('.st-find-clear')?.toggleAttribute('hidden',!e.target.value);
  },true);
  if(typeof document!=='undefined')document.addEventListener('keydown',e=>{
    const spin=e.target.closest('[data-st-spin]');if(!spin||!['ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();
    const group=spin.closest('.st-stepper'),key=group.dataset.field,variant=group.dataset.variant,label=group.querySelector('.st-stepper-label').textContent;
    const ancestors=[];for(let node=group.parentElement;node;node=node.parentElement)ancestors.push(node);
    group.querySelectorAll('.st-stepper-key')[e.key==='ArrowDown'?0:1].click();
    // Legacy hosts replace their sheet on each delta. Keep repeated arrow presses on the value.
    const scope=ancestors.find(node=>node.isConnected);
    const replacement=spin.isConnected?spin:[...(scope?.querySelectorAll('.st-stepper')||[])].find(node=>!node.closest('[inert]')&&node.dataset.field===key&&node.dataset.variant===variant&&node.querySelector('.st-stepper-label').textContent===label)?.querySelector('[data-st-spin]');
    replacement?.focus({preventScroll:true});
  });
  /* The box a measured or typed value sits in; shared by Measure (a button) and the Numpad readout (static).
     live: the value announces as it is typed (concise: the value only, never the label). */
  function valueBox(tag,{value='',unit='',unitGap=true,placeholder='—',active=false,live=false,attrs='',vid='',uid=''},o){
    const empty=value===''||value==null,s=o.strs||{},a=o.args||{};
    const shown=empty?(active?'':placeholder):String(value);
    const sid=empty?(active?'':s.placeholder):s.value,sargs=empty?a.placeholder:(a.value||(s.value?{n:String(value)}:null));
    return `<${tag} class="st-measure-box"${unitGap?'':' data-unit-gap="none"'}${attrs}><span class="st-measure-value"${vid?` id="${esc(vid)}"`:''}${live?' aria-live="polite" aria-atomic="true"':''}${sid?sa(sid,sargs):''}>${esc(shown)}</span>${unit||has(o,'unit')?`<span class="st-measure-unit"${uid?` id="${esc(uid)}"`:''}>${tx(unit,o,'unit')}</span>`:''}</${tag}>`;
  }
  /* Measure: one measured value, mono, unit always written. A button that opens the docked Numpad (active).
     input:'system' (opt-in) draws the same box as a native text field on the phone's decimal keyboard instead: for one
     optional value inside a form, where a pad would be heavier than the job (the Numpad stays for runs of typed values).
     range is evaluated only when the pad is closed (active false), never per keystroke. */
  function measure({label='',optional='',value='',unit='',unitGap=true,placeholder='—',action='open-numpad',key='',active=false,controls='',range=null,tone='',changed=false,hint='',note='',id='',className='',layout='',input='',inputAttrs='',strs,args}={}){
    const o={strs,args},lid=id||fieldId('st-measure'),v=value==null?'':String(value),num=parseFloat(v);
    const out=!active&&Array.isArray(range)&&v!==''&&!Number.isNaN(num)&&(num<range[0]||num>range[1]);
    const t=tone==='refused'?'refused':tone==='warn'||out?'warn':'';
    const isChanged=changed||tone==='changed';
    const lab=`<span class="st-measure-label" id="${esc(lid)}"><span${sa(o.strs&&o.strs.label,o.args&&o.args.label)}>${esc(label)}</span>${optional||has(o,'optional')?`<small>${tx(optional,o,'optional')}</small>`:''}</span>`;
    const vid=lid+'-value',uid=lid+'-unit',hid=lid+'-hint',nid=lid+'-note';
    const hasNote=!!(note||has(o,'note'));
    const sys=oneOf('Measure','input',input||'pad',['pad','system'],'pad')==='system';
    const box=sys?`<label class="st-measure-box" data-input="system"${unitGap?'':' data-unit-gap="none"'}><input class="st-measure-input" id="${esc(vid)}" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${esc(placeholder)}" value="${esc(v)}" aria-labelledby="${esc(lid)} ${esc(uid)}" aria-describedby="${esc(hid)}${hasNote?' '+esc(nid):''}" ${inputAttrs}>${unit||has(o,'unit')?`<span class="st-measure-unit" id="${esc(uid)}">${tx(unit,o,'unit')}</span>`:''}</label>`
      :valueBox('button',{value:v,unit,unitGap,placeholder,active,live:active,vid,uid,attrs:` type="button" data-action="${esc(action)}" data-value="${esc(key)}" aria-labelledby="${esc(lid)} ${esc(vid)} ${esc(uid)}" aria-describedby="${esc(hid)}${hasNote?' '+esc(nid):''}" aria-expanded="${active?'true':'false'}"${controls?` aria-controls="${esc(controls)}"`:''}`},o);
    const hl=hintLine('st-measure-hint',{id:hid,text:hint,tone:t,o});
    const nl=hasNote?`<p class="st-field-hint st-measure-note" id="${esc(nid)}" data-tone="muted">${tx(note,o,'note')}</p>`:'';
    return `<div class="st-measure ${esc(className)}" data-ds="Measure"${oneOf('Measure','layout',layout||'stack',['stack','row'],'stack')==='row'?' data-layout="row"':''} data-field="${esc(key)}"${v===''?' data-empty=""':''}${active?' data-active=""':''}${sys?' data-input="system"':''}${t?` data-tone="${t}"`:''}${isChanged?' data-changed=""':''}>${lab}${box}${hl}${nl}</div>`;
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
       awaiting muted · active progress · done green · late amber · overdue red · died red · aborted red
     `kind` picks a row of the map (tone, and the icon a chip carries); `tone` alone is the old word call and still works.
     variant: 'word' (a 4px dot and the word, inline) · 'chip' (a filled badge in a row). Text is always given: colour never carries a state alone. */
  const KINDS={awaiting:{tone:'muted',icon:''},active:{tone:'progress',icon:''},done:{tone:'green',icon:'check'},late:{tone:'amber',icon:'clock'},overdue:{tone:'red',icon:'alert'},died:{tone:'red',icon:''},aborted:{tone:'red',icon:''}};
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
    if(variant==='compact')return conditionTagCompact({name,level,care,careText,icon,id,className,strs,args});
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
  /* ConditionTag · compact: the tag a crowded row can carry several of, one line. Name only: no day and no care word (the level says it, the record has
     the day). level 'act' (red wash, bold, the "!" icon in place of a type icon) · 'watch' (outlined, ink) · 'ongoing' (plain muted, no box).
     The existing care levels map in: hospital and treat are act, monitor is watch; care other than attention is ongoing. Short names and the optional
     type icon (a glyph name, e.g. 'trend-down') are the caller's. careText is the care-level word for assistive tech. */
  const ALERT_DOT='<svg class="st-alert-dot" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7.25"/><rect x="7.1" y="3.6" width="1.8" height="5.6" rx=".9"/><circle cx="8" cy="11.6" r="1.05"/></svg>';
  const COMPACT_LEVEL={act:'act',watch:'watch',ongoing:'ongoing',hospital:'act',treat:'act',monitor:'watch'};
  const COMPACT_WORD={act:'Needs action',watch:'Monitor',ongoing:'No action needed'};
  function conditionTagCompact({name='',level='',care='ongoing',careText,icon='',id='',className='',strs,args}={}){
    const lv=COMPACT_LEVEL[level]||(care==='attention'?'watch':'ongoing');
    const o={strs,args},word=careText!=null?careText:COMPACT_WORD[lv];
    return `<span class="st-condition ${esc(className)}" data-ds="ConditionTag" data-variant="compact" data-level="${lv}"${id?` id="${esc(id)}"`:''}>${lv==='act'?ALERT_DOT:icon?glyph(icon):''}<span class="st-condition-name">${tx(name,o,'name')}</span>${word?`<span class="st-visually-hidden"> · ${tx(word,o,'careText')}</span>`:''}</span>`;
  }
  /* Row · animal: THE row for an animal in a list (Farrowing room, Find a sow, Scan results, task sows; Inspection's walk). Two lines.
     Left, always the same: the ID (code; 16px/600 mono, ink) over one 13px muted context line (description). contextWidth ('112px') fixes the left column,
     and the context then ends in an ellipsis; without it the left takes what the right leaves. Right, one of two, right-aligned:
       right:{kind:'state',figure,word,level}  the figure (16px) over the state word (13px). level 'act' (red; the word carries the one "!" icon) · 'live' (bold) ·
                                               'soon' (ink figure, muted word) · 'settled' (muted).
       right:{kind:'tags',tags:[{name,icon,level}]}  one line of compact ConditionTags, most urgent first (act, watch, ongoing; stable inside a level). Screens call
                                               rowFitTags(root) after render, fonts and resize: tags show in that order until the line is full, the rest fold into "+N", and the
                                               first (most urgent) tag never hides.
     Without right the row is the classic animal row (code column, chip, headline, meta), unchanged, until its list is migrated.
     The new layout has no chip under the ID, no headline beside it and no mono meta line. One chevron (the row's own). */
  const ANIMAL_STATE_LEVELS=['act','live','soon','settled'],TAG_RANK={act:0,watch:1,ongoing:2};
  function animalBody({code,description,right,contextWidth,tight,o}){
    const dList=Array.isArray(description),show=dList?description.length>0:(description||has(o,'description'));
    const ctx=show?`<span class="st-animal-context">${dList?toks(description,{tight,dot:true}):tx(description,o,'description')}</span>`:'';
    const left=`<span class="st-animal-left"><strong class="st-animal-id">${tx(code,o,'code')}</strong>${ctx}</span>`;
    let kind,rightHtml='';
    if(right&&right.kind==='tags'){
      kind='tags';
      const tags=(right.tags||[]).map((t,i)=>({t,i,r:TAG_RANK[COMPACT_LEVEL[t.level]]??2})).sort((a,b)=>a.r-b.r||a.i-b.i).map(x=>conditionTagCompact(x.t)).join('');
      rightHtml=tags?`<span class="st-animal-tags">${tags}<span class="st-animal-more" hidden></span></span>`:'';
    }else{
      kind='state';
      const r={strs:right.strs,args:right.args};
      const figure=right.figure?tx(right.figure,r,'figure'):'',word=tx(right.word||'',r,'word'),lv=oneOf('Row','right.level',right.level,ANIMAL_STATE_LEVELS,'settled');
      rightHtml=figure||word?`<span class="st-animal-state" data-level="${lv}">${figure?`<span class="st-animal-figure">${figure}</span>`:''}${word||lv==='act'?`<span class="st-animal-word">${lv==='act'?ALERT_DOT:''}${word}</span>`:''}</span>`:'';
    }
    const width=/^\d+(?:\.\d+)?(?:px|rem|em|%)$/.test(contextWidth||'')?` style="--st-animal-left:${contextWidth}"`:'';
    return {kind,html:`<span class="st-animal-body" data-kind="${kind}"${width}>${left}${rightHtml}</span>`};
  }
  /* Fit the tag line of every animal row under root (an element or the document): call it after the rows render, after fonts load and on resize. */
  function rowFitTags(rootEl){
    (rootEl||document).querySelectorAll('.st-animal-tags').forEach(area=>{
      const tags=[...area.querySelectorAll('.st-condition')],more=area.querySelector('.st-animal-more');
      if(!area.clientWidth)return;
      tags.forEach(t=>{t.hidden=false;t.classList.remove('st-shrink');});more.hidden=true;
      let shown=tags.length;
      while(shown>1&&area.scrollWidth>area.clientWidth+1){tags[--shown].hidden=true;more.hidden=false;more.textContent='+'+(tags.length-shown);}
      /* One tag left and still too wide: the urgent tag shortens its name with an ellipsis so the +N stays in view. */
      if(tags.length&&area.scrollWidth>area.clientWidth+1)tags[0].classList.add('st-shrink');
    });
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
  /* Banner: consequence, correction review or pending notice. Door is one button, never nested actions.
     One live region per banner: its summary when present, otherwise the live box. */
  const BANNER_ICON={danger:'alert',correction:'edit',notice:'note'};
  function banner({tone='danger',headline='',consequence='',summary=null,actions=[],live:isLive=false,id='',className='',strs,args,door=null,icon='',size='',state='',reason='',detail=''}={}){
    const o={strs,args},t=oneOf('Banner','tone',tone,['danger','correction','notice'],'danger'),bid=id||fieldId('st-banner');
    const slot=(v,key)=>v&&typeof v==='object'&&'html' in v?v.html:tx(v,o,key);
    const hasSum=summary!=null||has(o,'summary');
    const sumHtml=summary==null?tx('',o,'summary'):Array.isArray(summary)?toks(summary,{dot:true}):tx(summary,o,'summary');
    const actionHtml=typeof actions==='string'?actions:textActions(actions,'');
    const sum=hasSum?`<span class="st-banner-summary">${live('span',` class="st-banner-summary-text" id="${esc(bid)}-summary"`,sumHtml)}${door?'':actionHtml}</span>`:(!door&&actionHtml?`<div class="st-banner-actions">${actionHtml}</div>`:'');
    const body=`<span class="st-banner-body"><span class="st-banner-icon" aria-hidden="true">${glyph(icon||BANNER_ICON[t])}</span><span class="st-banner-copy"><strong class="st-banner-headline">${slot(headline,'headline')}</strong>${consequence?`<span class="st-banner-consequence">${slot(consequence,'consequence')}</span>`:''}${detail?`<span class="st-banner-consequence">${slot(detail,'detail')}</span>`:''}${reason?`<span class="st-banner-consequence">${esc(reason)}</span>`:''}</span>${door?(door.text?`<span class="st-banner-door">${esc(door.text)}${arrow}</span>`:(size==='card'?`<span class="st-banner-door" aria-hidden="true">${arrow}</span>`:'<span aria-hidden="true">›</span>')):''}</span>`;
    const attrs=` class="st-banner ${esc(className)}" data-ds="Banner" data-tone="${t}" data-size="${esc(size)}" data-state="${esc(state)}"${state==='Loading'?' aria-busy="true"':''} id="${esc(bid)}"`;
    if(door)return `<button type="button"${attrs} data-door data-action="${esc(door.action||'open')}" data-value="${esc(door.value||'')}"${door.label?` aria-label="${esc(door.label)}"`:''}${state==='Disabled'?' disabled':''}>${body}${sum}</button>`;
    return isLive&&!hasSum?live('div',attrs,body+sum):`<div${attrs} role="note">${body}${sum}</div>`;
  }
  /* Photos: the record's optional photo row, label and padded camera action on one >=48px row, the answer line
     under it, thumbnails beneath. Inactive until there is something to attach to; at max the camera grays the same way
     (floor-gray: aria-disabled, still tappable, data-reason says why, answered in the line). Thumbnails open the viewer.
     error: 'denied' (camera permission) · 'too-large' — answered amber; a cancelled capture says nothing. */
  const PHOTO_ERRORS={denied:{id:'ds.c2.photos.denied',en:'Camera not allowed · allow it in Settings, then try again'},'too-large':{id:'ds.c2.photos.too_large',en:'Photo too large to attach · take it again'}};
  function photos({label='Photos',optional='Optional',count=null,active=true,items=[],max=12,action='photo-add',viewAction='photo-view',key='photos',hint='',error='',id='',className='',strs,args,adding=false,disabledReason='',preview=''}={}){
    const o={strs,args},s=strs||{},a=args||{},pid=id||fieldId('st-photos'),hid=pid+'-hint';
    const err=oneOf('Photos','error',error,['denied','too-large','cancelled'],'');
    const ERR=PHOTO_ERRORS[err];
    const list=items||[],full=list.length>=max,reason=!active?'inactive':full?'full':'';
    const pending=list.filter(it=>it.pending).length;
    const value=count==null?(list.length?`${list.length} attached${pending?` · ${pending} waiting to upload`:''}`:''):Array.isArray(count)?count.map(x=>typeof x==='string'?x:x.text||'').join(' · '):typeof count==='object'?count.text:count;
    const blocked=disabledReason||(!active?'Record a death first · photos ride that record':full?`${max} photos at most`:'');
    let head=optionalRow({label,value,optionalWord:optional,icon:glyph('camera'),action,key,face:'row',className:'st-photos-head',attrs:{'aria-describedby':hid,...(reason||disabledReason||adding?{'aria-disabled':'true','data-reason':reason||'busy'}:{}),...(adding?{'aria-busy':'true'}:{}),...(preview?{'data-preview':preview}:{})}}).replace('<button type="button"','<button type="button" id="'+esc(pid)+'-camera"').replace('class="st-optional-row ', 'class="st-optional-row st-photos-camera ');
    head=head.replace(`<span class="st-optional-label">${esc(label)}</span>`,`<span class="st-optional-label"${sa(s.label,a.label)}>${esc(label)}</span>`).replace(`<small class="st-optional-word">${esc(optional)}</small>`,`<small class="st-optional-word"${sa(s.optional,a.optional)}>${esc(optional)}</small>`);
    const countParts=count==null?(list.length?tx(`${list.length} attached`,{strs:{attached:'ds.c2.photos.attached'},args:{attached:{n:list.length}}},'attached')+(pending?' · '+tx(`${pending} waiting to upload`,{strs:{waiting:'ds.c2.photos.waiting'},args:{waiting:{n:pending}}},'waiting'):''):''):Array.isArray(count)?toks(count,{dot:true}):part(count);
    head=head.replace(`<span class="st-optional-answer" role="status">${esc(value||'')}</span>`,`<span class="st-optional-answer" role="status">${countParts}</span>`);
    if(s.camera)head=head.replace(/ aria-label="[^"]*"/,ariaText('Take a photo',s.camera,a.camera));
    const thumb=(it,i)=>`<li><button type="button" class="st-photos-thumb" id="${esc(pid)}-thumb-${i+1}" data-action="${esc(viewAction)}" data-value="${esc(it.id!=null?it.id:i)}"${it.pending?' data-pending=""':''}${ariaText(it.alt||`Photo ${i+1}${it.pending?' · waiting to upload':''}`,it.pending?s.thumbPending:s.thumb,{n:i+1})}>${it.src?`<img src="${esc(it.src)}" alt="">`:''}</button></li>`;
    const thumbs=list.length?`<ul class="st-photos-items" aria-label="${esc(label)}">${list.map(thumb).join('')}</ul>`:'';
    // An error is answered with its own registered message (it wins over hint); a cancelled capture says nothing.
    const hl=ERR?hintLine('st-photos-hint',{id:hid,text:ERR.en,tone:'warn',o:{strs:{hint:ERR.id}}}):hintLine('st-photos-hint',{id:hid,text:err==='cancelled'?'':adding?'Adding photo…':hint||blocked,o});
    return `<div class="st-photos ${esc(className)}" data-ds="Photos" id="${esc(pid)}" data-field="${esc(key)}"${!active?' data-inactive=""':''}${full?' data-full=""':''}${err?` data-error="${err}"`:''}>${head}${hl}${thumbs}</div>`;
  }
  /* Button, as a factory. Registers (RULINGS, three button registers + the text action): primary (the one commit,
     ink) · secondary (an exit, outlined) · tool (a mid-sheet act, slim and outlined with its icon) · text (the quietest: a bare
     word, 13/700 ink-2, no container, ≥48px) · danger. waiting: the waiting face — present, quiet,
     focusable (aria-disabled, never disabled); guard() answers its tap. busy: sent, until the host settles. */
  const REGISTER={primary:'button primary',secondary:'button secondary',tool:'button tool',danger:'button danger',caution:'button caution'};
  /* chevron (text register): the button spans the content width and ends in the row chevron, for a quiet line that opens a list ("1 closed today ›"). */
  function button({align='',label='',register='secondary',action='',value='',waiting=false,disabled=false,busy=false,icon='',reason='',describedby='',labelledby='',id='',attrs={},className='',chevron=false,strs,args}={}){
    const o={strs,args},r=oneOf('Button','register',register,['primary','secondary','tool','text','danger','caution'],'secondary');
    /* align (text register only): 'start' sets the word on the content edge (a Delete under a form's fields); 'end' ends it on the
       right edge (a short word over a list). Default: centred in its 48px target. */
    const cls=r==='text'?'st-text-action'+(align==='start'?' st-text-action--start':align==='end'?' st-text-action--end':''):REGISTER[r];
    const rid=reason?(describedby||fieldId('st-button-reason')):describedby;
    return `<button type="button" class="${cls}${className?' '+esc(className):''}" data-ds="Button" data-register="${r}"${chevron&&r==='text'?' data-chevron=""':''}${id?` id="${esc(id)}"`:''} data-action="${esc(action)}" data-value="${esc(value)}"${waiting||busy?' aria-disabled="true"':''}${disabled?' disabled':''}${busy?' aria-busy="true" data-busy=""':''}${rid?` aria-describedby="${esc(rid)}"`:''}${labelledby?` aria-labelledby="${esc(labelledby)}"`:''}${r==='tool'&&typeof label==='string'&&label&&!strs?` title="${esc(label)}"`:''}${safeAttr(attrs)}>${icon?`<span aria-hidden="true">${icon}</span>`:''}<span class="st-button-label">${tx(label,o,'label')}</span>${chevron&&r==='text'?`<span class="st-button-chevron" aria-hidden="true">${glyph('chevron')}</span>`:''}${busy?'<span class="st-button-busy" aria-hidden="true">…</span>':''}</button>${reason?buttonReason({id:rid,text:reason}):''}`;
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
  function choiceRadios({label='',optional='',options=[],selected='',action='choose',key='',layout='rows',face='',lead='',clear='Clear',id='',className='',disabled=false,reason='',pressed=false,labelHidden=false,strs,args}={}){
    const o={strs,args},s=strs||{},a=args||{},rid=id||fieldId('st-radios');
    const lay=oneOf('ChoiceList','layout',layout,['rows','plain','inline'],'rows');
    /* face (inline only, opt-in): 'key' draws each option as a boxed key in the Stepper's 136px column instead of a ring and a word. */
    const keyFace=oneOf('ChoiceList','face',face||'default',['default','key'],'default')==='key'&&lay==='inline';
    options.forEach(x=>{if(x.mono&&!MONO_OK.test(String(x.label||'')))warn('ChoiceList',`mono is for Latin and digit codes only: "${x.label}"`);});
    const chosen=options.some(x=>x.value===selected),stop=chosen?selected:(options[0]&&options[0].value);
    const isOptional=!!(optional||has(o,'optional'));
    const clearBtn=isOptional&&chosen?button({label:clear,register:'text',action:action+'-clear',value:key,id:rid+'-clear',strs:s.clear?{label:s.clear}:undefined}):'';
    if(lay==='rows'||lay==='plain'){
      const rows=options.map(x=>choiceRow({mode:'radio',label:x.label,meta:x.meta||'',value:x.value,action,selected:x.value===selected,mono:!!x.mono,disabled,reason,pressed,tabindex:x.value===stop?0:-1,attrs:{'data-field':key},strs:x.strs,args:x.args}));
      return choiceGroup(rows,{title:label,lead,radio:true,aside:clearBtn,id:rid,className:(lay==='plain'?'st-choice-plain ':'')+className,strs:s.label?{title:s.label}:undefined,args:a.label?{title:a.label}:undefined});
    }
    const lid=rid+'-label';
    const opt=x=>`<button type="button" class="st-choice-inline-opt"${disabled?' aria-disabled="true"':''}${pressed&&x===options[0]?' data-preview="pressed"':''} role="radio" aria-checked="${x.value===selected?'true':'false'}" tabindex="${x.value===stop?0:-1}" data-action="${esc(action)}" data-value="${esc(x.value)}">${keyFace?'<span class="st-choice-inline-face">':'<span class="st-radio" aria-hidden="true"></span>'}<span${x.mono?' data-mono=""':''}>${tx(x.label,x,'label')}</span>${keyFace?'</span>':''}</button>`;
    return `<div class="st-choice-inline ${esc(className)}" data-ds="ChoiceList" data-mode="radio"${keyFace?' data-face="key"':''} id="${esc(rid)}" data-field="${esc(key)}"><span class="st-choice-inline-label"><span id="${esc(lid)}"${labelHidden?' class="st-visually-hidden"':''}><span${sa(s.label,a.label)}>${esc(label)}</span>${isOptional?`<small>${tx(optional,o,'optional')}</small>`:''}</span>${isOptional?`<span class="st-choice-inline-clear">${clearBtn}</span>`:''}</span><span class="st-choice-inline-opts" role="radiogroup" aria-labelledby="${esc(lid)}">${options.map(opt).join('')}</span>${reason?`<span class="st-choice-meta" role="status">${esc(reason)}</span>`:''}</div>`;
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
  function optionalRow({label='',value='',icon='',editIcon='',action='',key='',inline='',open=false,optionalWord='Optional',editLabel='Edit',disabled=false,className='',face='',attrs={}}={}){
    const filled=value!=null&&String(value).trim()!=='',glyph=filled?(editIcon||icon):icon,extra=Object.entries(attrs).filter(([k])=>/^(?:data|aria)-[a-z0-9-]+$/.test(k)).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
    const copy=`<span class="st-optional-copy"><span class="st-optional-head"><span class="st-optional-label">${esc(label)}</span><small class="st-optional-word">${esc(optionalWord)}</small></span><span class="st-optional-answer" role="status">${filled&&!(inline&&open)?esc(value):''}</span></span><span class="st-optional-act" aria-hidden="true">${glyph}</span>`;
    const aria=` aria-label="${esc(filled?`${editLabel} ${label.toLowerCase()}, ${value}`:`${label}, ${optionalWord.toLowerCase()}`)}"`;
    if(!inline)return `<button type="button" data-ds="OptionalRow" class="st-optional-row ${esc(className)}" data-filled="${filled}"${face==='row'?' data-face="row"':''} data-action="${esc(action)}" data-value="${esc(key)}"${disabled?' disabled':''}${aria}${extra}>${copy}</button>`;
    return `<div data-ds="OptionalRow" class="st-optional ${esc(className)}" data-open="${open}" data-filled="${filled}"><button type="button" class="st-optional-row" data-filled="${filled}"${face==='row'?' data-face="row"':''} data-st-optional aria-expanded="${open}"${aria}${extra}>${copy}</button><div class="st-optional-body"${open?'':' hidden'}>${inline}</div></div>`;
  }
  if(typeof document!=='undefined'){
    document.addEventListener('click',e=>{const control=e.target.closest('.st-picker-trigger[aria-disabled="true"],.st-choice-row[aria-disabled="true"],.st-choice-inline-opt[aria-disabled="true"]');if(control){e.preventDefault();e.stopImmediatePropagation();}},true);
    const sync=box=>{const field=box.querySelector('.st-optional-body :is(input,textarea)'),v=field?field.value.trim():'',row=box.querySelector('.st-optional-row'),open=box.dataset.open==='true';
      box.dataset.filled=row.dataset.filled=String(!!v);box.querySelector('.st-optional-answer').textContent=open?'':v;};
    document.addEventListener('click',e=>{const row=e.target.closest('[data-st-optional]');if(!row)return;const box=row.closest('.st-optional'),open=box.dataset.open!=='true';
      box.dataset.open=String(open);row.setAttribute('aria-expanded',String(open));box.querySelector('.st-optional-body').hidden=!open;sync(box);if(open)box.querySelector('.st-optional-body :is(input,textarea,select)')?.focus();},true);
  }

  /* Sheet: the one surface presented over a task. variant 'drawer' (default; content-sized, a grab strip, the sheet header:
     centred title, optional `line`, hairline) | 'page' (a full sub-page: the page header, Back top left via `back`, no Back in
     the footer) | 'dialog' (one small decision, its `description` line). Returns the surface's HTML:
     a drawer is its scrim + the sheet, a page the sheet, a dialog its backdrop + the dialog. Footers come from
     sheetFooter(); the Back control from backButton(). Text slots take a string, { text, str, args } (with `str` the text
     is wrapped for the screen shell's string registry) or { html } (trusted markup, e.g. a title that is a link). */
  const sObj=v=>(v&&typeof v==='object'&&!Array.isArray(v))?v:{text:v};
  const sArgs=a=>a&&Object.keys(a).length?` data-args="${esc(JSON.stringify(a))}"`:'';
  function sT(v){if(v==null||v==='')return '';const o=sObj(v);if(o.html!=null)return String(o.html);return o.str?`<span data-str="${esc(o.str)}"${sArgs(o.args)}>${esc(o.text??'')}</span>`:esc(o.text);}
  function sL(v,fallback){const o=sObj(v==null||v===''?fallback:v);if(o.text==null&&!o.str)return '';return ` aria-label="${esc(o.text??'')}"`+(o.str?` data-str-attr="aria-label:${esc(o.str)}"${sArgs(o.args)}`:'');}
  const sA=(action,value)=>action?` data-action="${esc(action)}" data-value="${esc(value??'')}"`:'';
  const sGlyph=k=>root.SentriIcons.icon(k);
  /* A line of parts, each a text slot with an optional tone: [{ text, str, args, tone }]; { sep: true } is the shared separator. */
  const sParts=v=>Array.isArray(v)?v.map(p=>{const o=sObj(p);if(o.sep)return SEP;if(o.strong)return `<strong>${sT(o)}</strong>`;return o.tone?`<span class="st-part" data-tone="${esc(o.tone)}">${sT(o)}</span>`:sT(o);}).join(''):sT(v);
  /* The header line (Headers law, owner 2026-10-13): the one optional quiet line under a header's title, absent by default.
     line { chip: { id, action, value, label }, facts: [slot, slot] } is a route: the subject chip (tag icon, #ID, ›; the only
     tappable part, opening the animal), then up to two muted identity facts the task's budget.md names. line { text } is one
     fact (a text slot or parts; { text, strong: true } is the figure in ink, `Last record **08:41** · G.H`). The component
     never fills a fact in; it draws what the host passes, on one line. */
  function headerLine(line){
    if(!line)return '';
    if(line.chip){
      const c=line.chip,id=sObj(c.id),facts=(line.facts||[]).filter(f=>f!=null&&f!=='').slice(0,2);
      const chip=`<button type="button" class="st-subject-chip"${sA(c.action||'open-subject',c.value??id.text)}${sL(c.label,{text:'Open '+(id.text??'')})}>${sGlyph('tag')}<span class="st-subject-chip-id">#${sT(id)}</span>${sGlyph('chevron')}</button>`;
      return `<p class="st-header-line" data-line="route">${chip}${facts.length?`<span class="st-header-facts">${facts.map(sParts).join(SEP)}</span>`:''}</p>`;
    }
    /* key: the colour key of a body that is colour-coded (the pen map): swatch, count, label. Plain text, never tappable (owner, 2026-10-14). */
    if(line.key){
      const items=line.key.filter(k=>k&&k.count!=null&&k.label);
      return items.length?`<p class="st-header-line" data-line="key">${items.map(k=>`<span><i aria-hidden="true" style="background:var(${/^--[\w-]+$/.test(k.fill||'')?k.fill:'--line'})"></i><b>${esc(k.count)}</b> ${esc(k.label)}</span>`).join('')}</p>`:'';
    }
    const t=line.text??line;
    return t==null||t===''?'':`<p class="st-header-line" data-line="fact">${sParts(t)}</p>`;
  }
  /* The page header: Back (48px, the bordered icon button) at the top left, the title left-aligned, the optional header line
     under it, then space-section (24px) to the body. Every page and every top page of a task has it; its footer has no Back.
     ds names the part for the atlas (Sheet for a sheet page, Header for a task screen). */
  function pageHeader({title,back={action:'back'},line=null,level=2,ds='Sheet',className='',action=null}={}){
    const b=back||{action:'back'},h=level===1?'h1':'h2';
    const backHtml=`<button type="button" class="st-page-back"${sA(b.action||'back',b.value)}${sL(b.label,{text:'Back',str:'act.back'})}>${sGlyph('back-chevron')}</button>`;
    /* The page action (Headers law, owner 2026-10-20): one IconButton at the top right, centred on the text block by the header's own
       alignment; an object is passed to iconButton, a string is trusted markup of one. */
    const actHtml=!action?'':typeof action==='string'?action:iconButton(Object.assign({variant:'bordered'},action));
    return `<header class="st-page-header${className?' '+esc(className):''}" data-ds="${esc(ds)}">${backHtml}<div class="st-page-titles"><${h} class="st-page-title">${sT(title)}</${h}>${headerLine(line)}</div>${actHtml}</header>`;
  }
  /* Back: the footer's exit, the same on every sheet (a 16px chevron + the word). Alone in a footer it fills the bar. */
  function backButton({action='back',value='',label={text:'Back',str:'act.back'},className=''}={}){
    return button({register:'secondary',action,value,label:'',className:'surface-back'+(className?' '+className:'')}).replace('<span class="st-button-label"></span>',sGlyph('back-chevron')+'<span>'+sT(label)+'</span>');
  }
  /* A Button from a { label, action, value, register, waiting, describedby } spec (a string is already HTML). */
  function sButton(b){
    if(!b)return '';if(typeof b==='string')return b;
    const l=sObj(b.label),props={label:l.text??'',register:b.register||'primary',action:b.action||'',value:b.value||'',waiting:!!b.waiting,busy:!!b.busy,describedby:b.describedby||'',className:b.className||'',attrs:b.attrs||{}};
    if(l.str){props.strs={label:l.str};if(l.args)props.args={label:l.args};}
    return button(props);
  }
  function sHold(h){
    const l=sObj(h.label),c=sObj(h.caption),props={label:l.text??'',caption:c.text??'',action:h.action||'hold',value:h.value||'',tone:h.tone||'primary',phase:h.phase||'idle',statusId:h.statusId||'',waiting:!!h.waiting,describedby:h.describedby||''},strs={},args={};
    if(l.str){strs.label=l.str;if(l.args)args.label=l.args;}if(c.str){strs.caption=c.str;if(c.args)args.caption=c.args;}
    props.strs=strs;props.args=args;return holdButton(props);
  }
  /* The footer: at most two controls, the primary on the right: Back + a Button spec / a hold / HTML. Alone, Back fills the bar.
     status { text, str, args, id, tone, visible, action }: a line above the bar for a hold's progress (its statusId) or a text
     action. It is drawn only when `visible` is set or it carries an action; a waiting button gives no reason line: it stands alone. `content` is trusted
     footer markup in place of back/primary/hold (a host's own two controls); className adds a page hook. */
  function sheetFooter({back:b={},primary,hold:h,status:st,content='',className=''}={}){
    let line='';
    if(!st&&primary&&typeof primary==='object'&&primary.reason){st=sObj(primary.reason);primary=Object.assign({},primary,{reason:''});}
    if(st){
      const id=st.id||fieldId('st-sheet-status'),waiting=!!((primary&&typeof primary==='object'&&primary.waiting)||(h&&h.waiting));
      /* The footer reason line is gone: a waiting primary stands alone. Its reason stays for the screen reader only (still
         the primary's aria-describedby). A line that carries its own action is not a reason and is still drawn. */
      const vis=!!st.action||(!!st.visible&&!waiting),tone=st.tone?` data-tone="${esc(st.tone)}"`:'';
      const act=vis&&st.action?sButton(Object.assign({register:'text'},st.action)):'';
      if(!vis)line=`<p class="sheet-status st-visually-hidden" id="${esc(id)}" role="status" aria-live="polite"${tone}>${sT(st)}</p>`;
      else line=act?`<div class="sheet-status" data-action-slot><p id="${esc(id)}" role="status" aria-live="polite"${tone}>${sT(st)}</p>${act}</div>`:`<p class="sheet-status" id="${esc(id)}" role="status" aria-live="polite"${tone}>${sT(st)}</p>`;
      if(h&&!h.statusId)h=Object.assign({},h,{statusId:id});
      if(primary&&typeof primary==='object'&&!primary.describedby)primary=Object.assign({},primary,{describedby:id});
    }
    if(content){content=content.replace(/<p class="st-field-hint st-button-reason[^]*?<\/p>/g,reason=>{line+=/<button/.test(reason)?reason.replace('<p class="','<p data-action-slot class="'):reason.replace('st-button-reason','st-button-reason st-visually-hidden');return '';});}
    /* Reset and Clear are not footer controls: they are the sheet header's corner action (sheet({ corner })). The footer's
       old `quiet` option is retired (owner, 2026-10-14) and ignored. */
    const inner=content||`${b?backButton(b):''}${h?sHold(h):sButton(primary)}`;
    /* A hidden reason lives inside the footer (after the two targets), so nothing above the bar is drawn or measured. */
    const quiet=line&&!/class="sheet-status"|data-action-slot/.test(line);
    return `${quiet?'':line}<div class="sheet-footer${className?' '+esc(className):''}" data-ds="Sheet">${inner}${quiet?line:''}</div>`;
  }
  /* The overlay layer model: z = base + 10 × layer (scrim 2, drawer 3, page 5, dialog 8). An overlay placed after a sheet in the
     phone rises a layer by itself (CSS); `layer: n` sets it. A drawer is never opened over a drawer (replace its content
     instead) — a page, then a drawer or dialog over it, is the deepest stack. */
  const sLayer=n=>n?` data-layer="${esc(n)}"`:'';
  function scrim({action='dismiss',value='',label={text:'Dismiss sheet',str:'tk.sheet.dismiss'},layer=0}={}){
    return `<button type="button" class="scrim" data-ds="Sheet"${sLayer(layer)}${sA(action,value)}${sL(label)}></button>`;
  }
  /* The sheet header's text block: the centred title on one line, then the optional header line. Corner actions (owner,
     2026-10-14, ruling C): corner { label, action, value } is Clear or Reset, quiet text at the top right, passed only while
     there is something to clear or reset; cross { action, value, label } is a ✕ at the top left, used by a drawer with levels
     (owner ruling B, 2026-10-16: it closes the whole drawer from any level; pickerHead().cross). Each is a 48px target vertically centred on this block (title + line), never on
     the title alone or the header box; the title keeps 12px clear of each target. Without corners the block is as before. */
  function sheetText(title,line,corner,cross){
    const t=`<h2 class="sheet-title">${sT(title)}</h2>${headerLine(line)}`;
    if(!corner&&!cross)return t;
    const x=cross?`<button type="button" class="st-sheet-corner" data-corner="start" data-ds="Sheet"${sA(cross.action||'dismiss',cross.value)}${sL(cross.label,{text:'Close',str:'act.close'})}>${sGlyph('close')}</button>`:'';
    const c=corner?sButton(Object.assign({register:'text'},corner,{className:'st-sheet-corner'+(corner.className?' '+corner.className:''),attrs:Object.assign({'data-corner':'end'},corner.attrs||{})})):'';
    return `<div class="sheet-text" data-corners="${cross&&corner?'both':corner?'end':'start'}">${x}${t}${c}</div>`;
  }
  const SHEET_SIZES=['compact','short','medium','long'];
  function sheet({variant='drawer',surface='',headClass='',title,line=null,pageAction=null,corner=null,cross=null,back=null,description,icon='',close={action:'dismiss'},holdRows=0,lead='',above='',body='',bodyClass='',footer:f,size='medium',sizing='content',label,view='',className='',id='',layer=0,inert=false,bar='',scrim:sc={},attrs={}}={}){
    const v=oneOf('Sheet','variant',variant,['drawer','page','dialog'],'drawer'),sz=oneOf('Sheet','size',size,SHEET_SIZES,'medium');
    /* surface (drawer only): '' is a content or input drawer (white, tinted cards). 'menu' is a drawer whose every row is an option or a verb
       (Choose a unit, More actions, Go to pen): the tint with white cards, like a page. See SURFACES.md. */
    const ctx=oneOf('Sheet','surface',surface||'drawer',['drawer','menu'],'drawer');
    const foot=f===false?'':(f==null?sheetFooter({}):f),ex=safeAttr(attrs),cls=className?' '+esc(className):'',vw=view?` data-view="${esc(view)}"`:'';
    if(v==='dialog'){
      return `<div class="dialog-backdrop" data-ds="Sheet" data-variant="dialog"${sLayer(layer)}><div class="dialog${cls}" role="dialog" aria-modal="true" tabindex="-1"${id?` id="${esc(id)}"`:''}${vw}${inert?' inert':''}${sL(label??title)}${ex}><div class="dialog-body${bodyClass?' '+esc(bodyClass):''}"><h2 class="dialog-title">${icon?sGlyph(icon):''}${sT(title)}</h2>${description?`<p class="dialog-desc">${sParts(description)}</p>`:''}${body}</div>${foot}</div></div>`;
    }
    /* Back in the footer is the way out, and the scrim and a swipe down do what Back does. `close` is kept for old callers and
       ignored. A drawer with levels (owner ruling B, 2026-10-16) adds `cross`, the ✕ at the top left that closes the whole
       drawer from any level; its footer Back goes up one level (pickerHead). There is no "‹ Parent" control. */
    /* The sheet header (a drawer): the centred title, the optional header line, the 1px hairline; the body starts 24px below.
       A page takes the page header instead (pageHeader: Back top left, the title left-aligned). */
    const head=v==='page'
      ?pageHeader({title,back,line,className:headClass,action:pageAction})
      :`<header class="utility-header${headClass?' '+esc(headClass):''}">${lead}<div class="sheet-titles">${sheetText(title,line,corner,cross)}</div></header>`;
    const common=`data-ds="Sheet" tabindex="-1"${sLayer(layer)}${inert?' inert':''}${id?` id="${esc(id)}"`:''}${vw}${sL(label??title)}${ex}`;
    const main=`${head}${above}<div class="sheet-body${bodyClass?' '+esc(bodyClass):''}">${body}</div>${foot}`;
    if(v==='page')return `<section class="sheet${cls}" ${common} role="region" data-st-context="page" data-presentation="page">${bar}${main}</section>`;
    const scrimHtml=sc===false?'':scrim(Object.assign({layer},sc));
    return `${scrimHtml}<section class="sheet${cls}" ${common} role="dialog" aria-modal="true" data-st-context="${ctx}" data-size="${sz}"${sizing==='full'?' data-sizing="full"':sizing==='hold'?` data-sizing="hold" style="--hold-rows:${Math.max(1,Number(holdRows)||1)}"`:' data-sizing="content"'}><div class="grab" aria-hidden="true"></div>${main}</section>`;
  }
  /* Keyboard lift (owner, 2026-10-20): the on-screen keyboard never covers a sheet's footer. While a text field inside a sheet
     (drawer or page) has focus, the visible viewport (visualViewport) has shrunk for the keyboard and ends above the sheet's bottom, the sheet's bottom is raised
     to the keyboard's top (data-keyboard, --st-keyboard-lift) and its height is capped to what stays visible, so the footer with
     Save, Done or Send sits just above the keys and the focused field scrolls into the body's view. Behaviour only: without a
     keyboard nothing moves. keyboardLift is the measure: how far the sheet's resting bottom sits under the visible bottom.
     A host screen that is not a Sheet but ends in its own footer or dock (a composer, a list with fields) marks its root
     data-st-keyboard-host: it takes the lift as bottom padding, so its list shrinks and its footer rides above the keys the same way. */
  function keyboardLift(sheetBottom,lift,viewBottom){return Math.max(0,Math.round((sheetBottom||0)+(lift||0)-(viewBottom||0)));}
  if(typeof document!=='undefined'&&typeof window!=='undefined'){
    const typed=el=>!!el&&!!el.matches&&el.matches('textarea,[contenteditable="true"],input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([type="color"])');
    let lifted=null;
    // The keyboard is the visible viewport shrinking: its full height is taken while no text field has focus, and a sheet lifts only
    // when the view has lost at least a keyboard's worth (KEYBOARD_MIN). A sheet merely below the fold (a phone lower on a study page) never moves.
    // The full height only ever rises (a field left while the keyboard is still closing must not lower it); a change of width (a rotation)
    // takes it afresh.
    const KEYBOARD_MIN=120,view=()=>window.visualViewport?window.visualViewport.height:window.innerHeight;let full=view(),wide=window.innerWidth;
    // Where the surface rests, ignoring transforms: a drawer still rising (drawer-enter, sheet-in) or a page sliding in is measured where it will stop.
    const rest=x=>{const p=x.offsetParent;return (p?p.getBoundingClientRect().top+p.clientTop:0)+x.offsetTop+x.offsetHeight;};
    const drop=()=>{if(!lifted)return;lifted.removeAttribute('data-keyboard');lifted.style.removeProperty('--st-keyboard-lift');lifted=null;};
    const fit=()=>{
      const vv=window.visualViewport,el=document.activeElement,sheet=typed(el)?el.closest('.sheet,[data-st-keyboard-host]'):null;
      if(lifted&&(lifted!==sheet||!lifted.isConnected))drop();
      if(window.innerWidth!==wide){wide=window.innerWidth;full=view();}
      if(!typed(el))full=Math.max(full,view());
      if(!sheet||!vv)return;
      const was=parseFloat(sheet.style.getPropertyValue('--st-keyboard-lift'))||0;
      const lift=full-vv.height<KEYBOARD_MIN?0:keyboardLift(rest(sheet),sheet.classList.contains('sheet')?was:0,vv.offsetTop+vv.height); // a sheet moves up by its lift; a host's box stays and only its padding grows
      if(!lift){if(was){lifted=sheet;drop();}return;}
      if(lift!==was)sheet.style.setProperty('--st-keyboard-lift',lift+'px');
      sheet.setAttribute('data-keyboard','');lifted=sheet;
      // The field scrolls into view in its own scroller: the sheet's body, or a host's list.
      let body=el.closest('.sheet-body');
      for(let n=el.parentElement;!body&&n&&n!==sheet;n=n.parentElement){const o=getComputedStyle(n).overflowY;if(o==='auto'||o==='scroll')body=n;}
      if(body){const f=el.getBoundingClientRect(),b=body.getBoundingClientRect();if(f.bottom>b.bottom)body.scrollTop+=f.bottom-b.bottom;else if(f.top<b.top)body.scrollTop-=b.top-f.top;}
    };
    const soon=()=>requestAnimationFrame(fit);
    document.addEventListener('focusin',soon);document.addEventListener('focusout',soon);document.addEventListener('input',soon);
    if(window.visualViewport){window.visualViewport.addEventListener('resize',fit);window.visualViewport.addEventListener('scroll',fit);}
    window.addEventListener('resize',fit);
  }
  if(typeof document!=='undefined')document.addEventListener('keydown',e=>{
    const b=e.target.closest?.('.st-segment button,.st-filter-chips button');if(!b||b.disabled)return;
    const host=b.closest('.spec,.tk-phone,.phone')||document;
    const row=b.parentElement, buttons=Array.from(row.querySelectorAll('button')).filter(x=>!x.disabled);
    const next=radioNext(buttons.map(x=>x.dataset.value),b.dataset.value,e.key);if(next==null)return;
    e.preventDefault();e.stopImmediatePropagation();const target=buttons.find(x=>x.dataset.value===next);target.click();
    const fresh=Array.from(host.querySelectorAll('[data-ds="Segment"] button,[data-ds="FilterChips"] button')).find(x=>x.dataset.action===b.dataset.action&&x.dataset.value===next);fresh?.focus();fresh?.scrollIntoView({block:'nearest',inline:'nearest'});
  },true);
  /* RangeSlider: two round handles on one track, for a from-to range of whole steps (a due range, a weight band).
     rangeSlider({ min, max, step, value:[from,to], title, icon, key, names:['from','to'], labels:[first handle, second handle],
     format(n) → the word for one value (also each handle's aria-valuetext), summary(from,to) → the line under the title,
     ends:[left, middle, right] }). The track is two native range inputs, so the keyboard and screen readers come free; the whole
     48px rail takes the touch (the nearest handle moves), so a glove never has to hit the 32px handle. A change moves the fill,
     the value line and the aria text, then fires `sentri-range-change` { key, values:{from,to} } for the host to read. */
  const rangeFormats=new Map(),rangeClamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const rangeLine=(f,a,b)=>f.summary?f.summary(a,b):(a===b?f.format(a):f.format(a)+' – '+f.format(b));
  const rangeVars=(a,b,min,max)=>`--from:${(a-min)/(max-min)*100}%;--to:${(b-min)/(max-min)*100}%`;
  function rangeSlider({min=0,max=10,step=1,value=[min,max],title='',icon='',key='range',names=['from','to'],labels=['Lowest','Highest'],format=String,summary=null,ends=[],className=''}={}){
    if(!(max>min&&step>0))throw new RangeError('RangeSlider requires max > min and step > 0');
    const v=value.map(x=>rangeClamp(min+Math.round((Number(x)-min)/step)*step,min,max)).sort((a,b)=>a-b),f={format,summary};
    rangeFormats.set(key,f);
    return `<div class="st-range${className?' '+esc(className):''}" data-ds="RangeSlider" data-key="${esc(key)}" data-names="${esc(names.join(','))}"><div class="st-range-head">${title?heading({title,icon,kind:'section',level:4,className:'st-range-title'}):''}<output class="st-range-value">${esc(rangeLine(f,v[0],v[1]))}</output></div><div class="st-range-rail" style="${rangeVars(v[0],v[1],min,max)}"><div class="st-range-track"></div>${v.map((x,i)=>`<input type="range" min="${min}" max="${max}" step="${step}" value="${x}" data-range="${esc(names[i])}" aria-label="${esc(labels[i])}" aria-valuetext="${esc(format(x))}">`).join('')}</div>${ends.length?`<div class="st-range-ends">${ends.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:''}</div>`;
  }
  function rangeSet(root,input,n){
    const ins=[...root.querySelectorAll('input[type="range"]')],i=ins.indexOf(input),min=+input.min,max=+input.max,step=+input.step,f=rangeFormats.get(root.dataset.key)||{format:String};
    n=rangeClamp(min+Math.round((n-min)/step)*step,min,max);input.value=n;
    if(i===0&&n>+ins[1].value)ins[1].value=n;if(i===1&&n<+ins[0].value)ins[0].value=n;
    const a=+ins[0].value,b=+ins[1].value;
    root.querySelector('.st-range-rail').style.cssText=rangeVars(a,b,min,max);
    ins.forEach(x=>x.setAttribute('aria-valuetext',f.format(+x.value)));
    root.querySelector('.st-range-value').textContent=rangeLine(f,a,b);
    const names=root.dataset.names.split(',');
    root.dispatchEvent(new CustomEvent('sentri-range-change',{bubbles:true,detail:{key:root.dataset.key,values:{[names[0]]:a,[names[1]]:b}}}));
  }
  /* FilterSheet: the drawer that narrows a list. It is a Sheet whose header carries Reset (quiet text, the top-right corner
     action), and whose footer holds Back (keeps the draft) and the one commit, whose label carries the live count ("Show 4 sows"; the host rewrites it as the draft changes).
     filterSheet({ title, sections:[{ title, icon, content, help }] | body, apply:{label, action}, reset:{label, action} | false,
     backAction, closeAction, className, size }). A section is a titled group; sections come as the host's own controls
     (a rangeSlider, a segment) so the sheet owns only the frame, the spacing and the exits. Without `sections`, `body` is used as is. */
  function filterSheet({title='Filter',sections=[],body='',apply={},reset={},backAction='filter-back',backLabel='Back',closeAction='',className='',size='medium',label}={}){
    const exit=closeAction||backAction,list=sections.map(x=>`<section class="st-filter-section">${x.title?heading({title:x.title,icon:x.icon||'',kind:'section',level:4,className:'st-filter-title'}):''}${x.content||''}${x.help?`<p class="st-filter-help">${esc(x.help)}</p>`:''}</section>`).join('');
    /* Reset is the header's corner action, top right (Headers law, owner 2026-10-14); the host passes reset:false while the
       draft is at its defaults, so Reset shows only when there is something to reset. */
    const corner=reset===false?null:{label:reset.label||'Reset',action:reset.action||'filter-reset'};
    return sheet({title,corner,size,label:label||title,className:'st-filter-sheet'+(className?' '+esc(className):''),body:list||body,footer:sheetFooter({content:backButton({action:backAction,label:backLabel})+button({label:apply.label||'Show',register:'primary',action:apply.action||'filter-apply'})}),close:{action:exit,label:'Close '+title},scrim:{action:exit,label:'Dismiss '+title}});
  }
  if(typeof document!=='undefined'){
    let drag=null;
    const rangeValue=(rail,e)=>{const r=rail.getBoundingClientRect(),a=rail.querySelector('input');return +a.min+rangeClamp((e.clientX-r.left)/r.width,0,1)*(+a.max-+a.min);};
    document.addEventListener('input',e=>{const i=e.target.closest?.('.st-range input[type="range"]');if(i)rangeSet(i.closest('.st-range'),i,+i.value);});
    document.addEventListener('pointerdown',e=>{
      const rail=e.target.closest?.('.st-range-rail');if(!rail||e.button!==0)return;
      e.preventDefault();const ins=[...rail.querySelectorAll('input')],n=rangeValue(rail,e),lo=+ins[0].value,hi=+ins[1].value;
      const input=Math.abs(n-lo)<Math.abs(n-hi)||lo===hi&&n<=lo?ins[0]:ins[1];
      drag={rail,input};rail.setPointerCapture(e.pointerId);input.focus({preventScroll:true});rangeSet(rail.closest('.st-range'),input,n);
    });
    document.addEventListener('pointermove',e=>{if(drag)rangeSet(drag.rail.closest('.st-range'),drag.input,rangeValue(drag.rail,e));});
    const end=()=>{drag=null;};
    document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);if(typeof globalThis.addEventListener==='function')globalThis.addEventListener('blur',end);
  }
  /* PenMap: the room as a map of pens, so a worker finds the pen in front of her by where it is. Letters are always the
     columns and numbers always the rows, so the map uses the phone's height; it is drawn as seen from the door (the
     Entrance band): pen 1 is nearest it, at the top. A tile is a button that goes to its pen and says nothing but the pen
     code; its colour is its status. When the lanes do not fit at 56px the map scrolls sideways; the tiles never shrink.
     penMap({ lanes, depth, pens:{ B3:'act'|'live'|'plain'|'hidden' }, current, action, key, rangeSize, entrance,
     labels, peek }): the Entrance band and the map. A pen missing from `pens` is empty; 'hidden' is a pen with
     sows the current list does not show. Empty and hidden tiles are disabled. The colour key is the sheet's header line: penMapKey({ pens, words }) gives its items, the count of pens at each
     coloured level, and a level with none is left out. `peek(code)` returns the HTML of the hold-to-peek card for a pen (see penPeek).
     penMapFooter({ back, depth, rangeSize, label }): Back, and beside it the range control when a row has more than
     rangeSize pens. The map opens scrolled so its current pen is in view; the range control follows the map's scroll. */
  const PEN_LEVELS=['act','live','plain','hidden'],PEN_HOLD_MS=350,PEN_SLOP=12,PEN_GAP=8,penPeeks=new Map();
  let penHold=null,penSwallow=false;
  const penLabels=o=>Object.assign({map:'Pens',act:'needs you',live:'farrowing',plain:'has sows',empty:'empty',hidden:'no sows match',pen:c=>'Pen '+c},o);
  function penMap({lanes=['A','B','C','D'],depth=6,pens={},current='',action='pen',key='pen-map',rangeSize=20,entrance='Entrance',labels={},peek=null,className=''}={}){
    const L=penLabels(labels),rows=Array.from({length:Math.max(1,depth|0)},(_,i)=>i+1);
    if(typeof peek==='function')penPeeks.set(key,peek);else penPeeks.delete(key);
    const level=c=>PEN_LEVELS.includes(pens[c])?pens[c]:'empty';
    const tile=c=>{const l=level(c),off=l==='empty'||l==='hidden';
      return `<button type="button" class="st-pen-tile" data-level="${l}" data-pen="${esc(c)}"${off?' disabled':` data-action="${esc(action)}" data-value="${esc(c)}"`} aria-label="${esc(L.pen(c)+', '+L[l])}">${esc(c)}</button>`;};
    const grid=`<div class="st-pen-grid" style="--pm-lanes:${lanes.length}"><span class="st-pen-col st-pen-row" aria-hidden="true"></span>${lanes.map(c=>`<span class="st-pen-col" aria-hidden="true">${esc(c)}</span>`).join('')}${rows.map(n=>`<span class="st-pen-row" data-row="${n}" aria-hidden="true">${n}</span>${lanes.map(c=>tile(c+n)).join('')}`).join('')}</div>`;
    return `<div class="st-pen-map${className?' '+esc(className):''}" data-ds="PenMap" data-key="${esc(key)}"${current?` data-current="${esc(current)}"`:''}${rows.length>99?' data-wide':''}><div class="st-pen-entrance">${sGlyph('arrow-down')}<span>${esc(entrance)}</span></div><div class="st-pen-field"><div class="st-pen-scroll" role="group" aria-label="${esc(L.map)}">${grid}</div><div class="st-pen-peek" hidden></div></div></div>`;
  }
  /* penMapKey({ pens, words:{ act, live } }): the items of the sheet's key line: sheet({ line:{ key: penMapKey(...) } }). */
  function penMapKey({pens={},words={}}={}){
    const w=Object.assign({act:'need you',live:'farrowing'},words),n=l=>Object.values(pens).filter(v=>v===l).length;
    return [['act','--amber-fill'],['live','--progress-fill']].filter(([l])=>n(l)).map(([l,fill])=>({fill,count:n(l),label:w[l]}));
  }
  /* penPeek({ title, meta, rows, more }): the body of the peek card: the pen code with its count, then one animal Row per
     animal, the same row as the room list (`rows` are Row props: code and right:{ kind:'state', figure, word, level } or
     right:{ kind:'tags', tags }). A pen with more animals than the card holds passes the rows it shows and `more`, one quiet
     line after them ("+12 more"). */
  function penPeek({title='',meta='',rows=[],more=''}={}){
    return `<div class="st-pen-peek-head"><b>${esc(title)}</b>${meta?`<span>${esc(meta)}</span>`:''}</div>${rows.map(r=>row(Object.assign({variant:'animal',className:'st-pen-peek-row'},r))).join('')}${more?`<p class="st-pen-peek-more">${esc(more)}</p>`:''}`;
  }
  function penMapFooter({back={action:'back'},depth=0,rangeSize=20,label='Jump to pens'}={}){
    const size=Math.max(1,rangeSize|0);
    if(!(depth>size))return sheetFooter({back});
    const ranges=Array.from({length:Math.ceil(depth/size)},(_,i)=>[i*size+1,Math.min(depth,(i+1)*size)]);
    return sheetFooter({content:backButton(back)+`<div class="st-pen-ranges" data-ds="PenMap" role="radiogroup" aria-label="${esc(label)}">${ranges.map(([a,b],i)=>`<button type="button" role="radio" data-from="${a}" data-to="${b}" aria-checked="${i===0}">${a}–${b}</button>`).join('')}</div>`});
  }
  /* The map's own behaviour. A pen map is found by its markup, so any host that draws one gets it without a call:
     it opens centred on its current pen; the range control (in the sheet's footer) follows the top visible row, and a tap
     on a range scrolls its first row to just under the column letters; a hold shows the peek (350ms; a move of more than
     12px, a scroll or a release hides it), and the tap after a peek only closes it. */
  const penHead=map=>map.querySelector('.st-pen-col'),penSheet=el=>el.closest('.sheet,.phone')||document.body;
  function penTopRow(map){
    const h=penHead(map).getBoundingClientRect().bottom;
    for(const l of map.querySelectorAll('.st-pen-row[data-row]'))if(l.getBoundingClientRect().bottom>h+4)return +l.dataset.row;
    return 1;
  }
  function penMark(map){
    const ranges=penSheet(map).querySelector('.st-pen-ranges');if(!ranges)return;
    const btns=[...ranges.children],atEnd=map.scrollHeight>map.clientHeight+1&&map.scrollTop+map.clientHeight>=map.scrollHeight-1,n=penTopRow(map);
    const on=atEnd?btns[btns.length-1]:btns.find(b=>n>=+b.dataset.from&&n<=+b.dataset.to);
    btns.forEach(b=>b.setAttribute('aria-checked',String(b===on)));
    if(on){const r=on.getBoundingClientRect(),q=ranges.getBoundingClientRect();if(r.left<q.left)ranges.scrollLeft+=r.left-q.left;else if(r.right>q.right)ranges.scrollLeft+=r.right-q.right;}
    penEdges(ranges);
  }
  /* ranges that overflow fade on the side that has more, so a cut range reads as "more this way", never as clipped */
  function penEdges(r){
    const s=r.scrollLeft,more=[s>1&&'start',s+r.clientWidth<r.scrollWidth-1&&'end'].filter(Boolean).join(' ');
    if(more)r.dataset.more=more;else delete r.dataset.more;
  }
  function penMount(scope){
    const maps=!scope||!scope.querySelectorAll?[]:scope.matches&&scope.matches('.st-pen-map')?[scope]:[...scope.querySelectorAll('.st-pen-map')];
    for(const m of maps){
      if(m.dataset.mounted)continue;m.dataset.mounted='1';
      const map=m.querySelector('.st-pen-scroll'),cur=m.dataset.current&&[...map.querySelectorAll('.st-pen-tile')].find(t=>t.dataset.pen===m.dataset.current);
      if(cur){
        const box=map.getBoundingClientRect(),head=penHead(map).getBoundingClientRect(),side=map.querySelector('.st-pen-row').getBoundingClientRect(),r=cur.getBoundingClientRect();
        map.scrollTop+=r.top+r.height/2-(head.bottom+box.bottom)/2;map.scrollLeft+=r.left+r.width/2-(side.right+box.right)/2;
        /* then rest on a whole row and column: the tile edge sits PEN_GAP under the letters and beside the numbers */
        const snap=(d,pitch)=>{d=((d%pitch)+pitch)%pitch;return d>pitch/2?d-pitch:d;},at=cur.getBoundingClientRect();
        map.scrollTop+=snap(at.top-(head.bottom+PEN_GAP),at.height+PEN_GAP);
        if(map.scrollWidth>map.clientWidth+1)map.scrollLeft+=snap(at.left-(side.right+PEN_GAP),at.width+PEN_GAP);
      }
      penMark(map);
    }
  }
  function penStop(){
    const p=penHold;if(!p)return;
    clearTimeout(p.timer);penHold=null;p.map.querySelector('.st-pen-peek').hidden=true;
  }
  if(typeof document!=='undefined'){
    if(typeof MutationObserver!=='undefined')new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)penMount(n);}).observe(document,{childList:true,subtree:true});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>penMount(document));else penMount(document);
    let frame=0;
    document.addEventListener('scroll',e=>{const t=e.target;if(t.classList&&t.classList.contains('st-pen-ranges')){penEdges(t);return;}if(!t.classList||!t.classList.contains('st-pen-scroll'))return;penStop();cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>penMark(t));},true);
    document.addEventListener('click',e=>{
      const b=e.target.closest&&e.target.closest('.st-pen-ranges button');
      if(b){
        const map=penSheet(b).querySelector('.st-pen-scroll'),l=map&&map.querySelector(`.st-pen-row[data-row="${b.dataset.from}"]`);
        if(l)map.scrollTop+=l.getBoundingClientRect().top-penHead(map).getBoundingClientRect().bottom-PEN_GAP;
        return;
      }
      if(penSwallow&&e.target.closest&&e.target.closest('.st-pen-tile')){penSwallow=false;e.stopImmediatePropagation();e.preventDefault();}
    },true);
    document.addEventListener('pointerdown',e=>{
      penSwallow=false;penStop();
      const t=e.target.closest&&e.target.closest('.st-pen-tile:not(:disabled)');if(!t||e.button!==0)return;
      const root=t.closest('.st-pen-map'),fn=penPeeks.get(root.dataset.key);if(!fn)return;
      penHold={map:root,x:e.clientX,y:e.clientY,timer:setTimeout(()=>{
        const card=root.querySelector('.st-pen-peek'),code=t.dataset.pen;
        card.innerHTML=fn(code);card.dataset.at='bottom';card.hidden=false;penSwallow=true;
        /* over the lower part of the map, and over the upper part when the held tile would sit under it */
        const c=card.getBoundingClientRect(),r=t.getBoundingClientRect();
        if(r.bottom>c.top&&r.top<c.bottom)card.dataset.at='top';
        root.dispatchEvent(new CustomEvent('sentri-pen-peek',{bubbles:true,detail:{pen:code}}));
      },PEN_HOLD_MS)};
    });
    document.addEventListener('pointermove',e=>{if(penHold&&Math.hypot(e.clientX-penHold.x,e.clientY-penHold.y)>PEN_SLOP)penStop();});
    for(const n of ['pointerup','pointercancel'])document.addEventListener(n,penStop);
    document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.st-pen-tile'))e.preventDefault();});
    if(typeof globalThis.addEventListener==='function')globalThis.addEventListener('blur',penStop);
  }
  /* TaskTile: one open task instance as a tile on the Overview (owner, 2026-10-18). Four fixed slots, each with one kind of
     message, at the same height in every tile, so a row of tiles scans line by line: 1 the task (one line, a short name),
     2 the batch (or what and where), 3 to-do: one line that says it all (owner, 2026-10-19, no second line), 4 the run (one
     segment per planned day, red segments for days past the plan).
     Slot 3 is one of: the count due now and a short word, with an optional overdue part after it ("5 now · 2 overdue");
     the next count in grey when nothing is due yet ("8 tomorrow"); a tick and "Ready to close" when all is recorded.
     Saved work (owner, 2026-10-18): a task with records still on this phone carries "↑ N" at the right of the run line, quiet ink,
     N being that task's records; nothing when it has none.
     taskTile({ id, title, sub, todo:{value,label,tone,also:{text,tone}}|{next:{value,label}}|{done}|{none}, days:{day,total,over,text}, late, saved, action, entry }) */
  function taskTile({id='',title='',sub='',todo={},days={},late=false,saved=0,action='',entry=''}={}){
    const n=Math.max(1,days.total||1),d=Math.max(0,Math.min(n,days.day||0)),over=Math.max(0,days.over||0);
    const act=t=>t==='act'||t==='red';
    // One coloured signal at most (owner, 2026-10-19): red only on the overdue part or the days over; "Ready to close" is a quiet tick.
    const also=todo.also?`<span class="st-tile-also"${act(todo.also.tone)?' data-tone="act"':''}>· ${esc(todo.also.text)}</span>`:'';
    const todoHtml=todo.done?`<span class="st-tile-todo" data-done="">${glyph('check')}<b>${esc(todo.done)}</b></span>`
      :todo.next?`<span class="st-tile-todo" data-next=""><b>${esc(todo.next.value)}</b><span>${esc(todo.next.label)}</span></span>`
      :todo.none?`<span class="st-tile-todo" data-none=""><b>${esc(todo.none)}</b></span>`
      :`<span class="st-tile-todo"${act(todo.tone)?' data-tone="act"':''}><b>${esc(todo.value)}</b><span>${esc(todo.label)}</span>${also}</span>`;
    const todoText=todo.done||todo.none||(todo.next?`${todo.next.value} ${todo.next.label}`:[`${todo.value} ${todo.label}`,todo.also&&todo.also.text].filter(Boolean).join(', '));
    const segs=Array.from({length:n},(_,i)=>`<i${i<d?' data-on=""':''}></i>`).join('')+Array.from({length:over},()=>'<i data-over=""></i>').join('');
    const dayText=days.text||(over?`${over} ${over===1?'day':'days'} overdue`:`Day ${d} of ${n}`);
    const savedText=saved>0?`${saved} ${saved===1?'record':'records'} waiting to upload`:'';
    const name=[title,sub,todoText,dayText,savedText].filter(Boolean).join(', ');
    return `<button type="button" class="st-tile" data-ds="TaskTile"${late?' data-late=""':''}${id?` data-card="${esc(id)}"`:''}${action?` data-action="${esc(action)}" data-value="${esc(id)}"`:''}${entry?` data-entry="${esc(entry)}"`:''} aria-label="Open ${esc(name)}">`+
      `<span class="st-tile-name">${esc(title)}</span><span class="st-tile-sub">${esc(sub)}</span>${todoHtml}`+
      `<span class="st-tile-run"><span class="st-tile-segs" aria-hidden="true">${segs}</span>${saved>0?`<span class="st-tile-saved" aria-hidden="true">${glyph('upload')}${esc(saved)}</span>`:''}<span class="st-tile-day"${over?' data-tone="act"':''}>${esc(dayText)}</span></span></button>`;
  }
  /* WeekBoard: a week of work, one line per task under its type, a cell per day holding that day's count (owner, 2026-10-19).
     Cell codes: '' nothing · n running, nothing due · u waiting on today · dN done · oN due today · pN planned · eN estimate ·
     vN past its plan, today · wN past its plan, a past day; a trailing '>' runs into next week, a leading '<' came from last week.
     Counts up to 999 print in full; actual counts from 1,000 shorten to "1.2k", estimates to "~1k".
     weekBoard({ days:[{label,date,today,past}], groups:[{band:{icon,label}|null, types:[{title,sub,rows:[{label,late,action,value,aria,cells}]}]}], empty })
     weekCell(code) draws one cell; weekBoardKey([[code,title,line]]) the legend rows for the "How to read the board" drawer. */
  const weekFmt=(n,est)=>n>=1000?(est?'~'+Math.round(n/1000)+'k':(Math.round(n/100)/10)+'k'):(est?'~':'')+n;
  function weekCell(code){
    if(!code)return '<span class="st-week-cell"></span>';
    let c=String(code),cont='',from='';
    if(c.endsWith('>')){cont=' data-cont=""';c=c.slice(0,-1);}
    if(c.startsWith('<')){from=' data-from=""';c=c.slice(1);}
    const k=c[0],n=+c.slice(1);
    const map={n:['nil','·'],u:['wait','–'],d:['done',weekFmt(n)],o:['today',weekFmt(n)],p:['plan',weekFmt(n)],e:['est',weekFmt(n,true)],v:['late',weekFmt(n)],w:['latedone',weekFmt(n)]};
    const [kind,text]=map[k]||['',''];
    return `<span class="st-week-cell" data-kind="${kind}"${cont}${from}>${esc(text)}</span>`;
  }
  function weekBoard({days=[],groups=[],empty=''}={}){
    const today=days.findIndex(d=>d.today);
    const head=`<div class="st-week-days"><span></span><span class="st-week-grid">${days.map(d=>`<span class="st-week-day"${d.today?' data-today=""':''}${d.past?' data-past=""':''}><span>${esc(d.label)}</span><b>${esc(d.date)}</b></span>`).join('')}</span></div>`;
    const body=groups.map(g=>(g.band?`<div class="st-week-band"><span class="st-week-band-icon">${g.band.icon||''}</span><b>${esc(g.band.label)}</b></div>`:'')+
      ((g.types||[]).map(t=>`<div class="st-week-type"><div class="st-week-type-head"><span>${esc(t.title)}</span><small>${esc(t.sub||'')}</small></div>${(t.rows||[]).map(r=>`<button type="button" class="st-week-row"${r.action?` data-action="${esc(r.action)}" data-value="${esc(r.value)}"`:''} aria-label="${esc(r.aria||r.label)}"><span class="st-week-batch"${r.late?' data-late=""':''}>${esc(r.label)}</span><span class="st-week-grid">${(r.cells||[]).map(weekCell).join('')}</span></button>`).join('')}</div>`).join('')||(g.band&&g.none?`<p class="st-week-none">${esc(g.none)}</p>`:''))).join('');
    const band=today>=0?`<span class="st-week-today" aria-hidden="true" style="left:calc(54px + (100% - 86px) / 7 * ${today} + ${3*today}px);width:calc((100% - 86px) / 7)"></span>`:'';
    return `<div class="st-week" data-ds="WeekBoard">${head}${empty?`<p class="st-week-none" data-week="">${esc(empty)}</p>`:body+band}</div>`;
  }
  function weekBoardKey(rows=[]){
    return `<div class="st-panel st-week-key" data-ds="WeekBoard">${rows.map(([c,t,l])=>`<div class="st-week-key-row"><span class="st-week-grid" data-one="">${weekCell(c)}</span><div><strong>${esc(t)}</strong><small>${esc(l)}</small></div></div>`).join('')}</div>`;
  }
  /* Lookup: the two ways to reach an animal by its ear tag, Find and Scan, one part for every feature (owner decisions
     2026-10-12 and 2026-10-20; first built in Farrowing, #143). They are different jobs and never merge.
     Find (findPage): type, tap one, act. The field is pinned and focused, nothing is listed before typing, and the results are one
       card per unit under a plain "Unit 7" heading, this unit first. Tapping a result opens that animal in the host's context.
     Scan (scanPage): hands-free. The reader always listens; each scan adds the animal to a list, newest first, and a repeat scan
       lights its row again. Every row has its tick box; ticking replaces the footer with "N selected" and Actions. The footer's
       Stop / Resume scanning is the only scanning status. No "Not found" row, no Select button.
     The host passes its own animal row (Row · Animal in Find, rowSelectDoor in Scan) and its own Actions; Lookup draws the page around them.
     lookupGroups([{title,rows:[html]}],{variant:'find'|'scan'}) · findPage({query,placeholder,results,scan,clear,cancel,inputAttrs,bar})
     findResults({query,groups,hint,none}) · findRow({code,place,query,action,value}) · findMark(text,query)
     scanPage({title,back,connected,listening,groups,picked,selected,actions,toggle,empty,bar}) · scanArrive(root,scan) · scanPlaces(root) · scanGlide(root,before) */
  function lookupGroups(groups=[],{variant='find'}={}){
    const card=variant==='scan'?'st-scan-card':'st-find-list';
    return groups.filter(g=>g&&(g.rows||[]).length).map(g=>heading({title:g.title,kind:'section',level:3})+panel(g.rows.join(''),{className:'st-row-group '+card})).join('');
  }
  /* The typed part bold, the rest muted (.st-find-row mutes the tag; this marks only the part that matched). */
  function findMark(text,q){const t=String(text??''),i=q?t.toLowerCase().indexOf(String(q).toLowerCase()):-1;return i<0?esc(t):esc(t.slice(0,i))+'<b>'+esc(t.slice(i,i+q.length))+'</b>'+esc(t.slice(i+q.length));}
  /* A result: the tag on the left, where the animal is on the right; the part of either that matched is marked. */
  function findRow({code='',place='',query='',action='',value=code,className=''}={}){
    const q=String(query||'').trim().toLowerCase();
    let html=row({variant:'animal',code,right:{kind:'state',figure:place,word:'',level:'settled'},action,value,className:'st-find-row'+(className?' '+className:'')});
    html=html.replace(`<strong class="st-animal-id">${esc(code)}</strong>`,`<strong class="st-animal-id">${findMark(code,q)}</strong>`);
    if(place&&String(place).toLowerCase().includes(q))html=html.replace(`>${esc(place)}<`,`>${findMark(place,q)}<`);
    return html;
  }
  /* What the results area says: the hint before typing, the no-match line, or the unit cards. */
  function findResults({query='',groups=[],hint='',none=''}={}){
    if(!String(query).trim())return hint?`<p class="st-find-hint">${esc(hint)}</p>`:'';
    if(!groups.some(g=>(g.rows||[]).length))return `<p class="st-find-hint">${esc(none)}</p>`;
    return lookupGroups(groups,{variant:'find'});
  }
  /* The field is pinned and focused (the host focuses [data-find-input] once it has rendered). Natively this is the number-first keyboard
     with an ABC switch (iOS numbersAndPunctuation, Android's 123/ABC toggle); the web has no such input mode, so the field asks for plain
     text with no auto-capitals and no suggestions. A white page (an input surface): the field, Clear while something is typed, the scan
     icon when the host has a reader, and Cancel. */
  function findPage({query='',placeholder='Ear tag or pen',label=placeholder,results='',scan=null,clear={action:'find-clear',label:'Clear'},cancel={action:'back',label:'Cancel'},inputAttrs={},bar='',className=''}={}){
    const q=String(query??'');
    const input=`<input data-find-input${safeAttr(inputAttrs)} type="text" inputmode="text" enterkeyhint="search" autocapitalize="characters" autocorrect="off" autocomplete="off" spellcheck="false" placeholder="${esc(placeholder)}" aria-label="${esc(label)}" value="${esc(q)}">`;
    return `<section class="st-find${className?' '+esc(className):''}" data-ds="Lookup" data-variant="find" data-st-context="drawer" role="region"${sL(label)}>${bar}<div class="st-find-top">${searchBox({input,value:q,scan,clear})}${button({label:cancel.label||'Cancel',register:'text',action:cancel.action,className:'st-find-cancel'})}</div><div class="st-find-results" role="region" aria-label="Search results" aria-live="polite">${results}</div></section>`;
  }
  const scanEmpty=(title,text)=>`<div class="st-scan-empty">${SentriIcons.icon('scan')}<strong>${esc(title)}</strong><p>${esc(text)}</p></div>`;
  /* A page (it fills the screen): Back at the top left and the title, no line (Headers law). The footer says whether the reader listens,
     so the body carries no second scanning status. With rows ticked the footer is the plain count and Actions (no Back); with no reader
     there is no footer. `selected(n)` and `empty` carry the host's noun ("2 sows selected", "Each pig you scan appears here."). */
  function scanPage({title='Scan ear tags',back={action:'back'},connected=true,listening=true,groups=[],picked=0,selected=n=>n+' selected',actions={action:'scan-actions',label:'Actions'},toggle={action:'scan-toggle'},empty={},bar='',className=''}={}){
    const e=Object.assign({offTitle:'Scanner not connected',offText:"Turn on the tag reader and pair it in your phone's Bluetooth settings. Scanning starts as soon as it connects.",title:'Hold the reader to an ear tag',text:'Each animal you scan appears here.',stoppedTitle:'Scanning is stopped',stoppedText:'Resume scanning to add more.'},empty);
    const has=groups.some(g=>(g.rows||[]).length);
    const body=!connected?scanEmpty(e.offTitle,e.offText):!has?(listening?scanEmpty(e.title,e.text):scanEmpty(e.stoppedTitle,e.stoppedText)):`<div class="st-scan-body">${lookupGroups(groups,{variant:'scan'})}</div>`;
    const foot=!connected?false:picked?sheetFooter({content:`<p class="st-scan-selected">${esc(selected(picked))}</p>`+button({label:actions.label||'Actions',icon:SentriIcons.icon('more'),register:'primary',action:actions.action}),className:'st-scan-foot'}):
      sheetFooter({content:button({label:listening?(toggle.stop||'Stop scanning'):(toggle.resume||'Resume scanning'),icon:SentriIcons.icon(listening?'stop':'scan'),register:listening?'secondary':'primary',className:'st-scan-toggle',action:toggle.action}),className:'st-scan-foot'});
    return sheet({variant:'page',title,back,body,footer:foot,className:'st-scan'+(className?' '+className:''),label:title,bar,attrs:{'data-lookup':'scan'}});
  }
  /* An animal just scanned keeps Row's Just scanned state for a moment (data-arrival="on", the progress wash), so the eye finds her row after
     looking up from the pig; "off" then fades it back and the attribute goes. The row just read is brought into view (smoothly); the rest of
     the list keeps its place. scan = { fresh:{ tag: until (ms, or Infinity for the held frame) }, last }. Rows carry data-scan-tag. */
  function scanArrive(root,sc){
    if(!root||!sc)return;const now=Date.now();sc.fresh=sc.fresh||{};
    for(const [tag,until] of Object.entries(sc.fresh)){
      if(until<=now){delete sc.fresh[tag];continue;}
      const r=root.querySelector(`[data-scan-tag="${tag}"]`);if(!r)continue;
      r.dataset.arrival='on';
      if(until!==Infinity)setTimeout(()=>{r.dataset.arrival='off';setTimeout(()=>r.removeAttribute('data-arrival'),900);},until-now);
    }
    const r=sc.last&&root.querySelector(`[data-scan-tag="${sc.last}"]`);sc.last='';
    if(r)r.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  /* A new row arrives without a jump: it slides in at the top of its card and everything under it glides to its new place (measured before
     and after the render with scanPlaces, then animated back from the old place by scanGlide). A new card fades in with its heading, and a card
     that gains a row grows with it. Rows move with their card, so a row is measured against its card. Reduced motion and the atlas's still frames skip it. */
  const scanKey=e=>e.dataset.scanTag?'r'+e.dataset.scanTag:e.classList.contains('st-scan-card')?'c'+e.previousElementSibling?.textContent:'h'+e.textContent;
  const scanMovers=root=>[...root.querySelectorAll('.st-scan-body .st-heading,.st-scan-body .st-scan-card,.st-scan-body [data-scan-tag]')];
  const scanTop=e=>e.getBoundingClientRect().top-(e.dataset.scanTag?e.closest('.st-scan-card').getBoundingClientRect().top:0);
  function scanPlaces(root){const m=new Map();if(root)for(const e of scanMovers(root)){m.set(scanKey(e),scanTop(e));if(e.classList.contains('st-scan-card'))m.set('H'+scanKey(e),e.getBoundingClientRect().height);}return m;}
  function scanGlide(root,before){
    if(!root||document.documentElement.classList.contains('atlas-still')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const ease={duration:280,easing:'cubic-bezier(.22,1,.36,1)'};
    for(const e of scanMovers(root)){
      const was=before.get(scanKey(e)),now=scanTop(e);
      if(was===undefined)e.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'none'}],ease);
      else if(Math.abs(was-now)>.5)e.animate([{transform:`translateY(${was-now}px)`},{transform:'none'}],ease);
      // A card that gained a row grows with it, so no empty strip opens under its last row while the rows glide.
      const h=before.get('H'+scanKey(e)),hn=e.getBoundingClientRect().height;if(h!==undefined&&Math.abs(h-hn)>.5)e.animate([{height:h+'px',overflow:'hidden'},{height:hn+'px',overflow:'hidden'}],ease);
    }
  }
  const api=Object.freeze({taskDock,lookupGroups,findPage,findResults,findRow,findMark,scanPage,scanArrive,scanPlaces,scanGlide,taskTile,weekBoard,weekCell,weekBoardKey,headerLine,pageHeader,rangeSlider,filterSheet,penMap,penMapKey,penMapFooter,penPeek,penMapMount:penMount,optionalRow,keyboardLift,heading,panel,facts,row,rowGroup,log,logDay,logStamp,logGroups,field,rowTile,rowGrid,pickerField,pickerOptions,pickerBody,pickerHead,pickerFooter,filterChips,chooserList,choiceRow,choiceGroup,choiceSearch,choiceEmpty,toast,segment,iconButton,stepper,measure,numpad,numpadInput,numpadScan,numpadCommit,numpadKey,numpadScanner,rowSelect,rowSelectDoor,rowAction,rowSelectChange,status,conditionTag,rowFitTags,statusLine,statusText,announce,liveFill,banner,photos,button,buttonReason,guard,handFocus,holdButton,holdStep,holdBind,HOLD,choiceRadios,radioNext,radioBind,sheet,sheetFooter,backButton,scrim});
  root.SentriUI=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
