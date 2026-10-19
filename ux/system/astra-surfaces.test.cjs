const test = require('node:test');
const assert = require('node:assert/strict');
require('../design-system/components/bundle.js');
require('./astra-surfaces.js');
const surfaces = globalThis.AstraSurfaces;
require('../design-system/components/bundle.js');
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
  // Headers law (2026-10-13): a page's one Back is at the top left of its page header; its footer has no Back.
  assert.equal((html.match(/class="st-page-back" data-action="(?:back|returnCount|room-back)"/g) || []).length, 1);
  assert.doesNotMatch(html, /class="[^"]*\bsurface-back\b[^"]*"/);
  assert.doesNotMatch(html, /class="scrim"|class="grab"|aria-modal="true"/);
}

for (const view of ['pig', 'pig-profile', 'pig-production', 'pig-origin', 'pig-log', 'pig-feed', 'pig-feed-curve', 'pig-feed-changes', 'history', 'pen-detail', 'pen-log', 'feed', 'unit-detail', 'environment', 'equipment', 'batch-detail']) {
  test(`${view} renders as a page with one navigation exit`, () => checkPage(model.overlay(context(view))));
}
for (const view of ['body', 'note', 'weight', 'temperature', 'backfat']) {
  test(`single-pig ${view} keeps a drawer and bottom Back`, () => {
    const c = context('pig'); c.selected.add(c.pigId); model.openBulkAction(c, view);
    const html = model.overlay(c);
    assert.doesNotMatch(html, /data-presentation="page"|drawer-header-back/);
    assert.equal((html.match(/data-action="back"/g) || []).length, 1);
    assert.match(html, /class="sheet-footer"/);
  });
}
test('Record health is a full page like Record treatment (owner, 2026-10-17)', () => {
  const c = context('pig'); c.selected.add(c.pigId); model.openBulkAction(c, 'health');
  checkPage(model.overlay(c)); assert.match(model.overlay(c), /data-action="bulk-save"/);
});
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
  assert.match(html, /class="drawer-background chooser-background" inert aria-hidden="true"/);
  assert.match(html, /data-presentation="page"/);
  assert.match(html, /data-bulk-key="dose"[^>]*value="2"/);
  assert.match(html, /class="sheet picker-step medicine-picker-step"/);
});
test('pig page has Actions without assumed quick actions', () => {
  const html = model.overlay(context('pig'));
  const footer = html.slice(html.indexOf('class="sheet-footer'));
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

// More actions is a menu drawer (owner, 2026-10-19): the everyday verbs are one grid of an icon and one word; Production keeps described rows.
function checkMenuDrawer(html) {
  assert.doesNotMatch(html, /data-presentation="page"|action-category/);
  assert.match(html, /data-st-context="menu"/);
  assert.equal((html.match(/data-action="back"/g) || []).length, 1);
  assert.match(html, /class="sheet-footer"/);
}
test('Actions is a menu drawer: everyday verbs as a grid, Production as navigation rows', () => {
  const c=context('actions');c.selected.add(c.pigId);
  const html=model.overlay(c);
  checkMenuDrawer(html);
  const grid=html.match(/<div class="st-panel st-row-grid[^"]*"[^>]*style="--st-row-grid-cols:(\d+)">([\s\S]*?)<\/div><\/section>/);
  assert.ok(grid,'everyday grid');
  const tiles=grid[2].match(/class="st-row-tile[" ]/g).length;
  assert.equal(+grid[1],Math.ceil(tiles/2),'two rows, split evenly');
  assert.match(grid[2],/aria-label="Condition, Disease or symptom"[^>]*>[\s\S]*?<span class="st-row-tile-label">Condition<\/span>/);
  assert.match(grid[2],/aria-label="Treat, Record treatment"[^>]*>[\s\S]*?<span class="st-row-tile-label">Treat<\/span>/,'a word that is only a prefix (treat-ment) does not count');
  assert.match(grid[2],/aria-label="Add a note"[^>]*>[\s\S]*?<span class="st-row-tile-label">Note<\/span>/,'a name that holds the whole word stays as it is');
  for(const group of html.match(/<div class="[^"]*compact-actions[^"]*">/g)||[]) {
    assert.match(group,/st-action-list/);
    assert.match(group,/st-panel/);
    assert.match(group,/st-row-group/);
  }
});
test('the verb grid keeps two even rows and folds past ten into More', () => {
  const c=context('actions');c.selected.add(c.pigId);
  const items=n=>Array.from({length:n},(_,i)=>({a:'note',k:'note',title:'Verb '+i,sub:'',value:String(i)}));
  const cols=html=>+html.match(/--st-row-grid-cols:(\d+)/)[1],count=html=>html.match(/class="st-row-tile[" ]/g).length;
  for(const [n,expected] of [[2,1],[5,3],[6,3],[7,4],[8,4],[10,5]]) assert.equal(cols(model.verbGrid(c,items(n))),expected,n+' verbs');
  const folded=model.verbGrid(c,items(12));
  assert.equal(count(folded),10);assert.match(folded,/data-action="actions-grid-all"/);assert.equal(cols(folded),5);
  c.actionsGridAll=true;assert.equal(count(model.verbGrid(c,items(12))),12);
  const death=model.verbGrid({},[{a:'sow-host-action',k:'alert',title:'Record sow death',sub:'',value:'sow-death'},...items(3)]);
  assert.ok(death.lastIndexOf('is-danger')>death.lastIndexOf('Verb 2'),'Death is the last verb');
  const foldedDeath=model.verbGrid({},[{a:'sow-host-action',k:'alert',title:'Record sow death',sub:'',value:'sow-death'},...items(11)]);
  assert.match(foldedDeath,/is-danger/,'Death never folds behind More');
  assert.equal(count(foldedDeath),10);
  assert.ok(foldedDeath.indexOf('data-action="actions-grid-all"')<foldedDeath.indexOf('is-danger'),'More sits before Death: Death is the last tile');
});

