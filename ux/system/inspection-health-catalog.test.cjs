const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
require('./astra-surfaces.js');
require('./inspection-astra-concept.js');
const model = globalThis.InspectionStudy;

test('translated health catalogue preserves the supplied hierarchy', () => {
  const diseases = model.catalog.filter(item => item.kind === 'Disease');
  const symptoms = model.catalog.filter(item => item.kind === 'Symptom');
  assert.equal(diseases.length, 60);
  assert.equal(symptoms.length, 59);
  assert.deepEqual(new Set(diseases.map(item => item.group)), new Set([
    'Respiratory diseases',
    'Gastrointestinal diseases',
    'Reproductive and neonatal diseases',
    'Skin and external diseases',
    'Nervous system diseases',
    'Systemic diseases',
    'Musculoskeletal diseases',
    'Nutritional and metabolic diseases',
    'Other diseases and conditions'
  ]));
  assert.deepEqual(new Set(symptoms.map(item => item.section)), new Set([
    'General appearance',
    'Body area',
    'Body system'
  ]));
});

test('health search matches labels, groups and abbreviations', () => {
  const context = model.seed();
  context.selected.add('000254');
  model.openBulkAction(context, 'health');
  context.form.kind = 'Disease';

  context.form.search = 'PRRS';
  assert.match(model.healthList(context), /Porcine reproductive and respiratory syndrome/);
  context.form.search = 'metabolic';
  assert.match(model.healthList(context), /Vitamin D deficiency/);
  context.form.kind = 'Symptom';
  context.form.search = 'drooling';
  assert.match(model.healthList(context), /Excessive salivation/);
});

test('health picker drills from categories to findings', () => {
  const context = model.seed();
  context.selected.add('000254');
  model.openBulkAction(context, 'health');
  context.form.kind = 'Disease';

  let html = model.healthList(context);
  assert.match(html, /Respiratory diseases/);
  assert.doesNotMatch(html, /Porcine reproductive and respiratory syndrome/);
  model.handleRecordAction(context, 'health-catalog-group', 'Respiratory diseases');
  html = model.healthList(context);
  assert.match(html, /Back to categories/);
  assert.match(html, /Porcine reproductive and respiratory syndrome/);
  assert.doesNotMatch(html, /<small>Respiratory diseases<\/small>/);

  context.form.kind = 'Symptom';
  context.form.catalogGroup = '';
  context.form.catalogSection = '';
  html = model.healthList(context);
  assert.match(html, /General appearance/);
  assert.doesNotMatch(html, />Body area</);
  assert.match(html, /Limbs/);
  assert.match(html, /Tail/);
  assert.doesNotMatch(html, /Weakness or unsteady stance/);
  model.handleRecordAction(context, 'health-catalog-group', 'Limbs');
  assert.match(model.healthList(context), /Lameness/);
  model.handleRecordAction(context, 'health-catalog-back', '');
  assert.match(model.healthList(context), /Tail/);
  assert.match(model.healthList(context), /General appearance/);
});

test('single health uses a direct form while bulk keeps the list', () => {
  const single = model.seed();
  model.openBulkAction(single, 'health', ['000267']);
  const singleHtml = model.overlay(single);
  assert.match(singleHtml, /sheet single-action-sheet/);
  assert.match(singleHtml, /000267/);
  assert.match(singleHtml, /data-action="bulk-pick-health"/);
  assert.doesNotMatch(singleHtml, /bulk-pigs|bulk-pig-row|bulk-toggle-controls|1 selected/);

  const bulk = model.seed();
  model.openBulkAction(bulk, 'health', ['000254', '000267']);
  const bulkHtml = model.overlay(bulk);
  assert.match(bulkHtml, /sheet bulk-action-sheet/);
  assert.match(bulkHtml, /pig-review-card bulk-pigs is-short/);
  assert.match(bulkHtml, />2 selected</);
  assert.equal((bulkHtml.match(/data-bulk-include/g) || []).length, 2);
});

