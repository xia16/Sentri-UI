const test = require('node:test');
const assert = require('node:assert/strict');
require('./astra-surfaces.js');
require('./inspection-astra-concept.js');
const model = globalThis.InspectionStudy;

test('a sow opened from farrowing without a feeding plan cannot save a zero-result adjustment', () => {
  const context = model.sowDetailContext({ id: '000406', pen: 'B3', unit: 'Unit 7', stage: 'Lactating', parity: 4 });
  context.selected.add('000406');
  const catalogue = model.actionCatalogue(context);
  assert.equal(catalogue.groups.flatMap(group => group.items).some(item => item.a === 'feed-edit-selected'), false);
  assert.match(catalogue.unavailable.find(item => item.title === 'Adjust feed').reason, /No feeding plan/);
  model.openFeedEditor(context, 'pigs', ['000406']);
  model.updateFeedInput(context, 'percent', 30);
  assert.equal(model.feedEditorValid(context), false);
  assert.equal(model.saveFeedEditor(context), false);
});

test('an existing feeding plan previews and saves the adjusted amount', () => {
  const context = model.seed();
  model.openFeedEditor(context, 'pigs', ['000254']);
  model.updateFeedInput(context, 'percent', 25);
  assert.deepEqual(model.feedTotals(context), { before: 2.6, after: 3.25 });
  assert.equal(model.saveFeedEditor(context), true);
  assert.equal(model.pigAllocation(model.pig(context, '000254'), model.penOf(context, '000254')), 3.25);
});

test('feed review uses compact rows with explicit current, new and change states', () => {
  const context = model.seed();
  model.openFeedEditor(context, 'pigs', ['000306', '000312']);
  let html = model.overlay(context);
  assert.match(html, /feed-inline-pigs is-short/);
  assert.match(html, />2 selected</);
  assert.equal((html.match(/Unchanged/g) || []).length, 2);
  assert.match(html, /<small>Current<\/small>/);
  assert.match(html, /<small>New<\/small>/);
  assert.match(html, /aria-expanded="true"[^>]*data-action="bulk-toggle-controls"/);
  assert.equal(model.handleRecordAction(context, 'bulk-toggle-controls', ''), true);
  html = model.overlay(context);
  assert.match(html, /aria-expanded="false"[^>]*data-action="bulk-toggle-controls"/);
  assert.doesNotMatch(html, /data-feed-edit="feedingState"/);
  model.handleRecordAction(context, 'bulk-toggle-controls', '');
  model.updateFeedInput(context, 'percent', 10);
  html = model.overlay(context);
  assert.match(html, /feed-pig-preview is-changed/);
  assert.match(html, /\+0\.25 kg\/day/);
});

test('bulk measurement and care flows use the same pig review card as feed', () => {
  const context = model.seed();
  const subjects = ['000254', '000267'];

  model.openBulkAction(context, 'backfat', subjects);
  let html = model.overlay(context);
  assert.match(html, /pig-review-card bulk-pigs is-short/);
  assert.equal((html.match(/pig-review-row bulk-pig-row/g) || []).length, 2);
  assert.match(html, />2 selected</);
  assert.match(html, /<small>Current<\/small>/);
  assert.match(html, /<small>New<\/small>/);
  assert.match(html, /Current → New · mm/);

  model.openBulkAction(context, 'triage', subjects);
  html = model.overlay(context);
  assert.match(html, /pig-review-card bulk-pigs is-short/);
  assert.equal((html.match(/pig-review-row bulk-pig-row/g) || []).length, 2);
  assert.match(html, /Preview changes/);
  assert.match(html, /data-bulk-summary="000254"/);
});
