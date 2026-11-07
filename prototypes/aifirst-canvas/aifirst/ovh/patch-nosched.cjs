// The Schedule lives in its own tab, never in the Farm view: no Schedule in the bar, no Schedule width.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
once("const tabs = this.ovBtn(H.icon(H.I.cal, 18) + L('Schedule'), 'sched', isBatch) +", "const tabs = '' +");
once("  ovPaneW(p) { return p === 'sched' ? 440 : 320; }", "  ovPaneW(p) { return 320; }");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
