// Feedback after saving (design law; owner, 2026-10-18): which saves confirm with a Toast. One pig: only when the walk list's row
// doesn't show the result. Several pigs: always, with the count. Resolve: always (a tag that disappears is easy to miss).
// A save that returns to a finding shows it there: no toast.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
require('./astra-surfaces.js');
require('./inspection-astra-concept.js');
const M = globalThis.InspectionStudy;

const CONDITION = 'Porcine reproductive and respiratory syndrome';
const save = (view, ids, fill, out = {}) => {
  const c = M.seed(); M.openBulkAction(c, view, ids); fill(c.form, c);
  assert.ok(M.bulkActionValid(c), view + ' form is valid'); assert.ok(M.saveBulkAction(c), view + ' saves');
  out.rowCheck = c.rowCheck;
  return c.toast || null;
};
const one = ['000267'], two = ['000267', '000254'];

test('one pig: where the row can show the result, the drawn list decides (on screen, every tag shown), not the save', () => {
  const o = {};
  assert.equal(save('health', one, (f) => { f.conditions = [CONDITION]; f.triage = 'Monitor'; }, o), null, 'a recorded condition shows as a tag');
  assert.deepEqual(o.rowCheck, { id: '000267', toast: { title: 'Condition recorded', detail: '000267', tone: 'done' } }, 'the list checks the row once drawn; the toast waits for it');
  assert.equal(save('body', one, (f) => { f.condition = 'Over-conditioned'; }), null, 'body condition shows as a tag');
  assert.equal(save('triage', one, (f) => { f.target = 'Thin'; f.triage = 'Treat'; }), null, 'care shows on the tag');
  assert.equal(save('edit-conditions', one, (f) => { f.target = 'Thin'; f.note = 'Feed more'; }), null, 'an edit shows on the tag');
});

test('one pig: a toast where the row does not show the result', () => {
  assert.deepEqual(save('weight', one, (f) => { f.values['000267'] = '250'; }), { title: 'Weight recorded', detail: '000267', tone: 'done' });
  assert.equal(save('temperature', one, (f) => { f.values['000267'] = '38.9'; }).title, 'Temperature recorded');
  assert.equal(save('backfat', one, (f) => { f.values['000267'] = '18'; }).title, 'Backfat recorded');
  assert.equal(save('note', one, (f) => { f.note = 'Check water'; }).title, 'Note added');
  assert.equal(save('treatment', one, (f) => { f.medicine = 'Amoxicillin'; f.method = 'Injection'; f.doseUnit = 'mL'; f.dose = '2'; }).title, 'Treatment recorded');
});

test('Resolve always confirms: the tag it removes is easy to miss', () => {
  assert.deepEqual(save('resolve', one, (f) => { f.target = 'Thin'; f.outcome = 'recover'; }), { title: 'Marked recovered', detail: '000267', tone: 'done' });
  assert.equal(save('resolve', one, (f) => { f.target = 'Thin'; f.outcome = 'strike'; }).title, 'Record corrected');
});

test('several pigs: always a toast, with the count', () => {
  assert.deepEqual(save('health', two, (f) => { f.conditions = [CONDITION]; f.triage = 'Monitor'; }), { title: 'Condition recorded', detail: '2 pigs', tone: 'done' });
  assert.equal(save('weight', two, (f) => { f.values['000267'] = '250'; f.values['000254'] = '240'; }).detail, '2 pigs');
});

test('a save that returns to its finding shows no toast; production saves that land on the pig confirm', () => {
  assert.equal(save('treatment', one, (f) => { f.medicine = 'Amoxicillin'; f.method = 'Injection'; f.doseUnit = 'mL'; f.dose = '2'; f.returnFinding = 'Thin'; }), null);
  const c = M.seed(); c.selected = new Set(['000254']); c.lossReason = 'Found an aborted litter';
  assert.ok(M.saveMiscarriage(c)); assert.deepEqual(c.toast, { title: 'Abortion recorded', detail: '000254', tone: 'done' }, 'the pig page changes one word only');
});

test('Record health counts pigs without ear tags: 2 tagged and 3 of a pen\'s group is 5 pigs; the group alone still confirms', () => {
  const run = (ids, n) => {
    const c = M.seed(); c.selectedNoTags = new Set(['D4']); c.noTagsCount = { D4: n };
    M.openBulkAction(c, 'health', ids); c.form.conditions = ['Coughing'];
    assert.ok(M.bulkActionValid(c), 'valid'); assert.ok(M.saveBulkAction(c), 'saves');
    return c.toast || null;
  };
  assert.deepEqual(run(['000801', '000802'], 3), { title: 'Condition recorded', detail: '5 pigs', tone: 'done' });
  assert.deepEqual(run([], 3), { title: 'Condition recorded', detail: '3 pigs', tone: 'done' });
});
