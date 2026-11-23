// Walk and capture the implemented prototype. Run from the Inspection worktree.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { playwright } from '../../../scripts/playwright-path.mjs';
import { routeFonts } from '../../../scripts/font-route.mjs';
const origin=process.env.SENTRI_REVIEW_URL||'http://127.0.0.1:4319';
const here=new URL('./',import.meta.url);
const root=new URL('../../../',here);
const browser=await playwright().chromium.launch();
const lang=process.env.SENTRI_REVIEW_LANG||'en';
const checkOnly=process.argv.includes('--check');
const width=Number(process.env.SENTRI_REVIEW_WIDTH)||390;
const ctx=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
if(width!==390)await ctx.addInitScript(w=>{
 document.addEventListener('DOMContentLoaded',()=>{
  const layout=document.createElement('style');layout.textContent=`html.atlas-bare,html.atlas-bare body,html.atlas-bare .atlas-phone{width:${w}px!important}`;
  document.head.append(layout);
 },{once:true});
},width);
await routeFonts(ctx,fileURLToPath(root));
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
const open=async (file,query)=>{await page.goto(origin+'/ux/system/'+file+'.html?layout=focus&'+query.replace(/lang=en/g,'lang='+lang));if(query.includes('screen='))await page.locator('html.atlas-ready').waitFor({timeout:12500});};
const walk=(q='',s='walk')=>open('inspection-astra-concept','screen=inspection.'+s+'&lang=en&movePens=large&'+q);
const shot=async (id)=>{if(checkOnly)return;await phone().screenshot({path:new URL('screenshots/'+id+'.jpg',here).pathname,type:'jpeg',quality:82,animations:'disabled'});};
const check=async (name,go)=>{await go();checks.push(name);console.log('PASS',name);};
async function outsideRead(){await tap('scan');await read();await read();await read();assert.deepEqual(await ticks(),['000267','000306']);}
async function choose(mode,destination='C1'){await tap('lookup-exception','000430');await tap('lookup-move-mode',mode);await tap('lookup-move-pen',destination);await tap('lookup-move-review');}
const chooseMovePen=async code=>{await tap('move-pen',code);await tap('move-review-target');};
async function note(txt){await tap('note');await live('[data-bulk-key="note"]').last().fill(txt);await tap('bulk-save');}
try{
 await check('Unit scan groups local pigs in their own pens; outside tag has no tick; unknown and repeated reads do not add pigs',async()=>{
  await walk();await outsideRead();await shot('01-unit-scan');
  await tap('lookup-exception','000430');await tap('lookup-exception-record');await view('pig');assert.match(await live('.sheet').last().innerText(),/Unit 6|6\s*单元/);await shot('02-outside-record');await tap('back');
  await read();assert.deepEqual(await ticks(),['000267','000306']);await shot('03-unknown');
  await read();assert.equal(await live('[data-scan-tag="000306"]').count(),1);assert.deepEqual(await ticks(),['000267','000306']);
  await tap('lookup-exception','000430');await shot('04-outside-choices');await tap('lookup-move-mode','select');
  assert.equal(await live(action('lookup-move-pen')).count(),48);await shot('05-choose-destination');
  assert.ok(await live('.sheet[data-presentation="page"] > .sheet-body > .st-pen-map').isVisible());
  assert.equal(await live(action('lookup-move-review')).getAttribute('aria-disabled'),'true');
  await tap('lookup-move-pen','C12');await view('lookup-move-pens');
  assert.equal(await live(action('lookup-move-pen','C12')).getAttribute('aria-pressed'),'true');await shot('05b-selected-C12');
  await tap('lookup-move-review');await view('lookup-move-confirm');await shot('06-confirm-C12');await tap('lookup-move-change');
  assert.equal(await live(action('lookup-move-pen','C12')).getAttribute('aria-pressed'),'true');
  await tap('lookup-move-pen','C11');await tap('back');await view('lookup-move-confirm');
  assert.match(await live(action('lookup-move-change')).innerText(),/C12/);
  await tap('back');await tap('back');await tap('back');assert.deepEqual(await ticks(),['000267','000306']);
 });
 await check('Move-only and move-and-select change the location; only the second adds a tick',async()=>{
  for(const mode of ['move','select']){
   await walk();await outsideRead();await choose(mode);await shot('06-confirm-'+mode);await tap('lookup-move-confirm');
   assert.doesNotMatch(await live('.sheet').last().innerText(),/selection unchanged|moved and selected|勾选未变|勾选不变|已移入并选中/i);
   await shot('07-receipt-'+mode);
   await tap('back');assert.deepEqual(await ticks(),mode==='select'?['000267','000306','000430']:['000267','000306']);
   await shot('08-returns-'+mode);await tap('pig','000430');assert.match(await live('.sheet').last().innerText(),/Unit 7|7\s*单元/);
  }
 });
 await check('Search offers the same transfer choices and preserves the original text on return',async()=>{
  await walk();await tap('search');await live('[data-find-input]').fill('000430');await shot('09-find-outside');await choose('select');
  await tap('lookup-move-confirm');await tap('back');assert.equal(await live('[data-find-input]').inputValue(),'000430');await shot('10-find-return');
  await tap('back');assert.deepEqual(await ticks(),['000430']);
 });
 await check('Pen page has no scan entry; the walk dock still scans the whole unit',async()=>{
  await walk();await tap('pen-detail','C1');assert.equal(await live(':is([data-action="scan"], [data-action="scan-pen"])').count(),0);await shot('11-inspection-pen');
  await tap('back');await tap('scan');await read();await read();
  assert.deepEqual(await ticks(),['000267','000306']);
 });
 await check('The API error uses a notice toast and keeps the review and selection',async()=>{
  await walk('moveResult=error');await outsideRead();await choose('select');await tap('lookup-move-confirm');
  await view('lookup-move-confirm');assert.match(await live('.st-toast').innerText(),/Destination pen is full|目标栏已满/);
  assert.match(await live(action('lookup-move-change')).innerText(),/C1/);await shot('16-error');
  await tap('lookup-move-change');await tap('back');await view('lookup-move-confirm');
  await tap('back');await tap('back');await tap('back');
  assert.deepEqual(await ticks(),['000267','000306']);assert.equal(await live(action('lookup-exception','000430')).count(),1);
 });
 await check('Selected scan rows keep their background and a queued move returns silently',async()=>{
  await walk('moveResult=offline');await outsideRead();
  await live('[data-scan-tag="000306"]').waitFor();
  assert.equal(await live('[data-scan-tag]:has(:checked)[data-arrival="on"]').count(),0);
  const row=live('[data-scan-tag="000306"]'),box=row.locator('input[type=checkbox]');
  const before=await row.evaluate(el=>getComputedStyle(el).backgroundColor);
  await box.uncheck();
  assert.equal(await row.evaluate(el=>getComputedStyle(el).backgroundColor),before);
  await box.check();
  await choose('select','C12');await tap('lookup-move-confirm');await view('scan');
  assert.equal(await live('.st-toast').count(),0);
  assert.deepEqual(await ticks(),['000267','000306']);
  await shot('16-queued');
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  assert.deepEqual(await ticks(),['000267','000306','000430']);
  await shot('16-synced');
 });
 await check('From a pen, choose identities or scan and count; a tagged-only move keeps the pen’s group conditions',async()=>{
  await walk('penmap=long');await tap('pen-detail','D4');await tap('pen-move','D4');await view('move-pigs');
  await tap('move-read');await read();
  assert.equal(await live('input[data-action="move-pig"][value="000801"]').isChecked(),true);
  await tap('move-read-stop');await tap('move-next');await view('move-to');
  assert.equal(await live('.st-pen-tile[data-pen="D4"]').isDisabled(),true);
  await chooseMovePen('C4');await tap('move-save');await view('pen-detail');await tap('back');
  assert.match(await live('[data-pen="D4"]').first().innerText(),/Coughing|咳嗽/);
 });
 await check('From a pen, enter one total for all pigs without ID in the source pen',async()=>{
  await walk('moveFixture=batches&penmap=standard');await tap('pen-detail','D4');await tap('pen-move','D4');
  const count=live(action('move-count-open','D4'));
  assert.equal(await count.innerText(),'0');
  await live(action('move-count-step','D4')+'[data-step="1"]').click();
  assert.equal(await count.innerText(),'1');await shot('61-move-pick');
  await tap('move-count-open','D4');
  assert.ok(await live('.sheet[role="dialog"] [data-ds="Numpad"]').isVisible());
  assert.equal(await live(action('move-next')).count(),0);
  await live('[data-action="move-number"][data-key="5"]').click();await shot('62-move-count');
  await live('[data-action="move-number"][data-key="9"]').click();
  assert.equal(await live(action('move-number-done')).getAttribute('aria-disabled'),'true');
  await live('[data-action="move-number"][data-key="back"]').click();
  await tap('move-number-done');assert.equal(await count.innerText(),'5');
  await live(action('move-count-step','D4')+'[data-step="-1"]').click();
  assert.equal(await count.innerText(),'4');
  await tap('move-count-open','D4');await tap('move-number-all');
  assert.match(await live('.st-measure-value').innerText(),/14/);
  await tap('back');assert.equal(await count.innerText(),'4');
  await tap('move-next');await view('move-to');await tap('back');
  assert.equal(await count.innerText(),'4');
  await tap('move-next');await tap('move-pen','C4');await shot('65a-move-selected-pen');
  await tap('move-review-target');await shot('65-move-target');
 });
 await check('A walk selection goes straight to the destination and moves the correct quantities across any source batches',async()=>{
  await walk('penmap=long&moveFixture=batches');
  await live('[data-pig-select="000254"]').check();
  const number=live('[data-notags-field="D4"]');
  assert.equal(await number.innerText(),'14');await shot('60-list-count');
  await number.click();await view('notags-count');
  assert.ok(await live('.sheet[role="dialog"] [data-ds="Numpad"]').isVisible());
  await live('[data-action="notags-pad"][data-key="5"]').click();await shot('60a-list-count-sheet');
  await tap('notags-count-back');assert.equal(await number.innerText(),'14');
  assert.equal(await live('[data-notags-select="D4"]').isChecked(),false);
  await number.click();assert.match(await live('.st-measure-value').innerText(),/5/);
  await tap('notags-count-done');await tap('actions');await tap('transfer');await view('move-to');
  for(const pen of ['C1','D4','C5','C6'])assert.equal(await live('.st-pen-tile[data-pen="'+pen+'"]').isDisabled(),true);
  await live('.st-pen-whole-toggle').click();await shot('64-move-whole-room');
  await live('.st-pen-group[data-from="C21"]').click();await chooseMovePen('C30');
  const review=await live('.move-review').innerText();
  assert.match(review,/000254/);assert.match(review,/5 pigs without ID|无身份猪 5 头/);
  assert.doesNotMatch(review,/Batch 1[89]|批次 1[89]/);
  assert.match(await live(action('move-change')).innerText(),/C30/);await shot('63-move-review');
  await tap('move-change');await tap('move-choose-room');await tap('move-room','8');
  await tap('back');assert.match(await live(action('move-change')).innerText(),/(?:Unit 7|7\s*单元) · C30/);
  await tap('move-change');
  await chooseMovePen('C4');
  await tap('move-save');await view('list');await shot('66-move-after');
  const list=await live('.inspect-list').innerText();
  assert.doesNotMatch(list,/Coughing|咳嗽/);
  assert.match(list,/Appetite|食欲/);
  for(const [code,count] of [['D4','9'],['C4','7']]) {
   assert.equal(await live(`[data-notags-field="${code}"]`).innerText(),count);
  }
  await tap('pen-detail','D4');await tap('pen-log','D4');
  assert.match(await live('.sheet').last().innerText(),/Moved out|移出/);await shot('67-move-out-log');
  await tap('back');await tap('back');await tap('pen-detail','C4');await tap('pen-log','C4');
  assert.match(await live('.sheet').last().innerText(),/Moved in|移入/);await shot('68-move-in-log');
 });
 await check('From one pig’s record, Move takes that pig only and returns to its record with the new location',async()=>{
  await walk();await live('[data-pig-select="000267"]').check();
  await tap('pig','000281');await tap('pig-actions');await tap('transfer');await view('move-to');await shot('69-move-single');
  await tap('move-choose-room');await live('[data-move-room-search]').fill('8');await shot('70-move-room');await tap('move-room','8');
  await chooseMovePen('A2');await tap('move-save');await view('pig');
  assert.match(await live('.sheet').last().innerText(),/Unit 8|8\s*单元/);
  await tap('back');assert.deepEqual(await ticks(),['000267']);
 });
 await check('A single movable pig in a pen opens the map directly',async()=>{
  await walk('penmap=standard');
  await live('[data-pig-select="000254"]').check();await live('[data-pig-select="000267"]').check();
  await tap('actions');await tap('transfer');await chooseMovePen('C4');await tap('move-save');await view('list');
  await tap('pen-detail','C1');await tap('pen-move','C1');
  await view('move-to');
  assert.equal(await live('.st-pen-tile[data-pen="C1"]').isDisabled(),true);
  await tap('back');await view('pen-detail');
  await walk('penmap=single','walk-single');await tap('search');await live('[data-find-input]').fill('000430');
  await tap('lookup-exception','000430');await tap('lookup-move-mode','move');
  assert.deepEqual(await live('.st-pen-tile').evaluateAll(tiles=>tiles.map(t=>t.dataset.pen)),['C1']);
  assert.equal(await live('.st-pen-whole-toggle').count(),0);
 });
 await check('Scan selection and Selected review open the same embedded destination map',async()=>{
  await walk('penmap=standard');await outsideRead();
  await tap('actions');await tap('transfer');await view('move-to');
  assert.ok(await live('.move-page .st-pen-map').isVisible());
  await tap('back');await tap('back');await view('scan');
  await tap('back');await tap('review-sheet');await tap('actions');await tap('transfer');await view('move-to');
  assert.ok(await live('.move-page .st-pen-map').isVisible());
 });
 await check('Ear notch stays individually selectable and cancel leaves the source untouched',async()=>{
  await walk('moveFixture=batches');await tap('pen-detail','D4');await tap('pen-move','D4');
  await live('[data-move-pig-search]').fill('2-5');
  await live('input[data-action="move-pig"][value="sample-notch"]').check();
  await tap('move-next');await chooseMovePen('C4');assert.match(await live('.move-review').innerText(),/2-5/);
  await tap('back');await tap('back');await tap('back');await tap('back');await view('list');
  assert.match(await live('[data-pen="D4"]').first().innerText(),/Coughing|咳嗽/);
 });
 await check('Farrowing sow and piglet Move reuse the pen picker',async()=>{
  await open('farrowing-astra-concept','screen=farrowing.count&lang=en&penmap=long');
  await tap('sowActions');
  const frame=page.frameLocator('[data-card="0"] .sow-detail-frame').locator('[data-card="0"] .phone');
  const frameTap=(a,v)=>frame.locator(action(a,v)+':not([inert] *)').last().click();
  await frameTap('sow-host-action','transfer');
  await frame.locator('.st-pen-whole-toggle').click();await shot('71-move-sow');
  await frame.locator('.st-pen-whole-toggle').click();
  await frameTap('move-pen','B4');await frameTap('move-review-target');await frameTap('save-transfer');
  await frame.locator(':scope > .sheet').filter({hasText:'B4'}).waitFor();
  await open('farrowing-astra-concept','screen=farrowing.piglets-pen&lang=en&penmap=long');
  await view('allocPen');await live('.st-pen-whole-toggle').click();await shot('72-move-piglets');
  await tap('allocRooms');await tap('allocRoom','8');await live(action('allocPenPick')).first().click();
  await tap('allocPenNext');
  await tap('allocPenSave');await view('pigletList');await shot('73-move-piglets-after');
 });
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
  await tap('room-pen-log');assert.match(await live('.sheet').last().innerText(),/fault resolved|故障.*(?:解除|解决)/i);await shot('24-farrowing-log');await tap('room-back');
  await tap('room-pen-feed');await shot('25-farrowing-feed');await tap('room-back');await tap('room-back');
  await page.locator('[data-card="0"][data-view="room"]').waitFor({state:"attached"});
 });
 await check('Current tasks and Actions both open the matching Farrowing record and return to their entry',async()=>{
  for(const from of ['card','actions']){
   await walk('','batch-farrowing');await tap('pig','000281');if(from==='actions')await tap('pig-actions');
   await shot('31-farrowing-from-'+from);await tap('open-farrowing');await view('farrowing-record');
   const record=page.frameLocator('iframe[data-farrowing-record]').locator('[data-card="0"][data-view="count"] .phone');
   await record.waitFor();assert.match(await record.innerText(),/000281/);await shot('32-target-sow');
   await record.locator(action('close')).last().click();
   await view(from==='actions'?'actions':'pig');await shot('33-farrowing-back-'+from);
  }
 });
 await check('Entering and leaving the sow sheet preserves the Inspection selection and a Farrowing draft',async()=>{
  await walk('','batch-farrowing');await live('[data-pig-select="000267"]').check();await tap('pig','000281');
  const frame=()=>page.frameLocator('iframe[data-farrowing-record]').locator('[data-card="0"] .phone');
  await tap('open-farrowing');await frame().locator(action('bornAlive','1')).click();await frame().locator(action('saveVisit')).waitFor();
  await frame().locator(action('close')).last().click();await view('pig');await tap('open-farrowing');
  await frame().locator(action('saveVisit')).waitFor();await frame().locator(action('clearVisit')).click();
  await frame().locator(action('close')).last().click();await view('pig');await tap('back');assert.deepEqual(await ticks(),['000267']);
 });
 for(const [entry,key] of [['to-treat','treat'],['monitoring','monitor']]){
  await check(`Home ${entry} opens exactly the row's pig and goes back to the same search`,async()=>{
   await open('home-astra-prototype',`section=gestation&sheet=${key}&screen=workbench.${entry}&lang=en`);
   const row=live(action('marked-pig')).first(),id=await row.getAttribute('data-value');
   await live('[data-mk-search]').fill(id);const hit=live(action('marked-pig',id));const condition=await hit.locator('.st-condition-name').innerText();await shot('41-home-'+key);await hit.click();
   const record=page.frameLocator('.atlas-phone iframe.home-pig-frame').locator('[data-card="0"] .phone');
   await record.locator(action('pig-actions')).waitFor();assert.match(await record.innerText(),new RegExp(id));if(lang==='en')assert.ok((await record.innerText()).includes(condition));else assert.ok(await record.locator('[data-action="finding"]').count());await shot('42-home-pig-'+key);
   await record.locator(action('back')).last().click();assert.equal(await live('[data-mk-search]').inputValue(),id);
  });
 }
 await check('After saving from the scan batch, continue on the same selection',async()=>{
  await walk();await tap('scan');await read();await read();await tap('actions');await note('Check these two tomorrow.');
  await view('scan');assert.deepEqual(await ticks(),['000267','000306']);await shot('51-saved-scan');
 });
 await check('Batch treatment returns to Scan and retains the selected pigs, online and offline',async()=>{
  for(const connection of ['online','offline']){
   await walk('connection='+connection);await tap('scan');await read();await read();await tap('actions');await tap('treatment');
   await tap('medicine-open');await tap('medicine-select','amoxicillin');await live('[data-bulk-key="dose"]').last().fill('2');await tap('bulk-save');
   await view('scan');assert.deepEqual(await ticks(),['000267','000306']);
   await live(`.st-toast--${connection==='offline'?'offline':'done'}`).waitFor();await shot('54-treatment-'+connection);
  }
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
 if(!checkOnly)await fs.writeFile(new URL('verification.json',here),JSON.stringify({source:'implemented prototype',transfer:'simulated receipts',checks},null,2)+'\n');
}finally{await browser.close();}