test('condition picker uses the same full-height drawer for single and bulk records', () => {
  const sizes = [];
  for (const subjects of [['000267'], ['000254', '000267']]) {
    const context = model.seed();
    model.openBulkAction(context, 'health', subjects);
    model.handleRecordAction(context, 'bulk-pick-health', '');
    const html = model.overlay(context);
    sizes.push(html.match(/health-picker-step" data-size="([^"]+)"/)?.[1]);
    assert.match(html, /aria-label="Select conditions"/);
    assert.match(html, /health-picker-step" data-size="long"/);
  }
  assert.deepEqual(sizes, ['long', 'long']);
});

test('a custom condition requires a category, persists for reuse and can be removed', () => {
  const context = model.seed();
  context.selected.add('000254');
  model.openBulkAction(context, 'health');
  context.form.kind = 'Symptom';
  context.form.search = 'Unexpected flank swelling';
  assert.match(model.healthList(context), /Add “Unexpected flank swelling”/);
  assert.equal(model.handleRecordAction(context, 'health-add-custom', 'Unexpected flank swelling'), true);
  assert.deepEqual(context.form.conditions, []);
  assert.match(model.healthList(context), /Choose a category/);
  assert.match(model.healthList(context), /Limbs/);
  assert.equal(model.handleRecordAction(context, 'health-custom-category', 'Body area|Limbs'), true);
  assert.deepEqual(context.form.conditions, ['Unexpected flank swelling']);
  assert.equal(context.customHealthCatalog['Unexpected flank swelling'].group, 'Limbs');
  const categorised = model.healthList(context);
  assert.match(categorised, /Custom · Limbs/);
  assert.match(categorised, /Remove custom symptom Unexpected flank swelling/);
  assert.ok(categorised.indexOf('Unexpected flank swelling') < categorised.indexOf('Lameness'));
  assert.equal(model.bulkActionValid(context), true);
  assert.equal(model.saveBulkAction(context), true);
  const saved = model.cases(model.pig(context, '000254')).at(-1);
  assert.equal(saved.name, 'Unexpected flank swelling');
  assert.equal(saved.kind, 'Symptom');

  context.selected.add('000267');
  model.openBulkAction(context, 'health');
  context.form.catalogSection = 'Body area';
  context.form.catalogGroup = 'Limbs';
  assert.match(model.healthList(context), /Unexpected flank swelling/);
  assert.equal(model.handleRecordAction(context, 'health-remove-custom', 'Unexpected flank swelling'), true);
  assert.equal(context.customHealthCatalog['Unexpected flank swelling'], undefined);
  assert.doesNotMatch(model.healthList(context), /Unexpected flank swelling/);
  assert.equal(model.cases(model.pig(context, '000254')).some(item => item.name === 'Unexpected flank swelling'), true);
});

test('Body system opens grouped symptoms without another navigation tier', () => {
 const c=model.seed();model.openBulkAction(c,'health',['000267']);
 model.handleRecordAction(c,'health-catalog-section','Body system');
 const html=model.healthList(c),items=model.catalog.filter(x=>x.kind==='Symptom'&&x.section==='Body system');
 for(const group of new Set(items.map(x=>x.group)))assert.ok(html.includes('<h5>'+group+'</h5>'));
 assert.equal((html.match(/data-condition=/g)||[]).length,items.length);
 assert.doesNotMatch(html,/data-action="health-catalog-group"/);
 model.handleRecordAction(c,'health-catalog-back','');
 assert.match(model.healthList(c),/data-action="health-catalog-section"/);
});
test('General appearance is not repeated in the breadcrumb', () => {
 const c=model.seed();model.openBulkAction(c,'health',['000267']);
 model.handleRecordAction(c,'health-catalog-section','General appearance');
 assert.equal((model.healthList(c).match(/General appearance/g)||[]).length,1);
});
test('single and bulk nested choosers stay drawers and preserve draft values', () => {
 for(const ids of [['000267'],['000254','000267']]){
  const c=model.seed();model.openBulkAction(c,'treatment',ids);c.form.dose='2';model.overlay(c);
  c.form.pickerKey='doseUnit';c.form.pickerReturn='treatment';c.view='picker';
  const chooser=model.overlay(c).split('<section class="sheet picker-step')[1];
  assert.match(chooser,/data-st-context="drawer"/);
  assert.doesNotMatch(chooser,/data-presentation="page"|>Choose unit</);
  assert.match(chooser,/Dose unit/);assert.equal(c.form.dose,'2');
  c.view='medicine-picker';const medicine=model.overlay(c).split('<section class="sheet picker-step')[1];
  assert.match(medicine,/data-st-context="drawer"/);assert.doesNotMatch(medicine,/data-presentation="page"/);
 }
});
test('health selections persist across categories and Done does not save the record', () => {
 const c=model.seed();model.openBulkAction(c,'health',['000267']);
 const name=model.catalog.find(x=>x.kind==='Symptom'&&x.section==='Body system').name;
 model.handleRecordAction(c,'bulk-pick-health','');c.form.conditions=[name];
 model.handleRecordAction(c,'health-catalog-section','Body system');model.handleRecordAction(c,'health-catalog-back','');
 assert.deepEqual(c.form.conditions,[name]);assert.match(model.overlay(c),/Done · 1/);
 model.handleRecordAction(c,'bulk-health-done','');assert.equal(c.view,'health');assert.deepEqual(c.form.conditions,[name]);
 assert.ok(!model.pig(c,'000267').cases.some(x=>x.name===name));
});

test('short single-choice sheets have Close but no redundant footer actions', () => {
 for(const ids of [['000267'],['000254','000267']]){
  const c=model.seed();model.openBulkAction(c,'treatment',ids);model.overlay(c);
  for(const key of ['method','doseUnit']){
   c.form.pickerKey=key;c.form.pickerReturn='treatment';c.view='picker';
   const picker=model.overlay(c).split('<section class="sheet picker-step')[1];
   assert.match(picker,/aria-label="Close chooser"/);
   assert.match(picker,/data-action="picker-select"/);
   assert.doesNotMatch(picker,/sheet-footer|data-action="back"/);
  }
 }
});

test('dosage units show Liquid and Weight subtitles without navigating deeper', () => {
 const c=model.seed();model.openBulkAction(c,'treatment',['000267']);model.overlay(c);
 c.form.pickerKey='doseUnit';c.form.pickerReturn='treatment';c.view='picker';
 const html=model.overlay(c).split('<section class="sheet picker-step')[1];
 assert.match(html,/>Liquid</);assert.match(html,/>Weight</);
 for(const unit of ['mL','mg','g'])assert.ok(html.includes('data-value="'+unit+'"'));
 assert.equal((html.match(/data-action="picker-select"/g)||[]).length,3);
});
test('medicine and health render the shared flat chooser surface', () => {
 const c=model.seed();model.openBulkAction(c,'treatment',['000267']);c.view='medicine-picker';c.form.medicineCategory='Antibiotics';
 assert.match(model.overlay(c),/class="st-choice-panel"/);
 model.openBulkAction(c,'health',['000267']);model.handleRecordAction(c,'bulk-pick-health','');
 assert.match(model.overlay(c),/class="st-choice-panel"/);
});

test('catalogue navigation uses tappable path steps and only one exit pair', () => {
 const c=model.seed();model.openBulkAction(c,'treatment',['000267']);c.view='medicine-picker';c.form.medicineCategory='Antibiotics';
 let html=model.overlay(c).split('<section class="sheet picker-step')[1];
 assert.match(html,/Chosen levels/);assert.match(html,/data-action="medicine-step"/);
 assert.doesNotMatch(html,/chooser-header-back|Close chooser/);
 model.openBulkAction(c,'health',['000267']);c.view='bulk-health-picker';c.form.conditionPath=['Symptom','General appearance'];
 html=model.overlay(c).split('<section class="sheet picker-step')[1];
 assert.match(html,/data-action="condition-step"/);
 assert.equal((html.match(/data-action="back"/g)||[]).length,1);
 assert.equal((html.match(/data-action="bulk-health-done"/g)||[]).length,1);
 assert.doesNotMatch(html,/<details|chooser-header-back|Close chooser/);
});
