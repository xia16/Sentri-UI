// Owner, 6 Nov: Add lane adds straight away (there is only one place a lane can go); no ▾ switcher in Edit (the panel's Inside and ‹ move you);
// while placing, reshaping or ticking pens in a room the camera zooms in so the room fills the map, and goes back after.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

once("run: () => this.edStartPlace('lane') }", "run: () => this.addLane(rcur.id) }");
once("const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u), canSwitch = P.cur.kind !== 'farm' && P.cur.kind !== 'pen';", "const H = OVH, K = H.K, O = this.ovS(), P = this.ovPlace(u), canSwitch = false;");
// the camera: a room task gets the whole map; a page keeps the panel's room
once("if (this.ovEdOn && this.ovEdOn(u)) { /* ovEdIns */ ins.l = 28; ins.t = 88;", "if (this.ovEdOn && this.ovEdOn(u) && u.view === 'room' && this.edMapTask && this.edMapTask(u)) { ins.l = 20; ins.r = 20; ins.t = 96; ins.b = 80; return ins; }\n    if (this.ovEdOn && this.ovEdOn(u)) { /* ovEdIns */ ins.l = 28; ins.t = 88;");
once("if (!(u.tool === 'lane' || u.tool === 'row')) this.edHideGhost(); const placing", "const mapTask = this.edMapTask(u); if (mapTask !== !!this.edRT) { this.edRT = mapTask; if (mapTask) { this.edPlanWas = !!u.plan; setTimeout(() => { if (!this.ui().plan) this.put({ plan: true }); this.reframe(550); }, 0); } else { const back = !!this.edPlanWas; setTimeout(() => { if (!!this.ui().plan !== back) this.put({ plan: back }); this.reframe(550); }, 0); } } if (!(u.tool === 'lane' || u.tool === 'row')) this.edHideGhost(); const placing");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
