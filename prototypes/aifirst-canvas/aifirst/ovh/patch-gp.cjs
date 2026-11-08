// Group pens: a pen opens on the map, its pigs line up by status (need a look, fine, no ID), each pig is clicked on its own; no list.
const fs = require('fs'), path = require('path');
const F = process.argv[2], S = __dirname;
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
const all = (a, b) => { const n = s.split(a).length - 1; if (n < 1) { console.log('MISSING: ' + a.slice(0, 100)); process.exit(1); } s = s.split(a).join(b); };

once('  ovKindPath(kind) {', fs.readFileSync(path.join(S, 'gp.part.js'), 'utf8').replace(/\r/g, '') + '  ovKindPath(kind) {');

// the pig field remembers each instance's pig and can put one pig somewhere else
once("              im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true;\n",
  "              im.userData.items = arr; im.userData.place = (i, o) => { const k = o.s == null ? 1 : o.s; q.setFromAxisAngle(Y, o.yaw || 0); p.set(o.x, o.y || 0, o.z); s.set(k * PIG_SCALE * (o.sx == null ? 1 : o.sx), k * PIG_SCALE * (o.sy == null ? 1 : o.sy), k * PIG_SCALE * (o.sz == null ? 1 : o.sz)); m.compose(p, q, s); im.setMatrixAt(i, m); im.instanceMatrix.needsUpdate = true; };\n              im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true;\n");
once("            im.frustumCulled = false; im.renderOrder = 1; base.add(im);",
  "            im.userData.items = shadowItems.map((it) => it.o); im.userData.place = (i, o) => { const it = shadowItems[i], k = o.s == null ? 1 : o.s; q.setFromAxisAngle(Y, o.yaw || 0); p.set(o.x, (o.y || 0) + 0.012, o.z); s.set(it.fp[0] * k * PIG_SCALE * (o.sx == null ? 1 : o.sx), 1, it.fp[1] * k * PIG_SCALE * (o.sz == null ? 1 : o.sz)); const fw = 0.05 * SPECS[it.key].len * PIG_SCALE; p.x += Math.cos(o.yaw || 0) * fw * k; p.z -= Math.sin(o.yaw || 0) * fw * k; m.compose(p, q, s); im.setMatrixAt(i, m); im.instanceMatrix.needsUpdate = true; };\n            im.frustumCulled = false; im.renderOrder = 1; base.add(im);");

// each group pen remembers its shape and which way its feeder faces
once("} else if (c && c.kind === 'weaners') P.groupPenFill(field, rails, rng, { x: p.x, z: p.z, y: y0, sx: ln.x1 - ln.x0 - 0.05, sz: p.sz - 0.05, head: head, n: c.n, cls: 'weaner' });",
  "} else if (c && c.kind === 'weaners') { bucket().pen = { x: p.x, z: p.z, y: y0, sx: ln.x1 - ln.x0 - 0.05, sz: p.sz - 0.05, head: head, len: 0.65 * 0.7, feeder: true }; P.groupPenFill(field, rails, rng, { x: p.x, z: p.z, y: y0, sx: ln.x1 - ln.x0 - 0.05, sz: p.sz - 0.05, head: head, n: c.n, cls: 'weaner' }); }");
once("            else if (c.kind === 'gilts') P.openPenFill(field, rng, Object.assign(o, { n: c.n }));",
  "            else if (c.kind === 'gilts') { bucket().pen = { x: p.x, z: p.z, y: y0, sx: ln.x1 - ln.x0, sz: p.sz, head: 1, len: 1.8 * 0.7, feeder: false }; P.openPenFill(field, rng, Object.assign(o, { n: c.n })); }");

