// Owner, 6 Nov: undo/redo sit with Done (one card); the farm's places for each stage shown, not folded; the Farm view panel drops below the bar
// when they would touch; picking a pig or pen brings it to the middle of the free map, and back to the room when it closes.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };
const all = (a, b) => { const n = s.split(a).length - 1; if (n < 1) { console.log('MISSING: ' + a.slice(0, 90)); process.exit(1); } s = s.split(a).join(b); };

// 1. one card bottom right: undo, redo, then Done
once("    return this.ovCard({ left: '120px', bottom: '16px' }, inner, { display: 'flex', alignItems: 'center', gap: '2px', padding: '6px' });", "    return inner;");
once("this.edHtml(u) + this.edUndoHtml() + (this.ovVals && this.ovVals.showMode === false ? '' : this.ovCard({ right: '16px', bottom: '16px' }, this.ovBtn(H.icon(H.I.check, 18) + H.esc((this.ovVals && this.ovVals.modeLabel) || 'Done'), 'vw:modeToggle', false, { background: H.K.ink, color: '#FFFFFF', fontWeight: 600, padding: '0 16px' })));",
  "this.edHtml(u) + this.ovCard({ right: '16px', bottom: '16px' }, this.edUndoHtml() + (this.ovVals && this.ovVals.showMode === false ? '' : '<i style=\"width: 1px; height: 24px; background: #DFE4D8; margin: 0 6px 0 4px; flex: none;\"></i>' + this.ovBtn(H.icon(H.I.check, 18) + H.esc((this.ovVals && this.ovVals.modeLabel) || 'Done'), 'vw:modeToggle', false, { background: H.K.ink, color: '#FFFFFF', fontWeight: 600, padding: '0 16px' })), { display: 'flex', alignItems: 'center', gap: '2px' });");

// 2. the farm: places for each stage, as plain rows
once("          P.rows.push(fold('stage', 'Places by stage'));\n          if (u.fold === 'stage') {\n            P.rows.push(row({ isGrid: true, items: tot.uses.map((x) => ({ label: x.name, value: x.n })) }));\n            if (tot.multi) P.rows.push(row({ isNote: true, text: 'Group pens count for every use they allow.' }));\n          }",
  "          P.rows.push(row({ isHead: true, label: 'Places for each stage' }));\n          tot.uses.forEach((x) => P.rows.push(row({ isText: true, label: x.name, value: x.n })));\n          if (tot.multi) P.rows.push(row({ isNote: true, text: 'Group pens count for every use they allow.' }));");

// 3. the Farm view panel never sits on the bar: when they would touch, it starts under the bar
all("this.ovBody.innerHTML = html; this.ovLast = html; this.ovLastPanel = O.panel;",
  "this.ovBody.innerHTML = html; this.ovLast = html; this.ovLastPanel = O.panel; { const pz = this.ovBody.querySelector('[data-zone=\"panel\"]'), lz = this.ovBody.firstElementChild, R = this.ovBody.getBoundingClientRect(); if (pz && lz && lz !== pz) { const a = lz.getBoundingClientRect(), b = pz.getBoundingClientRect(); if (a.right + 12 > b.left) { const top = Math.round(a.bottom - R.top + 8); pz.style.top = top + 'px'; pz.style.maxHeight = 'calc(100% - ' + (top + 88) + 'px)'; } } }");

// 4. a pig or pen picked: the camera brings it to the middle of the free map; closing goes back to the room
once("  presetFor(u) {\n    const TOP = 1.5702;\n    if (u.view === 'room') {\n      const rm = this.rooms.find((x) => x.id === u.roomId);\n",
  "  presetFor(u) {\n    const TOP = 1.5702;\n    if (u.view === 'room') {\n      const rm = this.rooms.find((x) => x.id === u.roomId);\n" +
  "      if (rm && this.ovOn && this.ovOn(u)) { const O = this.ovS(); if (O.pig && O.pig.roomId === rm.id && ['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) >= 0) { const p = rm.pens.concat(rm.spens || []).find((q) => q.code === O.pig.code); if (p) { const T = this.T, th = (rm.r.rot || 0) * Math.PI / 180, bx = new T.Box3(), m = 4.5; rm.g.updateMatrixWorld(true); [[-1, -1], [1, 1], [-1, 1], [1, -1]].forEach((q) => bx.expandByPoint(this.wpos(rm, p.x + q[0] * (p.sx / 2 + m), this.Y.YF, p.z + q[1] * (p.sz / 2 + m)).clone())); bx.expandByPoint(this.wpos(rm, p.x, this.Y.YF + 2.4, p.z).clone()); return this.fitCam(bx, 1.22 + th, 0.95, this.insets(u)); } } if (O.focus && O.focus.roomId === rm.id && (O.focus.codes || []).length && O.panel) { const T = this.T, th = (rm.r.rot || 0) * Math.PI / 180, bx = new T.Box3(), m = 3.5, all = rm.pens.concat(rm.spens || []); rm.g.updateMatrixWorld(true); O.focus.codes.forEach((c) => { const p = all.find((q) => q.code === c); if (!p) return; [[-1, -1], [1, 1], [-1, 1], [1, -1]].forEach((q) => bx.expandByPoint(this.wpos(rm, p.x + q[0] * (p.sx / 2 + m), this.Y.YF, p.z + q[1] * (p.sz / 2 + m)).clone())); }); if (!bx.isEmpty()) return this.fitCam(bx, 1.22 + th, 0.95, this.insets(u)); } }\n");
once("    if (ps !== this.ovPsel) { this.ovPsel = ps; this.ovPicked(u); }\n", "    if (ps !== this.ovPsel) { this.ovPsel = ps; this.ovPicked(u); }\n    { const fk = (['pig', 'pigperf', 'piglog', 'pen'].indexOf(O.panel) >= 0 && O.pig) ? O.pig.roomId + ':' + O.pig.code : (O.focus && O.panel ? 'f:' + O.focus.roomId + ':' + (O.focus.codes || []).join(',') : ''); if (fk !== (this.ovFk || '')) { const had = this.ovFk; this.ovFk = fk; if (fk || had) this.reframe(650); } }\n");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
