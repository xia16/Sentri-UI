// Open tasks in the Farm view, built: tabs on the card, the task card, the pig task view, pen colours, one-line hover.
const fs = require('fs'), path = require('path');
const F = process.argv[2], S = __dirname;
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
const all = (a, b) => { const n = s.split(a).length - 1; if (n < 1) { console.log('MISSING: ' + a.slice(0, 100)); process.exit(1); } s = s.split(a).join(b); };

once('  ovKindPath(kind) {', fs.readFileSync(path.join(S, 'tk.part.js'), 'utf8') + '  ovKindPath(kind) {');
// start state and an event any page or the chat can send
once('"options":["pigsow",', '"options":["tasks","task:rx09","pigsow",');
once("  ovStart(st) {\n", "  ovStart(st) {\n    this.tkHook();\n    if (st === 'tasks') { setTimeout(() => this.tkStart(), 300); return; }\n    { const m = /^task:([^@]+)/.exec(String(st || '')); if (m) { setTimeout(() => { this.tkRestore(); this.tkOpen(m[1]); }, 300); return; } }\n    if (!this.tkRestored) { this.tkRestored = true; setTimeout(() => this.tkRestore(), 320); }\n");
once("  componentWillUnmount() {\n    this.alive = false;\n", "  componentWillUnmount() {\n    this.alive = false;\n    if (this.tkUnhook) this.tkUnhook();\n");
// actions
once("    if (k === 'ed') { const f = this.edF && this.edF[v]; if (f) f(); return; }\n", "    if (k === 'ed') { const f = this.edF && this.edF[v]; if (f) f(); return; }\n    if (this.tkAct && this.tkAct(k, v)) return;\n");
// a pen picked while a task is open
all("  ovPicked(u) {\n    const O = this.ovS(), ps = u.psel || [];\n", "  ovPicked(u) {\n    const O = this.ovS(), ps = u.psel || [];\n    if (this.tkPicked && this.tkPicked(u)) return;\n");
// panels
once("  ovPanel3(p, O, u) {\n", "  ovPanel3(p, O, u) {\n    if (p === 'tk') return this.tkCardHtml(u);\n    if (p === 'tkpig') return this.tkPigHtml();\n");
// the tabs above the pane; the pane starts under them
all("    const html = this.ovTopBar(u, O) +\n", "    const html = this.ovTopBar(u, O) + this.tkTabsHtml(O) +\n");
once("position: 'absolute', right: '12px', top: '84px', maxHeight: 'calc(100% - 96px)', width: this.ovPaneW(O.panel) + 'px'", "position: 'absolute', right: '12px', top: this.tkTop() + 'px', maxHeight: 'calc(100% - ' + (this.tkTop() + 12) + 'px)', width: this.ovPaneW(O.panel) + 'px'");
// pen colours while a task is open, at every level
once("      if (this.IP && u.vm === 'view' && u.vf && !this.locationMatches((this.IP.cell[rm.id] || {})[p.code], u.vf)) c.set('#F4F3EE');", "      if (this.IP && u.vm === 'view' && u.vf && !this.locationMatches((this.IP.cell[rm.id] || {})[p.code], u.vf)) c.set('#F4F3EE');\n      { const tc = this.tkCol ? this.tkCol(rm.id, p.code) : undefined; if (tc) c.set(tc); }");
// hover
once("    if (this.tipFor !== key && this.ovOn() && this.ovPenTip) { el.innerHTML = this.ovPenTip(hit); this.tipFor = key; }", "    const tkKey = key + '|' + (this.ovS().tk || '') + (this.ovS().tkOpen ? '1' : '0');\n    if (this.tipFor !== tkKey && this.tkTip) { const th = this.tkTip(hit); if (th) { el.innerHTML = th; this.tipFor = tkKey; } }\n    if (this.tipFor !== key && this.tipFor !== tkKey && this.ovOn() && this.ovPenTip) { el.innerHTML = this.ovPenTip(hit); this.tipFor = key; }");
once("    if (this.tipFor !== key) {\n      const i = this.pigInfo(hit.rm, hit.pen)", "    if (this.tipFor !== key && this.tipFor !== tkKey) {\n      const i = this.pigInfo(hit.rm, hit.pen)");
// pen tags: only the task's pens, coloured by status
once("      L.want = want;\n", "      if (k === 'pen' && this.tkLabel) { const tw = this.tkLabel(L, roomView, u); if (tw != null) want = tw; }\n      L.want = want;\n");
once("        if (L.kind === 'room') { const rr = this.roomById(L.roomId);", "        if (L.kind === 'pen' && this.tkTagStyle) this.tkTagStyle(L);\n        if (L.kind === 'room') { const rr = this.roomById(L.roomId);");
once("    if (this.IP) { const pr = []; cands.filter", "    if (this.tkNudge) this.tkNudge(cands, rectOf);\n    if (this.IP) { const pr = []; cands.filter");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
