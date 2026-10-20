const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.join(__dirname,'../design-system/components');
const warnings=[];
const ctx={console:{warn:message=>warnings.push(message)}};
vm.runInNewContext(fs.readFileSync(path.join(base,'bundle.js'),'utf8'),ctx);
test('canonical glyphs retain aliases without duplicate catalogue entries or false affordances',()=>{
 const icons=ctx.SentriIcons;
 for(const [alias,name] of Object.entries(icons.aliases)){
  assert.equal(icons.icon(alias),icons.icon(name));
  assert.equal(Object.keys(icons.paths).includes(alias),false);
 }
 assert.match(icons.icon('unknown-name'),/<svg[^>]*><\/svg>/);
 assert.match(icons.icon('toString'),/<svg[^>]*><\/svg>/);
 assert.match(warnings.join(' '),/unknown-name/);
 assert.match(icons.paths.grid,/M14 3h7v7h-7z/);
 assert.match(icons.paths.grid,/M14 14h7v7h-7z/);
 assert.equal((icons.icon('more').match(/r="1.5"/g)||[]).length,3);
});
test('Panel consumers share their surface and category navigation never disables an empty strip',()=>{
 assert.equal(ctx.SentriUI.panel(''),'');
 assert.match(ctx.SentriUI.choiceGroup(['content']),/class="st-panel st-choice-panel"/);
 const footer=ctx.SentriUI.categoryFooter({categories:[{id:'health',label:'Health',disabled:true}],active:'missing'});
 assert.match(footer,/aria-current="location"/);
 assert.doesNotMatch(footer,/ disabled|aria-disabled/);
 vm.runInNewContext(fs.readFileSync(path.join(base,'task-skeleton.js'),'utf8'),ctx);
 assert.match(ctx.SentriTask.group({title:'B1',rows:'row'}),/class="st-panel tk-group"/);
});
test('variant states remain independently renderable in atlas srcdoc',()=>{
 const atlas=JSON.parse(fs.readFileSync(path.join(__dirname,'../../atlas/atlas.json'),'utf8'));
 const ids=new Set();function walk(v){if(v&&typeof v==='object'){if(v.id&&v.url)ids.add(v.id);Object.values(v).forEach(walk)}}walk(atlas);
 for(const name of ['Panel','Icon','CategoryFooter']){
  const dir=path.join(base,name);const variants=JSON.parse(fs.readFileSync(path.join(dir,'variants.json'),'utf8'));
  for(const variant of variants){
   for(const id of variant.usedBy)assert.ok(ids.has(id),id);
   const html=fs.readFileSync(path.join(dir,'variants',variant.id+'.html'),'utf8');
   assert.match(html,/document.querySelectorAll\('\[data-state\]'\)/);
   assert.doesNotMatch(html,/getElementById|new URL|fetch\(|<iframe|<link|src="/);
   for(const state of variant.states)assert.ok(html.includes(`data-state="${state}"`),state);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(dir,'preview.html'),'utf8'),/new URL|fetch\(|<iframe/);
 }
});
