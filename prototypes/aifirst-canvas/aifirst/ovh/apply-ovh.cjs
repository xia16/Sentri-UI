// Applies the overhaul layer to ActLayout3JS.dc.html (idempotent: it rebuilds the OVH block between markers).
const fs = require('fs'), path = require('path');
const S = path.dirname(__filename);
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
const lib = fs.readFileSync(path.join(S, 'ovh-lib.js'), 'utf8') + '\n' + fs.readFileSync(path.join(S, 'ovh-pages.js'), 'utf8') + (fs.existsSync(path.join(S, 'ovh-pages2.js')) ? '\n' + fs.readFileSync(path.join(S, 'ovh-pages2.js'), 'utf8') : '');
let comp = fs.readFileSync(path.join(S, 'ovh-comp.js'), 'utf8');
if (fs.existsSync(path.join(S, 'ovh-comp2.js'))) comp = comp.replace('  renderVals() {\n    const r = this.renderValsBase();', fs.readFileSync(path.join(S, 'ovh-comp2.js'), 'utf8') + (fs.existsSync(path.join(S, 'ovh-comp3.js')) ? '\n' + fs.readFileSync(path.join(S, 'ovh-comp3.js'), 'utf8') : '') + '\n  renderVals() {\n    const r = this.renderValsBase();');
const M1 = '// >>>OVH-LIB', M2 = '// <<<OVH-LIB', C1 = '  // >>>OVH-COMP', C2 = '  // <<<OVH-COMP';
const need = (cond, what) => { if (!cond) { console.error('MISS ' + what); process.exit(1); } };
// 1) the library, before the component class
if (s.includes(M1)) s = s.slice(0, s.indexOf(M1)) + M1 + '\n' + lib + '\n' + M2 + s.slice(s.indexOf(M2) + M2.length);
else { const i = s.indexOf('class Component extends DCLogic {'); need(i > 0, 'class'); s = s.slice(0, i) + M1 + '\n' + lib + '\n' + M2 + '\n' + s.slice(i); }
// 2) the component methods, before renderVals (the original becomes renderValsBase)
if (s.includes(C1)) s = s.slice(0, s.indexOf(C1)) + C1 + '\n' + comp + C2 + s.slice(s.indexOf(C2) + C2.length);
else { const i = s.indexOf('\n  renderVals() {\n'); need(i > 0, 'renderVals'); s = s.slice(0, i) + '\n' + C1 + '\n' + comp + C2 + '\n  renderValsBase() {\n' + s.slice(i + '\n  renderVals() {\n'.length); }
// 3) paint after every update
if (!s.includes('this.ovPaint(); // ovh')) { const a = '  componentDidUpdate() {\n    this.dirty = true;\n'; need(s.includes(a), 'didUpdate'); s = s.replace(a, a + '    this.ovPaint(); // ovh\n'); }
// 4) the overlay host in the template
if (!s.includes('ref="{{setOvh}}"')) { const a = '<div ref="{{setLabels}}" aria-label="Labels" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden"></div>'; need(s.includes(a), 'labels'); s = s.replace(a, a + '\n    <div ref="{{setOvh}}" style="position: absolute; inset: 0; pointer-events: none; z-index: 30; font-family: \'Geist\', system-ui, sans-serif"></div>'); }
// 5) Batch 32 runs Farrowing and the Post-farrowing check (the boards' demo)
if (!s.includes("id: 'farrow', title: 'Farrowing'")) {
  const a = s.indexOf("tasks: [{ id: 'lact', title: 'Lactation'"), b = s.indexOf('sched: [', a);
  need(a > 0 && b > a, 'b32 tasks');
  s = s.slice(0, a) + "tasks: [{ id: 'farrow', title: 'Farrowing', when: 'Day 3 of 7', goal: 'done', goalWord: 'done',\n          states: [{ id: 'done', label: 'Done', col: G }, { id: 'active', label: 'Active', col: B }, { id: 'await', label: 'Awaiting', col: N }],\n          share: { done: 31, active: 4, await: 15 }, why: { done: 'Farrowed', active: 'Farrowing now', await: 'Due this week' } },\n          { id: 'post', title: 'Post-farrowing check', when: 'Day 3', goal: 'checked', goalWord: 'checked',\n          states: [{ id: 'checked', label: 'Checked', col: G }, { id: 'recheck', label: 'Recheck', col: A }, { id: 'todo', label: 'To do', col: N }],\n          share: { checked: 25, recheck: 3, todo: 3 }, why: { checked: 'Checked, all fine', recheck: 'Recheck: udder and milk', todo: 'Check due today' } }],\n        " + s.slice(b);
}
// 6) a legend row or ring part clicked: only those pens keep their colour
if (!s.includes('u.bvOnly && ')) {
  const a = "if (bv.task) { const d = this.bvStateDef(String(bv.id), this.bvState(String(bv.id), roomId, code, bv.task), bv.task); if (d) return d.col; }";
  need(s.includes(a), 'bvColor');
  s = s.replace(a, "if (bv.task) { const sx = this.bvState(String(bv.id), roomId, code, bv.task); if (u.bvOnly && sx !== u.bvOnly) return '#F4F3EE'; const d = this.bvStateDef(String(bv.id), sx, bv.task); if (d) return d.col; }");
}
fs.writeFileSync(f, s);
console.log('applied', s.length);
// 7) the pen hover on the farm, in the new language
s = fs.readFileSync(f, 'utf8');
if (!s.includes('this.ovPenTip(hit)')) { const a = "    if (this.tipFor !== key) {\n      const i = this.pigInfo(hit.rm, hit.pen)"; if (!s.includes(a)) { console.error('MISS tip'); process.exit(1); } s = s.replace(a, "    if (this.tipFor !== key && this.ovOn() && this.ovPenTip) { el.innerHTML = this.ovPenTip(hit); this.tipFor = key; }\n" + a); }
// 8) Compare on the farm: pens below the batch take the amber fill
if (!s.includes('u.ovCmp && ')) { const a = "    if (cell.flag) return cell.flag.lvl === 'urgent' ? '#E7A196' : '#EFCF8C';\n    if (bv.task) {"; if (!s.includes(a)) { console.error('MISS cmp'); process.exit(1); } s = s.replace(a, "    if (u.ovCmp && this.ovOn(u)) return (this.hs(roomId + code) % 4 === 0) ? '#EBC27E' : '#E6EAE2';\n" + a); }
// 9) in Compare, a pig clicked keeps the batch open (her card opens beside it)
if (!s.includes('ovS().panel === \'compare\') return;')) { const a = "  leaveBatch() { const u = this.ui();"; if (!s.includes(a)) { console.error('MISS leave'); process.exit(1); } s = s.replace(a, "  leaveBatch() { if (this.ovOn && this.ovOn() && this.ovS().panel === 'compare') return; const u = this.ui();"); }
fs.writeFileSync(f, s); console.log('applied 2');
// 10) the camera frames the farm around the new small card, the bar and the panel only when it is open
s = fs.readFileSync(f, 'utf8');
if (!s.includes('ovInsets')) { const a = "    if (this.IP && u.mode === 'saved' && u.vm === 'view') {"; if (!s.includes(a)) { console.error('MISS insets'); process.exit(1); } s = s.replace(a, "    if (this.ovOn && this.ovOn(u)) { const O = this.ovS(); /* ovInsets */ ins.l = 28; ins.t = 84; ins.b = 92; ins.r = O.panel ? 412 + (O.her && O.panel === 'compare' ? 376 : 0) : 28; return ins; }\n" + a); }
fs.writeFileSync(f, s); console.log('applied 3');
// 11) a sow with her litter counts as a sow when a kind is shown
s = fs.readFileSync(f, 'utf8');
if (!s.includes("vf.id === 'sow' && cell.kind === 'litter'")) { const a = "locationMatches(cell, vf) { return !!cell && (vf.kind === 'stage' ? cell.kind === vf.id :"; if (!s.includes(a)) { console.error('MISS lm'); process.exit(1); } s = s.replace(a, "locationMatches(cell, vf) { return !!cell && (vf.kind === 'stage' ? (cell.kind === vf.id || (vf.id === 'sow' && cell.kind === 'litter')) :"); }
fs.writeFileSync(f, s); console.log('applied 4');
// 12) the overhaul frames are shown in daylight, whatever the clock says
s = fs.readFileSync(f, 'utf8');
if (!s.includes('/* ovDay */')) { const a = "    if (s === 'night' || s === 'intronight') return true;"; if (!s.includes(a)) { console.error('MISS night'); process.exit(1); } s = s.replace(a, a + "\n    if (/^(bx|pg|lc|eq|fl)[a-z]+$/.test(s)) return false; /* ovDay */"); }
fs.writeFileSync(f, s); console.log('applied 5');
// 13) a picked pen reads at a glance: a thick dark frame inside the pen, a white halo just outside it
s = fs.readFileSync(f, 'utf8');
if (!s.includes('/* ovSel */')) {
  const a = "const selIM = new T.InstancedMesh(this.unitBox, new T.MeshBasicMaterial({ color: '#121815' }), 1200);";
  const b = "      const put = (x, z, sx, sz) => { pos.set(x, y, z); sc.set(sx, 0.03, sz); m.compose(pos, q, sc); rm.selIM.setMatrixAt(n++, m); };\n      put(p.x, p.z + p.sz / 2 - t / 2, p.sx, t); put(p.x, p.z - p.sz / 2 + t / 2, p.sx, t);\n      put(p.x - p.sx / 2 + t / 2, p.z, t, p.sz - 2 * t); put(p.x + p.sx / 2 - t / 2, p.z, t, p.sz - 2 * t);";
  const c = "    rm.selIM.count = n; rm.selIM.instanceMatrix.needsUpdate = true;\n  }";
  if (!s.includes(a) || !s.includes(b) || !s.includes(c)) { console.error('MISS sel'); process.exit(1); }
  s = s.replace(a, "const selIM = new T.InstancedMesh(this.unitBox, new T.MeshBasicMaterial({ color: '#FFFFFF' }), 2400); /* ovSel */");
  s = s.replace(b, "      const ring = (w, out, col, yy) => { const o = out ? w : 0, X = p.sx + 2 * o, Z = p.sz + 2 * o, put = (x, z, sx, sz) => { if (n >= 2400) return; pos.set(x, yy, z); sc.set(sx, 0.03, sz); m.compose(pos, q, sc); rm.selIM.setMatrixAt(n, m); rm.selIM.setColorAt(n++, col); };\n        put(p.x, p.z + Z / 2 - w / 2, X, w); put(p.x, p.z - Z / 2 + w / 2, X, w); put(p.x - X / 2 + w / 2, p.z, w, Z - 2 * w); put(p.x + X / 2 - w / 2, p.z, w, Z - 2 * w); };\n      ring(t * 1.6, true, this.ovSelW || (this.ovSelW = new T.Color('#FFFFFF')), y); ring(t * 2.4, false, this.ovSelK || (this.ovSelK = new T.Color('#121815')), y + 0.01);");
  s = s.replace(c, "    rm.selIM.count = n; rm.selIM.instanceMatrix.needsUpdate = true; if (rm.selIM.instanceColor) rm.selIM.instanceColor.needsUpdate = true;\n  }");
}
fs.writeFileSync(f, s); console.log('applied 6');
// 14) a picked pen's code turns into a dark chip, so the pick reads even where the crate is thin
s = fs.readFileSync(f, 'utf8');
if (!s.includes('/* ovPick */')) {
  const a = "    if (kind === 'pen' && this.IP) return base + \"font-family: 'Geist Mono', ui-monospace, monospace; font-size:\" + (on ? '12.5px' : '11px') + '; line-height:15px; height:17px; padding:0 5px; font-weight:600; color:#1E2A22; background:rgba(255,255,255,0.93); border:1px solid #D5DAD2;";
  const b = "        if (L.kind === 'pen') on = !!L.big;";
  if (!s.includes(a) || !s.includes(b)) { console.error('MISS pick label'); process.exit(1); }
  s = s.replace(a, "    if (kind === 'pen' && this.IP && on === 2) return base + \"font-family: 'Geist Mono', ui-monospace, monospace; font-size:12.5px; line-height:15px; height:19px; padding:0 6px; font-weight:700; color:#FFFFFF; background:#121815; border:1.5px solid #FFFFFF; border-radius:6px; box-shadow:0 1px 4px rgba(18,24,21,0.35); pointer-events:none; z-index:4;\"; /* ovPick */\n" + a);
  s = s.replace(b, "        if (L.kind === 'pen') on = L.big ? ((u.psel || []).indexOf(L.pen && L.pen.code) >= 0 ? 2 : true) : false;");
}
fs.writeFileSync(f, s); console.log('applied 7');
// 15) a device shown from Devices: its icon sits in each pen it serves (odev pins), its line lights up
s = fs.readFileSync(f, 'utf8');
if (!s.includes('/* ovDev */')) {
  const r = [
    ["      else if (k === 'flag') want = roomView && !!this.IP && L.roomId === u.roomId && this.pk > 0.3;", "      else if (k === 'odev') want = roomView && L.roomId === u.roomId; /* ovDev */\n      else if (k === 'flag') want = roomView && !!this.IP && L.roomId === u.roomId && this.pk > 0.3;"],
    ["      else if (k === 'device') want = roomView && !intro && L.roomId === u.roomId && (!this.IP || !!u.lens);", "      else if (k === 'device') want = roomView && !intro && L.roomId === u.roomId && (!this.IP || !!u.lens || (this.ovDevWant && this.ovDevWant(L)));"],
    ["    else if (kind === 'flag') { if (L.text !== text)", "    else if (kind === 'odev') { if (L.text !== text) { L.text = text; L.el.innerHTML = '<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" style=\"width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round\"><path d=\"' + text + '\"></path></svg>'; L.w = 0; } }\n    else if (kind === 'flag') { if (L.text !== text)"],
    ["    if (kind === 'flag') return base + ", "    if (kind === 'odev') return base + 'z-index:3; width:22px; height:22px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:11px; background:#121815; color:#FFFFFF; border:1.5px solid #FFFFFF; box-shadow:0 1px 3px rgba(18,24,21,0.3); pointer-events:none;';\n    if (kind === 'flag') return base + "],
    ["    const flex = (L) => (L.kind === 'device' ||", "    const flex = (L) => (L.kind === 'odev' || L.kind === 'device' ||"],
    ["      Object.keys(rm.devLines || {}).forEach((id) => rm.devLines[id].forEach((m) => { m.visible = on; m.material = id === sid || u.dp === id ? this.mat.devLineOn : this.mat.devLine; }));\n    });", "      Object.keys(rm.devLines || {}).forEach((id) => rm.devLines[id].forEach((m) => { m.visible = on; m.material = id === sid || u.dp === id ? this.mat.devLineOn : this.mat.devLine; }));\n    });\n    if (this.ovDevLines) this.ovDevLines();"],
    ["        if (L.kind === 'device') on = roomView && !!(u.sel && u.sel.kind === 'device' && u.sel.id === L.devId);", "        if (L.kind === 'device') on = roomView && (!!(u.sel && u.sel.kind === 'device' && u.sel.id === L.devId) || !!(this.ovDevWant && this.ovDevWant(L)));"],
  ];
  r.forEach(([a, b]) => { if (!s.includes(a)) { console.error('MISS dev ' + a.slice(0, 60)); process.exit(1); } s = s.replace(a, b); });
}
fs.writeFileSync(f, s); console.log('applied 8');

// 16) the open camera's view on the floor is easier to see
s = fs.readFileSync(f, 'utf8');
if (!s.includes('/* ovCone */')) { const a = "new T.MeshBasicMaterial({ color: '#4F8A6C', transparent: true, opacity: 0.2, depthWrite: false, side: T.DoubleSide })"; if (!s.includes(a)) { console.error('MISS cone'); process.exit(1); } s = s.replace(a, "new T.MeshBasicMaterial({ color: '#2F6B4C', transparent: true, opacity: 0.34, depthWrite: false, side: T.DoubleSide }) /* ovCone */"); }
fs.writeFileSync(f, s); console.log('applied 9');
