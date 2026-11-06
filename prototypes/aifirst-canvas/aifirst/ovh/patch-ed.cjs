// Edit layout rebuilt: one right panel (pages), the map only for placing, fixed camera margins, place-first zones and sections, the device flow.
const fs = require('fs'), path = require('path');
const F = process.argv[2], S = __dirname;
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

// 1. the module, before renderVals
once('  renderVals() {\n    const r = this.renderValsBase();', fs.readFileSync(path.join(S, 'edcol.part.js'), 'utf8') + '\n  renderVals() {\n    const r = this.renderValsBase();');

// 2. in edit, the old card, bar and undo strip are not drawn; the panel takes their place
once("    if (this.ovOn()) { r.showProf = false; r.showBatch = false; r.showCard = false; r.showBar = false; r.showCrumbMenu = false; }\n    return r;",
  "    if (this.ovOn()) { r.showProf = false; r.showBatch = false; r.showCard = false; r.showBar = false; r.showCrumbMenu = false; }\n    if (this.ovEdOn && this.ovEdOn(this.ui()) && !this.ovOn()) { const hide = (x) => (x || '') + '; display: none;'; r.cardStyle = hide(r.cardStyle); r.barStyle = hide(r.barStyle); r.sbarStyle = hide(r.sbarStyle); r.vidStyle = r.vidStyle; this.ovEdTask = true; }\n    return r;");

// 3. the paint: place pill, 3D, undo, the panel or the guide, Done
const i0 = s.indexOf("    if (!this.ovOn(u) && this.ovEdOn(u)) { const O = this.ovS(), H = OVH, html = (this.ovEdTask ? '<style>");
const i1 = s.indexOf('\n', i0);
if (i0 < 0) { console.log('MISS paint'); process.exit(1); }
s = s.slice(0, i0) + "    if (!this.ovOn(u) && this.ovEdOn(u)) { const O = this.ovS(), H = OVH; if (!(u.tool === 'zone' || u.tool === 'sec' || u.tool === 'room' || (u.nn && u.nn.gat)) && this.ghostOn) this.hideGhost(); if (u.nn && u.nn.gat) this.syncGhost(); const html = this.ovEdLoc(u) + this.ovViewHtml(O, u, true) + this.edHtml(u) + this.edUndoHtml() + (this.ovVals && this.ovVals.showMode === false ? '' : this.ovCard({ right: '16px', bottom: '16px' }, this.ovBtn(H.icon(H.I.check, 18) + H.esc((this.ovVals && this.ovVals.modeLabel) || 'Done'), 'vw:modeToggle', false, { background: H.K.ink, color: '#FFFFFF', fontWeight: 600, padding: '0 16px' }))); this.edSwap(html); this.ovEdFit(); return; }" + s.slice(i1);
once('  edMapTask(u) {', "  // swap the layer, keeping the field you type in, the panel's scroll, and focusing a new page's first field\n  edSwap(html) {\n    if (html === this.ovLast) return;\n    const b = this.ovBody, ae = document.activeElement, fid = ae && b.contains(ae) && ae.id ? ae.id : '', sel = fid && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;\n    const col = b.querySelector('[data-zone=\"edbody\"]'), top = col ? col.scrollTop : 0, m = /data-zone=\"edcol\"[\\s\\S]*?font-size: 19px[^>]*>([^<]*)/.exec(html), key = m ? m[1] : '';\n    b.innerHTML = html; this.ovLast = html;\n    const c2 = b.querySelector('[data-zone=\"edbody\"]'); if (c2 && key === this.edKey) c2.scrollTop = top;\n    if (fid) { const n = b.querySelector('#' + fid); if (n) { n.focus(); if (sel && n.setSelectionRange) { try { n.setSelectionRange(sel[0], sel[1]); } catch (e) { /* number fields */ } } } }\n    else if (key && key !== this.edKey) { const af = b.querySelector('[data-af]'); if (af) setTimeout(() => { try { af.focus(); } catch (e) { /* gone */ } }, 40); }\n    this.edKey = key;\n  }\n  edMapTask(u) {");

