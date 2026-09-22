const test = require('node:test');
const assert = require('node:assert/strict');
require('./inspection-astra-concept.js');
const model = globalThis.InspectionStudy;
const entries = [
  { title: 'Old record', category: 'Health', time: '15 May 2026' },
  { title: 'Unknown date', category: 'Health', time: 'Before this walk' },
  { title: 'Morning', category: 'Health', recordedAt: '2026-09-12T08:00' },
  { title: 'Boundary', category: 'Feed', time: '6 Sep 2026 · 09:00' },
  { title: 'Outside', category: 'Health', time: '5 Sep 2026 · 12:00' },
  { title: 'Evening', category: 'Health', recordedAt: '2026-09-12T18:00' },
  { title: 'Date only', category: 'Health', time: '12 Sep 2026' },
];
const titles = (c, scope = 'pig') => model.visibleLogEntries(c, entries, scope).map(e => e.title);

test('all dates keeps old and undated entries, sorted newest first', () => {
  assert.deepEqual(titles({}), ['Evening', 'Morning', 'Date only', 'Boundary', 'Outside', 'Old record', 'Unknown date']);
});

test('presets include whole calendar days and combine with activity', () => {
  const c = { pigLogDate: { preset: '7' } };
  assert.deepEqual(titles(c), ['Evening', 'Morning', 'Date only', 'Boundary']);
  c.pigLogFilter = 'Feed';
  assert.deepEqual(titles(c), ['Boundary']);
  c.pigLogDate = { preset: 'today' };
  assert.deepEqual(titles(c), []);
  assert.deepEqual(model.logDateBounds({ preset: '30' }), { start: '2026-08-14', end: '2026-09-12' });
});

test('custom date ranges include the whole day, including records without a time', () => {
  const c = { pigLogDate: { preset: 'custom', start: '2026-09-12', end: '2026-09-12' } };
  assert.deepEqual(titles(c), ['Evening', 'Morning', 'Date only']);
  c.pigLogDate.start = '2026-09-06';
  assert.deepEqual(titles(c), ['Evening', 'Morning', 'Date only', 'Boundary']);
});

test('invalid custom ranges cannot apply and cancel retains the active filter', () => {
  const c = model.seed();
  c.pigLogDate = { preset: '7' };
  model.handleRecordAction(c, 'log-date-open', 'pig');
  model.handleRecordAction(c, 'log-date-preset', 'custom');
  assert.ok(model.logDateDraftError(c.logDateDraft));
  model.handleRecordAction(c, 'log-date-apply');
  assert.equal(c.logDatePicker, true);
  Object.assign(c.logDateDraft, { start: '2026-09-12', end: '2026-09-11' });
  assert.match(model.logDateDraftError(c.logDateDraft), /End date/);
  model.handleRecordAction(c, 'log-date-cancel');
  assert.deepEqual(c.pigLogDate, { preset: '7' });
});

test('apply and clear work independently for pig and pen logs', () => {
  const c = model.seed();
  c.pigLogDate = { preset: '7' };
  c.penLogFilter = 'Health';
  model.handleRecordAction(c, 'log-date-open', 'pen');
  model.handleRecordAction(c, 'log-date-preset', 'today');
  model.handleRecordAction(c, 'log-date-apply');
  assert.deepEqual(titles(c, 'pen'), ['Evening', 'Morning', 'Date only']);
  model.handleRecordAction(c, 'log-clear', 'pen');
  assert.equal(titles(c, 'pen').length, entries.length);
  assert.deepEqual(c.pigLogDate, { preset: '7' });
});

test('new records retain machine-readable dates and legacy display dates still work', () => {
  const c = model.seed();
  model.addEvent(c, 'Weight recorded', ['000254'], '205 kg');
  assert.deepEqual(model.logEntryDate(c.events[0]), { date: '2026-09-12', time: '09:41' });
  assert.deepEqual(model.logEntryDate({ time: 'Yesterday · 06:40' }), { date: '2026-09-11', time: '06:40' });
  assert.equal(model.logEntryDate({ time: 'Before this walk' }), null);
});

test('legacy display labels group by supplied day and retain clock metadata', () => {
  const previous = globalThis.SentriUI;
  const groups = [];
  globalThis.SentriUI = { log(value) { groups.push(value); return 'rendered'; } };
  try {
    const html = model.categorizedLog({}, [
      { title: 'Later legacy event', category: 'Health', time: 'Aug 26 · 08:41', who: 'Walk' },
      { title: 'Earlier legacy event', category: 'Feed', time: 'Aug 26 · 08:20', who: 'Walk' },
      { title: 'Relative legacy event', category: 'Health', time: '5 days ago · 07:10', who: 'Walk' },
    ], 'pig');
    assert.equal(html, 'rendered');
    assert.deepEqual(groups[0].map(group => ({
      label: group.label,
      entries: group.entries.map(entry => ({ title: entry.title, meta: entry.meta })),
    })), [
      { label: 'Aug 26', entries: [
        { title: 'Later legacy event', meta: '08:41 · Walk' },
        { title: 'Earlier legacy event', meta: '08:20 · Walk' },
      ] },
      { label: '5 days ago', entries: [
        { title: 'Relative legacy event', meta: '07:10 · Walk' },
      ] },
    ]);
  } finally {
    globalThis.SentriUI = previous;
  }
});
