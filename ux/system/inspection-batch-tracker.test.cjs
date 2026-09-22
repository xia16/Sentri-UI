const test = require('node:test');
const assert = require('node:assert/strict');
require('./inspection-astra-concept.js');
const model = globalThis.InspectionStudy;

function mixedBatch() {
  const c = model.seed(), batch = c.batches[0];
  batch.currentTask = { id: 'farrowing', title: 'Farrowing', startedAt: '2026-09-10', completedPigIds: ['000254', '000267', 'not-in-batch'] };
  batch.next = 'Weaning';
  batch.when = 'Thu · 1 Oct';
  return { c, batch };
}

test('partially completed batches show ongoing work and suppress the next task', () => {
  const { c, batch } = mixedBatch();
  const rows = model.batchTrackerRows(c, batch);
  assert.deepEqual(rows.map(({ title, count, kind }) => ({ title, count, kind })), [
    { title: 'Farrowing', count: 3, kind: 'current' },
  ]);
  assert.equal(rows[0].timing, '2 days in progress');
  assert.doesNotMatch(model.unitOverview(c), /Weaning/);
  assert.equal(model.currentTasksForPig(c, model.pig(c, '000254'))[0].title, 'Weaning');
  assert.equal(model.currentTasksForPig(c, model.pig(c, '000281'))[0].title, 'Farrowing');
});

test('concurrent production tasks stay distinct and next appears only after both finish', () => {
  const { c, batch } = mixedBatch();
  batch.currentTasks = [
    { id: 'heat-check', title: 'In-heat check', startedAt: '2026-09-10', pigIds: batch.pigIds.slice(0, 2) },
    { id: 'breeding', title: 'Breeding', startedAt: '2026-09-11', pigIds: batch.pigIds.slice(2) },
  ];
  batch.next = 'Pregnancy check';
  assert.deepEqual(model.batchTrackerRows(c, batch).map(r => [r.title, r.count]), [['In-heat check', 2], ['Breeding', 3]]);
  batch.currentTasks[0].completedPigIds = batch.pigIds.slice(0, 2);
  assert.deepEqual(model.batchTrackerRows(c, batch).map(r => [r.title, r.count]), [['Breeding', 3]]);
  batch.currentTasks[1].completedPigIds = batch.pigIds.slice(2);
  assert.deepEqual(model.batchTrackerRows(c, batch).map(r => [r.title, r.count, r.kind]), [['Pregnancy check', 5, 'next']]);
});

test('only completed pigs advance, including when the entire batch finishes', () => {
  const { c, batch } = mixedBatch();
  batch.currentTask.completedPigIds = [];
  assert.deepEqual(model.batchTrackerRows(c, batch).map(r => [r.kind, r.count]), [['current', 5]]);
  batch.currentTask.completedPigIds = [...batch.pigIds];
  assert.deepEqual(model.batchTrackerRows(c, batch).map(r => [r.kind, r.count]), [['next', 5]]);
  batch.next = '';
  assert.deepEqual(model.batchTrackerRows(c, batch), []);
});

test('scheduled-only batches retain their next task; unknown starts never invent elapsed days', () => {
  const { c, batch } = mixedBatch();
  delete batch.currentTask.startedAt;
  assert.equal(model.batchTrackerRows(c, batch)[0].timing, 'In progress');
  batch.currentTask.startedAt = '2026-09-12';
  assert.equal(model.batchTrackerRows(c, batch)[0].timing, 'Started today');
  delete batch.currentTask;
  assert.deepEqual(model.batchTrackerRows(c, batch).map(r => [r.title, r.count, r.kind]), [['Weaning', 5, 'next']]);
  c.batches = [];
  assert.doesNotMatch(model.unitOverview(c), /Batch tracker/);
});
