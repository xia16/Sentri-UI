// Stall colours follow the phone's PenMap ladder: needs a look = amber (urgent and watch alike; severity lives in the marker),
// has a sow = handle, empty = well. No pink for "occupied", no red tile.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('EXPECTED ONE, GOT ' + n + ': ' + a.slice(0, 100)); process.exit(1); } s = s.replace(a, () => b); };
once("(cc && cc.flag ? (cc.flag.lvl === 'urgent' ? '#E7A196' : '#EFCF8C') : (cc && cc.kind ? '#F3D9D2' : '#F2F1EC'))",
  "(cc && cc.flag ? this.penAmber() : (cc && cc.kind ? '#dce0d4' : '#eef1e7'))");
once("    if (cell.flag) return cell.flag.lvl === 'urgent' ? '#E7A196' : '#EFCF8C';", "    if (cell.flag) return this.penAmber();");
// the pale fill by day; the stronger mark once night light would wash the fill out
once("  bvColor(roomId, code, cell) {", "  penAmber() { return (this.nt || 0) > 0.5 ? '#e8b33c' : '#fede82'; }\n  bvColor(roomId, code, cell) {");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
