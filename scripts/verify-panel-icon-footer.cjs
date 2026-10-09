// Run from repository root with the static UX server on port 4317.
// Playwright is optional; SENTRI_PLAYWRIGHT_MODULE can point to an external installation.
const {chromium}=require(process.env.SENTRI_PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');const path=require('path');
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:375,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
await page.route('**/favicon.ico',route=>route.fulfill({status:204,body:''}));
const base=path.resolve('ux/design-system');const assets=['tokens.css','components/bundle.css'].map(p=>'<style>'+fs.readFileSync(path.join(base,p),'utf8').replace(/@import[^;]+;/g,'')+'</style>').join('')+'<script>'+fs.readFileSync(path.join(base,'components/bundle.js'),'utf8')+'</script>';
const result=[];const dir=path.join(base,'components/pass-proof');fs.mkdirSync(dir,{recursive:true});
for(const name of ['Panel','Icon','CategoryFooter']){
 const variants=JSON.parse(fs.readFileSync(path.join(base,'components',name,'variants.json')));
 for(const v of variants){
 const html=fs.readFileSync(path.join(base,'components',name,'variants',v.id+'.html'),'utf8');
 for(const state of v.states){
 const isolated=html.replace(/<div data-state="([^"]+)"><\/div>/g,(full,s)=>s===state?full:'');
 await page.setContent(assets+isolated);await page.waitForTimeout(50);
 const bad=await page.locator('button,input:not([type=hidden]),[role=button],a').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&(r.width<47.9||r.height<47.9)}).map(n=>({text:n.textContent,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(state.includes('300px')){
 const nav=page.locator('.st-category-tabs');
 if(!await nav.evaluate(n=>n.scrollWidth>n.clientWidth))throw new Error('Expected category overflow');
 await nav.locator('button').last().focus();
 if(!await nav.evaluate(n=>n.scrollLeft>0))throw new Error('Keyboard focus must reveal an overflowing category');
 await nav.evaluate(n=>n.scrollLeft=0);
}
 const file=`${name}-${v.id}-${state.replace(/[^a-z0-9]/gi,'-')}.png`;
 await page.screenshot({path:path.join(dir,file),fullPage:true});result.push({name,variant:v.id,state,bad,overflow});
 }
 }
 await page.setContent(assets+fs.readFileSync(path.join(base,'components',name,'preview.html'),'utf8'));await page.waitForTimeout(50);
}
await page.setViewportSize({width:390,height:844});
const screens=[];function walk(v){if(v&&typeof v==='object'){if(v.id&&v.url)screens.push(v);Object.values(v).forEach(walk)}}walk(JSON.parse(fs.readFileSync('atlas/atlas.json')));
for(const id of ['workbench.today','farrowing.room','farrowing.finish','farrowing.history','inspection.walk','inspection.filters','inspection.actions','pig-profile.actions','piglet-processing.pen-list','piglet-processing.sheet-todo','piglet-processing.record-death']){
 const s=screens.find(s=>s.id===id);if(!s)continue;await page.goto('http://127.0.0.1:4317'+s.url+(s.url.includes('?')?'&':'?')+'screen='+id);await page.waitForSelector('html.atlas-ready',{timeout:10000,state:'attached'}).catch(e=>{console.error(id,errors);throw e});
 const bad=await page.locator('button,input:not([type=hidden]):not([type=checkbox]):not([type=radio]),[role=button],a').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(n).visibility!=='hidden'&&(r.width<47.9||r.height<47.9)}).map(n=>({text:n.textContent.slice(0,50),class:n.className,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
 await page.screenshot({path:path.join(dir,id+'.png'),fullPage:true});result.push({screen:id,bad});
}
console.log(JSON.stringify({errors,result},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
