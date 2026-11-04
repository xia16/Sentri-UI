// Adds the overhaul page and its live frames to canvas.json (merging onto the live index).
const fs = require('fs');
const [live, out] = process.argv.slice(2);
const L = JSON.parse(fs.readFileSync(live, 'utf8'));
const F = [
  ['L3JS_BxList', 'Batches: the list (open from the bar)'], ['L3JS_BxBatch', 'Batch 32: running tasks as rings, upcoming'], ['L3JS_BxTask', 'Farrowing running: half ring, legend filters the farm, KPIs'], ['L3JS_BxFilter', 'The parity filter, open'],
  ['L3JS_BxDates', 'All dates, opens on now'], ['L3JS_BxDone', 'A done task: outcomes, performance, piglets born'], ['L3JS_BxCompare', 'Compare: stacked bars; the farm tints pens below the batch'], ['L3JS_BxHer', 'Her card beside Compare'],
  ['L3JS_PgProfile', 'Pig profile from a pen: tags, cycle, tasks, litters, details'], ['L3JS_PgFlagged', 'Pig profile: a flagged sow'], ['L3JS_PgPerf', 'Her performance'], ['L3JS_PgLog', 'Her log'],
  ['L3JS_PgPen', 'A group pen: its pigs, scrolling, without ID'], ['L3JS_LcRoom', 'Location card at a room: chips'], ['L3JS_LcTrend', 'A sensor chip: its trend'], ['L3JS_LcSiblings', 'Location card: breadcrumb and siblings'],
  ['L3JS_EqTiles', 'Equipment from the bar: tiles'], ['L3JS_EqFan', 'A tile opened: the fan'], ['L3JS_EqPick', 'Heat lamps: pens picked in Plan, the bar is the control'], ['L3JS_FlAuto', 'Moving floor (demo): Auto'],
  ['L3JS_FlPinned', 'Moving floor: a run pinned, Show pens'], ['L3JS_FlManual', 'Moving floor: Manual'], ['L3JS_FlShow', 'Show pens: Plan with the pens that ran, task pill'],
];
// browsers keep ~16 live 3D views at once: three pages of at most 8 frames
const PG = [['overhaul', 'Farm view overhaul: batches', /^L3JS_Bx/], ['overhaul-pig', 'Farm view overhaul: pig and location', /^L3JS_(Pg|Lc)/], ['overhaul-eq', 'Farm view overhaul: equipment and floor', /^L3JS_(Eq|Fl)/]];
let at = L.pages.findIndex((p) => p.id === 'overhaul'); if (at < 0) at = L.pages.findIndex((p) => p.id === 'farm-view');
PG.forEach(([id, name], j) => { const ex = L.pages.find((p) => p.id === id); if (ex) ex.name = name; else L.pages.splice(at + j + (L.pages[at] && L.pages[at].id === 'overhaul' ? 0 : 1), 0, { id, name }); });
PG.forEach(([id, , re]) => { F.filter(([n]) => re.test(n)).forEach(([name, title], k) => {
  const key = name + '.dc.html';
  L.boards[key] = { x: (k % 4) * 1460, y: Math.floor(k / 4) * 1000, w: 1360, h: 830, title: title, page: id, is_interactive: true };
  if (Array.isArray(L.order) && L.order.indexOf(key) < 0) L.order.push(key);
}); });
fs.writeFileSync(out, JSON.stringify(L, null, 2));
console.log('boards', Object.keys(L.boards).length);
