// PW=/path/to/playwright OFFLINE=1 node shoot-home.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PW||'playwright');
const url=pathToFileURL(path.join(__dirname,'home-b.html')).href,shots=path.join(__dirname,'shots-home');
(async()=>{fs.mkdirSync(shots,{recursive:true});const browser=await chromium.launch();let errors=0;const overflows=[];
try{
 const offline=process.env.OFFLINE==='1';const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,offline});
 if(offline)await context.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>{errors++;console.error(e.message)});page.on('console',m=>{if(m.type()==='error'){errors++;console.error(m.text())}});
 async function check(){overflows.push(...await page.evaluate(()=>{const overflow=[];document.querySelectorAll('.frame').forEach(f=>{const bounds=f.getBoundingClientRect(),scale=bounds.width/1440;f.querySelectorAll('*').forEach(el=>{if(!el.getClientRects().length)return;const b=el.getBoundingClientRect();if(el.scrollWidth>el.clientWidth+1||b.right>bounds.right+scale)overflow.push({frame:f.dataset.frame,tag:el.tagName,class:el.className,text:el.textContent.slice(0,80),width:el.clientWidth,scroll:el.scrollWidth})})});return overflow}))}
 async function load(frame){await page.goto(url+(frame?'?frame='+frame:''));await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100)}
 for(const frame of ['home','hover','bundle','bundle-done']){
  await load(frame);await check();await page.screenshot({path:path.join(shots,frame+'.png')});
  assert.equal(await page.locator('.open-count').textContent(),'6 open');assert.equal(await page.locator('.count').textContent(),'6');
  assert.equal(await page.locator('.inbox-row').count(),6);assert.equal(await page.locator('.today-row').count(),4);
  assert.deepEqual(await page.locator('.inbox-row').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height)),Array(6).fill(64));
  assert.deepEqual(await page.locator('.today-row').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height)),Array(4).fill(56));
  assert(await page.locator('.inbox-card').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.closest('.page-scroll').getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom}));
  if(frame==='home'){
   assert.equal(await page.locator('.rail .agent.selected').innerText(),'GM');
   await page.locator('[data-inbox="0"]').hover();assert.equal(await page.getByRole('tooltip').isVisible(),true);assert.equal(await page.getByRole('tooltip').evaluate(el=>el.getBoundingClientRect().width),280);
   await page.getByRole('button',{name:'Use Farrowing 2',exact:true}).click();assert.equal(await page.locator('[data-inbox="2"]').textContent(),'Answered: Use Farrowing 2');assert.equal(await page.locator('.open-count').textContent(),'5 open');assert.equal(await page.locator('.count').textContent(),'5');
   const checkbox=page.locator('[data-inbox="3"] input');await checkbox.check();assert.equal(await page.locator('[data-inbox="3"]').evaluate(el=>getComputedStyle(el.querySelector('.inbox-title')).textDecorationLine),'line-through');await checkbox.uncheck();assert.equal(await page.locator('.count').textContent(),'5');
   await page.locator('[data-inbox="5"] .task-batch').hover();assert((await page.locator('[data-inbox="5"] .task-batch').getAttribute('data-rooms')).includes('310455'));
   await page.evaluate(()=>document.addEventListener('open-task',e=>window.taskIntent=e.detail,{once:true}));await page.locator('[data-task="Fostering checks"]').click();assert.deepEqual(await page.evaluate(()=>window.taskIntent),{taskType:'Fostering checks',batch:'B32',day:3});await check();
   await page.locator('.page-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await check();
  }
  if(frame==='hover'){assert.equal(await page.getByRole('tooltip').count(),1);assert.equal(await page.locator('.forced-hover').count(),1)}
  if(frame==='bundle'){
   assert.equal(await page.locator('.rail .agent.selected').innerText(),'VT');assert.equal(await page.locator('.bundle-card .bundle-row').count(),3);assert.equal(await page.locator('.comment-marker').count(),1);
   const drafts=await page.locator('.bundle-plan').allTextContents(),inbox=await page.locator('.inbox-card').innerHTML();
   await page.getByRole('button',{name:'Approve 2',exact:true}).click();assert.equal(await page.locator('.frame').getAttribute('data-frame'),'bundle-done');assert.equal(await page.locator('.bundle-saved').count(),2);assert.deepEqual(await page.locator('.bundle-plan').allTextContents(),drafts);assert.equal(await page.locator('.inbox-card').innerHTML(),inbox);assert.equal(await page.locator('[data-plan="36"] [data-open-plan]').count(),1);assert.equal(await page.locator('.message-meta time').last().textContent(),'09:15');await check();
  }
  if(frame==='bundle-done'){assert.equal(await page.locator('.bundle-saved').count(),2);assert.equal(await page.getByRole('button',{name:'Open Batch 36',exact:true}).count(),2)}
 }
 await page.setViewportSize({width:1600,height:900});await load();assert.equal(await page.locator('.screens').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2);await check();
 assert(await page.locator('[data-open="bundle"] .frame').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return m.e===0}));
 await page.screenshot({path:path.join(shots,'board.png'),fullPage:true});
 await page.locator('[data-open="home"]').click();await page.locator('#overlay-stage [data-answer="Keep Farrowing 1"]').click();assert.equal(await page.locator('#overlay-stage .count').textContent(),'5');await check();
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#overlay-stage .frame').getAttribute('data-frame'),'hover');await check();await page.keyboard.press('ArrowRight');await page.locator('#overlay-stage [data-approve]').click();assert.equal(await page.locator('#overlay-stage .frame').getAttribute('data-frame'),'bundle-done');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#overlay-stage .frame').getAttribute('data-frame'),'bundle');await page.keyboard.press('Escape');assert.equal(await page.locator('.overlay.open').count(),0);
 await page.getByRole('button',{name:'Whole console',exact:true}).click();await check();await page.getByRole('button',{name:'Page only',exact:true}).click();await check();
 if(overflows.length)console.error(JSON.stringify(overflows,null,2));
}finally{await browser.close();console.log('errors '+errors);console.log('overflow '+overflows.length)}if(errors||overflows.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
