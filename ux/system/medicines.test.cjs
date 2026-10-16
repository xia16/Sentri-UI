// Medicines (features/medicines): the picker's levels, recents, search, adding, remembered method and unit, and the page.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
require('./astra-surfaces.js');
require('./inspection-astra-concept.js');
const M = globalThis.InspectionStudy;

const open = (ids = ['000267'], task) => { const c = M.seed(); M.openBulkAction(c, 'treatment', ids); if (task) c.form.taskId = task; M.handleRecordAction(c, 'medicine-open', ''); return c; };
const drawer = c => { const h = M.overlay(c); return h.slice(h.lastIndexOf('<section class="sheet')); };
const title = c => drawer(c).match(/<h2 class="sheet-title">([^<]*)</)[1];
const labels = html => [...html.matchAll(/st-choice-(heading|label)">([^<]*)</g)].map(m => (m[1] === 'heading' ? '# ' : '') + m[2]);

test('level 1: search, the recent products under their group label, then the categories', () => {
  const c = open(), html = drawer(c);
  assert.equal(title(c), 'Medicines');
  assert.ok(html.indexOf('type="search"') < html.indexOf('Recently used'), 'search first');
  assert.deepEqual(labels(html).slice(0, 5), ['# Recently used', 'Draxxin', 'Amoxinsol 50', 'Flunixin', '# Categories']);
  assert.match(html, /Tulathromycin · injection/);
  assert.match(html, /Flunixin<\/span><span class="st-choice-meta">Brand not known/);
  assert.equal((html.match(/data-action="medicine-category"/g) || []).length, 7, 'the seven fixed categories');
  assert.match(html, /class="sheet-footer[^]*data-action="back"[^]*>Back</);
});

test('no recent picks: the block is absent and the categories carry no label', () => {
  const c = open(); c.medFarm.recents = [];
  const html = drawer(c);
  assert.doesNotMatch(html, /Recently used|>Categories</);
});

test('recents are distinct, newest first, at most three, and filtered to the task', () => {
  const c = M.seed(); M.openBulkAction(c, 'treatment', ['000267']);
  c.medFarm.recents = [{ product: 'draxxin' }, { product: 'draxxin' }, { product: 'respiporc' }, { medicine: 'flunixin' }, { product: 'metacam' }];
  assert.deepEqual(M.medRecents(c).map(r => r.product?.id || r.medicine.id), ['draxxin', 'respiporc', 'flunixin']);
  c.form.taskId = 'vaccination';
  assert.deepEqual(M.medRecents(c).map(r => r.product.id), ['respiporc']);
});

test('level 2: medicines are group labels, products the rows, Brand not known last; Back goes up, ✕ closes', () => {
  const c = open(); M.handleRecordAction(c, 'medicine-category', 'pain');
  const html = drawer(c);
  assert.equal(title(c), 'Pain relief', 'a short title that fits the header at 360');
  assert.deepEqual(labels(html).slice(0, 4), ['# Meloxicam', 'Metacam', 'Metacam', 'Brand not known']);
  assert.match(html, /placeholder="Search all options"/, 'search at level 2 searches all options');
  assert.match(html, /class="sheet-footer[^]*data-action="medicine-up"[^]*>Back</);
  assert.match(html, /data-corner="start"[^>]*data-action="dismiss"/);
  M.handleRecordAction(c, 'medicine-up', ''); assert.equal(title(c), 'Medicines');
});

test('search from inside a category covers every category; brand-only matches list that brand only', () => {
  const c = open(); M.handleRecordAction(c, 'medicine-category', 'pain');
  c.form.med.search = 'tula';
  assert.deepEqual(labels(M.medicinePickerBody(c)), ['# Tulathromycin', 'Draxxin', 'Tulissin', 'Increxxa', 'Brand not known']);
  c.form.med.search = 'draxx';
  assert.deepEqual(labels(M.medicinePickerBody(c)), ['# Tulathromycin', 'Draxxin']);
  c.form.med.search = 'sulfadiazine';
  assert.deepEqual(labels(M.medicinePickerBody(c)).slice(0, 1), ['# Trimethoprim + sulfadiazine'], 'an ingredient of a combination');
});

test('no match: one card, Add “typed”, and nothing else', () => {
  const c = open(); c.form.med.search = 'Zactran';
  const body = M.medicinePickerBody(c);
  assert.deepEqual(labels(body), ['Add “Zactran”']);
  assert.doesNotMatch(body, /st-choice-empty|No options/);
});

test('adding: Name pre-filled, Medicine required, Category only for a new medicine; Add lists it for everyone and picks it', () => {
  const c = open(); M.handleRecordAction(c, 'medicine-category', 'antibiotics'); c.form.med.search = 'Zactran';
  M.handleRecordAction(c, 'medicine-add', 'Zactran');
  let html = drawer(c);
  assert.equal(title(c), 'Add a product');
  assert.match(html, /data-medicine-add-name[^>]*value="Zactran"/);
  assert.doesNotMatch(html, />Category</);
  assert.match(html, /data-action="medicine-add-save"[^>]*aria-disabled="true"/);
  M.handleRecordAction(c, 'medicine-add-pick-medicine', '');
  assert.ok(labels(drawer(c)).includes('Tulathromycin') && !labels(drawer(c)).includes('Meloxicam'), "the category's medicines");
  M.handleRecordAction(c, 'medicine-add-new-medicine', 'Gamithromycin');
  html = drawer(c);
  assert.match(html, />Category</); assert.match(html, /Antibiotics/, 'filed where the worker came from');
  M.handleRecordAction(c, 'medicine-add-save', '');
  assert.equal(c.view, 'treatment'); assert.equal(c.form.medicine, 'Zactran');
  const added = c.medFarm.products.find(p => p.name === 'Zactran');
  assert.equal(c.medFarm.medicines.find(m => m.id === added.medicine).category, 'antibiotics');
  M.handleRecordAction(c, 'medicine-open', ''); c.form.med.search = 'gamithro';
  assert.deepEqual(labels(M.medicinePickerBody(c)), ['# Gamithromycin', 'Zactran', 'Brand not known']);
});

test('a waiting Add marks the empty fields Required', () => {
  const c = open(); c.form.med.search = 'Zactran'; M.handleRecordAction(c, 'medicine-add', 'Zactran');
  M.handleRecordAction(c, 'medicine-add-save', '');
  assert.equal(c.view, 'medicine-picker'); assert.match(drawer(c), /Required/);
});

test('the product remembers its last method and unit and fills them next time', () => {
  const c = open(['000254', '000267']); M.handleRecordAction(c, 'medicine-select', 'p:metacam');
  assert.equal(c.form.method, 'Injection'); assert.equal(c.form.doseUnit, 'mL');
  c.form.method = 'Oral'; c.form.doseUnit = 'mg'; c.form.dose = '2'; c.form.prefilled = {};
  assert.ok(M.saveBulkAction(c));
  assert.deepEqual([c.medFarm.products.find(p => p.id === 'metacam').method, c.medFarm.products.find(p => p.id === 'metacam').unit], ['Oral', 'mg']);
  assert.deepEqual(c.medFarm.recents[0], { product: 'metacam' }, 'now the newest recent pick');
});

test('batch: what was given first, then the doses, then the optional rows', () => {
  const c = M.seed(); M.openBulkAction(c, 'treatment', ['000254', '000267']);
  const html = M.overlay(c), at = s => html.indexOf(s);
  assert.ok(at('data-action="medicine-open"') < at('data-picker-key="method"'));
  assert.ok(at('data-picker-key="method"') < at('Same dose for all'));
  assert.ok(at('Same dose for all') < at('data-bulk-value="000254"'));
  assert.ok(at('data-bulk-value="000267"') < at('>Condition<'));
});

test('a vaccination lists vaccines only, without a one-row category level', () => {
  const c = open(['000267'], 'vaccination'), html = drawer(c);
  assert.equal(title(c), 'Vaccines');
  assert.doesNotMatch(html, /data-action="medicine-category"/);
  assert.ok(labels(html).includes('# PRRS vaccine')); assert.ok(!labels(html).includes('# Meloxicam'));
});

test('Medicines page: categories, then medicines and products; a product sheet renames and deletes', () => {
  const c = M.seed(); c.view = 'medicines';
  let html = M.overlay(c);
  assert.match(html, /data-presentation="page"/); assert.equal((html.match(/data-action="medicines-category"/g) || []).length, 7);
  M.handleRecordAction(c, 'medicines-category', 'pain'); html = M.overlay(c);
  assert.match(html, /Meloxicam/); assert.doesNotMatch(html, /Flunixin/, 'a medicine with no products is absent');
  M.handleRecordAction(c, 'medicines-product', 'metacam');
  assert.match(M.overlay(c), /<h2 class="sheet-title">Metacam · injection</, 'told apart from Metacam oral by its form');
  M.handleRecordAction(c, 'medicines-product-level', 'rename'); c.medPage.draft = 'Metacam 5 mg/mL';
  M.handleRecordAction(c, 'medicines-rename-save', '');
  assert.equal(c.medFarm.products.find(p => p.id === 'metacam').name, 'Metacam 5 mg/mL');
  M.handleRecordAction(c, 'medicines-product', 'ketofen'); M.handleRecordAction(c, 'medicines-product-level', 'delete');
  assert.match(M.overlay(c), /Past records keep its name/);
  M.handleRecordAction(c, 'medicines-delete-save', '');
  assert.doesNotMatch(M.overlay(c), /Ketofen/);
  const t = M.seed(); M.openBulkAction(t, 'treatment', ['000267']); t.medFarm = c.medFarm; M.handleRecordAction(t, 'medicine-open', ''); t.form.med.search = 'ketoprofen';
  assert.deepEqual(labels(M.medicinePickerBody(t)), ['# Ketoprofen', 'Brand not known'], 'deleted products leave the picker; the medicine stays');
});
