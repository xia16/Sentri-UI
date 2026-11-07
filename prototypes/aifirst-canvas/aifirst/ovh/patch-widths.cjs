// Pane widths: S 320 (default), L 440 (Schedule only); the pane is as tall as what it holds.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
once("  ovKindPath(kind) {", "  ovPaneW(p) { return p === 'sched' ? 440 : 320; }\n  ovKindPath(kind) {");
once("position: 'absolute', right: '12px', top: '84px', bottom: '12px', width: '380px'", "position: 'absolute', right: '12px', top: '84px', maxHeight: 'calc(100% - 96px)', width: this.ovPaneW(O.panel) + 'px'");
once("ins.r = O.panel ? 404 + (O.her && O.panel === 'compare' ? 376 : 0) : 28;", "ins.r = O.panel ? this.ovPaneW(O.panel) + 24 + (O.her && O.panel === 'compare' ? 376 : 0) : 28;");
once("O.picking ? this.ovCard({ left: '12px', right: O.panel ? '404px' : '12px', bottom: '12px' }", "O.picking ? this.ovCard({ left: '12px', right: O.panel ? (this.ovPaneW(O.panel) + 24) + 'px' : '12px', bottom: '12px' }");
once("right: this.ovS().panel ? '404px' : '12px', bottom: '12px' }, head + vl + mid", "right: this.ovS().panel ? (this.ovPaneW(this.ovS().panel) + 24) + 'px' : '12px', bottom: '12px' }, head + vl + mid");
// Edit: the step pane is S, as tall as its content
once("'right: 12px; top: 84px; bottom: 12px; width: 380px;'", "'right: 12px; top: 84px; max-height: calc(100% - 96px); width: 320px;'");
once("ins.r = nw || !po ? 28 : 404; return ins; }", "ins.r = nw || !po ? 28 : 344; return ins; }");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
