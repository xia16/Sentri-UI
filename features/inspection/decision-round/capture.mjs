// Render the proposed states with the actual prototype templates and components.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';
import { routeFonts } from '../../../scripts/font-route.mjs';
import { inspection, farrowing, home } from './proposal.mjs';
const origin=process.env.SENTRI_REVIEW_URL||'http://127.0.0.1:4319';
const here=new URL('./',import.meta.url);
const root=new URL('../../../',here);
const variants=new Map(await Promise.all([
 ['inspection-astra-concept',inspection],['farrowing-astra-concept',farrowing],['home-astra-prototype',home],
].map(async ([name,make])=>[name,make(await fs.readFile(new URL('ux/system/'+name+'.js',root),'utf8'))])));
const browser=await playwright().chromium.launch();
const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
await routeFonts(ctx,fileURLToPath(root));
await ctx.route(/\/ux\/system\/(?:inspection-astra-concept|farrowing-astra-concept|home-astra-prototype)\.js(?:\?.*)?$/,r=>{
 const url=new URL(r.request().url());
 if(url.pathname.startsWith('/@'))return r.fallback();
 return r.fulfill({contentType:'application/javascript',body:variants.get(url.pathname.split('/').at(-1).slice(0,-3))});
});
const page=await ctx.newPage(),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.setDefaultTimeout(5500);
const phone=()=>page.locator('.atlas-phone, [data-card="0"] .phone').first();
const action=(a,v)=>`[data-action="${a}"]${v==null?'':`[data-value="${v}"]`}`;
const live=s=>phone().locator(s+':not([inert] *)');
const tap=(a,v)=>live(action(a,v)).last().click();
const read=()=>page.locator('[data-card="0"] [data-demo-scan]').evaluate(el=>el.click());
const ticks=()=>live('[data-pig-select]:checked').evaluateAll(rows=>rows.map(el=>el.dataset.pigSelect).sort());
const view=v=>page.locator(`[data-card="0"][data-view="${v}"]`).waitFor({state:"attached"});
const open=async (file,query)=>{await page.goto(origin+'/ux/system/'+file+'.html?layout=focus&'+query);if(query.includes('screen='))await page.locator('html.atlas-ready').waitFor({timeout:12500});};
const walk=(q='',s='walk')=>open('inspection-astra-concept','screen=inspection.'+s+'&lang=en&'+q);
const shot=async (id)=>{await phone().screenshot({path:new URL('screenshots/'+id+'.jpg',here).pathname,type:'jpeg',quality:82,animations:'disabled'});};
const check=async (name,go)=>{await go();checks.push(name);console.log('PASS',name);};
async function outsideRead(){await tap('scan');await read();await read();await read();assert.deepEqual(await ticks(),['000267','000306']);}
async function choose(mode){await tap('study-move','000430');await tap('study-move-mode',mode);await tap('study-target','C1');}
async function note(txt){await tap('note');await live('[data-bulk-key="note"]').last().fill(txt);await tap('bulk-save');}
try{
 await check('Unit scan groups local pigs in their own pens; outside tag has no tick; unknown and repeated reads do not add pigs',async()=>{
  await walk();await outsideRead();await shot('01-unit-scan');
  await tap('pig','000430');await view('pig');assert.match(await live('.sheet').last().innerText(),/Unit 6/);await shot('02-outside-record');await tap('back');
  await read();assert.deepEqual(await ticks(),['000267','000306']);await shot('03-unknown');
  await read();assert.equal(await live('[data-scan-tag="000306"]').count(),1);assert.deepEqual(await ticks(),['000267','000306']);
  await tap('study-move','000430');await shot('04-outside-choices');await tap('study-move-mode','select');await shot('05-choose-destination');
  await tap('back');await tap('back');assert.deepEqual(await ticks(),['000267','000306']);
 });
 await check('Move-only and move-and-select change the location; only the second adds a tick',async()=>{
  for(const mode of ['move','select']){
   await walk();await outsideRead();await choose(mode);await shot('06-confirm-'+mode);await tap('study-confirm');await shot('07-receipt-'+mode);
   await tap('back');assert.deepEqual(await ticks(),mode==='select'?['000267','000306','000430']:['000267','000306']);
   await shot('08-returns-'+mode);await tap('pig','000430');assert.match(await live('.sheet').last().innerText(),/Unit 7/);
  }
 });
 await check('Search offers the same transfer choices and preserves the original text on return',async()=>{
  await walk();await tap('search');await live('[data-find-input]').fill('000430');await shot('09-find-outside');await choose('select');
  await tap('study-confirm');await tap('back');assert.equal(await live('[data-find-input]').inputValue(),'000430');await shot('10-find-return');
  await tap('back');assert.deepEqual(await ticks(),['000430']);
 });
 await check('Pen scan only ticks the target pen; another pen uses the fixed destination',async()=>{
  await walk();await tap('pen-detail','C1');await shot('11-scan-entry-pen');await tap('scan-pen','C1');await read();await read();await read();
  assert.deepEqual(await ticks(),['000267']);await shot('12-pen-scan');
  await tap('study-move','000306');await shot('13-other-pen');await tap('study-move-mode','select');
  assert.equal(await live(action('study-target')).count(),0);await shot('14-fixed-pen');
  await tap('study-confirm');await tap('back');assert.deepEqual(await ticks(),['000267','000306']);await shot('15-fixed-pen-return');
  await tap('back');await view('pen-detail');
 });
 for(const outcome of ['offline','denied','failed','uncertain']){
  await check(`A move that is ${outcome} does not change the selection`,async()=>{
   await walk('studyMove='+outcome);await outsideRead();await choose('select');await tap('study-confirm');await shot('16-'+outcome);
   await tap('back');if(['offline','failed'].includes(outcome)){await tap('back');await tap('back');}
   assert.deepEqual(await ticks(),['000267','000306']);assert.equal(await live(action('study-move','000430')).count(),1);
   if(outcome==='uncertain'){await tap('study-move','000430');assert.equal(await live(action('study-confirm')).count(),0);}
  });
 }
 await check('No connected reader offers no scan actions',async()=>{
  await walk('scanner=off');await tap('scan');assert.equal(await live(action('actions')).count(),0);await shot('17-no-reader');
 });
 await check('Farrowing pen keeps Note, Feed and Fault; returns to the room',async()=>{
  await open('farrowing-astra-concept','screen=farrowing.room&lang=en');
  await tap('room-pen-detail','B1');assert.equal(await live(action('pen-observe')).count()+await live(action('tick-pen')).count(),0);await shot('21-farrowing-pen');
  await tap('room-pen-note');await live('[data-pen-field="note"]').last().fill('Check this pen before the next feed.');await shot('22-farrowing-note');
  await tap('room-pen-save-note');await tap('room-pen-read-note');await shot('22a-farrowing-note-read');
  await tap('room-pen-note');await live('[data-pen-field="note"]').last().fill('Check the pen after the next feed.');await tap('room-pen-save-note');await view('roomPenReadNote');
  await tap('room-pen-close-note');await view('roomPenDetail');
  await tap('room-pen-fault');await shot('23-farrowing-fault');await live('[data-picker-key="pen:device"]').last().click();await tap('picker-select','Feeding station');
  await live('[data-pen-field="description"]').last().fill('The gate is stuck.');await tap('room-pen-save-fault');
  await tap('room-pen-fault');await live('[data-picker-key="pen:device"]').last().click();await tap('picker-select','Feeding station');await view('roomPenFaultRecord');
  assert.match(await live('.sheet').last().innerText(),/The gate is stuck/);await shot('23a-farrowing-resolve');
  await tap('room-pen-resolve-fault');await view('roomPenDetail');
  await tap('room-pen-log');assert.match(await live('.sheet').last().innerText(),/fault resolved/i);await shot('24-farrowing-log');await tap('room-back');
  await tap('room-pen-feed');await shot('25-farrowing-feed');await tap('room-back');await tap('room-back');
  await page.locator('[data-card="0"][data-view="room"]').waitFor({state:"attached"});
 });
 await check('Current tasks and Actions both open the matching Farrowing record and return to their entry',async()=>{
  for(const from of ['card','actions']){
   await walk('','batch-farrowing');await tap('pig','000281');if(from==='actions')await tap('pig-actions');
   await shot('31-farrowing-from-'+from);await tap('open-farrowing');
   await page.waitForURL('**/farrowing-astra-concept.html?**');
   await view('count');assert.match(await phone().innerText(),/000281/);await shot('32-target-sow');
   await tap('close');await page.waitForURL('**/inspection-astra-concept.html?**');
   await view(from==='actions'?'actions':'pig');await shot('33-farrowing-back-'+from);
  }
 });
 for(const [entry,key] of [['to-treat','treat'],['monitoring','monitor']]){
  await check(`Home ${entry} opens exactly the row's pig and goes back to the same search`,async()=>{
   await open('home-astra-prototype',`section=gestation&sheet=${key}&screen=workbench.${entry}&lang=en`);
   const row=live(action('marked-pig')).first(),id=await row.getAttribute('data-value');
   await live('[data-mk-search]').fill(id);const hit=live(action('marked-pig',id));const condition=await hit.locator('.st-condition-name').innerText();await shot('41-home-'+key);await hit.click();
   const record=page.frameLocator('.atlas-phone iframe.home-pig-frame').locator('[data-card="0"] .phone');
   await record.locator(action('pig-actions')).waitFor();assert.match(await record.innerText(),new RegExp(id));assert.ok((await record.innerText()).includes(condition));await shot('42-home-pig-'+key);
   await record.locator(action('back')).last().click();assert.equal(await live('[data-mk-search]').inputValue(),id);
  });
 }
 await check('After saving from the scan batch, continue on the same selection',async()=>{
  await walk();await tap('scan');await read();await read();await tap('actions');await note('Check these two tomorrow.');
  await view('scan');assert.deepEqual(await ticks(),['000267','000306']);await shot('51-saved-scan');
 });
 await check('After saving from Selected, continue on the same selection',async()=>{
  await walk();await live('[data-pig-select="000254"]').check();await live('[data-pig-select="000267"]').check();
  await tap('review-sheet');await tap('actions');await note('Check the selected pigs tomorrow.');
  await view('review');assert.deepEqual(await ticks(),['000254','000267']);await shot('52-saved-selected');
 });
 await check('From a pig record, save only for that pig and preserve the parent selection',async()=>{
  await walk();await tap('scan');await read();await read();await tap('pig','000306');await tap('pig-actions');
  await note('Check only this pig tomorrow.');await view('pig');assert.match(await phone().innerText(),/Check only this pig tomorrow/);await shot('53-saved-single');
  await tap('back');assert.deepEqual(await ticks(),['000267','000306']);
  await tap('pig','000267');assert.doesNotMatch(await live('.sheet').last().innerText(),/Check only this pig tomorrow/);
 });
 assert.deepEqual(errors,[]);
 await fs.writeFile(new URL('verification.json',here),JSON.stringify({status:'canvas only',base:'af640dd3',checks},null,2)+'\n');
}finally{await browser.close();}
