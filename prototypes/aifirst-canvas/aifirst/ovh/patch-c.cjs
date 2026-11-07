// Proposal C, built: one bar across the top (place by kind and name, actions, Select or undo · redo · Done), one main pane under it, 3D/Plan and zoom bottom left.
const fs = require('fs'), path = require('path');
const F = process.argv[2], S = __dirname;
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
const all = (a, b) => { const n = s.split(a).length - 1; if (n < 1) { console.log('MISSING: ' + a.slice(0, 100)); process.exit(1); } s = s.split(a).join(b); return n; };

once('  edMapTask(u) {', fs.readFileSync(path.join(S, 'c.part.js'), 'utf8') + '  edMapTask(u) {');

// Farm view: the bar across the top, Select in it; bottom left the view control
once(": this.ovViewHtml(O, u) + this.ovCard({ right: '16px', bottom: '16px' }, this.ovBtn(H.icon(H.I.select, 18) + 'Select', 'select', false, { fontWeight: 600, padding: '0 12px' }));", ": this.ovViewCtl(O, u, false);");
all("    const html = this.ovLoc(u) +\n", "    const html = this.ovTopBar(u, O) +\n");
// the pane: under the bar, to the bottom edge, fixed width
once("position: 'absolute', right: '16px', top: '16px', maxHeight: 'calc(100% - 104px)', width: '380px'", "position: 'absolute', right: '12px', top: '84px', bottom: '12px', width: '380px'");
all("if (a.right + 12 > b.left) {", "if (false) {");
// bars at the bottom end where the pane begins
once("O.picking ? this.ovCard({ left: '16px', right: '16px', bottom: '16px' }", "O.picking ? this.ovCard({ left: '12px', right: O.panel ? '404px' : '12px', bottom: '12px' }");
once("    return this.ovCard({ left: '16px', right: '16px', bottom: '16px' }, head + vl + mid", "    return this.ovCard({ left: '12px', right: this.ovS().panel ? '404px' : '12px', bottom: '12px' }, head + vl + mid");
once("ins.l = 28; ins.t = 84; ins.b = 92; ins.r = O.panel ? 412 + (O.her && O.panel === 'compare' ? 376 : 0) : 28;", "ins.l = 28; ins.t = 96; ins.b = 84; ins.r = O.panel ? 404 + (O.her && O.panel === 'compare' ? 376 : 0) : 28;");

// Edit: the same bar and pane; the guide is the bar while placing
const i0 = s.indexOf("this.ovEdLoc(u) + this.ovViewHtml(O, u, true) + this.edHtml(u) + this.ovCard({ right: '16px', bottom: '16px' }, this.edUndoHtml()");
const endTok = "{ display: 'flex', alignItems: 'center', gap: '2px' });";
const i1 = s.indexOf(endTok, i0);
if (i0 < 0 || i1 < 0) { console.log('MISS edit paint'); process.exit(1); }
s = s.slice(0, i0) + "(() => { const pane = this.edHtml(u); return this.edTopBar(u) + this.ovViewCtl(O, u, true) + pane; })();" + s.slice(i1 + endTok.length);
once("ins.l = 28; ins.t = 88; const nw = (this.W || 950) < 760; ins.b = nw ? Math.round((this.H || 830) * 0.5) + 40 : 92; ins.r = nw ? 28 : 412; return ins; }",
  "ins.l = 28; ins.t = 96; const nw = (this.W || 950) < 760, po = this.edPaneOpen && this.edPaneOpen(u); ins.b = nw && po ? Math.round((this.H || 830) * 0.55) + 20 : 84; ins.r = nw || !po ? 28 : 404; return ins; }");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
