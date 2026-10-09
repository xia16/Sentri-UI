// Run serve-ux.cjs first. SENTRI_PLAYWRIGHT can point to an installed Playwright module.
const {chromium}=require(process.env.SENTRI_PLAYWRIGHT||'playwright');
const fs=require('fs');const assert=require('node:assert/strict');
const origin=process.env.SENTRI_PREVIEW_ORIGIN||'http://127.0.0.1:4310';
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:375,height:844}});
 let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route(origin+'/banner-photos-harness',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><head></head><body></body></html>'}));
 const report={variants:[],screens:[],previews:[],interactions:{}};
 const inject=`<link rel="stylesheet" href="${origin}/ux/design-system/tokens.css"><link rel="stylesheet" href="${origin}/ux/design-system/components/bundle.css"><script src="${origin}/ux/design-system/components/bundle.js"></script>`;
 const load=async(html,base='/')=>{await page.goto(origin+'/banner-photos-harness',{waitUntil:'domcontentloaded'});await page.setContent(html.replace('<head>',`<head><base href="${origin+base}">${inject}`));await page.waitForTimeout(80);};
 const measure=()=>page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,small:[...document.querySelectorAll('button,a[href],input:not([type=file]),select,textarea,summary,[role=button]')].filter(e=>e.getClientRects().length&&!e.closest('[inert]')&&getComputedStyle(e).visibility!=='hidden').map(e=>({label:e.getAttribute('aria-label')||e.textContent.trim().slice(0,50),ds:e.closest('[data-ds]')?.dataset.ds,w:(e.matches('input[type=checkbox],input[type=radio]')&&e.closest('label')||e).getBoundingClientRect().width,h:(e.matches('input[type=checkbox],input[type=radio]')&&e.closest('label')||e).getBoundingClientRect().height})).filter(e=>e.w<47.9||e.h<47.9)}));
 for(const name of ['Banner','Photos']){
  const dir=`ux/design-system/components/${name}`;fs.mkdirSync(`${dir}/proof`,{recursive:true});
  for(const variant of JSON.parse(fs.readFileSync(`${dir}/variants.json`))){
   const html=fs.readFileSync(`${dir}/variants/${variant.id}.html`,'utf8');
   // Match the atlas: each state is rendered alone, with the file's tail script.
   await load(html);
   const script=await page.locator('body>script').textContent();
   // Parse the original source, rather than reusing the already rendered markup.
   const shells=[...html.matchAll(/<section[^>]*data-state="([^"]+)"[^>]*><\/section>/g)];
   for(const shell of shells){errors=[];await load(`<!doctype html><html><head></head><body>${shell[0]}<script>${script}</script></body></html>`);
    const state=shell[1],m=await measure();const file=`${variant.id}-${state.replaceAll(/[^a-zA-Z0-9]+/g,'-').toLowerCase()}.png`;
    await page.locator('body>section').screenshot({path:`${dir}/proof/${file}`});
    report.variants.push({name,variant:variant.id,state,errors:[...errors],...m});
   }
  }
  errors=[];const preview=fs.readFileSync(`${dir}/preview.html`,'utf8');await load(preview,`/${dir}/`);await page.waitForFunction(n=>document.querySelectorAll('#examples>div').length===n,JSON.parse(fs.readFileSync(`${dir}/variants.json`)).length);await page.waitForTimeout(100);report.previews.push({name,errors:[...errors],components:await page.locator('[data-ds="Banner"],[data-ds="Photos"]').count()});
 }
 let screens=[];const walk=x=>{if(!x||typeof x!=='object')return;if(x.id&&x.url&&['farrowing.','inspection.','workbench.','piglet-processing.'].some(p=>x.id.startsWith(p)))screens.push(x);Object.values(x).forEach(walk)};walk(JSON.parse(fs.readFileSync('atlas/atlas.json')));
 await page.setViewportSize({width:390,height:844});for(const s of screens){errors=[];await page.goto(origin+s.url+(s.url.includes('?')?'&':'?')+'screen='+s.id,{waitUntil:'domcontentloaded'});await page.waitForSelector('html.atlas-ready');await page.waitForTimeout(80);report.screens.push({id:s.id,errors:[...errors],...await measure()});}
await page.goto(origin+'/ux/system/home-astra-prototype.html?layout=focus&section=farrowing&screen=workbench.today');await page.waitForSelector('html.atlas-ready');await page.locator('[data-ds=Banner][data-action=sync]').click();await page.waitForSelector('.sheet');assert.match(await page.locator('.sheet').innerText(),/Saved work/);
await page.goto(origin+'/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.blocked');await page.waitForSelector('html.atlas-ready');await page.locator('.atlas-phone [data-ds=Banner][data-action=edit]').click();const clear=page.locator('.atlas-phone [data-action=clearEdit]');await clear.waitFor();await clear.click();assert.match(await page.locator('.atlas-phone .edit-review').innerText(),/Cleared/);assert.equal(await page.locator('.atlas-phone [data-action=undoEdit]').evaluate(e=>e===document.activeElement),true);await page.locator('.atlas-phone [data-action=undoEdit]').click();assert.equal(await clear.evaluate(e=>e===document.activeElement),true);await clear.click();await page.waitForTimeout(5150);assert.equal(await page.locator('.atlas-phone [data-action=undoEdit]').count(),0);assert.equal(await page.evaluate(()=>document.activeElement===document.body),false);
await page.goto(origin+'/ux/system/farrowing-astra-concept.html?layout=focus&screen=farrowing.death');await page.waitForSelector('html.atlas-ready');let row=page.locator('.atlas-phone [data-ds=Photos] button').first();await row.waitFor();const data={name:'evidence.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=','base64')};await page.locator('.atlas-phone input[data-field=photo]').setInputFiles(data);assert.equal(await page.locator('.atlas-phone .st-photos-thumb').count(),1);assert.equal(await page.locator('.atlas-phone .st-photos-camera').evaluate(e=>e===document.activeElement),true);await page.locator('.atlas-phone .st-photos-thumb').click();assert.match(await page.locator('.atlas-phone [role=dialog]:not([inert])').innerText(),/Delete/);await page.locator('.atlas-phone [data-action=cancelPopup]').click();assert.equal(await page.locator('.atlas-phone .st-photos-thumb').evaluate(e=>e===document.activeElement),true);report.interactions={homeDoor:true,clearUndo:true,expiryFocus:true,photoCaptureViewer:true,photoFocusReturn:true};
 fs.writeFileSync('ux/design-system/components/Banner/proof/report.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({states:report.variants.length,interactions:report.interactions,screens:report.screens.length,previews:report.previews,errors:[...report.variants,...report.screens].filter(r=>r.errors.length),small:[...report.variants,...report.screens].filter(r=>r.small.length),overflow:report.variants.filter(r=>r.overflow)},null,2));
 await browser.close();if([...report.variants,...report.screens,...report.previews].some(r=>r.errors.length)||report.variants.some(r=>r.small.length||r.overflow))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
