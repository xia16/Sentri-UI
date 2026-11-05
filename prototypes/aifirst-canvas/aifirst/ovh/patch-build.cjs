// Wires the rearranged farm view (ovh-comp3.js) into the overlay sources.
const fs = require('fs'), S = process.argv[2];
const rd = (n) => fs.readFileSync(S + '/' + n, 'utf8'), wr = (n, s) => fs.writeFileSync(S + '/' + n, s);
let miss = 0;
const rep = (s, a, b, tag) => { if (s.includes(b) && !s.includes(a)) return s; if (!s.includes(a)) { console.log('MISS ' + (tag || a.slice(0, 80))); miss++; return s; } return s.split(a).join(b); };
let c = rd('ovh-comp.js'), c2 = rd('ovh-comp2.js'), p2 = rd('ovh-pages2.js'), lib = rd('ovh-lib.js'), ap = rd('apply-ovh.cjs');
// actions of the new layout run first
c = rep(c, "    if (k === 'noop') return;\n", "    if (k === 'noop') return;\n    if (this.ovAct3 && this.ovAct3(k, v, h, at)) return;\n", 'act3');
// Esc ends select mode / the ticks before anything else
c = rep(c, "if (O.pop) { this.ovSet({ pop: '' }); return; } if (O.picking)", "if (O.pop) { this.ovSet({ pop: '' }); return; } if (O.selecting || (O.ticks && O.ticks.length)) { this.ovAct('selcancel'); return; } if (O.picking)", 'esc');
// the old camera toolbar hides; its handlers drive the 3D menu
c = rep(c, "    r.setOvh = (el) => this.setOvh(el);\n", "    r.setOvh = (el) => this.setOvh(el);\n    this.ovVals = r;\n    if (this.ovOn()) r.camStyle = (r.camStyle || '') + ' display: none;';\n", 'vals');
// Devices: humidity joins the readings; each reading opens its own trend
p2 = rep(p2, "etile(I.temp, 'Temperature', '22.4 °C', { a: 'trendt' }), etile(I.air, 'Ammonia', gest ? '9.4 ppm · high' : '6.8 ppm', { warn: gest, a: 'trendt' })", "etile(I.temp, 'Temperature', '22.4 °C', { a: 'trendt:temp' }), etile(I.drop, 'Humidity', '61 %', { a: 'trendt:hum' }), etile(I.air, 'Ammonia', gest ? '9.4 ppm · high' : '6.8 ppm', { warn: gest, a: 'trendt:nh3' })", 'humidity');
// her litters: Performance lives only in the button at the bottom
p2 = rep(p2, "H.sec('Her litters', '<span' + A('pigperf') + ' style=\"' + st({ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }) + '\">Performance' + icon(I.chev, 14) + '</span>')", "H.sec('Her litters', '')", 'perf link');
// the legend is the key: no ring tooltip; the chosen row is a fill inside its card
c2 = rep(c2, ", tip: 'ring-task' })", " })", 'ring tip');
lib = rep(lib, "height: (o.h || 36) + 'px', margin: '0 -8px', padding: '0 8px', borderRadius: '8px', borderTop: i ? '1px solid ' + K.line : '0', background: on ? K.press : 'transparent', boxShadow: on ? 'inset 0 0 0 1.5px ' + K.ink : 'none',", "height: (o.h || 36) + 'px', margin: '0', padding: '0 8px', borderRadius: '8px', borderTop: i ? '1px solid ' + K.line : '0', background: on ? K.press : 'transparent', boxShadow: 'none',", 'legend');
// a trend opened from a tile stays on screen
c2 = rep(c2, "if (O.pop === 'trend') return box(this.ovTrend(O.trendKind || 'nh3', u), { left: at.x + 'px', top: (at.y + at.h + 8) + 'px' }, 292);", "if (O.pop === 'trend') return box(this.ovTrend(O.trendKind || 'nh3', u), { left: Math.max(16, Math.min(at.x, ((this.ovEl && this.ovEl.clientWidth) || 1360) - 308)) + 'px', top: (at.y + at.h + 8) + 'px' }, 292);", 'trend pos');
// the canvas starts: Devices from the bar, the switcher, and three new states
c2 = rep(c2, "const h = this.ovBody && this.ovBody.querySelector('[data-a=\"equip\"]'); if (h) this.ovAct('equip', h); if (o) this.ovSet(o);", "this.ovAct('devices'); if (o) this.ovSet(o);", 'eq start');
c2 = rep(c2, "lctrend: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => { const h = this.ovBody && this.ovBody.querySelector('[data-a=\"trend\"]'); if (h) this.ovAct('trend', h); }, 500); } },", "lctrend: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => { this.ovAct('devices'); setTimeout(() => { const h = this.ovBody && this.ovBody.querySelector('[data-a=\"trendt:nh3\"]'); if (h) this.ovAct('trendt:nh3', h); }, 120); }, 500); } },", 'lctrend');
c2 = rep(c2, "lcsiblings: { O: {}, after: () => { this.goRoom('fr2'); setTimeout(() => this.ovSet({ loc: 'hover', crumb: 1 }), 500); } },", "lcsiblings: { O: {}, after: () => { this.goRoom('fr2'); setTimeout(() => this.ovSet({ pop: 'switch' }), 500); } },\n      lcview: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => this.ovSet({ pop: 'view' }), 500); } },\n      lcselect: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => { this.ovPlanIn(); this.ovSet({ selecting: true, picked: ['B15', 'B20', 'D40'], actOff: 0 }); this.ovPsel = 'B15,B20,D40'; this.setSel(['B15', 'B20', 'D40']); }, 400); } },\n      lcticks: { O: {}, after: pick('n1', 'B7', () => { const O = this.ovS(), q = this.ovPenData('n1', 'B7'); this.ovSet({ ticks: q.tagged.slice(0, 2).map((x) => x[0]) }); }) },\n      lcpigs: { O: {}, after: () => { this.goRoom('g2'); setTimeout(() => this.ovAct('pigspanel'), 500); } },", 'new starts');
// the new methods ride in after comp2
ap = rep(ap, "fs.readFileSync(path.join(S, 'ovh-comp2.js'), 'utf8') + '\\n  renderVals() {", "fs.readFileSync(path.join(S, 'ovh-comp2.js'), 'utf8') + (fs.existsSync(path.join(S, 'ovh-comp3.js')) ? '\\n' + fs.readFileSync(path.join(S, 'ovh-comp3.js'), 'utf8') : '') + '\\n  renderVals() {", 'apply comp3');
if (miss) { console.log('misses', miss); process.exit(1); }
wr('ovh-comp.js', c); wr('ovh-comp2.js', c2); wr('ovh-pages2.js', p2); wr('ovh-lib.js', lib); wr('apply-ovh.cjs', ap); console.log('patched');