// a group pen picked opens on the map
all("    if (this.tkPicked && this.tkPicked(u)) return;\n", "    if (this.tkPicked && this.tkPicked(u)) return;\n    if (this.gpPicked && this.gpPicked(u)) return;\n");
// clicks while a pen is open: a pig, the pen's floor, or somewhere else
once("      if (this.IP) {\n        // a saved farm in View: a pen opens its profile", "      if (this.gpClick && this.gpClick(e, hit)) return;\n      if (this.IP) {\n        // a saved farm in View: a pen opens its profile");
// actions and panels
once("    if (this.tkAct && this.tkAct(k, v)) return;\n", "    if (this.tkAct && this.tkAct(k, v)) return;\n    if (this.gpAct && this.gpAct(k, v)) return;\n");
once("    if (p === 'tk') return this.tkCardHtml(u);\n", "    if (p === 'tk') return this.tkCardHtml(u);\n    if (p === 'gp') return this.gpCardHtml();\n    if (p === 'gppig') return this.gpPigHtml();\n");
// Back and Esc step out of the pig, then out of the pen
once("  goUp(hard) {\n    const u = this.ui();\n", "  goUp(hard) {\n    if (this.gpS && this.gpS()) { this.gpAct('esc'); return; }\n    if (performance.now() - (this.gpEscT || 0) < 80) return;\n    const u = this.ui();\n");
// leaving the room lets the pigs go
once("  goRoom(id) {\n    this.tipHide();\n", "  goRoom(id) {\n    this.tipHide();\n    if (this.gpS && this.gpS()) this.gpClose(true);\n");
once("  goScope(zoneId, secId, o) {\n    this.tipHide();\n", "  goScope(zoneId, secId, o) {\n    this.tipHide();\n    if (this.gpS && this.gpS()) this.gpClose(true);\n");
// the camera frames the open pen
once("      if (rm && this.ovOn && this.ovOn(u)) { const O = this.ovS(); if (O.pig && O.pig.roomId === rm.id", "      if (rm && this.gpFrame) { const fr = this.gpFrame(rm, u); if (fr) return fr; }\n      if (rm && this.ovOn && this.ovOn(u)) { const O = this.ovS(); if (O.pig && O.pig.roomId === rm.id");
// the open pen loses its colour, its "!" and its code: its pigs carry their own
once("      { const tc = this.tkCol ? this.tkCol(rm.id, p.code) : undefined; if (tc) c.set(tc); }", "      { const tc = this.tkCol ? this.tkCol(rm.id, p.code) : undefined; if (tc) c.set(tc); }\n      { const gc = this.gpCol ? this.gpCol(rm.id, p.code) : undefined; if (gc) c.set(gc); }");
once("      else if (k === 'flag') want = roomView && !!this.IP && L.roomId === u.roomId && this.pk > 0.3;", "      else if (k === 'flag') want = roomView && !!this.IP && L.roomId === u.roomId && this.pk > 0.3 && !(this.gpIs && L.pen && this.gpIs(L.roomId, L.pen.code));");
once("      if (k === 'pen' && this.tkLabel) { const tw = this.tkLabel(L, roomView, u); if (tw != null) want = tw; }\n", "      if (k === 'pen' && this.tkLabel) { const tw = this.tkLabel(L, roomView, u); if (tw != null) want = tw; }\n      if (k === 'pen' && this.gpIs && L.pen && this.gpIs(L.roomId, L.pen.code)) want = false;\n");
// pig tags follow the camera every frame
once("    // pen codes lie on the tiles in View, and float above the rails when the pigs are up\n", "    if (this.gpTags) this.gpTags();\n    // pen codes lie on the tiles in View, and float above the rails when the pigs are up\n");
// hover: one line about the pig under the pointer, an outline round it; nothing for the open pen's floor
once("    const tkKey = key + '|' + (this.ovS().tk || '') + (this.ovS().tkOpen ? '1' : '0');\n",
  "    const tkKey = key + '|' + (this.ovS().tk || '') + (this.ovS().tkOpen ? '1' : '0');\n    const gph = this.gpHitAt ? this.gpHitAt(e) : null; if (this.gpHov) this.gpHov(gph);\n    if (!gph && this.gpIs && this.gpIs(hit.rm.id, code)) { this.tipHide(); return; }\n    if (gph && this.tipFor !== 'gp:' + gph.k) { el.innerHTML = this.gpTipHtml(gph); this.tipFor = 'gp:' + gph.k; }\n");
once("    if (this.tipFor !== tkKey && this.tkTip) {", "    if (!gph && this.tipFor !== tkKey && this.tkTip) {");
once("    if (this.tipFor !== key && this.tipFor !== tkKey && this.ovOn() && this.ovPenTip) {", "    if (!gph && this.tipFor !== key && this.tipFor !== tkKey && this.ovOn() && this.ovPenTip) {");
once("    if (this.tipFor !== key && this.tipFor !== tkKey) {\n      const i = this.pigInfo(hit.rm, hit.pen)", "    if (!gph && this.tipFor !== key && this.tipFor !== tkKey) {\n      const i = this.pigInfo(hit.rm, hit.pen)");
once("  tipHide() { if (this.tipEl) this.tipEl.style.display = 'none'; this.tipFor = ''; }", "  tipHide() { if (this.tipEl) this.tipEl.style.display = 'none'; this.tipFor = ''; if (this.gpHov) this.gpHov(null); }");
once("    const hc = this.hoverPen && this.hoverPen.roomId === rm.id ? this.hoverPen.code : (u.lh || ''), sel = u.psel || [];", "    let hc = this.hoverPen && this.hoverPen.roomId === rm.id ? this.hoverPen.code : (u.lh || ''), sel = u.psel || [];\n    if (this.gpIs && this.gpIs(rm.id, hc)) hc = '';");
// a group pen's hover is about its pigs, not a sow's cycle
once("    const P = this.ovPigData(hit.rm.id, code), cell = ((this.IP && this.IP.cell[hit.rm.id]) || {})[code] || {}, group = (cell.n || 1) > 1;\n", "    const P = this.ovPigData(hit.rm.id, code), cell = ((this.IP && this.IP.cell[hit.rm.id]) || {})[code] || {}, group = (cell.n || 1) > 1;\n    if (group && O.panel !== 'compare' && this.gpGroupCell && this.gpGroupCell(hit.rm.id, code)) return this.gpPenTip(hit.rm.id, code, cell);\n");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
