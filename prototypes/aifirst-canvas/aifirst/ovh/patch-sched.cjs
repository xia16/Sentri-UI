// Farm view: Batches becomes Schedule (scoped to where you are); a pen never shows a Pigs pill.
const fs = require('fs'), path = require('path');
const F = process.argv[2], S = __dirname;
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); };

once('  edMapTask(u) {', fs.readFileSync(path.join(S, 'sched.part.js'), 'utf8') + '  edMapTask(u) {');
// the bar: Schedule at every level, a pen included; Pigs only above a pen
once("    const isBatch = ['list', 'batch', 'task', 'dates', 'done', 'compare'].indexOf(pnl) >= 0, isPigs",
  "    const isBatch = ['sched', 'rx', 'list', 'batch', 'task', 'dates', 'done', 'compare'].indexOf(pnl) >= 0, isPigs");
once("    const tabs = (P.pen ? '' : this.ovBtn(H.icon(H.I.layers, 18) + 'Batches', 'batches', isBatch)) +\n      (total ? this.ovBtn(",
  "    const tabs = this.ovBtn(H.icon(H.I.cal, 18) + 'Schedule', 'sched', isBatch) +\n      (total && !P.pen ? this.ovBtn(");
// actions
once("    if (k === 'ed') { const f = this.edF && this.edF[v]; if (f) f(); return; }\n",
  "    if (k === 'ed') { const f = this.edF && this.edF[v]; if (f) f(); return; }\n" +
  "    if (k === 'sched') { if (['sched', 'rx', 'list', 'batch', 'task', 'dates', 'done', 'compare'].indexOf(O.panel) >= 0) { this.ovAct('close'); return; } if (u.bv) this.closeBatch(); this.ovSet({ panel: 'sched', hist: [], pop: '', swk: 0 }); return; }\n" +
  "    if (k === 'swk') { this.ovSet({ swk: v === '0' ? 0 : (O.swk || 0) + (+v) }); return; }\n" +
  "    if (k === 'srow') { const t = (this.ovSchedT || [])[+v]; if (!t) return; if (t.rx) { this.ovPush(); this.ovSet({ panel: 'rx', pop: '' }); return; } if (t.task && this.batchData()[t.b] && this.bvTask(t.b, t.task)) { this.ovAct('task:' + t.b + '/' + t.task); return; } if (t.b && this.batchData()[t.b]) this.ovAct('open:' + t.b); return; }\n");
once("      if (prev.panel === 'list' && this.ui().bv) { this.put({ bvOnly: '' }); this.closeBatch(); }", "      if ((prev.panel === 'list' || prev.panel === 'sched') && this.ui().bv) { this.put({ bvOnly: '' }); this.closeBatch(); }");
// the panels
once("  ovPanel3(p, O, u) {\n", "  ovPanel3(p, O, u) {\n    if (p === 'sched') return this.ovSchedHtml(u);\n    if (p === 'rx') return this.ovRxHtml();\n");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
