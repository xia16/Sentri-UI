const test = require('node:test');
const assert = require('node:assert/strict');
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
  assert.match(html, /Disease category/);
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

test('single and bulk health recording use the same review experience', () => {
  const single = model.seed();
  model.openBulkAction(single, 'health', ['000267']);
  const singleHtml = model.overlay(single);
  assert.match(singleHtml, /sheet bulk-action-sheet/);
  assert.match(singleHtml, /pig-review-card bulk-pigs is-short/);
  assert.match(singleHtml, />1 selected</);
  assert.match(singleHtml, /bulk-pig-row is-single/);
  assert.doesNotMatch(singleHtml, /data-bulk-include/);
  assert.match(singleHtml, /aria-expanded="true"[^>]*data-action="bulk-toggle-controls"/);

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
    assert.match(html, /aria-label="Choose conditions"/);
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
