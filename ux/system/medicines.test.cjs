// Medicines (features/medicines): the picker's levels, recents, search, adding, brands, remembered method and unit, the page.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
require('./astra-surfaces.js');
require('./inspection-astra-concept.js');
const M = globalThis.InspectionStudy;
const catalogue = require('./medicines-catalogue.json');

const open = (ids = ['000267'], task) => { const c = M.seed(); M.openBulkAction(c, 'treatment', ids); if (task) c.form.taskId = task; M.handleRecordAction(c, 'medicine-open', ''); return c; };
const drawer = c => { const h = M.overlay(c); return h.slice(h.lastIndexOf('<section class="sheet')); };
const title = c => drawer(c).match(/<h2 class="sheet-title">([^<]*)</)[1];
const rows = html => [...html.matchAll(/st-choice-(heading|label|meta)">([^<]*)</g)].map(m => (m[1] === 'heading' ? '# ' : m[1] === 'meta' ? '  ' : '') + m[2]);

test('the starting list: seven categories, every medicine named in EN and ZH, vaccines by disease', () => {
  assert.deepEqual(catalogue.categories.map(c => c.id), ['antibiotics', 'pain', 'parasites', 'vaccines', 'hormones', 'vitamins', 'other']);
  assert.equal(catalogue.medicines.length, 58);
  for (const m of catalogue.medicines) { assert.ok(m.en && m.zh, m.id); assert.ok(catalogue.categories.some(c => c.id === m.category), m.id); }
  assert.ok(catalogue.medicines.some(m => m.category === 'vaccines' && m.en === 'PRRS' && m.zh === '蓝耳病'));
  assert.match(catalogue.note, /checked by a vet/);
});

test('level 1: search, the recent medicines under their label (no second line), then the categories', () => {
  const c = open(), html = drawer(c);
  assert.equal(title(c), 'Medicines');
  assert.ok(html.indexOf('type="search"') < html.indexOf('Recently used'));
  assert.deepEqual(rows(html).slice(0, 5), ['# Recently used', 'Tulathromycin', 'Amoxicillin', 'Meloxicam', '# Categories']);
  assert.equal((html.match(/data-action="medicine-category"/g) || []).length, 7);
  assert.doesNotMatch(html, /st-choice-meta|Brand not known/);
});

test('no recent picks: the block is absent and the categories carry no label', () => {
  const c = open(); c.medFarm.recents = [];
  assert.doesNotMatch(drawer(c), /Recently used|>Categories</);
});

test('recents are distinct, newest first, at most three, and filtered to the task', () => {
  const c = M.seed(); M.openBulkAction(c, 'treatment', ['000267']);
  c.medFarm.recents = ['tulathromycin', 'tulathromycin', 'prrs', 'meloxicam', 'amoxicillin'];
  assert.deepEqual(M.medRecents(c).map(m => m.id), ['tulathromycin', 'prrs', 'meloxicam']);
  c.form.taskId = 'vaccination';
  assert.deepEqual(M.medRecents(c).map(m => m.id), ['prrs']);
});

test('level 2: the category\'s medicines, no second line; Back goes up, ✕ closes', () => {
  const c = open(); M.handleRecordAction(c, 'medicine-category', 'pain');
  const html = drawer(c);
  assert.equal(title(c), 'Pain relief');
  assert.deepEqual(rows(html), ['Meloxicam', 'Flunixin', 'Ketoprofen', 'Metamizole', 'Dexamethasone']);
  assert.match(html, /placeholder="Search all options"/);
  assert.match(html, /class="sheet-footer[^]*data-action="medicine-up"[^]*>Back</);
  assert.match(html, /data-corner="start"[^>]*data-action="dismiss"/);
  M.handleRecordAction(c, 'medicine-up', ''); assert.equal(title(c), 'Medicines');
});

test('search covers every category from any level; a result names its category', () => {
  const c = open(); M.handleRecordAction(c, 'medicine-category', 'pain'); c.form.med.search = 'tyl';
  assert.deepEqual(rows(M.medicinePickerBody(c)), ['Tylosin', '  Antibiotics', 'Tylvalosin', '  Antibiotics']);
  c.form.med.search = '蓝耳';
  assert.deepEqual(rows(M.medicinePickerBody(c)), ['PRRS', '  Vaccines'], 'Chinese names match too');
});

test('no match: one card, Add “typed”, and nothing else', () => {
  const c = open(); c.form.med.search = 'Cefquinome';
  const body = M.medicinePickerBody(c);
  assert.deepEqual(rows(body), ['Add “Cefquinome”']); assert.doesNotMatch(body, /st-choice-empty|No options/);
});

test('adding a medicine: Name pre-filled, Category required (set when added inside one); it is listed for everyone and picked', () => {
  let c = open(); c.form.med.search = 'Cefquinome'; M.handleRecordAction(c, 'medicine-add', 'Cefquinome');
  assert.equal(title(c), 'Add a medicine');
  assert.match(drawer(c), /data-medicine-add-name[^>]*value="Cefquinome"/);
  assert.doesNotMatch(drawer(c), />Medicine</, 'no Medicine pick: the medicine is what is added');
  M.handleRecordAction(c, 'medicine-add-save', ''); assert.match(drawer(c), /Required/);
  M.handleRecordAction(c, 'medicine-add-pick-category', ''); assert.equal(title(c), 'Category');
  M.handleRecordAction(c, 'medicine-add-category', 'antibiotics'); M.handleRecordAction(c, 'medicine-add-save', '');
  assert.equal(c.view, 'treatment'); assert.equal(c.form.medicine, 'Cefquinome');
  M.handleRecordAction(c, 'medicine-open', ''); M.handleRecordAction(c, 'medicine-category', 'antibiotics');
  assert.ok(rows(drawer(c)).includes('Cefquinome'));
  c = open(); M.handleRecordAction(c, 'medicine-category', 'hormones'); c.form.med.search = 'Buserelin'; M.handleRecordAction(c, 'medicine-add', 'Buserelin');
  assert.equal(c.form.med.add.category, 'hormones');
});

test('Brand: an optional row only once a medicine is chosen; the farm\'s brands with recents; Add under the medicine', () => {
  const c = open(['000267']); M.handleRecordAction(c, 'dismiss', ''); c.view = 'treatment';
  assert.doesNotMatch(M.overlay(c), /data-action="brand-open"/);
  M.handleRecordAction(c, 'medicine-open', ''); M.handleRecordAction(c, 'medicine-select', 'amoxicillin');
  const form = M.overlay(c), at = s => form.indexOf(s);
  assert.ok(at('data-picker-key="method"') < at('data-action="brand-open"') && at('data-action="brand-open"') < at('data-bulk-key="dose"'), 'Medicine, Method, Brand, then the dose');
  M.handleRecordAction(c, 'brand-open', '');
  assert.deepEqual(rows(M.brandPickerBody(c)), ['# Recently used', 'Amoxinsol 50', '  50%', 'Betamox LA', '  150 mg/ml', 'Clamoxyl', '# Other brands', 'Duphamox', '  150 mg/ml', 'Vetrimoxin'], 'a strength is the second line: it tells sibling brands apart');
  c.form.brandPick.search = 'Moxylan'; assert.deepEqual(rows(M.brandPickerBody(c)), ['Add “Moxylan”']);
  M.handleRecordAction(c, 'brand-add', 'Moxylan');
  assert.equal(c.form.brand, 'Moxylan'); assert.equal(c.form.brandPick.level, 'details', 'then the optional details');
  M.handleRecordAction(c, 'brand-details-save', ''); assert.equal(c.view, 'brand-picker', 'Add waits until a detail is typed');
  c.form.brandPick.draft.strength = '15%'; M.handleRecordAction(c, 'brand-details-save', '');
  assert.equal(c.view, 'treatment'); assert.match(M.overlay(c), /Moxylan · 15%/);
  assert.ok(c.medFarm.brands.some(b => b.medicine === 'amoxicillin' && b.name === 'Moxylan'));
  M.handleRecordAction(c, 'medicine-open', ''); M.handleRecordAction(c, 'medicine-select', 'meloxicam');
  assert.equal(c.form.brand, '', 'a new medicine drops the old brand');
});

test('the medicine remembers its last method and unit; saving makes it the newest recent and its brand the first', () => {
  const c = open(['000254', '000267']); M.handleRecordAction(c, 'medicine-select', 'meloxicam');
  assert.equal(c.form.method, 'Injection'); assert.equal(c.form.doseUnit, 'mL');
  c.form.method = 'Oral'; c.form.doseUnit = 'mg'; c.form.dose = '2'; c.form.prefilled = {};
  M.handleRecordAction(c, 'brand-open', ''); M.handleRecordAction(c, 'brand-add', 'Loxicom'); M.handleRecordAction(c, 'dismiss', ''); c.view = 'treatment'; delete c.form.brandPick;
  assert.ok(M.saveBulkAction(c));
  assert.deepEqual(c.medFarm.memory.meloxicam, { method: 'Oral', unit: 'mg' });
  assert.equal(c.medFarm.recents[0], 'meloxicam');
  assert.equal(c.medFarm.brands[0].name, 'Loxicom');
});

test('batch: Medicine, Method and Brand first, then the doses, then the optional rows', () => {
  const c = M.seed(); M.openBulkAction(c, 'treatment', ['000254', '000267']); M.handleRecordAction(c, 'medicine-open', ''); M.handleRecordAction(c, 'medicine-select', 'tulathromycin');
  const html = M.overlay(c), at = s => html.indexOf(s);
  assert.ok(at('data-action="medicine-open"') < at('data-picker-key="method"'));
  assert.ok(at('data-picker-key="method"') < at('data-action="brand-open"'));
  assert.ok(at('data-action="brand-open"') < at('Same dose for all'));
  assert.ok(at('data-bulk-value="000267"') < at('>Condition<'));
});

test('a vaccination lists the vaccines by disease, without a one-row category level', () => {
  const c = open(['000267'], 'vaccination'), html = drawer(c);
  assert.equal(title(c), 'Vaccines');
  assert.doesNotMatch(html, /data-action="medicine-category"/);
  assert.ok(rows(html).includes('PRRS') && rows(html).includes('Classical swine fever') && !rows(html).includes('Meloxicam'));
});

test('Medicines page: catalogue medicines show brands only; farm-added ones rename and delete; brands rename and delete', () => {
  const c = M.seed(); c.view = 'medicines';
  assert.match(M.overlay(c), /data-presentation="page"/);
  M.handleRecordAction(c, 'medicines-category', 'antibiotics');
  M.handleRecordAction(c, 'medicines-medicine', 'amoxicillin');
  let html = M.overlay(c);
  assert.doesNotMatch(html, /data-action="medicines-level" data-value="(rename|delete)"/, 'a starting-list medicine cannot be renamed or deleted');
  assert.match(html, />Brands</);
  M.handleRecordAction(c, 'medicines-brand', 'amoxicillin/1'); M.handleRecordAction(c, 'medicines-level', 'rename'); c.medPage.draft = 'Betamox LA 150';
  M.handleRecordAction(c, 'medicines-edit-save', '');
  assert.ok(c.medFarm.brands.some(b => b.name === 'Betamox LA 150'));
  M.handleRecordAction(c, 'medicines-level', 'delete'); M.handleRecordAction(c, 'medicines-delete-save', '');
  assert.ok(c.medFarm.brands.find(b => b.id === 'amoxicillin/1').deleted);
  M.handleRecordAction(c, 'medicines-medicine', 'farm-gamithromycin');
  assert.match(M.overlay(c), /data-action="medicines-level" data-value="rename"/);
  M.handleRecordAction(c, 'medicines-level', 'delete'); assert.match(M.overlay(c), /Past records keep its name/);
  M.handleRecordAction(c, 'medicines-delete-save', '');
  assert.equal(c.view, 'medicines'); assert.doesNotMatch(M.overlay(c), /Gamithromycin/);
});

test("withdrawal: the brand's own, else the medicine's default, shown as a notice before Save; the record keeps a copy", () => {
  const c = open(['000267']); M.handleRecordAction(c, 'medicine-select', 'amoxicillin');
  assert.match(M.overlay(c), /data-ds="Banner" data-tone="notice"[^]*Withdrawal until 26 Sep/, 'Amoxicillin default: 14 days');
  M.handleRecordAction(c, 'brand-open', ''); M.handleRecordAction(c, 'brand-select', 'amoxicillin/0');
  let html = M.overlay(c);
  assert.match(html, /Withdrawal until 14 Sep/, 'Amoxinsol 50: its own 2 days');
  assert.ok(html.indexOf('Withdrawal until') < html.indexOf('class="sheet-footer'));
  M.handleRecordAction(c, 'brand-open', ''); M.handleRecordAction(c, 'brand-select', 'amoxicillin/2');
  assert.match(M.overlay(c), /Withdrawal until 26 Sep/, 'Clamoxyl has none: the default');
  M.handleRecordAction(c, 'brand-open', ''); M.handleRecordAction(c, 'brand-select', 'amoxicillin/0');
  c.form.dose = '5'; assert.ok(M.saveBulkAction(c));
  const rec = M.pig(c, '000267').treatment;
  assert.deepEqual([rec.brand, rec.strength, rec.withdrawalDays, rec.withdrawalUntil], ['Amoxinsol 50', '50%', 2, '14 Sep']);
  c.medFarm.brands.find(b => b.id === 'amoxicillin/0').withdrawal = 7;
  assert.equal(M.pig(c, '000267').treatment.withdrawalDays, 2, 'a later edit does not change the record');
});

test('no withdrawal in force: no notice', () => {
  const c = open(['000267']); M.handleRecordAction(c, 'medicine-select', 'penicillin');
  assert.doesNotMatch(M.overlay(c), /Withdrawal until/);
});

test('Medicines page: a medicine\'s default withdrawal and a brand\'s strength and withdrawal are editable', () => {
  const c = M.seed(); c.view = 'medicines'; M.handleRecordAction(c, 'medicines-category', 'antibiotics'); M.handleRecordAction(c, 'medicines-medicine', 'amoxicillin');
  assert.match(M.overlay(c), /Default withdrawal \(meat\)[^]*14 days/);
  M.handleRecordAction(c, 'medicines-level', 'withdrawal'); c.medPage.draft = '10'; M.handleRecordAction(c, 'medicines-edit-save', '');
  assert.equal(c.medFarm.medicines.find(m => m.id === 'amoxicillin').withdrawal, 10);
  M.handleRecordAction(c, 'medicines-brand', 'amoxicillin/2');
  assert.match(M.overlay(c), /Strength[^]*Not set/);
  M.handleRecordAction(c, 'medicines-level', 'strength'); c.medPage.draft = '200 mg/ml'; M.handleRecordAction(c, 'medicines-edit-save', '');
  assert.equal(c.medFarm.brands.find(b => b.id === 'amoxicillin/2').strength, '200 mg/ml');
});
