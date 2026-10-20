const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const context = {};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../design-system/components/bundle.js'),'utf8'), context);
const ui = context.SentriUI;

test('titles escape supplied text while preserving a caller-owned action', () => {
  const result = ui.heading({title:'<tag>',description:'A & B',meta:'"4"',action:'<button data-action="history">View log</button>'});
  assert.match(result,/&lt;tag&gt;/);
  assert.match(result,/A &amp; B/);
  assert.match(result,/data-action="history"/);
  assert.doesNotMatch(result,/<tag>/);
});
test('facts distinguish zero from unknown, keep markup, and refuse a control in a value', () => {
  const result = ui.facts([{label:'Known',value:0},{label:'Unknown',value:null},{label:'Tag',valueHtml:'<span class="id">000254</span>'},{label:'Act',valueHtml:'<a href="#record">Record</a>'},{label:'Id',value:'000254',mono:true}]);
  assert.match(result,/<dd>0<\/dd>/);
  assert.match(result,/<dd>—<\/dd>/);
  assert.match(result,/<span class="id">000254<\/span>/);
  assert.match(result,/st-fact-id/);
  assert.doesNotMatch(result,/<a href|<button/);
});
test('heading: page and group carry no icon, meta or action; panel is its own kind; the action link is a standard text button', () => {
  const page = ui.heading({title:'Room',kind:'page',icon:'<svg></svg>',meta:'x',action:'<button>y</button>',description:'d'});
  assert.match(page,/data-kind="page"/);
  assert.doesNotMatch(page,/<svg|st-heading-meta|<button/);
  assert.match(ui.heading({title:'T',kind:'panel'}),/data-kind="panel"/);
  const link = ui.heading({title:'Litter',action:{label:'View log',action:'history',ariaLabel:'Open the log'}});
  assert.match(link,/class="st-text-action/);
  assert.match(link,/data-action="history"/);
  assert.match(link,/aria-label="Open the log"/);
});
test('log: day labels, one stamp, no repeated words, corrected entries show the original', () => {
  const now = '2026-10-10T12:00';
  assert.equal(ui.logDay('2026-10-10T08:00',{now}),'Today');
  assert.equal(ui.logDay('2026-10-09',{now}),'Yesterday');
  assert.equal(ui.logDay('2026-10-06',{now}),'Tue');
  assert.equal(ui.logDay('2026-07-08',{now}),'Jul 8');
  assert.equal(ui.logStamp('2026-10-10T07:14','G. Hansen'),'07:14 · G.H');
  assert.equal(ui.logStamp('2026-10-10','')  ,'');
  const html = ui.log([{label:'Today',entries:[{title:'Farrowing finished',detail:'farrowing finished'},{title:'Alive 9 → 8',corrected:true,was:'Alive 9',at:'09:41',by:'G.H'}]}]);
  assert.equal((html.match(/Farrowing finished/g)||[]).length,1);
  assert.match(html,/data-corrected/);
  assert.match(html,/Alive 9<\/p>/);
  assert.match(html,/09:41 · G\.H/);
  const groups = ui.logGroups([{title:'a',at:'2026-10-10T07:00'},{title:'b',at:'2026-10-10T09:00'},{title:'c',at:'2026-10-09T10:00'},{title:'u'}],{now});
  assert.equal(groups.map(g=>g.label+':'+g.entries.map(e=>e.title).join('')).join('|'),'Today:ba|Yesterday:c|Earlier:u');
});
test('informational rows do not claim navigation; disabled actions retain semantics', () => {
  const info = ui.row({title:'Miscarriages',trailing:'0'});
  assert.doesNotMatch(info,/<button|st-row-chevron/);
  const action = ui.row({title:'Open',action:'pig',value:'12"34',disabled:true,attrs:{'aria-label':'Open pig','onclick':'unsafe'}});
  assert.match(action,/data-value="12&quot;34"/);
  assert.match(action,/disabled aria-disabled="true"/);
  assert.match(action,/aria-label="Open pig"/);
  assert.doesNotMatch(action,/onclick/);
});
test('logs retain source ordering, correction text and attachments', () => {
  const result = ui.log([{label:'Today',entries:[{title:'Second',detail:'Correction',extraHtml:'<button data-action="photo">Photo</button>'},{title:'First'}]}]);
  assert.ok(result.indexOf('Second') < result.indexOf('First'));
  assert.match(result,/Correction/);
  assert.match(result,/data-action="photo"/);
  assert.match(ui.log([{label:'Today',entries:[]}]),/No activity recorded yet/);
});
test('category footer preserves navigation actions and one current category', () => {
  const result=ui.categoryFooter({categories:[{id:'production',label:'Production'},{id:'health',label:'Health'}],active:'health',backAction:'return-pig'});
  assert.match(result,/data-action="return-pig"/);
  assert.match(result,/data-value="health" aria-current="location"/);
  assert.equal((result.match(/aria-current="location"/g)||[]).length,1);
  assert.equal((result.match(/<span>Back<\/span>/g)||[]).length,1);
  assert.match(ui.categoryFooter({categories:[{id:'first',label:'First'}],active:'missing'}),/data-value="first" aria-current="location"/);
});

test('chooser groups remain flat and expose meaningful accessible subtitles', () => {
 const html=ui.pickerOptions({options:[['mL','mL','Millilitres','Liquid'],['mg','mg','Milligrams','Weight'],['g','g','Grams','Weight']],selected:'mg'});
 assert.equal((html.match(/class="st-panel st-choice-panel"/g)||[]).length,2);
 assert.equal((html.match(/data-ds="ChoiceList"/g)||[]).length,5);
 assert.match(html,/aria-label="Liquid"/);assert.match(html,/aria-label="Weight"/);
 assert.equal((html.match(/data-mode="single"/g)||[]).length,3);
 assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 assert.doesNotMatch(html,/open-picker|chevron/);
});
test('short choices use the shared muted surface and catalogues use flat surfaces', () => {
 assert.match(ui.pickerOptions({options:[['a','First'],['b','Second','Supporting detail']]}),/class="st-panel st-choice-panel"/);
 assert.match(ui.chooserList('<button>Medicine</button>'),/data-chooser-tone="flat"/);
});
