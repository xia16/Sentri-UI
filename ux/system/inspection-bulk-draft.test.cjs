const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
require('./astra-surfaces.js');
require('./inspection-astra-concept.js');
const model = globalThis.InspectionStudy;

function treatment(subjects = ['000254']) {
  const c = Object.assign(model.seed(), { view: 'actions', pigId: subjects[0] });
  model.openBulkAction(c, 'treatment', subjects);
  Object.assign(c.form, { medicine: 'Amoxicillin', method: 'Injection', doseUnit: 'mL', dose: '4.5', showRequired: true });
  return c;
}
function back(c) { model.parkBulkDraft(c); c.form = {}; c.view = 'actions'; }   // what every Back path does

test('Back keeps a record draft; reopening the same action on the same pigs brings it back', () => {
  const c = treatment();
  back(c);
  model.openBulkAction(c, 'treatment', ['000254']);
  assert.equal(c.view, 'treatment');
  assert.deepEqual([c.form.medicine, c.form.method, c.form.doseUnit, c.form.dose], ['Amoxicillin', 'Injection', 'mL', '4.5']);
  assert.equal(c.form.showRequired, undefined, 'a reopened draft does not open showing errors');
  assert.match(model.overlay(c), /data-bulk-key="dose"[^>]*value="4\.5"/);
});

test('a draft belongs to its action and pigs: another action or another selection starts blank', () => {
  const c = treatment();
  back(c);
  model.openBulkAction(c, 'note', ['000254']);
  assert.equal(c.form.dose, '');
  c.form = {}; c.view = 'actions';
  model.openBulkAction(c, 'treatment', ['000254', '000267']);
  assert.equal(c.form.dose, '');
});

test('a reopened draft is used once: after Save the next treatment starts blank', () => {
  const c = treatment();
  back(c);
  model.openBulkAction(c, 'treatment', ['000254']);
  c.form = {}; c.view = 'actions';   // saved or discarded: nothing was parked
  model.openBulkAction(c, 'treatment', ['000254']);
  assert.equal(c.form.dose, '');
});
