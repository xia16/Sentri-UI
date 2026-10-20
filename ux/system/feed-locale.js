import registry from '../laws/strings.json' with {type:'json'};
const language = typeof location !== 'undefined' && new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const entries = Object.entries(registry.strings).filter(([id]) => /^feed\.(copy|aria)\./.test(id)).map(([id,copy]) => {
  const keys = [];
  const parts = copy.en.split(/(\{\w+\})/).map(part => {
    if (/^\{\w+\}$/.test(part)) { const key=part.slice(1,-1);keys.push(key);return key==='n'?'([+−-]?\\d+(?:\\.\\d+)?)':key==='code'?'([A-Za-z0-9-]+)':key==='delta'?'([+−-]?\\d+(?:\\.\\d+)?%)':'([^·]+?)'; }
    return escape(part);
  });
  return {id,copy,keys,pattern:new RegExp('^'+parts.join('')+'$')};
}).sort((a,b)=>b.copy.en.replace(/\{\w+\}/g,'').length-a.copy.en.replace(/\{\w+\}/g,'').length);
/* Condition names come from the conditions catalogue (its own zh), not the registry: an item, a typed item
   ("Diarrhoea (watery)"), a type, a symptom group and a disease system. Matched without case, so a line of examples
   ("Coughing, breathing hard, sneezing") reads too. Built on first use: the catalogue script loads before the page renders. */
let conditionNames=null;
function conditionName(value){
  if(!conditionNames){
    conditionNames=new Map();const cc=globalThis.ConditionsCatalogue;
    const put=(en,zh)=>{if(en&&zh&&!conditionNames.has(en.toLowerCase()))conditionNames.set(en.toLowerCase(),zh);};
    if(cc){
      for(const x of cc.items){put(x.en,x.zh);for(const t of x.types||[]){put(x.en+' ('+t.en.toLowerCase()+')',x.zh+'（'+t.zh+'）');put(t.en,t.zh);}}
      for(const g of [...cc.groups,...cc.systems,...(cc.penObservations||[])])put(g.en,g.zh);
    }
  }
  return conditionNames.get(value.toLowerCase());
}
/* A date the prototype writes in English ("1 Aug 2026", "Aug 1", "Aug 1, 2025", "13 Sep") or a log's weekday ("Thu"), in Chinese. */
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],WEEKDAYS={Mon:'周一',Tue:'周二',Wed:'周三',Thu:'周四',Fri:'周五',Sat:'周六',Sun:'周日'};
function dateText(value){
  let m=/^(\d{1,2}) ([A-Z][a-z]{2})(?: (\d{4}))?$/.exec(value);
  if(m&&MONTHS.includes(m[2]))return (m[3]?m[3]+'年':'')+(MONTHS.indexOf(m[2])+1)+'月'+(+m[1])+'日';
  m=/^([A-Z][a-z]{2}) (\d{1,2})(?:, (\d{4}))?$/.exec(value);
  if(m&&MONTHS.includes(m[1]))return (m[3]?m[3]+'年':'')+(MONTHS.indexOf(m[1])+1)+'月'+(+m[2])+'日';
  return WEEKDAYS[value]||null;
}
function translated(text){
  text = text.replace(/\u00a0/g, ' ');
  const value = text.trim();
  if(!value)return null;
  const date=dateText(value);if(date)return {text:text.replace(value,date)};
  for(const entry of entries){
    const match=entry.pattern.exec(value);if(!match)continue;
    /* A health string's {name} is a condition: it reads only when the condition does ("No Thin" → "无偏瘦"). Any other free
       argument that is a date reads as one ("Recorded 12 Sep" → "记录于9月12日"). */
    const args=Object.fromEntries(entry.keys.map((key,i)=>[key,entry.id.startsWith('feed.copy.health.')&&key==='name'?conditionName(match[i+1])||translated(match[i+1])?.text:['n','code','delta'].includes(key)?match[i+1]:dateText(match[i+1])||match[i+1]]));
    if(Object.values(args).some(arg=>arg==null))continue;
    return {id:entry.id,text:text.replace(value,entry.copy[language].replace(/\{(\w+)\}/g,(_,key)=>args[key]))};
  }
  const name=conditionName(value);
  if(name)return {text:text.replace(value,name)};
  if(value.includes(', ')&&!value.includes('·')){const parts=value.split(', ').map(conditionName);if(parts.every(Boolean))return {text:text.replace(value,parts.join('、'))};}
  if(/[a-z0-9—]\.\s/.test(value))return {text:text.split(/((?<=[a-z0-9—])\.\s+)/).map(part=>/^\.\s+$/.test(part)?(language==='zh'?'。':part):translated(part)?.text||part).join('')};
  if(value.includes('·'))return {text:text.split(/(\s*·\s*)/).map(part=>part.includes('·')?part:translated(part)?.text||part).join('')};
  return null;
}
export function localizeFeed(root){
  if(!root || language==='en')return;
  document.documentElement.lang=language;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    if(node.parentElement.closest('script,style,textarea'))continue;
    /* Inside a condition row the words are the catalogue's ("Clear" is a type of nasal discharge, not the verb). */
    const name=node.parentElement.closest('.st-choice-row')?.querySelector('[data-condition]')&&conditionName(node.textContent.replace(/\u00a0/g,' ').trim());
    const result=name?{text:node.textContent.replace(node.textContent.trim(),name)}:translated(node.textContent);if(!result)continue;
    node.textContent=result.text;
    if(result.id)node.parentElement.setAttribute('data-str',result.id);
  }
  for(const el of root.querySelectorAll('[aria-label],[placeholder],[title]')){
    for(const attr of ['aria-label','placeholder','title']){
      if(!el.hasAttribute(attr))continue;
      const result=translated(el.getAttribute(attr));if(result)el.setAttribute(attr,result.text);
    }
  }
}

export function recordReason(text){
  const copy=Object.entries(registry.strings).find(([id,copy])=>id.startsWith('record.reason.')&&copy.en===text)?.[1];
  return copy?copy[language]:text;
}

/* A registry string in the page's language (?lang=zh), with {key} arguments filled: for copy this prototype renders itself
   (the medicines picker and page), so it is drawn in Chinese directly instead of matched after the fact. */
export function str(id,args={}){
  const copy=registry.strings[id];if(!copy)return id;
  return (copy[language]||copy.en).replace(/\{(\w+)\}/g,(_,key)=>args[key]??'');
}
export {language};
