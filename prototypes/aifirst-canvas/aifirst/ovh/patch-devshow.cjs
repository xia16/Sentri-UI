const fs = require('fs'), S = process.argv[2];
let c = fs.readFileSync(S + '/ovh-comp3.js', 'utf8'), p = fs.readFileSync(S + '/ovh-pages2.js', 'utf8');
const rep = (s, a, b) => { if (s.includes(b)) return s; if (!s.includes(a)) { console.log('MISS ' + a.slice(0, 70)); process.exit(1); } return s.split(a).join(b); };
// tile clicks show the device; leaving Devices clears it
c = rep(c, "    if (k === 'devices' || k === 'equip') { if (O.panel === 'devices') { this.ovSet({ panel: '', dev: '', pop: '' }); return true; }",
  "    if (k === 'devshow') { this.ovSet({ devShow: O.devShow === v ? '' : v }); return true; }\n    if (k === 'dev') { O.devShow = v === 'lamp1' ? 'lamps' : v; return false; }\n    if (k === 'devback') { O.devShow = ''; return false; }\n    if (k === 'trendt' && v === 'nh3') { O.devShow = 'nh3'; return false; }\n    if (k === 'devices' || k === 'equip') { if (O.panel === 'devices') { this.ovSet({ panel: '', dev: '', pop: '', devShow: '' }); return true; }");
c = rep(c, "    if (k === 'popclose' && O.panel === 'devices') { this.ovSet({ panel: '', dev: '', pop: '' }); return true; }",
  "    if (k === 'popclose' && O.panel === 'devices') { this.ovSet({ panel: '', dev: '', pop: '', devShow: '' }); return true; }");
// the shown tile wears the selected ring
c = rep(c, "    return OVH.head('Devices', E.pen ? 'Pen ' + E.pen : E.room, '') + '<div style=\"margin-top: 16px;\">' + t + '</div>';",
  "    if (O.devShow) { const a = { feed: 'devshow:feed', lamps: 'dev:lamps', floor: 'dev:floor', climate: 'devshow:climate', nh3: 'trendt:nh3' }[O.devShow]; if (a) t = t.replace('data-a=\"' + a + '\" style=\"', 'data-a=\"' + a + '\" style=\"box-shadow: inset 0 0 0 2px ' + OVH.K.ink + '; '); }\n    return OVH.head('Devices', E.pen ? 'Pen ' + E.pen : E.room, '') + '<div style=\"margin-top: 16px;\">' + t + '</div>';");
// apply after each paint
c = rep(c, "    const ps = (u.psel || []).join(',');\n    if (ps !== this.ovPsel) { this.ovPsel = ps; this.ovPicked(u); }\n    const H = OVH",
  "    const ps = (u.psel || []).join(',');\n    if (ps !== this.ovPsel) { this.ovPsel = ps; this.ovPicked(u); }\n    try { this.ovDevApply(u); } catch (e) { console.warn('ovDev', e); }\n    const H = OVH");
p = rep(p, "etile(I.chip, 'Climate', 'Auto · 22 °C')", "etile(I.chip, 'Climate', 'Auto · 22 °C', { a: 'devshow:climate' })");
p = rep(p, "etile(I.feeder, 'Feed line', gest ? 'Stopped' : 'Running', { fault: gest })", "etile(I.feeder, 'Feed line', gest ? 'Stopped' : 'Running', { fault: gest, a: 'devshow:feed' })");
fs.writeFileSync(S + '/ovh-comp3.js', c); fs.writeFileSync(S + '/ovh-pages2.js', p); console.log('ok');
