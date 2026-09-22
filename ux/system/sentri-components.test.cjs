const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const context = {};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'sentri-components.js'),'utf8'), context);
const ui = context.SentriUI;

test('titles escape supplied text while preserving a caller-owned action', () => {
  const result = ui.heading({title:'<tag>',description:'A & B',meta:'"4"',action:'<button data-action="history">View log</button>'});
  assert.match(result,/&lt;tag&gt;/);
  assert.match(result,/A &amp; B/);
  assert.match(result,/data-action="history"/);
  assert.doesNotMatch(result,/<tag>/);
});
test('facts distinguish zero from unknown and preserve caller-owned links', () => {
  const result = ui.facts([{label:'Known',value:0},{label:'Unknown',value:null},{label:'Link',valueHtml:'<a href="#record">Record</a>'}]);
  assert.match(result,/<dd>0<\/dd>/);
  assert.match(result,/<dd>—<\/dd>/);
  assert.match(result,/<a href="#record">Record<\/a>/);
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