// 4. clicks and typing in the panel
once("    if (k === 'noop') return;\n", "    if (k === 'noop') return;\n    if (k === 'ed') { const f = this.edF && this.edF[v]; if (f) f(); return; }\n");
once("    el.addEventListener('mouseover', (e) => {", "    const edIn = (e) => { const h = e.target && e.target.closest && e.target.closest('[data-in]'); return h && this.edI ? this.edI[h.getAttribute('data-in')] : null; };\n    el.addEventListener('input', (e) => { if (e.target.tagName === 'SELECT') return; const r = edIn(e); if (r && r.input) r.input(e); });\n    el.addEventListener('change', (e) => { if (e.target.tagName !== 'SELECT') return; const r = edIn(e); if (r && r.input) r.input(e); });\n    el.addEventListener('keydown', (e) => { const r = edIn(e); if (r && r.key) r.key(e); });\n    el.addEventListener('mouseover', (e) => {");

// 5. the camera keeps the same margins whatever the panel shows: a page never moves it
once("if (this.ovEdOn && this.ovEdOn(u)) { /* ovEdIns */ ins.l = 28; ins.t = (u.bh || 70) + 32; ins.b = 92; ins.r = 16 + 360 + 16; return ins; }",
  "if (this.ovEdOn && this.ovEdOn(u)) { /* ovEdIns */ ins.l = 28; ins.t = 88; const nw = (this.W || 950) < 760; ins.b = nw ? Math.round((this.H || 830) * 0.5) + 40 : 92; ins.r = nw ? 28 : 412; return ins; }");

// 6. a device: the pointer becomes the device; a lane device takes the whole lane; set-up saves with or without a code
once("      if (u.view === 'room' && u.devT && u.devT.kind) { c.style.cursor = 'crosshair'; return; }", "      if (u.view === 'room' && u.devT && u.devT.kind) { c.style.cursor = this.edCursor(u.devT.kind); return; }");
once("    if (!spot) { if (this.devServes(u.devT.kind) === 'pens') this.showToast('Click a pen it serves', true, true); return; }\n    const kd = this.devKinds()",
  "    if (!spot) { if (this.devServes(u.devT.kind) === 'pens') this.showToast('Click the lane it runs along', true, true); return; }\n    if (spot.pens) { const dd0 = this.Dv().room[rm.id], L0 = String(spot.pens[0]).replace(/\\d+$/, ''), all = dd0 ? dd0.pens.filter((p) => p.shape == null && String(p.code).replace(/\\d+$/, '') === L0).map((p) => p.code) : []; if (all.length) spot.pens = all; }\n    const kd = this.devKinds()");
once("      task('Set up the ' + nm, 'Its device code is on its label. The code binds this place to the real ' + nm + '.', () => this.put({ dvE: null }), e.isNew ? 'Bind later' : 'Cancel');",
  "      task('Set up the ' + nm, '', () => this.put({ dvE: null }), 'Cancel');");
once("      footer(e.isNew ? 'Bind' : 'Save', () => this.saveDevEdit(), e.isNew && !String(e.code || '').trim());", "      footer('Save', () => this.saveDevEdit(), false);");

// 7. zones and sections: placed first, named after
once("  startNew(kind) {\n    const u = this.ui();\n    this.hideGhost();\n    this.put({ nn: { kind: kind, zone: u.zoneId, name: '', code: '', codeT: false }, tool: '',",
  "  edGhostSize(k) { return k === 'zone' ? [48, 32] : [24, 16]; }\n  startNew(kind) {\n    const u = this.ui();\n    this.hideGhost(); this.ghostAt = null;\n    this.put({ nn: null, tool: kind === 'zone' ? 'zone' : 'sec',");
