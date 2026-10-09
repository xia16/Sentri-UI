import registry from '../laws/strings.json' with {type:'json'};
const language = typeof location !== 'undefined' && new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const entries = Object.entries(registry.strings).filter(([id]) => id.startsWith('feed.copy.')).map(([id,copy]) => {
  const keys = [];
  const parts = copy.en.split(/(\{\w+\})/).map(part => {
    if (/^\{\w+\}$/.test(part)) { const key=part.slice(1,-1);keys.push(key);return key==='n'?'([+−-]?\\d+(?:\\.\\d+)?)':key==='code'?'([A-Za-z0-9-]+)':key==='delta'?'([+−-]?\\d+(?:\\.\\d+)?%)':'([^·]+?)'; }
    return escape(part);
  });
  return {id,copy,keys,pattern:new RegExp('^'+parts.join('')+'$')};
}).sort((a,b)=>b.copy.en.replace(/\{\w+\}/g,'').length-a.copy.en.replace(/\{\w+\}/g,'').length);
function translated(text){
  const value = text.trim();
  for(const entry of entries){
    const match=entry.pattern.exec(value);if(!match)continue;
    const args=Object.fromEntries(entry.keys.map((key,i)=>[key,match[i+1]]));
    return {id:entry.id,text:text.replace(value,entry.copy[language].replace(/\{(\w+)\}/g,(_,key)=>args[key]))};
  }
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
    const result=translated(node.textContent);if(!result)continue;
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