test('a sow\'s existing note keeps its row under the grid; only bare verbs become tiles', () => {
  const c=context('actions');c.selected.add(c.pigId);
  c.hostActions=[{id:'marker',title:'Edit note',content:true,group:'routine',sub:'Red line on left shoulder',icon:'note'},{id:'transfer',title:'Transfer sow',group:'routine',sub:'Move this sow to another unit or pen',icon:'transfer'}];
  const html=model.overlay(c);
  assert.match(html,/data-action-group="content"[\s\S]*?<strong>Edit note<\/strong><small>Red line on left shoulder<\/small>/);
  assert.doesNotMatch(html,/class="st-row-tile[^"]*"[^>]*data-value="marker"/);
  assert.match(html,/class="st-row-tile[^"]*"[^>]*data-value="transfer"/);
  assert.ok(html.indexOf('data-action-group="everyday"')<html.indexOf('data-action-group="content"'));
});

test('a group of pigs without ear tags alone is offered Condition only: no verb that cannot act on it', () => {
  const c=context('actions');c.selected.clear();
  const penWithGroup=c.pens.find(p=>p.untagged?.count);
  if(!penWithGroup)return; // seed without untagged groups
  c.selectedNoTags=new Set([penWithGroup.id]);c.noTagsCount={[penWithGroup.id]:penWithGroup.untagged.count};
  const actions=model.actionCatalogue(c).groups.flatMap(g=>g.items).map(x=>x.a);
  assert.deepEqual(actions,['health']);
});

test('pen Actions is a menu drawer too', () => {
  const c=context('actions');c.actionScope='pens';c.selectedPens.add('C1');
  checkMenuDrawer(model.overlay(c));
});

test('the verb words come from the strings registry, and Transfer is not the registered verb Move', () => {
  const c=context('actions');c.selected.add(c.pigId);
  c.hostActions=farrowing.sowActionCatalogue(farrowing.seed('count'));
  const labels=[...model.overlay(c).matchAll(/<span class="st-row-tile-label">([^<]+)<\/span>/g)].map(m=>m[1]);
  assert.ok(labels.includes('Transfer'));assert.ok(!labels.includes('Move'));
  const registry=require('../laws/strings.json').strings;
  for(const label of labels)assert.ok(Object.entries(registry).some(([id,s])=>id.startsWith('actions.tile.')&&s.en===label&&s.zh),label);
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
  assert.deepEqual(catalogue.groups.map(group => group.id), ['health', 'routine', 'production']);
  const production = catalogue.groups.find(group => group.id === 'production').items;
  assert.equal(production.find(item => item.value === 'edit').section, 'farrowing');
  const general = catalogue.groups.find(group => group.id === 'routine').items;
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
test('stage-aware Production is available without a Farrowing host and follows the everyday verbs', () => {
  const standalone = context('actions'); standalone.selected.add(standalone.pigId);
  const standaloneHtml = model.overlay(standalone);
  assert.match(standaloneHtml, /data-action-group="production"/);
  assert.match(standaloneHtml, /Pregnancy check/);
  assert.match(standaloneHtml, /Record abortion/);
  assert.match(standaloneHtml, /Batch membership/);
  // Three rows share one card: no task sub-headings until Production has more than three.
  assert.doesNotMatch(standaloneHtml, /production-action-cluster/);
  assert.ok(standaloneHtml.indexOf('data-action-group="production"') > standaloneHtml.indexOf('data-action-group="everyday"'));
  const populated = context('actions'); populated.selected.add(populated.pigId);
  populated.hostActions = farrowing.sowActionCatalogue(farrowing.seed('count'));
  const html = model.overlay(populated);
  assert.ok(html.indexOf('data-action-group="production"') > html.indexOf('data-action-group="everyday"'));
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
  assert.equal(growerProduction.some(item => item.title === 'Record abortion'), false);
  assert.equal(growerProduction.some(item => item.title === 'Pregnancy check'), false);
  assert.equal(growerProduction.filter(item => item.a === 'batch-membership').length, 1);
});
test('farrowing surface policy includes substantial pages but preserves review drawers', () => {
  for (const view of ['history', 'roomOverview', 'roomEndTask', 'roomTaskReceipt', 'roomTaskSows', 'roomPenDetail', 'roomPenFeed', 'roomPenLog', 'marker', 'pigletCare', 'pigletEdit', 'foster', 'pigletDeath', 'countReconcile']) assert.equal(surfaces.isPage('farrowing', view), true, view);
  for (const view of ['count', 'finish', 'locked', 'death', 'edit', 'editFinish', 'deathBreakdown']) assert.equal(surfaces.isPage('farrowing', view), false, view);
});
