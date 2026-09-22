const test = require('node:test');
const assert = require('node:assert/strict');
require('./sentri-components.js');
require('./astra-surfaces.js');
const surfaces = globalThis.AstraSurfaces;
require('./inspection-astra-concept.js');
const model = globalThis.InspectionStudy;
require('./farrowing-astra-concept.js');
const farrowing = globalThis.FarrowingStudy;

function context(view) {
  return Object.assign(model.seed(), { view, pigId: '000254', penId: 'C1', batchId: '20' });
}
function checkPage(html) {
  assert.match(html, /data-presentation="page"/);
  assert.match(html, /class="[^"]*\bsheet\b[^"]*"[^>]*data-st-context="page"/);
  assert.equal((html.match(/class="[^"]*\bsurface-back\b[^"]*"/g) || []).length, 1);
  assert.doesNotMatch(html, /class="scrim"|class="grab"|aria-modal="true"/);
  const footer = html.match(/<(?:footer|div) class="[^"]*\bsheet-footer\b[^"]*"[^>]*>([\s\S]*?)<\/(?:footer|div)>/)?.[1] || '';
  assert.equal((footer.match(/data-action="(?:back|returnCount|room-back)"/g) || []).length, 1);
}

for (const view of ['pig', 'pig-profile', 'pig-production', 'pig-origin', 'pig-log', 'pig-feed', 'pig-feed-curve', 'pig-feed-changes', 'history', 'pen-detail', 'pen-log', 'feed', 'unit-detail', 'environment', 'equipment', 'batch-detail']) {
  test(`${view} renders as a page with one navigation exit`, () => checkPage(model.overlay(context(view))));
}
for (const view of ['body', 'note', 'weight', 'temperature', 'backfat', 'health']) {
  test(`single-pig ${view} keeps a drawer and bottom Back`, () => {
    const c = context('pig'); c.selected.add(c.pigId); model.openBulkAction(c, view);
    const html = model.overlay(c);
    assert.doesNotMatch(html, /data-presentation="page"|drawer-header-back/);
    assert.equal((html.match(/data-action="back"/g) || []).length, 1);
    assert.match(html, /class="sheet-footer"/);
  });
}
test('treatment and transfer use full pages with completion controls', () => {
  const c = context('pig'); c.selected.add(c.pigId); model.openBulkAction(c, 'treatment');
  checkPage(model.overlay(c)); assert.match(model.overlay(c), /data-action="bulk-save"/);
  c.view = 'sow-transfer'; c.transferDraft = {}; checkPage(model.overlay(c));
  assert.match(model.overlay(c), /data-action="save-transfer"/);
});
test('medicine picker preserves the treatment page and entered dose behind it', () => {
  const c = context('pig'); c.selected.add(c.pigId); model.openBulkAction(c, 'treatment');
  c.form.dose = '2'; c.view = 'medicine-picker';
  const html = model.inspectionSurface(c);
  assert.match(html, /class="drawer-background" inert aria-hidden="true"/);
  assert.match(html, /data-presentation="page"/);
  assert.match(html, /data-bulk-key="dose"[^>]*value="2"/);
  assert.match(html, /class="sheet picker-step medicine-picker-step"/);
});
test('pig page has Actions without assumed quick actions', () => {
  const html = model.overlay(context('pig'));
  const footer = html.slice(html.indexOf('<footer'));
  assert.match(footer, /data-action="pig-actions"/);
  assert.doesNotMatch(footer, /data-action="(?:health|note|treatment)"/);
});

test('pig and pen record navigation use the shared panel group', () => {
  for (const view of ['pig','pen-detail']) {
    const html=model.overlay(context(view));
    const groups=html.match(/<div class="[^"]*\bcompact-actions\b[^"]*">/g)||[];
    assert.ok(groups.length,view+' has record navigation');
    for(const group of groups) {
      assert.match(group,/\bst-panel\b/,view+' supplies a contextual panel');
      assert.match(group,/\bst-row-group\b/);
    }
  }
});

