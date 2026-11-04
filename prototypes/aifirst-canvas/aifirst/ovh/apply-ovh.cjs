// Applies the overhaul layer to ActLayout3JS.dc.html (idempotent: it rebuilds the OVH block between markers).
const fs = require('fs'), path = require('path');
const S = path.dirname(__filename);
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8').replace(/\r/g, '');
const lib = fs.readFileSync(path.join(S, 'ovh-lib.js'), 'utf8') + '\n' + fs.readFileSync(path.join(S, 'ovh-pages.js'), 'utf8') + (fs.existsSync(path.join(S, 'ovh-pages2.js')) ? '\n' + fs.readFileSync(path.join(S, 'ovh-pages2.js'), 'utf8') : '');
let comp = fs.readFileSync(path.join(S, 'ovh-comp.js'), 'utf8');
if (fs.existsSync(path.join(S, 'ovh-comp2.js'))) comp = comp.replace('  renderVals() {\n    const r = this.renderValsBase();', fs.readFileSync(path.join(S, 'ovh-comp2.js'), 'utf8') + '\n  renderVals() {\n    const r = this.renderValsBase();');
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
