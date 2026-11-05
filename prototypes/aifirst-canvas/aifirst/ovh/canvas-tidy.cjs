// Two farm pages: Farm view and Farm Layout Setup, each one live frame + one board of screenshots. Everything else from those pages goes to the archive page.
const fs = require('fs');
const [live, out, fvH, lyH] = process.argv.slice(2);
const L = JSON.parse(fs.readFileSync(live, 'utf8'));
const OLD = ['farm-view', 'rearranged', 'overhaul', 'overhaul-pig', 'overhaul-eq', 'layout', 'layout-view', 'layout-steps', 'layout-hand', 'layout-pens'];
const KEEP = { 'L3JS_LcRoom.dc.html': 'farm-view', 'FarmViewShots.dc.html': 'farm-view', 'L3JS_Room.dc.html': 'layout', 'LayoutShots.dc.html': 'layout' };
// the archive grows below what it already holds
let ay = 0; Object.values(L.boards).forEach((b) => { if (b.page === 'archive') ay = Math.max(ay, (b.y || 0) + (b.h || 0)); });
ay += 400; let ax = 0, rowH = 0, moved = 0;
Object.entries(L.boards).forEach(([k, b]) => {
  if (OLD.indexOf(b.page) < 0 || KEEP[k]) return;
  if (ax > 6000) { ax = 0; ay += rowH + 200; rowH = 0; }
  b.page = 'archive'; b.x = ax; b.y = ay; ax += (b.w || 1360) + 100; rowH = Math.max(rowH, b.h || 830); moved++;
});
const put = (k, o) => { L.boards[k] = Object.assign(L.boards[k] || {}, o); if (Array.isArray(L.order) && L.order.indexOf(k) < 0) L.order.push(k); };
put('L3JS_LcRoom.dc.html', { x: 0, y: 0, w: 1360, h: 830, title: 'Farm view, live: click around', page: 'farm-view', is_interactive: true });
put('FarmViewShots.dc.html', { x: 1460, y: 0, w: 2080, h: +fvH, title: 'Farm view: every state (screenshots)', page: 'farm-view', is_interactive: false });
put('L3JS_Room.dc.html', { x: 0, y: 0, w: 1360, h: 830, title: 'Farm Layout Setup, live: the editor', page: 'layout', is_interactive: true });
put('LayoutShots.dc.html', { x: 1460, y: 0, w: 2080, h: +lyH, title: 'Farm Layout Setup: every state (screenshots)', page: 'layout', is_interactive: false });
// pages: the two farm pages side by side; the rest of the farm pages go
const fi = L.pages.findIndex((p) => p.id === 'farm-view');
L.pages = L.pages.filter((p) => OLD.indexOf(p.id) < 0);
L.pages.splice(Math.max(0, Math.min(fi, L.pages.length)), 0, { id: 'farm-view', name: 'Farm view' }, { id: 'layout', name: 'Farm Layout Setup' });
fs.writeFileSync(out, JSON.stringify(L, null, 2));
const n = {}; Object.values(L.boards).forEach((b) => { n[b.page] = n[b.page] || [0, 0]; n[b.page][0]++; if (b.is_interactive) n[b.page][1]++; });
console.log('moved', moved); L.pages.forEach((p) => console.log(p.id.padEnd(14), JSON.stringify(n[p.id] || [0, 0]), p.name));