test('Actions is a full page with one Back and the shared navigation rows', () => {
  const c=context('actions');c.selected.add(c.pigId);
  checkPage(model.overlay(c));
  const groups=model.overlay(c).match(/<div class="[^"]*\bcompact-actions\b[^"]*">/g)||[];
  assert.ok(groups.length);
  for(const group of groups) {
    assert.match(group,/\bst-action-list\b/);
    assert.match(group,/\bst-panel\b/);
    assert.match(group,/\bst-row-group\b/);
  }
});

test('pen Actions also uses a page rather than a full-height drawer', () => {
  const c=context('actions');c.actionScope='pens';c.selectedPens.add('C1');
  checkPage(model.overlay(c));
});
test('current tasks live on pig detail and stay out of Actions', () => {
  const c = context('pig');
  c.hostTasks = [{ id: 'farrowing', title: 'Farrowing', type: 'Production', status: 'In progress', summary: '9 alive' }];
  assert.match(model.overlay(c), /Current tasks/);
  assert.match(model.overlay(c), /data-action="sow-current-task"/);
  c.selected.add(c.pigId); c.view = 'actions';
  assert.doesNotMatch(model.overlay(c), /Current tasks|sow-task-rail/);
});
test('pig task queue merges and prioritizes simultaneous task sources', () => {
  const c = context('pig');
  const p = model.pig(c, c.pigId);
  p.tasks = [{ id: 'vaccination', title: 'Vaccination', type: 'Health', status: 'Due today', summary: 'Influenza booster' }];
  const tasks = model.currentTasksForPig(c, p);
  assert.deepEqual(tasks.map(task => task.title), ['Vaccination', 'Pregnancy check']);
  const html = model.overlay(c);
  assert.match(html, /2 tasks/);
  assert.match(html, /task-health is-due/);
  assert.match(html, /Vaccination/);
  assert.match(html, /Pregnancy check/);
  assert.match(html, /data-action="sow-current-task" data-value="batch-20-next"/);
});
test('production task cards open an actionable outcome drawer', () => {
  const c = context('pig');
  const p = model.pig(c, c.pigId);
  const task = model.currentTasksForPig(c, p).find(item => item.title === 'Pregnancy check');
  assert.equal(model.openProductionTask(c, task, p), true);
  assert.equal(c.view, 'production-task');
  const html = model.overlay(c);
  assert.doesNotMatch(html, /data-presentation="page"/);
  assert.match(html, /Record outcome/);
  assert.match(html, /Pregnant/);
  assert.match(html, /Not in pig/);
  assert.match(html, /Recheck later/);
  c.form.taskOutcome = 'pregnant';
  assert.equal(model.saveProductionTask(c), true);
  assert.equal(c.view, 'pig');
  assert.equal(model.currentTasksForPig(c, p).some(item => item.id === task.id), false);
});
test('batch membership is one production entrance for add, move and remove', () => {
  const c = context('actions'); c.selected.add(c.pigId);
  const production = model.actionCatalogue(c).groups.find(group => group.id === 'production').items;
  assert.equal(production.filter(item => item.a === 'batch-membership').length, 1);
  assert.doesNotMatch(model.overlay(c), /Remove from batch[\s\S]*Add to batch/);
  model.handleRecordAction(c, 'batch-membership', c.pigId);
  assert.match(model.overlay(c), /Batch membership/);
  c.form.batchTarget = '__none__';
  assert.equal(model.saveBatchMembership(c), true);
  assert.equal(model.pig(c, c.pigId).batchId, '');
  assert.equal(c.batches.find(batch => batch.id === '20').pigIds.includes(c.pigId), false);
});
test('farrowing operations stay together inside Production', () => {
  const s = farrowing.seed('count');
  const actions = farrowing.sowActionCatalogue(s);
  for (const id of ['miscarriage', 'edit']) {
    const entry = actions.find(action => action.id === id);
    assert.equal(entry.group, 'production', id);
    assert.equal(entry.scope, 'farrowing', id);
  }
  for (const id of ['piglets', 'death', 'countReconcile', 'foster']) {
    const entry = actions.find(action => action.id === id);
    assert.equal(entry.group, 'production', id);
    assert.equal(entry.scope, 'piglet-processing', id);
  }
  actions.find(action => action.id === 'remove-batch').reason = '';
  const c = context('actions'); c.selected.add(c.pigId); c.hostActions = actions;
  c.hostTasks = [
    { id: 'farrowing', title: 'Farrowing', type: 'Production', status: 'In progress' },
    { id: 'piglet-processing', title: 'Piglet processing', type: 'Production', status: 'Due today' }
  ];
  const html = model.overlay(c);
  assert.match(html, /aria-label="Farrowing actions"/);
  assert.match(html, /aria-label="Piglet processing actions"/);
  assert.match(html, /aria-label="Farrowing actions">[\s\S]*?<h5[^>]*><span>Farrowing<\/span><\/h5>/);
  assert.match(html, /aria-label="Piglet processing actions">[\s\S]*?<h5[^>]*><span>Piglet processing<\/span><\/h5>/);
  assert.doesNotMatch(html, /Current task ·/);
  assert.match(html, /Edit litter record/);
  assert.ok(html.indexOf('aria-label="Farrowing actions"') < html.indexOf('aria-label="Piglet processing actions"'));
  assert.ok(html.indexOf('aria-label="Piglet processing actions"') < html.indexOf('aria-label="Shared actions"'));
  assert.doesNotMatch(html, /Other production actions|aria-label="Other actions"/);
  c.hostActions = actions.map(({ scope, ...action }) => action);
  const legacyHtml = model.overlay(c);
  assert.match(legacyHtml, /aria-label="Farrowing actions"/);
  assert.match(legacyHtml, /aria-label="Piglet processing actions"/);
  for (const id of ['remove-batch']) {
    const entry = actions.find(action => action.id === id);
    assert.equal(entry.group, 'production', id);
    assert.equal(entry.scope, 'other', id);
  }
  assert.equal(actions.find(action => action.id === 'not-in-pig').scope, 'farrowing');
  assert.ok(actions.find(action => action.id === 'move-batch').reason);
});
test('Farrowing actions use one note, one measurements entrance and no Feed category', () => {
  const s = farrowing.seed('count');
  const c = context('actions'); c.selected.add(c.pigId); c.batches = []; model.pig(c, c.pigId).stage = 'Farrowing'; c.hostActions = farrowing.sowActionCatalogue(s);
  const catalogue = model.actionCatalogue(c);
  assert.deepEqual(catalogue.groups.map(group => group.id), ['production', 'health', 'general']);
  const production = catalogue.groups.find(group => group.id === 'production').items;
  assert.equal(production.find(item => item.value === 'edit').section, 'farrowing');
  const general = catalogue.groups.find(group => group.id === 'general').items;
  assert.equal(general.filter(item => item.title === 'Edit note').length, 1);
  assert.equal(general.some(item => item.title === 'Add a note'), false);
  assert.equal(general.some(item => item.a === 'measurements-menu'), true);
  assert.equal(general.some(item => item.a === 'feed-edit-selected' && item.title === 'Adjust feed'), true);
  for (const action of ['body', 'weight', 'temperature', 'backfat']) assert.equal(general.some(item => item.a === action), false, action);
  const actionsHtml = model.overlay(c);
  assert.doesNotMatch(actionsHtml, /data-action-group="feed"|>Feed<\/button>/);
  c.view = 'measurements-menu';
  const menuHtml = model.overlay(c);
  for (const action of ['body', 'weight', 'temperature', 'backfat']) assert.match(menuHtml, new RegExp(`data-action="${action}"`), action);
});
test('stage-aware Production is available without a Farrowing host and comes first', () => {
  const standalone = context('actions'); standalone.selected.add(standalone.pigId);
  const standaloneHtml = model.overlay(standalone);
  assert.match(standaloneHtml, /data-action-group="production"/);
  assert.match(standaloneHtml, /aria-label="Pregnancy check actions"/);
  assert.match(standaloneHtml, /aria-label="Gestation actions"/);
  assert.match(standaloneHtml, /Batch membership/);
  assert.ok(standaloneHtml.indexOf('data-action-group="production"') < standaloneHtml.indexOf('data-action-group="health"'));
  const populated = context('actions'); populated.selected.add(populated.pigId);
  populated.hostActions = farrowing.sowActionCatalogue(farrowing.seed('count'));
  const html = model.overlay(populated);
  assert.ok(html.indexOf('data-action-group="production"') < html.indexOf('data-action-group="health"'));
});
test('Production hides actions from conflicting stages and shares only batch membership', () => {
  const gestating = context('actions'); gestating.selected.add(gestating.pigId);
  gestating.hostActions = [
    { id: 'mark-in-heat', title: 'Mark in heat', group: 'production', scope: 'breeding', sub: 'Start an in-heat task' },
    { id: 'edit', title: 'Edit litter record', group: 'production', scope: 'farrowing', sub: 'Correct a litter' },
  ];
  const gestatingProduction = model.actionCatalogue(gestating).groups.find(group => group.id === 'production').items;
  assert.equal(gestatingProduction.some(item => item.title === 'Mark in heat'), false);
  assert.equal(gestatingProduction.some(item => item.title === 'Edit litter record'), false);
  assert.equal(gestatingProduction.filter(item => item.a === 'batch-membership').length, 1);

  const grower = context('actions'); grower.selected = new Set(['000801']); grower.pigId = '000801';
  const growerProduction = model.actionCatalogue(grower).groups.find(group => group.id === 'production').items;
  assert.equal(growerProduction.some(item => item.title === 'Record miscarriage'), false);
  assert.equal(growerProduction.some(item => item.title === 'Pregnancy check'), false);
  assert.equal(growerProduction.filter(item => item.a === 'batch-membership').length, 1);
});
test('farrowing surface policy includes substantial pages but preserves review drawers', () => {
  for (const view of ['history', 'roomOverview', 'roomEndTask', 'roomTaskReceipt', 'roomTaskSows', 'roomPenDetail', 'roomPenFeed', 'roomPenLog', 'marker', 'pigletCare', 'pigletEdit', 'foster', 'pigletDeath', 'countReconcile']) assert.equal(surfaces.isPage('farrowing', view), true, view);
  for (const view of ['count', 'finish', 'locked', 'death', 'edit', 'editFinish', 'deathBreakdown']) assert.equal(surfaces.isPage('farrowing', view), false, view);
});
test('page conversion preserves actions and fields while removing duplicated exits', () => {
  const html = '<button class="scrim" data-action="dismiss"></button><section class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><header class="utility-header"><h3>Finish</h3><button data-action="dismiss">Close</button><button data-action="clear">Clear</button></header><div class="sheet-body"><input value="12.6"></div><div class="sheet-footer"><button data-action="returnCount">Back</button><button data-action="lock">Hold to finish</button></div></section>';
  const page = surfaces.present(html, { page: true, backAction: 'returnCount' });
  checkPage(page); assert.match(page, /data-action="clear"/); assert.match(page, /value="12.6"/); assert.match(page, /data-action="lock"/);
  const drawer = surfaces.present(html);
  assert.doesNotMatch(drawer, /data-presentation="page"/);
  assert.match(drawer, /class="surface-back record-back"/);
});
test('surface contexts are exact and drawers receive a footer Back', () => {
  const drawer = surfaces.present('<section class="sheet" role="dialog"><div class="sheet-body"></div></section>');
  assert.match(drawer, /class="sheet"[^>]*data-st-context="drawer"/);
  assert.match(drawer, /<footer class="sheet-footer"><button[^>]*data-action="back"/);
  assert.doesNotMatch(drawer, /sheet-body[^>]*data-st-context/);
  const page = surfaces.present('<section class="sheet" role="dialog"><div class="sheet-body"></div></section>', {page:true});
  assert.match(page, /class="sheet"[^>]*data-st-context="page"/);
});
