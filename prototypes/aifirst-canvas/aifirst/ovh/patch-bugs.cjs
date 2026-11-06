// Back clears what a Schedule row lit on the map; panels scroll without a visible scrollbar.
const fs = require('fs');
const F = process.argv[2];
let s = fs.readFileSync(F, 'utf8').replace(/\r/g, '');
const all = (a, b) => { const n = s.split(a).length - 1; if (n < 1) { console.log('MISSING: ' + a.slice(0, 90)); process.exit(1); } s = s.split(a).join(b); };
all("    if (k === 'back') {\n", "    if (k === 'back') {\n      if (O.focus) { O.focus = null; this.setSel([]); }\n");
all("overflowY: 'auto', overflowX: 'hidden', pointerEvents: 'auto', fontFamily", "overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', pointerEvents: 'auto', fontFamily");
all("overflow-y: auto; overflow-x: hidden; padding: 0 16px", "overflow-y: auto; overflow-x: hidden; scrollbar-width: none; padding: 0 16px");
fs.writeFileSync(F, s);
console.log('patched', Math.round(s.length / 1024) + ' KB');