once("    if (!this.ghost) return;\n    if (u.tool !== 'room' || !this.ghostAt || u.view !== 'farm') { this.ghost.visible = false; this.ghostOn = false; return; }",
  "    if (!this.ghost) return;\n    const zs = (u.tool === 'zone' || u.tool === 'sec') ? u.tool : (u.nn && u.nn.gat ? (u.nn.kind === 'zone' ? 'zone' : 'sec') : '');\n    if (zs && u.view === 'farm') { const at = (u.tool === 'zone' || u.tool === 'sec') ? this.ghostAt : u.nn.gat; if (!at) { this.ghost.visible = false; this.ghostOn = false; return; } const sz = this.edGhostSize(zs), o = this.off; this.ghost.visible = true; this.ghostOn = true; this.ghost.position.set(at.x + sz[0] / 2 + o.x, 0.02, at.z + sz[1] / 2 + o.z); this.ghost.scale.set(sz[0], 0.35, sz[1]); this.label('ghost', 'ghost', (u.nn && u.nn.name) || (zs === 'zone' ? 'New zone' : 'New section'), at.x + sz[0] / 2 + o.x, 1.2, at.z + sz[1] / 2 + o.z, {}); this.dirty = true; return; }\n    if (u.tool !== 'room' || !this.ghostAt || u.view !== 'farm') { this.ghost.visible = false; this.ghostOn = false; return; }");
once("    const placeGhost = (e) => {\n      const g = ground(e);\n      if (!g) return;\n", "    const placeGhost = (e) => {\n      const g = ground(e);\n      if (!g) return;\n      const t0 = this.ui().tool;\n      if (t0 === 'zone' || t0 === 'sec') { const sz = this.edGhostSize(t0); this.ghostAt = { x: Math.round(g.x - sz[0] / 2), z: Math.round(g.z - sz[1] / 2) }; this.syncGhost(); return; }\n");
once("        else if (farm && u.tool === 'room') d0.kind = 'place';", "        else if (farm && (u.tool === 'room' || u.tool === 'zone' || u.tool === 'sec')) d0.kind = 'place';");
once("      if (u.view === 'farm' && u.tool === 'room') { placeGhost(e); c.style.cursor = 'crosshair'; return; }", "      if (u.view === 'farm' && (u.tool === 'room' || u.tool === 'zone' || u.tool === 'sec')) { placeGhost(e); c.style.cursor = 'crosshair'; return; }");
once("  dropNew() {\n    this.say('Add a room');\n    const u = this.ui();",
  "  dropNew() {\n    const u0 = this.ui();\n    if ((u0.tool === 'zone' || u0.tool === 'sec') && this.ghostAt) { const k = u0.tool, sz = this.edGhostSize(k), at = { x: this.ghostAt.x, z: this.ghostAt.z }; this.put({ tool: '', nn: { kind: k === 'zone' ? 'zone' : 'sec', zone: u0.zoneId, name: '', code: '', codeT: false, gat: at, at: { x: this.mm(at.x + sz[0] / 2), z: this.mm(at.z + sz[1] / 2) } } }); this.pf = 'nn'; this.syncGhost(); return; }\n    this.say('Add a room');\n    const u = this.ui();");
once("      this.op({ op: 'add_zone', name: name, at: this.freeSpot(4800, 3200, '') });", "      this.hideGhost();\n      this.op({ op: 'add_zone', name: name, at: nn.at || this.freeSpot(4800, 3200, '') });");
once("    this.op({ op: 'add_section', name: name, code: code || undefined, zone: zid || undefined, at: zr ?", "    this.hideGhost();\n    this.op({ op: 'add_section', name: name, code: code || undefined, zone: zid || undefined, at: nn.at ? nn.at : zr ?");

// 8. a room: placed, then named straight away in the panel
once("    this.put({ fresh: { id: r.id, focus: true }, rev: (u.rev || 0) + 1 });\n  }", "    this.put({ fresh: { id: r.id, focus: true }, rev: (u.rev || 0) + 1 });\n    setTimeout(() => { if (this.ui().roomId === r.id && this.ui().view === 'room') this.openEdit(true); }, 700);\n  }");
once("    if (isNew) { ed.isNew = true; ed.title = 'New ' + (ed.kind === 'zone' ? 'zone' : 'section'); }", "    if (isNew) { ed.isNew = true; ed.title = 'New ' + (ed.kind === 'zone' ? 'zone' : ed.kind === 'room' ? 'room' : 'section'); }");

fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
